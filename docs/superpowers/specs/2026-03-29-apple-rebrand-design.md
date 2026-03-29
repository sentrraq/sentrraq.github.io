# Sentraq — Apple-Style Rebrand Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Source repo:** sentrraq/catalog (index.html, style.css, script.js)

---

## Overview

Full rewrite of Sentraq's website — a Jakarta-based pre-owned electronics store selling MacBook, iPhone, and iPad — into an Apple-inspired, minimalist design. All three files (index.html, style.css, script.js) are rewritten from scratch. No legacy gamer/dark-theme code is carried forward.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Style direction | Apple Store Grid | Clean product tiles, light background |
| Layout | All light, top to bottom | No dark sections; consistent airiness |
| Accent color | Apple Blue `#0071e3` | Trustworthy, familiar, high contrast |
| Language | Bilingual ID + EN | Primary Indonesian, English subtitle/translation |
| Approach | Full rewrite | Old codebase has too much neon/gamer DNA to patch |

---

## Color Tokens

```css
:root {
  --bg-primary:     #ffffff;   /* page bg, card bg */
  --bg-secondary:   #f5f5f7;   /* page surface, filter bar, contact cards, footer */
  --bg-tertiary:    #e8e8ed;   /* image placeholder bg inside cards */
  --text-primary:   #1d1d1f;   /* headings, card titles, nav links */
  --text-secondary: #6e6e73;   /* subtitles, card specs, labels */
  --text-tertiary:  #aeaeb2;   /* captions, EN translation lines, footer muted text */
  --accent:         #0071e3;   /* CTA buttons, prices, active filter pill, links */
  --accent-hover:   #0077ed;   /* button hover state */
  --accent-active:  #006edb;   /* button pressed/active state */
  --border:         #d2d2d7;   /* nav border, footer divider, card borders on hover */
  --border-light:   #e5e5e7;   /* section dividers */
  --shadow-card:    0 2px 8px rgba(0,0,0,0.08);   /* product cards */
  --shadow-nav:     0 1px 0 rgba(0,0,0,0.08);      /* navbar border-bottom */
}
```

---

## Typography

Font stack (no external dependency — uses system SF Pro on Apple, Segoe on Windows, Roboto on Android):
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
             "Helvetica Neue", Arial, sans-serif;
```

| Role | Size | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|
| Hero h1 | 48px (mobile: 32px) | 700 | 1.05 | -0.03em | `--text-primary` |
| Section h2 | 32px (mobile: 24px) | 700 | 1.1 | -0.02em | `--text-primary` |
| Eyebrow label | 12px | 500 | 1 | 0.08em | `--text-secondary` (uppercase) |
| Body / subtitle | 17px (mobile: 15px) | 400 | 1.5 | 0 | `--text-secondary` |
| EN translation line | 13px | 400 | 1.4 | 0 | `--text-tertiary` (italic) |
| Nav links | 13px | 400 | 1 | 0 | `--text-primary` |
| Nav wordmark | 18px | 700 | 1 | -0.02em | `--text-primary` |
| Card category label | 11px | 500 | 1 | 0.06em | `--text-secondary` (uppercase) |
| Card product name | 14px | 600 | 1.3 | 0 | `--text-primary` |
| Card specs line | 12px | 400 | 1.4 | 0 | `--text-secondary` |
| Card price | 13px | 500 | 1 | 0 | `--accent` |
| Footer section label | 11px | 600 | 1 | 0.06em | `--text-primary` (uppercase) |
| Footer links | 12px | 400 | 2 | 0 | `--text-secondary` |
| Copyright | 11px | 400 | 1 | 0 | `--text-tertiary` |

---

## Spacing System

Based on an 8px grid:

```
4px  — tight gaps (icon to text, dot spacing)
8px  — small gaps (between card meta lines)
12px — medium gaps (between card elements)
16px — card internal padding
20px — filter bar vertical padding
24px — section internal gaps
32px — section horizontal padding (mobile)
48px — section horizontal padding (desktop), large internal padding
64px — section vertical padding (hero, contact)
80px — section vertical padding (product grid top/bottom)
```

---

## HTML Structure

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

  <header class="navbar" role="banner">
    <div class="navbar-inner">
      <a class="navbar-wordmark" href="#">Sentraq</a>
      <nav class="navbar-links" aria-label="Main navigation">
        <a href="#macbook">MacBook</a>
        <a href="#iphone">iPhone</a>
        <a href="#ipad">iPad</a>
        <a href="#contact">Tentang Kami</a>
      </nav>
      <div class="navbar-actions">
        <a href="#contact" class="btn btn-primary btn-sm">Hubungi Kami</a>
        <button class="hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <main id="main">

    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-heading">
      <p class="eyebrow">Premium Pre-Owned Electronics · Jakarta</p>
      <h1 id="hero-heading">
        Gadget terbaik.<br>
        <span class="accent">Harga terjangkau.</span>
      </h1>
      <p class="hero-sub">MacBook, iPhone, dan iPad bekas berkualitas tinggi — dikurasi, diperiksa, dan bergaransi.</p>
      <p class="hero-sub-en">Premium pre-owned devices, curated and tested.</p>
      <div class="hero-ctas">
        <a href="#products" class="btn btn-primary">Lihat Produk</a>
        <a href="https://wa.me/6285716577307" class="btn btn-secondary" target="_blank" rel="noopener">Hubungi via WhatsApp</a>
      </div>
    </section>

    <!-- Filter Bar -->
    <div class="filter-bar" role="tablist" aria-label="Filter produk">
      <button class="filter-pill active" data-filter="all" role="tab" aria-selected="true">All</button>
      <button class="filter-pill" data-filter="macbook" role="tab" aria-selected="false">MacBook</button>
      <button class="filter-pill" data-filter="iphone" role="tab" aria-selected="false">iPhone</button>
      <button class="filter-pill" data-filter="ipad" role="tab" aria-selected="false">iPad</button>
    </div>

    <!-- Product Grid -->
    <section id="products" class="products" aria-label="Daftar produk">
      <div class="product-grid">
        <!-- product cards injected here, or hardcoded -->
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="contact" aria-labelledby="contact-heading">
      ...
    </section>

  </main>

  <footer class="footer" role="contentinfo">
    ...
  </footer>
</body>
```

