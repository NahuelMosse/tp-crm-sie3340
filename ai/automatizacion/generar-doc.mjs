#!/usr/bin/env node
/**
 * Genera la documentación HTML de las pruebas.
 *
 *   node generar-doc.mjs
 *
 * Lee la evidencia de ai/pruebas/ y arma humanos/documentacion/index.html
 * con todas las pruebas indexadas: video, capturas, qué se midió y resultado.
 */
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = process.argv[2] ?? AQUI;
const EVIDENCIA = join(RAIZ, 'ai', 'pruebas');
const SALIDA = join(RAIZ, 'humanos', 'documentacion');

// ─────────────────────────────────────────────────────────────────────────────
// Catálogo: qué prueba cada caso. Se amplía a medida que se agregan tests.
// ─────────────────────────────────────────────────────────────────────────────
const HERRAMIENTAS = {
  espocrm:  { nombre: 'EspoCRM',  version: '10.0.4',  color: '#2d7ff9', tipo: 'Self-hosted · AGPL v3' },
  twenty:   { nombre: 'Twenty',   version: 'v2.37.4', color: '#7b5cff', tipo: 'Self-hosted · AGPL v3' },
  bitrix24: { nombre: 'Bitrix24', version: 'Free',    color: '#00aeef', tipo: 'SaaS · plan gratuito' },
};

const CASOS = {
  'C03-01': {
    criterio: 'Criterio 3 — Navegabilidad',
    titulo: 'Clicks y tiempo hasta crear un contacto',
    pregunta: '¿Cuántos clicks y cuántos segundos hace falta para cargar un contacto desde cero?',
    resultados: {
      espocrm: { ok: true, dato: '4 clicks · 10,0 s', nota: 'Login en 5,6 s. Formulario con nombre y apellido separados.' },
    },
  },
  'C04-06': {
    criterio: 'Criterio 4 — Idioma de la interfaz',
    titulo: 'La interfaz está en español',
    pregunta: '¿Traduce solo los botones o también los nombres del modelo de datos?',
    resultados: {
      espocrm:  { ok: true,  dato: 'Español completo', nota: 'Traduce el modelo: Cuentas, Contactos, Posibles clientes, Oportunidades. 36 idiomas de fábrica.' },
      twenty:   { ok: false, dato: 'Parcial',          nota: 'Traduce los controles (Filtro, Ordenar, Opciones) pero deja el modelo en inglés: Companies, People, Opportunities, Name, Emails.' },
      bitrix24: { ok: true,  dato: 'Español completo', nota: 'Negociaciones, Clientes, Ventas, Analítica. Cero palabras en inglés detectadas.' },
    },
  },
  'limites': {
    criterio: 'Criterio E5 — Rendimiento con volumen',
    titulo: 'Límites reales del plan Free',
    pregunta: '¿Qué topes tiene el plan gratuito y dónde aprieta?',
    resultados: {
      bitrix24: { ok: false, dato: 'Se borra a los 50 días', nota: 'El portal se ELIMINA si no se inicia sesión en 50 días. No lo suspende: lo borra con los datos adentro.' },
    },
  },
  'premium': {
    criterio: 'Funciones de pago',
    titulo: 'Qué queda detrás del paywall',
    pregunta: '¿Qué funciones no están disponibles en la versión gratuita?',
    resultados: {
      espocrm:  { ok: false, dato: 'Reportes: $395', nota: 'El módulo de reportes es del Advanced Pack, pago único por instancia.' },
      twenty:   { ok: true,  dato: 'Sin paywall',    nota: '/settings/billing no existe. En self-hosted no hay funciones retenidas.' },
      bitrix24: { ok: false, dato: 'Automatización', nota: 'Al abrir Reglas de automatización aparece "Suscripción / Mejore su plan".' },
    },
  },
  'planes':   { criterio: 'Planes de pago', titulo: 'Precios del portal', pregunta: '¿Qué planes ofrece y a qué precio?', resultados: {} },
  'sesion':   { criterio: 'Automatización', titulo: 'Sesión guardada', pregunta: '¿Se puede entrar sin login ni captcha?', resultados: { bitrix24: { ok: true, dato: '9,7 s sin login', nota: 'Con storageState entra directo. El login manual se hace una sola vez.' } } },
  'usuarios': { criterio: 'Criterio 5 — Usuarios', titulo: 'Usuarios del portal', pregunta: '¿Cuántos usuarios permite el plan?', resultados: {} },
};

