/* Exp 13 — Straightness of a machine-tool guideway with an autocollimator and a reflector on a fixed-base carriage. */
(function () {
  const U = LAB.U, G = LAB.G, K = LAB.K, M = LAB.M, P = LAB.P, ID = 'autocoll';
  const SURF = { bed: { name: 'Lathe bed guideway, 1000 mm (worn near the chuck end)', bow: 9, wav: 2.5, wear: 7 }, edge: { name: 'Cast-iron straight edge, 1000 mm, grade 1', bow: 3, wav: 0.8, wear: 0 } };

  LAB.register({
    id: ID, no: 13, cat: 'ang', title: 'Straightness Measurement using an Autocollimator', std: 'ISO 230-1 / IS 2063 (machine-tool test code)', short: 'A plane mirror on a carriage with a 100 mm base is stepped along a 1 m guideway while an autocollimator reads its tilt in seconds of arc. You turn the angles into rises, build the profile, and find the straightness error relative to the end-point line.', tags: 'autocollimator straightness flatness guideway lathe bed reflector carriage seconds of arc end point line cumulative rise machine tool alignment ISO 230',
    aim: 'To measure the straightness of a guideway with an autocollimator by stepping a reflector along it, and to determine the straightness error relative to the line joining the end points.',
    objectives: ['Explain the optical principle of the autocollimator and why it measures tilt, not position.', 'Convert angular readings in seconds to rises over the carriage base.', 'Build the cumulative height profile of the surface.', 'Determine the straightness error relative to the end-point line and to the least-squares line.', 'Read an autocollimator graticule to 1″.'],
    apparatus: ['Visual autocollimator, focal length 300 mm, graticule 2″ per division, range ±60″ (reading to 1″ by estimation)', 'Plane reflector mounted on a carriage with two feet 100 mm apart (or 150 mm)', 'Straight edge or the machine bed to be tested, 1000 mm', 'Steel rule and scriber to mark the stations', 'Tripod or bracket for the autocollimator, set level with the reflector'],
    stdNote: 'ISO 230-1 (geometric accuracy of machine tools) and IS 2063 define straightness tests of guideways: the reflector is moved in steps equal to its base length, and the straightness deviation is the distance between two lines parallel to a reference line enclosing the profile.',
    params: [
      { id: 'surf', label: 'Surface under test', type: 'select', options: Object.entries(SURF).map(([k, v]) => [k, v.name]), def: 'bed' },
      { id: 'base', label: 'Reflector carriage base', type: 'select', options: [['100', '100 mm (10 steps)'], ['200', '200 mm (5 steps)']], def: '100' }
    ],
    opSteps: ['Clean the guideway and mark the stations at the carriage base spacing', 'Set up the autocollimator at one end, level with the reflector', 'Place the reflector at the far station and align the autocollimator to see the image', 'Bring the reflector to the first station; read the graticule', 'Step the carriage station by station, each foot on the previous mark; read at each', 'Repeat the run in the opposite direction if required'],
    svg(p) {
      return G.svg('0 0 560 300', `${G.r(0, 0, 560, 300, 'bg')}
        <path id="surf" d="M70 220 L530 220" fill="none" stroke="var(--steel-dark)" stroke-width="10"/>${G.r(70, 226, 460, 30, 'mach')}
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<line x1="${70 + i * 46}" y1="212" x2="${70 + i * 46}" y2="206" class="ln"/>`).join('')}
        <g id="ac">${G.r(14, 150, 52, 40, 'mach2', 'rx="4"')}<rect x="66" y="160" width="10" height="20" class="steelD"/><rect x="0" y="160" width="14" height="20" class="acc"/>${G.r(30, 190, 10, 40, 'mach')}</g>${G.t(4, 140, 'autocollimator', 'm')}
        <g id="car"><rect x="0" y="-18" width="46" height="12" rx="2" class="steelD"/><rect x="2" y="-6" width="6" height="6" class="ink"/><rect x="38" y="-6" width="6" height="6" class="ink"/><rect id="mir" x="0" y="-48" width="6" height="30" class="glass"/></g>
        <line id="beam" x1="76" y1="170" x2="76" y2="170" stroke="#ffd36b" stroke-width="2" opacity=".85"/>
        <g transform="translate(380,30)">${G.r(0, 0, 164, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'STATION', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dS"')}</g>
        <g transform="translate(200,30)">${G.r(0, 0, 164, 60, 'disp', 'rx="4"')}${G.t(8, 14, 'READING', 'm', 'style="fill:var(--panel-ink);font-size:7.5px"')}${G.t(8, 42, '—', 'big', 'id="dR"')}</g>`, 'Autocollimator at one end of a guideway, reflector on a carriage stepped along the surface');
    },
    anim(svg, f, sim, p) {
      const B = +p.base, n = 1000 / B, sc = 46 * B / 100;
      if (!sim) { G.set(svg, 'car', 'transform', `translate(${70} 220)`); return; }
      const k = Math.min(n - 1, Math.floor(f * n * 0.9999)); const x = 70 + k * sc; const wdth = sc;
      G.set(svg, 'car', 'transform', `translate(${x} ${220 - 5}) scale(${wdth / 46} 1)`);
      G.set(svg, 'beam', 'x2', String(x + 3)); G.set(svg, 'beam', 'y2', String(220 - 5 - 33));
      const pr = sim.truth.z; G.set(svg, 'surf', 'd', 'M' + pr.map((z, i) => `${70 + i * sc} ${220 - z * 1.2}`).join(' L'));
      G.txt(svg, 'dS', `${k + 1} of ${n}`); G.txt(svg, 'dR', sim.truth.pics.includes(k) ? 'see picture' : (sim.truth.rd[k] > 0 ? '+' : '') + U.f(sim.truth.rd[k], 0) + '″');
    },
    liveView(el, f, sim, p, api) {
      const T = sim.truth, n = T.rd.length, k = Math.min(n - 1, Math.floor(f * n * 0.9999));
      api.title('Cumulative profile'); api.sub(`${k + 1} of ${n} stations`);
      G.profileView(el, { xlabel: 'Distance along the guideway (mm)', ylabel: 'Cumulative height (µm)', series: [{ name: 'measured', x: T.xs.slice(0, k + 2), y: T.H.slice(0, k + 2), type: 'linepts', color: 's1' }], xmin: 0, xmax: 1000, yzero: false }, 210);
    },
    simulate(p, r) {
      const S = SURF[p.surf], B = +p.base, n = 1000 / B, c0 = 20 * (r() - 0.5); // misalignment of the autocollimator axis (″)
      const zf = x => S.bow * Math.sin(Math.PI * x / 1000) + S.wav * Math.sin(2 * Math.PI * x / 330 + 1.3) - S.wear * Math.exp(-(((x - 180) / 140) ** 2));
      const ph = 2 * Math.PI * r(); const z = []; for (let i = 0; i <= n; i++) { const x = i * B; z.push(zf(x) + 0.4 * Math.sin(ph + i * 2.1)); }
      const rd = []; for (let i = 0; i < n; i++) { const th = (z[i + 1] - z[i]) / 1000 / B * 206265; rd.push(Math.round(th + c0 + 0.5 * U.gauss(r))); }
      const kRise = 0.4848 * B / 100; // µm per second over the base
      const rises = rd.map(t => t * kRise); const H = [0]; rises.forEach(v => H.push(H[H.length - 1] + v));
      const xs = H.map((_, i) => i * B); const dev = H.map((h, i) => h - H[n] * i / n);
      const sEP = Math.max(...dev) - Math.min(...dev); const lf = U.linfit(xs, H); const dLS = H.map((h, i) => h - (lf.c + lf.m * xs[i])); const sLS = Math.max(...dLS) - Math.min(...dLS);
      const pics = [2, 6].map(i => Math.min(i, n - 1)); const i3 = Math.min(3, n - 1);
      const T = { z, rd, rises, H, xs, dev, sEP, sLS, kRise, pics, i3, c0 };
      return {
        truth: T, dur: 12,
        readout(f) { const k = Math.min(n - 1, Math.floor(f * n * 0.9999)); return [['Station', `${k + 1}/${n}`, ''], ['Carriage at', `${k * B}–${(k + 1) * B}`, 'mm'], ['Reading', pics.includes(k) ? 'see picture' : U.f(rd[k], 0), '″'], ['Base', B, 'mm'], ['1″ over base', U.f(kRise, 4), 'µm']]; },
        plot: { title: 'Straightness profile', xlabel: 'Distance along the guideway (mm)', ylabel: 'Height (µm)', series: [{ name: 'cumulative height', x: xs, y: H, type: 'linepts', color: 's1' }, { name: 'end-point line', x: [0, 1000], y: [0, H[n]], color: 'muted', dash: true }], yzero: false, caption: 'Cumulative height profile of the guideway with the end-point reference line' },
        plots: [{ xlabel: 'Distance along the guideway (mm)', ylabel: 'Deviation from end-point line (µm)', series: [{ name: 'deviation', x: xs, y: dev, type: 'linepts', color: 's2' }], hlines: [{ y: 0, color: 'muted' }], yzero: false, caption: 'Deviation of the profile from the line joining its end points' }],
        specimen: [['Surface', S.name, ''], ['Length tested', 1000, 'mm'], ['Carriage base', B, 'mm'], ['Number of stations', n, ''], ['Autocollimator', 'graticule 2″/div, read to 1″', ''], ['Rise for 1″ over the base', U.f(kRise, 4), 'µm']],
        obs: [{ title: 'Table 1. Autocollimator readings', cols: ['Station', 'Carriage position (mm)', 'Reading (″)'], rows: rd.map((t, i) => [i + 1, `${i * B}–${(i + 1) * B}`, pics.includes(i) ? '<b>see picture</b>' : (t > 0 ? '+' : '') + t]), note: 'The readings include a constant offset from the alignment of the autocollimator; it adds a straight-line tilt to the profile and disappears when the end-point line is subtracted.' }],
        truth: T
      };
    },
    expExtra(el, sim) { const T = sim.truth; el.innerHTML = M.readPanel('Read the autocollimator', 'The bright vertical line is the reflected image of the cross-line. Read its position on the graticule (2″ per division) to the nearest second, with sign.', T.pics.map(i => ({ svg: M.acSVG(T.rd[i]), cap: `Station ${i + 1}` }))); },
    expHint: 'Rise over the base = reading (″) × 0.4848 µm × (base/100 mm). Cumulative height = running sum of the rises, starting from 0. End-point line: straight line from the first to the last height. Straightness error = largest positive deviation − largest negative deviation from that line.',
    calcs(sim, p) { const T = sim.truth, n = T.rd.length; return [
      { key: 'a', label: `Reading at station ${T.pics[0] + 1}`, unit: '″', truth: T.rd[T.pics[0]], abs: 1.1, fmt: v => U.f(v, 0) },
      { key: 'b', label: `Reading at station ${T.pics[1] + 1}`, unit: '″', truth: T.rd[T.pics[1]], abs: 1.1, fmt: v => U.f(v, 0) },
      { key: 'k', label: `Rise corresponding to 1″ over a ${p.base} mm base`, unit: 'µm', truth: T.kRise, abs: 0.002, fmt: v => U.f(v, 4) },
      { key: 'h', label: `Cumulative height at the end of station ${T.i3 + 1}`, unit: 'µm', truth: T.H[T.i3 + 1], abs: 1.0, fmt: v => U.f(v, 2) },
      { key: 'he', label: 'Cumulative height at the end of the guideway', unit: 'µm', truth: T.H[n], abs: 1.5, fmt: v => U.f(v, 2) },
      { key: 's', label: 'Straightness error relative to the end-point line', unit: 'µm', truth: T.sEP, abs: 1.2, fmt: v => U.f(v, 2) }]; },
    reference(sim, p) { const T = sim.truth; return [{ label: 'Straightness error (end-point)', unit: 'µm', value: T.sEP, lo: 0, hi: p.surf === 'edge' ? 8 : 16, src: p.surf === 'edge' ? 'Grade 1 straight edge, 1000 mm: ≤ 8 µm (typ.)' : 'ISO 1708 lathe bed, 1000 mm: 16 µm (convex only)', fmt: v => U.f(v, 1) }, { label: 'Straightness (least-squares line)', unit: 'µm', value: T.sLS, lo: 0, hi: T.sEP, src: 'Never larger than end-point value', fmt: v => U.f(v, 1) }]; },
    valExtra(el, sim, p) { const T = sim.truth; el.innerHTML = `<div class="panel"><div class="panel-h"><h4>Reduction table</h4></div>${LAB.tableHTML({ cols: ['Station', 'Reading (″)', 'Rise (µm)', 'Cumulative height (µm)', 'End-point line (µm)', 'Deviation (µm)'], rows: T.rd.map((t, i) => [i + 1, t, U.f(T.rises[i], 2), U.f(T.H[i + 1], 2), U.f(T.H[T.rd.length] * (i + 1) / T.rd.length, 2), U.f(T.dev[i + 1], 2)]) })}<p class="muted" style="font-size:.84rem">Straightness error: end-point line ${U.f(T.sEP, 2)} µm, least-squares line ${U.f(T.sLS, 2)} µm (the minimum-zone value is smaller still). The autocollimator offset of about ${U.f(T.c0, 0)}″ appears as a uniform tilt and drops out. ${p.surf === 'bed' ? 'The dip near the chuck end is wear from the carriage running most often there; it is typical of old lathes.' : ''}</p></div>`; },
    sample(sim, p) { const T = sim.truth, n = T.rd.length; return `<div class="eq">1″ over ${p.base} mm = ${p.base} × tan 1″ = ${p.base} × 4.848×10⁻⁶ mm = <b>${U.f(T.kRise, 4)} µm</b></div><div class="eq">Station ${T.i3 + 1}: rise = ${T.rd[T.i3]} × ${U.f(T.kRise, 4)} = ${U.f(T.rises[T.i3], 2)} µm; cumulative height = <b>${U.f(T.H[T.i3 + 1], 2)} µm</b></div><div class="eq">End height H_n = ${U.f(T.H[n], 2)} µm; end-point line at station i: H_n·i/n</div><div class="eq">Largest deviation +${U.f(Math.max(...T.dev), 2)}, smallest ${U.f(Math.min(...T.dev), 2)} µm → straightness error = <b>${U.f(T.sEP, 2)} µm</b></div>`; },
    uncert(sim, p) { const T = sim.truth, n = T.rd.length; const ur = M.rss(M.uRes(1), 0.5) * T.kRise; return [{ q: 'Single rise', expr: '√[(1″/√12)² + (0.5″ repeatability)²] × k', val: Math.abs(T.rises[0]) || 1, u: ur, unit: 'µm' }, { q: 'Height at mid-length', expr: 'random-walk: √(n/2) × u_rise (relative to the end-point line ≈ ×0.7)', val: Math.abs(T.H[Math.floor(n / 2)]) || 1, u: ur * Math.sqrt(n / 2) * 0.7, unit: 'µm' }, { q: 'Straightness error', expr: '≈ √2 × u at mid-length', val: T.sEP, u: ur * Math.sqrt(n / 2), unit: 'µm' }]; },
    conclude(sim, p) { const T = sim.truth; return `The guideway was measured in ${T.rd.length} steps of ${p.base} mm with an autocollimator. Each second of arc corresponded to a rise of ${U.f(T.kRise, 3)} µm. Relative to the line joining the end points, the straightness error is ${U.f(T.sEP, 1)} µm over 1000 mm (${U.f(T.sLS, 1)} µm relative to the least-squares line). ${p.surf === 'bed' ? 'The profile shows a dip near the chuck end from wear.' : ''}`; },
    summary: 'An autocollimator sends a parallel beam from an illuminated cross-line to a plane mirror and focuses the reflected beam back onto a graticule. If the mirror tilts by θ, the reflected beam turns by 2θ and the image moves by 2fθ, so the instrument measures tilt in seconds of arc, independent of the mirror’s distance. A mirror on a carriage with two feet a fixed base apart is stepped along a guideway; at each step the tilt gives the rise of one foot over the other, base × θ. Adding the rises gives the height profile. The straightness error is the spread of the profile about a reference line, usually the line joining the end points.',
    formulas: [['Image displacement', 'x = 2 f θ'], ['Rise over the base', 'h = B tan θ ≈ B θ;  1″ over 100 mm = 0.4848 µm'], ['Cumulative height', 'H_i = Σ h_k (k = 1 … i)'], ['End-point line', 'H_ref(i) = H_n · i / n'], ['Straightness error', 'E = max(H − H_ref) − min(H − H_ref)']],
    theory: `<h3>The autocollimator</h3><p>An autocollimator combines a collimator and a telescope in one tube. An illuminated cross-line at the focal plane of the objective lens is projected as a parallel beam. A plane mirror in the beam sends it back; the objective focuses the returned beam onto a graticule beside the cross-line. If the mirror is square to the beam, the image falls on the cross-line itself. If the mirror tilts by θ, the beam returns at 2θ and the image moves by x = 2fθ. With f = 300 mm, 1″ of tilt moves the image by about 3 µm, which the eyepiece micrometer or graticule makes visible. Because the beam is parallel, the reading does not depend on the distance to the mirror.</p>
      <h3>Measuring straightness</h3><p>The mirror is mounted on a carriage with two feet a known base length B apart (often 100 mm). Placed on the surface, the carriage tilts by the slope of the line between its feet. The surface is marked into stations B apart, and the carriage is stepped along so that each time its rear foot stands where its front foot stood before. The reading at each station gives the rise of the front foot over the rear: h = B tan θ, which for 1″ over 100 mm is 0.4848 µm.</p>
      <h3>Building the profile</h3><p>Adding the rises station by station gives the height of every station relative to the first. A constant error in the readings, from the autocollimator not being exactly square to the surface, adds the same rise at every step and only tilts the profile. The profile is therefore referred to a straight line: the line joining the two end points (simple and common), the least-squares line, or the minimum-zone pair of parallel lines that just enclose the profile. The straightness error is the distance between the highest and lowest deviations from the reference line.</p>
      <h3>Flatness</h3><p>Measuring straightness along a pattern of lines (the "Union Jack" pattern) on a surface plate and tying them together at their crossing points gives the flatness of the whole surface. The same method checks machine-tool guideways, which ISO 230-1 and the machine test codes specify.</p>`,
    procedure: ['Clean the surface and mark stations along it at the base length of the carriage.', 'Mount the autocollimator at one end, at the height of the reflector.', 'Put the reflector at the far end and align the autocollimator so the image is near the centre of the graticule; lock it.', 'Place the carriage at the first station, read the image position on the graticule (seconds, with sign).', 'Move the carriage forward one base length so its rear foot sits on the previous front-foot mark; read again.', 'Continue to the end; repeat in the reverse direction for a check.', 'Calculate rises, cumulative heights and the deviation from the end-point line.'],
    precautions: ['Do not disturb the autocollimator during the run; any movement shifts all later readings.', 'Place the carriage feet exactly on the marks.', 'Shield the beam from air currents and heat sources (refraction).', 'Read the graticule square to the eyepiece.', 'Let the instrument and surface reach room temperature.'],
    applications: ['Straightness and flatness of machine-tool beds, slideways and surface plates.', 'Squareness and parallelism of machine axes.', 'Calibration of angle gauges and indexing tables with a polygon.', 'Alignment of shafts and bearings in turbines and ships.'],
    errors: ['Autocollimator moved during the run.', 'Carriage not stepped exactly by its base length.', 'Air turbulence and temperature gradients bending the beam.', 'Reading resolution of the graticule.', 'Dirt under the carriage feet.', 'Accumulation of random errors in the cumulative sum.'],
    discussion: ['Why does a constant offset in the readings not affect the straightness error?', 'Why does the error of the cumulative profile grow towards the middle of the run?', 'Compare the end-point and least-squares straightness errors. Which is the better estimate?', 'How would you use this method to find the flatness of a surface plate?'],
    refs: ['ISO 230-1:2012, Test code for machine tools. Part 1: Geometric accuracy of machines operating under no-load or quasi-static conditions.', 'IS 2063:1962, Code for testing machine tools.', 'ISO 1708:1989, Acceptance conditions for general purpose parallel lathes. Testing of the accuracy.', 'J. F. W. Galyer, C. R. Shotbolt, Metrology for Engineers, 5th ed., Cassell, Ch. 8.', 'R. K. Jain, Engineering Metrology, Khanna Publishers, Ch. 10.'],
    pre: [
      { q: 'An autocollimator measures', o: ['Distance', 'Small angular tilts of a reflector', 'Surface roughness', 'Temperature'], a: 1, why: 'Image displacement is proportional to tilt.' },
      { q: 'If the mirror tilts by θ, the reflected beam turns by', o: ['θ/2', 'θ', '2θ', '4θ'], a: 2, why: 'Law of reflection.' },
      { q: '1 second of arc over 100 mm corresponds to a rise of about', o: ['0.05 µm', '0.5 µm', '5 µm', '50 µm'], a: 1, why: '100 × 4.85×10⁻⁶ mm = 0.485 µm.' },
      { q: 'The reflector carriage is stepped along by', o: ['Any convenient distance', 'Exactly its base length', 'Half its base', '1 mm'], a: 1, why: 'Each rise must join the previous one.' },
      { q: 'Straightness is usually referred to', o: ['The first reading', 'A reference line such as the end-point line', 'The highest point', 'Zero'], a: 1, why: 'The error is measured from a reference line.' }
    ],
    post: [
      { q: 'With a 100 mm base, readings 0, +4, +6, +2″ give a height at the end of station 4 of about', o: ['12 µm', '5.8 µm', '1.2 µm', '58 µm'], a: 1, why: '12″ × 0.485 µm = 5.8 µm.' },
      { q: 'All readings have an unknown constant offset. The straightness error relative to the end-point line', o: ['Is wrong by the offset', 'Is unaffected', 'Doubles', 'Becomes zero'], a: 1, why: 'A constant offset only tilts the profile.' },
      { q: 'Deviations from the end-point line range from −3.2 to +4.1 µm. Straightness error:', o: ['4.1 µm', '7.3 µm', '0.9 µm', '3.2 µm'], a: 1, why: '4.1 − (−3.2).' },
      { q: 'Halving the carriage base (same surface) makes each reading', o: ['Half as large for the same slope', 'The same for the same slope, but the rise per second halves', 'Twice as large', 'Zero'], a: 1, why: 'Tilt is the local slope; rise = base × tilt.' },
      { q: 'Moving the autocollimator halfway through the run', o: ['Has no effect', 'Introduces a step error in every later reading', 'Improves accuracy', 'Doubles the readings'], a: 1, why: 'Its reference direction changes.' }
    ]
  });

  LAB.VALID[ID] = ['v', 'Profile = bow + waviness + localised wear; readings = local slope × 206 265 / base plus a constant alignment offset and 0.5″ noise; reduction to cumulative heights and end-point / least-squares lines follows ISO 230-1.', 'ISO 230-1; Galyer & Shotbolt Ch. 8'];
  LAB.NOMEN[ID] = [['θ', 'Autocollimator reading (tilt)', '″'], ['f', 'Focal length of the objective', 'mm'], ['B', 'Carriage base length', 'mm'], ['h', 'Rise over one base', 'µm'], ['H_i', 'Cumulative height at station i', 'µm'], ['n', 'Number of stations', '—'], ['E', 'Straightness error', 'µm']];

  const E = U.ease, tag = K.tag;
  LAB.SETUP[ID] = [
    { op: 0, d: 2.2, title: 'Clean the surface and mark the stations', note: (s, p) => `Marks every ${p.base} mm along the 1000 mm length`, why: 'Stations are marked before any instrument is placed on the surface.',
      draw(L, u, c) { L.innerHTML = c.active ? tag(200, 160, 'mark stations', 300, 210) : ''; } },
    { op: 1, d: 2.2, title: 'Mount the autocollimator level with the reflector', note: 'Rigid bracket at one end', why: 'The autocollimator is mounted before the reflector is aligned to it.',
      draw(L, u, c) { c.op('ac', E(u)); L.innerHTML = ''; } },
    { op: 2, d: 2.6, title: 'Align on the reflector at the far end and lock', note: 'Image near the centre of the graticule', why: 'Alignment at the far end makes sure the image stays in view over the whole run.',
      draw(L, u, c) { c.set('car', 'transform', `translate(${70 + 414 * E(u)} 215)`); c.set('beam', 'x2', String(76 + 411 * E(u))); c.set('beam', 'y2', '182'); L.innerHTML = c.active ? tag(380, 120, 'align', 480, 170) : ''; } }
  ];

  LAB.EXPL[ID] = { scenes: [
    { title: 'Measuring tilt with light', lines: [
      ['An autocollimator sends out a parallel beam and catches its own reflection from a mirror.', { s: 1 }],
      ['If the mirror tilts, the returning image slides across the graticule. Each second of arc is visible.', { s: 2 }],
      ['Distance does not matter, only tilt.', null]],
      q: { q: 'The mirror tilts by 5″. The returned beam turns by', o: ['2.5″', '5″', '10″', '20″'], a: 2, why: 'Reflection doubles the angle; the graticule is scaled to read the mirror tilt directly.' } },
    { title: 'Stepping the carriage', lines: [
      ['The mirror sits on a carriage with two feet one hundred millimetres apart.', { r: [0, 0.3] }],
      ['At each station the carriage tilts by the slope between its feet. The reading is noted, and the carriage is stepped exactly one base length.', { r: [0.3, 0.9] }],
      ['Each second of arc means the front foot is half a micron higher than the rear.', { r: [0.9, 1] }]],
      q: { q: 'Why must the rear foot go exactly where the front foot was?', o: ['To save time', 'So the rises join end to end into a continuous profile', 'To keep the beam aligned', 'It need not'], a: 1, why: 'Gaps or overlaps would break the chain of heights.' } },
    { title: 'From angles to a profile', lines: [
      ['Add up the rises station by station and you have the height of the surface all along.', null],
      ['Draw a line from the first point to the last. The spread of the profile about that line is the straightness error.', null],
      ['A constant offset in every reading only tilts the profile, and disappears.', null]],
      q: { q: 'The profile’s deviations from the end-point line run from −2 to +5 µm. The straightness error is', o: ['5 µm', '7 µm', '3 µm', '2 µm'], a: 1, why: 'Highest minus lowest: 5 − (−2).' } }
  ] };

  LAB.SAFETY[ID] = {
    haz: ['Bright lamp in the autocollimator: do not stare into the objective.', 'Heavy straight edge or carriage dropped on feet.'],
    ppe: ['Closed shoes'],
    rules: ['Switch off the lamp when not reading.', 'Lift the carriage with both hands; keep the mirror face clean.', 'Do not lean on the bench during the run.'],
    emerg: ['If the instrument falls, step back; do not catch it.', 'Report damage to optics to the in-charge.'] };
  LAB.LIB[ID] = { cols: ['Item', 'Specification', 'Purpose / note'], rows: [['Autocollimator', 'f = 300 mm, 2″/div graticule, ±60″ (some with 0.2″ micrometer)', 'Measures tilt'], ['Reflector carriage', 'Plane mirror, base 100 mm (and 200 mm)', 'Moves along the surface'], ['Straight edge / guideway', '1000 mm', 'Surface under test'], ['Bracket / tripod', 'Rigid', 'Holds the autocollimator'], ['Rule and scriber', '1 mm', 'Station marks']], note: 'Electronic autocollimators read to 0.01″ and log the readings directly.' };

  const R = K.R, Pk = K.P, s = K.s;
  LAB.NUM[ID] = [
    r => { const B = Pk(r, [50, 100, 150, 200]), th = Math.round(R(r, 2, 30, 0)), ans = B * th * 4.8481e-6 * 1000; return { title: 'Rise from an angle', q: `An autocollimator reads ${th}″ for a reflector carriage with a base of ${B} mm. Find the rise of the front foot over the rear.`, ans, unit: 'µm', hints: ['1″ = 4.848 × 10⁻⁶ rad.', 'Rise = B × θ.'], sol: `h = ${B} × ${th} × 4.848×10⁻⁶ mm = <b>${s(ans)} µm</b>.` }; },
    r => { const f = Pk(r, [200, 300, 500]), th = Math.round(R(r, 1, 20, 0)), ans = 2 * f * th * 4.8481e-6 * 1000; return { title: 'Image displacement', q: `An autocollimator has an objective of focal length ${f} mm. The reflector tilts by ${th}″. How far does the image move in the focal plane?`, ans, unit: 'µm', hints: ['x = 2fθ.', 'θ in radians.'], sol: `x = 2 × ${f} × ${th} × 4.848×10⁻⁶ mm = <b>${s(ans)} µm</b>.` }; },
    r => { const a = R(r, 1, 6, 1), b = R(r, 1, 6, 1), ans = a + b; return { title: 'Straightness error', q: `The deviations of a measured profile from its end-point line range from −${a} µm to +${b} µm. What is the straightness error?`, ans, unit: 'µm', hints: ['E = largest − smallest deviation.', 'Mind the sign.'], sol: `E = ${b} − (−${a}) = <b>${s(ans)} µm</b>.` }; }
  ];
})();
