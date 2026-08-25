import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul PIM (Employee Management) OrangeHRM.
 * Fitur 03-Pim. Locator diambil dari hasil exploratory testing (playwright-cli).
 */
export class PimPage {
  readonly page: Page;

  // Sidebar
  readonly pimMenu;

  // Halaman Employee List
  readonly employeeInfoHeading;
  readonly employeeNameFilter;
  readonly employeeIdFilter;
  readonly searchButton;
  readonly resetButton;
  readonly addButton;
  readonly recordsCounter;
  readonly tableRows;
  readonly pagination;

  // Form Add Employee
  readonly addEmployeeHeading;
  readonly firstNameInput;
  readonly middleNameInput;
  readonly lastNameInput;
  readonly employeeIdInput;
  readonly loginDetailsToggle;
  readonly saveButton;
  readonly cancelButton;

  /** Locator pesan error field OrangeHRM; opsional filter berdasarkan teks. */
  fieldErrors(text?: string) {
    const base = this.page.locator('.oxd-input-field-error-message');
    return text ? base.filter({ hasText: text }) : base;
  }

  /** Grup form field Status (label persis "Status"). */
  statusGroup() {
    return this.page.locator('.oxd-input-group:has(label:text-is("Status"))');
  }
  readonly photoHint;
  readonly usernameInput;
  readonly passwordInput;

  constructor(page: Page) {
    this.page = page;
    this.pimMenu = page.getByRole('link', { name: 'PIM' });

    this.employeeInfoHeading = page.getByRole('heading', { name: 'Employee Information' });
    this.employeeNameFilter = page.getByPlaceholder('Type for hints...').first();
    this.employeeIdFilter = page.locator(
      '.oxd-input-group:has(label:text-is("Employee Id")) input'
    );
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.recordsCounter = page.locator('.oxd-text--span', { hasText: /Record(s)? Found/ });
    this.tableRows = page
      .getByRole('table')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    this.pagination = page.getByRole('navigation', { name: 'Pagination Navigation' });

    this.addEmployeeHeading = page.getByRole('heading', { name: 'Add Employee' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.locator(
      '.oxd-input-group:has(label:text-is("Employee Id")) input'
    );
    this.loginDetailsToggle = page.locator('.oxd-switch-input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.photoHint = page.getByText('Accepts jpg, .png, .gif up to 1MB');
    this.usernameInput = page.locator('.oxd-input-group:has(label:text-is("Username")) input');
    this.passwordInput = page.locator('.oxd-input-group:has(label:text-is("Password")) input');
  }

  /** Buka modul PIM → Employee List; fallback login via UI bila sesi kedaluwarsa */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
      await this.page.goto('/web/index.php/pim/viewEmployeeList');
    }
    await expect(this.employeeInfoHeading).toBeVisible({ timeout: 15000 });
  }

  /** Isi filter nama lalu klik Search */
  async searchByName(name: string): Promise<void> {
    await this.employeeNameFilter.fill(name);
    await this.searchButton.click();
  }

  /** Buka form Add Employee */
  async openAddEmployeeForm(): Promise<void> {
    await this.addButton.click();
    await expect(this.addEmployeeHeading).toBeVisible();
  }

  /** Aktifkan toggle Create Login Details */
  async enableLoginDetails(): Promise<void> {
    await this.loginDetailsToggle.click();
    await expect(this.usernameInput).toBeVisible();
  }

  /** Simpan form Add Employee dan tunggu respons API POST /api/v2/pim/employees */
  async saveUser(): Promise<void> {
    const respPromise = this.page.waitForResponse(
      (r) => r.url().includes('/api/v2/pim/employees') && r.request().method() === 'POST'
    );
    await this.saveButton.click();
    return respPromise.then(() => undefined);
  }
}
