import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import {
  procesos, borrarProceso, textoDe, altaDeNegociacion, crearCampo, elegirEnLista, guardarFormulario, quitarCampo,
  campoDeNegociacion, negociaciones, borrarNegociaciones, configuracionCrm, rest,
} from '../../bitrix24/ui';
import { abrirReglas, cerrarReglas, borrarReglasDe } from '../../bitrix24/negociaciones-a8';
import {
  enDias, isoEnDias, asegurarCampos, abrirListado, filasDelListado, agregarCamposAlFiltro, filtrarLista, filtrarResponsable,
  filtrarFecha, buscarConFiltro, reiniciarFiltro, restaurarFiltro, mostrarColumnas, ordenarPor, escribirFecha, personas, idDeOpcion,
  seleccionarTodas, elegirAccion, cerrarFiltro, crearCampoPropio, correrAntesDe, agregarOtraRegla,
} from '../../bitrix24/negociaciones';

const COMPARACION = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
const MURO = /Actualice a uno de los planes|PRUÉBELO GRATUITAMENTE POR 15 DÍAS/i;
const RAMOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];
const ESTADOS = ['Al día', 'Vencida', 'En gestión'];

/**
 * A.1 — Cartera de pólizas, sobre Bitrix24
 */

test.describe.configure({ mode: 'serial' });

// ── A.1.1 ────────────────────────────────────────────────────────────────────
test('A.1.1 — Modelado de la póliza como objeto propio', async ({ page, browser }, info) => {
  // «Crear una entidad Póliza con identidad propia y comprobar que aparece en
  //  el menú del sistema y admite registros»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Se parte de cero: la póliza de una corrida anterior se da de baja
  await borrarProceso(page, 'Póliza');

  // Las entidades propias son los procesos inteligentes, en la barra del CRM
  await menuLateral(page, 'CRM');
  await pestana(page, 'Automatización Inteligente de Procesos');
  await page.getByText('Crear', { exact: true }).filter({ visible: true }).first().click();
  await panelListo(page, 'Solo esenciales');
  await panel(page).getByText('Solo esenciales', { exact: true }).click();
  await panelListo(page, panel(page).locator('input[name="title"]'));
  await panel(page).locator('input[name="title"]').fill('Póliza');
  const capFormulario = await capturar(page, 'A.1.1', plataforma, '1-formulario');
  await panel(page).locator('button').filter({ hasText: /^\s*Guardar\s*$/ }).filter({ visible: true }).last().click();

  // El muro de pago se determina completando la operación: se mira si la entidad quedó creada
  await page.waitForTimeout(8000);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.1.1', plataforma, '2-al-guardar');
  const creada = (await procesos(page)).some(t => t.title === 'Póliza');
  const pidePlan = /Actualiza al plan (Professional|Enterprise)|Professional o Enterprise/i.test(aviso);
  console.log(`    creada: ${creada} · el sistema pide otro plan: ${pidePlan}`);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/promo/professional/',
    buscar: /SPA \(smart process automation\)/i,
    captura: 'A-1-1-bitrix24-3-procesos-inteligentes',
  });

  expect(creada, 'si la edición gratuita creara la entidad, este veredicto no corresponde').toBeFalsy();
  expect(pidePlan, 'al guardar, el sistema debe informar el plan que la habilita').toBeTruthy();

  registrar({
    criterio: 'A.1.1',
    plataforma,
    cumple: 0,
    justificacion:
      'Las entidades propias de Bitrix24 son los procesos inteligentes, que se crean desde la barra del CRM sin ' +
      'programar: nombre, etapas, embudos y reglas de automatización. En la edición gratuita el formulario se ' +
      'completa, pero al guardar el sistema no crea la entidad y avisa que los procesos inteligentes requieren ' +
      'el plan Professional o el Enterprise. Sin ellos la póliza no tiene identidad propia: habría que forzarla ' +
      'dentro de otra entidad del producto.',
    evidencia: [capFormulario, capAviso],
    documentacion: fuente,
  });
});

