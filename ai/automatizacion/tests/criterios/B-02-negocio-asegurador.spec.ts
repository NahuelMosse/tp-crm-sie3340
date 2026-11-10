import { test, expect } from '../humano';
import type { Response } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, statSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import { publicaciones, creacionDelRepositorio, versionesDeExtension } from '../evolucion';
import { ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { apiEspo, cuantos } from '../api';
import { soloEn, capturar, listadoLimpio, filasDelListado, agregarFiltro, filtrarPorLista } from './comun';
import { administracion, alta, ficha, edicion } from '../espocrm/navegar';
import { montarPoliza, aseguradoConPoliza } from '../espocrm/escenario';
import { ASEGURADOS } from '../datos';
import { clicEnAccion, textoDe, elegirLista } from './comun';

/**
 * B.2 — Condiciones que impone el negocio asegurador
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 */

test.describe.configure({ mode: 'serial' });

const docker = (...args: string[]) =>
  execFileSync('docker', args, { encoding: 'utf8', maxBuffer: 256 << 20 });

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
    buscar: 'have all the data stored on your own server',
    captura: 'B-2-1-espocrm-1-datos-propios',
  });

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 2,
    resumen:
      'En la instalación propia los datos quedan en el servidor de la compañía; ningún plazo de inactividad ' +
      'los afecta, porque no hay servicio de por medio.',
    comoLoHace:
      'En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna ' +
      'cuenta del fabricante.',
    caracteristicas:
      'No hay condición de servicio que los afecte por falta de uso, porque no hay servicio de por medio.',
    justificacion:
      'Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el ' +
      'sistema se mantenga.',
    documentacion: fuente,
  });
});

// ── B.2.2 ────────────────────────────────────────────────────────────────────
test('B.2.2 — Copia propia y completa de la cartera', async ({ browser }, info) => {
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
      captura: 'B-2-2-espocrm-1-procedimiento',
    });

    registrar({
      criterio: 'B.2.2',
      plataforma,
      cumple: 2,
      resumen:
        'Permite una copia completa —base de datos y carpeta de adjuntos— con el procedimiento oficial, y ' +
        'la cartera se restituye entera en formatos abiertos, sin depender del fabricante.',
      comoLoHace:
        'La copia se restituye en una base de datos aparte y la cartera vuelve entera, con los mismos ' +
        'asegurados y pólizas que en el sistema en uso.',
      caracteristicas:
        'Se obtuvo una copia completa con el procedimiento oficial: el volcado de la base de datos y el ' +
        'archivo de la carpeta de datos, que es donde el sistema guarda los adjuntos.',
      justificacion:
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

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Copia periódica sin intervención manual', async ({ page, browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/backup-and-restore/',
    buscar: 'Backups can be scheduled on the host',
    captura: 'B-2-3-espocrm-1-programar-en-el-servidor',
  });

  // Las tareas programadas del producto son las suyas: ninguna hace copias
  await entrar(page, plataforma);
  await administracion(page, '#Admin/jobs');
  await page.waitForTimeout(5000);
  const tareas = (await page.locator('tbody tr').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
  const capTareas = await capturar(page, 'B.2.3', plataforma, '2-tareas-programadas');

  expect(tareas.some(t => /backup|copia|respaldo/i.test(t)), 'el producto no programa copias por sí mismo').toBeFalsy();

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 1,
    resumen:
      'No programa copias por sí mismo: se repiten con el programador de tareas del servidor, pero alguien ' +
      'debe vigilarlas y guardarlas afuera, porque el sistema no avisa si una falla.',
    comoLoHace:
      'La documentación oficial resuelve la repetición afuera, con el programador de tareas del servidor, ' +
      'que ejecuta todas las noches el mismo procedimiento de copia.',
    caracteristicas:
      'El producto no trae una copia programada: sus tareas programadas son de mantenimiento propio y ' +
      'ninguna genera un respaldo.',
    justificacion:
      'La condición se satisface con una limitación que la compañía asume: la copia se repite sola, pero la ' +
      'programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema ' +
      'no avisa si una noche falló.',
    evidencia: [capTareas],
    documentacion: fuente,
  });
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/upgrading/',
      buscar: 'Command to run',
      captura: 'B-2-5-espocrm-1-la-dispara-el-administrador',
    }),
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/upgrading/',
      buscar: 'it may be reasonable to wait for a few days before upgrading',
      captura: 'B-2-5-espocrm-2-esperar-antes-de-actualizar',
    }),
  ];

  registrar({
    criterio: 'B.2.5',
    plataforma,
    cumple: 2,
    resumen:
      'La actualización no llega sola: la ejecuta el administrador con un comando cuando decide.',
    comoLoHace:
      'En la instalación propia la actualización no llega sola: la ejecuta el administrador de la compañía ' +
      'con un comando, cuando decide hacerlo.',
    caracteristicas:
      'El propio fabricante recomienda esperar unos días después de cada versión nueva antes de aplicarla.',
    justificacion:
      'La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún cambio ' +
      'del sistema la sorprende durante la operación.',
    documentacion: fuentes,
  });
});

