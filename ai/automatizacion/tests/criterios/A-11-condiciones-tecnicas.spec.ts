import { test, expect } from '../humano';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { PERSONAS, informeDe, verificarEspo } from '../aprendizaje';
import { CONSULTAS, ESPERA_MS, clasificar, consultasVBulletin, constanciaDeHilos, mediana } from '../foro';
import { registrar, sinVerificar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { citar } from '../fuentes';
import { ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { soloEn, capturar, textoDe } from './comun';
import { apiEspo, crear, listar } from '../api';
import { administracion, pestana, listado, edicion } from '../espocrm/navegar';

/**
 * A.11 — Condiciones técnicas del producto
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 *
 * Varios se responden con la documentación del fabricante. En esos, el test
 * no afirma: abre la página oficial, comprueba que el texto esté publicado y
 * lo registra textual con la fecha de consulta.
 */

// ── A.11.1 ───────────────────────────────────────────────────────────────────
test('A.11.1 — Recursos que la compañía debe disponer para sostenerlo', async ({ page, browser }, info) => {
  // «Determinar si el sistema no exige infraestructura propia, si corre en un
  //  equipo de escritorio de los que la compañía ya tiene, o si pide un
  //  servidor dedicado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  // Lo que consume de verdad la instalación evaluada, con la cartera cargada
  const consumo = execFileSync('docker', ['stats', '--no-stream', '--format', '{{.Name}} {{.MemUsage}}',
    'tp-espocrm', 'tp-espocrm-db'], { encoding: 'utf8' }).trim().split('\n');
  const megas = consumo.map(l => {
    const m = l.match(/([\d.]+)\s*(MiB|GiB)/);
    return m ? parseFloat(m[1]) * (m[2] === 'GiB' ? 1024 : 1) : 0;
  }).reduce((a, b) => a + b, 0);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/download/', buscar: 'NGINX, Apache, or IIS', captura: 'A-11-1-espocrm-1-requisitos' }),
    await citar(browser, { url: 'https://www.espocrm.com/download/', buscar: 'Get EspoCRM running in minutes', captura: 'A-11-1-espocrm-2-docker' }),
  ];

  await entrar(page, plataforma);
  await administracion(page, '#Admin/systemRequirements');
  await page.waitForTimeout(5000);
  const capRequisitos = await capturar(page, 'A.11.1', plataforma, '3-requisitos-del-sistema');

  expect(megas, 'la medición de memoria debe haber devuelto un valor').toBeGreaterThan(0);

  registrar({
    criterio: 'A.11.1',
    plataforma,
    cumple: 1,
    justificacion:
      'La edición gratuita se instala en infraestructura de la compañía: pide un servidor web, PHP y una base ' +
      'de datos. No exige un servidor dedicado: la instalación evaluada corre en un equipo de escritorio común, ' +
      `con la imagen oficial de contenedores, y ocupa ${Math.round(megas)} MB de memoria con la cartera de ` +
      'prueba cargada. La condición se satisface con una limitación que la compañía asume de forma permanente: ' +
      'alguien tiene que mantener ese equipo encendido, respaldado y actualizado. El servicio en la nube del ' +
      'fabricante elimina esa carga.',
    evidencia: [capRequisitos],
    documentacion: [...fuentes, ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-11-1-espocrm-nube')],
    medicion: `${Math.round(megas)} MB de memoria entre la aplicación y su base de datos`,
    conPlan: [conPlanDe(ESPOCRM_CLOUD_BASIC, {
      cumple: 2,
      justificacion: 'En la nube del fabricante la compañía no dispone ninguna infraestructura propia.',
    })],
  });
});

// ── A.11.2 ───────────────────────────────────────────────────────────────────
test('A.11.2 — Compatibilidad con la plataforma que la compañía usa', async ({ browser }, info) => {
  // «Determinar sobre qué sistemas operativos y motores de base de datos corre,
  //  y si alguno de ellos es de los que la compañía ya administra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/download/', buscar: 'PostgreSQL 15', captura: 'A-11-2-espocrm-1-bases' }),
    await citar(browser, { url: 'https://www.espocrm.com/download/', buscar: /Windows/, captura: 'A-11-2-espocrm-2-sistemas' }),
  ];

  registrar({
    criterio: 'A.11.2',
    plataforma,
    cumple: 2,
    justificacion:
      'Corre sobre los tres servidores web más difundidos —NGINX, Apache e IIS— y sobre los tres motores de ' +
      'base de datos libres más usados —MySQL, MariaDB y PostgreSQL—, y el fabricante publica guías de ' +
      'instalación para Windows, macOS y Linux. Cualquiera sea la plataforma que la compañía ya administra, ' +
      'alguna de esas combinaciones es la suya: no la obliga a incorporar una tecnología nueva para sostenerlo.',
    documentacion: fuentes,
  });
});

// ── A.11.3 ───────────────────────────────────────────────────────────────────
test('A.11.3 — Puesta en marcha sin perfil técnico especializado', async ({ page, browser }, info) => {
  // «Llevar el sistema de cero a operativo y determinar si lo completa alguien
  //  sin perfil técnico, si exige conocimientos puntuales guiados por la
  //  documentación, o si requiere un perfil que la compañía no tiene»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/download/', buscar: 'Get EspoCRM running in minutes', captura: 'A-11-3-espocrm-1-docker' }),
    await citar(browser, { url: 'https://docs.espocrm.com/administration/installation/', buscar: /installation wizard/i, captura: 'A-11-3-espocrm-2-asistente' }),
  ];

  // Lo que quedó andando, a partir de un archivo de contenedores y el asistente
  await entrar(page, plataforma);
  await administracion(page);
  await page.waitForTimeout(4000);
  const capOperativo = await capturar(page, 'A.11.3', plataforma, '3-operativo');

  registrar({
    criterio: 'A.11.3',
    plataforma,
    cumple: 1,
    justificacion:
      'El fabricante ofrece una imagen oficial de contenedores que deja el sistema, el servidor web y la base ' +
      'de datos funcionando juntos, y un asistente que completa la configuración inicial. La instalación ' +
      'evaluada se llevó de cero a operativa por esa vía. Pero no la completa alguien sin perfil técnico: hay ' +
      'que instalar el motor de contenedores, escribir el archivo que los describe y resolver cómo se conservan ' +
      'los datos entre reinicios, y en esta instalación montar la carpeta equivocada dejó al sistema sin ' +
      'arrancar hasta corregirlo. Son conocimientos puntuales, guiados por la documentación, que la compañía ' +
      'necesita tener a mano cada vez que instala o reinstala.',
    evidencia: [capOperativo],
    documentacion: fuentes,
    conPlan: [conPlanDe(ESPOCRM_CLOUD_BASIC, {
      cumple: 2,
      justificacion: 'En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar.',
    })],
  });
});

