import { Page, test, expect, request } from '../humano';
import { registrar } from '../evaluar';
import { entrar, entrarComo, plataformaDe } from '../sesion';
import { apiEspo, crear, listar } from '../api';
import { citar } from '../fuentes';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { soloEn, capturar, textoDe, elegirLista, listadoLimpio, agregarFiltro, filtrarPorLista,
  aplicarFiltros, filasDelListado, clicEnAccion } from './comun';
import { escribirGuion, guardarGuion } from '../formula';
import { administracion, alta, ficha, edicion } from '../espocrm/navegar';

/**
 * A.11 — Emisión, cobranza y continuidad de la relación
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. La póliza es la entidad propia que define A.1; el asegurado, el
 * contacto; el reclamo, el caso. El escenario —el modelo de cuotas, los
 * campos y las cuentas— se monta antes y se declara en el costo de cada
 * criterio que lo necesita.
 */

// Los criterios no dependen entre sí: uno que falla no detiene a los demás.

const BASE = 'http://localhost:8705/api/v1/';
const OPERADOR = { userName: 'operador-crm', clave: 'Operador1234!' };
const APELLIDOS = ['Sandoval', 'Villalba', 'Cardozo', 'Arce', 'Paredes'];

/** Fechas como las muestra el sistema (DD.MM.AAAA) y como las guarda (AAAA-MM-DD). */
const enDias = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};
const iso = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** Escribe tecla por tecla en un campo del formulario. */
async function escribir(page: Page, selector: string, valor: string) {
  const entrada = page.locator(selector).first();
  await entrada.waitFor({ state: 'visible', timeout: 30_000 });
  await entrada.click();
  await entrada.pressSequentially(valor, { delay: 25 });
}

/** Completa un campo de vínculo buscando por nombre, como en el sistema. */
async function vincular(page: Page, selector: string, nombre: string) {
  const entrada = page.locator(selector).first();
  await entrada.click();
  await entrada.pressSequentially(nombre, { delay: 50 });
  await page.locator('.autocomplete-suggestion:visible').filter({ hasText: nombre }).first().click({ timeout: 15_000 });
  await page.waitForTimeout(500);
}

/** Lee el diseño de una pantalla, lo modifica y lo guarda, si el cambio todavía no está. */
async function ajustarDiseno(api: Awaited<ReturnType<typeof apiEspo>>, entidad: string, tipo: string,
  marca: string, cambiar: (d: any) => any) {
  const actual = await (await api.get(`${entidad}/layout/${tipo}`)).json();
  if (JSON.stringify(actual).includes(marca)) return;
  const r = await api.put(`${entidad}/layout/${tipo}`, { data: cambiar(actual) });
  if (!r.ok()) throw new Error(`No se pudo guardar el diseño ${entidad}/${tipo}: ${r.status()} ${await r.text()}`);
}

/** Quita lo que dejó una corrida anterior: cada corrida mide lo mismo. */
async function limpiar(api: Awaited<ReturnType<typeof apiEspo>>) {
  const borrar = async (entidad: string, quien: (r: any) => boolean) => {
    for (const r of (await listar(api, entidad, { maxSize: 200 })).list.filter(quien)) await api.delete(`${entidad}/${r.id}`);
  };
  const deLosA12 = (r: any) => APELLIDOS.includes(r.lastName) || /Sandoval|Villalba|Cardozo|Arce|Paredes/.test(r.name ?? '');
  await borrar('CCuota', () => true);
  await borrar('CPoliza', r => /^POL-A12-|Sandoval/.test(r.name ?? ''));
  await borrar('Opportunity', deLosA12);
  await borrar('Case', deLosA12);
  await borrar('Lead', deLosA12);
  await borrar('Call', r => r.name === 'Consulta por seguro de hogar');
  await borrar('Contact', deLosA12);
}

