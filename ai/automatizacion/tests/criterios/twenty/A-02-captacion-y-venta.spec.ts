import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  apiTwenty, objeto, registros, borrarRegistro, nuevoCampo, conOpciones, quitarCampo, nuevaPersona,
  abrirFicha, abrirListado, elegirEnFicha, escribirEnFicha, domicilioEnFicha, buscarEnTodo, clicReal, textoDe, BASE,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirOpcion, elegirObjeto, agregarPaso, abrirVariables, elegirVariable,
  escribirEnPanel, botonDelFlujo,
} from '../../twenty/flujos';
import { cargarCartera, RAMOS } from '../../twenty/escenario';

/**
 * A.2 — Captación y proceso de venta, sobre Twenty
 *
 * Twenty no distingue al que todavía no contrató: el solicitante es una
 * persona, como el asegurado, y la venta se sigue en las oportunidades.
 */

test.describe.configure({ mode: 'serial' });

const URGENCIAS = ['Alta', 'Media', 'Baja'];

/** Abre un desplegable visible y elige una opción de su lista. */
async function elegirEnLista(page: Page, abrir: RegExp, opcion: string) {
  await clicReal(page, page.getByText(abrir).filter({ visible: true }).last());
  await clicReal(page, page.getByRole('listbox').last().getByText(opcion, { exact: true }).last());
  await page.waitForTimeout(1200);
}

/** Borra las personas de una corrida anterior, por nombre. */
async function sinPersonas(page: Page, nombres: string[]) {
  const api = await apiTwenty(page);
  for (const p of (await registros(api, 'people')).filter(p => nombres.includes(`${p.name?.firstName} ${p.name?.lastName}`))) {
    await borrarRegistro(api, 'people', p.id);
  }
  return api;
}

// ── A.2.1 ────────────────────────────────────────────────────────────────────
test('A.2.1 — Registro del solicitante con sus datos de contacto', async ({ page }, info) => {
  // «Crear un solicitante con nombre, teléfono, correo y domicilio, y
  //  recuperarlo por búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await sinPersonas(page, ['Carolina Paz', 'Exploracion Solicitante']);
  // La persona no trae domicilio: se agrega como campo de dirección
  await quitarCampo(api, 'person', 'Domicilio');
  await nuevoCampo(page, 'people', 'Address', 'Domicilio');

  const id = await nuevaPersona(page, 'Carolina', 'Paz');
  await abrirFicha(page, 'person', id);
  await escribirEnFicha(page, 'emails', 'carolina.paz@ejemplo.test');
  await escribirEnFicha(page, 'phones', '+54 11 4555 2001');
  await domicilioEnFicha(page, 'domicilio', { calle: 'Av. Rivadavia 17800', ciudad: 'Morón', provincia: 'Buenos Aires', cp: '1708' });
  const capFicha = await capturar(page, 'A.2.1', plataforma, '1-solicitante-cargado');

  const resultado = await buscarEnTodo(page, 'Carolina Paz');
  const capBusqueda = await capturar(page, 'A.2.1', plataforma, '2-busqueda');
  await page.keyboard.press('Escape');

  const guardada = (await registros(api, 'people')).find(p => p.id === id);
  expect(guardada?.emails?.primaryEmail, 'el correo debe quedar guardado').toBe('carolina.paz@ejemplo.test');
  expect(guardada?.phones?.primaryPhoneNumber, 'el teléfono debe quedar guardado').toBeTruthy();
  expect(guardada?.domicilio?.addressCity, 'el domicilio debe quedar guardado').toBe('Morón');
  expect(resultado, 'la búsqueda debe encontrarlo').toContain('Carolina Paz');

  registrar({
    criterio: 'A.2.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Twenty no tiene una entidad para quien todavía no contrató: el solicitante se registra como una persona, ' +
      'igual que el asegurado. La persona trae nombre, correos y teléfonos con su código de país, pero no ' +
      'domicilio: se agregó un campo de dirección, desglosado en calle, ciudad, provincia, código postal y país. ' +
      'Se cargó una solicitante con todos esos datos desde su ficha y la búsqueda general la encontró por su ' +
      'nombre. Agregar el domicilio es trabajo de una sola vez.',
    evidencia: [capFicha, capBusqueda],
  });
});

