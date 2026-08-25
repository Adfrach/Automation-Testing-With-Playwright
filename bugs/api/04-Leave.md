<!-- bug-id: BUG-LEAVE-001 | dedupe-key: leave-requests-no-auth | status: Open -->
# Bug Report — Leave API

## BUG-LEAVE-001

| Field | Nilai |
|-------|-------|
| **Bug ID** | BUG-LEAVE-001 |
| **Severity** | Critical |
| **Title** | Endpoint `/api/v2/leave/requests` mengembalikan data cuti tanpa session/auth |
| **Environment** | OrangeHRM OS demo (`BASE_URL` dari `.env.development`) |
| **Status** | Open |

### Steps to Reproduce
1. Kirim `GET {BASE_URL}/web/index.php/api/v2/leave/requests?limit=50&offset=0&fromDate=2026-01-01&toDate=2026-12-31` **tanpa cookie/session**.
2. Perhatikan response body.

### Test Data Used
Request tanpa header cookie (fresh request context).

### Expected vs Actual
- **Expected**: HTTP 401 Unauthorized.
- **Actual**: HTTP 200 dengan seluruh data leave request karyawan (nama karyawan, tanggal, saldo cuti, komentar) — kebocoran data HR sensitif.

### Evidence
- Log eksekusi regression run 2026-08-25 (test A-03, `tests/api/04-Leave/leave-api.spec.ts`).

### Metadata
- Dedupe key: `leave-requests-no-auth`
- Ditemukan saat: regression run menyeluruh.