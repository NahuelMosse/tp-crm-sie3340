import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  objeto, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, configuracion, modeloDe, clicReal, esperarCarga, textoDe,
  entrarComo, marcarFilas, actualizarMarcadas, nuevoRegistro, elegirEnFicha, fechaHoraEnFicha,
} from '../../twenty/ui';
import { cargarCartera, relacion, PRODUCTOR, miembros } from '../../twenty/escenario';

/**
 * A.3 — Productores y actividad comercial, sobre Twenty
 */

test.describe.configure({ mode: 'serial' });

const PRODUCTOR_NOMBRE = `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`;

// ── A.3.1 ────────────────────────────────────────────────────────────────────
test('A.3.1 — Registro de productores y asignación de cartera', async ({ page, browser }, info) => {
  // «Crear un usuario productor y asignarle un conjunto de asegurados como
  //  responsable»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  // El productor entra por el enlace de invitación del espacio de trabajo
  const e = await cargarCartera(page, browser);
  await configuracion(page, /^Miembros$|^Members$/);
  const capMiembros = await capturar(page, 'A.3.1', plataforma, '1-miembros');

  // La persona no trae responsable: se le agrega una relación con los usuarios
  await relacion(e.api, 'person', 'productorResponsable', 'Productor responsable', 'workspaceMember', 'Asegurados a cargo');
  const elegidos = e.asegurados.slice(0, 3);
  for (const id of e.asegurados) await e.api.patch(`people/${id}`, { data: { productorResponsableId: null } });

  await abrirListado(page, 'people');
  await marcarFilas(page, elegidos);
  const capSeleccion = await capturar(page, 'A.3.1', plataforma, '2-seleccion');
  await actualizarMarcadas(page, /^Seleccionar$/, PRODUCTOR_NOMBRE);
  const capAsignados = await capturar(page, 'A.3.1', plataforma, '3-asignados');

  const asignados = (await registros(e.api, 'people')).filter(p => p.productorResponsableId === e.productor).map(p => p.id);
  expect(asignados.sort(), 'los tres asegurados deben quedar a cargo del productor').toEqual([...elegidos].sort());

  registrar({
    criterio: 'A.3.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El productor se suma como usuario del espacio de trabajo con el enlace de invitación, desde la pantalla ' +
      'de miembros: se registra con su correo y su clave, y queda con su propia cuenta. La persona no trae un ' +
      'responsable: se le agregó al modelo una relación con los usuarios. Se marcaron tres asegurados en el ' +
      'listado y, con la actualización masiva, se los dejó a cargo del productor de una sola vez. Agregar el ' +
      'responsable es trabajo de una sola vez.',
    evidencia: [capMiembros, capSeleccion, capAsignados],
  });
});

