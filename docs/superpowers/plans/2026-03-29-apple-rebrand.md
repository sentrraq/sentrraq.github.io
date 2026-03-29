# Sentraq Apple-Style Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite Sentraq's catalog website from a dark neon-gamer aesthetic into a clean Apple Store–style design — light background, SF Pro system font, Apple Blue `#0071e3` accent, bilingual Indonesian + English content, and a filterable product grid.

**Architecture:** Three plain static files — `index.html`, `style.css`, `script.js` — rewritten completely. No build tools, no frameworks, no external CSS libraries. The JS is organized as named init functions called from one `DOMContentLoaded` listener. HTML drives filtering via `data-category` attributes on product cards.

**Tech Stack:** HTML5, CSS3 (custom properties + Grid + media queries), vanilla ES6 JavaScript, no dependencies.

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | All semantic markup: navbar, hero, filter bar, product cards, contact, footer |
| `style.css` | CSS custom properties, reset, typography, every component layout and visual style, all responsive breakpoints, animation classes |
| `script.js` | `initNavbar()`, `initFilterPills()`, `initSliders()`, `initAnimations()`, `initLazyImages()`, `setFooterYear()` |

---

## Task 1: CSS custom properties, reset, and base typography

**Files:**
- Create: `style.css`

- [ ] **Step 1: Create `style.css` with the full token set, reset, and base font**

```css
/* ===== TOKENS ===== */
:root {
  --bg-primary:     #ffffff;
  --bg-secondary:   #f5f5f7;
  --bg-tertiary:    #e8e8ed;
  --text-primary:   #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary:  #aeaeb2;
  --accent:         #0071e3;
  --accent-hover:   #0077ed;
  --accent-active:  #006edb;
  --border:         #d2d2d7;
  --border-light:   #e5e5e7;
  --shadow-card:    0 2px 8px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-nav:     0 1px 0 rgba(0,0,0,0.08);
  --radius-card:    16px;
  --radius-pill:    980px;
}

/* ===== RESET ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
               "Helvetica Neue", Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
}

ul, ol {
  list-style: none;
}

/* ===== SKIP LINK ===== */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent);
  color: #fff;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  border-radius: 0 0 8px 0;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}
```

- [ ] **Step 2: Create placeholder `index.html` to verify CSS loads**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sentraq</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <p style="font-size:17px;color:var(--text-secondary);padding:32px">CSS loaded — tokens and reset working.</p>
</body>
</html>
```

- [ ] **Step 3: Open `index.html` in browser and verify**

Open the file directly (`open index.html` on macOS or drag into browser). Confirm:
- Background is white
- The paragraph text renders in the system font (no serifs)
- Text color is `#6e6e73` (medium gray)
- No horizontal scrollbar

- [ ] **Step 4: Commit**

```bash
git add style.css index.html
git commit -m "feat: add CSS tokens, reset, and base typography"
```

---

