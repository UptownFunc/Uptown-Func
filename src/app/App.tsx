// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Tier 1 shell: the AREA sheet is the largest, brightest surface (plan 9). Every view carries the footer.
// The engine worker is the only writer of MissionPlan; the console sends it Commands and shows the copies it returns.
import { useCallback, useEffect, useRef, useState } from "react";
import { AreaSheet } from "../map/AreaSheet";
import { createEngine, type EngineClient } from "../engine/client";
import type { LatLon, PlanOutput } from "../engine/planner";
import { PlanPanel } from "./PlanPanel";
import { RouteProfile } from "./RouteProfile";
import { SourcePanel } from "./SourcePanel";
import { Provenance, type Quantity } from "../contracts";
import { BriefingView } from "../briefing/BriefingView";
import { FieldView } from "../field/FieldView";
import type { MapSnapshot } from "../map/snapshot";

const AREA_URL = "area/";
/** H-01 (DECISIONS.md, pending team confirmation): the slope-screened cell nearest the plan 19.2 suggestion
 *  (4.795 S, 137.392 E), which itself lies on ground over the 20 deg limit. Assumed scenario input, not a base site. */
export const DEFAULT_HABITAT: LatLon = { lat: -4.795211, lon: 137.391845 };

let commandSeq = 0;
/** crypto.randomUUID exists only in secure contexts; a plain-http LAN demo needs a fallback. */
const commandId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `cmd-${Date.now()}-${++commandSeq}`;

export function App() {
  const engine = useRef<EngineClient | null>(null);
  const [output, setOutput] = useState<PlanOutput | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<Quantity | null>(null);
  const [provenance, setProvenance] = useState<Provenance[]>([]);
  const [layerDatasets, setLayerDatasets] = useState<string[]>([]);
  const [cursor, setCursor] = useState<LatLon | null>(null);
  // UX-15: every dataset in the current view = the sheet's layer sources plus the datasets the plan's numbers use.
  const datasetsInView = [...new Set([...layerDatasets, ...(output?.plan.provenanceIds ?? [])])].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  useEffect(() => {
    // provenance.json is the pipeline's record (UX-15); it is validated against the shared contract.
    fetch(new URL(AREA_URL + "provenance.json", document.baseURI)).then((r) => (r.ok ? r.json() : []))
      .then((j: unknown) => { const p = Provenance.array().safeParse(j); setProvenance(p.success ? p.data : []); })
      .catch(() => setProvenance([]));
  }, []);
  const [view, setView] = useState<"planning" | "briefing" | "field">("planning");
  const [snapshot, setSnapshot] = useState<(() => Promise<MapSnapshot | null>) | null>(null);
  const outputRef = useRef(output);
  outputRef.current = output;

  useEffect(() => {
    const e = createEngine();
    engine.current = e;
    let live = true;
    // Resolve against the page, not the worker script (whose URL differs in dev and build).
    e.api.init(new URL(AREA_URL, document.baseURI).href, DEFAULT_HABITAT)
      .then((o) => { if (live) setOutput(o); })
      .catch((err: unknown) => { if (live) setMessage(`Engine could not start: ${err instanceof Error ? err.message : String(err)}`); });
    return () => { live = false; e.terminate(); engine.current = null; };
  }, []);

  // Commands run one at a time, each against the plan version the previous one produced, so quick clicks are
  // not refused as stale. Failures are shown, never swallowed.
  const queue = useRef<Promise<void>>(Promise.resolve());
  // A hover index belongs to one plan's profile; drop it when the plan version changes.
  const version = output?.plan.versionHash;
  useEffect(() => { setHover(null); }, [version]);

  const send = useCallback((type: string, payload: Record<string, unknown>) => {
    queue.current = queue.current.then(async () => {
      const e = engine.current, cur = outputRef.current;
      if (!e || !cur) return;
      try {
        const { result, output: next, elapsed_ms } = await e.api.apply({
          id: commandId(), type, payload, issuedAt: new Date().toISOString(), planVersion: cur.plan.versionHash,
        });
        outputRef.current = next;
        setOutput(next);
        setMessage(result.ok ? `Plan updated in ${Math.round(elapsed_ms)} ms.` : `Not changed: ${result.reason}.`);
      } catch (err: unknown) {
        setMessage(`Engine error: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  }, []);

  return (
    <div className="housing">
      <header className="titlebar">
        <span className="wordmark">SharpWalk</span>
        <span className="muted">AREA sheet - slope-screened only, no rock detection</span>
        <nav className="nav" aria-label="Views">
          {(["planning", "briefing", "field"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>{{ planning: "Planning", briefing: "Briefing", field: "Field View" }[v]}</button>
          ))}
        </nav>
      </header>
      <main className="well">
        <AreaSheet dataUrl={AREA_URL} plan={output} onPick={(p) => send("add_stop", { lat: p.lat, lon: p.lon })}
          onSnapshotReady={(fn) => setSnapshot(() => fn)} hoverIndex={hover} onHoverIndex={setHover} onDatasets={setLayerDatasets} onCursor={setCursor} />
        <RouteProfile output={output} hoverIndex={hover} onHoverIndex={setHover} />
        {/* Kept mounted so a built card keeps its version stamp and shows STALE after a plan change. */}
        <BriefingView output={output} snapshot={snapshot} hidden={view !== "briefing"} />
        {/* Kept mounted: the field view alone holds MissionExecution, so ticks survive switching views. */}
        <FieldView output={output} hidden={view !== "field"} />
        <PlanPanel output={output} message={message} onDeleteStop={(id) => send("delete_stop", { stopId: id })}
          onSetTime={(id, value_s, rationale, stopId) => send("set_assumption", { id, value_s, rationale, ...(stopId ? { stopId } : {}) })}
          onOpenSource={setSelected}
          onMoveToCursor={cursor ? (stopId) => send("move_stop", { stopId, lat: cursor.lat, lon: cursor.lon }) : undefined}>
          <SourcePanel selected={selected} provenance={provenance} assumptions={output?.plan.assumptions ?? []}
            datasetsInView={datasetsInView} onClose={() => setSelected(null)} />
        </PlanPanel>
      </main>
      <footer className="footer">Independent student project; not affiliated with or endorsed by NASA.</footer>
    </div>
  );
}
