/* ============================================================
   BACKGROUND.JS — Arrière-plan dynamique
   Réseau de particules discret, adapté au thème clair/sombre.
   Désactivé si l'utilisateur préfère un mouvement réduit.
   ============================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ── Détection thème ── */
  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  /* ── Palette (bleu → cyan → or, accordée au CSS) ── */
  const LIGHT_COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#10B981', '#F43F5E'];
  const DARK_COLORS  = ['#60A5FA', '#22D3EE', '#FBBF24', '#34D399', '#FB7185'];

  function palette() { return isDark() ? DARK_COLORS : LIGHT_COLORS; }

  /* ── Souris : les particules s'y connectent et s'en écartent ── */
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* ── Particules ── */
  const COUNT     = Math.min(70, Math.floor(window.innerWidth / 20));
  const LINK_DIST = 150;

  class Particle {
    constructor() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = 1.2 + Math.random() * 2.2;
      this.colorIdx = Math.floor(Math.random() * LIGHT_COLORS.length);
    }

    tick() {
      /* Répulsion douce autour du curseur */
      const mdx = this.x - mouse.x, mdy = this.y - mouse.y;
      const md  = Math.hypot(mdx, mdy);
      if (md < 110 && md > 0.01) {
        const f = (110 - md) / 110 * 0.6;
        this.x += (mdx / md) * f;
        this.y += (mdy / md) * f;
      }

      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10) this.x = W + 10; else if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10; else if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = palette()[this.colorIdx];
      ctx.globalAlpha = 0.35;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: COUNT }, () => new Particle());

  function drawLinks() {
    const stroke = isDark() ? '255,255,255' : '21,23,37';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.globalAlpha = (1 - d / LINK_DIST) * 0.10;
          ctx.strokeStyle = `rgb(${stroke})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* Lignes accentuées entre le curseur et les particules proches */
  function drawMouseLinks() {
    const MOUSE_DIST = 190;
    for (const p of particles) {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < MOUSE_DIST) {
        ctx.globalAlpha = (1 - d / MOUSE_DIST) * 0.35;
        ctx.strokeStyle = palette()[p.colorIdx];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ── Boucle ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLinks();
    drawMouseLinks();
    particles.forEach(p => { p.tick(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  loop();
})();
