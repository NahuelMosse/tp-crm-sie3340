import { Browser, Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { menuLateral, panelListo } from './navegar';
import { rest } from './ui';

/**
 * Productores con cuenta propia en el portal.
 *
 * Varios criterios (A.3, A.5, A.9) necesitan un usuario real, distinto del
 * administrador, para comprobar lo que ve un productor. El alta se hace desde
 * «Empleados» › «Invitar» › «Crear usuario», por pantalla: se probó primero
 * con el correo real de la invitación —una casilla temporal, porque el
 * productor no tiene bandeja propia en esta evaluación—, pero el portal
 * rechaza esa vía con un error genérico sin importar el proveedor de la
 * casilla (se probaron mail.tm y Guerrilla Mail, con y sin departamento
 * elegido): el alta por invitación con correo real no quedó disponible.
 *
 * Se resolvió con la opción «No enviar invitación» del mismo formulario, que
 * sí completa el alta, y la contraseña se fija después por la interfaz de
 * programación —preparación de escenario, no lo que evalúa ningún criterio—.
 * Iniciar sesión con esa cuenta por primera vez le exige a Bitrix24 un código
 * de verificación por correo, y ese paso no se pudo destrabar con una casilla
 * temporal en el tiempo disponible: los criterios que necesitan ver el portal
 * *como* el productor quedan sin verificar hasta resolver ese último paso.
 *
 * El alta se hace una sola vez por productor: los datos quedan en un archivo
 * fuera del repositorio (`productores-bitrix24.json`), y las corridas
 * siguientes lo reutilizan.
 */

const RAIZ = join(__dirname, '..', '..');
const CREDENCIALES = join(RAIZ, 'productores-bitrix24.json');
const CLAVE_PRODUCTOR = 'Productor1234!';

export interface Productor {
  usuario: string;
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
  /** true si se pudo iniciar sesión con esta cuenta (ver el bloqueo de arriba) */
  conSesion: boolean;
  storageState?: string;
}

function leerCredenciales(): Record<string, Productor> {
  return existsSync(CREDENCIALES) ? JSON.parse(readFileSync(CREDENCIALES, 'utf8')) : {};
}

function guardarCredencial(p: Productor) {
  const todas = leerCredenciales();
  todas[p.usuario] = p;
  mkdirSync(RAIZ, { recursive: true });
  writeFileSync(CREDENCIALES, JSON.stringify(todas, null, 2), 'utf8');
}

/**
 * Da de alta un productor con cuenta propia, desde «Empleados» › «Invitar» ›
 * «Crear usuario», sin mandar la invitación por correo (ver el comentario del
 * módulo). Reutiliza el productor si ya existe, de una corrida anterior.
 */
export async function productor(
  page: Page, usuario: string, nombre: string, apellido: string,
): Promise<Productor> {
  const previo = leerCredenciales()[usuario];
  if (previo) return previo;

  const correo = `act.${usuario}.${Date.now()}@aseguradora-test.com`;

  await menuLateral(page, 'Empleados');
  await page.locator('button, a, .ui-btn').filter({ hasText: /^Invitar$/ }).filter({ visible: true }).first().click();
  const marco = () => page.frames().find(f => f.url().includes('intranet.invitation'));
  for (let i = 0; i < 20 && !marco(); i++) await page.waitForTimeout(500);
  const invitacion = marco();
  if (!invitacion) throw new Error('No se abrió el panel de invitación de usuarios');

  await invitacion.locator('text=Crear usuario').first().click();
  await page.waitForTimeout(1500);
  await invitacion.locator('input[name="ADD_EMAIL"]').click();
  await invitacion.locator('input[name="ADD_EMAIL"]').pressSequentially(correo, { delay: 40 });
  await invitacion.locator('input[name="ADD_NAME"]').click();
  await invitacion.locator('input[name="ADD_NAME"]').pressSequentially(nombre, { delay: 60 });
  await invitacion.locator('input[name="ADD_LAST_NAME"]').click();
  await invitacion.locator('input[name="ADD_LAST_NAME"]').pressSequentially(apellido, { delay: 60 });
  // El alta por invitación de correo no completa en esta evaluación (ver comentario del módulo)
  await invitacion.locator('text=No enviar invitación').filter({ visible: true }).first().click();
  await page.waitForTimeout(500);

  const [resp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('action=add'), { timeout: 20_000 }),
    invitacion.locator('button, .ui-btn').filter({ hasText: /^Crear$/ }).filter({ visible: true }).last().click(),
  ]);
  const cuerpo = await resp.json();
  const id = cuerpo?.data?.[0]?.id;
  if (!id) throw new Error(`No se pudo crear el productor: ${JSON.stringify(cuerpo)}`);
  await page.waitForTimeout(2000);

  // La contraseña se fija por la interfaz de programación: no es lo que evalúa
  // ningún criterio, y el alta no ofrece otra forma de fijarla sin el correo
  await rest(page, 'user.update', { ID: id, PASSWORD: CLAVE_PRODUCTOR, ACTIVE: true });

  const registro: Productor = {
    usuario, id, nombre, apellido, correo, clave: CLAVE_PRODUCTOR, conSesion: false,
  };
  guardarCredencial(registro);
  return registro;
}

/**
 * Abre una página nueva con la sesión de un productor ya dado de alta.
 * Lanza si todavía no se pudo destrabar su inicio de sesión (`conSesion`).
 */
export async function entrarComoProductor(browser: Browser, p: Productor) {
  if (!p.conSesion || !p.storageState) {
    throw new Error(
      `El productor ${p.usuario} está dado de alta pero su inicio de sesión no quedó resuelto ` +
      '(Bitrix24 exige un código de verificación por correo en el primer ingreso).',
    );
  }
  const contexto = await browser.newContext({ storageState: p.storageState, viewport: { width: 1440, height: 900 } });
  const suya = await contexto.newPage();
  await suya.goto('https://b24-orshha.bitrix24.es/', { waitUntil: 'domcontentloaded' });
  await panelListo(suya, /./).catch(() => {});
  await suya.waitForTimeout(3000);
  return { contexto, pagina: suya };
}

/**
 * Motivo por el que los criterios que exigen la sesión de otro usuario quedan
 * sin verificar. Se comprobó, en este orden: la invitación por correo desde
 * «Empleados» falla con un error genérico; el alta sin invitación deja al
 * usuario creado pero sin cuenta de acceso (el ingreso es por Bitrix24.Net y
 * responde «Este usuario no existe»); y el registro por el enlace de
 * invitación, que sí crea la cuenta, rechaza las casillas de correo temporal
 * (mail.tm, Guerrilla Mail, tempmail.plus: «Utilice un correo electrónico
 * seguro» o «No se puede registrar al usuario») y con una dirección aceptada
 * envía un código de confirmación a esa dirección, que no tiene buzón al que
 * la prueba pueda acceder.
 */
export const MOTIVO_SIN_INGRESO_DEL_PRODUCTOR =
  'El productor queda dado de alta (A.3.1), pero no se pudo iniciar sesión con su cuenta: Bitrix24 exige ' +
  'verificar un correo real en el primer ingreso y rechaza las casillas de correo temporal (mail.tm, Guerrilla ' +
  'Mail y otras), y el código de confirmación de una dirección aceptada llegaría a un buzón al que la prueba ' +
  'no tiene acceso. Falta un buzón real o que un usuario haga ese primer ingreso una vez.';
