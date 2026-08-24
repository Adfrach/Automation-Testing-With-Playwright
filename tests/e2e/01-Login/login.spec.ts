import { test, expect } from '@playwright/test';
import { LoginPage, VALID_USER, VALID_PASS } from '../../../pages/01-Login/LoginPage';

/**
 * Fitur Login (OrangeHRM) — Mode E2E (UI).
 * Saatnya test halaman login; TANPA storageState sesuai aturan
 * ("test halaman login itu sendiri tanpa storageState").
 */
test.describe('Login E2E - 01', () => {
  test('TC-01 Login berhasil dengan kredensial valid - @smoke @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.expectLoginFormVisible();

    // Submit & tunggu respons API login selesai (assertion network)
    const respPromise = page.waitForResponse((r) => r.url().includes('/auth/validate'));
    await login.fillUsername(VALID_USER);
    await login.fillPassword(VALID_PASS);
    await login.clickLogin();
    const resp = await respPromise;
    // POST /auth/validate sukses berupa redirect (3xx) menuju dashboard,
    // bukan 2xx langsung — terima 2xx atau 3xx.
    expect(resp.status()).toBeGreaterThanOrEqual(200);
    expect(resp.status()).toBeLessThan(400);

    // Berhasil → redirect dashboard & heading tampil
    await login.expectDashboard();
  });

  test('TC-02 Login gagal dengan password salah - @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(VALID_USER, 'wrongpassword');
    await expect(page).toHaveURL(/\/auth\/login/);
    await login.expectInvalidCredentials();
  });

  test('TC-03 Login gagal dengan username salah - @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('WrongUser', VALID_PASS);
    await expect(page).toHaveURL(/\/auth\/login/);
    await login.expectInvalidCredentials();
  });

  test('TC-04 Login dengan username kosong - @smoke @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword(VALID_PASS);
    await login.clickLogin();
    // Field username required
    await login.fillUsername(''); // pastikan kosong
    await login.clickLogin();
    await login.expectRequiredOnUsername();
  });

  test('TC-05 Login dengan password kosong - @smoke @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillUsername(VALID_USER);
    await login.clickLogin();
    await login.expectRequiredOnPassword();
  });

  test('TC-06 Login dengan kredensial kosong (keduanya) - @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.clickLogin();
    await login.expectRequiredOnUsername();
    await login.expectRequiredOnPassword();
  });

  test('TC-07 Validasi elemen UI halaman login - @smoke @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.expectLoginFormVisible();
    await expect(login.forgotPasswordLink).toBeVisible();
  });
});