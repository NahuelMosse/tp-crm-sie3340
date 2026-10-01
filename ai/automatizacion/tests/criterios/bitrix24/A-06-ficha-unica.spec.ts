import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { citar } from '../../fuentes';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { menuLateral, pestana, panel, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, altaDeNegociacion, crearCampo, elegirEnLista, escribirEn, guardarFormulario, negociaciones, borrarNegociaciones } from '../../bitrix24/ui';
import {
  altaDeContacto, llenarContacto, guardarContacto, contactos, borrarContactos, abrirContacto, registrarActividad, campoDeContacto, quitarCampoDeContacto, irAContactos, crearCampoDeLista,
} from '../../bitrix24/actividades';

/**
 * A.6 — Ficha única del asegurado, sobre Bitrix24
 *
 * El asegurado es un contacto del CRM; la póliza y el reclamo, a falta de
 * entidades propias en la edición gratuita, son negociaciones con ese contacto
 * como cliente.
 */

test.describe.configure({ mode: 'default' });


/** Carga una negociación desde el formulario, con el contacto como cliente. */
async function negociacionDe(page: any, titulo: string, contacto: string) {
  await altaDeNegociacion(page).catch(async () => { await cerrarPaneles(page); await altaDeNegociacion(page); });
  const f = panel(page);
  await f.locator('input[name="TITLE"]').fill(titulo);
  const cliente = f.getByPlaceholder(/Nombre de contacto/).first();
  await cliente.click();
  await cliente.pressSequentially(contacto, { delay: 60 });
  await page.waitForTimeout(3000);
  await f.getByText(new RegExp(contacto)).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await guardarFormulario(page);
  await cerrarPaneles(page);
}

