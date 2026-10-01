import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  objeto, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, modeloDe, elegirEnFicha, clicReal, esperarCarga,
  textoDe, entrarComo, buscarEnTodo, nuevoRegistro, escribirEnFicha, valorEnFicha, fechaHoraEnFicha,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirObjeto, agregarPaso, abrirVariables, elegirVariable, botonDelFlujo,
  filtroIgualA, ETIQUETA_OBJETO,
} from '../../twenty/flujos';
import { cargarCartera, alistarReclamo, PRODUCTOR, ESTADOS_RECLAMO, campoDeTexto } from '../../twenty/escenario';
import { recibidos, vaciarCasillas } from '../../correo';
import { EMAIL, PASS } from '../../twenty/helper';

/**
 * A.5 — Atención al asegurado y reclamos, sobre Twenty
 *
 * Twenty no trae un objeto de casos: el reclamo es un objeto propio con su
 * estado, su plazo, su asegurado y su responsable (ver alistarReclamo).
 */

test.describe.configure({ mode: 'serial' });

const RECLAMO = 'Choque en estacionamiento';

/** El historial de un registro: cuántas entradas registran un cambio del campo. */
async function cambiosEnHistorial(api: any, objeto: string, id: string, campo: string) {
  const historial = await registros(api, 'timelineActivities', `target${objeto}Id[eq]:${id}`);
  return historial.filter(h => JSON.stringify(h.properties?.diff ?? {}).includes(`"${campo}"`));
}

// ── A.5.1 ────────────────────────────────────────────────────────────────────
test('A.5.1 — Reclamo como caso con identidad propia', async ({ page, browser }, info) => {
  // «Crear un reclamo asociado a un asegurado y comprobar que tiene número,
  //  listado y ficha propios»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await alistarReclamo(e.api);
  for (const r of (await registros(e.api, 'reclamos')).filter(r => r.name === RECLAMO || !r.name)) await borrarRegistro(e.api, 'reclamos', r.id);

  // Desde la ficha del asegurado: el campo de sus reclamos abre un buscador
  // que da de alta uno nuevo con el nombre escrito, ya ligado a él
  const asegurado = e.asegurados[2];
  await abrirFicha(page, 'person', asegurado);
  await clicReal(page, valorEnFicha(page, 'reclamos'));
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  await buscar.waitFor({ state: 'visible', timeout: 15_000 });
  await page.keyboard.type(RECLAMO, { delay: 60 });
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(/^Agregar nuevo|^Add new/).filter({ visible: true }).last());
  let reclamo: any;
  for (let i = 0; i < 10 && !reclamo; i++) {
    await page.waitForTimeout(1500);
    reclamo = (await registros(e.api, 'reclamos')).find(r => r.aseguradoId === asegurado && r.name === RECLAMO);
  }
  expect(reclamo, 'el reclamo debe crearse ya ligado al asegurado').toBeTruthy();
  await abrirFicha(page, 'reclamo', reclamo.id);
  const capFicha = await capturar(page, 'A.5.1', plataforma, '1-ficha-del-reclamo');
  await abrirListado(page, 'reclamos');
  const capListado = await capturar(page, 'A.5.1', plataforma, '2-listado');

  // El número: ningún tipo de campo se numera solo
  await modeloDe(page, 'reclamos');
  await clicReal(page, page.getByRole('button', { name: /Nuevo Campo|New Field/ }).first());
  await esperarCarga(page, 3000);
  const tipos = await textoDe(page);
  const capTipos = await capturar(page, 'A.5.1', plataforma, '3-tipos-de-campo');
  expect(tipos, 'si hubiera un campo que se numera solo, este veredicto no corresponde')
    .not.toMatch(/Auto.?number|Autoincrement|Secuencia|Sequence|Numeración/i);

  registrar({
    criterio: 'A.5.1',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Twenty no trae un objeto de reclamos o casos: se definió como objeto propio, con estado, plazo de ' +
      'resolución, asegurado y responsable. Así tiene listado y ficha propios, y se crea desde el campo de ' +
      'reclamos de la ficha del asegurado, ya ligado a él. Pero no tiene número: ningún tipo de campo se ' +
      'numera solo, y el identificador interno no sirve para dictárselo a un asegurado. El número hay que ' +
      'asignarlo a mano en cada alta, o desarrollarlo.',
    evidencia: [capFicha, capListado, capTipos],
  });
});

