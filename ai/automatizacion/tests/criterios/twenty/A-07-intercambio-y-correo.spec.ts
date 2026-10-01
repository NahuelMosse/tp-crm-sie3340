import { test, expect, Page } from '../../humano';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import {
  objeto, registros, borrarRegistro, abrirFicha, configuracion, clicReal, esperarCarga, textoDe, entrarComo,
  importar, exportar, menuDelListado, conectarCasilla, quitarCasilla,
} from '../../twenty/ui';
import { cargarCartera, PRODUCTOR } from '../../twenty/escenario';
import { CORREO, enviarDesdeAfuera } from '../../correo';
import { EMAIL, PASS } from '../../twenty/helper';

/**
 * A.7 — Intercambio de datos y correo, sobre Twenty
 *
 * El correo se prueba contra el mismo servidor real de SMTP e IMAP que en
 * EspoCRM. La casilla comercial de la compañía la conecta A.4.2.
 */

test.describe.configure({ mode: 'serial' });

/** La planilla de la compañía: diez asegurados, con tildes y eñes en nombres y domicilios. */
const PLANILLA = [
  ['Nombre', 'Apellido', 'Correo', 'Teléfono', 'Ciudad'],
  ['Ramón', 'Núñez', 'rnunez@planilla.test', '+54 11 4600-0001', 'San Martín'],
  ['Inés', 'Muñoz', 'imunoz@planilla.test', '+54 11 4600-0002', 'Córdoba'],
  ['José María', 'Ibáñez', 'jmibanez@planilla.test', '+54 11 4600-0003', 'Neuquén'],
  ['Begoña', 'Peñalba', 'bpenalba@planilla.test', '+54 11 4600-0004', 'Tucumán'],
  ['Héctor', 'Güemes', 'hguemes@planilla.test', '+54 11 4600-0005', 'Santa Fe'],
  ['Mónica', 'Echeverría', 'mecheverria@planilla.test', '+54 11 4600-0006', 'Paraná'],
  ['Andrés', 'Sáenz', 'asaenz@planilla.test', '+54 11 4600-0007', 'Río Cuarto'],
  ['Lucía', 'Barragán', 'lbarragan@planilla.test', '+54 11 4600-0008', 'Mendoza'],
  ['Íñigo', 'Zúñiga', 'izuniga@planilla.test', '+54 11 4600-0009', 'Bahía Blanca'],
  ['Noemí', 'Cañete', 'ncanete@planilla.test', '+54 11 4600-0010', 'Posadas'],
];
const aCsv = (filas: string[][]) => filas.map(f => f.map(c => `"${c}"`).join(',')).join('\r\n') + '\r\n';
const COLUMNAS: [string, string?][] = [['Name', 'First Name'], ['Name', 'Last Name'], ['Emails', 'Primary Email'], ['Phones', 'Primary Phone Number'], ['Domicilio', 'City']];
const COMERCIAL = 'comercial@aseguradora.test';

const dir = mkdtempSync(join(tmpdir(), 'planilla-twenty-'));

/** El domicilio de la persona: lo crea A.2.1 por pantalla; si ese test no corrió, se define acá. */
async function conDomicilio(api: any) {
  const persona = await objeto(api, 'person');
  if (persona.fields.some((c: any) => c.name === 'domicilio')) return;
  await api.post('metadata/fields', { data: { objectMetadataId: persona.id, type: 'ADDRESS', name: 'domicilio', label: 'Domicilio', icon: 'IconMap' } });
}

/** Las personas que vienen de la planilla, incluidas las que ingresaron con las columnas mezcladas. */
const dePlanilla = async (api: any) => (await registros(api, 'people')).filter(p =>
  /@planilla\.test$/.test(p.emails?.primaryEmail ?? '') || /planilla\.test/.test(`${p.name?.firstName} ${p.name?.lastName}`));

