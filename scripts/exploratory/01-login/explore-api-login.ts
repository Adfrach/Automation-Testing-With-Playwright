/**
 * Exploratory API Script - 01 Login (OrangeHRM)
 * Alur lengkap: GET login → ambil cookie session + CSRF token → POST /auth/validate.
 * Menyimpan log request/response ke test-results/api/01-login/evidence/.
 */
import { request } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';
const EV_DIR = path.resolve(__dirname, '../../../test-results/api/01-login/evidence');

function log(file: string, content: string) {
  fs.mkdirSync(EV_DIR, { recursive: true });
  fs.writeFileSync(path.join(EV_DIR, file), content, 'utf8');
}

/** Ekstrak token CSRF dari atribut :token pada auth-login */
function extractToken(html: string): string {
  const m = html.match(/:token=""([^&]+)"/);
  return m ? m[1] : '';
}

async function explore() {
  const ctx = await request.newContext();

  // 1. GET halaman login → set cookie session & dapatkan CSRF token
  const loginPage = await ctx.get(`${BASE_URL}/web/index.php/auth/login`);
  const html = await loginPage.text();
  const token = extractToken(html);
  log('login-token.txt', `Status: ${loginPage.status()}\nCSRF Token: ${token ? 'FOUND' : 'NOT FOUND'}\nToken value: ${token}`);

  // 2. TC-01: Login valid (dengan token + cookie)
  let res = await ctx.post(`${BASE_URL}/web/index.php/auth/validate`, {
    data: { username: 'Admin', password: 'admin123', _token: token },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  log('tc01-valid.txt', `Status: ${res.status()}\nURL: ${res.url()}\nLocation: ${res.headers()['location'] || '-'}`);

  // 3. TC-02: Password salah
  const ctx2 = await request.newContext();
  await ctx2.get(`${BASE_URL}/web/index.php/auth/login`);
  const token2 = extractToken(await (await ctx2.get(`${BASE_URL}/web/index.php/auth/login`)).text());
  res = await ctx2.post(`${BASE_URL}/web/index.php/auth/validate`, {
    data: { username: 'Admin', password: 'wrongpassword', _token: token2 },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const bodyInvalid = await res.text();
  log('tc02-invalid-password.txt', `Status: ${res.status()}\nURL: ${res.url()}\nInvalid credentials: ${bodyInvalid.includes('Invalid credentials')}`);
  log('tc02-body-sample.txt', bodyInvalid.slice(0, 1500));

  // 4. TC-06: keduanya kosong
  res = await ctx.post(`${BASE_URL}/web/index.php/auth/validate`, {
    data: { username: '', password: '', _token: token },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  log('tc06-empty-both.txt', `Status: ${res.status()}\nURL: ${res.url()}\nLocation: ${res.headers()['location'] || '-'}`);

  await ctx.dispose();
  await ctx2.dispose();
  console.log('[explore-api] selesai, log tersimpan di', EV_DIR);
}

explore().catch((e) => {
  console.error('[explore-api] error:', e);
  process.exit(1);
});