test.beforeAll(async ({}, info) => {
  test.setTimeout(900_000);
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const api = await apiEspo();
  await limpiar(api);

  // El modelo: la cuota con su relación a la póliza, la forma de pago y la relación con la
  // oportunidad de origen. Es el trabajo de configuración que declaran A.11.1 y A.11.2.
  const meta = async () => (await (await api.get('Metadata')).json()).entityDefs;
  let m = await meta();
  const post = async (ruta: string, data: object) => {
    const r = await api.post(ruta, { data });
    if (!r.ok()) throw new Error(`POST ${ruta} devolvió ${r.status()}: ${await r.text()}`);
  };
  if (!m.CCuota) {
    await post('EntityManager/action/createEntity',
      { name: 'Cuota', labelSingular: 'Cuota', labelPlural: 'Cuotas', type: 'Base', stream: false, disabled: false });
    m = await meta();
  }
  if (!m.CCuota.fields.importe) await post('Admin/fieldManager/CCuota', { name: 'importe', type: 'currency', label: 'Importe' });
  if (!m.CCuota.fields.vencimiento) await post('Admin/fieldManager/CCuota', { name: 'vencimiento', type: 'date', label: 'Vencimiento' });
  if (!m.CCuota.fields.estado) {
    await post('Admin/fieldManager/CCuota',
      { name: 'estado', type: 'enum', label: 'Estado', options: ['Pendiente', 'Pagada'], default: 'Pendiente' });
  }
  if (!m.CCuota.links?.poliza) {
    await post('EntityManager/action/createLink', { entity: 'CCuota', entityForeign: 'CPoliza', link: 'poliza',
      linkForeign: 'cuotas', label: 'Póliza', labelForeign: 'Cuotas', linkType: 'manyToOne' });
  }
  if (!m.CPoliza.fields.formaPago) {
    await post('Admin/fieldManager/CPoliza', { name: 'formaPago', type: 'enum', label: 'Forma de pago',
      options: ['', 'Débito automático', 'Tarjeta de crédito', 'Transferencia', 'Efectivo'] });
  }
  if (!m.CPoliza.links?.titular) {
    await post('EntityManager/action/createLink', { entity: 'CPoliza', entityForeign: 'Contact', link: 'titular',
      linkForeign: 'polizas', label: 'Titular', labelForeign: 'Pólizas', linkType: 'manyToOne' });
  }
  if (!m.CPoliza.links?.oportunidad) {
    await post('EntityManager/action/createLink', { entity: 'CPoliza', entityForeign: 'Opportunity', link: 'oportunidad',
      linkForeign: 'polizas', label: 'Oportunidad', labelForeign: 'Pólizas', linkType: 'manyToOne' });
  }
  if (!m.Case.fields.cSatisfaccion) {
    await post('Admin/fieldManager/Case', { name: 'satisfaccion', type: 'enum', label: 'Satisfacción con la atención',
      options: ['', 'Muy satisfecho', 'Satisfecho', 'Insatisfecho'] });
  }

  // Dónde se ve cada cosa
  const sobre = (nombres: string[]) => [{ label: '', rows: nombres.map(n => [{ name: n }, false]) }];
  await ajustarDiseno(api, 'CCuota', 'detail', 'estado', () => sobre(['name', 'poliza', 'importe', 'vencimiento', 'estado']));
  await ajustarDiseno(api, 'CCuota', 'detailSmall', 'estado', () => sobre(['name', 'importe', 'vencimiento', 'estado']));
  await ajustarDiseno(api, 'CCuota', 'list', 'estado', () => [{ name: 'name', link: true }, { name: 'poliza' },
    { name: 'importe' }, { name: 'vencimiento' }, { name: 'estado' }]);
  await ajustarDiseno(api, 'CCuota', 'filters', 'estado', () => ['estado', 'vencimiento', 'poliza']);
  await ajustarDiseno(api, 'CPoliza', 'detail', 'formaPago', d => {
    d[0].rows.push([{ name: 'formaPago' }, { name: 'oportunidad' }]);
    return d;
  });
  await ajustarDiseno(api, 'CPoliza', 'bottomPanelsDetail', 'cuotas', d => ({ ...d, cuotas: { index: 1 } }));
  await ajustarDiseno(api, 'Opportunity', 'bottomPanelsDetail', 'cPolizas', d => ({ ...d, cPolizas: { index: 6 } }));
  await ajustarDiseno(api, 'Case', 'detail', 'cSatisfaccion', d => {
    d[0].rows.splice(d[0].rows.length - 2, 0, [{ name: 'cSatisfaccion' }, false]);
    return d;
  });
  await ajustarDiseno(api, 'Case', 'list', 'cSatisfaccion', d => [...d, { name: 'cSatisfaccion', width: 14 }]);
  // El panel de reclamos de la ficha del asegurado usa su propio diseño de columnas
  await ajustarDiseno(api, 'Case', 'listForContact', 'cSatisfaccion', d => [...d, { name: 'cSatisfaccion', width: 20 }]);
  await ajustarDiseno(api, 'Case', 'filters', 'cSatisfaccion', d => [...d, 'cSatisfaccion']);

  // Las cuentas de A.11.3: el sistema central con su rol de edición y el operador del CRM con
  // los campos que administra el central en solo lectura
  const lectura = { read: 'yes', edit: 'no' };
  const roles = (await listar(api, 'Role', { maxSize: 100 })).list;
  const rol = async (nombre: string, data: object, fieldData: object) => {
    const cuerpo = { name: nombre, data, fieldData, assignmentPermission: 'no', userPermission: 'no' };
    const id = roles.find((r: any) => r.name === nombre)?.id;
    if (id) { await api.put(`Role/${id}`, { data: cuerpo }); return id as string; }
    return crear(api, 'Role', cuerpo);
  };
  const TODO = { create: 'yes', read: 'all', edit: 'all', delete: 'no', stream: 'all' };
  const SOLO_LEER = { create: 'no', read: 'all', edit: 'no', delete: 'no', stream: 'all' };
  const rolCentral = await rol('Sistema central', { CPoliza: TODO, Contact: SOLO_LEER }, {});
  const rolOperador = await rol('Operador del CRM',
    { CPoliza: { create: 'no', read: 'all', edit: 'all', delete: 'no', stream: 'all' }, Contact: SOLO_LEER },
    { CPoliza: { name: lectura, prima: lectura, estadoPago: lectura, vigenciaDesde: lectura, vigenciaHasta: lectura } });
  const usuarios = (await listar(api, 'User', { maxSize: 200 })).list;
  const operador = usuarios.find((u: any) => u.userName === OPERADOR.userName);
  if (operador) await api.put(`User/${operador.id}`, { data: { rolesIds: [rolOperador], password: OPERADOR.clave } });
  else await crear(api, 'User', { userName: OPERADOR.userName, firstName: 'Operador', lastName: 'CRM',
    password: OPERADOR.clave, type: 'regular', rolesIds: [rolOperador] });
  const { list: central } = await listar(api, 'User', { maxSize: 5, 'where[0][type]': 'equals',
    'where[0][attribute]': 'userName', 'where[0][value]': 'integracion-central' });
  if (central[0]) await api.put(`User/${central[0].id}`, { data: { rolesIds: [rolCentral] } });
  else await crear(api, 'User', { userName: 'integracion-central', type: 'api', authMethod: 'ApiKey', isActive: true, rolesIds: [rolCentral] });

  // La ficha del asegurado conserva sus paneles de actividad e historial
  const paneles = await (await api.get('Contact/layout/bottomPanelsDetail')).json();
  if (paneles.history?.disabled || paneles.activities?.disabled) {
    delete paneles.history?.disabled; delete paneles.activities?.disabled;
    await api.put('Contact/layout/bottomPanelsDetail', { data: paneles });
  }
});

