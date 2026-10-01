import { Page, Browser, APIRequestContext } from '@playwright/test';
import { PERSONAS, CLAVE, Persona, Informe, Resultado, enDias } from '../aprendizaje';
import { apiTwenty, objeto, registros, crearRegistro, borrarRegistro } from './ui';
import { alistarMiembro, alistarCamposPoliza, alistarReclamo, campoDeTexto, miembros } from './escenario';

/**
 * La prueba de aprendizaje sin capacitación previa (A.11.5), sobre Twenty.
 *
 * Los mismos tres productores y las mismas cinco tareas que en las demás
 * plataformas. Cada productor es un miembro del espacio de trabajo, con su
 * correo de la compañía, y tiene su cartera: ocho pólizas a su nombre. Como
 * todos los miembros ven todas las pólizas, «su cartera» es la de las pólizas
 * que tienen a ese productor.
 */

export const correoDe = (p: Persona) => `${p.userName}@aseguradora.test`;

const VENCIMIENTOS = [-10, 5, 14, 27, 45, 90, 180, 340];
const RAMOS = ['AUTOMOTOR', 'HOGAR', 'VIDA', 'SALUD'];

/**
 * Deja listos los tres productores: miembros del espacio de trabajo con su
 * clave, su cartera cargada y sin rastros de una corrida anterior. El
 * asegurado lleva un campo de documento, que la compañía agrega a la persona.
 */
export async function prepararAprendicesTwenty(page: Page, navegador: Browser) {
  const api = await apiTwenty(page);
  await alistarCamposPoliza(api);
  await alistarReclamo(api);
  await campoDeTexto(api, 'person', 'documento', 'Documento');

  for (const p of PERSONAS) {
    const id = await alistarMiembro(page, navegador, { email: correoDe(p), clave: CLAVE, nombre: p.firstName, apellido: p.lastName });
    await borrarLoSuyo(api, id, p);
    for (const [k, dias] of VENCIMIENTOS.entries()) {
      // Otro prefijo que el de la cartera de referencia, que cargarCartera reemplaza en cada criterio
      await crearRegistro(api, 'polizas', {
        name: `POL-CARTERA-${p.n}-${k + 1}`, ramo: RAMOS[k % RAMOS.length],
        prima: { amountMicros: (30_000 + 2_500 * k) * 1_000_000, currencyCode: 'ARS' },
        vigenciaDesde: enDias(dias - 365), vigenciaHasta: enDias(dias), productorId: id,
      });
    }
  }
}

/** Lo que el productor cargó en una corrida anterior, más su cartera. */
async function borrarLoSuyo(api: APIRequestContext, miembro: string, p: Persona) {
  const suyo = (r: any) => r.createdBy?.workspaceMemberId === miembro;
  for (const plural of ['taskTargets', 'tasks', 'reclamos', 'polizas', 'people']) {
    for (const r of await registros(api, plural)) {
      const deLaPrueba = plural === 'polizas' ? (r.productorId === miembro || new RegExp(`POL-APR-${p.n}`, 'i').test(r.name ?? ''))
        : plural === 'people' ? r.emails?.primaryEmail === p.correo : false;
      if (suyo(r) || deLaPrueba) await borrarRegistro(api, plural, r.id);
    }
  }
}

const digitos = (s: unknown) => String(s ?? '').replace(/\D/g, '');
const normal = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Comprueba sobre los datos guardados cada una de las cinco tareas de una
 * persona, contra la columna «se completa cuando» de la consigna.
 */
