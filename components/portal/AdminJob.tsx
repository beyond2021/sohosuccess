"use client";

// Staff: one accepted sale's job: offer times, start, finish. Same Supabase functions as the
// app's Admin → Job screen (job_by_ref, propose_times, start_job, finish_job).
import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BackBar, btnPrimary, btnSecondary, card, input, label } from "./Page";

type Job = {
  id: string;
  title: string;
  status: "scheduling" | "scheduled" | "in_progress" | "review" | "completed" | "cancelled";
  est_duration: string;
  proposed_slots: { start: string; end: string }[] | null;
  scheduled_start: string | null;
  client_note: string;
  client_id: string;
  estimate_id: string;
};

const STATUS: Record<Job["status"], string> = {
  scheduling: "Needs a time",
  scheduled: "Booked",
  in_progress: "Working",
  review: "Customer is checking the work",
  completed: "Completed",
  cancelled: "Cancelled",
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const slotLabel = (s: string) => {
  const [d, t] = s.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  return `${dayLabel(new Date(y, m - 1, day))} · ${hourLabel(Number(t.slice(0, 2)))}`;
};
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-semibold transition ${on ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/15 text-white/80 hover:bg-white/5"}`;

export default function AdminJob({ sb, jobRef, onClose, onOpenEstimate }: { sb: SupabaseClient; jobRef: string; onClose: () => void; onOpenEstimate: (id: string) => void }) {
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState("Customer");
  const [depositPaid, setDepositPaid] = useState(true);
  const [finalDue, setFinalDue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    for (let i = 1; out.length < 14; i++) {
      const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (x.getDay() !== 0) out.push(x); // no Sundays
    }
    return out;
  }, []);
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [hours, setHours] = useState("4");
  const [note, setNote] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: j, error: e } = await sb.rpc("job_by_ref", { p_ref: jobRef });
      if (!live) return;
      if (e || !j) return setError(e?.message ?? "Job not found.");
      const jj = j as Job;
      const [{ data: c }, { data: due }, { data: finalOpen }] = await Promise.all([
        sb.from("clients").select("name").eq("id", jj.client_id).maybeSingle(),
        sb.from("invoices").select("id").eq("estimate_id", jj.estimate_id).eq("kind", "deposit").in("status", ["due", "overdue"]),
        sb.from("invoices").select("id").eq("estimate_id", jj.estimate_id).eq("kind", "final").in("status", ["due", "overdue"]),
      ]);
      if (!live) return;
      setJob(jj);
      setClient((c as { name?: string } | null)?.name ?? "Customer");
      setDepositPaid(!(due ?? []).length);
      setFinalDue(!!(finalOpen ?? []).length);
      setError(null);
    })();
    return () => {
      live = false;
    };
  }, [sb, jobRef, tick]);

  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, done: string) {
    setBusy(true);
    setMsg(null);
    const { error: e } = await fn();
    setBusy(false);
    if (e) return setMsg({ ok: false, text: e.message });
    setMsg({ ok: true, text: done });
    setSlots([]);
    setDay(null);
    setRescheduling(false);
    setTick((t) => t + 1);
  }

  const back = (
    <BackBar>
      <button onClick={onClose} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
        ← All sales
      </button>
    </BackBar>
  );
  if (error) return <div className="space-y-4">{back}<p className="text-rose-300">{error}</p></div>;
  if (!job) return <div className="space-y-4">{back}<p className="text-white/50">Loading…</p></div>;

  const offered = job.proposed_slots ?? [];
  const canOffer = job.status === "scheduling" || (job.status === "scheduled" && rescheduling);
  const toggle = (h: number) => {
    if (!day) return;
    const s = `${day} ${pad(h)}:00`;
    setSlots((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s].sort()));
  };

  return (
    <div className="space-y-6">
      {back}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/50">{jobRef}</p>
          <h1 className="text-3xl font-extrabold text-white">{client}</h1>
          <p className="mt-1 text-white/70">{job.title}</p>
        </div>
        <span className="rounded-full border border-cyan-400/60 px-3 py-1 text-sm font-bold text-cyan-300">
          {/* "completed" in Supabase = the customer approved the work. It's only done once the final payment is in. */}
          {job.status === "completed" ? (finalDue ? "Approved · waiting for final payment" : "Paid in full") : STATUS[job.status]}
        </span>
      </div>
      <button onClick={() => onOpenEstimate(job.estimate_id)} className="text-sm font-semibold text-white/60 underline hover:text-white">
        View the estimate, photos and floor plan
      </button>

      {job.client_note ? (
        <section className={card}>
          <p className={label}>From the customer</p>
          <p className="whitespace-pre-wrap text-white/90">{job.client_note}</p>
        </section>
      ) : null}

      {job.scheduled_start ? (
        <section className={card}>
          <p className={label}>{job.status === "scheduled" ? "Booked" : "Job date"}</p>
          <p className="text-xl font-bold text-white">{when(job.scheduled_start)}</p>
          {job.est_duration ? <p className="text-sm text-white/50">{job.est_duration}</p> : null}
        </section>
      ) : offered.length ? (
        <section className={card}>
          <p className={label}>Times you offered</p>
          <ul className="space-y-1 text-white/90">
            {offered.map((s) => (
              <li key={s.start}>{when(s.start)}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-white/50">Waiting for the customer to pick one.</p>
        </section>
      ) : null}

      {canOffer ? (
        <section className={`${card} space-y-4`}>
          <p className="text-sm font-bold uppercase tracking-wide text-white/60">{offered.length || job.scheduled_start ? "Offer new times" : "Offer times"}</p>
          {!depositPaid ? <p className="text-sm text-white/70">The deposit isn&apos;t paid yet. The customer can pick a time once it is.</p> : null}
          <div>
            <p className={label}>1. Pick a day</p>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <button key={ymd(d)} className={chip(day === ymd(d))} onClick={() => setDay(ymd(d))}>
                  {dayLabel(d)}
                </button>
              ))}
            </div>
          </div>
          {day ? (
            <div>
              <p className={label}>2. Click start times (New York time)</p>
              <div className="flex flex-wrap gap-2">
                {HOURS.map((h) => (
                  <button key={h} className={chip(slots.includes(`${day} ${pad(h)}:00`))} onClick={() => toggle(h)}>
                    {hourLabel(h)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {slots.length ? (
            <div>
              <p className={label}>Times to send</p>
              <ul className="space-y-1">
                {slots.map((s) => (
                  <li key={s} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-white">
                    {slotLabel(s)}
                    <button className="text-sm text-white/50 hover:text-rose-300" onClick={() => setSlots((xs) => xs.filter((x) => x !== s))}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="max-w-[220px]">
            <label className={label} htmlFor="job-hours">How many hours on site</label>
            <input id="job-hours" className={input} inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <button
            className={btnPrimary}
            disabled={busy || !slots.length || !Number(hours)}
            onClick={() => run(() => sb.rpc("propose_times", { p_ref: jobRef, p_hours: Number(hours), p_starts: slots }), "Sent. The customer got an alert to pick a time.")}
          >
            {busy ? "Sending…" : slots.length ? `Send ${slots.length} time${slots.length > 1 ? "s" : ""} to ${client}` : "Pick at least one time"}
          </button>
        </section>
      ) : null}

      {job.status === "scheduled" && !rescheduling ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={btnPrimary}
            disabled={busy}
            onClick={() => window.confirm(`Start the job? ${client} gets a "We're on site" alert.`) && run(() => sb.rpc("start_job", { p_ref: jobRef }), "Started.")}
          >
            Start the job
          </button>
          <button className={btnSecondary} onClick={() => setRescheduling(true)}>
            Reschedule: offer new times
          </button>
        </div>
      ) : null}

      {job.status === "in_progress" ? (
        <section className={`${card} space-y-3`}>
          <p className="text-sm font-bold uppercase tracking-wide text-white/60">Finish the job</p>
          <textarea
            className={`${input} min-h-[110px]`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What you did, and anything the customer should check"
            aria-label="Note for the customer"
          />
          <button
            className={btnPrimary}
            disabled={busy}
            onClick={() => window.confirm(`Finish the job? ${client} gets an alert to check the work and approve it.`) && run(() => sb.rpc("finish_job", { p_ref: jobRef, p_note: note }), "Done. The customer was asked to approve.")}
          >
            Done: ask the customer to approve
          </button>
        </section>
      ) : null}

      {msg ? <p className={msg.ok ? "text-emerald-300" : "text-rose-300"}>{msg.text}</p> : null}
    </div>
  );
}
