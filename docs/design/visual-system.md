# SharpWalk visual system: "Geologic Folio, interactive edition"

SI-assisted: drafted with Claude Code (Claude Opus 5.5) at a team member's direction, Sun 15 Nov 2026, on the isolated
branch `design/sharpwalk-ui-ux`. **Pending team approval. Not merged; no PR.**

## Status and authority

This document revises the **visual-design sections of the SharpWalk plan**:
- 9.1 Tokens;
- the look of 9.2, 9.4 and 9.5;
- the "not used" list before 9.1;
- the CLAUDE.md "Visual system" line.

The session operator authorised the revision in writing on Sun 15 Nov 2026 (about 01:30 Asia/Manila): "You are authorized to replace the existing visual system, including: color palette and design tokens, typography and type scale, layout, composition and spacing, navigation and information architecture, panels, surfaces and component styling, map presentation and HUD, iconography, imagery and motion language. You may revise the corresponding visual-design sections of the SharpWalk plan. The previous graphite/bone/burgundy direction is NOT mandatory."

**Scope.** It changes how SharpWalk looks and how a user moves through it. It does **not** change:
- any science value, the route engine or the contracts;
- data provenance or the acceptance criteria.

The rules below under "Kept without change" still bind. The operator is one team member, so the other members must confirm the revision (DECISIONS UI-02) before it reaches `main`.

## 1. Audit: what the old interface did and what is discarded

The `main` interface (graphite housing, 340 px console) put every function on one screen at once.

| Discarded | Why |
|---|---|
| One static screen with three tabs (Planning / Briefing / Field View) | Everything competed at once; no sense of a sequence from setup to briefing |
| A 340 px console stacking every panel: K-01 banner, stops, legs, margin, Conditions, Rover, Tier 2 toggles, Sources, four plan-time forms | Too many simultaneous elements; the most important number (the margin) sat mid-scroll |
| Graphite housing, bone panels, burgundy as the only accent | Read as a generic dark dashboard; burgundy on graphite gave little contrast for interaction |
| IBM Plex Sans and Mono at 12-13 px throughout | Uniform small type; no hierarchy between a headline, a readout and a label |
| Always-open layer legend over the map's top-left corner | Long text over the hero surface |
| Status line and profile as strips stacked under the map | Read as chrome, not as part of the map sheet |
| Briefing and Field View as paper overlays dropped over the whole well | No transition, no relation to the map |
| No motion of any kind, and no feedback on a map click until the engine answered | Interaction felt dead; a refused click looked like no click |

**Kept from the old interface:**
- every function, every testid and label used by the acceptance tests;
- the engine command flow and the map symbology (plan 9.2 hatch, cross-hatch and stipple);
- the A5 print layout of the card.

## 2. Exploration (Higgsfield, gpt_image_2_6, 18 frames)

Generated images were used **only to explore composition and tone**. None is shipped, and none is data. Their numbers, place names and terrain are invented; the app shows only the real D1/D2 layers. The job ids are kept here so the team can see them in the Higgsfield account.

**Round 0** (3 frames; 4c1ae691, 87074eae, 07b28da9) explored graphite, bone and burgundy variations. The operator rejected the round as "too similar to the existing SharpWalk interface", and these frames were not used.

**Round 1:** four directions, two screens each, composed from a blank brief (no screenshots of the app).

