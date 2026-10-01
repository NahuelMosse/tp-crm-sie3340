import { administracion } from './espocrm/navegar';
import{ Locator, Page } from '@playwright/test';

/**
 * Puesta a punto del escenario de EspoCRM.
 *
 * Deja el modelo en el estado desde el que arrancan los criterios: cada campo
 * propio puesto en el formulario, en el listado y entre los filtros.
 *
 * No decide ningún veredicto. Lo que se puntúa se ejercita en el test del
 * criterio; acá solo se monta el escenario, y todo es idempotente para que
 * correr un grupo dos veces dé el mismo resultado.
 *
 * **Montar el escenario no esconde costo.** Si un criterio necesita algo de lo
 * que se configura acá, esa configuración entra en su costo de implementación
 * y su justificación la declara.
 *
 * Un campo nuevo queda definido en el modelo pero **fuera de la pantalla**
 * hasta que alguien lo ubica en el diseño. Son dos pasos de configuración,
 * ninguno de ellos programación, y el Gestor de Diseños se maneja arrastrando.
 */

/** Dónde tiene que aparecer cada campo de la póliza. */
const EN_FORMULARIO = ['tipoPoliza', 'estadoPago', 'prima', 'vigenciaDesde', 'vigenciaHasta', 'description'];
const EN_COLUMNAS = {
  /** Columnas del listado */
  list: ['tipoPoliza', 'estadoPago', 'prima', 'vigenciaHasta'],
  /** Campos por los que se puede filtrar: de fábrica, ninguno de los propios */
  filters: ['tipoPoliza', 'estadoPago', 'assignedUser', 'vigenciaHasta', 'prima'],
  /** Campos que admite la actualización masiva: de fábrica, solo usuario y equipo */
  massUpdate: ['estadoPago', 'tipoPoliza'],
} as const;

export async function alistarPoliza(page: Page) {
  await alistarEntidad(page, 'CPoliza', { detail: EN_FORMULARIO, ...EN_COLUMNAS });
}

/** Los diseños de una entidad: formulario, columnas, filtros, actualización masiva y paneles inferiores. */
type Diseño = 'detail' | 'list' | 'filters' | 'massUpdate' | 'bottomPanelsDetail';

/** Ubica los campos indicados en cada diseño de una entidad, si todavía no están. */
export async function alistarEntidad(page: Page, entidad: string, diseños: Partial<Record<Diseño, readonly string[]>>) {
  // Una ventana alta: si la lista de campos no entra, arrastrar desde el fondo
  // hasta el principio obliga a desplazar la página y el campo no se suelta
  const ventana = page.viewportSize();
  await page.setViewportSize({ width: 1440, height: 3200 });
  const puestos: string[] = [];
  for (const [tipo, campos] of Object.entries(diseños) as [Diseño, readonly string[]][]) {
    if (!campos.length) continue;
    const n = tipo === 'detail'
      ? await acomodarFormulario(page, entidad, [...campos])
      : await acomodarColumnas(page, entidad, tipo, [...campos]);
    puestos.push(`${n} a ${tipo}`);
  }
  if (ventana) await page.setViewportSize(ventana);
  console.log(`  escenario: ${entidad}, campos ubicados — ${puestos.join(', ')}`);
}

// ── formulario ───────────────────────────────────────────────────────────────
// El diseño de detalle son paneles con filas y celdas; los campos sin ubicar
// esperan en "Campos disponibles" y se sueltan sobre una celda vacía.
async function acomodarFormulario(page: Page, entidad: string, campos: string[]): Promise<number> {
  await abrirDiseño(page, entidad, 'detail', '.disabled.cells');

  let puestos = 0;
  for (const campo of campos) {
    const disponible = page.locator(`.disabled.cells li.cell[data-name="${campo}"]`);
    if (!(await disponible.count())) continue;          // ya está en el formulario

    await arrastrar(page, disponible.first(), await celdaVacia(page));
    if (!(await disponible.count())) puestos++;
  }
  if (puestos) await guardarDiseño(page);
  return puestos;
}