// ── A.5.2 ────────────────────────────────────────────────────────────────────
test('A.5.2 — Estado y seguimiento del reclamo', async ({ page, browser }, info) => {
  // «Cambiar el reclamo de estado y comprobar que el sistema conserva la
  //  secuencia de estados por los que pasó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(2_700_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const reclamo = (await registros(e.api, 'reclamos')).find(r => r.name === RECLAMO);
  expect(reclamo, 'A.5.1 debe haber dejado el reclamo').toBeTruthy();
  const estado = (await objeto(e.api, 'reclamo')).fields.find((c: any) => c.name === 'estado');

  // Los cambios que la misma persona hace sobre un registro dentro de los diez
  // minutos se funden en una sola entrada del historial, con el primer valor y
  // el último. Se espacian once minutos, como en la atención real
  await abrirFicha(page, 'reclamo', reclamo.id);
  for (const [i, nuevo] of ESTADOS_RECLAMO.slice(1).entries()) {
    if (i > 0) {
      await page.waitForTimeout(660_000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="record-fields-widget"]').first().waitFor({ state: 'visible', timeout: 40_000 });
      await page.waitForTimeout(1500);
    }
    await elegirEnFicha(page, 'estado', nuevo);
  }
  await page.waitForTimeout(5000);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="record-fields-widget"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(3000);
  const capHistorial = await capturar(page, 'A.5.2', plataforma, '1-historial-de-estados');

  const cambios = await cambiosEnHistorial(e.api, 'Reclamo', reclamo.id, 'estado');
  const secuencia = cambios.sort((a, b) => a.happensAt.localeCompare(b.happensAt))
    .map(c => c.properties.diff.estado?.after).filter(Boolean);
  const etiqueta = (v: string) => estado.options.find((o: any) => o.value === v)?.label ?? v;

  expect(secuencia.length, 'cada cambio de estado debe quedar en el historial').toBeGreaterThanOrEqual(ESTADOS_RECLAMO.length - 1);

  registrar({
    criterio: 'A.5.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El estado del reclamo es un campo de lista del objeto propio, con los estados que define la compañía. ' +
      'Se lo cambió tres veces desde la ficha y el historial del reclamo conserva la secuencia, con quién hizo ' +
      `cada cambio y cuándo: ${secuencia.map(etiqueta).join(' → ')}. Los cambios que la misma persona hace ` +
      'sobre el mismo reclamo dentro de los diez minutos se funden en una sola entrada, que muestra el estado ' +
      'de partida y el último: un estado intermedio que dura menos que eso no queda registrado. Con el ritmo ' +
      'de un reclamo, que cambia de estado en días, cada paso queda por separado. Definir el estado es trabajo ' +
      'de una sola vez.',
    evidencia: [capHistorial],
    medicion: `${secuencia.length} cambios de estado en el historial`,
  });
});

// ── A.5.3 ────────────────────────────────────────────────────────────────────
test('A.5.3 — Responsable asignado a cada reclamo', async ({ page, browser }, info) => {
  // «Asignar el reclamo a un usuario y comprobar que aparece entre sus
  //  pendientes»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const reclamo = (await registros(e.api, 'reclamos')).find(r => r.name === RECLAMO);
  await e.api.patch(`reclamos/${reclamo.id}`, { data: { responsableId: null } });
  await abrirFicha(page, 'reclamo', reclamo.id);
  await elegirEnFicha(page, 'responsable', `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`);
  const capAsignado = await capturar(page, 'A.5.3', plataforma, '1-reclamo-asignado');

  // El productor entra y filtra los reclamos por los que tiene a su cargo
  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  await abrirListado(page, 'reclamos');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Responsable', { exact: true }).last());
  const yo = page.getByText(/^Me$|^Yo$|^Tú$/).filter({ visible: true }).last();
  await clicReal(page, (await yo.isVisible().catch(() => false)) ? yo
    : page.getByText(`${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`, { exact: true }).last());
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  const pendientes = await textoDe(page);
  const capPendientes = await capturar(page, 'A.5.3', plataforma, '2-reclamos-del-productor');

  const guardado = (await registros(e.api, 'reclamos')).find(r => r.id === reclamo.id);
  expect(guardado.responsableId, 'el reclamo debe quedar asignado').toBe(e.productor);
  expect(pendientes, 'el productor debe verlo entre sus reclamos').toContain(RECLAMO);

  registrar({
    criterio: 'A.5.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El reclamo tiene un responsable, que es una relación con los usuarios del objeto propio. Se lo asignó ' +
      'al productor desde la ficha; al ingresar con su cuenta y filtrar los reclamos por los que tiene a su ' +
      'cargo, figura entre sus pendientes. Ese filtro se guarda como una vista para no rehacerlo. Definir el ' +
      'responsable es trabajo de una sola vez.',
    evidencia: [capAsignado, capPendientes],
  });
});

