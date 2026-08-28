import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const WORDS = [
  { w: "STRATEGY", d: "POSITIONING BEFORE PIXELS", cls: "text-bone" },
  { w: "CREATIVE", d: "IDEAS BUILT FOR THE FEED", cls: "text-outline" },
  { w: "PRODUCTION", d: "SHOT FOR THE SCROLL", cls: "text-bone" },
  { w: "EDITING", d: "CUT TO THE HOOK", cls: "text-ember" },
  { w: "PERFORMANCE", d: "ITERATED ON DATA", cls: "text-outline" },
];

export default function CapabilitiesScene() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const skewTo = gsap.quickTo(".cap-item", "skewX", {
        duration: 0.5,
        ease: "power3",
      });
      const getDistance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -250));
          },
          onScrubComplete: () => skewTo(0),
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="capabilities"
      data-testid="capabilities-scene"
      className={`relative z-10 overflow-hidden ${reduced ? "" : "h-screen"}`}
    >
      <span className="absolute left-6 top-24 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 04 — CAPABILITIES
      </span>
      <span className="absolute bottom-8 right-6 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:right-10">
        SCROLL = TRAVEL →
      </span>

      <div
        ref={trackRef}
        className={
          reduced
            ? "flex flex-col gap-24 px-6 py-32 md:px-10"
            : "absolute top-1/2 flex -translate-y-1/2 items-end gap-[10vw] px-[12vw] will-change-transform"
        }
      >
        {WORDS.map((item, i) => (
          <div
            key={item.w}
            className={`cap-item shrink-0 ${!reduced && i % 2 === 1 ? "pb-[8vh]" : ""}`}
          >
            <span className="font-mono text-[10px] tracking-[0.5em] text-white/40">
              0{i + 1} /
            </span>
            <h3
              data-testid={`capability-${item.w.toLowerCase()}`}
              className={`select-none whitespace-nowrap font-display text-[18vw] font-black leading-[0.85] tracking-[-0.05em] md:text-[13vw] ${item.cls}`}
            >
              {item.w}
            </h3>
            <p className="mt-4 font-mono text-[10px] tracking-[0.35em] text-white/50 md:text-xs">
              {item.d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
