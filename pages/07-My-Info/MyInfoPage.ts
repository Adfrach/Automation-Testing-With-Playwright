import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul My Info (Personal Details) OrangeHRM.
 * Fitur 07-My-Info. Locator dari hasil exploratory testing (playwright-cli).
 */
export class MyInfoPage {
  readonly page: Page;

  readonly myInfoMenu;
  readonly personalDetailsHeading;
  readonly firstNameInput;
  readonly middleNameInput;
  readonly lastNameInput;
  readonly saveButton;
  readonly attachmentsHeading;
  readonly requiredError;
  readonly tabs;

  constructor(page: Page) {
    this.page = page;
    this.myInfoMenu = page.getByRole('link', { name: 'My Info' });
    this.personalDetailsHeading = page.getByRole('heading', { name: 'Personal Details' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.middleNameInput = page.getByRole('textbox', { name: 'Middle Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.saveButton = page.locator('form').getByRole('button', { name: 'Save' }).first();
    this.attachmentsHeading = page.getByRole('heading', { name: 'Attachments' });
    this.requiredError = page.locator('.oxd-input-field-error-message', {
      hasText: 'Required',
    });
    this.tabs = [
      'Personal Details',
      'Contact Details',
      'Emergency Contacts',
      'Dependents',
      'Immigration',
      'Job',
      'Salary',
      'Report-to',
      'Qualifications',
      'Memberships',
    ];
  }

  /** Buka menu My Info → Personal Details; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewMyDetails');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/pim/viewMyDetails');
    }
    await expect(this.personalDetailsHeading).toBeVisible({ timeout: 15000 });
  }
}