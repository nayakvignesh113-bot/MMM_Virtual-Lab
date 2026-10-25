/* Metrology Handbook (#handbook): a data book for mechanical measurements and metrology.
   Computed tables come from the reference functions in kit.js (LAB.P): ITS-90 thermocouples, IEC 60751, ISO 286, ISO 965, ISO 21771.
   Hand-compiled tables give their sources in the text. Framework (look-ups, charts, calculators, print) shared with the Heat Transfer Handbook. */
(function () {
  const LAB = window.LAB, U = LAB.U, $ = s => document.querySelector(s);
  const EXT = LAB.ext || (LAB.ext = {});
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = v => v === null || v === undefined || v === '' ? '—' : (typeof v === 'number' ? (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(3).replace('e', '×10^').replace(/\^\+?(-?\d+)/, (m, e) => '<sup>' + e + '</sup>') : String(v)) : v);
  let uid = 0;

  /* ------------------------------------------------------------------ building blocks */
  const tab = (cols, rows, o = {}) => `<div class="tbl-wrap hbtw"><table class="t hbt${o.cls ? ' ' + o.cls : ''}">${o.cap ? `<caption>${o.cap}</caption>` : ''}<thead><tr>${cols.map((c, i) => `<th class="${(o.text || [0]).includes(i) ? '' : 'n'}">${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${(o.text || [0]).includes(i) ? '' : 'n'}">${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  // a computed table with an interpolating look-up on its first column
  const look = (t, o = {}) => {
    const id = 'lk' + (++uid);
    LOOK[id] = t;
    const k0 = t.cols[0].replace(/<[^>]+>/g, '');
    return `${o.title ? `<h4 class="hbh4">${o.title}</h4>` : ''}${t.src || o.src ? `<p class="hbsrc">Source: ${o.src || t.src}</p>` : ''}
      <div class="hblook no-print"><label for="${id}">Look up at ${esc(k0)}</label><input type="number" step="any" id="${id}" data-look="${id}" placeholder="type a value"><span class="muted hblr" id="${id}r"></span></div>
      <div id="${id}o"></div>${tab(t.cols, t.rows, { text: o.text || (typeof t.rows[0][0] === 'string' ? [0] : []) })}`;
  };
  const LOOK = {};
  function doLook(inp) {
    const t = LOOK[inp.dataset.look], x = parseFloat(inp.value), out = $('#' + inp.dataset.look + 'o'), msg = $('#' + inp.dataset.look + 'r');
    if (!isFinite(x)) { out.innerHTML = ''; msg.textContent = ''; return; }
    const rows = t.rows.filter(r => typeof r[0] === 'number');
    const lo = rows[0][0], hi = rows[rows.length - 1][0];
    if (x < Math.min(lo, hi) || x > Math.max(lo, hi)) { out.innerHTML = ''; msg.textContent = `outside the table (${lo} to ${hi})`; return; }
    let i = rows.findIndex((r, j) => j < rows.length - 1 && (x - r[0]) * (x - rows[j + 1][0]) <= 0); if (i < 0) i = rows.length - 2;
    const a = rows[i], b = rows[i + 1], f = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
    const row = a.map((v, j) => {
      if (j === 0) return x; const w = b[j];
      if (typeof v !== 'number' || typeof w !== 'number') return f < 0.5 ? v : w;
      const y = v > 0 && w > 0 && Math.max(v, w) / Math.min(v, w) > 1.5 ? Math.exp(Math.log(v) + f * (Math.log(w) - Math.log(v))) : v + f * (w - v);
      return +y.toPrecision(4);
    });
    msg.textContent = `interpolated between ${a[0]} and ${b[0]}`;
    out.innerHTML = tab(t.cols, [row], { cls: 'hbhit', text: [] });
  }
  const eqs = rows => `<div class="tbl-wrap hbtw"><table class="t hbeqt"><thead><tr><th>Case</th><th>Relation</th><th>Validity / notes</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="hbeq">${r[1]}</td><td>${r[2] || ''}</td></tr>`).join('')}</tbody></table></div>`;
  const note = s => `<p class="hbnote">${s}</p>`;
  const h3 = (s, id) => `<h3 class="hbh3"${id ? ` id="${id}"` : ''}>${s}</h3>`;
  const fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;

  /* ------------------------------------------------------------------ SVG chart */
  function chart(o) {
    const W = 680, Hh = o.h || 440, ml = 62, mr = o.mr || 64, mt = 20, mb = 50, pw = W - ml - mr, ph = Hh - mt - mb;
    const tx = o.xlog ? v => ml + (Math.log10(v) - Math.log10(o.x[0])) / (Math.log10(o.x[1]) - Math.log10(o.x[0])) * pw : v => ml + (v - o.x[0]) / (o.x[1] - o.x[0]) * pw;
    const ty = o.ylog ? v => mt + ph - (Math.log10(v) - Math.log10(o.y[0])) / (Math.log10(o.y[1]) - Math.log10(o.y[0])) * ph : v => mt + ph - (v - o.y[0]) / (o.y[1] - o.y[0]) * ph;
    const ticks = (r, log, step) => {
      const out = [];
      if (log) { for (let e = Math.floor(Math.log10(r[0])); e <= Math.ceil(Math.log10(r[1])); e++) for (let m = 1; m < 10; m++) { const v = m * 10 ** e; if (v >= r[0] * 0.999 && v <= r[1] * 1.001) out.push([v, m === 1 || (o.minorLab && [2, 5].includes(m))]); } }
      else { const s = step || niceStep(r[1] - r[0]); for (let v = Math.ceil(r[0] / s - 1e-9) * s; v <= r[1] + s * 1e-6; v += s) out.push([+v.toPrecision(10), true]); }
      return out;
    };
    const lab = v => { if (Math.abs(v) >= 1e4 || (Math.abs(v) < 0.0095 && v !== 0)) { const e = Math.floor(Math.log10(Math.abs(v)) + 1e-9); const m = v / 10 ** e; return (Math.abs(m - 1) < 1e-6 ? '' : U.f(m, 0) + '×') + '10<tspan dy="-5" font-size="9">' + e + '</tspan>'; } return String(+v.toPrecision(6)); };
    let g = '';
    ticks(o.x, o.xlog, o.xstep).forEach(([v, major]) => { const X = tx(v); g += `<line x1="${X}" y1="${mt}" x2="${X}" y2="${mt + ph}" class="${major ? 'gmaj' : 'gmin'}"/>`; if (major) g += `<text x="${X}" y="${mt + ph + 16}" text-anchor="middle">${lab(v)}</text>`; });
    ticks(o.y, o.ylog, o.ystep).forEach(([v, major]) => { const Y = ty(v); g += `<line x1="${ml}" y1="${Y}" x2="${ml + pw}" y2="${Y}" class="${major ? 'gmaj' : 'gmin'}"/>`; if (major) g += `<text x="${ml - 6}" y="${Y + 4}" text-anchor="end">${lab(v)}</text>`; });
    let c = '';
    (o.curves || []).forEach((cv, i) => {
      const pts = cv.pts.filter(p => p[0] >= o.x[0] && p[0] <= o.x[1] && p[1] >= o.y[0] && p[1] <= o.y[1] && (!o.xlog || p[0] > 0) && (!o.ylog || p[1] > 0));
      if (pts.length < 2) return;
      c += `<path d="${pts.map((p, j) => (j ? 'L' : 'M') + tx(p[0]).toFixed(1) + ' ' + ty(p[1]).toFixed(1)).join('')}" class="cv${cv.cls ? ' ' + cv.cls : ''}${i % 2 && o.alt ? ' cvb' : ''}"/>`;
      if (cv.label !== undefined && o.labels !== false) {
        const at = o.labAt ? o.labAt(pts, cv, i) : pts[pts.length - 1];
        if (at) c += `<text x="${(tx(at[0]) + (o.labDx || 3)).toFixed(1)}" y="${(ty(at[1]) + (o.labDy || 3)).toFixed(1)}" class="cl">${cv.label}</text>`;
      }
    });
    const id = 'ch' + (++uid);
    CH[id] = { tx, ty, o, ml, mt, pw, ph };
    return `<figure class="hbfig"><svg viewBox="0 0 ${W} ${Hh}" class="hbsvg" id="${id}" role="img" aria-label="${esc(o.title || '')}">
      <rect x="${ml}" y="${mt}" width="${pw}" height="${ph}" class="pf"/>${g}<g class="cvs">${c}</g>
      <rect x="${ml}" y="${mt}" width="${pw}" height="${ph}" class="fr0"/>
      <text x="${ml + pw / 2}" y="${Hh - 10}" text-anchor="middle" class="al">${o.xl}</text>
      <text transform="translate(16 ${mt + ph / 2}) rotate(-90)" text-anchor="middle" class="al">${o.yl}</text>
      ${o.key ? `<text x="${ml + pw + 4}" y="${mt - 6}" class="cl ck">${o.key}</text>` : ''}
      <g class="xh" visibility="hidden"><line class="xhl" y1="${mt}" y2="${mt + ph}"/><line class="xhl" x1="${ml}" x2="${ml + pw}"/><rect class="xhb" width="150" height="20" rx="3"/><text class="xht"></text></g></svg>
      <figcaption><b>${o.title}</b>${o.cap ? ' ' + o.cap : ''}</figcaption></figure>`;
  }
  const CH = {};
  function niceStep(span) { const r = span / 8, p = 10 ** Math.floor(Math.log10(r)), m = r / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; }
  function bindCharts(root) {
    root.querySelectorAll('svg.hbsvg').forEach(svg => {
      const C = CH[svg.id]; if (!C) return; const xh = svg.querySelector('.xh'), t = xh.querySelector('.xht'), b = xh.querySelector('.xhb'), [lv, lh] = xh.querySelectorAll('.xhl');
      const inv = (X, Y) => { const fx = (X - C.ml) / C.pw, fy = (C.mt + C.ph - Y) / C.ph, o = C.o;
        const x = o.xlog ? 10 ** (Math.log10(o.x[0]) + fx * (Math.log10(o.x[1]) - Math.log10(o.x[0]))) : o.x[0] + fx * (o.x[1] - o.x[0]);
        const y = o.ylog ? 10 ** (Math.log10(o.y[0]) + fy * (Math.log10(o.y[1]) - Math.log10(o.y[0]))) : o.y[0] + fy * (o.y[1] - o.y[0]); return [x, y]; };
      svg.addEventListener('pointermove', ev => {
        const r = svg.getBoundingClientRect(), X = (ev.clientX - r.left) / r.width * svg.viewBox.baseVal.width, Y = (ev.clientY - r.top) / r.height * svg.viewBox.baseVal.height;
        if (X < C.ml || X > C.ml + C.pw || Y < C.mt || Y > C.mt + C.ph) { xh.setAttribute('visibility', 'hidden'); return; }
        const [x, y] = inv(X, Y); xh.setAttribute('visibility', 'visible');
        lv.setAttribute('x1', X); lv.setAttribute('x2', X); lh.setAttribute('y1', Y); lh.setAttribute('y2', Y);
        t.textContent = `${C.o.xs || 'x'} = ${U.sig(x, 3)},  ${C.o.ys || 'y'} = ${U.sig(y, 3)}`;
        const bx = X + 158 > C.ml + C.pw ? X - 158 : X + 8, by = Y - 26 < C.mt ? Y + 8 : Y - 26;
        b.setAttribute('x', bx); b.setAttribute('y', by); t.setAttribute('x', bx + 6); t.setAttribute('y', by + 14);
      });
      svg.addEventListener('pointerleave', () => xh.setAttribute('visibility', 'hidden'));
    });
  }


  const calc = (id, title, inputs, outId) => `<div class="panel hbcalc no-print" data-calc="${id}"><div class="panel-h"><h4>${title}</h4><span class="eyebrow">Calculator</span></div>
    <div class="hbci">${inputs.map(i => i[2] === 'sel' ? `<label><span>${i[1]}</span><select data-k="${i[0]}">${i[3].map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></label>` : `<label><span>${i[1]}</span><input type="number" step="any" data-k="${i[0]}" value="${i[2]}"></label>`).join('')}</div><div class="hbco" id="${outId || id + 'o'}"></div></div>`;

  /* ------------------------------------------------------------------ data helpers */
  const P = LAB.P, rng = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(6)); return o; };
  const f3 = v => +v.toFixed(3), f4 = v => +v.toFixed(4);
  const STEPN = ['≤ 3', '3–6', '6–10', '10–18', '18–30', '30–50', '50–80', '80–120', '120–180', '180–250', '250–315', '315–400', '400–500'];
  const T95 = [[1, 1.84, 12.71, 63.66], [2, 1.32, 4.30, 9.92], [3, 1.20, 3.18, 5.84], [4, 1.14, 2.78, 4.60], [5, 1.11, 2.57, 4.03], [6, 1.09, 2.45, 3.71], [7, 1.08, 2.36, 3.50], [8, 1.07, 2.31, 3.36], [9, 1.06, 2.26, 3.25], [10, 1.05, 2.23, 3.17], [12, 1.04, 2.18, 3.05], [15, 1.03, 2.13, 2.95], [20, 1.03, 2.09, 2.85], [25, 1.02, 2.06, 2.79], [30, 1.02, 2.04, 2.75], [50, 1.01, 2.01, 2.68], [100, 1.005, 1.98, 2.63], ['∞', 1.000, 1.96, 2.58]];
  const KIENZLE = [['Structural steel E250 (St 37)', 1780, 0.17, 0.30], ['Steel C45 (EN8), normalised', 2220, 0.14, 0.27], ['Steel 16MnCr5 (case-hardening)', 2100, 0.26, 0.30], ['Steel 42CrMo4 (EN19), QT', 2500, 0.26, 0.30], ['Stainless steel X5CrNi18-10 (304)', 2350, 0.21, 0.35], ['Grey cast iron FG 260', 1150, 0.22, 0.25], ['Spheroidal graphite iron SG 500/7', 1500, 0.25, 0.28], ['Aluminium alloy, wrought (6063, 6061)', 750, 0.25, 0.30], ['Aluminium–silicon casting alloy', 800, 0.23, 0.28], ['Free-cutting brass CuZn39Pb3', 780, 0.18, 0.25], ['Titanium alloy Ti-6Al-4V', 1450, 0.23, 0.35]];
  const GF = [['Constantan (Cu-Ni, advance)', '2.0–2.1', 'Most common; good temperature stability; self-temperature-compensated'], ['Karma (Ni-Cr modified)', '2.0–2.1', 'Wider temperature range, better fatigue life'], ['Isoelastic (Ni-Cr-Mo-Fe)', '3.5–3.6', 'High output for dynamic work; poor temperature stability'], ['Nichrome V', '2.1–2.2', 'High-temperature gauges'], ['Platinum–tungsten', '4.0–4.5', 'High temperature, high sensitivity'], ['Semiconductor (p-type silicon)', '+100 to +175', 'Very high output, non-linear, temperature sensitive'], ['Semiconductor (n-type silicon)', '−100 to −140', 'Used in pairs with p-type']];
  const BRIDGE = [['Quarter, 1 active gauge (axial)', '1', 'ε', 'No (needs 3-wire leads and STC gauge)'], ['Half, 2 active: axial + transverse (Poisson)', '1 + ν', '(1 + ν)ε', 'Yes'], ['Half, 2 active: top + bottom of a beam (adjacent arms)', '2', '2ε', 'Yes; cancels axial load'], ['Half, 2 active: both axial in opposite arms', '2', '2ε', 'No; cancels bending'], ['Full, 4 active: 2 top + 2 bottom (bending)', '4', '4ε', 'Yes'], ['Full, 4 active: 2 axial + 2 transverse (column)', '2(1 + ν)', '2(1 + ν)ε', 'Yes; cancels bending'], ['Full, 4 active at ±45° on a shaft (torsion)', '4', '4ε₄₅ = 2γ', 'Yes; cancels bending and axial']];
  const NOTE_ISO286 = 'Holes: for A–H, EI = −es of the same shaft letter; for K, M and N up to IT8 and for P–ZC up to IT7, ES = −ei + Δ with Δ = IT<sub>n</sub> − IT<sub>n−1</sub>; otherwise ES = −ei (K above IT8: ES = 0). JS and js are symmetric (±IT/2).';
  const tcRow = t => [t, t >= -270 ? f3(P.tcE('K', t)) : null, t >= -210 && t <= 760 ? f3(P.tcE('J', t)) : null, t >= 0 && t <= 400 ? f3(P.tcE('T', t)) : null, t >= 0 && t <= 1000 ? f3(P.tcE('E', t)) : null];
  const TCtab = { cols: ['t (°C)', 'Type K (mV)', 'Type J (mV)', 'Type T (mV)', 'Type E (mV)'], rows: [...rng(-200, -10, 10), ...rng(0, 1370, 10)].map(tcRow), src: 'ITS-90 reference functions, NIST Monograph 175 (reference junction 0 °C). Types T and E shown for 0 °C and above.' };
  const TCfine = { cols: ['t (°C)', 'Type K (mV)', 'Type J (mV)', 'Seebeck K (µV/°C)', 'Seebeck J (µV/°C)'], rows: rng(0, 400, 1).filter(t => t % 5 === 0).map(t => [t, f3(P.tcE('K', t)), f3(P.tcE('J', t)), +P.tcS('K', t).toFixed(2), +P.tcS('J', t).toFixed(2)]), src: 'ITS-90, every 5 °C from 0 to 400 °C; the look-up interpolates to 0.01 °C.' };
  const PTtab = { cols: ['t (°C)', 'R (Ω)', 'dR/dt (Ω/°C)', 'Class A (±°C)', 'Class B (±°C)'], rows: rng(-200, 850, 10).map(t => [t, f3(P.ptR(t)), +(P.ptR(t + 0.5) - P.ptR(t - 0.5)).toFixed(4), +P.ptTol.A(t).toFixed(3), +P.ptTol.B(t).toFixed(3)]), src: 'IEC 60751: R₀ = 100 Ω, A = 3.9083 × 10⁻³, B = −5.775 × 10⁻⁷, C = −4.183 × 10⁻¹² (below 0 °C).' };
  const INVtab = { cols: ['α (°)', 'inv α', 'tan α', 'cos α'], rows: rng(10, 45, 0.5).map(a => [a, +P.inv(a).toFixed(6), +Math.tan(a * Math.PI / 180).toFixed(6), +Math.cos(a * Math.PI / 180).toFixed(6)]), src: 'inv α = tan α − α (α in radians).' };
  const GEARtab = { cols: ['z', 'Chordal thickness w (m = 1)', 'Chordal addendum h (m = 1)', 'Teeth spanned k (20°)', 'Base tangent W (m = 1, 20°)'], rows: rng(8, 120, 1).map(z => { const c = P.gearChord(1, z), k = P.spanTeeth(z, 20); return [z, f4(c.w), f4(c.h), k, f4(P.baseTan(1, z, k, 20))]; }), src: 'ISO 21771 geometry for standard (unshifted) spur gears; multiply lengths by the module.' };
  const ws = d => d <= 2.8 ? Math.sqrt(1.4 * 2.8) : d <= 5.6 ? Math.sqrt(2.8 * 5.6) : d <= 11.2 ? Math.sqrt(5.6 * 11.2) : d <= 22.4 ? Math.sqrt(11.2 * 22.4) : d <= 45 ? Math.sqrt(22.4 * 45) : Math.sqrt(45 * 90);
  const THtab = P.THREADS.map(([n, d, p]) => { const d2 = P.d2(d, p), es = -(15 + 11 * p), Td2 = 90 * p ** 0.4 * ws(d) ** 0.1; return [n + ' × ' + p, d, p, f3(d2), f3(P.d3(d, p)), f3(P.d1(d, p)), f3(P.bestWire(p)), +(es).toFixed(1), +Td2.toFixed(0), f3(d2 + es / 1000), f3(d2 + (es - Td2) / 1000)]; });
  const MATtab = Object.values(P.MAT).map(m => [m.name, m.E, m.nu, m.a, m.rho]);
  const fitsAt = [10, 25, 50, 100];
  const PREF = [['H11/c11', 'Loose running', 'H', 11, 'c', 11], ['H9/d9', 'Free running', 'H', 9, 'd', 9], ['H8/f7', 'Close running', 'H', 8, 'f', 7], ['H7/g6', 'Sliding', 'H', 7, 'g', 6], ['H7/h6', 'Locational clearance', 'H', 7, 'h', 6], ['H7/k6', 'Locational transition', 'H', 7, 'k', 6], ['H7/n6', 'Locational transition (tighter)', 'H', 7, 'n', 6], ['H7/p6', 'Locational interference', 'H', 7, 'p', 6], ['H7/s6', 'Medium drive', 'H', 7, 's', 6]];
  const fitRow = (D, f) => { try { const r = P.fit(D, f[2] + f[3], f[4] + f[5]); return `${r.maxC > 0 ? '+' : ''}${r.maxC} / ${r.minC > 0 ? '+' : ''}${r.minC}`; } catch (e) { return '—'; } };
  // c-shaft is not in the toolkit; remove rows that fail
  const PREF_OK = PREF.filter(f => { try { P.fit(25, f[2] + f[3], f[4] + f[5]); return true; } catch (e) { return false; } });
  const SLIPSETS = [['M87', 87, '1.0005; 1.001–1.009 (step 0.001); 1.01–1.49 (step 0.01); 0.5–9.5 (step 0.5); 10–90 (step 10)'], ['M112', 112, '1.0005; 1.001–1.009 (step 0.001); 1.01–1.49 (step 0.01); 0.5–24.5 (step 0.5); 25, 50, 75, 100'], ['M45', 45, '1.001–1.009 (step 0.001); 1.01–1.09 (step 0.01); 1.1–1.9 (step 0.1); 1–9 (step 1); 10–90 (step 10)']];
  const GBtab = P.GB_TOL.map(([L, g], i) => [`${i ? P.GB_TOL[i - 1][0] : 0.5}–${L}`, g.K[0], g[0][0], g[1][0], g[2][0], g.K[1], g[0][1], g[1][1], g[2][1]]);

  /* ------------------------------------------------------------------ calculators */
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  const out = rows => `<table class="t hbt"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="n"><b>${r[1]}</b></td><td>${r[2] || ''}</td></tr>`).join('')}</tbody></table>`;
  const CALC = {
    fit(v) { const D = num(v.D, 25); const r = P.fit(D, v.hole, v.shaft); return out([['Hole limits', `${U.f(D + r.H.lo / 1000, 3)} … ${U.f(D + r.H.up / 1000, 3)}`, `mm (EI ${r.H.lo}, ES ${r.H.up} µm)`], ['Shaft limits', `${U.f(D + r.S.lo / 1000, 3)} … ${U.f(D + r.S.up / 1000, 3)}`, `mm (ei ${r.S.lo}, es ${r.S.up} µm)`], ['Maximum clearance', r.maxC, 'µm (negative = interference)'], ['Minimum clearance', r.minC, 'µm'], ['Type of fit', r.kind, '']]); },
    slip(v) { const L = num(v.L, 41.125), c = P.slip(L, v.set); return c ? out([['Blocks', c.map(b => +b.toFixed(4)).join(' + '), 'mm'], ['Number of blocks', c.length, ''], ['Check: sum', U.f(c.reduce((a, b) => a + b, 0), 4), 'mm']]) : 'Not possible with this set (check the last decimal: the set works in steps of 0.0005 mm or 0.001 mm).'; },
    tc(v) { const ty = v.ty, mode = v.mode, x = num(v.x, 8.138), tr = num(v.tr, 25); if (mode === 'e2t') { const E = x + P.tcE(ty, tr), t = P.tcT(ty, E); return out([['E(t_rj, 0)', U.f(P.tcE(ty, tr), 3), 'mV'], ['E(t, 0) = E_m + E(t_rj)', U.f(E, 3), 'mV'], ['Temperature t', U.f(t, 2), '°C'], ['Seebeck coefficient at t', U.f(P.tcS(ty, t), 2), 'µV/°C']]); } const E = P.tcE(ty, x); return out([['E(t, 0)', U.f(E, 4), 'mV'], ['Meter reading with junction at t_rj', U.f(E - P.tcE(ty, tr), 4), 'mV'], ['Seebeck coefficient', U.f(P.tcS(ty, x), 2), 'µV/°C'], ['Class 1 / class 2 tolerance', `±${U.f(P.tcTol[1](x), 2)} / ±${U.f(P.tcTol[2](x), 2)}`, '°C (K, J)']]); },
    pt(v) { const x = num(v.x, 138.5); if (v.mode === 'r2t') { const t = P.ptT(x); return out([['Temperature', U.f(t, 3), '°C'], ['Class A / B tolerance', `±${U.f(P.ptTol.A(t), 2)} / ±${U.f(P.ptTol.B(t), 2)}`, '°C']]); } return out([['Resistance', U.f(P.ptR(x), 4), 'Ω'], ['Sensitivity dR/dt', U.f(P.ptR(x + 0.5) - P.ptR(x - 0.5), 4), 'Ω/°C'], ['Class A / B tolerance', `±${U.f(P.ptTol.A(x), 2)} / ±${U.f(P.ptTol.B(x), 2)}`, '°C']]); },
    grav(v) { const ph = num(v.lat, 13.07) * Math.PI / 180, hgt = num(v.h, 90); const g = 9.780327 * (1 + 0.0053024 * Math.sin(ph) ** 2 - 0.0000058 * Math.sin(2 * ph) ** 2) - 3.086e-6 * hgt; return out([['Local gravity g', U.f(g, 5), 'm/s²'], ['g/g_n', U.f(g / 9.80665, 6), ''], ['A 10 bar (nominal) dead-weight load gives', U.f(10 * g / 9.80665, 4), 'bar']]); },
    wire(v) { const p = num(v.p, 2.5), d = num(v.d, P.bestWire(p)), M_ = num(v.M, 20.42), a = num(v.a, 60) * Math.PI / 180; const E = M_ - d * (1 + 1 / Math.sin(a / 2)) + p / 2 / Math.tan(a / 2); return out([['Best-size wire', U.f(p / (2 * Math.cos(a / 2)), 4), 'mm'], ['Dimension under wires T = M − 2d', U.f(M_ - 2 * d, 4), 'mm'], ['P = (p/2)cot(α/2) − d[cosec(α/2) − 1]', U.f(p / 2 / Math.tan(a / 2) - d * (1 / Math.sin(a / 2) - 1), 4), 'mm'], ['Effective diameter E', U.f(E, 4), 'mm']]); },
    gear(v) { const m = num(v.m, 3), z = Math.round(num(v.z, 30)), a = num(v.a, 20); const c = P.gearChord(m, z), cc = P.constChord(m, a), k = P.spanTeeth(z, a); return out([['Pitch diameter', U.f(m * z, 3), 'mm'], ['Tip diameter (full depth)', U.f(m * (z + 2), 3), 'mm'], ['Chordal thickness w', U.f(c.w, 4), 'mm'], ['Chordal addendum h', U.f(c.h, 4), 'mm'], ['Constant chord c, depth h_c', `${U.f(cc.c, 4)}, ${U.f(cc.h, 4)}`, 'mm'], ['Teeth to span k', k, ''], ['Base tangent span W', U.f(P.baseTan(m, z, k, a), 4), 'mm']]); },
    sine(v) { const L = num(v.L, 200), t = num(v.t, 30); const H = L * Math.sin(t * Math.PI / 180), c = P.slip(Math.round(H * 2000) / 2000, 'M87'); return out([['Slip-gauge height H', U.f(H, 4), 'mm'], ['Rounded to 0.0005 mm', U.f(Math.round(H * 2000) / 2000, 4), 'mm'], ['M87 combination', c ? c.map(b => +b.toFixed(4)).join(' + ') : '—', 'mm'], ['Sensitivity', U.f(1e-3 / (L * Math.cos(t * Math.PI / 180)) * 206265, 2), '″ per µm of H']]); },
    turn(v) { const f = num(v.f, 0.15), r = num(v.r, 0.8); return out([['Ideal Rt = f²/(8r)', U.f(f * f / (8 * r) * 1000, 3), 'µm'], ['Ideal Ra = f²/(18√3 r)', U.f(f * f / (18 * Math.sqrt(3) * r) * 1000, 3), 'µm'], ['Grade (ideal Ra)', P.ngrade(f * f / (18 * Math.sqrt(3) * r) * 1000), ''], ['ISO 4288 cut-off (RSm = f)', f < 0.13 ? '0.25' : f < 0.4 ? '0.8' : '2.5', 'mm']]); },
    unc(v) { const us = [v.u1, v.u2, v.u3, v.u4].map(x => num(x, 0)), nus = [v.n1, v.n2, v.n3, v.n4].map(x => num(x, 1e9)); const uc = Math.sqrt(us.reduce((a, b) => a + b * b, 0)); const den = us.reduce((a, b, i) => a + (b ? b ** 4 / nus[i] : 0), 0); const nef = den ? uc ** 4 / den : Infinity; const k = LAB.M.t95(Math.min(nef, 1e6)); return out([['Combined standard uncertainty u_c', U.sig(uc, 3), ''], ['Effective degrees of freedom ν_eff', isFinite(nef) ? U.f(nef, 1) : '∞', 'Welch–Satterthwaite'], ['Coverage factor k (95 %)', U.f(k, 2), ''], ['Expanded uncertainty U = k u_c', U.sig(k * uc, 3), '']]); }
  };
  const CALCIN = {
    fit: [['D', 'Basic size D (mm, 1–500)', 25], ['hole', 'Hole class', 'sel', ['H7', 'H8', 'H9', 'H11', 'H6', 'G7', 'F8', 'K7', 'N7', 'P7', 'S7', 'JS7'].map(x => [x, x])], ['shaft', 'Shaft class', 'sel', ['g6', 'h6', 'f7', 'e8', 'd9', 'k6', 'm6', 'n6', 'p6', 'r6', 's6', 'js6', 'h7', 'h9', 'h11'].map(x => [x, x])]],
    slip: [['L', 'Length required (mm)', 41.125], ['set', 'Set', 'sel', Object.entries(P.SETS).map(([k, v]) => [k, v.name])]],
    tc: [['ty', 'Type', 'sel', [['K', 'K'], ['J', 'J'], ['T', 'T'], ['E', 'E']]], ['mode', 'Convert', 'sel', [['e2t', 'emf → temperature'], ['t2e', 'temperature → emf']]], ['x', 'Measured emf E_m (mV) or temperature (°C)', 8.138], ['tr', 'Reference-junction temperature t_rj (°C)', 25]],
    pt: [['mode', 'Convert', 'sel', [['r2t', 'resistance → temperature'], ['t2r', 'temperature → resistance']]], ['x', 'R (Ω) or t (°C)', 138.5]],
    grav: [['lat', 'Latitude (°)', 13.07], ['h', 'Height above sea level (m)', 90]],
    wire: [['p', 'Pitch p (mm)', 2.5], ['d', 'Wire diameter d (mm)', 1.443], ['M', 'Dimension over wires M (mm)', 20.42], ['a', 'Included thread angle (°)', 60]],
    gear: [['m', 'Module m (mm)', 3], ['z', 'Number of teeth z', 30], ['a', 'Pressure angle (°)', 20]],
    sine: [['L', 'Sine bar length L (mm)', 200], ['t', 'Angle θ (°)', 30]],
    turn: [['f', 'Feed f (mm/rev)', 0.15], ['r', 'Nose radius r_ε (mm)', 0.8]],
    unc: [['u1', 'u₁', 0.5], ['n1', 'ν₁', 9], ['u2', 'u₂', 0.3], ['n2', 'ν₂ (large = ∞)', 1e9], ['u3', 'u₃', 0.2], ['n3', 'ν₃', 1e9], ['u4', 'u₄', 0], ['n4', 'ν₄', 1e9]]
  };

  /* ------------------------------------------------------------------ charts */
  const tcChart = () => chart({ title: 'Thermocouple emf against temperature', cap: 'ITS-90 reference functions, reference junction at 0 °C.', x: [0, 1200], y: [0, 70], xl: 'Temperature t (°C)', yl: 'emf E (mV)', xs: 't', ys: 'E', curves: [{ label: 'E', pts: rng(0, 1000, 10).map(t => [t, P.tcE('E', t)]) }, { label: 'J', pts: rng(0, 760, 10).map(t => [t, P.tcE('J', t)]) }, { label: 'K', pts: rng(0, 1200, 10).map(t => [t, P.tcE('K', t)]) }, { label: 'T', pts: rng(0, 400, 10).map(t => [t, P.tcE('T', t)]) }] });
  const ptChart = () => chart({ title: 'Pt100 resistance against temperature', cap: 'IEC 60751.', x: [-200, 850], y: [0, 400], xl: 'Temperature t (°C)', yl: 'Resistance R (Ω)', xs: 't', ys: 'R', curves: [{ label: 'Pt100', pts: rng(-200, 850, 10).map(t => [t, P.ptR(t)]) }] });
  const raChart = () => chart({ title: 'Ideal turned roughness', cap: 'Ra = f²/(18√3 r) for nose radii 0.4, 0.8, 1.2 and 1.6 mm.', x: [0.05, 0.5], y: [0, 12], xl: 'Feed f (mm/rev)', yl: 'Ra (µm)', xs: 'f', ys: 'Ra', curves: [0.4, 0.8, 1.2, 1.6].map(r => ({ label: 'r ' + r, pts: rng(0.05, 0.5, 0.01).map(f => [f, f * f / (18 * Math.sqrt(3) * r) * 1000]) })) });
  const sineChart = () => chart({ title: 'Sine bar sensitivity', cap: 'Angle error per µm of slip-gauge height, L = 100 and 200 mm.', x: [0, 80], y: [0, 15], xl: 'Angle θ (°)', yl: 'dθ per µm of H (″)', xs: 'θ', ys: '″/µm', curves: [100, 200].map(L => ({ label: L + ' mm', pts: rng(0, 80, 1).map(t => [t, 1e-3 / (L * Math.cos(t * Math.PI / 180)) * 206265]) })) });

  /* ------------------------------------------------------------------ chapters */
  const CH_ = [
    { id: 'units', t: 'Units, vocabulary and instrument characteristics', f: () => `
      ${h3('SI base units')}${tab(['Quantity', 'Unit', 'Symbol', 'Definition (since 2019, by fixed constants)'], [['Length', 'metre', 'm', 'speed of light c = 299 792 458 m/s'], ['Mass', 'kilogram', 'kg', 'Planck constant h = 6.626 070 15 × 10⁻³⁴ J·s'], ['Time', 'second', 's', 'caesium-133 hyperfine frequency 9 192 631 770 Hz'], ['Electric current', 'ampere', 'A', 'elementary charge e = 1.602 176 634 × 10⁻¹⁹ C'], ['Temperature', 'kelvin', 'K', 'Boltzmann constant k = 1.380 649 × 10⁻²³ J/K'], ['Amount of substance', 'mole', 'mol', 'Avogadro constant'], ['Luminous intensity', 'candela', 'cd', 'luminous efficacy 683 lm/W at 540 THz']], { text: [0, 1, 2, 3] })}
      ${h3('Prefixes')}${tab(['Prefix', 'Symbol', 'Factor', 'Prefix', 'Symbol', 'Factor'], [['giga', 'G', '10⁹', 'milli', 'm', '10⁻³'], ['mega', 'M', '10⁶', 'micro', 'µ', '10⁻⁶'], ['kilo', 'k', '10³', 'nano', 'n', '10⁻⁹'], ['hecto', 'h', '10²', 'pico', 'p', '10⁻¹²']], { text: [0, 1, 2, 3, 4, 5] })}
      ${note('Reference temperature for dimensional measurement is 20 °C (ISO 1). A 100 mm steel part measured at 25 °C is 5.75 µm longer than at 20 °C.')}
      ${h3('Vocabulary of metrology (after VIM, JCGM 200)')}${tab(['Term', 'Meaning'], [['Measurand', 'The quantity intended to be measured.'], ['True value', 'Value consistent with the definition of the measurand; in practice estimated by a reference standard.'], ['Error', 'Measured value minus reference value. Systematic (repeatable, correctable) and random (scattered) components.'], ['Correction', 'Value added to a reading to compensate for a known systematic error; equal to minus the error.'], ['Accuracy', 'Closeness of a measured value to the true value (qualitative).'], ['Precision', 'Closeness of repeated measurements to each other (repeatability, reproducibility).'], ['Repeatability', 'Precision under the same conditions: same operator, instrument, location, short time.'], ['Reproducibility', 'Precision under changed conditions: different operators, instruments, laboratories.'], ['Resolution', 'Smallest change in the quantity that causes a perceptible change in the indication.'], ['Least count', 'Value of the smallest division (or digit step) of an indicating instrument.'], ['Sensitivity', 'Change in output divided by change in input (slope of the calibration curve).'], ['Linearity (independent)', 'Largest deviation of the calibration curve from the best-fit straight line, % of full scale.'], ['Hysteresis', 'Difference between readings for increasing and decreasing input at the same input.'], ['Threshold / dead zone', 'Largest input change that produces no detectable output.'], ['Drift', 'Slow change of the indication with time at constant input.'], ['Span / range', 'Difference between upper and lower limits of the measuring range.'], ['Calibration', 'Establishing the relation between indications and reference values, with uncertainties.'], ['Traceability', 'Unbroken chain of calibrations, each with stated uncertainty, to SI units.'], ['Uncertainty', 'Parameter characterising the dispersion of values that could reasonably be attributed to the measurand.']], { text: [0, 1] })}
      ${h3('Static characteristics from a calibration')}${eqs([['Sensitivity', 'K = Δq<sub>o</sub>/Δq<sub>i</sub>', 'slope of the least-squares line'], ['Error and % of span', 'e = r − r<sub>true</sub>;  e% = e/span × 100', ''], ['Non-linearity', 'L = |r̄ − (a + Kq)|<sub>max</sub>/FS × 100', 'independent (best-fit) definition'], ['Hysteresis', 'H = |r<sub>up</sub> − r<sub>down</sub>|<sub>max</sub>/FS × 100', ''], ['Repeatability', 's = √[Σ(r − r̄)²/(n − 1)]', 'at one input']])}` },
    { id: 'unc', t: 'Measurement uncertainty and statistics', f: () => `
      ${h3('The GUM procedure')}${eqs([['1. Model', 'y = f(x₁, x₂, … x<sub>n</sub>)', 'write the measurand as a function of inputs'], ['2. Standard uncertainties', 'Type A: u = s/√n;  Type B: from the distribution of the bound', 'see table below'], ['3. Sensitivity coefficients', 'c<sub>i</sub> = ∂f/∂x<sub>i</sub>', 'or relative form for products and quotients'], ['4. Combined standard uncertainty', 'u<sub>c</sub>² = Σ (c<sub>i</sub>u<sub>i</sub>)²', 'uncorrelated inputs'], ['5. Effective degrees of freedom', 'ν<sub>eff</sub> = u<sub>c</sub>⁴ / Σ[(c<sub>i</sub>u<sub>i</sub>)⁴/ν<sub>i</sub>]', 'Welch–Satterthwaite'], ['6. Expanded uncertainty', 'U = k u<sub>c</sub>', 'k = 2 (≈ 95 %) or t<sub>95</sub>(ν<sub>eff</sub>)'], ['Products and quotients', '(u<sub>y</sub>/y)² = Σ (p<sub>i</sub> u<sub>i</sub>/x<sub>i</sub>)² for y = Π x<sub>i</sub>^p<sub>i</sub>', 'relative uncertainties add in quadrature']])}
      ${h3('Type B: from a bound to a standard uncertainty')}${tab(['Distribution', 'When used', 'Standard uncertainty'], [['Rectangular (uniform)', 'Only limits ±a known: tolerance, specification, digital resolution (a = half a digit)', 'a/√3 (resolution δ: δ/√12)'], ['Triangular', 'Values near the centre more likely', 'a/√6'], ['U-shaped (arcsine)', 'Sinusoidal variation, e.g. temperature cycling', 'a/√2'], ['Normal', 'Certificate gives U and k', 'U/k']], { text: [0, 1, 2] })}
      ${h3('Student t-values (two-sided)')}${tab(['ν (degrees of freedom)', '68.27 %', '95 %', '99 %'], T95)}
      ${calcBlock('unc', 'Combined and expanded uncertainty')}
      ${h3('Least-squares straight line y = a + bx')}${eqs([['Slope', 'b = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)²', ''], ['Intercept', 'a = ȳ − b x̄', ''], ['Residual standard deviation', 's<sub>y</sub> = √[Σ(y − a − bx)²/(n − 2)]', ''], ['Standard error of the slope', 's<sub>b</sub> = s<sub>y</sub>/√Σ(x − x̄)²', ''], ['Coefficient of determination', 'R² = [Σ(x − x̄)(y − ȳ)]² / [Σ(x − x̄)² Σ(y − ȳ)²]', '']])}` },
    { id: 'iso286', t: 'Limits, fits and tolerances (ISO 286)', f: () => `
      ${note('A tolerance class is a letter (fundamental deviation, position of the zone) and a number (tolerance grade, width of the zone): e.g. Ø 25 H7/g6. Capital letters are holes, small letters are shafts.')}
      ${h3('Standard tolerance grades IT (µm)')}${tab(['Size step (mm)', ...rng(1, 16, 1).map(g => 'IT' + g)], STEPN.map((s, i) => [s, ...rng(1, 16, 1).map(g => P.IT[g][i])]))}
      ${eqs([['Standard tolerance unit (IT5–IT16)', 'i = 0.45 ∛D + 0.001 D  µm', 'D = geometric mean of the size step (mm)'], ['Grade multipliers', 'IT5 7i, IT6 10i, IT7 16i, IT8 25i, IT9 40i, IT10 64i, IT11 100i, IT12 160i …', 'rounded in the table']])}
      ${h3('Fundamental deviations of shafts (µm)')}${tab(['Size step (mm)', 'd (es)', 'e (es)', 'f (es)', 'g (es)', 'h (es)', 'k (ei, IT4–7)', 'm (ei)', 'n (ei)', 'p (ei)'], STEPN.map((s, i) => [s, P.SHAFT_ES.d[i], P.SHAFT_ES.e[i], P.SHAFT_ES.f[i], P.SHAFT_ES.g[i], 0, P.SHAFT_EI.k[i], P.SHAFT_EI.m[i], P.SHAFT_EI.n[i], P.SHAFT_EI.p[i]]))}
      ${tab(['Size step (mm)', ...P.SUB.map((b, i) => (i ? P.SUB[i - 1] : 0) + '–' + b)], [['r (ei)', ...P.SHAFT_EI_SUB.r], ['s (ei)', ...P.SHAFT_EI_SUB.s]])}
      ${note(NOTE_ISO286)}
      ${h3('Preferred fits: clearance (+) / interference (−) in µm')}${tab(['Fit', 'Type', ...fitsAt.map(D => 'Ø ' + D + ' mm: max / min')], PREF_OK.map(f => [f[0], f[1], ...fitsAt.map(D => fitRow(D, f))]), { text: [0, 1, 2, 3, 4, 5] })}
      ${calcBlock('fit', 'Fit calculator')}` },
    { id: 'gauge', t: 'Gauge blocks and limit gauges', f: () => `
      ${h3('Gauge-block (slip-gauge) sets')}${tab(['Set', 'Pieces', 'Contents (mm)'], SLIPSETS, { text: [0, 2] })}
      ${h3('ISO 3650 tolerances for gauge blocks (µm)')}${tab(['Nominal length (mm)', 't_e grade K', 't_e grade 0', 't_e grade 1', 't_e grade 2', 't_v grade K', 't_v grade 0', 't_v grade 1', 't_v grade 2'], GBtab)}
      ${note('t_e: limit deviation of length at any point from nominal; t_v: tolerance for the variation in length (flatness and parallelism of the faces). Grade K blocks are calibrated and used with their certified lengths; grade 0 and 1 for inspection; grade 2 for workshop use.')}
      ${calcBlock('slip', 'Slip-gauge combination')}
      ${h3('Building a stack')}${eqs([['Rule', 'Remove the last decimal place first: 1.0005 → 1.00x → 1.xx (to a multiple of 0.5) → 0.5-step block → tens', 'fewest blocks, fewest wringing films'], ['Example (M87)', '41.125 = 1.005 + 1.12 + 9 + 30', '4 blocks'], ['Wringing film', '≈ 0.005–0.025 µm each', 'negligible when blocks are clean']])}
      ${h3('Limit gauges')}${eqs([['GO gauge', 'made to the maximum material limit (shaft: upper limit; hole: lower limit)', 'checks all features at once (Taylor)'], ['NO-GO gauge', 'made to the least material limit (shaft: lower; hole: upper)', 'checks one dimension at a time'], ['Gauge tolerance (simplified)', 'T<sub>g</sub> ≈ 0.1 T (work tolerance)', 'IS 3455 / ISO 1938 give exact values'], ['Wear allowance', 'W ≈ 0.1 T<sub>g</sub>, on the GO gauge only', 'zones lie inside the work tolerance'], ['Snap gauge (shaft)', 'GO: UL − W − T<sub>g</sub> … UL − W;  NO-GO: LL … LL + T<sub>g</sub>', ''], ['Plug gauge (hole)', 'GO: LL + W … LL + W + T<sub>g</sub>;  NO-GO: UL − T<sub>g</sub> … UL', '']])}` },
    { id: 'temp', t: 'Thermocouples and resistance thermometers', f: () => `
      ${tcChart()}
      ${calcBlock('tc', 'Thermocouple emf ↔ temperature')}
      ${look(TCtab, { title: 'ITS-90 thermocouple reference table (10 °C steps)' })}
      ${look(TCfine, { title: 'Types K and J, 0–400 °C (5 °C steps) with Seebeck coefficients' })}
      ${h3('Thermocouple types and tolerances (IEC 60584-1)')}${tab(['Type', 'Materials (+ / −)', 'Range (°C)', 'Class 1', 'Class 2'], [['K', 'Ni-Cr / Ni-Al (chromel / alumel)', '−200 to 1200', '±1.5 °C or ±0.004|t|', '±2.5 °C or ±0.0075|t|'], ['J', 'Fe / Cu-Ni (iron / constantan)', '−40 to 750', '±1.5 °C or ±0.004|t|', '±2.5 °C or ±0.0075|t|'], ['T', 'Cu / Cu-Ni (copper / constantan)', '−200 to 350', '±0.5 °C or ±0.004|t|', '±1.0 °C or ±0.0075|t|'], ['E', 'Ni-Cr / Cu-Ni', '−200 to 900', '±1.5 °C or ±0.004|t|', '±2.5 °C or ±0.0075|t|'], ['N', 'Ni-Cr-Si / Ni-Si', '−200 to 1200', '±1.5 °C or ±0.004|t|', '±2.5 °C or ±0.0075|t|'], ['R, S', 'Pt-Rh / Pt', '0 to 1600', '±1.0 °C (0–1100)', '±1.5 °C or ±0.0025|t|'], ['B', 'Pt-30Rh / Pt-6Rh', '600 to 1700', '—', '±0.0025|t|']], { text: [0, 1, 2, 3, 4] })}
      ${eqs([['Law of intermediate temperatures', 'E(t, 0) = E(t, t<sub>rj</sub>) + E(t<sub>rj</sub>, 0)', 'reference-junction correction'], ['Law of intermediate metals', 'a third metal with both junctions at one temperature adds no emf', 'meter leads, solder'], ['Seebeck coefficient', 'S = dE/dt', 'K ≈ 41 µV/°C, J ≈ 52–55, T ≈ 40–60']])}
      ${ptChart()}
      ${calcBlock('pt', 'Pt100 resistance ↔ temperature')}
      ${look(PTtab, { title: 'Pt100 (IEC 60751) every 10 °C' })}
      ${eqs([['Callendar–Van Dusen, t ≥ 0', 'R = R₀(1 + At + Bt²)', ''], ['t < 0', 'R = R₀[1 + At + Bt² + C(t − 100)t³]', ''], ['Inverse (t ≥ 0)', 't = [−A + √(A² − 4B(1 − R/R₀))]/(2B)', ''], ['Classes AA, A, B, C', '±(0.1 + 0.0017|t|), ±(0.15 + 0.002|t|), ±(0.3 + 0.005|t|), ±(0.6 + 0.01|t|) °C', ''], ['Self-heating', 'Δt = I²R/δ', 'δ: tens of mW/°C in stirred liquid, a few in air'], ['2-wire lead error', 'Δt ≈ R<sub>loop</sub>/0.385 °C', 'use 3- or 4-wire']])}` },
    { id: 'pfs', t: 'Pressure, force and strain', f: () => `
      ${h3('Pressure units')}${tab(['Unit', 'Pa', 'bar', 'kgf/cm²', 'psi', 'mm Hg'], [['1 Pa', 1, 1e-5, 1.0197e-5, 1.4504e-4, 7.5006e-3], ['1 bar', 1e5, 1, 1.0197, 14.504, 750.06], ['1 kgf/cm² (at)', 98066.5, 0.980665, 1, 14.223, 735.56], ['1 psi', 6894.76, 0.068948, 0.070307, 1, 51.715], ['1 mm Hg (torr)', 133.322, 1.3332e-3, 1.3595e-3, 0.019337, 1], ['1 atm', 101325, 1.01325, 1.0332, 14.696, 760]])}
      ${calcBlock('grav', 'Local gravity and dead-weight correction')}
      ${eqs([['Local gravity (IGF 1980, simplified)', 'g = 9.780 327[1 + 0.005 3024 sin²φ − 0.000 0058 sin²2φ] − 3.086 × 10⁻⁶ h', 'φ latitude, h height (m)'], ['Dead-weight tester', 'p = m g (1 − ρ<sub>a</sub>/ρ<sub>w</sub>) / A<sub>e</sub> + ρ<sub>f</sub> g Δh', 'last term: fluid head between piston and gauge'], ['Bourdon gauge accuracy classes (EN 837-1)', '0.1, 0.25, 0.6, 1.0, 1.6, 2.5, 4.0 % of span', 'error and hysteresis at every point']])}
      ${h3('Strain gauges')}${tab(['Grid alloy', 'Gauge factor', 'Use'], GF, { text: [0, 1, 2] })}
      ${h3('Wheatstone bridge arrangements')}${tab(['Arrangement', 'Bridge factor k', 'V<sub>o</sub>/V<sub>ex</sub> = (GF/4) × …', 'Temperature compensated?'], BRIDGE, { text: [0, 1, 2, 3] })}
      ${eqs([['Bridge output (small changes)', 'V<sub>o</sub>/V<sub>ex</sub> = (GF/4)(ε₁ − ε₂ + ε₃ − ε₄)', 'arms 1 and 3 opposite, 1 and 2 adjacent'], ['Indicator correction', 'ε<sub>true</sub> = ε<sub>ind</sub> (GF<sub>dial</sub>/GF<sub>gauge</sub>)/k', ''], ['Apparent strain (temperature)', 'ε<sub>app</sub> ≈ (α<sub>specimen</sub> − α<sub>STC</sub>) ΔT', 'per °C, quarter bridge'], ['Rosette, principal strains', 'ε<sub>1,2</sub> = (ε<sub>a</sub> + ε<sub>c</sub>)/2 ± √[(ε<sub>a</sub> − ε<sub>b</sub>)² + (ε<sub>b</sub> − ε<sub>c</sub>)²]/√2', '0°/45°/90° rectangular rosette']])}
      ${h3('Beam and shaft formulas for transducers')}${eqs([['Cantilever, end load W at distance L', 'σ = 6WL/(bh²);  δ = WL³/(3EI)', 'rectangular section, I = bh³/12'], ['Axial member', 'σ = W/A;  ε<sub>t</sub> = −ν ε<sub>a</sub>', ''], ['Shaft in torsion', 'τ = 16T/(πd³);  ε<sub>±45°</sub> = ±τ/(2G) = ±8T/(πd³G)', 'G = E/[2(1 + ν)]'], ['Load cell', 'RO = V<sub>o</sub>(capacity)/V<sub>ex</sub>  (mV/V)', 'typ. 2–3 mV/V']])}
      ${h3('Materials')}${tab(['Material', 'E (GPa)', 'ν', 'α (10⁻⁶/K)', 'ρ (kg/m³)'], MATtab)}` },
    { id: 'speed', t: 'Speed, frequency and machining forces', f: () => `
      ${eqs([['Toothed wheel and pickup', 'N = 60 f/z  rpm', 'counter resolution 60/(z t<sub>gate</sub>)'], ['Stroboscope: single stationary image', 'F = N/n, n = 1, 2, 3 …', 'start high; the speed is the highest such F'], ['Two consecutive single-image rates', 'N = F₁F₂/(F₁ − F₂)', ''], ['Two images', 'F = 2N', ''], ['Angular speed', 'ω = 2πN/60  rad/s', '']])}
      ${tab(['Instrument', 'Principle', 'Typical accuracy'], [['Mechanical (centrifugal) tachometer', 'Flyweights against a spring', '±1 %'], ['Contact digital tachometer', 'Rubber cone + encoder', '±0.5–1 % (slip)'], ['Optical (photo) tachometer', 'Counts reflections from tape', '±0.05 % + 1 digit'], ['Magnetic pickup + counter', 'Variable reluctance, z teeth', '±1 count'], ['Stroboscope', 'Matching flash rate', '±0.1 % (digital)'], ['Tachogenerator', 'DC or AC generator voltage', '±0.5 %']], { text: [0, 1, 2] })}
      ${h3('Specific cutting force (Kienzle): F<sub>c</sub> = k<sub>c1.1</sub> b h<sup>1−m<sub>c</sub></sup>')}${tab(['Work material', 'k<sub>c1.1</sub> (N/mm²)', 'm<sub>c</sub>', 'F<sub>f</sub>/F<sub>c</sub> (typical at h = 0.2)'], KIENZLE)}
      ${note('Typical values for carbide tools, rake ≈ 6°, v ≈ 100 m/min (Tönshoff & Denkena; König & Klocke). Correct by about −1.5 % per degree of extra rake; worn tools add 30–50 %.')}
      ${eqs([['Cutting speed and power (turning)', 'v = πDN/1000 m/min;  P = F<sub>c</sub>v/60 000 kW', ''], ['Chip thickness ratio, shear angle', 'r = t₁/t₂;  tan φ = r cos γ/(1 − r sin γ)', ''], ['Merchant', 'μ = (F<sub>c</sub> sin γ + F<sub>t</sub> cos γ)/(F<sub>c</sub> cos γ − F<sub>t</sub> sin γ);  F<sub>s</sub> = F<sub>c</sub> cos φ − F<sub>t</sub> sin φ', 'φ = 45° + γ/2 − β/2 (theory)'], ['Drilling', 'P = 2πNM/60;  MRR = (π/4)d² f N;  M ∝ f<sup>0.8</sup>d<sup>1.8</sup>', 'Shaw–Oxford']])}` },
    { id: 'thread', t: 'Screw threads', f: () => `
      ${h3('ISO metric threads, coarse series, with class 6g limits of d₂')}${tab(['Thread', 'd (mm)', 'p (mm)', 'd₂ (mm)', 'd₃ (mm)', 'd₁ (mm)', 'Best wire (mm)', 'es 6g (µm)', 'T<sub>d2</sub> grade 6 (µm)', 'd₂ max 6g', 'd₂ min 6g'], THtab)}
      ${note('d₂ = d − 0.649 52p; d₃ (external minor) = d − 1.226 87p; d₁ (internal minor) = d − 1.082 53p. Fundamental deviations: e = −(50 + 11p), f = −(30 + 11p), g = −(15 + 11p), h = 0 µm. T<sub>d2</sub>(6) = 90p<sup>0.4</sup>d<sup>0.1</sup> µm with d the geometric mean of the size range (ISO 965-1); grades 4, 5, 7, 8 multiply by 0.63, 0.8, 1.25, 1.6.')}
      ${calcBlock('wire', 'Effective diameter by the wire method')}
      ${eqs([['Best-size wire', 'd<sub>b</sub> = (p/2) sec(α/2) = 0.577 35p (60°)', 'contact at the pitch line'], ['Three-wire', 'E = M − d[1 + cosec(α/2)] + (p/2)cot(α/2) = M − 3d + 0.866p (60°)', ''], ['Two-wire (floating carriage)', 'M = S + (R₂ − R₁);  T = M − 2d;  E = T + P,  P = 0.866p − d', ''], ['Whitworth (55°)', 'P = 0.9605p − 1.1657d;  d<sub>b</sub> = 0.5637p', ''], ['Virtual effective diameter', 'E<sub>v</sub> = E + 1.732 δp + 0.36p δα′ (µm, p in mm, δα in minutes)', 'pitch and flank errors'], ['Helix angle', 'ψ = tan⁻¹[p/(πd₂)]', 'tilt of a toolmaker’s microscope column']])}` },
    { id: 'gears', t: 'Gears', f: () => `
      ${eqs([['Pitch diameter, module', 'd = mz;  circular pitch πm', ''], ['Addendum, dedendum (full depth)', 'h<sub>a</sub> = m;  h<sub>f</sub> = 1.25m;  d<sub>a</sub> = m(z + 2)', ''], ['Base circle', 'd<sub>b</sub> = d cos α', ''], ['Chordal thickness and addendum', 'w = zm sin(90°/z);  h = m[1 + (z/2)(1 − cos(90°/z))]', 'gear tooth vernier'], ['Correction for tip diameter', 'h′ = h − (d<sub>a,nom</sub> − d<sub>a,meas</sub>)/2', ''], ['Constant chord', 'c = (πm/2)cos²α;  h<sub>c</sub> = m[1 − (π/8) sin 2α]', '20°: c = 1.3870m, h<sub>c</sub> = 0.7476m'], ['Base tangent span', 'W = m cos α[π(k − ½) + z inv α];  k ≈ zα/180° + 0.5', 'disc micrometer'], ['Thickness change from span', 'Δs = ΔW/cos α', '']])}
      ${calcBlock('gear', 'Gear measurement data')}
      ${look(GEARtab, { title: 'Spur gears, m = 1: chordal values and base tangent span (20°)' })}
      ${look(INVtab, { title: 'Involute function' })}` },
    { id: 'surface', t: 'Surface texture', f: () => `
      ${eqs([['Ra', 'Ra = (1/l) ∫|z| dx', 'arithmetical mean deviation'], ['Rq', 'Rq = √[(1/l) ∫ z² dx] ≈ 1.25 Ra (Gaussian surface)', ''], ['Rz', 'Rz = (1/5) Σ (R<sub>p</sub> + R<sub>v</sub>) over 5 sampling lengths', 'Rz/Ra ≈ 4–7'], ['Rt', 'largest peak-to-valley over the evaluation length', ''], ['Rsk', '(1/Rq³)(1/l) ∫ z³ dx', '> 0 peaky, < 0 plateau'], ['RSm', 'mean width of profile elements', 'spacing of marks'], ['Gaussian filter', 's(x) = (1/αλc) exp[−π(x/αλc)²],  α = √(ln 2/π) = 0.4697', '50 % transmission at λc']])}
      ${h3('Roughness grades (ISO 1302)')}${tab(['Grade', 'Ra (µm)', 'Ra (µin)'], P.NGRADE.map(g => [g[0], g[1], Math.round(g[1] * 39.37)]), { text: [0] })}
      ${h3('Cut-off selection (ISO 4288)')}${tab(['Periodic: RSm (mm)', 'Non-periodic: Ra (µm)', 'Non-periodic: Rz (µm)', 'λc (mm)', 'Evaluation length (mm)'], [['0.013–0.04', '0.006–0.02', '0.025–0.1', 0.08, 0.4], ['0.04–0.13', '0.02–0.1', '0.1–0.5', 0.25, 1.25], ['0.13–0.4', '0.1–2', '0.5–10', 0.8, 4], ['0.4–1.3', '2–10', '10–50', 2.5, 12.5], ['1.3–4', '10–80', '50–200', 8, 40]], { text: [0, 1, 2] })}
      ${h3('Typical Ra of manufacturing processes (µm)')}${tab(['Process', 'Usual range', 'Achievable'], [['Sand casting', '12.5–25', '6.3–50'], ['Forging', '3.2–12.5', '1.6–25'], ['Turning, boring', '0.8–6.3', '0.4–25'], ['Milling', '0.8–6.3', '0.4–25'], ['Drilling', '1.6–6.3', '0.8–12.5'], ['Reaming', '0.8–3.2', '0.4–6.3'], ['Grinding', '0.2–1.6', '0.025–3.2'], ['Honing', '0.1–0.8', '0.025–1.6'], ['Lapping, superfinishing', '0.025–0.2', '0.012–0.4'], ['Polishing', '0.05–0.4', '0.012–0.8'], ['EDM', '1.6–6.3', '0.8–12.5']], { text: [0, 1, 2] })}
      ${raChart()}
      ${calcBlock('turn', 'Ideal finish in turning')}` },
    { id: 'angle', t: 'Angle, straightness and flatness', f: () => `
      ${eqs([['Sine bar', 'sin θ = H/L;  dθ = dH/(L cos θ)', 'recommended up to 45°'], ['Correction from an indicator', 'Δθ = tan⁻¹(δ/l)', ''], ['Arc units', '1° = 60′ = 3600″;  1 rad = 206 265″;  1″ over 100 mm = 0.4848 µm', ''], ['Autocollimator', 'image displacement x = 2fθ;  rise over base B: h = Bθ', ''], ['Straightness (end-point)', 'E = max(H − H<sub>ref</sub>) − min(H − H<sub>ref</sub>), H<sub>ref</sub> line through ends', 'least-squares and minimum-zone values are smaller'], ['Optical flat', 'one fringe = λ/2;  flatness = (bow/spacing) λ/2', ''], ['Gauge comparison by interference', 'Δh = n(λ/2)(L/l)', '']])}
      ${sineChart()}
      ${calcBlock('sine', 'Sine bar set-up')}
      ${h3('Angle gauges (13-piece set, combined by adding or subtracting)')}${tab(['Degrees', 'Minutes', 'Seconds'], [['1°, 3°, 9°, 27°, 41°', '1′, 3′, 9′, 27′', '6″, 18″, 30″']], { text: [0, 1, 2] })}
      ${h3('Wavelengths for interferometry')}${tab(['Source', 'λ (nm)', 'λ/2 (µm)'], [['Mercury green', 546.1, 0.27305], ['Helium yellow', 587.6, 0.2938], ['Sodium D (mean)', 589.3, 0.29465], ['Krypton-86 orange (former metre standard)', 605.78, 0.30289], ['Helium–neon laser', 632.8, 0.3164], ['Cadmium red', 643.8, 0.3219]])}
      ${h3('Geometrical tolerance symbols (ISO 1101)')}${tab(['Group', 'Characteristic', 'Symbol', 'Datum needed'], [['Form', 'Straightness', '⏤', 'No'], ['Form', 'Flatness', '⏥', 'No'], ['Form', 'Roundness (circularity)', '○', 'No'], ['Form', 'Cylindricity', '⌭', 'No'], ['Profile', 'Profile of a line', '⌒', 'Optional'], ['Profile', 'Profile of a surface', '⌓', 'Optional'], ['Orientation', 'Parallelism', '∥', 'Yes'], ['Orientation', 'Perpendicularity', '⟂', 'Yes'], ['Orientation', 'Angularity', '∠', 'Yes'], ['Location', 'Position', '⌖', 'Yes (usually)'], ['Location', 'Concentricity / coaxiality', '◎', 'Yes'], ['Location', 'Symmetry', '⌯', 'Yes'], ['Run-out', 'Circular run-out', '↗', 'Yes'], ['Run-out', 'Total run-out', '⌰', 'Yes']], { text: [0, 1, 2, 3] })}` },
    { id: 'inst', t: 'Instruments: least counts and use', f: () => `
      ${tab(['Instrument', 'Range', 'Least count', 'Typical maximum error', 'Experiment'], [['Steel rule', '0–300 mm', '0.5 mm', '±0.1 mm', '—'], ['Vernier caliper (50 div in 49 mm)', '0–150/300 mm', '0.02 mm', '±0.02–0.03 mm', '17'], ['Gear tooth vernier', 'module 1–16', '0.02 mm', '±0.02 mm', '17'], ['Outside micrometer', '25 mm per frame', '0.01 mm', '±2–4 µm', '4, 10'], ['Vernier micrometer', '25 mm', '0.001 mm', '±2 µm', '10, 16, 18'], ['Disc (gear tooth) micrometer', '25 mm', '0.01 mm', '±4 µm', '17'], ['Dial indicator', '10 mm', '0.01 mm', '±10 µm', '—'], ['Dial test indicator (lever)', '±0.4 mm', '0.002 mm', '±3 µm', '12'], ['Mechanical comparator', '±50 µm', '1 µm', '±0.5 µm', '11'], ['Electronic comparator (LVDT)', '±10 to ±1000 µm', '0.1 µm', '±0.5 % of range', '4'], ['Height gauge (vernier/digital)', '0–300 mm', '0.02/0.01 mm', '±0.03 mm', '—'], ['Sine bar', '0–45° (60°)', 'set by slip gauges', '±2–5″', '12'], ['Bevel protractor', '0–360°', '5′', '±5′', '—'], ['Autocollimator (visual)', '±10′', '0.5–1″', '±1″', '13'], ['Optical flat', 'Ø 25–100 mm', 'λ/2 per fringe', 'λ/10–λ/20 flat', '15'], ['Stylus profilometer', 'Ra 0.01–100 µm', '0.001 µm', '±2–5 %', '14'], ['Toolmaker’s microscope', '25 × 25 mm, 360°', '0.001 mm, 1′', '±2 µm, ±2′', '18'], ['Floating carriage micrometer', 'up to 200 mm', '0.001 mm', '±1 µm (as comparator)', '16']], { text: [0, 1, 2, 3, 4] })}
      ${h3('Abbe’s principle and good practice')}${eqs([['Abbe error', 'e = h tan θ ≈ hθ', 'offset h between the measuring line and the scale, tilt θ: align the scale with the measured line'], ['Cosine error', 'e = L(1 − cos θ) ≈ Lθ²/2', 'misalignment of the measuring axis'], ['Thermal expansion', 'ΔL = αLΔT', 'measure at 20 °C or correct; steel 11.5 × 10⁻⁶/K'], ['Elastic compression (ball on flat)', 'δ ≈ 0.45(F²/(E²D))<sup>1/3</sup>', 'steel ball, small forces: fractions of a µm']])}` }
  ];

  const calcBlock = (id, title) => calc(id, title, CALCIN[id]);
  function bindCalcs(root) {
    root.querySelectorAll('[data-calc]').forEach(p => {
      const run = () => { const v = {}; p.querySelectorAll('[data-k]').forEach(i => v[i.dataset.k] = i.value); try { p.querySelector('.hbco').innerHTML = CALC[p.dataset.calc](v); } catch (e) { p.querySelector('.hbco').textContent = 'Check the inputs.'; } };
      p.querySelectorAll('[data-k]').forEach(i => i.addEventListener('input', run)); run();
    });
  }


  /* ------------------------------------------------------------------ page */
  let IDX0 = null;
  function index() {
    if (IDX0) return IDX0; IDX0 = [];
    const keep = uid; CH_.forEach(c => { IDX0.push([c.t, c.id]); const tmp = document.createElement('div'); tmp.innerHTML = c.f(); tmp.querySelectorAll('h3,h4,figcaption b,caption,table.hbeqt td:first-child').forEach(h => { const t = h.textContent.trim(); if (t) IDX0.push([t, c.id, t]); }); });
    return IDX0;
  }
  const ORDER = CH_.map(c => c.id);
  EXT.handbook = function (el, sub) {
    const all = sub === 'all';
    const cur = all ? null : (ORDER.includes(sub) ? sub : null);
    document.title = (cur ? CH_.find(c => c.id === cur).t + ' — ' : '') + 'Metrology Handbook';
    const toc = `<nav class="hbtoc no-print" aria-label="Handbook chapters"><a href="#handbook" class="${!cur && !all ? 'on' : ''}">Contents</a>${CH_.map((c, i) => `<a href="#handbook-s-${c.id}" class="${c.id === cur ? 'on' : ''}"><span class="rno">${i + 1}</span>${c.t}</a>`).join('')}<a href="#handbook-s-all" class="${all ? 'on' : ''}">Whole handbook (print)</a></nav>`;
    let body;
    if (all) body = `<div class="hbprinthead"><h1>Metrology Handbook</h1><p>Mechanical Measurements &amp; Metrology Virtual Lab · MITE Moodbidri · ${new Date().getFullYear()}</p></div>` + CH_.map((c, i) => `<section class="hbch"><h2 class="hbh2"><span>${i + 1}</span>${c.t}</h2>${c.f()}</section>`).join('');
    else if (cur) { const i = ORDER.indexOf(cur), c = CH_[i]; body = `<section class="hbch"><p class="eyebrow">Chapter ${i + 1}</p><h2 class="hbh2" style="margin-top:4px">${c.t}</h2>${c.f()}</section>
      <div class="hbpn no-print">${i > 0 ? `<a class="btn quiet" href="#handbook-s-${ORDER[i - 1]}">← ${CH_[i - 1].t}</a>` : '<span></span>'}${i < ORDER.length - 1 ? `<a class="btn quiet" href="#handbook-s-${ORDER[i + 1]}">${CH_[i + 1].t} →</a>` : ''}</div>`; }
    else body = `<p class="muted" style="max-width:78ch;margin-top:8px">A data book for mechanical measurements and metrology: ISO 286 limits and fits, gauge blocks and limit gauges, ITS-90 thermocouple and IEC 60751 Pt100 tables, pressure, force and strain-gauge data, machining-force constants, ISO metric threads, gear measurement tables, surface texture, angle and flatness, and the least counts of common instruments. Every long table has a look-up box that interpolates for you, every chart shows the coordinates under the pointer, and the calculators give fits, slip-gauge stacks, thermocouple and Pt100 conversions, thread, gear and sine-bar settings and combined uncertainty.</p>
      <div class="hbcards">${CH_.map((c, i) => `<a class="hbcard" href="#handbook-s-${c.id}"><span class="eyebrow">Chapter ${i + 1}</span><b>${c.t}</b><span class="muted">${({ units: 'SI, prefixes, VIM terms, static characteristics', unc: 'GUM, distributions, t-table, least squares, calculator', iso286: 'IT grades, deviations, preferred fits, fit calculator', gauge: 'Slip-gauge sets, ISO 3650 grades, stacks, GO/NO-GO design', temp: 'ITS-90 tables K J T E, Pt100, tolerances, converters', pfs: 'Pressure units, gravity, strain gauges, bridges, beams, materials', speed: 'Tachometry, stroboscope, Kienzle constants, Merchant', thread: 'ISO metric coarse, 6g limits, wire method, virtual diameter', gears: 'Chordal, constant chord, span tables, involute function', surface: 'Ra Rq Rz, N grades, ISO 4288 cut-offs, process ranges', angle: 'Sine bar, autocollimator, interferometry, GD&T symbols', inst: 'Least counts, accuracies, Abbe and cosine errors' })[c.id] || ''}</span></a>`).join('')}</div>
      <div class="panel" style="margin-top:18px"><div class="panel-h"><h4>Printing and exams</h4></div><p class="hbsmall">Open <a href="#handbook-s-all">Whole handbook</a> and press <b>Print / save as PDF</b> for a paper or PDF copy. Check with your examiner whether a printed copy is permitted; university examinations usually allow only the data book they name.</p>
      <p class="hbsmall" style="margin-top:8px"><b>Where the numbers come from.</b> Thermocouple tables are computed from the ITS-90 reference functions (NIST Monograph 175), Pt100 from IEC 60751, tolerance grades and fundamental deviations from ISO 286-1/-2, gear and thread values from ISO 21771 and ISO 965-1 geometry. Hand-compiled tables (gauge factors, Kienzle constants, process roughness, instrument data) give typical values from the references in each chapter.</p></div>`;
    el.innerHTML = `<section class="wrap hbwrap" style="padding-block:28px 40px"><div class="hbtop no-print"><div><p class="eyebrow">Reference</p><h1 style="margin-top:6px">Metrology Handbook</h1></div>
      <div class="hbtools"><input type="search" id="hbq" placeholder="Search tables, formulae…" aria-label="Search the handbook"><button class="btn quiet small" type="button" id="hbprint">Print / save as PDF</button></div></div>
      <div id="hbqr" class="hbqr no-print" hidden></div><div class="hblay">${toc}<div class="hbmain">${body}</div></div></section>`;
    const root = el.querySelector('.hbmain');
    root.addEventListener('input', ev => { if (ev.target.dataset && ev.target.dataset.look) doLook(ev.target); });
    bindCharts(root); bindCalcs(root);
    $('#hbprint').onclick = () => { if (!all) { location.hash = '#handbook-s-all'; setTimeout(() => window.print(), 600); } else window.print(); };
    // search over chapter, section and table titles
    const q = $('#hbq'), qr = $('#hbqr');
    q.oninput = () => {
      const s = q.value.trim().toLowerCase(); if (s.length < 2) { qr.hidden = true; return; }
      const IDX = index();
      const hits = IDX.filter(x => s.split(/\s+/).every(w => x[0].toLowerCase().includes(w))).slice(0, 14);
      qr.hidden = false; qr.innerHTML = hits.length ? hits.map(x => `<a href="#handbook-s-${x[1]}" data-t="${esc(x[2] || '')}">${x[0]}<span class="muted"> · ${CH_.find(c => c.id === x[1]).t}</span></a>`).join('') : '<span class="muted">No match</span>';
      qr.querySelectorAll('a').forEach(a => a.onclick = () => { const t = a.dataset.t; q.value = ''; qr.hidden = true; if (t) setTimeout(() => { const h = [...document.querySelectorAll('.hbmain h3,.hbmain h4,.hbmain figcaption b,.hbmain caption,.hbmain table.hbeqt td:first-child')].find(e => e.textContent.trim() === t); if (h) h.scrollIntoView({ block: 'start' }); }, 120); });
    };
  };
  EXT.handbookChapters = CH_.map(c => [c.id, c.t]);
})();
