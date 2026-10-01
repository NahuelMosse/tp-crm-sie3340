#!/usr/bin/env node
/**
 * Genera la documentación HTML de las pruebas.
 *
 *   node generar-doc.mjs [raiz-del-repo]
 *
 * Arma humanos/documentacion/index.html con cada criterio del catálogo de la
 * sección 4 y, por plataforma, lo que registró su prueba: el valor, la
 * justificación, la medición, el video de la ejecución, las capturas y las
 * fuentes citadas con su texto textual.
 *
 * Como la matriz del informe, no se escribe a mano: sale de resultados/*.json,
 * de evidencia/ y de evidencia/videos/, que conserva el video de la última
 * ejecución de cada criterio.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import catalogo from './catalogo.cjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = process.argv[2] ? join(process.cwd(), process.argv[2]) : catalogo.RAIZ;
const RESULTADOS = join(AQUI, 'resultados');
const EVIDENCIA = join(AQUI, 'evidencia');
const SALIDA = join(RAIZ, 'humanos', 'documentacion');

/** Desde humanos/documentacion/, dónde está cada carpeta de constancias. */
const RUTA_EVIDENCIA = '../../ai/automatizacion/evidencia';
const RUTA_EXPLORACION = '../../ai/pruebas';

const PLATAFORMAS = {
  espocrm:  { nombre: 'EspoCRM',  version: '10.0.4 Community', color: '#2d7ff9' },
  twenty:   { nombre: 'Twenty',   version: 'v2.37.4',          color: '#7b5cff' },
  bitrix24: { nombre: 'Bitrix24', version: 'Free',             color: '#00aeef' },
};

