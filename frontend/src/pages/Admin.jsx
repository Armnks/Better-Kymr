import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Admin() {
  const [key, setKey] = useState(
    () => sessionStorage.getItem("kymr_admin_key") || ""
  );
  const [enquiries, setEnquiries] = useState(null);
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState("");

  const load = async (k) => {
    setError("");
    try {
      const headers = { "X-Admin-Key": k };
      const [eq, ld] = await Promise.all([
        axios.get(`${API}/enquiries`, { headers }),
        axios.get(`${API}/leads`, { headers }),
      ]);
      setEnquiries(eq.data);
      setLeads(ld.data);
      sessionStorage.setItem("kymr_admin_key", k);
    } catch {
      setError("ACCESS DENIED — INVALID KEY");
      setEnquiries(null);
      setLeads(null);
    }
  };

  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-testid="admin-page"
      className="min-h-screen bg-void px-6 py-16 text-bone md:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-cinzel text-3xl font-bold tracking-tight">
            KymrStudio<span className="text-ember">.</span> Vault
          </h1>
          <a
            data-testid="admin-back-link"
            href="/"
            className="font-mono text-[10px] tracking-[0.35em] text-white/40 transition-colors duration-300 hover:text-white"
          >
            ← BACK TO EXPERIENCE
          </a>
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.35em] text-white/40">
          INCOMING SIGNALS — {enquiries ? enquiries.length : "—"}
        </p>

        {!enquiries && (
          <form
            data-testid="admin-login-form"
            className="mt-16 flex max-w-md flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              load(key);
            }}
          >
            <input
              data-testid="admin-key-input"
              type="password"
              className="input-line"
              placeholder="ADMIN KEY"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <button
              data-testid="admin-login-button"
              type="submit"
              className="self-start font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember"
            >
              UNLOCK →
            </button>
            {error && (
              <p
                data-testid="admin-error"
                className="font-mono text-[10px] tracking-[0.3em] text-ember"
              >
                {error}
              </p>
            )}
          </form>
        )}

        {(enquiries || leads) && (
          <>
            {leads && (
              <div data-testid="admin-lead-list" className="mt-16 space-y-6">
                <p className="font-mono text-[10px] tracking-[0.35em] text-ember">
                  CONFIGURED SCOPES — {leads.length}
                </p>
                {leads.length === 0 && (
                  <p className="font-serif text-xl italic text-white/50">
                    No scopes configured yet.
                  </p>
                )}
                {leads.map((l) => (
                  <article
                    key={l.id}
                    data-testid={`admin-lead-${l.id}`}
                    className="border border-ember/30 p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-xl font-bold">
                        {l.name}
                        {l.company ? ` — ${l.company}` : ""}
                      </h2>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                        {new Date(l.created_at).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={`mailto:${l.email}`}
                      className="mt-1 inline-block font-mono text-xs tracking-[0.15em] text-ember"
                    >
                      {l.email}
                    </a>
                    <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-white/70">
                      {l.config?.volume || "—"} ADS/MO · {String(l.config?.mix || "—").toUpperCase()} ·{" "}
                      {String(l.config?.cadence || "—").toUpperCase()} · {l.tier || "—"}
                    </p>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-white/40">
                      CALL: {l.meeting?.booked ? `BOOKED ${l.meeting.startTime || ""}` : "NOT BOOKED"}
                    </p>
                  </article>
                ))}
              </div>
            )}
            <div data-testid="admin-enquiry-list" className="mt-16 space-y-6">
              <p className="font-mono text-[10px] tracking-[0.35em] text-white/40">
                LEGACY SIGNALS — {enquiries ? enquiries.length : 0}
              </p>
              {enquiries && enquiries.length === 0 && (
                <p className="font-serif text-xl italic text-white/50">
                  The void is quiet. No signals yet.
                </p>
              )}
              {enquiries &&
                enquiries.map((q) => (
                  <article
                    key={q.id}
                    data-testid={`admin-enquiry-${q.id}`}
                    className="border border-white/10 p-6 transition-colors duration-300 hover:border-white/25"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-xl font-bold">{q.name}</h2>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                        {new Date(q.created_at).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={`mailto:${q.email}`}
                      className="mt-1 inline-block font-mono text-xs tracking-[0.15em] text-ember"
                    >
                      {q.email}
                    </a>
                    <p className="mt-4 font-serif text-lg italic text-white/70">{q.message}</p>
                  </article>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
