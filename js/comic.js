/* ============================================================
   COMIC.JS — Animation permanente comics
   • Mots d'action flottants (CODE!, BUILD!, DEBUG!…)
   • Lignes de vitesse rayonnantes
   • Nuages de points halftone pulsants
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('comic-canvas');
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

  /* ── Palettes ── */
  const LIGHT_COLORS = ['#E63946', '#4361EE', '#2DC653', '#FF6B35', '#7B2FBE'];
  const DARK_COLORS  = ['#FF6B6B', '#7B9FFF', '#5AF588', '#FF8C5A', '#BF7FFF'];

  function palette() { return isDark() ? DARK_COLORS : LIGHT_COLORS; }

  /* ── Mots d'action ── */
  const WORDS = [
    'CODE!', 'BUILD!', 'DEBUG!', 'PUSH!', 'AI!', 'ML!',
    'REACT!', 'PYTHON!', 'GIT!', 'ZAP!', 'POW!', 'LEARN!',
    'DEPLOY!', 'API!', 'JAVA!', 'DOCKER!', 'LOOP!', 'BUG?',
  ];

  class ActionWord {
    constructor(stagger) {
      this.life = stagger || 0;
      this._init();
    }

    _init() {
      this.x        = 60  + Math.random() * (W - 120);
      this.y        = 80  + Math.random() * (H - 160);
      this.word     = WORDS[Math.floor(Math.random() * WORDS.length)];
      this.size     = 14  + Math.random() * 28;
      this.maxAlpha = 0.07 + Math.random() * 0.07;
      this.maxLife  = 220 + Math.random() * 300;
      this.rot      = (Math.random() - 0.5) * 0.5;
      this.vy       = -0.12 - Math.random() * 0.18;
      this.color    = palette()[Math.floor(Math.random() * palette().length)];
    }

    tick() {
      this.life++;
      this.y += this.vy;
      const p = this.life / this.maxLife;
      this.alpha = p < 0.2  ? (p / 0.2)        * this.maxAlpha
                 : p > 0.72 ? ((1 - p) / 0.28) * this.maxAlpha
                 : this.maxAlpha;
      if (this.life >= this.maxLife) { this.life = 0; this._init(); }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.font = `900 ${this.size}px 'Bangers', cursive`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      /* Contour noir fin */
      ctx.strokeStyle = isDark() ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)';
      ctx.lineWidth   = 2.5;
      ctx.strokeText(this.word, 0, 0);
      ctx.fillStyle = this.color;
      ctx.fillText(this.word, 0, 0);
      ctx.restore();
    }
  }

  /* ── Lignes de vitesse ── */
  class SpeedLine {
    constructor(stagger) {
      this.life = stagger || 0;
      this._init();
    }

    _init() {
      /* Point de départ : zone centrale */
      const cx = W * (0.25 + Math.random() * 0.5);
      const cy = H * (0.25 + Math.random() * 0.5);
      const angle = Math.random() * Math.PI * 2;
      const start = 40 + Math.random() * 100;
      const len   = 60 + Math.random() * 200;

      this.x1 = cx + Math.cos(angle) * start;
      this.y1 = cy + Math.sin(angle) * start;
      this.x2 = this.x1 + Math.cos(angle) * len;
      this.y2 = this.y1 + Math.sin(angle) * len;

      this.maxLife  = 50 + Math.random() * 80;
      this.w        = 0.5 + Math.random() * 1.2;
      this.maxAlpha = 0.035 + Math.random() * 0.04;
    }

    tick() {
      this.life++;
      const p = this.life / this.maxLife;
      this.alpha = p < 0.3  ? (p / 0.3)        * this.maxAlpha
                 : p > 0.65 ? ((1 - p) / 0.35) * this.maxAlpha
                 : this.maxAlpha;
      if (this.life >= this.maxLife) { this.life = 0; this._init(); }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = isDark() ? '#FFFFFF' : '#0D0D0D';
      ctx.lineWidth   = this.w;
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Étoiles "impact" (petites explosions ponctuelles) ── */
  class StarBurst {
    constructor() {
      this.active = false;
      this._schedule();
    }

    _schedule() {
      /* apparaît toutes les 3–8 secondes */
      this._delay = (180 + Math.random() * 300) | 0;
      this._wait  = 0;
      this.active = false;
    }

    _spawn() {
      this.x     = 80  + Math.random() * (W - 160);
      this.y     = 80  + Math.random() * (H - 160);
      this.r     = 18  + Math.random() * 28;
      this.life  = 0;
      this.maxL  = 55 + Math.random() * 40;
      this.rot   = Math.random() * Math.PI;
      this.color = palette()[Math.floor(Math.random() * palette().length)];
      this.active = true;
    }

    tick() {
      if (!this.active) {
        this._wait++;
        if (this._wait >= this._delay) this._spawn();
        return;
      }
      this.life++;
      const p = this.life / this.maxL;
      this.alpha = p < 0.25 ? p / 0.25 : 1 - p;
      this.scale = 0.5 + p * 0.8;
      if (this.life >= this.maxL) this._schedule();
    }

    draw() {
      if (!this.active) return;
      const pts = 8, r1 = this.r * this.scale, r2 = r1 * 0.42;
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.18;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? r1 : r2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle   = this.color;
      ctx.fill();
      ctx.strokeStyle = isDark() ? '#FFFFFF' : '#0D0D0D';
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = this.alpha * 0.45;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Initialisation ── */
  const words   = Array.from({ length: 12 }, (_, i) =>
    new ActionWord(Math.floor(Math.random() * 480)));

  const lines   = Array.from({ length: 35 }, (_, i) =>
    new SpeedLine(Math.floor(Math.random() * 100)));

  const bursts  = Array.from({ length: 5 }, () => new StarBurst());

  /* ── Boucle ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l  => { l.tick();  l.draw();  });
    bursts.forEach(b => { b.tick();  b.draw();  });
    words.forEach(w  => { w.tick();  w.draw();  });
    requestAnimationFrame(loop);
  }

  loop();
})();
