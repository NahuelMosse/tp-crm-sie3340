import { Page, APIRequestContext, request } from '@playwright/test';
import { clicReal, esperarCarga, apiTwenty, objeto, BASE } from './ui';

/** El plural de los objetos, para quien no puede leer el modelo de datos. */
const PLURALES: Record<string, string> = {
  person: 'people', company: 'companies', opportunity: 'opportunities', task: 'tasks', note: 'notes',
  dashboard: 'dashboards', workflow: 'workflows', poliza: 'polizas', reclamo: 'reclamos', articulo: 'articulos',
  inspeccion: 'inspecciones',
};

/**
 * La interfaz de programación para leer el nombre de lo que se va a buscar.
 * Un usuario sin permiso sobre el modelo de datos no puede leerlo: se usa la
 * primera sesión que sí pudo, que es la del administrador.
 */
let lectora: APIRequestContext | undefined;
async function paraLeer(page: Page): Promise<APIRequestContext> {
  // La sesión del navegador, si puede leer el modelo; si no, la última que pudo mientras siga vigente
  const actual = await apiTwenty(page).catch(() => undefined);
  if (actual) {
    await lectora?.dispose();
    lectora = actual;
  } else if (!lectora || !(await lectora.get('metadata/objects', { params: { limit: 1 } })).ok()) {
    throw new Error('Ninguna sesión de Twenty puede leer el modelo de datos');
  }
  return lectora!;
}

/**
 * Cómo se llega a cada pantalla de Twenty con el ratón, como lo hace el
 * usuario: el menú lateral para los listados, el menú del espacio de trabajo
 * para la configuración, y la búsqueda general para abrir un registro por su
 * nombre. Ninguna pantalla se abre por su dirección.
 */

const enConfiguracion = (page: Page) => new URL(page.url()).pathname.startsWith('/settings');

/** Sale de la configuración por su botón de cierre, arriba a la izquierda. */
async function salirDeConfiguracion(page: Page) {
  if (!enConfiguracion(page)) return;
  await clicReal(page, page.getByText(/^Configuración$|^Settings$/).filter({ visible: true }).first());
  await page.waitForURL(u => !u.pathname.startsWith('/settings'), { timeout: 30_000 });
  await esperarCarga(page, 2500);
}

/** Un elemento del menú lateral, por su texto: solo cuenta lo que está en la franja de la izquierda. */
async function enMenuLateral(page: Page, etiqueta: string | RegExp) {
  const candidatos = page.getByText(etiqueta, { exact: typeof etiqueta === 'string' }).filter({ visible: true });
  await candidatos.first().waitFor({ state: 'visible', timeout: 30_000 });
  const xs = await candidatos.evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
  const i = xs.findIndex(x => x < 220);
  if (i < 0) throw new Error(`No está «${etiqueta}» en el menú lateral`);
  await clicReal(page, candidatos.nth(i));
}

/**
 * Abre un listado desde el menú lateral. Recibe el nombre del objeto en
 * plural, como lo usa la interfaz de programación, y busca su etiqueta.
 */
export async function listado(page: Page, plural: string) {
  await salirDeConfiguracion(page);
  const etiqueta = await etiquetaDe(page, plural);
  if (plural === 'workflows' || plural === 'workflowRuns') {
    // Los flujos van en un grupo del menú que se despliega
    const sub = plural === 'workflows' ? /^Workflows$/ : /^Workflow Runs$/;
    const visibles = await page.getByText(sub).filter({ visible: true }).count();
    if (visibles < 2) await enMenuLateral(page, /^Workflows$/);
    await page.waitForTimeout(1000);
    const opciones = page.getByText(sub).filter({ visible: true });
    await clicReal(page, opciones.nth((await opciones.count()) > 1 ? 1 : 0));
  } else {
    await enMenuLateral(page, etiqueta);
  }
  await page.waitForURL(u => u.pathname.startsWith('/objects/'), { timeout: 30_000 });
  await esperarCarga(page, 3500);
}

