import { test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { alistarEntidad } from '../preparar';
import { cargarCartera } from '../datos';
import { citar } from '../fuentes';
import { apiEspo, crear, listar } from '../api';
import {
  soloEn, capturar, textoDe, elegirLista, listadoLimpio, agregarFiltro, aplicarFiltros, filasDelListado,
} from './comun';
import { ficha, alta, edicion, administracion } from '../espocrm/navegar';

/**
 * A.4 — Marketing, segmentación y reputación
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema.
 */

test.describe.configure({ mode: 'serial' });

const SEGMENTO = 'Asegurados de Buenos Aires';

test.beforeAll(async ({ browser }, info) => {
  test.setTimeout(900_000);
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api, asegurados } = await cargarCartera();
  // La cartera de referencia, con domicilio: la mitad en la ciudad del segmento
  for (const [i, id] of asegurados.entries()) {
    await api.put(`Contact/${id}`, { data: { addressCity: i % 2 ? 'Rosario' : 'Buenos Aires' } });
  }

  // Motivo de pérdida y competidor, para A.4.7: la oportunidad no los trae
  const campos = (await (await api.get('Metadata')).json()).entityDefs.Opportunity.fields;
  if (!campos.cMotivoPerdida) {
    await api.post('Admin/fieldManager/Opportunity', { data: {
      name: 'motivoPerdida', type: 'enum', label: 'Motivo de pérdida',
      options: ['', 'Precio', 'Cobertura', 'Atención', 'Eligió otra compañía'],
    } });
  }
  if (!campos.cCompetidor) {
    await api.post('Admin/fieldManager/Opportunity', { data: { name: 'competidor', type: 'varchar', label: 'Competidor que la ganó' } });
  }

  const pagina = await (await browser.newContext()).newPage();
  try {
    await entrar(pagina, 'espocrm');
    await alistarEntidad(pagina, 'Contact', { filters: ['addressCity'] });
    await alistarEntidad(pagina, 'Opportunity', { detail: ['cMotivoPerdida', 'cCompetidor'] });
  } finally {
    await pagina.context().close();
  }

  // Lo que dejaron corridas anteriores se quita: cada corrida mide lo mismo
  for (const [entidad, patron] of [['TargetList', SEGMENTO], ['Campaign', 'Renovación hogar 2026'],
    ['EmailTemplate', 'Renovación hogar'], ['Opportunity', 'Seguro de vida — perdida']] as const) {
    for (const r of (await listar(api, entidad, { maxSize: 200 })).list.filter((r: any) => r.name?.startsWith(patron))) {
      await api.delete(`${entidad}/${r.id}`);
    }
  }
});

// ── A.4.1 ────────────────────────────────────────────────────────────────────
test('A.4.1 — Segmentación reutilizable de la cartera', async ({ page }, info) => {
  // «Definir un conjunto de asegurados por un criterio, guardarlo con nombre y
  //  volver a abrirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  await listadoLimpio(page, 'Contact');
  await agregarFiltro(page, 'addressCity');
  await page.locator('.filter[data-name="addressCity"] input.main-element').first().pressSequentially('Buenos Aires', { delay: 30 });
  await aplicarFiltros(page);
  const definido = await filasDelListado(page);

  // Guardarlo con nombre
  await page.locator('.filters-button').first().click();
  await page.locator('[data-action="savePreset"]').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('input').first().pressSequentially(SEGMENTO, { delay: 20 });
  await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(3000);
  const capGuardado = await capturar(page, 'A.4.1', plataforma, '1-segmento-guardado');

  // Volver a abrirlo en otra sesión del listado
  await listadoLimpio(page, 'Contact');
  await page.locator('.filters-button').first().click();
  await page.locator('a[data-action="selectPreset"]').filter({ hasText: SEGMENTO }).first().click();
  await page.waitForTimeout(3500);
  const reabierto = await filasDelListado(page);
  const capReabierto = await capturar(page, 'A.4.1', plataforma, '2-segmento-reabierto');

  expect(definido.length, 'el criterio debe seleccionar parte de la cartera').toBeGreaterThan(0);
  expect(reabierto.sort(), 'al reabrirlo debe devolver el mismo conjunto').toEqual(definido.sort());

  registrar({
    criterio: 'A.4.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde el listado de asegurados se definió un conjunto por un criterio —los que viven en Buenos Aires— ' +
      'y se lo guardó con nombre desde el menú de filtros. Al volver al listado, el segmento figura entre los ' +
      'filtros guardados y devuelve el mismo conjunto sin rearmarlo. Guardar segmentos viene de fábrica; que ' +
      'la ciudad esté disponible como condición exigió habilitarla una vez entre los filtros de búsqueda.',
    evidencia: [capGuardado, capReabierto],
    medicion: `${definido.length} asegurados en el segmento`,
  });
});

