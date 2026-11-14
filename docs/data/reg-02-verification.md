# REG-02: verification of every register value, constant and citation

Carried out at the direction of Eugene Ibañez Jr. ("Yujin"), Sun 15 Nov 2026, 00:02-00:35 Asia/Manila.
SI-assisted: the source reading, the checks and this record were done with Claude Code (Claude Fable 5.2) at his
direction. The other team members have not reviewed it yet.

REG-01 (Sat 14 Nov, 23:59) replaced the placeholder values with cited ones. REG-02 is the check of that work and of
every other value the app shows or relies on. For each value it answers three questions:

1. **Verified:** is the value in the source, in the stated place?
2. **Cited:** is the citation complete and correct (document, section, page)?
3. **Appropriate:** is this source the right kind of support for a crewed walk on Mars?

**No value was changed.** Three citation texts in `src/constants/index.ts` were corrected, with tests. Value questions
that need a team decision are in section 6.

## 1. How each item was checked

- Each document was downloaded again from the URL on record and its sha256 compared with REG-01's.
- Each quotation was searched in the document's own text (`pdftotext -layout`), and the page read from the
  document's own printed page number. The Apollo table has no usable text layer; it was read from the page image.
- Numbers computed by the app were recomputed independently (section 4).
- Verdicts: **CONFIRMED** (found as cited), **CORRECTED** (found, but the citation or its description was wrong;
  now fixed), **NOT VERIFIED** (the source could not be read; reason given).

## 2. Documents

| Short name | Document | sha256 (first 16) | Same file as REG-01? |
|---|---|---|---|
| CONOPS | NASA, *Exploration EVA System Concept of Operations*, EVA-EXP-0042 Rev B, 19 Oct 2020, 175 pp. (NTRS 20205008200) | `9ed1212edd0e3ec9` | Yes |
| SUMMARY | Coan, D., EVA-EXP-0075 presentation, 18 Feb 2020, 36 pages in the file (NTRS 20200001071) | `4828748e9d37f58c` | Yes |
| TM | Chappell, Norcross, Abercromby, Gernhardt, *Life Sciences Implications of Lunar Surface Operations*, NASA/TM-2010-216138, Nov 2010 (NTRS 20110001417) | `51c44d9df150d6d6` | Yes |
| SP-368 | Waligora and Horrigan, ch. 4 of *Biomedical Results of Apollo*, NASA SP-368, 1975 (NTRS 19760005584) | `865a9ee88db57e67` | Yes |
| IST-2 | Norcross et al., *Metabolic Costs and Biomechanics of Inclined Ambulation and Exploration Tasks in a Planetary Suit*, NASA/TP-2010-216125 (NTRS 20110003409), 110 pages in the file | `df30098a43e3655c` | New: no earlier session opened it |
| GUO | Guo et al. (2021), *Geophysical Research Letters* 48(15), e2021GL093912, doi:10.1029/2021GL093912, 10 pp.; copy from the DLR repository, `https://elib.dlr.de/143278/` | `5837ef29126289c6` | New |
| LOEWE | Löwe et al. (2025), "Nowcasting Solar Energetic Particle Events for Mars Missions", arXiv:2502.02469v1, 4 Feb 2025 (manuscript submitted to *Space Weather*; no journal reference on arXiv) | `554c3594709a81ad` | New |
| NESC | Minow, Mertens, Parker et al. (2020), *Space Weather Architecture Options to Support Human and Robotic Deep Space Exploration*, NASA/TM-20205000837, NESC-RP-17-01215 (NTRS 20205000837), 55 pp. | `719e1b6f2a28268d` | New |
| MARS24 | NASA GISS, Mars24 "Algorithm and Worked Examples", updated 2025-01-07 | `7b84bff88ce73006` | Yes (same as the D10 record) |
| IERS | IERS Bulletin C 72, Paris, 6 July 2026, `https://datacenter.iers.org/data/latestVersion/bulletinC.txt` | page text | New |
| PROJ | PROJ database, IAU 2015 table, `https://raw.githubusercontent.com/OSGeo/PROJ/master/data/sql/iau.sql` | page text | New |
| MEDIA | NASA, "Images and Media" guidelines, `https://www.nasa.gov/nasa-brand-center/images-and-media/` | page text | Yes |
| JPL | JPL Image Use Policy, `https://www.jpl.nasa.gov/jpl-image-use-policy/` | page text | New: REG-01 could not reach it |

