import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { rest, textoDe, altaDeNegociacion, escribirEn, guardarFormulario, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import {
  PREFIJO, altaDeContacto, llenarContacto, guardarContacto, contactos, borrarContactos,
  registrarActividad, actividadesDe, usuarioActual, borrarTareas,
} from '../../bitrix24/actividades';
import { productor, entrarComoProductor } from '../../bitrix24/escenario';

/**
 * A.3 — Productores, sobre Bitrix24
 */

test.describe.configure({ mode: 'serial' });

// ── A.3.1 ────────────────────────────────────────────────────────────────────
test('A.3.1 — Registro de productores y asignación de cartera', async ({ page }, info) => {
  // «Crear un usuario productor y asignarle un conjunto de asegurados como
  //  responsable»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarContactos(page, new RegExp(`^${PREFIJO}CARTERA-`));

  // El productor se da de alta una sola vez, desde «Empleados», y se reutiliza
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');
  const capInvitacion = await capturar(page, 'A.3.1', plataforma, '1-productor-alta');

  // Tres asegurados de prueba, cargados por pantalla
  const nombres = ['Uno', 'Dos', 'Tres'];
  for (const n of nombres) {
    await altaDeContacto(page);
    await llenarContacto(page, `${PREFIJO}CARTERA-${n}`, 'Asegurado');
    await guardarContacto(page);
    await cerrarPaneles(page);
  }
  const capCargados = await capturar(page, 'A.3.1', plataforma, '2-asegurados');

  // Se seleccionan los tres en el listado y se les cambia el responsable en bloque
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contactos');

  for (const n of nombres) {
    await page.locator('tr').filter({ hasText: new RegExp(`${PREFIJO}CARTERA-${n}`) }).locator('input[type="checkbox"]').first().click({ force: true });
  }
  await page.waitForTimeout(1000);
  const capSeleccion = await capturar(page, 'A.3.1', plataforma, '3-seleccion');

  // La barra de acciones del listado: «Seleccione la acción» › «Cambiar a la persona responsable»
  await page.locator('[data-name="group_action"]').first().click({ force: true });
  await page.waitForTimeout(1200);
  await page.locator('.menu-popup-item-text').filter({ hasText: 'Cambiar a la persona responsable' }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('.main-grid-panel-control-container button').filter({ hasText: /^Agregar$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  // El selector de usuarios ofrece a los recientes: se elige al productor de la lista
  await page.locator('.popup-window').getByText('Gómez Productor').filter({ visible: true }).first().click();
  await page.waitForTimeout(1200);
  await page.locator('.main-grid-panel-control-container button').filter({ hasText: /^Aplicar$/ }).filter({ visible: true }).first().click({ force: true });
  await page.waitForTimeout(6000);
  const capAsignados = await capturar(page, 'A.3.1', plataforma, '4-asignados');

  const usuario = await usuarioActual(page); // admin, solo para tener el listado de usuarios como referencia
  const cartera = await contactos(page, new RegExp(`^${PREFIJO}CARTERA-`), ['ID', 'NAME', 'ASSIGNED_BY_ID']);
  const productorId = String(cartera[0]?.ASSIGNED_BY_ID);
  const todosAsignados = cartera.every(c => String(c.ASSIGNED_BY_ID) === productorId) && productorId !== String(usuario.ID);
  console.log(`    asegurados: ${cartera.length} · responsable: ${productorId} (admin: ${usuario.ID})`);

  expect(cartera.length, 'los tres asegurados deben quedar cargados').toBe(3);
  expect(todosAsignados, 'los tres deben quedar con el mismo responsable, distinto del administrador').toBeTruthy();

  registrar({
    criterio: 'A.3.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Un usuario se da de alta como empleado desde «Empleados», con su propia cuenta y contraseña: es el productor. ' +
      'Sobre el listado de contactos —que en la edición gratuita hace de cartera de asegurados, a falta de una ' +
      'entidad propia— se seleccionan varios registros y se les cambia el responsable en bloque a ese productor, ' +
      'sin programar nada. El alta del usuario es un trámite de una vez por productor; asignar la cartera es una ' +
      'acción del listado que se repite cuando cambia la asignación.',
    evidencia: [capInvitacion, capCargados, capSeleccion, capAsignados],
    medicion: `${cartera.length} asegurados asignados al productor ${gomez.usuario}`,
  });
});

// ── A.3.2 ────────────────────────────────────────────────────────────────────
test('A.3.2 — Bitácora de la actividad con el cliente', async ({ page }, info) => {
  // «Registrar una llamada y una reunión sobre un asegurado, y comprobar que
  //  ambas quedan visibles en orden cronológico con su autor»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await borrarContactos(page, new RegExp(`^${PREFIJO}BITACORA-`));

  await altaDeContacto(page);
  await llenarContacto(page, `${PREFIJO}BITACORA-Cliente`, 'Asegurado');
  await guardarContacto(page);
  await page.waitForTimeout(1500);
  const capFicha = await capturar(page, 'A.3.2', plataforma, '1-ficha');

  await registrarActividad(page, 'Llamada de seguimiento: se habló con el asegurado por la renovación');
  const capLlamada = await capturar(page, 'A.3.2', plataforma, '2-llamada');
  await registrarActividad(page, 'Reunión de revisión de póliza: se repasaron las coberturas');
  const capReunion = await capturar(page, 'A.3.2', plataforma, '3-reunion');

  const [contacto] = await contactos(page, new RegExp(`^${PREFIJO}BITACORA-`), ['ID', 'NAME', 'LAST_NAME']);
  const historial = await actividadesDe(page, contacto.ID);
  const ordenCronologico = historial.every((a, i) => i === 0 || new Date(a.CREATED) >= new Date(historial[i - 1].CREATED));
  console.log(`    actividades: ${historial.map(a => `${a.TYPE_ID}/${a.AUTHOR_ID}/${a.SUBJECT}`).join(' · ')}`);

  expect(historial.length, 'deben quedar registradas las dos actividades').toBeGreaterThanOrEqual(2);
  expect(ordenCronologico, 'las actividades deben quedar en orden cronológico').toBeTruthy();
  expect(historial.every(a => !!a.AUTHOR_ID), 'cada actividad debe llevar su autor').toBeTruthy();

  registrar({
    criterio: 'A.3.2',
    plataforma,
    cumple: 1,
    justificacion:
      'La línea de tiempo del contacto registra actividades con su autor y su momento, en orden cronológico, sin ' +
      'configurar nada. En la edición gratuita, sin embargo, la ficha no ofrece la llamada ni la reunión como tipos ' +
      'de actividad propios: la pestaña «Actividad» carga un pendiente de texto libre, y la llamada nativa exige ' +
      'telefonía y la reunión, una integración de videoconferencia. La llamada y la reunión se registran como ' +
      'pendientes que indican el tipo en el texto, de modo que el usuario debe escribirlo cada vez y no se puede ' +
      'filtrar el historial por tipo.',
    evidencia: [capFicha, capLlamada, capReunion],
    medicion: `${historial.length} actividades registradas`,
  });
});

// ── A.3.3 ────────────────────────────────────────────────────────────────────
test('A.3.3 — Agenda y carga de trabajo del productor', async ({ page, browser }, info) => {
  // «Ingresar con un usuario productor y comprobar que dispone de una vista
  //  de sus pendientes y compromisos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');

  // Preparación: un pendiente asignado al productor, desde la cuenta del administrador
  await borrarTareas(page, /^ACT-PEND-/);
  const vence = new Date(Date.now() + 3 * 86_400_000).toISOString();
  await rest(page, 'tasks.task.add', { fields: { TITLE: 'ACT-PEND-1 Llamar al asegurado por la renovación', RESPONSIBLE_ID: gomez.id, DEADLINE: vence } });

  const { contexto, pagina } = await entrarComoProductor(browser, gomez);
  try {
    await menuLateral(pagina, 'Tareas');
    await pagina.waitForTimeout(4000);
    const capTareas = await capturar(pagina, 'A.3.3', plataforma, '1-mis-tareas');
    const enTareas = /ACT-PEND-1/.test(await textoDe(pagina));

    await menuLateral(pagina, 'Calendario');
    await pagina.waitForTimeout(4000);
    const capCalendario = await capturar(pagina, 'A.3.3', plataforma, '2-calendario');
    const enCalendario = /ACT-PEND-1/.test(await textoDe(pagina));

    await menuLateral(pagina, 'CRM');
    await pestana(pagina, 'Mis actividades').catch(() => {});
    await pagina.waitForTimeout(4000);
    const capActividades = await capturar(pagina, 'A.3.3', plataforma, '3-mis-actividades');
    const conActividades = /Mis actividades/i.test(await textoDe(pagina));
    console.log(`    pendiente en Mis tareas: ${enTareas} · en el Calendario: ${enCalendario} · «Mis actividades» del CRM: ${conActividades}`);

    await borrarTareas(page, /^ACT-PEND-/);
    expect(enTareas, 'el pendiente asignado debe figurar en las tareas del productor').toBeTruthy();

    registrar({
      criterio: 'A.3.3',
      plataforma,
      cumple: 2,
      costo: 0,
      justificacion:
        'Con la sesión propia del productor, «Tareas» abre «Mis tareas» con lo que tiene asignado, con su fecha ' +
        `límite${enCalendario ? ', y el Calendario del portal trae ese mismo compromiso' : ''}; el CRM suma «Mis ` +
        'actividades» para las llamadas y reuniones de sus asegurados. Son vistas que vienen de fábrica en la ' +
        'edición gratuita, ya filtradas a su cuenta: no hay nada que configurar.',
      evidencia: [capTareas, capCalendario, capActividades],
    });
  } finally {
    await contexto.close();
  }
});

// ── A.3.4 ────────────────────────────────────────────────────────────────────
test('A.3.4 — Proyección de los movimientos comerciales', async ({ page }, info) => {
  // «Cargar oportunidades con monto y probabilidad, y comprobar si el sistema
  //  calcula un total proyectado por período»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-PROY-/);

  // Dos oportunidades con monto y probabilidad, cargadas desde el formulario
  const casos: [string, string, string][] = [['ACT-PROY-1', '10000', '50'], ['ACT-PROY-2', '20000', '25']];
  let probabilidadEnFormulario = true;
  let capFormulario = '';
  for (const [i, [titulo, monto, prob]] of casos.entries()) {
    await altaDeNegociacion(page);
    await panel(page).locator('input[name="TITLE"]').fill(titulo);
    await escribirEn(page, 'Monto y moneda', monto);
    const f = panel(page);
    const titulos = f.locator('.ui-entity-editor-block-title-text').filter({ hasText: /^Probabilidad$/ });
    if (!(await titulos.count())) {
      // El campo no está en el formulario: se agrega desde «Seleccionar campo»
      await f.getByText('Seleccionar campo').first().click();
      await page.waitForTimeout(1500);
      const opcion = f.getByLabel('Probabilidad', { exact: true });
      if (await opcion.count()) {
        await opcion.check({ force: true });
        await page.waitForTimeout(800);
        await f.locator('button.ui-btn-primary').filter({ hasText: /^\s*seleccionar\s*$/i }).filter({ visible: true }).first().click();
        await page.waitForTimeout(2000);
      }
    }
    if (await titulos.count()) await escribirEn(page, 'Probabilidad', prob);
    else probabilidadEnFormulario = false;
    if (i === 0) capFormulario = await capturar(page, 'A.3.4', plataforma, '1-formulario');
    await guardarFormulario(page);
    await cerrarPaneles(page);
  }
  const guardadas = await negociaciones(page, /^ACT-PROY-/, ['ID', 'TITLE', 'OPPORTUNITY', 'PROBABILITY']);
  console.log(`    probabilidad en formulario: ${probabilidadEnFormulario} · guardadas: ${JSON.stringify(guardadas.map(g => [g.TITLE, g.OPPORTUNITY, g.PROBABILITY]))}`);

  await menuLateral(page, 'CRM');
  await page.waitForTimeout(3000);
  const capListado = await capturar(page, 'A.3.4', plataforma, '2-listado');
  // El informe de tendencia de ventas, desde CRM › Analítica: el muro de pago se determina abriéndolo
  await menuLateral(page, 'CRM');
  await pestana(page, 'Analítica', 'Tendencia de ventas');
  await page.waitForTimeout(8000);
  const capInforme = await capturar(page, 'A.3.4', plataforma, '3-tendencia-de-ventas');
  const textoInforme = await textoDe(page);
  const pideBI = /BI Builder/.test(textoInforme) && /actualiza a cualquier plan/i.test(textoInforme);
  console.log(`    el informe pide otro plan: ${pideBI}`);
  await borrarNegociaciones(page, /^ACT-PROY-/);

  const cargadas = guardadas.map(g => [g.TITLE, Number(g.OPPORTUNITY), Number(g.PROBABILITY)]);
  expect(probabilidadEnFormulario, 'el formulario debe ofrecer el campo de probabilidad').toBeTruthy();
  expect(cargadas, 'las dos oportunidades deben quedar con su monto y su probabilidad').toEqual([
    ['ACT-PROY-1', 10000, 50], ['ACT-PROY-2', 20000, 25],
  ]);
  expect(pideBI, 'el informe de tendencia debe pedir el plan que habilita BI Builder').toBeTruthy();

  registrar({
    criterio: 'A.3.4',
    plataforma,
    cumple: 1,
    justificacion:
      'La negociación, que hace de oportunidad comercial, admite monto y probabilidad: el campo «Probabilidad» ' +
      'existe pero viene oculto, y se agrega al formulario una vez con «Seleccionar campo». Se cargaron dos ' +
      'oportunidades (10.000 con 50 % y 20.000 con 25 %) y quedaron guardadas. Lo que no hay en la edición ' +
      'gratuita es el total proyectado por período: el listado suma importes sin ponderarlos por la probabilidad, ' +
      'y el informe de tendencia de ventas, en Analítica, no se abre y ofrece en su lugar BI Builder, que exige ' +
      'actualizar el plan. La proyección se calcula fuera del sistema cada vez que se la necesita.',
    evidencia: [capFormulario, capListado, capInforme],
    medicion: `${cargadas.length} oportunidades con monto y probabilidad`,
  });
});
