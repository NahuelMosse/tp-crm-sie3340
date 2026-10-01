import { test, expect, Page, request } from '../../humano';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { registros, borrarRegistro, abrirFicha, configuracion, pestana, clicReal, esperarCarga, textoDe, exportar, BASE } from '../../twenty/ui';
import { cargarCartera, alistarReclamo, reclamosConPlazo, PRODUCTOR } from '../../twenty/escenario';
import { nuevoTablero, agregarGrafico, configurarGrafico, renglon, enRenglon, filtroDeFecha, guardarTablero, etiquetasDelGrafico } from '../../twenty/tableros';

/**
 * A.10 — Explotación de la información, sobre Twenty
 *
 * Los indicadores y los informes se arman con los tableros que trae el
 * producto; el intercambio, con su interfaz de programación.
 */

test.describe.configure({ mode: 'serial' });

/** La cifra de referencia de la sección 4.7: el movimiento diario de la cartera. */
const MOVIMIENTO_DIARIO = 500;

const ddmmaaaa = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const haceDias = (n: number) => new Date(Date.now() - n * 86_400_000);

/** Los tableros que arman estas pruebas, cada uno con su título. */
const TABLEROS = ['Primas por estado de cobranza', 'Tiempo de resolución de reclamos', 'Primas por productor'];

/** Borra los tableros de una corrida anterior: los de estas pruebas y los que quedaron sin título. */
async function sinTablerosDePrueba(api: any, desde: string) {
  for (const d of (await registros(api, 'dashboards')).filter(d => d.createdAt >= desde || !d.title || TABLEROS.includes(d.title))) {
    if (d.title === 'My First Dashboard') continue;
    await borrarRegistro(api, 'dashboards', d.id);
  }
}

// ── A.10.1 ───────────────────────────────────────────────────────────────────
test('A.10.1 — Indicadores sobre la operación', async ({ page, browser }, info) => {
  // «Construir vistas que muestren el total de primas por estado de cobranza y
  //  el tiempo promedio de resolución de los reclamos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await reclamosConPlazo(e);
  await sinTablerosDePrueba(e.api, '9999');

  // El total de primas por estado de cobranza: un gráfico sobre las pólizas
  await nuevoTablero(page, 'Primas por estado de cobranza');
  await agregarGrafico(page);
  await configurarGrafico(page, { fuente: 'Pólizas', ejeX: 'Estado de pago', ejeY: 'Prima', resumen: 'Suma' });
  await guardarTablero(page);
  const etiquetas = await etiquetasDelGrafico(page);
  const capPrimas = await capturar(page, 'A.10.1', plataforma, '1-primas-por-estado');

  // El tiempo de resolución: lo que un gráfico ofrece medir sobre los reclamos,
  // en un tablero de prueba que no se guarda
  await nuevoTablero(page, 'Tiempo de resolución de reclamos');
  await agregarGrafico(page);
  await enRenglon(page, /^Fuente$|^Source$/, 0, 'Reclamos');
  await renglon(page, /^Datos en pantalla$|^Data on display$/, 1);
  const medibles = await textoDe(page);
  const capReclamos = await capturar(page, 'A.10.1', plataforma, '2-medidas-sobre-reclamos');
  await page.keyboard.press('Escape');
  await clicReal(page, page.getByText(/^Cancel$|^Cancelar$/).filter({ visible: true }).first()).catch(() => {});

  const campos = medibles.slice(medibles.lastIndexOf('Formato'));
  const porEstado = new Map<string, number>();
  const estado = (await import('../../twenty/ui')).objeto;
  const opciones = (await estado(e.api, 'poliza')).fields.find((c: any) => c.name === 'estadoDePago').options;
  for (const p of await registros(e.api, 'polizas')) {
    const nombre = opciones.find((o: any) => o.value === p.estadoDePago)?.label ?? '(sin estado)';
    porEstado.set(nombre, (porEstado.get(nombre) ?? 0) + (p.prima?.amountMicros ?? 0) / 1e6);
  }
  console.log(`    primas por estado: ${[...porEstado].map(([k, v]) => `${k} ${v}`).join(' · ')} · gráfico: ${etiquetas.join(' ')}`);

  expect(etiquetas, 'el gráfico debe mostrar cada estado de cobranza').toEqual(expect.arrayContaining(['Al día', 'Vencida']));
  expect(campos, 'si los reclamos tuvieran una duración medible, este veredicto no corresponde').not.toMatch(/Duración|Tiempo de resolución/);

  registrar({
    criterio: 'A.10.1',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'Los tableros vienen de fábrica: se armó un gráfico con el total de primas por estado de cobranza ' +
      'eligiendo el objeto, el campo del eje y la suma de la prima, sin programar, y quedó guardado para ' +
      'consultarlo cuando se quiera. El tiempo promedio de resolución de los reclamos, en cambio, no se puede ' +
      'mostrar: el gráfico promedia campos numéricos, y el producto no calcula la duración de cada reclamo ni ' +
      'tiene campos que la deriven de sus fechas. Hay que agregar esa duración con un flujo con código que la ' +
      'escriba al cerrarse cada reclamo, que es desarrollo.',
    evidencia: [capPrimas, capReclamos],
    medicion: `Primas por estado: ${[...porEstado].map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')}`,
  });
});

