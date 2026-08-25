import { test, expect } from '@playwright/test';
import { PerformancePage } from '../../../pages/08-Performance/PerformancePage';

/**
 * Fitur Performance (Manage Reviews) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Performance - Manage Reviews - 08', () => {
  let performance: PerformancePage;

  test.beforeEach(async ({ page }) => {
    performance = new PerformancePage(page);
  });

  test('TC-01 Buka halaman Employee Reviews via menu Performance @smoke @regression', async ({ page }) => {
    await performance.goto();
    await expect(page).toHaveURL(/\/performance\/searchEvaluatePerformanceReview/);
    await expect(performance.employeeReviewsHeading).toBeVisible();
    await expect(performance.employeeNameInput).toBeVisible();
    await expect(performance.jobTitleDropdown).toBeVisible();
    await expect(performance.resetButton).toBeVisible();
    await expect(performance.searchButton).toBeVisible();
  });

  test('TC-02 Search tanpa filter (opsional) @smoke @regression', async ({ page }) => {
    await performance.goto();
    await performance.searchButton.click();
    // tidak ada error; tabel review tetap tampil
    await expect(performance.reviewsTable).toBeVisible({ timeout: 15000 });
    const error = page.locator('.oxd-alert--error');
    await expect(error).toHaveCount(0);
  });

  test('TC-03 Reset filter @regression', async ({ page }) => {
    await performance.goto();
    // ubah dropdown Include dari default "Current Employees Only"
    const includeGroup = page.locator(
      '.oxd-input-group:has(label:text-is("Include")) .oxd-select-text'
    );
    await includeGroup.click();
    await page.locator('[role="option"]').first().click();
    await performance.resetButton.click();
    // perilaku aplikasi: input teks tidak dikosongkan; dropdown kembali default
    await expect(includeGroup).toContainText('Current Employees Only');
  });
});