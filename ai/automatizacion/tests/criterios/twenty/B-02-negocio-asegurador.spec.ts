import { test, expect } from '../../humano';
import type { Response } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import {
  apiTwenty, registros, abrirListado, configuracion, clicReal, textoDe, buscarEnTodo, nuevoRegistro, BASE,
  abrirFicha, crearRegistro, borrarRegistro, marcarFilas, escribirEnFicha, esperarCarga,
  quitarCampo, nuevoCampo, objeto, valorEnFicha,
} from '../../twenty/ui';
import { alistarReclamo, cargarCartera } from '../../twenty/escenario';

/**
 * B.2 — Condiciones que impone el negocio asegurador, sobre Twenty
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

// ── B.2.1 ────────────────────────────────────────────────────────────────────
test('B.2.1 — Persistencia de los datos sin uso continuo', async ({ browser }, info) => {
  // «Verificar en las condiciones del servicio si existe un plazo de
  //  inactividad que afecte la cuenta o los datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans',
    buscar: 'Full control over your data',
    captura: 'B-2-1-twenty-1-datos-propios',
  });

  registrar({
    criterio: 'B.2.1',
    plataforma,
    cumple: 2,
    resumen:
      'Con la instalación propia los datos quedan en el servidor de la compañía y no dependen ' +
      'de ninguna cuenta del fabricante ni de que se los use.',
    comoLoHace:
      'En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ' +
      'ninguna cuenta del fabricante.',
    caracteristicas:
      'No hay condición de servicio que los afecte por falta de uso, ' +
      'porque no hay servicio de por medio, y el fabricante la ofrece con el control total de los ' +
      'datos.',
    justificacion:
      'Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre ' +
      'el sistema se mantenga.',
    documentacion: fuente,
  });
});

// ── B.2.2 ────────────────────────────────────────────────────────────────────
test('B.2.2 — Copia propia y completa de la cartera', async ({ browser }, info) => {
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
      captura: 'B-2-2-twenty-1-procedimiento',
    });

    registrar({
      criterio: 'B.2.2',
      plataforma,
      cumple: 2,
      resumen:
        'Permite una copia completa y propia de la cartera: volcado de la base y de la carpeta ' +
        'de adjuntos, en formato abierto, restituible en otra base.',
      comoLoHace:
        'Se obtiene una copia completa con el procedimiento que indica el fabricante: el volcado de la ' +
        'base de datos, y el archivo de la carpeta donde el servidor guarda los adjuntos.',
      caracteristicas:
        'La copia se restituyó en una ' +
        `base de datos aparte y la cartera volvió entera: ${despues.personas} personas, ` +
        `${despues.polizas} pólizas y ${despues.reclamos} reclamos, los mismos que en el sistema en ` +
        'uso.',
      justificacion:
        'La compañía tiene en su poder toda la información, en el formato abierto de la base, y no ' +
        'depende de nadie para recuperarla.',
      documentacion: fuente,
      medicion: `Base de ${Math.round(pesoBase / 1024)} KB y ${archivos} archivos adjuntos en ${Math.round(pesoArchivos / 1024)} KB; ` +
        'restituida sin diferencias',
    });
  } finally {
    try { docker('rm', '-f', prueba); } catch { /* ya no estaba */ }
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── B.2.3 ────────────────────────────────────────────────────────────────────
test('B.2.3 — Copia periódica sin intervención manual', async ({ page, browser }, info) => {
  // «Determinar si esa copia puede programarse para repetirse sola, sin que
  //  alguien la ejecute cada vez»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose',
    buscar: 'Automate Daily Backups',
    captura: 'B-2-3-twenty-1-programar-en-el-servidor',
  });

  // Lo que el panel de administración ofrece: estado y variables, ninguna copia
  await entrar(page, plataforma);
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  const panel = await textoDe(page);
  const capPanel = await capturar(page, 'B.2.3', plataforma, '2-panel-de-administracion');

  expect(panel, 'el producto no programa copias por sí mismo').not.toMatch(/backup|copia de seguridad|respaldo/i);

  registrar({
    criterio: 'B.2.3',
    plataforma,
    cumple: 1,
    resumen:
      'El sistema no trae copia programada: se repite con el programador de tareas del ' +
      'servidor, y no avisa si una noche falla; la vigila y guarda quien administra.',
    comoLoHace:
      'La documentación del fabricante resuelve la repetición afuera, con el programador de tareas del ' +
      'servidor, que ejecuta todas las noches el volcado de la base.',
    caracteristicas:
      'El producto no trae una copia programada: su panel de administración muestra el estado del ' +
      'servidor y sus variables, y ninguna opción genera un respaldo.',
    justificacion:
      'La condición se satisface con una limitación que la compañía asume: la copia se repite sola, ' +
      'pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque ' +
      'el sistema no avisa si una noche falló.',
    evidencia: [capPanel],
    documentacion: fuente,
  });
});

