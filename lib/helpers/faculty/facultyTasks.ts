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
  collegeAcademicYearId: number | null;
  collegeSectionsId: number | null;
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
      deletedAt,
      collegeAcademicYearId,
      collegeSectionsId
    `)
    .eq("collegeSubjectId", collegeSubjectId)
    .is("deletedAt", null)
    .order("date", { ascending: false })
    .order("time", { ascending: true });

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
    collegeAcademicYearId?: number | null;
    collegeSectionsId?: number | null;
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
    isActive: true,
    is_deleted: false,
    deletedAt: null,
    updatedAt: now,
    collegeAcademicYearId: payload.collegeAcademicYearId ?? null,
    collegeSectionsId: payload.collegeSectionsId ?? null,
  };

  if (!payload.facultyTaskId) {

    upsertPayload.createdBy = facultyId;
    upsertPayload.createdAt = now;

    const { data, error } = await supabase
      .from("faculty_tasks")
      .insert([upsertPayload])
      .select("facultyTaskId")
      .single();

    if (error) {
      console.error("saveFacultyTask error:", error?.message, error?.details, error);
      return { success: false, error };
    }

    return {
      success: true,
      facultyTaskId: data.facultyTaskId,
    };

  }

  const { error } = await supabase
    .from("faculty_tasks")
    .update(upsertPayload)
    .eq("facultyTaskId", payload.facultyTaskId);

  if (error) {
    console.error("saveFacultyTask error:", error?.message, error?.details, error);
    return { success: false, error };
  }

  return {
    success: true,
    facultyTaskId: payload.facultyTaskId,
  };
}

export async function deactivateFacultyTask(facultyTaskId: number) {

  const { error } = await supabase
    .from("faculty_tasks")
    .update({
      isActive: false,
      is_deleted: true,
      deletedAt: new Date().toISOString(),
    })
    .eq("facultyTaskId", facultyTaskId);

  if (error) {
    console.error("deactivateFacultyTask error:", error);
    return { success: false };
  }

  return { success: true };
}


export async function fetchFacultyTasksForLoggedInFaculty({
  facultyId,
  collegeSubjectId,
  collegeSectionId,
  selectedDate,
  page = 1,
  limit = 10,
}: {
  facultyId: number;
  collegeSubjectId: number;
  collegeSectionId?: number | null;
  selectedDate?: string | null;
  page?: number;
  limit?: number;
}): Promise<{ data: FacultyTaskRow[]; totalPages: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("faculty_tasks")
    .select(
      `
      facultyTaskId,
      taskTitle,
      description,
      date,
      time,
      collegeAcademicYearId,
      collegeSectionsId
    `,
      { count: "exact" }
    )
    .eq("createdBy", facultyId)
    .eq("collegeSubjectId", collegeSubjectId)
    .is("deletedAt", null);

  if (selectedDate) {
    query = query.eq("date", selectedDate);
  } else {
    query = query.order("date", { ascending: false });
  }

  query = query.order("time", { ascending: true });

  if (collegeSectionId) {
    query = query.eq("collegeSectionsId", collegeSectionId);
  }

  const { data: facultyTaskData, error: facultyTaskError, count } = await query.range(from, to);

  if (facultyTaskError) {
    console.error("fetchFacultyTasksForLoggedInFaculty error:", facultyTaskError);
    throw facultyTaskError;
  }

  return {
    data: (facultyTaskData ?? []) as any,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}


export const fetchFacultyTasksByFacultyId = async (facultyId: number) => {
  const { data, error } = await supabase
    .from("faculty_tasks")
    .select(`*`)
    .eq("createdBy", facultyId)
    .is("deletedAt", null)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
};


export async function fetchFacultyTasksForStudent(params: {
  date: string;
  collegeAcademicYearId: number;
  collegeSectionsId: number;
}) {
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
      deletedAt,
      collegeAcademicYearId,
      collegeSectionsId
    `)
    .eq("date", params.date)
    .eq("collegeAcademicYearId", params.collegeAcademicYearId)
    .eq("collegeSectionsId", params.collegeSectionsId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("fetchFacultyTasksForStudent error:", error);
    return [];
  }

  return data ?? [];
}

export async function countActiveFacultyTasks(facultyId: number) {

  const today = new Date().toISOString().split("T")[0];

  const { count, error } = await supabase
    .from("faculty_tasks")
    .select("*", { count: "exact", head: true })
    .eq("createdBy", facultyId)
    .eq("date", today)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (error) {
    console.error("countActiveFacultyTasks error:", error);
    return 0;
  }

  return count ?? 0;
}
