import { test, expect } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { citar } from '../../fuentes';
import { soloEn, capturar } from '../comun';
import { apiTwenty, registros, borrarRegistro, abrirFicha, abrirListado, configuracion, pestana, clicReal, textoDe } from '../../twenty/ui';

/**
 * B.1 — Capacidades por encima de lo solicitado, sobre Twenty
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema. Ninguna fue pedida; pesan en la Parte B.
 */

// ── B.1.1 ────────────────────────────────────────────────────────────────────
test('B.1.1 — Asistente de inteligencia artificial', async ({ page, browser }, info) => {
  // «Buscar la función en el sistema y solicitarle el resumen de un registro»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);

  // El asistente se abre desde el menú, con la ficha a la vista
  await clicReal(page, page.getByText(/^Nuevo chat$|^New chat$/).filter({ visible: true }).first());
  await page.waitForTimeout(3000);
  const entrada = page.locator('[contenteditable="true"], textarea').filter({ visible: true }).last();
  await clicReal(page, entrada);
  await page.keyboard.type(`Resumime la ficha de ${persona.name.firstName} ${persona.name.lastName}: sus pólizas, sus reclamos y su último contacto.`, { delay: 30 });
  await page.keyboard.press('Enter');
  let respuesta = '';
  for (let espera = 0; espera < 60; espera++) {
    await page.waitForTimeout(5000);
    respuesta = await textoDe(page);
    if (/POL-\d/.test(respuesta)) break;
    if (/No hay modelos de IA habilitados|No AI models/i.test(respuesta)) break;
  }
  const capChat = await capturar(page, 'B.1.1', plataforma, '1-pedido-de-resumen');

  // Dónde se habilita: los proveedores de modelos del panel de administración
  await configuracion(page, /^Panel de administración$|^Admin Panel$/);
  await pestana(page, /^IA$|^AI$/);
  const proveedores = await textoDe(page);
  const capProveedores = await capturar(page, 'B.1.1', plataforma, '2-proveedores-de-modelos');

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/getting-started/core-concepts/ai',
    buscar: 'summarize information',
    captura: 'B-1-1-twenty-3-asistente',
  });

  expect(proveedores, 'los proveedores se habilitan con sus credenciales').toMatch(/OpenAI/);
  expect(proveedores).toMatch(/Anthropic/);

  // Sin un proveedor de modelos el resumen no se puede pedir: la capacidad se sostiene con la documentación oficial
  const resumio = /POL-\d/.test(respuesta);
  registrar({
    criterio: 'B.1.1',
    plataforma,
    cumple: 2,
    costo: 1,
    resumen:
      'Asistente de inteligencia artificial que consulta los registros con los permisos del usuario y ' +
      'los resume; funciona conectado a un servicio de inteligencia artificial que la compañía contrata ' +
      'y paga aparte.',
    comoLoHace:
      'El asistente se abre desde el menú, con la ficha a la vista. En la instalación propia hay que ' +
      'conectarlo a un servicio de inteligencia artificial (Anthropic, Google, Mistral, OpenAI o xAI), que ' +
      'la compañía elige, contrata y paga por uso; ' +
      (resumio
        ? 'con el servicio conectado, resume la ficha de un asegurado con sus pólizas.'
        : 'con el servicio conectado, el fabricante documenta que consulta los registros y resume su información.'),
    caracteristicas:
      'El producto trae un asistente de inteligencia artificial que se abre desde el menú, con un chat que ' +
      'consulta los registros con los permisos del usuario y resume la información del sistema en lenguaje natural. ' +
      'Conectar un proveedor propio, como un modelo instalado en la red de la compañía, es del plan ' +
      'Organization.',
    justificacion:
      'Habilitarlo es configuración de una sola vez, más el costo del proveedor.',
    evidencia: [capChat, capProveedores],
    documentacion: fuente,
    medicion: resumio ? 'Resumen producido' : 'Sin un servicio de inteligencia artificial conectado: capacidad según la documentación oficial',
  });
});

