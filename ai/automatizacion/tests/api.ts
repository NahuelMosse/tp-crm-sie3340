import { APIRequestContext, request } from '@playwright/test';
import { ESPOCRM } from './sesion';

/**
 * Cliente de la interfaz de programación de EspoCRM.
 *
 * Sirve para dos cosas distintas, y conviene no confundirlas:
 *
 *   - **Preparar el escenario.** Cargar la cartera de referencia por acá es
 *     más rápido y más fiable que por pantalla. El veredicto nunca sale de
 *     esta vía: cuando el criterio pregunta si el usuario puede hacerlo desde
 *     el sistema, la respuesta se obtiene recorriendo la interfaz.
 *
 *   - **Evaluar el intercambio con otros sistemas** (A.10.4 y A.10.5), donde
 *     la interfaz de programación es justamente lo que se está midiendo.
 */

export const BASE = 'http://localhost:8705';

/** Por defecto, con el administrador; con otro usuario, ve solo lo que ese usuario ve. */
export async function apiEspo(usuario = ESPOCRM.usuario, clave = ESPOCRM.clave): Promise<APIRequestContext> {
  const credencial = Buffer.from(`${usuario}:${clave}`).toString('base64');
  return request.newContext({
    baseURL: `${BASE}/api/v1/`,
    extraHTTPHeaders: { 'Espo-Authorization': credencial, 'Content-Type': 'application/json' },
  });
}

/** Alta de un registro. Devuelve el identificador que asignó el sistema. */
export async function crear(api: APIRequestContext, entidad: string, datos: object): Promise<string> {
  const r = await api.post(entidad, { data: datos });
  if (!r.ok()) throw new Error(`POST ${entidad} devolvió ${r.status()}: ${await r.text()}`);
  return (await r.json()).id;
}

/** Listado de una entidad. */
export async function listar(
  api: APIRequestContext, entidad: string, parametros: Record<string, string | number> = {},
): Promise<{ total: number; list: any[] }> {
  const r = await api.get(entidad, { params: { maxSize: 20, ...parametros } });
  if (!r.ok()) throw new Error(`GET ${entidad} devolvió ${r.status()}: ${await r.text()}`);
  return r.json();
}

/** Cuántos registros hay de una entidad. */
export async function cuantos(api: APIRequestContext, entidad: string): Promise<number> {
  return (await listar(api, entidad, { maxSize: 1 })).total;
}

/** Definición de una entidad en el modelo: los campos y sus tipos. */
export async function campos(api: APIRequestContext, entidad: string): Promise<Record<string, any>> {
  const r = await api.get('Metadata');
  if (!r.ok()) throw new Error(`GET Metadata devolvió ${r.status()}`);
  return (await r.json()).entityDefs?.[entidad]?.fields ?? {};
}
