export default function OgCard() {
  const isIcon = window.location.pathname.includes("icon");

  if (isIcon) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
        <div className="h-[16%] w-[16%] rounded-full bg-ember" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#050505]">
      <div
        className="absolute left-[8%] top-[-20%] h-[70%] w-[55%] rounded-full opacity-60 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(25,35,60,0.55), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[4%] h-[55%] w-[45%] rounded-full opacity-50 blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(255,42,0,0.1), transparent 70%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div className="grain" aria-hidden="true" />

      <div className="absolute left-12 top-10 font-mono text-[11px] tracking-[0.4em] text-white/40">
        EST. 2026 — A LIVING DIGITAL WORLD
      </div>
      <div className="absolute right-12 top-10 font-mono text-[11px] tracking-[0.4em] text-white/40">
        STATE 00 — ORIGIN
      </div>

      <div className="relative flex flex-col items-center gap-10">
        <div className="pulse-dot h-3 w-3 rounded-full bg-ember" />
        <h1 className="font-display text-[120px] font-black leading-none tracking-[-0.04em] text-[#F5F5F0]">
          KYMRSTUDIO
        </h1>
        <div className="h-px w-[420px] bg-ember" />
        <p className="font-mono text-[12px] tracking-[0.5em] text-white/50">
          SCROLL TO INITIATE — media@kymrstudio.com
        </p>
      </div>

      <div className="absolute bottom-10 left-12 font-mono text-[11px] tracking-[0.4em] text-white/40">
        48H TURNAROUND — 3S HOOK — 100% REVIEW — 10+ ITERATIONS
      </div>
      <div className="absolute bottom-10 right-12 font-mono text-[11px] tracking-[0.4em] text-ember">
        THE NEXT FRAME IS YOURS
      </div>
    </div>
  );
}
