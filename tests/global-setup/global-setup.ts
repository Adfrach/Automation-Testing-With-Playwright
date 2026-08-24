import { chromium, FullConfig } from '@playwright/test';
import path from 'node:path';

/**
 * Global Setup untuk semua mode.
 * Karena POST /auth/validate menolak akses API murni (temuan eksplorasi),
 * login dilakukan via browser UI dan menyimpan storageState (session cookie)
 * untuk re-use pada test API/E2E.
 * process.env.AUTH_STATE diset agar fixture `apiRequest` dapat memuatnya.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
  const username = process.env.TEST_USERNAME || 'Admin';
  const password = process.env.TEST_PASSWORD || 'admin123';
  const authStatePath = path.resolve(__dirname, '../../playwright-artifacts/auth-state.json');

  // Set env untuk runtime test (bisa dibaca fixture)
  process.env.AUTH_STATE = authStatePath;
  process.env.BASE_URL = baseURL;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/web/index.php/auth/login`);
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    // Tunggu redirect selesai
    await page.waitForURL('**/dashboard/index', { timeout: 15000 });
    await context.storageState({ path: authStatePath });
    console.log('[global-setup] Login via UI berhasil, storageState tersimpan.');
  } catch (e) {
    console.warn('[global-setup] Gagal login via UI:', (e as Error).message);
  } finally {
    await browser.close();
  }
}