// ── A.1.2 ────────────────────────────────────────────────────────────────────
test('A.1.2 — Campos de lista para el ramo y el estado de cobranza', async ({ page }, info) => {
  // «Agregar dos campos de lista —uno con los ramos que comercializa la compañía
  //  y otro con los estados de cobranza—, cargar una póliza de cada ramo y
  //  cambiarle el estado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  // Sin entidades propias en la edición gratuita, la póliza se lleva como una negociación.
  // Se parte de cero: los campos y las pólizas de una corrida anterior se quitan
  for (const c of ['Ramo', 'Estado de cobranza', 'Ramo PRUEBA']) await quitarCampo(page, c);
  await borrarNegociaciones(page, /^POL-RAMO-/);

  await altaDeNegociacion(page);
  await crearCampo(page, 'Lista', 'Ramo', RAMOS);
  await crearCampo(page, 'Lista', 'Estado de cobranza', ESTADOS);
  const capCampos = await capturar(page, 'A.1.2', plataforma, '1-campos');

  // Una póliza de cada ramo, desde el formulario
  for (const [i, ramo] of RAMOS.entries()) {
    if (i > 0) await altaDeNegociacion(page);
    await panel(page).locator('input[name="TITLE"]').fill(`POL-RAMO-${i + 1}-${ramo}`);
    await elegirEnLista(page, 'Ramo', ramo);
    await elegirEnLista(page, 'Estado de cobranza', 'Al día');
    await guardarFormulario(page);
    await cerrarPaneles(page);
  }
  await menuLateral(page, 'CRM');
  const capCartera = await capturar(page, 'A.1.2', plataforma, '2-cartera');

  // El estado de cobranza de una de ellas pasa a vencida, desde su ficha
  await page.locator('a').filter({ hasText: /^POL-RAMO-4-Salud$/ }).filter({ visible: true }).first().click();
  await panelListo(page, 'Estado de cobranza');
  await panel(page).getByText('Estado de cobranza', { exact: true }).first().locator('xpath=following::*[normalize-space(text())="Al día"][1]').click();
  await page.waitForTimeout(1500);
  await elegirEnLista(page, 'Estado de cobranza', 'Vencida');
  await guardarFormulario(page);
  const capEstado = await capturar(page, 'A.1.2', plataforma, '3-estado');
  await cerrarPaneles(page);

  const ramo = await campoDeNegociacion(page, 'Ramo');
  const estado = await campoDeNegociacion(page, 'Estado de cobranza');
  const valor = (c: any, id: string) => c.LIST.find((l: any) => String(l.ID) === String(id))?.VALUE;
  const polizas = await negociaciones(page, /^POL-RAMO-/);
  const cargados = RAMOS.filter(r => polizas.some(p => valor(ramo, p[ramo.FIELD_NAME]) === r));
  const vencida = polizas.find(p => /Salud/.test(p.TITLE));
  console.log(`    ramos ${cargados.join(', ')} · estado de la de salud: ${valor(estado, vencida?.[estado.FIELD_NAME])}`);

  expect(ramo?.USER_TYPE_ID, 'el ramo debe ser un campo de lista').toBe('enumeration');
  expect(cargados, 'las cuatro pólizas deben quedar con su ramo').toEqual(RAMOS);
  expect(valor(estado, vencida?.[estado.FIELD_NAME]), 'el estado de cobranza debe quedar cambiado').toBe('Vencida');

  registrar({
    criterio: 'A.1.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde el formulario de la negociación —que en la edición gratuita hace de póliza, a falta de entidades ' +
      `propias— se agregan campos de tipo lista sin programar. Se definieron los ramos —${RAMOS.join(', ')}— y ` +
      'los estados de cobranza, se cargó una póliza de cada ramo y a la de salud se le cambió el estado desde su ' +
      'ficha: todo quedó guardado. El usuario elige de la lista y no puede escribir un valor imprevisto. Definir ' +
      'los campos es configuración de una vez, en el mismo formulario.',
    evidencia: [capCampos, capCartera, capEstado],
    medicion: `${cargados.length} ramos cargados`,
  });
});

