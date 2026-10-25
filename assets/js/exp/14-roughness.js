/* Exp 14 — Surface roughness of a turned surface with a stylus profilometer (Ra, Rq, Rz, cut-off, Gaussian filter). */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'roughness';
  const DX = 0.002; // mm sampling interval
  const TOOL = { sharp: { name: 'Sharp carbide insert, r_ε = 0.8 mm', r: 0.8, rnd: 0.35 }, worn: { name: 'Worn insert (flank wear 0.3 mm), r_ε = 0.8 mm', r: 0.8, rnd: 1.1 } };

  function gaussMean(z, lc) { // ISO 16610-21 Gaussian filter, mean line, with end effects avoided by evaluating only the interior
    const a = 0.4697, w = a * lc, h = Math.ceil(lc / DX); const k = []; let s = 0; for (let i = -h; i <= h; i++) { const v = Math.exp(-Math.PI * ((i * DX) / w) ** 2); k.push(v); s += v; } const n = z.length, m = new Array(n).fill(NaN);
    for (let i = h; i < n - h; i++) { let acc = 0; for (let j = -h; j <= h; j++) acc += z[i + j] * k[j + h]; m[i] = acc / s; } return { m, h };
  }
  function params(r, nSL) { // r: roughness ordinates over the evaluation length; nSL sampling lengths
    const n = r.length, mean = U.mean(r); const rr = r.map(v => v - mean); const Ra = U.mean(rr.map(Math.abs)), Rq = Math.sqrt(U.mean(rr.map(v => v * v))); const L = Math.floor(n / nSL); const Rzi = []; const pk = [], vl = [];
    for (let k = 0; k < nSL; k++) { const seg = rr.slice(k * L, (k + 1) * L); const p = Math.max(...seg), v = Math.min(...seg); pk.push(p); vl.push(-v); Rzi.push(p - v); }
    const Rsk = U.mean(rr.map(v => v ** 3)) / Rq ** 3; return { Ra, Rq, Rz: U.mean(Rzi), Rt: Math.max(...rr) - Math.min(...rr), Rsk, pk, vl, Rzi };
  }

  LAB.register({
    id: ID, no: 14, cat: 'form', title: 'Measurement of Surface Roughness using a Stylus Profilometer', std: 'ISO 21920-2 (ISO 4287) / ISO 4288 / ISO 16610-21 / IS 3073', short: 'A diamond stylus traces a turned surface. The instrument separates roughness from waviness with a Gaussian filter and reports Ra, Rq and Rz. You compute them by hand from ordinates and peak tables, compare with the feed-mark theory, and see what a wrong cut-off does.', tags: 'surface roughness Ra Rq Rz Rt stylus profilometer talysurf cut-off sampling length evaluation length gaussian filter mean line turning feed nose radius N grade ISO 4287 4288',
    aim: 'To measure the roughness of a turned surface with a stylus instrument, to calculate Ra, Rq and Rz from the profile, and to compare them with the values predicted from the feed and the tool nose radius.',
    objectives: ['Explain the stylus method, the mean line and the Gaussian profile filter.', 'Choose the correct cut-off wavelength and evaluation length (ISO 4288).', 'Calculate Ra and Rq from profile ordinates, and Rz from peak and valley heights.', 'Compare measured roughness with the ideal turned profile f²/(8r).', 'Assign an ISO 1302 roughness grade and interpret the result.'],
    apparatus: ['Stylus profilometer (Talysurf type): diamond stylus, tip radius 2 µm, 90° cone, force 0.75 mN; traverse unit; skidless datum', 'Turned specimens of C45 steel, Ø 40 mm, turned at 0.08, 0.15 and 0.25 mm/rev with a 0.8 mm nose-radius insert', 'Roughness reference specimen (calibration standard, Ra ≈ 3 µm)', 'V-block and levelling table'],
    stdNote: 'ISO 21920-2 (formerly ISO 4287) defines the profile parameters; ISO 16610-21 the Gaussian filter (50 % transmission at the cut-off λc); ISO 4288 the choice of cut-off: for periodic profiles from the mean spacing RSm (0.04–0.13 mm → 0.25 mm; 0.13–0.4 mm → 0.8 mm; 0.4–1.3 mm → 2.5 mm), with an evaluation length of 5 λc.',
    params: [
      { id: 'f', label: 'Feed used to turn the specimen', type: 'select', options: [['0.08', '0.08 mm/rev'], ['0.15', '0.15 mm/rev'], ['0.25', '0.25 mm/rev']], def: '0.15' },
      { id: 'tool', label: 'Tool condition', type: 'select', options: Object.entries(TOOL).map(([k, v]) => [k, v.name]), def: 'sharp' },
      { id: 'lc', label: 'Cut-off λc set on the instrument', type: 'select', options: [['0.25', '0.25 mm'], ['0.8', '0.8 mm'], ['2.5', '2.5 mm']], def: '0.8' }
    ],
    opSteps: ['Check the instrument on the roughness reference specimen', 'Clean the specimen and seat it in the V-block, axis parallel to the traverse', 'Lower the stylus onto the surface and level the traverse', 'Select the cut-off and the evaluation length (5 cut-offs)', 'Traverse across the feed marks and record the profile', 'Read Ra, Rq and Rz; print the profile', 'Lift the stylus before moving the specimen'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(40, 230, 480, 18, 'mach', 'rx="3"')}<path d="M110 230 L150 190 L190 230 Z" class="mach2"/><path d="M370 230 L410 190 L450 230 Z" class="mach2"/>
        <rect x="100" y="150" width="360" height="56" rx="28" class="spec"/><path id="marks" d="" fill="none" stroke="var(--ink)" stroke-width=".8" opacity=".5"/>${G.t(110, 222, 'turned specimen in V-blocks', 'm')}
        <g id="head"><rect x="230" y="40" width="200" height="40" rx="5" class="mach2"/><rect x="236" y="80" width="80" height="10" class="steelD"/><g id="sty"><line x1="244" y1="90" x2="244" y2="148" class="ln" stroke-width="2"/><path d="M240 146 L248 146 L244 152 Z" class="ink"/></g></g>
        ${G.t(232, 34, 'traverse unit and pickup', 'm')}
        <g transform="translate(20,20)">${G.r(0, 0, 190, 110, 'disp', 'rx="4"')}${G.t(8, 14, 'PROFILOMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 36, 'Ra  --.--- µm', 'big', 'id="dRa" style="font-size:12px"')}${G.t(8, 56, 'Rq  --.--- µm', 'big', 'id="dRq" style="font-size:12px"')}${G.t(8, 76, 'Rz  --.--- µm', 'big', 'id="dRz" style="font-size:12px"')}${G.t(8, 98, 'λc ' + p.lc + ' mm · ln 5λc', 'm', 'id="dLc" style="fill:var(--panel-ink);font-size:8px"')}</g>`, 'Stylus profilometer traversing a turned specimen held in V-blocks');
    },
    anim(svg, f, sim, p) {
      let d = ''; const fx = +p.f; for (let i = 0; i < 60; i++) d += `M${110 + i * 6 * (fx / 0.15)} 152 L${110 + i * 6 * (fx / 0.15)} 204 `; G.set(svg, 'marks', 'd', d);
      if (!sim) { ['dRa', 'dRq', 'dRz'].forEach((id, i) => G.txt(svg, id, ['Ra', 'Rq', 'Rz'][i] + '  --.--- µm')); return; }
      G.set(svg, 'sty', 'transform', `translate(${f * 160} 0)`);
      const T = sim.truth; if (f > 0.98) { G.txt(svg, 'dRa', 'Ra  ' + U.f(T.inst.Ra, 3) + ' µm'); G.txt(svg, 'dRq', 'Rq  ' + U.f(T.inst.Rq, 3) + ' µm'); G.txt(svg, 'dRz', 'Rz  ' + U.f(T.inst.Rz, 3) + ' µm'); } else ['dRa', 'dRq', 'dRz'].forEach((id, i) => G.txt(svg, id, ['Ra', 'Rq', 'Rz'][i] + '  measuring…'));
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth, n = T.px.length, k = Math.max(2, Math.floor(f * n));
      api.title('Profile as traced'); api.sub(`${U.f(T.px[k - 1], 2)} mm of ${U.f(T.px[n - 1], 2)} mm`);
      G.profileView(el, { xlabel: 'Traverse (mm)', ylabel: 'Height (µm)', series: [{ name: 'primary profile', x: T.px.slice(0, k), y: T.pz.slice(0, k), color: 's1', width: 1 }, { name: 'mean line (Gaussian)', x: T.px.slice(0, k), y: T.pm.slice(0, k), color: 's2', width: 1.6 }], xmin: 0, xmax: T.px[n - 1], yzero: false }, 210);
    },
    simulate(p, r) {
      const fd = +p.f, Tl = TOOL[p.tool], rn = Tl.r, lc = +p.lc, ln = 5 * lc, lt = ln + 2 * lc; const N = Math.round(lt / DX);
      const ph = fd * r(); const wav = (x) => 1.6 * Math.sin(2 * Math.PI * x / 3.1 + 2 * r() * 0) + 0.8 * Math.sin(2 * Math.PI * x / 1.7 + 1.1);
      // random component: smoothed noise (correlation ≈ 8 µm)
      let e = 0; const rnd = []; for (let i = 0; i < N; i++) { e = 0.9 * e + Math.sqrt(1 - 0.81) * U.gauss(r); rnd.push(e); }
      const z = []; for (let i = 0; i < N; i++) { const x = i * DX; const u = ((x + ph) % fd) - fd / 2; const ideal = (rn - Math.sqrt(rn * rn - u * u)) * 1000; z.push(ideal + Tl.rnd * rnd[i] * (1 + 0.6 * Math.abs(Math.sin(i * 0.013))) + wav(x)); }
      const G1 = gaussMean(z, lc); const rough = [], xs = []; for (let i = G1.h; i < N - G1.h; i++) { rough.push(z[i] - G1.m[i]); xs.push((i - G1.h) * DX); }
      const inst = params(rough, 5);
      // ordinates for hand calculation: 25 points over one sampling length (from the middle), relative to a chart datum
      const L = Math.floor(rough.length / 5), off = 2 * L, step = Math.floor(L / 25), datum = 10 + Math.round(8 * r());
      const ords = []; for (let k = 0; k < 25; k++) ords.push(U.q(rough[off + k * step + Math.floor(step / 2)] + datum, 0.01));
      const om = U.mean(ords), oRa = U.mean(ords.map(v => Math.abs(v - om))), oRq = Math.sqrt(U.mean(ords.map(v => (v - om) ** 2)));
      const pkT = inst.pk.map(v => U.q(v, 0.01)), vlT = inst.vl.map(v => U.q(v, 0.01)), RzT = U.mean(pkT.map((v, i) => v + vlT[i]));
      const RtTh = fd * fd / (8 * rn) * 1000, RaTh = fd * fd / (18 * Math.sqrt(3) * rn) * 1000;
      const lcOK = fd < 0.13 ? '0.25 mm' : fd < 0.4 ? '0.8 mm' : '2.5 mm';
      const plotStep = Math.max(1, Math.floor(N / 900)); const px = [], pz = [], pm = []; for (let i = G1.h; i < N - G1.h; i += plotStep) { px.push((i - G1.h) * DX); pz.push(z[i]); pm.push(G1.m[i]); }
      const rx = [], ry = []; for (let i = 0; i < rough.length; i += plotStep) { rx.push(xs[i]); ry.push(rough[i]); }
      const T = { inst, ords, om, oRa, oRq, pkT, vlT, RzT, RtTh, RaTh, lcOK, ngr: P.ngrade(inst.Ra), px, pz, pm, rx, ry, datum };
      return {
        truth: T, dur: 10,
        readout(f) { return [['Traverse', U.f(f * px[px.length - 1], 2), 'mm'], ['Cut-off λc', lc, 'mm'], ['Evaluation length', U.f(ln, 2), 'mm'], ['Ra', f > 0.98 ? U.f(inst.Ra, 3) : '…', 'µm'], ['Rz', f > 0.98 ? U.f(inst.Rz, 3) : '…', 'µm']]; },
        plot: { title: 'Roughness profile', xlabel: 'Evaluation length (mm)', ylabel: 'Roughness height (µm)', series: [{ name: 'roughness profile', x: rx, y: ry, color: 's1', width: 1 }], hlines: [{ y: 0, label: 'mean line', color: 's2' }], yzero: false, reveal: 'all', caption: `Roughness profile after the Gaussian filter (λc = ${lc} mm), evaluation length ${U.f(ln, 1)} mm` },
        plots: [{ xlabel: 'Traverse (mm)', ylabel: 'Height (µm)', series: [{ name: 'primary profile', x: px, y: pz, color: 's1', width: 1 }, { name: 'Gaussian mean line', x: px, y: pm, color: 's2' }], yzero: false, caption: 'Primary profile with the Gaussian mean line (waviness)' }],
        specimen: [['Specimen', 'C45 steel, turned', ''], ['Feed f', fd, 'mm/rev'], ['Tool', Tl.name, ''], ['Nose radius r_ε', rn, 'mm'], ['Cut-off λc (set)', lc, 'mm'], ['Evaluation length l_n', U.f(ln, 2), 'mm'], ['Stylus', 'diamond, 2 µm tip, 90°', ''], ['Instrument Ra, Rq, Rz', `${U.f(inst.Ra, 3)}, ${U.f(inst.Rq, 3)}, ${U.f(inst.Rz, 3)}`, 'µm']],
        obs: [{ title: 'Table 1. 25 ordinates over one sampling length (µm, from the chart datum)', cols: ['No.', 'z', 'No.', 'z', 'No.', 'z', 'No.', 'z', 'No.', 'z'], rows: [0, 1, 2, 3, 4].map(i => [0, 1, 2, 3, 4].flatMap(j => [i + 5 * j + 1, U.f(ords[i + 5 * j], 2)])), note: 'Equally spaced ordinates of the roughness profile, measured from an arbitrary chart datum. The mean line is their average.' },
          { title: 'Table 2. Highest peak and deepest valley in each sampling length (µm, from the mean line)', cols: ['Sampling length', 'Peak height R_p', 'Valley depth R_v'], rows: pkT.map((v, i) => [i + 1, U.f(v, 2), U.f(vlT[i], 2)]) }],
        truth: T
      };
    },
    expHint: 'From Table 1: mean line z̄ = Σz/25; Ra = Σ|z − z̄|/25; Rq = √[Σ(z − z̄)²/25]. From Table 2: Rz = average of (R_p + R_v) over the five sampling lengths. Ideal turned profile: Rt = f²/(8r), Ra ≈ f²/(18√3 r) (f and r in mm, multiply by 1000 for µm).',
    calcs(sim) { const T = sim.truth; return [
      { key: 'zm', label: 'Mean line of the 25 ordinates, z̄', unit: 'µm', truth: T.om, abs: 0.02, fmt: v => U.f(v, 3) },
      { key: 'ra', label: 'Ra from the 25 ordinates', unit: 'µm', truth: T.oRa, tol: 0.02, fmt: v => U.f(v, 3) },
      { key: 'rq', label: 'Rq from the 25 ordinates', unit: 'µm', truth: T.oRq, tol: 0.02, fmt: v => U.f(v, 3) },
      { key: 'rz', label: 'Rz from Table 2', unit: 'µm', truth: T.RzT, abs: 0.02, fmt: v => U.f(v, 3) },
      { key: 'rt', label: 'Ideal peak-to-valley height of the turned profile, f²/(8r)', unit: 'µm', truth: T.RtTh, tol: 0.01, fmt: v => U.f(v, 3) },
      { key: 'rat', label: 'Ideal Ra of the turned profile, f²/(18√3 r)', unit: 'µm', truth: T.RaTh, tol: 0.01, fmt: v => U.f(v, 3) },
      { key: 'n', label: 'ISO 1302 roughness grade for the instrument Ra', type: 'select', options: P.NGRADE.slice(2, 11).map(g => g[0]), truth: T.ngr },
      { key: 'lc', label: 'Correct cut-off for this surface (ISO 4288, periodic profile, RSm = feed)', type: 'select', options: ['0.25 mm', '0.8 mm', '2.5 mm'], truth: T.lcOK }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Instrument Ra / ideal Ra', unit: '', value: T.inst.Ra / T.RaTh, lo: 1.0, hi: p.tool === 'worn' ? 4 : 2.2, src: 'Real turned surfaces exceed the ideal (side flow, tearing, vibration)', fmt: v => U.f(v, 2) }, { label: 'Rz / Ra', unit: '', value: T.inst.Rz / T.inst.Ra, lo: 3.5, hi: 8, src: 'Typical for machined surfaces (4–7)', fmt: v => U.f(v, 2) }, { label: 'Ra from 25 ordinates vs instrument', unit: '%', value: (T.oRa / T.inst.Ra - 1) * 100, lo: -25, hi: 25, src: 'One sampling length, 25 points: a coarse estimate', fmt: v => U.f(v, 1) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Cut-off and filtering</h4><span class="eyebrow">set ${p.lc} mm · recommended ${T.lcOK}</span></div><p class="muted" style="font-size:.86rem">The feed marks repeat every ${p.f} mm. ${T.lcOK === p.lc + ' mm' ? 'The cut-off you used is the one ISO 4288 recommends: several feed marks fit in each sampling length, and the Gaussian filter removes only the longer waviness.' : (+p.lc < parseFloat(T.lcOK) ? 'Your cut-off is too short: it is not much longer than the feed-mark spacing, so the filter treats part of the feed marks as waviness and removes them. The reported Ra is too low. Re-run with the recommended cut-off.' : 'Your cut-off is too long: waviness of the specimen passes into the roughness profile and inflates Ra. Re-run with the recommended cut-off.')} Rsk = ${U.f(T.inst.Rsk, 2)}: ${T.inst.Rsk > 0 ? 'positive skew (sharp peaks), typical of the cusps left by a round-nosed tool' : 'negative skew (plateaus with deep valleys)'}.</p></div>`; },
    sample(sim) { const T = sim.truth; return `<div class="eq">z̄ = Σz/25 = ${U.f(T.ords.reduce((a, b) => a + b, 0), 2)}/25 = <b>${U.f(T.om, 3)} µm</b></div><div class="eq">Ra = Σ|z − z̄|/25 = <b>${U.f(T.oRa, 3)} µm</b>; Rq = √[Σ(z − z̄)²/25] = <b>${U.f(T.oRq, 3)} µm</b></div><div class="eq">Rz = (1/5)Σ(R_p + R_v) = (${T.pkT.map((v, i) => U.f(v + T.vlT[i], 2)).join(' + ')})/5 = <b>${U.f(T.RzT, 3)} µm</b></div><div class="eq">Ideal: Rt = f²/(8r) = <b>${U.f(T.RtTh, 3)} µm</b>; Ra = f²/(18√3 r) = <b>${U.f(T.RaTh, 3)} µm</b>; measured Ra ${U.f(T.inst.Ra, 3)} µm (${T.ngr})</div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Ra (instrument)', expr: '√[(2 % calibration)² + (5 % repeatability over the surface)²]', val: T.inst.Ra, u: T.inst.Ra * M.rss(0.02, 0.05), unit: 'µm' }, { q: 'Rz (instrument)', expr: '√[(2 %)² + (6 %)²]', val: T.inst.Rz, u: T.inst.Rz * M.rss(0.02, 0.06), unit: 'µm' }]; },
    conclude(sim, p) { const T = sim.truth; return `The turned surface (feed ${p.f} mm/rev, nose radius 0.8 mm) measured Ra = ${U.f(T.inst.Ra, 2)} µm, Rq = ${U.f(T.inst.Rq, 2)} µm and Rz = ${U.f(T.inst.Rz, 2)} µm with λc = ${p.lc} mm, roughness grade ${T.ngr}. From 25 ordinates of one sampling length, Ra was ${U.f(T.oRa, 2)} µm. The ideal turned profile gives Ra = ${U.f(T.RaTh, 2)} µm and Rt = ${U.f(T.RtTh, 2)} µm; the measured surface is ${U.f(T.inst.Ra / T.RaTh, 1)} times rougher than ideal${p.tool === 'worn' ? ', mainly because the worn tool tears the surface' : ', because of side flow, tearing and vibration'}. ${T.lcOK === p.lc + ' mm' ? 'The cut-off was correct.' : 'The cut-off should have been ' + T.lcOK + '.'}`; },
    summary: 'A stylus profilometer draws a fine diamond across the surface and records its vertical movement, magnified thousands of times. The recorded primary profile contains form, waviness and roughness; a Gaussian filter with cut-off wavelength λc separates the long-wave mean line (waviness) from the short-wave roughness. Over an evaluation length of five sampling lengths, Ra is the mean absolute deviation from the mean line, Rq the root-mean-square deviation, and Rz the average of the peak-to-valley heights in the five sampling lengths. For a turned surface the ideal profile is a train of arcs of the nose radius r spaced at the feed f, giving Rt = f²/(8r) and Ra ≈ f²/(18√3 r); real surfaces are rougher. The cut-off must suit the spacing of the marks (ISO 4288).',
    formulas: [['Arithmetical mean deviation', 'Ra = (1/l) ∫|z(x)| dx ≈ Σ|z_i − z̄|/n'], ['Root-mean-square deviation', 'Rq = √[(1/l) ∫ z² dx]'], ['Maximum height (ten-point successor)', 'Rz = (1/5) Σ (R_p,i + R_v,i)'], ['Ideal turned profile', 'Rt = f²/(8 r_ε);  Ra ≈ f²/(18√3 r_ε) = 0.0321 f²/r_ε'], ['Gaussian weighting function', 's(x) = (1/αλc) exp[−π(x/αλc)²], α = 0.4697'], ['Evaluation length', 'l_n = 5 λc']],
    theory: `<h3>Surface texture</h3><p>Every machined surface carries irregularities on several scales. Form error is the long-range deviation from the intended shape; waviness has wavelengths of millimetres, from vibration, deflection and spindle run-out; roughness is the finest texture, from the cutting process itself: feed marks, tearing, built-up edge. Roughness controls friction, wear, sealing, fatigue strength and appearance, and is specified on drawings by parameters such as Ra and Rz.</p>
      <h3>The stylus instrument</h3><p>A diamond stylus with a tip radius of 2–5 µm is drawn across the surface at constant speed. Its vertical movement is converted by an inductive transducer into an electrical signal and magnified 1000–100 000 times. The tip radius and the cone angle limit how narrow a valley it can follow; the measuring force (below 1 mN) is small enough not to scratch most metals. The trace runs perpendicular to the lay (here across the feed marks).</p>
      <h3>Filtering and the mean line</h3><p>The primary profile is separated into waviness and roughness by a phase-correct Gaussian filter: the mean line at each point is a weighted average of the profile around it, with Gaussian weights whose width is set by the cut-off λc. Wavelengths equal to λc are passed at 50 %, much longer ones go into the mean line, much shorter ones into the roughness. ISO 4288 chooses λc from the spacing of the marks: for periodic profiles with mean spacing 0.13–0.4 mm, λc = 0.8 mm. The evaluation length is five cut-offs, with a run-up and run-down for the filter.</p>
      <h3>Parameters</h3><p>Ra, the arithmetical mean deviation of the roughness profile from its mean line, is the most widely used parameter. Rq, the root-mean-square deviation, weights large deviations more. Rz is the average of the peak-to-valley heights in the five sampling lengths; Rt is the largest peak-to-valley height over the whole evaluation length. Rz is typically 4–7 times Ra. The skewness Rsk shows whether the profile is dominated by peaks (positive) or valleys (negative). ISO 1302 groups Ra values into grades N1 (0.025 µm) to N12 (50 µm).</p>
      <h3>The turned surface</h3><p>A tool with nose radius r<sub>ε</sub> moving f per revolution leaves a train of circular arcs of radius r<sub>ε</sub> and pitch f. Their peak-to-valley height is f<sup>2</sup>/(8r<sub>ε</sub>) and their Ra is f<sup>2</sup>/(18√3 r<sub>ε</sub>). Real surfaces are rougher than this ideal because of material side flow, tearing, built-up edge, tool wear and vibration; the difference grows at small feeds and with worn tools.</p>`,
    procedure: ['Check the instrument on the reference specimen; its reading should agree with the certificate within 5 %.', 'Clean the specimen and set it in the V-block with its axis parallel to the traverse direction (trace across the feed marks).', 'Lower the stylus gently onto the surface and level the traverse so the trace stays within range.', 'Select the cut-off (from the expected mark spacing, ISO 4288) and an evaluation length of five cut-offs.', 'Start the traverse; keep the bench still while it runs.', 'Read Ra, Rq and Rz and print the profile.', 'Lift the stylus before moving the specimen; repeat at three positions round the specimen.'],
    precautions: ['Never let the stylus drop onto the surface or drag sideways; the diamond tip breaks easily.', 'Trace across the lay, not along it.', 'Choose the cut-off to suit the surface; a wrong cut-off gives a wrong Ra.', 'Avoid vibration and draughts during the traverse.', 'Clean oil and chips from the specimen first.'],
    applications: ['Quality control of machined, ground and lapped parts against drawing specifications.', 'Bearing, seal and cylinder-bore surfaces where roughness controls friction and leakage.', 'Process optimisation: choosing feed, speed and tool radius.', 'Research on wear, friction and fatigue (roughness as an input).'],
    errors: ['Wrong cut-off or evaluation length.', 'Stylus tip radius filtering narrow valleys.', 'Vibration during traverse.', 'Trace not perpendicular to the lay.', 'Variation of roughness over the surface (sampling).', 'Calibration of the vertical magnification.'],
    discussion: ['Why is the measured Ra larger than the ideal f²/(18√3 r)? Which mechanisms add roughness?', 'Change the cut-off and run again. Explain the change in Ra.', 'Why do Ra values for very different surfaces sometimes coincide? What extra parameter helps tell them apart?', 'How would you reduce the roughness of this turned surface without reducing productivity?'],
    refs: ['ISO 21920-2:2021, Geometrical product specifications (GPS). Surface texture: Profile. Part 2: Terms, definitions and surface texture parameters (replaces ISO 4287).', 'ISO 4288:1996, Rules and procedures for the assessment of surface texture.', 'ISO 16610-21:2011, Filtration. Linear profile filters: Gaussian filters.', 'IS 3073:1967, Assessment of surface roughness.', 'D. J. Whitehouse, Handbook of Surface and Nanometrology, 2nd ed., CRC Press, 2011.', 'G. Boothroyd, W. A. Knight, Fundamentals of Machining and Machine Tools, 3rd ed., Ch. 8.'],
    pre: [
      { q: 'Ra is', o: ['The highest peak', 'The arithmetical mean of the absolute deviations from the mean line', 'The peak-to-valley height', 'The waviness'], a: 1, why: 'Definition of Ra.' },
      { q: 'The cut-off λc separates', o: ['Form from size', 'Roughness from waviness', 'Peaks from valleys', 'Lay from direction'], a: 1, why: 'It is the filter wavelength.' },
      { q: 'A stylus trace should run', o: ['Along the feed marks', 'Across the feed marks (perpendicular to the lay)', 'Diagonally', 'Anywhere'], a: 1, why: 'Across the lay shows the roughness.' },
      { q: 'The evaluation length is usually', o: ['1 cut-off', '5 cut-offs', '10 cut-offs', '0.5 cut-off'], a: 1, why: 'ISO 4288 default.' },
      { q: 'Increasing the nose radius of a turning tool (same feed) makes the ideal roughness', o: ['Larger', 'Smaller', 'Unchanged', 'Zero'], a: 1, why: 'Rt = f²/(8r).' }
    ],
    post: [
      { q: 'Feed 0.2 mm/rev, nose radius 0.8 mm. Ideal Rt is', o: ['50 µm', '6.25 µm', '0.625 µm', '25 µm'], a: 1, why: '0.04/(6.4) mm = 6.25 µm.' },
      { q: 'Halving the feed changes the ideal Ra by a factor of', o: ['1/2', '1/4', '2', '1'], a: 1, why: 'Ra ∝ f².' },
      { q: 'Feed marks spaced 0.25 mm. The ISO 4288 cut-off is', o: ['0.08 mm', '0.25 mm', '0.8 mm', '2.5 mm'], a: 2, why: 'RSm 0.13–0.4 mm → λc = 0.8 mm.' },
      { q: 'Using a cut-off that is too short', o: ['Raises Ra', 'Lowers Ra, because part of the roughness is treated as waviness', 'Has no effect', 'Doubles Rz'], a: 1, why: 'Short cut-off removes long-wavelength roughness.' },
      { q: 'Ra = 1.4 µm corresponds to grade', o: ['N6', 'N7', 'N8', 'N9'], a: 1, why: 'N7 is up to 1.6 µm.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Ideal turned profile (arcs of the nose radius at the feed pitch) plus correlated random roughness and waviness; ISO 16610-21 Gaussian filter (α = 0.4697) applied to the sampled profile; Ra, Rq, Rz, Rt, Rsk computed per ISO 21920-2 over 5 sampling lengths. Ideal Rt = f²/8r reproduced exactly with zero random roughness.', 'ISO 21920-2; ISO 16610-21; ISO 4288; Whitehouse (2011)'];
  LAB.NOMEN[ID] = [['z', 'Profile height', 'µm'], ['z̄', 'Mean line (average of ordinates)', 'µm'], ['Ra', 'Arithmetical mean deviation', 'µm'], ['Rq', 'Root-mean-square deviation', 'µm'], ['Rz', 'Mean peak-to-valley height over 5 sampling lengths', 'µm'], ['Rt', 'Total height of the profile', 'µm'], ['R_p, R_v', 'Highest peak, deepest valley in a sampling length', 'µm'], ['Rsk', 'Skewness', '—'], ['λc', 'Cut-off wavelength', 'mm'], ['l_n', 'Evaluation length', 'mm'], ['f', 'Feed', 'mm/rev'], ['r_ε', 'Tool nose radius', 'mm']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Check the instrument on the reference specimen', note: 'Reading within 5 % of the certificate value', why: 'The instrument is verified before any specimen is measured.',
      draw(L, u, c) { c.txt('dRa', 'Ra  ' + U.f(3.02 * E(u), 3) + ' µm'); L.innerHTML = c.active ? tag(220, 110, 'reference Ra 3.0', 120, 60) : ''; } },
    { op: 1, d: 2.2, title: 'Seat the clean specimen in the V-blocks', note: 'Axis parallel to the traverse; trace will cross the feed marks', why: 'The specimen is placed once the instrument is checked.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(260, 260, 'across the lay', 280, 190) : ''; } },
    { op: 2, d: 2.4, title: 'Lower the stylus and level the traverse', note: 'Gently, with the lift lever', why: 'The stylus is lowered only after the specimen is seated.',
      draw(L, u, c) { c.set('head', 'transform', `translate(0 ${-30 * (1 - E(u))})`); L.innerHTML = ''; } },
    { op: 3, d: 2.0, title: s => 'Select the cut-off and evaluation length', note: (s, p) => `λc = ${p.lc} mm, l_n = ${U.f(5 * p.lc, 2)} mm`, why: 'Filter settings are chosen last, before the traverse.',
      draw(L, u, c) { L.innerHTML = c.active ? K.knob(170, 150, E(u), 'λc') : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'A needle that reads surfaces', lines: [
      ['A diamond stylus, two microns at the tip, is lowered onto the turned surface.', { s: 2 }],
      ['As it is drawn across the feed marks, its rise and fall is magnified thousands of times.', { r: [0, 0.4] }],
      ['The trace shows sharp ridges left by the tool, on top of a gentle waviness.', { r: [0.4, 1] }]],
      q: { q: 'Why trace across the feed marks?', o: ['It is faster', 'Along the marks the stylus would ride one ridge and miss the roughness', 'To avoid wear', 'The standard forbids it'], a: 1, why: 'Roughness is measured perpendicular to the lay.' } },
    { title: 'Separating roughness from waviness', lines: [
      ['A Gaussian filter draws a smooth mean line through the profile. The cut-off decides how smooth.', null],
      ['What is left above and below the mean line is the roughness.', null],
      ['If the cut-off is too short, the filter starts to follow the feed marks, and the roughness shrinks.', null]],
      q: { q: 'The feed marks are 0.15 mm apart. A sensible cut-off is', o: ['0.08 mm', '0.8 mm', '8 mm', '0.15 mm'], a: 1, why: 'Several marks per cut-off: ISO 4288 gives 0.8 mm for spacing 0.13–0.4 mm.' } },
    { title: 'Numbers from the profile', lines: [
      ['Ra is the average distance of the profile from its mean line. Rq is the root mean square.', null],
      ['Rz averages the peak-to-valley height of five sampling lengths.', null],
      ['A perfect round-nosed tool would leave arcs of height feed squared over eight times the nose radius. Real surfaces are rougher.', null]],
      q: { q: 'Doubling the feed makes the ideal roughness', o: ['Twice as large', 'Four times as large', 'Half', 'Unchanged'], a: 1, why: 'Height ∝ f².' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard to people; the diamond stylus is fragile and expensive.', 'Sharp edges on turned specimens.'],
    ppe: ['None beyond normal lab wear'],
    rules: ['Always lift the stylus before moving the specimen or the traverse unit.', 'Never touch the stylus tip.', 'Deburr specimens before measurement.', 'Keep the bench free of vibration during traverse.'],
    emerg: ['If the stylus is damaged, stop and report it; do not continue measuring.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Profilometer', 'Diamond stylus 2 µm/90°, 0.75 mN, skidless', 'Profile recording'], ['Reference specimen', 'Ra 3.0 µm, sinusoidal, certified', 'Instrument check'], ['Specimens', 'C45, turned at 0.08/0.15/0.25 mm/rev, r_ε 0.8 mm', 'Work'], ['V-block', 'Hardened, pair', 'Holds round specimens'], ['Comparison specimens', 'Rubert set (turned, ground, milled)', 'Visual/tactile comparison']], note: 'Skidded pickups are quicker to set but filter out waviness mechanically; skidless (datum) pickups are needed for waviness and form.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const f = Pk(r, [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), rn = Pk(r, [0.4, 0.8, 1.2, 1.6]), ans = f * f / (8 * rn) * 1000; return { title: 'Ideal peak-to-valley height', q: `A turning tool with nose radius ${rn} mm is fed at ${f} mm/rev. Find the ideal peak-to-valley height of the surface.`, ans, unit: 'µm', hints: ['Rt = f²/(8r).', '× 1000 for µm.'], sol: `Rt = ${f}²/(8 × ${rn}) = ${s(ans / 1000)} mm = <b>${s(ans)} µm</b>.` }; },
    r => { const Ra = R(r, 0.4, 3.2, 2), rn = Pk(r, [0.4, 0.8, 1.2]), ans = Math.sqrt(Ra / 1000 * 18 * Math.sqrt(3) * rn); return { title: 'Feed for a required finish', q: `What is the largest feed that gives an ideal Ra of ${Ra} µm with a ${rn} mm nose-radius tool?`, ans, unit: 'mm/rev', hints: ['Ra = f²/(18√3 r).', 'f = √(18√3 r Ra), Ra in mm.'], sol: `f = √(18√3 × ${rn} × ${Ra}×10⁻³) = <b>${s(ans)} mm/rev</b>.` }; },
    r => { const z = Array.from({ length: 8 }, () => R(r, -3, 3, 1)), m = U.mean(z), ans = U.mean(z.map(v => Math.abs(v - m))) || 0.1; return { title: 'Ra from ordinates', q: `Eight equally spaced ordinates of a roughness profile are ${z.join(', ')} µm. Find Ra.`, ans, unit: 'µm', hints: ['First find the mean z̄.', 'Ra = Σ|z − z̄|/n.'], sol: `z̄ = ${s(m, 3)} µm; Ra = Σ|z − z̄|/8 = <b>${s(ans, 3)} µm</b>.` }; }
  ];
})();
