import type { Page } from '@playwright/test';
import { test, expect, escribirDireccion } from '../../humano';
import { registrar, sinVerificar } from '../../evaluar';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, BITRIX24_STANDARD, conPlanDe, constanciaDe } from '../../precios';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { panel, cerrarPaneles, panelesAbiertos, menuLateral, pestana } from '../../bitrix24/navegar';
import {
  rest, BASE, altaDeNegociacion, elegirEnLista, guardarFormulario, campoDeNegociacion, borrarNegociaciones,
} from '../../bitrix24/ui';
import { abrirMenuDelListado, elegirEnMenuDelListado, irAContactos, borrarContactos } from '../../bitrix24/actividades';
import { productor, entrarComoProductor } from '../../bitrix24/escenario';

/**
 * A.9 — Acceso y trazabilidad, sobre Bitrix24
 */

test.describe.configure({ mode: 'default' });

/** El texto de la página y de todos sus marcos, en una sola línea. */
const todoElTexto = async (page: any) =>
  (await Promise.all(page.frames().map((f: any) => f.locator('body').innerText().catch(() => '')))).join(' ').replace(/\s+/g, ' ');

// ── A.9.1 ────────────────────────────────────────────────────────────────────

/** Abre «Permisos de acceso al CRM», desde CRM › Más › Configuraciones, y devuelve el marco del editor. */
async function abrirPermisosDelCrm(page: Page) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Configuraciones', 'Permisos de acceso al CRM');
  const f = panel(page);
  await f.locator('.ui-access-rights-v2-header-role-cell').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(2500);
  // El globo de bienvenida tapa la columna de roles
  await f.locator('.ui-tour-popup-close, .popup-window-close-icon').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(800);
  return f;
}

/** Las columnas de roles del editor, con su nombre. */
const rolesDelEditor = (page: Page) => panel(page).locator('.ui-access-rights-v2-header-role-cell');

/**
 * Pone «Solo sus propios elementos» en una acción de la columna del rol nuevo. `seccion` es la posición de la
 * herramienta en el editor (0 Contacto, 3 Negociación): cada una repite las acciones Leer, Agregar, Editar y Eliminar.
 */
async function limitarALoPropio(page: Page, seccion: number, accion: string) {
  const f = panel(page);
  const etiqueta = f.getByText(accion, { exact: true }).nth(seccion);
  await etiqueta.scrollIntoViewIfNeeded();
  const fila = await etiqueta.boundingBox();
  const col = await rolesDelEditor(page).last().boundingBox();
  await page.mouse.click(col!.x + col!.width / 2, fila!.y + fila!.height / 2);
  await f.getByText('Solo sus propios elementos', { exact: true }).last().waitFor({ state: 'visible', timeout: 10_000 });
  await f.getByText('Solo sus propios elementos', { exact: true }).last().click();
  await f.getByText('Aplicar', { exact: true }).click();
  await page.waitForTimeout(800);
}

/** Cierra el editor sin guardar: la cruz del aviso de plan si lo hay, «Cancelar» y el panel. */
async function cerrarEditor(page: Page, conAviso: boolean) {
  page.on('dialog', d => d.accept().catch(() => {}));
  if (conAviso) { await page.mouse.click(650, 50); await page.waitForTimeout(1500); }
  await panel(page).getByText('Cancelar', { exact: true }).filter({ visible: true }).first().click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await cerrarPaneles(page).catch(() => {});
  if (await panelesAbiertos(page)) {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }
}

/** Quita el rol «Productor» del editor, con su menú, y guarda. */
async function quitarRolProductor(page: Page) {
  const f = await abrirPermisosDelCrm(page);
  const columna = rolesDelEditor(page).filter({ hasText: /^Productor$/ });
  if (!(await columna.count())) { await cerrarPaneles(page); return; }
  await columna.first().scrollIntoViewIfNeeded();
  await columna.first().locator('.ui-access-rights-v2-icon-more').click();
  await f.getByText(/^Elimina el rol y todos/).click();
  await page.waitForTimeout(1500);
  // Si el sistema pide confirmar, se acepta
  const confirmar = f.getByText(/^\s*(Eliminar|Sí|Aceptar)\s*$/i).filter({ visible: true }).last();
  if (await confirmar.isVisible().catch(() => false) && (await rolesDelEditor(page).filter({ hasText: /^Productor$/ }).count())) await confirmar.click().catch(() => {});
  await page.waitForTimeout(1000);
  await f.getByText('Guardar', { exact: true }).click();
  await page.waitForTimeout(6000);
  await cerrarPaneles(page);
}