/** Abre la pestaña de correos de la ficha de una persona hasta que aparezca el asunto. */
async function correoEnFicha(page: Page, persona: string, asunto: string, intentos = 30) {
  let texto = '';
  for (let i = 0; i < intentos && !texto.includes(asunto); i++) {
    if (i) await page.waitForTimeout(20_000);
    await abrirFicha(page, 'person', persona);
    await clicReal(page, page.getByText('Emails', { exact: true }).filter({ visible: true }).last());
    await page.waitForTimeout(3000);
    texto = await textoDe(page);
  }
  return texto.includes(asunto);
}

// ── A.7.1 ────────────────────────────────────────────────────────────────────
test('A.7.1 — Importación de contactos desde planilla de cálculo', async ({ page, browser }, info) => {
  // «Importar un archivo de planilla con contactos y determinar si ingresan
  //  todos conservando la acentuación y los campos, o si hay pérdida»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await conDomicilio(e.api);
  for (const p of await dePlanilla(e.api)) await borrarRegistro(e.api, 'people', p.id);

  // La planilla guardada como se la guarda en el día a día: la codificación
  // predeterminada de las planillas en Windows, y UTF-8
  const enWindows = join(dir, 'asegurados-windows.csv');
  writeFileSync(enWindows, Buffer.from(aCsv(PLANILLA.slice(0, 6)), 'latin1'));
  const enUtf8 = join(dir, 'asegurados-utf8.csv');
  writeFileSync(enUtf8, aCsv([PLANILLA[0], ...PLANILLA.slice(6)]), 'utf8');

  const deWin = await importar(page, 'people', 'People', enWindows, COLUMNAS);
  const capWindows = await capturar(page, 'A.7.1', plataforma, '1-planilla-de-windows');
  const deUtf = await importar(page, 'people', 'People', enUtf8, COLUMNAS);
  const capUtf8 = await capturar(page, 'A.7.1', plataforma, '2-planilla-utf8');

  const cargados = await dePlanilla(e.api);
  const intactos = (desde: number, hasta: number) => PLANILLA.slice(desde, hasta).filter(f => {
    const c = cargados.find(x => x.emails?.primaryEmail === f[2]);
    return c && c.name.firstName === f[0] && c.name.lastName === f[1] && c.domicilio?.addressCity === f[4];
  }).length;
  const deWindows = intactos(1, 6);
  const deUtf8 = intactos(6, 11);
  // Cuando el asistente no separa las columnas, la fila entera queda en el nombre
  const mezcladas = cargados.filter(p => /planilla\.test/.test(p.name?.firstName ?? '')).length;
  const utf8 = new Set(PLANILLA.slice(6).map(f => f[2]));
  const deVentana = cargados.filter(p => !utf8.has(p.emails?.primaryEmail)).length;
  console.log(`    cargados ${cargados.length} de 10 (${deVentana} de la planilla de Windows) · intactos: ${deWindows}/5 desde ` +
    `Windows, ${deUtf8}/5 en UTF-8 · ${mezcladas} con la fila entera en el nombre · errores marcados: ${deWin.conErrores} · ` +
    `sin reconocer: ${deUtf.sinReconocer}`);

  expect(deUtf8, 'la planilla en UTF-8 debe ingresar completa y sin pérdida').toBe(5);

  registrar({
    criterio: 'A.7.1',
    plataforma,
    cumple: deWindows === 5 ? 2 : 1,
    costo: deWindows === 5 ? 1 : 2,
    justificacion:
      'El listado de personas tiene un asistente de importación que acepta planillas de cálculo y archivos de ' +
      'texto separados por comas. Guardada en UTF-8, la planilla ingresó completa: los cinco asegurados, cada ' +
      'columna en su campo, con tildes y eñes intactas. ' +
      (deWindows === 5
        ? 'Guardada con la codificación predeterminada de las planillas en Windows también ingresó sin pérdida. '
        : 'Guardada con la codificación predeterminada de las planillas en Windows, el asistente leyó mal el ' +
          'archivo: las letras acentuadas llegaron corrompidas y en varias filas las columnas quedaron corridas o ' +
          'con la fila entera en el nombre' +
          (deWin.conErrores ? '; marcó algunas como erróneas y, al confirmar, las descartó' : '') +
          `. De las 5 filas ingresaron ${deVentana}, ${deWindows} con nombres y domicilios intactos, y el sistema ` +
          'no advirtió la corrupción de las que aceptó. ') +
      `El asistente no reconoció los encabezados en español: dejó las ${deUtf.sinReconocer} columnas sin asignar ` +
      'y hubo que indicar a mano a qué campo va cada una, abriendo las partes del nombre, del correo, del teléfono ' +
      'y del domicilio. ' + (deWindows === 5
        ? 'Asignar las columnas es trabajo que se repite en cada importación, pero breve.'
        : 'La necesidad queda resuelta con un procedimiento que se repite en cada importación: guardar la planilla ' +
          'con la codificación correcta y asignar sus columnas.'),
    evidencia: [capWindows, capUtf8],
    medicion: `UTF-8: ${deUtf8}/5 intactos · codificación de Windows: ${deVentana}/5 ingresadas, ${deWindows}/5 intactas, ` +
      `${mezcladas} con la fila entera en el nombre · ${deUtf.sinReconocer} columnas sin reconocer`,
  });
});

