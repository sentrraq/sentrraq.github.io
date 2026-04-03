# Sentraq Website Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 bugs and add skeleton loading, filter pill bar with fade transitions, and SEO/social improvements to the Sentraq storefront.

**Architecture:** All changes are confined to three files — `index.html` (HTML structure + meta), `assets/css/style.css` (new component styles + bug fixes), `assets/js/script.js` (new helper functions + patched existing functions). A new `assets/og.svg` file provides the og:image for social sharing.

**Tech Stack:** Vanilla HTML/CSS/JS, no build tools, deployed on GitHub Pages.

---

## File Map

| File | What changes |
|------|-------------|
| `index.html` | Meta tags (og:image, og:locale, dns-prefetch), filter pill bar HTML |
| `assets/og.svg` | New: static SVG used as og:image |
| `assets/css/style.css` | Features padding fix, CSS formatting fix, skeleton styles, shimmer animation, filter pill styles, filter fade classes, error state style |
| `assets/js/script.js` | `escapeHtml()`, `renderSkeletons()`, `renderError()`, `initFilterBar()`, `injectJsonLd()`, updated `applyFilter()`, updated `renderProducts()`, updated `loadProducts()` |

---

## Task 1: CSS Bug Fixes

**Files:**
- Modify: `assets/css/style.css:581–584`

- [ ] **Step 1: Fix two rules on one line and missing features padding**

  Open `assets/css/style.css`. Find line 581 (inside `@media (max-width: 1023px)`). Replace:

  ```css
  .product-grid  { grid-template-columns: repeat(2, 1fr); }  .brand-statement { padding: 80px 32px; }
  .statement-text  { font-size: 34px; }

  .features        { padding: 0 28px 80px; }
  ```

  With:

  ```css
  .product-grid    { grid-template-columns: repeat(2, 1fr); }
  .brand-statement { padding: 80px 32px; }
  .statement-text  { font-size: 34px; }

  .features        { padding: 80px 28px 80px; }
  ```

- [ ] **Step 2: Verify in browser**

  Open `index.html` in a browser. Resize to ~900px wide. Scroll to the dark "Mengapa Sentraq" section. The eyebrow text should have 80px of visible space above it — not flush against the top border.

- [ ] **Step 3: Commit**

  ```bash
  git add assets/css/style.css
  git commit -m "fix: features section padding-top at tablet, split concatenated CSS rules"
  ```

---

## Task 2: og:image File + Head Meta Tags

**Files:**
- Create: `assets/og.svg`
- Modify: `index.html:6–16`

