"use client";

// Staff page: every estimate customers send from the app or website, with their photos and room
// sizes, ready to price and send. Same Supabase project; row-level security only lets admins
// (profiles.is_admin = true) read and change these rows.
import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase";
import { money } from "@/lib/portal";
import { btnPrimary, btnSecondary, card, input, label } from "./Page";

type Status = "draft" | "sent" | "accepted" | "declined" | "expired";
type Item = { id?: string; description: string; quantity: number; unit_cents: number };
type Row = {
  id: string;
  number: string;
  title: string;
  status: Status;
  created_at: string;
  clients: { name: string } | null;
  estimate_items: { quantity: number; unit_cents: number }[];
};
type Pipeline = { ref: string; customer: string; title: string; stage: string; whose_turn: string; days: number; status: string };
type Photo = { path: string; kind: string; note: string; text?: string[]; outdoor?: boolean; sees?: string[] };
type Room = { name?: string; width_ft: number; length_ft: number; area_sqft: number; doors: number; windows: number; manual?: boolean };
type Request = {
  name: string;
  email: string;
  phone: string | null;
  business: string | null;
  notes: string;
  source: string;
  created_at: string;
  rooms: Room[];
  survey: {
    building?: { stories: number; ceiling: string | null };
    recorder?: { distance: string | null; nearRouter: string | null };
    photos?: Photo[];
  };
};

const STATUS: Record<Status, [string, string]> = {
  draft: ["Needs pricing", "text-fuchsia-300 border-fuchsia-400/40"],
  sent: ["Sent", "text-cyan-300 border-cyan-400/40"],
  accepted: ["Accepted", "text-emerald-300 border-emerald-400/40"],
  declined: ["Declined", "text-rose-300 border-rose-400/40"],
  expired: ["Expired", "text-white/40 border-white/15"],
};
const FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "draft", label: "Needs pricing" },
  { key: "sent", label: "Sent" },
  { key: "accepted", label: "Accepted" },
  { key: "all", label: "All" },
];
const PHOTO_KIND: Record<string, string> = {
  camera_spot: "Camera spot",
  recorder: "Recorder spot",
  network: "Network",
  label: "Equipment label",
};
const DISTANCE: Record<string, string> = { near: "Under 50 ft", mid: "50–150 ft", far: "Over 150 ft", unsure: "Not sure" };

const total = (items: { quantity: number; unit_cents: number }[]) =>
  items.reduce((s, i) => s + Math.round(Number(i.quantity) * i.unit_cents), 0);

function Pill({ status }: { status: Status }) {
  const [text, cls] = STATUS[status];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>● {text}</span>;
}

export default function AdminApp() {
  const sb = getAdminSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [adminCheck, setAdminCheck] = useState<{ uid: string; ok: boolean } | null>(null);
  const isAdmin = session && adminCheck?.uid === session.user.id ? adminCheck.ok : null;

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!sb || !session) return;
    const uid = session.user.id;
    sb.from("profiles")
      .select("is_admin")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data }) => setAdminCheck({ uid, ok: !!data?.is_admin }));
  }, [sb, session]);

  if (!sb) return <div className={card}><p className="text-white/70">Supabase isn&apos;t configured for this site yet.</p></div>;
  if (!ready) return <p className="text-white/50">Loading…</p>;
  if (!session) return <StaffSignIn sb={sb} />;
  if (isAdmin === null) return <p className="text-white/50">Checking your account…</p>;
  if (!isAdmin) {
    return (
      <NotAdmin sb={sb} email={session.user.email ?? ""} />
    );
  }
  return <Admin sb={sb} email={session.user.email ?? ""} />;
}

