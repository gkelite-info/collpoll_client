import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_GKELITE_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_GKELITE_SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from('education_qualifications')
    .select('*, lead_applications(applicationId, firstName, lastName, createdAt)')
    .limit(15);
    
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
