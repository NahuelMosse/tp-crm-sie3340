import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, conPlanDe, constanciaDe } from '../../precios';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { cerrarPaneles, menuLateral, asentar, panel } from '../../bitrix24/navegar';
import { productor, entrarComoProductor } from '../../bitrix24/escenario';
import { ATENCION, enviarPorSmtpLocal, recibidos, vaciarCasillas } from '../../correo';
import { textoDe } from '../../bitrix24/ui';
import {
  contactos, borrarContactos, abrirContacto, altaDeContacto, llenarContacto, guardarContacto, abrirMenuDelListado, elegirEnMenuDelListado, importarCsv,
} from '../../bitrix24/actividades';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A.7 — Intercambio de datos y correo, sobre Bitrix24
 */

test.describe.configure({ mode: 'default' });

const CARPETA = join(__dirname, '..', '..', 'bitrix24', '_tmp');
const APELLIDOS = ['Álvarez', 'Muñoz', 'Peña', 'Gómez', 'Núñez', 'Ibáñez', 'Pérez', 'Martínez', 'Ramírez', 'Suárez'];

/** La planilla de prueba: diez asegurados con acentos y eñes, separada por punto y coma, en UTF-8. */
function planilla() {
  mkdirSync(CARPETA, { recursive: true });
  const filas = APELLIDOS.map((a, i) => `ACT-IMP-${String(i + 1).padStart(2, '0')};${a};act.imp${i + 1}@aseguradora-test.com`);
  const archivo = join(CARPETA, 'asegurados.csv');
  writeFileSync(archivo, ['Nombre;Apellido;Correo electrónico', ...filas].join('\n') + '\n', 'utf8');
  return archivo;
}

// ── A.7.1 ────────────────────────────────────────────────────────────────────
test('A.7.1 — Importación de contactos desde planilla de cálculo', async ({ page }, info) => {
  // «Importar un archivo de planilla con contactos y determinar si ingresan todos conservando la acentuación y
  //  los campos, o si hay pérdida»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarContactos(page, /^ACT-IMP-/);

  const resultado = await importarCsv(page, planilla());
  const capResultado = await capturar(page, 'A.7.1', plataforma, '1-resultado');
  console.log('    RESULTADO:', resultado.slice(resultado.indexOf('Resultado de importación'), resultado.indexOf('Resultado de importación') + 120));
  await cerrarPaneles(page);

  const importados = await contactos(page, /^ACT-IMP-/, ['ID', 'NAME', 'LAST_NAME', 'EMAIL']);
  const apellidos = importados.map(c => c.LAST_NAME).sort();
  console.log(`    importados: ${importados.length} · apellidos: ${apellidos.join(', ')}`);
  console.log(`    correos: ${importados.filter(c => c.EMAIL?.length).length}`);

  await borrarContactos(page, /^ACT-IMP-/);

  expect(importados.length, 'deben ingresar los diez contactos').toBe(10);
  expect(apellidos, 'la acentuación y las eñes deben conservarse').toEqual([...APELLIDOS].sort());
  expect(importados.filter(c => c.EMAIL?.length).length, 'los diez correos deben ingresar').toBe(10);

  registrar({
    criterio: 'A.7.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El listado de contactos trae un asistente de importación de planillas CSV, sin configurar nada: se sube el ' +
      'archivo con el botón «Subir archivo», se elige la codificación y el delimitador, se relacionan las columnas ' +
      'con los campos y se importa. El asistente reconoció solo nombre y apellido; la columna del correo, con otro ' +
      'rótulo, se relacionó a mano con «E-mail del trabajo» en el paso de mapeo. Se cargó una planilla de diez ' +
      'asegurados con tildes y eñes en los apellidos y ' +
      'ingresaron los diez con sus correos y la acentuación intacta.',
    evidencia: [capResultado],
    medicion: `${importados.length} de 10 contactos importados`,
  });
});

