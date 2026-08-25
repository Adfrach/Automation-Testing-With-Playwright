import { test, expect } from '@playwright/test';
import { DirectoryPage } from '../../../pages/10-Directory/DirectoryPage';

/**
 * Fitur Directory — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Directory - 10', () => {
  let directory: DirectoryPage;

  test.beforeEach(async ({ page }) => {
    directory = new DirectoryPage(page);
  });

  test('TC-01 Buka halaman Directory @smoke @regression', async ({ page }) => {
    await directory.goto();
    await expect(page).toHaveURL(/\/directory\/viewDirectory/);
    await expect(directory.directoryHeading).toBeVisible();
    await expect(directory.employeeNameInput).toBeVisible();
    await expect(directory.jobTitleDropdown).toBeVisible();
    await expect(directory.locationDropdown).toBeVisible();
    await expect(directory.resetButton).toBeVisible();
    await expect(directory.searchButton).toBeVisible();
    await expect(directory.recordsFound.first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-02 Search Employee Name "Peter" @regression', async ({ page }) => {
    await directory.goto();
    await directory.fillEmployeeName('Peter');
    await directory.searchButton.click();
    await expect(
      page.getByText('Peter Mac Anderson').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('TC-03 Search nama tidak dikenal @regression', async ({ page }) => {
    await directory.goto();
    // isi nama acak yang tidak ada di autocomplete
    await directory.employeeNameInput.fill('Zqxwv Nonexistent');
    await directory.searchButton.click();
    // aplikasi menampilkan "(0) Records Found" atau pesan kosong
    await expect(
      page.getByText(/No Records Found|\(0\) Records Found/).first()
    ).toBeVisible({ timeout: 15000 });
  });
});