// ── A.10.2 ───────────────────────────────────────────────────────────────────
test('A.10.2 — Generación de informes definidos por el usuario', async ({ page, browser }, info) => {
  // «Producir un informe con el total de primas vendidas por cada productor en
  //  un período, eligiendo los criterios, y exportarlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);

  // El período: las pólizas que empezaron su vigencia en los últimos seis meses
  const desde = haceDias(180);
  await nuevoTablero(page, 'Primas por productor');
  await agregarGrafico(page);
  await configurarGrafico(page, { fuente: 'Pólizas', ejeX: 'Productor', ejeY: 'Prima', resumen: 'Suma' });
  await renglon(page, /^Filtro$|^Filter$/);
  await filtroDeFecha(page, 'Vigencia desde', 'desde', ddmmaaaa(desde));
  await page.keyboard.press('Escape');
  await guardarTablero(page);
  const etiquetas = await etiquetasDelGrafico(page);
  const capInforme = await capturar(page, 'A.10.2', plataforma, '1-primas-por-productor');

  // Lo que el widget ofrece hacer con el informe
  const widget = page.locator('svg').filter({ has: page.locator('text') }).first();
  const caja = (await widget.boundingBox())!;
  await page.mouse.move(caja.x + caja.width / 2, caja.y + 20, { steps: 8 });
  await page.waitForTimeout(800);
  const menu = page.locator('button:visible').filter({ hasNot: page.locator('text') });
  const botones = await menu.evaluateAll((bs, c) => bs.map(b => b.getBoundingClientRect())
    .map((r, i) => ({ i, x: r.x, y: r.y })).filter(r => r.y > c.y - 60 && r.y < c.y + 20 && r.x > c.x), caja);
  let acciones = '';
  if (botones.length) {
    await clicReal(page, menu.nth(botones[botones.length - 1].i));
    acciones = await textoDe(page);
    await page.keyboard.press('Escape');
  }
  const capAcciones = await capturar(page, 'A.10.2', plataforma, '2-acciones-del-widget');

  // La salida que queda: exportar las pólizas y sumar afuera
  const archivo = await exportar(page, 'polizas', join(mkdtempSync(join(tmpdir(), 'informe-')), 'polizas.csv'));
  const filas = readFileSync(archivo, 'utf8').split(/\r?\n/).filter(Boolean).length - 1;

  const esperado = new Map<string, number>();
  const miembros = await registros(e.api, 'workspaceMembers');
  for (const p of (await registros(e.api, 'polizas')).filter(p => p.vigenciaDesde && p.vigenciaDesde >= desde.toLocaleDateString('sv-SE'))) {
    const m = miembros.find(x => x.id === p.productorId);
    const nombre = m ? `${m.name.firstName} ${m.name.lastName}` : '(sin productor)';
    esperado.set(nombre, (esperado.get(nombre) ?? 0) + (p.prima?.amountMicros ?? 0) / 1e6);
  }
  console.log(`    esperado: ${[...esperado].map(([k, v]) => `${k} ${v}`).join(' · ')} · gráfico: ${etiquetas.join(' ')} · ${filas} filas exportadas`);

  expect(etiquetas.join(' '), 'el informe debe mostrar al productor').toContain(`${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`);
  expect(acciones, 'si el widget se exportara, este veredicto no corresponde').not.toMatch(/Export|Descargar|Download/i);

  registrar({
    criterio: 'A.10.2',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El informe se armó desde un tablero, eligiendo los criterios sin programar: un gráfico con la suma de ' +
      'la prima de las pólizas agrupada por productor, filtrado por las que empezaron su vigencia en los ' +
      'últimos seis meses. Muestra el total de cada productor y queda guardado. Pero el gráfico no se exporta: ' +
      'el widget no ofrece descargarlo. Lo que se puede sacar es el listado de pólizas, a un archivo que la ' +
      'planilla abre, y los totales por productor hay que rehacerlos ahí cada vez que se necesita el informe ' +
      'fuera del sistema.',
    evidencia: [capInforme, capAcciones],
    medicion: `Totales esperados: ${[...esperado].map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')} · ${filas} pólizas exportadas`,
  });
});