// ── A.3.2 ────────────────────────────────────────────────────────────────────
test('A.3.2 — Bitácora de la actividad con el cliente', async ({ page, browser }, info) => {
  // «Registrar una llamada y una reunión sobre un asegurado, y comprobar que
  //  ambas quedan visibles en orden cronológico con su autor»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const asegurado = e.asegurados[1];
  const titulos = ['Llamada: consulta por la renovación', 'Reunión en la agencia: revisión de coberturas'];
  for (const n of (await registros(e.api, 'notes')).filter(n => titulos.includes(n.title))) await borrarRegistro(e.api, 'notes', n.id);

  // Cada actividad se registra como una nota sobre el asegurado, desde su ficha
  for (const titulo of titulos) {
    await abrirFicha(page, 'person', asegurado);
    await clicReal(page, page.getByText('Notes', { exact: true }).filter({ visible: true }).last());
    // Sin notas, la pestaña ofrece «Nueva nota»; con notas, el botón de crear queda en su encabezado
    await clicReal(page, page.getByRole('button', { name: /^Crear nota$|^Create note$/ }).filter({ visible: true })
      .or(page.getByText(/^Nueva nota$|^New note$/).filter({ visible: true })).first());
    await page.waitForTimeout(2500);
    await page.keyboard.type(titulo, { delay: 50 });
    await page.keyboard.press('Enter');
    await page.keyboard.type('Registrado desde la ficha del asegurado.', { delay: 30 });
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60_000 / 4);
  }
  await abrirFicha(page, 'person', asegurado);
  await clicReal(page, page.getByText('Timeline', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  const historial = await textoDe(page);
  const capHistorial = await capturar(page, 'A.3.2', plataforma, '1-historial');

  const notas = (await registros(e.api, 'notes')).filter(n => titulos.includes(n.title))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  expect(notas.map(n => n.title), 'las dos actividades deben quedar registradas en orden').toEqual(titulos);
  expect(notas.every(n => n.createdBy?.name), 'cada una debe quedar con su autor').toBeTruthy();
  const pos = titulos.map(t => historial.indexOf(t.split(':')[0]));
  expect(pos.every(p => p > -1), 'el historial de la ficha debe mostrarlas').toBeTruthy();

  registrar({
    criterio: 'A.3.2',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'La ficha del asegurado tiene notas y un historial. Twenty no distingue llamadas de reuniones —las ' +
      'reuniones solo llegan sincronizando un calendario externo—, así que cada actividad se registró como una ' +
      'nota desde la pestaña de notas de la ficha. Las dos quedaron en el historial del asegurado, en orden de ' +
      'fecha y cada una con su autor y su hora. Viene listo; el tipo de actividad queda en el título que escribe ' +
      'quien la registra.',
    evidencia: [capHistorial],
  });
});

// ── A.3.3 ────────────────────────────────────────────────────────────────────
test('A.3.3 — Agenda y carga de trabajo del productor', async ({ page, browser }, info) => {
  // «Ingresar con un usuario productor y comprobar que dispone de una vista de
  //  sus pendientes y compromisos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const titulos = ['Visitar a la asegurada por la renovación', 'Enviar cotización de hogar'];
  for (const t of (await registros(e.api, 'tasks')).filter(t => titulos.includes(t.title))) await borrarRegistro(e.api, 'tasks', t.id);
  // Las dos actividades se le cargan al productor desde la pantalla: la tarea, su responsable y su vencimiento
  const manana = new Date(Date.now() + 86_400_000);
  manana.setHours(10, 0, 0, 0);
  const enTresDias = new Date(Date.now() + 3 * 86_400_000);
  enTresDias.setHours(11, 0, 0, 0);
  for (const [titulo, vence] of [[titulos[0], manana], [titulos[1], enTresDias]] as const) {
    const id = await nuevoRegistro(page, 'tasks', 'Task', titulo);
    await abrirFicha(page, 'task', id);
    await elegirEnFicha(page, 'assignee', `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`);
    await fechaHoraEnFicha(page, 'dueAt', vence);
  }

  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  await abrirListado(page, 'tasks');
  await clicReal(page, page.getByText(/^All Tasks$|^By Status$|^Assigned to Me$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText('Assigned to Me', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(4000);
  const pendientes = await textoDe(page);
  const capPendientes = await capturar(page, 'A.3.3', plataforma, '1-asignadas-a-mi');

  expect(titulos.every(t => pendientes.includes(t)), 'el productor debe ver sus pendientes').toBeTruthy();

  registrar({
    criterio: 'A.3.3',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Al ingresar con la cuenta del productor, las tareas traen de fábrica una vista de las asignadas a él: ' +
      'ahí figuran sus pendientes con la fecha comprometida —la visita de mañana y la cotización de la semana—. ' +
      'Las tareas admiten además una vista de calendario por fecha de vencimiento. Las reuniones agendadas ' +
      'aparecen en la ficha solo si el productor conecta su calendario externo. Viene listo.',
    evidencia: [capPendientes],
  });
});

// ── A.3.4 ────────────────────────────────────────────────────────────────────
test('A.3.4 — Proyección de los movimientos comerciales', async ({ page, browser }, info) => {
  // «Cargar oportunidades con monto y probabilidad, y comprobar si el sistema
  //  calcula un total proyectado por período»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const campos = (await objeto(e.api, 'opportunity')).fields.map((c: any) => `${c.name} ${c.label}`.toLowerCase());
  const conProbabilidad = campos.some((c: string) => /probab/.test(c));

  // El tablero que trae el producto: valor del embudo por etapa y línea de ingresos por fecha de cierre
  // El de fábrica es el más antiguo; los que dejan otras pruebas pueden quedar sin título
  const tablero = (await registros(e.api, 'dashboards')).filter(t => t.title)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  await abrirFicha(page, 'dashboard', tablero.id);
  await esperarCarga(page, 8000);
  const contenido = await textoDe(page);
  const capTablero = await capturar(page, 'A.3.4', plataforma, '1-tablero');

  // Los tipos de campo que ofrece el modelo: ninguno se calcula a partir de otros
  await modeloDe(page, 'opportunities');
  await clicReal(page, page.getByRole('button', { name: /Nuevo Campo|New Field/ }).first());
  await esperarCarga(page, 3000);
  const tipos = await textoDe(page);
  const capTipos = await capturar(page, 'A.3.4', plataforma, '2-tipos-de-campo');

  expect(conProbabilidad, 'si la oportunidad trajera probabilidad, este veredicto no corresponde').toBeFalsy();
  expect(tipos, 'si hubiera un tipo de campo calculado, este veredicto no corresponde').not.toMatch(/Formula|Fórmula|Calculated|Calculado/i);
  expect(contenido, 'el tablero debe sumar los montos por período').toMatch(/Revenue Timeline|Pipeline Value/);

  registrar({
    criterio: 'A.3.4',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Las oportunidades tienen monto y fecha de cierre, pero no probabilidad, y el modelo no admite campos ' +
      'calculados. Los tableros suman los montos por etapa y por fecha de cierre, de modo que muestran cuánto ' +
      'hay en juego en cada período, pero no el total ponderado por la probabilidad de cerrarlo. Una ' +
      'probabilidad se puede agregar como campo, pero el total proyectado hay que calcularlo fuera, cada vez que ' +
      'se lo quiere mirar.',
    evidencia: [capTablero, capTipos],
  });
});
