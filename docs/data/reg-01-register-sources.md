# REG-01: sources for the placeholder register (V-01..V-14)

SI-assisted: drafted with Claude Code (Claude Fable 5.2) at a team member's direction, Sat 14 Nov 2026, about
23:10-23:59 Asia/Manila. Human Data and Science review pending.

This record holds the evidence behind DECISIONS REG-01. Every quotation below was read in the PDF itself in this
session (text extracted with `pdftotext -layout`; the Apollo table was read from a rendered page image). Page numbers
are the documents' own printed page numbers. Nothing here is a measurement made by this project.

**Wording rule.** The values are cited to documents by number. The app and the submission must not say "according to
NASA", "official NASA value" or anything that implies NASA reviewed or endorsed SharpWalk (see section 6).

## 1. Documents read

All retrieved Sat 14 Nov 2026, 15:14-15:20 UTC.

| Short name | Document | URL | sha256 of the file read |
|---|---|---|---|
| CONOPS | NASA, *Exploration EVA System Concept of Operations*, EVA-EXP-0042, Revision B, effective 19 Oct 2020, 175 pp. NTRS 20205008200 (public) | `https://www.nasa.gov/wp-content/uploads/2017/02/eva-exp-0042_xeva_system_con_ops_rev_b_final_dtd_10192020_ref_doc.pdf` | `9ed1212edd0e3ec91cd5866795955fc9f36d0028d4dc64d9b0bee9a40cdb8b48` |
| SUMMARY | Coan, D., *Exploration EVA System Concept of Operations Summary for Artemis Phase 1 Lunar Surface Mission*, EVA-EXP-0075, presentation, EVA Exploration Workshop, 18 Feb 2020, 35 slides. NTRS 20200001071 (public) | `https://ntrs.nasa.gov/api/citations/20200001071/downloads/20200001071.pdf` | `4828748e9d37f58c2df350e0f33905b0d3c0b49e921ee66b17deebe8e3fd4513` |
| TM | Chappell, S. P., Norcross, J. R., Abercromby, A. F., Gernhardt, M. L., *Life Sciences Implications of Lunar Surface Operations*, NASA/TM-2010-216138, Nov 2010. NTRS 20110001417 (public) | `https://ntrs.nasa.gov/api/citations/20110001417/downloads/20110001417.pdf` | `51c44d9df150d6d6ce278c543f297680460a37404b6c83a97bd264a2cbf5cca0` |
| SP-368 | Waligora, J. M., Horrigan, D. J., "Metabolism and Heat Dissipation During Apollo EVA Periods", chapter 4 in *Biomedical Results of Apollo*, NASA SP-368, 1975. NTRS 19760005584 (public) | `https://ntrs.nasa.gov/api/citations/19760005584/downloads/19760005584.pdf` | `865a9ee88db57e67896bbee3e3e9298828670075920a124ea8e35216a767e8af` |
| MEDIA | NASA, "Images and Media" usage guidelines (web page) | `https://www.nasa.gov/nasa-brand-center/images-and-media/` | page text, not a fixed file |

Why these: CONOPS is the agency's own planning baseline for surface EVA. It is a lunar (Artemis) document. Its only
statement about Mars is: "EVAs on Mars are still in work, but will likely have at least the frequency and duration of
those for the sustained lunar missions in Artemis Phase 2" (4.1.4.4, p. 30). So every value taken from it is a
**lunar planning figure applied to Mars** and stays **Assumed** in the app, as plan 6.6 classes these inputs.

## 2. Plan times (V-01 to V-04)

| Row | Value | Quotation | Where |
|---|---|---|---|
| V-01 T_EVA | **360 min** (was 240) | "The xEVA suit will support EVAs of up to 8 hours in duration (6±2 hours)." "EVAs will be between 4 and 8 hours in length (6±2 hours)." | CONOPS 4.1.4 and 4.1.4.3, p. 29 |
| | | Design reference EVAs 1-4: "6 hours (egress to ingress)" | SUMMARY slide 31 |
| V-02 t_ops | **60 min** (was 30) | EVAs "two to eight hours in duration (hour for egress/ingress and 1.5 - 7.5 hours of tasks)" | CONOPS 4.1.4.3.2, p. 30 |
| V-03 t_cont | **60 min** (was 30) | "EVAs may extend an additional hour for emergency and off-nominal situations." | CONOPS 4.1.4.3.2, p. 30 |
| | | "an additional 1 hour of secondary/backup O2 for off-nominal operations"; "plus one hour of contingency consumables. The additional hour allows the EVA crewmember to be approximately within an hour's walk from their safe haven" | CONOPS 4.2.1.1, p. 36; 9.1.2, p. 124 |
| V-04 stop | **45 min** (unchanged, now cited) | Table 2: "10 min EVA egress / 45 min EVA / 10 min EVA ingress". Table 3: "On average, up to 4 EVAs of 45 min duration each may be performed per day" at each exploration objective | TM Tables 2-3, p. 12 |
| | | Field-test traverse plan: Station 1 0:45, Station 2 0:45, Station 3 0:20, Station 4 0:20, Station 5 0:30 | TM Table 1, p. 8 |

