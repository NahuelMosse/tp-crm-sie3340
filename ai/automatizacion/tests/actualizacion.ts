import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Copia de cada instalación para ensayar una actualización (A.8.4).
 *
 * Nunca se actualiza la instalación en uso: se toma una copia —el volcado de
 * la base y las carpetas que guardan lo propio de la compañía—, se la restituye
 * en contenedores aparte con el mismo procedimiento de copia de cada fabricante,
 * y la actualización se aplica sobre esa copia. Esto solo prepara el escenario:
 * lo que ocurrió con lo parametrizado se comprueba recorriendo la pantalla.
 */

const RED = 'tp-crm-a84';
const DIR = (nombre: string) => `${RED}-${nombre}`;

function docker(...args: string[]): string {
  const r = spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`docker ${args.slice(0, 4).join(' ')}: ${r.stderr || r.stdout}`);
  return r.stdout;
}
/** Guarda en un archivo el .tar.gz de una carpeta de un contenedor, sin montar carpetas de la máquina. */
function empaquetar(contenedor: string, carpeta: string, archivo: string) {
  const r = spawnSync('docker', ['run', '--rm', '--volumes-from', contenedor, 'alpine', 'tar', '-czf', '-', '-C', carpeta, '.'],
    { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`empaquetar: ${r.stderr}`);
  writeFileSync(archivo, r.stdout);
}
/** Restituye un .tar.gz en un volumen. */
function desempaquetar(volumen: string, archivo: string) {
  const r = spawnSync('docker', ['run', '--rm', '-i', '-v', `${volumen}:/hacia`, 'alpine', 'tar', '-xzf', '-', '-C', '/hacia'],
    { input: readFileSync(archivo), maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`desempaquetar: ${r.stderr}`);
}
const intentar = (...args: string[]) => { try { return docker(...args); } catch { return null; } };
const pausa = (ms: number) => new Promise(r => setTimeout(r, ms));

async function esperar(listo: () => boolean | Promise<boolean>, intentos: number, ms: number, que: string) {
  for (let i = 0; i < intentos; i++) {
    if (await Promise.resolve(listo()).catch(() => false)) return;
    await pausa(ms);
  }
  throw new Error(`Se agotó la espera: ${que}`);
}

const corriendo = (contenedor: string) =>
  (intentar('inspect', '-f', '{{.State.Running}}', contenedor) ?? '').trim() === 'true';

async function responde(url: string): Promise<boolean> {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  return r.ok;
}

/** Espera a que la imagen de una base termine de inicializarse y quede lista. */
async function baseLista(contenedor: string, finInit: string, lista: string) {
  await esperar(() => {
    const r = spawnSync('docker', ['logs', contenedor], { encoding: 'utf8' });
    const registro = `${r.stdout}${r.stderr}`;
    const fin = registro.indexOf(finInit);
    return fin > -1 && registro.indexOf(lista, fin) > -1;
  }, 450, 2000, `la base ${contenedor} no quedó lista`);
}

/** Enciende un contenedor de la instalación en uso solo el tiempo que dura la copia. */
async function conEncendido<T>(contenedor: string, listo: () => boolean, hacer: () => T | Promise<T>): Promise<T> {
  const estaba = corriendo(contenedor);
  if (!estaba) docker('start', contenedor);
  try {
    await esperar(listo, 450, 4000, `${contenedor} no arrancó`);
    return await hacer();
  } finally {
    if (!estaba) intentar('stop', contenedor);
  }
}

export interface Copia { dir: string; puerto: number; version: string }

// ── EspoCRM ──────────────────────────────────────────────────────────────────

const ESPO = { app: DIR('espocrm'), db: DIR('espocrm-db'), carpetas: [
  ['custom', '/var/www/html/custom'], ['data', '/var/www/html/data'], ['client', '/var/www/html/client/custom'],
] as const };

function lanzarEspo(puerto: number, version: string) {
  docker('run', '-d', '--name', ESPO.app, '--network', RED, '-p', `${puerto}:80`,
    '-e', 'ESPOCRM_DATABASE_HOST=espocrm-db', '-e', 'ESPOCRM_DATABASE_NAME=espocrm',
    '-e', 'ESPOCRM_DATABASE_USER=espocrm', '-e', 'ESPOCRM_DATABASE_PASSWORD=espocrm',
    '-e', 'ESPOCRM_ADMIN_USERNAME=admin', '-e', 'ESPOCRM_ADMIN_PASSWORD=Admin1234!',
    '-e', `ESPOCRM_SITE_URL=http://localhost:${puerto}`,
    ...ESPO.carpetas.flatMap(([n, ruta]) => ['-v', `${DIR(`espocrm-${n}`)}:${ruta}`]),
    `espocrm/espocrm:${version}`);
}

/** La versión que informa la propia aplicación, por consola. */
export const versionEspo = () =>
  docker('exec', '-w', '/var/www/html', ESPO.app, 'php', 'command.php', 'version').trim();

/** Copia la instalación de EspoCRM en uso y la levanta, en la versión indicada, en contenedores aparte. */
export async function copiarEspoCrm(puerto: number, version: string): Promise<Copia> {
  const dir = mkdtempSync(join(tmpdir(), 'a84-espocrm-'));
  // La copia: volcado de la base y carpetas custom, data y client/custom, como en B.2.2
  await conEncendido('tp-espocrm-db', () => intentar('exec', 'tp-espocrm-db', 'mariadb-admin', '-uespocrm', '-pespocrm', 'ping') !== null, () => {
    writeFileSync(join(dir, 'base.sql'), docker('exec', 'tp-espocrm-db', 'mariadb-dump', '-uespocrm', '-pespocrm', 'espocrm'), 'utf8');
  });
  for (const [n, ruta] of ESPO.carpetas) {
    empaquetar('tp-espocrm', ruta, join(dir, `${n}.tar.gz`));
  }

  // La restitución, en contenedores y volúmenes propios de la prueba
  intentar('network', 'create', RED);
  docker('run', '-d', '--name', ESPO.db, '--network', RED, '--network-alias', 'espocrm-db',
    '-v', `${DIR('espocrm-db')}:/var/lib/mysql`,
    '-e', 'MARIADB_ROOT_PASSWORD=rootpass', '-e', 'MARIADB_DATABASE=espocrm',
    '-e', 'MARIADB_USER=espocrm', '-e', 'MARIADB_PASSWORD=espocrm', 'mariadb:11');
  await baseLista(ESPO.db, 'init process done', 'ready for connections');
  docker('cp', join(dir, 'base.sql'), `${ESPO.db}:/base.sql`);
  for (let i = 1; ; i++) {
    try { docker('exec', ESPO.db, 'sh', '-c', 'mariadb -uroot -prootpass espocrm < /base.sql'); break; }
    catch (e) { if (i >= 20) throw e; await pausa(3000); }
  }
  for (const [n] of ESPO.carpetas) {
    desempaquetar(DIR(`espocrm-${n}`), join(dir, `${n}.tar.gz`));
  }
  lanzarEspo(puerto, version);
  await esperarEspo(puerto);
  return { dir, puerto, version };
}

async function esperarEspo(puerto: number) {
  await esperar(() => responde(`http://localhost:${puerto}/`) as any, 300, 3000,
    'EspoCRM no respondió');
}

/**
 * Aplica la actualización como lo indica el fabricante para Docker: se detienen y
 * se quitan los contenedores y se vuelven a crear con la misma configuración y la
 * imagen nueva; al arrancar, el contenedor actualiza la instalación.
 */
export async function actualizarEspoCrm(copia: Copia, version: string): Promise<string> {
  docker('stop', ESPO.app);
  docker('rm', ESPO.app);
  lanzarEspo(copia.puerto, version);
  // El contenedor actualiza antes de servir: se espera a que la aplicación informe la versión nueva
  await esperar(() => (intentar('exec', '-w', '/var/www/html', ESPO.app, 'php', 'command.php', 'version') ?? '').includes(version),
    300, 4000, `EspoCRM no informó la versión ${version}`);
  await esperarEspo(copia.puerto);
  return docker('logs', ESPO.app);
}

/** Cuenta filas de una tabla de la copia (borrado lógico excluido). */
export const sqlEspo = (consulta: string) =>
  docker('exec', ESPO.db, 'mariadb', '-uroot', '-prootpass', '-N', '-e', consulta, 'espocrm').trim();

// ── Twenty ───────────────────────────────────────────────────────────────────

const TW = { db: DIR('twenty-db'), redis: DIR('twenty-redis'), server: DIR('twenty-server'), worker: DIR('twenty-worker'),
  storage: DIR('twenty-storage'), local: '/app/packages/twenty-server/.local-storage' };

function lanzarTwenty(dir: string, puerto: number, version: string, soloServidor = false) {
  const base = ['run', '-d', '--env-file', join(dir, 'env'), '-v', `${TW.storage}:${TW.local}`, '--network', RED];
  docker(...base, '--name', TW.server, '--network-alias', 'server', '-p', `${puerto}:3000`,
    '-e', `SERVER_URL=http://localhost:${puerto}`, `twentycrm/twenty:${version}`);
  if (soloServidor) return;
  lanzarTrabajador(dir, puerto, version);
}

function lanzarTrabajador(dir: string, puerto: number, version: string) {
  docker('run', '-d', '--env-file', join(dir, 'env'), '-v', `${TW.storage}:${TW.local}`, '--network', RED,
    '--name', TW.worker, '--network-alias', 'worker',
    '-e', 'DISABLE_DB_MIGRATIONS=true', '-e', 'DISABLE_CRON_JOBS_REGISTRATION=true',
    '-e', `SERVER_URL=http://localhost:${puerto}`, `twentycrm/twenty:${version}`, 'yarn', 'worker:prod');
}

async function esperarTwenty(puerto: number) {
  await esperar(() => responde(`http://localhost:${puerto}/healthz`) as any, 450, 4000, 'Twenty no respondió');
}

/** La versión con que arrancó el servidor de la copia. */
export const versionTwenty = () => docker('exec', TW.server, 'printenv', 'APP_VERSION').trim();

/** Copia la instalación de Twenty en uso y la levanta, en la versión indicada, en contenedores aparte. */
export async function copiarTwenty(puerto: number, version: string): Promise<Copia> {
  const dir = mkdtempSync(join(tmpdir(), 'a84-twenty-'));
  // La copia: el volcado que indica el fabricante y la carpeta de archivos del servidor
  await conEncendido('twenty-db-1', () => intentar('exec', 'twenty-db-1', 'pg_isready', '-U', 'postgres') !== null, () => {
    writeFileSync(join(dir, 'base.sql'), docker('exec', 'twenty-db-1', 'pg_dumpall', '-U', 'postgres'), 'utf8');
  });
  empaquetar('twenty-server-1', TW.local, join(dir, 'archivos.tar.gz'));
  // Las variables del servidor en uso, sin las que fija la imagen
  const entorno: string[] = JSON.parse(docker('inspect', '-f', '{{json .Config.Env}}', 'twenty-server-1'));
  writeFileSync(join(dir, 'env'), entorno
    .filter(l => !/^(PATH|NODE_VERSION|YARN_VERSION|APP_VERSION|NODE_ENV|SERVER_URL)=/.test(l)).join('\n') + '\n');

  intentar('network', 'create', RED);
  docker('run', '-d', '--name', TW.db, '--network', RED, '--network-alias', 'db',
    '-v', `${DIR('twenty-db')}:/var/lib/postgresql/data`,
    '-e', 'POSTGRES_PASSWORD=tpcrm2026', '-e', 'POSTGRES_USER=postgres', 'postgres:16');
  await baseLista(TW.db, 'PostgreSQL init process complete', 'database system is ready to accept connections');
  docker('cp', join(dir, 'base.sql'), `${TW.db}:/base.sql`);
  // El volcado completo recrea roles y la base: lo que ya existe en la copia avisa y se sigue
  intentar('exec', TW.db, 'psql', '-U', 'postgres', '-f', '/base.sql', 'postgres');
  docker('run', '-d', '--name', TW.redis, '--network', RED, '--network-alias', 'redis', 'redis:latest', '--maxmemory-policy', 'noeviction');
  desempaquetar(TW.storage, join(dir, 'archivos.tar.gz'));
  lanzarTwenty(dir, puerto, version);
  await esperarTwenty(puerto);
  return { dir, puerto, version };
}

/**
 * Aplica la actualización como lo indica el fabricante: se baja el conjunto, se cambia
 * la versión de la imagen y se lo vuelve a levantar; el servidor corre solo las
 * migraciones al arrancar.
 */
export async function actualizarTwenty(copia: Copia, version: string): Promise<string> {
  docker('rm', '-f', TW.worker, TW.server);
  lanzarTwenty(copia.dir, copia.puerto, version, true);
  await esperarTwenty(copia.puerto);
  lanzarTrabajador(copia.dir, copia.puerto, version);
  return docker('logs', TW.server);
}

/** Cuenta registros de una tabla del espacio de trabajo de la copia. */
export const sqlTwenty = (consulta: string) =>
  docker('exec', TW.db, 'psql', '-U', 'postgres', '-d', 'default', '-At', '-c', consulta).trim();

// ── limpieza ─────────────────────────────────────────────────────────────────

/** Quita la copia de una plataforma: contenedores, volúmenes y carpeta temporal. */
export function retirarCopia(plataforma: 'espocrm' | 'twenty', dir?: string) {
  const nombres = plataforma === 'espocrm'
    ? [ESPO.app, ESPO.db, DIR('espocrm-db'), ...ESPO.carpetas.map(([n]) => DIR(`espocrm-${n}`))]
    : [TW.worker, TW.server, TW.redis, TW.db, DIR('twenty-db'), TW.storage];
  const contenedores = plataforma === 'espocrm' ? nombres.slice(0, 2) : nombres.slice(0, 4);
  const volumenes = nombres.slice(contenedores.length);
  for (const c of contenedores) intentar('rm', '-f', c);
  for (const v of volumenes) intentar('volume', 'rm', '-f', v);
  // La red se quita cuando ya no quedan copias
  intentar('network', 'rm', RED);
  if (dir) rmSync(dir, { recursive: true, force: true });
}
