/* ============================================================
   METAL TRINITY – Animation 3D permanente
   Sleep Token · Bad Omens · Motionless in White
   Wireframes 3D rotatifs — projection perspective
   Palette steampunk : laiton · cuivre · acier patiné
   ============================================================ */

(function metalTrinity() {

  const canvas = document.getElementById('metal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ============================================================
     MATHS 3D — rotations
     ============================================================ */
  const rotX = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c]; };
  const rotY = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0]*c + p[2]*s, p[1], -p[0]*s + p[2]*c]; };
  const rotZ = (p, a) => { const c=Math.cos(a), s=Math.sin(a); return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]]; };

  /* ============================================================
     GÉOMÉTRIES
     ============================================================ */

  /* ── Sleep Token — Tore / Vessel ── */
  function buildTorus() {
    const R=60, r=22, nT=16, nP=10;
    const verts=[], edges=[];
    for (let i=0; i<nT; i++) {
      for (let j=0; j<nP; j++) {
        const θ = (i/nT)*Math.PI*2;
        const φ = (j/nP)*Math.PI*2;
        verts.push([
          (R + r*Math.cos(φ)) * Math.cos(θ),
          (R + r*Math.cos(φ)) * Math.sin(θ),
          r * Math.sin(φ)
        ]);
        edges.push([i*nP+j, ((i+1)%nT)*nP+j]); // anneau principal
        edges.push([i*nP+j, i*nP+(j+1)%nP]);   // tube
      }
    }
    return { verts, edges, bound: R+r };
  }

  /* ── Bad Omens — Icosaèdre (géométrie tranchante) ── */
  function buildIcosahedron() {
    const φ = (1 + Math.sqrt(5)) / 2;
    const sc = 75;
    const raw = [
      [0, 1, φ], [0,-1, φ], [0, 1,-φ], [0,-1,-φ],
      [1, φ, 0], [-1, φ, 0], [1,-φ, 0], [-1,-φ, 0],
      [φ, 0, 1], [-φ, 0, 1], [φ, 0,-1], [-φ, 0,-1]
    ];
    const verts = raw.map(v => {
      const l = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      return [v[0]/l*sc, v[1]/l*sc, v[2]/l*sc];
    });
    const eLen = 2*sc / Math.sqrt(1 + φ**2);
    const tol  = eLen * 0.15;
    const edges = [];
    for (let i=0; i<12; i++) {
      for (let j=i+1; j<12; j++) {
        const d = Math.sqrt(
          (verts[i][0]-verts[j][0])**2 +
          (verts[i][1]-verts[j][1])**2 +
          (verts[i][2]-verts[j][2])**2
        );
        if (Math.abs(d - eLen) < tol) edges.push([i, j]);
      }
    }
    return { verts, edges, bound: sc };
  }

  /* ── Motionless in White — Crâne wireframe 3D ── */
  function buildSkull() {
    const V = [], E = [];
    const NR = 12; // points par anneau du crâne

    // Anneau horizontal dans le plan XZ à hauteur y
    function hRing(y, rx, rz) {
      const s = V.length;
      for (let i = 0; i < NR; i++) {
        const a = (i / NR) * Math.PI * 2;
        V.push([Math.cos(a) * rx, y, Math.sin(a) * rz]);
      }
      for (let i = 0; i < NR; i++) E.push([s+i, s+(i+1)%NR]);
      return s;
    }

    // Ovale dans le plan XY (traits du visage)
    function fOval(cx, cy, z, rx, ry, n = 10) {
      const s = V.length;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        V.push([cx + Math.cos(a)*rx, cy + Math.sin(a)*ry, z]);
      }
      for (let i = 0; i < n; i++) E.push([s+i, s+(i+1)%n]);
    }

    // Polyligne ouverte
    function pline(pts) {
      const s = V.length;
      pts.forEach(p => V.push(p));
      for (let i = 0; i < pts.length-1; i++) E.push([s+i, s+i+1]);
    }

    // Rectangle (dent)
    function tooth(x1, y1, x2, y2, z) {
      const s = V.length;
      V.push([x1,y1,z], [x2,y1,z], [x2,y2,z], [x1,y2,z]);
      E.push([s,s+1],[s+1,s+2],[s+2,s+3],[s+3,s]);
    }

    // ── Dôme crânien — 7 anneaux empilés ──
    const RINGS = [
      { y: -92, rx: 11, rz:  9 },   // apex
      { y: -74, rx: 48, rz: 44 },
      { y: -52, rx: 68, rz: 62 },
      { y: -26, rx: 74, rz: 68 },
      { y:   0, rx: 73, rz: 67 },
      { y:  24, rx: 64, rz: 57 },
      { y:  46, rx: 50, rz: 43 },
    ];
    const rStarts = RINGS.map(r => hRing(r.y, r.rx, r.rz));

    // Colonnes verticales (un sommet sur deux de chaque anneau)
    for (let s = 0; s < RINGS.length - 1; s++) {
      for (let k = 0; k < NR; k += 2) {
        E.push([rStarts[s]+k, rStarts[s+1]+k]);
      }
    }

    // ── Orbites oculaires (ovales proéminentes) ──
    fOval(-36, -14, 60, 25, 18);   // gauche
    fOval( 36, -14, 60, 25, 18);   // droite

    // ── Bourrelet sus-orbitaire (sourcils angulaires de MIW) ──
    pline([[-64,-34,40],[-44,-36,58],[-26,-33,64]]);
    pline([[ 26,-33,64],[ 44,-36,58],[ 64,-34,40]]);

    // ── Ouverture nasale (pirforme) ──
    fOval(0, 30, 63, 13, 17, 10);

    // ── Arches zygomatiques (pommettes) ──
    pline([[-68,20, 6],[-58,16,38],[-44,22,56]]);
    pline([[ 68,20, 6],[ 58,16,38],[ 44,22,56]]);

    // ── Arcade dentaire supérieure ──
    pline([[-46,54,26],[-36,52,44],[-18,51,54],[0,51,58],[18,51,54],[36,52,44],[46,54,26]]);

    // ── Dents supérieures (6) ──
    const txs = [-32,-18,-6, 6, 18, 32];
    for (const tx of txs) {
      const tz = 53 + (1-(tx/32)**2)*6;
      tooth(tx-5, 51, tx+5, 68, tz);
    }

    // ── Mandibule ──
    pline([[-44,76,24],[-34,74,42],[-17,73,52],[0,73,56],[17,73,52],[34,74,42],[44,76,24]]);

    // ── Menton ──
    pline([[-34,96,18],[-22,103,34],[0,106,38],[22,103,34],[34,96,18]]);

    // ── Branches montantes de la mâchoire ──
    pline([[-46,54,26],[-58,58,12],[-68,72, 4],[-62,88, 8]]);
    pline([[ 46,54,26],[ 58,58,12],[ 68,72, 4],[ 62,88, 8]]);

    // ── Couronne / Diadème gothique (signature MIW) ──
    pline([[-48,-74,44],[-24,-96,56],[0,-102,58],[24,-96,56],[48,-74,44]]);
    pline([[-24,-96,56],[-20,-110,54],[0,-116,56],[20,-110,54],[24,-96,56]]);
    // Pointes de couronne
    pline([[-48,-74,44],[-52,-88,42],[-44,-80,44]]);
    pline([[ 48,-74,44],[ 52,-88,42],[ 44,-80,44]]);

    return { verts: V, edges: E, bound: 116 };
  }

  /* ============================================================
     CLASSE Obj3D
     ============================================================ */
  class Obj3D {
    constructor({ geo, px, py, sc, color, glow, label, labelSize, labelOffset, speeds }) {
      this.geo         = geo;
      this.px          = px;           // position X (fraction de W)
      this.py          = py;           // position Y (fraction de H)
      this.sc          = sc;           // échelle de base
      this.color       = color;
      this.glow        = glow;
      this.label       = label;
      this.labelSize   = labelSize;
      this.labelOffset = labelOffset;  // px au-dessous du centre
      this.speeds      = speeds;       // [drx, dry, drz]

      this.ax    = Math.random() * Math.PI * 2;
      this.ay    = Math.random() * Math.PI * 2;
      this.az    = Math.random() * Math.PI * 2;
      this.cycle = Math.random() * Math.PI * 2;
      this.alpha = 0;
      this.maxAlpha = 0.72;
    }

    tick() {
      this.ax    += this.speeds[0];
      this.ay    += this.speeds[1];
      this.az    += this.speeds[2];
      this.cycle += 0.019;
      this.alpha  = Math.min(this.maxAlpha, this.alpha + 0.004);
    }

    draw() {
      if (this.alpha <= 0) return;

      const cx = W * this.px;
      const cy = H * this.py;
      // Échelle responsive + respiration
      const resp    = Math.max(0.32, Math.min(1.15, Math.min(W, H) / 900));
      const breathe = 1 + 0.055 * Math.sin(this.cycle);
      const scale   = this.sc * resp * breathe;
      const FOV     = 400;

      /* Projection perspective */
      const proj = this.geo.verts.map(v => {
        let p = rotX(v, this.ax);
            p = rotY(p, this.ay);
            p = rotZ(p, this.az);
        const zs = p[2] * scale + FOV;
        const s  = FOV / zs;
        return { x: cx + p[0] * scale * s, y: cy + p[1] * scale * s, d: p[2] * scale };
      });

      const depths = proj.map(p => p.d);
      const minD   = Math.min(...depths);
      const maxD   = Math.max(...depths);
      const dRange = (maxD - minD) || 1;

      /* Tri des arêtes arrière → avant (painter's algorithm) */
      const sorted = this.geo.edges
        .map(([a, b]) => ({ a, b, avg: (proj[a].d + proj[b].d) / 2 }))
        .sort((x, y) => x.avg - y.avg);

      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';

      for (const e of sorted) {
        const t    = (e.avg - minD) / dRange; // 0=arrière, 1=avant
        const pa   = proj[e.a];
        const pb   = proj[e.b];

        ctx.save();
        ctx.globalAlpha = this.alpha * (0.12 + t * 0.88);
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur  = 2 + t * 16;
        ctx.lineWidth   = 0.5 + t * 1.8;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
        ctx.restore();
      }

      /* Label du groupe */
      const labelAlpha = this.alpha * (0.42 + 0.18 * Math.sin(this.cycle * 0.6));
      ctx.save();
      ctx.globalAlpha = labelAlpha;
      ctx.fillStyle   = this.color;
      ctx.shadowColor = this.glow;
      ctx.shadowBlur  = 9;
      ctx.font        = `${Math.round(this.labelSize * resp)}px 'Special Elite', cursive`;
      ctx.textAlign   = 'center';
      ctx.fillText(this.label, cx, cy + this.labelOffset * resp);
      ctx.restore();
    }
  }

  /* ============================================================
     INSTANCIATION DES TROIS OBJETS
     ============================================================ */
  const objects = [

    /* SLEEP TOKEN — Tore laiton doré */
    new Obj3D({
      geo        : buildTorus(),
      px: 0.09, py: 0.42,
      sc         : 1.0,
      color      : '#C8A84B',
      glow       : '#EDD060',
      label      : 'SLEEP TOKEN',
      labelSize  : 10,
      labelOffset: 108,
      speeds     : [0.0040, 0.0095, 0.0025],
    }),

    /* BAD OMENS — Icosaèdre cuivre */
    new Obj3D({
      geo        : buildIcosahedron(),
      px: 0.91, py: 0.28,
      sc         : 1.0,
      color      : '#B87333',
      glow       : '#D4922A',
      label      : 'BAD OMENS',
      labelSize  : 11,
      labelOffset: 100,
      speeds     : [0.0070, 0.0050, 0.0090],
    }),

    /* MOTIONLESS IN WHITE — Crâne wireframe acier */
    new Obj3D({
      geo        : buildSkull(),
      px: 0.89, py: 0.74,
      sc         : 0.82,
      color      : '#B8B8AE',
      glow       : '#DEDED0',
      label      : 'M.I.W.',
      labelSize  : 10,
      labelOffset: 130,
      speeds     : [0.0048, 0.0078, 0.0022],
    }),

  ];

  /* ============================================================
     BOUCLE PRINCIPALE
     ============================================================ */
  function tick() {
    requestAnimationFrame(tick);
    ctx.clearRect(0, 0, W, H);
    for (const obj of objects) { obj.tick(); obj.draw(); }
  }

  tick();

})();
