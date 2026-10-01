import { Page, Locator } from '@playwright/test';
import { clicReal, esperarCarga } from './ui';
import { listado } from './navegar';

/**
 * El editor de flujos de trabajo de Twenty, recorrido como lo recorre quien
 * arma una automatización: un lienzo con nodos y, a la derecha, el panel del
 * nodo elegido. Cada campo del panel tiene al costado un botón {x} que abre
 * las variables de los pasos anteriores.
 */

/** Crea un flujo vacío con nombre y deja abierto su lienzo. */
export async function nuevoFlujo(page: Page, nombre: string) {
  await listado(page, 'workflows');
  await clicReal(page, page.locator('div:text-is("New Workflow") >> visible=true')
    .or(page.locator('div:text-is("Nuevo Workflow") >> visible=true')).first());
  await page.waitForURL(/\/object\/workflow\//, { timeout: 30_000 });
  await page.waitForTimeout(2500);
  await page.keyboard.type(nombre, { delay: 50 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
}

/**
 * El elemento del panel de la derecha. El menú de la izquierda repite nombres
 * —Notes, Tasks, Pólizas— y un clic ahí se va del lienzo.
 */
export async function enPanel(page: Page, candidatos: Locator): Promise<Locator> {
  await candidatos.first().waitFor({ state: 'attached', timeout: 30_000 });
  const xs = await candidatos.evaluateAll(es => es.map(e => {
    const r = e.getBoundingClientRect();
    return r.width && r.height ? r.x : -1;
  }));
  const ancho = page.viewportSize()?.width ?? 1440;
  const i = xs.map((x, i) => ({ x, i })).filter(c => c.x > ancho * 0.65).map(c => c.i).pop();
  if (i === undefined) throw new Error('El elemento no está en el panel del nodo');
  return candidatos.nth(i);
}

/**
 * Pone el disparador del flujo. Con el servidor lento, el panel a veces queda
 * en blanco y el nodo sin actualizar: se recarga la página —lo guardado sigue
 * ahí— y, si no quedó, se vuelve a elegir.
 */
export async function ponerDisparador(page: Page, tipo: string, listo: RegExp = /^Intervalo de activación$|^Trigger interval$/) {
  const configurado = page.locator('.react-flow__node').filter({ hasText: tipo });
  for (let intento = 0; intento < 3; intento++) {
    if (!(await configurado.first().isVisible().catch(() => false))) {
      await clicReal(page, page.getByText(/^Agregar un disparador$|^Add a trigger$/).first());
      await clicReal(page, await enPanel(page, page.getByText(tipo, { exact: true }).filter({ visible: true })));
    }
    if (await page.getByText(listo).filter({ visible: true }).first()
      .waitFor({ state: 'visible', timeout: 15_000 }).then(() => true, () => false)) return;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    if (await configurado.first().isVisible().catch(() => false)) await clicReal(page, configurado.first());
  }
  throw new Error(`No quedó puesto el disparador ${tipo}`);
}

/** Elige una opción de un desplegable del panel, buscándola si hay buscador. */
export async function elegirOpcion(page: Page, abrir: string | RegExp, opcion: string) {
  const puesta = () => enPanel(page, page.getByText(opcion, { exact: true }).filter({ visible: true }))
    .then(() => true, () => false);
  for (let intento = 0; intento < 3; intento++) {
    const desplegable = await enPanel(page, page.getByText(abrir, { exact: typeof abrir === 'string' }).filter({ visible: true }))
      .catch(() => null);
    // Si el desplegable ya no muestra el valor anterior, la opción quedó puesta
    if (!desplegable) { if (await puesta()) return; continue; }
    await page.waitForTimeout(1500);
    await clicReal(page, desplegable);
    const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
    if (await buscar.isVisible().catch(() => false)) await buscar.pressSequentially(opcion.slice(0, 8), { delay: 50 });
    const lista = page.getByRole('listbox').last();
    if (intento < 2) {
      await clicReal(page, lista.getByText(opcion, { exact: true }).last());
    } else {
      // Último intento: con el teclado, bajando hasta la opción
      const opciones = (await lista.innerText()).split(/\r?\n/).map(t => t.trim()).filter(Boolean);
      for (let k = 0; k < opciones.indexOf(opcion); k++) await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(2000);
    if (!(await page.getByRole('listbox').first().isVisible().catch(() => false)) && await puesta()) return;
    // Escape no sirve: en el disparador vuelve a la elección del tipo. Se reabre el nodo
    await clicReal(page, page.locator('.react-flow__node.selected').first()).catch(() => {});
    await page.waitForTimeout(1500);
  }
  throw new Error(`No quedó elegida la opción ${opcion}`);
}

/**
 * Elige el objeto de un paso de datos o de un disparador de registros. El
 * desplegable muestra el último que se usó, o nada: se abre por su lugar,
 * debajo de su etiqueta —«Objeto» en los pasos, «Tipo de registro» en el disparador—.
 */
export const ETIQUETA_OBJETO = /^Objeto$|^Object$|^Tipo de registro$|^Record type$/;

export async function elegirObjeto(page: Page, objeto: string) {
  const etiqueta = await enPanel(page, page.getByText(ETIQUETA_OBJETO).filter({ visible: true }));
  const r = (await etiqueta.boundingBox())!;
  // El valor elegido queda escrito en el desplegable, debajo de la etiqueta: se comprueba y, si no quedó, se repite
  const elegido = async () => (await page.getByText(objeto, { exact: true }).filter({ visible: true })
    .evaluateAll((es, y) => es.some(e => Math.abs(e.getBoundingClientRect().y - y) < 30), r.y + r.height + 12));
  for (let intento = 0; intento < 3 && !(await elegido()); intento++) {
    await page.mouse.move(r.x + 120, r.y + r.height + 18, { steps: 8 });
    await page.mouse.click(r.x + 120, r.y + r.height + 18);
    await page.waitForTimeout(1000);
    const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
    if (await buscar.isVisible().catch(() => false)) {
      await clicReal(page, buscar);
      await buscar.pressSequentially(objeto.slice(0, 6), { delay: 50 });
      await page.waitForTimeout(800);
    }
    await clicReal(page, page.getByRole('listbox').last().getByText(objeto, { exact: true }).last());
    await page.waitForTimeout(1500);
  }
}

/** El botón {x} del campo del panel que tiene esa etiqueta. */
export async function abrirVariables(page: Page, etiqueta: string) {
  // El {x} es el cuadrado de 32 píxeles al final del campo, debajo de la etiqueta.
  // La etiqueta puede repetirse dentro del editor de código, que no cuenta
  const etiquetas = page.getByText(etiqueta, { exact: true }).and(page.locator(':not(.monaco-editor *)'));
  const r = await (await enPanel(page, etiquetas)).evaluate(e => {
    const et = e.getBoundingClientRect();
    const boton = [...document.querySelectorAll('div, button')].map(b => b.getBoundingClientRect())
      .filter(b => b.width >= 28 && b.width <= 36 && b.height >= 28 && b.height <= 36
        && b.top > et.bottom - 4 && b.top < et.bottom + 50 && b.left > et.left)
      .sort((a, b) => a.top - b.top || b.left - a.left)[0];
    return boton
      ? { x: boton.left + boton.width / 2, y: boton.top + boton.height / 2 }
      : { x: e.parentElement!.getBoundingClientRect().right - 16, y: et.bottom + 18 };
  });
  await page.mouse.move(r.x, r.y, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
  await page.waitForTimeout(1200);
}

/**
 * Escribe el código de un paso «Code», tecla por tecla, en una sola línea: el
 * editor cierra solo cada llave y paréntesis que se abre, y al tipear el de
 * cierre lo pisa, así que el texto queda como se escribió. Lo que sobre al
 * final —un cierre de más— se borra, y se comprueba lo que quedó.
 */
export async function escribirCodigo(page: Page, codigo: string) {
  const editor = page.locator('.monaco-editor').first();
  await editor.waitFor({ state: 'visible', timeout: 30_000 });
  const caja = (await editor.boundingBox())!;
  await page.mouse.move(caja.x + 200, caja.y + 100, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
  // El editor cierra paréntesis y sugiere mientras se escribe, y con el sistema cargado lo hace a
  // destiempo: se apagan esas ayudas y se tipea igual, tecla por tecla
  await page.evaluate(() => {
    const monaco = (window as any).monaco;
    for (const e of monaco?.editor?.getEditors?.() ?? []) {
      e.updateOptions({
        autoClosingBrackets: 'never', autoClosingQuotes: 'never', autoClosingOvertype: 'never', autoIndent: 'none',
        quickSuggestions: false, suggestOnTriggerCharacters: false, acceptSuggestionOnEnter: 'off', formatOnType: false,
      });
    }
  }).catch(() => {});
  await page.waitForTimeout(600);
  const esperado = codigo.replace(/\s+/g, ' ').trim();
  let escrito = '';
  for (let intento = 0; intento < 3 && escrito !== esperado; intento++) {
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type(codigo);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+Shift+End');
    await page.keyboard.press('Delete');
    escrito = (await editor.locator('.view-lines').innerText()).replace(/\s+/g, ' ').trim();
  }
  if (escrito !== esperado) throw new Error(`El editor de código no quedó con lo tipeado: «${escrito}»`);
  // Los parámetros del panel salen de la firma de la función: se espera que se redibujen
  await page.waitForTimeout(4000);
}

/** La forma de lo que devuelve el paso de código, para que los pasos siguientes la ofrezcan como variable. */
export async function salidaEsperada(page: Page, json: string) {
  const campo = page.getByText(/^Cuerpo de salida esperado$|^Expected response body$/).last()
    .locator('xpath=..').locator('[contenteditable="true"]').first();
  await clicReal(page, campo);
  await page.keyboard.type(json, { delay: 40 });
  await page.waitForTimeout(2500);
}

/** Elige una variable recorriendo el menú: paso, y dentro del paso, el dato. */
export async function elegirVariable(page: Page, ...camino: (string | RegExp)[]) {
  for (const tramo of camino) {
    const opcion = () => (typeof tramo === 'string' ? page.getByText(tramo, { exact: true }) : page.getByText(tramo))
      .filter({ visible: true }).last();
    // Las listas largas quedan cortadas: lo que no se ve se busca por su nombre
    if (!(await opcion().isVisible().catch(() => false)) && typeof tramo === 'string') {
      const buscar = page.getByPlaceholder(/^Buscar$|^Search$/).filter({ visible: true }).last();
      if (await buscar.isVisible().catch(() => false)) {
        await buscar.fill('');
        await buscar.pressSequentially(tramo, { delay: 50 });
        await page.waitForTimeout(800);
      }
    }
    await clicReal(page, opcion());
    await page.waitForTimeout(900);
  }
}

/**
 * Elige la acción en el menú del panel y espera a que el panel pase a
 * configurarla. Si el menú todavía se estaba dibujando, el clic se repite.
 */
export async function elegirAccion(page: Page, accion: string) {
  const menu = page.getByText(/^Datos$|^Núcleo$/).filter({ visible: true });
  for (let intento = 0; intento < 3; intento++) {
    await clicReal(page, await enPanel(page, page.getByText(accion, { exact: true }).filter({ visible: true })));
    // Cuando el menú de acciones se cierra, el panel ya está configurando el paso
    if (await menu.first().waitFor({ state: 'hidden', timeout: 6000 }).then(() => true, () => false)) {
      return;
    }
  }
  throw new Error(`El panel no pasó a configurar ${accion}`);
}

/**
 * Espera a que el panel del nodo muestre su configuración. Con el servidor
 * lento a veces queda en blanco: se vuelve a abrir el nodo elegido.
 */
export async function panelDibujado(page: Page) {
  const contenido = page.getByText(/^Objeto$|^Object$|^Elementos para iterar$|^Intervalo de activación$|^Código$|^Code$/).filter({ visible: true });
  for (let intento = 0; intento < 3; intento++) {
    if (await contenido.first().waitFor({ state: 'visible', timeout: 20_000 }).then(() => true, () => false)) return;
    // Si el editor se rompió, lo guardado sigue ahí: se recarga
    if (await page.getByText(/algo salió mal|Something went wrong/).isVisible().catch(() => false)) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(6000);
    }
    const elegido = page.locator('.react-flow__node.selected').first();
    if (await elegido.isVisible().catch(() => false)) await clicReal(page, elegido);
  }
}

/**
 * Pone la acción que se repite dentro de un recorrido, en el lugar vacío que
 * deja el iterador. Se comprueba después de recargar, y si no quedó se repite.
 */
export async function accionEnBucle(page: Page, accion: string, listo: RegExp = /^Objeto$|^Object$/) {
  const pideObjeto = page.getByText(listo).filter({ visible: true });
  for (let intento = 0; intento < 3; intento++) {
    // El lugar suele quedar al pie, cortado: se sube la vista para verlo entero
    const lugar = page.locator('.react-flow__node').filter({ hasText: 'Add an Action' }).last();
    if (((await lugar.boundingBox())?.y ?? 0) > 700) await alejar(page);
    await clicReal(page, lugar);
    await page.waitForTimeout(2500);
    // Si la acción ya había quedado elegida, el panel pide directamente el objeto
    if (!(await pideObjeto.first().isVisible().catch(() => false))) await elegirAccion(page, accion);
    if (await pideObjeto.first().waitFor({ state: 'visible', timeout: 15_000 }).then(() => true, () => false)) return;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(3000);
  }
  throw new Error(`No quedó puesta la acción ${accion} dentro del recorrido`);
}

/**
 * Sube la vista del lienzo arrastrando el fondo, para ver entero lo que quedó
 * al pie. Se arrastra desde un punto vacío, a la izquierda de los nodos.
 */
export async function alejar(page: Page) {
  await page.mouse.move(300, 760, { steps: 6 });
  await page.mouse.down();
  await page.mouse.move(300, 420, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
}

/** Cuántos nodos hay en el lienzo. */
const nodos = (page: Page) => page.locator('.react-flow__node').count();

/**
 * Agrega un paso y comprueba, con el lienzo recargado, que quedó guardado.
 * Solo se repite si de verdad no quedó: repetirlo antes deja pasos duplicados.
 */
async function agregarYComprobar(page: Page, accion: string, apretarMas: () => Promise<void>) {
  const antes = await nodos(page);
  for (let intento = 0; intento < 3; intento++) {
    await apretarMas();
    await elegirAccion(page, accion);
    await page.waitForTimeout(3000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(3000);
    if ((await nodos(page)) > antes) {
      const nuevo = page.locator('.react-flow__node').filter({ hasText: accion }).last();
      if (((await nuevo.boundingBox())?.y ?? 0) > 700) await alejar(page);
      await clicReal(page, nuevo);
      await panelDibujado(page);
      return;
    }
  }
  throw new Error(`No se agregó el paso ${accion}`);
}

/** Agrega un paso en el último «+» del lienzo. */
export async function agregarPaso(page: Page, accion: string) {
  await agregarYComprobar(page, accion, async () => {
    const mas = page.getByRole('button', { name: 'Agregar un paso' }).last();
    if (((await mas.boundingBox())?.y ?? 0) > 700) await alejar(page);
    await clicReal(page, mas);
  });
}

/** Abre el panel de un nodo del lienzo por su título. */
export async function abrirNodo(page: Page, titulo: string, cual: 'primero' | 'ultimo' = 'ultimo') {
  const nodos = page.locator('.react-flow__node').filter({ hasText: titulo });
  await clicReal(page, cual === 'primero' ? nodos.first() : nodos.last());
  await page.waitForTimeout(1500);
}

/** Escribe en un campo numérico o de texto del panel, por su texto de ejemplo. */
export async function escribirEnPanel(page: Page, textoDeEjemplo: string | RegExp, valor: string) {
  const campo = page.getByPlaceholder(textoDeEjemplo).last();
  await clicReal(page, campo);
  await campo.press('Control+a');
  await campo.pressSequentially(valor, { delay: 70 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1200);
}

/** El filtro de una búsqueda: «vence en los próximos N días» sobre un campo de fecha. */
export async function filtroProximosDias(page: Page, campo: string, dias: number) {
  await clicReal(page, page.getByText(/^Agregar filtro$|^Add filter$/).last());
  await elegirOpcion(page, /^Name$|^Nombre$/, campo);
  // Sobre una fecha, el filtro arranca en «Es relativo»
  await elegirOpcion(page, /^This$|^Este$/, 'Next');
  await escribirEnPanel(page, /^Número$|^Number$/, String(dias));
}

/** Agrega un paso en el «+» que queda debajo de una etiqueta del lienzo, como «completado». */
export async function agregarPasoBajo(page: Page, etiqueta: string, accion: string) {
  await agregarYComprobar(page, accion, async () => {
    const ref = await page.getByText(etiqueta, { exact: true }).last().boundingBox();
    if (!ref) throw new Error(`No está la etiqueta ${etiqueta} en el lienzo`);
    const botones = page.getByRole('button', { name: 'Agregar un paso' });
    const cajas = await botones.evaluateAll(bs => bs.map(b => {
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }));
    const cerca = cajas.map((c, i) => ({ i, y: c.y, d: Math.hypot(c.x - (ref.x + ref.width / 2), c.y - (ref.y + ref.height)) }))
      .filter(c => c.y > ref.y).sort((a, b) => a.d - b.d)[0];
    await clicReal(page, botones.nth(cerca.i));
  });
}

/** Botón del encabezado del lienzo: Test, Activate, Deactivate. */
export async function botonDelFlujo(page: Page, nombre: RegExp) {
  await clicReal(page, page.getByText(nombre).filter({ visible: true }).last());
  await page.waitForTimeout(2500);
}

/**
 * Un filtro de búsqueda «campo es igual a una variable» de un paso anterior:
 * se elige el campo y, en el renglón del valor, se abre el {x} para elegirla.
 */
export async function filtroIgualA(page: Page, campo: string, variable: (string | RegExp)[]) {
  await clicReal(page, await enPanel(page, page.getByText(/^Agregar filtro$|^Add filter$/).filter({ visible: true })));
  await elegirOpcion(page, /^Name$|^Nombre$/, campo);
  const regla = await (await enPanel(page, page.getByText(/^Agregar regla de filtro$|^Add filter rule$/).filter({ visible: true }))).boundingBox();
  const panel = await page.getByText(/^Filtro$|^Filter$/).filter({ visible: true }).last()
    .evaluate(e => e.parentElement!.getBoundingClientRect().right);
  await page.mouse.move(panel - 16, regla!.y - 18, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
  await page.waitForTimeout(1200);
  await elegirVariable(page, ...variable);
}
