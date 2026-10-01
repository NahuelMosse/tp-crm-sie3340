import { test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import {
  ESPOCRM_INTELLIGENCE, ESPOCRM_VOIP, ESPOCRM_ZOOM, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe,
} from '../precios';
import { soloEn, capturar, textoDe } from './comun';
import { administracion, listado, pestana, inicio } from '../espocrm/navegar';

/**
 * B.2 — Capacidades por encima de lo solicitado
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna de estas capacidades fue pedida; por eso pesan en la
 * Parte B y no pueden compensar lo que falte en la Parte A.
 */

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page);
  await page.waitForTimeout(5000);
  const admin = await textoDe(page);
  const capAdmin = await capturar(page, 'B.2.1', plataforma, '1-administracion');

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/extensions/intelligence/', buscar: 'Summary', captura: 'B-2-1-espocrm-2-intelligence' }),
    ...await constanciaDe(browser, ESPOCRM_INTELLIGENCE, 'B-2-1-espocrm'),
  ];

  expect(/intelligence|inteligencia artificial|\bIA\b|\bAI\b/i.test(admin), 'la edición gratuita no trae asistente').toBeFalsy();

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 0,
    justificacion:
      'La edición gratuita no incluye un asistente de inteligencia artificial: la administración no ofrece ' +
      'ninguna función de ese tipo y el fabricante la vende como extensión aparte. Con ella el sistema resume ' +
      'registros, redacta correos y clasifica o extrae datos con fórmulas, usando el proveedor de inteligencia ' +
      'artificial que la compañía elija y contrate.',
    evidencia: [capAdmin],
    documentacion: fuentes,
    conPlan: [conPlanDe(ESPOCRM_INTELLIGENCE, {
      cumple: 2,
      costo: 1,
      justificacion:
        'La extensión agrega el resumen de registros y la redacción asistida. Requiere configurar la cuenta ' +
        'de un proveedor de inteligencia artificial, que se contrata y se paga aparte.',
    })],
  });
});

// ── B.2.2 ────────────────────────────────────────────────────────────────────
test('B.2.2 — Aplicación móvil nativa', async ({ page, browser }, info) => {
  // «Verificar la existencia de aplicación oficial en las tiendas de aplicaciones»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  // La tienda, que es donde se verifica: quién publica cada aplicación
  const contexto = await browser.newContext({ locale: 'es-AR' });
  const tienda = await contexto.newPage();
  await tienda.goto('https://play.google.com/store/search?q=espocrm&c=apps', { waitUntil: 'domcontentloaded' });
  await tienda.waitForTimeout(5000);
  const fichas = await tienda.locator('a[href*="/store/apps/details"]').evaluateAll(as =>
    as.map(a => (a.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean));
  await tienda.screenshot({ path: 'evidencia/B-2-2-espocrm-1-tienda.png', fullPage: true });
  await contexto.close();
  // La tienda devuelve también aplicaciones de otros productos: cuentan solo las que nombran a este
  const delProducto = fichas.filter(f => /espo/i.test(f));
  const delFabricante = delProducto.filter(f => /EspoCRM,? Inc|EspoCRM Ltd/i.test(f));

  // Lo que sí ofrece: la misma interfaz, adaptada al teléfono en el navegador
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page, plataforma);
  await listado(page, 'Contact');
  await page.waitForTimeout(5000);
  const capMovil = await capturar(page, 'B.2.2', plataforma, '2-en-el-navegador-del-telefono');

  const fuente = await citar(browser, {
    url: 'https://play.google.com/store/search?q=espocrm&c=apps',
    buscar: /espo/i,
    captura: 'B-2-2-espocrm-3-busqueda-en-la-tienda',
  });

  expect(delFabricante, 'ninguna aplicación de la tienda debe ser del fabricante').toEqual([]);

  registrar({
    criterio: 'B.2.2',
    plataforma,
    cumple: 0,
    justificacion:
      'El fabricante no publica una aplicación móvil. En la tienda de aplicaciones, la búsqueda del producto ' +
      `devuelve ${delProducto.length} aplicaciones hechas para este producto, y todas son de desarrolladores ` +
      'independientes, sin respaldo del ' +
      'fabricante; ni su catálogo de extensiones ni su página de descarga ofrecen una. Lo que sí ofrece es la ' +
      'misma interfaz adaptada a la pantalla del teléfono, que se usa desde el navegador con conexión: el ' +
      'productor puede consultar y cargar durante una visita, pero no es una aplicación instalada.',
    evidencia: ['B-2-2-espocrm-1-tienda.png', capMovil],
    documentacion: fuente,
    medicion: `${delProducto.length} aplicaciones para el producto en la tienda, ${delFabricante.length} del fabricante`,
  });
});

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Suite de trabajo integrada', async ({ page }, info) => {
  // «Enumerar las herramientas incluidas más allá del CRM y comprobar que
  //  operan sobre los mismos datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const herramientas: string[] = [];
  for (const [ir, nombre] of [
    [() => pestana(page, 'Email'), 'correo'],
    [() => pestana(page, 'Calendar'), 'calendario'],
    [() => pestana(page, 'Document'), 'documentos'],
    [() => administracion(page, '#Admin/templateManager'), 'plantillas PDF'],
  ] as const) {
    await ir();
    await page.waitForTimeout(3500);
    if (!/no tiene acceso|no encontrado|404/i.test(await textoDe(page))) herramientas.push(nombre);
  }
  const capHerramientas = await capturar(page, 'B.2.3', plataforma, '1-herramientas');

  expect(herramientas.length).toBeGreaterThan(2);

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      `Además del CRM, el producto incluye ${herramientas.join(', ')} y una línea de publicaciones internas ` +
      'en cada registro, y todas operan sobre los mismos datos: un correo queda en la ficha del asegurado, una ' +
      'reunión en su historial, un documento vinculado a su póliza. Faltan la mensajería instantánea entre ' +
      'usuarios, la edición colaborativa de documentos y la firma electrónica: para eso la compañía sigue ' +
      'necesitando otras herramientas, y pasar la información de una a otra es trabajo en cada uso.',
    evidencia: [capHerramientas],
  });
});

