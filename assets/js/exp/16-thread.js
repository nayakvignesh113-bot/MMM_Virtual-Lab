/* Exp 16 — Effective (pitch) diameter of an external thread by the two-wire method on a floating carriage micrometer. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'thread';
  const TH = { m20: { d: 20, p: 2.5 }, m24: { d: 24, p: 3 }, m30: { d: 30, p: 3.5 } };
  const WSET = { best: 'Best-size wires', small: 'Wires smaller than best size (≈ 0.9 d_b)', large: 'Wires larger than best size (≈ 1.12 d_b)' };
  const rad = a => a * Math.PI / 180;

  LAB.register({
    id: ID, no: 16, cat: 'tg', title: 'Effective Diameter of a Screw Thread by the Two-Wire Method', std: 'ISO 965-1 / IS 4218 / BS 3643 (metric threads); NPL wire method', short: 'A floating carriage micrometer is set on a standard cylinder, then measures over two wires laid in the thread grooves and over the crests. You compute the dimension under the wires, the effective diameter and the major diameter, check them against the 6g tolerance, and see why best-size wires make the result insensitive to flank-angle error.', tags: 'screw thread effective diameter pitch diameter two wire three wire best size wire floating carriage micrometer major diameter flank angle ISO metric thread 6g tolerance',
    aim: 'To determine the effective (pitch) diameter and the major diameter of an external metric thread with a floating carriage micrometer, using the two-wire method with a standard setting cylinder, and to check them against the ISO 965 tolerance class 6g.',
    objectives: ['Explain the effective diameter and why it controls the fit of a thread.', 'Calculate the best-size wire and the constant P for a 60° thread.', 'Use a floating carriage micrometer with a setting cylinder to find the dimension over and under the wires.', 'Calculate the effective and major diameters and judge them against class 6g.', 'Show how the wire size affects sensitivity to flank-angle error.'],
    apparatus: ['Floating carriage micrometer (bench micrometer) with fiducial indicator, micrometer head 0.001 mm (vernier)', 'Standard (setting) cylinder, certified diameter', 'Thread measuring wires, matched sets, best size for each pitch and also undersize and oversize', 'Plain and threaded specimens held between centres', 'ISO 965 thread tables (Metrology Handbook, Screw threads)'],
    stdNote: 'ISO 965-1 gives the basic profile of ISO metric threads (60° included angle, d₂ = d − 0.6495p) and the tolerance classes; for 6g: es = −(15 + 11p) µm and T_d2 = 90p^0.4 d^0.1 µm (grade 6). The two-wire method follows NPL practice.',
    params: [
      { id: 'th', label: 'Thread', type: 'select', options: [['m20', 'M20 × 2.5'], ['m24', 'M24 × 3'], ['m30', 'M30 × 3.5']], def: 'm20' },
      { id: 'w', label: 'Measuring wires', type: 'select', options: Object.entries(WSET), def: 'best' }
    ],
    opSteps: ['Set the fiducial indicator and mount the standard cylinder between centres', 'Read the micrometer over the cylinder (R₁)', 'Mount the threaded specimen; hang the wires in opposite grooves', 'Read the micrometer over the wires, the fiducial at its index (R₂), at three positions', 'Remove the wires and read over the crests (R₃)', 'Calculate M, T, P, E and the major diameter'],
    svg(p) {
      let crest = ''; for (let i = 0; i < 9; i++) crest += `M${150 + i * 28} 104 l14 -14 l14 14 `; let root = ''; for (let i = 0; i < 9; i++) root += `M${150 + i * 28} 196 l14 14 l14 -14 `;
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(30, 250, 500, 16, 'mach', 'rx="3"')}<path d="M100 150 L130 150" class="ln" stroke-width="4"/><path d="M430 150 L460 150" class="ln" stroke-width="4"/>${G.r(70, 136, 30, 28, 'mach2')}${G.r(460, 136, 30, 28, 'mach2')}${G.t(60, 130, 'centres', 'm')}
        <g id="cyl" style="display:none"><rect x="140" y="104" width="280" height="92" class="steel"/></g>
        <g id="thr"><rect x="150" y="104" width="252" height="92" class="steelD"/><path d="${crest}" fill="var(--steel-dark)" stroke="var(--ink)" stroke-width=".8"/><path d="${root}" fill="var(--steel-dark)" stroke="var(--ink)" stroke-width=".8"/></g>
        <g id="wires" style="display:none"><circle cx="276" cy="94" r="8" class="acc"/><circle cx="290" cy="206" r="8" class="acc"/></g>
        <g id="carr"><rect x="260" y="20" width="44" height="64" rx="3" class="mach2"/><rect x="270" y="78" width="24" height="10" class="ink"/><rect x="260" y="226" width="44" height="22" rx="3" class="mach2"/><rect x="270" y="212" width="24" height="10" class="ink"/></g>
        ${G.t(310, 36, 'floating carriage: anvils', 'm')}
        <g transform="translate(400,20)">${G.r(0, 0, 144, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'MICROMETER HEAD (mm)', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dR"')}</g>
        <g transform="translate(20,20)">${G.r(0, 0, 150, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'SETTING', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dS" style="font-size:12px"')}</g>`, 'Floating carriage micrometer: thread between centres with two wires in opposite grooves between the anvils');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.show(svg, 'cyl', false); G.show(svg, 'wires', false); return; }
      const st = f < 0.3 ? 0 : f < 0.8 ? 1 : 2; G.show(svg, 'cyl', st === 0); G.show(svg, 'thr', st > 0); G.show(svg, 'wires', st === 1);
      const T = sim.truth; G.txt(svg, 'dS', ['over cylinder', 'over wires', 'over crests'][st]); G.txt(svg, 'dR', st === 1 ? 'see picture' : U.f([T.R1, T.R2, T.R3][st], 3));
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth; api.title('Thread form and wires'); api.sub(WSET[p.w]);
      const pp = T.p, a = rad(30), H = 0.866025 * pp; const xs = [], ys = []; for (let i = 0; i <= 160; i++) { const x = -pp + i / 160 * 2 * pp; const u = ((x % pp) + pp) % pp; const tri = Math.abs(u - pp / 2) / (pp / 2); ys.push(T.E / 2 + (0.5 - tri) * H * 0.75); xs.push(x); }
      const wy = T.M / 2 - T.wd / 2, cc = U.lin(0, 2 * Math.PI, 40); G.profileView(el, { xlabel: 'Axial position (mm)', ylabel: 'Radius (mm)', series: [{ name: 'thread flank (schematic)', x: xs, y: ys, color: 's1' }, { name: 'wire', x: cc.map(t => T.wd / 2 * Math.cos(t) + pp / 2), y: cc.map(t => wy + T.wd / 2 * Math.sin(t)), color: 's2' }], hlines: [{ y: T.E / 2, label: 'pitch line', color: 'muted' }], xmin: -pp, xmax: pp, yzero: false }, 210);
    },
    simulate(p, r) {
      const Th = TH[p.th], d = Th.d, pp = Th.p * (1 + 2e-5 * U.gauss(r)), pn = Th.p;
      const db = P.bestWire(pn), wd = U.q(db * (p.w === 'best' ? 1 : p.w === 'small' ? 0.9 : 1.12), 0.001);
      const es = -(15 + 11 * pn), dmR = d <= 22.4 ? Math.sqrt(11.2 * 22.4) : Math.sqrt(22.4 * 45), Td2 = 90 * Math.pow(pn, 0.4) * Math.pow(dmR, 0.1); // grade 6, d = geometric mean of the size range
      const d2n = P.d2(d, pn); const Etrue = d2n + (es - Td2 * (0.1 + 1.15 * r())) / 1000; const halfA = 30 + (12 * U.gauss(r)) / 60; // flank half-angle with error (minutes)
      const ha = rad(halfA); const Mtrue = Etrue + wd * (1 + 1 / Math.sin(ha)) - pp / 2 / Math.tan(ha); // exact over-wire dimension for the actual half-angle
      const S = U.q(d - 2 + 0.002 * U.gauss(r), 0.0001); // certified standard cylinder
      const R1 = U.q(6 + 3 * r(), 0.001); const R2 = U.q(R1 + (Mtrue - S) + 0.0008 * U.gauss(r), 0.001); const Dmaj = d - (0.03 + 0.15 * r()) * (pn / 2.5) * 0.3 - Math.abs(es) / 1000; const R3 = U.q(R1 + (Dmaj - S) + 0.0008 * U.gauss(r), 0.001);
      const Mm = S + (R2 - R1), Tm = Mm - 2 * wd, Pc = 0.866025 * pn - wd, Em = Tm + Pc, Dm = S + (R3 - R1);
      const up = d2n + es / 1000, lo = up - Td2 / 1000; const ok = Em <= up + 1e-9 && Em >= lo - 1e-9;
      const T = { d, p: pn, db, wd, S, R1, R2, R3, M: Mm, Tm, Pc, E: Em, Dm, Etrue, halfA, up, lo, ok, es, Td2, d2n, errE: (Em - Etrue) * 1000 };
      return {
        truth: T, dur: 9,
        readout(f) { const st = f < 0.3 ? 0 : f < 0.8 ? 1 : 2; return [['Setting', ['cylinder', 'wires', 'crests'][st], ''], ['Micrometer', st === 1 ? 'see picture' : U.f([R1, R2, R3][st], 3), 'mm'], ['Wire d', U.f(wd, 3), 'mm'], ['Pitch', pn, 'mm'], ['Cylinder S', U.f(S, 4), 'mm']]; },
        specimen: [['Thread', `M${d} × ${pn}, external, class 6g`, ''], ['Basic effective diameter d₂ = d − 0.6495p', U.f(d2n, 4), 'mm'], ['Standard cylinder diameter S (certificate)', U.f(S, 4), 'mm'], ['Wire diameter d (measured)', U.f(wd, 3), 'mm'], ['Wire set', WSET[p.w], ''], ['Micrometer head resolution', '0.001', 'mm']],
        obs: [{ title: 'Table 1. Floating carriage micrometer readings (fiducial indicator at its index each time)', cols: ['Setting', 'Micrometer reading (mm)'], textCols: [0], rows: [['R₁: over the standard cylinder', U.f(R1, 3)], ['R₂: over the two wires (mean of three positions)', '<b>see picture</b>'], ['R₃: over the thread crests (major diameter)', U.f(R3, 3)]], note: 'The micrometer head reads relative positions: dimensions follow from the standard cylinder, e.g. M = S + (R₂ − R₁).' }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth; el.innerHTML = M.readPanel('Read the micrometer head', 'Vernier micrometer head, 0.001 mm: sleeve + thimble × 0.01 + coinciding vernier line × 0.001 mm.', [{ svg: M.micrometerSVG(T.R2, { vernier: true }), cap: 'R₂: over the wires', wide: true }]); },
    expHint: 'Best wire d_b = p/(2 cos 30°) = 0.57735p. Over wires M = S + (R₂ − R₁). Under wires T = M − 2d. For a 60° thread P = 0.86603p − d. Effective diameter E = T + P. Major diameter D = S + (R₃ − R₁). Class 6g: upper limit of d₂ = basic d₂ + es, es = −(15 + 11p) µm; T_d2 = 90p^0.4 d^0.1 µm with d the geometric mean of the size range.',
    calcs(sim) { const T = sim.truth; return [
      { key: 'db', label: 'Best-size wire diameter', unit: 'mm', truth: T.db, abs: 0.0006, fmt: v => U.f(v, 4) },
      { key: 'r2', label: 'Micrometer reading over the wires R₂', unit: 'mm', truth: T.R2, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'm', label: 'Dimension over the wires M', unit: 'mm', truth: T.M, abs: 0.0008, fmt: v => U.f(v, 4) },
      { key: 't', label: 'Dimension under the wires T = M − 2d', unit: 'mm', truth: T.Tm, abs: 0.0008, fmt: v => U.f(v, 4) },
      { key: 'p', label: 'Constant P = 0.86603p − d', unit: 'mm', truth: T.Pc, abs: 0.0005, fmt: v => U.f(v, 4) },
      { key: 'e', label: 'Effective diameter E', unit: 'mm', truth: T.E, abs: 0.001, fmt: v => U.f(v, 4) },
      { key: 'dm', label: 'Major diameter', unit: 'mm', truth: T.Dm, abs: 0.001, fmt: v => U.f(v, 4) },
      { key: 'ok', label: 'Is the effective diameter within class 6g?', type: 'select', options: ['Yes', 'No'], truth: T.ok ? 'Yes' : 'No' }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Effective diameter, class 6g', unit: 'mm', value: T.E, lo: T.lo, hi: T.up, src: `ISO 965: es = ${U.f(T.es, 1)} µm, T_d2 = ${U.f(T.Td2, 0)} µm`, fmt: v => U.f(v, 4) }, { label: 'Error of E from flank-angle error', unit: 'µm', value: T.errE, lo: -2, hi: 2, src: p.w === 'best' ? 'Best wire: insensitive to flank angle' : 'Non-best wire picks up flank-angle error', fmt: v => U.f(v, 1) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Wire size and flank angle</h4></div><p class="muted" style="font-size:.86rem">This thread’s actual flank half-angle is ${U.f(T.halfA, 3)}° (nominal 30°). The formula P = 0.866p − d assumes exactly 30°. With best-size wires (${U.f(T.db, 4)} mm) the wires touch the flanks on the pitch line, and a flank-angle error hardly changes the dimension over the wires: here the effective diameter is in error by ${U.f(T.errE, 1)} µm. ${p.w === 'best' ? 'Try the undersize or oversize wires: the contact points move off the pitch line and the flank-angle error appears in the result.' : 'With these wires the contact points are off the pitch line, so the flank-angle error enters the result directly.'} Class 6g limits for d₂: ${U.f(T.lo, 4)} to ${U.f(T.up, 4)} mm.</p></div>`; },
    sample(sim) { const T = sim.truth; return `<div class="eq">d_b = p/(2 cos 30°) = ${T.p}/1.7321 = <b>${U.f(T.db, 4)} mm</b>; wires used d = ${U.f(T.wd, 3)} mm</div><div class="eq">M = S + (R₂ − R₁) = ${U.f(T.S, 4)} + (${U.f(T.R2, 3)} − ${U.f(T.R1, 3)}) = <b>${U.f(T.M, 4)} mm</b>; T = M − 2d = <b>${U.f(T.Tm, 4)} mm</b></div><div class="eq">P = 0.86603 × ${T.p} − ${U.f(T.wd, 3)} = <b>${U.f(T.Pc, 4)} mm</b>; E = T + P = <b>${U.f(T.E, 4)} mm</b></div><div class="eq">Major diameter = S + (R₃ − R₁) = ${U.f(T.S, 4)} + (${U.f(T.R3, 3)} − ${U.f(T.R1, 3)}) = <b>${U.f(T.Dm, 4)} mm</b></div><div class="eq">6g: upper = ${U.f(T.d2n, 4)} + (${U.f(T.es, 1)})/1000 = ${U.f(T.up, 4)} mm; lower = upper − ${U.f(T.Td2, 0)}/1000 = ${U.f(T.lo, 4)} mm → ${T.ok ? 'within' : 'outside'}</div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Dimension over wires M', expr: '√[u_S² + 2(0.001/√12)² + (0.8 µm repeatability)²]', val: T.M, u: M.rss(0.0005, Math.SQRT2 * M.uRes(0.001), 0.0008), unit: 'mm' }, { q: 'Wire diameter', expr: '0.5 µm/√3 (calibrated wires)', val: T.wd, u: 0.0005 / Math.sqrt(3), unit: 'mm' }, { q: 'Effective diameter E = M − 3d + 0.866p', expr: '√[u_M² + (3u_d)² + (0.866 u_p)²]', val: T.E, u: M.rss(M.rss(0.0005, Math.SQRT2 * M.uRes(0.001), 0.0008), 3 * 0.0005 / Math.sqrt(3), 0.866 * 0.0005), unit: 'mm' }]; },
    conclude(sim, p) { const T = sim.truth; return `For the M${T.d} × ${T.p} thread, measured with ${WSET[p.w].toLowerCase()} (${U.f(T.wd, 3)} mm), the dimension over the wires was ${U.f(T.M, 4)} mm and under the wires ${U.f(T.Tm, 4)} mm. With P = ${U.f(T.Pc, 4)} mm the effective diameter is ${U.f(T.E, 4)} mm, ${T.ok ? 'within' : 'outside'} the class 6g limits ${U.f(T.lo, 4)}–${U.f(T.up, 4)} mm. The major diameter is ${U.f(T.Dm, 4)} mm.`; },
    summary: 'The effective (pitch) diameter of a thread is the diameter of the imaginary cylinder on which the width of the thread ridge equals the width of the groove; it decides how well a screw and nut fit. It is measured by placing wires of known diameter in the grooves and measuring over them. A floating carriage micrometer, whose carriage floats freely on balls so that only a fiducial-indicator force acts, is first set on a standard cylinder of known diameter S; the dimension over the wires is then M = S + (R₂ − R₁). For a 60° thread the effective diameter is E = (M − 2d) + (0.866p − d). Wires of the best size, p/(2 cos 30°), touch the flanks at the pitch line, which makes the result insensitive to errors in the flank angle.',
    formulas: [['Basic effective diameter (ISO metric)', 'd₂ = d − 0.649 52 p'], ['Best-size wire', 'd_b = p/(2 cos(α/2)) = 0.577 35 p  (α = 60°)'], ['Dimension over wires', 'M = S + (R₂ − R₁)'], ['Dimension under wires', 'T = M − 2d'], ['Effective diameter (60°)', 'E = T + P,  P = 0.866 03 p − d  (≡ M − 3d + 0.866p)'], ['General form', 'E = M − d[1 + cosec(α/2)] + (p/2) cot(α/2)'], ['Class 6g', 'es = −(15 + 11p) µm;  T_d2 = 90 p^0.4 d^0.1 µm']],
    theory: `<h3>Elements of a screw thread</h3><p>A metric thread has a 60° included angle. Its major diameter d is the crest diameter, its minor diameter the root diameter, and its pitch p the axial distance between corresponding points of adjacent threads. The effective or pitch diameter d<sub>2</sub> is where the thread ridge and the groove have equal widths, p/2; for the ISO basic profile d<sub>2</sub> = d − 0.6495p. The fit between a bolt and a nut, and the load each flank carries, depends on the effective diameter far more than on the major diameter.</p>
      <h3>The floating carriage micrometer</h3><p>The bench (floating carriage) micrometer has a micrometer head on one side and a fiducial indicator on the other, both on a carriage that floats on balls at right angles to the work, which is held between centres. Every reading is taken with the fiducial indicator at its index, so the measuring force is always the same. The instrument is used as a comparator: it is first read over a standard cylinder of certified diameter S close to the size being measured (reading R<sub>1</sub>), then over the work (R<sub>2</sub>); the size of the work is S + (R<sub>2</sub> − R<sub>1</sub>).</p>
      <h3>The two-wire method</h3><p>Two wires of equal, known diameter d are placed in opposite grooves of the thread and the micrometer is read over them, giving the dimension over the wires M. Subtracting the wire diameters gives T = M − 2d, the dimension under the wires. Geometry of the wire seated against two 60° flanks then gives E = T + P, with P = 0.866p − d. The three-wire method, with two wires on one side and one on the other, uses the same geometry: E = M − 3d + 0.866p.</p>
      <h3>The best-size wire</h3><p>A wire of diameter d<sub>b</sub> = p/(2 cos 30°) = 0.577p touches the flanks exactly at the pitch line. Then a small error in the flank angle does not shift the wire, and the calculated effective diameter is correct even if the angle is wrong. A larger or smaller wire touches higher or lower on the flanks, and a flank-angle error changes M, so the result is in error. Matched sets of wires, calibrated to ±0.25 µm, are kept for each pitch.</p>
      <h3>Tolerances</h3><p>ISO 965 specifies tolerance classes. For an external thread of class 6g the effective diameter must lie between d<sub>2</sub> + es and d<sub>2</sub> + es − T<sub>d2</sub>, with fundamental deviation es = −(15 + 11p) µm and tolerance T<sub>d2</sub> = 90p<sup>0.4</sup>d<sup>0.1</sup> µm for grade 6.</p>`,
    procedure: ['Mount the standard cylinder between the centres; bring the fiducial indicator to its index and read the micrometer head (R₁).', 'Replace the cylinder by the threaded specimen.', 'Hang one wire in a groove on each side, directly opposite (the wires are usually hung from a stand on threads).', 'Bring the carriage up, set the fiducial indicator to its index and read the micrometer (R₂); repeat at three positions along the thread and average.', 'Remove the wires and read over the crests (R₃) for the major diameter.', 'Calculate M, T, P, E and D, and compare with the class 6g limits.'],
    precautions: ['Use wires of the best size for the pitch; record the measured wire diameter.', 'Always read with the fiducial indicator at its index (constant force).', 'Make sure the wires sit in diametrically opposite grooves and are not twisted.', 'Clean the thread and the wires; grit sits between wire and flank.', 'Handle the standard cylinder and the work with gloves to avoid heating them.'],
    applications: ['Inspection of thread plug and ring gauges.', 'Quality control of precision lead screws and fasteners.', 'Checking thread rolling and grinding set-ups.', 'Calibration of thread measuring wires and setting plugs.'],
    errors: ['Wire diameter error (counts three times in E).', 'Flank-angle error with non-best wires.', 'Pitch error (shifts the wires axially).', 'Standard cylinder diameter error.', 'Measuring force variation (fiducial not at index).', 'Elastic deformation of wires and flanks.'],
    discussion: ['Why does the effective diameter, not the major diameter, decide whether a bolt fits its nut?', 'Why are best-size wires used? Compare your result with that from undersize wires.', 'An error of 1 µm in the wire diameter changes E by how much? Why?', 'What is the role of the standard cylinder in a floating carriage micrometer?'],
    refs: ['ISO 965-1:2013, ISO general purpose metric screw threads. Tolerances. Part 1: Principles and basic data.', 'IS 4218 (Parts 1–6), ISO general purpose metric screw threads.', 'BS 3643, ISO metric screw threads.', 'NPL, Notes on Screw Gauges, HMSO.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 11.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 12.'],
    pre: [
      { q: 'The effective diameter of a thread is where', o: ['The crests are', 'The ridge and groove widths are equal', 'The roots are', 'The wires touch the crests'], a: 1, why: 'Definition of pitch (effective) diameter.' },
      { q: 'The best-size wire for a 60° thread of pitch p is', o: ['0.866p', '0.577p', '0.5p', 'p'], a: 1, why: 'p/(2 cos 30°).' },
      { q: 'A floating carriage micrometer is used as a', o: ['Direct reading instrument only', 'Comparator with a standard cylinder', 'Profile projector', 'Height gauge'], a: 1, why: 'It compares the work with a setting cylinder.' },
      { q: 'The fiducial indicator ensures', o: ['Correct temperature', 'Constant measuring force', 'Correct pitch', 'Alignment of centres'], a: 1, why: 'Every reading at the same index.' },
      { q: 'The basic effective diameter of M20 × 2.5 is about', o: ['17.29 mm', '18.38 mm', '19.35 mm', '16.93 mm'], a: 1, why: '20 − 0.6495 × 2.5 = 18.376 mm.' }
    ],
    post: [
      { q: 'S = 18.0000, R₁ = 7.250, R₂ = 9.643 mm. M =', o: ['16.393 mm', '20.393 mm', '18.000 mm', '25.393 mm'], a: 1, why: '18 + 2.393.' },
      { q: 'p = 2.5, d = 1.443 mm. P =', o: ['2.165 mm', '0.722 mm', '0.577 mm', '1.443 mm'], a: 1, why: '0.866 × 2.5 − 1.443 = 0.722.' },
      { q: 'An error of 1 µm in the wire diameter changes E by about', o: ['1 µm', '3 µm', '0.5 µm', '6 µm'], a: 1, why: 'E = M − 3d + 0.866p.' },
      { q: 'With best-size wires, a flank-angle error of 10′', o: ['Gives a large error in E', 'Has almost no effect on E', 'Changes the pitch', 'Changes the major diameter'], a: 1, why: 'Contact at the pitch line.' },
      { q: 'For M20 × 2.5, 6g, es is', o: ['−15 µm', '−42.5 µm', '+42.5 µm', '−27.5 µm'], a: 1, why: '−(15 + 11 × 2.5).' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Dimension over the wires from the exact wire–flank geometry with the thread’s actual flank half-angle (±12′); ISO 965-1 basic profile and 6g limits; comparator readings relative to a certified cylinder. Best-wire insensitivity to flank angle is reproduced exactly.', 'ISO 965-1; NPL Notes on Screw Gauges; Galyer & Shotbolt Ch. 11'];
  LAB.NOMEN[ID] = [['d', 'Major (nominal) diameter of the thread; also wire diameter where stated', 'mm'], ['p', 'Pitch', 'mm'], ['d₂, E', 'Effective (pitch) diameter: basic and measured', 'mm'], ['d_b', 'Best-size wire diameter', 'mm'], ['S', 'Diameter of the standard cylinder', 'mm'], ['R₁, R₂, R₃', 'Micrometer readings over cylinder, wires and crests', 'mm'], ['M', 'Dimension over the wires', 'mm'], ['T', 'Dimension under the wires', 'mm'], ['P', 'Constant for the wire and thread form', 'mm'], ['α', 'Included thread angle (60°)', '°'], ['es, T_d2', 'Fundamental deviation and tolerance of d₂', 'µm']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Mount the standard cylinder between centres', note: s => `S = ${U.f(s.truth.S, 4)} mm (certificate)`, why: 'The comparator is set on the standard before any thread is measured.',
      draw(L, u, c) { c.show('cyl', true); c.show('thr', false); c.op('cyl', E(u)); L.innerHTML = ''; } },
    { op: 1, d: 2.2, title: 'Read over the cylinder with the fiducial at index (R₁)', note: s => `R₁ = ${U.f(s.truth.R1, 3)} mm`, why: 'R₁ is the reference for all later readings.',
      draw(L, u, c) { c.txt('dR', U.f(c.sim.truth.R1 * E(u), 3)); L.innerHTML = c.active ? tag(330, 100, 'fiducial at index', 300, 84) : ''; } },
    { op: 2, d: 2.4, title: 'Mount the thread and hang the wires in opposite grooves', note: (s, p) => `${WSET[p.w]}: d = ${U.f(s.truth.wd, 3)} mm`, why: 'Wires are placed once the thread replaces the cylinder.',
      draw(L, u, c) { c.show('cyl', false); c.show('thr', true); c.show('wires', u > 0.3); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Setting on a cylinder', lines: [
      ['The floating carriage micrometer is first read over a standard cylinder of known diameter.', { s: 0 }],
      ['Every reading is taken with the small fiducial indicator on its mark, so the measuring force is always the same.', { s: 1 }],
      ['Then the thread takes the cylinder’s place, and two wires are hung in opposite grooves.', { s: 2 }]],
      q: { q: 'Why read over a standard cylinder first?', o: ['To warm up the micrometer', 'So that sizes come from the certified cylinder, not from the micrometer’s absolute zero', 'To check the pitch', 'To clean the anvils'], a: 1, why: 'The micrometer is used as a comparator against a traceable standard.' } },
    { title: 'Over the wires', lines: [
      ['The micrometer is read over the two wires. The difference from the cylinder reading gives the dimension over the wires.', { r: [0.3, 0.8] }],
      ['Then over the crests, which gives the major diameter.', { r: [0.8, 1] }],
      ['Subtract two wire diameters: the dimension under the wires.', null]],
      q: { q: 'M = 20.393 mm with 1.443 mm wires. T =', o: ['18.950 mm', '17.507 mm', '21.836 mm', '19.672 mm'], a: 0, why: 'T = M − 2d = 20.393 − 2.886.' } },
    { title: 'Why best-size wires', lines: [
      ['Add P, which is point eight six six times the pitch minus the wire diameter, and you have the effective diameter.', null],
      ['A best-size wire touches the flanks exactly at the pitch line. Then even a wrong flank angle does not move it.', null],
      ['With other wires, a flank-angle error creeps into the answer.', null]],
      q: { q: 'For a 3 mm pitch, the best wire is about', o: ['1.50 mm', '1.73 mm', '2.60 mm', '3.00 mm'], a: 1, why: '0.57735 × 3 = 1.732 mm.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard. Fine wires are easily lost and can prick fingers.', 'Specimens between centres can drop if the tailstock is released.'],
    ppe: ['Gloves for handling the cylinder and specimens'],
    rules: ['Support the specimen when releasing the centres.', 'Keep the wires on their stand when not in use.', 'Do not force the micrometer; use the fiducial indicator.'],
    emerg: ['Report a damaged wire set; do not use mixed wires.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Floating carriage micrometer', 'Micrometer head 0.001 mm, fiducial indicator', 'Comparator'], ['Standard cylinder', 'Ø 18, 22, 28 mm; certified to ±0.5 µm', 'Setting'], ['Thread wires', 'Best size for 2.5, 3, 3.5 mm pitch; ±0.25 µm', 'Contact on the pitch line'], ['Thread specimens', 'M20×2.5, M24×3, M30×3.5, class 6g', 'Work'], ['Wire stand', '—', 'Hangs wires in the grooves']], note: 'Thread prisms (V-pieces) are used instead of wires to measure the minor diameter.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const pp = Pk(r, [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4]), ans = pp / (2 * Math.cos(Math.PI / 6)); return { title: 'Best-size wire', q: `Find the best-size wire for a 60° metric thread of pitch ${pp} mm.`, ans, unit: 'mm', hints: ['d_b = p/(2 cos 30°).', 'cos 30° = 0.866.'], sol: `d_b = ${pp}/(2 × 0.86603) = <b>${s(ans)} mm</b>.` }; },
    r => { const th = Pk(r, [['M16', 16, 2], ['M20', 20, 2.5], ['M24', 24, 3], ['M30', 30, 3.5]]), dw = +P.bestWire(th[2]).toFixed(3), E0 = P.d2(th[1], th[2]) - R(r, 0.04, 0.15, 3), M_ = E0 + 3 * dw - 0.866025 * th[2], ans = M_ - 3 * dw + 0.866025 * th[2]; return { title: 'Three-wire method', q: `For an ${th[0]} × ${th[2]} thread measured with ${dw} mm wires, the dimension over three wires is ${s(M_, 7)} mm. Find the effective diameter.`, ans, unit: 'mm', hints: ['E = M − 3d + 0.866p.', `0.866p = ${s(0.866025 * th[2])}.`], sol: `E = ${s(M_, 7)} − 3 × ${dw} + 0.86603 × ${th[2]} = <b>${s(ans, 7)} mm</b>.` }; },
    r => { const S = Pk(r, [16, 18, 22]), R1 = R(r, 5, 9, 3), dR = R(r, 1.5, 3.2, 3), dw = Pk(r, [1.155, 1.443, 1.732]), pp = +(dw / 0.57735).toFixed(2), M_ = S + dR, ans = M_ - 2 * dw + 0.866025 * pp - dw; return { title: 'Two-wire method', q: `A floating carriage micrometer reads ${R1} mm over a ${S} mm standard cylinder and ${s(R1 + dR, 6)} mm over two ${dw} mm wires on a thread of pitch ${pp} mm. Find the effective diameter.`, ans, unit: 'mm', hints: ['M = S + (R₂ − R₁); T = M − 2d.', 'E = T + 0.866p − d.'], sol: `M = ${S} + ${s(dR, 4)} = ${s(M_, 6)}; T = ${s(M_ - 2 * dw, 6)}; P = ${s(0.866025 * pp - dw, 5)}; E = <b>${s(ans, 6)} mm</b>.` }; }
  ];
})();
