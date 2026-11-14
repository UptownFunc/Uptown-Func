// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01, UI-07); human Design review pending.
// The full-page steps of the guided flow: Welcome, Setup (scenario and conditions) and Planner (the time budget).
// They float as frosted glass over the real terrain sheet. Nothing here edits the plan: every change is a Command sent
// through onSet / onApplyPreset to the engine.
import type { ReactNode } from "react";
import { ArrowRight, FilePlus2, FlaskConical, HeartPulse, Mountain, Timer } from "lucide-react";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { ConditionsPanel } from "./ConditionsPanel";
import { FIELDS, PlanTimes } from "./PlanTimes";
import { RoverView } from "./RoverView";
import type { RemsSnapshot } from "./rems";
import type { RoverImages } from "./rover";
import { ICON, ICON_LG } from "./icons";

type OnSet = (id: string, value_s: number, rationale: string, stopId?: string) => void;

/** ready: true when the engine is up, null when it could not start, false while loading. */
export function Welcome({ onBegin, ready }: { onBegin: () => void; ready: boolean | null }) {
  return (
    <section className="welcome" aria-labelledby="w-title">
      <div className="welcome-copy">
        <p className="welcome-eyebrow"><span className="mark" aria-hidden="true" />SharpWalk · Gale crater, Mars</p>
        <h1 id="w-title" className="display">
          <span className="line">Plan the walk.</span>{" "}
          <span className="line">Know the <span className="accent">margin</span>.</span>
        </h1>
        <p className="lede">Route one crewed walk from the habitat to the Mount Sharp boxwork on real orbital terrain, and see the estimated time margin under stated assumptions.</p>
        <div className="welcome-go">
          <button type="button" className="go big" onClick={onBegin}>Begin mission setup<ArrowRight {...ICON} aria-hidden="true" /></button>
          <span className="ready" data-ready={String(ready)} role="status">
            {ready ? "Terrain and route engine ready" : ready === null ? "The route engine could not start; the map still opens" : "Loading terrain and route engine…"}
          </span>
        </div>
      </div>
      <aside className="welcome-card" aria-label="What SharpWalk checks">
        <h2>Before you start</h2>
        <ul className="tenets">
          <li><Mountain {...ICON_LG} aria-hidden="true" /><strong>Slope-screened, not rock-free.</strong>The route avoids ground steeper than the assumed limit; it cannot see rocks.</li>
          <li><Timer {...ICON_LG} aria-hidden="true" /><strong>Margins are estimates.</strong>Every time is a range under stated assumptions, never a guarantee.</li>
          <li><HeartPulse {...ICON_LG} aria-hidden="true" /><strong>Suit life support is not modelled.</strong>Time is the only budget this tool checks.</li>
        </ul>
        <p className="source">Behind this page: the demo area itself, HiRISE orthoimage (D2) under the D1 hillshade.</p>
      </aside>
    </section>
  );
}

function Head({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <header className="screen-head">
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
        <Head id="h-setup" title="Choose the scenario">
          The scenario fixes the inputs you do not choose on the map: the plan times and the date and time of the walk.
        </Head>
        <div className="setup-grid">
          <div className="screen-sheet">
            <p className="section-title">Scenario</p>
            <div className="tiles" role="group" aria-label="Scenario">
              <button type="button" className="tile" aria-pressed={demo} disabled={!output} onClick={demo ? undefined : onApplyPreset}>
                <span className="tile-icon" aria-hidden="true"><FlaskConical {...ICON} /></span>
                <strong>Demonstration scenario</strong>
                <span>Plan times and scenario time picked from cited planning documents (REG-01). Lunar figures applied to Mars: all Assumed, all editable.</span>
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
                </div>
              )}
            </div>
            <RoverView data={rover} />
          </div>
          <div className="screen-sheet">
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
        <Head id="h-planner" title="Set the time budget">
          The planned margin is what walking leaves of the EVA once tasks, contingency and stops are taken out (plan 6.6).
          It stays unknown until every time is set.
        </Head>
        <div className="screen-sheet">
          <figure className="budget" aria-label="Time budget">
            <figcaption>
              <span className="k">EVA duration</span>
              <span className={T ? "assumed" : "unknown"}>{T ? `${(T / 60).toFixed(1)} min · assumed` : "not set"}</span>
            </figcaption>
            {T ? (
              <div className="budget-bar">
                {parts.map((p) => p.v !== undefined && p.v > 0 &&
                  <span key={p.k} className={`seg ${p.k}`} style={{ flexBasis: `${(p.v / scale) * 100}%` }}>{p.label}</span>)}
                {used < T && <span className="seg walk">Left for walking and margin</span>}
              </div>
            ) : <div className="budget-bar empty">Set the EVA duration to see how it divides.</div>}
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
