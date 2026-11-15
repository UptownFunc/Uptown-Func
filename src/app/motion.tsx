// SI-assisted: drafted with Claude Code (Claude Opus 5.5), reduced to Motion's small entry points with Claude Fable 5.2
// on design/sharpwalk-ui-ux (MOT-04); human Design review pending.
// Motion 14.11.1 (MIT; the plan's pinned version) owns enter and exit animation. `Appear` plays its keyframes with
// Motion's `animate` (motion/mini, Web Animations API) and waits for `AnimatePresence` before it leaves, which is the
// part of Motion this app needs; the full `motion` component (about 30 kB gzipped) is not bundled (B-01, AC-12).
// Reduced motion: nothing is animated and a leaving element is removed at once.
import { useCallback, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type Ref } from "react";
import { animate } from "motion/mini";
import { AnimatePresence, usePresence } from "motion/react";
import { EASE_OUT, play, still } from "./fx";

export { AnimatePresence };

type Frames = Record<string, (string | number)[]>;

/** A panel or page that settles in when its step opens. It leaves at once (no exit animation): a leaving panel would
 *  sit over the new step and take the user's first click. */
export const PANEL_IN: Frames = { opacity: [0, 1], transform: ["translateY(14px)", "translateY(0px)"], filter: ["blur(4px)", "blur(0px)"] };
/** UX-17: while the orientation tour leads, a step's panel only fades in. It does not travel, so the spotlight can lock
 *  on to its control in the same frame instead of chasing a moving box. */
export const PANEL_FADE: Frames = { opacity: [0, 1] };

interface AppearProps extends HTMLAttributes<HTMLElement> {
  /** Keyframes played once when the element mounts; the last one must equal the stylesheet state. */
  readonly enter: Frames;
  /** Keyframes played before the element is removed (needs an AnimatePresence parent); omitted = removed at once. */
  readonly exit?: Frames;
  readonly as?: "div" | "p";
  readonly ref?: Ref<HTMLElement>;
}

export function Appear({ enter, exit, as = "div", ref, ...rest }: AppearProps) {
  const el = useRef<HTMLElement | null>(null);
  const [present, safeToRemove] = usePresence();
  useLayoutEffect(() => {
    if (el.current) void play(el.current, enter, { duration: 0.28, ease: EASE_OUT }); // play() skips when nothing should move
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- plays once, on mount
  useEffect(() => {
    if (present) return;
    const node = el.current;
    if (!node || !exit || still(node)) { safeToRemove?.(); return; }
    const done = () => safeToRemove?.();
    animate(node, exit, { duration: 0.13, ease: "easeIn" }).finished.then(done, done);
  }, [present]); // eslint-disable-line react-hooks/exhaustive-deps -- runs when AnimatePresence asks the element to leave
  const setRef = useCallback((node: HTMLElement | null) => {
    el.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);
  const Tag = as as "div";
  return <Tag ref={setRef as Ref<HTMLDivElement>} {...(rest as HTMLAttributes<HTMLDivElement>)} />;
}
