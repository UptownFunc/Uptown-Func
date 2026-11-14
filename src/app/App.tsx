// SI-assisted: drafted with Claude Code (Claude Opus 5.5); guided-flow redesign "Geologic Folio" on design/sharpwalk-ui-ux
// (UI-01, UI-02), human Design review pending.
// Shell: Welcome, then six steps (Setup, Planner, Map, HUD, Assess, Brief). Mission state lives here and in the engine
// worker, so it survives every step change. The AREA sheet stays mounted and laid out on every step, so the map view,
// its layers and the briefing snapshot never reset; the field view and the briefing card stay mounted for their state.
// The engine worker is the only writer of MissionPlan; the console sends it Commands and shows the copies it returns.
import { useCallback, useEffect, useRef, useState } from "react";
import { AreaSheet } from "../map/AreaSheet";
import type { SkySampler } from "../map/skySample";
import { createEngine, type EngineClient } from "../engine/client";
import type { LatLon, PlanOutput } from "../engine/planner";
import { PlanPanel } from "./PlanPanel";
import { RouteProfile } from "./RouteProfile";
import { SourcePanel } from "./SourcePanel";
import { LayerToggles } from "./DrillPanel";
import { AssessPanel } from "./AssessPanel";
import { PlannerScreen, SetupScreen, Welcome } from "./Screens";
import { RoverImages, roverSource } from "./rover";
import { RemsSnapshot, remsSource } from "./rems";
import type { ContourLevel } from "../engine/contours";
import { Provenance, type Quantity } from "../contracts";
import { BriefingView } from "../briefing/BriefingView";
import { FieldView } from "../field/FieldView";
import type { MapSnapshot } from "../map/snapshot";
import { DEMO_PRESET, presetEnabled } from "./demoPreset";
import { STEPS, stepFromHash, type StepId } from "./steps";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge, LoaderCircle, Map as MapIcon, Navigation, SlidersHorizontal, Timer } from "lucide-react";
import { ICON } from "./icons";

const STEP_ICON = { setup: SlidersHorizontal, planner: Timer, map: MapIcon, hud: Navigation, assess: Gauge, brief: ClipboardCheck } as const;

const AREA_URL = "area/";
/** H-01 (DECISIONS.md, pending team confirmation): the slope-screened cell nearest the plan 19.2 suggestion
 *  (4.795 S, 137.392 E), which itself lies on ground over the 20 deg limit. Assumed scenario input, not a base site. */
export const DEFAULT_HABITAT: LatLon = { lat: -4.795211, lon: 137.391845 };

let commandSeq = 0;
/** crypto.randomUUID exists only in secure contexts; a plain-http LAN demo needs a fallback. */
const commandId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `cmd-${Date.now()}-${++commandSeq}`;

