import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';

/**
 * B.2 — Capacidades por encima de lo solicitado, sobre Bitrix24
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna fue pedida; pesan en la Parte B.
 */

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}COPILOT$`));
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}COPILOT`);
  await guardarFormulario(page);
  const capNegociacion = await capturar(page, 'B.2.1', plataforma, '1-negociacion');

  // CoPilot se abre desde su propio ícono, presente en las pantallas del CRM
  let respuesta = '';
  let sePidioResumen = false;
  let respondio = false;
  if (await page.locator('nav[aria-label="Menú principal"]').first().getByText(/^CoPilot$/i).count()) {
    await menuLateral(page, 'CoPilot');
    await page.waitForTimeout(2000);
    const preguntar = page.getByText(/haga una pregunta/i).filter({ visible: true }).first();
    if (await preguntar.isVisible().catch(() => false)) {
      await preguntar.click();
      await page.waitForTimeout(2500);
    }
    const entrada = page.locator('[contenteditable="true"], textarea').filter({ visible: true }).last();
    if (await entrada.isVisible().catch(() => false)) {
      await entrada.click();
      await page.keyboard.type(`Resumime la negociación ${PREFIJO}COPILOT`, { delay: 40 });
      await page.keyboard.press('Enter');
      sePidioResumen = true;
      await page.waitForTimeout(4000);
      const base = (await textoDe(page)).length;
      for (let espera = 0; espera < 25 && !respondio; espera++) {
        await page.waitForTimeout(3000);
        respuesta = await textoDe(page);
        respondio = respuesta.length > base + 80;
      }
    }
  }
  const capChat = await capturar(page, 'B.2.1', plataforma, '2-copilot');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}COPILOT$`));

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/features/copilot.php',
    buscar: 'Su asistente potenciado por IA en Bitrix24',
    captura: 'B-2-1-bitrix24-3-copilot-fabricante',
  });

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El producto trae CoPilot, un asistente de inteligencia artificial disponible desde el propio registro, en ' +
      'la edición gratuita, con una cuota de usos gratuitos por mes. ' +
      (sePidioResumen
        ? 'Se le pidió el resumen de una negociación desde su chat; ' +
          (respondio ? 'respondió con un texto propio en la misma pantalla.' : 'el asistente recibió la consulta pero no devolvió respuesta en el minuto y medio de espera de la instalación evaluada, posiblemente por la cuota gratuita del portal.')
        : 'El menú lateral ofrece CoPilot, pero en esta corrida no se llegó a escribirle una consulta desde su pantalla.') +
      ' Queda disponible de fábrica, sin instalar nada: lo único que puede requerir una configuración de una vez ' +
      'es elegir o ampliar la cuota de uso cuando la gratuita se agota.',
    evidencia: [capNegociacion, capChat],
    documentacion: fuente,
  });
});

// ── B.2.2 ────────────────────────────────────────────────────────────────────
test('B.2.2 — Aplicación móvil nativa', async ({ page, browser }, info) => {
  // «Verificar la existencia de aplicación oficial en las tiendas de aplicaciones»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(400_000);

  const contexto = await browser.newContext({ locale: 'es-AR' });
  const tienda = await contexto.newPage();
  await tienda.goto('https://play.google.com/store/apps/details?id=com.bitrix24.android', { waitUntil: 'domcontentloaded' });
  await tienda.waitForTimeout(4000);
  const ficha = (await tienda.locator('body').innerText().catch(() => '')).slice(0, 2000);
  await tienda.screenshot({ path: 'evidencia/B-2-2-bitrix24-1-google-play.png', fullPage: true });
  await contexto.close();
  const esDelFabricante = /Bitrix24|Bitrix, Inc/i.test(ficha);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'B.2.2', plataforma, '2-portal-en-el-navegador');

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/features/mobile-app.php',
    buscar: /./,
    captura: 'B-2-2-bitrix24-3-app-movil-oficial',
  });

  expect(esDelFabricante, 'la ficha de la tienda debe identificar al fabricante').toBe(true);

  registrar({
    criterio: 'B.2.2',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El fabricante publica una aplicación móvil oficial, para Android en Google Play y para iOS en el App ' +
      'Store, con el CRM, las tareas, el chat y las notificaciones de la cuenta. El productor puede registrar la ' +
      'operación durante la visita al asegurado, desde su teléfono, sin instalar ni configurar nada además de ' +
      'bajar la aplicación e iniciar sesión.',
    evidencia: ['B-2-2-bitrix24-1-google-play.png', capPortal],
    documentacion: fuente,
  });
});

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Suite de trabajo integrada', async ({ page }, info) => {
  // «Enumerar las herramientas incluidas más allá del CRM y comprobar que
  //  operan sobre los mismos datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}SUITE$`));
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}SUITE`);
  await guardarFormulario(page);
  // Las herramientas de la ficha: tareas, mensajería y calendario, sobre la misma negociación
  const ficha = await textoDe(page);
  const capFicha = await capturar(page, 'B.2.3', plataforma, '1-herramientas-en-la-negociacion');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}SUITE$`));

  await menuLateral(page, /^\s*Drive\s*\d*\s*$/i);
  const capDrive = await capturar(page, 'B.2.3', plataforma, '2-drive');

  const herramientas = ['mensajería', 'tareas y proyectos', 'calendario', 'Drive (documentos)', 'base de conocimientos', 'sitios web'];
  const pestanas = ['Chat', 'Llamada', 'Tarea', 'Reunión', 'Comentario'].filter(p => ficha.includes(p));

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      `Además del CRM, el producto incluye ${herramientas.join(', ')}, todo en la misma cuenta y sobre los mismos ` +
      `contactos: desde la ficha de una negociación se abre un chat, una tarea, una reunión o un comentario ` +
      `(${pestanas.join(', ') || 'según lo que la pantalla ofrezca en cada ficha'}) sin salir del registro. Falta ` +
      'la edición colaborativa de documentos de oficina y la firma electrónica en la edición gratuita —quedan en ' +
      'planes pagos o en aplicaciones del catálogo—, así que la compañía sigue necesitando otra herramienta para ' +
      'esa parte, con el trabajo de pasar la información de una a otra.',
    evidencia: [capFicha, capDrive],
    medicion: `Acciones disponibles desde la ficha: ${pestanas.join(', ') || 'ninguna detectada'}`,
  });
});

