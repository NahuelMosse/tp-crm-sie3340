import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { BITRIX24_BASIC, BITRIX24_STANDARD, constanciaDe, conPlanDe } from '../../precios';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from '../../bitrix24/navegar';
import { textoDe, rest, altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones, escribirEn, campoDeNegociacion } from '../../bitrix24/ui';
import {
  altaDeContacto, borrarContactosDePrueba, contactosDePrueba, campoDeContacto, quitarCampoDeContacto, crearCampoPropio,
  abrirFiltro, cerrarFiltro, restaurarFiltro, mostrarColumnas, ordenarPor, buscarConFiltro, filtrarLista, filtrarFecha,
  agregarCamposAlFiltro, asegurarCampos, isoEnDias, reiniciarFiltro, abrirListado, filasDelListado, idDeOpcion, elegirEnListaDeContacto, abrirContactos, abrirContacto, contactoDePrueba,
} from '../../bitrix24/negociaciones';

/**
 * A.2 — Captación y proceso de venta, sobre Bitrix24
 *
 * La edición gratuita no incluye prospectos —el módulo del que se convierte un
 * interesado en oportunidad—: el solicitante se lleva como un contacto, y la
 * venta se sigue en las negociaciones.
 */

test.describe.configure({ mode: 'serial' });

const MURO = /Actualice a uno de los planes|PRUÉBELO GRATUITAMENTE POR 15 DÍAS/i;
const COBERTURAS = ['Automotor', 'Hogar', 'Vida', 'Salud'];
const URGENCIAS = ['Alta', 'Media', 'Baja'];

/** Contacto del cuadro de búsqueda del listado, escribiendo el texto y confirmando. */
async function buscarEnListado(page: import('@playwright/test').Page, texto: string) {
  const caja = page.locator('.main-ui-filter-search input.main-ui-filter-search-filter, .main-ui-filter-search input[type="text"]').first();
  await caja.click();
  await caja.pressSequentially(texto, { delay: 90 });
  await caja.press('Enter');
  await page.waitForTimeout(4000);
}

/** Escribe en un campo del formulario abierto, ubicado por el nombre de su casillero. */
async function escribirDetalle(page: import('@playwright/test').Page, etiqueta: RegExp, valor: string) {
  const entrada = panel(page).getByText(etiqueta).first().locator('xpath=following::input[not(@type="hidden")][1]');
  await entrada.click();
  await entrada.pressSequentially(valor, { delay: 90 });
}

