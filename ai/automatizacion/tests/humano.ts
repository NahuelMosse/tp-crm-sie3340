import { test as base, expect } from '@playwright/test';

/**
 * Las pruebas se ven como las haría una persona.
 *
 * El navegador automatizado no tiene puntero: en el video los clics no se ven
 * y los campos se llenan solos. Este módulo inyecta en cada página un puntero
 * que se desplaza hasta cada elemento que la prueba toca, marca cada clic,
 * resalta el campo que se completa y la opción que se elige. El ritmo lo pone
 * la pausa entre acciones de la configuración (`slowMo`), y el de la escritura,
 * `TECLA_MS`: todo lo que la prueba escribe se tipea tecla por tecla.
 *
 * Dentro del sistema no se entra a ninguna pantalla por su dirección: se llega
 * con el ratón, por los menús, como lo haría el usuario (`navegar.ts` de cada
 * plataforma). Una navegación por dirección hace fallar la prueba.
 *
 * Los specs importan `test` y `expect` de acá en vez de '@playwright/test'.
 */

const PUNTERO = String.raw`(() => {
  if (window.__tpPuntero) return;
  window.__tpPuntero = true;

  const css = document.createElement('style');
  css.textContent = [
    '#tp-puntero{position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;',
    'transition:transform .32s cubic-bezier(.25,.8,.35,1);transform:translate(-40px,-40px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}',
    '#tp-puntero.tp-apretado svg{transform:scale(.82)}',
    '.tp-onda{position:fixed;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;z-index:2147483646;pointer-events:none;',
    'border:3px solid #ff4d4f;animation:tp-onda .6s ease-out forwards}',
    '@keyframes tp-onda{from{transform:scale(.6);opacity:1}to{transform:scale(3.4);opacity:0}}',
    '.tp-foco{outline:3px solid #ffb020 !important;outline-offset:2px !important;transition:outline-color .2s}',
  ].join('');

  const puntero = document.createElement('div');
  puntero.id = 'tp-puntero';
  puntero.innerHTML = '<svg viewBox="0 0 26 26" width="26" height="26" style="transition:transform .12s">' +
    '<path d="M3 2 L3 21 L8.2 16.4 L11.6 24 L15 22.5 L11.7 15 L19 15 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  const montar = () => {
    if (!document.documentElement) return;
    if (!css.isConnected) document.documentElement.appendChild(css);
    if (!puntero.isConnected) document.documentElement.appendChild(puntero);
  };
  // Las aplicaciones de una sola página reescriben el documento: se vuelve a montar si desaparece
  new MutationObserver(montar).observe(document, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', montar);
  montar();

  let x = -40, y = -40, ultimoMovimiento = 0;
  const mover = (nx, ny) => { x = nx; y = ny; puntero.style.transform = 'translate(' + (x - 3) + 'px,' + (y - 2) + 'px)'; };

  addEventListener('mousemove', e => { ultimoMovimiento = Date.now(); mover(e.clientX, e.clientY); }, true);
  addEventListener('mousedown', e => {
    mover(e.clientX, e.clientY);
    puntero.classList.add('tp-apretado');
    const onda = document.createElement('div');
    onda.className = 'tp-onda';
    onda.style.left = e.clientX + 'px';
    onda.style.top = e.clientY + 'px';
    document.documentElement.appendChild(onda);
    setTimeout(() => onda.remove(), 700);
  }, true);
  addEventListener('mouseup', () => puntero.classList.remove('tp-apretado'), true);

  // Un campo que se completa sin clic —fill, selectOption, teclado— igual lleva el puntero hasta él
  const resaltar = (el) => {
    if (!(el instanceof Element) || el === document.body) return;
    const r = el.getBoundingClientRect();
    if (Date.now() - ultimoMovimiento > 150 && r.width && r.height) mover(r.left + Math.min(r.width / 2, 60), r.top + r.height / 2);
    el.classList.add('tp-foco');
    clearTimeout(el.__tpFoco);
    el.__tpFoco = setTimeout(() => el.classList.remove('tp-foco'), 1100);
  };
  addEventListener('focusin', e => resaltar(e.target), true);
  addEventListener('input', e => resaltar(e.target), true);
  addEventListener('change', e => resaltar(e.target), true);
})();`;

/** Pausa entre tecla y tecla: el ritmo de alguien que tipea mirando el teclado. */
export const TECLA_MS = 90;

/** Lo que tarda el puntero dibujado en llegar a donde se movió el ratón (su transición), con margen. */
const LLEGADA_MS = 380;

/**
 * Direcciones a las que se entra escribiéndolas, como lo haría una persona:
 * el ingreso al sistema y las páginas de afuera —documentación, tiendas—.
 * Todo lo demás dentro del sistema se recorre con el ratón.
 */
const SE_ESCRIBE = (url: string) => {
  const u = new URL(url, 'http://localhost');
  // Los sistemas evaluados: los instalados en la máquina y el portal de Bitrix24 en la nube
  if (!/^localhost$|^127\.0\.0\.1$|^b24-[a-z0-9]+\.bitrix24\.[a-z]+$/.test(u.hostname)) return true;
  return /^\/?$|^\/welcome$|^\/invite\//.test(u.pathname) && !u.hash.replace(/^#$/, '');
};