| Direction | Frames | Read |
|---|---|---|
| A. Terra Atlas: pale mineral canvas, one large rounded terrain frame, cobalt pill buttons, docked timeline | 61b4907f, a5dbdca0 | Handsome and calm; close to reference 1. Risk: reads as a generic consumer product; the pill-button language says "SaaS". |
| B. Night Survey: near-black, telemetry header, icon rail, vermilion accent | a37e06cf, 35d973c4 | Strong mission-control feel; close to reference 2. Risk: the stock "space interface"; dense (the clutter problem again); vermilion clashes with amber/red status. |
| C. Geologic Folio: paper, ink, the map as a printed plate with graticule, contour linework and hatching, serif display | bd77df0f, c98af470 | Most distinctive and most honest: SharpWalk's real layers (hillshade, D1 contours, hatched steep ground) already are geologic-plate symbology. Risk: could feel static unless motion carries it. Red accent clashes with OVER. |
| D. Monolith: cinematic full-bleed oblique terrain, film-title type, oxblood bottom sheet | c53e5ec1, 76732bc9 | Beautiful; the margin screen (one huge figure, a time budget bar) is excellent. Risk: depends on oblique photoreal terrain SharpWalk does not have (D2 is top-down grayscale), so the product would never look like the concept. Oxblood is close to the old burgundy. |

**Decision.** C is the base, taking:
- D's single large margin figure and time budget bar;
- B's arm's-length field readouts;
- A's progressive disclosure (details on demand) and its docked column.

The accent moved from red to **cobalt survey ink** so it can never be read as status.

**Round 2:** the chosen direction was rendered across all seven screens to test the composition (7a73f045 Welcome, de484202 Setup, 97b587f3 Planner, 48f6e09a Map, 310e62f0 HUD, b4d74721 Assess, 9ca7d9de Brief). These frames guided the layout of each screen in the build.

## 3. The system

### 3.1 Tokens (`src/app/styles.css` `:root`)

| Token | Value | Meaning |
|---|---|---|
| paper | #F2EEE6 | Page and side columns |
| desk | #E7E1D4 | The Brief step's desk, under the card |
| sheet | #FBF9F4 | Raised paper: plate collar, chips, inputs, drawer |
| ink | #14130F | Primary text, rules, frames |
| ink-2 / ink-3 | #47433B / #635D51 | Secondary text / tertiary labels (both pass 4.5:1 on paper) |
| rule / rule-2 | #D6CFC0 / #B3AA97 | Hairlines; decorative only, never the only sign of interaction |
| cobalt | #2340D8 (deep #182C9C, wash #E2E6FA) | **Interaction only**: the primary action, the current step, focus, selection, the route line, the confirmation stamp |
| ok | #17673F, check | Status OK |
| near | #8A5600 text, #E3A21A triangle | Status NEAR LIMIT |
| over | #B42318, octagon | Status OVER |

**Status rules:**
- Status is always word + shape + colour.
- Cobalt never means status, and status colours never mean interaction.

### 3.2 Type (UI-03: replaces IBM Plex)

| Face | Use |
|---|---|
| **Newsreader** (variable: optical size and weight) | Display headings, stop names, key readouts. **Estimates are set in Newsreader italic everywhere**, so "est." ranges read as estimates at a glance (the CLAUDE.md italic rule, made a signature). |
| **Instrument Sans** (variable weight) | Interface text and controls |
| **DM Mono** | Labels, coordinates, tables, step numbers. Monospaced, so figures are tabular. |

All three come from Fontsource packages (5.3.0, OFL-1.1): no install scripts, no dependencies, served from the app's origin.

### 3.3 Layout and information architecture (UI-01)

The flow: **Welcome → 01 Setup → 02 Planner → 03 Map → 04 HUD → 05 Assess → 06 Brief**.

The step lives in the URL hash, so Back works and a step can be linked. The masthead carries:
- the wordmark;
- the numbered step index (its cobalt underline marks the current step);
- the Sources drawer button.

The colophon carries the footer and the plan version stamp.

