# SharpWalk visual system: "Frosted terrain" (UI-07)

SI-assisted: drafted with Claude Code (Claude Opus 5.5) at a team member's direction, Sun 15 Nov 2026, on the
unmerged branch `design/sharpwalk-ui-ux`. **Pending team approval.**

This supersedes the "Geologic Folio" system (UI-02), which the operator rejected. The operator's direction was frosted glass and an immersive map, after the two reference images. Screenshots of every step: `docs/design/screenshots/` (desktop 1440 x 900, iPhone 13 width).

## Principles

- **The real terrain is the stage.** The D2 orthoimage under the D1 hillshade fills the screen on every step.
  - It is sharp behind the Welcome screen.
  - On Map, HUD and Assess it sits beside the panel, so no data hides under glass and every visible point can be clicked.
  - On Setup, Planner and Brief a blurred copy of the same image sits behind frosted pages. It is decoration, not data; no terrain is invented.
- **The interface is frosted glass**, translucent and blurred, with a hairline edge and a soft shadow.
- **One accent:** oxide, the colour of Martian iron oxide. It marks interaction and plan features (actions, the current step, stops) and never status.
- **Status** is always word + shape + colour, with Lucide shapes:
  - OK: circle-check, green;
  - NEAR LIMIT: triangle, amber;
  - OVER: octagon, red.
  - There is no SAFE state.
- **Type:**
  - Geist for everything.
  - Geist Mono only for coordinates and technical identifiers (plan hash, engine version).
  - Tabular figures for all numbers.
  - Italic only for estimates (CLAUDE.md).
- **Detail on demand:**
  - stop settings, layers, sources, the scenario time form and the card's legs, stops, assumptions and rover views all expand when asked;
  - each step shows one heading and one primary action.

## Tokens (`src/app/styles.css` `:root`)

| Group | Tokens |
|---|---|
| Colour | `--glass` rgba(20,17,15,.66), `--glass-strong`, `--glass-hi`/`-2` (fills), `--line`/`-2` (hairlines), `--text`/`-2`/`-3`, `--accent` #F0895C (text on glass), `--accent-fill` #B94C22 (filled controls; white text 5:1), `--ok` #5FD49C, `--near` #F5C451, `--over` #FF7A6E, `--paper`/`--paper-ink` (the card) |
| Type | `--font` Geist, `--mono` Geist Mono; scale 12 / 13 / 15 / 17 / 22 / 30 / 44 px, hero clamp(48-96 px) |
| Space | 4 px grid: `--s1` 4 ... `--s8` 64 |
| Radii | `--r-xs` 8, `--r-sm` 12, `--r-md` 16, `--r-lg` 24, `--r-pill` |
| Elevation | `--shadow-1`, `--shadow-2`; `--blur` blur(26px) saturate(150%) |
| Motion | `--ease-out` cubic-bezier(.23,1,.32,1), `--ease-in-out` (.77,0,.175,1), `--ease-drawer` (.32,.72,0,1) |
| Layout | `--top` 84, `--bottom` 46, `--gap` 16, `--panel` 404 px |

## Motion (MOT-02, after the emil-design-eng reference)

- **Interactive transitions:** CSS transitions, interruptible, of transform and opacity, under 300 ms with a strong ease-out.
- **Press feedback:** `scale(0.97)` on every button.
- **Hover:** only on devices with a fine pointer.
- **Entries:** use `@starting-style`, with no JavaScript mount state. Each step's panel or page settles in (opacity, an 8 px rise and a slight blur that masks the swap); the exit is instant.
- **No view transitions:** they were tried and dropped, because snapshotting the full-screen map canvas delayed input and pushed the STALE stamp past its 1 s criterion.
- **Feedback with a cause:**
  - a ring where a map click landed;
  - "Engine updating the plan" while a Command is with the engine, shown only after 120 ms so instant answers do not flash;
  - changed values settle through a short blur;
  - toasts; refusals stay on screen until the next message;
  - the stale and briefed stamps.
- **Reduced motion** keeps opacity and colour changes and removes movement, blur and loops.

## Briefing card (UI-09)

Decision first:
- the margin state and the remaining EVA margin;
- four tiles: return walk, distance, elevation gain and stops;
- the key terrain concern (largest climb, model-derived from D1, slope-screened only);
- the map;
- three critical limitations.

Below these, the legs, the stops with arrive/depart blanks, the assumptions with their sources and the rover views are expandable sections. All of them are opened for print.

Every summary value comes from the engine's plan: a sum of its legs or its own last-leg estimate. Nothing new is computed as science.

## Kept without change

- Quantities and their sources (AC-05);
- the estimate wording ("est. a to b min", italic);
- the SIMULATION banner;
- the field-margin provenance line;
- the footer on every view;
- the terrain symbology (plan 9.2 hatches);
- the engine, the contracts and the data.

## Dependencies added (licences verified with `npm view` and the installed package files)

All are exact pins with no install scripts.
- `lucide-react` 1.73.0: ISC; already named in the plan's stack.
- `@fontsource-variable/geist` 5.3.0: OFL-1.1.
- `@fontsource-variable/geist-mono` 5.3.0: OFL-1.1.

Removed: the Newsreader, Instrument Sans and DM Mono font packages.
