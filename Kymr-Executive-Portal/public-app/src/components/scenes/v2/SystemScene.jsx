import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import FractureScene from "@/components/scenes/v2/FractureScene";
import { DISCIPLINES, N_DISCIPLINES as N } from "@/data/disciplines";

// ============================================================
// CHAPTER 2 - THE KYMR SYSTEM
//
// The chapter that has to answer "what can I hire these people to
// do", and it now answers it in the first second: all five
// disciplines are named on the page, each with the thing it
// produces, before anything is clicked, dragged or scrolled.
//
// One heading over three coordinated columns.
//
//   LEFT    the five disciplines, permanently readable, and the
//           selection control for the chapter
//   CENTRE  the campaign frame, in pieces, purely tactile
//   RIGHT   what the selected discipline actually hands over
//
// The problem statements this chapter used to lead with are still
// in the codebase, in FractureScene, but they are no longer the
// presentation: a visitor should not have to read five ways a
// project fails before finding out what is on offer.
//
// The two halves are kept apart on purpose. Selecting a discipline
// lifts one piece of the frame for a moment, which is a response.
// Dragging a piece changes nothing but that piece: it cannot move
// the selection, hide a deliverable or produce a completion state.
// ============================================================
export default function SystemScene() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabs = useRef([]);

  const select = useCallback((i, focus = false) => {
    const n = ((i % N) + N) % N;
    setActive(n);
    if (focus) tabs.current[n]?.focus();
  }, []);

  // A vertical tablist: up and down walk it, Home and End end it.
  // It walks from whichever tab actually holds focus rather than from
  // the selection, so the two can never drift apart.
  const onKey = (e) => {
    const from = tabs.current.indexOf(document.activeElement);
    const at = from === -1 ? active : from;
    const map = {
      ArrowDown: at + 1,
      ArrowRight: at + 1,
      ArrowUp: at - 1,
      ArrowLeft: at - 1,
      Home: 0,
      End: N - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <section
      id="system"
      data-testid="system-scene"
      data-shader-mode="capabilities"
      className="env-system relative"
    >
      <div className="k-sys-inner">
        {/* ---------- the claim ---------- */}
        <header id="capabilities" className="k-sys-head">
          <h2 className="k-sys-h">
            From first idea to <span className="t-lit">final cut.</span>
          </h2>
          <p className="k-sys-sub">
            Strategy, creative development, production, editing and iteration&#8212;connected
            through one studio.
          </p>
        </header>

        <div className="k-sys-cols">
          {/* ---------- LEFT: every service, readable at rest ---------- */}
          <div
            role="tablist"
            aria-label="The five disciplines"
            aria-orientation="vertical"
            className="k-disc"
            onKeyDown={onKey}
          >
            {DISCIPLINES.map((d, i) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                id={`disc-tab-${d.key}`}
                aria-selected={i === active}
                aria-controls={`disc-panel-${d.key}`}
                tabIndex={i === active ? 0 : -1}
                data-testid={`disc-${i}`}
                data-on={i === active ? "true" : undefined}
                ref={(n) => {
                  tabs.current[i] = n;
                }}
                onClick={() => select(i)}
                className="k-disc-item"
              >
                <span className="k-disc-line">
                  <span aria-hidden="true" className="k-disc-mark" />
                  <span aria-hidden="true" className="t-data k-disc-n">
                    {String(d.n).padStart(2, "0")}
                  </span>
                  <span className="k-disc-name">{d.name}</span>
                </span>
                <span className="k-disc-sum">{d.output}</span>
              </button>
            ))}
          </div>

          {/* ---------- CENTRE: the campaign frame ---------- */}
          <div id="fracture" className="k-sys-frame">
            <FractureScene lift={active} />
            <p className="k-frame-note">
              {reduce
                ? "Click a piece, or move it with the arrow keys."
                : "Drag the pieces. Explore the process."}
            </p>
          </div>

          {/* ---------- RIGHT: what the client receives ----------
              All five panels occupy one grid cell, so the column is
              already as tall as its longest state and changing
              discipline never moves the page under the reader. */}
          <div className="k-deliv">
            {DISCIPLINES.map((d, i) => {
              const next = DISCIPLINES[(i + 1) % N];
              return (
                <div
                  key={d.key}
                  role="tabpanel"
                  id={`disc-panel-${d.key}`}
                  aria-labelledby={`disc-tab-${d.key}`}
                  tabIndex={i === active ? 0 : undefined}
                  data-testid={`panel-${i}`}
                  data-on={i === active ? "true" : undefined}
                  className="k-deliv-panel"
                >
                  <h3 className="k-deliv-name">{d.name}</h3>
                  <p className="k-deliv-purpose">{d.purpose}</p>

                  <p className="t-data k-deliv-label">What we deliver</p>
                  <ul className="k-deliv-list">
                    {d.detail.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>

                  <p className="k-deliv-hand">
                    <span aria-hidden="true" className="k-deliv-arrow">
                      &rarr;
                    </span>
                    Hands {d.hands.replace(/^The /, "the ")} to {next.name}
                    {i === N - 1 ? ", and the next round starts already argued." : "."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
