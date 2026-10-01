import { test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { alistarPoliza, alistarEntidad } from '../preparar';
import { cargarCartera, ASEGURADOS } from '../datos';
import { apiEspo, crear, listar } from '../api';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, agregarFiltro, filtrarPorLista,
  aplicarFiltros, filasDelListado } from './comun';
import { escribirGuion, guardarGuion } from '../formula';
import { alta as irAAlta, ficha, edicion } from '../espocrm/navegar';

/**
 * A.6 — Ficha única del asegurado
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. El asegurado es el contacto que trae el producto.
 */

test.describe.configure({ mode: 'serial' });

const TITULAR = ASEGURADOS[1];   // Joaquín Peña
let titularId = '';
let polizaId = '';

test.beforeAll(async ({ browser }, info) => {
  test.setTimeout(900_000);
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api, asegurados } = await cargarCartera();
  titularId = asegurados[1];

  // La relación póliza → titular. Se define en el Administrador de Relaciones;
  // A.6.1 declara ese trabajo en su costo.
  const campos = (await (await api.get('Metadata')).json()).entityDefs.CPoliza.links ?? {};
  if (!campos.titular) {
    const r = await api.post('EntityManager/action/createLink', { data: {
      entity: 'CPoliza', entityForeign: 'Contact', link: 'titular', linkForeign: 'polizas',
      label: 'Titular', labelForeign: 'Pólizas', linkType: 'manyToOne',
    } });
    if (!r.ok()) throw new Error(`No se pudo crear la relación: ${r.status()} ${await r.text()}`);
  }

  // El campo del rubro en la ficha del asegurado, para A.6.3
  const contacto = (await (await api.get('Metadata')).json()).entityDefs.Contact.fields;
  if (!contacto.cValoracionAtencion) {
    await api.post('Admin/fieldManager/Contact', { data: {
      name: 'valoracionAtencion', type: 'enum', label: 'Valoración de la atención',
      options: ['', 'Muy buena', 'Buena', 'Regular', 'Mala'],
    } });
  }
  // Y el documento, que es lo que identifica al asegurado, para A.6.4
  if (!contacto.cDocumento) {
    await api.post('Admin/fieldManager/Contact', { data: { name: 'documento', type: 'varchar', label: 'Documento', maxLength: 20 } });
  }

  const pagina = await (await browser.newContext()).newPage();
  try {
    await entrar(pagina, 'espocrm');
    await alistarPoliza(pagina);
    await alistarEntidad(pagina, 'CPoliza', { detail: ['titular'], list: ['titular'] });
    // La ficha del asegurado tiene sus paneles inferiores ya definidos: el de
    // pólizas no aparece solo, se agrega entre ellos
    await alistarEntidad(pagina, 'Contact', {
      detail: ['cDocumento', 'cValoracionAtencion'], filters: ['cValoracionAtencion'], bottomPanelsDetail: ['cPolizas'],
    });
  } finally {
    await pagina.context().close();
  }

  // Las corridas anteriores se quitan: cada corrida mide lo mismo
  const { list } = await listar(api, 'CPoliza', { maxSize: 200 });
  for (const p of list.filter((p: any) => p.name === 'POL-TITULAR-PENA')) await api.delete(`CPoliza/${p.id}`);
  const { list: duplicados } = await listar(api, 'Contact', { maxSize: 200 });
  for (const c of duplicados.filter((c: any) => c.cDocumento === '30111222')) await api.delete(`Contact/${c.id}`);
});