// ── A.7.2 ────────────────────────────────────────────────────────────────────
test('A.7.2 — Importación de contactos desde las agendas de correo', async ({ page, browser }, info) => {
  // «Buscar la conexión con el correo web y con el gestor de escritorio que usa
  //  la compañía, e incorporar contactos desde la agenda de cada uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await configuracion(page, /^Cuentas$|^Accounts$/);
  await clicReal(page, page.getByText(/^Agregar cuenta$|^Add account$|^Nueva cuenta$|^New account$/).filter({ visible: true }).first());
  await esperarCarga(page, 3000);
  const conexiones = await textoDe(page);
  const capCuentas = await capturar(page, 'A.7.2', plataforma, '1-cuentas-que-se-conectan');

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/calendar-emails/how-tos/connect-several-mailboxes-per-user',
      buscar: 'Connect an additional Google or Microsoft account',
      captura: 'A-7-2-twenty-4-google-y-microsoft',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/calendar-emails/overview',
      buscar: 'Create contacts for all external email interactions',
      captura: 'A-7-2-twenty-2-contactos-desde-el-correo',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/data-migration/capabilities/file-formats',
      buscar: /three file formats for import/,
      captura: 'A-7-2-twenty-3-importacion',
    }),
  ];

  expect(conexiones, 'las cuentas que se conectan son de correo y calendario').toMatch(/Google|Microsoft|IMAP/);

  registrar({
    criterio: 'A.7.2',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El sistema se conecta con las cuentas de Google y de Microsoft —en la instalación propia, después de ' +
      'registrar sus credenciales; la evaluada ofrece solo IMAP— y con cualquier casilla por IMAP, pero para ' +
      'sincronizar correo y calendario: no trae la agenda de contactos de ninguna. Lo que ofrece es crear ' +
      'personas a partir del correo sincronizado —cada dirección externa con la que se intercambian mensajes o ' +
      'reuniones pasa a ser un contacto—, que alcanza a quien ya escribió, no a la agenda entera. Para ' +
      'incorporar la agenda del correo web o del gestor de escritorio hay que exportarla a un archivo y pasarlo ' +
      'por el asistente de importación, un procedimiento que se repite cada vez que la agenda cambia.',
    evidencia: [capCuentas],
    documentacion: fuentes,
  });
});

