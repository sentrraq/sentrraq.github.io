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
var searchQuery  = '';
var sortOrder    = 'default';

/* ===== CART STATE ===== */
var cart = {}; // { productId: { product, qty } }

/* ===== PENDING CART PRODUCT (set before login, added after login) ===== */
var pendingCartProduct = null;

/* ===== WISHLIST STATE ===== */
var wishlist = [];
try { wishlist = JSON.parse(localStorage.getItem('sentraq_wishlist') || '[]'); } catch(e) { wishlist = []; }

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  initTheme();
  initNavbar();
  initFilterBar();
  initSearch();
  initSort();
  initHeroCycle();
  initEarlyAnimations();
  initLightbox();
  initCart();
  initBackToTop();
  initProductModal();
  initFaq();
  initAuth();
  initCheckoutModal();
  initWishlistPanel();
  updateWishlistBadge();
  loadProducts();
});

/* ===== PWA SERVICE WORKER ===== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}

/* ===== DARK MODE THEME ===== */
function initTheme() {
  var html = document.documentElement;
  var stored = '';
  try { stored = localStorage.getItem('sentraq_theme') || ''; } catch(e) {}
  if (stored === 'dark') html.setAttribute('data-theme', 'dark');
  updateThemeIcon();

  var btn = document.getElementById('theme-btn');
  if (btn) btn.addEventListener('click', function () {
    var isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
      try { localStorage.setItem('sentraq_theme', ''); } catch(e) {}
    } else {
      html.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('sentraq_theme', 'dark'); } catch(e) {}
    }
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  var btn = document.getElementById('theme-btn');
  if (!btn) return;
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.setAttribute('aria-label', isDark ? 'Mode terang' : 'Mode gelap');
  btn.innerHTML = isDark
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== WISHLIST BADGE (NAVBAR) ===== */
function updateWishlistBadge() {
  var badge = document.getElementById('wishlist-nav-badge');
  if (!badge) return;
  var count = wishlist.length;
  badge.textContent = count > 99 ? '99+' : String(count);
  badge.style.display = count > 0 ? '' : 'none';
}

/* ===== PRODUCT DETAIL MODAL ===== */
function initProductModal() {
  var overlay = document.getElementById('product-modal-overlay');
  var closeBtn = document.getElementById('product-modal-close');
  if (overlay) overlay.addEventListener('click', closeProductModal);
  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeProductModal();
  });
}

