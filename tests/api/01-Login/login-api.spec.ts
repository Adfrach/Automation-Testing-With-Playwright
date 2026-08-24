import { test, expect } from '../../fixtures/apiRequest';
import { request as playwrightRequest } from '@playwright/test';

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
test.describe('Login API - 01', () => {
  test('TC-01 Login berhasil via UI & session dapat dipakai API - @smoke @regression', async ({ apiRequest }) => {
    // Global-setup telah login via UI → storageState valid → akses dashboard sukses.
    const response = await apiRequest.get('/web/index.php/dashboard/index');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Dashboard');
  });

  test('TC-02 Login gagal - password salah (tidak redirect dashboard) - @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: VALID_USER, password: 'wrongpassword' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('/auth/login');
      expect(response.url()).not.toContain('/dashboard');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-03 Login gagal - username salah - @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: 'WrongUser', password: VALID_PASS },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('/auth/login');
      expect(response.url()).not.toContain('/dashboard');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-04 Login - username kosong - @smoke @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: '', password: VALID_PASS },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('/auth/login');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-05 Login - password kosong - @smoke @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: VALID_USER, password: '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('/auth/login');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-06 Login - keduanya kosong - @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await ctx.post('/web/index.php/auth/validate', {
        data: { username: '', password: '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('/auth/login');
    } finally {
      await ctx.dispose();
    }
  });

  test('TC-07 Login - payload JSON ditolak - @regression', async () => {
    const ctx = await playwrightRequest.newContext({ baseURL: BASE_URL });
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
    const bare = await playwrightRequest.newContext({ baseURL: BASE_URL });
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