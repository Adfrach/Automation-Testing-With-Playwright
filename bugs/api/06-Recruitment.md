<!-- bug-id: BUG-REC-001 | dedupe-key: recruitment-candidates-no-auth | status: Open -->
# Bug Report — Recruitment API

## BUG-REC-001

| Field | Nilai |
|-------|-------|
| **Bug ID** | BUG-REC-001 |
| **Severity** | Critical |
| **Title** | Endpoint `/api/v2/recruitment/candidates` mengembalikan seluruh data kandidat tanpa session/auth |
| **Environment** | OrangeHRM OS demo (`BASE_URL` dari `.env.development`) |
| **Status** | Open |

### Steps to Reproduce
1. Kirim `GET {BASE_URL}/web/index.php/api/v2/recruitment/candidates?limit=50&offset=0` **tanpa cookie/session**.
2. Perhatikan response body.

### Test Data Used
Request tanpa header cookie sama sekali (fresh request context).

### Expected vs Actual
- **Expected**: HTTP 401 Unauthorized atau 200 dengan `data: []`.
- **Actual**: HTTP 200 dengan daftar lengkap ±50 kandidat (nama, email) — kebocoran data PII.

### Evidence
- Log eksekusi Playwright run 2026-08-25 (test A-03, `tests/api/06-Recruitment/recruitment-api.spec.ts`).
- Response berisi entri seperti `John Doe`, `Gautham R`, dll.

### Metadata
- Dedupe key: `recruitment-candidates-no-auth`
- Ditemukan saat: siklus 06-Recruitment mode API.