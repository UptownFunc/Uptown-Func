// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01, UI-13); human Design review pending.
// The full-page steps of the guided flow: Welcome (the real terrain on a powered-up monitor), Setup (scenario and
// conditions) and Planner (the time budget). Nothing here edits the plan: every change is a Command sent through
// onSet / onApplyPreset to the engine.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, FilePlus2, FlaskConical } from "lucide-react";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { ConditionsPanel } from "./ConditionsPanel";
import { FIELDS, PlanTimes } from "./PlanTimes";
import { RoverView } from "./RoverView";
import type { RemsSnapshot } from "./rems";
import type { RoverImages } from "./rover";
import { ICON } from "./icons";
import { crtPowerOn } from "./fx";
import { TOUR } from "./Tutorial";

const WALK_PART = "Left for walking and margin";

type OnSet = (id: string, value_s: number, rationale: string, stopId?: string) => void;

/** ready: true when the engine is up, null when it could not start, false while loading. */
/** FLOW-01: two choices, then the map: orientation or go, then the NASA-sourced preset or custom times. */
export function Welcome({ onStart, ready }: { onStart: (tour: boolean, custom: boolean) => void; ready: boolean | null }) {
  const cover = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [tour, setTour] = useState<boolean | null>(null);
  useEffect(() => {
    if (cover.current && copy.current) crtPowerOn(cover.current, [...copy.current.children] as HTMLElement[]);
  }, []);
  return (
    <section className="welcome" aria-labelledby="w-title">
      <div className="crt">
        <div className="crt-glass">
          <div ref={cover} className="crt-terrain" style={{ backgroundImage: "url(area/d2_luminance.jpg)" }} aria-hidden="true" />
          <div ref={copy} className="crt-copy">
            <p className="crt-kicker">SharpWalk · Mars walk planner · Gale crater</p>
            <h1 id="w-title" className="display">Plan the walk.{" "}<br />Know the margin.</h1>
            <p className="crt-lede">Route one crewed walk from the habitat to the Mount Sharp boxwork on real orbital terrain, and see how much time it leaves.</p>
            <div className="crt-actions" role="group" aria-label={tour === null ? "Start" : "Plan times"}>
              {tour === null ? <>
                <button type="button" className="key big primary" onClick={() => setTour(true)}>Begin orientation<ArrowRight {...ICON} aria-hidden="true" /></button>
                <button type="button" className="key big" onClick={() => setTour(false)}>Go</button>
              </> : <>
                <button type="button" className="key big primary" autoFocus disabled={ready === false} onClick={() => onStart(tour, false)}>NASA-sourced preset<ArrowRight {...ICON} aria-hidden="true" /></button>
                <button type="button" className="key big" disabled={ready === false} onClick={() => onStart(tour, true)}>Custom times</button>
              </>}
            </div>
            {tour !== null && <p className="crt-lede">Preset: times cited from NASA EVA documents, all Assumed. Custom: your own.</p>}
            <p className="ticker" role="status" data-ready={String(ready)}>
              <span className="lamp" aria-hidden="true" />
              {ready ? `Terrain and route engine ready · orientation ${TOUR.length} cards`
                : ready === null ? "The route engine could not start · the map still opens" : "Loading terrain and route engine…"}
            </p>
          </div>
        </div>
        <span className="crt-badge" aria-hidden="true">Terrain: HiRISE orthoimage (D2) under the D1 hillshade · real data</span>
      </div>
      <aside className="memo" aria-label="Before you start">
        <h2>Before you start</h2>
        <ol>
          <li><strong>Slope-screened, not rock-free.</strong> The route avoids ground steeper than the assumed limit; it cannot see rocks.</li>
          <li><strong>Margins are estimates.</strong> Every time is a range under stated assumptions, never a guarantee.</li>
          <li><strong>Suit life support is not modelled.</strong> Time is the only budget this tool checks.</li>
        </ol>
      </aside>
    </section>
  );
}

function Head({ id, no, title, children }: { id: string; no: string; title: string; children: ReactNode }) {
  return (
    <header className="screen-head">
      <p className="form-no">Form {no}</p>
      <h1 id={id}>{title}</h1>
      <p className="lede">{children}</p>
    </header>
  );
}

