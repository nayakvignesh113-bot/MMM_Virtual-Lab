/* Exp 18 — Thread pitch, flank angles and major diameter with a toolmaker's microscope. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'tmm';
  const TH = { m12: { d: 12, p: 1.75 }, m16: { d: 16, p: 2 }, m10: { d: 10, p: 1.5 } };
  const dm = d => { const s = Math.round(Math.abs(d) * 60), D = Math.floor(s / 60), m = s % 60; return `${D}° ${String(m).padStart(2, '0')}′`; };

  LAB.register({
    id: ID, no: 18, cat: 'opt', title: 'Measurement of Thread Parameters using a Toolmaker’s Microscope', std: 'ISO 965-1 / IS 4218 / ISO 1502 (thread gauging)', short: 'A threaded part is held between centres under a toolmaker’s microscope. You traverse the micrometer stage from flank to flank to find the pitch and cumulative pitch error, rotate the goniometer eyepiece to measure both flank angles, measure the major diameter, and see why the column must be tilted to the helix angle.', tags: 'toolmaker microscope goniometer eyepiece cross hair micrometer stage thread pitch flank angle included angle helix angle major diameter profile projector optical metrology',
    aim: 'To measure the pitch, flank angles and major diameter of an external screw thread with a toolmaker’s microscope, and to assess the cumulative pitch error and flank-angle errors.',
    objectives: ['Set up a toolmaker’s microscope: focus, tilt of the column to the helix angle, alignment of the work axis with the stage traverse.', 'Measure successive pitches with the stage micrometer and find the cumulative pitch error.', 'Measure the left and right flank angles with the goniometer eyepiece and the included angle.', 'Measure the major diameter with the transverse micrometer.', 'Explain why the column is tilted and what happens if it is not.'],
    apparatus: ['Toolmaker’s microscope with 30× magnification, cross-hair goniometer eyepiece (1′ vernier), X and Y stage micrometer heads 0–25 mm (least count 0.001 mm with vernier)', 'Centres and tilting column (±15°)', 'Transmitted (collimated) illumination', 'External thread specimens M10 × 1.5, M12 × 1.75, M16 × 2'],
    stdNote: 'ISO 965-1 defines the 60° basic profile and the pitch; ISO 1502 gives gauge tolerances, where pitch and flank-angle errors of setting plugs are checked optically. Pitch errors are expressed as individual and cumulative (over several pitches); each causes an equivalent change in effective diameter.',
    params: [
      { id: 'th', label: 'Thread', type: 'select', options: [['m12', 'M12 × 1.75'], ['m16', 'M16 × 2'], ['m10', 'M10 × 1.5']], def: 'm12' },
      { id: 'tilt', label: 'Microscope column', type: 'select', options: [['yes', 'Tilted to the helix angle'], ['no', 'Left vertical']], def: 'yes' }
    ],
    opSteps: ['Mount the thread between centres; switch on transmitted light', 'Tilt the column to the helix angle; focus on the thread profile', 'Align the thread axis with the X traverse using a crest line', 'Set the cross-hair on a flank and traverse X across six successive flanks', 'Rotate the goniometer to align the hair with each flank; read both flank angles', 'Traverse Y from the top crest to the bottom crest for the major diameter'],
    svg(p) {
      let prof = 'M120 160'; for (let i = 0; i < 9; i++) prof += ` l14 -24 l14 24`; return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(40, 250, 480, 20, 'mach', 'rx="3"')}<g id="col"><rect x="420" y="30" width="24" height="220" class="mach"/><rect x="300" y="30" width="140" height="22" class="mach2"/><rect x="300" y="52" width="26" height="70" class="steelD"/><rect x="304" y="10" width="18" height="24" class="ink"/></g>${G.t(450, 60, 'column', 'm')}
        <g id="stg"><rect x="90" y="180" width="300" height="20" class="steel"/><path d="${prof} L372 200 L120 200 Z" class="spec"/><circle cx="96" cy="190" r="6" class="mach2"/><circle cx="384" cy="190" r="6" class="mach2"/></g>${G.t(90, 222, 'thread between centres on the X–Y stage', 'm')}
        <g transform="translate(20,20)">${G.r(0, 0, 150, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'STAGE / GONIOMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dR" style="font-size:12px"')}</g>
        <g transform="translate(20,100)">${G.r(0, 0, 150, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'MEASURING', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dM" style="font-size:12px"')}</g>`, 'Toolmaker’s microscope with tilting column over a thread held between centres on an X–Y stage');
    },
    anim(svg, f, sim, p) {
      G.set(svg, 'col', 'transform', p.tilt === 'yes' ? `rotate(${-3} 432 250)` : '');
      if (!sim) return; const T = sim.truth; const ph = f < 0.6 ? 0 : f < 0.85 ? 1 : 2;
      if (ph === 0) { const k = Math.min(5, Math.floor(f / 0.6 * 6)); G.set(svg, 'stg', 'transform', `translate(${-k * 6} 0)`); G.txt(svg, 'dM', 'pitch, flank ' + (k + 1)); G.txt(svg, 'dR', k === 3 ? 'X: see picture' : 'X ' + U.f(T.xs[k], 3)); }
      else if (ph === 1) { G.txt(svg, 'dM', 'flank angles'); G.txt(svg, 'dR', f < 0.72 ? 'L ' + dm(T.gL) : 'R ' + dm(T.gR)); }
      else { G.txt(svg, 'dM', 'major diameter'); G.txt(svg, 'dR', f < 0.92 ? 'Y ' + U.f(T.y1, 3) : 'Y ' + U.f(T.y2, 3)); }
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth; api.title('View in the eyepiece'); api.sub(p.tilt === 'yes' ? 'column tilted: sharp flanks' : 'column vertical: one flank blurred');
      let c = el.querySelector('canvas[data-k="tm"]'); if (!c) { el.innerHTML = ''; c = document.createElement('canvas'); c.dataset.k = 'tm'; c.width = 280; c.height = 280; c.style.cssText = 'width:280px;max-width:100%;display:block;margin:auto;border-radius:50%'; el.appendChild(c); }
      const g = c.getContext('2d'); g.fillStyle = '#e9f2ff'; g.fillRect(0, 0, 280, 280); const pp = 120 / T.p; // px per mm
      g.save(); g.translate(140, 150); g.fillStyle = '#1b232b'; g.beginPath(); g.moveTo(-200, 200);
      for (let x = -2.5 * T.p; x <= 2.5 * T.p; x += T.p) { g.lineTo((x - T.p / 2) * pp, 40); g.lineTo(x * pp, 40 - 0.866 * T.p * 0.75 * pp); g.lineTo((x + T.p / 2) * pp, 40); }
      g.lineTo(200, 200); g.closePath(); if (p.tilt === 'no') { g.shadowColor = 'rgba(27,35,43,.9)'; g.shadowBlur = 10; g.shadowOffsetX = 4; } g.fill(); g.restore();
      const ang = f < 0.6 ? 90 : f < 0.72 ? 90 - T.gL : 90 + T.gR; g.save(); g.translate(140, 140); g.rotate(-ang * Math.PI / 180 + Math.PI / 2); g.strokeStyle = '#c0661c'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-140, 0); g.lineTo(140, 0); g.moveTo(0, -140); g.lineTo(0, 140); g.stroke(); g.restore();
    },
    simulate(p, r) {
      const Th = TH[p.th], pn = Th.p, d = Th.d, d2 = P.d2(d, pn); const psi = Math.atan(pn / (Math.PI * d2)) * 180 / Math.PI;
      const cum = []; let c = 0; for (let i = 0; i <= 5; i++) { if (i) c += (2.5 * U.gauss(r) + 1.2) / 1000; cum.push(c); } // cumulative pitch error, mm (slight progressive error)
      const x0 = U.q(3 + 4 * r(), 0.001); const xs = cum.map((e, i) => U.q(x0 + i * pn + e + 0.0012 * U.gauss(r), 0.001));
      const fl = 30 + (8 * U.gauss(r)) / 60, fr = 30 + (8 * U.gauss(r)) / 60; const blur = p.tilt === 'yes' ? 0 : (12 + 10 * r()) / 60; // a vertical column blurs one flank: reading biased
      const gL = Math.round((fl + blur) * 60) / 60, gR = Math.round((fr - 0.3 * blur) * 60) / 60; // goniometer readings, 1′
      const Dmaj = d - (0.04 + 0.12 * r()); const y1 = U.q(4 + 2 * r(), 0.001), y2 = U.q(y1 + Dmaj + 0.0015 * U.gauss(r), 0.001);
      const pitches = xs.slice(1).map((x, i) => x - xs[i]); const meanP = (xs[5] - xs[0]) / 5; const cumErr = xs.map((x, i) => (x - xs[0] - i * pn) * 1000); const iC = cumErr.reduce((b, v, i) => Math.abs(v) > Math.abs(cumErr[b]) ? i : b, 0);
      const T = { p: pn, d, d2, psi, xs, pitches, meanP, cumErr, cmax: cumErr[iC], gL, gR, inc: gL + gR, eL: (gL - 30) * 60, eR: (gR - 30) * 60, y1, y2, D: y2 - y1, fl, fr };
      return {
        truth: T, dur: 11,
        readout(f) { const ph = f < 0.6 ? 0 : f < 0.85 ? 1 : 2; return [['Measuring', ['pitch', 'flank angles', 'major diameter'][ph], ''], ['Stage X', ph === 0 ? '…' : '—', 'mm'], ['Goniometer', ph === 1 ? '…' : '—', ''], ['Column', p.tilt === 'yes' ? 'tilted ' + U.f(psi, 2) + '°' : 'vertical', '']]; },
        plot: { title: 'Cumulative pitch error', xlabel: 'Number of pitches from the first flank', ylabel: 'Cumulative error (µm)', series: [{ name: 'cumulative error', x: [0, 1, 2, 3, 4, 5], y: cumErr, type: 'linepts', color: 's1' }], hlines: [{ y: 0, color: 'muted' }], yzero: false, reveal: 'all', caption: 'Cumulative pitch error along five pitches' },
        specimen: [['Thread', `M${d} × ${pn}`, ''], ['Basic effective diameter d₂', U.f(d2, 4), 'mm'], ['Stage micrometers', '0–25 mm, 0.001 mm', ''], ['Goniometer eyepiece', '1′ vernier; 0° when the hair is perpendicular to the axis', ''], ['Column', p.tilt === 'yes' ? `tilted to the helix angle` : 'vertical', ''], ['Magnification', '30×', '']],
        obs: [{ title: 'Table 1. X readings on corresponding (left) flanks of successive threads', cols: ['Flank', 'X reading (mm)'], rows: xs.map((x, i) => [i, i === 3 ? '<b>see picture</b>' : U.f(x, 3)]) },
          { title: 'Table 2. Goniometer and Y readings', cols: ['Item', 'Reading'], textCols: [0, 1], rows: [['Left flank angle from the perpendicular to the axis', dm(gL)], ['Right flank angle from the perpendicular to the axis', dm(gR)], ['Y on the top crest', U.f(y1, 3) + ' mm'], ['Y on the bottom crest', U.f(y2, 3) + ' mm']] }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth; el.innerHTML = M.readPanel('Read the X micrometer at flank 3', 'Stage micrometer head with vernier, 0.001 mm.', [{ svg: M.micrometerSVG(T.xs[3], { vernier: true }), cap: 'X reading, flank 3', wide: true }]); },
    expHint: 'Individual pitch = difference of successive X readings; mean pitch = (X₅ − X₀)/5. Cumulative error at flank i = (X_i − X₀) − i·p. Included angle = left + right flank angles; flank-angle error = flank angle − 30°. Helix angle ψ = tan⁻¹[p/(π d₂)]. Major diameter = Y_bottom − Y_top.',
    calcs(sim) { const T = sim.truth; return [
      { key: 'x3', label: 'X reading at flank 3', unit: 'mm', truth: T.xs[3], abs: 0.0006, fmt: v => U.f(v, 3) },
      { key: 'mp', label: 'Mean pitch over five pitches', unit: 'mm', truth: T.meanP, abs: 0.0004, fmt: v => U.f(v, 4) },
      { key: 'ce', label: 'Largest cumulative pitch error, with its sign', unit: 'µm', truth: T.cmax, abs: 0.6, fmt: v => U.f(v, 1) },
      { key: 'ia', label: 'Included thread angle (left + right)', unit: '°', truth: T.inc, abs: 0.01, fmt: v => U.f(v, 3) },
      { key: 'el', label: 'Error of the left flank angle from 30°', unit: '′', truth: T.eL, abs: 0.6, fmt: v => U.f(v, 0) },
      { key: 'psi', label: 'Helix angle at the pitch diameter, to which the column is tilted', unit: '°', truth: T.psi, abs: 0.01, fmt: v => U.f(v, 3) },
      { key: 'D', label: 'Major diameter', unit: 'mm', truth: T.D, abs: 0.0008, fmt: v => U.f(v, 3) }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Included angle', unit: '°', value: T.inc, lo: 59.6, hi: 60.4, src: 'Good-quality thread: 60° ± 0.4°', fmt: v => U.f(v, 3) }, { label: 'Flank-angle difference left − right', unit: '′', value: T.eL - T.eR, lo: -20, hi: 20, src: p.tilt === 'yes' ? 'Symmetric flanks' : 'Large asymmetry: column not tilted', fmt: v => U.f(v, 0) }, { label: 'Largest cumulative pitch error', unit: 'µm', value: T.cmax, lo: -10, hi: 10, src: 'Typical production thread over 5 pitches', fmt: v => U.f(v, 1) }]; },
    valExtra(el, sim, p) { const T = sim.truth; const dEp = 1.732 * Math.abs(T.cmax); el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Effect on the fit</h4></div>${LAB.tableHTML({ cols: ['Pitch no.', 'Individual pitch (mm)', 'Cumulative error (µm)'], rows: T.pitches.map((v, i) => [i + 1, U.f(v, 3), U.f(T.cumErr[i + 1], 1)]) })}<p class="muted" style="font-size:.86rem">A cumulative pitch error δp makes the thread behave as if its effective diameter were larger by δp·cot 30° = 1.732 δp: here about ${U.f(dEp, 1)} µm. Flank-angle errors add roughly 0.36·p·|δα′| µm (p in mm, δα in minutes): about ${U.f(0.36 * T.p * (Math.abs(T.eL) + Math.abs(T.eR)) / 2, 1)} µm. These "virtual" diameter increases are why a thread with the correct simple effective diameter can still fail to enter its gauge. ${p.tilt === 'no' ? 'With the column vertical, the light passing along the helix grazes one flank and its edge appears blurred and displaced; the flank angles read unequal. Tilting the column by the helix angle ' + U.f(T.psi, 2) + '° makes both flanks sharp.' : ''}</p></div>`; },
    sample(sim) { const T = sim.truth; return `<div class="eq">Mean pitch = (X₅ − X₀)/5 = (${U.f(T.xs[5], 3)} − ${U.f(T.xs[0], 3)})/5 = <b>${U.f(T.meanP, 4)} mm</b></div><div class="eq">Cumulative errors (µm): ${T.cumErr.map(v => U.f(v, 1)).join(', ')}; largest <b>${U.f(T.cmax, 1)} µm</b></div><div class="eq">Included angle = ${dm(T.gL)} + ${dm(T.gR)} = <b>${U.f(T.inc, 3)}°</b>; left flank error = <b>${U.f(T.eL, 0)}′</b></div><div class="eq">ψ = tan⁻¹[${T.p}/(π × ${U.f(T.d2, 4)})] = <b>${U.f(T.psi, 3)}°</b></div><div class="eq">Major diameter = ${U.f(T.y2, 3)} − ${U.f(T.y1, 3)} = <b>${U.f(T.D, 3)} mm</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Single X setting', expr: '√[(0.001/√12)² + (1.2 µm setting on the flank)²]', val: T.xs[3], u: M.rss(M.uRes(0.001), 0.0012), unit: 'mm' }, { q: 'Mean pitch', expr: '√2 u_X / 5', val: T.meanP, u: Math.SQRT2 * M.rss(M.uRes(0.001), 0.0012) / 5, unit: 'mm' }, { q: 'Flank angle', expr: '√[(1′/√12)² + (2′ alignment)²]', val: T.gL, u: M.rss(1 / Math.sqrt(12), 2) / 60, unit: '°' }]; },
    conclude(sim, p) { const T = sim.truth; return `For the M${T.d} × ${T.p} thread the mean pitch over five pitches was ${U.f(T.meanP, 4)} mm and the largest cumulative pitch error ${U.f(T.cmax, 1)} µm. The flanks measured ${dm(T.gL)} and ${dm(T.gR)}, an included angle of ${U.f(T.inc, 2)}°. The major diameter was ${U.f(T.D, 3)} mm. ${p.tilt === 'yes' ? 'The column was tilted to the helix angle of ' + U.f(T.psi, 2) + '°, giving sharp flank images.' : 'The column was left vertical, so one flank image was blurred and the flank angles are biased; the column should be tilted by ' + U.f(T.psi, 2) + '°.'}`; },
    summary: 'A toolmaker’s microscope is a measuring microscope with a cross-hair eyepiece that can be rotated against a degree scale (goniometer) and a work stage moved in X and Y by micrometer heads. With the thread silhouetted in collimated light, the cross-hair is set on corresponding flanks of successive threads; the X readings give individual and cumulative pitch errors. Rotating the hair to lie along each flank gives the flank angles and the included angle. The Y traverse from crest to crest gives the major diameter. Because the thread is a helix, light passing along it grazes one flank; the microscope column is therefore tilted by the helix angle ψ = tan⁻¹[p/(πd₂)] so that both flanks are sharp.',
    formulas: [['Mean pitch', 'p̄ = (X_n − X₀)/n'], ['Cumulative pitch error', 'δp_i = (X_i − X₀) − i p'], ['Included angle', 'α = θ_L + θ_R'], ['Helix angle', 'ψ = tan⁻¹[p/(π d₂)]'], ['Diameter equivalent of pitch error', 'δE_p = δp cot(α/2) = 1.732 δp'], ['Major diameter', 'D = Y₂ − Y₁']],
    theory: `<h3>The toolmaker’s microscope</h3><p>A toolmaker’s microscope views the work by transmitted collimated light, so that its outline appears as a sharp silhouette. The eyepiece contains a cross-hair (often with additional angle lines) on a rotatable graticule; a degree scale with a vernier, the goniometer, reads its rotation to one minute. The work sits on a stage that moves in two perpendicular directions under micrometer heads reading to 0.001–0.005 mm, so any point on the silhouette can be brought under the cross-hair and its position read. The column can be tilted either way to follow the helix of a thread.</p>
      <h3>Measuring pitch</h3><p>The thread axis is aligned with the X traverse by following a crest line with the horizontal hair. The cross-hair is then set on a flank at the pitch line and the X micrometer read; the stage is moved until the hair lies on the corresponding flank of the next thread, and so on. Differences of successive readings are the individual pitches; the deviation of each reading from i × p is the cumulative pitch error. Pitch errors matter because a thread with an error δp over its length of engagement behaves as if its effective diameter were larger by about 1.732 δp: it will not enter a correct nut or gauge.</p>
      <h3>Measuring flank angles</h3><p>The goniometer is set to 0° with the hair perpendicular to the thread axis, then rotated until the hair lies exactly along one flank, and the angle read; then along the other flank. For an ISO thread each should be 30° and the sum 60°. Flank-angle errors also increase the virtual effective diameter.</p>
      <h3>The helix angle</h3><p>A thread is a helix of lead angle ψ = tan<sup>−1</sup>[p/(πd<sub>2</sub>)], a few degrees. Light parallel to the plane of the axis passes obliquely through the thread groove, so one flank is seen edge-on and sharp, the other blurred and displaced. Tilting the microscope column (or the centres) by ψ in the direction of the helix brings the light along the groove, and both flanks become sharp. For left-flank and right-flank readings some microscopes are tilted each way in turn.</p>`,
    procedure: ['Mount the thread between the centres of the stage; switch on the transmitted collimated light.', 'Calculate the helix angle and tilt the column by that amount in the direction of the helix; focus until the flanks are sharp.', 'Align the thread axis with the X traverse: traverse along a crest and adjust until the horizontal hair stays on the crest line.', 'Set the cross-hair on the left flank of a thread at about mid-depth and read X; move to the corresponding flank of each of the next five threads and read X.', 'Set the goniometer to 0°, rotate the hair onto the left flank and read; repeat for the right flank.', 'Set the horizontal hair on the top crest and read Y; traverse to the bottom crest and read Y.', 'Calculate pitch, cumulative error, flank angles, included angle and major diameter.'],
    precautions: ['Tilt the column to the helix angle before measuring flank angles.', 'Approach every micrometer reading from the same direction.', 'Align the thread axis with the X traverse; misalignment causes cosine error in pitch.', 'Focus carefully; a slightly defocused silhouette shifts the apparent flank.', 'Do not touch the optics; keep the stage clean.'],
    applications: ['Inspection of thread gauges, taps and small precision threads.', 'Measurement of form tools, cutting-tool angles and small parts (punches, dies, PCB features).', 'Checking profiles of small gears, cams and templates.', 'Measuring hole positions and distances on small components.'],
    errors: ['Column not tilted (one flank blurred).', 'Misalignment of the thread axis and the X traverse (cosine error).', 'Micrometer screw errors and backlash.', 'Setting the hair on the flank (focus, line thickness).', 'Goniometer zero error.', 'Temperature of the work.'],
    discussion: ['Why must the column be tilted to the helix angle? Change the setting and compare the flank angles.', 'A thread has a cumulative pitch error of 8 µm. By how much does its virtual effective diameter increase?', 'Why are flank angles measured separately rather than only the included angle?', 'List other measurements a toolmaker’s microscope can make.'],
    refs: ['ISO 965-1:2013, ISO general purpose metric screw threads. Tolerances.', 'ISO 1502:1996, ISO general-purpose metric screw threads. Gauges and gauging.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 11.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 11–12.', 'N. V. Raghavendra, L. Krishnamurthy, Engineering Metrology and Measurements, Oxford, Ch. 8.'],
    pre: [
      { q: 'A toolmaker’s microscope views the work mainly by', o: ['Reflected light', 'Transmitted light, as a silhouette', 'X-rays', 'Laser scanning'], a: 1, why: 'Collimated transmitted light gives a sharp profile.' },
      { q: 'The goniometer eyepiece measures', o: ['Lengths', 'Angles of the cross-hair', 'Magnification', 'Focus'], a: 1, why: 'A rotatable graticule with an angle scale.' },
      { q: 'The included angle of an ISO metric thread is', o: ['55°', '60°', '29°', '47.5°'], a: 1, why: 'ISO metric: 60°.' },
      { q: 'Pitch is measured by setting the hair on', o: ['Any two flanks', 'Corresponding flanks of successive threads', 'Crests only', 'Roots only'], a: 1, why: 'Corresponding points one pitch apart.' },
      { q: 'The helix angle of a thread depends on', o: ['Pitch and effective diameter', 'Flank angle only', 'Major diameter only', 'Material'], a: 0, why: 'ψ = tan⁻¹[p/(πd₂)].' }
    ],
    post: [
      { q: 'X readings over 5 pitches: 4.000 and 12.762 mm. Mean pitch:', o: ['1.750 mm', '1.7524 mm', '2.190 mm', '8.762 mm'], a: 1, why: '8.762/5 = 1.7524.' },
      { q: 'M12 × 1.75 (d₂ = 10.863 mm): helix angle ≈', o: ['1.47°', '2.94°', '5.2°', '0.5°'], a: 1, why: 'tan⁻¹(1.75/(π × 10.863)) = 2.94°.' },
      { q: 'Flank readings 30° 08′ and 29° 55′. Included angle:', o: ['60° 03′', '59° 63′', '60° 13′', '0° 13′'], a: 0, why: '30°08′ + 29°55′ = 59°63′ = 60°03′.' },
      { q: 'A cumulative pitch error of 6 µm increases the virtual effective diameter by about', o: ['6 µm', '10.4 µm', '3 µm', '20 µm'], a: 1, why: '1.732 × 6.' },
      { q: 'With the column vertical, you see', o: ['Both flanks sharp', 'One flank blurred and displaced', 'No image', 'A larger pitch'], a: 1, why: 'Light grazes one flank along the helix.' }
    ]
  });

  LAB.VALID[ID] = ['p', 'Pitch readings with a small progressive and random cumulative pitch error; flank angles 30° ± 8′ with a bias of 12–22′ on one flank when the column is not tilted (a teaching approximation of the edge-blur effect); helix angle and diameter relations exact.', 'ISO 965-1; Galyer & Shotbolt Ch. 11'];
  LAB.NOMEN[ID] = [['p', 'Nominal pitch', 'mm'], ['X_i', 'Stage X reading at flank i', 'mm'], ['p̄', 'Mean pitch', 'mm'], ['δp', 'Cumulative pitch error', 'µm'], ['θ_L, θ_R', 'Left and right flank angles', '°'], ['α', 'Included angle', '°'], ['ψ', 'Helix (lead) angle', '°'], ['d, d₂', 'Major and effective diameter', 'mm'], ['Y₁, Y₂', 'Y readings on the top and bottom crests', 'mm']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.0, title: 'Mount the thread between centres; light on', note: 'Transmitted collimated light', why: 'The work is mounted before the microscope is set.',
      draw(L, u, c) { c.op('stg', E(u)); L.innerHTML = ''; } },
    { op: 1, d: 2.4, title: s => 'Tilt the column to the helix angle and focus', note: (s, p) => p.tilt === 'yes' ? `ψ = ${U.f(s.truth.psi, 2)}°` : 'Column left vertical (flank images will be unequal)', why: 'Tilt and focus come before any reading.',
      draw(L, u, c) { c.set('col', 'transform', c.p.tilt === 'yes' ? `rotate(${-3 * E(u)} 432 250)` : ''); L.innerHTML = ''; } },
    { op: 2, d: 2.2, title: 'Align the thread axis with the X traverse', note: 'Follow a crest line with the horizontal hair', why: 'Alignment is checked before measuring pitch, to avoid cosine error.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(200, 140, 'crest line', 230, 158) : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'A microscope that measures', lines: [
      ['Light shines up through the stage, so the thread appears as a black silhouette against a bright field.', { s: 0 }],
      ['The column is tilted by the thread’s helix angle, so both flanks look sharp.', { s: 1 }],
      ['The stage moves under two micrometer heads; the eyepiece cross-hair can be rotated against an angle scale.', { s: 2 }]],
      q: { q: 'Why tilt the column?', o: ['To magnify more', 'So light passes along the helical groove and both flanks are sharp', 'To read the micrometer', 'To align the axis'], a: 1, why: 'Otherwise one flank is seen obliquely and blurred.' } },
    { title: 'Pitch, flank by flank', lines: [
      ['The cross-hair is set on a flank, and the X micrometer is read.', { r: [0, 0.3] }],
      ['The stage moves to the same flank of the next thread, five times over.', { r: [0.3, 0.6] }],
      ['Differences give each pitch; departures from whole pitches give the cumulative error.', null]],
      q: { q: 'Why does cumulative pitch error matter for fit?', o: ['It changes the thread colour', 'It acts like a larger effective diameter, so the screw may not enter the nut', 'It reduces the major diameter', 'It has no effect'], a: 1, why: 'Virtual effective diameter grows by 1.732 δp.' } },
    { title: 'Angles and diameter', lines: [
      ['Rotate the cross-hair to lie along the left flank and read the goniometer; then the right flank.', { r: [0.6, 0.85] }],
      ['Together they should make sixty degrees.', { r: [0.6, 0.85] }],
      ['Finally the Y traverse from crest to crest gives the major diameter.', { r: [0.85, 1] }]],
      q: { q: 'Flanks read 30° 05′ and 29° 58′. The included angle is', o: ['60° 03′', '59° 03′', '60° 13′', '59° 57′'], a: 0, why: '30°05′ + 29°58′ = 60°03′.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Low hazard. Lamp housing gets hot.', 'Centres are pointed.'],
    ppe: ['None beyond normal lab wear'],
    rules: ['Do not touch lenses; use lens tissue only.', 'Switch the lamp off when not in use.', 'Support the work when releasing the centres.'],
    emerg: ['Report a broken bulb or damaged optics to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Toolmaker’s microscope', '30×, goniometer 1′, stage 25 × 25 mm, 0.001 mm', 'Instrument'], ['Centres', 'Tilting ±15°', 'Hold threads'], ['Thread specimens', 'M10×1.5, M12×1.75, M16×2', 'Work'], ['Thread-profile graticule', '60° ISO and 55° Whitworth outlines', 'Profile comparison']], note: 'A profile projector does the same job on a screen at 10–100×, convenient for comparing a profile with an overlay chart.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const th = Pk(r, [['M10', 10, 1.5], ['M12', 12, 1.75], ['M16', 16, 2], ['M20', 20, 2.5], ['M24', 24, 3]]), d2 = P.d2(th[1], th[2]), ans = Math.atan(th[2] / (Math.PI * d2)) * 180 / Math.PI; return { title: 'Helix angle', q: `Find the helix angle at the pitch diameter of an ${th[0]} × ${th[2]} thread (d₂ = ${s(d2, 5)} mm).`, ans, unit: '°', hints: ['ψ = tan⁻¹[p/(π d₂)].', 'Answer in degrees.'], sol: `ψ = tan⁻¹[${th[2]}/(π × ${s(d2, 5)})] = <b>${s(ans)}°</b>.` }; },
    r => { const pp = Pk(r, [1.5, 1.75, 2, 2.5]), n = Pk(r, [4, 5, 6, 8]), err = R(r, -12, 12, 1), x0 = R(r, 2, 6, 3), xn = x0 + n * pp + err / 1000, ans = (xn - x0) / n; return { title: 'Mean pitch', q: `On a thread of nominal pitch ${pp} mm, X readings on corresponding flanks ${n} pitches apart are ${x0} and ${s(xn, 7)} mm. Find the mean pitch.`, ans, unit: 'mm', hints: ['p̄ = (X_n − X₀)/n.', 'Keep four decimals.'], sol: `p̄ = (${s(xn, 7)} − ${x0})/${n} = <b>${s(ans, 6)} mm</b>.` }; },
    r => { const dp = R(r, 2, 20, 1), ans = dp / Math.tan(Math.PI / 6); return { title: 'Virtual effective diameter', q: `A 60° thread has a cumulative pitch error of ${dp} µm over its length of engagement. By how much does its virtual effective diameter increase?`, ans, unit: 'µm', hints: ['δE = δp cot(α/2).', 'cot 30° = 1.732.'], sol: `δE = ${dp} × 1.732 = <b>${s(ans)} µm</b>.` }; }
  ];
})();
