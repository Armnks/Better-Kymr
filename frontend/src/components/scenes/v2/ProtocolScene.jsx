import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const BAR_Y = ["-14vh", "0vh", "14vh"];
const COL_X = ["-20vw", "0vw", "20vw"];

export default function ProtocolScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const numEl = ref.current.querySelector(".pr-num1");
      const proxy = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=520%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "04 — PROTOCOL" })),
        },
      });

      tl.fromTo(".pr-frame", { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6 })
        .fromTo(".pr-s1", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "<0.2")
        .to(
          proxy,
          {
            v: 48,
            duration: 1.5,
            ease: "steps(48)",
            onUpdate: () => {
              const n = Math.floor(proxy.v);
              const glitch = proxy.v > 2 && proxy.v < 44 && Math.floor(proxy.v * 5) % 9 === 0;
              numEl.textContent = glitch
                ? String(Math.floor(Math.random() * 90) + 10) + "H"
                : String(n).padStart(2, "0") + "H";
            },
          },
          "+=0.1"
        )
        .to(".pr-s1", { scale: 0.16, x: "-36vw", y: "-36vh", autoAlpha: 0.35, duration: 0.8, ease: "power3.inOut" }, "+=0.35")
        .fromTo(".pr-bar", {
          scaleX: 0,
          y: (i) => BAR_Y[i],
        }, {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.inOut",
        }, "<0.2")
        .fromTo(".pr-s2", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, "<0.35")
        .to(".pr-bar", {
          rotation: 90,
          y: 0,
          x: (i) => COL_X[i],
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.inOut",
        }, "+=0.4")
        .to(".pr-s2", { scale: 0.16, x: "36vw", y: "-36vh", autoAlpha: 0.35, duration: 0.8, ease: "power3.inOut" }, "<")
        .fromTo(".pr-s3", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, "<0.3")
        .fromTo(".pr-fillbar", { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, "+=0.2")
        .to(".pr-bar", { autoAlpha: 0, duration: 0.4 }, "<")
        .to(".pr-s3", { scale: 0.16, x: "-36vw", y: "36vh", autoAlpha: 0.35, duration: 0.8, ease: "power3.inOut" }, "+=0.4")
        .fromTo(".pr-echo", {
          autoAlpha: 0,
          x: 0,
          y: 0,
        }, {
          autoAlpha: 0.45,
          x: (i) => `${(i + 1) * -1.8}vw`,
          y: (i) => `${(i + 1) * 1.4}vh`,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
        }, "<0.2")
        .fromTo(".pr-s4", { autoAlpha: 0, scale: 1.35 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, "<0.2")
        .to(".pr-stage", { autoAlpha: 0, scale: 0.92, duration: 0.7, ease: "power2.in" }, "+=0.5")
        .fromTo(".pr-dot", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(3)" }, "<0.35")
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const stepCls = "absolute inset-0 flex flex-col items-center justify-center gap-5 opacity-0";

  if (reduced) {
    return (
      <section id="process" data-testid="protocol-scene" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-16 px-6 py-24">
        {[["48H", "TURNAROUND"], ["3S", "HOOK WINDOW"], ["100%", "ASSET REVIEW"], ["10+", "ITERATIONS / SPRINT"]].map(([n, l]) => (
          <div key={n} className="text-center">
            <div className="font-display text-[18vw] font-black leading-none text-bone md:text-[10vw]">{n}</div>
            <div className="mt-2 font-mono text-xs tracking-[0.4em] text-white/60">{l}</div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} id="process" data-testid="protocol-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="pr-stage absolute inset-0">
        <div className="pr-frame absolute inset-x-6 bottom-10 top-24 border border-white/10 opacity-0 md:inset-x-10" />

        {BAR_Y.map((y, i) => (
          <div
            key={i}
            className="pr-bar absolute left-0 top-1/2 h-px w-full origin-center scale-x-0 bg-bone/40"
            style={{ transform: `translateY(${y})` }}
            data-y={y}
          />
        ))}

        <div className={`pr-s1 ${stepCls}`}>
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50 md:text-xs">STEP 01 — TURNAROUND</span>
          <div data-testid="protocol-step-01" className="pr-num1 font-cinzel text-[30vw] font-black leading-[0.85] tracking-[-0.02em] text-ember md:text-[24vw]">
            00H
          </div>
          <span className="font-mono text-[10px] tracking-[0.35em] text-white/40">00:00:00 → 48:00:00</span>
        </div>

        <div className={`pr-s2 ${stepCls}`}>
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50 md:text-xs">STEP 02 — HOOK WINDOW</span>
          <div data-testid="protocol-step-02" className="text-outline font-display text-[30vw] font-black leading-[0.85] tracking-[-0.05em] md:text-[24vw]">
            3S
          </div>
          <span className="font-mono text-[10px] tracking-[0.35em] text-white/40">THE SCROLL DECIDES</span>
        </div>

        <div className={`pr-s3 ${stepCls}`}>
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50 md:text-xs">STEP 03 — ASSET REVIEW</span>
          <div data-testid="protocol-step-03" className="font-display text-[26vw] font-black leading-[0.85] tracking-[-0.05em] text-bone md:text-[20vw]">
            100%
          </div>
          <div className="h-[3px] w-[52vw] max-w-md bg-white/10">
            <div className="pr-fillbar h-full w-full origin-left bg-ember" />
          </div>
        </div>

        <div className={`pr-s4 ${stepCls}`}>
          <span className="font-mono text-[10px] tracking-[0.5em] text-white/50 md:text-xs">STEP 04 — ITERATIONS / SPRINT</span>
          <div className="relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="pr-echo text-outline-faint absolute inset-0 block select-none whitespace-nowrap font-display text-[30vw] font-black leading-[0.85] tracking-[-0.05em] opacity-0 md:text-[24vw]"
                aria-hidden="true"
              >
                10+
              </span>
            ))}
            <div data-testid="protocol-step-04" className="relative font-display text-[30vw] font-black leading-[0.85] tracking-[-0.05em] text-bone md:text-[24vw]">
              10+
            </div>
          </div>
          <span className="font-mono text-[10px] tracking-[0.35em] text-white/40">REFINED UNTIL IT MOVES PEOPLE</span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pr-dot h-2 w-2 scale-0 rounded-full bg-ember" />
      </div>
    </section>
  );
}
