import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_STANDARD, constanciaDe, conPlanDe } from '../../precios';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import {
  rest, textoDe, altaDeNegociacion, crearCampo, elegirEnLista, guardarFormulario, quitarCampo, campoDeNegociacion,
  negociaciones, borrarNegociaciones,
} from '../../bitrix24/ui';
import { comparativo, listadoDeContactos, menuAplicaciones, crearCampoA4, CODIGOS } from '../../bitrix24/negociaciones-a4';

/**
 * A.4 — Marketing, segmentación y reputación, sobre Bitrix24
 */

test.describe.configure({ mode: 'serial' });

const SEGMENTO = 'Asegurados por recomendación';

/** Los contactos del listado, por nombre completo. */
const filasDeContactos = async (page: import('@playwright/test').Page) =>
  (await page.locator('.main-grid-row a[href*="/crm/contact/details/"]').filter({ visible: true }).allTextContents())
    .map(t => t.trim()).filter(Boolean).sort();

// ── A.4.1 ────────────────────────────────────────────────────────────────────
test('A.4.1 — Segmentación reutilizable de la cartera', async ({ page }, info) => {
  // «Definir un conjunto de asegurados por un criterio, guardarlo con nombre y
  //  volver a abrirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  // Escenario: cinco asegurados con distinto origen. Lo que se mide es el filtro guardado
  for (const c of await rest<any[]>(page, 'crm.contact.list', { filter: { '%NAME': 'SEG-A4' }, select: ['ID'] })) {
    await rest(page, 'crm.contact.delete', { id: c.ID });
  }
  const origenes = [['Uno', 'RECOMMENDATION'], ['Dos', 'RECOMMENDATION'], ['Tres', 'WEB'], ['Cuatro', 'CALL'], ['Cinco', 'RECOMMENDATION']];
  for (const [n, s] of origenes) {
    await rest(page, 'crm.contact.add', { fields: { NAME: `SEG-A4 ${n}`, LAST_NAME: 'Asegurado', SOURCE_ID: s } });
  }
  const todos = await rest<any[]>(page, 'crm.contact.list', { select: ['ID', 'NAME', 'LAST_NAME', 'SOURCE_ID'] });
  const esperados = todos.filter(c => c.SOURCE_ID === 'RECOMMENDATION').map(c => `${c.NAME} ${c.LAST_NAME}`.trim()).sort();

  await listadoDeContactos(page);
  const filtro = page.locator('.main-ui-filter-search').first();
  const abrirFiltro = async () => {
    if (!(await page.locator('.main-ui-filter-field-add-item').first().isVisible().catch(() => false))) {
      await filtro.click();
      await page.locator('.main-ui-filter-field-add-item').first().waitFor({ state: 'visible', timeout: 15_000 });
    }
    await page.waitForTimeout(800);
  };

  // Un segmento de una corrida anterior se borra desde su propio menú
  await abrirFiltro();
  const previo = page.locator('.main-ui-filter-sidebar-item').filter({ hasText: SEGMENTO }).first();
  if (await previo.isVisible().catch(() => false)) {
    await page.locator('.main-ui-filter-add-edit').click();
    await previo.locator('.main-ui-delete').click();
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    await abrirFiltro();
  }

  // El criterio: el origen del asegurado. Es un campo que el filtro trae pero no muestra: se agrega
  if (!(await page.locator('div[data-name="SOURCE_ID"][data-params]:visible').count())) {
    await page.locator('.main-ui-filter-field-add-item').first().click();
    const lista = page.locator('.ui-checkbox-list-popup');
    await lista.getByText('Origen', { exact: true }).first().waitFor({ state: 'visible', timeout: 15_000 });
    await lista.getByText('Origen', { exact: true }).first().click();
    await lista.getByText('APLICAR').click();
    await page.waitForTimeout(2000);
  }
  await page.locator('div[data-name="SOURCE_ID"][data-params]:visible').first().click();
  await page.locator('.main-ui-select-inner-item').filter({ hasText: 'Por Recomendación' }).first().click();
  await page.waitForTimeout(800);

  // Se guarda con nombre desde el mismo filtro
  await page.getByText('Guardar filtro').first().click();
  const nombre = page.locator('input.main-ui-filter-sidebar-edit-control');
  await nombre.click();
  await nombre.pressSequentially(SEGMENTO);
  await page.waitForTimeout(500);
  await page.locator('button.main-ui-filter-save').filter({ visible: true }).first().click();
  await page.waitForTimeout(5000);
  const filtradas = await filasDeContactos(page);
  const capGuardado = await capturar(page, 'A.4.1', plataforma, '1-segmento-guardado');

  // Se sale del listado y se vuelve a abrir el segmento por su nombre
  await menuLateral(page, 'CRM');
  await listadoDeContactos(page);
  // El listado recuerda el último filtro: se vuelve a «Todos los contactos» para ver el conjunto completo
  await abrirFiltro();
  await page.locator('.main-ui-filter-sidebar-item').filter({ hasText: /^\s*Todos los contactos\s*$/ }).first().click();
  await page.waitForTimeout(5000);
  const sinFiltro = await filasDeContactos(page);
  await abrirFiltro();
  await page.locator('.main-ui-filter-sidebar-item').filter({ hasText: SEGMENTO }).first().click();
  await page.waitForTimeout(5000);
  const reabiertas = await filasDeContactos(page);
  const capReabierto = await capturar(page, 'A.4.1', plataforma, '2-segmento-reabierto');

  console.log(`    esperados ${esperados.join(', ')} · guardado ${filtradas.join(', ')} · reabierto ${reabiertas.join(', ')} · sin filtro ${sinFiltro.length}`);
  expect(filtradas, 'el filtro debe traer los asegurados recomendados').toEqual(esperados);
  expect(reabiertas, 'el segmento reabierto debe traer el mismo conjunto').toEqual(esperados);
  expect(sinFiltro.length, 'sin el segmento el listado trae más asegurados').toBeGreaterThan(esperados.length);

  registrar({
    criterio: 'A.4.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde el listado de contactos se definió un conjunto por un criterio —los asegurados que llegaron por ' +
      'recomendación— y se lo guardó con nombre desde el propio filtro, sin programar. Al salir del listado y ' +
      'volver, el segmento figura entre los filtros guardados; al abrirlo trajo de nuevo los mismos asegurados, ' +
      'y como se guarda el criterio y no la lista, uno que lo cumpla más adelante entra solo. El origen no ' +
      'viene entre los campos visibles del filtro: agregarlo es configuración de una vez.',
    evidencia: [capGuardado, capReabierto],
    medicion: `${reabiertas.length} asegurados en el segmento`,
  });
  for (const c of await rest<any[]>(page, 'crm.contact.list', { filter: { '%NAME': 'SEG-A4' }, select: ['ID'] })) {
    await rest(page, 'crm.contact.delete', { id: c.ID });
  }
});

