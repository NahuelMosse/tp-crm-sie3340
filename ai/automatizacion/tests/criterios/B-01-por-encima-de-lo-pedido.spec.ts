import { test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import {
  ESPOCRM_INTELLIGENCE, ESPOCRM_VOIP, ESPOCRM_ZOOM, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe,
} from '../precios';
import { soloEn, capturar, textoDe, elegirLista } from './comun';
import { cargarCartera, ASEGURADOS } from '../datos';
import { listar } from '../api';
import { alta, administracion, listado, pestana, inicio } from '../espocrm/navegar';

/**
 * B.1 — Capacidades por encima de lo solicitado
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna de estas capacidades fue pedida; por eso pesan en la
 * Parte B y no pueden compensar lo que falte en la Parte A.
 */

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page);
  await page.waitForTimeout(5000);
  const admin = await textoDe(page);
  const capAdmin = await capturar(page, 'B.1.1', plataforma, '1-administracion');

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/extensions/intelligence/', buscar: 'Summary', captura: 'B-1-1-espocrm-2-intelligence' }),
    ...await constanciaDe(browser, ESPOCRM_INTELLIGENCE, 'B-1-1-espocrm'),
  ];

  expect(/intelligence|inteligencia artificial|\bIA\b|\bAI\b/i.test(admin), 'la edición gratuita no trae asistente').toBeFalsy();

  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 0,
    resumen:
      'No incluye asistente de inteligencia artificial: el fabricante lo vende como extensión aparte.',
    comoLoHace:
      'La edición gratuita no incluye un asistente de inteligencia artificial: la administración no ofrece ' +
      'ninguna función de ese tipo y el fabricante la vende como extensión aparte.',
    justificacion:
      'Con ella el sistema resume registros, redacta correos y clasifica o extrae datos con fórmulas, ' +
      'usando el proveedor de inteligencia artificial que la compañía elija y contrate.',
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

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Uso desde el teléfono durante la visita', async ({ page }, info) => {
  // «Registrar una operación desde el teléfono y comprobar si al usuario le llegan al teléfono los
  //  avisos de lo que se le asigna, aunque no tenga el sistema abierto»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  const tarea = 'Visita: relevar la renovación del vehículo';
  const asegurado = ASEGURADOS[0];
  const { api } = await cargarCartera();
  const borrar = async () => {
    const { list } = await listar(api, 'Task', { maxSize: 200 });
    for (const t of list.filter((t: any) => t.name === tarea)) await api.delete(`Task/${t.id}`);
  };
  await borrar();

  try {
    // Con la pantalla de un teléfono: se entra y se registra una tarea sobre un asegurado
    await page.setViewportSize({ width: 390, height: 844 });
    await entrar(page, plataforma);
    await alta(page, 'Task');
    const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
    await nombre.waitFor({ state: 'visible', timeout: 40_000 });
    await nombre.pressSequentially(tarea, { delay: 20 });
    await elegirLista(page, 'parent', 'Contact');
    const entrada = page.locator('.field[data-name="parent"] input[data-name="parentName"]').first();
    await entrada.click();
    await entrada.pressSequentially(asegurado.lastName, { delay: 50 });
    await page.locator('.autocomplete-suggestion:visible').filter({ hasText: asegurado.lastName }).first().click({ timeout: 15_000 });
    await page.waitForTimeout(500);
    const capAlta = await capturar(page, 'B.1.2', plataforma, '2-alta-en-pantalla-de-telefono');
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(4000);
    const capGuardada = await capturar(page, 'B.1.2', plataforma, '3-tarea-guardada');

    const guardada = (await listar(api, 'Task', { maxSize: 200 })).list.find((t: any) => t.name === tarea);
    expect(guardada, 'la tarea debe quedar guardada').toBeTruthy();
    expect(guardada.parentType, 'la tarea debe quedar vinculada al asegurado').toBe('Contact');

    registrar({
      criterio: 'B.1.2',
      plataforma,
      cumple: 1,
      reparo: 'parcial',
      resumen:
        'Se usa desde el navegador del teléfono y registra la operación; los avisos de lo asignado solo ' +
        'se ven con el sistema abierto, no llegan al teléfono.',
      comoLoHace:
        'Con la pantalla de un teléfono, el productor entra, crea una tarea vinculada a un asegurado y queda guardada. ' +
        'Las notificaciones de Preferencias solo ofrecen avisos dentro del sistema (la campana, con la pestaña abierta, ' +
        'y un sonido opcional); no hay avisos del navegador ni al teléfono: en el código de la instalación no hay ' +
        'rastro de permisos de notificación, de procesos en segundo plano ni de envío de avisos al teléfono.',
      caracteristicas:
        'La misma interfaz se adapta a la pantalla del teléfono y permite cargar y consultar durante la visita. ' +
        'Los avisos de lo que se asigna aparecen en la campana, con el sistema abierto.',
      justificacion:
        'Se puede registrar la operación desde el teléfono sin configurar nada, pero el aviso de lo asignado no ' +
        'llega con el sistema cerrado: es el reparo.',
      evidencia: [capAlta, capGuardada, 'B-1-2-espocrm-4-avisos.png'],
    });
  } finally {
    await borrar();
  }
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Suite de trabajo integrada', async ({ page }, info) => {
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
  const capHerramientas = await capturar(page, 'B.1.3', plataforma, '1-herramientas');

  expect(herramientas.length).toBeGreaterThan(2);

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    reparo: 'parcial',
    costo: 2,
    resumen:
      `Reúne ${herramientas.slice(0, -1).join(', ')} y ${herramientas.at(-1)} sobre los mismos datos del asegurado; no trae mensajería ` +
      'instantánea, edición colaborativa de documentos ni firma electrónica.',
    comoLoHace:
      `Además del CRM, el producto incluye ${herramientas.join(', ')} y una línea de publicaciones internas ` +
      'en cada registro, y todas operan sobre los mismos datos: un correo queda en la ficha del asegurado, ' +
      'una reunión en su historial, un documento vinculado a su póliza.',
    caracteristicas:
      'Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma ' +
      'electrónica.',
    justificacion:
      'Para la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica ' +
      'la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es ' +
      'trabajo en cada uso.',
    evidencia: [capHerramientas],
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
test('B.1.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
  // «Verificar la existencia de la función dentro del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/integrations');
  await page.waitForTimeout(5000);
  const integraciones = await textoDe(page);
  const capIntegraciones = await capturar(page, 'B.1.4', plataforma, '1-integraciones');

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/extensions/voip-integration/', buscar: 'IP telephony', captura: 'B-1-4-espocrm-2-voip' }),
    ...await constanciaDe(browser, ESPOCRM_VOIP, 'B-1-4-espocrm-voip'),
    ...await constanciaDe(browser, ESPOCRM_ZOOM, 'B-1-4-espocrm-zoom'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'B-1-4-espocrm-nube'),
  ];

  expect(/voip|asterisk|twilio|zoom/i.test(integraciones), 'la edición gratuita no trae telefonía ni videollamada').toBeFalsy();

  registrar({
    criterio: 'B.1.4',
    plataforma,
    cumple: 0,
    resumen:
      'No integra telefonía ni videollamada: el teléfono de la ficha abre el marcador y la llamada se ' +
      'registra a mano. El fabricante las vende como extensiones aparte.',
    comoLoHace:
      'La edición gratuita no integra telefonía ni videollamada: el número de teléfono de una ficha abre el ' +
      'marcador del equipo, pero la llamada ocurre afuera y se registra a mano.',
    justificacion:
      'El fabricante vende las dos funciones como extensiones separadas: una conecta la central telefónica ' +
      '—3CX, Asterisk, Twilio, entre otras— y la otra agrega las videollamadas.',
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