## Task 2: HTML skeleton — all sections, no content yet

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `index.html` with the full semantic skeleton**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sentraq — Premium Pre-Owned Electronics. MacBook, iPhone, iPad second berkualitas dengan garansi. Jakarta, Indonesia.">
  <meta name="keywords" content="laptop second, macbook bekas, iphone second, elektronik second, gadget bekas, sentraq">
  <meta name="author" content="Sentraq">
  <meta property="og:title" content="Sentraq — Premium Pre-Owned Electronics">
  <meta property="og:description" content="MacBook, iPhone, iPad second berkualitas dengan garansi resmi">
  <meta property="og:url" content="https://sentraq.github.io">
  <title>Sentraq — Premium Pre-Owned Electronics</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <a href="#main" class="skip-link">Skip to main content</a>

  <!-- NAVBAR -->
  <header class="navbar" role="banner">
    <div class="navbar-inner">
      <a class="navbar-wordmark" href="#" aria-label="Sentraq — Home">Sentraq</a>
      <nav class="navbar-links" aria-label="Main navigation">
        <a href="#products" data-filter-nav="macbook">MacBook</a>
        <a href="#products" data-filter-nav="iphone">iPhone</a>
        <a href="#products" data-filter-nav="ipad">iPad</a>
        <a href="#contact">Tentang Kami</a>
      </nav>
      <div class="navbar-actions">
        <a href="#contact" class="btn btn-primary btn-sm">Hubungi Kami</a>
        <button class="hamburger" aria-label="Buka menu" aria-expanded="false" aria-controls="mobile-nav">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-hidden="true">
      <a href="#products" data-filter-nav="macbook">MacBook</a>
      <a href="#products" data-filter-nav="iphone">iPhone</a>
      <a href="#products" data-filter-nav="ipad">iPad</a>
      <a href="#contact">Tentang Kami</a>
      <a href="#contact" class="btn btn-primary">Hubungi Kami</a>
    </nav>
  </header>

  <main id="main">

    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-inner">
        <p class="eyebrow">Premium Pre-Owned Electronics · Jakarta</p>
        <h1 id="hero-heading">
          Gadget terbaik.<br>
          <span class="accent">Harga terjangkau.</span>
        </h1>
        <p class="hero-sub">MacBook, iPhone, dan iPad bekas berkualitas tinggi — dikurasi, diperiksa, dan bergaransi.</p>
        <p class="hero-sub-en">Premium pre-owned devices, curated and tested.</p>
        <div class="hero-ctas">
          <a href="#products" class="btn btn-primary">Lihat Produk</a>
          <a href="https://wa.me/6285716577307" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp</a>
        </div>
      </div>
    </section>

    <!-- FILTER BAR -->
    <div class="filter-bar" role="tablist" aria-label="Filter produk">
      <button class="filter-pill active" data-filter="all" role="tab" aria-selected="true">All</button>
      <button class="filter-pill" data-filter="macbook" role="tab" aria-selected="false">MacBook</button>
      <button class="filter-pill" data-filter="iphone" role="tab" aria-selected="false">iPhone</button>
      <button class="filter-pill" data-filter="ipad" role="tab" aria-selected="false">iPad</button>
      <button class="filter-pill" data-filter="laptop" role="tab" aria-selected="false">Laptop</button>
    </div>

    <!-- PRODUCT GRID -->
    <section id="products" class="products" aria-label="Daftar produk">
      <div class="product-grid">
        <!-- cards inserted in Task 12 -->
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="contact" aria-labelledby="contact-heading">
      <div class="contact-inner">
        <p class="eyebrow">Hubungi Kami · Get in Touch</p>
        <h2 id="contact-heading">Siap membantu kamu.</h2>
        <p class="contact-sub">Tanya produk, harga, atau kondisi barang — kami respon cepat.</p>
        <p class="contact-sub-en">Ask us anything — fast responses guaranteed.</p>
        <div class="contact-cards">

          <a class="contact-card" href="https://wa.me/6285716577307" target="_blank" rel="noopener noreferrer" aria-label="Hubungi via WhatsApp">
            <div class="contact-icon contact-icon--whatsapp" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <h3 class="contact-name">WhatsApp</h3>
            <p class="contact-detail">+62 857-1657-7307</p>
            <span class="btn btn-primary btn-sm">Chat Sekarang</span>
          </a>

          <a class="contact-card" href="https://instagram.com/sentraq.id" target="_blank" rel="noopener noreferrer" aria-label="Ikuti di Instagram">
            <div class="contact-icon contact-icon--instagram" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </div>
            <h3 class="contact-name">Instagram</h3>
            <p class="contact-detail">@sentraq.id</p>
            <span class="btn btn-primary btn-sm">Follow</span>
          </a>

          <a class="contact-card" href="mailto:sentraq3@gmail.com" aria-label="Kirim email">
            <div class="contact-icon contact-icon--email" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <h3 class="contact-name">Email</h3>
            <p class="contact-detail">sentraq3@gmail.com</p>
            <span class="btn btn-primary btn-sm">Kirim Email</span>
          </a>

        </div>
        <p class="contact-hours">Senin–Jumat, 09.00–17.00 WIB · Mon–Fri, 9AM–5PM Jakarta</p>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="footer" role="contentinfo">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <p class="footer-wordmark">Sentraq</p>
          <p class="footer-desc">Premium pre-owned electronics.<br>Jakarta, Indonesia.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <p class="footer-col-label">Produk</p>
            <ul>
              <li><a href="#products" data-filter-nav="macbook">MacBook</a></li>
              <li><a href="#products" data-filter-nav="iphone">iPhone</a></li>
              <li><a href="#products" data-filter-nav="ipad">iPad</a></li>
              <li><a href="#products" data-filter-nav="laptop">Laptop</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <p class="footer-col-label">Ikuti Kami</p>
            <ul>
              <li><a href="https://wa.me/6285716577307" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href="https://instagram.com/sentraq.id" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="mailto:sentraq3@gmail.com">Email</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© <span class="footer-year"></span> Sentraq Indonesia. All rights reserved.</p>
        <p class="footer-copy">Jakarta · sentraq3@gmail.com</p>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify structure**

