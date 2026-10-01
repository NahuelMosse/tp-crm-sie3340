import { test } from '../humano';
import { PERSONAS, CLAVE } from '../aprendizaje';
import { prepararAprendicesTwenty, correoDe } from '../twenty/aprendizaje';
import { entrar } from '../sesion';

/**
 * Deja listos los tres productores de la prueba de aprendizaje (A.11.5) en
 * Twenty, cada uno con su cartera y sin rastros de una corrida anterior. Se
 * corre antes de darles la consigna:
 *
 *   npx playwright test --project=aprendizaje-preparar-twenty
 */
test('preparar la prueba de aprendizaje en Twenty', async ({ page, browser }) => {
  test.setTimeout(900_000);
  await entrar(page, 'twenty');
  await prepararAprendicesTwenty(page, browser);
  console.log(`  productores listos: ${PERSONAS.map(correoDe).join(', ')} · clave ${CLAVE}`);
});
