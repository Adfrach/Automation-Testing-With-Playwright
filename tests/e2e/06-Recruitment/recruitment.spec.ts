import { test, expect } from '@playwright/test';
import { RecruitmentPage } from '../../../pages/06-Recruitment/RecruitmentPage';

/**
 * Fitur Recruitment (Candidates) — Mode E2E.
 * Menggunakan storageState dari global-setup (login via UI).
 */
test.describe.configure({ mode: 'serial' });

test.use({ storageState: 'playwright-artifacts/auth-state.json' });

test.describe('Recruitment - Candidates - 06', () => {
  let recruitment: RecruitmentPage;

  test.beforeEach(async ({ page }) => {
    recruitment = new RecruitmentPage(page);
  });

  test('TC-01 Buka halaman Candidates via menu Recruitment @smoke @regression', async ({ page }) => {
    await recruitment.goto();
    await expect(page).toHaveURL(/\/recruitment\/viewCandidates/);
    await expect(recruitment.candidatesHeading).toBeVisible();
    await expect(recruitment.addButton).toBeVisible();
    await expect(recruitment.jobTitleDropdown).toBeVisible();
    await expect(recruitment.candidateNameInput).toBeVisible();
    await expect(recruitment.keywordsInput).toBeVisible();
    await expect(recruitment.resetButton).toBeVisible();
    await expect(recruitment.searchButton).toBeVisible();
  });

  test('TC-02 Search tanpa filter (opsional) @smoke @regression', async ({ page }) => {
    await recruitment.goto();
    await recruitment.searchButton.click();
    // tidak ada error; tabel kandidat tetap tampil
    await expect(recruitment.candidatesTable).toBeVisible({ timeout: 15000 });
    const error = page.locator('.oxd-alert--error');
    await expect(error).toHaveCount(0);
  });

  test('TC-03 Reset filter @regression', async () => {
    await recruitment.goto();
    // pilih opsi pertama pada dropdown Job Title
    await recruitment.jobTitleDropdown.click();
    await recruitment.page.locator('.oxd-select-dropdown .oxd-select-option').first().click();
    await recruitment.resetButton.click();
    // dropdown kembali ke default "-- Select --"
    await expect(
      recruitment.jobTitleDropdown.locator('.oxd-select-text-input')
    ).toHaveText('-- Select --');
  });
});