/**
 * Escribe una dirección en la barra del navegador. Solo para cuando el
 * procedimiento lo pide —abrir un registro ajeno por su dirección, para
 * comprobar que el sistema lo impide—: en el resto, se navega con clics.
 */
export async function escribirDireccion(pagina: import('@playwright/test').Page, url: string) {
  // El video no muestra la barra del navegador: se dibuja una, se hace clic y se tipea la dirección
  const completa = new URL(url, pagina.url()).href;
  await pagina.evaluate(() => {
    const barra = document.createElement('input');
    barra.id = 'tp-direccion';
    barra.setAttribute('style', 'position:fixed;top:10px;left:50%;transform:translateX(-50%);width:62%;z-index:2147483645;' +
      'padding:9px 16px;border-radius:20px;border:1px solid #bbb;background:#f1f3f4;font:15px system-ui;box-shadow:0 2px 8px rgba(0,0,0,.25)');
    document.documentElement.appendChild(barra);
  });
  const barra = pagina.locator('#tp-direccion');
  await barra.click();
  await barra.pressSequentially(completa);
  await pagina.waitForTimeout(500);
  await barra.press('Enter');
  await irPorDireccion!.call(pagina, url, { waitUntil: 'domcontentloaded' });
}

/**
 * Recarga la página como la recarga una persona: con el botón de recargar.
 * El video no muestra el del navegador, así que se dibuja uno arriba y el
 * puntero va hasta él y hace clic.
 */
async function clicEnRecargar(pagina: import('@playwright/test').Page) {
  const caja = await pagina.evaluate(() => {
    const boton = document.createElement('div');
    boton.id = 'tp-recargar';
    boton.textContent = '⟳  Recargar';
    boton.setAttribute('style', 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483645;' +
      'padding:8px 18px;border-radius:18px;background:#f1f3f4;border:1px solid #bbb;font:600 15px system-ui;color:#222;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer');
    // El clic es del botón: no llega a la aplicación que está debajo
    for (const ev of ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup']) {
      boton.addEventListener(ev, e => { e.stopPropagation(); e.preventDefault(); });
    }
    document.documentElement.appendChild(boton);
    const r = boton.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }).catch(() => null);
  if (!caja) return;
  await pagina.mouse.move(caja.x, caja.y, { steps: 12 });
  await pagina.waitForTimeout(350);
  await pagina.mouse.down();
  await pagina.waitForTimeout(90);
  await pagina.mouse.up();
  await pagina.waitForTimeout(300);
}
let irPorDireccion: ((url: string, opciones?: object) => Promise<unknown>) | undefined;

let instalado = false;
/**
 * Hace que todo lo que la prueba escribe se vea tecla por tecla y que ninguna
 * pantalla del sistema se abra por su dirección. Se instala sobre las clases
 * de Playwright, así vale también para las ventanas que abren los ayudantes.
 */
