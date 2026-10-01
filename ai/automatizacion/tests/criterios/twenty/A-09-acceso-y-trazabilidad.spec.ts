import { test, expect, escribirDireccion } from '../../humano';
import { registrar } from '../../evaluar';
import { entrar, plataformaDe } from '../../sesion';
import { soloEn, capturar } from '../comun';
import { citar } from '../../fuentes';
import { TWENTY_ORGANIZATION, constanciaDe, conPlanDe } from '../../precios';
import { objeto, registros, abrirFicha, configuracion, pestana, elegirEnFicha, clicReal, esperarCarga, textoDe, entrarComo } from '../../twenty/ui';
import { cargarCartera, PRODUCTOR, RAMOS } from '../../twenty/escenario';
import { EMAIL, PASS } from '../../twenty/helper';

/**
 * A.9 — Acceso y trazabilidad, sobre Twenty
 *
 * El productor es un miembro con el rol de fábrica «Member»; el administrador,
 * el dueño del espacio de trabajo.
 */

test.describe.configure({ mode: 'serial' });

// ── A.9.1 ────────────────────────────────────────────────────────────────────
test('A.9.1 — Restricción de la cartera por productor', async ({ page, browser }, info) => {
  // «Crear un usuario con acceso restringido e intentar abrir un registro
  //  ajeno, incluso por dirección directa»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const ajena = e.polizas.find(p => p.productorId === e.administrador)!;

  // Lo que el rol permite restringir: por objeto y por campo; por registro, no
  await configuracion(page, /^Miembros$|^Members$/);
  await pestana(page, /^Roles$/);
  await clicReal(page, page.getByText('Member', { exact: true }).last());
  await esperarCarga(page, 3000);
  await clicReal(page, page.getByText(/^Agregar regla$|^Add rule$/).first());
  await clicReal(page, page.getByText('Pólizas', { exact: true }).last());
  await esperarCarga(page, 3000);
  const permisos = await textoDe(page);
  await page.getByText(/^Nivel de registro$|^Record level$/).first().scrollIntoViewIfNeeded();
  const capRol = await capturar(page, 'A.9.1', plataforma, '1-permisos-del-rol');

  // El productor abre por dirección directa una póliza que no es suya
  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  // El procedimiento pide abrirla por su dirección: se la escribe en la barra del navegador
  await escribirDireccion(page, `/object/poliza/${ajena.id}`);
  await esperarCarga(page, 6000);
  const vista = await textoDe(page);
  const capAjena = await capturar(page, 'A.9.1', plataforma, '2-poliza-ajena-abierta');

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/permissions-access/capabilities/permissions',
      buscar: 'Row-level permissions are a',
      captura: 'A-9-1-twenty-3-permisos-por-registro',
    }),
    ...await constanciaDe(browser, TWENTY_ORGANIZATION, 'A-9-1-twenty'),
  ];

  expect(permisos, 'el rol debe mostrar el nivel de registro').toMatch(/Nivel de registro|Record level/);
  expect(vista, 'si la póliza ajena no se abriera, este veredicto no corresponde').toContain(ajena.name);

  registrar({
    criterio: 'A.9.1',
    plataforma,
    cumple: 0,
    justificacion:
      'En la edición evaluada los roles restringen por objeto —ver, editar, borrar— y por campo, pero no por ' +
      'registro: el productor, con el rol de miembro, abrió por dirección directa una póliza de otro productor y ' +
      'la vio completa. La pantalla del rol muestra el nivel de registro como función del plan Organization, y ' +
      'el fabricante lo confirma: los permisos por registro, que limitan a cada vendedor a lo suyo, son una ' +
      'función premium de ese plan. Sin él, la cartera de un productor queda a la vista de todos.',
    evidencia: [capRol, capAjena],
    documentacion: fuentes,
    conPlan: [conPlanDe(TWENTY_ORGANIZATION, {
      cumple: 2,
      costo: 1,
      justificacion:
        'Con el plan Organization, en la nube o en la instalación propia, el rol filtra los registros con una ' +
        'condición —el productor de la póliza es el usuario que entra—, que se define una vez desde la pantalla ' +
        'del rol.',
    })],
  });
});