export function SetupScreen({ output, rems, rover, onSet, onOpenSource, preset, onApplyPreset, next }: {
  output: PlanOutput | null; rems: RemsSnapshot | "failed" | null; rover: RoverImages | "failed" | null; onSet: OnSet;
  onOpenSource: (q: Quantity) => void; preset: boolean; onApplyPreset: () => void; next: ReactNode;
}) {
  // The demonstration scenario is in force when its REG-01 values are in the plan (sent at start-up or applied here).
  const demo = output?.plan.assumptions.some((a) => a.rationale.startsWith("REG-01")) ?? preset;
  return (
    <section className="screen setup" aria-labelledby="h-setup">
      <div className="screen-inner">
        <Head id="h-setup" no="01 · Mission setup" title="Choose the scenario">
          The scenario fixes the inputs you do not choose on the map: the plan times and the date and time of the walk.
        </Head>
        <div className="setup-grid">
          <div className="sheet-paper" data-tour="scenario">
            <p className="section-title">Scenario</p>
            <div className="tiles" role="group" aria-label="Scenario">
              <button type="button" className="tile" aria-pressed={demo} disabled={!output} onClick={demo ? undefined : onApplyPreset}>
                <span className="tile-icon" aria-hidden="true"><FlaskConical {...ICON} /></span>
                <strong>Demonstration scenario</strong>
                <span>Plan times picked from cited planning documents (lunar figures applied to Mars) and a daylight date for the walk, which no document can give. All Assumed, all editable.</span>
                {demo && <span className="tile-stamp" aria-hidden="true">In use</span>}
              </button>
              {demo ? (
                // Switching to blank needs a fresh engine (an Assumed time cannot be unset), so it reloads, after a confirm.
                <a className="tile" href="?preset=none#setup"
                  onClick={(e) => { if (!confirm("Start a blank scenario? The planner reloads and the current plan is cleared.")) e.preventDefault(); }}>
                  <span className="tile-icon" aria-hidden="true"><FilePlus2 {...ICON} /></span>
                  <strong>Blank scenario</strong>
                  <span>Every time starts not set until you enter it with a rationale. Opens a fresh planner.</span>
                </a>
              ) : (
                <div className="tile" aria-current="true">
                  <span className="tile-icon" aria-hidden="true"><FilePlus2 {...ICON} /></span>
                  <strong>Blank scenario</strong>
                  <span>In use: every time starts not set until you enter it with a rationale.</span>
                  <span className="tile-stamp" aria-hidden="true">In use</span>
                </div>
              )}
            </div>
            <RoverView data={rover} />
          </div>
          <div className="sheet-crt" data-tour="conditions">
            <ConditionsPanel output={output} onSet={(id, v, r) => onSet(id, v, r)} onOpenSource={onOpenSource} rems={rems} />
          </div>
        </div>
        <div className="screen-foot">{next}</div>
      </div>
    </section>
  );
}

export function PlannerScreen({ output, onSet, next }: { output: PlanOutput | null; onSet: OnSet; next: ReactNode }) {
  const plan = output?.plan;
  const val = (id: string) => plan?.assumptions.find((a) => a.id === `A-${id}`)?.value;
  const T = val("T_EVA");
  // The stops' share: each stop's own duration if set, else the default; unknown if neither is set.
  const stops = plan?.stops.map((s) => val(`stop_duration-${s.id}`) ?? val("stop_duration")) ?? [];
  const stopSum = stops.every((v) => v !== undefined) ? stops.reduce<number>((a, v) => a + v!, 0) : undefined;
  const parts = [
    { k: "ops", label: FIELDS[1].short, v: val("t_ops") },
    { k: "cont", label: FIELDS[2].short, v: val("t_cont") },
    { k: "stops", label: `Stops (${plan?.stops.length ?? 0})`, v: stopSum },
  ];
  const used = parts.reduce((a, p) => a + (p.v ?? 0), 0);
  const scale = T ? Math.max(T, used) : 1; // over budget: draw the parts to fit and say so in words
  return (
    <section className="screen planner" aria-labelledby="h-planner">
      <div className="screen-inner">
        <Head id="h-planner" no="02 · Mission planner" title="Set the time budget">
          The EVA is your whole time outside. Tasks, contingency and stops come out of it first; walking uses the rest, and
          what is left after the walk is the margin. It stays unknown until every time below is set.
        </Head>
        <div className="sheet-paper">
          <figure className="budget" aria-label="Time budget" data-tour="budget">
            <figcaption>
              <span className="k">EVA duration</span>
              <span className={T ? "assumed" : "unknown"}>{T ? `${(T / 60).toFixed(1)} min · assumed` : "not set"}</span>
            </figcaption>
            {T ? (
              <div className="budget-bar">
                {parts.map((p) => p.v !== undefined && p.v > 0 &&
                  <span key={p.k} className={`seg ${p.k}`} style={{ flexBasis: `${(p.v / scale) * 100}%` }}><span>{p.label}</span></span>)}
                {used < T && <span className="seg walk"><span>{WALK_PART}</span></span>}
              </div>
            ) : <div className="budget-bar empty">Set the EVA duration to see how it divides.</div>}
            {/* On a phone the parts are too narrow for words: the bar is colour only and this key names the parts. */}
            {T ? <ul className="budget-key">
              {parts.map((p) => p.v !== undefined && p.v > 0 && <li key={p.k}><i className={`seg ${p.k}`} aria-hidden="true" />{p.label}</li>)}
              {used < T && <li><i className="seg walk" aria-hidden="true" />{WALK_PART}</li>}
            </ul> : null}
            <p className="note">Proportions of the Assumed inputs below. Walking times come from the route on the Map step.
              {parts.some((p) => p.v === undefined) && " Unset parts are not drawn."}</p>
            {T !== undefined && used >= T && <p className="problem" role="status">Tasks, contingency and stops alone fill the EVA duration: nothing is left for walking.</p>}
          </figure>
          {plan ? <PlanTimes assumptions={plan.assumptions} onSet={onSet} /> : <p className="unknown">Engine loading…</p>}
        </div>
        <div className="screen-foot">{next}</div>
      </div>
    </section>
  );
}