function comoPersona(pagina: import('@playwright/test').Page) {
  if (instalado) return;
  instalado = true;
  const Pagina = Object.getPrototypeOf(pagina);
  const Localizador = Object.getPrototypeOf(pagina.locator('body'));
  const Teclado = Object.getPrototypeOf(pagina.keyboard);

  const irOriginal = Pagina.goto;
  irPorDireccion = irOriginal;

  const recargar = Pagina.reload;
  Pagina.reload = async function (opciones?: object) {
    await clicEnRecargar(this);
    return recargar.call(this, opciones);
  };
  Pagina.goto = function (url: string, opciones?: object) {
    if (!SE_ESCRIBE(url)) {
      return Promise.reject(new Error(`Navegación por dirección a ${url}: dentro del sistema se llega con clics (ver navegar.ts)`));
    }
    return irOriginal.call(this, url, opciones);
  };

  const secuencia = Localizador.pressSequentially;
  Localizador.pressSequentially = function (texto: string, opciones: { delay?: number } = {}) {
    return secuencia.call(this, texto, { ...opciones, delay: Math.max(opciones.delay ?? 0, TECLA_MS) });
  };
  // Completar un campo es hacer clic, borrar lo que tenga y escribir
  const llenar = Localizador.fill;
  Localizador.fill = async function (valor: string, opciones?: { timeout?: number }) {
    const tipo = await this.getAttribute('type', opciones).catch(() => null);
    if (tipo === 'file' || tipo === 'date' || tipo === 'color' || tipo === 'range') {
      return llenar.call(this, valor, opciones);
    }
    await this.click(opciones);
    await this.press('Control+a');
    await this.press('Backspace');
    if (valor) await this.pressSequentially(valor, { delay: TECLA_MS });
  };
  const tipear = Teclado.type;
  Teclado.type = function (texto: string, opciones: { delay?: number } = {}) {
    return tipear.call(this, texto, { ...opciones, delay: Math.max(opciones.delay ?? 0, TECLA_MS) });
  };
  // Pegar de golpe no lo hace nadie que escribe: se inserta carácter por
  // carácter. El propio tipeo usa esta función para las letras que no están
  // en el teclado, como las acentuadas, de a una por vez
  const insertar = Teclado.insertText;
  Teclado.insertText = async function (texto: string) {
    const caracteres = [...texto];
    for (const [i, c] of caracteres.entries()) {
      await insertar.call(this, c);
      if (i < caracteres.length - 1) await new Promise(r => setTimeout(r, TECLA_MS));
    }
  };

  // Playwright lleva el ratón al elemento de un salto y aprieta en el acto, y el
  // puntero dibujado tarda en desplazarse: el clic se vería antes de que llegue.
  // Antes de cada clic, el puntero recorre el camino hasta el elemento y se detiene ahí
  const acercarse = async (localizador: any, opciones: { position?: { x: number; y: number } } = {}) => {
    const pagina = localizador.page();
    const caja = await localizador.boundingBox({ timeout: 5000 }).catch(() => null);
    if (!caja) return;
    const x = caja.x + (opciones.position?.x ?? caja.width / 2);
    const y = caja.y + (opciones.position?.y ?? caja.height / 2);
    await pagina.mouse.move(x, y, { steps: 18 });
    await new Promise(r => setTimeout(r, LLEGADA_MS));
  };
  for (const m of ['click', 'dblclick', 'check', 'uncheck', 'setChecked', 'hover', 'tap']) {
    const original = Localizador[m];
    Localizador[m] = async function (this: any, ...args: any[]) {
      const opciones = (m === 'setChecked' ? args[1] : args[0]) ?? {};
      if (!opciones.trial) {
        await this.waitFor({ state: 'visible', timeout: opciones.timeout }).catch(() => {});
        await acercarse(this, opciones);
      }
      return original.apply(this, args);
    };
  }

  // Cada acción sobre la página que se graba queda anotada con su momento
  const Raton = Object.getPrototypeOf(pagina.mouse);
  const esDeLaPrincipal = {
    pagina: (p: any) => p === principal,
    localizador: (l: any) => { try { return l.page() === principal; } catch { return false; } },
    teclado: (t: any) => t === principal?.keyboard,
    raton: (r: any) => r === principal?.mouse,
  };
  const anotar = (clase: any, metodos: string[], esDeElla: (x: any) => boolean) => {
    for (const m of metodos) {
      const original = clase[m];
      if (typeof original !== 'function') continue;
      clase[m] = async function (this: any, ...args: unknown[]) {
        if (!esDeElla(this)) return original.apply(this, args);
        const inicio = Date.now() - t0;
        try { return await original.apply(this, args); }
        finally {
          const fin = Date.now() - t0;
          if (m === 'screenshot') {
            // Mientras se captura la página entera, el navegador se redimensiona: ese tramo se corta.
            // Lo que queda es la pantalla que respalda el veredicto, un momento después de capturarla
            acciones.push([inicio / 1000, fin / 1000, 'corte']);
            acciones.push([fin / 1000, fin / 1000 + 1.5, m]);
          } else {
            acciones.push([inicio / 1000, fin / 1000, m]);
          }
        }
      };
    }
  };
  anotar(Localizador, ['click', 'dblclick', 'fill', 'press', 'pressSequentially', 'check', 'uncheck', 'setChecked',
    'selectOption', 'hover', 'dragTo', 'tap', 'setInputFiles'], esDeLaPrincipal.localizador);
  anotar(Pagina, ['goto', 'reload', 'click', 'fill', 'press', 'dragAndDrop', 'hover', 'selectOption', 'screenshot'], esDeLaPrincipal.pagina);
  anotar(Teclado, ['press', 'type', 'insertText', 'down', 'up'], esDeLaPrincipal.teclado);
  anotar(Raton, ['move', 'down', 'up', 'click', 'wheel'], esDeLaPrincipal.raton);
}

/**
 * Lo que hizo la prueba sobre la página que se graba, en segundos desde que se
 * abrió: con eso se acortan en el video los tramos en que no se hizo nada
 * (`videos.reporter.ts`), sin tocar el ritmo de lo que sí se hizo.
 */
let principal: import('@playwright/test').Page | undefined;
let t0 = 0;
let acciones: [number, number, string][] = [];

export const test = base.extend<{}, { humano: void }>({
  context: async ({ context }, use) => {
    await context.addInitScript(PUNTERO);
    await use(context);
  },
  page: async ({ page }, use, testInfo) => {
    principal = page;
    t0 = Date.now();
    acciones = [];
    await use(page);
    await testInfo.attach('acciones', { body: JSON.stringify(acciones), contentType: 'application/json' });
    principal = undefined;
  },
  // Se instala al arrancar cada proceso de pruebas, antes de cualquier test
  humano: [async ({ browser }, use) => {
    const contexto = await browser.newContext();
    comoPersona(await contexto.newPage());
    await contexto.close();
    await use();
  }, { auto: true, scope: 'worker' }],
});

export { expect };
export { request } from '@playwright/test';
export type { Page, Locator, Browser, APIRequestContext } from '@playwright/test';
