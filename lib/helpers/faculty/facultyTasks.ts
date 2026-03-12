import { supabase } from "@/lib/supabaseClient";

export type FacultyTaskRow = {
  facultyTaskId: number;
  collegeSubjectId: number;
  taskTitle: string;
  description: string;
  date: string;
  time: string;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};


export async function fetchFacultyTasks(collegeSubjectId: number) {
  const { data, error } = await supabase
    .from("faculty_tasks")
    .select(`
      facultyTaskId,
      collegeSubjectId,
      taskTitle,
      description,
      date,
      time,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("date", { ascending: true });

  if (error) {
    console.error("fetchFacultyTasks error:", error);
    throw error;
  }

  return data ?? [];
}


export async function fetchExistingFacultyTask(
  collegeSubjectId: number,
  taskTitle: string,
  date: string,
) {
  const { data, error } = await supabase
    .from("faculty_tasks")
    .select("facultyTaskId")
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("taskTitle", taskTitle.trim())
    .eq("date", date)
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


export async function saveFacultyTask(
  payload: {
    facultyTaskId?: number;
    collegeSubjectId: number;
    taskTitle: string;
    description: string;
    date: string;
    time: string;
  },
  facultyId: number,
) {
  const now = new Date().toISOString();

  const upsertPayload: any = {
    collegeSubjectId: payload.collegeSubjectId,
    taskTitle: payload.taskTitle.trim(),
    description: payload.description.trim(),
    date: payload.date,
    time: payload.time,
    updatedAt: now,
  };

  if (!payload.facultyTaskId) {
    upsertPayload.createdBy = facultyId;
    upsertPayload.createdAt = now;
  } else {
    upsertPayload.facultyTaskId = payload.facultyTaskId;
  }

  const { data, error } = await supabase
    .from("faculty_tasks")
    .upsert(upsertPayload, {
      onConflict: "facultyTaskId",
    })
    .select("facultyTaskId")
    .single();

  if (error) {
    console.error("saveFacultyTask error:", error);
    return { success: false, error };
  }

  return {
    success: true,
    facultyTaskId: data.facultyTaskId,
  };
}


export async function deactivateFacultyTask(facultyTaskId: number) {
  const { error } = await supabase
    .from("faculty_tasks")
    .update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    })
    .eq("facultyTaskId", facultyTaskId);

  if (error) {
    console.error("deactivateFacultyTask error:", error);
    return { success: false };
  }

  return { success: true };
}


export async function fetchFacultyTasksForLoggedInFaculty(
  facultyId: number,
  collegeSubjectId: number,
) {
  const { data, error } = await supabase
    .from("faculty_tasks")
    .select(`
      facultyTaskId,
      taskTitle,
      description,
      date,
      time
    `)
    .eq("createdBy", facultyId)
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("date", { ascending: true });

  if (error) {
    console.error("fetchFacultyTasksForLoggedInFaculty error:", error);
    throw error;
  }

  return data ?? [];
}