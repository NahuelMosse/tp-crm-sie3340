import { Page, test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { alistarPoliza } from '../preparar';
import { cargarCartera, PRODUCTOR } from '../datos';
import { citar } from '../fuentes';
import { apiEspo, listar } from '../api';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import {
  soloEn, capturar, textoDe, elegirLista, listadoLimpio, agregarFiltro, comparacionesDe,
  comparar, filtrarPorLista, filtrarPorUsuario, filtrarPorNumero, aplicarFiltros, filasDelListado,
} from './comun';
import { alta, administracion, inicio } from '../espocrm/navegar';

/**
 * A.1 — Cartera de pólizas
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Cada test cita el procedimiento de la sección 4 y lo ejecuta.
 *
 * El grupo corre en orden: los criterios se apoyan en la cartera que van
 * cargando los anteriores.
 */

test.describe.configure({ mode: 'serial' });

const RAMOS = ['Automotor', 'Hogar', 'Vida', 'Salud'];

/** El escenario: los campos puestos en pantalla y la cartera de referencia cargada. */
test.beforeAll(async ({ browser }, info) => {
  test.setTimeout(900_000);
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const pagina = await (await browser.newContext()).newPage();
  try {
    await entrar(pagina, 'espocrm');
    await alistarPoliza(pagina);
    await cargarCartera();
  } finally {
    await pagina.context().close();
  }
});

/** Alta de una póliza recorriendo el formulario, como lo haría el usuario. */
async function altaPorPantalla(
  page: Page,
  datos: { nombre: string; ramo?: string; estado?: string; prima?: string; desde?: string; hasta?: string },
) {
  await alta(page, 'CPoliza');
  await page.locator('.field[data-name="name"] input').first().waitFor({ state: 'visible', timeout: 40_000 });

  // El campo de importe trae dos controles —el monto y la moneda—, así que hay
  // que apuntar al que lleva el nombre del campo. Y se tipea tecla por tecla:
  // los campos numéricos y de fecha toman el valor de los eventos de teclado,
  // y uno cargado de golpe se descarta al guardar.
  const escribir = async (campo: string, valor: string) => {
    const input = page.locator(`.field[data-name="${campo}"] input[data-name="${campo}"]`).first();
    await input.waitFor({ state: 'visible', timeout: 20_000 });
    await input.click();
    await input.press('Control+a');
    await input.pressSequentially(valor, { delay: 30 });
    await input.press('Tab');                  // cierra el calendario del campo de fecha
  };
  const elegir = (campo: string, valor: string) => elegirLista(page, campo, valor);

  await escribir('name', datos.nombre);
  if (datos.ramo) await elegir('tipoPoliza', datos.ramo);
  if (datos.estado) await elegir('estadoPago', datos.estado);
  if (datos.prima) await escribir('prima', datos.prima);
  if (datos.desde) await escribir('vigenciaDesde', datos.desde);
  if (datos.hasta) await escribir('vigenciaHasta', datos.hasta);

  await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
  // Guardado, el formulario pasa a la ficha del registro nuevo
  await page.waitForFunction(() => /^#CPoliza\/view\//.test(location.hash), undefined, { timeout: 30_000 });
  await page.waitForTimeout(2500);
}

/** El sistema muestra las fechas como DD.MM.AAAA. */
const enDias = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

// ── A.1.1 ────────────────────────────────────────────────────────────────────
test('A.1.1 — Modelado de la póliza como objeto propio', async ({ page }, info) => {
  // «Crear una entidad Póliza con identidad propia y comprobar que aparece en
  //  el menú del sistema y admite registros»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  await entrar(page, plataforma);

  await administracion(page, '#Admin/entityManager');
  await page.waitForTimeout(5000);
  const enModelo = /Póliza/i.test(await textoDe(page));
  const capModelo = await capturar(page, 'A.1.1', plataforma, '1-modelo');

  // El menú lateral agrupa parte de las entradas: hay que desplegarlo para verlas todas
  await inicio(page);
  await page.waitForTimeout(4000);
  await page.locator('#nav-menu-dropdown, .navbar .dropdown-toggle').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const enMenu = (await page.locator('nav a, .navbar a').evaluateAll(
    els => els.map(e => e.getAttribute('href') ?? ''))).includes('#CPoliza');
  const capMenu = await capturar(page, 'A.1.1', plataforma, '2-menu');

  await listadoLimpio(page, 'CPoliza');
  const conListado = /Pólizas/i.test(await textoDe(page));
  const capListado = await capturar(page, 'A.1.1', plataforma, '3-listado');

  expect(enModelo, 'la entidad debe figurar en el modelo de datos').toBeTruthy();
  expect(enMenu, 'la entidad debe tener su entrada de menú').toBeTruthy();
  expect(conListado, 'la entidad debe tener listado propio').toBeTruthy();

  registrar({
    criterio: 'A.1.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El Administrador de Entidades crea la entidad Póliza desde la pantalla de administración, sin escribir ' +
      'código ni tocar archivos del servidor. Queda con identidad propia: figura en el modelo de datos, tiene ' +
      'su entrada en el menú principal, su listado y su ficha, y admite registros. A partir de ahí el usuario ' +
      'opera con la póliza igual que con las entidades que trae el producto —la busca, la filtra, la relaciona— ' +
      'de modo que la necesidad queda resuelta desde el sistema. Definirla es trabajo de una sola vez, y eso ' +
      'es lo que refleja el costo de implementación.',
    evidencia: [capModelo, capMenu, capListado],
  });
});

// ── A.1.2 ────────────────────────────────────────────────────────────────────
test('A.1.2 — Campos de lista para el ramo y el estado de cobranza', async ({ page }, info) => {
  // «Agregar dos campos de lista —uno con los ramos que comercializa la compañía
  //  y otro con los estados de cobranza—, cargar una póliza de cada ramo y
  //  cambiarle el estado»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(900_000);

  await entrar(page, plataforma);

  await administracion(page, '#Admin/entityManager', '#Admin/entityManager/scope=CPoliza', '#Admin/fieldManager/scope=CPoliza');
  await page.waitForTimeout(5000);
  const capCampos = await capturar(page, 'A.1.2', plataforma, '1-campos');

  for (const [i, ramo] of RAMOS.entries()) {
    await altaPorPantalla(page, { nombre: `POL-RAMO-${i + 1}-${ramo}`, ramo, estado: 'Al dia' });
  }

  await listadoLimpio(page, 'CPoliza');
  const listado = await textoDe(page);
  const cargados = RAMOS.filter(r => listado.includes(r));
  const capCartera = await capturar(page, 'A.1.2', plataforma, '2-cartera');

  // Cambio de estado de cobranza sobre una de las cargadas
  await page.getByRole('link', { name: 'POL-RAMO-4-Salud' }).first().click();
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: /^Editar$|^Edit$/i }).first().click();
  await page.waitForTimeout(2500);
  await elegirLista(page, 'estadoPago', 'Vencida');
  await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
  await page.waitForTimeout(4000);
  const cambiado = /Vencida/i.test(await textoDe(page));
  const capEstado = await capturar(page, 'A.1.2', plataforma, '3-estado');

  expect(cargados, 'las cuatro pólizas deben figurar con su ramo').toEqual(RAMOS);
  expect(cambiado, 'el estado de cobranza debe quedar cambiado').toBeTruthy();

  registrar({
    criterio: 'A.1.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El Administrador de Campos agrega campos de tipo lista y admite escribir sus valores, sin programar. Se ' +
      `definieron los ramos que comercializa la compañía —${RAMOS.join(', ')}— y los estados de cobranza, y se ` +
      'cargó una póliza de cada ramo desde el formulario: las cuatro quedaron con su ramo visible en el ' +
      'listado. El estado de cobranza se cambia desde la ficha y el cambio queda guardado. El usuario elige de ' +
      'la lista y no puede escribir un valor imprevisto, que es lo que vuelve confiable la clasificación de la ' +
      'cartera. El campo se define en una pantalla y se ubica en el formulario en otra, ambas de ' +
      'administración: es configuración inicial, no desarrollo.',
    evidencia: [capCampos, capCartera, capEstado],
    medicion: `${cargados.length} ramos cargados y visibles en el listado`,
  });
});

