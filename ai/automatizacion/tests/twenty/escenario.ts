import { Page, APIRequestContext, Browser } from '@playwright/test';
import { ASEGURADOS } from '../datos';
import { apiTwenty, objeto, registros, crearRegistro, borrarRegistro, clicReal, BASE } from './ui';
import { configuracion, pestana } from './navegar';

/**
 * El escenario de Twenty: la cartera de referencia y quien la trabaja.
 *
 * Como en EspoCRM, se monta por la interfaz de programación y **no decide
 * ningún veredicto**. Lo que un criterio evalúa se hace por pantalla, en su test.
 */

/** El productor: un segundo usuario del espacio de trabajo, que entra por la invitación. */
export const PRODUCTOR = { email: 'pgomez@aseguradora.test', clave: 'Productor1234!', nombre: 'Pablo', apellido: 'Gómez' };

export const RAMOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];
export const ESTADOS = ['Al día', 'Vencida', 'En gestión', 'Cancelada'];

/** Usuarios del espacio de trabajo, por correo. */
export async function miembros(api: APIRequestContext): Promise<any[]> {
  return registros(api, 'workspaceMembers');
}

/** Deja al productor como miembro del espacio de trabajo. */
export const alistarProductor = (page: Page, navegador: Browser) => alistarMiembro(page, navegador, PRODUCTOR);

/**
 * Deja a una persona como miembro del espacio de trabajo. Si todavía no está,
 * se registra con el enlace de invitación, en un navegador aparte, como lo
 * haría ella.
 */
export async function alistarMiembro(
  page: Page, navegador: Browser, persona: { email: string; clave: string; nombre: string; apellido: string },
): Promise<string> {
  const api = await apiTwenty(page);
  const ya = (await miembros(api)).find(m => m.userEmail === persona.email);
  if (ya) return ya.id;

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await configuracion(page, /^Miembros$|^Members$/);
  await pestana(page, /^Invitar$|^Invite$/);
  await clicReal(page, page.getByText(/^Copiar enlace$|^Copy link$/).first());
  const enlace = await page.evaluate(() => navigator.clipboard.readText());

  const contexto = await navegador.newContext({ locale: 'es-AR', viewport: { width: 1440, height: 900 } });
  const otra = await contexto.newPage();
  try {
    await otra.goto(enlace, { waitUntil: 'domcontentloaded' });
    await otra.waitForTimeout(5000);
    await otra.getByRole('textbox').first().pressSequentially(persona.email, { delay: 30 });
    await otra.keyboard.press('Enter');
    await otra.waitForTimeout(4000);
    await otra.locator('input[type=password]').first().pressSequentially(persona.clave, { delay: 40 });
    await otra.keyboard.press('Enter');
    await otra.waitForURL(/create\/profile|objects/, { timeout: 60_000 });
    if (otra.url().includes('create/profile')) {
      const campos = otra.locator('input:visible');
      await campos.nth(0).pressSequentially(persona.nombre);
      await campos.nth(1).pressSequentially(persona.apellido);
      await clicReal(otra, otra.getByText(/^Continuar$|^Continue$/).first());
      await otra.waitForURL(/objects/, { timeout: 60_000 });
    }
  } finally {
    await contexto.close();
  }
  const nuevo = (await miembros(api)).find(m => m.userEmail === persona.email);
  if (!nuevo) throw new Error(`${persona.nombre} ${persona.apellido} no quedó como miembro del espacio de trabajo`);
  return nuevo.id;
}

/** Un campo de relación de muchos a uno, si todavía no existe. */
export async function relacion(
  api: APIRequestContext, desde: string, nombre: string, etiqueta: string,
  hacia: string, etiquetaInversa: string,
) {
  const origen = await objeto(api, desde);
  if (origen.fields.some((c: any) => c.name === nombre)) return;
  const destino = await objeto(api, hacia);
  const r = await api.post('metadata/fields', { data: {
    type: 'RELATION', objectMetadataId: origen.id, name: nombre, label: etiqueta, icon: 'IconLink',
    relationCreationPayload: { type: 'MANY_TO_ONE', targetObjectMetadataId: destino.id, targetFieldLabel: etiquetaInversa, targetFieldIcon: 'IconListNumbers' },
  } });
  if (!r.ok()) throw new Error(`No se pudo crear la relación ${etiqueta}: ${r.status()} ${await r.text()}`);
}

