import { test, expect } from '@playwright/test';
import { TimePage } from '../../../pages/05-Time/TimePage';

/**
 * Fitur Time (Timesheets) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Time - Timesheets - 05', () => {
  let time: TimePage;

  test.beforeEach(async ({ page }) => {
    time = new TimePage(page);
  });

  test('TC-01 Buka halaman View Employee Timesheet via menu Time @smoke @regression', async ({ page }) => {
    await time.goto();
    await expect(page).toHaveURL(/\/time\/viewEmployeeTimesheet/);
    await expect(time.selectEmployeeHeading).toBeVisible();
    await expect(time.employeeNameInput).toBeVisible();
    await expect(time.viewButton).toBeVisible();
    await expect(time.pendingActionHeading).toBeVisible();
  });

  test('TC-02 Validasi View tanpa Employee Name (negative) @regression', async () => {
    await time.goto();
    await time.viewButton.click();
    await expect(time.requiredError.first()).toBeVisible();
  });

  test('TC-03 View timesheet karyawan valid @smoke @regression', async ({ page }) => {
    await time.goto();
    await time.selectFirstEmployee('a');
    await time.viewButton.click();
    // SPA: detail timesheet dirender di halaman yang sama → form Select Employee hilang
    await expect(time.selectEmployeeHeading).toBeHidden({ timeout: 15000 });
  });
});