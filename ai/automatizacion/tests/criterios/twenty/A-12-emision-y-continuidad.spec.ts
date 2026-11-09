import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  apiTwenty, objeto, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, elegirEnFicha, clicReal,
  esperarCarga, textoDe, nuevoCampo, conOpciones, quitarCampo, nuevoRegistro, nuevaPersona, fechaEnFicha,
  escribirEnFicha, campoEnFicha, valorEnFicha, entrarComo, configuracion, pestana, BASE,
} from '../../twenty/ui';
import {
  nuevoFlujo, ponerDisparador, elegirObjeto, agregarPaso, abrirVariables, elegirVariable, botonDelFlujo, enPanel,
  ETIQUETA_OBJETO,
} from '../../twenty/flujos';
import { cargarCartera, alistarReclamo, relacion, PRODUCTOR } from '../../twenty/escenario';
import { EMAIL, PASS } from '../../twenty/helper';

const opciones = (etiquetas: string[]) => etiquetas.map((label, position) => ({
  label, position, color: ['green', 'turquoise', 'sky', 'blue', 'purple', 'pink'][position % 6],
  value: label.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\W+/g, '_').replace(/^(\d)/, 'P$1'),
}));

/** Un campo en un objeto, si todavía no existe: preparación del escenario, no veredicto. */
async function campoApi(api: any, singular: string, datos: { name: string; label: string; type: string; [k: string]: any }) {
  const o = await objeto(api, singular);
  if (o.fields.some((c: any) => c.name === datos.name)) return;
  const r = await api.post('metadata/fields', { data: { objectMetadataId: o.id, icon: 'IconTag', ...datos } });
  if (!r.ok()) throw new Error(`No se pudo crear el campo ${datos.label}: ${r.status()} ${await r.text()}`);
}

/** Un objeto propio, si todavía no existe: preparación del escenario, no veredicto. */
async function objetoApi(api: any, singular: string, plural: string, etiqueta: string, etiquetaPlural: string, icono: string) {
  if (await objeto(api, singular)) return;
  const r = await api.post('metadata/objects', { data: {
    nameSingular: singular, namePlural: plural, labelSingular: etiqueta, labelPlural: etiquetaPlural, description: etiqueta, icon: icono,
  } });
  if (!r.ok()) throw new Error(`No se pudo crear el objeto ${etiqueta}: ${r.status()} ${await r.text()}`);
}

const ddmmaaaa = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const isoEnDias = (n: number) => new Date(Date.now() + n * 86_400_000).toLocaleDateString('sv-SE');

/**
 * A.12 — Emisión, cobranza y continuidad de la relación, sobre Twenty
 *
 * Se reutiliza el modelo de los grupos anteriores: la póliza como objeto
 * propio, los asegurados como personas y la venta en las oportunidades.
 */

test.describe.configure({ mode: 'serial' });

const FLUJO_EMISION = 'Emisión de la póliza al ganar la venta';

/** Apaga un flujo desde su ficha: corre con cada alta de las demás pruebas si queda activo. */
async function apagarFlujo(page: Page, api: any, nombre: string) {
  const flujo = (await registros(api, 'workflows')).find(w => w.name === nombre);
  if (!flujo) return;
  await abrirFicha(page, 'workflow', flujo.id);
  await esperarCarga(page, 6000);
  await botonDelFlujo(page, /^Deactivate$|^Desactivar$/).catch(() => {});
}

