'use strict';

/* Always start at top of page on load — disable browser scroll restoration */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* Strip any URL hash so browser doesn't auto-scroll to an anchor on load */
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

/* Force scroll to top with smooth-scroll disabled temporarily (handles hash & bfcache) */
function forceScrollToTop() {
  var html = document.documentElement;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  setTimeout(function () { html.style.scrollBehavior = ''; }, 80);
}

/* pageshow fires on bfcache restore (iOS Safari back/fwd) where 'load' is skipped */
window.addEventListener('pageshow', forceScrollToTop);
window.addEventListener('load', forceScrollToTop);

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

/* ===== CART STATE ===== */
var cart = {}; // { productId: { product, qty } }

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  initNavbar();
  initFilterBar();
  initHeroCycle();
  initEarlyAnimations();
  initLightbox();
  initCart();
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

  // WhatsApp FAB: sembunyikan saat di hero atau di section kontak
  var fab = document.querySelector('.whatsapp-fab');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  if (fab && hero) {
    function updateFab() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      var inHero = heroBottom > 0;
      var inContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.5 : false;
      if (inHero || inContact) {
        fab.classList.remove('fab--visible');
      } else {
        fab.classList.add('fab--visible');
      }
    }
    window.addEventListener('scroll', updateFab, { passive: true });
    updateFab();
  }

  // Hamburger toggle
  var hamburger = navbar.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var open = navbar.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a mobile-nav link is clicked
    navbar.querySelectorAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

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

  // Intercept anchor links (#contact, #products, etc.) — scroll without adding hash to URL
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href === '#' || href === '') return; // homepage link, let it go
      var targetId = href.slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      // Update URL without hash so page reload won't scroll to anchor
      history.replaceState(null, '', window.location.pathname + window.location.search);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // "Lihat Semua Produk" reset button in empty state
  var resetBtn = document.getElementById('products-empty-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      var allPill = bar.querySelector('[data-filter="all"]');
      if (allPill) allPill.click();
    });
  }
}

/* ===== JSON-LD ===== */
function injectJsonLd(products) {
  var existing = document.getElementById('jsonld-sentraq');
  if (existing) existing.remove();

  var items = products
    .filter(function(p) { return p.status === 'available'; })
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
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) throw result.error;
        allProducts = result.data || [];
        renderProducts(allProducts);
        injectJsonLd(allProducts);
        initAnimations();
        subscribeRealtime();
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

/* ===== REALTIME ===== */
function subscribeRealtime() {
  if (!window._sb) return;
  window._sb
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, function() {
      reloadProductsRealtime();
    })
    .subscribe();
}

