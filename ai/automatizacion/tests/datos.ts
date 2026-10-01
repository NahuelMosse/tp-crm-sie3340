import { APIRequestContext } from '@playwright/test';
import { apiEspo, crear, cuantos, listar } from './api';

/**
 * La cartera de referencia.
 *
 * Varios criterios necesitan una cartera cargada para poder ejercitarse:
 * filtrar por productor, segmentar, buscar con volumen. Cargarla por pantalla
 * llevaría horas y no mide nada —el alta por pantalla se evalúa en su propio
 * criterio—, así que se carga por la interfaz de programación.
 *
 * **Esto no decide ningún veredicto.** Solo monta el escenario. Lo que se
 * puntúa se ejercita recorriendo el sistema, en el test del criterio.
 */

/** Los nombres llevan tilde y eñe a propósito: la acentuación se evalúa al importar y exportar. */
export const ASEGURADOS = [
  { lastName: 'Gutiérrez', firstName: 'María Belén', emailAddress: 'mbgutierrez@ejemplo.test', phoneNumber: '+54 11 4555-1001' },
  { lastName: 'Peña',      firstName: 'Joaquín',    emailAddress: 'jpena@ejemplo.test',        phoneNumber: '+54 11 4555-1002' },
  { lastName: 'Ibáñez',    firstName: 'Sofía',      emailAddress: 'sibanez@ejemplo.test',      phoneNumber: '+54 11 4555-1003' },
  { lastName: 'Domínguez', firstName: 'Ramiro',     emailAddress: 'rdominguez@ejemplo.test',   phoneNumber: '+54 11 4555-1004' },
  { lastName: 'Ñandú',     firstName: 'Lucía',      emailAddress: 'lnandu@ejemplo.test',       phoneNumber: '+54 11 4555-1005' },
  { lastName: 'Sarmiento', firstName: 'Verónica',   emailAddress: 'vsarmiento@ejemplo.test',   phoneNumber: '+54 11 4555-1006' },
];

/** El productor con cartera asignada, para los criterios de restricción y de agenda. */
export const PRODUCTOR = {
  userName: 'pgomez',
  firstName: 'Pablo',
  lastName: 'Gómez',
  emailAddress: 'pgomez@ejemplo.test',
  password: 'Productor1234!',
  type: 'regular',
};

/**
 * Borra las pólizas que dejaron corridas anteriores de los criterios.
 *
 * Los criterios cargan pólizas por pantalla, porque el alta es parte de lo que
 * se evalúa. Sin esta limpieza cada corrida duplicaría la cartera, y la
 * segunda ya no mediría lo mismo que la primera.
 */
export async function limpiarPolizasDePrueba(api: APIRequestContext) {
  const { list } = await listar(api, 'CPoliza', { maxSize: 200 });
  const dePrueba = list.filter((p: any) => /^POL-(RAMO|PRIMA|VENCE)-/.test(p.name));
  for (const p of dePrueba) {
    const r = await api.delete(`CPoliza/${p.id}`);
    if (!r.ok()) throw new Error(`No se pudo borrar la póliza ${p.name}: ${r.status()}`);
  }
  return dePrueba.length;
}

/**
 * El rol del productor: ve y edita lo suyo, y lee lo que es de todos.
 *
 * En EspoCRM un usuario común sin rol no accede a nada, así que el escenario
 * lo necesita para poder ingresar como productor. Definir la restricción es lo
 * que evalúa A.9.1, y ese criterio declara el trabajo de configurarla.
 */
const PROPIO = { create: 'yes', read: 'own', edit: 'own', delete: 'no', stream: 'own' };
const DE_TODOS = { create: 'no', read: 'all', edit: 'no', delete: 'no', stream: 'all' };
export const ROL_PRODUCTOR = {
  name: 'Productor',
  data: {
    Contact: PROPIO, Account: PROPIO, Lead: PROPIO, Opportunity: PROPIO, CPoliza: PROPIO,
    Case: PROPIO, Task: PROPIO, Call: PROPIO, Meeting: PROPIO, Email: PROPIO,
    KnowledgeBaseArticle: DE_TODOS, Calendar: true, Activities: true,
  },
  fieldData: {},
  assignmentPermission: 'no',
  userPermission: 'no',
};

/** Deja el rol creado y asignado al productor. Idempotente. */
export async function rolProductor(api: APIRequestContext, productorId: string): Promise<string> {
  const { list } = await listar(api, 'Role', { maxSize: 50 });
  let id = list.find((r: any) => r.name === ROL_PRODUCTOR.name)?.id;
  if (id) {
    const r = await api.put(`Role/${id}`, { data: ROL_PRODUCTOR });
    if (!r.ok()) throw new Error(`No se pudo actualizar el rol: ${r.status()} ${await r.text()}`);
  } else {
    id = await crear(api, 'Role', ROL_PRODUCTOR);
  }
  const r = await api.put(`User/${productorId}`, { data: { rolesIds: [id] } });
  if (!r.ok()) throw new Error(`No se pudo asignar el rol al productor: ${r.status()}`);
  return id!;
}

export interface Escenario {
  api: APIRequestContext;
  asegurados: string[];
  productor: string;
}

/** Deja la cartera de referencia cargada. Idempotente: no duplica lo que ya está. */
export async function cargarCartera(): Promise<Escenario> {
  const api = await apiEspo();

  const existentes = await listar(api, 'Contact', { maxSize: 200 });
  const porCorreo = new Map<string, string>(
    existentes.list.map((c: any) => [c.emailAddress, c.id]));

  const asegurados: string[] = [];
  for (const a of ASEGURADOS) {
    asegurados.push(porCorreo.get(a.emailAddress) ?? await crear(api, 'Contact', a));
  }

  const usuarios = await listar(api, 'User', { maxSize: 200 });
  const yaEsta = usuarios.list.find((u: any) => u.userName === PRODUCTOR.userName);
  const productor = yaEsta?.id ?? await crear(api, 'User', PRODUCTOR);

  const borradas = await limpiarPolizasDePrueba(api);
  console.log(`  escenario: ${asegurados.length} asegurados · productor ${PRODUCTOR.userName} · ` +
              `${await cuantos(api, 'CPoliza')} pólizas en la cartera (${borradas} de corridas previas borradas)`);
  return { api, asegurados, productor };
}