Open `index.html`. Confirm:
- Page has unstyled but semantically correct sections top to bottom: navbar, hero, filter bar, empty product grid, contact (3 cards), footer
- No console errors (script.js does not exist yet — that's fine, this just confirms HTML parses)
- All links render as plain text links

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add full HTML skeleton with all sections"
```

---

## Task 3: CSS — button system + navbar

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append button system and navbar styles to `style.css`**

```css
/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease, opacity 0.15s ease;
  padding: 12px 24px;
  white-space: nowrap;
}
.btn-primary {
  background: var(--accent);
  color: #ffffff;
}
.btn-primary:hover  { background: var(--accent-hover); }
.btn-primary:active { background: var(--accent-active); }
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.btn-secondary:hover { background: #ebebf0; }
.btn-sm {
  padding: 6px 16px;
  font-size: 12px;
}
.btn-full {
  width: 100%;
}

/* ===== NAVBAR ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}
.navbar.scrolled {
  border-bottom-color: var(--border);
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 48px;
  max-width: 1200px;
  margin: 0 auto;
}
.navbar-wordmark {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  flex-shrink: 0;
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 28px;
}
.navbar-links a {
  font-size: 13px;
  color: var(--text-primary);
  transition: opacity 0.15s ease;
}
.navbar-links a:hover {
  opacity: 0.6;
}
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}
.hamburger span {
  display: block;
  width: 18px;
  height: 1.5px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
/* Hamburger → X when open */
.navbar.nav-open .hamburger span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.navbar.nav-open .hamburger span:nth-child(2) {
  opacity: 0;
}
.navbar.nav-open .hamburger span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* Mobile nav dropdown */
.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 8px 24px 20px;
  border-top: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.navbar.nav-open .mobile-nav {
  display: flex;
}
.mobile-nav a {
  font-size: 17px;
  color: var(--text-primary);
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}
.mobile-nav a:last-child {
  border-bottom: none;
  margin-top: 8px;
  align-self: flex-start;
}
.mobile-nav a:hover {
  color: var(--accent);
}
```

- [ ] **Step 2: Open browser and verify navbar**

Reload `index.html`. Confirm:
- Navbar sticks to top when scrolling
- "Sentraq" wordmark appears bold on the left
- Nav links appear centered
- "Hubungi Kami" blue pill button on the right
- Glass/blur effect visible over white page background

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add button system and navbar styles"
```

---

## Task 4: CSS — hero section + filter bar

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append hero and filter bar styles to `style.css`**

```css
/* ===== EYEBROW LABEL ===== */
.eyebrow {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* ===== HERO ===== */
.hero {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: 80px 48px;
}
.hero-inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.hero h1 {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--text-primary);
  margin-bottom: 20px;
}
.hero h1 .accent {
  color: var(--accent);
}
.hero-sub {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 4px;
}
.hero-sub-en {
  font-size: 13px;
  color: var(--text-tertiary);
  font-style: italic;
  margin-top: 6px;
}
.hero-ctas {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 32px;
}

/* ===== FILTER BAR ===== */
.filter-bar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: 16px 48px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  position: sticky;
  top: 48px;
  z-index: 90;
}
.filter-pill {
  padding: 6px 18px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.filter-pill:hover:not(.active) {
  background: var(--bg-secondary);
  border-color: #c7c7cc;
}
.filter-pill.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}
```

- [ ] **Step 2: Verify in browser**

Reload. Confirm:
- Hero has large heading — "Gadget terbaik." black, "Harga terjangkau." in blue
- Smaller gray subtitle below, tiny italic EN translation
- Two CTA buttons: blue "Lihat Produk" and gray "Hubungi via WhatsApp"
- Filter bar sticks just below navbar when scrolling through the page
- "All" pill is blue (active), others are white with border

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add hero and filter bar styles"
```

---

## Task 5: CSS — product grid and product card

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append product section, grid, and card styles to `style.css`**

```css
/* ===== PRODUCTS SECTION ===== */
.products {
  background: var(--bg-secondary);
  padding: 40px 48px 64px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== PRODUCT CARD ===== */
.product-card {
  background: var(--bg-primary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* fade-up initial state — animated in by JS */
  opacity: 0;
  transform: translateY(20px);
}
.product-card.visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.4s ease, transform 0.4s ease,
              box-shadow 0.2s ease; /* keep hover transition */
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
/* Hidden by filter */
.product-card.hidden {
  display: none;
}

/* Card image slider area */
.card-slider {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
  aspect-ratio: 4 / 3;
}
.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
  will-change: transform;
}
.slide {
  flex: 0 0 100%;
  height: 100%;
}
.slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  background: var(--bg-tertiary);
}
/* Placeholder when no image */
.slide-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

/* Slider arrows */
.slider-prev,
.slider-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 2;
}
.slider-prev { left: 8px; }
.slider-next { right: 8px; }
.card-slider:hover .slider-prev,
.card-slider:hover .slider-next {
  opacity: 1;
}
.slider-prev:disabled,
.slider-next:disabled {
  opacity: 0 !important;
}