---

## Component Specs

### Navbar

```
height: 48px
padding: 0 48px (desktop) / 0 20px (mobile)
background: rgba(255,255,255,0.85)
backdrop-filter: blur(20px) saturate(180%)
border-bottom: 1px solid transparent  →  1px solid var(--border) on .scrolled
transition: border-color 0.2s ease
position: sticky; top: 0; z-index: 100
```

- Wordmark: `font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); text-decoration: none`
- Nav links: `font-size: 13px; color: var(--text-primary); text-decoration: none; opacity: 1` → `opacity: 0.7` on hover
- `.btn-sm`: `padding: 6px 16px; border-radius: 980px; font-size: 12px; font-weight: 500`
- Hamburger: hidden on desktop (`display: none`), shown on mobile (`display: flex`)
- Mobile nav: slides down below navbar as `<nav>` with `display: none` → `display: flex; flex-direction: column` when open; links are 17px, padded 16px

### Button System

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 980px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease, opacity 0.15s ease;
  padding: 12px 24px;
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

.btn-sm { padding: 6px 16px; font-size: 12px; }
.btn-full { width: 100%; }
```

### Hero Section

```
padding: 80px 48px (desktop) / 56px 24px (mobile)
background: var(--bg-primary)
text-align: center
border-bottom: 1px solid var(--border-light)
max-width: 680px; margin: 0 auto  (for text content only)
```

- `.eyebrow`: `font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 16px`
- `h1 .accent`: `color: var(--accent)` — applied to "Harga terjangkau." span only
- `.hero-sub`: `font-size: 17px; color: var(--text-secondary); margin-top: 16px; line-height: 1.5`
- `.hero-sub-en`: `font-size: 13px; color: var(--text-tertiary); font-style: italic; margin-top: 6px`
- `.hero-ctas`: `display: flex; gap: 12px; justify-content: center; margin-top: 32px; flex-wrap: wrap`

### Filter Bar

```
background: var(--bg-secondary)
padding: 20px 48px (desktop) / 16px 20px (mobile)
display: flex; gap: 8px; flex-wrap: wrap
border-bottom: 1px solid var(--border-light)
position: sticky; top: 48px; z-index: 90
```

- `.filter-pill`: `padding: 6px 18px; border-radius: 980px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--bg-primary); color: var(--text-primary); transition: all 0.15s ease`
- `.filter-pill.active`: `background: var(--accent); color: #fff; border-color: var(--accent)`
- `.filter-pill:hover:not(.active)`: `background: var(--bg-secondary); border-color: #c7c7cc`

