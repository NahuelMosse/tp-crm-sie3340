import { Browser, Page } from '@playwright/test';
import { Fuente } from './evaluar';

/**
 * Constancia documental de un criterio.
 *
 * Lo que no se puede comprobar ejercitando el sistema se resuelve consultando
 * la fuente oficial. La sección 3 exige el texto del fabricante, y este módulo
 * hace que ese texto no se pueda inventar: abre la página, **comprueba que el
 * fragmento está publicado** y devuelve el párrafo completo que lo contiene.
 * Si el texto no está, el test falla en vez de registrar una cita inventada.
 */

export const CAPTURAS = 'evidencia';

interface Pedido {
  /** Dirección oficial que responde el criterio */
  url: string;
  /** Fragmento distintivo que debe estar publicado en esa página */
  buscar: string | RegExp;
  /** Nombre de la captura, sin carpeta ni extensión */
  captura: string;
}

/**
 * Abre la página, localiza el fragmento y devuelve la cita textual con su
 * captura. Falla si el fragmento no está: es lo que convierte la cita en
 * constancia y no en afirmación.
 */
export async function citar(navegador: Browser, p: Pedido): Promise<Fuente> {
  const contexto = await navegador.newContext({ locale: 'es-AR', viewport: { width: 1440, height: 1600 } });
  const pagina = await contexto.newPage();
  try {
    await pagina.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await pagina.waitForTimeout(2500);

    const cita = await extraer(pagina, p.buscar);
    if (!cita) {
      throw new Error(
        `La fuente no sostiene el veredicto: en ${p.url} no está publicado «${p.buscar}». ` +
        `Hay que encontrar la página que sí lo dice, o revisar el veredicto.`,
      );
    }

    const archivo = `${p.captura}.png`;
    await pagina.screenshot({ path: `${CAPTURAS}/${archivo}`, fullPage: true });
    console.log(`    fuente: ${p.url}\n      «${cita.slice(0, 160)}${cita.length > 160 ? '…' : ''}»`);

    // El día calendario de quien consulta, no el de UTC: a la noche serían días distintos
    return { url: p.url, cita, consultado: new Date().toLocaleDateString('sv-SE'), captura: archivo };
  } finally {
    await contexto.close();
  }
}

/**
 * Párrafo publicado que contiene el fragmento buscado.
 *
 * Devuelve el bloque de texto completo y no solo la coincidencia: una frase
 * suelta se puede leer al revés de lo que dice su contexto.
 */
async function extraer(pagina: Page, buscar: string | RegExp): Promise<string | null> {
  const coincide = typeof buscar === 'string'
    ? (t: string) => t.toLowerCase().includes(buscar.toLowerCase())
    : (t: string) => buscar.test(t);

  // Los fragmentos de texto se unen con un espacio: dos bloques contiguos no
  // quedan pegados ("$395.00" y "1 Year" no se leen "$395.001 Year")
  //
  // Primero los párrafos y los ítems de lista: es donde se escribe el texto corrido
  const bloques: string[] = await pagina.evaluate(() => {
    const etiquetas = 'p, li, td, th, h1, h2, h3, h4, dd, dt, blockquote, figcaption';
    return [...document.querySelectorAll(etiquetas)]
      .filter(e => !e.querySelector(etiquetas))          // solo las hojas: si no, se repite el texto
      .map(e => {
        // Entre dos fragmentos va un espacio cuando en pantalla se ven separados:
        // uno flota, o está en un bloque que no contiene al otro. Dentro de una
        // misma línea no, para no partir una palabra en negrita ni despegar un punto
        const aparte = (el: Element | null, otro: Element | null) => {
          if (!el || !otro || el.contains(otro)) return false;
          const estilo = getComputedStyle(el);
          return estilo.float !== 'none' || !estilo.display.startsWith('inline');
        };
        let texto = '', padreAnterior: Element | null = null;
        const recorrido = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        while (recorrido.nextNode()) {
          const nodo = recorrido.currentNode, padre = nodo.parentElement;
          const separados = padre !== padreAnterior && (aparte(padre, padreAnterior) || aparte(padreAnterior, padre));
          texto += (texto && separados ? ' ' : '') + (nodo.nodeValue ?? '');
          padreAnterior = padre;
        }
        return texto.replace(/\s+/g, ' ').trim();
      })
      .filter(t => t.length > 2);
  });
  const enParrafo = bloques.find(coincide);
  if (enParrafo) return enParrafo;

  // Las tablas de precios se arman con bloques genéricos. Se toma el más chico
  // que contenga el fragmento con algo de contexto: un precio suelto no dice
  // de qué plan es.
  const todos: string[] = await pagina.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .map(e => {
        // Entre dos fragmentos va un espacio cuando en pantalla se ven separados:
        // uno flota, o está en un bloque que no contiene al otro. Dentro de una
        // misma línea no, para no partir una palabra en negrita ni despegar un punto
        const aparte = (el: Element | null, otro: Element | null) => {
          if (!el || !otro || el.contains(otro)) return false;
          const estilo = getComputedStyle(el);
          return estilo.float !== 'none' || !estilo.display.startsWith('inline');
        };
        let texto = '', padreAnterior: Element | null = null;
        const recorrido = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        while (recorrido.nextNode()) {
          const nodo = recorrido.currentNode, padre = nodo.parentElement;
          const separados = padre !== padreAnterior && (aparte(padre, padreAnterior) || aparte(padreAnterior, padre));
          texto += (texto && separados ? ' ' : '') + (nodo.nodeValue ?? '');
          padreAnterior = padre;
        }
        return texto.replace(/\s+/g, ' ').trim();
      })
      .filter(t => t.length >= 40 && t.length <= 600));
  const bloque = todos.filter(coincide).sort((a, b) => a.length - b.length)[0];
  if (bloque) return bloque;

  // Un precio o una cifra suelta vive en un elemento muy corto, lejos del nombre de su plan:
  // se sube por los contenedores del elemento más chico que lo contiene mientras el texto
  // siga siendo un fragmento acotado, y se devuelve el más amplio
  return pagina.evaluate((patron: { fuente: string; banderas: string } | string) => {
    const re = typeof patron === 'string' ? null : new RegExp(patron.fuente, patron.banderas);
    const coincideTexto = (t: string) => re ? re.test(t) : t.toLowerCase().includes(String(patron).toLowerCase());
    const limpio = (e: Element) => (e.textContent ?? '').replace(/\s+/g, ' ').trim();
    const hojas = [...document.querySelectorAll('body *')].filter(e => coincideTexto(limpio(e)) && ![...e.children].some(h => coincideTexto(limpio(h))));
    for (const hoja of hojas) {
      let mejor: string | null = null;
      for (let e: Element | null = hoja; e && limpio(e).length <= 1000; e = e.parentElement) mejor = limpio(e);
      if (mejor && mejor.length >= 40) return mejor;
    }
    return null;
  }, typeof buscar === 'string' ? buscar : { fuente: buscar.source, banderas: buscar.flags });
}
