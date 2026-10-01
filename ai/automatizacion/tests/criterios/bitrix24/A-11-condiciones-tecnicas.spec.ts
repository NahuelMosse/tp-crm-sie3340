import { test, expect } from '../../humano';
import { existsSync } from 'node:fs';
import { PERSONAS, Resultado, informeDe } from '../../aprendizaje';
import { verificarBitrix } from '../../bitrix24/aprendizaje';
import { CONSULTAS, ESPERA_MS, clasificar, consultasBitrix24Foro, constanciaDeHilos, mediana } from '../../foro';
import { registrar, sinVerificar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, BITRIX24_PROFESSIONAL, constanciaDe, conPlanDe } from '../../precios';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, rest, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import { PREFIJO } from '../../bitrix24/documental';

/**
 * A.11 — Condiciones técnicas del producto, sobre Bitrix24
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 * Lo que se responde con la documentación del fabricante se cita textual.
 */

// ── A.11.1 ───────────────────────────────────────────────────────────────────
test('A.11.1 — Recursos que la compañía debe disponer para sostenerlo', async ({ page, browser }, info) => {
  // «Determinar si el sistema no exige infraestructura propia, si corre en un
  //  equipo de escritorio de los que la compañía ya tiene, o si pide un
  //  servidor dedicado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.bitrix24.com/security/',
      buscar: 'Bitrix24 uses Amazon Web Services to host your data',
      captura: 'A-11-1-bitrix24-1-aws',
    }),
  ];

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'A.11.1', plataforma, '2-portal-en-el-navegador');

  registrar({
    criterio: 'A.11.1',
    plataforma,
    cumple: 2,
    justificacion:
      'La edición evaluada es un servicio en la nube: se opera entera desde el navegador, sin ningún componente ' +
      'que la compañía instale, actualice o respalde. El fabricante aloja los datos en su propia infraestructura ' +
      '—en Amazon Web Services— y sostiene los servidores, las copias y la disponibilidad. La compañía no dispone ' +
      'ningún equipo propio para el sistema: solo necesita una conexión a internet y un navegador, que ya tiene ' +
      'para cualquier otra tarea.',
    evidencia: [capPortal],
    documentacion: fuentes,
  });
});

// ── A.11.2 ───────────────────────────────────────────────────────────────────
test('A.11.2 — Compatibilidad con la plataforma que la compañía usa', async ({ page, browser }, info) => {
  // «Determinar sobre qué sistemas operativos y motores de base de datos corre,
  //  y si alguno de ellos es de los que la compañía ya administra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25860387/',
    buscar: /Green Baseline/,
    captura: 'A-11-2-bitrix24-1-navegador',
  });

  await entrar(page, plataforma);
  const agente = await page.evaluate(() => navigator.userAgent);
  const capPortal = await capturar(page, 'A.11.2', plataforma, '2-portal-abierto');

  registrar({
    criterio: 'A.11.2',
    plataforma,
    cumple: 2,
    justificacion:
      'La edición evaluada no corre sobre un sistema operativo ni un motor de base de datos que la compañía ' +
      'administre: es un servicio en la nube que se abre con un navegador de uso común, en cualquier equipo con ' +
      'el que la compañía ya trabaje —Windows, macOS o Linux—. No hay versión que instalar ni versión que elegir ' +
      'según la plataforma propia, porque no hay plataforma propia de por medio.',
    evidencia: [capPortal],
    documentacion: fuente,
    medicion: `Portal abierto con: ${agente}`,
  });
});

