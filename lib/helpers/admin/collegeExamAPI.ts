import { supabase } from "@/lib/supabaseClient";

export interface CustomExamType {
  collegeExamTypeId: number;
  examTypeName: string;
  collegeId: number;
  createdBy: number;
  isActive: boolean;
}

export interface ExamScheduleInput {
  scheduleTitle: string;
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  academicYear: string | null;
  collegeSectionsId: number | null;
  collegeSemesterId: number | null;
  examType: string;
  fromDate: string | null;
  toDate: string | null;
  createdBy: number;
}

export interface ExamSubjectInput {
  subject: string;
  examDate: string;
  time: string;
}

export async function fetchCustomExamTypes(collegeId: number): Promise<CustomExamType[]> {
  const { data, error } = await supabase
    .from("college_exam_types")
    .select("collegeExamTypeId, examTypeName, collegeId, createdBy, isActive")
    .eq("collegeId", collegeId)
    .eq("isActive", true);

  if (error) {
    console.error("Error fetching custom exam types:", error);
    throw error;
  }
  return data || [];
}


export async function createCustomExamType(
  collegeId: number,
  examTypeName: string,
  createdBy: number
): Promise<number> {
  const { data: existing, error: checkError } = await supabase
    .from("college_exam_types")
    .select("collegeExamTypeId")
    .eq("collegeId", collegeId)
    .eq("examTypeName", examTypeName)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking custom exam type existence:", checkError);
    throw checkError;
  }

  if (existing) {
    return existing.collegeExamTypeId;
  }

  const { data, error } = await supabase
    .from("college_exam_types")
    .insert([
      {
        collegeId,
        examTypeName,
        createdBy,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    .select("collegeExamTypeId")
    .single();

  if (error) {
    console.error("Error creating custom exam type:", error);
    throw error;
  }

  return data.collegeExamTypeId;
}


export async function createExamSchedule(
  schedule: ExamScheduleInput,
  subjects: ExamSubjectInput[]
): Promise<number> {
  const schedulePayload = {
    ...schedule,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error: scheduleError } = await supabase
    .from("college_exam_schedules")
    .insert([schedulePayload])
    .select("collegeExamScheduleId")
    .single();

  if (scheduleError) {
    console.error("Error creating exam schedule:", scheduleError);
    throw scheduleError;
  }

  const scheduleId = data.collegeExamScheduleId;

  if (subjects.length > 0) {
    const subjectRows = subjects.map((sub) => ({
      collegeExamScheduleId: scheduleId,
      subjectName: sub.subject,
      examDate: sub.examDate,
      time: sub.time,
      status: "Upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const { error: subjectsError } = await supabase
      .from("college_exam_schedule_subjects")
      .insert(subjectRows);

    if (subjectsError) {
      console.error("Error inserting exam schedule subjects:", subjectsError);
      throw subjectsError;
    }
  }

  return scheduleId;
}


export async function fetchExamSchedules(
  collegeId: number,
  page: number = 1,
  limit: number = 20,
  educationFilterId: number | "All" = "All",
  branchFilterId: number | null = null,
  yearFilter: string | null = null
): Promise<{ data: any[]; total: number }> {
  let query = supabase
    .from("college_exam_schedules")
    .select(`
      collegeExamScheduleId,
      scheduleTitle,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      academicYear,
      collegeSectionsId,
      collegeSemesterId,
      examType,
      fromDate,
      toDate,
      createdBy,
      isActive,
      createdAt,
      college_education ( collegeEducationType ),
      college_branch ( collegeBranchCode ),
      college_semester ( collegeSemester ),
      college_sections ( collegeSections )
    `, { count: 'exact' })
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (educationFilterId !== "All") {
    query = query.eq("collegeEducationId", educationFilterId);
  }
  if (branchFilterId) {
    query = query.eq("collegeBranchId", branchFilterId);
  }
  if (yearFilter) {
    query = query.eq("academicYear", yearFilter);
  }

  query = query.order("createdAt", { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: schedules, count, error } = await query;

  if (error) {
    console.error("Error fetching exam schedules:", error);
    throw error;
  }

  if (schedules && schedules.length > 0) {
    const scheduleIds = schedules.map((s) => s.collegeExamScheduleId);
    const { data: subjects, error: subjectsError } = await supabase
      .from("college_exam_schedule_subjects")
      .select("collegeExamScheduleId, examDate")
      .in("collegeExamScheduleId", scheduleIds)
      .is("deletedAt", null);

    if (subjectsError) {
      console.error("Error fetching exam schedule subjects:", subjectsError);
    } else {
      schedules.forEach((s: any) => {
        s.college_exam_schedule_subjects = subjects.filter(
          (sub) => sub.collegeExamScheduleId === s.collegeExamScheduleId
        );
      });
    }
  }

  return { data: schedules || [], total: count || 0 };
}


export async function deleteExamSchedule(scheduleId: number): Promise<void> {
  const { error } = await supabase
    .from("college_exam_schedules")
    .update({ deletedAt: new Date().toISOString(), isActive: false })
    .eq("collegeExamScheduleId", scheduleId);

  if (error) {
    console.error("Error deleting exam schedule:", error);
    throw error;
  }
}


export async function fetchExamScheduleSubjects(scheduleId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from("college_exam_schedule_subjects")
    .select("collegeExamScheduleSubjectId, collegeExamScheduleId, subjectName, examDate, time, status")
    .eq("collegeExamScheduleId", scheduleId)
    .is("deletedAt", null);

  if (error) {
    console.error("Error fetching exam schedule subjects:", error);
    throw error;
  }
  return data || [];
}


export async function updateExamSchedule(
  scheduleId: number,
  schedule: ExamScheduleInput,
  subjects: any[]
): Promise<void> {
  const schedulePayload = {
    ...schedule,
    updatedAt: new Date().toISOString(),
  };

  const { error: scheduleError } = await supabase
    .from("college_exam_schedules")
    .update(schedulePayload)
    .eq("collegeExamScheduleId", scheduleId);

  if (scheduleError) {
    console.error("Error updating exam schedule:", scheduleError);
    throw scheduleError;
  }

  const { error: deleteError } = await supabase
    .from("college_exam_schedule_subjects")
    .delete()
    .eq("collegeExamScheduleId", scheduleId);

  if (deleteError) {
    console.error("Error deleting old subjects for update:", deleteError);
    throw deleteError;
  }

  if (subjects.length > 0) {
    const subjectRows = subjects.map((sub) => ({
      collegeExamScheduleId: scheduleId,
      subjectName: sub.subject,
      examDate: sub.examDate,
      time: sub.time,
      status: sub.status || "Upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const { error: subjectsError } = await supabase
      .from("college_exam_schedule_subjects")
      .insert(subjectRows);

    if (subjectsError) {
      console.error("Error inserting updated exam schedule subjects:", subjectsError);
      throw subjectsError;
    }
  }
}
