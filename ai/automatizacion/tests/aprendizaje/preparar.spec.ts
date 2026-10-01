import { test } from '../humano';
import { prepararAprendices, PERSONAS, CLAVE } from '../aprendizaje';

/**
 * Deja listos los tres productores de la prueba de aprendizaje (A.11.5), cada
 * uno con su cartera y sin rastros de una corrida anterior. Se corre antes de
 * darles la consigna:
 *
 *   npx playwright test --project=aprendizaje-preparar
 */
test('preparar la prueba de aprendizaje en EspoCRM', async () => {
  test.setTimeout(300_000);
  await prepararAprendices();
  console.log(`  productores listos: ${PERSONAS.map(p => p.userName).join(', ')} · clave ${CLAVE}`);
});
