/* Exp 03 — Calibration of a Pt100 resistance temperature detector (RTD); effect of 2-, 3- and 4-wire connection and self-heating. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'rtd';
  const SENS = { A: { name: 'Thin-film Pt100, specified class A', s0: 0.06, ss: 0.06 }, B: { name: 'Wire-wound Pt100, specified class B', s0: 0.14, ss: 0.2 } };
  const PTS = [0, 25, 50, 75, 100, 125, 150];
  const CLS = [['Class AA', 'AA'], ['Class A', 'A'], ['Class B', 'B'], ['Class C', 'C']];

  LAB.register({
    id: ID, no: 3, cat: 'cal', title: 'Calibration of a Resistance Temperature Detector (Pt100)', std: 'IEC 60751 / ASTM E644', short: 'A Pt100 sensor is compared with a reference thermometer in an ice point and a stirred bath up to 150 °C. You find R₀ and α, convert resistance to temperature with the Callendar–Van Dusen equation and see what 2-wire leads and measuring current do to the reading.', tags: 'RTD Pt100 platinum resistance thermometer callendar van dusen alpha 0.00385 lead wire 2 wire 3 wire 4 wire self heating IEC 60751 calibration',
    aim: 'To calibrate a Pt100 resistance temperature detector against a reference thermometer, to determine its ice-point resistance and temperature coefficient, and to study the effect of lead-wire configuration and self-heating on the measured temperature.',
    objectives: ['Measure the ice-point resistance R₀ and the mean temperature coefficient α over 0–100 °C.', 'Convert resistance to temperature with the Callendar–Van Dusen equation (or the IEC 60751 table).', 'Determine the deviation from the reference and the tolerance class.', 'Quantify the error caused by lead resistance in a 2-wire connection and how 3- and 4-wire connections remove it.', 'Explain self-heating and choose a suitable measuring current.'],
    apparatus: ['Pt100 sensor in a Ø 6 mm stainless sheath, 300 mm long, four leads (each about 0.3 Ω)', 'Ice-point flask; stirred liquid bath, 20–200 °C (water to 90 °C, silicone oil above), stability ±0.01 °C', 'Reference thermometer: calibrated standard PRT with readout, U = 0.02 °C (k = 2)', 'Resistance bridge / precision ohmmeter, 0.001 Ω resolution, selectable current 1 mA or 5 mA, 2-, 3- or 4-wire input', 'IEC 60751 Pt100 table (Metrology Handbook)'],
    stdNote: 'IEC 60751 defines the Pt100 by R₀ = 100.000 Ω, A = 3.9083 × 10⁻³ °C⁻¹, B = −5.775 × 10⁻⁷ °C⁻² (α = 0.003 85 °C⁻¹) and tolerance classes AA ±(0.1 + 0.0017|t|), A ±(0.15 + 0.002|t|), B ±(0.3 + 0.005|t|), C ±(0.6 + 0.01|t|) °C.',
    params: [
      { id: 'wire', label: 'Lead-wire connection', type: 'select', options: [['4', '4-wire (separate current and voltage leads)'], ['3', '3-wire (bridge compensated)'], ['2', '2-wire (leads in series with the sensor)']], def: '4' },
      { id: 'cur', label: 'Measuring current', type: 'select', options: [['1', '1 mA'], ['5', '5 mA']], def: '1' },
      { id: 'sens', label: 'Sensor under test', type: 'select', options: Object.entries(SENS).map(([k, v]) => [k, v.name]), def: 'A' }
    ],
    opSteps: ['Make an ice point and check the reference thermometer reads 0.00 °C', 'Connect the RTD to the ohmmeter in the chosen configuration', 'Measure the loop resistance of the leads (sensor shorted)', 'Immerse the RTD in the ice point and record R₀', 'Transfer to the stirred bath; set each temperature and wait for stability', 'Record the reference temperature and RTD resistance at each point', 'Cool down; remove the probe and dry it'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(60, 110, 200, 150, 'mach', 'rx="6"')}<rect id="bath" x="72" y="122" width="176" height="126" rx="3" class="fluid" opacity=".45"/>${G.t(70, 276, 'stirred bath', 'm')}
        <g id="stir"><line x1="230" y1="96" x2="230" y2="234" class="ln" stroke-width="2"/><rect id="imp" x="220" y="230" width="20" height="5" class="ink"/></g>
        ${G.r(66, 70, 50, 70, 'glass', 'rx="6"')}<rect x="68" y="92" width="46" height="46" class="cool" opacity=".35"/>${G.t(60, 64, 'ice point', 'm')}
        <g id="ref"><rect x="${130}" y="40" width="7" height="190" class="steelD"/>${G.r(124, 20, 20, 24, 'acc', 'rx="3"')}</g>${G.t(70, 14, 'reference PRT', 'm')}
        <g id="rtd"><rect x="170" y="40" width="8" height="190" class="steel"/><rect x="170" y="200" width="8" height="26" class="spec"/>${G.r(164, 20, 20, 24, 'mach2', 'rx="3"')}</g>${G.t(190, 14, 'Pt100', 'm')}
        <g id="leads" style="display:none"><path d="M174 20 C 200 -10, 290 30, 330 60" fill="none" stroke="var(--bad)" stroke-width="2"/><path d="M178 22 C 205 0, 295 40, 330 72" fill="none" stroke="var(--bad)" stroke-width="2"/><path id="l3" d="M176 24 C 210 6, 300 50, 330 84" fill="none" stroke="var(--ink)" stroke-width="2"/><path id="l4" d="M180 26 C 215 12, 305 60, 330 96" fill="none" stroke="var(--ink)" stroke-width="2"/></g>
        <g transform="translate(330,50)">${G.r(0, 0, 210, 74, 'disp', 'rx="4"')}${G.t(10, 14, 'PRECISION OHMMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(10, 44, '---.--- Ω', 'big', 'id="dR"')}${G.t(10, 64, '', 'm', 'id="dW" style="fill:var(--panel-ink);font-size:8px"')}</g>
        <g transform="translate(330,140)">${G.r(0, 0, 210, 54, 'disp', 'rx="4"')}${G.t(10, 14, 'REFERENCE THERMOMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(10, 42, '---.-- °C', 'big', 'id="dT"')}</g>
        ${G.cbar(530, 210, 10, 70, 0, 160)}${G.t(330, 226, '', 'm', 'id="tst"')}`, 'RTD calibration: ice point, stirred bath, reference thermometer, Pt100 probe and precision ohmmeter');
    },
    anim(svg, f, sim, p) {
      G.txt(svg, 'dW', `${p.wire}-wire · ${p.cur} mA`);
      if (!sim) { G.show(svg, 'leads', false); G.fill(svg, 'bath', G.tcol(24, 0, 160)); return; }
      G.show(svg, 'leads', true); G.show(svg, 'l3', p.wire != 2); G.show(svg, 'l4', p.wire == 4);
      const n = sim.rows.length, x = f * n, k = Math.min(n - 1, Math.floor(x)), u = x - k, rw = sim.rows[k];
      const prev = k ? sim.rows[k - 1].Tref : sim.Ta; const T = k === 0 ? 0 : (u < 0.5 ? prev + (rw.Tref - prev) * U.ease(u / 0.5) : rw.Tref);
      G.fill(svg, 'bath', G.tcol(k === 0 ? 24 : T, 0, 160));
      G.set(svg, 'rtd', 'transform', k === 0 ? 'translate(-102 30)' : ''); G.set(svg, 'ref', 'transform', k === 0 ? 'translate(-56 30)' : '');
      G.txt(svg, 'dT', U.f(T, 2) + ' °C'); G.txt(svg, 'dR', U.f(u < 0.5 && k ? sim.Rmeas(T) : rw.R, 3) + ' Ω'); G.txt(svg, 'tst', k === 0 ? 'ice point' : u < 0.5 ? 'heating, waiting for stability…' : `stable: point ${k + 1}/${n}`);
      G.set(svg, 'imp', 'transform', `translate(${Math.sin(f * 60) * 4} 0)`);
    },
    liveView(el, f, sim, p, api) {
      const n = sim.rows.length, k = Math.min(n - 1, Math.floor(f * n)); const done = sim.rows.slice(0, k + 1);
      api.title('Error of the RTD reading'); api.sub(`${done.length} of ${n} points`);
      const xs = U.lin(0, 160, 30);
      G.profileView(el, { xlabel: 'Reference temperature (°C)', ylabel: 'RTD − reference (°C)', series: [{ name: 'class A', x: xs, y: xs.map(P.ptTol.A), color: 's3', dash: true }, { x: xs, y: xs.map(t => -P.ptTol.A(t)), color: 's3', dash: true }, { name: 'class B', x: xs, y: xs.map(P.ptTol.B), color: 'bad', dash: true }, { x: xs, y: xs.map(t => -P.ptTol.B(t)), color: 'bad', dash: true }, { name: 'measured', x: done.map(r => r.Tref), y: done.map(r => r.err), type: 'linepts', color: 's1' }], xmin: 0, xmax: 160, ymin: -1.6, ymax: Math.max(1.6, ...done.map(r => r.err + 0.3)), yzero: false }, 210);
    },
    simulate(p, r) {
      const S = SENS[p.sens], Ta = U.q(25 + 3 * r(), 0.1), e0 = S.s0 * U.gauss(r), eS = S.ss * U.gauss(r);
      const Rs = t => P.ptR(t + e0 + eS * t / 100);
      const RL = 0.3 * (1 + 0.1 * U.gauss(r)), Rloop = U.q(2 * RL * (1 + 0.0039 * 2), 0.001);
      const I = +p.cur / 1000, dc = 25e-3; // dissipation constant in stirred liquid, W/°C
      const wireErr = p.wire == 2 ? 2 * RL : p.wire == 3 ? 0.012 * (r() - 0.3) : 0;
      const Rmeas = t => { const R1 = Rs(t); const sh = I * I * R1 / dc; return Rs(t + sh) + wireErr; };
      const rows = PTS.map(set => { const Tref = set === 0 ? U.q(0.004 * U.gauss(r), 0.01) : U.q(set + 0.25 * (r() - 0.5), 0.01); const R = U.q(Rmeas(Tref) + 0.0008 * U.gauss(r), 0.001); const Tr = P.ptT(R); return { set, Tref, R, Trtd: Tr, err: Tr - Tref }; });
      const r0 = rows[0], r100 = rows.find(x => x.set === 100), r150 = rows.find(x => x.set === 150);
      const alpha = (r100.R - r0.R) / (r100.Tref * r0.R);
      const iM = rows.reduce((b, x, i) => Math.abs(x.err) > Math.abs(rows[b].err) ? i : b, 0);
      const cl = (CLS.find(c => rows.every(x => Math.abs(x.err) <= P.ptTol[c[1]](x.Tref))) || ['Outside class C'])[0];
      const T = { rows, R0: r0.R, alpha, r150, iM, cls: cl, Rloop, eLead: Rloop / 0.3851, sh: (I * I * 100 / dc), RL, wireErr };
      return {
        rows, Ta, Rmeas, truth: T, dur: 13,
        readout(f) { const n = rows.length, k = Math.min(n - 1, Math.floor(f * n)), x = rows[k]; return [['Point', `${k + 1}/${n}`, ''], ['Reference', U.f(x.Tref, 2), '°C'], ['RTD resistance', U.f(x.R, 3), 'Ω'], ['Connection', p.wire + '-wire', ''], ['Current', p.cur, 'mA']]; },
        plot: { title: 'RTD resistance against temperature', xlabel: 'Reference temperature (°C)', ylabel: 'Measured resistance (Ω)', series: [{ name: 'IEC 60751 Pt100', x: U.lin(0, 160, 40), y: U.lin(0, 160, 40).map(t => P.ptR(t)), color: 'muted', dash: true, static: true }, { name: 'measured', x: rows.map(x => x.Tref), y: rows.map(x => x.R), type: 'scatter', color: 's1' }], caption: 'Measured resistance against reference temperature, with the IEC 60751 curve' },
        plots: [{ xlabel: 'Reference temperature (°C)', ylabel: 'RTD − reference (°C)', series: [{ name: 'measured', x: rows.map(x => x.Tref), y: rows.map(x => x.err), type: 'linepts', color: 's1' }, { name: 'class A', x: [0, 160], y: [0.15, 0.47], color: 's3', dash: true }, { x: [0, 160], y: [-0.15, -0.47], color: 's3', dash: true }, { name: 'class B', x: [0, 160], y: [0.3, 1.1], color: 'bad', dash: true }, { x: [0, 160], y: [-0.3, -1.1], color: 'bad', dash: true }], yzero: false, caption: 'Error of the RTD with IEC 60751 class A and B limits' }],
        specimen: [['Sensor', SENS[p.sens].name, ''], ['Connection', p.wire + '-wire', ''], ['Measuring current', p.cur, 'mA'], ['Lead loop resistance (sensor shorted at the tip)', U.f(Rloop, 3), 'Ω'], ['Ohmmeter resolution', '0.001', 'Ω'], ['Bath medium', 'water to 75 °C, silicone oil above', ''], ['Room temperature', U.f(Ta, 1), '°C']],
        obs: [{ title: 'Table 1. Calibration readings', cols: ['Set point (°C)', 'Reference (°C)', 'RTD resistance R (Ω)'], rows: rows.map(x => [x.set === 0 ? '0 (ice point)' : x.set, U.f(x.Tref, 2), U.f(x.R, 3)]), note: 'Convert each resistance to temperature with the IEC 60751 equation R = R₀(1 + At + Bt²), R₀ = 100 Ω, or with the Pt100 look-up in the Handbook.' }],
        truth: T
      };
    },
    expHint: 'For temperatures above 0 °C invert R = 100(1 + At + Bt²): t = [−A + √(A² − 4B(1 − R/100))]/(2B), with A = 3.9083 × 10⁻³ and B = −5.775 × 10⁻⁷, or use the Pt100 look-up in the Handbook.',
    calcs(sim) { const T = sim.truth; return [
      { key: 'r0', label: 'Ice-point resistance R₀', unit: 'Ω', truth: T.R0, abs: 0.002, fmt: v => U.f(v, 3) },
      { key: 'al', label: 'Mean temperature coefficient α = (R_t − R₀)/(R₀ t) using the 100 °C point, in units of 10⁻³ °C⁻¹', unit: '10⁻³/°C', truth: T.alpha * 1000, abs: 0.004, fmt: v => U.f(v, 4) },
      { key: 't150', label: 'Temperature indicated by the RTD at the 150 °C point (IEC 60751, R₀ = 100 Ω)', unit: '°C', truth: T.r150.Trtd, abs: 0.03, fmt: v => U.f(v, 2) },
      { key: 'e150', label: 'Error at the 150 °C point (RTD − reference)', unit: '°C', truth: T.r150.err, abs: 0.03, fmt: v => U.f(v, 2) },
      { key: 'emax', label: 'Largest error over the range, with its sign', unit: '°C', truth: T.rows[T.iM].err, abs: 0.03, fmt: v => U.f(v, 2) },
      { key: 'el', label: 'Temperature error that the measured lead loop resistance would cause in a 2-wire connection (sensitivity ≈ 0.385 Ω/°C)', unit: '°C', truth: T.eLead, tol: 0.03, fmt: v => U.f(v, 2) },
      { key: 'cls', label: 'Tolerance class achieved in this connection (IEC 60751)', type: 'select', options: ['Class AA', 'Class A', 'Class B', 'Class C', 'Outside class C'], truth: T.cls }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Ice-point resistance R₀', unit: 'Ω', value: T.R0, lo: 99.94, hi: 100.06, src: 'IEC 60751 class A at 0 °C (±0.15 °C)', fmt: v => U.f(v, 3) }, { label: 'Mean α (0–100 °C)', unit: '10⁻³/°C', value: T.alpha * 1000, lo: 3.840, hi: 3.860, src: 'IEC 60751: 3.851', fmt: v => U.f(v, 4) }, { label: 'Self-heating at this current', unit: '°C', value: T.sh, lo: 0, hi: 0.05, src: 'Should be < 1/3 of the uncertainty wanted', fmt: v => U.f(v, 3) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Where the error comes from</h4><span class="eyebrow">${p.wire}-wire · ${p.cur} mA</span></div>${LAB.tableHTML({ cols: ['Point (°C)', 'R (Ω)', 'RTD (°C)', 'Error (°C)', 'Class A limit', 'Class B limit'], rows: T.rows.map(x => [x.set, U.f(x.R, 3), U.f(x.Trtd, 2), U.f(x.err, 2), '±' + U.f(P.ptTol.A(x.Tref), 2), '±' + U.f(P.ptTol.B(x.Tref), 2)]) })}<p class="muted" style="font-size:.84rem">Lead loop resistance ${U.f(T.Rloop, 3)} Ω. ${p.wire == 2 ? `In the 2-wire connection it is added to the sensor resistance, so every reading is about ${U.f(T.eLead, 2)} °C high: an offset that no class can absorb.` : p.wire == 3 ? 'The 3-wire bridge cancels the leads only as far as the two current-carrying leads are equal; the residual here is a few hundredths of a degree.' : 'The 4-wire connection measures the voltage across the sensor with leads that carry no current, so lead resistance has no effect.'} Self-heating at ${p.cur} mA in a stirred liquid is about ${U.f(T.sh, 3)} °C${p.cur == 5 ? '; in still air it would be ten times larger. Use 1 mA or less for precision work.' : '.'}</p></div>`; },
    sample(sim) { const T = sim.truth, x = T.r150, r100 = T.rows.find(y => y.set === 100), A = P.PT.A, B = P.PT.B; return `<div class="eq">α = (R₁₀₀ − R₀)/(R₀ t) = (${U.f(r100.R, 3)} − ${U.f(T.R0, 3)})/(${U.f(T.R0, 3)} × ${U.f(r100.Tref, 2)}) = <b>${U.f(T.alpha * 1000, 4)} × 10⁻³ °C⁻¹</b></div><div class="eq">t = [−A + √(A² − 4B(1 − R/R₀))]/(2B) with R = ${U.f(x.R, 3)} Ω: t = [−${A} + √(${A}² + 4 × ${-B} × (1 − ${U.f(x.R / 100, 5)}))]/(2 × ${B}) = <b>${U.f(x.Trtd, 2)} °C</b></div><div class="eq">Error = ${U.f(x.Trtd, 2)} − ${U.f(x.Tref, 2)} = <b>${U.f(x.err, 2)} °C</b></div><div class="eq">2-wire lead error = R_loop/0.3851 = ${U.f(T.Rloop, 3)}/0.3851 = <b>${U.f(T.eLead, 2)} °C</b></div>`; },
    uncert(sim) { const T = sim.truth, x = T.r150; return [{ q: 'Resistance reading', expr: '√[(0.001/√12)² + (2×10⁻⁵ R)²]', val: x.R, u: M.rss(M.uRes(0.001), 2e-5 * x.R), unit: 'Ω' }, { q: 'RTD temperature', expr: 'u_R / (dR/dt), dR/dt ≈ 0.38 Ω/°C', val: x.Trtd, u: M.rss(M.uRes(0.001), 2e-5 * x.R) / 0.379, unit: '°C' }, { q: 'Error at 150 °C', expr: '√[u_RTD² + (0.02/2)² + 0.01²]: + reference, bath stability', val: Math.abs(x.err) || 0.01, u: M.rss(M.rss(M.uRes(0.001), 2e-5 * x.R) / 0.379, 0.01, 0.01), unit: '°C' }]; },
    conclude(sim, p) { const T = sim.truth; return `The Pt100 had an ice-point resistance of ${U.f(T.R0, 3)} Ω and a mean temperature coefficient of ${U.f(T.alpha * 1000, 4)} × 10⁻³ °C⁻¹ over 0–100 °C (IEC 60751: 3.851 × 10⁻³). Measured ${p.wire}-wire at ${p.cur} mA, its largest error was ${U.f(T.rows[T.iM].err, 2)} °C, which places it in ${T.cls === 'Outside class C' ? 'no IEC class' : T.cls.toLowerCase()} in this connection. The lead loop resistance of ${U.f(T.Rloop, 3)} Ω would cause an error of ${U.f(T.eLead, 2)} °C in a 2-wire connection${p.wire == 2 ? ', which is what this run shows' : ', which the ' + p.wire + '-wire connection removed'}.`; },
    summary: 'The resistance of platinum rises with temperature almost linearly. IEC 60751 defines the industrial Pt100 by R = R₀(1 + At + Bt²) above 0 °C, with R₀ = 100 Ω, A = 3.9083 × 10⁻³ and B = −5.775 × 10⁻⁷, giving a mean coefficient α = 0.00385 °C⁻¹ between 0 and 100 °C. The sensor is calibrated by measuring R₀ in an ice point and its resistance at several temperatures in a stirred bath against a reference thermometer. Because the sensitivity is only 0.39 Ω/°C, the resistance of the connecting leads matters: in a 2-wire connection it adds directly; a 3-wire bridge cancels it if the leads are equal; a 4-wire connection removes it. The measuring current heats the sensor (self-heating), so it is kept to about 1 mA.',
    formulas: [['Callendar–Van Dusen (t ≥ 0 °C)', 'R = R₀(1 + At + Bt²)'], ['Inverse', 't = [−A + √(A² − 4B(1 − R/R₀))]/(2B)'], ['Mean coefficient 0–100 °C', 'α = (R₁₀₀ − R₀)/(100 R₀) = 0.003 85 °C⁻¹'], ['2-wire lead error', 'Δt ≈ R_loop / (R₀α) = R_loop / 0.385'], ['Self-heating', 'Δt_sh = I²R / δ  (δ: dissipation constant, W/°C)'], ['Class A tolerance', '±(0.15 + 0.002|t|) °C']],
    theory: `<h3>Resistance thermometry</h3><p>The electrical resistance of a pure metal rises with temperature because lattice vibrations scatter the conduction electrons more strongly. Platinum is chosen because it is chemically stable, can be made very pure, and has a reproducible, nearly linear resistance–temperature relation from −200 to 850 °C. A Pt100 has a resistance of 100 Ω at 0 °C and about 138.5 Ω at 100 °C.</p>
      <h3>The Callendar–Van Dusen equation</h3><p>IEC 60751 defines the industrial platinum resistance thermometer by R = R<sub>0</sub>(1 + At + Bt<sup>2</sup>) for 0 to 850 °C, with an extra term C(t − 100)t<sup>3</sup> below 0 °C. The coefficients A = 3.9083 × 10<sup>−3</sup> and B = −5.775 × 10<sup>−7</sup> correspond to a mean coefficient α = (R<sub>100</sub> − R<sub>0</sub>)/(100R<sub>0</sub>) = 0.003 85 °C<sup>−1</sup>. A real sensor has its own R<sub>0</sub> and α; calibration finds them, or finds the error against the standard curve at each temperature.</p>
      <h3>Lead resistance and the three connections</h3><p>The sensitivity of a Pt100 is only about 0.39 Ω/°C, so a few tenths of an ohm in the leads matter. In a 2-wire connection the meter sees the sensor plus both leads: 0.6 Ω of leads reads as 1.5 °C too hot, and the error changes as the leads warm. In a 3-wire connection one lead is placed in each adjacent arm of a bridge, so equal leads cancel. In a 4-wire connection a constant current is passed through one pair of leads and the voltage is measured with the other pair, which carries no current, so the lead resistance does not enter at all. Laboratory calibration always uses 4 wires.</p>
      <h3>Self-heating</h3><p>The measuring current dissipates I<sup>2</sup>R in the sensor and raises its temperature above the medium by I<sup>2</sup>R/δ, where δ is the dissipation constant: tens of mW/°C in a stirred liquid, a few mW/°C in still air. At 1 mA a Pt100 dissipates 0.1 mW and the error is negligible; at 5 mA it dissipates 2.5 mW, 25 times more. Comparing readings at two currents and extrapolating to zero current is the standard way to remove self-heating.</p>
      <h3>Calibration</h3><p>R<sub>0</sub> is measured in an ice point, the most reproducible fixed point available in an ordinary laboratory. The other points are taken in a stirred bath against a reference thermometer, waiting at each point until both sensors are stable. The resistance is converted to temperature with the standard equation and the error is compared with the class tolerances.</p>`,
    procedure: ['Make an ice point from shaved ice of distilled water, topped up with water; check that the reference thermometer reads 0.00 ± 0.02 °C.', 'Connect the RTD to the ohmmeter in the chosen configuration and select the measuring current.', 'Short the sensor end (or use the manufacturer’s lead data) to measure the lead loop resistance.', 'Immerse the RTD in the ice point for at least 10 minutes and record R₀.', 'Transfer the RTD and the reference thermometer to the stirred bath. Set the first temperature and wait until both readings are stable.', 'Record the reference temperature and the RTD resistance; repeat for each set point.', 'Convert each resistance to temperature and calculate the errors.', 'Cool the bath, remove and dry the probe.'],
    precautions: ['Immerse the probe to at least 15 sheath diameters.', 'Do not touch the probe while reading; hands add heat by conduction along the sheath.', 'Keep the measuring current at 1 mA or below for precision work.', 'Use the 4-wire connection when lead resistance is unknown or long leads are used.', 'Wait for both sensors to stabilise; their response times differ.'],
    applications: ['Process temperature measurement in pharmaceutical, food and chemical plants where ±0.1 °C matters.', 'Bearing, winding and oil temperature monitoring in motors and turbines.', 'Reference thermometers for calibration laboratories.', 'HVAC and cold-chain logging.'],
    errors: ['Lead resistance in a 2-wire connection.', 'Self-heating from the measuring current.', 'Stem conduction from insufficient immersion.', 'Bath temperature gradients and instability.', 'Ohmmeter resolution and calibration.', 'Thermoelectric emfs at terminals (removed by current reversal).'],
    discussion: ['Compare the 2-, 3- and 4-wire results (change the setting and run again). Which error is constant and which grows with temperature?', 'Why is the ice point used for R₀ rather than the bath at 0 °C?', 'Estimate the self-heating error at 5 mA in still air if δ = 2 mW/°C. When would it matter?', 'Is the RTD more or less sensitive than a type K thermocouple at 100 °C? Compare in relative terms.'],
    refs: ['IEC 60751:2022, Industrial platinum resistance thermometers and platinum temperature sensors.', 'ASTM E644-11(2019), Standard Test Methods for Testing Industrial Resistance Thermometers.', 'J. V. Nicholas, D. R. White, Traceable Temperatures, 2nd ed., Wiley, 2001, Ch. 6.', 'E. O. Doebelin, D. N. Manik, Measurement Systems: Application and Design, 6th ed., McGraw-Hill, Ch. 8.', 'R. K. Jain, Mechanical and Industrial Measurements, Khanna Publishers.'],
    pre: [
      { q: 'A Pt100 has a resistance of 100 Ω at', o: ['20 °C', '0 °C', '100 °C', '25 °C'], a: 1, why: 'R₀ = 100 Ω at 0 °C.' },
      { q: 'The mean temperature coefficient of a standard Pt100 between 0 and 100 °C is about', o: ['0.000 385 /°C', '0.003 85 /°C', '0.0385 /°C', '0.385 /°C'], a: 1, why: 'R₁₀₀ = 138.5 Ω, so α = 0.385/100 = 0.003 85.' },
      { q: 'Which connection removes the effect of lead resistance completely?', o: ['2-wire', '3-wire', '4-wire', 'All equally'], a: 2, why: 'The voltage leads carry no current.' },
      { q: 'Self-heating error increases with', o: ['Lower current', 'Higher measuring current and poorer heat transfer to the medium', 'Shorter leads', 'More wires'], a: 1, why: 'Δt = I²R/δ.' },
      { q: 'Compared with a thermocouple, an RTD is generally', o: ['Less accurate and less stable', 'More accurate and stable, but slower and limited to lower temperatures', 'Usable to 1800 °C', 'Self-powered'], a: 1, why: 'Platinum RTDs are the accuracy choice up to about 600 °C.' }
    ],
    post: [
      { q: 'A Pt100 is connected with two leads of 0.4 Ω each. The 2-wire reading is high by about', o: ['0.4 °C', '2.1 °C', '0.8 °C', '0.2 °C'], a: 1, why: '0.8 Ω / 0.385 Ω/°C ≈ 2.1 °C.' },
      { q: 'A Pt100 reads 119.40 Ω. Using α = 0.003 85, its temperature is roughly', o: ['19.4 °C', '50.4 °C', '119.4 °C', '5.0 °C'], a: 1, why: '(119.40 − 100)/0.385 ≈ 50.4 °C (the quadratic term changes this by about 0.1 °C).' },
      { q: 'Class A tolerance at 150 °C is', o: ['±0.15 °C', '±0.45 °C', '±1.05 °C', '±0.30 °C'], a: 1, why: '0.15 + 0.002 × 150 = 0.45 °C.' },
      { q: 'Raising the measuring current from 1 mA to 5 mA increases the self-heating by a factor of', o: ['5', '25', '√5', '1'], a: 1, why: 'Power ∝ I².' },
      { q: 'In a 3-wire bridge connection the lead error cancels only if', o: ['The bridge is unbalanced', 'The two leads in the adjacent arms have equal resistance', 'The current is high', 'The sensor is at 0 °C'], a: 1, why: 'Cancellation relies on lead symmetry.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Sensor resistance from the IEC 60751 Callendar–Van Dusen equation (R(100) = 138.505 Ω checked), sensor deviations within the class spread, lead resistance, bridge mismatch and I²R/δ self-heating with a stirred-liquid dissipation constant.', 'IEC 60751; ASTM E644; Nicholas & White Ch. 6'];
  LAB.NOMEN[ID] = [['R, R₀', 'Sensor resistance; at 0 °C', 'Ω'], ['A, B', 'Callendar–Van Dusen coefficients', '°C⁻¹, °C⁻²'], ['α', 'Mean temperature coefficient, 0–100 °C', '°C⁻¹'], ['t, t_ref', 'RTD and reference temperatures', '°C'], ['R_loop', 'Lead loop resistance (both leads)', 'Ω'], ['I', 'Measuring current', 'mA'], ['δ', 'Dissipation constant', 'W/°C'], ['Δt_sh', 'Self-heating error', '°C']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.6, title: 'Make the ice point and check the reference', note: 'Shaved distilled-water ice, topped up with water; reference reads 0.00 °C', why: 'The reference is checked at the ice point before it is trusted at other temperatures.',
      draw(L, u, c) { c.txt('dT', U.f(0.3 * (1 - E(u)), 2) + ' °C'); c.set('ref', 'transform', `translate(-56 ${30 * E(u)})`); L.innerHTML = c.active ? tag(20, 160, 'ice point', 90, 100) : ''; } },
    { op: 1, d: 2.4, title: s => 'Connect the RTD leads to the ohmmeter', note: (s, p) => p.wire == 4 ? 'Two current leads and two separate voltage leads' : p.wire == 3 ? 'One lead in each adjacent arm of the bridge, third lead to the detector' : 'Both leads in series with the sensor', why: 'The probe must be connected before its lead loop resistance can be measured.',
      draw(L, u, c) { c.show('leads', true); c.op('leads', E(u)); c.show('l3', c.p.wire != 2); c.show('l4', c.p.wire == 4); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: 'Measure the lead loop resistance', note: s => `Sensor end shorted: loop resistance ${U.f(s.truth.Rloop, 3)} Ω`, why: 'Lead resistance is measured once wired, before the sensor goes into the ice.',
      draw(L, u, c) { c.txt('dR', U.f(c.sim.truth.Rloop * E(u), 3) + ' Ω'); L.innerHTML = c.active ? tag(330, 30, 'R_loop', 380, 60) : ''; } },
    { op: 3, d: 2.4, title: 'Immerse the RTD in the ice point and read R₀', note: 'At least 10 minutes in the ice before reading', why: 'R₀ is taken in the ice point first, before the probe goes into the hot bath.',
      draw(L, u, c) { c.set('rtd', 'transform', `translate(-102 ${30 * E(u)})`); c.txt('dR', U.f(c.sim.truth.R0 * E(u), 3) + ' Ω'); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Platinum that tells temperature', lines: [
      ['A Pt100 is a small coil or film of platinum. At zero degrees it measures one hundred ohms, and it gains about four tenths of an ohm per degree.', { s: 0 }],
      ['Four leads come out of the probe. How they are connected decides whether the leads themselves are measured too.', { s: 1 }],
      ['With the sensor end shorted, the meter shows the resistance of the leads alone.', { s: 2 }]],
      q: { q: 'The leads total 0.8 Ω and you connect 2-wire. The reading will be', o: ['Correct', 'About 2 °C too high', 'About 0.8 °C too low', 'About 20 °C too high'], a: 1, why: 'The meter adds 0.8 Ω, and 0.8/0.385 ≈ 2 °C.' } },
    { title: 'Ice point, then the bath', lines: [
      ['The probe first sits in melting ice. Its resistance there is R zero.', { s: 3 }],
      ['Then it goes into the stirred bath with the reference thermometer. The bath steps up to one hundred and fifty degrees.', { r: [0, 0.6] }],
      ['At each step both readings are allowed to settle before they are written down.', { r: [0.6, 1] }]],
      q: { q: 'Why is the bath stirred?', o: ['To cool it', 'So the RTD and the reference are at the same temperature', 'To mix in the ice', 'To reduce self-heating to zero'], a: 1, why: 'Stirring removes gradients between the two sensors (and also helps carry away self-heating).' } },
    { title: 'Resistance to temperature', lines: [
      ['The standard equation, R equals R zero times one plus A t plus B t squared, is solved for t.', null],
      ['The difference from the reference is the error. It is compared with class A and class B.', null],
      ['Raise the current to five milliamps and the sensor heats itself, twenty-five times more than at one milliamp.', null]],
      q: { q: 'Which change would make a 2-wire result match the 4-wire result?', o: ['Higher current', 'Subtracting the lead loop resistance from every reading', 'Waiting longer', 'Using class B'], a: 1, why: 'The 2-wire error is the lead resistance; removing it leaves the sensor resistance.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Hot water and oil up to 150 °C: scalds and burns.', 'Oil splashes if a wet probe is put into hot oil.', 'Mains-powered bath and stirrer.'],
    ppe: ['Safety glasses', 'Heat-resistant gloves', 'Lab coat'],
    rules: ['Dry the probe before putting it into hot oil.', 'Never leave the bath unattended above 100 °C.', 'Keep the bath lid on except when inserting probes.', 'Switch to silicone oil before exceeding 80 °C with water.'],
    emerg: ['For a scald, cool under running water for 20 minutes and report it.', 'Switch off the bath heater if the oil smokes.', 'Cover an oil fire with the lid; never use water on it.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Pt100 under test', 'Class A or B, 4 leads, Ø 6 × 300 mm', 'Immerse ≥ 90 mm'], ['Reference SPRT/PRT', 'U = 0.02 °C, with readout', 'Traceable reference'], ['Ice-point flask', 'Dewar with shaved distilled-water ice', '0.00 ± 0.01 °C'], ['Stirred bath', '−20 to 200 °C, ±0.01 °C', 'Water or silicone oil'], ['Precision ohmmeter / bridge', '0.001 Ω, 1 mA and 5 mA', '4-wire input, current reversal'], ['Pt100 table', 'IEC 60751', 'Metrology Handbook']], note: 'Store probes straight; bending the tip strains the platinum and shifts R₀.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const t = R(r, 20, 400, 1), ans = P.ptR(t); return { title: 'Pt100 resistance', q: `Find the resistance of a standard Pt100 at ${t} °C using R = R₀(1 + At + Bt²), A = 3.9083 × 10⁻³, B = −5.775 × 10⁻⁷.`, ans, unit: 'Ω', hints: ['R₀ = 100 Ω.', `At = ${s(3.9083e-3 * t)}, Bt² = ${s(-5.775e-7 * t * t)}.`], sol: `R = 100(1 + ${s(3.9083e-3 * t)} + ${s(-5.775e-7 * t * t)}) = <b>${s(ans, 5)} Ω</b>.` }; },
    r => { const Rl = R(r, 0.2, 1.5, 2), ans = 2 * Rl / 0.385; return { title: '2-wire lead error', q: `A Pt100 is connected in a 2-wire circuit with copper leads of ${Rl} Ω each. Taking the sensitivity as 0.385 Ω/°C, how many degrees does the instrument read high?`, ans, unit: '°C', hints: ['Both leads are in series with the sensor.', 'Δt = R_loop/0.385.'], sol: `R_loop = 2 × ${Rl} = ${s(2 * Rl)} Ω; Δt = ${s(2 * Rl)}/0.385 = <b>${s(ans)} °C</b>.` }; },
    r => { const I = Pk(r, [1, 2, 5, 10]), d = Pk(r, [2, 5, 20, 50]), Rt = R(r, 100, 180, 1), ans = (I / 1000) ** 2 * Rt / (d / 1000); return { title: 'Self-heating', q: `A Pt100 of resistance ${Rt} Ω carries a measuring current of ${I} mA. Its dissipation constant in the medium is ${d} mW/°C. Find the self-heating error.`, ans, unit: '°C', hints: ['Power P = I²R.', 'Δt = P/δ.'], sol: `P = (${I}×10⁻³)² × ${Rt} = ${s((I / 1000) ** 2 * Rt * 1000)} mW; Δt = ${s((I / 1000) ** 2 * Rt * 1000)}/${d} = <b>${s(ans)} °C</b>.` }; }
  ];
})();
