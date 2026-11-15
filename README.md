# SharpWalk

SharpWalk checks a planned crewed walk from a habitat to the Mount Sharp boxwork in Gale crater, Mars, against stated
assumptions, and shows the estimated time margins. It does **not** certify a safe return: every margin is an estimate
under stated assumptions, the route is slope-screened (not rock-free or validated), and suit life support is not
modelled.

Independent student project; not affiliated with or endorsed by NASA.

## Authorship and credits

**SharpWalk is an equally created team project by all four members.**

Christian Jesus Alcazar, Patrick Ezekiel A. Arcilla, Eugene Ibañez Jr. ("Yujin") and John Malubay are equal co-creators and co-authors of the SharpWalk concept, challenge framing, solution direction,
requirements, project plan and application (DECISIONS G-11). No member is the sole originator or the lead author. The
names are in alphabetical order by surname; the order means nothing else.

The implementation, science, engineering, design, testing and delivery are the team's shared work. The project logs
(`SI_LOG.md`, `DECISIONS.md`, `PHASES.md`) record which member directed or reviewed each working session; those are
working records, not a ranking of credit. The repository is hosted under the GitHub account `parcilla13` for the team.

SI assistance is disclosed separately under **SI use** below and in `SI_LOG.md`. Code and documents were drafted with
SI assistance at the members' direction. SI is not credited with the concept, the plan or any team decision.

## What it does

- **AREA sheet (2D):** a north-up map of a 3 x 3 km area at the boxwork (4.790-4.840 S, 137.365-137.415 E,
  planetocentric, east-positive) with the D2 orthophoto, a D1 hillshade and slope-screened terrain classes.
- **Route engine (Web Worker):** time-optimal A* routes on a 2 m grid of slope-screened cells (slope limit 20 deg,
  Assumed, from the lunar xEVA concept of operations); leg lengths, climb and walking times as estimated ranges.
- **Planned margin:** time left in the planned EVA at every route point after walking, stops, tasks, the walk back and
  contingency (OK / NEAR LIMIT / OVER; there is no "safe" state). Plan times are Assumed inputs: the demo loads
  6 h, 1 h, 1 h and 45 min from two cited lunar planning documents (see **Assumed demo inputs**), all editable.
- **Briefing card:** printable A5 card, stamped with the plan version and marked STALE when the plan changes.
- **Field View:** manual arrival/departure ticks and two field margins from those manual entries.
- **Tier 2:** time-to-habitat contour lines and a simulated solar-event drill (assumed warning time; no dose).
- **Sources panel:** every displayed time, margin and duration opens its value class, method, sources and assumptions.

What it does not do: rock or obstacle detection, dose maps or radiation-safe locations, suit life-support budgets,
metabolic workload (off), live data feeds, or 3D (cut at G1, see `DECISIONS.md`).

## How each NASA dataset drives a number on screen

| Dataset | Use | Numbers it drives |
|---|---|---|
| D1 - MSL Gale DEM mosaic, 1 m (USGS Astrogeology) | Heights on the 2 m F6 grid, slope, terrain classes, hillshade | Elevation readout, slope screening, route length and climb, walking times, planned and field margins, time-to-habitat contours |
| D2 - MSL Gale HiRISE colour orthophoto COG, 0.25 m (USGS Astrogeology) | Base image of the sheet and the briefing map | Display only; no number is derived from it |
| D7 - MSL REMS daily weather summary (CAB, via mars.nasa.gov) | Build-time snapshot of the latest sol with air temperature and pressure | "Conditions at Curiosity on [date], for context": air temperature range and pressure, at the rover, not the boxwork |
| D6 - Curiosity raw images (NASA MSL raw image archive) | Three Navcam frames from sols 4602, 4628 and 4650, when the rover was in the boxwork unit (per the mission blog) | "Rover point of view": similar terrain, not the demo stops and not a route check; sol, date, camera and credit on each image, in the console and on the card |
| D12 - MOLA-HRSC blended DEM 200 m (USGS), with D1 | Plan 6.7 horizon profiles on a 20 m grid; AC-07 benchmark at Butte M12 | "Sky obstruction layer" (off by default): % of the upper hemisphere blocked by terrain, geometry not dose, with the M12 benchmark in its legend |
| D10 - Mars24 algorithm (NASA GISS) | Computed at the area centre for the team's Assumed scenario time | Local mean solar time (clock label), solar longitude, sun elevation (terrain shadowing not modelled) |

Each record (product, URL, licence, CRS, vertical reference, resolution, checksum scope) is in
`public/area/provenance.json`, written by the pipeline and shown in the Sources panel.

## Assumed demo inputs and where they come from

