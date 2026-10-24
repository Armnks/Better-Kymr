import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { setShaderIntro, setShaderMode } from "@/components/ui/shader-lines";

// ============================================================
// SITE ENTRY SEQUENCE
//
//   SIGNAL -> WORDMARK -> ENTER THE WORDMARK -> WARP -> ARRIVAL
//
// Plays once per browsing session on the homepage. Separate from the
// Archive portal, which has its own key and its own sequence, so
// entering the Archive later never replays this one.
// ============================================================
const KEY = "kymr-entered";
const WORD = "KymrStudio";
const EASE = [0.22, 1, 0.36, 1];

const LAYERS = [
  { k: "edge", z: 140, blur: 2.4, o: 0.5, to: 26, c: "var(--signal)" },
  { k: "face", z: 0, blur: 0, o: 1, to: 15, c: "var(--frost)" },
  { k: "mid", z: -120, blur: 1.1, o: 0.42, to: 9, c: "var(--silver)" },
  { k: "deep", z: -280, blur: 3.2, o: 0.22, to: 5, c: "var(--smoke)" },
];

const FRAGMENTS = [
  { idx: [0, 1, 2], dx: -60, dy: -18 },
  { idx: [3, 4, 5], dx: 44, dy: 22 },
  { idx: [6, 7, 8, 9], dx: -26, dy: 30 },
];

export function hasEntered() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return true; // storage blocked: never trap a visitor in the intro
  }
}

export function clearEntered() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export default function EntrySequence({ onDone }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("signal");
  const [showSkip, setShowSkip] = useState(false);
  const timers = useRef([]);
  const skipRef = useRef(null);
  const done = useRef(false);

  const after = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    // resolve the field to arrival wherever the sequence was interrupted
    setShaderIntro({ warp: 0, horizon: 1, density: 0.4, signal: 0.5, speed: 1 });
    setShaderMode("hero");
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    if (reduce) {
      setShaderIntro({ warp: 0, horizon: 1, density: 0.4, signal: 0.55, speed: 1 });
      setPhase("mark");
      after(560, finish);
      return () => timers.current.forEach(clearTimeout);
    }
    setShaderIntro({ warp: 0, horizon: 0, density: 0.14, signal: 1, speed: 0.3 });
    after(350, () => setShowSkip(true));
    after(1180, () => setPhase("mark"));
    after(1980, () => {
      setPhase("cross");
      setShaderIntro({ density: 0.4, speed: 1.2 });
    });
    after(2380, () => {
      setPhase("warp");
      setShaderIntro({ warp: 1, horizon: 0.12, density: 0.95, signal: 0.9, speed: 3.4 });
    });
    after(3050, () => setShaderIntro({ warp: 0.15, horizon: 0.8, density: 0.5, speed: 1.2 }));
    after(3500, finish);
    return () => timers.current.forEach(clearTimeout);
  }, [reduce, after, finish]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [finish]);

  useEffect(() => {
    if (showSkip) skipRef.current?.focus();
  }, [showSkip]);

  const letters = WORD.split("");
  const marked = phase !== "signal";
  const crossing = phase === "cross" || phase === "warp";

  return (
    <motion.div
      role="presentation"
      data-testid="entry-sequence"
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 200 }}
      animate={{ opacity: phase === "warp" ? 0 : 1 }}
      transition={{ duration: phase === "warp" ? 0.85 : 0.2, ease: [0.4, 0, 1, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-carbon"
        animate={{ opacity: phase === "signal" ? 0.96 : crossing ? 0.12 : 0.72 }}
        transition={{ duration: 0.5, ease: EASE }}
      />

      <AnimatePresence>
        {phase === "signal" && !reduce && (
          <motion.span
            key="dot"
            aria-hidden="true"
            className="absolute"
            style={{ width: 7, height: 7, background: "var(--signal)" }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 0.25, 1, 0.25, 1, 0.4],
              scale: [0.4, 1, 0.7, 1, 0.7, 1, 0.8],
            }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 1.14, times: [0, 0.12, 0.28, 0.45, 0.61, 0.78, 1] }}
          />
        )}
      </AnimatePresence>

      {!reduce && phase === "signal" && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          {FRAGMENTS.map((f, fi) => (
            <motion.span
              key={f.idx.join("")}
              className="absolute whitespace-pre font-cinzel font-bold text-frost"
              style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
              initial={{ opacity: 0, x: f.dx, y: f.dy }}
              animate={{ opacity: [0, 0.85, 0], x: f.dx, y: f.dy }}
              transition={{ duration: 0.34, delay: 0.06 + fi * 0.38, times: [0, 0.4, 1] }}
            >
              {f.idx.map((n) => letters[n]).join("")}
            </motion.span>
          ))}
        </div>
      )}

      {marked && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: 900 }}
        >
          {LAYERS.map((l) => (
            <motion.span
              key={l.k}
              className="absolute whitespace-pre font-cinzel font-bold"
              style={{
                color: l.c,
                filter: l.blur ? `blur(${l.blur}px)` : undefined,
                fontSize: "clamp(2.2rem, 7vw, 5.5rem)",
                willChange: "transform, opacity",
              }}
              initial={{ opacity: 0, z: l.z, scale: 0.94 }}
              animate={
                crossing
                  ? { opacity: [l.o, l.o, 0], scale: l.to, z: l.z + 700 }
                  : { opacity: l.o, scale: 1, z: l.z }
              }
              transition={
                crossing
                  ? { duration: 1.2, ease: [0.55, 0, 0.9, 0.55], times: [0, 0.55, 1] }
                  : { duration: 0.42, ease: EASE }
              }
            >
              {WORD}
            </motion.span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSkip && phase !== "warp" && (
          <motion.button
            ref={skipRef}
            key="skip"
            type="button"
            data-testid="skip-intro"
            onClick={finish}
            className="entry-skip"
            style={{ bottom: "2.5rem", right: "2.5rem" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25 }}
          >
            Skip Intro
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
