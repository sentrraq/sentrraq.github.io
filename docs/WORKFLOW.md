# Sentraq — Dokumentasi Workflow Lengkap

> Dokumentasi teknis website dan admin dashboard Sentraq.
> Arsitektur menggunakan **Supabase** sebagai backend (database + storage + auth + realtime).
> Terakhir diperbarui: April 2026

---

## 📁 Struktur Direktori

```
sentraq.github.io/
│
├── index.html                  ← Website utama (publik, toko online)
├── admin.html                  ← Dashboard admin (private, Supabase Auth)
├── migrate-data.html           ← Tool migrasi one-time (products.json → Supabase)
├── products.json               ← Data produk legacy (sudah tidak dipakai)
│
├── assets/
│   ├── css/
│   │   ├── style.css           ← Styling website utama (Apple-inspired design)
│   │   └── admin.css           ← Styling admin dashboard (dark/multi-theme)
│   ├── js/
│   │   ├── supabase.js         ← Inisialisasi Supabase client (ESM)
│   │   └── script.js           ← Logika interaktif website utama
│   └── images/
│       ├── logo-full.png       ← Logo horizontal (header/footer)
│       └── logo-icon.png       ← Logo ikon (favicon/admin sidebar)
│
└── docs/
    ├── WORKFLOW.md             ← Dokumentasi ini
    └── superpowers/
        ├── plans/              ← Implementation plans (AI-assisted)
        └── specs/              ← Feature specs (AI-assisted)
```

---

## 🏗️ Arsitektur Backend (Supabase)

| Komponen | Detail |
|----------|--------|
| **Database** | Supabase PostgreSQL |
| **Storage** | Bucket `product-images` (foto produk) |
| **Auth** | Supabase Auth — email + password + JWT |
| **Realtime** | Supabase Realtime subscription (status produk) |
| **Client** | `supabase-js v2` via CDN ESM |
| **RLS** | Public read · Auth write |

### Supabase Project
- **URL:** `https://sytaqvoegmbaorcuvpqx.supabase.co`
- **Anon Key:** tersimpan di `assets/js/supabase.js`

---

## 🗄️ Skema Database Lengkap

### Tabel `products`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | `text` PK | ID unik produk (kebab-case + timestamp) |
| `name` | `text` | Nama produk |
| `category` | `text` | `macbook` · `iphone` · `ipad` · `tablet` · `laptop` |
| `specs` | `text` | Spesifikasi singkat |
| `price` | `int8` | Harga listing (Rupiah) |
| `actual_price` | `int8` | Harga aktual/deal (opsional) |
| `description` | `text` | Deskripsi / kondisi produk |
| `images` | `text[]` | Array URL foto dari Supabase Storage |
| `status` | `text` | `available` · `on_hold` · `sold` |
| `whatsapp` | `text` | Pesan WA pre-filled |
| `created_at` | `timestamptz` | Waktu dibuat |
| `updated_at` | `timestamptz` | Waktu terakhir diperbarui |

> **Catatan:** Kolom `available` (bool lama) sudah digantikan oleh `status` (3 state)

### Tabel `product_history`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | `uuid` PK | Auto-generate |
| `product_id` | `text` | ID produk (FK ke products.id) |
| `product_name` | `text` | Nama produk saat event |
| `product_price` | `int8` | Harga produk saat event |
| `event_type` | `text` | `created` · `updated` · `status_changed` · `deleted` |
| `old_status` | `text` | Status sebelum perubahan |
| `new_status` | `text` | Status setelah perubahan |
| `created_at` | `timestamptz` | Waktu event |

### Tabel `sales_log`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | `uuid` PK | Auto-generate |
| `product_id` | `text` | ID produk |
| `product_name` | `text` | Nama produk |
| `product_price` | `int8` | Harga listing |
| `actual_price` | `int8` | Harga aktual deal |
| `sold_at` | `timestamptz` | Waktu terjual |

### Kategori yang Didukung

| `category` | Label | Badge Color |
|-----------|--------|------------|
| `macbook` | MacBook | Biru |
| `iphone` | iPhone | Hijau |
| `ipad` | iPad | Ungu |
| `tablet` | Tablet | Merah muda |
| `laptop` | Laptop | Oranye |

### Status Produk

| `status` | Tampilan Website | Tampilan Admin |
|----------|-----------------|----------------|
| `available` | Normal — tombol WA aktif | Badge hijau "Tersedia" |
| `on_hold` | Badge "On Hold" — tombol WA muted | Badge kuning "On Hold" |
| `sold` | Badge "Terjual" — tombol WA nonaktif | Badge merah "Terjual" |

### RLS Policies

| Tabel | Operasi | Role | Kondisi |
|-------|---------|------|---------|
| `products` | SELECT | public | `true` |
| `products` | ALL | authenticated | `auth.uid() IS NOT NULL` |
| `product_history` | ALL | authenticated | `auth.role() = 'authenticated'` |
| `sales_log` | ALL | authenticated | `auth.role() = 'authenticated'` |