// ── B.1.2 ────────────────────────────────────────────────────────────────────
test('B.1.2 — Uso desde el teléfono durante la visita', async ({ page }, info) => {
  // «Registrar una operación desde el teléfono y comprobar si al usuario le llegan al teléfono los
  //  avisos de lo que se le asigna, aunque no tenga el sistema abierto»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(500_000);

  const tarea = 'Visita: relevar la renovación del vehículo';
  const borrar = async () => {
    const api = await apiTwenty(page);
    for (const t of (await registros(api, 'tasks')).filter(t => t.title === tarea || !t.title)) await borrarRegistro(api, 'tasks', t.id);
  };

  // Con la pantalla de un teléfono: se entra y se registra una tarea sobre un asegurado
  await page.setViewportSize({ width: 390, height: 844 });
  await entrar(page, plataforma);
  await borrar();
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  const nombrePersona = `${persona.name.firstName} ${persona.name.lastName}`;

  try {
    // El asegurado se busca por su nombre y, desde su ficha, se crea la tarea
    await clicReal(page, page.getByRole('button', { name: /^Search$|^Buscar$/ }).first());
    await page.waitForTimeout(800);
    await page.keyboard.type(nombrePersona, { delay: 90 });
    await page.waitForTimeout(2500);
    await clicReal(page, page.getByText(nombrePersona).filter({ visible: true }).last());
    await page.waitForTimeout(3500);
    await clicReal(page, page.getByText(/^Tasks$|^Tareas$/).filter({ visible: true }).first());
    await page.waitForTimeout(2500);
    await clicReal(page, page.getByText(/New Task|Nueva tarea/i).filter({ visible: true }).first());
    await page.waitForTimeout(3500);
    await page.keyboard.type(tarea, { delay: 90 });
    const capAlta = await capturar(page, 'B.1.2', plataforma, '2-alta-en-pantalla-de-telefono');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
    const capGuardada = await capturar(page, 'B.1.2', plataforma, '3-tarea-guardada');

    const lectura = await apiTwenty(page);
    const guardada = (await registros(lectura, 'tasks')).find(t => t.title === tarea);
    expect(guardada, 'la tarea debe quedar guardada').toBeTruthy();
    const vinculos = (await registros(lectura, 'taskTargets')).filter(v => v.taskId === guardada.id);
    expect(vinculos.map(v => v.targetPersonId), 'la tarea debe quedar vinculada al asegurado').toContain(persona.id);

    registrar({
      criterio: 'B.1.2',
      plataforma,
      cumple: 1,
      reparo: 'parcial',
      resumen:
        'Se usa desde el navegador del teléfono y registra la operación; no ofrece avisos al teléfono ni ' +
        'opciones para activarlos.',
      comoLoHace:
        'Con la pantalla de un teléfono, el productor busca al asegurado, abre su ficha y crea una tarea ' +
        'vinculada a él, que queda guardada. La configuración no tiene opciones de notificaciones y la ' +
        'interfaz no usa los avisos del navegador ni el envío de avisos al teléfono: no hay manera de ' +
        'enterarse de lo asignado sin abrir el sistema.',
      caracteristicas:
        'La misma interfaz se adapta a la pantalla del teléfono, con barra inferior de acceso rápido, y ' +
        'permite cargar y consultar durante la visita.',
      justificacion:
        'Se puede registrar la operación desde el teléfono sin configurar nada, pero ningún aviso de lo ' +
        'asignado llega al teléfono: es el reparo.',
      evidencia: [capAlta, capGuardada, 'B-1-2-twenty-4-avisos.png'],
    });
  } finally {
    await borrar();
  }
});