// ── A.5.4 ────────────────────────────────────────────────────────────────────
test('A.5.4 — Base de conocimiento para la atención', async ({ page, browser }, info) => {
  // «Crear un artículo con una condición de cobertura y recuperarlo mediante
  //  búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  // No hay base de conocimiento: el artículo es un objeto propio con su texto
  if (!(await objeto(e.api, 'articulo'))) {
    const r = await e.api.post('metadata/objects', { data: {
      nameSingular: 'articulo', namePlural: 'articulos', labelSingular: 'Artículo', labelPlural: 'Artículos',
      description: 'Condiciones de cobertura para la atención', icon: 'IconBook',
    } });
    expect(r.ok(), 'el objeto Artículo debe crearse').toBeTruthy();
  }
  await campoDeTexto(e.api, 'articulo', 'condicion', 'Condición de cobertura');
  const TITULO = 'Granizo en automotor';
  for (const a of (await registros(e.api, 'articulos')).filter(a => a.name === TITULO)) await borrarRegistro(e.api, 'articulos', a.id);

  const id = await nuevoRegistro(page, 'articulos', 'Artículo', TITULO);
  await abrirFicha(page, 'articulo', id);
  await escribirEnFicha(page, 'condicion', 'La póliza todo riesgo cubre el granizo con franquicia; la de terceros completo no.');
  const capArticulo = await capturar(page, 'A.5.4', plataforma, '1-articulo');

  const porTitulo = await buscarEnTodo(page, 'Granizo');
  const capBusqueda = await capturar(page, 'A.5.4', plataforma, '2-busqueda');
  await page.keyboard.press('Escape');
  const porContenido = await buscarEnTodo(page, 'franquicia');
  await page.keyboard.press('Escape');
  const encuentraContenido = porContenido.includes(TITULO);

  expect(porTitulo, 'la búsqueda debe recuperar el artículo').toContain(TITULO);

  registrar({
    criterio: 'A.5.4',
    plataforma,
    cumple: encuentraContenido ? 2 : 1,
    costo: encuentraContenido ? 1 : 2,
    justificacion:
      'Twenty no trae una base de conocimiento: el artículo se definió como un objeto propio, con su título y ' +
      'la condición de cobertura. Se cargó uno sobre el granizo en automotor y la búsqueda general lo encontró ' +
      'por su título. ' + (encuentraContenido
        ? 'También lo encontró por una palabra del texto de la condición. Definir el objeto es trabajo de una sola vez.'
        : 'No lo encontró por una palabra del texto de la condición: la búsqueda solo mira el título, así que ' +
          'quien atiende tiene que adivinar cómo se tituló cada artículo.'),
    evidencia: [capArticulo, capBusqueda],
  });
});

