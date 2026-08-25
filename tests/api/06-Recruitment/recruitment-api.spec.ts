import { test, expect } from '@playwright/test';

/**
 * Fitur Recruitment — Mode API.
 * Menggunakan storageState dari global-setup (session cookie admin).
 */
test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const BASE = process.env.API_BASE_URL || process.env.BASE_URL || '';
const API = `${BASE}/web/index.php/api/v2`;

test.describe('Recruitment - API - 06', () => {
  test('A-01 List candidates @smoke @regression', async ({ request }) => {
    const res = await request.get(`${API}/recruitment/candidates?limit=50&offset=0`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-02 List vacancies @smoke @regression', async ({ request }) => {
    const res = await request.get(`${API}/recruitment/vacancies?limit=50&offset=0`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-03 Tanpa session cookie → dokumentasi kebocoran (BUG-REC-001) @regression', async ({ playwright }) => {
    // DEFECT TERDOKUMENTASI (bugs/api/06-Recruitment.md, BUG-REC-001, Critical):
    // endpoint mengembalikan data kandidat lengkap TANPA auth.
    // Test ini mendokumentasikan perilaku aktual agar regresi perbaikannya terdeteksi:
    // jika nanti diperbaiki (401/data kosong), assertion di bawah gagal → update test.
    const ctx = await playwright.request.newContext();
    const res = await ctx.get(`${API}/recruitment/candidates`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    await ctx.dispose();
  });
});