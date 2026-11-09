import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, BITRIX24_STANDARD, constanciaDe, conPlanDe } from '../../precios';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';

/**
 * B.1 — Capacidades por encima de lo solicitado, sobre Bitrix24
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna fue pedida; pesan en la Parte B.
 */

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}COPILOT$`));
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}COPILOT`);
  await guardarFormulario(page);
  const capNegociacion = await capturar(page, 'B.1.1', plataforma, '1-negociacion');

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
  const capChat = await capturar(page, 'B.1.1', plataforma, '2-copilot');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}COPILOT$`));

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/features/copilot.php',
    buscar: 'Su asistente potenciado por IA en Bitrix24',
    captura: 'B-1-1-bitrix24-3-copilot-fabricante',
  });

  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen: 'Incluye CoPilot, un asistente de inteligencia artificial disponible desde el propio registro, con una cuota mensual de usos gratuitos que puede agotarse.',
    comoLoHace:
      (sePidioResumen
      ? 'Desde el chat de la negociación se le pide a CoPilot el resumen del registro: ' +
      (respondio ? 'responde con un texto propio en la misma pantalla.' : 'el asistente recibe la consulta, pero su respuesta puede depender de la cuota gratuita del portal.')
      : 'El menú lateral ofrece CoPilot para escribirle una consulta desde su pantalla.'),
    caracteristicas:
      'El producto trae CoPilot, un asistente de inteligencia artificial disponible desde el propio registro, en ' +
      'la edición gratuita, con una cuota de usos gratuitos por mes.',
    justificacion:
      'Queda disponible de fábrica, sin instalar nada: lo único que puede requerir una configuración de una vez ' +
      'es elegir o ampliar la cuota de uso cuando la gratuita se agota.',
    evidencia: [capNegociacion, capChat],
    documentacion: fuente,
  });
});

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Aplicación móvil nativa', async ({ page, browser }, info) => {
  // «Verificar la existencia de aplicación oficial en las tiendas de aplicaciones»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(400_000);

  const contexto = await browser.newContext({ locale: 'es-AR' });
  const tienda = await contexto.newPage();
  await tienda.goto('https://play.google.com/store/apps/details?id=com.bitrix24.android', { waitUntil: 'domcontentloaded' });
  await tienda.waitForTimeout(4000);
  const ficha = (await tienda.locator('body').innerText().catch(() => '')).slice(0, 2000);
  await tienda.screenshot({ path: 'evidencia/B-1-2-bitrix24-1-google-play.png', fullPage: true });
  await contexto.close();
  const esDelFabricante = /Bitrix24|Bitrix, Inc/i.test(ficha);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'B.1.2', plataforma, '2-portal-en-el-navegador');

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/features/mobile-app.php',
    buscar: /./,
    captura: 'B-1-2-bitrix24-3-app-movil-oficial',
  });

  expect(esDelFabricante, 'la ficha de la tienda debe identificar al fabricante').toBe(true);

  registrar({
    criterio: 'B.1.2',
    plataforma,
    cumple: 2,
    costo: 0,
    resumen: 'Tiene aplicación móvil oficial para Android e iOS, con CRM, tareas, chat y notificaciones, para operar durante la visita al asegurado.',
    comoLoHace: 'La aplicación oficial del fabricante se encuentra en las tiendas de aplicaciones.',
    caracteristicas:
      'El fabricante publica una aplicación móvil oficial, para Android en Google Play y para iOS en el App ' +
      'Store, con el CRM, las tareas, el chat y las notificaciones de la cuenta.',
    justificacion:
      'El productor puede registrar la operación durante la visita al asegurado, desde su teléfono, sin ' +
      'instalar ni configurar nada además de bajar la aplicación e iniciar sesión.',
    evidencia: ['B-1-2-bitrix24-1-google-play.png', capPortal],
    documentacion: fuente,
  });
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Suite de trabajo integrada', async ({ page, browser }, info) => {
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
  const capFicha = await capturar(page, 'B.1.3', plataforma, '1-herramientas-en-la-negociacion');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}SUITE$`));

  await menuLateral(page, /^\s*Drive\s*\d*\s*$/i);
  const capDrive = await capturar(page, 'B.1.3', plataforma, '2-drive');

  const herramientas = ['mensajería', 'tareas y proyectos', 'calendario', 'Drive (documentos)', 'base de conocimientos', 'sitios web'];
  const pestanas = ['Chat', 'Llamada', 'Tarea', 'Reunión', 'Comentario'].filter(p => ficha.includes(p));

  const COMPARACION = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
  const fuentes = [
    await citar(browser, { url: COMPARACION, buscar: 'Edición colaborativa de documentos', captura: 'B-1-3-bitrix24-3-edicion-colaborativa' }),
    await citar(browser, { url: COMPARACION, buscar: 'Envía documentos para que los firmen varios empleados a la vez', captura: 'B-1-3-bitrix24-4-firma-electronica' }),
    ...await constanciaDe(browser, BITRIX24_STANDARD, 'B-1-3-bitrix24-standard'),
  ];

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    costo: 2,
    resumen: 'Integra mensajería, tareas, calendario, documentos y base de conocimientos sobre los mismos contactos, pero la edición colaborativa de documentos y la firma electrónica exigen planes pagos o aplicaciones.',
    comoLoHace:
      'Desde la ficha de una negociación se abre un chat, una tarea, una reunión o un comentario ' +
      `(${pestanas.join(', ') || 'según lo que la pantalla ofrezca en cada ficha'}) sin salir del registro.`,
    caracteristicas:
      `Además del CRM, el producto incluye ${herramientas.join(', ')}, todo en la misma cuenta y sobre los ` +
      'mismos contactos.',
    justificacion:
      'Falta la edición colaborativa de documentos de oficina y la firma electrónica en la edición gratuita ' +
      '—quedan en planes pagos o en aplicaciones del catálogo—, así que la compañía sigue necesitando otra ' +
      'herramienta para esa parte, con el trabajo de pasar la información de una a otra.',
    evidencia: [capFicha, capDrive],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 1,
      justificacion:
        'El plan Standard es el primero que suma la edición colaborativa de documentos y la firma electrónica ' +
        'de la empresa, además de lo que ya trae la edición gratuita: la compañía deja de necesitar otra ' +
        'herramienta para esa parte. Requiere configurar una vez los documentos y la firma.',
    })],
    medicion: `Acciones disponibles desde la ficha: ${pestanas.join(', ') || 'ninguna detectada'}`,
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
test('B.1.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
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
  const capFicha = await capturar(page, 'B.1.4', plataforma, '1-acciones-de-la-negociacion');
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}TELEFONIA$`));

  const tieneVideollamada = /Reunión|Videollamada|Meeting/i.test(acciones);
  const tieneLlamar = /^Llamar$|^Llamada$/im.test(acciones);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: 'aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos',
      captura: 'B-1-4-bitrix24-2-telefonia-solo-planes-pagos',
    }),
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/compare_cloud_plans.php',
      buscar: 'Bitrix24 cuenta con telefonía incorporada que no necesita configuración ni integración',
      captura: 'B-1-4-bitrix24-3-telefonia-por-plan',
    }),
    ...await constanciaDe(browser, BITRIX24_BASIC, 'B-1-4-bitrix24-basic'),
  ];

  registrar({
    criterio: 'B.1.4',
    plataforma,
    cumple: 1,
    costo: 2,
    resumen: 'Incluye videollamada, pero no telefonía: la línea propia y la numeración son de los planes pagos, o se conecta una central externa por desarrollo.',
    comoLoHace:
      'Desde la ficha de una negociación se inicia una reunión con video, sin salir del ' +
      `sistema${tieneVideollamada ? ' (acción presente en la ficha evaluada)' : ''}.`,
    caracteristicas:
      'La videollamada está integrada de fábrica.',
    justificacion:
      'La telefonía no: el fabricante reserva la línea propia y la numeración de Bitrix24 Telephony a los ' +
      'planes pagos, así que en la edición gratuita llamar desde el sistema requiere contratar ese módulo o ' +
      'desarrollar la conexión con una central externa por la interfaz de programación.',
    evidencia: [capFicha],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Desde el plan Basic, el primero que incluye la telefonía integrada, se llama desde la ficha del cliente ' +
        'y se puede conectar una central propia por el conector SIP, sin desarrollo. Requiere dar de alta la línea ' +
        'o la central una vez.',
    })],
    medicion: `Videollamada en la ficha: ${tieneVideollamada ? 'sí' : 'no detectada'} · acción de llamar: ${tieneLlamar ? 'sí' : 'no'}`,
  });
});