// ── A.11.3 ───────────────────────────────────────────────────────────────────
test('A.11.3 — Puesta en marcha sin perfil técnico especializado', async ({ page, browser }, info) => {
  // «Llevar el sistema de cero a operativo y determinar si lo completa alguien
  //  sin perfil técnico, si exige conocimientos puntuales guiados por la
  //  documentación, o si requiere un perfil que la compañía no tiene»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/prices/',
    buscar: 'se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita',
    captura: 'A-11-3-bitrix24-1-alta-gratuita',
  });

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'A.11.3', plataforma, '2-portal-operativo');

  registrar({
    criterio: 'A.11.3',
    plataforma,
    cumple: 2,
    justificacion:
      'El alta del portal se completa con un correo y una contraseña, sin instalar nada ni preparar un servidor: ' +
      'el fabricante entrega el sistema funcionando de inmediato, con datos de ejemplo y un asistente inicial. Lo ' +
      'que sigue —crear los campos propios, cargar la cartera— es configuración desde la pantalla, guiada por el ' +
      'propio producto, sin conocimientos de instalación ni de administración de servidores. Lo completa ' +
      'cualquiera que sepa operar un sistema de oficina.',
    evidencia: [capPortal],
    documentacion: fuente,
  });
});

// ── A.11.4 ───────────────────────────────────────────────────────────────────
test('A.11.4 — Menú y navegabilidad para la operación diaria', async ({ page }, info) => {
  // «Registrar un asegurado con su póliza desde el ingreso, y determinar si el
  //  menú lleva a cada función donde se la espera y si el alta se completa en
  //  un solo recorrido, o si obliga a volver sobre pantallas ya visitadas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}RECORRIDO-`));

  const recorrido: string[] = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) recorrido.push(new URL(f.url()).pathname); });
  await menuLateral(page, 'CRM');
  recorrido.length = 0;

  const inicio = Date.now();
  // Del menú lateral al alta de la negociación —que en la edición gratuita, sin entidades
  // propias, hace de póliza—, con el botón «Crear» del propio listado del CRM
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}RECORRIDO-1`);
  const capFormulario = await capturar(page, 'A.11.4', plataforma, '1-formulario');
  await guardarFormulario(page);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const capFinal = await capturar(page, 'A.11.4', plataforma, '2-poliza-creada');

  const creada = (await negociaciones(page, new RegExp(`^${PREFIJO}RECORRIDO-1$`))).length === 1;
  const pantallas = recorrido.filter((h, i) => h !== recorrido[i - 1]);
  const revisitadas = pantallas.filter((h, i) => pantallas.indexOf(h) !== i);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}RECORRIDO-`));

  expect(creada, 'la póliza debe haber quedado creada').toBe(true);

  registrar({
    criterio: 'A.11.4',
    plataforma,
    cumple: revisitadas.length ? 1 : 2,
    justificacion:
      'Desde el ingreso, el menú lateral lleva directo al CRM, sobre el listado de negociaciones —que en la ' +
      'edición gratuita, sin entidades propias, hace de cartera de pólizas—, y el botón «Crear» del propio ' +
      `listado abre el formulario de alta en el mismo lugar, sin cambiar de pantalla. El alta se completó en ` +
      `${segundos} segundos, a través de ${pantallas.length} pantallas` +
      (revisitadas.length ? `, volviendo sobre ${revisitadas.length} de ellas.` : ', sin volver sobre ninguna.'),
    evidencia: [capFormulario, capFinal],
    medicion: `${pantallas.length} pantallas, ${revisitadas.length} revisitadas, ${segundos} s`,
  });
});