// ── B.2.5 ────────────────────────────────────────────────────────────────────
test('B.2.5 — Previsibilidad de los cambios del sistema', async ({ browser }, info) => {
  // «Determinar quién decide cuándo se aplica una actualización y con cuánta
  //  anticipación se anuncia»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'Always back up your database before starting the upgrade process',
      captura: 'B-2-5-twenty-1-la-dispara-el-administrador',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'The server runs all required upgrade migrations automatically on startup',
      captura: 'B-2-5-twenty-2-al-arrancar-la-version-nueva',
    }),
  ];

  // La imagen de la instalación evaluada: una versión fija, que cambia solo si se la cambia
  const imagen = docker('inspect', 'twenty-server-1', '--format', '{{.Config.Image}}').trim();

  registrar({
    criterio: 'B.2.5',
    plataforma,
    cumple: 2,
    resumen:
      'En la instalación propia las actualizaciones no llegan solas: el administrador elige ' +
      'cuándo cambiar la versión, previa copia de la base, y ningún cambio sorprende en plena ' +
      'operación.',
    comoLoHace:
      'En la instalación propia la actualización no llega sola: el administrador de la compañía cambia ' +
      'la versión de la imagen, hace antes la copia de la base que pide el fabricante y reinicia.',
    caracteristicas:
      'Recién al arrancar la versión nueva el servidor aplica sus cambios.',
    justificacion:
      'La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún ' +
      'cambio del sistema la sorprende durante la operación.',
    documentacion: fuentes,
    medicion: `Imagen en uso: ${imagen}`,
  });
});

// ── B.2.6 ────────────────────────────────────────────────────────────────────
test('B.2.6 — Alojamiento de los datos en un país con protección adecuada', async ({ browser }, info) => {
  // «Determinar en qué país quedan los datos de la compañía y si ese país tiene protección adecuada según la
  //  autoridad argentina, o si el fabricante ofrece las cláusulas contractuales aprobadas para transferirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/self-host.md',
      buscar: 'Keep all CRM data on your own servers',
      captura: 'B-2-6-twenty-1-datos-en-servidores-propios',
    }),
    await citar(browser, {
      url: 'https://twenty.com/legal/privacy',
      buscar: 'If you use Twenty in a self-hosted environment, we do not collect or have access to the Customer Data in your self-hosted instance; all such data remains under your control on your own servers.',
      captura: 'B-2-6-twenty-2-el-fabricante-no-accede',
    }),
  ];

  registrar({
    criterio: 'B.2.6',
    plataforma,
    cumple: 2,
    resumen:
      'En la instalación propia los datos quedan en el servidor de la compañía, en el país que ella elija, ' +
      'y el fabricante no los recibe: no hay transferencia al exterior que autorizar.',
    comoLoHace:
      'Con la instalación propia, la base de datos y los archivos residen en el servidor donde la compañía ' +
      'instala el sistema. Si lo aloja en Argentina, los datos no salen del país. El fabricante declara que ' +
      'no recoge ni accede a los datos de una instalación propia.',
    caracteristicas:
      'La compañía elige el país de alojamiento. Si decidiera alojarlo en el exterior, la transferencia sería ' +
      'una decisión suya y no del fabricante.',
    justificacion:
      'No hay un tercero que reciba los datos, así que la compañía puede mantenerlos en un país que le ' +
      'resulte adecuado. La seguridad física y lógica del servidor queda a su cargo.',
    documentacion: fuentes,
  });
});

