import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { range } from "@/utils/seed";

gsap.registerPlugin(ScrollTrigger);

const LETTERS = ["K", "Y", "M", "R"];

export default function OriginScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=240%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "01 — ORIGIN" })),
        },
      });
      gsap.to(".og-hint", { autoAlpha: 0.55, duration: 1.2, delay: 1.4, ease: "power2.out" });
      tl.set(".og-hint", { autoAlpha: 0 }, 0.01)
        .fromTo(".og-label", { autoAlpha: 0, y: 18 }, { autoAlpha: 0.7, y: 0, duration: 0.5 }, "<")
        .to(".og-dot", { scale: 2.4, duration: 0.6, ease: "power2.inOut" }, "<")
        .to(".og-label", { autoAlpha: 0, y: -16, duration: 0.35 }, "+=0.2")
        .to(".og-dot", { autoAlpha: 0, scale: 0.3, duration: 0.35 }, "<")
        .fromTo(".og-line", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut" }, "<0.1")
        .to(".og-line", { autoAlpha: 0, duration: 0.25 }, "+=0.15")
        .fromTo(".og-edge-t", { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: "-24vh", duration: 0.9, ease: "power3.inOut" }, "<")
        .fromTo(".og-edge-b", { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: "24vh", duration: 0.9, ease: "power3.inOut" }, "<")
        .fromTo([".og-edge-l", ".og-edge-r"], { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power3.inOut" }, "<0.15")
        .fromTo(".og-word", { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power3.out" }, "-=0.45")
        .fromTo(".og-word", { letterSpacing: "-0.04em" }, { letterSpacing: "0.2em", duration: 1, ease: "power2.inOut" })
        .to(".og-edge-t", { y: "-54vh", autoAlpha: 0, duration: 0.8, ease: "power2.in" }, "+=0.1")
        .to(".og-edge-b", { y: "54vh", autoAlpha: 0, duration: 0.8, ease: "power2.in" }, "<")
        .to([".og-edge-l", ".og-edge-r"], { autoAlpha: 0, scaleY: 1.6, duration: 0.8 }, "<")
        .to(".og-word", { letterSpacing: "-0.05em", duration: 0.7, ease: "power2.inOut" });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const letters = gsap.utils.toArray(".og-l");
    const setters = letters.map((el) => ({
      el,
      x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" }),
    }));
    const strength = range(18, 30);
    const move = (e) => {
      setters.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const d = Math.hypot(dx, dy);
        if (d < 180 && d > 0.1) {
          const f = (1 - d / 180) * strength;
          s.x((dx / d) * f);
          s.y((dy / d) * f);
        } else {
          s.x(0);
          s.y(0);
        }
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reduced]);

  if (reduced) {
    return (
      <section id="top" data-testid="origin-scene" className="relative z-10 flex h-screen items-center justify-center">
        <h1 className="font-display text-[16vw] font-black tracking-[-0.05em] text-bone">KYMR</h1>
      </section>
    );
  }

  return (
    <section ref={ref} id="top" data-testid="origin-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute left-6 top-24 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 01 — ORIGIN
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="og-dot pulse-dot h-2 w-2 rounded-full bg-ember" />
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[38vh]">
        <p data-testid="origin-hint" className="og-hint font-mono text-[9px] tracking-[0.7em] text-white/40 opacity-0">
          SCROLL
        </p>
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[28vh]">
        <p data-testid="origin-label" className="og-label font-mono text-[10px] tracking-[0.5em] text-white/50 opacity-0">
          SIGNAL ACQUIRED — KYMR
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="og-line h-px w-[46vw] origin-center bg-bone/60" />
      </div>

      <div className="og-edge-t absolute left-1/2 top-1/2 h-px w-[46vw] -translate-x-1/2 -translate-y-1/2 bg-bone/40 opacity-0" />
      <div className="og-edge-b absolute left-1/2 top-1/2 h-px w-[46vw] -translate-x-1/2 -translate-y-1/2 bg-bone/40 opacity-0" />
      <div className="og-edge-l absolute left-1/2 top-1/2 h-[48vh] w-px -translate-x-[23vw] -translate-y-1/2 bg-bone/40" />
      <div className="og-edge-r absolute left-1/2 top-1/2 h-[48vh] w-px translate-x-[23vw] -translate-y-1/2 bg-bone/40" />

      <div className="absolute inset-0 flex items-center justify-center">
        <h1
          data-testid="origin-word"
          className="og-word select-none font-display text-[16vw] font-black leading-none tracking-[-0.04em] text-bone opacity-0"
        >
          {LETTERS.map((l) => (
            <span key={l} className="og-l inline-block" data-hover>
              {l}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
}
