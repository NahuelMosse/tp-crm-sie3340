import { Locator, Page, test } from '@playwright/test';
import { Plataforma } from '../evaluar';
import { CAPTURAS } from '../fuentes';
import { listado } from '../espocrm/navegar';

/**
 * Lo que comparten los trece archivos de criterios.
 *
 * Cada archivo cubre un grupo del catálogo y cada criterio es un test. El
 * procedimiento se cita textual de la sección 4: si el test hace otra cosa
 * que la que el informe declara, la diferencia queda a la vista.
 */

/**
 * Salta el criterio en las plataformas que todavía no se evaluaron.
 *
 * Saltar no escribe resultado, y sin resultado el criterio figura como sin
 * verificar en la matriz, que es lo correcto: describe el avance del trabajo,
 * no una característica de la plataforma.
 */
export function soloEn(plataforma: Plataforma, ...evaluadas: Plataforma[]) {
  test.skip(!evaluadas.includes(plataforma), `${plataforma}: pendiente de evaluación`);
}

/**
 * Captura del sistema, guardada donde el verificador la busca.
 * Devuelve el nombre para declararlo como evidencia: así el registro y el
 * archivo no pueden quedar desalineados.
 */
export async function capturar(
  page: Page, criterio: string, plataforma: Plataforma, paso: string,
): Promise<string> {
  const archivo = `${criterio.replace(/\./g, '-')}-${plataforma}-${paso}.png`;
  await page.screenshot({ path: `${CAPTURAS}/${archivo}`, fullPage: true });
  return archivo;
}

/**
 * Abre un desplegable propio del producto y elige un valor.
 *
 * Cada campo de lista deja su propio desplegable en la página, así que vale
 * el que está abierto. Si el clic no lo abre, se escribe el valor en el
 * buscador del control y se confirma, como haría el usuario.
 */
async function elegirEnDesplegable(page: Page, control: Locator, valor: string) {
  await control.click();
  const opcion = page.locator(`.selectize-dropdown:visible [data-value="${valor}"]`).first();
  const aparece = () => opcion.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false);
  if (!(await aparece())) {
    // La flecha abre el desplegable sin filtrar: sirve aunque la etiqueta esté traducida
    await control.locator('input').first().press('ArrowDown');
    if (!(await aparece())) {
      await control.locator('input').first().pressSequentially(valor, { delay: 40 });
      await page.waitForTimeout(500);
    }
  }
  if (await opcion.isVisible().catch(() => false)) await opcion.click();
  else await control.locator('input').first().press('Enter');
  await page.waitForTimeout(400);
}

/**
 * Elige un valor en un campo de lista de EspoCRM.
 *
 * El producto reemplaza el desplegable del navegador por uno propio y deja el
 * original oculto, de modo que hay que operar el visible: es el que ve y usa
 * el usuario.
 */
export async function elegirLista(page: Page, campo: string, valor: string, dentroDe = '') {
  const contenedor = page.locator(`${dentroDe} .field[data-name="${campo}"]`).first();
  const propio = contenedor.locator('.selectize-input').first();

  // El desplegable propio se arma un momento después que el campo: se lo espera
  if (await propio.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true, () => false)) {
    await elegirEnDesplegable(page, propio, valor);
    return;
  }
  // Sin desplegable propio queda el del navegador, que se elige por valor o por etiqueta
  const nativo = contenedor.locator('select').first();
  await nativo.selectOption(valor).catch(() => nativo.selectOption({ label: valor }));
}

// ── Filtros del listado de EspoCRM ──────────────────────────────────────────
// Cada condición es un bloque con dos controles: la comparación ("Es",
// "Próximos X días", "Cualquiera de") y el valor. Los dos son desplegables propios
// del producto, así que se operan como los opera el usuario.

/**
 * Abre un listado sin condiciones.
 *
 * EspoCRM recuerda la última búsqueda de cada listado por usuario: sin esto,
 * un test hereda los filtros que dejó el anterior y lee un listado recortado.
 */
export const listadoLimpio = listado;

