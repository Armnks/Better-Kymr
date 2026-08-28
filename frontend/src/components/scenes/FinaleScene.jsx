import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function FinaleScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=180%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.fromTo(
        ".finale-flash",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: "power4.in" }
      )
        .to(".finale-flash", { autoAlpha: 0, duration: 0.6, ease: "power2.out" })
        .fromTo(
          ".finale-kymr",
          { scale: 2.6, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.4, ease: "power3.out" },
          "-=0.35"
        )
        .fromTo(
          ".finale-meta",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.2 },
          "-=0.4"
        )
        .to({}, { duration: 0.5 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      data-testid="finale-scene"
      className="relative z-10 h-screen overflow-hidden"
    >
      <div className="finale-flash pointer-events-none absolute inset-0 bg-bone opacity-0" />

      <span className="finale-meta absolute left-6 top-24 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 07 — FINAL FRAME
      </span>
      <span className="finale-meta absolute bottom-8 right-6 font-mono text-[10px] tracking-[0.35em] text-white/40 md:right-10">
        07 / 07
      </span>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <h2
          data-testid="finale-text"
          className="finale-kymr select-none text-center font-display text-[26vw] font-black leading-[0.8] tracking-[-0.06em] text-bone md:text-[19vw]"
        >
          KYMR
        </h2>
        <p className="finale-meta mt-8 font-serif text-xl italic text-white/50 md:text-2xl">
          the frame after this one is yours
        </p>
      </div>
    </section>
  );
}
