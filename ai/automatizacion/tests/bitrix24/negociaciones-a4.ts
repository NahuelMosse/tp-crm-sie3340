import { Browser, Page } from '@playwright/test';
import { CAPTURAS } from '../fuentes';
import { Fuente } from '../evaluar';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from './navegar';
import { rest } from './ui';

/**
 * Ayudantes de A.4 y A.10 sobre Bitrix24.
 *
 * Lo que estas pruebas crean en el portal lleva el prefijo `SEG-A4` (contactos)
 * o `POL-INF-` (negociaciones de los informes): se borra al empezar cada test.
 */

export const URL_COMPARATIVO = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';

/** Cómo el comparativo del fabricante nombra a cada plan. */
export const CODIGOS = {
  free: 'PROJECT', basic: 'BASIC', standard: 'STD', professional: 'PRO100', enterprise: 'ENT',
  basicVibe: 'BASIC_VIBE', standardVibe: 'STD_VIBE',
} as const;

export interface FilaDelComparativo {
  fuente: Fuente;
  /** Marca de cada plan en esa fila: «check», «uncheck» o el valor que muestra (un tope, una cantidad). */
  planes: Record<string, string>;
}

/**
 * Una fila de la tabla «Comparación de planes» del fabricante: su texto y lo que
 * marca para cada plan. Falla si la fila no está publicada, así que la cita no
 * se puede inventar.
 */
export async function comparativo(navegador: Browser, etiqueta: RegExp, captura: string): Promise<FilaDelComparativo> {
  const contexto = await navegador.newContext({ locale: 'es-AR', viewport: { width: 1440, height: 1000 } });
  const pagina = await contexto.newPage();
  try {
    await pagina.goto(URL_COMPARATIVO, { waitUntil: 'load', timeout: 90_000 });
    await pagina.waitForTimeout(6000);
    const fila = await pagina.evaluate(([fuente, flags]) => {
      const re = new RegExp(fuente, flags);
      const lado = [...document.querySelectorAll('.bx-sb-f-05-table__sidebar')]
        .find(s => re.test((s.textContent ?? '').replace(/\s+/g, ' ').trim()));
      if (!lado) return null;
      lado.parentElement!.setAttribute('data-fila-a4', '1');
      // Cada plan tiene su columna «Essential» (BASIC, STD…) y la «Vibe+» (BASIC_VIBE, STD_VIBE…)
      const columnas = [...lado.nextElementSibling!.querySelectorAll('.bx-sb-f-05-table__column')];
      const planes: Record<string, string> = {};
      for (const c of columnas) {
        const icono = c.querySelector('[class*="table-icon"]')?.className.match(/icon_(\w+)/)?.[1];
        planes[c.getAttribute('data-sb-feature-product-code')!] = icono ?? (c.textContent ?? '').replace(/\s+/g, ' ').trim();
      }
      return { cita: (lado.textContent ?? '').replace(/\s+/g, ' ').trim(), planes };
    }, [etiqueta.source, etiqueta.flags] as const);
    if (!fila) throw new Error(`El comparativo de planes no publica una fila que coincida con ${etiqueta}`);

    const archivo = `${captura}.png`;
    const caja = pagina.locator('[data-fila-a4="1"]').first();
    await caja.scrollIntoViewIfNeeded();
    await caja.screenshot({ path: `${CAPTURAS}/${archivo}` });
    return {
      fuente: { url: URL_COMPARATIVO, cita: fila.cita, consultado: new Date().toLocaleDateString('sv-SE'), captura: archivo },
      planes: fila.planes,
    };
  } finally {
    await contexto.close();
  }
}

/** Abre el listado de contactos, desde la barra del CRM: Clientes › Contactos. */
export async function listadoDeContactos(page: Page) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contactos');
}

export { menuLateral, pestana, panel, panelListo, cerrarPaneles, rest };

// ── Informes del CRM ─────────────────────────────────────────────────────────
// Los informes definidos por el usuario viven en Analítica › Analítica en tiempo
// real › Informes: un asistente arma las columnas, los cálculos, el filtro y el
// período, y el resultado se ve, se exporta y se vuelve a ejecutar.