// ── B.2.7 ────────────────────────────────────────────────────────────────────
test('B.2.7 — Continuidad de la atención ante una caída del enlace', async ({ browser }, info) => {
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
    capSinEnlace = await capturar(page, 'B.2.7', plataforma, '1-operando-sin-enlace');
  } finally {
    await contexto.close();
  }

  expect(hechas, 'la operación diaria debe seguir sin salida a internet').toEqual(
    ['ingresar', 'buscar un asegurado', 'registrar un reclamo']);

  registrar({
    criterio: 'B.2.7',
    plataforma,
    cumple: 2,
    resumen:
      'Con la instalación propia, si se corta la salida a internet el sistema sigue operando; ' +
      'solo deja de funcionar el correo.',
    comoLoHace:
      'Con la salida a internet cortada, el sistema sigue operando desde la red propia: se ingresa, se ' +
      'busca un asegurado y se registra un reclamo, que es la atención de todos los días.',
    caracteristicas:
      'La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte ' +
      'es lo que por naturaleza viaja por internet, como el correo y los logotipos de las empresas que ' +
      'la interfaz trae de un servicio externo.',
    justificacion:
      'Con el sistema en la red de la compañía, una caída del enlace no detiene la atención.',
    evidencia: [capSinEnlace],
    medicion: `${bloqueados.length} pedidos a direcciones externas bloqueados durante la prueba` +
      (bloqueados.length ? ` (${[...new Set(bloqueados)].join(', ')})` : ''),
  });
});

// ── B.2.4 ────────────────────────────────────────────────────────────────────
/**
 * El veredicto de B.2.4 se fija a la vista de la medición, con la pregunta de
 * la sección 4.7: ¿la búsqueda responde sin espera perceptible, con una demora
 * que el usuario nota y tolera, o de forma impracticable? No hay un corte en
 * segundos que lo decida. Hasta que se fija, el test mide, informa y no registra nada.
 */
const VEREDICTO_B14: null | { cumple: 2 | 1 | 0; lectura: string; justificacion: string } = {
  cumple: 2,
  lectura:
    'Buscar un asegurado entre cinco mil respondió en un cuarto de segundo o menos las tres veces, y filtrar ' +
    'las doce mil quinientas pólizas por ramo, en menos de dos décimas: no hay espera que el usuario perciba.',
  justificacion:
    'Con la cartera de referencia cargada, el sistema responde como con una cartera chica.',
};

/** Los tiempos con los que se fijó el veredicto: si una corrida los supera con holgura, se vuelve a mirar. */
const MEDIDO_B14 = { texto: 0.25, filtro: 0.14 };

/** Cuánto tardó el servidor en responder un pedido, en segundos. */
async function demora(r: Response) {
  await r.finished();
  return r.request().timing().responseEnd / 1000;
}

test('B.2.4 — Búsqueda y operación con volumen productivo', async ({ page }, info) => {
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
    const capTexto = await capturar(page, 'B.2.4', plataforma, '1-busqueda-por-texto');

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
    const capFiltro = await capturar(page, 'B.2.4', plataforma, '2-filtrado-por-ramo');

    const lectura = `texto ${medidas.texto.map(s => s.toFixed(2)).join(' / ')} s · ` +
                    `filtro ${medidas.filtro.map(s => s.toFixed(2)).join(' / ')} s · carga ${minutosCarga} min`;
    console.log(`    B.2.4 medición: ${lectura}`);
    if (!VEREDICTO_B14) throw new Error(`B.2.4: fijar el veredicto a la vista de la medición (${lectura})`);
    const lejos = Math.max(...medidas.texto) > 2 * MEDIDO_B14.texto || Math.max(...medidas.filtro) > 2 * MEDIDO_B14.filtro;
    if (lejos) throw new Error(`B.2.4: la medición cambió respecto de la que sostiene el veredicto; volver a mirarlo (${lectura})`);

    registrar({
      criterio: 'B.2.4',
      plataforma,
      cumple: VEREDICTO_B14.cumple,
      resumen:
        'Con veinticinco mil registros, la búsqueda por texto y el filtro por ramo responden ' +
        'sin espera perceptible.',
      comoLoHace:
        'Las operaciones de todos los días —buscar un asegurado por texto desde la búsqueda general y ' +
        'filtrar las pólizas por ramo— se hacen sobre una cartera de veinticinco mil registros: cinco ' +
        'mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos.',
      caracteristicas: VEREDICTO_B14.lectura,
      justificacion: VEREDICTO_B14.justificacion,
      evidencia: [capTexto, capFiltro],
      medicion: lectura,
    });
  } finally {
    // La carga se quita siempre: con ella, los demás criterios leerían otra cartera
    borrarCarga();
  }
});

