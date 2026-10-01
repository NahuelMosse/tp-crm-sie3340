import { APIRequestContext } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { apiEspo, crear, listar } from './api';
import { rolProductor } from './datos';

/**
 * La prueba de aprendizaje sin capacitación previa (A.11.5).
 *
 * Tres agentes independientes, que no conocen la plataforma, reciben la
 * consigna de `aprendizaje/consigna.md` y operan el sistema mirando la pantalla,
 * cada uno con su propio usuario de productor. Al terminar dejan su informe en
 * `aprendizaje/<plataforma>-p<n>.json`.
 *
 * Lo que el agente dice haber hecho no decide nada: este módulo comprueba sobre
 * los datos guardados si cada tarea quedó completa. El agente solo aporta lo
 * que no se puede leer de los datos: si abandonó y qué dijo que le faltó.
 */

export const CARPETA = 'aprendizaje';

/** Los tres productores que hacen la prueba, cada uno con los datos de su asegurado. */
export const PERSONAS = [
  { n: 1, userName: 'arios',   firstName: 'Andrea', lastName: 'Ríos',   asegurado: 'Lucía Fernández', documento: '30.123.451', correo: 'lucia.fernandez@example.com', poliza: 'POL-APR-1', prima: 45000 },
  { n: 2, userName: 'bsalas',  firstName: 'Bruno',  lastName: 'Salas',  asegurado: 'Martín Acosta',   documento: '30.123.452', correo: 'martin.acosta@example.com',   poliza: 'POL-APR-2', prima: 52000 },
  { n: 3, userName: 'ctoledo', firstName: 'Camila', lastName: 'Toledo', asegurado: 'Carla Benítez',   documento: '30.123.453', correo: 'carla.benitez@example.com',   poliza: 'POL-APR-3', prima: 38000 },
];
export type Persona = typeof PERSONAS[number];
export const CLAVE = 'Aprendiz1234!';

/** El correo con que cada productor entra al portal de Bitrix24, que exige uno real (alias de una misma casilla). */
export const correoBitrix = (p: Persona) => `nahuelgamail+${p.userName}@gmail.com`;

/**
 * La cartera propia de cada productor: ocho pólizas, tres de ellas vencen en
 * los próximos 30 días y una ya venció. Las fechas quedan lejos de los bordes
 * para que la respuesta correcta no dependa de cómo se cuenta el día de hoy.
 */
const VENCIMIENTOS = [-10, 5, 14, 27, 45, 90, 180, 340];
const TIPOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];

/** Fecha local en formato ISO, desplazada una cantidad de días. */
export const enDias = (dias: number, desde = new Date()) => {
  const d = new Date(desde);
  d.setDate(d.getDate() + dias);
  return d.toLocaleDateString('sv-SE');
};

/** Filtro de igualdad para la interfaz de programación. */
const donde = (atributo: string, valor: string) => ({
  'where[0][type]': 'equals', 'where[0][attribute]': atributo, 'where[0][value]': valor, maxSize: 200,
});

/**
 * Deja listos los tres productores: usuario con el rol de productor, su
 * cartera cargada y sin rastros de una corrida anterior. Solo monta el
 * escenario; no decide ningún veredicto.
 */
export async function prepararAprendices() {
  const api = await apiEspo();
  const usuarios = (await listar(api, 'User', { maxSize: 200 })).list;

  for (const p of PERSONAS) {
    const id = usuarios.find((u: any) => u.userName === p.userName)?.id ?? await crear(api, 'User', {
      userName: p.userName, firstName: p.firstName, lastName: p.lastName, password: CLAVE, type: 'regular',
      emailAddress: `${p.userName}@ejemplo.test`,
    });
    await rolProductor(api, id);
    await borrarLoSuyo(api, id, p);

    for (const [k, dias] of VENCIMIENTOS.entries()) {
      await crear(api, 'CPoliza', {
        name: `POL-CART-${p.n}-${k + 1}`, tipoPoliza: TIPOS[k % TIPOS.length], estadoPago: 'Al dia',
        prima: 30000 + 2500 * k, primaCurrency: 'ARS',
        vigenciaDesde: enDias(dias - 365), vigenciaHasta: enDias(dias), assignedUserId: id,
      });
    }
  }
  await api.dispose();
}

