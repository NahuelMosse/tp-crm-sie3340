import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  objeto, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, modeloDe, elegirEnFicha, clicReal, esperarCarga,
  textoDe, entrarComo, buscarEnTodo, nuevoRegistro, escribirEnFicha, valorEnFicha, fechaHoraEnFicha,
  nuevoCampo, conOpciones, quitarCampo, fechaEnFicha,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirObjeto, agregarPaso, abrirVariables, elegirVariable, botonDelFlujo,
  filtroIgualA, ETIQUETA_OBJETO,
} from '../../twenty/flujos';
import { cargarCartera, alistarReclamo, relacion, PRODUCTOR, ESTADOS_RECLAMO, campoDeTexto } from '../../twenty/escenario';
import { recibidos, vaciarCasillas } from '../../correo';
import { EMAIL, PASS } from '../../twenty/helper';
import { ASEGURADOS } from '../../datos';

/**
 * A.5 — Atención al asegurado y reclamos, sobre Twenty
 *
 * Twenty no trae un objeto de casos: el reclamo es un objeto propio con su
 * estado, su plazo, su asegurado y su responsable (ver alistarReclamo).
 */

test.describe.configure({ mode: 'serial' });

const RECLAMO = 'Choque en estacionamiento';
const ASEGURADO_NOMBRE = ASEGURADOS[0].firstName;

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
    reparo: 'manual',
    costo: 2,
    resumen:
      'El reclamo tiene listado y ficha propios, con estado, plazo, asegurado y responsable, pero no ' +
      'recibe número automático: quien lo carga tiene que asignarlo a mano en cada alta.',
    comoLoHace:
      'Twenty no trae un objeto de reclamos o casos: se define como objeto propio, con estado, plazo ' +
      'de resolución, asegurado y responsable.',
    caracteristicas:
      'Así tiene listado y ficha propios, y se crea desde el campo de reclamos de la ficha del ' +
      'asegurado, ya ligado a él. Pero no tiene número: ningún tipo de campo se numera solo, y el ' +
      'identificador interno no sirve para dictárselo a un asegurado.',
    justificacion:
      'El número hay que asignarlo a mano en cada alta, o desarrollarlo.',
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
    resumen:
      'El estado es un campo de lista que define la compañía; el historial registra los ' +
      'cambios con autor y fecha.',
    comoLoHace:
      'El estado se cambia desde la ficha y el historial del reclamo conserva la secuencia de estados, ' +
      'con quién hizo cada cambio y cuándo.',
    caracteristicas:
      'El estado del reclamo es un campo de lista del objeto propio, con los estados que define la ' +
      'compañía. Los cambios que la misma persona hace sobre el mismo reclamo dentro de los diez ' +
      'minutos se funden en una sola entrada, que muestra el estado de partida y el último: un estado ' +
      'intermedio que dura menos que eso no queda registrado.',
    justificacion:
      'Con el ritmo de un reclamo, que cambia de estado en días, cada paso queda por separado. Definir ' +
      'el estado es trabajo de una sola vez.',
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
    resumen:
      'Cada reclamo tiene un responsable, relación con los usuarios, y cada productor filtra ' +
      'los que tiene a cargo; el filtro se guarda como vista.',
    comoLoHace:
      'El reclamo se asigna al productor desde la ficha; al ingresar con su cuenta y filtrar los ' +
      'reclamos por los que tiene a su cargo, figura entre sus pendientes.',
    caracteristicas:
      'El reclamo tiene un responsable, que es una relación con los usuarios del objeto propio. Ese ' +
      'filtro se guarda como una vista para no rehacerlo.',
    justificacion:
      'Definir el responsable es trabajo de una sola vez.',
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
    resumen: encuentraContenido
      ? 'No trae base de conocimiento: se define un objeto propio, que la búsqueda general ' +
        'encuentra por título y por palabras del texto.'
      : 'No trae base de conocimiento: se define un objeto propio, que la búsqueda general ' +
        'encuentra solo por el título, no por su contenido.',
    comoLoHace:
      'Twenty no trae una base de conocimiento: el artículo se define como un objeto propio, con su ' +
      'título y la condición de cobertura. Al cargar un artículo, la búsqueda general lo encuentra por ' +
      'su título.',
    caracteristicas: encuentraContenido
      ? 'También lo encontró por una palabra del texto de la condición.'
      : 'No lo encontró por una palabra del texto de la condición.',
    justificacion: encuentraContenido
      ? 'Definir el objeto es trabajo de una sola vez.'
      : 'La búsqueda solo mira el título, así que ' +
        'quien atiende tiene que adivinar cómo se tituló cada artículo.',
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
    resumen:
      'Las tareas vienen de fábrica con responsable y fecha y hora de vencimiento, y cada ' +
      'usuario ve en una vista las que tiene asignadas.',
    comoLoHace:
      'La tarea se crea desde el listado, se asigna al productor y se le pone fecha y hora de ' +
      'vencimiento desde su ficha. Al ingresar con la cuenta del productor, figura en la vista de las ' +
      'tareas asignadas a él, con su vencimiento.',
    caracteristicas:
      'Las tareas vienen de fábrica con responsable y vencimiento.',
    justificacion:
      'Viene listo.',
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
    resumen:
      'No avisa por sí mismo al asignar una tarea, porque no tiene centro de notificaciones; ' +
      'una automatización envía al responsable un correo desde la casilla de la compañía.',
    comoLoHace:
      'El aviso se arma con un flujo de trabajo, sin escribir código: cuando a una tarea se le pone ' +
      'responsable, lo busca y le envía un correo desde la casilla de la compañía. Se crea la tarea ' +
      'desde el listado, se la asigna al productor en su ficha, y el correo le llega sin que tenga que ' +
      'abrir el listado.',
    caracteristicas:
      'Twenty no avisa por su cuenta: la interfaz no tiene un centro de notificaciones y asignar una ' +
      'tarea no le manda nada al responsable.',
    justificacion:
      'Armar el flujo es trabajo de una sola vez.',
    evidencia: [capSinAviso, capFlujo, capAsignada],
  });
});