function reloadProductsRealtime() {
  window._sb
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .then(function(result) {
      if (result.error) return;
      allProducts = result.data || [];
      renderProducts(allProducts);
      injectJsonLd(allProducts);
    });
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
  var isSold   = p.status === 'sold'    || (!p.status && !p.available);
  var isOnHold = p.status === 'on_hold';
  var badge = isSold
    ? '<span class="card-badge sold">Terjual</span>'
    : isOnHold
    ? '<span class="card-badge on-hold">On Hold</span>'
    : '<span class="card-badge available">Tersedia</span>';
  var productLink = 'https://sentraq.github.io/#product-' + encodeURIComponent(p.id);
  var specsLine = p.specs ? '\nSpesifikasi: ' + p.specs : '';
  var descLine  = p.description ? '\nKondisi: ' + p.description : '';
  var waText = encodeURIComponent(
    'Halo Sentraq, saya tertarik dengan ' + p.name + ' harga ' + formatPrice(p.price) + '.' + specsLine + descLine + '\nLink produk: ' + productLink
  );

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
  article.id = 'product-' + p.id;
  article.dataset.category = p.category;
  article.setAttribute('aria-label', safeName);
  if (isSold) {
    var lastDiv = mediaHTML.lastIndexOf('</div>');
    mediaHTML = mediaHTML.slice(0, lastDiv) + '<div class="card-sold-overlay"><span>Terjual</span></div>' + mediaHTML.slice(lastDiv);
  }
  var stock = (typeof p.stock === 'number') ? p.stock : (p.available ? 1 : 0);
  var stockHTML = '';
  if (isSold) {
    stockHTML = '<p class="card-stock card-stock--out">Stok habis</p>';
  } else if (isOnHold) {
    stockHTML = '<p class="card-stock card-stock--hold">Sedang ditahan</p>';
  } else if (stock <= 0) {
    stockHTML = '<p class="card-stock card-stock--out">Stok habis</p>';
  } else {
    stockHTML = '<p class="card-stock card-stock--ok">Stok: ' + stock + ' unit tersedia</p>';
  }

  var ctaBtn;
  if (isSold || stock <= 0) {
    ctaBtn = '<button class="btn btn-primary btn-full btn-sm" disabled>Terjual</button>';
  } else if (isOnHold) {
    ctaBtn = '<button class="btn btn-secondary btn-full btn-sm" disabled>Sedang Ditahan</button>';
  } else {
    ctaBtn = '<button class="btn btn-primary btn-full btn-sm btn-add-cart" data-id="' + escapeHtml(p.id) + '" type="button">Tambah ke Keranjang</button>';
  }
  article.innerHTML = [
    mediaHTML,
    '<div class="card-body">',
      '<p class="card-category">' + safeCat + badge + '</p>',
      '<h3 class="card-title">' + safeName + '</h3>',
      '<p class="card-specs">' + safeSpecs + '</p>',
      safeDesc,
      '<p class="card-price">' + formatPrice(p.price) + '</p>',
      stockHTML,
      ctaBtn,
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
  initAddToCartButtons();

  if (products.length === 0) updateEmptyState('all');

  var imgs = grid.querySelectorAll('img[data-src]');
  initLazyImages(imgs);

  if (typeof activeFilter !== 'undefined' && activeFilter !== 'all') {
    applyFilter(activeFilter);
  }

  // Scroll to product if opened via direct link (e.g. from WA)
  scrollToProductFromHash();
}

function scrollToProductFromHash() {
  var hash = window.location.hash; // e.g. #product-macbook-pro-2020-i5-ibox-abc123
  if (!hash || !hash.startsWith('#product-')) return;
  var card = document.querySelector(hash);
  if (!card) return;
  setTimeout(function() {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('product-highlight');
    setTimeout(function() { card.classList.remove('product-highlight'); }, 2200);
  }, 400);
}

/* ===== FILTER ===== */
var CATEGORY_LABELS = {
  all: 'Semua', macbook: 'MacBook', iphone: 'iPhone',
  ipad: 'iPad', laptop: 'Laptop', tablet: 'Tablet'
};

function updateEmptyState(filter) {
  var grid  = document.getElementById('product-grid');
  var empty = document.getElementById('products-empty');
  if (!empty) return;

  var hasVisible = grid ? Array.prototype.some.call(
    grid.querySelectorAll('.product-card'),
    function(c) { return c.style.display !== 'none'; }
  ) : false;

  if (hasVisible) {
    empty.style.display = 'none';
    return;
  }

  var label = CATEGORY_LABELS[filter] || filter;
  var title = document.getElementById('products-empty-title');
  var sub   = document.getElementById('products-empty-sub');
  if (title) title.textContent = (filter === 'all')
    ? 'Belum ada produk tersedia'
    : 'Tidak ada produk ' + label + ' saat ini';
  if (sub) sub.innerHTML = (filter === 'all')
    ? 'Produk belum tersedia saat ini.<br>Silakan cek kembali nanti.'
    : 'Produk kategori <strong>' + label + '</strong> belum tersedia.<br>Silakan cek kembali nanti atau lihat kategori lain.';

  empty.style.display = 'flex';
}

function applyFilter(filter) {
  activeFilter = filter;
  var cards = document.querySelectorAll('#product-grid .product-card');

  // Update active state on navbar filter links
  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    var isActive = link.dataset.filterNav === filter;
    link.classList.toggle('nav-filter-active', isActive);
  });

  // If no cards at all, just show empty state
  if (!cards.length) {
    updateEmptyState(filter);
    return;
  }

  // Check reduced motion preference
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Instant show/hide
    cards.forEach(function(card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.style.display = match ? '' : 'none';
    });
    updateEmptyState(filter);
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
    updateEmptyState(filter);
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

    /* Click on image → open lightbox */
    if (media) {
      media.addEventListener('click', function (e) {
        if (e.target.tagName !== 'IMG' || !e.target.src) return;
        var imgs = Array.from(slides).map(function (s) {
          var img = s.querySelector('img');
          return img ? (img.src || img.dataset.src || '') : '';
        }).filter(Boolean);
        if (imgs.length && window._openLightbox) window._openLightbox(imgs, cur);
      });
    }
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

