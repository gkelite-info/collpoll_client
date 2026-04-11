import { supabase } from "@/lib/supabaseClient";

const now = () => new Date().toISOString();

export type EducationLevel = "primary" | "secondary" | "undergraduate" | "masters" | "phd";

// ─── FETCH ────────────────────────────────────────────────────────────────────

async function fetchEducation(studentId: number, level: EducationLevel) {
  const { data, error } = await supabase
    .from("resume_education_details")
    .select("*")
    .eq("studentId", studentId)
    .eq("educationLevel", level)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error(`[fetchEducation] level=${level}`, JSON.stringify(error));
    return { success: false, data: null };
  }
  return { success: true, data };
}

// ─── SAVE ─────────────────────────────────────────────────────────────────────

async function saveEducation(payload: Record<string, any>, level: EducationLevel) {
  const timestamp = now();
  const id = payload.resumeEducationDetailId;

  // UPDATE
  if (id != null) {
    const { resumeEducationDetailId, studentId, collegeId, educationLevel, ...updatable } = payload;
    const { error } = await supabase
      .from("resume_education_details")
      .update({ ...updatable, updatedAt: timestamp })
      .eq("resumeEducationDetailId", id);

    if (error) {
      console.error(`[saveEducation/update] level=${level}`, JSON.stringify(error));
      return { success: false };
    }
    return { success: true, id };
  }

  // INSERT — strip PK so serial auto-generates it
  const { resumeEducationDetailId, ...insertPayload } = payload;

  const { data, error } = await supabase
    .from("resume_education_details")
    .insert([{
      ...insertPayload,
      educationLevel: level,
      is_deleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }])
    .select("resumeEducationDetailId")
    .single();

  if (error) {
    console.error(`[saveEducation/insert] level=${level}`, JSON.stringify(error));
    return { success: false };
  }
  return { success: true, id: data.resumeEducationDetailId };
}

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────

async function deleteEducation(resumeEducationDetailId: number) {
  const { error } = await supabase
    .from("resume_education_details")
    .update({ is_deleted: true, deletedAt: now(), updatedAt: now() })
    .eq("resumeEducationDetailId", resumeEducationDetailId);

  if (error) {
    console.error("[deleteEducation]", JSON.stringify(error));
    return { success: false };
  }
  return { success: true };
}

// ─── Named API objects ────────────────────────────────────────────────────────

export const resumePrimaryEducationAPI = {
  fetch: (studentId: number) => fetchEducation(studentId, "primary"),
  save: (payload: {
    resumeEducationDetailId?: number;
    studentId: number;
    collegeId: number;
    institutionName: string;
    board?: string;
    mediumOfStudy?: string;
    yearOfPassing?: number;
    location?: string;
  }) => saveEducation(payload, "primary"),
  delete: (resumeEducationDetailId: number) => deleteEducation(resumeEducationDetailId),
};

export const resumeSecondaryEducationAPI = {
  fetch: (studentId: number) => fetchEducation(studentId, "secondary"),
  save: (payload: {
    resumeEducationDetailId?: number;
    studentId: number;
    collegeId: number;
    institutionName: string;
    board?: string;
    mediumOfStudy?: string;
    yearOfPassing?: number;
    percentage?: number;
    location?: string;
  }) => saveEducation(payload, "secondary"),
  delete: (resumeEducationDetailId: number) => deleteEducation(resumeEducationDetailId),
};

export const resumeUndergraduateEducationAPI = {
  fetch: (studentId: number) => fetchEducation(studentId, "undergraduate"),
  save: (payload: {
    resumeEducationDetailId?: number;
    studentId: number;
    collegeId: number;
    institutionName: string;
    courseName?: string;
    specialization?: string;
    cgpa?: number;
    courseType?: string;
    startYear?: number;
    endYear?: number;
  }) => saveEducation(payload, "undergraduate"),
  delete: (resumeEducationDetailId: number) => deleteEducation(resumeEducationDetailId),
};

export const resumePhdEducationAPI = {
  fetch: (studentId: number) => fetchEducation(studentId, "phd"),
  save: (payload: {
    resumeEducationDetailId?: number;
    studentId: number;
    collegeId: number;
    institutionName: string;
    researchArea?: string;
    supervisorName?: string;
    startYear?: number;
    endYear?: number;
  }) => saveEducation(payload, "phd"),
  delete: (resumeEducationDetailId: number) => deleteEducation(resumeEducationDetailId),
};

export const resumeMastersEducationAPI = {
  fetch: (studentId: number) => fetchEducation(studentId, "masters"),
  save: (payload: {
    resumeEducationDetailId?: number;
    studentId: number;
    collegeId: number;
    institutionName: string;
    courseName?: string;
    specialization?: string;
    cgpa?: number;
    courseType?: string;
    startYear?: number;
    endYear?: number;
  }) => saveEducation(payload, "masters"),
  delete: (resumeEducationDetailId: number) => deleteEducation(resumeEducationDetailId),
};