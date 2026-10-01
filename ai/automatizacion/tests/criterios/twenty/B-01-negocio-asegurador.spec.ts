import { test, expect } from '../../humano';
import type { Response } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { apiTwenty, registros, abrirListado, configuracion, clicReal, textoDe, buscarEnTodo, nuevoRegistro, BASE } from '../../twenty/ui';
import { alistarReclamo } from '../../twenty/escenario';

/**
 * B.1 — Condiciones que impone el negocio asegurador, sobre Twenty
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 */

test.describe.configure({ mode: 'serial' });

const docker = (...args: string[]) => execFileSync('docker', args, { encoding: 'utf8', maxBuffer: 512 << 20 });
const psql = (consulta: string, base = 'default', contenedor = 'twenty-db-1') =>
  docker('exec', contenedor, 'psql', '-U', 'postgres', '-d', base, '-At', '-c', consulta).trim();
/** El esquema del espacio de trabajo: ahí viven los registros. */
const esquema = () => psql("select schema_name from information_schema.schemata where schema_name like 'workspace_%'").split('\n')[0];

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans',
    buscar: 'Full control over your data',
    captura: 'B-1-1-twenty-1-datos-propios',
  });

  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna ' +
      'cuenta del fabricante: no hay condición de servicio que los afecte por falta de uso, porque no hay ' +
      'servicio de por medio, y el fabricante la ofrece con el control total de los datos. Una póliza puede ' +
      'quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el sistema se mantenga.',
    documentacion: fuente,
  });
});

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Copia propia y completa de la cartera', async ({ browser }, info) => {
  // «Obtener una copia de toda la información, incluidos los archivos
  //  adjuntos, y comprobar que puede restituirse»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  const ws = esquema();
  const contar = (tabla: string, contenedor?: string) =>
    Number(psql(`select count(*) from ${ws}."${tabla}" where "deletedAt" is null`, 'default', contenedor));
  const antes = { personas: contar('person'), polizas: contar('_poliza'), reclamos: contar('_reclamo') };

  // La copia: el volcado de la base y la carpeta donde el servidor guarda los
  // archivos adjuntos. Va a una carpeta temporal: el volcado trae credenciales
  const dir = mkdtempSync(join(tmpdir(), 'copia-twenty-'));
  docker('exec', 'twenty-db-1', 'sh', '-c', 'pg_dump -U postgres -Fc default > /tmp/copia.dump');
  docker('cp', 'twenty-db-1:/tmp/copia.dump', join(dir, 'base.dump'));
  docker('exec', 'twenty-db-1', 'rm', '-f', '/tmp/copia.dump');
  docker('run', '--rm', '--volumes-from', 'twenty-server-1', '-v', `${dir}:/copia`, 'alpine',
    'tar', '-czf', '/copia/archivos.tar.gz', '-C', '/app/packages/twenty-server/.local-storage', '.');
  const pesoBase = statSync(join(dir, 'base.dump')).size;
  const pesoArchivos = statSync(join(dir, 'archivos.tar.gz')).size;

  // La restitución: en una base aparte, para no tocar la que está en uso
  const prueba = 'tp-twenty-restitucion';
  try { docker('rm', '-f', prueba); } catch { /* no había */ }
  try {
    docker('run', '-d', '--name', prueba, '-e', 'POSTGRES_PASSWORD=r', 'postgres:16');
    // El servidor provisorio de la inicialización no escucha por TCP: se espera al definitivo
    for (let i = 0; i < 90; i++) {
      try { docker('exec', prueba, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres'); break; }
      catch { await new Promise(r => setTimeout(r, 2000)); }
    }
    docker('cp', join(dir, 'base.dump'), `${prueba}:/base.dump`);
    // La imagen arranca un servidor provisorio para inicializarse y después lo
    // reinicia: la restitución se reintenta hasta que el definitivo acepte conexiones
    for (let intento = 1; ; intento++) {
      try {
        docker('exec', prueba, 'sh', '-c',
          'dropdb -U postgres --if-exists default; createdb -U postgres default && pg_restore -U postgres -d default --no-owner /base.dump');
        break;
      } catch (e) {
        // pg_restore sale con error por avisos de extensiones y roles; lo que importa es el recuento
        const restituido = (() => {
          try { return psql(`select count(*) from information_schema.schemata where schema_name = '${ws}'`, 'default', prueba) === '1'; }
          catch { return false; }
        })();
        if (restituido) break;
        if (intento >= 20) throw e;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    const despues = { personas: contar('person', prueba), polizas: contar('_poliza', prueba), reclamos: contar('_reclamo', prueba) };
    const archivos = docker('run', '--rm', '-v', `${dir}:/copia`, 'alpine', 'sh', '-c', 'tar -tzf /copia/archivos.tar.gz | grep -v "/$" | wc -l').trim();

    expect(despues, 'la cartera restituida debe coincidir con la original').toEqual(antes);

    const fuente = await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose',
      buscar: 'Regular backups protect your CRM data from loss',
      captura: 'B-1-2-twenty-1-procedimiento',
    });

    registrar({
      criterio: 'B.1.2',
      plataforma,
      cumple: 2,
      justificacion:
        'Se obtuvo una copia completa con el procedimiento que indica el fabricante: el volcado de la base de ' +
        'datos, y el archivo de la carpeta donde el servidor guarda los adjuntos. La copia se restituyó en una ' +
        `base de datos aparte y la cartera volvió entera: ${despues.personas} personas, ${despues.polizas} pólizas ` +
        `y ${despues.reclamos} reclamos, los mismos que en el sistema en uso. La compañía tiene en su poder toda ` +
        'la información, en el formato abierto de la base, y no depende de nadie para recuperarla.',
      documentacion: fuente,
      medicion: `Base de ${Math.round(pesoBase / 1024)} KB y ${archivos} archivos adjuntos en ${Math.round(pesoArchivos / 1024)} KB; ` +
        'restituida sin diferencias',
    });
  } finally {
    try { docker('rm', '-f', prueba); } catch { /* ya no estaba */ }
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Copia periódica sin intervención manual', async ({ page, browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose',
    buscar: 'Automate Daily Backups',
    captura: 'B-1-3-twenty-1-programar-en-el-servidor',
  });

  // Lo que el panel de administración ofrece: estado y variables, ninguna copia
  await entrar(page, plataforma);
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  const panel = await textoDe(page);
  const capPanel = await capturar(page, 'B.1.3', plataforma, '2-panel-de-administracion');

  expect(panel, 'el producto no programa copias por sí mismo').not.toMatch(/backup|copia de seguridad|respaldo/i);

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    justificacion:
      'El producto no trae una copia programada: su panel de administración muestra el estado del servidor y ' +
      'sus variables, y ninguna opción genera un respaldo. La documentación del fabricante resuelve la ' +
      'repetición afuera, con el programador de tareas del servidor, que ejecuta todas las noches el volcado ' +
      'de la base. La condición se satisface con una limitación que la compañía asume: la copia se repite sola, ' +
      'pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el ' +
      'sistema no avisa si una noche falló.',
    evidencia: [capPanel],
    documentacion: fuente,
  });
});