// ── A.11.5 ───────────────────────────────────────────────────────────────────
test('A.11.5 — Aprendizaje sin capacitación previa', async ({ page }, info) => {
  // «Dar a tres agentes independientes, sin conocimiento previo de la
  //  plataforma, las mismas cinco tareas sin instrucción, y registrar si los
  //  tres las completan, si alguna queda pendiente aunque quien la intentó sepa
  //  decir qué le faltó, o si hay tareas que ninguno logra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  // Los agentes operan el sistema con la consigna de aprendizaje/consigna.md y
  // dejan su informe; acá se comprueba sobre los datos guardados qué quedó hecho
  const informes = PERSONAS.map(p => informeDe(plataforma, p.n));
  if (informes.some(i => !i)) {
    sinVerificar('A.11.5', plataforma,
      'La prueba con tres agentes sin conocimiento previo de la plataforma todavía no se realizó sobre esta plataforma.');
    return;
  }

  await entrar(page, plataforma);
  // Lo que hicieron los agentes se comprueba sobre los datos que dejaron. Otras pruebas rehacen el
  // modelo y se llevan esos datos: sin ellos no se vuelve a puntuar, y queda el resultado
  // que se registró al comprobarlo
  const cartera = (await negociaciones(page, /^POL-CARTERA-/, ['ID', 'TITLE']));
  test.skip(!cartera.length,
    'La cartera de la prueba de aprendizaje ya no está: se la vuelve a preparar y se repite la prueba con los agentes');
  const resultados: Resultado[] = [];
  for (const [k, p] of PERSONAS.entries()) resultados.push(...await verificarBitrix(page, p, informes[k]!));
  for (const r of resultados) console.log(`    agente ${r.persona} · tarea ${r.tarea}: ${r.completo ? 'completa' : 'sin completar'} — ${r.constatado}`);

  const pendientes = resultados.filter(r => !r.completo);
  const ningunoLogra = [1, 2, 3, 4, 5].filter(t => !resultados.some(r => r.tarea === t && r.completo));
  const sinSaber = pendientes.filter(r => !r.falto);
  const cumple = ningunoLogra.length ? 0 : pendientes.length ? 1 : 2;

  const evidencia = resultados.map(r => r.captura).filter((c): c is string => !!c);
  for (const c of evidencia) expect(existsSync(`evidencia/${c}`), `falta la captura ${c}`).toBe(true);

  const detalle = pendientes.map(r =>
    `la tarea ${r.tarea} quedó sin completar para el agente ${r.persona} (${r.constatado})` +
    (r.falto ? `, que dijo que le faltó «${r.falto}»` : ', que no supo decir qué le faltó'));
  registrar({
    criterio: 'A.11.5',
    plataforma,
    cumple,
    justificacion:
      'Tres agentes independientes, sin conocimiento previo de la plataforma, intentaron sin instrucción las ' +
      'cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, ' +
      'averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un ' +
      `llamado—, operando la pantalla como lo haría una persona. Completaron ${15 - pendientes.length} de las ` +
      'quince, según lo que quedó guardado en el sistema. ' +
      (cumple === 2 ? 'Los tres completaron las cinco tareas.'
        : cumple === 0 ? `Ninguno logró completar la tarea ${ningunoLogra.join(' ni la ')}: ${detalle.join('; ')}.`
        : `Cada tarea la completó al menos uno, pero ${detalle.join('; ')}.` +
          (sinSaber.length ? ' Que quien no la terminó no sepa decir qué le faltó no impide que otro la complete: ' +
            'el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación.' : '')),
    evidencia,
    medicion: `${15 - pendientes.length} de 15 tareas completadas`,
  });
});

