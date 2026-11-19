"use client";

// Staff page: every estimate customers send from the app or website, with their photos and room
// sizes, ready to price and send. Same Supabase project; row-level security only lets admins
// (profiles.is_admin = true) read and change these rows.
import { useEffect, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase";
import { money } from "@/lib/portal";
import { btnPrimary, btnSecondary, card, input, label } from "./Page";

type Status = "draft" | "sent" | "accepted" | "declined" | "expired";
type Item = { id?: string; description: string; quantity: number; unit_cents: number };

/** Service type → label (Supabase sets estimates.service). */
const SERVICE_LABEL: Record<string, string> = {
  cameras: "Security cameras",
  internet: "Office internet",
  website: "Website",
  app: "App",
  intercom: "Entry & intercom",
  pos: "Restaurant POS",
  media: "Media room",
  other: "Other",
};
const serviceLabel = (s: string | null | undefined) => (s ? SERVICE_LABEL[s] ?? s : "Other");
/** One sale on the live board (Supabase table sales_board, updated by Supabase, sent live by Realtime). */
type BoardRow = {
  ref: string;
  customer: string;
  email: string | null;
  service: string | null;
  title: string;
  step: number;
  stage: string;
  whose_turn: "customer" | "you" | "-";
  headline: string;
  detail: string | null;
  action: string | null;
  amount_cents: number | null;
  since: string | null;
  updated_at: string | null;
  estimate_id: string | null;
};
/** Every stage a sale moves through, in order (Supabase sale_rows sets sales_board.stage). */
const STAGES: { key: string; label: string; who: "you" | "customer" | "-" }[] = [
  { key: "request", label: "Request", who: "you" },
  { key: "quote", label: "Quote", who: "customer" },
  { key: "deposit", label: "Deposit", who: "customer" },
  { key: "times_pending", label: "Find times", who: "you" },
  { key: "pick_time", label: "Pick time", who: "customer" },
  { key: "booked", label: "Booked", who: "you" },
  { key: "working", label: "Working", who: "you" },
  { key: "approve", label: "Approve", who: "customer" },
  { key: "final", label: "Final pay", who: "customer" },
  { key: "review", label: "Review", who: "customer" },
  { key: "done", label: "Done", who: "-" },
];
const stageIndex = (stage: string) => STAGES.findIndex((s) => s.key === stage);
const stageLabel = (stage: string) => STAGES[stageIndex(stage)]?.label ?? stage;
type SortKey = "ref" | "customer" | "service" | "stage" | "turn" | "amount" | "days" | "updated";
const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
const BOARD_FILTERS = [
  { key: "pricing", label: "Needs pricing" },
  { key: "you", label: "Your turn" },
  { key: "customer", label: "Customer's turn" },
  { key: "open", label: "All open" },
  { key: "done", label: "Done" },
] as const;
type BoardFilter = (typeof BOARD_FILTERS)[number]["key"];
// Every list comes from the same place: the board Supabase keeps (sales_board).
const inBoard = (r: BoardRow, k: BoardFilter) =>
  k === "pricing" ? r.stage === "request" : k === "done" ? r.stage === "done" : k === "open" ? r.stage !== "done" : r.whose_turn === k && r.stage !== "done";
const TURN_STYLE: Record<BoardRow["whose_turn"], [string, string]> = {
  you: ["Your turn", "text-cyan-300 border-cyan-400/50"],
  customer: ["Customer", "text-violet-300 border-violet-400/50"],
  "-": ["Done", "text-emerald-300 border-emerald-400/50"],
};
const daysSince = (iso: string | null) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0);
type Photo = { path: string; kind: string; note: string; text?: string[]; outdoor?: boolean; sees?: string[] };
type Room = { name?: string; width_ft: number; length_ft: number; area_sqft: number; doors: number; windows: number; manual?: boolean };
type Request = {
  name: string;
  email: string;
  phone: string | null;
  site_address?: string | null;
  site_zip?: string | null;
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
  const [sales, setSales] = useState<BoardRow[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const load = () => setTick((t) => t + 1);

  useEffect(() => {
    let live = true;
    sb.from("sales_board").select("*").order("since", { ascending: false }).then(({ data, error: e }) => {
      if (!live) return;
      setError(e ? e.message : null);
      setSales((data ?? []) as BoardRow[]);
    });
    return () => {
      live = false;
    };
  }, [sb, tick]);

  // Live: Supabase Realtime tells us when any sale changes, and we reload.
  useEffect(() => {
    const ch = sb
      .channel(`sales-board-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales_board" }, () => setTick((t) => t + 1))
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [sb]);

  if (open) {
    return (
      <div className="mx-auto max-w-3xl">
      <EstimateEditor
        sb={sb}
        id={open}
        onClose={() => {
          setOpen(null);
          load();
        }}
      />
      </div>
    );
  }

  // Open a board row: its estimate (a request gets its draft estimate made first).
  async function openSale(r: BoardRow) {
    if (r.estimate_id) return setOpen(r.estimate_id);
    const { data, error: e } = await sb.rpc("admin_open_ref", { p_ref: r.ref });
    if (e || !data) return setError(e?.message ?? `Couldn't open ${r.ref}.`);
    setOpen(data as string);
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Estimates</h1>
          <p className="mt-1 text-sm text-white/50">Signed in as {email}</p>
        </div>
        <button className={btnSecondary} onClick={() => sb.auth.signOut()}>Sign out</button>
      </div>

      <SalesSheet sales={sales} onOpen={openSale} />

      {error ? <p className="text-rose-300">{error}</p> : null}

      <Team sb={sb} me={email} />
    </div>
  );
}

// ───────────────────────── Sales spreadsheet ─────────────────────────

/** A spreadsheet column name you can click to sort by. */
function Th({ k, sort, onSort, children, right, extra = "" }: {
  k: SortKey;
  sort: { key: SortKey; desc: boolean };
  onSort: (k: SortKey) => void;
  children: ReactNode;
  right?: boolean;
  extra?: string;
}) {
  return (
    <th className={`whitespace-nowrap border-b border-white/10 px-3 py-2 font-semibold ${right ? "text-right" : ""} ${extra}`}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-white ${sort.key === k ? "text-white" : ""}`}
      >
        {children}
        <span aria-hidden className="text-[10px]">{sort.key === k ? (sort.desc ? "▼" : "▲") : ""}</span>
      </button>
    </th>
  );
}

/** Every sale as one row, every stage as a column: ✓ done, ● where it is now, blank still to come. */
function SalesSheet({ sales, onOpen }: { sales: BoardRow[] | null; onOpen: (r: BoardRow) => void }) {
  const [filter, setFilter] = useState<BoardFilter>("open");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "updated", desc: true });
  const onSort = (k: SortKey) => setSort((s) => ({ key: k, desc: s.key === k ? !s.desc : k === "updated" || k === "amount" || k === "days" }));

  const q = search.trim().toLowerCase();
  const value = (r: BoardRow, k: SortKey): string | number =>
    k === "ref" ? r.ref
    : k === "customer" ? (r.customer || "").toLowerCase()
    : k === "service" ? serviceLabel(r.service)
    : k === "stage" ? stageIndex(r.stage)
    : k === "turn" ? r.whose_turn
    : k === "amount" ? r.amount_cents ?? 0
    : k === "days" ? daysSince(r.since)
    : r.updated_at ?? "";
  const rows = (sales ?? [])
    .filter((r) => inBoard(r, filter))
    .filter((r) => !q || [r.ref, r.customer, r.email, serviceLabel(r.service), stageLabel(r.stage), r.headline].some((v) => (v ?? "").toLowerCase().includes(q)))
    .sort((x, y) => {
      const a = value(x, sort.key), b = value(y, sort.key);
      const c = a < b ? -1 : a > b ? 1 : 0;
      return sort.desc ? -c : c;
    });

  function downloadCsv() {
    const head = ["Ref", "Customer", "Email", "Service", "Stage", "Step", "Whose turn", "Next step", "Detail", "Amount", "Days in stage", "Last change"];
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [r.ref, r.customer, r.email, serviceLabel(r.service), stageLabel(r.stage), r.step, TURN_STYLE[r.whose_turn][0], r.headline, r.detail,
        r.amount_cents ? (r.amount_cents / 100).toFixed(2) : "", daysSince(r.since), shortDate(r.updated_at)].map(cell).join(","));
    const blob = new Blob([[head.map(cell).join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sohosuccess-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          All sales · live
        </h2>
        <div className="flex items-center gap-2">
          <input
            className={`${input} !h-9 !w-64 !py-1 text-sm`}
            placeholder="Search name, email, ref…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sales"
          />
          <button type="button" className={`${btnSecondary} h-9 px-3 py-1 text-xs`} onClick={downloadCsv} disabled={!rows.length}>
            Download CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {BOARD_FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === f.key ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {f.label} · {(sales ?? []).filter((r) => inBoard(r, f.key)).length}
          </button>
        ))}
      </div>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
        <span><span className="text-emerald-300">✓</span> done</span>
        <span><span className="text-cyan-300">●</span> now · your move</span>
        <span><span className="text-violet-300">●</span> now · customer&apos;s move</span>
        <span>Click a row to open it. Click a column name to sort.</span>
      </p>

      {!sales ? (
        <p className="mt-4 text-sm text-white/50">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">{q ? "No sales match your search." : filter === "you" ? "Nothing is waiting on you right now." : "No sales in this list."}</p>
      ) : (
        <div className="mt-3 max-h-[70vh] overflow-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[1500px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900 text-xs uppercase tracking-wide text-white/50">
              <tr>
                <Th sort={sort} onSort={onSort} k="ref" extra="sticky left-0 z-20 w-[112px] min-w-[112px] bg-slate-900">Ref</Th>
                <Th sort={sort} onSort={onSort} k="customer" extra="sticky left-[112px] z-20 min-w-[180px] border-r bg-slate-900">Customer</Th>
                <th className="whitespace-nowrap border-b border-white/10 px-3 py-2 font-semibold">Email</th>
                <Th sort={sort} onSort={onSort} k="service">Service</Th>
                {STAGES.map((st) => (
                  <th key={st.key} className="whitespace-nowrap border-b border-l border-white/10 px-2 py-2 text-center font-semibold">
                    {st.label}
                  </th>
                ))}
                <Th sort={sort} onSort={onSort} k="turn">Whose turn</Th>
                <th className="whitespace-nowrap border-b border-white/10 px-3 py-2 font-semibold">Next step</th>
                <Th sort={sort} onSort={onSort} k="amount" right>Amount</Th>
                <Th sort={sort} onSort={onSort} k="days" right>Days in stage</Th>
                <Th sort={sort} onSort={onSort} k="updated">Last change</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const at = stageIndex(r.stage);
                const mine = r.whose_turn === "you";
                return (
                  <tr
                    key={r.ref}
                    onClick={() => onOpen(r)}
                    className={`cursor-pointer transition hover:bg-white/[0.05] ${mine ? "bg-cyan-400/[0.04]" : ""}`}
                  >
                    <td className="sticky left-0 z-[5] w-[112px] min-w-[112px] whitespace-nowrap border-b border-white/5 bg-[#0f1220] px-3 py-2 font-mono text-xs text-white/70">{r.ref}</td>
                    <td className="sticky left-[112px] z-[5] min-w-[180px] whitespace-nowrap border-b border-r border-white/10 bg-[#0f1220] px-3 py-2 font-bold text-white">{r.customer || "New customer"}</td>
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-white/60">{r.email ?? "—"}</td>
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-white/80">{serviceLabel(r.service)}</td>
                    {STAGES.map((st, i) => {
                      const now = i === at;
                      const done = i < at || (r.stage === "done" && now);
                      return (
                        <td
                          key={st.key}
                          title={now ? `${st.label}: ${r.headline}` : st.label}
                          className={`border-b border-l border-white/5 px-2 py-2 text-center ${
                            now && r.stage !== "done" ? (mine ? "bg-cyan-400/15 font-bold text-cyan-300" : "bg-violet-400/15 font-bold text-violet-300") : ""
                          }`}
                        >
                          {done ? <span className="text-emerald-300">✓</span> : now ? "●" : <span className="text-white/10">·</span>}
                        </td>
                      );
                    })}
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${TURN_STYLE[r.whose_turn][1]}`}>{TURN_STYLE[r.whose_turn][0]}</span>
                    </td>
                    <td className="min-w-[220px] border-b border-white/5 px-3 py-2 text-white/80">
                      {r.headline}
                      {r.detail ? <span className="block text-xs text-white/40">{r.detail}</span> : null}
                    </td>
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-right font-bold text-white">{r.amount_cents ? money(r.amount_cents) : "—"}</td>
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-right text-white/60">{daysSince(r.since)}</td>
                    <td className="whitespace-nowrap border-b border-white/5 px-3 py-2 text-white/50">{shortDate(r.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
    service: string | null;
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
        sb.from("estimates").select("number, title, notes, status, deposit_percent, valid_until, est_duration, service, clients(name)").eq("id", id).single(),
        sb.from("estimate_items").select("id, description, quantity, unit_cents").eq("estimate_id", id).order("sort_order"),
        sb.from("estimate_requests").select("name, email, phone, business, notes, source, created_at, site_address, site_zip, rooms, survey").eq("estimate_id", id).maybeSingle(),
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
          <p className="text-xs font-bold text-white/40">{serviceLabel(est.service)} · {est.number}</p>
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
            {req.site_address ? (
              <p><a className="text-cyan-300" target="_blank" rel="noreferrer" href={`https://maps.apple.com/?q=${encodeURIComponent(`${req.site_address} ${req.site_zip ?? ""}`)}`}><i className="fa-solid fa-location-dot mr-1" aria-hidden />{req.site_address} {req.site_zip}</a></p>
            ) : null}
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
