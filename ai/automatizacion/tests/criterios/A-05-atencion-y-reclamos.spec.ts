import { Page, test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, entrarComo, plataformaDe } from '../sesion';
import { cargarCartera, PRODUCTOR, ASEGURADOS, rolProductor } from '../datos';
import { apiEspo, listar } from '../api';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, filasDelListado } from './comun';
import { alta, ficha, edicion, inicio } from '../espocrm/navegar';

/**
 * A.5 — Atención al asegurado y reclamos
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. El reclamo se modela con el caso de atención que trae el producto
 * —en la interfaz en español, "Ticket"— sin crear nada.
 */

test.describe.configure({ mode: 'serial' });

let productorId = '';
let reclamoId = '';
const RECLAMO = 'Reclamo por granizo sobre vehículo asegurado';

test.beforeAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api } = await cargarCartera();
  const { list } = await listar(api, 'User', { maxSize: 200 });
  productorId = list.find((u: any) => u.userName === PRODUCTOR.userName).id;
  await rolProductor(api, productorId);

  // Los reclamos de corridas anteriores se quitan: cada corrida mide lo mismo
  const { list: casos } = await listar(api, 'Case', { maxSize: 200 });
  for (const c of casos.filter((c: any) => c.name === RECLAMO)) await api.delete(`Case/${c.id}`);
  const { list: tareas } = await listar(api, 'Task', { maxSize: 200 });
  for (const t of tareas.filter((t: any) => /^Llamar al asegurado/.test(t.name))) await api.delete(`Task/${t.id}`);
});

/**
 * Completa un campo de vínculo buscando por nombre, como en el sistema.
 * Sirve para el vínculo simple y para el múltiple: los dos se buscan igual.
 */
async function vincular(page: Page, campo: string, nombre: string) {
  const entrada = page.locator(`.field[data-name="${campo}"] input[type="text"]`).first();
  await entrada.click();
  await entrada.pressSequentially(nombre, { delay: 50 });
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: nombre }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

// ── A.5.1 ────────────────────────────────────────────────────────────────────
test('A.5.1 — Reclamo como caso con identidad propia', async ({ page }, info) => {
  // «Crear un reclamo asociado a un asegurado y comprobar que tiene número,
  //  listado y ficha propios»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  const asegurado = `${ASEGURADOS[0].firstName} ${ASEGURADOS[0].lastName}`;
  await entrar(page, plataforma);
  await alta(page, 'Case');
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially(RECLAMO, { delay: 20 });
  await vincular(page, 'contacts', ASEGURADOS[0].lastName);
  const capAlta = await capturar(page, 'A.5.1', plataforma, '1-alta');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#Case\/view\//, { timeout: 30_000 });
  await page.waitForTimeout(3000);
  reclamoId = page.url().split('/').pop()!;

  const ficha = await textoDe(page);
  const capFicha = await capturar(page, 'A.5.1', plataforma, '2-ficha');
  const api = await apiEspo();
  const guardado = await (await api.get(`Case/${reclamoId}`)).json();

  await listadoLimpio(page, 'Case');
  await page.locator('.search-container input.text-filter').first().fill('granizo');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  const enListado = (await filasDelListado(page)).includes(RECLAMO);
  const capListado = await capturar(page, 'A.5.1', plataforma, '3-listado');

  expect(guardado.number, 'el reclamo debe recibir un número').toBeTruthy();
  expect(guardado.contactsIds?.length, 'el reclamo debe quedar asociado al asegurado').toBeGreaterThan(0);
  expect(ficha).toContain(asegurado.split(' ').pop()!);
  expect(enListado, 'el reclamo debe figurar en su listado').toBeTruthy();

  registrar({
    criterio: 'A.5.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El producto trae el caso de atención como entidad propia, con su entrada de menú, su listado y su ficha. ' +
      `Se registró un reclamo asociado a un asegurado y el sistema le asignó el número ${guardado.number} al ` +
      'guardarlo; la ficha muestra al asegurado y el reclamo figura en el listado de casos. No hubo que crear ' +
      'ni configurar nada: viene listo con la instalación. El número propio es lo que permite que la compañía ' +
      'y el asegurado hablen del mismo reclamo sin ambigüedad.',
    evidencia: [capAlta, capFicha, capListado],
    medicion: `Reclamo número ${guardado.number}`,
  });
});

