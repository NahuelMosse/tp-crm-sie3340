import { Page, test, expect } from '../humano';
import { registrar } from '../evaluar';
import { entrar, plataformaDe } from '../sesion';
import { alistarPoliza } from '../preparar';
import { cargarCartera, PRODUCTOR } from '../datos';
import { citar } from '../fuentes';
import { apiEspo, crear, listar } from '../api';
import { ESPOCRM_ADVANCED_PACK, ESPOCRM_CLOUD_BASIC, constanciaDe, conPlanDe } from '../precios';
import { soloEn, capturar, textoDe, elegirLista } from './comun';
import { escribirGuion, guardarGuion } from '../formula';
import { administracion, alta, ficha, edicion, pestana } from '../espocrm/navegar';

/**
 * A.8 — Parametrización del modelo de negocio
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Cada test cita el procedimiento de la sección 4 y lo ejecuta.
 */

test.describe.configure({ mode: 'serial' });

/** La entidad que se crea para A.8.1: el endoso, que modifica una póliza vigente. */
const ENTIDAD = { nombre: 'Endoso', singular: 'Endoso', plural: 'Endosos', scope: 'CEndoso' };

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

// ── A.8.1 ────────────────────────────────────────────────────────────────────
test('A.8.1 — Creación de entidades sin programar', async ({ page }, info) => {
  // «Crear una entidad nueva desde la administración y registrar si fue
  //  necesario escribir código»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // Si quedó de una corrida anterior se quita, para que la creación se ejercite de nuevo
  const api = await apiEspo();
  if ((await api.get(`${ENTIDAD.scope}?maxSize=1`)).ok()) {
    await api.post('EntityManager/action/removeEntity', { data: { name: ENTIDAD.scope } });
  }

  await entrar(page, plataforma);
  await administracion(page, '#Admin/entityManager');
  await page.getByRole('button', { name: /Crear entidad|Create Entity/i }).first().click();
  const formulario = page.locator('#main').first();
  await formulario.locator('input[data-name="name"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  const inicio = Date.now();

  // El producto completa las etiquetas mientras se escribe el nombre: se limpian antes
  await formulario.locator('input[data-name="name"]').first().pressSequentially(ENTIDAD.nombre, { delay: 40 });
  for (const [campo, valor] of [['labelSingular', ENTIDAD.singular], ['labelPlural', ENTIDAD.plural]]) {
    const input = formulario.locator(`input[data-name="${campo}"]`).first();
    await input.clear();
    await input.pressSequentially(valor, { delay: 30 });
  }
  // Los tipos se leen del desplegable propio del producto, que los carga al abrirse
  await formulario.locator('.field[data-name="type"] .selectize-input').first().click();
  const tipos = (await page.locator('.selectize-dropdown:visible .option').allTextContents())
    .map(t => t.trim()).filter(Boolean);
  await page.keyboard.press('Escape');
  const capFormulario = await capturar(page, 'A.8.1', plataforma, '1-formulario');

  await formulario.getByRole('button', { name: /^Crear$|^Create$/i }).first().click();
  await page.waitForTimeout(8000);
  const segundos = Math.round((Date.now() - inicio) / 1000);

  // La entidad nueva opera: admite registros sin nada más
  await alta(page, ENTIDAD.scope);
  const nombre = page.locator('.field[data-name="name"] input[data-name="name"]').first();
  await nombre.waitFor({ state: 'visible', timeout: 40_000 });
  await nombre.pressSequentially('END-0001 · cambio de suma asegurada', { delay: 20 });
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);
  const capRegistro = await capturar(page, 'A.8.1', plataforma, '2-primer-registro');
  const opera = (await listar(api, ENTIDAD.scope)).total > 0;

  expect(opera, 'la entidad nueva debe admitir registros').toBeTruthy();

  registrar({
    criterio: 'A.8.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'El Administrador de Entidades crea una entidad desde un formulario de la administración: se creó el ' +
      'Endoso —la modificación de una póliza vigente— indicando el nombre, las etiquetas en singular y plural ' +
      `y el tipo, entre ${tipos.length} que ofrece (${tipos.join(', ')}). No hizo falta escribir código, tocar ` +
      'archivos del servidor ni reiniciar nada: la entidad quedó disponible en el acto y admitió su primer ' +
      'registro. Es trabajo de configuración que se hace una vez, y es lo que permite que el modelo de datos ' +
      'siga al negocio asegurador en lugar de obligar al negocio a acomodarse a un modelo genérico.',
    evidencia: [capFormulario, capRegistro],
    medicion: `Entidad creada y operativa en ${segundos} segundos`,
  });
});