// ── Lo que comparten A.4.2 y A.4.3 ───────────────────────────────────────────

type Pagina = import('@playwright/test').Page;

/** Abre el filtro del listado si no está abierto. */
async function abrirFiltro(page: Pagina) {
  if (!(await page.locator('.main-ui-filter-field-add-item').first().isVisible().catch(() => false))) {
    await page.locator('.main-ui-filter-search').first().click();
    await page.locator('.main-ui-filter-field-add-item').first().waitFor({ state: 'visible', timeout: 15_000 });
  }
  await page.waitForTimeout(800);
}

/** Los asegurados del segmento de A.4.1, por si ese test no dejó su escenario. */
async function asegurarAsegurados(page: Pagina) {
  const hay = await rest<any[]>(page, 'crm.contact.list', { filter: { '%NAME': 'SEG-A4' }, select: ['ID'] });
  if (hay.length) return;
  for (const [n, s] of [['Uno', 'RECOMMENDATION'], ['Dos', 'RECOMMENDATION'], ['Tres', 'WEB'], ['Cuatro', 'CALL'], ['Cinco', 'RECOMMENDATION']]) {
    await rest(page, 'crm.contact.add', { fields: { NAME: `SEG-A4 ${n}`, LAST_NAME: 'Asegurado', SOURCE_ID: s } });
  }
}