// ── A.7.3 ────────────────────────────────────────────────────────────────────
test('A.7.3 — Sincronización del correo de varios usuarios', async ({ page, browser }, info) => {
  // «Configurar una casilla y comprobar si la configuración admite hacerlo para
  //  varios usuarios o solo para uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const asegurado = (await registros(e.api, 'people')).find(p => p.id === e.asegurados[3]);
  const ASUNTO = `Consulta para ${PRODUCTOR.email}`;

  // El administrador tiene la casilla comercial; el productor conecta la suya desde su cuenta
  await configuracion(page, /^Cuentas$|^Accounts$/);
  if (!(await page.getByText(COMERCIAL, { exact: true }).first().isVisible().catch(() => false))) {
    await conectarCasilla(page, { nombre: 'Comercial', correo: COMERCIAL, servidor: CORREO.host, imap: CORREO.imap, smtp: CORREO.smtp });
  }
  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  await quitarCasilla(page, PRODUCTOR.email);
  enviarDesdeAfuera(asegurado.emails.primaryEmail, PRODUCTOR.email, ASUNTO, 'Mensaje para el productor.');
  await conectarCasilla(page, { nombre: `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`, correo: PRODUCTOR.email, servidor: CORREO.host, imap: CORREO.imap, smtp: CORREO.smtp });
  await configuracion(page, /^Cuentas$|^Accounts$/);
  const cuentasProductor = await textoDe(page);
  const capProductor = await capturar(page, 'A.7.3', plataforma, '1-casilla-del-productor');

  const llego = await correoEnFicha(page, asegurado.id, ASUNTO);
  const capFicha = await capturar(page, 'A.7.3', plataforma, '2-correo-sincronizado');

  await entrarComo(page, EMAIL, PASS);
  await configuracion(page, /^Cuentas$|^Accounts$/);
  const cuentasAdmin = await textoDe(page);
  const capAdmin = await capturar(page, 'A.7.3', plataforma, '3-casilla-del-administrador');

  expect(cuentasProductor, 'el productor debe tener su propia casilla').toContain(PRODUCTOR.email);
  expect(cuentasAdmin, 'el administrador conserva la suya').toContain(COMERCIAL);
  expect(cuentasAdmin, 'la casilla del productor es suya, no del administrador').not.toContain(PRODUCTOR.email);
  expect(llego, 'la casilla del productor debe sincronizar').toBeTruthy();

  registrar({
    criterio: 'A.7.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Cada usuario conecta su propia casilla desde su configuración personal, por IMAP y SMTP o con una cuenta ' +
      'de Google o Microsoft. El administrador tiene conectada la casilla comercial y el productor, desde su ' +
      'cuenta, conectó la suya contra el mismo servidor de correo: cada uno ve solo la propia en su lista de ' +
      'cuentas, y el mensaje que un asegurado le mandó al productor apareció en la ficha del asegurado. ' +
      'Configurar cada casilla es trabajo de una sola vez, y lo hace cada usuario.',
    evidencia: [capProductor, capFicha, capAdmin],
  });
});

// ── A.7.4 ────────────────────────────────────────────────────────────────────
test('A.7.4 — Vinculación automática del correo a la ficha', async ({ page, browser }, info) => {
  // «Enviar un mensaje a la dirección de un asegurado cargado y comprobar si
  //  queda registrado en su ficha sin intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const asegurado = (await registros(e.api, 'people')).find(p => p.id === e.asegurados[0]);
  const ASUNTO = `Consulta por la renovación de mi póliza ${new Date().toISOString().slice(0, 16)}`;

  // La casilla se vuelve a conectar: el servidor de prueba se vacía entre
  // criterios, y la sincronización de una conexión anterior sigue esperando
  // mensajes posteriores al último que leyó
  await quitarCasilla(page, COMERCIAL);
  await conectarCasilla(page, { nombre: 'Comercial', correo: COMERCIAL, servidor: CORREO.host, imap: CORREO.imap, smtp: CORREO.smtp });

  // El asegurado escribe desde su casilla, y nadie toca nada
  enviarDesdeAfuera(asegurado.emails.primaryEmail, COMERCIAL, ASUNTO, 'Quisiera saber cuándo vence mi póliza de hogar.');
  const enFicha = await correoEnFicha(page, asegurado.id, ASUNTO);
  const capFicha = await capturar(page, 'A.7.4', plataforma, '1-correo-en-la-ficha');

  expect(enFicha, 'el correo debe figurar en la ficha del asegurado').toBeTruthy();

  registrar({
    criterio: 'A.7.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Con la casilla comercial de la compañía conectada, un asegurado escribió desde su propia dirección y el ' +
      'mensaje apareció en la pestaña de correos de su ficha sin que nadie lo moviera: el sistema reconoció la ' +
      'dirección del remitente y lo vinculó con la persona que la tiene cargada. Conectar la casilla es trabajo ' +
      'de una sola vez; la vinculación ocurre sola en cada mensaje.',
    evidencia: [capFicha],
  });
});

