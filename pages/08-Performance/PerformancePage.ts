import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Performance (Manage Reviews) OrangeHRM.
 * Fitur 08-Performance. Locator dari hasil exploratory testing (playwright-cli).
 */
export class PerformancePage {
  readonly page: Page;

  readonly performanceMenu;
  readonly employeeReviewsHeading;
  readonly employeeNameInput;
  readonly jobTitleDropdown;
  readonly searchButton;
  readonly resetButton;
  readonly reviewsTable;

  /** Alert error global OrangeHRM (mis. validasi server). */
  errorAlert() {
    return this.page.locator('.oxd-alert--error');
  }

  /** Select-text dropdown "Include". */
  includeDropdownText() {
    return this.page.locator('.oxd-input-group:has(label:text-is("Include")) .oxd-select-text');
  }

  /** Klik opsi pertama pada dropdown oxd yang sedang terbuka. */
  async selectFirstDropdownOption(): Promise<void> {
    await this.page.locator('[role="option"]').first().click();
  }

  constructor(page: Page) {
    this.page = page;
    this.performanceMenu = page.getByRole('link', { name: 'Performance' });
    this.employeeReviewsHeading = page.getByRole('heading', { name: 'Employee Reviews' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator(
      '.oxd-input-group:has(label:text-is("Job Title")) .oxd-select-text'
    );
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.reviewsTable = page.locator('.orangehrm-container');
  }

  /** Buka modul Performance → Manage Reviews; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/performance/viewPerformanceModule');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/performance/viewPerformanceModule');
    }
    await expect(this.employeeReviewsHeading).toBeVisible({ timeout: 15000 });
  }
}