import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import {
  objeto, registros, borrarRegistro, nuevoCampo, conOpciones, quitarCampo, abrirFicha, abrirListado, configuracion, elegirEnFicha,
  escribirEnFicha, clicReal, esperarCarga, textoDe, conectarCasilla, quitarCasilla,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirOpcion, elegirObjeto, agregarPaso, abrirVariables, elegirVariable,
  accionEnBucle, botonDelFlujo,
} from '../../twenty/flujos';
import { CORREO, recibidos, vaciarCasillas, enviarDesdeAfuera } from '../../correo';
import { cargarCartera, relacion, PRODUCTOR } from '../../twenty/escenario';

/**
 * A.4 — Marketing, segmentación y reputación, sobre Twenty
 */

test.describe.configure({ mode: 'serial' });

const PRODUCTOR_NOMBRE = `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`;
const SEGMENTO = 'Cartera de Pablo Gómez';

/** Filas visibles del listado. */
const filas = (page: Page) => page.locator('[data-testid^="row-id-"]')
  .evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')!));

// ── A.4.1 ────────────────────────────────────────────────────────────────────
test('A.4.1 — Segmentación reutilizable de la cartera', async ({ page, browser }, info) => {
  // «Definir un conjunto de asegurados por un criterio, guardarlo con nombre y
  //  volver a abrirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  // El criterio: los asegurados a cargo del productor (el responsable lo agrega A.3.1)
  await relacion(e.api, 'person', 'productorResponsable', 'Productor responsable', 'workspaceMember', 'Asegurados a cargo');
  for (const [i, id] of e.asegurados.entries()) {
    await e.api.patch(`people/${id}`, { data: { productorResponsableId: i < 3 ? e.productor : null } });
  }
  const esperados = e.asegurados.slice(0, 3).sort();

  await abrirListado(page, 'people');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Productor responsable', { exact: true }).last());
  await clicReal(page, page.getByText(PRODUCTOR_NOMBRE, { exact: true }).last());
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape');
  const filtradas = (await filas(page)).sort();

  // Se guarda como vista con nombre
  await clicReal(page, page.getByText(/Guardar como nueva vista|Save as new view/).filter({ visible: true }).first());
  const nombre = page.locator('input:focus').first();
  await nombre.waitFor({ state: 'visible', timeout: 15_000 });
  await nombre.press('Control+a');
  await nombre.pressSequentially(SEGMENTO, { delay: 50 });
  await clicReal(page, page.getByText(/^Crear$|^Create$|^Guardar$|^Save$/).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  const capGuardado = await capturar(page, 'A.4.1', plataforma, '1-segmento-guardado');

  // Se sale del listado y se vuelve a abrir el segmento por su nombre
  await abrirListado(page, 'opportunities');
  await abrirListado(page, 'people');
  await clicReal(page, page.getByText(/^All People$|^Cartera de Pablo Gómez$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText(SEGMENTO, { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(4000);
  const reabiertas = (await filas(page)).sort();
  const capReabierto = await capturar(page, 'A.4.1', plataforma, '2-segmento-reabierto');

  expect(filtradas, 'el filtro debe traer los asegurados del productor').toEqual(esperados);
  expect(reabiertas, 'el segmento reabierto debe traer el mismo conjunto').toEqual(esperados);

  registrar({
    criterio: 'A.4.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Desde el listado de asegurados se definió un conjunto por un criterio —los que están a cargo de un ' +
      'productor— y se lo guardó con nombre como una vista, desde el propio filtro. Al volver al listado, el ' +
      'segmento figura en el selector de vistas; al abrirlo trajo de nuevo los mismos asegurados, y como el ' +
      'filtro se guarda y no la lista, un asegurado que cumpla el criterio más adelante entra solo. Viene listo.',
    evidencia: [capGuardado, capReabierto],
    medicion: `${reabiertas.length} asegurados en el segmento`,
  });
});

const COMERCIAL = 'comercial@aseguradora.test';
const CAMPANA = 'Campaña de renovación';
const ASUNTO = 'su póliza vence pronto';
const ASUNTO_TEXTO = 'Su póliza vence pronto';

// ── A.4.2 ────────────────────────────────────────────────────────────────────
test('A.4.2 — Diseño de campañas sobre un segmento', async ({ page, browser }, info) => {
  // «Crear una campaña dirigida a un segmento guardado y personalizar su
  //  contenido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await vaciarCasillas();
  for (const w of (await registros(e.api, 'workflows')).filter(w => [CAMPANA, 'Exploracion webhook'].includes(w.name))) {
    await borrarRegistro(e.api, 'workflows', w.id);
  }
  // La casilla comercial de la compañía, desde la que sale la campaña
  await quitarCasilla(page, COMERCIAL);
  await conectarCasilla(page, { nombre: 'Comercial', correo: COMERCIAL, servidor: CORREO.host, imap: CORREO.imap, smtp: CORREO.smtp });

  // Twenty no trae campañas en esta edición: se arma una con un flujo que se lanza
  // sobre los asegurados marcados y le escribe a cada uno por su nombre
  await nuevoFlujo(page, CAMPANA);
  await ponerDisparador(page, 'Launch manually', /^Disponibilidad$|^Availability$/);
  await elegirOpcion(page, 'Global', 'Bulk');
  await elegirObjeto(page, 'People');
  await agregarPaso(page, 'Iterator');
  await abrirVariables(page, 'Elementos para iterar');
  await elegirVariable(page, 'Records', 'People');
  await accionEnBucle(page, 'Send Email', /^De$|^From$/);
  await abrirVariables(page, 'Para');
  await elegirVariable(page, 'Iterator', 'Current Item (Person)', 'Emails', /Primary Email|Correo principal/);
  // El texto primero y el nombre al final: lo que se escribe después de una variable se pierde
  const asunto = page.getByText('Asunto', { exact: true }).last();
  await clicReal(page, asunto.locator('xpath=following::*[@contenteditable="true"][1]'));
  await page.keyboard.type(`${ASUNTO_TEXTO}, `, { delay: 40 });
  await abrirVariables(page, 'Asunto');
  await elegirVariable(page, 'Iterator', 'Current Item (Person)', 'Name', /First Name|Nombre/);
  const cuerpo = page.getByText('Cuerpo', { exact: true }).last();
  await clicReal(page, cuerpo.locator('xpath=following::*[@contenteditable="true"][1]'));
  await page.keyboard.type('Le escribimos para acordar la renovación de su póliza de hogar.', { delay: 20 });
  await page.keyboard.press('Escape');
  const capCampana = await capturar(page, 'A.4.2', plataforma, '1-campana');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  // El segmento guardado en A.4.1: se lo abre, se marcan todos y se lanza la campaña
  await abrirListado(page, 'people');
  await clicReal(page, page.getByText(/^All People$|^Cartera de Pablo Gómez$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText(SEGMENTO, { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(4000);
  const segmento = await filas(page);
  await clicReal(page, page.getByRole('checkbox', { name: /Seleccionar todas las filas|Select all/ }).first());
  await clicReal(page, page.getByTestId('page-header-side-panel-button'));
  await clicReal(page, page.getByText(CAMPANA, { exact: true }).filter({ visible: true }).last());

  const destinatarios = (await registros(e.api, 'people')).filter(p => segmento.includes(p.id));
  const llegaron: { correo: string; asunto: string }[] = [];
  for (let espera = 0; espera < 24 && llegaron.length < destinatarios.length; espera++) {
    await page.waitForTimeout(5000);
    llegaron.length = 0;
    for (const d of destinatarios) {
      const m = (await recibidos(d.emails.primaryEmail)).find(x => x.subject.toLowerCase().includes(ASUNTO));
      if (m) llegaron.push({ correo: d.emails.primaryEmail, asunto: m.subject });
    }
  }
  const capEnviada = await capturar(page, 'A.4.2', plataforma, '2-campana-lanzada');

  expect(llegaron.length, 'cada asegurado del segmento debe recibir la campaña').toBe(destinatarios.length);
  expect(llegaron.every(l => destinatarios.some(d => l.asunto.endsWith(d.name.firstName))),
    'cada mensaje debe llevar el nombre de su destinatario').toBeTruthy();

  registrar({
    criterio: 'A.4.2',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'La edición evaluada no trae campañas: el fabricante las tiene en beta y las habilita a ' +
      'pedido. Se armó una con un flujo de trabajo que se lanza sobre los registros marcados y le envía a cada ' +
      'uno un correo desde la casilla comercial, con su nombre en el asunto. Se abrió el segmento guardado, se ' +
      `marcaron sus ${destinatarios.length} asegurados, se lanzó la campaña y cada uno recibió su mensaje, ` +
      `personalizado —«${llegaron[0]?.asunto}»—. Funciona, pero cada campaña nueva es un flujo nuevo que alguien ` +
      'tiene que armar, y no hay dónde programarla, darle de baja a un destinatario ni ver sus resultados.',
    evidencia: [capCampana, capEnviada],
    documentacion: await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/email-campaigns/overview',
      buscar: /Email campaigns are in beta/i,
      captura: 'A-4-2-twenty-3-campanas-en-beta',
    }),
    medicion: `${llegaron.length} de ${destinatarios.length} mensajes recibidos`,
  });
});

// ── A.4.3 ────────────────────────────────────────────────────────────────────
test('A.4.3 — Medición de los resultados de la campaña', async ({ page, browser }, info) => {
  // «Comprobar que el sistema registra envíos, aperturas o respuestas de la
  //  campaña realizada»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const flujo = (await registros(e.api, 'workflows')).find(w => w.name === CAMPANA);
  expect(flujo, 'A.4.2 debe haber dejado la campaña').toBeTruthy();

  // Los envíos: cada lanzamiento queda como una corrida del flujo, con su resultado
  const corridas = (await registros(e.api, 'workflowRuns')).filter(r => r.workflowId === flujo.id);
  await abrirFicha(page, 'workflow', flujo.id);
  await esperarCarga(page, 6000);
  await clicReal(page, page.getByText(/^See Runs$|^Ver ejecuciones$/).filter({ visible: true }).first());
  await page.waitForTimeout(4000);
  const capCorridas = await capturar(page, 'A.4.3', plataforma, '1-envios');

  // Las respuestas: un asegurado contesta y la casilla sincronizada la trae a su ficha
  const asegurado = (await registros(e.api, 'people')).find(p => p.id === e.asegurados[0]);
  enviarDesdeAfuera(asegurado.emails.primaryEmail, COMERCIAL, `Re: ${asegurado.name.firstName}, ${ASUNTO}`, 'Sí, quiero renovar.');
  let respuesta = '';
  for (let espera = 0; espera < 30 && !/Sí, quiero renovar|Re:/.test(respuesta); espera++) {
    await page.waitForTimeout(20_000);
    await abrirFicha(page, 'person', asegurado.id);
    await clicReal(page, page.getByText('Emails', { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(3000);
    respuesta = await textoDe(page);
  }
  const capRespuesta = await capturar(page, 'A.4.3', plataforma, '2-respuesta-en-la-ficha');
  const conRespuesta = /Re:/.test(respuesta);

  expect(corridas.length, 'el envío debe quedar registrado').toBeGreaterThan(0);

  registrar({
    criterio: 'A.4.3',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'De la campaña armada con un flujo de trabajo queda el registro del envío: cada lanzamiento es una ' +
      'corrida con el resultado de cada paso. ' +
      (conRespuesta
        ? 'Las respuestas llegan: el asegurado contestó y la casilla sincronizada trajo su respuesta a su ficha. '
        : 'La respuesta de un asegurado no llegó a su ficha en los diez minutos de espera. ') +
      'Las aperturas no se registran, y nada reúne los resultados de la campaña: cuántos la recibieron, cuántos ' +
      'contestaron. Saberlo exige revisar las corridas y las fichas, una por una, después de cada envío.',
    evidencia: [capCorridas, capRespuesta],
    medicion: `${corridas.length} corrida(s) registradas; respuesta en la ficha: ${conRespuesta ? 'sí' : 'no'}`,
  });
});

// ── A.4.4 ────────────────────────────────────────────────────────────────────
test('A.4.4 — Captación de interesados desde redes sociales', async ({ page, browser }, info) => {
  // «Buscar la conexión con alguna red social y comprobar que permite
  //  incorporar interesados a la base»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const FLUJO = 'Alta de interesados desde formularios';
  for (const w of (await registros(e.api, 'workflows')).filter(w => w.name === FLUJO)) await borrarRegistro(e.api, 'workflows', w.id);
  for (const p of (await registros(e.api, 'people')).filter(p => p.emails?.primaryEmail === 'interesado.redes@ejemplo.test')) {
    await borrarRegistro(e.api, 'people', p.id);
  }

  // No hay conexión con redes: la vía de entrada es un webhook, al que un
  // intermediario le pasa lo que llega de un formulario de anuncios
  await nuevoFlujo(page, FLUJO);
  await ponerDisparador(page, 'Webhook', /^URL activa$|^Live URL$/);
  await elegirOpcion(page, 'GET', 'POST');
  const editor = page.getByText(/^Cuerpo esperado$|^Expected body$/).last().locator('xpath=following::*[@contenteditable="true" or self::textarea][1]');
  await clicReal(page, editor);
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText('{"nombre": "Nombre", "apellido": "Apellido", "correo": "correo@ejemplo.test"}');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(2000);
  const url = await page.locator('input:visible').evaluateAll(es => es.map(e => (e as HTMLInputElement).value).find(v => v.includes('/webhooks/workflows/')));
  await agregarPaso(page, 'Create Record');
  await elegirObjeto(page, 'People');
  await abrirVariables(page, 'Nombre');
  await elegirVariable(page, 'nombre');
  await abrirVariables(page, 'Apellidos');
  await elegirVariable(page, 'apellido');
  await abrirVariables(page, 'Correo Electrónico Principal');
  await elegirVariable(page, 'correo');
  await page.keyboard.press('Escape');
  const capFlujo = await capturar(page, 'A.4.4', plataforma, '1-entrada-por-webhook');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  // Lo que mandaría el intermediario al llegar un interesado desde un anuncio
  // Desde afuera y sin la sesión del navegador, como llega un pedido de otro sistema
  const r = await fetch(url!.startsWith('http') ? url! : `http://${url}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Valentina', apellido: 'Redes', correo: 'interesado.redes@ejemplo.test' }),
  });
  console.log(`    webhook → ${r.status} ${(await r.text()).slice(0, 200)}`);
  let alta: any;
  for (let espera = 0; espera < 20 && !alta; espera++) {
    await page.waitForTimeout(3000);
    alta = (await registros(e.api, 'people')).find(p => p.emails?.primaryEmail === 'interesado.redes@ejemplo.test');
  }
  await abrirListado(page, 'people');
  const capAlta = await capturar(page, 'A.4.4', plataforma, '2-interesado-incorporado');

  expect(r.ok, 'el webhook debe aceptar el pedido').toBeTruthy();
  expect(alta, 'el interesado debe quedar en la base').toBeTruthy();

  registrar({
    criterio: 'A.4.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El producto no se conecta con ninguna red social: las cuentas que se pueden conectar son de correo y ' +
      'calendario, y el catálogo de aplicaciones no ofrece ninguna. Lo que sí trae es un disparador de flujos ' +
      'por webhook: se armó un flujo que recibe nombre, apellido y correo y da de alta a la persona, y un pedido ' +
      'con esos datos —lo que enviaría un intermediario al llegar un interesado desde un formulario de ' +
      'anuncios— la incorporó a la base. La conexión con cada red queda a cargo de ese intermediario, que ' +
      'hay que contratar y mantener aparte.',
    evidencia: [capFlujo, capAlta],
  });
});

// ── A.4.5 ────────────────────────────────────────────────────────────────────
test('A.4.5 — Escucha de menciones en canales públicos', async ({ page, browser }, info) => {
  // «Buscar la función de seguimiento de menciones de la compañía y de la
  //  competencia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // El catálogo de aplicaciones del fabricante, dentro del producto
  await configuracion(page, /^Aplicaciones$|^Applications$/);
  const catalogo = await textoDe(page);
  const capCatalogo = await capturar(page, 'A.4.5', plataforma, '1-catalogo-de-aplicaciones');
  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/getting-started/core-concepts/apps',
    buscar: /custom objects, server-side logic/i,
    captura: 'A-4-5-twenty-2-aplicaciones',
  });

  expect(catalogo, 'si el catálogo ofreciera escucha de redes, este veredicto no corresponde')
    .not.toMatch(/social listening|mentions|menciones|Twitter|Facebook|Instagram|LinkedIn/i);

  registrar({
    criterio: 'A.4.5',
    plataforma,
    cumple: 0,
    justificacion:
      'El producto no ofrece el seguimiento de lo que se dice de la compañía y de la competencia en redes y ' +
      'medios, en ninguna edición: la configuración no tiene ninguna función de redes sociales y el catálogo ' +
      'de aplicaciones del fabricante, dentro del propio producto, ofrece una sola —el seguimiento del último ' +
      'contacto con cada persona—. El fabricante presenta las aplicaciones como una vía para extender el ' +
      'producto con código propio: una escucha de redes habría que desarrollarla.',
    evidencia: [capCatalogo],
    documentacion: fuente,
  });
});

// ── A.4.6 ────────────────────────────────────────────────────────────────────
test('A.4.6 — Publicación en redes desde el sistema', async ({ page, browser }, info) => {
  // «Componer una publicación y emitirla a una red conectada desde el propio
  //  sistema, sin pasar por la herramienta de la red»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Las cuentas que se pueden conectar: correo y calendario, ninguna red social
  await configuracion(page, /^Cuentas$|^Accounts$/);
  const cuentas = await textoDe(page);
  const capCuentas = await capturar(page, 'A.4.6', plataforma, '1-cuentas-conectables');
  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/getting-started/core-concepts/apps',
    buscar: /custom objects, server-side logic/i,
    captura: 'A-4-6-twenty-2-aplicaciones',
  });

  expect(cuentas, 'si se pudiera conectar una red social, este veredicto no corresponde')
    .not.toMatch(/Twitter|Facebook|Instagram|LinkedIn|TikTok/i);

  registrar({
    criterio: 'A.4.6',
    plataforma,
    cumple: 0,
    justificacion:
      'El producto no permite publicar en redes sociales desde el propio sistema, en ninguna edición: las ' +
      'cuentas que se pueden conectar son de correo y de calendario —IMAP, SMTP, CalDAV—, ninguna red social, ' +
      'y el catálogo de aplicaciones del fabricante no ofrece ninguna para eso. Publicar exigiría desarrollar ' +
      'una aplicación propia.',
    evidencia: [capCuentas],
    documentacion: fuente,
  });
});

// ── A.4.7 ────────────────────────────────────────────────────────────────────
test('A.4.7 — Registro de la competencia y del motivo de pérdida', async ({ page, browser }, info) => {
  // «Marcar una oportunidad como perdida y comprobar si admite registrar el
  //  motivo y el competidor que la ganó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const etapa = (await objeto(e.api, 'opportunity')).fields.find((c: any) => c.name === 'stage');
  const traePerdida = etapa.options.some((o: any) => /lost|perd/i.test(o.label));

  // El embudo de fábrica termina en «Customer»: no tiene una etapa de perdida.
  // Se agregan la etapa, el motivo y el competidor
  if (!traePerdida) {
    await e.api.patch(`metadata/fields/${etapa.id}`, { data: { options: [
      ...etapa.options, { label: 'Perdida', value: 'PERDIDA', position: etapa.options.length, color: 'red' },
    ] } });
  }
  for (const c of ['Motivo de pérdida', 'Competidor']) await quitarCampo(e.api, 'opportunity', c);
  await nuevoCampo(page, 'opportunities', 'Select', 'Motivo de pérdida', conOpciones(['Precio', 'Cobertura', 'Atención', 'Otro']));
  await nuevoCampo(page, 'opportunities', 'Text', 'Competidor');
  const campos = (await objeto(e.api, 'opportunity')).fields;
  const motivo = campos.find((c: any) => c.label === 'Motivo de pérdida').name;
  const competidor = campos.find((c: any) => c.label === 'Competidor').name;

  const oportunidad = (await registros(e.api, 'opportunities')).find(o => o.name === 'Workspace Expansion')
    ?? (await registros(e.api, 'opportunities'))[0];
  await abrirFicha(page, 'opportunity', oportunidad.id);
  await elegirEnFicha(page, 'stage', 'Perdida');
  await elegirEnFicha(page, motivo, 'Precio');
  await escribirEnFicha(page, competidor, 'Seguros del Sur');
  const capFicha = await capturar(page, 'A.4.7', plataforma, '1-oportunidad-perdida');

  const guardada = (await registros(e.api, 'opportunities')).find(o => o.id === oportunidad.id);
  expect(guardada.stage, 'la oportunidad debe quedar perdida').toBe('PERDIDA');
  expect(guardada[motivo], 'debe quedar el motivo').toBe('PRECIO');
  expect(guardada[competidor], 'debe quedar el competidor').toBe('Seguros del Sur');

  registrar({
    criterio: 'A.4.7',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El embudo de fábrica termina en la etapa de cliente ganado: no trae una etapa de oportunidad perdida ni ' +
      'dónde anotar por qué se perdió. Se agregó la etapa «Perdida» a la lista de etapas y dos campos: el ' +
      'motivo, como lista, y el competidor que se quedó con la venta. Se marcó una oportunidad como perdida y ' +
      'se le registraron el motivo y el competidor desde su ficha. Agregarlos es trabajo de una sola vez.',
    evidencia: [capFicha],
  });
});