// ── B.1.5 ────────────────────────────────────────────────────────────────────
test('B.1.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'Always back up your database before starting the upgrade process',
      captura: 'B-1-5-twenty-1-la-dispara-el-administrador',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'The server runs all required upgrade migrations automatically on startup',
      captura: 'B-1-5-twenty-2-al-arrancar-la-version-nueva',
    }),
  ];

  // La imagen de la instalación evaluada: una versión fija, que cambia solo si se la cambia
  const imagen = docker('inspect', 'twenty-server-1', '--format', '{{.Config.Image}}').trim();

  registrar({
    criterio: 'B.1.5',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia la actualización no llega sola: el administrador de la compañía cambia la ' +
      'versión de la imagen, hace antes la copia de la base que pide el fabricante y reinicia; recién al ' +
      'arrancar la versión nueva el servidor aplica sus cambios. La compañía elige el momento —fuera del ' +
      'horario de atención, después de probarla— y ningún cambio del sistema la sorprende durante la operación.',
    documentacion: fuentes,
    medicion: `Imagen en uso: ${imagen}`,
  });
});

// ── B.1.6 ────────────────────────────────────────────────────────────────────
test('B.1.6 — Conocimiento y decisión sobre dónde residen los datos', async ({ browser }, info) => {
  // «Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans',
      buscar: 'Host Twenty on your own infrastructure at no cost',
      captura: 'B-1-6-twenty-1-infraestructura-propia',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/setup',
      buscar: /S3-compatible/i,
      captura: 'B-1-6-twenty-2-archivos-donde-se-elija',
    }),
  ];

  registrar({
    criterio: 'B.1.6',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia la base de datos reside donde la compañía instala el sistema: en su propio ' +
      'servidor o en el proveedor que ella elija, en el país que ella elija, y los adjuntos van al disco del ' +
      'servidor o al almacenamiento que ella configure. Sabe en todo momento dónde están los datos de sus ' +
      'asegurados y lo decide ella, que es lo que exige el tratamiento de datos sensibles de los seguros de ' +
      'personas. La contracara es que la seguridad de esos datos queda también a su cargo.',
    documentacion: fuentes,
  });
});

