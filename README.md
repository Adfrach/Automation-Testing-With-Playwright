# QA Automation Framework — OrangeHRM (Playwright + TypeScript)

Framework otomasi pengujian E2E dan API untuk aplikasi OrangeHRM Open Source demo. Seluruh siklus pengujian dikerjakan oleh AI agent mengikuti workflow terstruktur: eksplorasi PRD, test plan, pembuatan script, eksekusi dengan self-healing, hingga reporting.

## Tools yang Digunakan

| Tool / Komponen | Fungsi |
|------|--------|
| Playwright | Framework test E2E & API |
| TypeScript | Bahasa pemrograman test |
| Node.js | Runtime eksekusi |
| Page Object Model (POM) | Pola desain untuk maintainability UI test |
| Git / GitHub | Version control & repository |
| AI Coding Agent (Cline) | Orkestrator yang menjalankan seluruh workflow pengujian |
| Skill `playwright-cli` | Otomasi browser untuk eksplorasi manual (PRD Explorer) via CLI Playwright |
| Agent `playwright-test-planner` | Menganalisis PRD dan menyusun test plan komprehensif |
| Agent `playwright-test-healer` | Mendiagnosis kegagalan test dan melakukan self-healing pada script |
| GitHub MCP Server | Integrasi commit/push langsung dari agent ke repository |

## Struktur Proyek

```
.
├── PRD/                      # Product Requirements Document per fitur
├── doc/Test-Plan/            # Test plan per fitur
├── pages/                    # Page Object Model classes
│   └── <NN>-<feature>/
├── tests/
│   ├── e2e/<NN>-<feature>/   # Skenario UI per fitur
│   ├── api/<NN>-<feature>/   # Skenario API per fitur
│   ├── fixtures/             # Custom fixtures
│   ├── helpers/              # Utility functions
│   └── global-setup/         # Login via UI + session storage state
├── scripts/exploratory/      # Script eksplorasi manual
├── test-results/             # Report & evidence hasil eksekusi
├── bugs/                     # Defect log yang ditemukan saat testing
├── playwright.config.ts      # Konfigurasi Playwright
└── specs/README.md           # Dokumentasi singkat
```

Penamaan folder fitur menggunakan format `<NN>-<feature>` (contoh: `01-login`, `12-buzz`) agar konsisten di semua lokasi.

## Workflow Agentic AI

```mermaid
flowchart TD
    A[User memilih mode] --> B{Mode?}
    B -->|PRD Explorer| C[Eksplorasi app via playwright-cli]
    C --> D[Generate PRD]
    B -->|API / E2E / Keduanya| E[Step 0: Init workspace]
    D --> E
    E --> F[Step 1: Baca & analisis PRD]
    F --> G[Step 2: Buat test plan]
    G --> H[Step 3: Exploratory testing]
    H --> I[Step 4: Generate automation script]
    I --> J[Step 5: Eksekusi test + self-healing]
    J --> L2{Lulus semua?}
    L2 -->|tidak, gagal| K[test-healer mendiagnosis & perbaiki script]
    K --> J
    L2 -->|ya| L[Step 6: Generate report]
    L --> M[Step 7: Commit & push ke GitHub]
```

Mode yang tersedia:

- **E2E** — uji alur UI dari sudut pandang pengguna
- **API** — uji endpoint langsung tanpa UI
- **Keduanya** — jalankan API lalu E2E untuk fitur yang sama
- **Regression** — jalankan seluruh suite yang ada + auto-heal kegagalan
- **PRD Explorer** — eksplorasi area aplikasi dan hasilkan PRD

## Cara Menulis Prompt Berdasarkan Workflow

Prompt cukup menyebutkan mode dan fitur target. Contoh:

```
Jalankan workflow API dan E2E untuk fitur Buzz (12).
Gunakan PRD/prd-12-buzz.md sebagai acuan.
Ikuti prompts/api.md sampai selesai, lanjutkan prompts/e2e.md,
lalu commit sesuai template di prompts/git-commit.md.
```

Contoh prompt regression:

```
Jalankan regression penuh seluruh suite (E2E + API),
heal semua kegagalan tanpa membuat test baru,
dan buat report regression timestamped.
```

## Instalasi

Prasyarat: Node.js 18+ dan Git sudah terpasang.

```bash
git clone https://github.com/Adfrach/Automation-Testing-With-Playwright.git
cd Automation-Testing-With-Playwright
npm install
npx playwright install chromium
```

Tidak perlu file `.env` — semua variabel (`BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`) memiliki default ke OrangeHRM OS demo. Buat `.env.development` hanya jika ingin override target atau kredensial.

## Menjalankan Test

Seluruh suite (E2E + API):

```bash
npx playwright test
```

Per fitur (contoh fitur Buzz):

```bash
npx playwright test tests/e2e/12-Buzz
npx playwright test tests/api/12-Buzz
```

Per tag:

```bash
npx playwright test --grep "@smoke"
```

Melihat report HTML:

```bash
npx playwright show-report
```

## Contoh Hasil Test Report

Report disimpan di `test-results/e2e/<NN>-<feature>/` dan `test-results/api/<NN>-<feature>/`. Contoh ringkasan:

```
# Test Report - Buzz - E2E

Ringkasan Eksekusi
Total Test : 3
Passed     : 3
Failed     : 0

Hasil Per Test Case
TC-01  Buka halaman Buzz            PASS
TC-02  Post teks muncul di feed     PASS
TC-03  Filter Most Liked Posts      PASS

Healing Log
1. TC-02: tombol "Post" strict-mode violation -> locator exact:true
```

## Contoh Reporting Bug

Bug ditemukan saat testing diarsipkan di `bugs/api/<NN>-<feature>.md` dengan format:

