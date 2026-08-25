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

  /** Buka halaman Purge; konfirmasi password hanya jika gate muncul */
  async gotoPurge(): Promise<void> {
    await this.goto();
    if ((await this.adminAccessHeading.count()) > 0) {
      await this.gatePasswordInput.fill('admin123');
      await this.confirmButton.click();
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