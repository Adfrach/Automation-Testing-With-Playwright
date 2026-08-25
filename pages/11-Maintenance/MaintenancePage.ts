import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Maintenance OrangeHRM.
 * Fitur 11-Maintenance. Locator dari hasil exploratory testing (playwright-cli).
 */
export class MaintenancePage {
  readonly page: Page;

  readonly maintenanceMenu;
  readonly adminAccessHeading;
  readonly gateUsernameInput;
  readonly gatePasswordInput;
  readonly cancelButton;
  readonly confirmButton;
  readonly purgeHeading;
  readonly pastEmployeeInput;
  readonly searchButton;
  readonly requiredMessage;

  constructor(page: Page) {
    this.page = page;
    this.maintenanceMenu = page.getByRole('link', { name: 'Maintenance' });
    this.adminAccessHeading = page.getByRole('heading', {
      name: 'Administrator Access',
    });
    this.gateUsernameInput = page.locator('.oxd-input').first();
    this.gatePasswordInput = page.locator('input[type="password"]');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.purgeHeading = page.getByRole('heading', {
      name: 'Purge Employee Records',
    });
    this.pastEmployeeInput = page.getByPlaceholder('Type for hints...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.requiredMessage = page.getByText('Required', { exact: true });
  }

  /**
   * Konfirmasi gate Administrator Access dengan retry.
   * Healing: verifikasi gate kadang gagal sesaat di server demo (flaky) —
   * coba maksimal 2x dengan password dari env TEST_PASSWORD.
   */
  async confirmGate(): Promise<void> {
    const password = process.env.TEST_PASSWORD || 'admin123';
    for (let attempt = 0; attempt < 3; attempt++) {
      // Healing iterasi 5: pastikan gate benar-benar tampil sebelum mengisi
      // password — jika gate sudah lewat, langsung return.
      const gateVisible = await this.adminAccessHeading
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (!gateVisible) return;
      // bersihkan field password sebelum mengetik ulang
      await this.gatePasswordInput.fill('');
      await this.gatePasswordInput.pressSequentially(password, { delay: 50 });
      await this.confirmButton.click();
      // Healing iterasi 6: tunggu purge heading muncul (bukti gate sukses
      // dilewati) — bukan hanya gate hidden.
      const passed = await this.purgeHeading
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (passed) return;
    }
    // fallback: tunggu purge heading sekali lagi setelah loop
    await this.purgeHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Buka halaman Purge; konfirmasi password hanya jika gate muncul */
  async gotoPurge(): Promise<void> {
    await this.goto();
    if ((await this.adminAccessHeading.count()) > 0) {
      await this.confirmGate();
    }
    await expect(this.purgeHeading).toBeVisible({ timeout: 15000 });
  }

  /** Buka halaman Maintenance; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/maintenance/purgeEmployee');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page
        .getByRole('button', { name: 'Login' })
        .click();
      await this.page.waitForURL('**/maintenance/**', { timeout: 15000 });
    }
  }
}