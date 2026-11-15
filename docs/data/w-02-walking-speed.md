# W-02: which slow walking bound is best supported (Sun 15 Nov 2026, about 17:55-18:15 Asia/Manila)

SI-assisted: Claude Code (Claude Opus 5.5) did the reading and the arithmetic at the direction of this cloud session's
operator, a team member ("check what is best and merge ... note that and citation why that is best speed ... do
research make sure it is logged"). The choice it supports was first made in W-01 (PR #22, Yujin's session). This
record re-reads the sources and confirms the choice; it does not originate a new value.

Documents are cited by number. Nothing here implies that NASA reviewed or endorsed SharpWalk (IMG-01).

## 1. The question

The app judges OK / NEAR LIMIT / OVER at the **slow** walking bound. Plan 19.5 set the range to 0.64-0.97 m/s
(the IST-1 treadmill window, NASA/TM-2010-216138, Table 4, p. 13). PR #22 proposed lowering the slow bound to
0.56 m/s. Which slow bound do the sources best support?

## 2. Sources read in this session

| Source | Where it was read | SHA-256 (first 16) | What it says (verbatim where quoted) |
|---|---|---|---|
| EVA-EXP-0042 Rev B, *Exploration EVA System Concept of Operations*, 19 Oct 2020 | nasa.gov PDF, `eva-exp-0042_xeva_system_con_ops_rev_b_final_dtd_10192020_ref_doc.pdf`, page 40 of the file | `9ed1212edd0e3ec9` | 4.2.1.3.1.1, p. 40: "Traverses assume an ~2 km/hr walking pace over relatively level regolith, yielding a walking distance of 2 km away from the lander (safe haven) ... This does not account for slope or obstacles (e.g., boulders), so distances may decrease due to terrain or operational considerations." The same 2 km/h is used for the rover walk-back (p. 40, "[TBR-EVA-EXP-0042-001]") and in 7.2.8.1: "16 km on level terrain at 2 km/hr, but for more challenging terrain, crew may walk or scramble much less at significantly slower speeds". |
| NASA/TP-2010-216125, Norcross et al., *Metabolic Costs and Biomechanics of Inclined Ambulation and Exploration Tasks in a Planetary Suit* (NTRS 20110003409) | NTRS PDF, page 70 (file page 85) | `df30098a43e3655c` (same file as REG-02) | p. 70: "Speeds used for this testing ranged from 0.56 to 0.97 m•s-1, and inclines ranged from 0% to 30%." Sec. 2.3.1: each subject walked "at his lowest walking speed ... the PTS minus 0.7 m•s-1". |
| NASA SP-368, ch. 4, Waligora and Horrigan, Table 4, p. 125 (Apollo 14 EVA-2 legs) | Not re-downloaded; values from the team's REG-01 table (`docs/data/reg-01-register-sources.md`, checked again in REG-02) | `865a9ee88db57e67` (REG-01) | 13 measured walking legs. Whole traverse 3,000 m in 72.8 min (about 2.47 km/h, 0.69 m/s). Uphill legs 1.42-1.71 km/h (0.39-0.48 m/s). |
| Apollo Lunar Surface Journal, "Apollo 11 gaits" commentary (nasa.gov ALSJ) | Web page | - | Apollo planners assumed "3.6 kph average speed ... for an hour-long walkback from a failed Rover, or the 2.7 kph average speed assumed for walkbacks of over an hour." Commentary, not a planning document; used for context only. |

Searched and **not found**: any measured walking speed for a suited crew at Mars gravity (3/8 g). NASA's partial-gravity
work tested 3/8 g for metabolic cost and the 10 km walk-back (search results: NTRS 20110008554 and the EVA Walkback
Test), but no source read here gives a suited Mars-gravity walking speed. So every option below is a lunar figure applied
to Mars and stays Estimated, not Mars-validated.

## 3. Options compared

| Slow bound | Basis | For | Against |
|---|---|---|---|
| 0.64 m/s (plan 19.5) | Bottom of the IST-1 treadmill window, 2.3 km/h | The plan's own value | Faster than the 2 km/h pace of the document that gives the app's T_EVA, t_ops and t_cont, so the app would use that document's time budget with a walking pace it does not plan with. A treadmill speed window, not a measured slow walking speed (REG-02). |
| **0.56 m/s (W-01)** | 2 km/h planning pace, EVA-EXP-0042 Rev B p. 40; also the lowest speed in the suited incline tests, NASA/TP-2010-216125 p. 70 | Two independent documents give the same number. It is the pace the time budget's own document plans with. Slower than the Apollo 14 whole-traverse average (0.69 m/s), so it is a cautious bound for a whole walk. | Level-ground figure. Apollo 14 uphill legs were slower. |
| about 0.46 m/s | Apollo 14 uphill legs only (SP-368 Table 4) | Measured on a real traverse | Uses only the slowest part of one traverse as the bound for the whole walk, which the same table contradicts (whole traverse 0.69 m/s, downhill legs faster). Slope belongs in the slope factors, which no source supplies (V-06); putting it into the speed bound would double-count once a factor is sourced. |

## 4. Result

**0.56 m/s is the best-supported slow bound.** It is the only value that two separate documents give, it is the pace
the app's time-budget source plans with, and it is cautious against the one measured lunar traverse taken as a whole.
The fast bound (0.97 m/s) and the nominal speed (0.83 m/s) are unchanged.

Limits that stay on the screen and in `src/constants`:

- Lunar sources, not Mars-validated; no suited Mars-gravity speed exists in the sources read.
- On climbs the bound may still be optimistic: Apollo 14 uphill legs ran at 0.39-0.48 m/s, and the slope factors stay 1
  (V-06, ASSUMED banner).

## 5. Effect (our arithmetic)

The slow-bound walking time grows by 0.64 / 0.56 = 1.143. For the route in the member's screenshot this session
(4.92 km, two 45 min stops, T_EVA 360 min, t_ops 60, t_cont 60), the slow-bound end margin falls from est. 21.9 min to
about 3.6 min. The state is NEAR LIMIT either way. The fast end (65.5 min) is unchanged.