const etiquetas = new Map<string, string>();
/** La etiqueta con que el menú muestra un objeto: la lee del modelo de datos. */
async function etiquetaDe(page: Page, plural: string): Promise<string> {
  if (!etiquetas.size) {
    const api = await paraLeer(page).catch(() => undefined);
    const r = await api?.get('metadata/objects', { params: { limit: 200 } });
    for (const o of r ? (await r.json()).data : []) etiquetas.set(o.namePlural, o.labelPlural);
  }
  // Sin acceso al modelo, los objetos de fábrica se llaman como su plural
  return etiquetas.get(plural) ?? plural.charAt(0).toUpperCase() + plural.slice(1);
}

/**
 * Abre la ficha de un registro buscándolo por su nombre en la búsqueda
 * general y eligiendo el resultado, como lo busca el usuario. El nombre se lee
 * del registro: con varios homónimos, se prueba cada resultado hasta dar con él.
 */
export async function ficha(page: Page, singular: string, id: string) {
  // Con permiso sobre el modelo se toma el plural de ahí; un usuario sin ese permiso igual puede leer
  // sus registros, con el plural conocido del objeto
  const conModelo = await paraLeer(page).catch(() => undefined);
  const definicion = conModelo ? await objeto(conModelo, singular) : undefined;
  const plural = definicion?.namePlural ?? PLURALES[singular] ?? `${singular}s`;
  // Cada resultado dice de qué objeto es —«· Póliza», «· Task»—: con eso se descartan los homónimos de otro objeto
  const tipo: string = definicion?.labelSingular ?? singular.charAt(0).toUpperCase() + singular.slice(1);
  const api = conModelo ?? await request.newContext({
    baseURL: `${BASE}/rest/`,
    storageState: { cookies: await page.context().cookies(BASE), origins: [] },
    extraHTTPHeaders: { Origin: BASE },
  });
  const r = await api.get(`${plural}/${id}`);
  const registro = Object.values((await r.json()).data ?? {})[0] as any;
  if (!conModelo) await api.dispose();
  const nombre = registro?.name?.firstName !== undefined
    ? `${registro.name.firstName} ${registro.name.lastName}`.trim()
    : registro?.name ?? registro?.title ?? '';
  if (!nombre) throw new Error(`El registro ${singular} ${id} no tiene nombre por el que buscarlo`);

  await salirDeConfiguracion(page);
  const buscar = async () => {
    const campo = page.getByPlaceholder(/^Escribe cualquier cosa|^Type anything|^Search/).filter({ visible: true }).first();
    if (!(await campo.isVisible().catch(() => false))) {
      await clicReal(page, page.getByRole('button', { name: /^Search$|^Buscar$/ }).first());
      await page.waitForTimeout(800);
    }
    await clicReal(page, campo);
    // El buscador conserva lo último que se buscó: se borra antes de escribir
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(nombre);
    await page.waitForTimeout(2500);
  };
  // Los resultados se listan en el panel de la derecha, debajo de «Resultados»
  const resultados = async () => {
    // Un registro recién creado tarda en aparecer en la búsqueda: sin resultados, se vuelve a buscar
    const encabezado = page.getByText(/^Resultados$|^Results$/).filter({ visible: true }).last();
    for (let n = 0; n < 4 && !(await encabezado.isVisible().catch(() => false)); n++) {
      await page.waitForTimeout(3000);
      await buscar();
    }
    const titulo = await encabezado.boundingBox();
    const ancho = page.viewportSize()?.width ?? 1440;
    const exacto = new RegExp(`^${nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    const todos = page.getByText(exacto).filter({ visible: true });
    const cajas = await todos.evaluateAll((es, t) => es.map(e => {
      const r = e.getBoundingClientRect();
      const fila = (e.parentElement?.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
      return { x: r.x, y: r.y, delTipo: fila.endsWith(`· ${t}`) };
    }), tipo);
    return cajas.map((c, i) => ({ ...c, i }))
      .filter(c => c.x > ancho * 0.5 && titulo && c.y > titulo.y && c.delTipo).map(c => todos.nth(c.i));
  };
  await buscar();
  for (let k = 0, vuelta = 0; ; k++) {
    let opciones = await resultados();
    // Recorridos todos sin dar con él: el recién creado todavía no figuraba, se busca de nuevo
    if (k >= opciones.length && vuelta < 2) {
      vuelta++;
      k = 0;
      await page.waitForTimeout(5000);
      await buscar();
      opciones = await resultados();
    }
    if (k >= opciones.length) throw new Error(`La búsqueda de «${nombre}» no llevó al registro ${id}`);
    // Sobre el nombre se abre una vista previa: el clic va en la fila, a la derecha del texto
    const caja = (await opciones[k].boundingBox())!;
    const ancho = page.viewportSize()?.width ?? 1440;
    const antes = page.url();
    await page.mouse.move(ancho - 60, caja.y + caja.height / 2, { steps: 8 });
    await page.mouse.down();
    await page.waitForTimeout(70);
    await page.mouse.up();
    const abrio = await page.waitForURL(u => u.href !== antes && /\/object\//.test(u.pathname), { timeout: 10_000 })
      .then(() => true, () => false);
    // Las tareas y las notas se abren en el panel lateral: su botón de expandir lleva a la ficha completa
    const expandir = page.getByRole('button', { name: /^Expandir registro$|^Expand record$/ }).filter({ visible: true }).first();
    if (!abrio && await expandir.isVisible().catch(() => false)) {
      await clicReal(page, expandir);
      await page.waitForURL(/\/object\//, { timeout: 30_000 }).catch(() => {});
    }
    if (page.url().includes(id)) break;
    // Un homónimo: se vuelve a buscar y se prueba el resultado siguiente
    await buscar();
  }
  // La dirección ya es la del registro: se espera a que termine de dibujar —sus campos, o el lienzo de
  // un flujo, o los gráficos de un tablero—
  await esperarCarga(page, 4000);
}

/**
 * Entra a una sección de la configuración: el menú del espacio de trabajo,
 * «Configuración», y la sección en el menú de la izquierda.
 */
export async function configuracion(page: Page, seccion: string | RegExp) {
  if (!enConfiguracion(page)) {
    // El menú del espacio de trabajo se abre con la flecha junto a su nombre
    const caja = (await page.getByText(/^Unimoron$/).filter({ visible: true }).first().boundingBox())!;
    await page.mouse.move(caja.x + caja.width + 12, caja.y + caja.height / 2, { steps: 8 });
    await page.mouse.down();
    await page.waitForTimeout(70);
    await page.mouse.up();
    await page.waitForTimeout(1200);
    await clicReal(page, page.getByText(/^Configuración$|^Settings$/).filter({ visible: true }).last());
    await page.waitForURL(u => u.pathname.startsWith('/settings'), { timeout: 30_000 });
    await esperarCarga(page, 2000);
  }
  await enMenuLateral(page, seccion);
  await esperarCarga(page, 3000);
}

/** Una pestaña de la pantalla abierta, por su nombre. */
export async function pestana(page: Page, nombre: string | RegExp) {
  // Las pestañas están en el área principal: el menú de la izquierda puede tener una sección con el mismo nombre
  const candidatas = page.getByText(nombre, { exact: typeof nombre === 'string' }).filter({ visible: true });
  const xs = await candidatas.evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
  await clicReal(page, candidatas.nth(Math.max(0, xs.findIndex(x => x > 220))));
  await esperarCarga(page, 2500);
}

/** La pantalla de un objeto en el modelo de datos: Configuración › Modelo de datos › el objeto. */
export async function modeloDe(page: Page, plural: string) {
  await configuracion(page, /^Modelo de datos$|^Data model$/);
  const etiqueta = await etiquetaDe(page, plural);
  const filas = page.getByText(etiqueta, { exact: true }).filter({ visible: true });
  const xs = await filas.evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
  await clicReal(page, filas.nth(Math.max(0, xs.findIndex(x => x > 220))));
  await page.waitForURL(new RegExp(`/settings/objects/${plural}`), { timeout: 30_000 });
  await esperarCarga(page, 3000);
}

export { BASE };
