import { test, expect, escribirDireccion } from '../humano';
import { registrar } from '../evaluar';
import { entrar, entrarComo, plataformaDe } from '../sesion';
import { cargarCartera, PRODUCTOR, rolProductor } from '../datos';
import { apiEspo, crear, listar } from '../api';
import { soloEn, capturar, textoDe, elegirLista } from './comun';
import { administracion, listado as irAlListado, ficha, edicion } from '../espocrm/navegar';

/**
 * A.9 — Control de acceso y trazabilidad
 *
 * Criterios funcionales: la pregunta es si el usuario puede hacerlo desde el
 * sistema.
 */

test.describe.configure({ mode: 'serial' });

let productorId = '';
let propia = '';
let ajena = '';

test.beforeAll(async ({}, info) => {
  if (plataformaDe(info.project.name) !== 'espocrm') return;
  const { api } = await cargarCartera();
  productorId = (await listar(api, 'User', { maxSize: 200 })).list
    .find((u: any) => u.userName === PRODUCTOR.userName).id;
  await rolProductor(api, productorId);

  // Una póliza a cargo del productor y otra que no es suya
  const { list } = await listar(api, 'CPoliza', { maxSize: 200 });
  for (const p of list.filter((p: any) => /^POL-ACCESO-/.test(p.name))) await api.delete(`CPoliza/${p.id}`);
  propia = await crear(api, 'CPoliza', { name: 'POL-ACCESO-PROPIA', tipoPoliza: 'Automotor', assignedUserId: productorId });
  ajena = await crear(api, 'CPoliza', { name: 'POL-ACCESO-AJENA', tipoPoliza: 'Vida' });

  // El ramo se audita: cada cambio queda con el valor anterior, el autor y el momento.
  // A.9.3 declara ese paso de configuración.
  // Se manda la definición entera: una parcial podría vaciar las opciones de la lista.
  const actual = (await (await api.get('Metadata')).json()).entityDefs.CPoliza.fields.tipoPoliza;
  if (!actual.audited) {
    const r = await api.put('Admin/fieldManager/CPoliza/tipoPoliza', { data: { ...actual, audited: true } });
    if (!r.ok()) throw new Error(`No se pudo auditar el ramo: ${r.status()} ${await r.text()}`);
  }
});

// ── A.9.1 ────────────────────────────────────────────────────────────────────
test('A.9.1 — Restricción de la cartera por productor', async ({ page }, info) => {
  // «Crear un usuario con acceso restringido e intentar abrir un registro
  //  ajeno, incluso por dirección directa»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // El rol, tal como quedó definido en la administración
  await entrar(page, plataforma);
  await administracion(page, '#Admin/roles');
  await page.waitForTimeout(4000);
  await page.getByRole('link', { name: 'Productor' }).first().click();
  await page.waitForTimeout(4000);
  const capRol = await capturar(page, 'A.9.1', plataforma, '1-rol-del-productor');

  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await irAlListado(page, 'CPoliza');
  await page.waitForTimeout(5000);
  const listado = await textoDe(page);
  const capListado = await capturar(page, 'A.9.1', plataforma, '2-solo-lo-suyo');

  // Por dirección directa, sin pasar por el listado
  // El procedimiento pide abrirla por su dirección: se la escribe en la barra del navegador
  await escribirDireccion(page, `/#CPoliza/view/${ajena}`);
  await page.waitForTimeout(5000);
  const directa = await textoDe(page);
  const capDirecta = await capturar(page, 'A.9.1', plataforma, '3-direccion-directa');

  // Y por la interfaz de programación con sus credenciales, que es otra puerta
  const { request } = await import('@playwright/test');
  const suya = await request.newContext({ baseURL: 'http://localhost:8705/api/v1/', extraHTTPHeaders: {
    'Espo-Authorization': Buffer.from(`${PRODUCTOR.userName}:${PRODUCTOR.password}`).toString('base64') } });
  const porApi = (await suya.get(`CPoliza/${ajena}`)).status();

  expect(listado).toContain('POL-ACCESO-PROPIA');
  expect(listado).not.toContain('POL-ACCESO-AJENA');
  expect(directa, 'la dirección directa no debe mostrar la póliza ajena').not.toContain('POL-ACCESO-AJENA');
  expect(porApi, 'la interfaz de programación debe negar el acceso').toBe(403);

  registrar({
    criterio: 'A.9.1',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Los roles de la administración definen, entidad por entidad, si el usuario ve todo, lo de su equipo o ' +
      'solo lo suyo. Con un rol de productor restringido a lo propio, su listado de pólizas muestra solo la ' +
      'que tiene a cargo; al pegar en el navegador la dirección de una póliza ajena el sistema niega el acceso, ' +
      'y la interfaz de programación, consultada con sus credenciales, responde que no tiene permiso. La ' +
      'restricción se aplica en el servidor y no solo en la pantalla. Definir el rol es configuración de una ' +
      'vez.',
    evidencia: [capRol, capListado, capDirecta],
    medicion: `Acceso a una póliza ajena por la interfaz de programación: respuesta ${porApi}`,
  });
});

