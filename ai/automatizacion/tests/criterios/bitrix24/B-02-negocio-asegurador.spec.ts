import { test, expect } from '../../humano';
import { chromium } from '@playwright/test';
import type { Browser, Locator, Response } from '@playwright/test';
import { registrar } from '../../evaluar';
import type { Fuente } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, BITRIX24_STANDARD, BITRIX24_PROFESSIONAL, constanciaDe, conPlanDe } from '../../precios';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, campoDeNegociacion, rest, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones, BASE } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';
import { irAContactos, borrarContactos, contactos } from '../../bitrix24/actividades';
import { panelListo as esperarPanel } from '../../bitrix24/navegar';
import { asegurarCampos, abrirListado, abrirFiltro, reiniciarFiltro, filtrarLista, buscarConFiltro, filasDelListado } from '../../bitrix24/negociaciones';
import { cargar, borrarVol, cuantosVol } from '../../bitrix24/volumen';

/**
 * B.2 — Condiciones que impone el negocio asegurador, sobre Bitrix24
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 */

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'non-use of the Bitrix24 Customer Account for fifty (50) consecutive calendar days',
    captura: 'B-2-1-bitrix24-1-cincuenta-dias',
  });
  const fuenteGratis = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'remains under the Free Plan',
    captura: 'B-2-1-bitrix24-2-solo-edicion-gratuita',
  });
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'B-2-1-bitrix24-basic');

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 0,
    resumen:
      'Las condiciones de servicio permiten dar de baja la cuenta, con sus datos, tras cincuenta días corridos sin uso.',
    comoLoHace:
      'Las condiciones de servicio del fabricante habilitan la baja de la cuenta, con sus datos, después ' +
      'de cincuenta días corridos sin uso.',
    justificacion:
      'Una póliza vigente puede pasar mucho más que cincuenta días sin que nadie la consulte —está ' +
      'vigente, pero no requiere actividad—, y ese silencio pone en riesgo toda la cartera, no solo el ' +
      'registro inactivo. La compañía tiene que sostener un ingreso periódico solo para conservar datos ' +
      'que de otro modo no necesitarían ninguna atención.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      justificacion:
        'La baja por falta de uso solo rige mientras la cuenta sigue en la edición gratuita: las ' +
        'condiciones la condicionan a que, vencido el plazo, la cuenta «remains under the Free Plan». ' +
        'Con el plan Basic, el más barato de los pagos, esa baja deja de aplicar y los datos se conservan ' +
        'aunque nadie ingrese.',
    })],
    documentacion: [fuente, fuenteGratis, ...precio],
  });
});

// ── B.2.2────────────────────────────────────────────────────────────────────
test('B.2.2 — Copia propia y completa de la cartera', async ({ page, browser }, info) => {
  // «Obtener una copia de toda la información, incluidos los archivos
  //  adjuntos, y comprobar que puede restituirse»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capListado = await capturar(page, 'B.2.2', plataforma, '1-listado');

  // El botón de exportar del listado, tal como lo usaría un administrador
  const masAcciones = page.locator('[class*="menu"], button').filter({ hasText: /^Más$|^Acciones$/i }).filter({ visible: true }).first();
  let exportarVisible = await page.getByText(/^Exportar$/i).filter({ visible: true }).first().isVisible().catch(() => false);
  if (!exportarVisible && await masAcciones.isVisible().catch(() => false)) {
    await masAcciones.click();
    await page.waitForTimeout(800);
    exportarVisible = await page.getByText(/^Exportar$/i).filter({ visible: true }).first().isVisible().catch(() => false);
  }
  const capExportar = await capturar(page, 'B.2.2', plataforma, '2-opcion-de-exportar');

  const fila = await citar(browser, {
    url: 'https://www.bitrix24.es/prices/compare_cloud_plans.php',
    buscar: 'Opción para exportar contactos a CSV, Excel y Outlook',
    captura: 'B-2-2-bitrix24-3-comparacion-de-planes',
  });
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'B-2-2-bitrix24-basic');

  registrar({
    criterio: 'B.2.2',
    plataforma,
    cumple: 0,
    resumen:
      'La edición gratuita no ofrece ningún medio para sacar una copia de la cartera: la exportación y la interfaz de programación para otros sistemas exigen un plan pago.',
    comoLoHace:
      'El listado de negociaciones, que en la edición gratuita hace de cartera de pólizas, no ofrece una ' +
      `acción «Exportar» habilitada${exportarVisible ? ' (aparece en el menú, pero la exportación pide un plan superior)' : ''}. ` +
      'La exportación de contactos pide actualizar a un plan superior y el webhook entrante, que es el ' +
      'camino para que otro sistema lea los datos, no está disponible en el plan actual. El respaldo diario ' +
      'del fabricante no se descarga: solo se restituye pidiéndolo a soporte.',
    justificacion:
      'Para la compañía no hay función del producto que entregue una copia de su cartera: la exportación y ' +
      'el acceso desde otros sistemas son de planes pagos, y el respaldo es del fabricante y no se puede ' +
      'bajar. Lo único que devuelve los datos completos es la llamada interna que usan las pantallas del ' +
      'portal, que solo un programador puede invocar desde la consola del navegador: no es una función ' +
      'ofrecida al usuario, así que no cuenta como medio.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 1,
      justificacion:
        'El plan Basic incluye la exportación de contactos a CSV, Excel y Outlook, con lo que una parte de ' +
        'la cartera se puede sacar del sistema. El reparo es que el fabricante solo publica esa opción para ' +
        'contactos, y los archivos adjuntos se siguen bajando uno por uno. La interfaz de programación ' +
        'completa llega recién con el plan Basic Vibe+.',
    })],
    evidencia: [capListado, capExportar],
    documentacion: [fila, ...precio],
  });
});

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Copia periódica sin intervención manual', async ({ browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25110238/',
    buscar: /daily backups/i,
    captura: 'B-2-3-bitrix24-1-copias-diarias-automaticas',
  });

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 0,
    resumen: 'La compañía no puede programar una copia propia de la cartera: la única copia periódica la genera el fabricante, la conserva siete días y no se puede descargar.',
    comoLoHace:
      'El propio fabricante genera una copia diaria de toda la cuenta, sin que nadie la programe ni la ' +
      'ejecute: no es una tarea que la compañía tenga que sostener.',
    caracteristicas:
      'Esa copia la administra el fabricante y no la compañía, se conserva solo siete días, y restituir una ' +
      'fecha concreta depende de pedirlo a soporte y de que el plan contratado lo permita, así que la ' +
      'compañía no controla ni la retención ni la restitución de su propio resguardo.',
    justificacion: 'El procedimiento pide programar la copia propia de B.2.2, y en la edición gratuita esa copia no existe: la copia diaria del fabricante no la controla ni la conserva la compañía.',
    documentacion: fuente,
  });
});

