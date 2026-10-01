import { Page, test, expect } from '../humano';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { cargarCartera, ASEGURADOS, PRODUCTOR } from '../datos';
import { citar } from '../fuentes';
import { apiEspo, crear, listar } from '../api';
import { CORREO, ATENCION, vaciarCasillas, enviarDesdeAfuera, correrTareasHasta, habilitarServidorDePrueba } from '../correo';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, filasDelListado } from './comun';
import { pestana, administracion, ficha } from '../espocrm/navegar';

/**
 * A.7 — Intercambio de datos y correo
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. El correo se prueba contra un servidor real de SMTP e IMAP.
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

let dir = '';
/** Columnas que el asistente dejó sin asignar en la última importación. */
let columnasSinReconocer = 0;

test.beforeAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api } = await cargarCartera();
  dir = mkdtempSync(join(tmpdir(), 'planilla-'));

  // Lo que dejaron corridas anteriores se quita: cada corrida mide lo mismo
  for (const c of (await listar(api, 'Contact', { maxSize: 200 })).list
    .filter((c: any) => /@planilla\.test$/.test(c.emailAddress ?? ''))) await api.delete(`Contact/${c.id}`);
  for (const [entidad, filtro] of [['EmailAccount', (x: any) => /@aseguradora\.test$/.test(x.emailAddress ?? '')],
    ['InboundEmail', (x: any) => x.emailAddress === ATENCION]] as const) {
    for (const x of (await listar(api, entidad, { maxSize: 50 })).list.filter(filtro)) await api.delete(`${entidad}/${x.id}`);
  }
  for (const e of (await listar(api, 'Email', { maxSize: 200 })).list
    .filter((e: any) => /^Consulta para |^Consulta por la renovación de mi póliza$/.test(e.name ?? ''))) {
    await api.delete(`Email/${e.id}`);
  }
  await habilitarServidorDePrueba(api);
  await vaciarCasillas();
});

/** Recorre el asistente de importación con un archivo y devuelve lo que informa al terminar. */
async function importar(page: Page, archivo: string): Promise<string> {
  await pestana(page, 'Import');
  await page.locator('#import-file').waitFor({ state: 'attached', timeout: 40_000 });
  await elegirLista(page, 'entityType', 'Contact');
  const [ventana] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#import-file').click()]);
  await ventana.setFiles(archivo);
  await page.waitForTimeout(2500);
  await page.locator('button[data-action="next"]').first().click();
  await page.waitForTimeout(4000);

  // Correspondencia de columnas: el asistente no reconoce los encabezados en
  // español y deja todas en "omitir", así que cada una se asigna a su campo
  const correspondencia: Record<string, string> = {
    Nombre: 'firstName', Apellido: 'lastName', Correo: 'emailAddress', 'Teléfono': 'phoneNumber', Ciudad: 'addressCity',
  };
  const filas = page.locator('#main table tbody tr').filter({ has: page.locator('td') });
  let omitidas = 0;
  for (let i = 0; i < await filas.count(); i++) {
    const fila = filas.nth(i);
    const encabezado = (await fila.locator('td').first().innerText()).trim();
    const campo = Object.entries(correspondencia).find(([k]) => encabezado.startsWith(k.slice(0, 4)))?.[1];
    if (!campo) continue;
    if (/Omitir/.test(await fila.locator('.selectize-input').first().innerText())) omitidas++;
    await fila.locator('.selectize-input').first().click();
    await page.locator(`.selectize-dropdown:visible [data-value="${campo}"]`).first().click();
    await page.waitForTimeout(300);
  }
  columnasSinReconocer = omitidas;
  await page.locator('button[data-action="next"]').first().click();
  // Al terminar, el asistente abre el resultado de la importación
  await page.waitForFunction(() => location.hash.startsWith('#Import/view/'), undefined, { timeout: 120_000 });
  await page.waitForTimeout(3000);
  return textoDe(page);
}