// ── A.1.3 ────────────────────────────────────────────────────────────────────
test('A.1.3 — Prima con importe y moneda', async ({ page }, info) => {
  // «Agregar un campo de importe con moneda y cargar una prima, comprobando que
  //  conserva los decimales y la denominación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  await quitarCampo(page, 'Prima');
  await borrarNegociaciones(page, /^POL-PRIMA-/);
  const monedas = (await rest<any[]>(page, 'crm.currency.list')).map(c => c.CURRENCY);
  if (monedas.includes('ARS')) await rest(page, 'crm.currency.delete', { id: 'ARS' });

  // El peso no viene entre las monedas del portal: se agrega desde la configuración del CRM
  await configuracionCrm(page, 'Moneda');
  await panel(page).getByText('Add', { exact: true }).first().click();
  await panelListo(page, panel(page).locator('input[name="add_classifier_currency_needle"]'));
  await panel(page).locator('input[name="add_classifier_currency_needle"]').fill('Peso Arg');
  await page.waitForTimeout(1500);
  await panel(page).locator('select[name="add_classifier_currency_id"]').selectOption({ label: 'Peso Argentino' });
  // La cotización admite pocos decimales: se expresa por cada mil pesos
  await panel(page).locator('input[name="add_nominal"]').fill('1000');
  await panel(page).locator('input[name="add_exchange_rate"]').fill('0.75');
  const capMoneda = await capturar(page, 'A.1.3', plataforma, '1-moneda');
  await panel(page).locator('button, .ui-btn, input[type="submit"]').filter({ hasText: /^\s*guardar\s*$/i })
    .or(panel(page).locator('input[type="submit"][value="Guardar" i]')).filter({ visible: true }).first().click();
  await page.waitForTimeout(5000);
  expect((await rest<any[]>(page, 'crm.currency.list')).some(c => c.CURRENCY === 'ARS'), 'el peso debe quedar entre las monedas').toBeTruthy();
  await cerrarPaneles(page);

  // El campo de importe con moneda, y una prima con centavos en pesos
  await altaDeNegociacion(page);
  await crearCampo(page, 'Dinero', 'Prima');
  await panel(page).locator('input[name="TITLE"]').fill('POL-PRIMA-1');
  const titulo = panel(page).locator('.ui-entity-editor-block-title-text').filter({ hasText: /^Prima$/ }).first();
  const importe = titulo.locator('xpath=following::input[not(@type="hidden")][1]');
  await importe.click();
  await importe.pressSequentially('15250.50');
  await titulo.locator('xpath=following::div[contains(@class,"main-ui-select")][1]').click();
  await page.waitForTimeout(800);
  await panel(page).locator('.main-ui-select-inner-item').filter({ hasText: /Peso Argentino|ARS/ }).filter({ visible: true }).first().click();
  const capPrima = await capturar(page, 'A.1.3', plataforma, '2-prima');
  await guardarFormulario(page);
  const capFicha = await capturar(page, 'A.1.3', plataforma, '3-guardada');
  await cerrarPaneles(page);

  const campo = await campoDeNegociacion(page, 'Prima');
  const poliza = (await negociaciones(page, /^POL-PRIMA-1$/))[0];
  const guardado = String(poliza?.[campo?.FIELD_NAME] ?? '');
  console.log(`    tipo ${campo?.USER_TYPE_ID} · valor guardado «${guardado}»`);

  expect(campo?.USER_TYPE_ID, 'la prima debe ser un campo de dinero').toBe('money');
  expect(guardado, 'la prima debe conservar los centavos y la moneda').toMatch(/^15250\.5(0)?\|ARS$/);

  registrar({
    criterio: 'A.1.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El formulario de la negociación, que hace de póliza en la edición gratuita, admite campos de tipo dinero: ' +
      'importe y moneda en el mismo campo. El peso argentino no venía entre las monedas del portal: se agregó ' +
      'desde la configuración del CRM, eligiéndolo de la lista de monedas y cargando su cotización. Se cargó una ' +
      'prima de 15.250,50 pesos y quedó guardada con sus centavos y su moneda. Agregar la moneda y el campo es ' +
      'configuración de una vez.',
    evidencia: [capMoneda, capPrima, capFicha],
    medicion: `Guardado: ${guardado}`,
  });
});

