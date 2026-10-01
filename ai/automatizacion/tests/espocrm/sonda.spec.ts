import { test } from '@playwright/test';
import { entrar } from '../sesion';
import { alistarPoliza } from '../preparar';

test('sonda: preparar diseños', async ({ page }) => {
  test.setTimeout(600_000);
  await entrar(page, 'espocrm');
  await alistarPoliza(page);
});
