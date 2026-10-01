import { Page, Locator, APIRequestContext, request } from '@playwright/test';
import { listado, ficha, configuracion, modeloDe, pestana } from './navegar';

/**
 * Twenty, recorrido como lo recorre un usuario.
 *
 * La interfaz es una aplicación de una sola página: los registros se editan en
 * el lugar, celda por celda o campo por campo en la ficha, y buena parte de
 * los controles solo responden a un clic real del ratón —el clic sintético
 * sobre el elemento lo descarta como deshabilitado—. Los ayudantes de este
 * módulo mueven el ratón hasta el control y hacen clic ahí, como una persona.
 */

export const BASE = 'http://localhost:8704';

/** Clic con el ratón en el centro del elemento. */
export async function clicReal(page: Page, objetivo: Locator) {
  await objetivo.waitFor({ state: 'visible', timeout: 30_000 });
  await objetivo.scrollIntoViewIfNeeded().catch(() => {});
  const caja = await objetivo.boundingBox();
  if (!caja) throw new Error('El elemento no tiene lugar en la pantalla');
  // Se llega con el ratón, se apoya y se aprieta: varios controles se activan
  // al pasar por encima y descartan un clic que llega sin ese paso
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
}

/** El texto visible de la página, para comprobar lo que el usuario ve. */
export const textoDe = (page: Page) => page.locator('body').innerText();

/** Espera a que la aplicación termine de dibujar: sin esqueletos de carga. */
export async function esperarCarga(page: Page, ms = 2500) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

// ── Interfaz de programación ────────────────────────────────────────────────

/**
 * La interfaz de programación, con la sesión del usuario que entró por la
 * pantalla. Solo prepara escenarios y lee resultados: ningún veredicto sale de acá.
 */
export async function apiTwenty(page: Page): Promise<APIRequestContext> {
  // La aplicación se autentica con una cookie de sesión: se usa la del
  // navegador. Para escribir, el servidor exige que el pedido declare su
  // origen, como lo hace la propia aplicación
  const cookies = await page.context().cookies(BASE);
  const api = await request.newContext({
    baseURL: `${BASE}/rest/`,
    storageState: { cookies, origins: [] },
    extraHTTPHeaders: { Origin: BASE, 'Content-Type': 'application/json' },
  });
  const r = await api.get('metadata/objects', { params: { limit: 1 } });
  if (!r.ok()) throw new Error(`No hay una sesión válida de Twenty en el navegador (${r.status()})`);
  return api;
}

/** Los objetos del modelo, con sus campos. */
export async function objetos(api: APIRequestContext): Promise<any[]> {
  const r = await api.get('metadata/objects', { params: { limit: 200 } });
  if (!r.ok()) throw new Error(`metadata/objects devolvió ${r.status()}`);
  return (await r.json()).data;
}

export async function objeto(api: APIRequestContext, nombreSingular: string) {
  return (await objetos(api)).find(o => o.nameSingular === nombreSingular);
}

/** Registros de un objeto. */
export async function registros(api: APIRequestContext, plural: string, filtro?: string): Promise<any[]> {
  const r = await api.get(plural, { params: { limit: 200, ...(filtro ? { filter: filtro } : {}) } });
  if (!r.ok()) throw new Error(`GET ${plural} devolvió ${r.status()}: ${await r.text()}`);
  return (await r.json()).data[plural] ?? [];
}

export async function crearRegistro(api: APIRequestContext, plural: string, datos: object): Promise<any> {
  const r = await api.post(plural, { data: datos });
  if (!r.ok()) throw new Error(`POST ${plural} devolvió ${r.status()}: ${await r.text()}`);
  const cuerpo = await r.json();
  return Object.values(cuerpo.data)[0];
}

export async function borrarRegistro(api: APIRequestContext, plural: string, id: string) {
  // Primero a la papelera, después definitivo: si no, el registro sigue ocupando lugar
  await api.delete(`${plural}/${id}`);
  await api.delete(`${plural}/${id}`, { params: { soft_delete: 'false' } });
}

