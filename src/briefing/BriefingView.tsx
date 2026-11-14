// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio desk and confirmation on design/sharpwalk-ui-ux; human Design review pending.
// Briefing (plan 3.3, UX-10/11, AC-06, module 04C): one action builds the card from the engine's current plan copy and
// stamps it with that plan version. When the plan changes the card shows STALE at once and cannot be printed until it
// is regenerated. Print layout: A5 portrait, two columns, 12 mm margins, black on white (plan 9.2).
import { useRef, useState, type ReactNode } from "react";
import type { PlanOutput } from "../engine/planner";
import type { MapSnapshot } from "../map/snapshot";
import { MarginState } from "../app/MarginState";
import { RoverView } from "../app/RoverView";
import type { RoverImages } from "../app/rover";
import { briefingModel, isStale, type BriefingModel } from "./model";

interface Card { model: BriefingModel; map: MapSnapshot | null; builtAt: string; rover: RoverImages | "failed" | null }

export interface BriefingViewProps {
  readonly output: PlanOutput | null;
  readonly snapshot: (() => Promise<MapSnapshot | null>) | null;
  readonly hidden?: boolean;
  readonly rover?: RoverImages | "failed" | null;
  /** The plan version the crew confirmed (UI state only; never part of MissionPlan or MissionExecution). */
  readonly confirmed?: string | null;
  readonly onConfirm?: (version: string | null) => void;
  readonly next?: ReactNode;
}

const ACKS = [
  "I have reviewed the route, the stops and the leg times on this card.",
  "The margins are estimates under stated assumptions, not guarantees.",
  "The route is slope-screened, not rock-free, and suit life support is not modelled.",
];

