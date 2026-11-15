// SI-assisted: drafted with Claude Code (Claude Opus 5.5); guided flow and the "Bureau" redesign on design/sharpwalk-ui-ux
// (UI-01, UI-11..UI-13, MOT-03), human Design review pending.
// Shell: Welcome, then six steps (Setup, Planner, Map, Assess, Brief, HUD; UI-17). Mission state lives here and in the engine
// worker, so it survives every step change. The AREA sheet stays mounted and laid out on every step, so the map view,
// its layers and the briefing snapshot never reset; the field view and the briefing card stay mounted for their state.
// The engine worker is the only writer of MissionPlan; the console sends it Commands and shows the copies it returns.
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Provenance, type MissionExecution, type Quantity } from "../contracts";
import { BriefingView } from "../briefing/BriefingView";
import { FieldView } from "../field/FieldView";
import { progressOf } from "../field/progress";
import type { MapSnapshot } from "../map/snapshot";
import { DEMO_PRESET, presetEnabled } from "./demoPreset";
import { STEPS, stepFromHash, type StepId } from "./steps";
import { ArrowRight, BookOpen, CircleHelp, LoaderCircle } from "lucide-react";
import { ICON } from "./icons";
import { AnimatePresence, Appear, PANEL_FADE, PANEL_IN } from "./motion";
import { Tutorial, orientationDone } from "./Tutorial";
import { StopPopover } from "./StopPopover";
import { GlossaryList } from "./Term";
import { DEFAULT_LAYERS, type MapLayers } from "../map/layers";
import type { Sampler } from "../map3d/scene";

type View3d = typeof import("../map3d/TerrainView").default;
/** 3D-05: the 3D view is its own chunk, fetched only when the user opens 3D (CesiumJS is loaded by it). A chunk that
 *  cannot be downloaded hands back to 2D instead of breaking the page; the next attempt fetches it again. */