// ── A.4.2 ────────────────────────────────────────────────────────────────────
test('A.4.2 — Diseño de campañas sobre un segmento', async ({ page }, info) => {
  // «Crear una campaña dirigida a un segmento guardado y personalizar su contenido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const api = await apiEspo();
  await entrar(page, plataforma);

  // El segmento se vuelca a una lista de destinatarios: desde la lista, se
  // seleccionan los contactos con el mismo filtro guardado
  await listadoLimpio(page, 'Contact');
  await page.locator('.filters-button').first().click();
  await page.locator('a[data-action="selectPreset"]').filter({ hasText: SEGMENTO }).first().click();
  await page.waitForTimeout(3500);
  const destinatarios = await filasDelListado(page);
  const lista = await crear(api, 'TargetList', { name: SEGMENTO });
  await ficha(page, 'TargetList', lista);
  const panel = page.locator('.panel[data-name="contacts"]').first();
  await panel.waitFor({ state: 'visible', timeout: 40_000 });
  // La acción está en el menú desplegable del panel
  const seleccionar = panel.locator('[data-action="selectRelated"]').first();
  if (!(await seleccionar.isVisible())) await panel.locator('.dropdown-toggle').first().click();
  await seleccionar.click();
  const selector = page.locator('.modal-dialog').first();
  await selector.waitFor({ state: 'visible', timeout: 20_000 });
  await selector.locator('.filters-button').first().click();
  await selector.locator('a[data-action="selectPreset"]').filter({ hasText: SEGMENTO }).first().click();
  await page.waitForTimeout(3000);
  await selector.locator('thead input[type="checkbox"]').first().check({ force: true });
  await selector.locator('button[data-name="select"]').first().click();
  await page.waitForTimeout(4000);
  const capLista = await capturar(page, 'A.4.2', plataforma, '1-lista-desde-el-segmento');

  // El contenido, personalizado con los datos de cada destinatario
  await alta(page, 'EmailTemplate');
  const nombre = page.locator('input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially('Renovación hogar', { delay: 20 });
  await page.locator('input[data-name="subject"]').first().pressSequentially('{Person.firstName}, su póliza de hogar vence pronto', { delay: 10 });
  const cuerpo = page.locator('.field[data-name="body"] .note-editable, .field[data-name="body"] [contenteditable="true"]').first();
  await cuerpo.click();
  await cuerpo.pressSequentially('Hola {Person.firstName}: le escribimos para renovar su cobertura de hogar.', { delay: 5 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  const capPlantilla = await capturar(page, 'A.4.2', plataforma, '2-contenido-personalizado');

  // La campaña, dirigida a esa lista
  await alta(page, 'Campaign');
  await page.locator('input[data-name="name"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.locator('input[data-name="name"]').first().pressSequentially('Renovación hogar 2026', { delay: 20 });
  await elegirLista(page, 'type', 'Email');
  const listas = page.locator('.field[data-name="targetLists"] input[type="text"]').first();
  await listas.click();
  await listas.pressSequentially(SEGMENTO.slice(0, 12), { delay: 40 });
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: SEGMENTO }).first().click({ timeout: 15_000 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#Campaign\/view\//, { timeout: 30_000 });
  await page.waitForTimeout(3000);
  const capCampana = await capturar(page, 'A.4.2', plataforma, '3-campana');

  const enLista = (await (await api.get(`TargetList/${lista}/contacts`, { params: { maxSize: 200 } })).json()).total;
  const campana = (await listar(api, 'Campaign', { maxSize: 200 })).list.find((c: any) => c.name === 'Renovación hogar 2026');

  expect(enLista, 'la lista debe contener el segmento completo').toBe(destinatarios.length);
  expect(campana, 'la campaña debe quedar creada').toBeTruthy();

  registrar({
    criterio: 'A.4.2',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El segmento guardado se volcó entero a una lista de destinatarios, seleccionando desde la lista con el ' +
      'mismo filtro guardado, y se creó ' +
      'una campaña de correo dirigida a esa lista. El contenido se escribió en una plantilla con marcadores que ' +
      'el sistema reemplaza por los datos de cada destinatario —el nombre en el asunto y en el saludo—, de modo ' +
      'que cada asegurado recibe un mensaje dirigido a él. Campañas, listas y plantillas vienen de fábrica.',
    evidencia: [capLista, capPlantilla, capCampana],
    medicion: `${enLista} destinatarios en la lista de la campaña`,
  });
});

// ── A.4.3 ────────────────────────────────────────────────────────────────────
test('A.4.3 — Medición de los resultados de la campaña', async ({ page, request: http }, info) => {
  // «Comprobar que el sistema registra envíos, aperturas o respuestas de la
  //  campaña realizada»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(2_100_000);

  const { CORREO, vaciarCasillas, recibidos, correrTareas, habilitarServidorDePrueba } = await import('../correo');
  const api = await apiEspo();
  await habilitarServidorDePrueba(api);
  await vaciarCasillas();

  // El correo saliente de la compañía: una cuenta grupal con el servidor de
  // envío, designada para las campañas, y su dirección como la del sistema.
  // Es configuración de una vez desde la administración.
  const REMITENTE = 'comercial@aseguradora.test';
  for (const c of (await listar(api, 'InboundEmail', { maxSize: 50 })).list.filter((c: any) => c.emailAddress === REMITENTE)) {
    await api.delete(`InboundEmail/${c.id}`);
  }
  await crear(api, 'InboundEmail', {
    name: 'Comercial', emailAddress: REMITENTE, status: 'Active', useImap: false,
    useSmtp: true, smtpIsShared: true, smtpIsForMassEmail: true,
    smtpHost: CORREO.host, smtpPort: CORREO.smtp, smtpAuth: false, smtpSecurity: '', fromName: 'Aseguradora — Comercial',
  });
  // El seguimiento de aperturas viene apagado: se activa en la misma configuración
  const r = await api.put('Settings', { data: {
    outboundEmailFromAddress: REMITENTE, outboundEmailFromName: 'Aseguradora — Comercial', massEmailOpenTracking: true,
  } });
  expect(r.ok(), 'la dirección de salida del sistema debe aceptarse').toBeTruthy();

  // El envío de la campaña de A.4.2, a su lista, con su plantilla
  const campana = (await listar(api, 'Campaign', { maxSize: 200 })).list.find((c: any) => c.name === 'Renovación hogar 2026');
  const plantilla = (await listar(api, 'EmailTemplate', { maxSize: 200 })).list.find((t: any) => t.name === 'Renovación hogar');
  const lista = (await listar(api, 'TargetList', { maxSize: 200 })).list.find((t: any) => t.name === SEGMENTO);
  expect(plantilla && lista, 'la plantilla y la lista de A.4.2 deben existir').toBeTruthy();
  for (const m of (await listar(api, 'MassEmail', { maxSize: 200 })).list.filter((m: any) => m.campaignId === campana.id)) {
    await api.delete(`MassEmail/${m.id}`);
  }
  // El envío se programa desde la ficha de la campaña, con arranque hoy a las 00:00: sale en la próxima ventana
  await entrar(page, plataforma);
  await ficha(page, 'Campaign', campana.id);
  await page.locator('.panel[data-name="massEmails"] [data-action="createRelated"]').first().click();
  const modal = page.locator('.modal-dialog:visible');
  await modal.locator('.field[data-name="name"] input').first().fill('Renovación hogar — primer envío');
  await elegirLista(page, 'status', 'Pending', '.modal-dialog:visible');
  const hoy = new Date();
  const dia = `${String(hoy.getDate()).padStart(2, '0')}.${String(hoy.getMonth() + 1).padStart(2, '0')}.${hoy.getFullYear()}`;
  const fecha = modal.locator('.field[data-name="startAt"] input[data-name="startAt"]');
  await fecha.click();
  await fecha.pressSequentially(dia);
  await modal.locator('.field[data-name="startAt"] input[data-name="startAt-time"]').click();
  await page.locator('.ui-timepicker-wrapper:visible li').filter({ hasText: /^00:00$/ }).first().click();
  // La lista de la campaña viene puesta; la plantilla se elige
  for (const [campo, nombre] of [['targetLists', SEGMENTO], ['emailTemplate', 'Renovación hogar']] as const) {
    const control = modal.locator(`.field[data-name="${campo}"]`);
    if (campo === 'targetLists' && (await control.innerText()).includes(nombre)) continue;
    const entrada = control.locator('input[type="text"]').first();
    await entrada.click();
    await entrada.pressSequentially(nombre.slice(0, 12));
    await page.locator('.autocomplete-suggestion:visible').filter({ hasText: nombre }).first().click({ timeout: 15_000 });
  }
  await modal.locator('.field[data-name="fromAddress"] input').first().fill(REMITENTE);
  await modal.locator('.field[data-name="fromName"] input').first().fill('Aseguradora — Comercial');
  const capEnvio = await capturar(page, 'A.4.3', plataforma, '0-envio-programado');
  await modal.locator('button[data-name="save"]').first().click();
  await expect(modal).toBeHidden({ timeout: 15_000 });
  const envio = (await listar(api, 'MassEmail', { maxSize: 200 })).list.find((m: any) => m.campaignId === campana.id);
  expect(envio, 'el envío debe quedar programado en la campaña').toBeTruthy();
  // El envío masivo sale en la próxima ventana programada del sistema —a los
  // 10, 30 y 50 minutos de cada hora—: se corre el programador cada minuto,
  // como lo hace el servidor, hasta que la campaña salga
  const logDe = async () => (await (await api.get('CampaignLogRecord', { params: {
    maxSize: 200, 'where[0][type]': 'equals', 'where[0][attribute]': 'campaignId', 'where[0][value]': campana.id,
  } })).json()).list ?? [];
  for (let minuto = 0; minuto < 25 && !(await logDe()).some((x: any) => x.action === 'Sent'); minuto++) {
    await correrTareas(1);
    await page.waitForTimeout(56_000);
  }
  await correrTareas(2);

  // Lo que llegó a las casillas de los asegurados
  // El listado de la lista trae solo los identificadores: los datos se leen de cada ficha
  const ids = (await (await api.get(`TargetList/${lista.id}/contacts`, { params: { maxSize: 200 } })).json()).list;
  const destinatarios = await Promise.all(ids.map(async (c: any) => (await api.get(`Contact/${c.id}`)).json()));
  const llegados = [];
  for (const d of destinatarios) {
    const m = (await recibidos(d.emailAddress))[0];
    if (m) llegados.push({ destinatario: d, mensaje: m });
  }
  // Uno de ellos lo abre: su programa de correo carga la imagen de seguimiento
  const abierto = llegados[0];
  // El cuerpo puede venir codificado: se busca el enlace en el texto crudo y en sus partes decodificadas
  const crudo = abierto?.mensaje.mimeMessage ?? '';
  const partes = [crudo.replace(/=\r?\n/g, '').replace(/=3D/g, '='),
    ...(crudo.match(/(?:[A-Za-z0-9+/]{60,}\r?\n)+[A-Za-z0-9+/=]*/g) ?? [])
      .map(b => Buffer.from(b.replace(/\s/g, ''), 'base64').toString('utf8'))];
  const pixel = partes.join('\n').match(/https?:\/\/[^"'\s>]*entryPoint=campaignTrackOpened[^"'\s>]*/)?.[0]
    ?.replace(/&amp;/g, '&');
  if (pixel) await http.get(pixel);
  await page.waitForTimeout(3000);

  const registro = await logDe();
  const enviados = registro.filter((x: any) => x.action === 'Sent').length;
  const aperturas = registro.filter((x: any) => x.action === 'Opened').length;

  await entrar(page, plataforma);
  await ficha(page, 'Campaign', campana.id);
  await page.waitForTimeout(6000);
  const capCampana = await capturar(page, 'A.4.3', plataforma, '1-resultados-de-la-campana');

  const personalizado = abierto && abierto.mensaje.subject.includes(abierto.destinatario.firstName);
  console.log(`    enviados ${enviados} · llegados ${llegados.length} · aperturas ${aperturas} · asunto «${abierto?.mensaje.subject}»`);

  expect(llegados.length, 'la campaña debe llegar a la lista').toBe(destinatarios.length);
  expect(enviados, 'el sistema debe registrar cada envío').toBe(destinatarios.length);
  expect(aperturas, 'el sistema debe registrar la apertura').toBeGreaterThan(0);
  expect(personalizado, 'cada mensaje lleva el nombre de su destinatario').toBeTruthy();

  registrar({
    criterio: 'A.4.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      `La campaña se envió a su lista y llegaron los ${llegados.length} mensajes, cada uno con el nombre de ` +
      `su destinatario en el asunto —"${abierto.mensaje.subject}"—. El registro de la campaña anotó cada ` +
      'envío y, cuando uno de los asegurados abrió el mensaje, anotó también la apertura, con la fecha y el ' +
      'destinatario. Lo mismo hace con los clics en enlaces seguidos y las bajas. La medición viene en el ' +
      'producto; lo que hay que configurar una vez es el servidor de correo saliente de la compañía y activar, ' +
      'en esa misma configuración, el seguimiento de aperturas, que viene apagado.',
    evidencia: [capEnvio, capCampana],
    medicion: `${enviados} envíos y ${aperturas} apertura registrados`,
  });
});

// ── A.4.4 ────────────────────────────────────────────────────────────────────
test('A.4.4 — Captación de interesados desde redes sociales', async ({ page, browser }, info) => {
  // «Buscar la conexión con alguna red social y comprobar que permite
  //  incorporar interesados a la base»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/integrations');
  await page.waitForTimeout(4000);
  const integraciones = await textoDe(page);
  const capIntegraciones = await capturar(page, 'A.4.4', plataforma, '1-integraciones');
  await administracion(page, '#Admin/leadCapture');
  await page.waitForTimeout(4000);
  const capCaptura = await capturar(page, 'A.4.4', plataforma, '2-captura-de-posibles-clientes');

  const fuente = await citar(browser, {
    url: 'https://www.espocrm.com/features/web-to-lead/',
    buscar: 'create web forms for capturing information',
    captura: 'A-4-4-espocrm-3-formulario-web',
  });

  expect(/facebook|instagram|linkedin|twitter|meta\b/i.test(integraciones), 'no hay conexión con redes').toBeFalsy();

  registrar({
    criterio: 'A.4.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El producto no se conecta con ninguna red social: la administración de integraciones no ofrece ' +
      'ninguna y el catálogo del fabricante tampoco. Lo que sí trae es la captura de posibles clientes, un ' +
      'formulario web propio que carga solo a cada interesado que lo completa. Enlazado desde las ' +
      'publicaciones y los perfiles de la compañía, incorpora a la base a quien llega desde una red; pero cada ' +
      'campaña en la red tiene que llevar ese enlace, y los interesados que escriben por mensaje o comentan en ' +
      'la publicación se cargan a mano.',
    evidencia: [capIntegraciones, capCaptura],
    documentacion: fuente,
  });
});

// ── A.4.5 y A.4.6 ────────────────────────────────────────────────────────────
// La escucha de menciones y la publicación en redes se resuelven igual: se
// busca la función en el sistema y en el catálogo oficial del fabricante.
for (const [id, nombre, procedimiento, buscado] of [
  ['A.4.5', 'Escucha de menciones en canales públicos',
    'Buscar la función de seguimiento de menciones de la compañía y de la competencia',
    'el seguimiento de lo que se dice de la compañía y de la competencia en redes y medios'],
  ['A.4.6', 'Publicación en redes desde el sistema',
    'Componer una publicación y emitirla a una red conectada desde el propio sistema, sin pasar por la herramienta de la red',
    'la publicación en redes sociales desde el propio sistema'],
] as const) {
  test(`${id} — ${nombre}`, async ({ page, browser }, info) => {
    // «${procedimiento}»
    const plataforma = plataformaDe(info.project.name);
    soloEn(plataforma, 'espocrm');
    test.setTimeout(400_000);

    await entrar(page, plataforma);
    await administracion(page);
    await page.waitForTimeout(5000);
    const admin = await textoDe(page);
    const capAdmin = await capturar(page, id, plataforma, '1-administracion');

    // El catálogo oficial completo: si una función existe en alguna edición, está acá
    const catalogo = await citar(browser, {
      url: 'https://www.espocrm.com/extensions/',
      buscar: 'Real Estate',
      captura: `${id.replace(/\./g, '-')}-espocrm-2-catalogo`,
    });

    expect(/social|redes|facebook|twitter|linkedin|instagram|menciones/i.test(admin)).toBeFalsy();

    registrar({
      criterio: id,
      plataforma,
      cumple: 0,
      justificacion:
        `El producto no ofrece ${buscado}, en ninguna edición: la administración no tiene ninguna función de ` +
        'redes sociales y el catálogo oficial de extensiones —informes y automatización, ventas, proyectos, ' +
        'inteligencia artificial, telefonía, agenda de reuniones, integraciones con Outlook, Google, Zoom, ' +
        'Stripe y MailChimp— no incluye ninguna. La compañía tendría que resolverlo con otra herramienta.',
      evidencia: [capAdmin],
      documentacion: catalogo,
    });
  });
}

// ── A.4.7 ────────────────────────────────────────────────────────────────────
test('A.4.7 — Registro de la competencia y del motivo de pérdida', async ({ page }, info) => {
  // «Marcar una oportunidad como perdida y comprobar si admite registrar el
  //  motivo y el competidor que la ganó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  const api = await apiEspo();
  const id = await crear(api, 'Opportunity', {
    name: 'Seguro de vida — perdida', amount: 60000, amountCurrency: 'ARS', stage: 'Negotiation',
    closeDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
  });

  await entrar(page, plataforma);
  await edicion(page, 'Opportunity', id);
  await page.locator('.field[data-name="stage"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'stage', 'Closed Lost');
  await elegirLista(page, 'cMotivoPerdida', 'Precio');
  await page.locator('input[data-name="cCompetidor"]').first().pressSequentially('La Previsora Seguros', { delay: 20 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  const capPerdida = await capturar(page, 'A.4.7', plataforma, '1-perdida-con-motivo');

  const guardada = await (await api.get(`Opportunity/${id}`)).json();

  expect(guardada.stage).toBe('Closed Lost');
  expect(guardada.lastStage, 'el sistema conserva en qué etapa se perdió').toBe('Negotiation');
  expect(guardada.cMotivoPerdida).toBe('Precio');
  expect(guardada.cCompetidor).toBe('La Previsora Seguros');

  registrar({
    criterio: 'A.4.7',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Al marcar una oportunidad como perdida, el sistema conserva por su cuenta la etapa en la que se ' +
      'perdió —negociación, en este caso—. El motivo y el competidor que la ganó no vienen de fábrica: se ' +
      'agregaron como dos campos de la oportunidad desde la administración, una lista de motivos y el nombre ' +
      'del competidor, y quedaron registrados junto con la pérdida. Con eso la compañía puede saber por qué ' +
      'pierde ventas y contra quién.',
    evidencia: [capPerdida],
  });
});