Reasoning and limits:

- **T_EVA 360 min** is the centre of the 6±2 h range and matches the four 6-hour design reference EVAs. The old
  240 min was the bottom of that range. T_EVA is the planned time from egress to ingress, so egress and ingress time
  belong inside it, as plan 6.6 deducts t_ops inside T_EVA.
- **t_ops 60 min.** The TM's 10 + 10 min is for suit-port egress from a pressurised rover. SharpWalk's walk starts
  at a habitat hatch, which CONOPS budgets at one hour for egress and ingress together. Plan 6.6 defines t_ops as
  "egress, ingress, equipment handling"; CONOPS 7.2.7 (p. 95) puts equipment set-up in the same egress phase.
- **t_cont 60 min.** CONOPS allows one *extra* hour beyond the planned EVA. SharpWalk holds the hour *inside* T_EVA
  (plan 6.6: "the contingency is the only buffer and is already inside the formula"), which is the stricter reading.
  It is a time allowance only. It is **not** a life-support budget: suit life support stays "not modelled".
- **Stop 45 min.** The TM's figure is 45 min of boots-on-surface EVA at one exploration site.
- Effect on the demo stop (e2e stop, 1.97 km from the habitat): end margin est. 92.3 to 127.2 min, OK (was est.
  32.3 to 67.2 min, OK). The OK threshold is 10 % of T_EVA = 36 min.

## 3. Scenario time (V-05): kept, no source can give it

A scenario date is an input, not a fact, so no document can supply it (plan 19.11 weakness 27: "an Assumed input").
Kept at 2026-11-15 12:00 UTC. Check with the app's own D10 Mars24 implementation at the area centre (4.8719 S
planetographic, 222.61 W), run in this session:

| Minutes after start | LMST (clock label) | Sun elevation |
|---|---|---|
| 0 | 9.47 | 43.5 deg |
| 180 | 12.39 | 75.7 deg |
| 360 (end of T_EVA) | 15.31 | 44.7 deg |
| 420 (plus the off-nominal hour) | 16.28 | 30.7 deg |

The 6 h EVA sits almost evenly about local noon and stays in daylight (terrain shadowing is not modelled). CONOPS
4.1.4.3 (p. 29) says EVA duration "will also take into account a number of factors, such as lighting and the time of
year", which is the reason a daylight window is the sensible scenario.

## 4. Slope: the 20 deg limit (resolved) and the slope factors k_v (V-06, kept)

**20 deg limit: citation resolved.** "Walking up/down/across a slope of up to 20° [Note: Apollo 15 traversed on
slopes of ~17°]", listed under the xEVA System's key mobility capabilities for Artemis Phase 1: CONOPS 4.2.1.3,
p. 38. The "NASA presentation" the plan names is SUMMARY, slide 6: "Walking up/down/across a slope of up to 20° and
on traverses of up to 2 km away from the lander". It is a design capability of a lunar suit system, not a measured
human limit and not a Mars figure: still Assumed.

**k_v: no sourced value exists.** Three checks:

1. CONOPS plans walking at "an ~2 km/hr walking pace over relatively level regolith" and states: "This does not
   account for slope or obstacles (e.g., boulders)" (4.2.1.3.1.1, p. 40; the figure carries "[TBR-EVA-EXP-0042-001]",
   to be resolved). On harder terrain "crew may walk or scramble much less at significantly slower speeds, though
   exact total distances are still being determined" (7.2.8.1, p. 95). No factor is given.
2. NASA/TP-2010-216125 fixed speed by protocol, so it gives no speed-versus-slope relation (plan 19.5; not re-read
   in this session).
