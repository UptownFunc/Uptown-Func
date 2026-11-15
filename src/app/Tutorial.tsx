// SI-assisted: drafted with Claude Code (Claude Opus 5.5), audited with Claude Fable 5.2 on design/sharpwalk-ui-ux
// (UI-12, MOT-04, R-25); timing and copy reworked with Claude Opus 5.5 on yujin/ux-polish (UX-17); human Design review
// pending.
// Orientation for new crews: eight cards that walk through the real screens, each pointing a spotlight at the control
// it explains. It never blocks the app (the dim layer lets clicks through), so the user can try each step as it is
// explained. Esc closes; the arrow keys move between cards, but only from the card itself or the page body, never
// from the map or a field.
//
// Timing (UX-17): a card change and its step change happen in the same click, and the target is measured before the
// frame is painted, so the new text, the spotlight and the card all start moving in the same frame and arrive
// together (one shared duration). There is one card element for the whole tour: only its words change, so no card
// waits for another to leave. While a step's panel is still settling the spotlight keeps tracking it.
//
// Navigation (TOUR-01, Sun 15 Nov): opened on a step, the tour starts at that step's first card (help for the screen
// the user is on); "Start over" returns to card 1. When the user changes step on their own (masthead, browser Back, a
// Continue key) the tour follows to that step's first card instead of leaving a card about another screen. A resize
// places the card again even when its target did not move.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, CircleCheck, MousePointerClick, RotateCcw, X } from "lucide-react";
import { GLOSSARY, type TermKey } from "./glossary";
import type { StepId } from "./steps";
import { AnimatePresence, Appear } from "./motion";
import { glideCard, moveSpotlight, reduced } from "./fx";

export interface TourCard {
  readonly step: StepId; readonly target: string; readonly title: string; readonly body: string; readonly act: string;
  /** UX-22: the variables this screen shows, each explained in a few plain words on the card. */
  readonly terms: readonly TermKey[];
}

/** Short, one idea per card, each with one thing to try. The words keep the plan's honesty rules (Assumed, estimate). */
export const TOUR: readonly TourCard[] = [
  { step: "planner", target: "budget", title: "Set the time budget",
    body: "Walking gets what the EVA leaves after tasks, contingency and stops, each Assumed.",
    act: "Enter each time with a one-line reason.", terms: ["T_EVA", "t_ops", "t_cont", "stop"] },
  { step: "map", target: "map", title: "Point and click to place stops",
    body: "The tag under the cursor says whether the ground takes a stop before you click. Steeper ground is refused.",
    act: "Click ground to add a stop; click a stop to edit it.", terms: ["slope"] },
  { step: "map", target: "route", title: "Read the route",
    body: "Each leg shows an estimated walking time range. The end margin updates after every change.",
    act: "Check the end margin after each stop.", terms: ["leg", "est", "margin"] },
  { step: "assess", target: "gauge", title: "Judge the return margin",
    body: "OK, NEAR LIMIT or OVER, read at the slow walking speed. An estimate, never a guarantee.",
    act: "Check the state before the walk.", terms: ["states", "slow"] },
  { step: "hud", target: "hud", title: "Carry it in the field",
    body: "During the walk. The margins for continuing and for turning back follow your manual entries.",
    act: "Type the elapsed time, then tick each arrival and departure.", terms: ["elapsed", "tick", "goOn", "goBack"] },
];

const STORE = "sharpwalk.orientation.done";
export const orientationDone = (): boolean => { try { return localStorage.getItem(STORE) === "1"; } catch { return false; } };

/** The first card about a step, or -1 when the step has none (the Welcome screen). */
export const firstCardOf = (s: StepId): number => TOUR.findIndex((c) => c.step === s);

export type Box = { x: number; y: number; w: number; h: number };
const same = (a: Box | null, b: Box | null) => !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/** The spotlight rectangle for a target: 8 px of air around it, kept inside the window (a tall form runs past the
 *  bottom edge). Null when the target is missing or has no box. */