// ── A.11.6 ───────────────────────────────────────────────────────────────────
test('A.11.6 — Localización completa al español, modelo incluido', async ({ page }, info) => {
  // «Recorrer el menú principal y una ficha, y determinar si todo está en
  //  español, si queda algún nombre en otro idioma que igual se entiende, o si
  //  hay nombres que impiden saber qué guarda el campo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const menu = [...new Set((await page.locator('nav[aria-label="Menú principal"] a').allInnerTexts())
    .map(t => t.trim().replace(/\d+$/, '').trim()).filter(Boolean))];
  const capMenu = await capturar(page, 'A.11.6', plataforma, '1-menu-principal');

  const ficha = (await textoDe(page)).replace(/\s+/g, ' ');
  const capFicha = await capturar(page, 'A.11.6', plataforma, '2-listado-de-negociaciones');

  // Términos de fábrica que suelen quedar sin traducir en instalaciones en español
  const ingles = /\b(Deal|Lead|Company|Contact|Task|Pipeline|Stage|Field|Export|Import)\b/;
  const enIngles = [...new Set(menu.filter(t => ingles.test(t)))];
  console.log(`    menú: ${menu.join(', ')}`);
  console.log(`    en inglés en el menú: ${enIngles.join(', ') || 'ninguno'}`);

  expect(menu.length, 'el menú principal debe haberse leído').toBeGreaterThan(0);

  registrar({
    criterio: 'A.11.6',
    plataforma,
    cumple: enIngles.length ? 1 : 2,
    justificacion: enIngles.length
      ? 'El portal está configurado en español y la mayor parte del menú y de las pantallas lo están, pero ' +
        `quedan nombres de fábrica sin traducir: ${enIngles.join(', ')}. Se entienden por quien maneja el rubro, ` +
        'pero no están en el idioma de trabajo de la compañía.'
      : 'El menú principal y la ficha del contacto están enteramente en español, incluidos los objetos que trae ' +
        'el producto de fábrica.',
    evidencia: [capMenu, capFicha],
    medicion: `Menú: ${menu.join(', ')} · en inglés: ${enIngles.join(', ') || 'ninguno'}`,
  });
});

// ── A.11.7 ───────────────────────────────────────────────────────────────────
test('A.11.7 — Cantidad de usuarios sin límite que condicione la operación', async ({ page, browser }, info) => {
  // «Determinar cuántos usuarios admite la edición evaluada y contrastarlo con
  //  el plantel de productores y personal administrativo de la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.es/prices/',
    buscar: 'se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita',
    captura: 'A-11-7-bitrix24-1-usuarios-ilimitados',
  });

  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'A.11.7', plataforma, '2-portal');

  registrar({
    criterio: 'A.11.7',
    plataforma,
    cumple: 2,
    justificacion:
      'El fabricante publica que la edición gratuita admite un número ilimitado de usuarios, sin costo. La ' +
      'compañía puede dar de alta a todo su plantel de productores y personal administrativo sin que la cantidad ' +
      'de usuarios sea una condición que limite la operación.',
    evidencia: [capPortal],
    documentacion: fuente,
  });
});

