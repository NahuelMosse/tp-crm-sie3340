import { test, expect, Page } from '../../humano';
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
import { copiarTwenty, actualizarTwenty, versionTwenty, sqlTwenty, retirarCopia } from '../../actualizacion';
import { BASE } from '../../twenty/ui';

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
    resumen:
      'Crea entidades nuevas con descripción y campos propios, ' +
      'que aparecen enseguida en el menú con listado y ficha, sin escribir código.',
    comoLoHace:
      'Desde Configuración › Modelo de datos se crea una entidad que el producto no trae —por ejemplo, ' +
      'la inspección del riesgo antes de emitir— con su nombre en singular y plural y una descripción, ' +
      'y se le agregan campos, como uno de fecha.',
    caracteristicas:
      'Apareció en el menú con su listado y su ficha, y admitió registros enseguida.',
    justificacion:
      'No hace falta escribir código en ningún paso: es configuración.',
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
    resumen:
      'No tiene campos calculados: el cálculo se arma con un flujo y un paso de código en ' +
      'TypeScript, que exige desarrollo y habilitar la ejecución de funciones.',
    comoLoHace:
      'El cálculo se arma con un flujo de trabajo que corre cada vez que se guarda la prima de una ' +
      'póliza, con un paso de código que multiplica la prima mensual por doce y un paso que escribe el ' +
      'resultado en el campo de la prima anual: al cargar la prima desde la ficha, el sistema completa ' +
      'la anual sin intervención.',
    caracteristicas:
      'Twenty no tiene campos calculados: ningún tipo de campo deriva su valor de otro. La necesidad ' +
      'queda resuelta desde el sistema, pero exige escribir una función en TypeScript —con la prima ' +
      'guardada en millonésimas— y, en la instalación propia, habilitar la ejecución de funciones, que ' +
      'viene deshabilitada.',
    justificacion:
      'Es desarrollo, breve, que alguien tiene que saber leer y mantener.',
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
    // La ficha se abre en el panel lateral: el estado de pago es el chip «Al día», y se lo cambia por «Vencida»
    await clicReal(page, page.getByText('Al día', { exact: true }).filter({ visible: true }).last());
    await clicReal(page, page.getByText('Vencida', { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(1500);
    for (let espera = 0; espera < 36 && !tareas.length; espera++) {
      await page.waitForTimeout(5000);
      tareas = (await registros(e.api, 'tasks')).filter(t => t.title === TAREA);
    }
    await irAListado(page, 'Tasks');
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
    resumen:
      'Los flujos de trabajo, armados en un editor visual sin código, reaccionan a cambios en ' +
      'registros, como un estado de pago vencido, y crean tareas asignadas al productor.',
    comoLoHace:
      'Un flujo de trabajo escucha las actualizaciones de las pólizas, con la condición de que el ' +
      'estado de pago quede en vencida, y crea una tarea de gestión a nombre del productor de la ' +
      'póliza: al cambiar el estado desde la ficha, la tarea aparece sola, asignada al productor.',
    caracteristicas:
      'Los flujos de trabajo vienen en la edición evaluada y se arman desde un editor visual, sin ' +
      'escribir código.',
    justificacion:
      'Definir el flujo es configuración de una sola vez.',
    evidencia: [capDisparador, capAccion, capTarea],
    medicion: 'Tarea creada automáticamente al cambiar el estado de pago',
  });
});

/**
 * La configuración en la versión nueva: el botón «Configuración» de los modos de
 * navegación del menú lateral, y la sección en el menú de la izquierda.
 */
async function enConfiguracion(page: Page, seccion: string | RegExp) {
  if (!new URL(page.url()).pathname.startsWith('/settings')) {
    await clicReal(page, page.getByRole('button', { name: /^Configuración$|^Settings$/ }).first());
    await page.waitForURL(u => u.pathname.startsWith('/settings'), { timeout: 30_000 });
    await esperarCarga(page, 2000);
  }
  const candidatos = page.getByText(seccion, { exact: typeof seccion === 'string' }).filter({ visible: true });
  await candidatos.first().waitFor({ state: 'visible', timeout: 30_000 });
  const xs = await candidatos.evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
  const lado = seccion === 'Pólizas' ? xs.findIndex(x => x > 220) : xs.findIndex(x => x < 220);
  await clicReal(page, candidatos.nth(Math.max(0, lado)));
  await esperarCarga(page, 3000);
}