/** Un campo común, si todavía no existe. */
async function campo(api: APIRequestContext, singular: string, datos: { name: string; label: string; type: string; [k: string]: any }) {
  const o = await objeto(api, singular);
  if (o.fields.some((c: any) => c.name === datos.name)) return;
  const r = await api.post('metadata/fields', { data: { objectMetadataId: o.id, icon: 'IconTag', ...datos } });
  if (!r.ok()) throw new Error(`No se pudo crear el campo ${datos.label}: ${r.status()} ${await r.text()}`);
}

const opciones = (etiquetas: string[]) => etiquetas.map((label, position) => ({
  label, position, color: ['green', 'turquoise', 'sky', 'blue', 'purple', 'pink'][position % 6],
  value: label.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\W+/g, '_'),
}));

/**
 * Los campos de la póliza que los criterios de A.1 crean por pantalla. Si un
 * test posterior corre solo, los encuentra igual.
 */
export async function alistarCamposPoliza(api: APIRequestContext) {
  await campo(api, 'poliza', { name: 'ramo', label: 'Ramo', type: 'SELECT', options: opciones(RAMOS) });
  await campo(api, 'poliza', { name: 'estadoDePago', label: 'Estado de pago', type: 'SELECT', options: opciones(ESTADOS) });
  await campo(api, 'poliza', { name: 'prima', label: 'Prima', type: 'CURRENCY', defaultValue: { amountMicros: null, currencyCode: "'ARS'" } });
  await campo(api, 'poliza', { name: 'vigenciaDesde', label: 'Vigencia desde', type: 'DATE' });
  await campo(api, 'poliza', { name: 'vigenciaHasta', label: 'Vigencia hasta', type: 'DATE' });
  await relacion(api, 'poliza', 'titular', 'Titular', 'person', 'Pólizas');
  await relacion(api, 'poliza', 'productor', 'Productor', 'workspaceMember', 'Pólizas');
}

export interface Escenario {
  api: APIRequestContext;
  asegurados: string[];
  productor: string;
  administrador: string;
  polizas: any[];
}

const enDias = (n: number) => new Date(Date.now() + n * 86_400_000).toLocaleDateString('sv-SE');

/**
 * La cartera de referencia: los asegurados como personas y veinticuatro
 * pólizas repartidas entre ramos, estados, vencimientos y los dos usuarios.
 * Idempotente: reemplaza la cartera de una corrida anterior.
 */
