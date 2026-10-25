/* Exp 05 — Calibration of a strain-gauge load cell (cantilever, Wheatstone bridge) with dead weights. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'loadcell';
  const Eb = 72.4e9, b = 0.025, hb = 0.008, Lg = 0.100, GF = 2.10, RG = 350, CAP = 20; // Al 2024-T351 beam, gauges 100 mm from load point
  const COND = { ok: { name: 'Load cell in good condition', nl: 0.0006, hy: 0.0004, zr: 0.0002, gain: 0.006 }, ovl: { name: 'Load cell once overloaded (yielded at the gauges)', nl: 0.0025, hy: 0.0035, zr: 0.0045, gain: 0.02 } };

  LAB.register({
    id: ID, no: 5, cat: 'cal', title: 'Calibration of a Strain-Gauge Load Cell', std: 'OIML R 60 / ASTM E74', short: 'A cantilever load cell with four strain gauges in a full Wheatstone bridge is loaded with dead weights up to 20 kg and unloaded. You get rated output, sensitivity, non-linearity, hysteresis and zero return, compare with the beam-theory output and weigh an unknown mass.', tags: 'load cell strain gauge wheatstone bridge full bridge cantilever rated output mV/V calibration dead weights hysteresis non-linearity creep zero return',
    aim: 'To calibrate a strain-gauge load cell with dead weights, to determine its rated output, sensitivity, non-linearity, hysteresis and zero return, and to compare the measured output with that predicted from beam theory and the bridge equation.',
    objectives: ['Explain how bending strain in a beam is converted into a bridge output by four strain gauges.', 'Apply loads in steps up and down and record the bridge output.', 'Fit a calibration line and express the output in mV/V at rated capacity.', 'Determine non-linearity, hysteresis and zero return in % of rated output.', 'Use the calibration to determine an unknown mass.'],
    apparatus: ['Cantilever load cell, aluminium alloy 2024-T351 beam, 25 mm wide × 8 mm deep; gauges 100 mm from the load point; capacity 20 kg', 'Four foil strain gauges, 350 Ω, gauge factor 2.10, two on the top face (tension) and two on the bottom (compression), wired as a full bridge', 'Stable DC excitation supply, 5 or 10 V', 'Digital voltmeter, 1 µV resolution', 'Slotted dead weights, 2 kg each, class M1, and a hanger (mass included in the first step)', 'Unknown test mass'],
    stdNote: 'OIML R 60 and ASTM E74 define load-cell calibration terms: rated output (mV/V at capacity), non-linearity and hysteresis in % of rated output, and zero return (creep recovery) after unloading.',
    params: [
      { id: 'vex', label: 'Bridge excitation', type: 'select', options: [['5', '5 V DC'], ['10', '10 V DC']], def: '10' },
      { id: 'arms', label: 'Active gauges in the bridge', type: 'select', options: [['4', 'Full bridge: 4 active gauges'], ['2', 'Half bridge: 2 active gauges (top and bottom), 2 dummy resistors']], def: '4' },
      { id: 'cond', label: 'Load cell', type: 'select', options: Object.entries(COND).map(([k, v]) => [k, v.name]), def: 'ok' }
    ],
    opSteps: ['Mount the load cell rigidly and hang the load hanger', 'Connect the excitation and the voltmeter to the bridge', 'Switch on and warm up for 15 minutes; note the zero output', 'Exercise the cell: load to capacity and unload three times', 'Load in 2 kg steps to 20 kg, reading the output at each step', 'Unload in 2 kg steps, reading at each step; note the zero return', 'Hang the unknown mass and read the output'],
    svg(p) {
      let w = ''; for (let i = 0; i < 10; i++) w += `<rect id="m${i}" x="392" y="${222 - i * 9}" width="56" height="8" rx="1.5" class="mach2" style="display:none"/>`;
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(30, 60, 60, 160, 'mach', 'rx="3"')}${G.r(90, 96, 40, 40, 'mach2')}
        <path id="beam" d="M130 104 L420 104 L420 124 L130 124 Z" class="steel"/>
        <g id="gg"><rect x="200" y="98" width="22" height="6" class="spec"/><rect x="228" y="98" width="22" height="6" class="spec"/><rect x="200" y="124" width="22" height="6" class="spec"/><rect x="228" y="124" width="22" height="6" class="spec"/></g>
        ${G.t(196, 92, 'T1 T2 (tension)', 'm')}${G.t(196, 144, 'C1 C2 (compression)', 'm')}
        <g id="hang"><line id="hk" x1="420" y1="124" x2="420" y2="230" class="ln" stroke-width="2"/>${G.r(388, 230, 64, 6, 'steelD')}${w}<rect id="unk" x="398" y="200" width="44" height="30" rx="3" class="acc" style="display:none"/></g>
        ${K.dimH(225, 420, 76, 'L = 100 mm')}
        <path id="wires" d="M236 98 C 240 40, 300 30, 360 40" fill="none" stroke="var(--accent)" stroke-width="2" style="display:none"/>
        <g transform="translate(360,18)">${G.r(0, 0, 184, 58, 'disp', 'rx="4"')}${G.t(8, 14, 'BRIDGE OUTPUT', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '--.--- mV', 'big', 'id="dV"')}</g>
        <g transform="translate(20,236)">${G.r(0, 0, 150, 52, 'disp', 'rx="4"')}${G.t(8, 14, 'LOAD ON HANGER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '0 kg', 'big', 'id="dL"')}</g>
        <g transform="translate(180,236)">${G.r(0, 0, 120, 52, 'disp', 'rx="4"')}${G.t(8, 14, 'EXCITATION', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '0.00 V', 'big', 'id="dE"')}</g>
        <g transform="translate(470,200)">${[['T1', 0, 0], ['C1', 40, 0], ['C2', 0, 40], ['T2', 40, 40]].map(a => `<text x="${a[1] + 2}" y="${a[2] + 24}" class="m">${a[0]}</text>`).join('')}<path d="M20 0 L60 20 L20 40 L-20 20 Z" fill="none" class="ln" stroke="var(--ink)" stroke-width="1.2" transform="translate(10 18)"/></g>`, 'Cantilever load cell with four strain gauges, load hanger and weights, bridge output meter');
    },
    anim(svg, f, sim, p) {
      if (!sim) { for (let i = 0; i < 10; i++) G.show(svg, 'm' + i, false); G.show(svg, 'unk', false); G.show(svg, 'wires', false); return; }
      G.show(svg, 'wires', true); G.txt(svg, 'dE', U.f(sim.Vex, 2) + ' V');
      const n = sim.seq.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), s = sim.seq[k];
      for (let i = 0; i < 10; i++) G.show(svg, 'm' + i, !s.unk && i < s.kg / 2); G.show(svg, 'unk', !!s.unk);
      const d = (s.unk ? sim.mU : s.kg) / CAP * 8; G.set(svg, 'beam', 'd', `M130 104 Q 300 ${104 + d * 0.4} 420 ${104 + d} L420 ${124 + d} Q 300 ${124 + d * 0.4} 130 124 Z`); G.set(svg, 'hang', 'transform', `translate(0 ${d})`);
      G.txt(svg, 'dL', s.unk ? 'unknown' : s.kg + ' kg'); G.txt(svg, 'dV', U.f(s.V, 3) + ' mV');
    },
    liveView(el, f, sim, p, api) {
      const n = sim.seq.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)); const done = sim.seq.slice(0, k + 1).filter(s => !s.unk);
      api.title('Bridge output against load'); api.sub(`${k + 1} of ${n} readings`);
      G.profileView(el, { xlabel: 'Applied mass (kg)', ylabel: 'Bridge output (mV)', series: [{ name: 'loading', x: done.filter(s => s.dir >= 0).map(s => s.kg), y: done.filter(s => s.dir >= 0).map(s => s.V), type: 'linepts', color: 's1' }, { name: 'unloading', x: done.filter(s => s.dir < 0).map(s => s.kg), y: done.filter(s => s.dir < 0).map(s => s.V), type: 'linepts', color: 's2', dash: true }], xmin: 0, xmax: 20, ymin: 0, ymax: sim.truth.VFS * 1.1 }, 210);
    },
    simulate(p, r) {
      const C = COND[p.cond], Vex = U.q(+p.vex * (1 + 0.002 * U.gauss(r)), 0.001), N = +p.arms, g = 9.7826;
      const eps = m => 6 * m * g * Lg / (Eb * b * hb * hb); // strain at the gauges
      const k0 = Vex * GF * N / 4 * (1 + C.gain * U.gauss(r)) * (1 + 0.012 * U.gauss(r)); // V per unit strain, with gauge-placement scatter
      const z = 0.08 * U.gauss(r) * Vex / 10, FS0 = k0 * eps(CAP) * 1000; // mV
      const nl = C.nl * FS0 * (0.6 + 0.4 * r()), hy = C.hy * FS0 * (0.7 + 0.3 * r());
      const V = (m, dir) => z + k0 * eps(m) * 1000 - nl * 4 * (m / CAP) * (1 - m / CAP) + (dir < 0 ? hy * Math.sin(Math.PI * m / CAP) : 0);
      const seq = []; for (let kg = 0; kg <= CAP; kg += 2) seq.push({ kg, dir: kg ? 1 : 0 }); for (let kg = CAP - 2; kg >= 0; kg -= 2) seq.push({ kg, dir: -1 });
      seq.forEach((s, i) => { s.V = U.q(V(s.kg, s.dir) + (i === seq.length - 1 ? C.zr * FS0 * (0.6 + 0.4 * r()) : 0) + 0.0012 * U.gauss(r), 0.001); });
      const mU = U.q(5 + 12 * r(), 0.001); seq.push({ kg: mU, unk: true, dir: 0, V: U.q(V(mU, 1) + 0.0012 * U.gauss(r), 0.001) });
      const nUp = CAP / 2 + 1, xs = seq.slice(0, nUp).map(s => s.kg), up = seq.slice(0, nUp).map(s => s.V);
      const dn = xs.map((kg, i) => i === nUp - 1 || i === 0 ? up[i] : seq.slice(nUp, 2 * nUp - 1).find(s => s.kg === kg).V);
      const zeroRet = seq[2 * nUp - 2].V - up[0];
      // statistics relative to the zero-corrected output; terminal-based full scale
      const upZ = up.map(v => v - up[0]), dnZ = dn.map(v => v - up[0]); const st = M.calStats(xs, upZ, dnZ, upZ[nUp - 1]);
      const RO = upZ[nUp - 1] / Vex; // mV/V
      const VU = seq[seq.length - 1].V, mEst = (VU - up[0] - st.fit.c) / st.fit.m;
      const T = { RO, sens: st.fit.m, st, VFS: up[nUp - 1], FS: upZ[nUp - 1], zeroRet, zrPct: zeroRet / upZ[nUp - 1] * 100, epsFS: eps(CAP), ROth: GF * N / 4 * eps(CAP) * 1000, VU, mU, mEst, xs, up, dn, z0: up[0] };
      return {
        seq, Vex, mU, truth: T, dur: 13,
        readout(f) { const n = seq.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), s = seq[k]; return [['Reading', `${k + 1}/${n}`, ''], ['Load', s.unk ? 'unknown' : s.kg, s.unk ? '' : 'kg'], ['Output', U.f(s.V, 3), 'mV'], ['Excitation', U.f(Vex, 3), 'V'], ['Direction', s.unk ? '—' : s.dir > 0 ? 'up' : s.dir < 0 ? 'down' : 'zero', '']]; },
        plot: { title: 'Load cell calibration', xlabel: 'Applied mass (kg)', ylabel: 'Bridge output (mV)', series: [{ name: 'loading', x: xs, y: up, type: 'linepts', color: 's1' }, { name: 'unloading', x: xs.slice().reverse(), y: dn.slice().reverse(), type: 'linepts', color: 's2', dash: true }], caption: 'Bridge output against applied mass, loading and unloading' },
        plots: [{ xlabel: 'Applied mass (kg)', ylabel: 'Deviation from least-squares line (% of rated output)', series: [{ name: 'loading', x: xs, y: upZ.map((v, i) => (v - (st.fit.c + st.fit.m * xs[i])) / T.FS * 100), type: 'linepts', color: 's1' }, { name: 'unloading', x: xs, y: dnZ.map((v, i) => (v - (st.fit.c + st.fit.m * xs[i])) / T.FS * 100), type: 'linepts', color: 's2', dash: true }], hlines: [{ y: 0, color: 'muted' }], yzero: false, caption: 'Deviation from the calibration line, showing non-linearity and hysteresis' }],
        specimen: [['Load cell', COND[p.cond].name, ''], ['Rated capacity', CAP, 'kg'], ['Beam: Al 2024-T351, E', '72.4', 'GPa'], ['Beam width b × depth h', '25 × 8', 'mm'], ['Load point to gauge centre L', '100', 'mm'], ['Gauges', `350 Ω, GF ${GF}`, ''], ['Bridge', N === 4 ? 'full, 4 active gauges' : 'half, 2 active gauges + 2 dummy resistors', ''], ['Excitation (measured)', U.f(Vex, 3), 'V'], ['Local gravity', '9.7826', 'm/s²'], ['Voltmeter resolution', '0.001', 'mV']],
        obs: [{ title: 'Table 1. Bridge output (mV)', cols: ['Mass (kg)', 'Loading', 'Unloading'], rows: xs.map((kg, i) => [kg, U.f(up[i], 3), i === 0 ? U.f(seq[2 * nUp - 2].V, 3) : U.f(dn[i], 3)]), note: 'The unloading reading at 0 kg is the zero return after the full cycle.' }, { title: 'Table 2. Unknown mass', cols: ['Item', 'Output (mV)'], textCols: [0], rows: [['Unknown mass on the hanger', U.f(VU, 3)]] }],
        truth: T
      };
    },
    expHint: 'Subtract the initial zero reading from every output before fitting. Rated output = zero-corrected output at capacity ÷ excitation voltage (mV/V). Percentages are of the zero-corrected output at capacity.',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'ro', label: 'Rated output at 20 kg (zero-corrected output / excitation)', unit: 'mV/V', truth: T.RO, abs: 0.002, fmt: v => U.f(v, 4) },
      { key: 's', label: 'Sensitivity: least-squares slope of zero-corrected output against mass', unit: 'mV/kg', truth: T.sens, tol: 0.005, fmt: v => U.f(v, 4) },
      { key: 'nl', label: 'Non-linearity: largest deviation of the mean (up/down) output from the line, % of rated output', unit: '%', truth: T.st.linFS, abs: 0.03, fmt: v => U.f(v, 3) },
      { key: 'hy', label: 'Hysteresis: largest |unloading − loading|, % of rated output', unit: '%', truth: T.st.hysFS, abs: 0.03, fmt: v => U.f(v, 3) },
      { key: 'zr', label: 'Zero return after unloading, % of rated output', unit: '%', truth: T.zrPct, abs: 0.02, fmt: v => U.f(v, 3) },
      { key: 'eps', label: 'Bending strain at the gauges at capacity, ε = 6WL/(Ebh²)', unit: 'µε', truth: T.epsFS * 1e6, tol: 0.01, fmt: v => U.f(v, 1) },
      { key: 'roth', label: `Theoretical rated output, (N/4)·GF·ε with N = ${p.arms} active gauges`, unit: 'mV/V', truth: T.ROth, tol: 0.01, fmt: v => U.f(v, 4) },
      { key: 'mu', label: 'Unknown mass from the calibration line', unit: 'kg', truth: T.mEst, abs: 0.02, fmt: v => U.f(v, 3) }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Rated output vs beam theory', unit: '%', value: (T.RO / T.ROth - 1) * 100, lo: -3, hi: 3, src: 'Gauge placement and GF tolerance ±3 %', fmt: v => U.f(v, 2) }, { label: 'Non-linearity', unit: '% RO', value: T.st.linFS, lo: 0, hi: 0.05, src: 'OIML R 60 class C3 / typical data sheet ≤ 0.05 %', fmt: v => U.f(v, 3) }, { label: 'Hysteresis', unit: '% RO', value: T.st.hysFS, lo: 0, hi: 0.05, src: 'Typical data sheet ≤ 0.05 %', fmt: v => U.f(v, 3) }, { label: 'Zero return', unit: '% RO', value: T.zrPct, lo: -0.03, hi: 0.03, src: 'Typical ≤ 0.03 %', fmt: v => U.f(v, 3) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Calibration equation</h4><span class="eyebrow">use for weighing</span></div><p style="font-size:.95rem">m = (V − V₀ − ${U.f(T.st.fit.c, 4)}) / ${U.f(T.sens, 4)} kg, with V₀ = ${U.f(T.z0, 3)} mV at no load and V in mV.</p><p class="muted" style="font-size:.84rem">Unknown mass: ${U.f(T.mEst, 3)} kg (the mass actually hung was ${U.f(T.mU, 3)} kg). ${p.arms == 2 ? 'With only two active gauges the bridge output is half that of the full bridge, and the dummy resistors do not compensate the temperature change of the active gauges as well; a full bridge is used in every commercial load cell.' : 'In the full bridge the two tension gauges sit in opposite arms and the two compression gauges in the other pair, so all four signals add, while temperature changes of the gauges, equal in all four arms, cancel.'} ${p.cond === 'ovl' ? 'The overloaded cell has yielded locally under the gauges: its hysteresis and zero return are many times the specification, and it should be withdrawn.' : ''}</p></div>`; },
    sample(sim, p) { const T = sim.truth; return `<div class="eq">Zero-corrected output at 20 kg = ${U.f(T.VFS, 3)} − ${U.f(T.z0, 3)} = ${U.f(T.FS, 3)} mV; rated output = ${U.f(T.FS, 3)}/${U.f(sim.Vex, 3)} = <b>${U.f(T.RO, 4)} mV/V</b></div><div class="eq">ε = 6WL/(Ebh²) = 6 × 20 × 9.7826 × 0.100/(72.4×10⁹ × 0.025 × 0.008²) = <b>${U.f(T.epsFS * 1e6, 1)} µε</b></div><div class="eq">Theoretical rated output = (${p.arms}/4) × ${GF} × ${U.f(T.epsFS * 1e6, 1)}×10⁻⁶ × 1000 = <b>${U.f(T.ROth, 4)} mV/V</b></div><div class="eq">Largest hysteresis ${U.f(T.st.hysAbs * 1000, 1)} µV = ${U.f(T.st.hysFS, 3)} % RO; non-linearity ${U.f(T.st.linAbs * 1000, 1)} µV = ${U.f(T.st.linFS, 3)} % RO</div><div class="eq">Unknown: m = (${U.f(T.VU, 3)} − ${U.f(T.z0, 3)} − ${U.f(T.st.fit.c, 4)})/${U.f(T.sens, 4)} = <b>${U.f(T.mEst, 3)} kg</b></div>`; },
    uncert(sim) { const T = sim.truth; const uV = M.rss(M.uRes(0.001), 0.0012); return [{ q: 'Single output reading', expr: '√[(0.001/√12)² + s_noise²]', val: T.FS, u: uV, unit: 'mV' }, { q: 'Rated output', expr: '√[(u_V/V_FS)² + (u_ex/V_ex)²] × RO, u_ex = 0.05 %', val: T.RO, u: T.RO * M.rss(uV * Math.SQRT2 / T.FS, 0.0005), unit: 'mV/V' }, { q: 'Unknown mass', expr: '√[(u_V/S)² + (m·u_S/S)² + (m·5×10⁻⁵)²] (weights class M1)', val: T.mEst, u: M.rss(uV * Math.SQRT2 / T.sens, T.mEst * 0.0003, T.mEst * 5e-5), unit: 'kg' }]; },
    conclude(sim, p) { const T = sim.truth; return `The 20 kg cantilever load cell, in a ${p.arms == 4 ? 'full' : 'half'} bridge excited at ${p.vex} V, gave a rated output of ${U.f(T.RO, 4)} mV/V against ${U.f(T.ROth, 4)} mV/V predicted from beam theory and the gauge factor (${U.f((T.RO / T.ROth - 1) * 100, 1)} % difference). Sensitivity was ${U.f(T.sens, 4)} mV/kg, non-linearity ${U.f(T.st.linFS, 3)} %, hysteresis ${U.f(T.st.hysFS, 3)} % and zero return ${U.f(T.zrPct, 3)} % of rated output. The unknown mass was found to be ${U.f(T.mEst, 3)} kg.`; },
    summary: 'A load cell converts force into an electrical signal through the strain of an elastic element. In a cantilever load cell the load bends a beam; strain gauges bonded on the top and bottom faces near the root see equal tensile and compressive strains ε = 6WL/(Ebh²). Wired as a full Wheatstone bridge with tension and compression gauges in alternate arms, the four signals add, giving an output V_o = V_ex·GF·ε, while temperature effects common to all gauges cancel. The cell is calibrated by loading with dead weights in steps to capacity and back: the output at capacity per volt of excitation is the rated output (mV/V), and the deviations from the least-squares line give non-linearity and hysteresis.',
    formulas: [['Bending strain at the gauges', 'ε = M/(EZ) = 6WL/(E b h²)'], ['Gauge factor', 'GF = (ΔR/R)/ε'], ['Bridge output, N active gauges', 'V_o = V_ex · (N/4) · GF · ε'], ['Rated output', 'RO = V_o(capacity) / V_ex  (mV/V)'], ['Non-linearity, hysteresis', '% of rated output'], ['Calibration equation', 'm = (V − V₀ − a)/S']],
    theory: `<h3>The elastic element</h3><p>A load cell measures force by measuring the small elastic strain it produces in a carefully shaped metal element. In a cantilever cell the load W at the free end produces a bending moment M = WL at a section a distance L from the load. The surface stress there is σ = M/Z = 6WL/(bh<sup>2</sup>) for a rectangular section, tension on the top face and compression on the bottom, and the strain is ε = σ/E. The element is designed so that the strain at capacity is about 1000 µε (0.1 %), well inside the elastic range.</p>
      <h3>Strain gauges</h3><p>A foil strain gauge is a grid of thin metal foil on a polymer backing, bonded to the surface. When the surface stretches, the grid lengthens and narrows and its resistance rises: ΔR/R = GF·ε, where the gauge factor GF is about 2.1 for constantan foil. At 1000 µε a 350 Ω gauge changes by only 0.74 Ω, so a bridge circuit is needed to measure it.</p>
      <h3>The Wheatstone bridge</h3><p>Four resistances form a bridge excited by a DC voltage. When balanced, the output across the other diagonal is zero. For small changes the output is V<sub>o</sub> = (V<sub>ex</sub>/4)(ΔR<sub>1</sub>/R − ΔR<sub>2</sub>/R + ΔR<sub>3</sub>/R − ΔR<sub>4</sub>/R): changes in opposite arms add and in adjacent arms subtract. Placing the two tension gauges in arms 1 and 3 and the two compression gauges in arms 2 and 4 makes all four add: V<sub>o</sub> = V<sub>ex</sub>·GF·ε. A temperature change that alters all four gauges equally cancels. With only two active gauges the output halves.</p>
      <h3>Calibration with dead weights</h3><p>The cell is exercised by loading to capacity a few times, which settles the gauge adhesive and the clamping. Weights are then added in equal steps to capacity and removed in the same steps. The output at capacity, less the zero, divided by the excitation voltage, is the rated output in mV/V, the figure used to match a cell to its indicator. A least-squares line gives the sensitivity; the largest deviation of the readings from it is the non-linearity, the largest difference between loading and unloading is the hysteresis, and the change in zero after the cycle is the zero return. All are expressed as percentages of the rated output.</p>
      <h3>Using the calibration</h3><p>Once calibrated, an unknown mass is found from its output with the calibration equation. Because mass is weighed through its weight mg, the cell responds to local gravity; it is calibrated in place, or corrected, for the gravity of the site.</p>`,
    procedure: ['Clamp the load cell rigidly at its fixed end and hang the empty hanger at the load point.', 'Connect the excitation supply and the voltmeter to the bridge; check the excitation voltage.', 'Switch on and let the bridge warm up for 15 minutes; record the zero output.', 'Load to capacity and unload three times to exercise the cell.', 'Add 2 kg weights one at a time, without shock, and record the output at each step up to 20 kg.', 'Remove the weights one at a time, recording the output; record the zero after the last weight is removed.', 'Hang the unknown mass and record the output.', 'Fit the calibration line and calculate rated output, non-linearity, hysteresis and zero return.'],
    precautions: ['Never exceed the rated capacity; overload yields the beam at the gauges and ruins the cell.', 'Place weights gently; shock loads overshoot the capacity.', 'Keep the load line vertical and through the load point; side loads add bending in the wrong plane.', 'Read the output at the same time after each step; the cell creeps slightly with time.', 'Do not touch the beam or the gauge area during readings.'],
    applications: ['Weighing scales, platform and crane scales, batching and filling machines.', 'Force measurement in universal testing machines and fatigue rigs.', 'Thrust measurement of engines and propellers; cutting-force dynamometers.', 'Tension measurement in cables, belts and web-handling machines.'],
    errors: ['Non-linearity of the elastic element and the bridge.', 'Hysteresis and creep in the adhesive and the element.', 'Excitation voltage drift (output is proportional to it).', 'Temperature effects on zero and span not fully compensated.', 'Load not applied at the calibration point (eccentricity).', 'Mass of the hanger and local gravity.'],
    discussion: ['Why are the gauges placed in alternate arms of the bridge? What would happen if two tension gauges were placed in adjacent arms?', 'Compare your rated output with the theoretical value. What could explain the difference?', 'What does a large zero return after unloading tell you about the cell?', 'Why is load-cell output quoted in mV/V and not in mV?'],
    refs: ['OIML R 60:2017, Metrological regulation for load cells.', 'ASTM E74-18, Standard Practices for Calibration and Verification for Force-Measuring Instruments.', 'K. Hoffmann, An Introduction to Stress Analysis and Transducer Design using Strain Gauges, HBM, 2012.', 'J. W. Dally, W. F. Riley, Experimental Stress Analysis, 4th ed., College House, Ch. 9.', 'E. O. Doebelin, D. N. Manik, Measurement Systems, 6th ed., McGraw-Hill, Ch. 5.'],
    pre: [
      { q: 'In a load cell, force is measured through', o: ['The temperature of the element', 'The elastic strain of a metal element', 'The plastic deformation of a beam', 'Magnetic flux'], a: 1, why: 'Strain gauges sense the elastic strain.' },
      { q: 'The gauge factor relates', o: ['Voltage to current', 'Relative resistance change to strain', 'Strain to stress', 'Force to mass'], a: 1, why: 'GF = (ΔR/R)/ε.' },
      { q: 'In a cantilever, the bending stress at a section a distance L from the load W is', o: ['W/bh', '6WL/(bh²)', 'WL/(EI)', 'W/(Eb)'], a: 1, why: 'σ = M/Z, Z = bh²/6.' },
      { q: 'Load-cell output is usually specified in', o: ['mV', 'mV/V at rated capacity', 'V/N', 'Ω'], a: 1, why: 'Output is proportional to excitation, so per volt.' },
      { q: 'Why is the cell loaded to capacity a few times before calibration?', o: ['To warm the weights', 'To settle the adhesive and clamping, reducing hysteresis in the readings', 'To check the voltmeter', 'It is not necessary'], a: 1, why: 'Exercising removes first-cycle effects.' }
    ],
    post: [
      { q: 'A full bridge with GF = 2 and ε = 1000 µε gives at 10 V excitation', o: ['5 mV', '20 mV', '2 mV', '40 mV'], a: 1, why: 'V_o = 10 × 2 × 0.001 = 20 mV.' },
      { q: 'With two active gauges instead of four (same strain), the output', o: ['Doubles', 'Halves', 'Is unchanged', 'Becomes zero'], a: 1, why: 'Output ∝ number of active arms.' },
      { q: 'A cell gives 19.80 mV at 20 kg and 0.05 mV at zero, at 10 V. Its rated output is', o: ['1.980 mV/V', '1.975 mV/V', '19.75 mV/V', '0.1975 mV/V'], a: 1, why: '(19.80 − 0.05)/10 = 1.975 mV/V.' },
      { q: 'Equal temperature changes in all four gauges of a full bridge', o: ['Double the output', 'Cancel', 'Shift the zero by the full scale', 'Change the gauge factor'], a: 1, why: 'Adjacent-arm changes subtract.' },
      { q: 'After an overload the hysteresis rises from 0.02 % to 0.4 %. The likely cause is', o: ['Excitation drift', 'Local yielding of the element at the gauges', 'Wrong weights', 'Cable length'], a: 1, why: 'Plastic strain makes the element and adhesive behave inelastically.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Strain from beam theory 6WL/(Ebh²) with local gravity; bridge output (N/4)·GF·ε·V_ex; non-linearity, hysteresis and zero return of the size in OIML R 60 / commercial data sheets, larger for the overloaded cell; ±3 % rated-output scatter for gauge placement.', 'OIML R 60; Hoffmann (HBM); Dally & Riley Ch. 9'];
  LAB.NOMEN[ID] = [['W', 'Load (weight of the applied mass), mg', 'N'], ['L', 'Distance from load point to gauge centre', 'm'], ['b, h', 'Beam width and depth', 'm'], ['E', 'Elastic modulus of the beam', 'Pa'], ['ε', 'Strain at the gauges', 'µε'], ['GF', 'Gauge factor', '—'], ['N', 'Number of active gauges in the bridge', '—'], ['V_ex', 'Bridge excitation voltage', 'V'], ['V_o, V₀', 'Bridge output; output at zero load', 'mV'], ['RO', 'Rated output at capacity', 'mV/V'], ['S', 'Sensitivity', 'mV/kg']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Clamp the cell and hang the empty hanger', note: 'Load line vertical through the load point', why: 'The cell must be mounted before it is wired or loaded.',
      draw(L, u, c) { c.set('hang', 'transform', `translate(0 ${-40 * (1 - E(u))})`); L.innerHTML = c.active ? tag(440, 150, 'vertical', 422, 170) : ''; } },
    { op: 1, d: 2.4, title: 'Connect excitation and voltmeter to the bridge', note: s => `Excitation set to ${U.f(s.Vex, 2)} V`, why: 'Wiring is completed before power is applied.',
      draw(L, u, c) { c.show('wires', true); c.op('wires', E(u)); c.txt('dE', U.f(c.sim.Vex * E(u), 2) + ' V'); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: 'Warm up and record the zero', note: s => `Zero output ${U.f(s.truth.z0, 3)} mV`, why: 'The zero is recorded once the bridge has warmed up.',
      draw(L, u, c) { c.txt('dV', U.f(c.sim.truth.z0 + 0.02 * (1 - E(u)), 3) + ' mV'); L.innerHTML = c.active ? tag(380, 84, 'zero', 420, 60) : ''; } },
    { op: 3, d: 2.8, title: 'Exercise the cell: load to capacity three times', note: 'Settles the adhesive and the clamp before readings', why: 'Exercising comes after the zero check and before the calibration readings.',
      draw(L, u, c) { const k = Math.round(10 * Math.abs(Math.sin(u * 3 * Math.PI))); for (let i = 0; i < 10; i++) c.show('m' + i, c.active && i < k); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Weighing with strain', lines: [
      ['A load cell is a metal beam that bends a tiny amount under load. Four strain gauges glued near its root feel that bending.', { s: 0 }],
      ['The two on top are stretched and the two underneath are squeezed. Wired in a bridge, all four signals add together.', { s: 1 }],
      ['With no load, the bridge output is close to zero.', { s: 2 }]],
      q: { q: 'Why place the tension gauges in opposite arms of the bridge?', o: ['To save wire', 'So their signals add, while equal temperature changes cancel', 'To halve the output', 'So the bridge is unbalanced at zero'], a: 1, why: 'Opposite arms add; adjacent arms subtract.' } },
    { title: 'Up to capacity and back', lines: [
      ['Two-kilogram weights go on one at a time, gently, and the output is read after each.', { r: [0, 0.48] }],
      ['At twenty kilograms the output is about twenty millivolts. Then the weights come off one by one.', { r: [0.48, 0.92] }],
      ['Finally an unknown mass is hung, to be weighed with the calibration.', { r: [0.92, 1] }]],
      q: { q: 'The output at zero after unloading is higher than at the start. This is', o: ['Non-linearity', 'Zero return (creep recovery) error', 'Gauge factor error', 'Excitation error'], a: 1, why: 'A shift of zero after a load cycle is the zero return.' } },
    { title: 'Millivolts per volt', lines: [
      ['Subtract the zero, divide the output at capacity by the excitation, and you have the rated output in millivolts per volt.', null],
      ['Beam theory predicts it too: six W L over E b h squared gives the strain, and gauge factor times strain gives the output.', null],
      ['The calibration line then turns any output back into mass.', null]],
      q: { q: 'Excitation is raised from 5 V to 10 V. The rated output in mV/V', o: ['Doubles', 'Stays the same', 'Halves', 'Becomes zero'], a: 1, why: 'Output in mV doubles; per volt it is unchanged.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Weights falling on feet or hands.', 'Overloading the cell can make it fail suddenly.', 'Hanger swinging into the body.'],
    ppe: ['Safety shoes or closed shoes', 'Safety glasses'],
    rules: ['Add and remove weights gently, one at a time.', 'Never exceed 20 kg.', 'Keep hands clear under the hanger.', 'Stack weights with slots staggered so they cannot slide off.'],
    emerg: ['If the cell or clamp slips, step back and let the weights come to rest; do not try to catch them.', 'Report any crushed finger to the laboratory in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Load cell', 'Cantilever, Al 2024, 20 kg, ≈ 2 mV/V', 'Clamp at the root'], ['Strain gauges', 'Foil, 350 Ω, GF 2.10 ±0.5 %, self-temperature-compensated for Al', 'Full bridge'], ['Excitation supply', '5/10 V DC, ±0.05 %', 'Remote sensing ideal'], ['DVM', '1 µV resolution', 'Bridge output'], ['Dead weights', '2 kg × 10, class M1 (±100 mg)', 'Traceable masses'], ['Unknown mass', '5–17 kg', 'Weighed with the calibration']], note: 'Check the bridge with an ohmmeter (input and output resistance, insulation to case) before excitation.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const W = R(r, 50, 300, 0), Lm = Pk(r, [80, 100, 120]), bm = Pk(r, [20, 25, 30]), hm = Pk(r, [6, 8, 10]), E_ = Pk(r, [70, 200]), ans = 6 * W * Lm / 1000 / (E_ * 1e9 * bm / 1000 * (hm / 1000) ** 2) * 1e6; return { title: 'Strain in a cantilever', q: `A cantilever of width ${bm} mm, depth ${hm} mm and E = ${E_} GPa carries ${W} N at its free end. Find the surface strain at a section ${Lm} mm from the load.`, ans, unit: 'µε', hints: ['ε = 6WL/(Ebh²).', 'Work in N and m, then multiply by 10⁶.'], sol: `ε = 6 × ${W} × ${Lm / 1000}/(${E_}×10⁹ × ${bm / 1000} × ${hm / 1000}²) = <b>${s(ans)} µε</b>.` }; },
    r => { const N = Pk(r, [1, 2, 4]), GFv = Pk(r, [2.0, 2.1, 2.05]), e = R(r, 300, 1500, 0), Vx = Pk(r, [5, 10, 12]), ans = Vx * N / 4 * GFv * e * 1e-6 * 1000; return { title: 'Bridge output', q: `A Wheatstone bridge has ${N} active gauge${N > 1 ? 's' : ''} (GF = ${GFv}) arranged so their signals add. Each sees ${e} µε. The excitation is ${Vx} V. Find the bridge output.`, ans, unit: 'mV', hints: ['V_o = V_ex (N/4) GF ε.', 'ε in strain, not microstrain.'], sol: `V_o = ${Vx} × ${N}/4 × ${GFv} × ${e}×10⁻⁶ = <b>${s(ans)} mV</b>.` }; },
    r => { const RO = R(r, 1.8, 3.0, 3), cap = Pk(r, [10, 20, 50, 100]), Vx = Pk(r, [5, 10]), Vo = R(r, 0.2, 0.9, 2) * RO * Vx, ans = Vo / (RO * Vx) * cap; return { title: 'Weighing with a load cell', q: `A ${cap} kg load cell has a rated output of ${RO} mV/V and is excited at ${Vx} V. Its zero-corrected output is ${s(Vo, 4)} mV. Assuming a linear cell, what mass is on it?`, ans, unit: 'kg', hints: ['Full-scale output = RO × V_ex.', 'm = capacity × V_o/V_FS.'], sol: `V_FS = ${RO} × ${Vx} = ${s(RO * Vx)} mV; m = ${cap} × ${s(Vo, 4)}/${s(RO * Vx)} = <b>${s(ans)} kg</b>.` }; }
  ];
})();
