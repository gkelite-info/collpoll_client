import { supabase } from "@/lib/supabaseClient";

type FacultyTaskPayload = {
  facultytaskTitle: string;
  facultytaskDescription: string;
  facultytaskcreatedDate: string; // YYYY-MM-DD
  facultytaskassignedTime: string; // HH:mm (24-hour)
};

export const insertFacultyTask = async (
  payload: FacultyTaskPayload
) => {
  try {
    // 1️⃣ Get authenticated user
    const { data: authData } = await supabase.auth.getUser();
    const auth_id = authData?.user?.id;

    if (!auth_id) throw new Error("User not authenticated");

    // 2️⃣ Get facultyId from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("userId")
      .eq("auth_id", auth_id)
      .single();

    if (userError || !userData)
      throw new Error("Faculty not found");

    const facultyId = userData.userId;

    const now = new Date().toISOString();

    // 3️⃣ Insert faculty task
    const { data, error } = await supabase
      .from("facultyTasks")
      .insert({
        facultyId,
        facultytaskTitle: payload.facultytaskTitle,
        facultytaskDescription: payload.facultytaskDescription,
        facultytaskcreatedDate: payload.facultytaskcreatedDate,
        facultytaskassignedTime: payload.facultytaskassignedTime,
        is_deleted: false,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Faculty task created successfully",
      data,
    };
  } catch (err: any) {
    console.error("INSERT FACULTY TASK ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};


export const fetchFacultyTasks = async (facultyId: number) => {
  try {
    const { data, error } = await supabase
      .from("facultyTasks")
      .select(`
        facultytaskId,
        facultytaskTitle,
        facultytaskDescription,
        facultytaskcreatedDate,
        facultytaskassignedTime,
        is_deleted
      `)
      .eq("facultyId", facultyId)
      .eq("is_deleted", false)
      .order("facultytaskcreatedDate", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      tasks: data ?? [],
    };
  } catch (err: any) {
    console.error("FETCH FACULTY TASKS ERROR:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};


export const updateFacultyTask = async (
  facultytaskId: number,
  data: {
    facultytaskTitle: string;
    facultytaskDescription: string;
    facultytaskcreatedDate: string;
    facultytaskassignedTime: string;
  }
) => {
  const { error } = await supabase
    .from("facultyTasks")
    .update({
      ...data,
      updatedAt: new Date().toISOString(), // 👈 keep DB consistent
    })
    .eq("facultytaskId", facultytaskId)
    .eq("is_deleted", false);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};