function openProductModal(p) {
  var modal   = document.getElementById('product-modal');
  var content = document.getElementById('product-modal-content');
  if (!modal || !content) return;

  var isSold   = p.status === 'sold'    || (!p.status && !p.available);
  var isOnHold = p.status === 'on_hold';
  var stock    = typeof p.stock === 'number' ? p.stock : (p.available ? 1 : 0);
  var icon     = CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default;
  var catLabel = { macbook: 'MacBook', iphone: 'iPhone', ipad: 'iPad', laptop: 'Laptop' };

  var mediaHTML;
  if (p.images && p.images.length > 0) {
    mediaHTML = '<div class="product-modal-media"><img src="' + escapeHtml(p.images[0]) + '" alt="' + escapeHtml(p.name) + '" loading="lazy"></div>';
  } else {
    mediaHTML = '<div class="product-modal-media"><div class="product-modal-media-placeholder">' + icon + '<span>' + escapeHtml(catLabel[p.category] || p.category) + '</span></div></div>';
  }

  var savingsHTML = '';
  var origHTML    = '';
  if (p.originalPrice && p.originalPrice > p.price) {
    var pct = Math.round((1 - p.price / p.originalPrice) * 100);
    origHTML    = '<span class="product-modal-original">' + formatPrice(p.originalPrice) + '</span>';
    savingsHTML = '<span class="product-modal-savings">Hemat ' + pct + '%</span>';
  }

  var conditionHTML = p.condition
    ? '<span class="card-condition card-condition--' + escapeHtml(p.condition.toLowerCase().replace(/\s+/g, '-')) + '">' + escapeHtml(p.condition) + '</span>'
    : '';

  var stockHTML;
  if (isSold || stock <= 0) {
    stockHTML = '<p class="card-stock card-stock--out">Stok habis</p>';
  } else if (isOnHold) {
    stockHTML = '<p class="card-stock card-stock--hold">Sedang ditahan</p>';
  } else if (stock <= 3) {
    stockHTML = '<p class="card-stock card-stock--low">Sisa ' + stock + ' unit &mdash; hampir habis!</p>';
  } else {
    stockHTML = '<p class="card-stock card-stock--ok">' + stock + ' unit tersedia</p>';
  }

  var cartBtnHTML;
  if (isSold || stock <= 0) {
    cartBtnHTML = '<button class="btn btn-primary btn-full" disabled>Terjual</button>';
  } else if (isOnHold) {
    cartBtnHTML = '<button class="btn btn-secondary btn-full" disabled>Sedang Ditahan</button>';
  } else {
    var inCart = !!cart[p.id];
    cartBtnHTML = '<button class="btn btn-primary btn-full btn-modal-add-cart" data-id="' + escapeHtml(p.id) + '">' + (inCart ? 'Sudah di Keranjang' : 'Tambah ke Keranjang') + '</button>';
  }

  var specsLine = p.specs ? '\nSpesifikasi: ' + p.specs : '';
  var descLine  = p.description ? '\nKondisi: ' + p.description : '';
  var productLink = 'https://sentrraq.github.io/#product-' + encodeURIComponent(p.id);
  var waText = encodeURIComponent('Halo Sentraq, saya tertarik dengan ' + p.name + ' harga ' + formatPrice(p.price) + '.' + specsLine + descLine + '\nLink produk: ' + productLink);
  var waHTML = '<a class="btn btn-ghost btn-full" href="https://wa.me/' + WA_NUMBER + '?text=' + waText + '" target="whatsapp" rel="noopener noreferrer">' +
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
    'Pesan via WhatsApp</a>';

  var descBlock = p.description ? '<div class="product-modal-desc">' + escapeHtml(p.description) + '</div>' : '';

  content.innerHTML = mediaHTML +
    '<div class="product-modal-body">' +
      '<p class="product-modal-category">' + escapeHtml(catLabel[p.category] || p.category) + conditionHTML + '</p>' +
      '<h3 class="product-modal-title">' + escapeHtml(p.name) + '</h3>' +
      '<p class="product-modal-specs">' + escapeHtml(p.specs || '') + '</p>' +
      descBlock +
      '<div class="product-modal-price-row">' +
        '<span class="product-modal-price">' + formatPrice(p.price) + '</span>' +
        origHTML + savingsHTML +
      '</div>' +
      '<div class="product-modal-stock">' + stockHTML + '</div>' +
      '<div class="product-modal-actions">' + cartBtnHTML + waHTML + '</div>' +
    '</div>';

  var addBtn = content.querySelector('.btn-modal-add-cart');
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      if (cart[p.id]) return;
      if (!currentUser) {
        pendingCartProduct = p;
        showToast('Silakan masuk untuk melanjutkan pembelian');
        closeProductModal();
        openAuthModal();
        return;
      }
      flyToCart(addBtn, function () { addToCart(p); });
      addBtn.textContent = 'Sudah di Keranjang';
      addBtn.disabled = true;
    });
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  var modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== FAQ ACCORDION ===== */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn    = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        var a = openItem.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
        var b = openItem.querySelector('.faq-question');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ===== DETAIL BUTTONS ===== */