// ── A.7.2 ────────────────────────────────────────────────────────────────────
test('A.7.2 — Importación de contactos desde las agendas de correo', async ({ page }, info) => {
  // «Buscar la conexión con el correo web y con el gestor de escritorio que usa la compañía, e incorporar
  //  contactos desde la agenda de cada uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await abrirMenuDelListado(page);
  const capMenu = await capturar(page, 'A.7.2', plataforma, '1-menu-de-importacion');
  const menu = (await page.locator('.popup-window:visible').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
  const conGmail = /Importar contactos de Gmail desde un archivo CSV/.test(menu);
  const conOutlook = /Importar contactos de Outlook desde un archivo CSV/.test(menu);
  const conYahoo = /Importar contactos de Yahoo! Email desde un archivo CSV/.test(menu);
  console.log(`    Gmail: ${conGmail} · Outlook: ${conOutlook} · Yahoo: ${conYahoo}`);
  await page.keyboard.press('Escape');

  expect(conGmail && conOutlook && conYahoo, 'el listado debe ofrecer una importación por cada agenda').toBeTruthy();

  registrar({
    criterio: 'A.7.2',
    plataforma,
    cumple: 1,
    justificacion:
      'El listado de contactos ofrece una importación para cada agenda de correo —Gmail, Outlook y Yahoo!—, pero ' +
      'todas parten de un archivo CSV que el usuario exporta antes desde su correo: no hay una conexión que lea la ' +
      'agenda directamente. Incorporar los contactos de la compañía exige, en cada carga, exportar el archivo desde ' +
      'el correo web o el gestor de escritorio e importarlo después con el asistente.',
    evidencia: [capMenu],
  });
});

// ── A.7.3 ────────────────────────────────────────────────────────────────────
const COMPARACION_PLANES = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
const AYUDA_WEBMAIL = 'https://helpdesk.bitrix24.es/open/22084704/';
const AYUDA_CORREO_EN_CRM = 'https://helpdesk.bitrix24.es/open/18295168/';
const PROVEEDORES = ['Gmail', 'Outlook', 'iCloud', 'Office365', 'Exchange', 'Yahoo!', 'Aol', 'Buzón personalizado'];

/** El marco de la pantalla «Integración del buzón», que se abre como panel deslizante. */
const marcoDeWebmail = (page: any) => page.frames().find((f: any) => f.url().includes('/mail/') && f.url().includes('IFRAME_TYPE=SIDE_SLIDER'));

/**
 * Elige un proveedor en «Integración del buzón» y dice si el sistema abre el formulario de conexión o responde
 * que no está disponible en el plan. Se determina completando la operación: el clic sobre el proveedor.
 */
async function conectarBuzon(page: any, proveedor: string) {
  const marco = marcoDeWebmail(page);
  if (!marco) throw new Error('No está abierta la pantalla de integración del buzón');
  await marco.getByRole('button', { name: proveedor }).first().click();
  await page.waitForTimeout(3500);
  const texto = (await marco.locator('body').innerText()).replace(/\s+/g, ' ');
  const hayFormulario = await marco.locator('input[type="password"], input[name*="server" i], input[name*="imap" i]').count() > 0;
  return { muro: /No disponible en su plan/.test(texto) && !hayFormulario, formulario: hayFormulario };
}

test('A.7.3 — Sincronización del correo de varios usuarios', async ({ page, browser }, info) => {
  // «Configurar una casilla y comprobar si la configuración admite hacerlo para varios usuarios o solo para uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');

  // El administrador intenta conectar una casilla con cada proveedor que ofrece Webmail, empezando por IMAP propio
  await menuLateral(page, /Webmail/);
  await asentar(page, 4000);
  const capAdmin = await capturar(page, 'A.7.3', plataforma, '1-integracion-del-buzon');
  const admin = await conectarBuzon(page, 'Buzón personalizado');
  const capMuroAdmin = await capturar(page, 'A.7.3', plataforma, '2-buzon-personalizado-del-administrador');
  const resto: Record<string, boolean> = {};
  for (const p of PROVEEDORES.filter(x => x !== 'Buzón personalizado')) resto[p] = (await conectarBuzon(page, p)).muro;
  console.log(`    administrador · IMAP propio: muro=${admin.muro} formulario=${admin.formulario} · otros proveedores con muro: ${JSON.stringify(resto)}`);

  // «Conectar varios buzones», el control de arriba a la derecha
  const marco = marcoDeWebmail(page);
  await marco.getByRole('button', { name: 'Conectar varios buzones' }).click();
  await page.waitForTimeout(4000);
  const varios = (await textoDe(page)).replace(/\s+/g, ' ');
  const variosPideOtroPlan = /actualiza a cualquier plan a partir del Professional/i.test(varios);
  const capVarios = await capturar(page, 'A.7.3', plataforma, '3-conectar-varios-buzones');
  console.log(`    «Conectar varios buzones» pide otro plan: ${variosPideOtroPlan}`);
  await cerrarPaneles(page);

  // El productor, con su propia sesión, intenta conectar su casilla
  const { contexto, pagina } = await entrarComoProductor(browser, gomez);
  let productorConMuro = false;
  let capProductor = '';
  try {
    await menuLateral(pagina, /Webmail/);
    await asentar(pagina, 4000);
    const suyo = await conectarBuzon(pagina, 'Buzón personalizado');
    productorConMuro = suyo.muro;
    capProductor = await capturar(pagina, 'A.7.3', plataforma, '4-buzon-personalizado-del-productor');
    console.log(`    productor · IMAP propio: muro=${suyo.muro} formulario=${suyo.formulario}`);
  } finally {
    await contexto.close();
  }

  const fuentes = [
    await citar(browser, { url: COMPARACION_PLANES, buscar: 'Número de bandejas de entrada de correo electrónico por usuario', captura: 'A-7-3-bitrix24-5-comparacion-bandejas' }),
    await citar(browser, { url: COMPARACION_PLANES, buscar: 'Integración con servicios de correo electrónico de terceros', captura: 'A-7-3-bitrix24-6-comparacion-terceros' }),
    await citar(browser, { url: AYUDA_WEBMAIL, buscar: /Webmail está disponible solo en algunos planes comerciales/i, captura: 'A-7-3-bitrix24-7-ayuda-webmail' }),
  ];
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'A-7-3-bitrix24-basic');

  expect(admin.muro, 'IMAP propio debe pedir otro plan al administrador').toBeTruthy();
  expect(Object.values(resto).every(Boolean), 'ningún otro proveedor debe abrir el formulario en la edición gratuita').toBeTruthy();
  expect(productorConMuro, 'IMAP propio debe pedir otro plan al productor').toBeTruthy();

  registrar({
    criterio: 'A.7.3',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición gratuita no se puede conectar ninguna casilla, ni la del administrador ni la de un productor. ' +
      'Webmail ofrece Gmail, Outlook, iCloud, Office365, Exchange, Yahoo!, Aol y «Buzón personalizado» (IMAP+SMTP), ' +
      'pero al elegir cualquiera de ellos, con el administrador y con la sesión del productor, el sistema no abre el ' +
      'formulario de conexión y responde «No disponible en su plan». «Conectar varios buzones» también pide otro ' +
      'plan: «para conectar y gestionar múltiples buzones de correo corporativos, actualiza a cualquier plan a partir ' +
      'del Professional». La comparación de planes del fabricante marca Webmail y la integración con servicios de ' +
      'correo de terceros como no incluidos en la edición gratuita, y la ayuda confirma que Webmail solo está en ' +
      'planes comerciales. Sin una casilla conectada no hay sincronización de ningún usuario.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Según la comparación de planes y la ayuda del fabricante, desde el plan Basic Webmail admite una casilla por ' +
        'usuario —cada usuario conecta la suya, una sola vez— y los planes superiores suben ese número (5 en Standard, ' +
        '10 en Professional y Enterprise) sin cambiar lo que cada usuario puede hacer. No se contrató el plan, así ' +
        'que la conexión no se ejercitó.',
    })],
    evidencia: [capAdmin, capMuroAdmin, capVarios, capProductor],
    documentacion: [...fuentes, ...precio],
    medicion: `IMAP propio: muro para el administrador y para el productor · otros proveedores con muro: ${Object.values(resto).filter(Boolean).length} de ${Object.keys(resto).length}`,
  });
});