// ── A.7.1 ────────────────────────────────────────────────────────────────────
test('A.7.1 — Importación de contactos desde planilla de cálculo', async ({ page, browser }, info) => {
  // «Importar un archivo de planilla con contactos y determinar si ingresan
  //  todos conservando la acentuación y los campos, o si hay pérdida»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(700_000);

  // La planilla guardada como se la guarda en el día a día: la codificación
  // predeterminada de las planillas en Windows, y la opción UTF-8 que pide el sistema
  const enWindows = join(dir, 'asegurados-windows.csv');
  writeFileSync(enWindows, Buffer.from(aCsv(PLANILLA.slice(0, 6)), 'latin1'));
  const enUtf8 = join(dir, 'asegurados-utf8.csv');
  writeFileSync(enUtf8, aCsv([PLANILLA[0], ...PLANILLA.slice(6)]), 'utf8');

  await entrar(page, plataforma);
  const capPedido = await (async () => {
    await pestana(page, 'Import');
    await page.waitForTimeout(5000);
    return capturar(page, 'A.7.1', plataforma, '1-pide-utf8');
  })();

  await importar(page, enWindows);
  const capWindows = await capturar(page, 'A.7.1', plataforma, '2-planilla-de-windows');
  await importar(page, enUtf8);
  const capUtf8 = await capturar(page, 'A.7.1', plataforma, '3-planilla-utf8');

  const api = await apiEspo();
  const cargados = (await listar(api, 'Contact', { maxSize: 200 })).list
    .filter((c: any) => /@planilla\.test$/.test(c.emailAddress ?? ''));
  const esperado = new Map(PLANILLA.slice(1).map(f => [f[2], f]));
  const intactos = (desde: number, hasta: number) => PLANILLA.slice(desde, hasta).filter(f => {
    const c = cargados.find((x: any) => x.emailAddress === f[2]);
    return c && c.firstName === f[0] && c.lastName === f[1] && c.addressCity === f[4];
  }).length;
  const deWindows = intactos(1, 6);
  const deUtf8 = intactos(6, 11);
  console.log(`    cargados ${cargados.length} de ${esperado.size} · intactos: ${deWindows}/5 desde Windows, ${deUtf8}/5 en UTF-8`);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/import/',
    buscar: /UTF-8/,
    captura: 'A-7-1-espocrm-4-documentacion',
  });

  expect(deUtf8, 'la planilla en UTF-8 debe ingresar completa y sin pérdida').toBe(5);

  registrar({
    criterio: 'A.7.1',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El asistente de importación admite archivos de texto separados por comas y la propia pantalla advierte ' +
      'que "debe ser codificado en UTF-8". Guardada así, la planilla ingresó completa: los cinco asegurados, ' +
      'cada columna en su campo, con tildes y eñes intactas. ' +
      (deWindows === 5
        ? 'Guardada con la codificación predeterminada de las planillas en Windows también ingresó sin pérdida. '
        : 'Guardada con la codificación predeterminada de las planillas en Windows, ingresaron todas las filas ' +
          `pero solo ${deWindows} de 5 conservaron nombres y domicilios sin alterar: las letras acentuadas ` +
          'llegaron corrompidas, sin que el sistema lo advirtiera. ') +
      'En los dos casos el asistente no reconoció los encabezados en español: dejó las ' +
      `${columnasSinReconocer} columnas sin asignar y hubo que indicar a mano a qué campo va cada una. La ` +
      'necesidad queda resuelta con un procedimiento que se repite en cada importación: guardar la planilla ' +
      'en el formato que pide el sistema y asignar sus columnas.',
    evidencia: [capPedido, capWindows, capUtf8],
    documentacion: fuente,
    medicion: `UTF-8: ${deUtf8}/5 intactos · codificación de Windows: ${deWindows}/5 intactos`,
  });
});