**Not read: Ehresmann et al. (2021), JGR Planets, doi:10.1029/2021JE006851.** The publisher refused automated access
(HTTP 403) and no repository copy was found. Only its abstract was read. See M12 in section 3.

## 3. Verdicts

### 3.1 Register V-01 to V-14

| Row | Value | Verified | Citation | Appropriate? |
|---|---|---|---|---|
| V-01 T_EVA | 360 min | **CONFIRMED.** "EVAs of up to 8 hours in duration (6±2 hours)", CONOPS 4.1.4, p. 29; repeated in 4.1.4.3 and 4.1.4.3.1, p. 29. Four "6 hours (egress to ingress)" EVAs, SUMMARY slide 31. | Correct | Yes, as Assumed. CONOPS has a Mars chapter (8.0, pp. 119-123) but it gives no duration. Its only Mars figure is 4.1.4.4, p. 30: Mars EVAs "will likely have at least the frequency and duration" of the sustained lunar missions. So a lunar figure is what this document itself points to. |
| V-02 t_ops | 60 min | **CONFIRMED.** "two to eight hours in duration (hour for egress/ingress and 1.5 - 7.5 hours of tasks)", CONOPS 4.1.4.3.2, p. 30. | Correct | Yes, as Assumed. **CORRECTED reasoning:** REG-01 called this "the habitat-hatch figure". It is not. The sentence opens "For Rover and EVA ops during a 42-day mission" and describes rover-based sustained missions. It is still the right figure, because 4.1.4.4 points Mars to exactly these sustained missions. The hour sits inside the EVA duration in the source, as plan 6.6 holds t_ops inside T_EVA. |
| V-03 t_cont | 60 min | **CONFIRMED.** "EVAs may extend an additional hour for emergency and off-nominal situations", CONOPS 4.1.4.3.2, p. 30; "an additional 1 hour of secondary/backup O2", 4.2.1.1, p. 36; "plus one hour of contingency consumables", 9.1.2, p. 124. | Correct | Yes. The source adds the hour after the EVA; the app holds it inside T_EVA, which is stricter. It stays a time allowance, not a life-support budget. |
| V-04 stop | 45 min | **CONFIRMED.** Table 2: EVA egress 10 min, EVA 45 min, EVA ingress 10 min. Table 3: "up to 4 EVAs of 45 min duration each may be performed per day". TM p. 12. | Correct | Acceptable as Assumed, with a limit: in the source 45 min is a whole short EVA from a pressurised rover at one site, not a stop inside a six-hour walk. Table 1, p. 8: the row order gives stations of 0:45, 0:45, 0:20, 0:20, 0:30, as REG-01 says, but the column alignment could not be confirmed from the text layer. Supporting evidence only. |
| V-05 scenario time | 2026-11-15 12:00 UTC | **CONFIRMED** by an independent calculation (section 4): 43.5, 75.7, 44.7 and 30.7 deg at 0, 180, 360 and 420 min. | n/a (input) | Yes. A scenario input; no source can give it. |
| V-06 k_v | 1 in all bins | **CONFIRMED** that no source gives a factor. CONOPS p. 40 and p. 95 as quoted. SP-368 Table 4, p. 125: all 13 legs match REG-01's table; totals 72.8 min and 3,000 m; pooled 2.50 and 2.44 km/h. IST-2 p. 5: each subject walked "at his lowest walking speed", so speed was fixed by protocol and no speed-versus-slope relation exists there. | **CORRECTED:** REG-01 says the walking-pace figure "carries [TBR-EVA-EXP-0042-001]". The tag is on the next paragraph (rover walk-back, "approximately 10 km when walking at a pace of 2 km/hr"), not on the walking-range sentence. | Kept as an Assumed team choice. Still unsupported, and probably optimistic, for 10-20 deg. Source note: the table prints a net slope of 5.8 % for leg B3 to C', while its own 15 m over 220 m gives 6.8 %. Either way the leg stays in the 0-5 deg bin. |
| V-07 habitat | 4.795211 S, 137.391845 E | Not a sourced value. "a walking traverse of up to 2 km away from the lander", CONOPS 4.2.1.3.1, p. 40: **CONFIRMED.** | Correct | Yes, as a scenario input. |
| V-08 rover images | sols 4602, 4628, 4650 | **CONFIRMED.** The three files answer HTTP 200 with 658,107, 646,186 and 567,035 bytes. All three blog posts were read (REG-01 could not): "the top of the ridge and the start of the main boxwork region" (sols 4602-4603); "A Ridge Stop in the Boxworks" (4627-4628); "in the midst of the boxwork campaign" (4649-4654). | MEDIA: all five quotations found word for word. JPL policy now read: images "may be used for any purpose without prior permission"; credit line "Courtesy NASA/JPL-Caltech"; no endorsement to be claimed; no NASA logo. | Yes. The app credits "NASA/JPL-Caltech" and uses no logo. The JPL page asks for "Courtesy NASA/JPL-Caltech"; Design may wish to match it. |
| V-09, V-10, V-14 | interface and display settings | n/a | n/a | Not science values. Unchanged. |
| V-11, V-13 | method choices | n/a | n/a | Method choices, stated in their records. Unchanged. |
| V-12 h_obs | 1 m | **NOT VERIFIED.** GUO does not give RAD's height. Ehresmann could not be read. | R-13 stays open | The 0-2 m sweep passes at every height, so the benchmark does not depend on it. |

