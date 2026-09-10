import { Page, Locator } from '@playwright/test';

/**
 * MODO NARRADO: solo se activa con la variable de entorno NARRAR=1.
 *
 * Los carteles y el slowMo agregan segundos, así que si narrás, los tiempos
 * medidos NO sirven como dato del criterio 3. Por eso hay dos corridas:
 *
 *   npx playwright test              → medición limpia, tiempos reales
 *   NARRAR=1 npx playwright test     → video didáctico, tiempos inválidos
 */
export const NARRANDO = process.env.NARRAR === '1';

/**
 * Narrador para videos didácticos.
 *
 * Playwright graba el navegador tal cual: clicks rápidos, sin contexto, imposible
 * de seguir para alguien que no escribió el test. Este helper inyecta carteles en
 * pantalla para que el video se entienda solo:
 *
 *   portada()   pantalla de título al arrancar
 *   paso()      cartel con el paso actual, arriba
 *   nota()      aclaración grande en el centro
 *   marcar()    resalta el elemento que se está por tocar
 *   resultado() pantalla de cierre con el veredicto
 */

const CSS = `
  #tp-banner {
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
    background: linear-gradient(90deg, #1e3a5f 0%, #2d5a8c 100%);
    color: #fff; font-family: system-ui, -apple-system, Segoe UI, sans-serif;
    padding: 14px 22px; box-shadow: 0 3px 14px rgba(0,0,0,.35);
    display: flex; align-items: center; gap: 16px; pointer-events: none;
  }
  #tp-banner .tp-chip {
    background: #ffd166; color: #1e3a5f; font-weight: 700; font-size: 13px;
    padding: 5px 12px; border-radius: 20px; white-space: nowrap; letter-spacing: .3px;
  }
  #tp-banner .tp-txt { font-size: 18px; font-weight: 600; line-height: 1.3; }
  #tp-banner .tp-sub { font-size: 13px; opacity: .8; font-weight: 400; margin-top: 2px; }

  #tp-nota {
    position: fixed; inset: 0; z-index: 2147483646; display: flex;
    align-items: center; justify-content: center; pointer-events: none;
    background: rgba(15,26,42,.82); backdrop-filter: blur(3px);
    font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  }
  #tp-nota .caja {
    background: #fff; border-radius: 14px; padding: 38px 52px; max-width: 900px;
    box-shadow: 0 20px 60px rgba(0,0,0,.5); text-align: center;
  }
  #tp-nota .tit { font-size: 34px; font-weight: 800; color: #1e3a5f; margin-bottom: 14px; }
  #tp-nota .det { font-size: 20px; color: #40566e; line-height: 1.5; }
  #tp-nota .pie { font-size: 15px; color: #7d8fa3; margin-top: 20px; }

  .tp-marca {
    outline: 4px solid #ff5c5c !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 9999px rgba(0,0,0,.28) !important;
    border-radius: 4px;
  }
`;

async function asegurarEstilos(page: Page) {
  await page.evaluate((css) => {
    if (!document.getElementById('tp-estilos')) {
      const s = document.createElement('style');
      s.id = 'tp-estilos';
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, CSS).catch(() => {});
}

/** Cartel fijo arriba con el paso actual. Queda hasta que se llame de nuevo. */
export async function paso(page: Page, chip: string, texto: string, sub = '', ms = 1800) {
  if (!NARRANDO) return;
  await asegurarEstilos(page);
  await page.evaluate(({ chip, texto, sub }) => {
    let b = document.getElementById('tp-banner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'tp-banner';
      document.body.appendChild(b);
    }
    b.innerHTML =
      `<div class="tp-chip">${chip}</div>` +
      `<div><div class="tp-txt">${texto}</div>` +
      (sub ? `<div class="tp-sub">${sub}</div>` : '') + `</div>`;
  }, { chip, texto, sub }).catch(() => {});
  await page.waitForTimeout(ms);
}

/** Pantalla completa con un mensaje. Para portadas, aclaraciones y cierres. */
export async function nota(page: Page, titulo: string, detalle = '', pie = '', ms = 3200, captura?: string) {
  if (!NARRANDO) return;
  await asegurarEstilos(page);
  await page.evaluate(({ titulo, detalle, pie }) => {
    document.getElementById('tp-nota')?.remove();
    const d = document.createElement('div');
    d.id = 'tp-nota';
    d.innerHTML = `<div class="caja">
      <div class="tit">${titulo}</div>
      ${detalle ? `<div class="det">${detalle}</div>` : ''}
      ${pie ? `<div class="pie">${pie}</div>` : ''}
    </div>`;
    document.body.appendChild(d);
  }, { titulo, detalle, pie }).catch(() => {});
  if (captura) await page.screenshot({ path: captura }).catch(() => {});
  await page.waitForTimeout(ms);
  await page.evaluate(() => document.getElementById('tp-nota')?.remove()).catch(() => {});
}

/** Portada del video. */
export async function portada(page: Page, herramienta: string, criterio: string, caso: string) {
  if (!NARRANDO) return;
  await nota(page,
    herramienta,
    `<b>${criterio}</b>`,
    `Caso ${caso} · TP SIE 3340 · Universidad de Morón`,
    3600);
}

/** Cierre con el veredicto. */
export async function resultado(page: Page, ok: boolean, titulo: string, detalle = '') {
  if (!NARRANDO) return;
  await nota(page,
    `${ok ? '✅' : '❌'} ${titulo}`,
    detalle,
    'Fin de la prueba',
    3600);
}

/** Resalta un elemento unos segundos antes de tocarlo. */
export async function marcar(page: Page, loc: Locator, ms = 1200) {
  if (!NARRANDO) return;
  await loc.evaluate((el) => el.classList.add('tp-marca')).catch(() => {});
  await page.waitForTimeout(ms);
  await loc.evaluate((el) => el.classList.remove('tp-marca')).catch(() => {});
}

/** Saca el banner (para capturas limpias). */
export async function limpiar(page: Page) {
  if (!NARRANDO) return;
  await page.evaluate(() => {
    document.getElementById('tp-banner')?.remove();
    document.getElementById('tp-nota')?.remove();
  }).catch(() => {});
}
