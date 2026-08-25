import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Recruitment (Candidates) OrangeHRM.
 * Fitur 06-Recruitment. Locator dari hasil exploratory testing (playwright-cli).
 */
export class RecruitmentPage {
  readonly page: Page;

  readonly recruitmentMenu;
  readonly candidatesHeading;
  readonly addButton;
  readonly jobTitleDropdown;
  readonly candidateNameInput;
  readonly keywordsInput;
  readonly searchButton;
  readonly resetButton;
  readonly candidatesTable;

  constructor(page: Page) {
    this.page = page;
    this.recruitmentMenu = page.getByRole('link', { name: 'Recruitment' });
    this.candidatesHeading = page.getByRole('heading', { name: 'Candidates' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.jobTitleDropdown = page.locator(
      '.oxd-input-group:has(label:text-is("Job Title")) .oxd-select-text'
    );
    this.candidateNameInput = page.getByPlaceholder('Type for hints...');
    this.keywordsInput = page.getByPlaceholder('Enter comma seperated words...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.candidatesTable = page.locator('.orangehrm-container');
  }

  /** Buka modul Recruitment → Candidates; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/recruitment/viewRecruitmentModule');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/recruitment/viewRecruitmentModule');
    }
    await expect(this.candidatesHeading).toBeVisible({ timeout: 15000 });
  }
}