const CUMPLE = { 2: 'Cumple', 1: 'Cumple con reparo', 0: 'No cumple' };
const COSTO = { 0: 'viene listo', 1: 'configuración', 2: 'desarrollo o trabajo permanente' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ancla = (id, p = '') => `c-${id.replace(/\./g, '-')}${p ? `-${p}` : ''}`;

// ── Lo registrado ────────────────────────────────────────────────────────────
const registros = {};
for (const f of existsSync(RESULTADOS) ? readdirSync(RESULTADOS).filter(f => f.endsWith('.json')) : []) {
  const r = JSON.parse(readFileSync(join(RESULTADOS, f), 'utf8'));
  (registros[r.criterio] ??= {})[r.plataforma] = r;
}
const videos = new Set(existsSync(join(EVIDENCIA, 'videos')) ? readdirSync(join(EVIDENCIA, 'videos')) : []);
const enEvidencia = new Set(existsSync(EVIDENCIA) ? readdirSync(EVIDENCIA) : []);

/** Las capturas más viejas quedaron en la carpeta de la exploración. */
const rutaCaptura = (archivo) => enEvidencia.has(archivo) ? `${RUTA_EVIDENCIA}/${archivo}` : `${RUTA_EXPLORACION}/${archivo}`;
const videoDe = (id, p) => {
  const archivo = `${id.replace(/\./g, '-')}.${p}.webm`;
  return videos.has(archivo) ? `${RUTA_EVIDENCIA}/videos/${archivo}` : null;
};

const listaFuentes = (d) => Array.isArray(d) ? d : d ? [d] : [];

// ── Cifras de cabecera ───────────────────────────────────────────────────────
const evaluados = (p) => Object.values(registros).filter(r => r[p] && r[p].puntua !== false).length;
let totalVideos = 0, totalCapturas = 0, totalFuentes = 0;
for (const porPlataforma of Object.values(registros)) {
  for (const [p, r] of Object.entries(porPlataforma)) {
    if (videoDe(r.criterio, p)) totalVideos++;
    totalCapturas += (r.evidencia ?? []).length;
    totalFuentes += listaFuentes(r.documentacion).length;
  }
}

// ── Una plataforma dentro de un criterio ─────────────────────────────────────
function bloque(c, p, r) {
  const P = PLATAFORMAS[p];
  if (!r) return `<div class="plat vacia" style="--c:${P.color}"><h4>${esc(P.nombre)}</h4><p class="tenue">Sin verificar: la prueba todavía no se ejecutó sobre esta plataforma.</p></div>`;
  if (r.puntua === false) return `<div class="plat vacia" style="--c:${P.color}" id="${ancla(c.id, p)}"><h4>${esc(P.nombre)}</h4><p class="tenue">Sin verificar. ${esc(r.motivo)}</p></div>`;

  const valor = `<span class="valor v${r.cumple}">${r.cumple} · ${esc(CUMPLE[r.cumple])}</span>` +
    (r.costo !== undefined && r.costo !== null ? `<span class="costo">costo ${r.costo} · ${esc(COSTO[r.costo])}</span>` : '');
  const planes = (r.conPlan ?? []).map(k =>
    `<li><b>${esc(k.plan)}</b> (${esc(k.monto)}): ${k.cumple} · ${esc(CUMPLE[k.cumple])}${k.costo !== undefined ? `, costo ${k.costo}` : ''}. ${esc(k.justificacion)}</li>`).join('');
  const video = videoDe(c.id, p);
  const capturas = (r.evidencia ?? []).map(a =>
    `<figure><a href="${encodeURI(rutaCaptura(a))}" target="_blank"><img loading="lazy" src="${encodeURI(rutaCaptura(a))}" alt="${esc(a)}"></a><figcaption>${esc(a.replace(/\.png$/, ''))}</figcaption></figure>`).join('');
  const fuentes = listaFuentes(r.documentacion).map(f =>
    `<li><blockquote>${esc(f.cita)}</blockquote><div class="fuente"><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.url)}</a> · consultado el ${esc(f.consultado)}` +
    (f.captura ? ` · <a href="${encodeURI(`${RUTA_EVIDENCIA}/${f.captura}`)}" target="_blank">captura</a>` : '') + `</div></li>`).join('');

  return `<div class="plat" style="--c:${P.color}" id="${ancla(c.id, p)}">
    <h4>${esc(P.nombre)} ${valor}</h4>
    <p>${esc(r.justificacion)}</p>
    ${r.medicion ? `<p class="medicion"><b>Medición:</b> ${esc(r.medicion)}</p>` : ''}
    ${r.licencia ? `<p class="medicion"><b>Licencia:</b> ${esc(r.licencia.plan)} — ${esc(r.licencia.monto)}</p>` : ''}
    ${planes ? `<div class="sub">Con un plan pago</div><ul class="planes">${planes}</ul>` : ''}
    ${video ? `<figure class="video"><video controls preload="metadata" src="${encodeURI(video)}"></video><figcaption>Ejecución de la prueba</figcaption></figure>` : ''}
    ${capturas ? `<div class="sub">Capturas del sistema</div><div class="galeria">${capturas}</div>` : ''}
    ${fuentes ? `<div class="sub">Fuentes del fabricante</div><ul class="fuentes">${fuentes}</ul>` : ''}
    <p class="momento">Registrado el ${esc(new Date(r.momento).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }))}</p>
  </div>`;
}

// ── Índice y cuerpo ──────────────────────────────────────────────────────────
const punto = (r, p) => {
  const clase = !r ? 'nada' : r.puntua === false ? 'nada' : `v${r.cumple}`;
  return `<i class="dot ${clase}" title="${esc(PLATAFORMAS[p].nombre)}: ${!r || r.puntua === false ? 'sin verificar' : esc(CUMPLE[r.cumple])}"></i>`;
};

let nav = '', cuerpo = '';
for (const parte of ['A', 'B']) {
  const titulo = parte === 'A' ? 'Parte A — Criterios solicitados' : 'Parte B — Criterios no solicitados';
  nav += `<div class="nav-parte">${esc(titulo)}</div>`;
  cuerpo += `<h2 class="parte">${esc(titulo)}</h2>`;
  for (const g of catalogo.GRUPOS.filter(g => g.parte === parte)) {
    nav += `<div class="nav-grupo"><div class="nav-h">${esc(g.id)} ${esc(g.nombre)}</div>`;
    cuerpo += `<section class="grupo"><h3 class="grupo-t"><span class="gid">${esc(g.id)}</span>${esc(g.nombre)}</h3>`;
    for (const c of g.criterios) {
      const r = registros[c.id] ?? {};
      nav += `<a href="#${ancla(c.id)}"><span class="cid">${esc(c.id)}</span><span class="cn">${esc(c.nombre)}</span>` +
        `<span class="dots">${Object.keys(PLATAFORMAS).map(p => punto(r[p], p)).join('')}</span></a>`;
      cuerpo += `<article class="caso" id="${ancla(c.id)}">
        <header><div class="badge">${esc(c.id)}</div><h3>${esc(c.nombre)}</h3></header>
        <p class="preg"><b>Procedimiento:</b> ${esc(c.procedimiento)}</p>
        ${Object.keys(PLATAFORMAS).map(p => bloque(c, p, r[p])).join('')}
      </article>`;
    }
    nav += `</div>`;
    cuerpo += `</section>`;
  }
}

const cifrasPlataforma = Object.entries(PLATAFORMAS).map(([p, P]) =>
  `<div class="cifra"><b style="color:${P.color}">${evaluados(p)}/${catalogo.CRITERIOS.length}</b><span>${esc(P.nombre)}</span></div>`).join('');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pruebas de la evaluación de sistemas CRM</title>
<style>
  :root {
    --bg: #0f1720; --panel: #16212e; --linea: #24344a;
    --txt: #e8eef6; --tenue: #93a6bd; --ok: #3ecf8e; --medio: #ffd166; --no: #ff6b6b; --acc: #ffd166;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--txt);
         font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  a { color: inherit; }
  .tenue { color: var(--tenue); }

  .top { padding: 40px 32px 26px; border-bottom: 1px solid var(--linea);
         background: linear-gradient(180deg, #16212e, #0f1720); }
  .top h1 { margin: 0 0 6px; font-size: 30px; letter-spacing: -.4px; }
  .top p { margin: 0; color: var(--tenue); }
  .cifras { display: flex; gap: 28px; margin-top: 22px; flex-wrap: wrap; }
  .cifra b { display: block; font-size: 26px; color: var(--acc); }
  .cifra span { font-size: 13px; color: var(--tenue); text-transform: uppercase; letter-spacing: .6px; }
  .leyenda { margin-top: 16px; font-size: 13px; color: var(--tenue); display: flex; gap: 18px; flex-wrap: wrap; }

  .layout { display: grid; grid-template-columns: 330px 1fr; align-items: start; }
  nav { position: sticky; top: 0; max-height: 100vh; overflow-y: auto;
        padding: 22px 16px; border-right: 1px solid var(--linea); }
  .nav-parte { font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .8px;
               color: var(--acc); margin: 8px 0 12px; }
  .nav-grupo { margin-bottom: 16px; }
  .nav-h { font-weight: 700; font-size: 13px; color: var(--txt);
           padding-bottom: 6px; border-bottom: 1px solid var(--linea); margin-bottom: 4px; }
  nav a { display: flex; gap: 8px; align-items: baseline; padding: 5px 7px; border-radius: 7px;
          text-decoration: none; font-size: 13px; color: var(--tenue); }
  nav a:hover { background: var(--panel); color: var(--txt); }
  .cn { flex: 1; }
  .cid { font-family: ui-monospace, monospace; font-size: 11px; color: var(--acc);
         background: rgba(255,209,102,.1); padding: 1px 6px; border-radius: 4px; white-space: nowrap; }
  .dots { display: flex; gap: 3px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; border: 1px solid var(--linea); }
  .dot.v2 { background: var(--ok); } .dot.v1 { background: var(--medio); } .dot.v0 { background: var(--no); }
  .dot.nada { background: transparent; }

  main { padding: 26px 32px 80px; max-width: 1150px; }
  .parte { font-size: 24px; margin: 10px 0 18px; }
  .grupo { margin-bottom: 40px; }
  .grupo-t { display: flex; gap: 10px; align-items: center; font-size: 20px; margin: 0 0 14px; }
  .gid { font-family: ui-monospace, monospace; font-size: 13px; background: var(--linea); padding: 3px 8px; border-radius: 6px; }

  .caso { background: var(--panel); border: 1px solid var(--linea); border-radius: 12px;
          padding: 22px; margin-bottom: 20px; scroll-margin-top: 16px; }
  .caso header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
  .badge { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700;
           background: var(--acc); color: #08111b; padding: 5px 10px; border-radius: 6px; white-space: nowrap; }
  .caso h3 { margin: 0; font-size: 18px; }
  .preg { color: var(--tenue); font-size: 14.5px; margin: 0 0 14px; }

  .plat { border-left: 3px solid var(--c); padding: 4px 0 6px 16px; margin: 18px 0 0; }
  .plat h4 { margin: 0 0 6px; font-size: 16px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .plat.vacia h4 { color: var(--tenue); }
  .plat p { margin: 0 0 10px; font-size: 14.5px; }
  .valor { font-size: 12.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .valor.v2 { background: rgba(62,207,142,.14); color: var(--ok); }
  .valor.v1 { background: rgba(255,209,102,.14); color: var(--medio); }
  .valor.v0 { background: rgba(255,107,107,.14); color: var(--no); }
  .costo { font-size: 12.5px; color: var(--tenue); font-weight: 400; }
  .medicion { color: var(--tenue); }
  .momento { color: var(--tenue); font-size: 12px; }
  .sub { font-size: 12px; text-transform: uppercase; letter-spacing: .6px; color: var(--tenue); margin: 14px 0 8px; }
  .planes, .fuentes { margin: 0 0 10px; padding-left: 18px; font-size: 14px; }
  .fuentes { list-style: none; padding: 0; }
  .fuentes li { margin-bottom: 12px; }
  blockquote { margin: 0; padding: 8px 14px; border-left: 3px solid var(--acc);
               background: rgba(255,209,102,.06); font-size: 14px; border-radius: 0 7px 7px 0; }
  .fuente { font-size: 12.5px; color: var(--tenue); margin-top: 4px; word-break: break-all; }

  .video { margin: 10px 0 6px; }
  .video video { width: 100%; max-height: 460px; border-radius: 9px; background: #000; display: block; }
  figure { margin: 0; }
  figcaption { color: var(--tenue); font-size: 12px; margin-top: 6px; text-align: center; word-break: break-all; }
  .galeria { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .galeria img { width: 100%; height: 170px; object-fit: cover; object-position: top;
                 border-radius: 7px; border: 1px solid var(--linea);
                 display: block; transition: transform .15s; background: #fff; }
  .galeria a:hover img { transform: scale(1.02); border-color: var(--c); }

  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    nav { position: static; max-height: none; border-right: 0; border-bottom: 1px solid var(--linea); }
  }
</style>
</head>
<body>
  <div class="top">
    <h1>Pruebas de la evaluación de sistemas CRM</h1>
    <p>Cada criterio del catálogo, con lo que su prueba registró en cada plataforma: valor, justificación, video, capturas y fuentes.</p>
    <div class="cifras">
      ${cifrasPlataforma}
      <div class="cifra"><b>${totalVideos}</b><span>Videos</span></div>
      <div class="cifra"><b>${totalCapturas}</b><span>Capturas</span></div>
      <div class="cifra"><b>${totalFuentes}</b><span>Fuentes citadas</span></div>
      <div class="cifra"><b>${new Date().toLocaleDateString('es-AR')}</b><span>Actualizado</span></div>
    </div>
    <div class="leyenda">
      <span><i class="dot v2"></i> cumple</span><span><i class="dot v1"></i> cumple con reparo</span>
      <span><i class="dot v0"></i> no cumple</span><span><i class="dot nada"></i> sin verificar</span>
      <span>Los tres puntos del índice son EspoCRM, Twenty y Bitrix24, en ese orden.</span>
    </div>
  </div>

  <div class="layout">
    <nav>${nav}</nav>
    <main>${cuerpo}</main>
  </div>
</body>
</html>`;

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, 'index.html'), html, 'utf8');
console.log(`Documentación generada en ${join(SALIDA, 'index.html')}`);
console.log(`  ${catalogo.CRITERIOS.length} criterios · ${totalVideos} videos · ${totalCapturas} capturas · ${totalFuentes} fuentes`);
