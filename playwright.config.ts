import { defineConfig, devices } from '@playwright/test';

import { API_URL, APP_URL } from './tests/fixtures';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.tsx',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: APP_URL,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start:e2e',
    url: APP_URL,
    // Отдельный сервер исключает использование обычного .env и реальных токенов.
    env: { BURGER_API_URL: API_URL },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