// ── A.11.5 ───────────────────────────────────────────────────────────────────
test('A.11.5 — Aprendizaje sin capacitación previa', async ({}, info) => {
  // «Dar a tres agentes independientes, sin conocimiento previo de la
  //  plataforma, las mismas cinco tareas sin instrucción, y registrar si los
  //  tres las completan, si alguna queda pendiente aunque quien la intentó sepa
  //  decir qué le faltó, o si hay tareas que ninguno logra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(120_000);

  // Los agentes operan el sistema con la consigna de aprendizaje/consigna.md y
  // dejan su informe; acá se comprueba sobre los datos guardados qué quedó hecho
  const informes = PERSONAS.map(p => informeDe(plataforma, p.n));
  if (informes.some(i => !i)) {
    sinVerificar('A.11.5', plataforma,
      'La prueba con tres agentes sin conocimiento previo de la plataforma todavía no se realizó sobre esta plataforma.');
    return;
  }

  const resultados = (await Promise.all(PERSONAS.map((p, k) => verificarEspo(p, informes[k]!)))).flat();
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

// ── A.11.7 ───────────────────────────────────────────────────────────────────
test('A.11.7 — Cantidad de usuarios sin límite que condicione la operación', async ({ page, browser }, info) => {
  // «Determinar cuántos usuarios admite la edición evaluada y contrastarlo con
  //  el plantel de productores y personal administrativo de la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://github.com/espocrm/espocrm',
    buscar: 'GNU AGPLv3',
    captura: 'A-11-7-espocrm-1-licencia',
  });

  await entrar(page, plataforma);
  await pestana(page, 'User');
  await page.waitForTimeout(4500);
  const capUsuarios = await capturar(page, 'A.11.7', plataforma, '2-usuarios');

  registrar({
    criterio: 'A.11.7',
    plataforma,
    cumple: 2,
    justificacion:
      'La edición evaluada se distribuye bajo una licencia libre que no limita la cantidad de usuarios, y la ' +
      'instalación no impone ningún tope: se dan de alta los que la compañía necesite, sea cual fuere su ' +
      'plantel de productores y de personal administrativo. El único límite es el del equipo donde corre. Los ' +
      'topes que publica el fabricante corresponden a los planes de la nube, que se cobran por usuario.',
    evidencia: [capUsuarios],
    documentacion: fuente,
  });
});

