# Update Keamanan Token Pemilihan

## Tanggal: 25 November 2025

## Masalah yang Ditemukan

Token pemilihan bisa digunakan berkali-kali karena:

1. Token tidak dihapus dari database setelah login berhasil
2. Tidak ada validasi untuk mencegah login ulang dengan token yang sama
3. Pemilih yang sudah voting bisa login lagi

## Solusi yang Diterapkan

### Backend (Laravel)

#### File: `Backend Laravel/app/Http/Controllers/AuthController.php`

**Perubahan pada method `loginPemilih()`:**

1. **Validasi pemilih sudah voting:**

   ```php
   if ($pemilih->sudah_memilih) {
       throw ValidationException::withMessages([
           'token' => ['Token sudah digunakan. Anda telah melakukan voting sebelumnya.']
       ]);
   }
   ```

2. **Invalidasi token setelah login:**

   ```php
   // Token dikosongkan (set null) setelah login berhasil
   $pemilih->token = null;
   $pemilih->save();
   ```

3. **Return status sudah_memilih:**
   ```php
   'pemilih' => [
       ...
       'sudah_memilih' => $pemilih->sudah_memilih,
   ]
   ```

### Frontend (React)

#### File: `src/pages/VoterLogin.jsx`

**Validasi response login:**

```javascript
// Cek apakah pemilih sudah melakukan voting
if (response.pemilih?.sudah_memilih) {
  toast.error("Token sudah digunakan. Anda telah melakukan voting sebelumnya.");
  setLoading(false);
  return;
}
```

#### File: `src/pages/VotingPage.jsx`

**Pengecekan status voting saat mount:**

```javascript
// Cek status voting pemilih
const checkVotingStatus = async () => {
  try {
    const response = await voteService.getStatus();
    if (response.status === "success" && response.sudah_memilih) {
      toast.error("Anda sudah melakukan voting sebelumnya.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/voter", { replace: true });
      }, 2000);
    }
  } catch (error) {
    console.error("Error checking voting status:", error);
  }
};
```

## Alur Keamanan Token

1. **Sebelum Login:**

   - Pemilih memiliki token unik di database
   - Token disimpan di kolom `token` tabel `pemilih`

2. **Saat Login:**

   - Backend memvalidasi NIM dan token
   - Jika valid dan belum voting → login berhasil
   - **Token langsung dihapus (set null) dari database**
   - Personal access token (PAT) digenerate untuk session
   - Jika sudah voting → login ditolak

3. **Setelah Login:**

   - Token pemilihan sudah tidak ada di database
   - Tidak bisa login lagi dengan token yang sama
   - Pemilih bisa voting menggunakan PAT

4. **Setelah Voting:**
   - Flag `sudah_memilih` diset true
   - Waktu voting dicatat di `waktu_memilih`
   - Tidak bisa voting lagi

## Keamanan yang Dijamin

✅ Token pemilihan **hanya bisa digunakan sekali** untuk login
✅ Setelah login, token **langsung dihapus** dari database
✅ Pemilih yang sudah voting **tidak bisa login lagi**
✅ Session menggunakan personal access token (PAT) Laravel Sanctum
✅ Validasi ganda di frontend dan backend

## Testing

Untuk menguji keamanan token:

1. Login dengan NIM dan token valid → Berhasil
2. Coba login lagi dengan token yang sama → Gagal (token tidak valid)
3. Voting dengan akun tersebut → Berhasil
4. Coba login lagi dengan NIM yang sama → Gagal (sudah voting)

## Catatan

- Token pemilihan ≠ Personal Access Token (PAT)
- Token pemilihan: untuk autentikasi awal (sekali pakai)
- PAT: untuk session setelah login (sampai logout)