### Product Grid

```
background: var(--bg-secondary)
padding: 40px 48px (desktop) / 24px 16px (mobile)
```

`.product-grid`:
```css
display: grid;
grid-template-columns: repeat(3, 1fr);   /* desktop */
gap: 16px;
max-width: 1200px;
margin: 0 auto;

/* tablet */
@media (max-width: 1023px) { grid-template-columns: repeat(2, 1fr); }

/* mobile */
@media (max-width: 767px)  { grid-template-columns: 1fr; }
```

### Product Card

```html
<article class="product-card" data-category="macbook" aria-label="MacBook Air M1">
  <div class="card-slider">
    <div class="slider-track">
      <div class="slide">
        <img src="..." data-src="..." alt="MacBook Air M1 Space Gray" loading="lazy">
      </div>
      <!-- more slides -->
    </div>
    <button class="slider-prev" aria-label="Previous image">‹</button>
    <button class="slider-next" aria-label="Next image">›</button>
    <div class="slider-dots" aria-hidden="true">
      <span class="dot active"></span>
    </div>
  </div>
  <div class="card-body">
    <p class="card-category">MacBook</p>
    <h3 class="card-title">MacBook Air M1</h3>
    <p class="card-specs">8GB RAM · 256GB SSD · Space Gray</p>
    <p class="card-price">Rp 8.500.000</p>
    <a href="https://wa.me/6285716577307?text=..." class="btn btn-primary btn-full btn-sm" target="_blank" rel="noopener">
      Hubungi Kami
    </a>
  </div>
</article>
```

Card CSS:
```
background: var(--bg-primary)
border-radius: 16px
box-shadow: var(--shadow-card)
overflow: hidden
transition: transform 0.2s ease, box-shadow 0.2s ease
```
Card hover: `transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12)`

`.card-slider`:
```
position: relative
overflow: hidden
background: var(--bg-tertiary)
aspect-ratio: 4/3   (replaces fixed height — more flexible)
border-radius: 16px 16px 0 0
```

Slider arrows:
```
position: absolute; top: 50%; transform: translateY(-50%)
width: 28px; height: 28px; border-radius: 50%
background: rgba(255,255,255,0.85); backdrop-filter: blur(8px)
border: none; font-size: 16px; color: var(--text-primary)
cursor: pointer; opacity: 0  →  opacity: 1 on .card-slider:hover
transition: opacity 0.15s ease
```

Slider dots:
```
position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%)
display: flex; gap: 4px
```
Dot: `width: 5px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.25)`
Dot active: `background: var(--accent)`

`.card-body`: `padding: 14px 16px 16px`

Hidden card (filtered out): `display: none`

### Contact Section

```
background: var(--bg-primary)
padding: 80px 48px (desktop) / 56px 24px (mobile)
text-align: center
border-top: 1px solid var(--border-light)
```

Contact cards container:
```
display: grid
grid-template-columns: repeat(3, 1fr)  (desktop) / 1fr (mobile)
gap: 16px
max-width: 640px
margin: 40px auto 0
```

Contact card:
```
background: var(--bg-secondary)
border-radius: 16px
padding: 28px 20px
text-align: center
transition: transform 0.2s ease, box-shadow 0.2s ease
```
Hover: `transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08)`

Icon circle: `width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center`
- WhatsApp icon bg: `#25d366`
- Instagram icon bg: `linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`
- Email icon bg: `var(--accent)`

Business hours: `font-size: 12px; color: var(--text-tertiary); margin-top: 32px`

### Footer

```
background: var(--bg-secondary)
border-top: 1px solid var(--border)
padding: 40px 48px 24px (desktop) / 32px 20px 20px (mobile)
```

Top row: `display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; flex-wrap: wrap; margin-bottom: 32px`

Link columns: `display: flex; gap: 48px`

Bottom bar:
```
border-top: 1px solid var(--border)
padding-top: 20px
display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px
```

---

## JavaScript Modules

### `initNavbar()`
- Adds `.scrolled` class to `<header>` when `window.scrollY > 10` → triggers border-bottom
- Hamburger click: toggles `aria-expanded`, toggles `.nav-open` on `<header>`, locks `document.body` scroll
- Click outside / Escape key: closes mobile nav

