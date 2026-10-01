import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',   // Playwright LIMPIA esta carpeta en cada corrida
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  // Con --reporter en la línea de comandos estos se reemplazan, y los videos no se conservan
  reporter: [['list'], ['html', { outputFolder: 'informe', open: 'never' }], ['./videos.reporter.ts']],
  use: {
    // Video didáctico: resolución del viewport y ritmo humano
    video: { mode: 'on', size: { width: 1440, height: 900 } },
    screenshot: 'on',
    trace: 'on',
    locale: 'es-AR',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 25_000,
    ignoreHTTPSErrors: true,
    // Ritmo de una persona entre acción y acción, para que el video se pueda seguir.
    // Los tiempos que decide un criterio se toman del pedido al servidor, no del reloj
    // de la prueba, así que esta pausa no los toca
    launchOptions: { slowMo: process.env.NARRAR === '1' ? 700 : 350 },
  },
  projects: [
    {
      name: 'espocrm',
      testMatch: [/espocrm[\\/].*\.spec\.ts/, /criterios[\\/].*\.spec\.ts/, /descubrir\.spec\.ts/],
      use: { baseURL: 'http://localhost:8705' },
    },
    // Deja listos los productores de la prueba de aprendizaje (A.11.5), antes de darles la consigna
    {
      name: 'aprendizaje-preparar',
      testMatch: /aprendizaje[\\/]preparar\.spec\.ts/,
      use: { baseURL: 'http://localhost:8705' },
    },
    {
      name: 'aprendizaje-preparar-twenty',
      testMatch: /aprendizaje[\\/]preparar-twenty\.spec\.ts/,
      use: { baseURL: 'http://localhost:8704' },
    },
    {
      name: 'aprendizaje-preparar-bitrix24',
      testMatch: /aprendizaje[\\/]preparar-bitrix24\.spec\.ts/,
      use: { baseURL: 'https://b24-orshha.bitrix24.es', storageState: 'auth-bitrix.json' },
    },
    // Genera auth-twenty.json una vez: Twenty encadena pantallas de onboarding
    {
      name: 'twenty-login',
      testMatch: /twenty[\\/]guardar-sesion\.spec\.ts/,
      use: { baseURL: 'http://localhost:8704' },
    },
    {
      name: 'twenty',
      testMatch: [/twenty[\\/](?!guardar-sesion).*\.spec\.ts/, /criterios[\\/].*\.spec\.ts/, /descubrir\.spec\.ts/],
      use: {
        baseURL: 'http://localhost:8704',
        storageState: existsSync('auth-twenty.json') ? 'auth-twenty.json' : undefined,
      },
    },
    // Login manual: se corre UNA vez con --headed para generar auth-bitrix.json
    {
      name: 'bitrix24-login',
      testMatch: /bitrix24[\\/]login-manual\.spec\.ts/,
      use: { baseURL: 'https://b24-orshha.bitrix24.es' },
    },
    // Tests normales: reusan la sesión guardada, nunca ven el captcha
    {
      name: 'bitrix24',
      testMatch: /criterios[\\/].*\.spec\.ts/,
      use: {
        baseURL: 'https://b24-orshha.bitrix24.es',
        storageState: 'auth-bitrix.json',
      },
    },
  ],
});
