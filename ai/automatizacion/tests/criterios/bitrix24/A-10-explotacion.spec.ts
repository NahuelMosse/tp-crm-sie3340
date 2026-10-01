import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC_VIBE, BITRIX24_STANDARD, constanciaDe, conPlanDe } from '../../precios';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { menuLateral, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { rest, textoDe, campoDeNegociacion, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import {
  comparativo, CODIGOS, asistenteDeInformes, crearInforme, resultadoDeInforme, borrarInformes, aplicarPeriodo, irAInformes, menuAplicaciones,
} from '../../bitrix24/negociaciones-a4';

/**
 * A.10 — Explotación de la información, sobre Bitrix24
 *
 * Los informes se arman con el asistente de informes del CRM; el intercambio
 * con otros sistemas, con los webhooks de la interfaz de programación.
 */

test.describe.configure({ mode: 'serial' });

type Pagina = import('@playwright/test').Page;

/** Las negociaciones de estas pruebas llevan este prefijo, y los informes también. */
const PREFIJO = 'POL-INF-';

/**
 * Cinco pólizas de prueba, con su estado de cobranza, su productor y su fecha de inicio. La prima va
 * en el importe de la negociación, en dólares: el informe expresa todo en la moneda del portal.
 */
async function prepararPolizas(page: Pagina) {
  let estado = await campoDeNegociacion(page, 'Estado de cobranza');
  if (!estado) {
    await rest(page, 'crm.deal.userfield.add', { fields: {
      FIELD_NAME: 'ESTADO_COBRANZA', USER_TYPE_ID: 'enumeration', EDIT_FORM_LABEL: { la: 'Estado de cobranza' },
      LIST_COLUMN_LABEL: { la: 'Estado de cobranza' }, LIST: ['Al día', 'Vencida', 'En gestión'].map((v, i) => ({ VALUE: v, SORT: 10 * (i + 1) })),
    } });
    estado = await campoDeNegociacion(page, 'Estado de cobranza');
  }
  if (!(await campoDeNegociacion(page, 'Prima'))) {
    await rest(page, 'crm.deal.userfield.add', { fields: {
      FIELD_NAME: 'PRIMA', USER_TYPE_ID: 'money', EDIT_FORM_LABEL: { la: 'Prima' }, LIST_COLUMN_LABEL: { la: 'Prima' },
    } });
  }
  const idDe = (v: string) => estado.LIST.find((l: any) => l.VALUE === v).ID;
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}`));
  const usuarios = (await rest<any[]>(page, 'user.get', { filter: { ACTIVE: true } }));
  const u1 = usuarios.find(u => String(u.ID) === '1')!;
  const u2 = usuarios.find(u => String(u.ID) !== '1')!;
  const datos: [number, string, any, string][] = [
    [300, 'Al día', u1, '2026-01-15'], [600, 'Al día', u1, '2026-03-10'], [300, 'Vencida', u2, '2026-08-20'],
    [900, 'En gestión', u2, '2026-09-05'], [300, 'Vencida', u1, '2026-09-10'],
  ];
  for (const [i, [monto, est, u, inicio]] of datos.entries()) {
    await rest(page, 'crm.deal.add', { fields: {
      TITLE: `${PREFIJO}${i + 1}`, OPPORTUNITY: monto, CURRENCY_ID: 'USD', ASSIGNED_BY_ID: u.ID, BEGINDATE: inicio, CLOSEDATE: inicio,
      [estado.FIELD_NAME]: idDe(est),
    } });
  }
  return { estado, nombre: (u: any) => `${u.NAME} ${u.LAST_NAME}`.trim(), u1, u2 };
}

/** Lo que el informe debería mostrar: la suma del importe de todas las negociaciones, agrupada. */
async function totalesEsperados(page: Pagina, estado: any, agrupar: 'estado' | 'productor', periodo?: [string, string]) {
  const usuarios = await rest<any[]>(page, 'user.get', {});
  // El informe expresa todo en la moneda base del portal: cada importe se convierte con la cotización vigente
  const factor: Record<string, number> = {};
  for (const m of await rest<any[]>(page, 'crm.currency.list')) factor[m.CURRENCY] = Number(m.AMOUNT) / Number(m.AMOUNT_CNT || 1);
  const todas = await negociaciones(page, /./, ['ID', 'TITLE', 'OPPORTUNITY', 'CURRENCY_ID', 'ASSIGNED_BY_ID', 'BEGINDATE', estado.FIELD_NAME]);
  const salida: Record<string, number> = {};
  for (const n of todas) {
    const inicio = String(n.BEGINDATE ?? '').slice(0, 10);
    if (periodo && !(inicio >= periodo[0] && inicio <= periodo[1])) continue;
    const grupo = agrupar === 'estado'
      ? estado.LIST.find((l: any) => String(l.ID) === String(n[estado.FIELD_NAME]))?.VALUE
      : (u => u ? `${u.NAME} ${u.LAST_NAME}`.trim() : undefined)(usuarios.find(u => String(u.ID) === String(n.ASSIGNED_BY_ID)));
    if (!grupo) continue;
    salida[grupo] = Math.round(((salida[grupo] ?? 0) + Number(n.OPPORTUNITY ?? 0) * (factor[n.CURRENCY_ID] ?? 1)) * 100) / 100;
  }
  return salida;
}

// ── A.10.1 ───────────────────────────────────────────────────────────────────
test('A.10.1 — Indicadores sobre la operación', async ({ page, browser }, info) => {
  // «Construir vistas que muestren el total de primas por estado de cobranza y
  //  el tiempo promedio de resolución de los reclamos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const e = await prepararPolizas(page);
  await borrarInformes(page, PREFIJO);

  // El total de primas por estado de cobranza: un informe de negociaciones con la suma del importe
  await asistenteDeInformes(page, {
    nombre: `${PREFIJO}Primas por estado de cobranza`,
    agregar: [{ campo: 'Estado de cobranza' }, { campo: 'Total', calculo: 'SUM' }],
    quitar: ['Nombre', 'Etapa de la negociación', 'Persona responsable', 'Fecha de inicio'],
    periodo: 'todo',
  });
  const capAsistente = await capturar(page, 'A.10.1', plataforma, '1-armado-del-informe');
  await crearInforme(page);
  const mostrado = await resultadoDeInforme(page);
  const capPrimas = await capturar(page, 'A.10.1', plataforma, '2-primas-por-estado');
  const esperado = await totalesEsperados(page, e.estado, 'estado');

  // El tiempo de resolución: lo que el asistente ofrece calcular sobre las fechas de una negociación
  await asistenteDeInformes(page, {
    nombre: `${PREFIJO}Tiempo de resolución`,
    agregar: [{ campo: 'Creado el' }, { campo: 'Presunta fecha de finalización' }, { campo: 'Prima' }],
    quitar: ['Nombre', 'Etapa de la negociación', 'Persona responsable', 'Fecha de inicio'],
  });
  const opciones: Record<string, string[]> = {};
  for (const campo of ['Creado el', 'Presunta fecha de finalización', 'Prima']) {
    const fila = page.locator('.reports-add-col-title').filter({ visible: true }).filter({ hasText: campo }).first();
    await fila.locator('xpath=preceding::input[@type="checkbox"][1]').check({ force: true });
    await page.waitForTimeout(600);
    opciones[campo] = await fila.locator('select.reports-add-col-select-calc').evaluate((s: HTMLSelectElement) => [...s.options].map(o => o.text));
  }
  const capFechas = await capturar(page, 'A.10.1', plataforma, '3-calculos-sobre-fechas');

  // Los paneles de analítica del CRM piden otro plan
  await menuLateral(page, 'CRM');
  await page.locator('a, span').filter({ hasText: /^Analítica$/ }).filter({ visible: true }).first().hover();
  await page.waitForTimeout(1200);
  await page.locator('.menu-popup-item-text').filter({ hasText: /^Análisis de la negociación$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(7000);
  const avisoPaneles = await textoDe(page);
  const capPaneles = await capturar(page, 'A.10.1', plataforma, '4-paneles-de-analitica');
  await cerrarPaneles(page);

  const bi = await comparativo(browser, /^BI Builder Crea informes de analíticas a partir de la información del CRM/, 'A-10-1-bitrix24-5-bi-builder-por-plan');
  const formulas = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/19542946/',
    buscar: /Calculated columns: Add new fields using formulas/,
    captura: 'A-10-1-bitrix24-6-columnas-calculadas',
  });
  const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'A-10-1-bitrix24-standard');
  await borrarInformes(page, PREFIJO);

  console.log(`    esperado ${JSON.stringify(esperado)} · informe ${JSON.stringify(mostrado)} · fechas ${JSON.stringify(opciones)}`);
  for (const est of ['Al día', 'Vencida', 'En gestión']) {
    expect(mostrado[est], `el informe debe mostrar el total de ${est}`).toBeCloseTo(esperado[est], 1);
  }
  for (const [campo, ops] of Object.entries(opciones)) {
    expect(ops.join(' '), `el asistente no debe ofrecer un promedio sobre ${campo}`).not.toMatch(/Promedio/i);
  }
  expect(opciones['Prima'], 'el campo propio de dinero solo admite contarse').toEqual(['Único']);
  expect(avisoPaneles, 'los paneles de analítica piden un plan').toMatch(/BI Builder[\s\S]*a partir del Standard/);
  expect(bi.planes[CODIGOS.free]).toBe('uncheck');
  expect(bi.planes[CODIGOS.standard]).toBe('check');

  registrar({
    criterio: 'A.10.1',
    plataforma,
    cumple: 1,
    justificacion:
      'El asistente de informes del CRM, que viene en la edición gratuita, arma sin programar el total de primas por ' +
      `estado de cobranza: agrupando por el campo de lista y sumando el importe de la negociación mostró ${Object.entries(esperado).map(([k, v]) => `${k} ${v}`).join(', ')}, ` +
      'las mismas cifras que suman las negociaciones cargadas. La suma va sobre el importe nativo: el campo propio de tipo ' +
      'dinero solo admite contarse. El tiempo promedio de resolución, en cambio, no se puede mostrar: sobre las fechas ' +
      `de la negociación el asistente ofrece solo ${opciones['Creado el'].join(', ')}, sin promedio ni diferencia entre dos fechas. ` +
      'Los paneles de analítica que sí podrían medirlo piden un plan: el sistema informa que BI Builder se desbloquea ' +
      'a partir del Standard.',
    evidencia: [capAsistente, capPrimas, capFechas, capPaneles],
    documentacion: [bi.fuente, formulas, ...precio],
    medicion: `Primas por estado: ${Object.entries(mostrado).filter(([k]) => ['Al día', 'Vencida', 'En gestión'].includes(k)).map(([k, v]) => `${k} ${v}`).join(' · ')}`,
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 2,
      justificacion:
        'Con el plan Standard se habilita BI Builder, donde cada conjunto de datos de negociaciones trae las fechas de ' +
        'creación y de cierre y admite columnas calculadas con fórmulas, según el fabricante: el tiempo de resolución se ' +
        'obtiene definiendo esa columna y promediándola. Hay que escribir la fórmula, y por eso el costo es el de ' +
        'desarrollo.',
    })],
  });
});

// ── A.10.2 ───────────────────────────────────────────────────────────────────
test('A.10.2 — Generación de informes definidos por el usuario', async ({ page }, info) => {
  // «Producir un informe con el total de primas vendidas por cada productor en
  //  un período, eligiendo los criterios, y exportarlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const e = await prepararPolizas(page);
  await borrarInformes(page, PREFIJO);

  await asistenteDeInformes(page, {
    nombre: `${PREFIJO}Primas por productor`,
    agregar: [{ campo: 'Total', calculo: 'SUM' }],
    quitar: ['Nombre', 'Etapa de la negociación', 'Fecha de inicio'],
    periodo: 'rango de fecha',
  });
  // El período: septiembre hasta el 20, por la fecha de inicio de la póliza
  await page.locator('input[name="F_DATE_FROM"]').click();
  await page.locator('input[name="F_DATE_FROM"]').pressSequentially('01/09/2026');
  await page.locator('input[name="F_DATE_TO"]').click();
  await page.locator('input[name="F_DATE_TO"]').pressSequentially('20/09/2026');
  await page.keyboard.press('Escape');
  const capAsistente = await capturar(page, 'A.10.2', plataforma, '1-armado-del-informe');
  await crearInforme(page);
  const mostrado = await resultadoDeInforme(page);
  const capInforme = await capturar(page, 'A.10.2', plataforma, '2-primas-por-productor');
  const esperado = await totalesEsperados(page, e.estado, 'productor', ['2026-09-01', '2026-09-20']);

  // Exportarlo: el menú del informe ofrece Microsoft Excel
  await page.locator('button.ui-btn-icon-setting').filter({ visible: true }).first().click();
  await page.locator('.menu-popup-item').filter({ hasText: /Exportar a Microsoft Excel/ }).filter({ visible: true }).first().click();
  // El sistema arma el archivo en un proceso propio y después ofrece el enlace de descarga
  await page.getByText(/^ejecutar$/i).filter({ visible: true }).first().click();
  const enlace = page.getByText('Descargar el archivo de exportación');
  await enlace.waitFor({ state: 'visible', timeout: 120_000 });
  const capProceso = await capturar(page, 'A.10.2', plataforma, '3-archivo-listo');
  const [descarga] = await Promise.all([page.waitForEvent('download', { timeout: 60_000 }), enlace.click()]);
  const archivo = join(mkdtempSync(join(tmpdir(), 'informe-')), descarga.suggestedFilename());
  await descarga.saveAs(archivo);
  const contenido = readFileSync(archivo, 'utf8');
  const capExportado = capProceso;
  await borrarInformes(page, PREFIJO);

  const n1 = e.nombre(e.u1), n2 = e.nombre(e.u2);
  console.log(`    esperado ${JSON.stringify(esperado)} · informe ${JSON.stringify(mostrado)} · archivo ${descarga.suggestedFilename()} (${contenido.length} caracteres)`);
  expect(mostrado[n1], `total de ${n1}`).toBeCloseTo(esperado[n1], 1);
  expect(mostrado[n2], `total de ${n2}`).toBeCloseTo(esperado[n2], 1);
  expect(contenido, 'el archivo exportado debe traer a los productores').toContain(n1.split(' ')[0]);
  expect(contenido, 'el archivo exportado debe traer los totales').toContain(String(esperado[n2]));

  registrar({
    criterio: 'A.10.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El asistente de informes del CRM, incluido en la edición gratuita, armó sin programar el total de primas por ' +
      'productor en un período: se agrupó por la persona responsable, se sumó el importe de la negociación y se ' +
      'eligió el rango de fechas por la fecha de inicio de la póliza. Del 1 al 20 de septiembre el informe mostró ' +
      `${Object.entries(esperado).map(([k, v]) => `${k} ${v}`).join(' y ')}, las mismas cifras que suman las negociaciones cargadas, ` +
      'y el menú del informe lo exportó a un archivo de Microsoft Excel con esos totales. Armar el informe es ' +
      'configuración: se elige una vez y se vuelve a abrir cuando se lo necesita. La suma se hace sobre el importe ' +
      'nativo de la negociación, no sobre un campo propio de tipo dinero.',
    evidencia: [capAsistente, capInforme, capExportado],
    medicion: `Totales por productor: ${Object.entries(mostrado).map(([k, v]) => `${k} ${v}`).join(' · ')} · exportado a ${descarga.suggestedFilename()}`,
  });
});

// ── A.10.3 ───────────────────────────────────────────────────────────────────
test('A.10.3 — Informe paramétrico reutilizable', async ({ page }, info) => {
  // «Guardar un informe con el período como parámetro y volver a ejecutarlo
  //  para otro período sin rehacerlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const e = await prepararPolizas(page);
  await borrarInformes(page, PREFIJO);

  // El informe se guarda una vez, sin período fijo
  await asistenteDeInformes(page, {
    nombre: `${PREFIJO}Primas por productor y período`,
    agregar: [{ campo: 'Total', calculo: 'SUM' }],
    quitar: ['Nombre', 'Etapa de la negociación', 'Fecha de inicio'],
    periodo: 'todo',
  });
  await crearInforme(page);

  // Primera ejecución: septiembre hasta el 20
  await aplicarPeriodo(page, '01/09/2026', '20/09/2026');
  const septiembre = await resultadoDeInforme(page);
  const capSeptiembre = await capturar(page, 'A.10.3', plataforma, '1-septiembre');
  const espSeptiembre = await totalesEsperados(page, e.estado, 'productor', ['2026-09-01', '2026-09-20']);

  // El mismo informe, otro período: de enero a marzo, sin volver a armarlo
  await aplicarPeriodo(page, '01/01/2026', '31/03/2026');
  const primerTrimestre = await resultadoDeInforme(page);
  const capTrimestre = await capturar(page, 'A.10.3', plataforma, '2-primer-trimestre');
  const espTrimestre = await totalesEsperados(page, e.estado, 'productor', ['2026-01-01', '2026-03-31']);

  // Se sale al listado: el informe queda guardado, con su nombre, para la próxima vez
  await irAInformes(page);
  const guardado = page.locator('tr.reports-list-item').filter({ hasText: `${PREFIJO}Primas por productor y período` }).first();
  await expect(guardado, 'el informe debe quedar en el listado').toBeVisible();
  const capListado = await capturar(page, 'A.10.3', plataforma, '3-informe-guardado');
  await borrarInformes(page, PREFIJO);
  const n1 = e.nombre(e.u1), n2 = e.nombre(e.u2);
  console.log(`    septiembre ${JSON.stringify(septiembre)} (esperado ${JSON.stringify(espSeptiembre)}) · trimestre ${JSON.stringify(primerTrimestre)} (esperado ${JSON.stringify(espTrimestre)})`);
  expect(septiembre[n2], 'septiembre: total del segundo productor').toBeCloseTo(espSeptiembre[n2], 1);
  expect(septiembre[n1], 'septiembre: total del primer productor').toBeCloseTo(espSeptiembre[n1], 1);
  expect(primerTrimestre[n1], 'primer trimestre: total del primer productor').toBeCloseTo(espTrimestre[n1], 1);
  expect(primerTrimestre[n1], 'con otro período el informe debe dar otros totales').not.toBeCloseTo(septiembre[n1], 1);

  registrar({
    criterio: 'A.10.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El informe de primas por productor se guardó una sola vez, sin período fijo, y la pantalla del informe trae ' +
      'el período como parámetro: se ejecutó del 1 al 20 de septiembre y, sin volver a armarlo, se lo volvió a ' +
      `ejecutar del 1 de enero al 31 de marzo. Cada ejecución recalculó los totales por productor ` +
      `—${Object.entries(septiembre).map(([k, v]) => `${k} ${v}`).join(' y ')} en septiembre; ${Object.entries(primerTrimestre).map(([k, v]) => `${k} ${v}`).join(' y ')} en el primer trimestre—, ` +
      'iguales a los que suman las negociaciones. Armarlo es configuración de una vez; el período se pide cada vez ' +
      'que se abre.',
    evidencia: [capSeptiembre, capTrimestre, capListado],
    medicion: `Septiembre: ${JSON.stringify(septiembre)} · Primer trimestre: ${JSON.stringify(primerTrimestre)}`,
  });
});

// ── A.10.4 ───────────────────────────────────────────────────────────────────
/** Recursos para desarrolladores › Otro › Webhook entrante, hasta donde deja avanzar el plan. */
async function abrirWebhookEntrante(page: Pagina) {
  await menuAplicaciones(page, 'Recursos para desarrolladores');
  await panel(page).getByText('Otro', { exact: true }).first().click();
  await panel(page).getByText('Webhook entrante', { exact: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);
  await panel(page).getByText('Webhook entrante', { exact: true }).first().click();
  await page.waitForTimeout(7000);
}

test('A.10.4 — Intercambio de datos con otros sistemas de la compañía', async ({ page, browser }, info) => {
  // «Crear y consultar registros desde fuera del sistema, por la vía que la
  //  plataforma habilite»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await abrirWebhookEntrante(page);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.10.4', plataforma, '1-webhook-entrante');
  await cerrarPaneles(page);

  const api = await comparativo(browser, /^REST API Available on Vibe\+ plans/, 'A-10-4-bitrix24-2-api-por-plan');
  const webhook = await citar(browser, {
    url: 'https://apidocs.bitrix24.com/local-integrations/local-webhooks.html',
    buscar: /Quick integrations, tests, scripts, and data exchange with an external system/,
    captura: 'A-10-4-bitrix24-3-webhook-entrante',
  });
  const precio = await constanciaDe(browser, BITRIX24_BASIC_VIBE, 'A-10-4-bitrix24-basic-vibe');

  expect(aviso, 'el webhook entrante debe pedir otro plan').toMatch(/No disponible en tu plan actual/);
  expect(api.planes[CODIGOS.free]).toBe('uncheck');
  expect(api.planes[CODIGOS.basicVibe], 'el plan Basic con Vibe+ trae la API sin tope').toBe('ilimitado');

  registrar({
    criterio: 'A.10.4',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición gratuita no hay forma de crear ni consultar registros desde fuera: Recursos para desarrolladores ' +
      'ofrece «Webhook entrante», y al abrirlo el sistema responde «No disponible en tu plan actual» y remite a los ' +
      'planes Vibe+. El comparativo del fabricante lo confirma: la API REST no figura en la edición gratuita ni en ' +
      'las ediciones Essential, y en los planes Vibe+ viene sin tope. El webhook entrante es una dirección secreta ' +
      'que el otro sistema llama para ejecutar métodos de la API, con los permisos del usuario que lo crea.',
    evidencia: [capAviso],
    documentacion: [api.fuente, webhook, ...precio],
    conPlan: [conPlanDe(BITRIX24_BASIC_VIBE, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan Basic en su edición Vibe+ la API REST no tiene tope y el webhook entrante se crea desde Recursos ' +
        'para desarrolladores, sin programar: el otro sistema llama a su dirección para crear y consultar negociaciones y ' +
        'contactos. Crear el webhook y elegir sus permisos es configuración de una vez; lo que el otro sistema haga con ' +
        'él es trabajo de ese sistema.',
    })],
  });
});

// ── A.10.5 ───────────────────────────────────────────────────────────────────
test('A.10.5 — Intercambio sin límite de volumen que condicione la operación', async ({ page, browser }, info) => {
  // «Determinar si el límite de operaciones del intercambio deja holgura sobre
  //  el movimiento diario de la cartera, si se alcanza en una jornada intensa,
  //  o si impide sincronizarla»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Sin webhook no hay intercambio que medir: se llega hasta donde deja el plan
  await abrirWebhookEntrante(page);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.10.5', plataforma, '1-webhook-entrante');
  await cerrarPaneles(page);

  const limite = await citar(browser, {
    url: 'https://apidocs.bitrix24.com/limits.html',
    buscar: /At an intensity of 2 requests per second, 172,800 requests can be performed per day/,
    captura: 'A-10-5-bitrix24-2-limite-publicado',
  });
  const api = await comparativo(browser, /^REST API Available on Vibe\+ plans/, 'A-10-5-bitrix24-3-api-por-plan');
  const precio = await constanciaDe(browser, BITRIX24_BASIC_VIBE, 'A-10-5-bitrix24-basic-vibe');

  expect(aviso, 'el webhook entrante debe pedir otro plan').toMatch(/No disponible en tu plan actual/);
  expect(api.planes[CODIGOS.free]).toBe('uncheck');

  registrar({
    criterio: 'A.10.5',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición gratuita el intercambio no está disponible —el webhook entrante responde «No disponible en tu ' +
      'plan actual»—, así que no hay operaciones que sincronizar ni límite que medir: la cartera no se puede ' +
      'sincronizar con otro sistema. Donde la API existe, el fabricante publica su límite: a dos pedidos por segundo ' +
      'se pueden hacer 172.800 por día, que deja holgura de sobra sobre las 500 operaciones diarias de la cartera.',
    evidencia: [capAviso],
    documentacion: [api.fuente, limite, ...precio],
    conPlan: [conPlanDe(BITRIX24_BASIC_VIBE, {
      cumple: 2,
      costo: 0,
      justificacion:
        'Con el plan Basic en su edición Vibe+ la API REST está habilitada. El fabricante publica que el límite se ' +
        'sostiene a dos pedidos por segundo, 172.800 por día, y admite ráfagas por encima: las 500 operaciones de ' +
        'un día son el 0,3 % de ese tope y no se acercan a él en una jornada intensa. No hay nada que configurar ' +
        'para el volumen.',
    })],
  });
});
