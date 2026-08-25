import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Admin (User Management) OrangeHRM.
 * Fitur 02-Admin. Locator diambil dari hasil exploratory testing (playwright-cli).
 */
export class AdminPage {
  readonly page: Page;

  // Sidebar
  readonly adminMenu;

  // Halaman System Users
  readonly systemUsersHeading;
  readonly usernameFilter;
  readonly searchButton;
  readonly resetButton;
  readonly addButton;
  readonly recordsCounter;
  readonly userTable;
  readonly tableRows;

  // Form Add User
  readonly addUserHeading;
  readonly employeeNameInput;
  readonly usernameInput;
  readonly passwordInput;
  readonly confirmPasswordInput;
  readonly saveButton;
  readonly cancelButton;
  readonly passwordHint;

  // Baris tabel & aksi delete
  readonly confirmDeleteButton;

  constructor(page: Page) {
    this.page = page;
    this.adminMenu = page.getByRole('link', { name: 'Admin' });

    this.systemUsersHeading = page.getByRole('heading', { name: 'System Users', exact: true });
    this.usernameFilter = page.locator('form').getByRole('textbox').first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.recordsCounter = page.locator('.oxd-text--span', { hasText: /Record(s)? Found/ });
    this.userTable = page.getByRole('table');
    // Tabel OrangeHRM memakai role ARIA tanpa <tbody> asli — pakai getByRole('row')
    // dan buang baris header (yang berisi columnheader).
    this.tableRows = this.userTable
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });

    this.addUserHeading = page.getByRole('heading', { name: 'Add User' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.usernameInput = page.locator('.oxd-input-group:has(label:text-is("Username")) input');
    this.passwordInput = page.locator('.oxd-input-group:has(label:text-is("Password")) input');
    this.confirmPasswordInput = page.locator('.oxd-input-group:has(label:text-is("Confirm Password")) input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.passwordHint = page.getByText('For a strong password', { exact: false });

    // Dialog konfirmasi delete
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
  }

  /** Locator pesan error field OrangeHRM; opsional filter berdasarkan teks. */
  fieldErrors(text?: string) {
    const base = this.page.locator('.oxd-input-field-error-message');
    return text ? base.filter({ hasText: text }) : base;
  }

  /** Hapus user pertama hasil filter username via ikon trash di baris tabel. */
  async deleteUserByUsername(username: string): Promise<void> {
    await this.searchByUsername(username);
    const row = this.tableRows.filter({ hasText: username }).first();
    // Healing: target ikon trash secara eksplisit (tombol terakhir bisa jadi
    // ikon pensil/edit yang membuka halaman Edit User, bukan dialog delete).
    await row.locator('i.oxd-icon.bi-trash').click();
    await this.confirmDeleteButton.click();
    await expect(this.recordsCounter).toContainText('Record', { timeout: 10000 });
  }

  /** Buka modul Admin dari sidebar; fallback login via UI bila sesi kedaluwarsa */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
    // Jika sesi tidak valid, aplikasi redirect ke halaman login → login ulang
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/admin/viewSystemUsers');
    }
    await expect(this.systemUsersHeading).toBeVisible({ timeout: 15000 });
  }

  /** Isi filter username lalu klik Search */
  async searchByUsername(username: string): Promise<void> {
    await this.usernameFilter.fill(username);
    await this.searchButton.click();
  }

  /** Klik Reset filter */
  async resetFilters(): Promise<void> {
    await this.resetButton.click();
  }

  /** Buka form Add User */
  async openAddUserForm(): Promise<void> {
    await this.addButton.click();
    await expect(this.addUserHeading).toBeVisible();
  }

  /** Pilih opsi pada dropdown berdasarkan urutan wrapper (0=User Role, 1=Status) */
  async selectDropdown(index: number, optionLabel: string): Promise<void> {
    await this.page.locator('.oxd-select-wrapper').nth(index).click();
    await this.page.getByRole('option', { name: optionLabel }).click();
  }

  /** Isi form Add User lengkap */
  async fillAddUserForm(opts: {
    role?: string;
    employeeName?: string;
    status?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<void> {
    if (opts.role) await this.selectDropdown(0, opts.role);
    if (opts.employeeName) {
      // ketik perlahan agar autocomplete termuat, lalu pilih hint pertama via keyboard
      await this.employeeNameInput.pressSequentially(opts.employeeName, { delay: 200 });
      // Data demo bisa berubah — pilih opsi VISIBLE yang match, atau fallback ke opsi pertama.
      // PENTING: abaikan placeholder transient "Searching...." dan elemen option lama tersembunyi.
      const realOptions = this.page
        .getByRole('option')
        .filter({ hasNotText: 'Searching' })
        .locator('visible=true');
      const matched = realOptions.filter({ hasText: opts.employeeName }).first();
      const anyOption = realOptions.first();
      const option = (await matched.isVisible().catch(() => false)) ? matched : anyOption;
      await option.waitFor({ state: 'visible', timeout: 10000 });
      await option.click();
      // pastikan hint benar-benar terpilih (nilai field berubah dari teks ketikan)
      await expect(this.employeeNameInput).not.toHaveValue(opts.employeeName, { timeout: 5000 });
    }
    if (opts.status) await this.selectDropdown(1, opts.status);
    if (opts.username) await this.usernameInput.fill(opts.username);
    if (opts.password) await this.passwordInput.fill(opts.password);
    if (opts.confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(opts.confirmPassword);
    }
  }

  /** Simpan form Add User dan tunggu respons API POST /api/v2/admin/users */
  async saveUser(): Promise<void> {
    const respPromise = this.page.waitForResponse(
      (r) => r.url().includes('/api/v2/admin/users') && r.request().method() === 'POST'
    );
    await this.saveButton.click();
    return respPromise.then(() => undefined);
  }

  /** Ambil teks counter jumlah record */
  async getRecordsCounterText(): Promise<string> {
    return (await this.recordsCounter.first().textContent()) ?? '';
  }
}