/** Abre el segmento guardado en A.4.1 —o, si no está, arma el mismo criterio— desde el listado de contactos. */
async function abrirSegmento(page: Pagina) {
  await listadoDeContactos(page);
  await abrirFiltro(page);
  const guardado = page.locator('.main-ui-filter-sidebar-item').filter({ hasText: SEGMENTO }).first();
  if (await guardado.isVisible().catch(() => false)) {
    await guardado.click();
  } else {
    if (!(await page.locator('div[data-name="SOURCE_ID"][data-params]:visible').count())) {
      await page.locator('.main-ui-filter-field-add-item').first().click();
      const lista = page.locator('.ui-checkbox-list-popup');
      await lista.getByText('Origen', { exact: true }).first().click();
      await lista.getByText('APLICAR').click();
      await page.waitForTimeout(2000);
    }
    await page.locator('div[data-name="SOURCE_ID"][data-params]:visible').first().click();
    await page.locator('.main-ui-select-inner-item').filter({ hasText: 'Por Recomendación' }).first().click();
    await page.locator('button.main-ui-filter-find').filter({ visible: true }).first().click();
  }
  await page.waitForTimeout(5000);
}

// ── A.4.2 ────────────────────────────────────────────────────────────────────
test('A.4.2 — Diseño de campañas sobre un segmento', async ({ page, browser }, info) => {
  // «Crear una campaña dirigida a un segmento guardado y personalizar su
  //  contenido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await asegurarAsegurados(page);

  // Por el listado: se abre el segmento, se marcan todos y se pide un boletín
  await abrirSegmento(page);
  const segmento = await filasDeContactos(page);
  await page.locator('input.main-grid-check-all').first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.locator('[data-name="group_action"]').first().click({ force: true });
  await page.locator('.menu-popup-item-text').filter({ hasText: 'Crear boletín' }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1000);
  await page.getByText(/^aplicar$/i).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  const avisoBoletin = await textoDe(page);
  const capBoletin = await capturar(page, 'A.4.2', plataforma, '1-boletin-sobre-el-segmento');
  await cerrarPaneles(page);

  // Por Marketing: la campaña de correo electrónico
  await menuLateral(page, 'Marketing');
  await page.getByText('Campaña de correo electrónico').first().click();
  await page.waitForTimeout(6000);
  const avisoCampana = await textoDe(page);
  const capCampana = await capturar(page, 'A.4.2', plataforma, '2-campana-de-correo');
  await cerrarPaneles(page);

  const fila = await comparativo(browser, /^Correos electrónicos masivos/, 'A-4-2-bitrix24-3-correos-masivos-por-plan');
  const personaliza = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25753267/',
    buscar: /Add personalization\. Insert CRM data like name or birthdate/,
    captura: 'A-4-2-bitrix24-4-personalizacion',
  });
  const segmentos = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25753267/',
    buscar: /Select a segment\. Click Select segment and choose an existing one/,
    captura: 'A-4-2-bitrix24-5-segmento-existente',
  });
  const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'A-4-2-bitrix24-standard');

  console.log(`    segmento de ${segmento.length} · comparativo: ${JSON.stringify(fila.planes)}`);
  expect(segmento.length, 'el segmento debe traer asegurados para el boletín').toBeGreaterThan(0);
  expect(avisoBoletin, 'al pedir el boletín el sistema debe informar que hay que cambiar de plan').toMatch(/actualice su plan/i);
  expect(avisoCampana, 'la campaña de correo debe pedir el plan que la habilita').toMatch(/actualice al plan Standard o Professional/i);
  expect(fila.planes[CODIGOS.free], 'la edición gratuita no incluye el correo masivo').toBe('uncheck');
  expect(fila.planes[CODIGOS.basic], 'el plan Basic tampoco lo incluye').toBe('uncheck');
  expect(fila.planes[CODIGOS.standard]).toMatch(/50,000/);

  registrar({
    criterio: 'A.4.2',
    plataforma,
    cumple: 0,
    justificacion:
      `En la edición gratuita no se puede crear una campaña: se abrió el segmento guardado, se marcaron sus ${segmento.length} ` +
      'asegurados y se pidió «Crear boletín», y el sistema respondió que la herramienta «estará disponible una vez que ' +
      'actualice su plan»; desde Marketing, «Campaña de correo electrónico» dice que se desbloquea con el plan Standard ' +
      'o el Professional. El comparativo del fabricante lo confirma: el correo masivo no figura en la edición ' +
      'gratuita ni en el plan Basic. El producto sí la tiene: la campaña se dirige a un segmento existente y su ' +
      'contenido se personaliza con datos del CRM, como el nombre.',
    evidencia: [capBoletin, capCampana],
    documentacion: [fila.fuente, personaliza, segmentos, ...precio],
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan Standard —el de entrada para el correo masivo, hasta 50.000 correos por mes— la campaña se arma ' +
        'sobre un segmento del CRM y se personaliza con variables como el nombre o la fecha de nacimiento, sin ' +
        'programar. Hay que dejar configurada una vez la casilla desde la que sale y el límite mensual.',
    })],
  });
  for (const c of await rest<any[]>(page, 'crm.contact.list', { filter: { '%NAME': 'SEG-A4' }, select: ['ID'] })) {
    await rest(page, 'crm.contact.delete', { id: c.ID });
  }
});

