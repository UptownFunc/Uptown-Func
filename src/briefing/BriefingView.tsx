// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Briefing (plan 3.3, UX-10/11, AC-06, module 04C): one action builds the card from the engine's current plan copy and
// stamps it with that plan version. When the plan changes the card shows STALE at once and cannot be printed until it
// is regenerated. Print layout: A5 portrait, two columns, 12 mm margins, black on white (plan 9.2).
import { useRef, useState } from "react";
import type { PlanOutput } from "../engine/planner";
import type { MapSnapshot } from "../map/snapshot";
import { MarginState } from "../app/MarginState";
import { briefingModel, isStale, type BriefingModel } from "./model";

interface Card { model: BriefingModel; map: MapSnapshot | null; builtAt: string }

export interface BriefingViewProps {
  readonly output: PlanOutput | null;
  readonly snapshot: (() => Promise<MapSnapshot | null>) | null;
  readonly hidden?: boolean;
}

export function BriefingView({ output, snapshot, hidden = false }: BriefingViewProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const current = output?.plan.versionHash ?? null;
  const currentRef = useRef(current);
  currentRef.current = current;
  const stale = card ? isStale(card.model.versionHash, current) : false;

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
      setCard({ model, map, builtAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="briefing" aria-label="Briefing" hidden={hidden}>
      <div className="briefing-actions">
        <button type="button" className="secondary" onClick={() => void generate()} disabled={!output || busy}>
          {card ? "Regenerate from current plan" : "Generate card from current plan"}
        </button>
        <button type="button" className="primary" onClick={printCard} disabled={!card || stale || busy}>
          Print briefing
        </button>
        {stale && <span className="muted">The plan changed: regenerate before printing.</span>}
        {note && <span className="muted" role="status">{note}</span>}
      </div>
      {!card ? <p className="muted">No card yet. The card is built from the engine's current plan and stamped with its version.</p> : (
        <article className={`card${stale ? " card-stale" : ""}`} data-testid="briefing-card">
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
                <figcaption className="small">North up. About {Math.round(card.map.widthGround_m)} m across (display, not for measuring). Grid path on D2 orthophoto and D1 hillshade.</figcaption>
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
            <footer className="small">Independent student project; not affiliated with or endorsed by NASA.</footer>
          </div>
        </article>
      )}
    </section>
  );
}
