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
  var el = document.querySelector('.footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== NAVBAR ===== */
function initNavbar() {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
    if (navbar.classList.contains('nav-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (navbar.classList.contains('nav-open') && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
}

/* ===== FILTER PILLS ===== */
function initFilterPills() {
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.product-card');
  if (!pills.length) return;

  function applyFilter(filter) {
    pills.forEach(function (pill) {
      var isActive = pill.dataset.filter === filter;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', String(isActive));
    });

    cards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      applyFilter(this.dataset.filter);
    });
  });

  document.querySelectorAll('[data-filter-nav]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var filter = this.dataset.filterNav;
      applyFilter(filter);
      var section = document.getElementById('products');
      if (section) {
        var offset = 48 + 49;
        var top = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}

/* ===== SLIDERS ===== */
function initSliders() {
  document.querySelectorAll('.product-card').forEach(function (card) {
    var track  = card.querySelector('.slider-track');
    var slides = card.querySelectorAll('.slide');
    var prev   = card.querySelector('.slider-prev');
    var next   = card.querySelector('.slider-next');
    var dots   = card.querySelectorAll('.dot');
    var total  = slides.length;

    if (!track || total === 0) return;

    if (total === 1) {
      var sliderEl = card.querySelector('.card-slider');
      if (sliderEl) sliderEl.setAttribute('data-single', '');
      return;
    }

    var current = 0;

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

    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Product image carousel');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    goTo(0);
  });
}

/* ===== FADE-UP ANIMATIONS ===== */
function initAnimations() {
  if (!('IntersectionObserver' in window)) {
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
    var delay = Math.min(i * 0.05, 0.3);
    el.style.transitionDelay = delay + 's';
    observer.observe(el);
  });
}

/* ===== LAZY IMAGES ===== */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) {
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