// ── B.2.4 ────────────────────────────────────────────────────────────────────
test('B.2.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
  // «Verificar la existencia de la función dentro del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/integrations');
  await page.waitForTimeout(5000);
  const integraciones = await textoDe(page);
  const capIntegraciones = await capturar(page, 'B.2.4', plataforma, '1-integraciones');

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/extensions/voip-integration/', buscar: 'IP telephony', captura: 'B-2-4-espocrm-2-voip' }),
    ...await constanciaDe(browser, ESPOCRM_VOIP, 'B-2-4-espocrm-voip'),
    ...await constanciaDe(browser, ESPOCRM_ZOOM, 'B-2-4-espocrm-zoom'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'B-2-4-espocrm-nube'),
  ];

  expect(/voip|asterisk|twilio|zoom/i.test(integraciones), 'la edición gratuita no trae telefonía ni videollamada').toBeFalsy();

  registrar({
    criterio: 'B.2.4',
    plataforma,
    cumple: 0,
    justificacion:
      'La edición gratuita no integra telefonía ni videollamada: el número de teléfono de una ficha abre el ' +
      'marcador del equipo, pero la llamada ocurre afuera y se registra a mano. El fabricante vende las dos ' +
      'funciones como extensiones separadas: una conecta la central telefónica —3CX, Asterisk, Twilio, entre ' +
      'otras— y la otra agrega las videollamadas.',
    evidencia: [capIntegraciones],
    documentacion: fuentes,
    conPlan: [
      {
        plan: 'VoIP Integration + Zoom Integration',
        monto: 'US$ 498 por año y por instalación (US$ 388 + US$ 110)',
        modalidad: 'recurrente',
        cumple: 2,
        costo: 1,
        justificacion:
          'Con las dos extensiones, las llamadas se atienden y se registran desde la ficha y las reuniones ' +
          'generan su enlace de videollamada. Requiere la central telefónica y la cuenta de videollamadas de ' +
          'la compañía.',
      },
      conPlanDe(ESPOCRM_CLOUD_BASIC, {
        cumple: 2,
        costo: 1,
        justificacion: 'El servicio en la nube incluye las dos extensiones entre todas las del fabricante.',
      }),
    ],
  });
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Uso sin restricciones comerciales en la interfaz', async ({ page }, info) => {
  // «Recorrer las pantallas de uso diario y registrar la presencia de avisos de venta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const avisos: string[] = [];
  const capturas: string[] = [];
  for (const [ir, paso] of [
    [() => inicio(page), 'inicio'],
    [() => listado(page, 'Contact'), 'asegurados'],
    [() => listado(page, 'CPoliza'), 'polizas'],
    [() => listado(page, 'Case'), 'reclamos'],
    [() => listado(page, 'Opportunity'), 'oportunidades'],
    [() => pestana(page, 'Calendar'), 'calendario'],
  ] as const) {
    await ir();
    await page.waitForTimeout(4000);
    const texto = await textoDe(page);
    const venta = texto.match(/mejor(e|á) su plan|upgrade|comprar|buy now|suscrib|prueba gratuita|trial|premium/gi);
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
      'Se recorrieron las pantallas de uso diario —inicio, asegurados, pólizas, reclamos, oportunidades y ' +
      'calendario— y ninguna muestra avisos de venta, invitaciones a mejorar el plan ni funciones bloqueadas a ' +
      'la vista. Lo que no está en la edición gratuita simplemente no aparece: el usuario trabaja sin ' +
      'interrupciones comerciales.',
    evidencia: capturas,
  });
});
