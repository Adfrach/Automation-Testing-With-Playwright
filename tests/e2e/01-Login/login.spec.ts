import { test, expect } from '@playwright/test';
import { LoginPage, VALID_USER, VALID_PASS } from '../../../pages/01-Login/LoginPage';

/**
 * Fitur Login (OrangeHRM) — Mode E2E (UI).
 * Test halaman login; TANPA storageState sesuai aturan
 * ("test halaman login itu sendiri tanpa storageState").
 */
test.describe('Login E2E - 01', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
    await login.expectLoginFormVisible();
  });

  test('TC-01 Login berhasil dengan kredensial valid - @smoke @regression', async ({ page }) => {
    // Submit & tunggu respons API login (assertion network).
    // POST /auth/validate sukses berupa redirect (3xx) menuju dashboard — terima 2xx/3xx.
    await login.fillUsername(VALID_USER);
    await login.fillPassword(VALID_PASS);
    const resp = await login.clickLoginAndWaitForResponse();
    expect(resp.status()).toBeGreaterThanOrEqual(200);
    expect(resp.status()).toBeLessThan(400);

    await login.expectDashboard();
  });

  test('TC-02 Login gagal dengan password salah - @regression', async ({ page }) => {
    await login.login(VALID_USER, 'wrongpassword');
    await expect(page).toHaveURL(/\/auth\/login/);
    await login.expectInvalidCredentials();
  });

  test('TC-03 Login gagal dengan username salah - @regression', async ({ page }) => {
    await login.login('WrongUser', VALID_PASS);
    await expect(page).toHaveURL(/\/auth\/login/);
    await login.expectInvalidCredentials();
  });

  test('TC-04 Login dengan username kosong - @smoke @regression', async () => {
    await login.fillPassword(VALID_PASS);
    await login.clickLogin();
    await login.expectRequiredOnUsername();
  });

  test('TC-05 Login dengan password kosong - @smoke @regression', async () => {
    await login.fillUsername(VALID_USER);
    await login.clickLogin();
    await login.expectRequiredOnPassword();
  });

  test('TC-06 Login dengan kredensial kosong (keduanya) - @regression', async () => {
    await login.clickLogin();
    await login.expectRequiredOnUsername();
    await login.expectRequiredOnPassword();
  });

  test('TC-07 Validasi elemen UI halaman login - @smoke @regression', async () => {
    await expect(login.forgotPasswordLink).toBeVisible();
  });

  test('TC-08 Klik Forgot Password navigasi ke halaman reset - @regression', async ({ page }) => {
    await login.clickForgotPassword();
    await expect(page).toHaveURL(/requestPasswordResetCode/);
  });
});