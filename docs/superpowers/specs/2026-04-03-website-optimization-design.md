# Sentraq Website Optimization Design

**Date:** 2026-04-03  
**Scope:** `index.html`, `assets/css/style.css`, `assets/js/script.js`  
**Approach:** B — Full Optimization (bug fixes + skeleton loading + filter animations + SEO)

---

## 1. Bug Fixes

Six bugs are patched as part of this work. No new behavior — corrections only.

### 1.1 XSS in product cards (`script.js:172`)
`p.name`, `p.specs`, `p.description`, and `p.category` are inserted raw into `innerHTML` via string concatenation in `buildCard()`. A malicious string in `products.json` would execute as HTML.  
**Fix:** Add an `escapeHtml(str)` helper that replaces `&`, `<`, `>`, `"`, `'` with their HTML entities. Apply it to all product fields before inserting into innerHTML.

### 1.2 Stale `products.json` cache (`script.js:7`)
`fetch('products.json')` has no cache-busting. After admin publishes, returning visitors may see old product data for hours due to browser caching.  
**Fix:** Change to `fetch('products.json?v=' + Date.now())`. This forces a fresh fetch on every page load.

### 1.3 Features section: zero top padding on tablet (`style.css:584`)
At `≤1023px`, `.features` has `padding: 0 28px 80px` — zero top padding causes the eyebrow text to start flush against the border separating it from the brand-statement section.  
**Fix:** Change to `padding: 80px 28px 80px`.

### 1.4 Missing `og:image` meta tag (`index.html:9`)
No `og:image` is set, so sharing the URL on WhatsApp, Instagram, or Telegram shows no preview image.  
**Fix:** Add `<meta property="og:image" content="...">` using an inline SVG data URL encoding the Sentraq logo on a blue background. No extra image file required.

### 1.5 Fetch error silently falls back to stale hardcoded products (`script.js:94`)
When `products.json` fails to load, the `.catch()` handler calls `getFallbackProducts()` which returns hardcoded products with March 2026 prices. Users see incorrect product listings with no indication something went wrong.  
**Fix:** Replace the fallback with an error state: remove skeleton cards, show a "Gagal memuat produk" message with a retry button that calls `loadProducts()` again.

### 1.6 Two CSS rules concatenated on one line (`style.css:581`)
`.product-grid` and `.brand-statement` rules are on the same line — a formatting artifact.  
**Fix:** Split onto separate lines.

---

## 2. Skeleton Loading

**Replaces** the current centered spinner + text with 3 shimmer skeleton cards.

### Behavior
- On page load, 3 skeleton cards are rendered immediately inside `#product-grid` before `products.json` fetches.
- Each skeleton matches the real card's structure: full-width image area (aspect-ratio 4/3), then 3 shimmer lines and a shimmer button.
- When products load, skeleton cards are removed and real cards are inserted. No layout shift.
- On fetch error, skeleton cards are also removed before showing the error state.

### Implementation
- Add `.skeleton-card` CSS class with shimmer animation (`@keyframes shimmer` using `background-size: 200%` gradient sweep).
- `loadProducts()` calls `renderSkeletons(3)` before `fetch()`, which inserts 3 `.skeleton-card` elements into `#product-grid`.
- `renderProducts()` removes all `.skeleton-card` elements before inserting real cards.

---

## 3. Filter Transitions

### Filter pill bar
A pill bar is added directly above the product grid (inside `#products` section). It shows: **Semua · MacBook · iPhone · iPad · Laptop**. The active category pill is highlighted in accent blue. Clicking "Semua" resets the filter to all products.

The pill bar is always visible in the products section. It replaces the navbar links as the primary filter mechanism (navbar links still work and scroll to products, but the pill bar is the canonical filter UI).

### Transition behavior
When `applyFilter(filter)` is called:
1. All `.product-card` elements get class `.filtering-out` (opacity → 0, transform → scale(0.97), 150ms).
2. After 150ms, cards with `display:none` are hidden, others get `.filtering-in` (opacity → 1, transform → none, 300ms with stagger).
3. `hasVisible` check updates the empty state message.

**Reduced motion:** Transitions are skipped (respects `prefers-reduced-motion`). Cards show/hide instantly.

### Active state
`applyFilter()` updates:
- The pill bar: active pill gets `filter-pill--active` class.
- Navbar `[data-filter-nav]` links: `nav-filter-active` class (already exists).

---

## 4. SEO & Social

### 4.1 `og:image`
Added to `<head>` as a `<meta property="og:image">` tag. The value is a data URL containing an inline SVG: blue (`#0071e3`) rounded rectangle, white "S" letterform, "Sentraq" wordmark. Dimensions 1200×630 (standard og:image ratio).

No additional file. No build step. Works on GitHub Pages without modification.

Also add: `og:image:width`, `og:image:height`, `og:image:type`.

### 4.2 JSON-LD structured data
Injected by `script.js` after products load, as a `<script type="application/ld+json">` tag appended to `<head>`.

Schema: `LocalBusiness` (parent) containing an `ItemList` of products. Each product is a `Product` with `name`, `offers` (price, availability, `priceCurrency: "IDR"`), and `url` (canonical page URL with `#products` anchor).

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Sentraq",
  "url": "https://sentraq.github.io",
  "telephone": "+6285716577307",
  "address": { "@type": "PostalAddress", "addressLocality": "Jakarta", "addressCountry": "ID" },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [ ...products ]
  }
}
```

The `<script>` tag is replaced on every `loadProducts()` call (not duplicated).

### 4.3 Additional head improvements
- `<link rel="dns-prefetch" href="https://raw.githubusercontent.com">` — speeds up first image load from GitHub CDN.
- `<meta property="og:locale" content="id_ID">` — signals Indonesian content.

---

## 5. Files Changed

| File | Changes |
|------|---------|
| `index.html` | og:image, og:locale, dns-prefetch, filter pill bar HTML |
| `assets/css/style.css` | Skeleton card styles, shimmer animation, filter pill styles, fade transition classes, features padding fix, CSS formatting fix |
| `assets/js/script.js` | escapeHtml(), renderSkeletons(), retry error state, filter fade transition, JSON-LD injection, cache-busting fetch |

---

## 6. Out of Scope

- Image lightbox (approach C) — not included.
- Admin panel changes — addressed separately (localStorage bug already fixed).
- Service worker / offline caching — out of scope.
- Redesign of any section — no layout changes beyond the filter pill bar.