### `initFilterPills()`
- Each `.filter-pill` click:
  1. Remove `.active` + set `aria-selected="false"` on all pills
  2. Add `.active` + `aria-selected="true"` on clicked pill
  3. For each `.product-card`: if `data-filter === "all"` or card's `data-category === data-filter` → show; else hide (`display: none`)
- No animation on filter (instant, matches Apple Store)

### `initSliders()`
- Called once on DOMContentLoaded; iterates over every `.product-card`
- Per card state: `currentSlide = 0`, `totalSlides`
- `updateSlider(card, index)`: sets `sliderTrack.style.transform`, toggles `.active` on dots, disables prev/next at boundaries
- Prev/Next button click listeners
- Dot click listeners
- Touch swipe: `touchstart` / `touchend`, swipe threshold 50px
- Mouse drag: `mousedown` / `mouseup` on `.card-slider`
- Keyboard: `ArrowLeft` / `ArrowRight` when `.card-slider` is focused
- Slider arrows appear only on hover (CSS handles this — no JS needed)
- Single-image cards: hide dots, hide arrows (JS checks `totalSlides === 1`)

### `initAnimations()`
- `IntersectionObserver` with `threshold: 0.1`, `rootMargin: "0px 0px -40px 0px"`
- Targets: `.product-card`, `.contact-card`, `.hero` (hero animates immediately on load)
- On intersect: add `.visible` class, unobserve
- CSS handles the actual animation (no JS animation values):
  ```css
  .product-card, .contact-card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .product-card.visible, .contact-card.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .product-card:nth-child(2) { transition-delay: 0.05s; }
  .product-card:nth-child(3) { transition-delay: 0.1s; }
  /* etc. */
  ```

### `initLazyImages()`
- `IntersectionObserver` watching `img[data-src]`
- On intersect: `img.src = img.dataset.src`, remove `data-src`, unobserve

### `setFooterYear()`
- `document.querySelector('.footer-year').textContent = new Date().getFullYear()`

---

## WhatsApp Deep Links

All "Hubungi Kami" product buttons use pre-filled WhatsApp messages:
```
https://wa.me/6285716577307?text=Halo%20Sentraq%2C%20saya%20tertarik%20dengan%20[PRODUCT_NAME]
```
The `text` param is URL-encoded per product. Hardcoded in HTML per card.

---

## Animations Summary

| Element | Trigger | Animation | Duration | Delay |
|---|---|---|---|---|
| Product cards | Scroll into view | fadeUp (opacity + translateY) | 0.4s ease | staggered 0.05s per card |
| Contact cards | Scroll into view | fadeUp | 0.4s ease | staggered 0.1s |
| Card hover | CSS :hover | translateY(-2px) + deeper shadow | 0.2s ease | none |
| Contact card hover | CSS :hover | translateY(-2px) + shadow | 0.2s ease | none |
| Filter pills | JS class toggle | instant | — | none |
| Navbar border | JS .scrolled class | border-color transition | 0.2s ease | none |

---

## Accessibility

- Skip link: `<a href="#main" class="skip-link">` — visually hidden until focused
- All images have descriptive `alt` attributes
- Filter pills use `role="tablist"` / `role="tab"` / `aria-selected`
- Sliders use `aria-label` on track region; prev/next buttons have `aria-label`
- Hamburger button has `aria-expanded` toggled on open/close
- Color contrast: `--text-primary` on `--bg-primary` = 16.1:1 (AAA); `--accent` on `--bg-primary` = 4.6:1 (AA)

---

## Responsive Breakpoints

| Breakpoint | Width | Product grid | Nav |
|---|---|---|---|
| Desktop | ≥ 1024px | 3 columns | Full horizontal links |
| Tablet | 768–1023px | 2 columns | Hamburger |
| Mobile | < 768px | 1 column | Hamburger, stacked CTAs |

---

## Files Changed

| File | Action |
|---|---|
| `index.html` | Full rewrite |
| `style.css` | Full rewrite |
| `script.js` | Full rewrite |

No new files created. No build tools added.

---

## Out of Scope

- Real product images (emoji/placeholder used; `data-src` ready for real images)
- Backend / inventory management
- Payment processing
- Search functionality
- Analytics
