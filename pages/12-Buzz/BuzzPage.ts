import { expect, test, type Page } from '@playwright/test';

/**
 * Page Object Model - Modul Buzz OrangeHRM.
 * Fitur 12-Buzz. Locator dari hasil exploratory testing (playwright-cli).
 */
export class BuzzPage {
  readonly page: Page;

  readonly buzzMenu;
  readonly buzzHeading;
  readonly postInput;
  readonly postButton;
  readonly mostLikedFilter;
  readonly feedContainer;

  constructor(page: Page) {
    this.page = page;
    this.buzzMenu = page.getByRole('link', { name: 'Buzz' });
    this.buzzHeading = page.getByRole('heading', { name: 'Buzz' }).first();
    this.postInput = page.getByPlaceholder("What's on your mind?");
    this.postButton = page.getByRole('button', { name: 'Post', exact: true });
    this.mostLikedFilter = page.getByRole('button', {
      name: 'Most Liked Posts',
    });
    this.feedContainer = page.locator('.orangehrm-buzz-newsfeed');
  }

  /** Buka halaman Buzz; fallback login via UI */
  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/buzz/viewBuzz');
    if (this.page.url().includes('/auth/login')) {
      const username = process.env.TEST_USERNAME || 'Admin';
      const password = process.env.TEST_PASSWORD || 'admin123';
      await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
      await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();
      await this.page.waitForURL('**/buzz/viewBuzz', { timeout: 15000 });
    }
    // Healing: user demo OrangeHRM OS 5.9 tidak punya akses modul Buzz
    // (403 Module Forbidden) — skip test dengan alasan eksplisit.
    const forbidden = this.page.getByRole('heading', { name: 'Module Forbidden' });
    if (await forbidden.isVisible().catch(() => false)) {
      test.skip(true, 'Modul Buzz dibatasi (403 Module Forbidden) untuk user demo');
    }
    await expect(this.postInput).toBeVisible({ timeout: 15000 });
  }

  /** Buat post teks baru */
  async createPost(text: string): Promise<void> {
    await this.postInput.fill(text);
    await this.postButton.click();
  }
}