3. SP-368 Table 4, p. 125, "Metabolic Analyses of Apollo 14 EVA Traverses", is the only table found that lists
   walking rate beside slope. The 13 EVA-2 legs (72.8 min, 3,000 m; both totals reproduce the table's own):

| Leg | Duration (min) | Distance (m) | Net slope (%) | Rate (km/h) | Net slope (deg, our arithmetic) |
|---|---|---|---|---|---|
| LM to A | 7.4 | 193 | 2.6 | 1.56 | 1.5 |
| A to B | 7.8 | 185 | -2.7 | 1.42 | 1.5 |
| B to B1 | 7.2 | 319 | 4.7 | 2.65 | 2.7 |
| B1 to B2 | 5.1 | 145 | 10.3 | 1.71 | 5.9 |
| B2 to B3 | 14.4 | 399 | 11.3 | 1.66 | 6.4 |
| B3 to C' | 6.7 | 220 | 5.8 | 1.97 | 3.3 |
| C' to C1 | 1.4 | 86 | 3.5 | 3.69 | 2.0 |
| C1 to C2 | 5.6 | 240 | -13.8 | 2.57 | 7.9 |
| C2 to E | 6.0 | 480 | -9.4 | 4.8 | 5.4 |
| E to F | 3.9 | 292 | -3.4 | 4.49 | 1.9 |
| F to G | 1.8 | 172 | 0 | 5.7 | 0.0 |
| G to G1 | 2.5 | 110 | 4.5 | 2.64 | 2.6 |
| G1 to LM | 3.0 | 159 | -6.3 | 3.18 | 3.6 |

Pooled by the app's bins (our arithmetic, distance over time):

| Bin | Legs | Distance | Time | Rate | Uphill only | Downhill only |
|---|---|---|---|---|---|---|
| 0-5 deg | 9 | 1,736 m | 41.7 min | 2.50 km/h | 2.21 km/h | 2.60 km/h |
| 5-10 deg | 4 | 1,264 m | 31.1 min | 2.44 km/h | 1.67 km/h | 3.72 km/h |
| 10-15, 15-20 deg | 0 | - | - | no data | - | - |

What this does and does not show:

- The app uses one factor for uphill and downhill (plan 6.4). Pooled that way, the 5-10 deg legs are 0.98 of the
  0-5 deg rate: no measurable slowdown. Uphill legs were slower and downhill legs faster, which a single symmetric
  factor cannot express.
- The steepest leg is 7.9 deg. **Nothing covers 10-20 deg.**
- The source itself warns that the rate "varied with the terrain and the operational requirements of each traverse"
  (p. 124). These are net slopes over whole legs of one crew at lunar gravity, with stops and navigation inside the
  times. They are not a speed model, and deriving four factors from them would be inventing values.

**Decision recorded in REG-01:** k_v = 1 in every bin is kept as an Assumed team choice. It is consistent with the
only data found for the two lower bins and is unsupported, and probably optimistic, for 10-20 deg. The estimated
speed range (0.64-0.97 m/s) remains the only stated uncertainty on walking time.

**Finding for Data and Science (W-01, not changed):** CONOPS plans with about 2 km/h (0.56 m/s) on level regolith.
That is slower than the app's slow bound of 0.64 m/s (plan 19.5). The plan's speeds are unchanged here; the team may
want to widen the slow bound or say why not.

## 5. Other rows

- **V-07 habitat.** No document can site a scenario habitat. The point comes from plan 19.2 and the D1 slope screen
  (H-01). Consistency check only: the e2e demo stop is 1.97 km from it, inside the "2 km away from the lander"
  walking radius of CONOPS 4.2.1.3.1, p. 40.
- **V-08 rover images.** All three source files answer HTTP 200 as `image/jpeg` on NASA's raw image server
  (`mars.nasa.gov/msl-raw-images/...`, checked 15:26 UTC; sizes 658,107, 646,186 and 567,035 bytes). The blog posts
  used as terrain evidence are on `science.nasa.gov`, which this session could not reach; that evidence stands as
  recorded by the earlier session (C-22) and was not re-checked. Image-use terms: section 6.
- **V-12 observer height.** No source for RAD's reference height was reached (`science.nasa.gov` blocked; the two
  journal papers need full-text access). The plan's own 0-2 m sweep stands: 20.73 to 16.51 %, all inside the ±3 pp
  band. R-13 stays open.
- **V-09, V-10, V-11, V-13, V-14.** Interface limits, display settings and method choices. No science source applies.

## 6. Image and media terms (V-08) and wording for an SI-assisted project

From MEDIA, read 14 Nov 2026:

- "NASA content – images, audio, video, and media files used in the rendition of 3-dimensional models ... –
  generally are not subject to copyright in the United States. You may use this material for educational or
  informational purposes, including photo collections, textbooks, public exhibits, computer graphical simulations
  and Internet Web pages."
- "NASA content used in a factual manner that does not imply endorsement may be used without needing explicit
  permission. NASA should be acknowledged as the source of the material."
- "The NASA Insignia, Logotype, identifiers, and imagery are not in the public domain."

SharpWalk's use fits: educational, factual, credited "NASA/JPL-Caltech", no logo, with the non-affiliation footer.
Not checked: JPL's own image use policy page (`www.jpl.nasa.gov`, not reachable from this session).

The same page has a section on SI. It says, for information put into SI models and products: "attribution of the
information directly to NASA is not permitted", "References like 'according to NASA' or similar are prohibited in SI
products", and "As a statement of fact, you can acknowledge your SI tool includes NASA source material, but do not
imply any review or permission was granted by NASA for its specific use." SharpWalk is not an SI model, but it is
SI-assisted, so the cautious reading is applied: cite documents by number, state facts, never write "according to
NASA". **The team should confirm this reading with the Local Lead (IMG-01).**

## 7. Not done

- NASA/TP-2010-216125 and the RAD papers were not read in this session.
- The RAD observer height (R-13) and the M12 page numbers stay unresolved.
- No value here has been reviewed by a team member yet.