---

## 🌐 Alur Website Utama (`index.html` + `assets/js/script.js`)

```
Browser buka index.html
        │
        ▼
supabase.js (ESM) dimuat → window._sb dibuat
        │
        ▼
script.js: DOMContentLoaded
        │
        ├─► fetchProducts()
        │     └─ _sb.from('products').select('*').eq('status', 'available')
        │         ├─ Berhasil → renderProductCards()
        │         └─ Gagal   → tampilkan error + tombol retry
        │
        ├─► initNavbar()           → nav pills aktif saat scroll, mobile menu
        ├─► initFilterBar()        → filter kategori (Semua / MacBook / iPhone / dst)
        ├─► initHeroCycle()        → animasi kata berputar di hero heading
        ├─► initEarlyAnimations()  → reveal-up hero, fitur, kontak
        ├─► initAnimations()       → reveal-up product cards (setelah fetch)
        ├─► initSliders()          → swipe/klik slider foto per produk
        ├─► initLazyImages()       → lazy load + fallback gambar error
        └─► injectJsonLd()         → structured data JSON-LD (SEO)

── Supabase Realtime (status sync) ──
_sb.channel('products-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' })
  .subscribe()
        │
        ├─ INSERT → tambah card baru ke grid
        ├─ UPDATE → update status badge card tanpa reload
        └─ DELETE → fade out & hapus card dari grid
```

### Alur Filter Produk

```
User klik filter pill
        │
        ▼
applyFilter("iphone")
        │
        ├─► Semua card di-cek dataset.category
        ├─► Tidak cocok → fade out → display:none
        ├─► Cocok       → fade in dengan stagger delay
        ├─► Pill aktif  → class .filter-pill--active
        └─► Kosong      → tampilkan #products-empty
```

### Alur Detail Produk (Modal/Lightbox)

```
User klik produk card
        │
        ▼
openProductModal(productId)
        │
        ├─► Render nama, specs, harga, foto slider
        ├─► Tampilkan status badge sesuai status produk
        ├─► Tombol "Hubungi WA" → buka wa.me dengan pesan pre-filled
        └─► Klik backdrop / ESC → tutup modal
```

---

## 🛠️ Alur Admin Dashboard (`admin.html`)

### Cara Akses
```
URL: https://sentraq.github.io/admin.html
Login: email + password akun Supabase
```

### Alur Autentikasi

```
Buka admin.html
        │
        ▼
supabase.js → window._sb siap
        │
        ▼
_sb.auth.onAuthStateChange()
        │
        ├─ Session ada  → showDashboard() → loadProductsTable()
        └─ Session null → showLogin()
                │
        User isi form login → _sb.auth.signInWithPassword()
                │
                ├─ Berhasil → showDashboard()
                └─ Gagal    → tampilkan pesan error merah
```

### Navigasi Tab Admin

| Tab | ID View | Fungsi |
|-----|---------|--------|
| Produk | `#view-products` | CRUD produk, search, filter kategori |
| Keuangan | `#view-finance` | Total aset, log penjualan, cetak PDF |
| Riwayat | `#view-history` | Timeline semua aktivitas produk |
| Pengaturan | `#view-settings` | Ganti password, hapus semua produk |

---

## 📦 Alur CRUD Produk

### Tambah Produk

```
Klik "Tambah Produk"
        │
        ▼
openModal() → form kosong, mode: isEdit = false
        │
        ▼
Admin isi form:
  - Nama, Kategori, Harga, Harga Aktual
  - Spesifikasi, Deskripsi
  - Upload foto (max 5, rasio 4:3, < 500KB)
  - Status (Available / On Hold / Sold)
        │
        ▼
Klik "Simpan Produk"
        │
        ▼
Upload foto → Supabase Storage (bucket: product-images)
        │
        ▼
_sb.from('products').insert([{...}])
        │
        ▼
logHistory({ event_type: 'created', new_status: status })
        │
        ▼
Jika status === 'sold' → insert ke sales_log
        │
        ▼
loadProductsTable() + loadFinanceData() + loadHistoryData()
        │
        ▼
Produk langsung live di website via Realtime ✓
```

### Edit Produk

```
Klik "Edit" pada row produk
        │
        ▼
openEditModal(productId) → pre-fill form dengan data existing
        │
        ▼
Admin ubah data → Klik "Simpan"
        │
        ▼
Upload foto baru (jika ada) → Supabase Storage
        │
        ▼
_sb.from('products').update({...}).eq('id', id)
        │
        ▼
Cek perubahan status:
  ├─ Status berubah → logHistory({ event_type: 'status_changed', old_status, new_status })
  │                   Jika baru sold → insert sales_log
  │                   Jika dari sold → delete dari sales_log
  └─ Status sama   → logHistory({ event_type: 'updated' })
        │
        ▼
loadProductsTable() + loadFinanceData() + loadHistoryData()
```