// ── A.2.2 ────────────────────────────────────────────────────────────────────
test('A.2.2 — Calificación y priorización del solicitante', async ({ page }, info) => {
  // «Registrar qué cobertura pide el solicitante y con cuánta urgencia, y
  //  obtener la lista ordenada por esa urgencia para atender primero a los que
  //  más cerca están de contratar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const solicitantes = [
    { nombre: 'Tomás', apellido: 'Ríos', cobertura: 'Hogar', urgencia: 'Baja' },
    { nombre: 'Inés', apellido: 'Vera', cobertura: 'Automotor', urgencia: 'Alta' },
    { nombre: 'Julio', apellido: 'Sosa', cobertura: 'Vida', urgencia: 'Media' },
  ];
  const api = await sinPersonas(page, solicitantes.map(s => `${s.nombre} ${s.apellido}`));
  for (const c of ['Cobertura solicitada', 'Urgencia']) await quitarCampo(api, 'person', c);
  await nuevoCampo(page, 'people', 'Select', 'Cobertura solicitada', conOpciones(RAMOS));
  await nuevoCampo(page, 'people', 'Select', 'Urgencia', conOpciones(URGENCIAS));
  const campos = (await objeto(api, 'person')).fields;
  const cobertura = campos.find((c: any) => c.label === 'Cobertura solicitada').name;
  const urgencia = campos.find((c: any) => c.label === 'Urgencia').name;

  const ids: Record<string, string> = {};
  for (const s of solicitantes) {
    const id = await nuevaPersona(page, s.nombre, s.apellido);
    ids[s.urgencia] = id;
    await abrirFicha(page, 'person', id);
    await elegirEnFicha(page, cobertura, s.cobertura);
    await elegirEnFicha(page, urgencia, s.urgencia);
  }
  const capFicha = await capturar(page, 'A.2.2', plataforma, '1-calificacion');

  await abrirListado(page, 'people');
  await clicReal(page, page.getByText(/^Ordenar$|^Sort$/).first());
  await clicReal(page, page.getByText('Urgencia', { exact: true }).last());
  await page.waitForTimeout(3000);
  const filas = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const orden = URGENCIAS.map(u => filas.indexOf(ids[u]));
  const capOrden = await capturar(page, 'A.2.2', plataforma, '2-ordenados-por-urgencia');
  const porPosicion = orden.every((p, i) => p > -1 && (i === 0 || p > orden[i - 1]));
  const alReves = orden.every((p, i) => p > -1 && (i === 0 || p < orden[i - 1]));

  expect(porPosicion || alReves, 'ordenar por urgencia debe seguir el orden de las opciones').toBeTruthy();

  registrar({
    criterio: 'A.2.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La persona no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde el modelo de ' +
      'datos. Se cargaron tres solicitantes en desorden y, al ordenar el listado por urgencia, quedaron en el ' +
      `orden de las opciones —${porPosicion ? 'primero la alta, después la media y al final la baja' : 'de la baja a la alta, y con un clic se invierte'}—, ` +
      'no alfabético: el orden sale de cómo se definió la lista. El orden se puede guardar en una vista. ' +
      'Definir los dos campos es trabajo de una sola vez.',
    evidencia: [capFicha, capOrden],
  });
});