None of these is a measurement or a Mars-validated value. The four plan times are lunar planning figures applied to
Mars; they load by default, show an "assumed" badge with this rationale, stay editable, and are skipped with
`?preset=none`. Quotations, pages and checksums: `docs/data/reg-01-register-sources.md` (DECISIONS REG-01). Check of every value and citation against its source:
`docs/data/reg-02-verification.md` (REG-02).

| Input | Value | Basis |
|---|---|---|
| Planned EVA duration, T_EVA | 360 min | Centre of the 6±2 h EVA range: EVA-EXP-0042 Rev B, 4.1.4, p. 29 |
| Operational tasks, t_ops | 60 min | "hour for egress/ingress": EVA-EXP-0042 Rev B, 4.1.4.3.2, p. 30 |
| Contingency, t_cont | 60 min | "an additional hour for emergency and off-nominal situations": same page; held inside T_EVA; a time allowance, not life support |
| Default stop duration | 45 min | 45 min of EVA per exploration site: NASA/TM-2010-216138, Tables 2-3, p. 12 |
| Slope limit | 20 deg | "Walking up/down/across a slope of up to 20°": EVA-EXP-0042 Rev B, 4.2.1.3, p. 38 |
| Scenario time | 2026-11-15 12:00 UTC | A scenario input with no possible source; a 6 h EVA from this start stays in daylight |
| Slope factors k_v | 1 in every bin | No sourced speed-versus-slope value exists (EVA-EXP-0042 Rev B, p. 40; NASA SP-368, ch. 4, Table 4, p. 125 reaches only 7.9 deg); probably optimistic on 10-20 deg slopes |
| Default habitat | 4.795211 S, 137.391845 E | Scenario input from the team plan and the D1 slope screen; not a proposed base site |

## Run it

```bash
npm ci
```

```bash
npm run dev
```

Checks:

```bash
npx vitest run && npx tsc --noEmit && npm run build
```

```bash
npx playwright test --trace off
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest -q)
```