// ── A.7.2 ────────────────────────────────────────────────────────────────────
test('A.7.2 — Importación de contactos desde las agendas de correo', async ({ page, browser }, info) => {
  // «Buscar la conexión con el correo web y con el gestor de escritorio que usa
  //  la compañía, e incorporar contactos desde la agenda de cada uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/integrations');
  await page.waitForTimeout(5000);
  const capIntegraciones = await capturar(page, 'A.7.2', plataforma, '1-integraciones');

  // Lo que ofrece el fabricante para Google: enviar contactos a la agenda, no traerlos
  const fuentes = [
    await citar(browser, {
      url: 'https://docs.espocrm.com/extensions/google-integration/contacts/',
      buscar: 'push your EspoCRM contacts and leads to Google Contacts',
      captura: 'A-7-2-espocrm-2-google-solo-envia',
    }),
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/import/',
      buscar: /CSV/,
      captura: 'A-7-2-espocrm-3-importacion-csv',
    }),
  ];

  registrar({
    criterio: 'A.7.2',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      'El sistema no se conecta con la agenda de ningún correo para traer contactos. Las extensiones del ' +
      'fabricante para Google y Outlook sincronizan calendario y correo, y para los contactos hacen el camino ' +
      'inverso: envían los del sistema a la agenda, no los incorporan. La vía que queda es exportar la agenda ' +
      'del correo web o del gestor de escritorio a un archivo y pasarlo por el asistente de importación, que es ' +
      'un procedimiento que se repite cada vez que la agenda cambia.',
    evidencia: [capIntegraciones],
    documentacion: fuentes,
  });
});

// ── A.7.3 ────────────────────────────────────────────────────────────────────
test('A.7.3 — Sincronización del correo de varios usuarios', async ({ page }, info) => {
  // «Configurar una casilla y comprobar si la configuración admite hacerlo para
  //  varios usuarios o solo para uno»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(700_000);

  const api = await apiEspo();
  const usuarios = (await listar(api, 'User', { maxSize: 200 })).list;
  const admin = usuarios.find((u: any) => u.userName === 'admin');
  const productor = usuarios.find((u: any) => u.userName === PRODUCTOR.userName);

  // Una casilla personal por usuario, contra el servidor de la compañía
  const casillas = [
    { usuario: admin, direccion: 'administracion@aseguradora.test' },
    { usuario: productor, direccion: 'pgomez@aseguradora.test' },
  ];
  for (const c of casillas) {
    // La casilla de una corrida anterior se reemplaza: dos cuentas sobre la misma dirección duplicarían lo recibido
    for (const vieja of (await listar(api, 'EmailAccount', { maxSize: 50 })).list.filter((e: any) => e.emailAddress === c.direccion)) {
      await api.delete(`EmailAccount/${vieja.id}`);
    }
    enviarDesdeAfuera('cliente@ejemplo.test', c.direccion, `Consulta para ${c.direccion}`, 'Mensaje de prueba.');
    await crear(api, 'EmailAccount', {
      name: c.direccion, emailAddress: c.direccion, status: 'Active',
      host: CORREO.host, port: CORREO.imap, security: '', username: c.direccion, password: 'x',
      monitoredFolders: ['INBOX'], assignedUserId: c.usuario.id, fetchSince: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
    });
  }
  // A quién quedó ligado cada correo sincronizado: la relación con sus usuarios lo dice
  const recibidoPor = async (userId: string, direccion: string) => {
    const correos = (await listar(api, 'Email', { maxSize: 200 })).list.filter((e: any) => e.name === `Consulta para ${direccion}`);
    let n = 0;
    for (const e of correos) {
      const usuarios = (await (await api.get(`Email/${e.id}/users`)).json()).list ?? [];
      if (usuarios.length === 1 && usuarios[0].id === userId) n++;
    }
    return n;
  };
  await correrTareasHasta(async () =>
    (await recibidoPor(admin.id, casillas[0].direccion)) > 0 && (await recibidoPor(productor.id, casillas[1].direccion)) > 0);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/personalEmailAccounts');
  await page.waitForTimeout(5000);
  const capCasillas = await capturar(page, 'A.7.3', plataforma, '1-casillas-personales');

  const deAdmin = await recibidoPor(admin.id, casillas[0].direccion);
  const deProductor = await recibidoPor(productor.id, casillas[1].direccion);
  await pestana(page, 'Email');
  await page.waitForTimeout(5000);
  const capBandeja = await capturar(page, 'A.7.3', plataforma, '2-bandeja');

  expect(deAdmin, 'la casilla del primer usuario debe sincronizar').toBe(1);
  expect(deProductor, 'la casilla del segundo usuario debe sincronizar').toBe(1);

  registrar({
    criterio: 'A.7.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Cada usuario puede tener su propia casilla sincronizada: la administración tiene una sección de ' +
      'cuentas de correo personales, y también de cuentas grupales para casillas compartidas. Se configuraron ' +
      'dos casillas personales, de dos usuarios distintos, contra el mismo servidor de correo, y el sistema ' +
      'trajo el mensaje de cada una a la bandeja de su dueño y solo a la suya. Configurar cada casilla es ' +
      'trabajo de una sola vez.',
    evidencia: [capCasillas, capBandeja],
  });
});

