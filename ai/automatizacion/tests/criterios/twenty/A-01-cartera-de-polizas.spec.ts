import { test, expect, Page, Browser } from '../../humano';
import { cargarCartera, reclamosConPlazo, Escenario, PRODUCTOR, RAMOS, ESTADOS } from '../../twenty/escenario';
import { nuevoFlujo, ponerDisparador, elegirAccion, elegirObjeto, elegirOpcion, abrirVariables, elegirVariable, agregarPaso, agregarPasoBajo, escribirEnPanel, filtroProximosDias, botonDelFlujo, accionEnBucle } from '../../twenty/flujos';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import {
  apiTwenty, borrarObjeto, borrarRegistro, objeto, registros, nuevoObjeto, nuevoCampo, conOpciones,
  nuevoRegistro, abrirFicha, abrirListado, quitarCampo, comoImporte, fechaEnFicha, elegirEnFicha, escribirEnFicha, campoEnFicha, clicReal, textoDe,
} from '../../twenty/ui';

/**
 * A.1 — Cartera de pólizas, sobre Twenty
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Cada test cita el procedimiento de la sección 4 y lo ejecuta
 * recorriendo la pantalla.
 *
 * El grupo corre en orden: A.1.1 crea la póliza desde cero y los siguientes le
 * agregan sus campos y la van cargando.
 */

test.describe.configure({ mode: 'serial' });


/** Con la configuración regional argentina, Twenty escribe las fechas como DD/MM/AAAA. */
const enDias = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const isoEnDias = (n: number) => new Date(Date.now() + n * 86_400_000).toLocaleDateString('sv-SE');

// ── A.1.1 ────────────────────────────────────────────────────────────────────
test('A.1.1 — Modelado de la póliza como objeto propio', async ({ page }, info) => {
  // «Crear una entidad Póliza con identidad propia y comprobar que aparece en
  //  el menú del sistema y admite registros»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Se parte de cero: la póliza de una corrida anterior se da de baja con todo lo suyo
  const api = await apiTwenty(page);
  await borrarObjeto(api, 'poliza');

  await nuevoObjeto(page, 'Póliza', 'Pólizas', 'Contrato de seguro emitido a un asegurado');
  const capModelo = await capturar(page, 'A.1.1', plataforma, '1-modelo');

  // El menú de la izquierda, recargado como lo vería el usuario al volver a entrar
  await abrirListado(page, 'companies');
  const enMenu = await page.locator('[data-testid="tooltip"]').filter({ hasText: /^Pólizas$/ }).first()
    .isVisible().catch(() => false);
  const capMenu = await capturar(page, 'A.1.1', plataforma, '2-menu');

  const id = await nuevoRegistro(page, 'polizas', 'Póliza', 'POL-MODELO-1');
  const capListado = await capturar(page, 'A.1.1', plataforma, '3-listado');
  const guardadas = await registros(api, 'polizas');

  expect(await objeto(api, 'poliza'), 'el objeto debe figurar en el modelo de datos').toBeTruthy();
  expect(enMenu, 'el objeto debe tener su entrada de menú').toBeTruthy();
  expect(guardadas.some(p => p.id === id && p.name === 'POL-MODELO-1'), 'el objeto debe admitir registros').toBeTruthy();

  registrar({
    criterio: 'A.1.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde Configuración › Modelo de datos se crea el objeto Póliza con su nombre en singular y plural, sin ' +
      'escribir código ni tocar el servidor. Queda con identidad propia: figura entre los objetos del modelo, ' +
      'aparece en el menú de la izquierda junto a los que trae el producto, tiene su listado y admite registros, ' +
      'que se cargan desde el mismo listado. Definirlo es trabajo de una sola vez.',
    evidencia: [capModelo, capMenu, capListado],
  });
});