// ── A.5.7 ────────────────────────────────────────────────────────────────────
test('A.5.7 — Registro de reclamos con los datos que exige la Superintendencia', async ({ page, browser }, info) => {
  // «Cargar un reclamo y comprobar que recibe un número de orden correlativo y que registra fecha,
  //  datos del reclamante, carácter del reclamante, ramo, póliza, motivo y resolución final;
  //  después, obtener los reclamos que llevan más de diez días hábiles sin resolver»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  const PREFIJO = 'A57 ';
  const hoy = new Date();
  const hace = (d: number) => new Date(hoy.getTime() - d * 86_400_000);
  const iso = (f: Date) => f.toLocaleDateString('sv-SE');
  const dmy = (f: Date) => f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const sumarHabiles = (f: Date, n: number) => {
    const d = new Date(f);
    for (let i = 0; i < n;) { d.setDate(d.getDate() + 1); if (![0, 6].includes(d.getDay())) i++; }
    return d;
  };

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await alistarReclamo(e.api);
  for (const r of (await registros(e.api, 'reclamos')).filter(r => r.name?.startsWith(PREFIJO))) await borrarRegistro(e.api, 'reclamos', r.id);

  // Los datos que la normativa pide y el reclamo no trae se agregan como campos: configuración de una vez
  const CAMPOS: [string, string, (p: Page) => Promise<void>][] = [
    ['Number', 'Número de orden', async () => {}],
    ['Date', 'Fecha del reclamo', async () => {}],
    ['Select', 'Carácter del reclamante', conOpciones(['Asegurado', 'Tomador', 'Beneficiario', 'Tercero damnificado'])],
    ['Select', 'Ramo del reclamo', conOpciones(['Automotor', 'Hogar', 'Vida', 'Salud'])],
    ['Select', 'Motivo del reclamo', conOpciones(['Demora en el pago de un siniestro', 'Rechazo de cobertura', 'Cobro indebido de prima'])],
    ['Text', 'Resolución final', async () => {}],
  ];
  for (const [tipo, nombre, cfg] of CAMPOS) {
    if (!process.env.A57_RAPIDO) await quitarCampo(e.api, 'reclamo', nombre);
    if (!(await objeto(e.api, 'reclamo')).fields.some((c: any) => c.label === nombre)) await nuevoCampo(page, 'reclamos', tipo, nombre, cfg);
  }
  await relacion(e.api, 'reclamo', 'poliza', 'Póliza', 'poliza', 'Reclamos');
  const campos = (await objeto(e.api, 'reclamo')).fields;
  const nombreDe = (etiqueta: string) => campos.find((c: any) => c.label === etiqueta).name;
  const valorDe = (etiqueta: string, opcion: string) => campos.find((c: any) => c.label === etiqueta).options.find((o: any) => o.label === opcion).value;
  const F = { orden: nombreDe('Número de orden'), fecha: nombreDe('Fecha del reclamo'), caracter: nombreDe('Carácter del reclamante'),
    ramo: nombreDe('Ramo del reclamo'), motivo: nombreDe('Motivo del reclamo'), resolucion: nombreDe('Resolución final') };

  // Reclamos ya cargados: uno vencido sin resolver, uno vencido ya resuelto y uno reciente
  const asegurado = e.asegurados[0];
  const sembrar = (nombre: string, dias: number, estado: string, orden: number) => crearRegistro(e.api, 'reclamos', {
    name: PREFIJO + nombre, [F.orden]: orden, [F.fecha]: iso(hace(dias)), plazoDeResolucion: iso(sumarHabiles(hace(dias), 10)),
    estado: valorDe('Estado', estado), aseguradoId: asegurado, polizaId: e.polizas[0].id,
  });
  await sembrar('vencido sin resolver', 30, 'En curso', 1);
  await sembrar('vencido resuelto', 30, 'Resuelto', 2);
  await sembrar('reciente sin resolver', 3, 'Nuevo', 3);

  // El reclamo nuevo, cargado en la pantalla
  const NUEVO = `${PREFIJO}granizo sobre vehículo asegurado`;
  const id = await nuevoRegistro(page, 'reclamos', 'Reclamo', NUEVO);
  const sinNumero = (await registros(e.api, 'reclamos')).find(r => r.id === id)[F.orden];
  await abrirFicha(page, 'reclamo', id);
  await escribirEnFicha(page, F.orden, '4');
  await fechaEnFicha(page, F.fecha, dmy(hace(5)));
  await elegirEnFicha(page, F.caracter, 'Asegurado');
  await elegirEnFicha(page, F.ramo, 'Hogar');
  await elegirEnFicha(page, F.motivo, 'Demora en el pago de un siniestro');
  await elegirEnFicha(page, 'estado', 'En curso');
  await fechaEnFicha(page, 'plazoDeResolucion', dmy(sumarHabiles(hace(5), 10)));
  await clicReal(page, valorEnFicha(page, 'asegurado'));
  await page.getByPlaceholder(/^Buscar|^Search/).last().pressSequentially(ASEGURADO_NOMBRE, { delay: 60 });
  await clicReal(page, page.getByText(ASEGURADO_NOMBRE).last());
  await page.waitForTimeout(1200);
  await clicReal(page, valorEnFicha(page, 'poliza'));
  await page.getByPlaceholder(/^Buscar|^Search/).last().pressSequentially('POL-CART-01', { delay: 60 });
  await clicReal(page, page.getByText('POL-CART-01', { exact: true }).last());
  await page.waitForTimeout(1200);
  const capAlta = await capturar(page, 'A.5.7', plataforma, '1-alta-del-reclamo');

  // La resolución final se registra al cerrar el reclamo
  await elegirEnFicha(page, 'estado', 'Resuelto');
  await escribirEnFicha(page, F.resolucion, 'Se abonó el siniestro y se informó al asegurado.');
  const capFicha = await capturar(page, 'A.5.7', plataforma, '2-ficha-con-sus-datos');

  const guardado = (await registros(e.api, 'reclamos')).find(r => r.id === id);
  console.log('    reclamo guardado', JSON.stringify(guardado));
  expect(sinNumero, 'el reclamo nuevo no debe recibir número de orden del sistema').toBeFalsy();
  expect(guardado[F.orden]).toBe(4);
  expect(guardado[F.fecha]).toContain(iso(hace(5)));
  expect(guardado.aseguradoId).toBe(asegurado);
  expect(guardado[F.caracter]).toBe(valorDe('Carácter del reclamante', 'Asegurado'));
  expect(guardado[F.ramo]).toBe(valorDe('Ramo del reclamo', 'Hogar'));
  expect(guardado.polizaId).toBe(e.polizas[0].id);
  expect(guardado[F.motivo]).toBe(valorDe('Motivo del reclamo', 'Demora en el pago de un siniestro'));
  expect(guardado[F.resolucion]).toContain('Se abonó el siniestro');

  // El número: ningún tipo de campo se numera solo
  await modeloDe(page, 'reclamos');
  await clicReal(page, page.getByRole('button', { name: /Nuevo Campo|New Field/ }).first());
  await esperarCarga(page, 3000);
  expect(await textoDe(page), 'si hubiera un campo que se numera solo, este veredicto no corresponde')
    .not.toMatch(/Auto.?number|Autoincrement|Secuencia|Sequence|Numeración/i);

  // Los reclamos con más de diez días hábiles sin resolver: plazo vencido y estado abierto
  await abrirListado(page, 'reclamos');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Plazo de resolución', { exact: true }).last());
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText('Es', { exact: true }).filter({ visible: true }).first());
  await clicReal(page, page.getByText(/^Está en el pasado$|^Is in past$/).filter({ visible: true }).first());
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');
  await clicReal(page, page.getByText(/^Agregar filtro$|^Add filter$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText('Estado', { exact: true }).filter({ visible: true }).last());
  for (const abierto of ['Nuevo', 'En curso']) {
    await clicReal(page, page.getByText(abierto, { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(800);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  const vencidos = await textoDe(page);
  const capVencidos = await capturar(page, 'A.5.7', plataforma, '3-reclamos-vencidos-sin-resolver');
  console.log('    vencidos:', vencidos.replace(/\s+/g, ' ').slice(0, 700));

  expect(vencidos, 'debe traer el reclamo vencido sin resolver').toContain(PREFIJO + 'vencido sin resolver');
  expect(vencidos, 'no debe traer el vencido ya resuelto').not.toContain(PREFIJO + 'vencido resuelto');
  expect(vencidos, 'no debe traer el reciente').not.toContain(PREFIJO + 'reciente sin resolver');
  expect(vencidos, 'no debe traer el reclamo cerrado').not.toContain(NUEVO);

  registrar({
    criterio: 'A.5.7',
    plataforma,
    cumple: 1,
    reparo: 'manual',
    costo: 2,
    resumen:
      'El reclamo no trae número de orden ni plazo en días hábiles: ambos se cargan a mano en cada alta. ' +
      'Los demás datos se agregan como campos y el listado filtra los vencidos sin resolver.',
    comoLoHace:
      'El reclamo se carga como registro del objeto propio. Se le agregaron como campos el número de ' +
      'orden, la fecha del reclamo, el carácter del reclamante, el ramo, el motivo y la resolución final, ' +
      'y la relación con la póliza; el reclamante es el asegurado vinculado. Un reclamo nuevo nace sin número: ' +
      'quien lo carga lo escribe, y también calcula y escribe el plazo de diez días hábiles. El listado filtra ' +
      'los reclamos con plazo en el pasado y estado abierto.',
    caracteristicas:
      'Los datos exigidos se definen una vez como campos del reclamo y se completan en su ficha. Ningún tipo de ' +
      'campo se numera solo: el número es un campo numérico común.',
    justificacion:
      'Con campos y filtros se registra y se consulta, pero el número correlativo y el vencimiento hábil dependen de ' +
      'que cada persona los calcule y los escriba en cada reclamo: un error de tipeo rompe la correlatividad. ' +
      'Resolverlos solos exigiría desarrollar código.',
    evidencia: [capAlta, capFicha, capVencidos],
  });
});