function initDetailButtons() {
  document.querySelectorAll('.btn-detail').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var id = btn.dataset.id;
      var product = allProducts.find(function (p) { return p.id === id; });
      if (product) openProductModal(product);
    });
  });
}

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

  function loadFromJsonFallback() {
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
        loadFromJsonFallback();
      });
  } else {
    loadFromJsonFallback();
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
  article.dataset.price = p.price;
  article.dataset.name  = (p.name || '').toLowerCase();
  article.dataset.specs = (p.specs || '').toLowerCase();
  article.setAttribute('aria-label', safeName);
  /* Badge BARU / HOT on image */
  var badgeOverlay = '';
  if (p.badge === 'new') badgeOverlay = '<span class="card-label card-label--new">BARU</span>';
  else if (p.badge === 'hot') badgeOverlay = '<span class="card-label card-label--hot">🔥 HOT</span>';

  /* Wishlist button on image */
  var isWishlisted = wishlist.indexOf(p.id) !== -1;
  var wishlistBtn  = '<button class="wishlist-btn' + (isWishlisted ? ' wishlisted' : '') + '" data-id="' + escapeHtml(p.id) + '" aria-label="Simpan produk">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isWishlisted ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
  '</button>';

  /* Inject overlays into mediaHTML */
  var lastDiv = mediaHTML.lastIndexOf('</div>');
  var overlays = badgeOverlay + wishlistBtn;
  if (isSold) overlays += '<div class="card-sold-overlay"><span>Terjual</span></div>';
  mediaHTML = mediaHTML.slice(0, lastDiv) + overlays + mediaHTML.slice(lastDiv);
  var stock = (typeof p.stock === 'number') ? p.stock : (p.available ? 1 : 0);
  var stockHTML = '';
  if (isSold || stock <= 0) {
    stockHTML = '<p class="card-stock card-stock--out">Stok habis</p>';
  } else if (isOnHold) {
    stockHTML = '<p class="card-stock card-stock--hold">Sedang ditahan</p>';
  } else if (stock <= 3) {
    stockHTML = '<p class="card-stock card-stock--low">Sisa ' + stock + ' unit &mdash; hampir habis!</p>';
  } else {
    stockHTML = '<p class="card-stock card-stock--ok">' + stock + ' unit tersedia</p>';
  }

  var ctaBtn;
  if (isSold || stock <= 0) {
    ctaBtn = '<button class="btn btn-primary btn-full btn-sm" disabled>Terjual</button>';
  } else if (isOnHold) {
    ctaBtn = '<button class="btn btn-secondary btn-full btn-sm" disabled>Sedang Ditahan</button>';
  } else {
    ctaBtn = '<button class="btn btn-primary btn-full btn-sm btn-add-cart" data-id="' + escapeHtml(p.id) + '" type="button">Tambah ke Keranjang</button>';
  }
  var conditionHTML = p.condition
    ? '<span class="card-condition card-condition--' + escapeHtml(p.condition.toLowerCase().replace(/\s+/g,'-')) + '">' + escapeHtml(p.condition) + '</span>'
    : '';

  var shareBtn = '<button class="share-btn" data-id="' + escapeHtml(p.id) + '" aria-label="Bagikan produk">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
    'Bagikan' +
  '</button>';

  var savingsBadge = '';
  var originalPriceHTML = '';
  if (p.originalPrice && p.originalPrice > p.price) {
    var savingsPct = Math.round((1 - p.price / p.originalPrice) * 100);
    originalPriceHTML = '<span class="card-price-original">' + formatPrice(p.originalPrice) + '</span>';
    savingsBadge = '<span class="card-savings-badge">Hemat ' + savingsPct + '%</span>';
  }
  var priceRowHTML = '<div class="card-price-row">' +
    '<span class="card-price">' + formatPrice(p.price) + '</span>' +
    originalPriceHTML + savingsBadge +
  '</div>';

  var detailBtn = '<button class="btn-detail" data-id="' + escapeHtml(p.id) + '" type="button">Lihat Detail &rarr;</button>';

  article.innerHTML = [
    mediaHTML,
    '<div class="card-body">',
      '<p class="card-category">' + safeCat + badge + conditionHTML + '</p>',
      '<h3 class="card-title">' + safeName + '</h3>',
      '<p class="card-specs">' + safeSpecs + '</p>',
      safeDesc,
      priceRowHTML,
      stockHTML,
      ctaBtn,
      '<div class="card-actions-row">',
        detailBtn,
        shareBtn,
      '</div>',
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
  initWishlistButtons();
  initShareButtons();
  initDetailButtons();

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

  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    link.classList.toggle('nav-filter-active', link.dataset.filterNav === filter);
  });

  applyVisibility();
}

function applyVisibility() {
  var grid  = document.getElementById('product-grid');
  var cards = Array.from(document.querySelectorAll('#product-grid .product-card'));
  if (!cards.length) { updateEmptyState(activeFilter); return; }

  var q = searchQuery.trim().toLowerCase();

  /* Sort cards in DOM */
  if (sortOrder === 'price-asc') {
    cards.sort(function(a, b) { return Number(a.dataset.price) - Number(b.dataset.price); });
  } else if (sortOrder === 'price-desc') {
    cards.sort(function(a, b) { return Number(b.dataset.price) - Number(a.dataset.price); });
  } else if (sortOrder === 'name-asc') {
    cards.sort(function(a, b) { return (a.dataset.name || '').localeCompare(b.dataset.name || ''); });
  }
  cards.forEach(function(card) { grid.appendChild(card); });

  /* Show/hide by filter + search */
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    cards.forEach(function(card) { card.style.display = cardMatches(card, q) ? '' : 'none'; });
    updateEmptyState(activeFilter);
    return;
  }

  cards.forEach(function(card) { card.classList.add('filtering-out'); });
  setTimeout(function() {
    var idx = 0;
    cards.forEach(function(card) {
      var match = cardMatches(card, q);
      card.classList.remove('filtering-out', 'filtering-in');
      if (!match) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
        void card.offsetWidth;
        card.style.animationDelay = (idx * 0.05) + 's';
        card.classList.add('filtering-in');
        idx++;
      }
    });
    updateEmptyState(activeFilter);
  }, 150);
}