// ── A.1.2 ────────────────────────────────────────────────────────────────────
test('A.1.2 — Campos de lista para el ramo y el estado de cobranza', async ({ page }, info) => {
  // «Agregar dos campos de lista —uno con los ramos que comercializa la
  //  compañía y otro con los estados de cobranza—, cargar una póliza de cada
  //  ramo y cambiarle el estado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  for (const c of ['Ramo', 'Estado de pago']) await quitarCampo(api, 'poliza', c);
  await nuevoCampo(page, 'polizas', 'Select', 'Ramo', conOpciones(RAMOS));
  await nuevoCampo(page, 'polizas', 'Select', 'Estado de pago', conOpciones(ESTADOS));
  const capCampos = await capturar(page, 'A.1.2', plataforma, '1-campos');

  const campos = (await objeto(api, 'poliza')).fields;
  const ramo = campos.find((c: any) => c.label === 'Ramo');
  const estado = campos.find((c: any) => c.label === 'Estado de pago');
  expect(ramo?.type, 'el ramo debe ser un campo de lista').toBe('SELECT');
  expect(estado?.type, 'el estado de pago debe ser un campo de lista').toBe('SELECT');

  // Una póliza de cada ramo, cargada por pantalla, y a cada una se le cambia el estado
  const ids: string[] = [];
  for (const [i, r] of RAMOS.entries()) {
    const id = await nuevoRegistro(page, 'polizas', 'Póliza', `POL-RAMO-${r.toUpperCase()}`);
    ids.push(id);
    await abrirFicha(page, 'poliza', id);
    await elegirEnFicha(page, ramo.name, r);
    await elegirEnFicha(page, estado.name, ESTADOS[0]);
    await elegirEnFicha(page, estado.name, ESTADOS[1 + (i % 3)]);
  }
  const capFicha = await capturar(page, 'A.1.2', plataforma, '2-ficha-con-estado-cambiado');
  await abrirListado(page, 'polizas');
  const capListado = await capturar(page, 'A.1.2', plataforma, '3-una-por-ramo');

  const guardadas = (await registros(api, 'polizas')).filter(p => ids.includes(p.id));
  const opcion = (c: any, etiqueta: string) => c.options.find((o: any) => o.label === etiqueta)?.value;
  const bienRamo = RAMOS.every((r, i) => guardadas.find(p => p.id === ids[i])?.[ramo.name] === opcion(ramo, r));
  const bienEstado = RAMOS.every((_, i) => guardadas.find(p => p.id === ids[i])?.[estado.name] === opcion(estado, ESTADOS[1 + (i % 3)]));
  expect(bienRamo, 'cada póliza debe quedar con su ramo').toBeTruthy();
  expect(bienEstado, 'cada póliza debe quedar con el estado nuevo').toBeTruthy();

  registrar({
    criterio: 'A.1.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El modelo de datos admite campos de lista con las opciones que define la compañía. Se agregaron el ramo, ' +
      'con los cuatro que comercializa, y el estado de pago, con los cuatro estados de cobranza; se cargó por ' +
      'pantalla una póliza de cada ramo y a cada una se le cambió el estado desde su ficha, eligiendo la opción ' +
      'en un desplegable con buscador. Los valores quedan guardados como opciones de la lista, no como texto ' +
      'libre. Definir los campos es trabajo de una sola vez.',
    evidencia: [capCampos, capFicha, capListado],
  });
});

