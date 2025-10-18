"use client";

import { createClient } from "@supabase/supabase-js";

// 🧱 Fungsi pembuat client Supabase
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("❌ Missing Supabase environment variables");
    return null;
  }

  return createClient(url, anonKey);
}