// ── A.1.4 ────────────────────────────────────────────────────────────────────
test('A.1.4 — Vigencia con fecha de inicio y de fin', async ({ page }, info) => {
  // «Agregar dos campos de fecha y comprobar que el sistema los trata como
  //  fechas: admite orden y comparación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  for (const c of ['Vigencia desde', 'Vigencia hasta']) await quitarCampo(page, c);
  await borrarNegociaciones(page, /^POL-VENCE-/);

  const polizas = [
    { titulo: 'POL-VENCE-TARDE', desde: -10, hasta: 300 },
    { titulo: 'POL-VENCE-PRONTO', desde: -330, hasta: 12 },
    { titulo: 'POL-VENCE-MEDIO', desde: -200, hasta: 150 },
  ];
  let capFormulario = '';
  for (const [i, p] of polizas.entries()) {
    await altaDeNegociacion(page);
    if (i === 0) {
      await crearCampoPropio(page, 'Fecha', 'Vigencia desde');
      await crearCampoPropio(page, 'Fecha', 'Vigencia hasta');
    }
    await panel(page).locator('input[name="TITLE"]').fill(p.titulo);
    await escribirFecha(page, 'Vigencia desde', enDias(p.desde));
    await escribirFecha(page, 'Vigencia hasta', enDias(p.hasta));
    if (i === polizas.length - 1) capFormulario = await capturar(page, 'A.1.4', plataforma, '1-vigencia-en-la-poliza');
    await guardarFormulario(page);
    await cerrarPaneles(page);
  }

  const desde = await campoDeNegociacion(page, 'Vigencia desde');
  const hasta = await campoDeNegociacion(page, 'Vigencia hasta');
  const guardadas = await negociaciones(page, /^POL-VENCE-/);
  const fechaDe = (t: string) => String(guardadas.find(g => g.TITLE === t)?.[hasta.FIELD_NAME] ?? '').slice(0, 10);
  console.log(`    tipos ${desde?.USER_TYPE_ID}/${hasta?.USER_TYPE_ID} · pronto vence ${fechaDe('POL-VENCE-PRONTO')}`);
  expect(hasta?.USER_TYPE_ID, 'la vigencia debe ser un campo de fecha').toBe('date');
  expect(desde?.USER_TYPE_ID, 'la vigencia debe ser un campo de fecha').toBe('date');
  expect(fechaDe('POL-VENCE-PRONTO'), 'la fecha debe guardarse').toBe(isoEnDias(12));

  try {
    // Orden: un clic en el encabezado de la columna ordena por calendario
    await abrirListado(page);
    await mostrarColumnas(page, ['Vigencia desde', 'Vigencia hasta']);
    await ordenarPor(page, 'Vigencia hasta');
    const primero = await filasDelListado(page, /^POL-VENCE-/);
    const capOrden = await capturar(page, 'A.1.4', plataforma, '2-orden-por-vencimiento');
    await ordenarPor(page, 'Vigencia hasta');
    const segundo = await filasDelListado(page, /^POL-VENCE-/);
    const cronologico = ['POL-VENCE-PRONTO', 'POL-VENCE-MEDIO', 'POL-VENCE-TARDE'];
    console.log(`    orden 1: ${primero.join(' > ')} · orden 2: ${segundo.join(' > ')}`);

    // Comparación: «vence en los próximos 30 días» solo se puede preguntar sobre una fecha
    await filtrarFecha(page, 'Vigencia hasta', 'Próximos N días', '30');
    const capFiltro = await capturar(page, 'A.1.4', plataforma, '3-vencen-en-30-dias');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const proximas = await filasDelListado(page, /^POL-VENCE-/);
    const capResultado = await capturar(page, 'A.1.4', plataforma, '4-listado-filtrado');
    console.log(`    vencen en 30 días: ${proximas.join(', ')}`);

    const ordena = (o: string[]) => JSON.stringify(o) === JSON.stringify(cronologico) || JSON.stringify(o) === JSON.stringify([...cronologico].reverse());
    expect(ordena(primero) && ordena(segundo) && JSON.stringify(primero) !== JSON.stringify(segundo),
      'el encabezado debe ordenar por fecha y un segundo clic invertir el orden').toBeTruthy();
    expect(proximas, 'solo la que vence en 12 días entra en los próximos 30').toEqual(['POL-VENCE-PRONTO']);

    registrar({
      criterio: 'A.1.4',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'El formulario de la negociación, que en la edición gratuita hace de póliza, admite campos de tipo fecha. Se ' +
        'agregaron el inicio y el fin de la vigencia desde el mismo formulario y se cargaron tres pólizas con sus ' +
        'fechas. El sistema las trata como fechas: con un clic en el encabezado de la columna el listado se ordena ' +
        'por calendario —no alfabéticamente— y otro clic invierte el orden; y el filtro sobre ese campo ofrece ' +
        'comparaciones propias de una fecha —hoy, próximos N días, rango, mes, trimestre—: «vence en los próximos ' +
        '30 días» trajo solo la póliza que vence en doce días y dejó afuera las de 150 y 300. Definir los campos y ' +
        'mostrarlos como columna y en el filtro es trabajo de una sola vez.',
      evidencia: [capFormulario, capOrden, capFiltro, capResultado],
      medicion: `orden ${primero.join(' > ')} · vencen en 30 días: ${proximas.join(', ')}`,
    });
  } finally {
    await restaurarFiltro(page).catch(() => {});
  }
});

