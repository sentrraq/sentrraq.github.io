'use strict';

/* Always start at top of page on load — disable browser scroll restoration */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', function () { window.scrollTo(0, 0); });

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

var CATEGORY_ICONS = {
  macbook: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="13" rx="2"/><path d="M0 20h24"/></svg>',
  iphone:  '<svg width="32" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
  ipad:    '<svg width="36" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
  laptop:  '<svg width="40" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  default: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
};

var allProducts = [];
var activeFilter = 'all';

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  initNavbar();
  initFilterBar();
  initHeroCycle();
  initEarlyAnimations();
  loadProducts();
});

/* ===== HERO CYCLE WORD ===== */
function initHeroCycle() {
  var el = document.getElementById('hero-cycle-word');
  if (!el) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var words = ['MacBook', 'iPhone', 'iPad', 'Laptop'];
  var idx = 0;

  setTimeout(function () {
    setInterval(function () {
      el.classList.add('cycling-out');
      setTimeout(function () {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        el.classList.remove('cycling-out');
        el.classList.add('cycling-in');
        void el.offsetWidth; // force reflow so transition fires
        el.classList.remove('cycling-in');
      }, 230);
    }, 2800);
  }, 3200);
}

/* ===== EARLY ANIMATIONS (hero + static sections) ===== */
function initEarlyAnimations() {
  var noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sel = '.reveal-up, .feature-card, .contact-card';

  if (!('IntersectionObserver' in window) || noMotion) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(sel).forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i * 0.07, 0.42) + 's';
    io.observe(el);
  });
}

/* ===== FOOTER YEAR ===== */
function setFooterYear() {
  var el = document.querySelector('.footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== NAVBAR ===== */
function initNavbar() {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
  navbar.classList.toggle('scrolled', window.scrollY > 8);

  var hamburger = navbar.querySelector('.hamburger');
  var mobileNav = document.getElementById('mobile-nav');
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
    navbar.classList.contains('nav-open') ? closeMenu() : openMenu();
  });
  document.addEventListener('click', function (e) {
    if (navbar.classList.contains('nav-open') && !navbar.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var filter = this.dataset.filterNav;
      applyFilter(filter);
      // Sync pill bar active state
      var pills = document.querySelectorAll('#filter-bar [data-filter]');
      pills.forEach(function (p) {
        p.classList.toggle('filter-pill--active', p.getAttribute('data-filter') === filter);
      });
      var section = document.getElementById('products');
      if (section) {
        var top = section.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}

/* ===== FILTER BAR ===== */
function initFilterBar() {
  var bar = document.getElementById('filter-bar');
  if (!bar) return;
  var pills = bar.querySelectorAll('[data-filter]');
  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      var filter = pill.getAttribute('data-filter');
      applyFilter(filter);
      // Update pill active state
      pills.forEach(function(p) { p.classList.remove('filter-pill--active'); });
      pill.classList.add('filter-pill--active');
      // Sync navbar links
      document.querySelectorAll('[data-filter-nav]').forEach(function(a) {
        var isActive = a.getAttribute('data-filter-nav') === filter;
        a.classList.toggle('nav-filter-active', isActive);
      });
    });
  });
}

/* ===== JSON-LD ===== */
function injectJsonLd(products) {
  var existing = document.getElementById('jsonld-sentraq');
  if (existing) existing.remove();

  var items = products
    .filter(function(p) { return p.available; })
    .map(function(p, i) {
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

/* ===== SKELETON LOADING ===== */
function renderSkeletons(n) {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (var i = 0; i < n; i++) {
    var card = document.createElement('article');
    card.className = 'skeleton-card';
    card.innerHTML =
      '<div class="skeleton-img"></div>' +
      '<div class="skeleton-body">' +
        '<div class="skeleton-line skeleton-line--wide"></div>' +
        '<div class="skeleton-line skeleton-line--mid"></div>' +
        '<div class="skeleton-line skeleton-line--narrow"></div>' +
        '<div class="skeleton-line skeleton-btn"></div>' +
      '</div>';
    grid.appendChild(card);
  }
}

/* ===== LOAD PRODUCTS ===== */
function loadProducts() {
  renderSkeletons(3);
  var loading = document.getElementById('products-loading');
  if (loading) loading.style.display = 'none';

  // Use Supabase if client is available, otherwise fall back to products.json
  if (window._sb) {
    window._sb
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) throw result.error;
        allProducts = result.data || [];
        renderProducts(allProducts);
        injectJsonLd(allProducts);
        initAnimations();
      })
      .catch(function () {
        showProductsError();
      });
  } else {
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
        showProductsError();
      });
  }
}