The area data in `public/area` is committed; `pipeline/tests/test_area_outputs.py` checks it against the checksums the
pipeline recorded. To rebuild it (needs network access to the USGS bucket):

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_d1 ../public/area && ../.venv/bin/python -m sharpwalk.run_display ../public/area
```

## SI use

The 2026 guides call AI "Super Intelligence (SI)". The dated, per-task record is `SI_LOG.md`; this section summarises
it.

- **Tool and model:** Claude Code (Anthropic) running **Claude Opus 5.5**, in two cloud sessions on Sat 14 Nov 2026
  (directed by Eugene Ibañez Jr. from 10:21, and by John Malubay from 12:57). Claude Fable 5.2 was not used in them. The
  Superpowers workflow skill was loaded in the first session; it was not installed in the second, where its
  test-first and verify-before-done practice was followed by hand. In the second session a Claude Code web-fetch
  subagent was used twice to read NASA's Mars24 algorithm page; both attempts failed and nothing from them is used.
  A third session (Sat 14 Nov 15:19-17:31, from parcilla13's account) used the Superpowers test-driven-development
  skill and drafted the Conditions panel (Mars24 sun, REMS snapshot), the D1/D2 coverage outlines, the IBM Plex font
  loading, the 10 m elevation contours and the screen-pixel terrain hatch, with their tests and code reviews; it
  installed the GDAL command-line tools in its container to run gdal_contour. Later sessions on Sat 14 Nov (18:29 to
  22:50, Claude Opus 5.5, Superpowers not installed) ran the reproducibility check, the benchmarks, the sky layer and
  the deploy. A session from about 23:07 ran on **Claude Fable 5.2** (Superpowers not installed): it read four NASA
  documents and cleared the placeholder register (REG-01). A session on Sun 15 Nov from 00:02 (Claude Fable 5.2,
  directed by Eugene Ibañez Jr.; Superpowers not used) read every cited source again and checked each register value,
  constant and citation (REG-02). On Sun 15 Nov from 00:58 a Claude Opus 5.5 session drafted the UI/UX redesign on the
  branch `design/sharpwalk-ui-ux` (merged into `main` on Sun 15 Nov, MERGE-02), using Higgsfield (gpt_image_2_6) for 18 exploration images; none of them is
  shipped or used as data. Later on Sun 15 Nov the same branch was redesigned again ("Bureau", UI-13), with seven more
  Higgsfield exploration frames (5 credits; none shipped), Motion and Anime.js for animation, point and click on the
  map and an orientation tour. From 11:34 that day a **Claude Fable 5.2** session audited that redesign on the same
  branch: it removed Anime.js (Motion alone animates), brought the JavaScript back inside the 250 kB budget, stopped
  the doubled terrain download, made the demonstration card print on one A5 page and fixed the design and
  accessibility findings (DECISIONS MOT-04, B-01, TER-01, PRINT-02, UX-16, A11Y-02). Details per task: `SI_LOG.md`.
- **What SI contributed:** drafted the data pipeline and its tests; the frame conversions and constants register;
  the route engine, margins and field-margin functions; the engine worker; the AREA sheet, console, profile, sources
  panel, briefing card and field view; accessibility and resilience tests; tier-2 contours and drill; this README and
  the log entries. It ran the test suites, code reviews (`/code-review`) and benchmarks, and read the plan to apply
  its rules. Each entry in `SI_LOG.md` names its files and commits.
- **What was retained and how it was checked:** the drafted code was kept after its tests passed (vitest, pytest,
  Playwright, typecheck, build) and after review findings were fixed or recorded in `DECISIONS.md`; human review of
  the code is still pending (no module owner has signed it off).
- **What people decided, not SI:** the concept and plan (the whole team); governance and scientific choices
  such as G-01/G-02, G-05, K-01 (k_v = 1 in every bin), applying the plan's defaults, G-07, the contract agreement
  C-AGREE and the equal-credit decision G-11 (the session operators are named per entry in `DECISIONS.md` and `SI_LOG.md`). Local Lead approvals were not chosen by SI.
- **Values picked by SI at a team member's direction (G3-01, then REG-01):** on Sat 14 Nov 2026 a team member asked
  the SI session to choose the G3 inputs the plan leaves open ("for g3 needed you choose"); SI chose unsourced
  demonstration values. Later that day a team member asked for every placeholder to be replaced by a sourced value
  with its citation (REG-01). SI found the documents, read the pages and picked the values now loaded: T_EVA 360 min,
  t_ops 60 min, t_cont 60 min and stop 45 min, plus the citation for the 20 deg slope limit. SI also drafted the
  reasons for the values that were kept because no source exists (scenario time 2026-11-15 12:00 UTC, slope factors
  k_v = 1, habitat point, display and method settings). Each is shown as an Assumed value whose rationale says so, and
  each stays editable. The other team members have not yet reviewed REG-01. The G3-01 delegation also covered the
  stop name/tasks command design (C-19, option a) and the three Curiosity rover images (D6, C-22), which SI selected
  from NASA's raw image archive (not generated). See `DECISIONS.md` G3-01, REG-01, C-19 and C-22.
- **Media:** no image, video or audio was generated by SI. The map and card images are rendered from NASA/USGS data.
- **Markers:** SI-assisted source files carry an `SI-assisted` header line; SI-assisted commits carry an
  `SI-assisted:` trailer.

## References

### Data and publications

- D1: USGS Astrogeology, *MSL Gale DEM Mosaic 1m v3*, `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif`. Use constraints: none; please credit the authors.
- D2: USGS Astrogeology, *MSL Gale HiRISE LRGB 78 quads (sharp) COG*, T. J. Parker and F. J. Calef III, `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif`. Use constraints: none; please credit the authors.
- Chappell, S. P., Norcross, J. R., Abercromby, A. F., Gernhardt, M. L. *Life Sciences Implications of Lunar Surface Operations*. NASA/TM-2010-216138, Nov 2010 (NTRS 20110001417), Table 4, p. 13 (planning walking speed 0.83 m/s; IST-1 treadmill speed window 0.64-0.97 m/s at lunar gravity).
- Norcross, J. R. et al. *Metabolic Costs and Biomechanics of Inclined Ambulation and Exploration Tasks in a Planetary Suit*. NASA/TP-2010-216125 (NTRS 20110003409), pp. 2, 5, 10, 70-71, 79, 83 (limits of the suited incline tests: six male subjects, speed fixed by protocol, 0.12-0.32 g, grades 0-30 %, model coefficients not reported); read for REG-02.
- IAU 2015 Mars sphere (R = 3,396,190 m), as used by D1 and D2.
- Drill warning time (Assumed 30 min default): team plan section 6.9, informed by Löwe, J. L. et al. (2025), "Nowcasting Solar Energetic Particle Events for Mars Missions", arXiv:2502.02469 (preprint), and Minow, J. I., Mertens, C. J., Parker, L. N. et al. (2020), *Space Weather Architecture Options to Support Human and Robotic Deep Space Exploration*, NASA/TM-20205000837 (NESC-RP-17-01215), recommendations R-1 and R-3, p. 49.
- D7: Centro de Astrobiologia (CAB), MSL REMS weather summary feed, `https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json`, retrieved 2026-11-14T07:32:00Z. Provider's terms: "intended for outreach purposes only. Any other use is discouraged" (DECISIONS REMS-02).
- D5: NASA/JPL MMGIS, Curiosity (MSL) traverse and waypoints, `https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_traverse.json` and `MSL_waypoints.json`, retrieved 2026-11-14T11:32:31Z (sha256 in `docs/data/ac08-rover-path.json`). Used for the AC-08 consistency check only; localisation error unverified.
- D12: USGS Astrogeology, Mars MOLA-HRSC blended DEM, global 200 m, v2 (`mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif`). Far field for the AC-07 sky-obstruction benchmark.
- Ehresmann, B. et al. (2021), JGR Planets, doi:10.1029/2021JE006851; Guo, J. et al. (2021), GRL, doi:10.1029/2021GL093912. Published sky obstruction at Butte M12 (about 19 %), used only as the AC-07 geometric benchmark, never as a dose factor; 0.37π of the 2π hemisphere (about 19 %) with an average blocking angle of 11°: Ehresmann et al., sec. 2.2 and 4 (publisher's HTML, no page numbers); "about 0.19": Guo et al., sec. 4, p. 6 of 10 (REG-02).
- D6: NASA/JPL-Caltech, Curiosity (MSL) raw images, Left Navigation Camera: NLB_806042016EDR_F1172490NCAM00259M_ (sol 4602), NLB_808343392EDR_F1180924NCAM00292M_ (sol 4628), NLB_810299631EDR_F1182304NCAM00271M_ (sol 4650), `https://mars.nasa.gov/msl/multimedia/raw-images/`; credit "NASA/JPL-Caltech"; raw, uncalibrated, downscaled to 480 px. Chosen by SI at a team member's direction (G3-01). Terrain evidence: NASA Curiosity blog posts for sols 4602-4603, 4627-4628 and 4649-4654 (`public/rover/images.json`). Use under NASA's "Images and Media" guidelines with credit (educational, factual, no implied endorsement; DECISIONS REG-01 / V-08) and JPL's Image Use Policy, `https://www.jpl.nasa.gov/jpl-image-use-policy/`, read 15 Nov 2026 (REG-02).
- D10: NASA GISS, Mars24 Sunclock "Algorithm and Worked Examples" (updated 2025-01-07), `https://www.giss.nasa.gov/tools/mars24/help/algorithm.html`; Allison, M., McEwen, M. (2000), Planet. Space Sci. 48, 215-235; Allison, M. (1997), Geophys. Res. Lett. 24, 1967-1970.
- NASA, *Exploration EVA System Concept of Operations*, EVA-EXP-0042, Revision B, 19 Oct 2020 (NTRS 20205008200), `https://www.nasa.gov/wp-content/uploads/2017/02/eva-exp-0042_xeva_system_con_ops_rev_b_final_dtd_10192020_ref_doc.pdf`: 4.1.4, p. 29 (EVA duration 6±2 h); 4.1.4.3.2 and 4.1.4.4, p. 30 (hour for egress/ingress; additional hour for off-nominal situations; Mars EVAs "still in work"); 4.2.1.3, p. 38 (walking slopes of up to 20°); 4.2.1.3.1.1, p. 40 (2 km/h pace, not accounting for slope). A lunar planning document; its figures are used as Assumed inputs.
- Coan, D., *Exploration EVA System Concept of Operations Summary for Artemis Phase 1 Lunar Surface Mission*, EVA-EXP-0075, presentation, 18 Feb 2020 (NTRS 20200001071), slides 6 and 31 (20° slope; 6-hour design reference EVAs).
- NASA/TM-2010-216138 (above), Tables 2-3, p. 12 (45 min of EVA per exploration site) and Table 1, p. 8.
- Waligora, J. M., Horrigan, D. J. (1975), "Metabolism and Heat Dissipation During Apollo EVA Periods", ch. 4 in *Biomedical Results of Apollo*, NASA SP-368 (NTRS 19760005584), Table 4, p. 125: Apollo 14 walking rates and net slopes, used only to show that no slope factor can be derived (DECISIONS REG-01 / V-06).
- NASA, "Images and Media" usage guidelines, `https://www.nasa.gov/nasa-brand-center/images-and-media/`, read 14 Nov 2026 (terms for the D6 images; DECISIONS IMG-01).
- **Verification sources (REG-02), read only to check values; none adds a number to the app:**
  - NASA/JPL Solar System Dynamics, Horizons System, API 1.2 (ephemeris DE441), `https://ssd.jpl.nasa.gov/api/horizons.api`, queried 15 Nov 2026: sun elevation at the site, as an independent check of the Mars24 method.
  - NASA GISS, Mars24 Sunclock 8.3.1 (application), `https://www.giss.nasa.gov/tools/mars24/`, run by a team member 15 Nov 2026 for the third AC-09 date (`docs/data/ac-09-mars24-third-date.png`).
  - IERS, Bulletin C 72, 6 July 2026, `https://datacenter.iers.org/data/latestVersion/bulletinC.txt` (no leap second at the end of December 2026).
  - PROJ (OSGeo, MIT licence), IAU 2015 coordinate system table, `https://raw.githubusercontent.com/OSGeo/PROJ/master/data/sql/iau.sql` (Mars radii for IAU_2015:49900 and 49902).
  - NASA Science, "Curiosity Science Instruments", `https://science.nasa.gov/mission/msl-curiosity/science-instruments/` (RAD is on the rover deck); NASA/JPL-Caltech, PIA11438, "Wheels and Suspension on Mars Science Laboratory Rover", caption (deck 1.1 m above the ground); PDS Geosciences Node, Analyst's Notebook, "MSL instrument host (Curiosity rover)".
  - NASA, MSL weather page script, `https://mars.nasa.gov/js/general/weather/msl-weather.js` (the D7 feed's temperatures are degrees C).
  - Gernhardt, M. L., Norcross, J. R., Vos, J. R. (2008), "Integrated Suit Test 1 - A Study to Evaluate Effects of Suit Weight, Pressure, and Kinematics on Human Performance During Lunar Ambulation", SAE paper 2008-01-1951 (NTRS 20080013604), Table 2, p. 3.
  - NASA/JPL, *Mars Science Laboratory Landing* press kit, July 2012, `https://www.jpl.nasa.gov/news/press_kits/MSLLanding.pdf` (read for the rover's dimensions; it gives no deck height).

### Software

The full inventory is `docs/licences.md`, generated by `scripts/licences.py` from `package-lock.json`, the installed
`node_modules` and the pipeline virtualenv, and checked for staleness by `pipeline/tests/test_licences.py`.

- **Production (shipped in the app bundle or installed with it), 31 packages:** react 19.3.1, react-dom 19.3.1 and
  scheduler 0.28.0 (MIT); ol 10.11.0 (BSD-2-Clause) and its dependencies; comlink 4.4.2 (Apache-2.0); d3-contour
  4.0.3, d3-array 3.2.5, internmap 2.0.3 (ISC); zod 4.6.7 (MIT). All 31 carry MIT, ISC, BSD-2/3-Clause, Apache-2.0,
  Zlib or CC0-1.0 licences; geotiff and its codecs are installed by ol but not imported by the app (S-04).
- **Development only (never shipped), 99 lockfile entries:** including vite 8.3.7, vitest 5.1.0, typescript 7.0.2,
  @playwright/test 1.65.0 (Apache-2.0), and **@axe-core/playwright 4.14.0 under MPL-2.0** (test-time accessibility
  checks only). 49 of the 99 are platform-specific optional binaries not installed on the build machine.
- **Pipeline (run once to prepare data, not shipped):** Python 3.11.18; rasterio 1.4.4 (metadata: "BSD License"),
  numpy 2.4.6 (BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0), affine 3.0.1 (BSD-3-Clause), pytest 9.2.0 (MIT)
  and their dependencies, 14 distributions plus pip and setuptools (virtualenv tooling; setuptools states no licence
  in its metadata).
- **Native libraries bundled in the pipeline wheels (31):** for example GDAL 3.10.3, PROJ, GEOS, HDF5, netCDF, libtiff,
  libcurl and OpenSSL inside the rasterio wheel, and OpenBLAS and the GCC runtime inside the numpy wheel. The wheels
  ship no per-library licence texts, so these licences are **not yet verified** and must be checked against each
  upstream project before submission.

- **Fonts (UI-13):** Fraunces, Barlow Semi Condensed and VT323 (SIL Open Font
  License 1.1), from `@fontsource-variable/fraunces` 5.3.0, `@fontsource/barlow-semi-condensed` 5.3.0 and
  `@fontsource/vt323` 5.3.0, bundled and served with the app. (They replace IBM Plex Sans and Mono, DECISIONS S-02, S-06.)
- **Interface libraries:** `motion` 14.11.1 (MIT) and `lucide-react` 1.73.0 (ISC).
  Anime.js was removed (MOT-04). Bundle check: `npm run build && node scripts/bundle-size.mjs` (AC-12, 250 kB).

Images: the map and card images are rendered from D1 and D2 by the pipeline; no other images are used.

## Licence

MIT (see `LICENSE`).
