import { Page } from '@playwright/test';

/**
 * Carga y baja de la cartera de referencia de B.1.4 por la interfaz de
 * programación, con `batch` de 50 comandos. Prepara el escenario: no decide
 * ningún veredicto. Todo lo cargado lleva el prefijo «VOL».
 */

export type ResultadoCarga = { ids: string[]; error?: { texto: string; en: number } };

/** Lo que devuelve un lote: las altas que salieron y el primer error, con su texto exacto. */
async function lote(page: Page, comandos: Record<string, string>): Promise<{ ids: string[]; error?: string }> {
  for (let intento = 0; intento < 8; intento++) {
    const r = await page.evaluate(c => new Promise<any>(res => {
      (window as any).BX.rest.callMethod('batch', { halt: 0, cmd: c }).then(
        (x: any) => { const d = x.data(); res({ result: d.result, errores: d.result_error }); },
        (e: any) => res({ falla: `${e?.answer?.error ?? ''}: ${e?.answer?.error_description ?? e}` }));
    }), comandos);
    if (r.falla && /QUERY_LIMIT_EXCEEDED/.test(r.falla)) { await page.waitForTimeout(2000 * (intento + 1)); continue; }
    if (r.falla) return { ids: [], error: r.falla };
    const errores = Object.values(r.errores ?? {}) as any[];
    const limite = errores.find(e => /QUERY_LIMIT_EXCEEDED/.test(JSON.stringify(e)));
    if (limite && intento < 7) { await page.waitForTimeout(2000 * (intento + 1)); continue; }
    const primero = errores[0];
    return {
      ids: Object.values(r.result ?? {}).map(String),
      error: primero ? (typeof primero === 'string' ? primero : `${primero.error ?? ''}: ${primero.error_description ?? JSON.stringify(primero)}`) : undefined,
    };
  }
  return { ids: [], error: 'QUERY_LIMIT_EXCEEDED sin ceder tras ocho reintentos' };
}

/** Da de alta `total` registros de a 50 por lote; se detiene en el primer error y lo informa. */
export async function cargar(
  page: Page, metodo: 'crm.contact.add' | 'crm.deal.add', total: number, campos: (n: number) => object,
): Promise<ResultadoCarga> {
  const ids: string[] = [];
  for (let desde = 1; desde <= total; desde += 50) {
    const cmd: Record<string, string> = {};
    for (let n = desde; n < Math.min(desde + 50, total + 1); n++) {
      cmd[`c${n}`] = `${metodo}?${toQuery({ fields: campos(n) })}`;
    }
    const r = await lote(page, cmd);
    ids.push(...r.ids);
    if (r.error) return { ids, error: { texto: r.error, en: ids.length } };
    await page.waitForTimeout(500);
  }
  return { ids };
}

function toQuery(o: any, prefijo = ''): string {
  return Object.entries(o).flatMap(([k, v]) => {
    const clave = prefijo ? `${prefijo}[${k}]` : k;
    return typeof v === 'object' && v !== null ? [toQuery(v, clave)] : [`${encodeURIComponent(clave)}=${encodeURIComponent(String(v))}`];
  }).join('&');
}

/** Cuántos registros VOL quedan, por la interfaz de programación. */
export async function cuantosVol(page: Page, metodo: 'crm.contact.list' | 'crm.deal.list', campo: 'LAST_NAME' | 'TITLE') {
  return page.evaluate(([m, c]) => new Promise<number>(res => {
    (window as any).BX.rest.callMethod(m, { filter: { [`%${c}`]: 'VOL-' }, select: ['ID'] }).then((x: any) => res(x.total()), () => res(-1));
  }), [metodo, campo] as const);
}

/** Borra todo lo VOL: lista de a 50 y borra por lote hasta que no queda nada o deja de bajar el total. */
export async function borrarVol(page: Page, metodo: 'crm.contact' | 'crm.deal', campo: 'LAST_NAME' | 'TITLE') {
  let sinAvance = 0;
  let previo = Infinity;
  for (;;) {
    const r = await page.evaluate(([m, c]) => new Promise<{ ids: string[]; total: number }>(res => {
      (window as any).BX.rest.callMethod(`${m}.list`, { filter: { [`%${c}`]: 'VOL-' }, select: ['ID'] }).then(
        (x: any) => res({ ids: x.data().map((i: any) => String(i.ID)), total: x.total() }), () => res({ ids: [], total: -1 }));
    }), [metodo, campo] as const);
    if (!r.ids.length) return;
    if (r.total >= previo) { if (++sinAvance > 5) return; } else sinAvance = 0;
    previo = r.total;
    const cmd: Record<string, string> = {};
    r.ids.forEach((id, i) => { cmd[`d${i}`] = `${metodo}.delete?id=${id}`; });
    await lote(page, cmd);
    await page.waitForTimeout(400);
  }
}