export async function verificarTwenty(page: Page, p: Persona, informe: Informe): Promise<Resultado[]> {
  const dia = informe.fecha;
  const api = await apiTwenty(page);
  const miembro = (await miembros(api)).find(m => m.userEmail === correoDe(p));
  const deEl = async (plural: string) => (await registros(api, plural)).filter(r => r.createdBy?.workspaceMemberId === miembro?.id);
  const documento = (await objeto(api, 'person')).fields.find((c: any) => c.label === 'Documento')?.name ?? 'documento';

  // 1 · El asegurado, con nombre, documento y correo
  const personas = await deEl('people');
  const nombreDe = (x: any) => `${x.name?.firstName ?? ''} ${x.name?.lastName ?? ''}`;
  const asegurado = personas.find(x => normal(nombreDe(x)).includes(normal(p.asegurado).split(' ')[1]));
  const t1 = !!asegurado && normal(nombreDe(asegurado)) === normal(p.asegurado)
    && digitos(asegurado[documento]) === digitos(p.documento) && normal(asegurado.emails?.primaryEmail) === normal(p.correo);

  // 2 · La póliza de automotor, vinculada al asegurado, con prima y vigencia
  const polizas = (await deEl('polizas')).filter(x => normal(x.name).includes(normal(p.poliza)));
  const poliza = polizas.find(x => asegurado && x.titularId === asegurado.id) ?? polizas[0];
  const cercana = (fecha: string, esperada: string) =>
    !!fecha && Math.abs(new Date(fecha).getTime() - new Date(esperada).getTime()) <= 2 * 86_400_000;
  const prima = (poliza?.prima?.amountMicros ?? 0) / 1e6;
  const t2 = !!poliza && !!asegurado && poliza.titularId === asegurado.id && poliza.ramo === 'AUTOMOTOR'
    && Math.abs(prima - p.prima) < 1
    && cercana(poliza.vigenciaDesde, dia) && cercana(poliza.vigenciaHasta, enDias(365, new Date(dia + 'T12:00:00')));

  // 3 · Cuántas pólizas de su cartera vencen en los próximos 30 días
  const cartera = (await registros(api, 'polizas')).filter(x => x.productorId === miembro?.id);
  const correcta = cartera.filter(x => x.vigenciaHasta >= dia && x.vigenciaHasta <= enDias(30, new Date(dia + 'T12:00:00'))).length;
  const t3 = informe.respuestaTarea3 === correcta;

  // 4 · El reclamo, vinculado al asegurado
  const reclamos = await deEl('reclamos');
  const reclamo = reclamos.find(r => asegurado && r.aseguradoId === asegurado.id);
  const t4 = !!reclamo;

  // 5 · El llamado de mañana a las 10, vinculado al asegurado o al reclamo
  const manana = enDias(1, new Date(dia + 'T12:00:00'));
  const tareas = await deEl('tasks');
  const vinculos = await registros(api, 'taskTargets');
  const vinculada = (t: any) => vinculos.some(v => v.taskId === t.id && asegurado &&
    (v.targetPersonId === asegurado.id || (reclamo && v.targetReclamoId === reclamo.id)));
  // La hora de la consigna es la de la compañía; el sistema guarda el momento en UTC
  const alas10 = (t: any) => {
    if (!t.dueAt) return false;
    const local = new Date(t.dueAt);
    return local.toLocaleDateString('sv-SE') === manana && local.getHours() === 10 && local.getMinutes() === 0;
  };
  const llamado = tareas.find(t => vinculada(t) && alas10(t));
  const t5 = !!llamado;

  const constatado = [
    asegurado ? `asegurado «${nombreDe(asegurado)}», documento ${asegurado[documento] || 'vacío'}, correo ${asegurado.emails?.primaryEmail || 'vacío'}` : 'ningún asegurado guardado',
    poliza ? `póliza ${poliza.name}, ${poliza.ramo ?? 'sin ramo'}, prima ${prima}, ${poliza.vigenciaDesde ?? '—'} a ${poliza.vigenciaHasta ?? '—'}, ${poliza.titularId === asegurado?.id ? 'vinculada al asegurado' : 'sin vincular al asegurado'}` : 'ninguna póliza guardada',
    `respondió ${informe.respuestaTarea3 ?? 'nada'}; la respuesta correcta es ${correcta}`,
    reclamo ? `reclamo «${reclamo.name}» vinculado al asegurado` : reclamos.length ? `${reclamos.length} reclamo(s) sin vincular al asegurado` : 'ningún reclamo guardado',
    llamado ? `tarea «${llamado.title}» para el ${new Date(llamado.dueAt).toLocaleString('es-AR')}` : tareas.length ? `tareas guardadas, ninguna vinculada para mañana a las 10 (${tareas.map(t => t.dueAt ? new Date(t.dueAt).toLocaleString('es-AR') : 'sin fecha').join(', ')})` : 'ninguna actividad agendada',
  ];

  await api.dispose();
  return [t1, t2, t3, t4, t5].map((completo, i) => {
    const dicho = informe.tareas.find(t => t.tarea === i + 1);
    return {
      persona: p.n, tarea: i + 1, completo, constatado: constatado[i],
      falto: !completo && dicho && !dicho.termine && dicho.falto && !/^no s[eé]/i.test(dicho.falto.trim())
        ? dicho.falto : undefined,
      captura: dicho?.captura ?? undefined,
    };
  });
}