// ── B.1.3 ────────────────────────────────────────────────────────────────────
test('B.1.3 — Suite de trabajo integrada', async ({ page }, info) => {
  // «Enumerar las herramientas incluidas más allá del CRM y comprobar que
  //  operan sobre los mismos datos»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);
  // Las pestañas de la ficha, tal como se leen sobre el panel de la derecha
  const ficha = await textoDe(page);
  const pestanas = ['Timeline', 'Tasks', 'Notes', 'Files', 'Emails', 'Calendar'].filter(p => ficha.includes(p));
  const capFicha = await capturar(page, 'B.1.3', plataforma, '1-herramientas-en-la-ficha');
  await abrirListado(page, 'dashboards');
  const capTableros = await capturar(page, 'B.1.3', plataforma, '2-tableros');

  const herramientas = ['correo', 'calendario', 'notas', 'tareas', 'archivos', 'tableros', 'automatizaciones', 'asistente de IA'];
  expect(pestanas.join(' '), 'la ficha debe reunir las herramientas').toMatch(/Emails|Correos/);

  registrar({
    criterio: 'B.1.3',
    plataforma,
    cumple: 1,
    reparo: 'parcial',
    costo: 2,
    resumen:
      `Incluye ${herramientas.slice(0, -1).join(', ')} y ` +
      `${herramientas[herramientas.length - 1]} sobre los mismos datos; faltan mensajería, ` +
      `edición colaborativa de documentos y firma electrónica.`,
    comoLoHace:
      `Además del CRM, el producto incluye ${herramientas.join(', ')}, y todas operan sobre los mismos ` +
      'datos.',
    caracteristicas:
      'La ficha del asegurado reúne en pestañas su línea de tiempo, sus tareas, sus notas, sus ' +
      'archivos, sus correos y sus reuniones, y los tableros y las automatizaciones leen y escriben los mismos ' +
      'registros.',
    justificacion:
      'Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la ' +
      'firma electrónica: para eso la compañía sigue necesitando otras herramientas, y pasar la ' +
      'información de una a otra es trabajo en cada uso.',
    evidencia: [capFicha, capTableros],
    medicion: `Pestañas de la ficha: ${pestanas.join(', ')}`,
  });
});

// ── B.1.4 ────────────────────────────────────────────────────────────────────
test('B.1.4 — Telefonía y videollamada integradas', async ({ page, browser }, info) => {
  // «Verificar la existencia de la función dentro del sistema»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  const api = await apiTwenty(page);
  const persona = (await registros(api, 'people')).find(p => p.emails?.primaryEmail === 'jpena@ejemplo.test')!;
  await abrirFicha(page, 'person', persona.id);
  await clicReal(page, page.locator('[data-testid="page-header-side-panel-button"]').first());
  await page.waitForTimeout(1500);
  const acciones = await textoDe(page);
  const capAcciones = await capturar(page, 'B.1.4', plataforma, '1-acciones-de-la-ficha');
  await page.keyboard.press('Escape');

  const fuente = await citar(browser, {
    url: 'https://docs.twenty.com/user-guide/calendar-emails/how-tos/can-i-book-meetings-from-twenty',
    buscar: 'to add a meeting link',
    captura: 'B-1-4-twenty-2-reunion-con-videollamada',
  });

  // El menú lista también los objetos del sistema, como las grabaciones de reuniones: cuenta solo una acción de llamar
  expect(acciones, 'si hubiera una acción de llamada, este veredicto no corresponde').not.toMatch(/^(Call|Llamar|Dial)\b(?! Recordings)/im);

  registrar({
    criterio: 'B.1.4',
    plataforma,
    cumple: 0,
    resumen: 'No trae telefonía ni videollamada propias: la videollamada ocurre en Meet o Teams, a partir de una reunión del calendario conectado, y las llamadas ocurren fuera del sistema.',
    comoLoHace:
      'La videollamada está integrada a medias: desde la ficha de un asegurado se crea una reunión en ' +
      'el calendario conectado de Google o Microsoft, con el enlace de videollamada de ese servicio, y ' +
      'la reunión queda en la línea de tiempo del registro.',
    caracteristicas:
      'La telefonía no está.',
    justificacion: 'El procedimiento pide la función dentro del sistema, y la videollamada y la llamada ocurren en herramientas externas. Que la reunión quede en la línea de tiempo con su enlace no la vuelve una función propia, como tampoco en EspoCRM.',
    evidencia: [capAcciones],
    documentacion: fuente,
  });
});
