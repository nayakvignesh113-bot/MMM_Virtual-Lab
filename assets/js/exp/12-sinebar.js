/* Exp 12 — Measurement of angle (taper) with a sine bar, slip gauges and a dial test indicator. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'sinebar';
  const SPEC = { mt3: { name: 'Morse taper No. 3 plug gauge (included angle 2° 52′ 26″)', ang: 2.873873, len: 60, tol: 26 / 3600 }, r724: { name: 'Steep-taper (7:24) arbor shank (included angle 16° 15′ 37″)', ang: 16.260204, len: 60, tol: 12 / 3600 }, a30: { name: 'Angle block, 30°', ang: 30, len: 50, tol: 30 / 3600 }, a60: { name: 'Bevelled component, 60° (above 45°)', ang: 60, len: 40, tol: 2 / 60 } };
  const dms = d => { const s = Math.round(Math.abs(d) * 3600), D = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; return `${d < 0 ? '−' : ''}${D}° ${String(m).padStart(2, '0')}′ ${String(sec).padStart(2, '0')}″`; };

  LAB.register({
    id: ID, no: 12, cat: 'ang', title: 'Measurement of Angle using a Sine Bar', std: 'IS 5359 (sine bars) / BS 3064', short: 'A sine bar is set to the nominal angle of a taper or angle block with a slip-gauge stack. A dial test indicator traversed along the top of the part shows how far the part departs from the set angle; you read it, correct the angle and see why sine bars lose accuracy above 45°.', tags: 'sine bar slip gauges angle taper morse taper 7:24 dial test indicator angle measurement sine rule cosine error surface plate arc seconds',
    aim: 'To measure the angle of a taper plug or angle block using a sine bar, slip gauges and a dial test indicator, and to determine its deviation from the nominal angle.',
    objectives: ['Calculate the slip-gauge height for a given angle and sine-bar length.', 'Set up the sine bar on a surface plate and traverse a dial indicator along the work.', 'Read the indicator and convert the difference in readings into an angle correction.', 'Express the angle and its error in degrees, minutes and seconds.', 'Show how the sensitivity of the sine bar falls as the angle approaches 90°.'],
    apparatus: ['Sine bar, 100 mm or 200 mm between roller centres, accuracy ±2 µm', 'Grade 0 surface plate, granite', 'Slip-gauge set M87, grade 1', 'Dial test indicator, 1 µm/div, on a surface-gauge stand', 'Work: taper plug gauge, arbor shank or angle block', 'Angle plate / clamp for the work'],
    stdNote: 'IS 5359 (and BS 3064) specify sine bars: roller centre distance accurate to a few micrometres, rollers equal and parallel to the top face. Sine bars are recommended for angles up to 45°; above that, the cosine term makes the result sensitive to errors in the slip-gauge height.',
    params: [
      { id: 'spec', label: 'Component', type: 'select', options: Object.entries(SPEC).map(([k, v]) => [k, v.name]), def: 'mt3' },
      { id: 'L', label: 'Sine bar length', type: 'select', options: [['200', '200 mm'], ['100', '100 mm']], def: '200' }
    ],
    opSteps: ['Clean the surface plate, sine bar and slip gauges', 'Calculate H = L sin θ and build the slip-gauge stack', 'Place one roller on the plate and the other on the stack', 'Clamp the component on the sine bar', 'Set the dial indicator on the top face at point 1 and read it', 'Traverse to point 2 (distance l along the face) and read it', 'Calculate the correction and the actual angle'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(30, 236, 500, 20, 'mach', 'rx="2"')}${G.t(36, 272, 'surface plate', 'm')}
        <g id="bar"><rect x="0" y="-12" width="300" height="12" class="steel"/><circle cx="18" cy="6" r="8" class="steelD"/><circle cx="282" cy="6" r="8" class="steelD"/><g id="wk"><path id="wkp" d="M60 -12 L240 -12 L240 -40 L60 -46 Z" class="spec"/></g></g>
        <g id="stack" style="display:none"></g>
        <g id="dti"><rect x="400" y="40" width="10" height="190" class="steelD"/><rect x="300" y="60" width="110" height="8" class="mach2"/><circle id="dtip" cx="300" cy="74" r="4" class="ink"/>${G.t(330, 52, 'dial test indicator', 'm')}</g>
        <g transform="translate(420,140)">${G.r(0, 0, 124, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'INDICATOR (µm)', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dD"')}</g>
        <g transform="translate(420,60)">${G.r(0, 0, 124, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'SET ANGLE', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dA" style="font-size:12px"')}</g>`, 'Sine bar on a surface plate with a slip-gauge stack under one roller, component on the bar and a dial test indicator');
    },
    anim(svg, f, sim, p) {
      const L = +p.L, sc = 300 / L, ang = sim ? sim.setAng : SPEC[p.spec].ang; const Hpx = Math.min(200, L * Math.sin(ang * Math.PI / 180) * sc);
      const th = Math.asin(Math.min(0.999, Hpx / 264)); // drawing angle with roller spacing 264 px
      G.set(svg, 'bar', 'transform', `translate(60 ${222 - 0}) rotate(${-th * 180 / Math.PI} 18 6)`);
      let st = ''; const n = Math.max(1, Math.round(Hpx / 22)); for (let i = 0; i < n; i++) st += `<rect x="${60 + 18 + 264 * Math.cos(th) - 18}" y="${228 - (i + 1) * Hpx / n + 6}" width="36" height="${Hpx / n}" class="steel" stroke="var(--line)"/>`;
      const sEl = svg.querySelector('#stack'); if (sEl) sEl.innerHTML = st; G.show(svg, 'stack', true);
      G.set(svg, 'wkp', 'd', p.spec === 'a60' || p.spec === 'a30' ? 'M60 -12 L240 -12 L240 -60 L60 -60 Z' : 'M60 -12 L240 -12 L240 -40 L60 -46 Z');
      G.txt(svg, 'dA', dms(ang));
      if (!sim) { G.txt(svg, 'dD', '—'); return; }
      const k = f < 0.5 ? 0 : 1; G.set(svg, 'dti', 'transform', `translate(${k ? -110 : 0} ${k ? 18 : 0})`); G.txt(svg, 'dD', 'see picture');
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth; api.title('Top face against the set angle'); api.sub(f < 0.5 ? 'at point 1' : 'at point 2');
      const xs = U.lin(0, T.l, 20); G.profileView(el, { xlabel: 'Distance along the face from point 1 (mm)', ylabel: 'Indicator reading (µm)', series: [{ name: 'face', x: xs, y: xs.map(x => T.r1 + (T.r2 - T.r1) * x / T.l), color: 's1' }, { name: 'readings', x: f < 0.5 ? [0] : [0, T.l], y: f < 0.5 ? [T.r1] : [T.r1, T.r2], type: 'scatter', color: 's2' }], xmin: 0, xmax: T.l, yzero: false }, 210);
    },
    simulate(p, r) {
      const S = SPEC[p.spec], L = +p.L * (1 + 1e-5 * U.gauss(r)), Lnom = +p.L;
      const Hn = Lnom * Math.sin(S.ang * Math.PI / 180), H = Math.round(Hn * 2000) / 2000; const stack = P.slip(H, 'M87');
      const setAng = Math.asin(H / L) * 180 / Math.PI; // actual set angle (roller distance error included)
      const actual = S.ang + S.tol * 0.9 * (2 * r() - 1); // the component's true angle
      const l = S.len, z = Math.round(20 * (r() - 0.5)); const d = l * Math.tan((actual - setAng) * Math.PI / 180) * 1000; // µm
      const r1 = Math.round(z + 0.4 * U.gauss(r)), r2 = Math.round(z + d + 0.4 * U.gauss(r)); // point 1 near the hinge roller, point 2 towards the slip gauges
      const dlt = r2 - r1, corr = Math.atan(dlt / 1000 / l) * 180 / Math.PI, meas = Math.asin(H / Lnom) * 180 / Math.PI + corr;
      const sens = 1e-3 / (Lnom * Math.cos(S.ang * Math.PI / 180)) * 180 / Math.PI * 3600; // arcsec per µm of H
      const T = { H, Hn, stack, setAng, actual, l, r1, r2, dlt, corr, meas, err: (meas - S.ang) * 3600, sens, nom: S.ang };
      return {
        truth: T, setAng, dur: 8,
        readout(f) { return [['Slip height H', U.f(H, 4), 'mm'], ['Set angle', dms(Math.asin(H / Lnom) * 180 / Math.PI), ''], ['Point', f < 0.5 ? '1' : '2', ''], ['Indicator', 'see picture', 'µm'], ['Distance l', l, 'mm']]; },
        specimen: [['Component', S.name, ''], ['Nominal angle', dms(S.ang) + ' = ' + U.f(S.ang, 5) + '°', ''], ['Sine bar length L', Lnom, 'mm'], ['Distance between indicator points l', l, 'mm'], ['Indicator', 'dial test indicator, 1 µm/div', ''], ['Slip gauges', 'M87, grade 1', '']],
        obs: [{ title: 'Table 1. Readings', cols: ['Item', 'Value', 'Unit'], textCols: [0, 2], rows: [['Slip-gauge stack used', stack ? stack.join(' + ') : '—', 'mm'], ['Indicator at point 1 (near the hinge roller)', '<b>see picture</b>', 'µm'], ['Indicator at point 2 (towards the slip gauges)', '<b>see picture</b>', 'µm'], ['Distance between points l', l, 'mm']], note: 'If the face rises from point 1 to point 2 (reading 2 larger), the component angle is larger than the set angle.' }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth; el.innerHTML = M.readPanel('Read the dial test indicator', 'Scale: 1 µm per division. Note the sign.', [{ svg: M.compSVG(T.r1, { label: '1 µm/div · ±50 µm · point 1' }), cap: 'Point 1 (near the hinge roller)' }, { svg: M.compSVG(T.r2, { label: '1 µm/div · ±50 µm · point 2' }), cap: `Point 2, ${T.l} mm further along` }]); },
    expHint: 'H = L sin θ (round to the nearest 0.0005 mm that the slip gauges can make). Angle set = sin⁻¹(H/L). Correction = tan⁻¹[(reading 2 − reading 1)/l]. Actual angle = set angle + correction. 1° = 3600″.',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'h', label: 'Slip-gauge height H for the nominal angle (to 0.0005 mm)', unit: 'mm', truth: T.H, abs: 0.0006, fmt: v => U.f(v, 4) },
      { key: 'r1', label: 'Indicator reading at point 1', unit: 'µm', truth: T.r1, abs: 0.6, fmt: v => U.f(v, 0) },
      { key: 'r2', label: 'Indicator reading at point 2', unit: 'µm', truth: T.r2, abs: 0.6, fmt: v => U.f(v, 0) },
      { key: 'c', label: 'Angle correction tan⁻¹(δ/l)', unit: '″', truth: T.corr * 3600, abs: 3, fmt: v => U.f(v, 1) },
      { key: 'm', label: 'Measured angle of the component', unit: '°', truth: T.meas, abs: 0.001, fmt: v => U.f(v, 5) },
      { key: 'e', label: 'Deviation from the nominal angle', unit: '″', truth: T.err, abs: 4, fmt: v => U.f(v, 1) },
      { key: 's', label: 'Sensitivity: change in angle for a 1 µm error in H, dθ = dH/(L cos θ)', unit: '″', truth: T.sens, tol: 0.02, fmt: v => U.f(v, 2) }]; },
    reference(sim, p) { const T = sim.truth, S = SPEC[p.spec]; return [{ label: 'Deviation from nominal', unit: '″', value: T.err, lo: -S.tol * 3600, hi: S.tol * 3600, src: 'Component tolerance ±' + U.f(S.tol * 3600, 0) + '″', fmt: v => U.f(v, 1) }, { label: 'Sensitivity to slip height', unit: '″/µm', value: T.sens, lo: 0, hi: 2.1, src: 'Acceptable up to 45° (200 mm bar: 1.46″/µm)', fmt: v => U.f(v, 2) }]; },
    valExtra(el, sim, p) { const T = sim.truth; const tbl = [0, 15, 30, 45, 60, 75, 85].map(a => [a + '°', U.f(1e-3 / (+p.L * Math.cos(a * Math.PI / 180)) * 180 / Math.PI * 3600, 2)]); el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Why sine bars are limited to about 45°</h4></div><div class="grid2" style="align-items:start">${LAB.tableHTML({ cols: ['Angle', 'Error per µm of H (″)'], rows: tbl })}<p class="muted" style="font-size:.86rem">Measured angle ${dms(T.meas)} against nominal ${dms(T.nom)}: deviation ${U.f(T.err, 1)}″. Because θ = sin⁻¹(H/L), dθ = dH/(L cos θ). As θ approaches 90°, cos θ approaches zero and any error in the slip-gauge height, the roller spacing or the flatness of the plate is magnified. ${p.spec === 'a60' ? 'At 60° each micrometre of H costs twice as much angle as at 0°. Set up the complement (30°) with an angle plate, or use a sine table or an autocollimator with angle gauges instead.' : 'Below 45° the sine bar gives a few seconds of arc with grade 1 slip gauges.'}</p></div></div>`; },
    sample(sim, p) { const T = sim.truth; return `<div class="eq">H = L sin θ = ${p.L} × sin ${U.f(T.nom, 5)}° = ${U.f(T.Hn, 5)} → <b>${U.f(T.H, 4)} mm</b> (${T.stack ? T.stack.join(' + ') : '—'})</div><div class="eq">δ = r₂ − r₁ = ${T.r2} − (${T.r1}) = ${T.dlt} µm over l = ${T.l} mm; correction = tan⁻¹(${T.dlt}×10⁻³/${T.l}) = <b>${U.f(T.corr * 3600, 1)}″</b></div><div class="eq">Set angle = sin⁻¹(${U.f(T.H, 4)}/${p.L}) = ${U.f(Math.asin(T.H / +p.L) * 180 / Math.PI, 5)}°; measured = <b>${U.f(T.meas, 5)}° = ${dms(T.meas)}</b></div><div class="eq">Deviation = ${U.f(T.err, 1)}″; sensitivity = 1 µm/(${p.L} × cos θ) = ${U.f(T.sens, 2)}″ per µm</div>`; },
    uncert(sim, p) { const T = sim.truth; const uH = Math.sqrt((T.stack || [1, 1, 1]).length) * 0.25 / Math.sqrt(3); return [{ q: 'Slip-gauge height', expr: '√n × 0.25 µm/√3 (grade 1)', val: T.H, u: uH / 1000, unit: 'mm' }, { q: 'Roller centre distance', expr: '2 µm/√3', val: +p.L, u: 0.002 / Math.sqrt(3), unit: 'mm' }, { q: 'Measured angle', expr: '√[(u_H/(L cos θ))² + (H u_L/(L² cos θ))² + (u_δ/l)²], u_δ = 0.6 µm', val: T.meas, u: M.rss(uH * T.sens, Math.tan(T.nom * Math.PI / 180) * 0.002 / Math.sqrt(3) / +p.L * 206265, 0.6 / 1000 / T.l * 206265) / 3600, unit: '°' }]; },
    conclude(sim, p) { const T = sim.truth; return `The sine bar (${p.L} mm) was set with a ${U.f(T.H, 4)} mm slip-gauge stack. The indicator rose by ${T.dlt} µm over ${T.l} mm along the top face, a correction of ${U.f(T.corr * 3600, 1)}″, so the measured angle is ${dms(T.meas)} (${U.f(T.meas, 5)}°), ${U.f(Math.abs(T.err), 1)}″ ${T.err >= 0 ? 'above' : 'below'} the nominal ${dms(T.nom)}. At this angle an error of 1 µm in the slip-gauge height changes the result by ${U.f(T.sens, 2)}″.`; },
    summary: 'A sine bar is a hardened steel bar with two equal rollers whose centres are an exact distance L apart. With one roller on a surface plate and the other on a stack of slip gauges of height H, the top face is inclined at θ = sin⁻¹(H/L). The component is placed on the bar, which is set to its nominal angle; a dial test indicator traversed along the top face of the component then reads zero difference if the angle is exactly nominal. A difference δ over a distance l means the component angle differs from the set angle by tan⁻¹(δ/l). Because dθ = dH/(L cos θ), errors in H matter more and more as θ approaches 90°, so sine bars are used up to about 45°.',
    formulas: [['Sine-bar principle', 'sin θ = H / L'], ['Correction from the indicator', 'Δθ = tan⁻¹(δ/l),  δ = r₂ − r₁'], ['Measured angle', 'θ = sin⁻¹(H/L) + Δθ'], ['Sensitivity', 'dθ = dH / (L cos θ)  (radians)'], ['Taper and angle', 'included angle 2α; taper per unit length = 2 tan α'], ['Arc-seconds', '1 rad = 206 265″']],
    theory: `<h3>The sine bar</h3><p>A sine bar is a precision bar of hardened steel with two cylindrical rollers of equal diameter fixed at its ends. The distance between the roller centres, usually 100 or 200 mm, is made to within a few micrometres, and the top face is parallel to the line joining the roller centres. Placed with one roller on a surface plate and the other on a stack of slip gauges of height H, the bar forms the hypotenuse of a right-angled triangle, and its top face is inclined at θ = sin<sup>−1</sup>(H/L).</p>
      <h3>Measuring an angle</h3><p>To check a component, the sine bar is set to the nominal angle of the component and the component is clamped on it so that its face to be checked lies on top. A dial test indicator on a surface gauge is traversed along the face. If the component angle equals the set angle, the face is parallel to the surface plate and the indicator reading does not change. If the reading rises by δ over a distance l, the component angle is larger by tan<sup>−1</sup>(δ/l). For a taper plug lying on the bar, the top generator makes the included angle with the bottom generator, so the bar is set to the included angle.</p>
      <h3>Sensitivity and the 45° limit</h3><p>Differentiating sin θ = H/L gives dθ = dH/(L cos θ). With L = 200 mm and θ small, an error of 1 µm in H gives an angle error of about 1″. At 60° the same 1 µm gives 2″, at 80° nearly 6″. Errors in the roller spacing, in the slip-gauge stack and in the flatness of the surface plate are magnified in the same way. Sine bars are therefore recommended up to 45°; for larger angles the complementary angle is set up with an angle plate.</p>
      <h3>Units of angle</h3><p>Angles in metrology are expressed in degrees, minutes and seconds: 1° = 60′ = 3600″. A Morse taper No. 3 has an included angle of about 2° 52′ 26″; a 7:24 steep taper (milling machine spindles) 16° 15′ 37″. One second of arc subtends about 0.5 µm over 100 mm.</p>`,
    procedure: ['Clean the surface plate, the sine bar, its rollers and the slip gauges.', 'Calculate H = L sin θ for the nominal angle and build the slip-gauge stack with the fewest blocks.', 'Place the hinge roller on the plate and the other roller on the stack, so the bar rises towards the stack.', 'Clamp the component on the bar with the face to be checked uppermost.', 'Set the dial test indicator at point 1 on the face near the hinge end; note the reading.', 'Traverse the surface gauge to point 2, a known distance l along the face; note the reading.', 'Calculate the correction and the measured angle.'],
    precautions: ['Wring and handle slip gauges with care; dirt under a roller tilts the bar.', 'Make sure both rollers touch: one fully on the plate, the other fully on the stack.', 'Traverse the indicator along a line parallel to the bar’s axis.', 'Measure l carefully; it scales the correction.', 'Avoid angles above 45° on a sine bar.'],
    applications: ['Inspection of tapers on machine spindles, tool shanks and gauges.', 'Setting work at an angle for grinding or milling (sine tables).', 'Checking angle gauges and bevel protractors.', 'Calibration of clinometers and levels.'],
    errors: ['Error in the roller centre distance.', 'Slip-gauge stack error.', 'Surface-plate flatness and dirt under rollers.', 'Indicator error and distance l.', 'Component not seated on the bar (burrs).', 'Large-angle magnification (cos θ).'],
    discussion: ['Why does the indicator reading change if the component angle differs from the set angle?', 'Show from dθ = dH/(L cos θ) why sine bars are not used above 45°.', 'How would you measure a 60° angle accurately with a sine bar?', 'Why is the taper plug set to its included angle and not its half angle?'],
    refs: ['IS 5359:1969, Specification for sine bars.', 'BS 3064:1978, Specification for sine bars and sine tables.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 7.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 6.', 'N. V. Raghavendra, L. Krishnamurthy, Engineering Metrology and Measurements, Oxford, Ch. 5.'],
    pre: [
      { q: 'A sine bar of length L set with slip gauges of height H is inclined at', o: ['tan⁻¹(H/L)', 'sin⁻¹(H/L)', 'cos⁻¹(H/L)', 'H/L degrees'], a: 1, why: 'L is the hypotenuse.' },
      { q: 'The length of a sine bar is the distance between', o: ['Its ends', 'The roller centres', 'The rollers’ outer edges', 'Its mounting holes'], a: 1, why: 'Centre distance defines the triangle.' },
      { q: 'Sine bars are recommended for angles up to about', o: ['15°', '45°', '75°', '90°'], a: 1, why: 'Above 45°, cos θ magnifies errors.' },
      { q: '1° equals', o: ['60″', '3600″', '100″', '360″'], a: 1, why: '60 minutes of 60 seconds.' },
      { q: 'The instrument traversed along the work is a', o: ['Vernier caliper', 'Dial test indicator', 'Micrometer', 'Protractor'], a: 1, why: 'It shows small height differences.' }
    ],
    post: [
      { q: 'For 30° on a 200 mm sine bar, H =', o: ['173.205 mm', '100.000 mm', '115.470 mm', '50.000 mm'], a: 1, why: '200 × sin 30° = 100 mm.' },
      { q: 'The indicator rises 20 µm over 50 mm. The correction is about', o: ['20″', '82″', '400″', '4″'], a: 1, why: 'tan⁻¹(0.02/50) = 0.0004 rad = 82.5″.' },
      { q: 'At 60°, the error per µm of H on a 200 mm bar is', o: ['1.03″', '2.06″', '0.5″', '6″'], a: 1, why: '1×10⁻³/(200 × 0.5) rad = 10⁻⁵ rad = 2.06″.' },
      { q: 'If the reading at point 2 (towards the stack) is lower than at point 1, the component angle is', o: ['Larger than set', 'Smaller than set', 'Equal', 'Unknown'], a: 1, why: 'The face falls towards the high end, so it is less steep than the bar.' },
      { q: 'Dirt under the roller on the slip gauges acts like', o: ['A shorter bar', 'An increase in H', 'A decrease in L', 'Nothing'], a: 1, why: 'It raises that roller.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Exact sine-bar geometry with slip-gauge height rounded to the M87 step, roller centre-distance error 1×10⁻⁵ of L, component angle within its tolerance, indicator repeatability 0.4 µm; sensitivity dθ = dH/(L cos θ).', 'IS 5359; BS 3064; Galyer & Shotbolt Ch. 6'];
  LAB.NOMEN[ID] = [['L', 'Sine bar length (roller centre distance)', 'mm'], ['H', 'Slip-gauge height', 'mm'], ['θ', 'Angle', '° ′ ″'], ['r₁, r₂', 'Indicator readings at points 1 and 2', 'µm'], ['δ', 'Difference r₂ − r₁', 'µm'], ['l', 'Distance between points 1 and 2', 'mm'], ['Δθ', 'Angle correction', '″']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.0, title: 'Clean the plate, the bar and the gauges', note: 'Dirt under a roller tilts the bar', why: 'Cleaning comes before any gauge is placed.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(60, 200, 'clean', 120, 236) : ''; } },
    { op: 1, d: 2.4, title: 'Build the slip-gauge stack H = L sin θ', note: s => `H = ${U.f(s.truth.H, 4)} mm: ${s.truth.stack ? s.truth.stack.join(' + ') : '—'}`, why: 'The stack must exist before the bar can be set on it.',
      draw(L, u, c) { c.op('stack', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: 'Set the bar: hinge roller on the plate, other roller on the stack', note: 'Both rollers fully seated', why: 'The bar goes onto the stack once the stack is built.',
      draw(L, u, c) { c.op('bar', E(u)); L.innerHTML = ''; } },
    { op: 3, d: 2.0, title: 'Clamp the component on the bar', note: 'Face to be checked uppermost, seated without burrs', why: 'The component is clamped on the set bar, before the indicator is brought in.',
      draw(L, u, c) { c.op('wk', E(u)); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'A triangle you can trust', lines: [
      ['A sine bar has two rollers an exact distance apart. One rests on the surface plate, the other on a stack of slip gauges.', { s: 2 }],
      ['The bar is the hypotenuse of a right triangle. Its angle is the inverse sine of stack height over bar length.', { s: 1 }],
      ['The part to be checked is clamped on top.', { s: 3 }]],
      q: { q: 'For 15° on a 100 mm sine bar, the stack height is about', o: ['15 mm', '25.88 mm', '96.59 mm', '26.79 mm'], a: 1, why: '100 × sin 15° = 25.88 mm.' } },
    { title: 'Feeling the slope', lines: [
      ['A dial test indicator touches the top of the part near the hinge end. Its reading is noted.', { r: [0, 0.45] }],
      ['Then it slides along to a second point. If the reading changes, the part’s angle differs from the bar’s.', { r: [0.55, 1] }],
      ['The rise in microns over the distance gives the correction, as an arc tangent.', null]],
      q: { q: 'The reading rises by 10 µm over 50 mm. The part’s angle is', o: ['Smaller than set by 41″', 'Larger than set by about 41″', 'Larger by 10″', 'Exactly as set'], a: 1, why: 'tan⁻¹(0.01/50) = 2×10⁻⁴ rad ≈ 41″, and a rise means steeper.' } },
    { title: 'The 45° rule', lines: [
      ['A small error in the stack height changes the angle by that error divided by L cos theta.', null],
      ['Near zero degrees cos theta is one. At sixty degrees it is a half, so every error doubles.', null],
      ['That is why sine bars stay below about forty-five degrees.', null]],
      q: { q: 'How do you check a 70° angle with a sine bar?', o: ['Set 70° directly', 'Set the complement, 20°, using an angle plate', 'Use a longer stack', 'It cannot be checked'], a: 1, why: 'Measuring the complement keeps cos θ near 1.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Heavy sine bar or component sliding off the stack onto hands.', 'Slip gauges damaged by impact.'],
    ppe: ['Closed shoes', 'Gloves for handling slip gauges'],
    rules: ['Clamp the component; never balance it.', 'Lower the bar onto the stack gently.', 'Keep fingers away from under the raised end.', 'Return slip gauges to the case immediately after use.'],
    emerg: ['If the bar slips, let it fall onto the plate; do not catch it.', 'Report a pinched finger to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Sine bar', '200 mm (also 100 mm), centre distance ±2 µm', 'Sets the angle'], ['Surface plate', 'Granite, grade 0', 'Datum'], ['Slip gauges', 'M87, grade 1', 'Height H'], ['Dial test indicator', '1 µm/div, lever type', 'Detects slope'], ['Surface gauge', 'Fine adjustment', 'Carries the indicator'], ['Components', 'MT3 plug, 7:24 shank, angle blocks', 'Work']], note: 'Check the sine bar itself by setting it to 0° on two equal stacks: the indicator should not change along its top face.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const L = Pk(r, [100, 200, 250]), th = R(r, 3, 44, 2), ans = L * Math.sin(th * Math.PI / 180); return { title: 'Slip-gauge height', q: `Find the slip-gauge height to set a ${L} mm sine bar to ${th}°.`, ans, unit: 'mm', hints: ['H = L sin θ.', 'Make sure the calculator is in degrees.'], sol: `H = ${L} × sin ${th}° = <b>${s(ans, 6)} mm</b>.` }; },
    r => { const d = Math.round(R(r, 5, 60, 0)), l = Pk(r, [40, 50, 75, 100]), ans = Math.atan(d / 1000 / l) * 206265; return { title: 'Correction from an indicator', q: `A dial indicator traversed ${l} mm along a component on a sine bar rises by ${d} µm. By how many seconds of arc does the component angle exceed the set angle?`, ans, unit: '″', hints: ['Δθ = tan⁻¹(δ/l).', '1 rad = 206 265″.'], sol: `Δθ = tan⁻¹(${d}×10⁻³/${l}) = ${s(Math.atan(d / 1000 / l), 4)} rad = <b>${s(ans)}″</b>.` }; },
    r => { const L = Pk(r, [100, 200]), th = Pk(r, [10, 30, 45, 60, 75]), ans = 1e-3 / (L * Math.cos(th * Math.PI / 180)) * 206265; return { title: 'Sensitivity of a sine bar', q: `On a ${L} mm sine bar set at ${th}°, how many seconds of arc of error does a 1 µm error in the slip-gauge height cause?`, ans, unit: '″', hints: ['dθ = dH/(L cos θ) in radians.', '× 206 265 for seconds.'], sol: `dθ = 0.001/(${L} × cos ${th}°) × 206 265 = <b>${s(ans)}″</b>.` }; }
  ];
})();
