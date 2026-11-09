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
import { administracion, alta, ficha, edicion, pestana, listado } from '../espocrm/navegar';
import { copiarEspoCrm, actualizarEspoCrm, versionEspo, sqlEspo, retirarCopia } from '../actualizacion';

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
    resumen:
      'Crea entidades nuevas desde un formulario de administración, eligiendo nombre, etiquetas y tipo, sin ' +
      'escribir código ni reiniciar nada; quedan operativas en el acto.',
    comoLoHace:
      'El Administrador de Entidades crea una entidad desde un formulario de la administración: se indican ' +
      'el nombre, las etiquetas en singular y plural y el tipo, entre los 5 que ofrece (Base, Base Plus, ' +
      'Evento, Persona, Empresa).',
    caracteristicas:
      'No hizo falta escribir código, tocar archivos del servidor ni reiniciar nada: la entidad quedó ' +
      'disponible en el acto y admitió su primer registro.',
    justificacion:
      'Es trabajo de configuración que se hace una vez, y es lo que permite que el modelo de datos siga al ' +
      'negocio asegurador en lugar de obligar al negocio a acomodarse a un modelo genérico.',
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
    resumen:
      'Calcula un campo a partir de otros al guardar, con una expresión de tipo planilla definida en la ' +
      'fórmula de cada entidad, sin programar.',
    comoLoHace:
      'El cálculo se define con una sola expresión, del tipo de una fórmula de planilla —por ejemplo, la ' +
      'prima anual como doce veces la mensual—, y al guardar una póliza el sistema lo calcula sin ' +
      'intervención.',
    caracteristicas:
      'La administración de cada entidad trae una fórmula que, según la propia pantalla, "se ejecuta cada ' +
      'vez que se guarda una entidad" y "se utiliza para configurar campos calculados".',
    justificacion:
      'El cálculo se escribe una vez desde la administración, sin instalar nada ni programar la aplicación: ' +
      'es configuración.',
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
    resumen:
      'Ejecuta una acción automática ante un evento mediante un guion escrito en el sistema, que ' +
      'exige desarrollo. El motor de flujos del fabricante lo haría desde pantallas.',
    comoLoHace:
      'Se define una acción automática sobre un evento: cuando la cobranza de una póliza pasa a vencida, el ' +
      'sistema crea una tarea de gestión a su productor. Al cambiar el estado desde la ficha, la tarea ' +
      'aparece sola, asignada al productor y vinculada a la póliza.',
    caracteristicas:
      'La edición gratuita lo resuelve, pero con la fórmula de la entidad, que para esto exige escribir un ' +
      'script con condiciones y funciones del sistema: es desarrollo, aunque sea breve, y lo tiene que ' +
      'mantener alguien que sepa leerlo.',
    justificacion:
      'El fabricante vende un motor de flujos de trabajo que define la misma regla desde pantallas, sin ' +
      'escribir código.',
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
  test.setTimeout(3_600_000);

  // La actualización se aplica sobre una copia de la instalación, en un puerto pedido al gobernador
  const puerto = Number(process.env.A84_ESPOCRM_PUERTO);
  if (!puerto) throw new Error('Falta A84_ESPOCRM_PUERTO: el puerto de la copia que se actualiza');
  const URL_COPIA = `http://localhost:${puerto}/`;
  const DE = '10.0.4';
  const A = '10.0.11';
  const NUEVA = 'POL-ACTUALIZADA-001';

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/docker/installation/',
      buscar: 'Within a few minutes the container will be upgraded to the latest version',
      captura: 'A-8-4-espocrm-1-actualizacion-con-docker',
    }),
    await citar(browser, {
      url: 'https://docs.espocrm.com/administration/upgrading/',
      buscar: 'should not break customizations made via the UI',
      captura: 'A-8-4-espocrm-2-personalizacion-por-interfaz',
    }),
  ];

  const copia = await copiarEspoCrm(puerto, DE);
  try {
    const origen = versionEspo();
    const antes = {
      polizas: Number(sqlEspo('SELECT COUNT(*) FROM c_poliza WHERE deleted = 0')),
      endosos: Number(sqlEspo('SELECT COUNT(*) FROM c_endoso WHERE deleted = 0')),
    };
    const [previaId, previaNombre, previaPrima] = sqlEspo(
      "SELECT id, name, prima, prima_anual FROM c_poliza WHERE deleted = 0 AND prima IS NOT NULL AND name LIKE 'POL-CART-%' ORDER BY created_at LIMIT 1").split('\t');
    expect(origen, 'la copia debe partir de la versión de origen').toContain(DE);

    // La actualización, con el procedimiento oficial para Docker
    await actualizarEspoCrm(copia, A);
    const destino = versionEspo();
    expect(destino, 'la copia debe quedar en la versión nueva').toContain(A);

    // Lo que ocurrió con lo parametrizado se comprueba por pantalla, en la copia actualizada
    await page.goto(URL_COPIA, { waitUntil: 'domcontentloaded' });
    const usuario = page.locator('#field-userName');
    await usuario.waitFor({ state: 'visible', timeout: 60_000 });
    await usuario.fill('admin');
    await page.locator('#field-password').fill('Admin1234!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(3000);

    // 1. Las entidades propias siguen en el administrador de entidades
    await administracion(page, '#Admin/entityManager');
    await page.waitForTimeout(3000);
    const entidades = await textoDe(page);
    const capEntidades = await capturar(page, 'A.8.4', plataforma, '3-entidades-propias');
    expect(entidades).toMatch(/Póliza/);
    expect(entidades).toMatch(/Endoso/);
    expect(entidades).toMatch(/Cuota/);

    // 2. La fórmula de la póliza sigue guardada
    await administracion(page, '#Admin/entityManager', '#Admin/entityManager/scope=CPoliza',
      page.locator('#main [data-action="editFormula"]').first());
    await page.locator('.modal-dialog:visible a[href*="type=beforeSaveCustomScript"]').first().click();
    const editor = page.locator('#main .ace_editor').first();
    await editor.waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(2000);
    const guion: string = await editor.evaluate(el => (window as any).ace.edit(el).getValue());
    const capFormula = await capturar(page, 'A.8.4', plataforma, '4-formula-conservada');
    expect(guion).toContain('primaAnual = prima * 12');

    // 3. La póliza cargada antes de actualizar, con sus campos propios y sus valores
    await listado(page, 'CPoliza');
    await page.locator('.search-container input.text-filter').first().fill(previaNombre);
    const busqueda = page.waitForResponse(r => r.url().includes('/api/v1/CPoliza?') && r.url().includes('where'), { timeout: 30_000 }).catch(() => null);
    await page.locator('.search-container [data-action="search"]').first().click();
    await busqueda;
    await page.waitForTimeout(2000);
    await page.locator(`#main a[href="#CPoliza/view/${previaId}"]`).filter({ visible: true }).first().click();
    await page.waitForFunction(id => location.hash === `#CPoliza/view/${id}`, previaId, { timeout: 30_000 });
    await page.locator('#main .detail-button-container').first().waitFor({ state: 'visible', timeout: 40_000 });
    await page.waitForTimeout(3500);
    const fichaPrevia = await textoDe(page);
    const capPrevia = await capturar(page, 'A.8.4', plataforma, '5-poliza-anterior');
    expect(fichaPrevia).toMatch(/Tipo de p[óo]liza/i);
    expect(fichaPrevia).toMatch(/Prima mensual/i);
    expect(fichaPrevia).toContain(previaNombre);
    expect(fichaPrevia.replace(/[.,\s]/g, '')).toContain(`${Math.round(Number(previaPrima))}00`);

    // 4. Un alta nueva: el formulario con sus campos y la fórmula siguen funcionando
    await alta(page, 'CPoliza');
    const campo = (nombre: string) => page.locator(`.field[data-name="${nombre}"] input[data-name="${nombre}"]`).first();
    await campo('name').waitFor({ state: 'visible', timeout: 40_000 });
    await campo('name').pressSequentially(NUEVA);
    await elegirLista(page, 'tipoPoliza', 'Hogar');
    await elegirLista(page, 'estadoPago', 'Al dia');
    await campo('prima').click();
    await campo('prima').pressSequentially('1000');
    const capAlta = await capturar(page, 'A.8.4', plataforma, '6-alta-nueva');
    await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
    await page.waitForURL(/#CPoliza\/view\//, { timeout: 30_000 });
    await page.waitForTimeout(4000);
    const fichaNueva = await textoDe(page);
    const capNueva = await capturar(page, 'A.8.4', plataforma, '7-calculo-al-guardar');
    expect(fichaNueva).toContain(NUEVA);
    // La prima anual no está en el formulario: lo guardado se lee de la base de la copia
    const anualNueva = Number(sqlEspo(`SELECT prima_anual FROM c_poliza WHERE name = '${NUEVA}' AND deleted = 0`));
    expect(anualNueva, 'la fórmula debe calcular la prima anual de la póliza nueva').toBe(12000);

    // 5. La regla del cambio de estado también sigue operando
    await page.locator('#main [data-action="edit"]').filter({ visible: true }).first().click();
    await page.locator('#main [data-action="save"]').filter({ visible: true }).first().waitFor({ timeout: 30_000 });
    await elegirLista(page, 'estadoPago', 'Vencida');
    await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
    await page.waitForTimeout(5000);
    await pestana(page, 'Task');
    await page.waitForTimeout(4000);
    const tareas = await textoDe(page);
    const capTarea = await capturar(page, 'A.8.4', plataforma, '8-tarea-creada-sola');
    expect(tareas).toContain(`Gestionar cobranza de ${NUEVA}`);

    const despues = {
      polizas: Number(sqlEspo(`SELECT COUNT(*) FROM c_poliza WHERE deleted = 0 AND name <> '${NUEVA}'`)),
      endosos: Number(sqlEspo('SELECT COUNT(*) FROM c_endoso WHERE deleted = 0')),
    };
    expect(despues, 'los registros cargados antes deben seguir todos').toEqual(antes);

    registrar({
      criterio: 'A.8.4',
      plataforma,
      cumple: 2,
      costo: 0,
      resumen:
        'Conserva entidades, campos, diseños, fórmulas y registros al actualizar de versión con el ' +
        'procedimiento oficial para Docker, sin rehacer ni reconfigurar nada.',
      comoLoHace:
        'Se aplica el procedimiento oficial para Docker: se cambia la imagen y se vuelve a crear el ' +
        'contenedor con la misma configuración y las mismas carpetas de datos. Tras ingresar con el ' +
        'administrador, las entidades creadas, las fórmulas, los campos propios con sus valores y los ' +
        'registros siguen en su lugar, y las automatizaciones siguen funcionando.',
      caracteristicas:
        'El procedimiento no pide exportar ni volver a cargar la parametrización: entidades, campos, diseños y ' +
        'fórmula viven en las carpetas de datos y en la base, que la actualización conserva. El fabricante ' +
        'declara que las personalizaciones hechas desde la interfaz no deberían romperse con una actualización.',
      justificacion:
        'Al pasar de una versión a otra no hay que rehacer ni reconfigurar nada de lo parametrizado, de ' +
        'modo que la conservación no suma trabajo.',
      evidencia: [capEntidades, capFormula, capPrevia, capAlta, capNueva, capTarea],
      documentacion: fuentes,
    });
  } finally {
    retirarCopia('espocrm', copia.dir);
  }
});
