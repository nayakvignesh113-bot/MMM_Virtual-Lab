/* Exp 06 — Speed measurement: calibration of a tachometer against a stroboscope and a magnetic pickup. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'speed';
  const SETS = [600, 1100, 1600, 2100, 2600, 3100];
  const TACH = { contact: { name: 'Hand-held contact tachometer (rubber cone)', bias: [-0.25, -0.45], sd: 0.12 }, photo: { name: 'Hand-held optical (photo) tachometer', bias: [-0.02, -0.03], sd: 0.03 } };
  const DX = 200, DY = 130, DR = 56;

  LAB.register({
    id: ID, no: 6, cat: 'cal', title: 'Calibration of a Tachometer using a Stroboscope and a Magnetic Pickup', std: 'IS 6327 / ISO 2954 (methods)', short: 'A motor is run at six speeds. Its speed is measured with a 60-tooth gear and magnetic pickup, with a hand tachometer, and with a stroboscope that you tune yourself until the mark stands still, avoiding the multiple-image traps.', tags: 'speed measurement rpm stroboscope flash rate magnetic pickup inductive proximity gear teeth frequency counter tachometer contact optical calibration',
    aim: 'To measure the speed of a rotating shaft with a magnetic pickup and frequency counter, with a stroboscope and with a hand tachometer, and to calibrate the tachometer against the stroboscope.',
    objectives: ['Explain how a magnetic pickup and toothed wheel produce a frequency proportional to speed.', 'Use a stroboscope to find shaft speed, recognising stationary images at sub-multiples and multiples of the speed.', 'Calculate speed from two consecutive flash rates that give single stationary images.', 'Determine the error and correction of a hand tachometer over its range.', 'Compare contact and non-contact methods of speed measurement.'],
    apparatus: ['DC motor with speed controller, 0–3500 rpm, shaft with a white reference mark on a black disc', 'Steel gear, 60 teeth, and variable-reluctance (magnetic) pickup with 0.5 mm air gap', 'Frequency counter, gate time 1 s (resolution 1 Hz)', 'Xenon stroboscope, 100–20 000 flashes/min, digital flash-rate display 0.1 /min', 'Hand tachometer under test (contact or optical)', 'Reflective tape for the optical tachometer'],
    stdNote: 'Speed is a derived quantity traceable through time (frequency). The stroboscope and the toothed-wheel pickup are frequency-based and serve as references for hand tachometers.',
    params: [
      { id: 'tach', label: 'Tachometer under test', type: 'select', options: Object.entries(TACH).map(([k, v]) => [k, v.name]), def: 'contact' },
      { id: 'z', label: 'Teeth on the pickup gear', type: 'select', options: [['60', '60 teeth (1 Hz = 1 rpm)'], ['30', '30 teeth']], def: '60' }
    ],
    opSteps: ['Check the shaft guard, the reference mark and the pickup air gap', 'Connect the pickup to the frequency counter', 'Start the motor at the lowest speed setting', 'At each setting, read the counter and the hand tachometer', 'Find the speed with the stroboscope: highest flash rate that freezes a single image', 'Repeat for every speed setting', 'Stop the motor; wait for it to come to rest before touching'],
    svg(p) {
      let teeth = ''; for (let i = 0; i < 30; i++) { const a = i / 30 * 2 * Math.PI; teeth += `<rect x="-3" y="-34" width="6" height="7" class="steelD" transform="rotate(${a * 180 / Math.PI})"/>`; }
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        ${G.r(30, 96, 90, 70, 'mach', 'rx="6"')}${G.t(42, 182, 'DC motor', 'm')}<rect x="120" y="125" width="270" height="12" class="steel"/>
        <g transform="translate(${DX},${DY})"><g id="disc"><circle r="${DR}" class="ink"/><circle r="${DR - 4}" fill="#202830"/><rect x="-4" y="${-DR + 4}" width="8" height="22" fill="#fff"/></g></g>
        <g transform="translate(330,${DY})"><g id="gear"><circle r="28" class="steel"/>${teeth}</g></g>
        <rect id="pick" x="318" y="58" width="24" height="34" rx="3" class="acc"/>${G.t(346, 70, 'magnetic pickup', 'm')}
        <path id="pw" d="M330 58 C 330 20, 420 20, 430 34" fill="none" stroke="var(--accent)" stroke-width="2" style="display:none"/>
        <g id="strobe">${G.r(120, 222, 64, 36, 'mach2', 'rx="4"')}<circle id="flash" cx="${152}" cy="222" r="9" fill="#fff8d0" opacity="0"/>${G.t(118, 276, 'stroboscope', 'm')}</g>
        <g id="tach" style="display:none"><rect x="406" y="122" width="90" height="18" rx="4" class="mach2"/><circle cx="398" cy="131" r="8" class="ink"/>${G.t(410, 160, 'hand tachometer', 'm')}</g>
        <g transform="translate(430,20)">${G.r(0, 0, 114, 56, 'disp', 'rx="4"')}${G.t(8, 14, 'FREQUENCY COUNTER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '---- Hz', 'big', 'id="dF"')}</g>
        <g transform="translate(400,226)">${G.r(0, 0, 144, 56, 'disp', 'rx="4"')}${G.t(8, 14, 'TACHOMETER', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '---- rpm', 'big', 'id="dT"')}</g>
        <g transform="translate(220,226)">${G.r(0, 0, 160, 56, 'disp', 'rx="4"')}${G.t(8, 14, 'CONTROLLER SETTING', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 40, '—', 'big', 'id="dS"')}</g>
        ${G.r(150, 60, 120, 140, 'glass', 'rx="8" opacity=".5"')}${G.t(150, 54, 'guard (transparent)', 'm')}`, 'Speed measurement rig: motor, disc with reference mark, 60-tooth gear with magnetic pickup, stroboscope and hand tachometer');
    },
    anim(svg, f, sim, p) {
      if (!sim) { G.show(svg, 'pw', false); G.show(svg, 'tach', false); return; }
      G.show(svg, 'pw', true);
      const n = sim.rows.length, x = f * n, k = Math.min(n - 1, Math.floor(x)), rw = sim.rows[k], u = x - k;
      const ang = (f * 900) % 360; G.set(svg, 'disc', 'transform', `rotate(${(ang * (rw.N / 1000)) % 360})`); G.set(svg, 'gear', 'transform', `rotate(${(ang * (rw.N / 1000)) % 360})`);
      G.show(svg, 'tach', u > 0.4 && u < 0.85); G.set(svg, 'flash', 'opacity', u > 0.6 && Math.floor(f * 400) % 2 ? 0.95 : 0);
      G.txt(svg, 'dS', `step ${k + 1}: ${rw.set} rpm`); G.txt(svg, 'dF', u > 0.25 ? rw.f + ' Hz' : '---- Hz'); G.txt(svg, 'dT', u > 0.5 ? rw.tach + ' rpm' : '---- rpm');
    },
    liveView(el, f, sim, p, api) {
      const n = sim.rows.length, k = Math.min(n - 1, Math.floor(f * n)), done = sim.rows.slice(0, k + 1);
      api.title('Tachometer error so far'); api.sub(`${done.length} of ${n} speeds`);
      G.profileView(el, { xlabel: 'Reference speed (rpm)', ylabel: 'Tachometer − reference (rpm)', series: [{ name: 'tachometer', x: done.map(r => r.N), y: done.map(r => r.tach - r.N), type: 'linepts', color: 's2' }, { name: 'pickup', x: done.map(r => r.N), y: done.map(r => r.Np - r.N), type: 'linepts', color: 's1' }], xmin: 0, xmax: 3400, yzero: false, hlines: [{ y: 0, color: 'muted' }] }, 210);
    },
    simulate(p, r) {
      const Tt = TACH[p.tach], z = +p.z, iS = 3;
      const rows = SETS.map(set => { const N = set * (1 + 0.02 * (r() - 0.5)) + 2 * U.gauss(r); const f = Math.round(N * z / 60 + 0.4 * (r() - 0.5)); const Np = f * 60 / z; const bias = (Tt.bias[0] + (Tt.bias[1] - Tt.bias[0]) * N / 3000) / 100; const tach = Math.round(N * (1 + bias + Tt.sd / 100 * U.gauss(r))); const Fs = U.q(N * (1 + 0.0004 * U.gauss(r)), 0.1); return { set, N, f, Np, tach, Fs }; });
      const rw = rows[iS]; // the one the student finds with the stroboscope
      const st6 = rows[5], n1 = 2 + Math.floor(r() * 2); const F1 = U.q(st6.N / n1, 0.1), F2 = U.q(st6.N / (n1 + 1), 0.1); const N6 = F1 * F2 / (F1 - F2);
      const err = rows.map(x => (x.tach - x.Fs) / x.Fs * 100); const iE = err.reduce((b, v, i) => Math.abs(v) > Math.abs(err[b]) ? i : b, 0);
      const fit = U.linfit(rows.map(x => x.tach), rows.map(x => x.Fs));
      const T = { rows, iS, Npick: rw.Np, Nstrobe: rw.N, eS: (rw.tach - rw.N) / rw.N * 100, err, iE, F1, F2, N6, n1, fit, z };
      return {
        rows, truth: T, dur: 12,
        readout(f) { const n = rows.length, k = Math.min(n - 1, Math.floor(f * n)), x = rows[k]; return [['Setting', `${k + 1}/${n}`, ''], ['Counter', x.f, 'Hz'], ['Tachometer', x.tach, 'rpm'], ['Strobe', k === iS ? 'find it' : U.f(x.Fs, 1), '/min'], ['Teeth', z, '']]; },
        plot: { title: 'Tachometer reading against reference speed', xlabel: 'Stroboscope speed (rpm)', ylabel: 'Tachometer error (%)', series: [{ name: 'tachometer error', x: rows.filter((x, i) => i !== iS).map(x => x.Fs), y: rows.filter((x, i) => i !== iS).map(x => (x.tach - x.Fs) / x.Fs * 100), type: 'linepts', color: 's2' }], hlines: [{ y: 0, color: 'muted' }], yzero: false, caption: 'Error of the hand tachometer relative to the stroboscope' },
        specimen: [['Tachometer under test', Tt.name, ''], ['Gear teeth z', z, ''], ['Counter gate time', '1', 's'], ['Counter resolution', '1', 'Hz'], ['Stroboscope display resolution', '0.1', 'flashes/min'], ['Tachometer resolution', '1', 'rpm']],
        obs: [{ title: 'Table 1. Speed readings', cols: ['Setting', 'Counter f (Hz)', 'Tachometer (rpm)', 'Stroboscope: single stationary image at the highest rate (flashes/min)'], rows: rows.map((x, i) => [`${i + 1} (≈${x.set})`, x.f, x.tach, i === iS ? '<b>find it with the stroboscope below</b>' : U.f(x.Fs, 1)]) },
          { title: 'Table 2. Operator’s strobe notes at setting 6 (display not trusted)', cols: ['Observation', 'Flash rate (flashes/min)'], textCols: [0], rows: [['Single stationary image', U.f(F1, 1)], ['Next lower rate with a single stationary image', U.f(F2, 1)]], note: 'Both rates are sub-multiples of the true speed. Find the speed from them.' }],
        truth: T
      };
    },
    expExtra(el, sim) {
      const T = sim.truth, N = T.Nstrobe;
      el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Stroboscope: find the speed at setting ${T.iS + 1}</h4><span class="eyebrow">tune the flash rate</span></div>
        <p class="muted" style="font-size:.86rem;margin-bottom:8px">Start high and come down. The mark freezes as a <b>single image</b> when the flash rate equals the speed, but also at one half, one third … of it; at twice the speed you see <b>two</b> marks. The speed is the <b>highest</b> flash rate that gives a single stationary image. Check by halving: at half that rate you should again see one stationary mark.</p>
        <div class="grid2" style="align-items:center"><canvas id="strc" width="280" height="280" style="width:280px;height:280px;max-width:100%;background:#111;border-radius:10px"></canvas>
        <div class="stack" style="gap:10px"><label class="muted" for="strF" style="font-size:.85rem">Flash rate</label><input type="range" id="strF" min="300" max="8000" step="1" value="5000">
          <div class="controls"><button class="btn quiet small" data-d="-100">−100</button><button class="btn quiet small" data-d="-10">−10</button><button class="btn quiet small" data-d="-1">−1</button><button class="btn quiet small" data-d="-0.1">−0.1</button><button class="btn quiet small" data-d="0.1">+0.1</button><button class="btn quiet small" data-d="1">+1</button><button class="btn quiet small" data-d="10">+10</button><button class="btn quiet small" data-d="100">+100</button></div>
          <div class="readouts" style="grid-template-columns:1fr"><div><span>Strobe display</span><b id="strD">5000.0</b><i>flashes/min</i></div></div>
          <p class="muted" style="font-size:.8rem" id="strM"></p></div></div></div>`;
      const cv = el.querySelector('#strc'), g = cv.getContext('2d'), sl = el.querySelector('#strF'); let F = 5000, raf = 0, t0 = performance.now();
      const set = v => { F = U.clamp(Math.round(v * 10) / 10, 300, 8000); sl.value = F; el.querySelector('#strD').textContent = U.f(F, 1); };
      sl.oninput = () => set(+sl.value); el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => set(F + +b.dataset.d));
      const draw = now => {
        if (!document.body.contains(cv)) { cancelAnimationFrame(raf); return; }
        const t = (now - t0) / 1000, ff = F / 60, k1 = Math.floor(t * ff), pers = 0.07; g.fillStyle = '#0b0e12'; g.fillRect(0, 0, 280, 280);
        g.save(); g.translate(140, 140); g.fillStyle = '#1d242c'; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.fill();
        for (let k = k1; k > k1 - 60; k--) { const tk = k / ff, age = t - tk; if (age > pers) break; const th = 2 * Math.PI * (N / 60) * tk; g.save(); g.rotate(th); g.globalAlpha = Math.max(0, 1 - age / pers) * 0.95; g.fillStyle = '#fff'; g.fillRect(-7, -116, 14, 40); g.restore(); }
        g.globalAlpha = 1; g.fillStyle = '#556'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.restore();
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      el.querySelector('#strM').textContent = 'Images drifting slowly mean you are close; a drift against the rotation means the flash rate is slightly high.';
    },
    calcs(sim) { const T = sim.truth; return [
      { key: 'np', label: `Speed from the magnetic pickup at setting ${T.iS + 1}, N = 60 f/z`, unit: 'rpm', truth: T.Npick, abs: 0.6, fmt: v => U.f(v, 1) },
      { key: 'ns', label: `Speed found with the stroboscope at setting ${T.iS + 1}`, unit: 'rpm', truth: T.Nstrobe, tol: 0.002, fmt: v => U.f(v, 1) },
      { key: 'es', label: `Tachometer error at setting ${T.iS + 1}, (tach − strobe)/strobe`, unit: '%', truth: T.eS, abs: 0.06, fmt: v => U.f(v, 2) },
      { key: 'emax', label: 'Largest tachometer error over all settings, with its sign', unit: '%', truth: T.err[T.iE], abs: 0.06, fmt: v => U.f(v, 2) },
      { key: 'n6', label: 'Speed at setting 6 from the two strobe notes, N = F₁F₂/(F₁ − F₂)', unit: 'rpm', truth: T.N6, tol: 0.003, fmt: v => U.f(v, 1) },
      { key: 'cf', label: 'Calibration slope: least-squares slope of strobe speed against tachometer reading', unit: '—', truth: T.fit.m, abs: 0.002, fmt: v => U.f(v, 4) }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Pickup vs stroboscope at setting ' + (T.iS + 1), unit: 'rpm', value: T.Npick - T.Nstrobe, lo: -60 / T.z, hi: 60 / T.z, src: '±1 count of the counter', fmt: v => U.f(v, 2) }, { label: 'Largest tachometer error', unit: '%', value: T.err[T.iE], lo: p.tach === 'contact' ? -1 : -0.1, hi: p.tach === 'contact' ? 1 : 0.1, src: p.tach === 'contact' ? 'Contact tachometer ±1 %' : 'Optical tachometer ±0.05 % + 1 digit', fmt: v => U.f(v, 2) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>All three methods side by side</h4></div>${LAB.tableHTML({ cols: ['Setting', 'Pickup (rpm)', 'Stroboscope (rpm)', 'Tachometer (rpm)', 'Tach error (%)', 'Correction (rpm)'], rows: T.rows.map((x, i) => [i + 1, U.f(x.Np, 1), U.f(i === T.iS ? x.N : x.Fs, 1), x.tach, U.f((x.tach - (i === T.iS ? x.N : x.Fs)) / (i === T.iS ? x.N : x.Fs) * 100, 2), U.f((i === T.iS ? x.N : x.Fs) - x.tach, 0)]) })}<p class="muted" style="font-size:.84rem">${p.tach === 'contact' ? 'The contact tachometer under-reads, more at high speed: its rubber cone slips and deforms on the shaft centre. It also loads the shaft slightly. Apply the correction or use a non-contact method.' : 'The optical tachometer counts reflections from the tape and is as good as the counter; its error is the last digit.'} The pickup counts ${T.z} pulses per revolution in a 1 s gate, so its resolution is ${U.f(60 / T.z, 0)} rpm.</p></div>`; },
    sample(sim) { const T = sim.truth, x = T.rows[T.iS]; return `<div class="eq">Pickup: N = 60 f/z = 60 × ${x.f}/${T.z} = <b>${U.f(T.Npick, 1)} rpm</b></div><div class="eq">Stroboscope: highest flash rate with a single stationary image = <b>${U.f(T.Nstrobe, 1)} /min</b> = speed in rpm</div><div class="eq">Tachometer error = (${x.tach} − ${U.f(T.Nstrobe, 1)})/${U.f(T.Nstrobe, 1)} × 100 = <b>${U.f(T.eS, 2)} %</b></div><div class="eq">Setting 6: F₁ = ${U.f(T.F1, 1)}, F₂ = ${U.f(T.F2, 1)} are N/${T.n1} and N/${T.n1 + 1}: N = F₁F₂/(F₁ − F₂) = ${U.f(T.F1, 1)} × ${U.f(T.F2, 1)}/${U.f(T.F1 - T.F2, 1)} = <b>${U.f(T.N6, 1)} rpm</b></div>`; },
    uncert(sim) { const T = sim.truth; return [{ q: 'Pickup speed', expr: '±1 count in a 1 s gate: u = (60/z)/√3', val: T.Npick, u: 60 / T.z / Math.sqrt(3), unit: 'rpm' }, { q: 'Stroboscope speed', expr: 'judgement of "stationary": drift < 1 rev in 10 s → u ≈ 0.1 % / √3', val: T.Nstrobe, u: T.Nstrobe * 0.001 / Math.sqrt(3), unit: 'rpm' }, { q: 'Tachometer error', expr: '√[(u_tach/N)² + (u_strobe/N)²] × 100, u_tach = 1/√12 rpm', val: Math.abs(T.eS) || 0.01, u: M.rss(1 / Math.sqrt(12) / T.Nstrobe, 0.001 / Math.sqrt(3)) * 100, unit: '%' }]; },
    conclude(sim, p) { const T = sim.truth; return `The magnetic pickup and the stroboscope agreed to within the counter resolution of ${U.f(60 / T.z, 0)} rpm. At setting ${T.iS + 1} the stroboscope gave ${U.f(T.Nstrobe, 1)} rpm and the ${p.tach === 'contact' ? 'contact' : 'optical'} tachometer read ${U.f(T.eS, 2)} % from it; over the range its largest error was ${U.f(T.err[T.iE], 2)} %. The tachometer reading should be multiplied by ${U.f(T.fit.m, 4)} (calibration slope) to give the true speed. From two consecutive single-image flash rates at setting 6 the speed was ${U.f(T.N6, 0)} rpm.`; },
    summary: 'Speed is measured by counting events per unit time. A magnetic pickup facing a steel gear of z teeth produces z voltage pulses per revolution, so a frequency counter reading f gives N = 60f/z rpm. A stroboscope flashes at a known rate; when the flash rate equals the speed, a mark on the shaft is lit at the same position every revolution and appears stationary. A single stationary image also appears at one half, one third … of the speed, and two images at twice the speed, so the speed is the highest rate that gives one stationary image; from two consecutive sub-multiples F₁ and F₂, N = F₁F₂/(F₁ − F₂). A hand tachometer is calibrated by comparing its readings with these frequency-based references.',
    formulas: [['Toothed wheel and pickup', 'N = 60 f / z  (rpm)'], ['Stroboscope', 'single stationary image when F = N/n, n = 1, 2, 3 …'], ['Two images', 'F = 2N'], ['From two consecutive single-image rates', 'N = F₁F₂/(F₁ − F₂)'], ['Tachometer error', 'e = (N_tach − N_ref)/N_ref × 100 %'], ['Pickup resolution', 'ΔN = 60/(z·t_gate)']],
    theory: `<h3>Speed as a frequency</h3><p>Rotational speed is revolutions per unit time, so the most accurate speed measurements count events and divide by a precisely known time from a quartz clock. Both reference methods in this experiment do that: the toothed-wheel pickup counts teeth per second and the stroboscope matches a known flash frequency to the rotation.</p>
      <h3>Magnetic (variable-reluctance) pickup</h3><p>A permanent magnet wound with a coil is placed close to a steel gear. As each tooth passes, the reluctance of the magnetic circuit changes and a voltage pulse is induced in the coil. With z teeth the pulse frequency is f = zN/60. A counter with a 1 s gate counts f to ±1 pulse, so with 60 teeth the reading in hertz is the speed in rpm, to ±1 rpm. The pickup needs no contact and no power, but its output falls at low speed because the induced voltage is proportional to the rate of flux change.</p>
      <h3>The stroboscope</h3><p>A xenon lamp produces short, intense flashes at an adjustable rate. If the shaft turns exactly once between flashes, a mark on it is lit at the same place each time and appears to stand still. If it turns twice, or three times, between flashes, the mark also stands still: single stationary images appear at all sub-multiples N/2, N/3 … of the speed. If the flash rate is twice the speed, the mark is lit at two opposite positions and two images appear. The rule is therefore to start at a high rate and decrease it until the first single stationary image appears, then confirm by halving the rate. If the display is not trusted, two consecutive single-image rates F<sub>1</sub> = N/n and F<sub>2</sub> = N/(n + 1) give N = F<sub>1</sub>F<sub>2</sub>/(F<sub>1</sub> − F<sub>2</sub>).</p>
      <h3>Hand tachometers</h3><p>A contact tachometer is pressed onto the centre of the shaft through a rubber cone; slip and deformation of the cone make it read low, increasingly at high speed, and it takes a little power from the shaft. An optical tachometer counts light reflected from a strip of tape and has no slip; its error is essentially one digit. Calibration compares the tachometer with the references at several speeds and gives an error curve or a correction factor.</p>`,
    procedure: ['Check that the guard is in place, the reference mark is clean and the pickup air gap is about 0.5 mm.', 'Connect the pickup to the frequency counter and set a 1 s gate.', 'Start the motor at the lowest setting and let the speed settle.', 'Read the counter, then measure the speed with the hand tachometer (cone pressed lightly and squarely, or optical beam on the tape).', 'Set the stroboscope to a high rate and reduce it until the mark first appears as a single stationary image; note the rate. Halve the rate to confirm.', 'Repeat for each speed setting.', 'Stop the motor and wait until it has come to rest before approaching the shaft.'],
    precautions: ['Never touch a rotating shaft; keep loose clothing, hair and ID cards clear.', 'Press a contact tachometer lightly and squarely; heavy pressure slows the shaft and wears the cone.', 'Remember the stroboscope can make a running machine look stationary.', 'Do not look directly into the strobe lamp; flashing light can trigger photosensitive epilepsy.', 'Let the speed settle before each reading.'],
    applications: ['Setting and checking spindle speeds of machine tools.', 'Engine and turbine speed measurement and overspeed protection (toothed wheel pickups).', 'Inspection of rotating and reciprocating machinery under stroboscopic light.', 'Calibration of tachometers and tachogenerators.'],
    errors: ['Counter ±1 count (resolution 60/z rpm in a 1 s gate).', 'Speed fluctuation during the reading.', 'Mistaking a sub-multiple or multiple for the true speed with the stroboscope.', 'Slip and loading of a contact tachometer.', 'Parallax and judgement of "stationary".'],
    discussion: ['At which flash rates did you see one, two or three images of the mark? Explain each.', 'Why does the contact tachometer read low, and why does its error grow with speed?', 'What limits the resolution of the pickup method, and how could you improve it?', 'The stroboscope makes a running fan look stopped. What safety rule follows?'],
    refs: ['E. O. Doebelin, D. N. Manik, Measurement Systems, 6th ed., McGraw-Hill, Ch. 4.', 'T. G. Beckwith, R. D. Marangoni, J. H. Lienhard, Mechanical Measurements, 6th ed., Pearson, Ch. 10.', 'A. K. Sawhney, A Course in Mechanical Measurements and Instrumentation, Dhanpat Rai, Ch. 20.', 'R. K. Rajput, Mechanical Measurements and Instrumentation, S. K. Kataria.'],
    pre: [
      { q: 'A 60-tooth gear turns at 1500 rpm in front of a magnetic pickup. The pulse frequency is', o: ['25 Hz', '1500 Hz', '90 000 Hz', '60 Hz'], a: 1, why: 'f = zN/60 = 60 × 1500/60 = 1500 Hz.' },
      { q: 'A stroboscope freezes a single mark when the flash rate equals the speed and also when it is', o: ['Twice the speed', 'Half the speed', 'The speed plus 100', 'Any value'], a: 1, why: 'At N/2 the shaft makes exactly two turns between flashes.' },
      { q: 'At a flash rate of twice the speed you see', o: ['One image', 'Two images', 'No image', 'A blur'], a: 1, why: 'The mark is lit every half revolution.' },
      { q: 'A magnetic pickup needs', o: ['Contact with the shaft', 'A ferromagnetic toothed wheel', 'A reflective tape', 'An external light'], a: 1, why: 'It senses the change in reluctance as teeth pass.' },
      { q: 'A contact tachometer usually reads', o: ['High', 'Low, because of slip', 'Exactly', 'Twice the speed'], a: 1, why: 'The cone slips on the shaft centre.' }
    ],
    post: [
      { q: 'Single stationary images are seen at 1200 and 900 flashes/min (consecutive). The speed is', o: ['1050 rpm', '3600 rpm', '2100 rpm', '300 rpm'], a: 1, why: 'N = 1200 × 900/300 = 3600 rpm.' },
      { q: 'With a 30-tooth gear and a 1 s gate, the counter resolution is', o: ['1 rpm', '2 rpm', '30 rpm', '0.5 rpm'], a: 1, why: '60/30 = 2 rpm per count.' },
      { q: 'You start low and increase the flash rate. The first single image you see is likely', o: ['The true speed', 'A sub-multiple of the speed', 'Twice the speed', 'Not possible'], a: 1, why: 'Sub-multiples come first from below; that is why you start high.' },
      { q: 'The tachometer reads 2085 rpm when the reference is 2100 rpm. Its error is', o: ['+0.71 %', '−0.71 %', '−15 %', '−1.5 %'], a: 1, why: '(2085 − 2100)/2100 = −0.71 %.' },
      { q: 'A slowly drifting mark under the strobe means', o: ['The lamp is failing', 'The flash rate is close to, but not exactly at, a sub-multiple or the speed', 'The motor has stopped', 'The counter is wrong'], a: 1, why: 'A small mismatch makes the mark advance a little each flash.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Counter pulses N·z/60 with ±1 count; stroboscope images computed from the actual flash instants and shaft angle (persistence 70 ms), reproducing sub-multiple and multiple images exactly; tachometer slip error −0.25 to −0.45 % for contact, ±0.03 % for optical, typical of hand instruments.', 'Doebelin Ch. 4; manufacturer data (Monarch, Testo)'];
  LAB.NOMEN[ID] = [['N', 'Shaft speed', 'rpm'], ['f', 'Pickup pulse frequency', 'Hz'], ['z', 'Number of gear teeth', '—'], ['F, F₁, F₂', 'Stroboscope flash rates', 'flashes/min'], ['n', 'Integer sub-multiple', '—'], ['e', 'Tachometer error', '%'], ['t_gate', 'Counter gate time', 's']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.4, title: 'Check guard, reference mark and pickup gap', note: 'Air gap about 0.5 mm, set with a feeler gauge', why: 'Mechanical checks come before anything is switched on.',
      draw(L, u, c) { c.set('pick', 'transform', `translate(0 ${-14 * (1 - E(u))})`); L.innerHTML = c.active ? tag(360, 100, '0.5 mm gap', 330, 94) : ''; } },
    { op: 1, d: 2.2, title: 'Connect the pickup to the frequency counter', note: '1 s gate selected', why: 'The counter is connected before the motor runs, so the first reading is not missed.',
      draw(L, u, c) { c.show('pw', true); c.op('pw', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.4, title: 'Start the motor at the lowest setting', note: 'Let it settle for half a minute', why: 'The motor is started only when the guard is checked and the counter is ready.',
      draw(L, u, c) { c.set('disc', 'transform', `rotate(${u * u * 720})`); c.set('gear', 'transform', `rotate(${u * u * 720})`); c.txt('dS', 'step 1: 600 rpm'); L.innerHTML = ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Counting teeth', lines: [
      ['A steel gear with sixty teeth turns with the shaft. A magnetic pickup sits half a millimetre from the teeth.', { s: 0 }],
      ['Every tooth that passes makes a pulse. A counter counts them for exactly one second.', { s: 1 }],
      ['Sixty teeth, so the count in hertz is the speed in revolutions per minute.', { s: 2 }]],
      q: { q: 'With a 30-tooth gear, the counter reads 800 Hz. The speed is', o: ['800 rpm', '1600 rpm', '400 rpm', '24 000 rpm'], a: 1, why: 'N = 60 × 800/30 = 1600 rpm.' } },
    { title: 'Freezing motion with light', lines: [
      ['A stroboscope fires short flashes. If the shaft turns exactly once between flashes, the white mark is always lit in the same place, and seems to stand still.', { r: [0, 0.4] }],
      ['But it also stands still if the shaft turns twice, or three times, between flashes. And at twice the speed you see two marks.', { r: [0.4, 0.8] }],
      ['So come down from a high flash rate. The first single, still mark is the speed.', { r: [0.8, 1] }]],
      q: { q: 'A single stationary mark appears at 1500 flashes/min. Halving to 750 also gives a single mark. The speed is', o: ['750 rpm', '1500 rpm or a multiple you have not checked from above', '3000 rpm for certain', '375 rpm'], a: 1, why: 'Halving confirms 1500 is not twice the speed; you still need to have come down from above to rule out 3000.' } },
    { title: 'Checking the hand tachometer', lines: [
      ['At each speed the hand tachometer is read too. Its error is its reading minus the reference, as a percentage.', null],
      ['A rubber-cone tachometer slips a little, so it reads low, and more so at high speed.', null],
      ['A straight line through tachometer against reference gives a correction for every reading.', null]],
      q: { q: 'Why is the pickup a better reference than the contact tachometer?', o: ['It is cheaper', 'It counts pulses against a quartz time base, with no slip and no load on the shaft', 'It reads faster', 'It needs no gear'], a: 1, why: 'Counting against a precise gate time is a frequency measurement with no mechanical error.' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Rotating shaft, gear and disc: entanglement.', 'Stroboscopic light can make a running machine appear stationary.', 'Flashing light can trigger photosensitive epilepsy.', 'Contact tachometer can be thrown if it slips off the shaft.'],
    ppe: ['Safety glasses', 'Tie back long hair; no loose sleeves, ties or ID lanyards'],
    rules: ['Keep the guard closed while the motor runs.', 'Never reach in because the strobe makes the shaft look still.', 'Hold the contact tachometer with both hands, square to the shaft, through the guard port only.', 'Tell everyone before switching the strobe on; avoid looking into the lamp.'],
    emerg: ['Press the emergency stop of the motor controller.', 'If anything is caught, stop the motor; do not pull against the rotation.', 'If someone feels unwell under the strobe, switch it off and seat them away from the light.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Magnetic pickup', 'Variable reluctance, M16 thread', 'Gap 0.5 mm'], ['Gear', '60 (or 30) teeth, steel', '1 Hz = 1 rpm with 60 teeth'], ['Frequency counter', '1 s gate, quartz time base 10 ppm', 'Reference'], ['Stroboscope', 'Xenon, 100–20 000 /min, 0.1 /min display', 'Reference, non-contact'], ['Contact tachometer', 'Rubber cone and wheel, 1 rpm', 'Device under test'], ['Optical tachometer', 'Red LED / laser, reflective tape', 'Device under test']], note: 'Clean the reference mark and the reflective tape; a dirty mark gives weak images.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const z = Pk(r, [30, 48, 60, 72, 120]), f = R(r, 300, 6000, 0), ans = 60 * f / z; return { title: 'Speed from a toothed wheel', q: `A magnetic pickup faces a gear of ${z} teeth. The counter reads ${f} Hz. Find the shaft speed.`, ans, unit: 'rpm', hints: ['Pulses per second = zN/60.', 'N = 60f/z.'], sol: `N = 60 × ${f}/${z} = <b>${s(ans)} rpm</b>.` }; },
    r => { const N = R(r, 1200, 6000, 0), n = Pk(r, [2, 3, 4]), F1 = N / n, F2 = N / (n + 1), ans = N; return { title: 'Speed from two strobe readings', q: `Single stationary images of a shaft mark are seen at flash rates of ${s(F1, 5)} and ${s(F2, 5)} flashes/min, with no single image between them. Find the shaft speed.`, ans, unit: 'rpm', hints: ['F₁ = N/n, F₂ = N/(n + 1).', 'N = F₁F₂/(F₁ − F₂).'], sol: `N = ${s(F1, 5)} × ${s(F2, 5)}/(${s(F1 - F2, 5)}) = <b>${s(ans, 5)} rpm</b>.` }; },
    r => { const Nr = R(r, 500, 3000, 0), e = R(r, -1.2, -0.2, 2), Nt = Math.round(Nr * (1 + e / 100)), ans = (Nr - Nt) / Nr * 100; return { title: 'Tachometer error', q: `A hand tachometer reads ${Nt} rpm when the stroboscope gives ${Nr} rpm. By what percentage does the tachometer read low?`, ans, unit: '%', hints: ['e = (N_tach − N_ref)/N_ref × 100 is negative here.', 'Give its magnitude.'], sol: `e = (${Nt} − ${Nr})/${Nr} × 100 = −${s(ans, 3)} %, so it reads <b>${s(ans, 3)} %</b> low.` }; }
  ];
})();
