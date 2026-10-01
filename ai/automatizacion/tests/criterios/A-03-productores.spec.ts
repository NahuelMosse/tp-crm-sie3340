import { Page, test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, entrarComo, plataformaDe } from '../sesion';
import { cargarCartera, ASEGURADOS, PRODUCTOR, rolProductor } from '../datos';
import { apiEspo, crear, listar } from '../api';
import { citar } from '../fuentes';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, filasDelListado, clicEnAccion } from './comun';
import { alta, ficha, inicio as irAlInicio, pestana } from '../espocrm/navegar';

/**
 * A.3 — Productores y actividad comercial
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema.
 */

test.describe.configure({ mode: 'serial' });

/** El productor que se da de alta en A.3.1, distinto del de la cartera de referencia. */
const NUEVO = { usuario: 'lsosa', nombre: 'Laura', apellido: 'Sosa', clave: 'Productora1234!' };
let nuevoId = '';
let aseguradosIds: string[] = [];

test.beforeAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api, asegurados } = await cargarCartera();
  aseguradosIds = asegurados;
  const productor = (await listar(api, 'User', { maxSize: 200 })).list.find((u: any) => u.userName === PRODUCTOR.userName);
  await rolProductor(api, productor.id);

  // Lo que dejaron corridas anteriores se quita: cada corrida mide lo mismo
  for (const u of (await listar(api, 'User', { maxSize: 200 })).list.filter((u: any) => u.userName === NUEVO.usuario)) {
    await api.delete(`User/${u.id}`);
  }
  for (const entidad of ['Call', 'Meeting']) {
    for (const r of (await listar(api, entidad, { maxSize: 200 })).list.filter((r: any) => /— bitácora$/.test(r.name))) {
      await api.delete(`${entidad}/${r.id}`);
    }
  }
});

/** Campo de vínculo: se busca por nombre y se elige la sugerencia que corresponde. */
async function vincular(page: Page, campo: string, nombre: string, dentroDe = '') {
  const entrada = page.locator(`${dentroDe} .field[data-name="${campo}"] input[type="text"]`).first();
  await entrada.click();
  await entrada.pressSequentially(nombre, { delay: 50 });
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: nombre }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

// ── A.3.1 ────────────────────────────────────────────────────────────────────
test('A.3.1 — Registro de productores y asignación de cartera', async ({ page }, info) => {
  // «Crear un usuario productor y asignarle un conjunto de asegurados como responsable»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await alta(page, 'User');
  const usuario = page.locator('input[data-name="userName"]').first();
  await usuario.waitFor({ state: 'visible', timeout: 40_000 });
  await usuario.pressSequentially(NUEVO.usuario, { delay: 30 });
  await page.locator('input[data-name="firstName"]').first().pressSequentially(NUEVO.nombre, { delay: 30 });
  await page.locator('input[data-name="lastName"]').first().pressSequentially(NUEVO.apellido, { delay: 30 });
  await vincular(page, 'roles', 'Productor');
  await page.locator('input[data-name="password"]').first().pressSequentially(NUEVO.clave, { delay: 20 });
  await page.locator('input[data-name="passwordConfirm"]').first().pressSequentially(NUEVO.clave, { delay: 20 });
  const capAlta = await capturar(page, 'A.3.1', plataforma, '1-alta-del-productor');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#User\/view\//, { timeout: 30_000 });
  nuevoId = page.url().split('/').pop()!;

  // La cartera: tres asegurados de una vez, desde el listado
  const tres = ASEGURADOS.slice(3, 6).map(a => a.lastName);
  await listadoLimpio(page, 'Contact');
  for (const apellido of tres) {
    await page.locator('tbody tr').filter({ hasText: apellido }).locator('input[type="checkbox"]').first().check();
  }
  await page.locator('.actions-button:visible').first().click();
  await page.locator('[data-action="massUpdate"]:visible').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('.select-field').first().click();
  await dialogo.locator('a[data-action="addField"][data-name="assignedUser"]').first().click();
  await page.waitForTimeout(1200);
  await vincular(page, 'assignedUser', NUEVO.apellido, '.modal-dialog');
  await dialogo.locator('button[data-name="update"]').first().click();
  await page.waitForTimeout(1500);
  const confirmar = page.locator('.modal-dialog button').filter({ hasText: /^S[ií]$|^Aceptar$|^Actualizar$/ }).first();
  if (await confirmar.isVisible().catch(() => false)) await confirmar.click();
  await page.waitForTimeout(4000);

  // Desde la cuenta de la productora nueva
  await entrarComo(page, NUEVO.usuario, NUEVO.clave);
  await listadoLimpio(page, 'Contact');
  const suyos = await filasDelListado(page);
  const capCartera = await capturar(page, 'A.3.1', plataforma, '2-cartera-de-la-productora');

  for (const apellido of tres) expect(suyos.some(n => n.includes(apellido)), `${apellido} debe ser suyo`).toBeTruthy();
  expect(suyos.length, 'la productora ve solo su cartera').toBe(tres.length);

  registrar({
    criterio: 'A.3.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Se dio de alta una productora desde la administración de usuarios —con su rol, que la limita a lo ' +
      'propio— y se le asignaron tres asegurados de una sola vez, marcándolos en el listado y cambiando el ' +
      'responsable con la actualización masiva. Al ingresar con su cuenta, su listado de asegurados muestra ' +
      'exactamente esos tres. El responsable asignado viene de fábrica en todas las entidades, y la ' +
      'actualización masiva lo admite sin configurar nada.',
    evidencia: [capAlta, capCartera],
  });
});

