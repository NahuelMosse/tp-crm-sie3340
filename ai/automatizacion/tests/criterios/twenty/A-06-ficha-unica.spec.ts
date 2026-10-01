import { test, expect, Page } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import {
  objeto, registros, crearRegistro, borrarRegistro, abrirFicha, abrirListado, elegirEnFicha, escribirEnFicha, valorEnFicha, campoEnFicha,
  clicReal, textoDe, nuevoRegistro, nuevaPersona, nuevoCampo, conOpciones, quitarCampo,
} from '../../twenty/ui';
import { cargarCartera, alistarReclamo } from '../../twenty/escenario';
import { ASEGURADOS } from '../../datos';

/**
 * A.6 — Ficha única del asegurado, sobre Twenty
 *
 * El asegurado es la persona que trae el producto. La póliza ya está ligada a
 * su titular (ver alistarCamposPoliza).
 */

test.describe.configure({ mode: 'serial' });

const TITULAR = ASEGURADOS[1];   // Joaquín Peña
const POLIZA = 'POL-TITULAR-PENA';

/**
 * Lo que un campo de relación tiene vinculado: la ficha muestra los primeros
 * y abrevia el resto, así que se abre el campo, que los lista marcados. Con
 * registros vinculados, un clic sobre uno lo abre al costado: el campo se edita
 * con el lápiz que aparece al pasar el ratón.
 */
async function vinculados(page: Page, campo: string): Promise<string> {
  const fila = campoEnFicha(page, campo);
  const caja = (await fila.boundingBox())!;
  await page.mouse.move(caja.x + caja.width - 30, caja.y + caja.height / 2, { steps: 8 });
  await page.waitForTimeout(600);
  const lapiz = fila.locator('button').last();
  await clicReal(page, (await lapiz.isVisible().catch(() => false)) ? lapiz : valorEnFicha(page, campo));
  const buscar = page.getByPlaceholder(/^Buscar|^Search/).last();
  await buscar.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1500);
  // El buscador lista todos los registros: los vinculados son los marcados
  return buscar.locator('xpath=ancestor::div[.//input[@type="checkbox"]][1]').evaluate(lista =>
    [...lista.querySelectorAll('input[type="checkbox"]')].filter(c => (c as HTMLInputElement).checked)
      .map(c => c.closest('[role="option"], li, div:has(> input)')?.parentElement?.textContent?.trim() ?? '')
      .join('\n'));
}