/** Abre el listado de informes del CRM con el ratón: Analítica › Analítica en tiempo real › Informes. */
export async function irAInformes(page: Page) {
  await menuLateral(page, 'CRM');
  const pestanaAnalitica = page.locator('a, span').filter({ hasText: /^Analítica$/ }).filter({ visible: true }).first();
  const padre = page.locator('.menu-popup-item').filter({ hasText: 'Analítica en tiempo real' }).first();
  // El menú se abre al pasar el ratón; si no se abre, se reintenta y, al final, se abre con un clic
  for (let intento = 0; intento < 4; intento++) {
    if (intento === 3) await pestanaAnalitica.click(); else await pestanaAnalitica.hover();
    if (await padre.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) break;
    await page.mouse.move(700, 500);
    await page.waitForTimeout(800);
  }
  await padre.hover();
  await page.waitForTimeout(1500);
  // El submenú se cierra si el puntero cruza otras entradas: se entra en él en horizontal, a la altura del padre
  const destino = page.locator('.menu-popup-item-text').filter({ hasText: /^Informes$/ }).filter({ visible: true }).last();
  const cp = (await padre.boundingBox())!, cd = (await destino.boundingBox())!;
  await page.mouse.move(cd.x + cd.width / 2, cp.y + cp.height / 2, { steps: 12 });
  await page.waitForTimeout(500);
  const antes = page.url();
  await page.mouse.move(cd.x + cd.width / 2, cd.y + cd.height / 2, { steps: 6 });
  await page.mouse.down(); await page.mouse.up();
  await page.waitForURL(u => u.href !== antes, { timeout: 30_000 }).catch(() => {});
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
}

/** Borra desde su menú los informes cuyo nombre empieza con el prefijo. */
export async function borrarInformes(page: Page, prefijo: string) {
  await irAInformes(page);
  page.on('dialog', d => d.accept());
  for (let i = 0; i < 12; i++) {
    const fila = page.locator('tr.reports-list-item').filter({ hasText: prefijo }).first();
    if (!(await fila.isVisible().catch(() => false))) break;
    await fila.locator('a.reports-menu-button').click();
    await page.waitForTimeout(800);
    await page.locator('.menu-popup-item-text').filter({ hasText: /^Eliminar$/ }).filter({ visible: true }).first().click();
    await page.waitForTimeout(3500);
  }
  page.removeAllListeners('dialog');
}

export interface Columna {
  /** Campo tal como lo nombra el asistente */
  campo: string;
  /** Cálculo que se le pide, con el código del sistema: SUM, AVG, MIN, MAX, COUNT_DISTINCT */
  calculo?: string;
}

/**
 * Arma un informe de negociaciones con el asistente: «Agregar reporte» › «Siguiente», el nombre,
 * las columnas que se agregan y las que vienen de fábrica y no se quieren, el cálculo de cada
 * una y el período. Devuelve sin crearlo, para que el test mire la pantalla antes.
 */
export async function asistenteDeInformes(page: Page, o: { nombre: string; agregar: Columna[]; quitar: string[]; periodo?: string }) {
  await irAInformes(page);
  await page.getByText('Agregar reporte').first().click();
  await page.getByText('SIGUIENTE', { exact: false }).first().click();
  await page.locator('input[name="report_title"]').waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('input[name="report_title"]').fill(o.nombre);

  // Columnas nuevas, desde el selector de campos
  await page.getByText('Agregar', { exact: true }).first().click();
  const lista = page.locator('.popup-window:visible');
  await lista.getByText(o.agregar[0].campo, { exact: true }).first().waitFor({ state: 'visible', timeout: 15_000 });
  for (const c of o.agregar) await lista.getByText(c.campo, { exact: true }).first().click();
  await lista.getByText(/^agregar$/i).last().click();
  await page.waitForTimeout(1500);

  // Las columnas de fábrica que no se piden
  for (const n of o.quitar) {
    const fila = page.locator('.reports-add-col-title').filter({ visible: true }).filter({ hasText: n }).first();
    await fila.hover();
    await fila.locator('.reports-add-col-tit-remove').click();
    await page.waitForTimeout(400);
  }
  // El cálculo de cada columna: se marca su casilla y se elige la operación
  for (const c of o.agregar.filter(c => c.calculo)) {
    const fila = page.locator('.reports-add-col-title').filter({ visible: true }).filter({ hasText: c.campo }).first();
    await fila.locator('xpath=preceding::input[@type="checkbox"][1]').check({ force: true });
    await page.waitForTimeout(500);
    await fila.locator('select.reports-add-col-select-calc').selectOption(c.calculo!);
  }
  if (o.periodo) await page.locator('select[name="F_DATE_TYPE"]').selectOption({ label: o.periodo });
}

