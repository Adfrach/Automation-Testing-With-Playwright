# PRD - Login Feature (Authentication) - OrangeHRM

**Story Title**: Login ke Aplikasi OrangeHRM (Open Source Demo)
**Application URL**: `BASE_URL` dari `.env` (https://opensource-demo.orangehrmlive.com/web/index.php/auth/login)
**Feature Number**: 01
**Feature Name**: Login / Authentication

---

## Ringkasan PRD

Fitur **Login** adalah gerbang utama masuk ke aplikasi OrangeHRM. Pengguna harus memasukkan **Username** dan **Password** lalu menekan tombol **Login**. Setelah kredensial valid, sistem mengautentikasi user dan menampilkan halaman **Dashboard** (`/web/index.php/dashboard/index`). Kredensial demo yang tersedia adalah `Admin` / `admin123` (tampil langsung pada halaman login, sesuai demo Orange).

---

## Acceptance Criteria

### 1. Halaman Login
| No | Kriteria |
|----|----------|
| 1.1 | Halaman menampilkan input **Username** yang wajib diisi |
| 1.2 | Halaman menampilkan input **Password** yang wajib diisi |
| 1.3 | Halaman menampilkan tombol **Login** |
| 1.4 | Tersedia link **Forgot your password?** untuk pemulihan kredensial |
| 1.5 | Tampilkan hint kredensial demo (Username: Admin, Password: admin123) |

### 2. Error / Handling
| No | Kriteria |
|----|----------|
| 2.1 | Jika Username kosong → muncul teks "Required" di bawah field Username |
| 2.2 | Jika Password kosong → muncul teks "Required" di bawah field Password |
| 2.3 | Jika kredensial salah → muncul alert "Invalid credentials" di atas form |

### 3. Positive (Happy Flow)
| No | Skenario |
|----|----------|
| 3.1 | Isi Username `Admin`, Password `admin123`, klik Login → berhasil masuk ke Dashboard |

### 4. Negative
| No | Skenario |
|----|----------|
| 4.1 | Username benar, Password salah → muncul "Invalid credentials" |
| 4.2 | Username salah, Password benar → muncul "Invalid credentials" |
| 4.3 | Kedua field kosong → error validasi |

---

## Key Features yang Akan Dites

1. Form login dengan input Username & Password
2. Validasi required field
3. Autentikasi kredensial & redirect ke Dashboard
4. Handling kredensial salah

---

## Definition of Done

- Login dengan kredensial valid mengarah ke Dashboard dalam waktu singkat.
- Kredensial tidak valid menghasilkan pesan error tanpa redirect.
- Tidak ada data kredensial yang terekpos pada laporan (gunakan referensi variabel env).

---

## Manajemen Kredensial & URL

| Variabel | Deskripsi |
|----------|-----------|
| `BASE_URL` | URL halaman login aplikasi |
| `TEST_USERNAME` | Username default (dari env) |
| `TEST_PASSWORD` | Password default (dari env) |

---

## Testing Scope

| Kategori | Cakupan |
|----------|---------|
| **Happy Flow** | Login valid → Dashboard |
| **Negative Flow** | Username/Password salah, field kosong |
| **Validation Flow** | Required field username/dinamakan |
| **UI Elements** | Input, button, link forgot password |
| **Navigation** | Redirect login → dashboard |

---

## API Documentation

- **POST** `{BASE_URL}/web/index.php/auth/validate` — Content-Type `application/x-www-form-urlencoded`; body: `username`, `password`; Response: redirect ke `/web/index.php/dashboard/index` (sukses) atau kembali ke `/web/index.php/auth/login` (gagal) dengan pesan "Invalid credentials".
- **GET** `{BASE_URL}/web/index.php/core/i18n/messages` — memuat pesan internasionalisasi (i18n) termasuk teks validasi UI, response HTTP `200`/`304`.