// ── A.2.1 ────────────────────────────────────────────────────────────────────
test('A.2.1 — Registro del solicitante con sus datos de contacto', async ({ page }, info) => {
  // «Crear un solicitante con nombre, teléfono, correo y domicilio, y
  //  recuperarlo por búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_500_000);

  await entrar(page, plataforma);
  await borrarContactosDePrueba(page);

  await altaDeContacto(page);
  await panel(page).locator('input[name="LAST_NAME"]').fill('OPO-Paz');
  await panel(page).locator('input[name="NAME"]').fill('Carolina');
  await escribirEn(page, 'Teléfono', '+54 11 4555 2001');
  await escribirEn(page, 'E-mail', 'carolina.paz@ejemplo.test');
  await panel(page).getByText('ampliar', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await escribirDetalle(page, /^Código postal:?$/, '1708');
  await escribirDetalle(page, /^País:?$/, 'Argentina');
  await escribirDetalle(page, /^Ciudad:?$/, 'Morón');
  await escribirDetalle(page, /^Calle.*:?$/, 'Av. Rivadavia 17800');
  const capFormulario = await capturar(page, 'A.2.1', plataforma, '1-solicitante-cargado');
  await guardarFormulario(page);
  await cerrarPaneles(page);

  await abrirContactos(page);
  await buscarEnListado(page, 'Carolina');
  const capBusqueda = await capturar(page, 'A.2.1', plataforma, '2-busqueda');
  const visibles = await page.locator('a').filter({ hasText: /Carolina/ }).filter({ visible: true }).allTextContents();

  const guardado = (await contactosDePrueba(page))[0];
  const direcciones = await rest<any[]>(page, 'crm.address.list', { filter: { ENTITY_TYPE_ID: 3, ENTITY_ID: guardado?.ID } });
  console.log(`    guardado: ${JSON.stringify({ tel: guardado?.PHONE?.[0]?.VALUE, mail: guardado?.EMAIL?.[0]?.VALUE, dir: direcciones[0]?.ADDRESS_1, ciudad: direcciones[0]?.CITY })}`);
  expect(guardado?.EMAIL?.[0]?.VALUE, 'el correo debe quedar guardado').toBe('carolina.paz@ejemplo.test');
  expect(guardado?.PHONE?.[0]?.VALUE, 'el teléfono debe quedar guardado').toMatch(/45552001/);
  expect(direcciones[0]?.CITY, 'el domicilio debe quedar guardado').toBe('Morón');
  expect(visibles.join(' '), 'la búsqueda debe encontrarlo').toMatch(/Carolina/);

  registrar({
    criterio: 'A.2.1',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'La edición gratuita no incluye el módulo de prospectos: el solicitante se registra como un contacto, igual que ' +
      'el asegurado. El formulario del contacto trae nombre y apellido, teléfono, correo y dirección desglosada en ' +
      'código postal, país, provincia, ciudad y calle. Se cargó una solicitante con todos esos datos desde el ' +
      'formulario y quedaron guardados; la búsqueda del listado la encontró por su nombre. Viene listo: no hay nada ' +
      'que configurar.',
    evidencia: [capFormulario, capBusqueda],
  });
});

// ── A.2.2 ────────────────────────────────────────────────────────────────────
test('A.2.2 — Calificación y priorización del solicitante', async ({ page }, info) => {
  // «Registrar qué cobertura pide el solicitante y con cuánta urgencia, y
  //  obtener la lista ordenada por esa urgencia para atender primero a los que
  //  más cerca están de contratar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const solicitantes = [
    { apellido: 'OPO-Ríos', nombre: 'Tomás', cobertura: 'Hogar', urgencia: 'Baja' },
    { apellido: 'OPO-Vera', nombre: 'Inés', cobertura: 'Automotor', urgencia: 'Alta' },
    { apellido: 'OPO-Sosa', nombre: 'Julio', cobertura: 'Vida', urgencia: 'Media' },
  ];
  await borrarContactosDePrueba(page, /^OPO-(Ríos|Vera|Sosa)$/);
  for (const c of ['Cobertura solicitada', 'Urgencia']) await quitarCampoDeContacto(page, c);

  let capFicha = '';
  for (const [i, s] of solicitantes.entries()) {
    await altaDeContacto(page);
    if (i === 0) {
      await crearCampoPropio(page, 'Lista', 'Cobertura solicitada', COBERTURAS);
      await crearCampoPropio(page, 'Lista', 'Urgencia', URGENCIAS);
    }
    await panel(page).locator('input[name="LAST_NAME"]').fill(s.apellido);
    await panel(page).locator('input[name="NAME"]').fill(s.nombre);
    await elegirEnListaDeContacto(page, 'Cobertura solicitada', s.cobertura);
    await elegirEnListaDeContacto(page, 'Urgencia', s.urgencia);
    if (i === solicitantes.length - 1) capFicha = await capturar(page, 'A.2.2', plataforma, '1-calificacion');
    await guardarFormulario(page);
    await cerrarPaneles(page);
  }

  const cobertura = await campoDeContacto(page, 'Cobertura solicitada');
  const urgencia = await campoDeContacto(page, 'Urgencia');
  const guardados = await contactosDePrueba(page);
  const valor = (c: any, id: string) => c.LIST.find((l: any) => String(l.ID) === String(id))?.VALUE;
  const de = (ap: string) => guardados.find(g => g.LAST_NAME === ap);
  expect(valor(urgencia, de('OPO-Vera')?.[urgencia.FIELD_NAME]), 'la urgencia debe quedar guardada').toBe('Alta');
  expect(valor(cobertura, de('OPO-Vera')?.[cobertura.FIELD_NAME]), 'la cobertura debe quedar guardada').toBe('Automotor');

  try {
    await abrirContactos(page);
    await mostrarColumnas(page, ['Urgencia', 'Cobertura solicitada']);
    await ordenarPor(page, 'Urgencia');
    const patron = /OPO-(Ríos|Vera|Sosa)/;
    const primero = await filasDelListado(page, patron);
    const capOrden = await capturar(page, 'A.2.2', plataforma, '2-ordenados-por-urgencia');
    await ordenarPor(page, 'Urgencia');
    const segundo = await filasDelListado(page, patron);
    const prioridad = ['Vera', 'Sosa', 'Ríos'];
    const nombres = (fs: string[]) => fs.map(f => prioridad.find(p => f.includes(p)) ?? f);
    const a = nombres(primero), b = nombres(segundo);
    console.log(`    orden 1: ${a.join(' > ')} · orden 2: ${b.join(' > ')}`);
    const porPrioridad = (o: string[]) => JSON.stringify(o) === JSON.stringify(prioridad);
    const alReves = (o: string[]) => JSON.stringify(o) === JSON.stringify([...prioridad].reverse());
    const sigueLaLista = (porPrioridad(a) && alReves(b)) || (alReves(a) && porPrioridad(b));

    expect(sigueLaLista, 'ordenar por urgencia debe seguir el orden de las opciones, y un segundo clic invertirlo').toBeTruthy();

    registrar({
      criterio: 'A.2.2',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'El contacto no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde su propio ' +
        'formulario. Se cargaron tres solicitantes en desorden y, con un clic en el encabezado de la columna ' +
        `«Urgencia», el listado quedó ordenado ${porPrioridad(a) ? 'primero la alta, después la media y al final la baja' : 'de la baja a la alta'} ` +
        '—el orden de las opciones de la lista, no el alfabético—; otro clic lo invierte. Definir los dos campos es ' +
        'configuración de una sola vez.',
      evidencia: [capFicha, capOrden],
      medicion: `orden: ${a.join(' > ')}`,
    });
  } finally {
    await restaurarFiltro(page).catch(() => {});
  }
});

