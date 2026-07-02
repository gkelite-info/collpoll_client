import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_GKELITE_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_GKELITE_SUPABASE_ANON_KEY!
);

async function test() {
  console.log("Testing application_analytics_logs...");
  const res1 = await supabase.from('application_analytics_logs').select('*', { count: 'exact', head: true });
  console.log("Logs response:", res1);

  console.log("Testing lead_applications...");
  const res2 = await supabase.from('lead_applications').select('*').limit(5);
  console.log("Lead response:", res2);
}

test();