/** Todo lo que el productor cargó en una corrida anterior, más su cartera. */
async function borrarLoSuyo(api: APIRequestContext, usuario: string, p: Persona) {
  for (const entidad of ['Case', 'Call', 'Meeting', 'Task', 'CPoliza', 'Contact']) {
    const suyos = [
      ...(await listar(api, entidad, donde('createdById', usuario))).list,
      ...(await listar(api, entidad, donde('assignedUserId', usuario))).list,
    ];
    const deLaPrueba = entidad === 'Contact'
      ? (await listar(api, 'Contact', { textFilter: p.correo, maxSize: 50 })).list
      : entidad === 'CPoliza' ? (await listar(api, 'CPoliza', { textFilter: `*POL-APR-${p.n}*`, maxSize: 50 })).list : [];
    for (const id of new Set([...suyos, ...deLaPrueba].map((r: any) => r.id))) {
      const r = await api.delete(`${entidad}/${id}`);
      if (!r.ok() && r.status() !== 404) throw new Error(`No se pudo borrar ${entidad}/${id}: ${r.status()}`);
    }
  }
}

/** Lo que cada agente informa al terminar. */
export interface Informe {
  persona: number;
  plataforma: string;
  /** Día en que se hizo la prueba: «hoy» y «mañana» de la consigna se cuentan desde acá */
  fecha: string;
  tareas: { tarea: number; termine: boolean; falto?: string | null; captura?: string | null }[];
  respuestaTarea3?: number | null;
}

export const informeDe = (plataforma: string, n: number): Informe | null => {
  const archivo = `${CARPETA}/${plataforma}-p${n}.json`;
  return existsSync(archivo) ? JSON.parse(readFileSync(archivo, 'utf8')) : null;
};

export interface Resultado {
  persona: number;
  tarea: number;
  completo: boolean;
  /** Lo que el agente dijo que le faltó, si abandonó sabiendo por qué */
  falto?: string;
  /** Qué se comprobó sobre los datos guardados */
  constatado: string;
  captura?: string;
}

const digitos = (s: unknown) => String(s ?? '').replace(/\D/g, '');
const normal = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Comprueba sobre los datos guardados cada una de las cinco tareas de una
 * persona, contra la columna «se completa cuando» de la consigna.
 */