/** Da de baja un objeto propio y todo lo que contiene. */
export async function borrarObjeto(api: APIRequestContext, nombreSingular: string) {
  const o = await objeto(api, nombreSingular);
  if (!o) return false;
  await api.patch(`metadata/objects/${o.id}`, { data: { isActive: false } });
  const r = await api.delete(`metadata/objects/${o.id}`);
  if (!r.ok()) throw new Error(`No se pudo borrar el objeto ${nombreSingular}: ${r.status()}`);
  return true;
}

/** Quita un campo propio de una corrida anterior, para volver a crearlo por pantalla. */
export async function quitarCampo(api: APIRequestContext, singular: string, etiqueta: string) {
  const campo = (await objeto(api, singular))?.fields.find((c: any) => c.label === etiqueta);
  if (!campo) return;
  await api.patch(`metadata/fields/${campo.id}`, { data: { isActive: false } });
  const r = await api.delete(`metadata/fields/${campo.id}`);
  if (!r.ok()) throw new Error(`No se pudo quitar el campo ${etiqueta}: ${r.status()} ${await r.text()}`);
}

// ── Modelo de datos ─────────────────────────────────────────────────────────

/** Alta de un objeto propio desde Configuración › Modelo de datos. */
export async function nuevoObjeto(page: Page, singular: string, plural: string, descripcion: string) {
  await configuracion(page, /^Modelo de datos$|^Data model$/);
  await clicReal(page, page.getByRole('button', { name: /Añadir objeto|Add object/ }).first());
  await page.getByPlaceholder('Listado', { exact: true }).fill(singular);
  await page.getByPlaceholder('Listados', { exact: true }).fill(plural);
  await page.getByPlaceholder(/descripción/i).fill(descripcion);
  await clicReal(page, page.getByRole('button', { name: /^Guardar|^Save/ }).first());
  await page.waitForURL(u => !u.pathname.endsWith('/new'), { timeout: 30_000 });
  await esperarCarga(page);
}

/**
 * Alta de un campo desde la pantalla del objeto: se elige el tipo, se le pone
 * nombre y, si hace falta, se configura antes de guardar.
 */
export async function nuevoCampo(
  page: Page, plural: string, tipo: string, nombre: string,
  configurar?: (page: Page) => Promise<void>,
) {
  await modeloDe(page, plural);
  await clicReal(page, page.getByRole('button', { name: /Nuevo Campo|New Field/ }).first());
  await clicReal(page, page.getByText(tipo, { exact: true }).first());
  const nombreCampo = page.getByPlaceholder('Empleados');
  await nombreCampo.waitFor({ state: 'visible', timeout: 30_000 });
  await nombreCampo.fill(nombre);
  if (configurar) await configurar(page);
  await clicReal(page, page.getByRole('button', { name: /^Guardar|^Save/ }).first());
  await page.waitForURL(u => !u.pathname.includes('/new-field'), { timeout: 30_000 });
  await esperarCarga(page);
}

/** Las opciones de un campo de lista, en el orden en que se cargan. */
export const conOpciones = (opciones: string[]) => async (page: Page) => {
  const campos = page.locator('input:visible:not([type=file]):not([type=checkbox]):not([placeholder])');
  for (const [i, opcion] of opciones.entries()) {
    if (i > 0) await clicReal(page, page.getByRole('button', { name: /Agregar opción|Add option/ }));
    await campos.last().fill(opcion);
  }
};

/**
 * Un campo de importe con su moneda y sus decimales. El formato corto de
 * fábrica abrevia el importe y no deja elegir los decimales, que vienen en
 * cero: con cero, el editor descarta el separador decimal y guarda el importe
 * multiplicado, sin aviso.
 */
