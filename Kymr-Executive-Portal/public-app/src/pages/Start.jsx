import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import Cal, { getCalApi } from "@calcom/embed-react";
import Background from "@/components/Background";
import Cursor from "@/components/Cursor";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const CAL_LINK = "armaan-khasim-shaik-p9vin0";
const STORE_KEY = "kymr-start";

const generateIdempotencyKey = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

const MIXES = [
  { id: "static", label: "STATIC", desc: "STILL FRAMES THAT CONVERT" },
  { id: "motion", label: "MOTION", desc: "VIDEO-FIRST PRODUCTION" },
  { id: "hybrid", label: "HYBRID", desc: "STATIC + MOTION SYSTEM" },
];
const CADENCES = [
  { id: "standard", label: "STANDARD 48H", desc: "48-HOUR TURNAROUND PER BATCH" },
  { id: "sprint", label: "SPRINT", desc: "CONDENSED PRODUCTION SPRINTS" },
  { id: "weekly", label: "WEEKLY DROPS", desc: "STANDING WEEKLY RELEASE RHYTHM" },
];
const tierFor = (v) => {
  const n = parseInt(v || "20", 10);
  return n <= 15 ? "IGNITION" : n <= 30 ? "MOMENTUM" : "SCALE";
};
const RAIL = ["VOLUME", "MIX", "CADENCE", "ESTIMATE", "DETAILS", "CALL"];

const RATES = {
  USD: { IGNITION: [500, 1500], MOMENTUM: [1600, 3000], SCALE: [3100, 5000] },
  INR: { IGNITION: [40000, 125000], MOMENTUM: [135000, 250000], SCALE: [260000, 415000] },
};
const fmtRate = (n, cur) =>
  cur === "INR"
    ? n < 100000
      ? `₹${Math.round(n / 1000)}K`
      : `₹${(n / 100000).toFixed(n % 100000 ? 2 : 0).replace(/\.?0+$/, "")}L`
    : `$${n.toLocaleString("en-US")}`;
const rateRange = (t, cur) => {
  const [lo, hi] = (RATES[cur] || RATES.USD)[t] || RATES.USD.MOMENTUM;
  return `${fmtRate(lo, cur)} – ${fmtRate(hi, cur)}`;
};