// ── A.7.4 ────────────────────────────────────────────────────────────────────
test('A.7.4 — Vinculación automática del correo a la ficha', async ({ page, browser }, info) => {
  // «Enviar un mensaje a la dirección de un asegurado cargado y comprobar si queda registrado en su ficha sin
  //  intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);
  const ASUNTO = `Consulta por la renovación de mi póliza ${new Date().toISOString().slice(0, 16)}`;

  await entrar(page, plataforma);
  await borrarContactos(page, /^ACT-Lucia/);
  await vaciarCasillas();

  try {
    // El asegurado cargado, con su correo
    await altaDeContacto(page);
    await llenarContacto(page, 'ACT-Lucia', 'Correo');
    await panel(page).locator('input[name="EMAIL[n0][VALUE]"]').fill('lucia.correo@example.com');
    await guardarContacto(page);
    await cerrarPaneles(page);

    // La casilla de atención tendría que estar conectada: se intenta por IMAP propio
    await menuLateral(page, /Webmail/);
    await asentar(page, 4000);
    const conexion = await conectarBuzon(page, 'Buzón personalizado');
    const capConexion = await capturar(page, 'A.7.4', plataforma, '1-conexion-de-la-casilla');
    console.log(`    conexión de la casilla de atención: muro=${conexion.muro} formulario=${conexion.formulario}`);
    await cerrarPaneles(page);

    // El asegurado escribe desde su casilla a la de atención, que llega desde afuera
    await enviarPorSmtpLocal('lucia.correo@example.com', ATENCION, ASUNTO, 'Quisiera saber cuándo vence mi póliza de hogar.');
    const llegaron = (await recibidos(ATENCION)).filter(m => m.subject === ASUNTO).length;
    console.log(`    mensajes en la casilla de atención: ${llegaron}`);

    // La sincronización del buzón en la nube tarda minutos: se espera y se mira la ficha
    await page.waitForTimeout(120_000);
    await abrirContacto(page, 'ACT-Lucia');
    await page.waitForTimeout(3000);
    const ficha = await textoDe(page);
    const enFicha = ficha.includes(ASUNTO) || /renovación de mi póliza/.test(ficha);
    const capFicha = await capturar(page, 'A.7.4', plataforma, '2-ficha-del-asegurado');
    console.log(`    el correo figura en la ficha: ${enFicha}`);
    await cerrarPaneles(page);

    const fuentes = [
      await citar(browser, { url: AYUDA_CORREO_EN_CRM, buscar: /los correos electrónicos entrantes aparecerán en la ficha del elemento de CRM correspondiente/i, captura: 'A-7-4-bitrix24-3-ayuda-correo-en-crm' }),
      await citar(browser, { url: COMPARACION_PLANES, buscar: 'Integración con servicios de correo electrónico de terceros', captura: 'A-7-4-bitrix24-4-comparacion-terceros' }),
    ];
    const precio = await constanciaDe(browser, BITRIX24_BASIC, 'A-7-4-bitrix24-basic');

    expect(llegaron, 'el mensaje debe llegar a la casilla de atención').toBe(1);
    expect(conexion.muro, 'conectar la casilla debe pedir otro plan en la edición gratuita').toBeTruthy();
    expect(enFicha, 'sin casilla conectada el correo no debe figurar en la ficha').toBeFalsy();

    registrar({
      criterio: 'A.7.4',
      plataforma,
      cumple: 0,
      justificacion:
        'En la edición gratuita el correo de un asegurado no llega a su ficha porque no se puede conectar la casilla ' +
        'de la compañía: «Buzón personalizado» responde «No disponible en su plan» y no abre el formulario. Con el ' +
        'asegurado cargado —ACT-Lucia Correo, lucia.correo@example.com— se mandó un mensaje desde esa dirección a la ' +
        'casilla de atención, que lo recibió, y después de esperar dos minutos la ficha no registra ninguna actividad ' +
        'de correo. La ayuda del fabricante describe que, con la opción «Integración de CRM» activada en el buzón, los ' +
        'correos entrantes aparecen en la ficha correspondiente; esa opción forma parte de la conexión del buzón, que ' +
        'la edición gratuita no permite.',
      conPlan: [conPlanDe(BITRIX24_BASIC, {
        cumple: 2,
        costo: 1,
        justificacion:
          'Con una casilla conectada desde el plan Basic, el fabricante documenta que activar «Integración de CRM» en ' +
          'la configuración del buzón hace que cada correo entrante quede como actividad en la ficha del CRM ' +
          'correspondiente, sin intervención. Activar la opción es configuración de una sola vez por casilla. No se ' +
          'contrató el plan, así que la vinculación no se ejercitó.',
      })],
      evidencia: [capConexion, capFicha],
      documentacion: [...fuentes, ...precio],
      medicion: `correo recibido en la casilla de atención: sí · en la ficha tras 2 min: ${enFicha ? 'sí' : 'no'}`,
    });
  } finally {
    await borrarContactos(page, /^ACT-Lucia/);
  }
});