function cardMatches(card, q) {
  var catOk = activeFilter === 'all' || card.dataset.category === activeFilter;
  if (!catOk) return false;
  if (!q) return true;
  return (card.dataset.name  || '').includes(q) ||
         (card.dataset.specs || '').includes(q);
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

/* ===== SEARCH ===== */
function initSearch() {
  var input = document.getElementById('product-search');
  var clear = document.getElementById('search-clear');
  if (!input) return;

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var val = input.value;
    clear.style.display = val ? '' : 'none';
    timer = setTimeout(function () {
      searchQuery = val;
      applyVisibility();
    }, 220);
  });

  if (clear) clear.addEventListener('click', function () {
    input.value = '';
    clear.style.display = 'none';
    searchQuery = '';
    applyVisibility();
    input.focus();
  });
}

/* ===== SORT ===== */
function initSort() {
  var sel = document.getElementById('product-sort');
  if (!sel) return;
  sel.addEventListener('change', function () {
    sortOrder = sel.value;
    applyVisibility();
  });
}

/* ===== WISHLIST ===== */
function saveWishlist() {
  try { localStorage.setItem('sentraq_wishlist', JSON.stringify(wishlist)); } catch(e) {}
}

async function toggleWishlist(id) {
  var idx = wishlist.indexOf(id);
  var removing = idx !== -1;
  if (removing) wishlist.splice(idx, 1);
  else wishlist.push(id);
  saveWishlist();

  document.querySelectorAll('.wishlist-btn[data-id="' + id + '"]').forEach(function (btn) {
    var saved = wishlist.indexOf(id) !== -1;
    btn.classList.toggle('wishlisted', saved);
    var svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', saved ? 'currentColor' : 'none');
    btn.classList.add('wishlist-pop');
    btn.addEventListener('animationend', function () { btn.classList.remove('wishlist-pop'); }, { once: true });
  });

  updateWishlistBadge();
  renderWishlistPanel();
  showToast(!removing ? '❤️ Disimpan ke wishlist' : 'Dihapus dari wishlist');

  // Sync to cloud if logged in
  if (currentUser && window._sb) {
    try {
      if (removing) {
        await window._sb.from('user_wishlists').delete().eq('user_id', currentUser.id).eq('product_id', id);
      } else {
        await window._sb.from('user_wishlists').upsert({ user_id: currentUser.id, product_id: id }, { onConflict: 'user_id,product_id' });
      }
    } catch(e) {}
  }
}

function initWishlistButtons() {
  document.querySelectorAll('.wishlist-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      toggleWishlist(btn.dataset.id);
    });
  });
}

/* ===== SHARE ===== */
function shareProduct(product) {
  var url = 'https://sentrraq.github.io/#product-' + encodeURIComponent(product.id);
  var title = product.name + ' — Sentraq';
  var text  = product.name + ' · ' + formatPrice(product.price) + '\n' + (product.specs || '');

  if (navigator.share) {
    navigator.share({ title: title, text: text, url: url }).catch(function () {});
  } else {
    navigator.clipboard.writeText(url).then(function () {
      showToast('🔗 Link disalin!');
    }).catch(function () {
      showToast('Link: ' + url);
    });
  }
}

function initShareButtons() {
  document.querySelectorAll('.share-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var id = btn.dataset.id;
      var product = allProducts.find(function (p) { return p.id === id; });
      if (product) shareProduct(product);
    });
  });
}

/* ===== TOAST ===== */
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('toast--show');
  void toast.offsetWidth;
  toast.classList.add('toast--show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () { toast.classList.remove('toast--show'); }, 2400);
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

      if (!currentUser) {
        pendingCartProduct = product;
        showToast('Silakan masuk untuk melanjutkan pembelian');
        openAuthModal();
        return;
      }

      flyToCart(btn, function () {
        addToCart(product);
      });

      btn.textContent = 'Ditambahkan!';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = cart[id] ? 'Sudah di Keranjang' : 'Tambah ke Keranjang';
        btn.disabled = !!cart[id];
      }, 900);
    });
  });
}

function flyToCart(sourceEl, onComplete) {
  var cartBtn = document.getElementById('cart-btn');
  if (!cartBtn || !sourceEl) { if (onComplete) onComplete(); return; }

  var srcRect  = sourceEl.getBoundingClientRect();
  var destRect = cartBtn.getBoundingClientRect();

  var dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.style.left = (srcRect.left + srcRect.width / 2 - 8) + 'px';
  dot.style.top  = (srcRect.top  + srcRect.height / 2 - 8) + 'px';
  document.body.appendChild(dot);

  var dx = (destRect.left + destRect.width / 2 - 8) - (srcRect.left + srcRect.width / 2 - 8);
  var dy = (destRect.top  + destRect.height / 2 - 8) - (srcRect.top  + srcRect.height / 2 - 8);

  dot.style.setProperty('--fly-x', dx + 'px');
  dot.style.setProperty('--fly-y', dy + 'px');
  dot.classList.add('fly-dot--animate');

  dot.addEventListener('animationend', function () {
    dot.remove();
    cartBtn.classList.add('cart-btn--pop');
    cartBtn.addEventListener('animationend', function handler() {
      cartBtn.classList.remove('cart-btn--pop');
      cartBtn.removeEventListener('animationend', handler);
    });
    if (onComplete) onComplete();
  }, { once: true });
}

