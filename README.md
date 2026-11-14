# SharpWalk

SharpWalk checks a planned crewed walk from a habitat to the Mount Sharp boxwork in Gale crater, Mars, against stated
assumptions, and shows the estimated time margins. It does **not** certify a safe return: every margin is an estimate
under stated assumptions, the route is slope-screened (not rock-free or validated), and suit life support is not
modelled.

Independent student project; not affiliated with or endorsed by NASA.

## Authorship and credits

SharpWalk's concept, challenge framing, solution direction, requirements and project plan belong to the **whole
four-member team** (DECISIONS G-01, restored by G-07). How the concept was formed is the team's account to give; it is
pending in `SI_LOG.md`.

Team: Patrick Ezekiel A. Arcilla, Christian Jesus Alcazar, Eugene Ibañez Jr. ("Yujin"), John Malubay. Recorded
contributions (from git history and the project logs; roles not yet recorded are marked as such):

| Member | Recorded contributions |
|---|---|
| Patrick Ezekiel A. Arcilla | Committed the team's project plan (`docs/plan`, on branch `claude/lucid-ptolemy-nz6qpw`); repository owner; starter instructions and shared logs; G0 scaffold and shared contracts (commits as `parcilla13`) |
| Eugene Ibañez Jr. (Yujin) | Directed and reviewed the Claude Code sessions of Sat 14 Nov 10:21-12:20 Asia/Manila (G0 review; data pipeline, geo, constants, route engine, leg and margin functions, AREA sheet part 1); merged PR parcilla13/Uptown-Func#1; governance decisions G-01 and G-02 |
| John Malubay | Directed the Claude Code session from Sat 14 Nov 12:57 Asia/Manila (engine worker, route and briefing, planned margin, field view, accessibility, tier-2 contours and drill, resilience, README); decisions G-05, K-01, G-06 (since superseded by G-07) and the instruction to apply the plan's defaults |
| Christian Jesus Alcazar | Directed the Claude Code session from Sat 14 Nov 18:29 Asia/Manila (pipeline reproducibility check RUN-01, merge of the branch work into `main`, G3 inputs); decisions G-07 and C-AGREE (session account; to be confirmed by the team) |

Code in this repository was drafted with SI assistance under these members' direction; see **SI use** below. SI is not
credited with the concept, the plan or any team decision.

## What it does

- **AREA sheet (2D):** a north-up map of a 3 x 3 km area at the boxwork (4.790-4.840 S, 137.365-137.415 E,
  planetocentric, east-positive) with the D2 orthophoto, a D1 hillshade and slope-screened terrain classes.
- **Route engine (Web Worker):** time-optimal A* routes on a 2 m grid of slope-screened cells (slope limit 20 deg,
  Assumed); leg lengths, climb and walking times as estimated ranges.
- **Planned margin:** time left in the planned EVA at every route point after walking, stops, tasks, the walk back and
  contingency (OK / NEAR LIMIT / OVER; there is no "safe" state). Plan times are Assumed inputs entered by the team.
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
| D10 - Mars24 algorithm (NASA GISS) | Computed at the area centre for the team's Assumed scenario time | Local mean solar time (clock label), solar longitude, sun elevation (terrain shadowing not modelled) |

Each record (product, URL, licence, CRS, vertical reference, resolution, checksum scope) is in
`public/area/provenance.json`, written by the pipeline and shown in the Sources panel.

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
  (directed by Eugene Ibañez Jr. from 10:21, and by John Malubay from 12:57). Claude Fable 5.2 was not used. The
  Superpowers workflow skill was loaded in the first session; it was not installed in the second, where its
  test-first and verify-before-done practice was followed by hand. In the second session a Claude Code web-fetch
  subagent was used twice to read NASA's Mars24 algorithm page; both attempts failed and nothing from them is used.
  A third session (Sat 14 Nov 15:19-17:31, from parcilla13's account) used the Superpowers test-driven-development
  skill and drafted the Conditions panel (Mars24 sun, REMS snapshot), the D1/D2 coverage outlines, the IBM Plex font
  loading, the 10 m elevation contours and the screen-pixel terrain hatch, with their tests and code reviews; it
  installed the GDAL command-line tools in its container to run gdal_contour. Details per task: `SI_LOG.md`.
- **What SI contributed:** drafted the data pipeline and its tests; the frame conversions and constants register;
  the route engine, margins and field-margin functions; the engine worker; the AREA sheet, console, profile, sources
  panel, briefing card and field view; accessibility and resilience tests; tier-2 contours and drill; this README and
  the log entries. It ran the test suites, code reviews (`/code-review`) and benchmarks, and read the plan to apply
  its rules. Each entry in `SI_LOG.md` names its files and commits.
- **What was retained and how it was checked:** the drafted code was kept after its tests passed (vitest, pytest,
  Playwright, typecheck, build) and after review findings were fixed or recorded in `DECISIONS.md`; human review of
  the code is still pending (no module owner has signed it off).
- **What people decided, not SI:** the concept and plan (the whole team); governance and scientific choices
  such as G-01/G-02 (Yujin), G-05, K-01 (the k_v = 1 placeholder), G-06 and applying the plan's defaults (John
  Malubay), G-07 and the contract agreement C-AGREE (Christian Jesus Alcazar). Local Lead approvals were not chosen by SI.
