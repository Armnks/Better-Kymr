import Dialog from "@/components/Dialog";
import {
  CADENCES,
  MARKETS,
  MILESTONES,
  MIXES,
  VOLUME,
  cadenceOf,
  marketOf,
  mixOf,
  useScope,
} from "@/lib/scope";

// ============================================================
// THE ADVERTISING SCOPE ESTIMATOR, AS A DIALOG
//
// This is the same estimator that used to be a homepage section. It was
// removed from the page flow and is now opened by "Start a Project", so
// the configuration happens when a visitor has decided to act rather
// than sitting in the middle of the reading experience.
//
// The controls, the state, the approved market floors and the copy are
// unchanged - only the container is different. State still lives in the
// shared ScopeProvider, so a visitor's selections survive closing and
// reopening, and still travel into the inquiry.
// ============================================================
function Calculator() {
  return (
    <svg className="k-scope-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="2.5" width="18" height="19" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6.5" y="6" width="11" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="13.5" r="1.05" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1.05" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1.05" fill="currentColor" />
      <circle cx="8" cy="17.5" r="1.05" fill="currentColor" />
      <circle cx="12" cy="17.5" r="1.05" fill="currentColor" />
      <circle cx="16" cy="17.5" r="1.05" fill="currentColor" />
    </svg>
  );
}

function Tick({ on }) {
  return (
    <svg className="k-scope-tick" data-on={on ? "true" : undefined} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" opacity={on ? 1 : 0.3} />
      {on && (
        <path d="M4.8 8.2l2.2 2.2 4.2-4.6" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function ScopeDialog({ open, onClose, onContact }) {
  const { scope, set } = useScope();
  const market = marketOf(scope.market);
  const pct = ((scope.volume - VOLUME.min) / (VOLUME.max - VOLUME.min)) * 100;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="scope-est-title"
      describedBy="scope-est-desc"
      className="k-scope k-scope-dialog"
    >
      {({ dismiss }) => (
        <>
          <p id="scope-est-desc" className="sr-only">
            Configure an image or video ad campaign. For a website or an online store, close this
            and choose Make me a project instead. Selecting options records your requirements; it
            does not produce a binding price.
          </p>
        <div className="k-scope-card">
          {/* ---- head ---- */}
          <div className="k-scope-head">
            <p id="scope-est-title" className="k-scope-title">
              <Calculator />
              <span>Interactive scope estimator</span>
            </p>
            <p className="k-scope-kind">Image and video ad campaigns</p>
            <div className="k-scope-head-r">
              <p className="k-scope-badge">No rigid tiers</p>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close the scope estimator"
                data-testid="scope-close"
                className="k-web-x"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>

          {/* ---- 01 market ---- */}
          <fieldset className="k-scope-group">
            <legend className="k-scope-legend">
              <span className="k-scope-n">01</span> Your market
            </legend>
            <div className="k-scope-opts k-scope-opts--2" role="radiogroup" aria-label="Your market">
              {MARKETS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={scope.market === m.id}
                  aria-label={m.aria}
                  data-testid={`market-${m.id}`}
                  data-on={scope.market === m.id ? "true" : undefined}
                  onClick={() => set({ market: m.id })}
                  className="k-scope-opt"
                >
                  <span className="k-scope-opt-l">{m.label}</span>
                  <Tick on={scope.market === m.id} />
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- 02 volume ---- */}
          <div className="k-scope-group">
            <div className="k-scope-row">
              <label className="k-scope-legend" htmlFor="scope-volume">
                <span className="k-scope-n">02</span> Monthly ad volume
              </label>
              <output className="k-scope-value" htmlFor="scope-volume">
                {scope.volume}{scope.volume >= VOLUME.max ? "+" : ""} ads / month
              </output>
            </div>
            <input
              id="scope-volume"
              data-testid="scope-volume"
              className="k-scope-slider"
              type="range"
              min={VOLUME.min}
              max={VOLUME.max}
              step={VOLUME.step}
              value={scope.volume}
              onChange={(e) => set({ volume: Number(e.target.value) })}
              style={{ "--fill": `${pct}%` }}
            />
            <ul className="k-scope-marks" aria-hidden="true">
              {MILESTONES.map((m) => (
                <li key={m.at}>{m.label}</li>
              ))}
            </ul>
          </div>

          {/* ---- 03 creative mix ---- */}
          <fieldset className="k-scope-group">
            <legend className="k-scope-legend">
              <span className="k-scope-n">03</span> Ad creative mix
            </legend>
            <div className="k-scope-opts k-scope-opts--3" role="radiogroup" aria-label="Ad creative mix">
              {MIXES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={scope.mix === m.id}
                  data-testid={`mix-${m.id}`}
                  data-on={scope.mix === m.id ? "true" : undefined}
                  onClick={() => set({ mix: m.id })}
                  className="k-scope-opt"
                >
                  <span className="k-scope-opt-l">{m.label}</span>
                  <Tick on={scope.mix === m.id} />
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- 04 cadence ---- */}
          <fieldset className="k-scope-group">
            <legend className="k-scope-legend">
              <span className="k-scope-n">04</span> Production cadence
            </legend>
            <div className="k-scope-opts k-scope-opts--2 k-scope-opts--long" role="radiogroup" aria-label="Production cadence">
              {CADENCES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={scope.cadence === c.id}
                  data-testid={`cadence-${c.id}`}
                  data-on={scope.cadence === c.id ? "true" : undefined}
                  onClick={() => set({ cadence: c.id })}
                  className="k-scope-opt"
                >
                  <span className="k-scope-opt-l">
                    {c.label} <span className="k-scope-opt-n">({c.note})</span>
                  </span>
                  <Tick on={scope.cadence === c.id} />
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- the selection, restated ---- */}
          <dl className="k-scope-summary" data-testid="scope-summary">
            <div>
              <dt>Selected volume</dt>
              <dd data-testid="sum-volume">
                {scope.volume}{scope.volume >= VOLUME.max ? "+" : ""} ads / month
              </dd>
            </div>
            <div>
              <dt>Creative mix</dt>
              <dd data-testid="sum-mix">{mixOf(scope.mix).label}</dd>
            </div>
            <div>
              <dt>Cadence</dt>
              <dd data-testid="sum-cadence">
                {cadenceOf(scope.cadence).label} ({cadenceOf(scope.cadence).note})
              </dd>
            </div>
          </dl>

          {/* ---- the price, deliberately separated from the scope ---- */}
          <div className="k-scope-price" data-testid="scope-price">
            <p className="k-scope-price-k">Starting price · {market.label}</p>
            <p className="k-scope-price-v" data-testid="scope-price-value">
              Starting from {market.price}
            </p>
            <p className="k-scope-price-note">Final quote depends on your selected scope.</p>
          </div>

          <button type="button" data-testid="scope-cta" onClick={onContact} className="k-scope-cta">
            Contact us for a custom quote
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
        </>
      )}
    </Dialog>
  );
}
