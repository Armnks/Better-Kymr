import { scrollToId } from "@/App";

export default function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
      <button
        data-testid="nav-logo"
        data-hover
        onClick={() => scrollToId("top")}
        className="font-display text-lg font-black tracking-tight text-white"
      >
        KYMR<span className="text-ember">.</span>
      </button>
      <div className="hidden items-center gap-8 font-mono text-[10px] tracking-[0.35em] text-white/70 md:flex">
        <button
          data-testid="nav-process"
          data-hover
          onClick={() => scrollToId("process")}
          className="transition-colors duration-300 hover:text-white"
        >
          PROCESS
        </button>
        <button
          data-testid="nav-capabilities"
          data-hover
          onClick={() => scrollToId("capabilities")}
          className="transition-colors duration-300 hover:text-white"
        >
          CAPABILITIES
        </button>
        <button
          data-testid="nav-contact"
          data-hover
          onClick={() => scrollToId("contact")}
          className="text-ember transition-colors duration-300 hover:text-white"
        >
          CONTACT
        </button>
      </div>
      <div className="font-mono text-[10px] tracking-[0.3em] text-white/40">
        STUDIO — EST. 2026
      </div>
    </nav>
  );
}