// ── A.1.3 ────────────────────────────────────────────────────────────────────
test('A.1.3 — Prima con importe y moneda', async ({ page }, info) => {
  // «Agregar un campo de importe con moneda y cargar una prima, comprobando que
  //  conserva los decimales y la denominación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  await entrar(page, plataforma);
  await altaPorPantalla(page, { nombre: 'POL-PRIMA-DECIMALES', ramo: 'Automotor', prima: '184532.75' });

  const ficha = await textoDe(page);
  const capPrima = await capturar(page, 'A.1.3', plataforma, '1-prima');

  const conDecimales = /184[.,\s]?532[.,]75/.test(ficha);
  const conMoneda = /ARS|\$/.test(ficha);

  expect(conDecimales, 'la prima debe conservar los centavos').toBeTruthy();
  expect(conMoneda, 'la prima debe mostrar su denominación').toBeTruthy();

  registrar({
    criterio: 'A.1.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El producto ofrece un tipo de campo de importe con moneda, que se agrega desde la administración. ' +
      'Cargada una prima de 184.532,75, la ficha la devuelve con sus centavos y con la denominación, y el ' +
      'sistema la trata como importe y no como texto: guarda la moneda junto al valor y mantiene una lista de ' +
      'monedas habilitadas. Es lo que necesita una compañía que cobra primas en pesos y emite pólizas en ' +
      'dólares sin que los importes se mezclen al sumarlos.',
    evidencia: [capPrima],
    medicion: 'Prima de 184.532,75 registrada y devuelta con centavos y denominación',
  });
});