/** Vuelve del menú de configuración a los datos, con el botón «Inicio». */
async function salirDeConfiguracion(page: Page) {
  if (!new URL(page.url()).pathname.startsWith('/settings')) return;
  await clicReal(page, page.getByRole('button', { name: /^Inicio$|^Home$/ }).first());
  await page.waitForURL(u => !u.pathname.startsWith('/settings'), { timeout: 30_000 });
  await esperarCarga(page, 2500);
}

/** Un listado del menú lateral por su nombre; los flujos van en un grupo que se despliega. */
async function irAListado(page: Page, nombre: string) {
  await salirDeConfiguracion(page);
  const opciones = page.getByText(nombre, { exact: true }).filter({ visible: true });
  if (nombre === 'Workflows') {
    if ((await opciones.count()) < 2) await clicReal(page, opciones.first());
    await page.waitForTimeout(1000);
    await clicReal(page, opciones.nth(1));
  } else {
    await clicReal(page, opciones.first());
  }
  await esperarCarga(page, 4000);
}

/** Abre un registro de un listado haciendo clic en su nombre; si se abre al costado, lo expande a página. */
async function abrirPorNombre(page: Page, listado: string, nombre: string) {
  await irAListado(page, listado);
  await clicReal(page, page.getByText(nombre, { exact: true }).filter({ visible: true }).first());
  await esperarCarga(page, 3000);
  const expandir = page.getByRole('button', { name: /^Expandir registro$|^Expand record$/ }).filter({ visible: true }).first();
  if (await expandir.isVisible().catch(() => false)) {
    await clicReal(page, expandir);
    await esperarCarga(page, 3000);
  }
  await page.locator('[data-testid="record-fields-widget"]').first().waitFor({ state: 'visible', timeout: 40_000 }).catch(() => {});
  await esperarCarga(page, 2500);
}

