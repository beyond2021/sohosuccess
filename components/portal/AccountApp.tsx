"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import {
  acceptEstimate,
  alertAnchor,
  getAlerts,
  markAlertsRead,
  timeAgo,
  type AppAlert,
  declineEstimate,
  estimateTotal,
  getEstimates,
  getInvoices,
  getMe,
  getServices,
  money,
  payInvoice,
  sendCode,
  shortDate,
  signInWithPassword,
  signOut,
  verifyCode,
  type ClientService,
  type Estimate,
  type Invoice,
  type Me,
} from "@/lib/portal";
import { btnPrimary, btnSecondary, card, input, label } from "./Page";

const SERVICE_ICON: Record<ClientService["kind"], string> = {
  network: "fa-solid fa-wifi",
  cameras: "fa-solid fa-video",
  website: "fa-solid fa-globe",
  app: "fa-solid fa-mobile-screen",
  other: "fa-solid fa-screwdriver-wrench",
};
const SERVICE_STATUS = {
  ok: ["All good", "text-emerald-300 border-emerald-400/40"],
  attention: ["Needs attention", "text-purple-300 border-purple-400/40"],
  down: ["Down", "text-rose-300 border-rose-400/40"],
} as const;
const ESTIMATE_STATUS = {
  sent: ["Waiting for you", "text-cyan-300 border-cyan-400/40"],
  accepted: ["Accepted", "text-emerald-300 border-emerald-400/40"],
  declined: ["Declined", "text-white/40 border-white/15"],
  expired: ["Expired", "text-white/40 border-white/15"],
} as const;
const INVOICE_STATUS = {
  due: ["Due", "text-cyan-300 border-cyan-400/40"],
  overdue: ["Overdue", "text-rose-300 border-rose-400/40"],
  paid: ["Paid", "text-emerald-300 border-emerald-400/40"],
  void: ["Void", "text-white/40 border-white/15"],
} as const;

function Pill({ text, cls }: { text: string; cls: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>● {text}</span>;
}

export default function AccountApp() {
  const sb = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sb) {
      setReady(true);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  if (!sb) {
    return (
      <div className={card}>
        <p className="text-white/70">Client accounts are being switched on. In the meantime, use the contact form and we&apos;ll help you directly.</p>
      </div>
    );
  }
  if (!ready) return <p className="text-white/50">Loading…</p>;
  return session ? <Dashboard key={session.user.id} /> : <SignIn />;
}

// ───────────────────────── Sign in ─────────────────────────

function SignIn() {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Client <span className="gradient-text">login</span>
        </h1>
        <p className="mt-3 text-white/60">See your services, accept estimates and pay invoices with Apple Pay, Google Pay or card.</p>
      </div>

      <form
        className={`${card} space-y-4`}
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "email") run(async () => { await sendCode(email); setStep("code"); });
          else if (step === "code") run(() => verifyCode(email, code));
          else run(() => signInWithPassword(email, password));
        }}
      >
        {step === "code" ? (
          <>
            <p className="text-white/70">
              We emailed a sign-in code to <strong className="text-white">{email.trim()}</strong>.
            </p>
            <div>
              <label htmlFor="code" className={label}>Code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="123456"
                className={`${input} text-center text-2xl font-bold tracking-[0.35em]`}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" className={input} />
            </div>
            {step === "password" ? (
              <div>
                <label htmlFor="password" className={label}>Password</label>
                <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              </div>
            ) : null}
          </>
        )}

        {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}

        <button type="submit" className={`${btnPrimary} w-full`} disabled={busy || (step === "code" && code.length < 6)}>
          {busy ? "One moment…" : step === "email" ? "Email me a sign-in code" : "Sign in"}
        </button>

        <div className="text-center">
          {step === "email" ? (
            <button type="button" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => { setStep("password"); setError(null); }}>
              Use a password instead
            </button>
          ) : (
            <button type="button" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => { setStep("email"); setCode(""); setError(null); }}>
              {step === "code" ? "Use a different email" : "Email me a code instead"}
            </button>
          )}
        </div>
      </form>

      <p className="text-sm text-white/40">
        Not a client yet? Accounts are set up when you work with us. <a href="/estimate" className="text-cyan-300 hover:text-cyan-200">Get an estimate</a> or{" "}
        <a href="/#contact" className="text-cyan-300 hover:text-cyan-200">contact us</a>.
      </p>
    </div>
  );
}

// ───────────────────────── Dashboard ─────────────────────────

interface Data {
  alerts: AppAlert[];
  me: Me;
  services: ClientService[];
  estimates: Estimate[];
  invoices: Invoice[];
}

