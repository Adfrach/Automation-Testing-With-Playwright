import { test, expect } from '@playwright/test';

/**
 * Fitur Dashboard — Mode API.
 * Menggunakan storageState dari global-setup (session cookie admin).
 */
test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const BASE = process.env.API_BASE_URL || process.env.BASE_URL || '';
const API = `${BASE}/web/index.php/api/v2`;

test.describe('Dashboard - API - 09', () => {
  test('A-01 Employees on leave today @smoke @regression', async ({ request }) => {
    const res = await request.get(`${API}/dashboard/employees-on-leave-today?limit=5`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
    } else {
      expect([400, 403, 404]).toContain(res.status());
    }
  });

  test('A-02 Tanpa session cookie → tidak ada data bocor @regression', async ({ playwright }) => {
    const ctx = await playwright.request.newContext();
    const res = await ctx.get(`${API}/dashboard/employees-on-leave-today?limit=5`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.data ?? []).toEqual([]);
    } else {
      // endpoint dashboard tidak bocor: ditolak dengan 401 atau disembunyikan (404)
      expect([401, 404]).toContain(res.status());
    }
    await ctx.dispose();
  });
});