// ── A.10.3 ───────────────────────────────────────────────────────────────────
test('A.10.3 — Informe paramétrico reutilizable', async ({ page, browser }, info) => {
  // «Guardar un informe con el período como parámetro y volver a ejecutarlo
  //  para otro período sin rehacerlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const tablero = (await registros(e.api, 'dashboards')).filter(d => d.title === 'Primas por productor')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  expect(tablero, 'A.10.2 debe haber dejado el informe guardado').toBeTruthy();

  await abrirFicha(page, 'dashboard', tablero.id);
  await esperarCarga(page, 6000);
  const antes = await etiquetasDelGrafico(page);
  const capAntes = await capturar(page, 'A.10.3', plataforma, '1-seis-meses');

  // Otro período: el año entero. Se cambia la fecha del filtro guardado, nada más
  await clicReal(page, page.getByText(/^Editar$|^Edit$/).filter({ visible: true }).first()).catch(() => {});
  await page.waitForTimeout(2000);
  await clicReal(page, page.locator('svg').filter({ has: page.locator('text') }).first());
  await renglon(page, /^Filtro$|^Filter$/);
  const valor = page.locator('input:visible').last();
  await clicReal(page, valor);
  await valor.press('Control+a');
  await valor.pressSequentially(ddmmaaaa(haceDias(400)), { delay: 60 });
  await valor.press('Enter');
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await guardarTablero(page);
  const despues = await etiquetasDelGrafico(page);
  const capDespues = await capturar(page, 'A.10.3', plataforma, '2-un-anio');

  console.log(`    seis meses: ${antes.join(' ')} · un año: ${despues.join(' ')}`);
  expect(despues.join(' '), 'con otro período el informe debe dar otros totales').not.toBe(antes.join(' '));

  registrar({
    criterio: 'A.10.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El informe de primas por productor quedó guardado en su tablero con el período como condición del ' +
      'filtro. Para otro período se abrió el mismo gráfico y se cambió solo la fecha del filtro: los totales ' +
      'se recalcularon sin rehacer el informe, que conserva su fuente, su agrupación y su medida. El período no ' +
      'se pide al abrirlo: cambiarlo modifica el informe guardado para todos los que lo miran, o hay que ' +
      'duplicarlo. Armarlo es configuración de una sola vez.',
    evidencia: [capAntes, capDespues],
    medicion: `Seis meses: ${antes.join(' ')} · un año: ${despues.join(' ')}`,
  });
});

