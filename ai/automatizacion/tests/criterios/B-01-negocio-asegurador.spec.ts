import { test, expect } from '../humano';
import type { Response } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, statSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import { apiEspo, cuantos } from '../api';
import { soloEn, capturar, listadoLimpio, filasDelListado, agregarFiltro, filtrarPorLista } from './comun';
import { administracion, alta } from '../espocrm/navegar';

/**
 * B.1 — Condiciones que impone el negocio asegurador
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 */

test.describe.configure({ mode: 'serial' });

const docker = (...args: string[]) =>
  execFileSync('docker', args, { encoding: 'utf8', maxBuffer: 256 << 20 });

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
    buscar: 'have all the data stored on your own server',
    captura: 'B-1-1-espocrm-1-datos-propios',
  });

  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna ' +
      'cuenta del fabricante: no hay condición de servicio que los afecte por falta de uso, porque no hay ' +
      'servicio de por medio. Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el ' +
      'equipo donde corre el sistema se mantenga.',
    documentacion: fuente,
  });
});

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Copia propia y completa de la cartera', async ({ browser }, info) => {
  // «Obtener una copia de toda la información, incluidos los archivos
  //  adjuntos, y comprobar que puede restituirse»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(2_700_000);

  const api = await apiEspo();
  const antes = { contactos: await cuantos(api, 'Contact'), polizas: await cuantos(api, 'CPoliza') };

  // La copia: la base de datos y la carpeta de datos, que guarda los adjuntos.
  // Va a una carpeta temporal: el volcado trae credenciales y no se versiona.
  const dir = mkdtempSync(join(tmpdir(), 'copia-espocrm-'));
  const volcado = docker('exec', 'tp-espocrm-db', 'mariadb-dump', '-uespocrm', '-pespocrm', 'espocrm');
  writeFileSync(join(dir, 'base.sql'), volcado, 'utf8');
  docker('run', '--rm', '--volumes-from', 'tp-espocrm', '-v', `${dir}:/copia`, 'alpine',
    'tar', '-czf', '/copia/datos.tar.gz', '-C', '/var/www/html/data', '.');
  const pesoBase = statSync(join(dir, 'base.sql')).size;
  const pesoDatos = statSync(join(dir, 'datos.tar.gz')).size;

  // La restitución: en una base aparte, para no tocar la que está en uso
  const prueba = 'tp-espocrm-restitucion';
  docker('rm', '-f', prueba);
  try {
    docker('run', '-d', '--name', prueba, '-e', 'MARIADB_ROOT_PASSWORD=r', '-e', 'MARIADB_DATABASE=espocrm', 'mariadb:11');
    // La imagen arranca un servidor provisorio para inicializarse y después lo
    // reinicia: se espera a que su registro diga que terminó y que el definitivo está listo
    const listo = () => {
      // El servidor escribe su registro por la salida de errores
      const r = spawnSync('docker', ['logs', prueba], { encoding: 'utf8' });
      const registro = `${r.stdout}${r.stderr}`;
      const fin = registro.indexOf('init process done');
      return fin > -1 && registro.indexOf('ready for connections', fin) > -1;
    };
    for (let i = 0; i < 450 && !listo(); i++) await new Promise(r => setTimeout(r, 2000));
    docker('cp', join(dir, 'base.sql'), `${prueba}:/base.sql`);
    for (let intento = 1; ; intento++) {
      try { docker('exec', prueba, 'sh', '-c', 'mariadb -uroot -pr espocrm < /base.sql'); break; }
      catch (e) { if (intento >= 20) throw e; await new Promise(r => setTimeout(r, 3000)); }
    }
    const contar = (tabla: string) => Number(docker('exec', prueba, 'mariadb', '-uroot', '-pr', '-N', '-e',
      `SELECT COUNT(*) FROM espocrm.${tabla} WHERE deleted = 0`).trim());
    const despues = { contactos: contar('contact'), polizas: contar('c_poliza') };
    const archivos = docker('run', '--rm', '-v', `${dir}:/copia`, 'alpine',
      'sh', '-c', 'tar -tzf /copia/datos.tar.gz | wc -l').trim();

    expect(despues, 'la cartera restituida debe coincidir con la original').toEqual(antes);

    const fuente = await citar(browser, {
      url: 'https://docs.espocrm.com/administration/backup-and-restore/',
      buscar: 'Create an archive of the entire directory contents',
      captura: 'B-1-2-espocrm-1-procedimiento',
    });

    registrar({
      criterio: 'B.1.2',
      plataforma,
      cumple: 2,
      justificacion:
        'Se obtuvo una copia completa con el procedimiento oficial: el volcado de la base de datos y el ' +
        'archivo de la carpeta de datos, que es donde el sistema guarda los adjuntos. La copia se restituyó ' +
        'en una base de datos aparte y la cartera volvió entera: ' +
        `${despues.contactos} asegurados y ${despues.polizas} pólizas, los mismos que en el sistema en uso. ` +
        'La compañía tiene en su poder toda la información en formatos abiertos y no depende de nadie para ' +
        'recuperarla.',
      documentacion: fuente,
      medicion: `Base de ${Math.round(pesoBase / 1024)} KB y ${archivos} archivos de datos en ` +
                `${Math.round(pesoDatos / 1024)} KB; restituida sin diferencias`,
    });
  } finally {
    docker('rm', '-f', prueba);
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Copia periódica sin intervención manual', async ({ page, browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/backup-and-restore/',
    buscar: 'Backups can be scheduled on the host',
    captura: 'B-1-3-espocrm-1-programar-en-el-servidor',
  });

  // Las tareas programadas del producto son las suyas: ninguna hace copias
  await entrar(page, plataforma);
  await administracion(page, '#Admin/jobs');
  await page.waitForTimeout(5000);
  const tareas = (await page.locator('tbody tr').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
  const capTareas = await capturar(page, 'B.1.3', plataforma, '2-tareas-programadas');

  expect(tareas.some(t => /backup|copia|respaldo/i.test(t)), 'el producto no programa copias por sí mismo').toBeFalsy();

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    justificacion:
      'El producto no trae una copia programada: sus tareas programadas son de mantenimiento propio y ninguna ' +
      'genera un respaldo. La documentación oficial resuelve la repetición afuera, con el programador de ' +
      'tareas del servidor, que ejecuta todas las noches el mismo procedimiento de copia. La condición se ' +
      'satisface con una limitación que la compañía asume: la copia se repite sola, pero la programa, la ' +
      'vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema no avisa si una ' +
      'noche falló.',
    evidencia: [capTareas],
    documentacion: fuente,
  });
});

