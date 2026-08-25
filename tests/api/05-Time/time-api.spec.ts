import { test, expect } from '@playwright/test';

/**
 * Fitur Time (Timesheets) — Mode API.
 * Menggunakan storageState dari global-setup (session cookie admin).
 */
test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const BASE = process.env.API_BASE_URL || process.env.BASE_URL || '';
const API = `${BASE}/web/index.php/api/v2`;

test.describe('Time - API - 05', () => {
  test('A-01 List timesheets @smoke @regression', async ({ request }) => {
    const res = await request.get(`${API}/time/timesheets?limit=50&offset=0`);
    // OS demo: 200 dengan data/meta, atau 4xx bila endpoint dibatasi
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-02 Tanpa session cookie → tidak ada data bocor @regression', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const res = await ctx.get(`${API}/time/timesheets`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.data).toEqual([]);
    } else {
      expect(res.status()).toBe(401);
    }
    await ctx.dispose();
  });

  test('A-03 Parameter tidak valid → ditolak @regression', async ({ request }) => {
    const res = await request.get(`${API}/time/timesheets?employeeId=abc`);
    expect([400, 404, 422]).toContain(res.status());
  });
});