export const comoImporte = (busqueda: string, codigo: string, decimales: number) => async (page: Page) => {
  await clicReal(page, page.getByText(/^United States|^United/).first());
  await page.keyboard.type(busqueda, { delay: 60 });
  await clicReal(page, page.getByText(new RegExp(`\\(${codigo}\\)$`)).last());
  await clicReal(page, page.getByText(/^Short$|^Corto$/).first());
  await clicReal(page, page.getByText(/^Full$|^Completo$/).last());
  const fila = page.getByText(/Número de decimales|Number of decimals/).first()
    .locator('xpath=ancestor::div[.//button][1]');
  for (let i = 0; i < decimales; i++) await clicReal(page, fila.locator('button').last());
};

// ── Registros ───────────────────────────────────────────────────────────────

/** El valor de un campo en la ficha del registro. */
export const campoEnFicha = (page: Page, campo: string) =>
  page.locator(`[id^="fields-"][id$="-${campo}"]`).first();

/**
 * Dónde se hace clic para editar un campo de la ficha: sobre el valor que
 * muestra, no en el centro del renglón, que cae en un espacio vacío.
 */
export const valorEnFicha = (page: Page, campo: string) =>
  campoEnFicha(page, campo).locator('div:not(:has(div))').first();

/**
 * Abre la ficha de un registro. Si ya está abierta, se la vuelve a leer con el
 * botón de recargar del navegador; si no, se la busca por su nombre.
 */
export async function abrirFicha(page: Page, singular: string, id: string) {
  if (page.url().includes(`/object/${singular}/${id}`)) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="record-fields-widget"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(1500);
    return;
  }
  await ficha(page, singular, id);
}

/** Abre un listado desde el menú lateral. */
export const abrirListado = listado;
export { configuracion, pestana, modeloDe };

/** Elige una opción en un campo de lista de la ficha, buscándola por su texto. */
export async function elegirEnFicha(page: Page, campo: string, opcion: string) {
  await clicReal(page, valorEnFicha(page, campo));
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  await buscar.waitFor({ state: 'visible', timeout: 15_000 });
  await buscar.pressSequentially(opcion, { delay: 60 });
  await clicReal(page, page.getByText(opcion, { exact: true }).last());
  await page.waitForTimeout(1200);
}

/** Escribe en un campo de texto, número o importe de la ficha. */
export async function escribirEnFicha(page: Page, campo: string, texto: string) {
  await clicReal(page, valorEnFicha(page, campo));
  const entrada = page.locator('input:focus, textarea:focus').first();
  await entrada.waitFor({ state: 'visible', timeout: 15_000 });
  await entrada.press('Control+a');
  await entrada.pressSequentially(texto, { delay: 60 });
  await entrada.press('Enter');
  await page.waitForTimeout(1200);
}

/**
 * Carga una fecha en la ficha. El campo abre un calendario con la fecha
 * escrita arriba, en DD/MM/AAAA: se escribe ahí, como hace quien ya la sabe.
 */