// ── A.4.3 ────────────────────────────────────────────────────────────────────
test('A.4.3 — Medición de los resultados de la campaña', async ({ page, browser }, info) => {
  // «Comprobar que el sistema registra envíos, aperturas o respuestas de la
  //  campaña realizada»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // El listado de campañas: sus columnas dicen qué se mide
  await menuLateral(page, 'Marketing');
  await pestana(page, 'Campañas');
  const listado = await textoDe(page);
  const capListado = await capturar(page, 'A.4.3', plataforma, '1-listado-de-campanas');
  // Sin campañas no hay resultados que ver: se intenta crear una
  await page.getByText('Crear campaña').first().click();
  await page.locator('.menu-popup-item-text').filter({ hasText: /^Campaña de correo/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.4.3', plataforma, '2-crear-campana');
  await cerrarPaneles(page);

  const seguimiento = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25753267/',
    buscar: /Email tracking\. Enable this option to track opens and clicks/,
    captura: 'A-4-3-bitrix24-3-seguimiento-de-aperturas',
  });
  const lectura = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/24955986/',
    buscar: /enable email read tracking/,
    captura: 'A-4-3-bitrix24-4-lectura-de-correos',
  });
  const fila = await comparativo(browser, /^Correos electrónicos masivos/, 'A-4-3-bitrix24-5-correos-masivos-por-plan');
  const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'A-4-3-bitrix24-standard');

  expect(listado, 'el listado de campañas debe tener su columna de estadística').toMatch(/Estad[ií]stica/);
  expect(aviso, 'crear una campaña debe pedir el plan que la habilita').toMatch(/actualice al plan Standard o Professional/i);
  expect(fila.planes[CODIGOS.free]).toBe('uncheck');

  registrar({
    criterio: 'A.4.3',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición gratuita no hay campañas que medir: el listado de Marketing › Campañas trae las columnas Estado, ' +
      'Estadística y Consentimiento pero está vacío, y crear una campaña de correo pide el plan Standard o el ' +
      'Professional. El fabricante documenta lo que el producto mide cuando la campaña sale: envíos, y con el ' +
      'seguimiento del correo activado, aperturas y clics.',
    evidencia: [capListado, capAviso],
    documentacion: [seguimiento, lectura, fila.fuente, ...precio],
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan Standard cada campaña registra su estadística en el listado de campañas; las aperturas y los ' +
        'clics se miden si se activa el seguimiento del correo y de los enlaces, una opción de configuración que se ' +
        'deja prendida una vez.',
    })],
  });
});

/** Desconecta el canal abierto en el panel: «Desconectar» y la confirmación. */
async function desconectar(page: Pagina) {
  await panel(page).getByRole('button', { name: /^desconectar$/i }).click();
  await panel(page).getByText('OK', { exact: true }).first().click();
  await page.waitForTimeout(5000);
}

