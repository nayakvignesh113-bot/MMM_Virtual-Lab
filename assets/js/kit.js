/* Shared toolkit for the measurement and metrology experiments:
   - LAB.G   SVG helpers, colour map, thermocouple glyphs, canvas profile views
   - LAB.K   fits, set-up drawing helpers, random problem helpers
   - LAB.M   instrument error model, calibration statistics, readable instrument scales (vernier, micrometer, dial indicator, pressure gauge)
   - LAB.P   reference data: ITS-90 thermocouples, Pt100, ISO 286 limits and fits, gauge-block sets, materials, threads, gears, t-values
   - LAB.SETUP, EXPL, SAFETY, LIB, NUM, NOMEN, VALID: filled by each experiment file */
(function () {
  'use strict';
  const U = LAB.U;
  const G = (LAB.G = {});
  ['SETUP', 'EXPL', 'SAFETY', 'LIB', 'NUM', 'NOMEN', 'VALID'].forEach(k => { LAB[k] = LAB[k] || {}; });

  /* ---------------- SVG helpers ---------------- */
  G.r = (x, y, w, h, cls, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls || ''}" ${extra || ''}/>`;
  G.t = (x, y, s, cls, extra) => `<text x="${x}" y="${y}" class="${cls || ''}" ${extra || ''}>${s}</text>`;
  G.l = (x1, y1, x2, y2, cls, w, extra) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls || 'ln'}" stroke-width="${w || 1.5}" ${extra || ''}/>`;
  G.c = (cx, cy, r, cls, extra) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls || ''}" ${extra || ''}/>`;
  G.p = (d, cls, extra) => `<path d="${d}" class="${cls || ''}" ${extra || ''}/>`;
  G.svg = (vb, inner, label) => `<svg viewBox="${vb}" role="img" aria-label="${label || 'Apparatus schematic'}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  G.set = (svg, id, attr, val) => { const el = svg && svg.querySelector('#' + id); if (el) el.setAttribute(attr, val); return el; };
  G.txt = (svg, id, s) => { const el = svg && svg.querySelector('#' + id); if (el) el.textContent = s; };
  G.show = (svg, id, on) => { const el = svg && svg.querySelector('#' + id); if (el) el.style.display = on ? '' : 'none'; };
  G.fill = (svg, id, col) => { const el = svg && svg.querySelector('#' + id); if (el) el.style.fill = col; };

  /* Thermal colour map: cold blue → pale → hot red. t in 0..1. Readable on light and dark backgrounds. */
  const STOPS = [[0, [43, 76, 155]], [0.25, [62, 155, 196]], [0.5, [236, 226, 178]], [0.75, [232, 131, 58]], [1, [178, 35, 31]]];
  G.cmapRGB = function (t) { t = U.clamp(isFinite(t) ? t : 0, 0, 1); for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) { const a = STOPS[i - 1], b = STOPS[i], u = (t - a[0]) / (b[0] - a[0]); return a[1].map((v, k) => Math.round(v + (b[1][k] - v) * u)); } return STOPS[STOPS.length - 1][1]; };
  G.tcol = (T, lo, hi) => { const c = G.cmapRGB((T - lo) / ((hi - lo) || 1)); return `rgb(${c[0]},${c[1]},${c[2]})`; };
  /* vertical colour bar for an SVG rig */
  G.cbar = (x, y, w, h, lo, hi, unit) => { let s = '<defs><linearGradient id="cbg" x1="0" y1="1" x2="0" y2="0">'; for (let i = 0; i <= 8; i++) s += `<stop offset="${i / 8}" stop-color="${G.tcol(i / 8, 0, 1)}"/>`; s += '</linearGradient></defs>';
    return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#cbg)" stroke="var(--line)"/>` + G.t(x + w + 4, y + 8, `<tspan id="cbhi">${U.f(hi, 0)}</tspan> ${unit || '°C'}`, 'm', 'style="font-size:8px"') + G.t(x + w + 4, y + h, `<tspan id="cblo">${U.f(lo, 0)}</tspan>`, 'm', 'style="font-size:8px"'); };
  /* thermocouple bead with a label; id for the bead fill */
  G.tc = (x, y, label, id, dx, dy) => `<g>${G.c(x, y, 3.6, 'tcb', id ? `id="${id}"` : '')}${label ? G.t(x + (dx == null ? -6 : dx), y + (dy == null ? -7 : dy), label, 'm', 'style="font-size:8px"') : ''}</g>`;
  /* digital indicator box: rows [[label, id, init]] */
  G.disp = (x, y, w, rows, title) => { const hh = 14 + rows.length * 26; let s = `<g transform="translate(${x},${y})">${G.r(0, 0, w, hh, 'disp', 'rx="4"')}`; if (title) s += G.t(8, 12, title, 'm', 'style="fill:var(--panel-ink);font-size:7.5px;letter-spacing:.06em"');
    rows.forEach((r, i) => { const y0 = (title ? 14 : 4) + i * 26; s += G.t(8, y0 + 9, r[0], 'm', 'style="fill:var(--panel-ink);font-size:7.5px"') + G.t(8, y0 + 23, r[2] == null ? '0.0' : r[2], 'big', `id="${r[1]}"`); }); return s + '</g>'; };
  G.heater = (x, y, w, h, id) => { let z = ''; const n = Math.max(3, Math.round(w / 9)); for (let i = 0; i <= n; i++) z += (i ? 'L' : 'M') + (x + 3 + (w - 6) * i / n) + ' ' + (y + (i % 2 ? 3 : h - 3)); return `<g ${id ? `id="${id}"` : ''}>${G.r(x, y, w, h, 'heat', 'rx="2"')}<path d="${z}" class="lnh" fill="none" stroke-width="1.4"/></g>`; };
  G.arrow = (x1, y1, x2, y2, cls, w) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 7; return `<g class="${cls || 'arr'}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w || 2}"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - .45)} ${y2 - L * Math.sin(a - .45)} L${x2 - L * Math.cos(a + .45)} ${y2 - L * Math.sin(a + .45)} Z"/></g>`; };
  /* animated dashes for flowing fluid: call G.flow(svg, f) each frame on paths with class "flow" */
  G.flow = (svg, f, speed) => { if (!svg) return; svg.querySelectorAll('.flow').forEach(el => el.setAttribute('stroke-dashoffset', String(-((f * (speed || 600)) % 24)))); };

  /* ---------------- canvas views for the Live view panel ---------------- */
  function cv(el, key, hgt) { let c = el.querySelector('canvas[data-k="' + key + '"]'); if (!c) { el.innerHTML = ''; c = document.createElement('canvas'); c.dataset.k = key; c.style.width = '100%'; c.style.height = (hgt || 220) + 'px'; c.style.display = 'block'; el.appendChild(c); } return c; }
  G.cv = cv;
  /* Instantaneous profile: series computed by fn(f) → cfg for LAB.plot */
  G.profileView = (el, cfg, hgt) => { const c = cv(el, 'prof', hgt || 220); LAB.plot(c, Object.assign({ frac: 1 }, cfg), { h: hgt || 220 }); };
  /* 2-D false-colour field: opt { nx, ny, T(i,j)->°C or NaN (masked), lo, hi, probes:[{x,y,label,T}] (x,y in 0..1), title, xl, yl, aspect } */
  G.fieldView = function (el, opt) {
    const H = opt.h || 210; const c = cv(el, 'field', H); const W = c.clientWidth || 560; const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pal = LAB.pal(); g.fillStyle = pal.bg || '#fff'; g.fillRect(0, 0, W, H);
    const pad = 10, bw = 14, fw = W - pad * 3 - bw - 40, fh = H - pad * 2 - (opt.xl ? 14 : 0);
    const asp = opt.aspect || 0; let pw = fw, ph = fh; if (asp) { if (fw / fh > asp) pw = fh * asp; else ph = fw / asp; }
    const ox = pad + (fw - pw) / 2, oy = pad + (fh - ph) / 2;
    const nx = opt.nx, ny = opt.ny; const img = g.createImageData ? null : null; void img;
    const cw = pw / nx, ch = ph / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const T = opt.T(i, j); if (!isFinite(T)) continue; g.fillStyle = G.tcol(T, opt.lo, opt.hi); g.fillRect(ox + i * cw, oy + (ny - 1 - j) * ch, cw + 0.6, ch + 0.6); }
    if (opt.outline) { g.strokeStyle = pal.ink; g.lineWidth = 1; opt.outline(g, ox, oy, pw, ph); }
    g.font = `10px ${getComputedStyle(document.body).getPropertyValue('--f-mono') || 'monospace'}`;
    (opt.probes || []).forEach(p => { const x = ox + p.x * pw, y = oy + (1 - p.y) * ph; g.fillStyle = '#ffd34d'; g.strokeStyle = '#16212b'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); g.stroke(); if (p.label != null) { const s = p.label + (p.T != null ? ' ' + U.f(p.T, 1) : ''); const tw = g.measureText(s).width + 6; const lx = U.clamp(x + 5, 0, W - tw - bw - 46), ly = U.clamp(y - (p.below ? -6 : 18), 0, H - 14); g.fillStyle = 'rgba(22,33,43,.82)'; g.fillRect(lx, ly, tw, 13); g.fillStyle = '#e9eef2'; g.textBaseline = 'top'; g.fillText(s, lx + 3, ly + 1.5); } });
    // colour bar
    const bx = W - pad - bw - 34, by = pad, bh = H - pad * 2 - (opt.xl ? 14 : 0);
    for (let k = 0; k < bh; k++) { g.fillStyle = G.tcol(1 - k / bh, 0, 1); g.fillRect(bx, by + k, bw, 1.2); }
    g.strokeStyle = pal.line; g.strokeRect(bx, by, bw, bh); g.fillStyle = pal.ink; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(U.f(opt.hi, 0), bx + bw + 4, by + 5); g.fillText(U.f((opt.hi + opt.lo) / 2, 0), bx + bw + 4, by + bh / 2); g.fillText(U.f(opt.lo, 0), bx + bw + 4, by + bh - 5); g.fillText(opt.unit || '°C', bx - 2, by + bh + 9);
    if (opt.xl) { g.fillStyle = pal.muted; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(opt.xl, ox + pw / 2, H - 3); }
  };

  /* ---------------- K: logging, steady state, fitting ---------------- */
  const K = (LAB.K = {});
  /* Thermocouple settling: T(t) = T0 + (Tss - T0)·[1 − a·e^(−t/τ) − (1 − a)·e^(−t/τ2)]. Returns the value at t. */
  K.settle = (T0, Tss, t, tau, a, tau2) => { a = a == null ? 0.85 : a; tau2 = tau2 || tau / 4; return T0 + (Tss - T0) * (1 - a * Math.exp(-t / tau) - (1 - a) * Math.exp(-t / tau2)); };
  /* Build a logged table: chans [{name, T0, Tss, tau, a, sd}] logged every dt minutes until steady + extra.
     Returns { times (min), vals[ch][k] (rounded to res), ssIdx, ssTime, rows, series(t-fine) } */
  K.log = function (chans, opt, r) {
    const dt = opt.dt, res = opt.res || 0.1, thr = opt.thr || 0.2, extra = opt.extra || 2, maxN = opt.maxN || 30;
    const times = [], vals = chans.map(() => []); let ss = -1, k = 0;
    const off = chans.map(c => (c.sd == null ? 0.15 : c.sd) * U.gauss(r)); // fixed TC offset (calibration error)
    while (k < maxN) {
      const t = k * dt; times.push(t);
      chans.forEach((c, i) => { const v = K.settle(c.T0, c.Tss, t * 60, c.tau, c.a, c.tau2) + (t > 0 ? off[i] * Math.min(1, t / (dt * 2)) : 0) + (c.noise == null ? 0.04 : c.noise) * U.gauss(r); vals[i].push(U.q(v, res)); });
      if (ss < 0 && k >= 1 && chans.every((c, i) => Math.abs(vals[i][k] - vals[i][k - 1]) <= thr + 1e-9)) ss = k;
      if (ss >= 0 && k >= ss + extra) break; k++;
    }
    if (ss < 0) ss = times.length - 1;
    return { times, vals, ssIdx: ss, ssTime: times[ss], last: times.length - 1 };
  };
  /* fine time series for the live chart */
  K.curves = (chans, tEndMin, n) => { const t = U.lin(0, tEndMin, n || 120); return { t, y: chans.map(c => t.map(x => K.settle(c.T0, c.Tss, x * 60, c.tau, c.a, c.tau2))) }; };
  /* options for the steady-state select calc: list of logged times */
  K.ssOptions = L => L.times.slice(1).map(t => t + ' min');
  K.ssCalc = (L, dtxt) => ({ key: 'tss', label: `Steady state first reached at (every channel changed by ≤ ${dtxt || '0.2 °C'} since the previous reading)`, type: 'select', options: K.ssOptions(L), truth: L.times[L.ssIdx] + ' min' });
  K.fit = U.linfit;
  K.lmtd = (d1, d2) => Math.abs(d1 - d2) < 1e-9 ? d1 : (d1 - d2) / Math.log(d1 / d2);
  K.SB = 5.670374e-8;
  K.K = c => c + 273.15;
  /* standard uncertainty of a thermocouple reading: type-K special limits ±1.1 °C as a rectangular bound plus indicator resolution */
  K.uTC = (res) => Math.hypot(1.1 / Math.sqrt(3), (res || 0.1) / Math.sqrt(12));

  /* ---------------- set-up drawing helpers (SVG strings) ---------------- */
  K.tag = (x, y, t, ax, ay) => { const w = Math.max(30, String(t).length * 6.4 + 14); return `<g class="su-tag">${ax != null ? `<line x1="${ax}" y1="${ay}" x2="${x + 6}" y2="${y + 10}" stroke="var(--straw)" stroke-width="1.6"/><circle cx="${ax}" cy="${ay}" r="2.6" fill="var(--straw)"/>` : ''}<rect x="${x}" y="${y}" width="${w}" height="20" rx="4"/><text x="${x + 7}" y="${y + 14}">${t}</text></g>`; };
  K.tick = (x, y) => `<path d="M${x} ${y} l5 6 l10 -12" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  K.blink = u => (u > 0.85 || Math.floor(u * 8) % 2 === 0);
  K.dimH = (x0, x1, y, t) => `<g><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x0}" y1="${y - 6}" x2="${x0}" y2="${y + 6}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}" stroke="var(--accent)" stroke-width="1.5"/>${t ? `<text x="${(x0 + x1) / 2 - t.length * 3.2}" y="${y - 6}" class="ink" style="font-size:10px">${t}</text>` : ''}</g>`;
  K.dimV = (x, y0, y1, t) => `<g><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x - 6}" y1="${y0}" x2="${x + 6}" y2="${y0}" stroke="var(--accent)" stroke-width="1.5"/><line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}" stroke="var(--accent)" stroke-width="1.5"/>${t ? `<text x="${x + 8}" y="${(y0 + y1) / 2 + 4}" class="ink" style="font-size:10px">${t}</text>` : ''}</g>`;
  /* hand-held calibrated thermometer / probe moving to a point */
  K.probe = (x, y, u) => { const yy = y - 40 * (1 - u); return `<g><rect x="${x - 3}" y="${yy - 56}" width="6" height="50" rx="2" class="steelD"/><rect x="${x - 9}" y="${yy - 78}" width="18" height="24" rx="3" class="acc"/></g>`; };
  /* multimeter / clamp reading */
  K.meter = (x, y, txt) => `<g><rect x="${x}" y="${y}" width="74" height="40" rx="5" class="disp"/><text x="${x + 8}" y="${y + 26}" style="fill:var(--straw);font:600 13px var(--f-mono)">${txt}</text></g>`;
  /* measuring jar filling + stopwatch: u 0..1 */
  K.jar = (x, y, u, txt) => `<g><rect x="${x}" y="${y}" width="34" height="62" rx="2" fill="none" stroke="var(--ink)" stroke-width="1.4"/><rect x="${x + 1}" y="${y + 61 - 58 * u}" width="32" height="${58 * u}" class="fluid" opacity=".7"/>${[1, 2, 3, 4, 5].map(i => `<line x1="${x}" y1="${y + 62 - i * 11}" x2="${x + 8}" y2="${y + 62 - i * 11}" class="ln" stroke-width="1"/>`).join('')}<circle cx="${x + 64}" cy="${y + 24}" r="16" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.4"/><line x1="${x + 64}" y1="${y + 24}" x2="${x + 64 + 11 * Math.sin(u * 6.28)}" y2="${y + 24 - 11 * Math.cos(u * 6.28)}" class="ln" stroke-width="1.6"/>${txt ? `<text x="${x + 44}" y="${y + 56}" class="ink" style="font:500 10px var(--f-mono)">${txt}</text>` : ''}</g>`;
  K.knob = (x, y, u, lab) => `<g><circle cx="${x}" cy="${y}" r="13" class="mach"/><line x1="${x}" y1="${y}" x2="${x + 10 * Math.cos(Math.PI * (0.75 + 1.5 * u))}" y2="${y + 10 * Math.sin(Math.PI * (0.75 + 1.5 * u))}" stroke="var(--straw)" stroke-width="3" stroke-linecap="round"/>${lab ? `<text x="${x - 20}" y="${y + 26}" class="ink" style="font:500 9px var(--f-mono)">${lab}</text>` : ''}</g>`;
  K.sv = (sim, key) => { const r = (sim.specimen || []).find(x => String(x[0]).includes(key)); return r ? r[1] + (r[2] ? ' ' + r[2] : '') : ''; };

  /* ---------------- numerical-problem helpers ---------------- */
  K.R = (r, a, b, d = 0) => +(a + (b - a) * r()).toFixed(d);
  K.P = (r, a) => a[Math.floor(r() * a.length)];
  const sup = t => t.replace(/[-0-9]/g, c => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
  K.s = (x, n = 4) => { if (!isFinite(x)) return String(x); const a = Math.abs(x); return a !== 0 && (a >= 1e5 || a < 1e-3) ? x.toExponential(n - 1).replace(/e([+-])(\d+)/, (m, sg, e) => ' × 10' + sup((sg === '-' ? '-' : '') + e)) : String(+x.toPrecision(n)); };

  /* ================================================================ M: instruments and calibration */
  const M = (LAB.M = {});
  /* Instrument error model. o = { fs: full scale, zero: sd of zero error (units), gain: sd of span error (fraction),
     nl: non-linearity amplitude (fraction of FS, sign random), hyst: hysteresis band (fraction of FS), noise: sd (units), res: resolution }.
     Returns { read(x, dir), z, g, n, h, res, fs } — dir = +1 loading / increasing, −1 unloading / decreasing. */
  M.inst = function (r, o) {
    const fs = o.fs, z = (o.zero || 0) * U.gauss(r), g = (o.gain || 0) * U.gauss(r), n = (o.nl || 0) * (0.6 + 0.4 * r()) * (r() < 0.5 ? -1 : 1), h = (o.hyst || 0) * (0.7 + 0.3 * r());
    const res = o.res || 0, noise = o.noise || 0;
    const ideal = (x, dir) => x + z + g * x + n * fs * 4 * (x / fs) * (1 - x / fs) + (dir || 0) * -0.5 * h * fs * Math.sin(Math.PI * U.clamp(x / fs, 0, 1));
    return { fs, z, g, n, h, res, noise, ideal, read(x, dir) { const v = ideal(x, dir) + noise * U.gauss(r); return res ? U.q(v, res) : v; } };
  };
  /* Calibration statistics. xs: true input; up, dn (optional): readings loading / unloading; fs: full scale of the output.
     Best-fit straight line through the mean readings; linearity = max |mean − fit| / FS; hysteresis = max |up − dn| / FS. */
  M.calStats = function (xs, up, dn, fs) {
    const mean = up.map((v, i) => dn ? (v + dn[i]) / 2 : v);
    const fit = U.linfit(xs, mean); const dev = mean.map((v, i) => v - (fit.c + fit.m * xs[i]));
    const err = mean.map((v, i) => v - xs[i]);
    const iL = dev.reduce((b, v, i) => Math.abs(v) > Math.abs(dev[b]) ? i : b, 0);
    const hy = dn ? up.map((v, i) => Math.abs(v - dn[i])) : xs.map(() => 0); const iH = hy.reduce((b, v, i) => v > hy[b] ? i : b, 0);
    const iE = err.reduce((b, v, i) => Math.abs(v) > Math.abs(err[b]) ? i : b, 0);
    return { mean, fit, sens: fit.m, off: fit.c, dev, linAbs: Math.abs(dev[iL]), linFS: Math.abs(dev[iL]) / fs * 100, iL, hyst: hy, hysAbs: hy[iH], hysFS: hy[iH] / fs * 100, iH, err, maxErr: err[iE], iE, accFS: Math.abs(err[iE]) / fs * 100 };
  };
  /* GUM helpers */
  M.uRect = a => a / Math.sqrt(3);          // half-width a of a rectangular distribution
  M.uRes = res => res / Math.sqrt(12);       // resolution of a digital or analogue reading
  M.uA = (arr) => U.sd(arr) / Math.sqrt(arr.length); // type A, standard uncertainty of the mean
  M.rss = (...a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  M.T95 = [[1, 12.71], [2, 4.30], [3, 3.18], [4, 2.78], [5, 2.57], [6, 2.45], [7, 2.36], [8, 2.31], [9, 2.26], [10, 2.23], [12, 2.18], [15, 2.13], [20, 2.09], [25, 2.06], [30, 2.04], [50, 2.01], [100, 1.98], [1e9, 1.96]];
  M.t95 = df => U.interp(M.T95.map(r => r[0]), M.T95.map(r => r[1]), df);
  /* format a reading with its resolution */
  M.fr = (v, res) => U.f(v, Math.max(0, Math.round(-Math.log10(res) + 0.3)));

  /* ---------------- readable instrument scales (stand-alone SVG strings) ----------------
     These are drawn faithfully so that the student can take the reading: line positions follow the real scale geometry. */
  const S_ = (w, h, inner, lab, extra) => `<svg viewBox="0 0 ${w} ${h}" ${extra && extra.width ? `width="${extra.width}" height="${h}"` : ''} class="scale" role="img" aria-label="${lab}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  /* Outside micrometer, 0–25 mm (or with base offset), least count 0.01 mm: sleeve with mm and half-mm lines, thimble with 50 divisions.
     x = actual reading in mm (may be slightly negative for a zero error). base = range start (0, 25, 50 …). */
  M.micrometerSVG = function (x, opt) {
    opt = opt || {}; const base = opt.base || 0, vn = !!opt.vernier, W = 520, H = vn ? 380 : 236, dy = vn ? 190 : 116, ppm = 34; // px per mm on the sleeve
    const edge = 330; // x position of the thimble edge on screen
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#f4f1ea"/>`;
    // sleeve
    s += `<rect x="0" y="${dy - (vn ? 168 : 34)}" width="${edge + 4}" height="${vn ? 202 : 68}" fill="#d8dde2" stroke="#7b8691"/><line x1="0" y1="${dy}" x2="${edge}" y2="${dy}" stroke="#1b232b" stroke-width="1.4"/>`;
    const lo = Math.floor(x - edge / ppm) - 1;
    for (let k = lo * 2; k <= Math.ceil(x * 2); k++) { const mm = k / 2; const X = edge - (x - mm) * ppm; if (X < 2 || X > edge) continue; if (mm < -0.001) continue;
      if (k % 2 === 0) { s += `<line x1="${X.toFixed(2)}" y1="${dy}" x2="${X.toFixed(2)}" y2="${dy - (mm % 5 === 0 ? 20 : 13)}" stroke="#1b232b" stroke-width="1.3"/>`; if (mm % 5 === 0) s += `<text x="${(X - 4).toFixed(1)}" y="${dy - 24}" font-size="13" font-family="IBM Plex Mono,monospace" fill="#1b232b">${mm + base}</text>`; }
      else s += `<line x1="${X.toFixed(2)}" y1="${dy}" x2="${X.toFixed(2)}" y2="${dy + 11}" stroke="#1b232b" stroke-width="1.2"/>`; }
    // thimble: a cylinder seen side-on; division j is at angle (j − f)·2π/50 from the datum
    const R = vn ? 170 : 96, f = ((x % 0.5) + 0.5) % 0.5 / 0.01; // thimble reading 0..50
    if (vn) { // vernier on the sleeve: 10 lines in 9 thimble divisions, read the line that coincides with a thimble line (0.001 mm)
      for (let v = 0; v <= 10; v++) { const Y = dy - R * Math.sin(v * 0.9 * 2 * Math.PI / 50); s += `<line x1="${edge - 26}" y1="${Y.toFixed(2)}" x2="${edge}" y2="${Y.toFixed(2)}" stroke="#1b232b" stroke-width="1"/>`; if (v % 2 === 0 && v) s += `<text x="${edge - 46}" y="${(Y + 4).toFixed(1)}" font-size="12" font-family="IBM Plex Mono,monospace" fill="#1b232b">${v}</text>`; } }
    s += `<defs><linearGradient id="thg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa5ae"/><stop offset=".5" stop-color="#e9edf0"/><stop offset="1" stop-color="#8d98a2"/></linearGradient></defs>`;
    s += `<path d="M${edge} ${dy - R} L${edge + 20} ${dy - R - 4} L${W - 12} ${dy - R - 4} L${W - 12} ${dy + R + 4} L${edge + 20} ${dy + R + 4} L${edge} ${dy + R} Z" fill="url(#thg)" stroke="#5f6a74"/>`;
    for (let j = Math.floor(f) - (vn ? 16 : 14); j <= Math.ceil(f) + (vn ? 16 : 14); j++) { const th = (j - f) * 2 * Math.PI / 50; if (Math.cos(th) < 0.08) continue; const Y = dy - R * Math.sin(th); const jj = ((j % 50) + 50) % 50; const L = jj % 5 === 0 ? (vn ? 26 : 20) : (vn ? 16 : 12);
      s += `<line x1="${edge}" y1="${Y.toFixed(2)}" x2="${edge + L}" y2="${Y.toFixed(2)}" stroke="#1b232b" stroke-width="1.15"/>`; if (jj % 5 === 0) s += `<text x="${edge + 24}" y="${(Y + 4.5).toFixed(1)}" font-size="${(14 * (0.55 + 0.45 * Math.cos(th))).toFixed(1)}" font-family="IBM Plex Mono,monospace" fill="#1b232b">${jj}</text>`; }
    s += `<text x="8" y="${H - 8}" font-size="11" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.label || 'Outside micrometer, ' + base + '–' + (base + 25) + ' mm, least count ' + (vn ? '0.001 mm (sleeve vernier)' : '0.01 mm')}</text>`;
    return S_(W, H, s, opt.aria || 'Micrometer sleeve and thimble scale');
  };
  /* Vernier scale (caliper or gear tooth vernier), least count 0.02 mm: 50 vernier divisions in 49 mm. Drawn at ppm px/mm so that the
     coincidence is visible at full size; the SVG is wide and sits in a horizontally scrollable box. x = reading in mm. */
  M.vernierSVG = function (x, opt) {
    opt = opt || {}; const ppm = opt.ppm || 60, n = 50, span = 49, lo = Math.max(0, Math.floor(x) - 4), hi = Math.ceil(x + span) + 3;
    const W = (hi - lo) * ppm + 40, H = 150, y0 = 70, X = mm => 20 + (mm - lo) * ppm;
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#f4f1ea"/><rect x="0" y="12" width="${W}" height="${y0 - 12}" fill="#dfe3e7"/><rect x="${X(x) - 6}" y="${y0}" width="${span * ppm + 30}" height="58" fill="#c9d0d6" stroke="#7b8691"/>`;
    for (let mm = lo; mm <= hi; mm++) { const L = mm % 10 === 0 ? 30 : mm % 5 === 0 ? 22 : 15; s += `<line x1="${X(mm)}" y1="${y0}" x2="${X(mm)}" y2="${y0 - L}" stroke="#1b232b" stroke-width="1"/>`; if (mm % 10 === 0) s += `<text x="${X(mm) - 4}" y="${y0 - 34}" font-size="14" font-family="IBM Plex Mono,monospace" fill="#1b232b">${mm / 10}</text>`; }
    for (let j = 0; j <= n; j++) { const xx = X(x + j * span / n); const L = j % 5 === 0 ? 24 : 14; s += `<line x1="${xx.toFixed(2)}" y1="${y0}" x2="${xx.toFixed(2)}" y2="${y0 + L}" stroke="#1b232b" stroke-width="1"/>`; if (j % 5 === 0) s += `<text x="${(xx - 4).toFixed(1)}" y="${y0 + 40}" font-size="13" font-family="IBM Plex Mono,monospace" fill="#1b232b">${j / 5}</text>`; }
    s += `<text x="${X(x) + 4}" y="${H - 6}" font-size="11" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.label || 'main scale in cm (1 mm divisions) · vernier 50 div = 49 mm · least count 0.02 mm'}</text>`;
    return { svg: S_(W, H, s, opt.aria || 'Vernier scale', { width: W }), zeroPx: X(x) };
  };
  /* Dial indicator, 0.01 mm per division, 100 divisions per revolution (1 mm), revolution counter. x in mm (≥ 0). */
  M.dialSVG = function (x, opt) {
    opt = opt || {}; const W = 240, H = 250, cx = 120, cy = 130, R = 100; const rev = Math.floor(x + 1e-9), fr = x - rev;
    let s = `<rect width="${W}" height="${H}" fill="#f4f1ea"/><rect x="${cx - 9}" y="0" width="18" height="${cy - R - 2}" fill="#9aa5ae"/><circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="#9aa5ae"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fbfaf6" stroke="#5f6a74"/>`;
    for (let j = 0; j < 100; j++) { const a = j / 100 * 2 * Math.PI, L = j % 10 === 0 ? 14 : j % 5 === 0 ? 10 : 6; const sx = cx + Math.sin(a) * R, sy = cy - Math.cos(a) * R, ex = cx + Math.sin(a) * (R - L), ey = cy - Math.cos(a) * (R - L); s += `<line x1="${sx.toFixed(2)}" y1="${sy.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="#1b232b" stroke-width="${j % 10 === 0 ? 1.6 : 1}"/>`; if (j % 10 === 0) s += `<text x="${(cx + Math.sin(a) * (R - 26) - 7).toFixed(1)}" y="${(cy - Math.cos(a) * (R - 26) + 5).toFixed(1)}" font-size="12" font-family="IBM Plex Mono,monospace" fill="#1b232b">${j}</text>`; }
    // revolution counter (1 mm per division, 0–10)
    const rc = 26, rx = cx, ry = cy + 40; s += `<circle cx="${rx}" cy="${ry}" r="${rc}" fill="#fff" stroke="#5f6a74"/>`;
    for (let j = 0; j < 10; j++) { const a = j / 10 * 2 * Math.PI; s += `<line x1="${rx + Math.sin(a) * rc}" y1="${ry - Math.cos(a) * rc}" x2="${rx + Math.sin(a) * (rc - 6)}" y2="${ry - Math.cos(a) * (rc - 6)}" stroke="#1b232b"/>`; s += `<text x="${(rx + Math.sin(a) * (rc - 13) - 3).toFixed(1)}" y="${(ry - Math.cos(a) * (rc - 13) + 3).toFixed(1)}" font-size="8" font-family="IBM Plex Mono,monospace" fill="#1b232b">${j}</text>`; }
    const ar = (x / 10) * 2 * Math.PI; s += `<line x1="${rx}" y1="${ry}" x2="${rx + Math.sin(ar) * (rc - 4)}" y2="${ry - Math.cos(ar) * (rc - 4)}" stroke="#b23b2a" stroke-width="2"/>`;
    const a = fr * 2 * Math.PI; s += `<line x1="${cx - Math.sin(a) * 18}" y1="${cy + Math.cos(a) * 18}" x2="${cx + Math.sin(a) * (R - 8)}" y2="${cy - Math.cos(a) * (R - 8)}" stroke="#1b232b" stroke-width="2.4"/><circle cx="${cx}" cy="${cy}" r="5" fill="#1b232b"/>`;
    s += `<text x="6" y="${H - 6}" font-size="10" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.label || '0.01 mm/div · 1 mm/rev'}</text>`;
    return S_(W, H, s, opt.aria || 'Dial indicator');
  };
  /* Mechanical comparator dial: sector scale ±range µm with 1 µm divisions (range 50 → ±50 µm). v = deviation in µm. */
  M.compSVG = function (v, opt) {
    opt = opt || {}; const rg = opt.range || 50, W = 300, H = 200, cx = 150, cy = 182, R = 150, sw = 50 * Math.PI / 180; // ±50° sweep
    const ang = d => U.clamp(d, -rg * 1.04, rg * 1.04) / rg * sw;
    let s = `<rect width="${W}" height="${H}" fill="#f4f1ea"/><path d="M${cx - Math.sin(sw * 1.1) * (R + 6)} ${cy - Math.cos(sw * 1.1) * (R + 6)} A ${R + 6} ${R + 6} 0 0 1 ${cx + Math.sin(sw * 1.1) * (R + 6)} ${cy - Math.cos(sw * 1.1) * (R + 6)} L ${cx} ${cy} Z" fill="#fbfaf6" stroke="#5f6a74"/>`;
    for (let d = -rg; d <= rg; d++) { const a = ang(d), L = d % 10 === 0 ? 18 : d % 5 === 0 ? 12 : 7; s += `<line x1="${(cx + Math.sin(a) * R).toFixed(2)}" y1="${(cy - Math.cos(a) * R).toFixed(2)}" x2="${(cx + Math.sin(a) * (R - L)).toFixed(2)}" y2="${(cy - Math.cos(a) * (R - L)).toFixed(2)}" stroke="#1b232b" stroke-width="${d % 10 === 0 ? 1.5 : .9}"/>`; if (d % 10 === 0) s += `<text x="${(cx + Math.sin(a) * (R - 32) - (d < 0 ? 10 : d ? 7 : 3)).toFixed(1)}" y="${(cy - Math.cos(a) * (R - 32) + 4).toFixed(1)}" font-size="12" font-family="IBM Plex Mono,monospace" fill="#1b232b">${d > 0 ? '+' + d : d}</text>`; }
    const a = ang(v); s += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.sin(a) * (R - 3)).toFixed(2)}" y2="${(cy - Math.cos(a) * (R - 3)).toFixed(2)}" stroke="#b23b2a" stroke-width="1.8"/><circle cx="${cx}" cy="${cy}" r="7" fill="#1b232b"/>`;
    s += `<text x="8" y="16" font-size="10" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.label || '1 µm/div · ±' + rg + ' µm'}</text>`;
    return S_(W, H, s, opt.aria || 'Comparator dial');
  };
  /* Autocollimator eyepiece: graticule scale in seconds of arc (2″ divisions, ±60″) and the reflected cross-line image at θ″. */
  M.acSVG = function (th, opt) {
    opt = opt || {}; const W = 260, H = 260, c = 130, R = 118, ppx = 1.8; // px per second
    let s = `<rect width="${W}" height="${H}" fill="#f4f1ea"/><circle cx="${c}" cy="${c}" r="${R}" fill="#0f1a12"/>`;
    for (let k = -60; k <= 60; k += 2) { const x = c + k * ppx, L = k % 10 === 0 ? 16 : 8; s += `<line x1="${x}" y1="${c + 30}" x2="${x}" y2="${c + 30 - L}" stroke="#9fdca6" stroke-width="${k % 10 === 0 ? 1.4 : .8}"/>`; if (k % 20 === 0) s += `<text x="${x - (k < 0 ? 10 : k ? 7 : 3)}" y="${c + 46}" font-size="11" font-family="IBM Plex Mono,monospace" fill="#9fdca6">${k}</text>`; }
    s += `<line x1="${c - R}" y1="${c + 30}" x2="${c + R}" y2="${c + 30}" stroke="#9fdca6" stroke-width=".8"/>`;
    const x = c + U.clamp(th, -64, 64) * ppx; s += `<line x1="${x}" y1="${c - 80}" x2="${x}" y2="${c + 34}" stroke="#ffe27a" stroke-width="1.6"/><line x1="${c - 70}" y1="${c - 20}" x2="${c + 70}" y2="${c - 20}" stroke="#ffe27a" stroke-width="1.6" opacity=".7"/>`;
    s += `<text x="8" y="${H - 6}" font-size="10" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.label || 'graticule in seconds of arc, 2″/div'}</text>`;
    return S_(W, H, s, opt.aria || 'Autocollimator eyepiece view');
  };
  /* Bourdon pressure gauge, 270° dial: fs (bar), major every maj, minor every min. */
  M.gaugeSVG = function (v, opt) {
    opt = opt || {}; const fs = opt.fs || 10, maj = opt.maj || 1, mn = opt.min || 0.2, W = 240, H = 230, cx = 120, cy = 120, R = 96;
    const ang = p => (-135 + 270 * U.clamp(p, -0.03 * fs, 1.03 * fs) / fs) * Math.PI / 180;
    let s = `<rect width="${W}" height="${H}" fill="#f4f1ea"/><circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="#2f3a44"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fbfaf6"/>`;
    for (let k = 0; k <= Math.round(fs / mn); k++) { const p = k * mn, a = ang(p), major = Math.abs(p / maj - Math.round(p / maj)) < 1e-6, L = major ? 14 : 7; s += `<line x1="${cx + Math.sin(a) * R}" y1="${cy - Math.cos(a) * R}" x2="${cx + Math.sin(a) * (R - L)}" y2="${cy - Math.cos(a) * (R - L)}" stroke="#1b232b" stroke-width="${major ? 1.8 : 1}"/>`; if (major) s += `<text x="${(cx + Math.sin(a) * (R - 26) - 6).toFixed(1)}" y="${(cy - Math.cos(a) * (R - 26) + 5).toFixed(1)}" font-size="13" font-family="IBM Plex Mono,monospace" fill="#1b232b">${+p.toFixed(2)}</text>`; }
    const a = ang(v); s += `<text x="${cx - 14}" y="${cy + 46}" font-size="12" font-family="IBM Plex Mono,monospace" fill="#55606b">${opt.unit || 'bar'}</text><line x1="${cx - Math.sin(a) * 16}" y1="${cy + Math.cos(a) * 16}" x2="${cx + Math.sin(a) * (R - 6)}" y2="${cy - Math.cos(a) * (R - 6)}" stroke="#b23b2a" stroke-width="2.6"/><circle cx="${cx}" cy="${cy}" r="6" fill="#1b232b"/>`;
    return S_(W, H, s, opt.aria || 'Pressure gauge dial');
  };
  /* Rig glyph versions (inside an experiment SVG): small dial with id'd pointer for animation. */
  M.dialG = (x, y, r, id, lab) => { let s = `<g><circle cx="${x}" cy="${y}" r="${r + 4}" class="mach"/><circle cx="${x}" cy="${y}" r="${r}" class="surf"/>`; for (let j = 0; j < 20; j++) { const a = j / 20 * 2 * Math.PI; s += `<line x1="${x + Math.sin(a) * r}" y1="${y - Math.cos(a) * r}" x2="${x + Math.sin(a) * (r - (j % 2 ? 3 : 6))}" y2="${y - Math.cos(a) * (r - (j % 2 ? 3 : 6))}" class="ln" stroke-width="1"/>`; } s += `<line id="${id}" x1="${x}" y1="${y}" x2="${x}" y2="${y - r + 4}" stroke="var(--bad)" stroke-width="2.2" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="2.6" class="ink"/>${lab ? `<text x="${x - r}" y="${y + r + 16}" class="m">${lab}</text>` : ''}</g>`; return s; };
  M.needle = (svg, id, cx, cy, r, frac, sweep) => { sweep = sweep || 360; const a = (sweep === 270 ? -135 : 0) * Math.PI / 180 + frac * sweep * Math.PI / 180; G.set(svg, id, 'x2', cx + Math.sin(a) * (r - 4)); G.set(svg, id, 'y2', cy - Math.cos(a) * (r - 4)); };
  /* scale-reading panel for the Experiment stage: items [{svg, cap}] */
  M.readPanel = (title, intro, items) => `<div class="panel"><div class="panel-h"><h4>${title}</h4><span class="eyebrow">read the instrument</span></div>${intro ? `<p class="muted" style="font-size:.86rem;margin-bottom:8px">${intro}</p>` : ''}<div class="scalegrid">${items.map(it => `<figure class="scalefig ${it.wide ? 'wide' : ''}"><div class="scalebox ${it.vern ? 'vern' : ''}" ${it.scroll != null ? `data-scroll="${Math.round(it.scroll)}"` : ''}>${it.svg}</div>${it.vern ? '<div class="scalehint">Scroll sideways along the scale to find the vernier line that coincides with a main-scale line.</div>' : ''}<figcaption>${it.cap}</figcaption></figure>`).join('')}</div></div>`;
  /* after inserting a read panel: scroll vernier boxes so the vernier zero is in view */
  M.initScales = el => { el.querySelectorAll('.scalebox[data-scroll]').forEach(b => { b.scrollLeft = Math.max(0, +b.dataset.scroll - 60); }); };

  /* ================================================================ P: reference data */
  const P = (LAB.P = {});
  /* ITS-90 thermocouple reference functions (NIST Monograph 175): E in mV, t in °C, reference junction at 0 °C */
  const TCC = {
    K: { lo: -270, hi: 1372, neg: [0, 0.394501280250e-1, 0.236223735980e-4, -0.328589067840e-6, -0.499048287770e-8, -0.675090591730e-10, -0.574103274280e-12, -0.310888728940e-14, -0.104516093650e-16, -0.198892668780e-19, -0.163226974860e-22],
      pos: [-0.176004136860e-1, 0.389212049750e-1, 0.185587700320e-4, -0.994575928740e-7, 0.318409457190e-9, -0.560728448890e-12, 0.560750590590e-15, -0.320207200030e-18, 0.971511471520e-22, -0.121047212750e-25], exp: [0.118597600000, -0.118343200000e-3, 126.9686], name: 'Type K (chromel–alumel)' },
    J: { lo: -210, hi: 760, neg: null, pos: [0, 0.503811878150e-1, 0.304758369300e-4, -0.856810657200e-7, 0.132281952950e-9, -0.170529583370e-12, 0.209480906970e-15, -0.125383953360e-18, 0.156317256970e-22], name: 'Type J (iron–constantan)' },
    T: { lo: 0, hi: 400, neg: null, pos: [0, 0.387481063640e-1, 0.332922278800e-4, 0.206182434040e-6, -0.218822568460e-8, 0.109968809280e-10, -0.308157587720e-13, 0.454791352900e-16, -0.275129016730e-19], name: 'Type T (copper–constantan)' },
    E: { lo: 0, hi: 1000, neg: null, pos: [0, 0.586655087100e-1, 0.450322755820e-4, 0.289084072120e-7, -0.330568966520e-9, 0.650244032700e-12, -0.191974955040e-15, -0.125366004970e-17, 0.214892175690e-20, -0.143880417820e-23, 0.359608994810e-27], name: 'Type E (chromel–constantan)' }
  };
  P.TC = TCC;
  P.tcE = (type, t) => { const c = TCC[type]; const co = t < 0 && c.neg ? c.neg : c.pos; let E = 0; for (let i = co.length - 1; i >= 0; i--) E = E * t + co[i]; if (c.exp && t >= 0) E += c.exp[0] * Math.exp(c.exp[1] * (t - c.exp[2]) ** 2); return E; };
  P.tcT = (type, E) => U.bisect(t => P.tcE(type, t) - E, TCC[type].lo < 0 ? -200 : 0, TCC[type].hi, 70);
  P.tcS = (type, t) => (P.tcE(type, t + 0.5) - P.tcE(type, t - 0.5)) * 1000; // Seebeck coefficient µV/°C
  /* IEC 60751 Pt100 (Callendar–Van Dusen) */
  P.PT = { R0: 100, A: 3.9083e-3, B: -5.775e-7, C: -4.183e-12 };
  P.ptR = (t, R0) => { const p = P.PT, r0 = R0 || p.R0; return r0 * (1 + p.A * t + p.B * t * t + (t < 0 ? p.C * (t - 100) * t ** 3 : 0)); };
  P.ptT = (R, R0) => U.bisect(t => P.ptR(t, R0) - R, -200, 850, 70);
  /* IEC 60751 tolerance classes (°C) */
  P.ptTol = { AA: t => 0.1 + 0.0017 * Math.abs(t), A: t => 0.15 + 0.002 * Math.abs(t), B: t => 0.3 + 0.005 * Math.abs(t), C: t => 0.6 + 0.01 * Math.abs(t) };
  /* IEC 60584-1 thermocouple tolerance class 1 and 2, type K/J/E (°C) */
  P.tcTol = { 1: t => Math.max(1.5, 0.004 * Math.abs(t)), 2: t => Math.max(2.5, 0.0075 * Math.abs(t)) };

  /* ISO 286-1: standard tolerance grades IT1–IT16 (µm) for size steps up to 500 mm */
  P.STEPS = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];
  P.IT = {
    1: [0.8, 1, 1, 1.2, 1.5, 1.5, 2, 2.5, 3.5, 4.5, 6, 7, 8], 2: [1.2, 1.5, 1.5, 2, 2.5, 2.5, 3, 4, 5, 7, 8, 9, 10], 3: [2, 2.5, 2.5, 3, 4, 4, 5, 6, 8, 10, 12, 13, 15], 4: [3, 4, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20],
    5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27], 6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40], 7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63], 8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
    9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155], 10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250], 11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
    12: [100, 120, 150, 180, 210, 250, 300, 350, 400, 460, 520, 570, 630], 13: [140, 180, 220, 270, 330, 390, 460, 540, 630, 720, 810, 890, 970], 14: [250, 300, 360, 430, 520, 620, 740, 870, 1000, 1150, 1300, 1400, 1550],
    15: [400, 480, 580, 700, 840, 1000, 1200, 1400, 1600, 1850, 2100, 2300, 2500], 16: [600, 750, 900, 1100, 1300, 1600, 1900, 2200, 2500, 2900, 3200, 3600, 4000]
  };
  P.step = D => { const i = P.STEPS.findIndex(b => D <= b); return i < 0 ? P.STEPS.length - 1 : i; };
  P.itv = (D, g) => P.IT[g][P.step(D)];
  P.iUnit = D => { const i = P.step(D), lo = i ? P.STEPS[i - 1] : 1, hi = P.STEPS[i]; const Dm = Math.sqrt(lo * hi); return 0.45 * Math.cbrt(Dm) + 0.001 * Dm; };
  /* Shaft fundamental deviations (µm): es for a–h (upper), ei for k–s (lower). r and s use the sub-steps of ISO 286-2 above 50 mm. */
  P.SHAFT_ES = { d: [-20, -30, -40, -50, -65, -80, -100, -120, -145, -170, -190, -210, -230], e: [-14, -20, -25, -32, -40, -50, -60, -72, -85, -100, -110, -125, -135], f: [-6, -10, -13, -16, -20, -25, -30, -36, -43, -50, -56, -62, -68], g: [-2, -4, -5, -6, -7, -9, -10, -12, -14, -15, -17, -18, -20], h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  P.SHAFT_EI = { k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5], m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23], n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40], p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68] };
  P.SUB = [3, 6, 10, 18, 30, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];
  P.SHAFT_EI_SUB = { r: [10, 15, 19, 23, 28, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84, 94, 98, 108, 114, 126, 132], s: [14, 19, 23, 28, 35, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190, 208, 232, 252] };
  /* limits of a shaft or hole: letter (case decides hole/shaft), grade. Returns {up, lo} deviations in µm. Holes follow the general and special rules of ISO 286-1. */
  P.dev = function (D, letter, g) {
    const IT = P.itv(D, g), i = P.step(D), hole = letter === letter.toUpperCase(), l = letter.toLowerCase();
    const shaft = (L) => { if (L === 'js') return { up: IT / 2, lo: -IT / 2 }; if (P.SHAFT_ES[L]) { const es = P.SHAFT_ES[L][i]; return { up: es, lo: es - IT }; }
      let ei; if (P.SHAFT_EI[L]) ei = (L === 'k' && (g < 4 || g > 7)) ? 0 : P.SHAFT_EI[L][i]; else if (P.SHAFT_EI_SUB[L]) { const j = P.SUB.findIndex(b => D <= b); ei = P.SHAFT_EI_SUB[L][j < 0 ? P.SUB.length - 1 : j]; } else throw new Error('letter'); return { up: ei + IT, lo: ei }; };
    if (!hole) return shaft(l);
    if (l === 'js') return { up: IT / 2, lo: -IT / 2 };
    if (P.SHAFT_ES[l]) { const EI = -P.SHAFT_ES[l][i]; return { up: EI + IT, lo: EI }; }
    const s = shaft(l); const delta = D <= 3 ? 0 : P.itv(D, g) - P.itv(D, g - 1);
    let ES; if (l === 'k' && g > 8) ES = 0; else if ((['k', 'm', 'n'].includes(l) && g <= 8) || (!['k', 'm', 'n'].includes(l) && g <= 7)) ES = -s.lo + delta; else ES = -s.lo;
    return { up: ES, lo: ES - IT };
  };
  P.fit = function (D, hole, shaft) {
    const mh = hole.match(/^([A-Z]+|JS)(\d+)$/i), ms = shaft.match(/^([a-z]+|js)(\d+)$/i);
    const H = P.dev(D, mh[1].toUpperCase() === 'JS' ? 'JS' : mh[1].toUpperCase(), +mh[2]), S = P.dev(D, ms[1].toLowerCase(), +ms[2]);
    const maxC = H.up - S.lo, minC = H.lo - S.up; return { H, S, maxC, minC, kind: minC >= 0 ? 'Clearance' : maxC <= 0 ? 'Interference' : 'Transition' };
  };

  /* Gauge-block (slip-gauge) sets, mm */
  const rngS = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(4)); return o; };
  P.SETS = {
    M87: { name: 'M87 (87 pieces)', blocks: [1.0005, ...rngS(1.001, 1.009, 0.001), ...rngS(1.01, 1.49, 0.01), ...rngS(0.5, 9.5, 0.5), ...rngS(10, 90, 10)] },
    M112: { name: 'M112 (112 pieces)', blocks: [1.0005, ...rngS(1.001, 1.009, 0.001), ...rngS(1.01, 1.49, 0.01), ...rngS(0.5, 24.5, 0.5), 25, 50, 75, 100] },
    M45: { name: 'M45 (45 pieces)', blocks: [...rngS(1.001, 1.009, 0.001), ...rngS(1.01, 1.09, 0.01), ...rngS(1.1, 1.9, 0.1), ...rngS(1, 9, 1), ...rngS(10, 90, 10)] }
  };
  /* Combination by the standard method: eliminate the last decimal place first (1.0005, then 1.001–1.009, then 1.01–1.49 to reach a
     multiple of 0.5 mm), then one 0.5-step block and finally the tens. Works in units of 0.1 µm. Returns blocks (mm) or null. */
  P.slip = function (L, set) {
    const S = P.SETS[set || 'M87'], have = new Set(S.blocks.map(b => Math.round(b * 10000))); const used = []; let r = Math.round(L * 10000);
    const take = v => { if (!have.has(v) || used.includes(v) || v > r) return false; used.push(v); r -= v; return true; };
    if (r % 10 === 5 && !take(10005)) return null;
    const d3 = Math.floor(r / 10) % 10; if (d3 && !take(10000 + d3 * 10)) return null;
    const h = r % 5000; if (h) { if (have.has(10000 + h) && h < 5000) { if (!take(10000 + h)) return null; } else { // M45-type sets: hundredths then tenths
      const d2 = Math.floor(r / 100) % 10; if (d2 && !take(10000 + d2 * 100)) return null; const d1 = Math.floor(r / 1000) % 10; if (d1 && !take(10000 + d1 * 1000)) return null; } }
    // whole and half millimetres: largest block below the next multiple of 10, then tens
    const steps = [...have].filter(v => v % 5000 === 0 && v < 100000).sort((a, b) => b - a), tens = [...have].filter(v => v % 100000 === 0).sort((a, b) => b - a);
    const u = r % 100000; if (u) { if (have.has(u) && u <= r) take(u); else { const v = steps.find(x => x <= u && have.has(x)); if (v) take(v); } }
    let guard = 0; while (r > 0 && guard++ < 8) { const v = tens.find(x => x <= r && !used.includes(x)) || steps.find(x => x <= r && !used.includes(x)); if (!v) break; take(v); }
    if (r === 0) return used.map(v => v / 10000);
    return P.slipDP(L, set);
  };
  /* fewest-blocks combination by 0/1 knapsack in units of 0.0005 mm (fallback and check) */
  P.slipDP = function (L, set) {
    const vals = P.SETS[set || 'M87'].blocks.map(b => Math.round(b * 2000)), T = Math.round(L * 2000); if (T <= 0 || T > 600000) return null;
    const cnt = new Uint8Array(T + 1).fill(255), pick = new Int16Array(T + 1).fill(-1), prev = new Int32Array(T + 1).fill(-1); cnt[0] = 0;
    const items = vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
    for (const [v, i] of items) { for (let t = T; t >= v; t--) { const c = cnt[t - v] + 1; if (cnt[t - v] !== 255 && c < cnt[t]) { cnt[t] = c; pick[t] = i; prev[t] = t - v; } } }
    if (cnt[T] === 255) return null;
    // reconstruction can reuse an item when parents were overwritten later; verify and fall back to greedy repair
    const out = []; let t = T, guard = 0; const seen = new Set(); while (t > 0 && guard++ < 40) { const i = pick[t]; if (i < 0 || seen.has(i)) return null; seen.add(i); out.push(vals[i] / 2000); t = prev[t]; }
    return t === 0 ? out : null;
  };
  /* ISO 3650 limit deviation of length te and variation tv (µm) by grade, for nominal length L (mm) */
  P.GB_TOL = [[10, { K: [0.20, 0.05], 0: [0.12, 0.10], 1: [0.20, 0.16], 2: [0.45, 0.30] }], [25, { K: [0.30, 0.05], 0: [0.14, 0.10], 1: [0.30, 0.16], 2: [0.60, 0.30] }], [50, { K: [0.40, 0.06], 0: [0.20, 0.10], 1: [0.40, 0.18], 2: [0.80, 0.30] }], [75, { K: [0.50, 0.06], 0: [0.25, 0.12], 1: [0.50, 0.18], 2: [1.00, 0.35] }], [100, { K: [0.60, 0.07], 0: [0.30, 0.12], 1: [0.60, 0.20], 2: [1.20, 0.35] }]];
  P.gbTol = (L, g) => { const r = P.GB_TOL.find(x => L <= x[0]) || P.GB_TOL[P.GB_TOL.length - 1]; return r[1][g]; };

  /* Materials: E (GPa), ν, α (10⁻⁶/K), ρ (kg/m³) */
  P.MAT = {
    ms: { name: 'Mild steel (AISI 1018)', E: 205, nu: 0.29, a: 11.7, rho: 7870 }, ss304: { name: 'Stainless steel AISI 304', E: 193, nu: 0.29, a: 17.3, rho: 8000 },
    al6061: { name: 'Aluminium alloy 6061-T6', E: 68.9, nu: 0.33, a: 23.6, rho: 2700 }, brass: { name: 'Brass CuZn37', E: 105, nu: 0.34, a: 20.2, rho: 8440 },
    cu: { name: 'Copper (annealed)', E: 117, nu: 0.34, a: 16.6, rho: 8930 }, ci: { name: 'Grey cast iron (FG 260)', E: 120, nu: 0.26, a: 10.5, rho: 7200 },
    ti: { name: 'Titanium Ti-6Al-4V', E: 114, nu: 0.34, a: 8.6, rho: 4430 }, gauge: { name: 'Gauge-block steel (hardened)', E: 210, nu: 0.29, a: 11.5, rho: 7800 },
    cer: { name: 'Zirconia ceramic gauge block', E: 205, nu: 0.31, a: 9.5, rho: 6000 }, invar: { name: 'Invar 36', E: 141, nu: 0.26, a: 1.3, rho: 8050 }, granite: { name: 'Black granite (surface plate)', E: 60, nu: 0.25, a: 6.5, rho: 2900 }
  };
  /* ISO metric screw threads, coarse series: [designation, d (mm), pitch p (mm)] */
  P.THREADS = [['M3', 3, 0.5], ['M4', 4, 0.7], ['M5', 5, 0.8], ['M6', 6, 1], ['M8', 8, 1.25], ['M10', 10, 1.5], ['M12', 12, 1.75], ['M14', 14, 2], ['M16', 16, 2], ['M20', 20, 2.5], ['M24', 24, 3], ['M30', 30, 3.5], ['M36', 36, 4], ['M42', 42, 4.5], ['M48', 48, 5]];
  P.d2 = (d, p) => d - 0.649519 * p; P.d3 = (d, p) => d - 1.226869 * p; P.d1 = (d, p) => d - 1.082532 * p;
  P.bestWire = (p, ang) => p / (2 * Math.cos((ang || 60) / 2 * Math.PI / 180));
  /* involute gear helpers (pressure angle φ in degrees) */
  P.inv = phi => Math.tan(phi * Math.PI / 180) - phi * Math.PI / 180;
  P.gearChord = (m, z) => ({ w: z * m * Math.sin(Math.PI / (2 * z)), h: m * (1 + z / 2 * (1 - Math.cos(Math.PI / (2 * z)))) });
  P.constChord = (m, phi) => { const f = (phi || 20) * Math.PI / 180; return { c: Math.PI * m / 2 * Math.cos(f) ** 2, h: m * (1 - Math.PI / 8 * Math.sin(2 * f)) }; };
  P.spanTeeth = (z, phi) => Math.max(2, Math.round(z * (phi || 20) / 180 + 0.5));
  P.baseTan = (m, z, k, phi) => { const f = (phi || 20) * Math.PI / 180; return m * Math.cos(f) * (Math.PI * (k - 0.5) + z * P.inv(phi || 20)); };
  /* ISO 1302 roughness grades */
  P.NGRADE = [['N1', 0.025], ['N2', 0.05], ['N3', 0.1], ['N4', 0.2], ['N5', 0.4], ['N6', 0.8], ['N7', 1.6], ['N8', 3.2], ['N9', 6.3], ['N10', 12.5], ['N11', 25], ['N12', 50]];
  P.ngrade = Ra => (P.NGRADE.find(g => Ra <= g[1] * 1.0001) || P.NGRADE[11])[0];
  /* ISO 4288 cut-off for periodic profiles by RSm, and for non-periodic by Ra */
  P.cutoffRa = Ra => Ra <= 0.02 ? 0.08 : Ra <= 0.1 ? 0.25 : Ra <= 2 ? 0.8 : Ra <= 10 ? 2.5 : 8;
  P.g = 9.80665;
})();
