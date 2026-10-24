import { useState } from "react";
import Dialog from "@/components/Dialog";
import {
  DEFAULT_WEB_SCOPE,
  featuresFor,
  isAdProject,
  LEVELS,
  MARKET_FLOORS,
  PROJECT_TYPES,
  TRAFFIC,
  estimateFor,
  hasRateModel,
  levelOf,
  typeOf,
  webScopeLine,
  ASSUMPTIONS,
  EXCLUSIONS,
} from "@/lib/webscope";

// ============================================================
// INTERACTIVE SCOPE ESTIMATOR — website and ecommerce
//
// A dialog over the current page. It does NOT replace the inline
// advertising scope builder, which stays exactly where it was and keeps
// its own state; this is a second, separate scope for a different kind of
// project, opened from its own trigger.
//
// ---- HONESTY ----
// The header says "PROJECT SCOPE", not "LIVE ESTIMATE", because no
// approved rate model exists yet. When lib/webscope.js gains rates,
// hasRateModel() flips and the header and the figure change with it. No
// sample arithmetic is shown in the meantime.
//
// ---- DIALOG BEHAVIOUR ----
// Provided by components/Dialog.jsx, which both estimators share: focus
// moves in and is trapped, Escape and the close button dismiss and return
// focus to the trigger, and background scroll is stopped through the
// page's own Lenis instance rather than a competing lock.
// ============================================================
export default function WebEstimator({ open, onClose, onContact }) {
  const [scope, setScope] = useState(DEFAULT_WEB_SCOPE);

  const set = (patch) =>
    setScope((s) => {
      const next = { ...s, ...patch };
      // The two families have different add-ons. Carrying a website
      // feature into an ad project would price something that is not on
      // offer for it, so the selection is cleared when the family changes.
      if (patch.type && isAdProject(patch.type) !== isAdProject(s.type)) next.features = [];
      return next;
    });
  const toggleFeature = (id) =>
    setScope((s) => ({
      ...s,
      features: s.features.includes(id)
        ? s.features.filter((f) => f !== id)
        : [...s.features, id],
    }));

  const feats = featuresFor(scope.type);
  const isAd = isAdProject(scope.type);
  const market = MARKET_FLOORS[scope.market];
  const live = hasRateModel();
  const estimate = estimateFor(scope);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="web-est-title"
      describedBy="web-est-desc"
      className="k-web"
    >
      {({ dismiss }) => (
      <>
        {/* ---- header ---- */}
        <div className="k-web-head">
          <div>
            <p id="web-est-title" className="k-web-title">
              Interactive scope estimator
            </p>
            <p className="k-web-sub">Websites, ecommerce and other builds</p>
          </div>
          <div className="k-web-head-r">
            <p className="k-web-badge">{live ? "Live estimate" : "Project scope"}</p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close the scope estimator"
              data-testid="web-close"
              className="k-web-x"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>

        <p id="web-est-desc" className="sr-only">
          Configure a website or ecommerce project. For an image or video ad campaign, close this
          and choose Start a Project instead. Selecting options records your requirements; it does
          not produce a binding price.
        </p>

        <div className="k-web-body">
          {/* ---- market ---- */}
          <fieldset className="k-web-group">
            <legend className="k-web-legend">Your market</legend>
            <div className="k-web-opts k-web-opts--2" role="radiogroup" aria-label="Your market">
              {Object.entries(MARKET_FLOORS).map(([id, m]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={scope.market === id}
                  data-on={scope.market === id ? "true" : undefined}
                  data-testid={`web-market-${id}`}
                  onClick={() => set({ market: id })}
                  className="k-web-opt"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- project type ---- */}
          <fieldset className="k-web-group">
            <legend className="k-web-legend">Project type</legend>
            <div className="k-web-opts k-web-opts--2" role="radiogroup" aria-label="Project type">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={scope.type === t.id}
                  data-on={scope.type === t.id ? "true" : undefined}
                  data-testid={`web-type-${t.id}`}
                  onClick={() => set({ type: t.id })}
                  className="k-web-opt k-web-opt--tall"
                >
                  <span className="k-web-opt-l">{t.label}</span>
                  <span className="k-web-opt-b">{t.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- traffic: only meaningful for a site ---- */}
          {!isAd && (
          <div className="k-web-group">
            <div className="k-web-row">
              <label className="k-web-legend" htmlFor="web-traffic">
                Expected monthly traffic
              </label>
              <output className="k-web-value" htmlFor="web-traffic" data-testid="web-traffic-value">
                {scope.traffic.toLocaleString("en-US")} visits / month
              </output>
            </div>
            <input
              id="web-traffic"
              data-testid="web-traffic"
              type="range"
              className="k-web-slider"
              min={TRAFFIC.min}
              max={TRAFFIC.max}
              step={TRAFFIC.step}
              value={scope.traffic}
              onChange={(e) => set({ traffic: Number(e.target.value) })}
              style={{
                "--fill": `${((scope.traffic - TRAFFIC.min) / (TRAFFIC.max - TRAFFIC.min)) * 100}%`,
              }}
            />
            <p className="k-web-hint">
              Recorded so we can size hosting and testing. It does not change the price on its own.
            </p>
          </div>
          )}

          {/* ---- level ---- */}
          <fieldset className="k-web-group">
            <legend className="k-web-legend">{isAd ? "Creative direction" : "Design and build level"}</legend>
            <div className="k-web-opts k-web-opts--2" role="radiogroup" aria-label="Design and build level">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={scope.level === l.id}
                  data-on={scope.level === l.id ? "true" : undefined}
                  data-testid={`web-level-${l.id}`}
                  onClick={() => set({ level: l.id })}
                  className="k-web-opt k-web-opt--tall"
                >
                  <span className="k-web-opt-l">{l.label}</span>
                  <span className="k-web-opt-b">{l.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* ---- features ---- */}
          <fieldset className="k-web-group">
            <legend className="k-web-legend">{isAd ? "What we deliver with it" : "What it needs to do"}</legend>
            <div className="k-web-feats">
              {feats.map((f) => (
                <label key={f.id} className="k-web-feat" data-on={scope.features.includes(f.id) ? "true" : undefined}>
                  <input
                    type="checkbox"
                    checked={scope.features.includes(f.id)}
                    onChange={() => toggleFeature(f.id)}
                    data-testid={`web-feat-${f.id}`}
                  />
                  <span>
                    <span className="k-web-feat-l">{f.label}</span>
                    <span className="k-web-feat-b">{f.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* ---- summary ---- */}
          <div className="k-web-sum" data-testid="web-summary">
            <p className="k-web-sum-k">Your requirements</p>
            <p className="k-web-sum-v" data-testid="web-summary-line">
              {webScopeLine(scope)}
            </p>
          </div>

          {/* ---- price, kept separate from the scope above ---- */}
          <div className="k-web-price" data-testid="web-price">
            {live && estimate ? (
              <>
                <p className="k-web-price-k">Estimated range · {market.label}</p>
                <p className="k-web-price-v" data-testid="web-price-value">
                  {estimate.text}
                </p>
                <p className="k-web-price-note" data-testid="web-price-note">
                  An estimate for the scope above, not a fixed price. The final quote depends on
                  confirmed scope. Our general minimum for {market.label} is {market.floor}.
                </p>
                <div className="k-web-terms">
                  <div>
                    <p className="k-web-terms-k">Includes</p>
                    <ul>{ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
                  </div>
                  <div>
                    <p className="k-web-terms-k">Excludes</p>
                    <ul>{EXCLUSIONS.map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="k-web-price-k">Starting price · {market.label}</p>
                <p className="k-web-price-v" data-testid="web-price-value">
                  Starting from {market.floor}
                </p>
                <p className="k-web-price-note" data-testid="web-price-note">
                  Custom quote required for this scope. The starting price is our general minimum
                  to take a project on, not the price of the requirements above.
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            data-testid="web-contact"
            onClick={() => onContact(webScopeLine(scope))}
            className="k-web-cta"
          >
            Contact us for a custom quote
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </>
      )}
    </Dialog>
  );
}
