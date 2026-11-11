// Writes the visual deck from window.DATA: one idea per slide, drawn from the data and from line drawings of the
// subject. Everything on a slide animates in at once on entry, and one press moves to the next slide.
(function () {
  const D = window.DATA;
  const P = D.platforms;
  const C = Object.fromEntries(D.criteria.map((c) => [c.id, c]));
  const num = (x, d = 1) => x.toFixed(d).replace('.', ',');
  const link = (id) => `<a href="criterios.html#${id}">${id}</a>`;
  const mask = (lines) => lines.map((l, i) => `<span class="mask" style="--m:${i}"><span>${l}</span></span>`).join('');
  const NAMES = ['No cumple', 'Cumple con reparo', 'Cumple'];
  const sign = (v, cls = '') => `<span class="v v${v} ${cls}" role="img" aria-label="${NAMES[v]}"></span>`;
  const colour = (k) => `var(--${k})`;
  const aW = Math.round(D.weights.A * 100), bW = Math.round(D.weights.B * 100);
  const nA = D.criteria.filter((c) => c.part === 'A').length, nB = D.criteria.length - nA;
  const gap = Math.abs(D.totals.twenty - D.totals.espocrm);
  const plan = (key, version) => D.plans[key].find((x) => x.version.startsWith(version));
  const price = (key, version) => plan(key, version).price.replace(', con pago anual', '').replace(', hasta 100 usuarios', '');
  const diff = D.criteria.filter((c) => c.platforms.espocrm.value !== c.platforms.twenty.value);
  const forEspo = diff.filter((c) => c.platforms.espocrm.value > c.platforms.twenty.value);
  const forTwenty = diff.filter((c) => c.platforms.twenty.value > c.platforms.espocrm.value);
  const tasks = (k) => (C['A.12.5'].platforms[k].measure ?? '').match(/(\d+) de (\d+)/).slice(1).map(Number);
  const since = (k) => Number((C['B.2.10'].platforms[k].summary.match(/desde (?:\w+ de )?(\d{4})/) ?? [])[1]);
  const keys = `<p style="position:absolute;right:96px;top:104px">${P.map((p) => `<span class="legend-key"><i style="background:${colour(p.key)}"></i>${p.name}</span>`).join('')}</p>`;
  const closing = (text, extra = '') => `<p data-in class="closing" style="${extra}">${text}</p>`;

  // Icons from Lucide (assets/icons.js), drawn inline in the ink of the page; each traces its strokes on entry
  const ICON = { server: 'server', cloud: 'cloud', folders: 'folder-lock', flow: 'workflow', search: 'search-x', calendar: 'calendar-x', globe: 'globe', scale: 'scale', fork: 'split', camera: 'video',
    lead: 'user-plus', sale: 'file-pen-line', care: 'headset', list: 'list-checks', test: 'monitor-play', film: 'file-video', check: 'circle-check', offline: 'wifi-off', backup: 'database-backup',
    phone: 'smartphone', chat: 'message-circle', bot: 'bot', lang: 'languages', update: 'refresh-cw', users: 'users', hash: 'hash', admin: 'user-cog', ban: 'ban', layers: 'layers' };
  const art = (name, size, style = '') => `<svg class="art" viewBox="0 0 24 24" width="${size}" height="${size}" style="${style}" aria-hidden="true">${window.ICONS[ICON[name]].replace(/<(path|rect|circle|line|polyline|polygon|ellipse)/g, '<$1 pathLength="1"')}</svg>`;

  // A row of criteria with the sign of each platform, large enough to read from the back of the room
  const signGrid = (rows, top = 330) => `<div style="position:absolute;left:96px;right:96px;top:${top}px">
      <div style="display:grid;grid-template-columns:1fr repeat(3,230px);font-size:26px;color:var(--muted);padding-bottom:16px"><span></span>${P.map((p) => `<span style="text-align:center;color:${colour(p.key)}">${p.name}</span>`).join('')}</div>
      ${rows.map(([id, name], r) => `<div style="display:grid;grid-template-columns:1fr repeat(3,230px);align-items:center;padding:20px 0;background:${r % 2 ? 'transparent' : 'var(--surface)'}">
        <span style="font-size:34px;padding-left:24px">${name} <span class="muted" style="font-size:22px">${link(id)}</span></span>
        ${P.map((p, k) => `<span class="dot" style="background:none;border:0;width:auto;height:auto;justify-self:center;font-size:52px;line-height:1;--d:${(r * 3 + k) * 6}"><span class="with-up">${sign(C[id].platforms[p.key].value)}${C[id].platforms[p.key].plans.length ? '<span class="up">↑</span>' : ''}</span></span>`).join('')}</div>`).join('')}
    </div>`;
  const iconCols = (items, top = 330) => `<div style="position:absolute;left:96px;right:96px;top:${top}px;display:grid;grid-template-columns:repeat(${items.length},1fr);gap:56px">
      ${items.map(([icon, title, text]) => `<div data-in>${art(icon, 120)}<p class="big" style="font-size:64px;margin-top:28px">${title}</p><p style="font-size:30px;line-height:1.35;margin-top:16px">${text}</p></div>`).join('')}</div>`;

  const S = [];

  // 1 · Cover: the 258 verdicts of the report, one mark per criterion and platform, as on the report's cover
  S.push({ html: `
    <div class="auto" style="position:absolute;right:96px;top:96px;display:grid;grid-template-columns:repeat(3,auto);gap:40px" aria-hidden="true">${P.map((p, i) => `<div class="dots" style="grid-template-columns:repeat(10,16px);gap:7px">${D.criteria.map((c, k) => { const v = c.platforms[p.key]?.value; return `<i class="dot${v === 1 ? ' half' : v === 0 ? ' ring' : ''}" style="width:16px;height:16px;--d:${i * 30 + k}"></i>`; }).join('')}</div>`).join('')}</div>
    <p data-in class="muted" style="position:absolute;right:96px;top:332px;display:flex;align-items:center;gap:28px;font-size:18px">${[['', 'cumple'], [' half', 'cumple con reparo'], [' ring', 'no cumple']].map(([cls, label]) => `<span style="display:inline-flex;align-items:center;gap:9px;color:var(--ink)"><i class="dot${cls}" style="width:14px;height:14px;transform:none;animation:none"></i>${label}</span>`).join('')}<span>Cada marca es uno de los ${D.criteria.length} criterios.</span></p>
    <div style="position:absolute;left:96px;right:96px;top:420px"><h1 class="big" style="font-size:136px;white-space:nowrap">${mask(['Selección de un sistema CRM', 'para una compañía de seguros'])}</h1></div>
    <p data-in style="position:absolute;left:96px;top:820px;font-size:30px">${D.meta.team}</p>
    <p data-in class="muted" style="position:absolute;left:96px;top:870px;font-size:26px">${D.meta.institution} · ${D.meta.presented}</p>`,
    notes: '<p>Presentamos la evaluación de tres sistemas de gestión de clientes para una compañía de seguros, y cuál recomendamos.</p>' });

  // 2 · The need: the three moments of the relationship with the insured
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Acompañar al asegurado', 'de punta a punta'])}</h2></div>
    ${iconCols([['lead', 'Preventa', 'Registrar al interesado, segmentar la cartera y llegarle con campañas.'], ['sale', 'Venta', 'Seguir la oportunidad, emitir la póliza y cobrar la prima.'], ['care', 'Postventa', 'Atender reclamos, renovar y no perder la historia del cliente.']], 420)}`,
    notes: '<p>El encargo fue recomendar un sistema de gestión de clientes para una compañía de seguros. Un CRM tiene que acompañar las tres etapas de la relación con el asegurado: la preventa, donde se capta al interesado; la venta, que termina en la póliza emitida y cobrada; y la postventa, que es la atención, los reclamos y la renovación.</p>' });

  // 3 · The topics the client asked for, as tiles
  const groupsAll = D.groups.filter((g) => g.part === 'A');
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Doce temas pedidos'])}</h2>
      <p class="note" data-in style="margin-top:20px">Los veinte requerimientos del cliente y el marco técnico, ordenados en grupos.</p></div>
    <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
      ${groupsAll.map((g) => `<div data-in style="background:var(--surface);padding:26px 28px;min-height:150px"><p class="note" style="font-size:22px">${g.id}</p><p style="font-size:30px;line-height:1.2;margin-top:10px">${g.name}</p></div>`).join('')}
    </div>
    ${closing('Más dos grupos deseables: lo que suma por encima del pedido y lo que exige el negocio asegurador.', 'left:96px;bottom:70px;font-size:30px')}`,
    notes: '<p>Los veinte requerimientos del cliente y los puntos del marco técnico se ordenaron en doce temas: la cartera de pólizas, la venta, los productores, el marketing, los reclamos, la ficha del asegurado, el intercambio de datos, la parametrización, el control de acceso, los informes, la emisión y la cobranza, y las condiciones técnicas del producto. A esos se suman dos grupos deseables, que no se pidieron pero que el negocio asegurador necesita.</p>' });

  // 4 · Platforms: how each one runs, and since when
  const y0 = 2010, y1 = 2027, x = (y) => ((y - y0) / (y1 - y0)) * 100;
  const kind = { espocrm: ['server', 'Código abierto, en un servidor propio'], twenty: ['server', 'Código abierto, en un servidor propio'], bitrix24: ['cloud', 'En la nube, sin instalar nada'] };
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:110px">${mask(['Tres plataformas'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:290px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      ${P.map((p) => `<div data-in>${art(kind[p.key][0], 150, `color:${colour(p.key)}`)}<p class="big" style="font-size:88px;margin-top:20px">${p.name}</p><p class="note" style="margin-top:14px">${kind[p.key][1]}</p></div>`).join('')}
    </div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:800px;height:120px">
      <div class="track"><div class="bar" style="--v:1;background:var(--surface-2)"></div></div>
      ${P.map((p, i) => `<div class="pin" style="left:${x(since(p.key))}%;--d:${i + 2}"><i style="background:${colour(p.key)}"></i><span class="num" style="font-size:30px;font-weight:500">${since(p.key)}</span></div>`).join('')}
      <span class="note" style="position:absolute;right:0;top:-48px">desde cuándo existe cada una</span>
    </div>
    ${closing('Twenty es el más nuevo: evoluciona rápido y obliga a actualizar seguido.', 'left:96px;bottom:70px')}`,
    notes: '<p>EspoCRM y Twenty son de código abierto y se instalan en un servidor propio; Bitrix24 es un servicio en la nube. La línea muestra desde cuándo el fabricante sostiene cada producto: Bitrix24 y EspoCRM llevan más de diez años; Twenty existe desde 2022.</p>' });

  // 5 · What was evaluated: only the free version
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Solo lo que viene gratis'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      ${[['EspoCRM', '10.0.4', 'Community, sin extensiones pagas'], ['Twenty', '2.37.4', 'Autoalojado, sin el plan Organization'], ['Bitrix24', 'Free', 'En la nube; el fabricante la actualiza sin número de versión']].map(([n, v, t], i) => `<div data-in style="border-top:8px solid ${colour(P[i].key)};padding-top:28px"><p class="big" style="font-size:72px">${n}</p><p class="big num" style="font-size:96px;margin-top:18px;color:${colour(P[i].key)}">${v}</p><p style="font-size:30px;margin-top:18px;line-height:1.3">${t}</p></div>`).join('')}
    </div>
    ${closing('Lo que mejoraría un plan pago se marca con <b>↑</b>, con su precio, y no suma puntos.', 'left:96px;bottom:110px')}`,
    notes: '<p>Se evaluó solo lo que trae cada versión gratuita: EspoCRM Community sin sus extensiones pagas, Twenty instalado en un servidor propio y Bitrix24 en su plan gratuito. Si una función existe solo pagando, para la evaluación no está. Igual lo registramos: cada vez que un plan pago mejoraría un criterio, se informa el plan y su precio, pero no suma.</p>' });

  // 6 · The catalog as dots
  const dots = D.criteria.map((c, i) => `<i class="dot${c.part === 'B' ? ' hollow' : ''}" style="--d:${i}"></i>`).join('');
  S.push({ html: `
    <div style="position:absolute;left:96px;top:120px"><h2 class="big" style="font-size:110px">${mask(['Lo que se evaluó'])}</h2></div>
    <p style="position:absolute;left:96px;top:330px"><span class="big num" style="font-size:300px" data-count="${D.criteria.length}">0</span></p>
    <p style="position:absolute;left:96px;top:640px;font-size:36px">criterios verificables</p>
    <div class="dots auto" style="position:absolute;left:820px;top:300px;grid-template-columns:repeat(18,34px)">${dots}</div>
    <p data-in style="position:absolute;left:820px;top:640px;font-size:32px"><span class="legend-key"><i style="background:var(--ink)"></i>${nA} solicitados</span><span class="legend-key"><i style="border:3px solid var(--ink)"></i>${nB} deseables</span></p>
    ${closing('Las tres, cada una en su versión gratuita.', 'left:820px;top:740px')}`,
    notes: `<p>Los veinte requerimientos del cliente y el marco técnico se tradujeron en ${D.criteria.length} criterios que se pueden comprobar. Cada punto es un criterio: los llenos salen de lo solicitado, los vacíos son deseables del negocio asegurador.</p>` });

  // 7 · How each criterion was tested, as a flow
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Cómo se probó cada uno'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:380px;display:grid;grid-template-columns:repeat(4,1fr);gap:40px">
      ${[['list', 'Un procedimiento', 'escrito antes de probar, igual para las tres'], ['test', 'Se ejecuta', 'en el sistema, desde sus pantallas'], ['film', 'Queda grabado', 'en video y capturas'], ['check', 'Un veredicto', 'con su justificación y su respaldo']].map(([i, t, x]) => `<div data-in>${art(i, 110)}<p class="big" style="font-size:54px;margin-top:26px">${t}</p><p style="font-size:28px;margin-top:12px;line-height:1.35">${x}</p></div>`).join('')}
    </div>`,
    notes: '<p>Para cada criterio se escribió antes un procedimiento, el mismo para las tres plataformas. Después se ejecutó en el sistema, desde sus pantallas, y la prueba quedó grabada en video y en capturas. Con eso se decide el valor y se escribe la justificación. Así, cada veredicto se puede volver a mirar.</p>' });

  // 8 · The test portfolio, as three blocks of records
  const load = JSON.parse((C['B.2.4'].platforms.bitrix24.measure ?? '').match(/carga (\{[^}]+\})/)?.[1] ?? '{}');
  const loadTotal = Object.values(load).reduce((a, b) => a + b, 0);
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Una cartera de prueba'])}</h2></div>
    <p style="position:absolute;left:96px;top:330px"><span class="big num" style="font-size:240px" data-count="${loadTotal}">0</span></p>
    <p style="position:absolute;left:96px;top:600px;font-size:36px">registros cargados en cada sistema</p>
    <div class="auto" style="position:absolute;left:980px;right:96px;top:340px;display:grid;gap:34px">
      ${[['asegurados', load.contactos], ['pólizas', load.polizas], ['reclamos', load.reclamos]].map(([n, v], i) => `<div><div style="display:flex;justify-content:space-between;font-size:32px"><span>${n}</span><span class="num">${(v ?? 0).toLocaleString('es-AR')}</span></div>
        <div style="height:26px;background:var(--surface);margin-top:10px"><div class="bar" style="--v:${(v ?? 0) / Math.max(...Object.values(load))};--d:${i * 6};background:var(--ink)"></div></div></div>`).join('')}
    </div>
    ${closing('Unas quince veces la cartera de una compañía promedio, para cubrir su crecimiento.', 'left:96px;bottom:110px')}`,
    notes: '<p>Para que las pruebas no fueran con una base vacía, se cargó la misma cartera en los tres sistemas: cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos. Es unas quince veces la cartera de una compañía promedio, de modo que lo que se observó sobre la velocidad vale con margen para el crecimiento.</p>' });

  // 9 · How it was tested: every evaluation as a square, dark when its test is on video
  const evals = D.criteria.flatMap((c) => P.map((p) => c.platforms[p.key])).filter(Boolean);
  const withVideo = evals.filter((e) => e.video).length;
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:110px">${mask(['Cada cuadrado, una prueba'])}</h2></div>
    ${art('camera', 200, 'position:absolute;right:96px;top:96px')}
    <div class="squares auto" style="position:absolute;left:96px;top:420px;width:1060px">${evals.map((e, i) => `<i class="sq${e.video ? '' : ' doc'}" style="--d:${i}"></i>`).join('')}</div>
    <div style="position:absolute;left:1260px;right:96px;top:420px;display:grid;gap:36px">
      <div data-in><p class="big num" style="font-size:120px"><span data-count="${evals.length}">0</span></p><p class="note">evaluaciones</p></div>
      <div data-in><p class="big num" style="font-size:120px"><span data-count="${withVideo}">0</span></p><p class="note"><i class="sq" style="display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:-2px"></i>con el video de la prueba</p></div>
    </div>
    ${closing(`Lo que no se podía probar, con la documentación oficial citada textual: ${D.evidence.sources} fuentes.`, 'left:96px;bottom:110px')}`,
    notes: '<p>Cada cuadrado es una evaluación: un criterio en una plataforma. Cada uno se probó usando el sistema, y los cuadrados oscuros tienen el video de esa prueba. Lo que no se podía probar operando el sistema se respaldó con la documentación oficial, citada textual.</p>' });

  // 10 · The scale
  const scale = [[2, 'Cumple', 'viene listo o se configura'], [1, 'Con reparo', 'código, tarea manual o una parte'], [0, 'No cumple', 'la versión gratuita no lo trae']];
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:110px">${mask(['Tres valores, nada más'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      ${scale.map(([v, t, s]) => `<div data-in style="text-align:center">${sign(v, 'sign-xl')}<p class="big" style="font-size:72px;margin-top:40px">${t}</p><p class="note" style="margin-top:12px">${s}</p></div>`).join('')}
    </div>
    ${closing('Lo que agrega un plan pago se marca con <b>↑</b> y no suma.', 'left:96px;bottom:120px')}`,
    notes: '<p>Cumple cuando queda resuelto, sea porque viene listo o porque se configura una vez. Cumple con reparo cuando exige código, una tarea manual en cada uso o resuelve una parte. No cumple cuando la versión gratuita no lo trae.</p>' });

  // 11 · Weighting, first step: a criterion gives 0, 1 or 2 points, and a group is the share of its points
  const ex = D.groups.find((g) => g.id === 'A.9');
  const pts = (k) => D.subtotals[ex.id][k];
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Cada criterio vale 0, 1 o 2'])}</h2></div>
    <div style="position:absolute;left:96px;width:520px;top:330px;display:grid;gap:30px">
      ${[[2, 'Cumple', 2], [1, 'Con reparo', 1], [0, 'No cumple', 0]].map(([v, t, n]) => `<div data-in style="display:grid;grid-template-columns:90px 1fr 80px;align-items:center;font-size:36px">${sign(v, 'lg')}<span>${t}</span><span class="big num" style="font-size:72px;text-align:right">${n}</span></div>`).join('')}
    </div>
    <div data-in style="position:absolute;left:760px;right:96px;top:300px;background:var(--surface);padding:40px 44px">
      <p style="font-size:30px">Ejemplo: ${ex.id} ${ex.name}</p>
      <div style="display:grid;grid-template-columns:1fr 180px 180px;row-gap:18px;align-items:center;margin-top:28px;font-size:26px">
        <span></span>${['espocrm', 'twenty'].map((k) => `<span style="text-align:center;color:${colour(k)};font-weight:500">${P.find((p) => p.key === k).name}</span>`).join('')}
        ${ex.criteria.map((id) => `<span>${C[id].name}</span>${['espocrm', 'twenty'].map((k) => `<span style="text-align:center;font-size:44px">${sign(C[id].platforms[k].value)}</span>`).join('')}`).join('')}
        <span style="font-weight:500;padding-top:18px">Puntos del grupo</span>${['espocrm', 'twenty'].map((k) => `<span class="num" style="text-align:center;padding-top:18px"><b>${pts(k).got}</b> de ${pts(k).max}</span>`).join('')}
        <span style="font-weight:500">Porcentaje del grupo</span>${['espocrm', 'twenty'].map((k) => `<span class="big num" style="text-align:center;font-size:56px;color:${colour(k)}">${num(pts(k).pct)} %</span>`).join('')}
      </div>
    </div>`,
    notes: `<p>Así se arma el puntaje, con un ejemplo. Cada criterio vale dos puntos si cumple, uno si cumple con reparo y cero si no cumple. En el grupo de control de acceso hay tres criterios, así que el máximo es seis. EspoCRM cumple los tres: seis de seis, el cien por ciento. Twenty no separa la cartera por productor: cuatro de seis, el ${num(pts('twenty').pct)} %.</p>` });

  // 12 · Second step: every group weighs the same, whatever its number of criteria
  const demo = 'espocrm';
  const groupsA = D.groups.filter((g) => g.part === 'A');
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Cada grupo pesa lo mismo'])}</h2>
      <p class="note" data-in style="margin-top:20px">Los ${groupsA.length} grupos de lo solicitado en ${P.find((p) => p.key === demo).name}: el resultado de la parte es su promedio.</p></div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:380px;height:470px;display:grid;grid-template-columns:repeat(${groupsA.length},1fr);gap:16px;align-items:end">
      ${groupsA.map((g, i) => `<div style="height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:stretch">
        <p class="num" style="font-size:22px;text-align:center;margin-bottom:8px">${Math.round(D.subtotals[g.id][demo].pct)}</p>
        <div style="height:400px;display:flex;align-items:flex-end"><div class="vbar" style="--v:${D.subtotals[g.id][demo].pct / 100};--d:${i};height:100%;background:var(--surface-2)"></div></div>
        <p style="font-size:22px;text-align:center;margin-top:10px">${g.id}</p></div>`).join('')}
      <div data-in style="position:absolute;left:0;right:0;bottom:${40 + 400 * D.parts[demo].A / 100}px;border-top:4px solid var(--ink)"><span style="position:absolute;right:0;top:-52px;font-size:30px;background:var(--bg);padding-left:12px">promedio <b class="num">${num(D.parts[demo].A)} %</b></span></div>
    </div>
    <p data-in class="closing" style="left:96px;bottom:90px">Un grupo de 14 criterios pesa lo mismo que uno de 3.</p>`,
    notes: `<p>Cada grupo da su porcentaje, y el resultado de la parte es el promedio de esos porcentajes. Todos los grupos pesan igual, tengan muchos criterios o pocos: el pedido del cliente no dice qué necesidad importa más, así que el análisis tampoco las jerarquiza. Para EspoCRM, el promedio de los grupos de lo solicitado da ${num(D.parts[demo].A)} %.</p>` });

  // 13 · Third step: the two parts, 90 and 10
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Lo solicitado pesa más'])}</h2></div>
    <div data-in style="position:absolute;left:96px;right:96px;top:300px">
      <div style="display:flex;height:84px"><div style="flex:${aW};background:var(--ink);color:#fff;display:flex;align-items:center;padding-left:28px;font-size:32px">Solicitados · ${aW} %</div><div style="flex:${bW};background:var(--twenty);color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px">${bW} %</div></div>
      <p style="text-align:right;font-size:26px;color:var(--twenty);margin-top:10px">Deseables</p>
    </div>
    <div style="position:absolute;left:96px;right:96px;top:470px;display:grid;gap:26px">
      ${P.map((p) => `<div data-in style="display:grid;grid-template-columns:260px 1fr 220px;align-items:baseline;font-size:36px">
        <span style="color:${colour(p.key)};font-weight:500">${p.name}</span>
        <span class="num">${num(D.weights.A, 2)} × ${num(D.parts[p.key].A)} &nbsp;+&nbsp; ${num(D.weights.B, 2)} × ${num(D.parts[p.key].B)}</span>
        <span class="big num" style="font-size:64px;text-align:right">${num(D.totals[p.key])} %</span></div>`).join('')}
    </div>
    <p data-in class="closing" style="left:96px;bottom:90px">Así, una capacidad extra no compensa una necesidad sin resolver.</p>`,
    notes: `<p>Al final se combinan las dos partes: lo solicitado pesa el ${aW} % y lo deseable el ${bW} %. Para EspoCRM, ${num(D.weights.A, 2)} por ${num(D.parts.espocrm.A)} más ${num(D.weights.B, 2)} por ${num(D.parts.espocrm.B)} da ${num(D.totals.espocrm)} %. Con este reparto, ninguna capacidad agregada alcanza para compensar algo que el cliente pidió y no se resuelve.</p>` });

  // 14 · Total, as three bars
  S.push({ cls: 'is-field', html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:110px">${mask(['Cumplimiento total'])}</h2></div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:300px;bottom:200px;display:grid;grid-template-columns:repeat(3,1fr);gap:96px;align-items:end">
      ${P.map((p, i) => `<div style="height:100%;display:flex;flex-direction:column;justify-content:flex-end">
        <p class="big num" style="font-size:130px"><span data-count="${D.totals[p.key]}" data-dec="1">0</span><span style="font-size:60px">%</span></p>
        <div style="height:420px;display:flex;align-items:flex-end;margin-top:20px"><div class="vbar" style="--v:${D.totals[p.key] / 100};--d:${i * 3};height:100%;background:${p.key === 'espocrm' ? '#fff' : colour(p.key)}"></div></div>
        <p style="font-size:38px;margin-top:20px">${p.name}</p></div>`).join('')}
    </div>
    ${closing(`EspoCRM y Twenty, a ${num(gap)} puntos: <b>empate técnico.</b>`, 'left:96px;bottom:90px')}`,
    notes: `<p>Twenty ${num(D.totals.twenty)} %, EspoCRM ${num(D.totals.espocrm)} %, Bitrix24 ${num(D.totals.bitrix24)} %. En lo solicitado EspoCRM queda adelante; Twenty pasa adelante por los deseables. La distancia, ${num(gap)} puntos, es menor que lo que mueve un solo criterio.</p>` });

  // 15 · The two parts, side by side
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Dónde gana cada una'])}</h2></div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:330px;display:grid;grid-template-columns:1fr 1fr;gap:120px">
      ${[['A', `Lo solicitado · ${aW} %`], ['B', `Lo deseable · ${bW} %`]].map(([part, t], j) => `<div><p class="big" style="font-size:56px">${t}</p><div style="display:grid;gap:30px;margin-top:40px">
        ${P.map((p, i) => `<div><div style="display:flex;justify-content:space-between;font-size:32px"><span style="color:${colour(p.key)}">${p.name}</span><span class="num">${num(D.parts[p.key][part])} %</span></div>
          <div style="height:30px;background:var(--surface);margin-top:10px"><div class="bar" style="--v:${D.parts[p.key][part] / 100};--d:${j * 10 + i * 4};background:${colour(p.key)}"></div></div></div>`).join('')}</div></div>`).join('')}
    </div>
    ${closing('EspoCRM gana lo solicitado por poco; Twenty gana lo deseable por mucho.', 'left:96px;bottom:110px')}`,
    notes: `<p>El total se explica por las dos partes. En lo solicitado, que es lo que más pesa, EspoCRM queda primero con ${num(D.parts.espocrm.A)} %, apenas por encima de Twenty. En lo deseable, Twenty le saca más de doce puntos, sobre todo por su asistente de inteligencia artificial y porque casi todas sus mejoras llegan gratis.</p>` });

  // 16 · Group by group: big figures, the best of each row filled with its platform's colour, legible from the back
  const short = { 'A.1': 'Cartera de pólizas', 'A.2': 'Captación y venta', 'A.3': 'Productores', 'A.4': 'Marketing', 'A.5': 'Reclamos', 'A.6': 'Ficha del asegurado', 'A.7': 'Intercambio y correo', 'A.8': 'Parametrización', 'A.9': 'Control de acceso', 'A.10': 'Informes', 'A.11': 'Emisión y cobranza', 'A.12': 'Condiciones técnicas', 'B.1': 'Capacidades extra', 'B.2': 'Negocio asegurador' };
  const cell = (g, p) => { const v = D.subtotals[g.id][p.key].pct, best = Math.max(...P.map((q) => D.subtotals[g.id][q.key].pct));
    return `<span class="num" style="text-align:center;padding:2px 0;${v === best ? `background:${colour(p.key)};color:#fff;font-weight:600` : ''}">${Math.round(v)}</span>`; };
  const half = (list) => `<div style="display:grid;grid-template-columns:1fr repeat(3,120px);column-gap:10px;row-gap:12px;align-items:center;font-size:34px">
      <span></span>${P.map((p) => `<span style="text-align:center;font-size:22px;color:var(--muted)">${p.name}</span>`).join('')}
      ${list.map((g, r) => `<span data-in style="font-size:30px;white-space:nowrap">${short[g.id] ?? g.name}</span>${P.map((p) => cell(g, p)).join('')}`).join('')}</div>`;
  S.push({ html: `
    <div style="position:absolute;left:96px;top:80px"><h2 class="big" style="font-size:96px">${mask(['Grupo por grupo'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:250px;display:grid;grid-template-columns:1fr 1fr;gap:96px">${half(D.groups.slice(0, 7))}${half(D.groups.slice(7))}</div>
    ${closing('Bitrix24 queda atrás en casi todo: la elección es entre EspoCRM y Twenty.', 'left:96px;bottom:90px')}`,
    notes: '<p>Cada fila es un grupo, con el porcentaje de cada plataforma; el mejor de la fila está resaltado. Bitrix24 queda atrás en casi todo, así que la elección es entre EspoCRM y Twenty, que van parejas: lo que sigue explica primero por qué se descarta Bitrix24 y después dónde se separan las otras dos.</p>' });

  // 17 · Finding: Bitrix24 limits
  const limits = [['search', '1.000', 'ventas, y deja de buscar', 'B.2.4'], ['calendar', '50', 'días sin uso, y baja la cuenta', 'B.2.1'], ['globe', 'EE. UU.', 'donde quedan los datos', 'B.2.6']];
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Bitrix24 Free tiene límites'])}</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:300px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      ${limits.map(([a, n, t, id]) => `<div data-in>${art(a, 130, 'color:var(--bitrix24)')}<p class="big num" style="font-size:160px;margin-top:24px">${n}</p><p style="font-size:34px;margin-top:16px;line-height:1.25">${t}</p><p class="note" style="margin-top:10px">${link(id)}</p></div>`).join('')}
    </div>
    ${closing(`Con el plan Professional, de ${price('bitrix24', 'Professional')}, superaría a las otras dos gratuitas.`, 'left:96px;bottom:90px')}`,
    notes: '<p>Con la cartera de prueba cargada, a partir de mil ventas Bitrix24 Free dejó de buscar por texto, y como ahí las pólizas y los reclamos son ventas, la cartera llega a ese tope en pocos años. El fabricante puede cerrar la cuenta tras cincuenta días sin uso, y los datos quedan en Estados Unidos, que la ley argentina no reconoce como país con protección adecuada.</p>' });

  // 18 · Bitrix24 depends on the vendor's cloud
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Todo depende', 'de la nube del fabricante'])}</h2></div>
    ${iconCols([['offline', 'Sin conexión', `deja de responder por completo ${link('B.2.7')}`], ['backup', 'Sin copia propia', `la cartera no se puede descargar entera ${link('B.2.2')}`], ['update', 'Sin aviso', `el fabricante aplica los cambios cuando decide ${link('B.2.5')}`]], 420)}`,
    notes: '<p>Bitrix24 es un servicio en la nube, y eso tiene una contracara. Si se corta internet, deja de responder por completo. La edición gratuita no permite sacar una copia de toda la cartera. Y los cambios del sistema los aplica el fabricante cuando decide. Para una cartera de pólizas que dura años, esas tres cosas son un riesgo.</p>' });

  // 19 · What Bitrix24 does well
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Lo que Bitrix24 hace bien'])}</h2></div>
    ${iconCols([['cloud', 'Nada que instalar', `ni servidor ni personal técnico ${link('A.12.3')}`], ['phone', 'Avisos al teléfono', `con su aplicación gratuita ${link('B.1.2')}`], ['chat', 'Mensajería', `suma solo al interesado que escribe por Telegram ${link('A.4.4')}`]], 420)}
    ${closing(`Con el plan Professional, de ${price('bitrix24', 'Professional')}, llegaría a ${plan('bitrix24', 'Professional').total}.`, 'left:96px;bottom:110px')}`,
    notes: '<p>Para ser justos, Bitrix24 tiene ventajas reales. No hay nada que instalar ni mantener. Es la única que avisa en el teléfono de lo que se asigna a cada usuario. Y suma sola a la base al interesado que escribe por un canal de mensajería. Pagando el plan Professional resolvería casi todo, pero deja de ser gratis y el abono crece con los usuarios.</p>' });

  // 20 · Finding: the portfolio by producer
  const bigRow = (id, label) => P.map((p) => { const y = C[id].platforms[p.key]; return `<div data-in style="text-align:center"><span class="with-up" style="font-size:180px">${sign(y.value, 'sign-xl')}${y.plans.length ? '<span class="up" style="font-weight:400">↑</span>' : ''}</span><p class="big" style="font-size:60px;margin-top:32px;color:${colour(p.key)}">${p.name}</p><p class="note" style="margin-top:8px">${label(y)}</p></div>`; }).join('');
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px;right:400px"><h2 class="big" style="font-size:100px">${mask(['¿Cada productor ve', 'solo su cartera?'])}</h2><p class="note" data-in style="margin-top:20px">${link('A.9.1')}</p></div>
    ${art('folders', 240, 'position:absolute;right:96px;top:80px')}
    <div style="position:absolute;left:96px;right:96px;top:440px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">${bigRow('A.9.1', (y) => (y.value === 2 ? 'con un rol, sin costo' : 'sin el plan pago, todos ven todo'))}</div>
    ${closing(`Separarla en Twenty cuesta ${price('twenty', 'Organization')}.`, 'left:96px;bottom:90px')}`,
    notes: '<p>El hallazgo que más pesa. El productor asesor atiende su propia cartera, y solo EspoCRM, sin pagar, permite que cada uno vea solo la suya. En la prueba, en Twenty un productor abrió una póliza ajena. Restringirlo exige el plan Organization, que se cobra por usuario.</p>' });

  // 21 · Finding: automation
  const auto4 = [['A.1.5', 'Aviso de vencimiento'], ['A.8.3', 'Automatización'], ['A.10.3', 'Informe reutilizable'], ['A.11.1', 'Emisión de la póliza']];
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px;right:400px"><h2 class="big" style="font-size:100px">${mask(['En EspoCRM, automatizar', 'exige programar'])}</h2></div>
    ${art('flow', 240, 'position:absolute;right:96px;top:80px')}
    <div style="position:absolute;left:96px;right:96px;top:440px;display:grid;grid-template-columns:repeat(4,1fr);gap:32px">
      ${auto4.map(([id, name]) => `<div data-in style="background:var(--surface);padding:32px 32px 36px">
        <p style="font-size:28px">${name} <span class="note" style="font-size:20px">${link(id)}</span></p>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:18px 20px;align-items:center;margin-top:28px;font-size:56px">
          ${['espocrm', 'twenty'].map((k) => `${sign(C[id].platforms[k].value)}<span style="font-size:28px;color:${colour(k)}">${P.find((p) => p.key === k).name}</span>`).join('')}</div></div>`).join('')}
    </div>
    ${closing(`Con el Advanced Pack, de ${price('espocrm', 'Advanced')}, EspoCRM lo resuelve.`, 'left:96px;bottom:110px')}`,
    notes: '<p>La contracara. Avisos de vencimiento, informes que se repiten, automatizaciones y la emisión de la póliza al ganar la venta: Twenty los trae gratis y se arman desde la pantalla; en EspoCRM exigen código o la extensión Advanced Pack, que se paga una vez por año para toda la instalación.</p>' });

  // 22 · More control in EspoCRM
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Más control en EspoCRM'])}</h2></div>
    ${signGrid([['A.12.8', 'Dos personas cambian la misma póliza'], ['A.5.1', 'Cada reclamo con su número'], ['A.9.3', 'Quién cambió cada dato']], 330)}
    ${closing('EspoCRM avisa al que guarda después y numera solo los reclamos; en Twenty, el último cambio pisa al anterior.', 'left:96px;bottom:110px;font-size:30px')}`,
    notes: '<p>EspoCRM se diferencia también en control. Si dos personas modifican la misma póliza a la vez, avisa al que guarda después; Twenty conserva el último cambio sin avisar. Los reclamos en EspoCRM se numeran solos; en Twenty el número se carga a mano. Y las dos registran quién cambió cada dato, algo que Bitrix24 gratuito no hace.</p>' });

  // 23 · What Twenty adds
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Lo que suma Twenty'])}</h2></div>
    ${signGrid([['B.1.1', 'Asistente de inteligencia artificial'], ['A.12.10', 'Documentación en español'], ['B.2.11', 'Las mejoras llegan gratis']], 330)}
    ${closing('El asistente funciona con un servicio de inteligencia artificial que se contrata aparte.', 'left:96px;bottom:110px;font-size:30px')}`,
    notes: '<p>Twenty, por su lado, suma cosas que EspoCRM no trae gratis: un asistente de inteligencia artificial que resume la ficha de un asegurado, la documentación en español y una política de producto en la que casi todas las novedades llegan a la versión gratuita. En EspoCRM, buena parte de lo nuevo sale en extensiones pagas.</p>' });

  // 24 · Twenty is the newest
  const twv = Number((C['B.2.10'].platforms.twenty.measure ?? '').match(/(\d+) versiones del producto/)?.[1] ?? 0);
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['El más nuevo', 'también exige más'])}</h2></div>
    ${art('update', 200, 'position:absolute;right:96px;top:110px;color:var(--twenty)')}
    <div style="position:absolute;left:96px;right:96px;top:420px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      <div data-in><p class="big num" style="font-size:150px;color:var(--twenty)">${since('twenty')}</p><p style="font-size:32px;margin-top:16px">el año en que nació</p></div>
      <div data-in><p class="big num" style="font-size:150px;color:var(--twenty)"><span data-count="${twv}">0</span></p><p style="font-size:32px;margin-top:16px">versiones en el último año</p></div>
      <div data-in><p class="big" style="font-size:150px;color:var(--twenty)">Sin plazo</p><p style="font-size:32px;margin-top:16px">publicado de corrección para cada versión ${link('A.12.14')}</p></div>
    </div>
    ${closing('Evoluciona rápido, y hay que actualizarlo seguido para no quedar sin correcciones.', 'left:96px;bottom:110px')}`,
    notes: `<p>Twenty es el producto más nuevo: existe desde ${since('twenty')} y publicó ${twv} versiones en el último año, casi una por semana. Eso es bueno porque evoluciona rápido, pero ningún fabricante publica por cuánto tiempo corrige una versión, así que con Twenty hay que actualizar seguido. En una instalación propia, ese trabajo lo hace la compañía.</p>` });

  // 25 · Learning test as dots
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:110px">${mask(['Sin capacitación'])}</h2>
      <p class="note" data-in style="margin-top:20px">Tres agentes que no conocían el sistema, cinco tareas diarias cada uno · ${link('A.12.5')}</p></div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:400px;display:grid;gap:56px">
      ${P.map((p, i) => { const [done, all] = tasks(p.key); return `<div style="display:grid;grid-template-columns:300px 1fr 220px;align-items:center;gap:32px">
        <p class="big" style="font-size:60px">${p.name}</p>
        <div class="dots" style="grid-template-columns:repeat(${all},48px);gap:18px">${Array.from({ length: all }, (_, k) => `<i class="dot${k < done ? '' : ' miss'}" style="width:48px;height:48px;--d:${i * 18 + k * 2};${k < done ? `background:${colour(p.key)}` : ''}"></i>`).join('')}</div>
        <p class="big num" style="font-size:80px;text-align:right">${done}/${all}</p></div>`; }).join('')}
    </div>
    ${closing('En EspoCRM, nadie se trabó.', 'left:96px;bottom:110px')}`,
    notes: '<p>Tres agentes que nunca habían visto el sistema recibieron las cinco tareas que un productor hace a diario. Después, un test comprobó cada tarea en los datos guardados. En EspoCRM completaron todas; en Twenty, una menos; en Bitrix24, tres menos.</p>' });

  // 26 · EspoCRM against Twenty
  const words = (list) => list.map((c) => `<p data-in style="font-size:30px;padding:9px 0">${c.name}</p>`).join('');
  S.push({ html: `
    <div style="position:absolute;left:96px;top:80px"><h2 class="big" style="font-size:96px">${mask(['EspoCRM o Twenty'])}</h2></div>
    <div style="position:absolute;left:96px;width:820px;top:250px"><p class="big" style="font-size:64px">Control <span class="muted">· ${forEspo.length}</span></p><div style="margin-top:20px">${words(forEspo)}</div></div>
    <div style="position:absolute;left:1004px;right:96px;top:250px"><p class="big" style="font-size:64px;color:var(--twenty)">Automatización <span class="muted">· ${forTwenty.length}</span></p><div style="margin-top:20px">${words(forTwenty)}</div></div>
    ${closing(`En los otros ${D.criteria.length - diff.length} criterios, empatan.`, 'left:96px;bottom:96px')}`,
    notes: `<p>Coinciden en ${D.criteria.length - diff.length} de ${D.criteria.length} criterios. Donde se separan, EspoCRM gana en control de la información y Twenty en automatización.</p>` });

  // 27 · Legal, as a grid of signs
  const legal = [['A.5.7', 'Reclamos según la SSN'], ['A.9.1', 'Acceso por productor'], ['A.9.3', 'Quién cambió cada dato'], ['B.2.6', 'País con protección adecuada'], ['B.2.8', 'Derechos del titular'], ['B.2.9', 'Baja de publicidad']];
  S.push({ html: `
    <div style="position:absolute;left:96px;top:80px"><h2 class="big" style="font-size:96px">${mask(['Lo que exige la ley'])}</h2></div>
    ${art('scale', 170, 'position:absolute;right:96px;top:60px')}
    <div class="auto" style="position:absolute;left:96px;right:96px;top:270px">
      <div style="display:grid;grid-template-columns:1fr repeat(3,220px);font-size:26px;color:var(--muted);padding-bottom:14px"><span></span>${P.map((p) => `<span style="text-align:center">${p.name}</span>`).join('')}</div>
      ${legal.map(([id, name], r) => `<div style="display:grid;grid-template-columns:1fr repeat(3,220px);align-items:center;padding:16px 0;background:${r % 2 ? 'transparent' : 'var(--surface)'}">
        <span style="font-size:30px;padding-left:20px">${name} <span class="muted" style="font-size:22px">${link(id)}</span></span>
        ${P.map((p, k) => `<span class="dot" style="background:none;border:0;width:auto;height:auto;justify-self:center;font-size:44px;line-height:1;--d:${(r * 3 + k) * 5}">${sign(C[id].platforms[p.key].value)}</span>`).join('')}</div>`).join('')}
    </div>
    ${closing('Ninguna lo cubre todo. EspoCRM es la que más se acerca.', 'left:96px;bottom:110px')}`,
    notes: '<p>Ninguna permite cumplir todas las normas sin trabajo adicional. EspoCRM es la que más se acerca y sus reparos se resuelven con trabajo propio; Twenty suma la falta del acceso por productor; Bitrix24 Free se aleja, sobre todo por dónde guarda los datos.</p>' });

  // 28 · What none of them solves
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Lo que ninguna resuelve'])}</h2></div>
    ${signGrid([['A.4.6', 'Publicar en redes sociales'], ['A.4.5', 'Seguir menciones en redes'], ['A.12.13', 'Soporte con plazo comprometido'], ['A.12.14', 'Correcciones garantizadas por versión']], 300)}
    ${closing('Ninguna las resuelve del todo, así que no inciden en la elección.', 'left:96px;bottom:96px')}`,
    notes: '<p>Hay cuatro necesidades que ninguna resuelve en su versión gratuita: publicar en redes desde el sistema, seguir lo que se dice de la compañía, un soporte con plazo de respuesta comprometido y un plazo publicado de corrección de cada versión. Como faltan en las tres, no cambian la elección, pero la compañía tiene que saberlo.</p>' });

  // 29 · With paid plans
  const paid = [['espocrm', 'Advanced'], ['twenty', 'Organization'], ['bitrix24', 'Professional']];
  const pv = (k, v) => parseFloat(plan(k, v).total.replace(/[^\d,]/g, '').replace(',', '.'));
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Y si se paga'])}</h2></div>
    <div class="auto" style="position:absolute;left:96px;right:96px;top:330px;display:grid;gap:44px">
      ${paid.map(([k, v], i) => { const p = P.find((q) => q.key === k); return `<div style="display:grid;grid-template-columns:260px 1fr 380px;align-items:center;gap:32px">
        <span style="font-size:36px;color:${colour(k)}">${p.name}</span>
        <div style="position:relative;height:54px;background:var(--surface)"><div class="bar" style="position:absolute;inset:0;--v:${pv(k, v) / 100};--d:${i * 8 + 6};background:${colour(k)};opacity:.35"></div><div class="bar" style="position:absolute;inset:0;--v:${D.totals[k] / 100};--d:${i * 8};background:${colour(k)}"></div></div>
        <span style="font-size:28px;line-height:1.3"><b class="num">${num(D.totals[k])} % → ${plan(k, v).total}</b><br><span class="muted">${plan(k, v).version}, ${plan(k, v).price}</span></span></div>`; }).join('')}
    </div>
    ${closing('Con su extensión, EspoCRM sigue primera; Bitrix24 recién compite pagando el plan Professional.', 'left:96px;bottom:110px')}`,
    notes: '<p>Como comentario, lo que pasaría pagando. EspoCRM con su extensión Advanced Pack, que se paga por año para toda la instalación, sube y queda primera. Twenty con el plan Organization también sube, pero ese plan se cobra por usuario por mes. Bitrix24 recién se pone a la par con el plan Professional, que deja de ser gratuito y crece con la cantidad de usuarios.</p>' });

  // 30 · An own server needs a person
  S.push({ html: `
    <div style="position:absolute;left:96px;top:96px"><h2 class="big" style="font-size:100px">${mask(['Un servidor propio', 'necesita a alguien'])}</h2></div>
    ${iconCols([['server', 'Instalar', `EspoCRM y Twenty corren en un servidor de la compañía ${link('A.12.1')}`], ['admin', 'Mantener', 'actualizar, vigilar y hacer las copias de resguardo'], ['cloud', 'O pagar la nube', 'si no hay esa persona, las versiones en la nube son pagas']], 420)}`,
    notes: '<p>EspoCRM y Twenty se instalan en un servidor de la compañía. Eso exige a alguien con conocimientos técnicos que los instale, los mantenga actualizados y haga las copias de resguardo. Si la compañía no tiene ni va a contratar a esa persona, la alternativa son las versiones en la nube, que son pagas.</p>' });

  // 31 · Recommendation, as a fork
  S.push({ cls: 'is-field', html: `
    <div style="position:absolute;left:96px;top:110px"><h1 class="big" style="font-size:190px">${mask(['Se recomienda', 'EspoCRM'])}</h1></div>
    ${art('fork', 280, 'position:absolute;right:96px;top:110px;color:#fff')}
    <div data-in style="position:absolute;left:96px;right:96px;top:600px">
      <p style="font-size:44px">¿Cada productor debe ver solo su cartera?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:56px">
        <div style="border-top:6px solid #fff;padding-top:24px"><p class="big" style="font-size:64px">Sí · EspoCRM</p><p class="note" style="margin-top:12px">con el Advanced Pack para automatizar</p></div>
        <div style="border-top:6px solid var(--twenty);padding-top:24px"><p class="big" style="font-size:64px">No · Twenty</p><p class="note" style="margin-top:12px">más sin pagar, pero actualizar seguido</p></div>
      </div></div>`,
    notes: '<p>Recomendamos EspoCRM, por una razón del negocio: el productor asesor atiende su propia cartera, y es la única que la separa sin pagar. Si a la compañía no le hace falta separar carteras, la balanza se da vuelta y la opción es Twenty. En cualquier caso hace falta alguien que mantenga el servidor y las copias; Bitrix24 Free no es viable.</p>' });

  // 32 · Questions
  S.push({ html: `
    <div style="position:absolute;left:96px;top:330px"><h1 class="big" style="font-size:200px">${mask(['Preguntas'])}</h1></div>
    <p data-in class="note" style="position:absolute;left:96px;top:620px">Cada criterio, con su justificación y el video de la prueba.</p>
    <p data-in style="position:absolute;left:96px;top:720px"><a class="button" href="criterios.html">Abrir la consulta por criterio</a></p>`,
    notes: '<p>Para cualquier pregunta sobre un criterio, abrimos la consulta: cada criterio con su justificación completa y el video de la prueba.</p>' });

  // What to say beyond the slide: each block is found by a phrase of its slide, so reordering keeps them in place
  const SAY = [
    ['Selección de un sistema CRM', `<p>Somos ${D.meta.team}. En los próximos veinte minutos vamos a contar qué se pidió, cómo se evaluó, qué encontramos en cada plataforma y cuál recomendamos, con sus condiciones. Al final, cualquier criterio se puede abrir con su justificación y el video de su prueba.</p>`],
    ['Acompañar al asegurado', '<p>Esto importa porque en seguros la relación no termina en la venta: la póliza se renueva, se cobra todos los meses y genera reclamos. Un sistema que solo sirve para vender deja afuera la mitad del trabajo. Por eso cada criterio se pensó desde una de estas tres etapas.</p>'],
    ['Doce temas pedidos', '<p>Cada tema se dividió en criterios que se pueden comprobar. Por ejemplo, la cartera de pólizas incluye que la póliza exista como registro propio, que tenga su vigencia, su prima y su ramo, y que el sistema avise antes de que venza. Un tema con muchos criterios no pesa más que uno con pocos, como vamos a ver.</p>'],
    ['Tres plataformas', '<p>La elección de las tres no es casual: representan tres maneras de resolver lo mismo. Dos son de código abierto y se instalan en un servidor propio, con la diferencia de que EspoCRM tiene más de diez años y Twenty es muy nuevo. La tercera, Bitrix24, es un servicio en la nube que se usa desde el navegador.</p>'],
    ['Solo lo que viene gratis', '<p>Evaluar la versión gratuita es una decisión de auditoría: se afirma solo lo que se pudo comprobar en esa versión. Si pagando se resuelve, lo informamos aparte con el precio del plan más barato que lo logra, para que la compañía pueda comparar sin que eso cambie el puntaje.</p>'],
    ['Lo que se evaluó', `<p>Los ${nA} criterios solicitados salen de lo que pidió el cliente y del marco técnico de evaluación. Los ${nB} deseables los agregamos porque el negocio asegurador los exige aunque nadie los haya pedido: la protección de los datos personales, poder sacar una copia de la cartera o qué pasa si se corta internet.</p>`],
    ['Cómo se probó cada uno', '<p>Que el procedimiento se escriba antes de probar es lo que hace comparables a las tres: la misma tarea, con los mismos datos, en cada sistema. Y como cada prueba quedó grabada, cualquiera puede volver a mirar cómo se llegó a un valor. Eso es lo que vamos a abrir si surge una pregunta.</p>'],
    ['Una cartera de prueba', '<p>Con una base vacía, cualquier sistema responde rápido. Por eso se cargó una cartera grande: así aparecieron límites que con pocos datos no se ven, como el de Bitrix24, que deja de buscar a partir de mil ventas registradas. Lo vamos a ver más adelante.</p>'],
    ['Cada cuadrado, una prueba', `<p>En total son ${evals.length} evaluaciones: los ${D.criteria.length} criterios en cada una de las tres plataformas. De ellas, ${withVideo} tienen video. Las demás se respaldan en la documentación oficial del fabricante, con su texto citado y la fecha de consulta, por ejemplo cuando se trata de precios, licencias o condiciones del servicio.</p>`],
    ['Tres valores, nada más', '<p>Elegimos tres valores y no una escala de uno a diez a propósito. Con tres valores, cada uno tiene una regla escrita y se puede discutir. Con diez, alguien tiene que decidir qué separa un siete de un ocho, y esa decisión termina definiendo el resultado sin que nadie la vea.</p>'],
    ['Cada criterio vale 0, 1 o 2', '<p>El ejemplo muestra cómo un solo criterio mueve el grupo: Twenty cumple dos de los tres de control de acceso, pero el que le falta, separar la cartera por productor, le hace perder un tercio del grupo. Con este cálculo se arman los catorce grupos de cada plataforma.</p>'],
    ['Cada grupo pesa lo mismo', '<p>El pedido del cliente no dice qué tema le importa más, y el análisis no se toma esa decisión por él. Además, así el catálogo se puede afinar, agregando o sacando un criterio, sin mover el peso de su grupo.</p>'],
    ['Lo solicitado pesa más', '<p>Si lo deseable pesara lo mismo que lo pedido, una plataforma podría ganar por un asistente de inteligencia artificial y perder en algo que el cliente sí pidió. Con nueve a uno, lo pedido manda, y lo deseable desempata.</p>'],
    ['Cumplimiento total', `<p>La diferencia entre EspoCRM y Twenty es de ${num(gap)} puntos, menos de lo que mueve un solo criterio: si el asistente de Twenty, valorado por su documentación, hubiera recibido el valor más bajo, Twenty quedaría detrás. Por eso no alcanza con mirar el número: hay que mirar dónde gana cada una.</p>`],
    ['Dónde gana cada una', '<p>Esta es la clave del resultado: en lo que el cliente pidió, las dos quedan casi empatadas, con EspoCRM apenas adelante. La ventaja de Twenty en el total viene de lo deseable, que pesa poco. Bitrix24 queda lejos en las dos partes.</p>'],
    ['Grupo por grupo', '<p>Fíjense dónde gana cada una. EspoCRM gana en control de acceso y en reclamos; Twenty en la cartera de pólizas, la ficha del asegurado, los informes y la emisión. En varios grupos empatan. Bitrix24 solo gana en capacidades extra, por su aplicación y su suite integrada.</p>'],
    ['Bitrix24 Free tiene límites', '<p>Los tres límites salen de la prueba y de las condiciones publicadas del servicio. El de las mil ventas es el más serio para una aseguradora, porque en el plan gratuito la póliza no puede tener entidad propia y se registra como una venta, igual que el reclamo. Con la cartera de una compañía, ese tope se alcanza en pocos años.</p>'],
    ['Todo depende', '<p>Es lo que implica un servicio gratuito en la nube: la compañía no controla dónde están sus datos, cuándo cambia el sistema ni si puede trabajar sin conexión.</p>'],
    ['Lo que Bitrix24 hace bien', '<p>Si la compañía no tiene a nadie que mantenga un servidor y está dispuesta a pagar, Bitrix24 con un plan pago es una opción a considerar. Pero en su versión gratuita, que es la que se evaluó, no alcanza.</p>'],
    ['¿Cada productor ve', '<p>Para una aseguradora esto es central: el productor asesor es dueño de su relación con el cliente, y que otro productor pueda ver su cartera es un problema comercial y también legal, porque la ley de protección de datos exige que solo acceda quien corresponde. En EspoCRM se resuelve con un rol, sin costo.</p>'],
    ['En EspoCRM, automatizar', '<p>Esta es la contracara de EspoCRM: lo que en Twenty se arma desde la pantalla, en EspoCRM gratuito exige escribir código o comprar la extensión. La diferencia de modelo importa: la extensión se paga una vez por año para toda la instalación, mientras que el plan de Twenty se paga por cada usuario, todos los meses.</p>'],
    ['Más control en EspoCRM', '<p>Son detalles que en el día a día pesan: dos empleados que corrigen la misma póliza al mismo tiempo, un reclamo que hay que identificar ante la Superintendencia, o saber quién cambió un dato cuando aparece un error.</p>'],
    ['Lo que suma Twenty', '<p>El asistente de inteligencia artificial resume la ficha de un asegurado o redacta una respuesta, pero necesita que la compañía contrate un servicio de inteligencia artificial aparte. La documentación en español facilita la capacitación del personal.</p>'],
    ['El más nuevo', '<p>Una versión por semana tiene dos caras. Twenty mejora rápido y las novedades llegan gratis, pero cada actualización es trabajo para quien mantiene el servidor, y si no se actualiza, se pierden las correcciones. EspoCRM y Bitrix24 llevan más de diez años en el mercado.</p>'],
    ['Sin capacitación', '<p>La prueba se hizo con agentes de inteligencia artificial que nunca habían visto el sistema, para que nadie llegara con experiencia previa. No se les creyó lo que dijeron: un test comprobó cada tarea en los datos guardados. En EspoCRM las cinco tareas salieron en los tres casos.</p>'],
    ['EspoCRM o Twenty', '<p>Este cuadro resume la decisión: si a la compañía le importa más controlar quién ve qué y qué pasa con cada cambio, la balanza va hacia EspoCRM. Si le importa más que el sistema haga cosas solo, sin programar, va hacia Twenty.</p>'],
    ['Lo que exige la ley', '<p>Las normas que alcanzan a la compañía son la ley de protección de datos personales y la resolución de la Superintendencia sobre el registro de reclamos. EspoCRM resuelve sus dos reparos con trabajo propio: el plazo de diez días hábiles de los reclamos con un cálculo escrito una vez, y los pedidos de los titulares con una exportación y una constancia.</p>'],
    ['Lo que ninguna resuelve', '<p>La compañía tiene que saber que, elija la que elija, va a necesitar otra herramienta para las redes sociales y que va a tener que actualizar al ritmo del fabricante.</p>'],
    ['Y si se paga', '<p>Los precios son los publicados por cada fabricante al momento de la evaluación. No proyectamos un costo total, porque depende de la cantidad de usuarios y de lo que la compañía ya tenga.</p>'],
    ['Un servidor propio', '<p>Es un costo que la matriz no muestra: la compañía necesita a alguien con conocimientos técnicos. Si no lo tiene, conviene sumarlo al análisis antes de decidir.</p>'],
    ['Se recomienda', '<p>Las dos son viables y quedan prácticamente empatadas. La pregunta que decide es si cada productor debe ver solo su cartera. En una aseguradora con productores asesores, la respuesta suele ser que sí, y por eso recomendamos EspoCRM.</p>'],
    ['Preguntas', '<p>Gracias. Quedamos a disposición para cualquier pregunta.</p>'],
  ];
  for (const [phrase, extra] of SAY) { const s = S.find((x) => x.html.includes(phrase)); if (s) s.notes += extra; }

  const stage = document.querySelector('.stage');
  stage.innerHTML = S.map((s, i) => `<section class="slide ${s.cls ?? ''}" aria-label="Diapositiva ${i + 1}">${s.html}<p class="foot">Selección de un sistema CRM · ${i + 1} / ${S.length}</p><div class="notes">${s.notes}</div></section>`).join('');
})();