// ── A.2.3 ────────────────────────────────────────────────────────────────────
test('A.2.3 — Conversión del solicitante en oportunidad de venta', async ({ page, browser }, info) => {
  // «Convertir el solicitante en oportunidad y comprobar que los datos
  //  cargados se trasladan sin volver a escribirlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const id = await contactoDePrueba(page, 'OPO-Vera', 'Inés', { PHONE: [{ VALUE: '+54 11 4555 2002', VALUE_TYPE: 'WORK' }], EMAIL: [{ VALUE: 'ines.vera@ejemplo.test', VALUE_TYPE: 'WORK' }] });
  await borrarNegociaciones(page, /^OPO-CONV-/);
  await rest(page, 'crm.contact.update', { id, fields: { PHONE: [{ VALUE: '+54 11 4555 2002', VALUE_TYPE: 'WORK' }], EMAIL: [{ VALUE: 'ines.vera@ejemplo.test', VALUE_TYPE: 'WORK' }] } });

  // El módulo de prospectos, del que se convierte un interesado, es de los planes pagos: se abre y se lee lo que dice
  await menuLateral(page, 'CRM');
  await pestana(page, 'Prospectos');
  await page.waitForTimeout(2500);
  const aviso = await textoDe(page);
  const capProspectos = await capturar(page, 'A.2.3', plataforma, '1-prospectos-no-incluidos');
  const sinProspectos = /no incluido en tu plan/i.test(aviso);
  console.log(`    prospectos no incluidos en el plan: ${sinProspectos}`);
  await page.keyboard.press('Escape');
  await page.mouse.click(400, 500);

  // Lo que sí hay: crear la negociación desde la ficha del contacto, que la deja ligada a él
  await abrirContactos(page);
  await abrirContacto(page, /OPO-Vera/);
  await panel(page).getByText('Negociaciones', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  await panel(page).getByText(/^\s*\+?\s*Nueva negociación\s*$/i).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).locator('input[name="TITLE"]'));
  await panel(page).locator('input[name="TITLE"]').fill('OPO-CONV-Vera-Automotor');
  const capNegociacion = await capturar(page, 'A.2.3', plataforma, '2-negociacion-desde-el-contacto');
  await guardarFormulario(page);
  const capGuardada = await capturar(page, 'A.2.3', plataforma, '3-negociacion-guardada');
  const textoFicha = await textoDe(page);
  await cerrarPaneles(page);

  const creada = (await negociaciones(page, /^OPO-CONV-/))[0];
  const traeTelefono = /4555[- ]?2002/.test(textoFicha) && /ines\.vera@ejemplo\.test/.test(textoFicha);
  console.log(`    negociación ligada al contacto: ${String(creada?.CONTACT_ID) === id} · teléfono a la vista: ${traeTelefono}`);
  expect(sinProspectos, 'al abrir prospectos, el sistema debe informar que no están en el plan').toBeTruthy();
  expect(String(creada?.CONTACT_ID), 'la negociación debe quedar ligada al contacto').toBe(id);
  expect(traeTelefono, 'la negociación debe mostrar el teléfono y el correo del contacto').toBeTruthy();

  const fuentes = [
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: /Todo lo incluido en Basic, más:.*Prospectos ilimitados/,
      captura: 'A-2-3-bitrix24-4-prospectos-en-standard',
    }),
    ...(await constanciaDe(browser, BITRIX24_STANDARD, 'A-2-3-bitrix24-standard')),
  ];

  registrar({
    criterio: 'A.2.3',
    plataforma,
    cumple: 1,
    justificacion:
      'La conversión de un interesado en oportunidad es una acción del módulo de prospectos, y ese módulo no está en ' +
      'la edición gratuita: al abrir «Prospectos» el sistema informa que no está incluido en el plan. Con el ' +
      'solicitante como contacto, lo más cercano es crear la negociación desde su ficha: queda ligada a él y su ' +
      'teléfono y correo se ven en la negociación sin volver a escribirlos, pero no hay una acción que la arme ' +
      'con lo que el solicitante pidió: la cobertura solicitada, un campo propio del contacto, se vuelve a cargar ' +
      'a mano en cada negociación.',
    evidencia: [capProspectos, capNegociacion, capGuardada],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_STANDARD, {
      cumple: 2,
      costo: 1,
      justificacion:
        'El plan Standard incluye prospectos ilimitados, con su acción de convertir el prospecto en contacto, ' +
        'compañía y negociación llevando los datos cargados. Los campos propios pasan a la negociación si existen ' +
        'con el mismo nombre en las dos entidades: crearlos es configuración de una vez.',
    })],
  });
});

