// SI-assisted: drafted with Claude Code (Claude Opus 5.5); split for the Folio redesign on design/sharpwalk-ui-ux.
// Tier 2: the map's optional layers (time-to-habitat contours, sky obstruction) live in the map's Layers panel; the
// simulated solar-event drill (plan 6.9) lives on the Assess step. The drill asks one question: under these
// assumptions, does the estimated time back to the habitat fit inside the assumed warning time? It never calls any
// place safe or a shelter; the habitat's shielding is Assumed, not modelled.
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";

const DEFAULT_MIN = CONSTANTS.drillWarningDefault.value / 60;
/** Plan 6.9: default 30 min (Assumed) and 10 and 20 min as stress cases. */
export const DRILL_CHOICES_MIN = [DEFAULT_MIN, 20, 10] as const;

export function LayerToggles({ showContours, onShowContours, showSky, onShowSky, skyAvailable, busy }: {
  showContours: boolean; onShowContours: (on: boolean) => void; showSky: boolean; onShowSky: (on: boolean) => void;
  /** False when the area has no sky layer: the toggle is not offered. */
  skyAvailable: boolean; busy: boolean;
}) {
  return (
    <div className="toggles">
      <label className="check">
        <input type="checkbox" checked={showContours} onChange={(e) => onShowContours(e.target.checked)} />
        <span>Time to habitat, 5-minute contour lines (est., slow bound 0.64 m/s, 2 m grid path; unknown and excluded ground not crossed){busy && " · computing…"}</span>
      </label>
      {skyAvailable && <label className="check">
        <input type="checkbox" checked={showSky} onChange={(e) => onShowSky(e.target.checked)} />
        <span>Sky obstruction layer (geometry, not dose)</span>
      </label>}
    </div>
  );
}

export function DrillPanel({ output, drillMin, onDrillMin, busy }: {
  output: PlanOutput | null; drillMin: number | null; onDrillMin: (m: number | null) => void; busy: boolean;
}) {
  const stops = output?.plan.stops ?? [];
  const ret = output?.geometry.stopReturn_s ?? {};
  const outside = drillMin === null ? [] : stops.filter((s) => !((ret[s.id] ?? Infinity) <= drillMin * 60));
  return (
    <section aria-label="Simulated drill" className="drill">
      <label className="switch">
        <input type="checkbox" role="switch" checked={drillMin !== null} onChange={(e) => onDrillMin(e.target.checked ? DEFAULT_MIN : null)} data-testid="drill-toggle" />
        <span className="track" aria-hidden="true" /><span>Simulated solar-event drill</span>
      </label>
      {drillMin !== null && (
        <div className="drill-body" data-testid="drill-body">
          <label className="field-inline">Assumed warning time{" "}
            <select value={drillMin} onChange={(e) => onDrillMin(Number(e.target.value))} aria-label="Assumed warning time">
              {DRILL_CHOICES_MIN.map((m) => <option key={m} value={m}>{m} min{m === DEFAULT_MIN ? " (default, Assumed)" : " (stress case)"}</option>)}
            </select>
          </label>
          <p className="note">SIMULATION. An illustrative event with an assumed warning time (plan 6.9), not a forecast, a live alert or a measurement. No dose is computed; the habitat's shielding is not modelled.</p>
          {busy && <p className="note">Computing contour lines…</p>}
          {stops.length === 0 ? <p>No stops to check.</p> : outside.length === 0
            ? <p className="verdict" data-testid="drill-outside">Every stop's estimated walk back (slow bound) is within {drillMin} min.</p>
            : <p className="verdict" data-testid="drill-outside">Outside the {drillMin}-min line (est. walk back, slow bound): {outside.map((s) => {
              const t = ret[s.id];
              return `${s.letter} ${s.name} (${t === undefined || !Number.isFinite(t) ? "no slope-screened path back" : `est. ${(t / 60).toFixed(1)} min`})`;
            }).join("; ")}.</p>}
        </div>
      )}
    </section>
  );
}
