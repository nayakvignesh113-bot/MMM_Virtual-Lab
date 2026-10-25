/* Exp 09 — Measurement of thrust and torque in drilling with a strain-gauge drill tool dynamometer. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'drilldyn';
  const WM = { ms: { name: 'Mild steel IS 2062 E250', kc: 1780, mc: 0.17, ch: 3.0 }, ci: { name: 'Grey cast iron FG 260', kc: 1150, mc: 0.22, ch: 2.2 }, al: { name: 'Aluminium alloy 6063-T6', kc: 750, mc: 0.25, ch: 0.9 } };
  const Nrpm = 450, SIG = 118; // spindle speed, point angle

  LAB.register({
    id: ID, no: 9, cat: 'strain', title: 'Measurement of Thrust and Torque using a Drill Tool Dynamometer', std: 'ISO 5419 (twist drill terms) / ISO 3002-4', short: 'The work-piece sits on a two-component strain-gauge dynamometer under a drilling machine. You measure thrust and torque for different feeds or drill diameters, and find power, specific cutting energy and how the forces scale.', tags: 'drill dynamometer thrust torque drilling twist drill chisel edge specific cutting energy power feed diameter exponent strain gauge',
    aim: 'To measure the thrust force and torque in drilling with a two-component drill tool dynamometer and to study their variation with feed and drill diameter, determining cutting power, material removal rate and specific cutting energy.',
    objectives: ['Explain how a drill dynamometer separates thrust from torque.', 'Convert dynamometer readings to SI units and calculate power and specific cutting energy.', 'Relate torque to the cutting action of the lips and thrust to the lips plus the chisel edge.', 'Find the exponent of feed (or diameter) in the torque and thrust relations from a log–log plot.', 'Compare the measurement with a Kienzle-based prediction.'],
    apparatus: ['Radial or pillar drilling machine, spindle 450 rpm, power feed 0.05–0.32 mm/rev', 'Two-component drill tool dynamometer (thrust 0–1000 kgf, torque 0–1000 kgf·cm), strain-gauge bridges, digital indicator', 'HSS twist drills Ø 6–16 mm, point angle 118°, sharp', 'Work blocks clamped on the dynamometer table', 'Cutting fluid (soluble oil) for steel'],
    stdNote: 'ISO 5419 defines twist-drill geometry (lips, chisel edge, point angle); ISO 3002-4 the force terms. Torque is produced by the cutting forces on the two lips; thrust by the feed forces on the lips and, largely, by the chisel edge, which extrudes rather than cuts.',
    params: [
      { id: 'mat', label: 'Work material', type: 'select', options: Object.entries(WM).map(([k, v]) => [k, v.name]), def: 'ms' },
      { id: 'sw', label: 'Variable in this run', type: 'select', options: [['f', 'Feed varied, drill Ø 10 mm'], ['d', 'Drill diameter varied, feed 0.15 mm/rev']], def: 'f' },
      { id: 'pilot', label: 'Pilot hole', type: 'select', options: [['no', 'None (solid drilling)'], ['yes', 'Ø 3 mm pilot hole (removes chisel-edge work)']], def: 'no' }
    ],
    opSteps: ['Clamp the dynamometer on the machine table and the work on the dynamometer', 'Connect to the indicator, warm up and zero thrust and torque', 'Fit the drill; set the spindle speed and the feed', 'Drill to full diameter depth and read thrust and torque during the steady part', 'Repeat for each feed or drill', 'Stop the spindle, raise the drill, clear the chips'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(30, 20, 30, 230, 'mach')}${G.r(30, 20, 200, 40, 'mach', 'rx="4"')}${G.r(160, 60, 50, 60, 'mach2', 'rx="3"')}${G.t(214, 40, 'drilling machine head', 'm')}
        <g id="drill"><rect x="180" y="120" width="10" height="70" class="steelD"/><path d="M180 190 L190 190 L185 200 Z" class="steelD"/><g id="flutes"><line x1="180" y1="130" x2="190" y2="140" class="ln"/><line x1="180" y1="150" x2="190" y2="160" class="ln"/><line x1="180" y1="170" x2="190" y2="180" class="ln"/></g></g>
        <rect id="work" x="130" y="194" width="110" height="26" class="spec"/><rect id="hole" x="179" y="194" width="12" height="0" class="bg"/>
        ${G.r(110, 220, 150, 26, 'acc', 'rx="3"')}${G.t(116, 262, 'drill dynamometer', 'm')}${G.r(80, 246, 210, 10, 'mach', 'rx="2"')}
        ${G.arrow(260, 150, 260, 190, 'arrh')}${G.t(266, 170, 'thrust F', 'm')}<path d="M150 150 A 40 12 0 0 0 220 150" fill="none" stroke="var(--heat)" stroke-width="2"/>${G.t(120, 146, 'torque M', 'm')}
        <path id="wires" d="M260 232 C 320 232, 340 120, 380 110" fill="none" stroke="var(--accent)" stroke-width="2" style="display:none"/>
        <g transform="translate(380,60)">${G.r(0, 0, 164, 70, 'disp', 'rx="4"')}${G.t(8, 14, 'DYNAMOMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 38, 'F ---- kgf', 'big', 'id="dT" style="font-size:12px"')}${G.t(8, 60, 'M ---- kgf·cm', 'big', 'id="dM" style="font-size:12px"')}</g>
        <g transform="translate(380,150)">${G.r(0, 0, 164, 54, 'disp', 'rx="4"')}${G.t(8, 14, 'DRILL / FEED', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '—', 'big', 'id="dK" style="font-size:11px"')}</g>`, 'Drilling machine with a twist drill above a work block clamped on a two-component drill dynamometer, with indicator');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.show(svg, 'wires', false); return; }
      G.show(svg, 'wires', true);
      const n = sim.runs.length, x = f * n, k = Math.min(n - 1, Math.floor(x)), u = x - k, c = sim.runs[k];
      const dep = u < 0.15 ? 0 : Math.min(1, (u - 0.15) / 0.7); G.set(svg, 'drill', 'transform', `translate(0 ${-6 + 26 * dep})`); G.set(svg, 'hole', 'height', String(26 * dep)); G.set(svg, 'flutes', 'transform', `translate(0 ${(f * 400) % 20})`);
      const on = dep > 0.25 && u < 0.88; G.txt(svg, 'dT', on ? `F ${U.f(c.rT, 1)} kgf` : 'F 0.0 kgf'); G.txt(svg, 'dM', on ? `M ${U.f(c.rM, 1)} kgf·cm` : 'M 0.0 kgf·cm'); G.txt(svg, 'dK', `run ${k + 1}: Ø${c.d} mm, f ${U.f(c.f, 2)}`);
    },
    liveView(el, f, sim, p, api) {
      const n = sim.runs.length, k = Math.min(n - 1, Math.floor(f * n)), done = sim.runs.slice(0, k + 1), xv = c => p.sw === 'f' ? c.f : c.d;
      api.title('Torque and thrust'); api.sub(`${done.length} of ${n} runs`);
      G.profileView(el, { xlabel: p.sw === 'f' ? 'Feed (mm/rev)' : 'Drill diameter (mm)', ylabel: 'Torque (N·m) · thrust (kN)', series: [{ name: 'torque M (N·m)', x: done.map(xv), y: done.map(c => c.Mn), type: 'linepts', color: 's5' }, { name: 'thrust F (kN)', x: done.map(xv), y: done.map(c => c.Tn / 1000), type: 'linepts', color: 's1' }], xmin: 0 }, 210);
    },
    simulate(p, r) {
      const Wm = WM[p.mat], kc0 = Wm.kc * (1 + 0.05 * U.gauss(r)), mc = Wm.mc, sk = Math.sin(SIG / 2 * Math.PI / 180);
      const list = p.sw === 'f' ? [0.05, 0.08, 0.12, 0.16, 0.20, 0.25].map(ff => ({ d: 10, f: ff })) : [6, 8, 10, 12, 14, 16].map(dd => ({ d: dd, f: 0.15 }));
      const dp = p.pilot === 'yes' ? 3 : 0;
      const runs = list.map(c => { const h = c.f / 2 * sk, kc = kc0 * Math.pow(h, -mc); const Mlips = kc * (c.d * c.d - dp * dp) * c.f / 8 * (1 + 0.03 * U.gauss(r)); // N·mm
        const Tlips = 0.4 * kc * (c.d - dp) * c.f, Tch = dp ? 0 : Wm.ch * c.d * c.d * (c.f / 0.15) ** 0.5 * 4; const Tn = (Tlips + Tch) * (1 + 0.04 * U.gauss(r));
        const Mn = Mlips / 1000; return { d: c.d, f: c.f, Mn, Tn, rM: U.q(Mn / 9.80665 * 100, 0.1), rT: U.q(Tn / 9.80665, 0.1) }; });
      const i3 = 3, c3 = runs[i3]; const M3 = c3.rM * 9.80665 / 100, T3 = c3.rT * 9.80665;
      const Pw = 2 * Math.PI * Nrpm * M3 / 60 / 1000, MRR = Math.PI * (c3.d * c3.d - dp * dp) / 4 * c3.f * Nrpm, u3 = Pw * 1000 * 60 / MRR * 1000; // W/(mm³/s) = J/mm³; × 1000 → N/mm²
      const xs = runs.map(c => p.sw === 'f' ? c.f : c.d); const expM = U.linfit(xs.map(Math.log), runs.map(c => Math.log(c.rM))).m, expT = U.linfit(xs.map(Math.log), runs.map(c => Math.log(c.rT))).m;
      const T = { M3, T3, Pw, MRR, u3, expM, expT, runs, i3, dp };
      return {
        runs, truth: T, dur: 12,
        readout(f) { const n = runs.length, k = Math.min(n - 1, Math.floor(f * n)), c = runs[k]; return [['Run', `${k + 1}/${n}`, ''], ['Drill', c.d, 'mm'], ['Feed', U.f(c.f, 2), 'mm/rev'], ['Thrust', U.f(c.rT, 1), 'kgf'], ['Torque', U.f(c.rM, 1), 'kgf·cm']]; },
        plot: { title: 'Torque and thrust', xlabel: p.sw === 'f' ? 'Feed f (mm/rev)' : 'Drill diameter d (mm)', ylabel: 'Torque (N·m), thrust (kN)', series: [{ name: 'torque (N·m)', x: xs, y: runs.map(c => c.rM * 9.80665 / 100), type: 'linepts', color: 's5' }, { name: 'thrust (kN)', x: xs, y: runs.map(c => c.rT * 9.80665 / 1000), type: 'linepts', color: 's1' }], caption: `Torque and thrust against ${p.sw === 'f' ? 'feed (Ø 10 mm drill)' : 'drill diameter (feed 0.15 mm/rev)'}` },
        plots: [{ xlabel: p.sw === 'f' ? 'ln f' : 'ln d', ylabel: 'ln (reading)', series: [{ name: 'ln M', x: xs.map(Math.log), y: runs.map(c => Math.log(c.rM)), type: 'linepts', color: 's5' }, { name: 'ln F', x: xs.map(Math.log), y: runs.map(c => Math.log(c.rT)), type: 'linepts', color: 's1' }], xzero: false, yzero: false, caption: 'Log–log plot: slopes are the exponents of ' + (p.sw === 'f' ? 'feed' : 'diameter') }],
        specimen: [['Work material', Wm.name, ''], ['Drill', 'HSS twist drill, point angle 118°', ''], ['Spindle speed N', Nrpm, 'rpm'], ['Pilot hole', dp ? 'Ø 3 mm' : 'none', ''], ['Indicator units', 'thrust kgf; torque kgf·cm', ''], ['1 kgf·cm', '0.0980665', 'N·m']],
        obs: [{ title: 'Table 1. Dynamometer readings', cols: ['Run', 'Drill Ø d (mm)', 'Feed f (mm/rev)', 'Thrust (kgf)', 'Torque (kgf·cm)'], rows: runs.map((c, i) => [i + 1, c.d, U.f(c.f, 2), U.f(c.rT, 1), U.f(c.rM, 1)]) }],
        truth: T
      };
    },
    expHint: 'Convert kgf to N (× 9.80665) and kgf·cm to N·m (× 0.0980665). Power P = 2πNM/60. Material removal rate = (π/4)(d² − d_pilot²) f N. Specific energy u = P/MRR.',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'm', label: 'Torque at run 4', unit: 'N·m', truth: T.M3, tol: 0.005, fmt: v => U.f(v, 3) },
      { key: 't', label: 'Thrust at run 4', unit: 'N', truth: T.T3, tol: 0.005, fmt: v => U.f(v, 0) },
      { key: 'p', label: 'Drilling power at run 4, P = 2πNM/60', unit: 'kW', truth: T.Pw, tol: 0.01, fmt: v => U.f(v, 4) },
      { key: 'mrr', label: 'Material removal rate at run 4', unit: 'mm³/min', truth: T.MRR, tol: 0.01, fmt: v => U.f(v, 0) },
      { key: 'u', label: 'Specific cutting energy at run 4, u = P/MRR', unit: 'N/mm²', truth: T.u3, tol: 0.015, fmt: v => U.f(v, 0) },
      { key: 'xm', label: `Exponent of ${p.sw === 'f' ? 'feed' : 'diameter'} in the torque: slope of ln M against ln ${p.sw === 'f' ? 'f' : 'd'}`, unit: '—', truth: T.expM, abs: 0.04, fmt: v => U.f(v, 3) },
      { key: 'xt', label: `Exponent of ${p.sw === 'f' ? 'feed' : 'diameter'} in the thrust`, unit: '—', truth: T.expT, abs: 0.04, fmt: v => U.f(v, 3) }]; },
    reference(sim, p) { const T = sim.truth, Wm = WM[p.mat]; return [{ label: 'Specific cutting energy', unit: 'N/mm²', value: T.u3, lo: Wm.kc * 1.0, hi: Wm.kc * 2.2, src: 'Kienzle k_c at h = f/2·sin 59°', fmt: v => U.f(v, 0) }, { label: `Torque exponent of ${p.sw === 'f' ? 'feed' : 'diameter'}`, unit: '', value: T.expM, lo: p.sw === 'f' ? 0.7 : 1.7, hi: p.sw === 'f' ? 0.9 : 2.1, src: p.sw === 'f' ? 'Shaw & Oxford: 0.8' : 'Shaw & Oxford: 1.8; d² by geometry', fmt: v => U.f(v, 2) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Why thrust and torque behave differently</h4></div><p class="muted" style="font-size:.86rem">Torque comes from the cutting forces on the two lips, which act at about a quarter of the diameter from the axis: it grows roughly as d² (wider lips and longer lever arm) and as f^${U.f(1 - WM[p.mat].mc, 2)} (thicker chip, lower specific energy). Thrust has two parts: the feed forces on the lips, and the chisel edge, which has a strongly negative rake and extrudes the metal at the centre. ${T.dp ? 'With a pilot hole the chisel edge cuts air: thrust falls by about half, torque only slightly. That is why large holes are pre-drilled.' : 'In solid drilling the chisel edge carries half or more of the thrust. Try the pilot-hole setting and compare.'}</p></div>`; },
    sample(sim) { const T = sim.truth, c = T.runs[T.i3]; return `<div class="eq">M = ${U.f(c.rM, 1)} kgf·cm × 0.0980665 = <b>${U.f(T.M3, 3)} N·m</b>; F = ${U.f(c.rT, 1)} kgf × 9.80665 = <b>${U.f(T.T3, 0)} N</b></div><div class="eq">P = 2π × ${Nrpm} × ${U.f(T.M3, 3)}/60 = <b>${U.f(T.Pw * 1000, 1)} W</b></div><div class="eq">MRR = (π/4)(${c.d}² − ${T.dp}²) × ${U.f(c.f, 2)} × ${Nrpm} = <b>${U.f(T.MRR, 0)} mm³/min</b></div><div class="eq">u = P/MRR = ${U.f(T.Pw * 1000, 1)} W/(${U.f(T.MRR / 60, 1)} mm³/s) = ${U.f(T.u3 / 1000, 3)} J/mm³ = <b>${U.f(T.u3, 0)} N/mm²</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Torque', expr: '√[(0.1 kgf·cm/√12)² + (1.5 % calibration)²]', val: T.M3, u: M.rss(M.uRes(0.1) * 0.0980665, 0.015 * T.M3), unit: 'N·m' }, { q: 'Thrust', expr: '√[(0.1 kgf/√12)² + (1.5 %)²]', val: T.T3, u: M.rss(M.uRes(0.1) * 9.80665, 0.015 * T.T3), unit: 'N' }, { q: 'Specific energy', expr: '√[(u_M/M)² + (u_f/f)² + (2u_d/d)²]', val: T.u3, u: T.u3 * M.rss(0.015, 0.02, 2 * 0.02 / 10), unit: 'N/mm²' }]; },
    conclude(sim, p) { const T = sim.truth; return `At run 4 the drill developed ${U.f(T.M3, 2)} N·m of torque and ${U.f(T.T3, 0)} N of thrust, a power of ${U.f(T.Pw * 1000, 0)} W and a specific cutting energy of ${U.f(T.u3, 0)} N/mm². Torque varied as ${p.sw === 'f' ? 'f' : 'd'}^${U.f(T.expM, 2)} and thrust as ${p.sw === 'f' ? 'f' : 'd'}^${U.f(T.expT, 2)}${T.dp ? '; with a pilot hole the chisel-edge thrust was eliminated' : ''}.`; },
    summary: 'A twist drill cuts with its two lips and pushes its chisel edge through the centre of the hole. The cutting forces on the lips act at a radius of about d/4 and produce the torque; the feed forces on the lips and the extrusion at the chisel edge produce the thrust. A drill dynamometer supports the work-piece on strain-gauged elements arranged so that one bridge responds to the axial force and another to the torque. Power is 2πNM/60, the material removal rate is (π/4)d²fN, and their ratio is the specific cutting energy. Empirically (Shaw and Oxford) torque varies as f^0.8 d^1.8 and thrust as f^0.8 d plus a chisel-edge term.',
    formulas: [['Power', 'P = 2πNM/60'], ['Material removal rate', 'MRR = (π/4)(d² − d_p²) f N'], ['Specific cutting energy', 'u = P/MRR'], ['Lip torque (Kienzle basis)', 'M ≈ k_c d² f/8'], ['Uncut chip thickness per lip', 'h = (f/2) sin(σ/2)'], ['Shaw–Oxford', 'M ∝ f^0.8 d^1.8;  F ∝ f^0.8 d + chisel term'], ['Units', '1 kgf = 9.806 65 N; 1 kgf·cm = 0.098 07 N·m']],
    theory: `<h3>How a twist drill cuts</h3><p>A twist drill has two cutting lips meeting at the point angle (118° for general work) and joined at the centre by the chisel edge. Each lip removes a chip of thickness h = (f/2) sin(σ/2), because each lip takes half the feed per revolution. The cutting force on each lip acts roughly at the middle of the lip, a quarter of the diameter from the axis, so the two lip forces form a couple: the torque. The rake angle along the lip varies from the helix angle at the outer corner to strongly negative near the centre.</p>
      <h3>The chisel edge</h3><p>At the centre the chisel edge has a large negative rake and almost no clearance; it does not cut but extrudes material sideways. It contributes little torque but a large part of the thrust: half or more in solid drilling of steel. A pilot hole larger than the chisel edge removes this contribution, which is why large holes are drilled in two stages, and why web thinning is used on large drills.</p>
      <h3>The drill dynamometer</h3><p>The work is clamped on a platform supported by elastic elements carrying strain gauges. Gauges along the axis of the elements, wired in one bridge, respond to the axial thrust; gauges at 45°, or on elements loaded tangentially, respond to torque. The bridges are arranged so that each output is insensitive to the other load. The dynamometer is calibrated with known axial loads and known torques applied through a lever.</p>
      <h3>Power, removal rate and specific energy</h3><p>The torque times the angular speed gives the power, P = 2πNM/60. The volume removed per minute is (π/4)d<sup>2</sup>fN. Dividing power by removal rate gives the specific cutting energy, which for steel is 2–4 J/mm³ (N/mm²), higher than in turning at the same feed because the chips are thin and the rake is small near the centre.</p>
      <h3>Scaling laws</h3><p>Because the chip thickness depends on feed but not on diameter, the torque grows almost as d<sup>2</sup> (width of lip × lever arm) and as f<sup>1−m<sub>c</sub></sup>. Shaw and Oxford found M ∝ f<sup>0.8</sup>d<sup>1.8</sup> from extensive tests. Plotting the logarithm of torque against the logarithm of feed or diameter gives a straight line whose slope is the exponent.</p>`,
    procedure: ['Clamp the dynamometer firmly on the drilling-machine table; clamp the work block on the dynamometer platform.', 'Connect the dynamometer to its indicator, warm up for 10 minutes and zero both channels.', 'Fit the drill in the spindle; set the speed and the power feed.', 'Start the spindle and engage the feed. Read thrust and torque when the drill is cutting at full diameter (after the point has fully entered).', 'Retract the drill, move the work to a fresh position, and repeat for each feed or drill.', 'Stop the spindle, clear the chips with a brush and clean the dynamometer.'],
    precautions: ['Clamp the work securely: a drill catching an unclamped block spins it round.', 'Do not exceed the dynamometer capacity, especially with large drills at high feed.', 'Read only when the full diameter is cutting.', 'Use cutting fluid for steel and clear chips regularly to avoid jamming.', 'Do not hold the work by hand.'],
    applications: ['Selecting feed and spindle power for drilling operations.', 'Evaluating drill geometry, point thinning and coatings.', 'Detecting drill wear and imminent breakage from rising torque.', 'Designing fixtures to resist drilling thrust and torque.'],
    errors: ['Cross-sensitivity between thrust and torque channels.', 'Drill wear and built-up edge.', 'Variation of hardness in the work.', 'Reading during entry, before full diameter is cutting.', 'Chip clogging in the flutes increases torque.'],
    discussion: ['Why does the chisel edge contribute much thrust but little torque?', 'How do your exponents compare with Shaw and Oxford (0.8 and 1.8)? Why is the diameter exponent close to 2?', 'Compare the specific energy with that of turning at a similar chip thickness. Why is it higher?', 'What happens to thrust and torque with a pilot hole, and why is this useful?'],
    refs: ['M. C. Shaw, C. J. Oxford, On the drilling of metals 2: The torque and thrust in drilling, Trans. ASME 79 (1957) 139–148.', 'G. Boothroyd, W. A. Knight, Fundamentals of Machining and Machine Tools, 3rd ed., CRC Press, Ch. 9.', 'ISO 5419:1998, Twist drills. Terms, definitions and types.', 'A. Ghosh, A. K. Mallik, Manufacturing Science, 2nd ed., East-West Press.', 'P. N. Rao, Manufacturing Technology Vol. 2, McGraw-Hill.'],
    pre: [
      { q: 'In drilling, torque is produced mainly by', o: ['The chisel edge', 'The cutting forces on the two lips', 'The margin', 'The shank'], a: 1, why: 'Lip forces at a radius form a couple.' },
      { q: 'The chisel edge contributes mainly to', o: ['Torque', 'Thrust', 'Speed', 'Surface finish'], a: 1, why: 'It extrudes material axially.' },
      { q: 'Drilling power is', o: ['F × f', '2πNM/60', 'M/N', 'F × d'], a: 1, why: 'Torque times angular speed.' },
      { q: 'Each lip of a twist drill removes a chip whose thickness depends on', o: ['Diameter only', 'Feed and point angle', 'Spindle speed only', 'Helix angle only'], a: 1, why: 'h = (f/2) sin(σ/2).' },
      { q: '1 kgf·cm equals about', o: ['9.81 N·m', '0.098 N·m', '98 N·m', '0.0098 N·m'], a: 1, why: '9.81 N × 0.01 m = 0.098 N·m.' }
    ],
    post: [
      { q: 'M = 8 N·m at 450 rpm. Power is about', o: ['3.6 kW', '377 W', '60 W', '3600 W'], a: 1, why: '2π × 450 × 8/60 = 377 W.' },
      { q: 'A Ø 12 mm hole at 0.2 mm/rev and 400 rpm removes', o: ['9048 mm³/min', '113 mm³/min', '4524 mm³/min', '36 000 mm³/min'], a: 0, why: '(π/4)×144×0.2×400 = 9048 mm³/min.' },
      { q: 'Doubling the drill diameter at the same feed raises the torque by about', o: ['2×', '3.5–4×', '8×', '1.4×'], a: 1, why: 'M ∝ d^1.8–2.' },
      { q: 'A pilot hole slightly larger than the chisel edge mainly reduces', o: ['Torque', 'Thrust', 'Speed', 'Hole size'], a: 1, why: 'The chisel edge no longer extrudes material.' },
      { q: 'Specific cutting energy in drilling is usually higher than in turning because', o: ['Drills are blunter', 'Chips are thin and rake is small or negative near the centre', 'Speed is higher', 'There is no friction'], a: 1, why: 'Size effect and poor geometry near the axis.' }
    ]
  });

  LAB.VALID[ID] = ['p', 'Lip torque from k_c d² f/8 with Kienzle k_c at the per-lip chip thickness; thrust as lip feed force plus a chisel-edge term ∝ d², removed with a pilot hole. Exponents reproduce Shaw–Oxford trends; magnitudes are typical rather than specific to one drill and material lot.', 'Shaw & Oxford (1957); Boothroyd & Knight Ch. 9'];
  LAB.NOMEN[ID] = [['M', 'Torque', 'N·m (indicator kgf·cm)'], ['F', 'Thrust', 'N (indicator kgf)'], ['d, d_p', 'Drill and pilot-hole diameter', 'mm'], ['f', 'Feed per revolution', 'mm/rev'], ['N', 'Spindle speed', 'rpm'], ['σ', 'Point angle', '°'], ['h', 'Chip thickness per lip', 'mm'], ['P', 'Power', 'kW'], ['MRR', 'Material removal rate', 'mm³/min'], ['u', 'Specific cutting energy', 'N/mm²'], ['k_c', 'Specific cutting force', 'N/mm²']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.4, title: 'Clamp the dynamometer and the work block', note: 'Both clamped; never hand-held', why: 'Everything is clamped before the indicator is zeroed or the drill fitted.',
      draw(L, u, c) { c.set('work', 'transform', `translate(0 ${-30 * (1 - E(u))})`); L.innerHTML = c.active ? tag(260, 230, 'clamp', 240, 206) : ''; } },
    { op: 1, d: 2.2, title: 'Connect the indicator and zero both channels', note: 'Warm-up 10 minutes, then zero', why: 'Zeroing is done with the work clamped and the drill not yet touching it.',
      draw(L, u, c) { c.show('wires', true); c.op('wires', E(u)); c.txt('dT', 'F ' + U.f(2 * (1 - E(u)), 1) + ' kgf'); c.txt('dM', 'M ' + U.f(1.2 * (1 - E(u)), 1) + ' kgf·cm'); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: 'Fit the drill; set speed and feed', note: s => `N = ${Nrpm} rpm; first run Ø${s.runs[0].d} mm at ${U.f(s.runs[0].f, 2)} mm/rev`, why: 'The drill goes in last, after the dynamometer is zeroed.',
      draw(L, u, c) { c.set('drill', 'transform', `translate(0 ${-40 * (1 - E(u))})`); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'A dynamometer under the work', lines: [
      ['Here the dynamometer holds the work, not the tool. Its strain-gauged supports feel the push of the drill and its twist.', { s: 0 }],
      ['One bridge reads thrust along the axis; the other reads torque.', { s: 1 }],
      ['The drill goes into the spindle last, and the indicator is zeroed before it touches the work.', { s: 2 }]],
      q: { q: 'Why read only after the point has fully entered the work?', o: ['The indicator needs time', 'Until then only part of the lips is cutting, so thrust and torque are still rising', 'The drill is cold', 'It makes no difference'], a: 1, why: 'Full diameter cutting gives the steady values.' } },
    { title: 'Changing the feed or the drill', lines: [
      ['Each run uses a new feed, or a bigger drill. Thrust and torque are read in the steady part of the cut.', { r: [0, 0.5] }],
      ['Torque climbs steeply with diameter: the lips get longer and the lever arm too.', { r: [0.5, 0.9] }],
      ['Most of the thrust comes from the chisel edge at the centre.', { r: [0.9, 1] }]],
      q: { q: 'Doubling the feed roughly multiplies the torque by', o: ['4', '1.7–1.8', '1', '0.5'], a: 1, why: 'M ∝ f^0.8: 2^0.8 ≈ 1.74.' } },
    { title: 'Power and energy', lines: [
      ['Torque times two pi times the speed, over sixty, is the power.', null],
      ['Divide by the volume removed per second, and you have the energy to remove each cubic millimetre.', null],
      ['A log–log plot of torque against feed gives a straight line; its slope is the feed exponent.', null]],
      q: { q: 'Specific cutting energy has units of', o: ['N/mm', 'J/mm³, the same as N/mm²', 'W', 'N·m/s'], a: 1, why: 'Energy per volume = force per area.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Rotating drill and chuck: entanglement of hair, sleeves, gloves.', 'Work spinning if it catches and is not clamped.', 'Hot, sharp spiral chips.', 'Drill breakage.'],
    ppe: ['Safety glasses', 'Closed shoes', 'No gloves at the rotating drill', 'Hair tied back'],
    rules: ['Clamp the work and the dynamometer; never hold the work by hand.', 'Remove the chuck key before starting.', 'Clear chips with a brush only after stopping the spindle.', 'Do not force the feed; let the power feed act.', 'Stay within the dynamometer capacity.'],
    emerg: ['Press the emergency stop.', 'If the work catches and spins, stop the machine; do not grab it.', 'For a cut, apply pressure and report.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Drill dynamometer', 'Thrust 1000 kgf, torque 1000 kgf·cm, cross-talk ≤ 3 %', 'Work clamped on top'], ['Indicator', '2 channels, 0.1 resolution', 'Zero before each set'], ['Twist drills', 'HSS, Ø 6–16 mm, 118°', 'Sharp; check symmetry of lips'], ['Work blocks', 'E250, FG 260, Al 6063; 50 mm thick', 'Flat, parallel faces'], ['Cutting fluid', '5 % soluble oil', 'Steel only'], ['Calibration lever', 'Known weights on an arm', 'Torque calibration']], note: 'Unequal lip lengths make the drill cut oversize and raise one lip’s load; regrind before testing.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const Mv = R(r, 2, 25, 2), N = Pk(r, [250, 355, 450, 560, 710]), ans = 2 * Math.PI * N * Mv / 60 / 1000; return { title: 'Drilling power', q: `A drill turns at ${N} rpm with a torque of ${Mv} N·m. Find the power.`, ans, unit: 'kW', hints: ['P = 2πNM/60 in W.', 'Divide by 1000 for kW.'], sol: `P = 2π × ${N} × ${Mv}/60 = ${s(ans * 1000)} W = <b>${s(ans)} kW</b>.` }; },
    r => { const d = Pk(r, [8, 10, 12, 16, 20]), f = Pk(r, [0.1, 0.15, 0.2, 0.25]), N = Pk(r, [355, 450, 560]), ans = Math.PI / 4 * d * d * f * N; return { title: 'Material removal rate', q: `A hole of diameter ${d} mm is drilled in solid metal at a feed of ${f} mm/rev and ${N} rpm. Find the material removal rate.`, ans, unit: 'mm³/min', hints: ['MRR = (π/4)d² f N.', 'Units: mm² × mm/rev × rev/min.'], sol: `MRR = (π/4) × ${d}² × ${f} × ${N} = <b>${s(ans)} mm³/min</b>.` }; },
    r => { const M1 = R(r, 3, 8, 2), f1 = 0.1, f2 = Pk(r, [0.2, 0.25, 0.3]), x = Pk(r, [0.75, 0.8, 0.85]), ans = M1 * Math.pow(f2 / f1, x); return { title: 'Scaling torque with feed', q: `A drill gives ${M1} N·m at a feed of ${f1} mm/rev. If torque varies as f^${x}, what torque is expected at ${f2} mm/rev?`, ans, unit: 'N·m', hints: ['M₂ = M₁ (f₂/f₁)^x.', `(f₂/f₁) = ${s(f2 / f1)}.`], sol: `M₂ = ${M1} × (${s(f2 / f1)})^${x} = <b>${s(ans)} N·m</b>.` }; }
  ];
})();
