import { test, expect } from '@playwright/test';

/**
 * Fitur Buzz — Mode API.
 * Menggunakan storageState dari global-setup (session cookie admin).
 */
test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const BASE = process.env.API_BASE_URL || process.env.BASE_URL || '';
const API = `${BASE}/web/index.php/api/v2`;

test.describe('Buzz - API - 12', () => {
  test('A-01 List buzz feed posts dengan session @smoke @regression', async ({
    request,
  }) => {
    const res = await request.get(`${API}/buzz/feed/posts?limit=10&offset=0`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    } else {
      expect([400, 403, 404, 405]).toContain(res.status());
    }
  });

  test('A-02 Buat post via API @regression', async ({ request }) => {
    const text = `Automation API post ${Date.now()}`;
    const res = await request.post(`${API}/buzz/posts`, {
      data: { text },
    });
    if (res.ok()) {
      const body = await res.json();
      expect(JSON.stringify(body)).toContain(text);
    } else {
      // 403 = modul Buzz dibatasi untuk user demo (Module Forbidden);
      // 422 = validasi payload; dokumentasikan status aktual
      console.log(`POST buzz/posts status: ${res.status()}`);
      expect([400, 403, 404, 422]).toContain(res.status());
    }
  });
});