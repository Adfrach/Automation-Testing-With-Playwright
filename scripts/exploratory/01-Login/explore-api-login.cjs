/**
 * Exploratory API Script - 01 Login (OrangeHRM) - CommonJS + node
 * Alur lengkap: GET login, ambil cookie + CSRF token, then POST /auth/validate.
 * Menyimpan log ke test-results/api/01-login/evidence/.
 */
const { request } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
const EV_DIR = path.resolve(__dirname, '../../../test-results/api/01-login/evidence');

function log(file, content) {
  fs.mkdirSync(EV_DIR, { recursive: true });
  fs.writeFileSync(path.join(EV_DIR, file), content, 'utf8');
}

// Ambil nilai token dari atribut :token pada tag auth-login.
// Nilai mentah berisi entity kutip HTML yang membungkus token. Strategi paling kokoh:
// potong berdasarkan karakter non-token, lalu ambil segmen terpanjang (token sebenarnya).
function extractToken(html) {
  const m = html.match(/:token="([^"]+)/);
  if (!m) return '';
  const segments = m[1].split(/[^A-Za-z0-9._-]+/).filter(Boolean);
  return segments.reduce((a, b) => (b.length > a.length ? b : a), '');
}

async function explore() {
  const ctx = await request.newContext();

  try {
    // 1. GET login → cookie session + CSRF token
    const loginPage = await ctx.get(`${BASE_URL}/web/index.php/auth/login`);
    const html = await loginPage.text();
    const token = extractToken(html);
    log('login-token.txt', `Status: ${loginPage.status()}\nCSRF Token: ${token ? 'FOUND' : 'NOT FOUND'}\nValue: ${token}`);

    // TC-01 valid
    let res = await ctx.post(`${BASE_URL}/web/index.php/auth/validate`, {
      data: { username: 'Admin', password: 'admin123', _token: token },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    log('tc01-valid.txt', `Status: ${res.status()}\nURL: ${res.url()}\nLocation: ${res.headers()['location'] || '~'}`);

    // TC-06 keduanya kosong
    res = await ctx.post(`${BASE_URL}/web/index.php/auth/validate`, {
      data: { username: '', password: '', _token: token },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    log('tc06-empty-both.txt', `Status: ${res.status()}\nURL: ${res.url()}\nLocation: ${res.headers()['location'] || '~'}`);

    // TC-02 password salah (context baru)
    const ctx2 = await request.newContext();
    await ctx2.get(`${BASE_URL}/web/index.php/auth/login`);
    const html2 = await (await ctx2.get(`${BASE_URL}/web/index.php/auth/login`)).text();
    const token2 = extractToken(html2);
    res = await ctx2.post(`${BASE_URL}/web/index.php/auth/validate`, {
      data: { username: 'Admin', password: 'wrongpassword', _token: token2 },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const bodyInvalid = await res.text();
    log('tc02-invalid-password.txt', `Status: ${res.status()}\nURL: ${res.url()}\nInvalid credentials: ${bodyInvalid.includes('Invalid credentials')}`);
    log('tc02-body-sample.txt', bodyInvalid.slice(0, 1500));
    await ctx2.dispose();
  } finally {
    await ctx.dispose();
  }
  console.log('[explore-api] selesai, log tersimpan di', EV_DIR);
}

explore().catch((e) => { console.error('[explore-api] error:', e); process.exit(1); });