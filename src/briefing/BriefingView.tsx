// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio desk and confirmation on design/sharpwalk-ui-ux; human Design review pending.
// Briefing (plan 3.3, UX-10/11, AC-06, module 04C): one action builds the card from the engine's current plan copy and
// stamps it with that plan version. When the plan changes the card shows STALE at once and cannot be printed until it
// is regenerated. Print layout: A5 portrait, two columns, 12 mm margins, black on white (plan 9.2).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FileText, LoaderCircle, Mountain, Printer, RefreshCw } from "lucide-react";
import { stampSlam } from "../app/fx";
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

/** The rubber stamp lands once when the briefing is confirmed (Anime.js); screen only, never printed. */
function Stamp() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => { if (el.current) stampSlam(el.current); }, []);
  return <div ref={el} className="briefed" aria-hidden="true"><span>Briefed</span></div>;
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
  // Acknowledgements belong to one card: a new card (a new plan version) asks for them again.
  const cardVersion = card?.model.versionHash;
  useEffect(() => { setAcks(ACKS.map(() => false)); }, [cardVersion]);

  // The class is removed on afterprint only: in browsers where print() returns before printing (Safari, mobile),
  // removing it earlier would print the whole console instead of the card.
  const cardRef = useRef<HTMLElement>(null);
  const printCard = () => {
    // The printed card carries every detail section (legs, stops with time blanks, assumptions, rover views).
    const closed = [...(cardRef.current?.querySelectorAll<HTMLDetailsElement>("details:not([open])") ?? [])];
    closed.forEach((d) => { d.open = true; });
    document.body.classList.add("print-card");
    const done = () => { document.body.classList.remove("print-card"); closed.forEach((d) => { d.open = false; }); window.removeEventListener("afterprint", done); };
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
      <div className="screen-inner">
      <header className="screen-head">
        <h1>Brief the crew</h1>
        <p className="lede">One card, built from the engine's current plan and stamped with its version. Any plan change marks it stale until it is rebuilt.</p>
      </header>
      <div className="briefing-actions" data-tour="brief">
        <button type="button" className="secondary" onClick={() => void generate()} disabled={!output || busy}>
          {busy ? <LoaderCircle size={16} strokeWidth={1.5} className="spin" aria-hidden="true" /> : <RefreshCw size={16} strokeWidth={1.5} aria-hidden="true" />}
          {card ? "Regenerate from current plan" : "Generate card from current plan"}
        </button>
        <button type="button" className="primary" onClick={printCard} disabled={!card || stale || busy}>
          <Printer size={16} strokeWidth={1.5} aria-hidden="true" />Print briefing
        </button>
        {stale && <span className="note">The plan changed: regenerate before printing.</span>}
        {note && <span className="note" role="status">{note}</span>}
      </div>
      <div className="desk">
      {!card ? (
        <div className="card-empty">
          <FileText size={28} strokeWidth={1.5} aria-hidden="true" />
          <strong>No card yet</strong>
          <span>Generate it from the current plan. The map, legs, stops and assumptions come straight from the engine.</span>
        </div>
      ) : (
        <article ref={cardRef} className={`card${stale ? " card-stale" : ""}`} data-testid="briefing-card">
          {isConfirmed && <Stamp />}
          {stale && <div className="stale-stamp" role="alert" data-testid="stale">STALE - plan {current ?? "none"} differs from card plan {card.model.versionHash}</div>}
          <header className="card-head">
            <strong>SharpWalk traverse briefing</strong>
            <span className="meta"><span data-testid="card-version">Plan {card.model.versionHash}</span><br />{card.model.engineVersion} · {card.model.constantsVersion} · built {card.builtAt}</span>
          </header>
          <div className="card-summary"><div>
          <div className="card-verdict" data-testid="card-margin">
            {card.model.margin.state ? <MarginState state={card.model.margin.state} /> : <span className="unknown">State unknown</span>}
            <div>
              <div className="label">Remaining EVA margin at the habitat</div>
              <div className={`margin ${card.model.margin.unknown ? "unknown" : "est"}`}>{card.model.margin.text}</div>
            </div>
          </div>
          <dl className="card-kpis">
            <div><dt>Return walk</dt><dd className={card.model.summary.returnWalk.unknown ? "unknown" : "est"}>{card.model.summary.returnWalk.text}</dd></div>
            <div><dt>Distance · D1 model</dt><dd>{card.model.summary.distance}</dd></div>
            <div><dt>Elevation gain · D1 model</dt><dd>{card.model.summary.climb}</dd></div>
            <div><dt>Stops</dt><dd>{card.model.stops.length}</dd></div>
          </dl>
          {card.model.summary.concern && <p className="card-concern"><Mountain size={14} strokeWidth={2} aria-hidden="true" />
            <span><strong>Key terrain concern.</strong> {card.model.summary.concern} (model-derived from D1). Slope-screened only: rocks are not detected.</span></p>}
          </div>
          {card.map ? (
            <figure className="card-map">
              <img src={card.map.dataUrl} alt="Sheet crop with the route, habitat and stops" />
              <figcaption>North up. About {Math.round(card.map.widthGround_m)} m across (display, not for measuring). Grid path (D1) on: {card.map.layers.length ? card.map.layers.join("; ") : "no base layers (they failed to load)"}.</figcaption>
            </figure>
          ) : <p className="small">Map unavailable.</p>}
          </div>
          <ul className="card-limits">
            <li>Margins are estimates under stated assumptions, not guarantees.</li>
            <li>Slope-screened, not validated terrain; no rock detection. Walking speeds from lunar-gravity tests.</li>
            <li>Suit life support not modelled. No dose and no safe zones.</li>
          </ul>
          <div className="card-more">
          <details>
            <summary>Legs ({card.model.legs.length})</summary>
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
          </details>
          <details>
            <summary>Stops, tasks and timing ({card.model.stops.length})</summary>
            {card.model.stops.length === 0 ? <p className="small">No stops.</p> : card.model.stops.map((s) => (
              <div key={s.letter} className="card-stop">
                <strong>{s.letter}</strong> {s.name} · duration <span className={s.durationClass === "unknown" ? "unknown" : undefined}>{s.duration}</span>
                {s.durationClass === "assumed" && <span className="small"> (assumed)</span>}
                <div className="small">Tasks: {s.tasks.length ? s.tasks.join("; ") : "none entered"}</div>
                <div className="blanks small">Arrive ____:____ Depart ____:____</div>
              </div>
            ))}
          </details>
          <details>
            <summary>Assumptions and their sources ({card.model.assumptions.length})</summary>
            <ul className="card-assumptions" data-testid="card-assumptions">
              {card.model.assumptions.map((a) => <li key={a.id}>{a.text}</li>)}
            </ul>
          </details>
          <details>
            <summary>Rover views of similar terrain (D6)</summary>
            <RoverView data={card.rover} compact />
          </details>
          </div>
          <footer className="card-foot">Independent student project; not affiliated with or endorsed by NASA.</footer>
        </article>
      )}
      <aside className="confirm glass" aria-label="Confirmation">
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
      </div>
    </section>
  );
}
