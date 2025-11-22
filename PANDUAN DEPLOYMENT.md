# Panduan Deployment PEMIRA PMK 2025 ke Jagoan Hosting

## Daftar Isi

1. [Persiapan](#persiapan)
2. [Deployment Backend (Laravel)](#deployment-backend-laravel)
3. [Deployment Frontend (React)](#deployment-frontend-react)
4. [Konfigurasi Database](#konfigurasi-database)
5. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Persiapan

### A. Requirements

- Akun Jagoan Hosting (Shared Hosting)
- Domain/subdomain sudah terdaftar
- Akses cPanel
- FileZilla atau FTP client
- Git (untuk backup)
- Node.js terinstall di komputer lokal (untuk build frontend)

### B. Informasi yang Perlu Disiapkan

```
Domain Backend: api.yourdomain.com
Domain Frontend: yourdomain.com
Database Name: [dari cPanel]
Database User: [dari cPanel]
Database Password: [dari cPanel]
Database Host: localhost
```

---

## Deployment Backend (Laravel)

### Langkah 1: Persiapan File Backend

#### 1.1 Optimasi Laravel untuk Production

**Di komputer lokal, masuk ke folder backend:**

```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-BE-
```

#### 1.2 Update File `.env` untuk Production

Buat file `.env.production` dengan isi:

```env
APP_NAME="PEMIRA PMK ITERA 2025"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

FRONTEND_URL=https://yourdomain.com
```

#### 1.3 Optimasi dan Bersihkan Cache

```bash
# Clear semua cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimasi untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install dependencies production only
composer install --optimize-autoloader --no-dev
```

#### 1.4 Buat File .htaccess untuk Laravel di Shared Hosting

Buat file `.htaccess` di folder `public` backend dengan isi:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Langkah 2: Upload Backend ke Hosting

#### 2.1 Struktur Folder di Hosting

Di cPanel, buat struktur folder:

```
/home/username/
├── public_html/          # Frontend akan di sini
└── laravel_app/          # Backend di luar public_html
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/           # Ini yang akan di-link ke subdomain
    ├── resources/
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── .env
    ├── artisan
    └── composer.json
```

#### 2.2 Compress File Backend

**Di komputer lokal:**

```bash
# Exclude node_modules, vendor, dan file tidak perlu
zip -r backend.zip . -x "node_modules/*" "vendor/*" ".git/*" "storage/logs/*" "storage/framework/cache/*" "storage/framework/sessions/*" "storage/framework/views/*"
```

#### 2.3 Upload via cPanel File Manager

1. Login ke cPanel Jagoan Hosting
2. Buka **File Manager**
3. Navigasi ke `/home/username/`
4. Buat folder baru: `laravel_app`
5. Upload `backend.zip` ke folder `laravel_app`
6. Extract `backend.zip`
7. Hapus `backend.zip` setelah extract

#### 2.4 Upload Vendor via Composer (di cPanel Terminal)

1. Buka **Terminal** di cPanel
2. Jalankan:

```bash
cd laravel_app
composer install --optimize-autoloader --no-dev
```

**CATATAN:** Jika composer tidak tersedia di shared hosting, upload folder `vendor` dari lokal:

```bash
# Di lokal, compress vendor
zip -r vendor.zip vendor/

# Upload vendor.zip ke laravel_app di hosting
# Extract via cPanel File Manager
```

#### 2.5 Set Permission Storage dan Bootstrap

Di Terminal cPanel:

```bash
cd laravel_app
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Langkah 3: Setup Subdomain untuk Backend API

#### 3.1 Buat Subdomain di cPanel

1. Di cPanel, buka **Subdomains**
2. Tambah subdomain baru:
   - **Subdomain:** `api`
   - **Domain:** `yourdomain.com`
   - **Document Root:** `/home/username/laravel_app/public`
3. Klik **Create**

#### 3.2 Update .env di Hosting

1. Buka File Manager
2. Edit `/home/username/laravel_app/.env`
3. Update sesuai `.env.production` yang sudah disiapkan
4. **PENTING:** Generate APP_KEY baru:

Di Terminal cPanel:

```bash
cd laravel_app
php artisan key:generate
```

### Langkah 4: Setup Database

#### 4.1 Buat Database di cPanel

1. Buka **MySQL Databases** di cPanel
2. Buat database baru: `username_pemira_pmk`
3. Buat user baru: `username_pemira`
4. Set password yang kuat
5. Add user ke database dengan **ALL PRIVILEGES**
6. Catat: DB_DATABASE, DB_USERNAME, DB_PASSWORD

#### 4.2 Import Database

**Opsi 1: Via phpMyAdmin**

1. Buka **phpMyAdmin** di cPanel
2. Pilih database yang baru dibuat
3. Klik tab **Import**
4. Upload file SQL backup database lokal
5. Klik **Go**

**Opsi 2: Export dari Lokal dan Import**

Di komputer lokal:

```bash
# Export database
php artisan db:seed --class=DatabaseSeeder
mysqldump -u root -p pemira_pmk_itera2025 > database_backup.sql

# Upload database_backup.sql ke hosting via File Manager
# Import via phpMyAdmin
```

#### 4.3 Update .env dengan Kredensial Database

Edit `/home/username/laravel_app/.env`:

```env
DB_DATABASE=username_pemira_pmk
DB_USERNAME=username_pemira
DB_PASSWORD=your_strong_password
```

#### 4.4 Run Migration di Hosting

Di Terminal cPanel:

```bash
cd laravel_app
php artisan migrate --force
php artisan db:seed --force
```

### Langkah 5: Konfigurasi CORS dan Security

#### 5.1 Update config/cors.php

Pastikan file sudah benar (sudah ada di backend Anda):

```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
],
```

#### 5.2 Clear dan Cache Config di Hosting

```bash
cd laravel_app
php artisan config:clear
php artisan config:cache
php artisan route:cache
```

---

## Deployment Frontend (React)

### Langkah 1: Build Frontend untuk Production

#### 1.1 Update Environment Variables

**Di komputer lokal, edit `.env` di folder frontend:**

```env
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

#### 1.2 Update apiClient.js

Edit `/home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-FE-/src/api/apiClient.js`:

Pastikan menggunakan environment variable:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
```

#### 1.3 Build Frontend

```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-FE-
npm install
npm run build
```

Akan menghasilkan folder `dist/` yang berisi file production-ready.

### Langkah 2: Upload Frontend ke Hosting

#### 2.1 Compress Folder dist

```bash
cd dist
zip -r frontend-dist.zip *
```

#### 2.2 Upload ke public_html

1. Login ke cPanel File Manager
2. Navigasi ke `/home/username/public_html/`
3. **HAPUS** semua file default (index.html, cgi-bin, dll) - **BACKUP dulu jika perlu**
4. Upload `frontend-dist.zip`
5. Extract `frontend-dist.zip` di `public_html`
6. Pindahkan semua file dari folder `dist` ke root `public_html`
7. Hapus folder dan zip file yang tidak perlu

Struktur akhir `public_html`:

```
/home/username/public_html/
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── ...
├── index.html
├── vite.svg
└── .htaccess (akan dibuat di langkah berikutnya)
```

### Langkah 3: Konfigurasi .htaccess untuk React Router

#### 3.1 Buat .htaccess di public_html

Buat file `.htaccess` di `/home/username/public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Handle HTTPS redirect
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle React Router - redirect all requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## Konfigurasi Database

### Langkah 1: Verifikasi Data di Database

1. Buka **phpMyAdmin**
2. Pilih database Anda
3. Verifikasi tabel:
   - `admin` - pastikan ada user admin
   - `pemilih` - pastikan data pemilih ter-import
   - `kandidat` - pastikan 2 kandidat ada
   - `suara` - kosong di awal

### Langkah 2: Set Admin Password (jika perlu)

Di Terminal cPanel:

```bash
cd laravel_app
php artisan tinker
```

Kemudian:

```php
$admin = App\Models\Admin::first();
$admin->password = bcrypt('Admin123!');
$admin->save();
exit
```

---

## Testing & Troubleshooting

### Langkah 1: Test Backend API

#### Test dari Browser atau Postman:

1. **Test API Alive:**

   ```
   GET https://api.yourdomain.com/api/kandidat
   ```

   Response: `{"status":"success","data":[...]}`

2. **Test Admin Login:**

   ```
   POST https://api.yourdomain.com/api/auth/admin/login
   Content-Type: application/json

   {
     "username": "admin",
     "password": "Admin123!"
   }
   ```

3. **Test Voter Login:**

   ```
   POST https://api.yourdomain.com/api/auth/pemilih/login
   Content-Type: application/json

   {
     "nim": "121450000",
     "token": "TOKEN_FROM_DATABASE"
   }
   ```

### Langkah 2: Test Frontend

1. Buka: `https://yourdomain.com`
2. Verifikasi halaman loading dengan benar
3. Test navigasi ke `/admin` dan `/login`
4. Test login admin
5. Test voting flow

### Common Issues dan Solusi

#### Issue 1: 500 Internal Server Error

**Penyebab:**

- Permission storage/bootstrap salah
- APP_KEY tidak di-set
- File .env tidak ada

**Solusi:**

```bash
cd laravel_app
chmod -R 775 storage bootstrap/cache
php artisan key:generate
php artisan config:cache
```

#### Issue 2: CORS Error di Frontend

**Penyebab:**

- CORS tidak dikonfigurasi dengan benar di backend
- Frontend URL tidak di-whitelist

**Solusi:**

Edit `.env` backend:

```env
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

Kemudian:

```bash
php artisan config:cache
```

#### Issue 3: 404 Not Found di React Routes

**Penyebab:**

- .htaccess tidak ada atau salah di frontend

**Solusi:**

- Pastikan .htaccess ada di public_html dengan konfigurasi React Router di atas

#### Issue 4: Database Connection Failed

**Penyebab:**

- Kredensial database salah
- Host database bukan 'localhost'

**Solusi:**

```bash
# Check di terminal
cd laravel_app
php artisan config:clear
php artisan migrate:status
```

Jika error, cek:

1. Database name, user, password di .env
2. User memiliki privileges
3. Host adalah 'localhost' atau sesuai dari cPanel

#### Issue 5: White Screen di Frontend

**Penyebab:**

- API URL tidak ter-update
- Build dengan base path salah

**Solusi:**

1. Rebuild dengan .env yang benar
2. Pastikan `vite.config.js` tidak ada `base: '/subfolder'`
3. Re-upload dist folder

#### Issue 6: Token/Session Expired Terus

**Penyebab:**

- CORS session domain salah
- Sanctum stateful domain tidak cocok

**Solusi:**

Edit `.env` backend:

```env
SESSION_DOMAIN=.yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

Clear cache:

```bash
php artisan config:cache
```

---

## Checklist Final Deployment

### Backend (Laravel)

- [ ] .env production sudah benar (DB, APP_URL, FRONTEND_URL)
- [ ] APP_KEY sudah di-generate
- [ ] composer install --no-dev sudah dijalankan
- [ ] Permission storage (775) sudah di-set
- [ ] Database sudah di-migrate dan seed
- [ ] Config cache sudah dibuat (php artisan config:cache)
- [ ] Route cache sudah dibuat (php artisan route:cache)
- [ ] CORS origin sudah benar
- [ ] Subdomain api.yourdomain.com sudah pointing ke laravel_app/public
- [ ] Test API endpoint berfungsi

### Frontend (React)

- [ ] .env VITE_API_URL sudah ke production backend
- [ ] npm run build sudah dijalankan
- [ ] Folder dist sudah di-upload ke public_html
- [ ] .htaccess React Router sudah ada di public_html
- [ ] yourdomain.com bisa diakses
- [ ] Tidak ada CORS error di console browser
- [ ] Login admin berfungsi
- [ ] Login voter berfungsi
- [ ] Voting flow lengkap berfungsi
- [ ] Admin dashboard menampilkan data dengan benar

### Database

- [ ] Database sudah dibuat di cPanel
- [ ] User database sudah di-assign dengan ALL PRIVILEGES
- [ ] Data pemilih sudah ter-import
- [ ] Data kandidat sudah ada (2 kandidat)
- [ ] Admin user sudah ada dengan password yang benar

### Security

- [ ] APP_DEBUG=false di .env backend
- [ ] Password database kuat
- [ ] Password admin sudah diganti dari default
- [ ] HTTPS redirect sudah aktif (di .htaccess frontend)
- [ ] X-Frame-Options header sudah di-set

---

## Maintenance

### Update Code Setelah Deployment

**Untuk Backend:**

```bash
# Di lokal, commit changes
git pull origin main
composer install --no-dev
php artisan config:cache

# Upload file yang berubah via FTP/File Manager
# Atau zip dan upload ulang

# Di hosting terminal
cd laravel_app
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Untuk Frontend:**

```bash
# Di lokal
git pull origin main
npm install
npm run build

# Upload folder dist ke public_html (replace existing files)
```

### Monitoring Logs

**Backend Logs:**

- Location: `/home/username/laravel_app/storage/logs/laravel.log`
- Access via cPanel File Manager atau download via FTP

**Cara melihat:**

```bash
# Via terminal cPanel
tail -f laravel_app/storage/logs/laravel.log
```

---

## Backup Strategy

### Daily Backup

1. **Database Backup** (via cPanel):

   - cPanel → Backup Wizard
   - Download Full Backup mingguan
   - Download Database Backup harian

2. **Files Backup:**
   - Backup folder laravel_app
   - Backup folder public_html

### Manual Backup Database

```bash
# Via terminal cPanel
mysqldump -u username_pemira -p username_pemira_pmk > backup_$(date +%Y%m%d).sql
```

---

## Support Kontak

Jika ada masalah:

1. Cek error log Laravel: `storage/logs/laravel.log`
2. Cek error log Apache: Tanyakan ke support Jagoan Hosting
3. Buka ticket di Jagoan Hosting jika issue terkait server/hosting
4. Console browser (F12) untuk debug frontend

---

## Penutup

Dokumentasi ini mencakup langkah-langkah lengkap untuk deploy aplikasi PEMIRA PMK 2025 ke shared hosting Jagoan Hosting. Ikuti setiap langkah dengan teliti dan pastikan verifikasi di setiap tahap.

**Estimasi Waktu Deployment:**

- Backend Setup: 30-45 menit
- Frontend Setup: 15-20 menit
- Database Import: 10-15 menit
- Testing: 20-30 menit
- **Total: 1.5 - 2 jam**

Good luck dengan deployment! 🚀
