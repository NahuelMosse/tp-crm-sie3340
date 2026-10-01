import { Page } from '@playwright/test';
import { PERSONAS, Persona, Informe, Resultado, enDias, correoBitrix } from '../aprendizaje';
import { rest, camposDeNegociacion } from './ui';

/**
 * La prueba de aprendizaje sin capacitación previa (A.11.5), sobre Bitrix24.
 *
 * Los mismos tres productores y las mismas cinco tareas que en las demás
 * plataformas. Cada productor es un usuario del portal. La edición gratuita no
 * tiene entidades propias: la póliza se lleva como negociación del CRM, con sus
 * campos propios, y el asegurado es un contacto. Su cartera son las
 * negociaciones `POL-CARTERA-<n>-<k>` asignadas a él.
 */

const VENCIMIENTOS = [-10, 5, 14, 27, 45, 90, 180, 340];
const RAMOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];

const digitos = (s: unknown) => String(s ?? '').replace(/\D/g, '');
const normal = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// ── Interfaz de programación ────────────────────────────────────────────────

/** Todas las filas de un método de listado, recorriendo las páginas. */
async function todos(page: Page, metodo: string, params: object = {}): Promise<any[]> {
  const filas: any[] = [];
  let desde = 0;
  for (;;) {
    const r = await page.evaluate(([m, p, s]) => new Promise<any>(res => (window as any).BX.rest.callMethod(m, { ...(p as object), start: s }).then(
      (x: any) => res({ d: x.data(), sig: x.answer?.next }),
      (e: any) => res({ error: String(e?.answer?.error_description ?? e?.answer?.error ?? e) }))), [metodo, params, desde] as const);
    if (r.error) throw new Error(`${metodo}: ${r.error}`);
    const d = r.d;
    filas.push(...(Array.isArray(d) ? d : (d?.tasks ?? d?.items ?? [])));
    if (r.sig == null) break;
    desde = r.sig;
  }
  return filas;
}

const etiquetaDe = (c: any): string => {
  const e = c.EDIT_FORM_LABEL;
  return typeof e === 'string' ? e : (e?.la ?? e?.es ?? e?.en ?? '');
};

/** El campo «Documento» del contacto: lo agrega la compañía a la persona. Devuelve su nombre interno. */
async function alistarDocumento(page: Page): Promise<string> {
  const buscar = async () => {
    for (const c of await rest<any[]>(page, 'crm.contact.userfield.list', {})) {
      const completo = await rest(page, 'crm.contact.userfield.get', { id: c.ID });
      if (etiquetaDe(completo) === 'Documento') return completo.FIELD_NAME as string;
    }
    return undefined;
  };
  const hay = await buscar();
  if (hay) return hay;
  const etiqueta = { es: 'Documento', la: 'Documento', en: 'Documento' };
  await rest(page, 'crm.contact.userfield.add', {
    fields: { FIELD_NAME: 'DOCUMENTO', USER_TYPE_ID: 'string', EDIT_FORM_LABEL: etiqueta, LIST_COLUMN_LABEL: etiqueta, LIST_FILTER_LABEL: etiqueta },
  });
  const nuevo = await buscar();
  if (!nuevo) throw new Error('No quedó creado el campo Documento del contacto');
  return nuevo;
}

/** Los campos de la póliza (negociación) por su etiqueta, con su nombre interno y los valores de las listas. */
async function camposDePoliza(page: Page) {
  const campos = await camposDeNegociacion(page);
  const de = (etiqueta: string) => {
    const c = campos.find(x => x.etiqueta === etiqueta);
    if (!c) throw new Error(`Falta el campo «${etiqueta}» de la negociación: lo crea el criterio A.1 (cartera de pólizas)`);
    return c;
  };
  return { ramo: de('Ramo'), prima: de('Prima'), desde: de('Vigencia desde'), hasta: de('Vigencia hasta'), cobranza: campos.find(x => x.etiqueta === 'Estado de cobranza') };
}

const usuarioDe = async (page: Page, p: Persona) => {
  const u = (await rest<any[]>(page, 'user.get', { FILTER: { EMAIL: correoBitrix(p) } }))[0];
  if (!u) throw new Error(`El portal no tiene al usuario ${correoBitrix(p)}`);
  return String(u.ID);
};