// ─────────────────────────────────────────────────────────────────────────────

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function clasificar(archivo) {
  const herr = Object.keys(HERRAMIENTAS).find(h => archivo.toLowerCase().startsWith(h)) ?? 'otros';
  const mCaso = archivo.match(/C\d{2}-\d{2}/);
  let caso = mCaso ? mCaso[0] : Object.keys(CASOS).find(k => !k.startsWith('C') && archivo.includes(k)) ?? 'varios';
  const narrado = /narrado/i.test(archivo);
  const video = archivo.endsWith('.webm');
  const paso = (archivo.match(/-([a-e])-/) ?? [])[1] ?? '';
  return { herr, caso, narrado, video, paso };
}

const archivos = existsSync(EVIDENCIA)
  ? readdirSync(EVIDENCIA).filter(f => /\.(png|webm)$/i.test(f))
  : [];

// agrupar: herramienta -> caso -> archivos
const arbol = {};
for (const f of archivos) {
  const c = clasificar(f);
  ((arbol[c.herr] ??= {})[c.caso] ??= []).push({ archivo: f, ...c });
}
for (const h of Object.values(arbol))
  for (const lista of Object.values(h))
    lista.sort((a, b) => (b.video - a.video) || a.paso.localeCompare(b.paso) || a.archivo.localeCompare(b.archivo));

const totalPruebas = Object.values(arbol).reduce((n, h) => n + Object.keys(h).length, 0);
const totalVideos = archivos.filter(f => f.endsWith('.webm')).length;
const totalCapturas = archivos.length - totalVideos;

// ── índice lateral ───────────────────────────────────────────────────────────
let nav = '';
for (const [hid, casos] of Object.entries(arbol)) {
  const H = HERRAMIENTAS[hid] ?? { nombre: 'Otros', color: '#888', version: '', tipo: '' };
  nav += `<div class="nav-grupo"><div class="nav-h" style="--c:${H.color}">${esc(H.nombre)}</div>`;
  for (const caso of Object.keys(casos)) {
    const C = CASOS[caso] ?? { titulo: 'Capturas sueltas', criterio: '' };
    nav += `<a href="#${hid}-${caso}"><span class="cid">${esc(caso)}</span>${esc(C.titulo)}</a>`;
  }
  nav += `</div>`;
}