- **Values chosen by SI at a team member's direction (G3-01):** on Sat 14 Nov 2026 a team member asked the SI
  session to choose the G3 inputs the plan leaves open ("for g3 needed you choose"). The demonstration plan times
  (T_EVA 240 min, t_ops 30 min, t_cont 30 min, stop 45 min) and the scenario time (2026-11-15 12:00 UTC) were chosen
  by SI; each is shown as an Assumed value whose rationale says so, and each stays editable. The same delegation
  covered the stop name/tasks command design (C-19, option a) and the three Curiosity rover images (D6, C-22), which SI
  selected from NASA's raw image archive (not generated). See `DECISIONS.md` G3-01, C-19 and C-22.
- **Media:** no image, video or audio was generated by SI. The map and card images are rendered from NASA/USGS data.
- **Markers:** SI-assisted source files carry an `SI-assisted` header line; SI-assisted commits carry an
  `SI-assisted:` trailer.

## References

### Data and publications

- D1: USGS Astrogeology, *MSL Gale DEM Mosaic 1m v3*, `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif`. Use constraints: none; please credit the authors.
- D2: USGS Astrogeology, *MSL Gale HiRISE LRGB 78 quads (sharp) COG*, T. J. Parker and F. J. Calef III, `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif`. Use constraints: none; please credit the authors.
- Chappell, S. P., Norcross, J. R., Abercromby, A. F. *Life Sciences Implications of Lunar Surface Operations*. NASA/TM-2010-216138, Table 4, p. 13 (planning walking speed 0.83 m/s; suited range 0.64-0.97 m/s, lunar-gravity tests).
- NASA/TP-2010-216125, pp. 2-3, 10, 70-71, 79, 83-86 (limits of the suited-walking tests), as summarised in the team plan section 19.5.
- IAU 2015 Mars sphere (R = 3,396,190 m), as used by D1 and D2.
- Drill warning time (Assumed 30 min default): team plan section 6.9, informed by Loewe et al. 2025 (arXiv preprint) and the NESC assessment (Parker et al.).
- D7: Centro de Astrobiologia (CAB), MSL REMS weather summary feed, `https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json`, retrieved 2026-11-14T07:32:00Z. Provider's terms: "intended for outreach purposes only. Any other use is discouraged" (DECISIONS REMS-02).
- D5: NASA/JPL MMGIS, Curiosity (MSL) traverse and waypoints, `https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_traverse.json` and `MSL_waypoints.json`, retrieved 2026-11-14T11:32:31Z (sha256 in `docs/data/ac08-rover-path.json`). Used for the AC-08 consistency check only; localisation error unverified.
- D6: NASA/JPL-Caltech, Curiosity (MSL) raw images, Left Navigation Camera: NLB_806042016EDR_F1172490NCAM00259M_ (sol 4602), NLB_808343392EDR_F1180924NCAM00292M_ (sol 4628), NLB_810299631EDR_F1182304NCAM00271M_ (sol 4650), `https://mars.nasa.gov/msl/multimedia/raw-images/`; credit "NASA/JPL-Caltech"; raw, uncalibrated, downscaled to 480 px. Chosen by SI at a team member's direction (G3-01). Terrain evidence: NASA Curiosity blog posts for sols 4602-4603, 4627-4628 and 4649-4654 (`public/rover/images.json`). Use under the NASA/JPL image use guidelines with credit (team to confirm, DECISIONS C-22).
- D10: NASA GISS, Mars24 Sunclock "Algorithm and Worked Examples" (updated 2025-01-07), `https://www.giss.nasa.gov/tools/mars24/help/algorithm.html`; Allison, M., McEwen, M. (2000), Planet. Space Sci. 48, 215-235; Allison, M. (1997), Geophys. Res. Lett. 24, 1967-1970.
- xEVA 20 deg slope requirement (NASA presentation; title and slide still to be identified, see `src/constants`).

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

- **Fonts:** IBM Plex Sans and IBM Plex Mono (SIL Open Font License 1.1), from `@fontsource/ibm-plex-sans` 5.3.0 and
  `@fontsource/ibm-plex-mono` 5.3.0, bundled and served with the app (DECISIONS S-02, S-06).

Images: the map and card images are rendered from D1 and D2 by the pipeline; no other images are used.

## Licence

MIT (see `LICENSE`).
