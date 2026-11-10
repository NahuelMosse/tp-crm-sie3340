import { APIRequestContext } from '@playwright/test';

/**
 * El modelo de datos mínimo sobre el que corren los criterios de reclamos y de
 * datos personales, armado por la interfaz de programación: la póliza con su
 * titular y los campos del reclamo.
 *
 * Solo monta el escenario: no decide ningún veredicto. El trabajo de
 * configuración que supone lo declara cada criterio en su justificación.
 * Todo es idempotente.
 */

const post = async (api: APIRequestContext, ruta: string, data: object) => {
  // Cada cambio del modelo reconstruye la base: con la máquina cargada puede tardar minutos
  const r = await api.post(ruta, { data, timeout: 400_000 });
  if (!r.ok()) throw new Error(`POST ${ruta} devolvió ${r.status()}: ${await r.text()}`);
};

export const definiciones = async (api: APIRequestContext) =>
  (await (await api.get('Metadata')).json()).entityDefs as Record<string, any>;

/** Cambia un diseño si todavía no tiene la marca indicada. */
export async function ajustarDiseno(api: APIRequestContext, entidad: string, tipo: string,
  marca: string, cambiar: (d: any) => any) {
  const actual = await (await api.get(`${entidad}/layout/${tipo}`)).json();
  if (JSON.stringify(actual).includes(marca)) return;
  const r = await api.put(`${entidad}/layout/${tipo}`, { data: cambiar(actual) });
  if (!r.ok()) throw new Error(`No se pudo guardar el diseño ${entidad}/${tipo}: ${r.status()} ${await r.text()}`);
}

/** La póliza como entidad propia, con sus campos del rubro y su relación con el asegurado. */
export async function montarPoliza(api: APIRequestContext) {
  // La compañía opera en pesos: la moneda por defecto tiene que estar entre las habilitadas, o el
  // sistema no puede reconstruir su modelo al crear entidades con importes
  const ajustes = await (await api.get('Settings')).json();
  if (!ajustes.currencyList.includes('ARS')) {
    const r = await api.put('Settings', { data: { currencyList: ['ARS', 'USD'], defaultCurrency: 'ARS',
      baseCurrency: 'USD', currencyRates: { ARS: 0.001, USD: 1 } } });
    if (!r.ok()) throw new Error(`No se pudo habilitar el peso: ${r.status()} ${await r.text()}`);
    await post(api, 'Admin/rebuild', {});
  }
  let m = await definiciones(api);
  if (!m.CPoliza) {
    await post(api, 'EntityManager/action/createEntity',
      { name: 'Poliza', labelSingular: 'Póliza', labelPlural: 'Pólizas', type: 'Base', stream: true, disabled: false });
    m = await definiciones(api);
  }
  const campo = async (nombre: string, datos: object) => {
    if (!m.CPoliza.fields[nombre]) await post(api, 'Admin/fieldManager/CPoliza', { name: nombre, ...datos });
  };
  await campo('tipoPoliza', { type: 'enum', label: 'Ramo', options: ['', 'Automotor', 'Hogar', 'Vida', 'Salud'], audited: true });
  await campo('estadoPago', { type: 'enum', label: 'Estado de pago', options: ['', 'Al dia', 'Vencida'], audited: true });
  await campo('prima', { type: 'currency', label: 'Prima' });
  await campo('vigenciaDesde', { type: 'date', label: 'Vigencia desde' });
  await campo('vigenciaHasta', { type: 'date', label: 'Vigencia hasta' });
  if (!m.CPoliza.links?.titular) {
    await post(api, 'EntityManager/action/createLink', { entity: 'CPoliza', entityForeign: 'Contact', link: 'titular',
      linkForeign: 'polizas', label: 'Titular', labelForeign: 'Pólizas', linkType: 'manyToOne' });
  }

  const sobre = [{ label: '', rows: [
    [{ name: 'name' }, { name: 'titular' }], [{ name: 'tipoPoliza' }, { name: 'estadoPago' }],
    [{ name: 'prima' }, false], [{ name: 'vigenciaDesde' }, { name: 'vigenciaHasta' }]] }];
  await ajustarDiseno(api, 'CPoliza', 'detail', 'vigenciaDesde', () => sobre);
  await ajustarDiseno(api, 'CPoliza', 'list', 'tipoPoliza', () => [{ name: 'name', link: true }, { name: 'titular' },
    { name: 'tipoPoliza' }, { name: 'estadoPago' }, { name: 'prima' }, { name: 'vigenciaHasta' }]);
  await ajustarDiseno(api, 'Contact', 'bottomPanelsDetail', 'cPolizas', d => ({ ...d, cPolizas: { index: 3 } }));
}