// ── A.4.4 ────────────────────────────────────────────────────────────────────
test('A.4.4 — Captación de interesados desde redes sociales', async ({ page, browser }, info) => {
  // «Buscar la conexión con alguna red social y comprobar que permite
  //  incorporar interesados a la base»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contact center');
  const catalogo = await textoDe(page);
  const capCatalogo = await capturar(page, 'A.4.4', plataforma, '1-canales');

  // La conexión con Facebook: se abre su tarjeta y se sigue hasta el paso que pide la cuenta de la red
  await panel(page).getByText('Facebook', { exact: true }).first().click();
  await panelListo(page, /Responda a las preguntas de sus clientes en Facebook|No se ha terminado la instalación/);
  // Una conexión que quedó a medias de una prueba anterior se desconecta antes de empezar
  if (await panel(page).getByText('No se ha terminado la instalación').first().isVisible().catch(() => false)) {
    await desconectar(page);
    await panelListo(page, /Responda a las preguntas de sus clientes en Facebook/);
  }
  const presentacion = await textoDe(page);
  await panel(page).getByRole('button', { name: /^conectar$/i }).click();
  await panelListo(page, /Iniciar sesión/i);
  const paso = await textoDe(page);
  const capConexion = await capturar(page, 'A.4.4', plataforma, '2-conexion-con-facebook');
  await cerrarPaneles(page);

  // El portal queda como estaba: la conexión a medias se desconecta desde su propia tarjeta
  await pestana(page, 'Clientes', 'Contact center');
  await panel(page).getByText('Facebook', { exact: true }).first().click();
  await panelListo(page, /No se ha terminado la instalación/);
  await desconectar(page);
  await cerrarPaneles(page);

  const fila = await comparativo(browser, /^Facebook, Instagram, etc\./, 'A-4-4-bitrix24-3-redes-por-plan');

  expect(catalogo, 'el centro de contacto debe ofrecer Facebook e Instagram').toMatch(/Facebook[\s\S]*Instagram Direct/);
  expect(presentacion).toMatch(/historial de comunicaciones en el CRM/);
  expect(paso, 'el siguiente paso pide autorizar con la cuenta de Facebook').toMatch(/autorice con la cuenta de Facebook/i);
  expect(fila.planes[CODIGOS.free], 'la conexión con redes viene en la edición gratuita').toBe('check');

  registrar({
    criterio: 'A.4.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El centro de contacto del CRM ofrece conectar Facebook, Instagram, WhatsApp, Telegram y otros canales, y en la ' +
      'edición gratuita la conexión no encuentra ningún muro de pago: se abrió la de Facebook y el sistema llegó al ' +
      'paso de autorizar con la cuenta que administra la página de la compañía —esta evaluación no tiene una—, ' +
      'donde se detuvo la prueba. Según el fabricante, lo que llega por ahí queda en el CRM con su historial y ' +
      'cualquier chat puede convertirse en una negociación, es decir, en un interesado en la base. Conectar cada ' +
      'canal es configuración de una vez, a cargo de quien administra la página.',
    evidencia: [capCatalogo, capConexion],
    documentacion: fila.fuente,
  });
});