// ── A.1.3 ────────────────────────────────────────────────────────────────────
test('A.1.3 — Prima con importe y moneda', async ({ page, browser }, info) => {
  // «Agregar un campo de importe con moneda y cargar una prima, comprobando
  //  que conserva los decimales y la denominación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  await quitarCampo(api, 'poliza', 'Prima');
  // Pesos argentinos, formato completo y dos decimales: es la única combinación
  // que conserva los centavos (ver comoImporte)
  await nuevoCampo(page, 'polizas', 'Currency', 'Prima', comoImporte('Argent', 'ARS', 2));
  const capConfiguracion = await capturar(page, 'A.1.3', plataforma, '1-campo-configurado');
  const prima = (await objeto(api, 'poliza')).fields.find((c: any) => c.label === 'Prima');
  expect(prima?.type, 'la prima debe ser un campo de importe').toBe('CURRENCY');

  const id = await nuevoRegistro(page, 'polizas', 'Póliza', 'POL-PRIMA-1');
  await abrirFicha(page, 'poliza', id);
  // El editor escribe los importes con el punto decimal, como los muestra
  await escribirEnFicha(page, prima.name, '45250.75');
  const capFicha = await capturar(page, 'A.1.3', plataforma, '2-prima-cargada');
  const mostrado = await campoEnFicha(page, prima.name).innerText();

  const guardada = (await registros(api, 'polizas')).find(p => p.id === id)?.[prima.name];
  const importe = guardada ? Number(guardada.amountMicros) / 1_000_000 : null;

  expect(importe, 'la prima debe conservar los decimales').toBe(45250.75);
  expect(guardada?.currencyCode, 'la prima debe conservar la moneda').toBe('ARS');

  registrar({
    criterio: 'A.1.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El modelo de datos tiene un tipo de campo de importe con moneda. Se agregó la prima en pesos argentinos ' +
      'y se cargó 45.250,75 desde la ficha: quedó guardada con los centavos y con su moneda. Para eso el campo ' +
      'se define una vez con formato completo y dos decimales. Con la definición de fábrica —formato corto, sin ' +
      'decimales— el editor descarta el separador decimal y guarda el importe multiplicado por cien sin avisar, ' +
      'un error que el fabricante tiene registrado; quien define el campo tiene que saberlo. Definirlo bien es ' +
      'trabajo de una sola vez.',
    evidencia: [capConfiguracion, capFicha],
    documentacion: await citar(browser, {
      url: 'https://github.com/twentyhq/twenty/issues/25870',
      buscar: 'rejects the typed decimal separator',
      captura: 'A-1-3-twenty-3-error-registrado',
    }),
    medicion: `guardado ${importe} ${guardada?.currencyCode}; en pantalla «${mostrado.trim()}»`,
  });
});