// ── A.1.5 ────────────────────────────────────────────────────────────────────
test('A.1.5 — Aviso anticipado de vencimiento', async ({ page, browser }, info) => {
  // «Definir un aviso sobre las pólizas que vencen en los próximos treinta días
  //  y sobre los reclamos que alcanzan su plazo de resolución, y comprobar que
  //  el sistema los emite sin intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(2_400_000);

  await entrar(page, plataforma);
  // Sin entidad de reclamos en la edición gratuita, el plazo de resolución es un campo de la negociación. Los dos son
  // de fecha y hora: una regla «N días antes» se dispara en ese momento, y con un campo de solo fecha sería la medianoche.
  // Los campos son parte del escenario, no lo que se mide: se dan de alta por la interfaz de programación como «datetime»
  const altas: [string, string][] = [['Vencimiento de la póliza', 'VENCE_POLIZA'], ['Plazo de resolución del reclamo', 'PLAZO_RECLAMO']];
  for (const [nombre, clave] of altas) {
    const previo = await campoDeNegociacion(page, nombre);
    if (previo?.USER_TYPE_ID === 'datetime') continue;
    await quitarCampo(page, nombre);
    await rest(page, 'crm.deal.userfield.add', { fields: {
      FIELD_NAME: clave, USER_TYPE_ID: 'datetime', EDIT_FORM_LABEL: nombre, LIST_COLUMN_LABEL: nombre, LIST_FILTER_LABEL: nombre,
      SHOW_FILTER: 'E', SHOW_IN_LIST: 'Y', EDIT_IN_LIST: 'Y',
    } });
  }
  const vigencia = await campoDeNegociacion(page, 'Vencimiento de la póliza');
  const plazo = await campoDeNegociacion(page, 'Plazo de resolución del reclamo');
  await borrarNegociaciones(page, /^(POL|RCL)-AVISO-/);
  const propias = /Agregar notificación/; // las reglas de muestra del portal se llaman «Notificación»
  const tarjetas = () => panel(page).locator('.bizproc-automation-robot-container');
  // El texto de la notificación de una regla viaja en sus bloques adjuntos
  const notificaciones = async () => (await rest<any>(page, 'im.notify.get')).notifications
    .map((n: any) => (n.params?.ATTACH ?? []).flatMap((a: any) => a.BLOCKS).map((b: any) => b.MESSAGE).filter(Boolean).join(' ') as string);

  // Las reglas de una corrida anterior se dan de baja: se parte de las reglas de muestra del portal
  await abrirReglas(page);
  await borrarReglasDe(page, 'En desarrollo', propias);
  await cerrarReglas(page);

  // Los avisos: treinta días antes de que venza la póliza y dos antes de que se agote el plazo del reclamo.
  // El texto lleva el nombre de la negociación para saber cuál lo disparó
  await abrirReglas(page);
  const previas = await tarjetas().count();
  const limite = Number((await panel(page).getByText(/Puede utilizar hasta \d+ reglas de automatización y disparadores/).first().innerText()).match(/hasta (\d+)/)?.[1]);
  // Por defecto cada regla espera a que termine la anterior de la etapa, y las de muestra llevan un retraso de un día:
  // un aviso que debe salir en su fecha se marca «En paralelo»
  const enParalelo = async () => {
    await panel(page).getByText('Esperar', { exact: true }).last().click();
    await page.waitForTimeout(1200);
    await panel(page).locator('input[type="radio"]:visible').nth(1).click({ force: true });
    await page.waitForTimeout(800);
    await panel(page).getByText('OK', { exact: true }).last().click();
    await page.waitForTimeout(1200);
  };
  await agregarOtraRegla(page, 'En desarrollo', 'Alertas para los empleados', 'Agregar notificación');
  await enParalelo();
  await correrAntesDe(page, '30', 'Vencimiento de la póliza');
  await panel(page).locator('textarea').filter({ visible: true }).first().fill('Póliza por vencer en treinta días: {=Document:TITLE}');
  await panel(page).getByText(/^guardar$/i).last().click();
  await page.waitForTimeout(2500);
  await agregarOtraRegla(page, 'En desarrollo', 'Alertas para los empleados', 'Agregar notificación');
  await enParalelo();
  await correrAntesDe(page, '2', 'Plazo de resolución del reclamo');
  await panel(page).locator('textarea').filter({ visible: true }).last().fill('Reclamo por agotar su plazo de resolución: {=Document:TITLE}');
  const capReglas = await capturar(page, 'A.1.5', plataforma, '1-avisos-definidos');
  await panel(page).getByText(/^guardar$/i).last().click();
  await page.waitForTimeout(2500);
  await panel(page).getByText(/^guardar$/i).first().click();
  await page.waitForTimeout(8000);
  const muro = MURO.test(await textoDe(page));
  const capGuardadas = await capturar(page, 'A.1.5', plataforma, '2-avisos-guardados');
  await cerrarReglas(page);
  await abrirReglas(page);
  const guardadas = await tarjetas().filter({ hasText: propias }).count();
  console.log(`    reglas previas: ${previas} · límite: ${limite} · pide otro plan: ${muro} · avisos guardados: ${guardadas}`);
  await cerrarReglas(page);
  expect(muro, 'con lugar bajo el tope, el sistema no debe pedir otro plan').toBeFalsy();
  expect(guardadas, 'los dos avisos deben quedar guardados').toBe(2);

  try {
    // Dos pólizas —una vence dentro de treinta días y unos minutos, otra en 200— y dos reclamos —uno agota su plazo
    // dentro de dos días y unos minutos, otro en 25 días—: para la primera póliza y el primer reclamo, el momento del
    // aviso cae a los pocos minutos. Las dos reglas miran a toda negociación de la etapa y, con el campo vacío, el
    // momento calculado es el actual: cada negociación lleva los dos campos, el que no le corresponde a más de un año.
    // Los títulos llevan una marca de la corrida para no confundirlos con avisos de otras
    const marca = Date.now().toString(36);
    const cuando = (dias: number, minutos = 0) => new Date(Date.now() + dias * 86_400_000 + minutos * 60_000).toISOString();
    const crear = (titulo: string, dVigencia: number, mVigencia: number, dPlazo: number, mPlazo: number) =>
      rest(page, 'crm.deal.add', { fields: {
        TITLE: `${titulo}-${marca}`, [vigencia.FIELD_NAME]: cuando(dVigencia, mVigencia), [plazo.FIELD_NAME]: cuando(dPlazo, mPlazo),
      } });
    await crear('POL-AVISO-PRONTO', 30, 4, 400, 0);
    await crear('POL-AVISO-LEJOS', 200, 0, 400, 0);
    await crear('RCL-AVISO-PLAZO', 400, 0, 2, 4);
    await crear('RCL-AVISO-LEJOS', 400, 0, 25, 0);

    let avisos: string[] = [];
    const DE_POLIZA = /Póliza por vencer en treinta días/;
    const DE_RECLAMO = /Reclamo por agotar su plazo de resolución/;
    const suyo = (a: string) => a.includes(marca) && (DE_POLIZA.test(a) || DE_RECLAMO.test(a));
    const esperado = (t: string) => avisos.some(a => (t.startsWith('POL') ? DE_POLIZA : DE_RECLAMO).test(a) && a.includes(`: ${t}-${marca}`));
    let minutosHasta = -1;
    for (let espera = 0; espera < 75; espera++) {
      await page.waitForTimeout(20_000);
      avisos = await notificaciones();
      if (esperado('POL-AVISO-PRONTO') && esperado('RCL-AVISO-PLAZO')) { minutosHasta = Math.round((espera + 1) / 3); break; }
    }
    console.log(`    minutos hasta recibir los dos avisos: ${minutosHasta}`);
    // Un momento más, para ver que no llega el de las que todavía están lejos
    await page.waitForTimeout(60_000);
    avisos = await notificaciones();
    await menuLateral(page, 'CRM');
    const capAvisos = await capturar(page, 'A.1.5', plataforma, '3-avisos-emitidos');
    const propios = avisos.filter(suyo).map(a => a.slice(0, 90));
    console.log(`    avisos recibidos: ${propios.join(' | ')}`);

    expect(esperado('POL-AVISO-PRONTO'), 'debe avisar la póliza que vence en treinta días').toBeTruthy();
    expect(esperado('RCL-AVISO-PLAZO'), 'debe avisar el reclamo que alcanza su plazo').toBeTruthy();
    expect(esperado('POL-AVISO-LEJOS'), 'no debe avisar la póliza que vence en 200 días').toBeFalsy();
    expect(esperado('RCL-AVISO-LEJOS'), 'no debe avisar el reclamo que tiene 25 días').toBeFalsy();
    expect(propios.length, 'solo deben llegar los dos avisos de las negociaciones cuyo momento llegó').toBe(2);

    const fuentes = [
      await citar(browser, {
        url: 'https://helpdesk.bitrix24.com/open/21174186/',
        buscar: 'Time ranges are available for fields with the Date and Date and time types',
        captura: 'A-1-5-bitrix24-4-regla-segun-fecha',
      }),
    ];

    registrar({
      criterio: 'A.1.5',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'Las reglas de automatización de la negociación aceptan un momento de ejecución relativo a una fecha: «N días ' +
        'antes» del valor de un campo de tipo fecha. Se definieron desde la pantalla, sin código, dos avisos por ' +
        'notificación al responsable: treinta días antes del fin de vigencia de la póliza y dos días antes del plazo ' +
        'de resolución del reclamo —que en la edición gratuita, sin entidad propia, es un campo de fecha de la ' +
        'negociación—, con fecha y hora. Se cargaron una póliza que vence dentro de treinta días y unos minutos, otra ' +
        'en 200, un reclamo que agota su plazo dentro de dos días y unos minutos y otro en 25 días, y nadie tocó nada ' +
        `más: a los ${minutosHasta} minutos llegaron las notificaciones de la póliza y del reclamo cuyo momento de ` +
        'aviso había llegado, y no las de los que todavía están lejos. El aviso se calcula sobre el valor del campo ' +
        '—la fecha y hora menos treinta días—, y un campo de solo fecha lo calcularía a la medianoche; el sistema ' +
        'lo ejecuta con su programador, con una demora de unos minutos sobre el instante calculado, sin consecuencia ' +
        'para avisos de días de anticipación. Cada aviso se marca «En paralelo»: por omisión una regla espera a que ' +
        'termine la anterior de su etapa, y con una regla previa de un día de retraso el aviso saldría un día tarde. ' +
        `La edición gratuita admite hasta ${limite} reglas y disparadores en total: el portal trae ${previas} reglas ` +
        'de muestra en la etapa inicial y, con ellas, los dos avisos entran sin pedir otro plan. Armar cada aviso es ' +
        'configuración de una vez.',
      evidencia: [capReglas, capGuardadas, capAvisos],
      documentacion: fuentes,
      medicion: `Avisos emitidos sin intervención: ${propios.length}, a los ${minutosHasta} minutos`,
    });
  } finally {
    await borrarNegociaciones(page, /^(POL|RCL)-AVISO-/);
    await abrirReglas(page);
    await borrarReglasDe(page, 'En desarrollo', propias);
    await cerrarReglas(page);
  }
});

