/* ============================================================
   DOOM FATALIS – Animation permanente
   Arcs d'énergie crépitants (cuivre/laiton + vert Doom)
   + braises montantes, inspiré du Dr Victor Von Doom
   ============================================================ */

(function doomFatalis() {

  const canvas = document.getElementById('doom-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const arcs   = [];
  const embers = [];

  /* ---- Resize ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ---- Midpoint-displacement lightning ---- */
  function bolt(x1, y1, x2, y2, spread, depth) {
    if (depth === 0) return [[x1, y1], [x2, y2]];
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread;
    const L  = bolt(x1, y1, mx, my, spread * 0.55, depth - 1);
    const R  = bolt(mx, my, x2, y2, spread * 0.55, depth - 1);
    return [...L.slice(0, -1), ...R];
  }

  /* ---- Palettes ---- */
  const BRASS = ['#C8A84B', '#D4922A', '#B87333'];
  // Vert sorcier de Doom — plus saturé, plus intense
  const DOOM  = ['#00FF44', '#22FF22', '#55FF55', '#00E83A', '#11FF66'];

  /* ---- Spawn arc d'énergie ---- */
  function spawnArc() {
    let x1, y1;
    if (Math.random() < 0.62) {
      x1 = (Math.random() < 0.5 ? 0 : W) + (Math.random() - 0.5) * W * 0.18;
      y1 = (Math.random() < 0.5 ? 0 : H) + (Math.random() - 0.5) * H * 0.18;
    } else {
      const s = Math.floor(Math.random() * 4);
      x1 = s === 1 ? W + 5 : s === 3 ? -5 : Math.random() * W;
      y1 = s === 0 ? -5 : s === 2 ? H + 5 : Math.random() * H;
    }

    const angle = Math.random() * Math.PI * 2;
    const len   = 100 + Math.random() * Math.min(W, H) * 0.38;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;

    // 50 % vert Doom — couleur dominante
    const isDoom  = Math.random() < 0.50;
    const palette = isDoom ? DOOM : BRASS;
    const color   = palette[Math.floor(Math.random() * palette.length)];
    const pts     = bolt(x1, y1, x2, y2, len * 0.36, 7);
    const maxLife = 12 + Math.random() * 26;

    let branch = null;
    if (Math.random() < 0.55 && pts.length > 4) {
      const bi = Math.floor(pts.length * (0.25 + Math.random() * 0.45));
      const [bx, by] = pts[bi];
      const ba = angle + (Math.random() * 1.3 - 0.65);
      const bl = len * (0.18 + Math.random() * 0.24);
      branch = {
        pts  : bolt(bx, by, bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl, bl * 0.32, 5),
        color: isDoom ? DOOM[2] : BRASS[0],
        w    : 0.25 + Math.random() * 0.65,
      };
    }

    arcs.push({
      pts, branch, color,
      // Arcs Doom plus épais et plus lumineux
      w      : isDoom ? 0.8 + Math.random() * 2.0 : 0.45 + Math.random() * 1.1,
      glow   : isDoom ? 22 : 8,
      life   : 0,
      maxLife,
    });
  }

  /* ---- Spawn braise / étincelle ---- */
  function spawnEmber() {
    // 45 % des braises en vert Doom
    const isDoom = Math.random() < 0.45;
    embers.push({
      x      : Math.random() * W,
      y      : H + 6,
      vx     : (Math.random() - 0.5) * 1.3,
      vy     : -(0.7 + Math.random() * 2.1),
      r      : 0.7 + Math.random() * 2.2,
      life   : 0,
      maxLife: 85 + Math.random() * 140,
      color  : isDoom ? DOOM[Math.floor(Math.random() * DOOM.length)] : BRASS[Math.floor(Math.random() * BRASS.length)],
    });
  }

  /* ---- Dessin d'un arc ---- */
  function drawPath(pts, color, w, glow, alpha) {
    if (!pts || pts.length < 2) return;
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.strokeStyle  = color;
    ctx.lineWidth    = w;
    ctx.shadowColor  = color;
    ctx.shadowBlur   = glow;
    ctx.lineCap      = 'round';
    ctx.lineJoin     = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  /* ---- Boucle principale ---- */
  let frame = 0;

  function tick() {
    requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);
    frame++;

    /* Taux d'apparition */
    if (Math.random() < 0.052) spawnArc();
    if (Math.random() < 0.36)  spawnEmber();

    /* Arcs */
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i];
      const t = a.life / a.maxLife;
      /* Flash brutal puis fondu lent — comme une décharge */
      const alpha = t < 0.07
        ? (t / 0.07) * 0.78
        : 0.78 * (1 - (t - 0.07) / 0.93);

      drawPath(a.pts, a.color, a.w, a.glow, alpha);
      if (a.branch) drawPath(a.branch.pts, a.branch.color, a.branch.w, a.glow * 0.55, alpha * 0.5);

      a.life++;
      if (a.life >= a.maxLife) arcs.splice(i, 1);
    }

    /* Braises */
    for (let i = embers.length - 1; i >= 0; i--) {
      const p = embers[i];
      const t = p.life / p.maxLife;
      const alpha = t < 0.12
        ? (t / 0.12) * 0.65
        : 0.65 * (1 - (t - 0.12) / 0.88);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.3, p.r * (1 - t * 0.55)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      /* Légère oscillation latérale + gravité douce */
      p.x  += p.vx + Math.sin(frame * 0.028 + i * 0.8) * 0.22;
      p.y  += p.vy;
      p.vy += 0.007;
      p.life++;
      if (p.life >= p.maxLife || p.y < -20) embers.splice(i, 1);
    }
  }

  tick();

})();
