// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (MOT-03); human Design review pending.
// Motion 14.11.1 (MIT; the plan's pinned version) owns React enter, exit and layout animation. LazyMotion with the
// domAnimation feature set keeps the bundle small; MotionConfig follows the user's reduced-motion setting.
import type { ReactNode } from "react";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";

export { AnimatePresence, m };

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.28, ease: EASE_OUT }}>{children}</MotionConfig>
    </LazyMotion>
  );
}

/** A panel or page that settles in when its step opens. It leaves at once (no exit animation): a leaving panel would
 *  sit over the new step and take the user's first click. */
export const panelMotion = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
} as const;
