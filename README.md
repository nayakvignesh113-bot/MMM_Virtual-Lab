# Mechanical Measurements & Metrology Virtual Lab

**Version 1.0** · Developed by Dr. Vignesh Nayak Ullal, Department of Mechanical Engineering, Mangalore Institute of Technology & Engineering (MITE), Moodbidri · [CC BY-NC-SA 4.0](LICENSE.md)

Live site (after enabling GitHub Pages): <https://nayakvignesh113-bot.github.io/MMM_Virtual-Lab/>

A static, dependency-free virtual laboratory for the Mechanical Measurements and Metrology course, with 18 experiments. Each experiment runs through eight stages:

**Pre-test → Theory → Operate → Experiment → Validation → Numericals → Post-test → Report**

Every instrument is a measurement model, not a recording. The true value comes from a reference standard (dead weights, slip gauges, a reference thermometer, known masses, a stroboscope) or from the part’s geometry; the instrument turns it into a reading through its own principle and adds the errors real instruments have: zero error, span error, non-linearity, hysteresis, resolution, temperature effects and scatter. Each student gets their own numbers.

Built on the engine of the Heat Transfer and Materials Testing & Characterization Virtual Labs (narrated explainers, Listen, safety gate, do-it-yourself set-up with interlocks, numericals, feedback, submission, watermarked reports, certificates), with features specific to metrology:

- **Read the instrument yourself.** Pressure-gauge dials, micrometer sleeves and thimbles (0.01 mm and vernier 0.001 mm), vernier calipers (0.02 mm, scroll to find the coincidence), comparator and dial-test-indicator scales, the autocollimator graticule, optical-flat fringe patterns and a live stroboscope you tune until the mark stands still are drawn to scale. Readings shown as pictures are not given in the tables.
- **Calibration statistics.** Calibration experiments end with sensitivity, independent non-linearity, hysteresis, zero return and accuracy-class decisions, and a GUM uncertainty budget.
- **Settings that teach real effects:** reference-junction correction, 2-/3-/4-wire RTD connection and self-heating, PSD versus rms LVDT output, full/half/quarter bridges and gauge-factor dial errors, contact versus optical tachometers, wrong roughness cut-off, best-size versus other thread wires, sine-bar sensitivity above 45°, an untilted toolmaker’s-microscope column, tip-diameter correction in gear measurement.
- **Metrology Handbook** (`#handbook`): 12 chapters — units and VIM terms; GUM and t-tables; ISO 286 IT grades, fundamental deviations, preferred fits; gauge-block sets, ISO 3650 grades, limit-gauge design; ITS-90 thermocouple tables (K, J, T, E) and IEC 60751 Pt100; pressure, gravity, strain gauges, bridges, beams, materials; tachometry and Kienzle cutting-force constants; ISO metric threads with 6g limits; gear chordal and span tables; surface texture (N grades, ISO 4288 cut-offs); sine bar, autocollimator, interferometry and GD&T symbols; least counts of instruments. Look-ups interpolate, charts show coordinates, and calculators give fits, slip-gauge stacks, thermocouple and Pt100 conversions, local gravity, wire-method thread diameter, gear data, sine-bar settings, ideal turned finish and combined uncertainty.

## Experiments

| No. | Experiment | Basis | Status |
|---|---|---|---|
| 1 | Calibration of a pressure gauge using a dead-weight tester | p = mg(1 − ρa/ρw)/Ae, local gravity; EN 837-1 classes | Validated |
| 2 | Calibration of a thermocouple | ITS-90 reference functions, reference-junction law; IEC 60584-1 | Validated |
| 3 | Calibration of an RTD (Pt100) | IEC 60751 Callendar–Van Dusen; lead wires; self-heating | Validated |
| 4 | Calibration of an LVDT using a micrometer | Differential transformer; PSD vs rms; ISA-S37.1 terms | Partly validated |
| 5 | Calibration of a strain-gauge load cell | 6WL/(Ebh²), bridge output; OIML R 60 | Validated |
| 6 | Calibration of a tachometer (stroboscope, magnetic pickup) | Frequency counting; strobe image physics | Validated |
| 7 | Young’s modulus and Poisson’s ratio using strain gauges | Quarter/half/full bridges, GF correction, apparent strain | Validated |
| 8 | Cutting forces with a lathe tool dynamometer | Kienzle; Merchant analysis | Partly validated |
| 9 | Thrust and torque with a drill tool dynamometer | Lip torque, chisel edge; Shaw–Oxford | Partly validated |
| 10 | Calibration of a micrometer using slip gauges | ISO 3611 test lengths; screw errors | Partly validated |
| 11 | Comparator with slip gauges; design of limit gauges | ISO 286 limits; Taylor’s principle | Validated |
| 12 | Angle measurement with a sine bar | Sine rule, correction, cos θ sensitivity | Validated |
| 13 | Straightness by autocollimator | ISO 230-1 reduction | Validated |
| 14 | Surface roughness by stylus profilometer | ISO 16610-21 Gaussian filter; ISO 21920-2 parameters | Validated |
| 15 | Flatness by optical flat | Air-wedge interference; gauge comparison | Validated |
| 16 | Effective diameter of a thread (two-wire method) | ISO 965-1; exact wire geometry | Validated |
| 17 | Gear tooth vernier and base tangent span | ISO 21771 involute geometry | Validated |
| 18 | Thread parameters with a toolmaker’s microscope | Pitch, flank angle, helix tilt | Partly validated |

