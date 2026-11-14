// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01, UI-02); human Design review pending.
// The full-page steps of the guided flow: Welcome, Setup (scenario and conditions) and Planner (the time budget).
// Nothing here edits the plan: every change is a Command sent through onSet / onApplyPreset to the engine.
import type { ReactNode } from "react";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { ConditionsPanel } from "./ConditionsPanel";
import { FIELDS, PlanTimes } from "./PlanTimes";
import { RoverView } from "./RoverView";
import type { RemsSnapshot } from "./rems";
import type { RoverImages } from "./rover";

type OnSet = (id: string, value_s: number, rationale: string, stopId?: string) => void;

/** The terrain plate: the real D2 orthoimage under the D1 hillshade (the sheet's own files), display only. */
const PLATE = { backgroundImage: "url(area/d1_hillshade.jpg), url(area/d2_luminance.jpg)" };

export function Welcome({ onBegin, ready }: { onBegin: () => void; ready: boolean }) {
  return (
    <section className="welcome" aria-labelledby="w-title">
      <p className="kicker rise">SharpWalk · a planner for one crewed walk in Gale crater, Mars</p>
      <h1 id="w-title" className="display">
        <span className="line"><span>Plan the walk.</span></span>
        <span className="line"><span>Know the <em>margin</em>.</span></span>
      </h1>
      <figure className="welcome-plate">
        <div className="terrain" style={PLATE} role="img" aria-label="The demo area: HiRISE orthoimage under the D1 hillshade" />
        <figcaption><span>Plate I</span> The demo area at the foot of Mount Sharp, as the planner draws it: HiRISE orthoimage (D2) under the D1 hillshade. Real data, shown for display only.</figcaption>
      </figure>
      <ol className="tenets">
        <li><span className="n">01</span><strong>Slope-screened, not rock-free.</strong> The route avoids ground steeper than the assumed limit; it cannot see rocks.</li>
        <li><span className="n">02</span><strong>Margins are estimates.</strong> Every time is a range under stated assumptions, never a guarantee.</li>
        <li><span className="n">03</span><strong>Suit life support is not modelled.</strong> Time is the only budget this tool checks.</li>
      </ol>
      <div className="welcome-go">
        <button type="button" className="go big" onClick={onBegin}>Begin mission setup <span aria-hidden="true">→</span></button>
        <span className="ready" data-ready={ready}>{ready ? "Terrain and route engine ready" : "Loading terrain and route engine…"}</span>
      </div>
    </section>
  );
}

function Head({ n, kicker, title, children }: { n: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <header className="screen-head">
      <p className="kicker"><span className="n">{n}</span>{kicker}</p>
      <h1 id={`h-${n}`}>{title}</h1>
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
    <section className="screen setup" aria-labelledby="h-01">
      <Head n="01" kicker="Mission setup" title="Choose the scenario">
        A scenario fixes the inputs you do not choose on the map: the plan times and the date and time of the walk.
        Everything you set is an Assumed input with a rationale, never a measurement.
      </Head>
      <div className="setup-grid">
        <div className="tiles" role="group" aria-label="Scenario">
          <button type="button" className="tile" aria-pressed={demo} disabled={!output} onClick={demo ? undefined : onApplyPreset}>
            <span className="tile-mark" aria-hidden="true" />
            <strong>Demonstration scenario</strong>
            <span>Plan times and scenario time picked from cited planning documents (REG-01). Lunar figures applied to Mars: all Assumed, all editable.</span>
          </button>
          <a className="tile" aria-current={!demo || undefined} href="?preset=none#setup">
            <span className="tile-mark" aria-hidden="true" />
            <strong>Blank scenario</strong>
            <span>Every time starts “not set” until you enter it with a rationale. Opens a fresh planner.</span>
          </a>
        </div>
        <ConditionsPanel output={output} onSet={(id, v, r) => onSet(id, v, r)} onOpenSource={onOpenSource} rems={rems} />
      </div>
      <RoverView data={rover} />
      <div className="screen-foot">{next}</div>
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
  return (
    <section className="screen planner" aria-labelledby="h-02">
      <Head n="02" kicker="Mission planner" title="Set the time budget">
        The planned margin is what walking leaves of the EVA once tasks, contingency and stops are taken out
        (plan 6.6). Enter each time in minutes with a one-line reason; the margin stays unknown until all are set.
      </Head>
      <figure className="budget" aria-label="Time budget">
        <figcaption>
          <span className="time-label">{FIELDS[0].short}</span>
          <span className={T ? "assumed" : "unknown"}>{T ? `${(T / 60).toFixed(1)} min · assumed` : "not set"}</span>
        </figcaption>
        {T ? (
          <div className="budget-bar">
            {parts.map((p) => p.v !== undefined && p.v > 0 &&
              <span key={p.k} className={`seg ${p.k}`} style={{ flexBasis: `${Math.min(100, (p.v / T) * 100)}%` }}>{p.label}</span>)}
            <span className="seg walk">{used >= T ? "Nothing left for walking" : "Left for walking and margin"}</span>
          </div>
        ) : <div className="budget-bar empty">Set the EVA duration to see how it divides.</div>}
        <p className="note">Proportions only, from the Assumed inputs below; walking times come from the route on the Map step.
          {parts.some((p) => p.v === undefined) && " Unset parts are not drawn."}</p>
      </figure>
      {plan ? <PlanTimes assumptions={plan.assumptions} onSet={onSet} /> : <p className="unknown">Engine loading…</p>}
      <div className="screen-foot">{next}</div>
    </section>
  );
}
