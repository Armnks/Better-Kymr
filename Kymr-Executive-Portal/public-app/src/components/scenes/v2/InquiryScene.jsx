import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DecisionScene from "@/components/scenes/v2/DecisionScene";
import { useReducedMotion } from "framer-motion";
import {
  QUESTIONS, TOTAL_QUESTIONS, LIMITS,
  validateGeneral, validateProject, validateQuestion,
  buildPayload, reviewValue, hasContent,
} from "@/lib/inquiry";
import { submitInquiry, isConfigured } from "@/lib/submitInquiry";
import { goToScope, scopeLine, marketOf, useScope } from "@/lib/scope";
import { FlowButton } from "@/components/ui/flow-button";

const newId = () =>
  (globalThis.crypto?.randomUUID?.() || `k${Date.now()}${Math.random().toString(36).slice(2, 10)}`)
    .replace(/[^A-Za-z0-9_-]/g, "");

// ============================================================
// CHAPTER 5 - THE INQUIRY
//
// The only place on this site where a visitor can simply ask something.
// Before it, reaching a person meant an email client, a personal calendar
// link, or completing a six-stage estimator.
//
// Two modes on one ground, because two different people arrive here: one
// has a question, one has a project. The short form is the default; the
// guided brief is opt-in and asks its eight questions one at a time.
//
// Nothing about money or identity is persisted. The draft lives in
// component state for this visit only, is carried between the two modes
// without overwriting anything already typed there, and is never written
// to localStorage, a URL or an analytics call.
//
// Success is shown only when the server has accepted the inquiry. There
// is no optimistic success state anywhere in this file.
// ============================================================
const EMAIL = "media@kymrstudio.com";
const EMPTY = { website_url: "" };