test('A.9.1 — Restricción de la cartera por productor', async ({ page, browser }, info) => {
  // «Crear un usuario con acceso restringido e intentar abrir un registro ajeno, incluso por dirección directa»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_200_000);

  await entrar(page, plataforma);
  const gomez = await productor(page, 'gomez', 'Gómez', 'Productor');
  await borrarContactos(page, /^ACT-(AJENO|PROPIO)-/);

  let contexto: Awaited<ReturnType<typeof entrarComoProductor>>['contexto'] | undefined;
  try {
    // Preparación: un asegurado del administrador y otro del productor
    const idAjeno = await rest<number>(page, 'crm.contact.add', { fields: { NAME: 'ACT-AJENO-Cliente', LAST_NAME: 'Reservado', ASSIGNED_BY_ID: 1 } });
    await rest<number>(page, 'crm.contact.add', { fields: { NAME: 'ACT-PROPIO-Cliente', LAST_NAME: 'Asignado', ASSIGNED_BY_ID: gomez.id } });

    // 1) El administrador crea el rol «Productor» limitado a lo propio y se lo asigna al productor
    await quitarRolProductor(page);
    const f = await abrirPermisosDelCrm(page);
    await f.locator('.ui-access-rights-v2-header-role-add').scrollIntoViewIfNeeded();
    await f.locator('.ui-access-rights-v2-header-role-add').click();
    const nombre = f.locator('.ui-access-rights-v2-role-input');
    await nombre.waitFor({ state: 'visible', timeout: 10_000 });
    await nombre.fill('Productor');
    await nombre.press('Enter');
    await page.waitForTimeout(1000);
    for (const seccion of [0, 3]) {
      for (const accion of ['Leer', 'Agregar', 'Editar', 'Eliminar']) await limitarALoPropio(page, seccion, accion);
    }
    await f.getByText('Leer', { exact: true }).first().scrollIntoViewIfNeeded();
    const capContactos = await capturar(page, 'A.9.1', plataforma, '1-rol-productor-contactos');
    await f.getByText('Leer', { exact: true }).nth(3).scrollIntoViewIfNeeded();
    const capNegociaciones = await capturar(page, 'A.9.1', plataforma, '2-rol-productor-negociaciones');
    // Asignación al productor
    await f.getByText('Leer', { exact: true }).first().scrollIntoViewIfNeeded();
    await rolesDelEditor(page).last().locator('.ui-access-rights-v2-members-item-add').click();
    await page.waitForTimeout(2000);
    await page.keyboard.type('Gómez', { delay: 90 });
    await f.getByText(/^Gómez/).filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 15_000 });
    await f.getByText(/^Gómez/).filter({ visible: true }).first().click();
    await page.waitForTimeout(1500);
    const capAsignado = await capturar(page, 'A.9.1', plataforma, '3-rol-asignado');

    // 2) Guardar: el muro de pago, si lo hay, aparece al completar la operación
    await f.getByText('Guardar', { exact: true }).click();
    await page.waitForTimeout(8000);
    const tras = await todoElTexto(page);
    // El muro es la pantalla de oferta que el sistema abre dentro del editor al intentar guardar
    const muro = /Permisos de acceso basados en roles/.test(tras) && /Actualice a uno de los planes de nivel superior/.test(tras);
    const avisoDePlan = muro ? (tras.match(/En su plan actual, todos los empleados[^.]*\.[^.]*\./)?.[0] ?? '').replace(/\s+/g, ' ') : '';
    const capGuardar = await capturar(page, 'A.9.1', plataforma, '4-al-guardar');
    console.log(`    aviso de plan al guardar: ${avisoDePlan || 'ninguno'}`);
    await cerrarEditor(page, muro);

    // ¿Quedó guardado? Se vuelve a abrir el editor
    const f2 = await abrirPermisosDelCrm(page);
    const nombres = await rolesDelEditor(page).allInnerTexts();
    const guardado = nombres.some(n => /^Productor$/.test(n.trim()));
    let restringido = false;
    if (guardado) {
      await rolesDelEditor(page).filter({ hasText: /^Productor$/ }).first().scrollIntoViewIfNeeded();
      restringido = await f2.getByText('Solo sus propios elementos', { exact: true }).count() > 0;
    }
    const capReabierto = await capturar(page, 'A.9.1', plataforma, '5-rol-tras-guardar');
    console.log(`    roles tras guardar: ${nombres.map(n => n.replace(/\s+/g, ' ').trim()).join(' | ')} · rol guardado: ${guardado}`);
    await cerrarPaneles(page);

    // 3) El productor, por pantalla
    const sesion = await entrarComoProductor(browser, gomez);
    contexto = sesion.contexto;
    const pagina = sesion.pagina;
    await irAContactos(pagina).catch(() => {});
    await pagina.waitForTimeout(6000);
    const texto = await todoElTexto(pagina);
    const capLista = await capturar(pagina, 'A.9.1', plataforma, '6-lista-del-productor');
    const veElPropio = /ACT-PROPIO-Cliente/.test(texto);
    const veElAjeno = /ACT-AJENO-Cliente/.test(texto);

    await escribirDireccion(pagina, `${BASE}/crm/contact/details/${idAjeno}/`);
    await pagina.waitForTimeout(10000);
    const enFicha = await todoElTexto(pagina);
    const capDirecta = await capturar(pagina, 'A.9.1', plataforma, '7-direccion-directa');
    const abreElAjeno = /ACT-AJENO-Cliente/.test(enFicha);
    const respuesta = (enFicha.match(/(acceso denegado|no tiene permiso|no se encontr[óo]|no existe|access denied|not found)[^.]{0,80}/i)?.[0] ?? '').trim();
    console.log(`    ve el propio: ${veElPropio} · ve el ajeno: ${veElAjeno} · abre el ajeno por dirección: ${abreElAjeno} · respuesta: «${respuesta}»`);

    const evidencia = [capContactos, capNegociaciones, capAsignado, capGuardar, capReabierto, capLista, capDirecta];
    if (guardado && restringido && veElPropio && !veElAjeno && !abreElAjeno) {
      registrar({
        criterio: 'A.9.1',
        plataforma,
        cumple: 2,
        costo: 1,
        justificacion:
          'En la edición gratuita, desde CRM › Más › Configuraciones › «Permisos de acceso al CRM», se creó el rol ' +
          '«Productor» con leer, agregar, editar y eliminar limitados a «Solo sus propios elementos» en contactos y ' +
          'negociaciones, y se lo asignó al productor: el sistema lo guardó sin pedir ningún plan. Con la sesión del ' +
          'productor, el listado de contactos muestra el asegurado que tiene asignado y no el de otro responsable, y al escribir ' +
          `en el navegador la dirección de la ficha ajena el sistema no la muestra${respuesta ? ` («${respuesta}»)` : ''}. ` +
          'Es configuración de una sola vez.',
        evidencia,
      });
    } else if (!guardado && muro) {
      const fuentes = [
        await citar(browser, {
          url: 'https://helpdesk.bitrix24.com/open/25911175/',
          buscar: /Role-based access permissions in CRM are not available on all plans/i,
          captura: 'A-9-1-bitrix24-8-permisos-por-rol-segun-plan',
        }),
        await citar(browser, {
          url: 'https://www.bitrix24.es/prices/compare_cloud_plans.php',
          buscar: 'Permisos de acceso CRM',
          captura: 'A-9-1-bitrix24-9-comparacion-de-planes',
        }),
        ...await constanciaDe(browser, BITRIX24_BASIC, 'A-9-1-bitrix24-basic'),
      ];
      registrar({
        criterio: 'A.9.1',
        plataforma,
        cumple: 0,
        justificacion:
          'En la edición gratuita no se puede crear la restricción por productor: desde CRM › Más › Configuraciones › ' +
          '«Permisos de acceso al CRM» el editor deja armar el rol «Productor» con leer, agregar, editar y eliminar ' +
          'limitados a «Solo sus propios elementos» en contactos y negociaciones y asignárselo al productor, pero al ' +
          'guardar el sistema abre una pantalla de oferta —«En su plan actual, todos los empleados tienen los mismos ' +
          'permisos de acceso. Actualice a uno de los planes de nivel superior para asignar roles a los empleados»— y ' +
          `el rol no queda creado. Con la sesión del productor, sin rol propio, ${veElAjeno ? 'el asegurado ajeno figura en su listado' : 'el asegurado ajeno no figura en su listado'} ` +
          `y ${abreElAjeno ? 'se abre' : 'no se abre'} al escribir la dirección de su ficha${respuesta ? ` («${respuesta}»)` : ''}: ` +
          'todos los empleados comparten el mismo permiso, y no se puede distinguir a un productor de un supervisor ni ' +
          'ajustar el acceso de ninguno. El fabricante confirma que los permisos por rol del CRM no están en todos los ' +
          'planes, y su comparación de planes los publica desde el plan Basic.',
        conPlan: [conPlanDe(BITRIX24_BASIC, {
          cumple: 2,
          costo: 1,
          justificacion:
            'Los permisos de acceso del CRM por rol se incluyen desde el plan Basic, y el editor de roles permite limitar ' +
            'a cada productor a sus propios elementos con una configuración de una sola vez. No se contrató el plan: el ' +
            'editor es el mismo que se recorrió en la edición gratuita, que solo frena al guardar.',
        })],
        evidencia,
        documentacion: fuentes,
      });
    } else if (!guardado) {
      throw new Error('El rol no quedó guardado y no apareció el aviso de plan esperado: revisar la captura «al guardar».');
    } else {
      registrar({
        criterio: 'A.9.1',
        plataforma,
        cumple: 0,
        justificacion:
          'El rol «Productor», limitado a «Solo sus propios elementos» en contactos y negociaciones, se guardó en la edición ' +
          'gratuita, pero la restricción no se aplica: con la sesión del productor el asegurado ajeno ' +
          `${veElAjeno ? 'figura en su listado' : 'no figura en su listado'} y ` +
          `${abreElAjeno ? 'se abre al escribir la dirección de su ficha' : 'no se abre por dirección directa'}` +
          `${veElPropio ? '' : '; tampoco ve el suyo'}.`,
        evidencia,
      });
    }
  } finally {
    await contexto?.close().catch(() => {});
    await quitarRolProductor(page).catch(e => console.log(`    no se pudo quitar el rol: ${e}`));
    await borrarContactos(page, /^ACT-(AJENO|PROPIO)-/).catch(() => {});
  }
});

