import { test, expect } from '@playwright/test';
import { MaintenancePage } from '../../../pages/11-Maintenance/MaintenancePage';

/**
 * Fitur Maintenance — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 * CATATAN: TIDAK mengeksekusi purge data (destruktif).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Maintenance - 11', () => {
  let maintenance: MaintenancePage;

  test.beforeEach(async ({ page }) => {
    maintenance = new MaintenancePage(page);
  });

  test('TC-01 Buka modul Maintenance → gate Administrator Access @smoke @regression', async ({
    page,
  }) => {
    await maintenance.goto();
    await expect(maintenance.adminAccessHeading).toBeVisible({
      timeout: 15000,
    });
    await expect(maintenance.gateUsernameInput).toBeDisabled();
    await expect(maintenance.gatePasswordInput).toBeVisible();
    await expect(maintenance.confirmButton).toBeVisible();
    await expect(maintenance.cancelButton).toBeVisible();
  });

  test('TC-02 Confirm tanpa password → tetap di gate @regression', async () => {
    await maintenance.goto();
    await maintenance.confirmButton.click();
    // tetap di layar gate, pesan Required muncul
    await expect(maintenance.adminAccessHeading).toBeVisible();
    await expect(
      maintenance.page.getByText('Required').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-03 Password benar + Confirm → Purge Employee Records @smoke @regression', async () => {
    await maintenance.goto();
    // Healing: gunakan confirmGate() dengan retry (verifikasi gate flaky)
    await maintenance.confirmGate();
    await expect(maintenance.purgeHeading).toBeVisible({ timeout: 15000 });
    await expect(maintenance.pastEmployeeInput).toBeVisible();
    await expect(maintenance.searchButton).toBeVisible();
  });

  test('TC-04 Search tanpa mengisi Past Employee → "Required" @regression', async () => {
    // gate sudah terverifikasi di TC-03 → gotoPurge melewati gate jika tidak muncul
    await maintenance.gotoPurge();
    await maintenance.searchButton.click();
    await expect(maintenance.requiredMessage.first()).toBeVisible({
      timeout: 10000,
    });
  });
});