function CurrencyToggle({ value, onChange }) {
  return (
    <div className="inline-flex border border-white/15" data-testid="currency-toggle">
      {["USD", "INR"].map((c) => (
        <button
          key={c}
          type="button"
          data-testid={`currency-${c.toLowerCase()}`}
          data-hover
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={`px-4 py-2 font-mono text-[10px] tracking-[0.3em] transition-colors duration-300 ${
            value === c ? "bg-ember text-void" : "text-white/40 hover:text-white"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

const labelOf = (list, id) => (list.find((o) => o.id === id) || {}).label || "—";

function OptionRow({ index, label, desc, selected, onSelect, testid }) {
  return (
    <button
      type="button"
      data-testid={testid}
      data-hover
      aria-pressed={selected}
      onClick={onSelect}
      className="group flex w-full items-center justify-between gap-6 border-t border-white/10 py-6 text-left md:py-8"
    >
      <span className="flex items-baseline gap-5 md:gap-8">
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/30">{index}</span>
        <span
          className={`font-display text-3xl font-black tracking-tight transition-all duration-300 md:text-5xl ${
            selected
              ? "translate-x-2 text-bone"
              : "text-white/35 group-hover:translate-x-2 group-hover:text-white/70"
          }`}
        >
          {label}
        </span>
      </span>
      <span className="flex items-center gap-4">
        <span className="hidden font-mono text-[10px] tracking-[0.25em] text-white/30 md:block">
          {desc}
        </span>
        <span
          className={`h-2 w-2 rounded-full transition-colors duration-300 ${
            selected ? "bg-ember" : "bg-white/15"
          }`}
        />
      </span>
    </button>
  );
}

export default function Start() {
  const panelRef = useRef(null);
  const submittedRef = useRef(false);
  const [stage, setStage] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}").stage || 0;
    } catch {
      return 0;
    }
  });
  const [config, setConfig] = useState(() => {
    try {
      return { volume: 20, ...(JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}").config || {}) };
    } catch {
      return {};
    }
  });
  const [details, setDetails] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}").details || {};
    } catch {
      return {};
    }
  });
  const [errors, setErrors] = useState({});
  const [currency, setCurrency] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}").currency || "USD";
    } catch {
      return "USD";
    }
  });
  const [bookingState, setBookingState] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const veilRef = useRef(null);
  const [veil, setVeil] = useState(() => {
    if (sessionStorage.getItem("kymr-ripple") === "1") {
      sessionStorage.removeItem("kymr-ripple");
      return true;
    }
    return false;
  });

  const tier = tierFor(config.volume);
  const stageIndex = stage <= 2 ? stage : stage === 3 ? 3 : stage === 4 ? 4 : 5;

  useEffect(() => {
    sessionStorage.setItem(
      STORE_KEY,
      JSON.stringify({ stage: stage === 6 ? 4 : stage, config, details, currency })
    );
  }, [stage, config, details, currency]);

  useEffect(() => {
    if (!veil || !veilRef.current) return undefined;
    const tween = gsap.to(veilRef.current, {
      autoAlpha: 0,
      duration: 0.7,
      delay: 0.15,
      ease: "power2.out",
      onComplete: () => setVeil(false),
    });
    return () => tween.kill();
  }, [veil]);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== 5) return undefined;
    let api;
    let alive = true;
    const onSuccess = (event) => {
      const data = event?.detail?.data || {};
      if (!alive) return;
      setBookingState("booked");
      submitLead({ booked: true, startTime: data.startTime || null, uid: data.uid || null });
    };
    const onFailure = (event) => {
      console.error("Cal embed failure", event?.detail?.data);
      if (alive) setBookingState("failed");
    };
    getCalApi({ namespace: "booking" }).then((cal) => {
      api = cal;
      cal("on", { action: "bookingSuccessfulV2", callback: onSuccess });
      cal("on", { action: "linkFailed", callback: onFailure });
    });
    return () => {
      alive = false;
      if (api) {
        api("off", { action: "bookingSuccessfulV2", callback: onSuccess });
        api("off", { action: "linkFailed", callback: onFailure });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const idempotencyKeyRef = useRef(generateIdempotencyKey());

  const submitLead = async (meeting) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await axios.post(`${API}/public/inquiries`, {
        name: details.name,
        email: details.email,
        company: details.company || "",
        phone: details.phone || "",
        config: { volume: config.volume, mix: config.mix, cadence: config.cadence },
        tier,
        meeting,
        message: details.message || "",
        source: "website",
        submissionType: meeting ? "BOOKING" : "CONFIGURED_SCOPE"
      }, {
        headers: {
          "Idempotency-Key": idempotencyKeyRef.current
        }
      });
      setStage(6);
    } catch (err) {
      if (err.response?.status === 429) {
        setBookingState("rate-limited");
        alert("Too many requests. Please try again shortly.");
      } else {
        setBookingState("submit-failed");
      }
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const validateDetails = () => {
    const e = {};
    if (!details.name?.trim()) e.name = "NAME IS REQUIRED";
    if (!details.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))
      e.email = "VALID WORK EMAIL REQUIRED";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const rail = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] tracking-[0.3em]">
      {RAIL.map((r, i) => (
        <span
          key={r}
          className={
            i < stageIndex ? "text-white/40" : i === stageIndex ? "text-bone" : "text-white/20"
          }
        >
          0{i + 1} {r}
        </span>
      ))}
    </div>
  );

  const estimateAside = (
    <aside
      data-testid="live-estimate"
      className="border border-white/10 p-6 md:sticky md:top-28 md:p-8"
    >
      <p className="font-mono text-[9px] tracking-[0.4em] text-white/40">CONFIGURED SCOPE — LIVE</p>
      <dl className="mt-6 space-y-4 font-mono text-[11px] tracking-[0.2em]">
        <div className="flex justify-between gap-4">
          <dt className="text-white/40">VOLUME</dt>
          <dd data-testid="estimate-volume" className="text-bone">{config.volume || 20} ADS / MO</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/40">MIX</dt>
          <dd data-testid="estimate-mix" className="text-bone">{labelOf(MIXES, config.mix)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/40">CADENCE</dt>
          <dd data-testid="estimate-cadence" className="text-bone">{labelOf(CADENCES, config.cadence)}</dd>
        </div>
      </dl>
      <div className="mt-6 border-t border-white/10 pt-6">
        <p className="font-mono text-[9px] tracking-[0.4em] text-white/40">TIER</p>
        <p data-testid="estimate-tier" className="mt-2 font-cinzel text-3xl font-bold text-ember">{tier}</p>
        <p className="mt-4 font-mono text-[9px] leading-relaxed tracking-[0.25em] text-white/40">
          EVERY ASSET — 100% REVIEW · 10+ ITERATIONS
        </p>
        <div className="mt-4">
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>
        <p data-testid="estimate-rate" className="mt-4 font-mono text-[10px] tracking-[0.2em] text-white/50">
          INVESTMENT — {rateRange(tier, currency)} / MO · CONFIRMED ON YOUR CALL
        </p>
      </div>
    </aside>
  );

  const configureStage = (list, value, key, title, sub, nextLabel) => (
    <div className="grid gap-12 md:grid-cols-[1fr_340px]">
      <div>
        <p className="font-mono text-[10px] tracking-[0.5em] text-ember">{sub}</p>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-bone md:text-6xl">
          {title}
        </h1>
        <div className="mt-10">
          {list.map((o, i) => (
            <OptionRow
              key={o.id}
              index={`0${i + 1}`}
              label={o.label}
              desc={o.desc}
              selected={value === o.id}
              testid={`opt-${key}-${o.id}`}
              onSelect={() => setConfig({ ...config, [key]: o.id })}
            />
          ))}
          <div className="border-t border-white/10" />
        </div>
        <div className="mt-10 flex items-center gap-8">
          {stage > 0 && (
            <button
              data-testid="back-button"
              data-hover
              onClick={() => setStage(stage - 1)}
              className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
            >
              ← BACK
            </button>
          )}
          <button
            data-testid={`continue-${key}`}
            data-hover
            disabled={!value}
            onClick={() => setStage(stage + 1)}
            className="font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember disabled:opacity-30"
          >
            {nextLabel} →
          </button>
        </div>
      </div>
      {estimateAside}
    </div>
  );

  const volumeStage = (
    <div className="grid gap-12 md:grid-cols-[1fr_340px]">
      <div>
        <p className="font-mono text-[10px] tracking-[0.5em] text-ember">01 / SCOPE</p>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-bone md:text-6xl">
          Monthly ad volume.
        </h1>
        <div className="mt-14">
          <div className="flex items-baseline justify-between">
            <span data-testid="volume-readout" className="font-display text-6xl font-black tracking-tight text-bone md:text-8xl">
              {config.volume || 20}
              <span className="ml-3 font-mono text-xs tracking-[0.3em] text-white/40">ADS / MO</span>
            </span>
            <span className="font-cinzel text-xl font-bold text-ember md:text-2xl">{tier}</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={config.volume || 20}
            aria-label="Monthly ad volume in ads per month"
            data-testid="volume-slider"
            onChange={(e) => setConfig({ ...config, volume: parseInt(e.target.value, 10) })}
            className="volume-slider"
          />
          <div className="mt-3 flex justify-between font-mono text-[9px] tracking-[0.3em] text-white/30">
            <span>5</span>
            <span>50+</span>
          </div>
        </div>
        <div className="mt-12">
          <button
            data-testid="continue-volume"
            data-hover
            onClick={() => setStage(1)}
            className="font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember"
          >
            CONTINUE →
          </button>
        </div>
      </div>
      {estimateAside}
    </div>
  );

  const stages = [
    volumeStage,
    configureStage(MIXES, config.mix, "mix", "Ad creative mix.", "02 / FORMAT", "CONTINUE"),
    configureStage(CADENCES, config.cadence, "cadence", "Production cadence.", "03 / RHYTHM", "REVEAL ESTIMATE"),
  ];

  return (
    <div data-testid="start-page" className="relative min-h-screen bg-void text-bone">
      {veil && (
        <div
          ref={veilRef}
          data-testid="start-arrival-veil"
          className="pointer-events-none fixed inset-0 z-[250] bg-[#050505]"
        />
      )}
      <Background />
      <Cursor />
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
        <Link
          to="/"
          data-testid="start-logo"
          data-hover
          className="font-cinzel text-lg font-bold tracking-tight text-white"
        >
          KymrStudio<span className="text-ember">.</span>
        </Link>
        <div className="hidden md:block">{rail}</div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-32 md:px-10 md:pt-40">
        <div className="mb-10 md:hidden">{rail}</div>
        <div ref={panelRef} key={stage}>
          {stage <= 2 && stages[stage]}

          {stage === 3 && (
            <div data-testid="estimate-result" className="text-center">
              <p className="font-mono text-[10px] tracking-[0.5em] text-ember">04 / ESTIMATE</p>
              <p className="mt-8 font-serif text-xl italic text-white/50 md:text-2xl">
                your production system, scoped:
              </p>
              <h1
                data-testid="result-tier"
                className="mt-6 font-cinzel text-[16vw] font-black leading-none text-bone md:text-[9vw]"
              >
                {tier}
              </h1>
              <div className="mx-auto mt-10 max-w-xl space-y-3 font-mono text-[11px] tracking-[0.25em] text-white/60">
                <p data-testid="result-volume">{config.volume} ADS / MO</p>
                <p>{labelOf(MIXES, config.mix)} MIX</p>
                <p>{labelOf(CADENCES, config.cadence)}</p>
                <div className="mx-auto mt-6 h-px w-24 bg-ember" />
                <p className="pt-4 text-white/40">
                  100% ASSET REVIEW — 10+ ITERATIONS / SPRINT — 48H TURNAROUND
                </p>
                <p data-testid="result-rate" className="text-white/40">
                  INVESTMENT: {rateRange(tier, currency)} / MO — CONFIRMED ON YOUR CALL
                </p>
                <div className="pt-3">
                  <CurrencyToggle value={currency} onChange={setCurrency} />
                </div>
              </div>
              <div className="mt-14 flex items-center justify-center gap-10">
                <button
                  data-testid="edit-scope-button"
                  data-hover
                  onClick={() => setStage(0)}
                  className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
                >
                  ← EDIT SCOPE
                </button>
                <button
                  data-testid="start-inquiry-button"
                  data-hover
                  onClick={() => setStage(4)}
                  className="font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember"
                >
                  START INQUIRY →
                </button>
              </div>
            </div>
          )}

          {stage === 4 && (
            <div data-testid="inquiry-stage" className="grid gap-12 md:grid-cols-[1fr_340px]">
              <div>
                <p className="font-mono text-[10px] tracking-[0.5em] text-ember">05 / DETAILS</p>
                <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-bone md:text-6xl">
                  Who are we building for?
                </h1>
                <div className="mt-12 space-y-2">
                  <label htmlFor="lead-name" className="font-mono text-[9px] tracking-[0.35em] text-white/40">
                    YOUR NAME *
                  </label>
                  <input
                    id="lead-name"
                    data-testid="lead-name-input"
                    className="input-line text-lg"
                    value={details.name || ""}
                    onChange={(e) => {
                      setDetails({ ...details, name: e.target.value });
                      setErrors((p) => ({ ...p, name: undefined }));
                    }}
                  />
                  {errors.name && (
                    <p data-testid="error-name" className="pt-1 font-mono text-[9px] tracking-[0.3em] text-ember">
                      {errors.name}
                    </p>
                  )}
                  <div className="h-6" />
                  <label htmlFor="lead-email" className="font-mono text-[9px] tracking-[0.35em] text-white/40">
                    WORK EMAIL *
                  </label>
                  <input
                    id="lead-email"
                    data-testid="lead-email-input"
                    type="email"
                    className="input-line text-lg"
                    value={details.email || ""}
                    onChange={(e) => {
                      setDetails({ ...details, email: e.target.value });
                      setErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                  {errors.email && (
                    <p data-testid="error-email" className="pt-1 font-mono text-[9px] tracking-[0.3em] text-ember">
                      {errors.email}
                    </p>
                  )}
                  <div className="h-6" />
                  <label htmlFor="lead-company" className="font-mono text-[9px] tracking-[0.35em] text-white/40">
                    COMPANY / BRAND
                  </label>
                  <input
                    id="lead-company"
                    data-testid="lead-company-input"
                    className="input-line text-lg"
                    value={details.company || ""}
                    onChange={(e) => setDetails({ ...details, company: e.target.value })}
                  />
                  <div className="h-6" />
                  <label htmlFor="lead-phone" className="font-mono text-[9px] tracking-[0.35em] text-white/40">
                    PHONE (OPTIONAL)
                  </label>
                  <input
                    id="lead-phone"
                    data-testid="lead-phone-input"
                    className="input-line text-lg"
                    value={details.phone || ""}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  />
                </div>
                <div className="mt-12 flex items-center gap-8">
                  <button
                    data-testid="details-back-button"
                    data-hover
                    onClick={() => setStage(3)}
                    className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
                  >
                    ← BACK
                  </button>
                  <button
                    data-testid="details-continue-button"
                    data-hover
                    onClick={() => validateDetails() && setStage(5)}
                    className="font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember"
                  >
                    BOOK A CALL →
                  </button>
                </div>
              </div>
              <aside className="h-fit border border-white/10 p-6 md:sticky md:top-28 md:p-8">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] tracking-[0.4em] text-white/40">
                    CONFIGURED SCOPE ESTIMATE
                  </p>
                  <button
                    data-testid="summary-edit-button"
                    data-hover
                    onClick={() => setStage(0)}
                    className="font-mono text-[9px] tracking-[0.3em] text-ember hover:text-white"
                  >
                    EDIT
                  </button>
                </div>
                <div className="mt-6 space-y-3 font-mono text-[11px] tracking-[0.2em] text-bone">
                  <p data-testid="summary-volume">{config.volume} ADS / MO</p>
                  <p>{labelOf(MIXES, config.mix)} MIX</p>
                  <p>{labelOf(CADENCES, config.cadence)}</p>
                  <p className="pt-3 font-cinzel text-2xl font-bold text-ember">{tier}</p>
                </div>
              </aside>
            </div>
          )}

          {stage === 5 && (
            <div data-testid="book-stage">
              <p className="font-mono text-[10px] tracking-[0.5em] text-ember">06 / THE CALL</p>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-bone md:text-6xl">
                Book the first frame.
              </h1>
              <p className="mt-6 max-w-xl font-serif text-lg italic text-white/50">
                real availability, confirmed instantly by the calendar — or send your scope and we
                reply within 48H.
              </p>
              <div className="mt-12 min-h-[640px] border border-white/10">
                <Cal
                  namespace="booking"
                  calLink={CAL_LINK}
                  config={{ theme: "dark", layout: "month_view", "ui.color-scheme": "dark" }}
                  style={{ width: "100%", height: "640px", overflow: "scroll" }}
                />
              </div>
              {bookingState === "failed" && (
                <p data-testid="booking-error" className="mt-4 font-mono text-[10px] tracking-[0.3em] text-ember">
                  CALENDAR UNAVAILABLE — EMAIL media@kymrstudio.com OR SEND YOUR SCOPE BELOW
                </p>
              )}
              {bookingState === "submit-failed" && (
                <p data-testid="submit-error" className="mt-4 font-mono text-[10px] tracking-[0.3em] text-ember">
                  TRANSMISSION FAILED — TRY AGAIN OR EMAIL media@kymrstudio.com
                </p>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <button
                  data-testid="book-back-button"
                  data-hover
                  onClick={() => setStage(4)}
                  className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
                >
                  ← BACK
                </button>
                <button
                  data-testid="book-skip-button"
                  data-hover
                  disabled={submitting}
                  onClick={() => submitLead({ booked: false })}
                  className="font-mono text-[10px] tracking-[0.35em] text-white/60 transition-colors duration-300 hover:text-ember disabled:opacity-30"
                >
                  SKIP THE CALL — SEND MY SCOPE →
                </button>
                <a
                  data-testid="book-mailto"
                  data-hover
                  href="mailto:media@kymrstudio.com"
                  className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
                >
                  media@kymrstudio.com ↗
                </a>
              </div>
            </div>
          )}

          {stage === 6 && (
            <div data-testid="done-stage" className="py-16 text-center">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-ember" />
              <h1 className="mt-10 font-cinzel text-[12vw] font-black leading-none text-bone md:text-[7vw]">
                RECEIVED
              </h1>
              <p className="mt-8 font-serif text-xl italic text-white/50 md:text-2xl">
                your scope is in the edit suite. we reply within 48H.
              </p>
              <div className="mt-12 flex items-center justify-center gap-10 font-mono text-[10px] tracking-[0.35em]">
                <a
                  data-testid="done-mailto"
                  data-hover
                  href="mailto:media@kymrstudio.com"
                  className="text-white/50 transition-colors duration-300 hover:text-white"
                >
                  media@kymrstudio.com ↗
                </a>
                <Link
                  to="/"
                  data-testid="done-home-link"
                  data-hover
                  className="text-ember transition-colors duration-300 hover:text-white"
                >
                  ← BACK TO THE FILM
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
