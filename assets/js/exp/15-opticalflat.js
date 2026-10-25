/* Exp 15 — Flatness by optical flat and monochromatic light; comparison of a slip gauge with a master by interference. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'opticalflat';
  const LAMP = { na: { name: 'Sodium lamp, λ = 589.3 nm', lam: 0.5893, col: [255, 196, 64] }, he: { name: 'Helium lamp, λ = 587.6 nm', lam: 0.5876, col: [255, 214, 90] }, hg: { name: 'Mercury green line, λ = 546.1 nm', lam: 0.5461, col: [120, 230, 120] } };
  const SURF = { vex: { name: 'Lapped face, slightly convex', s: 1 }, cave: { name: 'Lapped face, slightly concave', s: -1 } };

  /* fringe picture: gap(x,y) in µm over a disc of radius 1 (x, y in −1…1); dark where 2·gap = mλ */
  function fringeCanvas(cv, gap, lam, col, opt) {
    opt = opt || {}; const W = cv.width, H = cv.height, g = cv.getContext('2d'); const img = g.createImageData(W, H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const x = (i / (W - 1)) * 2 - 1, y = (j / (H - 1)) * 2 - 1, k = (j * W + i) * 4; const inside = opt.rect ? opt.rect(x, y) : x * x + y * y <= 1; if (!inside) { img.data[k] = 238; img.data[k + 1] = 234; img.data[k + 2] = 224; img.data[k + 3] = 255; continue; }
      const d = gap(x, y); const I = Math.cos(2 * Math.PI * d / lam) ** 2; const v = 0.12 + 0.88 * I; img.data[k] = col[0] * v; img.data[k + 1] = col[1] * v; img.data[k + 2] = col[2] * v; img.data[k + 3] = 255; }
    g.putImageData(img, 0, 0);
    if (opt.after) opt.after(g, W, H);
  }

  LAB.register({
    id: ID, no: 15, cat: 'form', title: 'Flatness Testing with an Optical Flat and Monochromatic Light', std: 'ISO 1101 (flatness) / ISO 3650 (gauge blocks) / IS 5440', short: 'An optical flat laid on a lapped surface forms an air wedge; under monochromatic light it shows interference fringes, each a contour of half a wavelength. You read how far the fringes bow to find the flatness error and whether the surface is convex or concave, and count fringes to compare a slip gauge with its master.', tags: 'optical flat interference fringes monochromatic light sodium helium air wedge flatness lapped surface convex concave slip gauge comparison half wavelength',
    aim: 'To assess the flatness of a lapped surface with an optical flat and monochromatic light, and to find the difference in height between a slip gauge and a master gauge by interference.',
    objectives: ['Explain how an air wedge between an optical flat and a surface produces fringes of equal thickness.', 'Relate one fringe to a change in gap of λ/2.', 'Estimate the bow of a fringe as a fraction of the fringe spacing and convert it to a flatness error.', 'Decide whether the surface is convex or concave from the fringe shape.', 'Find the height difference between two gauges from the fringes across one of them.'],
    apparatus: ['Optical flat, Ø 60 mm, fused quartz, flat to 0.05 µm (λ/10) on one face', 'Monochromatic light box: sodium, helium or mercury (green filter)', 'Lapped test piece and a pair of slip gauges (master and test, same nominal size) wrung on a flat base plate', 'Cleaning materials: chamois, alcohol, air blower'],
    stdNote: 'ISO 1101 defines flatness as the distance between two parallel planes enclosing the surface; with an optical flat it is read as the number of fringes by which a straight fringe is bowed. Gauge-block faces must be flat within 0.05–0.15 µm (ISO 3650).',
    params: [
      { id: 'lamp', label: 'Light source', type: 'select', options: Object.entries(LAMP).map(([k, v]) => [k, v.name]), def: 'na' },
      { id: 'surf', label: 'Test surface', type: 'select', options: Object.entries(SURF).map(([k, v]) => [k, v.name]), def: 'vex' }
    ],
    opSteps: ['Clean the flat and the surfaces; let them reach room temperature', 'Switch on the monochromatic lamp and let it warm up', 'Lay the optical flat on the test surface, touching along one edge to form a wedge', 'Press lightly to obtain 4–6 straight-ish fringes; note the contact edge', 'Read the bow of the fringes against a straight line through their ends', 'Place the flat across the master and test slip gauges; count the fringes across the test gauge', 'Lift the flat off (do not slide); clean and store'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(160, 20, 240, 40, 'mach2', 'rx="6"')}<rect id="lampg" x="180" y="56" width="200" height="8" fill="rgb(${LAMP[p.lamp].col.join(',')})" opacity=".8"/>${G.t(170, 14, 'monochromatic light', 'm')}
        <path d="M200 64 L230 160 M280 64 L280 160 M360 64 L330 160" stroke="rgb(${LAMP[p.lamp].col.join(',')})" stroke-width="2" opacity=".5"/>
        ${G.r(120, 200, 320, 30, 'steel', 'rx="3"')}${G.t(126, 246, 'lapped test surface', 'm')}
        <g id="flat"><path d="M140 186 L420 176 L420 196 L140 200 Z" class="glass"/></g>${G.t(424, 180, 'optical flat', 'm')}
        <circle id="eye" cx="480" cy="110" r="10" fill="none" stroke="var(--ink)" stroke-width="2"/><circle cx="483" cy="110" r="3" class="ink"/>${G.t(456, 136, 'view normal', 'm')}
        <g transform="translate(20,90)">${G.r(0, 0, 120, 56, 'disp', 'rx="4"')}${G.t(8, 14, 'λ', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, U.f(LAMP[p.lamp].lam * 1000, 1) + ' nm', 'big', 'style="font-size:13px"')}</g>`, 'Optical flat on a lapped surface under a monochromatic light, viewed from above');
    },
    anim(svg, f, sim, p) { if (!sim) return; G.set(svg, 'flat', 'transform', `translate(0 ${-2 * Math.sin(f * 6)})`); },
    liveView(el, f, sim, p, api) {
      api.title('View through the optical flat'); api.sub(f < 0.5 ? 'test surface' : 'slip gauges'); let c = el.querySelector('canvas[data-k="fr"]'); if (!c) { el.innerHTML = ''; c = document.createElement('canvas'); c.dataset.k = 'fr'; c.width = 260; c.height = 260; c.style.cssText = 'width:260px;max-width:100%;display:block;margin:auto;border-radius:8px'; el.appendChild(c); }
      const T = sim.truth; if (f < 0.5) fringeCanvas(c, T.gapA, T.lam, LAMP[p.lamp].col); else fringeCanvas(c, T.gapB, T.lam, LAMP[p.lamp].col, { rect: T.rectB });
    },
    simulate(p, r) {
      const Lm = LAMP[p.lamp], S = SURF[p.surf], lam = Lm.lam, h2 = lam / 2;
      const nf = 4 + Math.floor(3 * r()); const w = nf * h2; // wedge: nf fringes across the diameter (y direction), contact at y = −1
      const bowFr = U.q(0.3 + 1.2 * r(), 0.05) * S.s; // bow in fringes (+ convex)
      const sag = bowFr * h2; // centre high by sag for convex
      const gapA = (x, y) => w * (1 - y) / 2 - sag * (1 - x * x); // y = +1 is the bottom edge, where the flat touches // cylindrical-ish curvature across x; contours bow
      // Slip gauges: master and test on a base plate, flat bridging both; test gauge higher by dh
      const Lsep = 30, lg = 9, dhFr = (2 + Math.floor(5 * r())) + (r() < 0.5 ? 0 : 0.5); const dh = dhFr * h2 * Lsep / lg; // µm
      const gapB = (x, y) => { const X = (x + 1) / 2 * 40; return X > 31 ? (X - 31) / lg * dhFr * h2 : 0.02 + 0.0 * y; }; // only the test gauge shows fringes
      const rectB = (x, y) => { const X = (x + 1) / 2 * 40, Y = (y + 1) / 2 * 40; return Y > 8 && Y < 32 && ((X > 0 && X < 9) || (X > 31 && X < 40)); };
      const T = { lam, h2, nf, bowFr, flat: Math.abs(bowFr) * h2, shape: S.s > 0 ? 'Convex' : 'Concave', gapA, gapB, rectB, dhFr, dh, Lsep, lg };
      return {
        truth: T, dur: 8,
        readout(f) { return [['Light', U.f(lam * 1000, 1), 'nm'], ['λ/2', U.f(h2, 4), 'µm'], ['View', f < 0.5 ? 'test surface' : 'slip gauges', ''], ['Fringes', f < 0.5 ? 'see view' : 'count them', '']]; },
        specimen: [['Light source', Lm.name, ''], ['Optical flat', 'Ø 60 mm, flat to λ/10', ''], ['Test surface', 'lapped steel face, Ø 50 mm', ''], ['Slip gauges', 'master and test, nominal 25 mm, wrung 30 mm apart (centre to centre) on a base plate', ''], ['Gauge length across which fringes are counted, l', lg, 'mm'], ['Distance between the gauges, L', Lsep, 'mm']],
        obs: [{ title: 'Table 1. Observations', cols: ['Observation', 'Result'], textCols: [0, 1], rows: [['Test surface: edge where the flat touches', 'bottom of the picture (contact edge)'], ['Test surface: fringe pattern', '<b>see picture A</b>'], ['Gauges: fringes on the master gauge', 'none (uniform tint): flat parallel to it'], ['Gauges: fringes across the test gauge', '<b>count them in picture B</b>']] }],
        truth: T
      };
    },
    expExtra(el, sim, p) {
      const T = sim.truth, col = LAMP[p.lamp].col;
      el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Read the fringes</h4><span class="eyebrow">monochromatic light</span></div><p class="muted" style="font-size:.86rem;margin-bottom:8px">Picture A: the flat touches the test surface along the bottom edge. The dashed line joins the ends of the middle dark fringe. Estimate how far the fringe bows from this line as a fraction of the spacing between fringes, and note which way it bows. Picture B: the flat rests on the master gauge (left) and the test gauge (right); count the dark fringes across the width of the test gauge.</p>
        <div class="scalegrid"><figure class="scalefig"><canvas id="frA" width="300" height="300" style="width:100%;display:block"></canvas><figcaption>A: test surface (contact at the bottom)</figcaption></figure><figure class="scalefig"><canvas id="frB" width="300" height="300" style="width:100%;display:block"></canvas><figcaption>B: master (left) and test gauge (right)</figcaption></figure></div></div>`;
      // middle dark fringe at x = ±1: y where gap = m h2 with m ≈ nf/2
      const m = Math.round(T.nf / 2); const yEnd = 1 - 2 * m / T.nf; // at x = ±1 sag term vanishes
      fringeCanvas(el.querySelector('#frA'), T.gapA, T.lam, col, { after: (g, W, H) => { g.setLineDash([6, 5]); g.strokeStyle = '#1b232b'; g.lineWidth = 1.5; const Y = (yEnd + 1) / 2 * (H - 1); g.beginPath(); g.moveTo(0, Y); g.lineTo(W, Y); g.stroke(); g.setLineDash([]); g.fillStyle = '#1b232b'; g.font = '12px IBM Plex Mono, monospace'; g.fillText('contact edge', W / 2 - 42, H - 6); } });
      fringeCanvas(el.querySelector('#frB'), T.gapB, T.lam, col, { rect: T.rectB, after: (g, W, H) => { g.fillStyle = '#1b232b'; g.font = '12px IBM Plex Mono, monospace'; g.fillText('master', 6, H * 0.18); g.fillText('test', W * 0.8, H * 0.18); } });
    },
    expHint: 'Each dark fringe marks a change of λ/2 in the air gap. Flatness error = (bow ÷ fringe spacing) × λ/2. Fringes are contours of equal gap: if their middles bow away from the contact edge, the centre of the surface is high (convex); towards it, low (concave). For the gauges: height difference = n × (λ/2) × L/l, where n is the number of fringes across the test gauge of width l, and L the distance between the gauges.',
    calcs(sim) { const T = sim.truth; return [
      { key: 'h2', label: 'Half wavelength λ/2', unit: 'µm', truth: T.h2, abs: 0.0006, fmt: v => U.f(v, 4) },
      { key: 'b', label: 'Bow of the middle fringe, in fringe spacings (picture A)', unit: 'fringe', truth: Math.abs(T.bowFr), abs: 0.16, fmt: v => U.f(v, 2) },
      { key: 'fl', label: 'Flatness error of the test surface', unit: 'µm', truth: T.flat, abs: 0.1, fmt: v => U.f(v, 3) },
      { key: 'sh', label: 'Shape of the test surface', type: 'select', options: ['Convex', 'Concave'], truth: T.shape },
      { key: 'n', label: 'Number of fringes across the test gauge (picture B)', unit: 'fringes', truth: T.dhFr, abs: 0.3, fmt: v => U.f(v, 1) },
      { key: 'dh', label: 'Height difference between test and master gauge, n(λ/2)(L/l)', unit: 'µm', truth: T.dh, abs: Math.max(0.05, 0.3 * T.h2 * T.Lsep / T.lg), fmt: v => U.f(v, 3) }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Flatness of the lapped face', unit: 'µm', value: T.flat, lo: 0, hi: 1.0, src: 'Lapped surfaces: typically < 1 µm', fmt: v => U.f(v, 3) }, { label: 'Gauge difference', unit: 'µm', value: T.dh, lo: 0, hi: 5, src: 'Worn or wrong-grade gauges: a few µm', fmt: v => U.f(v, 3) }]; },
    valExtra(el, sim) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>What the fringes mean</h4></div><p class="muted" style="font-size:.86rem">There are about ${T.nf} fringes across the surface because the flat was tilted to form a wedge; their number does not matter. What matters is their shape: a straight fringe means the surface is flat along that line. The middle fringe bows by ${U.f(Math.abs(T.bowFr), 2)} fringe spacings, so the surface departs from flat by ${U.f(Math.abs(T.bowFr), 2)} × ${U.f(T.h2, 4)} = ${U.f(T.flat, 3)} µm. ${T.shape === 'Convex' ? 'The fringes bow away from the contact edge: the gap reaches each fringe value later in the middle, so the middle is high: convex.' : 'The fringes bow towards the contact edge: the middle is low: concave.'} On the gauges, ${T.dhFr} fringes over ${T.lg} mm mean the flat rises ${U.f(T.dhFr * T.h2, 3)} µm across the test gauge; over the ${T.Lsep} mm between the gauges this is a height difference of ${U.f(T.dh, 3)} µm.</p></div>`; },
    sample(sim) { const T = sim.truth; return `<div class="eq">λ/2 = ${U.f(T.lam, 4)}/2 = <b>${U.f(T.h2, 4)} µm</b></div><div class="eq">Flatness = (bow/spacing) × λ/2 = ${U.f(Math.abs(T.bowFr), 2)} × ${U.f(T.h2, 4)} = <b>${U.f(T.flat, 3)} µm</b>, ${T.shape.toLowerCase()}</div><div class="eq">Gauges: Δh = n (λ/2)(L/l) = ${T.dhFr} × ${U.f(T.h2, 4)} × ${T.Lsep}/${T.lg} = <b>${U.f(T.dh, 3)} µm</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Flatness', expr: 'reading of the bow ±0.1 fringe (rectangular) × λ/2, + flat error λ/20', val: T.flat, u: M.rss(0.1 / Math.sqrt(3) * T.h2, T.h2 / 10 / Math.sqrt(3)), unit: 'µm' }, { q: 'Gauge difference', expr: '(±0.2 fringe/√3) × (λ/2) × L/l', val: T.dh, u: 0.2 / Math.sqrt(3) * T.h2 * T.Lsep / T.lg, unit: 'µm' }]; },
    conclude(sim, p) { const T = sim.truth; return `Under ${LAMP[p.lamp].name.split(',')[0].toLowerCase()} light (λ/2 = ${U.f(T.h2, 4)} µm) the fringes on the lapped surface bowed by ${U.f(Math.abs(T.bowFr), 2)} fringe spacings ${T.shape === 'Convex' ? 'away from' : 'towards'} the contact edge, so the surface is ${T.shape.toLowerCase()} with a flatness error of ${U.f(T.flat, 3)} µm. The test slip gauge showed ${T.dhFr} fringes over ${T.lg} mm, so it is ${U.f(T.dh, 3)} µm taller than the master.`; },
    summary: 'When an optical flat rests on a surface at a slight angle, the air between them forms a thin wedge. Monochromatic light reflected from the two surfaces interferes; wherever the gap is a whole number of half-wavelengths the reflections cancel and a dark fringe appears. Fringes are therefore contours of equal gap, λ/2 apart in height. On a perfectly flat surface they are straight and parallel; on a curved surface they bow, and the bow divided by the fringe spacing, times λ/2, is the flatness error. The direction of the bow relative to the contact edge tells convex from concave. The same principle compares a slip gauge with a master: the number of fringes across the test gauge gives the slope of the flat and hence the height difference.',
    formulas: [['Dark fringe condition (air gap t)', '2t = mλ  (m = 0, 1, 2 …)'], ['Height per fringe', 'Δt = λ/2'], ['Flatness error', 'E = (b/a) × λ/2  (b = bow, a = fringe spacing)'], ['Gauge comparison', 'Δh = n (λ/2)(L/l)'], ['Sodium light', 'λ = 0.5893 µm → λ/2 = 0.2947 µm']],
    theory: `<h3>Interference in an air wedge</h3><p>An optical flat is a disc of quartz or glass whose working face is flat to a few hundredths of a micrometre. Laid on a surface, it leaves a thin wedge of air. Light reflected from the underside of the flat and light reflected from the surface below travel paths that differ by twice the gap; with the phase change on reflection, they cancel when 2t = mλ, giving a dark fringe. Each fringe is therefore a line of constant gap, and successive fringes differ in gap by λ/2: about 0.29 µm for sodium light. Monochromatic light is needed so that the fringes are sharp and many can be counted.</p>
      <h3>Reading flatness</h3><p>The flat is pressed lightly so that it touches the surface along one edge, and a few fringes appear across the surface. Their number depends only on the tilt of the flat and does not matter. If the surface is flat, the fringes are straight and parallel. If it is curved, they bow. A straight line is laid through the two ends of a fringe; the bow b of the fringe from this line, divided by the spacing a between fringes, gives the departure from flatness in fringes, and multiplying by λ/2 gives micrometres. A bow of one quarter of a fringe in sodium light is 0.07 µm.</p>
      <h3>Convex or concave</h3><p>Because each fringe is a contour of equal gap, the fringe has to move to where the gap reaches its value. On a convex surface the middle is high, so the gap grows more slowly there and the fringe has to go further from the contact edge: the fringes bow away from the contact. On a concave surface they bow towards it. A light touch on the flat confirms this: the fringes move away from the point where the gap is being closed.</p>
      <h3>Comparing slip gauges</h3><p>Two gauges of the same nominal size are wrung on a flat base plate a distance L apart, and the optical flat is laid across both. If the flat is parallel to the master, no fringes appear on it; the test gauge then shows n fringes across its width l because the flat is tilted. The tilt is n(λ/2)/l, so over the distance L the test gauge is higher than the master by n(λ/2)(L/l). Fringe patterns on both gauges also show whether their faces are flat and parallel.</p>`,
    procedure: ['Clean the optical flat and the surfaces with alcohol and a chamois; blow off dust. Handle the flat by its edges.', 'Switch on the monochromatic lamp and wait until the light is steady.', 'Lay the flat gently on the test surface; press lightly near one edge so it touches there and forms a wedge.', 'Adjust the pressure until four to six fringes cross the surface; note the contact edge.', 'Lay a straight edge (or imagine a line) through the ends of a central fringe; estimate its bow as a fraction of the fringe spacing; note the direction.', 'Wring the master and test gauges on the base plate, lay the flat across them, and count the fringes across the test gauge.', 'Lift the flat off; never slide it. Clean and store it in its case.'],
    precautions: ['Never slide the optical flat on a surface; grit scratches it.', 'Handle the flat by its edges; fingerprints and warmth distort the fringes.', 'Use monochromatic light; white light gives only a few coloured fringes.', 'View square to the surface to avoid errors from oblique viewing.', 'Let the flat and the work reach the same temperature.'],
    applications: ['Checking the flatness of gauge blocks, micrometer anvils, lapped seal faces and valve seats.', 'Comparing slip gauges against masters in calibration laboratories.', 'Inspecting polished optical surfaces and semiconductor wafers.', 'Checking the parallelism of micrometer anvils with optical parallels.'],
    errors: ['Estimating the bow by eye (±0.1 fringe).', 'Dust under the flat creating a large, false wedge.', 'Flat not truly flat (its own error, ≈ λ/10–λ/20).', 'Oblique viewing.', 'Temperature differences distorting the surfaces.'],
    discussion: ['Why does the number of fringes not indicate flatness, while their shape does?', 'Explain from the contour idea why a convex surface makes fringes bow away from the contact edge.', 'Why is monochromatic light used? What would you see with white light?', 'How would you check the parallelism of a micrometer’s anvils with optical parallels?'],
    refs: ['ISO 1101:2017, Geometrical product specifications (GPS). Geometrical tolerancing. Tolerances of form, orientation, location and run-out.', 'ISO 3650:1998, Gauge blocks.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 9.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 9 (interferometry).', 'E. Hecht, Optics, 5th ed., Pearson, Ch. 9.'],
    pre: [
      { q: 'One interference fringe corresponds to a change in air gap of', o: ['λ', 'λ/2', 'λ/4', '2λ'], a: 1, why: 'Path difference is twice the gap.' },
      { q: 'An optical flat is used mainly to check', o: ['Length', 'Flatness of lapped surfaces', 'Roughness', 'Hardness'], a: 1, why: 'It is a flatness reference.' },
      { q: 'Monochromatic light is used because', o: ['It is brighter', 'It gives many sharp fringes of a single known wavelength', 'It is cheaper', 'It heats the surface less'], a: 1, why: 'A single λ gives well-defined fringes.' },
      { q: 'Straight, parallel, equally spaced fringes indicate a surface that is', o: ['Convex', 'Flat', 'Concave', 'Rough'], a: 1, why: 'Equal-gap contours of a plane wedge are straight lines.' },
      { q: 'The optical flat should be removed from a surface by', o: ['Sliding it off', 'Lifting it straight off', 'Rotating it', 'Tapping it'], a: 1, why: 'Sliding scratches it.' }
    ],
    post: [
      { q: 'Sodium light (λ = 0.5893 µm); fringes bow by half a spacing. Flatness error:', o: ['0.29 µm', '0.15 µm', '0.59 µm', '1.18 µm'], a: 1, why: '0.5 × 0.2947 = 0.147 µm.' },
      { q: 'Fringes bow away from the line of contact. The surface is', o: ['Concave', 'Convex', 'Flat', 'Cannot tell'], a: 1, why: 'The middle is high, so each gap value is reached further away.' },
      { q: '4 fringes across a test gauge 9 mm wide, gauges 30 mm apart, λ/2 = 0.2947 µm. Height difference:', o: ['1.18 µm', '3.93 µm', '0.35 µm', '11.8 µm'], a: 1, why: '4 × 0.2947 × 30/9 = 3.93 µm.' },
      { q: 'Pressing the flat harder near the contact edge mainly changes', o: ['The flatness', 'The number and spacing of fringes', 'The wavelength', 'The surface'], a: 1, why: 'It changes the wedge angle only.' },
      { q: 'With mercury green light (λ = 0.5461 µm) the height per fringe is', o: ['0.546 µm', '0.273 µm', '0.137 µm', '1.09 µm'], a: 1, why: 'λ/2.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Fringe images computed from the air-gap field (wedge + curvature) with intensity cos²(2πt/λ); fringe bow, shape and gauge fringe counts follow exactly from the gap geometry and the lamp wavelength.', 'Hecht Ch. 9; Galyer & Shotbolt Ch. 9'];
  LAB.NOMEN[ID] = [['λ', 'Wavelength of the light', 'µm'], ['t', 'Air-gap thickness', 'µm'], ['m', 'Fringe order', '—'], ['a', 'Fringe spacing', '—'], ['b', 'Bow of a fringe from a straight line', '—'], ['E', 'Flatness error', 'µm'], ['n', 'Number of fringes across the test gauge', '—'], ['l', 'Width of the test gauge across which fringes are counted', 'mm'], ['L', 'Distance between master and test gauges', 'mm'], ['Δh', 'Height difference of the gauges', 'µm']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Clean the flat and the surfaces', note: 'Alcohol, chamois, air blower; handle the flat by its edges', why: 'Dust under the flat ruins the pattern; cleaning comes first.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(160, 260, 'clean, dust-free', 260, 214) : ''; } },
    { op: 1, d: 2.0, title: 'Switch on the monochromatic lamp', note: 'Wait for steady light', why: 'The light must be on to see fringes when the flat is placed.',
      draw(L, u, c) { c.op('lampg', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Lay the flat on the surface and press near one edge', note: 'A wedge with four to six fringes', why: 'The flat is placed on the cleaned surface under the lamp.',
      draw(L, u, c) { c.set('flat', 'transform', `translate(0 ${-40 * (1 - E(u))})`); L.innerHTML = c.active ? tag(150, 150, 'touch one edge', 145, 196) : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Light in a thin wedge', lines: [
      ['An optical flat is a quartz disc polished flat to a few hundredths of a micron.', { s: 0 }],
      ['Laid on a surface with one edge touching, it leaves a wedge of air a fraction of a micron thick.', { s: 2 }],
      ['Under sodium light, dark bands appear wherever the air gap is a whole number of half wavelengths.', { r: [0, 0.5] }]],
      q: { q: 'Moving from one dark fringe to the next, the air gap changes by', o: ['One wavelength', 'Half a wavelength', 'A quarter wavelength', 'Nothing'], a: 1, why: 'The light crosses the gap twice.' } },
    { title: 'Reading the bow', lines: [
      ['On a flat surface the fringes are straight. Here they bow.', { r: [0, 0.5] }],
      ['Join the ends of a fringe with a straight line. How far its middle strays, compared with the fringe spacing, is the flatness error in half wavelengths.', null],
      ['If the middles bow away from the contact edge, the centre is high: the surface is convex.', null]],
      q: { q: 'A fringe bows by a quarter of the spacing in sodium light. The surface is out of flat by about', o: ['0.59 µm', '0.07 µm', '0.29 µm', '0.15 µm'], a: 1, why: '0.25 × 0.295 µm.' } },
    { title: 'Comparing two gauges', lines: [
      ['Two slip gauges stand side by side. The flat bridges them.', { r: [0.5, 1] }],
      ['The master shows no fringes. The test gauge shows several, because the flat is tilted.', { r: [0.5, 1] }],
      ['Fringes times half a wavelength, times the gauge separation over the gauge width, is the height difference.', null]],
      q: { q: 'More fringes across the test gauge mean', o: ['A smaller height difference', 'A larger height difference', 'A rougher gauge', 'A different wavelength'], a: 1, why: 'More fringes = steeper tilt of the flat.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard. Mercury lamps emit UV (use the filter housing).', 'Optical flat is fragile and expensive.'],
    ppe: ['Lint-free gloves for handling the flat'],
    rules: ['Never look into an unshielded mercury lamp.', 'Hold the flat by its edges; never slide it.', 'Keep the flat in its case when not in use.'],
    emerg: ['If a lamp breaks, ventilate the room and report it (mercury).'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Optical flat', 'Ø 60 mm, fused quartz, λ/10', 'Flatness reference'], ['Light box', 'Na, He or Hg (with green filter)', 'Monochromatic illumination'], ['Lapped test piece', 'Steel, Ø 50 mm', 'Surface under test'], ['Slip gauges', 'Master and test, 25 mm', 'Comparison by interference'], ['Base plate', 'Lapped steel, for wringing', 'Holds the gauges']], note: 'Optical parallels (pairs of flats with parallel faces) check micrometer anvils at four positions of the spindle.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const lam = Pk(r, [0.5893, 0.5876, 0.5461]), b = Pk(r, [0.2, 0.25, 0.4, 0.5, 0.75, 1, 1.5]), ans = b * lam / 2; return { title: 'Flatness from a fringe bow', q: `With light of wavelength ${lam} µm, a fringe bows by ${b} of the fringe spacing. Find the flatness error.`, ans, unit: 'µm', hints: ['One fringe = λ/2.', 'E = (bow/spacing) × λ/2.'], sol: `E = ${b} × ${lam}/2 = <b>${s(ans)} µm</b>.` }; },
    r => { const lam = 0.5893, n = Pk(r, [2, 3, 4, 5, 6]), l = Pk(r, [9, 10]), L = Pk(r, [25, 30, 35]), ans = n * lam / 2 * L / l; return { title: 'Gauge comparison', q: `Two slip gauges are ${L} mm apart under an optical flat (sodium light, λ = 0.5893 µm). ${n} fringes are seen across the ${l} mm width of the test gauge and none on the master. Find the height difference.`, ans, unit: 'µm', hints: ['Tilt of the flat = n(λ/2)/l.', 'Δh = tilt × L.'], sol: `Δh = ${n} × 0.29465 × ${L}/${l} = <b>${s(ans)} µm</b>.` }; },
    r => { const lam = Pk(r, [0.5893, 0.5461, 0.6328]), m = Pk(r, [3, 5, 8, 10]), ans = m * lam / 2; return { title: 'Gap at a fringe', q: `Counting from the line of contact, what is the thickness of the air gap at the ${m}th dark fringe with light of λ = ${lam} µm?`, ans, unit: 'µm', hints: ['Contact is the zeroth dark fringe.', 't = mλ/2.'], sol: `t = ${m} × ${lam}/2 = <b>${s(ans)} µm</b>.` }; }
  ];
})();