export function BriefingView({ output, snapshot, hidden = false, rover = null, confirmed = null, onConfirm, next }: BriefingViewProps) {
  const [acks, setAcks] = useState<boolean[]>(ACKS.map(() => false));
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const current = output?.plan.versionHash ?? null;
  const currentRef = useRef(current);
  currentRef.current = current;
  const stale = card ? isStale(card.model.versionHash, current) : false;
  const isConfirmed = !!card && !stale && confirmed === card.model.versionHash;

  // The class is removed on afterprint only: in browsers where print() returns before printing (Safari, mobile),
  // removing it earlier would print the whole console instead of the card.
  const printCard = () => {
    document.body.classList.add("print-card");
    const done = () => { document.body.classList.remove("print-card"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  };

  const generate = async () => {
    if (!output) return;
    setBusy(true);
    try {
      const model = briefingModel(output.plan);
      const map = snapshot ? await snapshot() : null;
      // The map must show the same plan version as the stamp; if the plan moved on meanwhile, do not mix them.
      if (currentRef.current !== model.versionHash) { setNote("The plan changed while the card was built; generate again."); return; }
      setNote(map ? null : "Map export failed; the card has no map.");
      // The rover views are captured with the card, so the card does not change after it is built (R-16 finding 7).
      setCard({ model, map, builtAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", rover });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="screen briefing" aria-label="Briefing" hidden={hidden}>
      <header className="screen-head">
        <p className="kicker"><span className="n">06</span>Mission briefing</p>
        <h1>Brief the crew</h1>
        <p className="lede">The card is built from the engine's current plan and stamped with its version. Any plan change marks it STALE until it is rebuilt.</p>
      </header>
      <div className="briefing-actions">
        <button type="button" className="secondary" onClick={() => void generate()} disabled={!output || busy}>
          {card ? "Regenerate from current plan" : "Generate card from current plan"}
        </button>
        <button type="button" className="primary" onClick={printCard} disabled={!card || stale || busy}>
          Print briefing
        </button>
        {stale && <span className="note">The plan changed: regenerate before printing.</span>}
        {note && <span className="note" role="status">{note}</span>}
      </div>
      <div className="desk">
      {!card ? <div className="card-empty"><p>No card yet.</p><p className="note">Generate it from the current plan; the map crop, legs, stops and assumptions come straight from the engine.</p></div> : (
        <article className={`card${stale ? " card-stale" : ""}`} data-testid="briefing-card">
          {isConfirmed && <div className="briefed" aria-hidden="true"><span>Briefed</span></div>}
          {stale && <div className="stale-stamp" role="alert" data-testid="stale">STALE - plan {current ?? "none"} differs from card plan {card.model.versionHash}</div>}
          <div className="card-col">
            <header className="card-head">
              <strong>SharpWalk traverse briefing</strong>
              <span data-testid="card-version">Plan {card.model.versionHash}</span>
              <span className="small">{card.model.engineVersion} · {card.model.constantsVersion} · built {card.builtAt}</span>
            </header>
            {card.map ? (
              <figure className="card-map">
                <img src={card.map.dataUrl} alt="Sheet crop with the route, habitat and stops" />
                <figcaption className="small">North up. About {Math.round(card.map.widthGround_m)} m across (display, not for measuring). Grid path (D1) on: {card.map.layers.length ? card.map.layers.join("; ") : "no base layers (they failed to load)"}.</figcaption>
              </figure>
            ) : <p className="small">Map unavailable.</p>}
            <table className="card-legs">
              <thead><tr><th>Leg</th><th>Heading</th><th>Length</th><th>Climb</th><th>Walking time</th></tr></thead>
              <tbody>
                {card.model.legs.map((l) => (
                  <tr key={l.label}><td>{l.label}</td><td>{l.heading}</td><td>{l.distance}</td><td>{l.climb}</td>
                    <td className={l.estimated ? "est" : undefined}>{l.time}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="small">Heading: grid bearing start to end, clockwise from north. Length and climb: model-derived from D1 on the 2 m grid path.</p>
            <p data-testid="card-margin">
              <strong>End margin:</strong> <span className={card.model.margin.unknown ? "unknown" : "est"}>{card.model.margin.text}</span>
              {card.model.margin.state && <> <MarginState state={card.model.margin.state} /></>}
            </p>
          </div>
          <div className="card-col">
            <h3>Stops</h3>
            {card.model.stops.length === 0 ? <p className="small">No stops.</p> : card.model.stops.map((s) => (
              <div key={s.letter} className="card-stop">
                <strong>{s.letter}</strong> {s.name} · duration <span className={s.durationClass === "unknown" ? "unknown" : undefined}>{s.duration}</span>
                {s.durationClass === "assumed" && <span className="small"> (assumed)</span>}
                <div className="small">Tasks: {s.tasks.length ? s.tasks.join("; ") : "none entered"}</div>
                <div className="blanks small">Arrive ____:____ Depart ____:____</div>
              </div>
            ))}
            <h3>Assumptions</h3>
            <ul className="card-assumptions small" data-testid="card-assumptions">
              {card.model.assumptions.map((a) => <li key={a.id}>{a.text}</li>)}
            </ul>
            <p className="small card-limits">
              Estimates under stated assumptions, not guarantees. Slope-screened, not validated terrain; no rock detection.
              Walking speeds from lunar-gravity tests. Suit life support not modelled. No dose and no safe zones.
            </p>
            <RoverView data={card.rover} compact />
            <footer className="small">Independent student project; not affiliated with or endorsed by NASA.</footer>
          </div>
        </article>
      )}
      <aside className="confirm" aria-label="Confirmation">
        <h2>Confirmation</h2>
        {ACKS.map((t, i) => (
          <label key={t} className="check">
            <input type="checkbox" checked={acks[i]} onChange={(e) => setAcks((a) => a.map((v, j) => (j === i ? e.target.checked : v)))} />
            <span>{t}</span>
          </label>
        ))}
        <button type="button" className="go big" data-done={isConfirmed || undefined} disabled={!card || stale || busy || !acks.every(Boolean) || isConfirmed}
          onClick={() => card && onConfirm?.(card.model.versionHash)}>{isConfirmed ? "Briefing confirmed" : "Confirm briefing"}</button>
        <p className="note" role="status">{isConfirmed ? `Confirmed for plan ${current}.` : confirmed ? "An earlier confirmation lapsed: the plan changed since." : !card ? "Generate the card first." : "Tick each line to confirm."}</p>
        {isConfirmed && next}
      </aside>
      </div>
    </section>
  );
}
