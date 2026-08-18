import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: users } = await supabase.from('users').select('*').ilike('fullName', '%Valega%').eq('role', 'Student');
  const user = users[0];
  if (!user) {
    console.log("Valega Student not found");
    return;
  }
  
  console.log("User:", user.userId, user.fullName);

  const { data: student } = await supabase.from('students').select('*, college_sections(sectionName), college_academic_years(academicYear), college_educations(educationType)').eq('userId', user.userId).maybeSingle();
  console.log("Student context:");
  console.log(JSON.stringify(student, null, 2));

  const { data: schedules } = await supabase.from('college_exam_schedules')
    .select('*, college_exam_schedule_sections(collegeSectionsId)')
    .eq('collegeId', student.collegeId)
    .eq('collegeEducationId', student.collegeEducationId)
    .is('deletedAt', null);
    
  console.log("Schedules:");
  console.log(JSON.stringify(schedules, null, 2));
}

main();