/** El formulario de alta de una póliza —«Agregar nuevo» del listado— con su nombre, ramo y estado de pago. */
async function formularioDeAltaDePoliza(page: Page, nombre: string, ramo: string, estado: string) {
  await irAListado(page, 'Pólizas');
  await clicReal(page, page.getByText(/^Agregar nuevo$|^Add new$/).filter({ visible: true }).first());
  // El nombre es el primer campo del panel: se hace clic en la caja que está debajo de su rótulo
  const rotulo = page.getByText(/^Name$|^Nombre$/).filter({ visible: true }).last();
  await rotulo.waitFor({ state: 'visible', timeout: 30_000 });
  const caja = (await rotulo.boundingBox())!;
  await page.mouse.move(caja.x + 120, caja.y + 28, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
  await page.waitForTimeout(800);
  await page.keyboard.type(nombre, { delay: 60 });
  await clicReal(page, page.getByText(/^No Ramo$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText(ramo, { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(800);
  await clicReal(page, page.getByText(/^No Estado de pago$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText(estado, { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(800);
}

/**
 * El ingreso a la versión nueva: correo, «Continuar» y contraseña, esperando cada
 * pantalla hasta que aparece, porque la primera carga tras actualizar tarda.
 */
async function ingresar(page: Page) {
  // La sesión guardada es la de la instalación en uso: en la copia se ingresa de cero
  await page.context().clearCookies();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const configuracion = page.getByRole('button', { name: /^Configuración$|^Settings$/ }).first();
  const correo = page.getByRole('textbox').first();
  const clave = page.locator('input[type="password"]').first();
  const conCorreo = page.getByRole('button', { name: /Continuar con el correo|Continue with email/i });
  const avanzar = page.getByRole('button', { name: /^Continuar$|^Continue$|^Iniciar sesión$|^Sign in$/ }).first();
  for (let paso = 0; paso < 6; paso++) {
    await Promise.race([
      configuracion.waitFor({ state: 'visible', timeout: 90_000 }),
      correo.waitFor({ state: 'visible', timeout: 90_000 }),
      clave.waitFor({ state: 'visible', timeout: 90_000 }),
      conCorreo.waitFor({ state: 'visible', timeout: 90_000 }),
    ]).catch(() => {});
    if (await configuracion.isVisible().catch(() => false)) return;
    if (await clave.isVisible().catch(() => false)) {
      await clave.fill('TpCrm2026!');
      await avanzar.click();
      await page.waitForTimeout(8000);
    } else if (await conCorreo.isVisible().catch(() => false)) {
      await conCorreo.click();
      await page.waitForTimeout(2000);
    } else if (await correo.isVisible().catch(() => false)) {
      await correo.fill('tp@unimoron.test');
      await avanzar.click();
      await page.waitForTimeout(6000);
    }
  }
  throw new Error('No se pudo ingresar a la versión nueva');
}

// ── A.8.4 ────────────────────────────────────────────────────────────────────
test('A.8.4 — Conservación de la parametrización al actualizar', async ({ page, browser }, info) => {
  // «Aplicar o consultar el procedimiento de actualización y determinar qué
  //  ocurre con las entidades y campos creados por la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(3_600_000);

  // La actualización se aplica sobre una copia de la instalación, que se ve en TWENTY_URL
  const puerto = Number(process.env.A84_TWENTY_PUERTO);
  if (!puerto || BASE !== `http://localhost:${puerto}`) {
    throw new Error('Faltan A84_TWENTY_PUERTO y TWENTY_URL=http://localhost:<ese puerto>: la copia que se actualiza');
  }
  const DE = 'v2.37.4';
  const A = 'v2.56.1';
  const NUEVA = 'POL-ACTUALIZADA-001';
  const FLUJO = 'Gestión de cobranza vencida';

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

  const copia = await copiarTwenty(puerto, DE);
  try {
    const origen = versionTwenty();
    expect(origen, 'la copia debe partir de la versión de origen').toBe(DE);
    const esquema = sqlTwenty("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%' LIMIT 1");
    const contar = (tabla: string, extra = '') =>
      Number(sqlTwenty(`SELECT COUNT(*) FROM ${esquema}.${tabla} WHERE "deletedAt" IS NULL ${extra}`));
    const antes = { polizas: contar('_poliza'), reclamos: contar('_reclamo'), flujos: contar('workflow') };
    const [, previaNombre, previaRamo] = sqlTwenty(
      `SELECT id, name, ramo FROM ${esquema}._poliza WHERE "deletedAt" IS NULL AND ramo IS NOT NULL AND "estadoDePago" = 'AL_DIA' AND "productorId" IS NOT NULL ORDER BY "createdAt" LIMIT 1`).split('|');

    // La actualización, con el procedimiento oficial: la imagen nueva corre sola las migraciones al arrancar
    await actualizarTwenty(copia, A);
    const destino = versionTwenty();
    expect(destino, 'la copia debe quedar en la versión nueva').toBe(A);

    // Lo que ocurrió con lo parametrizado se comprueba por pantalla, en la copia actualizada
    await ingresar(page);

    // 1. Los objetos propios siguen en el modelo de datos
    await enConfiguracion(page, /^Modelo de datos$|^Data model$/);
    const modelo = await textoDe(page);
    const capModelo = await capturar(page, 'A.8.4', plataforma, '3-objetos-propios');
    for (const objeto of ['Pólizas', 'Reclamos', 'Cuotas']) expect(modelo).toContain(objeto);

    // 2. Los campos propios de la póliza
    await enConfiguracion(page, 'Pólizas');
    await page.waitForURL(/\/settings\/objects\/polizas/, { timeout: 30_000 });
    await esperarCarga(page, 3000);
    const campos = await textoDe(page);
    const capCampos = await capturar(page, 'A.8.4', plataforma, '4-campos-de-la-poliza');
    for (const campo of ['Ramo', 'Estado de pago', 'Prima', 'Vigencia', 'Titular']) expect(campos).toContain(campo);

    // 3. Los flujos de trabajo siguen definidos
    await salirDeConfiguracion(page);
    await irAListado(page, 'Workflows');
    const flujos = await textoDe(page);
    const capFlujos = await capturar(page, 'A.8.4', plataforma, '5-flujos');
    expect(flujos).toContain(FLUJO);
    expect(flujos).toContain('Cálculo de la prima anual');

    // 4. La póliza cargada antes de actualizar, con sus campos propios y sus valores
    await abrirPorNombre(page, 'Pólizas', previaNombre);
    const fichaPrevia = await textoDe(page);
    const capPrevia = await capturar(page, 'A.8.4', plataforma, '6-poliza-anterior');
    expect(fichaPrevia).toContain(previaNombre);
    expect(fichaPrevia).toMatch(/Ramo/);
    expect(fichaPrevia).toMatch(new RegExp(previaRamo, 'i'));

    // 5. Un alta nueva: el formulario con sus campos propios sigue funcionando
    await formularioDeAltaDePoliza(page, NUEVA, 'Hogar', 'Al día');
    const capNueva = await capturar(page, 'A.8.4', plataforma, '7-alta-nueva');
    await clicReal(page, page.getByRole('button', { name: /^Crear/ }).last());
    await page.waitForTimeout(4000);
    await abrirPorNombre(page, 'Pólizas', NUEVA);
    const fichaNueva = await textoDe(page);
    expect(fichaNueva).toContain(NUEVA);
    expect(fichaNueva).toMatch(/Hogar/);

    // 6. El flujo de la cobranza vencida: se lo activa y se provoca su evento desde la ficha
    await abrirPorNombre(page, 'Workflows', FLUJO);
    await esperarCarga(page, 6000);
    if (await page.getByText(/^Activate$|^Activar$/).filter({ visible: true }).count()) await botonDelFlujo(page, /^Activate$|^Activar$/);
    await page.waitForTimeout(4000);
    expect(await textoDe(page), 'el flujo debe quedar activo').toMatch(/Activo|Active/);
    const TAREA = `Gestionar cobranza de ${previaNombre}`;
    await abrirPorNombre(page, 'Pólizas', previaNombre);
    // La ficha se abre en el panel lateral: el estado de pago es el chip «Al día», y se lo cambia por «Vencida»
    await clicReal(page, page.getByText('Al día', { exact: true }).filter({ visible: true }).last());
    await clicReal(page, page.getByText('Vencida', { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(1500);
    let tareas = 0;
    for (let espera = 0; espera < 36 && !tareas; espera++) {
      await page.waitForTimeout(5000);
      tareas = contar('task', `AND title = '${TAREA}'`);
    }
    await irAListado(page, 'Tasks');
    const capTarea = await capturar(page, 'A.8.4', plataforma, '8-tarea-creada-sola');
    expect(tareas, 'el flujo definido antes de actualizar debe crear la tarea al vencer la póliza').toBe(1);

    const despues = {
      polizas: contar('_poliza', `AND name <> '${NUEVA}'`), reclamos: contar('_reclamo'), flujos: contar('workflow'),
    };
    expect(despues, 'los registros y flujos cargados antes deben seguir todos').toEqual(antes);

    registrar({
      criterio: 'A.8.4',
      plataforma,
      cumple: 2,
      costo: 0,
      resumen:
        'La actualización de versión migra sola objetos, campos, relaciones, vistas, flujos y ' +
        'registros propios, sin rehacer ni reconfigurar nada de lo parametrizado.',
      comoLoHace:
        'Con el procedimiento oficial, la versión se actualiza cambiando la imagen y volviendo a ' +
        'levantar los contenedores, y el servidor corre solo sus migraciones al arrancar. Después de ' +
        'actualizar, los objetos propios y sus campos siguen en el modelo de datos, los flujos de ' +
        'trabajo siguen definidos, los registros cargados siguen en su lugar con todos sus valores, una ' +
        'póliza dada de alta de nuevo admite sus campos propios y un flujo activado en la versión nueva ' +
        'sigue operando, como el que crea la tarea de cobranza al pasar una póliza a vencida.',
      caracteristicas:
        'Lo que la compañía parametriza —objetos, campos, relaciones, vistas y flujos— es parte del modelo de ' +
        'datos del espacio de trabajo, no del código del producto: la actualización lo migra con los ' +
        'registros, sin pasos manuales.',
      justificacion:
        'Al pasar de una versión a la siguiente no hay que rehacer ni reconfigurar nada de lo ' +
        'parametrizado, de modo que la conservación no suma trabajo.',
      evidencia: [capModelo, capCampos, capFlujos, capPrevia, capNueva, capTarea],
      documentacion: fuentes,
    });
  } finally {
    retirarCopia('twenty', copia.dir);
  }
});