// ── B.1.5 ────────────────────────────────────────────────────────────────────
test('B.1.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/upgrading/',
      buscar: 'Command to run',
      captura: 'B-1-5-espocrm-1-la-dispara-el-administrador',
    }),
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/upgrading/',
      buscar: 'it may be reasonable to wait for a few days before upgrading',
      captura: 'B-1-5-espocrm-2-esperar-antes-de-actualizar',
    }),
  ];

  registrar({
    criterio: 'B.1.5',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia la actualización no llega sola: la ejecuta el administrador de la compañía ' +
      'con un comando, cuando decide hacerlo. El propio fabricante recomienda esperar unos días después de ' +
      'cada versión nueva antes de aplicarla. La compañía elige el momento —fuera del horario de atención, ' +
      'después de probarla— y ningún cambio del sistema la sorprende durante la operación.',
    documentacion: fuentes,
  });
});

// ── B.1.6 ────────────────────────────────────────────────────────────────────
test('B.1.6 — Conocimiento y decisión sobre dónde residen los datos', async ({ browser }, info) => {
  // «Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
      buscar: 'CRM database is stored locally',
      captura: 'B-1-6-espocrm-1-base-local',
    }),
    await citar(browser, {
      url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
      buscar: 'data security, will be your responsibility',
      captura: 'B-1-6-espocrm-2-responsabilidad',
    }),
  ];

  registrar({
    criterio: 'B.1.6',
    plataforma,
    cumple: 2,
    justificacion:
      'En la instalación propia la base de datos reside donde la compañía instala el sistema: en su propio ' +
      'servidor o en el proveedor que ella elija, en el país que ella elija. Sabe en todo momento dónde están ' +
      'los datos de sus asegurados y lo decide ella, que es lo que exige el tratamiento de datos sensibles de ' +
      'los seguros de personas. La contracara, que el fabricante declara, es que la seguridad de esos datos ' +
      'queda también a su cargo.',
    documentacion: fuentes,
  });
});