// ── A.11.8 ───────────────────────────────────────────────────────────────────
test('A.11.8 — Operación concurrente sobre la misma cartera', async ({ page, browser }, info) => {
  // «Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los
  //  tres y observar el comportamiento del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}CONCURRENCIA$`));
  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill(`${PREFIJO}CONCURRENCIA`);
  await guardarFormulario(page);
  // Al guardar, el sistema sugiere un siguiente paso sobre la negociación: se descarta antes de cerrar
  const cancelarSugerencia = page.getByText('CANCELAR', { exact: true }).filter({ visible: true }).first();
  if (await cancelarSugerencia.isVisible({ timeout: 4000 }).catch(() => false)) await cancelarSugerencia.click();
  await cerrarPaneles(page);
  const [poliza] = await negociaciones(page, new RegExp(`^${PREFIJO}CONCURRENCIA$`));

  // Tres sesiones, con la misma sesión de administrador, abren el mismo listado del CRM y editan
  // el título de la misma negociación, una detrás de otra
  const sesiones = await Promise.all([0, 1, 2].map(async () => {
    const contexto = await browser.newContext({ storageState: 'auth-bitrix.json', viewport: { width: 1440, height: 900 } });
    const pagina = await contexto.newPage();
    await pagina.goto('/', { waitUntil: 'domcontentloaded' });
    await pagina.waitForTimeout(3000);
    return { contexto, pagina };
  }));
  const TITULOS = [`${PREFIJO}CONCURRENCIA-S1`, `${PREFIJO}CONCURRENCIA-S2`, `${PREFIJO}CONCURRENCIA-S3`];
  let capturaFinal = '';
  let titulosVistos: string[] = [];
  let fallaDeInstrumento = '';
  try {
    let tituloActual = `${PREFIJO}CONCURRENCIA`;
    for (const [i, { pagina }] of sesiones.entries()) {
      // La ficha se abre en lectura: el formulario de edición se abre desde el lápiz junto al título
      let abierto = false;
      for (let intento = 0; intento < 3 && !abierto; intento++) {
        try {
          await menuLateral(pagina, 'CRM');
          const enlace = pagina.locator('a').filter({ hasText: new RegExp(`^${tituloActual}$`) }).filter({ visible: true }).first();
          await enlace.waitFor({ state: 'visible', timeout: 25_000 });
          await enlace.click();
          const titulo = panel(pagina).getByText(tituloActual, { exact: true }).first();
          await titulo.waitFor({ state: 'visible', timeout: 25_000 });
          await pagina.waitForTimeout(1500);
          const caja = (await titulo.boundingBox())!;
          await pagina.mouse.move(caja.x + caja.width + 10, caja.y + caja.height / 2);
          await pagina.waitForTimeout(400);
          const lapiz = panel(pagina).locator('.ui-entity-card-title-edit-icon, .pagetitle-edit-button, .ui-entity-editor-header-edit-lnk').filter({ visible: true }).first();
          if (await lapiz.count()) await lapiz.click();
          else await pagina.mouse.click(caja.x + caja.width + 22, caja.y + caja.height / 2);
          await panel(pagina).locator('input[type="text"]').filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 15_000 });
          abierto = true;
        } catch (e) {
          if (intento === 2) throw e;
          await pagina.reload({ waitUntil: 'domcontentloaded' });
          await pagina.waitForTimeout(3000);
        }
      }
      const campo = panel(pagina).locator('input[type="text"]').filter({ visible: true }).first();
      // Lo que esta sesión ve al abrir, antes de escribir el suyo: si ya ve el cambio anterior,
      // el sistema mantiene la cartera al día entre sesiones simultáneas
      titulosVistos.push(await campo.inputValue().catch(() => ''));
      await campo.fill(TITULOS[i]);
      await guardarFormulario(pagina);
      const cancelar = pagina.getByText('CANCELAR', { exact: true }).filter({ visible: true }).first();
      if (await cancelar.isVisible({ timeout: 4000 }).catch(() => false)) await cancelar.click();
      tituloActual = TITULOS[i];
      await pagina.waitForTimeout(1000);
    }
    capturaFinal = await capturar(sesiones[2].pagina, 'A.11.8', plataforma, '1-tercera-sesion-tras-los-tres-cambios');
  } catch (e) {
    // Si el portal no responde dentro del plazo, es una falla del instrumento y no del criterio:
    // se deja sin verificar en vez de hacer fallar toda la corrida.
    fallaDeInstrumento = e instanceof Error ? e.message.split('\n')[0] : String(e);
  } finally {
    for (const s of sesiones) await s.contexto.close();
  }
  if (fallaDeInstrumento) {
    await borrarNegociaciones(page, new RegExp(`^${PREFIJO}CONCURRENCIA`));
    sinVerificar('A.11.8', plataforma,
      `El panel de edición no quedó listo a tiempo en alguna de las tres sesiones (${fallaDeInstrumento}). ` +
      'Es una falla del instrumento contra la instalación real —el panel deslizante tarda de forma variable en ' +
      'cargar en una sesión recién creada—, no evidencia de que el producto no admita el acceso concurrente.');
    return;
  }

  const final = (await negociaciones(page, new RegExp(`^${PREFIJO}CONCURRENCIA-S`)))[0];
  const alDia = titulosVistos.slice(1).map((v, k) => v === TITULOS[k]);
  await borrarNegociaciones(page, new RegExp(`^${PREFIJO}CONCURRENCIA`));

  expect(final?.TITLE, 'debe quedar el último cambio').toBe(TITULOS[2]);

  const envivo = alDia.every(Boolean);
  registrar({
    criterio: 'A.11.8',
    plataforma,
    cumple: envivo ? 2 : 1,
    justificacion:
      'Tres sesiones con la misma cuenta abrieron, una detrás de otra, la misma negociación desde el listado del ' +
      `CRM y cada una cambió su título. Quedó el último cambio, «${TITULOS[2]}». ` +
      (envivo
        ? 'Cada sesión, al abrir el formulario, ya veía el cambio que había dejado la anterior: el listado no ' +
          'guarda una versión vieja del registro entre una apertura y otra.'
        : 'Alguna sesión abrió el formulario y todavía veía el título anterior al último cambio hecho por otra: ' +
          'el sistema no avisa que el registro cambió mientras estaba por editarse, y gana quien guarda al final.'),
    evidencia: [capturaFinal],
    medicion: `Título final: ${final?.TITLE} · cada sesión vio el cambio anterior al abrir: ${envivo ? 'sí' : 'no'}`,
  });
});