// ── A.11.9 ───────────────────────────────────────────────────────────────────
test('A.11.9 — Ecosistema de integraciones disponible', async ({ page, browser }, info) => {
  // «Revisar el catálogo de conectores disponibles y su accesibilidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/extensions/', buscar: 'Outlook Integration', captura: 'A-11-9-espocrm-1-extensiones' }),
    await citar(browser, { url: 'https://www.espocrm.com/extension-license-agreement/', buscar: 'you must renew or purchase a new license', captura: 'A-11-9-espocrm-2-licencia' }),
  ];

  await entrar(page, plataforma);
  await administracion(page, '#Admin/integrations');
  await page.waitForTimeout(5000);
  const capIntegraciones = await capturar(page, 'A.11.9', plataforma, '3-integraciones-incluidas');

  registrar({
    criterio: 'A.11.9',
    plataforma,
    cumple: 1,
    justificacion:
      'El catálogo oficial es corto y concentrado en lo que una oficina usa: correo de Outlook y de Google, ' +
      'telefonía, videollamadas, cobros y campañas por correo, más una interfaz de programación y ganchos para ' +
      'conectar lo que falte. Casi todos los conectores se venden aparte, con licencia anual que hay que ' +
      'renovar para seguir usándolos. La condición se satisface: los conectores que la compañía necesita ' +
      'existen y se consiguen directo del fabricante. La limitación es que cada uno suma una licencia ' +
      'renovable, y que fuera del catálogo la integración pasa a ser trabajo propio sobre la interfaz de ' +
      'programación.',
    evidencia: [capIntegraciones],
    documentacion: fuentes,
  });
});

// ── A.11.10 ──────────────────────────────────────────────────────────────────
test('A.11.10 — Documentación en español', async ({ page, browser }, info) => {
  // «Consultar la documentación oficial y verificar la disponibilidad del idioma»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/upgrading/',
    buscar: 'It\'s recommended to upgrade whenever the new version is out',
    captura: 'A-11-10-espocrm-1-documentacion-en-ingles',
  });

  // Se busca en el sitio de documentación una versión en otro idioma
  await page.goto('https://docs.espocrm.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const idiomas = await page.locator('a[hreflang], select[name*="lang" i] option, .language-switcher a')
    .allTextContents();
  const capPortada = await capturar(page, 'A.11.10', plataforma, '2-portada-de-la-documentacion');

  expect(idiomas.some(i => /espa|spanish|\bes\b/i.test(i)), 'la documentación no ofrece versión en español').toBeFalsy();

  registrar({
    criterio: 'A.11.10',
    plataforma,
    cumple: 1,
    justificacion:
      'La interfaz del sistema está en español, pero la documentación oficial está publicada solo en inglés: ' +
      'el sitio de documentación no ofrece selector de idioma ni versión en español. La necesidad se cubre ' +
      'con reparo: quien la consulte lo hace en inglés o con traducción automática del navegador, que es un ' +
      'procedimiento que se repite en cada consulta y que en la terminología técnica puede inducir a error.',
    evidencia: [capPortada],
    documentacion: fuente,
  });
});