const COMPARACION = 'https://www.bitrix24.es/prices/compare_cloud_plans.php';
const FILA_EXPORTAR = 'Opción para exportar contactos a CSV, Excel y Outlook';

/** Abre la exportación de contactos y dice si el sistema la deja hacer o pide otro plan. */
async function exportacionDeContactos(page: any, prefijo: string, plataforma: any) {
  await abrirMenuDelListado(page);
  const capMenu = await capturar(page, prefijo, plataforma, '1-menu-de-formatos');
  const menu = (await page.locator('.popup-window:visible').allInnerTexts()).join(' ').replace(/\s+/g, ' ');
  await elegirEnMenuDelListado(page, /^Exportar a CSV$/);
  await page.waitForTimeout(6000);
  const limite = (await Promise.all(page.frames().map((f: any) => f.locator('body').innerText().catch(() => '')))).join(' ').replace(/\s+/g, ' ');
  const pideOtroPlan = /Exporte sus contactos a CSV, Excel y Outlook/.test(limite) && /actualizando a un plan de nivel superior/.test(limite);
  const capLimite = await capturar(page, prefijo, plataforma, '2-exportacion');
  return { menu, pideOtroPlan, capMenu, capLimite };
}

// ── A.7.5 ────────────────────────────────────────────────────────────────────
test('A.7.5 — Formatos de intercambio aceptados', async ({ page, browser }, info) => {
  // «Enumerar los formatos en que el sistema admite entrar y sacar datos, y determinar si incluyen los que la
  //  compañía usa con sus otros sistemas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const { menu, pideOtroPlan, capMenu, capLimite } = await exportacionDeContactos(page, 'A.7.5', plataforma);
  const entrada = ['vCard', 'CSV'].filter(f => new RegExp(`Importar.*${f}`).test(menu));
  const salida = ['CSV', 'Excel', 'Outlook'].filter(f => new RegExp(`Exportar a ${f}`).test(menu));
  console.log(`    entrada: ${entrada.join(', ')} · salida: ${salida.join(', ')} · la exportación pide otro plan: ${pideOtroPlan}`);

  const fila = await citar(browser, { url: COMPARACION, buscar: FILA_EXPORTAR, captura: 'A-7-5-bitrix24-3-comparacion-de-planes' });
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'A-7-5-bitrix24-basic');

  expect(entrada.length, 'el listado debe ofrecer importar vCard y CSV').toBe(2);
  expect(salida.length, 'el listado debe ofrecer exportar a CSV, Excel y Outlook').toBe(3);
  expect(pideOtroPlan, 'la exportación debe pedir un plan superior en la edición gratuita').toBeTruthy();

  registrar({
    criterio: 'A.7.5',
    plataforma,
    cumple: 1,
    justificacion:
      'En la edición gratuita los datos entran por vCard y por CSV —con asistentes para las agendas de Gmail, ' +
      'Outlook y Yahoo! y una migración desde otro CRM— pero no salen: «Exportar a CSV» no se abre y el sistema ' +
      'responde que hay que actualizar a un plan superior. La comparación de planes del fabricante publica la ' +
      'opción de exportar contactos a CSV, Excel y Outlook en los planes de pago, desde el Basic. Sin ella la ' +
      'compañía solo puede compartir datos con sus otros sistemas en un sentido.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      costo: 0,
      justificacion:
        'Con el plan Basic se habilita la exportación de contactos a CSV, Excel y Outlook, que sumada a la ' +
        'importación por vCard y CSV cubre la entrada y la salida en los formatos que usan los demás sistemas.',
    })],
    evidencia: [capMenu, capLimite],
    documentacion: [fila, ...precio],
  });
});

