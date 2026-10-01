import { test, expect, request } from '../humano';
import { execFileSync } from 'node:child_process';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import { apiEspo, crear, listar } from '../api';
import { soloEn, capturar, listadoLimpio, agregarFiltro, comparacionesDe, clicEnAccion } from './comun';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { administracion, inicio } from '../espocrm/navegar';

/**
 * A.10 — Explotación de la información
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema.
 */

// Los criterios de este grupo no dependen entre sí: uno que falla no detiene a los demás.

/** Las 500 operaciones diarias de la cifra de referencia de la sección 4.7. */
const MOVIMIENTO_DIARIO = 500;

// ── A.10.4 ───────────────────────────────────────────────────────────────────
test('A.10.4 — Intercambio de datos con otros sistemas de la compañía', async ({ page, browser }, info) => {
  // «Crear y consultar registros desde fuera del sistema, por la vía que la
  //  plataforma habilite»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // El usuario de integración: una cuenta propia para el otro sistema, con su clave
  // El listado común de usuarios no muestra los de integración: se lo busca por su nombre
  const admin = await apiEspo();
  const { list } = await listar(admin, 'User', {
    maxSize: 5, 'where[0][type]': 'equals', 'where[0][attribute]': 'userName', 'where[0][value]': 'integracion-emision',
  });
  const usuarioApi = list[0] ?? await (await admin.post('User', { data: {
    userName: 'integracion-emision', type: 'api', authMethod: 'ApiKey', isActive: true,
  } })).json();
  const rol = (await listar(admin, 'Role', { maxSize: 50 })).list.find((r: any) => r.name === 'Productor');
  await admin.put(`User/${usuarioApi.id}`, { data: { rolesIds: rol ? [rol.id] : [] } });

  await entrar(page, plataforma);
  await administracion(page, '#Admin/apiUsers', `#User/view/${usuarioApi.id}`);
  await page.waitForTimeout(3000);
  const capUsuario = await capturar(page, 'A.10.4', plataforma, '1-usuario-de-integracion');

  // El otro sistema: habla con su propia clave, sin usuario ni contraseña de nadie
  const clave = (await (await admin.get(`User/${usuarioApi.id}`)).json()).apiKey;
  const externo = await request.newContext({
    baseURL: 'http://localhost:8705/api/v1/', extraHTTPHeaders: { 'X-Api-Key': clave },
  });
  const alta = await externo.post('Contact', { data: {
    firstName: 'Registro', lastName: 'Desde la emisión', emailAddress: 'emision@ejemplo.test',
    assignedUserId: usuarioApi.id,
  } });
  const creado = await alta.json();
  const consulta = await (await externo.get(`Contact/${creado.id}`)).json();

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/development/api/',
    buscar: /API key/i,
    captura: 'A-10-4-espocrm-2-interfaz-de-programacion',
  });

  expect(alta.ok(), 'el otro sistema debe poder crear registros').toBeTruthy();
  expect(consulta.lastName).toBe('Desde la emisión');
  await admin.delete(`Contact/${creado.id}`);

  registrar({
    criterio: 'A.10.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El producto trae una interfaz de programación completa y un tipo de usuario pensado para otros ' +
      'sistemas: se dio de alta un usuario de integración con su propia clave y los permisos de un rol, sin ' +
      'contraseña de ninguna persona. Con esa clave, desde fuera del sistema, se creó un asegurado y se lo ' +
      'volvió a consultar. El sistema de emisión o el de cobranza de la compañía pueden cargar y leer datos por ' +
      'esa vía. Crear el usuario es configuración; lo que el otro sistema haga con la interfaz es trabajo de ' +
      'ese sistema, no de este.',
    evidencia: [capUsuario],
    documentacion: fuente,
  });
});

// ── A.10.5 ───────────────────────────────────────────────────────────────────
/**
 * El veredicto de A.10.5 se fija a la vista de la medición, con la pregunta de
 * la sección 4.7: ¿el límite deja holgura sobre las 500 operaciones diarias,
 * se agota en una jornada intensa, o impide sincronizar? En la instalación
 * propia no hay un límite publicado: se mide qué admite el equipo, en ráfaga y
 * de a una. Hasta que se fija, el test mide, informa y no registra nada.
 */
