# Admin Dashboard Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade admin dashboard dengan fitur arsip produk, filter keuangan per bulan, cetak laporan PDF, dan perbaikan tab Riwayat sebagai full activity log.

**Architecture:** Semua perubahan di `admin.html` (inline JS + HTML) dan `assets/css/admin.css`. Tidak ada framework, murni vanilla JS + Supabase JS client. Satu tabel baru di Supabase (`archived` column di products). jsPDF diload dari CDN untuk export PDF.

**Tech Stack:** Vanilla JS, Supabase JS v2, jsPDF CDN, CSS custom properties (dark theme)

---

## SQL Migration (jalankan di Supabase SQL Editor sebelum mulai)

```sql
-- Tambah kolom archived ke tabel products
ALTER TABLE products ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
```

---

## File yang Dimodifikasi

- **`admin.html`** — semua perubahan HTML struktur + inline JS
- **`assets/css/admin.css`** — style untuk tombol arsip, filter keuangan, badge arsip, print styles

---

## Task 1: Fitur Arsip Produk

**Perubahan:**
- `admin.html`: Tambah tombol "Arsipkan" di tabel produk (hanya muncul untuk produk berstatus `sold`)
- `admin.html`: Filter `loadProductsTable()` agar exclude produk `archived = true` dari tampilan utama
- `admin.html`: Fungsi `archiveProduct(id)` — set `archived = true`, log ke history, refresh table
- `assets/css/admin.css`: Style `.btn-archive` (warna neutral/muted)

**Detail implementasi:**

- [ ] **Step 1: Jalankan SQL migration**
  ```sql
  ALTER TABLE products ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
  ```

- [ ] **Step 2: Update query loadProductsTable untuk exclude archived**

  Di `admin.html`, fungsi `loadProductsTable()` ubah query:
  ```js
  var result = await _sb.from('products').select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false });
  ```

- [ ] **Step 3: Tambah tombol Arsipkan di renderTable()**

  Di fungsi `renderTable()`, pada bagian `td-actions`, tambah tombol Arsipkan HANYA jika `p.status === 'sold'`:
  ```js
  (p.status === 'sold'
    ? '<button class="btn btn-archive btn-sm btn-archive-prod" data-id="' + escHtml(p.id) + '">Arsipkan</button>'
    : '') +
  '<button class="btn btn-secondary btn-sm btn-edit" data-id="' + escHtml(p.id) + '">Edit</button>' +
  '<button class="btn btn-danger btn-sm btn-delete" data-id="' + escHtml(p.id) + '">Hapus</button>'
  ```

- [ ] **Step 4: Tambah fungsi archiveProduct()**

  Tambahkan setelah fungsi `deleteProduct`:
  ```js
  async function archiveProduct(id) {
    if (!confirm('Arsipkan produk ini? Produk akan disembunyikan dari daftar.')) return;
    var prod = allProducts.find(function(x){ return x.id === id; });
    var result = await _sb.from('products').update({ archived: true }).eq('id', id);
    if (result.error) { showToast('Gagal mengarsipkan: ' + result.error.message, 'error'); return; }
    if (prod) await logHistory({ product_id: id, product_name: prod.name, product_price: prod.price || 0, event_type: 'archived', old_status: prod.status });
    showToast('Produk diarsipkan', 'info');
    await loadProductsTable();
    loadFinanceData();
    loadHistoryData();
  }
  ```

- [ ] **Step 5: Tambah event listener untuk btn-archive-prod**

  Di event listener `product-tbody` click handler, tambah:
  ```js
  var archiveBtn = e.target.closest('.btn-archive-prod');
  if (archiveBtn) archiveProduct(archiveBtn.dataset.id);
  ```

- [ ] **Step 6: Update eventMeta di loadHistoryData() untuk event 'archived'**

  ```js
  archived: { icon: 'M5 8h14M5 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0M5 8l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2L19 8M10 12v4M14 12v4', color: 'warning', label: 'Diarsipkan' },
  ```

- [ ] **Step 7: Tambah CSS untuk btn-archive di admin.css**

  ```css
  .btn-archive {
    background: rgba(251,191,36,0.12); color: var(--warning);
    border: 1px solid rgba(251,191,36,0.3);
  }
  .btn-archive:hover { background: rgba(251,191,36,0.22); }
  ```