// ── A.7.6 ────────────────────────────────────────────────────────────────────
test('A.7.6 — Exportación de la cartera sin pérdida de datos', async ({ page, browser }, info) => {
  // «Exportar los registros importados y comparar el archivo con el original: si coincide, si pierde acentuación
  //  o campos, o si faltan filas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const { pideOtroPlan, capLimite } = await exportacionDeContactos(page, 'A.7.6', plataforma);
  console.log(`    la exportación pide otro plan: ${pideOtroPlan}`);

  const fila = await citar(browser, { url: COMPARACION, buscar: FILA_EXPORTAR, captura: 'A-7-6-bitrix24-2-comparacion-de-planes' });
  const precio = await constanciaDe(browser, BITRIX24_BASIC, 'A-7-6-bitrix24-basic');

  expect(pideOtroPlan, 'la exportación debe pedir un plan superior en la edición gratuita').toBeTruthy();

  registrar({
    criterio: 'A.7.6',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición gratuita no se puede exportar la cartera: «Exportar a CSV» no genera ningún archivo y el ' +
      'sistema responde que la función requiere actualizar a un plan superior. La comparación de planes del ' +
      'fabricante confirma que la opción de exportar contactos a CSV, Excel y Outlook no forma parte de la ' +
      'edición gratuita. Sin archivo no hay nada que comparar con la planilla original.',
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      costo: 0,
      justificacion:
        'El plan Basic incluye la opción de exportar contactos a CSV, Excel y Outlook, de modo que la cartera ' +
        'se puede sacar del sistema. No se contrató el plan, así que no se comparó el contenido del archivo ' +
        'con la planilla original.',
    })],
    evidencia: [capLimite],
    documentacion: [fila, ...precio],
  });
});