/** Agrega al listado una condición sobre un campo. */
export async function agregarFiltro(page: Page, campo: string) {
  await page.locator('.add-filter-button').first().click();
  await page.locator(`ul.filter-list a[data-name="${campo}"]`).first().click();
  await page.locator(`.filter[data-name="${campo}"]`).first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(800);
}

/** Opciones que ofrece un desplegable propio, leídas del que queda abierto. */
async function opcionesAbiertas(page: Page): Promise<{ valor: string; texto: string }[]> {
  return page.locator('.selectize-dropdown:visible .option').evaluateAll(
    os => os.map(o => ({ valor: o.getAttribute('data-value') ?? '', texto: (o.textContent ?? '').trim() })));
}

/** Comparaciones que el filtro ofrece para un campo. Revelan cómo interpreta el dato. */
export async function comparacionesDe(page: Page, campo: string) {
  await page.locator(`.filter[data-name="${campo}"] .selectize-control.search-type .selectize-input`).first().click();
  await page.waitForTimeout(600);
  const opciones = await opcionesAbiertas(page);
  await page.keyboard.press('Escape');
  return opciones;
}

/** Elige la comparación del filtro de un campo. */
export async function comparar(page: Page, campo: string, comparacion: string) {
  const control = page.locator(`.filter[data-name="${campo}"] .selectize-control.search-type .selectize-input`).first();
  await control.click();
  await page.locator(`.selectize-dropdown:visible [data-value="${comparacion}"]`).first().click();
  await page.waitForTimeout(500);
}

/** Valor de una condición sobre un campo de lista. */
export async function filtrarPorLista(page: Page, campo: string, ...valores: string[]) {
  const control = page.locator(`.filter[data-name="${campo}"] .input-container .selectize-input`).first();
  for (const v of valores) await elegirEnDesplegable(page, control, v);
  await page.keyboard.press('Escape');
}

/** Valor de una condición sobre un usuario: se busca por nombre, como en el sistema. */
export async function filtrarPorUsuario(page: Page, campo: string, nombre: string) {
  const entrada = page.locator(`.filter[data-name="${campo}"] input[data-name="${campo}Name"]`).first();
  await entrada.click();
  await entrada.pressSequentially(nombre, { delay: 60 });
  // Las sugerencias aparecen antes de que termine de filtrar: se espera la que corresponde
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: nombre }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

/** Valor numérico de una condición: "próximos 30 días", por ejemplo. */
export async function filtrarPorNumero(page: Page, campo: string, numero: string) {
  const entrada = page.locator(`.filter[data-name="${campo}"] .additional-number input`).first();
  await entrada.click();
  await entrada.pressSequentially(numero, { delay: 40 });
}

/** Aplica las condiciones y espera el listado resultante. */
export async function aplicarFiltros(page: Page) {
  const aplicar = page.locator('[data-action="applyFilters"]:visible').first();
  if (await aplicar.isVisible().catch(() => false)) await aplicar.click();
  else await page.locator('[data-action="search"]').first().click();
  await page.waitForTimeout(3500);
}

/** Nombres de los registros que muestra el listado. */
export async function filasDelListado(page: Page): Promise<string[]> {
  return page.locator('tbody tr td[data-name="name"] a').allTextContents()
    .then(ts => ts.map(t => t.trim()).filter(Boolean));
}

/**
 * Hace clic en una acción que puede estar guardada en un menú desplegable:
 * si no está a la vista, abre primero el menú que la contiene.
 */
export async function clicEnAccion(page: Page, accion: Locator) {
  if (!(await accion.isVisible().catch(() => false))) {
    // El grupo que contiene al menú, no el menú mismo: por eso la clase se compara entera
    await accion.locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " btn-group ") or ' +
      'contains(concat(" ", @class, " "), " dropdown ")][1]')
      .locator('.dropdown-toggle').first().click();
  }
  await accion.click();
}

/** Texto visible de la página, en una sola cadena y sin espacios de sobra. */
export const textoDe = (page: Page) =>
  page.locator('body').innerText().then(t => t.replace(/\s+/g, ' ').trim()).catch(() => '');