// ── B.2.8 ────────────────────────────────────────────────────────────────────
test('B.2.8 — Atención de los derechos del titular de los datos', async ({ page, browser }, info) => {
  // «Sobre un asegurado con póliza, obtener de una vez todos sus datos, corregir uno y suprimir o bloquear
  //  la ficha, y comprobar qué constancia queda de cada pedido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await alistarReclamo(e.api);
  const api = e.api;
  const titular = { firstName: 'Ricardo', lastName: 'Domínguez', email: 'rdominguez.b28@ejemplo.test' };
  for (const p of (await registros(api, 'people')).filter(p => p.emails?.primaryEmail === titular.email)) await borrarRegistro(api, 'people', p.id);
  for (const p of await registros(api, 'people', 'deletedAt[is]:NOT_NULL')) await api.delete(`people/${p.id}`, { params: { soft_delete: 'false' } });
  for (const p of (await registros(api, 'polizas')).filter(p => p.name === 'POL-B28-HOGAR')) await borrarRegistro(api, 'polizas', p.id);
  for (const r of (await registros(api, 'reclamos')).filter(r => r.name === 'B28 reclamo por granizo')) await borrarRegistro(api, 'reclamos', r.id);
  const persona = await crearRegistro(api, 'people', {
    name: { firstName: titular.firstName, lastName: titular.lastName }, emails: { primaryEmail: titular.email },
    phones: { primaryPhoneNumber: '1145551234', primaryPhoneCountryCode: 'AR', primaryPhoneCallingCode: '+54' }, jobTitle: 'Docente',
  });
  await crearRegistro(api, 'polizas', { name: 'POL-B28-HOGAR', titularId: persona.id });
  await crearRegistro(api, 'reclamos', { name: 'B28 reclamo por granizo', aseguradoId: persona.id });

  // 1. Todos sus datos: la ficha y la exportación de lo marcado en el listado
  await abrirFicha(page, 'person', persona.id);
  const capFicha = await capturar(page, 'B.2.8', plataforma, '1-ficha-del-asegurado');
  await abrirListado(page, 'people');
  await marcarFilas(page, [persona.id]);
  await page.waitForTimeout(1500);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await page.waitForTimeout(1500);
  console.log('    menú con la fila marcada:', (await textoDe(page)).replace(/\s+/g, ' ').slice(0, 500));
  const capMarcada = await capturar(page, 'B.2.8', plataforma, '2-menu-con-la-fila-marcada');
  const dir = mkdtempSync(join(tmpdir(), 'b28-'));
  const [descarga] = await Promise.all([
    page.waitForEvent('download', { timeout: 90_000 }),
    clicReal(page, page.getByText(/^Export Person$|^Exportar Persona$/).last()),
  ]);
  await descarga.saveAs(join(dir, 'asegurado.csv'));
  const csv = readFileSync(join(dir, 'asegurado.csv'), 'utf8');
  rmSync(dir, { recursive: true, force: true });
  console.log('    exportación:', csv.replace(/\s+/g, ' ').slice(0, 700));
  await page.keyboard.press('Escape');

  // 2. Corregir un dato: el cargo, desde la ficha
  await abrirFicha(page, 'person', persona.id);
  await escribirEnFicha(page, 'jobTitle', 'Profesor');
  const capCorregido = await capturar(page, 'B.2.8', plataforma, '3-dato-corregido');
  const guardada = (await registros(api, 'people')).find(p => p.id === persona.id);
  expect(guardada.jobTitle, 'el dato corregido debe quedar guardado').toBe('Profesor');
  const historial = await registros(api, 'timelineActivities', `targetPersonId[eq]:${persona.id}`);
  console.log('    historial tras corregir:', historial.map(h => `${h.name}:${JSON.stringify(h.properties?.diff ?? {}).slice(0, 120)}`).join(' || '));

  // 3. Suprimir la ficha
  await abrirListado(page, 'people');
  await marcarFilas(page, [persona.id]);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await clicReal(page, page.getByText(/^Delete Person$|^Eliminar Persona$/).last());
  await page.waitForTimeout(1500);
  const tras = await registros(api, 'people', `id[eq]:${persona.id}`);
  console.log('    tras borrar, por la API:', tras.length);
  const capBorrado = await capturar(page, 'B.2.8', plataforma, '4-ficha-borrada');
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await clicReal(page, page.getByText(/^See deleted People$|^Ver Personas eliminadas$|^See deleted/).last());
  await page.waitForTimeout(3000);
  console.log('    eliminados:', (await textoDe(page)).replace(/\s+/g, ' ').slice(0, 500));
  await capturar(page, 'B.2.8', plataforma, '5-eliminados');
  await marcarFilas(page, [persona.id]);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await page.waitForTimeout(1500);
  const capEliminados = await capturar(page, 'B.2.8', plataforma, '6-menu-de-eliminados');
  await clicReal(page, page.getByText(/^Permanently destroy Person$|^Destruir permanentemente/).last());
  await page.waitForTimeout(1500);
  const dialogo = await textoDe(page);
  console.log('    destruir, diálogo:', dialogo.replace(/\s+/g, ' ').slice(0, 400));
  const confirmar = page.getByRole('button', { name: /^Permanently destroy|^Destroy|^Destruir|^Confirm|^Eliminar/ }).filter({ visible: true }).last();
  if (await confirmar.isVisible().catch(() => false)) await clicReal(page, confirmar);
  await page.waitForTimeout(4000);
  const capDestruido = await capturar(page, 'B.2.8', plataforma, '7-destruido');

  // 4. La constancia que queda
  const quedan = await registros(api, 'people', `id[eq]:${persona.id}`);
  const enPapelera = await registros(api, 'people', `id[eq]:${persona.id},deletedAt[is]:NOT_NULL`);
  const rastro = await registros(api, 'timelineActivities', `targetPersonId[eq]:${persona.id}`);
  const poliza = (await registros(api, 'polizas')).find(p => p.name === 'POL-B28-HOGAR');
  const reclamo = (await registros(api, 'reclamos')).find(r => r.name === 'B28 reclamo por granizo');
  console.log(`    tras destruir: persona ${quedan.length}/${enPapelera.length}, historial ${rastro.length}, póliza.titularId=${poliza?.titularId}, reclamo.aseguradoId=${reclamo?.aseguradoId}`);

  expect(csv, 'la exportación debe traer los datos del asegurado').toContain(titular.email);
  expect(csv, 'si la exportación trajera sus pólizas, este veredicto no corresponde').not.toContain('POL-B28-HOGAR');
  expect(quedan.length + enPapelera.length, 'la ficha debe quedar suprimida').toBe(0);
  expect(rastro.length, 'si quedara constancia de la supresión, este veredicto no corresponde').toBe(0);

  registrar({
    criterio: 'B.2.8',
    plataforma,
    cumple: 1,
    resumen:
      'Exporta, corrige y suprime la ficha, y la corrección queda en el historial; pero la exportación no ' +
      'incluye pólizas ni reclamos y la supresión no deja constancia.',
    comoLoHace:
      'Desde el listado de personas se marca al asegurado y se exporta: el archivo trae sus datos propios. ' +
      'La corrección se hace en la ficha y el historial guarda el valor anterior, el nuevo y quién lo cambió. ' +
      'La supresión se pide desde el listado: la ficha pasa a eliminados y desde ahí se destruye definitivamente. ' +
      'No hay forma de bloquearla en lugar de suprimirla.',
    caracteristicas:
      'La exportación trae los datos del asegurado, no los de sus pólizas y reclamos, que se exportan por separado ' +
      'desde sus propios listados. Al destruir la ficha desaparece también su historial, y las pólizas y reclamos ' +
      'quedan sin titular. No queda ningún registro de que el pedido se atendió.',
    justificacion:
      'Los tres pedidos se pueden atender, pero la compañía tiene que asumir que reunir todos los datos del titular ' +
      'lleva una exportación por cada tipo de registro, y que la constancia de haber respondido en plazo debe ' +
      'llevarla por fuera del sistema.',
    evidencia: [capFicha, capMarcada, capCorregido, capBorrado, capEliminados, capDestruido],
  });
});

