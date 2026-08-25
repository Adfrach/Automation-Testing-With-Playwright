# BUG-LV-001: Tombol Reset tidak mengosongkan field From/To Date

- **Bug ID:** BUG-LV-001
- **Severity:** Medium
- **Title:** Tombol Reset pada halaman Leave List tidak mereset field From Date & To Date
- **Description:** Ketika user mengisi field From Date `2026-01-01` lalu mengklik tombol Reset, nilai field tetap `2026-01-01` dan tidak kembali kosong (expected: `""`).
- **Steps to Reproduce:**
  1. Login ke OrangeHRM sebagai `Admin` / `admin123`.
  2. Navigasi ke menu **Leave → Leave List**.
  3. Pilih status "Pending Approval" pada dropdown.
  4. Isi field **From Date** dengan `2026-01-01`.
  5. Klik tombol **Reset**.
  6. Periksa nilai field From Date.
- **Test Data Used:**
  - Username: `Admin`
  - Password: `admin123`
  - From Date: `2026-01-01`
  - Status: `Pending Approval`
- **Expected vs Actual:**
  - *Expected:* From Date & To Date kembali kosong (`""`).
  - *Actual:* From Date tetap `2026-01-01` (`Received: "2026-01-01"`).
- **Screenshots/Evidence:** `test-results/e2e-04-Leave-leave-Leave---08eb6--04-Reset-filter-regression-firefox/error-context.md`
- **Environment:** Development Chrome/Firefox/Safari desktop, OrangeHRM OS 5.9
- **Status:** Open (Actual Application Bug — tidak bisa di-auto-heal)