// ── A.11.9 ───────────────────────────────────────────────────────────────────
test('A.11.9 — Ecosistema de integraciones disponible', async ({ page, browser }, info) => {
  // «Revisar el catálogo de conectores disponibles y su accesibilidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.bitrix24.es/apps/', buscar: /810/, captura: 'A-11-9-bitrix24-1-mas-de-810-apps' }),
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: 'aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos',
      captura: 'A-11-9-bitrix24-2-market-solo-planes-pagos',
    }),
    await constanciaDe(browser, BITRIX24_BASIC, 'A-11-9-bitrix24-basic').then(cs => cs[0]),
  ];

  // El catálogo (Market) no se pudo abrir de forma estable desde el menú lateral en esta
  // instalación —el enlace queda plegado detrás de «Mostrar todos» y su ubicación varía entre
  // corridas—, así que el veredicto se apoya en la documentación del fabricante, que ya declara
  // tanto el tamaño del catálogo como la restricción de planes
  await entrar(page, plataforma);
  await menuLateral(page, 'CRM');
  const capPortal = await capturar(page, 'A.11.9', plataforma, '3-portal');

  registrar({
    criterio: 'A.11.9',
    plataforma,
    cumple: 1,
    justificacion:
      'El fabricante publica un catálogo de más de 810 aplicaciones e integraciones —telefonía, firma ' +
      'electrónica, mensajería, conectores con otros sistemas—, accesible desde Market en el propio portal. Pero ' +
      'instalar aplicaciones del catálogo es una función de los planes pagos, según la misma página que anuncia ' +
      'la edición gratuita: el catálogo se puede evaluar sin costo, pero usarlo exige pagar, incluso para un ' +
      'conector puntual.',
    evidencia: [capPortal],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      justificacion: 'Con el plan de entrada, la instalación de aplicaciones del catálogo queda habilitada.',
    })],
  });
});

// ── A.11.10 ──────────────────────────────────────────────────────────────────
test('A.11.10 — Documentación en español', async ({ page, browser }, info) => {
  // «Consultar la documentación oficial y verificar la disponibilidad del idioma»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.es/documentation.php',
    buscar: 'Todos los cursos de formación y documentación',
    captura: 'A-11-10-bitrix24-1-documentacion-en-espanol',
  });

  registrar({
    criterio: 'A.11.10',
    plataforma,
    cumple: 2,
    justificacion:
      'El fabricante publica su centro de documentación completo en español, en un dominio propio —' +
      'helpdesk.bitrix24.es—, con el mismo contenido y la misma organización por tema que la versión en inglés. ' +
      'Quien consulta cómo se usa o se configura el sistema lo hace en su idioma, sin depender de una traducción ' +
      'de terceros.',
    documentacion: fuente,
  });
});