/* ===== CART FUNCTIONS ===== */
function initCart() {
  var cartBtn   = document.getElementById('cart-btn');
  var cartClose = document.getElementById('cart-close');

  if (cartBtn) cartBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleCart();
  });
  if (cartClose) cartClose.addEventListener('click', closeCart);

  document.addEventListener('click', function (e) {
    var popup = document.getElementById('cart-drawer');
    var btn   = document.getElementById('cart-btn');
    if (popup && popup.classList.contains('open') &&
        !popup.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      closeCart();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });

  var cartEmptyCta = document.getElementById('cart-empty-cta');
  if (cartEmptyCta) {
    cartEmptyCta.addEventListener('click', function (e) {
      e.preventDefault();
      closeCart();
      var products = document.getElementById('products');
      if (products) {
        var top = products.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }

  // Tambah Produk Lain — tutup cart, scroll ke daftar produk
  var addMoreBtn = document.getElementById('cart-add-more-btn');
  if (addMoreBtn) addMoreBtn.addEventListener('click', function () {
    closeCart();
    var products = document.getElementById('products');
    if (products) {
      var top = products.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
}

function toggleCart() {
  var popup = document.getElementById('cart-drawer');
  if (!popup) return;
  if (popup.classList.contains('open')) closeCart();
  else openCart();
}

function openCart() {
  var popup = document.getElementById('cart-drawer');
  if (popup) popup.classList.add('open');
}

function closeCart() {
  var popup = document.getElementById('cart-drawer');
  if (popup) popup.classList.remove('open');
}

function addToCart(product) {
  if (cart[product.id]) {
    cart[product.id].qty = Math.min(cart[product.id].qty + 1, product.stock || 1);
  } else {
    cart[product.id] = { product: product, qty: 1 };
  }
  updateCartUI();
}

function removeFromCart(productId) {
  delete cart[productId];
  updateCartUI();
  refreshAddToCartButtons();
}

function updateCartUI() {
  var ids = Object.keys(cart);
  var totalQty   = ids.reduce(function (sum, id) { return sum + cart[id].qty; }, 0);
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

  /* Show/hide empty state, footer, tambah-lain section */
  var emptyEl      = document.getElementById('cart-empty');
  var footerEl     = document.getElementById('cart-footer');
  var addMoreSecEl = document.getElementById('cart-add-more-section');
  if (emptyEl)      emptyEl.style.display      = ids.length === 0 ? '' : 'none';
  if (footerEl)     footerEl.style.display     = ids.length === 0 ? 'none' : '';
  if (addMoreSecEl) addMoreSecEl.style.display = ids.length === 0 ? 'none' : '';

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

  /* Product items */
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


/* ===== AUTH ===== */
var currentUser = null;

function initAuth() {
  window.addEventListener('sentraq:authchange', function(e) {
    currentUser = e.detail.user;
    updateAuthUI();
  });

  var loginBtn = document.getElementById('login-btn');
  var avatarBtn = document.getElementById('navbar-user-avatar');
  if (loginBtn)  loginBtn.addEventListener('click', openAuthModal);
  if (avatarBtn) avatarBtn.addEventListener('click', openAuthModal);

  var authClose   = document.getElementById('auth-modal-close');
  var authOverlay = document.getElementById('auth-modal-overlay');
  if (authClose)   authClose.addEventListener('click', closeAuthModal);
  if (authOverlay) authOverlay.addEventListener('click', closeAuthModal);

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      document.getElementById('auth-form-login').style.display    = target === 'login'    ? '' : 'none';
      document.getElementById('auth-form-register').style.display = target === 'register' ? '' : 'none';
    });
  });

  // Login submit
  var loginForm = document.getElementById('auth-form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var email    = loginForm.querySelector('[name="email"]').value.trim();
      var password = loginForm.querySelector('[name="password"]').value;
      handleLogin(email, password, loginForm);
    });
  }

  // Register submit
  var regForm = document.getElementById('auth-form-register');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name     = regForm.querySelector('[name="name"]').value.trim();
      var email    = regForm.querySelector('[name="email"]').value.trim();
      var password = regForm.querySelector('[name="password"]').value;
      handleRegister(name, email, password, regForm);
    });
  }

  // Logout
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function updateAuthUI() {
  var loginBtn  = document.getElementById('login-btn');
  var avatarBtn = document.getElementById('navbar-user-avatar');
  var initial   = document.getElementById('navbar-user-initial');
  var tabsWrap  = document.getElementById('auth-tabs-wrap');
  var loggedIn  = document.getElementById('auth-loggedin');
  var authName  = document.getElementById('auth-username');
  var authEmail = document.getElementById('auth-useremail');
  var avatarBig = document.getElementById('auth-avatar-big');

  if (currentUser) {
    var displayName = (currentUser.user_metadata && currentUser.user_metadata.name) || '';
    var email       = currentUser.email || '';
    var letter      = displayName ? displayName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U');

    if (loginBtn)  loginBtn.style.display  = 'none';
    if (avatarBtn) { avatarBtn.style.display = ''; if (initial) initial.textContent = letter; }
    if (tabsWrap)  tabsWrap.style.display  = 'none';
    if (loggedIn)  loggedIn.style.display  = '';
    if (authName)  authName.textContent    = displayName || email.split('@')[0];
    if (authEmail) authEmail.textContent   = email;
    if (avatarBig) avatarBig.textContent   = letter;

    syncWishlistToCloud();
    syncProfile();

    // If user just logged in and there's a pending cart product, add it now
    if (pendingCartProduct) {
      var pending = pendingCartProduct;
      pendingCartProduct = null;
      setTimeout(function () {
        flyToCart(document.getElementById('cart-btn'), function () { addToCart(pending); });
        showToast('Produk ditambahkan ke keranjang!');
        openCart();
      }, 400);
    }
  } else {
    if (loginBtn)  loginBtn.style.display  = '';
    if (avatarBtn) avatarBtn.style.display = 'none';
    if (tabsWrap)  tabsWrap.style.display  = '';
    if (loggedIn)  loggedIn.style.display  = 'none';
  }
}