// ── A.5.5 ────────────────────────────────────────────────────────────────────
test('A.5.5 — Tareas asignables con responsable y vencimiento', async ({ page, browser }, info) => {
  // «Crear una tarea, asignarla a otro usuario con fecha de vencimiento y
  //  verificarla desde la cuenta de ese usuario»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const TAREA = 'Pedir las fotos del siniestro';
  for (const t of (await registros(e.api, 'tasks')).filter(t => t.title === TAREA)) await borrarRegistro(e.api, 'tasks', t.id);

  const id = await nuevoRegistro(page, 'tasks', 'Task', TAREA);
  await abrirFicha(page, 'task', id);
  await elegirEnFicha(page, 'assignee', `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`);
  const vence = new Date(Date.now() + 2 * 86_400_000);
  vence.setHours(10, 0, 0, 0);
  await fechaHoraEnFicha(page, 'dueAt', vence);
  const capTarea = await capturar(page, 'A.5.5', plataforma, '1-tarea-asignada');

  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  await abrirListado(page, 'tasks');
  await clicReal(page, page.getByText(/^All Tasks$|^By Status$|^Assigned to Me$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText('Assigned to Me', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(4000);
  const vista = await textoDe(page);
  const capPropia = await capturar(page, 'A.5.5', plataforma, '2-desde-la-cuenta-del-productor');

  const guardada = (await registros(e.api, 'tasks')).find(t => t.id === id);
  expect(guardada.assigneeId, 'la tarea debe quedar asignada al productor').toBe(e.productor);
  expect(guardada.dueAt, 'la tarea debe tener vencimiento').toBeTruthy();
  expect(vista, 'el productor debe verla entre las suyas').toContain(TAREA);

  registrar({
    criterio: 'A.5.5',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Las tareas vienen de fábrica con responsable y vencimiento. Se creó una desde el listado, se la asignó ' +
      'al productor y se le puso fecha y hora de vencimiento desde su ficha. Al ingresar con la cuenta del ' +
      'productor, figura en la vista de las tareas asignadas a él, con su vencimiento. Viene listo.',
    evidencia: [capTarea, capPropia],
  });
});

// ── A.5.6 ────────────────────────────────────────────────────────────────────
test('A.5.6 — Aviso al usuario al que se le asigna una tarea', async ({ page, browser }, info) => {
  // «Comprobar si el usuario asignado recibe una notificación sin tener que
  //  consultar el listado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await vaciarCasillas();
  const FLUJO = 'Aviso de tarea asignada';
  const TAREA = 'Llamar al perito por el siniestro';
  for (const w of (await registros(e.api, 'workflows')).filter(w => w.name === FLUJO)) await borrarRegistro(e.api, 'workflows', w.id);
  for (const t of (await registros(e.api, 'tasks')).filter(t => t.title === TAREA)) await borrarRegistro(e.api, 'tasks', t.id);

  // Sin flujo: el producto no avisa nada. La interfaz no tiene un centro de avisos
  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  const sinAvisos = !(await page.getByRole('button', { name: /notific|avisos/i }).first().isVisible().catch(() => false));
  const capSinAviso = await capturar(page, 'A.5.6', plataforma, '1-sin-centro-de-avisos');
  await entrarComo(page, EMAIL, PASS);

  // El aviso se arma con un flujo: cuando a una tarea se le pone responsable,
  // buscarlo y mandarle un correo desde la casilla comercial
  await nuevoFlujo(page, FLUJO);
  await ponerDisparador(page, 'Record is updated', ETIQUETA_OBJETO);
  await elegirObjeto(page, 'Tasks');
  await clicReal(page, page.getByText(/^Campos \(opcional\)$|^Fields \(optional\)$/).last()
    .locator('xpath=following::*[normalize-space(text())="Editar" or normalize-space(text())="Edit"][1]'));
  await clicReal(page, page.getByText('Assignee', { exact: true }).filter({ visible: true }).last());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await agregarPaso(page, 'Search Records');
  await elegirObjeto(page, 'Workspace Members');
  // Con el disparador como único paso anterior, el menú de variables abre directo sus campos
  await filtroIgualA(page, 'Id', ['Assignee Id']);
  await agregarPaso(page, 'Send Email');
  await abrirVariables(page, 'Para');
  await elegirVariable(page, 'Search Records', /^First Workspace Member$/, /User Email/);
  const asunto = page.getByText('Asunto', { exact: true }).last();
  await clicReal(page, asunto.locator('xpath=following::*[@contenteditable="true"][1]'));
  await page.keyboard.type('Tarea nueva: ', { delay: 40 });
  await abrirVariables(page, 'Asunto');
  await elegirVariable(page, 'Record is updated', 'Title');
  await page.keyboard.press('Escape');
  const capFlujo = await capturar(page, 'A.5.6', plataforma, '2-flujo-del-aviso');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  // Desde la pantalla: la tarea nueva y su responsable
  const id = await nuevoRegistro(page, 'tasks', 'Task', TAREA);
  await abrirFicha(page, 'task', id);
  await elegirEnFicha(page, 'assignee', `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`);
  const capAsignada = await capturar(page, 'A.5.6', plataforma, '3-tarea-asignada');
  let aviso: any;
  for (let espera = 0; espera < 24 && !aviso; espera++) {
    await page.waitForTimeout(5000);
    aviso = (await recibidos(PRODUCTOR.email)).find(m => m.subject.includes(TAREA));
  }

  expect(sinAvisos, 'si hubiera un centro de avisos, este veredicto no corresponde').toBeTruthy();
  expect(aviso, 'el productor debe recibir el aviso por correo').toBeTruthy();

  registrar({
    criterio: 'A.5.6',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Twenty no avisa por su cuenta: la interfaz no tiene un centro de notificaciones y asignar una tarea no ' +
      'le manda nada al responsable. El aviso se armó con un flujo de trabajo, sin escribir código: cuando a una ' +
      'tarea se le pone responsable, lo busca y le envía un correo desde la casilla de la compañía. Se creó una ' +
      `tarea desde el listado, se la asignó al productor en su ficha, y le llegó el correo «${aviso?.subject}» sin ` +
      'que tuviera que abrir el listado. Armar el flujo es trabajo de una sola vez.',
    evidencia: [capSinAviso, capFlujo, capAsignada],
  });
});