### 3.2 Science constants (`src/constants/index.ts`)

| Constant | Value | Verified | Citation |
|---|---|---|---|
| sphereRadiusF1 | 3,396,190 m | **CONFIRMED.** PROJ IAU_2015:49900 "Mars (2015) - Sphere", semi-major 3396190. | Correct |
| ellipsoidEquatorialF2, ellipsoidPolarF2 | 3,396,190 m; 3,376,200 m | **CONFIRMED.** PROJ ellipsoid IAU_2015:49901 "Mars (2015)": 3396190 and 3376200; CRS 49902 "Mars (2015) / Ocentric" uses it. | Correct. The spatialreference.org pages answered 404 in this session; the PROJ table holds the same registry. |
| ttMinusUtc2017 | 69.184 s | **CONFIRMED.** MARS24 step A-4: 37.0 s plus 32.184 s. IERS Bulletin C 72: "NO leap second will be introduced at the end of December 2026"; UTC-TAI = -37 s "from 2017 January 1 ... until further notice". | Correct; valid for the scenario date |
| walkSpeedNominal | 0.83 m/s | **CONFIRMED.** "Average walking speed 3.0 km/h", basis "Apollo average of 2.9 km/h and lunar surface scenarios". TM Table 4, p. 13. | Correct |
| walkSpeedRange | 0.64-0.97 m/s | **CONFIRMED** as numbers: "Average from IST-1 for speeds of 2.3-3.5 km/h", TM Table 4, p. 13. **CORRECTED** as description: this is the treadmill speed window that the IST-1 averages were taken over, not a measured range of walking speeds. The pages for the test limits were wrong in part: six male subjects, p. 2; speed fixed by protocol, p. 5; 0.12-0.32 g, p. 10; speeds 0.56-0.97 m/s and grades 0-30 %, p. 70 (IST-2). | Fixed in code and tested |
| slopeLimit | 20 deg | **CONFIRMED.** "Walking up/down/across a slope of up to 20° [Note: Apollo 15 traversed on slopes of ~17°]", CONOPS 4.2.1.3, p. 38. Also SUMMARY slide 6. | Correct |
| skyObstructionM12 | 0.185 | **19 % CONFIRMED** in two places: Ehresmann abstract ("blocked out 19% of the surrounding sky view", sols 1456-1467); GUO sec. 4, p. 6 of 10 ("about 0.19 for the period of MB parking and about 0.10 averaged before the parking"). **0.37 pi (= 0.185) NOT VERIFIED:** it is in neither text read. | Page added for 19 %; the location stays UNRESOLVED for 0.37 pi, so the release check still lists it |
| drillWarningDefault | 1800 s | **CONFIRMED.** LOEWE abstract: "at least 30 minutes to avoid both peak radiation exposure and the majority of the cumulative dose". NESC R-1: "10-30 minutes lead time for warning"; R-3: "a minimum of 30 minutes of advance warning time for SEPs"; p. 49 of 55. | **CORRECTED:** the report's first author is Minow, not Parker, and it has a number (NASA/TM-20205000837). Fixed in code and tested. |