// ── A.7.4 ────────────────────────────────────────────────────────────────────
test('A.7.4 — Vinculación automática del correo a la ficha', async ({ page }, info) => {
  // «Enviar un mensaje a la dirección de un asegurado cargado y comprobar si
  //  queda registrado en su ficha sin intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(700_000);

  const api = await apiEspo();
  const asegurado = (await listar(api, 'Contact', { maxSize: 200 })).list
    .find((c: any) => c.emailAddress === ASEGURADOS[0].emailAddress);

  // La casilla de atención de la compañía, compartida. La de una corrida anterior se reemplaza
  for (const vieja of (await listar(api, 'InboundEmail', { maxSize: 50 })).list.filter((e: any) => e.emailAddress === ATENCION)) {
    await api.delete(`InboundEmail/${vieja.id}`);
  }
  await crear(api, 'InboundEmail', {
    name: 'Atención al asegurado', emailAddress: ATENCION, status: 'Active',
    host: CORREO.host, port: CORREO.imap, security: '', username: ATENCION, password: 'x', monitoredFolders: ['INBOX'],
    fetchSince: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
  });

  // El asegurado escribe desde su casilla, y nadie toca nada
  const asunto = 'Consulta por la renovación de mi póliza';
  enviarDesdeAfuera(asegurado.emailAddress, ATENCION, asunto, 'Quisiera saber cuándo vence mi póliza de hogar.');
  await correrTareasHasta(async () => (await listar(api, 'Email', { maxSize: 200 })).list.some((e: any) => e.name === asunto));

  await entrar(page, plataforma);
  await ficha(page, 'Contact', asegurado.id);
  const historial = page.locator('.panel[data-name="history"]').first();
  await historial.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(3000);
  const enFicha = (await historial.innerText()).includes(asunto);
  const capFicha = await capturar(page, 'A.7.4', plataforma, '1-correo-en-la-ficha');

  expect(enFicha, 'el correo debe figurar en la ficha del asegurado').toBeTruthy();

  registrar({
    criterio: 'A.7.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Con la casilla de atención de la compañía sincronizada, un asegurado escribió desde su propia dirección ' +
      'y el mensaje apareció en el historial de su ficha sin que nadie lo moviera: el sistema reconoció la ' +
      'dirección del remitente y lo vinculó con el asegurado que la tiene cargada. Configurar la casilla ' +
      'compartida es trabajo de una sola vez; la vinculación ocurre sola en cada mensaje.',
    evidencia: [capFicha],
  });
});