/** Una celda vacía donde soltar el campo; si no quedan, agrega una fila. */
async function celdaVacia(page: Page): Promise<Locator> {
  const vacias = () => page.locator('.panels li.cell.empty');
  if (!(await vacias().count())) {
    await page.locator('[data-action="addRow"]').first().click();
  }
  const hueco = vacias().first();
  await hueco.waitFor({ state: 'visible', timeout: 20_000 });
  return hueco;
}

// ── listado, filtros y actualización masiva ──────────────────────────────────
// Estos diseños son dos columnas conectadas, "Activado" y "Desactivado": el
// campo se arrastra de una a la otra. Si "Activado" está vacía, se suelta sobre
// la columna misma; si no, sobre su último campo.
async function acomodarColumnas(
  page: Page, entidad: string, tipo: Exclude<Diseño, 'detail'>, campos: string[],
): Promise<number> {
  await abrirDiseño(page, entidad, tipo, 'ul.disabled.connected');

  let puestos = 0;
  for (const campo of campos) {
    const disponible = page.locator(`ul.disabled.connected li.cell[data-name="${campo}"]`);
    if (!(await disponible.count())) continue;          // ya está activado

    const activados = page.locator('ul.enabled.connected li.cell');
    const destino = (await activados.count()) ? activados.last() : page.locator('ul.enabled.connected').first();
    await arrastrar(page, disponible.first(), destino);
    if (!(await disponible.count())) puestos++;
  }
  if (puestos) await guardarDiseño(page);
  return puestos;
}

// ── lo común ─────────────────────────────────────────────────────────────────
async function abrirDiseño(page: Page, entidad: string, tipo: string, señal: string) {
  // Administración › Diseño › la entidad › el diseño. Entre diseños la página
  // no se redibuja entera: se recarga para no leer el editor del diseño anterior
  await administracion(page, '#Admin/layouts', `#Admin/layouts/scope=${entidad}`, `#Admin/layouts/scope=${entidad}&type=${tipo}`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator(señal).first().waitFor({ state: 'visible', timeout: 60_000 });
  await page.waitForTimeout(6000);   // el editor termina de acomodarse después de pintar
}

async function guardarDiseño(page: Page) {
  await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
  await page.waitForTimeout(5000);
}

/**
 * Arrastra con el ratón, paso a paso.
 *
 * El gestor usa arrastre clásico —no el del navegador—, que reacciona al
 * movimiento del ratón y no a un evento de soltar. Un salto directo al destino
 * no lo dispara: hay que recorrer el camino.
 */
async function arrastrar(page: Page, origen: Locator, destino: Locator) {
  await origen.scrollIntoViewIfNeeded();
  await destino.scrollIntoViewIfNeeded();
  const a = await origen.boundingBox();
  const b = await destino.boundingBox();
  if (!a || !b) {
    throw new Error('No se pudo ubicar en el Gestor de Diseños ' +
      `${!a ? `el campo (${await origen.count()} coincidencias)` : ''}` +
      `${!a && !b ? ' ni ' : ''}` +
      `${!b ? `su destino (${await destino.count()} coincidencias)` : ''}`);
  }

  const [ax, ay] = [a.x + a.width / 2, a.y + a.height / 2];
  const [bx, by] = [b.x + b.width / 2, b.y + b.height / 2];

  await page.mouse.move(ax, ay);
  await page.mouse.down();
  await page.mouse.move(ax + 14, ay + 14, { steps: 8 });     // supera el umbral de arrastre
  await page.mouse.move(bx, by, { steps: 30 });
  await page.mouse.move(bx + 3, by + 3, { steps: 8 });       // el último movimiento fija el destino
  await page.mouse.up();
  await page.waitForTimeout(1200);
}
