const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Query to get columns of college_exam_schedules
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'college_exam_schedules' });
  if (error) {
    console.error("RPC Error:", error.message);
    // fallback, just insert dummy to see error
    const { error: insertError } = await supabase
      .from('college_exam_schedules')
      .insert([{}]);
    console.log("INSERT ERROR:");
    console.log(JSON.stringify(insertError, null, 2));
  } else {
    console.log("Columns:", data);
  }
}
test();