export async function verificarEspo(p: Persona, informe: Informe): Promise<Resultado[]> {
  const dia = informe.fecha;
  const admin = await apiEspo();
  const suyo = await apiEspo(p.userName, CLAVE);
  const usuario = (await listar(admin, 'User', { maxSize: 200 })).list.find((u: any) => u.userName === p.userName);
  const deEl = async (entidad: string) => (await listar(admin, entidad, donde('createdById', usuario.id))).list;

  // 1 · El asegurado, con nombre, documento y correo
  const contactos = await deEl('Contact');
  const asegurado = contactos.find((c: any) => normal(c.name).includes(normal(p.asegurado).split(' ')[1]));
  const t1 = !!asegurado && normal(asegurado.name) === normal(p.asegurado)
    && digitos(asegurado.cDocumento) === digitos(p.documento) && normal(asegurado.emailAddress) === normal(p.correo);

  // 2 · La póliza de automotor, vinculada al asegurado, con prima y vigencia
  const polizas = (await deEl('CPoliza')).filter((c: any) => normal(c.name).includes(normal(p.poliza)));
  const poliza = polizas.find((x: any) => asegurado && x.titularId === asegurado.id) ?? polizas[0];
  const cercana = (fecha: string, esperada: string) =>
    !!fecha && Math.abs(new Date(fecha).getTime() - new Date(esperada).getTime()) <= 2 * 86_400_000;
  const t2 = !!poliza && !!asegurado && poliza.titularId === asegurado.id && poliza.tipoPoliza === 'Automotor'
    && Math.abs(Number(poliza.prima) - p.prima) < 1
    && cercana(poliza.vigenciaDesde, dia) && cercana(poliza.vigenciaHasta, enDias(365, new Date(dia + 'T12:00:00')));

  // 3 · Cuántas pólizas de su cartera vencen en los próximos 30 días, con lo que ese productor ve
  const visibles = (await listar(suyo, 'CPoliza', { maxSize: 200 })).list;
  const correcta = visibles.filter((x: any) => x.vigenciaHasta >= dia && x.vigenciaHasta <= enDias(30, new Date(dia + 'T12:00:00'))).length;
  const t3 = informe.respuestaTarea3 === correcta;

  // 4 · El reclamo, vinculado al asegurado
  const reclamos = await deEl('Case');
  const reclamo = reclamos.find((c: any) => asegurado && (c.contactId === asegurado.id || (c.contactsIds ?? []).includes(asegurado.id)));
  const t4 = !!reclamo;

  // 5 · El llamado de mañana a las 10, vinculado al asegurado o al reclamo
  const manana = enDias(1, new Date(dia + 'T12:00:00'));
  const actividades = [...await deEl('Call'), ...await deEl('Meeting'), ...await deEl('Task')];
  const vinculada = (a: any) => asegurado && (
    (a.parentId && [asegurado.id, reclamo?.id].includes(a.parentId)) || (a.contactsIds ?? []).includes(asegurado.id));
  const alas10 = (a: any) => {
    const inicio: string = a.dateStart ?? a.dateEnd ?? '';          // en UTC, el huso del sistema
    return inicio.startsWith(`${manana} 10:00`);
  };
  const llamado = actividades.find((a: any) => vinculada(a) && alas10(a));
  const t5 = !!llamado;

  const constatado = [
    asegurado ? `asegurado «${asegurado.name}», documento ${asegurado.cDocumento ?? 'vacío'}, correo ${asegurado.emailAddress ?? 'vacío'}` : 'ningún asegurado guardado',
    poliza ? `póliza ${poliza.name}, ${poliza.tipoPoliza}, prima ${poliza.prima}, ${poliza.vigenciaDesde} a ${poliza.vigenciaHasta}, ${poliza.titularId === asegurado?.id ? 'vinculada al asegurado' : 'sin vincular al asegurado'}` : 'ninguna póliza guardada',
    `respondió ${informe.respuestaTarea3 ?? 'nada'}; la respuesta correcta es ${correcta}`,
    reclamo ? `reclamo «${reclamo.name}» vinculado al asegurado` : reclamos.length ? `${reclamos.length} reclamo(s) sin vincular al asegurado` : 'ningún reclamo guardado',
    llamado ? `actividad «${llamado.name}» el ${llamado.dateStart ?? llamado.dateEnd}` : actividades.length ? `actividades guardadas, ninguna vinculada para mañana a las 10 (${actividades.map((a: any) => a.dateStart ?? a.dateEnd).join(', ')})` : 'ninguna actividad agendada',
  ];

  await admin.dispose();
  await suyo.dispose();
  return [t1, t2, t3, t4, t5].map((completo, i) => {
    const dicho = informe.tareas.find(t => t.tarea === i + 1);
    return {
      persona: p.n, tarea: i + 1, completo, constatado: constatado[i],
      // Solo sabe qué le faltó quien abandonó diciéndolo; quien creyó haber terminado, no
      falto: !completo && dicho && !dicho.termine && dicho.falto && !/^no s[eé]/i.test(dicho.falto.trim())
        ? dicho.falto : undefined,
      captura: dicho?.captura ?? undefined,
    };
  });
}