// ── B.1.7 ────────────────────────────────────────────────────────────────────
test('B.1.7 — Continuidad de la atención ante una caída del enlace', async ({ browser }, info) => {
  // «Interrumpir la conexión externa y determinar qué parte de la operación
  //  diaria sigue siendo posible»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  // Sin salida a internet: el navegador solo alcanza el servidor de la red propia
  const contexto = await browser.newContext({ baseURL: BASE, locale: 'es-AR', viewport: { width: 1440, height: 900 } });
  const bloqueados: string[] = [];
  await contexto.route('**/*', ruta => {
    const host = new URL(ruta.request().url()).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return ruta.continue();
    bloqueados.push(host);
    return ruta.abort('internetdisconnected');
  });
  const page = await contexto.newPage();

  const hechas: string[] = [];
  let capSinEnlace = '';
  try {
    await entrar(page, plataforma);
    if (/\/objects\//.test(page.url())) hechas.push('ingresar');
    const hallado = await buscarEnTodo(page, 'Gutiérrez');
    if (hallado.includes('María Belén Gutiérrez')) hechas.push('buscar un asegurado');
    await page.keyboard.press('Escape');
    const api = await apiTwenty(page);
    await alistarReclamo(api);
    for (const r of (await registros(api, 'reclamos')).filter(r => r.name === 'Reclamo tomado sin conexión externa')) {
      await api.delete(`reclamos/${r.id}`);
      await api.delete(`reclamos/${r.id}`, { params: { soft_delete: 'false' } });
    }
    const id = await nuevoRegistro(page, 'reclamos', 'Reclamo', 'Reclamo tomado sin conexión externa');
    if ((await registros(api, 'reclamos')).some(r => r.id === id)) hechas.push('registrar un reclamo');
    capSinEnlace = await capturar(page, 'B.1.7', plataforma, '1-operando-sin-enlace');
  } finally {
    await contexto.close();
  }

  expect(hechas, 'la operación diaria debe seguir sin salida a internet').toEqual(
    ['ingresar', 'buscar un asegurado', 'registrar un reclamo']);

  registrar({
    criterio: 'B.1.7',
    plataforma,
    cumple: 2,
    justificacion:
      'Con la salida a internet cortada —el navegador solo alcanzaba el servidor de la red propia— se ingresó ' +
      'al sistema, se buscó un asegurado y se registró un reclamo, que es la atención de todos los días. La ' +
      'instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es lo que ' +
      'por naturaleza viaja por internet, como el correo y los logotipos de las empresas que la interfaz trae ' +
      'de un servicio externo. Con el sistema en la red de la compañía, una caída del enlace no detiene la atención.',
    evidencia: [capSinEnlace],
    medicion: `${bloqueados.length} pedidos a direcciones externas bloqueados durante la prueba` +
      (bloqueados.length ? ` (${[...new Set(bloqueados)].join(', ')})` : ''),
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
/**
 * El veredicto de B.1.4 se fija a la vista de la medición, con la pregunta de
 * la sección 4.7: ¿la búsqueda responde sin espera perceptible, con una demora
 * que el usuario nota y tolera, o de forma impracticable? No hay un corte en
 * segundos que lo decida. Hasta que se fija, el test mide, informa y no registra nada.
 */
const VEREDICTO_B14: null | { cumple: 2 | 1 | 0; lectura: string } = {
  cumple: 2,
  lectura:
    'Buscar un asegurado entre cinco mil respondió en un cuarto de segundo o menos las tres veces, y filtrar ' +
    'las doce mil quinientas pólizas por ramo, en menos de dos décimas: no hay espera que el usuario perciba. ' +
    'Con la cartera de referencia cargada, el sistema responde como con una cartera chica.',
};

/** Los tiempos con los que se fijó el veredicto: si una corrida los supera con holgura, se vuelve a mirar. */
const MEDIDO_B14 = { texto: 0.25, filtro: 0.14 };

/** Cuánto tardó el servidor en responder un pedido, en segundos. */
async function demora(r: Response) {
  await r.finished();
  return r.request().timing().responseEnd / 1000;
}

test('B.1.4 — Búsqueda y operación con volumen productivo', async ({ page }, info) => {
  // «Cargar la cartera de referencia, buscar un registro por texto y repetir el
  //  filtrado por campo: determinar si responde sin espera perceptible, con una
  //  demora que el usuario nota y tolera, o de forma impracticable»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(5_400_000);

  // La cartera de referencia de la sección 4.7: 25.000 registros. Se carga
  // directo en la base: lo que se mide es cómo responde el sistema con la
  // cartera cargada, no cómo se carga. Todo lo cargado lleva el prefijo VOL
  const ws = esquema();
  const CARTERA = { person: 5_000, _poliza: 12_500, _reclamo: 7_500 };
  const borrarCarga = () => psql(
    `delete from ${ws}."person" where "nameLastName" like 'VOL-%'; ` +
    `delete from ${ws}."_poliza" where "name" like 'VOL-POL-%'; ` +
    `delete from ${ws}."_reclamo" where "name" like 'VOL-RECLAMO-%';`);

  const inicioCarga = Date.now();
  const medidas: Record<string, number[]> = { texto: [], filtro: [] };
  try {
    borrarCarga();
    psql(`insert into ${ws}."person" ("nameFirstName", "nameLastName", "createdByName", "updatedByName")
          select 'Asegurado ' || s, 'VOL-' || lpad(s::text, 5, '0'), 'Carga de volumen', 'Carga de volumen'
          from generate_series(0, ${CARTERA.person - 1}) s`);
    psql(`insert into ${ws}."_poliza" ("name", "ramo", "createdByName", "updatedByName")
          select 'VOL-POL-' || s, (array['AUTOMOTOR','HOGAR','VIDA','SALUD'])[s % 4 + 1]::${ws}."_poliza_ramo_enum",
                 'Carga de volumen', 'Carga de volumen'
          from generate_series(0, ${CARTERA._poliza - 1}) s`);
    psql(`insert into ${ws}."_reclamo" ("name", "createdByName", "updatedByName")
          select 'VOL-RECLAMO-' || s, 'Carga de volumen', 'Carga de volumen'
          from generate_series(0, ${CARTERA._reclamo - 1}) s`);
    const cargados = ['person', '_poliza', '_reclamo'].map(t => Number(psql(`select count(*) from ${ws}."${t}"`))).reduce((a, b) => a + b, 0);
    expect(cargados, 'la cartera de referencia debe quedar cargada').toBeGreaterThanOrEqual(25_000);
    const minutosCarga = Math.round((Date.now() - inicioCarga) / 60_000);

    await entrar(page, plataforma);
    // Buscar un asegurado por texto entre cinco mil, tres veces, desde la búsqueda general
    for (const buscado of ['VOL-04321', 'VOL-00777', 'VOL-02468']) {
      await abrirListado(page, 'people');
      const buscador = page.getByPlaceholder(/^Escribe cualquier cosa|^Type anything|^Search/).filter({ visible: true }).first();
      if (!(await buscador.isVisible().catch(() => false))) {
        await clicReal(page, page.getByRole('button', { name: /^Search$|^Buscar$/ }).first());
        await page.waitForTimeout(800);
      }
      // El buscador conserva la búsqueda anterior: se hace clic en él y se borra antes de escribir
      await clicReal(page, buscador);
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(500);
      const respuesta = page.waitForResponse(r => r.url().includes('/graphql') && (r.request().postData() ?? '').includes(buscado),
        { timeout: 120_000 });
      await page.keyboard.type(buscado, { delay: 70 });
      medidas.texto.push(await demora(await respuesta));
      await page.getByText(buscado).filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 120_000 });
      await page.keyboard.press('Escape');
    }
    const capTexto = await capturar(page, 'B.1.4', plataforma, '1-busqueda-por-texto');

    // Filtrar pólizas por ramo entre doce mil quinientas, tres veces
    for (const ramo of ['Automotor', 'Vida', 'Salud']) {
      await abrirListado(page, 'polizas');
      await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
      await clicReal(page, page.getByText('Ramo', { exact: true }).last());
      await page.waitForTimeout(1000);
      const valor = ramo.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
      const respuesta = page.waitForResponse(r => r.url().includes('/graphql') && /polizas/i.test(r.request().postData() ?? '')
        && (r.request().postData() ?? '').includes(valor), { timeout: 120_000 });
      await clicReal(page, page.getByText(ramo, { exact: true }).filter({ visible: true }).last());
      medidas.filtro.push(await demora(await respuesta));
      await page.locator('[data-testid^="row-id-"]').first().waitFor({ state: 'visible', timeout: 120_000 });
      await page.keyboard.press('Escape');
    }
    const capFiltro = await capturar(page, 'B.1.4', plataforma, '2-filtrado-por-ramo');

    const lectura = `texto ${medidas.texto.map(s => s.toFixed(2)).join(' / ')} s · ` +
                    `filtro ${medidas.filtro.map(s => s.toFixed(2)).join(' / ')} s · carga ${minutosCarga} min`;
    console.log(`    B.1.4 medición: ${lectura}`);
    if (!VEREDICTO_B14) throw new Error(`B.1.4: fijar el veredicto a la vista de la medición (${lectura})`);
    const lejos = Math.max(...medidas.texto) > 2 * MEDIDO_B14.texto || Math.max(...medidas.filtro) > 2 * MEDIDO_B14.filtro;
    if (lejos) throw new Error(`B.1.4: la medición cambió respecto de la que sostiene el veredicto; volver a mirarlo (${lectura})`);

    registrar({
      criterio: 'B.1.4',
      plataforma,
      cumple: VEREDICTO_B14.cumple,
      justificacion:
        'Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil ' +
        'quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los ' +
        'días: buscar un asegurado por texto desde la búsqueda general y filtrar las pólizas por ramo, tres veces ' +
        'cada una. ' + VEREDICTO_B14.lectura,
      evidencia: [capTexto, capFiltro],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    borrarCarga();
  }
});
