# Sentraq — Mekanisme & Workflow

> Dokumentasi teknis website dan admin dashboard Sentraq.

---

## Struktur File

```
sentraq.github.io/
├── index.html            ← Website utama (publik)
├── admin.html            ← Dashboard admin (self-contained)
├── products.json         ← Data produk (sumber kebenaran)
├── assets/
│   ├── css/
│   │   └── style.css     ← Semua styling (Apple-style design system)
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
        │         └─ Gagal   → render produk fallback (hardcoded)
        │
        ├─► initNavbar()       → hamburger menu, scroll effect
        ├─► initFilterNav()    → klik MacBook/iPhone/iPad/Laptop di navbar
        ├─► initAnimations()   → reveal-up scroll animations
        ├─► initSliders()      → slider foto produk (jika ada gambar)
        └─► initLazyImages()   → lazy load gambar + fallback jika error
```

### Alur Filter Produk

```
User klik "MacBook" di navbar
        │
        ▼
applyFilter("macbook")
        │
        ├─► Semua .product-card di-cek dataset.category
        ├─► Card yang tidak cocok → tambah class .hidden
        ├─► Card yang cocok      → tampil
        ├─► Navbar link aktif    → class .nav-filter-active (warna biru)
        └─► Jika tidak ada produk → tampilkan #products-empty
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
      "description": "Kondisi mulus...",      // Deskripsi panjang
      "images":      ["https://..."],         // Array URL foto (boleh kosong)
      "available":   true,                    // true = tampil | false = disembunyikan
      "whatsapp":    "Halo Sentraq, ..."      // Pesan WhatsApp pre-filled
    }
  ]
}
```

### Kategori yang Didukung

| `category` | Tampil di filter | Icon SVG |
|-----------|-----------------|----------|
| `macbook` | MacBook         | Laptop SVG |
| `iphone`  | iPhone          | Phone SVG |
| `ipad`    | iPad            | Tablet SVG |
| `laptop`  | Laptop          | Laptop SVG |

---

## 3. Admin Dashboard (`admin.html`)

### Cara Akses

```
Buka: https://sentraq.github.io/admin.html
Password default: sentraq123
```

> File admin.html **self-contained** — tidak butuh server, semua CSS & JS inline.

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
User masukkan password → SHA-256 hash via Web Crypto API
        │
        ├─ Hash cocok → masuk dashboard
        └─ Hash tidak cocok → tampilkan error
```

### Fitur Dashboard

| Fitur | Keterangan |
|-------|-----------|
| **Lihat Produk** | Tabel semua produk dari localStorage |
| **Tambah Produk** | Form baru → simpan ke localStorage |
| **Edit Produk** | Klik produk → panel overlay edit |
| **Hapus Produk** | Hapus dari localStorage |
| **Publish ke GitHub** | Push `products.json` via GitHub API |
| **Ganti Password** | Hash password baru disimpan ke localStorage |

### Alur CRUD Produk

```
Admin tambah/edit/hapus produk
        │
        ▼
Data disimpan ke localStorage["sentraq_products"]
        │
        ▼
(Opsional) Klik "Publish ke GitHub"
        │
        ▼
GET /repos/{user}/{repo}/contents/products.json
→ Ambil SHA file yang ada
        │
        ▼
PUT /repos/{user}/{repo}/contents/products.json
→ Kirim konten baru (base64) + SHA lama
        │
        ▼
GitHub Pages auto-deploy (~30-60 detik)
        │
        ▼
index.html fetch("products.json") → tampilan diperbarui
```

### Alur Publish ke GitHub

```
Admin klik "Publish"
        │
        ▼
Ambil dari localStorage:
  - sentraq_gh_token  → GitHub Personal Access Token
  - sentraq_gh_user   → GitHub username
  - sentraq_gh_repo   → Nama repo (default: sentraq.github.io)
  - sentraq_gh_branch → Branch (default: main)
        │
        ▼
Step 1: GET file SHA
  https://api.github.com/repos/{user}/{repo}/contents/products.json
        │
        ▼
Step 2: PUT file baru
  Body: { message, content: btoa(JSON), sha: existing_sha, branch }
        │
        ▼
GitHub Pages deploy otomatis ✓
```

---

## 4. Penyimpanan Data

| Key localStorage | Isi | Siapa yang nulis |
|-----------------|-----|-----------------|
| `sentraq_products` | Array produk (JSON string) | Admin dashboard |
| `sentraq_admin_pw` | SHA-256 hash password | Admin dashboard |
| `sentraq_gh_token` | GitHub PAT (token) | Settings admin |
| `sentraq_gh_user` | GitHub username | Settings admin |
| `sentraq_gh_repo` | Nama repo | Settings admin |
| `sentraq_gh_branch` | Branch target | Settings admin |

> **Catatan:** `products.json` di repo adalah sumber kebenaran untuk website publik.  
> localStorage hanya digunakan oleh admin sebagai draft sebelum di-publish.

---

## 5. Setup Awal untuk Admin

### Langkah-langkah:

**1. Buat GitHub Personal Access Token**
- Buka: https://github.com/settings/tokens/new
- Centang scope: `repo` (full control)
- Generate → copy token

**2. Konfigurasi di Admin Dashboard**
- Buka `admin.html` → login
- Klik **Pengaturan**
- Isi:
  - GitHub Token: `ghp_xxxxxxxxxxxx`
  - GitHub Username: `sentraq`
  - Repo Name: `sentraq.github.io`
  - Branch: `main`

**3. Publish**
- Tambah/edit produk
- Klik **Publish ke GitHub**
- Tunggu ~30-60 detik → website live

---

## 6. Cara Menambah Produk Baru

```
1. Buka admin.html → login (password: sentraq123)
2. Klik "Tambah Produk"
3. Isi form:
   - Nama produk
   - Kategori (macbook / iphone / ipad / laptop)
   - Spesifikasi
   - Harga (angka, tanpa titik)
   - Deskripsi
   - URL foto (boleh beberapa, satu per baris)
   - Pesan WhatsApp (auto-generated)
4. Klik "Simpan"
5. Klik "Publish ke GitHub"
6. Tunggu ~30-60 detik → produk muncul di website
```

---

## 7. Arsitektur Keamanan

- Password **tidak disimpan plain-text** — hanya SHA-256 hash
- GitHub Token disimpan di **localStorage browser lokal** (tidak pernah ke server selain GitHub API)
- Admin page tidak punya backend — murni client-side
- Tidak ada data sensitif di repo/source code
