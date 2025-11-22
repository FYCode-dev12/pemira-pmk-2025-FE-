# PEMIRA PMK 2025 - Panduan Integrasi Frontend-Backend

## ✅ Status Integrasi

**Backend:** Laravel + Sanctum Authentication ✅  
**Frontend:** React + Vite ✅  
**Status:** TERINTEGRASI PENUH ✅

---

## 🔧 Yang Sudah Dikonfigurasi

### 1. Environment Variables

File `.env` sudah dibuat dengan konfigurasi:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 2. API Client (`src/api/apiClient.js`)

✅ Axios client dengan:
- Auto attach Bearer token
- Handle 401 (auto logout)
- Error handling
- Support cookies untuk Sanctum

### 3. API Services (`src/api/services.js`)

✅ Service functions untuk semua endpoint:

**Authentication:**
- `authService.loginAdmin(username, password)`
- `authService.loginSuperAdmin(username, password)`
- `authService.loginPemilih(nim, token)`
- `authService.logout()`

**Kandidat:**
- `kandidatService.getAll()`

**Voting:**
- `voteService.vote(kandidatId)`
- `voteService.getStatus()`

**Results (Admin):**
- `resultsService.getSummary()`

### 4. Komponen yang Sudah Terintegrasi

✅ **VoterLogin.jsx** - Menggunakan `authService.loginPemilih()`  
✅ **AdminLogin.jsx** - Menggunakan `authService.loginAdmin()`  
✅ **VotingPage.jsx** - Fetch kandidat dari backend + submit vote  
✅ **AdminDashboard.jsx** - Fetch real-time results dari backend

### 5. CORS Configuration (Backend)

Backend sudah dikonfigurasi untuk accept requests dari:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

---

## 🚀 Cara Menjalankan

### Terminal 1: Start Backend
```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-BE-
php artisan serve
```

Backend akan jalan di: `http://127.0.0.1:8000`

### Terminal 2: Start Frontend
```bash
cd /home/fycode/Documents/pemira-pmk-2025/pemira-pmk-2025-FE-
npm run dev
```

Frontend akan jalan di: `http://localhost:5173`

---

## 🧪 Testing Flow

### 1. Test Pemilih Login

1. Buka `http://localhost:5173`
2. Klik "Login Sebagai Pemilih"
3. Masukkan NIM dan Token (dari database backend)
4. Klik "Masuk & Pilih"
5. **Expected:** Redirect ke halaman voting dengan daftar kandidat

### 2. Test Voting

1. Setelah login sebagai pemilih
2. Lihat daftar kandidat (fetched dari backend)
3. Klik "Pilih Kandidat"
4. Konfirmasi pilihan
5. **Expected:** Vote tersimpan, tampil success message

### 3. Test Admin Login

1. Buka `http://localhost:5173`
2. Klik "Login Sebagai Admin"
3. Username: `admin`
4. Password: `Admin123!`
5. **Expected:** Redirect ke dashboard admin

### 4. Test Admin Dashboard

1. Setelah login sebagai admin
2. **Expected:** Melihat:
   - Statistik total pemilih
   - Jumlah yang sudah/belum memilih
   - Grafik perolehan suara
   - Data partisipasi

---

## 📋 API Endpoints yang Digunakan

| Method | Endpoint | Auth Required | Digunakan Di |
|--------|----------|---------------|--------------|
| POST | `/api/auth/admin/login` | ❌ | AdminLogin |
| POST | `/api/auth/super-admin/login` | ❌ | AdminLogin |
| POST | `/api/auth/pemilih/login` | ❌ | VoterLogin |
| POST | `/api/auth/logout` | ✅ | All pages |
| GET | `/api/kandidat` | ✅ | VotingPage |
| POST | `/api/vote` | ✅ | VotingPage |
| GET | `/api/vote/status` | ✅ | VotingPage |
| GET | `/api/results/summary` | ✅ | AdminDashboard |

---

## 🔐 Token Management

### Penyimpanan Token
Token disimpan di `localStorage` dengan key:
- `auth_token` - Token umum
- `admin_token` - Token admin (backward compatibility)
- `voter_token` - Token voter (backward compatibility)
- `user_role` - Role user (admin/pemilih)

### Auto Attachment
`apiClient.js` otomatis attach token ke setiap request:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Auto Logout
Jika backend return 401, frontend auto clear localStorage dan redirect ke home.

---

## 🐛 Troubleshooting

### Problem: CORS Error

**Symptom:**
```
Access to fetch at 'http://127.0.0.1:8000/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
1. Pastikan backend sudah running
2. Check `config/cors.php` di backend
3. Restart backend setelah ubah CORS config

---

### Problem: 401 Unauthorized

**Symptom:**
- Request ditolak dengan status 401
- Auto redirect ke home page

**Solution:**
1. Login ulang
2. Check token di browser DevTools:
   - Application → Local Storage → `http://localhost:5173`
   - Cari key `auth_token` atau `admin_token`
3. Jika token tidak ada, login ulang

---

### Problem: Kandidat tidak muncul

**Symptom:**
- Halaman voting kosong
- Console error: "Gagal memuat kandidat"

**Solution:**
1. Check backend database ada data kandidat:
   ```bash
   php artisan tinker
   \App\Models\Kandidat::count()
   ```
2. Pastikan sudah login sebagai pemilih
3. Check console browser untuk error

---

### Problem: Voting gagal

**Symptom:**
- Error "Gagal menyimpan suara"

**Solution:**
1. Check apakah sudah pernah voting:
   ```bash
   php artisan tinker
   \App\Models\Vote::where('pemilih_id', $pemilihId)->exists()
   ```
2. Pastikan kandidat_id valid
3. Check log backend: `storage/logs/laravel.log`

---

## 📊 Data Flow

### Login Flow (Pemilih)
```
1. User input NIM & Token
   ↓
2. Frontend → POST /api/auth/pemilih/login
   ↓
3. Backend validate & return token
   ↓
4. Frontend save token to localStorage
   ↓
5. Redirect to /voting
```

### Voting Flow
```
1. Frontend → GET /api/kandidat (with token)
   ↓
2. Backend return list kandidat
   ↓
3. User pilih kandidat
   ↓
4. Frontend → POST /api/vote (with kandidat_id)
   ↓
5. Backend save vote & update status
   ↓
6. Frontend show success & auto logout
```

### Admin Dashboard Flow
```
1. Admin login → get token
   ↓
2. Frontend → GET /api/results/summary (with token)
   ↓
3. Backend return:
   - Total votes per kandidat
   - Partisipasi data
   - Faculty stats
   ↓
4. Frontend display charts & statistics
   ↓
5. Auto refresh every 5 seconds
```

---

## 🎯 Next Steps (Opsional)

1. ✅ Test semua flow end-to-end
2. ⏳ Add loading states yang lebih baik
3. ⏳ Improve error messages
4. ⏳ Add confirmation dialogs
5. ⏳ Implement vote history untuk admin
6. ⏳ Add export hasil pemilihan (CSV/PDF)

---

## 📞 Support

Jika ada masalah:
1. Check console browser (F12)
2. Check backend log: `storage/logs/laravel.log`
3. Restart backend & frontend
4. Clear localStorage: `localStorage.clear()`

---

**Generated:** November 22, 2025  
**Status:** ✅ SIAP PRODUCTION
