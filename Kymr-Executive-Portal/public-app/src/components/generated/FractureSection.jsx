import { useState } from "react";

// ============================================================
// FRACTURE SECTION
//
// A self-contained dark, high-tech section: warped wireframe ground,
// a two-column composition that stacks on mobile, a cascading step
// connector between the two, and a glassmorphism data card with two
// wireframe read-outs beneath it.
//
// Everything is Tailwind utilities plus one inline SVG per visual.
// No dependencies beyond React.
// ============================================================

const NAV = ["WSK", "Capabilities", "Projects"];

// The list drives the card: selecting an item swaps the panel.
const ITEMS = [
  {
    label: "Creative fatigue",
    title: "The same idea, run until it stops",
    detail: "Attention decays long before the budget does.",
  },
  {
    label: "Fragmented strategy and execution",
    title: "The brief and the edit never meet",
    detail: "Two teams, one idea, and no shared line between them.",
  },
  {
    label: "Slow production",
    title: "The window closes before the work lands",
    detail: "By delivery, the moment it was built for has passed.",
  },
  {
    // The card content specified in the brief belongs to the active
    // item, so 4 / 4 and the panel agree with each other.
    label: "Work that looks good and builds nobody",
    title: "Too few variations to learn from",
    detail: "No signal comes back at all.",
  },
];