/* ===== IMAGE LIGHTBOX ===== */
function initLightbox() {
  var lb      = document.getElementById('img-lightbox');
  var lbImg   = lb.querySelector('.lb-img');
  var lbClose = lb.querySelector('.lb-close');
  var lbPrev  = lb.querySelector('.lb-prev');
  var lbNext  = lb.querySelector('.lb-next');
  var lbCount = lb.querySelector('.lb-counter');

  var images = [];
  var cur    = 0;

  function openLightbox(imgs, index) {
    images = imgs;
    cur    = index;
    showImage();
    lb.classList.add('open', 'fade-in');
    document.body.style.overflow = 'hidden';
    lb.focus();
    setTimeout(function () { lb.classList.remove('fade-in'); }, 250);
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    images = [];
  }

  function showImage() {
    lbImg.src = images[cur];
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
    lbPrev.disabled = cur === 0;
    lbNext.disabled = cur === images.length - 1;
    if (images.length > 1) {
      lbCount.textContent = (cur + 1) + ' / ' + images.length;
      lbCount.style.display = '';
    } else {
      lbCount.style.display = 'none';
    }
    lbPrev.style.display = images.length > 1 ? '' : 'none';
    lbNext.style.display = images.length > 1 ? '' : 'none';
  }

  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  lbPrev.addEventListener('click', function () { if (cur > 0) { cur--; showImage(); } });
  lbNext.addEventListener('click', function () { if (cur < images.length - 1) { cur++; showImage(); } });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft'  && cur > 0)              { cur--; showImage(); }
    if (e.key === 'ArrowRight' && cur < images.length - 1) { cur++; showImage(); }
  });

  var ltx = 0;
  lb.addEventListener('touchstart', function (e) { ltx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   function (e) {
    var d = ltx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) {
      if (d > 0 && cur < images.length - 1) { cur++; showImage(); }
      if (d < 0 && cur > 0)                 { cur--; showImage(); }
    }
  }, { passive: true });

  window._openLightbox = openLightbox;
}

/* ===== ADD TO CART BUTTONS ===== */
function initAddToCartButtons() {
  document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var id = btn.dataset.id;
      var product = allProducts.find(function (p) { return p.id === id; });
      if (!product) return;
      addToCart(product);

      btn.textContent = 'Ditambahkan!';
      btn.disabled = true;
      setTimeout(function () {
        var inCart = cart[id] ? true : false;
        btn.textContent = inCart ? 'Sudah di Keranjang' : 'Tambah ke Keranjang';
        btn.disabled = inCart;
      }, 1200);
    });
  });
}

/* ===== CART FUNCTIONS ===== */
function initCart() {
  var cartBtn   = document.getElementById('cart-btn');
  var cartClose = document.getElementById('cart-close');
  var overlay   = document.getElementById('cart-overlay');

  if (cartBtn)   cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (overlay)   overlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });
}

