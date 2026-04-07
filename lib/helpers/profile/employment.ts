import { supabase } from "@/lib/supabaseClient";

export async function addEmployment(payload: any) {
  const { data, error } = await supabase
    .from("resume_employment_details")
    .insert([payload])
    .select();

  if (error) throw error;
  return data;
}

export async function updateEmployment(id: number, payload: any) {
  const { data, error } = await supabase
    .from("resume_employment_details")
    .update(payload)
    .eq("employmentId", id)
    .select();

  if (error) throw error;
  return data;
}

export async function getEmployment(studentId: number) {
  const { data, error } = await supabase
    .from("resume_employment_details")
    .select("*")
    .eq("studentId", studentId)
    .eq("is_deleted", false)
    .order("createdAt", { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteEmployment(id: number) {
  const { data, error } = await supabase
    .from("resume_employment_details")
    .update({ is_deleted: true })
    .eq("employmentId", id);

  if (error) throw error;
  return data;
}

