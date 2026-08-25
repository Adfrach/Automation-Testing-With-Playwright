<!-- bug-id: BUG-PERF-001 | dedupe-key: performance-reviews-no-auth | status: Open -->
# Bug Report — Performance API

## BUG-PERF-001

| Field | Nilai |
|-------|-------|
| **Bug ID** | BUG-PERF-001 |
| **Severity** | Critical |
| **Title** | Endpoint `/api/v2/performance/reviews` mengembalikan data review tanpa session/auth |
| **Environment** | OrangeHRM OS demo (`BASE_URL` dari `.env.development`) |
| **Status** | Open |

### Steps to Reproduce
1. Kirim `GET {BASE_URL}/web/index.php/api/v2/performance/reviews` **tanpa cookie/session**.
2. Perhatikan response body.

### Test Data Used
Request tanpa header cookie (fresh request context).

### Expected vs Actual
- **Expected**: HTTP 401 Unauthorized.
- **Actual**: HTTP 200 dengan data review (id, job title, subunit, status, periode) — kebocoran data internal HR.

### Evidence
- Log eksekusi Playwright run 2026-08-25 (test A-03, `tests/api/08-Performance/performance-api.spec.ts`).

### Metadata
- Dedupe key: `performance-reviews-no-auth`
- Ditemukan saat: siklus 08-Performance mode API.