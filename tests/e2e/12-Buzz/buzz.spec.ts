import { test, expect } from '@playwright/test';
import { BuzzPage } from '../../../pages/12-Buzz/BuzzPage';

/**
 * Fitur Buzz — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Buzz - 12', () => {
  let buzz: BuzzPage;

  test.beforeEach(async ({ page }) => {
    buzz = new BuzzPage(page);
  });

  test('TC-01 Buka halaman Buzz → newsfeed & post box @smoke @regression', async ({
    page,
  }) => {
    await buzz.goto();
    await expect(page).toHaveURL(/\/buzz\/viewBuzz/);
    await expect(buzz.buzzHeading).toBeVisible();
    await expect(buzz.postInput).toBeVisible();
    await expect(buzz.postButton).toBeVisible();
    await expect(buzz.mostLikedFilter).toBeVisible();
  });

  test('TC-02 Post teks → muncul di feed paling atas @smoke @regression', async ({
    page,
  }) => {
    await buzz.goto();
    const text = `Automation test post ${Date.now()}`;
    await buzz.createPost(text);
    // post baru tampil di feed
    await expect(
      page.getByText(text).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('TC-03 Filter Most Liked Posts → feed ter-render @regression', async () => {
    await buzz.goto();
    await buzz.mostLikedFilter.click();
    await expect(buzz.buzzHeading).toBeVisible();
    await expect(buzz.postInput).toBeVisible();
  });
});