// ── A.9.2 ────────────────────────────────────────────────────────────────────
test('A.9.2 — Autenticación de los usuarios bajo control de la compañía', async ({ page }, info) => {
  // «Revisar qué exige el sistema para validar la identidad: política de
  //  contraseñas, segundo factor y acceso unificado con el directorio de la
  //  compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await administracion(page, '#Admin/authentication');
  await page.waitForTimeout(5000);
  const pantalla = await textoDe(page);
  const capAutenticacion = await capturar(page, 'A.9.2', plataforma, '1-autenticacion');

  // Los métodos que la pantalla ofrece, leídos del desplegable del producto
  await page.locator('.field[data-name="authenticationMethod"] .selectize-input').first().click();
  const metodos = (await page.locator('.selectize-dropdown:visible .option').allTextContents()).map(t => t.trim());
  const capMetodos = await capturar(page, 'A.9.2', plataforma, '2-metodos');
  // Escape en esta pantalla equivale a cancelar la edición: el desplegable se cierra con un clic afuera
  await page.locator('#main h3, #main .page-header').first().click();

  // La política de contraseñas está en su propia pestaña
  await page.locator('#main a:visible, #main button:visible, #main li:visible').filter({ hasText: 'Contraseñas' }).last().click();
  await page.waitForTimeout(2500);
  const contrasenas = await textoDe(page);
  const capContrasenas = await capturar(page, 'A.9.2', plataforma, '3-politica-de-contrasenas');

  const politica = /longitud/i.test(contrasenas);
  const segundoFactor = /2 factores|dos factores|2FA|segundo factor/i.test(pantalla);
  const directorio = metodos.some(m => /LDAP|OIDC|OpenID/i.test(m));

  expect(politica, 'debe ofrecer política de contraseñas').toBeTruthy();
  expect(segundoFactor, 'debe ofrecer segundo factor').toBeTruthy();
  expect(directorio, 'debe ofrecer acceso unificado con un directorio').toBeTruthy();

  registrar({
    criterio: 'A.9.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La pantalla de autenticación de la administración reúne las tres cosas: la política de contraseñas ' +
      '—longitud mínima y exigencia de letras, números y caracteres especiales—, el segundo factor para los ' +
      `usuarios, y el ingreso contra el directorio de la compañía entre ${metodos.length} métodos ` +
      `(${metodos.join(', ')}). La compañía decide cómo se valida la identidad de cada usuario sin depender ` +
      'del fabricante. Viene en el producto y se activa desde esa pantalla: es configuración.',
    evidencia: [capAutenticacion, capMetodos, capContrasenas],
  });
});

// ── A.9.3 ────────────────────────────────────────────────────────────────────
test('A.9.3 — Registro de quién modificó cada dato', async ({ page }, info) => {
  // «Cambiar el ramo de una póliza vigente con un usuario y buscar desde otro
  //  la constancia del cambio: valor anterior, autor y momento»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'espocrm');
  test.setTimeout(500_000);

  // El productor cambia el ramo de su póliza
  await entrarComo(page, PRODUCTOR.userName, PRODUCTOR.password);
  await edicion(page, 'CPoliza', propia);
  await page.locator('.field[data-name="tipoPoliza"]').first().waitFor({ state: 'visible', timeout: 40_000 });
  await elegirLista(page, 'tipoPoliza', 'Hogar');
  await page.getByRole('button', { name: /^Guardar$/ }).first().click();
  await page.waitForTimeout(4000);

  // El administrador busca la constancia
  await entrarComo(page, 'admin', 'Admin1234!');
  await ficha(page, 'CPoliza', propia);
  await page.waitForTimeout(5000);
  const capHistoria = await capturar(page, 'A.9.3', plataforma, '1-constancia-en-la-ficha');

  const api = await apiEspo();
  const notas = (await (await api.get(`CPoliza/${propia}/stream`, { params: { maxSize: 20 } })).json()).list ?? [];
  const cambio = notas.find((n: any) => n.type === 'Update' && n.data?.fields?.includes('tipoPoliza'));

  expect(cambio, 'debe quedar constancia del cambio de ramo').toBeTruthy();
  expect(cambio.data.attributes.was.tipoPoliza, 'con el valor anterior').toBe('Automotor');
  expect(cambio.data.attributes.became.tipoPoliza).toBe('Hogar');
  expect(cambio.createdById, 'con su autor').toBe(productorId);
  expect(cambio.createdAt, 'y su momento').toBeTruthy();

  registrar({
    criterio: 'A.9.3',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'Un productor cambió el ramo de una póliza de automotor a hogar, y al abrirla con otro usuario la ' +
      'historia de la ficha muestra la constancia completa: el valor anterior, el nuevo, quién lo cambió y en ' +
      'qué momento. Para que un campo deje esa constancia se lo marca como auditado desde el Administrador de ' +
      'Campos, una sola vez y sin programar. Es lo que permite responder quién tocó un dato cuando un ' +
      'asegurado lo discute.',
    evidencia: [capHistoria],
    medicion: `Constancia: ${cambio.data.attributes.was.tipoPoliza} → ${cambio.data.attributes.became.tipoPoliza}, ` +
              `el ${cambio.createdAt}`,
  });
});