Totals: 18 experiments, 54 randomised numerical problem types, 180 pre- and post-test questions, 54 explainer concept checks, 299 narration clips.

## Hosting on GitHub Pages

The repository root is the site. **Settings → Pages → Deploy from a branch → main / (root)**. GitHub Pages is free for public repositories; for a private repository it needs a paid plan.

| Item | Needed on the site? |
|---|---|
| `index.html` | Yes: the whole lab in one file |
| `config.js` | Yes: the submission URL (empty = submission off) |
| `audio/` | Yes, for narration. Without it the explainer runs with captions only |
| `apps-script/` | No: Google Sheet receiver and set-up guide for faculty |
| `assets/`, `dev.html`, `tools/` | No: source files for editing and testing |

Each experiment has its own link, e.g. `…/#dwt`, `…/#micrometer-s-operate`; also `…/#handbook`, `…/#handbook-s-iso286`, `…/#handbook-s-all` (whole handbook for printing), `…/#about`, `…/#faculty`.

## Report submission and certificates

Follow `apps-script/SUBMISSIONS_SETUP.md` (about 10 minutes) and paste the web-app URL into `config.js`. Use a new Google Sheet, separate from your other labs. Certificate IDs start with `MML-`.

## Structure

```
index.html              built single-file site (do not edit; run node tools/build.js)
dev.html                page shell that loads the separate source files (open this while editing)
config.js               submission URL (window.MML_CONFIG)
assets/css/lab.css      design tokens (light and dark themes), layout, rig and scale styles
assets/js/core.js       engine: router, 8 stages, quiz, plotter, operate (safety gate, DIY set-up), validation, report
assets/js/kit.js        metrology toolkit: instrument error model and calibration statistics (LAB.M), readable scales
                        (micrometer with vernier, vernier caliper, dial, comparator, pressure gauge, autocollimator),
                        reference data (LAB.P: ITS-90, Pt100, ISO 286, gauge-block sets, threads, gears, materials)
assets/js/exp/NN-*.js   one self-contained file per experiment
assets/js/site.js       rail, About, explainer player, Listen, numericals stage, feedback, submission
assets/js/cert.js       certificates: request, faculty page, PDF/PNG, verification
assets/js/handbook.js   Metrology Handbook: chapters, look-ups, charts, calculators, print view
assets/js/logo.js       MITE logo as a data URI
audio/                  narration MP3s and manifest.json (generated)
apps-script/            Google Apps Script receiver and set-up guide
tools/test.js           headless check of every model, set-up step, explainer cue and numerical (node tools/test.js)
tools/e2e.py            browser run of all experiments through all 8 stages (Playwright)
tools/e2e_cert.py       certificate and faculty flow against a mocked Apps Script
tools/build.js          builds index.html from dev.html and assets/
tools/narration/        narration text extraction, speech normaliser and Kokoro TTS generator
```

## Editing

1. Edit files under `assets/` (open `dev.html` through a local web server, e.g. `python3 -m http.server`).
2. Run `node tools/test.js` (must end with `fails: 0`).
3. Run `node tools/build.js` to rebuild `index.html`, and upload it.

To add an experiment, copy any file in `assets/js/exp/`, change the `id` and `no`, and fill in the same blocks: `LAB.register({...})`, then `LAB.VALID`, `LAB.NOMEN`, `LAB.SETUP` (each step with a `why` for the interlock), `LAB.EXPL`, `LAB.SAFETY`, `LAB.LIB` and three `LAB.NUM` generators. Select options whose values look like numbers arrive as numbers in `p`, so compare them with `==`. `build.js` picks the file up automatically.

If you change explainer lines or theory paragraphs, delete the affected MP3s and run `node tools/narration/extract.js`, then `python3 tools/narration/generate.py audio` (see `tools/narration/README.md`).

## Notes

- Progress and answers are stored in the browser only. Nothing leaves the browser unless the student presses *Submit feedback* or *Submit to faculty* with a submission URL configured.
- Narration voice: Kokoro-82M (Apache 2.0), voice af_heart, generated offline.
- Cite: see `CITATION.cff` or the About page.
