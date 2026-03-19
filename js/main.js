/* ============================================================
   PORTFOLIO – main.js
   Fonctionnalités :
     1. Navbar : scroll shadow + active link
     2. Menu burger mobile
     3. Reveal on scroll (IntersectionObserver)
     4. Active nav link selon la section visible
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

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
     1. NAVBAR — shadow permanent (body overflow:hidden, pas de scroll)
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  navbar.classList.add('scrolled');


  /* ----------------------------------------------------------
     2. MENU BURGER (mobile)
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
    });
  });


  /* ----------------------------------------------------------
     3. NAVIGATION DE PAGES — une section = une page
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
  const DURATION  = 380; // ms — durée de la transition CSS

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
  function startCodeTyper() {
    const el = document.getElementById('heroCodeText');
    if (!el) return;
    el.innerHTML = '';

    // [ plaintext, highlightedHTML ]
    const lines = [
      ['// about_me.js',               '<span class="c-cmt">// about_me.js</span>'],
      ['',                             ''],
      ['const sitraka = {',            '<span class="c-kw">const</span> <span class="c-id">sitraka</span> = {'],
      ['  name:  "Sitraka R.",',       '  <span class="c-key">name</span>:  <span class="c-str">"Sitraka R."</span>,'],
      ['  role:  "Full Stack Dev",',   '  <span class="c-key">role</span>:  <span class="c-str">"Full Stack Dev"</span>,'],
      ['  stack: ["Angular","JS/TS"],', '  <span class="c-key">stack</span>: [<span class="c-str">"Angular"</span>,<span class="c-str">"JS/TS"</span>],'],
      ['  ml:    true,',               '  <span class="c-key">ml</span>:    <span class="c-bool">true</span>,'],
      ['  status: available(),',       '  <span class="c-key">status</span>: <span class="c-fn">available</span>(),'],
      ['};',                           '};'],
    ];

    const cursor = document.createElement('span');
    cursor.className = 'code-cursor';
    cursor.textContent = '▌';
    el.appendChild(cursor);

    let li = 0, ci = 0, lineDiv = null;

    function tick() {
      if (li >= lines.length) return; // fini, curseur reste

      const [plain, html] = lines[li];

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

    setTimeout(tick, 680);
  }

  /* Animation comics sur le hero — rejoue à chaque visite */
  function animateHeroIn() {
    const steps = [
      { sel: '.hero-label',   anim: 'comics-drop',  dur: 0.48, base: 0.00 },
      { sel: '.hero-title',   anim: 'comics-slam',  dur: 0.58, base: 0.12 },
      { sel: '.hero-quote',   anim: 'comics-swipe', dur: 0.48, base: 0.26 },
      { sel: '.hero-sub',     anim: 'fadeUp',        dur: 0.42, base: 0.38 },
      { sel: '.hero-actions', anim: 'fadeUp',        dur: 0.42, base: 0.50 },
    ];
    const roleSteps = { anim: 'comics-pop', dur: 0.38, base: 0.36 };

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

    // Phase 2 : forcer reflow puis relancer
    requestAnimationFrame(() => requestAnimationFrame(() => {
      steps.forEach(({ sel, anim, dur, base }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.style.opacity   = '';
        el.style.animation = `${anim} ${dur}s cubic-bezier(.22,1,.36,1) ${base}s both`;
      });
      document.querySelectorAll('.role-tag').forEach((el, i) => {
        el.style.opacity   = '';
        el.style.animation = `${roleSteps.anim} ${roleSteps.dur}s cubic-bezier(.22,1,.36,1) ${(roleSteps.base + i * 0.07).toFixed(2)}s both`;
      });

      // Panneau code : fade-in + typewriter
      const codePanel = document.getElementById('heroCode');
      if (codePanel) codePanel.style.animation = 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.18s both';
      startCodeTyper();
    }));
  }

  /* Reveal avec cascade pour les éléments d'une page */
  function revealPage(page) {
    if (page.id === 'hero') {
      animateHeroIn();
      return;
    }

    if (page.id === 'experience') {
      // Réinitialise le comic book au chapitre 1
      if (typeof window._expReset === 'function') window._expReset();
      // Révèle uniquement le tag et le titre de section
      const hdr = page.querySelectorAll('.section-tag, .section-title');
      hdr.forEach(el => { el.classList.add('reveal'); el.classList.remove('visible'); });
      requestAnimationFrame(() => {
        hdr.forEach((el, i) => { setTimeout(() => el.classList.add('visible'), i * 55); });
      });
      return;
    }

    const targets = page.querySelectorAll(
      '.section-tag, .section-title, .info-card, .project-card, ' +
      '.skill-group, .about-text p, ' +
      '.contact-intro, .contact-email, .social-links'
    );
    targets.forEach(el => {
      el.classList.add('reveal');
      el.classList.remove('visible');
    });
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

  /* Clavier */
  document.addEventListener('keydown', (e) => {
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


  /* ────────────────────────────────────────────
     COMIC BOOK — Mon Histoire (feuilletage manuel)
     ──────────────────────────────────────────── */
  const expBook  = document.getElementById('expBook');
  if (expBook) {
    const expPages = Array.from(expBook.querySelectorAll('.comic-page'));
    const expPrev  = document.getElementById('expPrev');
    const expNext  = document.getElementById('expNext');
    const expPager = document.getElementById('expPager');
    let expIdx  = 0;
    let expBusy = false;
    const BOOK_DUR = 620; // ms — out(380) + delay(220) + in(380) ≈ 620 avant fin

    function expSync() {
      if (expPrev)  expPrev.disabled  = expIdx === 0;
      if (expNext)  expNext.disabled  = expIdx === expPages.length - 1;
      if (expPager) expPager.textContent = `${expIdx + 1} / ${expPages.length}`;
    }

    function turnTo(next) {
      if (next < 0 || next >= expPages.length || next === expIdx || expBusy) return;
      expBusy = true;
      const dir = next > expIdx ? 'fwd' : 'back';
      const out  = expPages[expIdx];
      const inn  = expPages[next];

      out.classList.remove('active');
      out.classList.add(`out-${dir}`);
      inn.classList.add(`in-${dir}`);

      setTimeout(() => {
        out.classList.remove(`out-${dir}`);
        inn.classList.remove(`in-${dir}`);
        inn.classList.add('active');
        expIdx = next;
        expSync();
        expBusy = false;
      }, BOOK_DUR);
    }

    /* Init */
    expPages[0].classList.add('active');
    expSync();

    if (expPrev) expPrev.addEventListener('click', () => turnTo(expIdx - 1));
    if (expNext) expNext.addEventListener('click', () => turnTo(expIdx + 1));

    /* Swipe horizontal — tourner les pages */
    let bx = 0, by = 0;
    expBook.addEventListener('touchstart', e => {
      bx = e.touches[0].clientX;
      by = e.touches[0].clientY;
    }, { passive: true });
    expBook.addEventListener('touchend', e => {
      const dx = bx - e.changedTouches[0].clientX;
      const dy = by - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx > 0 ? turnTo(expIdx + 1) : turnTo(expIdx - 1);
      }
    }, { passive: true });

    /* Reset au chapitre 1 quand on revient sur la section */
    window._expReset = function () {
      expPages.forEach(p => p.classList.remove('active', 'out-fwd', 'in-fwd', 'out-back', 'in-back'));
      expIdx  = 0;
      expBusy = false;
      expPages[0].classList.add('active');
      expSync();
    };
  }

});


/* ---- Active nav link style (injecté en JS pour ne pas polluer le CSS) ---- */
const style = document.createElement('style');
style.textContent = `
  .nav-links a.active-nav {
    color: var(--accent) !important;
    font-weight: 500;
  }
`;
document.head.appendChild(style);
