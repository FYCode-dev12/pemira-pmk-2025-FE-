# Panduan Menjalankan PEMIRA PMK 2025 di Local Development

## Daftar Isi

1. [Requirements](#requirements)
2. [Setup Backend (Laravel)](#setup-backend-laravel)
3. [Setup Frontend (React)](#setup-frontend-react)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Requirements

### Software yang Dibutuhkan

#### 1. Backend Requirements

- **PHP**: >= 8.2
- **Composer**: >= 2.0
- **MySQL**: >= 8.0 atau MariaDB >= 10.3
- **Web Server**: Apache atau Nginx (atau gunakan built-in PHP server)

#### 2. Frontend Requirements

- **Node.js**: >= 18.0
- **npm**: >= 9.0 (atau yarn/pnpm)

#### 3. Tools Pendukung

- **Git**: untuk clone repository
- **VS Code** atau editor favorit
- **Postman** atau Thunder Client (untuk testing API)
- **MySQL Workbench** atau phpMyAdmin (opsional, untuk manage database)

### Cek Versi Installed

```bash
# Cek PHP version
php --version

# Cek Composer version
composer --version

# Cek MySQL version
mysql --version

# Cek Node.js version
node --version

# Cek npm version
npm --version
```

---

## Setup Backend (Laravel)

### Langkah 1: Clone atau Navigasi ke Project Backend

```bash
# Jika belum clone
git clone <repository-url> pemira-pmk-2025
cd pemira-pmk-2025/pemira-pmk-2025-BE-

# Atau jika sudah ada
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-BE-
```

### Langkah 2: Install Dependencies

```bash
# Install PHP dependencies
composer install
```

### Langkah 3: Setup Environment Variables

```bash
# Copy file .env.example ke .env
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Langkah 4: Konfigurasi Database

#### 4.1 Buat Database MySQL

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE pemira_pmk_itera2025;
EXIT;
```

#### 4.2 Update File .env

Edit file `.env` dan sesuaikan konfigurasi database:

```env
APP_NAME="PEMIRA PMK ITERA 2025"
APP_ENV=local
APP_KEY=base64:xxx... # Sudah ter-generate
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pemira_pmk_itera2025
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Langkah 5: Run Migration dan Seeder

```bash
# Run migrations (buat tabel)
php artisan migrate

# Run seeders (isi data awal)
php artisan db:seed

# Atau gabungan keduanya
php artisan migrate:fresh --seed
```

**Data yang akan di-seed:**

- Admin user: `username: admin`, `password: Admin123!`
- 4582 data pemilih dari Excel
- 2 kandidat (Masta Hendri Setiawan Lature, Erwandi Pantun Pardede)

### Langkah 6: Set Permission untuk Storage

```bash
# Linux/Mac
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Windows (jalankan CMD as Administrator)
# Biasanya tidak perlu, tapi jika ada masalah:
# icacls storage /grant Users:F /T
```

### Langkah 7: Jalankan Backend Server

```bash
# Menggunakan built-in PHP server
php artisan serve

# Server akan berjalan di: http://127.0.0.1:8000
```

**Output yang diharapkan:**

```
INFO  Server running on [http://127.0.0.1:8000].

Press Ctrl+C to stop the server
```

### Langkah 8: Test Backend API

Buka browser atau Postman dan test endpoint:

```bash
# Test 1: Get Kandidat
GET http://127.0.0.1:8000/api/kandidat

# Response yang diharapkan:
{
  "status": "success",
  "data": [
    {
      "kandidat_id": 1,
      "nama": "Masta Hendri Setiawan Lature",
      "nomor_urut": 1,
      "visi": "...",
      "misi": "...",
      "foto_url": null
    },
    {
      "kandidat_id": 2,
      "nama": "Erwandi Pantun Pardede",
      "nomor_urut": 2,
      "visi": "...",
      "misi": "...",
      "foto_url": null
    }
  ]
}
```

```bash
# Test 2: Admin Login
POST http://127.0.0.1:8000/api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}

# Response yang diharapkan:
{
  "status": "success",
  "message": "Login berhasil",
  "token": "1|xxxxxxxxxxxxxxx",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

---

## Setup Frontend (React)

### Langkah 1: Navigasi ke Project Frontend

```bash
# Buka terminal baru (jangan tutup terminal backend yang sedang running)
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-FE-
```

### Langkah 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Atau jika ada masalah, coba:
npm install --legacy-peer-deps
```

### Langkah 3: Setup Environment Variables

```bash
# Buat file .env di root folder frontend
touch .env
```

Edit file `.env` dan tambahkan:

```env
# API Configuration
VITE_API_URL=http://127.0.0.1:8000
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Langkah 4: Verifikasi Konfigurasi API

Pastikan file `src/api/apiClient.js` menggunakan environment variable dengan benar:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
```

File ini sudah benar di project Anda.

### Langkah 5: Jalankan Frontend Development Server

```bash
# Jalankan development server
npm run dev
```

**Output yang diharapkan:**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Langkah 6: Akses Aplikasi

Buka browser dan akses:

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000/api

---

## Menjalankan Aplikasi

### Workflow Development Lengkap

#### Terminal 1: Backend Server

```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-BE-
php artisan serve
```

#### Terminal 2: Frontend Development Server

```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-FE-
npm run dev
```

#### Terminal 3: MySQL (Opsional)

```bash
# Jika ingin monitoring database
mysql -u root -p pemira_pmk_itera2025
```

### Akses Aplikasi

1. **Landing Page**: http://localhost:5173
2. **Login Voter**: http://localhost:5173/login
3. **Login Admin**: http://localhost:5173/admin
4. **Admin Dashboard**: http://localhost:5173/dashboard (setelah login)
5. **Voting Page**: http://localhost:5173/vote (setelah voter login)

### Kredensial Login

#### Admin

- **Username**: `admin`
- **Password**: `Admin123!`

#### Voter (Pemilih)

Ambil dari database:

```sql
-- Query untuk mendapatkan NIM dan token pemilih
SELECT nim, token FROM pemilih LIMIT 10;
```

Contoh:

- **NIM**: (dari database)
- **Token**: (dari database)

---

## Testing

### Test Backend API

#### 1. Test Kandidat Endpoint

```bash
curl http://127.0.0.1:8000/api/kandidat
```

#### 2. Test Admin Login

```bash
curl -X POST http://127.0.0.1:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

#### 3. Test dengan Token

```bash
# Simpan token dari login
TOKEN="1|xxxxxxxxxxxxxxx"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/results/summary
```

### Test Frontend

#### 1. Test Admin Flow

1. Buka http://localhost:5173/admin
2. Login dengan `admin` / `Admin123!`
3. Verifikasi dashboard muncul
4. Cek tab "Perolehan Suara"
5. Cek tab "Partisipasi"
6. Cek tab "Voters"
7. Test search dan filter di tab Voters
8. Test pagination

#### 2. Test Voter Flow

1. Ambil NIM dan token dari database
2. Buka http://localhost:5173/login
3. Login dengan NIM dan token
4. Verifikasi halaman voting muncul
5. Pilih salah satu kandidat
6. Klik "Konfirmasi Pilihan"
7. Verifikasi redirect dan countdown
8. Cek di admin dashboard, total voted bertambah

#### 3. Test Voting Validation

1. Login sebagai voter yang sudah memilih
2. Verifikasi tidak bisa voting lagi
3. Login dengan NIM/token salah
4. Verifikasi muncul error message

---

## Troubleshooting

### Backend Issues

#### Issue 1: `php: command not found`

**Solusi:**

```bash
# Install PHP 8.2+
# Ubuntu/Debian:
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl

# Mac (Homebrew):
brew install php@8.2

# Windows:
# Download dari https://windows.php.net/download/
```

#### Issue 2: `composer: command not found`

**Solusi:**

```bash
# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### Issue 3: `SQLSTATE[HY000] [1045] Access denied`

**Penyebab:** Password MySQL salah atau user tidak ada

**Solusi:**

```bash
# Cek MySQL user
mysql -u root -p

# Reset password jika perlu
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# Update .env dengan password baru
DB_PASSWORD=new_password
```

#### Issue 4: `SQLSTATE[42S02]: Base table or view not found`

**Penyebab:** Migration belum dijalankan

**Solusi:**

```bash
php artisan migrate:fresh --seed
```

#### Issue 5: `419 Page Expired` atau CSRF Token Mismatch

**Penyebab:** CSRF middleware masih aktif untuk API

**Solusi:**

```bash
# Pastikan di bootstrap/app.php middleware stateful sudah di-comment
# Atau jalankan:
php artisan config:clear
php artisan cache:clear
```

#### Issue 6: Permission Denied di Storage

**Solusi:**

```bash
# Linux/Mac
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:$USER storage bootstrap/cache

# Windows
# Run CMD as Administrator
# Restart terminal
```

### Frontend Issues

#### Issue 1: `node: command not found`

**Solusi:**

```bash
# Install Node.js 18+
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Mac (Homebrew):
brew install node

# Windows:
# Download dari https://nodejs.org/
```

#### Issue 2: `npm ERR! code ELIFECYCLE`

**Solusi:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

#### Issue 3: Vite Error `Failed to resolve import`

**Solusi:**

```bash
# Restart development server
# Ctrl+C untuk stop
npm run dev
```

#### Issue 4: CORS Error di Browser Console

**Penyebab:** Backend tidak mengizinkan origin frontend

**Solusi:**

Edit backend `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

Kemudian:

```bash
php artisan config:clear
php artisan config:cache
```

#### Issue 5: White Screen atau Blank Page

**Penyebab:** Build error atau import path salah

**Solusi:**

```bash
# Cek console browser (F12)
# Biasanya ada error message

# Restart dev server
npm run dev
```

#### Issue 6: `net::ERR_CONNECTION_REFUSED` saat fetch API

**Penyebab:** Backend server tidak jalan

**Solusi:**

```bash
# Pastikan backend server running
cd ../pemira-pmk-2025-BE-
php artisan serve
```

---

## Development Tips

### 1. Hot Reload

Frontend (Vite) sudah support hot reload by default. Setiap perubahan di file `.jsx`, `.css` akan langsung ter-reload.

Untuk Backend, install Laravel Telescope (opsional):

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### 2. Debugging

#### Backend:

```php
// Tambahkan dd() untuk debug
dd($variable);

// Atau log
\Log::info('Debug message', ['data' => $variable]);

// Cek log di storage/logs/laravel.log
tail -f storage/logs/laravel.log
```

#### Frontend:

```javascript
// Console log
console.log("Debug:", variable);

// React DevTools (install extension di browser)
// Inspect component state dan props
```

### 3. Database Management

```bash
# Tinker - REPL untuk Laravel
php artisan tinker

# Contoh query di tinker:
>>> \App\Models\Pemilih::count()
>>> \App\Models\Admin::first()
>>> \App\Models\Kandidat::all()
```

### 4. Clear Cache (jika ada perubahan config)

```bash
# Backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Atau clear semua
php artisan optimize:clear

# Frontend (biasanya tidak perlu)
rm -rf node_modules/.vite
```

### 5. Code Formatting

```bash
# Backend (Laravel Pint - jika installed)
./vendor/bin/pint

# Frontend (Prettier - jika configured)
npm run format
```

---

## Struktur Project

### Backend (Laravel)

```
pemira-pmk-2025-BE/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── KandidatController.php
│   │   │   ├── VoteController.php
│   │   │   └── ResultsController.php
│   │   └── Middleware/
│   └── Models/
│       ├── Admin.php
│       ├── Pemilih.php
│       ├── Kandidat.php
│       └── Suara.php
├── bootstrap/
├── config/
│   ├── cors.php
│   └── sanctum.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── storage/
│   └── logs/
├── .env
└── composer.json
```

### Frontend (React)

```
pemira-pmk-2025-FE/
├── public/
├── src/
│   ├── api/
│   │   ├── apiClient.js
│   │   └── services.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── AdminSidebar.jsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Index.jsx
│   │   ├── VoterLogin.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── VotingPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

---

## Git Workflow (Opsional)

Jika menggunakan version control:

```bash
# Clone repository
git clone <repository-url>

# Buat branch baru untuk feature
git checkout -b feature/nama-feature

# Add dan commit changes
git add .
git commit -m "feat: tambah fitur xxx"

# Push ke remote
git push origin feature/nama-feature

# Merge ke main (via pull request atau langsung)
git checkout main
git merge feature/nama-feature
```

---

## Checklist Setup Local

### Backend

- [ ] PHP 8.2+ installed
- [ ] Composer installed
- [ ] MySQL installed dan running
- [ ] Database `pemira_pmk_itera2025` sudah dibuat
- [ ] `composer install` berhasil
- [ ] `.env` file sudah dikonfigurasi
- [ ] `php artisan key:generate` sudah dijalankan
- [ ] `php artisan migrate --seed` berhasil
- [ ] `php artisan serve` berjalan di http://127.0.0.1:8000
- [ ] Test API `/api/kandidat` return data

### Frontend

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] `npm install` berhasil
- [ ] `.env` file sudah dibuat dengan VITE_API_URL
- [ ] `npm run dev` berjalan di http://localhost:5173
- [ ] Browser bisa akses http://localhost:5173
- [ ] Tidak ada CORS error di console

### Testing

- [ ] Admin login berhasil (admin/Admin123!)
- [ ] Admin dashboard menampilkan data
- [ ] Voter bisa login dengan NIM dan token
- [ ] Voter bisa memilih kandidat
- [ ] Setelah voting, data di admin dashboard update
- [ ] Pagination di voters tab berfungsi
- [ ] Search di voters tab berfungsi

---

## Penutup

Setelah mengikuti panduan ini, aplikasi PEMIRA PMK 2025 seharusnya sudah berjalan dengan lancar di environment local development Anda.

**Waktu Setup Estimasi:**

- Backend Setup: 15-20 menit
- Frontend Setup: 10-15 menit
- Testing: 10-15 menit
- **Total: 35-50 menit**

Jika mengalami masalah, cek section [Troubleshooting](#troubleshooting) atau review error message di terminal/console browser.

Happy coding! 🚀