export default function InquiryScene() {
  // The scope the visitor configured upstream. Read, never duplicated:
  // there is exactly one estimator state on the page.
  const { scope } = useScope();
  // A website/ecommerce scope arrives by event from the dialog. It is kept
  // beside the advertising scope rather than overwriting it, and it never
  // clears anything the visitor has already typed into the form.
  const [webScope, setWebScope] = useState("");
  useEffect(() => {
    const on = (e) => setWebScope(e.detail || "");
    window.addEventListener("kymr:web-scope", on);
    return () => window.removeEventListener("kymr:web-scope", on);
  }, []);
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("general");
  const [draft, setDraft] = useState(() => ({ ...EMPTY, started_at: Date.now() }));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0); // guided: 0..7, then TOTAL = review
  const [state, setState] = useState("idle"); // idle | sending | sent | failed
  const [failure, setFailure] = useState(null);
  const [announce, setAnnounce] = useState("");

  const sending = useRef(false);
  // Held for the life of one attempt, including its retries, and only
  // replaced once an inquiry has actually been stored.
  const submissionId = useRef(newId());
  const abort = useRef(null);
  const firstField = useRef(null);
  const modeBtns = useRef([]);

  useEffect(() => () => abort.current?.abort(), []);

  // The closing section's "Send a project brief" asks for the guided mode.
  // It travels as an event rather than a URL, so nothing a visitor has
  // typed can end up in the address bar or a history entry.
  useEffect(() => {
    const onAsk = (e) => {
      const want = e.detail === "project" ? "project" : "general";
      setMode((cur) => {
        if (cur === want) return cur;
        setErrors({});
        setStep(0);
        setState("idle");
        setFailure(null);
        setAnnounce(want === "project" ? "Project brief. Question 1 of 8." : "General inquiry form.");
        return want;
      });
    };
    window.addEventListener("kymr:inquiry-mode", onAsk);
    return () => window.removeEventListener("kymr:inquiry-mode", onAsk);
  }, []);

  const set = useCallback((k, v) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  }, []);

  // Switching modes keeps what has been typed. Name, email and company are
  // the same facts in both, so they carry; nothing already entered in the
  // destination is overwritten. A draft with real content asks first.
  const switchMode = useCallback(
    (next) => {
      if (next === mode) return;
      if (state === "sent") return;
      if (hasContent(draft) && !window.confirm(
        "Keep your answers and switch? Your name, email and company come with you; nothing is sent yet."
      )) return;
      setErrors({});
      setStep(0);
      setState("idle");
      setFailure(null);
      setMode(next);
      setAnnounce(next === "project" ? "Project brief. Question 1 of 8." : "General inquiry form.");
    },
    [mode, draft, state]
  );

  const onModeKey = (e) => {
    const i = modeBtns.current.indexOf(document.activeElement);
    if (i === -1) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const n = i === 0 ? 1 : 0;
      modeBtns.current[n]?.focus();
      switchMode(n === 0 ? "general" : "project");
    }
  };

  // ---- sending ----
  const send = useCallback(
    async (which) => {
      if (sending.current) return;
      const errs = which === "project" ? validateProject(draft) : validateGeneral(draft);
      if (Object.keys(errs).filter((k) => errs[k]).length) {
        setErrors(errs);
        const firstBad = Object.keys(errs).find((k) => errs[k]);
        if (which === "project") {
          const q = QUESTIONS.findIndex((x) => x.key === firstBad);
          if (q >= 0) setStep(q);
        }
        setAnnounce("There is something to fix before this can be sent.");
        return;
      }
      sending.current = true;
      setState("sending");
      setFailure(null);
      abort.current = new AbortController();
      try {
        await submitInquiry(
          {
            ...buildPayload(which, draft, {
              market: marketOf(scope.market).label,
              line: webScope || (scope.touched ? scopeLine(scope) : ""),
            }),
            submission_id: submissionId.current,
          },
          abort.current.signal
        );
        submissionId.current = newId();
        setState("sent");
        setAnnounce("Your inquiry has been received.");
      } catch (err) {
        if (err?.name === "AbortError") return;
        setState("failed");
        setFailure(err?.reason === "unconfigured"
          ? "This form is not connected to a destination yet."
          : null);
        setAnnounce("That could not be sent.");
      } finally {
        sending.current = false;
      }
    },
    [draft, scope, webScope]
  );

  // ---- guided navigation ----
  const q = QUESTIONS[step];
  const onReview = step >= TOTAL_QUESTIONS;

  const goto = useCallback((next) => {
    setStep(next);
    setAnnounce(next >= TOTAL_QUESTIONS
      ? "Review your answers."
      : `Question ${next + 1} of ${TOTAL_QUESTIONS}. ${QUESTIONS[next].label}.`);
    window.requestAnimationFrame(() => firstField.current?.focus());
  }, []);

  const advance = useCallback(() => {
    const err = validateQuestion(q.key, draft);
    if (err) {
      setErrors((e) => ({ ...e, [q.key]: err }));
      firstField.current?.focus();
      return;
    }
    goto(step + 1);
  }, [q, draft, step, goto]);

  const answeredCount = useMemo(
    () => QUESTIONS.filter((x) => reviewValue(x.key, draft) !== "").length,
    [draft]
  );

  const shell = (children) => (
    <section
      id="inquiry"
      data-testid="inquiry-scene"
      data-shader-mode="contact"
      className="env-inquiry k-inq relative"
    >
      <div className="k-inq-inner">
        <div className="k-inq-intro">
          <p className="t-data k-inq-eyebrow" aria-hidden="true">The commission</p>
          {/* The heading and standfirst strings are asserted verbatim by
              audit/2026-09-06/verify-stage5.js. The span changes how the
              last word is coloured without changing the text. */}
          <h2 className="k-inq-h">
            Tell us what you have in mind.
          </h2>
          <p className="k-inq-sub">
            Have a question, a collaboration in mind, or a project to discuss? Send us a note.
          </p>
          <p className="k-inq-alt">
            Or email{" "}
            <a href={`mailto:${EMAIL}`} className="k-inq-mail" data-testid="inquiry-email">
              {EMAIL}
            </a>
          </p>
          {/* "Prefer a conversation? Configure your scope" used to sit
              here. It was the same action as "Start a Project" in the
              close below, and once the two blocks became one chapter the
              visitor met the estimator twice in one screen. The three
              routes live in one place now: the close. */}
          <p className="k-inq-privacy">
            What you send reaches KymrStudio only. We use it to reply to you and for nothing
            else, and we do not add you to a mailing list.
          </p>
        </div>
        <div className="k-inq-panel">
          {(scope.touched || webScope) && (
          <div className="k-inq-scope" data-testid="inquiry-scope">
            <div>
              <p className="t-data k-inq-scope-k">Configured scope</p>
              <p className="k-inq-scope-v" data-testid="inquiry-scope-line">
                {webScope || `${marketOf(scope.market).label} · ${scopeLine(scope)}`}
              </p>
            </div>
            <button type="button" onClick={goToScope} className="k-inq-scope-edit"
              data-testid="inquiry-scope-edit">
              Edit
            </button>
          </div>
          )}
          {children}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>

      {/* The close belongs to this chapter now: the brief and the
          decision are one move, and they used to be two sections with a
          ground change and two lots of padding between them. */}
      <DecisionScene />
    </section>
  );

  if (state === "sent") {
    return shell(
      <div className="k-inq-done" data-testid="inquiry-sent">
        <p className="k-inq-done-h">Thanks, we&rsquo;ve received your inquiry.</p>
        <p className="k-inq-done-p">
          It is stored against your email address. If you need to add anything, write to{" "}
          <a href={`mailto:${EMAIL}`} className="k-inq-mail">{EMAIL}</a>. One of our team members will reach out to you very soon, please also check the spam folder for when we reach out.
        </p>
      </div>
    );
  }

  const failureNote = (
    <p className="k-inq-error" role="alert" data-testid="inquiry-failed">
      {failure || "We couldn’t send that."} Try again, or email{" "}
      <a href={`mailto:${EMAIL}`} className="k-inq-mail">{EMAIL}</a>.
    </p>
  );

  const honeypot = (
    <div className="k-inq-hp" aria-hidden="true">
      <label htmlFor="website_url">Leave this field empty</label>
      <input
        id="website_url"
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={draft.website_url || ""}
        onChange={(e) => set("website_url", e.target.value)}
      />
    </div>
  );

  const field = (key, label, opts = {}) => {
    const id = `inq-${key}`;
    const err = errors[key];
    const long = opts.kind === "long";
    const Tag = long ? "textarea" : "input";
    // In the guided flow the question heading is the field's visible label,
    // so repeating it above the input would say the same thing twice. The
    // input is named by that heading instead.
    const headed = opts.headedBy;
    return (
      <div className="k-inq-field" key={key}>
        {!headed && (
          <label htmlFor={id} className="k-inq-label">
            {label}
            {opts.required && <span aria-hidden="true"> *</span>}
            {!opts.required && <span className="k-inq-opt"> (optional)</span>}
          </label>
        )}
        {opts.help && <p className="k-inq-help" id={`${id}-help`}>{opts.help}</p>}
        <Tag
          id={id}
          ref={opts.first ? firstField : undefined}
          data-testid={`inq-${key}`}
          {...(long ? { rows: 5 } : { type: opts.kind === "email" ? "email" : "text" })}
          inputMode={opts.numeric ? "decimal" : undefined}
          autoComplete={opts.autoComplete}
          maxLength={opts.max}
          required={opts.required}
          aria-required={opts.required || undefined}
          aria-invalid={err ? "true" : undefined}
          aria-labelledby={headed || undefined}
          aria-describedby={[opts.help ? `${id}-help` : null, err ? `${id}-err` : null]
            .filter(Boolean).join(" ") || undefined}
          className={long ? "k-inq-textarea" : "k-inq-input"}
          value={draft[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          onKeyDown={(e) => {
            // Enter moves on from a valid single-line field. It never sends
            // the inquiry, and in a textarea it does what it always does.
            if (e.key !== "Enter" || long || e.nativeEvent?.isComposing) return;
            if (mode === "project") { e.preventDefault(); advance(); }
            else e.preventDefault();
          }}
        />
        {err && <p id={`${id}-err`} role="alert" className="k-inq-err" data-testid={`err-${key}`}>{err}</p>}
      </div>
    );
  };

  // ---------- GENERAL ----------
  const general = (
    <form
      className="k-inq-form"
      data-testid="inquiry-general"
      noValidate
      onSubmit={(e) => { e.preventDefault(); send("general"); }}
    >
      {field("name", "Name", { required: true, autoComplete: "name", max: LIMITS.name, first: true })}
      {field("email", "Email", { required: true, kind: "email", autoComplete: "email", max: LIMITS.email })}
      {field("company", "Company or website", { autoComplete: "organization", max: LIMITS.company })}
      {field("message", "How can we help?", { required: true, kind: "long", max: LIMITS.message })}
      {honeypot}
      <div className="k-inq-actions">
        <FlowButton type="submit" data-testid="inquiry-send" disabled={state === "sending"}
          aria-busy={state === "sending" || undefined} className="k-flow k-flow--primary"
          text={state === "sending" ? "Sending…" : "Send note"} />
        {state === "failed" && failureNote}
      </div>
    </form>
  );

  // ---------- GUIDED ----------
  const amountPair = () => (
    <div className="k-inq-field">
      <p className="k-inq-help" id="inq-budget-help">{q.help}</p>
      <div className="k-inq-pair" role="group" aria-labelledby="inq-question-heading"
        aria-describedby="inq-budget-help">
        <span>
          <label htmlFor="inq-budgetMin" className="k-inq-sublabel">Minimum</label>
          <input id="inq-budgetMin" data-testid="inq-budgetMin" ref={firstField} type="text"
            inputMode="decimal" disabled={!!draft.budgetNA} className="k-inq-input"
            placeholder="e.g. 5000" value={draft.budgetMin || ""}
            onChange={(e) => set("budgetMin", e.target.value)} />
        </span>
        <span>
          <label htmlFor="inq-budgetMax" className="k-inq-sublabel">Maximum</label>
          <input id="inq-budgetMax" data-testid="inq-budgetMax" type="text" inputMode="decimal"
            disabled={!!draft.budgetNA} className="k-inq-input" placeholder="e.g. 15000"
            value={draft.budgetMax || ""} onChange={(e) => set("budgetMax", e.target.value)} />
        </span>
      </div>
      <label className="k-inq-na">
        <input type="checkbox" data-testid="inq-budgetNA" checked={!!draft.budgetNA}
          onChange={(e) => set("budgetNA", e.target.checked)} />
        {q.na}
      </label>
      {errors.budget && <p role="alert" className="k-inq-err" data-testid="err-budget">{errors.budget}</p>}
    </div>
  );

  const singleWithNA = (key, naKey, placeholder) => (
    <div className="k-inq-field">
      <p className="k-inq-help" id={`inq-${key}-help`}>{q.help}</p>
      <input id={`inq-${key}`} data-testid={`inq-${key}`} ref={firstField} type="text"
        inputMode="decimal" disabled={!!draft[naKey]} className="k-inq-input"
        placeholder={placeholder} aria-labelledby="inq-question-heading"
        aria-describedby={`inq-${key}-help`}
        aria-invalid={errors[key] ? "true" : undefined}
        value={draft[key] || ""} onChange={(e) => set(key, e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent?.isComposing) { e.preventDefault(); advance(); } }} />
      <label className="k-inq-na">
        <input type="checkbox" data-testid={`inq-${naKey}`} checked={!!draft[naKey]}
          onChange={(e) => set(naKey, e.target.checked)} />
        {q.na}
      </label>
      {errors[key] && <p role="alert" className="k-inq-err" data-testid={`err-${key}`}>{errors[key]}</p>}
    </div>
  );

  const questionBody = () => {
    if (q.kind === "range") return amountPair();
    if (q.kind === "roas") return singleWithNA("roas", "roasNA", "e.g. 2.5x");
    if (q.kind === "amount") return singleWithNA("targetRevenue", "targetRevenueNA", "e.g. 50000");
    return field(q.key, q.label, {
      required: q.required, kind: q.kind, autoComplete: q.autoComplete,
      max: q.max, help: q.help, first: true, headedBy: "inq-question-heading",
    });
  };

  const review = (
    <div data-testid="inquiry-review">
      <p className="k-inq-step">Review</p>
      <h3 className="k-inq-qh">Check this over before you send it.</h3>
      <dl className="k-inq-review">
        {QUESTIONS.map((x) => {
          const val = reviewValue(x.key, draft);
          return (
            <div key={x.key} data-testid={`review-${x.key}`}>
              <dt>{x.label}</dt>
              <dd>
                <span className={val ? "" : "k-inq-unanswered"} data-answered={val ? "true" : "false"}>
                  {val || "Not answered"}
                </span>
                <button type="button" className="k-inq-edit" data-testid={`edit-${x.key}`}
                  onClick={() => goto(QUESTIONS.findIndex((y) => y.key === x.key))}>
                  Edit<span className="sr-only"> {x.label}</span>
                </button>
              </dd>
            </div>
          );
        })}
      </dl>
      {honeypot}
      <div className="k-inq-actions">
        <FlowButton type="button" className="k-flow k-flow--ghost" data-testid="inquiry-review-back"
          onClick={() => goto(TOTAL_QUESTIONS - 1)} text="Back" />
        <FlowButton type="button" className="k-flow k-flow--primary" data-testid="inquiry-send-project"
          disabled={state === "sending"} aria-busy={state === "sending" || undefined}
          onClick={() => send("project")}
          text={state === "sending" ? "Sending…" : "Send inquiry"} />
        {state === "failed" && failureNote}
      </div>
    </div>
  );

  const guided = (
    <div data-testid="inquiry-project">
      {!onReview && (
        <>
          <div className="k-inq-progress">
            <p className="k-inq-step" data-testid="inquiry-step">
              Question {step + 1} of {TOTAL_QUESTIONS}
            </p>
            <span className="k-inq-bar" aria-hidden="true">
              <span className="k-inq-bar-fill"
                style={{ transform: `scaleX(${(step + 1) / TOTAL_QUESTIONS})` }} />
            </span>
          </div>
          <h3 className="k-inq-qh" id="inq-question-heading">
            {q.label}
            {!q.required && <span className="k-inq-opt"> (optional)</span>}
          </h3>
          <div className={reduce ? "" : "k-inq-step-in"} key={q.key}>{questionBody()}</div>
          <div className="k-inq-actions">
            {step > 0 && (
              <FlowButton type="button" className="k-flow k-flow--ghost" data-testid="q-back"
                onClick={() => goto(step - 1)} text="Back" />
            )}
            <FlowButton type="button" className="k-flow k-flow--primary" data-testid="q-continue"
              onClick={advance}
              text={step === TOTAL_QUESTIONS - 1 ? "Review" : "Continue"} />
            {!q.required && (
              <button type="button" className="k-inq-skip" data-testid="q-skip"
                onClick={() => goto(step + 1)}>Skip</button>
            )}
            {step >= 2 && (
              <button type="button" className="k-inq-skip" data-testid="q-skip-rest"
                onClick={() => goto(TOTAL_QUESTIONS)}>Skip remaining optional questions</button>
            )}
          </div>
          <p className="k-inq-count">{answeredCount} of {TOTAL_QUESTIONS} answered so far.</p>
        </>
      )}
      {onReview && review}
    </div>
  );

  return shell(
    <>
      <div className="k-inq-modes" role="tablist" aria-label="How would you like to get in touch?"
        onKeyDown={onModeKey}>
        {[["general", "General inquiry"], ["project", "Share a project brief"]].map(([id, label], i) => (
          <button key={id} type="button" role="tab" id={`inq-tab-${id}`}
            aria-selected={mode === id} aria-controls="inq-panel"
            tabIndex={mode === id ? 0 : -1} data-testid={`mode-${id}`}
            data-on={mode === id ? "true" : undefined}
            ref={(n) => { modeBtns.current[i] = n; }}
            onClick={() => switchMode(id)} className="k-inq-mode">
            {label}
          </button>
        ))}
      </div>
      <div id="inq-panel" role="tabpanel" aria-labelledby={`inq-tab-${mode}`}>
        {mode === "general" ? general : guided}
      </div>
      {!isConfigured() && (
        <p className="k-inq-note" data-testid="inquiry-unconfigured">
          {/* Truthful and NOT hidden: this build genuinely has no submission
              destination. But the previous wording pointed a visitor at an
              internal audit document. It now gives them a route that works. */}
          Online sending is not switched on for this build yet. Use the email address above
          and your note reaches the same place.
        </p>
      )}
    </>
  );
}