function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [me, services, estimates, invoices, alerts] = await Promise.all([
        getMe(),
        getServices(),
        getEstimates(),
        getInvoices(),
        getAlerts().catch(() => [] as AppAlert[]),
      ]);
      setData({ me, services, estimates, invoices, alerts });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your account.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pick up new alerts while the page is open: every minute, and when you come back to the tab.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  // "(2) Client login" in the browser tab when there's something new.
  const unread = data?.alerts.filter((a) => !a.read_at).length ?? 0;
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) /, "");
    document.title = unread ? `(${unread}) ${base}` : base;
  }, [unread]);

  if (error) {
    return (
      <div className={`${card} space-y-3`}>
        <p className="text-rose-300">{error}</p>
        <button className={btnSecondary} onClick={load}>Try again</button>
      </div>
    );
  }
  if (!data) return <p className="text-white/50">Loading your account…</p>;

  const { me, services, estimates, invoices, alerts } = data;
  const down = services.filter((s) => s.status === "down");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-white/50">{me.fullName ? `Hi, ${me.fullName.split(" ")[0]}` : "Welcome"}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{me.clientName ?? "Your account"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <AlertsButton alerts={alerts} onRead={load} />
          <button className={btnSecondary} onClick={() => signOut()}>Sign out</button>
        </div>
      </div>

      {down.length ? (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-400/50 bg-rose-500/10 p-4">
          <i className="fa-solid fa-circle-exclamation text-lg text-rose-300" aria-hidden />
          <p className="font-semibold text-white">
            {down.length === 1 ? `${down[0].name} is down.` : `${down.length} services are down.`} We&apos;re on it.
          </p>
        </div>
      ) : null}

      {!me.clientName ? (
        <p className={`${card} text-white/70`}>Your account isn&apos;t linked to a business yet. We&apos;ll connect it shortly.</p>
      ) : null}

      <section aria-labelledby="svc" className="space-y-3">
        <h2 id="svc" className="scroll-mt-28 text-xl font-bold text-white">Your services</h2>
        {services.length === 0 ? (
          <p className="text-white/50">Your services will show up here once we set them up.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {services.map((s) => (
              <li key={s.id} className={`${card} flex gap-4`}>
                <i className={`${SERVICE_ICON[s.kind]} mt-1 w-6 text-center text-lg text-cyan-300`} aria-hidden />
                <div className="space-y-1.5">
                  <p className="font-semibold text-white">{s.name}</p>
                  <Pill text={SERVICE_STATUS[s.status][0]} cls={SERVICE_STATUS[s.status][1]} />
                  {s.note ? <p className="text-sm text-white/55">{s.note}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="est" className="space-y-3">
        <h2 id="est" className="scroll-mt-28 text-xl font-bold text-white">Estimates</h2>
        {estimates.length === 0 ? (
          <p className="text-white/50">When we send you a quote, it shows up here for you to accept.</p>
        ) : (
          <ul className="space-y-3">
            {estimates.map((e) => (
              <EstimateCard key={e.id} estimate={e} onChange={load} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="inv" className="space-y-3">
        <h2 id="inv" className="scroll-mt-28 text-xl font-bold text-white">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-white/50">No invoices yet.</p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((i) => (
              <InvoiceCard key={i.id} invoice={i} />
            ))}
          </ul>
        )}
        <p className="text-sm text-white/40">Payments go through Stripe: Apple Pay, Google Pay or card.</p>
      </section>
    </div>
  );
}

// ───────────────────────── Alerts ─────────────────────────

function AlertsButton({ alerts, onRead }: { alerts: AppAlert[]; onRead: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const isUnread = (a: AppAlert) => !a.read_at && !seen.has(a.id);
  const count = alerts.filter(isUnread).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  function openAlert(a: AppAlert) {
    if (isUnread(a)) {
      setSeen((s) => new Set(s).add(a.id));
      markAlertsRead([a.id]).then(onRead, () => {});
    }
    const anchor = alertAnchor(a.url);
    if (anchor) {
      setOpen(false);
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`${btnSecondary} relative !px-4`}
        aria-label={count ? `Alerts, ${count} new` : "Alerts"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <i className="fa-solid fa-bell" aria-hidden />
        {count ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-[11px] font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Alerts"
            className="fixed inset-x-4 top-24 z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[22rem] rounded-2xl border border-white/10 bg-[#0d0a26]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-bold text-white">Alerts</p>
              {count ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                  onClick={() => {
                    setSeen(new Set(alerts.map((a) => a.id)));
                    markAlertsRead().then(onRead, () => {});
                  }}
                >
                  Mark all as read
                </button>
              ) : null}
            </div>
            {alerts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-white/50">
                No alerts yet. We&apos;ll let you know here when we send an estimate or invoice, or something needs your attention.
              </p>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto">
                {alerts.map((a) => {
                  const unread = isUnread(a);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => openAlert(a)}
                        className="flex w-full gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-purple-500" : "bg-transparent"}`} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm font-semibold ${unread ? "text-white" : "text-white/60"}`}>
                            {unread ? <span className="sr-only">New: </span> : null}
                            {a.title}
                          </span>
                          {a.body ? <span className="mt-0.5 block text-sm text-white/50">{a.body}</span> : null}
                          <span className="mt-1 block text-xs text-white/35">{timeAgo(a.created_at)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="px-4 py-3 text-xs text-white/40">Get these on your phone with the SohoSuccess app.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function EstimateCard({ estimate: e, onChange }: { estimate: Estimate; onChange: () => Promise<void> }) {
  const [open, setOpen] = useState(e.status === "sent");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = estimateTotal(e.items);
  const deposit = Math.round((total * e.deposit_percent) / 100);
  const [label_, cls] = ESTIMATE_STATUS[e.status];

  async function run(kind: string, fn: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <li className={card}>
      <button type="button" className="flex w-full items-start justify-between gap-4 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white/50">{e.number}</p>
          <p className="text-lg font-bold text-white">{e.title}</p>
          <Pill text={label_} cls={cls} />
        </div>
        <p className="text-xl font-extrabold text-white">{money(total)}</p>
      </button>

      {open ? (
        <div className="mt-5 space-y-4">
          {e.notes ? <p className="text-white/60">{e.notes}</p> : null}
          <table className="w-full text-sm">
            <tbody>
              {e.items.map((i) => (
                <tr key={i.id} className="border-b border-white/5">
                  <td className="py-2 pr-3 text-white">
                    {i.description}
                    <span className="block text-xs text-white/40">
                      {i.quantity} × {money(i.unit_cents)}
                    </span>
                  </td>
                  <td className="py-2 text-right font-semibold text-white">{money(Math.round(i.quantity * i.unit_cents))}</td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 text-base font-bold text-white">Total</td>
                <td className="pt-3 text-right text-lg font-extrabold text-white">{money(total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-white/45">
            {e.deposit_percent > 0
              ? `${e.deposit_percent}% deposit to start (${money(deposit)}), the rest (${money(total - deposit)}) when the work is done.`
              : "No deposit. You pay when the work is done."}
            {e.status === "sent" && e.valid_until ? ` Valid until ${shortDate(e.valid_until)}.` : ""}
          </p>
          {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}
          {e.status === "sent" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className={btnPrimary}
                disabled={!!busy}
                onClick={() => {
                  if (!window.confirm(`Accept this estimate? Total ${money(total)}.`)) return;
                  run("accept", async () => {
                    const invoiceId = await acceptEstimate(e.id);
                    if (invoiceId) await payInvoice({ id: invoiceId, pay_url: null }); // goes to Stripe
                    else {
                      await onChange();
                      setBusy(null);
                    }
                  });
                }}
              >
                {busy === "accept" ? "One moment…" : e.deposit_percent > 0 ? `Accept and pay ${money(deposit)} deposit` : "Accept estimate"}
              </button>
              <button
                className={btnSecondary}
                disabled={!!busy}
                onClick={() => {
                  if (!window.confirm("Decline this estimate?")) return;
                  run("decline", async () => {
                    await declineEstimate(e.id);
                    await onChange();
                    setBusy(null);
                  });
                }}
              >
                Decline
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function InvoiceCard({ invoice: i }: { invoice: Invoice }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, cls] = INVOICE_STATUS[i.status];
  const payable = i.status === "due" || i.status === "overdue";

  return (
    <li className={`${card} space-y-3`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white/50">
            {i.number}
            {i.kind === "deposit" ? " · Deposit" : i.kind === "final" ? " · Final payment" : ""}
          </p>
          <p className="text-white">{i.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Pill text={text} cls={cls} />
            {i.due_date ? <span className="text-xs text-white/40">{i.status === "paid" ? "Was due" : "Due"} {shortDate(i.due_date)}</span> : null}
          </div>
        </div>
        <p className="text-xl font-extrabold text-white">{money(i.amount_cents, i.currency)}</p>
      </div>
      {payable ? (
        <button
          className={`${btnPrimary} w-full sm:w-auto`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await payInvoice(i);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Couldn't start the payment.");
              setBusy(false);
            }
          }}
        >
          {busy ? "Opening secure payment…" : `Pay ${money(i.amount_cents, i.currency)}`}
        </button>
      ) : null}
      {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}
    </li>
  );
}
