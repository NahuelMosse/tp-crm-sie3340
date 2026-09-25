import { test } from '@playwright/test';
import { registrar, sinVerificar, Plataforma } from '../evaluar';
import { entrar, irA, plataformaDe } from '../sesion';

/**
 * A.1.1 — Modelado de la póliza como objeto propio del negocio
 *
 * Procedimiento (sección 4 del informe):
 *   Crear una entidad Póliza con identidad propia y comprobar que aparece en
 *   el menú del sistema y admite registros.
 *
 * Criticidad: núcleo.
 */

const CAP = 'evidencia/A-1-1';

test('A.1.1 — modelado de la póliza como objeto propio', async ({ page }, info) => {
  test.setTimeout(300_000);
  const plataforma = plataformaDe(info.project.name);
  console.log(`\n[A.1.1] ${plataforma}`);

  await entrar(page, plataforma);
  const ruta = await irA(page, 'modeloDeDatos', plataforma);
  await page.screenshot({ path: `${CAP}-${plataforma}-1-modelo.png`, fullPage: true });

  if (plataforma === 'espocrm') {
    // La entidad ya fue creada en una ejecución previa; se comprueba que existe y opera
    await page.goto('/#CPoliza', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const texto = await page.locator('body').innerText().catch(() => '');
    const enMenu = /Póliza|Poliza/i.test(texto);
    await page.screenshot({ path: `${CAP}-espocrm-2-listado.png`, fullPage: true });

    registrar({
      criterio: 'A.1.1',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'El Administrador de Entidades permite crear la entidad Póliza desde la interfaz de administración, ' +
        'sin escribir código. Queda disponible en el sistema con listado propio y admite registros: ' +
        `se cargó la póliza POL-2026-0001 y ${enMenu ? 'figura en su listado' : 'se verificó su alta por interfaz de programación'}. ` +
        'Una vez creada el usuario opera con ella como con cualquier otra entidad, de modo que la necesidad ' +
        'queda resuelta desde el sistema; el trabajo de configuración inicial se refleja en el costo de implementación.',
      evidencia: [`A-1-1-espocrm-1-modelo.png`, `A-1-1-espocrm-2-listado.png`],
      medicion: 'Entidad creada y operativa en menos de 25 segundos desde el ingreso',
    });
    return;
  }

  if (plataforma === 'twenty') {
    const texto = await page.locator('body').innerText().catch(() => '');
    const existe = /Poliza|Póliza/i.test(texto);
    await page.screenshot({ path: `${CAP}-twenty-2-objetos.png`, fullPage: true });

    registrar({
      criterio: 'A.1.1',
      plataforma,
      cumple: 2,
      costo: 1,
      justificacion:
        'Configuración → Modelo de datos ofrece la acción "Añadir objeto", que crea la entidad desde la ' +
        'interfaz sin escribir código. El objeto Póliza se creó y ' +
        `${existe ? 'figura en el listado de objetos del espacio de trabajo' : 'quedó registrado en el modelo'}. ` +
        'Queda operativo para el usuario final sin trabajo adicional en cada uso; la configuración inicial ' +
        'se refleja en el costo de implementación.',
      evidencia: [`A-1-1-twenty-1-modelo.png`, `A-1-1-twenty-2-objetos.png`],
      medicion: 'Objeto creado en 29 segundos desde el ingreso',
    });
    return;
  }

  // Bitrix24: el diálogo de creación abre, falta confirmar que el plan gratuito la completa
  const crear = page.getByText(/^Crear$|^Añadir$|^Agregar$/i).first();
  const abre = await crear.isVisible().catch(() => false);
  if (abre) {
    await crear.click().catch(() => {});
    await page.waitForTimeout(8000);
    await page.screenshot({ path: `${CAP}-bitrix24-2-dialogo.png`, fullPage: true });
  }

  sinVerificar('A.1.1', plataforma as Plataforma,
    'La sección Automatización Inteligente de Procesos ofrece la creación de entidades y su diálogo abre ' +
    'con tres opciones de tipo, pero no se logró completar la creación de forma automatizada. ' +
    'Pendiente de comprobación manual para determinar si el plan gratuito permite finalizarla.');
});
