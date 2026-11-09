import { test, expect, Page } from '../../humano';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { CONSULTAS, ESPERA_MS, clasificar, consultasGitHub, constanciaDeHilos, mediana } from '../../foro';
import { PERSONAS, Resultado, informeDe } from '../../aprendizaje';
import { verificarTwenty } from '../../twenty/aprendizaje';
import { registrar, sinVerificar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { TWENTY_PRO, constanciaDe, conPlanDe } from '../../precios';
import { soloEn, capturar } from '../comun';
import {
  apiTwenty, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, configuracion, pestana, elegirEnFicha, valorEnFicha, clicReal,
  esperarCarga, textoDe, nuevaPersona, objeto, BASE,
} from '../../twenty/ui';

/**
 * A.11 — Condiciones técnicas del producto, sobre Twenty
 *
 * Criterios no funcionales: la pregunta es si el sistema satisface la
 * condición que el negocio requiere. No llevan costo de implementación.
 * Lo que se responde con la documentación del fabricante se cita textual.
 */

const CONTENEDORES = ['twenty-server-1', 'twenty-worker-1', 'twenty-db-1', 'twenty-redis-1'];

// ── A.11.1 ───────────────────────────────────────────────────────────────────
test('A.11.1 — Recursos que la compañía debe disponer para sostenerlo', async ({ page, browser }, info) => {
  // «Determinar si el sistema no exige infraestructura propia, si corre en un
  //  equipo de escritorio de los que la compañía ya tiene, o si pide un
  //  servidor dedicado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  // Lo que consume de verdad la instalación evaluada, con la cartera cargada
  const consumo = execFileSync('docker', ['stats', '--no-stream', '--format', '{{.Name}} {{.MemUsage}}', ...CONTENEDORES],
    { encoding: 'utf8' }).trim().split('\n');
  const megas = consumo.map(l => {
    const m = l.match(/([\d.]+)\s*(MiB|GiB)/);
    return m ? parseFloat(m[1]) * (m[2] === 'GiB' ? 1024 : 1) : 0;
  }).reduce((a, b) => a + b, 0);

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose', buscar: 'at least 2GB of RAM', captura: 'A-11-1-twenty-1-requisitos' }),
    ...await constanciaDe(browser, TWENTY_PRO, 'A-11-1-twenty-nube'),
  ];

  await entrar(page, plataforma);
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  await pestana(page, /^Salud$|^Health$/);
  const capSalud = await capturar(page, 'A.11.1', plataforma, '2-estado-del-servidor');

  expect(megas, 'la medición de memoria debe haber devuelto un valor').toBeGreaterThan(0);

  registrar({
    criterio: 'A.11.1',
    plataforma,
    cumple: 1,
    resumen:
      'Se instala en infraestructura propia, con cuatro contenedores y 2 GB de memoria como ' +
      'mínimo; alguien debe mantener ese equipo encendido, respaldado y actualizado.',
    comoLoHace:
      'La edición gratuita se instala en infraestructura de la compañía, con cuatro contenedores: la ' +
      'aplicación, un proceso que ejecuta las tareas en segundo plano, la base de datos y una memoria ' +
      'intermedia. El servicio en la nube del fabricante elimina esa carga.',
    caracteristicas:
      'No exige un servidor dedicado: el fabricante pide al menos 2 GB de memoria, y la instalación ' +
      `evaluada corre en un equipo de escritorio común, donde ocupa ${Math.round(megas)} MB con la ` +
      'cartera de prueba cargada.',
    justificacion:
      'La condición se satisface con una limitación que la compañía asume de forma permanente: alguien ' +
      'tiene que mantener ese equipo encendido, respaldado y actualizado.',
    evidencia: [capSalud],
    documentacion: fuentes,
    medicion: `${Math.round(megas)} MB de memoria entre los cuatro contenedores`,
    conPlan: [conPlanDe(TWENTY_PRO, {
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
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose', buscar: 'Docker Compose', captura: 'A-11-2-twenty-1-contenedores' }),
    await citar(browser, { url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide', buscar: 'requires PostgreSQL 15 or newer', captura: 'A-11-2-twenty-2-postgresql' }),
    ...await constanciaDe(browser, TWENTY_PRO, 'A-11-2-twenty-nube'),
  ];

  registrar({
    criterio: 'A.11.2',
    plataforma,
    cumple: 1,
    resumen:
      'La instalación propia corre en contenedores sobre Linux, Windows o macOS, con una ' +
      'única combinación: PostgreSQL 15 o superior y Redis; no hay otro motor de base de ' +
      'datos.',
    comoLoHace:
      'La instalación propia corre sobre contenedores, que funcionan en Linux, en Windows y en macOS, ' +
      'pero con una sola combinación de componentes: PostgreSQL como base de datos —de la versión 15 ' +
      'en adelante— y Redis como memoria intermedia.',
    caracteristicas:
      'No hay variante para otro motor de base de datos.',
    justificacion:
      'Si la compañía ya administra contenedores y PostgreSQL, es su plataforma; si no, tiene que ' +
      'incorporar y sostener esas tecnologías para operar el sistema.',
    documentacion: fuentes,
    conPlan: [conPlanDe(TWENTY_PRO, {
      cumple: 2,
      justificacion: 'En la nube no hay plataforma que administrar: se usa desde el navegador.',
    })],
  });
});

// ── A.11.3 ───────────────────────────────────────────────────────────────────
test('A.11.3 — Puesta en marcha sin perfil técnico especializado', async ({ page, browser }, info) => {
  // «Llevar el sistema de cero a operativo y determinar si lo completa alguien
  //  sin perfil técnico, si exige conocimientos puntuales guiados por la
  //  documentación, o si requiere un perfil que la compañía no tiene»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/developers/self-host/capabilities/docker-compose', buscar: 'Set the Postgres Password', captura: 'A-11-3-twenty-1-instalacion' }),
    ...await constanciaDe(browser, TWENTY_PRO, 'A-11-3-twenty-nube'),
  ];

  // Lo que hubo que cambiar a mano para que funcionara: las variables guardadas en la base
  const variables = execFileSync('docker', ['exec', 'twenty-db-1', 'psql', '-U', 'postgres', '-d', 'default', '-At', '-c',
    `select key || '=' || value from core."keyValuePair" where type = 'CONFIG_VARIABLE' order by key`], { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
  await entrar(page, plataforma);
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  await pestana(page, /^Configuración$|^Config/);
  const capVariables = await capturar(page, 'A.11.3', plataforma, '2-variables-de-configuracion');

  registrar({
    criterio: 'A.11.3',
    plataforma,
    cumple: 1,
    resumen:
      'Exige instalar el motor de contenedores, completar variables del archivo y activar ' +
      'variables apagadas, como las del correo en red propia y el código de flujos.',
    comoLoHace:
      'La instalación se lleva de cero a operativa por esa vía, pero no la completa alguien sin perfil ' +
      'técnico: hay que instalar el motor de contenedores, completar las variables del archivo ' +
      '—claves, dirección pública— y, para usar funciones del producto, cambiar variables de ' +
      'configuración que vienen apagadas, como las que permiten conectar casillas de correo de la red ' +
      'propia y ejecutar el código de los flujos.',
    caracteristicas:
      'El fabricante ofrece un archivo de contenedores que deja la aplicación, las tareas en segundo ' +
      'plano, la base de datos y la memoria intermedia funcionando juntas, y el primer ingreso guía la ' +
      'creación del espacio de trabajo.',
    justificacion:
      'Instalar con el archivo de contenedores exige conocimientos puntuales —el motor de contenedores, las variables del ' +
      'archivo y las variables de configuración apagadas—, guiados por la documentación, que la compañía necesita tener a ' +
      'mano cada vez que instala o actualiza.',
    evidencia: [capVariables],
    documentacion: fuentes,
    medicion: `Variables de configuración cambiadas: ${variables.map(v => v.split('=')[0]).join(', ')}`,
    conPlan: [conPlanDe(TWENTY_PRO, {
      cumple: 2,
      justificacion: 'En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar ni configurar.',
    })],
  });
});

// ── A.11.4 ───────────────────────────────────────────────────────────────────
test('A.11.4 — Menú y navegabilidad para la operación diaria', async ({ page }, info) => {
  // «Registrar un asegurado con su póliza desde el ingreso, y determinar si el
  //  menú lleva a cada función donde se la espera y si el alta se completa en
  //  un solo recorrido, o si obliga a volver sobre pantallas ya visitadas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  for (const p of (await registros(api, 'people')).filter(p => p.name?.lastName === 'Recorrido')) await borrarRegistro(api, 'people', p.id);
  for (const p of (await registros(api, 'polizas')).filter(p => p.name === 'POL-RECORRIDO-1')) await borrarRegistro(api, 'polizas', p.id);

  const recorrido: string[] = [];
  page.on('framenavigated', f => { if (f === page.mainFrame()) recorrido.push(new URL(f.url()).pathname); });
  await abrirListado(page, 'companies');
  recorrido.length = 0;

  const inicio = Date.now();
  // Desde el menú, como lo haría el usuario
  await clicReal(page, page.getByText('People', { exact: true }).filter({ visible: true }).first());
  await esperarCarga(page, 3000);
  const id = await nuevaPersona(page, 'Aurelio', 'Recorrido');
  await abrirFicha(page, 'person', id);
  // La póliza, desde la ficha recién creada, sin salir de ella
  await clicReal(page, valorEnFicha(page, 'polizas'));
  await page.getByPlaceholder(/^Buscar|^Search/).last().waitFor({ state: 'visible', timeout: 15_000 });
  await page.keyboard.type('POL-RECORRIDO-1', { delay: 60 });
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(/^Agregar nuevo|^Add new/).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const capFinal = await capturar(page, 'A.11.4', plataforma, '1-asegurado-con-su-poliza');

  const poliza = (await registros(api, 'polizas')).find(p => p.name === 'POL-RECORRIDO-1');
  const pantallas = recorrido.filter((h, i) => h !== recorrido[i - 1]);
  const revisitadas = pantallas.filter((h, i) => pantallas.indexOf(h) !== i);

  expect(poliza?.titularId, 'la póliza debe quedar ligada al asegurado').toBe(id);
  expect(revisitadas, 'el alta no debe obligar a volver sobre pantallas').toEqual([]);

  registrar({
    criterio: 'A.11.4',
    plataforma,
    cumple: 2,
    resumen:
      'El menú lateral lleva directo a las personas y la póliza se carga desde la ficha del ' +
      'asegurado; los objetos propios aparecen en el mismo menú que los de fábrica.',
    comoLoHace:
      'Desde el ingreso, el menú lateral lleva directo a las personas, y el alta se hace en el mismo ' +
      'listado, escribiendo nombre y apellido en una fila nueva. Guardado el asegurado, la póliza se ' +
      'carga desde su propia ficha, en el campo de sus pólizas, escribiendo su número y agregándola: ' +
      'queda creada y ligada a él sin salir de la ficha.',
    caracteristicas:
      `El recorrido completo pasó por ${pantallas.length} pantallas sin volver sobre ninguna y llevó ` +
      `${segundos} segundos.`,
    justificacion:
      'Los objetos propios, como la póliza, aparecen en el mismo menú lateral que los de fábrica.',
    evidencia: [capFinal],
    medicion: `${pantallas.length} pantallas, ninguna revisitada, ${segundos} s`,
  });
});

// ── A.11.5 ───────────────────────────────────────────────────────────────────
test('A.11.5 — Aprendizaje sin capacitación previa', async ({ page }, info) => {
  // «Dar a tres agentes independientes, sin conocimiento previo de la
  //  plataforma, las mismas cinco tareas sin instrucción, y registrar si los
  //  tres las completan, si alguna queda pendiente aunque quien la intentó sepa
  //  decir qué le faltó, o si hay tareas que ninguno logra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
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
  // modelo —A.1.1 vuelve a crear la póliza— y se llevan esos datos: sin ellos no se vuelve a puntuar,
  // y queda el resultado que se registró al comprobarlo
  const api = await apiTwenty(page);
  const cartera = (await objeto(api, 'poliza')) ? (await registros(api, 'polizas')).filter(p => /^POL-CARTERA-/.test(p.name ?? '')) : [];
  test.skip(!cartera.length,
    'La cartera de la prueba de aprendizaje ya no está: se la vuelve a preparar y se repite la prueba con los agentes');
  const resultados: Resultado[] = [];
  for (const [k, p] of PERSONAS.entries()) resultados.push(...await verificarTwenty(page, p, informes[k]!));
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
    resumen: cumple === 2
      ? 'Quien no conoce la plataforma completa sin instrucción previa las cinco operaciones ' +
        'diarias de un productor.'
      : cumple === 0
        ? 'Sin instrucción previa, ningún productor logra completar al menos una de las tareas ' +
          'diarias.'
        : `Sin instrucción previa, los productores completan ${15 - pendientes.length} de 15 ` +
          `tareas diarias: cada tarea la resuelve alguno, pero no todos las resuelven todas.`,
    comoLoHace:
      'Sin instrucción previa, quien no conoce la plataforma opera la pantalla, como lo haría una ' +
      'persona, para resolver las cinco operaciones que un productor repite a diario —dar de alta un ' +
      'asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 ' +
      'días, registrar un reclamo y agendar un llamado—' +
      (cumple === 2 ? ', y las completa todas.'
        : cumple === 0 ? ', pero alguna no la completa nadie.'
        : '.'),
    // El detalle de cada tarea incompleta va en las características; la justificación dice por qué vale 1
    caracteristicas:
      `Completaron ${15 - pendientes.length} de las ` +
      'quince, según lo que quedó guardado en el sistema.' +
      (cumple === 1 ? ` ${detalle.join('; ').replace(/^la/, 'La')}.` : ''),
    justificacion:
      cumple === 2 ? 'Quien no conoce la plataforma completa las cinco tareas sin instrucción.'
        : cumple === 0 ? `Ninguno logra completar la tarea ${ningunoLogra.join(' ni la ')}: ${detalle.join('; ')}.`
        : 'Cada tarea la completa al menos uno de cada tres productores, aunque no todos completan todas: ' +
          'el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación.',
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
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  await configuracion(page, /^Experiencia$|^Experience$/);
  const idioma = await textoDe(page);
  const capIdioma = await capturar(page, 'A.11.6', plataforma, '1-idioma-elegido');

  await abrirListado(page, 'people');
  const menu = [...new Set((await page.locator('nav a, nav [role="button"]').allInnerTexts()).map(t => t.trim()).filter(Boolean))];
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);
  const ficha = [...new Set((await page.locator('[data-testid="record-fields-widget"] *, [role="tab"]')
    .evaluateAll(es => es.filter(e => !e.children.length).map(e => (e.textContent ?? '').trim())))
    .filter(t => t && t.length < 40))];
  const capFicha = await capturar(page, 'A.11.6', plataforma, '2-ficha');

  // Los nombres de fábrica que quedaron en inglés, en el menú y en la ficha
  const ingles = /^(Companies|People|Opportunities|Tasks|Notes|Dashboards|Workflows|Emails|Phones|Company|Job Title|Linkedin|Creation date|Created by|Last update|Updated by|Timeline|Files|Calendar|Fields|General|Work|Social|System|Name)$/;
  const enIngles = [...new Set([...menu, ...ficha].filter(t => ingles.test(t)))];
  console.log(`    en inglés en el menú y la ficha: ${enIngles.join(', ') || 'ninguno'}`);

  expect(idioma, 'la interfaz debe estar configurada en español').toMatch(/Español/);

  registrar({
    criterio: 'A.11.6',
    plataforma,
    cumple: enIngles.length ? 1 : 2,
    resumen: enIngles.length
      ? 'Traduce al español menús, botones y mensajes, pero los objetos y campos de fábrica ' +
        'conservan su nombre en inglés, aunque cada uno se puede renombrar.'
      : 'Toda la interfaz, incluido el modelo de datos, se ve en español en el menú principal y ' +
        'la ficha del asegurado.',
    comoLoHace: enIngles.length
      ? 'Con el idioma de la interfaz en español, los menús de configuración, los botones y los mensajes ' +
        'están traducidos, pero los objetos y campos que trae el producto quedan con su nombre en inglés: ' +
        `en el menú y en la ficha del asegurado se leen ${enIngles.slice(0, 8).join(', ')}, entre otros.`
      : 'Con el idioma de la interfaz en español, el menú principal y la ficha del asegurado se muestran enteramente en español.',
    caracteristicas: enIngles.length
      ? 'Lo que agregó la compañía, como la póliza y sus campos, queda con el nombre que ella le puso.'
      : 'El menú y la ficha del asegurado están enteramente en español, incluidos los campos del modelo.',
    justificacion: enIngles.length
      ? 'Son nombres que igual se entienden —personas, correos, teléfonos, empresa, cargo— y cada uno se puede ' +
        'renombrar desde el modelo de datos, que admite cambiar el nombre en singular y en plural.'
      : 'Todo lo que el personal ve en la operación diaria está en su idioma, sin nada que corregir.',
    evidencia: [capIdioma, capFicha],
    medicion: `Nombres en inglés en el recorrido: ${enIngles.join(', ') || 'ninguno'}`,
  });
});

// ── A.11.7 ───────────────────────────────────────────────────────────────────
test('A.11.7 — Cantidad de usuarios sin límite que condicione la operación', async ({ page, browser }, info) => {
  // «Determinar cuántos usuarios admite la edición evaluada y contrastarlo con
  //  el plantel de productores y personal administrativo de la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://github.com/twentyhq/twenty', buscar: 'Open-Source CRM', captura: 'A-11-7-twenty-1-codigo-abierto' }),
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans', buscar: 'Host Twenty on your own infrastructure at no cost', captura: 'A-11-7-twenty-2-sin-costo' }),
  ];

  await entrar(page, plataforma);
  await configuracion(page, /^Miembros$|^Members$/);
  const capUsuarios = await capturar(page, 'A.11.7', plataforma, '3-usuarios');

  registrar({
    criterio: 'A.11.7',
    plataforma,
    cumple: 2,
    resumen:
      'La edición autoalojada es gratuita y con licencia libre: no limita la cantidad de ' +
      'usuarios, y el único tope es el del equipo donde corre.',
    comoLoHace:
      'La edición autoalojada es gratuita y se distribuye bajo una licencia libre que no limita la ' +
      'cantidad de usuarios, y la instalación no impone ningún tope: se invitan los que la compañía ' +
      'necesite, sea cual fuere su plantel de productores y de personal administrativo.',
    caracteristicas:
      'En la nube se paga por usuario, sin tope de cantidad.',
    justificacion:
      'El único límite es el del equipo donde corre.',
    evidencia: [capUsuarios],
    documentacion: fuentes,
  });
});

// ── A.11.8 ───────────────────────────────────────────────────────────────────
test('A.11.8 — Operación concurrente sobre la misma cartera', async ({ page, browser }, info) => {
  // «Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los
  //  tres y observar el comportamiento del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const NOMBRE = 'POL-CONCURRENCIA';
  for (const p of (await registros(api, 'polizas')).filter(p => p.name.startsWith(NOMBRE))) await borrarRegistro(api, 'polizas', p.id);
  const poliza = await crearRegistro(api, 'polizas', { name: NOMBRE });

  // Tres sesiones abren la misma póliza a la vez
  const sesiones = await Promise.all([0, 1, 2].map(async () => {
    const contexto = await browser.newContext({ baseURL: BASE, locale: 'es-AR', viewport: { width: 1440, height: 900 } });
    const pagina = await contexto.newPage();
    await entrar(pagina, plataforma);
    await abrirFicha(pagina, 'poliza', poliza.id);
    return { contexto, pagina };
  }));
  // Cada sesión cambia el ramo, en orden; antes de cambiarlo, se mira qué ve
  const RAMOS_POR_SESION = ['Hogar', 'Vida', 'Salud'];
  const ramoEnPantalla = (pagina: Page) => pagina.locator('[id^="fields-"][id$="-ramo"]').first().innerText().catch(() => '');
  const vistas: string[] = [];
  let captura = '';
  try {
    for (const [i, { pagina }] of sesiones.entries()) {
      vistas.push(await ramoEnPantalla(pagina));
      await elegirEnFicha(pagina, 'ramo', RAMOS_POR_SESION[i]);
      await pagina.waitForTimeout(4000);
    }
    // Lo que ve la primera sesión después de los tres cambios, sin recargar
    await sesiones[0].pagina.waitForTimeout(5000);
    vistas.push(await ramoEnPantalla(sesiones[0].pagina));
    captura = await capturar(sesiones[0].pagina, 'A.11.8', plataforma, '1-primera-sesion-despues');
  } finally {
    for (const s of sesiones) await s.contexto.close();
  }
  const guardada = (await registros(api, 'polizas')).find(p => p.id === poliza.id);
  const final = { AUTOMOTOR: 'Automotor', HOGAR: 'Hogar', VIDA: 'Vida', SALUD: 'Salud' }[guardada?.ramo as string] ?? guardada?.ramo;
  const alDia = vistas.slice(1, 3).map((v, k) => v.includes(RAMOS_POR_SESION[k]));
  const primeraVeFinal = vistas[3].includes('Salud');
  console.log(`    final «${final}» · lo que veía cada sesión antes de cambiar: ${vistas.slice(0, 3).map(v => `«${v.replace(/\s+/g, ' ')}»`).join(', ')} · ` +
    `la primera ve «${vistas[3].replace(/\s+/g, ' ')}» sin recargar`);
  await borrarRegistro(api, 'polizas', poliza.id);

  expect(final, 'debe quedar el último cambio').toBe('Salud');

  const envivo = alDia.every(Boolean) && primeraVeFinal;
  registrar({
    criterio: 'A.11.8',
    plataforma,
    cumple: envivo ? 2 : 1,
    resumen: envivo
      ? 'Varias sesiones editan a la vez la misma póliza y cada una ve en vivo, sin recargar, ' +
        'el cambio de las otras: nadie pisa trabajo ajeno sin verlo.'
      : 'Varias sesiones editan a la vez la misma póliza, pero no se avisa que otro modificó el ' +
        'registro: cada guardado reemplaza al anterior y gana el último.',
    comoLoHace:
      'Varias sesiones pueden abrir a la vez la misma póliza y cambiar su ramo una detrás de otra, ' +
      'desde la ficha.',
    caracteristicas:
      `Quedó el último cambio, ${final}.`,
    justificacion: envivo
      ? 'Cada sesión ve aparecer el cambio de la anterior en su pantalla, sin recargar, antes de hacer el ' +
        'suyo: el sistema actualiza en vivo lo que otros modifican, así que nadie pisa el trabajo de otro sin verlo.'
      : 'El sistema no avisa que otro usuario modificó el registro mientras estaba abierto: cada guardado ' +
        'reemplaza al anterior sin advertencia, y una sesión puede estar mirando un valor viejo. La condición se ' +
        'satisface con una limitación: cuando dos personas trabajan la misma póliza, gana la última que guarda.',
    evidencia: [captura],
    medicion: `Final: ${final} · actualización en vivo en las otras sesiones: ${envivo ? 'sí' : 'no'}`,
  });
});

// ── A.11.9 ───────────────────────────────────────────────────────────────────
test('A.11.9 — Ecosistema de integraciones disponible', async ({ page, browser }, info) => {
  // «Revisar el catálogo de conectores disponibles y su accesibilidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  await entrar(page, plataforma);
  await configuracion(page, /^Aplicaciones$|^Applications$/);
  const catalogo = await textoDe(page);
  const capCatalogo = await capturar(page, 'A.11.9', plataforma, '1-aplicaciones');
  await configuracion(page, /^MCP y API$|^MCP & API/);
  const capApi = await capturar(page, 'A.11.9', plataforma, '2-mcp-y-api');

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/developers/extend/apps/getting-started/concepts', buscar: 'How Twenty apps work', captura: 'A-11-9-twenty-3-aplicaciones' }),
    await citar(browser, { url: 'https://docs.twenty.com/developers/extend/webhooks', buscar: /HTTP POST/i, captura: 'A-11-9-twenty-4-webhooks' }),
  ];

  expect(catalogo, 'el catálogo de aplicaciones debe estar en la configuración').toMatch(/Aplicaciones|Applications/);

  registrar({
    criterio: 'A.11.9',
    plataforma,
    cumple: 1,
    resumen:
      'Se conecta de fábrica con correo y calendario de Google y Microsoft y con cualquier ' +
      'casilla IMAP; fuera de eso no hay conectores y cada integración es trabajo propio.',
    comoLoHace:
      'Lo que sí trae es la vía para integrar lo que falte —interfaces de programación, avisos a otros ' +
      'sistemas ante cada cambio y un servidor para asistentes de inteligencia artificial—, todo sin ' +
      'costo.',
    caracteristicas:
      'El producto se conecta de fábrica con el correo y el calendario de Google y de Microsoft, y con ' +
      'cualquier casilla por IMAP. Más allá de eso no hay un catálogo de conectores: la sección de ' +
      'aplicaciones ofrece muy pocas, y las aplicaciones son paquetes de código que se desarrollan con ' +
      'el kit del fabricante.',
    justificacion:
      'La condición se satisface con una limitación: fuera del correo y el calendario, cada ' +
      'integración es trabajo propio.',
    evidencia: [capCatalogo, capApi],
    documentacion: fuentes,
  });
});

// ── A.11.10 ──────────────────────────────────────────────────────────────────
test('A.11.10 — Documentación en español', async ({ page, browser }, info) => {
  // «Consultar la documentación oficial y verificar la disponibilidad del idioma»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/es/user-guide/permissions-access/capabilities/permissions',
    buscar: 'Controla el acceso a objetos, campos y ajustes con permisos basados en roles',
    captura: 'A-11-10-twenty-1-documentacion-en-espanol',
  });
  await page.goto('https://docs.twenty.com/es/user-guide/introduction', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const portada = await textoDe(page);
  const capPortada = await capturar(page, 'A.11.10', plataforma, '2-guia-de-usuario-en-espanol');

  expect(portada, 'la guía de usuario debe estar en español').toMatch(/Guía de usuario/);

  registrar({
    criterio: 'A.11.10',
    plataforma,
    cumple: 2,
    resumen:
      'La documentación oficial, con guía de usuario y páginas de configuración, se publica ' +
      'también en español, con el mismo contenido que la versión en inglés.',
    comoLoHace:
      'La documentación oficial se publica también en español.',
    caracteristicas:
      'La guía de usuario y las páginas de ' +
      'configuración tienen su versión traducida, con el mismo contenido y la misma estructura que la ' +
      'original en inglés.',
    justificacion:
      'Quien consulte cómo se usa o se configura el sistema lo hace en su idioma.',
    evidencia: [capPortada],
    documentacion: fuente,
  });
});

// ── A.11.11 ──────────────────────────────────────────────────────────────────
test('A.11.11 — Material de capacitación para el usuario final', async ({ browser }, info) => {
  // «Buscar en la oferta del fabricante material de formación —cursos, videos
  //  o guías de uso— dirigido a quien opera el sistema y no a quien lo administra»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/data-migration/how-tos/import-contacts-via-csv', buscar: /step-by-step guide/i, captura: 'A-11-11-twenty-1-guias-paso-a-paso' }),
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/calendar-emails/overview', buscar: 'Contact Auto-Creation', captura: 'A-11-11-twenty-2-guia-de-uso' }),
  ];

  registrar({
    criterio: 'A.11.11',
    plataforma,
    cumple: 2,
    resumen:
      'El fabricante publica una guía de usuario de acceso libre, con más de cien páginas y ' +
      'guías paso a paso para las tareas diarias; está también en español.',
    comoLoHace:
      'El fabricante publica una guía de usuario de acceso libre, separada de la documentación para ' +
      'desarrolladores, con más de cien páginas.',
    caracteristicas:
      'Qué hace cada función y guías paso a paso para las ' +
      'tareas de todos los días —importar contactos, trabajar el correo y el calendario, armar vistas, ' +
      'tableros y flujos—.',
    justificacion:
      'Está dirigida a quien opera el sistema, y está también en español.',
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
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  // La conversación general de la comunidad está en un servidor de chat que solo
  // se lee con cuenta; lo público son las discusiones del repositorio oficial,
  // donde las consultas de uso van a «Unsolvable issues» y «General»
  const hasta = new Date(Date.now() - ESPERA_MS);
  const hilos = consultasGitHub('twentyhq/twenty', ['Unsolvable issues', 'General'], hasta).map(clasificar);
  expect(hilos, `el repositorio debe ofrecer ${CONSULTAS} consultas con más de una semana`).toHaveLength(CONSULTAS);

  const cuantas = (v: number) => hilos.filter(h => h.valor === v).length;
  const tipica = mediana(hilos);
  const horas = hilos.filter(h => h.horas !== undefined).map(h => h.horas!).sort((a, b) => a - b);
  const medianaHoras = horas.length ? horas[Math.floor((horas.length - 1) / 2)] : undefined;
  const desde = hilos[hilos.length - 1].inicio.fecha.toISOString().slice(0, 10);
  for (const h of hilos) console.log(`    ${h.valor} · ${h.inicio.fecha.toISOString().slice(0, 10)} · ` +
    `${h.horas === undefined ? 'sin respuesta' : `${Math.round(h.horas)} h`} · ${h.titulo}` +
    (h.confirmacion ? `\n        confirma: «${h.confirmacion.slice(0, 140)}»` : ''));

  const fuenteChat = await citar(browser, {
    url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans',
    buscar: 'Community support via Discord',
    captura: 'A-11-12-twenty-00-canal-de-la-comunidad',
  });

  const tiempo = (h?: number) => h === undefined ? '' : h < 1.5 ? 'la hora' : h < 48 ? `las ${Math.round(h)} horas` : `los ${Math.round(h / 24)} días`;
  registrar({
    criterio: 'A.11.12',
    plataforma,
    cumple: tipica.valor,
    resumen: tipica.valor === 2
      ? 'La comunidad conversa en un chat que solo se lee con cuenta; en las discusiones ' +
        'abiertas la consulta típica se resuelve dentro de la semana.'
      : tipica.valor === 1
        ? 'La comunidad conversa en un chat que solo se lee con cuenta; en las discusiones la ' +
          'consulta típica recibe respuesta, pero sin constancia de resolverse dentro de la ' +
          'semana.'
        : 'La comunidad conversa en un chat que solo se lee con cuenta; en las discusiones ' +
          'abiertas la consulta típica queda sin respuesta.',
    comoLoHace:
      'El canal de la comunidad que ofrece el fabricante es un servidor de chat que solo se lee con ' +
      'cuenta; lo que la comunidad publica abierto son las discusiones del repositorio oficial.',
    caracteristicas:
      `En ${cuantas(2)} otro usuario respondió dentro de la semana y quien consultó confirmó después que ` +
      `la respuesta le había servido; en ${cuantas(1)} hubo respuesta, pero llegó más tarde o sin que el autor ` +
      'confirmara que lo resolvía; ' + (cuantas(0) ? `${cuantas(0)} no recibieron respuesta.` : 'ninguna quedó sin respuesta.') +
      (medianaHoras !== undefined ? ` La primera respuesta llegó, en el caso típico, a ${tiempo(medianaHoras)}.` : ''),
    justificacion:
      (tipica.valor === 2 ? 'La consulta típica se resuelve dentro de la semana.'
        : tipica.valor === 1 ? 'La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: ' +
          'la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida.'
        : 'La consulta típica queda sin respuesta: la compañía no puede contar con la comunidad para resolver un problema de configuración.'),
    documentacion: [fuenteChat, ...await constanciaDeHilos(browser, hilos, `A-11-12-${plataforma}`)],
    medicion: `${cuantas(2)} resueltas en la semana · ${cuantas(1)} con respuesta tardía o sin confirmar · ` +
      `${cuantas(0)} sin respuesta` + (medianaHoras !== undefined ? ` · primera respuesta típica a ${tiempo(medianaHoras)}` : ''),
  });
});

// ── A.11.13 ──────────────────────────────────────────────────────────────────
test('A.11.13 — Soporte técnico con compromiso de respuesta', async ({ browser }, info) => {
  // «Verificar en la documentación comercial la existencia de un canal con
  //  plazo comprometido»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans', buscar: 'Community support via Discord', captura: 'A-11-13-twenty-1-soporte-gratuito' }),
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans', buscar: 'Priority support', captura: 'A-11-13-twenty-2-soporte-prioritario' }),
    await citar(browser, { url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans', buscar: 'Twenty team support', captura: 'A-11-13-twenty-3-soporte-del-equipo' }),
  ];

  registrar({
    criterio: 'A.11.13',
    plataforma,
    cumple: 0,
    resumen:
      'Ningún nivel de soporte compromete un plazo de respuesta: la edición gratuita se apoya ' +
      'en la comunidad y Organization suma soporte prioritario, sin declarar tiempos.',
    comoLoHace:
      'La oferta de soporte del fabricante tiene tres niveles y ninguno compromete un plazo: la ' +
      'edición gratuita se apoya en la comunidad, en su servidor de chat; el plan Organization en la ' +
      'nube agrega soporte prioritario, y en la instalación propia, soporte del equipo del fabricante, ' +
      'sin que ninguno declare en cuánto tiempo responde.',
    justificacion:
      'La condición que la compañía necesita —saber en cuánto tiempo le van a responder cuando el ' +
      'sistema falle— no la ofrece ninguna modalidad publicada.',
    documentacion: fuentes,
  });
});

// ── A.11.14 ──────────────────────────────────────────────────────────────────
test('A.11.14 — Continuidad de las versiones en uso', async ({ browser }, info) => {
  // «Determinar si el fabricante publica por cuánto tiempo sostiene con
  //  correcciones una versión, y si ese plazo cubre el horizonte de
  //  planificación o fuerza a adelantar la actualización»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(300_000);

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide',
      buscar: 'You can jump directly from any supported version to the latest release',
      captura: 'A-11-14-twenty-1-saltar-a-la-ultima',
    }),
  ];

  // El ritmo de las versiones publicadas
  const versiones = JSON.parse(execFileSync('gh', ['api', 'repos/twentyhq/twenty/releases?per_page=30', '--jq', '[.[] | {tag_name, published_at}]'],
    { encoding: 'utf8' })) as { tag_name: string; published_at: string }[];
  const dias = (Date.parse(versiones[0].published_at) - Date.parse(versiones[versiones.length - 1].published_at)) / 86_400_000;
  const porMes = Math.round(versiones.length / (dias / 30) * 10) / 10;
  console.log(`    ${versiones.length} versiones en ${Math.round(dias)} días: ${porMes} por mes`);

  registrar({
    criterio: 'A.11.14',
    plataforma,
    cumple: 0,
    resumen:
      'El fabricante no publica por cuánto tiempo corrige una versión ni ofrece soporte ' +
      'extendido: para recibir correcciones hay que seguir su ritmo de versiones nuevas.',
    comoLoHace:
      'El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por ' +
      'versión ni versiones de soporte extendido.',
    caracteristicas:
      `Publica versiones nuevas a un ritmo de ${String(porMes).replace('.', ',')} por mes, y la guía de ` +
      'actualización lo que asegura es poder saltar desde cualquier versión soportada directo a la ' +
      'última.',
    justificacion:
      'La compañía no puede fijar la actualización en su plan anual: tiene que seguir el ritmo del ' +
      'fabricante para recibir correcciones.',
    documentacion: fuentes,
    medicion: `${versiones.length} versiones publicadas en ${Math.round(dias)} días`,
  });
});