const VEREDICTO_A105: null | { cumple: 2 | 1 | 0; lectura: string } = {
  cumple: 2,
  lectura:
    'Las dos veces el sistema aceptó las quinientas: en ráfaga llevó alrededor de un minuto, y de a una unos ' +
    'cinco. En una corrida anterior, con el equipo ocupado por otros procesos, tres de quinientas altas en ' +
    'ráfaga fueron rechazadas y pasaron al repetirlas: el límite es el del equipo, no una cuota del producto. ' +
    'El movimiento de un día entra con holgura en minutos, y la sincronización con otros sistemas no tiene ' +
    'que espaciarse más allá de reintentar lo que falle.',
};

test('A.10.5 — Intercambio sin límite de volumen que condicione la operación', async ({ browser }, info) => {
  // «Determinar si el límite de operaciones del intercambio deja holgura sobre
  //  el movimiento diario de la cartera, si se alcanza en una jornada intensa,
  //  o si impide sincronizarla»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(1_800_000);

  const api = await apiEspo();
  const ids: string[] = [];
  /** Manda el movimiento de un día, de a `simultaneas` operaciones a la vez. */
  const mandar = async (etiqueta: string, simultaneas: number) => {
    const codigos: Record<string, number> = {};
    const inicio = Date.now();
    for (let lote = 0; lote < MOVIMIENTO_DIARIO; lote += simultaneas) {
      const r = await Promise.all(Array.from({ length: Math.min(simultaneas, MOVIMIENTO_DIARIO - lote) }, (_, i) =>
        api.post('Case', { data: { name: `VOL-intercambio-${etiqueta}-${lote + i}`, status: 'New' } })));
      for (const x of r) {
        codigos[x.status()] = (codigos[x.status()] ?? 0) + 1;
        if (x.ok()) ids.push((await x.json()).id);
      }
    }
    return { codigos, segundos: Math.round((Date.now() - inicio) / 1000) };
  };

  let rafaga, deAUna;
  try {
    rafaga = await mandar('rafaga', 10);
    deAUna = await mandar('secuencial', 1);
  } finally {
    // Se deja la cartera como estaba, termine como termine la medición
    for (let i = 0; i < ids.length; i += 20) {
      await Promise.all(ids.slice(i, i + 20).map(id => api.delete(`Case/${id}`)));
    }
    // Borrar por la interfaz solo marca el registro: quedan en la tabla y, corrida tras
    // corrida, vuelven más lenta cualquier búsqueda sobre reclamos, incluida la de B.1.4
    execFileSync('docker', ['exec', 'tp-espocrm-db', 'mariadb', '-uespocrm', '-pespocrm', 'espocrm', '-e',
      "DELETE FROM `case` WHERE deleted = 1 AND name LIKE 'VOL-intercambio-%'"]);
  }

  const lectura = `ráfaga de 10 simultáneas: ${JSON.stringify(rafaga.codigos)} en ${rafaga.segundos} s · ` +
                  `de a una: ${JSON.stringify(deAUna.codigos)} en ${deAUna.segundos} s`;
  console.log(`    A.10.5 medición: ${lectura}`);
  if (!VEREDICTO_A105) throw new Error(`A.10.5: fijar el veredicto a la vista de la medición (${lectura})`);
  // El veredicto fijado describe una medición sin rechazos: si esta los tuvo, hay que volver a mirarlo
  const aceptadas = (c: Record<string, number>) => Object.entries(c).filter(([k]) => Number(k) < 300).reduce((s, [, n]) => s + n, 0);
  expect(aceptadas(rafaga.codigos), 'en ráfaga deben pasar todas').toBe(MOVIMIENTO_DIARIO);
  expect(aceptadas(deAUna.codigos), 'de a una deben pasar todas').toBe(MOVIMIENTO_DIARIO);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/development/api/',
    buscar: /API key/i,
    captura: 'A-10-5-espocrm-1-sin-limite-publicado',
  });

  registrar({
    criterio: 'A.10.5',
    plataforma,
    cumple: VEREDICTO_A105.cumple,
    costo: 0,
    justificacion:
      'En la instalación propia la interfaz de programación no tiene un tope publicado: no lo impone el ' +
      'fabricante sino el equipo donde corre. Se mandó el movimiento de un día entero —' + MOVIMIENTO_DIARIO +
      ' altas— dos veces: en ráfaga, de a diez simultáneas, y de a una. ' + VEREDICTO_A105.lectura,
    documentacion: fuente,
    medicion: lectura,
  });
});

