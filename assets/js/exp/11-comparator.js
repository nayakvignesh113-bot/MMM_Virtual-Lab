/* Exp 11 — Inspection of a batch with a mechanical comparator set by slip gauges; ISO 286 limits; design of GO / NO-GO snap gauges. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'comparator';
  const D0 = 25;
  const CLS = { f7: 'f7 (running fit with H7 hole)', g6: 'g6 (sliding fit with H7 hole)', h7: 'h7 (location fit, zero fundamental deviation)' };

  LAB.register({
    id: ID, no: 11, cat: 'lin', title: 'Comparator Measurement with Slip Gauges and Design of Limit Gauges', std: 'ISO 286-1/-2 / IS 919 / IS 3455 (limit gauges)', short: 'A batch of Ø 25 mm pins is checked on a mechanical comparator set to the mean size with a wrung stack of slip gauges. You find the ISO 286 limits, build the stack, read the comparator, sort the batch and design the GO and NO-GO snap gauges by Taylor’s principle.', tags: 'comparator dial slip gauges gauge blocks wringing combination ISO 286 tolerance fit IT grade fundamental deviation limit gauge GO NO GO snap gauge taylor principle wear allowance gauge tolerance',
    aim: 'To inspect a batch of turned pins by comparison with a slip-gauge stack on a mechanical comparator, to decide which pins are within the ISO 286 limits, and to design GO and NO-GO snap gauges for the same shaft by Taylor’s principle.',
    objectives: ['Determine the limits of a shaft from ISO 286 tolerance grade and fundamental deviation tables.', 'Build a slip-gauge stack of a required size with the fewest blocks.', 'Set a comparator with the stack and read deviations to 1 µm.', 'Classify parts as accepted, oversize (rework) or undersize (reject).', 'Design GO and NO-GO snap gauges with gauge tolerance and wear allowance.'],
    apparatus: ['Mechanical (dial) comparator on a rigid stand with a serrated anvil, 1 µm per division, ±50 µm', 'Slip-gauge set M87, grade 1, with accessories', 'Batch of 10 turned pins, nominal Ø 25 mm', 'ISO 286-2 tables (Metrology Handbook, Limits and fits)', 'Cleaning kit, gloves'],
    stdNote: 'ISO 286 defines the tolerance grades IT1–IT18 and the fundamental deviations a–zc (shafts) and A–ZC (holes). IS 3455 (based on ISO/R 1938) gives limit-gauge tolerances; a widely taught simplified rule, used here, is gauge tolerance = 10 % of the work tolerance and wear allowance on the GO gauge = 10 % of the gauge tolerance, with both gauge zones inside the work tolerance.',
    params: [
      { id: 'cls', label: 'Shaft tolerance class (Ø 25 mm)', type: 'select', options: Object.entries(CLS), def: 'f7' },
      { id: 'proc', label: 'Turning process capability', type: 'select', options: [['ok', 'Capable lathe, centred on the tolerance'], ['drift', 'Tool wearing: sizes drifting upwards']], def: 'ok' }
    ],
    opSteps: ['Calculate the shaft limits and the mean size', 'Build the slip-gauge stack for the mean size and wring it', 'Set the comparator to zero on the stack', 'Re-check zero, then measure each pin under the plunger', 'Record the deviation of each pin', 'Re-check zero on the stack at the end', 'Clean and put away the slip gauges'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(60, 250, 300, 18, 'mach', 'rx="3"')}${G.r(80, 30, 26, 220, 'mach')}<rect id="arm" x="106" y="58" width="150" height="30" rx="4" class="mach2"/>
        <g id="headg"><circle cx="210" cy="60" r="34" class="mach"/><circle cx="210" cy="60" r="28" class="surf"/><line id="cn" x1="210" y1="60" x2="210" y2="36" stroke="var(--bad)" stroke-width="2"/><rect x="206" y="94" width="8" height="40" class="steelD"/></g>
        <g id="stack" style="display:none">${[0, 1, 2, 3, 4].map(i => `<rect x="${186}" y="${226 - i * 22}" width="48" height="22" class="steel" stroke="var(--line)"/>`).join('')}</g>
        <g id="pin" style="display:none"><rect x="160" y="200" width="100" height="50" rx="25" class="spec"/></g>
        ${G.t(120, 284, 'serrated anvil', 'm')}
        <g transform="translate(380,30)">${G.r(0, 0, 164, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'COMPARATOR (µm)', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dD"')}</g>
        <g transform="translate(380,110)">${G.r(0, 0, 164, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'ITEM UNDER PLUNGER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dI" style="font-size:12px"')}</g>
        <g transform="translate(380,190)">${G.r(0, 0, 164, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'TOLERANCE', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, 'Ø25 ' + p.cls, 'big', 'style="font-size:13px"')}</g>`, 'Mechanical comparator on a stand with a slip-gauge stack or a pin under the plunger');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.show(svg, 'stack', false); G.show(svg, 'pin', false); return; }
      const n = sim.items.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), it = sim.items[k];
      G.show(svg, 'stack', it.std); G.show(svg, 'pin', !it.std);
      const a = U.clamp(it.d, -55, 55) / 50 * 50 * Math.PI / 180; G.set(svg, 'cn', 'x2', 210 + Math.sin(a) * 24); G.set(svg, 'cn', 'y2', 60 - Math.cos(a) * 24);
      G.txt(svg, 'dD', it.pic ? 'see picture' : (it.d > 0 ? '+' : '') + U.f(it.d, 0)); G.txt(svg, 'dI', it.std ? 'slip-gauge stack' : 'pin ' + it.no);
    },
    liveView(el, f, sim, p, api) {
      const n = sim.items.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), done = sim.items.slice(0, k + 1).filter(x => !x.std);
      const T = sim.truth; api.title('Pin sizes against the limits'); api.sub(`${done.length} of 10 pins`);
      G.profileView(el, { xlabel: 'Pin number', ylabel: 'Diameter − 25 mm (µm)', series: [{ name: 'pins', x: done.map(x => x.no), y: done.map(x => x.dia * 1000 - 25000), type: 'scatter', color: 's1' }], hlines: [{ y: T.es, label: 'upper limit', color: 'bad' }, { y: T.ei, label: 'lower limit', color: 'bad' }, { y: (T.es + T.ei) / 2, label: 'setting', color: 'muted' }], xmin: 0, xmax: 11, ymin: T.ei - 25, ymax: T.es + 25, yzero: false }, 210);
    },
    simulate(p, r) {
      const dv = P.dev(D0, p.cls.slice(0, 1), +p.cls.slice(1)), es = dv.up, ei = dv.lo, mid = D0 + (es + ei) / 2000;
      const stack = P.slip(+mid.toFixed(4), 'M87'); const z0 = 0.4 * U.gauss(r);
      const pins = []; for (let i = 1; i <= 10; i++) { const drift = p.proc === 'drift' ? (i - 5.5) * 0.11 * (es - ei) : 0; const dia = mid + (drift + (es - ei) * 0.28 * U.gauss(r)) / 1000; pins.push({ no: i, dia: U.q(dia, 0.0001) }); }
      const items = [{ std: true, d: 0 }, ...pins.map(pn => ({ std: false, no: pn.no, dia: pn.dia, d: Math.round((pn.dia - mid) * 1000 + z0 + 0.4 * U.gauss(r)) })), { std: true, d: Math.round(z0 * 0.5) }];
      items[3].pic = items[8].pic = true;
      const UL = D0 + es / 1000, LL = D0 + ei / 1000, Tw = (es - ei) / 1000;
      const acc = items.filter(x => !x.std).map(x => { const D = mid + x.d / 1000; return D <= UL + 1e-9 && D >= LL - 1e-9 ? 'accept' : D > UL ? 'rework' : 'reject'; });
      const Tg = 0.1 * Tw, Wa = 0.1 * Tg; const GO = { hi: UL - Wa, lo: UL - Wa - Tg }, NOGO = { lo: LL, hi: LL + Tg };
      const T = { es, ei, UL, LL, mid, stack, nB: stack ? stack.length : 0, acc, nAcc: acc.filter(a => a === 'accept').length, nRw: acc.filter(a => a === 'rework').length, nRj: acc.filter(a => a === 'reject').length, Tw, Tg, Wa, GO, NOGO, dA: items[3].d, dB: items[8].d, IT: P.itv(D0, +p.cls.slice(1)) };
      return {
        items, truth: T, dur: 11,
        readout(f) { const n = items.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999)), x = items[k]; return [['Item', x.std ? 'stack' : 'pin ' + x.no, ''], ['Deviation', x.pic ? 'see picture' : (x.d > 0 ? '+' : '') + x.d, 'µm'], ['Setting', U.f(mid, 4), 'mm'], ['Upper limit', U.f(UL, 3), 'mm'], ['Lower limit', U.f(LL, 3), 'mm']]; },
        plot: { title: 'Batch against the tolerance zone', xlabel: 'Pin number', ylabel: 'Deviation from setting (µm)', series: [{ name: 'pins', x: items.filter(x => !x.std).map(x => x.no), y: items.filter(x => !x.std).map(x => x.d), type: 'scatter', color: 's1' }], hlines: [{ y: (es - ei) / 2, label: 'upper limit', color: 'bad' }, { y: -(es - ei) / 2, label: 'lower limit', color: 'bad' }, { y: 0, color: 'muted' }], xmin: 0, xmax: 11, yzero: false, caption: 'Comparator deviations of the ten pins with the limits of the tolerance zone' },
        specimen: [['Part', 'turned pin, Ø 25 ' + p.cls, ''], ['Comparator', 'dial, 1 µm/div, ±50 µm', ''], ['Slip-gauge set', 'M87, grade 1', ''], ['Temperature', '20 ± 1', '°C']],
        obs: [{ title: 'Table 1. Comparator readings (deviation from the setting stack, µm)', cols: ['Item', 'Reading (µm)'], textCols: [0], rows: items.map((x, i) => [x.std ? (i ? 'stack, final check' : 'stack, zero set') : 'pin ' + x.no, x.pic ? '<b>see picture</b>' : (x.d > 0 ? '+' : '') + x.d]) }],
        truth: T
      };
    },
    expExtra(el, sim, p) { const T = sim.truth; el.innerHTML = M.readPanel('Read the comparator', 'Scale: 1 µm per division, ±50 µm. Positive means the pin is larger than the slip-gauge stack.', [{ svg: M.compSVG(T.dA), cap: 'Pin 3' }, { svg: M.compSVG(T.dB), cap: 'Pin 8' }]); },
    expHint: 'From ISO 286 (Handbook, Limits and fits) find IT and the fundamental deviation for Ø 25 mm (size step 18–30 mm). Set the comparator at the mean of the limits. Gauge tolerance T_g = 10 % of the work tolerance; wear allowance W = 10 % of T_g, on the GO gauge only. Snap gauge: GO zone from (upper limit − W − T_g) to (upper limit − W); NO-GO zone from lower limit to (lower limit + T_g).',
    calcs(sim, p) { const T = sim.truth; return [
      { key: 'ul', label: `Upper limit of the shaft Ø 25 ${p.cls}`, unit: 'mm', truth: T.UL, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'll', label: 'Lower limit of the shaft', unit: 'mm', truth: T.LL, abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'nb', label: `Fewest M87 slip gauges to build the setting size ${U.f(T.mid, 4)} mm`, type: 'select', options: ['2', '3', '4', '5', '6'], truth: String(T.nB) },
      { key: 'da', label: 'Comparator reading for pin 3', unit: 'µm', truth: T.dA, abs: 0.6, fmt: v => U.f(v, 0) },
      { key: 'db', label: 'Comparator reading for pin 8', unit: 'µm', truth: T.dB, abs: 0.6, fmt: v => U.f(v, 0) },
      { key: 'na', label: 'Number of pins within the limits', unit: 'pins', truth: T.nAcc, abs: 0.1, fmt: v => U.f(v, 0) },
      { key: 'go', label: 'GO snap gauge: upper size of its zone (upper limit − W)', unit: 'mm', truth: T.GO.hi, abs: 0.0002, fmt: v => U.f(v, 4) },
      { key: 'ng', label: 'NO-GO snap gauge: upper size of its zone (lower limit + T_g)', unit: 'mm', truth: T.NOGO.hi, abs: 0.0002, fmt: v => U.f(v, 4) }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: `IT${p.cls.slice(1)} for 18–30 mm`, unit: 'µm', value: (T.es - T.ei), lo: T.IT, hi: T.IT, src: 'ISO 286-1 Table 1', fmt: v => U.f(v, 0), range: String(T.IT) }, { label: 'Zero check after the batch', unit: 'µm', value: sim.items[sim.items.length - 1].d, lo: -1, hi: 1, src: 'Setting must hold within ±1 µm', fmt: v => U.f(v, 0) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Batch decision and gauge design</h4></div>${LAB.tableHTML({ cols: ['Pin', 'Reading (µm)', 'Diameter (mm)', 'Decision'], textCols: [3], rows: sim.items.filter(x => !x.std).map((x, i) => [x.no, (x.d > 0 ? '+' : '') + x.d, U.f(T.mid + x.d / 1000, 4), T.acc[i] === 'accept' ? 'accept' : T.acc[i] === 'rework' ? 'oversize: rework' : 'undersize: reject'])})}
      <p style="font-size:.9rem;margin-top:8px">Slip-gauge stack for ${U.f(T.mid, 4)} mm: ${T.stack ? T.stack.map(b => U.f(b, 4).replace(/0+$/, '').replace(/\.$/, '')).join(' + ') : '—'} mm.</p>
      ${LAB.tableHTML({ cols: ['Gauge', 'Checks', 'Lower size (mm)', 'Upper size (mm)'], textCols: [0, 1], rows: [['GO snap gauge', 'maximum material limit (upper limit)', U.f(T.GO.lo, 4), U.f(T.GO.hi, 4)], ['NO-GO snap gauge', 'least material limit (lower limit)', U.f(T.NOGO.lo, 4), U.f(T.NOGO.hi, 4)]] })}
      <p class="muted" style="font-size:.84rem">Work tolerance ${U.f(T.Tw * 1000, 0)} µm; gauge tolerance T_g = ${U.f(T.Tg * 1000, 1)} µm; wear allowance W = ${U.f(T.Wa * 1000, 2)} µm. Both gauge zones lie inside the work tolerance, so a gauge can only reject a borderline good part, never accept a bad one. By Taylor’s principle the GO gauge checks all features at the maximum material condition at once (a full-form ring would be ideal; a snap gauge is a practical compromise), while the NO-GO gauge checks one dimension at a time at the least material condition.${p.proc === 'drift' ? ' The sizes drift upward through the batch as the tool wears: the lathe must be reset before the parts leave the tolerance.' : ''}</p></div>`; },
    sample(sim, p) { const T = sim.truth; return `<div class="eq">Ø 25 ${p.cls}: IT${p.cls.slice(1)} = ${T.IT} µm; es = ${T.es} µm, ei = ${T.ei} µm → limits <b>${U.f(T.UL, 3)}</b> and <b>${U.f(T.LL, 3)} mm</b></div><div class="eq">Setting size = mean = ${U.f(T.mid, 4)} mm = ${T.stack ? T.stack.map(b => U.f(b, 4).replace(/0+$/, '').replace(/\.$/, '')).join(' + ') : '—'} (${T.nB} blocks)</div><div class="eq">Pin 3: ${U.f(T.mid, 4)} + ${T.dA}/1000 = ${U.f(T.mid + T.dA / 1000, 4)} mm → ${T.acc[2]}</div><div class="eq">T_g = 0.1 × ${U.f(T.Tw * 1000, 0)} = ${U.f(T.Tg * 1000, 1)} µm; W = 0.1 T_g = ${U.f(T.Wa * 1000, 2)} µm; GO: ${U.f(T.GO.lo, 4)} – <b>${U.f(T.GO.hi, 4)}</b> mm; NO-GO: ${U.f(T.NOGO.lo, 4)} – <b>${U.f(T.NOGO.hi, 4)}</b> mm</div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Slip-gauge stack', expr: '√Σ u_i², grade 1: 0.2–0.3 µm per block /√3', val: T.mid, u: Math.sqrt(T.nB) * 0.25 / Math.sqrt(3) / 1000, unit: 'mm' }, { q: 'Comparator reading', expr: '√[(1 µm/√12)² + (0.4 µm repeatability)²]', val: 25, u: M.rss(M.uRes(1), 0.4) / 1000, unit: 'mm' }, { q: 'Pin diameter', expr: 'root-sum-square of the above', val: T.mid, u: M.rss(Math.sqrt(T.nB) * 0.25 / Math.sqrt(3), M.uRes(1), 0.4) / 1000, unit: 'mm' }]; },
    conclude(sim, p) { const T = sim.truth; return `For Ø 25 ${p.cls} the limits are ${U.f(T.UL, 3)} and ${U.f(T.LL, 3)} mm. The comparator was set to the mean size ${U.f(T.mid, 4)} mm with a stack of ${T.nB} M87 slip gauges. Of the ten pins, ${T.nAcc} were within the limits, ${T.nRw} oversize (rework) and ${T.nRj} undersize (reject). The GO snap gauge should be made between ${U.f(T.GO.lo, 4)} and ${U.f(T.GO.hi, 4)} mm and the NO-GO gauge between ${U.f(T.NOGO.lo, 4)} and ${U.f(T.NOGO.hi, 4)} mm.`; },
    summary: 'A comparator does not measure size directly; it shows the difference between the part and a standard of known size, magnified many times. Setting it with a stack of slip gauges equal to the mean size of the tolerance zone lets each part be read as a deviation in micrometres. The limits of size come from ISO 286: the tolerance grade (IT) fixes the width of the zone and the fundamental deviation (a letter) fixes its position relative to the basic size. Parts outside the limits are rejected or reworked. For production inspection, GO and NO-GO limit gauges are used instead; Taylor’s principle requires the GO gauge to check the maximum material condition of the whole feature and the NO-GO gauge to check the least material condition of each dimension separately. Gauge tolerance and wear allowance are placed inside the work tolerance.',
    formulas: [['Tolerance', 'T = upper limit − lower limit = IT'], ['Shaft limits', 'UL = D + es;  LL = D + ei;  ei = es − IT (a–h)'], ['Standard tolerance unit', 'i = 0.45 ∛D + 0.001 D  (µm, D geometric mean of the step)'], ['Comparator', 'size = setting stack + reading'], ['Gauge tolerance and wear allowance (simplified)', 'T_g = 0.1 T;  W = 0.1 T_g'], ['Snap gauge zones', 'GO: UL − W − T_g … UL − W;  NO-GO: LL … LL + T_g']],
    theory: `<h3>Comparators</h3><p>A comparator compares a part with a standard and shows the difference. In the mechanical (dial) comparator the plunger movement is magnified by levers, gears or a twisted strip (Sigma, Johansson Mikrokator) so that 1 µm moves the pointer by a visible amount, typically 1–2 mm on the scale. Because only the difference is measured, errors of the instrument over its full range do not matter, only over the small range of the deviation. The comparator is set to zero on a standard, here a stack of slip gauges, and each part is then placed under the plunger on the same anvil.</p>
      <h3>Slip-gauge stacks</h3><p>Slip gauges are combined by wringing to make any size in steps of 0.0005 or 0.001 mm. The rule for the fewest blocks is to remove the last decimal place first: with an M87 set, the 1.0005 mm block takes care of a final 5 in the fourth decimal, a block from 1.001–1.009 the third decimal, a block from 1.01–1.49 brings the remainder to a multiple of 0.5 mm, then a block from 0.5–9.5 and a block from 10–90. Fewer blocks mean fewer wringing films and less accumulated error.</p>
      <h3>Limits and fits (ISO 286)</h3><p>The tolerance zone of a shaft is given by a letter and a number, such as f7. The number is the tolerance grade: IT7 for Ø 25 mm is 21 µm. The letter is the fundamental deviation, the deviation of the limit nearest the basic size: for f it is es = −20 µm at 18–30 mm, so the shaft lies between 24.980 and 24.959 mm. Letters a–h place the shaft below the basic size (clearance with an H hole), js symmetric, and k–zc above (transition and interference). The Metrology Handbook has the full tables and a calculator.</p>
      <h3>Limit gauges and Taylor’s principle</h3><p>A GO gauge must go over (or into) every good part, so it is made to the maximum material limit: the upper limit of a shaft, the lower limit of a hole. A NO-GO gauge must not go on any good part, so it is made to the least material limit. Taylor’s principle says that the GO gauge should check the whole form at once (a full ring for a shaft) so that errors of form such as bending or ovality are caught, while the NO-GO gauge should check one dimension at a time. Gauges are made with their own tolerance, and the GO gauge, which wears in use, is given a wear allowance; both are placed inside the work tolerance so that bad work is never accepted.</p>`,
    procedure: ['From the ISO 286 tables find the limits of the shaft and their mean.', 'Select the slip gauges for the mean size with the fewest blocks; clean and wring them.', 'Place the stack under the plunger on the anvil and set the comparator to zero.', 'Lift the plunger, remove the stack, replace it and check that the reading returns to zero.', 'Place each pin under the plunger, rolling it gently to find the largest reading, and record the deviation.', 'At the end re-check zero on the stack.', 'Calculate each diameter, decide accept or reject, and design the snap gauges.', 'Unwring, clean, oil and store the slip gauges.'],
    precautions: ['Handle slip gauges with gloves or tongs; never drop or slide them on each other dry.', 'Wring blocks by sliding them together, never press them hard.', 'Roll round parts under the plunger to read the maximum (the diameter).', 'Keep parts and gauges at the same temperature.', 'Re-check zero at the end; if it has moved, repeat the batch.'],
    applications: ['High-volume inspection of turned and ground parts.', 'Selective assembly (grading parts into size classes).', 'Gauge-maker’s checking of plug and ring gauges.', 'Design of GO / NO-GO gauges for a production line.'],
    errors: ['Accumulated error of the slip-gauge stack and wringing films.', 'Comparator magnification error over the deviation range.', 'Temperature difference between parts and stack.', 'Not finding the maximum diameter (part not rolled).', 'Dirt on the anvil or the parts.', 'Zero drift during the batch.'],
    discussion: ['Why set the comparator at the mean size rather than the basic size?', 'Why are the gauge tolerance zones placed inside the work tolerance? What is the cost of doing so?', 'Explain Taylor’s principle using a shaft that is slightly bent. Which gauge detects it?', 'Your batch shows a trend in size. What does it tell the machine operator?'],
    refs: ['ISO 286-1:2010 and ISO 286-2:2010, Geometrical product specifications (GPS). ISO code system for tolerances on linear sizes.', 'IS 919 (Parts 1 and 2):1993, ISO system of limits and fits.', 'IS 3455:1971, Compendium of gauging practice (limit gauges).', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 2–3 and 8.', 'N. V. Raghavendra, L. Krishnamurthy, Engineering Metrology and Measurements, Oxford University Press, 2013, Ch. 3–4.'],
    pre: [
      { q: 'A comparator measures', o: ['Absolute size', 'The difference between a part and a standard', 'Only form errors', 'Surface roughness'], a: 1, why: 'It magnifies the deviation from a setting standard.' },
      { q: 'In the designation 25 f7, the "7" is', o: ['The fundamental deviation', 'The tolerance grade IT7', 'The hole class', 'The basic size'], a: 1, why: 'Number = IT grade.' },
      { q: 'For shafts a–h the fundamental deviation is', o: ['The lower deviation ei', 'The upper deviation es', 'Always zero', 'The tolerance'], a: 1, why: 'es is nearest the basic size for a–h.' },
      { q: 'A GO gauge for a shaft is made to the', o: ['Lower limit', 'Upper limit (maximum material)', 'Basic size', 'Mean size'], a: 1, why: 'GO checks the maximum material condition.' },
      { q: 'Slip gauges are combined by', o: ['Screwing', 'Wringing', 'Gluing', 'Magnetic clamping'], a: 1, why: 'Lapped faces wring together.' }
    ],
    post: [
      { q: 'Ø 25 g6: IT6 = 13 µm, es = −7 µm. The lower limit is', o: ['24.993 mm', '24.980 mm', '25.013 mm', '24.987 mm'], a: 1, why: 'ei = −7 − 13 = −20 µm → 24.980 mm.' },
      { q: 'With an M87 set, 41.125 mm needs (fewest blocks)', o: ['3', '4', '5', '6'], a: 1, why: '1.005 + 1.12 + 9 + 30 = 41.125.' },
      { q: 'The comparator is set at 24.9695 mm and a pin reads +8 µm. Its diameter is', o: ['24.9615 mm', '24.9775 mm', '25.008 mm', '24.9695 mm'], a: 1, why: '24.9695 + 0.008.' },
      { q: 'Gauge tolerance zones are placed inside the work tolerance so that', o: ['Gauges are cheaper', 'A bad part is never accepted', 'More parts are accepted', 'Gauges never wear'], a: 1, why: 'The penalty is occasionally rejecting a borderline good part.' },
      { q: 'A slightly bent shaft passes a snap gauge but not a full ring gauge. This illustrates', o: ['Abbe’s principle', 'Taylor’s principle', 'Hooke’s law', 'The ratchet effect'], a: 1, why: 'The GO gauge should check the whole form.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Limits computed from the ISO 286-1/-2 IT tables and fundamental deviations (checked: 25 f7 = 24.980/24.959, g6 = 24.993/24.980); slip-gauge combinations from the standard elimination method with an exhaustive check; comparator repeatability 0.4 µm; simplified gauge-design rule as taught (T_g = 0.1 T, W = 0.1 T_g).', 'ISO 286-2; IS 919; Jain Ch. 2–3'];
  LAB.NOMEN[ID] = [['D', 'Basic size', 'mm'], ['es, ei', 'Upper and lower deviation of the shaft', 'µm'], ['IT', 'Standard tolerance', 'µm'], ['UL, LL', 'Upper and lower limit', 'mm'], ['T', 'Work tolerance', 'mm'], ['T_g', 'Gauge tolerance', 'mm'], ['W', 'Wear allowance', 'mm'], ['GO, NO-GO', 'Limit gauges for the maximum and least material limits', '—']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Work out the limits and the mean size', note: s => `Limits ${U.f(s.truth.UL, 3)} / ${U.f(s.truth.LL, 3)} mm; mean ${U.f(s.truth.mid, 4)} mm`, why: 'The setting size must be known before the slip gauges are chosen.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(380, 260, 'ISO 286 tables', 440, 240) : K.tick(520, 210); } },
    { op: 1, d: 2.6, title: 'Build and wring the slip-gauge stack', note: s => `${s.truth.stack ? s.truth.stack.join(' + ') : '—'} mm`, why: 'The stack is built before the comparator can be set.',
      draw(L, u, c) { c.show('stack', true); c.set('stack', 'transform', `translate(${-90 * (1 - E(u))} 0)`); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Set the comparator to zero on the stack', note: 'Lower the head until the pointer is near zero; fine-adjust to zero', why: 'Zero is set on the stack before any part is measured.',
      draw(L, u, c) { c.set('headg', 'transform', `translate(0 ${-20 * (1 - E(u))})`); c.txt('dD', E(u) > 0.9 ? '0' : String(Math.round(18 * (1 - E(u))))); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Setting to a stack', lines: [
      ['The shaft limits come from the ISO tables. The comparator is set at their mean.', { s: 0 }],
      ['A stack of slip gauges, wrung together, makes that exact size to a fraction of a micron.', { s: 1 }],
      ['With the stack under the plunger, the dial is set to zero.', { s: 2 }]],
      q: { q: 'Why use as few slip gauges as possible?', o: ['To save time only', 'Each block and wringing film adds error', 'Large stacks are heavy', 'The set has few blocks'], a: 1, why: 'Errors accumulate with every block.' } },
    { title: 'Checking the batch', lines: [
      ['Each pin is rolled under the plunger, and the largest reading is taken.', { r: [0, 0.5] }],
      ['The dial shows how much bigger or smaller the pin is than the stack, in microns.', { r: [0.5, 0.9] }],
      ['At the end the stack goes back under the plunger, to check the zero has not moved.', { r: [0.9, 1] }]],
      q: { q: 'Why roll a round pin under the plunger?', o: ['To clean it', 'To find its maximum reading, which is its diameter', 'To warm it', 'To check roundness only'], a: 1, why: 'Off-centre, the plunger sees a chord, smaller than the diameter.' } },
    { title: 'Gauges for the shop floor', lines: [
      ['On the shop floor, a GO and a NO-GO snap gauge do the same job much faster.', null],
      ['The GO gauge is made at the largest allowed size, less a little for wear. The NO-GO at the smallest.', null],
      ['Both gauge tolerances sit inside the part tolerance, so a bad part can never pass.', null]],
      q: { q: 'Which gauge carries a wear allowance?', o: ['NO-GO', 'GO, because it slides over every good part', 'Both equally', 'Neither'], a: 1, why: 'The GO gauge contacts every good part and wears.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard. Slip gauges are easily damaged.', 'Cleaning spirit is flammable.'],
    ppe: ['Gloves or tongs for slip gauges'],
    rules: ['Work over a soft mat; keep the set closed when not in use.', 'Wring only clean blocks; unwring and clean them the same day.', 'Lower the comparator head gently onto the stack.'],
    emerg: ['Spirit in the eye: rinse at the eye-wash station.', 'Report damaged blocks to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Dial comparator', '1 µm/div, ±50 µm, magnification ≈ 1000', 'Measures deviation from setting'], ['Slip-gauge set', 'M87, grade 1', 'Setting standard'], ['Pins', 'Ø 25, turned, 10 off', 'Batch under inspection'], ['ISO 286 tables', 'Handbook, Limits and fits', 'Limits of size'], ['Snap gauge (example)', 'Double-ended GO / NO-GO', 'Production inspection']], note: 'Comparators with 0.5 µm resolution (Mikrokator) are used for gauge inspection.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const D = Pk(r, [12, 25, 40, 60, 100]), let_ = Pk(r, ['f', 'g', 'h']), g = Pk(r, [6, 7, 8]), dv = P.dev(D, let_, g), ans = D + dv.lo / 1000; return { title: 'Lower limit of a shaft', q: `Find the lower limit of a shaft Ø ${D} ${let_}${g}. (IT${g} = ${P.itv(D, g)} µm; fundamental deviation es = ${dv.up} µm.)`, ans, unit: 'mm', hints: ['ei = es − IT.', 'Lower limit = D + ei.'], sol: `ei = ${dv.up} − ${P.itv(D, g)} = ${dv.lo} µm; lower limit = ${D} + ${dv.lo}/1000 = <b>${s(ans, 7)} mm</b>.` }; },
    r => { const UL = Pk(r, [24.98, 49.975, 30.0, 59.97]), Tw = Pk(r, [21, 25, 30, 33]) / 1000, Tg = 0.1 * Tw, W = 0.1 * Tg, ans = UL - W; return { title: 'GO snap gauge', q: `A shaft has an upper limit of ${UL} mm and a tolerance of ${s(Tw * 1000)} µm. Taking gauge tolerance = 10 % of the work tolerance and wear allowance = 10 % of the gauge tolerance, find the largest size of the GO snap gauge.`, ans, unit: 'mm', hints: ['T_g = 0.1 T; W = 0.1 T_g.', 'GO zone top = UL − W.'], sol: `T_g = ${s(Tg * 1000)} µm; W = ${s(W * 1000)} µm; GO top = ${UL} − ${s(W, 4)} = <b>${s(ans, 7)} mm</b>.` }; },
    r => { const set = Pk(r, [24.9695, 34.983, 19.9935, 49.9875]), dev = Math.round(R(r, -15, 15, 0)), ans = set + dev / 1000; return { title: 'Size from a comparator', q: `A comparator set on a ${set} mm slip-gauge stack reads ${dev > 0 ? '+' : ''}${dev} µm on a part. Find the part size.`, ans, unit: 'mm', hints: ['Size = setting + reading.', 'Convert µm to mm.'], sol: `Size = ${set} + (${dev})/1000 = <b>${s(ans, 7)} mm</b>.` }; }
  ];
})();