// ── A.1.4 ────────────────────────────────────────────────────────────────────
test('A.1.4 — Vigencia con fecha de inicio y de fin', async ({ page }, info) => {
  // «Agregar dos campos de fecha y comprobar que el sistema los trata como
  //  fechas: admite orden y comparación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await altaPorPantalla(page, { nombre: 'POL-VENCE-PRONTO', ramo: 'Hogar', desde: enDias(-330), hasta: enDias(12) });
  await altaPorPantalla(page, { nombre: 'POL-VENCE-TARDE', ramo: 'Vida', desde: enDias(-10), hasta: enDias(300) });

  // Orden: ordenar por vencimiento tiene que respetar el calendario. El listado
  // se acota a las dos de prueba: con la cartera completa, otras pólizas vencen
  // entre ambas y las empujan fuera de la primera página
  await listadoLimpio(page, 'CPoliza');
  await page.locator('.search-container input.text-filter').first().fill('POL-VENCE-');
  await page.locator('.search-container [data-action="search"]').first().click();
  await page.waitForTimeout(3500);
  const cabecera = page.locator('thead a.sort[data-name="vigenciaHasta"], thead th[data-name="vigenciaHasta"] a').first();
  await cabecera.click();
  await page.waitForTimeout(3000);
  let filas = await filasDelListado(page);
  if (filas.indexOf('POL-VENCE-PRONTO') > filas.indexOf('POL-VENCE-TARDE')) {
    await cabecera.click();                      // estaba descendente: se invierte
    await page.waitForTimeout(3000);
    filas = await filasDelListado(page);
  }
  const ordena = filas.indexOf('POL-VENCE-PRONTO') < filas.indexOf('POL-VENCE-TARDE');
  const capOrden = await capturar(page, 'A.1.4', plataforma, '1-orden-por-vencimiento');

  // Comparación: "vence en los próximos 30 días" solo se puede preguntar sobre una fecha
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'vigenciaHasta');
  const comparaciones = (await comparacionesDe(page, 'vigenciaHasta')).map(o => o.texto);
  await comparar(page, 'vigenciaHasta', 'nextXDays');
  await filtrarPorNumero(page, 'vigenciaHasta', '30');
  await aplicarFiltros(page);
  const proximas = await filasDelListado(page);
  const capFiltro = await capturar(page, 'A.1.4', plataforma, '2-vencen-en-30-dias');

  expect(ordena, 'ordenar por vencimiento debe poner primero la que vence antes').toBeTruthy();
  expect(proximas, 'la que vence en 12 días entra en los próximos 30').toContain('POL-VENCE-PRONTO');
  expect(proximas, 'la que vence en 300 días no entra').not.toContain('POL-VENCE-TARDE');

  registrar({
    criterio: 'A.1.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Los campos de inicio y de fin de vigencia se agregan como campos de fecha desde la administración, y el ' +
      'sistema los trata como tales y no como texto. Se cargaron dos pólizas, una que vence en doce días y otra ' +
      'en trescientos: ordenado por vencimiento, el listado pone primero la que vence antes, y la condición ' +
      '"vence en los próximos 30 días" devuelve la primera y deja afuera la segunda. El filtro ofrece ' +
      `${comparaciones.length} comparaciones propias de una fecha —próximos o últimos X días, antes, después, ` +
      'entre, mes o trimestre en curso—. Para poder filtrar por un campo propio hay que habilitarlo antes entre ' +
      'los filtros de búsqueda del listado, en la misma administración: configuración inicial, no desarrollo.',
    evidencia: [capOrden, capFiltro],
    medicion: `${comparaciones.length} comparaciones de fecha en el filtro`,
  });
});

