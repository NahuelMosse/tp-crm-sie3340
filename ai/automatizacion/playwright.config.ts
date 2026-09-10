import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',   // Playwright LIMPIA esta carpeta en cada corrida
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'informe', open: 'never' }]],
  use: {
    // Video didáctico: resolución del viewport y ritmo humano
    video: { mode: 'on', size: { width: 1440, height: 900 } },
    screenshot: 'on',
    trace: 'on',
    locale: 'es-AR',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 25_000,
    ignoreHTTPSErrors: true,
    // slowMo solo en modo narrado: si no, contamina los tiempos medidos
    launchOptions: { slowMo: process.env.NARRAR === '1' ? 450 : 0 },
  },
  projects: [
    {
      name: 'espocrm',
      testMatch: [/espocrm[\\/].*\.spec\.ts/, /descubrir\.spec\.ts/],
      use: { baseURL: 'http://localhost:8705' },
    },
    // Genera auth-twenty.json una vez: Twenty encadena pantallas de onboarding
    {
      name: 'twenty-login',
      testMatch: /twenty[\\/]guardar-sesion\.spec\.ts/,
      use: { baseURL: 'http://localhost:8704' },
    },
    {
      name: 'twenty',
      testMatch: [/twenty[\\/](?!guardar-sesion).*\.spec\.ts/, /descubrir\.spec\.ts/],
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
      testMatch: /bitrix24[\\/](?!login-manual).*\.spec\.ts/,
      use: {
        baseURL: 'https://b24-orshha.bitrix24.es',
        storageState: 'auth-bitrix.json',
      },
    },
  ],
});
