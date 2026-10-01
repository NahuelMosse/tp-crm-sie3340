import { Page, test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { apiEspo, crear, listar } from '../api';
import { citar } from '../fuentes';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, filasDelListado } from './comun';
import { alta, ficha, edicion, administracion } from '../espocrm/navegar';

/**
 * A.2 — Captación y proceso de venta
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. El solicitante se registra como posible cliente, la entidad que el
 * producto trae para quien todavía no contrató.
 */

test.describe.configure({ mode: 'serial' });

const SOLICITANTE = {
  nombre: 'Martina', apellido: 'Ferreyra', correo: 'mferreyra@ejemplo.test',
  telefono: '+54 11 4555-2001', calle: 'Av. Rivadavia 4520', ciudad: 'Buenos Aires',
};
let solicitanteId = '';

test.beforeAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  // Lo que dejaron corridas anteriores se quita: cada corrida mide lo mismo
  const api = await apiEspo();
  for (const entidad of ['Lead', 'Contact', 'Opportunity']) {
    const { list } = await listar(api, entidad, { maxSize: 200 });
    const previos = list.filter((r: any) =>
      r.lastName === SOLICITANTE.apellido || /Ferreyra/.test(r.name ?? ''));
    for (const r of previos) await api.delete(`${entidad}/${r.id}`);
  }
});

/** Escribe tecla por tecla en un campo del formulario. */
async function escribir(page: Page, selector: string, valor: string) {
  const entrada = page.locator(selector).first();
  await entrada.waitFor({ state: 'visible', timeout: 30_000 });
  await entrada.click();
  await entrada.pressSequentially(valor, { delay: 20 });
}

// ── A.2.1 ────────────────────────────────────────────────────────────────────
test('A.2.1 — Registro del solicitante con sus datos de contacto', async ({ page }, info) => {
  // «Crear un solicitante con nombre, teléfono, correo y domicilio, y
  //  recuperarlo por búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await alta(page, 'Lead');
  await escribir(page, 'input[data-name="firstName"]', SOLICITANTE.nombre);
  await escribir(page, 'input[data-name="lastName"]', SOLICITANTE.apellido);
  await escribir(page, '.field[data-name="emailAddress"] input.email-address', SOLICITANTE.correo);
  await escribir(page, '.field[data-name="phoneNumber"] input.phone-number', SOLICITANTE.telefono);
  await escribir(page, '[data-name="addressStreet"]', SOLICITANTE.calle);
  await escribir(page, 'input[data-name="addressCity"]', SOLICITANTE.ciudad);
  const capAlta = await capturar(page, 'A.2.1', plataforma, '1-alta');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#Lead\/view\//, { timeout: 30_000 });
  solicitanteId = page.url().split('/').pop()!;

  // Recuperarlo por búsqueda, desde el listado
  await listadoLimpio(page, 'Lead');
  await page.locator('.search-container input.text-filter').first().fill(SOLICITANTE.apellido);
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  const encontrados = await filasDelListado(page);
  const capBusqueda = await capturar(page, 'A.2.1', plataforma, '2-busqueda');

  const api = await apiEspo();
  const guardado = await (await api.get(`Lead/${solicitanteId}`)).json();

  expect(encontrados.some(n => n.includes(SOLICITANTE.apellido)), 'debe recuperarse buscando el apellido').toBeTruthy();
  expect(guardado.emailAddress).toBe(SOLICITANTE.correo);
  expect(guardado.phoneNumber?.replace(/\D/g, '')).toBe(SOLICITANTE.telefono.replace(/\D/g, ''));
  expect(guardado.addressCity).toBe(SOLICITANTE.ciudad);

  registrar({
    criterio: 'A.2.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El producto trae una entidad para quien todavía no contrató —el posible cliente— con nombre, teléfono, ' +
      'correo y domicilio desglosado en calle, ciudad, provincia, código postal y país. Se registró un ' +
      'solicitante con todos esos datos, que se guardaron completos, y se lo recuperó buscando su apellido desde ' +
      'el listado. Viene listo con la instalación, sin configurar nada.',
    evidencia: [capAlta, capBusqueda],
  });
});