// ── A.2.4 ────────────────────────────────────────────────────────────────────
test('A.2.4 — Embudo de oportunidades con etapas', async ({ page }, info) => {
  // «Crear una oportunidad desde la ficha de un asegurado y hacerla avanzar
  //  entre etapas hasta el cierre»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const id = await contactoDePrueba(page, 'OPO-Vera', 'Inés');
  await borrarNegociaciones(page, /^OPO-EMBUDO-/);

  await abrirContactos(page);
  await abrirContacto(page, /OPO-Vera/);
  await panel(page).getByText('Negociaciones', { exact: true }).first().click();
  await page.waitForTimeout(3000);
  await panel(page).getByText(/^\s*\+?\s*Nueva negociación\s*$/i).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).locator('input[name="TITLE"]'));
  await panel(page).locator('input[name="TITLE"]').fill('OPO-EMBUDO-Vera-Hogar');
  await guardarFormulario(page);

  // Cada etapa del embudo, con un clic en la barra de etapas de la ficha
  const etapas = ['Crear documentos', 'Factura', 'En progreso', 'Factura final'];
  for (const e of etapas) {
    await panel(page).locator('.crm-entity-section-status-step, .crm-entity-widget-progress-step').filter({ hasText: new RegExp(`^\\s*${e}\\s*$`) }).first().click();
    await page.waitForTimeout(2500);
  }
  const capEtapas = await capturar(page, 'A.2.4', plataforma, '1-etapas-recorridas');
  await panel(page).getByText('Cerrar negociación', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  await panel(page).getByText(/Cerrado Ganado|Ganada/).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
  await guardarFormulario(page).catch(() => {});
  const capCierre = await capturar(page, 'A.2.4', plataforma, '2-negociacion-cerrada');
  await cerrarPaneles(page);

  const final = (await negociaciones(page, /^OPO-EMBUDO-/, ['ID', 'TITLE', 'STAGE_ID', 'CONTACT_ID', 'CLOSED']))[0];
  console.log(`    etapa final: ${final?.STAGE_ID} · cerrada: ${final?.CLOSED} · contacto: ${final?.CONTACT_ID}`);
  expect(String(final?.CONTACT_ID), 'la negociación debe estar ligada al asegurado').toBe(id);
  expect(final?.STAGE_ID, 'la negociación debe llegar a una etapa de cierre').toMatch(/WON/);

  registrar({
    criterio: 'A.2.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Desde la ficha del contacto, la solapa de negociaciones crea una nueva ya ligada a él. El embudo viene ' +
      'definido de fábrica —en desarrollo, crear documentos, factura, en progreso, factura final y el cierre, ' +
      'ganado o perdido— y la negociación se hizo avanzar con un clic en cada etapa de la barra de su ficha hasta ' +
      'cerrarla como ganada. Viene listo, aunque las etapas son las de una venta genérica: adaptarlas al seguro es ' +
      'configuración.',
    evidencia: [capEtapas, capCierre],
    medicion: `etapa final: ${final?.STAGE_ID}`,
  });
});

