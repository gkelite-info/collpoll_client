require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// You can't just run raw SQL directly with supabase-js unless you have an RPC setup like 'run_sql' or something similar.
// Since we might not have 'run_sql' RPC, let's try querying information_schema directly if Supabase API exposes it, but usually PostgREST restricts it.

// Just test if insert fails due to RLS when using a valid collegeId.
async function run() {
  const { data: colleges } = await supabase.from('colleges').select('collegeId').limit(1);
  if (!colleges || colleges.length === 0) {
    console.log("No colleges found");
    return;
  }
  const collegeId = colleges[0].collegeId;
  
  const { data: edus } = await supabase.from('college_education').select('collegeEducationId').eq('collegeId', collegeId).limit(1);
  if (!edus || edus.length === 0) return console.log("No edu found");
  
  const payload = {
    collegeId,
    scheduleTitle: 'Test RLS',
    examType: 'Internal',
    createdBy: 1,
    collegeEducationId: edus[0].collegeEducationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const res = await supabase.from('college_exam_schedules').insert([payload]).select('collegeExamScheduleId');
  console.log(JSON.stringify(res, null, 2));
}
run().catch(console.error);
