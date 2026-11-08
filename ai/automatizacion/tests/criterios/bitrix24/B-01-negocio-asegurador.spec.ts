import { test, expect } from '../../humano';
import type { Locator, Response } from '@playwright/test';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, campoDeNegociacion, rest, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones, BASE } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';
import { irAContactos } from '../../bitrix24/actividades';
import { asegurarCampos, abrirListado, abrirFiltro, reiniciarFiltro, filtrarLista, buscarConFiltro, filasDelListado } from '../../bitrix24/negociaciones';
import { cargar, borrarVol, cuantosVol } from '../../bitrix24/volumen';

/**
 * B.1 — Condiciones que impone el negocio asegurador, sobre Bitrix24
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 */

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'non-use of the Bitrix24 Customer Account for fifty (50) consecutive calendar days',
    captura: 'B-1-1-bitrix24-1-cincuenta-dias',
  });

  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 0,
    comoLoHace:
      'Las condiciones de servicio del fabricante habilitan la baja de la cuenta, con sus datos, después ' +
      'de cincuenta días corridos sin uso.',
    justificacion:
      'Una póliza vigente puede pasar mucho más que cincuenta días sin que nadie la consulte —está ' +
      'vigente, pero no requiere actividad—, y ese silencio pone en riesgo toda la cartera, no solo el ' +
      'registro inactivo. La compañía tiene que sostener un ingreso periódico solo para conservar datos ' +
      'que de otro modo no necesitarían ninguna atención.',
    documentacion: fuente,
  });
});

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Copia propia y completa de la cartera', async ({ page, browser }, info) => {
  // «Obtener una copia de toda la información, incluidos los archivos
  //  adjuntos, y comprobar que puede restituirse»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capListado = await capturar(page, 'B.1.2', plataforma, '1-listado');

  // El botón de exportar del listado, tal como lo usaría un administrador
  const masAcciones = page.locator('[class*="menu"], button').filter({ hasText: /^Más$|^Acciones$/i }).filter({ visible: true }).first();
  let exportarVisible = await page.getByText(/^Exportar$/i).filter({ visible: true }).first().isVisible().catch(() => false);
  if (!exportarVisible && await masAcciones.isVisible().catch(() => false)) {
    await masAcciones.click();
    await page.waitForTimeout(800);
    exportarVisible = await page.getByText(/^Exportar$/i).filter({ visible: true }).first().isVisible().catch(() => false);
  }
  const capExportar = await capturar(page, 'B.1.2', plataforma, '2-opcion-de-exportar');

  // Lo que sí se obtiene sin depender del botón de exportar: el volcado completo por la interfaz
  // de programación, con la sesión del propio usuario, registro por registro
  const negociaciones_ = await rest<any[]>(page, 'crm.deal.list', { select: ['*', 'UF_*'] });
  const contactos = await rest<any[]>(page, 'crm.contact.list', { select: ['*', 'UF_*'] });

  registrar({
    criterio: 'B.1.2',
    plataforma,
    cumple: 1,
    comoLoHace:
      'El listado de negociaciones —que en la edición gratuita hace de cartera de pólizas— ofrece la ' +
      'acción ' +
      `«Exportar»${exportarVisible ? ', visible desde la pantalla' : ', pero no aparece habilitada en el listado de la edición gratuita'}. ` +
      'La compañía igual obtiene una copia completa de sus datos, registro por registro, con la interfaz ' +
      `de programación de la misma cuenta: se leyeron ${negociaciones_.length} negociaciones y ` +
      `${contactos.length} contactos con todos sus campos, incluidos los propios.`,
    caracteristicas:
      'Lo que no se resuelve por pantalla en un solo paso es la copia de los archivos adjuntos de Drive, ' +
      'que el fabricante no ofrece como descarga masiva en la edición gratuita: hay que bajarlos uno por ' +
      'uno o contratar una aplicación de respaldo del catálogo.',
    justificacion:
      'La compañía obtiene una copia completa de sus datos, pero no con la acción «Exportar», que no está ' +
      'habilitada en la edición gratuita: la copia se arma registro por registro con la interfaz de ' +
      'programación y los adjuntos se bajan uno por uno. El reparo es que no se resuelve en un solo paso, ' +
      'aunque el procedimiento se repite igual en cada copia.',
    evidencia: [capListado, capExportar],
    medicion: `${negociaciones_.length} negociaciones y ${contactos.length} contactos leídos por la interfaz de programación`,
  });
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Copia periódica sin intervención manual', async ({ browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25110238/',
    buscar: /daily backups/i,
    captura: 'B-1-3-bitrix24-1-copias-diarias-automaticas',
  });

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    comoLoHace:
      'El propio fabricante genera una copia diaria de toda la cuenta, sin que nadie la programe ni la ' +
      'ejecute: no es una tarea que la compañía tenga que sostener.',
    caracteristicas:
      'Esa copia la administra el fabricante y no la compañía, se conserva solo siete días, y restituir una ' +
      'fecha concreta depende de pedirlo a soporte y de que el plan contratado lo permita, así que la ' +
      'compañía no controla ni la retención ni la restitución de su propio resguardo.',
    justificacion:
      'La copia diaria la genera el fabricante sin intervención, pero la compañía no controla su ' +
      'retención, de siete días, ni su restitución, que depende de pedirla a soporte y del plan ' +
      'contratado: la condición se satisface con esa limitación.',
    documentacion: fuente,
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
/**
 * El veredicto de B.1.4 se fija a la vista de la medición, con la pregunta de
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

test('B.1.4 — Búsqueda y operación con volumen productivo', async ({ page }, info) => {
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

  const inicioCarga = Date.now();
  const medidas: Record<string, number[]> = { texto: [], filtro: [] };
  const hallazgos: string[] = [];
  try {
    await borrarVol(page, 'crm.deal', 'TITLE');
    await borrarVol(page, 'crm.contact', 'LAST_NAME');

    const pad = (n: number) => String(n).padStart(5, '0');
    const contactos = await cargar(page, 'crm.contact.add', CARTERA.contactos,
      n => ({ NAME: `Asegurado ${n}`, LAST_NAME: `VOL-${pad(n)}` }));
    const cargados = { contactos: contactos.ids.length, polizas: 0, reclamos: 0 };
    let detenida = contactos.error ? `contactos: ${contactos.error.texto} (tras ${contactos.error.en} altas)` : '';
    if (!detenida) {
      const polizas = await cargar(page, 'crm.deal.add', CARTERA.polizas, n => ({
        TITLE: `VOL-POL-${n}`, CONTACT_ID: contactos.ids[(n - 1) % contactos.ids.length], [ramo.FIELD_NAME]: opcion(RAMOS[n % RAMOS.length]),
      }));
      cargados.polizas = polizas.ids.length;
      if (polizas.error) detenida = `pólizas: ${polizas.error.texto} (tras ${polizas.error.en} altas)`;
    }
    if (!detenida) {
      const reclamos = await cargar(page, 'crm.deal.add', CARTERA.reclamos, n => ({ TITLE: `VOL-RECLAMO-${n}` }));
      cargados.reclamos = reclamos.ids.length;
      if (reclamos.error) detenida = `reclamos: ${reclamos.error.texto} (tras ${reclamos.error.en} altas)`;
    }
    const minutosCarga = Math.round((Date.now() - inicioCarga) / 60_000);
    console.log(`    B.1.4 carga: ${JSON.stringify(cargados)} · ${minutosCarga} min · ${detenida ? `DETENIDA ${detenida}` : 'completa'}`);
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
      const cap = await capturar(page, 'B.1.4', plataforma, `limite-${etiqueta}`);
      await page.keyboard.press('Escape');
      return { texto, cap };
    };
    const limites: { donde: string; texto: string; cap: string }[] = [];
    const seg = (s: number) => Number.isNaN(s) ? 'sin medir' : s.toFixed(2);

    await irAContactos(page);
    const buscador = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
    await buscador.waitFor({ state: 'visible', timeout: 60_000 });
    // Uno de los primeros cargados y dos de más allá de los primeros mil
    for (const buscado of ['VOL-00777', 'VOL-04321', 'VOL-02468']) {
      const antesDeBuscar = await limiteDeBusqueda(buscador, 'contactos');
      if (antesDeBuscar) {
        limites.push({ donde: `contactos, antes de buscar ${buscado}`, ...antesDeBuscar });
        console.log(`    B.1.4 AVISO en Contactos: ${antesDeBuscar.texto} (${antesDeBuscar.cap})`);
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
      console.log(`    B.1.4 texto ${buscado}: ${hallados[buscado] ? 'encontrado' : 'NO encontrado'} · ${seg(s)} s · avisos: ${(await avisos()).join(' // ') || 'ninguno'}`);
    }
    const capTexto = await capturar(page, 'B.1.4', plataforma, '1-busqueda-por-texto');

    await abrirListado(page);
    const buscadorNegociaciones = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
    await buscadorNegociaciones.waitFor({ state: 'visible', timeout: 60_000 });
    const bloqueo = await limiteDeBusqueda(buscadorNegociaciones, 'negociaciones');
    if (bloqueo) {
      limites.push({ donde: 'negociaciones, antes de filtrar por ramo', ...bloqueo });
      console.log(`    B.1.4 AVISO en Negociaciones: ${bloqueo.texto} (${bloqueo.cap}) · el filtrado por ramo no se pudo medir`);
    } else {
      for (const r of ['Automotor', 'Vida', 'Salud']) {
        await abrirFiltro(page);
        await reiniciarFiltro(page).catch(() => {});
        await filtrarLista(page, 'Ramo', r);
        pedidos.length = 0;
        await buscarConFiltro(page);
        const filas = await filasDelListado(page, /^VOL-POL-/);
        const s = await medir();
        medidas.filtro.push(s);
        console.log(`    B.1.4 filtro ${r}: ${filas.length} pólizas VOL en la primera página · ${seg(s)} s · avisos: ${(await avisos()).join(' // ') || 'ninguno'}`);
      }
    }
    const capFiltro = await capturar(page, 'B.1.4', plataforma, '2-filtrado-por-ramo');
    for (const l of limites) hallazgos.push(`aviso del sistema (${l.donde}): ${l.texto}`);

    const lectura = `texto ${medidas.texto.map(seg).join(' / ')} s (${Object.entries(hallados).map(([k, v]) => `${k} ${v ? 'sí' : 'no'}`).join(', ')}) · ` +
                    `filtro ${medidas.filtro.length ? medidas.filtro.map(s => s.toFixed(1)).join(' / ') + ' s' : 'sin medir'} · carga ${JSON.stringify(cargados)} en ${minutosCarga} min${hallazgos.length ? ` · ${hallazgos.join('; ')}` : ''}`;
    console.log(`    B.1.4 medición: ${lectura}`);
    if (!VEREDICTO_B14) throw new Error(`B.1.4: fijar el veredicto a la vista de la medición (${lectura})`);
    const lejos = medidas.texto.length > 0 && Math.max(...medidas.texto) > 2 * MEDIDO_B14.texto;
    if (lejos) throw new Error(`B.1.4: la búsqueda de contactos cambió respecto de la que sostiene el veredicto; volver a mirarlo (${lectura})`);
    const bloqueada = limites.find(l => /l[ií]mite de b[uú]squeda de negociaciones \(1000\)/i.test(l.texto));
    const bloqueoContactos = limites.find(l => /l[ií]mite de b[uú]squeda de contactos \(1000\)/i.test(l.texto));
    // Un buscador de contactos bloqueado es un resultado válido; el que no lo está debe haber encontrado a los tres
    if (!bloqueada || (!bloqueoContactos && !Object.values(hallados).every(Boolean)) || detenida) {
      throw new Error(`B.1.4: no se reprodujo el bloqueo que sostiene el veredicto; revisar (${lectura})`);
    }
    // ¿El bloqueo se levanta al volver por debajo del límite? Se quita la cartera de referencia y se vuelve a mirar el buscador
    await borrarVol(page, 'crm.deal', 'TITLE');
    await borrarVol(page, 'crm.contact', 'LAST_NAME');
    const restantes = await page.evaluate(() => new Promise<number>(res => {
      (window as any).BX.rest.callMethod('crm.deal.list', { select: ['ID'] }).then((x: any) => res(x.total()), () => res(-1));
    }));
    await page.reload();
    await abrirListado(page);
    const buscadorTrasBorrar = page.locator('input.main-ui-filter-search-filter').filter({ visible: true }).first();
    await buscadorTrasBorrar.waitFor({ state: 'visible', timeout: 60_000 });
    const sigueBloqueado = restantes >= 0 && restantes < 1000
      ? await limiteDeBusqueda(buscadorTrasBorrar, 'negociaciones-tras-borrar')
      : null;
    console.log(`    B.1.4 tras borrar la cartera: ${restantes} negociaciones · bloqueo ${sigueBloqueado ? `persiste (${sigueBloqueado.texto})` : 'no se reproduce'}`);

    const coma = (n: number) => n.toFixed(2).replace('.', ',');
    const lista =(v: number[]) => v.length < 2 ? v.map(coma).join('') : `${v.slice(0, -1).map(coma).join(', ')} y ${coma(v[v.length - 1])}`;
    const aviso = 'bloqueó la búsqueda y el filtro con el aviso «Alcanzó el límite de búsqueda de negociaciones (1000)»';
    const trasContactos = bloqueoContactos
      ? (medidas.texto.length
          ? ', y más tarde el listado de contactos mostró el mismo bloqueo: «Alcanzó el límite de búsqueda de contactos (1000)»'
          : ', y el listado de contactos mostró el mismo bloqueo desde la primera búsqueda: «Alcanzó el límite de búsqueda de contactos (1000)»')
      : '';

    registrar({
      criterio: 'B.1.4',
      plataforma,
      cumple: VEREDICTO_B14.cumple,
      comoLoHace:
        'Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil ' +
        'quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los ' +
        'días: buscar un asegurado por texto y filtrar las pólizas por ramo.',
      caracteristicas:
        (medidas.texto.length ? `Con la cartera cargada, buscar un asegurado por texto respondió en ${lista(medidas.texto)} segundos. ` : '') +
        `El listado de negociaciones, donde la edición gratuita lleva las pólizas y los reclamos, ${aviso}${trasContactos}.` +
        (sigueBloqueado
          ? ` Al borrar la cartera de referencia, con ${restantes} negociaciones en el portal, el buscador del listado siguió mostrando el aviso de límite: el bloqueo no se levanta al volver por debajo de las mil.`
          : ''),
      justificacion:
        'Con más de mil registros, la edición gratuita deja de buscar y filtrar en el listado. La compañía, con ' +
        'unas setecientas cincuenta pólizas por año y los reclamos de cinco años, supera ese número en las ' +
        'negociaciones, y lo superaría en los asegurados al crecer: la operación diaria sobre la cartera se ' +
        'vuelve impracticable.',
      evidencia: [bloqueada.cap, capTexto, ...(bloqueoContactos ? [bloqueoContactos.cap] : []), ...(sigueBloqueado ? [sigueBloqueado.cap] : [])],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    await borrarVol(page, 'crm.deal', 'TITLE');
    await borrarVol(page, 'crm.contact', 'LAST_NAME');
    const negociacionesVol = await cuantosVol(page, 'crm.deal.list', 'TITLE');
    const contactosVol = await cuantosVol(page, 'crm.contact.list', 'LAST_NAME');
    console.log(`    B.1.4 limpieza: quedan ${contactosVol} contactos y ${negociacionesVol} negociaciones VOL`);
  }
});

// ── B.1.5 ────────────────────────────────────────────────────────────────────
test('B.1.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'The terms of this Agreement may be updated by Alaio from time to time without notice',
    captura: 'B-1-5-bitrix24-1-sin-aviso-previo',
  });

  registrar({
    criterio: 'B.1.5',
    plataforma,
    cumple: 0,
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

// ── B.1.6 ────────────────────────────────────────────────────────────────────
test('B.1.6 — Conocimiento y decisión sobre dónde residen los datos', async ({ browser }, info) => {
  // «Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/security/',
    buscar: 'Bitrix24 uses Amazon Web Services to host your data in US (Virginia) or European Union (Frankfurt, Germany)',
    captura: 'B-1-6-bitrix24-1-dos-regiones',
  });

  registrar({
    criterio: 'B.1.6',
    plataforma,
    cumple: 1,
    comoLoHace:
      'El fabricante declara dónde aloja los datos —en la infraestructura de Amazon Web Services, en ' +
      'Virginia o en Fráncfort— y la compañía elige entre esas dos regiones al dar de alta el portal, según ' +
      'el dominio con el que se registra.',
    caracteristicas:
      'La elección es binaria, se fija una sola vez al crear la cuenta y no se puede cambiar después sin ' +
      'migrar a un portal nuevo, así que la compañía conoce dónde están sus datos sensibles pero no controla ' +
      'ese destino en el tiempo, como exige el tratamiento de datos de los seguros de personas.',
    justificacion:
      'La compañía sabe dónde están sus datos y elige entre Virginia y Fráncfort, pero esa elección se ' +
      'fija una sola vez al crear la cuenta y solo se cambia migrando a un portal nuevo: la condición se ' +
      'satisface con esa limitación.',
    documentacion: fuente,
  });
});

// ── B.1.7 ────────────────────────────────────────────────────────────────────
test('B.1.7 — Continuidad de la atención ante una caída del enlace', async ({ page, browser }, info) => {
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
  const capSinEnlace = await capturar(page, 'B.1.7', plataforma, '1-sin-enlace').catch(() => '');
  await page.context().setOffline(false);

  expect(siguioFuncionando, 'sin infraestructura propia, el portal no debería seguir operable sin enlace').toBe(false);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/23839416/',
    buscar: 'Send messages and work with documents without an internet connection',
    captura: 'B-1-7-bitrix24-2-modo-sin-conexion-del-mensajero',
  });

  registrar({
    criterio: 'B.1.7',
    plataforma,
    cumple: 1,
    comoLoHace:
      'Con la conexión externa cortada, el portal abierto en el navegador dejó de responder.',
    caracteristicas:
      'El fabricante documenta, en cambio, un modo sin conexión en su aplicación de escritorio para enviar ' +
      'mensajes y trabajar con documentos, que se sincronizan al volver el enlace: una parte de la operación ' +
      'diaria sigue siendo posible, pero no la que depende del CRM.',
    justificacion:
      'Con el enlace cortado el portal del CRM deja de responder: consultar un asegurado o registrar un ' +
      'reclamo no es posible mientras dura el corte, porque la edición evaluada vive entera en la nube ' +
      'del fabricante. Sigue siendo posible, con el modo sin conexión de la aplicación de escritorio que ' +
      'documenta el fabricante, enviar mensajes y trabajar con documentos, que se sincronizan al volver ' +
      'el enlace.',
    evidencia: capSinEnlace ? [capSinEnlace] : [],
    documentacion: fuente,
    medicion: `Portal operable sin enlace externo: ${siguioFuncionando ? 'sí' : 'no'}`,
  });
});
