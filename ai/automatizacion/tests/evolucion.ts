/**
 * Lectura de las notas de versión oficiales para B.2.10 y B.2.11.
 *
 * Son lecturas de fuentes públicas: no ejercitan el sistema. Los datos que
 * salen de acá se registran como medición y cada afirmación lleva además su
 * cita textual con `citar()`.
 */

/** El último año, hasta la fecha de la medición. */
export const DESDE = new Date('2025-11-11T00:00:00Z');
export const HASTA = new Date('2026-11-10T23:59:59Z');
export const enVentana = (f: Date | string | undefined) => !!f && new Date(f) >= DESDE && new Date(f) <= HASTA;

export interface Publicacion { tag: string; fecha: string; cuerpo: string; }

/** Versiones publicadas en GitHub dentro del último año, sin borradores ni versiones previas. */
export async function publicaciones(repo: string): Promise<Publicacion[]> {
  const cabeceras: Record<string, string> = { 'User-Agent': 'evaluacion-crm', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) cabeceras.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const todas: Publicacion[] = [];
  for (let pagina = 1; pagina <= 6; pagina++) {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${pagina}`, { headers: cabeceras });
    if (!r.ok) throw new Error(`GitHub ${repo}: respuesta ${r.status}`);
    const lote: any[] = await r.json();
    if (!lote.length) break;
    for (const x of lote) {
      if (x.draft || x.prerelease || !enVentana(x.published_at)) continue;
      todas.push({ tag: x.tag_name, fecha: x.published_at, cuerpo: x.body ?? '' });
    }
    if (new Date(lote[lote.length - 1].published_at) < DESDE) break;
  }
  return todas;
}

/** Fecha de creación del repositorio público del producto. */
export async function creacionDelRepositorio(repo: string): Promise<string> {
  const r = await fetch(`https://api.github.com/repos/${repo}`, { headers: { 'User-Agent': 'evaluacion-crm' } });
  if (!r.ok) throw new Error(`GitHub ${repo}: respuesta ${r.status}`);
  return ((await r.json()) as any).created_at.slice(0, 10);
}

const MES: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

/** Texto de una página, línea por línea y sin marcas. */
export async function lineasDe(url: string): Promise<string[]> {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`${url}: respuesta ${r.status}`);
  return (await r.text())
    .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

/** Versiones de una extensión paga de EspoCRM publicadas en el último año, con sus renglones de novedades. */
export async function versionesDeExtension(pagina: string) {
  const t = await lineasDe(`https://www.espocrm.com/extensions/${pagina}/release-notes`);
  const inicio = t.findIndex(l => /Release Notes$/.test(l));
  const versiones: { v: string; fecha?: Date; renglones: number }[] = [];
  let actual: { v: string; fecha?: Date; renglones: number; cerrado: boolean } | null = null;
  for (const l of t.slice(inicio + 1)) {
    if (/^\d+\.\d+\.\d+$/.test(l)) { actual = { v: l, renglones: 0, cerrado: false }; versiones.push(actual); continue; }
    if (!actual) continue;
    const m = l.match(/^(\d{1,2}) ([A-Z][a-z]{2}) (20\d\d)$/);
    if (m) { actual.fecha = new Date(Date.UTC(+m[3], MES[m[2]], +m[1])); actual.cerrado = true; continue; }
    // El pie de la página termina el último bloque
    if (/^\+1 \(|^Demo$|^© /.test(l)) actual.cerrado = true;
    if (actual.cerrado || /^EspoCRM v[\d.]+\+$/.test(l) || /:$/.test(l)) continue;
    actual.renglones++;
  }
  return versiones.filter(x => enVentana(x.fecha));
}
