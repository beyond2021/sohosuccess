"use client";

import { useEffect, useState } from "react";
import { btnPrimary, card } from "./Page";

/** Where Stripe sends people after paying (or cancelling). Reads the query string on the client. */
export default function PaidMessage() {
  const [q, setQ] = useState<{ invoice: string | null; cancelled: boolean; fromApp: boolean } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({ invoice: p.get("invoice"), cancelled: p.has("cancelled"), fromApp: p.get("from") === "app" });
  }, []);

  if (!q) return null;

  return (
    <div className={`${card} space-y-4 text-center`}>
      <i className={`fa-solid ${q.cancelled ? "fa-circle-xmark text-white/40" : "fa-circle-check text-emerald-400"} text-5xl`} aria-hidden />
      <h1 className="text-3xl font-extrabold text-white">{q.cancelled ? "Payment cancelled" : "Payment received"}</h1>
      <p className="text-white/60">
        {q.cancelled
          ? "No charge was made. You can pay any time from your account."
          : `Thank you${q.invoice ? `, invoice ${q.invoice} is paid` : ""}. A receipt is on its way to your email.`}
      </p>
      {q.fromApp ? (
        <p className="font-semibold text-white">You can close this page and go back to the SohoSuccess app.</p>
      ) : (
        <a href="/account" className={btnPrimary}>Back to my account</a>
      )}
    </div>
  );
}