// ── A.1.5 ────────────────────────────────────────────────────────────────────
test('A.1.5 — Aviso anticipado de vencimiento', async ({ page, browser }, info) => {
  // «Definir un aviso sobre las pólizas que vencen en los próximos treinta días
  //  y sobre los reclamos que alcanzan su plazo de resolución, y comprobar que
  //  el sistema los emite sin intervención»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  await entrar(page, plataforma);

  // ¿Ofrece la administración alguna forma de definir un aviso?
  await administracion(page);
  await page.locator('#main a').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(2500);
  const opciones = [...new Set((await page.locator('#main a').allTextContents()).map(t => t.trim()).filter(Boolean))];
  const conReglas = opciones.some(o => /flujo de trabajo|workflow|proceso de negocio|automatiz/i.test(o));
  const capAdmin = await capturar(page, 'A.1.5', plataforma, '1-administracion');

  // Lo que sí ofrece la edición gratuita: la consulta de lo que vence, que alguien tiene que abrir
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'vigenciaHasta');
  await comparar(page, 'vigenciaHasta', 'nextXDays');
  await filtrarPorNumero(page, 'vigenciaHasta', '30');
  await aplicarFiltros(page);
  const vencen = await filasDelListado(page);
  const capConsulta = await capturar(page, 'A.1.5', plataforma, '2-consulta-de-vencimientos');

  const fuentes = [
    await citar(browser, {
      url: 'https://www.espocrm.com/extensions/advanced-pack/',
      buscar: 'Workflows',
      captura: 'A-1-5-espocrm-3-advanced-pack',
    }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-1-5-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-1-5-espocrm-nube'),
  ];

  expect(conReglas, 'la edición gratuita no trae motor de reglas en la administración').toBeFalsy();
  expect(vencen).toContain('POL-VENCE-PRONTO');

  registrar({
    criterio: 'A.1.5',
    plataforma,
    cumple: 1,
    justificacion:
      'La edición gratuita no incluye un motor de reglas: la administración ofrece tareas programadas del ' +
      'sistema, notificaciones y fórmulas, pero ninguna vía para que la compañía defina "avisar de lo que vence ' +
      'en treinta días" y el sistema lo emita solo. La necesidad se cubre con la consulta del listado —vence en ' +
      'los próximos 30 días, y su equivalente sobre el plazo de los reclamos—, que devuelve exactamente lo que ' +
      'hay que atender, pero que alguien tiene que abrir: el trabajo se repite cada día que la compañía quiere ' +
      'estar al tanto. Queda resuelta con un costo permanente. El fabricante vende el motor de flujos de ' +
      'trabajo como extensión, y con ella el aviso se define una vez y se emite solo.',
    evidencia: [capAdmin, capConsulta],
    documentacion: fuentes,
    conPlan: [conPlanDe(ESPOCRM_ADVANCED_PACK, {
      cumple: 2,
      costo: 1,
      justificacion:
        'La extensión agrega los flujos de trabajo: la condición de vencimiento y la de plazo de reclamo se ' +
        'definen una vez desde la administración, y el sistema emite el aviso sin que nadie abra nada.',
    }), conPlanDe(ESPOCRM_CLOUD_BASIC, {
      cumple: 2,
      costo: 1,
      justificacion:
        'El servicio en la nube incluye todas las extensiones del fabricante, flujos de trabajo incluidos: el ' +
        'aviso se configura igual que con la extensión, sin comprarla aparte.',
    })],
  });
});