const lazy3d = () => lazy(() => import("../map3d/TerrainView").catch((e: unknown) => ({
  default: ((p: { onFail: (why: string) => void }) => { useEffect(() => p.onFail(`the 3D view could not be downloaded (${errText(e)})`), []); return null; }) as unknown as View3d,
})));

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
  /** UNDO-01: a stop just added carries an Undo key in its message (one click undoes an accidental click on the map). */
  const [message, setMessage] = useState<{ text: string; n: number; undo?: { id: string; letter: string } | undefined } | null>(null);
  /** The latest engine message for assistive technology: one live region that stays mounted (a toast that remounts
   *  for every message is not announced reliably). */
  const [announce, setAnnounce] = useState("");
  const say = (text: string, undo?: { id: string; letter: string }) => { setMessage((m) => ({ text, n: (m?.n ?? 0) + 1, undo })); setAnnounce(undo ? `${text} Undo stop ${undo.letter}: Ctrl+Z, or the key in the message.` : text); };
  /** A message answers one action. The next action (or step) clears it, except a failed engine start, which concerns
   *  every action; `refusalsOnly` clears only a refusal (the map's click, before the engine has the pick). */
  const clearActionMessage = useCallback((refusalsOnly = false) => setMessage((m) => {
    if (!m || m.text.startsWith("Engine could not start")) return m;
    return !refusalsOnly || m.text.startsWith("Not changed") ? null : m;
  }), []);
  // A success clears itself; a refusal or an error explains why nothing changed, so it stays until the next message.
  useEffect(() => {
    if (!message?.text.startsWith("Plan updated")) return;
    // UNDO-01: while the pointer or keyboard focus is on the message (its Undo key), it waits; Ctrl+Z (Cmd+Z) outside a
    // text field takes back the stop just added, so the key is not pointer-only.
    let timer = 0;
    const wait = () => { timer = window.setTimeout(() => (document.querySelector(".toast:is(:hover, :focus-within)") ? wait()
      : setMessage((m) => (m?.n === message.n ? null : m))), message.undo ? 6000 : 4000); };
    wait();
    const key = (e: KeyboardEvent) => {
      if (message.undo && (e.ctrlKey || e.metaKey) && e.key === "z" && !(e.target as Element).closest("input, textarea")) { e.preventDefault(); send("delete_stop", { stopId: message.undo.id }); }
    };
    addEventListener("keydown", key);
    return () => { clearTimeout(timer); removeEventListener("keydown", key); };
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps -- send is stable
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
  /** MAP-02: the display layers shown on the sheet (console state; a later 3D view reads the same object). */
  const [mapLayers, setMapLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  /** HUD-01: a read-only copy of the field view's ticks, for the crew's progress on the sheet. */
  const [fieldExec, setFieldExec] = useState<MissionExecution | null>(null);
  /** 3D-05: which view the map plate shows. The 2D sheet stays mounted under the 3D view, so nothing resets. */
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [tries3d, setTries3d] = useState(0);
  const TerrainView = useMemo(lazy3d, [tries3d]); // eslint-disable-line react-hooks/exhaustive-deps
  /** The 3D view reads D1 heights from the engine worker (one copy of the grid, read only). */
  const sampler = useMemo<Sampler>(() => ({
    heights: (b, w, h) => engine.current ? engine.current.api.heights(b, w, h) : Promise.reject(new Error("engine not running")),
    sample: (pts) => engine.current ? engine.current.api.sample(pts) : Promise.reject(new Error("engine not running")),
  }), []);
  const [skyState, setSkyState] = useState<"none" | "ok" | "failed">("none");
  const [skyAt, setSkyAt] = useState<SkySampler | null>(null);
  const [drillMin, setDrillMin] = useState<number | null>(null);
  const [levels, setLevels] = useState<ContourLevel[] | null>(null);
  const [contourBusy, setContourBusy] = useState(false);
  /** The plan version the crew confirmed on the Brief step; any later plan change lapses it. */
  const [confirmed, setConfirmed] = useState<string | null>(null);
  /** Point and click (UI-11): the stop picked on the map, and the stop waiting to be moved by the next map click. */
  const [picked, setPicked] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  /** The engine's terrain classes, for the sheet's cursor tag. The grid stays in a ref (CLAUDE.md: grids never in
   *  React state); the state is only the flag that tells the sheet the grid has arrived. */
  const terrainClasses = useRef<Uint8Array | null>(null);
  const [classesReady, setClassesReady] = useState(false);
  const [tour, setTour] = useState(false);
  const [toured, setToured] = useState(orientationDone);
  /** The masthead key that reopens the tour; focus returns to it when the tour closes. */
  const tourKey = useRef<HTMLButtonElement>(null);

  // ---- Steps (UI-01): the hash is the step; history entries make the browser's Back button work. ----
  const [step, setStep] = useState<StepId>(() => stepFromHash(location.hash));
  const stepRef = useRef(step);
  /** Steps the user has opened this session: their lamps show green (visited, not a claim that the step is complete). */
  const [visited, setVisited] = useState<ReadonlySet<StepId>>(() => new Set([step]));
  stepRef.current = step;
  const show = useCallback((next: StepId, push: boolean) => {
    if (next === stepRef.current) return;
    const apply = () => {
      setStep(next);
      setVisited((v) => (v.has(next) ? v : new Set(v).add(next)));
      setDrawer(false); // a new step starts uncovered; the drawer opens again from any number or the masthead
      // A refusal belongs to the step it happened on; only a failed engine start concerns every step.
      clearActionMessage();
      setPicked(null); setMoving(null);
      if (push) history.pushState(null, "", next === "welcome" ? location.pathname + location.search : `#${next}`);
    };
    // MOT-02: the step changes at once and the new panel settles in with CSS (@starting-style). No view-transition
    // capture: snapshotting the full-screen terrain canvas delayed input and the STALE stamp past the 1 s criterion.
    apply();
  }, []);
  const go = (s: StepId) => show(s, true);
  useEffect(() => {
    const onPop = () => show(stepFromHash(location.hash), false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawer(false); setMoving(null); setPicked(null); } };
    addEventListener("popstate", onPop);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("popstate", onPop); removeEventListener("keydown", onKey); };
  }, [show]);
  const onMap = STEPS.find((s) => s.id === step)?.map ?? false;
  /** HUD-01: shown on the HUD step only, where the ticks are entered (2D sheet; the 3D view does not draw it). */
  const progress = useMemo(() => (step === "hud" ? progressOf(output, fieldExec) : null), [step, output, fieldExec]);
  const panelIn = tour ? PANEL_FADE : PANEL_IN;
  // Keyboard and screen-reader users land on the new step's heading: the control that changed the step is usually
  // gone (it belonged to the old step), and focus would otherwise fall back to the top of the page. Not while the
  // orientation is open: its card takes focus itself.
  const tourOpen = useRef(false);
  tourOpen.current = tour;
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    // Nor from the masthead's step index: someone walking the steps with the keyboard keeps their place there.
    if (tourOpen.current || document.activeElement?.closest(".masthead nav")) return;
    const heading = [...document.querySelectorAll<HTMLElement>(".app h1")].find((h) => h.getClientRects().length > 0);
    if (heading) { heading.tabIndex = -1; heading.focus(); }
  }, [step]);

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
        // UI-11: one download of the terrain classes (the worker's); the cursor tag reads the engine's own copy.
        e.api.terrainClasses().then((c) => { if (live) { terrainClasses.current = c; setClassesReady(true); } }).catch(() => undefined); // without it the tag says "cannot be checked"
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
    // UX-17: an old refusal never sits over the engine's work on the new action.
    clearActionMessage();
    queue.current = queue.current.then(async () => {
      const e = engine.current, cur = outputRef.current;
      try {
        if (!e || !cur) return say("Not changed: the engine is still loading the area; try again in a moment.");
        const { result, output: next, elapsed_ms } = await e.api.apply({
          id: commandId(), type, payload, issuedAt: new Date().toISOString(), planVersion: cur.plan.versionHash,
        });
        outputRef.current = next;
        setOutput(next);
        say(result.ok ? `Plan updated in ${Math.round(elapsed_ms)} ms.` : `Not changed: ${result.reason}.`,
          type === "add_stop" && result.ok ? (({ id, letter }) => ({ id, letter }))(next.plan.stops.at(-1)!) : undefined); // add_stop appends
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
  /** UX-24: an empty HUD or assessment offers the step that fills it. */
  const toMap = <button type="button" className="key" onClick={() => go("map")}>Place stops on the map<ArrowRight {...ICON} aria-hidden="true" /></button>;
  const recalculating = pending > 0 && output !== null;
  // UX-17: the tour's "try it" lines the plan shows as done (read from the engine's plan, never from a click).
  // Recomputed only when the plan or the confirmation changes, not on every pointer move.
  const tourDone = useMemo(() => {
    const has = (id: string) => !!plan?.assumptions.some((a) => a.id === `A-${id}`);
    return new Set<string>([
      // All four Planner times, as the card says ("every time is set").
      ...(has("T_EVA") && has("t_ops") && has("t_cont") && has("stop_duration") ? ["budget"] : []),
      ...(plan && plan.stops.length > 0 ? ["map"] : []),
      ...(plan && plan.endMargin.valueClass !== "unknown" ? ["route"] : []),
      ...(version && confirmed === version ? ["brief"] : []),
    ]);
  }, [plan, version, confirmed]);
  const pickedStop = plan?.stops.find((s) => s.id === picked) ?? null;
  const movingStop = plan?.stops.find((s) => s.id === moving) ?? null;
  // A map click: move the stop waiting to move, else add a stop (the engine refuses ground that is not slope-screened).
  const onPick = (p: LatLon) => {
    if (moving) { send("move_stop", { stopId: moving, lat: p.lat, lon: p.lon }); setMoving(null); return; }
    setPicked(null);
    send("add_stop", { lat: p.lat, lon: p.lon });
  };

  return (
    <div className="app" data-step={step} data-busy={pending > 0 || (!output && !engineFailed) || contourBusy} data-moving={!!moving} data-view={view}>
      <div className="ambient" aria-hidden="true" />
      <header className="masthead" inert={step === "welcome"}>
        <button type="button" className="wordmark" onClick={() => go("welcome")}>
          <span className="plate-label">SharpWalk</span><span className="sub">Mars walk planner</span>
        </button>
        <nav aria-label="Mission steps">
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button type="button" className="step-key" aria-current={step === s.id ? "step" : undefined} data-done={visited.has(s.id) && s.id !== step} onClick={() => go(s.id)}>
                  <span className="lamp" aria-hidden="true" /><span className="no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><span>{s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mast-tools">
          <button ref={tourKey} type="button" className="key small" data-new={!toured || undefined} onClick={() => setTour(true)}><CircleHelp {...ICON} aria-hidden="true" /><span>Orientation</span></button>
          <button type="button" className="key small" aria-expanded={drawer} onClick={() => setDrawer((o) => !o)}><BookOpen {...ICON} aria-hidden="true" /><span>Sources</span></button>
        </div>
        <span className="progress" aria-hidden="true" />
      </header>
      {step === "welcome" && <Welcome onStart={(t, custom) => { if (!custom && !presetEnabled(location.search)) applyPreset(); go(custom ? "planner" : "map"); setTour(t); }} ready={output ? true : engineFailed ? null : false} />}
      <main className="work" inert={step === "welcome"}>
        <div className="plate" inert={!onMap} aria-hidden={!onMap || undefined} data-tour="map"
          onPointerDown={(e) => { down.current = e.button === 0 && step === "map" && (e.target as HTMLElement).closest(".map") ? { x: e.clientX, y: e.clientY } : null; }}
          onPointerUp={(e) => { // a click, not a pan: the ring marks where the pick went (the engine then answers)
            const d = down.current; down.current = null;
            if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
            const r = e.currentTarget.getBoundingClientRect(); setPing((p) => ({ x: e.clientX - r.left, y: e.clientY - r.top, n: (p?.n ?? 0) + 1 }));
            // UX-17: the map waits out the double-click window before it picks; a refusal from the last click goes now.
            clearActionMessage(true); }}>
          <div className="bezel" aria-hidden="true" />
          <AreaSheet dataUrl={AREA_URL} plan={output} onPick={step === "map" ? onPick : undefined}
            onSelectStop={step === "map" ? (id) => { setPicked(id); setMoving(null); } : undefined} selectedStop={picked}
            popover={step === "map" && pickedStop && !moving ? <StopPopover stop={pickedStop} output={output!} onOpenSource={openSource} onClose={() => setPicked(null)}
              onMove={() => { setMoving(pickedStop.id); setPicked(null); }} onDelete={() => { send("delete_stop", { stopId: pickedStop.id }); setPicked(null); }}
              onEdit={(name, tasks) => send("edit_stop", { stopId: pickedStop.id, name, tasks })} /> : null}
            terrainClasses={classesReady ? terrainClasses.current : null} layers={mapLayers} onLayers={setMapLayers} progress={progress}
            cursorHint={step === "map" ? (movingStop ? `Click to move stop ${movingStop.letter} here · Esc to cancel` : true) : false}
            onSnapshotReady={(fn) => setSnapshot(() => fn)} hoverIndex={hover} onHoverIndex={setHover} onDatasets={setLayerDatasets} onCursor={setCursor}
            contours={contourDisplay} showSky={showSky} onSky={(st, f) => { setSkyState(st); if (f) setSkyAt(() => f); }}
            tools={<>{view === "3d" && <p className="muted view-note">In 3D: elevation contours, time-to-habitat lines, the sky layer and the crew progress mark are drawn on the 2D sheet only.</p>}
              <LayerToggles showContours={showContours} onShowContours={setShowContours} showSky={showSky} onShowSky={setShowSky} skyAvailable={skyState !== "none"} busy={contourBusy} /></>}
            hint={step === "map" ? (movingStop ? `Moving stop ${movingStop.letter}: click its new place` : "Click ground to add a stop · click a stop to edit it")
              : step === "hud" ? "View only · amber = crew from HUD ticks, not GPS" : "View only · edit the route on the Map step"} />
          {ping && <span key={ping.n} className="ping" style={{ left: ping.x, top: ping.y }} aria-hidden="true" />}
          {/* Recalculation feedback: shown while a Command is with the engine (route search, margins). */}
          {/* 3D-05: one switch for the plate; 3D needs the engine (its heights come from the engine's grid). */}
          <div className="view-switch" role="group" aria-label="Map view: 2D or 3D">
            <button type="button" aria-pressed={view === "2d"} onClick={() => setView("2d")}>2D</button>
            <button type="button" aria-pressed={view === "3d"} disabled={!output} title={output ? "Show the terrain in 3D" : engineFailed ? "3D needs the route engine, which could not start" : "3D opens when the engine is ready"}
              onClick={() => setView("3d")}>3D</button>
          </div>
          {view === "3d" && <Suspense fallback={<p className="sheet-msg scene3d-loading" role="status">Loading the 3D view…</p>}>
            <TerrainView areaUrl={AREA_URL} output={output} sampler={sampler} layers={mapLayers} hoverIndex={hover} onHoverIndex={setHover}
              selectedStop={picked} onPick={step === "map" ? onPick : undefined} onSelectStop={step === "map" ? (id) => { setPicked(id); setMoving(null); } : undefined}
              onFail={(why) => { setView("2d"); setTries3d((n) => n + 1); say(`3D view unavailable: ${why}. Showing the 2D sheet.`); }} />
          </Suspense>}
          <p className="recalc" data-on={recalculating} aria-hidden={!recalculating}>
            <LoaderCircle {...ICON} aria-hidden="true" />Engine updating the plan
          </p>
        </div>
        <RouteProfile output={output} hoverIndex={hover} onHoverIndex={setHover} />
        {/* Step panels enter with Motion and leave at once, so a click right after a step change reaches the new step. */}
          {step === "map" && <Appear key="map" className="panel-host" enter={panelIn}><PlanPanel output={output} onOpenSource={openSource} next={next("assess", "Continue to the assessment")}
            onDeleteStop={(id) => send("delete_stop", { stopId: id })} onEditStop={(stopId, name, tasks) => send("edit_stop", { stopId, name, tasks })}
            onSetTime={setTime} skyAt={showSky && skyState === "ok" ? skyAt : null} picked={picked} onPick={(id) => setPicked(id)}
            onMoveToCursor={cursor ? (stopId) => send("move_stop", { stopId, lat: cursor.lat, lon: cursor.lon }) : undefined} /></Appear>}
          {step === "assess" && <Appear key="assess" className="panel-host" enter={panelIn}><AssessPanel output={output} onOpenSource={openSource} drillMin={drillMin} onDrillMin={setDrillMin} busy={contourBusy}
            next={next("hud", "Continue to the field HUD")} fix={next("map", "Back to the map: change the route")} toMap={toMap} /></Appear>}
          {step === "setup" && <Appear key="setup" className="screen-host" enter={panelIn}><SetupScreen output={output} rems={rems} rover={rover} onSet={setTime} onOpenSource={openSource}
            preset={presetEnabled(location.search)} onApplyPreset={applyPreset} next={next("planner", "Continue to the time budget")} /></Appear>}
          {step === "planner" && <Appear key="planner" className="screen-host" enter={panelIn}><PlannerScreen output={output} onSet={setTime} next={next("map", "Continue to the map")} /></Appear>}
        {/* Kept mounted so a built card keeps its version stamp and shows STALE after a plan change. */}
        <BriefingView output={output} snapshot={snapshot} hidden={step !== "brief"} rover={rover}
          confirmed={confirmed} onConfirm={setConfirmed} next={next("hud", "Open the field HUD")} />
        {/* Kept mounted: the field view alone holds MissionExecution, so ticks survive step changes. */}
        <FieldView output={output} hidden={step !== "hud"} toMap={toMap} onExec={setFieldExec} />
        <AnimatePresence>
          {message && <Appear as="p" key={message.n} className="toast" data-kind={message.text.startsWith("Plan updated") ? "ok" : "hold"} data-testid="engine-message"
            enter={{ opacity: [0, 1], transform: ["translateY(-10px) scale(0.97)", "translateY(0px) scale(1)"] }} exit={{ opacity: [1, 0] }}><span aria-hidden="true">{message.text}</span>
            {message.undo && <button type="button" className="textbtn" onClick={(e) => { e.currentTarget.disabled = true; send("delete_stop", { stopId: message.undo!.id }); }}>Undo stop {message.undo.letter}</button>}</Appear>}
        </AnimatePresence>
        <p className="sr-only" role="status" data-testid="engine-announce">{announce}</p>
        {/* Always mounted (inert and hidden while closed) so the datasets-in-view list stays current. */}
        <aside className="drawer" data-open={drawer} aria-label="Source drawer" inert={!drawer}>
          <SourcePanel selected={selected} provenance={provenance} assumptions={plan?.assumptions ?? []}
            datasetsInView={datasetsInView} extraSources={extraSources} onClose={() => { setSelected(null); setDrawer(false); }} />
          <GlossaryList />
        </aside>
      </main>
      <Tutorial open={tour} step={step} onClose={() => { setTour(false); setToured(true); tourKey.current?.focus(); }} go={go} done={tourDone} />
      <footer className="colophon">
        <span>Independent student project; not affiliated with or endorsed by NASA.</span>
        {plan && <span className="stamp">Plan {plan.versionHash} · {plan.engineVersion} · suit life support not modelled</span>}
      </footer>
    </div>
  );
}
