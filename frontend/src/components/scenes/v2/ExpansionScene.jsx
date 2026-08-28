import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function ExpansionScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=260%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "02 — EXPANSION" })),
        },
      });
      tl.to(".exp-word", {
        scale: 15,
        y: "-6vh",
        rotation: -3,
        letterSpacing: "-0.1em",
        duration: 2,
        ease: "power2.in",
      })
        .to(".exp-l", { y: (i) => (i % 2 ? "-3vh" : "3vh"), duration: 2, ease: "none" }, 0)
        .fromTo(
          ".exp-window",
          { clipPath: "circle(0% at 82% 52%)" },
          { clipPath: "circle(140% at 82% 52%)", duration: 1.9, ease: "power3.inOut" },
          0.55
        )
        .fromTo(
          ".exp-preview",
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" },
          1.35
        )
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section data-testid="expansion-scene" className="relative z-10 flex h-screen items-center justify-center">
        <span className="text-outline-faint font-display text-[14vw] font-black">WE MAKE</span>
      </section>
    );
  }

  return (
    <section ref={ref} data-testid="expansion-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute left-6 top-24 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 02 — EXPANSION
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div data-testid="expansion-word" className="exp-word flex select-none font-display text-[9vw] font-black leading-none tracking-[-0.05em] text-bone">
          {"KYMRSTUDIO".split("").map((l, i) => (
            <span key={i} className="exp-l inline-block will-change-transform">
              {l}
            </span>
          ))}
        </div>
      </div>

      <div
        className="exp-window absolute inset-0 bg-[#07070c]"
        style={{ clipPath: "circle(0% at 76% 52%)" }}
      >
        <div
          className="absolute left-[55%] top-[30%] h-[50vh] w-[40vw] rounded-full opacity-50 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(255,42,0,0.14), transparent 70%)" }}
        />
        <div className="exp-preview absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0">
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50">
            03 — INCOMING TRANSMISSION
          </span>
          <span className="text-outline-faint select-none whitespace-nowrap font-display text-[14vw] font-black leading-none">
            WE MAKE
          </span>
        </div>
      </div>
    </section>
  );
}