/** Crea el informe armado en el asistente y espera su resultado. */
export async function crearInforme(page: Page) {
  await page.getByText('CREAR INFORME', { exact: false }).first().click();
  await page.locator('a:has-text("Regresar a los reportes")').first().waitFor({ state: 'visible', timeout: 60_000 });
  await page.waitForTimeout(3000);
}

/** El resultado de un informe agrupado: cada fila con su grupo y su cifra. */
export async function resultadoDeInforme(page: Page): Promise<Record<string, number>> {
  const filas = await page.evaluate(() => {
    const tabla = [...document.querySelectorAll('table')].find(t => (t as HTMLElement).offsetParent && /reports/.test(t.className + t.id + (t.parentElement?.className ?? '')));
    const t = tabla ?? [...document.querySelectorAll('table')].filter(x => (x as HTMLElement).offsetParent)[0];
    return [...t.querySelectorAll('tr')].map(r => [...r.children].map(c => (c.textContent ?? '').trim()));
  });
  const salida: Record<string, number> = {};
  for (const f of filas) {
    if (f.length < 2) continue;
    const cifra = f.find(c => /^-?[\d.,]+$/.test(c));
    const grupo = f.find(c => c && !/^-?[\d.,]+$/.test(c));
    // La fila «—» es la de totales generales, no un grupo
    if (cifra !== undefined && grupo && grupo !== '—') salida[grupo] = Number(cifra.replace(/,/g, ''));
  }
  return salida;
}

/** Ejecuta el informe abierto para un rango de fechas: el selector de período, las dos fechas y «Aplicar». */
export async function aplicarPeriodo(page: Page, desde: string, hasta: string) {
  await page.locator('select[name="F_DATE_TYPE"]').selectOption({ label: 'rango de fecha' });
  await page.waitForTimeout(800);
  for (const [campo, valor] of [['F_DATE_FROM', desde], ['F_DATE_TO', hasta]] as const) {
    const entrada = page.locator(`input[name="${campo}"]`);
    await entrada.click();
    await entrada.press('Control+a');
    await entrada.pressSequentially(valor);
  }
  await page.keyboard.press('Escape');
  await page.getByText(/^aplicar$/i).filter({ visible: true }).first().click();
  await page.locator('a:has-text("Regresar a los reportes")').first().waitFor({ state: 'visible', timeout: 60_000 });
  await page.waitForTimeout(3000);
}

/**
 * Una herramienta que el menú lateral guarda dentro del grupo «Aplicaciones»
 * —Market, Recursos para desarrolladores—: se despliega el grupo y se entra.
 */
export async function menuAplicaciones(page: Page, texto: string) {
  await cerrarPaneles(page);
  const menu = page.locator('nav[aria-label="Menú principal"]').first();
  const enlace = () => menu.locator('a').filter({ hasText: new RegExp(`^\\s*${texto}\\s*$`) }).filter({ visible: true }).first();
  if (!(await enlace().isVisible().catch(() => false))) {
    await menu.getByText('Aplicaciones', { exact: true }).first().click();
    await page.waitForTimeout(1200);
  }
  const antes = page.url();
  await enlace().click();
  await page.waitForURL(u => u.href !== antes, { timeout: 30_000 }).catch(() => {});
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000);
}

/**
 * Como `crearCampo` de ui.ts, pero el botón «Guardar» del editor del campo puede ser un
 * `span` o un `button` con la misma clase, y queda debajo de los valores: se lo lleva a la vista.
 */
export async function crearCampoA4(page: Page, tipo: string, nombre: string, valores: string[] = []) {
  const f = panel(page);
  await f.getByText('Crear campo', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText(tipo, { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText('Nombre del campo', { exact: true }).last().locator('xpath=following::input[1]').fill(nombre);
  for (const [i, v] of valores.entries()) {
    if (i > 0) {
      await f.getByText('Agregar', { exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(500);
    }
    await f.locator('input[placeholder="Nuevo artículo"]').nth(i).fill(v);
  }
  const guardar = f.locator('.ui-btn-primary').filter({ hasText: /^\s*Guardar\s*$/ }).filter({ visible: true }).first();
  await guardar.scrollIntoViewIfNeeded();
  await guardar.click();
  await f.getByText(nombre, { exact: true }).first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(1500);
}
