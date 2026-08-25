<!-- bug-id: BUG-DIR-001 | dedupe-key: directory-employees-no-auth | status: Open -->
# Bug Report — Directory API

## BUG-DIR-001

| Field | Nilai |
|-------|-------|
| **Bug ID** | BUG-DIR-001 |
| **Severity** | Critical |
| **Title** | Endpoint `/api/v2/directory/employees` mengembalikan data karyawan tanpa session/auth |
| **Environment** | OrangeHRM OS demo (`BASE_URL` dari `.env.development`) |
| **Status** | Open |

### Steps to Reproduce
1. Kirim `GET {BASE_URL}/web/index.php/api/v2/directory/employees?limit=14&offset=0` **tanpa cookie/session**.
2. Perhatikan response body.

### Test Data Used
Request tanpa header cookie (fresh request context).

### Expected vs Actual
- **Expected**: HTTP 401 Unauthorized.
- **Actual**: HTTP 200 dengan seluruh data karyawan (nama, job title, subunit, lokasi) — kebocoran data internal HR.

### Evidence
- Log eksekusi Playwright run 2026-08-25 (test A-02, `tests/api/10-Directory/directory-api.spec.ts`).

### Metadata
- Dedupe key: `directory-employees-no-auth`
- Ditemukan saat: siklus 10-Directory mode API.