### Hapus Produk

```
Klik "Hapus" → modal konfirmasi
        │
        ▼
_sb.from('products').delete().eq('id', id)
_sb.from('sales_log').delete().eq('product_id', id)
        │
        ▼
logHistory({ event_type: 'deleted', old_status: prod.status, new_status: null })
        │
        ▼
loadProductsTable() + loadFinanceData() + loadHistoryData()
```

### Arsip Produk (Produk Terjual)

```
Produk berstatus 'sold' → muncul tombol "Arsipkan"
        │
        ▼
Klik "Arsipkan" → _sb.from('products').delete().eq('id', id)
  (sama seperti hapus — produk terjual dihapus dari database)
```

---

## 💰 Alur Fitur Keuangan (`#view-finance`)

```
Buka tab Keuangan → loadFinanceData()
        │
        ▼
Fetch semua produk → kalkulasi:
  ├─ Total Aset      = SUM(price) semua produk aktif
  ├─ Total Pendapatan = SUM(actual_price || price) dari sales_log
  └─ Produk Terjual  = COUNT dari sales_log
        │
        ▼
Fetch sales_log dengan filter bulan/tahun
        │
        ▼
Render tabel log penjualan:
  Nama Produk | Harga Listing | Harga Aktual | Tanggal Terjual
        │
        ▼
Klik "Cetak PDF" → jsPDF generate laporan keuangan
```

### Filter Keuangan

```
Dropdown "Semua Bulan" / "2026"
        │
        ▼
Perubahan filter → loadFinanceData() dipanggil ulang
        │
        ▼
sales_log di-filter by: sold_at BETWEEN bulan/tahun
```

---

## 📋 Alur Riwayat Aktivitas (`#view-history`)

```
Buka tab Riwayat → loadHistoryData()
        │
        ▼
_sb.from('product_history').select('*').order('created_at', desc)
        │
        ▼
Filter by: event_type (Semua / Dibuat / Diperbarui / Status / Dihapus)
        │
        ▼
Render timeline:
  Dot warna → garis vertikal → detail event
        │
        ├─ created      → dot hijau  "Produk ditambahkan"
        ├─ updated      → dot biru   "Data diperbarui"
        ├─ status_changed → dot kuning "Status: available → sold"
        └─ deleted      → dot merah  "Produk dihapus"
```

---

## 🎨 Fitur Tema (`data-theme` pada `<html>`)

| Tema | CSS Var `data-theme` | Accent Color |
|------|---------------------|--------------|
| Dark | `dark` | Biru `#4f8ef7` |
| Light | `light` | Biru `#4f8ef7` |
| Midnight | `midnight` | Ungu `#a78bfa` |
| Forest | `forest` | Hijau `#34d399` |
| Sunset | `sunset` | Amber `#f59e0b` |

```
User klik tombol tema di topbar
        │
        ▼
applyTheme(nextTheme)
        │
        ├─ document.documentElement.setAttribute('data-theme', theme)
        ├─ Update label tombol
        └─ localStorage.setItem('sentraq-theme', theme)
        │
        ▼
Saat reload → localStorage.getItem('sentraq-theme') → applyTheme()
```

---

## 🖼️ Kriteria Foto Produk (Divisi Media)

| Kriteria | Ketentuan |
|----------|-----------|
| **Rasio** | **4 : 3** (landscape) |
| **Ukuran ideal** | **800 × 600 px** |
| **Ukuran minimum** | 400 × 300 px |
| **Format** | JPG / PNG / WebP |
| **Maks ukuran file** | < 500 KB per foto |
| **Maks jumlah** | 5 foto per produk |

**Tips:**
- Latar belakang bersih / putih / abu terang
- Objek di tengah frame, pencahayaan merata
- Foto landscape > portrait
- Gambar di-crop otomatis ke rasio 4:3

---

## 🔐 Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Autentikasi** | Supabase Auth (JWT, httpOnly cookie) |
| **Otorisasi DB** | RLS — only authenticated users can write |
| **Otorisasi Storage** | RLS — only authenticated users can upload |
| **Anon key** | Public read only — aman di client |
| **Service role key** | Tidak digunakan di client-side |
| **Admin URL** | Tidak ada proteksi URL — keamanan via Auth saja |

---

## 🚀 Cara Deploy

Project ini adalah **static site** — tidak ada build step.

```
1. Edit file langsung (admin.html / assets/css/ / assets/js/)
2. git add . && git commit -m "..."
3. git push origin main
4. GitHub Pages otomatis deploy dalam ~1 menit
5. URL live: https://sentraq.github.io
```

> **Catatan:** Perubahan data produk (tambah/edit/hapus) langsung real-time via Supabase — tidak perlu deploy ulang.


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