// ── A.2.3 ────────────────────────────────────────────────────────────────────
test('A.2.3 — Conversión del solicitante en oportunidad de venta', async ({ page }, info) => {
  // «Convertir el solicitante en oportunidad y comprobar que los datos cargados
  //  se trasladan sin volver a escribirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await ficha(page, 'Lead', solicitanteId);
  await page.locator('[data-action="convert"]').first().click();
  await page.locator('input.check-scope[data-scope="Contact"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('input.check-scope[data-scope="Contact"]').first().check();
  await page.locator('input.check-scope[data-scope="Opportunity"]').first().check();
  await page.waitForTimeout(1500);

  // Lo que el sistema ya trae escrito en el asegurado que va a crear
  const precargado = {
    nombre: await page.locator('.edit-container-contact input[data-name="firstName"]').first().inputValue(),
    apellido: await page.locator('.edit-container-contact input[data-name="lastName"]').first().inputValue(),
  };

  // La oportunidad pide lo que el solicitante no tenía: monto y fecha de cierre
  const op = '.edit-container-opportunity';
  const nombreOp = page.locator(`${op} input[data-name="name"]`).first();
  if (!(await nombreOp.inputValue())) await nombreOp.pressSequentially('Seguro de hogar — Ferreyra', { delay: 15 });
  await escribir(page, `${op} input[data-name="amount"]`, '98000');
  const cierre = new Date(Date.now() + 20 * 86_400_000);
  await escribir(page, `${op} input[data-name="closeDate"]`,
    `${String(cierre.getDate()).padStart(2, '0')}.${String(cierre.getMonth() + 1).padStart(2, '0')}.${cierre.getFullYear()}`);
  await page.keyboard.press('Tab');
  const capConversion = await capturar(page, 'A.2.3', plataforma, '1-conversion');
  await page.locator('button[data-action="convert"]').first().click();
  // Terminada la conversión, vuelve a la ficha del solicitante
  await page.waitForFunction(d => location.hash === d, `#Lead/view/${solicitanteId}`, { timeout: 90_000 });
  await page.waitForTimeout(2000);

  const api = await apiEspo();
  const lead = await (await api.get(`Lead/${solicitanteId}`)).json();
  const contacto = await (await api.get(`Contact/${lead.createdContactId}`)).json();
  const oportunidad = await (await api.get(`Opportunity/${lead.createdOpportunityId}`)).json();
  await ficha(page, 'Contact', contacto.id);
  await page.waitForTimeout(5000);
  const capAsegurado = await capturar(page, 'A.2.3', plataforma, '2-asegurado-creado');

  expect(precargado).toEqual({ nombre: SOLICITANTE.nombre, apellido: SOLICITANTE.apellido });
  expect(lead.status, 'el solicitante debe quedar marcado como convertido').toBe('Converted');
  expect(contacto.emailAddress, 'el correo debe pasar sin reescribirlo').toBe(SOLICITANTE.correo);
  expect(contacto.phoneNumber?.replace(/\D/g, '')).toBe(SOLICITANTE.telefono.replace(/\D/g, ''));
  expect(contacto.addressCity).toBe(SOLICITANTE.ciudad);
  expect(oportunidad.contactsIds ?? [oportunidad.contactId], 'la oportunidad debe quedar ligada al asegurado')
    .toContain(contacto.id);

  registrar({
    criterio: 'A.2.3',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'La ficha del solicitante trae la acción de convertir, que crea en un solo paso el asegurado y la ' +
      'oportunidad de venta. Los datos ya cargados pasaron solos: el formulario de conversión trajo el nombre ' +
      'escrito, y el asegurado quedó con el mismo correo, teléfono y domicilio del solicitante, sin volver a ' +
      'tipearlos. Solo se completó lo que el solicitante no tenía —monto y fecha de cierre de la venta—. El ' +
      'solicitante quedó marcado como convertido y la oportunidad, ligada al asegurado. Viene listo de fábrica.',
    evidencia: [capConversion, capAsegurado],
  });
});

// ── A.2.4 ────────────────────────────────────────────────────────────────────
test('A.2.4 — Embudo de oportunidades con etapas', async ({ page }, info) => {
  // «Crear una oportunidad desde la ficha de un asegurado y hacerla avanzar
  //  entre etapas hasta el cierre»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const api = await apiEspo();
  const contacto = (await listar(api, 'Contact', { maxSize: 200 })).list
    .find((c: any) => c.lastName === SOLICITANTE.apellido);

  // Desde la ficha del asegurado, con el panel de sus oportunidades
  await entrar(page, plataforma);
  await ficha(page, 'Contact', contacto.id);
  const panel = page.locator('.panel[data-name="opportunities"]').first();
  await panel.waitFor({ state: 'visible', timeout: 40_000 });
  await panel.locator('[data-action="createRelated"], .action[data-action="createRelated"]').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  const nombre = 'Ampliación a accidentes personales — Ferreyra';
  await dialogo.locator('input[data-name="name"]').first().pressSequentially(nombre, { delay: 15 });
  await dialogo.locator('input[data-name="amount"]').first().pressSequentially('45000', { delay: 20 });
  const cierre = new Date(Date.now() + 30 * 86_400_000);
  const fecha = dialogo.locator('input[data-name="closeDate"]').first();
  await fecha.click();
  await fecha.pressSequentially(
    `${String(cierre.getDate()).padStart(2, '0')}.${String(cierre.getMonth() + 1).padStart(2, '0')}.${cierre.getFullYear()}`,
    { delay: 20 });
  await fecha.press('Tab');
  const capAlta = await capturar(page, 'A.2.4', plataforma, '1-desde-la-ficha');
  await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  const oportunidad = (await listar(api, 'Opportunity', { maxSize: 200 })).list.find((o: any) => o.name === nombre);
  const etapas = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  for (const etapa of etapas) {
    await edicion(page, 'Opportunity', oportunidad.id);
    await page.locator('.field[data-name="stage"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await elegirLista(page, 'stage', etapa);
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(3500);
  }
  await ficha(page, 'Opportunity', oportunidad.id);
  await page.waitForTimeout(5000);
  const capCierre = await capturar(page, 'A.2.4', plataforma, '2-cerrada-ganada');

  const final = await (await api.get(`Opportunity/${oportunidad.id}`)).json();
  const notas = (await (await api.get(`Opportunity/${oportunidad.id}/stream`, { params: { maxSize: 50 } })).json()).list ?? [];
  // El cambio de etapa queda como actualización con el valor nuevo: la etapa es el estado de la oportunidad
  const recorrido = notas.map((n: any) => n.type !== 'Update' ? null
      : n.data?.value ?? (n.data?.fields?.includes('stage') ? n.data?.attributes?.became?.stage : null))
    .filter(Boolean).reverse();

  expect(final.stage).toBe('Closed Won');
  expect(final.probability, 'la probabilidad acompaña a la etapa').toBe(100);
  expect(recorrido, 'el sistema debe conservar el paso por cada etapa').toEqual(etapas);

  // Las etapas que ofrece el embudo, leídas del propio sistema
  const { stage } = (await (await api.get('Metadata')).json()).entityDefs.Opportunity.fields;

  registrar({
    criterio: 'A.2.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Desde la ficha del asegurado, su panel de oportunidades crea una nueva ya ligada a él. El embudo viene ' +
      `definido de fábrica con ${stage.options.length} etapas y una probabilidad de cierre asociada a cada una. ` +
      'La oportunidad se hizo avanzar de calificación a propuesta, a negociación y a cerrada ganada: el sistema ' +
      'ajustó la probabilidad en cada paso, terminó en el cien por ciento, y la historia de la ficha conserva ' +
      'el recorrido completo. Las etapas se pueden renombrar para que sigan el proceso comercial de la ' +
      'compañía, pero tal como vienen ya lo resuelven.',
    evidencia: [capAlta, capCierre],
    medicion: `Recorrido conservado: ${recorrido.join(' → ')}`,
  });
});

// ── A.2.6 ────────────────────────────────────────────────────────────────────
test('A.2.6 — Oportunidades de cambio y ampliación sobre la cartera', async ({ page, browser }, info) => {
  // «Obtener el conjunto de asegurados que tienen un ramo contratado y no otro,
  //  y el de los que están próximos a vencer, como base para ofrecer una
  //  cobertura adicional o un cambio de póliza»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Escenario: tres asegurados con carteras distintas. Uno solo tiene automotor,
  // otro tiene automotor y hogar, y un tercero tiene automotor por vencer.
  const api = await apiEspo();
  const metadatos = (await (await api.get('Metadata')).json()).entityDefs.CPoliza;
  test.skip(!metadatos.links?.titular, 'la relación póliza–titular la crea A.6; correr A-06 antes');
  const contactos = (await listar(api, 'Contact', { maxSize: 200 })).list;
  const titular = (correo: string) => contactos.find((c: any) => c.emailAddress === correo).id;
  const [soloAuto, autoYHogar, porVencer] = ['sibanez@ejemplo.test', 'rdominguez@ejemplo.test', 'lnandu@ejemplo.test'].map(titular);
  for (const p of (await listar(api, 'CPoliza', { maxSize: 200 })).list.filter((p: any) => /^POL-AMPLIACION-/.test(p.name))) {
    await api.delete(`CPoliza/${p.id}`);
  }
  const en = (dias: number) => new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);
  await crear(api, 'CPoliza', { name: 'POL-AMPLIACION-1', tipoPoliza: 'Automotor', titularId: soloAuto, vigenciaHasta: en(200) });
  await crear(api, 'CPoliza', { name: 'POL-AMPLIACION-2', tipoPoliza: 'Automotor', titularId: autoYHogar, vigenciaHasta: en(200) });
  await crear(api, 'CPoliza', { name: 'POL-AMPLIACION-3', tipoPoliza: 'Hogar', titularId: autoYHogar, vigenciaHasta: en(200) });
  await crear(api, 'CPoliza', { name: 'POL-AMPLIACION-4', tipoPoliza: 'Automotor', titularId: porVencer, vigenciaHasta: en(20) });

  // Lo que ofrece la edición gratuita: un listado de pólizas por condición
  const { agregarFiltro, filtrarPorLista, comparar, filtrarPorNumero, aplicarFiltros } = await import('./comun');
  await entrar(page, plataforma);
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'tipoPoliza');
  await filtrarPorLista(page, 'tipoPoliza', 'Automotor');
  await aplicarFiltros(page);
  const capAutomotor = await capturar(page, 'A.2.6', plataforma, '1-polizas-de-automotor');
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'tipoPoliza');
  await filtrarPorLista(page, 'tipoPoliza', 'Hogar');
  await aplicarFiltros(page);
  const capHogar = await capturar(page, 'A.2.6', plataforma, '2-polizas-de-hogar');
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'vigenciaHasta');
  await comparar(page, 'vigenciaHasta', 'nextXDays');
  await filtrarPorNumero(page, 'vigenciaHasta', '30');
  await aplicarFiltros(page);
  const proximas = await filasDelListado(page);
  const capVencer = await capturar(page, 'A.2.6', plataforma, '3-proximas-a-vencer');

  // En el listado de asegurados, no hay condición sobre el ramo de sus pólizas
  await listadoLimpio(page, 'Contact');
  await page.locator('.add-filter-button').first().click();
  const condiciones = (await page.locator('ul.filter-list a[data-name]').evaluateAll(
    as => as.map(a => a.getAttribute('data-name') ?? ''))).filter(Boolean);
  await page.keyboard.press('Escape');
  const capCondiciones = await capturar(page, 'A.2.6', plataforma, '4-condiciones-sobre-asegurados');

  const fuentes = [
    await citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: 'NOT IN provides the ability', captura: 'A-2-6-espocrm-5-informes-not-in' }),
    await citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: 'IN is similar to AND group', captura: 'A-2-6-espocrm-6-informes-in' }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-2-6-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-2-6-espocrm-nube'),
  ];

  expect(proximas, 'la próxima a vencer debe salir directo').toContain('POL-AMPLIACION-4');
  expect(condiciones.some(c => /tipoPoliza|poliza/i.test(c)), 'el asegurado no se filtra por el ramo de sus pólizas').toBeFalsy();

  registrar({
    criterio: 'A.2.6',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en ' +
      'treinta días muestra cada póliza con su titular. El otro conjunto no: el listado de asegurados no admite ' +
      'condiciones sobre el ramo de sus pólizas, y el de pólizas filtra una por una. Para obtener a los que ' +
      'tienen automotor y no hogar hay que sacar los dos listados y cruzarlos por fuera del sistema, trabajo ' +
      'que se repite cada vez que el área comercial arma una campaña de ampliación. El módulo de informes que ' +
      'vende el fabricante resuelve ese cruce con condiciones de pertenencia y de exclusión sobre los registros ' +
      'relacionados.',
    evidencia: [capAutomotor, capHogar, capVencer, capCondiciones],
    documentacion: fuentes,
    conPlan: [
      conPlanDe(ESPOCRM_ADVANCED_PACK, {
        cumple: 2, costo: 1,
        justificacion:
          'Un informe de asegurados con un grupo de pertenencia —tienen pólizas de automotor— y uno de ' +
          'exclusión —no tienen de hogar— devuelve el conjunto directo, y se guarda para repetirlo.',
      }),
      conPlanDe(ESPOCRM_CLOUD_BASIC, {
        cumple: 2, costo: 1,
        justificacion: 'El servicio en la nube incluye el módulo de informes, con las mismas condiciones.',
      }),
    ],
  });
});