// ── A.11.11 ──────────────────────────────────────────────────────────────────
test('A.11.11 — Material de capacitación para el usuario final', async ({ browser }, info) => {
  // «Buscar en la oferta del fabricante material de formación —cursos, videos
  //  o guías de uso— dirigido a quien opera el sistema y no a quien lo administra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/video/', buscar: 'Opportunity', captura: 'A-11-11-espocrm-1-videos' }),
    await citar(browser, { url: 'https://www.espocrm.com/video/', buscar: 'Calendar', captura: 'A-11-11-espocrm-2-videos-actividades' }),
  ];

  registrar({
    criterio: 'A.11.11',
    plataforma,
    cumple: 2,
    justificacion:
      'El fabricante publica una colección de videos de acceso libre que incluye material para quien opera ' +
      'el sistema y no solo para quien lo administra: cuentas, contactos, prospectos, seguimiento de ' +
      'oportunidades, calendario y actividades, importación y exportación de datos, impresión y reportes. Cubre ' +
      'las operaciones que un productor o un administrativo repiten a diario.',
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
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  // Las consultas de uso y configuración van a «General Discussion»: las otras
  // secciones son anuncios, pedidos de funciones, errores y programación
  const hasta = new Date(Date.now() - ESPERA_MS);
  const hilos = (await consultasVBulletin(browser, 'https://forum.espocrm.com/forum/general', hasta)).map(clasificar);
  expect(hilos, `el foro debe ofrecer ${CONSULTAS} consultas con más de una semana`).toHaveLength(CONSULTAS);

  const cuantas = (v: number) => hilos.filter(h => h.valor === v).length;
  const tipica = mediana(hilos);
  const horas = hilos.filter(h => h.horas !== undefined).map(h => h.horas!).sort((a, b) => a - b);
  const medianaHoras = horas.length ? horas[Math.floor((horas.length - 1) / 2)] : undefined;
  for (const h of hilos) console.log(`    ${h.valor} · ${h.inicio.fecha.toISOString().slice(0, 10)} · ` +
    `${h.horas === undefined ? 'sin respuesta' : `${Math.round(h.horas)} h`} · ${h.titulo}` +
    (h.confirmacion ? `\n        confirma: «${h.confirmacion.slice(0, 140)}»` : ''));

  const tiempo = (h?: number) => h === undefined ? '' : h < 1.5 ? 'la hora' : h < 48 ? `las ${Math.round(h)} horas` : `los ${Math.round(h / 24)} días`;
  registrar({
    criterio: 'A.11.12',
    plataforma,
    cumple: tipica.valor,
    justificacion:
      `Se tomaron las ${CONSULTAS} consultas más recientes de la sección de uso general del foro oficial que ya ` +
      `tenían más de una semana de publicadas. En ${cuantas(2)} otro usuario respondió dentro de la semana y quien ` +
      `consultó confirmó después que la respuesta le había servido; en ${cuantas(1)} hubo respuesta, pero llegó ` +
      `más tarde o sin que el autor confirmara que lo resolvía; ` +
      (cuantas(0) ? `${cuantas(0)} no recibieron respuesta. ` : 'ninguna quedó sin respuesta. ') +
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
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://www.espocrm.com/support/', buscar: 'Our hourly support rate', captura: 'A-11-13-espocrm-1-soporte-pago' }),
    await citar(browser, { url: 'https://www.espocrm.com/support/', buscar: '12×5', captura: 'A-11-13-espocrm-2-soporte-nube' }),
    await citar(browser, { url: 'https://www.espocrm.com/support/', buscar: 'Community Forum', captura: 'A-11-13-espocrm-3-soporte-comunidad' }),
  ];

  registrar({
    criterio: 'A.11.13',
    plataforma,
    cumple: 0,
    justificacion:
      'La oferta de soporte del fabricante tiene tres canales y ninguno compromete un plazo: la asistencia paga ' +
      'se cobra por hora y se presta por correo, web y teléfono sin tiempo de respuesta garantizado; el servicio ' +
      'en la nube declara una cobertura de doce horas cinco días a la semana, que es un horario de atención y no ' +
      'un plazo; y el soporte gratuito es el foro de la comunidad. La condición que la compañía necesita —saber ' +
      'en cuánto tiempo le van a responder cuando el sistema falle— no la ofrece ninguna modalidad.',
    documentacion: fuentes,
  });
});

// ── A.11.14 ──────────────────────────────────────────────────────────────────
test('A.11.14 — Continuidad de las versiones en uso', async ({ browser }, info) => {
  // «Determinar si el fabricante publica por cuánto tiempo sostiene con
  //  correcciones una versión, y si ese plazo cubre el horizonte de
  //  planificación o fuerza a adelantar la actualización»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/upgrading/',
    buscar: 'It\'s recommended to upgrade whenever the new version is out',
    captura: 'A-11-14-espocrm-1-actualizar-siempre',
  });

  registrar({
    criterio: 'A.11.14',
    plataforma,
    cumple: 0,
    justificacion:
      'El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por versión ' +
      'ni versiones de soporte extendido. Lo que la documentación oficial indica es actualizar apenas sale una ' +
      'versión nueva, lo que equivale a sostener solo la última. La compañía no puede fijar la actualización en ' +
      'su plan anual: tiene que seguir el ritmo del fabricante para seguir recibiendo correcciones.',
    documentacion: fuente,
  });
});

