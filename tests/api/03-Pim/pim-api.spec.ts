import { test, expect } from '../../fixtures/apiRequest';
import { request as playwrightRequest } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

/**
 * Fitur PIM (Employee Management) — Mode API.
 * Endpoint: /web/index.php/api/v2/pim/employees (list/filter/create).
 * Catatan eksplorasi: parameter `sortBy` TIDAK valid untuk endpoint ini (422).
 */
test.describe('PIM API - 03', () => {
  const LIST_URL = '/web/index.php/api/v2/pim/employees?limit=50&offset=0';

  test('A-01 List employees default - @smoke @regression', async ({ apiRequest }) => {
    const response = await apiRequest.get(LIST_URL);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('empNumber');
    expect(body.meta).toHaveProperty('total');
  });

  test('A-02 Filter by name contains - @smoke @regression', async ({ apiRequest }) => {
    const response = await apiRequest.get(`${LIST_URL}&name=Amelia`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    for (const emp of body.data) {
      const fullName = `${emp.firstName} ${emp.middleName ?? ''} ${emp.lastName}`.toLowerCase();
      expect(fullName).toContain('amelia');
    }
  });

  test('A-03 List employees tanpa session cookie - @regression', async () => {
    const bare = await playwrightRequest.newContext({ baseURL: BASE_URL });
    try {
      const response = await bare.get(LIST_URL);
      // Tanpa autentikasi → ditolak (401 unauthorized)
      expect([401, 302]).toContain(response.status());
    } finally {
      await bare.dispose();
    }
  });

  test('A-04 Create employee valid via API - @smoke @regression', async ({ apiRequest }) => {
    const uniqueFirst = `QaApi${Date.now()}`.slice(0, 12);
    const response = await apiRequest.post('/web/index.php/api/v2/pim/employees', {
      data: { firstName: uniqueFirst, lastName: 'Tester' },
    });
    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.data.firstName).toBe(uniqueFirst);
    expect(body.data.empNumber).toBeDefined();

    // Verifikasi employee baru muncul di list
    const verify = await apiRequest.get(`${LIST_URL}&name=${uniqueFirst}`);
    const vBody = await verify.json();
    expect(vBody.data.length).toBeGreaterThanOrEqual(1);
  });

  test('A-05 Create employee invalid (firstName kosong) - @regression', async ({ apiRequest }) => {
    const response = await apiRequest.post('/web/index.php/api/v2/pim/employees', {
      data: { firstName: '', lastName: 'Tester' },
    });
    // Payload tidak valid → ditolak server (4xx)
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});