// ── A.4.5 ────────────────────────────────────────────────────────────────────
test('A.4.5 — Escucha de menciones en canales públicos', async ({ page, browser }, info) => {
  // «Buscar la función de seguimiento de menciones de la compañía y de la
  //  competencia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Lo más cercano dentro del producto: los comentarios de la página propia
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contact center');
  await panel(page).getByText('Facebook: Comentarios', { exact: true }).first().click();
  await panelListo(page, /Administre su página pública de Facebook desde Bitrix24/);
  const comentarios = await textoDe(page);
  const capComentarios = await capturar(page, 'A.4.5', plataforma, '1-comentarios-de-la-pagina');
  await cerrarPaneles(page);

  // El catálogo de aplicaciones: se busca la función con las palabras que la nombrarían
  await menuAplicaciones(page, 'Market');
  const marco = () => page.frameLocator('iframe[src*="market"]').last();
  const hallazgos: Record<string, string> = {};
  for (const termino of ['menciones', 'social listening', 'brand monitoring']) {
    const buscador = marco().getByPlaceholder('Buscar en Bitrix24 Market');
    await buscador.click();
    await buscador.press('Control+a');
    await buscador.pressSequentially(termino);
    await page.waitForTimeout(6000);
    hallazgos[termino] = await marco().locator('body').innerText();
  }
  const capMarket = await capturar(page, 'A.4.5', plataforma, '2-market-sin-escucha');
  await cerrarPaneles(page);

  const fila = await comparativo(browser, /^Redes sociales y messengers/, 'A-4-5-bitrix24-3-redes-sociales');
  const marketing = await citar(browser, {
    url: 'https://www.bitrix24.com/articles/don-t-let-one-tweet-ruin-everything-10-social-media-crisis-hacks-you-need-to-know.php',
    buscar: /Social media monitoring and engagement from your CRM/,
    captura: 'A-4-5-bitrix24-4-monitoreo-desde-el-crm',
  });

  expect(comentarios).toMatch(/administrar comentarios y publicaciones/);
  for (const [t, texto] of Object.entries(hallazgos)) {
    expect(texto, `el catálogo no debe ofrecer una aplicación de escucha para «${t}»`)
      .not.toMatch(/listening|escucha de redes|brand ?monitor|monitoreo de marca|menciones de marca/i);
  }

  registrar({
    criterio: 'A.4.5',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El producto no trae un seguimiento de menciones en canales públicos ni de la competencia. Lo más cercano es ' +
      'el conector «Facebook: Comentarios» del centro de contacto, disponible en la edición gratuita, que trae los ' +
      'comentarios de la página propia de la compañía al CRM: cubre lo que se dice en sus propios canales, y solo ' +
      'ahí. El catálogo de aplicaciones tampoco ofrece una de escucha: se buscó «menciones», «social listening» y ' +
      '«brand monitoring» y no aparece ninguna. El fabricante promociona «monitoreo de redes desde el CRM», ' +
      'que en el producto es ese mismo intercambio de mensajes y comentarios propios. Para la competencia ' +
      'habría que resolverlo con una herramienta externa.',
    evidencia: [capComentarios, capMarket],
    documentacion: [fila.fuente, marketing],
  });
});

// ── A.4.6 ────────────────────────────────────────────────────────────────────
test('A.4.6 — Publicación en redes desde el sistema', async ({ page, browser }, info) => {
  // «Componer una publicación y emitirla a una red conectada desde el propio
  //  sistema, sin pasar por la herramienta de la red»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Las publicaciones promocionadas de Marketing: se pide el anuncio
  await menuLateral(page, 'Marketing');
  await page.getByText('Anuncios de Facebook').first().click();
  await page.waitForTimeout(6000);
  const aviso = await textoDe(page);
  const capAnuncio = await capturar(page, 'A.4.6', plataforma, '1-anuncio-de-facebook');
  await cerrarPaneles(page);

  const fila = await comparativo(browser, /^Facebook Lance anuncios en Facebook dirigidos a un segmento/, 'A-4-6-bitrix24-2-anuncios-por-plan');

  expect(aviso, 'los anuncios de Facebook piden el plan que los habilita').toMatch(/actualice al plan Standard o Professional/i);
  expect(fila.planes[CODIGOS.free]).toBe('uncheck');
  expect(fila.planes[CODIGOS.standard]).toBe('check');

  // El fabricante declara qué hace con Facebook e Instagram y qué no
  const noDisponible = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/24788840/',
    buscar: 'Post on Facebook page, Facebook page card, and Messenger chat are not available yet',
    captura: 'A-4-6-bitrix24-3-publicar-en-facebook-no-disponible',
  });

  registrar({
    criterio: 'A.4.6',
    plataforma,
    cumple: 0,
    justificacion:
      'El sistema no publica en las redes: lo único que emite hacia Facebook e Instagram son anuncios pagos sobre ' +
      'publicaciones que ya existen en la red o sobre un segmento del CRM, desde «Marketing › Anuncios de Facebook», ' +
      'que en la edición gratuita pide actualizar al plan Standard o Professional. No hay donde componer un texto y ' +
      'emitirlo a la página conectada. El fabricante lo declara en su documentación de la integración con Facebook e ' +
      'Instagram: publicar en la página de Facebook figura entre las opciones que todavía no están disponibles. ' +
      'La conexión de la página que sí existe es la de comentarios y mensajes recibidos, no la de publicación.',
    evidencia: [capAnuncio],
    documentacion: [noDisponible, fila.fuente],
  });
});

