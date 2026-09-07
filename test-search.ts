import { supabase } from "./lib/supabaseClient";
async function test() {
    const { data, error } = await supabase
        .from("users")
        .select("userId, fullName, employee_ids(employeeId)")
        .eq("collegeId", 20)
        .or("fullName.ilike.%test%,employee_ids.employeeId.ilike.%test%")
        .limit(1);
    console.log(error || data);
}
test();