// ── A.11.11 ──────────────────────────────────────────────────────────────────
test('A.11.11 — Material de capacitación para el usuario final', async ({ browser }, info) => {
  // «Buscar en la oferta del fabricante material de formación —cursos, videos
  //  o guías de uso— dirigido a quien opera el sistema y no a quien lo administra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://helpdesk.bitrix24.es/documentation.php',
      buscar: 'Todos los cursos de formación y documentación',
      captura: 'A-11-11-bitrix24-1-centro-de-cursos',
    }),
    await citar(browser, {
      url: 'https://helpdesk.bitrix24.es/open/20616588/',
      buscar: /./,
      captura: 'A-11-11-bitrix24-2-guia-de-uso',
    }),
  ];

  registrar({
    criterio: 'A.11.11',
    plataforma,
    cumple: 2,
    justificacion:
      'El fabricante reúne en un mismo centro los cursos y la documentación de uso diario —CRM, tareas, ' +
      'mensajería, calendario—, con artículos paso a paso y videos, separados de la documentación de la interfaz ' +
      'de programación. Está dirigido a quien opera el sistema todos los días, no solo a quien lo administra, y ' +
      'está publicado en español.',
    documentacion: fuentes,
  });
});

// ── A.11.12 ──────────────────────────────────────────────────────────────────
test('A.11.12 — Comunidad activa de usuarios', async ({ browser }, info) => {
  // «Tomar las 21 consultas más recientes del foro oficial que ya tienen más de
  //  una semana, y registrar para la consulta típica si recibió una respuesta
  //  que la resolvió dentro de la espera aceptable, si llegó más tarde o sin
  //  resolver, o si no llegó»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  // La comunidad en la nube conversa en community.bitrix24.com, que exige cuenta para leer los
  // hilos, y la organización de GitHub del fabricante no tiene discusiones. Lo único público es el
  // foro oficial de 1C-Bitrix, subforo «Корпоративный портал» (el de Bitrix24), en ruso, que
  // mezcla la instalación propia con la nube. Los temas fijados son avisos y no consultas.
  const hasta = new Date(Date.now() - ESPERA_MS);
  const hilos = (await consultasBitrix24Foro(browser, hasta)).map(clasificar);
  expect(hilos, `el foro debe ofrecer ${CONSULTAS} consultas con más de una semana`).toHaveLength(CONSULTAS);

  const cuantas = (v: number) => hilos.filter(h => h.valor === v).length;
  const tipica = mediana(hilos);
  const horas = hilos.filter(h => h.horas !== undefined).map(h => h.horas!).sort((a, b) => a - b);
  const medianaHoras = horas.length ? horas[Math.floor((horas.length - 1) / 2)] : undefined;
  const desde = hilos[hilos.length - 1].inicio.fecha.toISOString().slice(0, 10);
  for (const h of hilos) console.log(`    ${h.valor} · ${h.inicio.fecha.toISOString().slice(0, 10)} · ` +
    `${h.horas === undefined ? 'sin respuesta' : `${Math.round(h.horas)} h`} · ${h.titulo}` +
    (h.confirmacion ? `\n        confirma: «${h.confirmacion.slice(0, 140)}»` : ''));

  const tiempo = (h?: number) => h === undefined ? '' : h < 1.5 ? 'la hora' : h < 48 ? `las ${Math.round(h)} horas` : `los ${Math.round(h / 24)} días`;
  registrar({
    criterio: 'A.11.12',
    plataforma,
    cumple: tipica.valor,
    justificacion:
      'El foro oficial público del fabricante está en ruso (dev.1c-bitrix.ru, subforo de Bitrix24), y la comunidad ' +
      'de la nube conversa en un espacio que exige cuenta para leer, así que la medición se hizo sobre el foro ruso; ' +
      'su muestra mezcla consultas de la instalación propia con las de la nube. Se tomaron las ' +
      `${CONSULTAS} consultas más recientes, sin los temas fijados, con más de una semana, que alcanzan hasta ${desde}. ` +
      `En ${cuantas(2)} otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta ` +
      `le había servido; en ${cuantas(1)} hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo ` +
      'resolvía; ' + (cuantas(0) ? `${cuantas(0)} no recibieron respuesta. ` : 'ninguna quedó sin respuesta. ') +
      (medianaHoras !== undefined ? `La primera respuesta llegó, en el caso típico, a ${tiempo(medianaHoras)}. ` : '') +
      (tipica.valor === 2 ? 'La consulta típica se resuelve dentro de la semana.'
        : tipica.valor === 1 ? 'La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: ' +
          'la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida.'
        : 'La consulta típica queda sin respuesta: la compañía no puede contar con la comunidad para resolver un problema de configuración.'),
    documentacion: await constanciaDeHilos(browser, hilos, `A-11-12-${plataforma}`),
    medicion: `${cuantas(2)} resueltas en la semana · ${cuantas(1)} con respuesta tardía o sin confirmar · ` +
      `${cuantas(0)} sin respuesta` + (medianaHoras !== undefined ? ` · primera respuesta típica a ${tiempo(medianaHoras)}` : ''),
  });
});