// ── A.6.1 ────────────────────────────────────────────────────────────────────
test('A.6.1 — Vinculación de la póliza con su titular', async ({ page }, info) => {
  // «Relacionar la póliza con un contacto, abrir la ficha del contacto y comprobar que la póliza figura allí;
  //  abrir la póliza y comprobar que muestra al titular»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-FICHA-/);
  await borrarContactos(page, /^ACT-FICHA-/);

  await altaDeContacto(page);
  await llenarContacto(page, 'ACT-FICHA-Titular', 'Asegurado');
  await guardarContacto(page);
  await cerrarPaneles(page);
  await negociacionDe(page, 'ACT-FICHA-POL-1', 'ACT-FICHA-Titular');

  // Ficha del contacto: la póliza figura en su pestaña de negociaciones
  await abrirContacto(page, 'ACT-FICHA-Titular');
  await panel(page).getByText('Negociaciones', { exact: true }).filter({ visible: true }).first().click({ force: true });
  await page.waitForTimeout(5000);
  const capContacto = await capturar(page, 'A.6.1', plataforma, '1-ficha-del-contacto');
  const enContacto = /ACT-FICHA-POL-1/.test(await textoDe(page));
  await cerrarPaneles(page);

  // Ficha de la póliza: muestra al titular
  await menuLateral(page, 'CRM');
  await page.locator('a').filter({ hasText: /^ACT-FICHA-POL-1$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
  const capPoliza = await capturar(page, 'A.6.1', plataforma, '2-ficha-de-la-poliza');
  const enPoliza = /ACT-FICHA-Titular/.test(await textoDe(page));
  await cerrarPaneles(page);
  console.log(`    póliza en la ficha del contacto: ${enContacto} · titular en la póliza: ${enPoliza}`);

  await borrarNegociaciones(page, /^ACT-FICHA-/);
  await borrarContactos(page, /^ACT-FICHA-/);

  expect(enContacto, 'la póliza debe figurar en la ficha del contacto').toBeTruthy();
  expect(enPoliza, 'la póliza debe mostrar a su titular').toBeTruthy();

  registrar({
    criterio: 'A.6.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'La negociación —que hace de póliza en la edición gratuita— trae de fábrica el campo «Cliente», donde se ' +
      'elige el contacto por su nombre. Una vez guardada, la póliza figura en la pestaña «Negociaciones» de la ' +
      'ficha del contacto y su propia ficha muestra al titular, sin configurar nada: la relación se ve desde los ' +
      'dos lados.',
    evidencia: [capContacto, capPoliza],
  });
});

// ── A.6.2 ────────────────────────────────────────────────────────────────────
test('A.6.2 — Vista única del asegurado', async ({ page }, info) => {
  // «Abrir la ficha de un asegurado y comprobar si desde allí se llega a todo lo suyo —pólizas, actividad y
  //  reclamos— sin buscarlo en otro menú»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-VISTA-/);
  await borrarContactos(page, /^ACT-VISTA-/);

  await altaDeContacto(page);
  await llenarContacto(page, 'ACT-VISTA-Asegurado', 'Completo');
  await guardarContacto(page);
  await registrarActividad(page, 'Llamada de seguimiento por la renovación');
  await cerrarPaneles(page);
  await negociacionDe(page, 'ACT-VISTA-POL-1', 'ACT-VISTA-Asegurado');
  await negociacionDe(page, 'ACT-VISTA-RECLAMO-1', 'ACT-VISTA-Asegurado');

  await abrirContacto(page, 'ACT-VISTA-Asegurado');
  await page.waitForTimeout(3000);
  const capActividad = await capturar(page, 'A.6.2', plataforma, '1-actividad');
  const enLinea = /Llamada de seguimiento por la renovación/.test(await textoDe(page));
  await panel(page).getByText('Negociaciones', { exact: true }).filter({ visible: true }).first().click({ force: true });
  await page.waitForTimeout(5000);
  const capNegociaciones = await capturar(page, 'A.6.2', plataforma, '2-negociaciones');
  const texto = await textoDe(page);
  const conPoliza = /ACT-VISTA-POL-1/.test(texto);
  const conReclamo = /ACT-VISTA-RECLAMO-1/.test(texto);
  console.log(`    actividad: ${enLinea} · póliza: ${conPoliza} · reclamo: ${conReclamo}`);
  await cerrarPaneles(page);

  await borrarNegociaciones(page, /^ACT-VISTA-/);
  await borrarContactos(page, /^ACT-VISTA-/);

  expect(enLinea, 'la actividad debe verse en la línea de tiempo de la ficha').toBeTruthy();
  expect(conPoliza && conReclamo, 'la póliza y el reclamo deben figurar en la ficha').toBeTruthy();

  registrar({
    criterio: 'A.6.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La ficha del contacto reúne en una sola pantalla lo del asegurado: la línea de tiempo con sus actividades ' +
      'registradas y, en la pestaña «Negociaciones», tanto la póliza como el reclamo, que en la edición gratuita ' +
      'son negociaciones con el contacto como cliente. No hace falta salir a otro menú ni buscarlo de nuevo. ' +
      'Como póliza y reclamo comparten esa pestaña, el usuario los distingue por el nombre que se les da al ' +
      'cargarlos: es una convención que hay que fijar una vez.',
    evidencia: [capActividad, capNegociaciones],
  });
});

// ── A.6.3 ────────────────────────────────────────────────────────────────────
test('A.6.3 — Campos propios del rubro en la ficha', async ({ page }, info) => {
  // «Agregar a la ficha del asegurado un campo que el producto no trae —la valoración que dejó sobre la atención
  //  recibida— y comprobar que queda disponible en el alta y en la búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await quitarCampoDeContacto(page, 'Valoración de la atención');
  await borrarContactos(page, /^ACT-CAMPO-/);

  await altaDeContacto(page);
  await llenarContacto(page, 'ACT-CAMPO-Asegurado', 'Valoracion');
  await crearCampoDeLista(page, 'Valoración de la atención', ['Excelente', 'Buena', 'Regular', 'Mala']);
  const capCampo = await capturar(page, 'A.6.3', plataforma, '1-campo-creado');
  await elegirEnLista(page, 'Valoración de la atención', 'Buena');
  await guardarContacto(page);
  await cerrarPaneles(page);

  const campo = await campoDeContacto(page, 'Valoración de la atención');
  const [contacto] = await contactos(page, /^ACT-CAMPO-/, ['ID', 'NAME', 'LAST_NAME', campo?.FIELD_NAME ?? 'UF_*']);
  const valor = campo?.LIST?.find((l: any) => String(l.ID) === String(contacto?.[campo.FIELD_NAME]))?.VALUE;
  console.log(`    campo ${campo?.FIELD_NAME} · tipo ${campo?.USER_TYPE_ID} · valor guardado: ${valor}`);

  // Búsqueda: el filtro del listado ofrece el campo nuevo
  await irAContactos(page);
  await page.locator('input.main-ui-filter-search-filter').first().click();
  await page.waitForTimeout(2500);
  await page.getByText('Agregar campo', { exact: false }).filter({ visible: true }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(2000);
  const capFiltro = await capturar(page, 'A.6.3', plataforma, '2-filtro');
  const enFiltro = /Valoración de la atención/.test(await textoDe(page));
  console.log(`    el filtro ofrece el campo: ${enFiltro}`);
  await page.keyboard.press('Escape');

  await quitarCampoDeContacto(page, 'Valoración de la atención');
  await borrarContactos(page, /^ACT-CAMPO-/);

  expect(campo?.USER_TYPE_ID, 'debe ser un campo de lista').toBe('enumeration');
  expect(valor, 'el valor elegido en el alta debe quedar guardado').toBe('Buena');
  expect(enFiltro, 'el filtro del listado debe ofrecer el campo nuevo').toBeTruthy();

  registrar({
    criterio: 'A.6.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Desde el mismo formulario del contacto, «Crear campo» agrega un campo de tipo lista —aquí, la valoración de ' +
      'la atención, con sus cuatro opciones— sin programar. El campo queda en el formulario de alta: se eligió el ' +
      'valor «Buena» al cargar un asegurado y quedó guardado. En el listado, el filtro de búsqueda ofrece el campo ' +
      'nuevo para agregarlo como condición. Definir el campo es una configuración de una sola vez.',
    evidencia: [capCampo, capFiltro],
  });
});

// ── A.6.4 ────────────────────────────────────────────────────────────────────
test('A.6.4 — Unicidad de la ficha del asegurado', async ({ page, browser }, info) => {
  // «Cargar dos veces un asegurado con el mismo documento y comprobar si el sistema advierte la duplicación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarContactos(page, /^ACT-DUP-/);
  const correo = 'act.dup@aseguradora-test.com';
  let capSegunda = '';

  for (const [i, nombre] of ['Uno', 'Dos'].entries()) {
    await altaDeContacto(page);
    await llenarContacto(page, `ACT-DUP-${nombre}`, 'Asegurado');
    await panel(page).locator('input[name="EMAIL[n0][VALUE]"]').fill(correo);
    await page.waitForTimeout(4000);
    const aviso = /duplic/i.test(await textoDe(page));
    console.log(`    alta ${i + 1}: aviso de duplicado en pantalla: ${aviso}`);
    if (i === 1) capSegunda = await capturar(page, 'A.6.4', plataforma, '1-segunda-alta');
    await guardarContacto(page);
    await cerrarPaneles(page);
  }
  const guardados = await contactos(page, /^ACT-DUP-/, ['ID', 'NAME']);
  console.log(`    contactos guardados con el mismo correo: ${guardados.length}`);

  // El control de duplicados del listado: «Buscar y fusionar duplicados»
  await irAContactos(page);
  await page.mouse.click(1353, 97);
  await page.waitForTimeout(1500);
  await page.locator('.menu-popup-item-text').filter({ hasText: /^Buscar y fusionar duplicados$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(10000);
  const capDuplicados = await capturar(page, 'A.6.4', plataforma, '2-buscar-duplicados');
  const herramientaPideOtroPlan = /Encontrar y combinar duplicados/.test(await textoDe(page)) &&
    /disponible en los planes de nivel superior/.test(await textoDe(page));
  console.log(`    el control de duplicados pide otro plan: ${herramientaPideOtroPlan}`);
  await borrarContactos(page, /^ACT-DUP-/);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/18346126/',
    buscar: /Automatic duplicate merging is available for leads, contacts, and companies/i,
    captura: 'A-6-4-bitrix24-3-control-de-duplicados',
  });

  expect(guardados.length, 'sin control de duplicados, el segundo alta con el mismo correo se guarda').toBe(2);
  expect(herramientaPideOtroPlan, 'la herramienta de duplicados debe pedir un plan superior').toBeTruthy();

  registrar({
    criterio: 'A.6.4',
    plataforma,
    cumple: 1,
    justificacion:
      'En la edición gratuita, cargar dos veces al mismo asegurado con el mismo correo no dispara ninguna ' +
      'advertencia: el segundo contacto se guarda igual y quedan dos fichas. La herramienta «Buscar y fusionar ' +
      'duplicados» del listado de contactos no se abre y responde que está disponible en los planes de nivel ' +
      'superior. El fabricante documenta que el producto cuenta con ese control de duplicados para prospectos, ' +
      'contactos y compañías, que detecta las fichas repetidas y las fusiona, pero no publica en qué plan se ' +
      'incluye. El asistente de importación de planillas tiene un paso «Control de duplicados» —por nombre, ' +
      'correo o teléfono—, pero su acción ante un duplicado parte de «Allow» (importar todo sin revisar) y viene ' +
      'marcada con un candado; no se logró cambiarla en la edición gratuita. Detecta la duplicación después de ' +
      'cargada, no la advierte al cargar, y hay que ejecutar el escaneo cada vez.',
    evidencia: [capSegunda, capDuplicados],
    documentacion: fuente,
  });
});
