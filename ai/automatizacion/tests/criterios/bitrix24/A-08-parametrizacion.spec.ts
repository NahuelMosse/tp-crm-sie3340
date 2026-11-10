import { test, expect } from '../../humano';
import { registrar, sinVerificar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_PROFESSIONAL, constanciaDe, conPlanDe } from '../../precios';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import { altaDeNegociacion, textoDe, procesos, borrarProceso, camposDeNegociacion, campoDeNegociacion, rest, negociaciones, borrarNegociaciones, quitarCampo } from '../../bitrix24/ui';
import { abrirReglas, agregarRegla, cerrarReglas, borrarReglasDe, comentariosDe, guardarRegla, textoDeReglas } from '../../bitrix24/negociaciones-a8';
import { abrirListado, abrirFicha, correrAlInstante, buscarEnElListado, ordenarPorCreacion, asegurarCampos } from '../../bitrix24/negociaciones';

/**
 * A.8 — Parametrización del modelo de negocio, sobre Bitrix24
 *
 * En la edición gratuita no hay entidades propias: la póliza se lleva como
 * una negociación con campos propios. Las reglas de automatización se
 * recorren desde CRM › Negociaciones › «Reglas de automatización».
 */

test.describe.configure({ mode: 'serial' });

const COMPARACION = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
const NOVEDADES = 'https://apidocs.bitrix24.com/whats-new.html';
const FECHA_ACTUALIZACION = '2026-10-22';
const MURO = /Actualice a uno de los planes|PRUÉBELO GRATUITAMENTE POR 15 DÍAS/i;

// ── A.8.1 ────────────────────────────────────────────────────────────────────
test('A.8.1 — Creación de entidades sin programar', async ({ page, browser }, info) => {
  // «Crear una entidad nueva desde la administración y registrar si fue
  //  necesario escribir código»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarProceso(page, 'Inspección');

  // Una entidad que el producto no trae —la inspección del riesgo antes de emitir—, desde la barra del CRM
  await menuLateral(page, 'CRM');
  await pestana(page, 'Automatización Inteligente de Procesos');
  await page.getByText('Crear', { exact: true }).filter({ visible: true }).first().click();
  await panelListo(page, 'Solo esenciales');
  await panel(page).getByText('Solo esenciales', { exact: true }).click();
  await panelListo(page, panel(page).locator('input[name="title"]'));
  await panel(page).locator('input[name="title"]').fill('Inspección');
  const capFormulario = await capturar(page, 'A.8.1', plataforma, '1-formulario');
  await panel(page).locator('button').filter({ hasText: /^\s*Guardar\s*$/ }).filter({ visible: true }).last().click();

  // El muro de pago se determina completando la operación: se mira si la entidad quedó creada
  await page.waitForTimeout(8000);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.8.1', plataforma, '2-al-guardar');
  const creada = (await procesos(page)).some(t => t.title === 'Inspección');
  const pidePlan = /Actualiza al plan (Professional|Enterprise)|Professional o Enterprise/i.test(aviso);
  console.log(`    creada: ${creada} · el sistema pide otro plan: ${pidePlan}`);

  const fuentes = [
    await citar(browser, {
      url: COMPARACION,
      buscar: 'Cree sus propios procesos inteligentes y personalícelos según las necesidades de su empresa',
      captura: 'A-8-1-bitrix24-3-procesos-personalizados',
    }),
    await citar(browser, {
      url: 'https://www.bitrix24.com/promo/professional/',
      buscar: /SPA \(smart process automation\)/i,
      captura: 'A-8-1-bitrix24-4-procesos-inteligentes',
    }),
    ...await constanciaDe(browser, BITRIX24_PROFESSIONAL, 'A-8-1-bitrix24-professional'),
  ];

  expect(creada, 'si la edición gratuita creara la entidad, este veredicto no corresponde').toBeFalsy();
  expect(pidePlan, 'al guardar, el sistema debe informar el plan que la habilita').toBeTruthy();

  registrar({
    criterio: 'A.8.1',
    plataforma,
    cumple: 0,
    resumen: 'La edición gratuita no crea entidades propias; lo más cercano es forzar el concepto dentro del registro de una venta. Las entidades, llamadas procesos inteligentes, exigen el plan Professional.',
    comoLoHace:
      'La edición gratuita no crea entidades propias: al guardar, avisa que los procesos ' +
      'inteligentes requieren el plan Professional o el Enterprise; la tabla comparativa del ' +
      'fabricante los lista entre las funciones que ese plan agrega.',
    caracteristicas:
      'Las entidades nuevas de Bitrix24 son los procesos inteligentes: se crean desde la barra del CRM, ' +
      'con su nombre, sus etapas y sus campos, sin escribir código. Con el plan Professional la entidad se ' +
      'crea igual que se hace con cualquier otra configuración del sistema, sin programar.',
    justificacion:
      'Sin él, lo más cercano es forzar el concepto dentro de una negociación con campos propios, que no ' +
      'es una entidad nueva.',
    evidencia: [capFormulario, capAviso],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_PROFESSIONAL, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan Professional los procesos inteligentes vienen incluidos: se crea la entidad desde la barra ' +
        'del CRM con su nombre, sus etapas y sus campos propios, sin escribir código. Es configuración de una vez.',
    })],
  });
});