export async function fechaEnFicha(page: Page, campo: string, ddmmaaaa: string) {
  await clicReal(page, valorEnFicha(page, campo));
  const arriba = page.locator('input:visible').filter({ hasNot: page.locator('[placeholder="Buscar"]') })
    .and(page.locator('input[type="text"], input:not([type])')).first();
  await clicReal(page, arriba);
  await arriba.press('Control+a');
  await arriba.pressSequentially(ddmmaaaa, { delay: 60 });
  await arriba.press('Enter');
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

/**
 * Carga una fecha con hora en la ficha. El campo abre un calendario con la
 * fecha y la hora escritas arriba, con la máscara de la configuración regional
 * del usuario: se lee cómo muestra el momento actual —día o mes primero, 24 o
 * 12 horas— y se escribe el nuevo con esa misma forma.
 */
export async function fechaHoraEnFicha(page: Page, campo: string, momento: Date) {
  await clicReal(page, valorEnFicha(page, campo));
  const arriba = page.locator('input:visible').first();
  await arriba.waitFor({ state: 'visible', timeout: 15_000 });
  const actual = await arriba.inputValue();
  const hoy = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  // Vacío, el campo propone el momento actual
  const diaPrimero = actual.startsWith(`${dos(hoy.getDate())}/${dos(hoy.getMonth() + 1)}/`);
  const doce = /AM|PM/i.test(actual);
  const [d, m, a] = [dos(momento.getDate()), dos(momento.getMonth() + 1), momento.getFullYear()];
  const h = momento.getHours();
  const hora = doce ? `${dos(h % 12 || 12)}:${dos(momento.getMinutes())} ${h < 12 ? 'AM' : 'PM'}` : `${dos(h)}:${dos(momento.getMinutes())}`;
  const texto = `${diaPrimero ? `${d}/${m}` : `${m}/${d}`}/${a} ${hora}`;
  await clicReal(page, arriba);
  await arriba.press('Control+a');
  await arriba.pressSequentially(texto, { delay: 60 });
  await arriba.press('Enter');
  await page.waitForTimeout(1500);
  if (await page.locator('input:visible').first().isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

/**
 * Carga un domicilio en la ficha: el campo abre un formulario con dirección,
 * ciudad, provincia, código postal y país, que se recorre con el tabulador.
 */
export async function domicilioEnFicha(page: Page, campo: string, d: { calle: string; ciudad: string; provincia: string; cp: string }) {
  await clicReal(page, valorEnFicha(page, campo));
  const primera = page.locator('input:focus').first();
  await primera.waitFor({ state: 'visible', timeout: 15_000 });
  await primera.pressSequentially(d.calle, { delay: 50 });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.type(d.ciudad, { delay: 50 });
  await page.keyboard.press('Tab');
  await page.keyboard.type(d.provincia, { delay: 50 });
  await page.keyboard.press('Tab');
  await page.keyboard.type(d.cp, { delay: 50 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
}

/**
 * Espera a que el campo de la fila nueva tenga el cursor: la fila aparece antes
 * que su campo, y lo que se tipea en ese momento se pierde.
 */
async function campoConCursor(page: Page) {
  await page.locator('input:focus, textarea:focus, [contenteditable="true"]:focus').first()
    .waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(400);
}

/** Alta de una persona desde el listado: nombre y apellido van en la misma fila. */
export async function nuevaPersona(page: Page, nombre: string, apellido: string): Promise<string> {
  await listado(page, 'people');
  const antes = new Set(await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id'))));
  await clicReal(page, page.locator('div:text-is("New Person") >> visible=true')
    .or(page.locator('div:text-is("Nueva Persona") >> visible=true')).first());
  await campoConCursor(page);
  // Lo que se tipea mientras la fila termina de armarse se pierde: se comprueba y, si falta, se vuelve a escribir
  const escrito = () => page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.value ?? '');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.type(nombre, { delay: 60 });
    if ((await escrito()) === nombre) break;
    await page.waitForTimeout(800);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
  }
  await page.keyboard.press('Tab');
  await page.keyboard.type(apellido, { delay: 60 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const despues = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const nuevo = despues.find(id => id && !antes.has(id));
  if (!nuevo) throw new Error(`No apareció la fila de ${nombre} ${apellido}`);
  return nuevo;
}

/**
 * Entra con otra cuenta en la misma ventana, para ver lo que ve ese usuario.
 * Se borra la sesión del navegador y se ingresa desde la pantalla de bienvenida.
 */
export async function entrarComo(page: Page, correo: string, clave: string) {
  const email = page.getByRole('textbox', { name: /^Email$|^Correo/i }).or(page.locator('input[type="email"]')).first();
  // La aplicación rearma la sesión desde lo que guardó en el navegador: se borra todo y, si igual
  // vuelve a entrar con la cuenta anterior, se repite
  for (let intento = 0; ; intento++) {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }).catch(() => {});
    await page.context().clearCookies();
    await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
    if (await email.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true, () => false)) break;
    if (intento === 2) throw new Error('No apareció la pantalla de ingreso para cambiar de usuario');
  }
  await email.pressSequentially(correo, { delay: 40 });
  await page.keyboard.press('Enter');
  const pass = page.locator('input[type="password"]').first();
  await pass.waitFor({ state: 'visible', timeout: 30_000 });
  await pass.pressSequentially(clave, { delay: 40 });
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/objects\//, { timeout: 60_000 });
  await esperarCarga(page, 4000);
}

/** Marca en el listado las filas de esos registros. */
export async function marcarFilas(page: Page, ids: string[]) {
  for (const id of ids) {
    await clicReal(page, page.locator(`[data-selectable-id="${id}"]`).getByRole('checkbox').first());
    await page.waitForTimeout(400);
  }
}

/**
 * Cambio masivo sobre lo marcado: el botón de actualizar abre un panel con los
 * campos; se elige el valor en el desplegable del campo y se confirma.
 */
export async function actualizarMarcadas(page: Page, abrirCampo: RegExp, opcion: string) {
  await clicReal(page, page.getByRole('button', { name: /^Update|^Actualizar/ }).first());
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(abrirCampo).filter({ visible: true }).last());
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  if (await buscar.isVisible().catch(() => false)) await buscar.pressSequentially(opcion.split(' ')[0], { delay: 60 });
  await clicReal(page, page.getByText(opcion, { exact: true }).filter({ visible: true }).last());
  await clicReal(page, page.getByRole('button', { name: /^Aplicar|^Apply/ }).last());
  const confirmar = page.getByText(/Esto modificará|This will update/).first()
    .locator('xpath=ancestor::div[.//*[normalize-space(text())="Actualizar registros" or normalize-space(text())="Update records"]][1]')
    .getByText(/^Actualizar registros$|^Update records$/).last();
  await confirmar.waitFor({ state: 'visible', timeout: 15_000 });
  await clicReal(page, confirmar);
  await page.waitForTimeout(5000);
}

/**
 * Quita de Configuración › Cuentas una casilla conectada de una corrida
 * anterior, desde su menú. Las casillas no se exponen por la interfaz de
 * programación.
 */
export async function quitarCasilla(page: Page, correo: string) {
  await configuracion(page, /^Cuentas$|^Accounts$/);
  await esperarCarga(page, 2000);
  for (let intento = 0; intento < 4 && await page.getByText(correo, { exact: true }).first().isVisible().catch(() => false); intento++) {
    const fila = page.getByText(correo, { exact: true }).first().locator('xpath=ancestor::*[.//button][1]');
    await clicReal(page, fila.locator('button').last());
    await clicReal(page, page.getByText(/^Eliminar cuenta$|^Remove account$/).filter({ visible: true }).last());
    // El sistema avisa que se borran los correos y eventos de la cuenta, y pide confirmar
    const confirmar = page.getByText(/Eliminación de datos|Data deletion/).first()
      .locator('xpath=ancestor::div[.//*[normalize-space(text())="Eliminar cuenta" or normalize-space(text())="Remove account"]][1]')
      .getByText(/^Eliminar cuenta$|^Remove account$/).last();
    if (await confirmar.waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false)) await clicReal(page, confirmar);
    await page.waitForTimeout(4000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await esperarCarga(page, 5000);
  }
}

/**
 * Conecta una casilla por IMAP y SMTP desde Configuración › Cuentas, como lo
 * hace el usuario: nombre, dirección, servidores, puertos y seguridad. Con el
 * servidor de prueba no hay cifrado.
 */
export async function conectarCasilla(page: Page, c: { nombre: string; correo: string; servidor: string; imap: number; smtp: number }) {
  // Configuración › Cuentas › nueva cuenta › por IMAP y SMTP
  await configuracion(page, /^Cuentas$|^Accounts$/);
  await esperarCarga(page, 2500);
  // Sin cuentas conectadas, la pantalla ofrece la conexión por IMAP directamente;
  // con alguna, primero hay que pedir una cuenta nueva
  const imap = page.getByText(/IMAP/).filter({ visible: true }).first();
  if (!(await imap.isVisible().catch(() => false))) {
    await clicReal(page, page.getByRole('button', { name: /Agregar cuenta|Add account|Nueva cuenta|New account/ }).first()
      .or(page.getByText(/^Agregar cuenta$|^Add account$|^Nueva cuenta$|^New account$/).filter({ visible: true }).first()).first());
    await esperarCarga(page, 2500);
  }
  await clicReal(page, imap);
  await page.waitForURL(/new-imap-smtp-caldav-connection/, { timeout: 30_000 });
  await esperarCarga(page, 3000);
  const campo = (ejemplo: string, n = 0) => page.getByPlaceholder(ejemplo, { exact: true }).nth(n);
  // Los puertos traen un valor de fábrica: se selecciona todo antes de escribir
  const escribir = async (l: Locator, v: string) => {
    await clicReal(page, l);
    await l.press('Control+a');
    await l.pressSequentially(v, { delay: 25 });
  };
  await escribir(campo('John Doe'), c.nombre);
  await escribir(campo('john.doe@example.com'), c.correo);
  await escribir(campo('imap.example.com'), c.servidor);
  await escribir(campo('john.doe', 0), c.correo);
  await escribir(page.locator('input[type=password]').nth(0), 'x');
  await escribir(page.locator('input[type=number]').nth(0), String(c.imap));
  await escribir(campo('smtp.example.com'), c.servidor);
  await escribir(campo('john.doe', 1), c.correo);
  await escribir(page.locator('input[type=password]').nth(1), 'x');
  await escribir(page.locator('input[type=number]').nth(1), String(c.smtp));
  for (let k = 0; k < 2; k++) {
    const seguridad = page.getByText(/^SSL\/TLS$|^STARTTLS$/).filter({ visible: true }).first();
    if (!(await seguridad.isVisible().catch(() => false))) break;
    await clicReal(page, seguridad);
    await clicReal(page, page.getByRole('listbox').last().getByText('None', { exact: true }));
  }
  await clicReal(page, page.getByRole('button', { name: /^Guardar|^Save/ }).first());
  // Guardar prueba la conexión y lleva a la configuración de la sincronización
  await page.waitForURL(/\/settings\/accounts\/configuration\//, { timeout: 90_000 });
  await esperarCarga(page, 4000);
  await completarCasilla(page);
}

/**
 * Termina la configuración de la sincronización: el cuerpo de los correos
 * visible para el equipo —de fábrica solo se comparten participantes y hora—
 * y «Agregar cuenta», que es lo que pone a sincronizar la casilla.
 */
export async function completarCasilla(page: Page) {
  const visibilidad = page.getByText(/^Visibilidad$|^Visibility$/).first();
  if (await visibilidad.isVisible().catch(() => false)) {
    const todo = visibilidad.locator('xpath=following::*[normalize-space(text())="Todo" or normalize-space(text())="Everything"][1]');
    await clicReal(page, todo);
    await page.waitForTimeout(1500);
  }
  for (let paso = 0; paso < 3 && page.url().includes('/configuration/'); paso++) {
    await clicReal(page, page.getByRole('button', { name: /Agregar cuenta|Add account|Continuar|Continue|Finalizar|Finish/ })
      .filter({ visible: true }).first());
    await page.waitForTimeout(4000);
  }
}

/** Abre el menú de comandos del listado, donde están importar y exportar. */
export async function menuDelListado(page: Page, plural: string) {
  await listado(page, plural);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await page.waitForTimeout(1200);
}

/**
 * El asistente de importación: se sube el archivo, se indica a qué campo va
 * cada columna —en el orden del archivo; un campo compuesto, como el nombre o
 * el domicilio, abre sus partes— y se confirma. Devuelve cuántas columnas no
 * reconoció solo y lo que mostró antes de confirmar.
 */
export async function importar(
  page: Page, plural: string, etiquetaPlural: string, archivo: string,
  columnas: [campo: string, parte?: string][],
): Promise<{ sinReconocer: number; validacion: string; conErrores: boolean }> {
  await menuDelListado(page, plural);
  await clicReal(page, page.getByText(`Import ${etiquetaPlural}`, { exact: true }).last());
  // El archivo se elige con el botón del asistente, en la ventana de archivos del sistema
  const [elector] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 30_000 }),
    clicReal(page, page.getByText(/^Seleccionar archivo$|^Select file$/).filter({ visible: true }).last()),
  ]);
  await elector.setFiles(archivo);
  const dialogo = page.getByRole('dialog').last();
  const sinAsignar = dialogo.getByText(/^Seleccionar columna|^Select column/);
  await dialogo.getByText(/^Campos de Twenty$|^Twenty fields$/).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);
  const sinReconocer = await sinAsignar.count();

  // Las columnas se asignan de arriba hacia abajo: la primera sin asignar es la que sigue
  for (const [campo, parte] of columnas) {
    await clicReal(page, sinAsignar.first());
    await page.waitForTimeout(900);
    await page.keyboard.type(campo, { delay: 60 });
    await page.waitForTimeout(800);
    await clicReal(page, page.getByText(campo, { exact: true }).last());
    if (parte) await clicReal(page, page.getByText(parte, { exact: true }).last());
    await page.waitForTimeout(800);
  }
  await clicReal(page, dialogo.getByText(/^Siguiente paso$|^Next step$/).first());
  await page.waitForTimeout(3000);
  const validacion = await dialogo.innerText();
  await clicReal(page, dialogo.getByText(/^Confirmar$|^Confirm$/).last());
  // Con filas marcadas con errores, el asistente avisa que las va a descartar y pide enviar igual
  const aviso = page.getByText(/^Finalizar flujo con errores$|^Finish flow with errors$/).first();
  const conErrores = await aviso.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false);
  if (conErrores) await clicReal(page, page.getByText(/^Enviar$|^Submit$/).filter({ visible: true }).last());
  await dialogo.waitFor({ state: 'hidden', timeout: 90_000 }).catch(() => {});
  await page.waitForTimeout(3000);
  return { sinReconocer, validacion, conErrores };
}

