import { test } from '../humano';
import { PERSONAS, CLAVE, correoBitrix } from '../aprendizaje';
import { prepararAprendicesBitrix } from '../bitrix24/aprendizaje';
import { entrar } from '../sesion';

/**
 * Deja listos los tres productores de la prueba de aprendizaje (A.11.5) en
 * Bitrix24, cada uno con su cartera y sin rastros de una corrida anterior. Se
 * corre antes de darles la consigna:
 *
 *   npx playwright test --project=aprendizaje-preparar-bitrix24
 *
 * Los productores son usuarios del portal con sesión guardada en
 * `auth-bitrix-<usuario>.json`.
 */
test('preparar la prueba de aprendizaje en Bitrix24', async ({ page }) => {
  test.setTimeout(900_000);
  await entrar(page, 'bitrix24');
  await prepararAprendicesBitrix(page);
  console.log(`  productores listos: ${PERSONAS.map(correoBitrix).join(', ')} · clave ${CLAVE}`);
});