### 3.3 Other values and sources

| Item | Verified |
|---|---|
| Speed conversions | 2.3, 3.0 and 3.5 km/h are 0.639, 0.833 and 0.972 m/s. **CONFIRMED.** |
| Incline model limits (plan 19.5) | **CONFIRMED** in IST-2: pseudo R² 0.668, p. 70; coefficients "not reported", p. 79; 30 % grade is 16.7 deg, so the 15-20 deg bin is beyond every tested grade. The plan gives p. 84 for the suit-weight effect at grades of 20 % or more; it is on p. 83. |
| TP-2010-216115 (IST-1 report) | Not on NTRS (searched by number and title), as plan 19.5 says. Not read. |
| GUO figures (plan 6.8) | **CONFIRMED:** "(5 ± 1)%" dose-rate decrease; 12 % predicted downward-dose reduction; albedo "about 19% of the total surface dose"; obstruction from 3 deg "upto about 30°". Abstract p. 1; sec. 3-5, pp. 6-8. |
| M12 parking sols | **CONFIRMED.** GUO p. 4: drove close "On Sol 1455 (2016-09-08)", parked "for nearly 13 sols", "drove away from the butte on Sol 1468". Matches the AC-07 observer (waypoint after the sol 1455 drive). |
| AC-07 reference position (about 10 %) | **Resolved as not computable at one point.** GUO p. 6: before the parking "the rover was driving through the MB area"; the 10 % is "averaged for months before the parking" with a median angle filled in. It is not a rover position. "Not computed" is the right status. |
| D1, D2, D12 files | **CONFIRMED** on the USGS bucket: 3,868,256,546 bytes (9 Nov 2022); 1,030,625,379 bytes (25 Jul 2025); 11,384,463,908 bytes (9 Nov 2022). |
| D5 and D7 feeds | Both URLs answer HTTP 200. The REMS snapshot matches the live feed for sol 4995 (2026-08-25, L_s 341, -71 and -5, 777), which is still the newest sol in the feed. The feed's disclaimer reads as recorded. The feed still gives no units (REMS-01 stays open). |
| MEDIA, SI section | **CONFIRMED** word for word: "attribution of the information directly to NASA is not permitted"; "References like 'according to NASA' or similar are prohibited in SI products". IMG-01 stands. |

## 4. Recomputed numbers

**Sun (V-05, D10).** The Mars24 steps were written again from the GISS page in Python, apart from `src/engine/sun.ts`.
The page's coefficients were matched in its text. Results:

| Check | Published or recorded | This check |
|---|---|---|
| Worked example 1, zenith | 154.26182 deg | 154.26176 deg |
| Worked example 2 (Spirit), zenith | 151.93895 deg | 151.93960 deg (the same 0.00065 deg gap as SUN-02) |
| Planetographic latitude, west longitude | -4.8719 deg, 222.61 W | -4.8719 deg, 222.61 W |
| Scenario at 0, 180, 360, 420 min: local time | 9.47, 12.39, 15.31, 16.28 | 9.47, 12.39, 15.31, 16.28 |
| Same: sun elevation | 43.5, 75.7, 44.7, 30.7 deg | 43.5, 75.7, 44.7, 30.7 deg |
| L_s at 2026-11-14 04:00 UTC | 21.7 deg | 21.7 deg |

