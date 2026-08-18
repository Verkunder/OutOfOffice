import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserSupabaseClient: SupabaseClient<Database> | null = null;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase env vars are missing.");
  }

  browserSupabaseClient ??= createClient<Database>(supabaseUrl, supabasePublishableKey);

  return browserSupabaseClient;
}