// ── Preparación ─────────────────────────────────────────────────────────────

/**
 * Deja listos los tres productores: usuarios del portal (ya dados de alta, con
 * su sesión), su cartera cargada y sin rastros de una corrida anterior.
 * El asegurado lleva un campo de documento.
 */
export async function prepararAprendicesBitrix(page: Page) {
  await alistarDocumento(page);
  const campos = await camposDePoliza(page);
  const enumId = (valor: string) => {
    const l = campos.ramo.LIST.find((x: any) => x.VALUE === valor);
    if (!l) throw new Error(`El ramo «${valor}» no está en la lista del campo Ramo`);
    return l.ID;
  };
  const alDia = campos.cobranza?.LIST?.find((x: any) => /^Al d[ií]a$/.test(x.VALUE));

  for (const p of PERSONAS) {
    const id = await usuarioDe(page, p);
    await borrarLoSuyo(page, id, p);
    for (const [k, dias] of VENCIMIENTOS.entries()) {
      await rest(page, 'crm.deal.add', {
        fields: {
          // Otro prefijo que el de la cartera de referencia, que cargan los criterios
          TITLE: `POL-CARTERA-${p.n}-${k + 1}`, ASSIGNED_BY_ID: id,
          [campos.ramo.FIELD_NAME]: enumId(RAMOS[k % RAMOS.length]),
          [campos.prima.FIELD_NAME]: `${30_000 + 2_500 * k}|ARS`,
          [campos.desde.FIELD_NAME]: enDias(dias - 365),
          [campos.hasta.FIELD_NAME]: enDias(dias),
          ...(alDia ? { [campos.cobranza.FIELD_NAME]: alDia.ID } : {}),
        },
      });
    }
  }
}

/** Lo que el productor cargó en una corrida anterior, más su cartera. */
async function borrarLoSuyo(page: Page, usuario: string, p: Persona) {
  const suyo = (r: any) => [r.CREATED_BY_ID, r.ASSIGNED_BY_ID].map(String).includes(usuario);
  const borrar = async (metodo: string, clave: string, id: unknown) => {
    try { await rest(page, metodo, { [clave]: id }); }
    catch (e) { if (!/not found|no encontr|does not exist/i.test(String(e))) throw e; }
  };

  const polizaDeLaPrueba = new RegExp(`POL-APR-${p.n}(?!\\d)|^POL-CARTERA-${p.n}-`, 'i');
  for (const d of await todos(page, 'crm.deal.list', { select: ['ID', 'TITLE', 'CREATED_BY_ID', 'ASSIGNED_BY_ID'] })) {
    if (suyo(d) || polizaDeLaPrueba.test(d.TITLE ?? '')) await borrar('crm.deal.delete', 'id', d.ID);
  }

  const apellido = normal(p.asegurado).split(' ')[1];
  for (const c of await todos(page, 'crm.contact.list', { select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'CREATED_BY_ID', 'ASSIGNED_BY_ID'] })) {
    const correos = (c.EMAIL ?? []).map((e: any) => normal(e.VALUE));
    const deLaPrueba = correos.includes(normal(p.correo)) || normal(`${c.NAME ?? ''} ${c.LAST_NAME ?? ''}`) === normal(p.asegurado)
      || (normal(`${c.NAME ?? ''} ${c.LAST_NAME ?? ''}`).includes(apellido) && suyo(c));
    if (suyo(c) || deLaPrueba) await borrar('crm.contact.delete', 'id', c.ID);
  }

  for (const campo of ['AUTHOR_ID', 'RESPONSIBLE_ID']) {
    for (const a of await todos(page, 'crm.activity.list', { filter: { [campo]: usuario }, select: ['ID'] })) {
      await borrar('crm.activity.delete', 'id', a.ID);
    }
  }
  for (const campo of ['CREATED_BY', 'RESPONSIBLE_ID']) {
    // Las tareas pueden no estar disponibles en la edición; sin ellas no hay nada que borrar
    const tareas = await todos(page, 'tasks.task.list', { filter: { [campo]: usuario }, select: ['ID'] }).catch(() => []);
    for (const t of tareas) await borrar('tasks.task.delete', 'taskId', t.id ?? t.ID);
  }
}