// ── A.12.1 ───────────────────────────────────────────────────────────────────
test('A.12.1 — Emisión de la póliza al cerrar la venta', async ({ page, browser }, info) => {
  // «Marcar ganada una oportunidad y obtener la póliza vinculada al asegurado
  //  con los datos de la oportunidad, sin volver a cargarlos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  const VENTA = 'Seguro de hogar — Emisión Quiroga';
  const PRIMA = 48_000;
  for (const w of (await registros(api, 'workflows')).filter(w => w.name === FLUJO_EMISION)) await borrarRegistro(api, 'workflows', w.id);
  for (const p of (await registros(api, 'polizas')).filter(p => p.name === VENTA)) await borrarRegistro(api, 'polizas', p.id);
  for (const o of (await registros(api, 'opportunities')).filter(o => o.name === VENTA)) await borrarRegistro(api, 'opportunities', o.id);

  const opp = await objeto(api, 'opportunity');
  const etapa = opp.fields.find((c: any) => c.name === 'stage');
  const etapas = [...etapa.options].sort((a: any, b: any) => a.position - b.position);
  const ganada = etapas.find((o: any) => /customer|cliente|gan|won/i.test(o.label + o.value));
  if (!ganada) throw new Error('La lista de etapas no trae una etapa de venta ganada');
  const poliza = await objeto(api, 'poliza');
  const etiquetaNombre: string = poliza.fields.find((c: any) => c.name === 'name').label;
  const asegurado = e.asegurados[3];

  // La venta negociada: una oportunidad con su contacto y su monto, en una etapa intermedia
  const oportunidad = await crearRegistro(api, 'opportunities', {
    name: VENTA, stage: etapas[1].value, pointOfContactId: asegurado,
    amount: { amountMicros: PRIMA * 1_000_000, currencyCode: 'ARS' },
  });

  // Twenty no emite la póliza por su cuenta: se arma con un flujo que escucha la etapa de la oportunidad
  await nuevoFlujo(page, FLUJO_EMISION);
  await ponerDisparador(page, 'Record is updated', ETIQUETA_OBJETO);
  await elegirObjeto(page, 'Opportunities');
  const campoDelFiltro = page.getByText(/^Seleccionar un campo$|^Select a field$/).filter({ visible: true });
  for (let intento = 0; intento < 3 && !(await campoDelFiltro.first().isVisible().catch(() => false)); intento++) {
    await page.waitForTimeout(2500);
    await clicReal(page, await enPanel(page, page.getByText(/^Añadir primer filtro$|^Add first filter$/).filter({ visible: true })));
    await page.waitForTimeout(2000);
  }
  await clicReal(page, campoDelFiltro.last());
  await page.keyboard.type(etapa.label, { delay: 60 });
  await clicReal(page, page.getByText(etapa.label, { exact: true }).last());
  await page.waitForTimeout(1200);
  const condicion = page.getByText(/^Condiciones$|^Conditions$/).last().locator('xpath=following::*[normalize-space(text())="Editar" or normalize-space(text())="Edit"][1]');
  await clicReal(page, condicion);
  await clicReal(page, page.getByText(ganada.label, { exact: true }).last());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const capDisparador = await capturar(page, 'A.12.1', plataforma, '1-evento-y-condicion');

  await agregarPaso(page, 'Create Record');
  await elegirObjeto(page, 'Pólizas');
  await abrirVariables(page, etiquetaNombre);
  await elegirVariable(page, 'Name');
  await abrirVariables(page, 'Titular');
  await elegirVariable(page, /^Point of Contact Id/i);
  await abrirVariables(page, 'Importe en micros');
  await elegirVariable(page, 'Amount', 'Amount Micros');
  await abrirVariables(page, 'Código de moneda');
  await elegirVariable(page, 'Amount', 'Currency Code');
  await page.waitForTimeout(2500);
  const capCampos = await capturar(page, 'A.12.1', plataforma, '2-datos-que-pasan-a-la-poliza');
  await botonDelFlujo(page, /^Activate$|^Activar$/);

  let emitida: any, capPoliza = '', capFicha = '';
  try {
    // Se marca ganada la oportunidad desde su ficha, como lo hace el productor al cerrar la venta
    await abrirFicha(page, 'opportunity', oportunidad.id);
    await elegirEnFicha(page, 'stage', ganada.label);
    for (let espera = 0; espera < 36 && !emitida; espera++) {
      await page.waitForTimeout(5000);
      emitida = (await registros(api, 'polizas')).find(p => p.name === VENTA);
    }
    await page.waitForTimeout(3000);
    emitida = (await registros(api, 'polizas')).find(p => p.name === VENTA) ?? emitida;
    await abrirFicha(page, 'poliza', emitida.id);
    capPoliza = await capturar(page, 'A.12.1', plataforma, '3-poliza-emitida');
    await abrirFicha(page, 'person', asegurado);
    capFicha = await capturar(page, 'A.12.1', plataforma, '4-poliza-en-la-ficha-del-asegurado');
  } finally {
    await apagarFlujo(page, api, FLUJO_EMISION);
  }
  const prima = emitida?.prima?.amountMicros ?? null;
  console.log(`    póliza emitida: ${emitida?.name} · titular ${emitida?.titularId} · prima ${prima}`);

  expect(emitida, 'al ganar la venta debe aparecer la póliza').toBeTruthy();
  expect(emitida.titularId, 'la póliza debe quedar vinculada al asegurado').toBe(asegurado);

  const llevaMonto = Number(prima) === PRIMA * 1_000_000;
  registrar({
    criterio: 'A.12.1',
    plataforma,
    cumple: llevaMonto ? 2 : 1,
    costo: 1,
    resumen: llevaMonto
      ? 'Al pasar una oportunidad a la etapa de venta ganada, un flujo emite solo la póliza, ' +
        'ligada al asegurado y con la prima de la oportunidad.'
      : 'Al pasar una oportunidad a la etapa de venta ganada, un flujo emite solo la póliza, ' +
        'ligada al asegurado, pero la prima queda vacía y se carga en cada venta.',
    comoLoHace: `Un flujo de trabajo se dispara al actualizarse una oportunidad, filtra por la etapa «${ganada.label}» y crea un registro de Pólizas con el nombre de la oportunidad, el asegurado como titular${llevaMonto ? ' y el monto como prima' : ''}, tomados con el selector de variables. Al pasar la oportunidad a esa etapa desde su ficha, la póliza aparece vinculada al asegurado y se ve en su ficha${llevaMonto ? ', con la prima de la oportunidad' : '; la prima quedó vacía y hay que cargarla'}.`,
    caracteristicas: llevaMonto
      ? 'Disparador por actualización de registro con condición sobre la etapa; paso «Crear registro» sobre el objeto propio de pólizas; variables del registro disparador para no recargar datos —el importe de la prima se arma con dos variables, el monto en micros y el código de moneda de la oportunidad—; la póliza queda en la ficha del asegurado.'
      : 'Disparador por actualización de registro con condición sobre la etapa; paso «Crear registro» sobre el objeto propio de pólizas; variables del registro disparador para no recargar datos; la póliza queda en la ficha del asegurado.',
    justificacion: llevaMonto
      ? 'El flujo se arma una sola vez y cada venta ganada emite la póliza con sus datos sin intervención. Configurar el flujo y el objeto de pólizas es trabajo de configuración, sin desarrollo.'
      : 'La póliza se emite sola y vinculada al asegurado, pero el monto negociado no pasó a la prima y se carga en cada venta. Configurar el flujo y el objeto de pólizas es configuración, sin desarrollo.',
    evidencia: [capDisparador, capCampos, capPoliza, capFicha],
  });
});

