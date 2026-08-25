import { test, expect } from '@playwright/test';
import { MyInfoPage } from '../../../pages/07-My-Info/MyInfoPage';

/**
 * Fitur My Info (Personal Details) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('My Info - Personal Details - 07', () => {
  let myInfo: MyInfoPage;

  test.beforeEach(async ({ page }) => {
    myInfo = new MyInfoPage(page);
  });

  test('TC-01 Buka halaman Personal Details via menu My Info @smoke @regression', async ({ page }) => {
    await myInfo.goto();
    await expect(page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/);
    await expect(myInfo.personalDetailsHeading).toBeVisible();
    await expect(myInfo.firstNameInput).toBeVisible();
    await expect(myInfo.middleNameInput).toBeVisible();
    await expect(myInfo.lastNameInput).toBeVisible();
    await expect(myInfo.saveButton).toBeVisible();
    await expect(myInfo.attachmentsHeading).toBeVisible();
  });

  test('TC-02 Tab navigasi lengkap (10 tab) @regression', async ({ page }) => {
    await myInfo.goto();
    for (const tab of myInfo.tabs) {
      await expect(
        page.getByRole('link', { name: tab, exact: true }).first()
      ).toBeVisible();
    }
  });

  test('TC-03 Validasi Save tanpa First Name (negative) @regression', async ({ page }) => {
    await myInfo.goto();
    await myInfo.firstNameInput.fill('');
    await myInfo.saveButton.click();
    // aplikasi menolak penyimpanan: tidak ada toast Success
    await page.waitForTimeout(2000);
    const successToast = page.locator('.oxd-toast--success');
    await expect(successToast).toHaveCount(0);
  });
});