function openCart() {
  var drawer  = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (drawer)  drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  var drawer  = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (drawer)  drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(product) {
  if (cart[product.id]) {
    cart[product.id].qty = Math.min(cart[product.id].qty + 1, product.stock || 1);
  } else {
    cart[product.id] = { product: product, qty: 1 };
  }
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  updateCartUI();
  refreshAddToCartButtons();
}

function updateCartUI() {
  var ids = Object.keys(cart);
  var totalQty = ids.reduce(function (sum, id) { return sum + cart[id].qty; }, 0);
  var totalPrice = ids.reduce(function (sum, id) { return sum + cart[id].product.price * cart[id].qty; }, 0);

  /* Update badge */
  var badge = document.getElementById('cart-count');
  if (badge) {
    if (totalQty > 0) {
      badge.style.display = '';
      badge.textContent = totalQty > 99 ? '99+' : String(totalQty);
    } else {
      badge.style.display = 'none';
    }
  }

  /* Update total price */
  var totalEl = document.getElementById('cart-total-price');
  if (totalEl) totalEl.textContent = formatPrice(totalPrice);

  /* Show/hide empty state and footer */
  var emptyEl  = document.getElementById('cart-empty');
  var footerEl = document.getElementById('cart-footer');
  if (emptyEl)  emptyEl.style.display  = ids.length === 0 ? '' : 'none';
  if (footerEl) footerEl.style.display = ids.length === 0 ? 'none' : '';

  /* Render cart items */
  renderCartItems();

  /* Update WA button href */
  var waBtn = document.getElementById('cart-wa-btn');
  if (waBtn) waBtn.href = buildCartWALink();
}

function renderCartItems() {
  var container = document.getElementById('cart-items');
  if (!container) return;

  var emptyEl = document.getElementById('cart-empty');

  /* Remove existing item rows */
  container.querySelectorAll('.cart-item').forEach(function (el) { el.remove(); });

  Object.keys(cart).forEach(function (id) {
    var entry = cart[id];
    var p = entry.product;
    var item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML =
      '<div class="cart-item-info">' +
        '<p class="cart-item-name">' + escapeHtml(p.name) + '</p>' +
        '<p class="cart-item-specs">' + escapeHtml(p.specs || '') + '</p>' +
        '<p class="cart-item-price">' + formatPrice(p.price * entry.qty) + '</p>' +
      '</div>' +
      '<div class="cart-item-actions">' +
        '<div class="cart-qty">' +
          '<button class="cart-qty-btn" data-action="dec" data-id="' + escapeHtml(id) + '" aria-label="Kurangi">&#8722;</button>' +
          '<span class="cart-qty-num">' + entry.qty + '</span>' +
          '<button class="cart-qty-btn" data-action="inc" data-id="' + escapeHtml(id) + '" aria-label="Tambah">&#43;</button>' +
        '</div>' +
        '<button class="cart-remove-btn" data-id="' + escapeHtml(id) + '" aria-label="Hapus produk">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>';

    item.querySelector('.cart-remove-btn').addEventListener('click', function () {
      removeFromCart(id);
    });

    var decBtn = item.querySelector('[data-action="dec"]');
    var incBtn = item.querySelector('[data-action="inc"]');
    if (decBtn) decBtn.addEventListener('click', function () {
      if (cart[id]) {
        cart[id].qty--;
        if (cart[id].qty <= 0) removeFromCart(id);
        else updateCartUI();
      }
    });
    if (incBtn) incBtn.addEventListener('click', function () {
      if (cart[id]) {
        var maxStock = cart[id].product.stock || 1;
        cart[id].qty = Math.min(cart[id].qty + 1, maxStock);
        updateCartUI();
      }
    });

    if (emptyEl) container.insertBefore(item, emptyEl);
    else container.appendChild(item);
  });
}

function refreshAddToCartButtons() {
  document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
    var id = btn.dataset.id;
    var inCart = !!cart[id];
    btn.textContent = inCart ? 'Sudah di Keranjang' : 'Tambah ke Keranjang';
    btn.disabled = inCart;
  });
}

function buildCartWALink() {
  var ids = Object.keys(cart);
  if (!ids.length) return 'https://wa.me/' + WA_NUMBER;

  var lines = ['Halo Sentraq, saya ingin memesan:\n'];
  ids.forEach(function (id, i) {
    var entry = cart[id];
    var p = entry.product;
    lines.push((i + 1) + '. ' + p.name + ' — ' + formatPrice(p.price) +
      (entry.qty > 1 ? ' (×' + entry.qty + ')' : '') +
      (p.specs ? '\n   Spesifikasi: ' + p.specs : ''));
  });

  var total = ids.reduce(function (s, id) { return s + cart[id].product.price * cart[id].qty; }, 0);
  lines.push('\nTotal: ' + formatPrice(total));
  lines.push('\nMohon konfirmasi ketersediaan. Terima kasih!');

  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
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