---

## Task 2: Filter Bulan/Tahun di Tab Keuangan

**Perubahan:**
- `admin.html`: Tambah dropdown bulan & tahun di view-finance header
- `admin.html`: Update `loadFinanceData()` untuk filter berdasarkan bulan/tahun yang dipilih
- `admin.html`: Stats card "Total Pendapatan" & "Produk Terjual" otomatis ikut filter

- [ ] **Step 1: Tambah HTML filter bulan/tahun di view-finance**

  Ubah `<div class="view-header">` di view-finance:
  ```html
  <div class="view-header">
    <div class="view-heading">Log Penjualan</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <select class="history-filter-select" id="fin-month-filter">
        <option value="">Semua Bulan</option>
        <option value="1">Januari</option>
        <option value="2">Februari</option>
        <option value="3">Maret</option>
        <option value="4">April</option>
        <option value="5">Mei</option>
        <option value="6">Juni</option>
        <option value="7">Juli</option>
        <option value="8">Agustus</option>
        <option value="9">September</option>
        <option value="10">Oktober</option>
        <option value="11">November</option>
        <option value="12">Desember</option>
      </select>
      <select class="history-filter-select" id="fin-year-filter">
        <!-- diisi dinamis oleh JS -->
      </select>
      <button class="btn btn-secondary btn-sm" id="btn-print-finance">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Cetak
      </button>
    </div>
  </div>
  ```

- [ ] **Step 2: Update loadFinanceData() untuk populate tahun dan filter**

  Setelah cleanup, tambah logika filter:
  ```js
  // Populate year dropdown dinamis
  var yearSelect = document.getElementById('fin-year-filter');
  if (yearSelect.options.length <= 1) {
    var currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="">Semua Tahun</option>';
    for (var y = currentYear; y >= currentYear - 3; y--) {
      yearSelect.innerHTML += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
    }
  }

  // Build filter untuk query sales_log
  var selMonth = document.getElementById('fin-month-filter').value;
  var selYear  = document.getElementById('fin-year-filter').value;
  var logQuery = _sb.from('sales_log').select('*').order('sold_at', { ascending: false });
  if (selYear) {
    var yStart = selYear + '-01-01T00:00:00.000Z';
    var yEnd   = selYear + '-12-31T23:59:59.999Z';
    logQuery = logQuery.gte('sold_at', yStart).lte('sold_at', yEnd);
  }
  var result = await logQuery;
  ```
  
  Lalu di client-side filter berdasarkan bulan jika `selMonth`:
  ```js
  var logs = (result.data || []).filter(function(l) {
    if (!selMonth) return true;
    return new Date(l.sold_at).getMonth() + 1 === parseInt(selMonth);
  });
  ```

- [ ] **Step 3: Tambah event listener filter**

  ```js
  document.getElementById('fin-month-filter').addEventListener('change', loadFinanceData);
  document.getElementById('fin-year-filter').addEventListener('change', loadFinanceData);
  ```

---

## Task 3: Cetak / Export PDF Laporan Keuangan

**Perubahan:**
- `admin.html`: Load jsPDF dari CDN di `<head>`
- `admin.html`: Fungsi `printFinanceReport()` — generate PDF dengan nama toko, periode, tabel penjualan, total