// ── A.11.4 ───────────────────────────────────────────────────────────────────
test('A.11.4 — Menú y navegabilidad para la operación diaria', async ({ page }, info) => {
  // «Registrar un asegurado con su póliza desde el ingreso, y determinar si el
  //  menú lleva a cada función donde se la espera y si el alta se completa en
  //  un solo recorrido, o si obliga a volver sobre pantallas ya visitadas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  const api = await apiEspo();
  const metadatos = (await (await api.get('Metadata')).json()).entityDefs.CPoliza;
  test.skip(!metadatos.links?.titular, 'la relación póliza–titular la crea A.6; correr A-06 antes');
  for (const c of (await listar(api, 'Contact', { maxSize: 200 })).list
    .filter((c: any) => c.lastName === 'Recorrido')) await api.delete(`Contact/${c.id}`);

  const recorrido: string[] = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) recorrido.push(new URL(f.url()).hash); });

  await entrar(page, plataforma);
  const inicio = Date.now();
  // Desde el menú, como lo haría el usuario
  await page.locator('nav a[href="#Contact"], .navbar a[href="#Contact"]').first().click();
  await page.locator('#main a[href="#Contact/create"]:visible').first().click();
  await page.locator('input[data-name="firstName"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('input[data-name="firstName"]').first().pressSequentially('Aurelio', { delay: 20 });
  await page.locator('input[data-name="lastName"]').first().pressSequentially('Recorrido', { delay: 20 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#Contact\/view\//, { timeout: 30_000 });

  // La póliza, desde la ficha recién creada, sin salir de ella
  const panel = page.locator('.panel[data-name="cPolizas"]').first();
  await panel.waitFor({ state: 'visible', timeout: 40_000 });
  await panel.locator('[data-action="createRelated"]').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('input[data-name="name"]').first().pressSequentially('POL-RECORRIDO-1', { delay: 20 });
  await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const enFicha = (await panel.innerText()).includes('POL-RECORRIDO-1');
  const capFinal = await capturar(page, 'A.11.4', plataforma, '1-asegurado-con-su-poliza');

  const pantallas = recorrido.filter((h, i) => h !== recorrido[i - 1]);
  const revisitadas = pantallas.filter((h, i) => pantallas.indexOf(h) !== i);

  expect(enFicha, 'la póliza debe quedar en la ficha del asegurado').toBeTruthy();
  expect(revisitadas, 'el alta no debe obligar a volver sobre pantallas').toEqual([]);

  registrar({
    criterio: 'A.11.4',
    plataforma,
    cumple: 2,
    justificacion:
      'Desde el ingreso, el menú lleva directo a asegurados, y de ahí al alta. Guardado el asegurado, la ' +
      'póliza se carga desde su propia ficha, en el panel de sus pólizas, sin salir de ella y ya ligada a él. ' +
      `El recorrido completo pasó por ${pantallas.length} pantallas sin volver sobre ninguna y llevó ` +
      `${segundos} segundos. La póliza, que es una entidad creada por la compañía, figura en el menú dentro ` +
      'del grupo desplegable; el orden del menú se ajusta desde la administración.',
    evidencia: [capFinal],
    medicion: `${pantallas.length} pantallas, ninguna revisitada, ${segundos} s`,
  });
});

// ── A.11.6 ───────────────────────────────────────────────────────────────────
test('A.11.6 — Localización completa al español, modelo incluido', async ({ page }, info) => {
  // «Recorrer el menú principal y una ficha, y determinar si todo está en
  //  español, si queda algún nombre en otro idioma que igual se entiende, o si
  //  hay nombres que impiden saber qué guarda el campo»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await page.waitForTimeout(3000);
  const menu = [...new Set((await page.locator('nav a, .navbar a').allTextContents()).map(t => t.trim()).filter(Boolean))];
  const capMenu = await capturar(page, 'A.11.6', plataforma, '1-menu');

  await listado(page, 'Contact');
  await page.locator('tbody tr td[data-name="name"] a').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.locator('tbody tr td[data-name="name"] a').first().click();
  await page.waitForTimeout(6000);
  const ficha = [...new Set((await page.locator('#main label, #main .panel-title, #main button, #main th, #main a[data-action]')
    .allTextContents()).map(t => t.replace(/\s+/g, ' ').trim()).filter(t => t && t.length < 60))];
  const capFicha = await capturar(page, 'A.11.6', plataforma, '2-ficha');

  // Palabras de la interfaz que quedaron en inglés
  const ingles = /^(tickets?|stream|leads?|pipelines?|dashboard|follow|save|edit|cancel|more|show|parameters|lockable)$/i;
  const enIngles = [...menu, ...ficha].flatMap(t => t.split(/\s+/)).filter(p => ingles.test(p));
  const unicas = [...new Set(enIngles.map(p => p.toLowerCase()))];
  console.log(`    en inglés en el menú y la ficha: ${unicas.join(', ') || 'ninguna'}`);

  expect(unicas.every(p => /^tickets?$/.test(p)), 'lo que queda en inglés tiene que ser comprensible').toBeTruthy();

  registrar({
    criterio: 'A.11.6',
    plataforma,
    cumple: unicas.length ? 1 : 2,
    justificacion: unicas.length
      ? 'El menú principal y la ficha del asegurado están en español, incluidos los campos del modelo y los ' +
        'que agregó la compañía. Queda en inglés la palabra "Ticket" para el caso de atención, que se entiende ' +
        'pero no es la que usa una aseguradora, y algunas traducciones son literales —"Posibles clientes", ' +
        '"Historia" para el registro de actividad—. Fuera del recorrido pedido, en los filtros de fecha la ' +
        'opción que significa "con algún valor" quedó traducida como "Nunca", que dice lo contrario. Se ' +
        'entiende en conjunto, con salvedades que la compañía puede corregir renombrando las etiquetas.'
      : 'El menú principal y la ficha del asegurado están enteramente en español, incluidos los campos del ' +
        'modelo y los que agregó la compañía.',
    evidencia: [capMenu, capFicha],
    medicion: `Palabras en inglés en el recorrido: ${unicas.join(', ') || 'ninguna'}`,
  });
});

// ── A.11.8 ───────────────────────────────────────────────────────────────────
test('A.11.8 — Operación concurrente sobre la misma cartera', async ({ browser }, info) => {
  // «Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los
  //  tres y observar el comportamiento del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(700_000);

  const api = await apiEspo();

  /** Tres sesiones abren la misma póliza a la vez y guardan un cambio cada una. */
  const ensayar = async (nombre: string) => {
    for (const p of (await listar(api, 'CPoliza', { maxSize: 200 })).list.filter((p: any) => p.name === nombre)) {
      await api.delete(`CPoliza/${p.id}`);
    }
    const id = await crear(api, 'CPoliza', { name: nombre, tipoPoliza: 'Vida', description: 'original' });
    const sesiones = await Promise.all([0, 1, 2].map(async () => {
      const contexto = await browser.newContext({ baseURL: 'http://localhost:8705', locale: 'es-AR' });
      const pagina = await contexto.newPage();
      await entrar(pagina, plataforma);
      await edicion(pagina, 'CPoliza', id);
      await pagina.locator('.field[data-name="description"] textarea').first().waitFor({ state: 'visible', timeout: 40_000 });
      return { contexto, pagina };
    }));
    const avisos: string[] = [];
    for (const [i, { pagina }] of sesiones.entries()) {
      const texto = pagina.locator('.field[data-name="description"] textarea').first();
      await texto.fill(`cambio de la sesión ${i + 1}`);
      await pagina.getByRole('button', { name: /^Guardar$/ }).first().click();
      await pagina.waitForTimeout(3500);
      avisos.push((await pagina.locator('.modal-dialog:visible, .alert:visible').allInnerTexts()).join(' ').replace(/\s+/g, ' '));
    }
    const captura = await capturar(sesiones[2].pagina, 'A.11.8', plataforma, nombre.toLowerCase());
    for (const s of sesiones) await s.contexto.close();
    const final = (await (await api.get(`CPoliza/${id}`)).json()).description;
    return { avisos, final, captura };
  };
  const conflicto = (a: string) => /modific|otro usuario|conflict|versión/i.test(a);

  /** La casilla de la configuración de la entidad, desde su formulario: así no se toca ninguna otra opción. */
  const controlDeConcurrencia = async (activo: boolean) => {
    const contexto = await browser.newContext({ baseURL: 'http://localhost:8705', locale: 'es-AR' });
    const pagina = await contexto.newPage();
    await entrar(pagina, plataforma);
    await administracion(pagina, '#Admin/entityManager', '#Admin/entityManager/scope=CPoliza',
      pagina.locator('#main [data-action="editEntity"]').first());
    const casilla = pagina.locator('#main input[data-name="optimisticConcurrencyControl"]').first();
    await casilla.waitFor({ state: 'visible', timeout: 40_000 });
    if ((await casilla.isChecked()) !== activo) {
      await casilla.setChecked(activo);
      await pagina.locator('#main [data-action="save"]').first().click();
      await pagina.waitForTimeout(8000);
    }
    await contexto.close();
  };

  // Tal como viene la entidad propia: el control se deja apagado para medir
  await controlDeConcurrencia(false);
  const deFabrica = await ensayar('POL-CONCURRENCIA-SIN-CONTROL');
  const pisados = deFabrica.avisos.filter(conflicto).length;

  // Con el control de concurrencia de la entidad, que es una casilla de su configuración
  await controlDeConcurrencia(true);
  const conControl = await ensayar('POL-CONCURRENCIA-CON-CONTROL');
  const advertidos = conControl.avisos.filter(conflicto).length;
  console.log(`    sin control: ${pisados} avisos, quedó «${deFabrica.final}» · con control: ${advertidos} avisos, quedó «${conControl.final}»`);

  expect(pisados, 'tal como viene, la entidad propia no advierte el conflicto').toBe(0);
  expect(advertidos, 'con el control activado, los guardados posteriores deben ser advertidos').toBeGreaterThan(0);

  registrar({
    criterio: 'A.11.8',
    plataforma,
    cumple: 2,
    justificacion:
      'Tres usuarios abrieron a la vez la misma póliza y guardaron un cambio cada uno. Tal como viene la ' +
      'entidad creada por la compañía, el sistema aceptó los tres guardados sin advertir el conflicto: quedó ' +
      `"${deFabrica.final}" y los cambios anteriores se perdieron sin aviso. El producto trae un control de ` +
      'concurrencia que las entidades de atención, ventas y cuentas tienen activado de fábrica, y que en las ' +
      'entidades propias se activa con una casilla de su configuración. Activado, los guardados posteriores ' +
      `recibieron el aviso de que otro usuario había modificado el registro (${advertidos} avisos) y nadie ` +
      'pisó el trabajo de otro sin saberlo. La condición se satisface, con la precaución de activar el control ' +
      'en cada entidad propia.',
    evidencia: [deFabrica.captura, conControl.captura],
    medicion: `Sin control: quedó «${deFabrica.final}» sin aviso · con control: ${advertidos} avisos`,
  });
});
