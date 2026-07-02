/* ============================================================
   PORTFOLIO – main.js
   Fonctionnalités :
     1. Thème clair / sombre (persisté en localStorage)
     2. Menu burger mobile
     3. Navigation page par page (dots, clavier, molette, tactile)
     4. Animations d'entrée du hero + typewriter du panneau code
     5. Reveal en cascade des éléments de chaque page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     0. THÈME CLAIR / SOMBRE
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('theme') || 'light';

  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next   = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });


  /* ----------------------------------------------------------
     1. MENU BURGER (mobile)
  ---------------------------------------------------------- */
  const burger   = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  // Ferme le menu quand on clique sur un lien
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });


  /* ----------------------------------------------------------
     2. NAVIGATION DE PAGES — une section = une page
  ---------------------------------------------------------- */
  const wrapper  = document.getElementById('pagesWrapper');
  const dotsWrap = document.getElementById('pageDots');
  const prevBtn  = document.getElementById('prevPage');
  const nextBtn  = document.getElementById('nextPage');
  const pageNum  = document.getElementById('pageNum');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!wrapper) return;

  const pages = Array.from(wrapper.querySelectorAll(':scope > section'));
  let current     = 0;
  let animating   = false;
  const DURATION  = 420; // ms — durée de la transition CSS

  /* Création des dots */
  const dots = pages.map((page, i) => {
    const btn = document.createElement('button');
    btn.className  = 'page-dot' + (i === 0 ? ' active' : '');
    btn.title      = page.id;
    btn.setAttribute('aria-label', `Page ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  /* Mise à jour des contrôles */
  function syncControls() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages.length - 1;
    if (pageNum) pageNum.textContent = `${current + 1} / ${pages.length}`;

    navAnchors.forEach(a => {
      a.classList.toggle('active-nav', a.getAttribute('href') === `#${pages[current].id}`);
    });
  }

  /* ── Typewriter code panel ── */
  // [ plaintext, highlightedHTML ]
  const CODE_LINES = [
    ['// about_me.js',                '<span class="c-cmt">// about_me.js</span>'],
    ['',                              ''],
    ['const sitraka = {',             '<span class="c-kw">const</span> <span class="c-id">sitraka</span> = {'],
    ['  name:  "Sitraka R.",',        '  <span class="c-key">name</span>:  <span class="c-str">"Sitraka R."</span>,'],
    ['  role:  "Full Stack Dev",',    '  <span class="c-key">role</span>:  <span class="c-str">"Full Stack Dev"</span>,'],
    ['  stack: ["Angular","JS/TS"],', '  <span class="c-key">stack</span>: [<span class="c-str">"Angular"</span>,<span class="c-str">"JS/TS"</span>],'],
    ['  ml:    true,',                '  <span class="c-key">ml</span>:    <span class="c-bool">true</span>,'],
    ['  status: available(),',        '  <span class="c-key">status</span>: <span class="c-fn">available</span>(),'],
    ['  secret: "appuie sur [X]",',   '  <span class="c-key">secret</span>: <span class="c-str">"appuie sur [X]"</span>,'],
    ['};',                            '};'],
  ];

  function startCodeTyper() {
    const el = document.getElementById('heroCodeText');
    if (!el) return;
    el.innerHTML = '';

    /* Mouvement réduit : affiche le code d'un coup, sans effet */
    if (prefersReducedMotion) {
      el.innerHTML = CODE_LINES
        .map(([, html]) => `<span class="code-line">${html || ' '}</span>`)
        .join('');
      return;
    }

    const cursor = document.createElement('span');
    cursor.className = 'code-cursor';
    cursor.textContent = '▌';
    el.appendChild(cursor);

    let li = 0, ci = 0, lineDiv = null;

    function tick() {
      if (li >= CODE_LINES.length) return; // fini, curseur reste

      const [plain, html] = CODE_LINES[li];

      if (ci === 0) {
        lineDiv = document.createElement('span');
        lineDiv.className = 'code-line';
        el.insertBefore(lineDiv, cursor);
      }

      if (plain.length === 0 || ci >= plain.length) {
        if (html && lineDiv) lineDiv.innerHTML = html;
        li++; ci = 0;
        setTimeout(tick, plain.length === 0 ? 80 : 110);
      } else {
        lineDiv.textContent = plain.slice(0, ci + 1);
        ci++;
        const ch = plain[ci - 1];
        setTimeout(tick, ch === ' ' ? 18 : 28 + Math.random() * 28);
      }
    }

    setTimeout(tick, 620);
  }

  /* Animation d'entrée du hero — rejoue à chaque visite */
  function animateHeroIn() {
    const steps = [
      { sel: '.hero-label',   anim: 'fadeUp',     dur: 0.45, base: 0.00 },
      { sel: '.hero-title',   anim: 'fadeUp',     dur: 0.55, base: 0.10 },
      { sel: '.hero-quote',   anim: 'slideRight', dur: 0.50, base: 0.30 },
      { sel: '.hero-actions', anim: 'fadeUp',     dur: 0.45, base: 0.45 },
    ];
    const roleSteps = { anim: 'popIn', dur: 0.38, base: 0.28 };

    if (prefersReducedMotion) {
      startCodeTyper();
      return; // le CSS force déjà l'opacité à 1
    }

    // Phase 1 : effacer toutes les animations en cours
    steps.forEach(({ sel }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.opacity   = '0';
      el.style.animation = 'none';
    });
    document.querySelectorAll('.role-tag').forEach(el => {
      el.style.opacity   = '0';
      el.style.animation = 'none';
    });
    const codePanel = document.getElementById('heroCode');
    if (codePanel) { codePanel.style.opacity = '0'; codePanel.style.animation = 'none'; }

    // Phase 2 : forcer reflow puis relancer
    requestAnimationFrame(() => requestAnimationFrame(() => {
      steps.forEach(({ sel, anim, dur, base }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.style.opacity   = '';
        el.style.animation = `${anim} ${dur}s cubic-bezier(.22,1,.36,1) ${base}s both`;
      });
      document.querySelectorAll('.hero-roles').forEach(el => {
        el.style.opacity = '1';
      });
      document.querySelectorAll('.role-tag').forEach((el, i) => {
        el.style.opacity   = '';
        el.style.animation = `${roleSteps.anim} ${roleSteps.dur}s cubic-bezier(.22,1,.36,1) ${(roleSteps.base + i * 0.08).toFixed(2)}s both`;
      });

      // Panneau code : fade-in + typewriter
      if (codePanel) {
        codePanel.style.opacity   = '';
        codePanel.style.animation = 'fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.18s both';
      }
      startCodeTyper();
    }));
  }

  /* Reveal avec cascade pour les éléments d'une page */
  function revealPage(page) {
    if (page.id === 'hero') {
      animateHeroIn();
      return;
    }

    const targets = page.querySelectorAll(
      '.section-tag, .section-title, .info-card, .project-card, ' +
      '.skill-group, .about-text p, .timeline-item, ' +
      '.contact-intro, .social-links'
    );
    targets.forEach(el => {
      el.classList.add('reveal');
      el.classList.remove('visible');
    });

    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    requestAnimationFrame(() => {
      targets.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 55);
      });
    });
  }

  /* Navigation vers la page index */
  function goTo(index) {
    if (index < 0 || index >= pages.length || index === current || animating) return;
    animating = true;

    pages[current].classList.remove('page-active');
    current = index;
    const page = pages[current];

    // Scroll interne remis en haut
    page.scrollTop = 0;
    page.classList.add('page-active');
    revealPage(page);
    syncControls();

    setTimeout(() => { animating = false; }, DURATION);
  }

  /* Boutons prev / next */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Clavier — uniquement si le focus n'est pas dans un champ */
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1); }
  });

  /* Molette (déclenche uniquement quand le contenu interne est en bout de scroll) */
  let wheelCooldown = false;
  document.addEventListener('wheel', (e) => {
    if (wheelCooldown || animating) return;
    const page = pages[current];
    const atBottom = page.scrollTop + page.clientHeight >= page.scrollHeight - 8;
    const atTop    = page.scrollTop <= 2;
    if (e.deltaY > 30 && atBottom) { wheelCooldown = true; goTo(current + 1); }
    if (e.deltaY < -30 && atTop)   { wheelCooldown = true; goTo(current - 1); }
    if (wheelCooldown) setTimeout(() => { wheelCooldown = false; }, DURATION + 100);
  }, { passive: true });

  /* Swipe tactile */
  let touchY = 0;
  document.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend',   (e) => {
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 55) { dy > 0 ? goTo(current + 1) : goTo(current - 1); }
  }, { passive: true });

  /* Liens de navigation (navbar + boutons) */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id  = a.getAttribute('href').slice(1);
      const idx = pages.findIndex(p => p.id === id);
      if (idx !== -1) { e.preventDefault(); goTo(idx); }
    });
  });

  /* Init — première page */
  pages[0].classList.add('page-active');
  revealPage(pages[0]);
  syncControls();


  /* ----------------------------------------------------------
     3. INTERACTIONS — boutons magnétiques & tilt 3D
  ---------------------------------------------------------- */
  if (!prefersReducedMotion) {

    /* Boutons "magnétiques" : attirés par le curseur */
    document.querySelectorAll('.btn, .nav-cta, .social-btn, .theme-toggle').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    /* Tilt 3D sur les cartes */
    document.querySelectorAll('.project-card, .info-card, .skill-group, .timeline-content').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }


  /* ----------------------------------------------------------
     4. EASTER EGG — touche X : flash d'énergie + mode mutant
  ---------------------------------------------------------- */
  let xFlashBusy = false;

  function triggerXMode() {
    const html = document.documentElement;
    const activating = !html.hasAttribute('data-x-mode');
    html.toggleAttribute('data-x-mode');

    if (prefersReducedMotion || xFlashBusy) return;
    xFlashBusy = true;

    const flash = document.createElement('div');
    flash.className = 'x-flash';
    flash.setAttribute('aria-hidden', 'true');
    flash.innerHTML =
      '<span class="x-beam x-beam--a"></span>' +
      '<span class="x-beam x-beam--b"></span>' +
      `<span class="x-flash-text">${activating ? 'Mode mutant : activé' : 'Retour au calme'}</span>`;
    document.body.appendChild(flash);
    setTimeout(() => { flash.remove(); xFlashBusy = false; }, 1200);
  }

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key.toLowerCase() === 'x' && !e.ctrlKey && !e.metaKey && !e.altKey) triggerXMode();
  });

});
