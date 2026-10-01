import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { apiTwenty, registros, abrirFicha, abrirListado, configuracion, pestana, clicReal, textoDe } from '../../twenty/ui';

/**
 * B.2 — Capacidades por encima de lo solicitado, sobre Twenty
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna fue pedida; pesan en la Parte B.
 */

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);

  // El asistente se abre desde el menú, con la ficha a la vista
  await clicReal(page, page.getByText(/^Nuevo chat$|^New chat$/).filter({ visible: true }).first());
  await page.waitForTimeout(3000);
  const entrada = page.locator('[contenteditable="true"], textarea').filter({ visible: true }).last();
  await clicReal(page, entrada);
  await page.keyboard.type(`Resumime la ficha de ${persona.name.firstName} ${persona.name.lastName}: sus pólizas, sus reclamos y su último contacto.`, { delay: 30 });
  await page.keyboard.press('Enter');
  let respuesta = '';
  for (let espera = 0; espera < 60; espera++) {
    await page.waitForTimeout(5000);
    respuesta = await textoDe(page);
    if (/POL-|póliza|reclamo/i.test(respuesta.slice(respuesta.lastIndexOf('Resumime')))) break;
    if (/No hay modelos de IA habilitados|No AI models/i.test(respuesta)) break;
  }
  const capChat = await capturar(page, 'B.2.1', plataforma, '1-pedido-de-resumen');
  const sinModelo = /No hay modelos de IA habilitados|No AI models/i.test(respuesta);

  // Dónde se habilita: los proveedores de modelos del panel de administración
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  await pestana(page, /^IA$|^AI$/);
  const proveedores = await textoDe(page);
  const capProveedores = await capturar(page, 'B.2.1', plataforma, '2-proveedores-de-modelos');

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/getting-started/core-concepts/ai',
    buscar: 'summarize information',
    captura: 'B-2-1-twenty-3-asistente',
  });

  expect(proveedores, 'los proveedores se habilitan con sus credenciales').toMatch(/OpenAI/);
  expect(proveedores).toMatch(/Anthropic/);

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El producto trae un asistente de inteligencia artificial que se abre desde el menú, con un chat que ' +
      'consulta los registros con los permisos del usuario; el fabricante declara que resume la información ' +
      'del sistema en lenguaje natural. En la instalación propia hay que cargarle las credenciales de un ' +
      'proveedor de modelos —Anthropic, Google, Mistral, OpenAI o xAI—, que la compañía elige y contrata: ' +
      (sinModelo
        ? 'se le pidió el resumen de la ficha de un asegurado y respondió que no hay modelos habilitados, porque ' +
          'esta evaluación no contrató ningún proveedor. '
        : 'con un proveedor habilitado, se le pidió el resumen de la ficha de un asegurado y lo produjo. ') +
      'Conectar un proveedor propio, como un modelo instalado en la red de la compañía, es del plan ' +
      'Organization. Habilitarlo es configuración de una sola vez, más el costo del proveedor.',
    evidencia: [capChat, capProveedores],
    documentacion: fuente,
    medicion: sinModelo ? 'Sin proveedor de modelos habilitado en la instalación evaluada' : 'Resumen producido',
  });
});

// ── B.2.2 ────────────────────────────────────────────────────────────────────
test('B.2.2 — Aplicación móvil nativa', async ({ page, browser }, info) => {
  // «Verificar la existencia de aplicación oficial en las tiendas de aplicaciones»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  // La tienda, que es donde se verifica: quién publica cada aplicación
  const contexto = await browser.newContext({ locale: 'es-AR' });
  const tienda = await contexto.newPage();
  await tienda.goto('https://play.google.com/store/search?q=twenty%20crm&c=apps', { waitUntil: 'domcontentloaded' });
  await tienda.waitForTimeout(5000);
  const fichas = await tienda.locator('a[href*="/store/apps/details"]').evaluateAll(as =>
    as.map(a => (a.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean));
  await tienda.screenshot({ path: 'evidencia/B-2-2-twenty-1-tienda.png', fullPage: true });
  await contexto.close();
  const delProducto = fichas.filter(f => /twenty/i.test(f));
  const delFabricante = delProducto.filter(f => /Twenty\.com|Twenty PBC|twentyhq/i.test(f));

  // Lo que sí ofrece: la misma interfaz en el navegador del teléfono
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page, plataforma);
  await abrirListado(page, 'people');
  const capMovil = await capturar(page, 'B.2.2', plataforma, '2-en-el-navegador-del-telefono');

  const fuente = await citar(browser, {
    url: 'https://play.google.com/store/search?q=twenty%20crm&c=apps',
    buscar: /./,
    captura: 'B-2-2-twenty-3-busqueda-en-la-tienda',
  });

  expect(delFabricante, 'ninguna aplicación de la tienda debe ser del fabricante').toEqual([]);

  registrar({
    criterio: 'B.2.2',
    plataforma,
    cumple: 0,
    justificacion:
      'El fabricante no publica una aplicación móvil: en la tienda de aplicaciones, la búsqueda del producto ' +
      `devuelve ${delProducto.length} aplicaciones con su nombre y ninguna es del fabricante. Lo que ofrece es la ` +
      'misma interfaz en el navegador del teléfono, que se adapta a la pantalla: el productor puede consultar ' +
      'y cargar durante una visita, con conexión, pero no es una aplicación instalada.',
    evidencia: ['B-2-2-twenty-1-tienda.png', capMovil],
    documentacion: fuente,
    medicion: `${delProducto.length} aplicaciones con el nombre del producto en la tienda, ${delFabricante.length} del fabricante`,
  });
});

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Suite de trabajo integrada', async ({ page }, info) => {
  // «Enumerar las herramientas incluidas más allá del CRM y comprobar que
  //  operan sobre los mismos datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);
  // Las pestañas de la ficha, tal como se leen sobre el panel de la derecha
  const ficha = await textoDe(page);
  const pestanas = ['Timeline', 'Tasks', 'Notes', 'Files', 'Emails', 'Calendar'].filter(p => ficha.includes(p));
  const capFicha = await capturar(page, 'B.2.3', plataforma, '1-herramientas-en-la-ficha');
  await abrirListado(page, 'dashboards');
  const capTableros = await capturar(page, 'B.2.3', plataforma, '2-tableros');

  const herramientas = ['correo', 'calendario', 'notas', 'tareas', 'archivos', 'tableros', 'flujos de trabajo', 'asistente de IA'];
  expect(pestanas.join(' '), 'la ficha debe reunir las herramientas').toMatch(/Emails|Correos/);

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      `Además del CRM, el producto incluye ${herramientas.join(', ')}, y todas operan sobre los mismos datos: la ` +
      'ficha del asegurado reúne en pestañas su línea de tiempo, sus tareas, sus notas, sus archivos, sus ' +
      'correos y sus reuniones, y los tableros y los flujos leen y escriben los mismos registros. Faltan la ' +
      'mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica: ' +
      'para eso la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es ' +
      'trabajo en cada uso.',
    evidencia: [capFicha, capTableros],
    medicion: `Pestañas de la ficha: ${pestanas.join(', ')}`,
  });
});