/** Crea una clave de la interfaz de programación desde Configuración y devuelve su valor. */
async function claveDeApi(page: Page, nombre: string): Promise<string> {
  await configuracion(page, /^MCP y API$|^MCP & API/);
  await pestana(page, /^API$/);
  await clicReal(page, page.getByText('Crear clave API', { exact: true }).last());
  await esperarCarga(page, 3000);
  const campo = page.getByPlaceholder(/integración de backoffice|backoffice integration/);
  await clicReal(page, campo);
  await campo.pressSequentially(nombre, { delay: 50 });
  await clicReal(page, page.getByText(/^Guardar$|^Save$/).filter({ visible: true }).last());
  await page.waitForURL(/\/apis\/[0-9a-f-]{36}/, { timeout: 30_000 });
  await esperarCarga(page, 3000);
  const valor = await page.locator('input:visible').evaluateAll(es => es.map(e => (e as HTMLInputElement).value).find(v => v.startsWith('eyJ')));
  if (!valor) throw new Error('La clave no se mostró al crearla');
  return valor;
}

/** Borra la clave desde su pantalla: pide escribir «sí». */
async function borrarClave(page: Page, nombre: string) {
  await configuracion(page, /^MCP y API$|^MCP & API/);
  await pestana(page, /^API$/);
  const fila = page.getByText(nombre, { exact: true }).first();
  if (!(await fila.isVisible().catch(() => false))) return;
  await clicReal(page, fila);
  await esperarCarga(page, 3000);
  await clicReal(page, page.getByText(/^Eliminar$|^Delete$/).filter({ visible: true }).last());
  const dialogo = page.getByRole('dialog').last();
  await clicReal(page, dialogo.locator('input').first());
  await page.keyboard.type('sí', { delay: 60 });
  await clicReal(page, dialogo.getByRole('button', { name: /^Eliminar|^Delete/ }).last());
  await page.waitForTimeout(3000);
}

// ── A.10.4 ───────────────────────────────────────────────────────────────────
test('A.10.4 — Intercambio de datos con otros sistemas de la compañía', async ({ page, browser }, info) => {
  // «Crear y consultar registros desde fuera del sistema, por la vía que la
  //  plataforma habilite»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const NOMBRE = 'Integración emisión';
  await borrarClave(page, NOMBRE);
  const clave = await claveDeApi(page, NOMBRE);
  const capClave = await capturar(page, 'A.10.4', plataforma, '1-clave-de-integracion');

  // El otro sistema: habla con su clave, sin usuario ni contraseña de nadie
  const externo = await request.newContext({ baseURL: `${BASE}/rest/`, extraHTTPHeaders: { Authorization: `Bearer ${clave}` } });
  let creado: any, consulta: any, alta: any;
  try {
    alta = await externo.post('people', { data: { name: { firstName: 'Registro', lastName: 'Desde la emisión' }, emails: { primaryEmail: 'emision@ejemplo.test' } } });
    creado = Object.values((await alta.json()).data ?? {})[0];
    consulta = Object.values((await (await externo.get(`people/${creado?.id}`)).json()).data ?? {})[0];
  } finally {
    if (creado?.id) {
      await externo.delete(`people/${creado.id}`);
      await externo.delete(`people/${creado.id}`, { params: { soft_delete: 'false' } });
    }
  }

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/developers/extend/api',
    buscar: /immediately gets REST and GraphQL endpoints/i,
    captura: 'A-10-4-twenty-2-interfaz-de-programacion',
  });

  expect(alta.ok(), 'el otro sistema debe poder crear registros').toBeTruthy();
  expect(consulta?.name?.lastName).toBe('Desde la emisión');

  registrar({
    criterio: 'A.10.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El producto trae interfaces de programación REST y GraphQL que se generan solas a partir del modelo ' +
      'de datos, incluidos los objetos propios como la póliza. Desde Configuración se creó una clave para el ' +
      'otro sistema, que lleva un rol que define lo que puede hacer, sin la contraseña de ninguna persona; con ' +
      'esa clave, desde fuera del sistema, se dio de alta un asegurado y se lo volvió a consultar. Crear la clave ' +
      'es configuración; lo que el otro sistema haga con la interfaz es trabajo de ese sistema, no de este.',
    evidencia: [capClave],
    documentacion: fuente,
  });
  // La clave queda vigente para A.10.5, que la usa y la borra
  (globalThis as any).claveA105 = clave;
});

