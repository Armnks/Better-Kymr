import { useRef } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";

// ============================================================
// CHAPTER SCROLL — depth for the chapters that are not reels
//
// Three chapters carry their argument on one screen rather than through
// a pinned sequence: the hero, the archive and the builds chapter. They
// were the reason the page read as a stack of static screens between two
// cinematic ones.
//
// What this gives them is parallax: the things in a chapter move at
// different rates as it passes, so the chapter has depth rather than
// being one flat plane that scrolls by.
//
// THREE RULES IT IS BUILT AROUND.
//
// 1. IT NEVER TOUCHES A BACKGROUND. The hero's shader field, the signal
//    field and the sonar grid are the site's identity and are explicitly
//    out of scope (owner, 2026-09-08). This hook is applied to content
//    wrappers only. Nothing here can reach a canvas.
//
// 2. IT NEVER CHANGES LAYOUT. Only `transform` and `opacity`, both
//    composited, neither of which reflows anything. That is what lets
//    every locked section height in the regression suite stay locked,
//    and it is why this costs nothing on the main thread.
//
// 3. IT RESPECTS REDUCED MOTION by returning static values, so a visitor
//    who has asked for stillness gets a chapter that simply sits there.
// ============================================================

/**
 * @param {object} opts
 * @param {"through"|"leaving"} opts.mode
 *   "through"  the chapter is passed on the way down; it drifts as it
 *              crosses the viewport, in both directions.
 *   "leaving"  the chapter starts at the top of the page and is only
 *              ever departed from - the hero. It stays put until it
 *              begins to leave, so nothing moves before the visitor has
 *              scrolled at all.
 * @param {number} opts.depth  travel in px for the far layer.
 * @param {object} [opts.ref]
 *   A ref the caller already puts on the section. Pass it rather than
 *   adding a second `ref` to the same element: JSX silently keeps only
 *   the last one, so the hook's own ref would never attach and
 *   `useScroll` would quietly fall back to measuring the whole document
 *   instead of the chapter. That compiles, renders, and is wrong.
 */
export function useChapterScroll({ mode = "through", depth = 60, ref: external } = {}) {
  const own = useRef(null);
  const ref = external ?? own;
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: mode === "leaving" ? ["start start", "end start"] : ["start end", "end start"],
  });

  // The near layer carries the reading matter, so it moves least: type
  // that slides far while you are trying to read it is an effect, not
  // depth.
  const near = useTransform(scrollYProgress, [0, 1], mode === "leaving" ? [0, -depth * 0.5] : [depth * 0.28, -depth * 0.28]);
  // The far layer is the chapter's own furniture - a wordmark, a
  // heading it can afford to lose. It travels further.
  const far = useTransform(scrollYProgress, [0, 1], mode === "leaving" ? [0, -depth * 1.35] : [depth * 0.7, -depth * 0.7]);
  // Only the hero fades, and only as it leaves. A chapter in the middle
  // of the page that dims on approach reads as broken, not cinematic.
  const fade = useTransform(scrollYProgress, [0, 0.72, 1], mode === "leaving" ? [1, 1, 0] : [1, 1, 1]);

  return {
    ref,
    // `undefined` rather than a motion value, so the element renders with
    // no transform at all under reduced motion.
    near: reduce ? undefined : near,
    far: reduce ? undefined : far,
    fade: reduce ? undefined : fade,
    progress: scrollYProgress,
    reduce,
  };
}

export default useChapterScroll;