// ── A.9.2 ────────────────────────────────────────────────────────────────────
test('A.9.2 — Autenticación de los usuarios bajo control de la compañía', async ({ page, browser }, info) => {
  // «Revisar qué exige el sistema para validar la identidad: política de
  //  contraseñas, segundo factor y acceso unificado con el directorio de la
  //  compañía»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(400_000);

  await entrar(page, plataforma);
  await configuracion(page, /^General$/);
  await pestana(page, /^Seguridad$|^Security$/);
  await page.getByText(/^Autenticación de Dos Factores$|^Two-Factor Authentication$/).first().scrollIntoViewIfNeeded();
  const seguridad = await textoDe(page);
  const capSeguridad = await capturar(page, 'A.9.2', plataforma, '1-seguridad-del-espacio');

  const fuentes = [
    await citar(browser, {
      url: 'https://docs.twenty.com/developers/self-host/capabilities/setup',
      buscar: 'Google/Microsoft OAuth',
      captura: 'A-9-2-twenty-2-ingreso-con-google-y-microsoft',
    }),
    await citar(browser, {
      url: 'https://docs.twenty.com/user-guide/permissions-access/capabilities/sso-configuration',
      buscar: 'Organization plan',
      captura: 'A-9-2-twenty-3-sso',
    }),
  ];

  expect(seguridad, 'la seguridad del espacio debe ofrecer el segundo factor').toMatch(/Dos Factores|Two-Factor/i);
  expect(seguridad, 'y permitir apagar el ingreso con contraseña').toMatch(/correo electrónico y una contraseña|email and password/i);

  registrar({
    criterio: 'A.9.2',
    plataforma,
    cumple: 2,
    costo: 1,
    justificacion:
      'La seguridad del espacio de trabajo permite imponer el segundo factor a todos los usuarios en cada ' +
      'ingreso y apagar el ingreso con correo y contraseña, de modo que solo se entre con la cuenta de la ' +
      'compañía. La instalación propia admite el ingreso con cuentas de Google y de Microsoft registrando sus ' +
      'credenciales, que es como se unifica el acceso con el directorio de una compañía que usa esos servicios; ' +
      'la conexión por SAML u OIDC con cualquier otro directorio es del plan Organization. No hay una política ' +
      'de contraseñas que se configure —largo, vencimiento—, que deja de importar si el ingreso es con la ' +
      'cuenta de la compañía y segundo factor. Es configuración de una sola vez.',
    evidencia: [capSeguridad],
    documentacion: fuentes,
  });
});

// ── A.9.3 ────────────────────────────────────────────────────────────────────
test('A.9.3 — Registro de quién modificó cada dato', async ({ page, browser }, info) => {
  // «Cambiar el ramo de una póliza vigente con un usuario y buscar desde otro
  //  la constancia del cambio: valor anterior, autor y momento»
  const plataforma = plataformaDe(info.project.name);
  soloEn(plataforma, 'twenty');
  test.setTimeout(900_000);

  await entrar(page, plataforma);
  const e = await cargarCartera(page, browser);
  const ramo = (await objeto(e.api, 'poliza')).fields.find((c: any) => c.name === 'ramo');
  const etiqueta = (v: string) => ramo.options.find((o: any) => o.value === v)?.label;
  const poliza = e.polizas.find(p => p.productorId === e.productor && etiqueta(p.ramo) !== 'Hogar')!;
  const antes = etiqueta(poliza.ramo);

  // El productor cambia el ramo desde la ficha
  await entrarComo(page, PRODUCTOR.email, PRODUCTOR.clave);
  await abrirFicha(page, 'poliza', poliza.id);
  await elegirEnFicha(page, 'ramo', 'Hogar');
  await page.waitForTimeout(4000);

  // El administrador busca la constancia en la línea de tiempo de la póliza
  await entrarComo(page, EMAIL, PASS);
  await abrirFicha(page, 'poliza', poliza.id);
  await clicReal(page, page.getByText(/^Timeline$|^Línea de tiempo$/).filter({ visible: true }).first());
  await page.waitForTimeout(3000);
  const entrada = page.getByText(/updated|actualizó/).filter({ hasText: /Ramo/ }).filter({ visible: true }).first();
  const desplegar = entrada.locator('xpath=ancestor::*[.//button][1]').locator('button').last();
  if (await desplegar.isVisible().catch(() => false)) await clicReal(page, desplegar);
  await page.waitForTimeout(2000);
  const linea = await textoDe(page);
  const capLinea = await capturar(page, 'A.9.3', plataforma, '1-constancia-del-cambio');

  const historial = await registros(e.api, 'timelineActivities', `targetPolizaId[eq]:${poliza.id}`);
  const cambio = historial.filter(h => h.properties?.diff?.ramo)
    .sort((a, b) => b.happensAt.localeCompare(a.happensAt))[0];

  expect(cambio, 'el cambio debe quedar registrado').toBeTruthy();
  expect(etiqueta(cambio.properties.diff.ramo.before), 'con el valor anterior').toBe(antes);
  expect(etiqueta(cambio.properties.diff.ramo.after), 'y el nuevo').toBe('Hogar');
  expect(cambio.workspaceMemberId, 'y su autor').toBe(e.productor);
  expect(linea, 'el administrador debe verlo en la línea de tiempo').toContain(PRODUCTOR.nombre);

  registrar({
    criterio: 'A.9.3',
    plataforma,
    cumple: 2,
    costo: 0,
    justificacion:
      'Cada registro trae de fábrica una línea de tiempo con sus cambios. El productor cambió el ramo de una ' +
      `póliza de ${antes} a Hogar desde la ficha, y el administrador, con su cuenta, encontró la constancia en ` +
      'la línea de tiempo de la póliza: quién lo cambió, cuándo, y el valor anterior junto al nuevo. Viene ' +
      'listo, sin configurar nada. Los cambios seguidos de la misma persona sobre un registro, dentro de los ' +
      'diez minutos, se funden en una entrada con el primer valor y el último. El registro de auditoría de todo ' +
      'el espacio de trabajo es aparte, y es del plan Organization.',
    evidencia: [capLinea],
    medicion: `${antes} → Hogar, por ${PRODUCTOR.nombre} ${PRODUCTOR.apellido}, ${cambio.happensAt}`,
  });
});
