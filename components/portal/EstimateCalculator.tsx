"use client";

import { useEffect, useMemo, useState } from "react";
import { getMe, getPriceList, range, sendEstimateRequest, type PriceItem, type ServiceKind } from "@/lib/portal";
import { getSupabase } from "@/lib/supabase";
import { btnPrimary, btnSecondary, card, input, label } from "./Page";

const ICON: Record<ServiceKind, string> = {
  network: "fa-solid fa-wifi",
  cameras: "fa-solid fa-video",
  website: "fa-solid fa-globe",
  app: "fa-solid fa-mobile-screen",
  other: "fa-solid fa-screwdriver-wrench",
};
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// On-site work (Wi-Fi, cabling, cameras) is Manhattan only. Supabase checks this too.
const isManhattanZip = (z: string) => /^10[0-2]\d\d$/.test(z.trim()) && Number(z.trim()) >= 10001;

export default function EstimateCalculator() {
  const [prices, setPrices] = useState<PriceItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"pick" | "details" | "sent">("pick");
  const [form, setForm] = useState({ name: "", email: "", phone: "", business: "", notes: "", street: "", unit: "", zip: "" });
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signedIn, setSignedIn] = useState(false);

  // Signed in: fill in what we already know.
  useEffect(() => {
    getSupabase()
      ?.auth.getSession()
      .then(({ data }) => {
        if (!data.session) return;
        setSignedIn(true);
        return getMe().then((me) =>
          setForm((f) => ({
            ...f,
            name: f.name || me.fullName,
            email: f.email || me.email,
            business: f.business || me.businessName || me.clientName || "",
          })),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getPriceList()
      .then(setPrices)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Couldn't load prices."));
  }, []);

  const chosen = useMemo(() => (prices ?? []).filter((p) => (qty[p.key] ?? 0) > 0).map((p) => ({ p, n: qty[p.key] })), [prices, qty]);
  const low = chosen.reduce((s, { p, n }) => s + p.low_cents * n, 0);
  const high = chosen.reduce((s, { p, n }) => s + p.high_cents * n, 0);
  const set = (p: PriceItem, n: number) => setQty((q) => ({ ...q, [p.key]: Math.max(0, Math.min(p.max_qty, n)) }));

  const onSite = chosen.some(({ p }) => p.category === "network" || p.category === "cameras");
  const errors = {
    name: form.name.trim() ? null : "Please enter your name.",
    email: EMAIL.test(form.email.trim()) ? null : "Enter a valid email address.",
    addr: !onSite
      ? null
      : !form.street.trim()
        ? "Please add the address where we'll do the work."
        : !/^\d{5}$/.test(form.zip.trim())
          ? "Please add the 5-digit ZIP code."
          : !isManhattanZip(form.zip)
            ? "We only do on-site work in Manhattan right now. Please use a Manhattan ZIP (10001–10299)."
            : null,
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (errors.name || errors.email || errors.addr) return;
    setSending(true);
    setError(null);
    try {
      await sendEstimateRequest({
        name: form.name,
        email: form.email,
        phone: form.phone,
        business: form.business,
        notes: form.notes,
        siteAddress: onSite ? [form.street.trim(), form.unit.trim(), "New York, NY"].filter(Boolean).join(", ") : undefined,
        siteZip: onSite ? form.zip.trim() : undefined,
        items: chosen.map(({ p, n }) => ({ key: p.key, label: p.label, qty: n, low_cents: p.low_cents, high_cents: p.high_cents })),
      });
      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your request.");
    } finally {
      setSending(false);
    }
  }

  if (loadError) return <p className="text-rose-300">{loadError}</p>;
  if (!prices) return <p className="text-white/50">Loading prices…</p>;

  if (step === "sent") {
    return (
      <div className={`${card} text-center`}>
        <i className="fa-solid fa-circle-check text-4xl text-emerald-400" aria-hidden />
        <h2 className="mt-3 text-2xl font-bold text-white">Request sent</h2>
        <p className="mt-2 text-white/60">
          Thanks, {form.name.trim().split(" ")[0]}. We&apos;ll look at your site and email you a firm quote, usually within one business day.
        </p>
        {signedIn ? (
          <a href="/account" className={`${btnPrimary} mt-6`}>Track it in your account</a>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-white/55">Create a free account to follow this request and get an alert when your quote is ready.</p>
            <a href="/account?mode=signup" className={btnPrimary}>Create an account</a>
          </div>
        )}
      </div>
    );
  }

  const total = (
    <div className={card}>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Your estimate</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{chosen.length ? range(low, high) : "$0"}</p>
      <p className="mt-2 text-sm text-white/45">
        A rough range, not a quote. Your final price depends on your space and setup. We&apos;ll confirm it after a quick look.
      </p>
    </div>
  );

  if (step === "details") {
    return (
      <form onSubmit={send} className="space-y-5" noValidate>
        {total}
        <ul className="space-y-1 text-sm text-white/60">
          {chosen.map(({ p, n }) => (
            <li key={p.key}>
              {n > 1 ? `${n} × ` : ""}
              {p.label}
            </li>
          ))}
        </ul>
        {(
          [
            ["name", "Your name", "Jane Smith", "name", "text"],
            ["email", "Email", "jane@yourbusiness.com", "email", "email"],
            ["phone", "Phone (optional)", "(212) 555-0123", "tel", "tel"],
            ["business", "Business name (optional)", "Corner Bakery", "organization", "text"],
          ] as const
        ).map(([key, text, placeholder, autoComplete, type]) => (
          <div key={key}>
            <label htmlFor={`est-${key}`} className={label}>
              {text}
            </label>
            <input
              id={`est-${key}`}
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={input}
            />
            {touched && (key === "name" || key === "email") && errors[key] ? (
              <p className="mt-1 text-sm font-semibold text-rose-300">{errors[key]}</p>
            ) : null}
          </div>
        ))}
        {onSite ? (
          <div className="grid gap-3">
            <p className="text-sm text-white/60">
              <i className="fa-solid fa-location-dot mr-2 text-cyan-300" aria-hidden />
              We do on-site work in Manhattan, NYC.
            </p>
            <div>
              <label htmlFor="est-street" className={label}>
                Site address
              </label>
              <input id="est-street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="350 5th Ave" autoComplete="address-line1" className={input} />
            </div>
            <div className="grid grid-cols-[1fr_8rem] gap-3">
              <div>
                <label htmlFor="est-unit" className={label}>
                  Floor / suite (optional)
                </label>
                <input id="est-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Fl 12" autoComplete="address-line2" className={input} />
              </div>
              <div>
                <label htmlFor="est-zip" className={label}>
                  ZIP
                </label>
                <input id="est-zip" inputMode="numeric" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value.replace(/\D/g, "").slice(0, 5) })} placeholder="10001" autoComplete="postal-code" className={input} />
              </div>
            </div>
            {touched && errors.addr ? <p className="text-sm font-semibold text-rose-300">{errors.addr}</p> : null}
          </div>
        ) : null}
        <div>
          <label htmlFor="est-notes" className={label}>
            Anything we should know? (optional)
          </label>
          <textarea
            id="est-notes"
            rows={4}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Size of the space, timing, what you have now…"
            className={input}
          />
        </div>
        {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className={btnPrimary} disabled={sending}>
            {sending ? "Sending…" : "Send for a quote"}
          </button>
          <button type="button" className={btnSecondary} onClick={() => setStep("pick")}>
            Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-3">
        {prices.map((p) => {
          const n = qty[p.key] ?? 0;
          return (
            <li key={p.key} className={`${card} flex items-center gap-4`}>
              <i className={`${ICON[p.category]} w-6 text-center text-lg text-cyan-300`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{p.label}</p>
                <p className="text-sm text-white/45">
                  {range(p.low_cents, p.high_cents)} {p.unit}
                </p>
              </div>
              {p.max_qty === 1 ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={n > 0}
                    onChange={(e) => set(p, e.target.checked ? 1 : 0)}
                    className="h-5 w-5 accent-purple-500"
                    aria-label={p.label}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set(p, n - 1)}
                    disabled={n === 0}
                    aria-label={`Fewer: ${p.label}`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white disabled:opacity-30"
                  >
                    <i className="fa-solid fa-minus text-xs" aria-hidden />
                  </button>
                  <span className="w-6 text-center text-lg font-bold text-white" aria-live="polite">
                    {n}
                  </span>
                  <button
                    type="button"
                    onClick={() => set(p, n + 1)}
                    disabled={n >= p.max_qty}
                    aria-label={`More: ${p.label}`}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white disabled:opacity-30"
                  >
                    <i className="fa-solid fa-plus text-xs" aria-hidden />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-4 space-y-3">
        {total}
        <button type="button" className={`${btnPrimary} w-full`} disabled={chosen.length === 0} onClick={() => setStep("details")}>
          Get my exact quote
        </button>
      </div>
    </div>
  );
}
