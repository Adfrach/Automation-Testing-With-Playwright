import { Page, Locator, Response, expect } from '@playwright/test';

const VALID_USER = process.env.TEST_USERNAME || 'Admin';
const VALID_PASS = process.env.TEST_PASSWORD || 'admin123';

/**
 * Page Object Model — Halaman Login (OrangeHRM).
 * Menyimpan selector & aksi yang terkait form login.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.getByText('Invalid credentials');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.heading = page.getByRole('heading', { name: 'Login' });
  }

  async goto(): Promise<void> {
    const base = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
    await this.page.goto(`${base}/web/index.php/auth/login`);
  }

  async fillUsername(value: string): Promise<void> {
    await this.usernameInput.fill(value);
  }

  async fillPassword(value: string): Promise<void> {
    await this.passwordInput.fill(value);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /** Submit login & tunggu respons endpoint auth/validate (untuk assertion network). */
  async clickLoginAndWaitForResponse(): Promise<Response> {
    const responsePromise = this.page.waitForResponse((resp) =>
      resp.url().includes('/auth/validate')
    );
    await this.loginButton.click();
    return responsePromise;
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectRequiredOnUsername(): Promise<void> {
    await expect(this.page.getByText('Required').first()).toBeVisible();
  }

  async expectRequiredOnPassword(): Promise<void> {
    // .last() → robust: TC-05 (1 Required) & TC-06 (2 Required, ambil terakhir)
    await expect(this.page.getByText('Required').last()).toBeVisible();
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }

  async expectDashboard(): Promise<void> {
    // Redirect ke dashboard & heading Dashboard tampil
    await this.page.waitForURL('**/dashboard/index');
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }
}

export { VALID_USER, VALID_PASS };