// ── A.8.2 ────────────────────────────────────────────────────────────────────
test('A.8.2 — Campos calculados sobre datos propios', async ({ page, browser }, info) => {
  // «Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);

  // Ningún tipo de campo se calcula solo: se recorren los tipos que ofrece el formulario
  await altaDeNegociacion(page);
  const f = panel(page);
  await f.getByText('Crear campo', { exact: true }).first().click();
  await page.waitForTimeout(2500);
  const tiposVisibles = await textoDe(page);
  await f.getByText('Campos adicionales...', { exact: true }).first().click();
  await page.waitForTimeout(2500);
  const tipos = tiposVisibles + '\n' + await textoDe(page);
  const capTipos = await capturar(page, 'A.8.2', plataforma, '1-tipos-de-campo');
  // «Campos adicionales...» abre el alta del campo en otra pestaña: se cierra para que el resto de la prueba se vea en la página grabada
  for (const otra of page.context().pages()) if (otra !== page) await otra.close().catch(() => {});
  expect(tipos, 'si hubiera un campo de fórmula, este veredicto no corresponde').not.toMatch(/F[oó]rmula|Calculad/i);
  await page.keyboard.press('Escape');
  await cerrarPaneles(page);

  // El cálculo lo hacen dos reglas de automatización: «Ejecutar operaciones matemáticas» y «Modificar elemento».
  // Se prepara un campo de partida y uno de llegada, ambos numéricos, y una variable para el resultado
  await asegurarCampos(page, [{ tipo: 'Número', nombre: 'Prima neta' }, { tipo: 'Número', nombre: 'Prima total' }]);
  const neta = (await campoDeNegociacion(page, 'Prima neta'))!.FIELD_NAME as string;
  const total = (await campoDeNegociacion(page, 'Prima total'))!.FIELD_NAME as string;
  const TITULO = 'POL-CALC';
  const VARIABLE = 'Prima con recargo';
  const RECARGO = '1.21';
  await borrarNegociaciones(page, /^POL-CALC$/);

  await abrirReglas(page);
  await panel(page).getByText('Variables', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  if (!(await textoDeReglas(page)).includes(VARIABLE)) {
    await panel(page).getByText('Crear', { exact: true }).first().click();
    await page.waitForTimeout(2500);
    await panel(page).locator('input[name=NAME]').fill(VARIABLE);
    await panel(page).locator('select[name=TYPE]').selectOption({ label: 'Número' });
    await panel(page).locator('select[name=VISIBILITY]').selectOption({ label: 'Negociaciones' });
    await panel(page).getByText('Guardar', { exact: true }).last().click();
    await page.waitForTimeout(4000);
  }
  await cerrarReglas(page);

  const PROPIAS = /operaciones matem|Modificar elemento/i;
  await abrirReglas(page);
  await borrarReglasDe(page, 'En progreso', PROPIAS);
  await cerrarReglas(page);
  await abrirReglas(page);
  const emergente = () => f.locator('.popup-window').filter({ visible: true }).last();
  const elegir = async (enlace: string, tipo: string, item?: string, valor?: string) => {
    await f.getByText(enlace, { exact: true }).first().click();
    await page.waitForTimeout(1500);
    await emergente().locator('select').first().selectOption({ label: tipo });
    await page.waitForTimeout(800);
    if (item) {
      await emergente().locator('div.bizproc-automation-popup-settings-dropdown').last().click();
      await page.waitForTimeout(1200);
      for (const paso of item.split('>')) {
        await f.getByText(paso, { exact: true }).last().click();
        await page.waitForTimeout(1200);
      }
    }
    if (valor) {
      await emergente().locator('input[type=text]').last().click();
      await page.keyboard.type(valor, { delay: 90 });
    }
    await emergente().getByText(/^seleccionar$/i).last().click();
    await page.waitForTimeout(1200);
  };

  // Regla 1: variable = Prima neta × 1,21
  await agregarRegla(page, 'En progreso', 'Almacenamiento y modificación de los datos', 'Ejecutar operaciones matemáticas');
  await elegir('Seleccionar una variable', 'Variables de la sección "Negociaciones"', VARIABLE);
  await elegir('Seleccionar un parámetro', 'Valor del campo', 'Negociación>Prima neta');
  await f.locator('.bizproc-automation-condition-joiner').last().click();
  await page.waitForTimeout(1200);
  await f.locator('.menu-popup-item-text').filter({ hasText: /^\*$/ }).first().click();
  await page.waitForTimeout(1000);
  await elegir('Seleccionar un parámetro', 'Valor personalizado', undefined, RECARGO);
  const capRegla = await capturar(page, 'A.8.2', plataforma, '3-regla-matematica');
  await f.getByText(/^guardar$/i).last().click();
  await page.waitForTimeout(2500);

  // Regla 2: Prima total = el resultado de la variable
  await agregarRegla(page, 'En progreso', 'Administrar los elementos del flujo de trabajo', 'Modificar elemento');
  await f.getByText('Seleccionar campo', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText('Prima total', { exact: true }).last().click();
  await page.waitForTimeout(1200);
  await f.getByText('Eliminar', { exact: true }).first().click();
  await page.waitForTimeout(800);
  await f.locator('input[aria-label="Prima total"] + span').click();
  await page.waitForTimeout(1500);
  await page.keyboard.type(VARIABLE, { delay: 90 });
  await page.waitForTimeout(1500);
  await f.getByText(VARIABLE, { exact: true }).last().click();
  await page.waitForTimeout(1200);
  const capModificar = await capturar(page, 'A.8.2', plataforma, '4-modificar-elemento');
  await guardarRegla(page);
  await cerrarReglas(page);

  try {
    // La póliza pasa a «En progreso» desde su ficha, con una prima neta cargada
    const id = String(await rest(page, 'crm.deal.add', { fields: { TITLE: TITULO, [neta]: '1000' } }));
    await abrirListado(page);
    if (!(await buscarEnElListado(page, TITULO))) await ordenarPorCreacion(page, TITULO);
    await abrirFicha(page, TITULO);
    await panel(page).locator('.crm-entity-section-status-step, .crm-entity-widget-progress-step')
      .filter({ hasText: /^\s*En progreso\s*$/ }).first().click();
    await page.waitForTimeout(4000);
    const leer = async () => {
      const d: any = await rest(page, 'crm.deal.get', { id });
      return { etapa: String(d.STAGE_ID), neta: String(d[neta]), total: String(d[total]) };
    };
    let v = await leer();
    for (let espera = 0; espera < 30 && !(Number(v.total) > 0); espera++) {
      await page.waitForTimeout(10_000);
      v = await leer();
    }
    console.log(`    A.8.2 etapa ${v.etapa} · neta ${v.neta} · total ${v.total}`);
    // Se vuelve a abrir la ficha: el valor calculado se lee en el campo «Prima total»
    await cerrarPaneles(page);
    await abrirFicha(page, TITULO);
    await panel(page).getByText('Prima total', { exact: true }).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    const enPantalla = /1\.?210/.test(await textoDe(page));
    console.log(`    A.8.2 la ficha muestra 1210: ${enPantalla}`);
    const capCalculado = await capturar(page, 'A.8.2', plataforma, '5-valor-calculado');
    await page.waitForTimeout(2000);
    await cerrarPaneles(page);
    expect(enPantalla, 'la ficha debe mostrar la prima total calculada').toBeTruthy();

    // La prima neta se corrige después: ¿el total la acompaña?
    await rest(page, 'crm.deal.update', { id, fields: { [neta]: '2000' } });
    await page.waitForTimeout(45_000);
    const despues = await leer();
    console.log(`    A.8.2 tras corregir: neta ${despues.neta} · total ${despues.total}`);

    const fuentes = [
      await citar(browser, {
        url: 'https://helpdesk.bitrix24.com/open/14954920/',
        buscar: 'This automation rule updates a variable with the result of a math operation',
        captura: 'A-8-2-bitrix24-6-operaciones-matematicas',
      }),
      await citar(browser, {
        url: 'https://helpdesk.bitrix24.com/open/22396442/',
        buscar: 'When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity',
        captura: 'A-8-2-bitrix24-7-modificar-elemento',
      }),
    ];

    if (!(Number(v.total) > 0)) {
      sinVerificar('A.8.2', plataforma, 'Las dos reglas quedaron guardadas, pero tras pasar la póliza a «En progreso» el campo de llegada no recibió ningún valor, de modo que el cálculo no se pudo observar.');
      return;
    }
    const sigue = Number(despues.total) === Number(v.total);
    const coma = (n: string) => String(Number(n)).replace('.', ',');
    expect(Number(v.total), 'el total debe ser la prima neta por el recargo').toBeCloseTo(1000 * Number(RECARGO), 2);

    registrar({
      criterio: 'A.8.2',
      plataforma,
      cumple: sigue ? 1 : 2,
      reparo: (sigue ? 1 : 2) === 1 ? 'parcial' : undefined,
      costo: sigue ? 2 : 1,
      resumen: sigue
        ? 'Calcula el valor derivado con reglas que corren al llegar a una etapa, sin campos calculados: no acompaña los cambios posteriores del dato de partida.'
        : 'Recalcula el valor derivado con reglas de automatización cada vez que cambia el dato de partida, con una configuración de una sola vez.',
      comoLoHace:
        'El cálculo se arma con dos reglas de automatización de la etapa «En progreso»: «Ejecutar ' +
        'operaciones matemáticas» multiplica la prima neta por el factor del recargo y deja el ' +
        'resultado en una variable, y «Modificar elemento» lo escribe en el campo «Prima total». Al ' +
        'pasar una póliza a esa etapa desde su ficha, sin intervención, la prima total queda ' +
        'calculada.',
      caracteristicas:
        'Bitrix24 no tiene campos calculados: entre los tipos de campo que ofrece el formulario —cadena, ' +
        'lista, fecha, dinero, número y los adicionales— ninguno deriva su valor de otro. El cálculo se ' +
        'configura sin código, pero las reglas corren cuando la negociación llega a la etapa y la regla ' +
        'matemática solo toma campos numéricos, no los de dinero como la prima de la póliza. ' +
        `Al corregir después la prima neta a 2.000 por la interfaz de programación, la prima total ${sigue ? `siguió en ${coma(despues.total)}` : `pasó a ${coma(despues.total)}`}.`,
      justificacion: sigue
        ? 'El valor derivado se calcula una vez y no acompaña a la prima corregida después: la compañía tiene que volver a pasar la póliza por la etapa cada vez que cambia el dato de partida.'
        : 'El valor derivado se recalcula solo al cambiar el dato de partida, con una configuración que se hace una vez.',
      evidencia: [capTipos, capRegla, capModificar, capCalculado],
      documentacion: fuentes,
      medicion: `Prima neta ${coma(v.neta)} → prima total ${coma(v.total)}; tras corregir la neta a ${coma(despues.neta)}, total ${coma(despues.total)}`,
    });
  } finally {
    await borrarNegociaciones(page, /^POL-CALC$/);
    await abrirReglas(page);
    await borrarReglasDe(page, 'En progreso', PROPIAS);
    await cerrarReglas(page);
    await quitarCampo(page, 'Prima neta');
    await quitarCampo(page, 'Prima total');
  }
});

// ── A.8.3 ────────────────────────────────────────────────────────────────────
test('A.8.3 — Automatización de procesos', async ({ page, browser }, info) => {
  // «Definir una acción automática ante un evento y provocar ese evento para
  //  comprobar que se ejecuta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  const TEXTO = 'Póliza en emisión: verificar la documentación del asegurado';
  const propia = /comentario/i;
  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^POL-PAR-EVENTO$/);

  // La regla: al llegar una negociación a «En progreso», el sistema deja un comentario en su historial
  await abrirReglas(page);
  await borrarReglasDe(page, 'En progreso', propia);
  await cerrarReglas(page);
  await abrirReglas(page);
  const tarjetas = () => panel(page).locator('.bizproc-automation-robot-container');
  const previas = await tarjetas().count();
  const aviso = await panel(page).getByText(/Puede utilizar hasta \d+ reglas de automatización y disparadores/).first().innerText();
  const limite = Number(aviso.match(/hasta (\d+)/)?.[1]);
  await agregarRegla(page, 'En progreso', 'Alertas para los empleados', 'Agregar un comentario al elemento');
  await correrAlInstante(page);
  await panel(page).locator('textarea').filter({ visible: true }).first().fill(TEXTO);
  const capRegla = await capturar(page, 'A.8.3', plataforma, '1-regla');

  // Se guarda la regla, y el sistema responde: se guarda o pide otro plan
  await panel(page).getByText(/^guardar$/i).last().click();
  await page.waitForTimeout(2500);
  await panel(page).getByText(/^guardar$/i).first().click();
  await page.waitForTimeout(8000);
  const muro = MURO.test(await textoDe(page));
  const capGuardada = await capturar(page, 'A.8.3', plataforma, '2-al-guardar');
  await cerrarReglas(page);
  await abrirReglas(page);
  const guardada = (await tarjetas().filter({ hasText: propia }).count()) > 0;
  console.log(`    reglas previas: ${previas} · límite: ${limite} · pide otro plan: ${muro} · regla guardada: ${guardada}`);
  await cerrarReglas(page);
  expect(muro, 'con lugar bajo el tope, el sistema no debe pedir otro plan').toBeFalsy();
  expect(guardada, 'la regla debe quedar guardada').toBeTruthy();

  try {
    // El evento: una póliza pasa a «En progreso» desde su ficha, con un clic en la etapa
    const id = String(await rest(page, 'crm.deal.add', { fields: { TITLE: 'POL-PAR-EVENTO' } }));
    await abrirListado(page);
    await buscarEnElListado(page, 'POL-PAR-EVENTO');
    await abrirFicha(page, 'POL-PAR-EVENTO');
    await panel(page).locator('.crm-entity-section-status-step, .crm-entity-widget-progress-step')
      .filter({ hasText: /^\s*En progreso\s*$/ }).first().click();
    await page.waitForTimeout(4000);
    const etapa = (await negociaciones(page, /^POL-PAR-EVENTO$/, ['ID', 'TITLE', 'STAGE_ID']))[0]?.STAGE_ID;

    // La regla corre sola: el comentario aparece en el historial de la póliza
    let comentarios: string[] = [];
    for (let espera = 0; espera < 30 && !comentarios.some(c => c.includes(TEXTO)); espera++) {
      await page.waitForTimeout(10_000);
      comentarios = await comentariosDe(page, id);
    }
    const capEjecutada = await capturar(page, 'A.8.3', plataforma, '3-comentario-en-el-historial');
    await cerrarPaneles(page);
    console.log(`    etapa: ${etapa} · comentarios: ${comentarios.join(' | ')}`);

    const fuentes = [
      await citar(browser, {
        url: 'https://helpdesk.bitrix24.com/open/22396442/',
        buscar: 'When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity',
        captura: 'A-8-3-bitrix24-3-regla-por-etapa',
      }),
    ];

    expect(etapa, 'la póliza debe haber pasado a En progreso').toBe('EXECUTING');
    expect(comentarios.some(c => c.includes(TEXTO)), 'la regla debe haber dejado el comentario sin intervención').toBeTruthy();

    registrar({
      criterio: 'A.8.3',
      plataforma,
      cumple: 2,
      costo: 1,
      resumen: 'Automatiza acciones por etapa con reglas armadas por pantalla, sin código: comunicar, crear tareas, modificar campos o comentar. Admite hasta cinco reglas en total.',
      comoLoHace:
        'Se define una regla que deja un comentario en el historial al llegar a «En progreso». Al ' +
        'pasar una póliza a esa etapa con un clic en la barra de etapas de su ficha, sin que nadie ' +
        'haga nada más, el comentario aparece en el historial de la póliza.',
      caracteristicas:
        'Las reglas de automatización de la negociación se arman desde la pantalla, sin código: se elige ' +
        'la etapa, la acción —comunicar, crear tareas, modificar campos, dejar comentarios— y el momento. ' +
        `La edición gratuita admite hasta ${limite} reglas y disparadores en total: con las de muestra del ` +
        `portal dejadas en ${previas}, la regla entra.`,
      justificacion:
        'Definir cada regla es configuración de una vez.',
      evidencia: [capRegla, capGuardada, capEjecutada],
      documentacion: fuentes,
      medicion: `Comentarios en la póliza tras el cambio de etapa: ${comentarios.length}`,
    });
  } finally {
    await borrarNegociaciones(page, /^POL-PAR-EVENTO$/);
    await abrirReglas(page);
    await borrarReglasDe(page, 'En progreso', propia);
    await cerrarReglas(page);
  }
});

// ── A.8.4 ────────────────────────────────────────────────────────────────────
test('A.8.4 — Conservación de la parametrización al actualizar', async ({ page, browser }, info) => {
  // «Aplicar o consultar el procedimiento de actualización y determinar qué
  //  ocurre con las entidades y campos creados por la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://helpdesk.bitrix24.com/open/23247978/',
      buscar: 'Bitrix24 accounts automatically receive updates and new tools',
      captura: 'A-8-4-bitrix24-1-actualizacion-automatica',
    }),
    // Una versión nueva del CRM, fechada en el registro de cambios oficial: métodos nuevos del módulo CRM
    await citar(browser, {
      url: NOVEDADES,
      buscar: 'Added the crm.form.* methods in REST 3.0',
      captura: 'A-8-4-bitrix24-2-novedades-del-crm-de-octubre',
    }),
  ];

  // Lo parametrizado antes de esa actualización: los campos propios y las pólizas cargadas con ellos
  await entrar(page, plataforma);
  const propios = await camposDeNegociacion(page);
  const campos = propios.map(c => c.etiqueta);
  expect(campos, 'la parametrización evaluada debe estar en el portal').toEqual(expect.arrayContaining(['Ramo', 'Estado de cobranza', 'Prima']));
  const ramo = propios.find(c => c.etiqueta === 'Ramo')!.FIELD_NAME as string;
  const todas = await rest<any[]>(page, 'crm.deal.list', {
    order: { DATE_CREATE: 'ASC' }, filter: { '<DATE_CREATE': FECHA_ACTUALIZACION }, select: ['ID', 'TITLE', 'DATE_CREATE', ramo],
  });
  const previas = todas.filter(d => d[ramo] !== null && d[ramo] !== '' && d[ramo] !== false);
  console.log(`    campos propios: ${campos.join(', ')} · pólizas con ramo cargadas antes del ${FECHA_ACTUALIZACION}: ${previas.length}`);

  if (!previas.length) {
    sinVerificar('A.8.4', plataforma,
      'No quedan en el portal negociaciones cargadas con los campos propios antes de la versión del CRM del ' +
      '22 de octubre de 2026, de modo que no se pudo observar qué ocurrió con ellas al actualizar.');
    return;
  }

  // La póliza más antigua, abierta por pantalla: el campo y su valor siguen ahí
  const muestra = previas[0];
  const creada = String(muestra.DATE_CREATE).slice(0, 10).split('-').reverse().join('/');
  await abrirListado(page);
  if (!(await buscarEnElListado(page, muestra.TITLE))) await ordenarPorCreacion(page, muestra.TITLE);
  await abrirFicha(page, muestra.TITLE);
  await panelListo(page, 'Ramo');
  const ficha = await textoDe(page);
  const capFicha = await capturar(page, 'A.8.4', plataforma, '3-poliza-anterior-a-la-actualizacion');
  await cerrarPaneles(page);
  expect(ficha, 'la ficha muestra el campo propio').toMatch(/Ramo/);

  registrar({
    criterio: 'A.8.4',
    plataforma,
    cumple: 2,
    costo: 0,
    resumen: 'El fabricante actualiza el servicio por su cuenta y la parametrización propia, con sus campos y datos cargados, se conserva sin trabajo de la compañía.',
    comoLoHace:
      'El fabricante actualiza el servicio por su cuenta, sin que la compañía aplique ningún procedimiento ni ' +
      'elija el momento. El registro de cambios oficial fecha el 22 de octubre de 2026 una versión nueva del ' +
      'módulo CRM, con métodos para trabajar con sus formularios, que llega a todas las cuentas en la nube.',
    caracteristicas:
      `Los campos propios creados por pantalla (${campos.join(', ')}) siguen en el formulario después de esa ` +
      `versión, y las ${previas.length} pólizas cargadas antes con esos campos conservan sus valores: ` +
      `la más antigua, del ${creada}, se abrió y muestra su ramo.`,
    justificacion:
      'Lo que la compañía parametrizó atravesó una versión nueva del CRM sin perderse ni tener que ' +
      'rehacerse, y no exige ningún trabajo de su parte.',
    evidencia: [capFicha],
    documentacion: fuentes,
    medicion: `Pólizas con campos propios anteriores a la actualización: ${previas.length}`,
  });
});