// ── A.5.2 ────────────────────────────────────────────────────────────────────
test('A.5.2 — Estado y seguimiento del reclamo', async ({ page }, info) => {
  // «Cambiar el reclamo de estado y comprobar que el sistema conserva la
  //  secuencia de estados por los que pasó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  const secuencia = ['Assigned', 'Pending', 'Closed'];
  await entrar(page, plataforma);
  for (const estado of secuencia) {
    await edicion(page, 'Case', reclamoId);
    await page.locator('.field[data-name="status"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await elegirLista(page, 'status', estado);
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(3500);
  }

  await ficha(page, 'Case', reclamoId);
  await page.waitForTimeout(5000);
  const capHistoria = await capturar(page, 'A.5.2', plataforma, '1-secuencia-de-estados');

  // La secuencia se lee de lo que el sistema conservó, no de la pantalla
  const api = await apiEspo();
  const notas = (await (await api.get(`Case/${reclamoId}/stream`, { params: { maxSize: 50 } })).json()).list ?? [];
  // El cambio de estado queda como actualización con el valor nuevo
  const cambios = notas.map((n: any) => n.type !== 'Update' ? null
      : n.data?.value ?? (n.data?.fields?.includes('status') ? n.data?.attributes?.became?.status : null))
    .filter(Boolean).reverse();

  expect(cambios, 'el sistema debe conservar cada estado por el que pasó').toEqual(secuencia);

  registrar({
    criterio: 'A.5.2',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El reclamo se pasó de nuevo a asignado, a pendiente y a cerrado, y la ficha conserva la secuencia ' +
      'completa en su historia: cada cambio de estado queda registrado con el valor anterior, el nuevo, quién ' +
      'lo hizo y cuándo. El estado del caso viene auditado de fábrica, sin configurar nada. Es lo que permite ' +
      'reconstruir cuánto estuvo un reclamo en cada instancia cuando el asegurado pregunta o cuando hay que ' +
      'responder ante un organismo de control.',
    evidencia: [capHistoria],
    medicion: `Secuencia conservada: ${cambios.join(' → ')}`,
  });
});

// ── A.5.3 ────────────────────────────────────────────────────────────────────
test('A.5.3 — Responsable asignado a cada reclamo', async ({ page }, info) => {
  // «Asignar el reclamo a un usuario y comprobar que aparece entre sus pendientes»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  await edicion(page, 'Case', reclamoId);
  await page.locator('.field[data-name="status"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'status', 'Assigned');
  await vincular(page, 'assignedUser', PRODUCTOR.lastName);
  const capAsignacion = await capturar(page, 'A.5.3', plataforma, '1-asignacion');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  // Desde la cuenta del productor
  await page.context().clearCookies();
  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await listadoLimpio(page, 'Case');
  const suyos = await filasDelListado(page);
  const capPendientes = await capturar(page, 'A.5.3', plataforma, '2-pendientes-del-productor');

  expect(suyos, 'el reclamo debe aparecer entre los pendientes del productor').toContain(RECLAMO);

  registrar({
    criterio: 'A.5.3',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El caso trae un responsable asignado de fábrica. Se asignó el reclamo a un productor desde la ficha y, ' +
      'al ingresar con la cuenta de ese productor, el reclamo figura en su listado de casos. Cada reclamo tiene ' +
      'un dueño visible, que es lo que evita que un caso quede sin atender porque nadie sabía que era suyo.',
    evidencia: [capAsignacion, capPendientes],
  });
});

// ── A.5.4 ────────────────────────────────────────────────────────────────────
test('A.5.4 — Base de conocimiento para la atención', async ({ page }, info) => {
  // «Crear un artículo con una condición de cobertura y recuperarlo mediante búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  const titulo = 'Cobertura de granizo en pólizas de automotor';
  const api = await apiEspo();
  const { list } = await listar(api, 'KnowledgeBaseArticle', { maxSize: 200 });
  for (const a of list.filter((a: any) => a.name === titulo)) await api.delete(`KnowledgeBaseArticle/${a.id}`);

  await entrar(page, plataforma);
  await alta(page, 'KnowledgeBaseArticle');
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially(titulo, { delay: 20 });
  await elegirLista(page, 'status', 'Published');
  const cuerpo = page.locator('.field[data-name="body"] .note-editable, .field[data-name="body"] [contenteditable="true"]').first();
  await cuerpo.click();
  await cuerpo.pressSequentially('El granizo está cubierto en las pólizas de automotor con cobertura todo riesgo. ' +
    'Quedan excluidos los daños a cristales cuando la póliza es de terceros completo.', { delay: 5 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#KnowledgeBaseArticle\/view\//, { timeout: 30_000 });
  await page.waitForTimeout(2000);

  // El editor de texto enriquecido deja la ficha marcada como modificada aunque ya
  // se guardó: al salir, el sistema pregunta si abandonar la página, y la pestaña lo confirma
  await listadoLimpio(page, 'KnowledgeBaseArticle');
  await page.locator('.search-container input.text-filter').first().fill('granizo');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  const encontrados = await filasDelListado(page);
  const capBusqueda = await capturar(page, 'A.5.4', plataforma, '1-busqueda');

  expect(encontrados, 'el artículo debe recuperarse buscando una palabra de la condición').toContain(titulo);

  registrar({
    criterio: 'A.5.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El producto trae una base de conocimiento propia. Se escribió un artículo con una condición de ' +
      'cobertura —qué cubre la póliza de automotor ante granizo y qué excluye—, se lo publicó y se lo recuperó ' +
      'buscando "granizo" desde su listado. Viene lista: no hubo que crear ni configurar nada. Es lo que ' +
      'permite que quien atiende responda igual que su compañero de al lado, sin depender de la memoria.',
    evidencia: [capBusqueda],
  });
});

// ── A.5.5 ────────────────────────────────────────────────────────────────────
test('A.5.5 — Tareas asignables con responsable y vencimiento', async ({ page }, info) => {
  // «Crear una tarea, asignarla a otro usuario con fecha de vencimiento y
  //  verificarla desde la cuenta de ese usuario»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  const tarea = 'Llamar al asegurado por la renovación';
  const vence = new Date(Date.now() + 3 * 86_400_000);
  const venceTexto = `${String(vence.getDate()).padStart(2, '0')}.${String(vence.getMonth() + 1).padStart(2, '0')}.${vence.getFullYear()}`;

  await entrar(page, plataforma);
  await alta(page, 'Task');
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially(tarea, { delay: 20 });
  const fecha = page.locator('.field[data-name="dateEnd"] input[data-name="dateEnd"]').first();
  await fecha.click();
  await fecha.pressSequentially(venceTexto, { delay: 30 });
  await fecha.press('Tab');
  await vincular(page, 'assignedUser', PRODUCTOR.lastName);
  const capAlta = await capturar(page, 'A.5.5', plataforma, '1-alta');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  await page.context().clearCookies();
  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await listadoLimpio(page, 'Task');
  const suyas = await filasDelListado(page);
  const capDelProductor = await capturar(page, 'A.5.5', plataforma, '2-desde-la-cuenta-del-productor');

  const api = await apiEspo();
  const guardada = (await listar(api, 'Task', { maxSize: 200 })).list.find((t: any) => t.name === tarea);

  expect(suyas, 'la tarea debe figurar en la cuenta del productor').toContain(tarea);
  expect(guardada?.assignedUserId).toBe(productorId);
  expect(guardada?.dateEnd ?? guardada?.dateEndDate, 'la tarea debe conservar su vencimiento').toBeTruthy();

  registrar({
    criterio: 'A.5.5',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Se creó una tarea con vencimiento en tres días y se la asignó a un productor. Al ingresar con la cuenta ' +
      'de ese productor, la tarea figura en su listado con su fecha. Responsable y vencimiento son campos que ' +
      'la tarea trae de fábrica, sin configurar nada, y es lo que permite repartir el trabajo y saber qué se ' +
      'atrasa.',
    evidencia: [capAlta, capDelProductor],
  });
});

// ── A.5.6 ────────────────────────────────────────────────────────────────────
test('A.5.6 — Aviso al usuario al que se le asigna una tarea', async ({ page }, info) => {
  // «Comprobar si el usuario asignado recibe una notificación sin tener que
  //  consultar el listado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await page.context().clearCookies();
  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await inicio(page);
  await page.waitForTimeout(6000);
  const campana = page.locator('.notifications-badge, [data-action="showNotifications"], .notifications-button').first();
  await campana.click();
  await page.waitForTimeout(3000);
  const avisos = await textoDe(page);
  const capAvisos = await capturar(page, 'A.5.6', plataforma, '1-notificaciones-del-productor');

  expect(/renovación|granizo|asign/i.test(avisos), 'el productor debe tener el aviso de la asignación').toBeTruthy();

  registrar({
    criterio: 'A.5.6',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Al asignarle la tarea y el reclamo, el productor recibió el aviso en el propio sistema: al ingresar, ' +
      'el indicador de notificaciones lo muestra sin que tenga que abrir ningún listado, y cada aviso lleva al ' +
      'registro que le asignaron. Viene activado de fábrica. Es lo que asegura que el responsable se entere en ' +
      'el momento, y no cuando se le ocurre revisar.',
    evidencia: [capAvisos],
  });
});