// ── B.2.9 ────────────────────────────────────────────────────────────────────
test('B.2.9 — Baja de las comunicaciones comerciales por medio', async ({ page, browser }, info) => {
  // «Marcar a un asegurado para que no reciba correos comerciales, armar una campaña de correo que lo incluya
  //  en su segmento y comprobar que el envío lo excluye»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  const BAJA = { firstName: 'Natalia', lastName: 'Ferrer', email: 'nferrer.b29@ejemplo.test' };
  const ALTA = { firstName: 'Tomás', lastName: 'Quiroga', email: 'tquiroga.b29@ejemplo.test' };
  for (const p of (await registros(api, 'people')).filter(p => /\.b29@/.test(p.emails?.primaryEmail ?? ''))) await borrarRegistro(api, 'people', p.id);
  for (const p of await registros(api, 'people', 'deletedAt[is]:NOT_NULL')) await api.delete(`people/${p.id}`, { params: { soft_delete: 'false' } });
  const baja = await crearRegistro(api, 'people', { name: { firstName: BAJA.firstName, lastName: BAJA.lastName }, emails: { primaryEmail: BAJA.email } });
  await crearRegistro(api, 'people', { name: { firstName: ALTA.firstName, lastName: ALTA.lastName }, emails: { primaryEmail: ALTA.email } });

  // 1. ¿Hay dónde marcar la baja? La ficha no trae un campo para eso: se agrega uno propio
  await abrirFicha(page, 'person', baja.id);
  const capSinCampo = await capturar(page, 'B.2.9', plataforma, '1-ficha-sin-campo-de-baja');
  const propios = (await objeto(api, 'person')).fields.filter((c: any) => c.isCustom).map((c: any) => c.label);
  expect(propios.filter((l: string) => l !== 'Acepta comunicaciones comerciales' && /baja|opt|suscrip|comunicaciones/i.test(l)), 'si la ficha trajera un campo de baja, este veredicto no corresponde').toEqual([]);
  const ETIQUETA = 'Acepta comunicaciones comerciales';
  await quitarCampo(api, 'person', ETIQUETA);
  await nuevoCampo(page, 'people', 'True/False', ETIQUETA);
  const nombreCampo = (await objeto(api, 'person')).fields.find((c: any) => c.label === ETIQUETA).name;

  // 2. Se da de baja al asegurado: el campo viene en verdadero y se lo pasa a falso
  await abrirFicha(page, 'person', baja.id);
  const antes = (await registros(api, 'people')).find(p => p.id === baja.id)[nombreCampo];
  await clicReal(page, valorEnFicha(page, nombreCampo));
  await page.waitForTimeout(2000);
  const capBaja = await capturar(page, 'B.2.9', plataforma, '2-asegurado-dado-de-baja');
  const marcado = (await registros(api, 'people')).find(p => p.id === baja.id)[nombreCampo];
  expect(antes, 'el campo nuevo debe venir en verdadero').toBe(true);
  expect(marcado, 'el asegurado debe quedar dado de baja').toBe(false);

  // 3. El segmento de la campaña: el listado completo incluye a los dos; solo el filtro por el campo excluye al de baja
  await abrirListado(page, 'people');
  const completo = await textoDe(page);
  const capCompleto = await capturar(page, 'B.2.9', plataforma, '3-segmento-completo');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText(ETIQUETA, { exact: true }).last());
  await clicReal(page, page.getByText('Verdadero', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  const filtrado = await textoDe(page);
  const capFiltrado = await capturar(page, 'B.2.9', plataforma, '4-segmento-filtrado');

  expect(completo, 'el listado completo incluye al asegurado dado de baja').toContain(BAJA.email);
  expect(filtrado, 'el segmento filtrado conserva al que acepta').toContain(ALTA.email);
  expect(filtrado, 'el segmento filtrado excluye al dado de baja').not.toContain(BAJA.email);

  registrar({
    criterio: 'B.2.9',
    plataforma,
    cumple: 1,
    resumen:
      'La baja se marca con un campo propio y un segmento filtrado la respeta, pero ningún envío la aplica por sí ' +
      'solo: cada campaña debe lanzarse sobre ese segmento.',
    comoLoHace:
      'La ficha no trae dónde registrar la baja: se agrega un campo de verdadero o falso, que viene en verdadero. ' +
      'Para dar de baja a un asegurado se pasa a falso en su ficha. El segmento de la campaña se arma con un filtro ' +
      'por ese campo, y entonces el asegurado dado de baja no figura entre los destinatarios.',
    caracteristicas:
      'La baja es un dato del asegurado, sin fecha ni medio de contacto, y no se aplica al enviar: el listado ' +
      'completo sigue incluyendo al dado de baja, así que quien lance una campaña sobre él lo alcanza. ' +
      'Los envíos masivos con baja del destinatario están en una función de campañas todavía en prueba.',
    justificacion:
      'La compañía puede registrar la baja y excluirla del segmento, pero debe asumir que la exclusión depende de que ' +
      'cada campaña se arme sobre la vista filtrada. No se completó el envío de prueba hasta el buzón porque exige ' +
      'cambiar una variable de seguridad del servidor.',
    documentacion: await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/email-campaigns/overview',
      buscar: /puts the unsubscribe page on your domain too/i,
      captura: 'B-2-9-twenty-5-campanas-con-baja-en-beta',
    }),
    evidencia: [capSinCampo, capBaja, capCompleto, capFiltrado],
  });
});
