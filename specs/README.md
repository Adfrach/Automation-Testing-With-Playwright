# OrangeHRM QA Automation (Playwright + TypeScript)

Framework otomasi E2E & API untuk OrangeHRM Open Source demo.

## Quick Start (setelah clone)

```bash
npm install
npx playwright install chromium
npx playwright test
```

Tidak perlu file `.env` — semua variabel (`BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`) sudah punya default ke OrangeHRM OS demo. Buat `.env.development` hanya jika ingin override target/kredensial:

```
BASE_URL=https://opensource-demo.orangehrmlive.com
API_BASE_URL=https://opensource-demo.orangehrmlive.com
TEST_USERNAME=Admin
TEST_PASSWORD=admin123
```

## Menjalankan Test

```bash
# E2E saja / API saja
npx playwright test tests/e2e
npx playwright test tests/api

# Semua test
npx playwright test

# Tag tertentu
npx playwright test --grep "@smoke"
```

## Struktur

- `tests/e2e/<NN>-<feature>/` — skenario UI per fitur
- `tests/api/<NN>-<feature>/` — skenario API per fitur
- `pages/<NN>-<feature>/` — Page Object Model
- `doc/Test-Plan/` — test plan per fitur
- `test-results/` — report & evidence hasil eksekusi
- `bugs/` — defect log yang ditemukan saat pengujian

Session auth dibuat otomatis oleh global-setup (login via UI) dan disimpan di `playwright-artifacts/auth-state.json` (tidak di-commit).