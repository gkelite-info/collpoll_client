"use server";

import { createClient } from "@/lib/supabaseServer";

export type UploadResultsParams = {
  collegeId: number;
  scheduleId: number;
  subjectName: string;
  collegeAcademicYearId: number;
  collegeBranchId?: number | null;
  sectionId: number;
  semesterId: number;
  isSchool: boolean;
  resultsJson: any[]; // Parsed Excel rows
};

export type UploadResultsResponse = {
  success: boolean;
  message: string;
};

export async function uploadFacultyResults(
  params: UploadResultsParams
): Promise<UploadResultsResponse> {
  const {
    collegeId,
    scheduleId,
    subjectName,
    collegeAcademicYearId,
    collegeBranchId,
    sectionId,
    semesterId,
    isSchool,
    resultsJson,
  } = params;

  if (!scheduleId || !sectionId || !collegeAcademicYearId || resultsJson.length === 0) {
    return { success: false, message: "Missing required upload parameters or empty sheet." };
  }

  try {
    // Determine JSON mapping keys
    const sampleRow = resultsJson[0];
    const keys = Object.keys(sampleRow);
    const findKey = (candidates: string[]) => keys.find(k => candidates.includes(k.toLowerCase().trim()));

    const rollNoKey = findKey(["roll no", "rollno", "student id", "studentid", "pin number", "pinnumber", "student roll no", "register no", "reg no"]);
    const internalKey = findKey(["internal marks", "internalmarks", "internal", "internals"]);
    const externalKey = findKey(["external marks", "externalmarks", "external", "externals"]);
    const totalKey = findKey(["total", "total marks", "totalmarks"]);
    const gradeKey = findKey(["grade", "grade secured", "result grade"]);

    if (!rollNoKey || !gradeKey) {
      return { success: false, message: "Excel sheet must contain at least a 'Roll No' (or Student ID) and a 'Grade' column." };
    }

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
      return { success: false, message: `Could not resolve subject ID for subject "${subjectName}"` };
    }
    const targetSubjectId = subData.collegeSubjectId;

    // 2. Fetch enrolled students for this section/year
    const { data: historyRows, error: histError } = await supabase
      .from("student_academic_history")
      .select("studentId")
      .eq("collegeSectionsId", sectionId)
      .eq("collegeAcademicYearId", collegeAcademicYearId)
      .eq("isCurrent", true)
      .is("deletedAt", null);

    if (histError) throw histError;
    if (!historyRows || historyRows.length === 0) {
      return { success: false, message: "No students found currently enrolled in this section and year." };
    }

    const studentIds = historyRows.map(h => h.studentId);

    // 3. Fetch pins for mapping roll numbers to studentIds
    const { data: pinRows, error: pinError } = await supabase
      .from("student_pins")
      .select("studentId, pinNumber")
      .in("studentId", studentIds)
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (pinError) throw pinError;

    const pinMap = new Map<string, number>();
    pinRows?.forEach(r => {
      if (r.pinNumber) {
        pinMap.set(r.pinNumber.trim().toUpperCase(), r.studentId);
      }
    });

    // 4. Map JSON rows to database inserts
    const resultsToInsert: any[] = [];
    const notFoundRollNos: string[] = [];

    resultsJson.forEach(row => {
      const rollVal = String(row[rollNoKey] || "").trim().toUpperCase();
      const studentId = pinMap.get(rollVal);

      if (!studentId) {
        if (rollVal) notFoundRollNos.push(rollVal);
        return;
      }

      const internal = Number(row[internalKey || ""] || 0);
      const external = Number(row[externalKey || ""] || 0);
      const total = row[totalKey || ""] !== undefined ? Number(row[totalKey || ""]) : (internal + external);
      const grade = String(row[gradeKey] || "").trim();

      resultsToInsert.push({
        studentId,
        subjectId: targetSubjectId,
        collegeSemesterId: semesterId,
        collegeExamScheduleId: scheduleId,
        internalMarks: internal,
        externalMarks: external,
        total,
        grade,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    if (resultsToInsert.length === 0) {
      return { success: false, message: "No matching student roll numbers found in the excel sheet for this section." };
    }

    // 5. Delete existing results for this specific schedule & subject
    const targetStudentIds = resultsToInsert.map(r => r.studentId);
    const { error: deleteError } = await supabase
      .from("results")
      .delete()
      .in("studentId", targetStudentIds)
      .eq("subjectId", targetSubjectId)
      .eq("collegeSemesterId", semesterId)
      .eq("collegeExamScheduleId", scheduleId);

    if (deleteError) throw deleteError;

    // 6. Insert new results
    const { error: insertError } = await supabase
      .from("results")
      .insert(resultsToInsert);

    if (insertError) throw insertError;

    let successMsg = `Successfully uploaded results for ${resultsToInsert.length} students!`;
    if (notFoundRollNos.length > 0) {
      successMsg += ` Note: ${notFoundRollNos.length} roll numbers were not found: ${notFoundRollNos.join(", ")}`;
    }

    return { success: true, message: successMsg };

  } catch (err: any) {
    console.error("uploadFacultyResults FULL error:", JSON.stringify(err, null, 2));
    console.error("uploadFacultyResults error message:", err?.message);
    console.error("uploadFacultyResults error details:", err?.details);
    console.error("uploadFacultyResults error hint:", err?.hint);
    console.error("uploadFacultyResults error code:", err?.code);
    // Generic friendly error instead of raw DB error
    return { success: false, message: "An error occurred while uploading results. Please verify your file data or try again." };
  }
}