// ── A.8.2 ────────────────────────────────────────────────────────────────────
test('A.8.2 — Campos calculados sobre datos propios', async ({ page }, info) => {
  // «Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  // El campo de destino, de solo lectura: su valor lo pone el sistema, no el usuario
  const api = await apiEspo();
  await api.post('Admin/fieldManager/CPoliza', {
    data: { name: 'primaAnual', type: 'float', label: 'Prima anual', decimalPlaces: 2, readOnly: true },
  });

  await entrar(page, plataforma);
  await escribirGuion(page, 'CPoliza', 'beforeSaveCustomScript', 'primaAnual = prima * 12;');
  const capFormula = await capturar(page, 'A.8.2', plataforma, '1-formula');
  await guardarGuion(page);

  // La póliza se carga en su formulario y se guarda: al guardar corre la fórmula
  for (const p of (await listar(api, 'CPoliza', { maxSize: 200 })).list.filter((p: any) => p.name === 'POL-VENCE-CALCULO')) {
    await api.delete(`CPoliza/${p.id}`);
  }
  await alta(page, 'CPoliza');
  const campo = (nombre: string) => page.locator(`.field[data-name="${nombre}"] input[data-name="${nombre}"]`).first();
  await campo('name').waitFor({ state: 'visible', timeout: 40_000 });
  await campo('name').pressSequentially('POL-VENCE-CALCULO');
  await elegirLista(page, 'tipoPoliza', 'Vida');
  // Los importes toman el valor de los eventos de teclado: se tipea tecla por tecla
  await campo('prima').click();
  await campo('prima').pressSequentially('15250.50');
  await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
  await page.waitForURL(/#CPoliza\/view\//, { timeout: 30_000 });
  const id = page.url().split('/').pop()!;
  await page.waitForTimeout(4000);
  const capFicha = await capturar(page, 'A.8.2', plataforma, '2-calculado-al-guardar');
  const guardada = (await api.get(`CPoliza/${id}`).then(r => r.json()));

  expect(guardada.primaAnual, 'la prima anual debe ser doce veces la mensual').toBeCloseTo(15250.5 * 12, 2);

  registrar({
    criterio: 'A.8.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La administración de cada entidad trae una fórmula que, según la propia pantalla, "se ejecuta cada vez ' +
      'que se guarda una entidad" y "se utiliza para configurar campos calculados". Se definió la prima anual ' +
      'como doce veces la mensual con una sola expresión, del tipo de una fórmula de planilla, y al guardar una ' +
      `póliza con prima de 15.250,50 el sistema calculó ${guardada.primaAnual} sin intervención. El cálculo se ` +
      'escribe una vez desde la administración, sin instalar nada ni programar la aplicación: es configuración.',
    evidencia: [capFormula, capFicha],
    medicion: `Prima anual calculada al guardar: ${guardada.primaAnual}`,
  });
});

// ── A.8.3 ────────────────────────────────────────────────────────────────────
test('A.8.3 — Automatización de procesos', async ({ page, browser }, info) => {
  // «Definir una acción automática ante un evento y provocar ese evento para
  //  comprobar que se ejecuta»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(600_000);

  const api = await apiEspo();
  const { list: usuarios } = await listar(api, 'User', { maxSize: 200 });
  const productor = usuarios.find((u: any) => u.userName === PRODUCTOR.userName);

  // La acción: cuando la cobranza de una póliza pasa a vencida, se le crea una
  // tarea de gestión a su productor. El cálculo de A.8.2 se conserva.
  const script = [
    'primaAnual = prima * 12;',
    "ifThen(entity\\isAttributeChanged('estadoPago') && estadoPago == 'Vencida',",
    "  record\\create('Task', 'name', string\\concatenate('Gestionar cobranza de ', name),",
    "    'assignedUserId', assignedUserId, 'parentType', 'CPoliza', 'parentId', id)",
    ');',
  ].join('\n');

  await entrar(page, plataforma);
  await escribirGuion(page, 'CPoliza', 'beforeSaveCustomScript', script);
  const capRegla = await capturar(page, 'A.8.3', plataforma, '1-regla');
  await guardarGuion(page);

  // Se provoca el evento desde la ficha, como lo haría el usuario
  const id = await crear(api, 'CPoliza', {
    name: 'POL-VENCE-AUTOMATIZACION', tipoPoliza: 'Hogar', estadoPago: 'Al dia', assignedUserId: productor.id,
  });
  await edicion(page, 'CPoliza', id);
  await page.locator('.field[data-name="estadoPago"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'estadoPago', 'Vencida');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(5000);

  const tareas = (await listar(api, 'Task', { maxSize: 50 })).list
    .filter((t: any) => t.parentId === id);
  await pestana(page, 'Task');
  await page.waitForTimeout(4000);
  const capTarea = await capturar(page, 'A.8.3', plataforma, '2-tarea-creada-sola');

  expect(tareas.length, 'el cambio de estado debe haber creado la tarea sola').toBe(1);
  expect(tareas[0].assignedUserId, 'la tarea debe quedar a cargo del productor de la póliza').toBe(productor.id);

  const fuentes = [
    await citar(browser, {
      url: 'https://www.espocrm.com/extensions/advanced-pack/',
      buscar: 'Workflows',
      captura: 'A-8-3-espocrm-3-advanced-pack',
    }),
    ...await constanciaDe(browser, ESPOCRM_ADVANCED_PACK, 'A-8-3-espocrm'),
    ...await constanciaDe(browser, ESPOCRM_CLOUD_BASIC, 'A-8-3-espocrm-nube'),
  ];

  registrar({
    criterio: 'A.8.3',
    plataforma,
    cumple: 2,
    costo: 2,
    justificacion:
      'Se definió una acción automática sobre un evento: cuando la cobranza de una póliza pasa a vencida, el ' +
      'sistema le crea una tarea de gestión a su productor. Se provocó el evento cambiando el estado desde la ' +
      `ficha, y la tarea "${tareas[0].name}" apareció sola, asignada al productor y vinculada a la póliza. La ` +
      'edición gratuita lo resuelve, pero con la fórmula de la entidad, que para esto exige escribir un script ' +
      'con condiciones y funciones del sistema: es desarrollo, aunque sea breve, y lo tiene que mantener ' +
      'alguien que sepa leerlo. El fabricante vende un motor de flujos de trabajo que define la misma regla ' +
      'desde pantallas, sin escribir código.',
    evidencia: [capRegla, capTarea],
    documentacion: fuentes,
    conPlan: [conPlanDe(ESPOCRM_ADVANCED_PACK, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con los flujos de trabajo de la extensión, la condición y la acción se eligen desde la administración ' +
        'sin escribir código: la misma regla pasa de desarrollo a configuración.',
    }), conPlanDe(ESPOCRM_CLOUD_BASIC, {
      cumple: 2,
      costo: 1,
      justificacion:
        'El servicio en la nube incluye los flujos de trabajo entre todas las extensiones del fabricante: la ' +
        'regla se define desde pantallas, igual que con la extensión comprada aparte.',
    })],
    medicion: 'Tarea creada automáticamente al cambiar el estado de cobranza',
  });
});

// ── A.8.4 ────────────────────────────────────────────────────────────────────
test('A.8.4 — Conservación de la parametrización al actualizar', async ({ page, browser }, info) => {
  // «Aplicar o consultar el procedimiento de actualización y determinar qué
  //  ocurre con las entidades y campos creados por la compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(300_000);

  const fuente = await citar(browser, {
    url: 'https://docs.espocrm.com/administration/upgrading/',
    buscar: 'should not break customizations made via the UI',
    captura: 'A-8-4-espocrm-1-actualizacion',
  });

  // Lo que la compañía parametrizó está hecho por pantalla, y así se comprueba
  await entrar(page, plataforma);
  await administracion(page, '#Admin/entityManager');
  await page.waitForTimeout(5000);
  const propias = /Póliza/.test(await textoDe(page)) && /Endoso/.test(await textoDe(page));
  const capModelo = await capturar(page, 'A.8.4', plataforma, '2-parametrizacion-por-pantalla');

  expect(propias, 'la parametrización evaluada debe ser la hecha por pantalla').toBeTruthy();

  registrar({
    criterio: 'A.8.4',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'El procedimiento oficial de actualización distingue dos clases de personalización: la hecha desde la ' +
      'interfaz, que la actualización no debería romper, y la hecha con código, que sí puede romperse. Todo lo ' +
      'que este análisis parametrizó —la póliza, el endoso, sus campos, sus diseños y su fórmula— se hizo desde ' +
      'la administración, sin tocar código, de modo que queda del lado que el fabricante se compromete a ' +
      'conservar. No hay nada que preparar para que se conserve.',
    evidencia: [capModelo],
    documentacion: fuente,
  });
});