// ── A.3.2 ────────────────────────────────────────────────────────────────────
test('A.3.2 — Bitácora de la actividad con el cliente', async ({ page }, info) => {
  // «Registrar una llamada y una reunión sobre un asegurado, y comprobar que
  //  ambas quedan visibles en orden cronológico con su autor»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const asegurado = aseguradosIds[0];
  await entrar(page, plataforma);

  const registrarDesdeLaFicha = async (vinculo: 'calls' | 'meetings', nombre: string) => {
    await ficha(page, 'Contact', asegurado);
    const historial = page.locator('.panel[data-name="history"]').first();
    await historial.waitFor({ state: 'visible', timeout: 40_000 });
    const accion = historial.locator(`[data-action="createActivity"][data-link="${vinculo}"]`);
    if (!(await accion.first().isVisible().catch(() => false))) {
      await historial.locator('.dropdown-toggle').first().click();
    }
    await accion.first().click();
    const dialogo = page.locator('.modal-dialog').first();
    await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
    const campo = dialogo.locator('input[data-name="name"]').first();
    await campo.clear();
    await campo.pressSequentially(nombre, { delay: 15 });
    await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(4000);
  };

  await registrarDesdeLaFicha('calls', 'Llamada por renovación — bitácora');
  await page.waitForTimeout(61_000);     // un minuto después, para que el orden se vea en la hora
  await registrarDesdeLaFicha('meetings', 'Reunión en la agencia — bitácora');

  await ficha(page, 'Contact', asegurado);
  const historial = page.locator('.panel[data-name="history"]').first();
  await historial.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(3000);
  const filas = (await historial.locator('.list-row, tr, li').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
  const capBitacora = await capturar(page, 'A.3.2', plataforma, '1-bitacora');

  // El orden y el autor se leen de lo que el sistema guardó
  const api = await apiEspo();
  const llamada = (await listar(api, 'Call', { maxSize: 200 })).list.find((c: any) => /renovación — bitácora/.test(c.name));
  const reunion = (await listar(api, 'Meeting', { maxSize: 200 })).list.find((m: any) => /agencia — bitácora/.test(m.name));

  const posLlamada = filas.findIndex(t => t.includes('Llamada por renovación'));
  const posReunion = filas.findIndex(t => t.includes('Reunión en la agencia'));

  expect(posLlamada, 'la llamada debe figurar en la bitácora').toBeGreaterThanOrEqual(0);
  expect(posReunion, 'la reunión debe figurar en la bitácora').toBeGreaterThanOrEqual(0);
  expect(posReunion, 'la más reciente va primero').toBeLessThan(posLlamada);
  expect(llamada.createdByName && reunion.createdByName, 'cada una conserva su autor').toBeTruthy();

  registrar({
    criterio: 'A.3.2',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'La ficha del asegurado trae un historial de actividades con acciones para registrar una llamada o una ' +
      'reunión sin salir de ella. Se registraron las dos, con un minuto de diferencia, y el historial las ' +
      'muestra ordenadas por fecha, la más reciente primero, cada una con su responsable y con quién la cargó. ' +
      'Viene de fábrica. Es lo que permite que cualquiera que atienda al asegurado sepa qué se habló antes.',
    evidencia: [capBitacora],
    medicion: `Autor registrado: ${llamada.createdByName}`,
  });
});

// ── A.3.3 ────────────────────────────────────────────────────────────────────
test('A.3.3 — Agenda y carga de trabajo del productor', async ({ page }, info) => {
  // «Ingresar con un usuario productor y comprobar que dispone de una vista de
  //  sus pendientes y compromisos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // Un compromiso y un pendiente a su nombre
  const api = await apiEspo();
  const productor = (await listar(api, 'User', { maxSize: 200 })).list.find((u: any) => u.userName === PRODUCTOR.userName);
  const manana = new Date(Date.now() + 86_400_000);
  const aTexto = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
  await crear(api, 'Meeting', {
    name: 'Visita a la agencia — bitácora', status: 'Planned', assignedUserId: productor.id,
    dateStart: aTexto(manana), dateEnd: aTexto(new Date(manana.getTime() + 3_600_000)), usersIds: [productor.id],
  });

  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await irAlInicio(page);
  await page.waitForTimeout(6000);
  const inicio = await textoDe(page);
  const capInicio = await capturar(page, 'A.3.3', plataforma, '1-inicio-del-productor');
  await pestana(page, 'Calendar');
  await page.waitForTimeout(6000);
  const capCalendario = await capturar(page, 'A.3.3', plataforma, '2-calendario');

  expect(/próximas actividades/i.test(inicio), 'su inicio debe mostrar sus próximas actividades').toBeTruthy();
  expect(inicio, 'el compromiso debe figurar entre sus pendientes').toContain('Visita a la agencia');

  registrar({
    criterio: 'A.3.3',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Al ingresar con la cuenta del productor, su página de inicio muestra sus próximas actividades —la ' +
      'visita agendada para el día siguiente figura ahí— y el calendario reúne reuniones, llamadas y tareas en ' +
      'vistas por día, semana y mes. Cada productor ve lo suyo sin preparar nada: el tablero y el calendario ' +
      'vienen de fábrica, y cada uno puede sumar a su inicio sus tareas, sus casos o sus oportunidades.',
    evidencia: [capInicio, capCalendario],
  });
});

// ── A.3.4 ────────────────────────────────────────────────────────────────────
test('A.3.4 — Proyección de los movimientos comerciales', async ({ page, browser }, info) => {
  // «Cargar oportunidades con monto y probabilidad, y comprobar si el sistema
  //  calcula un total proyectado por período»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Tres oportunidades del mes en curso, en etapas distintas
  const api = await apiEspo();
  for (const o of (await listar(api, 'Opportunity', { maxSize: 200 })).list.filter((o: any) => /— proyección$/.test(o.name))) {
    await api.delete(`Opportunity/${o.id}`);
  }
  const hoy = new Date();
  const esteMes = (dia: number) => new Date(hoy.getFullYear(), hoy.getMonth(), dia).toISOString().slice(0, 10);
  const cargadas = [
    { name: 'Flota de automotores — proyección', amount: 300000, stage: 'Proposal', closeDate: esteMes(25) },
    { name: 'Hogar de temporada — proyección', amount: 80000, stage: 'Qualification', closeDate: esteMes(26) },
    { name: 'Vida colectivo — proyección', amount: 150000, stage: 'Negotiation', closeDate: esteMes(27) },
  ];
  for (const o of cargadas) await crear(api, 'Opportunity', { ...o, amountCurrency: 'ARS' });
  const guardadas = (await listar(api, 'Opportunity', { maxSize: 200 })).list.filter((o: any) => /— proyección$/.test(o.name));

  // El tablero de canalización de ventas, sobre el mes en curso
  await entrar(page, plataforma);
  await irAlInicio(page);
  await page.waitForTimeout(5000);
  let caja = page.locator('.dashlet[data-name="SalesPipeline"]').first();
  if (!(await caja.count())) {
    await clicEnAccion(page, page.locator('[data-action="addDashlet"]').first());
    await page.locator('.modal-dialog a, .modal-dialog li').filter({ hasText: /Canalización de ventas/ }).first().click();
    await page.waitForTimeout(4000);
    caja = page.locator('.dashlet[data-name="SalesPipeline"]').first();
  }
  await caja.locator('.menu-button').first().click();
  await caja.locator('[data-action="options"]').first().click();
  const ajustes = page.locator('.modal-dialog').first();
  await ajustes.waitFor({ state: 'visible', timeout: 20_000 });
  const opciones = await ajustes.locator('.field[data-name]').evaluateAll(fs => fs.map(f => f.getAttribute('data-name')));
  await elegirLista(page, 'dateFilter', 'currentMonth', '.modal-dialog');
  await ajustes.getByRole('button', { name: /^Aplicar$|^Guardar$/ }).first().click();
  await page.waitForTimeout(5000);
  const capTablero = await capturar(page, 'A.3.4', plataforma, '1-canalizacion-del-mes');

  // Los valores que dibuja el tablero, leídos de la misma fuente que lo alimenta
  const datos = (await (await api.get('Opportunity/action/reportSalesPipeline', { params: { dateFilter: 'currentMonth' } })).json()).dataList;
  const porEtapa = Object.fromEntries(datos.map((d: any) => [d.stage, d.value]));
  const ponderado = guardadas.reduce((s: number, o: any) => s + o.amount * o.probability / 100, 0);
  console.log(`    por etapa: ${JSON.stringify(porEtapa)} · ponderado que no se muestra: ${ponderado}`);

  const fuentes = [
    await citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: /summarized values, can be grouped/i, captura: 'A-3-4-espocrm-2-informes' }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-3-4-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-3-4-espocrm-nube'),
  ];

  expect(porEtapa.Proposal, 'el tablero suma el monto de cada etapa del período').toBeGreaterThanOrEqual(300000);
  expect(opciones.some(o => /probab|weight|pondera/i.test(o ?? '')), 'el tablero no ofrece ponderar por probabilidad').toBeFalsy();

  registrar({
    criterio: 'A.3.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Se cargaron tres oportunidades del mes con monto y etapa, y el sistema les asignó la probabilidad de ' +
      'cada etapa. El tablero de canalización de ventas suma los montos por etapa para el período elegido ' +
      '—mes, trimestre, año, año fiscal o un rango—, de modo que muestra cuánto hay en juego en cada instancia. ' +
      'Lo que no calcula es la proyección: cada oportunidad tiene su monto ponderado por la probabilidad, pero ' +
      'ningún tablero ni listado los totaliza, y el total esperado del período ' +
      `—${ponderado.toLocaleString('es-AR')} en este caso— se obtiene exportando y sumando afuera cada vez. ` +
      'El módulo de informes del fabricante suma cualquier campo agrupado por período, el ponderado incluido.',
    evidencia: [capTablero],
    documentacion: fuentes,
    medicion: `Por etapa: ${JSON.stringify(porEtapa)} · proyección ponderada no mostrada: ${ponderado}`,
    conPlan: [
      conPlanDe(ESPOCRM_ADVANCED_PACK, { cumple: 2, costo: 1,
        justificacion: 'Un informe agrupado por mes de cierre suma el monto ponderado y da la proyección del período.' }),
      conPlanDe(ESPOCRM_CLOUD_BASIC, { cumple: 2, costo: 1,
        justificacion: 'El servicio en la nube incluye el módulo de informes.' }),
    ],
  });
});