// ── A.10.1 a A.10.3 ──────────────────────────────────────────────────────────
// Los tres piden algo que el listado de la edición gratuita no calcula: totales
// y promedios agrupados, y un informe que se vuelve a ejecutar cambiando el
// período. Se comprueba qué ofrece la edición gratuita —el tablero, el listado
// filtrado y la exportación— y se cita lo que agrega el módulo de informes.

/** La exportación del listado: la salida que queda en la edición gratuita. */
async function formatosDeExportacion(page: import('@playwright/test').Page, entidad: string) {
  await listadoLimpio(page, entidad);
  await page.locator('thead input[type="checkbox"]').first().check({ force: true });
  await page.locator('.actions-button:visible').first().click();
  await page.locator('[data-action="export"]:visible').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('.field[data-name="format"] .selectize-input').first().click();
  const formatos = (await page.locator('.selectize-dropdown:visible .option').allTextContents()).map(t => t.trim());
  await page.keyboard.press('Escape');
  return formatos;
}

/** Las cajas que la página de inicio ofrece: ninguna agrupa entidades propias. */
async function cajasDisponibles(page: import('@playwright/test').Page) {
  await inicio(page);
  await clicEnAccion(page, page.locator('[data-action="addDashlet"]').first());
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(1500);
  const cajas = [...new Set((await dialogo.locator('a, li').allTextContents()).map(t => t.trim()).filter(Boolean))];
  return cajas;
}

const INFORMES = (browser: import('@playwright/test').Browser, prefijo: string) => Promise.all([
  citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: 'The Reports feature is available in Advanced Pack', captura: `${prefijo}-informes-1` }),
  citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: /summarized values, can be grouped/i, captura: `${prefijo}-informes-2` }),
]);

test('A.10.1 — Indicadores sobre la operación', async ({ page, browser }, info) => {
  // «Construir vistas que muestren el total de primas por estado de cobranza y
  //  el tiempo promedio de resolución de los reclamos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  const cajas = await cajasDisponibles(page);
  const capCajas = await capturar(page, 'A.10.1', plataforma, '1-cajas-del-tablero');
  await page.keyboard.press('Escape');
  const formatos = await formatosDeExportacion(page, 'CPoliza');
  const capExportar = await capturar(page, 'A.10.1', plataforma, '2-exportar-para-calcular-afuera');

  const fuentes = [
    ...await INFORMES(browser, 'A-10-1-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-10-1-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-10-1-espocrm-nube'),
  ];

  // Los indicadores que trae son los de ventas; las demás cajas son listas, sin totales
  const indicadores = cajas.filter(c => /canalización|por etapa|toma de contacto|ventas por mes/i.test(c));
  expect(indicadores.length, 'los indicadores de fábrica son los de ventas').toBeGreaterThan(0);
  expect(cajas.some(c => /póliza/i.test(c)), 'no hay indicadores sobre pólizas').toBeFalsy();

  registrar({
    criterio: 'A.10.1',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Los indicadores que trae la edición gratuita son los de ventas —oportunidades por etapa, por origen y ' +
      'por mes—. Para las pólizas y los reclamos el tablero ofrece listas, como los tickets pendientes de cada ' +
      'usuario, pero ninguna suma ni promedia. Para obtener el total de primas ' +
      'por estado de cobranza o el tiempo promedio de resolución hay que exportar el listado ' +
      `—${formatos.join(' o ')}— y calcularlo en una planilla, cada vez que se quiere ver el número. El módulo ` +
      'de informes que vende el fabricante agrupa y resume con sumas y promedios, y lo muestra en el tablero.',
    evidencia: [capCajas, capExportar],
    documentacion: fuentes,
    conPlan: [
      conPlanDe(ESPOCRM_ADVANCED_PACK, { cumple: 2, costo: 1,
        justificacion: 'Un informe agrupado suma las primas por estado de cobranza y promedia la resolución de reclamos, y se lo lleva al tablero.' }),
      conPlanDe(ESPOCRM_CLOUD_BASIC, { cumple: 2, costo: 1,
        justificacion: 'El servicio en la nube incluye el módulo de informes.' }),
    ],
  });
});

