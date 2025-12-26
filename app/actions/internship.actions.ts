"use server";

import { supabase } from "@/lib/supabaseClient";
import { createInternship } from "../../lib/helpers/profile/internshipAPI";
import { InternshipInsert } from "../../lib/helpers/profile/types";

export async function createInternshipAction(payload: InternshipInsert) {
  const { data, error } = await supabase
    .from("internship_details") // MUST match your table
    .insert({
      studentId: payload.student_id,
      organizationName: payload.organization_name,
      role: payload.role,
      startDate: payload.start_date,
      endDate: payload.end_date,
      projectName: payload.project_name,
      projectUrl: payload.project_url,
      location: payload.location,
      domain: payload.domain,
      description: payload.description,
      isDeleted: payload.is_deleted,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    })
    .select();

  if (error) throw error;
  return data;
}