// ── A.2.5 ────────────────────────────────────────────────────────────────────
test('A.2.5 — Embudos diferenciados por ramo', async ({ page, browser }, info) => {
  // «Crear un segundo embudo con etapas distintas del primero y asignarle una
  //  oportunidad»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const categorias = () => rest<any>(page, 'crm.category.list', { entityTypeId: 2 }).then(r => r.categories as any[]);
  for (const c of (await categorias()).filter(c => c.name === 'Seguros de vida')) {
    await rest(page, 'crm.category.delete', { entityTypeId: 2, id: c.id });
  }
  const antes = (await categorias()).length;

  // Un segundo embudo se agrega desde «Pipelines y túneles de ventas»
  await menuLateral(page, 'CRM');
  await page.getByText('Pipeline general', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  await page.getByText('Pipelines y túneles de ventas', { exact: true }).filter({ visible: true }).first().click();
  await panelListo(page, 'Agregar pipeline');
  await panel(page).getByText('Agregar pipeline', { exact: true }).first().click();
  // El sistema responde al pedir el embudo nuevo: lo abre o pide otro plan
  let muro = false;
  for (let i = 0; i < 20 && !muro; i++) {
    await page.waitForTimeout(2000);
    muro = /La cantidad máxima de pipelines disponibles en Bitrix24 varía según tu plan/.test(await textoDe(page));
  }
  await page.waitForTimeout(1500);
  const capMuro = await capturar(page, 'A.2.5', plataforma, '1-al-agregar-el-embudo');
  await cerrarPaneles(page);
  const despues = (await categorias()).length;
  console.log(`    embudos antes: ${antes} · después: ${despues} · pide otro plan: ${muro}`);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: /Todo lo incluido en Free, más:.*Embudos de ventas/,
      captura: 'A-2-5-bitrix24-3-embudos-en-basic',
    }),
    await citar(browser, {
      url: 'https://www.bitrix24.es/prices/',
      buscar: 'CRM básico (negociaciones, contactos)',
      captura: 'A-2-5-bitrix24-4-crm-basico-en-free',
    }),
    ...(await constanciaDe(browser, BITRIX24_BASIC, 'A-2-5-bitrix24-basic')),
  ];

  expect(despues, 'si el embudo se creó, este veredicto no corresponde').toBe(antes);
  expect(muro, 'al guardar, el sistema debe informar que pide otro plan').toBeTruthy();

  registrar({
    criterio: 'A.2.5',
    plataforma,
    cumple: 0,
    justificacion:
      'La edición gratuita trae un solo embudo, el pipeline general. Desde «Pipelines y túneles de ventas», ' +
      'al pedir «Agregar pipeline» el sistema no abre el embudo nuevo: informa que la cantidad máxima de ' +
      'pipelines depende del plan y ofrece actualizar; la lista de embudos siguió con uno solo. El fabricante publica los embudos de ' +
      'ventas como función que se suma con el plan Basic.',
    evidencia: [capMuro],
    documentacion: fuentes,
    conPlan: [conPlanDe(BITRIX24_BASIC, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan de entrada se pueden crear embudos adicionales, cada uno con sus propias etapas: uno por ramo ' +
        'y una negociación en el que corresponde. Definirlos es configuración de una vez. Los planes superiores ' +
        'suben la cantidad de embudos y no cambian lo que se resuelve.',
    })],
  });
});

