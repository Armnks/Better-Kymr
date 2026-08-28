import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { range } from "@/utils/seed";

gsap.registerPlugin(ScrollTrigger);

const LETTERS = "KYMRSTUDIO".split("");

export default function OpeningScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      let current = "01 — ORIGIN";
      const announce = (s) => {
        if (s !== current) {
          current = s;
          window.dispatchEvent(new CustomEvent("kymr:state", { detail: s }));
        }
      };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=520%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) => self.isActive && announce(self.progress > 0.5 ? "02 — EXPANSION" : "01 — ORIGIN"),
          onUpdate: (self) => announce(self.progress > 0.5 ? "02 — EXPANSION" : "01 — ORIGIN"),
        },
      });

      gsap.to(".op-hint", { autoAlpha: 0.55, duration: 1.2, delay: 1.4, ease: "power2.out" });

      // ORIGIN — restrained: dot, hairline, aperture
      tl.set(".op-hint", { autoAlpha: 0 }, 0.01)
        .fromTo(".op-label", { autoAlpha: 0, y: 18 }, { autoAlpha: 0.7, y: 0, duration: 0.5 }, "<")
        .to(".op-dot", { scale: 2.4, duration: 0.6, ease: "power2.inOut" }, "<")
        .to(".op-label", { autoAlpha: 0, y: -16, duration: 0.35 }, "+=0.2")
        .to(".op-dot", { autoAlpha: 0, scale: 0.3, duration: 0.35 }, "<")
        .fromTo(".op-line", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut" }, "<0.1")
        .to(".op-line", { autoAlpha: 0, duration: 0.25 }, "+=0.15")
        .fromTo(".op-edge-t", { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: "-24vh", duration: 0.9, ease: "power3.inOut" }, "<")
        .fromTo(".op-edge-b", { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: "24vh", duration: 0.9, ease: "power3.inOut" }, "<")
        .fromTo([".op-edge-l", ".op-edge-r"], { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power3.inOut" }, "<0.15")
        // IDENTITY — introduced exactly once
        .fromTo(".op-word", { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power3.out" }, "-=0.45")
        .fromTo(".op-word", { letterSpacing: "-0.04em" }, { letterSpacing: "0.14em", duration: 1, ease: "power2.inOut" })
        // TRANSITION — the aperture dissolves outward as the word takes over; no cut
        .to(".op-edge-t", { y: "-54vh", autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "+=0.15")
        .to(".op-edge-b", { y: "54vh", autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "<")
        .to([".op-edge-l", ".op-edge-r"], { autoAlpha: 0, scaleY: 1.6, duration: 0.9 }, "<")
        .to(".op-word", { letterSpacing: "-0.05em", duration: 0.7, ease: "power2.inOut" }, "<")
        // EXPANSION — the same word never leaves; it becomes the camera move
        .to(".op-word", { scale: 2.2, duration: 1, ease: "power1.inOut" }, "+=0.1")
        .to(".op-l", { y: (i) => (i % 2 ? "-3vh" : "3vh"), duration: 1.6, ease: "none" }, "<")
        .to(".op-word", { scale: 15, y: "-6vh", rotation: -3, letterSpacing: "-0.1em", duration: 2, ease: "power3.in" }, "+=0.25")
        // the O counter opens into the next world mid-expansion
        .fromTo(
          ".op-window",
          { clipPath: "circle(0% at 82% 52%)" },
          { clipPath: "circle(140% at 82% 52%)", duration: 1.9, ease: "power3.inOut" },
          "-=1.45"
        )
        .fromTo(
          ".op-preview",
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" },
          "-=0.9"
        )
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const letters = gsap.utils.toArray(".op-l");
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
      <section id="top" data-testid="opening-scene" className="relative z-10 flex h-screen items-center justify-center">
        <h1 className="font-display text-[10vw] font-black tracking-[-0.05em] text-bone">KYMRSTUDIO</h1>
      </section>
    );
  }

  return (
    <section ref={ref} id="top" data-testid="opening-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="op-dot pulse-dot h-2 w-2 rounded-full bg-ember" />
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[38vh]">
        <p data-testid="origin-hint" className="op-hint font-mono text-[9px] tracking-[0.7em] text-white/40 opacity-0">
          SCROLL
        </p>
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[28vh]">
        <p data-testid="origin-label" className="op-label font-mono text-[10px] tracking-[0.5em] text-white/50 opacity-0">
          SIGNAL ACQUIRED — KYMRSTUDIO
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="op-line h-px w-[46vw] origin-center bg-bone/60" />
      </div>

      <div className="op-edge-t absolute left-1/2 top-1/2 h-px w-[46vw] -translate-x-1/2 -translate-y-1/2 bg-bone/40 opacity-0" />
      <div className="op-edge-b absolute left-1/2 top-1/2 h-px w-[46vw] -translate-x-1/2 -translate-y-1/2 bg-bone/40 opacity-0" />
      <div className="op-edge-l absolute left-1/2 top-1/2 h-[48vh] w-px -translate-x-[23vw] -translate-y-1/2 bg-bone/40" />
      <div className="op-edge-r absolute left-1/2 top-1/2 h-[48vh] w-px translate-x-[23vw] -translate-y-1/2 bg-bone/40" />

      <div className="absolute inset-0 flex items-center justify-center">
        <h1
          data-testid="origin-word"
          className="op-word select-none font-display text-[9vw] font-black leading-none tracking-[-0.04em] text-bone opacity-0"
        >
          {LETTERS.map((l, i) => (
            <span key={i} className="op-l inline-block" data-hover>
              {l}
            </span>
          ))}
        </h1>
      </div>

      <div
        className="op-window absolute inset-0 bg-[#07070c]"
        style={{ clipPath: "circle(0% at 82% 52%)" }}
      >
        <div
          className="absolute left-[55%] top-[30%] h-[50vh] w-[40vw] rounded-full opacity-50 blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(255,42,0,0.14), transparent 70%)" }}
        />
        <div className="op-preview absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0">
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50">
            03 — INCOMING TRANSMISSION
          </span>
          <span className="text-outline select-none whitespace-nowrap font-display text-[14vw] font-black leading-none">
            WE MAKE
          </span>
        </div>
      </div>
    </section>
  );
}
