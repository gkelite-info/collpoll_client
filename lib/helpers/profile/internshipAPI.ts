import { supabase } from "@/lib/supabaseClient";
import { Internship, InternshipInsert, InternshipUpdate } from "./types";

const TABLE = "internship_details";

/* ---------------- CREATE ---------------- */
export async function createInternship(
  payload: InternshipInsert
): Promise<Internship> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- READ ---------------- */
export async function getInternshipsByStudent(
  studentId: number
): Promise<Internship[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("student_id", studentId)
    .eq("is_deleted", false);

  if (error) throw error;
  return data ?? [];
}

export async function getInternshipById(
  internshipId: number
): Promise<Internship | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("internship_id", internshipId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

/* ---------------- UPDATE ---------------- */
export async function updateInternship(
  internshipId: number,
  payload: InternshipUpdate
): Promise<Internship> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("internship_id", internshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- SOFT DELETE ---------------- */
export async function deleteInternship(internshipId: number): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("internship_id", internshipId);

  if (error) throw error;
}
