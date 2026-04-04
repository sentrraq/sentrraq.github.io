# Sentraq — Mekanisme & Workflow

> Dokumentasi teknis website dan admin dashboard Sentraq.

---

## Struktur File

```
sentraq.github.io/
├── index.html            ← Website utama (publik)
├── admin.html            ← Dashboard admin
├── products.json         ← Data produk (sumber kebenaran untuk website)
├── assets/
│   ├── css/
│   │   ├── style.css     ← Styling website utama (Apple-style design system)
│   │   └── admin.css     ← Styling khusus admin dashboard
│   ├── js/
│   │   └── script.js     ← Semua logika interaktif website
│   └── images/           ← Foto produk (opsional, bisa pakai URL eksternal)
└── docs/
    └── WORKFLOW.md       ← Dokumentasi ini
```

---

## 1. Alur Website Utama (`index.html`)

```
Browser buka index.html
        │
        ▼
style.css dimuat → tampilan Apple-style
        │
        ▼
script.js dijalankan
        │
        ├─► fetch("products.json")
        │         │
        │         ├─ Berhasil → render produk dari JSON
        │         └─ Gagal   → tampilkan tombol retry
        │
        ├─► initNavbar()           → hamburger menu, scroll effect
        ├─► initFilterBar()        → filter pills (Semua / MacBook / iPhone / iPad / Laptop)
        ├─► initHeroCycle()        → cycling word di hero heading (MacBook → iPhone → ...)
        ├─► initEarlyAnimations()  → reveal-up untuk hero, features, contact (dipanggil awal)
        ├─► initAnimations()       → reveal-up untuk product cards (dipanggil setelah fetch)
        ├─► initSliders()          → slider foto produk (jika ada gambar)
        └─► initLazyImages()       → lazy load gambar + fallback jika error
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
        ├─► Navbar link aktif → class .nav-filter-active
        └─► Jika kosong      → tampilkan #products-empty
```

---

## 2. Data Produk (`products.json`)

### Skema

```json
{
  "products": [
    {
      "id":          "macbook-pro-2020-i5",   // ID unik (kebab-case)
      "name":        "MacBook Pro 2020 i5",   // Nama tampil
      "category":    "macbook",               // macbook | iphone | ipad | laptop
      "specs":       "i5 · 16GB · 512GB SSD", // Spesifikasi singkat
      "price":       7500000,                 // Harga (angka, Rupiah)
      "description": "Kondisi mulus...",      // Deskripsi panjang (opsional)
      "images":      ["https://..."],         // Array URL foto (boleh kosong [])
      "available":   true,                    // true = Tersedia | false = Terjual
      "whatsapp":    "Halo Sentraq, ..."      // Pesan WhatsApp pre-filled
    }
  ]
}
```

### Kategori yang Didukung

| `category` | Label di filter | Icon |
|-----------|----------------|------|
| `macbook` | MacBook        | Laptop SVG |
| `iphone`  | iPhone         | Phone SVG |
| `ipad`    | iPad           | Tablet SVG |
| `laptop`  | Laptop         | Laptop SVG |

---

## 3. Admin Dashboard (`admin.html`)

### Cara Akses

```
Buka: https://sentraq.github.io/admin.html
Password default: sentraq123
```

> **Penting:** Ganti password segera setelah pertama login via tab Pengaturan.

### Arsitektur Admin

Admin berjalan **100% di browser** — tidak ada server atau backend:

| Komponen | Detail |
|----------|--------|
| CSS | `assets/css/admin.css` (file terpisah dari website utama) |
| JS | Inline di dalam `admin.html` |
| Penyimpanan | `localStorage` browser |
| Autentikasi | SHA-256 hash password via Web Crypto API |
| Publish | Manual download → upload ke GitHub |

---

### Alur Login

```
Buka admin.html
        │
        ▼
Cek localStorage["sentraq_admin_pw"]
        │
        ├─ Belum ada → hash default "sentraq123" disimpan otomatis
        └─ Sudah ada → gunakan hash yang tersimpan
        │
        ▼
User masukkan password → di-hash SHA-256 via Web Crypto API
        │
        ├─ Hash cocok     → masuk dashboard
        └─ Hash tidak cocok → tampilkan error
```

---

### Fitur Dashboard

| Tab | Fitur |
|-----|-------|
| **Produk** | Lihat, tambah, edit, hapus produk · Statistik total/tersedia/terjual · Search & filter kategori |
| **Publikasi** | Download `products.json` · Import `products.json` · Preview isi JSON |
| **Pengaturan** | Ganti password · Muat produk default · Hapus semua produk |

---

### Alur CRUD Produk

```
Admin tambah / edit / hapus produk
        │
        ▼
Data disimpan ke localStorage["sentraq_products"]
        │
        ▼
Perubahan hanya ada di browser — website publik belum berubah
        │
        ▼
Perlu publish → lihat alur Publikasi di bawah
```

---

### Alur Publikasi ke Website

Tidak ada GitHub API — publikasi dilakukan **manual**:

```
1. Tab "Publikasi" → klik "Download products.json"
        │
        ▼
2. File tersimpan ke folder Downloads kamu
        │
        ▼
3. Buka GitHub repo → cari file products.json di root
        │
        ▼
4. Klik ikon pensil (Edit) → "Upload file" → pilih/drag file baru
   ATAU: langsung replace via GitHub Desktop / git push
        │
        ▼
5. Klik "Commit changes"
        │
        ▼
6. GitHub Pages auto-deploy (~30–60 detik)
        │
        ▼
7. index.html fetch("products.json") → produk diperbarui ✓
```

> **Import:** Jika kamu pindah browser/perangkat, gunakan tombol "Import products.json"
> untuk memuat ulang data dari file yang pernah di-download sebelumnya.

---

## 4. Penyimpanan Data (localStorage)

| Key | Isi | Ditulis oleh |
|-----|-----|-------------|
| `sentraq_products` | Array produk (JSON string) | Admin dashboard |
| `sentraq_admin_pw` | SHA-256 hash password | Admin dashboard |

> `products.json` di repo GitHub adalah **sumber kebenaran** untuk website publik.
> localStorage hanya digunakan admin sebagai draft kerja sebelum di-publish.

---

## 5. Cara Menambah Produk Baru (End-to-End)

```
1. Buka admin.html → login
2. Klik "Tambah Produk"
3. Isi form:
   - Nama produk
   - Kategori (macbook / iphone / ipad / laptop)
   - Spesifikasi singkat
   - Harga (angka tanpa titik, contoh: 7500000)
   - Deskripsi (opsional)
   - URL foto (opsional, satu per baris)
   - Pesan WhatsApp (auto-generated, bisa diedit)
   - Status: Tersedia / Terjual
4. Klik "Simpan" → tersimpan di localStorage
5. Tab "Publikasi" → Download products.json
6. Upload ke GitHub repo → Commit changes
7. Tunggu ~30–60 detik → produk muncul di website
```

---

## 6. Arsitektur Keamanan

- Password **tidak disimpan plain-text** — hanya SHA-256 hash via Web Crypto API
- Tidak ada GitHub Token — publish dilakukan manual oleh admin
- Tidak ada data sensitif di source code / repo
- Admin page murni client-side — tidak ada koneksi ke server selain GitHub saat push manual