function showProductsError() {
  var grid = document.getElementById('product-grid');
  if (!grid) return;

  var loading = document.getElementById('products-loading');
  if (loading) loading.style.display = 'none';

  // Clear grid
  grid.innerHTML = '';

  // Create error div
  var errorDiv = document.createElement('div');
  errorDiv.className = 'products-error';

  // Create error message
  var p = document.createElement('p');
  p.textContent = 'Gagal memuat produk.';
  errorDiv.appendChild(p);

  // Create retry button
  var btn = document.createElement('button');
  btn.className = 'products-retry-btn';
  btn.textContent = 'Coba lagi';
  btn.addEventListener('click', loadProducts);
  errorDiv.appendChild(btn);

  grid.appendChild(errorDiv);
}

/* ===== RENDER PRODUCTS ===== */
function formatPrice(p) {
  return 'Rp\u00a0' + Number(p).toLocaleString('id-ID');
}

function buildCard(p) {
  var hasImages = p.images && p.images.length > 0;
  var icon = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default;
  var catLabel = { macbook: 'MacBook', iphone: 'iPhone', ipad: 'iPad', laptop: 'Laptop' };
  var safeName  = escapeHtml(p.name);
  var safeSpecs = escapeHtml(p.specs);
  var safeDesc  = p.description ? '<p class="card-desc">' + escapeHtml(p.description) + '</p>' : '';
  var safeCat   = escapeHtml(catLabel[p.category] || p.category);
  var badge = p.available
    ? '<span class="card-badge">Tersedia</span>'
    : '<span class="card-badge sold">Terjual</span>';
  var waText = encodeURIComponent(p.whatsapp || ('Halo Sentraq, saya tertarik dengan ' + p.name + ' harga ' + formatPrice(p.price)));

  var mediaHTML;
  if (!hasImages) {
    mediaHTML = [
      '<div class="card-media" data-single>',
        '<div class="card-media-placeholder">',
          icon,
          '<span>' + safeCat + '</span>',
        '</div>',
      '</div>'
    ].join('');
  } else {
    var slides = p.images.map(function (url, i) {
      return '<div class="slide"><img data-src="' + escapeHtml(url) + '" alt="' + safeName + ' foto ' + (i + 1) + '" loading="lazy"></div>';
    }).join('');
    var dots = p.images.map(function (_, i) {
      return '<span class="dot' + (i === 0 ? ' active' : '') + '"></span>';
    }).join('');
    var dotsHTML = p.images.length > 1 ? '<div class="slider-dots">' + dots + '</div>' : '';
    var arrowsHTML = p.images.length > 1
      ? '<button class="slider-prev" aria-label="Foto sebelumnya">&#8249;</button><button class="slider-next" aria-label="Foto berikutnya">&#8250;</button>'
      : '';
    mediaHTML = [
      '<div class="card-media"' + (p.images.length <= 1 ? ' data-single' : '') + '>',
        '<div class="slider-track">' + slides + '</div>',
        arrowsHTML, dotsHTML,
      '</div>'
    ].join('');
  }

  var article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.category = p.category;
  article.setAttribute('aria-label', safeName);
  article.innerHTML = [
    mediaHTML,
    '<div class="card-body">',
      '<p class="card-category">' + safeCat + badge + '</p>',
      '<h3 class="card-title">' + safeName + '</h3>',
      '<p class="card-specs">' + safeSpecs + '</p>',
      safeDesc,
      '<p class="card-price">' + formatPrice(p.price) + '</p>',
      '<a href="https://wa.me/' + WA_NUMBER + '?text=' + waText + '"',
         ' class="btn btn-primary btn-full btn-sm"',
         ' target="_blank" rel="noopener noreferrer">Hubungi Kami</a>',
    '</div>'
  ].join('');

  return article;
}