// ── cuerpo ───────────────────────────────────────────────────────────────────
let cuerpo = '';
for (const [hid, casos] of Object.entries(arbol)) {
  const H = HERRAMIENTAS[hid] ?? { nombre: 'Otros', version: '', color: '#888', tipo: '' };
  cuerpo += `<section class="herr" style="--c:${H.color}">
    <h2><span class="punto"></span>${esc(H.nombre)} <small>${esc(H.version)}</small></h2>
    <p class="tipo">${esc(H.tipo)}</p>`;

  for (const [caso, lista] of Object.entries(casos)) {
    const C = CASOS[caso] ?? { titulo: 'Capturas sueltas', criterio: 'Sin clasificar', pregunta: '', resultados: {} };
    const R = C.resultados?.[hid];
    cuerpo += `<article class="caso" id="${hid}-${caso}">
      <header>
        <div class="badge">${esc(caso)}</div>
        <div><h3>${esc(C.titulo)}</h3><div class="crit">${esc(C.criterio)}</div></div>
        ${R ? `<div class="veredicto ${R.ok ? 'ok' : 'no'}">${R.ok ? '✓' : '!'} ${esc(R.dato)}</div>` : ''}
      </header>
      ${C.pregunta ? `<p class="preg"><b>Qué se probó:</b> ${esc(C.pregunta)}</p>` : ''}
      ${R?.nota ? `<p class="hallazgo">${esc(R.nota)}</p>` : ''}`;

    const videos = lista.filter(x => x.video);
    const imgs = lista.filter(x => !x.video);

    if (videos.length) {
      cuerpo += `<div class="videos">`;
      for (const v of videos) {
        cuerpo += `<figure class="video">
          <video controls preload="metadata" src="../../ai/pruebas/${encodeURI(v.archivo)}"></video>
          <figcaption>Video de la prueba${v.narrado ? ' · versión narrada' : ''}</figcaption>
        </figure>`;
      }
      cuerpo += `</div>`;
    }

    if (imgs.length) {
      cuerpo += `<div class="galeria">`;
      for (const i of imgs) {
        const et = i.narrado ? 'con carteles' : (i.paso ? `paso ${i.paso.toUpperCase()}` : 'captura');
        cuerpo += `<figure>
          <a href="../../ai/pruebas/${encodeURI(i.archivo)}" target="_blank">
            <img loading="lazy" src="../../ai/pruebas/${encodeURI(i.archivo)}" alt="${esc(i.archivo)}">
          </a>
          <figcaption>${esc(et)}</figcaption>
        </figure>`;
      }
      cuerpo += `</div>`;
    }
    cuerpo += `</article>`;
  }
  cuerpo += `</section>`;
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pruebas · TP SIE 3340 — Evaluación de CRM</title>
<style>
  :root {
    --bg: #0f1720; --panel: #16212e; --linea: #24344a;
    --txt: #e8eef6; --tenue: #93a6bd; --ok: #3ecf8e; --no: #ff6b6b; --acc: #ffd166;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--txt);
         font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  a { color: inherit; }

  .top { padding: 40px 32px 26px; border-bottom: 1px solid var(--linea);
         background: linear-gradient(180deg, #16212e, #0f1720); }
  .top h1 { margin: 0 0 6px; font-size: 30px; letter-spacing: -.4px; }
  .top p { margin: 0; color: var(--tenue); }
  .cifras { display: flex; gap: 28px; margin-top: 22px; flex-wrap: wrap; }
  .cifra b { display: block; font-size: 26px; color: var(--acc); }
  .cifra span { font-size: 13px; color: var(--tenue); text-transform: uppercase; letter-spacing: .6px; }

  .layout { display: grid; grid-template-columns: 290px 1fr; align-items: start; }
  nav { position: sticky; top: 0; max-height: 100vh; overflow-y: auto;
        padding: 26px 18px; border-right: 1px solid var(--linea); }
  .nav-grupo { margin-bottom: 22px; }
  .nav-h { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .8px;
           color: var(--c); padding-bottom: 8px; border-bottom: 1px solid var(--linea); margin-bottom: 8px; }
  nav a { display: flex; gap: 9px; padding: 7px 9px; border-radius: 7px; text-decoration: none;
          font-size: 14px; color: var(--tenue); }
  nav a:hover { background: var(--panel); color: var(--txt); }
  .cid { font-family: ui-monospace, monospace; font-size: 11px; color: var(--acc);
         background: rgba(255,209,102,.1); padding: 1px 6px; border-radius: 4px; height: fit-content; }

  main { padding: 26px 32px 80px; max-width: 1100px; }
  .herr { margin-bottom: 52px; }
  .herr h2 { display: flex; align-items: center; gap: 11px; font-size: 24px; margin: 0 0 3px; }
  .herr h2 small { color: var(--tenue); font-weight: 400; font-size: 15px; }
  .punto { width: 12px; height: 12px; border-radius: 50%; background: var(--c); }
  .tipo { margin: 0 0 20px 23px; color: var(--tenue); font-size: 14px; }

  .caso { background: var(--panel); border: 1px solid var(--linea); border-radius: 12px;
          padding: 22px; margin-bottom: 20px; scroll-margin-top: 16px; }
  .caso header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .badge { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700;
           background: var(--c); color: #08111b; padding: 5px 10px; border-radius: 6px; white-space: nowrap; }
  .caso h3 { margin: 0; font-size: 18px; }
  .crit { color: var(--tenue); font-size: 13px; margin-top: 2px; }
  .veredicto { margin-left: auto; font-size: 13px; font-weight: 700; padding: 6px 12px;
               border-radius: 20px; white-space: nowrap; }
  .veredicto.ok { background: rgba(62,207,142,.14); color: var(--ok); }
  .veredicto.no { background: rgba(255,107,107,.14); color: var(--no); }
  .preg { color: var(--tenue); font-size: 14.5px; margin: 0 0 10px; }
  .hallazgo { background: rgba(255,209,102,.08); border-left: 3px solid var(--acc);
              padding: 11px 15px; border-radius: 0 7px 7px 0; font-size: 14.5px; margin: 0 0 16px; }

  .videos { margin-bottom: 16px; }
  .video video { width: 100%; max-height: 460px; border-radius: 9px; background: #000; display: block; }
  figure { margin: 0; }
  figcaption { color: var(--tenue); font-size: 12.5px; margin-top: 6px; text-align: center; }

  .galeria { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .galeria img { width: 100%; border-radius: 7px; border: 1px solid var(--linea);
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
    <h1>Pruebas sobre los sistemas CRM</h1>
    <p>TP SIE 3340 · Sistemas de Información de la Empresa · Universidad de Morón</p>
    <div class="cifras">
      <div class="cifra"><b>3</b><span>Herramientas</span></div>
      <div class="cifra"><b>${totalPruebas}</b><span>Pruebas</span></div>
      <div class="cifra"><b>${totalVideos}</b><span>Videos</span></div>
      <div class="cifra"><b>${totalCapturas}</b><span>Capturas</span></div>
      <div class="cifra"><b>${new Date().toLocaleDateString('es-AR')}</b><span>Actualizado</span></div>
    </div>
  </div>

  <div class="layout">
    <nav>${nav}</nav>
    <main>${cuerpo || '<p>Todavía no hay evidencia generada.</p>'}</main>
  </div>
</body>
</html>`;

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, 'index.html'), html, 'utf8');
console.log(`Documentación generada: ${join(SALIDA, 'index.html')}`);
console.log(`  ${totalPruebas} pruebas · ${totalVideos} videos · ${totalCapturas} capturas`);
