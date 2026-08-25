import { test, expect } from '../../fixtures/apiRequest';
import { request as playwrightRequest } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

/**
 * Fitur Admin (User Management) — Mode API.
 * Endpoint: /api/v2/admin/users (list/filter/create).
 * Memakai storageState dari global-setup untuk skenario terautentikasi.
 */
test.describe('Admin API - 02', () => {
  // OrangeHRM OS menyajikan REST API di bawah /web/index.php/api/v2
  const LIST_URL = '/web/index.php/api/v2/admin/users?limit=50&offset=0&sortField=u.userName&sortOrder=ASC';

  test('A-01 List users default - @smoke @regression', async ({ apiRequest }) => {
    const response = await apiRequest.get(LIST_URL);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
    // struktur record user
    const first = body.data[0];
    expect(first).toHaveProperty('userName');
  });

  test('A-02 Filter by username = Admin - @smoke @regression', async ({ apiRequest }) => {
    const response = await apiRequest.get(`${LIST_URL}&username=Admin`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].userName).toBe('Admin');
  });

  test('A-03 List users tanpa session cookie - @regression', async () => {
    const bare = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await bare.get('/web/index.php/api/v2/admin/users?limit=50&offset=0');
      // Tanpa autentikasi → ditolak (401 unauthorized)
      expect([401, 302]).toContain(response.status());
    } finally {
      await bare.dispose();
    }
  });

  test('A-04 Create user valid via API - @smoke @regression', async ({ apiRequest }) => {
    // Cari employeeId dari endpoint employee search
    const empResp = await apiRequest.get(
      '/web/index.php/api/v2/pim/employees?limit=1&offset=0'
    );
    expect(empResp.status()).toBe(200);
    const empBody = await empResp.json();
    const empNumber = empBody?.data?.[0]?.empNumber;
    expect(empNumber).toBeDefined();

    const unique = `qa_api_${Date.now()}`;
    const response = await apiRequest.post('/web/index.php/api/v2/admin/users', {
      data: {
        username: unique,
        password: 'QaPass@12345',
        status: true,
        userRoleId: 2, // ESS
        empNumber,
      },
    });
    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.data.username ?? body.data.userName).toBe(unique);

    // Verifikasi user baru muncul di list
    const verify = await apiRequest.get(`${LIST_URL}&username=${unique}`);
    const vBody = await verify.json();
    expect(vBody.data.length).toBe(1);
  });

  test('A-05 Create user tanpa field wajib - @regression', async ({ apiRequest }) => {
    const response = await apiRequest.post('/web/index.php/api/v2/admin/users', {
      data: { username: '', password: '' },
    });
    // Payload tidak valid → ditolak server (4xx)
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});