import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC_VIBE, BITRIX24_STANDARD, BITRIX24_PROFESSIONAL, constanciaDe, conPlanDe } from '../../precios';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import { rest, textoDe, altaDeNegociacion, elegirEnLista, guardarFormulario, descartarAvisos, negociaciones, borrarNegociaciones, quitarCampo } from '../../bitrix24/ui';
import {
  abrirListado, filasDelListado, filtrarLista, buscarConFiltro, reiniciarFiltro, escribirFecha, crearCampoPropio, enDias, abrirFicha, asegurarCampos,
  quitarCampoDeContacto, buscarEnElListado, campoDeContacto, elegirEnListaDeContacto,
} from '../../bitrix24/negociaciones';
import { abrirReglas, cerrarReglas, borrarReglasDe, guardarRegla } from '../../bitrix24/negociaciones-a8';
import { comparativo, CODIGOS, menuAplicaciones } from '../../bitrix24/negociaciones-a4';
import { altaDeContacto, llenarContacto, guardarContacto, contactos, borrarContactos, abrirContacto, registrarActividad, actividadesDe } from '../../bitrix24/actividades';

/**
 * A.11 — Emisión, cobranza y continuidad de la relación, sobre Bitrix24
 *
 * En la edición gratuita no hay procesos inteligentes: la póliza se lleva como una
 * negociación, con sus campos propios, y la venta es otra negociación del mismo embudo.
 */

test.describe.configure({ mode: 'serial' });

const POR_CLIENTE = /Crear un elemento CRM/;

/** Cierra el globo de novedades que el portal abre solo sobre la página. */
async function cerrarNovedades(page: Page) {
  const cruz = page.locator('.popup-window-close-icon, .ui-tour-popup-close').filter({ visible: true });
  for (let i = 0; i < 3 && await cruz.first().isVisible().catch(() => false); i++) {
    await cruz.first().click();
    await page.waitForTimeout(600);
  }
}

