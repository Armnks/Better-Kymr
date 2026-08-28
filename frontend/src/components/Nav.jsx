import { useEffect, useRef } from "react";
import { scrollToId } from "@/App";
import SoundToggle from "@/components/SoundToggle";
import { triggerRipple } from "@/components/Ripple";

export default function Nav() {
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          aria-label="KymrStudio — back to the beginning"
          onClick={() => scrollToId("top")}
          className="font-cinzel text-lg font-bold tracking-tight text-white"
        >
          KymrStudio<span className="text-ember">.</span>
        </button>

        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.3em] text-white/70 md:gap-8">
          <SoundToggle />
          <button
            data-testid="nav-process"
            data-hover
            data-magnetic
            data-cursor="VIEW"
            onClick={() => scrollToId("process")}
            className="hidden transition-colors duration-300 hover:text-white md:block"
          >
            PROCESS
          </button>
          <button
            data-testid="nav-capabilities"
            data-hover
            data-magnetic
            data-cursor="VIEW"
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
            className="text-white/70 transition-colors duration-300 hover:text-white"
          >
            CONTACT
          </button>
          <button
            data-testid="nav-start"
            data-hover
            data-magnetic
            data-cursor="BEGIN"
            onClick={(e) => triggerRipple(e.clientX, e.clientY)}
            className="text-ember transition-colors duration-300 hover:text-white"
          >
            START ↗
          </button>
        </div>
      </nav>
    </>
  );
}