// ── B.2.4 ────────────────────────────────────────────────────────────────────
/**
 * El veredicto de B.2.4 se fija a la vista de la medición, con la pregunta de
 * la sección 4.7: ¿la búsqueda responde sin espera perceptible, con una demora
 * que el usuario nota y tolera, o de forma impracticable? No hay un corte en
 * segundos que lo decida: elegir ese número sería decidir el resultado. Hasta
 * que se fija, el test mide, informa y no registra nada.
 */
const VEREDICTO_B14: null | { cumple: 2 | 1 | 0 } = { cumple: 0 };

/**
 * El tiempo con el que se fijó el veredicto. No lo decide: si una corrida lo
 * supera con holgura, el test se detiene para que el veredicto se vuelva a mirar.
 */
const MEDIDO_B14 = { texto: 0.5 };

/**
 * Cuánto tardó el servidor en responder un pedido, en segundos: desde que sale
 * hasta que llega entera la respuesta. No cuenta el ritmo de la prueba ni las
 * pausas entre acciones, que no son del sistema.
 */
async function demora(r: Response) {
  await r.finished();
  return r.request().timing().responseEnd / 1000;
}

test('B.2.4 — Búsqueda y operación con volumen productivo', async ({ page }, info) => {
  // «Cargar la cartera de referencia, buscar un registro por texto y repetir el
  //  filtrado por campo: determinar si responde sin espera perceptible, con una
  //  demora que el usuario nota y tolera, o de forma impracticable»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(10_800_000);

  // La cartera de referencia de la sección 4.7: 25.000 registros, cargados por la
  // interfaz de programación (no se ve en el video). Todo lleva el prefijo «VOL».
  const escala = Number(process.env.B14_ESCALA ?? 1);
  const CARTERA = { contactos: Math.round(5_000 * escala), polizas: Math.round(12_500 * escala), reclamos: Math.round(7_500 * escala) };
  const RAMOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];

  await entrar(page, plataforma);
  await asegurarCampos(page, [{ tipo: 'Lista', nombre: 'Ramo', valores: RAMOS }]);
  const ramo = await campoDeNegociacion(page, 'Ramo');
  const opcion = (r: string) => String(ramo.LIST.find((l: any) => l.VALUE === r)?.ID);

  // La carga y la baja de la cartera van por la interfaz de programación, en un navegador aparte que no
  // se graba: el video muestra solo lo que una persona hace con el listado
  const navegadorDeApoyo: Browser = await chromium.launch();
  const contextoDeApoyo = await navegadorDeApoyo.newContext({ storageState: 'auth-bitrix.json', baseURL: BASE });
  const apoyo = await contextoDeApoyo.newPage();
  await apoyo.goto('/', { waitUntil: 'domcontentloaded' });
  await apoyo.waitForFunction(() => (window as any).BX?.rest?.callMethod, null, { timeout: 90_000 });

  // Mientras se carga, la página grabada queda en blanco: el portal se redibuja sin parar y el video pesaría cientos de megas
  await page.goto('about:blank');
  const inicioCarga = Date.now();
  const medidas: Record<string, number[]> = { texto: [], filtro: [] };
  const hallazgos: string[] = [];
  try {
    await borrarVol(apoyo, 'crm.deal', 'TITLE');
    await borrarVol(apoyo, 'crm.contact', 'LAST_NAME');

    const pad = (n: number) => String(n).padStart(5, '0');
    const contactos = await cargar(apoyo, 'crm.contact.add', CARTERA.contactos,
      n => ({ NAME: `Asegurado ${n}`, LAST_NAME: `VOL-${pad(n)}` }));
    const cargados = { contactos: contactos.ids.length, polizas: 0, reclamos: 0 };
    let detenida = contactos.error ? `contactos: ${contactos.error.texto} (tras ${contactos.error.en} altas)` : '';
    const inicioNegociaciones = Date.now();
    if (!detenida) {
      const polizas = await cargar(apoyo, 'crm.deal.add', CARTERA.polizas, n => ({
        TITLE: `VOL-POL-${n}`, CONTACT_ID: contactos.ids[(n - 1) % contactos.ids.length], [ramo.FIELD_NAME]: opcion(RAMOS[n % RAMOS.length]),
      }));
      cargados.polizas = polizas.ids.length;
      if (polizas.error) detenida = `pólizas: ${polizas.error.texto} (tras ${polizas.error.en} altas)`;
    }
    if (!detenida) {
      const reclamos = await cargar(apoyo, 'crm.deal.add', CARTERA.reclamos, n => ({ TITLE: `VOL-RECLAMO-${n}` }));
      cargados.reclamos = reclamos.ids.length;
      if (reclamos.error) detenida = `reclamos: ${reclamos.error.texto} (tras ${reclamos.error.en} altas)`;
    }
    const minutosCarga = Math.round((Date.now() - inicioCarga) / 60_000);
    console.log(`    B.2.4 carga: ${JSON.stringify(cargados)} · ${minutosCarga} min · ${detenida ? `DETENIDA ${detenida}` : 'completa'}`);
    if (detenida) hallazgos.push(`carga detenida: ${detenida}`);

    // Cada consulta del listado es un pedido al servidor; se toma el más largo de los que salen al buscar
    const pedidos: Response[] = [];
    page.on('response', r => {
      const t = r.request().resourceType();
      if ((t === 'xhr' || t === 'fetch') && /bitrix/.test(r.url())) pedidos.push(r);
    });
    const medir = async () => {
      const lista = pedidos.splice(0).filter(r => !/pull|push|counter|stat|ping/i.test(r.url()));
      const tiempos = await Promise.all(lista.map(async r => ({ u: r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 90), s: await demora(r).catch(() => 0) })));
      tiempos.sort((a, b) => b.s - a.s);
      console.log(`      pedidos: ${tiempos.slice(0, 4).map(t => `${t.s.toFixed(2)}s ${t.u}`).join(' | ')}`);
      return tiempos[0]?.s ?? NaN;
    };
    const hallados: Record<string, boolean> = {};
    const avisos = async () => {
      const t = await textoDe(page);
      return (t.match(/[^\n]*(l[ií]mite|limit reached|restring|\bplanes?\b|mil registros|1\.?000)[^\n]*/gi) ?? []).filter(l => !/Mejore su plan|Pruébelo|Actualizar/i.test(l)).slice(0, 5);
    };

    // El buscador del listado avisa si el plan alcanzó su límite de búsqueda: se abre el aviso con un clic en el campo
    const limiteDeBusqueda = async (entrada: Locator, etiqueta: string) => {
      const marca = await entrada.getAttribute('placeholder').catch(() => '');
      const visible = /limit reached|l[ií]mite/i.test(marca ?? '') || /Alcanz[oó] el l[ií]mite/.test(await textoDe(page));
      if (!visible) return null;
      await entrada.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2500);
      const texto = (await textoDe(page)).match(/Alcanz[oó] el l[ií]mite de b[uú]squeda[^\n]*/)?.[0] ?? marca ?? '';
      const cap = await capturar(page, 'B.2.4', plataforma, `limite-${etiqueta}`);
      await page.keyboard.press('Escape');
      return { texto, cap };
    };
    const limites: { donde: string; texto: string; cap: string }[] = [];
    const seg = (s: number) => Number.isNaN(s) ? 'sin medir' : s.toFixed(2);

    await entrar(page, plataforma);
    // El aviso de límite no aparece al instante de superar las mil: se espera, recargando y mirando el buscador
    const bloqueoVisible = async () => {
      const entrada = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
      await entrada.waitFor({ state: 'visible', timeout: 60_000 });
      const marca = await entrada.getAttribute('placeholder').catch(() => '');
      return /limit reached|l[ií]mite/i.test(marca ?? '') || /Alcanz[oó] el l[ií]mite de b[uú]squeda de negociaciones/.test(await textoDe(page));
    };
        let minutosHastaBloqueo = -1;
    await abrirListado(page);
    for (let intento = 0; intento <= 12; intento++) {
      if (intento > 0) {
        await page.waitForTimeout(300_000);
        await page.reload();
        await abrirListado(page);
      }
      if (await bloqueoVisible()) { minutosHastaBloqueo = Math.round((Date.now() - inicioNegociaciones) / 60_000); break; }
      console.log(`    B.2.4 espera del bloqueo: ${Math.round((Date.now() - inicioNegociaciones) / 60_000)} min sin aviso`);
    }
    if (minutosHastaBloqueo < 0) {
      throw new Error(`B.2.4: el aviso de límite de búsqueda de negociaciones no apareció en 60 minutos tras la carga (${JSON.stringify(cargados)}); no se registra`);
    }
    console.log(`    B.2.4 bloqueo visible ${minutosHastaBloqueo} min después de empezar a cargar negociaciones`);

    await irAContactos(page);
    const buscador = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
    await buscador.waitFor({ state: 'visible', timeout: 60_000 });
    // Uno de los primeros cargados y dos de más allá de los primeros mil
    for (const buscado of ['VOL-00777', 'VOL-04321', 'VOL-02468']) {
      const antesDeBuscar = await limiteDeBusqueda(buscador, 'contactos');
      if (antesDeBuscar) {
        limites.push({ donde: `contactos, antes de buscar ${buscado}`, ...antesDeBuscar });
        console.log(`    B.2.4 AVISO en Contactos: ${antesDeBuscar.texto} (${antesDeBuscar.cap})`);
        // Con el buscador bloqueado no hay más búsquedas que medir
        break;
      }
      await buscador.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(3000);
      pedidos.length = 0;
      await page.keyboard.type(buscado, { delay: 90 });
      await page.keyboard.press('Enter');
      const fila = page.locator('tr.main-grid-row-body a').filter({ hasText: buscado }).filter({ visible: true }).first();
      hallados[buscado] = await fila.waitFor({ state: 'visible', timeout: 60_000 }).then(() => true, () => false);
      await page.waitForTimeout(1500);
      const s = await medir();
      medidas.texto.push(s);
      console.log(`    B.2.4 texto ${buscado}: ${hallados[buscado] ? 'encontrado' : 'NO encontrado'} · ${seg(s)} s · avisos: ${(await avisos()).join(' // ') || 'ninguno'}`);
    }
    const capTexto = await capturar(page, 'B.2.4', plataforma, '1-busqueda-por-texto');

    await abrirListado(page);
    const buscadorNegociaciones = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
    await buscadorNegociaciones.waitFor({ state: 'visible', timeout: 60_000 });
    const bloqueo = await limiteDeBusqueda(buscadorNegociaciones, 'negociaciones');
    if (!bloqueo) throw new Error('B.2.4: el aviso de límite desapareció antes de operar el listado de negociaciones');
    limites.push({ donde: 'negociaciones', ...bloqueo });
    console.log(`    B.2.4 AVISO en Negociaciones: ${bloqueo.texto} (${bloqueo.cap})`);

    // (a) Búsqueda por texto de una póliza de la cartera
    const buscada = 'VOL-POL-12345';
    await buscadorNegociaciones.click({ force: true });
    await page.keyboard.type(buscada, { delay: 90 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    const titulosTrasBuscar = await filasDelListado(page, /./);
    const filtroPorTexto = titulosTrasBuscar.length > 0 && titulosTrasBuscar.every(t => t.includes(buscada));
    console.log(`    B.2.4 búsqueda por texto de ${buscada}: ${titulosTrasBuscar.length} filas, filtra: ${filtroPorTexto}, avisos: ${(await avisos()).join(' // ') || 'ninguno'}`);
    const capBusquedaNeg = await capturar(page, 'B.2.4', plataforma, '3-busqueda-por-texto-de-una-poliza');
    await page.keyboard.press('Escape');

    // (b) Filtro por campo: el aviso tapa el panel
    await page.locator('.main-ui-filter-search').first().click({ force: true });
    await page.waitForTimeout(2500);
    const campoNombre = page.locator('.main-ui-filter-field-container, .main-ui-filter-wield-with-label, .main-ui-control-field-label').filter({ hasText: /^\s*Nombre\s*$/ }).filter({ visible: true }).first();
    let tapado = '';
    if (await campoNombre.count()) {
      const caja = await campoNombre.boundingBox();
      if (caja) {
        const x = caja.x + caja.width / 2, y = caja.y + caja.height / 2;
        tapado = await page.evaluate(([px, py]) => {
          const e = document.elementFromPoint(px, py);
          return e ? `${e.tagName}.${String(e.className).split(' ')[0]}` : '';
        }, [x, y]);
        await page.mouse.move(x, y, { steps: 12 });
        await page.waitForTimeout(500);
        await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up();
        await page.waitForTimeout(1500);
      }
    }
    console.log(`    B.2.4 clic real sobre «Nombre» del filtro: cae en ${tapado || 'sin campo visible'}`);
    const capFiltroCampo = await capturar(page, 'B.2.4', plataforma, '4-filtro-por-campo-tapado-por-el-aviso');
    const avisoTapa = /limit/i.test(tapado);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);

    // (c) Filtro predeterminado: se aplica con un clic
    await page.locator('.main-ui-filter-search').first().click({ force: true });
    await page.waitForTimeout(2500);
    await page.getByText('Negociaciones en progreso', { exact: true }).filter({ visible: true }).first().click();
    await page.waitForTimeout(5000);
    const enProgreso = await filasDelListado(page, /./);
    console.log(`    B.2.4 filtro predeterminado «Negociaciones en progreso»: ${enProgreso.length} filas`);
    const capPredeterminado = await capturar(page, 'B.2.4', plataforma, '5-filtro-predeterminado-negociaciones-en-progreso');
    const capFiltro = capPredeterminado;
    if (filtroPorTexto) hallazgos.push(`la búsqueda por texto de ${buscada} filtró igual`);
    if (!avisoTapa) hallazgos.push(`el aviso no tapó «Nombre» (${tapado || 'sin campo'})`);
    for (const l of limites) hallazgos.push(`aviso del sistema (${l.donde}): ${l.texto}`);

    const lectura = `texto ${medidas.texto.map(seg).join(' / ')} s (${Object.entries(hallados).map(([k, v]) => `${k} ${v ? 'sí' : 'no'}`).join(', ')}) · ` +
                    `filtro ${medidas.filtro.length ? medidas.filtro.map(s => s.toFixed(1)).join(' / ') + ' s' : 'sin medir'} · carga ${JSON.stringify(cargados)} en ${minutosCarga} min · bloqueo a los ${minutosHastaBloqueo} min de empezar la carga de negociaciones${hallazgos.length ? ` · ${hallazgos.join('; ')}` : ''}`;
    console.log(`    B.2.4 medición: ${lectura}`);
    if (!VEREDICTO_B14) throw new Error(`B.2.4: fijar el veredicto a la vista de la medición (${lectura})`);
    const lejos = medidas.texto.length > 0 && Math.max(...medidas.texto) > 2 * MEDIDO_B14.texto;
    if (lejos) throw new Error(`B.2.4: la búsqueda de contactos cambió respecto de la que sostiene el veredicto; volver a mirarlo (${lectura})`);
    const bloqueada = limites.find(l => /l[ií]mite de b[uú]squeda de negociaciones \(1000\)/i.test(l.texto));
    const bloqueoContactos = limites.find(l => /l[ií]mite de b[uú]squeda de contactos \(1000\)/i.test(l.texto));
    // Un buscador de contactos bloqueado es un resultado válido; el que no lo está debe haber encontrado a los tres
    if (!bloqueada || (!bloqueoContactos && !Object.values(hallados).every(Boolean)) || detenida) {
      throw new Error(`B.2.4: no se reprodujo el bloqueo que sostiene el veredicto; revisar (${lectura})`);
    }
    const coma = (n: number) => n.toFixed(2).replace('.', ',');
    const lista =(v: number[]) => v.length < 2 ? v.map(coma).join('') : `${v.slice(0, -1).map(coma).join(', ')} y ${coma(v[v.length - 1])}`;
    const aviso = `mostró el aviso «Alcanzó el límite de búsqueda de negociaciones (1000)» ${minutosHastaBloqueo} minutos después de empezar a cargar las negociaciones, con las mil superadas desde los primeros minutos: la búsqueda por texto dejó de filtrar y el aviso tapa los campos del filtro, de modo que solo quedan los filtros predeterminados, como las negociaciones en progreso o las cerradas`;
    const trasContactos = bloqueoContactos
      ? (medidas.texto.length
          ? ', y más tarde el listado de contactos mostró el mismo bloqueo: «Alcanzó el límite de búsqueda de contactos (1000)»'
          : ', y el listado de contactos mostró el mismo bloqueo desde la primera búsqueda: «Alcanzó el límite de búsqueda de contactos (1000)»')
      : '';

    registrar({
      criterio: 'B.2.4',
      plataforma,
      cumple: VEREDICTO_B14.cumple,
      resumen:
        'Con más de mil ventas registradas, que en el plan gratuito incluyen las pólizas y los reclamos, deja de buscar por texto y de filtrar por campo; solo quedan los filtros predeterminados.',
      comoLoHace:
        'Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil ' +
        'quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los ' +
        'días: buscar un asegurado por texto y filtrar las pólizas por ramo.',
      caracteristicas:
        (medidas.texto.length ? `Con la cartera cargada, buscar un asegurado por texto respondió en ${lista(medidas.texto)} segundos. ` : '') +
        `En el listado de negociaciones, donde la edición gratuita lleva las pólizas y los reclamos, ${aviso}${trasContactos}.` +
        '',
      justificacion:
        'Con más de mil registros, la edición gratuita deja de buscar por texto y de filtrar por campo en el listado; solo quedan los filtros predeterminados, que no ubican una póliza ni un asegurado puntual. La compañía, con ' +
        'unas setecientas cincuenta pólizas por año y los reclamos de cinco años, supera ese número en las ' +
        'negociaciones, y lo superaría en los asegurados al crecer: la operación diaria sobre la cartera se ' +
        'vuelve impracticable.',
      evidencia: [bloqueada.cap, capBusquedaNeg, capFiltroCampo, capPredeterminado, capTexto, ...(bloqueoContactos ? [bloqueoContactos.cap] : [])],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    await page.goto('about:blank').catch(() => {});
    await borrarVol(apoyo, 'crm.deal', 'TITLE');
    await borrarVol(apoyo, 'crm.contact', 'LAST_NAME');
    const negociacionesVol = await cuantosVol(apoyo, 'crm.deal.list', 'TITLE');
    const contactosVol = await cuantosVol(apoyo, 'crm.contact.list', 'LAST_NAME');
    console.log(`    B.2.4 limpieza: quedan ${contactosVol} contactos y ${negociacionesVol} negociaciones VOL`);
    await navegadorDeApoyo.close();
  }
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'The terms of this Agreement may be updated by Alaio from time to time without notice',
    captura: 'B-2-5-bitrix24-1-sin-aviso-previo',
  });

  registrar({
    criterio: 'B.2.5',
    plataforma,
    cumple: 0,
    resumen:
      'El fabricante actualiza el portal de todos sus clientes a la vez y sus condiciones se reservan modificarse sin aviso previo.',
    comoLoHace:
      'En un servicio en la nube de versión única, el fabricante decide cuándo cambia el sistema: ' +
      'actualiza el portal de todos sus clientes a la vez, y sus propias condiciones de servicio se ' +
      'reservan el derecho de modificarse sin aviso previo.',
    justificacion:
      'La compañía no elige el momento del cambio, no lo prueba antes de que llegue a producción y puede ' +
      'encontrarse con una pantalla, un menú o un comportamiento distinto en medio de la atención, sin ' +
      'ninguna anticipación garantizada.',
    documentacion: fuente,
  });
});