// ── A.12.2 ───────────────────────────────────────────────────────────────────
const FORMAS_DE_PAGO = ['Débito automático', 'Tarjeta de crédito', 'Cupón de pago', 'Transferencia'];
const ESTADOS_CUOTA = ['Pendiente', 'Pagada', 'Impaga'];

/** La cuota: objeto propio ligado a la póliza, con vencimiento, importe y estado. */
async function alistarCuota(api: any) {
  await objetoApi(api, 'cuota', 'cuotas', 'Cuota', 'Cuotas', 'IconCash');
  await campoApi(api, 'cuota', { name: 'vencimiento', label: 'Vencimiento', type: 'DATE' });
  await campoApi(api, 'cuota', { name: 'importe', label: 'Importe', type: 'CURRENCY', defaultValue: { amountMicros: null, currencyCode: "'ARS'" } });
  await campoApi(api, 'cuota', { name: 'estado', label: 'Estado', type: 'SELECT', options: opciones(ESTADOS_CUOTA) });
  await relacion(api, 'cuota', 'poliza', 'Póliza', 'poliza', 'Cuotas');
}

test('A.12.2 — Plan de pago de la prima', async ({ page, browser }, info) => {
  // «Registrar la forma de pago y las cuotas de una póliza, cada una con
  //  vencimiento y estado, y obtener el listado de cuotas impagas»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(2_400_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  await alistarCuota(api);
  for (const c of (await registros(api, 'cuotas')).filter(c => /^CUOTA-12-2-/.test(c.name))) await borrarRegistro(api, 'cuotas', c.id);
  await quitarCampo(api, 'poliza', 'Forma de pago');

  // La forma de pago: la póliza no la trae, se agrega como campo de lista
  await nuevoCampo(page, 'polizas', 'Select', 'Forma de pago', conOpciones(FORMAS_DE_PAGO));
  const poliza = e.polizas[0];
  const forma = (await objeto(api, 'poliza')).fields.find((c: any) => c.label === 'Forma de pago').name;
  // Con el campo recién creado, la ficha a veces cae en la pantalla de error: se recarga hasta que lo muestre
  await abrirFicha(page, 'poliza', poliza.id);
  for (let intento = 0; intento < 4 && !(await valorEnFicha(page, forma).isVisible().catch(() => false)); intento++) {
    await page.waitForTimeout(4000);
    await abrirFicha(page, 'poliza', poliza.id).catch(() => {});
  }
  await elegirEnFicha(page, forma, 'Débito automático');

  // Las cuotas, una por una, desde el listado de cuotas
  const plan = [
    { dias: -60, estado: 'Pagada' }, { dias: -30, estado: 'Impaga' },
    { dias: -2, estado: 'Impaga' }, { dias: 28, estado: 'Pendiente' },
  ];
  const ids: string[] = [];
  for (const [i, c] of plan.entries()) {
    const id = await nuevoRegistro(page, 'cuotas', 'Cuota', `CUOTA-12-2-${i + 1}`);
    ids.push(id);
    await abrirFicha(page, 'cuota', id);
    await elegirEnFicha(page, 'poliza', poliza.name);
    await fechaEnFicha(page, 'vencimiento', ddmmaaaa(c.dias));
    await escribirEnFicha(page, 'importe', '12500');
    await elegirEnFicha(page, 'estado', c.estado);
  }
  await abrirFicha(page, 'poliza', poliza.id);
  const capPoliza = await capturar(page, 'A.12.2', plataforma, '1-forma-de-pago-y-cuotas-en-la-poliza');

  // El listado de impagas: el listado de cuotas filtrado por estado
  await abrirListado(page, 'cuotas');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText('Estado', { exact: true }).last());
  await page.waitForTimeout(1200);
  await clicReal(page, page.getByText('Impaga', { exact: true }).last());
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const filas = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const capImpagas = await capturar(page, 'A.12.2', plataforma, '2-cuotas-impagas');

  const guardadas = (await registros(api, 'cuotas')).filter(c => ids.includes(c.id));
  expect(guardadas.every(c => c.polizaId === poliza.id), 'cada cuota debe quedar ligada a la póliza').toBeTruthy();
  expect(guardadas.every(c => c.vencimiento && c.estado), 'cada cuota debe guardar vencimiento y estado').toBeTruthy();
  expect(filas.filter(id => id && ids.includes(id)).length, 'el listado debe traer las dos impagas').toBe(2);
  expect(filas.some(id => id === ids[0] || id === ids[3]), 'y ninguna de las otras').toBeFalsy();

  registrar({
    criterio: 'A.12.2',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'Las cuotas se modelan como objeto propio ligado a la póliza, con vencimiento, importe ' +
      'y estado; el listado de impagas sale filtrando por estado, sin desarrollo.',
    comoLoHace: 'Twenty no trae cuotas: se crea un objeto propio «Cuotas» con vencimiento, importe y estado, ligado a la póliza, y a la póliza se le agrega un campo de lista «Forma de pago». Cada cuota se carga desde el listado de cuotas y queda en la ficha de la póliza. El listado de impagas es el listado de cuotas filtrado por el estado «Impaga», que trae las dos vencidas y ninguna de las otras.',
    caracteristicas: 'Objeto propio con campos de fecha, moneda y lista; relación con la póliza que muestra las cuotas en su ficha; filtro por estado en el listado, sin desarrollo.',
    justificacion: 'La forma de pago y las cuotas se registran y el listado de impagas sale con un filtro, en cada uso, sin trabajo extra. Definir el objeto de cuotas y sus campos es configuración que se hace una sola vez.',
    evidencia: [capPoliza, capImpagas],
  });
});