| Step | Purpose | What is on screen |
|---|---|---|
| Welcome | Say what the tool is and is not | Title page; Plate I (the real D2 orthoimage under the D1 hillshade, the sheet's own files); the three limits; one action |
| 01 Setup | Fix the inputs not chosen on the map | Scenario tiles (Demonstration = REG-01 values sent as Commands; Blank = `?preset=none`); scenario time (change on demand); Mars24 sun values; REMS context; rover views |
| 02 Planner | Set the time budget | T_EVA as a ruler divided into tasks, contingency and stops, with the rest hatched "left for walking and margin" (proportions only, no invented numbers); the four Assumed inputs as a ruled table |
| 03 Map | Build the route | The plate (framed map, registration marks, hint, Layers panel, readout chip, scale, zoom) as the hero; the cross-section profile; the Route column (stops with details on demand, legs, live end margin) |
| 04 HUD | Carry the walk | Next event, leg heading and length, both field margins, the tick control, the provenance line; says whether the briefing was confirmed for this plan |
| 05 Assess | Judge the return margin | One large figure (the planned margin, an italic estimate range), the state, the caveat, the traverse ladder (legs and stops as Quantities), the simulated drill |
| 06 Brief | Confirm and print | The A5 card on the desk; the confirmation column (three acknowledgements, then "Confirm briefing", a screen-only stamp); any plan change lapses the confirmation and marks the card STALE |

**Mission state carries across every step:**
- the engine holds the plan;
- the map stays mounted and laid out;
- the field view and the card stay mounted;
- the confirmation is UI state only and is never written into MissionPlan or MissionExecution.

The map takes clicks only on step 03; on HUD and Assess it is view-only and says so.

**Deliberate departure from the old "not used" list ("giant headline numbers").** Assess shows the planned return margin as one large figure. It is the single answer the flow exists to produce, it is an estimate range in italic with its state and caveat beside it, and it opens its sources like every Quantity. No other screen uses a giant number.

### 3.4 Motion (MOT-01)

All motion is CSS: transitions, keyframes and the browser's View Transitions API. No animation library is loaded (see MOT-01 for why Motion is not installed). Each element has one owner.

| Moment | Motion | Cause → effect |
|---|---|---|
| Step change | View transition: the plate keeps its identity and morphs between sizes; columns and full screens slide in the direction of travel | Where you went, and that the map is the same map |
| Welcome | Headline lines rise out of a mask; Plate I "develops" (clip and contrast settle); limits stagger in | First impression |
| Map click | A cobalt survey ring at the pointer; then the stop row rises into the list, or a refusal toast stays until the next message | The click was received, then what the engine did with it |
| Number changes | Changed readouts flash a cobalt wash | Which value your Command changed |
| Budget | Segments resize | The bar follows the inputs |
| Disclosure | Details unfold; the Layers panel and the Sources drawer slide | Progressive disclosure |
| Confirm | The card lays down; the stamp lands; a STALE stamp lands the same way | Commitment, and its loss |
| Loading | A scan along the masthead rule while the engine works | The engine is busy |

**Reduced motion.** Under `prefers-reduced-motion: reduce` every animation and transition is effectively instant and view transitions are skipped; e2e checks this.

There are no decorative loops: the only repeating animations are the busy scan and the loading blink, and both stop when the work does.

## 4. Kept without change (non-negotiable)

- Every displayed number is a Quantity with value, unit, class and sources. Estimates are ranges, italic and marked "est."; unknown stays unknown.
- Margin states are OK / NEAR LIMIT / OVER only, as word + shape + colour; there is no SAFE state. The wording stays "estimate under stated assumptions", "slope-screened, not rock-free" and "geometry, not dose".
- Simulations carry the hatched SIMULATION banner. Field margins say they come from manual entries and show the last tick time. Suit life support is "not modelled".
- The footer "Independent student project; not affiliated with or endorsed by NASA." is on every view, the Welcome screen included. There are no NASA logos or mission marks.
- Map symbology for terrain classes (plan 9.2) is unchanged: amber hatch, cross-hatch and stipple, in screen pixels.
- The A5 print card layout is unchanged; the confirmation stamp is screen-only.

## 5. Open for the team

- Approve or change UI-01, UI-02, UI-03 and MOT-01.
- **B-01:** the bundle is about 3.9 kB over the 250 KB budget (see DECISIONS B-01 for the options).
- **Contrast:** recheck every pair with a contrast tool on the final build (axe passes in e2e; plan 9.1 asks for a tool check).
- **Paper print:** recheck the A5 print on paper (3.4).
