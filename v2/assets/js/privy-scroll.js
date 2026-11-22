/**
 * Version B — Privy Collection Scroll & Interactive Engine
 * Replicates sobha-privy-collection.com desktop wheel inertia,
 * magnetic gravity wells, polarity header inversion, expanding triptych,
 * pinned Three Worlds, scroll-driven horizontal tenets slider, and catalog.
 */
(function () {
  'use strict';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------------------------------------------------------
     1. Preloader
     --------------------------------------------------------- */
  const preloader = document.getElementById('privy-preloader');
  function dismissPreloader() {
    if (preloader && !preloader.classList.contains('is-done')) {
      preloader.classList.add('is-done');
    }
  }
  window.addEventListener('load', () => setTimeout(dismissPreloader, 350));
  setTimeout(dismissPreloader, 1600);

  /* ---------------------------------------------------------
     2. Populate 34-Property Collection (Strictly No MGRV/MGRA in Headings/Tabs)
     --------------------------------------------------------- */
  const catalogGrid = document.getElementById('catalogo-grid');
  const catalogTabs = document.querySelectorAll('.catalogo-tab');
  let activeFilter = 'all';

  function renderCatalog(filter) {
    if (!catalogGrid || !Array.isArray(window.PRIVY_PROPERTIES)) return;
    const list = window.PRIVY_PROPERTIES.filter((item) => {
      if (filter === 'all') return true;
      return item.type === filter;
    });

    catalogGrid.innerHTML = list
      .map((item) => {
        const specsHtml = (item.specs || [])
          .slice(0, 3)
          .map((s) => `<span>${s}</span>`)
          .join('');
        return `
          <article class="privy-prop-card">
            <a href="${item.href}" target="_blank" rel="noopener" class="privy-prop-card__media" aria-label="${item.title}">
              <img src="${item.image}" alt="${item.title}" loading="lazy">
              <div class="privy-prop-card__badges">
                <span class="privy-prop-card__tag">${item.category}</span>
                <span class="privy-prop-card__code">COD. ${item.code}</span>
              </div>
            </a>
            <div class="privy-prop-card__body">
              <div>
                <div class="privy-prop-card__loc">${item.location}</div>
                <h3 class="privy-prop-card__title">${item.title}</h3>
              </div>
              ${specsHtml ? `<div class="privy-prop-card__specs">${specsHtml}</div>` : ''}
              <div class="privy-prop-card__foot">
                <span class="privy-prop-card__price">${item.price_label || 'Su richiesta'}</span>
                <a class="privy-prop-card__cta" href="${item.href}" target="_blank" rel="noopener">Dettagli &rarr;</a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  catalogTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      catalogTabs.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter || 'all';
      renderCatalog(activeFilter);
    });
  });

  renderCatalog('all');

  document.querySelectorAll('[data-jump-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.jumpFilter || 'all';
      catalogTabs.forEach((b) => {
        b.classList.toggle('is-active', (b.dataset.filter || 'all') === f);
      });
      renderCatalog(f);
      smoothJumpTo('#catalogo');
    });
  });

  /* ---------------------------------------------------------
     3. Split Manifesto Into Scrub Words
     --------------------------------------------------------- */
  const manifestoEl = document.getElementById('manifesto-words');
  let manifestoWords = [];
  if (manifestoEl) {
    const tokens = manifestoEl.textContent.trim().split(/\s+/);
    manifestoEl.innerHTML = tokens
      .map((w) => `<span class="scrub-word">${w}</span>`)
      .join(' ');
    manifestoWords = Array.from(manifestoEl.querySelectorAll('.scrub-word'));
  }

  /* ---------------------------------------------------------
     4. Inertial Wheel Physics + Magnetic Gravity Wells
     --------------------------------------------------------- */
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth <= 960 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let targetY = window.scrollY || 0;
  let currentY = window.scrollY || 0;
  let wheelActive = false;
  let gravityTimer = null;

  function maxScrollY() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function smoothJumpTo(selectorOrY) {
    let destY = 0;
    if (typeof selectorOrY === 'number') {
      destY = selectorOrY;
    } else {
      const el = document.querySelector(selectorOrY);
      if (!el) return;
      destY = window.scrollY + el.getBoundingClientRect().top;
    }
    targetY = clamp(destY, 0, maxScrollY());
    wheelActive = true;
    if (isTouch) {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      wheelActive = false;
    }
  }

  function scheduleGravityWell() {
    if (gravityTimer) clearTimeout(gravityTimer);
    gravityTimer = setTimeout(() => {
      if (document.body.classList.contains('modal-open')) return;
      const wells = document.querySelectorAll('[data-gravity-well]');
      const vh = window.innerHeight;
      const threshold = vh * 0.14;
      let bestDist = Infinity;
      let bestTarget = null;

      wells.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const absTop = currentY + rect.top;
        const dist = Math.abs(absTop - currentY);
        if (dist > 3 && dist < threshold && dist < bestDist) {
          bestDist = dist;
          bestTarget = absTop;
        }
      });

      if (bestTarget !== null) {
        targetY = clamp(bestTarget, 0, maxScrollY());
        wheelActive = true;
      }
    }, 180);
  }

  if (!isTouch) {
    window.addEventListener(
      'wheel',
      (e) => {
        if (document.body.classList.contains('modal-open')) return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        if (!wheelActive) {
          targetY = window.scrollY;
          currentY = window.scrollY;
        }
        wheelActive = true;
        const factor = e.deltaMode === 1 ? 34 : 1.05;
        targetY = clamp(targetY + e.deltaY * factor, 0, maxScrollY());
        scheduleGravityWell();
      },
      { passive: false }
    );
  }

  window.addEventListener('scroll', () => {
    if (!wheelActive) {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        closeModals();
        smoothJumpTo(id);
      }
    });
  });

  const introArrow = document.querySelector('.intro__arrow');
  if (introArrow) {
    introArrow.addEventListener('click', () => smoothJumpTo('#about'));
  }

  /* ---------------------------------------------------------
     5. Cursor Scroll Indicator (Desktop Fine Pointer)
     --------------------------------------------------------- */
  const cursorEl = document.getElementById('privy-cursor');
  const cursorPct = document.getElementById('privy-cursor-pct');
  if (cursorEl && !isTouch) {
    document.addEventListener('mousemove', (e) => {
      cursorEl.classList.add('is-visible');
      cursorEl.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
    });
    document.addEventListener('mouseleave', () => cursorEl.classList.remove('is-visible'));
  }

  /* ---------------------------------------------------------
     6. Unified Scroll Choreography Loop
     --------------------------------------------------------- */
  const headerEl = document.getElementById('privy-header');
  const railFill = document.getElementById('privy-rail-fill');
  const themedSections = Array.from(document.querySelectorAll('[data-themed-class]'));

  const heroSec = document.getElementById('hero');
  const heroStage = document.getElementById('hero-stage');

  const aboutSec = document.getElementById('about');
  const tCenter = document.getElementById('triptych-center');
  const tLeft = document.getElementById('triptych-left');
  const tRight = document.getElementById('triptych-right');

  const manifestoSec = document.getElementById('manifesto');

  const mondiSec = document.getElementById('mondi');
  const mondiBtns = Array.from(document.querySelectorAll('.mondi-item-btn'));
  const mondiMedia = Array.from(document.querySelectorAll('.mondi-media'));
  const mondiCounter = document.getElementById('mondi-counter');
  const mondiBarFill = document.getElementById('mondi-bar-fill');
  const mondiDesc = document.getElementById('mondi-desc');
  const MONDI_DESCS = [
    'Appartamenti d’epoca ristrutturati, attici panoramici e dimore residenziali pronte da vivere nei quartieri più ricercati di Torino e Asti.',
    'Soluzioni abitative selezionate in locazione per professionisti, executive e residenze di rappresentanza con assistenza contrattuale dedicata.',
    'Operazioni immobiliari, frazionamenti e valorizzazioni patrimoniali ad alta marginalità gestite con rigore tecnico dal 2009.'
  ];
  let activeWorldIdx = 0;

  function setActiveWorld(idx) {
    if (idx === activeWorldIdx && mondiDesc && mondiDesc.textContent) return;
    activeWorldIdx = idx;
    mondiBtns.forEach((b, i) => b.classList.toggle('is-active', i === idx));
    mondiMedia.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    if (mondiCounter) mondiCounter.textContent = `0${idx + 1} / 03`;
    if (mondiBarFill) mondiBarFill.style.width = `${((idx + 1) / 3) * 100}%`;
    if (mondiDesc) mondiDesc.textContent = MONDI_DESCS[idx] || '';
    const jump = document.getElementById('mondi-jump');
    if (jump) {
      jump.dataset.jumpFilter = idx === 0 ? 'mgrv' : idx === 1 ? 'mgra' : 'all';
    }
  }

  mondiBtns.forEach((b, idx) => {
    b.addEventListener('click', () => {
      setActiveWorld(idx);
    });
  });

  const pilastriSec = document.getElementById('pilastri');
  const pilastriTrack = document.getElementById('pilastri-track');
  const pilastriCounter = document.getElementById('pilastri-counter');
  const pilastriFill = document.getElementById('pilastri-progress-fill');

  const sediSec = document.getElementById('sedi');
  const sediSteps = Array.from(document.querySelectorAll('.sedi-step'));
  const sediPhotos = Array.from(document.querySelectorAll('.sedi-photo'));
  let activeSedeIdx = 0;

  function setActiveSede(idx) {
    activeSedeIdx = idx;
    sediSteps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    sediPhotos.forEach((p, i) => p.classList.toggle('is-active', i === idx));
  }
  sediSteps.forEach((s, i) => s.addEventListener('click', () => setActiveSede(i)));

  function tick() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const maxY = maxScrollY();

    if (!isTouch && wheelActive) {
      currentY = lerp(currentY, targetY, 0.088);
      if (Math.abs(targetY - currentY) < 0.45) {
        currentY = targetY;
        wheelActive = false;
      }
      window.scrollTo(0, currentY);
    } else {
      currentY = window.scrollY;
      targetY = currentY;
    }

    const totalPct = maxY > 0 ? clamp(Math.round((currentY / maxY) * 100), 0, 100) : 0;
    if (railFill) railFill.style.height = `${totalPct}%`;
    if (cursorPct) cursorPct.textContent = `${String(totalPct).padStart(2, '0')}%`;

    // Header Polarity Inversion (ui-light vs ui-dark)
    if (headerEl && themedSections.length) {
      const probeY = 44;
      let isLight = false;
      for (const sec of themedSections) {
        const r = sec.getBoundingClientRect();
        if (r.top <= probeY && r.bottom > probeY) {
          isLight = (sec.dataset.themedClass || '').includes('ui-light');
          break;
        }
      }
      headerEl.classList.toggle('is-light', isLight);
    }

    // Hero zoom-out parallax
    if (heroSec && heroStage) {
      const hr = heroSec.getBoundingClientRect();
      const hp = clamp(-hr.top / vh, 0, 1);
      heroStage.style.transform = `scale(${1 - hp * 0.06})`;
      heroStage.style.opacity = `${1 - hp * 0.65}`;
    }

    // #about Expanding Triptych
    if (aboutSec && tCenter && vw > 960) {
      const r = aboutSec.getBoundingClientRect();
      const denom = Math.max(1, r.height - vh);
      const p = clamp(-r.top / denom, 0, 1);
      const cScale = 1.32 - 0.32 * p;
      const clipTB = (1 - p) * 9;
      tCenter.style.transform = `scale(${cScale.toFixed(4)})`;
      tCenter.style.clipPath = `inset(${clipTB.toFixed(2)}% 0% ${clipTB.toFixed(2)}% 0%)`;
      if (tLeft) {
        tLeft.style.transform = `translate3d(${((1 - p) * 6).toFixed(2)}vw, ${((1 - p) * 40).toFixed(1)}px, 0)`;
        tLeft.style.opacity = `${(0.45 + 0.55 * p).toFixed(3)}`;
      }
      if (tRight) {
        tRight.style.transform = `translate3d(${(-(1 - p) * 6).toFixed(2)}vw, ${((1 - p) * -40).toFixed(1)}px, 0)`;
        tRight.style.opacity = `${(0.45 + 0.55 * p).toFixed(3)}`;
      }
    }

    // #manifesto Word Scrub
    if (manifestoSec && manifestoWords.length) {
      const r = manifestoSec.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.35), 0, 1);
      const litCount = Math.floor(p * (manifestoWords.length + 1));
      manifestoWords.forEach((w, i) => w.classList.toggle('is-lit', i < litCount));
    }

    // #mondi Pinned 3 Worlds
    if (mondiSec && vw > 960) {
      const r = mondiSec.getBoundingClientRect();
      const denom = Math.max(1, r.height - vh);
      const p = clamp(-r.top / denom, 0, 0.999);
      const idx = Math.min(2, Math.floor(p * 3));
      setActiveWorld(idx);
    }

    // #pilastri Sticky Horizontal Tenets Scroller
    if (pilastriSec && pilastriTrack && vw > 960) {
      const r = pilastriSec.getBoundingClientRect();
      const denom = Math.max(1, r.height - vh);
      const p = clamp(-r.top / denom, 0, 1);
      const maxShift = Math.max(0, pilastriTrack.scrollWidth - vw + 48);
      pilastriTrack.style.transform = `translate3d(${(-p * maxShift).toFixed(1)}px, 0, 0)`;
      const step = Math.min(6, Math.floor(p * 6) + 1);
      if (pilastriCounter) pilastriCounter.textContent = `0${step} — 06`;
      if (pilastriFill) pilastriFill.style.width = `${Math.max(16, Math.round(p * 100))}%`;
    }

    // #sedi Pinned Location Morph
    if (sediSec && vw > 960) {
      const r = sediSec.getBoundingClientRect();
      const denom = Math.max(1, r.height - vh);
      const p = clamp(-r.top / denom, 0, 0.999);
      const idx = Math.min(sediSteps.length - 1, Math.floor(p * sediSteps.length));
      if (idx !== activeSedeIdx) setActiveSede(idx);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  /* ---------------------------------------------------------
     7. Modals (Menu Overlay & Interactive Map Modal)
     --------------------------------------------------------- */
  const menuModal = document.getElementById('privy-menu-modal');
  const mapModal = document.getElementById('privy-map-modal');

  function closeModals() {
    if (menuModal) menuModal.classList.remove('is-open');
    if (mapModal) mapModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-open-menu]').forEach((el) =>
    el.addEventListener('click', () => {
      closeModals();
      if (menuModal) {
        menuModal.classList.add('is-open');
        document.body.classList.add('modal-open');
      }
    })
  );

  document.querySelectorAll('[data-open-map]').forEach((el) =>
    el.addEventListener('click', () => {
      closeModals();
      if (mapModal) {
        mapModal.classList.add('is-open');
        document.body.classList.add('modal-open');
      }
    })
  );

  document.querySelectorAll('[data-close-modal]').forEach((el) =>
    el.addEventListener('click', closeModals)
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  /* ---------------------------------------------------------
     8. Private Consultation Inquiry Form
     --------------------------------------------------------- */
  const v2Form = document.getElementById('privy-contact-form');
  if (v2Form) {
    v2Form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fb = v2Form.querySelector('.privy-form-feedback');
      const name = (v2Form.querySelector('[name="name"]') || {}).value || '';
      const email = (v2Form.querySelector('[name="email"]') || {}).value || '';
      const consent = (v2Form.querySelector('[name="consent"]') || {}).checked;
      if (!name.trim() || !email.trim() || !email.includes('@')) {
        if (fb) {
          fb.className = 'privy-form-feedback error';
          fb.textContent = 'Inserisci nome completo ed email valida prima di inviare.';
        }
        return;
      }
      if (!consent) {
        if (fb) {
          fb.className = 'privy-form-feedback error';
          fb.textContent = 'Conferma il consenso al trattamento dati per inviare la richiesta.';
        }
        return;
      }
      if (fb) {
        fb.className = 'privy-form-feedback success';
        fb.textContent =
          'Richiesta registrata. Puoi contattare direttamente Marco Grivetto al +39 347 0034777 o via email a marco@royalteam-immobiliare.it.';
      }
    });
  }
})();