// ── A.12.3 ───────────────────────────────────────────────────────────────────
const NUMERO_CENTRAL = 'POL-12-3-0001';
const CAMPOS_DEL_CENTRAL = ['name', 'prima', 'estadoDePago', 'vigenciaDesde', 'vigenciaHasta'];

/** Abre el rol Member desde Configuración › Miembros › Roles. */
async function abrirRolMember(page: Page) {
  await configuracion(page, /^Miembros$|^Members$/);
  await pestana(page, /^Roles$/);
  await clicReal(page, page.getByText('Member', { exact: true }).last());
  await esperarCarga(page, 3000);
}

/** Quita la regla de pólizas del rol Member, si está. */
async function quitarReglaDePolizas(page: Page) {
  await abrirRolMember(page);
  const regla = page.getByText('Pólizas', { exact: true }).filter({ visible: true }).first();
  if (!(await regla.isVisible().catch(() => false))) return;
  await clicReal(page, regla.locator('xpath=ancestor::*[count(.//*[local-name()="svg"])>=2][1]').locator('svg').last());
  await clicReal(page, page.getByText('Eliminar regla', { exact: true }));
  await clicReal(page, page.getByText('Guardar', { exact: true }));
  await esperarCarga(page, 3000);
}

test('A.12.3 — Datos que administra el sistema central', async ({ page, browser }, info) => {
  // «Actualizar desde afuera una póliza por su número, sin que se duplique, y
  //  comprobar que los campos que administra el sistema central quedan de solo
  //  lectura para el usuario del CRM»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  const poliza = await objeto(api, 'poliza');
  const campo = (nombre: string) => poliza.fields.find((c: any) => c.name === nombre);
  const valorDe = (nombre: string, etiqueta: string) => campo(nombre).options.find((o: any) => o.label === etiqueta).value;
  const PRIMA_CENTRAL = 52_500;
  for (const p of (await registros(api, 'polizas')).filter(p => p.name === NUMERO_CENTRAL)) await borrarRegistro(api, 'polizas', p.id);

  // El sistema central ya emitió la póliza: llega al CRM por la interfaz de programación
  await crearRegistro(api, 'polizas', {
    name: NUMERO_CENTRAL, ramo: valorDe('ramo', 'Hogar'), estadoDePago: valorDe('estadoDePago', 'Al día'),
    prima: { amountMicros: 40_000 * 1_000_000, currencyCode: 'ARS' }, vigenciaDesde: isoEnDias(-30), vigenciaHasta: isoEnDias(335),
    titularId: e.asegurados[2], productorId: e.productor,
  });

  // Cada novedad del central busca la póliza por su número y la actualiza por su identificador
  const novedad = async (estado: string, prima: number, hasta: number) => {
    const hallada = await registros(api, 'polizas', `name[eq]:${NUMERO_CENTRAL}`);
    if (hallada.length !== 1) throw new Error(`Se esperaba una póliza con el número ${NUMERO_CENTRAL} y hay ${hallada.length}`);
    const r = await api.patch(`polizas/${hallada[0].id}`, { data: {
      estadoDePago: valorDe('estadoDePago', estado), prima: { amountMicros: prima * 1_000_000, currencyCode: 'ARS' }, vigenciaHasta: isoEnDias(hasta),
    } });
    if (!r.ok()) throw new Error(`PATCH polizas devolvió ${r.status()}: ${await r.text()}`);
  };
  await novedad('Vencida', PRIMA_CENTRAL - 2_500, 300);
  await novedad('Al día', PRIMA_CENTRAL, 365);
  const tras = (await registros(api, 'polizas')).filter(p => p.name === NUMERO_CENTRAL);
  const central = tras[0];

  // Un alta repetida con el mismo número, incluso pidiendo «upsert», ¿crea otra?
  await api.post('polizas?upsert=true', { data: { name: NUMERO_CENTRAL, titularId: e.asegurados[2] } });
  const trasAlta = (await registros(api, 'polizas')).filter(p => p.name === NUMERO_CENTRAL);
  const duplicaAlta = trasAlta.length > 1;
  for (const p of trasAlta.filter(p => p.id !== central.id)) await borrarRegistro(api, 'polizas', p.id);

  // El rol del productor: se marcan de solo lectura los campos del central
  const etiquetas = CAMPOS_DEL_CENTRAL.map(n => campo(n).label as string);
  let capRol = '', capBloqueo = '';
  const inputsAbiertos: Record<string, boolean> = {};
  let ramoEditable = false;
  try {
    await abrirRolMember(page);
    await clicReal(page, page.getByText(/^Agregar regla$|^Add rule$/).first());
    await clicReal(page, page.getByText('Pólizas', { exact: true }).last());
    await esperarCarga(page, 3000);
    for (const et of etiquetas) {
      const x = page.getByText(et, { exact: true }).filter({ visible: true }).first()
        .locator('xpath=ancestor::*[count(.//*[local-name()="svg"])>=4][1]').locator('svg').last();
      await x.scrollIntoViewIfNeeded();
      await clicReal(page, x);
      await page.waitForTimeout(600);
    }
    capRol = await capturar(page, 'A.12.3', plataforma, '1-rol-con-campos-de-solo-lectura');
    await clicReal(page, page.getByText(/^Terminar$|^Finish$/).first());
    await clicReal(page, page.getByText(/^Guardar$|^Save$/).first());
    await esperarCarga(page, 4000);

    // El productor abre la póliza e intenta editar cada campo del central, y uno propio
    await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
    await abrirFicha(page, 'poliza', central.id);
    await esperarCarga(page, 3000);
    for (const n of CAMPOS_DEL_CENTRAL.filter(n => n !== 'name')) {
      await clicReal(page, valorEnFicha(page, n));
      await page.waitForTimeout(1500);
      inputsAbiertos[n] = (await page.locator('input:focus, textarea:focus').count()) > 0
        || (await page.getByPlaceholder(/^Buscar|^Search/).filter({ visible: true }).count()) > 0;
      if (n === 'prima') capBloqueo = await capturar(page, 'A.12.3', plataforma, '2-el-productor-no-puede-editar');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
    }
    await elegirEnFicha(page, 'ramo', 'Vida');
    ramoEditable = true;
  } finally {
    await entrarComo(page, EMAIL, PASS);
    await quitarReglaDePolizas(page);
  }
  const final = (await registros(api, 'polizas')).find(p => p.name === NUMERO_CENTRAL);

  expect(tras.length, 'tras dos novedades del central debe haber una sola póliza con ese número').toBe(1);
  expect(Number(central.prima.amountMicros), 'la prima debe ser la que mandó el central').toBe(PRIMA_CENTRAL * 1_000_000);
  expect(Object.values(inputsAbiertos).some(v => v), 'ningún campo del central debe abrirse a la edición del productor').toBeFalsy();
  expect(Number(final.prima.amountMicros), 'la prima no debe haber cambiado').toBe(PRIMA_CENTRAL * 1_000_000);
  expect(ramoEditable && final.ramo === valorDe('ramo', 'Vida'), 'el campo propio del CRM sí debe poder editarse').toBeTruthy();

  registrar({
    criterio: 'A.12.3',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'El sistema central actualiza pólizas por la interfaz buscándolas antes por número, sin ' +
      'duplicarlas, y el rol del productor deja en solo lectura los campos que el central ' +
      'administra.',
    comoLoHace:
      'El sistema central trabaja por la interfaz de programación: busca la póliza por su número con ' +
      'una condición sobre el nombre y la actualiza por el identificador que recibe, de modo que ' +
      'actualizar estado de pago, prima y vigencia varias veces deja una sola póliza con ese número. ' +
      'Para el productor, una regla del rol sobre Pólizas deja en solo lectura número, prima, estado ' +
      'de pago y vigencia: esos campos no se abren a la edición, mientras que el ramo, que es del CRM, ' +
      'se edita con normalidad.',
    caracteristicas: `El permiso por campo es del rol —ver y editar por separado para cada campo de cada objeto—, así que el mismo dato lo escribe quien integra y el productor lo ve sin poder tocarlo. La actualización no es una operación única por clave: quien envía busca por número y decide${duplicaAlta ? ', y un alta repetida con el mismo número, incluso pidiendo «upsert», crea una segunda póliza' : ''}.`,
    justificacion: 'El central actualiza sin duplicar y el productor no puede modificar lo que el central administra, en cada uso y sin trabajo extra. Hace falta una regla en el rol del productor con cinco campos marcados, desde la pantalla de roles y sin programar; buscar antes de actualizar es parte del cliente de integración.',
    evidencia: [capRol, capBloqueo],
  });
});