// ── A.2.3 ────────────────────────────────────────────────────────────────────
test('A.2.3 — Conversión del solicitante en oportunidad de venta', async ({ page }, info) => {
  // «Convertir el solicitante en oportunidad y comprobar que los datos
  //  cargados se trasladan sin volver a escribirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const campos = (await objeto(api, 'person')).fields;
  const cobertura = campos.find((c: any) => c.label === 'Cobertura solicitada')?.name;
  expect(cobertura, 'A.2.2 debe haber dejado la cobertura solicitada').toBeTruthy();
  const ines = (await registros(api, 'people')).find(p => p.name?.firstName === 'Inés' && p.name?.lastName === 'Vera');
  expect(ines, 'A.2.2 debe haber dejado a la solicitante').toBeTruthy();
  for (const w of (await registros(api, 'workflows')).filter(w => ['Convertir en oportunidad', 'Exploracion manual'].includes(w.name))) {
    await borrarRegistro(api, 'workflows', w.id);
  }
  for (const o of (await registros(api, 'opportunities')).filter(o => o.pointOfContactId === ines.id)) {
    await borrarRegistro(api, 'opportunities', o.id);
  }

  // No hay una acción de convertir: se arma una, que se lanza desde la ficha del solicitante
  await nuevoFlujo(page, 'Convertir en oportunidad');
  await ponerDisparador(page, 'Launch manually', /^Disponibilidad$|^Availability$/);
  await elegirOpcion(page, 'Global', 'Single');
  await elegirObjeto(page, 'People');
  await agregarPaso(page, 'Create Record');
  await elegirObjeto(page, 'Opportunities');
  await abrirVariables(page, 'Name');
  await elegirVariable(page, 'Record', 'Cobertura solicitada');
  await abrirVariables(page, 'Point of Contact');
  await elegirVariable(page, 'Record', 'Id');
  await page.keyboard.press('Escape');
  const capFlujo = await capturar(page, 'A.2.3', plataforma, '1-accion-de-convertir');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  // Desde la ficha del solicitante, la acción aparece en el menú de comandos
  await abrirFicha(page, 'person', ines.id);
  await clicReal(page, page.getByTestId('page-header-side-panel-button'));
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText('Convertir en oportunidad', { exact: true }).last());
  let oportunidad: any;
  for (let i = 0; i < 20 && !oportunidad; i++) {
    await page.waitForTimeout(3000);
    oportunidad = (await registros(api, 'opportunities')).find(o => o.pointOfContactId === ines.id);
  }
  await abrirFicha(page, 'person', ines.id);
  const capConvertido = await capturar(page, 'A.2.3', plataforma, '2-oportunidad-creada');

  expect(oportunidad, 'la conversión debe crear la oportunidad').toBeTruthy();
  expect(oportunidad.name, 'la oportunidad debe llevar la cobertura que pidió').toMatch(/automotor/i);

  registrar({
    criterio: 'A.2.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Twenty no trae una acción de convertir al solicitante: la persona y la oportunidad son registros ' +
      'separados. Con un flujo de trabajo que se lanza a mano sobre la persona se armó esa acción, sin escribir ' +
      'código: crea la oportunidad con la cobertura que pidió el solicitante y lo deja como su contacto. Desde ' +
      'la ficha de la solicitante, la acción aparece en el menú de comandos; al lanzarla se creó la oportunidad ' +
      `con la cobertura cargada —«${oportunidad.name}»: el flujo toma el valor interno de la lista, no su ` +
      'etiqueta— y vinculada a ella, sin volver a escribir nada. Armar la acción es trabajo de una sola vez.',
    evidencia: [capFlujo, capConvertido],
  });
});