// ── A.9.2 ────────────────────────────────────────────────────────────────────
test('A.9.2 — Autenticación de los usuarios bajo control de la compañía', async ({ page, browser }, info) => {
  // «Revisar qué exige el sistema para validar la identidad: política de contraseñas, segundo factor y acceso
  //  unificado con el directorio de la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  // Ajustes de Bitrix24 › Seguridad, desde el menú «Configuración» de la izquierda
  await page.locator('nav[aria-label="Menú principal"] *').filter({ hasText: /^\s*Configuración\s*$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
  await page.locator('.menu-popup-item-text').filter({ hasText: /^Ajustes de Bitrix24$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(9000);
  const ajustes = page.frames().find(f => f.url().includes('/settings/configs/') && f !== page.mainFrame()) ?? page.mainFrame();
  await ajustes.getByText('Seguridad', { exact: true }).first().click({ force: true });
  await page.waitForTimeout(6000);
  const capSeguridad = await capturar(page, 'A.9.2', plataforma, '1-seguridad');
  const texto = await todoElTexto(page);
  const conSegundoFactor = /Autenticación de dos factores/.test(texto) && /Habilitar para todos los usuarios/.test(texto);
  const conPoliticaDeClaves = /política de contraseñas|longitud mínima|complejidad de la contraseña/i.test(texto);
  console.log(`    segundo factor: ${conSegundoFactor} · política de contraseñas en la pantalla: ${conPoliticaDeClaves}`);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/24571280/',
    buscar: /Single Sign-On \(SSO\) is available on Bitrix24 Enterprise plans/i,
    captura: 'A-9-2-bitrix24-2-sso',
  });

  expect(conSegundoFactor, 'la pantalla de seguridad debe ofrecer la autenticación de dos factores').toBeTruthy();
  expect(conPoliticaDeClaves, 'no se espera una política de contraseñas configurable en esa pantalla').toBeFalsy();

  registrar({
    criterio: 'A.9.2',
    plataforma,
    cumple: 1,
    justificacion:
      'Los ajustes de seguridad del portal ofrecen la autenticación de dos factores, que el administrador puede ' +
      'volver obligatoria para todos los empleados con un plazo para habilitarla, y una confirmación adicional ' +
      'del inicio de sesión en el dispositivo de confianza. La pantalla no ofrece ninguna política de contraseñas ' +
      'configurable —longitud, complejidad, vencimiento—. El acceso unificado con el directorio de la compañía ' +
      'existe como inicio de sesión único (SSO) con Microsoft Azure Active Directory, pero el fabricante lo limita ' +
      'a los planes Enterprise: en la edición gratuita no está.',
    evidencia: [capSeguridad],
    documentacion: fuente,
  });
});

// ── A.9.3 ────────────────────────────────────────────────────────────────────
test('A.9.3 — Registro de quién modificó cada dato', async ({ page, browser }, info) => {
  // «Cambiar el ramo de una póliza vigente con un usuario y buscar desde otro la constancia del cambio: valor
  //  anterior, autor y momento»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  await borrarNegociaciones(page, /^ACT-AUD-/);
  const ramo = await campoDeNegociacion(page, 'Ramo');
  if (!ramo) {
    sinVerificar('A.9.3', plataforma, 'El campo «Ramo» de la póliza, creado por otra prueba, no existe en el portal: falta volver a crearlo para cambiarlo y buscar la constancia.');
    return;
  }

  await altaDeNegociacion(page);
  await panel(page).locator('input[name="TITLE"]').fill('ACT-AUD-POL-1');
  await elegirEnLista(page, 'Ramo', 'Hogar');
  await guardarFormulario(page);
  // El cambio: desde la ficha, el ramo pasa de Hogar a Vida
  await panel(page).getByText('Ramo', { exact: true }).first().locator('xpath=following::*[normalize-space(text())="Hogar"][1]').click();
  await page.waitForTimeout(1500);
  await elegirEnLista(page, 'Ramo', 'Vida');
  await guardarFormulario(page);
  await page.waitForTimeout(3000);
  const capLinea = await capturar(page, 'A.9.3', plataforma, '1-linea-de-tiempo');
  const enLinea = await todoElTexto(page);


  // La pestaña «Historial» concentra el registro de cambios: se abre para saber si la edición gratuita la ofrece
  await panel(page).getByText('Historial', { exact: true }).filter({ visible: true }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(6000);
  const capHistorial = await capturar(page, 'A.9.3', plataforma, '2-historial');
  const textoHistorial = await todoElTexto(page);
  let muro = '';
  for (const fr of page.frames()) if (/limit_crm_history_view/.test(fr.url())) muro += ' ' + (await fr.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
  const historialPideOtroPlan = /El historial en CRM registra detalladamente cada actividad/.test(muro) &&
    /disponible solo en los planes Standard, Professional y Enterprise/.test(muro);
  const linea = enLinea.slice(enLinea.indexOf('Hoy'));
  const sinConstanciaEnLinea = /Negociación creada/.test(linea) && !/Hogar/.test(linea);
  console.log(`    sin constancia en la línea de tiempo: ${sinConstanciaEnLinea} · el historial pide otro plan: ${historialPideOtroPlan}`);
  await cerrarPaneles(page);
  await borrarNegociaciones(page, /^ACT-AUD-/);

  const fuente = await citar(browser, {
    url: 'https://helpdesk.bitrix24.com/open/25803275/',
    buscar: /CRM history logs key changes to CRM items/i,
    captura: 'A-9-3-bitrix24-3-historial-en-crm',
  });
  const precio = await constanciaDe(browser, BITRIX24_STANDARD, 'A-9-3-bitrix24-standard');

  expect(sinConstanciaEnLinea, 'la línea de tiempo de la edición gratuita no registra el cambio de ramo').toBeTruthy();
  expect(historialPideOtroPlan, 'la pestaña Historial debe pedir un plan superior').toBeTruthy();

  registrar({
    criterio: 'A.9.3',
    plataforma,
    cumple: 0,
    justificacion:
      'Se cambió el ramo de una póliza de Hogar a Vida desde su ficha y el cambio quedó guardado, pero no dejó ' +
      'ninguna constancia: la línea de tiempo de la edición gratuita solo muestra la creación de la negociación ' +
      '—y los cambios de etapa—, sin el valor anterior, el autor ni el momento del cambio de un campo. La pestaña ' +
      '«Historial», que sí registra quién hizo cada acción y cuándo, no se abre: el sistema informa que el ' +
      'historial en CRM está disponible solo en los planes Standard, Professional y Enterprise.',
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 0,
      justificacion:
        'El historial en CRM, que el fabricante describe como un registro detallado de cada actividad de los ' +
        'usuarios con quién la realizó y en qué momento, se habilita desde el plan Standard. No se contrató el ' +
        'plan, así que no se comprobó que el cambio de ramo muestre el valor anterior.',
    })],
    evidencia: [capLinea, capHistorial],
    documentacion: [fuente, ...precio],
  });
});