**Apollo 14 pooling (V-06).** Sums of the 13 legs: 72.8 min and 3,000 m. 0-5 deg: 1,736 m in 41.7 min, 2.50 km/h.
5-10 deg: 1,264 m in 31.1 min, 2.44 km/h. Slope conversions agree to 0.1 deg. All as REG-01 records.

**Demo margin.** REG-01 gives est. 92.3 to 127.2 min. The two ends imply walking times of 102.7 and 67.8 min, a
ratio of 1.515; the speed bounds give 0.97 / 0.64 = 1.516. The margin is consistent with plan 6.6.

## 5. What changed in the repository

| File | Change |
|---|---|
| `src/constants/index.ts` | `walkSpeedRange`: source wording and limitation (treadmill speed window; pages 2, 5, 10, 70). `drillWarningDefault`: documents named by number with the page. `skyObstructionM12`: page for the 19 % figure; still UNRESOLVED for 0.37 pi. **No value, unit or class changed.** |
| `src/constants/constants.test.ts` | Three tests for the corrected citations (written first; 3 failed, then 289 of 289 pass). |
| `README.md`, `CLAUDE.md`, `DECISIONS.md`, `PHASES.md`, `HANDOFF.md`, `SI_LOG.md` | Citation corrections and the REG-02 records. |

**Checks after the change** (a team member's Windows computer, Node 24.16.0; the repo pins 22.x): vitest 289 of 289;
`tsc --noEmit` clean; build main 208.36 kB gzip + worker 41,546 B = about 249.9 of 250 KB. Playwright: 50 of 50 with
`--workers=1`. Two default parallel runs on this 4-core computer gave 48 of 50 and 49 of 50, with different specs
failing each time; the specs from the first run pass when run alone. This is read as load on the machine, not
proven. pytest and the licence check were not run (no pipeline environment here; no pipeline file changed).

## 6. Open for the team (values not changed)

1. **Slow walking bound (W-01), now with a second source.** The app's slow bound is 0.64 m/s. CONOPS plans with
   2 km/h (0.56 m/s) on level ground, p. 40, and the incline tests ran as slow as 0.56 m/s (IST-2, p. 70). Widening
   the slow bound to 0.56 m/s would lower the demo's low margin from est. 92.3 min to about 77.6 min (our arithmetic:
   102.7 min of walking times 0.64 / 0.56). It would stay OK (threshold 36 min). The plan fixes the speeds, so this
   is a Data and Science decision.
2. **0.37 pi at M12.** A person should open the Ehresmann paper in a browser (it is free to read at
   `https://doi.org/10.1029/2021JE006851`) and record the sentence and page that give 0.37 pi, the 11 deg average
   and RAD's height. Until then the constant stays UNRESOLVED. The verified published figure is "about 0.19".
3. **k_v = 1 on 10-20 deg** is still an unsupported team choice. No source read in REG-01 or REG-02 can replace it.
4. **V-04** uses a figure for a whole short rover-based EVA as a stop duration. Acceptable as Assumed; the team may
   want the rationale to say so.
5. **The other three members** have not reviewed REG-01 or REG-02.

## 7. Not done

- Ehresmann et al. (2021) full text: not read (publisher refused automated access).
- NASA/TP-2010-216115 (IST-1): not available online; not read.
- TM Table 1, p. 8: column alignment not confirmed from a page image.
- D1, D2 and D12 headers were not re-read here (file sizes only); the 1.1 audit stands.
- Pipeline tests (pytest) were not run in this session: Python 3.11.18 and the pipeline packages are not installed on
  this machine, and no pipeline file changed.