// ── Verificación ────────────────────────────────────────────────────────────

/** Palabras con las que una persona describe el choque del asegurado. */
const DE_RECLAMO = /reclam|choc|siniestr|accident|colisi|estacionam|denuncia|da[nñ]os?/i;

/** El día y la hora de un instante en Buenos Aires, «AAAA-MM-DD HH:MM». */
const enBuenosAires = (iso?: string | null) => {
  if (!iso) return '';
  const t = new Date(iso);
  return isNaN(t.getTime()) ? '' : t.toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).slice(0, 16);
};

const dineroDe = (valor: unknown) => {
  const [monto, moneda] = String(valor ?? '').split('|');
  return { monto: parseFloat(monto), moneda: moneda ?? '' };
};

/**
 * Comprueba sobre los datos guardados cada una de las cinco tareas de una
 * persona, contra la columna «se completa cuando» de la consigna. Se lee con la
 * sesión del administrador; quién creó cada registro lo dice el portal.
 */
export async function verificarBitrix(page: Page, p: Persona, informe: Informe): Promise<Resultado[]> {
  const dia = informe.fecha;
  const id = await usuarioDe(page, p);
  const suyo = (r: any) => String(r.CREATED_BY_ID ?? r.AUTHOR_ID ?? r.createdBy ?? r.AUTHOR ?? '') === id;
  const campos = await camposDePoliza(page);
  const documento = (await rest<any[]>(page, 'crm.contact.userfield.list', {}))
    .find(c => /DOCUMENTO/i.test(c.FIELD_NAME))?.FIELD_NAME ?? 'UF_CRM_DOCUMENTO';
  const ramoDe = (d: any) => campos.ramo.LIST.find((l: any) => String(l.ID) === String(d[campos.ramo.FIELD_NAME]))?.VALUE;
  const dia10 = (valor: unknown) => String(valor ?? '').slice(0, 10);

  // 1 · El asegurado, con nombre, documento y correo
  const contactos = (await todos(page, 'crm.contact.list', { select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'CREATED_BY_ID', documento] })).filter(suyo);
  const nombreDe = (c: any) => `${c.NAME ?? ''} ${c.LAST_NAME ?? ''}`.trim();
  const correosDe = (c: any) => (c.EMAIL ?? []).map((e: any) => e.VALUE);
  const exacto = (c: any) => normal(nombreDe(c)) === normal(p.asegurado)
    && digitos(c[documento]) === digitos(p.documento) && correosDe(c).some((e: string) => normal(e) === normal(p.correo));
  const parecidos = contactos.filter(c => normal(nombreDe(c)).includes(normal(p.asegurado).split(' ')[1]));
  const asegurado = parecidos.find(exacto) ?? parecidos[0];
  const t1 = !!asegurado && exacto(asegurado);

  // 2 · La póliza de automotor, vinculada al asegurado, con prima y vigencia
  const deals = (await todos(page, 'crm.deal.list', { select: ['*', 'UF_*'] })).filter(suyo);
  const vinculos = async (d: any) => ((await rest<any[]>(page, 'crm.deal.contact.items.get', { id: d.ID })) ?? []).map(c => String(c.CONTACT_ID));
  const numero = new RegExp(`(^|[^A-Z0-9])${p.poliza}(?!\\d)`, 'i');
  const candidatas = deals.filter(d => numero.test(d.TITLE ?? ''));
  const deAsegurado = async (d: any) => !!asegurado && ((await vinculos(d)).includes(String(asegurado.ID)) || String(d.CONTACT_ID) === String(asegurado.ID));
  let poliza = candidatas[0];
  for (const d of candidatas) if (await deAsegurado(d)) { poliza = d; break; }
  const cercana = (fecha: string, esperada: string) =>
    !!fecha && Math.abs(new Date(fecha).getTime() - new Date(esperada).getTime()) <= 2 * 86_400_000;
  // La prima puede ir en el campo «Prima» o en el importe propio de la negociación, que también es dinero
  const enCampo = dineroDe(poliza?.[campos.prima.FIELD_NAME]);
  const prima = Number.isFinite(enCampo.monto) ? enCampo : { monto: parseFloat(poliza?.OPPORTUNITY), moneda: poliza?.CURRENCY_ID ?? '' };
  const vinculada = !!poliza && await deAsegurado(poliza);
  // La consigna da la prima en «$» sin nombrar la moneda: se comprueba el monto, como en las demás plataformas
  const t2 = !!poliza && !!asegurado && vinculada && ramoDe(poliza) === 'Automotor'
    && Math.abs(prima.monto - p.prima) < 1
    && cercana(dia10(poliza[campos.desde.FIELD_NAME]), dia) && cercana(dia10(poliza[campos.hasta.FIELD_NAME]), enDias(365, new Date(dia + 'T12:00:00')));

  // 3 · Cuántas pólizas de su cartera vencen en los próximos 30 días
  const limite = enDias(30, new Date(dia + 'T12:00:00'));
  const cartera = (await todos(page, 'crm.deal.list', { filter: { ASSIGNED_BY_ID: id }, select: ['ID', 'TITLE', campos.hasta.FIELD_NAME] }))
    .filter(d => dia10(d[campos.hasta.FIELD_NAME]));
  const correcta = cartera.filter(d => dia10(d[campos.hasta.FIELD_NAME]) >= dia && dia10(d[campos.hasta.FIELD_NAME]) <= limite).length;
  const t3 = informe.respuestaTarea3 === correcta;

  // Las actividades y tareas de la persona, con lo que tocan
  const manana = enDias(1, new Date(dia + 'T12:00:00'));
  const actividades = asegurado || poliza ? await todos(page, 'crm.activity.list', {
    filter: { AUTHOR_ID: id }, select: ['ID', 'SUBJECT', 'DESCRIPTION', 'START_TIME', 'END_TIME', 'DEADLINE', 'AUTHOR_ID'],
  }) : [];
  for (const a of actividades) {
    a.vinculos = ((await rest<any[]>(page, 'crm.activity.binding.list', { activityId: a.ID }).catch(() => [])) ?? [])
      .map(b => `${Number(b.entityTypeId) === 3 ? 'C' : Number(b.entityTypeId) === 2 ? 'D' : Number(b.entityTypeId)}_${b.entityId}`);
  }
  const tareas = await todos(page, 'tasks.task.list', {
    filter: { CREATED_BY: id }, select: ['ID', 'TITLE', 'DESCRIPTION', 'DEADLINE', 'START_DATE_PLAN', 'UF_CRM_TASK'],
  }).catch(() => []);
  const momentos = (a: any) => [a.START_TIME, a.DEADLINE, a.deadline, a.startDatePlan, a.START_DATE_PLAN].map(enBuenosAires);
  const alas10 = (a: any) => momentos(a).includes(`${manana} 10:00`);
  const aseguradoCod = asegurado ? `C_${asegurado.ID}` : '';
  const tocaA = (codigos: string[]) => codigos.some(c => c === aseguradoCod);

  // 4 · El reclamo: algo que la persona dejó escrito sobre el choque del asegurado, que no sea la póliza
  // ni el llamado de mañana. Puede ser otra negociación, un comentario de la ficha del contacto o de la
  // póliza, o una actividad o tarea vinculada al asegurado o a la póliza. Se exige que el texto hable del
  // choque: una negociación o una nota cualquiera sobre el asegurado no es un reclamo.
  let reclamo: { tipo: string; id: string; texto: string } | undefined;
  if (asegurado) {
    const otra = deals.find(d => d.ID !== poliza?.ID && DE_RECLAMO.test(`${d.TITLE} ${d.COMMENTS ?? ''}`));
    const otraDelAsegurado = otra && await deAsegurado(otra) ? otra : undefined;
    if (otraDelAsegurado) reclamo = { tipo: 'negociación', id: `D_${otraDelAsegurado.ID}`, texto: otraDelAsegurado.TITLE };
    if (!reclamo) {
      const fichas = [{ tipo: 'contact', id: asegurado.ID }, ...(poliza ? [{ tipo: 'deal', id: poliza.ID }] : [])];
      for (const f of fichas) {
        const notas = await rest<any[]>(page, 'crm.timeline.comment.list', {
          filter: { ENTITY_ID: f.id, ENTITY_TYPE: f.tipo }, select: ['ID', 'AUTHOR_ID', 'COMMENT'],
        }).catch(() => []);
        const nota = (notas ?? []).find(n => String(n.AUTHOR_ID) === id && DE_RECLAMO.test(n.COMMENT ?? ''));
        if (nota) { reclamo = { tipo: 'comentario', id: `${f.tipo === 'contact' ? 'C' : 'D'}_${f.id}`, texto: nota.COMMENT }; break; }
      }
    }
    if (!reclamo) {
      const codigoPoliza = poliza ? `D_${poliza.ID}` : '';
      const act = actividades.find(a => !alas10(a) && (tocaA(a.vinculos) || a.vinculos.includes(codigoPoliza)) && DE_RECLAMO.test(`${a.SUBJECT} ${a.DESCRIPTION ?? ''}`));
      if (act) reclamo = { tipo: 'actividad', id: `A_${act.ID}`, texto: act.SUBJECT };
      const tar = !reclamo && tareas.find(t => !alas10(t) && tocaA(t.ufCrmTask ?? t.UF_CRM_TASK ?? []) && DE_RECLAMO.test(`${t.title ?? t.TITLE} ${t.description ?? ''}`));
      if (tar) reclamo = { tipo: 'tarea', id: `T_${tar.id ?? tar.ID}`, texto: tar.title ?? tar.TITLE };
    }
  }
  const t4 = !!reclamo;

  // 5 · El llamado de mañana a las 10, vinculado al asegurado o al reclamo. La hora es la de Buenos Aires.
  const destinos = [aseguradoCod, reclamo?.id.startsWith('D_') ? reclamo.id : ''].filter(Boolean);
  const llamadoAct = actividades.find(a => alas10(a) && a.vinculos.some((v: string) => destinos.includes(v)));
  const llamadoTarea = tareas.find(t => alas10(t) && (t.ufCrmTask ?? t.UF_CRM_TASK ?? []).some((v: string) => destinos.includes(v)));
  const llamado = llamadoAct ?? llamadoTarea;
  const t5 = !!llamado;

  const cuando = (a: any) => momentos(a).find(Boolean) || 'sin fecha';
  const constatado = [
    asegurado ? `asegurado «${nombreDe(asegurado)}», documento ${asegurado[documento] || 'vacío'}, correo ${correosDe(asegurado).join(', ') || 'vacío'}` : 'ningún asegurado guardado',
    poliza ? `póliza ${poliza.TITLE}, ${ramoDe(poliza) ?? 'sin ramo'}, prima ${Number.isFinite(prima.monto) ? `${prima.monto} ${prima.moneda}` : 'vacía'}, ${dia10(poliza[campos.desde.FIELD_NAME]) || '—'} a ${dia10(poliza[campos.hasta.FIELD_NAME]) || '—'}, ${vinculada ? 'vinculada al asegurado' : 'sin vincular al asegurado'}` : 'ninguna póliza guardada',
    `respondió ${informe.respuestaTarea3 ?? 'nada'}; la respuesta correcta es ${correcta}`,
    reclamo ? `reclamo registrado como ${reclamo.tipo} «${reclamo.texto.replace(/\s+/g, ' ').slice(0, 80)}» sobre el asegurado` : 'ningún registro del reclamo del asegurado (distinto de la póliza, que hable del choque)',
    llamado ? `${llamadoAct ? 'actividad' : 'tarea'} «${llamado.SUBJECT ?? llamado.title}» para el ${cuando(llamado)} (hora de Buenos Aires)`
      : actividades.length + tareas.length ? `actividades o tareas guardadas, ninguna vinculada al asegurado para mañana a las 10 (${[...actividades, ...tareas].map(cuando).join(', ')})` : 'ninguna actividad agendada',
  ];

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
