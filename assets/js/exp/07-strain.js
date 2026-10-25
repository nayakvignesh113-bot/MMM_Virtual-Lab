/* Exp 07 — Young's modulus and Poisson's ratio of a cantilever using strain gauges; quarter, half and full bridges. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'strain';
  const b = 0.030, h = 0.004, Lg = 0.250, GFa = 2.12, ASTC = 10.8; // beam width, depth, load point to gauge centre; actual gauge factor; gauge STC (steel)
  const MAT = { ms: P.MAT.ms, al6061: P.MAT.al6061, brass: P.MAT.brass };
  const BR = { q: { name: 'Quarter bridge: axial gauge G1 only (internal completion)', k: () => 1, therm: true }, h: { name: 'Half bridge: G1 (top) and G2 (bottom) in adjacent arms', k: () => 2, therm: false }, f: { name: 'Full bridge: G1, G2 axial and G3, G4 transverse (Poisson bridge)', k: nu => 2 * (1 + nu), therm: false } };

  LAB.register({
    id: ID, no: 7, cat: 'strain', title: 'Young’s Modulus and Poisson’s Ratio using Strain Gauges', std: 'ASTM E251 / ASTM E132 (principle)', short: 'A cantilever is loaded with weights. Axial and transverse strain gauges are read on a strain indicator in quarter, half or full bridge. You correct for gauge factor and bridge factor, find E and ν, and see temperature drift cancel in the half bridge.', tags: 'strain gauge gauge factor wheatstone bridge quarter half full poisson ratio young modulus cantilever strain indicator temperature compensation microstrain',
    aim: 'To determine the Young’s modulus and Poisson’s ratio of a beam material from strain-gauge readings on a loaded cantilever, and to compare quarter-, half- and full-bridge arrangements.',
    objectives: ['Calculate the bending stress at the gauge location of a cantilever.', 'Convert strain-indicator readings to true strain, correcting for gauge factor setting and bridge factor.', 'Determine E from the slope of stress against axial strain and ν from the ratio of transverse to axial strain.', 'Explain how half and full bridges multiply the output and compensate temperature.', 'Predict the bridge output voltage for a given strain and excitation.'],
    apparatus: ['Cantilever beam 30 mm wide × 4 mm deep, clamped; load hanger 250 mm from the gauge centre', 'Foil strain gauges, 120 Ω, gauge factor 2.12 (lot value), self-temperature-compensated for steel: G1 axial top, G2 axial bottom, G3 transverse top, G4 transverse bottom', 'Strain indicator with bridge completion, gauge-factor dial, 2.5 V excitation, resolution 1 µε', 'Slotted weights 0.5 kg × 6 and hanger', 'Vernier caliper and steel rule for the beam dimensions'],
    stdNote: 'ASTM E251 covers the performance of bonded resistance strain gauges (gauge factor, transverse sensitivity, temperature effects). Young’s modulus by static strain measurement follows the principle of ASTM E111.',
    params: [
      { id: 'mat', label: 'Beam material', type: 'select', options: Object.entries(MAT).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'br', label: 'Bridge for the axial channel', type: 'select', options: Object.entries(BR).map(([k, v]) => [k, v.name]), def: 'q' },
      { id: 'gfs', label: 'Gauge factor dial on the indicator', type: 'select', options: [['act', 'Set to the gauge factor of the lot (2.12)'], ['def', 'Left at 2.00']], def: 'def' }
    ],
    opSteps: ['Measure the beam width and depth and the distance from the load point to the gauges', 'Connect the gauges to the strain indicator in the chosen bridge', 'Set the gauge factor dial and balance the bridge to zero with the hanger on', 'Add weights in 0.5 kg steps, reading the axial and transverse channels', 'Remove the weights and read the zero again', 'Switch off and disconnect'],
    svg(p) {
      let w = ''; for (let i = 0; i < 6; i++) w += `<rect id="w${i}" x="450" y="${220 - i * 9}" width="50" height="8" rx="1.5" class="mach2" style="display:none"/>`;
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(20, 60, 70, 160, 'mach', 'rx="3"')}${G.r(90, 100, 30, 40, 'mach2')}
        <path id="beam" d="M120 112 L478 112 L478 124 L120 124 Z" class="steel"/>
        <g id="gs"><rect x="210" y="106" width="30" height="6" class="spec"/><rect x="210" y="124" width="30" height="6" class="spec"/><rect x="248" y="106" width="10" height="6" class="acc"/><rect x="248" y="124" width="10" height="6" class="acc"/></g>
        ${G.t(196, 98, 'G1 axial   G3 transverse', 'm')}${G.t(196, 146, 'G2 axial   G4 transverse', 'm')}
        <g id="hang"><line x1="475" y1="124" x2="475" y2="228" class="ln" stroke-width="2"/>${G.r(446, 228, 58, 6, 'steelD')}${w}</g>
        ${K.dimH(225, 475, 84, 'L = 250 mm')}
        <path id="wires" d="M226 106 C 220 50, 300 40, 330 40" fill="none" stroke="var(--accent)" stroke-width="2" style="display:none"/>
        <g transform="translate(330,14)">${G.r(0, 0, 214, 64, 'disp', 'rx="4"')}${G.t(8, 14, 'STRAIN INDICATOR', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 36, 'CH1 ---- µε', 'big', 'id="d1" style="font-size:12px"')}${G.t(8, 56, 'CH2 ---- µε', 'big', 'id="d2" style="font-size:12px"')}${G.t(150, 14, 'GF 2.00', 'm', 'id="dgf" style="fill:var(--panel-ink);font-size:8px"')}</g>
        <g transform="translate(20,236)">${G.r(0, 0, 150, 52, 'disp', 'rx="4"')}${G.t(8, 14, 'LOAD', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '0.0 kg', 'big', 'id="dL"')}</g>
        <g transform="translate(190,236)">${G.r(0, 0, 150, 52, 'disp', 'rx="4"')}${G.t(8, 14, 'ROOM TEMPERATURE', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '--.- °C', 'big', 'id="dT"')}</g>`, 'Cantilever with axial and transverse strain gauges, load hanger and strain indicator');
    },
    anim(svg, f, sim, p) {
      G.txt(svg, 'dgf', 'GF ' + (p.gfs === 'act' ? '2.12' : '2.00'));
      if (!sim) { for (let i = 0; i < 6; i++) G.show(svg, 'w' + i, false); G.show(svg, 'wires', false); return; }
      G.show(svg, 'wires', true);
      const n = sim.rows.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), rw = sim.rows[k];
      for (let i = 0; i < 6; i++) G.show(svg, 'w' + i, i < rw.kg / 0.5);
      const d = rw.kg / 3 * 10; G.set(svg, 'beam', 'd', `M120 112 Q 330 ${112 + d * 0.35} 478 ${112 + d} L478 ${124 + d} Q 330 ${124 + d * 0.35} 120 124 Z`); G.set(svg, 'hang', 'transform', `translate(0 ${d})`);
      G.txt(svg, 'dL', U.f(rw.kg, 1) + ' kg'); G.txt(svg, 'd1', `CH1 ${rw.ra} µε`); G.txt(svg, 'd2', `CH2 ${rw.rt} µε`); G.txt(svg, 'dT', U.f(rw.T, 1) + ' °C');
    },
    liveView(el, f, sim, p, api) {
      const n = sim.rows.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), done = sim.rows.slice(0, k + 1);
      api.title('Indicator readings against load'); api.sub(`${done.length} of ${n} readings`);
      G.profileView(el, { xlabel: 'Load (kg)', ylabel: 'Indicator reading (µε)', series: [{ name: 'CH1 axial (' + p.br + ')', x: done.map(r => r.kg), y: done.map(r => r.ra), type: 'linepts', color: 's1' }, { name: 'CH2 transverse G3 (quarter)', x: done.map(r => r.kg), y: done.map(r => r.rt), type: 'linepts', color: 's2' }], xmin: 0, xmax: 3, yzero: false }, 210);
    },
    simulate(p, r) {
      const Mt = MAT[p.mat], E = Mt.E * 1e9 * (1 + 0.012 * U.gauss(r)), nu = Mt.nu + 0.006 * U.gauss(r), g = 9.7826, GFs = p.gfs === 'act' ? 2.12 : 2.00;
      const bm = U.q(b * 1000 + 0.04 * U.gauss(r), 0.02), hm = U.q(h * 1000 + 0.02 * U.gauss(r), 0.01), Lm = U.q(Lg * 1000 + 0.6 * U.gauss(r), 0.5); // measured dimensions
      const bb = bm / 1000, hh = hm / 1000, LL = Lm / 1000; const Br = BR[p.br], kB = Br.k(nu), kT = 1; // bridge factor on axial channel
      const T0 = U.q(26 + 2 * r(), 0.1), dT = 1.2 + 0.8 * r(); const thermAp = (Mt.a - ASTC) * 1e-6; // apparent strain per °C of a quarter-bridge gauge
      const loads = [0, 0.5, 1, 1.5, 2, 2.5, 3, 0]; const rows = loads.map((kg, i) => { const W = kg * g, sig = 6 * W * LL / (bb * hh * hh), ea = sig / E, et = -nu * ea; const Tn = T0 + dT * i / (loads.length - 1); const app = thermAp * (Tn - T0);
        const ra = Math.round((kB * ea + (Br.therm ? app : 0)) * 1e6 * GFa / GFs + 1.2 * U.gauss(r)), rt = Math.round((et + app) * 1e6 * GFa / GFs + 1.2 * U.gauss(r)); return { kg, sig, ea, et, ra, rt, T: Tn }; });
      const up = rows.slice(0, 7); const fa = U.linfit(up.map(x => x.kg), up.map(x => x.ra)), ft = U.linfit(up.map(x => x.kg), up.map(x => x.rt));
      const corr = GFs / GFa; const sigFS = 6 * 3 * g * LL / (bb * hh * hh); const eaFS = up[6].ra * corr / kB; // true axial strain at 3 kg from the reading
      const slopeE = sigFS / 3 / (fa.m * corr / kB * 1e-6); // Pa
      const nuM = -ft.m / (fa.m / kB);
      const Vo = 5 * GFa * kB / 4 * (sigFS / E) * 1000; // mV with 5 V excitation (with true kB)
      const T = { E, nu, sigFS, eaFS, Em: slopeE, nuM, Vo, kB, corr, fa, ft, bm, hm, Lm, zero: rows[7].ra, GFs };
      return {
        rows, Mt, truth: T, dur: 11,
        readout(f) { const n = rows.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), x = rows[k]; return [['Load', U.f(x.kg, 1), 'kg'], ['CH1 axial', x.ra, 'µε'], ['CH2 transverse', x.rt, 'µε'], ['Room', U.f(x.T, 1), '°C'], ['GF dial', U.f(GFs, 2), '']]; },
        plot: { title: 'Indicator readings against load', xlabel: 'Load (kg)', ylabel: 'Indicator reading (µε)', series: [{ name: 'CH1 axial', x: up.map(x => x.kg), y: up.map(x => x.ra), type: 'linepts', color: 's1' }, { name: 'CH2 transverse', x: up.map(x => x.kg), y: up.map(x => x.rt), type: 'linepts', color: 's2' }], yzero: false, caption: 'Strain-indicator readings of the axial and transverse channels against load' },
        plots: [{ xlabel: 'True axial strain (µε)', ylabel: 'Bending stress at the gauge (MPa)', series: [{ name: 'measured', x: up.map(x => x.ra * corr / kB), y: up.map(x => x.sig / 1e6), type: 'linepts', color: 's1' }], caption: 'Stress against corrected axial strain; the slope is Young’s modulus' }],
        specimen: [['Beam material', Mt.name, ''], ['Width b (measured)', U.f(bm, 2), 'mm'], ['Depth h (measured)', U.f(hm, 2), 'mm'], ['Load point to gauge centre L', U.f(Lm, 1), 'mm'], ['Gauge factor of the lot', '2.12', ''], ['Gauge factor dial setting', U.f(GFs, 2), ''], ['Axial channel bridge', Br.name, ''], ['Transverse channel', 'quarter bridge, G3', ''], ['Gauges compensated for', 'steel, 10.8 × 10⁻⁶ /°C', ''], ['Local gravity', '9.7826', 'm/s²']],
        obs: [{ title: 'Table 1. Strain-indicator readings (µε)', cols: ['Load (kg)', 'CH1: axial channel', 'CH2: transverse G3', 'Room (°C)'], rows: rows.map((x, i) => [i === 7 ? '0 (after unloading)' : U.f(x.kg, 1), x.ra, x.rt, U.f(x.T, 1)]), note: 'Readings as displayed: the indicator assumes the gauge factor on its dial and a single active gauge. Correct them before use.' }],
        truth: T
      };
    },
    expHint: 'True strain = reading × (GF on the dial / GF of the gauge) / bridge factor. Bridge factor: quarter 1, half (top and bottom gauges) 2, full Poisson bridge 2(1 + ν). For the full bridge, use ν from the transverse channel first.',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'sig', label: 'Bending stress at the gauges at 3 kg, σ = 6WL/(bh²)', unit: 'MPa', truth: T.sigFS / 1e6, tol: 0.008, fmt: v => U.f(v, 2) },
      { key: 'ea', label: 'True axial strain at 3 kg (corrected for GF and bridge factor)', unit: 'µε', truth: T.eaFS, tol: 0.012, fmt: v => U.f(v, 1) },
      { key: 'nu', label: 'Poisson’s ratio ν = −ε_t/ε_a (ratio of slopes, both per gauge)', unit: '—', truth: T.nuM, abs: 0.012, fmt: v => U.f(v, 3) },
      { key: 'E', label: 'Young’s modulus from the slope of stress against true axial strain', unit: 'GPa', truth: T.Em / 1e9, tol: 0.015, fmt: v => U.f(v, 1) },
      { key: 'vo', label: `Bridge output at 3 kg with 5 V excitation in this ${p.br === 'q' ? 'quarter' : p.br === 'h' ? 'half' : 'full'} bridge, V_o = V_ex·k·GF·ε/4`, unit: 'mV', truth: 5 * 2.12 * T.kB / 4 * T.eaFS * 1e-6 * 1000, tol: 0.015, fmt: v => U.f(v, 3) },
      { key: 'z', label: 'Zero shift of the axial channel after unloading (reading)', unit: 'µε', truth: T.zero, abs: 0.5, fmt: v => U.f(v, 0) }]; },
    reference(sim) { const T = sim.truth, Mt = sim.Mt; return [{ label: `E of ${Mt.name}`, unit: 'GPa', value: T.Em / 1e9, lo: Mt.E * 0.97, hi: Mt.E * 1.03, src: 'ASM handbook value ±3 %', fmt: v => U.f(v, 1) }, { label: 'Poisson’s ratio', unit: '', value: T.nuM, lo: Mt.nu - 0.02, hi: Mt.nu + 0.02, src: 'Handbook ' + Mt.nu, fmt: v => U.f(v, 3) }]; },
    valExtra(el, sim, p) { const T = sim.truth, Mt = sim.Mt; const app = (Mt.a - ASTC); el.innerHTML = `<div class="panel"><div class="panel-h"><h4>What the corrections did</h4></div><p style="font-size:.9rem">Gauge-factor correction × ${U.f(T.corr, 4)}${p.gfs === 'def' ? ` (dial at 2.00 against 2.12 for the gauges: uncorrected readings are ${U.f((1 / T.corr - 1) * 100, 1)} % high)` : ''}; bridge factor ÷ ${U.f(T.kB, 3)}.</p><p class="muted" style="font-size:.84rem">The room warmed during the test. The gauges are compensated for steel (10.8 × 10⁻⁶ /°C); on ${Mt.name.toLowerCase()} (α = ${Mt.a} × 10⁻⁶ /°C) each gauge alone shows an apparent strain of about ${U.f(app * 2.12 / T.GFs, 1)} µε per °C. ${p.br === 'q' ? `In the quarter bridge this appears as the zero shift of ${T.zero} µε after unloading.` : `In the ${p.br === 'h' ? 'half' : 'full'} bridge the gauges in adjacent arms see the same temperature change and it cancels: the zero returns to ${T.zero} µε.`} The transverse channel is a quarter bridge and drifts in every case.</p></div>`; },
    sample(sim, p) { const T = sim.truth; return `<div class="eq">σ = 6WL/(bh²) = 6 × 3 × 9.7826 × ${U.f(T.Lm / 1000, 4)}/(${U.f(T.bm / 1000, 5)} × ${U.f(T.hm / 1000, 5)}²) = <b>${U.f(T.sigFS / 1e6, 2)} MPa</b></div><div class="eq">True axial strain at 3 kg = reading × (${U.f(T.GFs, 2)}/2.12)/${U.f(T.kB, 3)} = <b>${U.f(T.eaFS, 1)} µε</b></div><div class="eq">Slopes: axial ${U.f(T.fa.m, 2)} µε/kg (reading), transverse ${U.f(T.ft.m, 2)} µε/kg; ν = −${U.f(T.ft.m, 2)}/(${U.f(T.fa.m, 2)}/${U.f(T.kB, 3)}) = <b>${U.f(T.nuM, 3)}</b></div><div class="eq">E = Δσ/Δε = (${U.f(T.sigFS / 3 / 1e6, 3)} MPa/kg)/(${U.f(T.fa.m * T.corr / T.kB, 2)} µε/kg) = <b>${U.f(T.Em / 1e9, 1)} GPa</b></div>`; },
    uncert(sim) { const T = sim.truth; const ur = M.rss(0.02 / T.bm, 2 * 0.01 / T.hm, 0.5 / T.Lm); return [{ q: 'Stress σ', expr: '√[(u_b/b)² + (2u_h/h)² + (u_L/L)²]: h enters squared', val: T.sigFS / 1e6, u: T.sigFS / 1e6 * ur, unit: 'MPa' }, { q: 'Corrected strain', expr: '√[(1/√12)² + 1.2² ]/ε + 0.5 % GF tolerance', val: T.eaFS, u: T.eaFS * M.rss(1.5 / (T.eaFS * T.kB), 0.005), unit: 'µε' }, { q: 'Young’s modulus', expr: '√[(u_σ/σ)² + (u_ε/ε)²]', val: T.Em / 1e9, u: T.Em / 1e9 * M.rss(ur, 1.5 / (T.eaFS * T.kB), 0.005), unit: 'GPa' }]; },
    conclude(sim, p) { const T = sim.truth, Mt = sim.Mt; return `At 3 kg the bending stress at the gauges was ${U.f(T.sigFS / 1e6, 1)} MPa and the true axial strain ${U.f(T.eaFS, 0)} µε, after correcting the indicator for the gauge factor (${U.f(T.GFs, 2)} set, 2.12 actual) and the bridge factor (${U.f(T.kB, 2)}). Young’s modulus of the ${Mt.name.toLowerCase()} was ${U.f(T.Em / 1e9, 1)} GPa (handbook ${Mt.E} GPa) and Poisson’s ratio ${U.f(T.nuM, 3)} (handbook ${Mt.nu}). ${p.br === 'q' ? `The quarter bridge drifted by ${T.zero} µε as the room warmed.` : 'The temperature drift cancelled in the ' + (p.br === 'h' ? 'half' : 'full') + ' bridge.'}`; },
    summary: 'A strain gauge changes its resistance in proportion to the strain of the surface it is bonded to: ΔR/R = GF·ε. In a Wheatstone bridge the output is proportional to the sum of the strains in opposite arms minus those in adjacent arms. A cantilever loaded at its end has a known surface stress σ = 6WL/(bh²) at the gauge section; plotting it against the measured axial strain gives Young’s modulus E, and the ratio of transverse to axial strain gives Poisson’s ratio ν. Strain indicators display strain assuming the gauge factor on their dial and one active gauge; readings must be corrected for the actual gauge factor and for the bridge factor (2 for a half bridge with top and bottom gauges, 2(1 + ν) for a full Poisson bridge). Adjacent-arm arrangements also cancel apparent strain from temperature changes.',
    formulas: [['Gauge factor', 'GF = (ΔR/R)/ε'], ['Bridge output', 'V_o/V_ex = (GF/4)(ε₁ − ε₂ + ε₃ − ε₄)'], ['Bending stress at the gauge', 'σ = 6WL/(bh²)'], ['Indicator reading', 'ε_ind = k · ε · GF_gauge/GF_dial'], ['Bridge factors k', 'quarter 1; half (top/bottom) 2; full Poisson 2(1 + ν)'], ['Young’s modulus', 'E = Δσ/Δε_a'], ['Poisson’s ratio', 'ν = −ε_t/ε_a']],
    theory: `<h3>Bonded resistance strain gauges</h3><p>A foil strain gauge is a fine grid of constantan foil on a polyimide backing, bonded to the surface with a thin adhesive. When the surface is strained, the grid lengthens or shortens with it and its resistance changes: ΔR/R = GF·ε. The gauge factor GF, about 2 for constantan, is measured by the manufacturer for each production lot and printed on the packet. Strains in engineering structures are small, typically a few hundred microstrain (µε, 10<sup>−6</sup>), so the resistance changes are a fraction of an ohm.</p>
      <h3>The Wheatstone bridge</h3><p>Four arms form a bridge; for small changes the output is V<sub>o</sub>/V<sub>ex</sub> = (GF/4)(ε<sub>1</sub> − ε<sub>2</sub> + ε<sub>3</sub> − ε<sub>4</sub>). In a quarter bridge one arm is the active gauge and the other three are fixed resistors inside the indicator. In a half bridge for bending, the top gauge (tension) and the bottom gauge (compression) are in adjacent arms: their strains have opposite signs, so the subtraction doubles the output. A full Poisson bridge adds two transverse gauges, giving 2(1 + ν) times the axial strain. Any effect that changes adjacent arms equally, such as a temperature change, cancels.</p>
      <h3>Temperature effects</h3><p>When temperature changes, a gauge on a free specimen still changes resistance, because the foil resistivity changes and because the specimen expands differently from the foil. Self-temperature-compensated gauges are made to cancel this on one material, usually steel or aluminium; on a different material an apparent strain of several µε per °C remains. In a quarter bridge this appears as drift; in half and full bridges the active gauges in adjacent arms see the same temperature and the drift cancels.</p>
      <h3>The cantilever test</h3><p>A load W hung at a distance L from the gauge section produces a bending moment WL there. The surface stress is σ = 6WL/(bh<sup>2</sup>) for a rectangular section b × h, tension on top and compression underneath. The axial gauges measure ε<sub>a</sub> = σ/E; the transverse gauges measure the lateral contraction ε<sub>t</sub> = −νε<sub>a</sub>. Loading in steps and plotting σ against the corrected ε<sub>a</sub> gives E as the slope; the ratio of the slopes of transverse and axial strain against load gives ν. Because the depth h enters squared, it must be measured carefully.</p>
      <h3>Correcting the indicator</h3><p>The strain indicator displays ε<sub>ind</sub> = (4/GF<sub>dial</sub>)(V<sub>o</sub>/V<sub>ex</sub>), the strain a single gauge of the dial gauge factor would need to produce that output. If the dial is not set to the gauge's own factor, every reading is scaled by GF<sub>gauge</sub>/GF<sub>dial</sub>; with more than one active gauge it is also multiplied by the bridge factor. True strain = ε<sub>ind</sub>·(GF<sub>dial</sub>/GF<sub>gauge</sub>)/k.</p>`,
    procedure: ['Measure the width and depth of the beam at the gauge section with a vernier caliper (several readings) and the distance from the load point to the gauge centre.', 'Connect the gauges to the strain indicator in the chosen bridge configuration; connect G3 to the second channel as a quarter bridge.', 'Set the gauge factor dial (ideally to the lot value on the gauge packet).', 'With the empty hanger in place, balance both channels to zero.', 'Add weights in 0.5 kg steps up to 3 kg, recording both channels at each step.', 'Remove all weights and record the zero again.', 'Correct the readings, plot σ against axial strain and calculate E and ν.'],
    precautions: ['Do not exceed the load that would yield the beam (keep σ below half the yield stress).', 'Add weights gently and let the beam stop oscillating before reading.', 'Avoid touching the beam or the gauges; body heat causes drift.', 'Shield the gauges from lamps and draughts.', 'Measure the beam depth carefully; its error is doubled in the stress.'],
    applications: ['Experimental stress analysis of machine parts, bridges, aircraft structures and pressure vessels.', 'Transducer design: load cells, pressure transducers, torque meters, dynamometers.', 'Measurement of elastic constants of new materials and composites.', 'Structural health monitoring and fatigue testing.'],
    errors: ['Gauge factor dial not matched to the gauge.', 'Misalignment of the gauge with the beam axis.', 'Error in the beam depth (doubled in stress) and load-point distance.', 'Temperature drift in quarter bridges.', 'Transverse sensitivity of the gauge.', 'Indicator resolution and noise.'],
    discussion: ['Why does the half bridge give twice the reading of the quarter bridge? Why does it not drift?', 'Your indicator was set to GF 2.00 but the gauges are 2.12. Which way were the raw readings wrong, and by how much?', 'Why is it important to measure the beam depth accurately, more than its width?', 'How would you arrange four gauges on a shaft to measure torque but not bending?'],
    refs: ['J. W. Dally, W. F. Riley, Experimental Stress Analysis, 4th ed., College House, 2005, Ch. 6–9.', 'K. Hoffmann, An Introduction to Stress Analysis and Transducer Design using Strain Gauges, HBM, 2012.', 'ASTM E251-20, Standard Test Methods for Performance Characteristics of Metallic Bonded Resistance Strain Gages.', 'Vishay Micro-Measurements, Tech Note TN-504: Strain Gage Thermal Output and Gage Factor Variation with Temperature.', 'T. G. Beckwith, R. D. Marangoni, J. H. Lienhard, Mechanical Measurements, 6th ed., Ch. 12.'],
    pre: [
      { q: 'The gauge factor of a constantan foil gauge is about', o: ['0.2', '2', '20', '200'], a: 1, why: 'GF ≈ 2.0–2.2 for constantan.' },
      { q: 'A strain of 500 µε is', o: ['0.5', '0.05 %', '5 %', '0.0005 %'], a: 1, why: '500 × 10⁻⁶ = 0.0005 = 0.05 %.' },
      { q: 'In a Wheatstone bridge, equal changes in two adjacent arms', o: ['Add', 'Cancel', 'Double', 'Reverse the supply'], a: 1, why: 'The output depends on ε₁ − ε₂ for adjacent arms.' },
      { q: 'Poisson’s ratio is', o: ['Axial strain / lateral strain', '−lateral strain / axial strain', 'Stress / strain', 'Shear / normal stress'], a: 1, why: 'ν = −ε_t/ε_a.' },
      { q: 'The bending stress in a rectangular cantilever section depends on depth h as', o: ['h', '1/h', '1/h²', 'h²'], a: 2, why: 'σ = 6WL/(bh²).' }
    ],
    post: [
      { q: 'The dial is set to GF 2.00 but the gauge has GF 2.10. The indicator reads 420 µε (quarter bridge). The true strain is', o: ['441 µε', '400 µε', '420 µε', '210 µε'], a: 1, why: '420 × 2.00/2.10 = 400 µε.' },
      { q: 'A half bridge with top and bottom gauges reads 800 µε (dial set correctly). The surface strain is', o: ['800 µε', '400 µε', '1600 µε', '200 µε'], a: 1, why: 'Bridge factor 2: 800/2 = 400 µε.' },
      { q: 'Axial strain 600 µε, transverse strain −174 µε. ν =', o: ['0.29', '3.45', '0.71', '0.17'], a: 0, why: '174/600 = 0.29.' },
      { q: 'σ rises by 15 MPa/kg and corrected strain by 72 µε/kg. E is', o: ['208 GPa', '20.8 GPa', '4.8 GPa', '1080 GPa'], a: 0, why: '15 × 10⁶/72 × 10⁻⁶ = 2.08 × 10¹¹ Pa.' },
      { q: 'Steel-compensated gauges on aluminium in a quarter bridge, room warms 2 °C. The zero', o: ['Stays at zero', 'Drifts by tens of µε', 'Drifts by thousands of µε', 'Becomes negative infinity'], a: 1, why: 'About (23 − 11) µε/°C × 2 ≈ 24 µε of apparent strain.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Stress from beam theory with measured dimensions and local gravity; strain σ/E with E within 1.2 % of the handbook; indicator scaling by GF_gauge/GF_dial and the bridge factor; apparent strain (α_specimen − α_STC)·ΔT in quarter-bridge channels.', 'Dally & Riley Ch. 6–9; Vishay TN-504; ASM data'];
  LAB.NOMEN[ID] = [['ε_a, ε_t', 'Axial and transverse strain', 'µε'], ['ε_ind', 'Strain-indicator reading', 'µε'], ['GF', 'Gauge factor (gauge, dial)', '—'], ['k', 'Bridge factor', '—'], ['σ', 'Bending stress at the gauge section', 'MPa'], ['W', 'Load', 'N'], ['L', 'Load point to gauge centre', 'm'], ['b, h', 'Beam width and depth', 'm'], ['E', 'Young’s modulus', 'GPa'], ['ν', 'Poisson’s ratio', '—'], ['V_o, V_ex', 'Bridge output and excitation', 'mV, V']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.4, title: 'Measure b, h and L', note: s => `b = ${U.f(s.truth.bm, 2)} mm, h = ${U.f(s.truth.hm, 2)} mm, L = ${U.f(s.truth.Lm, 1)} mm`, why: 'Dimensions are measured on the unloaded, unwired beam.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(130, 160, 'caliper on b, h', 225, 118) : K.tick(300, 70); } },
    { op: 1, d: 2.4, title: s => 'Connect the gauges to the indicator', note: (s, p) => BR[p.br].name, why: 'The gauges must be wired before the bridge can be balanced.',
      draw(L, u, c) { c.show('wires', true); c.op('wires', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Set the GF dial and balance both channels', note: (s, p) => `GF dial ${p.gfs === 'act' ? '2.12' : '2.00'}; both channels set to 0 µε with the hanger on`, why: 'Balance is done with everything connected and the empty hanger in place, just before loading.',
      draw(L, u, c) { const v = Math.round(37 * (1 - E(u))); c.txt('d1', `CH1 ${v} µε`); c.txt('d2', `CH2 ${-v} µε`); L.innerHTML = c.active ? tag(330, 90, 'balance → 0', 400, 70) : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Gauges on a beam', lines: [
      ['A strain gauge is a thin metal grid glued to the surface. Stretch the surface and the grid’s resistance rises by gauge factor times strain.', { s: 0 }],
      ['Two gauges run along the beam, top and bottom. Two more run across it, to catch the sideways contraction.', { s: 1 }],
      ['The strain indicator balances the bridge to zero before any load goes on.', { s: 2 }]],
      q: { q: 'Under a downward end load, the top axial gauge sees', o: ['Compression', 'Tension', 'No strain', 'Shear only'], a: 1, why: 'A cantilever loaded downward bends with its top surface in tension.' } },
    { title: 'Loading the cantilever', lines: [
      ['Weights go on half a kilogram at a time. Both channels are read after the beam stops swinging.', { r: [0, 0.5] }],
      ['The axial reading climbs; the transverse reading goes negative, about a third as fast.', { r: [0.5, 0.9] }],
      ['After unloading, the zero is read again. In a quarter bridge it may have drifted if the room warmed.', { r: [0.9, 1] }]],
      q: { q: 'In a half bridge with the top and bottom gauges in adjacent arms, the reading is', o: ['Half the surface strain', 'Twice the surface strain', 'Zero', 'The transverse strain'], a: 1, why: 'Tension and compression subtract in adjacent arms, so the magnitudes add.' } },
    { title: 'From readings to E and ν', lines: [
      ['First correct the readings: multiply by the dial gauge factor over the real one, divide by the bridge factor.', null],
      ['Six W L over b h squared gives the stress at the gauges. Stress against true strain is a straight line, and its slope is Young’s modulus.', null],
      ['Transverse strain over axial strain, with the sign changed, is Poisson’s ratio.', null]],
      q: { q: 'The beam depth is measured 2 % too small. Your E will be', o: ['2 % too high', 'About 4 % too high', '2 % too low', 'Unaffected'], a: 1, why: 'σ ∝ 1/h², so a 2 % low h makes σ, and E, about 4 % high.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Weights falling from the hanger.', 'Beam springing back if a weight slips off.', 'Low-voltage instrument only.'],
    ppe: ['Closed shoes', 'Safety glasses'],
    rules: ['Add weights gently with slots staggered.', 'Do not load beyond 3 kg.', 'Keep feet clear of the area under the hanger.', 'Do not pull on the gauge lead wires.'],
    emerg: ['If the clamp slips, step back; do not catch the falling weights.', 'Report a damaged gauge or lead to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Strain gauges', '120 Ω foil, GF 2.12 ±1 %, 5 mm grid, STC 11 (steel)', 'Lot GF on the packet'], ['Adhesive', 'Cyanoacrylate (M-Bond 200)', 'Room-temperature cure'], ['Strain indicator', '2 channels, GF dial 1.5–4.5, 1 µε', 'Quarter/half/full bridge input'], ['Lead wires', '3-wire for quarter bridge', 'Lead compensation'], ['Weights', '0.5 kg × 6, class M2', 'Load'], ['Vernier caliper', '0.02 mm', 'b, h, L']], note: 'Check gauge resistance (120 ± 0.5 Ω) and insulation to the beam (> 1 GΩ) before balancing.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const rd = R(r, 200, 1200, 0), gd = Pk(r, [2.0, 2.05]), gg = Pk(r, [2.08, 2.12, 2.15]), k = Pk(r, [1, 2]), ans = rd * gd / gg / k; return { title: 'Correcting an indicator reading', q: `A strain indicator with its gauge-factor dial at ${gd} reads ${rd} µε. The gauges have GF ${gg} and are in a ${k === 1 ? 'quarter bridge' : 'half bridge (top and bottom gauges, adjacent arms)'}. Find the surface strain.`, ans, unit: 'µε', hints: ['ε = reading × GF_dial/GF_gauge ÷ k.', `k = ${k}.`], sol: `ε = ${rd} × ${gd}/${gg}/${k} = <b>${s(ans)} µε</b>.` }; },
    r => { const W = R(r, 5, 40, 1), L = Pk(r, [150, 200, 250, 300]), bb = Pk(r, [20, 25, 30]), hh = Pk(r, [3, 4, 5, 6]), ans = 6 * W * L / (bb * hh * hh); return { title: 'Bending stress at a gauge', q: `A cantilever ${bb} mm wide and ${hh} mm deep carries ${W} N at a distance of ${L} mm from a strain gauge. Find the bending stress at the gauge.`, ans, unit: 'MPa', hints: ['σ = 6WL/(bh²).', 'N and mm give N/mm² = MPa.'], sol: `σ = 6 × ${W} × ${L}/(${bb} × ${hh}²) = <b>${s(ans)} MPa</b>.` }; },
    r => { const ea = R(r, 300, 1200, 0), nu = Pk(r, [0.28, 0.3, 0.33, 0.34]), GFv = 2.1, Vx = Pk(r, [2.5, 5, 10]), ans = Vx * GFv / 4 * 2 * (1 + nu) * ea * 1e-6 * 1000; return { title: 'Full Poisson bridge output', q: `A full bridge has two axial gauges (ε_a = ±${ea} µε) and two transverse gauges on a material with ν = ${nu}, arranged so all signals add. GF = 2.1, excitation ${Vx} V. Find the output voltage.`, ans, unit: 'mV', hints: ['Bridge factor 2(1 + ν).', 'V_o = V_ex·GF·k·ε/4.'], sol: `k = 2(1 + ${nu}) = ${s(2 * (1 + nu))}; V_o = ${Vx} × 2.1 × ${s(2 * (1 + nu))} × ${ea}×10⁻⁶/4 = <b>${s(ans)} mV</b>.` }; }
  ];
})();