async function handleLogin(email, password, form) {
  var sb  = window._sb;
  if (!sb) return;
  var btn = form.querySelector('[type="submit"]');
  var err = form.querySelector('.auth-error');
  if (btn) { btn.disabled = true; btn.textContent = 'Memproses...'; }
  if (err) err.style.display = 'none';
  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;
    closeAuthModal();
    showToast('Selamat datang kembali!');
  } catch(e) {
    if (err) { err.textContent = 'Email atau password salah.'; err.style.display = ''; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Masuk'; }
}

async function handleRegister(name, email, password, form) {
  var sb  = window._sb;
  if (!sb) return;
  var btn = form.querySelector('[type="submit"]');
  var err = form.querySelector('.auth-error');
  if (btn) { btn.disabled = true; btn.textContent = 'Memproses...'; }
  if (err) err.style.display = 'none';
  try {
    var res = await sb.auth.signUp({ email: email, password: password, options: { data: { name: name } } });
    if (res.error) throw res.error;
    closeAuthModal();
    showToast('Akun berhasil dibuat! Cek email untuk konfirmasi.');
  } catch(e) {
    if (err) { err.textContent = (e && e.message) || 'Gagal membuat akun.'; err.style.display = ''; }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Buat Akun'; }
}

async function handleLogout() {
  var sb = window._sb;
  if (sb) await sb.auth.signOut();
  closeAuthModal();
  showToast('Berhasil keluar.');
}

function openAuthModal() {
  var modal = document.getElementById('auth-modal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeAuthModal() {
  var modal = document.getElementById('auth-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

async function syncWishlistToCloud() {
  var sb = window._sb;
  if (!sb || !currentUser) return;
  try {
    if (wishlist.length) {
      var rows = wishlist.map(function(id) { return { user_id: currentUser.id, product_id: id }; });
      await sb.from('user_wishlists').upsert(rows, { onConflict: 'user_id,product_id' });
    }
    var res = await sb.from('user_wishlists').select('product_id').eq('user_id', currentUser.id);
    if (res.data) {
      res.data.forEach(function(row) {
        if (wishlist.indexOf(row.product_id) === -1) wishlist.push(row.product_id);
      });
      saveWishlist();
      updateWishlistBadge();
      renderWishlistPanel();
    }
  } catch(e) {}
}

/* ===== SYNC PROFILE ===== */
async function syncProfile() {
  var sb = window._sb;
  if (!sb || !currentUser) return;
  try {
    var displayName = (currentUser.user_metadata && currentUser.user_metadata.name) || '';
    var email = currentUser.email || '';
    await sb.from('profiles').upsert({
      id: currentUser.id,
      name: displayName,
      email: email
    }, { onConflict: 'id' });
  } catch(e) {}
}

/* ===== CHECKOUT MODAL ===== */
function initCheckoutModal() {
  var checkoutBtn    = document.getElementById('checkout-btn');
  var checkoutModal  = document.getElementById('checkout-modal');
  var checkoutOverlay = document.getElementById('checkout-modal-overlay');
  var checkoutClose  = document.getElementById('checkout-modal-close');
  var checkoutSubmit = document.getElementById('checkout-submit-btn');

  var successModal   = document.getElementById('order-success-modal');
  var successOverlay = document.getElementById('order-success-overlay');
  var successDone    = document.getElementById('order-success-done-btn');

  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
  if (checkoutClose)   checkoutClose.addEventListener('click', closeCheckoutModal);
  if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);
  if (successOverlay)  successOverlay.addEventListener('click', closeOrderSuccessModal);
  if (checkoutSubmit) checkoutSubmit.addEventListener('click', handleCheckoutSubmit);

  if (successDone) successDone.addEventListener('click', function () {
    closeOrderSuccessModal();
    cart = {};
    updateCartUI();
    refreshAddToCartButtons();
  });
}

function openCheckoutModal() {
  if (!currentUser) {
    showToast('Silakan masuk untuk melanjutkan pembelian');
    openAuthModal();
    return;
  }

  var ids = Object.keys(cart);
  if (!ids.length) return;

  var summaryEl = document.getElementById('checkout-order-summary');
  var totalEl   = document.getElementById('checkout-total-price');
  var errorEl   = document.getElementById('checkout-error');
  var notesEl   = document.getElementById('checkout-notes');

  if (errorEl) errorEl.style.display = 'none';
  if (notesEl) notesEl.value = '';

  // Uncheck all payment methods
  document.querySelectorAll('input[name="payment_method"]').forEach(function(r) { r.checked = false; });

  if (summaryEl) {
    summaryEl.innerHTML = ids.map(function(id) {
      var entry = cart[id];
      var p = entry.product;
      return '<div class="checkout-item-row">' +
        '<span class="checkout-item-name">' + escapeHtml(p.name) + (entry.qty > 1 ? ' <span class="checkout-item-qty">×' + entry.qty + '</span>' : '') + '</span>' +
        '<span class="checkout-item-price">' + formatPrice(p.price * entry.qty) + '</span>' +
        '</div>';
    }).join('');
  }

  var total = ids.reduce(function(s, id) { return s + cart[id].product.price * cart[id].qty; }, 0);
  if (totalEl) totalEl.textContent = formatPrice(total);

  var modal = document.getElementById('checkout-modal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeCheckoutModal() {
  var modal = document.getElementById('checkout-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

function openOrderSuccessModal(orderNumber, paymentMethod, total) {
  var numEl  = document.getElementById('order-success-number');
  var instEl = document.getElementById('order-success-instructions');

  if (numEl) numEl.textContent = 'No. Pesanan: ' + orderNumber;

  var instructions = '';
  var totalStr = formatPrice(total);
  var pm = paymentMethod || '';
  if (pm.indexOf('BCA') !== -1) {
    instructions = 'Transfer ke BCA 1234567890 a.n. Sentraq sebesar ' + totalStr + '. Cantumkan nomor pesanan ' + orderNumber + ' di berita transfer.';
  } else if (pm.indexOf('BRI') !== -1) {
    instructions = 'Transfer ke BRI 9876543210 a.n. Sentraq sebesar ' + totalStr + '. Cantumkan nomor pesanan ' + orderNumber + ' di berita transfer.';
  } else if (pm.indexOf('GoPay') !== -1) {
    instructions = 'Transfer GoPay ke 085716577307 sebesar ' + totalStr + '. Screenshot bukti transfer dan kirimkan ke WhatsApp kami beserta nomor pesanan ' + orderNumber + '.';
  } else if (pm.indexOf('OVO') !== -1) {
    instructions = 'Transfer OVO ke 085716577307 sebesar ' + totalStr + '. Screenshot bukti transfer dan kirimkan ke WhatsApp kami beserta nomor pesanan ' + orderNumber + '.';
  } else if (pm.indexOf('DANA') !== -1) {
    instructions = 'Transfer DANA ke 085716577307 sebesar ' + totalStr + '. Screenshot bukti transfer dan kirimkan ke WhatsApp kami beserta nomor pesanan ' + orderNumber + '.';
  } else {
    instructions = 'Silakan lakukan pembayaran sebesar ' + totalStr + ' sesuai metode yang dipilih. Cantumkan nomor pesanan ' + orderNumber + '.';
  }

  if (instEl) instEl.textContent = instructions;

  var modal = document.getElementById('order-success-modal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeOrderSuccessModal() {
  var modal = document.getElementById('order-success-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

async function handleCheckoutSubmit() {
  var sb = window._sb;
  if (!sb || !currentUser) return;

  var paymentMethodEl = document.querySelector('input[name="payment_method"]:checked');
  var errorEl = document.getElementById('checkout-error');
  var submitBtn = document.getElementById('checkout-submit-btn');

  if (!paymentMethodEl) {
    if (errorEl) { errorEl.textContent = 'Pilih metode pembayaran terlebih dahulu.'; errorEl.style.display = ''; }
    return;
  }

  if (errorEl) errorEl.style.display = 'none';

  var ids = Object.keys(cart);
  if (!ids.length) return;

  var items = ids.map(function(id) {
    var entry = cart[id];
    var p = entry.product;
    return { id: p.id, name: p.name, specs: p.specs || '', price: p.price, qty: entry.qty };
  });

  var total = ids.reduce(function(s, id) { return s + cart[id].product.price * cart[id].qty; }, 0);
  var paymentMethod = paymentMethodEl.value;
  var notes = (document.getElementById('checkout-notes') || {}).value || '';
  var orderNumber = 'SQ-' + Date.now().toString(36).slice(-6).toUpperCase();
  var displayName = (currentUser.user_metadata && currentUser.user_metadata.name) || currentUser.email || '';

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Memproses...'; }

  try {
    var res = await sb.from('transactions').insert([{
      user_id: currentUser.id,
      user_email: currentUser.email,
      user_name: displayName,
      items: items,
      total: total,
      payment_method: paymentMethod,
      payment_status: 'pending',
      notes: notes,
      order_number: orderNumber
    }]);

    if (res.error) throw res.error;

    closeCheckoutModal();
    closeCart();
    openOrderSuccessModal(orderNumber, paymentMethod, total);
  } catch(e) {
    if (errorEl) {
      errorEl.textContent = 'Gagal menyimpan pesanan: ' + (e.message || 'Coba lagi.');
      errorEl.style.display = '';
    }
    showToast('Gagal menyimpan pesanan. Coba lagi.');
  }

  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Buat Pesanan'; }
}

/* ===== WISHLIST PANEL ===== */
function initWishlistPanel() {
  var navBtn   = document.getElementById('wishlist-nav-btn');
  var closeBtn = document.getElementById('wishlist-close');

  if (navBtn) navBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var panel = document.getElementById('wishlist-panel');
    if (panel && panel.classList.contains('open')) closeWishlistPanel();
    else openWishlistPanel();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeWishlistPanel);

  document.addEventListener('click', function(e) {
    var panel  = document.getElementById('wishlist-panel');
    var navBtn = document.getElementById('wishlist-nav-btn');
    if (panel && panel.classList.contains('open') &&
        !panel.contains(e.target) && e.target !== navBtn && !navBtn.contains(e.target)) {
      closeWishlistPanel();
    }
  });
}

function openWishlistPanel() {
  closeCart();
  renderWishlistPanel();
  var panel = document.getElementById('wishlist-panel');
  if (panel) panel.classList.add('open');
}

function closeWishlistPanel() {
  var panel = document.getElementById('wishlist-panel');
  if (panel) panel.classList.remove('open');
}

function renderWishlistPanel() {
  var container = document.getElementById('wishlist-items');
  if (!container) return;

  if (!wishlist.length) {
    container.innerHTML =
      '<div class="cart-empty">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
        '</svg>' +
        '<p>Wishlist masih kosong</p>' +
      '</div>';
    return;
  }

  var html = wishlist.map(function(id) {
    var p = allProducts.find(function(x) { return x.id === id; });
    if (!p) return '';
    var imgHTML = (p.images && p.images.length)
      ? '<img src="' + escapeHtml(p.images[0]) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
      : (CATEGORY_ICONS[p.category] || CATEGORY_ICONS.default);
    return '<div class="wishlist-item">' +
      '<div class="wishlist-item-img">' + imgHTML + '</div>' +
      '<div class="cart-item-info">' +
        '<p class="cart-item-name">' + escapeHtml(p.name) + '</p>' +
        '<p class="cart-item-price">' + formatPrice(p.price) + '</p>' +
      '</div>' +
      '<div class="wishlist-item-actions">' +
        '<button class="btn btn-primary btn-sm wishlist-item-detail" data-id="' + escapeHtml(id) + '" style="font-size:11px;padding:5px 10px;">Detail</button>' +
        '<button class="wishlist-item-remove" data-id="' + escapeHtml(id) + '" aria-label="Hapus dari wishlist">&times;</button>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = html;

  container.querySelectorAll('.wishlist-item-detail').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = allProducts.find(function(x) { return x.id === btn.dataset.id; });
      if (p) { closeWishlistPanel(); openProductModal(p); }
    });
  });

  container.querySelectorAll('.wishlist-item-remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      toggleWishlist(btn.dataset.id);
    });
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