- [ ] **Step 1: Tambah jsPDF CDN di `<head>`**

  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  ```

- [ ] **Step 2: Tambah fungsi printFinanceReport()**

  ```js
  async function printFinanceReport() {
    var selMonth = document.getElementById('fin-month-filter').value;
    var selYear  = document.getElementById('fin-year-filter').value;
    var bulanNames = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    var periodeLabel = (selMonth ? bulanNames[parseInt(selMonth)] + ' ' : 'Semua Bulan · ') + (selYear || 'Semua Tahun');

    // Ambil data dari DOM yang sudah dirender
    var rows = [];
    document.querySelectorAll('#finance-tbody tr[data-log-id]').forEach(function(tr) {
      var cells = tr.querySelectorAll('td');
      rows.push({
        name:  cells[0] ? cells[0].textContent.trim() : '',
        price: cells[2] ? cells[2].textContent.trim() : '',
        date:  cells[3] ? cells[3].textContent.trim() : ''
      });
    });

    var total = document.getElementById('fin-total-revenue').textContent;
    var count = document.getElementById('fin-sold-count').textContent;

    var { jsPDF } = window.jspdf;
    var doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN PENJUALAN SENTRAQ', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Periode: ' + periodeLabel, 105, 30, { align: 'center' });
    doc.text('Dicetak: ' + new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }), 105, 37, { align: 'center' });

    // Garis
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Tabel header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('No', 14, 50);
    doc.text('Nama Produk', 24, 50);
    doc.text('Harga Aktual', 130, 50);
    doc.text('Tanggal Terjual', 165, 50);
    doc.line(14, 53, 196, 53);

    // Tabel isi
    doc.setFont('helvetica', 'normal');
    var y = 60;
    rows.forEach(function(r, i) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(String(i + 1), 14, y);
      doc.text(r.name.substring(0, 40), 24, y);
      doc.text(r.price, 130, y);
      doc.text(r.date, 165, y);
      y += 8;
    });

    // Garis penutup
    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text('Total: ' + count + ' produk', 14, y);
    doc.text(total, 165, y);

    doc.save('Laporan-Penjualan-Sentraq-' + periodeLabel.replace(/ /g, '-') + '.pdf');
  }
  ```

- [ ] **Step 3: Tambah event listener tombol Cetak**

  ```js
  document.getElementById('btn-print-finance').addEventListener('click', printFinanceReport);
  ```

---

## Task 4: Perbaikan Tab Riwayat (Full Activity Log — Opsi B)

**Perubahan:**
- `admin.html`: Tambah event type `archived` ke `eventMeta`
- `admin.html`: Pastikan semua aksi (tambah/edit/status/hapus/arsip) tercatat dan ditampilkan dengan benar
- `admin.html`: Update filter dropdown agar include opsi "Diarsipkan"
- `assets/css/admin.css`: Pastikan semua warna badge event type tampil benar

- [ ] **Step 1: Update filter dropdown di view-history HTML**

  Tambah opsi archived:
  ```html
  <option value="archived">Produk Diarsipkan</option>
  ```

- [ ] **Step 2: Pastikan eventMeta lengkap di loadHistoryData()**

  ```js
  var eventMeta = {
    created:        { icon: 'M12 5v14M5 12l7-7 7 7',   color: 'success', label: 'Ditambahkan' },
    updated:        { icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z', color: 'accent', label: 'Diperbarui' },
    status_changed: { icon: 'M4 4v5h.582M20 20v-5h-.581M5.077 9A9 9 0 0 1 19.938 15M4.062 9A9 9 0 0 0 18.938 15', color: 'warning', label: 'Status Berubah' },
    deleted:        { icon: 'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', color: 'danger', label: 'Dihapus' },
    archived:       { icon: 'M21 8v13H3V8M23 3H1v5h22V3zM10 12h4', color: 'warning', label: 'Diarsipkan' },
  };
  ```

- [ ] **Step 3: Update hstat counts agar include archived**

  ```js
  document.getElementById('hstat-total').textContent   = logs.length;
  document.getElementById('hstat-created').textContent = logs.filter(function(l){ return l.event_type==='created'; }).length;
  document.getElementById('hstat-status').textContent  = logs.filter(function(l){ return l.event_type==='status_changed'; }).length;
  document.getElementById('hstat-deleted').textContent = logs.filter(function(l){ return l.event_type==='deleted' || l.event_type==='archived'; }).length;
  ```

---

## Urutan Eksekusi

1. Jalankan SQL migration dulu
2. Task 1 (Arsip) → Test: tambah produk, set sold, klik Arsipkan, pastikan hilang dari list dan muncul di Riwayat
3. Task 2 (Filter Keuangan) → Test: ganti bulan, pastikan data ter-filter
4. Task 3 (Cetak PDF) → Test: klik Cetak, pastikan PDF terdownload dengan data yang benar
5. Task 4 (Riwayat cleanup) → Test: semua aksi tercatat di Riwayat dengan label yang benar
