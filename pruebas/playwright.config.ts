import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './evidencia',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'informe', open: 'never' }]],
  use: {
    video: 'on',
    screenshot: 'on',
    trace: 'on',
    locale: 'es-AR',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 20_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'espocrm',
      testMatch: [/espocrm[\\/].*\.spec\.ts/, /descubrir\.spec\.ts/],
      use: { baseURL: 'http://localhost:8705' },
    },
    {
      name: 'twenty',
      testMatch: [/twenty[\\/].*\.spec\.ts/, /descubrir\.spec\.ts/],
      use: { baseURL: 'http://localhost:8704' },
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
