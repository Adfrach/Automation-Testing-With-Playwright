import { expect, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Dashboard OrangeHRM.
 * Fitur 09-Dashboard. Locator dari hasil exploratory testing (playwright-cli).
 */
export class DashboardPage {
  readonly page: Page;

  readonly dashboardMenu;
  readonly dashboardHeading;
  readonly timeAtWork;
  readonly myActions;
  readonly quickLaunch;
  readonly buzzLatestPosts;
  readonly employeesOnLeave;
  readonly assignLeaveButton;

  constructor(page: Page) {
    this.page = page;
    this.dashboardMenu = page.getByRole('link', { name: 'Dashboard' });
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.timeAtWork = page.getByText('Time at Work');
    this.myActions = page.getByText('My Actions');
    this.quickLaunch = page.getByText('Quick Launch');
    this.buzzLatestPosts = page.getByText('Buzz Latest Posts');
    this.employeesOnLeave = page.getByText('Employees on Leave Today');
    this.assignLeaveButton = page.getByRole('button', { name: 'Assign Leave' });
  }

  /** Buka halaman Dashboard; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/dashboard/index', { timeout: 15000 });
    }
    await expect(this.dashboardHeading).toBeVisible({ timeout: 15000 });
  }
}