// ── A.2.5 ────────────────────────────────────────────────────────────────────
test('A.2.5 — Embudos diferenciados por ramo', async ({ page }, info) => {
  // «Crear un segundo embudo con etapas distintas del primero y asignarle una
  //  oportunidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const api = await apiEspo();
  const EMBUDO = 'Seguros de personas';
  for (const p of (await listar(api, 'Pipeline', { maxSize: 50 })).list.filter((p: any) => p.name === EMBUDO)) {
    await api.delete(`Pipeline/${p.id}`);
  }
  for (const o of (await listar(api, 'Opportunity', { maxSize: 200 })).list.filter((o: any) => o.name === 'Seguro de vida colectivo — embudo')) {
    await api.delete(`Opportunity/${o.id}`);
  }

  const casilla = page.locator('#main input[data-name="pipelines"]').first();
  try {
    // Los embudos se habilitan por entidad, con una casilla de su configuración
    await entrar(page, plataforma);
    await administracion(page, '#Admin/entityManager', '#Admin/entityManager/scope=Opportunity',
      page.locator('#main [data-action="editEntity"]').first());
    await casilla.waitFor({ state: 'visible', timeout: 40_000 });
    if (!(await casilla.isChecked())) {
      await casilla.check();
      await page.locator('#main [data-action="save"]').first().click();
      await page.waitForTimeout(8000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
    }
    const capHabilitar = await capturar(page, 'A.2.5', plataforma, '1-embudos-habilitados');

    // El segundo embudo, desde la pantalla de embudos de la entidad
    await administracion(page, '#Admin/pipelines', '#Admin/pipelines/scope=Opportunity');
    await page.locator('#main a[href="#Pipeline/create"]').first().click();
    const nombre = page.locator('#main input[data-name="name"]').first();
    await nombre.waitFor({ state: 'visible', timeout: 40_000 });
    await nombre.pressSequentially(EMBUDO, { delay: 20 });
    await page.locator('#main [data-action="save"]').first().click();
    await page.waitForURL(/#Pipeline\/view\//, { timeout: 30_000 });
    const embudo = page.url().split('/').pop()!;

    // Sus etapas se adaptan al ramo: el panel de etapas permite renombrarlas,
    // quitarlas y agregarlas. Para personas se evalúa la salud del asegurado
    // antes de cotizar, y no hay negociación de precio.
    const etapas = (await (await api.get(`Pipeline/${embudo}/stages`, { params: { maxSize: 50 } })).json()).list;
    const porEstado = (s: string) => etapas.find((e: any) => e.mappedStatus === s);
    const panel = page.locator('.panel[data-name="stages"]').first();
    await panel.waitFor({ state: 'visible', timeout: 40_000 });
    const accionSobre = async (etapa: string, accion: string) => {
      const fila = panel.locator(`tr.list-row[data-id="${etapa}"]`);
      await fila.locator('.dropdown-toggle').click();
      await fila.locator(`[data-action="${accion}"]`).click();
    };
    for (const [estado, nombre] of [['Qualification', 'Declaración de salud'], ['Proposal', 'Evaluación médica']]) {
      await accionSobre(porEstado(estado).id, 'quickEdit');
      const modal = page.locator('.modal-dialog:visible');
      await modal.locator('input[data-name="name"]').fill(nombre);
      await modal.locator('button[data-name="save"]').click();
      await expect(modal).toBeHidden({ timeout: 15_000 });
    }
    await accionSobre(porEstado('Negotiation').id, 'removeRelated');
    await page.locator('.modal-dialog:visible button[data-name="confirm"]').click();
    await expect(panel.locator(`tr.list-row[data-id="${porEstado('Negotiation').id}"]`)).toHaveCount(0, { timeout: 15_000 });
    // La aplicación arma la lista de embudos al cargar: se recarga para que ofrezca el nuevo
    await page.reload({ waitUntil: 'domcontentloaded' });
    await panel.waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(3000);
    const capEtapas = await capturar(page, 'A.2.5', plataforma, '2-etapas-del-segundo-embudo');

    // Una oportunidad en el embudo nuevo, desde el formulario
    await alta(page, 'Opportunity');
    await page.locator('#main input[data-name="name"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await page.locator('#main input[data-name="name"]').first().pressSequentially('Seguro de vida colectivo — embudo', { delay: 15 });
    await page.locator('#main input[data-name="amount"]').first().pressSequentially('250000', { delay: 20 });
    const cierre = new Date(Date.now() + 45 * 86_400_000);
    const fecha = page.locator('#main input[data-name="closeDate"]').first();
    await fecha.click();
    await fecha.pressSequentially(`${String(cierre.getDate()).padStart(2, '0')}.${String(cierre.getMonth() + 1).padStart(2, '0')}.${cierre.getFullYear()}`, { delay: 20 });
    await fecha.press('Tab');
    // El embudo se elige de un desplegable con los embudos activos de la entidad
    await page.locator('.field[data-name="pipeline"] .selectize-input').first().click();
    await page.locator('.selectize-dropdown:visible .option').filter({ hasText: EMBUDO }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    const capAlta = await capturar(page, 'A.2.5', plataforma, '3-oportunidad-en-el-embudo');
    await page.locator('#main [data-action="save"]').first().click();
    // Si el sistema no guarda, se informa lo que dijo en vez de esperar en vano
    const guardo = await page.waitForURL(/#Opportunity\/view\//, { timeout: 30_000 }).then(() => true, () => false);
    if (!guardo) {
      const aviso = (await page.locator('.alert:visible, .notify:visible, .text-danger:visible, .has-error .help-block')
        .allInnerTexts()).join(' · ');
      throw new Error(`La oportunidad no se guardó en el embudo nuevo. El sistema dijo: «${aviso || 'nada visible'}»`);
    }
    const oportunidad = await (await api.get(`Opportunity/${page.url().split('/').pop()}`)).json();

    const nombresDelNuevo = (await (await api.get(`Pipeline/${embudo}/stages`, { params: { maxSize: 50 } })).json()).list.map((e: any) => e.name);
    const deFabrica = (await (await api.get('Metadata')).json()).entityDefs.Opportunity.fields.stage.options;

    expect(oportunidad.pipelineId, 'la oportunidad debe quedar en el embudo nuevo').toBe(embudo);
    expect(nombresDelNuevo).toContain('Evaluación médica');
    expect(nombresDelNuevo.length, 'el embudo nuevo tiene otra cantidad de etapas').toBeLessThan(deFabrica.length);

    registrar({
      criterio: 'A.2.5',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'Los embudos múltiples vienen en el producto y se habilitan por entidad, con una casilla de su ' +
        'configuración. Se creó un segundo embudo para los seguros de personas desde su propia pantalla, y su ' +
        'panel de etapas permitió adaptarlas al ramo: la calificación pasó a ser la declaración de salud, la ' +
        'propuesta la evaluación médica, y se quitó la negociación, que en ese ramo no existe. Quedaron ' +
        `${nombresDelNuevo.length} etapas contra las ${deFabrica.length} del embudo general. Se cargó una ` +
        'oportunidad eligiendo ese embudo desde el formulario, y avanza por sus etapas y no por las del otro. ' +
        'Es configuración de una sola vez, sin programar.',
      evidencia: [capHabilitar, capEtapas, capAlta],
      medicion: `Embudo nuevo: ${nombresDelNuevo.join(' → ')}`,
    });

  } finally {
    // Los embudos cambian cómo se carga la etapa en toda la entidad: se apagan
    // al terminar, pase lo que pase, para que los demás criterios midan el
    // producto tal como viene. Si esto falla, no tapa el error de la medición.
    try {
      const irAlEdit = () => administracion(page, '#Admin/entityManager', '#Admin/entityManager/scope=Opportunity',
        page.locator('#main [data-action="editEntity"]').first());
      await irAlEdit();
      // Si quedó un formulario a medio completar, el sistema pregunta si abandonarlo
      const salir = page.getByRole('button', { name: /^S[ií]$/ }).first();
      if (await salir.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false)) {
        await salir.click();
        await irAlEdit();
      }
      await casilla.waitFor({ state: 'visible', timeout: 40_000 });
      if (await casilla.isChecked()) {
        await casilla.uncheck();
        await page.locator('#main [data-action="save"]').first().click();
        await page.waitForTimeout(8000);
      }
    } catch (e) {
      console.log(`    no se pudieron apagar los embudos: ${(e as Error).message.split('\n')[0]}`);
    }
  }
});

// ── A.2.2 ────────────────────────────────────────────────────────────────────
test('A.2.2 — Calificación y priorización del solicitante', async ({ page, browser }, info) => {
  // «Registrar qué cobertura pide el solicitante y con cuánta urgencia, y
  //  obtener la lista ordenada por esa urgencia para atender primero a los que
  //  más cerca están de contratar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Los dos campos que el posible cliente no trae: la cobertura y la urgencia
  const api = await apiEspo();
  const campos = (await (await api.get('Metadata')).json()).entityDefs.Lead.fields;
  if (!campos.cCoberturaSolicitada) {
    await api.post('Admin/fieldManager/Lead', { data: {
      name: 'coberturaSolicitada', type: 'enum', label: 'Cobertura solicitada', options: ['', 'Automotor', 'Hogar', 'Vida', 'Salud'] } });
  }
  if (!campos.cUrgencia) {
    await api.post('Admin/fieldManager/Lead', { data: {
      name: 'urgencia', type: 'enum', label: 'Urgencia', options: ['', 'Alta', 'Media', 'Baja'] } });
  }
  const { alistarEntidad } = await import('../preparar');
  await entrar(page, plataforma);
  await alistarEntidad(page, 'Lead', { detail: ['cCoberturaSolicitada', 'cUrgencia'], list: ['cCoberturaSolicitada', 'cUrgencia'] });

  for (const l of (await listar(api, 'Lead', { maxSize: 200 })).list.filter((l: any) => /^Prioridad /.test(l.lastName ?? ''))) {
    await api.delete(`Lead/${l.id}`);
  }
  // Tres solicitantes cargados en desorden, desde el formulario
  for (const [apellido, cobertura, urgencia] of [['Prioridad Baja', 'Hogar', 'Baja'], ['Prioridad Alta', 'Vida', 'Alta'],
    ['Prioridad Media', 'Automotor', 'Media']] as const) {
    await alta(page, 'Lead');
    await page.locator('input[data-name="lastName"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await page.locator('input[data-name="lastName"]').first().pressSequentially(apellido, { delay: 20 });
    await elegirLista(page, 'cCoberturaSolicitada', cobertura);
    await elegirLista(page, 'cUrgencia', urgencia);
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForURL(/#Lead\/view\//, { timeout: 30_000 });
  }

  // Ordenar el listado por urgencia
  await listadoLimpio(page, 'Lead');
  await page.locator('.search-container input.text-filter').first().fill('Prioridad');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3000);
  const cabecera = page.locator('thead a.sort[data-name="cUrgencia"], thead th[data-name="cUrgencia"] a').first();
  await cabecera.click();
  await page.waitForTimeout(3000);
  let orden = (await filasDelListado(page)).filter(n => /Prioridad/.test(n));
  if (orden[0]?.includes('Baja')) { await cabecera.click(); await page.waitForTimeout(3000); orden = (await filasDelListado(page)).filter(n => /Prioridad/.test(n)); }
  const capOrden = await capturar(page, 'A.2.2', plataforma, '1-ordenado-por-urgencia');
  console.log(`    orden por urgencia: ${orden.join(' · ')}`);

  expect(orden.map(n => n.replace(/.*Prioridad /, '')), 'la urgencia debe ordenar según la lista, no alfabéticamente')
    .toEqual(['Alta', 'Media', 'Baja']);

  registrar({
    criterio: 'A.2.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El posible cliente no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde ' +
      'la administración y se los ubicó en el formulario y en el listado. Se cargaron tres solicitantes en ' +
      'desorden y, al ordenar el listado por urgencia, el sistema respetó el orden de la lista —alta, media, ' +
      'baja— y no el alfabético, de modo que los más cercanos a contratar quedan arriba. Configuración de una ' +
      'sola vez, sin programar.',
    evidencia: [capOrden],
    medicion: `Orden obtenido: ${orden.join(' · ')}`,
  });
});