// ── A.6.1 ────────────────────────────────────────────────────────────────────
test('A.6.1 — Vinculación de la póliza con su titular', async ({ page, browser }, info) => {
  // «Relacionar la póliza con un contacto, abrir la ficha del contacto y
  //  comprobar que la póliza figura allí; abrir la póliza y comprobar que
  //  muestra al titular»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  for (const p of (await registros(e.api, 'polizas')).filter(p => p.name === POLIZA)) await borrarRegistro(e.api, 'polizas', p.id);

  const id = await nuevoRegistro(page, 'polizas', 'Póliza', POLIZA);
  await abrirFicha(page, 'poliza', id);
  await elegirEnFicha(page, 'titular', `${TITULAR.firstName} ${TITULAR.lastName}`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid="record-fields-widget"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(2500);
  const enPoliza = (await textoDe(page)).includes(TITULAR.lastName);
  const capPoliza = await capturar(page, 'A.6.1', plataforma, '1-poliza-con-titular');

  await abrirFicha(page, 'person', e.asegurados[1]);
  const polizas = await vinculados(page, 'polizas');
  const capFicha = await capturar(page, 'A.6.1', plataforma, '2-ficha-del-titular');
  await page.keyboard.press('Escape');

  expect(enPoliza, 'la póliza debe mostrar al titular').toBeTruthy();
  expect(polizas, 'la ficha del titular debe listar la póliza').toContain(POLIZA);

  registrar({
    criterio: 'A.6.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La póliza se liga con la persona que es su titular mediante un campo de relación, que se define una vez ' +
      'desde el modelo de datos, sin programar: cada póliza tiene un titular y una persona puede tener muchas ' +
      'pólizas. Al definirlo, la ficha de la persona suma sola el campo con sus pólizas. Se cargó una póliza, ' +
      'se eligió al titular buscándolo por nombre, y las dos puntas del vínculo quedaron a la vista: la póliza ' +
      'muestra al titular y la ficha del asegurado lista la póliza junto con las demás suyas.',
    evidencia: [capPoliza, capFicha],
  });
});

// ── A.6.2 ────────────────────────────────────────────────────────────────────
test('A.6.2 — Vista única del asegurado', async ({ page, browser }, info) => {
  // «Abrir la ficha de un asegurado y comprobar si desde allí se llega a todo
  //  lo suyo —pólizas, actividad y reclamos— sin buscarlo en otro menú»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  await alistarReclamo(e.api);
  const asegurado = e.asegurados[1];
  const RECLAMO = 'Consulta por cobertura de hogar — Peña';
  const TAREA = 'Llamada de bienvenida — Peña';
  for (const r of (await registros(e.api, 'reclamos')).filter(r => r.name === RECLAMO)) await borrarRegistro(e.api, 'reclamos', r.id);
  for (const t of (await registros(e.api, 'tasks')).filter(t => t.title === TAREA)) await borrarRegistro(e.api, 'tasks', t.id);

  // Lo suyo: un reclamo y una tarea, además de las pólizas
  await crearRegistro(e.api, 'reclamos', { name: RECLAMO, aseguradoId: asegurado });
  const tarea = await crearRegistro(e.api, 'tasks', { title: TAREA, status: 'DONE' });
  await crearRegistro(e.api, 'taskTargets', { taskId: tarea.id, targetPersonId: asegurado });

  await abrirFicha(page, 'person', asegurado);
  await page.waitForTimeout(2500);
  const capFicha = await capturar(page, 'A.6.2', plataforma, '1-ficha-completa');
  const polizas = await vinculados(page, 'polizas');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const reclamos = await vinculados(page, 'reclamos');
  const capReclamos = await capturar(page, 'A.6.2', plataforma, '2-reclamos-desde-la-ficha');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await clicReal(page, page.getByText(/^Tasks$|^Tareas$/).filter({ visible: true }).first());
  await page.waitForTimeout(3000);
  const actividad = await textoDe(page);
  const capActividad = await capturar(page, 'A.6.2', plataforma, '3-actividad-desde-la-ficha');
  const pestanas = await page.locator('[role="tab"], [data-testid^="tab-"]').allInnerTexts().catch(() => [] as string[]);

  expect(polizas, 'la ficha debe llevar a sus pólizas').toContain(POLIZA);
  expect(reclamos, 'la ficha debe llevar a sus reclamos').toContain(RECLAMO);
  expect(actividad, 'la ficha debe mostrar su actividad').toContain(TAREA);

  registrar({
    criterio: 'A.6.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La ficha de la persona reúne lo suyo: a la izquierda, sus campos, entre ellos sus pólizas y sus ' +
      'reclamos, que se abren desde ahí; a la derecha, pestañas con la línea de tiempo de cambios, las tareas, ' +
      'las notas, los archivos, los correos y el calendario. Desde la ficha de un asegurado se llegó a su ' +
      'póliza, a su reclamo y a la tarea hecha con él sin pasar por otro menú. La actividad viene de fábrica; ' +
      'las pólizas y los reclamos aparecen al definir sus relaciones con la persona, que es configuración de ' +
      'una sola vez.',
    evidencia: [capFicha, capReclamos, capActividad],
    medicion: pestanas.length ? `Pestañas de la ficha: ${pestanas.map(p => p.trim()).filter(Boolean).join(', ')}` : undefined,
  });
});

// ── A.6.3 ────────────────────────────────────────────────────────────────────
test('A.6.3 — Campos propios del rubro en la ficha', async ({ page, browser }, info) => {
  // «Agregar a la ficha del asegurado un campo que el producto no trae —la
  //  valoración que dejó sobre la atención recibida— y comprobar que queda
  //  disponible en el alta y en la búsqueda»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const ETIQUETA = 'Valoración de la atención';
  await quitarCampo(e.api, 'person', ETIQUETA);
  await nuevoCampo(page, 'people', 'Select', ETIQUETA, conOpciones(['Muy buena', 'Buena', 'Regular', 'Mala']));
  const campo = (await objeto(e.api, 'person')).fields.find((c: any) => c.label === ETIQUETA).name;

  await abrirFicha(page, 'person', e.asegurados[1]);
  await elegirEnFicha(page, campo, 'Muy buena');
  const capAlta = await capturar(page, 'A.6.3', plataforma, '1-en-la-ficha');

  await abrirListado(page, 'people');
  await clicReal(page, page.getByRole('button', { name: /^Filtro$|^Filter$/ }).first());
  await clicReal(page, page.getByText(ETIQUETA, { exact: true }).last());
  await page.waitForTimeout(1200);
  await clicReal(page, page.getByText('Muy buena', { exact: true }).filter({ visible: true }).last());
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  const filas = await page.locator('[data-testid^="row-id-"]').evaluateAll(fs => fs.map(f => f.getAttribute('data-selectable-id')));
  const capBusqueda = await capturar(page, 'A.6.3', plataforma, '2-en-la-busqueda');

  expect(filas, 'debe poder buscarse por el campo nuevo').toContain(e.asegurados[1]);
  expect(filas.length, 'el filtro deja solo a los que tienen ese valor').toBeLessThan(e.asegurados.length);

  registrar({
    criterio: 'A.6.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Se agregó a la persona un campo que el producto no trae —la valoración que dejó sobre la atención ' +
      'recibida, con cuatro valores— desde el modelo de datos. Apareció solo en la ficha, sin ubicarlo en ' +
      'ningún diseño; se cargó en un asegurado y se lo pudo usar enseguida como condición de filtro del ' +
      'listado para ver a los que valoraron la atención como muy buena. Es configuración de una sola vez, sin ' +
      'programar.',
    evidencia: [capAlta, capBusqueda],
  });
});

// ── A.6.4 ────────────────────────────────────────────────────────────────────
test('A.6.4 — Unicidad de la ficha del asegurado', async ({ page, browser }, info) => {
  // «Cargar dos veces un asegurado con el mismo documento y comprobar si el
  //  sistema advierte la duplicación»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const DOCUMENTO = '30111222';
  const conEseNombre = async () => (await registros(e.api, 'people')).filter(p => p.name?.firstName === 'Esteban' && /^Quiroga/.test(p.name?.lastName ?? ''));
  for (const p of await conEseNombre()) await borrarRegistro(e.api, 'people', p.id);
  await quitarCampo(e.api, 'person', 'Documento');

  // El documento, como campo de texto marcado «Único» al crearlo
  await nuevoCampo(page, 'people', 'Text', 'Documento', async p => {
    const fila = p.getByText(/^Único$|^Unique$/).first().locator('xpath=ancestor::div[.//*[@role="switch"]][1]');
    await clicReal(p, fila.getByRole('switch').first());
    await p.waitForTimeout(800);
  });
  const capCampo = await capturar(page, 'A.6.4', plataforma, '1-campo-unico');
  const campo = (await objeto(e.api, 'person')).fields.find((c: any) => c.label === 'Documento');

  let aviso = '', capDuplicado = '', guardados = 0;
  try {
    const primera = await nuevaPersona(page, 'Esteban', 'Quiroga');
    await abrirFicha(page, 'person', primera);
    await escribirEnFicha(page, campo.name, DOCUMENTO);

    // Mismo documento, apellido escrito distinto: el error típico de la ventanilla
    const segunda = await nuevaPersona(page, 'Esteban', 'Quiroga Ruiz');
    await abrirFicha(page, 'person', segunda);
    await clicReal(page, valorEnFicha(page, campo.name));
    const entrada = page.locator('input:focus, textarea:focus').first();
    await entrada.waitFor({ state: 'visible', timeout: 15_000 });
    await entrada.pressSequentially(DOCUMENTO, { delay: 60 });
    await entrada.press('Enter');
    await page.waitForTimeout(2500);
    aviso = await textoDe(page);
    capDuplicado = await capturar(page, 'A.6.4', plataforma, '2-duplicado-advertido');
    guardados = (await registros(e.api, 'people')).filter(p => p[campo.name] === DOCUMENTO).length;
  } finally {
    // La unicidad es parte de la medición: se quita para no alterar las altas de los demás criterios
    for (const p of await conEseNombre()) await borrarRegistro(e.api, 'people', p.id);
    await quitarCampo(e.api, 'person', 'Documento');
  }
  const mensaje = aviso.split('\n').find(l => /already|ya existe|ya está|único|unique|duplica/i.test(l)) ?? '';
  console.log(`    ${guardados} con ese documento; aviso «${mensaje}»`);

  expect(campo.isUnique, 'el campo debe quedar marcado como único').toBeTruthy();
  expect(guardados, 'el segundo documento igual no debe guardarse').toBe(1);
  expect(mensaje, 'el sistema debe advertir el duplicado').not.toBe('');

  registrar({
    criterio: 'A.6.4',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'De fábrica la persona se compara por nombre, correo y perfil de LinkedIn para sugerir duplicados, pero ' +
      'no trae documento. Se agregó el documento como campo de texto y, al crearlo, se lo marcó como único con ' +
      'un interruptor de la misma pantalla. Se cargó un asegurado con su documento y, al cargar otro con el ' +
      `mismo documento y el apellido escrito distinto, el sistema rechazó el valor y avisó: «${mensaje}». La ` +
      'necesidad queda resuelta con configuración de una sola vez, sin programar.',
    evidencia: [capCampo, capDuplicado],
    medicion: `${guardados} ficha con el documento repetido`,
  });
});