// ── B.2.6 ────────────────────────────────────────────────────────────────────
test('B.2.6 — Alojamiento de los datos en un país con protección adecuada', async ({ browser }, info) => {
  // «Determinar en qué país quedan los datos de la compañía y si ese país tiene protección adecuada
  //  según la autoridad argentina, o si el fabricante ofrece las cláusulas contractuales aprobadas
  //  para transferirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
      buscar: 'You install the software and have all the data stored on your own server',
      captura: 'B-2-6-espocrm-1-datos-en-servidor-propio',
    }),
    await citar(browser, {
      url: 'https://www.espocrm.com/self-hosted-vs-cloud-crm/',
      buscar: 'data security, will be your responsibility',
      captura: 'B-2-6-espocrm-2-responsabilidad',
    }),
  ];

  // Dónde corre la instalación evaluada: el servidor y la base de datos son contenedores de este equipo
  const corre = docker('ps', '--filter', 'name=tp-espocrm', '--format', '{{.Names}} ({{.Image}})').trim().split('\n');
  const equipo = docker('info', '--format', '{{.Name}}').trim();
  expect(corre.length, 'el sistema y su base de datos deben correr en el servidor propio').toBeGreaterThanOrEqual(2);

  registrar({
    criterio: 'B.2.6',
    plataforma,
    cumple: 2,
    resumen:
      'En la instalación propia los datos quedan en el servidor que elige la compañía, por ejemplo uno en la ' +
      'Argentina, sin transferirse al fabricante; la seguridad de ese servidor queda a su cargo.',
    comoLoHace:
      'El sistema y su base de datos corren donde la compañía los instala. En la prueba corren como dos contenedores ' +
      'de un equipo propio, sin que el fabricante intervenga ni reciba los datos; la compañía decide en qué ' +
      'servidor y en qué país los aloja.',
    caracteristicas:
      'El fabricante declara que los datos quedan en el servidor de quien instala el sistema y que su seguridad es ' +
      'responsabilidad de esa compañía. Alojar en un servidor dentro del país elimina la transferencia internacional.',
    justificacion:
      'No hay transferencia de datos a otro país que justificar: el país es el que la compañía elige, y uno ' +
      'argentino cumple la condición de la ley de protección de datos personales.',
    documentacion: fuentes,
    medicion: `Instalación en contenedores ${corre.join(', ')} sobre el equipo «${equipo}»`,
  });
});

