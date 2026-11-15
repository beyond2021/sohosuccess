"use client";

// Client portal and estimates for the website. Same tables and rules as the app
// (sohosuccess-mobile/supabase/migrations). Row-level security makes sure each
// client only ever sees their own business.
import { requireSupabase } from "./supabase";

export type ServiceKind = "network" | "cameras" | "website" | "app" | "other";

export interface Me {
  email: string;
  fullName: string;
  clientName: string | null; // null = new customer, not linked to a business yet
  businessName: string;
}
export interface MyRequest {
  id: string;
  items: { key: string; label: string; qty: number }[];
  low_cents: number;
  high_cents: number;
  status: "new" | "contacted" | "quoted" | "closed";
  created_at: string;
}
export interface ClientService {
  id: string;
  kind: ServiceKind;
  name: string;
  status: "ok" | "attention" | "down";
  note: string;
}
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_cents: number;
}
export interface Estimate {
  id: string;
  number: string;
  title: string;
  notes: string;
  status: "sent" | "accepted" | "declined" | "expired";
  deposit_percent: number;
  valid_until: string | null;
  items: EstimateItem[];
}
export interface Invoice {
  id: string;
  number: string;
  kind: "deposit" | "final" | "other";
  description: string;
  amount_cents: number;
  currency: string;
  status: "due" | "paid" | "overdue" | "void";
  due_date: string | null;
  pay_url: string | null;
}
/** An alert. Same rows the app shows and sends as push notifications. */
export interface AppAlert {
  id: string;
  title: string;
  body: string;
  url: string | null; // app screen, e.g. /account/invoices
  created_at: string;
  read_at: string | null;
}
export interface PriceItem {
  key: string;
  category: ServiceKind;
  label: string;
  unit: string;
  low_cents: number;
  high_cents: number;
  max_qty: number;
}

export const money = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
export const range = (low: number, high: number) => {
  const f = (c: number) => money(c).replace(/\.00$/, "");
  return low === high ? f(low) : `${f(low)} – ${f(high)}`;
};
export const shortDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const estimateTotal = (items: EstimateItem[]) => Math.round(items.reduce((s, i) => s + i.quantity * i.unit_cents, 0));

// ── Sign-in ──
export async function sendCode(email: string) {
  const { error } = await requireSupabase().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
  });
  if (error) {
    throw new Error(
      /signups not allowed|not found/i.test(error.message)
        ? "We don't have an account for that email yet. Click Create an account."
        : error.message,
    );
  }
}
/** New customer: emails a code; entering it creates the account. */
export async function signUp(input: { email: string; fullName: string; business: string; password: string }) {
  // Supabase Auth creates the account with this password and emails a code ("Confirm signup" template)
  // to confirm the email. Same call as the app, so every account has a password from day one.
  const { data, error } = await requireSupabase().auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: { data: { full_name: input.fullName.trim(), business: input.business.trim() } },
  });
  // Supabase answers "ok" for an email that already has an account (so emails can't be probed): no identities.
  if (!error && data.user && (data.user.identities?.length ?? 0) === 0) {
    throw new Error("You already have an account with this email. Sign in instead.");
  }
  if (error) {
    throw new Error(
      /signups not allowed/i.test(error.message)
        ? "New accounts are switched off right now. Please use the contact form."
        : /password/i.test(error.message)
          ? "Please use a password with at least 8 characters."
          : /rate limit|security purposes/i.test(error.message)
          ? "Please wait a minute before asking for another code."
          : error.message,
    );
  }
}
export async function verifyCode(email: string, code: string) {
  const sb = requireSupabase();
  const args = { email: email.trim().toLowerCase(), token: code.trim() };
  // "email" covers sign-in codes; "signup" covers the code that confirms a new account.
  let { error } = await sb.auth.verifyOtp({ ...args, type: "email" });
  if (error) ({ error } = await sb.auth.verifyOtp({ ...args, type: "signup" }));
  if (error) throw new Error("That code didn't work. Check it, or send a new one.");
}
/** False for accounts made with only an email code (no password yet). If unsure, true (don't nag). */
export async function hasPassword() {
  const { data, error } = await requireSupabase().rpc("i_have_password");
  return error ? true : data !== false;
}
export async function setPassword(password: string) {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw new Error(/weak|short|characters/i.test(error.message) ? "Please use at least 8 characters." : error.message);
}
export async function signInWithPassword(email: string, password: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw new Error("Email or password is wrong.");
}
export const signOut = () => requireSupabase().auth.signOut();