- [ ] **Step 1: Create assets/og.svg**

  Create `assets/og.svg`:

  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0071e3"/>
    <rect x="460" y="150" width="280" height="280" rx="64" fill="rgba(255,255,255,0.15)"/>
    <text x="548" y="390"
      font-family="-apple-system,Helvetica Neue,Arial,sans-serif"
      font-size="240" font-weight="700" fill="white">S</text>
    <text x="600" y="480" text-anchor="middle"
      font-family="-apple-system,Helvetica Neue,Arial,sans-serif"
      font-size="72" font-weight="700" fill="rgba(255,255,255,0.95)"
      letter-spacing="-1">Sentraq</text>
    <text x="600" y="542" text-anchor="middle"
      font-family="-apple-system,Helvetica Neue,Arial,sans-serif"
      font-size="32" fill="rgba(255,255,255,0.65)">Premium Pre-Owned Electronics · Jakarta</text>
  </svg>
  ```

  > Note: SVG og:image works on Telegram and most platforms. For maximum WhatsApp/Facebook compatibility a PNG is ideal, but requires a build tool to generate. SVG is used here since no build pipeline exists.

- [ ] **Step 2: Update meta tags in index.html head**

  Find the existing og: meta block (lines 9–13 of `index.html`). Replace the entire block:

  ```html
  <meta property="og:title" content="Sentraq — Premium Pre-Owned Electronics">
  <meta property="og:description" content="MacBook, iPhone, iPad second berkualitas — dikurasi, diperiksa, bergaransi.">
  <meta property="og:url" content="https://sentraq.github.io">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#ffffff">
  ```

  With:

  ```html
  <meta property="og:title" content="Sentraq — Premium Pre-Owned Electronics">
  <meta property="og:description" content="MacBook, iPhone, iPad second berkualitas — dikurasi, diperiksa, bergaransi.">
  <meta property="og:url" content="https://sentraq.github.io">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://sentraq.github.io/assets/og.svg">
  <meta property="og:image:type" content="image/svg+xml">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="id_ID">
  <meta name="theme-color" content="#ffffff">
  <link rel="dns-prefetch" href="https://raw.githubusercontent.com">
  ```

- [ ] **Step 3: Verify og.svg renders**

  Open `assets/og.svg` directly in a browser tab. Expected: blue 1200×630 card with white "S" lettermark and "Sentraq" wordmark.

- [ ] **Step 4: Commit**

  ```bash
  git add assets/og.svg index.html
  git commit -m "feat: add og:image SVG, og:locale, dns-prefetch for raw.githubusercontent.com"
  ```

---

## Task 3: XSS Fix — escapeHtml + buildCard

**Files:**
- Modify: `assets/js/script.js:7–8` (add helper after PRODUCTS_URL)
- Modify: `assets/js/script.js:126–187` (buildCard)

- [ ] **Step 1: Add escapeHtml helper**

  In `script.js`, find:

  ```js
  var PRODUCTS_URL = 'products.json';
  var WA_NUMBER    = '6285716577307';
  ```

  Replace with:

  ```js
  var PRODUCTS_URL = 'products.json';
  var WA_NUMBER    = '6285716577307';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  ```

- [ ] **Step 2: Rewrite the top of buildCard to compute safe values first**

  In `script.js`, find the start of `buildCard(p)`:

  ```js
  function buildCard(p) {
    var hasImages = p.images && p.images.length > 0;
    var icon = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default;
    var catLabel = { macbook: 'MacBook', iphone: 'iPhone', ipad: 'iPad', laptop: 'Laptop' };
    var badge = p.available
  ```

  Replace those opening lines with:

  ```js
  function buildCard(p) {
    var hasImages = p.images && p.images.length > 0;
    var icon = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default;
    var catLabel = { macbook: 'MacBook', iphone: 'iPhone', ipad: 'iPad', laptop: 'Laptop' };
    var safeName  = escapeHtml(p.name);
    var safeSpecs = escapeHtml(p.specs);
    var safeDesc  = p.description ? '<p class="card-desc">' + escapeHtml(p.description) + '</p>' : '';
    var safeCat   = escapeHtml(catLabel[p.category] || p.category);
    var badge = p.available
  ```

- [ ] **Step 3: Use safe values in the slider alt attribute**

  Find inside buildCard:

  ```js
  return '<div class="slide"><img data-src="' + url + '" alt="' + p.name + ' foto ' + (i + 1) + '" loading="lazy"></div>';
  ```

  Replace with:

  ```js
  return '<div class="slide"><img data-src="' + escapeHtml(url) + '" alt="' + safeName + ' foto ' + (i + 1) + '" loading="lazy"></div>';
  ```

- [ ] **Step 4: Use safe values in the card body**

  Find the `var descHTML` declaration and delete it:

  ```js
  var descHTML = p.description
    ? '<p class="card-desc">' + p.description + '</p>'
    : '';
  ```

  Then find the `article.setAttribute('aria-label', p.name)` line and replace it with:

  ```js
  article.setAttribute('aria-label', safeName);
  ```

  Then find inside the innerHTML array:

  ```js
  '<p class="card-category">' + (catLabel[p.category] || p.category) + badge + '</p>',
  '<h3 class="card-title">' + p.name + '</h3>',
  '<p class="card-specs">' + p.specs + '</p>',
  descHTML,
  ```

  Replace with:

  ```js
  '<p class="card-category">' + safeCat + badge + '</p>',
  '<h3 class="card-title">' + safeName + '</h3>',
  '<p class="card-specs">' + safeSpecs + '</p>',
  safeDesc,
  ```

- [ ] **Step 5: Verify in browser DevTools console**

  Open the page. In DevTools console paste:

  ```js
  var el = buildCard({name:'<b>bold</b>', category:'macbook', specs:'<script>alert(1)</script>', price:1000000, images:[], available:true, whatsapp:'test'});
  document.body.appendChild(el);
  ```

  Expected: the card renders with literal text `<b>bold</b>` and `<script>alert(1)</script>` visible as plain text. No bold formatting, no alert dialog, no script element inserted.

- [ ] **Step 6: Commit**

  ```bash
  git add assets/js/script.js
  git commit -m "fix: escape HTML in product card to prevent XSS"
  ```

---

## Task 4: Cache-Busting + Error State

**Files:**
- Modify: `assets/css/style.css` (add .products-error style after .products-empty)
- Modify: `assets/js/script.js:83–99` (loadProducts + new renderError)

- [ ] **Step 1: Add .products-error CSS**

  In `assets/css/style.css`, find the `.products-empty span` block. Add directly after the closing `}`:

  ```css
  /* Error state */
  .products-error {
    grid-column: 1 / -1;
    text-align: center;
    padding: 64px 24px;
    color: var(--text-2); font-size: 15px; line-height: 1.8;
  }
  .products-error .btn { margin-top: 16px; }
  ```

- [ ] **Step 2: Replace loadProducts and add renderError**

  In `script.js`, replace the entire `loadProducts` function:

  ```js
  /* ===== LOAD PRODUCTS ===== */
  function loadProducts() {
    renderSkeletons(3);
    fetch(PRODUCTS_URL + '?v=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(function (data) {
        allProducts = data.products || [];
        renderProducts(allProducts);
        injectJsonLd(allProducts);
        initAnimations();
      })
      .catch(function () {
        renderError();
      });
  }

  function renderError() {
    var grid = document.getElementById('product-grid');
    grid.querySelectorAll('.skeleton-card').forEach(function (el) { el.remove(); });
    var loading = document.getElementById('products-loading');
    if (loading) loading.style.display = 'none';
    var err = document.createElement('div');
    err.className = 'products-error';
    err.textContent = 'Gagal memuat produk. Periksa koneksi internet kamu.';
    var retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-secondary btn-sm';
    retryBtn.textContent = 'Coba Lagi';
    retryBtn.style.display = 'block';
    retryBtn.style.margin = '16px auto 0';
    retryBtn.addEventListener('click', function () {
      err.remove();
      loadProducts();
    });
    err.appendChild(retryBtn);
    grid.appendChild(err);
  }
  ```

  > `renderSkeletons` is added in Task 5. `injectJsonLd` is added in Task 8. If running this task alone, add temporary stubs: `function renderSkeletons(n){}` and `function injectJsonLd(p){}`.

- [ ] **Step 3: Verify cache-busting**

  DevTools → Network tab → reload. The `products.json` request URL must end with `?v=` followed by a 13-digit timestamp (e.g. `products.json?v=1775210000000`).

- [ ] **Step 4: Verify error state**

  In DevTools → Network → Block request URL → add `*products.json*`. Reload. Expected: skeletons appear briefly, then "Gagal memuat produk" text + "Coba Lagi" button. Clicking the button retries the fetch. Unblock the URL after testing.

- [ ] **Step 5: Commit**

  ```bash
  git add assets/css/style.css assets/js/script.js
  git commit -m "fix: cache-bust products.json fetch, replace stale fallback with error state + retry"
  ```

---

## Task 5: Skeleton Loading

**Files:**
- Modify: `assets/css/style.css` (add skeleton styles after .products-error)
- Modify: `assets/js/script.js` (add renderSkeletons, patch renderProducts)

- [ ] **Step 1: Add skeleton CSS**

  In `assets/css/style.css`, find the `.products-error .btn` rule added in Task 4. Add directly after it:

  ```css
  /* ===== SKELETON LOADING ===== */
  .skeleton-card {
    background: var(--bg);
    border-radius: var(--r);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .skeleton-img {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: linear-gradient(90deg, var(--bg-3) 25%, var(--bg-2) 50%, var(--bg-3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  .skeleton-body { padding: 16px 18px 18px; }
  .skeleton-line {
    height: 10px; border-radius: 6px; margin-bottom: 10px;
    background: linear-gradient(90deg, var(--bg-3) 25%, var(--bg-2) 50%, var(--bg-3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  .skeleton-line--sm { width: 38%; }
  .skeleton-line--md { width: 68%; }
  .skeleton-line--lg { width: 92%; }
  .skeleton-btn {
    height: 36px; border-radius: var(--r-pill); margin-top: 14px;
    background: linear-gradient(90deg, var(--bg-3) 25%, var(--bg-2) 50%, var(--bg-3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
  }
  ```

- [ ] **Step 2: Add renderSkeletons function in script.js**

  In `script.js`, find the `/* ===== LOAD PRODUCTS ===== */` comment. Add directly before it:

  ```js
  /* ===== SKELETON LOADING ===== */
  function renderSkeletons(n) {
    var grid = document.getElementById('product-grid');
    var loading = document.getElementById('products-loading');
    if (loading) loading.style.display = 'none';
    for (var i = 0; i < n; i++) {
      var card = document.createElement('div');
      card.className = 'skeleton-card';
      card.setAttribute('aria-hidden', 'true');
      var img  = document.createElement('div'); img.className  = 'skeleton-img';
      var body = document.createElement('div'); body.className = 'skeleton-body';
      var l1 = document.createElement('div'); l1.className = 'skeleton-line skeleton-line--sm';
      var l2 = document.createElement('div'); l2.className = 'skeleton-line skeleton-line--lg';
      var l3 = document.createElement('div'); l3.className = 'skeleton-line skeleton-line--md';
      var lb = document.createElement('div'); lb.className = 'skeleton-btn';
      body.appendChild(l1); body.appendChild(l2); body.appendChild(l3); body.appendChild(lb);
      card.appendChild(img); card.appendChild(body);
      grid.appendChild(card);
    }
  }
  ```

- [ ] **Step 3: Remove skeleton cards in renderProducts**

  In `script.js`, find inside `renderProducts`:

  ```js
  if (loading) loading.style.display = 'none';

  var existing = grid.querySelectorAll('.product-card');
  ```

  Replace with:

  ```js
  if (loading) loading.style.display = 'none';
  grid.querySelectorAll('.skeleton-card').forEach(function (el) { el.remove(); });

  var existing = grid.querySelectorAll('.product-card');
  ```

- [ ] **Step 4: Verify in browser**

  DevTools → Network → throttle to Slow 3G. Reload. Before products load: 3 shimmering skeleton cards fill the grid. After load: real cards replace them with no layout shift.

- [ ] **Step 5: Commit**

  ```bash
  git add assets/css/style.css assets/js/script.js
  git commit -m "feat: replace loading spinner with skeleton shimmer cards"
  ```

---

## Task 6: Filter Pill Bar

**Files:**
- Modify: `index.html:104–115` (add pill bar inside #products)
- Modify: `assets/css/style.css` (add filter pill styles before scroll-margins)
- Modify: `assets/js/script.js` (add initFilterBar, call it in DOMContentLoaded, sync in applyFilter)

- [ ] **Step 1: Add filter bar HTML to index.html**

  Find inside `index.html`:

  ```html
  <section id="products" class="products" aria-label="Daftar produk">
    <div class="product-grid" id="product-grid">
  ```

  Replace with:

  ```html
  <section id="products" class="products" aria-label="Daftar produk">
    <div class="filter-bar" id="filter-bar" role="group" aria-label="Filter kategori">
      <div class="filter-bar-inner">
        <button class="filter-pill filter-pill--active" data-filter="all">Semua</button>
        <button class="filter-pill" data-filter="macbook">MacBook</button>
        <button class="filter-pill" data-filter="iphone">iPhone</button>
        <button class="filter-pill" data-filter="ipad">iPad</button>
        <button class="filter-pill" data-filter="laptop">Laptop</button>
      </div>
    </div>
    <div class="product-grid" id="product-grid">
  ```

- [ ] **Step 2: Add filter pill CSS**

  In `assets/css/style.css`, find the `/* ===== SCROLL MARGINS ===== */` comment. Add directly before it:

  ```css
  /* ===== FILTER BAR ===== */
  .filter-bar {
    max-width: 1280px;
    margin: 0 auto;
    padding-bottom: 20px;
  }
  .filter-bar-inner { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-pill {
    padding: 7px 18px;
    border-radius: var(--r-pill);
    font-size: 13px; font-weight: 500;
    color: var(--text-2);
    background: var(--bg);
    border: 1.5px solid var(--border);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
  }
  .filter-pill:hover { background: var(--bg-3); color: var(--text); }
  .filter-pill--active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .filter-pill--active:hover { background: var(--accent-h); border-color: var(--accent-h); }
  ```

  Inside `@media (max-width: 767px)`, after the `.products` rule, add:

  ```css
  .filter-bar-inner { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; }
  ```

- [ ] **Step 3: Add initFilterBar and wire up DOMContentLoaded**

  In `script.js`, find the `/* ===== NAVBAR ===== */` comment. Add directly before it:

  ```js
  /* ===== FILTER BAR ===== */
  function initFilterBar() {
    document.querySelectorAll('.filter-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyFilter(this.dataset.filter);
      });
    });
  }
  ```

  Then update the DOMContentLoaded handler:

  ```js
  document.addEventListener('DOMContentLoaded', function () {
    setFooterYear();
    initNavbar();
    initFilterBar();
    loadProducts();
  });
  ```

- [ ] **Step 4: Sync pill active state in applyFilter**

  In `script.js`, find `applyFilter`. At the top of the function (after `activeFilter = filter;`), find the existing navbar sync block:

  ```js
  // Update active state on navbar filter links
  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    var isActive = link.dataset.filterNav === filter;
    link.classList.toggle('nav-filter-active', isActive);
  });
  ```

  Add a pill sync block directly before it:

  ```js
  // Sync pill bar
  document.querySelectorAll('.filter-pill').forEach(function (pill) {
    pill.classList.toggle('filter-pill--active', pill.dataset.filter === filter);
  });
  ```

- [ ] **Step 5: Verify in browser**

  Open the page. Above the product grid, pill buttons "Semua · MacBook · iPhone · iPad · Laptop" appear. Clicking "MacBook" highlights it blue, hides non-MacBook cards, and updates the navbar active link. "Semua" restores all cards. On mobile, pills scroll horizontally.

- [ ] **Step 6: Commit**

  ```bash
  git add index.html assets/css/style.css assets/js/script.js
  git commit -m "feat: add filter pill bar with active state sync"
  ```

---

## Task 7: Filter Fade Transitions

**Files:**
- Modify: `assets/css/style.css` (add .filtering-out after .product-card.hidden)
- Modify: `assets/js/script.js` (replace applyFilter body)

- [ ] **Step 1: Add filtering-out CSS class**

  In `assets/css/style.css`, find:

  ```css
  .product-card.hidden { display: none; }
  ```

  Add directly after it:

  ```css
  .product-card.filtering-out {
    opacity: 0 !important;
    transform: scale(0.97) !important;
    transition: opacity 0.15s ease, transform 0.15s ease !important;
    pointer-events: none;
  }
  ```

- [ ] **Step 2: Replace applyFilter with animated version**

  In `script.js`, replace the entire `applyFilter` function (the `/* ===== FILTER ===== */` block) with:

  ```js
  /* ===== FILTER ===== */
  function applyFilter(filter) {
    activeFilter = filter;
    var cards = Array.from(document.querySelectorAll('.product-card'));
    var empty = document.getElementById('products-empty');
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sync pill bar
    document.querySelectorAll('.filter-pill').forEach(function (pill) {
      pill.classList.toggle('filter-pill--active', pill.dataset.filter === filter);
    });
    // Sync navbar links
    document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
      link.classList.toggle('nav-filter-active', link.dataset.filterNav === filter);
    });

    var hasVisible = cards.some(function (c) {
      return filter === 'all' || c.dataset.category === filter;
    });
    if (empty) empty.hidden = hasVisible;

    if (prefersReduced) {
      cards.forEach(function (card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
      });
      return;
    }

    // Animated: fade grid out, swap visibility, fade back in
    var grid = document.getElementById('product-grid');
    grid.style.transition = 'opacity 0.15s ease';
    grid.style.opacity = '0';

    setTimeout(function () {
      var visibleIdx = 0;
      cards.forEach(function (card) {
        var match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        if (match) {
          card.style.transitionDelay = Math.min(visibleIdx * 0.04, 0.18) + 's';
          visibleIdx++;
        } else {
          card.style.transitionDelay = '';
        }
      });
      grid.style.opacity = '1';
      setTimeout(function () {
        grid.style.transition = '';
        cards.forEach(function (card) { card.style.transitionDelay = ''; });
      }, 350);
    }, 150);
  }
  ```

- [ ] **Step 3: Verify in browser**

  Click "MacBook" pill. Expected: grid fades out (150ms), non-MacBook cards disappear, MacBook cards fade back in with subtle stagger. "Semua" restores all with same animation. With OS reduced-motion setting on, cards snap instantly.

- [ ] **Step 4: Commit**

  ```bash
  git add assets/css/style.css assets/js/script.js
  git commit -m "feat: animated fade transition on product filter"
  ```

---

## Task 8: JSON-LD Structured Data

**Files:**
- Modify: `assets/js/script.js` (add injectJsonLd before `/* ===== ANIMATIONS ===== */`)

- [ ] **Step 1: Add injectJsonLd function**

  In `script.js`, find the `/* ===== ANIMATIONS ===== */` comment. Add directly before it:

  ```js
  /* ===== JSON-LD ===== */
  function injectJsonLd(products) {
    var existing = document.getElementById('jsonld-sentraq');
    if (existing) existing.remove();

    var items = products
      .filter(function (p) { return p.available; })
      .map(function (p, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Product',
            'name': p.name,
            'description': p.specs,
            'offers': {
              '@type': 'Offer',
              'price': p.price,
              'priceCurrency': 'IDR',
              'availability': 'https://schema.org/InStock',
              'url': 'https://sentraq.github.io/#products'
            }
          }
        };
      });

    var schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          'name': 'Sentraq',
          'url': 'https://sentraq.github.io',
          'telephone': '+6285716577307',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Jakarta',
            'addressCountry': 'ID'
          }
        },
        {
          '@type': 'ItemList',
          'name': 'Produk Sentraq',
          'itemListElement': items
        }
      ]
    };

    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'jsonld-sentraq';
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
  }
  ```

- [ ] **Step 2: Confirm loadProducts calls injectJsonLd**

  In `script.js`, confirm the `.then` success handler inside `loadProducts` (added in Task 4) includes:

  ```js
  injectJsonLd(allProducts);
  ```

  If the Task 4 stub was used instead, replace `function injectJsonLd(p){}` with this full implementation now.

- [ ] **Step 3: Verify in browser**

  DevTools → Elements → `<head>`. After page loads, a `<script type="application/ld+json" id="jsonld-sentraq">` tag should appear. Click it to expand — it should contain valid JSON with `@context: "https://schema.org"`, a `LocalBusiness` node, and an `ItemList` with one entry per available product.

- [ ] **Step 4: Commit**

  ```bash
  git add assets/js/script.js
  git commit -m "feat: inject JSON-LD structured data for LocalBusiness + product catalog"
  ```

---

## Spec Coverage Checklist

- [x] §1.1 XSS — Task 3: `escapeHtml` applied to all fields + img alt
- [x] §1.2 cache-busting — Task 4: `?v=Date.now()`
- [x] §1.3 features padding — Task 1
- [x] §1.4 og:image — Task 2
- [x] §1.5 error state — Task 4: `renderError()` with retry button
- [x] §1.6 CSS formatting — Task 1
- [x] §2 skeleton loading — Task 5
- [x] §3 filter pill bar — Task 6
- [x] §3 filter transitions — Task 7
- [x] §3 reduced motion — Task 7: `prefers-reduced-motion` check
- [x] §4.1 og:image — Task 2
- [x] §4.2 JSON-LD — Task 8
- [x] §4.3 dns-prefetch + og:locale — Task 2
- [x] skeleton cards removed on error — `renderError()` removes `.skeleton-card` first
- [x] injectJsonLd called on retry — `loadProducts` always calls it in `.then`
