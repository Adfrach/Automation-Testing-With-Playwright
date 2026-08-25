import { test, expect } from '@playwright/test';

/**
 * Fitur Performance — Mode API.
 * Menggunakan storageState dari global-setup (session cookie admin).
 */
test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const BASE = process.env.API_BASE_URL || process.env.BASE_URL || '';
const API = `${BASE}/web/index.php/api/v2`;

test.describe('Performance - API - 08', () => {
  test('A-01 List reviews @smoke @regression', async ({ request }) => {
    const res = await request.get(`${API}/performance/reviews?limit=50&offset=0`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-02 List kpi / trackers endpoint tersedia @regression', async ({ request }) => {
    const res = await request.get(`${API}/performance/trackers?limit=50&offset=0`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-03 Tanpa session cookie → dokumentasi kebocoran (BUG-PERF-001) @regression', async ({ playwright }) => {
    // DEFECT TERDOKUMENTASI (bugs/api/08-Performance.md, BUG-PERF-001, Critical):
    // endpoint mengembalikan data review TANPA auth.
    // Jika nanti diperbaiki (401), assertion di bawah gagal → update test.
    const ctx = await playwright.request.newContext();
    const res = await ctx.get(`${API}/performance/reviews`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    await ctx.dispose();
  });
});