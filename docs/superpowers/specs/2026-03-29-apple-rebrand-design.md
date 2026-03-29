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
--bg-primary:    #ffffff;   /* page, cards */
--bg-secondary:  #f5f5f7;   /* page surface, card hover */
--bg-tertiary:   #e5e5e7;   /* dividers */
--text-primary:  #1d1d1f;   /* headings, body */
--text-secondary:#6e6e73;   /* subtitles, labels */
--text-tertiary: #aeaeb2;   /* captions, timestamps */
--accent:        #0071e3;   /* buttons, links, prices */
--accent-hover:  #0077ed;
--border:        #d2d2d7;
```

---

## Typography

- Font: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif` (no external font dependency)
- Hero h1: 48px / weight 700 / letter-spacing -0.03em
- Section h2: 32px / weight 700 / letter-spacing -0.02em
- Body: 17px / weight 400 / line-height 1.5
- Label (uppercase): 12px / weight 500 / letter-spacing 0.08em
- Card title: 13–15px / weight 600
- Price: 11–13px / weight 500 / color `--accent`

---

## Page Sections (top to bottom)

### 1. Navbar
- Position: sticky top, `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.85)`
- Height: 48px
- Left: "Sentraq" wordmark (700 weight)
- Center: category links — MacBook · iPhone · iPad · Tentang Kami
- Right: "Hubungi Kami" — blue pill button
- Mobile: hamburger collapses center links
- Scroll behavior: border-bottom appears on scroll (no hide/show animation — clean Apple behavior)

### 2. Hero
- Background: `#ffffff`
- Eyebrow: `"Premium Pre-Owned Electronics · Jakarta"` — uppercase, muted
- H1 (ID): `"Gadget terbaik."` + `"Harga terjangkau."` — blue accent on second line
- Subtitle (ID): one sentence about quality + warranty
- Subtitle (EN): italic, muted, smaller — translation of ID subtitle
- CTAs: "Lihat Produk" (blue pill) + "Hubungi via WhatsApp" (gray pill)

### 3. Category Filter Bar
- Background: `#f5f5f7`
- Pill buttons: All / MacBook / iPhone / iPad
- Active pill: `#0071e3` white text; inactive: white bg + border
- Clicking a pill filters the product grid (JS)

### 4. Product Grid
- Background: `#f5f5f7`
- Layout: CSS Grid, 3 columns desktop / 2 tablet / 1 mobile
- Card: white, `border-radius: 12px`, subtle box-shadow, padding 16px
- Card contents (top to bottom):
  - Image area: fixed-height container (`height: 180px`), image object-fit contain, gray bg
  - Image slider dots if multiple images (existing slider JS reused)
  - Category label (uppercase, muted)
  - Product name (bold)
  - Specs line (color, storage, etc.) — muted
  - Price — blue, weight 500
  - "Hubungi" button — blue pill, full width, links to WhatsApp
- No like/favorite buttons (removed — unnecessary for a catalog site)
- No cursor glow effect

### 5. Contact Section
- Background: `#ffffff`
- Eyebrow: `"Hubungi Kami · Get in Touch"`
- H2 (ID): `"Siap membantu kamu."`
- Subtitle (ID + EN italic)
- Three contact cards on `#f5f5f7` background:
  - WhatsApp: green icon circle, phone number, "Chat Sekarang" blue pill
  - Instagram: gradient icon circle, handle, "Follow" blue pill
  - Email: blue icon circle, address, "Kirim Email" blue pill
- Business hours line: bilingual, muted

### 6. Footer
- Background: `#f5f5f7`
- Top border: `1px solid #d2d2d7`
- Left: Sentraq wordmark + one-line description
- Right: two link columns — Produk (MacBook, iPhone, iPad) and Ikuti Kami (WhatsApp, Instagram, Email)
- Bottom bar: copyright + email — both muted

---

## JavaScript Behavior (rewritten clean)

| Feature | Keep | Notes |
|---|---|---|
| Product image slider | Yes | Rewritten — same swipe/dot/arrow logic, cleaner code |
| Category filter | Yes (new) | Pills filter product grid by data-category attribute |
| Mobile hamburger menu | Yes | Rewritten simply |
| Navbar border on scroll | Yes | `scrolled` class adds border-bottom |
| Smooth scroll | Yes | Native `scroll-behavior: smooth` in CSS, no JS needed |
| Cursor glow | **No** | Removed |
| Like buttons | **No** | Removed |
| Lazy loading | Yes | IntersectionObserver for images with `data-src` |
| Scroll hide/show navbar | **No** | Apple doesn't hide nav on scroll — removed |

---

## Animations

- Product cards: fade-up on first viewport entry (IntersectionObserver, `opacity 0→1`, `translateY 20px→0`, 0.4s ease)
- Category filter: instant (no animation — matches Apple Store)
- Page transitions: none — Apple keeps it static

---

## Responsive Breakpoints

- Desktop: ≥ 1024px — 3-col product grid
- Tablet: 768–1023px — 2-col product grid, hamburger nav
- Mobile: < 768px — 1-col grid, hamburger nav, stacked CTAs

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

- Real product images (placeholders used)
- Backend / inventory management
- Payment processing
- Search functionality
