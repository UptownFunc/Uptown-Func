// SI-assisted: drafted with Claude Code (Claude Opus 5.5), audited with Claude Fable 5.2 on design/sharpwalk-ui-ux
// (UI-12, MOT-04, R-25); human Design review pending.
// Orientation for new crews: eight cards that walk through the real screens, each pointing a spotlight at the control
// it explains. It never blocks the app (the dim layer lets clicks through), so the user can try each step as it is
// explained. Motion glides the spotlight and swaps the cards. Esc closes; the arrow keys move between cards, but only
// from the card itself or the page body, never from the map or a field.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { StepId } from "./steps";
import { AnimatePresence, Appear } from "./motion";
import { moveSpotlight, reduced } from "./fx";

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

type Box = { x: number; y: number; w: number; h: number };

/** step: the step the app shows now. When the user leaves the card's own step, the spotlight lets go of its target. */
export function Tutorial({ open, onClose, go, step }: { open: boolean; onClose: () => void; go: (s: StepId) => void; step: StepId }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const hole = useRef<HTMLDivElement>(null);
  /** True when the next move follows the page (scroll, resize): the spotlight then keeps up instead of gliding. */
  const follow = useRef(false);
  const t = TOUR[i]!;
  // Each card takes focus when it mounts (after the previous one has left), so its title is announced.
  const focusCard = useCallback((el: HTMLElement | null) => { el?.focus({ preventScroll: true }); }, []);
  // Steps are relative to the latest card, not to the card that drew the button: a quick second click lands on the
  // card that is still leaving, and must not be swallowed.
  const turn = (d: 1 | -1) => setI((v) => Math.min(TOUR.length - 1, Math.max(0, v + d)));
  const close = () => { try { localStorage.setItem(STORE, "1"); } catch { /* storage may be blocked */ } setI(0); onClose(); };

  useEffect(() => { if (open) go(t.step); }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bring the target into view, measure it once the step's panel has settled, and follow it on resize and scroll.
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = step === t.step ? document.querySelector<HTMLElement>(`[data-tour="${t.target}"]`) : null;
      const r = el?.getBoundingClientRect();
      // 8 px of air around the target, kept inside the window (a tall form runs past the bottom edge).
      const x0 = r ? Math.max(4, r.left - 8) : 0, y0 = r ? Math.max(4, r.top - 8) : 0;
      const x1 = r ? Math.min(innerWidth - 4, r.right + 8) : 0, y1 = r ? Math.min(innerHeight - 4, r.bottom + 8) : 0;
      const next = r && r.width > 0 && x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
      setBox((b) => (b && next && b.x === next.x && b.y === next.y && b.w === next.w && b.h === next.h ? b : next));
    };
    const later = () => { follow.current = true; frame ||= requestAnimationFrame(measure); };
    const timer = window.setTimeout(() => {
      const el = step === t.step ? document.querySelector<HTMLElement>(`[data-tour="${t.target}"]`) : null;
      const r = el?.getBoundingClientRect();
      // Only a target that is off screen is scrolled to; the map and the fixed panels never move.
      if (el && r && (r.top < 0 || r.top > innerHeight - 120)) el.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
      follow.current = false;
      measure();
    }, 320);
    addEventListener("resize", later);
    addEventListener("scroll", later, { capture: true, passive: true });
    return () => { clearTimeout(timer); if (frame) cancelAnimationFrame(frame); removeEventListener("resize", later); removeEventListener("scroll", later, { capture: true }); };
  }, [open, i, t.target, t.step, step]);

  // The spotlight glides to the measured target; with no target (another step, or not found) it closes to a point.
  useEffect(() => {
    const el = hole.current;
    if (!open || !el) return;
    const to = box ?? { x: innerWidth / 2, y: innerHeight / 2, w: 0, h: 0 };
    // It opens from a point at the centre. Its position is never a React style prop: a re-render must not move it.
    const fresh = !el.style.width;
    if (fresh) Object.assign(el.style, { left: `${innerWidth / 2}px`, top: `${innerHeight / 2}px`, width: "0px", height: "0px" });
    moveSpotlight(el, to, follow.current && !fresh);
    follow.current = false;
  }, [open, box]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      // Arrows turn cards only from the tour itself or the page body: on the map they move the cursor, in a field the caret.
      const from = e.target as HTMLElement | null;
      if (from && from !== document.body && !from.closest(".tour-card")) return;
      if (e.key === "ArrowRight") turn(1);
      else if (e.key === "ArrowLeft") turn(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card beside the spotlight where it fits, otherwise below it, otherwise centred.
  const W = 380, vw = typeof innerWidth === "number" ? innerWidth : 1280, vh = typeof innerHeight === "number" ? innerHeight : 800;
  const place = !box || vw < 800 ? { left: Math.max(12, (vw - Math.min(W, vw - 24)) / 2), bottom: 24 }
    : box.x + box.w + W + 24 < vw ? { left: box.x + box.w + 16, top: Math.min(Math.max(box.y, 90), vh - 360) }
    : box.x - W - 16 > 0 ? { left: box.x - W - 16, top: Math.min(Math.max(box.y, 90), vh - 360) }
    : { left: Math.max(12, Math.min(box.x, vw - W - 12)), top: Math.min(box.y + box.h + 12, vh - 330) };

  return (
    <AnimatePresence>
      {open && (
        <Appear className="tour" key="tour" enter={{ opacity: [0, 1] }} exit={{ opacity: [1, 0] }}>
          {/* One element is both the dim layer (its shadow) and the ring; it never takes a click. */}
          <div ref={hole} className={box ? "tour-hole tour-ring" : "tour-hole"} aria-hidden="true" />
          <AnimatePresence mode="wait">
            <Appear key={i} ref={focusCard} className="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" tabIndex={-1} style={{ ...place, width: Math.min(W, vw - 24) }}
              enter={{ opacity: [0, 1], transform: ["translateY(12px) rotate(-1.2deg)", "translateY(0px) rotate(0deg)"] }}
              exit={{ opacity: [1, 0], transform: ["translateY(0px)", "translateY(-8px)"] }}>
              <div className="tour-head">
                <span className="tour-kicker">Orientation</span>
                <span className="tour-count" aria-label={`Card ${i + 1} of ${TOUR.length}`}>{i + 1} / {TOUR.length}</span>
                <button type="button" className="tour-x" onClick={close} aria-label="Close orientation"><X size={16} strokeWidth={2} /></button>
              </div>
              <h2 id="tour-title">{t.title}</h2>
              <p>{t.body}</p>
              <div className="tour-progress" aria-hidden="true">{TOUR.map((_, k) => <span key={k} data-on={k <= i} />)}</div>
              <div className="tour-keys">
                <button type="button" className="key" onClick={() => turn(-1)} disabled={i === 0}><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />Back</button>
                {i < TOUR.length - 1
                  ? <button type="button" className="key primary" onClick={() => turn(1)}>Next<ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></button>
                  : <button type="button" className="key primary" onClick={close}>Finish orientation</button>}
              </div>
            </Appear>
          </AnimatePresence>
        </Appear>
      )}
    </AnimatePresence>
  );
}