const getJson = (path: string) => fetch(new URL(path, document.baseURI)).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function App() {
  const engine = useRef<EngineClient | null>(null);
  const [output, setOutput] = useState<PlanOutput | null>(null);
  const [message, setMessage] = useState<{ text: string; n: number } | null>(null);
  const say = (text: string) => setMessage((m) => ({ text, n: (m?.n ?? 0) + 1 }));
  const [pending, setPending] = useState(0);
  const [engineFailed, setEngineFailed] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<Quantity | null>(null);
  const [drawer, setDrawer] = useState(false);
  const openSource = (q: Quantity) => { setSelected(q); setDrawer(true); };
  const [provenance, setProvenance] = useState<Provenance[]>([]);
  const [layerDatasets, setLayerDatasets] = useState<string[]>([]);
  const [cursor, setCursor] = useState<LatLon | null>(null);
  // Tier 2: contour lines from the engine worker (computed once per habitat), shown as lines only.
  const [showContours, setShowContours] = useState(false);
  const [showSky, setShowSky] = useState(false);
  const [skyState, setSkyState] = useState<"none" | "ok" | "failed">("none");
  const [skyAt, setSkyAt] = useState<SkySampler | null>(null);
  const [drillMin, setDrillMin] = useState<number | null>(null);
  const [levels, setLevels] = useState<ContourLevel[] | null>(null);
  const [contourBusy, setContourBusy] = useState(false);
  /** The plan version the crew confirmed on the Brief step; any later plan change lapses it. */
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // ---- Steps (UI-01): the hash is the step; history entries make the browser's Back button work. ----
  const [step, setStep] = useState<StepId>(() => stepFromHash(location.hash));
  const stepRef = useRef(step);
  stepRef.current = step;
  const show = useCallback((next: StepId, push: boolean) => {
    if (next === stepRef.current) return;
    const apply = () => {
      setStep(next);
      setDrawer(false); // a new step starts uncovered; the drawer opens again from any number or the masthead
      if (push) history.pushState(null, "", next === "welcome" ? location.pathname + location.search : `#${next}`);
    };
    // MOT-02: the step changes at once and the new panel settles in with CSS (@starting-style). No view-transition
    // capture: snapshotting the full-screen terrain canvas delayed input and the STALE stamp past the 1 s criterion.
    apply();
  }, []);
  const go = (s: StepId) => show(s, true);
  useEffect(() => {
    const onPop = () => show(stepFromHash(location.hash), false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    addEventListener("popstate", onPop);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("popstate", onPop); removeEventListener("keydown", onKey); };
  }, [show]);
  const onMap = STEPS.find((s) => s.id === step)?.map ?? false;

  const wantContours = showContours || drillMin !== null;
  const engineReady = output !== null;
  useEffect(() => {
    const e = engine.current;
    if (!wantContours || levels || !e || !engineReady) return;
    let live = true;
    setContourBusy(true);
    const mins = Array.from({ length: 18 }, (_, i) => (i + 1) * 5); // 5 ... 90 min; includes the 10, 20, 30 drill lines
    e.api.contours(mins).then((l) => { if (live) setLevels(l); })
      .catch((err: unknown) => { if (live) say(`Contours unavailable: ${errText(err)}`); })
      .finally(() => { if (live) setContourBusy(false); });
    return () => { live = false; };
  }, [wantContours, levels, engineReady]); // not on every plan change: the field depends only on the habitat
  const contourDisplay = levels && wantContours
    ? { levels: showContours ? levels : levels.filter((l) => drillMin !== null && Math.abs(l.level_s - drillMin * 60) < 1), drill_s: drillMin === null ? null : drillMin * 60 }
    : null;
  // D7 REMS snapshot, D6 rover views and the provenance record (UX-15), each validated; a missing or invalid file is
  // shown as unavailable, never filled in.
  const [rems, setRems] = useState<RemsSnapshot | "failed" | null>(null);
  const [rover, setRover] = useState<RoverImages | "failed" | null>(null);
  useEffect(() => {
    getJson("conditions/rems.json").then((j: unknown) => { const p = RemsSnapshot.safeParse(j); setRems(p.success ? p.data : "failed"); }).catch(() => setRems("failed"));
    getJson("rover/images.json").then((j: unknown) => { const p = RoverImages.safeParse(j); setRover(p.success ? p.data : "failed"); }).catch(() => setRover("failed"));
    getJson(AREA_URL + "provenance.json").then((j: unknown) => { const p = Provenance.array().safeParse(j); setProvenance(p.success ? p.data : []); }).catch(() => setProvenance([]));
  }, []);
  const extraSources = [...(rems && rems !== "failed" ? [remsSource(rems)] : []), ...(rover && rover !== "failed" ? [roverSource(rover)] : [])];
  // UX-15: every dataset in the current view = the sheet's layer sources plus the datasets the plan's numbers use.
  const datasetsInView = [...new Set([...layerDatasets, ...(output?.plan.provenanceIds ?? []), "D10", ...extraSources.map((x) => x.id), ...(showSky && skyState === "ok" ? ["D12"] : [])])].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const [snapshot, setSnapshot] = useState<(() => Promise<MapSnapshot | null>) | null>(null);
  const outputRef = useRef(output);
  outputRef.current = output;
  const sendRef = useRef<((type: string, payload: Record<string, unknown>) => void) | null>(null);
  // REG-01: the demonstration plan times and scenario time, as logged Commands (the engine stays the only writer).
  const applyPreset = () => { for (const a of DEMO_PRESET) sendRef.current?.("set_assumption", { ...a }); };

  useEffect(() => {
    const e = createEngine();
    engine.current = e;
    let live = true;
    // Resolve against the page, not the worker script (whose URL differs in dev and build).
    e.api.init(new URL(AREA_URL, document.baseURI).href, DEFAULT_HABITAT)
      .then((o) => {
        if (!live) return;
        outputRef.current = o;
        setOutput(o);
        if (presetEnabled(location.search)) applyPreset(); // skipped with ?preset=none
      })
      .catch((err: unknown) => { if (live) { setEngineFailed(true); say(`Engine could not start: ${errText(err)}`); } });
    return () => { live = false; e.terminate(); engine.current = null; };
  }, []);

  // Commands run one at a time, each against the plan version the previous one produced, so quick clicks are not
  // refused as stale. Failures are shown, never swallowed.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const version = output?.plan.versionHash;
  // A hover index belongs to one plan's profile; drop it when the plan version changes.
  useEffect(() => { setHover(null); }, [version]);

  const send = useCallback((type: string, payload: Record<string, unknown>) => {
    setPending((n) => n + 1);
    queue.current = queue.current.then(async () => {
      const e = engine.current, cur = outputRef.current;
      try {
        if (!e || !cur) return say("Not changed: the engine is still loading the area; try again in a moment.");
        const { result, output: next, elapsed_ms } = await e.api.apply({
          id: commandId(), type, payload, issuedAt: new Date().toISOString(), planVersion: cur.plan.versionHash,
        });
        outputRef.current = next;
        setOutput(next);
        say(result.ok ? `Plan updated in ${Math.round(elapsed_ms)} ms.` : `Not changed: ${result.reason}.`);
      } catch (err: unknown) {
        say(`Engine error: ${errText(err)}`);
      } finally { setPending((n) => n - 1); }
    });
  }, []);
  sendRef.current = send;
  const setTime = (id: string, value_s: number, rationale: string, stopId?: string) => send("set_assumption", { id, value_s, rationale, ...(stopId ? { stopId } : {}) });

  // Click feedback on the sheet: a survey ring where the pointer went down (cause), then the stop or the refusal (effect).
  const [ping, setPing] = useState<{ x: number; y: number; n: number } | null>(null);
  const down = useRef<{ x: number; y: number } | null>(null);
  const plan = output?.plan;
  const next = (s: StepId, label: string) => <button type="button" className="go" onClick={() => go(s)}>{label}<ArrowRight {...ICON} aria-hidden="true" /></button>;
  const recalculating = pending > 0 && output !== null;

  return (
    <div className="app" data-step={step} data-busy={pending > 0 || (!output && !engineFailed) || contourBusy}>
      {/* Ambient backdrop: the same orbital image, blurred past recognition (decoration, not data); path relative to the page. */}
      <div className="ambient" style={{ backgroundImage: `url(${AREA_URL}d2_luminance.jpg)` }} aria-hidden="true" />
      <header className="masthead" inert={step === "welcome"}>
        <button type="button" className="wordmark" onClick={() => go("welcome")} aria-label="SharpWalk, start screen">
          <span className="mark" aria-hidden="true" />SharpWalk
        </button>
        <nav aria-label="Mission steps">
          <ol>
            {STEPS.map((s) => {
              const Icon = STEP_ICON[s.id];
              return (
                <li key={s.id}>
                  <button type="button" aria-current={step === s.id ? "step" : undefined} onClick={() => go(s.id)}>
                    <Icon {...ICON} aria-hidden="true" /><span>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <button type="button" className="icon-btn" aria-expanded={drawer} onClick={() => setDrawer((o) => !o)}>
          <BookOpen {...ICON} aria-hidden="true" /><span>Sources</span>
        </button>
        <span className="progress" aria-hidden="true" />
      </header>
      {step === "welcome" && <Welcome onBegin={() => go("setup")} ready={output ? true : engineFailed ? null : false} />}
      <main className="work" inert={step === "welcome"}>
        <div className="plate" inert={!onMap} aria-hidden={!onMap || undefined}
          onPointerDown={(e) => { down.current = e.button === 0 && step === "map" && (e.target as HTMLElement).closest(".map") ? { x: e.clientX, y: e.clientY } : null; }}
          onPointerUp={(e) => { // a click, not a pan: the ring marks where the pick went (the engine then answers)
            const d = down.current; down.current = null;
            if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
            const r = e.currentTarget.getBoundingClientRect(); setPing((p) => ({ x: e.clientX - r.left, y: e.clientY - r.top, n: (p?.n ?? 0) + 1 })); }}>
          <AreaSheet dataUrl={AREA_URL} plan={output} onPick={step === "map" ? (p) => send("add_stop", { lat: p.lat, lon: p.lon }) : undefined}
            onSnapshotReady={(fn) => setSnapshot(() => fn)} hoverIndex={hover} onHoverIndex={setHover} onDatasets={setLayerDatasets} onCursor={setCursor}
            contours={contourDisplay} showSky={showSky} onSky={(st, f) => { setSkyState(st); if (f) setSkyAt(() => f); }}
            tools={<LayerToggles showContours={showContours} onShowContours={setShowContours} showSky={showSky} onShowSky={setShowSky} skyAvailable={skyState !== "none"} busy={contourBusy} />}
            hint={step === "map" ? "Click slope-screened ground to add a stop" : "View only · edit the route on the Map step"} />
          {ping && <span key={ping.n} className="ping" style={{ left: ping.x, top: ping.y }} aria-hidden="true" />}
          {/* Route recalculation feedback: shown while a Command is with the engine (route search, margins). */}
          <p className="recalc" data-on={recalculating} aria-hidden={!recalculating}>
            <LoaderCircle {...ICON} aria-hidden="true" />Engine updating the plan
          </p>
        </div>
        <RouteProfile output={output} hoverIndex={hover} onHoverIndex={setHover} />
        {step === "map" && <PlanPanel output={output} onOpenSource={openSource} next={next("hud", "Continue to the field HUD")}
          onDeleteStop={(id) => send("delete_stop", { stopId: id })} onEditStop={(stopId, name, tasks) => send("edit_stop", { stopId, name, tasks })}
          onSetTime={setTime} skyAt={showSky && skyState === "ok" ? skyAt : null}
          onMoveToCursor={cursor ? (stopId) => send("move_stop", { stopId, lat: cursor.lat, lon: cursor.lon }) : undefined} />}
        {step === "assess" && <AssessPanel output={output} onOpenSource={openSource} drillMin={drillMin} onDrillMin={setDrillMin} busy={contourBusy}
          next={next("brief", "Continue to the briefing")} />}
        {step === "setup" && <SetupScreen output={output} rems={rems} rover={rover} onSet={setTime} onOpenSource={openSource}
          preset={presetEnabled(location.search)} onApplyPreset={applyPreset} next={next("planner", "Continue to the time budget")} />}
        {step === "planner" && <PlannerScreen output={output} onSet={setTime} next={next("map", "Continue to the map")} />}
        {/* Kept mounted so a built card keeps its version stamp and shows STALE after a plan change. */}
        <BriefingView output={output} snapshot={snapshot} hidden={step !== "brief"} rover={rover}
          confirmed={confirmed} onConfirm={setConfirmed} next={next("hud", "Open the field HUD")} />
        {/* Kept mounted: the field view alone holds MissionExecution, so ticks survive step changes. */}
        <FieldView output={output} hidden={step !== "hud"} briefed={!!version && confirmed === version} next={next("assess", "Continue to the assessment")} />
        {message && <p key={message.n} className="toast" data-kind={message.text.startsWith("Plan updated") ? "ok" : "hold"} role="status" data-testid="engine-message">{message.text}</p>}
        <aside className="drawer" data-open={drawer} aria-label="Source drawer" inert={!drawer}>
          <SourcePanel selected={selected} provenance={provenance} assumptions={plan?.assumptions ?? []}
            datasetsInView={datasetsInView} extraSources={extraSources} onClose={() => { setSelected(null); setDrawer(false); }} />
        </aside>
      </main>
      <footer className="colophon">
        <span>Independent student project; not affiliated with or endorsed by NASA.</span>
        {plan && <span className="stamp">Plan {plan.versionHash} · {plan.engineVersion} · suit life support not modelled</span>}
      </footer>
    </div>
  );
}
