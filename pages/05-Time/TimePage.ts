import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Time (Timesheets) OrangeHRM.
 * Fitur 05-Time. Locator dari hasil exploratory testing (playwright-cli).
 */
export class TimePage {
  readonly page: Page;

  readonly timeMenu;
  readonly selectEmployeeHeading;
  readonly employeeNameInput;
  readonly viewButton;
  readonly pendingActionHeading;
  readonly requiredError;

  constructor(page: Page) {
    this.page = page;
    this.timeMenu = page.getByRole('link', { name: 'Time' });
    this.selectEmployeeHeading = page.getByRole('heading', { name: 'Select Employee' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.viewButton = page.locator('form').getByRole('button', { name: 'View' });
    this.pendingActionHeading = page.getByRole('heading', {
      name: 'Timesheets Pending Action',
    });
    this.requiredError = page.locator('.oxd-input-field-error-message', {
      hasText: 'Required',
    });
  }

  /** Buka modul Time → View Employee Timesheet; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/time/viewTimeModule');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/time/viewTimeModule');
    }
    await expect(this.selectEmployeeHeading).toBeVisible({ timeout: 15000 });
  }

  /** Isi autocomplete Employee Name dan pilih opsi pertama yang BUKAN status loading */
  async selectFirstEmployee(hint: string): Promise<string> {
    await this.employeeNameInput.fill(hint);
    const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
    const option = dropdown.locator('.oxd-autocomplete-option').first();
    // tunggu hingga teks opsi bukan indikator loading ("Searching....")
    await expect
      .poll(async () => {
        if (!(await dropdown.isVisible())) return 'loading';
        return (await option.innerText().catch(() => '')).trim();
      }, { timeout: 15000 })
      .not.toMatch(/Searching|loading/i);
    const name = ((await option.innerText()) || '').trim();
    await option.click();
    return name;
  }
}