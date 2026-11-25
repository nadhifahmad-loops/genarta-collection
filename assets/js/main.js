/* GENarta Collection — shared interactions */
(function () {
  'use strict';

  var WA_NUMBER = '6281357822559';
  var page = document.body.dataset.page || '';

  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!mobileBtn || !mobileMenu) return;
    mobileBtn.setAttribute('aria-expanded', String(open));
    mobileBtn.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    mobileMenu.classList.toggle('hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function () {
      setMenu(mobileBtn.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', function (event) {
      if (mobileMenu.classList.contains('hidden')) return;
      if (mobileMenu.contains(event.target) || mobileBtn.contains(event.target)) return;
      setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setMenu(false);
    });
  }

  var header = document.querySelector('.site-header');
  if (header) {
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }
  window.GENarta = { WA_NUMBER: WA_NUMBER, waLink: waLink };

  function setActiveNav(key) {
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === key) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  window.GENarta.setActiveNav = setActiveNav;

  if (page === 'detail') setActiveNav('koleksi');
  if (page === 'konsultasi') setActiveNav('kontak');

  if (page === 'beranda') {
    var navKeys = ['beranda', 'koleksi', 'cerita-kami', 'galeri', 'kontak'];
    var navSections = navKeys.map(function (key) { return document.getElementById(key); }).filter(Boolean);

    function syncActiveNav() {
      var focusLine = window.innerHeight * 0.45;
      var current = navKeys[0];
      navSections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= focusLine) current = section.id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = navKeys[navKeys.length - 1];
      }
      setActiveNav(current);
    }

    var lastNavSync = 0;
    function queueActiveNav() {
      var now = Date.now();
      if (now - lastNavSync < 60) return;
      lastNavSync = now;
      syncActiveNav();
    }

    document.querySelectorAll('[data-nav]').forEach(function (link) {
      link.addEventListener('click', function () { setActiveNav(link.getAttribute('data-nav')); });
    });
    window.addEventListener('scroll', queueActiveNav, { passive: true });
    window.addEventListener('resize', queueActiveNav);
    window.addEventListener('hashchange', syncActiveNav);
    syncActiveNav();

    var filterChips = document.querySelectorAll('.filter-chip');
    var productCards = document.querySelectorAll('.product-card');

    function filterProducts(category) {
      filterChips.forEach(function (chip) {
        var active = chip.getAttribute('data-filter') === category;
        chip.setAttribute('aria-pressed', String(active));
        chip.classList.toggle('bg-earthy-brown', active);
        chip.classList.toggle('text-on-tertiary', active);
        chip.classList.toggle('bg-surface-container-low', !active);
        chip.classList.toggle('border', !active);
        chip.classList.toggle('border-outline-variant', !active);
        chip.classList.toggle('text-on-surface-variant', !active);
      });
      productCards.forEach(function (card) {
        var match = category === 'Semua' || card.getAttribute('data-category') === category;
        card.classList.toggle('hidden', !match);
      });
    }

    window.filterProducts = filterProducts;
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () { filterProducts(chip.getAttribute('data-filter')); });
    });
    document.querySelectorAll('[data-filter-link]').forEach(function (link) {
      link.addEventListener('click', function () { filterProducts(link.getAttribute('data-filter-link')); });
    });
  }

  if (page === 'detail') {
    var mainImage = document.getElementById('main-product-image');
    var thumbs = document.querySelectorAll('.gallery-thumb');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.getAttribute('data-gallery-src');
        var alt = thumb.getAttribute('data-gallery-alt') || thumb.querySelector('img').alt;
        if (mainImage && src) {
          mainImage.src = src;
          mainImage.alt = alt;
        }
        thumbs.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === thumb));
        });
      });
    });

    var optionChips = document.querySelectorAll('.option-chip');
    optionChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        optionChips.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === chip));
        });
      });
    });
  }

  if (page === 'konsultasi') {
    var form = document.getElementById('custom-order-form');
    var feedback = document.getElementById('form-feedback');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;

        var value = function (id) {
          var field = document.getElementById(id);
          return field ? field.value.trim() : '';
        };
        var message = [
          'Halo GENarta Collection, saya ingin konsultasi pesanan custom.',
          '',
          'Nama: ' + value('field-nama'),
          'WhatsApp: ' + value('field-wa'),
          'Kategori: ' + value('field-kategori'),
          'Momen/Kebutuhan: ' + (value('field-momen') || '-'),
          'Jumlah: ' + (value('field-jumlah') || '-'),
          'Anggaran: ' + (value('field-anggaran') || '-'),
          'Ide/Warna/Referensi: ' + (value('field-catatan') || '-')
        ].join('\n');

        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.setAttribute('role', 'status');
          feedback.textContent = 'Ringkasan siap dikirim. WhatsApp akan terbuka dengan pesan yang sudah terisi.';
        }
        window.location.href = waLink(message);
      });
    }
  }
})();