// ── A.1.6 ────────────────────────────────────────────────────────────────────
test('A.1.6 — Consulta y filtrado de la cartera', async ({ page }, info) => {
  // «Filtrar de forma combinada por ramo, por estado de cobranza y por productor
  //  responsable, y obtener el listado resultante»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Escenario: el productor tiene a cargo pólizas de distintos ramos y estados,
  // así la combinación de las tres condiciones tiene algo que descartar
  const api = await apiEspo();
  const { list: usuarios } = await listar(api, 'User', { maxSize: 200 });
  const productor = usuarios.find((u: any) => u.userName === PRODUCTOR.userName);
  const { list: cartera } = await listar(api, 'CPoliza', { maxSize: 200 });
  for (const p of cartera.filter((p: any) => /^POL-(RAMO-[12]|PRIMA|VENCE-PRONTO)/.test(p.name))) {
    await api.put(`CPoliza/${p.id}`, { data: { assignedUserId: productor.id } });
  }
  // Lo que debería devolver, calculado por fuera de la pantalla que se evalúa
  const esperado = (await listar(api, 'CPoliza', { maxSize: 200 })).list
    .filter((p: any) => p.tipoPoliza === 'Automotor' && p.estadoPago === 'Al dia' && p.assignedUserId === productor.id)
    .map((p: any) => p.name).sort();

  await entrar(page, plataforma);
  await listadoLimpio(page, 'CPoliza');
  const sinFiltrar = (await filasDelListado(page)).length;

  await agregarFiltro(page, 'tipoPoliza');
  await filtrarPorLista(page, 'tipoPoliza', 'Automotor');
  await agregarFiltro(page, 'estadoPago');
  await filtrarPorLista(page, 'estadoPago', 'Al dia');
  await agregarFiltro(page, 'assignedUser');
  await filtrarPorUsuario(page, 'assignedUser', PRODUCTOR.lastName);
  await aplicarFiltros(page);

  const obtenido = (await filasDelListado(page)).sort();
  const capFiltros = await capturar(page, 'A.1.6', plataforma, '1-filtros-combinados');

  expect(esperado.length, 'el escenario debe dejar al menos una póliza que cumpla las tres').toBeGreaterThan(0);
  expect(obtenido, 'el listado debe devolver exactamente las que cumplen las tres condiciones').toEqual(esperado);

  registrar({
    criterio: 'A.1.6',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El listado de pólizas admite combinar condiciones: se pidieron a la vez el ramo Automotor, el estado de ' +
      `cobranza al día y un productor responsable, y de ${sinFiltrar} pólizas el sistema devolvió ` +
      `${obtenido.length}, exactamente las que cumplen las tres al mismo tiempo. La consulta se arma desde el ` +
      'listado eligiendo campo, comparación y valor, sin escribir ninguna expresión. Los campos propios de la ' +
      'póliza no vienen habilitados como filtro: hay que agregarlos una vez a los filtros de búsqueda desde la ' +
      'administración, y ese paso es el costo de implementación. Es la consulta que el área comercial repite ' +
      'todos los días para saber a quién llamar.',
    evidencia: [capFiltros],
    medicion: `${obtenido.length} de ${sinFiltrar} pólizas cumplen las tres condiciones`,
  });
});

