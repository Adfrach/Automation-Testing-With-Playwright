import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Leave (Leave Management) OrangeHRM.
 * Fitur 04-Leave. Locator diambil dari hasil exploratory testing (playwright-cli).
 */
export class LeavePage {
  readonly page: Page;

  // Sidebar
  readonly leaveMenu;

  // Halaman Leave List
  readonly leaveListHeading;
  readonly fromDateInput;
  readonly toDateInput;
  readonly statusDropdown;
  readonly employeeNameFilter;
  readonly searchButton;
  readonly resetButton;
  readonly noRecords;

  // Halaman Apply Leave
  readonly applyHeading;
  readonly noLeaveTypesMessage;
  readonly applyButton;

  constructor(page: Page) {
    this.page = page;
    this.leaveMenu = page.getByRole('link', { name: 'Leave' });

    this.leaveListHeading = page.getByRole('heading', { name: 'Leave List' });
    this.fromDateInput = page.locator(
      '.oxd-input-group:has(label:text-is("From Date")) input'
    );
    this.toDateInput = page.locator(
      '.oxd-input-group:has(label:text-is("To Date")) input'
    );
    this.statusDropdown = page.locator(
      '.oxd-input-group:has(label:text-is("Show Leave with Status")) .oxd-select-text'
    );
    this.employeeNameFilter = page.getByPlaceholder('Type for hints...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.noRecords = page.getByText('No Records Found');

    this.applyHeading = page.getByRole('heading', { name: 'Apply Leave' });
    this.noLeaveTypesMessage = page.getByText('No Leave Types with Leave Balance');
    this.applyButton = page.getByRole('button', { name: 'Apply' });
  }

  /** Buka modul Leave → Leave List; fallback login via UI bila sesi kedaluwarsa */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveModule');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/leave/viewLeaveModule');
    }
    await expect(this.leaveListHeading).toBeVisible({ timeout: 15000 });
  }

  /** Pilih opsi pada dropdown Status (custom oxd dropdown) */
  async selectStatus(option: string): Promise<void> {
    await this.statusDropdown.click();
    await this.page
      .getByRole('option', { name: option })
      .or(this.page.locator('.oxd-select-dropdown').getByText(option, { exact: true }))
      .first()
      .click();
  }

  /** Buka halaman Apply Leave */
  async gotoApply(): Promise<void> {
    await this.page.goto('/web/index.php/leave/applyLeave');
    await expect(this.applyHeading).toBeVisible({ timeout: 15000 });
  }
}