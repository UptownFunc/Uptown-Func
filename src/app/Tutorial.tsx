// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-12); human Design review pending.
// Orientation for new crews: eight cards that walk through the real screens, each pointing a spotlight at the control
// it explains. It never blocks the app (the dim layer lets clicks through), so the user can try each step as it is
// explained. Anime.js glides the spotlight; Motion swaps the cards. Esc closes; the arrow keys move between cards.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { StepId } from "./steps";
import { AnimatePresence, m } from "./motion";
import { moveSpotlight } from "./fx";

export const TOUR: readonly { step: StepId; target: string; title: string; body: string }[] = [
  { step: "setup", target: "scenario", title: "Pick a scenario",
    body: "The demonstration scenario loads plan times picked from cited planning documents, every one Assumed and editable. Blank starts with nothing set." },
  { step: "setup", target: "conditions", title: "Check the conditions",
    body: "The walk's date and time drive the sun values (Mars24, model-derived at the area centre). Change them here, with a reason." },
  { step: "planner", target: "budget", title: "Set the time budget",
    body: "EVA duration, less tasks, contingency and stops, is what walking can use. Each time needs a one-line reason; the margin stays unknown until all are set." },
  { step: "map", target: "map", title: "Point and click to place stops",
    body: "The tag under the cursor tells you before you click: slope-screened ground takes a stop, steeper ground is refused. Click a stop on the map to rename, move or delete it; its time at the stop is set in the Route panel." },
  { step: "map", target: "route", title: "Read the route",
    body: "Each leg's walking time is an estimated range from lunar-gravity walking tests. The end margin updates after every change." },
  { step: "hud", target: "hud", title: "Carry it in the field",
    body: "During the walk, type the elapsed time and tick each arrival and departure. The margins for continuing and for turning back follow your ticks." },
  { step: "assess", target: "gauge", title: "Judge the return margin",
    body: "The meter reads OK, NEAR LIMIT or OVER from the slow walking bound. It is an estimate under stated assumptions, never a guarantee." },
  { step: "brief", target: "brief", title: "Brief and confirm",
    body: "Generate the card from the current plan, tick the three acknowledgements, confirm and print. Any later change marks the card stale." },
];

const STORE = "sharpwalk.orientation.done";
export const orientationDone = (): boolean => { try { return localStorage.getItem(STORE) === "1"; } catch { return false; } };

export function Tutorial({ open, onClose, go }: { open: boolean; onClose: () => void; go: (s: StepId) => void }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const hole = useRef<SVGRectElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const t = TOUR[i]!;
  // Each card takes focus when it mounts (after the previous one has left), so its title is announced.
  const focusCard = useCallback((el: HTMLDivElement | null) => { card.current = el; el?.focus({ preventScroll: true }); }, []);
  const close = () => { try { localStorage.setItem(STORE, "1"); } catch { /* storage may be blocked */ } setI(0); onClose(); };

  useEffect(() => { if (open) go(t.step); }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure the target once the step's panel has settled, and again on resize.
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${t.target}"]`);
      const r = el?.getBoundingClientRect();
      const next = r && r.width > 0 ? { x: r.left - 8, y: r.top - 8, w: r.width + 16, h: r.height + 16 } : null;
      setBox(next);
      if (next && hole.current) moveSpotlight(hole.current, next);
    };
    const timer = window.setTimeout(measure, 320);
    addEventListener("resize", measure);
    return () => { clearTimeout(timer); removeEventListener("resize", measure); };
  }, [open, i, t.target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      // Arrows turn cards only from the tour itself or the page body: on the map they move the cursor, in a field the caret.
      const t = e.target as HTMLElement | null;
      if (t && t !== document.body && !t.closest(".tour-card")) return;
      else if (e.key === "ArrowRight" && i < TOUR.length - 1) setI(i + 1);
      else if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card beside the spotlight where it fits, otherwise below it, otherwise centred.
  const W = 380, vw = typeof innerWidth === "number" ? innerWidth : 1280, vh = typeof innerHeight === "number" ? innerHeight : 800;
  const place = !box || vw < 800 ? { left: Math.max(12, (vw - Math.min(W, vw - 24)) / 2), bottom: 24 }
    : box.x + box.w + W + 24 < vw ? { left: box.x + box.w + 16, top: Math.min(Math.max(box.y, 90), vh - 360) }
    : box.x - W - 16 > 0 ? { left: box.x - W - 16, top: Math.min(Math.max(box.y, 90), vh - 360) }
    : { left: Math.max(12, Math.min(box.x, vw - W - 12)), top: Math.min(box.y + box.h + 12, vh - 330) };

  return (
    <AnimatePresence>
      {open && (
        <m.div className="tour" key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
          <svg className="tour-dim" aria-hidden="true" width="100%" height="100%">
            <defs>
              <mask id="tour-hole">
                <rect width="100%" height="100%" fill="white" />
                <rect ref={hole} rx="18" fill="black" x={vw / 2} y={vh / 2} width="0" height="0" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(18, 10, 5, 0.62)" mask="url(#tour-hole)" />
            {box && <rect className="tour-ring" x={box.x} y={box.y} width={box.w} height={box.h} rx="18" />}
          </svg>
          <AnimatePresence mode="wait">
            <m.div key={i} ref={focusCard} className="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" tabIndex={-1} style={{ ...place, width: Math.min(W, vw - 24) }}
              initial={{ opacity: 0, y: 12, rotate: -1.2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}>
              <div className="tour-head">
                <span className="tour-kicker">Orientation</span>
                <span className="tour-count" aria-label={`Card ${i + 1} of ${TOUR.length}`}>{i + 1} / {TOUR.length}</span>
                <button type="button" className="tour-x" onClick={close} aria-label="Close orientation"><X size={16} strokeWidth={2} /></button>
              </div>
              <h2 id="tour-title">{t.title}</h2>
              <p>{t.body}</p>
              <div className="tour-progress" aria-hidden="true">{TOUR.map((_, k) => <span key={k} data-on={k <= i} />)}</div>
              <div className="tour-keys">
                <button type="button" className="key" onClick={() => setI(i - 1)} disabled={i === 0}><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />Back</button>
                {i < TOUR.length - 1
                  ? <button type="button" className="key primary" onClick={() => setI(i + 1)}>Next<ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></button>
                  : <button type="button" className="key primary" onClick={close}>Finish orientation</button>}
              </div>
            </m.div>
          </AnimatePresence>
        </m.div>
      )}
    </AnimatePresence>
  );
}
