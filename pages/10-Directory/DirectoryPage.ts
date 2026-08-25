import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Directory OrangeHRM.
 * Fitur 10-Directory. Locator dari hasil exploratory testing (playwright-cli).
 */
export class DirectoryPage {
  readonly page: Page;

  readonly directoryMenu;
  readonly directoryHeading;
  readonly employeeNameInput;
  readonly jobTitleDropdown;
  readonly locationDropdown;
  readonly resetButton;
  readonly searchButton;
  readonly recordsFound;
  readonly noRecordsFound;

  constructor(page: Page) {
    this.page = page;
    this.directoryMenu = page.getByRole('link', { name: 'Directory' });
    this.directoryHeading = page.getByRole('heading', { name: 'Directory' }).first();
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.jobTitleDropdown = page.locator(
      '.oxd-input-group:has(label:text-is("Job Title")) .oxd-select-text'
    );
    this.locationDropdown = page.locator(
      '.oxd-input-group:has(label:text-is("Location")) .oxd-select-text'
    );
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsFound = page.getByText(/Records Found/);
    this.noRecordsFound = page.getByText('No Records Found');
  }

  /** Buka halaman Directory; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/directory/viewDirectory');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/directory/viewDirectory', { timeout: 15000 });
    }
    await expect(this.directoryHeading).toBeVisible({ timeout: 15000 });
  }

  /** Isi Employee Name (tanpa memilih hint — search API mendukung substring) */
  async fillEmployeeName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
  }
}