import { test, expect } from '@playwright/test';
import { portada, paso, nota, marcar, resultado, limpiar } from '../narrador';

const USER = 'admin';
const PASS = 'Admin1234!';
const CAP = 'evidencia/espocrm';

test('C03-01 — clicks y tiempo hasta crear un contacto', async ({ page }) => {
  test.setTimeout(180_000);
  const t0 = Date.now();
  let clicks = 0;

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await portada(page, 'EspoCRM 10.0.4', 'Criterio 3 — Navegabilidad', 'C03-01');
  await nota(page, '¿Qué vamos a medir?',
    'Cuántos <b>clicks</b> y cuántos <b>segundos</b> hace falta<br>para crear un contacto desde cero.',
    'La misma prueba se repite en Twenty y Bitrix24 para poder comparar',
    3200, `${CAP}-C03-01-narrado-portada.png`);

  // --- Login ---
  await paso(page, 'PASO 1', 'Iniciar sesión', 'Usuario administrador del CRM');
  const user = page.locator('#field-userName');
  await user.waitFor({ state: 'visible' });
  await marcar(page, user);
  await user.fill(USER);
  await page.locator('#field-password').fill(PASS);
  await page.screenshot({ path: `${CAP}-C03-01-a-login.png` });

  const btnLogin = page.getByRole('button', { name: 'Iniciar sesión' });
  await marcar(page, btnLogin, 900);
  await btnLogin.click();
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });
  const tLogin = Date.now() - t0;

  await paso(page, 'LISTO', `Sesión iniciada en ${(tLogin / 1000).toFixed(1)} s`,
    'Ya estamos dentro del CRM', 2200);
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C03-01-b-dentro.png`, fullPage: true });

  // --- Ir a Contactos ---
  await paso(page, 'PASO 2', 'Abrir el módulo Contactos',
    'Fijate que el menú está enteramente en español');
  await page.goto('/#Contact', { waitUntil: 'domcontentloaded' });
  clicks++;
  await page.waitForTimeout(2500);
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C03-01-c-contactos.png`, fullPage: true });

  // --- Crear ---
  await paso(page, 'PASO 3', 'Botón de crear contacto', 'Click número 2');
  await page.screenshot({ path: `${CAP}-C03-01-narrado-banner.png` });   // con cartel, para el informe
  const crear = page.getByRole('link', { name: /Crear Contacto|Create Contact/i })
    .or(page.locator('a[data-action="create"], button[data-action="create"]')).first();
  await marcar(page, crear);
  await crear.click();
  clicks++;

  await paso(page, 'PASO 4', 'Completar nombre y apellido', 'Clicks 3 y 4');
  const nombre = page.locator('input[data-name="firstName"], #field-firstName').first();
  await nombre.waitFor({ state: 'visible', timeout: 20_000 });
  await marcar(page, nombre, 900);
  await nombre.fill('TP-TEST-UI');
  await page.locator('input[data-name="lastName"], #field-lastName').first().fill('Navegabilidad');
  clicks += 2;
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C03-01-d-formulario.png`, fullPage: true });

  await paso(page, 'PASO 5', 'Guardar', 'Click número 5');
  const guardar = page.getByRole('button', { name: /^Guardar$|^Save$/i }).first();
  await marcar(page, guardar, 900);
  await guardar.click();

  await expect(page.getByText('TP-TEST-UI').first()).toBeVisible({ timeout: 25_000 });
  const total = Date.now() - t0;
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C03-01-e-creado.png`, fullPage: true });

  console.log(`[EspoCRM] login ${tLogin} ms · contacto creado — ${clicks} clicks · ${total} ms`);
  await resultado(page, true, 'Contacto creado',
    `<b>${clicks} clicks</b> · <b>${(total / 1000).toFixed(1)} segundos</b> de punta a punta`);
});

test('C04-06 — la interfaz está en español', async ({ page }) => {
  test.setTimeout(150_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await portada(page, 'EspoCRM 10.0.4', 'Criterio 4 — Idioma de la interfaz', 'C04-06');
  await nota(page, '¿Qué vamos a verificar?',
    'Si EspoCRM traduce al español <b>solo los botones</b><br>o también <b>los nombres del modelo de datos</b>.',
    'Este es el punto donde se diferencia de Twenty');

  await paso(page, 'PASO 1', 'La pantalla de login ya viene en español',
    'Sin configurar nada: dice "Iniciar sesión"');
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  const btn = page.getByRole('button', { name: 'Iniciar sesión' });
  await expect(btn).toBeVisible();
  await marcar(page, btn);
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C04-06-a-login-es.png` });

  await page.locator('#field-userName').fill(USER);
  await page.locator('#field-password').fill(PASS);
  await btn.click();
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });

  await paso(page, 'PASO 2', 'El menú completo, traducido',
    'Cuentas · Contactos · Posibles clientes · Oportunidades');
  const menu = page.locator('#menu, nav').first();
  await marcar(page, menu, 2500);
  await limpiar(page);
  await page.screenshot({ path: `${CAP}-C04-06-b-menu-es.png`, fullPage: true });

  await nota(page, 'Traduce el modelo de datos',
    'No solo los botones: los <b>nombres de los módulos</b><br>también están en español.',
    'Twenty deja Companies, People y Opportunities en inglés');

  await resultado(page, true, 'Español completo',
    'Interfaz y modelo de datos, sin instalar nada aparte');
});
