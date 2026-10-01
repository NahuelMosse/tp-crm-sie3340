import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import {
  objeto, registros, crearRegistro, borrarRegistro, borrarObjeto, quitarCampo, nuevoObjeto, nuevoCampo,
  nuevoRegistro, abrirFicha, abrirListado, configuracion, modeloDe, elegirEnFicha, escribirEnFicha, fechaEnFicha, clicReal, esperarCarga, textoDe,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirObjeto, agregarPaso, abrirVariables, elegirVariable, botonDelFlujo,
  escribirCodigo, salidaEsperada, enPanel, ETIQUETA_OBJETO,
} from '../../twenty/flujos';
import { cargarCartera, PRODUCTOR } from '../../twenty/escenario';

/**
 * A.8 — Parametrización, sobre Twenty
 *
 * Todo se define desde Configuración y desde el editor de flujos de trabajo,
 * recorriendo la pantalla.
 */

test.describe.configure({ mode: 'serial' });

// ── A.8.1 ────────────────────────────────────────────────────────────────────
test('A.8.1 — Creación de entidades sin programar', async ({ page }, info) => {
  // «Crear una entidad nueva desde la administración y registrar si fue
  //  necesario escribir código»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const { apiTwenty } = await import('../../twenty/ui');
  const api = await apiTwenty(page);
  await borrarObjeto(api, 'inspeccion');

  const inicio = Date.now();
  await nuevoObjeto(page, 'Inspección', 'Inspecciones', 'Inspección del riesgo antes de emitir la póliza');
  await nuevoCampo(page, 'inspecciones', 'Date', 'Fecha de inspección');
  const capModelo = await capturar(page, 'A.8.1', plataforma, '1-entidad-y-campo');
  const id = await nuevoRegistro(page, 'inspecciones', 'Inspección', 'INS-DOMICILIO-PENA');
  await abrirFicha(page, 'inspeccion', id);
  const campo = (await objeto(api, 'inspeccion')).fields.find((c: any) => c.label === 'Fecha de inspección').name;
  const hoy = new Date();
  await fechaEnFicha(page, campo, `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const capRegistro = await capturar(page, 'A.8.1', plataforma, '2-registro-cargado');

  const guardado = (await registros(api, 'inspecciones')).find(r => r.id === id);
  expect(guardado?.name, 'la entidad nueva debe admitir registros').toBe('INS-DOMICILIO-PENA');
  expect(guardado?.[campo], 'el campo nuevo debe guardar su valor').toBeTruthy();

  registrar({
    criterio: 'A.8.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde Configuración › Modelo de datos se creó una entidad que el producto no trae —la inspección del ' +
      'riesgo antes de emitir— con su nombre en singular y plural y una descripción, y se le agregó un campo de ' +
      'fecha. Apareció en el menú con su listado y su ficha, y admitió registros enseguida. No hizo falta ' +
      'escribir código en ningún paso: es configuración.',
    evidencia: [capModelo, capRegistro],
    medicion: `Entidad creada, con un campo y un registro cargado, en ${segundos} segundos`,
  });
});

// ── A.8.2 ────────────────────────────────────────────────────────────────────
test('A.8.2 — Campos calculados sobre datos propios', async ({ page, browser }, info) => {
  // «Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const FLUJO = 'Cálculo de la prima anual';
  const POLIZA = 'POL-VENCE-CALCULO';
  for (const w of (await registros(e.api, 'workflows')).filter(w => w.name === FLUJO)) await borrarRegistro(e.api, 'workflows', w.id);
  for (const p of (await registros(e.api, 'polizas')).filter(p => p.name === POLIZA)) await borrarRegistro(e.api, 'polizas', p.id);
  await quitarCampo(e.api, 'poliza', 'Prima anual');

  // Ningún tipo de campo se calcula solo
  await modeloDe(page, 'polizas');
  await clicReal(page, page.getByRole('button', { name: /Nuevo Campo|New Field/ }).first());
  await esperarCarga(page, 3000);
  const tipos = await textoDe(page);
  const capTipos = await capturar(page, 'A.8.2', plataforma, '1-tipos-de-campo');
  expect(tipos, 'si hubiera un campo de fórmula, este veredicto no corresponde').not.toMatch(/Formula|Fórmula|Calculated|Calculado/i);

  // El campo de destino, y un flujo que lo calcula al guardar la póliza
  await nuevoCampo(page, 'polizas', 'Number', 'Prima anual');
  // Se calcula cuando se carga la prima: el disparador escucha solo ese campo, así
  // el propio paso que escribe la prima anual no lo vuelve a disparar
  await nuevoFlujo(page, FLUJO);
  await ponerDisparador(page, 'Record is updated', ETIQUETA_OBJETO);
  await elegirObjeto(page, 'Pólizas');
  await clicReal(page, page.getByText(/^Campos \(opcional\)$|^Fields \(optional\)$/).last()
    .locator('xpath=following::*[normalize-space(text())="Editar" or normalize-space(text())="Edit"][1]'));
  await clicReal(page, page.getByText('Prima', { exact: true }).filter({ visible: true }).last());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await agregarPaso(page, 'Code - Logic Function');
  await escribirCodigo(page,
    'export const main = async (params: { prima: number }): Promise<object> => ({ primaAnual: (params.prima / 1000000) * 12 });');
  // La prima se guarda en millonésimas: de ahí la división
  await abrirVariables(page, 'prima');
  await elegirVariable(page, 'Prima', 'Amount Micros');
  await salidaEsperada(page, '{"primaAnual": 0}');
  const capCodigo = await capturar(page, 'A.8.2', plataforma, '2-codigo-del-calculo');
  await agregarPaso(page, 'Update Record');
  await elegirObjeto(page, 'Pólizas');
  await abrirVariables(page, 'Registro');
  await elegirVariable(page, 'Póliza');
  const editar = page.getByText(/^Campos a actualizar$|^Fields to update$/).last().locator('xpath=following::*[normalize-space(text())="Editar" or normalize-space(text())="Edit"][1]');
  await clicReal(page, editar);
  await clicReal(page, page.getByText('Prima anual', { exact: true }).filter({ visible: true }).last());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await abrirVariables(page, 'Prima anual');
  await elegirVariable(page, 'Code - Logic Function', /^primaAnual/);
  await page.waitForTimeout(2500);
  const capFlujo = await capturar(page, 'A.8.2', plataforma, '3-flujo-del-calculo');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  let calculada: number | null = null, segundos = 0, capFicha = '';
  try {
    // Se carga una póliza con su prima mensual, desde la pantalla, y el sistema completa la anual
    const id = await nuevoRegistro(page, 'polizas', 'Póliza', POLIZA);
    await abrirFicha(page, 'poliza', id);
    const prima = (await objeto(e.api, 'poliza')).fields.find((c: any) => c.label === 'Prima').name;
    const inicio = Date.now();
    await escribirEnFicha(page, prima, '15250.50');
    for (let espera = 0; espera < 120 && !calculada; espera++) {
      await page.waitForTimeout(5000);
      calculada = (await registros(e.api, 'polizas')).find(p => p.id === id)?.primaAnual ?? null;
    }
    segundos = Math.round((Date.now() - inicio) / 1000);
    await abrirFicha(page, 'poliza', id);
    capFicha = await capturar(page, 'A.8.2', plataforma, '4-calculado-al-guardar');
  } finally {
    // El flujo corre con cada póliza nueva: se apaga para no cargar las altas de los demás criterios
    await abrirListado(page, 'workflows');
    const flujo = (await registros(e.api, 'workflows')).find(w => w.name === FLUJO);
    if (flujo) {
      await abrirFicha(page, 'workflow', flujo.id);
      await esperarCarga(page, 6000);
      await botonDelFlujo(page, /^Deactivate$|^Desactivar$/).catch(() => {});
    }
  }
  console.log(`    prima anual calculada: ${calculada} en ${segundos} s`);

  expect(calculada, 'la prima anual debe ser doce veces la mensual').toBeCloseTo(15_250.5 * 12, 2);

  registrar({
    criterio: 'A.8.2',
    plataforma,
    cumple: 2,
    costo: 2,
    justificacion:
      'Twenty no tiene campos calculados: ningún tipo de campo deriva su valor de otro. El cálculo se armó con ' +
      'un flujo de trabajo que corre cada vez que se guarda la prima de una póliza, con un paso de código que ' +
      'multiplica la prima mensual por doce y un paso que escribe el resultado en el campo de la prima anual. ' +
      'Al cargar desde la ficha una póliza ' +
      `con prima de 15.250,50 el sistema completó ${calculada} sin intervención. La necesidad queda resuelta ` +
      'desde el sistema, pero exige escribir una función en TypeScript —con la prima guardada en millonésimas— ' +
      'y, en la instalación propia, habilitar la ejecución de funciones, que viene deshabilitada. Es desarrollo, ' +
      'breve, que alguien tiene que saber leer y mantener.',
    evidencia: [capTipos, capCodigo, capFlujo, capFicha],
    medicion: `Prima anual calculada al guardar: ${calculada}, ${segundos} segundos después`,
  });
});

// ── A.8.3 ────────────────────────────────────────────────────────────────────
test('A.8.3 — Automatización de procesos', async ({ page, browser }, info) => {
  // «Definir una acción automática ante un evento y provocar ese evento para
  //  comprobar que se ejecuta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const FLUJO = 'Gestión de cobranza vencida';
  for (const w of (await registros(e.api, 'workflows')).filter(w => w.name === FLUJO)) await borrarRegistro(e.api, 'workflows', w.id);
  const estado = (await objeto(e.api, 'poliza')).fields.find((c: any) => c.name === 'estadoDePago');
  const vencida = estado.options.find((o: any) => o.label === 'Vencida').value;
  const poliza = e.polizas.find(p => p.productorId === e.productor && p.estadoDePago !== vencida)!;

  // La acción: cuando la cobranza de una póliza pasa a vencida, se le crea una
  // tarea de gestión a su productor
  await nuevoFlujo(page, FLUJO);
  await ponerDisparador(page, 'Record is updated', ETIQUETA_OBJETO);
  await elegirObjeto(page, 'Pólizas');
  await clicReal(page, await enPanel(page, page.getByText(/^Añadir primer filtro$|^Add first filter$/).filter({ visible: true })));
  await clicReal(page, page.getByText(/^Seleccionar un campo$|^Select a field$/).last());
  await page.keyboard.type('Estado', { delay: 60 });
  await clicReal(page, page.getByText('Estado de pago', { exact: true }).last());
  await page.waitForTimeout(1200);
  const condicion = page.getByText(/^Condiciones$|^Conditions$/).last().locator('xpath=following::*[normalize-space(text())="Editar" or normalize-space(text())="Edit"][1]');
  await clicReal(page, condicion);
  await clicReal(page, page.getByText('Vencida', { exact: true }).last());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const capDisparador = await capturar(page, 'A.8.3', plataforma, '1-evento-y-condicion');
  await agregarPaso(page, 'Create Record');
  await elegirObjeto(page, 'Tasks');
  // Primero el texto y al final la variable: lo que se escribe después de una variable se pierde
  await clicReal(page, page.getByText('Title', { exact: true }).last().locator('xpath=following::*[@contenteditable="true"][1]'));
  await page.keyboard.type('Gestionar cobranza de ', { delay: 50 });
  await abrirVariables(page, 'Title');
  await elegirVariable(page, 'Name');
  await abrirVariables(page, 'Assignee');
  await elegirVariable(page, 'Productor Id');
  await page.waitForTimeout(2500);
  const capAccion = await capturar(page, 'A.8.3', plataforma, '2-accion');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  const TAREA = `Gestionar cobranza de ${poliza.name}`;
  for (const t of (await registros(e.api, 'tasks')).filter(t => t.title === TAREA)) await borrarRegistro(e.api, 'tasks', t.id);
  let tareas: any[] = [], capTarea = '';
  try {
    // Se provoca el evento desde la ficha, como lo haría el usuario
    await abrirFicha(page, 'poliza', poliza.id);
    await elegirEnFicha(page, 'estadoDePago', 'Vencida');
    for (let espera = 0; espera < 36 && !tareas.length; espera++) {
      await page.waitForTimeout(5000);
      tareas = (await registros(e.api, 'tasks')).filter(t => t.title === TAREA);
    }
    await abrirListado(page, 'tasks');
    capTarea = await capturar(page, 'A.8.3', plataforma, '3-tarea-creada-sola');
  } finally {
    // Otros criterios cambian estados de pago: el flujo se apaga para no crearles tareas
    const flujo = (await registros(e.api, 'workflows')).find(w => w.name === FLUJO);
    if (flujo) {
      await abrirFicha(page, 'workflow', flujo.id);
      await esperarCarga(page, 6000);
      await botonDelFlujo(page, /^Deactivate$|^Desactivar$/).catch(() => {});
    }
  }

  expect(tareas.length, 'el cambio de estado debe haber creado la tarea sola').toBe(1);
  expect(tareas[0].assigneeId, 'la tarea debe quedar a cargo del productor de la póliza').toBe(e.productor);

  registrar({
    criterio: 'A.8.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Los flujos de trabajo vienen en la edición evaluada y se arman desde un editor visual, sin escribir ' +
      'código. Se definió uno que escucha las actualizaciones de las pólizas, con la condición de que el estado ' +
      'de pago quede en vencida, y que crea una tarea de gestión a nombre del productor de la póliza. Se provocó ' +
      `el evento cambiando el estado desde la ficha y la tarea «${TAREA}» apareció sola, asignada a ` +
      `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}. Definir el flujo es configuración de una sola vez.`,
    evidencia: [capDisparador, capAccion, capTarea],
    medicion: 'Tarea creada automáticamente al cambiar el estado de pago',
  });
});

// ── A.8.4 ────────────────────────────────────────────────────────────────────
test('A.8.4 — Conservación de la parametrización al actualizar', async ({ page, browser }, info) => {
  // «Aplicar o consultar el procedimiento de actualización y determinar qué
  //  ocurre con las entidades y campos creados por la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'The server runs all required upgrade migrations automatically on startup',
      captura: 'A-8-4-twenty-1-actualizacion',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'Always back up your database before starting the upgrade process',
      captura: 'A-8-4-twenty-2-copia-previa',
    }),
  ];

  // Lo que la compañía parametrizó está hecho por pantalla, y así se comprueba
  await entrar(page, plataforma);
  await configuracion(page, /^Modelo de datos$|^Data model$/);
  const modelo = await textoDe(page);
  const capModelo = await capturar(page, 'A.8.4', plataforma, '3-parametrizacion-por-pantalla');

  expect(modelo, 'la parametrización evaluada debe ser la hecha por pantalla').toMatch(/Pólizas/);
  expect(modelo).toMatch(/Reclamos/);

  registrar({
    criterio: 'A.8.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Lo que la compañía parametriza —objetos, campos, relaciones, vistas y flujos— es parte del modelo de ' +
      'datos del espacio de trabajo, no del código del producto. El procedimiento oficial de actualización no ' +
      'pide nada sobre eso: al arrancar la versión nueva, el servidor corre solo las migraciones de cada espacio ' +
      'de trabajo, incluidos los registros ya cargados, y el fabricante indica respaldar la base antes, como en ' +
      'cualquier actualización. Todo lo que este análisis parametrizó se hizo por pantalla. No hay nada que ' +
      'preparar para que se conserve.',
    evidencia: [capModelo],
    documentacion: fuentes,
  });
});
