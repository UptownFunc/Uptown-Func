# SharpWalk visual system: "Bureau" (UI-13)

SI-assisted: drafted with Claude Code (Claude Opus 5.5) at a team member's direction, Sun 15 Nov 2026, on the
unmerged branch `design/sharpwalk-ui-ux`. **Pending team approval.**

This supersedes "Frosted terrain" (UI-07), which the operator called "still [SI] slop". The operator chose this
direction ("Warm 70s Bureau") from seven Higgsfield frames. The Marvel "Time Variance Authority" look was named as a
mood reference only: **no Marvel names, logos, characters or artwork are used**, and no generated image ships in the
app. Screenshots of every step: `docs/design/screenshots/` (desktop 1440 x 900, iPhone 13 width).

## The idea

SharpWalk is a planning office for one walk on Mars. The interface is that office in the 1970s: walnut panelling,
cream index cards and forms, chunky keys that travel when pressed, lamps that light, and a monitor. **The real
terrain is on the monitor**: the D2 orthoimage under the D1 hillshade, behind a CRT bezel with faint scanlines. The
machine speaks in amber phosphor; the people's paperwork is cream paper.

## Colour

| Token | Value | Use |
|---|---|---|
| Walnut | `#2B1A12` to `#1F130C` | The desk and wall; drawn panelling, no image |
| Cream paper | `#F8EEDB`, rules `#DCC7A0`, ink `#2A1A10` | Cards, forms, panels, the briefing card on screen |
| Burnt orange | `#D9622B` (`#A8401A` deep) | **The only interaction colour**: primary keys, the current step, stops, focus rings. Never status |
| Mustard | `#E0A526` | Decoration only: the supergraphic stripes, the Assumed tag |
| Amber phosphor | `#FFB347` on `#140B05` | The machine's voice: map hint, cursor tag, status line, counters, conditions readouts |
| Status lamps | OK `#6CCB5F`, NEAR LIMIT `#F4C430`, OVER `#FF5A46` | Always with the word and the shape (check, triangle, octagon). No SAFE state |

## Type (all SIL Open Font License 1.1, bundled from `@fontsource*` 5.3.0)

- **Fraunces** (variable, "soft" and "wonky" axes): headings, stop names, the big margin figure.
- **Barlow Semi Condensed**: the interface and body text; tabular figures for every number; italic only for estimates.
- **VT323**: machine readouts (coordinates, the cursor tag, counters, the CRT ticker). Equal-width digits (tested).

## Components

- **Masthead:** a walnut control strip. Step keys are cream keys with a lamp: dark when not visited, green when done,
  lit amber on the current step (the key is pressed down). Orientation and Sources keys on the right.
- **Keys:** plastic with a 4 px travel; press moves them down 3 px. Primary keys are burnt orange.
- **Index-card panels** (Map, HUD, Assess) and **forms** (Setup, Planner) on cream ruled paper with punch holes;
  the form number sits on an amber label ("Form 01 · Mission setup").
- **CRT:** the map, the conditions readouts, the HUD leg and margin boxes, and the budget bar are amber-on-black screens.
- **Chart recorder:** the elevation profile on orange graph paper.
- **Meter** (UI-14): the return margin as a moving-coil meter with word-labelled zones.
- **Case file:** the briefing card is a tabbed cream folder on screen and black on white in print (plan 9.2); a
  "Briefed" rubber stamp lands when the crew confirms.
- **Sticky memo** on the start page with the three limits (slope-screened not rock-free; margins are estimates; suit
  life support not modelled).

## Point and click (UI-11)

The tag under the cursor says, before the click, what the click will do: slope-screened ground takes a stop; steeper
than the Assumed 20 deg limit or unknown ground does not. A click on a stop opens its card on the map (time at the stop,
walk in, Rename, Move, Delete). Move arms the next map click; Esc cancels.

## Orientation (UI-12)

"Begin orientation" opens eight cards that walk through the real screens with a spotlight on each control. The app
stays usable under it; arrows and Esc work; it is remembered and can be reopened from the masthead.

## Motion (MOT-04)

- **Motion** 14.11.1 owns all scripted motion. `src/app/motion.tsx` (`Appear`): panel and screen enter, the tour cards
  and the toast (enter and exit under `AnimatePresence`). `src/app/fx.ts`: the CRT power-on on the start page, the tour
  spotlight glide, the meter needle swing, the stamp. Both use Motion's small `animate` (`motion/mini`, Web Animations
  API); the full `motion` component is not bundled. Anime.js is removed (it broke the CLAUDE.md rule and was not needed).
- **CSS:** key press and hover (gated to fine pointers), the drawer and Layers panel, the lamp blink while loading, the
  click ring, spinners. No endless decorative loops: the spotlight ring and the Orientation lamp are steady.
- One owner per element. Under `prefers-reduced-motion` nothing is animated and end states are set directly (tested).

## Print (PRINT-02)

A5 portrait, 12 mm margins, black on white. The demonstration card fits one page; the smallest text is 6 pt; the status
word prints dark on white; longer plans continue on a second page without cutting a row, a stop or a picture.

## Open

- Merged into `main` on the session operator's confirmation (MERGE-02). The other members' written review of the look (UI-01 to UI-16, MOT-04) is still to be recorded.
- A person should print the card on paper once, and try the phone layout in daylight.
- EL-01: the elevation grid is still requested by both the page and the engine worker (as on `main`).

## Final 2D map baseline (MAP-01..MAP-08, TOUR-01; Sun 15 Nov 2026)

- **Load view:** the whole 3 x 3 km sheet, habitat included, never closer than 4 m per pixel.
- **Map keys:** one column of cream keys at the lower right: Zoom in, Zoom out, then (set apart) Fit the route / Show
  the habitat and Show the whole sheet. Glides 220-420 ms ease-out; none under reduced motion.
- **Layers panel:** opaque amber-on-black. One row per layer (switch, swatch, source line), the strength slider, the
  Tier 2 switches, then the map key, whose terrain swatches are drawn from the layer's own tiles.
- **Marks:** habitat diamond with the word HABITAT; one paper chevron per leg on the route; stops unchanged.
- **Messages:** on wide windows the engine message sits under the hint row at the sheet's left; on phones it docks at
  the bottom. Loading and errors are shown inside the sheet.
- **Tour:** a Start over key in the card head; the progress bar's segments jump to their card.
