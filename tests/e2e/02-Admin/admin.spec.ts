import { test, expect } from '@playwright/test';
import { AdminPage } from '../../../pages/02-Admin/AdminPage';

/**
 * Fitur Admin (User Management) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

const UNIQUE = `qa_${Date.now()}`;

test.describe('Admin - User Management - 02', () => {
  let admin: AdminPage;

  test.beforeEach(async ({ page }) => {
    admin = new AdminPage(page);
  });

  test('TC-01 Buka halaman System Users via menu Admin @smoke @regression', async ({ page }) => {
    await admin.goto();
    await expect(page).toHaveURL(/\/admin\/viewSystemUsers/);
    await expect(admin.systemUsersHeading).toBeVisible();
    // tabel dimuat async via API — tunggu counter record muncul dulu
    await expect(admin.recordsCounter).toHaveText(/Record(s)? Found/, { timeout: 15000 });
    await expect(admin.tableRows.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-02 Search user by username valid @smoke @regression', async ({ page }) => {
    await admin.goto();
    await admin.searchByUsername('Admin');
    await expect(admin.recordsCounter).toContainText('(1) Record Found', { timeout: 10000 });
    await expect(admin.tableRows).toHaveCount(1);
    // Nama employee bisa berubah di server demo — assert field stabil saja
    await expect(admin.tableRows.first()).toContainText('Admin');
    await expect(admin.tableRows.first()).toContainText('Enabled');
  });

  test('TC-03 Search user tidak ditemukan @regression', async ({ page }) => {
    await admin.goto();
    await admin.searchByUsername('NoSuchUserXYZ');
    await expect(admin.tableRows).toHaveCount(0, { timeout: 10000 });
  });

  test('TC-04 Reset filter @regression', async ({ page }) => {
    await admin.goto();
    await admin.searchByUsername('Admin');
    await expect(admin.recordsCounter).toContainText('(1) Record Found', { timeout: 10000 });
    await admin.resetFilters();
    await expect(admin.usernameFilter).toHaveValue('');
    // daftar lengkap kembali tampil
    await expect(admin.tableRows.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-05 Validasi elemen UI form Add User @smoke @regression', async ({ page }) => {
    await admin.goto();
    await admin.openAddUserForm();
    await expect(page).toHaveURL(/\/admin\/saveSystemUser/);
    await expect(admin.addUserHeading).toBeVisible();
    await expect(page.getByText('User Role')).toBeVisible();
    await expect(page.getByText('Employee Name')).toBeVisible();
    await expect(page.getByText('Status', { exact: true })).toBeVisible();
    await expect(admin.usernameInput).toBeVisible();
    await expect(admin.passwordInput).toBeVisible();
    await expect(admin.confirmPasswordInput).toBeVisible();
    await expect(admin.passwordHint).toBeVisible();
    await expect(admin.cancelButton).toBeVisible();
    await expect(admin.saveButton).toBeVisible();
  });

  test('TC-06 Submit Add User kosong (negative) @regression', async ({ page }) => {
    await admin.goto();
    await admin.openAddUserForm();
    await admin.saveButton.click();
    const requiredMessages = admin.fieldErrors('Required');
    await expect(requiredMessages.first()).toBeVisible();
    expect(await requiredMessages.count()).toBeGreaterThanOrEqual(4);
    await expect(page).toHaveURL(/\/admin\/saveSystemUser/);
  });

  test('TC-07 Password mismatch (negative) @regression', async ({ page }) => {
    await admin.goto();
    await admin.openAddUserForm();
    await admin.fillAddUserForm({
      password: 'Test@1234',
      confirmPassword: 'Test@9999',
    });
    await admin.saveButton.click();
    await expect(admin.fieldErrors('Passwords do not match').first()).toBeVisible();
  });

  test('TC-08 Tambah user baru valid (happy flow) @smoke @regression', async ({ page }) => {
    await admin.goto();
    await admin.openAddUserForm();
    await admin.fillAddUserForm({
      role: 'ESS',
      employeeName: 'a', // query generik — data demo bisa berubah
      status: 'Enabled',
      username: UNIQUE,
      password: 'QaPass@12345',
      confirmPassword: 'QaPass@12345',
    });
    await admin.saveUser();
    // redirect ke list (toast "Successfully Saved" bersifat sementara — diverifikasi via data)
    await expect(page).toHaveURL(/\/admin\/viewSystemUsers/, { timeout: 15000 });
    // verifikasi user baru muncul via filter
    await admin.searchByUsername(UNIQUE);
    await expect(admin.tableRows.first()).toContainText(UNIQUE, { timeout: 10000 });
  });

  test('TC-09 Hapus user yang dibuat TC-08 (state transition CRUD) @regression', async () => {
    await admin.goto();
    await admin.deleteUserByUsername(UNIQUE);
    // setelah delete, filter username tidak menemukan lagi
    await admin.searchByUsername(UNIQUE);
    await expect(admin.tableRows).toHaveCount(0, { timeout: 10000 });
  });
});
