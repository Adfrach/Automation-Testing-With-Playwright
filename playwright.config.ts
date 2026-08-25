import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright — support global setup (login via UI),
 * project API, dan AUTH_STATE untuk fixture apiRequest (diset di global-setup).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './tests/global-setup/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: 'https://opensource-demo.orangehrmlive.com/web/index.php',
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});