// ── B.2.6 ────────────────────────────────────────────────────────────────────
test('B.2.6 — Alojamiento de los datos en un país con protección adecuada', async ({ browser }, info) => {
  // «Determinar en qué país quedan los datos de la compañía y si ese país tiene protección adecuada según la
  //  autoridad argentina, o si el fabricante ofrece las cláusulas contractuales aprobadas para transferirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const alojamiento = await citar(browser, {
    url: 'https://www.bitrix24.com/gdpr/',
    buscar: /Bitrix24\.es, .*accounts are hosted in the United States/,
    captura: 'B-2-6-bitrix24-1-alojamiento-en-estados-unidos',
  });
  const clausulas = await citar(browser, {
    url: 'https://www.bitrix24.com/privacy/',
    buscar: 'standard data protection clauses adopted by the European Commission',
    captura: 'B-2-6-bitrix24-2-clausulas-de-la-comision-europea',
  });
  // La página de la autoridad rearma su texto en el navegador y le pierde letras (la «s» queda en blanco): la cita
  // se toma del texto publicado que el servidor entrega, y la captura muestra la página tal como se ve
  const URL_ADECUADOS = 'https://www.argentina.gob.ar/normativa/nacional/267922/texto';
  const html = await (await fetch(URL_ADECUADOS, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
  const textoPublicado = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const articulo = textoPublicado.match(/ARTÍCULO 3° — A los fines de la aplicación de la presente disposición se consideran países con legislación adecuada a los siguientes:.*?(?=Esta enumeración)/)?.[0].trim();
  if (!articulo) throw new Error('La disposición de la autoridad argentina no publica la lista de países adecuados donde se esperaba');
  const contextoAr = await browser.newContext({ locale: 'es-AR', viewport: { width: 1440, height: 1600 } });
  const paginaAr = await contextoAr.newPage();
  await paginaAr.goto(URL_ADECUADOS, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await paginaAr.waitForTimeout(3000);
  await paginaAr.screenshot({ path: 'evidencia/B-2-6-bitrix24-3-paises-adecuados-segun-argentina.png', fullPage: true });
  await contextoAr.close();
  const adecuados: Fuente = { url: URL_ADECUADOS, cita: articulo, consultado: new Date().toLocaleDateString('sv-SE'), captura: 'B-2-6-bitrix24-3-paises-adecuados-segun-argentina.png' };
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'B-2-6-bitrix24-basic');

  expect(alojamiento.cita, 'el fabricante debe declarar el alojamiento en Estados Unidos para la zona .es').toMatch(/Bitrix24\.es/);
  expect(adecuados.cita, 'Estados Unidos no debe figurar entre los países adecuados').not.toMatch(/ESTADOS UNIDOS/i);

  registrar({
    criterio: 'B.2.6',
    plataforma,
    cumple: 0,
    resumen:
      'Los datos del portal quedan en Estados Unidos, que la autoridad argentina no reconoce como país adecuado, y la edición gratuita no ofrece mudarlos a la Unión Europea ni las cláusulas aprobadas en Argentina.',
    comoLoHace:
      'El fabricante declara que las cuentas de la zona Bitrix24.es se alojan en Estados Unidos. Ofrece un acuerdo de ' +
      'tratamiento de datos y, para las transferencias fuera de Europa, las cláusulas tipo de la Comisión Europea; ' +
      'no publica las cláusulas contractuales tipo que aprobó la autoridad argentina.',
    justificacion:
      'La disposición de la autoridad argentina reconoce como países adecuados a la Unión Europea y a un grupo ' +
      'de países, y Estados Unidos no figura. Los datos de la compañía, entre ellos los datos de salud de los seguros ' +
      'de personas, quedarían en un país sin protección adecuada y sin las cláusulas aprobadas para transferirlos. ' +
      'El fabricante reserva el traslado a los centros de datos de la Unión Europea a las cuentas comerciales.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      justificacion:
        'Con el plan Basic, el más barato de los comerciales, la compañía puede pedir al soporte del fabricante que ' +
        'traslade sus datos a los centros de datos de la Unión Europea, que la autoridad argentina reconoce como ' +
        'país adecuado.',
    })],
    documentacion: [alojamiento, clausulas, adecuados, ...precio],
  });
});