export function spotFor(r: { left: number; top: number; right: number; bottom: number; width: number }, vw: number, vh: number): Box | null {
  const x0 = Math.max(4, r.left - 8), y0 = Math.max(4, r.top - 8), x1 = Math.min(vw - 4, r.right + 8), y1 = Math.min(vh - 4, r.bottom + 8);
  return r.width > 0 && x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

/** The stylesheet docks the card to an edge up to this width (its "Phones" block, max-width: 800px). */
export const NARROW = 800;

/** Card placement: beside the spotlight where it fits, else below it, else above it, else on the side with more room
 *  (a control that fills the window leaves none). H: the card's height as last drawn. On a narrow window (NARROW and
 *  below) the card docks to the edge the spotlight is not on (the stylesheet sets the width). */
export function placeCard(box: Box | null, vw: number, vh: number, W = 380, H = 330):
  { dock: "top" | "bottom" | null; style: { left?: number; top?: number; bottom?: number } } {
  if (vw <= NARROW) return { dock: box && box.y + box.h / 2 > vh / 2 ? "top" : "bottom", style: {} };
  if (!box) return { dock: null, style: { left: Math.max(12, (vw - Math.min(W, vw - 24)) / 2), bottom: 24 } };
  const MAST = 90; // the card never starts under the masthead
  const top = Math.min(Math.max(box.y, MAST), vh - H - 12);
  if (box.x + box.w + W + 24 < vw) return { dock: null, style: { left: box.x + box.w + 16, top } };
  if (box.x - W - 16 > 0) return { dock: null, style: { left: box.x - W - 16, top } };
  const left = Math.max(12, Math.min(box.x, vw - W - 12));
  const below = box.y + box.h + 12, above = box.y - 12 - H;
  if (below + H <= vh - 12) return { dock: null, style: { left, top: below } };
  if (above >= MAST) return { dock: null, style: { left, top: above } };
  return { dock: null, style: { left, top: vh - box.y - box.h >= box.y - MAST ? Math.max(MAST, vh - H - 12) : MAST } };
}

/** step: the step the app shows now. go: moves the app to a step (the tour calls it in the same click as the card
 *  change). done: the targets whose "try it" the user has already carried out (read from the plan, not from clicks).
 *  When the user leaves the card's own step, the spotlight lets go of its target. */
export function Tutorial({ open, onClose, go, step, done }: { open: boolean; onClose: () => void; go: (s: StepId) => void; step: StepId; done?: ReadonlySet<string> }) {
  const [i, setI] = useState(0);
  const at = useRef(0);
  const [box, setBox] = useState<Box | null>(null);
  /** The box last asked for, read synchronously (a state updater may run later than the caller needs). */
  const boxNow = useRef<Box | null>(null);
  const hole = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  /** The step the tour asked for and has not seen yet: until it arrives the spotlight holds still instead of letting go. */
  const wanted = useRef<StepId | null>(null);
  /** True when the next move follows the page (scroll, resize): the spotlight then keeps up instead of gliding. */
  const follow = useRef(false);
  const t = TOUR[i]!;

  const show = (n: number) => {
    at.current = n;
    setI(n);
    const s = TOUR[n]!.step;
    if (s !== step) { wanted.current = s; go(s); }
  };
  const turn = (d: 1 | -1) => {
    const n = Math.min(TOUR.length - 1, Math.max(0, at.current + d));
    if (n !== at.current) show(n);
  };
  const close = () => {
    try { localStorage.setItem(STORE, "1"); } catch { /* storage may be blocked */ }
    at.current = 0; setI(0); wanted.current = null; boxNow.current = null; setBox(null); onClose();
  };

  // Opening: on a step with cards the tour starts at that step's first card; elsewhere at card 1, whose step comes up
  // in the same frame as the tour.
  useLayoutEffect(() => {
    if (!open) return;
    const here = firstCardOf(step);
    if (here >= 0) { at.current = here; setI(here); } else { const s = TOUR[at.current]!.step; wanted.current = s; go(s); }
    card.current?.focus({ preventScroll: true });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // The user changed step on their own: follow to that step's first card (a step the tour asked for is not followed).
  useLayoutEffect(() => {
    if (!open || wanted.current || step === TOUR[at.current]!.step) return;
    const n = firstCardOf(step);
    if (n >= 0) { at.current = n; setI(n); }
  }, [open, step]);

  // A resize re-places the card even when the target kept its box (the card's room changed).
  const [, setViewport] = useState(0);
  useEffect(() => {
    if (!open) return;
    let frame = 0; // at most one re-render per frame while a window edge is dragged
    const onResize = () => { frame ||= requestAnimationFrame(() => { frame = 0; setViewport((n) => n + 1); }); };
    addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", onResize); };
  }, [open]);

  // Measure before paint. While the requested step has not arrived yet, hold the spotlight where it is.
  useLayoutEffect(() => {
    if (!open) return;
    if (step === wanted.current) wanted.current = null;
    if (step !== t.step && wanted.current === t.step) return;
    if (step !== t.step && firstCardOf(step) >= 0) return; // about to follow the user's step (above): no detour
    const find = () => (step === t.step ? document.querySelector<HTMLElement>(`[data-tour="${t.target}"]`) : null);
    /** Returns whether the spotlight has somewhere new to go. */
    const measure = (): boolean => {
      const r = find()?.getBoundingClientRect();
      const next = r ? spotFor(r, innerWidth, innerHeight) : null;
      if (same(boxNow.current, next) || (!boxNow.current && !next)) return false;
      boxNow.current = next;
      setBox(next);
      return true;
    };
    const el = find();
    const r = el?.getBoundingClientRect();
    // Only a target that is off screen is scrolled to, at once: a smooth scroll would leave the spotlight behind.
    if (el && r && (r.top < 0 || r.top > innerHeight - 120)) el.scrollIntoView({ block: "center", behavior: "auto" });
    measure();
    // Follow the page: a scroll or a resize moves the target, and the spotlight keeps up with it.
    let frame = 0;
    // A scroll or resize that did not move the target must not leave the flag set for the next card's glide.
    const later = () => { frame ||= requestAnimationFrame(() => { frame = 0; follow.current = true; if (!measure()) follow.current = false; }); };
    // A target that changes size (a list grows) is followed with the glide. The observer's first call only reports
    // the size it started with, so it is skipped.
    let seen = false;
    const ro = typeof ResizeObserver === "function" && el ? new ResizeObserver(() => { if (seen) measure(); seen = true; }) : null;
    if (ro && el) ro.observe(el);
    addEventListener("resize", later);
    addEventListener("scroll", later, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame); ro?.disconnect();
      removeEventListener("resize", later); removeEventListener("scroll", later, { capture: true });
    };
  }, [open, i, t.target, t.step, step]);

  // The spotlight and the card start their glide in the same frame as the new words, with one shared duration.
  const lastCard = useRef<{ x: number; y: number } | null>(null);
  /** The card's height as drawn, for placing it; a card with more terms is taller, so it is re-placed before paint. */
  const [cardH, setCardH] = useState(330);
  const vw = typeof innerWidth === "number" ? innerWidth : 1280, vh = typeof innerHeight === "number" ? innerHeight : 800;
  const place = placeCard(box, vw, vh, 380, cardH);

  // The card glides from where it is seen now (its layout place plus any glide still running) to its new place, with
  // the spotlight's timing, whatever moved it (a new spotlight, or its own height). It runs before the spotlight's
  // effect below, which clears the "follow the page" flag.
  const placeKey = `${place.dock ?? ""}|${place.style.left ?? ""}|${place.style.top ?? ""}|${place.style.bottom ?? ""}`;
  useLayoutEffect(() => {
    const c = card.current;
    if (!open || !c || c.dataset.dock) { lastCard.current = null; return; } // docked by the stylesheet: it does not travel
    const now = { x: c.offsetLeft, y: c.offsetTop }, was = lastCard.current;
    if (was && !follow.current && (was.x !== now.x || was.y !== now.y)) {
      const m = new DOMMatrixReadOnly(getComputedStyle(c).transform === "none" ? undefined : getComputedStyle(c).transform);
      glideCard(c, was.x - now.x + m.m41, was.y - now.y + m.m42);
    }
    lastCard.current = now;
  }, [open, placeKey]);

  useLayoutEffect(() => {
    const el = hole.current;
    if (!open || !el) return;
    const to = box ?? { x: innerWidth / 2, y: innerHeight / 2, w: 0, h: 0 };
    // It opens from a point at the centre. Its position is never a React style prop: a re-render must not move it.
    const fresh = !el.style.width;
    if (fresh) Object.assign(el.style, { left: `${innerWidth / 2}px`, top: `${innerHeight / 2}px`, width: "0px", height: "0px" });
    moveSpotlight(el, to, follow.current && !fresh);
    follow.current = false;
  }, [open, box]);

  // Watch the card's height (more terms, or its terms list opened) and place it again before the next paint.
  useLayoutEffect(() => {
    const c = card.current;
    if (!open || !c || typeof ResizeObserver !== "function") return;
    const ro = new ResizeObserver(() => { const h = c.offsetHeight; setCardH((v) => (h && Math.abs(h - v) > 2 ? h : v)); });
    ro.observe(c);
    return () => ro.disconnect();
  }, [open]);

  // Back turns disabled on the first card: keep the keyboard on the card's main key instead of losing focus.
  useEffect(() => { if (open && i === 0 && document.activeElement?.closest(".tour-keys")) primary.current?.focus(); }, [open, i]);

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
  }, [open, step]); // eslint-disable-line react-hooks/exhaustive-deps -- turn() reads the step it compares against

  const last = i === TOUR.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <Appear className="tour" key="tour" data-reduced={reduced() || undefined} enter={{ opacity: [0, 1] }} exit={{ opacity: [1, 0] }}>
          {/* One element is both the dim layer (its shadow) and the ring; it never takes a click. */}
          <div ref={hole} className={box ? "tour-hole tour-ring" : "tour-hole"} aria-hidden="true" data-testid="tour-spotlight" />
          <div ref={card} className="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" tabIndex={-1}
            data-dock={place.dock ?? undefined} data-card={i + 1} style={{ ...place.style, width: vw <= NARROW ? undefined : Math.min(380, vw - 24) }}>
            <div className="tour-head">
              <span className="tour-kicker">Orientation</span>
              <span className="tour-count" aria-label={`Card ${i + 1} of ${TOUR.length}`}>{i + 1} / {TOUR.length}</span>
              {i > 0 && <button type="button" className="tour-restart" onClick={() => show(0)}><RotateCcw size={14} strokeWidth={2} aria-hidden="true" />Start over</button>}
              <button type="button" className="tour-x" onClick={close} aria-label="Close orientation"><X size={16} strokeWidth={2} /></button>
            </div>
            {/* Screen readers hear each card from one region that stays mounted (a remounted region is not announced
                reliably); the visible words below only animate. */}
            <p className="sr-only" aria-live="polite" data-testid="tour-announce">{`Card ${i + 1} of ${TOUR.length}. ${t.title}. ${t.body} ${done?.has(t.target) ? "Done" : "Try it"}: ${t.act} Terms: ${t.terms.map((k) => `${GLOSSARY[k].term}, ${GLOSSARY[k].brief}`).join("; ")}.`}</p>
            <Appear key={i} className="tour-words" enter={{ opacity: [0, 1], transform: ["translateX(10px)", "translateX(0px)"] }}>
              <h2 id="tour-title">{t.title}</h2>
              <p>{t.body}</p>
              {/* The thing to try; it turns to Done when the plan shows the user did it, so the tour answers their action. */}
              <p className="tour-act" data-done={done?.has(t.target) || undefined} data-testid="tour-act">
                {done?.has(t.target) ? <CircleCheck size={16} strokeWidth={2} aria-hidden="true" /> : <MousePointerClick size={16} strokeWidth={2} aria-hidden="true" />}
                <span><span className="sr-only">{done?.has(t.target) ? "Done: " : "Try it: "}</span>{t.act}</span></p>
              {/* UX-22: what each variable on this screen means, in a few words. Open on a large window; on a laptop or a phone it
                  folds so the card stays small (the same words are on the screen itself, under each field). */}
              <details className="tour-terms" open={(vw > 1240 && vh >= 860) || undefined}>
                <summary><BookOpenText size={15} strokeWidth={2} aria-hidden="true" />Terms on this screen ({t.terms.length})</summary>
                <dl>{t.terms.map((k) => <div key={k}><dt title={GLOSSARY[k].term}>{GLOSSARY[k].short}</dt><dd>{GLOSSARY[k].brief}</dd></div>)}</dl>
              </details>
            </Appear>
            {/* Pointer users can jump to any card; keyboard users have Back, Next and the arrow keys (one tab stop). */}
            <div className="tour-progress">{TOUR.map((c, k) => <button key={k} type="button" tabIndex={-1} data-on={k <= i} aria-current={k === i ? "step" : undefined}
              aria-label={`Card ${k + 1}: ${c.title}`} title={c.title} onClick={() => k !== i && show(k)} />)}</div>
            <div className="tour-keys">
              <button type="button" className="key" onClick={() => turn(-1)} disabled={i === 0}><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />Back</button>
              {/* One key for Next and Finish, so focus stays on it from the first card to the last. */}
              <button ref={primary} type="button" className="key primary" onClick={() => (last ? close() : turn(1))}>
                {last ? "Finish orientation" : <>Next<ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></>}
              </button>
            </div>
          </div>
        </Appear>
      )}
    </AnimatePresence>
  );
}
