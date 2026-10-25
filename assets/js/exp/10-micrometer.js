/* Exp 10 — Calibration of an outside micrometer with gauge blocks (slip gauges). */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'micrometer';
  const BLK = [2.5, 5.1, 7.7, 10.3, 12.9, 15.0, 17.6, 20.2, 22.8, 25.0]; // ISO 3611 test lengths: different angular positions of the thimble
  const COND = { good: { name: 'Micrometer in regular use, recently cleaned', z: 1.2, pitch: 0.06, per: 0.45 }, worn: { name: 'Micrometer with a worn spindle thread', z: 2.0, pitch: 0.22, per: 1.3 } };
  const MPE = 3; // µm, manufacturer’s specification assumed for this micrometer

  LAB.register({
    id: ID, no: 10, cat: 'lin', title: 'Calibration of a Micrometer using Slip Gauges', std: 'ISO 3611 / IS 2967 / ISO 3650', short: 'A 0–25 mm vernier micrometer (0.001 mm) is checked at zero and at ten gauge-block lengths chosen to test the whole screw. You read the thimble and vernier yourself, then find the zero error, indication errors and the error curve of the screw.', tags: 'micrometer calibration slip gauges gauge blocks least count vernier zero error indication error screw pitch error ISO 3611 ratchet thermal expansion optical flat',
    aim: 'To calibrate an outside micrometer against gauge blocks: to determine its zero error, its indication error at lengths covering the whole travel and the angular positions of the thimble, and to decide whether it is within its permissible error.',
    objectives: ['Read a vernier micrometer to 0.001 mm.', 'Determine the zero error with the anvils closed.', 'Measure gauge blocks of certified length and calculate the indication error at each.', 'Separate zero error from progressive and periodic errors of the screw.', 'Explain why the test lengths are not round numbers, and the effect of hand heat.'],
    apparatus: ['Outside micrometer 0–25 mm with sleeve vernier, least count 0.001 mm, ratchet stop', 'Gauge-block set for micrometer testing: 2.5, 5.1, 7.7, 10.3, 12.9, 15.0, 17.6, 20.2, 22.8 and 25.0 mm, grade 1 (ISO 3650)', 'Optical flat (for anvil flatness) and optical parallels', 'Micrometer stand with insulated clamp', 'Lint-free tissue and cleaning spirit'],
    stdNote: 'ISO 3611 specifies the test lengths 2.5, 5.1, 7.7, 10.3, 12.9, 15, 17.6, 20.2, 22.8 and 25 mm: with a 0.5 mm pitch they place the thimble at different angles, so periodic errors of the screw are found as well as progressive ones. Gauge blocks of grade 1 deviate from nominal by at most ±0.2–0.3 µm for these lengths (ISO 3650).',
    params: [
      { id: 'cond', label: 'Micrometer', type: 'select', options: Object.entries(COND).map(([k, v]) => [k, v.name]), def: 'good' },
      { id: 'hold', label: 'How the micrometer is held', type: 'select', options: [['stand', 'In a stand with an insulated clamp'], ['hand', 'Held in the hand throughout']], def: 'stand' },
      { id: 'rat', label: 'Measuring force', type: 'select', options: [['rat', 'Ratchet stop used (constant force)'], ['thim', 'Turned by the thimble (force varies)']], def: 'rat' }
    ],
    opSteps: ['Clean the anvil faces and the gauge blocks', 'Check the anvil faces for flatness with the optical flat', 'Close the anvils with the ratchet and read the zero', 'Measure each gauge block in turn, using the ratchet', 'Record each reading to 0.001 mm', 'Clean, oil lightly and put away the blocks'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        <path d="M60 80 C 60 230, 150 250, 220 250 L 260 250 L 260 220 L 220 220 C 170 220, 92 210, 92 80 Z" class="mach"/>
        <rect x="70" y="70" width="24" height="26" class="steelD"/>${G.t(30, 66, 'anvil', 'm')}
        <g id="spin"><rect id="sp" x="120" y="74" width="180" height="18" class="steel"/><rect x="300" y="66" width="120" height="34" class="steel"/><rect id="thb" x="300" y="62" width="70" height="42" rx="3" class="mach2"/><rect x="370" y="70" width="28" height="26" rx="3" class="acc"/></g>
        ${G.t(300, 120, 'sleeve / thimble / ratchet', 'm')}
        <rect id="blk" x="94" y="72" width="26" height="22" class="spec" style="display:none"/>${G.t(80, 140, '', 'm', 'id="blkt"')}
        <g id="flat" style="display:none"><rect x="64" y="40" width="40" height="80" rx="6" class="glass"/>${G.t(30, 34, 'optical flat', 'm')}</g>
        <g id="stand">${G.r(140, 230, 140, 14, 'mach2', 'rx="3"')}${G.t(150, 264, 'stand, insulated clamp', 'm')}</g>
        <g id="hand" style="display:none"><ellipse cx="200" cy="230" rx="60" ry="24" fill="#d9a77c" opacity=".8"/>${G.t(160, 270, 'hand: frame warms', 'm')}</g>
        <g transform="translate(400,170)">${G.r(0, 0, 144, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'READING (mm)', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '--.---', 'big', 'id="dR"')}</g>
        <g transform="translate(400,238)">${G.r(0, 0, 144, 50, 'disp', 'rx="4"')}${G.t(8, 14, 'GAUGE BLOCK', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 38, '—', 'big', 'id="dB"')}</g>`, 'Outside micrometer with anvil, spindle, thimble and ratchet, measuring a gauge block');
    },
    anim(svg, f, sim, p) {
      G.show(svg, 'stand', p.hold === 'stand'); G.show(svg, 'hand', p.hold === 'hand');
      if (!sim) { G.show(svg, 'blk', false); return; }
      const n = sim.rows.length, x = f * n, k = Math.min(n - 1, Math.floor(x)), rw = sim.rows[k], u = x - k;
      const w = 2 + rw.L * 1.6; G.show(svg, 'blk', rw.L > 0); G.set(svg, 'blk', 'width', String(w));
      const open = u < 0.3 ? (1 - u / 0.3) * 10 : 0; G.set(svg, 'spin', 'transform', `translate(${w - 26 + open} 0)`);
      G.txt(svg, 'dB', rw.L ? U.f(rw.L, 1) + ' mm' : 'none (zero)'); G.txt(svg, 'dR', u < 0.3 ? '--.---' : (rw.pic ? 'see picture' : U.f(rw.R, 3)));
    },
    liveView(el, f, sim, p, api) {
      const n = sim.rows.length, k = Math.min(n - 1, Math.floor(f * n)), done = sim.rows.slice(1, k + 1);
      api.title('Indication error'); api.sub(`${Math.max(0, k)} of ${n - 1} blocks`);
      G.profileView(el, { xlabel: 'Gauge block length (mm)', ylabel: 'Error = reading − block (µm)', series: [{ name: 'error', x: done.map(r => r.L), y: done.map(r => r.e), type: 'linepts', color: 's1' }], hlines: [{ y: MPE, label: '+' + MPE + ' µm', color: 'bad' }, { y: -MPE, label: '−' + MPE + ' µm', color: 'bad' }, { y: 0, color: 'muted' }], xmin: 0, xmax: 25, ymin: -6, ymax: 6, yzero: false }, 210);
    },
    simulate(p, r) {
      const C = COND[p.cond], z = C.z * U.gauss(r), b = C.pitch * U.gauss(r), a = C.per * (0.6 + 0.4 * r()), ps = 2 * Math.PI * r();
      const dev = BLK.map(() => U.q(0.12 * U.gauss(r), 0.01)); // certificate deviations of the blocks, µm
      const warm = p.hold === 'hand' ? 1 : 0, force = p.rat === 'rat' ? 0.25 : 1.4;
      const err = (L, i) => z + b * L + a * Math.sin(2 * Math.PI * L / 0.5 + ps) - a * Math.sin(ps) - warm * (0.15 + 0.17 * i) + force * U.gauss(r) * 0.6; // µm; frame warms block by block
      const rows = [{ L: 0, dv: 0 }, ...BLK.map((L, i) => ({ L, dv: dev[i] }))];
      rows.forEach((rw, i) => { const e = rw.L === 0 ? z + force * U.gauss(r) * 0.3 : err(rw.L, i); rw.R = U.q(rw.L + rw.dv / 1000 + e / 1000 + 0.3e-3 * U.gauss(r), 0.001); rw.e = (rw.R - rw.L - rw.dv / 1000) * 1000; });
      rows[0].pic = rows[3].pic = rows[7].pic = true;
      const Z = rows[0].R * 1000, es = rows.slice(1).map(x => x.e); const iM = es.reduce((bi, v, i) => Math.abs(v) > Math.abs(es[bi]) ? i : bi, 0);
      const span = Math.max(...es) - Math.min(...es); const pass = es.every(v => Math.abs(v) <= MPE + 1e-9);
      const T = { Z, rows, es, iM, emax: es[iM], span, pass, R77: rows[3].R, R176: rows[7].R, e176: rows[7].e };
      return {
        rows, truth: T, dur: 12,
        readout(f) { const n = rows.length, k = Math.min(n - 1, Math.floor(f * n)), x = rows[k]; return [['Block', x.L ? U.f(x.L, 1) : 'zero', x.L ? 'mm' : ''], ['Reading', x.pic ? 'see picture' : U.f(x.R, 3), 'mm'], ['Force', p.rat === 'rat' ? 'ratchet' : 'thimble', ''], ['Held', p.hold === 'hand' ? 'in hand' : 'in stand', ''], ['Point', `${k + 1}/${n}`, '']]; },
        plot: { title: 'Indication error of the micrometer', xlabel: 'Gauge block length (mm)', ylabel: 'Error (µm)', series: [{ name: 'indication error', x: rows.slice(1).map(x => x.L), y: es, type: 'linepts', color: 's1' }], hlines: [{ y: MPE, label: 'permissible', color: 'bad' }, { y: -MPE, color: 'bad' }, { y: 0, color: 'muted' }], yzero: false, caption: 'Error of the micrometer at each gauge block, with the permissible error' },
        specimen: [['Micrometer', COND[p.cond].name, ''], ['Range, least count', '0–25 mm, 0.001 mm', ''], ['Permissible indication error (manufacturer)', '±' + MPE, 'µm'], ['Gauge blocks', 'steel, grade 1, certificate deviations below', ''], ['Measuring force', p.rat === 'rat' ? 'ratchet (5–10 N)' : 'thimble, by feel', ''], ['Handling', p.hold === 'hand' ? 'held in the hand' : 'stand with insulated clamp', ''], ['Laboratory temperature', '20 ± 1', '°C']],
        obs: [{ title: 'Table 1. Micrometer readings', cols: ['Gauge block nominal (mm)', 'Certificate deviation (µm)', 'Reading (mm)'], rows: rows.map(x => [x.L ? U.f(x.L, 1) : '0 (anvils closed)', x.L ? U.f(x.dv, 2) : '—', x.pic ? '<b>see picture</b>' : U.f(x.R, 3)]), note: 'Actual block length = nominal + certificate deviation. Three readings are given as pictures of the micrometer: read them yourself.' }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth; el.innerHTML = M.readPanel('Read the vernier micrometer', 'Sleeve: millimetre lines above the datum, half-millimetre lines below. Thimble: 50 divisions of 0.01 mm. Vernier on the sleeve (10 lines in 9 thimble divisions): the vernier line that lines up exactly with a thimble line gives the thousandths of a millimetre. Reading = sleeve + thimble line just below the datum × 0.01 + vernier × 0.001 mm.', [{ svg: M.micrometerSVG(T.rows[0].R, { vernier: true }), cap: 'Anvils closed (zero)', wide: true }, { svg: M.micrometerSVG(T.R77, { vernier: true }), cap: 'On the 7.7 mm block', wide: true }, { svg: M.micrometerSVG(T.R176, { vernier: true }), cap: 'On the 17.6 mm block', wide: true }]); },
    calcs(sim) { const T = sim.truth; const dv = T.rows[7].dv; return [
      { key: 'z', label: 'Zero reading (anvils closed)', unit: 'mm', truth: T.rows[0].R, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'r77', label: 'Reading on the 7.7 mm block', unit: 'mm', truth: T.R77, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'r176', label: 'Reading on the 17.6 mm block', unit: 'mm', truth: T.R176, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'e176', label: `Indication error at 17.6 mm, reading − (nominal + ${U.f(dv, 2)} µm)`, unit: 'µm', truth: T.e176, abs: 0.6, fmt: v => U.f(v, 2) },
      { key: 'emax', label: 'Largest indication error over the ten blocks, with its sign', unit: 'µm', truth: T.emax, abs: 0.6, fmt: v => U.f(v, 2) },
      { key: 'span', label: 'Spread of the errors (largest − smallest): the screw’s own error, independent of zero', unit: 'µm', truth: T.span, abs: 0.6, fmt: v => U.f(v, 2) },
      { key: 'ok', label: `Is the micrometer within ±${MPE} µm at every test length?`, type: 'select', options: ['Yes', 'No'], truth: T.pass ? 'Yes' : 'No' }]; },
    reference(sim) { const T = sim.truth; return [{ label: 'Zero error', unit: 'µm', value: T.Z, lo: -2, hi: 2, src: 'Adjust zero if outside ±2 µm', fmt: v => U.f(v, 1) }, { label: 'Largest indication error', unit: 'µm', value: T.emax, lo: -MPE, hi: MPE, src: 'Manufacturer specification', fmt: v => U.f(v, 2) }, { label: 'Spread of errors', unit: 'µm', value: T.span, lo: 0, hi: 2, src: 'Screw of a good micrometer', fmt: v => U.f(v, 2) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Calibration certificate table</h4><span class="eyebrow">error and correction</span></div>${LAB.tableHTML({ cols: ['Block (mm)', 'Actual length (mm)', 'Reading (mm)', 'Error (µm)', 'Error − zero (µm)', 'Correction (µm)'], rows: T.rows.slice(1).map(x => [U.f(x.L, 1), U.f(x.L + x.dv / 1000, 5), U.f(x.R, 3), U.f(x.e, 2), U.f(x.e - T.Z, 2), U.f(-x.e, 2)]) })}<p class="muted" style="font-size:.84rem">Zero error ${U.f(T.Z, 1)} µm. After subtracting it, what remains is the error of the screw: a slope (progressive pitch error) and a wave that repeats every 0.5 mm turn (periodic error, from a bent spindle or eccentric thimble), which the ISO test lengths sample at different thimble angles. ${p.hold === 'hand' ? 'Holding the micrometer warmed the frame: the anvils move apart and the readings drift lower block by block, about 1 µm per °C over this frame.' : ''} ${p.rat === 'thim' ? 'Turning by the thimble gave an uneven measuring force; the scatter of the errors is visibly larger than with the ratchet.' : ''}</p></div>`; },
    sample(sim) { const T = sim.truth, x = T.rows[7]; return `<div class="eq">Zero reading = <b>${U.f(T.rows[0].R, 3)} mm</b>, zero error ${U.f(T.Z, 0)} µm</div><div class="eq">17.6 mm block: actual = 17.6 + ${U.f(x.dv, 2)} µm = ${U.f(x.L + x.dv / 1000, 5)} mm; reading ${U.f(x.R, 3)} mm; error = (${U.f(x.R, 3)} − ${U.f(x.L + x.dv / 1000, 5)}) × 1000 = <b>${U.f(x.e, 2)} µm</b></div><div class="eq">Largest error ${U.f(T.emax, 2)} µm at ${U.f(T.rows[T.iM + 1].L, 1)} mm; spread = ${U.f(Math.max(...T.es), 2)} − (${U.f(Math.min(...T.es), 2)}) = <b>${U.f(T.span, 2)} µm</b></div>`; },
    uncert(sim, p) { const T = sim.truth; const uR = M.rss(M.uRes(1), p.rat === 'rat' ? 0.3 : 0.9); return [{ q: 'Single reading', expr: '√[(1 µm/√12)² + s_force²]', val: 17.6, u: uR / 1000, unit: 'mm' }, { q: 'Gauge-block length', expr: 'grade 1 tolerance 0.3 µm/√3 (or certificate value)', val: 17.6, u: 0.3 / Math.sqrt(3) / 1000, unit: 'mm' }, { q: 'Indication error', expr: '√[u_R² + u_GB² + (α L ΔT)²], ΔT = 1 °C, Δα ≈ 1×10⁻⁶', val: Math.abs(T.e176) || 0.1, u: M.rss(uR, 0.3 / Math.sqrt(3), 17.6 * 1e-6 * 1e3), unit: 'µm' }]; },
    conclude(sim, p) { const T = sim.truth; return `The 0–25 mm vernier micrometer had a zero error of ${U.f(T.Z, 0)} µm. Over the ten ISO 3611 test lengths its largest indication error was ${U.f(T.emax, 1)} µm at ${U.f(T.rows[T.iM + 1].L, 1)} mm and the errors spread over ${U.f(T.span, 1)} µm. It ${T.pass ? 'is within' : 'exceeds'} the permissible error of ±${MPE} µm${T.pass ? '' : ' and needs adjustment or repair'}. ${p.hold === 'hand' ? 'Readings drifted low as hand heat expanded the frame; a stand with an insulated clamp should be used.' : ''}`; },
    summary: 'A micrometer converts the rotation of a precision screw into linear movement of the spindle: one turn of a 0.5 mm-pitch screw moves it 0.5 mm, and the 50 thimble divisions give 0.01 mm; a vernier on the sleeve subdivides this to 0.001 mm. It is calibrated against gauge blocks whose lengths are known to a fraction of a micrometre. The zero error is read with the anvils closed. Gauge blocks of the ISO 3611 test lengths (2.5, 5.1, 7.7 … 25 mm) are then measured with the ratchet; their non-round lengths place the thimble at different angles, so both progressive and periodic screw errors are sampled. The indication error is reading minus actual block length; it is compared with the permissible error.',
    formulas: [['Least count (thimble)', 'LC = pitch/number of thimble divisions = 0.5/50 = 0.01 mm'], ['Least count (with vernier)', 'LC = 0.01/10 = 0.001 mm'], ['Reading', 'R = sleeve + thimble × 0.01 + vernier × 0.001  (mm)'], ['Actual block length', 'L = nominal + certificate deviation'], ['Indication error', 'e = R − L'], ['Thermal error of the frame', 'Δ ≈ −α L_frame ΔT']],
    theory: `<h3>The micrometer principle</h3><p>A micrometer measures by the advance of a precision screw. The spindle is threaded with a pitch of 0.5 mm; the thimble, fixed to the spindle, carries 50 equal divisions round its edge, so one division corresponds to 0.5/50 = 0.01 mm. The sleeve carries a datum line with millimetre graduations above it and half-millimetre graduations below. A vernier of ten lines on the sleeve, spaced over nine thimble divisions, subdivides each thimble division into tenths, giving 0.001 mm.</p>
      <h3>Taking a reading</h3><p>Read the last fully visible millimetre line on the sleeve, add 0.5 mm if the half-millimetre line after it is visible, add the thimble division at (or just below) the datum line times 0.01 mm, and finally add the number of the vernier line that coincides exactly with a thimble line, times 0.001 mm. Always close the anvils with the ratchet stop, which slips at a set force (5–10 N), so that the measuring force is the same every time.</p>
      <h3>Errors of a micrometer</h3><p>The zero error is the reading with the anvils in contact; it is corrected by adjusting the sleeve. The screw has a progressive (cumulative) pitch error, which grows steadily along the travel, and periodic errors that repeat every revolution, from a bent spindle or an eccentric thimble. The anvil faces must be flat and parallel, which is checked with an optical flat (interference fringes) and optical parallels. Temperature matters: a 40 mm steel frame warmed by 3 °C from the hand expands by about 1.4 µm, which moves the anvils apart and makes the reading low.</p>
      <h3>Gauge blocks</h3><p>Gauge (slip) blocks are rectangular blocks of hardened steel or ceramic whose two measuring faces are lapped flat and parallel at a certified distance. They wring together into stacks. Grade K and 0 blocks are used for calibration of other blocks and instruments, grade 1 and 2 for inspection. For micrometer testing ISO 3611 specifies lengths 2.5, 5.1, 7.7, 10.3, 12.9, 15.0, 17.6, 20.2, 22.8 and 25 mm: each length advances the screw by a different fraction of a turn, so the thimble is tested at many angular positions.</p>
      <h3>Calibration</h3><p>The indication error at each length is the reading minus the actual length of the block (nominal plus certificate deviation). The largest error is compared with the permissible error. Subtracting the zero error from all errors shows the error of the screw itself.</p>`,
    procedure: ['Clean the anvil faces and gauge blocks with lint-free tissue and spirit; let everything soak at room temperature.', 'Check the anvil faces with an optical flat under daylight; count the fringes (each fringe ≈ 0.3 µm).', 'Mount the micrometer in the stand. Close the anvils with the ratchet (three clicks) and read the zero.', 'Insert each gauge block squarely between the anvils, close with the ratchet and read to 0.001 mm.', 'Record the readings with the block certificate deviations.', 'Calculate the indication errors and plot them against length.', 'Clean, oil the blocks lightly and return them to their case.'],
    precautions: ['Never handle gauge blocks with bare fingers longer than necessary; use tongs or gloves.', 'Always use the ratchet; never force the thimble.', 'Hold the micrometer in a stand or by its insulated pads.', 'Seat the block squarely; a tilted block reads long.', 'Allow blocks and micrometer to reach the same temperature (20 °C is the reference).'],
    applications: ['Periodic calibration of workshop micrometers under ISO 9001.', 'Acceptance testing of new micrometers.', 'Training in instrument reading and in the use of gauge blocks.', 'Establishing correction tables for precision work.'],
    errors: ['Reading (parallax, misreading the half-millimetre line).', 'Variation in measuring force.', 'Thermal expansion of frame and block.', 'Dirt or burrs on anvils and blocks.', 'Flatness and parallelism of the anvils.', 'Gauge-block deviation from nominal.'],
    discussion: ['Why are the test lengths 2.5, 5.1, 7.7 … rather than 5, 10, 15 …?', 'Separate the zero error from the screw error. Which one can the user correct easily?', 'What would happen to the readings if you held the micrometer in your hand for several minutes? Estimate the error.', 'How does the ratchet help repeatability?'],
    refs: ['ISO 3611:2010, Geometrical product specifications (GPS). Dimensional measuring equipment: Micrometers for external measurements. Design and metrological characteristics.', 'IS 2967:1983, Specification for external micrometers.', 'ISO 3650:1998, Geometrical product specifications (GPS). Length standards. Gauge blocks.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 4–6.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 3.'],
    pre: [
      { q: 'A micrometer has a 0.5 mm pitch and 50 thimble divisions. Its least count is', o: ['0.05 mm', '0.01 mm', '0.001 mm', '0.1 mm'], a: 1, why: '0.5/50 = 0.01 mm.' },
      { q: 'The ratchet stop is used to', o: ['Lock the spindle', 'Apply a constant measuring force', 'Set the zero', 'Speed up readings'], a: 1, why: 'It slips at a set torque.' },
      { q: 'Gauge blocks stick together by', o: ['Magnetism', 'Wringing: molecular adhesion of very flat, clean faces', 'Glue', 'Screws'], a: 1, why: 'Flat lapped faces with a thin film of oil wring.' },
      { q: 'The reference temperature for length measurement is', o: ['0 °C', '20 °C', '25 °C', '27 °C'], a: 1, why: 'ISO 1: 20 °C.' },
      { q: 'Zero error of a micrometer is measured with', o: ['The largest gauge block', 'The anvils closed (0–25 mm micrometer)', 'A vernier caliper', 'A dial indicator'], a: 1, why: 'A 0–25 mm micrometer reads zero with the anvils in contact.' }
    ],
    post: [
      { q: 'Sleeve shows 7.5 mm, thimble line 20 just below the datum, vernier line 4 coincides. Reading:', o: ['7.204 mm', '7.704 mm', '7.524 mm', '7.7004 mm'], a: 1, why: '7.5 + 0.20 + 0.004 = 7.704 mm.' },
      { q: 'A 12.9 mm block (deviation +0.10 µm) reads 12.902 mm. The error is about', o: ['+2.0 µm', '+1.9 µm', '−1.9 µm', '+0.2 µm'], a: 1, why: '12.902 − 12.9001 = 0.0019 mm.' },
      { q: 'A micrometer reads 0.002 mm with the anvils closed. A reading of 10.315 mm should be corrected to', o: ['10.317 mm', '10.313 mm', '10.315 mm', '10.215 mm'], a: 1, why: 'Subtract the zero error.' },
      { q: 'Errors that repeat every turn of the thimble are called', o: ['Progressive errors', 'Periodic errors', 'Zero errors', 'Parallax'], a: 1, why: 'They recur every 0.5 mm.' },
      { q: 'Warming the frame of a micrometer makes its readings', o: ['Higher', 'Lower, because the anvils move apart', 'Unchanged', 'Random'], a: 1, why: 'A larger gap must be closed by less spindle travel from zero.' }
    ]
  });

  LAB.VALID[ID] = ['p', 'Screw error modelled as zero error + progressive pitch error + periodic error per 0.5 mm turn (amplitudes typical of ISO 3611 class instruments); frame thermal drift α·L·ΔT when hand-held; force scatter larger without the ratchet. Readings drawn on a faithful sleeve, thimble and vernier scale.', 'ISO 3611; ISO 3650; Galyer & Shotbolt Ch. 3'];
  LAB.NOMEN[ID] = [['R', 'Micrometer reading', 'mm'], ['L', 'Actual gauge-block length (nominal + deviation)', 'mm'], ['e', 'Indication error, R − L', 'µm'], ['Z', 'Zero reading (anvils closed)', 'mm'], ['LC', 'Least count', 'mm'], ['MPE', 'Maximum permissible error', 'µm'], ['α', 'Coefficient of thermal expansion', '1/°C']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Clean the anvils and the gauge blocks', note: 'Lint-free tissue and spirit; blocks left to reach room temperature', why: 'Cleaning comes first; dirt on an anvil adds microns to every reading.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(120, 160, 'clean faces', 95, 84) : K.tick(140, 40); } },
    { op: 1, d: 2.4, title: 'Check anvil flatness with the optical flat', note: 'At most one or two fringes: flatness within 0.6 µm', why: 'Flatness is checked on clean anvils, before any measurement.',
      draw(L, u, c) { c.show('flat', c.active); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Close the anvils with the ratchet and read the zero', note: 'Three clicks of the ratchet', why: 'The zero is read after the anvils are checked and before blocks are measured.',
      draw(L, u, c) { c.set('spin', 'transform', `translate(${-26 + 10 * (1 - E(u))} 0)`); c.txt('dR', c.active ? '--.---' : 'see picture'); L.innerHTML = c.active ? tag(380, 30, 'ratchet', 384, 70) : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'A screw that measures', lines: [
      ['Inside the micrometer is a screw with a half-millimetre pitch. One full turn of the thimble moves the spindle half a millimetre.', { s: 0 }],
      ['Fifty lines round the thimble split that into hundredths. A small vernier on the sleeve splits each hundredth into ten.', { s: 1 }],
      ['First the anvils are closed with the ratchet. Whatever it reads now is the zero error.', { s: 2 }]],
      q: { q: 'Why use the ratchet instead of turning the thimble?', o: ['It is faster', 'It slips at a fixed force, so every reading uses the same measuring force', 'It locks the spindle', 'It sets the zero'], a: 1, why: 'Variable force squeezes the frame and the part differently each time.' } },
    { title: 'Ten gauge blocks', lines: [
      ['Gauge blocks of 2.5, 5.1, 7.7 millimetres and so on are measured one by one.', { r: [0, 0.5] }],
      ['These odd lengths make the thimble stop at a different angle each time, so errors that repeat every turn are caught.', { r: [0.5, 0.9] }],
      ['Each reading is compared with the block’s certified length.', { r: [0.9, 1] }]],
      q: { q: 'If all test blocks were whole multiples of 0.5 mm, you would', o: ['Find every error', 'Always test the same thimble angle and miss periodic errors', 'Need fewer blocks', 'Not need the zero'], a: 1, why: 'Multiples of the pitch bring the thimble back to the same position.' } },
    { title: 'Reading the error', lines: [
      ['Reading minus true length is the indication error at each block.', null],
      ['Take away the zero error and what is left belongs to the screw: a slope from pitch error and a wave from periodic error.', null],
      ['Hold the micrometer in your hand and the frame warms. The readings drift low.', null]],
      q: { q: 'The frame warms by 2 °C. Over a 40 mm steel frame the reading changes by about', o: ['0.1 µm', '1 µm, lower', '10 µm, higher', 'Nothing'], a: 1, why: '11.5×10⁻⁶ × 40 × 2 ≈ 0.9 µm; the anvils move apart so the reading falls.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard. Cleaning spirit is flammable.', 'Dropping gauge blocks damages them (not you).'],
    ppe: ['Nitrile gloves or tongs for gauge blocks'],
    rules: ['Work over a soft mat.', 'Keep spirit away from flames; close the bottle.', 'Never wring blocks without cleaning; never leave them wrung for long.', 'Oil blocks lightly before storing.'],
    emerg: ['Spirit in the eye: rinse at the eye-wash station.', 'Report any dropped or scratched block to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Vernier micrometer', '0–25 mm, 0.001 mm, ratchet', 'Instrument under test'], ['Gauge blocks', 'ISO 3611 test set, grade 1, steel', 'Reference lengths'], ['Optical flat', 'Ø 45 mm, flat to 0.1 µm', 'Anvil flatness'], ['Optical parallels', 'Set of four, 12.00–12.37 mm', 'Anvil parallelism at four thimble angles'], ['Micrometer stand', 'Insulated clamp', 'Avoids hand heat'], ['Cleaning kit', 'Spirit, lint-free tissue, block oil', '—']], note: 'A full ISO 3611 calibration also checks anvil parallelism with optical parallels at four thimble positions.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const sl = Math.floor(R(r, 1, 24, 0)), half = r() < 0.5 ? 0.5 : 0, th = Math.floor(R(r, 0, 49.9, 1)), vn = Math.floor(R(r, 0, 9.9, 1)), ans = sl + half + th * 0.01 + vn * 0.001; return { title: 'Reading a vernier micrometer', q: `On a vernier micrometer the last visible sleeve line is ${sl} mm${half ? ' with the half-millimetre line beyond it visible' : ' (the next half-millimetre line is not visible)'}, thimble line ${th} is just below the datum and vernier line ${vn} coincides with a thimble line. Find the reading.`, ans: ans || 0.001, unit: 'mm', hints: ['Sleeve + thimble × 0.01 + vernier × 0.001.', `Sleeve = ${sl + half} mm.`], sol: `${sl + half} + ${th} × 0.01 + ${vn} × 0.001 = <b>${s(ans, 6)} mm</b>.` }; },
    r => { const L = Pk(r, [5.1, 10.3, 15, 20.2, 25]), dv = R(r, -0.2, 0.2, 2), e = R(r, 0.5, 3.5, 1), Rd = L + dv / 1000 + e / 1000, ans = e; return { title: 'Indication error', q: `A ${L} mm gauge block with a certificate deviation of ${dv} µm gives a micrometer reading of ${s(Rd, 7)} mm. Find the indication error in µm.`, ans, unit: 'µm', hints: ['Actual length = nominal + deviation.', 'Error = reading − actual.'], sol: `Actual = ${L} + ${dv}×10⁻³ = ${s(L + dv / 1000, 7)} mm; e = (${s(Rd, 7)} − ${s(L + dv / 1000, 7)}) × 1000 = <b>${s(ans)} µm</b>.` }; },
    r => { const Lf = Pk(r, [30, 40, 60, 80]), dT = R(r, 1, 5, 1), a = 11.5, ans = a * Lf * dT / 1000; return { title: 'Hand heat', q: `The steel frame of a micrometer (α = ${a} × 10⁻⁶ /°C) has an effective length of ${Lf} mm between the anvils and warms by ${dT} °C in the hand. By how many µm does the anvil gap open?`, ans, unit: 'µm', hints: ['ΔL = α L ΔT.', 'Express in µm.'], sol: `ΔL = ${a}×10⁻⁶ × ${Lf} × ${dT} = ${s(ans / 1000)} mm = <b>${s(ans)} µm</b>.` }; }
  ];
})();