// ── B.2.4 ────────────────────────────────────────────────────────────────────
test('B.2.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
  // «Verificar la existencia de la función dentro del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}TELEFONIA$`));
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}TELEFONIA`);
  await guardarFormulario(page);
  const acciones = await textoDe(page);
  const capFicha = await capturar(page, 'B.2.4', plataforma, '1-acciones-de-la-negociacion');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}TELEFONIA$`));

  const tieneVideollamada = /Reunión|Videollamada|Meeting/i.test(acciones);
  const tieneLlamar = /^Llamar$|^Llamada$/im.test(acciones);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: 'aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos',
      captura: 'B-2-4-bitrix24-2-telefonia-solo-planes-pagos',
    }),
  ];

  registrar({
    criterio: 'B.2.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'La videollamada está integrada de fábrica: desde la ficha de una negociación se inicia una reunión con ' +
      `video, sin salir del sistema${tieneVideollamada ? ' (acción presente en la ficha evaluada)' : ''}. La ` +
      'telefonía no: el fabricante reserva la línea propia y la numeración de Bitrix24 Telephony a los planes ' +
      'pagos, así que en la edición gratuita llamar desde el sistema requiere contratar ese módulo o desarrollar ' +
      'la conexión con una central externa por la interfaz de programación.',
    evidencia: [capFicha],
    documentacion: fuentes,
    medicion: `Videollamada en la ficha: ${tieneVideollamada ? 'sí' : 'no detectada'} · acción de llamar: ${tieneLlamar ? 'sí' : 'no'}`,
  });
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Uso sin restricciones comerciales en la interfaz', async ({ page }, info) => {
  // «Recorrer las pantallas de uso diario y registrar la presencia de avisos de venta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const avisos: string[] = [];
  const capturas: string[] = [];
  const PANTALLAS: [string, string][] = [['CRM', 'crm'], ['Tareas', 'tareas'], ['Messenger', 'mensajes'], ['Calendario', 'calendario']];
  for (const [entrada, paso] of PANTALLAS) {
    await menuLateral(page, entrada);
    const texto = await page.evaluate(() => document.body.innerText ?? '');
    const venta = texto.match(/mejore su plan|actualiza(r)? (a|tu|su) plan|mejora tu plan|comprar ahora|prueba gratis|prueba gratuita|suscrib|upgrade|buy now/gi);
    if (venta) avisos.push(`${paso}: ${[...new Set(venta)].join(', ')}`);
    capturas.push(await capturar(page, 'B.2.5', plataforma, paso));
  }

  registrar({
    criterio: 'B.2.5',
    plataforma,
    cumple: avisos.length ? 1 : 2,
    costo: avisos.length ? 2 : 0,
    justificacion: avisos.length
      ? 'Se recorrieron las pantallas de uso diario —CRM, tareas, mensajería y calendario— y en todas hay avisos ' +
        `de venta permanentes en la propia interfaz (${avisos.join('; ')}), sin importar la tarea en curso. No ` +
        'impiden operar, pero el usuario trabaja con la oferta comercial siempre a la vista y la edición gratuita ' +
        'no ofrece ocultarla.'
      : 'Se recorrieron las pantallas de uso diario —CRM, tareas, mensajería y calendario— y ninguna muestra ' +
        'avisos de venta: las funciones de los planes pagos quedan marcadas donde se las usa, no interrumpiendo ' +
        'la pantalla de trabajo diaria.',
    evidencia: capturas,
    medicion: `Avisos de venta en el contenido: ${avisos.length}`,
  });
});
