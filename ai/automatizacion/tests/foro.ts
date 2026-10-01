import { Browser, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { Fuente } from './evaluar';
import { CAPTURAS } from './fuentes';

/**
 * La comunidad de usuarios, medida sobre lo que ya está publicado (A.11.12).
 *
 * Se toman las consultas más recientes del foro oficial que ya tienen más de
 * una semana —la espera aceptable de la sección 4.7—, y cada una se clasifica
 * con la misma escala que el criterio:
 *
 *   2  otro usuario respondió dentro de la semana, y el autor confirmó después
 *      que la respuesta le sirvió
 *   1  hubo respuesta, pero llegó más tarde o el autor no confirmó que resolviera
 *   0  nadie más que el autor escribió en el hilo
 *
 * El valor del criterio es el de la consulta típica: la mediana de esas
 * clasificaciones. Con una cantidad impar de consultas la mediana es siempre
 * una de ellas, sin promedios ni desempates.
 */

export const CONSULTAS = 21;
export const ESPERA_MS = 7 * 86_400_000;

/**
 * Confirma quien consultó cuando, en su propio texto, agradece o dice que
 * funcionó, sin plantear otra pregunta ni decir que todavía falla o que recién
 * lo va a probar. Un agradecimiento seguido de una repregunta no es una
 * consulta resuelta.
 */
const CONFIRMA = /\b(thanks?|thank you|thx|works now|it works|worked|working now|solved|fixed|perfect|that did it|gracias|resuelto|funciona|danke|merci|obrigad[oa]|grazie|dzięki|спасибо)\b/i;
const NIEGA = /\?|\b(but|still|doesn'?t|does not|didn'?t|not work|no funciona|sigue|pero|however|unfortunately|if it works|report back|will try|i'?ll try|let me try|voy a probar)\b/i;

/**
 * Las mismas formas en ruso. `` de JavaScript no reconoce letras cirílicas,
 * así que los límites de palabra se marcan con `\p{L}`.
 */
const CONFIRMA_RU = /(?<!\p{L})(спасибо|благодарю|помогло|заработало|теперь работает|решено|решилось|решил[аи]?сь|разобрал(?:ся|ась|ись)|получилось|исправлено)(?!\p{L})/iu;
const NIEGA_RU = /\?|(?<!\p{L})(не\s+(помогло|помогает|работает|заработало|получилось|получается|удалось|решен[оа]?|решилось)|всё\s+равно|все\s+равно|по-прежнему|однако|но|к\s+сожалению|так\s+и\s+не|пока\s+не|попробую|проверю|буду\s+пробовать)(?!\p{L})/iu;
const confirma = (t: string) => (CONFIRMA.test(t) || CONFIRMA_RU.test(t)) && !(NIEGA.test(t) || NIEGA_RU.test(t));

export interface Mensaje { autor: string; fecha: Date; texto: string }
export interface Hilo {
  url: string;
  titulo: string;
  inicio: Mensaje;
  respuestas: Mensaje[];
}
export interface Clasificado extends Hilo {
  valor: 0 | 1 | 2;
  primera?: Mensaje;
  horas?: number;
  /** El mensaje del autor que confirma que la respuesta le sirvió */
  confirmacion?: string;
}

/**
 * Las consultas de una sección de un foro vBulletin, empezando por la más
 * reciente que ya cumplió la semana. Los hilos se ordenan por número, que
 * crece con la fecha de creación: el listado del foro los ordena por la última
 * actividad, y eso haría pasar primero a un hilo viejo con un mensaje nuevo.
 */
export async function consultasVBulletin(navegador: Browser, seccion: string, hasta: Date): Promise<Hilo[]> {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 1400 } });
  const pagina = await contexto.newPage();
  try {
    const numeros = new Map<number, string>();
    for (let n = 1; n <= 12; n++) {
      await pagina.goto(`${seccion}${n > 1 ? `/page${n}` : ''}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await pagina.waitForTimeout(1500);
      const enlaces: string[] = await pagina.$$eval('a', (as, base) =>
        as.map(a => (a as HTMLAnchorElement).href.replace(/[?#].*$/, ''))
          .filter(h => h.startsWith(base + '/') && /\/\d+-[^/]+$/.test(h)), seccion);
      for (const h of enlaces) numeros.set(Number(h.match(/\/(\d+)-[^/]+$/)![1]), h);
    }

    const hilos: Hilo[] = [];
    for (const [, url] of [...numeros].sort((a, b) => b[0] - a[0])) {
      const hilo = await leerHilo(pagina, url);
      if (!hilo || hilo.inicio.fecha > hasta) continue;
      hilos.push(hilo);
      if (hilos.length === CONSULTAS) break;
    }
    return hilos;
  } finally {
    await contexto.close();
  }
}

async function leerHilo(pagina: Page, url: string): Promise<Hilo | null> {
  await pagina.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await pagina.waitForTimeout(1200);
  const mensajes = await pagina.$$eval('li.b-post[data-node-publishdate]', ps => ps.map(p => {
    // Solo lo que escribió el autor del mensaje: lo que cita de otro no es suyo
    const cuerpo = p.querySelector('.js-post__content-text')?.cloneNode(true) as HTMLElement | undefined;
    cuerpo?.querySelectorAll('.bbcode_container, .bbcode_quote, .quote_container').forEach(q => q.remove());
    return {
      autor: p.querySelector('.author [itemprop="name"]')?.textContent?.trim() ?? '',
      fecha: Number(p.getAttribute('data-node-publishdate')) * 1000,
      texto: cuerpo?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    };
  }));
  if (!mensajes.length) return null;
  const titulo = (await pagina.locator('h1').first().textContent())?.trim() ?? '';
  const [inicio, ...respuestas] = mensajes.map(m => ({ ...m, fecha: new Date(m.fecha) }));
  return { url, titulo, inicio, respuestas };
}

/**
 * Las consultas del foro oficial de Bitrix24 (dev.1c-bitrix.ru, subforo
 * «Корпоративный портал»), empezando por la más reciente que ya cumplió la
 * semana. El listado ordena por la última actividad y mezcla los temas fijados
 * («Важно»), que se excluyen; los temas se ordenan por número, que crece con la
 * fecha de creación. Los mensajes de un tema se leen página por página.
 */
export async function consultasBitrix24Foro(navegador: Browser, hasta: Date): Promise<Hilo[]> {
  const base = 'https://dev.1c-bitrix.ru/community/forums/forum23/';
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 1400 } });
  const pagina = await contexto.newPage();
  try {
    const numeros = new Set<number>();
    for (let n = 1; n <= 4; n++) {
      await pagina.goto(n === 1 ? base : `${base}index.php?PAGEN_1=${n}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const ids: number[] = await pagina.$$eval('tr[class*="forum-row"]:not(.forum-row-sticky) .forum-item-title a[href*="/forum23/topic"]',
        as => as.map(a => Number((a.getAttribute('href') ?? '').match(/topic(\d+)\//)?.[1] ?? 0)).filter(Boolean));
      ids.forEach(i => numeros.add(i));
    }

    const hilos: Hilo[] = [];
    for (const id of [...numeros].sort((a, b) => b - a)) {
      const hilo = await leerHiloBitrix24(pagina, `${base}topic${id}/`);
      if (!hilo || hilo.inicio.fecha > hasta) continue;
      hilos.push(hilo);
      if (hilos.length === CONSULTAS) break;
    }
    return hilos;
  } finally {
    await contexto.close();
  }
}

async function leerHiloBitrix24(pagina: Page, url: string): Promise<Hilo | null> {
  const mensajes: Mensaje[] = [];
  let titulo = '';
  for (let n = 1; n <= 20; n++) {
    await pagina.goto(n === 1 ? url : `${url}?PAGEN_1=${n}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (n === 1) titulo = (await pagina.locator('h1').first().textContent())?.replace(/\s+/g, ' ').trim() ?? '';
    const pag = await pagina.$$eval('table.forum-post-table', ts => ts.map(t => {
      // Solo lo que escribió el autor del mensaje: lo que cita de otro no es suyo
      const cuerpo = t.querySelector('.forum-post-text')?.cloneNode(true) as HTMLElement | undefined;
      cuerpo?.querySelectorAll('.entry-quote, table.forum-quote').forEach(q => q.remove());
      return {
        autor: t.getAttribute('bx-author-id') ?? '',
        fecha: t.querySelector('.forum-post-date > span')?.textContent?.trim() ?? '',
        texto: cuerpo?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      };
    }));
    // Las fechas del foro están en hora de Moscú
    const nuevos = pag.map(m => {
      const f = m.fecha.match(/(\d+)\.(\d+)\.(\d+) (\d+):(\d+):(\d+)/);
      return { ...m, fecha: f ? new Date(`${f[3]}-${f[2]}-${f[1]}T${f[4].padStart(2, '0')}:${f[5]}:${f[6]}+03:00`) : new Date(NaN) };
    });
    // Sin mensajes nuevos: la página pedida no existe y el foro devolvió la última
    const conocidos = new Set(mensajes.map(m => `${m.autor}|${m.fecha.getTime()}|${m.texto}`));
    const inedito = nuevos.filter(m => !conocidos.has(`${m.autor}|${m.fecha.getTime()}|${m.texto}`));
    if (!inedito.length) break;
    mensajes.push(...inedito);
    if (nuevos.length < 25) break;
  }
  if (!mensajes.length || isNaN(mensajes[0].fecha.getTime())) return null;
  const [inicio, ...respuestas] = mensajes;
  return { url, titulo, inicio, respuestas };
}

/**
 * Las consultas de las discusiones públicas de un repositorio de GitHub, de
 * las categorías dadas, empezando por la más reciente que ya cumplió la
 * semana. Se leen con la interfaz de GitHub: comentarios y respuestas a los
 * comentarios, en orden de fecha, como un hilo de foro.
 */
export function consultasGitHub(repo: string, categorias: string[], hasta: Date): Hilo[] {
  const [owner, name] = repo.split('/');
  const pedir = (consulta: string) => JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${consulta}`],
    { encoding: 'utf8', maxBuffer: 64 << 20 }));
  const ids = pedir(`query { repository(owner:"${owner}", name:"${name}") { discussionCategories(first:50) { nodes { id name } } } }`)
    .data.repository.discussionCategories.nodes.filter((c: any) => categorias.includes(c.name)).map((c: any) => c.id);
  const mensaje = (n: any): Mensaje => ({ autor: n.author?.login ?? '', fecha: new Date(n.createdAt), texto: (n.bodyText ?? '').replace(/\s+/g, ' ').trim() });
  const hilos: Hilo[] = [];
  for (const id of ids) {
    const d = pedir(`query { repository(owner:"${owner}", name:"${name}") { discussions(first:60, categoryId:"${id}", orderBy:{field:CREATED_AT, direction:DESC}) {
      nodes { url title createdAt bodyText author { login }
        comments(first:50) { nodes { createdAt bodyText author { login } replies(first:50) { nodes { createdAt bodyText author { login } } } } } } } } }`);
    for (const n of d.data.repository.discussions.nodes) {
      const respuestas = n.comments.nodes.flatMap((c: any) => [mensaje(c), ...c.replies.nodes.map(mensaje)])
        .sort((a: Mensaje, b: Mensaje) => a.fecha.getTime() - b.fecha.getTime());
      hilos.push({ url: n.url, titulo: n.title, inicio: mensaje(n), respuestas });
    }
  }
  return hilos.filter(h => h.inicio.fecha <= hasta)
    .sort((a, b) => b.inicio.fecha.getTime() - a.inicio.fecha.getTime()).slice(0, CONSULTAS);
}

/** La clasificación de cada consulta con la escala del criterio. */
export function clasificar(h: Hilo): Clasificado {
  const primera = h.respuestas.find(r => r.autor !== h.inicio.autor);
  if (!primera) return { ...h, valor: 0 };
  const horas = (primera.fecha.getTime() - h.inicio.fecha.getTime()) / 3_600_000;
  const aTiempo = horas * 3_600_000 <= ESPERA_MS;
  const confirmacion = /\bsolved\b|\bresuelto\b/i.test(h.titulo) || /(?<!\p{L})решен[оа]?(?!\p{L})/iu.test(h.titulo) ? h.titulo : h.respuestas.find(r =>
    r.autor === h.inicio.autor && r.fecha > primera.fecha && confirma(r.texto))?.texto;
  return { ...h, valor: aTiempo && confirmacion ? 2 : 1, primera, horas, confirmacion };
}

/** La consulta típica: la del medio, con las clasificaciones ordenadas. */
export const mediana = (cs: Clasificado[]) => [...cs].sort((a, b) => a.valor - b.valor)[(cs.length - 1) / 2];

/** Constancia de cada hilo: su dirección, el texto textual de la primera respuesta y una captura. */
export async function constanciaDeHilos(navegador: Browser, cs: Clasificado[], prefijo: string): Promise<Fuente[]> {
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 1400 } });
  const pagina = await contexto.newPage();
  const hoy = new Date().toLocaleDateString('sv-SE');
  const corto = (t: string) => t.length > 300 ? t.slice(0, 300).replace(/\s\S*$/, '') + '…' : t;
  try {
    const fuentes: Fuente[] = [];
    for (const [k, c] of cs.entries()) {
      const captura = `${prefijo}-${String(k + 1).padStart(2, '0')}.png`;
      await pagina.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await pagina.waitForTimeout(1200);
      await pagina.screenshot({ path: `${CAPTURAS}/${captura}` });
      fuentes.push({ url: c.url, cita: corto((c.primera ?? c.inicio).texto) || c.titulo, consultado: hoy, captura });
    }
    return fuentes;
  } finally {
    await contexto.close();
  }
}
