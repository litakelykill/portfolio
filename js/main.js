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
     1. NAVBAR – shadow au scroll
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // appel immédiat au chargement


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
     3. REVEAL ON SCROLL – IntersectionObserver
  ---------------------------------------------------------- */
  // Ajoute la classe .reveal à tous les éléments à animer
  const revealTargets = document.querySelectorAll(
    '.section-tag, .section-title, .info-card, .project-card, ' +
    '.skill-group, .timeline-item, .about-text p, ' +
    '.contact-intro, .contact-email, .social-links'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Délai en cascade pour les grilles
          const siblings = [...entry.target.parentElement.children].filter(
            el => el.classList.contains('reveal')
          );
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 60}ms`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // une seule fois
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach(el => revealObserver.observe(el));


  /* ----------------------------------------------------------
     4. ACTIVE NAV LINK – mise en valeur selon la section visible
  ---------------------------------------------------------- */
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active-nav'));
          const activeLink = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (activeLink) activeLink.classList.add('active-nav');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));


  /* ----------------------------------------------------------
     5. SMOOTH SCROLL – compense la hauteur de la navbar fixe
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });

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