// ── Account data ──
export async function getMe(): Promise<Me> {
  const sb = requireSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error("Please sign in again.");
  const { data, error } = await sb.from("profiles").select("full_name, business_name, clients(name)").eq("user_id", u.user.id).maybeSingle();
  if (error) throw error;
  const c = (data?.clients ?? null) as { name: string } | { name: string }[] | null;
  return {
    email: u.user.email ?? "",
    fullName: data?.full_name ?? "",
    clientName: Array.isArray(c) ? (c[0]?.name ?? null) : (c?.name ?? null),
    businessName: (data as { business_name?: string } | null)?.business_name ?? "",
  };
}
export async function getServices(): Promise<ClientService[]> {
  const { data, error } = await requireSupabase().from("client_services").select("id, kind, name, status, note").order("kind").order("name");
  if (error) throw error;
  return (data ?? []) as ClientService[];
}
export async function getEstimates(): Promise<Estimate[]> {
  const { data, error } = await requireSupabase()
    .from("estimates")
    .select("id, number, title, notes, status, deposit_percent, valid_until, items:estimate_items(id, description, quantity, unit_cents, sort_order)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((e: any) => ({
    ...e,
    items: [...(e.items ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ id: i.id, description: i.description, quantity: Number(i.quantity), unit_cents: i.unit_cents })),
  }));
}
export async function acceptEstimate(id: string): Promise<string | null> {
  const { data, error } = await requireSupabase().rpc("accept_estimate", { p_estimate: id });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}
export async function declineEstimate(id: string) {
  const { error } = await requireSupabase().rpc("decline_estimate", { p_estimate: id });
  if (error) throw new Error(error.message);
}
export async function getMyRequests(): Promise<MyRequest[]> {
  const { data, error } = await requireSupabase()
    .from("estimate_requests")
    .select("id, items, low_cents, high_cents, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MyRequest[];
}
export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await requireSupabase()
    .from("invoices")
    .select("id, number, kind, description, amount_cents, currency, status, due_date, pay_url")
    .neq("status", "void")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

// ── Alerts ──
export async function getAlerts(): Promise<AppAlert[]> {
  const { data, error } = await requireSupabase()
    .from("notifications")
    .select("id, title, body, url, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as AppAlert[];
}
/** Marks these alerts read, or all of them when ids is left out. */
export async function markAlertsRead(ids?: string[]) {
  const { error } = await requireSupabase().rpc("mark_notifications_read", { p_ids: ids ?? null });
  if (error) throw new Error(error.message);
}
/** Where an app screen lives on this page. Requests are app-only for now. */
export function alertAnchor(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/account/estimate")) return "#est";
  if (url.startsWith("/account/invoices")) return "#inv";
  if (url === "/account") return "#svc";
  return null;
}
export const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return shortDate(iso);
};

/** Sends the browser to Stripe's payment page (Apple Pay, Google Pay, card). */
export async function payInvoice(invoice: Pick<Invoice, "id" | "pay_url">) {
  if (invoice.pay_url) {
    window.location.href = invoice.pay_url;
    return;
  }
  const { data, error } = await requireSupabase().functions.invoke("create-checkout", {
    method: "POST",
    body: { invoice_id: invoice.id, from: "web" },
  });
  if (error || !data?.url) {
    let message = "Couldn't start the payment. Please try again.";
    try {
      const ctx = (error as { context?: Response } | null)?.context;
      const body = ctx ? await ctx.json() : data;
      if (body?.error) message = body.error;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  window.location.href = data.url as string;
}

// ── Public estimate ──
export async function getPriceList(): Promise<PriceItem[]> {
  const { data, error } = await requireSupabase()
    .from("price_items")
    .select("key, category, label, unit, low_cents, high_cents, max_qty")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as PriceItem[];
}
export async function sendEstimateRequest(input: {
  name: string;
  email: string;
  phone: string;
  business: string;
  notes: string;
  items: { key: string; label: string; qty: number; low_cents: number; high_cents: number }[];
}) {
  const low = input.items.reduce((s, i) => s + i.low_cents * i.qty, 0);
  const high = input.items.reduce((s, i) => s + i.high_cents * i.qty, 0);
  const sb = requireSupabase();
  const { data: auth } = await sb.auth.getSession();
  const { error } = await sb.from("estimate_requests").insert({
    user_id: auth.session?.user.id ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim() || null,
    business: input.business.trim() || null,
    notes: input.notes.trim(),
    items: input.items,
    low_cents: low,
    high_cents: high,
    source: "web",
  });
  if (error) throw new Error("Couldn't send your request. Please try again.");
}