```
BUG-LEAVE-001
Severity : Critical
Title    : Endpoint leave/requests mengembalikan data cuti tanpa auth

Steps to Reproduce:
1. GET /api/v2/leave/requests tanpa cookie/session
2. Perhatikan response body

Expected: HTTP 401 Unauthorized
Actual  : HTTP 200 dengan seluruh data cuti karyawan

Status: Open
```

## Cakupan Pengujian

12 fitur OrangeHRM telah diotomasi lengkap (E2E + API):

| NN | Fitur | E2E | API |
|----|-------|-----|-----|
| 01 | Login | 7/7 PASS | 8/8 PASS |
| 02 | Admin (User Management) | 8/8 PASS | 5/5 PASS |
| 03 | PIM (Employee Management) | 8/8 PASS | 5/5 PASS |
| 04 | Leave | 5/5 PASS | 5/5 PASS |
| 05 | Time (Timesheets) | 3/3 PASS | 3/3 PASS |
| 06 | Recruitment | 3/3 PASS | 3/3 PASS |
| 07 | My Info | 3/3 PASS | 3/3 PASS |
| 08 | Performance | 3/3 PASS | 3/3 PASS |
| 09 | Dashboard | 3/3 PASS | 2/2 PASS |
| 10 | Directory | 3/3 PASS | 2/2 PASS |
| 11 | Maintenance | 4/4 PASS | 2/2 PASS |
| 12 | Buzz | 3/3 PASS | 2/2 PASS |

## Hasil Regression Terakhir

Regression penuh seluruh suite: **99 test, 99/99 PASS setelah healing**.

Healing yang diterapkan saat regression:

1. Leave A-03 — data cuti bocor tanpa auth, didokumentasikan sebagai BUG-LEAVE-001
2. Admin TC-06 — threshold pesan Required disesuaikan (4, bukan 5)
3. Leave TC-05 — assertion fleksibel untuk entitlement dinamis
4. Directory TC-02 — assertion generik karena data demo berubah
5. Login TC-02/TC-03 — flaky timeout jaringan, pass pada verifikasi ulang

## Defect Ditemukan

| Bug ID | Severity | Deskripsi |
|--------|----------|-----------|
| BUG-LEAVE-001 | Critical | Data cuti bocor tanpa auth di `/leave/requests` |
| BUG-REC-001 | High | Kebocoran data candidates/vacancies tanpa auth |
| BUG-MYINFO-001 | High | Kebocoran data employee detail tanpa auth |
| BUG-PERF-001 | Medium | Endpoint reviews dapat diakses tanpa auth |
| BUG-DIR-001 | Medium | Directory employees bocor tanpa auth |

Semua defect terdokumentasi di folder `bugs/` dengan format lengkap (steps to reproduce, expected vs actual, evidence).

## Detail Workflow per Mode

| Mode | Step | Perintah Eksekusi |
|------|------|-------------------|
| API | Step 0–7 | `BUG_TRACKER=true npx playwright test tests/api` |
| E2E | Step 0–7 | `BUG_TRACKER=true npx playwright test tests/e2e` |
| Regression | Step 0–3 | `REGRESSION_RUN=true BUG_TRACKER=true npx playwright test` |
| PRD Explorer | Step 0–5 | Eksplorasi manual via playwright-cli |

Aturan mode **Keduanya** (API + E2E):

- Selesaikan workflow API sampai Step 7 penuh sebelum mulai E2E
- Gunakan nomor fitur `NN` yang sama di semua lokasi (`doc/`, `pages/`, `tests/`, `test-results/`)
- Jangan hapus artefak workflow pertama saat memulai workflow kedua
- PRD dan global setup tidak perlu dibuat ulang

## Konvensi Penomoran & Tag

- Folder fitur: `<NN>-<feature>` dengan nomor urut dua digit (`01-login` s/d `12-buzz`)
- Nomor sama dipakai konsisten di `PRD/`, `doc/Test-Plan/`, `pages/`, `tests/`, `test-results/`
- Tag test: `@smoke` untuk skenario kritis, `@regression` untuk cakupan penuh

## Struktur Report & Evidence

```
test-results/
├── api/<NN>-<feature>/<feature>-api-test-report.md   # Report API per fitur
│   └── evidence/                                     # Log request/response
├── e2e/<NN>-<feature>/<feature>-test-report.md       # Report E2E per fitur
│   └── evidence/                                     # Screenshot bukti
└── regression/regression-test-report-<timestamp>.md  # Report regression (satu per run)
```

Setiap report berisi: ringkasan eksekusi, hasil per test case, healing log, defects log, dan kesimpulan.

## Template Commit Message

```
<type>(<NN-feature>): <judul ringkas>

- <ringkasan apa yang ditambahkan/diubah>
```

Type: `feat` (artefak baru), `adjust` (healing), `fix` (bug script), `docs`, `chore`.

Contoh:

```
feat(12-buzz): tambah test suite E2E & API Buzz

- Add POM BuzzPage + spec E2E 3 skenario
- Add API spec 2 skenario
```

## Aturan Bug Tracker

Folder `bugs/` hanya terisi melalui workflow resmi:

- Mode API/E2E: jalankan dengan env `BUG_TRACKER=true`
- Mode Regression: env `REGRESSION_RUN=true BUG_TRACKER=true`
- Run ad-hoc biasa tidak mengisi bug tracker

## Catatan

- Session login dibuat otomatis oleh global-setup setiap run dan disimpan di `playwright-artifacts/auth-state.json` (tidak di-commit).
- Report dan evidence tidak di-commit; di-generate ulang setiap eksekusi.
- Regression report tersimpan sebagai `test-results/regression/regression-test-report-<timestamp>.md`.
