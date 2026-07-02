import { createClient } from "@supabase/supabase-js";

export const gkeliteSupabase = createClient(
    process.env.NEXT_PUBLIC_GKELITE_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_GKELITE_SUPABASE_ANON_KEY || ""
);
