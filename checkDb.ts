import { gkeliteSupabase } from "./lib/gkeliteSupabaseClient";

async function check() {
  const { data, error } = await gkeliteSupabase.from('lead_applications').select('applicationId, college, applicationFor, course, firstName, lastName');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