test('A.10.2 — Generación de informes definidos por el usuario', async ({ page, browser }, info) => {
  // «Producir un informe con el total de primas vendidas por cada productor en
  //  un período, eligiendo los criterios, y exportarlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  const formatos = await formatosDeExportacion(page, 'CPoliza');
  const capExportar = await capturar(page, 'A.10.2', plataforma, '1-listado-y-exportacion');

  const fuentes = [
    ...await INFORMES(browser, 'A-10-2-espocrm'),
    await citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: /export grid report results to XLSX/i, captura: 'A-10-2-espocrm-informes-3' }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-10-2-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-10-2-espocrm-nube'),
  ];

  registrar({
    criterio: 'A.10.2',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'En la edición gratuita el listado de pólizas se filtra por productor y por período y se exporta en ' +
      `${formatos.join(' o ')}, pero no suma: el total de primas por productor se arma en la planilla ` +
      'exportada, a mano, cada vez que se pide el informe. El módulo de informes del fabricante agrupa por ' +
      'productor, suma las primas del período elegido y exporta el resultado ya calculado.',
    evidencia: [capExportar],
    documentacion: fuentes,
    conPlan: [
      conPlanDe(ESPOCRM_ADVANCED_PACK, { cumple: 2, costo: 1,
        justificacion: 'El informe agrupado por productor suma las primas del período y se exporta a planilla.' }),
      conPlanDe(ESPOCRM_CLOUD_BASIC, { cumple: 2, costo: 1,
        justificacion: 'El servicio en la nube incluye el módulo de informes.' }),
    ],
  });
});

test('A.10.3 — Informe paramétrico reutilizable', async ({ page, browser }, info) => {
  // «Guardar un informe con el período como parámetro y volver a ejecutarlo
  //  para otro período sin rehacerlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // Lo más cercano en la edición gratuita: una búsqueda guardada con período relativo
  await entrar(page, plataforma);
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'vigenciaHasta');
  const periodos = (await comparacionesDe(page, 'vigenciaHasta')).map(o => o.texto);
  const capPeriodos = await capturar(page, 'A.10.3', plataforma, '1-periodos-del-filtro');

  const fuentes = [
    await citar(browser, { url: 'https://docs.espocrm.com/user-guide/reports/', buscar: 'Runtime Filters lets you narrow down the results', captura: 'A-10-3-espocrm-informes-1' }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-10-3-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-10-3-espocrm-nube'),
  ];

  registrar({
    criterio: 'A.10.3',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'La edición gratuita guarda búsquedas con períodos relativos —mes actual, mes pasado, trimestre, ' +
      `próximos días, entre ${periodos.length} opciones—, que se vuelven a abrir sin rearmarlas. Pero no es un ` +
      'informe con parámetro: para verlo sobre otro período hay que cambiar la condición, y el resultado sigue ' +
      'siendo un listado que hay que exportar y totalizar afuera. Los filtros al ejecutar del módulo de informes ' +
      'del fabricante piden el período cada vez que se corre el informe, sin editarlo.',
    evidencia: [capPeriodos],
    documentacion: fuentes,
    conPlan: [
      conPlanDe(ESPOCRM_ADVANCED_PACK, { cumple: 2, costo: 1,
        justificacion: 'El informe guardado pide el período al ejecutarse y se reutiliza sin editarlo.' }),
      conPlanDe(ESPOCRM_CLOUD_BASIC, { cumple: 2, costo: 1,
        justificacion: 'El servicio en la nube incluye el módulo de informes.' }),
    ],
  });
});