function renderProducts(products) {
  var grid = document.getElementById('product-grid');
  var loading = document.getElementById('products-loading');
  var empty = document.getElementById('products-empty');

  if (loading) loading.style.display = 'none';

  var skeletons = grid.querySelectorAll('.skeleton-card');
  skeletons.forEach(function (el) { el.remove(); });

  var existing = grid.querySelectorAll('.product-card');
  existing.forEach(function (el) { el.remove(); });

  products.forEach(function (p) {
    var card = buildCard(p);
    grid.appendChild(card);
  });

  initSliders();

  if (products.length === 0 && empty) empty.hidden = false;

  var imgs = grid.querySelectorAll('img[data-src]');
  initLazyImages(imgs);

  if (typeof activeFilter !== 'undefined' && activeFilter !== 'all') {
    applyFilter(activeFilter);
  }
}

/* ===== FILTER ===== */
function updateEmptyState() {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  var hasVisible = Array.prototype.some.call(
    grid.querySelectorAll('.product-card'),
    function(c) { return c.style.display !== 'none'; }
  );
  var empty = document.getElementById('products-empty');
  if (empty) empty.hidden = hasVisible ? true : false;
}

function applyFilter(filter) {
  activeFilter = filter;
  var cards = document.querySelectorAll('#product-grid .product-card');
  if (!cards.length) return;

  // Update active state on navbar filter links
  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    var isActive = link.dataset.filterNav === filter;
    link.classList.toggle('nav-filter-active', isActive);
  });

  // Check reduced motion preference
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Instant show/hide
    cards.forEach(function(card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.style.display = match ? '' : 'none';
    });
    updateEmptyState();
    return;
  }

  // Step 1: fade out all cards
  cards.forEach(function(card) { card.classList.add('filtering-out'); });

  // Step 2: after fade-out, hide non-matching, fade in matching
  setTimeout(function() {
    var matchIdx = 0;
    cards.forEach(function(card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      if (!match) {
        card.style.display = 'none';
        card.classList.remove('filtering-out');
      } else {
        card.style.display = '';
        card.classList.remove('filtering-out');
        card.classList.remove('filtering-in');
        // Stagger: force reflow then add class
        void card.offsetWidth;
        card.style.animationDelay = (matchIdx * 0.05) + 's';
        card.classList.add('filtering-in');
        matchIdx++;
      }
    });
    updateEmptyState();
  }, 150);
}

/* ===== SLIDERS ===== */
function initSliders() {
  document.querySelectorAll('.product-card').forEach(function (card) {
    var media  = card.querySelector('.card-media');
    var track  = card.querySelector('.slider-track');
    var slides = card.querySelectorAll('.slide');
    var prev   = card.querySelector('.slider-prev');
    var next   = card.querySelector('.slider-next');
    var dots   = card.querySelectorAll('.dot');
    var total  = slides.length;

    if (!track || total <= 1) return;

    var cur = 0;

    function goTo(n) {
      cur = Math.max(0, Math.min(n, total - 1));
      track.style.transform = 'translateX(' + (-cur * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === total - 1;
    }

    if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); goTo(cur - 1); });
    if (next) next.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); goTo(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); goTo(i); }); });

    var sx = 0;
    if (media) {
      media.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      media.addEventListener('touchend',   function (e) { var d = sx - e.changedTouches[0].clientX; if (Math.abs(d) > 44) goTo(d > 0 ? cur + 1 : cur - 1); }, { passive: true });
      var mx = 0;
      media.addEventListener('mousedown', function (e) { mx = e.clientX; });
      media.addEventListener('mouseup',   function (e) { var d = mx - e.clientX; if (Math.abs(d) > 44) goTo(d > 0 ? cur + 1 : cur - 1); });
    }

    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
    });

    goTo(0);
  });
}

/* ===== ANIMATIONS (product cards only — static sections handled by initEarlyAnimations) ===== */
function initAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.product-card').forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.product-card').forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i * 0.06, 0.3) + 's';
    observer.observe(el);
  });
}

/* ===== LAZY IMAGES ===== */
var PLACEHOLDER_HTML = '<div class="slide-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>';

function handleImageError(img) {
  var slide = img.closest('.slide');
  if (slide) slide.innerHTML = PLACEHOLDER_HTML;
}

function initLazyImages(imgs) {
  if (!imgs || !imgs.length) return;

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(function (img) {
      img.onerror = function () { handleImageError(img); };
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        img.onerror = function () { handleImageError(img); };
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  imgs.forEach(function (img) { io.observe(img); });
}