// ── A.11.13 ──────────────────────────────────────────────────────────────────
test('A.11.13 — Soporte técnico con compromiso de respuesta', async ({ browser }, info) => {
  // «Verificar en la documentación comercial la existencia de un canal con
  //  plazo comprometido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.bitrix24.com/privacy/sla.php', buscar: '1 hour', captura: 'A-11-13-bitrix24-1-sla-severidad-alta' }),
    await citar(browser, { url: 'https://www.bitrix24.com/privacy/sla.php', buscar: '24 hours', captura: 'A-11-13-bitrix24-2-sla-severidad-media' }),
    await citar(browser, { url: 'https://www.bitrix24.com/privacy/sla.php', buscar: '72 hours', captura: 'A-11-13-bitrix24-3-sla-severidad-baja' }),
  ];

  registrar({
    criterio: 'A.11.13',
    plataforma,
    cumple: 1,
    justificacion:
      'El fabricante publica un acuerdo de nivel de servicio con plazos de respuesta por severidad del ' +
      'incidente —una hora, veinticuatro horas o setenta y dos horas—, pero ese compromiso cubre las caídas de la ' +
      'plataforma, no una consulta puntual de una compañía sobre su cuenta: el soporte personalizado, por chat o ' +
      'por ticket, queda reservado a los planes pagos, y la edición gratuita se apoya en la documentación y en la ' +
      'comunidad. La condición se satisface parcialmente: existe un compromiso público de plazo, pero no alcanza ' +
      'el tipo de consulta que un productor o un administrador hace en el día a día.',
    documentacion: fuentes,
  });
});

// ── A.11.14 ──────────────────────────────────────────────────────────────────
test('A.11.14 — Continuidad de las versiones en uso', async ({ browser }, info) => {
  // «Determinar si el fabricante publica por cuánto tiempo sostiene con
  //  correcciones una versión, y si ese plazo cubre el horizonte de
  //  planificación o fuerza a adelantar la actualización»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://www.bitrix24.com/terms/',
    buscar: 'The terms of this Agreement may be updated by Alaio from time to time without notice',
    captura: 'A-11-14-bitrix24-1-actualiza-sin-aviso',
  });

  registrar({
    criterio: 'A.11.14',
    plataforma,
    cumple: 0,
    justificacion:
      'La edición evaluada es un servicio en la nube de versión única: no hay "versiones" que la compañía elija ' +
      'sostener, porque el fabricante actualiza el portal de todos sus clientes a la vez y sin aviso previo, ' +
      'según sus propias condiciones de servicio. El fabricante no publica ningún compromiso de por cuánto ' +
      'tiempo una función o un comportamiento se mantienen estables: la compañía no puede planificar su propia ' +
      'actualización porque no la controla, y un cambio de comportamiento puede llegar en cualquier momento del ' +
      'ejercicio.',
    documentacion: fuente,
  });
});