// ── A.12.4 ───────────────────────────────────────────────────────────────────
test('A.12.4 — Historia del cliente desde el primer contacto', async ({ page, browser }, info) => {
  // «Registrar una llamada sobre un solicitante, convertirlo y emitirle la
  //  póliza, y comprobar que la llamada figura en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(2_400_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  const LLAMADA = 'Llamada entrante: consulta por seguro de hogar';
  const VENTA = 'Seguro de hogar — Emisión Ledesma';
  const flujo = (await registros(api, 'workflows')).find(w => w.name === FLUJO_EMISION);
  expect(flujo, 'A.12.1 debe haber dejado el flujo de emisión').toBeTruthy();
  for (const p of (await registros(api, 'people')).filter(p => p.name?.firstName === 'Gabriela' && p.name?.lastName === 'Ledesma')) {
    for (const o of (await registros(api, 'opportunities')).filter(o => o.pointOfContactId === p.id)) await borrarRegistro(api, 'opportunities', o.id);
    for (const po of (await registros(api, 'polizas')).filter(x => x.titularId === p.id)) await borrarRegistro(api, 'polizas', po.id);
    await borrarRegistro(api, 'people', p.id);
  }
  for (const n of (await registros(api, 'notes')).filter(n => n.title === LLAMADA)) await borrarRegistro(api, 'notes', n.id);

  // El primer contacto: alguien llama y se lo registra como persona, con la llamada en una nota de su ficha
  const solicitante = await nuevaPersona(page, 'Gabriela', 'Ledesma');
  await abrirFicha(page, 'person', solicitante);
  await clicReal(page, page.getByText(/^Notes$|^Notas$/).filter({ visible: true }).last());
  await page.waitForTimeout(2500);
  await clicReal(page, page.getByText(/^New note$|^Nueva nota$|^Nuevo$|^New$/).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  await page.keyboard.type(LLAMADA, { delay: 60 });
  await page.keyboard.press('Enter');
  await page.keyboard.type('Pregunta por la cobertura contra incendio y robo de su casa en Morón. Se le pasa la cotización.', { delay: 40 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2000);

  // Se convierte: la misma persona pasa a ser la contacto de una oportunidad que se gana, y el flujo emite la póliza
  const oportunidad = await crearRegistro(api, 'opportunities', {
    name: VENTA, pointOfContactId: solicitante, amount: { amountMicros: 36_000 * 1_000_000, currencyCode: 'ARS' },
  });
  const etapas = [...(await objeto(api, 'opportunity')).fields.find((c: any) => c.name === 'stage').options]
    .sort((a: any, b: any) => a.position - b.position);
  await abrirFicha(page, 'workflow', flujo.id);
  await esperarCarga(page, 6000);
  await botonDelFlujo(page, /^Activate$|^Activar$/);
  let emitida: any, capFicha = '', capLinea = '', vista = '';
  try {
    await abrirFicha(page, 'opportunity', oportunidad.id);
    await elegirEnFicha(page, 'stage', etapas.find((o: any) => /customer|cliente|gan|won/i.test(o.label + o.value)).label);
    for (let espera = 0; espera < 36 && !emitida; espera++) {
      await page.waitForTimeout(5000);
      emitida = (await registros(api, 'polizas')).find(p => p.name === VENTA);
    }
    await abrirFicha(page, 'person', solicitante);
    await page.waitForTimeout(2500);
    capFicha = await capturar(page, 'A.12.4', plataforma, '1-ficha-del-asegurado');
    await clicReal(page, page.getByText(/^Notes$|^Notas$/).filter({ visible: true }).last());
    await page.waitForTimeout(2500);
    capLinea = await capturar(page, 'A.12.4', plataforma, '2-la-llamada-en-la-ficha');
    vista = await textoDe(page);
  } finally {
    await apagarFlujo(page, api, FLUJO_EMISION);
  }
  const nota = (await registros(api, 'notes')).find(n => n.title === LLAMADA);
  const vinculo = nota ? (await registros(api, 'noteTargets')).find(t => t.noteId === nota.id && t.targetPersonId === solicitante) : undefined;

  expect(emitida, 'debe haberse emitido la póliza').toBeTruthy();
  expect(emitida.titularId, 'la póliza debe quedar a nombre de la misma persona').toBe(solicitante);
  expect(vinculo, 'la llamada debe estar ligada a la persona').toBeTruthy();
  expect(vista, 'la ficha del asegurado debe mostrar la llamada').toContain(LLAMADA);

  registrar({
    criterio: 'A.12.4',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'La persona es la misma desde la primera llamada hasta la póliza: sin conversión que ' +
      'duplique datos, su ficha reúne notas, oportunidades y pólizas.',
    comoLoHace: 'La llamada se registra como nota en la ficha de la persona que consulta. Al convertirla, la misma persona queda como contacto de una oportunidad que pasa a la etapa de venta ganada, y el flujo de emisión crea la póliza a su nombre. En la ficha del asegurado la llamada sigue estando, junto a la póliza.',
    caracteristicas: 'Notas vinculadas a la persona; la misma persona pasa de solicitante a asegurado sin duplicarse; la ficha reúne notas, oportunidades y pólizas.',
    justificacion: 'No hay una conversión que mueva o duplique datos: la persona es la misma desde la primera llamada y todo lo que se le registró queda en su ficha. La emisión depende del flujo configurado en A.12.1.',
    evidencia: [capFicha, capLinea],
  });
});

// ── A.12.5 ───────────────────────────────────────────────────────────────────
const PUNTAJES = ['1 - Muy insatisfecho', '2 - Insatisfecho', '3 - Neutral', '4 - Satisfecho', '5 - Muy satisfecho'];

test('A.12.5 — Satisfacción después de la atención', async ({ page, browser }, info) => {
  // «Al cerrar un reclamo, enviar o registrar una encuesta y comprobar que la
  //  respuesta queda en la ficha del asegurado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(1_800_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const api = e.api;
  await alistarReclamo(api);
  await objetoApi(api, 'encuesta', 'encuestas', 'Encuesta', 'Encuestas', 'IconMoodSmile');
  await campoApi(api, 'encuesta', { name: 'puntaje', label: 'Puntaje', type: 'SELECT', options: opciones(PUNTAJES) });
  await campoApi(api, 'encuesta', { name: 'comentario', label: 'Comentario', type: 'TEXT' });
  await relacion(api, 'encuesta', 'asegurado', 'Asegurado', 'person', 'Encuestas');
  await relacion(api, 'encuesta', 'reclamo', 'Reclamo', 'reclamo', 'Encuesta');
  const RECLAMO = 'RCL-12-5 Granizo en el techo';
  const ENCUESTA = 'Encuesta de RCL-12-5';
  for (const r of (await registros(api, 'reclamos')).filter(r => r.name === RECLAMO)) await borrarRegistro(api, 'reclamos', r.id);
  for (const x of (await registros(api, 'encuestas')).filter(x => x.name === ENCUESTA)) await borrarRegistro(api, 'encuestas', x.id);
  const asegurado = e.asegurados[4];
  const abierto = (await objeto(api, 'reclamo')).fields.find((c: any) => c.name === 'estado').options.find((o: any) => o.label === 'En curso').value;
  const reclamo = await crearRegistro(api, 'reclamos', { name: RECLAMO, estado: abierto, aseguradoId: asegurado });

  // Se cierra el reclamo desde su ficha
  await abrirFicha(page, 'reclamo', reclamo.id);
  await elegirEnFicha(page, 'estado', 'Cerrado');

  // La encuesta, que el asegurado contesta por teléfono, se registra desde su ficha
  await abrirFicha(page, 'person', asegurado);
  await clicReal(page, valorEnFicha(page, 'encuestas'));
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  await buscar.waitFor({ state: 'visible', timeout: 15_000 });
  await page.keyboard.type(ENCUESTA, { delay: 60 });
  await page.waitForTimeout(1500);
  await clicReal(page, page.getByText(/^Agregar nuevo|^Add new/).filter({ visible: true }).last());
  let encuesta: any;
  for (let i = 0; i < 10 && !encuesta; i++) {
    await page.waitForTimeout(1500);
    encuesta = (await registros(api, 'encuestas')).find(x => x.aseguradoId === asegurado && x.name === ENCUESTA);
  }
  expect(encuesta, 'la encuesta debe crearse ya ligada al asegurado').toBeTruthy();
  // La encuesta nueva se abre en el panel lateral: se expande a su ficha completa
  await clicReal(page, page.getByRole('button', { name: /^Expandir registro$|^Expand record$/ }).filter({ visible: true }).first());
  await esperarCarga(page, 3000);
  await elegirEnFicha(page, 'puntaje', PUNTAJES[3]);
  await escribirEnFicha(page, 'comentario', 'Lo atendieron rápido y le pagaron el arreglo del techo.');
  await elegirEnFicha(page, 'reclamo', RECLAMO);
  const capEncuesta = await capturar(page, 'A.12.5', plataforma, '1-encuesta-registrada');
  await abrirFicha(page, 'person', asegurado);
  const enFicha = await campoEnFicha(page, 'encuestas').innerText();
  const capFicha = await capturar(page, 'A.12.5', plataforma, '2-encuesta-en-la-ficha-del-asegurado');

  const guardada = (await registros(api, 'encuestas')).find(x => x.id === encuesta.id);
  expect(guardada.puntaje, 'el puntaje debe quedar guardado').toBe(opciones(PUNTAJES)[3].value);
  expect(guardada.reclamoId, 'la encuesta debe quedar ligada al reclamo').toBe(reclamo.id);
  expect(enFicha, 'la ficha del asegurado debe mostrar la encuesta').toContain(ENCUESTA);

  registrar({
    criterio: 'A.12.5',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'La encuesta es un objeto propio, con puntaje, comentario y vínculos al asegurado y al ' +
      'reclamo; no trae encuestas incorporadas ni envío automático al cerrar el reclamo.',
    comoLoHace: 'La encuesta es un objeto propio con puntaje, comentario y vínculos al asegurado y al reclamo. Al cerrar el reclamo desde su ficha, la respuesta que el asegurado dio por teléfono se registra desde su ficha como una encuesta nueva, ligada al reclamo, y queda listada en la ficha del asegurado.',
    caracteristicas: 'Objeto propio con campo de lista para el puntaje, texto para el comentario y relaciones con persona y reclamo; la ficha del asegurado lista sus encuestas.',
    justificacion: 'Cada respuesta se registra una vez y queda en la ficha del asegurado. No hay encuestas incorporadas ni envío automático al cerrar el reclamo; el objeto y sus campos se configuran una sola vez.',
    evidencia: [capEncuesta, capFicha],
  });
});