// ── B.2.4 ────────────────────────────────────────────────────────────────────
test('B.2.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
  // «Verificar la existencia de la función dentro del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await page.waitForTimeout(1500);
  const acciones = await textoDe(page);
  const capAcciones = await capturar(page, 'B.2.4', plataforma, '1-acciones-de-la-ficha');
  await page.keyboard.press('Escape');

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/user-guide/calendar-emails/how-tos/can-i-book-meetings-from-twenty',
    buscar: 'to add a meeting link',
    captura: 'B-2-4-twenty-2-reunion-con-videollamada',
  });

  // El menú lista también los objetos del sistema, como las grabaciones de reuniones: cuenta solo una acción de llamar
  expect(acciones, 'si hubiera una acción de llamada, este veredicto no corresponde').not.toMatch(/^(Call|Llamar|Dial)\b(?! Recordings)/im);

  registrar({
    criterio: 'B.2.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'La videollamada está integrada a medias: desde la ficha de un asegurado se crea una reunión en el ' +
      'calendario conectado de Google o Microsoft, con el enlace de videollamada de ese servicio, y la reunión ' +
      'queda en la línea de tiempo del registro. La telefonía no está: el número de una ficha no se marca desde ' +
      'el sistema, las llamadas ocurren afuera y se registran a mano, o hay que desarrollar la conexión con la ' +
      'central telefónica sobre la interfaz de programación.',
    evidencia: [capAcciones],
    documentacion: fuente,
  });
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Uso sin restricciones comerciales en la interfaz', async ({ page }, info) => {
  // «Recorrer las pantallas de uso diario y registrar la presencia de avisos de venta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const avisos: string[] = [];
  const capturas: string[] = [];
  for (const [plural, paso] of [['people', 'asegurados'], ['polizas', 'polizas'], ['reclamos', 'reclamos'],
    ['opportunities', 'oportunidades'], ['tasks', 'tareas'], ['dashboards', 'tableros']] as const) {
    await abrirListado(page, plural);
    // Lo que dice la interfaz, sin los datos de las filas: los registros de ejemplo de fábrica
    // tienen nombres como «Enterprise Plan Upgrade»
    const texto = await page.evaluate(() => {
      const copia = document.body.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('[data-testid^="row-id-"]').forEach(f => f.remove());
      return copia.innerText ?? copia.textContent ?? '';
    });
    const venta = texto.match(/upgrade|actualiza (a|tu plan)|mejor(a|e) (tu|su) plan|comprar|buy now|suscrib|prueba gratuita|trial|premium|enterprise/gi);
    if (venta) avisos.push(`${paso}: ${[...new Set(venta)].join(', ')}`);
    capturas.push(await capturar(page, 'B.2.5', plataforma, paso));
  }

  expect(avisos, 'las pantallas de uso diario no deben mostrar avisos de venta').toEqual([]);

  registrar({
    criterio: 'B.2.5',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Se recorrieron las pantallas de uso diario —asegurados, pólizas, reclamos, oportunidades, tareas y ' +
      'tableros— y ninguna muestra avisos de venta ni invitaciones a mejorar el plan. Las funciones del plan ' +
      'pago aparecen marcadas solo dentro de la configuración, donde las ve quien administra: el usuario ' +
      'trabaja sin interrupciones comerciales.',
    evidencia: capturas,
  });
});