/** Exporta la vista del listado y devuelve el archivo descargado. */
export async function exportar(page: Page, plural: string, destino: string): Promise<string> {
  await menuDelListado(page, plural);
  const [descarga] = await Promise.all([
    page.waitForEvent('download', { timeout: 90_000 }),
    clicReal(page, page.getByText(/^Export View$|^Exportar vista$/).last()),
  ]);
  await descarga.saveAs(destino);
  return destino;
}

/** La búsqueda general, desde la lupa del menú: devuelve lo que muestra. */
export async function buscarEnTodo(page: Page, texto: string): Promise<string> {
  await clicReal(page, page.getByRole('button', { name: /^Search$|^Buscar$/ }).first());
  await page.waitForTimeout(1000);
  await page.keyboard.type(texto, { delay: 70 });
  await page.waitForTimeout(3500);
  return textoDe(page);
}

/**
 * Alta de un registro desde el listado: el botón agrega una fila con el
 * nombre en edición. Devuelve el identificador que le asignó el sistema.
 */
export async function nuevoRegistro(page: Page, plural: string, etiquetaSingular: string, nombre: string): Promise<string> {
  await listado(page, plural);
  const antes = new Set(await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id'))));
  await clicReal(page, page.locator(`div:text-is("New ${etiquetaSingular}") >> visible=true`)
    .or(page.locator(`div:text-is("Nuevo ${etiquetaSingular}") >> visible=true`)).first());
  await campoConCursor(page);
  await page.keyboard.type(nombre, { delay: 60 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const despues = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const nuevo = despues.find(id => id && !antes.has(id));
  if (!nuevo) throw new Error(`No apareció la fila nueva de ${nombre}`);
  return nuevo;
}
