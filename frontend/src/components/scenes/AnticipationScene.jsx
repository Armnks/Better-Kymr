import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function AnticipationScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "center center",
          scrub: 1.5,
        },
      });
      tl.fromTo(
        ".ant-line",
        { yPercent: 120 },
        { yPercent: 0, stagger: 0.25, duration: 1.4, ease: "power3.out" }
      ).fromTo(
        ".ant-rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power2.inOut" },
        "-=0.8"
      );
      gsap.fromTo(
        ".ant-ghost",
        { xPercent: -12 },
        {
          xPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      data-testid="anticipation-scene"
      className="relative z-10 flex min-h-[130vh] items-center justify-center overflow-hidden"
    >
      <div className="ant-ghost pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-outline-faint select-none whitespace-nowrap font-display text-[42vw] font-black leading-none">
          SOON
        </span>
      </div>

      <div className="relative px-6 text-center">
        <p className="mb-12 font-mono text-[10px] tracking-[0.5em] text-white/40">
          05 — THE VOID
        </p>
        <div className="overflow-hidden">
          <h2
            data-testid="anticipation-line-1"
            className="ant-line font-serif text-5xl italic leading-[1.1] text-bone md:text-7xl"
          >
            Kymr is building.
          </h2>
        </div>
        <div className="overflow-hidden">
          <h2
            data-testid="anticipation-line-2"
            className="ant-line font-serif text-5xl italic leading-[1.1] text-bone md:text-7xl"
          >
            The next frame is{" "}
            <span className="font-display not-italic font-black text-ember">yours</span>.
          </h2>
        </div>
        <div className="ant-rule mx-auto mt-14 h-px w-24 origin-center bg-white/30" />
        <p className="mt-10 font-mono text-[10px] tracking-[0.4em] text-white/40">
          NO FAKE PORTFOLIO — ONLY PROOF OF PROCESS
        </p>
      </div>
    </section>
  );
}
