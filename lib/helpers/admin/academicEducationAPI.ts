import { supabase } from "@/lib/supabaseClient";

export type CollegeEducationRow = {
  collegeEducationId: number;
  collegeEducationType: string;
  collegeId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function fetchCollegeEducations(collegeId: number) {
  const { data, error } = await supabase
    .from("college_education")
    .select(
      `
      collegeEducationId,
      collegeEducationType,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `,
    )
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("collegeEducationId", { ascending: true });

  if (error) {
    console.error("fetchCollegeEducations error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchEducationTypes(collegeId: number) {
  const data = await fetchCollegeEducations(collegeId);

  return data.map((row) => ({
    id: row.collegeEducationId,
    label: row.collegeEducationType,
    value: row.collegeEducationType,
  }));
}

export async function fetchExistingEducation(
  collegeEducationType: string,
  collegeId: number,
) {
  const { data, error } = await supabase
    .from("college_education")
    .select("collegeEducationId")
    .eq("collegeEducationType", collegeEducationType)
    .eq("collegeId", collegeId)
    .is("deletedAt", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    throw error;
  }

  return { success: true, data };
}

export async function saveCollegeEducation(
  payload: {
    id?: number;
    collegeEducationType: string;
    collegeId: number;
  },
  adminId: number,
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("college_education")
    .upsert(
      {
        collegeEducationType: payload.collegeEducationType.trim(),
        collegeId: payload.collegeId,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: "collegeId, collegeEducationType" },
    )
    .select("collegeEducationId")
    .single();

  if (error) {
    console.error("saveCollegeEducation error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    collegeEducationId: data.collegeEducationId,
  };
}

export async function deactivateCollegeEducation(collegeEducationId: number) {
  const { error } = await supabase
    .from("college_education")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("collegeEducationId", collegeEducationId);

  if (error) {
    console.error("deactivateCollegeEducation error:", error);
    return { success: false };
  }

  return { success: true };
}