// ── A.6.1 ────────────────────────────────────────────────────────────────────
test('A.6.1 — Vinculación de la póliza con su titular', async ({ page }, info) => {
  // «Relacionar la póliza con un contacto, abrir la ficha del contacto y
  //  comprobar que la póliza figura allí; abrir la póliza y comprobar que
  //  muestra al titular»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  await irAAlta(page, 'CPoliza');
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially('POL-TITULAR-PENA', { delay: 20 });
  await elegirLista(page, 'tipoPoliza', 'Hogar');
  const titular = page.locator('.field[data-name="titular"] input[data-name="titularName"]').first();
  await titular.click();
  await titular.pressSequentially(TITULAR.lastName, { delay: 50 });
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: TITULAR.lastName }).first().click({ timeout: 15_000 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForURL(/#CPoliza\/view\//, { timeout: 30_000 });
  polizaId = page.url().split('/').pop()!;
  await page.waitForTimeout(3000);
  const enPoliza = (await textoDe(page)).includes(TITULAR.lastName);
  const capPoliza = await capturar(page, 'A.6.1', plataforma, '1-poliza-con-titular');

  await ficha(page, 'Contact', titularId);
  const panel = page.locator('.panel[data-name="cPolizas"]').first();
  await panel.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(2500);
  const enFicha = (await panel.innerText()).includes('POL-TITULAR-PENA');
  const capFicha = await capturar(page, 'A.6.1', plataforma, '2-ficha-del-titular');

  expect(enPoliza, 'la póliza debe mostrar al titular').toBeTruthy();
  expect(enFicha, 'la ficha del titular debe listar la póliza').toBeTruthy();

  registrar({
    criterio: 'A.6.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El Administrador de Relaciones liga la póliza con el contacto que es su titular, sin programar: se ' +
      'define una vez que cada póliza tiene un titular y que un asegurado puede tener muchas pólizas. Para que ' +
      'la ficha del asegurado muestre sus pólizas hay que agregar ese panel entre los inferiores, en el Gestor ' +
      'de Diseños. A partir de ahí, al cargar una póliza se elige el titular buscándolo por nombre; la póliza ' +
      'lo muestra en su ficha, y la del asegurado lista todas sus pólizas. Las dos puntas del vínculo quedan a ' +
      'la vista sin buscar en otro menú.',
    evidencia: [capPoliza, capFicha],
  });
});

// ── A.6.2 ────────────────────────────────────────────────────────────────────
test('A.6.2 — Vista única del asegurado', async ({ page }, info) => {
  // «Abrir la ficha de un asegurado y comprobar si desde allí se llega a todo
  //  lo suyo —pólizas, actividad y reclamos— sin buscarlo en otro menú»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // Lo suyo: un reclamo y una llamada, además de la póliza de A.6.1
  const api = await apiEspo();
  await crear(api, 'Case', { name: 'Consulta por cobertura de hogar — Peña', contactsIds: [titularId], contactId: titularId });
  await crear(api, 'Call', {
    name: 'Llamada de bienvenida — Peña', status: 'Held', parentType: 'Contact', parentId: titularId,
    assignedUserId: (await listar(api, 'User', { maxSize: 200 })).list.find((u: any) => u.userName === 'admin').id,
    dateStart: new Date().toISOString().slice(0, 19).replace('T', ' '),
    dateEnd: new Date(Date.now() + 600_000).toISOString().slice(0, 19).replace('T', ' '),
  });

  await entrar(page, plataforma);
  await ficha(page, 'Contact', titularId);
  await page.locator('.panel[data-name="cPolizas"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(4000);
  const paneles = await page.locator('.panel[data-name]').evaluateAll(
    ps => ps.map(p => ({ nombre: p.getAttribute('data-name') ?? '', texto: (p.textContent ?? '').replace(/\s+/g, ' ') })));
  const con = (nombre: string, texto: string) => paneles.some(p => p.nombre === nombre && p.texto.includes(texto));
  const capFicha = await capturar(page, 'A.6.2', plataforma, '1-ficha-completa');

  const tienePolizas = con('cPolizas', 'POL-TITULAR-PENA');
  const tieneReclamos = con('cases', 'Peña');
  const tieneActividad = con('history', 'Peña') || con('activities', 'Peña');

  expect(tienePolizas, 'la ficha debe mostrar sus pólizas').toBeTruthy();
  expect(tieneReclamos, 'la ficha debe mostrar sus reclamos').toBeTruthy();
  expect(tieneActividad, 'la ficha debe mostrar su actividad').toBeTruthy();

  registrar({
    criterio: 'A.6.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La ficha del asegurado reúne en paneles todo lo suyo: sus pólizas, sus reclamos, sus actividades ' +
      'pendientes y el historial de llamadas, reuniones y correos, además de la línea de tiempo de cambios. ' +
      'Desde ahí se llega a cada registro sin pasar por otro menú. Los reclamos y la actividad vienen de ' +
      'fábrica; el panel de pólizas aparece al definir la relación con el titular, que es configuración de una ' +
      'sola vez.',
    evidencia: [capFicha],
    medicion: `${paneles.length} paneles en la ficha del asegurado`,
  });
});

// ── A.6.3 ────────────────────────────────────────────────────────────────────
test('A.6.3 — Campos propios del rubro en la ficha', async ({ page }, info) => {
  // «Agregar a la ficha del asegurado un campo que el producto no trae —la
  //  valoración que dejó sobre la atención recibida— y comprobar que queda
  //  disponible en el alta y en la búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  await entrar(page, plataforma);
  await edicion(page, 'Contact', titularId);
  await page.locator('.field[data-name="cValoracionAtencion"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'cValoracionAtencion', 'Muy buena');
  const capAlta = await capturar(page, 'A.6.3', plataforma, '1-en-el-formulario');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  await listadoLimpio(page, 'Contact');
  await agregarFiltro(page, 'cValoracionAtencion');
  await filtrarPorLista(page, 'cValoracionAtencion', 'Muy buena');
  await aplicarFiltros(page);
  const encontrados = await filasDelListado(page);
  const capBusqueda = await capturar(page, 'A.6.3', plataforma, '2-en-la-busqueda');

  expect(encontrados.some(n => n.includes(TITULAR.lastName)), 'debe poder buscarse por el campo nuevo').toBeTruthy();

  registrar({
    criterio: 'A.6.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Se agregó a la ficha del asegurado un campo que el producto no trae —la valoración que dejó sobre la ' +
      'atención recibida, con cuatro valores— desde el Administrador de Campos. Quedó en el formulario, se ' +
      'cargó en un asegurado y se lo pudo usar como condición de búsqueda para listar a los que valoraron la ' +
      'atención como muy buena. Es configuración de una sola vez: se define el campo y se lo ubica en el ' +
      'formulario y entre los filtros, sin programar.',
    evidencia: [capAlta, capBusqueda],
  });
});

// ── A.6.4 ────────────────────────────────────────────────────────────────────
test('A.6.4 — Unicidad de la ficha del asegurado', async ({ page }, info) => {
  // «Cargar dos veces un asegurado con el mismo documento y comprobar si el
  //  sistema advierte la duplicación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(700_000);

  const api = await apiEspo();
  const conEseDocumento = async () => (await listar(api, 'Contact', { maxSize: 200 })).list
    .filter((c: any) => c.cDocumento === '30111222');

  /** Carga un asegurado con el documento repetido y devuelve lo que dijo el sistema. */
  const alta = async (apellido: string) => {
    await irAAlta(page, 'Contact');
    const doc = page.locator('.field[data-name="cDocumento"] input[data-name="cDocumento"]').first();
    await doc.waitFor({ state: 'visible', timeout: 40_000 });
    await page.locator('input[data-name="firstName"]').first().pressSequentially('Esteban', { delay: 20 });
    await page.locator('input[data-name="lastName"]').first().pressSequentially(apellido, { delay: 20 });
    await doc.pressSequentially('30111222', { delay: 20 });
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(4500);
    return page.locator('.modal-dialog:visible').first().innerText().catch(() => '');
  };

  await entrar(page, plataforma);
  // Se parte del comportamiento de fábrica: la comprobación de una corrida anterior se quita
  await escribirGuion(page, 'Contact', 'beforeSaveApiScript', '');
  await guardarGuion(page);

  await alta('Quiroga');
  // Mismo documento, apellido escrito distinto: el error típico de la ventanilla
  const sinRegla = await alta('Quiroga Ruiz');
  const capSinRegla = await capturar(page, 'A.6.4', plataforma, '1-sin-configurar');
  await page.keyboard.press('Escape');
  const duplicadosSinRegla = (await conEseDocumento()).length;

  // La comprobación por documento, en el guion que la pantalla de fórmula
  // ofrece "para validación personalizada y comprobación de duplicados"
  for (const c of (await conEseDocumento()).slice(1)) await api.delete(`Contact/${c.id}`);
  await escribirGuion(page, 'Contact', 'beforeSaveApiScript', [
    "ifThen(entity\\isNew() && cDocumento && record\\exists('Contact', 'cDocumento', cDocumento),",
    "  recordService\\throwDuplicateConflict(record\\findOne('Contact', null, null, 'cDocumento', cDocumento))",
    ');',
  ].join('\n'));
  const capRegla = await capturar(page, 'A.6.4', plataforma, '2-comprobacion-por-documento');
  await guardarGuion(page);

  let conRegla = '', capConRegla = '', duplicadosConRegla = 0;
  try {
    conRegla = await alta('Quiroga Ruiz');
    capConRegla = await capturar(page, 'A.6.4', plataforma, '3-duplicado-advertido');
    await page.keyboard.press('Escape');
    duplicadosConRegla = (await conEseDocumento()).length;
  } finally {
    // La comprobación es parte de la medición: se quita para no alterar las altas de los demás criterios
    await escribirGuion(page, 'Contact', 'beforeSaveApiScript', '');
    await guardarGuion(page);
  }
  console.log(`    sin regla: ${duplicadosSinRegla} con ese documento, aviso «${sinRegla.replace(/\s+/g, ' ').slice(0, 120)}»`);
  console.log(`    con regla: ${duplicadosConRegla} con ese documento, aviso «${conRegla.replace(/\s+/g, ' ').slice(0, 120)}»`);

  expect(duplicadosSinRegla, 'de fábrica, el documento repetido no se advierte').toBe(2);
  expect(conRegla, 'con la comprobación, el sistema debe advertir el duplicado').toMatch(/duplicad/i);

  registrar({
    criterio: 'A.6.4',
    plataforma,
    cumple: 2,
    costo: 2,
    justificacion:
      'De fábrica el producto busca duplicados por nombre y correo, pero no por documento: se cargó dos veces ' +
      'el mismo documento con el apellido escrito distinto y el sistema aceptó las dos fichas sin advertir ' +
      'nada. La pantalla de fórmula de cada entidad trae un guion que se ejecuta antes de guardar, pensado para ' +
      'validaciones y comprobación de duplicados; con tres líneas que buscan el documento, la segunda carga ' +
      'mostró el aviso de posible duplicado y remitió a la ficha existente. La necesidad queda resuelta desde ' +
      'el sistema, pero exige escribir ese guion: es desarrollo, breve, que alguien tiene que saber leer y ' +
      'mantener.',
    evidencia: [capSinRegla, capRegla, capConRegla],
    medicion: `Sin la comprobación: ${duplicadosSinRegla} fichas con el mismo documento; con ella: ${duplicadosConRegla}`,
  });
});