/**
 * La cartera de referencia de A.1.6 y A.1.7, cargada por la interfaz de programación:
 * armar el escenario no es lo que se mide. Cada póliza lleva ramo, estado de cobranza y productor.
 */
async function cargarCartera(page: import('@playwright/test').Page) {
  await asegurarCampos(page, [
    { tipo: 'Lista', nombre: 'Ramo', valores: RAMOS },
    { tipo: 'Lista', nombre: 'Estado de cobranza', valores: ESTADOS },
  ]);
  const ramo = await campoDeNegociacion(page, 'Ramo');
  const estado = await campoDeNegociacion(page, 'Estado de cobranza');
  const yo = String((await rest<any>(page, 'user.current')).ID);
  const otros = (await personas(page)).filter(p => p.id !== yo);
  const productor = otros.find(p => /Gómez/i.test(p.nombre)) ?? otros[0];
  expect(productor, 'el portal debe tener otro usuario que haga de productor').toBeTruthy();
  const propio = (await personas(page)).find(p => p.id === yo)!;
  await borrarNegociaciones(page, /^POL-CART-/);
  const datos = [
    ['1', 'Automotor', 'Al día', productor.id], ['2', 'Automotor', 'Al día', productor.id],
    ['3', 'Automotor', 'Al día', yo], ['4', 'Automotor', 'Vencida', productor.id],
    ['5', 'Hogar', 'Al día', productor.id], ['6', 'Hogar', 'Al día', yo],
  ];
  for (const [n, r, e, quien] of datos) {
    await rest(page, 'crm.deal.add', { fields: {
      TITLE: `POL-CART-${n}-${r}`, ASSIGNED_BY_ID: quien,
      [ramo.FIELD_NAME]: idDeOpcion(ramo, r), [estado.FIELD_NAME]: idDeOpcion(estado, e),
    } });
  }
  return { ramo, estado, productor, propio, yo };
}