// ── A.1.4 ────────────────────────────────────────────────────────────────────
test('A.1.4 — Vigencia con fecha de inicio y de fin', async ({ page }, info) => {
  // «Agregar dos campos de fecha y comprobar que el sistema los trata como
  //  fechas: admite orden y comparación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  for (const c of ['Vigencia desde', 'Vigencia hasta']) await quitarCampo(api, 'poliza', c);
  await nuevoCampo(page, 'polizas', 'Date', 'Vigencia desde');
  await nuevoCampo(page, 'polizas', 'Date', 'Vigencia hasta');
  const campos = (await objeto(api, 'poliza')).fields;
  const desde = campos.find((c: any) => c.label === 'Vigencia desde');
  const hasta = campos.find((c: any) => c.label === 'Vigencia hasta');
  expect(hasta?.type, 'la vigencia debe ser un campo de fecha').toBe('DATE');
  // Las pólizas de una corrida anterior se quitan: con homónimos, la búsqueda no sabría cuál abrir
  for (const p of (await registros(api, 'polizas')).filter(p => /^POL-VENCE-(PRONTO|TARDE)$/.test(p.name))) {
    await borrarRegistro(api, 'polizas', p.id);
  }

  const pronto = await nuevoRegistro(page, 'polizas', 'Póliza', 'POL-VENCE-PRONTO');
  await abrirFicha(page, 'poliza', pronto);
  await fechaEnFicha(page, desde.name, enDias(-330));
  await fechaEnFicha(page, hasta.name, enDias(12));
  const tarde = await nuevoRegistro(page, 'polizas', 'Póliza', 'POL-VENCE-TARDE');
  await abrirFicha(page, 'poliza', tarde);
  await fechaEnFicha(page, desde.name, enDias(-10));
  await fechaEnFicha(page, hasta.name, enDias(300));

  const guardadas = await registros(api, 'polizas');
  expect(guardadas.find(p => p.id === pronto)?.[hasta.name], 'la fecha debe guardarse').toBe(isoEnDias(12));

  // Orden: el listado ordenado por vencimiento respeta el calendario
  await abrirListado(page, 'polizas');
  await clicReal(page, page.getByText(/^Ordenar$|^Sort$/).first());
  await clicReal(page, page.getByText('Vigencia hasta', { exact: true }).last());
  await page.waitForTimeout(2500);
  const filas = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const ordena = filas.indexOf(pronto) > -1 && filas.indexOf(pronto) < filas.indexOf(tarde);
  const capOrden = await capturar(page, 'A.1.4', plataforma, '1-orden-por-vencimiento');

  // Comparación: «vence en los próximos 30 días» solo se puede preguntar sobre una fecha
  await abrirListado(page, 'polizas');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Vigencia hasta', { exact: true }).last());
  await clicReal(page, page.getByText(/^Es$|^Is$/).last());
  await page.waitForTimeout(800);
  const comparaciones = (await page.locator('body *').evaluateAll(es => es
    .filter(e => e.childElementCount === 0 && (e as HTMLElement).offsetParent)
    .map(e => e.textContent!.trim())))
    .filter(t => /^(Es|Está)/.test(t));
  const capComparaciones = await capturar(page, 'A.1.4', plataforma, '2-comparaciones-de-fecha');
  await clicReal(page, page.getByText(/^Es relativo$|^Is relative$/).last());
  await clicReal(page, page.getByText(/^This$|^Este$/).last());
  await clicReal(page, page.getByText(/^Next$|^Próximo/).last());
  const cantidad = page.locator('input:visible').last();
  // El campo se vuelve a dibujar con cada tecla y pierde el cursor: después de cada dígito se vuelve a
  // hacer clic en él, al final de lo escrito
  await clicReal(page, cantidad);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  for (const digito of '30') {
    await clicReal(page, cantidad);
    await page.keyboard.press('End');
    await page.keyboard.type(digito);
    await page.waitForTimeout(600);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  const filtro = await textoDe(page);
  const proximas = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const capFiltro = await capturar(page, 'A.1.4', plataforma, '3-vencen-en-30-dias');
  expect(filtro, 'el filtro debe quedar en los próximos 30 días').toMatch(/Next 30 days|Próximos 30 días/);

  expect(ordena, 'ordenar por vencimiento debe poner primero la que vence antes').toBeTruthy();
  expect(proximas, 'la que vence en 12 días entra en los próximos 30').toContain(pronto);
  expect(proximas, 'la que vence en 300 días no entra').not.toContain(tarde);

  registrar({
    criterio: 'A.1.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El modelo de datos tiene un tipo de campo de fecha. Se agregaron el inicio y el fin de la vigencia y se ' +
      'cargaron dos pólizas desde su ficha. El sistema los trata como fechas: el listado ordenado por fin de ' +
      'vigencia pone primero la que vence antes, y el filtro sobre ese campo ofrece comparaciones propias de ' +
      'una fecha —antes, después, en el pasado, en el futuro, relativa—: «vence en los próximos 30 días» trae ' +
      'la póliza que vence en doce días y deja afuera la que vence en trescientos. Definir los campos es ' +
      'trabajo de una sola vez.',
    evidencia: [capOrden, capComparaciones, capFiltro],
    medicion: `comparaciones del filtro de fecha: ${comparaciones.join(', ')}`,
  });
});

/** La cartera se carga una vez por corrida, después de que A.1.1 a A.1.4 armaron la póliza. */
let escenario: Escenario | undefined;
async function conCartera(page: Page, navegador: Browser) {
  escenario ??= await cargarCartera(page, navegador);
  return escenario;
}

/** Abre el filtro sobre un campo y marca una opción. */
async function filtrarPor(page: Page, campo: string, opcion: string, primero: boolean) {
  await clicReal(page, primero
    ? page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first()
    : page.getByText(/^Agregar filtro$|^Add filter$/).first());
  await clicReal(page, page.getByText(campo, { exact: true }).last());
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  if (await buscar.isVisible().catch(() => false)) await buscar.pressSequentially(opcion.split(' ')[0], { delay: 60 });
  await clicReal(page, page.getByText(opcion, { exact: true }).last());
  await page.waitForTimeout(2500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

const filasVisibles = (page: Page) => page.locator('[data-testid^="row-id-"]')
  .evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')!));

// ── A.1.5 ────────────────────────────────────────────────────────────────────
test('A.1.5 — Aviso anticipado de vencimiento', async ({ page, browser }, info) => {
  // «Definir un aviso sobre las pólizas que vencen en los próximos treinta días
  //  y sobre los reclamos que alcanzan su plazo de resolución, y comprobar que
  //  el sistema los emite sin intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await conCartera(page, browser);
  await reclamosConPlazo(e);
  // Sin restos de una corrida anterior: ni el flujo ni los avisos que dejó
  for (const w of (await registros(e.api, 'workflows')).filter(w => w.name === 'Aviso de vencimiento')) {
    await borrarRegistro(e.api, 'workflows', w.id);
  }
  const tareasDeAviso = async () => (await registros(e.api, 'tasks')).filter(t => /^(POL|RCL)-/.test(t.title ?? ''));
  for (const t of await tareasDeAviso()) await borrarRegistro(e.api, 'tasks', t.id);

  // El aviso: cada minuto —en producción, una vez por día—, buscar lo que vence y
  // dejar una tarea por cada caso
  await nuevoFlujo(page, 'Aviso de vencimiento');
  await ponerDisparador(page, 'On a schedule');
  await elegirOpcion(page, 'Days', 'Minutes');

  await agregarPaso(page, 'Search Records');
  await elegirObjeto(page, 'Pólizas');
  await filtroProximosDias(page, 'Vigencia hasta', 30);
  await escribirEnPanel(page, /Introducir límite|Enter limit/, '200');
  await agregarPaso(page, 'Iterator');
  await abrirVariables(page, 'Elementos para iterar');
  await elegirVariable(page, 'All Pólizas');
  await accionEnBucle(page, 'Create Record');
  await elegirObjeto(page, 'Tasks');
  await abrirVariables(page, 'Title');
  await elegirVariable(page, 'Iterator', 'Current Item (Póliza)', 'Name');

  await agregarPasoBajo(page, 'completado', 'Search Records');
  await elegirObjeto(page, 'Reclamos');
  await filtroProximosDias(page, 'Plazo de resolución', 2);
  await escribirEnPanel(page, /Introducir límite|Enter limit/, '200');
  await agregarPaso(page, 'Iterator');
  await abrirVariables(page, 'Elementos para iterar');
  await elegirVariable(page, 'Search Records', 'All Reclamos');
  await accionEnBucle(page, 'Create Record');
  await elegirObjeto(page, 'Tasks');
  await abrirVariables(page, 'Title');
  await elegirVariable(page, 'Iterator', 'Current Item (Reclamo)', 'Name');
  await page.keyboard.press('Escape');
  const capFlujo = await capturar(page, 'A.1.5', plataforma, '1-flujo-del-aviso');

  // Lo que el aviso tiene que traer, según la cartera cargada
  const manana = new Date(Date.now() + 86_400_000).toLocaleDateString('sv-SE');
  const en30 = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString('sv-SE');
  const esperadas = [...new Set((await registros(e.api, 'polizas'))
    .filter(p => p.vigenciaHasta && p.vigenciaHasta >= manana && p.vigenciaHasta <= en30).map(p => p.name as string))].sort();

  await botonDelFlujo(page, /^Activate$|^Activar$/);
  let avisos: string[] = [];
  try {
    // Nadie toca nada: el programador del sistema lo corre en el minuto siguiente
    for (let espera = 0; espera < 16; espera++) {
      await page.waitForTimeout(15_000);
      avisos = [...new Set((await tareasDeAviso()).map(t => t.title as string))].sort();
      if (esperadas.every(n => avisos.includes(n)) && avisos.includes('RCL-PLAZO-MANANA')) break;
    }
  } finally {
    await botonDelFlujo(page, /^Deactivate$|^Desactivar$/).catch(() => {});
  }
  await abrirListado(page, 'tasks');
  const capAvisos = await capturar(page, 'A.1.5', plataforma, '2-avisos-emitidos');

  expect(esperadas.length, 'la cartera debe tener pólizas que venzan en los próximos 30 días').toBeGreaterThan(0);
  expect(avisos, 'debe haber un aviso por cada póliza que vence en los próximos 30 días').toEqual(expect.arrayContaining(esperadas));
  expect(avisos, 'debe avisar el reclamo que alcanza su plazo').toContain('RCL-PLAZO-MANANA');
  expect(avisos, 'no debe avisar el reclamo que todavía tiene tres semanas').not.toContain('RCL-PLAZO-TRES-SEMANAS');
  const deMas = avisos.filter(a => a.startsWith('POL-') && !esperadas.includes(a));
  expect(deMas, 'no debe avisar pólizas que vencen después de 30 días').toEqual([]);

  registrar({
    criterio: 'A.1.5',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Los flujos de trabajo de la edición gratuita alcanzan para el aviso, armados desde el lienzo sin escribir ' +
      'código: un disparador programado busca las pólizas cuyo fin de vigencia cae en los próximos treinta días ' +
      'y los reclamos cuyo plazo de resolución vence en los próximos dos, y por cada uno deja una tarea con su ' +
      'nombre. Se activó el flujo y, sin que nadie interviniera, en la corrida siguiente del programador ' +
      `aparecieron los ${esperadas.length} avisos de pólizas por vencer y el del reclamo que alcanza su plazo; ` +
      'no avisó las pólizas que vencen más adelante ni el reclamo que tiene tres semanas. Armar el flujo es ' +
      'trabajo de una sola vez.',
    evidencia: [capFlujo, capAvisos],
    medicion: `${avisos.length} avisos emitidos sin intervención`,
  });
});

// ── A.1.6 ────────────────────────────────────────────────────────────────────
test('A.1.6 — Consulta y filtrado de la cartera', async ({ page, browser }, info) => {
  // «Filtrar de forma combinada por ramo, por estado de cobranza y por
  //  productor responsable, y obtener el listado resultante»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const { api, productor } = await conCartera(page, browser);
  const campos = (await objeto(api, 'poliza')).fields;
  const valor = (n: string, e: string) => campos.find((c: any) => c.name === n).options.find((o: any) => o.label === e).value;
  const esperadas = (await registros(api, 'polizas'))
    .filter(p => p.ramo === valor('ramo', 'Automotor') && p.estadoDePago === valor('estadoDePago', 'Al día') && p.productorId === productor)
    .map(p => p.id);
  expect(esperadas.length, 'el escenario debe dejar al menos una póliza que cumpla las tres').toBeGreaterThan(0);

  await abrirListado(page, 'polizas');
  await filtrarPor(page, 'Ramo', 'Automotor', true);
  await filtrarPor(page, 'Estado de pago', 'Al día', false);
  await filtrarPor(page, 'Productor', `${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`, false);
  const obtenidas = await filasVisibles(page);
  const capFiltro = await capturar(page, 'A.1.6', plataforma, '1-filtros-combinados');

  expect(obtenidas.sort(), 'el listado debe traer exactamente las pólizas que cumplen las tres condiciones').toEqual(esperadas.sort());

  registrar({
    criterio: 'A.1.6',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El listado de pólizas combina filtros sobre cualquier campo: se filtró por ramo, por estado de pago y ' +
      `por productor responsable, y el resultado trajo exactamente las ${esperadas.length} pólizas de la cartera ` +
      'que cumplen las tres condiciones. La combinación se puede guardar como una vista con nombre. El ' +
      'productor responsable es un campo de relación con los usuarios que se agrega al modelo una vez: la ' +
      'póliza, como objeto propio, no lo trae.',
    evidencia: [capFiltro],
    medicion: `${esperadas.length} pólizas con ramo Automotor, estado Al día y productor ${PRODUCTOR.nombre} ${PRODUCTOR.apellido}`,
  });
});

// ── A.1.7 ────────────────────────────────────────────────────────────────────
test('A.1.7 — Operación masiva sobre la cartera', async ({ page, browser }, info) => {
  // «Seleccionar varias pólizas del listado y modificar un campo en todas con
  //  una sola acción»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const { api } = await conCartera(page, browser);

  await abrirListado(page, 'polizas');
  await filtrarPor(page, 'Ramo', 'Hogar', true);
  const elegidas = await filasVisibles(page);
  await clicReal(page, page.getByRole('checkbox', { name: /Seleccionar todas las filas|Select all/ }).first());
  await page.waitForTimeout(1000);
  const capSeleccion = await capturar(page, 'A.1.7', plataforma, '1-seleccion');

  await clicReal(page, page.getByRole('button', { name: /^Update|^Actualizar/ }).first());
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(/^No Estado de pago$/).first());
  await clicReal(page, page.getByText('En gestión', { exact: true }).last());
  const capAccion = await capturar(page, 'A.1.7', plataforma, '2-actualizar-registros');
  await clicReal(page, page.getByRole('button', { name: /^Aplicar|^Apply/ }).last());
  // El sistema pide confirmación: el cambio masivo no se puede deshacer
  const confirmar = page.getByText(/Esto modificará|This will update/).first()
    .locator('xpath=ancestor::div[.//*[normalize-space(text())="Actualizar registros" or normalize-space(text())="Update records"]][1]')
    .getByText(/^Actualizar registros$|^Update records$/).last();
  const capConfirmacion = await confirmar.waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => capturar(page, 'A.1.7', plataforma, '3-confirmacion'));
  await clicReal(page, confirmar);
  await page.waitForTimeout(5000);

  const campos = (await objeto(api, 'poliza')).fields;
  const enGestion = campos.find((c: any) => c.name === 'estadoDePago').options.find((o: any) => o.label === 'En gestión').value;
  const cambiadas = (await registros(api, 'polizas')).filter(p => elegidas.includes(p.id) && p.estadoDePago === enGestion).length;
  const capResultado = await capturar(page, 'A.1.7', plataforma, '4-resultado');

  expect(elegidas.length, 'la selección debe abarcar varias pólizas').toBeGreaterThan(1);
  expect(cambiadas, 'todas las seleccionadas deben quedar con el nuevo estado').toBe(elegidas.length);

  registrar({
    criterio: 'A.1.7',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      `Se seleccionaron las ${elegidas.length} pólizas del ramo Hogar desde el listado y, con la selección hecha, ` +
      'la acción de actualizar abre un panel con los campos de la póliza: se eligió el estado de pago nuevo y se ' +
      'aplicó a todas de una vez, tras una confirmación que advierte que el cambio no se puede deshacer. Las ' +
      'seleccionadas quedaron con el estado nuevo. Viene listo: no hay nada que configurar.',
    evidencia: [capSeleccion, capAccion, capConfirmacion, capResultado],
    medicion: `${cambiadas} de ${elegidas.length} pólizas actualizadas con una sola acción`,
  });
});
