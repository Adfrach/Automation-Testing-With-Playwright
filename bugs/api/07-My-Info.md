<!-- bug-id: BUG-MYINFO-001 | dedupe-key: pim-employee-detail-no-auth | status: Open -->
# Bug Report — My Info API

## BUG-MYINFO-001

| Field | Nilai |
|-------|-------|
| **Bug ID** | BUG-MYINFO-001 |
| **Severity** | Critical |
| **Title** | Endpoint `/api/v2/pim/employees/{empNumber}` mengembalikan data karyawan tanpa session/auth |
| **Environment** | OrangeHRM OS demo (`BASE_URL` dari `.env.development`) |
| **Status** | Open |

### Steps to Reproduce
1. Kirim `GET {BASE_URL}/web/index.php/api/v2/pim/employees/7` **tanpa cookie/session**.
2. Perhatikan response body.

### Test Data Used
Request tanpa header cookie (fresh request context), empNumber 7 (admin demo).

### Expected vs Actual
- **Expected**: HTTP 401 Unauthorized.
- **Actual**: HTTP 200 dengan data lengkap karyawan (`empNumber`, `employeeId`, nama) — kebocoran PII.

### Evidence
- Log eksekusi Playwright run 2026-08-25 (test A-03, `tests/api/07-My-Info/my-info-api.spec.ts`).

### Metadata
- Dedupe key: `pim-employee-detail-no-auth`
- Ditemukan saat: siklus 07-My-Info mode API.