// ── B.2.7 ────────────────────────────────────────────────────────────────────
test('B.2.7 — Continuidad de la atención ante una caída del enlace', async ({ page, browser }, info) => {
  // «Interrumpir la conexión externa y determinar qué parte de la operación
  //  diaria sigue siendo posible»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  // Se entra primero con la conexión disponible, como cualquier jornada
  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');

  // Y después se corta el enlace: todo el portal vive afuera, así que no hay
  // ningún servidor propio al que seguir alcanzando
  await page.context().setOffline(true);
  let siguioFuncionando = false;
  try {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.waitForTimeout(3000);
    siguioFuncionando = await page.locator('nav[aria-label="Menú principal"]').first().isVisible().catch(() => false);
  } catch {
    siguioFuncionando = false;
  }
  const capSinEnlace = await capturar(page, 'B.2.7', plataforma, '1-sin-enlace').catch(() => '');
  await page.context().setOffline(false);

  expect(siguioFuncionando, 'sin infraestructura propia, el portal no debería seguir operable sin enlace').toBe(false);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/23839416/',
    buscar: 'Send messages and work with documents without an internet connection',
    captura: 'B-2-7-bitrix24-2-modo-sin-conexion-del-mensajero',
  });

  registrar({
    criterio: 'B.2.7',
    plataforma,
    cumple: 0,
    resumen:
      'Sin conexión el CRM deja de responder: no se puede consultar un asegurado ni registrar un reclamo. ' +
      'La aplicación de escritorio solo deja redactar mensajes y editar documentos, que se envían al volver ' +
      'el enlace.',
    comoLoHace:
      'Con la conexión externa cortada, el portal abierto en el navegador dejó de responder.',
    caracteristicas:
      'El fabricante documenta un modo sin conexión en su aplicación de escritorio para escribir mensajes y ' +
      'trabajar con documentos, que se sincronizan al volver el enlace. No alcanza al CRM.',
    justificacion:
      'La atención al asegurado depende del CRM, que en la edición evaluada vive entero en la nube del ' +
      'fabricante: mientras dura el corte no se puede atender. Lo que permite el modo sin conexión se envía ' +
      'recién al volver el enlace, así que no sostiene la atención.',
    evidencia: capSinEnlace ? [capSinEnlace] : [],
    documentacion: fuente,
    medicion: `Portal operable sin enlace externo: ${siguioFuncionando ? 'sí' : 'no'}`,
  });
});

