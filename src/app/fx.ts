// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (MOT-03); human Design review pending.
// Anime.js 4.5.0 (MIT) owns the timelines: the CRT power-on, the orientation spotlight, the margin gauge needle and
// the rubber stamp. Motion owns component enter, exit and layout (motion.tsx); CSS owns hover and press states. One
// owner per element. Every timeline collapses to its end state under prefers-reduced-motion.
import { animate, createTimeline, stagger } from "animejs";

export const reduced = (): boolean => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The welcome monitor warms up: a bright line, the picture opens, a short phosphor flicker, then the copy types in. */
export function crtPowerOn(screen: HTMLElement, lines: HTMLElement[]): void {
  if (reduced()) return;
  createTimeline({ defaults: { ease: "outExpo" } })
    .add(screen, { scaleY: [0.006, 1], scaleX: [0.6, 1], filter: ["brightness(3)", "brightness(1)"], duration: 700 })
    .add(screen, { opacity: [1, 0.86, 1, 0.94, 1], duration: 260, ease: "linear" }, "-=120")
    .add(lines, { opacity: [0, 1], translateY: [10, 0], delay: stagger(90), duration: 520 }, "-=200");
}

/** Glides the orientation spotlight to a target rectangle (a spring-like settle, interruptible). */
export function moveSpotlight(el: SVGRectElement | HTMLElement, r: { x: number; y: number; w: number; h: number }): void {
  const to = { x: r.x, y: r.y, width: r.w, height: r.h };
  if (reduced()) { Object.entries(to).forEach(([k, v]) => el.setAttribute(k, String(v))); return; }
  animate(el, { ...to, duration: 520, ease: "outElastic(1, .9)" });
}

/** Swings the gauge needle to an angle in degrees, with a little overshoot like a moving-coil meter. */
export function swingNeedle(needle: SVGElement, deg: number): void {
  if (reduced()) { needle.style.transform = `rotate(${deg}deg)`; return; }
  animate(needle, { rotate: deg, duration: 1100, ease: "outElastic(1, .55)" });
}

/** The rubber stamp lands: drops in large and tilted, hits, and the ink settles. */
export function stampSlam(el: HTMLElement): void {
  if (reduced()) return;
  createTimeline()
    .add(el, { scale: [2.4, 0.94], rotate: [-28, -12], opacity: [0, 1], duration: 300, ease: "inQuad" })
    .add(el, { scale: 1, duration: 260, ease: "outBack(3)" });
}