// ── A.2.6 ────────────────────────────────────────────────────────────────────
test('A.2.6 — Oportunidades de cambio y ampliación sobre la cartera', async ({ page }, info) => {
  // «Obtener el conjunto de asegurados que tienen un ramo contratado y no otro,
  //  y el de los que están próximos a vencer, como base para ofrecer una
  //  cobertura adicional o un cambio de póliza»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'bitrix24');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  await asegurarCampos(page, [
    { tipo: 'Lista', nombre: 'Ramo', valores: ['Automotor', 'Hogar', 'Vida', 'Salud'] },
    { tipo: 'Fecha', nombre: 'Vigencia hasta' },
  ]);
  const ramo = await campoDeNegociacion(page, 'Ramo');
  const hasta = await campoDeNegociacion(page, 'Vigencia hasta');
  await borrarNegociaciones(page, /^OPO-ASEG-/);
  await borrarContactosDePrueba(page, /^OPO-Aseg-/);

  // Tres asegurados: A tiene automotor, B automotor y hogar, C hogar. Solo la de A vence pronto
  const letras: Record<string, string> = {};
  for (const [l, n] of [['A', 'Ana'], ['B', 'Beto'], ['C', 'Clara']]) letras[l] = await contactoDePrueba(page, `OPO-Aseg-${l}`, n);
  const polizas = [['A', 'Automotor', 12], ['B', 'Automotor', 200], ['B', 'Hogar', 210], ['C', 'Hogar', 220]] as const;
  for (const [l, r, dias] of polizas) {
    await rest(page, 'crm.deal.add', { fields: {
      TITLE: `OPO-ASEG-${l}-${r}`, CONTACT_ID: letras[l],
      [ramo.FIELD_NAME]: idDeOpcion(ramo, r), [hasta.FIELD_NAME]: isoEnDias(dias),
    } });
  }

  // Primer conjunto: el filtro del listado de contactos no ofrece las pólizas que tiene cada uno
  await abrirContactos(page);
  await abrirFiltro(page);
  await page.getByText('Agregar campo', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(2000);
  const camposDelContacto = (await page.locator('label').filter({ visible: true }).allTextContents()).map(t => t.trim()).filter(Boolean);
  const capContactos = await capturar(page, 'A.2.6', plataforma, '1-filtros-del-contacto');
  await page.getByText('Cancelar', { exact: true }).filter({ visible: true }).first().click();
  await cerrarFiltro(page);
  const filtraPorPolizas = camposDelContacto.some(c => /^(Ramo|Estado de cobranza|Vigencia|Negociaci)/i.test(c));
  console.log(`    campos filtrables del contacto: ${camposDelContacto.length} · alguno de pólizas: ${filtraPorPolizas}`);

  try {
    // Lo que sí se puede: las pólizas por ramo, cada una con su cliente
    await abrirListado(page);
    await filtrarLista(page, 'Ramo', 'Automotor');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const automotor = await filasDelListado(page, /^OPO-ASEG-/);
    await reiniciarFiltro(page);
    await filtrarLista(page, 'Ramo', 'Hogar');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const hogar = await filasDelListado(page, /^OPO-ASEG-/);
    const capRamos = await capturar(page, 'A.2.6', plataforma, '2-polizas-por-ramo');
    const asegurado = (t: string) => t.split('-')[2];
    const soloAutomotor = [...new Set(automotor.map(asegurado))].filter(a => !hogar.map(asegurado).includes(a));
    console.log(`    automotor: ${automotor.join(', ')} · hogar: ${hogar.join(', ')} · solo automotor: ${soloAutomotor.join(', ')}`);

    // Segundo conjunto: los próximos a vencer
    await reiniciarFiltro(page);
    await filtrarFecha(page, 'Vigencia hasta', 'Próximos N días', '30');
    await buscarConFiltro(page);
    await cerrarFiltro(page);
    const proximas = await filasDelListado(page, /^OPO-ASEG-/);
    const capProximas = await capturar(page, 'A.2.6', plataforma, '3-proximas-a-vencer');

    expect(filtraPorPolizas, 'si el contacto se pudiera filtrar por sus pólizas, este veredicto no corresponde').toBeFalsy();
    expect(proximas, 'debe traer la póliza que vence en 12 días y ninguna otra').toEqual(['OPO-ASEG-A-Automotor']);
    expect(soloAutomotor, 'comparando las dos listas se llega al asegurado con automotor y sin hogar').toEqual(['A']);

    registrar({
      criterio: 'A.2.6',
      plataforma,
      cumple: 1,
      justificacion:
        'El conjunto de los próximos a vencer sale directo: el filtro del listado de negociaciones sobre la fecha de ' +
        'fin de vigencia, «próximos 30 días», trajo la póliza que vence en doce días y dejó afuera las demás, con ' +
        'su cliente en el listado. El otro conjunto no: el filtro del listado de contactos solo ofrece campos del ' +
        'propio contacto, no las pólizas que tiene, así que «tiene automotor y no hogar» no se puede preguntar. ' +
        'Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos listas de clientes, cada vez ' +
        'que se quiere armar la oferta.',
      evidencia: [capContactos, capRamos, capProximas],
      medicion: `${camposDelContacto.length} campos filtrables del contacto, ninguno sobre sus pólizas · ${proximas.length} póliza próxima a vencer`,
    });
  } finally {
    await restaurarFiltro(page).catch(() => {});
  }
});