// ── B.2.8 ────────────────────────────────────────────────────────────────────
test('B.2.8 — Atención de los derechos del titular de los datos', async ({ page, browser }, info) => {
  // «Sobre un asegurado con póliza, obtener de una vez todos sus datos, corregir uno y suprimir o bloquear la
  //  ficha, y comprobar qué constancia queda de cada pedido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarContactos(page, /^TIT-/);
  const id = await rest<number>(page, 'crm.contact.add', { fields: {
    NAME: 'TIT-Lucía', LAST_NAME: 'Fernández', PHONE: [{ VALUE: '+541155550000', VALUE_TYPE: 'WORK' }], EMAIL: [{ VALUE: 'tit@ejemplo.test', VALUE_TYPE: 'WORK' }] } });
  const poliza = await rest<number>(page, 'crm.deal.add', { fields: { TITLE: 'TIT-POL-1 Automotor', CONTACT_ID: id } });
  const abrirFicha = async () => {
    await irAContactos(page);
    await page.locator('a').filter({ hasText: /TIT-Lucía/ }).filter({ visible: true }).first().click();
    await esperarPanel(page, panel(page).getByText(/sobre el contacto/i).first());
  };

  try {
    // Acceso: la ficha muestra los datos en pantalla; sacarlos de una vez es exportar
    await abrirFicha();
    const capFicha = await capturar(page, 'B.2.8', plataforma, '1-ficha-del-asegurado');
    await cerrarPaneles(page);
    await irAContactos(page);
    await page.locator('tr').filter({ hasText: /TIT-Lucía/ }).locator('input[type="checkbox"]').first().click({ force: true });
    await page.mouse.click(1353, 97);
    await page.waitForTimeout(1500);
    await page.locator('.menu-popup-item-text').filter({ hasText: /^Exportar a CSV$/ }).filter({ visible: true }).first().click();
    await page.waitForTimeout(8000);
    const exportaPidePlan = page.frames().some(x => /limit_crm_free_export_contacts/.test(x.url()));
    const capExportar = await capturar(page, 'B.2.8', plataforma, '2-exportar-pide-plan');
    console.log(`    exportar contactos pide otro plan: ${exportaPidePlan}`);
    await page.reload();
    await page.waitForTimeout(4000);

    // Rectificación: se corrige el apellido en la ficha
    await abrirFicha();
    const f = panel(page);
    await f.getByText(/^editar$/i).filter({ visible: true }).first().click({ force: true });
    await page.waitForTimeout(1500);
    const apellido = f.locator('input[name="LAST_NAME"]').filter({ visible: true }).first();
    await apellido.click();
    await apellido.press('Control+a');
    await apellido.pressSequentially('Fernández Paz', { delay: 60 });
    await guardarFormulario(page);
    const corregido = await rest<any>(page, 'crm.contact.get', { id });
    console.log(`    apellido tras corregir: ${corregido.LAST_NAME} · modificado ${corregido.DATE_MODIFY} por ${corregido.MODIFY_BY_ID}`);

    // Constancia: la pestaña «Historial» de la ficha
    await f.getByText('Historial', { exact: true }).filter({ visible: true }).first().click({ force: true });
    await page.waitForTimeout(7000);
    const textoHistorial = await textoDe(page);
    const historialPidePlan = /historial\s+en\s+CRM\s+est\S+\s+disponible\s+solo\s+en\s+los\s+planes\s+Standard/i.test(textoHistorial);
    const capHistorial = await capturar(page, 'B.2.8', plataforma, '3-historial-pide-plan');
    console.log(`    historial pide otro plan: ${historialPidePlan}`);
    // El aviso se cierra con Escape, sin elegir ninguna de sus opciones
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    // Supresión: «Eliminar» en el menú de la ficha
    await f.locator('.ui-btn-icon-setting, [class*="setting"]').filter({ visible: true }).first().click({ force: true });
    await page.waitForTimeout(1500);
    // El menú y la confirmación se dibujan en el marco de la ficha o en el de la página, según el caso
    const enMarcos = async (selector: string, texto: RegExp) => {
      for (let i = 0; i < 30; i++) {
        for (const m of page.frames()) {
          const l = m.locator(selector).filter({ hasText: texto }).filter({ visible: true });
          if (await l.count().catch(() => 0)) return l.first();
        }
        await page.waitForTimeout(500);
      }
      throw new Error(`No apareció ${selector} con ${texto}`);
    };
    await (await enMarcos('.menu-popup-item-text', /^\s*Eliminar\s*$/)).click();
    await page.waitForTimeout(2000);
    const capConfirmacion = await capturar(page, 'B.2.8', plataforma, '4-confirmar-supresion');
    await (await enMarcos('.popup-window .popup-window-button, .popup-window .ui-btn, .popup-window button', /^\s*(Continuar|Eliminar|Sí|Aceptar|OK)\s*$/i)).click();
    await page.waitForTimeout(5000);
    const quedan = await contactos(page, /^TIT-/, ['ID', 'NAME', 'LAST_NAME']);
    const poliza2 = await rest<any>(page, 'crm.deal.get', { id: poliza });
    console.log(`    contactos que quedan tras suprimir: ${quedan.length} · la póliza sigue con contacto ${poliza2.CONTACT_ID}`);
    const capSuprimido = await capturar(page, 'B.2.8', plataforma, '5-tras-suprimir');

    expect(exportaPidePlan, 'la exportación del contacto debe pedir otro plan').toBeTruthy();
    expect(corregido.LAST_NAME, 'el apellido debe quedar corregido').toBe('Fernández Paz');
    expect(historialPidePlan, 'el historial debe pedir otro plan').toBeTruthy();
    expect(quedan.length, 'la ficha debe quedar suprimida').toBe(0);

    const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'B-2-8-bitrix24-standard');
    const historial = await citar(browser, {
      url: 'https://helpdesk.bitrix24.com/open/25803275/',
      buscar: /The CRM history logs key changes to CRM items, such as exporting contacts or updating field values/,
      captura: 'B-2-8-bitrix24-1-historial-en-crm',
    });
    const exportacion = await citar(browser, {
      url: 'https://www.bitrix24.es/prices/compare_cloud_plans.php',
      buscar: 'Opción para exportar contactos a CSV, Excel y Outlook',
      captura: 'B-2-8-bitrix24-2-comparacion-de-planes',
    });

    registrar({
      criterio: 'B.2.8',
      plataforma,
      cumple: 1,
      resumen:
        'Permite corregir y suprimir la ficha de un asegurado, pero no sacar todos sus datos de una vez ni dejar constancia de cada pedido: la exportación y el historial exigen un plan pago.',
      comoLoHace:
        'La ficha del contacto muestra sus datos en pantalla; el apellido se corrige con «editar» y la ficha se suprime ' +
        'con «Eliminar» en su menú. Exportar el contacto a un archivo pide actualizar el plan, y la pestaña «Historial» ' +
        'de la ficha también.',
      caracteristicas:
        'No hay un bloqueo de la ficha, solo la supresión. Del cambio queda únicamente la fecha de la última ' +
        'modificación y su autor, y de la supresión no queda nada en el sistema.',
      justificacion:
        'La compañía puede rectificar y suprimir, pero tiene que armar a mano la respuesta de acceso —leer la ficha y ' +
        'las negociaciones una por una— y llevar por su cuenta el registro de cada pedido y de su fecha, porque el ' +
        'sistema no deja constancia ni de la corrección ni de la baja. Es una limitación que la compañía debe asumir.',
      conPlan: [conPlanDe(BITRIX24_STANDARD, {
        cumple: 2,
        justificacion:
          'El plan Standard suma el historial de CRM, que registra los cambios de campos y las exportaciones, y la exportación ' +
          'de contactos a CSV o Excel que el plan Basic ya incluye: la compañía obtiene los datos de una vez y conserva ' +
          'constancia de cada corrección. Es el primer plan que resuelve las dos cosas.',
      })],
      evidencia: [capFicha, capExportar, capHistorial, capConfirmacion, capSuprimido],
      documentacion: [historial, exportacion, ...precio],
    });
  } finally {
    await cerrarPaneles(page).catch(() => {});
    await borrarContactos(page, /^TIT-/);
    for (const d of await rest<any[]>(page, 'crm.deal.list', { filter: { '%TITLE': 'TIT-POL' }, select: ['ID'] })) await rest(page, 'crm.deal.delete', { id: d.ID });
  }
});

