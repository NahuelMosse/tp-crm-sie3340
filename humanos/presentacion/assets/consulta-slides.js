// Writes the consultation deck from window.DATA: for each group its matrix, then for each criterion a summary of the
// three platforms and one slide per platform with the whole reason and the video of its test.
(function () {
  const D = window.DATA;
  const P = D.platforms;
  const byId = Object.fromEntries(D.criteria.map((c) => [c.id, c]));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const pct = (x) => (x === null ? '—' : `${x.toFixed(1).replace('.', ',')} %`);
  const NAMES = ['No cumple', 'Cumple con reparo', 'Cumple'];
  const sign = (v) => (v === null || v === undefined ? '' : `<span class="v v${v}" role="img" aria-label="${NAMES[v]}"></span>`);
  const up = (x) => (x?.plans.length ? '<span class="up" aria-label="un plan pago lo mejoraría">↑</span>' : '');
  const kind = (c) => (c.functional ? 'Funcional' : c.type === 'tecnica' ? 'Técnico' : 'Operativo');
  const partName = (p) => (p === 'A' ? 'Requerimientos solicitados' : 'Requerimientos deseables');
  const needLabel = (c) => (c.group === 'B.2' ? 'Por qué importa' : 'Qué resuelve');

  const S = [];

  S.push({ key: 'inicio', cls: '', html: `
    <div class="axis" style="top:330px"><h1 data-in style="font-size:120px">Consulta por criterio</h1></div>
    <p class="side lead" style="top:360px;color:var(--ink)" data-in>Cada criterio, con la justificación completa de su valor y el video de la prueba.</p>
    <div class="axis" style="top:640px"><p class="body" data-in>Por cada grupo, su matriz. Por cada criterio, un resumen de las tres plataformas y una diapositiva por plataforma.</p>
      <p class="body muted" data-in style="margin-top:28px">${D.criteria.length} criterios · TOTAL_SLIDES diapositivas · con teclado, se tipea el código (por ejemplo 9.1 o B26) y Enter para ir a él.</p></div>` });

  S.push({ key: 'lectura', cls: '', html: `
    <div class="axis" style="top:120px"><h2 data-in>Cómo leer cada criterio</h2></div>
    <div class="axis" style="top:330px">
      <table style="width:100%" data-in><tbody>
        <tr><td style="width:90px;font-size:44px">${sign(2)}</td><td style="width:340px;font-weight:500">Cumple</td><td>Viene listo o se configura una vez desde las pantallas.</td></tr>
        <tr><td style="font-size:44px">${sign(1)}</td><td style="font-weight:500">Cumple con reparo</td><td>Exige código, una tarea manual en cada uso, o resuelve una parte.</td></tr>
        <tr><td style="font-size:44px">${sign(0)}</td><td style="font-weight:500">No cumple</td><td>La versión evaluada no lo resuelve.</td></tr>
        <tr><td style="font-size:44px;font-weight:600">↑</td><td style="font-weight:500">Un plan pago lo mejoraría</td><td>Se informa con su precio y no suma.</td></tr>
      </tbody></table>
      <p class="body" style="margin-top:40px;max-width:none" data-in>Subtotal de un grupo: puntos obtenidos sobre el máximo, con dos puntos por criterio.</p>
    </div>` });

  for (const g of D.groups) {
    // The group's matrix
    const types = [...new Set(g.criteria.map((id) => byId[id].type))];
    const row = (id) => { const c = byId[id]; return `<tr><td class="code">${id}</td><td>${esc(c.name)}</td>${P.map((p) => `<td class="c"><span class="with-up">${sign(c.platforms[p.key]?.value)}${up(c.platforms[p.key])}</span></td>`).join('')}</tr>`; };
    const sub = (label, fn, cls = 'sub') => `<tr class="${cls}"><td></td><td>${label}</td>${P.map((p) => { const s = fn(p.key); return `<td class="c">${s.got}/${s.max} · ${pct(s.pct)}</td>`; }).join('')}</tr>`;
    // A group with technical and operational criteria gets one slide per type; the last one closes with the group's subtotal
    const pages = types.length > 1
      ? types.map((t) => ({ suffix: t === 'tecnica' ? 'técnicos' : 'operativos', ids: g.criteria.filter((id) => byId[id].type === t),
          sub: sub(t === 'tecnica' ? 'Subtotal de los técnicos' : 'Subtotal de los operativos', (k) => D.subtotals[g.id][k].byType[t]) }))
      : [{ suffix: '', ids: g.criteria, sub: '' }];
    pages.forEach((pg, n) => {
      const last = n === pages.length - 1;
      S.push({ key: n === 0 ? `grupo-${g.id}` : `grupo-${g.id}-${n + 1}`, cls: '', html: `
        <div style="position:absolute;left:96px;right:96px;top:80px"><p class="small muted" data-in>${partName(g.part)}${pg.suffix ? ` · criterios ${pg.suffix}` : ''}</p><h2 data-in style="font-size:72px;margin-top:10px">${g.id} ${esc(g.name)}</h2></div>
        <div style="position:absolute;left:96px;right:96px;top:290px" data-in>
          <table class="mx" style="width:100%"><thead><tr><th>Código</th><th>Criterio</th>${P.map((p) => `<th class="c">${p.name}</th>`).join('')}</tr></thead>
          <tbody>${pg.ids.map(row).join('')}${pg.sub}${last ? sub('Subtotal del grupo', (k) => D.subtotals[g.id][k], 'total') : ''}</tbody></table>
        </div>` });
    });

    for (const id of g.criteria) {
      const c = byId[id];
      const figure = c.figure?.lead ? `<p class="small muted" style="margin-top:18px">${esc(c.figure.lead)}</p>` : '';
      // Summary of the three platforms
      S.push({ key: c.id, cls: '', html: `
        <div style="position:absolute;left:96px;right:96px;top:76px">
          <p class="small muted" data-in>${g.id} ${esc(g.name)} · ${kind(c)} · ${c.part === 'A' ? 'Solicitado' : 'Deseable'}</p>
          <h2 data-in style="font-size:76px;margin-top:12px">${c.id} ${esc(c.name)}</h2>
        </div>
        <div style="position:absolute;left:96px;right:96px;top:290px;height:290px;display:grid;grid-template-columns:1fr 1fr;gap:64px" data-in>
          <div data-fit style="font-size:28px;line-height:1.45;overflow:hidden"><p class="small muted">${needLabel(c)}</p><p style="margin-top:8px">${esc(c.need)}</p>${figure}</div>
          <div data-fit style="font-size:28px;line-height:1.45;overflow:hidden"><p class="small muted">Procedimiento de verificación</p><p style="margin-top:8px">${esc(c.procedure)}</p></div>
        </div>
        <div style="position:absolute;left:96px;right:96px;top:620px;bottom:110px;display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
          ${P.map((p) => { const x = c.platforms[p.key]; return `<div data-in style="background:var(--surface);padding:28px 32px;display:flex;flex-direction:column;min-height:0">
            <p style="font-family:var(--display);font-size:46px;line-height:1">${p.name}</p>
            <p style="font-size:28px;font-weight:500;margin-top:16px;display:flex;align-items:center;gap:14px"><span style="font-size:38px;display:inline-flex">${sign(x?.value)}</span>${esc(x?.label ?? 'Sin evaluar')}${up(x)}</p>
            <div data-fit style="font-size:24px;line-height:1.45;margin-top:12px;flex:1;overflow:hidden;color:var(--muted)">${esc(x?.summary ?? '')}</div></div>`; }).join('')}
        </div>` });

      // One slide per platform, with the whole reason and the video
      for (const p of P) {
        const x = c.platforms[p.key];
        if (!x) continue;
        const shot = x.captures[0] ?? x.sources.find((s) => s.capture)?.capture ?? null;
        const media = x.video
          ? `<video data-src="${D.paths.videos}${esc(x.video)}" muted loop playsinline preload="none" aria-label="Video de la prueba de ${c.id} en ${p.name}" style="width:100%;height:100%;object-fit:contain;background:#111;display:block"></video>`
          : shot ? `<img src="${D.paths.captures}${esc(shot)}" alt="Captura de ${c.id} en ${p.name}" style="width:100%;height:100%;object-fit:contain;object-position:left top;background:var(--surface);display:block">`
          : `<div style="width:100%;height:100%;background:var(--surface);display:flex;align-items:center;justify-content:center;padding:48px"><p class="body muted">Sin video ni captura: el valor se respalda en las fuentes citadas.</p></div>`;
        const mediaNote = x.video ? 'Video de la prueba.' : shot ? (x.captures.length ? 'Captura de la prueba.' : 'Captura de la fuente citada.') : '';
        const sect = (h, t) => (t ? `<p class="h">${h}</p><p>${esc(t)}</p>` : '');
        const plans = x.plans.map((y) => `<p class="h">Con ${esc(y.plan)} (${esc(y.price)}), quedaría ${NAMES[y.value].toLowerCase()} · no suma</p><p>${esc(y.why)}</p>`).join('');
        const sources = x.sources.length ? `<p class="h">Fuente${x.sources.length > 1 ? 's' : ''} citada${x.sources.length > 1 ? 's' : ''}</p>${x.sources.slice(0, 3).map((s) => `<p><i>«${esc(s.quote)}»</i> <span class="muted">${esc(s.url.replace(/^https?:\/\//, ''))}, ${esc(s.date)}</span></p>`).join('')}` : '';
        S.push({ key: `${c.id}-${p.key}`, cls: '', html: `
          <div style="position:absolute;left:96px;right:96px;top:64px;display:flex;justify-content:space-between;align-items:flex-end;gap:48px">
            <div><p class="small muted" data-in>${c.id} ${esc(c.name)}</p><p data-in style="font-family:var(--display);font-size:64px;line-height:1;margin-top:10px">${p.name}</p></div>
            <p data-in style="font-size:34px;font-weight:500;display:flex;align-items:center;gap:16px;white-space:nowrap"><span style="font-size:44px;display:inline-flex">${sign(x.value)}</span>${esc(x.label)}${up(x)}</p>
          </div>
          <figure style="position:absolute;left:96px;top:220px;width:${x.video ? 980 : 700}px;height:640px;margin:0" data-in>${media}
            <figcaption class="caption">${mediaNote}</figcaption></figure>
          <div class="reason" data-fit data-in style="position:absolute;left:${x.video ? 1124 : 844}px;right:96px;top:220px;bottom:110px;overflow:hidden;font-size:24px;line-height:1.45">
            ${sect('Cómo lo hace', x.how)}${sect('Características', x.features)}${sect('Justificación', x.why)}${sect('Medición', x.measure)}
          </div>` });
        // What a paid plan would change and the cited sources get a slide of their own, so the text stays legible
        if (plans || sources) S.push({ key: `${c.id}-${p.key}-fuentes`, cls: '', html: `
          <div style="position:absolute;left:96px;right:96px;top:64px;display:flex;justify-content:space-between;align-items:flex-end;gap:48px">
            <div><p class="small muted" data-in>${c.id} ${esc(c.name)}</p><p data-in style="font-family:var(--display);font-size:64px;line-height:1;margin-top:10px">${p.name} · ${plans && sources ? 'plan pago y fuentes' : plans ? 'con un plan pago' : 'fuentes'}</p></div>
            <p data-in style="font-size:34px;font-weight:500;display:flex;align-items:center;gap:16px;white-space:nowrap"><span style="font-size:44px;display:inline-flex">${sign(x.value)}</span>${esc(x.label)}${up(x)}</p>
          </div>
          <div class="reason" data-fit data-in style="position:absolute;left:96px;right:96px;top:220px;bottom:110px;overflow:hidden;font-size:26px;line-height:1.45;column-count:${(plans ? 1 : 0) + x.sources.length > 1 ? 2 : 1};column-gap:64px">
            ${plans}${sources}
          </div>` });
      }
    }
  }

  const stage = document.querySelector('.stage');
  stage.innerHTML = S.map((s, i) => `<section class="slide ${s.cls}" data-key="${s.key}" aria-label="Diapositiva ${i + 1}">${s.html}<p class="foot">Consulta por criterio · ${i + 1} / ${S.length}</p></section>`).join('').replace('TOTAL_SLIDES', S.length);
})();
