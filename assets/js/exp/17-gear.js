/* Exp 17 — Spur gear tooth thickness by gear tooth vernier caliper and base tangent span by disc micrometer. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'gear';
  const GEARS = { g1: { m: 3, z: 30 }, g2: { m: 2.5, z: 40 }, g3: { m: 4, z: 24 } };
  const PHI = 20;

  LAB.register({
    id: ID, no: 17, cat: 'tg', title: 'Gear Tooth Thickness by Gear Tooth Vernier and Base Tangent Method', std: 'ISO 21771 / ISO 1328-1 / IS 2535 (spur gears)', short: 'You set the vertical slide of a gear tooth vernier to the chordal addendum (corrected for the measured tip diameter), read the chordal thickness on the horizontal vernier yourself, and compare it with theory; then you check the same gear with a disc micrometer over k teeth (base tangent span).', tags: 'gear tooth vernier caliper chordal thickness chordal addendum constant chord base tangent span disc micrometer involute spur gear module pressure angle backlash tooth thickness',
    aim: 'To measure the tooth thickness of a spur gear at the pitch circle with a gear tooth vernier caliper, and the base tangent span with a disc micrometer, and to compare both with their theoretical values.',
    objectives: ['Calculate the chordal thickness and chordal addendum of a spur gear tooth.', 'Correct the vertical setting for the actual tip diameter.', 'Read a vernier scale to 0.02 mm.', 'Calculate the number of teeth to span and the theoretical base tangent length.', 'Express the tooth thickness deviation and relate it to backlash.'],
    apparatus: ['Gear tooth vernier caliper: vertical and horizontal verniers, least count 0.02 mm', 'Disc (gear tooth) micrometer, 25–50 mm, least count 0.01 mm', 'Spur gears, 20° pressure angle, full-depth teeth: m = 3, z = 30; m = 2.5, z = 40; m = 4, z = 24', 'Vernier or micrometer for the tip (outside) diameter'],
    stdNote: 'ISO 21771 gives the involute gear geometry used here (chordal thickness, constant chord, base tangent length W = m cos α [π(k − ½) + z inv α]); ISO 1328-1 defines accuracy grades. Tooth thickness is made slightly less than half the circular pitch to give backlash.',
    params: [
      { id: 'g', label: 'Gear', type: 'select', options: [['g1', 'm = 3 mm, z = 30'], ['g2', 'm = 2.5 mm, z = 40'], ['g3', 'm = 4 mm, z = 24']], def: 'g1' },
      { id: 'cor', label: 'Vertical slide setting', type: 'select', options: [['cor', 'Corrected for the measured tip diameter'], ['nom', 'Nominal chordal addendum (tip diameter ignored)']], def: 'cor' }
    ],
    opSteps: ['Measure the tip (outside) diameter of the gear', 'Calculate the chordal addendum, correct it for the tip diameter and set the vertical vernier', 'Seat the vertical slide on the tooth tip and close the horizontal jaws on the flanks', 'Read the horizontal vernier: chordal thickness; repeat on teeth round the gear', 'Calculate k and set the disc micrometer over k teeth', 'Read the base tangent span at several positions'],
    svg(p) {
      const g = GEARS[p.g]; let teeth = ''; const N = 22; for (let i = 0; i < N; i++) { const a = -0.9 + i * 1.8 / (N - 1); teeth += `<path d="M${280 + 230 * Math.sin(a - 0.03)} ${300 - 230 * Math.cos(a - 0.03)} L${280 + 250 * Math.sin(a - 0.015)} ${300 - 250 * Math.cos(a - 0.015)} L${280 + 250 * Math.sin(a + 0.015)} ${300 - 250 * Math.cos(a + 0.015)} L${280 + 230 * Math.sin(a + 0.03)} ${300 - 230 * Math.cos(a + 0.03)} Z" class="steel" stroke="var(--line)"/>`; }
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        <circle cx="280" cy="300" r="231" class="steel"/>${teeth}
        <g id="gtv"><rect x="250" y="10" width="14" height="40" class="mach2"/><rect x="236" y="38" width="88" height="12" class="mach"/><rect id="jawL" x="262" y="50" width="6" height="22" class="ink"/><rect id="jawR" x="292" y="50" width="6" height="22" class="ink"/><rect id="vslide" x="276" y="10" width="8" height="40" class="acc"/></g>${G.t(330, 30, 'gear tooth vernier', 'm')}
        <g id="disc" style="display:none"><circle cx="190" cy="80" r="18" fill="none" stroke="var(--accent)" stroke-width="4"/><circle cx="370" cy="80" r="18" fill="none" stroke="var(--accent)" stroke-width="4"/><line x1="208" y1="80" x2="352" y2="80" class="ln" stroke-dasharray="4 3"/>${G.t(240, 74, 'W over k teeth', 'm')}</g>
        <g transform="translate(20,20)">${G.r(0, 0, 160, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'READING', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dR" style="font-size:12px"')}</g>
        <g transform="translate(400,100)">${G.r(0, 0, 144, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'GEAR', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, `m ${g.m} · z ${g.z} · 20°`, 'big', 'style="font-size:11px"')}</g>`, 'Gear tooth vernier caliper on a spur gear tooth; disc micrometer over several teeth');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.show(svg, 'disc', false); G.show(svg, 'gtv', true); return; }
      const T = sim.truth; const ph = f < 0.55 ? 0 : 1; G.show(svg, 'gtv', !ph); G.show(svg, 'disc', !!ph);
      G.txt(svg, 'dR', ph ? (f > 0.7 ? 'W ' + U.f(T.Wr[Math.min(2, Math.floor((f - 0.7) / 0.1))], 2) + ' mm' : 'setting k…') : (f > 0.3 ? 'w: see picture' : 'h set'));
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth; api.title('Tooth thickness round the gear'); api.sub('chordal thickness at the pitch circle');
      G.profileView(el, { xlabel: 'Tooth checked', ylabel: 'Chordal thickness (mm)', series: [{ name: 'measured w', x: T.wr.map((_, i) => i + 1), y: T.wr, type: 'linepts', color: 's1' }], hlines: [{ y: T.wth, label: 'theoretical', color: 'muted' }], xmin: 0, xmax: T.wr.length + 1, yzero: false }, 210);
    },
    simulate(p, r) {
      const g = GEARS[p.g], m = g.m, z = g.z; const ch = P.gearChord(m, z), cc = P.constChord(m, PHI); const k = P.spanTeeth(z, PHI); const Wth = P.baseTan(m, z, k, PHI);
      const dsTh = -(0.05 + 0.05 * r()) * m / 3 - 0.02 * r(); // tooth thickness reduction (backlash allowance), mm (arc ≈ chord)
      const daNom = m * (z + 2), da = U.q(daNom - (0.02 + 0.12 * r()), 0.01); const hCor = ch.h - (daNom - da) / 2;
      // measured chordal thickness: with the slide at h_set, the jaws sit at depth h_set below the actual tip; a deeper setting gives a thicker chord
      const hSet = p.cor === 'cor' ? hCor : ch.h; const depthErr = hSet - hCor; // + means jaws lower than the pitch circle
      const flankSlope = 2 * Math.tan(PHI * Math.PI / 180); // change of chordal thickness per mm of depth near the pitch circle
      const wr = []; for (let i = 0; i < 6; i++) wr.push(U.q(ch.w + dsTh + 0.012 * U.gauss(r) + depthErr * flankSlope, 0.02));
      const wPic = wr[0]; const wMean = U.mean(wr);
      const Wr = [0, 1, 2].map(() => U.q(Wth + dsTh * Math.cos(PHI * Math.PI / 180) + 0.006 * U.gauss(r), 0.01)); const Wm = U.mean(Wr);
      const T = { m, z, k, Wth, Wr, Wm, dW: Wm - Wth, wth: ch.w, hth: ch.h, hCor, hSet, da, daNom, wr, wPic, wMean, dw: wPic - ch.w, cc, dsTh };
      return {
        truth: T, dur: 10,
        readout(f) { return f < 0.55 ? [['Instrument', 'gear tooth vernier', ''], ['Vertical set h', U.f(hSet, 3), 'mm'], ['Horizontal w', f > 0.3 ? 'see picture' : '—', 'mm'], ['Tip diameter', U.f(da, 2), 'mm']] : [['Instrument', 'disc micrometer', ''], ['Teeth spanned k', k, ''], ['W', f > 0.7 ? U.f(Wr[Math.min(2, Math.floor((f - 0.7) / 0.1))], 2) : '…', 'mm']]; },
        specimen: [['Gear', `spur, m = ${m} mm, z = ${z}, α = 20°, full depth`, ''], ['Nominal tip diameter m(z + 2)', U.f(daNom, 2), 'mm'], ['Measured tip diameter d_a', U.f(da, 2), 'mm'], ['Vertical slide setting used', U.f(hSet, 3) + (p.cor === 'cor' ? ' (corrected)' : ' (nominal)'), 'mm'], ['Gear tooth vernier least count', '0.02', 'mm'], ['Disc micrometer least count', '0.01', 'mm']],
        obs: [{ title: 'Table 1. Chordal thickness on six teeth (gear tooth vernier)', cols: ['Tooth', 'w (mm)'], rows: wr.map((v, i) => [i + 1, i === 0 ? '<b>see picture</b>' : U.f(v, 2)]) }, { title: 'Table 2. Base tangent span over k teeth (disc micrometer)', cols: ['Position', 'W (mm)'], rows: Wr.map((v, i) => [i + 1, U.f(v, 2)]) }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth, V = M.vernierSVG(T.wPic); el.innerHTML = M.readPanel('Read the horizontal vernier (tooth 1)', 'Main scale in centimetres with 1 mm divisions; the vernier has 50 divisions in 49 mm (least count 0.02 mm). Reading = main-scale mm before the vernier zero + (number of the coinciding vernier division × 0.02 mm). The vernier numbers 0–10 mark every 0.1 mm.', [{ svg: V.svg, cap: 'Horizontal vernier of the gear tooth caliper', wide: true, vern: true, scroll: V.zeroPx }]); M.initScales(el); },
    expHint: 'Chordal thickness w = z m sin(90°/z); chordal addendum h = m[1 + (z/2)(1 − cos(90°/z))]. Corrected setting h′ = h − (d_a,nom − d_a,meas)/2. Teeth to span k = z α/180° + 0.5 (rounded); W = m cos α [π(k − 0.5) + z inv α], inv α = tan α − α (radians).',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'h', label: 'Theoretical chordal addendum h', unit: 'mm', truth: T.hth, abs: 0.002, fmt: v => U.f(v, 3) },
      { key: 'hc', label: 'Vertical setting corrected for the measured tip diameter, h′', unit: 'mm', truth: T.hCor, abs: 0.006, fmt: v => U.f(v, 3) },
      { key: 'w', label: 'Theoretical chordal thickness w', unit: 'mm', truth: T.wth, abs: 0.002, fmt: v => U.f(v, 3) },
      { key: 'wp', label: 'Measured chordal thickness of tooth 1 (from the vernier picture)', unit: 'mm', truth: T.wPic, abs: 0.011, fmt: v => U.f(v, 2) },
      { key: 'dw', label: 'Tooth thickness deviation of tooth 1, measured − theoretical', unit: 'mm', truth: T.dw, abs: 0.012, fmt: v => U.f(v, 3) },
      { key: 'k', label: 'Number of teeth to span k', unit: '—', truth: T.k, abs: 0.1, fmt: v => U.f(v, 0) },
      { key: 'W', label: 'Theoretical base tangent span W', unit: 'mm', truth: T.Wth, abs: 0.004, fmt: v => U.f(v, 3) },
      { key: 'dW', label: 'Deviation of the mean measured span from theory', unit: 'mm', truth: T.dW, abs: 0.01, fmt: v => U.f(v, 3) }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Thickness deviation (chordal) vs (span)/cos α', unit: 'mm', value: T.dw - T.dW / Math.cos(PHI * Math.PI / 180), lo: -0.04, hi: 0.04, src: 'The two methods should agree', fmt: v => U.f(v, 3) }, { label: 'Tooth thickness reduction for backlash', unit: 'mm', value: -T.dsTh, lo: 0.03, hi: 0.15 * T.m / 3 + 0.03, src: 'Typical for module ' + T.m + ' (ISO 21771 / DIN 3967 c–e series)', fmt: v => U.f(v, 3) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Comparing the two methods</h4></div><p class="muted" style="font-size:.86rem">Chordal method (mean of six teeth): ${U.f(T.wMean, 3)} mm against ${U.f(T.wth, 3)} mm, deviation ${U.f(T.wMean - T.wth, 3)} mm. Base tangent method: mean span ${U.f(T.Wm, 3)} mm against ${U.f(T.Wth, 3)} mm, deviation ${U.f(T.dW, 3)} mm; dividing by cos α gives the equivalent thickness change ${U.f(T.dW / Math.cos(PHI * Math.PI / 180), 3)} mm. ${p.cor === 'nom' ? 'You set the vertical slide to the nominal chordal addendum, but the tip diameter is ' + U.f(T.daNom - T.da, 2) + ' mm undersize, so the jaws sat ' + U.f((T.daNom - T.da) / 2, 3) + ' mm below the pitch circle, where the tooth is thicker: the chordal reading is too large. The base tangent method does not depend on the tip at all, which is its great advantage.' : 'Because the vertical slide was corrected for the tip diameter, the jaws sat on the pitch circle and both methods agree. The base tangent method needs no reference to the tip at all.'} The constant chord (independent of z) is ${U.f(T.cc.c, 3)} mm at a depth of ${U.f(T.cc.h, 3)} mm.</p></div>`; },
    sample(sim, p) { const T = sim.truth; return `<div class="eq">w = z m sin(90°/z) = ${T.z} × ${T.m} × sin(${U.f(90 / T.z, 3)}°) = <b>${U.f(T.wth, 3)} mm</b></div><div class="eq">h = m[1 + (z/2)(1 − cos(90°/z))] = <b>${U.f(T.hth, 3)} mm</b>; h′ = h − (${U.f(T.daNom, 2)} − ${U.f(T.da, 2)})/2 = <b>${U.f(T.hCor, 3)} mm</b></div><div class="eq">Tooth 1: w = <b>${U.f(T.wPic, 2)} mm</b>, deviation ${U.f(T.dw, 3)} mm</div><div class="eq">k = ${T.z} × 20/180 + 0.5 = ${U.f(T.z * 20 / 180 + 0.5, 2)} → ${T.k}; W = ${T.m} cos 20° [π(${T.k} − 0.5) + ${T.z} × ${U.f(P.inv(20), 6)}] = <b>${U.f(T.Wth, 3)} mm</b></div><div class="eq">Mean W = (${T.Wr.map(v => U.f(v, 2)).join(' + ')})/3 = ${U.f(T.Wm, 3)} mm; deviation <b>${U.f(T.dW, 3)} mm</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Chordal thickness (one reading)', expr: '√[(0.02/√12)² + (0.01 jaw seating)²]', val: T.wPic, u: M.rss(M.uRes(0.02), 0.01), unit: 'mm' }, { q: 'Base tangent span (mean of 3)', expr: '√[(0.01/√12)² + s²/3]', val: T.Wm, u: M.rss(M.uRes(0.01), U.sd(T.Wr) / Math.sqrt(3)), unit: 'mm' }]; },
    conclude(sim, p) { const T = sim.truth; return `For the spur gear (m = ${T.m} mm, z = ${T.z}, 20°) the theoretical chordal thickness is ${U.f(T.wth, 3)} mm at a chordal addendum of ${U.f(T.hth, 3)} mm (corrected to ${U.f(T.hCor, 3)} mm for the measured tip diameter). Tooth 1 measured ${U.f(T.wPic, 2)} mm (deviation ${U.f(T.dw, 3)} mm). Over k = ${T.k} teeth the base tangent span averaged ${U.f(T.Wm, 3)} mm against ${U.f(T.Wth, 3)} mm (deviation ${U.f(T.dW, 3)} mm). The teeth are thinned for backlash by about ${U.f(-T.dsTh, 3)} mm.`; },
    summary: 'The thickness of a gear tooth decides the backlash in a gear pair. The gear tooth vernier caliper measures the chordal thickness w at the pitch circle: its vertical slide is set to the chordal addendum h, the distance from the tooth tip to the chord at the pitch circle, and the horizontal jaws are closed on the flanks. Because h is measured from the tip, any error in the tip diameter must be corrected. The base tangent method avoids the tip altogether: a disc micrometer measured over k teeth touches two opposite flanks along a tangent to the base circle, and the span W = m cos α[π(k − ½) + z inv α] depends only on the involute. A thinner tooth reduces W by the thickness change times cos α.',
    formulas: [['Chordal thickness at the pitch circle', 'w = z m sin(90°/z)'], ['Chordal addendum', 'h = m[1 + (z/2)(1 − cos(90°/z))]'], ['Correction for tip diameter', 'h′ = h − (d_a,nom − d_a,meas)/2'], ['Constant chord', 'c = (πm/2) cos²α;  depth h_c = m[1 − (π/8) sin 2α]'], ['Teeth to span', 'k = zα/180° + 0.5 (rounded)'], ['Base tangent span', 'W = m cos α [π(k − ½) + z inv α];  inv α = tan α − α']],
    theory: `<h3>Tooth thickness and backlash</h3><p>In a spur gear the circular pitch πm is shared between a tooth and a space. If each tooth were exactly πm/2 thick at the pitch circle, the meshing teeth would have no clearance and would jam with the slightest error or thermal expansion. Teeth are therefore thinned by a small, controlled amount, which gives the backlash. Measuring tooth thickness is the way to check it.</p>
      <h3>Gear tooth vernier caliper</h3><p>The instrument has two verniers at right angles. The vertical vernier sets the depth of a tongue that rests on the tip of the tooth; the horizontal vernier measures the chord across the tooth at that depth. At the pitch circle the chord is w = z m sin(90°/z), and its depth below the tip, the chordal addendum, is h = m[1 + (z/2)(1 − cos(90°/z))]: slightly more than the module because the tip is curved. If the tip diameter is undersize, the tongue sits lower, so the setting must be reduced by half the error in tip diameter; otherwise the jaws close on a thicker part of the tooth. The constant chord, where the tooth touches a rack, has a length (πm/2)cos<sup>2</sup>α independent of the number of teeth, and is sometimes used instead.</p>
      <h3>Reading the vernier</h3><p>The main scale is divided in millimetres. The vernier has 50 divisions in 49 mm, so each vernier division is 0.98 mm and the difference, the least count, is 0.02 mm. The reading is the main-scale value just before the vernier zero, plus the number of the vernier division that lines up exactly with a main-scale line, times 0.02 mm.</p>
      <h3>Base tangent (span) method</h3><p>Any straight line tangent to the base circle is normal to the involute flanks it crosses. A disc micrometer with flat discs placed over k teeth therefore touches two opposite flanks at points on such a tangent, and the distance between them is W = m cos α[π(k − ½) + z inv α], where inv α = tan α − α is the involute function. k is chosen so that the contact points lie near the middle of the flanks: k ≈ zα/180° + 0.5. The span does not depend on the tip diameter or the gear centre, so it is quick and accurate; a thinning of the teeth by Δs reduces W by Δs cos α.</p>`,
    procedure: ['Measure the tip diameter of the gear at several places.', 'Calculate the chordal addendum h and correct it for the measured tip diameter; set the vertical vernier to h′ and lock it.', 'Rest the tongue on the tip of a tooth with the caliper square to the gear axis; close the horizontal jaws gently on the flanks.', 'Read the horizontal vernier; repeat on teeth spaced round the gear.', 'Calculate k and W; set the disc micrometer over k teeth, rock it slightly to find the minimum and read it at three positions.', 'Compare the measured values with theory.'],
    precautions: ['Keep the caliper square to the gear axis and in the plane of the gear.', 'Close the jaws gently; the tooth flanks are curved and the jaws can tilt.', 'Correct the depth setting for the tip diameter, or use the base tangent method.', 'Rock the disc micrometer and take the minimum reading.', 'Clean burrs and chips from the teeth.'],
    applications: ['Checking tooth thickness and backlash allowance in gear manufacture.', 'Setting gear-cutting machines (hobbing, shaping) for size.', 'Inspection of gears in repair and overhaul.', 'Selecting mating gears for a required backlash.'],
    errors: ['Error in the tip diameter (chordal method).', 'Jaws not square to the tooth.', 'Vernier reading (least count 0.02 mm).', 'Runout of the gear (thickness varies round the gear).', 'Profile errors of the involute.', 'Burrs on the tooth flanks.'],
    discussion: ['Why must the vertical setting be corrected for the tip diameter? What happens if it is not?', 'Why does the base tangent method not depend on the tip diameter?', 'Your teeth are thinner than theory. Is that an error? Explain with backlash.', 'Why is k chosen near zα/180 + 0.5?'],
    refs: ['ISO 21771:2007, Gears. Cylindrical involute gears and gear pairs. Concepts and geometry.', 'ISO 1328-1:2013, Cylindrical gears. ISO system of flank tolerance classification.', 'IS 2535:1978, Basic rack of cylindrical gears for general and heavy engineering.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 13.', 'D. W. Dudley, Handbook of Practical Gear Design, CRC Press, 1994, Ch. 6.'],
    pre: [
      { q: 'The least count of a vernier with 50 divisions in 49 mm is', o: ['0.1 mm', '0.02 mm', '0.05 mm', '0.01 mm'], a: 1, why: '1 − 49/50 = 0.02 mm.' },
      { q: 'A gear tooth vernier measures', o: ['The pitch', 'The chordal thickness at a set depth below the tip', 'The base circle', 'The runout'], a: 1, why: 'Vertical slide sets depth, horizontal jaws measure the chord.' },
      { q: 'Teeth are made thinner than half the circular pitch to provide', o: ['Strength', 'Backlash', 'Lubrication only', 'Interference'], a: 1, why: 'Clearance between meshing teeth.' },
      { q: 'The base tangent method uses', o: ['A gear tooth vernier', 'A disc micrometer over several teeth', 'An optical flat', 'A sine bar'], a: 1, why: 'Span measurement.' },
      { q: 'The module of a gear is', o: ['Pitch diameter × teeth', 'Pitch diameter / number of teeth', 'Teeth / pitch diameter', 'Addendum × 2'], a: 1, why: 'm = d/z.' }
    ],
    post: [
      { q: 'm = 3, z = 30. Chordal thickness w is about', o: ['4.712 mm', '4.710 mm', '9.42 mm', '3.000 mm'], a: 1, why: '90 sin 3° = 4.7102 mm, just under the arc thickness πm/2 = 4.712 mm.' },
      { q: 'The tip diameter is 0.10 mm undersize. The vertical setting should be', o: ['Increased by 0.10 mm', 'Reduced by 0.05 mm', 'Reduced by 0.10 mm', 'Unchanged'], a: 1, why: 'Half the diameter error.' },
      { q: 'For z = 30 and α = 20°, k is', o: ['3', '4', '5', '6'], a: 1, why: '30 × 20/180 + 0.5 = 3.83 → 4.' },
      { q: 'Teeth thinned by 0.10 mm reduce the span W by about', o: ['0.10 mm', '0.094 mm', '0.034 mm', '0.20 mm'], a: 1, why: '0.10 × cos 20°.' },
      { q: 'If the vertical slide is set too deep, the chordal reading is', o: ['Too small', 'Too large', 'Correct', 'Zero'], a: 1, why: 'The tooth is thicker towards its root.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Chordal thickness, chordal addendum, constant chord and base tangent span from the exact involute geometry (ISO 21771); tooth thinning for backlash, tip-diameter undersize and the resulting depth error of the chordal method; vernier drawn at 0.02 mm.', 'ISO 21771; Dudley Ch. 6; Jain Ch. 13'];
  LAB.NOMEN[ID] = [['m', 'Module', 'mm'], ['z', 'Number of teeth', '—'], ['α', 'Pressure angle (20°)', '°'], ['w', 'Chordal thickness at the pitch circle', 'mm'], ['h, h′', 'Chordal addendum; corrected setting', 'mm'], ['d_a', 'Tip (outside) diameter', 'mm'], ['c, h_c', 'Constant chord and its depth', 'mm'], ['k', 'Number of teeth spanned', '—'], ['W', 'Base tangent span', 'mm'], ['inv α', 'Involute function, tan α − α', 'rad']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.0, title: 'Measure the tip diameter', note: s => `d_a = ${U.f(s.truth.da, 2)} mm (nominal ${U.f(s.truth.daNom, 2)} mm)`, why: 'The tip diameter is needed before the vertical slide can be set.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(60, 150, 'tip diameter', 100, 120) : ''; } },
    { op: 1, d: 2.4, title: s => 'Set the vertical slide to the corrected chordal addendum', note: (s, p) => `h${p.cor === 'cor' ? '′' : ''} = ${U.f(s.truth.hSet, 3)} mm, locked`, why: 'The depth is set before the caliper is put on the tooth.',
      draw(L, u, c) { c.set('vslide', 'transform', `translate(0 ${12 * E(u)})`); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Rest on the tooth tip and close the jaws', note: 'Square to the gear axis; jaws closed gently', why: 'The jaws are closed only once the depth is set and the tongue rests on the tip.',
      draw(L, u, c) { c.set('jawL', 'transform', `translate(${10 * E(u)} 0)`); c.set('jawR', 'transform', `translate(${-10 * E(u)} 0)`); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Two verniers at right angles', lines: [
      ['A gear tooth vernier has two scales. The vertical one sets how deep below the tip the measurement is taken.', { s: 1 }],
      ['The depth is the chordal addendum: where the jaws will meet the tooth on its pitch circle.', { s: 1 }],
      ['Then the horizontal jaws close on the two flanks.', { s: 2 }]],
      q: { q: 'The tip is undersize, but you set the nominal depth. The reading is', o: ['Too small', 'Too large, because the jaws sit lower where the tooth is thicker', 'Correct', 'Zero'], a: 1, why: 'Depth is measured from the tip.' } },
    { title: 'Reading the vernier', lines: [
      ['The main scale is in millimetres. Fifty vernier divisions fill forty-nine millimetres.', { r: [0, 0.4] }],
      ['Look for the one vernier line that lines up exactly with a main-scale line. Its number times two hundredths is added to the millimetres.', { r: [0.4, 0.55] }],
      ['Several teeth round the gear are checked.', { r: [0.3, 0.55] }]],
      q: { q: 'The vernier zero is past 4 mm and line 36 coincides. The reading is', o: ['4.36 mm', '4.72 mm', '4.036 mm', '5.36 mm'], a: 1, why: '4 + 36 × 0.02 = 4.72 mm.' } },
    { title: 'Over several teeth', lines: [
      ['A disc micrometer spans several teeth and touches two opposite flanks.', { r: [0.55, 0.8] }],
      ['The line between the contacts is tangent to the base circle, so the span depends only on the involute, not on the tip.', { r: [0.8, 1] }],
      ['Thinner teeth give a shorter span, by the thinning times cos twenty degrees.', null]],
      q: { q: 'Why is the span method often preferred in production?', o: ['It needs no calculation', 'It does not depend on the tip diameter or on finding a depth', 'It measures pitch', 'It is less accurate but cheaper'], a: 1, why: 'Only the flanks are touched.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Sharp burrs on gear teeth.', 'Heavy gears dropped on feet.'],
    ppe: ['Cut-resistant gloves when handling gears', 'Closed shoes'],
    rules: ['Deburr before measuring.', 'Support the gear on V-blocks or a mandrel.', 'Close caliper jaws gently.'],
    emerg: ['For a cut, apply pressure and report it.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Gear tooth vernier', 'Module 1–16, 0.02 mm', 'Chordal thickness'], ['Disc micrometer', '25–50 mm, 0.01 mm, Ø 20 mm discs', 'Base tangent span'], ['Gears', 'm 2.5/3/4, 20°, full depth', 'Work'], ['Vernier caliper', '0–150 mm, 0.02 mm', 'Tip diameter'], ['Mandrel / V-blocks', '—', 'Support']], note: 'Span measurement tables (W for k teeth) are in the Metrology Handbook, Gears.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const m = Pk(r, [2, 2.5, 3, 4, 5]), z = Pk(r, [18, 24, 30, 40, 50]), ans = P.gearChord(m, z).w; return { title: 'Chordal thickness', q: `Find the chordal tooth thickness at the pitch circle of a spur gear with module ${m} mm and ${z} teeth.`, ans, unit: 'mm', hints: ['w = z m sin(90°/z).', `90/z = ${s(90 / z)}°.`], sol: `w = ${z} × ${m} × sin(${s(90 / z)}°) = <b>${s(ans, 5)} mm</b>.` }; },
    r => { const m = Pk(r, [2, 2.5, 3, 4, 5]), z = Pk(r, [18, 24, 30, 40, 50]), ans = P.gearChord(m, z).h; return { title: 'Chordal addendum', q: `Find the chordal addendum (vertical setting) for a gear of module ${m} mm and ${z} teeth.`, ans, unit: 'mm', hints: ['h = m[1 + (z/2)(1 − cos(90°/z))].', 'It is slightly more than m.'], sol: `h = ${m}[1 + ${z / 2}(1 − cos ${s(90 / z)}°)] = <b>${s(ans, 5)} mm</b>.` }; },
    r => { const m = Pk(r, [2, 2.5, 3, 4]), z = Pk(r, [20, 24, 30, 36, 40]), k = P.spanTeeth(z, 20), ans = P.baseTan(m, z, k, 20); return { title: 'Base tangent span', q: `A 20° spur gear has module ${m} mm and ${z} teeth. Using k = ${k} teeth, find the base tangent span W. (inv 20° = 0.014904)`, ans, unit: 'mm', hints: ['W = m cos α [π(k − ½) + z inv α].', 'cos 20° = 0.93969.'], sol: `W = ${m} × 0.93969 × [π × ${k - 0.5} + ${z} × 0.014904] = <b>${s(ans, 5)} mm</b>.` }; }
  ];
})();
