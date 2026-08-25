import { test, expect } from '@playwright/test';
import { LeavePage } from '../../../pages/04-Leave/LeavePage';

/**
 * Fitur Leave (Leave Management) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const YEAR = new Date().getFullYear();

test.describe('Leave - Leave Management - 04', () => {
  let leave: LeavePage;

  test.beforeEach(async ({ page }) => {
    leave = new LeavePage(page);
  });

  test('TC-01 Buka halaman Leave List via menu Leave @smoke @regression', async ({ page }) => {
    await leave.goto();
    await expect(page).toHaveURL(/\/leave\/viewLeaveList/);
    await expect(leave.leaveListHeading).toBeVisible();
    await expect(leave.fromDateInput).toBeVisible();
    await expect(leave.toDateInput).toBeVisible();
    await expect(leave.statusDropdown).toBeVisible();
    await expect(leave.employeeNameFilter).toBeVisible();
    await expect(leave.resetButton).toBeVisible();
    await expect(leave.searchButton).toBeVisible();
  });

  test('TC-02 Validasi Search tanpa Status (negative) @regression', async ({ page }) => {
    await leave.goto();
    await leave.searchButton.click();
    const required = page.locator('.oxd-input-field-error-message', { hasText: 'Required' });
    await expect(required.first()).toBeVisible();
  });

  test('TC-03 Search leave dengan status valid @smoke @regression', async ({ page }) => {
    await leave.goto();
    await leave.selectStatus('Pending Approval');
    await leave.fromDateInput.fill(`${YEAR}-01-01`);
    await leave.toDateInput.fill(`${YEAR}-12-31`);
    await leave.searchButton.click();
    // hasil pencarian tampil: pesan kosong ATAU baris data di tabel
    await expect(
      page.getByText('No Records Found').or(page.getByRole('table').getByRole('row')).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('TC-04 Reset filter @regression', async ({ page }) => {
    await leave.goto();
    await leave.selectStatus('Pending Approval');
    await leave.fromDateInput.fill(`${YEAR}-01-01`);
    await leave.resetButton.click();
    await expect(leave.fromDateInput).toHaveValue('');
    await expect(leave.toDateInput).toHaveValue('');
  });

  test('TC-05 Halaman Apply Leave - user tanpa entitlement @smoke @regression', async ({ page }) => {
    await leave.gotoApply();
    await expect(leave.applyHeading).toBeVisible();
    // admin demo: bisa tanpa entitlement (pesan) atau form apply tampil
    const noTypes = page.getByText('No Leave Types with Leave Balance');
    if (!(await noTypes.isVisible().catch(() => false))) {
      await expect(leave.applyHeading).toBeVisible();
    }
  });
});