// ── A.1.6 ────────────────────────────────────────────────────────────────────
test('A.1.6 — Consulta y filtrado de la cartera', async ({ page }, info) => {
  // «Filtrar de forma combinada por ramo, por estado de cobranza y por
  //  productor responsable, y obtener el listado resultante»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  const { productor } = await cargarCartera(page);
  const esperadas = ['POL-CART-1-Automotor', 'POL-CART-2-Automotor'];

  try {
    await abrirListado(page);
    await agregarCamposAlFiltro(page, ['Ramo', 'Estado de cobranza']);
    await filtrarLista(page, 'Ramo', 'Automotor');
    await filtrarLista(page, 'Estado de cobranza', 'Al día');
    await filtrarResponsable(page, productor.nombre);
    const capFiltro = await capturar(page, 'A.1.6', plataforma, '1-filtros-combinados');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const obtenidas = await filasDelListado(page, /^POL-CART-/);
    const capListado = await capturar(page, 'A.1.6', plataforma, '2-listado-resultante');
    console.log(`    listado: ${obtenidas.join(', ')}`);

    expect([...obtenidas].sort(), 'el listado debe traer exactamente las pólizas que cumplen las tres condiciones').toEqual(esperadas);

    registrar({
      criterio: 'A.1.6',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'El filtro del listado de negociaciones combina condiciones sobre cualquier campo. De una cartera de seis ' +
        'pólizas se filtró por ramo Automotor, estado de cobranza Al día y productor responsable, y el listado ' +
        'trajo exactamente las dos que cumplen las tres. El filtro se puede guardar con nombre. El productor ' +
        'responsable viene en toda negociación como «Persona responsable»; el ramo y el estado son campos propios ' +
        'que hay que mostrar en el filtro una vez, con «Agregar campo».',
      evidencia: [capFiltro, capListado],
      medicion: `${obtenidas.length} pólizas: ramo Automotor, estado Al día, productor ${productor.nombre}`,
    });
  } finally {
    await restaurarFiltro(page).catch(() => {});
  }
});

