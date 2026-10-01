import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_PROFESSIONAL, constanciaDe, conPlanDe } from '../../precios';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import { altaDeNegociacion, textoDe, procesos, borrarProceso, camposDeNegociacion, rest, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import { abrirReglas, agregarRegla, cerrarReglas, borrarReglasDe, comentariosDe } from '../../bitrix24/negociaciones-a8';
import { abrirListado, abrirFicha, correrAlInstante, buscarEnElListado } from '../../bitrix24/negociaciones';

/**
 * A.8 — Parametrización del modelo de negocio, sobre Bitrix24
 *
 * En la edición gratuita no hay entidades propias: la póliza se lleva como
 * una negociación con campos propios. Las reglas de automatización se
 * recorren desde CRM › Negociaciones › «Reglas de automatización».
 */

test.describe.configure({ mode: 'serial' });

const COMPARACION = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
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
    justificacion:
      'Las entidades nuevas de Bitrix24 son los procesos inteligentes: se crean desde la barra del CRM, con su ' +
      'nombre, sus etapas y sus campos, sin escribir código. En la edición gratuita el formulario se completa, ' +
      'pero al guardar el sistema no crea la entidad y avisa que los procesos inteligentes requieren el plan ' +
      'Professional o el Enterprise; la tabla comparativa del fabricante los lista entre las funciones que ese ' +
      'plan agrega. Con el plan Professional la entidad se crea igual que se hace con cualquier otra ' +
      'configuración del sistema, sin programar. Sin él, lo más cercano es forzar el concepto dentro de una ' +
      'negociación con campos propios, que no es una entidad nueva.',
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
  expect(tipos, 'si hubiera un campo de fórmula, este veredicto no corresponde').not.toMatch(/F[oó]rmula|Calculad/i);
  await page.keyboard.press('Escape');
  await cerrarPaneles(page);

  // El cálculo lo hacen las reglas de automatización: «Ejecutar operaciones matemáticas» y «Modificar elemento»
  await abrirReglas(page);
  await panel(page).locator('span.bizproc-automation-robot-btn-add').first().click();
  await page.waitForTimeout(3000);
  const grupo = panel(page).getByText('Almacenamiento y modificación de los datos', { exact: true }).first();
  await grupo.scrollIntoViewIfNeeded();
  await grupo.click();
  await page.waitForTimeout(2500);
  const capCatalogo = await capturar(page, 'A.8.2', plataforma, '2-reglas-de-calculo');
  const catalogo = await textoDe(page);
  expect(catalogo).toMatch(/Ejecutar operaciones matemáticas/);
  await panel(page).getByText('Ejecutar operaciones matemáticas', { exact: true })
    .locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
  await page.waitForTimeout(5000);
  const capRegla = await capturar(page, 'A.8.2', plataforma, '3-regla-matematica');

  const fuentes = [
    await citar(browser, {
      url: 'https://helpdesk.bitrix24.com/open/14954920/',
      buscar: 'This automation rule updates a variable with the result of a math operation',
      captura: 'A-8-2-bitrix24-4-operaciones-matematicas',
    }),
    await citar(browser, {
      url: 'https://helpdesk.bitrix24.com/open/22396442/',
      buscar: 'When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity',
      captura: 'A-8-2-bitrix24-5-modificar-elemento',
    }),
  ];
  // La regla queda sin guardar: la prueba solo recorre el catálogo y la pantalla de la regla
  await panel(page).getByText(/^cancelar$/i).last().click();
  await page.waitForTimeout(1000);
  await cerrarReglas(page);

  registrar({
    criterio: 'A.8.2',
    plataforma,
    cumple: 1,
    justificacion:
      'Bitrix24 no tiene campos calculados: entre los tipos de campo que ofrece el formulario —cadena, lista, ' +
      'fecha, dinero, número y los adicionales— ninguno deriva su valor de otro. El cálculo se arma con reglas de ' +
      'automatización de la negociación: «Ejecutar operaciones matemáticas» suma, resta, multiplica o divide ' +
      'campos numéricos y deja el resultado en una variable, y «Modificar elemento» lo escribe en el campo ' +
      'destino. Son dos reglas configuradas sin código, pero según el fabricante corren cuando la negociación ' +
      'llega a una etapa, no cada vez que se guarda un dato: el valor derivado no acompaña por sí solo a una ' +
      'prima corregida después. La necesidad se resuelve con esa salvedad permanente. La prueba recorrió los ' +
      'tipos de campo, el catálogo de reglas y la pantalla de la regla matemática; no llegó a ejecutar el ' +
      'cálculo.',
    evidencia: [capTipos, capCatalogo, capRegla],
    documentacion: fuentes,
    medicion: 'Sin campo calculado; cálculo por dos reglas de automatización',
  });
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
      justificacion:
        'Las reglas de automatización de la negociación se arman desde la pantalla, sin código: se elige la etapa, ' +
        'la acción —comunicar, crear tareas, modificar campos, dejar comentarios— y el momento. Se definió una que ' +
        'deja un comentario en el historial al llegar a «En progreso». Para provocar el evento se abrió una póliza ' +
        'desde el listado y se la pasó a esa etapa con un clic en la barra de etapas de su ficha: sin que nadie ' +
        `hiciera nada más, el comentario «${TEXTO}» apareció en el historial de la póliza. La edición gratuita ` +
        `admite hasta ${limite} reglas y disparadores en total: con las de muestra del portal dejadas en ` +
        `${previas}, la regla entra. Definir cada regla es configuración de una vez.`,
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
    await citar(browser, {
      url: COMPARACION,
      buscar: 'Servicio ininterrumpido durante las actualizaciones del sistema y de la infraestructura',
      captura: 'A-8-4-bitrix24-2-servicio-ininterrumpido',
    }),
  ];

  // Lo que la compañía parametrizó está hecho por pantalla y sigue en el portal, que el fabricante actualiza solo
  await entrar(page, plataforma);
  const campos = (await camposDeNegociacion(page)).map(c => c.etiqueta);
  await altaDeNegociacion(page);
  await panelListo(page, 'Ramo');
  const capCampos = await capturar(page, 'A.8.4', plataforma, '3-parametrizacion-por-pantalla');
  await cerrarPaneles(page);
  console.log(`    campos propios en el portal: ${campos.join(', ')}`);

  expect(campos, 'la parametrización evaluada debe estar en el portal').toEqual(expect.arrayContaining(['Ramo', 'Estado de cobranza', 'Prima']));

  registrar({
    criterio: 'A.8.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El portal es un servicio en la nube que el fabricante actualiza por su cuenta: la compañía no aplica ' +
      'ningún procedimiento ni elige el momento, y el fabricante afirma que el servicio no se interrumpe durante ' +
      'las actualizaciones. Los campos, las listas y las monedas que este análisis creó desde la pantalla ' +
      'están guardados como datos del portal y siguen ahí, en el formulario, sin que nadie los rehaga. El ' +
      'fabricante no publica una frase que garantice expresamente que la parametrización se conserva al ' +
      'actualizar: la conclusión se apoya en que actualiza el servicio de todos sus clientes a la vez y en que ' +
      'lo parametrizado es información del portal y no código de la compañía.',
    evidencia: [capCampos],
    documentacion: fuentes,
    medicion: `Campos propios del portal: ${campos.length}`,
  });
});