/** Cierra como ganada la negociación abierta, desde el botón de cierre de la barra de etapas. */
async function cerrarGanada(page: Page) {
  await panel(page).getByText('Cerrar negociación', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  await panel(page).getByText(/Cerrado Ganado|Ganada/).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
  await guardarFormulario(page).catch(() => {});
}

// ── A.11.1 ───────────────────────────────────────────────────────────────────
test('A.11.1 — Emisión de la póliza al cerrar la venta', async ({ page, browser }, info) => {
  // «Marcar ganada una oportunidad y obtener la póliza vinculada al asegurado
  //  con los datos de la oportunidad, sin volver a cargarlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const VENTA = 'OPO-EMI-Quiroga-Hogar';
  const EMITIDA = `POL-${VENTA}`;
  const PRIMA = 48000;
  await borrarNegociaciones(page, /^(POL-)?OPO-EMI-/);
  await borrarContactos(page, / EMI-/);
  // Preparación del escenario: el asegurado y la venta negociada
  const contacto = await rest<number>(page, 'crm.contact.add', { fields: { NAME: 'Marta', LAST_NAME: 'EMI-Quiroga' } });
  await rest(page, 'crm.deal.add', { fields: { TITLE: VENTA, CONTACT_ID: contacto, OPPORTUNITY: PRIMA, CURRENCY_ID: 'USD' } });

  // Bitrix24 no emite la póliza por su cuenta: una regla de la etapa «Cerrado Ganado» crea la negociación-póliza
  await abrirReglas(page);
  await borrarReglasDe(page, 'Cerrado Ganado', POR_CLIENTE);
  const f = panel(page);
  await f.locator('[class*=robot-btn-add]').nth(5).click({ force: true });
  await page.waitForTimeout(3000);
  await f.getByText('Otro', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  await f.getByText('Crear un elemento CRM', { exact: true }).locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
  await f.locator('select[name=dynamic_type_id]').waitFor({ state: 'visible', timeout: 20_000 });
  await f.locator('select[name=dynamic_type_id]').selectOption({ label: 'Negociación' });
  await page.waitForTimeout(3000);
  const completar = async (etiqueta: RegExp, valor: string) => {
    const titulo = f.getByText(etiqueta).filter({ visible: true }).first();
    await titulo.scrollIntoViewIfNeeded();
    const entrada = titulo.locator('xpath=following::*[self::input[not(@type="hidden")] or self::textarea][1]');
    await entrada.click();
    await entrada.pressSequentially(valor, { delay: 60 });
  };
  await completar(/^Nombre de la entidad\s*:?$/, 'POL-{=Document:TITLE}');
  await completar(/^Importe\s*:?$/, '{=Document:OPPORTUNITY}');
  const capRegla = await capturar(page, 'A.11.1', plataforma, '1-regla-de-emision');
  await f.locator('.bizproc-automation-popup-settings-buttons, .popup-window-buttons').getByText(/^guardar$/i).filter({ visible: true }).last().click();
  await page.waitForTimeout(2500);
  await f.getByText(/^guardar$/i).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  await cerrarReglas(page);

  // Se marca ganada la venta desde su ficha, como lo hace el productor al cerrarla
  let emitida: any;
  let capPoliza = '', capListado = '';
  try {
    await abrirListado(page);
    await buscarEnElListado(page, VENTA);
    await abrirFicha(page, VENTA);
    await cerrarGanada(page);
    await page.waitForTimeout(4000);
    await descartarAvisos(page);
    for (let espera = 0; espera < 24 && !emitida; espera++) {
      await page.waitForTimeout(5000);
      emitida = (await negociaciones(page, new RegExp(`^${EMITIDA}$`), ['ID', 'TITLE', 'CONTACT_ID', 'OPPORTUNITY']))[0];
    }
    await cerrarPaneles(page);
    await abrirListado(page);
    await buscarEnElListado(page, 'EMI-Quiroga');
    capListado = await capturar(page, 'A.11.1', plataforma, '2-listado-con-la-poliza');
    if (emitida) {
      await abrirFicha(page, EMITIDA);
      capPoliza = await capturar(page, 'A.11.1', plataforma, '3-poliza-emitida');
    }
  } finally {
    await cerrarPaneles(page);
    await abrirReglas(page);
    await borrarReglasDe(page, 'Cerrado Ganado', POR_CLIENTE);
    await cerrarReglas(page);
  }
  console.log(`    póliza emitida: ${emitida?.TITLE} · contacto ${emitida?.CONTACT_ID} (asegurado ${contacto}) · importe ${emitida?.OPPORTUNITY}`);
  const conCliente = String(emitida?.CONTACT_ID) === String(contacto);
  const conImporte = Number(emitida?.OPPORTUNITY) === PRIMA;
  await borrarNegociaciones(page, /^(POL-)?OPO-EMI-/);
  await borrarContactos(page, / EMI-/);

  expect(emitida, 'al ganar la venta debe aparecer la póliza').toBeTruthy();

  registrar({
    criterio: 'A.11.1',
    plataforma,
    cumple: conCliente && conImporte ? 2 : 1,
    reparo: (conCliente && conImporte ? 2 : 1) === 1 ? 'manual' : undefined,
    costo: conCliente && conImporte ? 1 : 2,
    resumen: conCliente && conImporte
      ? 'Emite la póliza al ganar la venta, con el nombre, el importe y el asegurado vinculados.'
      : conImporte
        ? 'Emite la póliza al ganar la venta, pero sin el asegurado, que se vincula a mano cada vez.'
        : conCliente
          ? 'Emite la póliza al ganar la venta con el asegurado vinculado, pero sin el importe, que se completa a mano cada vez.'
          : 'Emite la póliza al ganar la venta, pero sin el asegurado ni el importe, que se completan a mano cada vez.',
    comoLoHace:
      'Una regla de automatización de la etapa «Cerrado Ganado» del embudo —«Crear un elemento CRM» de tipo negociación— ' +
      'crea la póliza con el nombre y el importe de la venta como variables del documento. El campo «Contacto» de la regla solo ofrece elegir ' +
      'contactos concretos, no una variable. Al marcar ganada la venta desde su ficha, la regla crea la negociación' +
      `${conImporte ? ' con el importe de la venta' : ' sin el importe'}${conCliente ? ' y vinculada al asegurado' : ', sin el asegurado: se vincula a mano en cada venta'}.`,
    caracteristicas: conImporte
      ? 'La regla corre sola al llegar la negociación a la etapa; toma el título y el importe de la venta con variables del documento, ' +
        'sin volver a escribirlos, y la póliza queda en el listado de negociaciones.'
      : 'La regla corre sola al llegar la negociación a la etapa; toma el título de la venta con una variable del documento, ' +
        'sin volver a escribirlo, y la póliza queda en el listado de negociaciones.',
    justificacion: conCliente && conImporte
      ? 'La póliza se emite sola con el nombre, el importe y el asegurado de la venta. Definir la regla es configuración de una vez; ' +
        'la edición gratuita admite cinco reglas en total.'
      : conImporte
        ? 'La póliza se emite sola con el nombre y el importe de la venta, pero el asegurado no pasa: la regla no admite una variable ' +
          'en el campo del cliente y se vincula a mano en cada venta. La vinculación al asegurado es trabajo permanente en cada venta, además de definir la regla; la edición gratuita admite cinco reglas en total.'
        : conCliente
          ? 'La póliza se emite sola con el nombre y el asegurado de la venta, pero el importe no pasa y se completa a mano en cada venta. ' +
            'Completar el importe es trabajo permanente en cada venta, además de definir la regla; la edición gratuita admite cinco reglas en total.'
          : 'La póliza se emite sola con el nombre de la venta, pero ni el asegurado ni el importe pasan y se completan a mano en cada venta. ' +
            'Completarlos es trabajo permanente en cada venta, además de definir la regla; la edición gratuita admite cinco reglas en total.',
    evidencia: [capRegla, capListado, capPoliza].filter(Boolean),
  });
});

// ── A.11.2 ───────────────────────────────────────────────────────────────────
const FORMAS = ['Débito automático', 'Tarjeta de crédito', 'Cupón de pago', 'Transferencia'];
const ESTADOS_CUOTA = ['Pendiente', 'Pagada', 'Impaga'];

test('A.11.2 — Plan de pago de la prima', async ({ page, browser }, info) => {
  // «Registrar la forma de pago y las cuotas de una póliza, cada una con
  //  vencimiento y estado, y obtener el listado de cuotas impagas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(2_400_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^(POL|CUO)-12-2/);
  for (const c of ['Forma de pago', 'Vencimiento de la cuota', 'Estado de la cuota']) await quitarCampo(page, c);

  // La póliza no trae forma de pago y las cuotas no tienen entidad propia: se agregan campos a la negociación
  await altaDeNegociacion(page);
  await crearCampoPropio(page, 'Lista', 'Forma de pago', FORMAS);
  await crearCampoPropio(page, 'Fecha', 'Vencimiento de la cuota');
  await crearCampoPropio(page, 'Lista', 'Estado de la cuota', ESTADOS_CUOTA);
  await panel(page).locator('input[name="TITLE"]').fill('POL-12-2 Hogar Ledesma');
  await elegirEnLista(page, 'Forma de pago', 'Débito automático');
  const capPoliza = await capturar(page, 'A.11.2', plataforma, '1-forma-de-pago-en-la-poliza');
  await guardarFormulario(page);
  await cerrarPaneles(page);

  // Las cuotas, una por una, como negociaciones que llevan el número de la póliza
  const plan = [
    { dias: -60, estado: 'Pagada' }, { dias: -30, estado: 'Impaga' }, { dias: -2, estado: 'Impaga' }, { dias: 28, estado: 'Pendiente' },
  ];
  let capCuota = '';
  for (const [i, c] of plan.entries()) {
    await altaDeNegociacion(page);
    await panel(page).locator('input[name="TITLE"]').fill(`CUO-12-2-${i + 1} POL-12-2`);
    await escribirFecha(page, 'Vencimiento de la cuota', enDias(c.dias));
    await elegirEnLista(page, 'Estado de la cuota', c.estado);
    if (i === plan.length - 1) capCuota = await capturar(page, 'A.11.2', plataforma, '2-cuota');
    await guardarFormulario(page);
    await cerrarPaneles(page);
  }

  // El listado de impagas: el listado de negociaciones filtrado por el estado de la cuota
  await abrirListado(page);
  await filtrarLista(page, 'Estado de la cuota', 'Impaga');
  await buscarConFiltro(page);
  const filas = await filasDelListado(page, /^CUO-12-2/);
  const capImpagas = await capturar(page, 'A.11.2', plataforma, '3-cuotas-impagas');
  await reiniciarFiltro(page);
  console.log(`    impagas: ${filas.join(' · ')}`);

  const estado = (await negociaciones(page, /^CUO-12-2/)).length;
  await borrarNegociaciones(page, /^(POL|CUO)-12-2/);
  expect(estado, 'deben haberse guardado las cuatro cuotas').toBe(4);
  expect(filas.length, 'el listado debe traer las dos impagas y ninguna otra').toBe(2);
  expect(filas.some(t => /CUO-12-2-(1|4)/.test(t))).toBeFalsy();

  const profesional = [
    await citar(browser, { url: 'https://www.bitrix24.com/promo/professional/', buscar: /SPA \(smart process automation\)/i, captura: 'A-11-2-bitrix24-4-procesos-inteligentes' }),
    ...(await constanciaDe(browser, BITRIX24_PROFESSIONAL, 'A-11-2-bitrix24-professional')),
  ];
  registrar({
    criterio: 'A.11.2',
    plataforma,
    cumple: 1,
    reparo: 'parcial',
    costo: 2,
    resumen: 'Lleva cada cuota registrada como si fuera una venta, con vencimiento y estado, y lista las impagas con un filtro, pero las cuotas no cuelgan de la póliza: se relacionan solo por el título.',
    comoLoHace:
      'La póliza se lleva como una negociación con un campo de lista «Forma de pago». Sin entidades ' +
      'propias, cada cuota es una negociación con su vencimiento y su estado —pendiente, pagada o ' +
      'impaga— y el número de la póliza en el título. El listado de impagas es el listado de ' +
      'negociaciones filtrado por el estado de la cuota.',
    caracteristicas:
      'Campos propios de lista y de fecha en el formulario de la negociación, filtro por estado en el listado, sin programar.',
    justificacion: 'El procedimiento pide registrar las cuotas de una póliza: se registran con vencimiento y estado y las impagas salen con un filtro, pero las cuotas no quedan vinculadas a la póliza, solo identificadas por su número en el título.',
    evidencia: [capPoliza, capCuota, capImpagas],
    documentacion: profesional,
    conPlan: [conPlanDe(BITRIX24_PROFESSIONAL, {
      cumple: 2,
      costo: 1,
      justificacion:
        'El plan Professional trae procesos inteligentes: la cuota pasa a ser una entidad propia, con su listado, sus campos y su vínculo a la póliza, ' +
        'y el listado de impagas deja de mezclarse con las pólizas. Crear la entidad y sus campos es configuración de una vez.',
    })],
  });
});

// ── A.11.3 ───────────────────────────────────────────────────────────────────
/** Recursos para desarrolladores › Otro › Webhook entrante, hasta donde deja avanzar el plan. */
async function abrirWebhookEntrante(page: Page) {
  await menuAplicaciones(page, 'Recursos para desarrolladores');
  await panel(page).getByText('Otro', { exact: true }).first().click();
  await panel(page).getByText('Webhook entrante', { exact: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);
  await panel(page).getByText('Webhook entrante', { exact: true }).first().click();
  await page.waitForTimeout(7000);
}

test('A.11.3 — Datos que administra el sistema central', async ({ page, browser }, info) => {
  // «Actualizar desde afuera una póliza por su número, sin que se duplique, y
  //  comprobar que los campos que administra el sistema central quedan de solo
  //  lectura para el usuario del CRM»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await abrirWebhookEntrante(page);
  const aviso = await textoDe(page);
  const capAviso = await capturar(page, 'A.11.3', plataforma, '1-webhook-entrante');
  await cerrarPaneles(page);

  const api = await comparativo(browser, /^REST API Available on Vibe\+ plans/, 'A-11-3-bitrix24-2-api-por-plan');
  const precio = await constanciaDe(browser, BITRIX24_BASIC_VIBE, 'A-11-3-bitrix24-basic-vibe');

  expect(aviso, 'el webhook entrante debe pedir otro plan').toMatch(/No disponible en tu plan actual/);
  expect(api.planes[CODIGOS.free]).toBe('uncheck');

  registrar({
    criterio: 'A.11.3',
    plataforma,
    cumple: 0,
    resumen: 'La edición gratuita no permite que el sistema central actualice pólizas desde afuera: la conexión de entrada para otros sistemas exige el plan Basic Vibe+.',
    comoLoHace:
      'En la edición gratuita el sistema central no tiene por dónde actualizar una póliza: en Recursos para desarrolladores se ofrece ' +
      '«Webhook entrante» y, al abrirlo, el sistema responde «No disponible en tu plan actual» y remite al plan Basic Vibe+.',
    justificacion:
      'Sin interfaz de programación habilitada no hay forma de actualizar desde afuera una póliza por su número, así que el primer ' +
      'tramo del procedimiento no se puede ejecutar. El comparativo del fabricante lo confirma: la API REST no figura en la edición gratuita.',
    evidencia: [capAviso],
    documentacion: [api.fuente, ...precio],
    conPlan: [conPlanDe(BITRIX24_BASIC_VIBE, {
      cumple: 1,
      costo: 2,
      justificacion:
        'Con el plan Basic en su edición Vibe+ la API REST no tiene tope y el sistema central puede buscar la póliza por su número y actualizarla ' +
        'sin duplicarla; ese cliente de integración lo desarrolla la compañía. La protección de los campos del central en el CRM no se evaluó en ese plan, por eso se computa con reparo.',
    })],
  });
});

// ── A.11.4 ───────────────────────────────────────────────────────────────────
test('A.11.4 — Historia del cliente desde el primer contacto', async ({ page, browser }, info) => {
  // «Registrar una llamada sobre un solicitante, convertirlo y emitirle la
  //  póliza, y comprobar que la llamada figura en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const LLAMADA = 'Llamada entrante: consulta por seguro de hogar, pregunta por incendio y robo';
  await borrarNegociaciones(page, /^POL-12-4/);
  await borrarContactos(page, / EMI-/);

  // El solicitante es un contacto: la edición gratuita no incluye prospectos
  await altaDeContacto(page);
  await llenarContacto(page, 'Gabriela', 'EMI-Ledesma');
  await guardarContacto(page);
  await cerrarPaneles(page);
  await abrirContacto(page, 'EMI-Ledesma');
  await registrarActividad(page, LLAMADA);
  const capLlamada = await capturar(page, 'A.11.4', plataforma, '1-llamada-registrada');
  await cerrarPaneles(page);

  // Se le emite la póliza desde su ficha, con «Nueva negociación»
  await abrirContacto(page, 'EMI-Ledesma');
  await panel(page).getByText('Negociaciones', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  await panel(page).getByText(/^\s*\+?\s*Nueva negociación\s*$/i).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).locator('input[name="TITLE"]'));
  await panel(page).locator('input[name="TITLE"]').fill('POL-12-4 Hogar Ledesma');
  await guardarFormulario(page);
  await cerrarPaneles(page);

  // La ficha del asegurado conserva la llamada y muestra la póliza
  await abrirContacto(page, 'EMI-Ledesma');
  await page.waitForTimeout(3000);
  const ficha = await textoDe(page);
  const capFicha = await capturar(page, 'A.11.4', plataforma, '2-ficha-del-asegurado');
  await cerrarPaneles(page);
  const [c] = await contactos(page, / EMI-Ledesma$/, ['ID', 'NAME', 'LAST_NAME']);
  const [poliza] = await negociaciones(page, /^POL-12-4/, ['ID', 'TITLE', 'CONTACT_ID']);
  const historial = await actividadesDe(page, c.ID);
  const guardada = historial.some(a => (a.DESCRIPTION + a.SUBJECT).includes('Llamada entrante'));
  console.log(`    llamada guardada: ${guardada} · en la ficha: ${ficha.includes('Llamada entrante')} · póliza del contacto: ${String(poliza?.CONTACT_ID) === String(c.ID)}`);
  await borrarNegociaciones(page, /^POL-12-4/);
  await borrarContactos(page, / EMI-/);

  expect(String(poliza?.CONTACT_ID), 'la póliza debe quedar a nombre del mismo contacto').toBe(String(c.ID));
  expect(guardada, 'la llamada debe estar entre las actividades del contacto').toBeTruthy();
  expect(ficha, 'la ficha del asegurado debe mostrar la llamada').toContain('Llamada entrante');

  const fuentes = [
    await citar(browser, { url: 'https://www.bitrix24.es/prices/', buscar: /Todo lo incluido en Basic, más:.*Prospectos ilimitados/, captura: 'A-11-4-bitrix24-3-prospectos-en-standard' }),
    ...(await constanciaDe(browser, BITRIX24_STANDARD, 'A-11-4-bitrix24-standard')),
  ];
  registrar({
    criterio: 'A.11.4',
    plataforma,
    cumple: 2,
    costo: 0,
    resumen: 'Un mismo contacto es solicitante y asegurado: la llamada que se registró al principio sigue en su ficha junto a la póliza, sin conversión que lo duplique.',
    comoLoHace:
      'El solicitante se registra como contacto y la llamada se anota en la pestaña «Actividad» de su ficha, como un pendiente de texto libre. ' +
      'Para emitirle la póliza se crea la negociación desde esa misma ficha, que queda a su nombre. En la ficha del asegurado la llamada sigue estando, junto a la póliza.',
    caracteristicas:
      'El mismo contacto es solicitante y asegurado, sin conversión que lo mueva ni lo duplique; su ficha reúne actividades y negociaciones.',
    justificacion: 'El procedimiento pide que la llamada figure en la ficha del asegurado, y figura sin configurar nada. Que no haya una etapa de solicitante ni un tipo propio de llamada no impide seguir la historia.',
    evidencia: [capLlamada, capFicha],
    documentacion: fuentes,
  });
});

// ── A.11.5 ───────────────────────────────────────────────────────────────────
const PUNTAJES = ['1 - Muy insatisfecho', '2 - Insatisfecho', '3 - Neutral', '4 - Satisfecho', '5 - Muy satisfecho'];

test('A.11.5 — Satisfacción después de la atención', async ({ page }, info) => {
  // «Al cerrar un reclamo, enviar o registrar una encuesta y comprobar que la
  //  respuesta queda en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^REC-12-5/);
  await borrarContactos(page, / EMI-/);
  await quitarCampoDeContacto(page, 'Satisfacción con la atención');
  await rest(page, 'crm.contact.add', { fields: { NAME: 'Raúl', LAST_NAME: 'EMI-Sosa' } });
  await rest(page, 'crm.deal.add', { fields: { TITLE: 'REC-12-5 Granizo en el techo', CONTACT_ID: (await contactos(page, / EMI-Sosa$/, ['ID', 'NAME', 'LAST_NAME']))[0].ID } });

  // Se cierra el reclamo desde su ficha
  await abrirListado(page);
  await buscarEnElListado(page, 'REC-12-5');
  await abrirFicha(page, 'REC-12-5 Granizo en el techo');
  await cerrarGanada(page);
  await page.waitForTimeout(4000);
  await descartarAvisos(page);
  await cerrarPaneles(page);

  // La encuesta no viene incorporada: el puntaje se registra en un campo del contacto
  await abrirContacto(page, 'EMI-Sosa');
  await page.waitForTimeout(2000);
  await panel(page).getByText(/^\s*Editar\s*$|^\s*cambiar\s*$/i).filter({ visible: true }).first().click({ force: true }).catch(() => {});
  await crearCampoPropio(page, 'Lista', 'Satisfacción con la atención', PUNTAJES);
  await elegirEnListaDeContacto(page, 'Satisfacción con la atención', PUNTAJES[3]);
  await guardarFormulario(page);
  const capFicha = await capturar(page, 'A.11.5', plataforma, '1-satisfaccion-en-la-ficha');
  await cerrarPaneles(page);

  const campo = await campoDeContacto(page, 'Satisfacción con la atención');
  const [c] = await contactos(page, / EMI-Sosa$/);
  const valor = campo?.LIST?.find((l: any) => String(l.ID) === String(c?.[campo.FIELD_NAME]))?.VALUE;
  console.log(`    satisfacción guardada: ${valor}`);
  await borrarNegociaciones(page, /^REC-12-5/);
  await borrarContactos(page, / EMI-/);
  await quitarCampoDeContacto(page, 'Satisfacción con la atención');
  expect(valor, 'la respuesta debe quedar en la ficha del asegurado').toBe(PUNTAJES[3]);

  registrar({
    criterio: 'A.11.5',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen: 'Registra el puntaje de satisfacción en la ficha del asegurado al cerrar el reclamo, en un campo de lista propio; cada respuesta nueva reemplaza a la anterior.',
    comoLoHace:
      'El reclamo —una negociación— se cierra pasándolo a «Cerrado Ganado», y la respuesta del ' +
      'asegurado se registra en un campo de lista «Satisfacción con la atención», agregado a la ' +
      'ficha del contacto, donde queda guardada.',
    caracteristicas:
      'Campo de lista con cinco puntajes en el formulario del contacto, creado desde la propia pantalla, sin programar.',
    justificacion: 'El procedimiento pide enviar o registrar la encuesta y que la respuesta quede en la ficha del asegurado: se registra en un campo configurado una vez, sin programar. Que cada respuesta reemplace a la anterior no lo exige el procedimiento.',
    evidencia: [capFicha],
  });
});