// ── A.4.7 ────────────────────────────────────────────────────────────────────
test('A.4.7 — Registro de la competencia y del motivo de pérdida', async ({ page }, info) => {
  // «Marcar una oportunidad como perdida y comprobar si admite registrar el
  //  motivo y el competidor que la ganó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  for (const c of ['Motivo de pérdida', 'Competidor']) await quitarCampo(page, c);
  await borrarNegociaciones(page, /^OPO-PERDIDA-/);

  // El cierre de fábrica: la etapa de perdida, sin lugar para el motivo ni el competidor
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill('OPO-PERDIDA-1');
  await crearCampoA4(page, 'Lista', 'Motivo de pérdida', ['Precio', 'Cobertura', 'Atención', 'Otro']);
  await crearCampoA4(page, 'Cadena', 'Competidor');
  await guardarFormulario(page);
  await cerrarPaneles(page);

  // Se marca como perdida desde su ficha: «Cerrar negociación» › «Negociación perdida»
  await menuLateral(page, 'CRM');
  await page.locator('a').filter({ hasText: /^OPO-PERDIDA-1$/ }).filter({ visible: true }).first().click();
  await panelListo(page, 'Cerrar negociación');
  await panel(page).getByText('Cerrar negociación', { exact: true }).first().click();
  await panel(page).locator('span.webform-small-button-text').filter({ hasText: /negociación perdida/i }).click();
  await page.waitForTimeout(1500);
  const cierre = await textoDe(page);
  await panel(page).getByText('Cerrado Perdido', { exact: true }).first().waitFor({ state: 'visible', timeout: 15_000 });
  const capCierre = await capturar(page, 'A.4.7', plataforma, '1-cierre-de-la-negociacion');
  await panel(page).locator('button.popup-window-button-accept').filter({ visible: true }).first().click();
  await page.waitForTimeout(5000);

  // Motivo y competidor, en la misma ficha
  await panel(page).locator('a, span').filter({ hasText: /^\s*editar\s*$/i }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await elegirEnLista(page, 'Motivo de pérdida', 'Precio');
  await panel(page).getByText('Competidor', { exact: true }).first().locator('xpath=following::input[not(@type="hidden")][1]').fill('Seguros del Sur');
  const capFicha = await capturar(page, 'A.4.7', plataforma, '2-motivo-y-competidor');
  await guardarFormulario(page);
  await cerrarPaneles(page);

  const motivo = await campoDeNegociacion(page, 'Motivo de pérdida');
  const competidor = await campoDeNegociacion(page, 'Competidor');
  const [n] = await negociaciones(page, /^OPO-PERDIDA-1$/);
  const valorMotivo = motivo?.LIST.find((l: any) => String(l.ID) === String(n?.[motivo.FIELD_NAME]))?.VALUE;
  console.log(`    etapa ${n?.STAGE_ID} · motivo ${valorMotivo} · competidor ${n?.[competidor?.FIELD_NAME]} · cierre: ${cierre.match(/Negociación cerrada[^\n]*/)?.[0]}`);

  expect(n?.STAGE_ID, 'la negociación debe quedar en la etapa de perdida').toBe('LOSE');
  expect(valorMotivo, 'debe quedar el motivo').toBe('Precio');
  expect(n?.[competidor?.FIELD_NAME], 'debe quedar el competidor').toBe('Seguros del Sur');

  registrar({
    criterio: 'A.4.7',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Al cerrar una negociación como perdida el sistema pregunta solo el resultado —«Cerrado Perdido» o «Analizar ' +
      'la falla», las dos etapas de fábrica—: no trae dónde anotar por qué se perdió ni quién la ganó. Se agregaron ' +
      'dos campos propios a la negociación, el motivo, como lista, y el competidor, como texto; se marcó una ' +
      'oportunidad como perdida y se le registraron el motivo y el competidor desde su ficha, y quedaron guardados. ' +
      'Agregar los campos es configuración de una sola vez.',
    evidencia: [capCierre, capFicha],
  });
  await borrarNegociaciones(page, /^OPO-PERDIDA-/);
});