// ── A.7.5 ────────────────────────────────────────────────────────────────────
test('A.7.5 — Formatos de intercambio aceptados', async ({ page, browser }, info) => {
  // «Enumerar los formatos en que el sistema admite entrar y sacar datos, y
  //  determinar si incluyen los que la compañía usa con sus otros sistemas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await menuDelListado(page, 'people');
  const opciones = await textoDe(page);
  const capMenu = await capturar(page, 'A.7.5', plataforma, '1-importar-y-exportar');
  await clicReal(page, page.getByText('Import People', { exact: true }).last());
  const entrada = page.locator('input[type=file][accept*="csv"]').first();
  await entrada.waitFor({ state: 'attached', timeout: 30_000 });
  const aceptados = (await entrada.getAttribute('accept'))!.split(',').filter(f => f.startsWith('.'));
  const capEntrada = await capturar(page, 'A.7.5', plataforma, '2-formatos-de-entrada');
  await page.keyboard.press('Escape');

  const archivo = await exportar(page, 'people', join(dir, 'formato.csv'));
  const salida = archivo.split('.').pop()!;

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/developers/extend/api',
    buscar: /REST and GraphQL/i,
    captura: 'A-7-5-twenty-3-api',
  });

  expect(opciones, 'el listado debe ofrecer importar y exportar').toMatch(/Import People/);
  expect(aceptados, 'debe aceptar planillas de cálculo').toEqual(expect.arrayContaining(['.xlsx', '.csv']));

  registrar({
    criterio: 'A.7.5',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      `Los datos entran por el asistente de importación de cada listado, que acepta ${aceptados.join(', ')}: ` +
      'la planilla de cálculo se sube tal cual, sin pasarla antes a texto. Salen exportando la vista del ' +
      `listado a un archivo ${salida.toUpperCase()}, que la planilla abre directamente, y por las interfaces de ` +
      'programación REST y GraphQL en JSON, que es el formato de intercambio entre sistemas. Los formatos que ' +
      'la compañía usa están cubiertos de fábrica.',
    evidencia: [capMenu, capEntrada],
    documentacion: fuente,
    medicion: `Entrada: ${aceptados.join(', ')} · salida: .${salida} · interfaz de programación: JSON`,
  });
});

// ── A.7.6 ────────────────────────────────────────────────────────────────────
test('A.7.6 — Exportación de la cartera sin pérdida de datos', async ({ page, browser }, info) => {
  // «Exportar los registros importados y comparar el archivo con el original:
  //  si coincide, si pierde acentuación o campos, o si faltan filas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  // Los que ingresaron bien en A.7.1: la planilla en UTF-8
  const originales = PLANILLA.slice(6);
  await entrar(page, plataforma);
  const archivo = await exportar(page, 'people', join(dir, 'exportado.csv'));
  const capExportacion = await capturar(page, 'A.7.6', plataforma, '1-exportacion');

  const crudo = readFileSync(archivo, 'utf8');
  const conMarca = crudo.startsWith('﻿');
  const contenido = crudo.replace(/^﻿/, '');
  const conservados = originales.filter(f => [f[0], f[1], f[2], f[4]].every(v => contenido.includes(v))).length;

  expect(conservados, 'cada asegurado debe salir con sus datos y su acentuación').toBe(originales.length);
  expect(conMarca, 'el archivo debe declarar su codificación para la planilla').toBeTruthy();

  registrar({
    criterio: 'A.7.6',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Se exportó la vista del listado de personas y se comparó el archivo con la planilla original: salieron ' +
      `las ${originales.length} filas importadas, cada una con nombre, apellido, correo y ciudad, y con las ` +
      'tildes y eñes intactas. El archivo trae todas las columnas de la vista, con los campos compuestos ' +
      'separados en sus partes, y la marca de codificación que la planilla necesita para abrirlo sin alterar ' +
      'los acentos. La exportación viene de fábrica en todos los listados.',
    evidencia: [capExportacion],
    medicion: `${conservados} de ${originales.length} filas idénticas al original`,
  });
});