// ── A.2.4 ────────────────────────────────────────────────────────────────────
test('A.2.4 — Embudo de oportunidades con etapas', async ({ page, browser }, info) => {
  // «Crear una oportunidad desde la ficha de un asegurado y hacerla avanzar
  //  entre etapas hasta el cierre»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const asegurado = e.asegurados[0];
  for (const o of (await registros(e.api, 'opportunities')).filter(o => o.pointOfContactId === asegurado)) {
    await borrarRegistro(e.api, 'opportunities', o.id);
  }
  const etapas = (await objeto(e.api, 'opportunity')).fields.find((c: any) => c.name === 'stage').options
    .sort((a: any, b: any) => a.position - b.position).map((o: any) => o.label as string);

  // La ficha del asegurado tiene su sección de oportunidades, con un botón para agregar una
  await abrirFicha(page, 'person', asegurado);
  const seccion = page.getByText(/^Opportunities$|^Oportunidades$/).last();
  const fila = seccion.locator('xpath=ancestor::div[.//button][1]');
  await clicReal(page, fila.locator('button').last());
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(/^Agregar nuevo$|^Add new$|^Crear nuevo$/).last());
  await page.waitForTimeout(3000);
  let oportunidad: any;
  for (let i = 0; i < 10 && !oportunidad; i++) {
    await page.waitForTimeout(1500);
    oportunidad = (await registros(e.api, 'opportunities')).find(o => o.pointOfContactId === asegurado);
  }
  expect(oportunidad, 'la oportunidad debe crearse ya ligada al asegurado').toBeTruthy();

  // Nace sin título: se le pone nombre haciendo clic en el título, como a cualquier registro.
  // Desde la ficha del asegurado, el primer clic abre la oportunidad y el segundo edita su título
  const NOMBRE = 'Seguro de hogar — Gutiérrez';
  const nombre = page.locator('input[placeholder="Name"]:focus, input[placeholder="Nombre"]:focus');
  for (let i = 0; i < 3 && !(await nombre.count()); i++) {
    await clicReal(page, page.getByText(/^Sin título$|^Untitled$/).filter({ visible: true }).last());
    await page.waitForTimeout(1500);
  }
  await page.keyboard.type(NOMBRE);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');

  await abrirFicha(page, 'opportunity', oportunidad.id);
  for (const etapa of etapas.slice(1)) await elegirEnFicha(page, 'stage', etapa);
  const capFicha = await capturar(page, 'A.2.4', plataforma, '1-oportunidad-cerrada');
  const final = (await registros(e.api, 'opportunities')).find(o => o.id === oportunidad.id);
  const opcionFinal = (await objeto(e.api, 'opportunity')).fields.find((c: any) => c.name === 'stage').options
    .find((o: any) => o.label === etapas[etapas.length - 1]).value;

  // El historial de la oportunidad: un cambio de etapa por cada avance
  const historial = await registros(e.api, 'timelineActivities', `targetOpportunityId[eq]:${oportunidad.id}`);
  const cambiosDeEtapa = historial.filter(h => JSON.stringify(h.properties?.diff ?? {}).includes('"stage"')).length;

  expect(final.stage, 'la oportunidad debe llegar a la última etapa').toBe(opcionFinal);
  expect(cambiosDeEtapa, 'el historial debe registrar el cambio de etapa').toBeGreaterThanOrEqual(1);

  registrar({
    criterio: 'A.2.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Desde la ficha del asegurado, su sección de oportunidades crea una nueva ya ligada a él como contacto. ' +
      `El embudo viene definido de fábrica con ${etapas.length} etapas —${etapas.join(', ')}— y una vista de ` +
      'tablero por etapa. La oportunidad se hizo avanzar etapa por etapa desde su ficha hasta la última, y el ' +
      'historial registró el avance —los cambios hechos seguidos por la misma persona se agrupan en una sola ' +
      'entrada—. Viene listo, aunque las etapas vienen con nombres en inglés y de una venta genérica: ' +
      'adaptarlas al seguro es configuración.',
    evidencia: [capFicha],
    medicion: `${etapas.length} etapas recorridas; ${cambiosDeEtapa} entrada(s) de cambio de etapa en el historial`,
  });
});