// ── A.10.5 ───────────────────────────────────────────────────────────────────
test('A.10.5 — Intercambio sin límite de volumen que condicione la operación', async ({ page, browser }, info) => {
  // «Determinar si el límite de operaciones del intercambio deja holgura sobre
  //  el movimiento diario de la cartera, si se alcanza en una jornada intensa,
  //  o si impide sincronizarla»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(2_400_000);

  await entrar(page, plataforma);
  const NOMBRE = 'Integración emisión';
  const clave: string = (globalThis as any).claveA105 ?? await claveDeApi(page, NOMBRE);
  const externo = await request.newContext({ baseURL: `${BASE}/rest/`, extraHTTPHeaders: { Authorization: `Bearer ${clave}` } });
  const { apiTwenty } = await import('../../twenty/ui');
  await alistarReclamo(await apiTwenty(page));

  // El movimiento de un día, en ráfagas de diez altas simultáneas, como lo
  // mandaría un sistema que sincroniza de golpe. Lo rechazado se reintenta
  const codigos: Record<string, number> = {};
  let pendientes = Array.from({ length: MOVIMIENTO_DIARIO }, (_, i) => i);
  let rondas = 0;
  const inicio = Date.now();
  try {
    while (pendientes.length && rondas < 20) {
      rondas++;
      const rechazados: number[] = [];
      for (let lote = 0; lote < pendientes.length; lote += 10) {
        const grupo = pendientes.slice(lote, lote + 10);
        const r = await Promise.all(grupo.map(i => externo.post('reclamos', { data: { name: `VOL-intercambio-${i}` } })));
        r.forEach((x, k) => {
          codigos[x.status()] = (codigos[x.status()] ?? 0) + 1;
          if (!x.ok()) rechazados.push(grupo[k]);
        });
      }
      pendientes = rechazados;
      if (pendientes.length) await page.waitForTimeout(60_000);
    }
  } finally {
    // Se deja la cartera como estaba, termine como termine la medición: por la
    // base, porque borrar quinientos registros por la interfaz vuelve a chocar con el límite
    const esquemas = execFileSync('docker', ['exec', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default', '-At', '-c',
      "select table_schema from information_schema.tables where table_name = '_reclamo' and table_schema like 'workspace_%'"],
    { encoding: 'utf8' }).trim().split(/\s+/).filter(Boolean);
    for (const s of esquemas) {
      execFileSync('docker', ['exec', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default', '-c',
        `delete from ${s}."_reclamo" where name like 'VOL-intercambio-%'`]);
    }
    await borrarClave(page, NOMBRE);
  }
  const minutos = Math.round((Date.now() - inicio) / 6000) / 10;
  const aceptadas = Object.entries(codigos).filter(([k]) => Number(k) < 300).reduce((s, [, n]) => s + n, 0);
  const limitadas = codigos['429'] ?? 0;
  const lectura = `${aceptadas} de ${MOVIMIENTO_DIARIO} aceptadas en ${minutos} min y ${rondas} ronda(s); ${limitadas} rechazos por límite · ${JSON.stringify(codigos)}`;
  console.log(`    A.10.5 medición: ${lectura}`);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/developers/extend/api',
    buscar: /100 per minute/i,
    captura: 'A-10-5-twenty-1-limite-publicado',
  });

  expect(aceptadas, 'el movimiento de un día debe entrar entero').toBe(MOVIMIENTO_DIARIO);

  registrar({
    criterio: 'A.10.5',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El fabricante publica el límite de la interfaz de programación: cien pedidos por minuto, y hasta sesenta ' +
      'registros por pedido en las operaciones por lotes. Se mandó el movimiento de un día entero —' +
      `${MOVIMIENTO_DIARIO} altas— en ráfagas de diez simultáneas, de a un registro por pedido: ` +
      (limitadas
        ? `${limitadas} fueron rechazadas por el límite y pasaron al reintentarlas un minuto después; las ${MOVIMIENTO_DIARIO} ` +
          `entraron en ${minutos} minutos. `
        : `entraron las ${MOVIMIENTO_DIARIO} en ${minutos} minutos, sin rechazos. `) +
      'El límite deja holgura sobre el movimiento de un día: lo que exige es que el otro sistema espacie sus ' +
      'pedidos o los agrupe, como hace cualquier sincronización.',
    documentacion: fuente,
    medicion: lectura,
  });
});
