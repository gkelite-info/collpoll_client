"use server";

import { createClient } from "@/lib/supabaseServer";

export type CheckResultsExistsParams = {
  scheduleId: number;
  subjectName: string;
  collegeAcademicYearId: number;
  collegeBranchId?: number | null;
  isSchool: boolean;
};

export async function checkFacultyResultsExists(
  params: CheckResultsExistsParams
): Promise<boolean> {
  const { scheduleId, subjectName, collegeAcademicYearId, collegeBranchId, isSchool } = params;

  if (!scheduleId || !subjectName || !collegeAcademicYearId) return false;

  try {
    const supabase = await createClient();

    // 1. Resolve subjectId
    let subjectQuery = supabase
      .from("college_subjects")
      .select("collegeSubjectId")
      .eq("subjectName", subjectName)
      .eq("collegeAcademicYearId", collegeAcademicYearId)
      .is("deletedAt", null);

    if (!isSchool && collegeBranchId) {
      subjectQuery = subjectQuery.eq("collegeBranchId", collegeBranchId);
    }

    const { data: subData, error: subError } = await subjectQuery.maybeSingle();

    if (subError || !subData?.collegeSubjectId) {
      return false; // Subject not found means no results can possibly exist for it
    }

    const targetSubjectId = subData.collegeSubjectId;

    // 2. Check if results exist
    const { count, error } = await supabase
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("subjectId", targetSubjectId)
      .eq("collegeExamScheduleId", scheduleId)
      .is("deletedAt", null);

    if (error) {
      console.error("checkFacultyResultsExists error:", error);
      return false;
    }

    return (count || 0) > 0;
  } catch (err) {
    console.error("checkFacultyResultsExists exception:", err);
    return false;
  }
}