test.afterAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  await limpiar(await apiEspo());
});

// ── A.11.1 ───────────────────────────────────────────────────────────────────
test('A.11.1 — Emisión de la póliza al cerrar la venta', async ({ page, browser }, info) => {
  // «Marcar ganada una oportunidad y obtener la póliza vinculada al asegurado con
  //  los datos de la oportunidad, sin volver a cargarlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  const api = await apiEspo();
  const contactoId = await crear(api, 'Contact',
    { firstName: 'Rodolfo', lastName: 'Sandoval', emailAddress: 'rsandoval@ejemplo.test', phoneNumber: '+54 11 4555-3001' });
  const productor = (await listar(api, 'User', { maxSize: 200 })).list.find((u: any) => u.userName === 'pgomez');
  const nuevaOportunidad = (nombre: string) => crear(api, 'Opportunity', {
    name: nombre, amount: 132500, amountCurrency: 'ARS', stage: 'Negotiation', closeDate: iso(10),
    contactsIds: [contactoId], assignedUserId: productor.id,
  });
  const NOMBRE = 'Seguro de hogar — Sandoval';
  const oportunidadId = await nuevaOportunidad(NOMBRE);
  const polizasDe = async (id: string) => (await listar(api, 'CPoliza', { maxSize: 50, 'where[0][type]': 'equals',
    'where[0][attribute]': 'oportunidadId', 'where[0][value]': id })).list;

  // Control: sin la regla, ganar una oportunidad no deja ninguna póliza
  const control = await nuevaOportunidad('Seguro de hogar — Sandoval (control)');
  await api.put(`Opportunity/${control}`, { data: { stage: 'Closed Won' } });
  const sinRegla = (await polizasDe(control)).length;

  await entrar(page, plataforma);
  const GUION = [
    "ifThen(entity\\isAttributeChanged('stage') && stage == 'Closed Won',",
    "  record\\create('CPoliza',",
    "    'name', string\\concatenate('POL-', name),",
    "    'prima', amount,",
    "    'primaCurrency', amountCurrency,",
    "    'titularId', record\\findRelatedOne('Opportunity', id, 'contacts'),",
    "    'oportunidadId', id,",
    "    'assignedUserId', assignedUserId,",
    "    'vigenciaDesde', closeDate,",
    "    'estadoPago', 'Al dia'",
    '  )',
    ');',
  ].join('\n');

  try {
    await escribirGuion(page, 'Opportunity', 'beforeSaveCustomScript', GUION);
    const capGuion = await capturar(page, 'A.11.1', plataforma, '1-guion');
    await guardarGuion(page);

    // Se marca ganada desde la ficha, como lo haría el usuario
    await edicion(page, 'Opportunity', oportunidadId);
    await page.locator('.field[data-name="stage"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await elegirLista(page, 'stage', 'Closed Won');
    await page.getByRole('button', { name: /^Guardar$/ }).first().click();
    await page.waitForTimeout(5000);

    await ficha(page, 'Opportunity', oportunidadId);
    const panel = page.locator('.panel[data-name="cPolizas"]').first();
    await panel.waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(3000);
    const enPanel = await panel.innerText();
    const capOportunidad = await capturar(page, 'A.11.1', plataforma, '2-oportunidad-con-su-poliza');

    await panel.locator('a[href^="#CPoliza/view/"]').first().click();
    await page.waitForFunction(() => location.hash.startsWith('#CPoliza/view/'), undefined, { timeout: 30_000 });
    await page.waitForTimeout(4000);
    const capPoliza = await capturar(page, 'A.11.1', plataforma, '3-poliza-emitida');

    await ficha(page, 'Contact', contactoId);
    await page.locator('.panel[data-name="cPolizas"]').first().waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(3000);
    const capAsegurado = await capturar(page, 'A.11.1', plataforma, '4-ficha-del-asegurado');
    const enAsegurado = await page.locator('.panel[data-name="cPolizas"]').first().innerText();

    const emitidas = await polizasDe(oportunidadId);
    const poliza = emitidas[0] ? await (await api.get(`CPoliza/${emitidas[0].id}`)).json() : {};
    // Guardar de nuevo la oportunidad no emite otra póliza
    await api.put(`Opportunity/${oportunidadId}`, { data: { description: 'Cliente confirma domicilio de riesgo' } });
    const trasGuardar = (await polizasDe(oportunidadId)).length;

    const fuentes = [
      await citar(browser, { url: 'https://docs.espocrm.com/administration/workflows/',
        buscar: 'The system will create a new record of any entity type', captura: 'A-11-1-espocrm-5-flujos-crear-registro' }),
      ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-11-1-espocrm'),
      ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-11-1-espocrm-nube'),
    ];

    expect(sinRegla, 'sin la regla, ganar la oportunidad no debe emitir nada').toBe(0);
    expect(emitidas.length, 'al marcarla ganada debe quedar una póliza').toBe(1);
    expect(poliza.titularId, 'la póliza debe quedar ligada al asegurado').toBe(contactoId);
    expect(Number(poliza.prima), 'la prima es el importe de la oportunidad').toBe(132500);
    expect(poliza.name).toBe(`POL-${NOMBRE}`);
    expect(poliza.vigenciaDesde, 'la vigencia arranca en la fecha de cierre').toBe(iso(10));
    expect(poliza.assignedUserId).toBe(productor.id);
    expect(enPanel, 'la oportunidad debe mostrar su póliza').toContain(`POL-${NOMBRE}`);
    expect(enAsegurado, 'la ficha del asegurado debe mostrar su póliza').toContain(`POL-${NOMBRE}`);
    expect(trasGuardar, 'guardar otra vez no debe emitir otra póliza').toBe(1);

    registrar({
      criterio: 'A.11.1',
      plataforma,
      cumple: 1,
      reparo: 'codigo',
      costo: 2,
      resumen:
        'No emite la póliza al ganar una oportunidad: código escrito en el sistema la crea con los datos ' +
        'negociados, ligada al asegurado y a la oportunidad.',
      comoLoHace:
        'Ganar la oportunidad no emite nada por sí solo: el producto trae la conversión del solicitante en ' +
        'asegurado y oportunidad, y de ahí en adelante la póliza se carga aparte. La emisión se resuelve ' +
        'con un guion en la fórmula de la entidad Oportunidad (Administración › Entidades › Oportunidad › ' +
        'Fórmula) que, cuando la etapa pasa a «Cerrada ganada», crea la póliza con el nombre, el importe ' +
        'como prima, la fecha de cierre como inicio de vigencia y el responsable de la oportunidad, y la ' +
        'liga al asegurado y a la oportunidad de origen. Al marcar ganada la oportunidad desde la ficha, la ' +
        'póliza aparece sola en el panel de pólizas de la oportunidad y en la ficha del asegurado.',
      caracteristicas:
        'La póliza nace vinculada al asegurado y a la oportunidad que la originó, con la prima tomada del importe ' +
        'negociado y sin volver a escribir ningún dato. El guion corre solo cuando la etapa cambia a ganada: ' +
        'guardar otra vez la oportunidad no emite una segunda póliza. Necesita definir antes la relación entre ' +
        'póliza y oportunidad y ubicarla en las pantallas. El ramo y el número definitivo no figuran en la ' +
        'oportunidad: la póliza nace con el ramo que la lista propone por defecto y con el nombre de la venta ' +
        'como número, hasta que se completen o los traiga el sistema central.',
      justificacion:
        'La póliza se emite sola al ganar la oportunidad, pero solo con código escrito en el sistema: el ' +
        'producto no lo resuelve sin programar. Ese código usa funciones del sistema —crear un registro, buscar el ' +
        'asegurado relacionado— y alguien tiene que mantenerlo cuando cambie el modelo de la póliza.',
      evidencia: [capGuion, capOportunidad, capPoliza, capAsegurado],
      documentacion: fuentes,
      medicion: `Póliza ${poliza.name} con prima ${poliza.prima} ${poliza.primaCurrency}, titular y oportunidad de origen`,
      conPlan: [
        conPlanDe(ESPOCRM_ADVANCED_PACK, {
          cumple: 2, costo: 1,
          justificacion:
            'Los flujos de trabajo de la extensión incluyen la acción «Crear registro» de cualquier entidad al ' +
            'cambiar un campo, de modo que la misma regla se arma desde pantallas, sin escribir el guion.',
        }),
        conPlanDe(ESPOCRM_CLOUD_BASIC, {
          cumple: 2, costo: 1,
          justificacion: 'El servicio en la nube trae las extensiones del fabricante, con los mismos flujos de trabajo.',
        }),
      ],
    });
  } finally {
    // La regla es parte de la medición: se quita para no alterar las oportunidades de los demás criterios
    try {
      await escribirGuion(page, 'Opportunity', 'beforeSaveCustomScript', '');
      await guardarGuion(page);
    } catch (e) {
      console.log(`    no se pudo quitar la regla de Oportunidad: ${(e as Error).message.split('\n')[0]}`);
    }
  }
});

// ── A.11.2 ───────────────────────────────────────────────────────────────────
test('A.11.2 — Plan de pago de la prima', async ({ page }, info) => {
  // «Registrar la forma de pago y las cuotas de una póliza, cada una con
  //  vencimiento y estado, y obtener el listado de cuotas impagas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  const api = await apiEspo();
  const titularId = await crear(api, 'Contact',
    { firstName: 'Graciela', lastName: 'Villalba', emailAddress: 'gvillalba@ejemplo.test', phoneNumber: '+54 11 4555-3002' });
  const polizaId = await crear(api, 'CPoliza',
    { name: 'POL-A12-0002', tipoPoliza: 'Hogar', prima: 90000, primaCurrency: 'ARS', titularId, estadoPago: 'Al dia' });

  await entrar(page, plataforma);
  await edicion(page, 'CPoliza', polizaId);
  await page.locator('.field[data-name="formaPago"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'formaPago', 'Débito automático');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  // Las tres cuotas, desde el panel de cuotas de la póliza
  await ficha(page, 'CPoliza', polizaId);
  const panel = page.locator('.panel[data-name="cuotas"]').first();
  await panel.waitFor({ state: 'visible', timeout: 40_000 });
  const cuotas = [
    { nombre: 'Cuota 1 de 3', vence: -30, estado: 'Pagada' },
    { nombre: 'Cuota 2 de 3', vence: -2, estado: 'Pendiente' },
    { nombre: 'Cuota 3 de 3', vence: 28, estado: 'Pendiente' },
  ];
  for (const c of cuotas) {
    await panel.locator('[data-action="createRelated"]').first().click();
    const dialogo = page.locator('.modal-dialog:visible').first();
    await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
    await escribir(page, '.modal-dialog:visible input[data-name="name"]', c.nombre);
    await escribir(page, '.modal-dialog:visible input[data-name="importe"]', '30000');
    await escribir(page, '.modal-dialog:visible input[data-name="vencimiento"]', enDias(c.vence));
    await page.keyboard.press('Tab');
    if (c.estado !== 'Pendiente') await elegirLista(page, 'estado', c.estado, '.modal-dialog:visible');
    if (c.nombre.startsWith('Cuota 2')) await capturar(page, 'A.11.2', plataforma, '0-alta-de-una-cuota');
    await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
    await dialogo.waitFor({ state: 'hidden', timeout: 30_000 });
    await page.waitForTimeout(2500);
  }
  await ficha(page, 'CPoliza', polizaId);
  await page.locator('.panel[data-name="cuotas"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(4000);
  const capPoliza = await capturar(page, 'A.11.2', plataforma, '1-poliza-con-forma-de-pago-y-cuotas');

  // El listado de cuotas impagas: filtrado por estado
  await listadoLimpio(page, 'CCuota');
  await agregarFiltro(page, 'estado');
  await filtrarPorLista(page, 'estado', 'Pendiente');
  await aplicarFiltros(page);
  const impagas = await filasDelListado(page);
  const capImpagas = await capturar(page, 'A.11.2', plataforma, '2-cuotas-impagas');

  const guardada = await (await api.get(`CPoliza/${polizaId}`)).json();
  const enSistema = (await listar(api, 'CCuota', { maxSize: 50 })).list;

  expect(guardada.formaPago, 'la póliza debe conservar su forma de pago').toBe('Débito automático');
  expect(enSistema.length, 'las tres cuotas deben quedar registradas').toBe(3);
  expect(enSistema.every((c: any) => c.vencimiento && c.estado && c.polizaId === polizaId),
    'cada cuota debe tener vencimiento, estado y póliza').toBeTruthy();
  expect([...impagas].sort(), 'el listado debe devolver solo las cuotas pendientes').toEqual(['Cuota 2 de 3', 'Cuota 3 de 3']);

  registrar({
    criterio: 'A.11.2',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'Permite registrar las cuotas de la póliza con importe, vencimiento y estado, y su forma de pago, y ' +
      'lista las impagas; no calcula el cronograma.',
    comoLoHace:
      'El producto no trae cuotas: se crea la entidad Cuota con el Administrador de Entidades, con importe, ' +
      'vencimiento y estado (pendiente o pagada) y una relación de muchas cuotas a una póliza, y se agrega a la ' +
      'póliza un campo de lista «Forma de pago». Desde la ficha de la póliza se elige la forma de pago y su panel ' +
      'de cuotas da de alta cada cuota con su vencimiento y su estado. El listado de cuotas, filtrado por estado ' +
      'pendiente, devuelve las impagas junto a su póliza.',
    caracteristicas:
      'Cada cuota es un registro con importe y moneda, vencimiento y estado, de modo que se filtra, se ordena por ' +
      'vencimiento y se llega desde ella a la póliza. La forma de pago es una lista de valores fijos. Las cuotas ' +
      'se cargan una por una o llegan del sistema central por la interfaz de programación: el producto no arma ' +
      'el cronograma a partir de la prima y la cantidad de cuotas, ni cambia solo el estado de una cuota vencida.',
    justificacion:
      'Se resuelve configurando una vez, sin programar: la entidad, tres campos, la relación y su ubicación en ' +
      'las pantallas. Cada póliza nueva usa el mismo modelo, sin trabajo extra por póliza.',
    evidencia: [capPoliza, capImpagas],
    medicion: `Cuotas impagas devueltas: ${impagas.join(', ')}`,
  });
});

// ── A.11.3 ───────────────────────────────────────────────────────────────────
test('A.11.3 — Datos que administra el sistema central', async ({ page, browser }, info) => {
  // «Actualizar desde afuera una póliza por su número, sin que se duplique, y
  //  comprobar que los campos que administra el sistema central quedan de solo
  //  lectura para el usuario del CRM»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const NUMERO = 'POL-A12-0003';
  const admin = await apiEspo();
  const titularId = await crear(admin, 'Contact',
    { firstName: 'Hugo', lastName: 'Paredes', emailAddress: 'hparedes@ejemplo.test', phoneNumber: '+54 11 4555-3003' });
  const polizaId = await crear(admin, 'CPoliza', { name: NUMERO, tipoPoliza: 'Automotor', prima: 50000,
    primaCurrency: 'ARS', titularId, estadoPago: 'Al dia', vigenciaHasta: iso(200) });

  // El sistema central: habla con la clave de su usuario de integración
  const { list: [integracion] } = await listar(admin, 'User', { maxSize: 5, 'where[0][type]': 'equals',
    'where[0][attribute]': 'userName', 'where[0][value]': 'integracion-central' });
  const clave = (await (await admin.get(`User/${integracion.id}`)).json()).apiKey;
  const externo = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { 'X-Api-Key': clave, 'Content-Type': 'application/json' } });
  const porNumero = async (n: string) => (await listar(externo, 'CPoliza', { maxSize: 10, 'where[0][type]': 'equals',
    'where[0][attribute]': 'name', 'where[0][value]': n })).list;

  const [existente] = await porNumero(NUMERO);
  const primera = await externo.put(`CPoliza/${existente.id}`,
    { data: { prima: 61500.5, estadoPago: 'Vencida', vigenciaHasta: iso(365) } });
  const [existente2] = await porNumero(NUMERO);
  const segunda = await externo.put(`CPoliza/${existente2.id}`, { data: { estadoPago: 'Al dia', vigenciaHasta: iso(400) } });
  const trasActualizar = (await porNumero(NUMERO)).length;
  const final = await (await admin.get(`CPoliza/${polizaId}`)).json();

  // Un alta repetida del mismo número no la frena el producto
  const repetida = await externo.post('CPoliza', { data: { name: NUMERO, tipoPoliza: 'Automotor' } });
  const trasAltaRepetida = (await porNumero(NUMERO)).length;
  for (const p of await porNumero(NUMERO)) if (p.id !== polizaId) await admin.delete(`CPoliza/${p.id}`);

  // Lo que ve el usuario del CRM: primero el rol, con el administrador
  await entrar(page, plataforma);
  const rolOperador = (await listar(admin, 'Role', { maxSize: 100 })).list.find((r: any) => r.name === 'Operador del CRM');
  await administracion(page, '#Admin/roles', `#Role/view/${rolOperador.id}`);
  await page.waitForTimeout(5000);
  const capRol = await capturar(page, 'A.11.3', plataforma, '1-rol-con-campos-de-solo-lectura');

  // Y después, con la cuenta del operador: el formulario de edición no ofrece los campos del central
  await page.context().clearCookies();
  await entrarComo(page, OPERADOR.userName, OPERADOR.clave);
  await edicion(page, 'CPoliza', polizaId);
  await page.locator('.field[data-name="tipoPoliza"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(3000);
  const editable = (campo: string) => page.locator(
    `.field[data-name="${campo}"] input, .field[data-name="${campo}"] .selectize-input, .field[data-name="${campo}"] select, .field[data-name="${campo}"] textarea`).count();
  const controles = {
    tipoPoliza: await editable('tipoPoliza'), prima: await editable('prima'), estadoPago: await editable('estadoPago'),
    vigenciaHasta: await editable('vigenciaHasta'), name: await editable('name'),
  };
  const pantalla = await textoDe(page);
  const capOperador = await capturar(page, 'A.11.3', plataforma, '2-edicion-del-operador');

  // Lo guardado no cambió por haberlo abierto
  const intento = await apiEspo(OPERADOR.userName, OPERADOR.clave);
  await intento.put(`CPoliza/${polizaId}`, { data: { prima: 1, estadoPago: 'Vencida' } });
  const trasIntento = await (await admin.get(`CPoliza/${polizaId}`)).json();

  const fuentes = [
    await citar(browser, { url: 'https://docs.espocrm.com/administration/roles-management/',
      buscar: 'You can restrict access to specific fields', captura: 'A-11-3-espocrm-3-seguridad-por-campo' }),
    await citar(browser, { url: 'https://docs.espocrm.com/administration/import/',
      buscar: 'records with matching field values are found', captura: 'A-11-3-espocrm-4-importar-y-actualizar' }),
  ];

  expect(primera.ok() && segunda.ok(), 'el sistema central debe poder actualizar la póliza').toBeTruthy();
  expect(trasActualizar, 'actualizar por número no debe duplicar la póliza').toBe(1);
  expect(Number(final.prima)).toBe(61500.5);
  expect(final.estadoPago).toBe('Al dia');
  expect(final.vigenciaHasta).toBe(iso(400));
  expect(repetida.ok() && trasAltaRepetida, 'un alta repetida del número crea otra póliza').toBe(2);
  expect(controles.tipoPoliza, 'el campo del CRM debe poder editarse').toBeGreaterThan(0);
  expect(controles.prima + controles.estadoPago + controles.vigenciaHasta + controles.name,
    'los campos del sistema central no deben ofrecerse para editar').toBe(0);
  expect(pantalla).toMatch(/61[.,]500/);
  expect(Number(trasIntento.prima), 'el valor del sistema central no cambia desde el CRM').toBe(61500.5);
  expect(trasIntento.estadoPago).toBe('Al dia');

  registrar({
    criterio: 'A.11.3',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'Un sistema central actualiza la póliza por su número sin duplicarla, y un rol deja esos campos en ' +
      'solo lectura para el operador; no exige unicidad del número.',
    comoLoHace:
      'El sistema central usa un usuario de integración propio (Administración › Usuarios de API), con su ' +
      'clave y un rol con permiso de edición sobre la póliza. Busca la póliza por su número —una consulta ' +
      'con condición sobre el nombre— y la actualiza por el identificador que recibe: actualiza prima, ' +
      'estado de cobranza y vigencia, y si repite el envío sigue habiendo una sola póliza con ese número. ' +
      'Para los usuarios del CRM, un rol con seguridad por campo deja número, prima, estado de cobranza y ' +
      'vigencia en solo lectura: el operador, al abrir la edición de la póliza, ve los valores que mandó el ' +
      'central y el formulario solo ofrece editar los campos propios del CRM, como el ramo.',
    caracteristicas:
      'La seguridad por campo es del rol, de modo que el mismo campo se edita para el usuario de integración y se ' +
      'bloquea para el operador; el bloqueo se mantuvo también ante un intento de cambio del operador por la ' +
      'interfaz de programación. La actualización no es una operación única por clave: quien envía busca por ' +
      'número y decide, y un alta repetida del mismo número crea una segunda póliza, porque el producto no exige ' +
      'unicidad. La importación desde planilla sí ofrece «Crear y actualizar» con coincidencia por un campo, ' +
      'como el número.',
    justificacion:
      'El central actualiza sin duplicar y el operador no puede modificar lo que el central administra. ' +
      'Configurar un usuario de integración, dos roles y marcar los campos en el rol se hace todo desde la ' +
      'administración y sin programar. Buscar antes de actualizar es parte del cliente de integración, como en ' +
      'cualquier interfaz que no ofrezca alta-o-actualización por clave.',
    evidencia: [capRol, capOperador],
    documentacion: fuentes,
    medicion: `Pólizas con el número ${NUMERO} tras dos actualizaciones: ${trasActualizar}; tras un alta repetida: ${trasAltaRepetida}`,
  });
});

// ── A.11.4 ───────────────────────────────────────────────────────────────────
test('A.11.4 — Continuidad del historial del solicitante al asegurado', async ({ page }, info) => {
  // «Registrar una llamada sobre un solicitante, convertirlo y emitirle la
  //  póliza, y comprobar que la llamada figura en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  const api = await apiEspo();
  const solicitanteId = await crear(api, 'Lead', { firstName: 'Marcelo', lastName: 'Cardozo',
    emailAddress: 'mcardozo@ejemplo.test', phoneNumber: '+54 11 4555-3004', addressCity: 'Rosario' });
  const LLAMADA = 'Consulta por seguro de hogar';

  await entrar(page, plataforma);

  // La llamada, desde el historial de la ficha del solicitante
  await ficha(page, 'Lead', solicitanteId);
  const historial = page.locator('.panel[data-name="history"]').first();
  await historial.waitFor({ state: 'visible', timeout: 40_000 });
  const registrarLlamada = historial.locator('[data-action="createActivity"][data-link="calls"]').first();
  if (!(await registrarLlamada.isVisible().catch(() => false))) await historial.locator('.dropdown-toggle').first().click();
  await registrarLlamada.click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  const nombre = dialogo.locator('input[data-name="name"]').first();
  await nombre.clear();
  await nombre.pressSequentially(LLAMADA, { delay: 30 });
  const capLlamada = await capturar(page, 'A.11.4', plataforma, '1-llamada-al-solicitante');
  await dialogo.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  // Convertirlo en asegurado
  await ficha(page, 'Lead', solicitanteId);
  await page.locator('[data-action="convert"]').first().waitFor({ state: 'attached', timeout: 40_000 });
  await clicEnAccion(page, page.locator('[data-action="convert"]').first());
  await page.locator('input.check-scope[data-scope="Contact"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('input.check-scope[data-scope="Contact"]').first().check();
  await page.waitForTimeout(1500);
  await page.locator('button[data-action="convert"]').first().click();
  await page.waitForFunction(d => location.hash === d, `#Lead/view/${solicitanteId}`, { timeout: 90_000 });
  await page.waitForTimeout(2000);
  const aseguradoId = (await (await api.get(`Lead/${solicitanteId}`)).json()).createdContactId as string;

  // Emitirle la póliza, desde el formulario
  await alta(page, 'CPoliza');
  await escribir(page, '.field[data-name="name"] input[data-name="name"]', 'POL-A12-0004');
  await elegirLista(page, 'tipoPoliza', 'Hogar');
  await vincular(page, '.field[data-name="titular"] input[data-name="titularName"]', 'Cardozo');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForFunction(() => /^#CPoliza\/view\//.test(location.hash), undefined, { timeout: 30_000 });
  await page.waitForTimeout(3000);

  // La ficha del asegurado
  await ficha(page, 'Contact', aseguradoId);
  const hist = page.locator('.panel[data-name="history"]').first();
  await hist.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(5000);
  const enHistorial = await hist.innerText();
  const enPolizas = await page.locator('.panel[data-name="cPolizas"]').first().innerText().catch(() => '');
  const capAsegurado = await capturar(page, 'A.11.4', plataforma, '2-ficha-del-asegurado');

  const llamadaId = (await listar(api, 'Call', { maxSize: 100 })).list
    .find((c: any) => c.name === LLAMADA && (c.parentId === solicitanteId || c.parentId === aseguradoId))?.id;
  const llamada = await (await api.get(`Call/${llamadaId}`)).json();
  const alAsegurado = llamada.parentId === aseguradoId || (llamada.contactsIds ?? []).includes(aseguradoId);
  const ligadaA = llamada.parentId === solicitanteId ? 'al solicitante' : 'al asegurado';
  console.log(`    la llamada queda ligada a ${ligadaA} (${llamada.parentType}); contactos: ${JSON.stringify(llamada.contactsIds)}`);

  expect(enHistorial, 'la llamada del solicitante debe figurar en la ficha del asegurado').toContain(LLAMADA);
  expect(enPolizas, 'la ficha del asegurado debe mostrar la póliza emitida').toContain('POL-A12-0004');

  registrar({
    criterio: 'A.11.4',
    plataforma,
    cumple: 2,
    costo: 0,
    resumen:
      'El historial reúne llamadas, reuniones y correos desde el primer contacto: la llamada al solicitante ' +
      'sigue en la ficha del asegurado tras convertirlo, sin copiarla a mano.',
    comoLoHace:
      'La llamada se registra desde el panel Historial de la ficha del solicitante. Al convertir al ' +
      'solicitante en asegurado, el sistema crea la ficha del asegurado, y la póliza se emite desde su ' +
      'formulario. La ficha del asegurado muestra, en su Historial, la llamada hecha antes de que fuera ' +
      'cliente, y en su panel de pólizas la póliza emitida.',
    caracteristicas:
      'El historial reúne llamadas, reuniones y correos en orden cronológico. La llamada es un único registro, ' +
      `que sigue ligado ${ligadaA}` +
      `${alAsegurado ? ' y figura además entre los contactos del asegurado' : ''}: no hay que copiar nada a ` +
      'mano. La ficha del solicitante queda marcada como convertida y conserva el vínculo con el asegurado creado.',
    justificacion:
      'Viene de fábrica: registrar la llamada, convertir y consultar el historial no requieren configurar ' +
      'nada. La póliza aparece en la ficha porque su relación con el titular ya está definida para el resto ' +
      'del catálogo (A.6.1).',
    evidencia: [capLlamada, capAsegurado],
  });
});

// ── A.11.5 ───────────────────────────────────────────────────────────────────
test('A.11.5 — Satisfacción después de la atención', async ({ page }, info) => {
  // «Al cerrar un reclamo, enviar o registrar una encuesta y comprobar que la
  //  respuesta queda en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  const api = await apiEspo();
  const aseguradoId = await crear(api, 'Contact',
    { firstName: 'Noelia', lastName: 'Arce', emailAddress: 'narce@ejemplo.test', phoneNumber: '+54 11 4555-3005' });
  const RECLAMO = 'Reclamo por rotura de cristal — Arce';
  const reclamoId = await crear(api, 'Case', { name: RECLAMO, status: 'Assigned', contactsIds: [aseguradoId], contactId: aseguradoId });

  await entrar(page, plataforma);

  // Lo que el producto ofrece de fábrica: ninguna entidad de encuestas
  await administracion(page, '#Admin/entityManager');
  await page.waitForTimeout(5000);
  const entidades = await textoDe(page);
  const capEntidades = await capturar(page, 'A.11.5', plataforma, '1-entidades-del-producto');

  // Se cierra el reclamo y se registra la respuesta del asegurado
  await edicion(page, 'Case', reclamoId);
  await page.locator('.field[data-name="status"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'status', 'Closed');
  await elegirLista(page, 'cSatisfaccion', 'Muy satisfecho');
  const capCierre = await capturar(page, 'A.11.5', plataforma, '2-cierre-con-encuesta');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(5000);

  // La ficha del asegurado
  await ficha(page, 'Contact', aseguradoId);
  const casos = page.locator('.panel[data-name="cases"]').first();
  await casos.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(4000);
  const enFicha = await casos.innerText();
  const capFicha = await capturar(page, 'A.11.5', plataforma, '3-ficha-del-asegurado');

  const guardado = await (await api.get(`Case/${reclamoId}`)).json();

  expect(entidades, 'el producto no debe traer una entidad de encuestas').not.toMatch(/encuesta|survey/i);
  expect(guardado.status).toBe('Closed');
  expect(guardado.cSatisfaccion).toBe('Muy satisfecho');
  expect(enFicha, 'la respuesta debe verse en la ficha del asegurado').toContain('Muy satisfecho');
  expect(enFicha).toContain(RECLAMO);

  registrar({
    criterio: 'A.11.5',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen: 'Registra la satisfacción del asegurado al cerrar un reclamo en un campo de lista propio, visible en su ficha; la respuesta se carga a mano, porque el sistema no envía la encuesta.',
    comoLoHace:
      'El producto no trae encuestas: entre sus entidades no figura ninguna. Se agrega al reclamo un campo ' +
      'de lista «Satisfacción con la atención» con el Administrador de Campos y se lo ubica en el ' +
      'formulario y en el panel de reclamos de la ficha del asegurado. Al cerrar el reclamo se registra la ' +
      'respuesta del asegurado, y la ficha del asegurado muestra su reclamo cerrado con la satisfacción ' +
      'registrada.',
    caracteristicas:
      'La respuesta es un valor de una lista cerrada —muy satisfecho, satisfecho, insatisfecho—, de modo que se ' +
      'puede filtrar y contar por reclamo. Se registra a mano al cerrar: el producto no envía la encuesta ni ' +
      'recibe la respuesta por un formulario o un enlace.',
    justificacion: 'El procedimiento pide enviar o registrar la encuesta y que la respuesta quede en la ficha del asegurado: se registra en un campo configurado una vez, sin programar, y queda en la ficha.',
    evidencia: [capEntidades, capCierre, capFicha],
    medicion: `Reclamo cerrado con satisfacción «${guardado.cSatisfaccion}» visible en la ficha del asegurado`,
  });
});
