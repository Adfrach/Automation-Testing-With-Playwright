import { test, expect } from '../../fixtures/apiRequest';
import { request as playwrightRequest, APIRequestContext } from '@playwright/test';

const VALID_USER = process.env.TEST_USERNAME || 'Admin';
const VALID_PASS = process.env.TEST_PASSWORD || 'admin123';
const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

/**
 * Fitur Login (OrangeHRM) — Mode API.
 * Temuan eksplorasi & healing:
 *  - `apiRequest` memuat storageState (session autentikasi dari global-setup).
 *  - Bila session sudah login, POST /auth/validate otomatis redirect ke dashboard.
 *  - Oleh karena itu skenario login gagal (TC-02..07) WAJIB memakai context baru TANPA session.
 */

/** POST /auth/validate dengan context bersih (tanpa session); dispose otomatis. */
async function postValidate(data: Record<string, string>): Promise<{
  status: number;
  url: string;
}> {
  const ctx: APIRequestContext = await playwrightRequest.newContext({ baseURL: BASE_URL });
  try {
    const response = await ctx.post('/web/index.php/auth/validate', {
      data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return { status: response.status(), url: response.url() };
  } finally {
    await ctx.dispose();
  }
}

test.describe('Login API - 01', () => {
  test('TC-01 Login berhasil via UI & session dapat dipakai API - @smoke @regression', async ({ apiRequest }) => {
    // Global-setup telah login via UI → storageState valid → akses dashboard sukses.
    const response = await apiRequest.get('/web/index.php/dashboard/index');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Dashboard');
  });

  test('TC-02 Login gagal - password salah (tidak redirect dashboard) - @regression', async () => {
    const { status, url } = await postValidate({ username: VALID_USER, password: 'wrongpassword' });
    expect(status).toBe(200);
    expect(url).toContain('/auth/login');
    expect(url).not.toContain('/dashboard');
  });

  test('TC-03 Login gagal - username salah - @regression', async () => {
    const { status, url } = await postValidate({ username: 'WrongUser', password: VALID_PASS });
    expect(status).toBe(200);
    expect(url).toContain('/auth/login');
    expect(url).not.toContain('/dashboard');
  });

  test('TC-04 Login - username kosong - @smoke @regression', async () => {
    const { status, url } = await postValidate({ username: '', password: VALID_PASS });
    expect(status).toBe(200);
    expect(url).toContain('/auth/login');
  });

  test('TC-05 Login - password kosong - @smoke @regression', async () => {
    const { status, url } = await postValidate({ username: VALID_USER, password: '' });
    expect(status).toBe(200);
    expect(url).toContain('/auth/login');
  });

  test('TC-06 Login - keduanya kosong - @regression', async () => {
    const { status, url } = await postValidate({ username: '', password: '' });
    expect(status).toBe(200);
    expect(url).toContain('/auth/login');
  });

  test('TC-07 Login - payload JSON ditolak - @regression', async () => {
    const ctx: APIRequestContext = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: VALID_USER, password: VALID_PASS },
        headers: { 'Content-Type': 'application/json' },
      });
      // Body format tidak sesuai → tidak redirect ke dashboard.
      expect(response.status()).toBe(200);
      expect(response.url()).not.toContain('/dashboard');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-08 Akses dashboard tanpa session - @smoke @regression', async () => {
    const bare: APIRequestContext = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await bare.get('/web/index.php/dashboard/index');
      const body = await response.text();
      // Tanpa session → halaman login, bukan dashboard.
      expect(body).not.toContain('Dashboard');
    } finally {
      await bare.dispose();
    }
  });
});