export default function FractureSection() {
  const [active, setActive] = useState(ITEMS.length - 1);
  const current = ITEMS[active];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#111111] text-white antialiased">
      {/* ---------- warped wireframe ground ---------- */}
      <WireGrid />

      {/* one soft pool of light behind the right column, so the glass
          panel has something to sit in front of */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/4 h-[38rem] w-[38rem] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #8892a6 0%, transparent 70%)" }}
      />

      {/* ---------- navigation ---------- */}
      <header className="relative z-20 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 md:px-12">
        <a
          href="#top"
          className="text-sm font-bold tracking-[0.18em] text-white transition-opacity duration-200 hover:opacity-70"
        >
          KYMRSTUDIO
        </a>

        <nav className="flex items-center gap-5 md:gap-8">
          {NAV.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hidden text-[0.8rem] text-neutral-400 transition-colors duration-200 hover:text-white sm:inline"
            >
              {item}
            </a>
          ))}
          <a
            href="#start"
            className="rounded-sm border border-white/20 bg-white/[0.04] px-4 py-2 text-[0.75rem] font-medium tracking-wide text-white backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.08]"
          >
            Start a Project
          </a>
        </nav>
      </header>

      {/* ---------- the composition ---------- */}
      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-16 px-6 pb-20 pt-10 md:px-12 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-0">
        {/* ===== left: the claim and the index ===== */}
        <div className="flex flex-col gap-14 lg:col-span-6 lg:gap-20">
          <h1 className="max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-[4.25rem]">
            A strong idea does not survive being made in{" "}
            <span
              className="relative inline-block bg-gradient-to-b from-[#ff6a4d] via-[#ff3b14] to-[#c92208] bg-clip-text text-transparent"
              style={{
                // the glow lives on a duplicate underneath, so the
                // gradient fill above it stays crisp
                filter: "drop-shadow(0 0 18px rgba(255,59,20,0.45))",
              }}
            >
              pieces
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(107deg, transparent 0 6px, rgba(0,0,0,0.55) 6px 7px), repeating-linear-gradient(11deg, transparent 0 9px, rgba(0,0,0,0.4) 9px 10px)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                pieces
              </span>
            </span>
            <span className="text-white">.</span>
          </h1>

          {/* the index, held at the foot of the column */}
          <ol className="list-none space-y-1">
            {ITEMS.map((item, i) => {
              const on = i === active;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => setActive(i)}
                    className={`group flex w-full min-h-[44px] items-center gap-4 rounded-sm text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b14] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${
                      on ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {/* the marker: lit only on the active row */}
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 flex-none rounded-full transition-all duration-200 ${
                        on ? "bg-[#ff3b14]" : "bg-white/15 group-hover:bg-white/30"
                      }`}
                      style={on ? { boxShadow: "0 0 10px 2px rgba(255,59,20,0.65)" } : undefined}
                    />
                    <span className="w-6 font-mono text-[0.7rem] tabular-nums text-neutral-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-sm md:text-base ${on ? "font-bold" : "font-normal"}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ===== centre: the cascading connector ===== */}
        <div aria-hidden="true" className="relative hidden lg:col-span-1 lg:block">
          {/* Seven treads stepping up and to the right, from the height
              of the index to the foot of the panel. Each is wider and
              a little brighter than the one below it, so the run reads
              as a direction rather than as a stack of boxes. */}
          <div className="absolute bottom-[26%] left-[-2.5rem] flex flex-col-reverse gap-[7px]">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <span
                key={n}
                className="block rounded-[2px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-[2px]"
                style={{
                  width: `${22 + n * 7}px`,
                  height: "9px",
                  marginLeft: `${n * 12}px`,
                  opacity: 0.22 + n * 0.11,
                }}
              />
            ))}
          </div>
        </div>

        {/* ===== right: the glass panel and its read-outs ===== */}
        <div className="flex flex-col gap-5 lg:col-span-5 lg:justify-center">
          {/* the panel */}
          <article
            className="relative overflow-hidden rounded-xl border border-white/20 bg-white/[0.06] p-7 backdrop-blur-xl md:p-9"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -20px 40px -30px rgba(255,255,255,0.18), 0 30px 60px -20px rgba(0,0,0,0.8)",
            }}
          >
            {/* a single highlight along the top edge */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />

            <p className="m-0 font-mono text-[0.7rem] tabular-nums tracking-[0.2em] text-neutral-400">
              {String(active + 1).padStart(1, "0")} / {ITEMS.length}
            </p>

            <h2 className="mt-5 max-w-[18ch] text-2xl font-bold leading-[1.15] tracking-tight text-white md:text-[2rem]">
              {current.title}
            </h2>

            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-neutral-400 md:text-base">
              {current.detail}
            </p>
          </article>

          {/* the read-outs */}
          <div className="grid grid-cols-2 gap-4">
            <ReadOut label="Signal">
              <Waveform />
            </ReadOut>
            <ReadOut label="Handover">
              <ChainLinks />
            </ReadOut>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A bounded wireframe well for one small diagram. */
function ReadOut({ label, children }) {
  return (
    <div className="rounded-lg border border-white/[0.09] bg-white/[0.02] p-3 backdrop-blur-sm">
      <p className="m-0 mb-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-neutral-600">
        {label}
      </p>
      <div className="h-12 w-full">{children}</div>
    </div>
  );
}

/** Grey trace with one live segment. */
function Waveform() {
  return (
    <svg viewBox="0 0 160 40" fill="none" className="h-full w-full" aria-hidden="true">
      <polyline
        points="0,20 18,20 26,20 34,8 42,32 50,20 68,20"
        stroke="#6b7280"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="68,20 78,20 86,4 94,36 102,20 112,20"
        stroke="#ff3b14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(255,59,20,0.55))" }}
      />
      <polyline
        points="112,20 128,20 136,14 144,26 152,20 160,20"
        stroke="#6b7280"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Three links, chained. */
function ChainLinks() {
  return (
    <svg viewBox="0 0 160 40" fill="none" className="h-full w-full" aria-hidden="true">
      {[38, 80, 122].map((cx, i) => (
        <rect
          key={cx}
          x={cx - 22}
          y="11"
          width="44"
          height="18"
          rx="9"
          stroke={i === 1 ? "#9ca3af" : "#5c6370"}
          strokeWidth="1.25"
        />
      ))}
      <rect x="53" y="15.5" width="14" height="9" rx="4.5" stroke="#4b5563" strokeWidth="1" />
      <rect x="95" y="15.5" width="14" height="9" rx="4.5" stroke="#4b5563" strokeWidth="1" />
    </svg>
  );
}

/** The ground: a warped wireframe that carries across the full width. */
function WireGrid() {
  const rows = [40, 120, 200, 280, 360, 440, 520, 600, 680, 760];
  const cols = Array.from({ length: 17 }, (_, i) => i * 100);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 800"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="wire-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.085" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* horizontals, bowed toward the centre so the plane reads warped */}
      {rows.map((y, i) => {
        const bow = (i - rows.length / 2) * 16;
        return (
          <path
            key={y}
            d={`M0 ${y} C 420 ${y + bow} 1180 ${y + bow} 1600 ${y}`}
            stroke="url(#wire-fade)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* verticals, leaning with the same warp */}
      {cols.map((x, i) => {
        const lean = (i - cols.length / 2) * 6;
        return (
          <path
            key={x}
            d={`M${x} 0 C ${x + lean} 260 ${x + lean} 540 ${x} 800`}
            stroke="url(#wire-fade)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