/** El asegurado con su póliza, para los criterios de datos personales. Devuelve sus identificadores. */
export async function aseguradoConPoliza(api: APIRequestContext, a: { firstName: string; lastName: string;
  emailAddress: string; phoneNumber: string }, nombrePoliza: string) {
  const existentes = (await (await api.get('Contact', { params: { maxSize: 200 } })).json()).list as any[];
  let contacto = existentes.find(c => c.emailAddress === a.emailAddress);
  if (!contacto) {
    const r = await api.post('Contact', { data: a });
    if (!r.ok()) throw new Error(`POST Contact devolvió ${r.status()}: ${await r.text()}`);
    contacto = await r.json();
  }
  const polizas = (await (await api.get('CPoliza', { params: { maxSize: 200 } })).json()).list as any[];
  let poliza = polizas.find(p => p.name === nombrePoliza);
  if (!poliza) {
    const r = await api.post('CPoliza', { data: { name: nombrePoliza, tipoPoliza: 'Hogar', estadoPago: 'Al dia',
      prima: 18450.5, premiumCurrency: 'ARS', primaCurrency: 'ARS', vigenciaDesde: '2026-01-01', vigenciaHasta: '2026-12-31',
      titularId: contacto.id } });
    if (!r.ok()) throw new Error(`POST CPoliza devolvió ${r.status()}: ${await r.text()}`);
    poliza = await r.json();
  }
  return { contactoId: contacto.id as string, polizaId: poliza.id as string };
}

/** Los datos que la normativa pide de un reclamo, como campos del caso. */
export const CARACTERES = ['', 'Asegurado', 'Tomador', 'Beneficiario', 'Tercero damnificado', 'Derechohabiente'];
export const MOTIVOS = ['', 'Demora en el pago de un siniestro', 'Rechazo de cobertura', 'Aumento de prima', 'Atención recibida'];

export async function montarReclamo(api: APIRequestContext) {
  await montarPoliza(api);
  let m = await definiciones(api);
  const campo = async (nombre: string, datos: object) => {
    if (!m.Case.fields['c' + nombre[0].toUpperCase() + nombre.slice(1)]) {
      await post(api, 'Admin/fieldManager/Case', { name: nombre, ...datos });
    }
  };
  // El calendario laboral de la compañía: de lunes a viernes. Sin uno por defecto, el sistema no sabe qué días son hábiles
  const calendarios = (await (await api.get('WorkingTimeCalendar', { params: { maxSize: 50 } })).json()).list as any[];
  if (!(await (await api.get('Settings')).json()).workingTimeCalendarId) {
    let id = calendarios[0]?.id;
    if (!id) {
      const r = await api.post('WorkingTimeCalendar', { data: { name: 'Calendario laboral', timeZone: 'UTC',
        weekday0: false, weekday1: true, weekday2: true, weekday3: true, weekday4: true, weekday5: true, weekday6: false,
        timeRanges: [['9:00', '18:00']] } });
      if (!r.ok()) throw new Error(`No se pudo crear el calendario laboral: ${r.status()} ${await r.text()}`);
      id = (await r.json()).id;
    }
    const r = await api.put('Settings', { data: { workingTimeCalendarId: id } });
    if (!r.ok()) throw new Error(`No se pudo fijar el calendario laboral: ${r.status()} ${await r.text()}`);
  }
  await campo('fechaReclamo', { type: 'date', label: 'Fecha del reclamo' });
  await campo('caracterReclamante', { type: 'enum', label: 'Carácter del reclamante', options: CARACTERES });
  await campo('ramo', { type: 'enum', label: 'Ramo', options: ['', 'Automotor', 'Hogar', 'Vida', 'Salud'] });
  await campo('motivo', { type: 'enum', label: 'Motivo', options: MOTIVOS });
  await campo('resolucionFinal', { type: 'text', label: 'Resolución final' });
  await campo('fechaLimite', { type: 'date', label: 'Fecha límite de respuesta', readOnly: true });
  if (!m.Case.links?.cPoliza) {
    await post(api, 'EntityManager/action/createLink', { entity: 'Case', entityForeign: 'CPoliza', link: 'poliza',
      linkForeign: 'reclamos', label: 'Póliza', labelForeign: 'Reclamos', linkType: 'manyToOne' });
  }
  m = await definiciones(api);
  const f = m.Case.fields;
  const nombres = ['cFechaReclamo', 'cCaracterReclamante', 'cRamo', 'cMotivo', 'cResolucionFinal', 'cFechaLimite'];
  for (const n of nombres) if (!f[n]) throw new Error(`Falta el campo ${n} en el caso`);
  const poliza = Object.keys(m.Case.links).find(l => /poliza/i.test(l))!;

  await ajustarDiseno(api, 'Case', 'detail', 'cFechaReclamo', d => {
    d[0].rows.push([{ name: 'cFechaReclamo' }, { name: 'cCaracterReclamante' }]);
    d[0].rows.push([{ name: 'cRamo' }, { name: poliza }]);
    d[0].rows.push([{ name: 'cMotivo' }, { name: 'cFechaLimite' }]);
    d[0].rows.push([{ name: 'cResolucionFinal', fullWidth: true }]);
    return d;
  });
  await ajustarDiseno(api, 'Case', 'list', 'cFechaLimite', d => [...d, { name: 'cFechaLimite', width: 12 }, { name: 'cMotivo' }]);
  await ajustarDiseno(api, 'Case', 'filters', 'cFechaLimite', d => [...d, 'cFechaLimite', 'cMotivo']);
  return { poliza };
}