// ── B.2.9 ────────────────────────────────────────────────────────────────────
test('B.2.9 — Baja de las comunicaciones comerciales por medio', async ({ page, browser }, info) => {
  // «Marcar a un asegurado para que no reciba correos comerciales, armar una campaña de correo que lo incluya en su
  //  segmento y comprobar que el envío lo excluye»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarContactos(page, /^BAJ-/);
  await rest<number>(page, 'crm.contact.add', { fields: { NAME: 'BAJ-Lucía', LAST_NAME: 'Fernández', EMAIL: [{ VALUE: 'baj@ejemplo.test', VALUE_TYPE: 'WORK' }] } });

  try {
    // La marca en la ficha: los campos que se pueden agregar al contacto
    await irAContactos(page);
    await page.locator('a').filter({ hasText: /BAJ-Lucía/ }).filter({ visible: true }).first().click();
    await esperarPanel(page, panel(page).getByText(/sobre el contacto/i).first());
    const f = panel(page);
    await f.getByText(/^Seleccionar campo/).first().click({ force: true });
    await page.waitForTimeout(1500);
    const opciones = (await f.locator('.ui-entity-editor-popup-item, label').allInnerTexts()).map(t => t.trim()).filter(Boolean);
    const capCampos = await capturar(page, 'B.2.9', plataforma, '1-campos-del-contacto');
    const marca = opciones.filter(o => /no (recib|enviar|molest)|baja|suscrip|unsubscri|bolet[ií]n|publicidad|comercial/i.test(o));
    console.log(`    campos del contacto que sirven de baja: ${marca.join(' | ') || 'ninguno'} (de ${opciones.length})`);
    await page.keyboard.press('Escape');
    await cerrarPaneles(page);

    // La campaña de correo, desde Marketing
    await menuLateral(page, 'Marketing');
    await page.getByText('Campaña de correo electrónico').first().click();
    await page.waitForTimeout(6000);
    const aviso = await textoDe(page);
    const capCampana = await capturar(page, 'B.2.9', plataforma, '2-campana-de-correo');
    const campanaPidePlan = /Standard|Professional/.test(aviso) && /plan/i.test(aviso);
    console.log(`    la campaña de correo pide otro plan: ${campanaPidePlan}`);
    await cerrarPaneles(page);

    expect(marca, 'no debería haber un campo de baja de correos en el contacto').toHaveLength(0);
    expect(campanaPidePlan, 'la campaña de correo debe pedir otro plan').toBeTruthy();

    const baja = await citar(browser, {
      url: 'https://helpdesk.bitrix24.com/open/14294110/',
      buscar: 'Every email campaign must include a clear unsubscribe option',
      captura: 'B-2-9-bitrix24-1-baja-en-cada-campana',
    });
    const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'B-2-9-bitrix24-standard');

    registrar({
      criterio: 'B.2.9',
      plataforma,
      cumple: 0,
      resumen:
        'El contacto no tiene una marca para no recibir correos comerciales y la edición gratuita no permite armar campañas de correo: no hay envío cuya exclusión comprobar.',
      comoLoHace:
        'La ficha del contacto no ofrece ningún campo para registrar que no quiere recibir correos comerciales. La ' +
        'campaña de correo electrónico, desde Marketing, pide el plan Standard o el Professional.',
      justificacion:
        'La compañía no puede registrar la baja de un asegurado en el sistema ni enviar una campaña que la respete: ' +
        'tendría que llevar la lista de bajas fuera del sistema y excluir a esas personas a mano de cualquier envío.',
      conPlan: [conPlanDe(BITRIX24_STANDARD, {
        cumple: 1,
        justificacion:
          'Con el plan Standard, el de entrada para el correo masivo, cada campaña lleva obligatoriamente un enlace de ' +
          'baja. Esa baja la hace el destinatario desde el correo recibido; el fabricante no publica una marca en la ' +
          'ficha del contacto para decidir por medio, y no se comprobó el envío porque exige el plan.',
      })],
      evidencia: [capCampos, capCampana],
      documentacion: [baja, ...precio],
    });
  } finally {
    await cerrarPaneles(page).catch(() => {});
    await borrarContactos(page, /^BAJ-/);
  }
});