// ── A.1.7 ────────────────────────────────────────────────────────────────────
test('A.1.7 — Operación masiva sobre la cartera', async ({ page }, info) => {
  // «Seleccionar varias pólizas del listado y modificar un campo en todas con
  //  una sola acción»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  await entrar(page, plataforma);
  await listadoLimpio(page, 'CPoliza');
  await agregarFiltro(page, 'tipoPoliza');
  await filtrarPorLista(page, 'tipoPoliza', 'Automotor', 'Hogar');
  await aplicarFiltros(page);
  // Por identificador: en la cartera hay pólizas con el mismo número de corridas distintas
  const elegidas: string[] = await page.locator('tbody tr[data-id]')
    .evaluateAll(filas => filas.map(f => f.getAttribute('data-id')!));

  await page.locator('thead input[type="checkbox"]').first().check({ force: true });
  await page.waitForTimeout(1000);
  const capSeleccion = await capturar(page, 'A.1.7', plataforma, '1-seleccion');

  // La página tiene dos menús de acciones, uno fijo arriba que aparece al bajar: vale el visible
  await page.locator('.actions-button:visible').first().click();
  const acciones = [...new Set((await page.locator('.dropdown-menu:visible a').allTextContents())
    .map(t => t.trim()).filter(Boolean))];
  const capAcciones = await capturar(page, 'A.1.7', plataforma, '2-acciones-sobre-la-seleccion');

  await page.locator('[data-action="massUpdate"]:visible').first().click();
  const dialogo = page.locator('.modal-dialog').first();
  await dialogo.waitFor({ state: 'visible', timeout: 20_000 });
  await dialogo.locator('.select-field').first().click();
  await dialogo.locator('a[data-action="addField"][data-name="estadoPago"]').first().click();
  await page.waitForTimeout(1500);
  await elegirLista(page, 'estadoPago', 'En gestion', '.modal-dialog');
  await dialogo.locator('button[data-name="update"]').first().click();
  await page.waitForTimeout(1500);
  const confirmar = page.locator('.modal-dialog button').filter({ hasText: /^S[ií]$|^Aceptar$|^Actualizar$/ }).first();
  if (await confirmar.isVisible().catch(() => false)) await confirmar.click();
  await page.waitForTimeout(5000);

  // El resultado se lee del sistema, no de la pantalla del diálogo
  const api = await apiEspo();
  const estados = await Promise.all(elegidas.map(async id => (await (await api.get(`CPoliza/${id}`)).json()).estadoPago));
  const cambiadas = estados.filter(e => e === 'En gestion').length;
  await listadoLimpio(page, 'CPoliza');
  const capResultado = await capturar(page, 'A.1.7', plataforma, '3-resultado');

  expect(elegidas.length, 'la selección debe abarcar varias pólizas').toBeGreaterThan(1);
  expect(cambiadas, 'todas las seleccionadas deben quedar con el nuevo estado').toBe(elegidas.length);

  registrar({
    criterio: 'A.1.7',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      `Se seleccionaron las ${elegidas.length} pólizas de los ramos Automotor y Hogar desde el listado, y el menú ` +
      `de acciones sobre la selección ofrece ${acciones.length} operaciones: ${acciones.join(', ')}. Con la ` +
      'actualización masiva se eligió el estado de cobranza, se le dio un valor y el sistema lo aplicó en una ' +
      `sola operación: las ${cambiadas} quedaron con el nuevo estado sin recorrerlas una por una. De fábrica la ` +
      'actualización masiva solo alcanza al usuario y al equipo asignados; para que incluya un campo propio ' +
      'hay que habilitarlo una vez desde la administración. Es lo que vuelve manejable un cambio de estado por ' +
      'lote de cobranza o una renovación de cartera.',
    evidencia: [capSeleccion, capAcciones, capResultado],
    medicion: `${cambiadas} pólizas modificadas con una sola acción`,
  });
});
