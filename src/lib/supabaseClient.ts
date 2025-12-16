import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// IMPORTANT: don’t crash the whole site if env is missing.
// We’ll warn, and Supabase calls will fail gracefully until env is set.
if (!url || !anon) {
  console.warn(
    "Supabase env missing. Check .env in project root:\n" +
      "VITE_SUPABASE_URL=...\n" +
      "VITE_SUPABASE_ANON_KEY=...\n"
  );
}

export const supabase = createClient(
  url ?? "https://example.supabase.co",
  anon ?? "public-anon-key"
);