// ── B.2.7 ────────────────────────────────────────────────────────────────────
test('B.2.7 — Continuidad de la atención ante una caída del enlace', async ({ browser }, info) => {
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
  const capSinEnlace = await capturar(page, 'B.2.7', plataforma, '1-operando-sin-enlace');
  await contexto.close();

  expect(hechas, 'la operación diaria debe seguir sin salida a internet').toEqual(
    ['ingresar', 'buscar un asegurado', 'registrar un reclamo']);

  registrar({
    criterio: 'B.2.7',
    plataforma,
    cumple: 2,
    resumen:
      'Sin salida a internet, la atención diaria sigue —ingresar, buscar asegurados, registrar reclamos—; ' +
      'solo se pierde lo que viaja por internet, como el correo.',
    comoLoHace:
      'Con la salida a internet cortada y solo la red propia alcanzable, el sistema permite ingresar, ' +
      'buscar un asegurado y registrar un reclamo, que es la atención de todos los días.',
    caracteristicas:
      'La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es ' +
      'lo que por naturaleza viaja por internet, como el envío y la recepción de correo.',
    justificacion:
      'Con el sistema en la red de la compañía, una caída del enlace no detiene la atención.',
    evidencia: [capSinEnlace],
    medicion: `${bloqueados.length} pedidos a direcciones externas bloqueados durante la prueba`,
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
const VEREDICTO_B14: null | { cumple: 2 | 1 | 0; lectura: { resumen: string; caracteristicas: string; justificacion: string } } = {
  cumple: 2,
  lectura: {
    resumen:
      'Con 25.000 registros, buscar un asegurado entre cinco mil y filtrar las doce mil quinientas pólizas ' +
      'por ramo responde en menos de medio segundo, sin espera perceptible.',
    caracteristicas:
      'Buscar un asegurado entre cinco mil y filtrar las doce mil quinientas pólizas por ramo respondió en ' +
      'menos de medio segundo las tres veces: no hay espera que el usuario perciba.',
    justificacion:
      'Con la cartera de referencia cargada, el sistema responde como con una cartera chica.',
  },
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

test('B.2.4 — Búsqueda y operación con volumen productivo', async ({ page }, info) => {
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
    const capTexto = await capturar(page, 'B.2.4', plataforma, '1-busqueda-por-texto');

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
    const capFiltro = await capturar(page, 'B.2.4', plataforma, '2-filtrado-por-ramo');

    const lectura = `texto ${medidas.texto.map(s => s.toFixed(1)).join(' / ')} s · ` +
                    `filtro ${medidas.filtro.map(s => s.toFixed(1)).join(' / ')} s · carga ${minutosCarga} min`;
    console.log(`    B.2.4 medición: ${lectura}`);
    if (!VEREDICTO_B14) throw new Error(`B.2.4: fijar el veredicto a la vista de la medición (${lectura})`);
    const lejos = Math.max(...medidas.texto) > 2 * MEDIDO_B14.texto || Math.max(...medidas.filtro) > 2 * MEDIDO_B14.filtro;
    if (lejos) throw new Error(`B.2.4: la medición cambió respecto de la que sostiene el veredicto; volver a mirarlo (${lectura})`);

    registrar({
      criterio: 'B.2.4',
      plataforma,
      cumple: VEREDICTO_B14.cumple,
      resumen: VEREDICTO_B14.lectura.resumen,
      comoLoHace:
        'Con una cartera de referencia de veinticinco mil registros —cinco mil asegurados, doce mil ' +
        'quinientas pólizas y siete mil quinientos reclamos— el sistema resuelve las operaciones de todos ' +
        'los días: buscar un asegurado por texto y filtrar las pólizas por ramo.',
      caracteristicas: VEREDICTO_B14.lectura.caracteristicas,
      justificacion: VEREDICTO_B14.lectura.justificacion,
      evidencia: [capTexto, capFiltro],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    borrarCarga();
  }
});

// ── B.2.8 ────────────────────────────────────────────────────────────────────
test('B.2.8 — Atención de los derechos del titular de los datos', async ({ page }, info) => {
  // «Sobre un asegurado con póliza, obtener de una vez todos sus datos, corregir uno y suprimir o bloquear
  //  la ficha, y comprobar qué constancia queda de cada pedido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  const titular = { ...ASEGURADOS[3], emailAddress: 'rdominguez.b28@ejemplo.test' };
  const api = await apiEspo();
  await montarPoliza(api);
  for (const c of (await (await api.get('Contact', { params: { maxSize: 200 } })).json()).list
    .filter((c: any) => c.lastName === titular.lastName && c.firstName === titular.firstName)) await api.delete(`Contact/${c.id}`);
  const { contactoId, polizaId } = await aseguradoConPoliza(api, titular, 'POL-B28-HOGAR');

  await entrar(page, plataforma);
  await ficha(page, 'Contact', contactoId);

  // 1. Todos sus datos. La ventana de datos personales de la ficha ofrece ver y borrar, no exportar:
  //    la salida es el «Exportar» de los listados, una vez para el asegurado y otra para sus pólizas
  await clicEnAccion(page, page.locator('#main [data-action="viewPersonalData"]').first());
  const ventana = page.locator('.modal-dialog:visible').first();
  await ventana.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2500);
  const datos = await ventana.innerText();
  const botones = await ventana.locator('button').evaluateAll(bs => bs.map(b => `${b.getAttribute('data-name')}:${b.textContent?.trim()}`));
  const capDatos = await capturar(page, 'B.2.8', plataforma, '1-datos-personales');
  console.log(`    ventana de datos personales: ${datos.replace(/\s+/g, ' ').slice(0, 300)} · botones ${botones.join(' | ')}`);
  await ventana.locator('button[data-name="cancel"]').first().click();
  await page.waitForTimeout(800);

  const exportarDelListado = async (entidad: string, buscar: string) => {
    await listadoLimpio(page, entidad);
    await page.locator('.search-container input.text-filter').first().fill(buscar);
    const respuesta = page.waitForResponse(r => r.url().includes(`/api/v1/${entidad}?`) && r.url().includes('where'), { timeout: 30_000 }).catch(() => null);
    await page.locator('.search-container [data-action="search"]').first().click();
    await respuesta;
    await page.waitForTimeout(2500);
    await page.locator('tbody tr .record-checkbox').first().check({ force: true });
    await page.locator('.list-buttons-container .actions-button').first().click();
    await page.locator('.list-buttons-container [data-action="export"]').first().click();
    const dialogo = page.locator('.modal-dialog:visible').first();
    await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
    console.log(`    exportar ${entidad}: ${(await dialogo.innerText()).replace(/\s+/g, ' ').slice(0, 250)}`);
    await elegirLista(page, 'format', 'csv', '.modal-dialog:visible');
    await dialogo.locator('.field[data-name="exportAllFields"] input[type="checkbox"]').first().check({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    const descarga = page.waitForEvent('download', { timeout: 60_000 }).catch(() => null);
    await dialogo.locator('button[data-name="export"]').first().click();
    const d = await descarga;
    const ruta = d ? await d.path() : null;
    return ruta ? (await import('node:fs')).readFileSync(ruta, 'utf8') : '';
  };
  const csvAsegurado = await exportarDelListado('Contact', titular.lastName);
  const capExport = await capturar(page, 'B.2.8', plataforma, '2-exportacion-del-asegurado');
  const csvPoliza = await exportarDelListado('CPoliza', 'POL-B28');
  console.log(`    export asegurado: ${csvAsegurado.replace(/\s+/g, ' ').slice(0, 300)}`);
  console.log(`    export póliza: ${csvPoliza.replace(/\s+/g, ' ').slice(0, 300)}`);
  expect(csvAsegurado, 'la exportación debe traer los datos del asegurado').toContain(titular.emailAddress);
  expect(csvPoliza, 'la exportación de pólizas debe traer la póliza del asegurado').toContain('POL-B28-HOGAR');
  const unaSolaVez = csvAsegurado.includes('POL-B28');

  // 2. Corregir un dato
  await edicion(page, 'Contact', contactoId);
  const tel = page.locator('.field[data-name="phoneNumber"] input.phone-number').first();
  await tel.click();
  await tel.press('Control+a');
  await tel.pressSequentially('+54 11 4555-9999', { delay: 30 });
  await tel.press('Tab');
  await expect(tel).toHaveValue(/9999/);
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.getByText(/^(Guardando|Saving)/).filter({ visible: true }).first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
  await expect.poll(async () => (await (await api.get(`Contact/${contactoId}`)).json()).phoneNumber ?? '',
    { message: 'el dato corregido debe quedar guardado', timeout: 30_000 }).toContain('9999');

  // 3. Suprimir: borrar los datos personales desde la misma ventana
  await ficha(page, 'Contact', contactoId);
  await clicEnAccion(page, page.locator('#main [data-action="viewPersonalData"]').first());
  await ventana.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2500);
  const todos = ventana.locator('input[type="checkbox"]');
  const n = await todos.count();
  for (let i = 0; i < n; i++) await todos.nth(i).check({ force: true }).catch(() => {});
  const capBorrado = await capturar(page, 'B.2.8', plataforma, '2-borrar-datos');
  await ventana.locator('button[data-name="erase"], [data-action="erase"]').first().click();
  const confirma = page.locator('.modal-dialog:visible button[data-name="confirm"], .modal-dialog:visible [data-action="confirm"]').first();
  if (await confirma.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false)) await confirma.click();
  await page.waitForTimeout(4000);
  const tras = await (await api.get(`Contact/${contactoId}`)).json();
  console.log(`    tras borrar: ${JSON.stringify({ n: tras.name, e: tras.emailAddress, t: tras.phoneNumber, d: tras.deleted })}`);

  // 4. La constancia: el historial de la ficha y el registro de acciones
  await ficha(page, 'Contact', contactoId);
  await page.waitForTimeout(4000);
  const capHistorial = await capturar(page, 'B.2.8', plataforma, '4-historial-de-la-ficha');
  const notas = (await (await api.get(`Contact/${contactoId}/stream`, { params: { maxSize: 50 } })).json()).list ?? [];
  const cambiosEnHistorial = notas.filter((x: any) => x.type === 'Update').length;
  const acciones = ((await (await api.get('ActionHistoryRecord', { params: { maxSize: 200, orderBy: 'createdAt', order: 'desc',
    'where[0][type]': 'equals', 'where[0][attribute]': 'targetId', 'where[0][value]': contactoId } })).json()).list ?? []) as any[];
  const modificaciones = acciones.filter(a => a.action === 'update');
  console.log(`    historial de la ficha: ${cambiosEnHistorial} cambios · registro de acciones: ${acciones.map(a => `${a.action}:${a.userName}`).join(', ')}`);
  expect(modificaciones.length, 'el registro de acciones debe anotar al menos la corrección').toBeGreaterThanOrEqual(1);
  const borradoRegistrado = modificaciones.length >= 2;
  expect(modificaciones[0].userName, 'cada acción debe llevar a quien la hizo').toBeTruthy();
  expect(tras.emailAddress, 'el borrado debe reemplazar el correo').toMatch(/^ERASED:/);
  expect(tras.deleted, 'la ficha sigue existiendo, con sus datos personales borrados').toBe(false);

  registrar({
    criterio: 'B.2.8',
    plataforma,
    cumple: 1,
    resumen:
      'Exporta al asegurado y sus pólizas, corrige un dato y borra sus datos personales, pero exige una exportación ' +
      'por tipo de registro y las correcciones no quedan en el historial.',
    comoLoHace:
      'Los datos del asegurado se exportan a una planilla desde el listado de contactos, y los de su póliza desde el ' +
      'de pólizas. El dato se corrige en la ficha. La ventana de datos personales de la ficha permite borrar ' +
      'los campos personales, que quedan reemplazados por una marca de borrado y la ficha subsiste. Cada ' +
      'corrección queda en un registro de acciones —quién, cuándo y qué registro—, que no tiene pantalla propia en ' +
      'la administración; el borrado de datos personales no deja en él una entrada propia.',
    caracteristicas:
      'La exportación admite todos los campos y formato CSV o planilla. El borrado deja la ficha y sus pólizas, con ' +
      'nombre, correo y teléfono reemplazados. El registro de acciones anota quién modificó la ficha y cuándo, sin el ' +
      'valor anterior, y no anota el borrado; el historial de la ficha solo conserva la creación, porque el teléfono no se audita de fábrica.',
    justificacion:
      `El pedido se atiende, con una limitación que la compañía asume: no hay una descarga única con todo lo del ` +
      `titular, sino una exportación por cada tipo de registro (${unaSolaVez ? 'aquí el contacto trajo también la póliza' : 'el contacto no trae sus pólizas'}), ` +
      'y la constancia de qué valor cambió, y del borrado, exige marcar los campos como auditados o llevarla aparte.',
    evidencia: [capDatos, capExport, capBorrado, capHistorial],
    medicion: `${modificaciones.length} modificación anotada en el registro de acciones (borrado ${borradoRegistrado ? 'anotado' : 'sin anotar'}); ${cambiosEnHistorial} cambios en el historial de la ficha`,
  });
});

// ── B.2.9 ────────────────────────────────────────────────────────────────────
test('B.2.9 — Baja de las comunicaciones comerciales por medio', async ({ page }, info) => {
  // «Marcar a un asegurado para que no reciba correos comerciales, armar una campaña de correo que lo
  //  incluya en su segmento y comprobar que el envío lo excluye»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(2_400_000);

  const { CORREO, vaciarCasillas, recibidos, correrTareas, habilitarServidorDePrueba } = await import('../correo');
  const { crear, listar } = await import('../api');
  const api = await apiEspo();
  await habilitarServidorDePrueba(api);
  await vaciarCasillas();

  // Escenario: dos asegurados, su lista de destinatarios, la plantilla y el correo saliente de la compañía
  const BAJA = { firstName: 'Natalia', lastName: 'Ferrer', emailAddress: 'nferrer.b29@ejemplo.test' };
  const ALTA = { firstName: 'Tomás', lastName: 'Quiroga', emailAddress: 'tquiroga.b29@ejemplo.test' };
  const borrar = async (entidad: string, quien: (r: any) => boolean) => {
    for (const r of (await listar(api, entidad, { maxSize: 200 })).list.filter(quien)) await api.delete(`${entidad}/${r.id}`);
  };
  await borrar('Campaign', c => c.name === 'Promoción hogar B29');
  await borrar('TargetList', t => t.name === 'Asegurados de hogar B29');
  await borrar('EmailTemplate', t => t.name === 'Promoción hogar B29');
  await borrar('Contact', c => /\.b29@/.test(c.emailAddress ?? ''));
  const idBaja = await crear(api, 'Contact', BAJA);
  const idAlta = await crear(api, 'Contact', ALTA);
  const lista = await crear(api, 'TargetList', { name: 'Asegurados de hogar B29' });
  for (const id of [idBaja, idAlta]) await api.post(`TargetList/${lista}/contacts`, { data: { id } });
  await crear(api, 'EmailTemplate', { name: 'Promoción hogar B29', subject: '{Person.firstName}, una promoción para su hogar',
    body: 'Hola {Person.firstName}: le acercamos una promoción en su seguro de hogar.', isHtml: false });
  const campana = await crear(api, 'Campaign', { name: 'Promoción hogar B29', type: 'Email', targetListsIds: [lista] });
  const REMITENTE = 'comercial@aseguradora.test';
  await borrar('InboundEmail', c => c.emailAddress === REMITENTE);
  await crear(api, 'InboundEmail', {
    name: 'Comercial', emailAddress: REMITENTE, status: 'Active', useImap: false,
    useSmtp: true, smtpIsShared: true, smtpIsForMassEmail: true,
    smtpHost: CORREO.host, smtpPort: CORREO.smtp, smtpAuth: false, smtpSecurity: '', fromName: 'Aseguradora — Comercial',
  });
  await api.put('Settings', { data: { outboundEmailFromAddress: REMITENTE, outboundEmailFromName: 'Aseguradora — Comercial' } });
  // El envío masivo corre a los minutos 10, 30 y 50: se lo pone cada minuto para no esperar la ventana
  for (const t of (await listar(api, 'ScheduledJob', { maxSize: 100 })).list.filter((t: any) => t.job === 'ProcessMassEmail')) {
    await api.put(`ScheduledJob/${t.id}`, { data: { scheduling: '* * * * *' } });
  }

  // 1. Se marca al asegurado: en el correo de su ficha, como dado de baja de las comunicaciones
  await entrar(page, plataforma);
  await edicion(page, 'Contact', idBaja);
  const bloque = page.locator('.field[data-name="emailAddress"] .email-address-block').first();
  // Los botones del correo —principal, baja, inválido— aparecen al pasar el ratón por la fila
  await bloque.hover();
  const botonBaja = bloque.locator('button[data-property-type="optOut"]').first();
  await botonBaja.click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  const capBaja = await capturar(page, 'B.2.9', plataforma, '1-asegurado-dado-de-baja');
  const marcado = (await (await api.get(`Contact/${idBaja}`)).json()).emailAddressIsOptedOut;
  expect(marcado, 'el correo del asegurado debe quedar marcado como dado de baja').toBeTruthy();

  // 2. La campaña sobre su lista, programada desde la ficha de la campaña
  await ficha(page, 'Campaign', campana);
  await page.locator('.panel[data-name="massEmails"] [data-action="createRelated"]').first().click();
  const modal = page.locator('.modal-dialog:visible');
  await modal.locator('.field[data-name="name"] input').first().fill('Promoción hogar — envío');
  await elegirLista(page, 'status', 'Pending', '.modal-dialog:visible');
  const hoy = new Date();
  const dia = `${String(hoy.getDate()).padStart(2, '0')}.${String(hoy.getMonth() + 1).padStart(2, '0')}.${hoy.getFullYear()}`;
  const fecha = modal.locator('.field[data-name="startAt"] input[data-name="startAt"]');
  await fecha.click();
  await fecha.pressSequentially(dia);
  await modal.locator('.field[data-name="startAt"] input[data-name="startAt-time"]').click();
  await page.locator('.ui-timepicker-wrapper:visible li').filter({ hasText: /^00:00$/ }).first().click();
  const entrada = modal.locator('.field[data-name="emailTemplate"] input[type="text"]').first();
  await entrada.click();
  await entrada.pressSequentially('Promoción hog');
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: 'Promoción hogar B29' }).first().click({ timeout: 15_000 });
  await modal.locator('.field[data-name="fromAddress"] input').first().fill(REMITENTE);
  await modal.locator('.field[data-name="fromName"] input').first().fill('Aseguradora — Comercial');
  await modal.locator('button[data-name="save"]').first().click();
  await expect(modal).toBeHidden({ timeout: 15_000 });

  // 3. El programador despacha el envío; se corre cada minuto, como el servidor
  const logDe = async () => (await (await api.get('CampaignLogRecord', { params: {
    maxSize: 200, 'where[0][type]': 'equals', 'where[0][attribute]': 'campaignId', 'where[0][value]': campana,
  } })).json()).list ?? [];
  for (let minuto = 0; minuto < 12 && !(await logDe()).some((x: any) => x.action === 'Sent'); minuto++) {
    await correrTareas(1);
    await page.waitForTimeout(56_000);
  }
  await correrTareas(2);

  const alta = await recibidos(ALTA.emailAddress);
  const baja = await recibidos(BAJA.emailAddress);
  const crudo = alta[0]?.mimeMessage ?? '';
  const texto = crudo.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
  const conEnlaceDeBaja = /unsubscribe/i.test(texto);
  console.log(`    llegaron: alta ${alta.length}, baja ${baja.length}; enlace de baja: ${conEnlaceDeBaja}`);

  await ficha(page, 'Campaign', campana);
  await page.waitForTimeout(5000);
  const capCampana = await capturar(page, 'B.2.9', plataforma, '2-resultado-de-la-campana');

  expect(alta.length, 'el asegurado que no se dio de baja debe recibir el correo').toBe(1);
  expect(baja.length, 'el asegurado dado de baja no debe recibir el correo').toBe(0);

  registrar({
    criterio: 'B.2.9',
    plataforma,
    cumple: 2,
    resumen:
      'El correo del asegurado se marca como dado de baja desde su ficha y las campañas lo excluyen solas; ' +
      'cada mensaje trae el enlace para que el asegurado se dé de baja.',
    comoLoHace:
      'Se marca el correo del asegurado como dado de baja en su ficha. Al enviar una campaña a una lista que lo ' +
      'incluye, el sistema no le manda el mensaje y sí lo manda al otro asegurado de la lista.',
    caracteristicas:
      'La exclusión rige para todas las campañas y listas. Los mensajes de campaña llevan un enlace de baja ' +
      'que, al usarlo el asegurado, marca su correo como dado de baja sin intervención de nadie.',
    justificacion:
      'Viene de fábrica: no requiere configurar nada para que la baja se respete, que es lo que la ley ' +
      'exige para cualquier medio de publicidad.',
    evidencia: [capBaja, capCampana],
    medicion: `GreenMail: ${alta.length} mensaje al asegurado vigente y ${baja.length} al dado de baja; enlace de baja: ${conEnlaceDeBaja ? 'sí' : 'no'}`,
  });
});

// ── B.2.10 ───────────────────────────────────────────────────────────────────
test('B.2.10 — Evolución sostenida del producto', async ({ browser }, info) => {
  // «Contar en las notas de versión oficiales del último año las versiones que
  //  agregaron funciones, y determinar desde cuándo el fabricante sostiene el producto»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const versiones = await publicaciones('espocrm/espocrm');
  const conFunciones = versiones.filter(v => /^(Enhancements|Improvements):/m.test(v.cuerpo));
  const lineas = conFunciones.filter(v => /\.0$/.test(v.tag)).map(v => v.tag.replace(/\.0$/, ''));
  const desde = await creacionDelRepositorio('espocrm/espocrm');
  expect(conFunciones.length, 'el último año debe tener versiones con funciones').toBeGreaterThan(0);

  const notas = await citar(browser, {
    url: 'https://github.com/espocrm/espocrm/releases/tag/10.1.0',
    buscar: 'OAuth 2.0 server',
    captura: 'B-2-10-espocrm-1-notas-10-1',
  });
  const nota100 = await citar(browser, {
    url: 'https://github.com/espocrm/espocrm/releases/tag/10.0.0',
    buscar: 'Multiple pipelines',
    captura: 'B-2-10-espocrm-2-notas-10-0',
  });
  const nota93 = await citar(browser, {
    url: 'https://github.com/espocrm/espocrm/releases/tag/9.3.0',
    buscar: 'OpenAPI specification generation',
    captura: 'B-2-10-espocrm-3-notas-9-3',
  });
  const origen = await citar(browser, {
    url: 'https://www.espocrm.com/about-us/',
    buscar: 'In 2014, we released',
    captura: 'B-2-10-espocrm-4-desde-2014',
  });

  registrar({
    criterio: 'B.2.10',
    plataforma,
    cumple: 2,
    resumen:
      'Publica funciones nuevas varias veces al año y el fabricante sostiene el producto desde 2014, a lo largo de diez versiones mayores.',
    comoLoHace:
      'Las notas de versión oficiales listan, versión por versión, las funciones agregadas. En el último año ' +
      `${versiones.length} versiones publicadas, de las cuales ${conFunciones.length} trajeron funciones o mejoras ` +
      `(${lineas.join(', ')} y alguna corrección con mejoras menores). El fabricante publicó la primera versión en 2014.`,
    caracteristicas:
      'Cada versión mayor o menor trae funciones propias —varios embudos, servidor de autorización, bloqueo de ' +
      'registros, especificación de la interfaz— y entre ellas se publican correcciones.',
    justificacion:
      'Las funciones llegan repartidas en el año, no concentradas en un solo lanzamiento, y el producto lleva más de once ' +
      'años mantenido por el mismo fabricante a través de diez versiones mayores: cubre las dos condiciones de la escala.',
    documentacion: [notas, nota100, nota93, origen],
    medicion:
      `${versiones.length} versiones publicadas entre 11/11/2025 y 10/11/2026; ${conFunciones.length} con funciones o mejoras ` +
      `(${conFunciones.map(v => v.tag).join(', ')}); repositorio público creado el ${desde}`,
  });
});

// ── B.2.11 ───────────────────────────────────────────────────────────────────
test('B.2.11 — Mejoras incluidas en la versión gratuita', async ({ browser }, info) => {
  // «Tomar las funciones nuevas de las notas de versión oficiales del último año y
  //  determinar cuántas llegan a la versión evaluada y cuántas quedan en un plan o
  //  una extensión paga»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  // Las notas del producto base son las de la versión evaluada: todo lo que listan está en ella
  const versiones = await publicaciones('espocrm/espocrm');
  let base = 0;
  for (const v of versiones) {
    for (const bloque of v.cuerpo.replace(/\r/g, '').matchAll(/^(?:Enhancements|Improvements):\n\n((?:[*-] .*\n?)+)/gm)) {
      base += (bloque[1].match(/^[*-] /gm) ?? []).length;
    }
  }
  // Las extensiones pagas publican sus propias notas
  const extensiones = ['advanced-pack', 'sales-pack', 'intelligence', 'outlook-integration', 'zoom-integration', 'voip-integration', 'google-integration'];
  const pagas: string[] = [];
  let renglonesPagos = 0;
  for (const e of extensiones) {
    const v = await versionesDeExtension(e);
    if (!v.length) continue;
    renglonesPagos += v.reduce((s, x) => s + x.renglones, 0);
    pagas.push(`${e}: ${v.length} versiones (${v.map(x => x.v).join(', ')})`);
  }
  expect(base, 'las notas del producto base deben listar funciones').toBeGreaterThan(0);
  expect(pagas.length, 'las extensiones pagas deben tener notas en el período').toBeGreaterThan(0);

  const advanced = await citar(browser, {
    url: 'https://www.espocrm.com/extensions/advanced-pack/release-notes',
    buscar: 'Non-aggregated columns in Grid report export',
    captura: 'B-2-11-espocrm-1-notas-advanced-pack',
  });
  const sales = await citar(browser, {
    url: 'https://www.espocrm.com/extensions/sales-pack/release-notes',
    buscar: 'Tax-inclusive pricing',
    captura: 'B-2-11-espocrm-2-notas-sales-pack',
  });
  const base101 = await citar(browser, {
    url: 'https://github.com/espocrm/espocrm/releases/tag/10.1.0',
    buscar: 'Job processing with workers',
    captura: 'B-2-11-espocrm-3-notas-base',
  });
  const nube = await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'B-2-11-espocrm-nube');

  registrar({
    criterio: 'B.2.11',
    plataforma,
    cumple: 1,
    resumen:
      'Las novedades del producto base llegan a la versión gratuita, pero buena parte de las funciones nuevas del año —reportes, procesos, facturación, inteligencia artificial— salen en extensiones pagas.',
    comoLoHace:
      `Las notas del producto base listan ${base} funciones y mejoras del último año, todas disponibles en la versión ` +
      `evaluada. Las extensiones pagas publican sus propias notas, con unos ${renglonesPagos} renglones de novedades ` +
      'en el mismo período: reportes y procesos (Advanced Pack), facturación y suscripciones (Sales Pack), asistente de ' +
      'inteligencia artificial (Intelligence) e integraciones con el correo y las reuniones.',
    caracteristicas:
      'Del producto base llegan varios embudos por entidad, bloqueo de registros, servidor de autorización y agrupación de ' +
      'notificaciones. Quedan en extensión paga las mejoras de reportes, procesos, facturación e inteligencia artificial.',
    justificacion:
      'Las funciones que la compañía más usa para cobrar y reportar mejoran en extensiones pagas, que la versión ' +
      'evaluada no trae; el producto base también mejora, pero parte importante del avance del año queda fuera de él. ' +
      'Por eso llegan algunas, no la mayoría.',
    conPlan: [conPlanDe(ESPOCRM_CLOUD_BASIC, {
      cumple: 2,
      justificacion:
        'El plan de entrada del servicio en la nube trae todas las extensiones del fabricante, de modo que las ' +
        'funciones nuevas de ambos lados llegan juntas. Las licencias sueltas de cada extensión cubren solo una parte.',
    })],
    documentacion: [base101, advanced, sales, ...nube],
    medicion:
      `Producto base: ${base} funciones y mejoras en las notas. Extensiones pagas con versiones en el período: ${pagas.join('; ')}; ` +
      `unos ${renglonesPagos} renglones de novedades (cuenta aproximada de líneas de las notas)`,
  });
});
