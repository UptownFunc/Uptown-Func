// SI-assisted: drafted with Claude Code (Claude Opus 5.5), rewritten on Motion with Claude Fable 5.2 on
// design/sharpwalk-ui-ux (MOT-04); human Design review pending.
// Motion 14.11.1 owns the timelines: the CRT power-on, the orientation spotlight, the margin-meter needle, the ladder trace and the
// rubber stamp. They use Motion's small `animate` (motion/mini), which runs on the browser's Web Animations API, so no
// second animation library is installed (CLAUDE.md). Motion also owns enter and exit (motion.tsx); CSS owns hover and
// press states. One owner per element. Every timeline collapses to its end state under prefers-reduced-motion.
import { animate } from "motion/mini";

export const reduced = (): boolean => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * True when nothing should be animated on this element: the user asked for reduced motion, or the element is not
 * rendered (display: none, e.g. the toast on the Welcome step). The second case is not only a saving: when Motion
 * interrupts a running animation it commits the current style, and the browser throws for an element with no box.
 */
export const still = (el: Element): boolean => reduced() || el.getClientRects().length === 0;

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** One overshoot and a settle, like a damped pointer. */
const BACK_OUT = [0.34, 1.56, 0.64, 1] as const;

type Frames = Record<string, string | number | (string | number)[]>;
type Ease = readonly number[] | "linear" | "easeIn";
type Timing = { duration: number; delay?: number; times?: number[]; ease?: Ease | Ease[] };

/**
 * Runs one Motion animation whose last keyframe equals the element's stylesheet state, then hands the element back to
 * the stylesheet: Motion leaves the last keyframe as an inline style, and a leftover `filter` or `transform` would keep
 * a compositing layer (and override later CSS states) for no visible gain.
 * Contract: use it only when the last keyframe IS the stylesheet state. When nothing should move (reduced motion, or
 * the element is not rendered) it does nothing at all, which is correct only under that contract. An animation that
 * ends somewhere else must set its end state itself in that case, as swingNeedle and moveSpotlight do.
 */
export function play(el: HTMLElement | SVGElement, frames: Frames, timing: Timing): Promise<void> {
  if (still(el)) return Promise.resolve();
  const a = animate(el, frames as Parameters<typeof animate>[1], timing as Parameters<typeof animate>[2]);
  return a.finished.then(() => { for (const k of Object.keys(frames)) el.style.removeProperty(k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)); }, () => undefined);
}

/** The welcome monitor warms up: a bright line, the picture opens, a short phosphor flicker, then the copy types in. */
export function crtPowerOn(screen: HTMLElement, lines: HTMLElement[]): void {
  if (still(screen)) return;
  // The terrain keeps its sepia tone (stylesheet filter); only its brightness drops from the warm-up flash.
  const tone = getComputedStyle(screen).filter;
  const flash = tone && tone !== "none" ? `${tone} brightness(3)` : "brightness(3)";
  void play(screen, { transform: ["scale(0.6, 0.006)", "scale(1, 1)"], filter: [flash, tone && tone !== "none" ? `${tone} brightness(1)` : "brightness(1)"] }, { duration: 0.7, ease: EXPO_OUT });
  void play(screen, { opacity: [1, 0.86, 1, 0.94, 1] }, { duration: 0.26, delay: 0.58, ease: "linear" });
  lines.forEach((line, i) => void play(line, { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] }, { duration: 0.52, delay: 0.64 + i * 0.09, ease: EXPO_OUT }));
}

/** One glide for the orientation tour (UX-17): the spotlight and the card share it, so they arrive together. Fast out
 *  of the gate (most of the way in the first third), so the ring is on its new target almost at once, then it eases in. */
export const GLIDE_S = 0.34;

/** Glides the orientation spotlight to a target rectangle (interruptible: a new target carries on from where it is).
 *  instant: the target itself moved (the page scrolled or was resized), so the spotlight keeps up with it. */
export function moveSpotlight(el: HTMLElement, r: { x: number; y: number; w: number; h: number }, instant = false): void {
  const to = { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` };
  if (instant || still(el)) { animate(el, to, { duration: 0 }); return; }
  animate(el, to, { duration: GLIDE_S, ease: EXPO_OUT });
}

/** The orientation card follows its spotlight: it is laid out at its new place at once and glides there from where it
 *  was seen (dx, dy: that offset), with the spotlight's timing. A transform only, so nothing is laid out again. */
export function glideCard(el: HTMLElement, dx: number, dy: number): void {
  if (still(el) || (Math.abs(dx) < 1 && Math.abs(dy) < 1)) { el.style.removeProperty("transform"); return; }
  void play(el, { transform: [`translate(${dx}px, ${dy}px)`, "translate(0px, 0px)"] }, { duration: GLIDE_S, ease: EXPO_OUT });
}

/** Swings the meter needle to an angle in degrees, with a little overshoot like a moving-coil meter. */
export function swingNeedle(needle: SVGElement, deg: number): void {
  const to = `rotate(${deg}deg)`;
  if (still(needle)) { needle.style.transform = to; return; }
  // One keyframe: Motion starts from where the needle is now, so a new reading mid-swing carries on from there.
  animate(needle, { transform: to }, { duration: 1.1, ease: BACK_OUT });
}

/** The rubber stamp lands: drops in large and tilted, hits, and the ink settles at the stylesheet's resting tilt. */
export function stampSlam(el: HTMLElement): void {
  if (still(el)) return;
  const rest = getComputedStyle(el).opacity;
  void play(el, { opacity: [0, rest] }, { duration: 0.3, ease: "easeIn" });
  void play(el, { transform: ["scale(2.4) rotate(-28deg)", "scale(0.94) rotate(-12deg)", "scale(1) rotate(-12deg)"] },
    { duration: 0.56, times: [0, 0.54, 1], ease: ["easeIn", BACK_OUT] });
}

/**
 * ASSESS-01: a pen traces the traverse ladder from the habitat back to the habitat, in the order the assessment adds
 * each walk and stop to the margin, then fades and starts again. An illustration of the method, never a live run: it
 * loops on a fixed timing whatever the engine does. Returns the running animation (paused and played by its owner as
 * the ladder leaves and enters the view), or null when nothing should move: the element then stays at its stylesheet
 * state, which hides it, so reduced motion shows the ladder as it was.
 */
export function traceLadder(el: HTMLElement): ReturnType<typeof animate> | null {
  if (still(el)) return null;
  return animate(el, { transform: ["scaleY(0)", "scaleY(1)", "scaleY(1)", "scaleY(1)", "scaleY(1)"], opacity: [1, 1, 1, 0, 0] },
    { duration: 4.6, times: [0, 0.56, 0.74, 0.88, 1], ease: [[0.65, 0, 0.35, 1], "linear", "easeIn", "linear"], repeat: Infinity } as Parameters<typeof animate>[2]);
}
