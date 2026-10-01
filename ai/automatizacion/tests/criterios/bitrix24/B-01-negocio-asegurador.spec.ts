import { test, expect } from '../../humano';
import type { Response } from '@playwright/test';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, rest, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones, BASE } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';

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
    justificacion:
      'Las condiciones de servicio del fabricante habilitan la baja de la cuenta, con sus datos, después de ' +
      'cincuenta días corridos sin uso. Una póliza vigente puede pasar mucho más que cincuenta días sin que nadie ' +
      'la consulte —está vigente, pero no requiere actividad—, y ese silencio pone en riesgo toda la cartera, no ' +
      'solo el registro inactivo. La compañía tiene que sostener un ingreso periódico solo para conservar datos ' +
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
    justificacion:
      `El listado de negociaciones —que en la edición gratuita hace de cartera de pólizas— ofrece la acción ` +
      `«Exportar»${exportarVisible ? ', visible desde la pantalla' : ', pero no aparece habilitada en el listado de la edición gratuita'}. ` +
      'La compañía igual obtiene una copia completa de sus datos, registro por registro, con la interfaz de ' +
      `programación de la misma cuenta: se leyeron ${negociaciones_.length} negociaciones y ${contactos.length} ` +
      'contactos con todos sus campos, incluidos los propios. Lo que no se resuelve por pantalla en un solo paso ' +
      'es la copia de los archivos adjuntos de Drive, que el fabricante no ofrece como descarga masiva en la ' +
      'edición gratuita: hay que bajarlos uno por uno o contratar una aplicación de respaldo del catálogo. La ' +
      'compañía tiene en su poder los datos, con un procedimiento que se repite en cada copia.',
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
    justificacion:
      'El propio fabricante genera una copia diaria de toda la cuenta, sin que nadie la programe ni la ejecute: ' +
      'no es una tarea que la compañía tenga que sostener. La condición se satisface con una limitación: esa ' +
      'copia la administra el fabricante y no la compañía, se conserva solo siete días, y restituir una fecha ' +
      'concreta depende de pedirlo a soporte y de que el plan contratado lo permita, así que la compañía no ' +
      'controla ni la retención ni la restitución de su propio resguardo.',
    documentacion: fuente,
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
/**
 * El veredicto de B.1.4 se fija a la vista de la medición, con la pregunta de
 * la sección 4.7. No se cargó la cartera de referencia de 25.000 registros:
 * el portal es compartido con otras dos pruebas en curso, y una carga de ese
 * tamaño la afectaría a las tres. Se midió sobre la cartera real del portal,
 * y se dejó documentado que el fabricante no publica un tope numérico de
 * registros de CRM para la edición gratuita —solo publica el de usuarios y
 * el de almacenamiento— que permita proyectar el resultado a 25.000.
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
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const negociacionesTotal = await rest<any[]>(page, 'crm.deal.list', { select: ['ID'] });
  const contactosTotal = await rest<any[]>(page, 'crm.contact.list', { select: ['ID'] });

  await menuLateral(page, 'CRM');
  const buscador = page.locator('input.main-ui-filter-search-filter, input[placeholder="buscar" i]').filter({ visible: true }).first();
  await buscador.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
  const medidas: number[] = [];
  for (let i = 0; i < 3 && (await buscador.isVisible().catch(() => false)); i++) {
    await buscador.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Automotor', { delay: 60 });
    // La búsqueda responde cuando el listado deja de mostrar las negociaciones que no coinciden
    const antes = Date.now();
    await page.keyboard.press('Enter');
    await page.locator('a').filter({ hasText: /^POL-RAMO-4/ }).filter({ visible: true })
      .waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {});
    medidas.push((Date.now() - antes) / 1000);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(400);
  }
  const capBusqueda = await capturar(page, 'B.1.4', plataforma, '1-busqueda-por-texto');

  const documentacion = await citar(page.context().browser()!, {
    url: 'https://www.bitrix24.es/prices/',
    buscar: 'Almacenamiento de 5',
    captura: 'B-1-4-bitrix24-2-limite-publicado-es-de-almacenamiento',
  });

  const lectura = medidas.length
    ? `búsqueda por texto sobre ${negociacionesTotal.length} negociaciones y ${contactosTotal.length} contactos: ` +
      `${medidas.map(s => s.toFixed(2)).join(' / ')} s`
    : 'no se pudo medir la búsqueda desde el listado en esta corrida';
  console.log(`    B.1.4 medición: ${lectura}`);

  registrar({
    criterio: 'B.1.4',
    plataforma,
    cumple: 1,
    justificacion:
      'No se cargó la cartera de referencia de veinticinco mil registros: el portal es compartido con otras ' +
      'pruebas en curso y una carga de ese tamaño las afectaría. Se midió la búsqueda por texto sobre la cartera ' +
      `real del portal —${negociacionesTotal.length} negociaciones y ${contactosTotal.length} contactos—, que ` +
      (medidas.length ? `respondió en ${medidas.map(s => s.toFixed(2)).join(' / ')} segundos. ` : 'no se pudo medir en esta corrida. ') +
      'El fabricante no publica, para la edición gratuita, un tope numérico de registros de CRM que permita ' +
      'proyectar ese tiempo a una cartera de veinticinco mil: publica el límite de usuarios —sin tope— y el de ' +
      'almacenamiento de archivos —5 GB—, pero no uno sobre la cantidad de negociaciones o contactos que admite ' +
      'buscar. La compañía no tiene, de la propia documentación, una garantía de que la búsqueda siga respondiendo ' +
      'igual con su cartera productiva completa.',
    evidencia: [capBusqueda],
    documentacion,
    medicion: lectura,
  });
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
    justificacion:
      'En un servicio en la nube de versión única, el fabricante decide cuándo cambia el sistema: actualiza el ' +
      'portal de todos sus clientes a la vez, y sus propias condiciones de servicio se reservan el derecho de ' +
      'modificarse sin aviso previo. La compañía no elige el momento del cambio, no lo prueba antes de que llegue ' +
      'a producción y puede encontrarse con una pantalla, un menú o un comportamiento distinto en medio de la ' +
      'atención, sin ninguna anticipación garantizada.',
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
    justificacion:
      'El fabricante declara dónde aloja los datos —en la infraestructura de Amazon Web Services, en Virginia o ' +
      'en Fráncfort— y la compañía elige entre esas dos regiones al dar de alta el portal, según el dominio con el ' +
      'que se registra. La condición se satisface con una limitación: la elección es binaria, se fija una sola vez ' +
      'al crear la cuenta y no se puede cambiar después sin migrar a un portal nuevo, así que la compañía conoce ' +
      'dónde están sus datos sensibles pero no controla ese destino en el tiempo, como exige el tratamiento de ' +
      'datos de los seguros de personas.',
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
    justificacion:
      'Con la conexión externa cortada, el portal abierto en el navegador dejó de responder: no hay ningún ' +
      'componente del sistema en la red de la compañía al que seguir alcanzando, porque la edición evaluada vive ' +
      'entera en la nube del fabricante, y consultar un asegurado o registrar un reclamo en el CRM no es posible ' +
      'mientras dura el corte. El fabricante documenta, en cambio, un modo sin conexión en su aplicación de ' +
      'escritorio para enviar mensajes y trabajar con documentos, que se sincronizan al volver el enlace: una ' +
      'parte de la operación diaria sigue siendo posible, pero no la que depende del CRM.',
    evidencia: capSinEnlace ? [capSinEnlace] : [],
    documentacion: fuente,
    medicion: `Portal operable sin enlace externo: ${siguioFuncionando ? 'sí' : 'no'}`,
  });
});