// ── B.1.7 ────────────────────────────────────────────────────────────────────
test('B.1.7 — Continuidad de la atención ante una caída del enlace', async ({ browser }, info) => {
  // «Interrumpir la conexión externa y determinar qué parte de la operación
  //  diaria sigue siendo posible»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Sin salida a internet: el navegador solo alcanza el servidor de la red propia
  const contexto = await browser.newContext({ baseURL: 'http://localhost:8705', locale: 'es-AR' });
  const bloqueados: string[] = [];
  await contexto.route('**/*', ruta => {
    const host = new URL(ruta.request().url()).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return ruta.continue();
    bloqueados.push(host);
    return ruta.abort('internetdisconnected');
  });
  const page = await contexto.newPage();

  const hechas: string[] = [];
  await entrar(page, plataforma);
  hechas.push('ingresar');
  await listadoLimpio(page, 'Contact');
  await page.locator('.search-container input.text-filter').first().fill('Gutiérrez');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  if ((await filasDelListado(page)).length) hechas.push('buscar un asegurado');
  await alta(page, 'Case');
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially('Reclamo tomado sin conexión externa', { delay: 20 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  if (/\/view\//.test(page.url())) hechas.push('registrar un reclamo');
  const capSinEnlace = await capturar(page, 'B.1.7', plataforma, '1-operando-sin-enlace');
  await contexto.close();

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
      'por naturaleza viaja por internet, como el envío y la recepción de correo. Con el sistema en la red de ' +
      'la compañía, una caída del enlace no detiene la atención.',
    evidencia: [capSinEnlace],
    medicion: `${bloqueados.length} pedidos a direcciones externas bloqueados durante la prueba`,
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
const VEREDICTO_B14: null | { cumple: 2 | 1 | 0; lectura: string } = {
  cumple: 2,
  lectura:
    'Buscar un asegurado entre cinco mil respondió en menos de medio segundo las tres veces, y filtrar las ' +
    'doce mil quinientas pólizas por ramo, en alrededor de medio segundo: no hay espera que el usuario perciba. ' +
    'Con la cartera de referencia cargada, el sistema responde como con una cartera chica.',
};

/**
 * Los tiempos con los que se fijó el veredicto. No deciden el valor: si una
 * corrida los supera con holgura, el test se detiene para que el veredicto se
 * vuelva a mirar a la vista de la medición nueva.
 */
const MEDIDO_B14 = { texto: 0.5, filtro: 0.6 };

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
  soloEn(plataforma, 'espocrm');
  test.setTimeout(5_400_000);

  // La cartera de referencia de la sección 4.7: 25.000 registros. Se carga
  // directo en la base: por la interfaz de programación llevaría horas en este
  // equipo, y lo que se mide es cómo responde el sistema con la cartera
  // cargada, no cómo se carga. Todo lo cargado lleva el prefijo "vol".
  const CARTERA = { Contact: 5_000, CPoliza: 12_500, Case: 7_500 };
  const sql = (consulta: string) => docker('exec', 'tp-espocrm-db', 'mariadb', '-uespocrm', '-pespocrm', 'espocrm', '-e', consulta);
  const borrarCarga = () => sql(
    "DELETE FROM contact WHERE id LIKE 'vol%'; DELETE FROM c_poliza WHERE id LIKE 'vol%'; DELETE FROM `case` WHERE id LIKE 'vol%';");

  const inicioCarga = Date.now();
  const medidas: Record<string, number[]> = { texto: [], filtro: [] };
  try {
    borrarCarga();
    sql(`INSERT INTO contact (id, first_name, last_name, deleted, created_at, modified_at)
         SELECT CONCAT('volc', LPAD(seq, 13, '0')), CONCAT('Asegurado ', seq), CONCAT('VOL-', LPAD(seq, 5, '0')), 0, NOW(), NOW()
         FROM seq_0_to_${CARTERA.Contact - 1}`);
    sql(`INSERT INTO c_poliza (id, name, tipo_poliza, estado_pago, deleted, created_at, modified_at)
         SELECT CONCAT('volp', LPAD(seq, 13, '0')), CONCAT('VOL-POL-', seq),
                ELT(seq % 4 + 1, 'Automotor', 'Hogar', 'Vida', 'Salud'), IF(seq % 3, 'Al dia', 'Vencida'), 0, NOW(), NOW()
         FROM seq_0_to_${CARTERA.CPoliza - 1}`);
    sql(`INSERT INTO \`case\` (id, name, status, deleted, created_at, modified_at)
         SELECT CONCAT('volr', LPAD(seq, 13, '0')), CONCAT('VOL-RECLAMO-', seq), 'New', 0, NOW(), NOW()
         FROM seq_0_to_${CARTERA.Case - 1}`);
    const api = await apiEspo();
    const cargados = (await cuantos(api, 'Contact')) + (await cuantos(api, 'CPoliza')) + (await cuantos(api, 'Case'));
    expect(cargados, 'la cartera de referencia debe quedar cargada').toBeGreaterThanOrEqual(25_000);
    const minutosCarga = Math.round((Date.now() - inicioCarga) / 60_000);

    await entrar(page, plataforma);
    // Buscar un asegurado por texto entre cinco mil, tres veces
    for (const buscado of ['VOL-04321', 'VOL-00777', 'VOL-02468']) {
      await listadoLimpio(page, 'Contact');
      await page.locator('.search-container input.text-filter').first().fill(buscado);
      const respuesta = page.waitForResponse(r => /\/api\/v1\/Contact\?/.test(r.url()) && r.request().method() === 'GET',
        { timeout: 120_000 });
      await page.locator('.search-container [data-action="search"]').first().click();
      medidas.texto.push(await demora(await respuesta));
      await page.locator('tbody tr td[data-name="name"] a').filter({ hasText: buscado }).first()
        .waitFor({ state: 'visible', timeout: 120_000 });
    }
    const capTexto = await capturar(page, 'B.1.4', plataforma, '1-busqueda-por-texto');

    // Filtrar pólizas por ramo entre doce mil quinientas, tres veces
    for (const ramo of ['Automotor', 'Vida', 'Salud']) {
      await listadoLimpio(page, 'CPoliza');
      await agregarFiltro(page, 'tipoPoliza');
      await filtrarPorLista(page, 'tipoPoliza', ramo);
      const aplicar = page.locator('[data-action="applyFilters"]:visible, .search-container [data-action="search"]').first();
      const respuesta = page.waitForResponse(r => /\/api\/v1\/CPoliza\?/.test(r.url()) && r.request().method() === 'GET',
        { timeout: 120_000 });
      await aplicar.click();
      medidas.filtro.push(await demora(await respuesta));
      await page.locator('tbody tr td[data-name="name"] a').first().waitFor({ state: 'visible', timeout: 120_000 });
    }
    const capFiltro = await capturar(page, 'B.1.4', plataforma, '2-filtrado-por-ramo');

    const lectura = `texto ${medidas.texto.map(s => s.toFixed(1)).join(' / ')} s · ` +
                    `filtro ${medidas.filtro.map(s => s.toFixed(1)).join(' / ')} s · carga ${minutosCarga} min`;
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
        'días: buscar un asegurado por texto y filtrar las pólizas por ramo, tres veces cada una. ' +
        VEREDICTO_B14.lectura,
      evidencia: [capTexto, capFiltro],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    borrarCarga();
  }
});
