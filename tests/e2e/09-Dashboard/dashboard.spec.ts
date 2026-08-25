import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/09-Dashboard/DashboardPage';

/**
 * Fitur Dashboard — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Dashboard - 09', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
  });

  test('TC-01 Buka halaman Dashboard @smoke @regression', async ({ page }) => {
    await dashboard.goto();
    await expect(page).toHaveURL(/\/dashboard\/index/);
    await expect(dashboard.dashboardHeading).toBeVisible();
    await expect(dashboard.timeAtWork.first()).toBeVisible();
    await expect(dashboard.myActions.first()).toBeVisible();
    await expect(dashboard.quickLaunch.first()).toBeVisible();
    await expect(dashboard.buzzLatestPosts.first()).toBeVisible();
    await expect(dashboard.employeesOnLeave.first()).toBeVisible();
  });

  test('TC-02 Quick Launch Assign Leave navigasi benar @regression', async ({ page }) => {
    await dashboard.goto();
    await dashboard.assignLeaveButton.click();
    await expect(page).toHaveURL(/\/leave\/assignLeave/, { timeout: 15000 });
  });

  test('TC-03 Employees on Leave Today (dinamis) @regression', async ({ page }) => {
    await dashboard.goto();
    // dinamis: pesan kosong ATAU daftar karyawan cuti tampil
    const emptyMsg = page.getByText('No Employees are on Leave Today');
    const hasContent = (await emptyMsg.count()) > 0;
    expect(hasContent || (await dashboard.employeesOnLeave.count()) > 0).toBeTruthy();
  });
});