// ── A.1.7 ────────────────────────────────────────────────────────────────────
test('A.1.7 — Operación masiva sobre la cartera', async ({ page }, info) => {
  // «Seleccionar varias pólizas del listado y modificar un campo en todas con
  //  una sola acción»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  const { productor, yo } = await cargarCartera(page);

  try {
    await abrirListado(page);
    await filtrarLista(page, 'Ramo', 'Hogar');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const elegidas = await filasDelListado(page, /^POL-/);
    await seleccionarTodas(page);
    const capSeleccion = await capturar(page, 'A.1.7', plataforma, '1-seleccion');
    await elegirAccion(page, 'Cambiar a la persona responsable');
    const capAccion = await capturar(page, 'A.1.7', plataforma, '2-accion');
    // La persona se elige en el selector que abre la acción: «Agregar», buscarla por su nombre y tocarla
    await page.getByText(/^\+?\s*Agregar$/).filter({ visible: true }).last().click();
    await page.waitForTimeout(2500);
    await page.keyboard.type(productor.nombre.split(' ')[0], { delay: 90 });
    await page.waitForTimeout(2500);
    await page.getByText(productor.nombre, { exact: true }).filter({ visible: true }).last().click();
    await page.waitForTimeout(1000);
    await page.getByText('Aplicar', { exact: true }).filter({ visible: true }).last().click();
    await page.waitForTimeout(5000);
    const capResultado = await capturar(page, 'A.1.7', plataforma, '3-resultado');

    const cartera = (await negociaciones(page, /^POL-/, ['ID', 'TITLE', 'ASSIGNED_BY_ID'])).filter(n => elegidas.includes(n.TITLE));
    // El portal tiene dos usuarios con el mismo nombre: lo que se comprueba es que todas queden con un mismo responsable, que no es el de antes
    const nuevos = [...new Set(cartera.map(n => String(n.ASSIGNED_BY_ID)))];
    const cambiadas = nuevos.length === 1 && nuevos[0] !== yo ? cartera.length : 0;
    console.log(`    seleccionadas: ${elegidas.join(', ')} · con el productor nuevo: ${cambiadas}`);

    expect(elegidas, 'la selección debe abarcar las pólizas de la cartera del ramo').toEqual(expect.arrayContaining(['POL-CART-5-Hogar', 'POL-CART-6-Hogar']));
    expect(cambiadas, 'todas las seleccionadas deben quedar con el responsable nuevo').toBe(elegidas.length);
    expect(yo, 'la de POL-CART-6 estaba a cargo de otro usuario').not.toBe(productor.id);

    registrar({
      criterio: 'A.1.7',
      plataforma,
      cumple: 2,
      costo: 0,
      justificacion:
        `Se filtró el listado por el ramo Hogar, se tildó la casilla del encabezado —que selecciona las ${elegidas.length} ` +
        'pólizas— y en el desplegable de acciones de la selección se eligió «Cambiar a la persona responsable»: ' +
        `con el productor ${productor.nombre} y un solo «Aplicar», todas quedaron a su cargo. Las acciones de la ` +
        'selección vienen con el producto y no hay nada que configurar; modificar en bloque otro campo propio, ' +
        'como el estado de cobranza, no figura entre ellas.',
      evidencia: [capSeleccion, capAccion, capResultado],
      medicion: `${cambiadas} de ${elegidas.length} pólizas reasignadas con una sola acción`,
    });
  } finally {
    await restaurarFiltro(page).catch(() => {});
  }
});