// ── B.2.10 ───────────────────────────────────────────────────────────────────
const AYUDA = 'https://helpdesk.bitrix24.com';
/** Las notas mensuales de novedades que el fabricante conserva en su ayuda, con las funciones que anuncia cada una. */
async function notasDeBitrix24() {
  const html = await (await fetch(`${AYUDA}/open/26062415/`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
  const notas = [...html.matchAll(/<a href="(\/open\/\d+\/)"[^>]*title="((?:What's new\? [A-Za-z]+ 20\d\d)|Bitrix24 Vibe)"/g)]
    .map(m => ({ url: AYUDA + m[1], titulo: m[2] }));
  const SIN_FUNCION = /^(Other updates|New articles|Article updates|Plans|Migration to Bitrix24)$/;
  const funciones: { nota: string; titulo: string }[] = [];
  for (const n of notas) {
    const pagina = await (await fetch(n.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const cuerpo = pagina.match(/"articleBody":"(.*?)","/s)?.[1];
    if (!cuerpo) continue;
    const texto: string = JSON.parse(`"${cuerpo}"`);
    for (const h of texto.matchAll(/<h[23]>(.*?)<\/h[23]>/gs)) {
      const titulo = h[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#039;|&#39;/g, "'").trim();
      if (!SIN_FUNCION.test(titulo)) funciones.push({ nota: n.titulo, titulo });
    }
  }
  return { notas, funciones };
}

test('B.2.10 — Evolución sostenida del producto', async ({ browser }, info) => {
  // «Contar en las notas de versión oficiales del último año las versiones que
  //  agregaron funciones, y determinar desde cuándo el fabricante sostiene el producto»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const { notas, funciones } = await notasDeBitrix24();
  expect(notas.length, 'la ayuda debe conservar notas de novedades').toBeGreaterThan(0);

  const archivo = await citar(browser, {
    url: `${AYUDA}/open/25907955/`,
    buscar: 'A brief overview of the most important updates from the past month',
    captura: 'B-2-10-bitrix24-1-notas-conservadas',
  });
  const vibe = await citar(browser, {
    url: `${AYUDA}/open/25971891/`,
    buscar: 'We are pleased to present the new features of Bitrix24 Vibe release',
    captura: 'B-2-10-bitrix24-2-lanzamiento-vibe',
  });
  const reciente = await citar(browser, {
    url: `${AYUDA}/open/26062415/`,
    buscar: 'Alaio Vibecode is a platform for building AI-powered solutions for Bitrix24',
    captura: 'B-2-10-bitrix24-3-novedad-reciente',
  });
  const origen = await citar(browser, {
    url: 'https://www.bitrix24.com/about/',
    buscar: 'release it to the public in April of 2012',
    captura: 'B-2-10-bitrix24-4-desde-2012',
  });

  registrar({
    criterio: 'B.2.10',
    plataforma,
    cumple: 2,
    resumen:
      'Publica novedades todos los meses con funciones nuevas —unas ocho notas conservadas en el año— y el fabricante sostiene el producto desde abril de 2012.',
    comoLoHace:
      `La ayuda oficial conserva ${notas.length} notas de novedades de 2026 (${notas.map(n => n.titulo.replace("What's new? ", '')).join(', ')}), ` +
      `con ${funciones.length} funciones o mejoras anunciadas, incluido el lanzamiento mayor «Bitrix24 Vibe». El producto salió al público en abril de 2012.`,
    caracteristicas:
      'Las notas describen cada función con lenguaje de usuario y una guía. El fabricante no numera sus versiones: ' +
      'publica novedades por mes y lanzamientos estacionales.',
    justificacion:
      'Agrega funciones casi todos los meses y lleva catorce años en el mercado. El archivo de notas que conserva la ayuda arranca en ' +
      'febrero de 2026, así que el conteo no cubre noviembre a enero; la trayectoria sí cumple la segunda condición de la escala.',
    documentacion: [archivo, vibe, reciente, origen],
    medicion:
      `${notas.length} notas de novedades (${notas.map(n => n.titulo).join('; ')}); ${funciones.length} funciones anunciadas; producto público desde abril de 2012`,
  });
});

// ── B.2.11 ───────────────────────────────────────────────────────────────────
test('B.2.11 — Mejoras incluidas en la versión gratuita', async ({ browser }, info) => {
  // «Tomar las funciones nuevas de las notas de versión oficiales del último año y
  //  determinar cuántas llegan a la versión evaluada y cuántas quedan en un plan o
  //  una extensión paga»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const { notas, funciones } = await notasDeBitrix24();

  // Qué incluye la edición gratuita lo dice la tabla de planes del fabricante: primera columna
  const contexto = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 1600 } });
  const hoja = await contexto.newPage();
  let tabla: Record<string, string[]>;
  try {
    await hoja.goto('https://www.bitrix24.com/prices/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await hoja.waitForTimeout(2500);
    tabla = await hoja.evaluate(() => {
      const out: Record<string, string[]> = {};
      for (const fila of document.querySelectorAll('.bxw-block-price-comparison-table__row')) {
        const titulo = fila.querySelector('.bxw-block-price-comparison-table__row-title')?.textContent?.trim();
        if (!titulo || out[titulo]) continue;
        out[titulo] = [...fila.querySelectorAll('.bxw-block-price-comparison-table__cell')].slice(0, 9).map(c => {
          const marca = c.querySelector('svg[aria-label]')?.getAttribute('aria-label');
          return marca ?? (c.textContent ?? '').replace(/\s+/g, ' ').trim();
        });
      }
      return out;
    });
  } finally {
    await contexto.close();
  }
  // La primera columna es la edición gratuita
  const gratis = (fila: string) => tabla[fila]?.[0];
  const FILAS: [RegExp, string][] = [
    [/BI Builder/i, 'BI Analytics'],
    [/e-Signature/i, 'E-signature'],
    [/Vibecode/i, 'Vibecode app builder'],
    [/CoPilot/i, 'AI call analysis & scripts'],
    [/Messenger|chat/i, 'Messenger'],
  ];
  const clasificadas = funciones.map(f => {
    const fila = FILAS.find(([re]) => re.test(f.titulo))?.[1];
    const estado = fila ? gratis(fila) : undefined;
    return { ...f, fila, estado, paga: estado === 'Not included' };
  });
  const pagas = clasificadas.filter(f => f.paga);
  const libres = clasificadas.filter(f => f.estado === 'Included');
  const sinFila = clasificadas.filter(f => !f.fila);
  expect(Object.keys(tabla).length, 'la tabla de planes debe tener filas').toBeGreaterThan(20);
  expect(pagas.length, 'debe haber funciones nuevas que la gratuita no incluye').toBeGreaterThan(0);

  const vibecode = await citar(browser, {
    url: 'https://www.bitrix24.com/prices/',
    buscar: 'Vibe+ exclusive features',
    captura: 'B-2-11-bitrix24-1-exclusivas-de-vibe',
  });
  const hint = await citar(browser, {
    url: 'https://www.bitrix24.com/prices/',
    buscar: 'Create custom apps for your Bitrix24 by simply asking AI',
    captura: 'B-2-11-bitrix24-2-constructor-de-apps',
  });
  const bi = await citar(browser, {
    url: `${AYUDA}/open/26086059/`,
    buscar: 'Set the report period in BI Builder using a filter',
    captura: 'B-2-11-bitrix24-3-novedad-bi-builder',
  });
  const precio = await constanciaDe(browser, BITRIX24_PROFESSIONAL, 'B-2-11-bitrix24-professional');

  registrar({
    criterio: 'B.2.11',
    plataforma,
    cumple: 1,
    resumen:
      'Las mejoras de mensajería llegan a la edición gratuita, pero las principales del año —análisis con BI Builder, inteligencia artificial, firma electrónica y Vibecode— exigen un plan pago.',
    comoLoHace:
      `De las ${funciones.length} funciones anunciadas en las ${notas.length} notas del año, ${pagas.length} corresponden a capacidades que la tabla de planes ` +
      `del fabricante marca como no incluidas en la gratuita (${[...new Set(pagas.map(p => p.fila))].join(', ')}), ${libres.length} a capacidades incluidas ` +
      `(mensajería) y ${sinFila.length} no tienen fila propia en esa tabla.`,
    caracteristicas:
      'Quedan en planes pagos el análisis con BI Builder (anunciado en cinco notas), la inteligencia artificial de llamadas, la firma electrónica y el ' +
      'constructor Vibecode, exclusivo de la familia Vibe+. Llegan a la gratuita las mejoras de mensajería: invitados al chat, carpetas personales y filtros de no leídos.',
    justificacion:
      'Las novedades que el fabricante destaca como las del año —inteligencia artificial, análisis y construcción de aplicaciones— quedan en planes ' +
      'pagos, mientras que las de mensajería llegan a la gratuita. La clasificación toma solo las funciones que la tabla de planes permite ubicar; ' +
      'las demás se cuentan aparte y no se asumen gratuitas ni pagas.',
    conPlan: [conPlanDe(BITRIX24_PROFESSIONAL, {
      cumple: 2,
      justificacion:
        'El plan Standard suma el análisis con BI Builder y la inteligencia artificial de llamadas, pero no la firma electrónica; ' +
        'con Professional llegan también la firma electrónica y el diseñador de flujos con inteligencia artificial. Vibecode exige además un plan de la familia Vibe+.',
    })],
    documentacion: [vibecode, hint, bi, ...precio],
    medicion:
      `${funciones.length} funciones anunciadas: ${pagas.length} no incluidas en la gratuita (${pagas.map(p => `${p.titulo} [${p.nota}]`).join('; ')}); ` +
      `${libres.length} incluidas; ${sinFila.length} sin fila en la tabla de planes`,
  });
});