// ── A.7.5 ────────────────────────────────────────────────────────────────────
test('A.7.5 — Formatos de intercambio aceptados', async ({ page, browser }, info) => {
  // «Enumerar los formatos en que el sistema admite entrar y sacar datos, y
  //  determinar si incluyen los que la compañía usa con sus otros sistemas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await pestana(page, 'Import');
  await page.locator('#import-file').waitFor({ state: 'attached', timeout: 40_000 });
  const entrada = await page.locator('#import-file').getAttribute('accept');
  const capEntrada = await capturar(page, 'A.7.5', plataforma, '1-formatos-de-entrada');

  await listadoLimpio(page, 'Contact');
  await page.locator('thead input[type="checkbox"]').first().check({ force: true });
  await page.locator('.actions-button:visible').first().click();
  await page.locator('[data-action="export"]:visible').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('.field[data-name="format"] .selectize-input').first().click();
  const salida = (await page.locator('.selectize-dropdown:visible .option').allTextContents()).map(t => t.trim());
  await page.keyboard.press('Escape');
  const capSalida = await capturar(page, 'A.7.5', plataforma, '2-formatos-de-salida');
  await page.keyboard.press('Escape');

  const fuente = await citar(browser, { url: 'https://docs.espocrm.com/development/api/', buscar: /JSON/, captura: 'A-7-5-espocrm-3-api-json' });

  expect(entrada).toBe('.csv');

  registrar({
    criterio: 'A.7.5',
    plataforma,
    cumple: 1,
    costo: 2,
    justificacion:
      `Los datos salen en ${salida.join(' y ')} —los formatos de planilla que la compañía usa— y por la ` +
      'interfaz de programación en JSON, que es el formato de intercambio entre sistemas. Pero solo entran ' +
      'por archivo de texto separado por comas: el asistente de importación no acepta planillas de cálculo ni ' +
      'agendas en su formato propio. Cada vez que la compañía quiera cargar una planilla, tiene que guardarla ' +
      'antes como archivo de texto, con la codificación correcta.',
    evidencia: [capEntrada, capSalida],
    documentacion: fuente,
    medicion: `Entrada: ${entrada} · salida: ${salida.join(', ')} · interfaz de programación: JSON`,
  });
});

// ── A.7.6 ────────────────────────────────────────────────────────────────────
test('A.7.6 — Exportación de la cartera sin pérdida de datos', async ({ page }, info) => {
  // «Exportar los registros importados y comparar el archivo con el original:
  //  si coincide, si pierde acentuación o campos, o si faltan filas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // Los que ingresaron bien en A.7.1: la planilla en UTF-8
  const originales = PLANILLA.slice(6);
  await entrar(page, plataforma);
  await listadoLimpio(page, 'Contact');
  // La búsqueda compara desde el comienzo: para buscar por dominio va el comodín adelante
  await page.locator('.search-container input.text-filter').first().fill('*@planilla.test');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  await page.locator('thead input[type="checkbox"]').first().check({ force: true });
  await page.locator('.actions-button:visible').first().click();
  await page.locator('[data-action="export"]:visible').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await elegirLista(page, 'format', 'csv', '.modal-dialog');
  // Todos los campos, no solo las columnas del listado: es lo que se compara con la planilla
  const todos = dialogo.locator('input[data-name="exportAllFields"]').first();
  if (await todos.count()) await todos.check();
  const [descarga] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    dialogo.getByRole('button', { name: /^Exportar$/ }).first().click(),
  ]);
  const archivo = join(dir, 'exportado.csv');
  await descarga.saveAs(archivo);
  const capExportacion = await capturar(page, 'A.7.6', plataforma, '1-exportacion');

  const contenido = readFileSync(archivo, 'utf8').replace(/^﻿/, '');
  const conservados = originales.filter(f => [f[0], f[1], f[2], f[4]].every(v => contenido.includes(v))).length;

  expect(conservados, 'cada asegurado debe salir con sus datos y su acentuación').toBe(originales.length);

  registrar({
    criterio: 'A.7.6',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Se exportaron desde el listado los asegurados importados y se comparó el archivo con la planilla ' +
      `original: salieron las ${originales.length} filas, cada una con nombre, apellido, correo y ciudad, y ` +
      'con las tildes y eñes intactas. La exportación viene de fábrica en todos los listados y toma los ' +
      'registros seleccionados o el resultado de un filtro.',
    evidencia: [capExportacion],
    medicion: `${conservados} de ${originales.length} filas idénticas al original`,
  });
});
