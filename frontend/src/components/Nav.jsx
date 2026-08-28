import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { scrollToId } from "@/App";

export default function Nav() {
  const [state, setState] = useState("01 — ORIGIN");
  const labelRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const onState = (e) => {
      setState((prev) => {
        if (prev !== e.detail && labelRef.current) {
          gsap.fromTo(
            labelRef.current,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.6, ease: "power3.out" }
          );
        }
        return e.detail;
      });
    };
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("kymr:state", onState);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("kymr:state", onState);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-[2px] bg-white/5">
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-ember" />
      </div>
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
        <button
          data-testid="nav-logo"
          data-hover
          onClick={() => scrollToId("top")}
          className="font-display text-base font-black tracking-tight text-white"
        >
          KymrStudio<span className="text-ember">.</span>
        </button>

        <div className="hidden overflow-hidden md:block">
          <span
            ref={labelRef}
            data-testid="nav-state-label"
            className="block font-mono text-[10px] tracking-[0.4em] text-white/50"
          >
            {state}
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.3em] text-white/70 md:gap-8">
          <button
            data-testid="nav-process"
            data-hover
            data-magnetic
            data-cursor="PROTOCOL"
            onClick={() => scrollToId("process")}
            className="hidden transition-colors duration-300 hover:text-white md:block"
          >
            PROCESS
          </button>
          <button
            data-testid="nav-capabilities"
            data-hover
            data-magnetic
            data-cursor="FORCES"
            onClick={() => scrollToId("capabilities")}
            className="hidden transition-colors duration-300 hover:text-white md:block"
          >
            CAPABILITIES
          </button>
          <button
            data-testid="nav-contact"
            data-hover
            data-magnetic
            data-cursor="CONTACT"
            onClick={() => scrollToId("contact")}
            className="text-ember transition-colors duration-300 hover:text-white"
          >
            CONTACT
          </button>
        </div>
      </nav>
    </>
  );
}