// ── A.2.5 ────────────────────────────────────────────────────────────────────
test('A.2.5 — Embudos diferenciados por ramo', async ({ page, browser }, info) => {
  // «Crear un segundo embudo con etapas distintas del primero y asignarle una
  //  oportunidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const ETAPAS_VIDA = ['Cotización', 'Examen médico', 'Emisión', 'Emitida'];
  await quitarCampo(api, 'opportunity', 'Etapa vida');
  // Las vistas «Embudo de vida» de corridas anteriores quedan agrupadas por el campo viejo: se quitan
  const metadatos = async (query: string, variables = {}) =>
    (await (await api.post(`${BASE}/metadata`, { data: { query, variables } })).json()).data;
  for (const v of (await metadatos('{ getViews { id name } }')).getViews.filter((v: any) => v.name === 'Embudo de vida')) {
    await metadatos('mutation($id: String!) { destroyView(id: $id) }', { id: v.id });
  }
  // Un segundo juego de etapas es un segundo campo de lista, con su propio tablero
  await nuevoCampo(page, 'opportunities', 'Select', 'Etapa vida', conOpciones(ETAPAS_VIDA));
  const etapaVida = (await objeto(api, 'opportunity')).fields.find((c: any) => c.label === 'Etapa vida').name;
  // La aplicación guarda el modelo al cargar: se recarga para que el campo nuevo sirva para agrupar
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await abrirListado(page, 'opportunities');
  await clicReal(page, page.getByText(/^All Opportunities$/).first());
  await clicReal(page, page.getByText(/^Agregar vista$|^Add view$/).last());
  const nombre = page.locator('input:focus').first();
  await nombre.press('Control+a');
  await nombre.pressSequentially('Embudo de vida', { delay: 60 });
  await elegirEnLista(page, /^Tabla$|^Table$/, 'Kanban');
  await page.waitForTimeout(1000);
  const agrupar = page.getByText(/^Stage$|^Etapa$/).filter({ visible: true }).last();
  if (await agrupar.isVisible().catch(() => false)) await elegirEnLista(page, /^Stage$|^Etapa$/, 'Etapa vida');
  await clicReal(page, page.getByText(/^Crear$|^Create$/).filter({ visible: true }).last());
  await page.waitForTimeout(4000);

  const oportunidad = (await registros(api, 'opportunities'))[0];
  await abrirFicha(page, 'opportunity', oportunidad.id);
  await elegirEnFicha(page, etapaVida, 'Examen médico');
  await abrirListado(page, 'opportunities');
  // El listado abre en su vista general: el segundo embudo se elige en el selector de vistas
  await clicReal(page, page.getByText(/^All Opportunities$|^Embudo de vida$|^By Stage$/).filter({ visible: true }).first());
  await clicReal(page, page.getByText('Embudo de vida', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(4000);
  // El asistente de la vista nueva no siempre deja el agrupamiento elegido: se fija en las opciones de la vista
  if (!(await textoDe(page)).includes(ETAPAS_VIDA[0])) {
    await clicReal(page, page.getByText(/^Opciones$|^Options$/).filter({ visible: true }).first());
    await clicReal(page, page.getByText(/^Grupo$|^Group$/).filter({ visible: true }).last());
    await clicReal(page, page.getByText(/^Agrupar por$|^Group by$/).filter({ visible: true }).last());
    await clicReal(page, page.getByText('Etapa vida', { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  }
  const tablero = await textoDe(page);
  const capTablero = await capturar(page, 'A.2.5', plataforma, '1-segundo-embudo');

  const guardada = (await registros(api, 'opportunities')).find(o => o.id === oportunidad.id);
  expect(guardada[etapaVida], 'la oportunidad debe quedar en una etapa del segundo embudo').toBeTruthy();
  expect(ETAPAS_VIDA.every(et => tablero.includes(et)), 'el tablero debe mostrar las etapas del segundo embudo').toBeTruthy();

  registrar({
    criterio: 'A.2.5',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Twenty tiene un solo embudo por objeto: las etapas de la oportunidad son un campo de lista, y el tablero ' +
      'agrupa por ese campo. Un segundo embudo se arma con un segundo campo de lista —para los seguros de ' +
      'personas: cotización, examen médico, emisión— y un tablero agrupado por él; se hizo así y la oportunidad ' +
      'quedó ubicada en el segundo embudo. Pero las dos listas conviven en todas las oportunidades: nada impide ' +
      'que una oportunidad de automotor tenga etapa de vida, ni separa qué embudo sigue cada una. Mantener esa ' +
      'separación queda a cargo de quien carga la oportunidad, en cada alta.',
    evidencia: [capTablero],
  });
});

// ── A.2.6 ────────────────────────────────────────────────────────────────────
test('A.2.6 — Oportunidades de cambio y ampliación sobre la cartera', async ({ page, browser }, info) => {
  // «Obtener el conjunto de asegurados que tienen un ramo contratado y no otro,
  //  y el de los que están próximos a vencer, como base para ofrecer una
  //  cobertura adicional o un cambio de póliza»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await cargarCartera(page, browser);

  // Primer conjunto: el listado de asegurados no ofrece filtrar por sus pólizas
  await abrirListado(page, 'people');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await page.waitForTimeout(1500);
  // Lo que ofrece el desplegable del filtro, no el menú ni las columnas, que también dicen «Pólizas»
  const desplegable = await page.getByPlaceholder(/Buscar campos|Search fields/).first().boundingBox();
  const camposFiltrables = await page.locator('body *').evaluateAll((es, x) => es
    .filter(e => e.childElementCount === 0 && (e as HTMLElement).offsetParent && Math.abs(e.getBoundingClientRect().x - x) < 60)
    .map(e => e.textContent!.trim()), desplegable!.x);
  const capAsegurados = await capturar(page, 'A.2.6', plataforma, '1-filtros-del-asegurado');
  await page.keyboard.press('Escape');
  const filtraPorPolizas = camposFiltrables.includes('Pólizas');

  // Segundo conjunto: las pólizas que vencen en treinta días, con su titular
  await abrirListado(page, 'polizas');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Vigencia hasta', { exact: true }).last());
  await clicReal(page, page.getByText(/^Es$|^Is$/).last());
  await clicReal(page, page.getByText(/^Es relativo$|^Is relative$/).last());
  await clicReal(page, page.getByText(/^This$|^Este$/).last());
  await clicReal(page, page.getByText(/^Next$|^Próximo/).last());
  const cantidad = page.locator('input:visible').last();
  // El campo se vuelve a dibujar con cada tecla y pierde el cursor: después de cada dígito se vuelve a
  // hacer clic en él, al final de lo escrito
  await clicReal(page, cantidad);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  for (const digito of '30') {
    await clicReal(page, cantidad);
    await page.keyboard.press('End');
    await page.keyboard.type(digito);
    await page.waitForTimeout(600);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  const filtro = await textoDe(page);
  const proximas = await page.locator('[data-testid^="row-id-"]').count();
  // El titular es una columna del listado: se la trae a la vista
  const titular = page.getByText('Titular', { exact: true }).first();
  await titular.scrollIntoViewIfNeeded().catch(() => {});
  const conTitular = await titular.isVisible().catch(() => false);
  const capProximas = await capturar(page, 'A.2.6', plataforma, '2-proximas-a-vencer');

  expect(filtraPorPolizas, 'si el asegurado se pudiera filtrar por sus pólizas, este veredicto no corresponde').toBeFalsy();
  expect(proximas, 'debe haber pólizas próximas a vencer').toBeGreaterThan(0);
  expect(filtro, 'el filtro debe quedar en los próximos 30 días').toMatch(/Next 30 days|Próximos 30 días/);
  expect(conTitular, 'el listado debe mostrar el titular de cada póliza').toBeTruthy();

  registrar({
    criterio: 'A.2.6',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en ' +
      'los próximos treinta días muestra cada póliza con su titular. El otro conjunto no: el filtro del listado ' +
      'de asegurados solo ofrece sus propios campos, no las pólizas que tiene, así que «tiene automotor y no ' +
      'hogar» no se puede preguntar. Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos ' +
      'listas de titulares, cada vez que se quiere armar la oferta.',
    evidencia: [capAsegurados, capProximas],
    medicion: `${proximas} pólizas próximas a vencer`,
  });
});
