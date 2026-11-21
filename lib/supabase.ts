"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The same Supabase project as the SohoSuccess app. Set these in Netlify (and .env.local):
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

let adminClient: SupabaseClient | null = null;

/** Same project, separate session: /admin has its own sign-in, apart from Client login. */
export function getAdminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "sohosuccess-admin-auth" },
    });
  }
  return adminClient;
}

export function requireSupabase(): SupabaseClient {
  const sb = getSupabase();
  if (!sb) throw new Error("Online accounts aren't switched on yet. Please contact us.");
  return sb;
}
