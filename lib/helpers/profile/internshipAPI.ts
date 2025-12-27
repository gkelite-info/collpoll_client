import { supabase } from "@/lib/supabaseClient";
// Adjust the import path for your types if necessary
import {
  InternshipInsert,
  InternshipUpdate,
} from "@/lib/helpers/profile/types";

const TABLE = "internship_details";

/* ---------------- CREATE ---------------- */
export async function createInternship(payload: InternshipInsert) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- READ ---------------- */
export async function getInternshipsByStudent(studentId: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    // CHANGED: student_id -> studentId (to match DB)
    .eq("studentId", studentId)
    // CHANGED: is_deleted -> isDeleted (to match DB)
    .eq("isDeleted", false);

  if (error) throw error;
  return data ?? [];
}

export async function getInternshipById(internshipId: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    // CHANGED: internship_id -> internshipId
    .eq("internshipId", internshipId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

/* ---------------- UPDATE ---------------- */
export async function updateInternship(
  internshipId: number,
  payload: InternshipUpdate
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    // CHANGED: internship_id -> internshipId
    .eq("internshipId", internshipId)
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
      // CHANGED: Match the model's boolean and date fields
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    })
    // CHANGED: internship_id -> internshipId
    .eq("internshipId", internshipId);

  if (error) throw error;
}
