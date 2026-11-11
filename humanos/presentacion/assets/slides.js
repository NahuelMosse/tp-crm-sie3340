// Writes the slides of the main deck from window.DATA. Every number comes from the data; the words are the team's.
(function () {
  const D = window.DATA;
  const P = D.platforms;
  const C = Object.fromEntries(D.criteria.map((c) => [c.id, c]));
  const pct = (x) => `${x.toFixed(1).replace('.', ',')} %`;
  const sign = (v, up) => `<span class="with-up"><span class="v v${v}" role="img" aria-label="${['No cumple', 'Cumple con reparo', 'Cumple'][v]}"></span>${up ? '<span class="up" aria-label="un plan pago lo mejoraría">↑</span>' : ''}</span>`;
  const cap = (f) => D.paths.captures + f;
  const link = (id) => `<a href="criterios.html#${id}">${id}</a>`;
  const groupName = (g) => `${g.id} ${g.name}`;

  // Groups as one table row each, the best value of the row in bold
  function groupRows(part) {
    return D.groups.filter((g) => g.part === part).map((g) => {
      const vals = P.map((p) => D.subtotals[g.id][p.key].pct);
      const best = Math.max(...vals);
      return `<tr><td>${groupName(g)}</td>${vals.map((v) => `<td class="n${v === best ? ' best' : ''}">${pct(v)}</td>`).join('')}</tr>`;
    }).join('');
  }
  function partRow(label, part) {
    const vals = P.map((p) => D.parts[p.key][part]);
    const best = Math.max(...vals);
    return `<tr class="total"><td>${label}</td>${vals.map((v) => `<td class="n${v === best ? ' best' : ''}">${pct(v)}</td>`).join('')}</tr>`;
  }
  const head = `<thead><tr><th>Grupo</th>${P.map((p) => `<th class="n">${p.name}</th>`).join('')}</tr></thead>`;

  // Where EspoCRM and Twenty part ways, computed from the results
  const diff = D.criteria.filter((c) => c.platforms.espocrm.value !== c.platforms.twenty.value);
  const forEspo = diff.filter((c) => c.platforms.espocrm.value > c.platforms.twenty.value);
  const forTwenty = diff.filter((c) => c.platforms.twenty.value > c.platforms.espocrm.value);
  const item = (c) => `<li data-in><span class="code">${link(c.id)}</span> ${c.name}</li>`;

  const plan = (key, version) => D.plans[key].find((x) => x.version.startsWith(version));
  const tasks = (key) => (C['A.12.5'].platforms[key].measure ?? '').replace(' tareas completadas', '').replace(' de ', ' / ');
  const aW = Math.round(D.weights.A * 100), bW = Math.round(D.weights.B * 100);
  const nA = D.criteria.filter((c) => c.part === 'A').length, nB = D.criteria.length - nA;
  const gap = Math.abs(D.totals.twenty - D.totals.espocrm);

  const legal = [
    ['A.5.7', 'Registro de reclamos con datos y plazos', 'Resolución SSN 225/2022'],
    ['A.9.1', 'Acceso a la cartera solo para quien corresponde', 'Ley 25.326'],
    ['A.9.3', 'Registro de quién modificó cada dato', 'Ley 25.326'],
    ['B.2.6', 'Datos en un país con protección adecuada', 'Ley 25.326'],
    ['B.2.8', 'Atención de los derechos del titular', 'Ley 25.326'],
    ['B.2.9', 'Baja de las comunicaciones comerciales', 'Ley 25.326 · Decreto 1558/2001'],
  ];

  const S = [];

  // 1 · Cover
  S.push({ cls: '', html: `
    <div class="axis" style="top:300px"><h1 data-in style="font-size:116px">Selección de un sistema CRM para una compañía de seguros</h1></div>
    <p class="side lead" style="top:540px;color:var(--ink)" data-in>Evaluación comparada de tres plataformas sobre los requerimientos del negocio asegurador.</p>
    <div class="axis" style="top:820px"><p class="body" data-in>${D.meta.team}<br><span class="muted">${D.meta.institution} · ${D.meta.presented}</span></p></div>`,
    notes: `<p>Buenas. Vamos a presentar la evaluación que hicimos para elegir el sistema de gestión de clientes de una compañía de seguros. El objetivo es concreto: recomendar una plataforma que acompañe la relación con cada asegurado, desde el primer contacto hasta la venta, el cobro y la atención de reclamos.</p><p>La presentación dura unos veinte minutos: primero qué se evaluó y cómo, después los resultados, los hallazgos que los explican y la recomendación. Si surge una pregunta sobre un criterio en particular, tenemos aparte la consulta con cada uno, su justificación completa y el video de la prueba.</p>` });

  // 2 · The assignment
  S.push({ cls: '', html: `
    <div class="axis" style="top:120px"><h2 data-in>El trabajo</h2></div>
    <p class="side" style="top:140px" data-in>Qué se buscó y con qué alcance.</p>
    <div class="axis" style="top:300px;display:grid;grid-template-columns:1fr 1fr;gap:64px">
      <div data-in><p class="small muted">Objetivo</p><p class="body" style="margin-top:12px">Recomendar un CRM para gestionar la relación con los asegurados, desde el primer contacto hasta la venta, el cobro y los reclamos.</p></div>
      <div data-in><p class="small muted">Alcance</p><p class="body" style="margin-top:12px">Tres plataformas, que se presentan a continuación, cada una en su versión gratuita y contra un catálogo de criterios verificables.</p></div>
    </div>
    <div class="axis" style="top:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      <div data-in><p class="num" style="font-family:var(--display);font-size:150px;line-height:1">${D.criteria.length}</p><p class="body">criterios en total</p></div>
      <div data-in><p class="num" style="font-family:var(--display);font-size:150px;line-height:1">${nA}</p><p class="body">salen de lo solicitado: los veinte requerimientos y el marco técnico</p></div>
      <div data-in><p class="num" style="font-family:var(--display);font-size:150px;line-height:1">${nB}</p><p class="body">son deseables, propios del negocio asegurador</p></div>
    </div>`,
    notes: `<p>El punto de partida fueron los veinte requerimientos del cliente y el marco técnico de evaluación: restricciones tecnológicas, instalación, navegabilidad, usuarios concurrentes, seguridad, informes, integración y soporte.</p><p>Cada requerimiento se tradujo en criterios que se pueden comprobar. En total son ${D.criteria.length}: ${nA} salen de lo solicitado y ${nB} los agregamos porque el negocio asegurador los exige, por ejemplo la protección de datos personales, las copias de la cartera o qué pasa si se corta internet.</p><p>Se evaluó la versión gratuita de cada plataforma. Lo que agrega un plan pago se informa aparte y no suma puntos.</p>` });

  // 3 · Platforms, each with its own screen
  const shots = { espocrm: 'A-1-6-espocrm-1-filtros-combinados.png', twenty: 'A-1-6-twenty-1-filtros-combinados.png', bitrix24: 'A-1-6-bitrix24-2-listado-resultante.png' };
  const kind = {
    espocrm: ['EspoCRM 10.0.4 Community', 'Código abierto. Se instala en un servidor propio, sin extensiones pagas.'],
    twenty: ['Twenty v2.37.4', 'Código abierto y autoalojado. El más reciente de los tres, desde 2022.'],
    bitrix24: ['Bitrix24 Free', 'Servicio en la nube. No se instala nada.'],
  };
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;right:96px;top:110px"><h2 data-in>Las tres plataformas</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:300px;display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
      ${P.map((p) => `<figure style="margin:0" data-in><img class="shot" src="${cap(shots[p.key])}" alt="Listado de pólizas filtrado en ${p.name}" width="1440" height="900" style="height:330px">
        <figcaption style="margin-top:24px"><p style="font-family:var(--display);font-size:52px;line-height:1">${kind[p.key][0]}</p><p class="body muted" style="margin-top:14px">${kind[p.key][1]}</p></figcaption></figure>`).join('')}
    </div>`,
    notes: `<p>Las tres plataformas representan tres formas distintas de resolver el problema. EspoCRM es un CRM de código abierto con muchos años en el mercado, que la compañía instala en su propio servidor. Twenty también es de código abierto y autoalojado, pero es el más nuevo: existe desde 2022 y publica versiones casi todas las semanas. Bitrix24 es un servicio en la nube: no hay nada que instalar, se usa desde el navegador.</p><p>Las imágenes son capturas de las pruebas: el mismo listado de pólizas filtrado en cada sistema. En las tres se cargó la misma cartera de prueba.</p>` });

  // 4 · Method: the scale
  S.push({ cls: '', html: `
    <div class="axis" style="top:120px"><h2 data-in>Cómo se valoró cada criterio</h2></div>
    <p class="side" style="top:140px" data-in>Una escala de tres valores, con una regla escrita para cada uno.</p>
    <div class="axis" style="top:330px">
      <table style="width:100%" data-in><tbody>
        <tr><td style="width:90px;font-size:44px">${sign(2)}</td><td style="width:320px;font-weight:500">Cumple</td><td>Queda resuelto: viene listo o se configura una vez desde las pantallas.</td></tr>
        <tr><td style="font-size:44px">${sign(1)}</td><td style="font-weight:500">Cumple con reparo</td><td>Exige escribir código, una tarea manual en cada uso, o resuelve solo una parte.</td></tr>
        <tr><td style="font-size:44px">${sign(0)}</td><td style="font-weight:500">No cumple</td><td>La versión evaluada no lo resuelve.</td></tr>
      </tbody></table>
      <p class="body" style="margin-top:48px;max-width:none" data-in>Solo cuenta lo que trae la versión gratuita. Si un plan pago lo mejoraría, la matriz lo marca con <b>↑</b> y no suma.</p>
    </div>`,
    notes: `<p>Cada criterio recibe uno de tres valores. Cumple, cuando la necesidad queda resuelta, ya sea porque viene lista o porque se configura una sola vez desde las pantallas. Cumple con reparo, cuando para resolverla hay que escribir código, repetir una tarea manual cada vez que se usa, o cuando el sistema cubre solo una parte. Y no cumple, cuando la versión evaluada no lo resuelve.</p><p>Elegimos tres valores y no una escala de diez a propósito: cada valor tiene una regla escrita, y no hay cortes numéricos inventados que decidan el resultado sin que nadie los pueda discutir.</p>` });

  // 5 · Method: weighting and evidence
  S.push({ cls: '', html: `
    <div class="axis" style="top:120px"><h2 data-in>Cómo se probó y cómo se suma</h2></div>
    <div style="position:absolute;left:96px;width:620px;top:300px" data-in>
      <p class="body" style="max-width:none">Criterio <span class="muted">vale 0, 1 o 2</span></p>
      <p class="body" style="max-width:none;margin-top:18px">Grupo <span class="muted">promedio de sus criterios</span></p>
      <p class="body" style="max-width:none;margin-top:18px">Parte <span class="muted">promedio de sus grupos</span></p>
      <p class="body" style="max-width:none;margin-top:18px">Total <span class="muted">${aW} % solicitados y ${bW} % deseables</span></p>
    </div>
    <div class="axis" style="top:300px">
      <p class="body" data-in>Cada criterio se probó usando el sistema, y la prueba quedó grabada en video y en capturas. Lo que no se podía probar se respaldó con la documentación oficial, citada textual.</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:72px">
        ${[[D.evidence.evaluations, 'evaluaciones'], [D.evidence.videos, 'videos'], [D.evidence.captures, 'capturas'], [D.evidence.sources, 'fuentes citadas']]
          .map(([n, l]) => `<div data-in><p class="num" style="font-family:var(--display);font-size:120px;line-height:1">${n}</p><p class="body muted">${l}</p></div>`).join('')}
      </div>
    </div>`,
    notes: `<p>Para que el resultado no dependa de cuántos criterios tiene cada tema, la cuenta se hace en tres niveles: cada criterio vale cero, uno o dos; cada grupo es el promedio de sus criterios; cada parte es el promedio de sus grupos. Todos los grupos pesan igual, porque el pedido del cliente no jerarquiza sus necesidades. Lo solicitado pesa el ${aW} % y lo deseable el ${bW} %, de modo que un extra no compensa una necesidad sin resolver.</p><p>Cada criterio se probó usando el sistema, con su video y sus capturas. Son ${D.evidence.evaluations} evaluaciones, ${D.evidence.videos} videos y ${D.evidence.captures} capturas.</p>` });

  // 6 · Total, on a field page
  S.push({ cls: 'is-field', html: `
    <div style="position:absolute;left:96px;right:96px;top:110px"><h2 data-in>Cumplimiento total</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:340px;display:grid;grid-template-columns:repeat(3,1fr);gap:48px">
      ${P.map((p) => `<div data-in><p class="num" style="font-family:var(--display);font-size:230px;line-height:.9">${D.totals[p.key].toFixed(1).replace('.', ',')}<span style="font-size:110px">%</span></p>
        <p style="font-size:40px;margin-top:28px">${p.name}</p>
        <p class="muted body" style="margin-top:10px">Solicitados ${pct(D.parts[p.key].A)} · deseables ${pct(D.parts[p.key].B)}</p></div>`).join('')}
    </div>
    <p class="side" style="top:900px;width:1100px" data-in>EspoCRM y Twenty quedan a ${gap.toFixed(1).replace('.', ',')} puntos: un empate técnico. Bitrix24 queda más de veinte puntos por debajo.</p>`,
    notes: `<p>Este es el resultado. Twenty obtiene ${pct(D.totals.twenty)}, EspoCRM ${pct(D.totals.espocrm)} y Bitrix24 ${pct(D.totals.bitrix24)}.</p><p>Lo importante es cómo se compone. En lo solicitado, que es lo que más pesa, EspoCRM queda apenas adelante: ${pct(D.parts.espocrm.A)} contra ${pct(D.parts.twenty.A)}. Twenty pasa adelante por los deseables, donde suma más por su asistente de inteligencia artificial y por las mejoras que llegan gratis. La distancia es de ${gap.toFixed(1).replace('.', ',')} puntos: menos de lo que mueve un solo criterio. Por eso el puntaje no alcanza para elegir, y lo que sigue explica qué hay detrás.</p>` });

  // 7 · Summary table: requested
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;right:96px;top:96px"><h2 data-in style="font-size:76px">Resultado por grupo: lo solicitado</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:240px" data-in>
      <table class="compact" style="width:100%">${head}<tbody>${groupRows('A')}${partRow(`Solicitados (${aW} %)`, 'A')}</tbody></table>
      <p class="small muted" style="margin-top:14px">En negrita, el mejor valor de cada grupo.</p>
    </div>`,
    notes: `<p>Acá están los subtotales de los doce grupos de lo solicitado. Hay grupos donde las tres plataformas empatan, como productores y actividad comercial, y grupos que explican la diferencia.</p><p>EspoCRM gana en control de acceso y trazabilidad, que es separar la cartera de cada productor y registrar quién cambió qué, y en atención de reclamos. Twenty gana en la cartera de pólizas, la ficha del asegurado, la explotación de la información y la emisión y cobranza, porque trae avisos, informes y automatizaciones sin programar. Bitrix24 queda abajo en casi todo, con su peor resultado en intercambio de datos y en control de acceso.</p>` });

  // 8 · Summary table: desirable and total
  const adv = plan('espocrm', 'Advanced'), org = plan('twenty', 'Organization'), pro = plan('bitrix24', 'Professional');
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;right:96px;top:96px"><h2 data-in style="font-size:76px">Lo deseable y el resultado</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:250px" data-in>
      <table style="width:100%">${head}<tbody>${groupRows('B')}${partRow(`Deseables (${bW} %)`, 'B')}
        <tr class="total"><td style="font-size:34px">Cumplimiento total</td>${P.map((p) => `<td class="n" style="font-size:40px;font-family:var(--display)">${pct(D.totals[p.key])}</td>`).join('')}</tr></tbody></table>
    </div>
    <div style="position:absolute;left:96px;right:96px;top:700px;display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
      ${[[adv, 'EspoCRM con Advanced Pack'], [org, 'Twenty con Organization'], [pro, 'Bitrix24 con Professional']].map(([x, l]) => `<div data-in style="background:var(--surface);padding:28px 32px">
        <p class="small muted">${l}</p><p class="num" style="font-family:var(--display);font-size:72px;line-height:1.05;margin-top:8px">${x.total}</p><p class="small">${x.price}</p></div>`).join('')}
    </div>`,
    notes: `<p>En lo deseable, Twenty y EspoCRM empatan en las condiciones del negocio asegurador, que son copias, protección de datos y volumen. Twenty se despega en las capacidades por encima de lo pedido, sobre todo por el asistente de inteligencia artificial. Bitrix24 gana ese grupo por su aplicación móvil y su suite integrada, pero queda muy abajo en las condiciones del negocio.</p><p>Abajo, cuánto alcanzaría cada una pagando. EspoCRM con su extensión Advanced Pack, de ${adv.price}, llega a ${adv.total}, más que Twenty con su plan Organization. Bitrix24 con el plan Professional superaría a las otras dos en su versión gratuita, pero ya deja de ser gratis y el abono crece con la cantidad de usuarios.</p>` });

  // 9 · Findings: Bitrix24 limits
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;width:940px;top:120px">
      <p class="small muted" data-in>Hito del análisis · ${['B.2.4', 'B.2.1', 'B.2.6'].map(link).join(' · ')}</p>
      <h2 data-in style="margin-top:20px">Bitrix24 Free tiene límites que una aseguradora no puede asumir</h2>
      <p class="body" data-in style="margin-top:40px">Deja de buscar al superar mil ventas, que en ese plan incluyen las pólizas y los reclamos. El fabricante puede dar de baja la cuenta, con sus datos, tras cincuenta días sin uso. Y aloja los datos en Estados Unidos, que la autoridad argentina no reconoce como país con protección adecuada.</p>
    </div>
    <figure style="position:absolute;left:1100px;right:96px;top:120px;margin:0" data-in>
      <img class="shot" src="${cap('B-2-4-bitrix24-4-filtro-por-campo-tapado-por-el-aviso.png')}" alt="Aviso de Bitrix24 que bloquea la búsqueda al superar mil negociaciones" width="1440" height="900" style="height:452px;object-fit:contain;object-position:left top">
      <figcaption class="caption">Bitrix24: el aviso que bloquea la búsqueda con más de mil ventas registradas.</figcaption>
    </figure>`,
    notes: `<p>El primer hallazgo explica por qué descartamos Bitrix24 en su plan gratuito, aunque es el más cómodo porque no hay que instalar nada. Después, la elección queda entre EspoCRM y Twenty. Cargamos una cartera de veinticinco mil registros, unas quince veces la de una compañía promedio, y a partir de mil ventas el sistema dejó de buscar por texto. Como en el plan gratuito la póliza no puede tener entidad propia, las pólizas y los reclamos se registran como ventas, así que la cartera llega a ese tope en pocos años.</p><p>A eso se suma que el fabricante puede cerrar la cuenta con los datos si nadie entra en cincuenta días, y que los datos quedan en Estados Unidos, que la ley argentina no considera un país con protección adecuada.</p>` });

  // 10 · Findings: cartera by producer
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;width:940px;top:120px">
      <p class="small muted" data-in>Hito del análisis · ${link('A.9.1')}</p>
      <h2 data-in style="margin-top:20px">Twenty gratuito no separa la cartera por productor</h2>
      <p class="body" data-in style="margin-top:40px">En la prueba, un productor abrió por su dirección una póliza de otro y la vio completa. Restringirlo exige el plan Organization, de ${org.price.replace(', con pago anual', '')}. EspoCRM lo resuelve sin costo con un rol.</p>
    </div>
    <figure style="position:absolute;left:1100px;right:96px;top:120px;margin:0" data-in>
      <img class="shot" src="${cap('A-9-1-twenty-2-poliza-ajena-abierta.png')}" alt="Póliza de otro productor abierta en Twenty" width="1440" height="900" style="height:420px">
      <figcaption class="caption">Twenty: la póliza de otro productor, abierta.</figcaption>
      <img class="shot" src="${cap('A-9-1-espocrm-2-solo-lo-suyo.png')}" alt="Listado de EspoCRM con solo las pólizas del productor" width="1440" height="900" style="height:300px;margin-top:24px">
      <figcaption class="caption">EspoCRM: el productor ve solo lo suyo.</figcaption>
    </figure>`,
    notes: `<p>Entre EspoCRM y Twenty, el hallazgo que más pesa es este. En una compañía de seguros el productor asesor atiende su propia cartera: sus clientes son su activo comercial. En Twenty gratuito no hay forma de impedir que un productor vea la cartera de otro. En la prueba, un productor tipeó la dirección de una póliza ajena y la abrió completa.</p><p>Restringirlo en Twenty exige el plan Organization, que se cobra por usuario por mes. En EspoCRM se resuelve con un rol, sin pagar nada: el productor ve solo lo suyo. Este criterio es también una condición de la ley de protección de datos personales.</p>` });

  // 11 · Findings: EspoCRM needs code or Advanced Pack
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;width:940px;top:120px">
      <p class="small muted" data-in>Hito del análisis · ${['A.1.5', 'A.8.3', 'A.10.3', 'A.11.1'].map(link).join(' · ')}</p>
      <h2 data-in style="margin-top:20px">En EspoCRM gratuito, la automatización se programa</h2>
      <p class="body" data-in style="margin-top:40px">Los avisos de vencimiento, los informes que se repiten cada mes, las acciones automáticas y la emisión de la póliza al ganar la venta exigen código o la extensión Advanced Pack, de ${adv.price}. Twenty los trae gratis y se arman desde la pantalla.</p>
    </div>
    <figure style="position:absolute;left:1100px;right:96px;top:120px;margin:0" data-in>
      <img class="shot" src="${cap('A-8-3-twenty-1-evento-y-condicion.png')}" alt="Automatización armada desde la pantalla en Twenty" width="1440" height="900" style="height:420px">
      <figcaption class="caption">Twenty: una automatización armada desde la pantalla.</figcaption>
      <img class="shot" src="${cap('A-1-5-twenty-2-avisos-emitidos.png')}" alt="Avisos de vencimiento emitidos por Twenty" width="1440" height="900" style="height:300px;margin-top:24px">
      <figcaption class="caption">Twenty: los avisos de vencimiento, emitidos solos.</figcaption>
    </figure>`,
    notes: `<p>El siguiente hallazgo es la contracara del anterior. Lo que EspoCRM no trae sin pagar es justo lo que mejor hace Twenty: avisar que una póliza vence, guardar un informe y recalcularlo para otro mes, y automatizar pasos, como emitir la póliza cuando se gana la venta.</p><p>En EspoCRM gratuito todo eso exige escribir código, o comprar la extensión Advanced Pack. La diferencia está en cómo se paga: la extensión de EspoCRM es un monto anual para toda la instalación, mientras que el plan de Twenty se paga por cada usuario.</p>` });

  // 12 · Findings: learning test and the tie
  S.push({ cls: '', html: `
    <div class="axis" style="top:120px">
      <p class="small muted" data-in>Hito del análisis · ${link('A.12.5')} · ${link('B.1.1')}</p>
      <h2 data-in style="margin-top:20px">Sin capacitación, ¿se puede usar?</h2>
    </div>
    <p class="side" style="top:150px" data-in>Tres agentes que no conocían el sistema hicieron las cinco tareas diarias de un productor: alta, póliza, vencimientos, reclamo y llamado.</p>
    <div class="axis" style="top:420px;display:grid;grid-template-columns:repeat(3,1fr);gap:40px">
      ${P.map((p) => `<div data-in><p class="num" style="font-family:var(--display);font-size:124px;line-height:1;white-space:nowrap">${tasks(p.key)}</p><p class="body">${p.name}</p></div>`).join('')}
    </div>
    <div class="axis" style="top:780px"><p class="body" data-in style="max-width:44ch">La distancia total entre EspoCRM y Twenty, ${gap.toFixed(1).replace('.', ',')} puntos, es menor que lo que mueve un solo criterio: si el asistente de Twenty valiera ○, Twenty quedaría detrás.</p></div>`,
    notes: `<p>Para medir si el sistema se aprende sin capacitación hicimos una prueba distinta: tres agentes que nunca habían visto el sistema recibieron las cinco tareas que un productor hace todos los días y tuvieron que resolverlas solo mirando la pantalla. Después, un test comprobó cada tarea sobre los datos guardados; no se les creyó lo que dijeron.</p><p>En EspoCRM completaron todas; en Twenty, una menos, y en Bitrix24, tres menos.</p><p>El segundo dato de la diapositiva es para dimensionar el empate: la diferencia total entre EspoCRM y Twenty es menor que el efecto de un solo criterio. El puntaje no decide; decide qué necesita la compañía.</p>` });

  // 13 · EspoCRM against Twenty
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;right:96px;top:96px"><h2 data-in style="font-size:76px">EspoCRM y Twenty: dónde se separan</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:250px;display:grid;grid-template-columns:1fr 1fr;gap:64px">
      <div><p data-in style="font-family:var(--display);font-size:48px">A favor de EspoCRM: control</p>
        <ul class="list" style="margin-top:20px">${forEspo.map(item).join('')}</ul></div>
      <div><p data-in style="font-family:var(--display);font-size:48px">A favor de Twenty: automatización</p>
        <ul class="list" style="margin-top:20px">${forTwenty.map(item).join('')}</ul></div>
    </div>`,
    notes: `<p>Las dos coinciden en ${D.criteria.length - diff.length} de los ${D.criteria.length} criterios. Estos son los ${diff.length} en que se separan, y el patrón es claro.</p><p>Las ventajas de EspoCRM son de control de la información: quién ve cada cartera, qué pasa cuando dos personas modifican la misma póliza, que los reclamos se numeren solos y que la baja de las comunicaciones se respete sin que nadie lo tenga que recordar.</p><p>Las de Twenty son de automatización: avisos, informes, acciones automáticas, la emisión de la póliza, la documentación en español y el asistente de inteligencia artificial. Además, casi todas sus novedades llegan a la versión gratuita.</p>` });

  // 14 · Legal conditions
  S.push({ cls: '', html: `
    <div style="position:absolute;left:96px;right:96px;top:96px"><h2 data-in style="font-size:76px">Condiciones legales</h2></div>
    <div style="position:absolute;left:96px;right:96px;top:240px" data-in>
      <table style="width:100%"><thead><tr><th>Condición</th><th>Norma</th>${P.map((p) => `<th class="n" style="text-align:center">${p.name}</th>`).join('')}</tr></thead><tbody>
      ${legal.map(([id, name, law]) => `<tr><td>${link(id)} ${name}</td><td class="muted">${law}</td>${P.map((p) => { const x = C[id].platforms[p.key]; return `<td style="text-align:center;font-size:34px">${sign(x.value, x.plans.length)}</td>`; }).join('')}</tr>`).join('')}
      </tbody></table>
      <p class="body" style="margin-top:36px;max-width:none">Ninguna cubre todo sin trabajo adicional. EspoCRM es la que más se acerca, y sus dos reparos se resuelven con trabajo propio.</p>
    </div>`,
    notes: `<p>Una pregunta que importa en un sector regulado: ¿alguna permite cumplir todas las normas? Ninguna lo hace por completo sin trabajo adicional. El cumplimiento es obligación de la compañía; lo que evaluamos es si el sistema le da los medios.</p><p>EspoCRM es la que más se acerca. El plazo de diez días hábiles de los reclamos que pide la Superintendencia se calcula con un código escrito una vez, y los pedidos de los titulares de datos se atienden con una exportación y una constancia que se lleva aparte. Twenty suma la falta del acceso por productor. Bitrix24 Free es la que más se aleja, sobre todo por dónde guarda los datos.</p>` });

  // 15 · Conclusion, on a field page
  S.push({ cls: 'is-field', html: `
    <div style="position:absolute;left:96px;right:96px;top:120px"><h1 data-in style="font-size:150px">Se recomienda EspoCRM</h1></div>
    <div style="position:absolute;left:96px;right:96px;top:420px;display:grid;grid-template-columns:repeat(3,1fr);gap:56px">
      <div data-in><p style="font-family:var(--display);font-size:46px;line-height:1.05">Si cada productor debe ver solo su cartera</p><p class="body" style="margin-top:20px;color:var(--field-muted)">EspoCRM, con el Advanced Pack si se quieren avisos, informes y automatizaciones sin programar.</p></div>
      <div data-in><p style="font-family:var(--display);font-size:46px;line-height:1.05">Si la cartera la atiende un equipo que puede verla completa</p><p class="body" style="margin-top:20px;color:var(--field-muted)">Twenty ofrece más sin pagar y es la que más evoluciona, a cambio de actualizar seguido.</p></div>
      <div data-in><p style="font-family:var(--display);font-size:46px;line-height:1.05">En cualquier caso</p><p class="body" style="margin-top:20px;color:var(--field-muted)">Hace falta una persona técnica que mantenga el servidor y las copias. Bitrix24 Free no es viable.</p></div>
    </div>`,
    notes: `<p>La recomendación es EspoCRM, y el motivo es del negocio: el productor asesor atiende su propia cartera, y EspoCRM es la única que, sin pagar, permite que cada uno vea solo la suya. Además avisa cuando dos personas tocan la misma póliza, numera solos los reclamos y es la que más se acerca a las condiciones legales.</p><p>Si a la compañía no le hace falta separar carteras, porque la atiende un equipo propio, la balanza se da vuelta y la opción es Twenty: trae más sin costo y es la que más evoluciona.</p><p>Con cualquiera de las dos hace falta alguien que mantenga el servidor y las copias. Si no se cuenta con esa persona, quedan las versiones pagas en la nube.</p>` });

  // 16 · Questions
  S.push({ cls: '', html: `
    <div class="axis" style="top:420px"><h1 data-in>Preguntas</h1></div>
    <p class="side lead" style="top:470px;color:var(--ink)" data-in>Cada criterio, con su justificación completa y el video de la prueba.</p>
    <div class="axis" style="top:700px"><p data-in><a class="button" href="criterios.html">Abrir la consulta por criterio</a></p></div>`,
    notes: `<p>Con esto cerramos. Para cualquier pregunta sobre un criterio en particular abrimos la consulta: se busca por código o por nombre y muestra, para cada plataforma, el valor, cómo lo resuelve, la justificación, lo que cambiaría un plan pago, las fuentes citadas y el video de la prueba.</p>` });

  const stage = document.querySelector('.stage');
  stage.innerHTML = S.map((s, i) => `<section class="slide ${s.cls}" aria-label="Diapositiva ${i + 1}">${s.html}<p class="foot">Selección de un sistema CRM · ${i + 1} / ${S.length}</p><div class="notes">${s.notes}</div></section>`).join('');
})();
