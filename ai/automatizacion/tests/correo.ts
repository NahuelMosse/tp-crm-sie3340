import { execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { APIRequestContext, request } from '@playwright/test';

/**
 * El servidor de correo de prueba.
 *
 * Un GreenMail en un contenedor, con SMTP e IMAP reales: EspoCRM envía y
 * sincroniza casillas contra él como lo haría contra el servidor de la
 * compañía. Las pruebas leen lo recibido por su interfaz de programación.
 *
 * EspoCRM lo alcanza por el anfitrión: los puertos los asignó el gobernador de
 * recursos, bajo los nombres tp-crm/correo-smtp, -imap y -api.
 */
export const CORREO = {
  /** Cómo lo ve EspoCRM, desde su contenedor */
  host: 'host.docker.internal',
  smtp: 8706,
  imap: 8707,
  /** Cómo lo ven las pruebas, desde el anfitrión */
  api: 'http://localhost:8708/api/',
};

/** La casilla de atención de la compañía, que se comparte entre usuarios. */
export const ATENCION = 'atencion@aseguradora.test';

/** Mensajes recibidos en una casilla. */
export async function recibidos(casilla: string): Promise<{ subject: string; mimeMessage: string }[]> {
  const api = await request.newContext({ baseURL: CORREO.api });
  const r = await api.get(`user/${encodeURIComponent(casilla)}/messages/`);
  return r.ok() ? r.json() : [];
}

/** Vacía todas las casillas: cada corrida parte de cero. */
export async function vaciarCasillas() {
  const api = await request.newContext({ baseURL: CORREO.api });
  await api.post('mail/purge');
}

/**
 * Manda un correo desde afuera, como lo mandaría un asegurado desde su casilla.
 * Se habla SMTP directo desde el contenedor de EspoCRM, que ya tiene PHP.
 */
export function enviarDesdeAfuera(de: string, para: string, asunto: string, cuerpo: string) {
  const php = `
    $s = fsockopen('${CORREO.host}', ${CORREO.smtp}, $e, $m, 10);
    $l = function () use ($s) { return fgets($s); };
    $l();
    foreach (['HELO afuera', 'MAIL FROM:<${de}>', 'RCPT TO:<${para}>', 'DATA'] as $c) { fwrite($s, "$c\\r\\n"); $l(); }
    fwrite($s, "From: <${de}>\\r\\nTo: <${para}>\\r\\nSubject: =?UTF-8?B?" . base64_encode('${asunto}') . "?=\\r\\n" .
      "MIME-Version: 1.0\\r\\nContent-Type: text/plain; charset=UTF-8\\r\\n\\r\\n${cuerpo}\\r\\n.\\r\\n");
    $l();
    fwrite($s, "QUIT\\r\\n");`;
  execFileSync('docker', ['exec', 'tp-espocrm', 'php', '-r', php], { encoding: 'utf8' });
}

/**
 * Manda un correo desde afuera hablando SMTP directo con el servidor de prueba
 * desde el anfitrión, sin pasar por ningún contenedor de CRM: es lo que llega
 * a la casilla de la compañía desde un remitente externo.
 */
export async function enviarPorSmtpLocal(de: string, para: string, asunto: string, cuerpo: string) {
  const socket = createConnection({ host: '127.0.0.1', port: CORREO.smtp });
  let buffer = '';
  socket.setEncoding('utf8');
  socket.on('data', d => { buffer += d; });
  const respuesta = async () => {
    for (let i = 0; i < 100; i++) {
      if (/^\d{3} .*\r?\n$/m.test(buffer) && buffer.endsWith('\n')) { const r = buffer; buffer = ''; return r; }
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('El servidor SMTP de prueba no respondió');
  };
  await respuesta();
  for (const c of ['HELO afuera', `MAIL FROM:<${de}>`, `RCPT TO:<${para}>`, 'DATA']) {
    socket.write(`${c}\r\n`);
    await respuesta();
  }
  socket.write(
    `From: <${de}>\r\nTo: <${para}>\r\nSubject: =?UTF-8?B?${Buffer.from(asunto).toString('base64')}?=\r\n` +
    `MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${cuerpo}\r\n.\r\n`);
  const fin = await respuesta();
  if (!fin.startsWith('250')) throw new Error(`El servidor rechazó el mensaje: ${fin}`);
  socket.write('QUIT\r\n');
  socket.end();
}

/**
 * Corre el programador de tareas del sistema, como lo hace el servidor cada
 * minuto: sincroniza casillas y despacha envíos masivos. Se repite porque la
 * primera pasada encola y la siguiente ejecuta.
 */
export async function correrTareas(veces = 3) {
  for (let i = 0; i < veces; i++) {
    execFileSync('docker', ['exec', '-u', 'www-data', 'tp-espocrm', 'php', 'cron.php'], { encoding: 'utf8' });
    await new Promise(r => setTimeout(r, 4000));
  }
}

/**
 * Corre el programador cada medio minuto hasta que se cumpla la condición.
 * Las tareas periódicas del sistema —como revisar las casillas— corren una vez
 * por minuto: varias pasadas dentro del mismo minuto no adelantan nada.
 */
export async function correrTareasHasta(condicion: () => Promise<boolean>, minutos = 5) {
  const limite = Date.now() + minutos * 60_000;
  while (Date.now() < limite) {
    execFileSync('docker', ['exec', '-u', 'www-data', 'tp-espocrm', 'php', 'cron.php'], { encoding: 'utf8' });
    if (await condicion()) return true;
    await new Promise(r => setTimeout(r, 30_000));
  }
  return condicion();
}

/**
 * Habilita el servidor de prueba en EspoCRM.
 *
 * Por seguridad el sistema rechaza servidores de correo en direcciones
 * internas, y el de prueba lo es. El servidor real de una compañía no lo
 * sería: esto es un ajuste del entorno de prueba, no de lo que se evalúa.
 */
export async function habilitarServidorDePrueba(api: APIRequestContext) {
  const r = await api.put('Settings', { data: {
    emailServerAllowedAddressList: [`${CORREO.host}:${CORREO.smtp}`, `${CORREO.host}:${CORREO.imap}`],
  } });
  if (!r.ok()) throw new Error(`No se pudo habilitar el servidor de correo de prueba: ${r.status()}`);
}