export async function cargarCartera(page: Page, navegador: Browser): Promise<Escenario> {
  const productor = await alistarProductor(page, navegador);
  const api = await apiTwenty(page);
  await alistarCamposPoliza(api);
  const administrador = (await miembros(api)).find(m => m.userEmail !== PRODUCTOR.email)!.id;

  const personas = await registros(api, 'people');
  const asegurados: string[] = [];
  for (const a of ASEGURADOS) {
    const ya = personas.find(p => p.emails?.primaryEmail === a.emailAddress);
    asegurados.push(ya?.id ?? (await crearRegistro(api, 'people', {
      name: { firstName: a.firstName, lastName: a.lastName },
      emails: { primaryEmail: a.emailAddress },
      phones: { primaryPhoneNumber: a.phoneNumber.replace(/^\+54\s*/, ''), primaryPhoneCountryCode: 'AR', primaryPhoneCallingCode: '+54' },
    })).id);
  }

  for (const p of (await registros(api, 'polizas')).filter(p => /^POL-CART-/.test(p.name))) {
    await borrarRegistro(api, 'polizas', p.id);
  }
  const campos = (await objeto(api, 'poliza')).fields;
  const valor = (nombre: string, etiqueta: string) =>
    campos.find((c: any) => c.name === nombre).options.find((o: any) => o.label === etiqueta).value;
  const vencimientos = [-20, 5, 12, 25, 40, 75, 120, 200, 260, 300, 340, 18];
  const polizas = [];
  for (let i = 0; i < 24; i++) {
    polizas.push(await crearRegistro(api, 'polizas', {
      name: `POL-CART-${String(i + 1).padStart(2, '0')}`,
      ramo: valor('ramo', RAMOS[i % 4]),
      estadoDePago: valor('estadoDePago', ESTADOS[Math.floor(i / 4) % 4]),
      prima: { amountMicros: (30_000 + 1_500 * i) * 1_000_000, currencyCode: 'ARS' },
      vigenciaDesde: enDias(vencimientos[i % 12] - 365),
      vigenciaHasta: enDias(vencimientos[i % 12]),
      titularId: asegurados[i % asegurados.length],
      productorId: i % 3 === 0 || i % 4 === 0 ? productor : administrador,
    }));
  }
  return { api, asegurados, productor, administrador, polizas };
}

export const ESTADOS_RECLAMO = ['Nuevo', 'En curso', 'Resuelto', 'Cerrado'];

/**
 * El reclamo: Twenty no trae un objeto de casos o reclamos, así que se define
 * como objeto propio —la evaluación de A.5 lo declara como configuración—.
 */
export async function alistarReclamo(api: APIRequestContext) {
  if (!(await objeto(api, 'reclamo'))) {
    const r = await api.post('metadata/objects', { data: {
      nameSingular: 'reclamo', namePlural: 'reclamos', labelSingular: 'Reclamo', labelPlural: 'Reclamos',
      description: 'Reclamo o siniestro presentado por un asegurado', icon: 'IconAlertTriangle',
    } });
    if (!r.ok()) throw new Error(`No se pudo crear el objeto Reclamo: ${r.status()} ${await r.text()}`);
  }
  await campo(api, 'reclamo', { name: 'estado', label: 'Estado', type: 'SELECT', options: opciones(ESTADOS_RECLAMO) });
  await campo(api, 'reclamo', { name: 'plazoDeResolucion', label: 'Plazo de resolución', type: 'DATE' });
  await relacion(api, 'reclamo', 'asegurado', 'Asegurado', 'person', 'Reclamos');
  await relacion(api, 'reclamo', 'responsable', 'Responsable', 'workspaceMember', 'Reclamos asignados');
}

/** Dos reclamos abiertos: uno que alcanza su plazo mañana y otro que tiene tres semanas. */
export async function reclamosConPlazo(e: Escenario) {
  await alistarReclamo(e.api);
  for (const r of (await registros(e.api, 'reclamos')).filter(r => /^RCL-PLAZO-/.test(r.name))) {
    await borrarRegistro(e.api, 'reclamos', r.id);
  }
  const campos = (await objeto(e.api, 'reclamo')).fields;
  const nuevo = campos.find((c: any) => c.name === 'estado').options.find((o: any) => o.label === 'Nuevo').value;
  const pronto = await crearRegistro(e.api, 'reclamos', {
    name: 'RCL-PLAZO-MANANA', estado: nuevo, plazoDeResolucion: enDias(1), aseguradoId: e.asegurados[0], responsableId: e.productor,
  });
  const tarde = await crearRegistro(e.api, 'reclamos', {
    name: 'RCL-PLAZO-TRES-SEMANAS', estado: nuevo, plazoDeResolucion: enDias(21), aseguradoId: e.asegurados[1], responsableId: e.productor,
  });
  return { pronto, tarde };
}

/** Un campo de texto en un objeto, si todavía no existe. */
export async function campoDeTexto(api: APIRequestContext, singular: string, nombre: string, etiqueta: string) {
  await campo(api, singular, { name: nombre, label: etiqueta, type: 'TEXT' });
}
