# Sentraq — Mekanisme & Workflow

> Dokumentasi teknis website dan admin dashboard Sentraq.
> Arsitektur terbaru menggunakan **Supabase** sebagai backend (database + storage + auth).

---

## Struktur File

```
sentraq.github.io/
├── index.html            ← Website utama (publik)
├── admin.html            ← Dashboard admin (Supabase-powered)
├── migrate-data.html     ← Tool migrasi one-time (products.json → Supabase)
├── assets/
│   ├── css/
│   │   ├── style.css     ← Styling website utama (Apple-style design system)
│   │   └── admin.css     ← Styling khusus admin dashboard
│   ├── js/
│   │   ├── script.js     ← Semua logika interaktif website
│   │   └── supabase.js   ← Inisialisasi Supabase client (ESM module)
│   └── images/           ← Aset statis (bukan foto produk)
└── docs/
    └── WORKFLOW.md       ← Dokumentasi ini
```

---

## 1. Arsitektur Backend (Supabase)

| Komponen | Detail |
|----------|--------|
| **Database** | Supabase PostgreSQL — tabel `products` |
| **Storage** | Supabase Storage — bucket `product-images` |
| **Auth** | Supabase Auth — email + password |
| **Client** | `supabase-js v2` via CDN ESM |
| **RLS** | Public read · Auth write (hanya user login) |

### Supabase Project
- **URL:** `https://sytaqvoegmbaorcuvpqx.supabase.co`
- **Anon Key:** tersimpan di `assets/js/supabase.js`

---

## 2. Alur Website Utama (`index.html`)

```
Browser buka index.html
        │
        ▼
supabase.js dimuat (ESM) → window._sb dibuat
        │
        ▼
script.js dijalankan saat DOMContentLoaded
        │
        ├─► window._sb.from('products').select('*')
        │         │
        │         ├─ Berhasil → render produk dari Supabase
        │         └─ Gagal   → tampilkan pesan error + retry
        │
        ├─► initNavbar()           → hamburger menu, scroll effect
        ├─► initFilterBar()        → filter pills (Semua / MacBook / iPhone / iPad / Laptop)
        ├─► initHeroCycle()        → cycling word di hero heading
        ├─► initEarlyAnimations()  → reveal-up untuk hero, features, contact
        ├─► initAnimations()       → reveal-up untuk product cards (setelah fetch)
        ├─► initSliders()          → slider foto produk
        ├─► initLazyImages()       → lazy load gambar + fallback jika error
        └─► injectJsonLd()         → structured data JSON-LD untuk SEO
```

### Alur Filter Produk

```
User klik filter pill / nav link kategori
        │
        ▼
applyFilter("macbook")
        │
        ├─► Semua .product-card di-cek dataset.category
        ├─► Card tidak cocok → fade out → display:none
        ├─► Card cocok       → fade in dengan stagger delay
        ├─► Filter pill aktif → class .filter-pill--active
        └─► Jika kosong      → tampilkan #products-empty
```

---

## 3. Skema Tabel `products` (Supabase)

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | `text` | ID unik produk (kebab-case + timestamp) |
| `name` | `text` | Nama produk |
| `category` | `text` | `macbook` · `iphone` · `ipad` · `laptop` |
| `specs` | `text` | Spesifikasi singkat (pisah dengan ` · `) |
| `price` | `int8` | Harga dalam Rupiah |
| `description` | `text` | Deskripsi / kondisi produk |
| `images` | `text[]` | Array URL foto dari Supabase Storage |
| `available` | `bool` | `true` = Tersedia · `false` = Terjual |
| `whatsapp` | `text` | Pesan WA pre-filled |
| `created_at` | `timestamptz` | Waktu dibuat |
| `updated_at` | `timestamptz` | Waktu terakhir diperbarui |

### Kategori yang Didukung

| `category` | Label di filter |
|-----------|----------------|
| `macbook` | MacBook |
| `iphone`  | iPhone |
| `ipad`    | iPad |
| `laptop`  | Laptop |

---

## 4. Admin Dashboard (`admin.html`)