/* Slider dots */
.slider-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 2;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.15s ease;
  cursor: pointer;
}
.dot.active {
  background: var(--accent);
}
/* Hide dots on single-image cards */
.card-slider[data-single] .slider-dots,
.card-slider[data-single] .slider-prev,
.card-slider[data-single] .slider-next {
  display: none;
}

/* Card body */
.card-body {
  padding: 14px 16px 16px;
}
.card-category {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.3;
}
.card-specs {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.4;
}
.card-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 12px;
}
```

- [ ] **Step 2: Add a temporary product card to verify styles**

In `index.html`, inside `.product-grid`, add one test card:

```html
<article class="product-card visible" data-category="macbook" aria-label="Test MacBook">
  <div class="card-slider" data-single>
    <div class="slider-track">
      <div class="slide">
        <div class="slide-placeholder">💻</div>
      </div>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">MacBook</p>
    <h3 class="card-title">MacBook Pro 2020 i5</h3>
    <p class="card-specs">16GB RAM · 512GB SSD · Space Gray</p>
    <p class="card-price">Rp 7.500.000</p>
    <a href="#" class="btn btn-primary btn-full btn-sm">Hubungi Kami</a>
  </div>
</article>
```

- [ ] **Step 3: Verify in browser**

Reload. Confirm:
- Product card renders as white rounded tile on gray background
- Emoji placeholder fills the top image area (4:3 ratio)
- Card category in small gray uppercase text
- Product title bold, specs gray, price in blue
- Full-width blue "Hubungi Kami" button at the bottom
- Hovering card gives a subtle lift + deeper shadow

- [ ] **Step 4: Remove the test card** (it will be replaced in Task 12)

Delete the `<article>` block added in Step 2 from `index.html`.

- [ ] **Step 5: Commit**

```bash
git add style.css index.html
git commit -m "feat: add product grid and card styles"
```

---

## Task 6: CSS — contact section and footer

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append contact and footer styles to `style.css`**

```css
/* ===== CONTACT SECTION ===== */
.contact {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  padding: 80px 48px;
}
.contact-inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.contact h2 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.contact-sub {
  font-size: 17px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.contact-sub-en {
  font-size: 13px;
  color: var(--text-tertiary);
  font-style: italic;
  margin-top: 6px;
}
.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 40px;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}
.contact-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-card);
  padding: 28px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text-primary);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* fade-up initial state */
  opacity: 0;
  transform: translateY(20px);
}
.contact-card.visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.4s ease, transform 0.4s ease,
              box-shadow 0.2s ease;
}
.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.contact-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.contact-icon--whatsapp  { background: #25d366; }
.contact-icon--instagram {
  background: linear-gradient(135deg,
    #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}
.contact-icon--email { background: var(--accent); }

.contact-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.contact-detail {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.contact-hours {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 32px;
}

/* ===== FOOTER ===== */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 48px 24px;
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.footer-wordmark {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.footer-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 180px;
}
.footer-links {
  display: flex;
  gap: 48px;
}
.footer-col-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer-col a {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}
.footer-col a:hover {
  color: var(--accent);
}
.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.footer-copy {
  font-size: 11px;
  color: var(--text-tertiary);
}
```

- [ ] **Step 2: Verify in browser**

Reload. Confirm:
- Contact section has white background, centered heading
- Three cards side by side: WhatsApp (green icon), Instagram (gradient icon), Email (blue icon)
- Each card has brand icon, name, detail, and blue button
- Business hours line in light gray below cards
- Footer has Sentraq wordmark + description on left, two link columns on right
- Bottom bar shows copyright in muted gray

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add contact section and footer styles"
```

---

## Task 7: CSS — responsive breakpoints

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append all media queries to `style.css`**

```css
/* ===== RESPONSIVE ===== */

/* Tablet: 768–1023px */
@media (max-width: 1023px) {
  .navbar-inner { padding: 0 24px; }
  .navbar-links { display: none; }
  .hamburger    { display: flex; }

  .hero         { padding: 56px 32px; }
  .hero h1      { font-size: 36px; }
  .hero-sub     { font-size: 15px; }

  .filter-bar   { padding: 14px 24px; }

  .products     { padding: 32px 24px 48px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }

  .contact      { padding: 56px 24px; }
  .contact-cards { grid-template-columns: repeat(3, 1fr); }

  .footer-inner { padding: 32px 24px 20px; }
}

/* Mobile: < 768px */
@media (max-width: 767px) {
  .navbar-inner { padding: 0 20px; }

  .hero         { padding: 48px 20px; }
  .hero h1      { font-size: 28px; }
  .hero-sub     { font-size: 15px; }
  .hero-ctas    { flex-direction: column; align-items: center; }
  .hero-ctas .btn { width: 100%; max-width: 300px; }

  .filter-bar   { padding: 12px 16px; top: 48px; }
  .filter-pill  { font-size: 12px; padding: 5px 14px; }

  .products     { padding: 24px 12px 40px; }
  .product-grid { grid-template-columns: 1fr; }

  .contact      { padding: 48px 20px; }
  .contact h2   { font-size: 26px; }
  .contact-cards {
    grid-template-columns: 1fr;
    max-width: 320px;
  }

  .footer-inner { padding: 28px 20px 16px; }
  .footer-top   { flex-direction: column; }
  .footer-links { gap: 32px; }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* Small mobile: < 480px */
@media (max-width: 479px) {
  .hero h1 { font-size: 24px; }
  .filter-bar { gap: 6px; }
}
```

- [ ] **Step 2: Verify responsive behavior**

Open browser DevTools (F12), toggle device toolbar, test at:
- **375px** (mobile): single column grid, hamburger visible, hero CTA buttons stack vertically
- **768px** (tablet): two column grid, hamburger still showing
- **1024px** (desktop): three column grid, full nav links visible, no hamburger

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add responsive breakpoints for tablet and mobile"
```

---

## Task 8: JS — init shell + `initNavbar()`

**Files:**
- Create: `script.js`

- [ ] **Step 1: Create `script.js` with init shell and `initNavbar()`**

```javascript
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  initNavbar();
  initFilterPills();
  initSliders();
  initAnimations();
  initLazyImages();
});

/* ===== FOOTER YEAR ===== */
function setFooterYear() {
  const el = document.querySelector('.footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Add .scrolled border on scroll
  function onScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  const hamburger = navbar.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    navbar.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navbar.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navbar.classList.contains('nav-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (navbar.classList.contains('nav-open') &&
        !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Close on mobile nav link click
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
}
```

- [ ] **Step 2: Verify in browser**

Reload. Open DevTools console — confirm no errors. Then:
- Scroll down: navbar should get a subtle border bottom
- On mobile width (≤ 1023px): click hamburger — mobile nav slides open; links visible; click outside or press Escape — it closes
- Footer copyright year shows current year

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: add JS init shell, setFooterYear, and initNavbar"
```

---

## Task 9: JS — `initFilterPills()` + nav filter links

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `initFilterPills()` to `script.js` (append before the final closing)**

```javascript
/* ===== FILTER PILLS ===== */
function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.product-card');
  if (!pills.length) return;

  function applyFilter(filter) {
    // Update pill states
    pills.forEach(function (pill) {
      const isActive = pill.dataset.filter === filter;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', String(isActive));
    });

    // Show / hide cards
    cards.forEach(function (card) {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      applyFilter(this.dataset.filter);
    });
  });

  // Navbar + footer links that carry data-filter-nav attribute
  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const filter = this.dataset.filterNav;
      applyFilter(filter);
      // Smooth scroll to product grid
      const section = document.getElementById('products');
      if (section) {
        const offset = 48 + 49; // navbar + filter bar height
        const top = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}
```

- [ ] **Step 2: Add test cards temporarily to verify filter**

In `index.html`, add two test cards inside `.product-grid`:

```html
<article class="product-card visible" data-category="macbook" aria-label="Test MacBook">
  <div class="card-slider" data-single>
    <div class="slider-track">
      <div class="slide"><div class="slide-placeholder">💻</div></div>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">MacBook</p>
    <h3 class="card-title">MacBook Pro 2020</h3>
    <p class="card-specs">16GB · 512GB</p>
    <p class="card-price">Rp 7.500.000</p>
    <a href="#" class="btn btn-primary btn-full btn-sm">Hubungi Kami</a>
  </div>
</article>

<article class="product-card visible" data-category="laptop" aria-label="Test Laptop">
  <div class="card-slider" data-single>
    <div class="slider-track">
      <div class="slide"><div class="slide-placeholder">🖥️</div></div>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">Laptop</p>
    <h3 class="card-title">HP OMEN Gaming</h3>
    <p class="card-specs">16GB · 512GB · RTX 3060</p>
    <p class="card-price">Rp 15.500.000</p>
    <a href="#" class="btn btn-primary btn-full btn-sm">Hubungi Kami</a>
  </div>
</article>
```

- [ ] **Step 3: Verify filter behavior**

Reload. Click filter pills:
- "MacBook" → only MacBook card visible, Laptop card gone
- "Laptop" → only Laptop card visible
- "All" → both cards visible
- Clicking "MacBook" in navbar should scroll to products and activate the MacBook filter

- [ ] **Step 4: Remove test cards** (will be replaced in Task 12)

Delete the two `<article>` blocks added in Step 2.

- [ ] **Step 5: Commit**

```bash
git add script.js index.html
git commit -m "feat: add filter pills and nav filter link behavior"
```

---

## Task 10: JS — `initSliders()`

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `initSliders()` to `script.js`**

```javascript
/* ===== SLIDERS ===== */
function initSliders() {
  document.querySelectorAll('.product-card').forEach(function (card) {
    const track  = card.querySelector('.slider-track');
    const slides = card.querySelectorAll('.slide');
    const prev   = card.querySelector('.slider-prev');
    const next   = card.querySelector('.slider-next');
    const dots   = card.querySelectorAll('.dot');
    const total  = slides.length;

    if (!track || total === 0) return;

    // Single image: mark and return (CSS hides controls)
    if (total === 1) {
      const sliderEl = card.querySelector('.card-slider');
      if (sliderEl) sliderEl.setAttribute('data-single', '');
      return;
    }

    let current = 0;

    function goTo(index) {
      current = Math.max(0, Math.min(index, total - 1));
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === total - 1;
    }

    if (prev) prev.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      goTo(current - 1);
    });
    if (next) next.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      goTo(current + 1);
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        goTo(i);
      });
    });

    // Touch / mouse swipe
    var startX = 0;
    var threshold = 50;
    var sliderArea = card.querySelector('.card-slider');

    if (sliderArea) {
      sliderArea.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      sliderArea.addEventListener('touchend', function (e) {
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > threshold) goTo(diff > 0 ? current + 1 : current - 1);
      }, { passive: true });

      var mouseDown = 0;
      sliderArea.addEventListener('mousedown', function (e) { mouseDown = e.clientX; });
      sliderArea.addEventListener('mouseup', function (e) {
        var diff = mouseDown - e.clientX;
        if (Math.abs(diff) > threshold) goTo(diff > 0 ? current + 1 : current - 1);
      });
    }

    // Keyboard when slider is focused
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Product image carousel');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    goTo(0); // init state
  });
}
```

- [ ] **Step 2: Add a multi-image test card**

In `index.html` `.product-grid`, add one test card with two slides:

```html
<article class="product-card visible" data-category="macbook" aria-label="Test slider">
  <div class="card-slider">
    <div class="slider-track">
      <div class="slide"><div class="slide-placeholder">💻</div></div>
      <div class="slide"><div class="slide-placeholder">🖥️</div></div>
    </div>
    <button class="slider-prev" aria-label="Previous image">‹</button>
    <button class="slider-next" aria-label="Next image">›</button>
    <div class="slider-dots">
      <span class="dot active"></span>
      <span class="dot"></span>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">MacBook</p>
    <h3 class="card-title">Slider test</h3>
    <p class="card-specs">2 slides</p>
    <p class="card-price">Rp 0</p>
    <a href="#" class="btn btn-primary btn-full btn-sm">Hubungi Kami</a>
  </div>
</article>
```

- [ ] **Step 3: Verify slider behavior**

Reload. Hover over the test card:
- Left/right arrows appear on hover
- Click next arrow → image slides to second emoji; first dot loses active, second dot gains active; next arrow becomes disabled
- Click prev arrow → slides back; prev arrow becomes disabled
- Click a dot → navigates to that slide
- On mobile (DevTools): swipe left/right should change slides

- [ ] **Step 4: Remove test card**

Delete the `<article>` block added in Step 2.

- [ ] **Step 5: Commit**

```bash
git add script.js index.html
git commit -m "feat: add product image slider with touch and keyboard support"
```

---

## Task 11: JS — `initAnimations()` + `initLazyImages()`

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add `initAnimations()` and `initLazyImages()` to `script.js`**

```javascript
/* ===== FADE-UP ANIMATIONS ===== */
function initAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: make everything visible immediately
    document.querySelectorAll('.product-card, .contact-card').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.product-card, .contact-card').forEach(function (el, i) {
    // Stagger delay via inline style — capped so it never feels too slow
    var delay = Math.min(i * 0.05, 0.3);
    el.style.transitionDelay = delay + 's';
    observer.observe(el);
  });
}

/* ===== LAZY IMAGES ===== */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load all immediately
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  var imgObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('img[data-src]').forEach(function (img) {
    imgObserver.observe(img);
  });
}
```

- [ ] **Step 2: Verify in browser**

Add two test product cards (with class `product-card` but **not** `visible`) to `.product-grid` temporarily:

```html
<article class="product-card" data-category="macbook" aria-label="Anim test 1">
  <div class="card-slider" data-single>
    <div class="slider-track">
      <div class="slide"><div class="slide-placeholder">💻</div></div>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">MacBook</p>
    <h3 class="card-title">Animation test</h3>
    <p class="card-specs">Test</p>
    <p class="card-price">Rp 0</p>
    <a href="#" class="btn btn-primary btn-full btn-sm">Test</a>
  </div>
</article>
```

Reload. Scroll down to product grid — card should fade up from below as it enters the viewport. No console errors.

- [ ] **Step 3: Remove test cards**

Delete the test `<article>` blocks.

- [ ] **Step 4: Commit**

```bash
git add script.js index.html
git commit -m "feat: add scroll-triggered fade-up animations and lazy image loading"
```

---

## Task 12: HTML — all product cards with real content

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the empty `.product-grid` with all product cards**

Replace `<div class="product-grid"></div>` with the following. WhatsApp `text` params are URL-encoded per product.

```html
<div class="product-grid">

  <!-- MacBook Pro 2020 i5 -->
  <article class="product-card" data-category="macbook" aria-label="MacBook Pro 2020 i5 16GB 512GB">
    <div class="card-slider">
      <div class="slider-track">
        <div class="slide">
          <img data-src="images/products/Macbook Pro 2020 i5 (1).jpeg" alt="MacBook Pro 2020 i5 — tampak depan" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/Macbook Pro 2020 i5 (2).jpeg" alt="MacBook Pro 2020 i5 — tampak atas" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/Macbook Pro 2020 i5 (3).jpeg" alt="MacBook Pro 2020 i5 — tampak belakang" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/Macbook Pro 2020 i5 (4).jpeg" alt="MacBook Pro 2020 i5 — tampak samping" loading="lazy">
        </div>
      </div>
      <button class="slider-prev" aria-label="Foto sebelumnya">&#8249;</button>
      <button class="slider-next" aria-label="Foto berikutnya">&#8250;</button>
      <div class="slider-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
    <div class="card-body">
      <p class="card-category">MacBook</p>
      <h3 class="card-title">MacBook Pro 2020 i5</h3>
      <p class="card-specs">Intel Core i5 · 16GB RAM · 512GB SSD · Space Gray</p>
      <p class="card-price">Rp 7.500.000</p>
      <a href="https://wa.me/6285716577307?text=Halo%20Sentraq%2C%20saya%20tertarik%20dengan%20MacBook%20Pro%202020%20i5%2016GB%20512GB%20harga%20Rp%207.500.000"
         class="btn btn-primary btn-full btn-sm"
         target="_blank" rel="noopener noreferrer">Hubungi Kami</a>
    </div>
  </article>

  <!-- MacBook Pro 2018 Touchbar Silver -->
  <article class="product-card" data-category="macbook" aria-label="MacBook Pro 2018 Touchbar Silver 16GB 256GB">
    <div class="card-slider">
      <div class="slider-track">
        <div class="slide">
          <img data-src="images/products/MBPro2018 (1).jpg" alt="MacBook Pro 2018 Touchbar Silver — tampak depan" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/MBPro2018 (2).jpg" alt="MacBook Pro 2018 Touchbar Silver — tampak atas" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/MBPro2018 (3).jpg" alt="MacBook Pro 2018 Touchbar Silver — tampak belakang" loading="lazy">
        </div>
        <div class="slide">
          <img data-src="images/products/MBPro2018 (4).jpg" alt="MacBook Pro 2018 Touchbar Silver — tampak samping" loading="lazy">
        </div>
      </div>
      <button class="slider-prev" aria-label="Foto sebelumnya">&#8249;</button>
      <button class="slider-next" aria-label="Foto berikutnya">&#8250;</button>
      <div class="slider-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
    <div class="card-body">
      <p class="card-category">MacBook</p>
      <h3 class="card-title">MacBook Pro 2018 Touchbar Silver</h3>
      <p class="card-specs">Intel Core i5 · 16GB RAM · 256GB SSD NVMe · Silver</p>
      <p class="card-price">Rp 6.800.000</p>
      <a href="https://wa.me/6285716577307?text=Halo%20Sentraq%2C%20saya%20tertarik%20dengan%20MacBook%20Pro%202018%20Touchbar%20Silver%2016GB%20256GB%20harga%20Rp%206.800.000"
         class="btn btn-primary btn-full btn-sm"
         target="_blank" rel="noopener noreferrer">Hubungi Kami</a>
    </div>
  </article>

  <!-- HP OMEN Gaming Laptop -->
  <article class="product-card" data-category="laptop" aria-label="HP OMEN Gaming Laptop RTX 3060">
    <div class="card-slider" data-single>
      <div class="slider-track">
        <div class="slide">
          <div class="slide-placeholder">🖥️</div>
        </div>
      </div>
    </div>
    <div class="card-body">
      <p class="card-category">Laptop</p>
      <h3 class="card-title">HP OMEN Gaming Laptop</h3>
      <p class="card-specs">Intel Core i7 · 16GB RAM · 512GB SSD · RTX 3060</p>
      <p class="card-price">Rp 15.500.000</p>
      <a href="https://wa.me/6285716577307?text=Halo%20Sentraq%2C%20saya%20tertarik%20dengan%20HP%20OMEN%20Gaming%20Laptop%20RTX%203060%20harga%20Rp%2015.500.000"
         class="btn btn-primary btn-full btn-sm"
         target="_blank" rel="noopener noreferrer">Hubungi Kami</a>
    </div>
  </article>

</div>
```

> **Note for Sentraq:** Add more `<article>` cards following the same pattern. Use `data-category="iphone"` for iPhones and `data-category="ipad"` for iPads. Each card with multiple product images gets a `.slider-track` with `<img data-src="...">` slides, prev/next buttons, and matching dots. Single-image cards get `data-single` on `.card-slider` and no buttons/dots.

- [ ] **Step 2: Verify full page in browser**

Reload. Confirm:
- Three product cards appear in the grid, fading up on load
- Hover each card — lift effect works
- MacBook cards have 4-slide sliders; arrows appear on hover; HP OMEN has no slider controls (single image)
- Click "MacBook" filter pill — only MacBook cards show, HP OMEN hides; click "Laptop" — only HP OMEN shows; "All" shows all
- Click "Hubungi Kami" on a card — opens WhatsApp with pre-filled message in a new tab
- Clicking "MacBook" in the navbar scrolls to the grid and activates the MacBook filter

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add all product cards with sliders and WhatsApp deep links"
```

---

## Task 13: Final polish — `.gitignore`, meta, and full-page verification

**Files:**
- Create: `.gitignore`
- Modify: `index.html` (favicon fallback, OG image)

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
.superpowers/
*.log
```

- [ ] **Step 2: Full cross-browser verification checklist**

Open `index.html` and verify each item:

**Desktop (≥1024px):**
- [ ] Navbar sticky, glass blur, border appears on scroll
- [ ] Hero: large heading, blue accent word, bilingual subtitles, two CTA buttons
- [ ] Filter bar sticky below navbar, pills work (All / MacBook / iPhone / iPad / Laptop)
- [ ] Product grid: 3 columns, cards fade in, hover lift works
- [ ] Sliders: arrows on hover, dot navigation, touch drag
- [ ] WhatsApp links open correct pre-filled messages
- [ ] Contact cards: correct icon colors, hover lift
- [ ] Footer: wordmark, link columns, copyright year correct
- [ ] Clicking footer / nav links scrolls smoothly to section

**Mobile (375px):**
- [ ] Hamburger visible, desktop nav links hidden
- [ ] Hamburger opens/closes mobile nav with correct animation
- [ ] Hero CTAs stack vertically
- [ ] Product grid: 1 column
- [ ] Filter pills wrap and are tappable
- [ ] Contact cards stack vertically
- [ ] No horizontal overflow / scrollbar

**Accessibility:**
- [ ] Tab through page — all interactive elements receive focus
- [ ] Skip link appears on first Tab press
- [ ] Filter pills show `aria-selected` state in DevTools accessibility tree
- [ ] Image `alt` text present on all product images

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "feat: add .gitignore and complete final verification pass"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| CSS custom properties / tokens | Task 1 |
| Full HTML skeleton + accessibility | Task 2 |
| Button system | Task 3 |
| Navbar: glass, sticky, hamburger, scrolled border | Tasks 3 + 8 |
| Hero: bilingual, accent word, CTAs | Tasks 4 + 2 |
| Filter bar: sticky, pills, active state | Tasks 4 + 9 |
| Product grid: 3-col → 2-col → 1-col | Tasks 5 + 7 |
| Product card: image slider, specs, price, WA link | Tasks 5 + 10 + 12 |
| Contact section: 3 cards, brand icons, bilingual | Tasks 6 + 2 |
| Footer: wordmark, links, copyright year | Tasks 6 + 8 |
| Responsive breakpoints | Task 7 |
| Fade-up scroll animations | Tasks 5 (CSS) + 11 (JS) |
| Lazy image loading | Task 11 |
| Filter pills JS | Task 9 |
| Nav/footer links trigger filter + scroll | Task 9 |
| Slider: arrows, dots, touch, keyboard | Task 10 |
| Real product cards with WA deep links | Task 12 |
| .gitignore | Task 13 |

No gaps found.