/** Staff sign in: email and password, or an emailed code. There is no sign-up here: admins are added by an admin. */
function StaffSignIn({ sb }: { sb: SupabaseClient }) {
  const [mode, setMode] = useState<"signin" | "code">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
          <i className="fa-solid fa-user-shield" aria-hidden />
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-white">
          {mode === "code" ? "Check your email" : "Admin sign in"}
        </h1>
        <p className="mt-2 text-white/60">
          {mode === "code" ? `Enter the code we sent to ${email.trim()}.` : "SohoSuccess staff only."}
        </p>
      </div>

      <form
        className={`${card} space-y-4`}
        onSubmit={(e) => {
          e.preventDefault();
          const em = email.trim().toLowerCase();
          if (mode === "code") {
            return run(async () => {
              let { error } = await sb.auth.verifyOtp({ email: em, token: code.trim(), type: "email" });
              if (error) ({ error } = await sb.auth.verifyOtp({ email: em, token: code.trim(), type: "signup" }));
              if (error) throw new Error("That code didn't work. Check it, or send a new one.");
            });
          }
          if (!emailOk) return setError("Enter a valid email address.");
          run(async () => {
            const { error } = await sb.auth.signInWithPassword({ email: em, password });
            if (error) throw new Error("Email or password is wrong. Forgot it? Email me a code.");
          });
        }}
      >
        {mode === "code" ? (
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="123456"
            className={`${input} text-center text-2xl font-bold tracking-[0.35em]`}
          />
        ) : (
          <>
            <div>
              <label htmlFor="semail" className={label}>Email</label>
              <input id="semail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="spw" className={label}>Password</label>
              <input
                id="spw"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
            </div>
          </>
        )}

        {error ? <p className="text-sm font-semibold text-rose-300">{error}</p> : null}
        {notice && !error ? <p className="text-sm text-white/60">{notice}</p> : null}

        <button type="submit" className={`${btnPrimary} w-full`} disabled={busy || (mode === "code" && code.length < 6)}>
          {busy ? "One moment…" : "Sign in"}
        </button>

        <div className="flex flex-col items-center gap-2 text-center text-sm">
          {mode === "signin" ? (
            <>
              <button
                type="button"
                className="font-semibold text-cyan-300 hover:text-cyan-200"
                onClick={() => {
                  if (!emailOk) return setError("Enter your email first.");
                  run(async () => {
                    const { error } = await sb.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false } });
                    if (error) throw new Error(/not found|signups not allowed/i.test(error.message) ? "No account with that email." : error.message);
                    setCode("");
                    setNotice(null);
                    setMode("code");
                  });
                }}
              >
                Forgot password? Email me a code
              </button>
            </>
          ) : (
            <button type="button" className="text-white/60 hover:text-white" onClick={() => { setMode("signin"); setError(null); }}>
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Signed in to the admin area with an account that isn't an admin. */
function NotAdmin({ sb, email }: { sb: SupabaseClient; email: string }) {
  return (
    <div className={card}>
      <h1 className="text-xl font-bold text-white">{email} isn&apos;t an admin account</h1>
      <p className="mt-2 text-white/60">Sign out and use your admin account, or ask an admin to add this email under Team.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={btnSecondary} onClick={() => sb.auth.signOut()}>Sign out</button>
      </div>
    </div>
  );
}

/** Who can use this page. Adding an email makes that account admin (now, or when they sign up). */
function Team({ sb, me }: { sb: SupabaseClient; me: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [add, setAdd] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    sb.from("admin_emails")
      .select("email")
      .order("email")
      .then(({ data }) => live && setEmails((data ?? []).map((r: { email: string }) => r.email)));
    return () => {
      live = false;
    };
  }, [sb, tick]);

  return (
    <div className={`${card} space-y-4`}>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">Team</h2>
        <p className="mt-1 text-sm text-white/50">Only these emails can use this page. Customers can never sign up as admin.</p>
      </div>
      <ul className="divide-y divide-white/10">
        {emails.map((e) => (
          <li key={e} className="flex items-center justify-between gap-3 py-2 text-sm text-white">
            <span>{e}{e === me.toLowerCase() ? <span className="text-white/40"> (you)</span> : null}</span>
            {e !== me.toLowerCase() ? (
              <button
                className="text-sm font-semibold text-rose-300 hover:text-rose-200"
                onClick={async () => {
                  const { error } = await sb.from("admin_emails").delete().eq("email", e);
                  setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `${e} is no longer an admin.` });
                  setTick((t) => t + 1);
                }}
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (ev) => {
          ev.preventDefault();
          const e = add.trim().toLowerCase();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return setMsg({ ok: false, text: "Enter a valid email." });
          const { error } = await sb.from("admin_emails").insert({ email: e });
          setMsg(error ? { ok: false, text: /duplicate/i.test(error.message) ? "Already on the team." : error.message }
            : { ok: true, text: `Added. ${e} is admin now, or as soon as they sign up and confirm the email.` });
          setAdd("");
          setTick((t) => t + 1);
        }}
      >
        <input className={`${input} min-w-0 flex-1`} type="email" placeholder="name@example.com" value={add} onChange={(e) => setAdd(e.target.value)} aria-label="Email to add" />
        <button type="submit" className={btnSecondary}>Add admin</button>
      </form>
      {msg ? <p className={`text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</p> : null}
    </div>
  );
}

// ───────────────────────── List ─────────────────────────

function Admin({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [filter, setFilter] = useState<Status | "all">("draft");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const load = () => setTick((t) => t + 1);

  useEffect(() => {
    let live = true;
    let q = sb
      .from("estimates")
      .select("id, number, title, status, created_at, clients(name), estimate_items(quantity, unit_cents)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    Promise.all([q, sb.rpc("sales_pipeline")]).then(([{ data, error: e1 }, { data: p }]) => {
      if (!live) return;
      setError(e1 ? e1.message : null);
      setRows((data ?? []) as unknown as Row[]);
      setPipeline((p ?? []) as Pipeline[]);
    });
    return () => {
      live = false;
    };
  }, [sb, filter, tick]);

  if (open) {
    return (
      <EstimateEditor
        sb={sb}
        id={open}
        onClose={() => {
          setOpen(null);
          load();
        }}
      />
    );
  }

  const yourTurn = pipeline.filter((p) => p.whose_turn === "you");
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Estimates</h1>
          <p className="mt-1 text-sm text-white/50">Signed in as {email}</p>
        </div>
        <button className={btnSecondary} onClick={() => sb.auth.signOut()}>Sign out</button>
      </div>

      {yourTurn.length ? (
        <div className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">Waiting on you</h2>
          <ul className="mt-3 divide-y divide-white/10">
            {yourTurn.map((p) => (
              <li key={p.ref} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="text-white">
                  <b>{p.customer}</b> · {p.title}
                </span>
                <span className="text-white/50">
                  {p.status} · {p.days} {p.days === 1 ? "day" : "days"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-rose-300">{error}</p> : null}
      {!rows ? (
        <p className="text-white/50">Loading…</p>
      ) : rows.length === 0 ? (
        <div className={card}>
          <p className="text-white/60">Nothing here. New requests from the app show up under “Needs pricing”.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <button onClick={() => setOpen(r.id)} className={`${card} block w-full text-left transition hover:bg-white/[0.07]`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white/40">
                    {r.number} · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <Pill status={r.status} />
                </div>
                <p className="mt-2 font-bold text-white">{r.clients?.name ?? "Customer"}</p>
                <p className="text-sm text-white/60">{r.title}</p>
                <p className="mt-2 text-lg font-extrabold text-white">{money(total(r.estimate_items))}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Team sb={sb} me={email} />
    </div>
  );
}

// ───────────────────────── One estimate ─────────────────────────

function EstimateEditor({ sb, id, onClose }: { sb: SupabaseClient; id: string; onClose: () => void }) {
  const [est, setEst] = useState<{
    number: string;
    title: string;
    notes: string;
    status: Status;
    deposit_percent: number;
    valid_until: string | null;
    est_duration: string;
    clients: { name: string } | null;
  } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [req, setReq] = useState<Request | null>(null);
  const [photos, setPhotos] = useState<(Photo & { url: string | null })[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: e }, { data: its }, { data: r }] = await Promise.all([
        sb.from("estimates").select("number, title, notes, status, deposit_percent, valid_until, est_duration, clients(name)").eq("id", id).single(),
        sb.from("estimate_items").select("id, description, quantity, unit_cents").eq("estimate_id", id).order("sort_order"),
        sb.from("estimate_requests").select("name, email, phone, business, notes, source, created_at, rooms, survey").eq("estimate_id", id).maybeSingle(),
      ]);
      setEst(e as never);
      setItems(((its ?? []) as Item[]).map((i) => ({ ...i, quantity: Number(i.quantity) })));
      setReq(r as Request | null);
      const ps = ((r as Request | null)?.survey?.photos ?? []).filter((p) => p.path);
      if (ps.length) {
        const { data: urls } = await sb.storage.from("site-photos").createSignedUrls(ps.map((p) => p.path), 3600);
        setPhotos(ps.map((p, i) => ({ ...p, url: urls?.[i]?.signedUrl ?? null })));
      }
    })();
  }, [sb, id]);

  if (!est) return <p className="text-white/50">Loading…</p>;
  const editable = est.status === "draft" || est.status === "sent";
  const sum = total(items);
  const deposit = Math.round((sum * est.deposit_percent) / 100);

  const setItem = (i: number, patch: Partial<Item>) => setItems((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function save(send: boolean) {
    setBusy(true);
    setMsg(null);
    try {
      const clean = items.filter((i) => i.description.trim() && i.quantity > 0);
      if (send && !clean.length) throw new Error("Add at least one line before sending.");
      const { error: e1 } = await sb
        .from("estimates")
        .update({
          title: est!.title,
          notes: est!.notes,
          deposit_percent: est!.deposit_percent,
          valid_until: est!.valid_until || null,
          est_duration: est!.est_duration,
        })
        .eq("id", id);
      if (e1) throw e1;
      // Replace the lines with what's on screen.
      const { error: e2 } = await sb.from("estimate_items").delete().eq("estimate_id", id);
      if (e2) throw e2;
      if (clean.length) {
        const { error: e3 } = await sb.from("estimate_items").insert(
          clean.map((i, n) => ({ estimate_id: id, description: i.description.trim(), quantity: i.quantity, unit_cents: i.unit_cents, sort_order: n + 1 })),
        );
        if (e3) throw e3;
      }
      if (send && est!.status === "draft") {
        const { error: e4 } = await sb.from("estimates").update({ status: "sent" }).eq("id", id);
        if (e4) throw e4;
        setEst({ ...est!, status: "sent" });
        setMsg({ ok: true, text: "Sent. The customer got an alert and an email: “New estimate ready”." });
      } else {
        setMsg({ ok: true, text: "Saved." });
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't save." });
    } finally {
      setBusy(false);
    }
  }

  const b = req?.survey?.building;
  const rec = req?.survey?.recorder;
  return (
    <div className="space-y-6">
      <button onClick={onClose} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">← All estimates</button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-white/40">{est.number}</p>
          <h1 className="text-2xl font-extrabold text-white">{est.clients?.name ?? "Customer"}</h1>
        </div>
        <Pill status={est.status} />
      </div>

      {/* What the customer sent */}
      {req ? (
        <div className={`${card} space-y-4`}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">What they sent</h2>
          <div className="grid gap-1 text-sm text-white/80 sm:grid-cols-2">
            <p><b className="text-white">{req.name}</b>{req.business ? ` · ${req.business}` : ""}</p>
            <p><a className="text-cyan-300" href={`mailto:${req.email}`}>{req.email}</a>{req.phone ? <> · <a className="text-cyan-300" href={`tel:${req.phone}`}>{req.phone}</a></> : null}</p>
            <p className="text-white/50">From the {req.source === "web" ? "website" : "app"}, {new Date(req.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          {req.notes ? <p className="whitespace-pre-line rounded-xl bg-white/5 p-3 text-sm text-white/80">{req.notes}</p> : null}

          {b || rec ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {b ? <Tag>{b.stories} {b.stories === 1 ? "floor" : "floors"}</Tag> : null}
              {b?.ceiling ? <Tag>Ceiling: {b.ceiling}</Tag> : null}
              {rec?.distance ? <Tag>Recorder to farthest camera: {DISTANCE[rec.distance] ?? rec.distance}</Tag> : null}
              {rec?.nearRouter ? <Tag>Router at recorder: {rec.nearRouter}</Tag> : null}
            </div>
          ) : null}

          {req.rooms?.length ? (
            <div>
              <p className={label}>Rooms ({req.rooms.reduce((s, r) => s + r.area_sqft, 0).toLocaleString()} sq ft)</p>
              <ul className="space-y-1 text-sm text-white/80">
                {req.rooms.map((r, i) => (
                  <li key={i}>
                    {r.name || `Room ${i + 1}`}: {r.width_ft} × {r.length_ft} ft · {r.area_sqft} sq ft
                    {r.doors ? ` · ${r.doors} doors` : ""}
                    {r.windows ? ` · ${r.windows} windows` : ""}
                    {r.manual ? " (typed)" : " (scanned)"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {photos.length ? (
            <div>
              <p className={label}>Photos ({photos.length})</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p, i) => (
                  <figure key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs, already sized by the app */}
                        <img src={p.url} alt={PHOTO_KIND[p.kind] ?? p.kind} className="aspect-square w-full object-cover" />
                      </a>
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-xs text-white/40">No preview</div>
                    )}
                    <figcaption className="space-y-0.5 p-2 text-xs text-white/70">
                      <p className="font-bold text-white">
                        {PHOTO_KIND[p.kind] ?? p.kind}
                        {p.kind === "camera_spot" ? (p.outdoor ? " · outside" : " · inside") : ""}
                      </p>
                      {p.sees?.length ? <p>Sees: {p.sees.join(", ")}</p> : null}
                      {p.note ? <p>{p.note}</p> : null}
                      {p.text?.length ? <p className="text-white/50">Label: {p.text.slice(0, 4).join(" · ")}</p> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* The quote */}
      <div className={`${card} space-y-4`}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/60">The quote</h2>
        <div>
          <label className={label} htmlFor="title">Title</label>
          <input id="title" className={input} value={est.title} disabled={!editable} onChange={(e) => setEst({ ...est, title: e.target.value })} />
        </div>

        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_70px_110px_90px_28px] gap-2 text-xs font-bold text-white/50 sm:grid">
            <span>Line</span><span>Qty</span><span>Price each</span><span className="text-right">Amount</span><span />
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_110px] gap-2 sm:grid-cols-[1fr_70px_110px_90px_28px] sm:items-center">
              <input className={`${input} col-span-3 sm:col-span-1`} value={it.description} disabled={!editable} aria-label="Line"
                onChange={(e) => setItem(i, { description: e.target.value })} />
              <input className={input} type="number" min={0} step="1" value={it.quantity} disabled={!editable} aria-label="Quantity"
                onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} />
              <input className={input} type="number" min={0} step="1" value={it.unit_cents / 100} disabled={!editable} aria-label="Price each in dollars"
                onChange={(e) => setItem(i, { unit_cents: Math.round(Number(e.target.value) * 100) })} />
              <span className="text-right text-sm font-semibold text-white">{money(Math.round(it.quantity * it.unit_cents))}</span>
              {editable ? (
                <button aria-label="Remove line" className="text-white/40 hover:text-rose-300" onClick={() => setItems((all) => all.filter((_, j) => j !== i))}>✕</button>
              ) : <span />}
            </div>
          ))}
          {editable ? (
            <button className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              onClick={() => setItems((all) => [...all, { description: "", quantity: 1, unit_cents: 0 }])}>
              + Add a line
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/10 pt-3">
          <span className="text-white/70">Total · {est.deposit_percent}% deposit {money(deposit)}</span>
          <span className="text-2xl font-extrabold text-white">{money(sum)}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="dep">Deposit %</label>
            <input id="dep" className={input} type="number" min={0} max={100} value={est.deposit_percent} disabled={!editable}
              onChange={(e) => setEst({ ...est, deposit_percent: Math.max(0, Math.min(100, Number(e.target.value))) })} />
          </div>
          <div>
            <label className={label} htmlFor="valid">Valid until</label>
            <input id="valid" className={input} type="date" value={est.valid_until ?? ""} disabled={!editable}
              onChange={(e) => setEst({ ...est, valid_until: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="dur">How long the job takes</label>
            <input id="dur" className={input} placeholder="About 1 day on site" value={est.est_duration ?? ""} disabled={!editable}
              onChange={(e) => setEst({ ...est, est_duration: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="notes">Notes for the customer</label>
          <textarea id="notes" rows={4} className={input} value={est.notes} disabled={!editable} onChange={(e) => setEst({ ...est, notes: e.target.value })} />
        </div>

        {msg ? <p className={msg.ok ? "text-emerald-300" : "text-rose-300"}>{msg.text}</p> : null}
        {editable ? (
          <div className="flex flex-wrap gap-3">
            {est.status === "draft" ? (
              <button className={btnPrimary} disabled={busy} onClick={() => save(true)}>Send to customer</button>
            ) : null}
            <button className={btnSecondary} disabled={busy} onClick={() => save(false)}>{est.status === "draft" ? "Save draft" : "Save changes"}</button>
          </div>
        ) : (
          <p className="text-sm text-white/50">This estimate is {est.status}, so it can&apos;t be changed here.</p>
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">{children}</span>;
}