### Cara Akses

```
Buka: https://sentraq.github.io/admin.html
Login dengan akun Supabase (email + password)
```

### Alur Login

```
Buka admin.html
        │
        ▼
supabase.js → window._sb siap
        │
        ▼
onAuthStateChange() dipanggil
        │
        ├─ Session ada  → showDashboard() → load tabel produk
        └─ Session null → showLogin()
        │
User isi email + password → signInWithPassword()
        │
        ├─ Berhasil → showDashboard()
        └─ Gagal    → tampilkan pesan error
```

### Fitur Dashboard

| Tab | Fitur |
|-----|-------|
| **Produk** | Lihat, tambah, edit, hapus produk · Statistik · Search & filter kategori |
| **Pengaturan** | Ganti password · Hapus semua produk |

---

## 5. Alur CRUD Produk

### Tambah / Edit Produk

```
Admin klik "Tambah Produk" / "Edit"
        │
        ▼
Isi form → klik "Simpan Produk"
        │
        ▼
Upload foto (jika ada) → Supabase Storage bucket: product-images
        │
        ▼
Insert / Update ke tabel products di Supabase
        │
        ▼
Produk langsung live di website ✓ (tidak perlu deploy ulang)
```

### Hapus Produk

```
Admin klik "Hapus" → konfirmasi
        │
        ▼
DELETE dari tabel products
        │
        ▼
Produk langsung hilang dari website ✓
```

---

## 6. Foto Produk — Kriteria untuk Divisi Media

Foto produk diupload ke **Supabase Storage** (`product-images` bucket) dan ditampilkan di grid website dengan crop otomatis **rasio 4:3**.

| Kriteria | Ketentuan |
|----------|-----------|
| **Rasio** | **4 : 3** (landscape) |
| **Ukuran ideal** | **800 × 600 px** |
| **Ukuran minimum** | 400 × 300 px |
| **Format** | JPG / PNG / WebP |
| **Maks ukuran file** | < 500 KB per foto |
| **Maks jumlah** | 5 foto per produk |

### Tips Foto
- Latar belakang **bersih / putih / abu-abu terang**
- Objek produk **di tengah frame**
- Pencahayaan **terang dan merata** (hindari bayangan keras)
- Foto **landscape** lebih disarankan dari portrait
- Gambar akan **di-crop otomatis** ke rasio 4:3 — bagian tengah yang diambil

---

## 7. RLS (Row Level Security) Supabase

### Tabel `products`

| Policy | Operasi | Role | Kondisi |
|--------|---------|------|---------|
| Public read | SELECT | public | `true` |
| Auth write | ALL | authenticated | `auth.uid() IS NOT NULL` |

### Storage `product-images`

| Policy | Operasi | Role | Kondisi |
|--------|---------|------|---------|
| Public read images | SELECT | public | `bucket_id = 'product-images'` |
| Auth upload | INSERT | authenticated | `bucket_id = 'product-images'` |

---

## 8. Cara Menambah Produk Baru (End-to-End)

```
1. Buka https://sentraq.github.io/admin.html → login
2. Klik "Tambah Produk"
3. Isi form:
   - Nama produk
   - Kategori (macbook / iphone / ipad / laptop)
   - Harga (angka, contoh: 7500000)
   - Spesifikasi singkat (pisah dengan · titik tengah)
   - Deskripsi / kondisi (opsional)
   - Pesan WhatsApp (opsional, auto-generated jika dikosongkan)
   - Foto produk (upload JPG/PNG/WebP, maks 5 foto)
   - Status: Tersedia / Terjual
4. Klik "Simpan Produk"
5. Produk langsung muncul di website ✓
```

---

## 9. Arsitektur Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Autentikasi** | Supabase Auth (email + password, JWT) |
| **Otorisasi DB** | RLS — hanya user login yang bisa write |
| **Otorisasi Storage** | RLS — hanya user login yang bisa upload |
| **Anon key** | Hanya untuk public read — aman di client-side |
| **Service role key** | Tidak digunakan di client — tersimpan di Supabase saja |
