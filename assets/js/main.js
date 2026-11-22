(function () {
  'use strict';

  const CONSENT_KEY = 'ret_cookie_consent';

  function initCookieBanner() {
    const banner = document.getElementById('iubenda-cs-banner');
    const prefBtn = document.getElementById('iubenda-cs-preferences-btn');
    if (!banner) return;

    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      banner.classList.add('hidden');
    }

    const dismissWith = (choice) => {
      try {
        localStorage.setItem(CONSENT_KEY, choice);
      } catch (_) {}
      banner.classList.add('hidden');
    };

    banner.querySelectorAll('[data-cookie-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-cookie-action');
        if (action === 'accept' || action === 'reject') {
          dismissWith(action);
        } else if (action === 'customize') {
          alert('Preferenze cookie: cookie tecnici essenziali sempre attivi. Puoi accettare o rifiutare i cookie di misurazione e marketing.');
        }
      });
    });

    if (prefBtn) {
      prefBtn.addEventListener('click', () => {
        banner.classList.remove('hidden');
      });
    }
  }

  function initMobileMenu() {
    const switcher = document.querySelector('.stm_mobile_switcher');
    const navMenu = document.querySelector('.stm_nav_menu');
    if (!switcher || !navMenu) return;

    switcher.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      switcher.setAttribute(
        'aria-expanded',
        navMenu.classList.contains('active') ? 'true' : 'false'
      );
    });
  }

  function initRoiCalculator() {
    const calc = document.getElementById('roi-calculator');
    if (!calc) return;

    const slider = document.getElementById('roi-capital-slider');
    const capitalOut = document.getElementById('roi-capital-display');
    const netOut = document.getElementById('roi-net-profit');
    const totalOut = document.getElementById('roi-total-return');
    const annualOut = document.getElementById('roi-annualized');
    const rateOut = document.getElementById('roi-effective-rate');
    const bonusCheck = document.getElementById('roi-network-bonus');
    const modeButtons = Array.from(calc.querySelectorAll('[data-roi-mode]'));

    let baseRate = 0.15;
    let months = 9.5;

    const fmtEur = (n) =>
      '€ ' + Math.round(n).toLocaleString('it-IT');

    function update() {
      const capital = Number(slider ? slider.value : 50000);
      const bonus = bonusCheck && bonusCheck.checked ? 0.01 : 0;
      const effectiveRate = baseRate + bonus;
      const netProfit = capital * effectiveRate;
      const totalReturn = capital + netProfit;
      const annualized = effectiveRate * (12 / months) * 100;

      if (capitalOut) capitalOut.textContent = fmtEur(capital);
      if (netOut) netOut.textContent = '+' + fmtEur(netProfit);
      if (totalOut) totalOut.textContent = fmtEur(totalReturn);
      if (rateOut) rateOut.textContent = `${(effectiveRate * 100).toFixed(0)}%`;
      if (annualOut) annualOut.textContent = `${annualized.toFixed(1)}% / anno`;
    }

    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        baseRate = parseFloat(btn.getAttribute('data-rate') || '0.15');
        months = parseFloat(btn.getAttribute('data-months') || '9.5');
        update();
      });
    });

    if (slider) slider.addEventListener('input', update);
    if (bonusCheck) bonusCheck.addEventListener('change', update);
    update();
  }

  function initCarousel() {
    const track = document.getElementById('apartments-carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (!track || !prevBtn || !nextBtn) return;

    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function updateCarousel() {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, slides.length - visible);
      if (currentIndex > maxIndex) currentIndex = 0;
      if (currentIndex < 0) currentIndex = maxIndex;

      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = 20;
      const offset = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
    }

    prevBtn.addEventListener('click', () => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, slides.length - visible);
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, slides.length - visible);
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
  }

  function initCardToggles() {
    document.querySelectorAll('.property-icon-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('active');
      });
    });
  }

  function initForms() {
    document.querySelectorAll('form[data-ret-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedback = form.querySelector('.form-feedback');
        const nameInput = form.querySelector('[name="your-name"]');
        const emailInput = form.querySelector('[name="your-email"]');
        const privacyBox = form.querySelector('[name="acceptance-397"]');

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const privacyOk = privacyBox ? privacyBox.checked : true;

        if (!nameVal || !emailVal || !emailVal.includes('@')) {
          if (feedback) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Compila i campi obbligatori (Nome e Cognome, Email valida).';
          }
          return;
        }

        if (!privacyOk) {
          if (feedback) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'È necessario accettare la Privacy Policy per inviare il messaggio.';
          }
          return;
        }

        if (feedback) {
          feedback.className = 'form-feedback success';
          feedback.textContent = 'Grazie per il tuo messaggio. È stato inviato con successo.';
        }
        form.reset();
      });
    });
  }

  function initListingFilters() {
    const grid = document.getElementById('listings-grid');
    if (!grid) return;

    const searchInput = document.getElementById('filter-search');
    const roomsSelect = document.getElementById('filter-rooms');
    const priceSelect = document.getElementById('filter-price');
    const resetBtn = document.getElementById('filter-reset');
    const saveBtn = document.getElementById('filter-save');
    const countEl = document.getElementById('listings-count');
    const tabs = Array.from(document.querySelectorAll('.filter-tab[data-tab]'));
    const cards = Array.from(grid.querySelectorAll('[data-listing]'));

    let activeType = 'all';

    function setTab(type) {
      activeType = type;
      tabs.forEach((t) => {
        t.classList.toggle('active', t.getAttribute('data-tab') === type);
      });
      applyFilter();
    }

    function applyFilter() {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const minSurface = roomsSelect ? parseInt(roomsSelect.value || '0', 10) : 0;
      const maxPrice = priceSelect ? parseInt(priceSelect.value || '99999999', 10) : 99999999;

      let shown = 0;
      cards.forEach((card) => {
        const type = (card.getAttribute('data-type') || 'mgrv').toLowerCase();
        const code = (card.getAttribute('data-code') || '').toLowerCase();
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const surface = parseInt(card.getAttribute('data-surface') || '0', 10);
        const price = parseInt(card.getAttribute('data-price') || '0', 10);

        const matchType = activeType === 'all' || type === activeType;
        const matchQ = !q || title.includes(q) || code.includes(q);
        const matchSurface = surface >= minSurface;
        const matchPrice = price <= maxPrice;

        if (matchType && matchQ && matchSurface && matchPrice) {
          card.style.display = '';
          shown += 1;
        } else {
          card.style.display = 'none';
        }
      });

      if (countEl) {
        countEl.textContent = `${shown} immobili trovati`;
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        setTab(tab.getAttribute('data-tab') || 'all');
      });
    });

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (roomsSelect) roomsSelect.addEventListener('change', applyFilter);
    if (priceSelect) priceSelect.addEventListener('change', applyFilter);

    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) searchInput.value = '';
        if (roomsSelect) roomsSelect.value = '0';
        if (priceSelect) priceSelect.value = '99999999';
        setTab('all');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Ricerca salvata nelle preferenze locali del browser.');
      });
    }

    const hash = window.location.hash.replace('#', '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const paramType = (params.get('type') || '').toLowerCase();
    if (hash === 'mgra' || paramType === 'mgra') {
      setTab('mgra');
    } else if (hash === 'mgrv' || paramType === 'mgrv') {
      setTab('mgrv');
    } else {
      applyFilter();
    }
  }

  function initBlogSearch() {
    const searchInput = document.getElementById('blog-search-input');
    const searchForm = document.getElementById('blog-search-form');
    const articles = Array.from(document.querySelectorAll('.blog-article-card'));
    if (!searchInput || articles.length === 0) return;

    function filterArticles() {
      const q = searchInput.value.trim().toLowerCase();
      articles.forEach((art) => {
        const text = art.textContent.toLowerCase();
        art.style.display = !q || text.includes(q) ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', filterArticles);
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterArticles();
      });
    }
  }

  function lerpNums(a, b, t) {
    return a.map((v, i) => (v + (b[i] - v) * t).toFixed(2));
  }

  function buildMorphPath(vals) {
    return (
      `M${vals[0]} ${vals[1]}` +
      `L${vals[2]} ${vals[3]}` +
      `C${vals[4]} ${vals[5]} ${vals[6]} ${vals[7]} ${vals[8]} ${vals[9]}` +
      `L${vals[10]} ${vals[11]}` +
      `C${vals[12]} ${vals[13]} ${vals[14]} ${vals[15]} ${vals[16]} ${vals[17]}` +
      `L${vals[18]} ${vals[19]}` +
      `C${vals[20]} ${vals[21]} ${vals[22]} ${vals[23]} ${vals[24]} ${vals[25]}` +
      `L${vals[26]} ${vals[27]}` +
      `C${vals[28]} ${vals[29]} ${vals[30]} ${vals[31]} ${vals[32]} ${vals[33]}Z`
    );
  }

  function initArborHeroAndIntro() {
    const loader = document.getElementById('arbor-loader');
    const loaderFill = document.getElementById('arbor-loader-fill');
    const loaderPct = document.getElementById('arbor-loader-pct');
    const video = document.getElementById('arbor-hero-video');
    const titleEl = document.getElementById('hero-stagger-title');
    const replayBtn = document.getElementById('replay-hero-btn');

    if (titleEl) {
      const rawText = titleEl.textContent.trim();
      titleEl.innerHTML = rawText
        .split(' ')
        .map((word) => {
          const chars = Array.from(word)
            .map((ch) => `<span class="char">${ch}</span>`)
            .join('');
          return `<span class="word-wrap" style="display:inline-block;margin-right:0.22em;">${chars}</span>`;
        })
        .join('');
    }

    function revealHeroTitle() {
      if (!titleEl) return;
      titleEl.classList.add('is-revealed');
      titleEl.querySelectorAll('.char').forEach((ch, idx) => {
        ch.style.transitionDelay = `${idx * 35}ms`;
      });
    }

    function startHeroVideo() {
      if (!video) {
        revealHeroTitle();
        return;
      }
      const isMobile = window.matchMedia('(max-width: 600px)').matches;
      const desiredSrc = isMobile ? '/assets/arbor/hero-m.webm' : '/assets/arbor/hero.mp4';
      if (!video.getAttribute('src')) {
        video.setAttribute('src', desiredSrc);
        video.load();
      }
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => revealHeroTitle());
      }
      setTimeout(revealHeroTitle, 1800);
    }

    if (video) {
      video.addEventListener('ended', revealHeroTitle);
    }

    if (replayBtn && video) {
      replayBtn.addEventListener('click', () => {
        if (titleEl) titleEl.classList.remove('is-revealed');
        startHeroVideo();
      });
    }

    if (loader) {
      const alreadyLoaded = (() => {
        try {
          return sessionStorage.getItem('ret_arbor_loaded') === '1';
        } catch (_) {
          return false;
        }
      })();
      if (alreadyLoaded) {
        if (loaderFill) loaderFill.style.width = '100%';
        if (loaderPct) loaderPct.textContent = '100%';
        loader.classList.add('is-done');
        startHeroVideo();
      } else {
        let pct = 0;
        const startTs = performance.now();
        const duration = 950;
        function tick(now) {
          const p = Math.min(1, (now - startTs) / duration);
          pct = Math.round(p * 100);
          if (loaderFill) loaderFill.style.width = `${pct}%`;
          if (loaderPct) loaderPct.textContent = `${pct}%`;
          if (p < 1) {
            requestAnimationFrame(tick);
          } else {
            try {
              sessionStorage.setItem('ret_arbor_loaded', '1');
            } catch (_) {}
            loader.classList.add('is-done');
            startHeroVideo();
          }
        }
        requestAnimationFrame(tick);
      }
    } else {
      startHeroVideo();
    }

    // #Introduction sticky scroll & clickable morphing frames
    const scroller = document.getElementById('arbor-intro-scroller');
    if (!scroller) return;

    const clip1Path = document.querySelector('#morphClip1 path');
    const clip2Path = document.querySelector('#morphClip2 path');
    const morphWrapper = document.getElementById('intro-morph-wrapper');
    const morph1A = document.querySelector('.morph1ImgA');
    const morph1B = document.querySelector('.morph1ImgB');
    const morph2A = document.querySelector('.morph2ImgA');
    const morph2B = document.querySelector('.morph2ImgB');
    const fillEl = document.getElementById('intro-progress-fill');
    const screens = [
      document.querySelector('.intro-screen-1'),
      document.querySelector('.intro-screen-2'),
      document.querySelector('.intro-screen-3'),
    ];
    const stepBtns = Array.from(document.querySelectorAll('.intro-step-btn'));

    const clip1Start = [
      553.198, 0.001, 189.96, 2.33, 163.484, 2.499, 140.431, 20.448, 133.781, 46.07,
      1.881, 554.296, -5.394, 582.328, 8.974, 611.457, 35.647, 622.752, 499.834, 819.32,
      537.355, 835.208, 579.21, 808.786, 580.992, 768.087, 611.943, 60.966, 613.404, 27.588,
      586.616, -0.213, 553.198, 0.001,
    ];
    const clip1End = [
      612.999, 748.068, 612.999, 103, 612.999, 53.849, 568.667, 17.658, 522.631, 29.227,
      295.544, 86.296, 274.234, 91.652, 256.362, 106.645, 246.852, 127.146, 7.286, 616.516,
      -13.391, 661.088, 11.885, 713.945, 58.597, 723.818, 525.25, 822.446, 570.586, 832.028,
      612.999, 796.077, 612.999, 748.068,
    ];
    const clip2Start = [
      0.001, 662.73, 0.001, 67.278, 0.001, 23.734, 40.716, -8.329, 82.997, 1.921,
      291.561, 52.48, 311.134, 57.225, 327.547, 70.507, 336.282, 88.67, 556.309, 546.185,
      575.299, 585.673, 552.085, 632.5, 509.182, 641.246, 80.593, 728.624, 38.955, 737.112,
      0.001, 705.263, 0.001, 662.73,
    ];
    const clip2End = [
      536.07, 261.245, 562.89, 534.277, 564.225, 547.866, 553.215, 559.504, 539.519, 558.983,
      39.322, 539.961, 27.484, 539.511, 18.001, 530.038, 17.583, 518.245, 0.015, 23.357,
      -0.589, 6.329, 17.267, -5.178, 32.61, 2.35, 523.555, 243.229, 530.574, 246.673,
      535.308, 253.488, 536.07, 261.245,
    ];

    function applyIntroProgress(progress) {
      const p = Math.max(0, Math.min(1, progress));
      const morphT = Math.max(0, Math.min(1, (p - 0.14) / 0.36));

      if (clip1Path) clip1Path.setAttribute('d', buildMorphPath(lerpNums(clip1Start, clip1End, morphT)));
      if (clip2Path) clip2Path.setAttribute('d', buildMorphPath(lerpNums(clip2Start, clip2End, morphT)));

      if (morph1A) morph1A.style.opacity = String(1 - morphT);
      if (morph1B) morph1B.style.opacity = String(morphT);
      if (morph2A) morph2A.style.opacity = String(1 - morphT);
      if (morph2B) morph2B.style.opacity = String(morphT);

      if (morphWrapper) {
        const isNarrow = window.innerWidth <= 1024;
        const shiftX = isNarrow ? 0 : -morphT * 92;
        const fadeOut = p > 0.68 ? Math.max(0.18, 1 - (p - 0.68) * 2.5) : 1;
        morphWrapper.style.transform = `translateX(${shiftX}%)`;
        morphWrapper.style.opacity = String(fadeOut);
      }

      if (fillEl) fillEl.style.width = `${33.3 + p * 66.7}%`;

      const activeIdx = p < 0.34 ? 0 : p < 0.72 ? 1 : 2;
      screens.forEach((s, i) => {
        if (s) s.classList.toggle('is-active', i === activeIdx);
      });
      stepBtns.forEach((b, i) => {
        b.classList.toggle('active', i === activeIdx);
      });
    }

    function updateOnScroll() {
      const rect = scroller.getBoundingClientRect();
      const total = Math.max(1, scroller.offsetHeight - window.innerHeight);
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      applyIntroProgress(scrolled / total);
    }

    window.addEventListener('scroll', updateOnScroll, { passive: true });
    stepBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const total = Math.max(1, scroller.offsetHeight - window.innerHeight);
        const topAbs = scroller.getBoundingClientRect().top + window.scrollY;
        const targetRatio = idx === 0 ? 0.05 : idx === 1 ? 0.52 : 0.88;
        window.scrollTo({ top: topAbs + total * targetRatio, behavior: 'smooth' });
        applyIntroProgress(targetRatio);
      });
    });

    applyIntroProgress(0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCookieBanner();
    initMobileMenu();
    initArborHeroAndIntro();
    initRoiCalculator();
    initCarousel();
    initCardToggles();
    initForms();
    initListingFilters();
    initBlogSearch();
  });
})();
