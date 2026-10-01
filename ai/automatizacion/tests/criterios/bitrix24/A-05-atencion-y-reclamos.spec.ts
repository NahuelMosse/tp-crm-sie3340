import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { rest, textoDe, altaDeNegociacion, guardarFormulario, descartarAvisos, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import {
  altaDeContacto, llenarContacto, guardarContacto, contactos, borrarContactos, abrirContacto, borrarTareas, tareas, crearTareaPara,
} from '../../bitrix24/actividades';
import { productor, entrarComoProductor } from '../../bitrix24/escenario';

/**
 * A.5 — Atención y reclamos, sobre Bitrix24
 *
 * La edición gratuita no ofrece procesos inteligentes ni permite vincular una
 * tarea a un contacto («Tareas en CRM» pide el plan Basic), así que el reclamo
 * se lleva como una negociación con el asegurado como cliente.
 */

test.describe.configure({ mode: 'default' });

// ── A.5.1 ────────────────────────────────────────────────────────────────────
test('A.5.1 — Reclamo como caso con identidad propia', async ({ page }, info) => {
  // «Crear un reclamo asociado a un asegurado y comprobar que tiene número,
  //  listado y ficha propios»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-RECL-/);
  await borrarContactos(page, /^ACT-RECL-/);

  await altaDeContacto(page);
  await llenarContacto(page, 'ACT-RECL-Asegurado', 'Reclamante');
  await guardarContacto(page);
  await cerrarPaneles(page);

  // El reclamo se carga desde el formulario de negociaciones, con el asegurado como cliente
  await altaDeNegociacion(page);
  const f = panel(page);
  await f.locator('input[name="TITLE"]').fill('ACT-RECL-1 Choque con daños');
  const cliente = f.getByPlaceholder(/Nombre de contacto/).first();
  await cliente.click();
  await cliente.pressSequentially('ACT-RECL', { delay: 60 });
  await page.waitForTimeout(3000);
  await f.getByText(/ACT-RECL-Asegurado/).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  const capFormulario = await capturar(page, 'A.5.1', plataforma, '1-formulario');
  await guardarFormulario(page);
  const capFicha = await capturar(page, 'A.5.1', plataforma, '2-ficha');
  await cerrarPaneles(page);

  const [reclamo] = await negociaciones(page, /^ACT-RECL-1/, ['ID', 'TITLE', 'CONTACT_ID']);
  const [asegurado] = await contactos(page, /^ACT-RECL-/, ['ID', 'NAME', 'LAST_NAME']);
  console.log(`    reclamo #${reclamo?.ID} · contacto ${reclamo?.CONTACT_ID} (asegurado ${asegurado?.ID})`);

  await menuLateral(page, 'CRM');
  const capListado = await capturar(page, 'A.5.1', plataforma, '3-listado');

  // La vía que sugiere el modelo —una tarea vinculada al contacto— se prueba completando la operación
  await abrirContacto(page, 'ACT-RECL-Asegurado');
  await panel(page).getByText('Tarea', { exact: true }).first().click({ force: true });
  await page.waitForTimeout(5000);
  const textoTarea = await textoDe(page);
  const capTarea = await capturar(page, 'A.5.1', plataforma, '4-tarea-en-crm');
  const tareaPideBasic = /Tareas en CRM/.test(textoTarea) && /plan Basic/.test(textoTarea);
  console.log(`    tarea desde la ficha pide otro plan: ${tareaPideBasic}`);
  await cerrarPaneles(page);

  await borrarNegociaciones(page, /^ACT-RECL-/);
  await borrarContactos(page, /^ACT-RECL-/);

  expect(reclamo?.ID, 'el reclamo debe tener un número propio').toBeTruthy();
  expect(String(reclamo?.CONTACT_ID), 'el reclamo debe quedar asociado al asegurado').toBe(String(asegurado?.ID));
  expect(tareaPideBasic, 'la tarea desde la ficha del contacto debe pedir el plan que la habilita').toBeTruthy();

  registrar({
    criterio: 'A.5.1',
    plataforma,
    cumple: 1,
    justificacion:
      'La edición gratuita no tiene procesos inteligentes para crear una entidad Reclamo, y la alternativa que ' +
      'sugiere el modelo —una tarea vinculada al contacto— no está disponible: al pulsar «Tarea» en la ficha ' +
      'del asegurado el sistema informa que «Tareas en CRM» requiere al menos el plan Basic. El reclamo se lleva ' +
      'entonces como una negociación con el asegurado como cliente: recibe un número propio, abre su propia ficha ' +
      `y queda asociada al contacto (reclamo n.º ${reclamo?.ID}). No tiene listado propio: comparte el de las demás ` +
      'negociaciones —pólizas y oportunidades—, y hay que distinguirlo por el nombre o con un filtro en cada uso.',
    evidencia: [capFormulario, capFicha, capListado, capTarea],
    medicion: `reclamo n.º ${reclamo?.ID}`,
  });
});

// ── A.5.2 ────────────────────────────────────────────────────────────────────
test('A.5.2 — Estado y seguimiento del reclamo', async ({ page }, info) => {
  // «Cambiar el reclamo de estado y comprobar que el sistema conserva la
  //  secuencia de estados por los que pasó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-RECL-/);

  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill('ACT-RECL-2 Robo parcial');
  await guardarFormulario(page);
  const f = panel(page);
  const etapas = ['Crear documentos', 'Factura', 'En progreso'];
  for (const etapa of etapas) {
    await f.getByText(etapa, { exact: true }).filter({ visible: true }).first().click({ force: true });
    await page.waitForTimeout(4000);
    await descartarAvisos(page);
  }
  await f.getByText('Historial', { exact: true }).filter({ visible: true }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const capLinea = await capturar(page, 'A.5.2', plataforma, '2-linea-de-tiempo');
const cambiosEnLinea = await panel(page).getByText('Etapa cambiada').count();
  await cerrarPaneles(page);

  const [reclamo] = await negociaciones(page, /^ACT-RECL-2/, ['ID', 'TITLE', 'STAGE_ID']);
  let transiciones: string[] = [];
  try {
    const h = await rest<any>(page, 'crm.stagehistory.list', { entityTypeId: 2, filter: { OWNER_ID: reclamo.ID }, order: { ID: 'ASC' } });
    transiciones = (h.items ?? h).map((i: any) => i.STAGE_ID);
  } catch (e: any) { console.log('    stagehistory:', e.message.slice(0, 100)); }
  console.log(`    etapa final ${reclamo?.STAGE_ID} · transiciones ${transiciones.join(' > ')}`);
  await borrarNegociaciones(page, /^ACT-RECL-/);

  expect(transiciones, 'el sistema debe conservar la secuencia de etapas por las que pasó').toEqual(
    ['NEW', 'PREPARATION', 'PREPAYMENT_INVOICE', 'EXECUTING']);
  expect(cambiosEnLinea, 'la línea de tiempo debe mostrar cada cambio de etapa').toBe(3);

  registrar({
    criterio: 'A.5.2',
    plataforma,
    cumple: 1,
    justificacion:
      'Cada cambio de etapa de la negociación —que hace de reclamo— queda anotado en la línea de tiempo de su ficha ' +
      'como «Etapa cambiada», con la etapa anterior y la nueva, la hora y el usuario. Se pasó el reclamo por tres ' +
      'etapas y el sistema conservó las cuatro posiciones en orden, sin configurar nada. El reparo es que los ' +
      'estados no son propios del reclamo: son las etapas del embudo de ventas (En desarrollo, Crear documentos, ' +
      'Factura…), compartidas con las pólizas y las oportunidades, y la pestaña «Historial» de la ficha, que ' +
      'concentra el seguimiento, no se abre en la edición gratuita.',
    evidencia: [capLinea],
    medicion: `secuencia: ${transiciones.join(' > ')}`,
  });
});

// ── A.5.3 ────────────────────────────────────────────────────────────────────
test('A.5.3 — Responsable asignado a cada reclamo', async ({ page, browser }, info) => {
  // «Asignar el reclamo a un usuario y comprobar que aparece entre sus pendientes»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');
  await borrarNegociaciones(page, /^ACT-ASIG-/);
  // Preparación: el reclamo, a nombre del administrador
  await rest(page, 'crm.deal.add', { fields: { TITLE: 'ACT-ASIG-1 Reclamo por granizo', ASSIGNED_BY_ID: 1 } });

  // La asignación, por pantalla: se marca el reclamo en el listado y se cambia el responsable
  await menuLateral(page, 'CRM');
  await page.waitForTimeout(3000);
  const buscador = page.locator('input.main-ui-filter-search-filter').first();
  await buscador.click();
  await buscador.pressSequentially('ACT-ASIG-1', { delay: 60 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  await page.locator('tr').filter({ hasText: /ACT-ASIG-1/ }).locator('input[type="checkbox"]').first().click({ force: true });
  await page.locator('[data-name="group_action"]').first().click({ force: true });
  await page.waitForTimeout(1200);
  await page.locator('.menu-popup-item-text').filter({ hasText: 'Cambiar a la persona responsable' }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('.main-grid-panel-control-container button').filter({ hasText: /^Agregar$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('.popup-window').getByText('Gómez Productor').filter({ visible: true }).first().click();
  await page.waitForTimeout(1200);
  await page.locator('.main-grid-panel-control-container button').filter({ hasText: /^Aplicar$/ }).filter({ visible: true }).first().click({ force: true });
  await page.waitForTimeout(6000);
  const capAsignado = await capturar(page, 'A.5.3', plataforma, '1-asignado');

  const { contexto, pagina } = await entrarComoProductor(browser, gomez);
  try {
    await menuLateral(pagina, 'CRM');
    await pagina.waitForTimeout(5000);
    const capLista = await capturar(pagina, 'A.5.3', plataforma, '2-lista-del-productor');
    const figura = /ACT-ASIG-1/.test(await textoDe(pagina));
    console.log(`    el reclamo figura en el listado del productor: ${figura}`);
    await borrarNegociaciones(page, /^ACT-ASIG-/);
    expect(figura, 'el reclamo asignado debe figurar entre lo del productor').toBeTruthy();

    registrar({
      criterio: 'A.5.3',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'El responsable de un reclamo —la negociación del asegurado— se cambia en el listado, marcando el registro ' +
        'y eligiendo «Cambiar a la persona responsable». Con la sesión del productor, el reclamo asignado aparece ' +
        'en su listado de negociaciones, sin buscarlo. Los reclamos comparten ese listado con las pólizas y las ' +
        'oportunidades, y el usuario los distingue por el nombre: es una convención que se fija una vez.',
      evidencia: [capAsignado, capLista],
    });
  } finally {
    await contexto.close();
  }
});

// ── A.5.4 ────────────────────────────────────────────────────────────────────
test('A.5.4 — Base de conocimiento para la atención', async ({ page }, info) => {
  // «Crear un artículo con una condición de cobertura y recuperarlo mediante búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  const TITULO = 'ACT-Artículo de atención';
  const CONDICION = 'Cobertura de granizo en pólizas de automotor: el granizo está cubierto con cobertura todo riesgo';
  const accionesDe = (texto: string) => page.getByText(texto, { exact: true }).filter({ visible: true }).first()
    .locator('xpath=ancestor::div[.//*[contains(translate(text(),"ACIONES","aciones"),"acciones")]][1]')
    .getByText(/^\s*acciones\s*$/i).first();
  const opcion = (texto: string | RegExp) => page.locator('.menu-popup-item-text').filter({ hasText: texto }).filter({ visible: true }).first();
  const editor = () => page.frames().find(x => /landing_mode=edit/.test(x.url()))!;
  // El selector de bloques se dibuja en uno de los marcos de la ventana del editor
  const enAlgunMarco = async (buscar: (m: import('@playwright/test').Frame) => import('@playwright/test').Locator) => {
    for (let i = 0; i < 40; i++) {
      for (const m of page.frames()) {
        const l = buscar(m).filter({ visible: true });
        if (await l.count().catch(() => 0)) return m;
      }
      await page.waitForTimeout(1000);
    }
    throw new Error('no apareció el selector de bloques');
  };
  // La página tiene dos columnas: la barra lateral, compartida por toda la base, y el contenido de la página, a la derecha
  const masALaDerecha = async (l: import('@playwright/test').Locator) => {
    const todos = await l.filter({ visible: true }).all();
    let mejor = todos[0];
    let xMejor = -1;
    for (const c of todos) {
      const x = (await c.boundingBox().catch(() => null))?.x ?? -1;
      if (x > xMejor) { xMejor = x; mejor = c; }
    }
    return mejor;
  };
  const aLaLista = async () => {
    await menuLateral(page, 'Empleados');
    await pestana(page, /^Base de conocimientos$/);
    await page.waitForTimeout(5000);
  };
  const accionesDeLaBase = async (texto: string) => {
    await page.getByText(/^\s*acciones\s*$/i).filter({ visible: true }).first().click();
    await page.waitForTimeout(1500);
    await opcion(texto).click();
  };

  await entrar(page, plataforma);
  await aLaLista();
  // La edición gratuita admite una sola base: se usa la que haya
  expect(await page.getByText(/^\s*acciones\s*$/i).filter({ visible: true }).count(), 'debe haber una base de conocimientos').toBeGreaterThan(0);
  await accionesDeLaBase('Ver páginas');
  await page.waitForTimeout(8000);

  // Sin restos de otra corrida
  for (const restoDe of [TITULO, 'ACT-Cobertura de granizo', 'Página vacía']) {
    for (let i = 0; i < 30 && (await page.getByText(restoDe, { exact: true }).filter({ visible: true }).count()); i++) {
      await accionesDe(restoDe).click();
      await page.waitForTimeout(1500);
      await opcion('Eliminar página').click();
      await page.waitForTimeout(2500);
      await page.getByText('Continuar', { exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(6000);
    }
  }

  // Página nueva, en blanco
  await page.getByText('Nueva pagina', { exact: true }).filter({ visible: true }).last().click();
  await page.waitForTimeout(6000);
  await panel(page).getByText(/plantilla vac/i).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  await panel(page).getByText(/crear página/i).filter({ visible: true }).first().click();
  for (let i = 0; i < 90 && !editor(); i++) await page.waitForTimeout(1000);
  await page.waitForTimeout(15000);

  // Un bloque de texto simple, de los de «Texto»
  await (await masALaDerecha(editor().getByText(/agregar bloque/i))).click();
  await page.waitForTimeout(6000);
  const marcoDeBloques = await enAlgunMarco(m => m.getByText('Texto', { exact: true }));
  await marcoDeBloques.getByText('Texto', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
  const modelo = marcoDeBloques.locator('.landing-ui-card-block-preview-image-container').filter({ visible: true }).nth(2);
  await modelo.hover();
  await page.waitForTimeout(800);
  await modelo.click();
  await page.waitForTimeout(10000);

  // El texto de ejemplo se reemplaza por la condición: clic, seleccionar todo dentro del bloque y tipear
  const parrafo = await masALaDerecha(editor().locator('.landing-block-node-text').filter({ hasText: /Sed feugiat/ }));
  await parrafo.click();
  await page.waitForTimeout(2000);
  await page.keyboard.press('Control+a');
  await page.keyboard.type(CONDICION);
  await page.waitForTimeout(4000);
  const capEditor = await capturar(page, 'A.5.4', plataforma, '1-articulo-en-el-editor');
  console.log(`    texto del bloque: ${(await parrafo.innerText().catch(() => '')).slice(0, 120)}`);

  // Salir del editor con el ícono de inicio: el sistema guarda al editar
  await page.mouse.move(25, 34);
  await page.mouse.click(25, 34);
  await page.waitForTimeout(10000);

  // El nombre del artículo, en la configuración de la página
  await aLaLista();
  await accionesDeLaBase('Ver páginas');
  await page.waitForTimeout(8000);
  await accionesDe('Página vacía').click();
  await page.waitForTimeout(1500);
  await opcion('Configuración de la página').click();
  await page.waitForTimeout(12000);
  await panel(page).getByText('Página vacía', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1000);
  const campoNombre = panel(page).locator('input.landing-editable-field-input-js').filter({ visible: true }).first();
  await campoNombre.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(TITULO);
  await page.waitForTimeout(1500);
  await panel(page).getByText('Guardar', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(8000);
  await cerrarPaneles(page);
  await page.waitForTimeout(3000);

  // El artículo, abierto desde la lista de páginas
  await aLaLista();
  await accionesDeLaBase('Ver páginas');
  await page.waitForTimeout(8000);
  await accionesDe(TITULO).click();
  await page.waitForTimeout(1500);
  await opcion('Página abierta').click();
  await page.waitForTimeout(12000);
  const capArticulo = await capturar(page, 'A.5.4', plataforma, '2-articulo-publicado');
  const articuloMuestra = /granizo/.test(await textoDe(page));
  console.log(`    el artículo publicado muestra la condición: ${articuloMuestra}`);
  await cerrarPaneles(page);

  // La búsqueda, en la base publicada
  await aLaLista();
  await accionesDeLaBase('Ir a la base de conocimientos');
  await page.waitForTimeout(12000);
  console.log('    marcos tras abrir la base:', page.frames().map(x => x.url().slice(0, 90)).join(' ; '));
  const capBase = await capturar(page, 'A.5.4', plataforma, '3-base-publicada');
  let campo = null;
  for (const m of page.frames().filter(x => x.url().includes('/knowledge/'))) {
    const c = m.locator('input[name="q"]').filter({ visible: true }).first();
    if (await c.count().catch(() => 0)) { campo = c; break; }
  }
  console.log(`    buscador encontrado: ${!!campo}`);
  let encontrado = false;
  let textoResultado = '';
  if (campo) {
    await campo.click();
    await page.keyboard.type('granizo');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(12000);
    textoResultado = await textoDe(page);
    encontrado = textoResultado.includes(TITULO);
  }
  console.log(`    la búsqueda de «granizo» devuelve el artículo: ${encontrado}`);
  const capBusqueda = await capturar(page, 'A.5.4', plataforma, '4-busqueda');
  console.log('    texto tras buscar:', textoResultado.split('\n').filter(Boolean).slice(-25).join(' | ').slice(0, 500));
  await cerrarPaneles(page);

  expect(articuloMuestra, 'el artículo publicado debe mostrar la condición').toBeTruthy();
  expect(encontrado, 'la búsqueda debe devolver el artículo').toBeTruthy();

  registrar({
    criterio: 'A.5.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Se creó el artículo desde «Empleados › Base de conocimientos»: una página en blanco con un bloque de texto, ' +
      'cuyo texto de ejemplo se reemplazó por la condición de cobertura de granizo, y se la buscó por «granizo» ' +
      'en la base publicada, que la devolvió. La base se arma una vez con una plantilla (la edición gratuita admite una sola).',
    evidencia: [capEditor, capArticulo, capBase, capBusqueda],
  });
});

// ── A.5.5 ────────────────────────────────────────────────────────────────────
test('A.5.5 — Tareas asignables con responsable y vencimiento', async ({ page, browser }, info) => {
  // «Crear una tarea, asignarla a otro usuario con fecha de vencimiento y verificarla desde la cuenta de ese usuario»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');
  await borrarTareas(page, /^ACT-TAREA-/);
  await crearTareaPara(page, 'ACT-TAREA-1 Revisar cobertura del asegurado', 'Gómez Productor');
  const capCreada = await capturar(page, 'A.5.5', plataforma, '1-tarea-creada');

  const { contexto, pagina } = await entrarComoProductor(browser, gomez);
  try {
    await menuLateral(pagina, 'Tareas');
    await pagina.waitForTimeout(5000);
    const capDelProductor = await capturar(pagina, 'A.5.5', plataforma, '2-tareas-del-productor');
    const figura = /ACT-TAREA-1/.test(await textoDe(pagina));
    console.log(`    la tarea figura en las tareas del productor: ${figura}`);
    const [tarea] = await tareas(page, /^ACT-TAREA-1/);
    console.log(`    responsable: ${tarea?.responsibleId ?? tarea?.RESPONSIBLE_ID} · vencimiento: ${tarea?.deadline ?? tarea?.DEADLINE}`);
    await borrarTareas(page, /^ACT-TAREA-/);
    expect(figura, 'la tarea asignada debe figurar en las tareas del productor').toBeTruthy();
    expect(String(tarea?.responsibleId ?? tarea?.RESPONSIBLE_ID), 'la tarea debe quedar asignada al productor').toBe(String(gomez.id));
    expect(tarea?.deadline ?? tarea?.DEADLINE, 'la tarea debe llevar vencimiento').toBeTruthy();

    registrar({
      criterio: 'A.5.5',
      plataforma,
      cumple: 2,
      costo: 0,
      justificacion:
        '«Tareas › Crear» abre un formulario con título, responsable y fecha límite: se eligió al productor en el ' +
        'selector de responsable y el formulario ya propone un vencimiento. Con la sesión del productor, la tarea ' +
        'figura en «Mis tareas» con su fecha límite. Viene de fábrica en la edición gratuita, sin configurar nada.',
      evidencia: [capCreada, capDelProductor],
    });
  } finally {
    await contexto.close();
  }
});

// ── A.5.6 ────────────────────────────────────────────────────────────────────
test('A.5.6 — Aviso al usuario al que se le asigna una tarea', async ({ page, browser }, info) => {
  // «Comprobar si el usuario asignado recibe una notificación sin tener que consultar el listado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');
  await borrarTareas(page, /^ACT-AVISO-/);
  await crearTareaPara(page, 'ACT-AVISO-1 Llamar por el reclamo abierto', 'Gómez Productor');

  const { contexto, pagina } = await entrarComoProductor(browser, gomez);
  try {
    // Sin abrir «Tareas»: la campana de notificaciones de la barra superior
    await pagina.waitForTimeout(4000);
    await pestana(pagina, /^\s*Notificaciones\s*\d*\s*$/);
    await pagina.waitForTimeout(5000);
    const capCampana = await capturar(pagina, 'A.5.6', plataforma, '1-notificaciones');
    const aviso = /ACT-AVISO-1/.test(await textoDe(pagina));
    console.log(`    aviso de la tarea en las notificaciones del productor: ${aviso}`);
    await borrarTareas(page, /^ACT-AVISO-/);
    expect(aviso, 'el productor debe recibir el aviso de la tarea en sus notificaciones').toBeTruthy();

    registrar({
      criterio: 'A.5.6',
      plataforma,
      cumple: 2,
      costo: 0,
      justificacion:
        'Al asignarle una tarea, el productor la recibe como notificación en la campana de la barra superior del ' +
        'portal, con el título de la tarea y quién se la asignó, sin que tenga que abrir el listado de tareas. ' +
        'Viene activado de fábrica en la edición gratuita.',
      evidencia: [capCampana],
    });
  } finally {
    await contexto.close();
  }
});
