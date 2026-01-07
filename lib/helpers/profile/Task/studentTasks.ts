import { supabase } from "@/lib/supabaseClient";

export async function addStudentTask(payload: {
  studentId: number;
  studenttaskTitle: string;
  studenttaskDescription: string;
  studenttaskcreateDate: string; // YYYY-MM-DD
  studenttaskassignedTime?: string;
}) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("studentTasks")
    .insert([
      {
        studentId: payload.studentId,
        studenttaskTitle: payload.studenttaskTitle,
        studenttaskDescription: payload.studenttaskDescription,
        studenttaskcreateDate: payload.studenttaskcreateDate,
        studenttaskassignedTime: payload.studenttaskassignedTime,
        createdAt: now,   // ✅ REQUIRED
        updatedAt: now,   // ✅ REQUIRED
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function getStudentTasks(studentId: number) {
  const { data, error } = await supabase
    .from("studentTasks")
    .select(`
      studenttaskId,
      studenttaskTitle,
      studenttaskDescription,
      studenttaskcreateDate,
      studenttaskassignedTime
    `)
    .eq("studentId", studentId)
    .eq("is_deleted", false)
    .order("studenttaskcreateDate", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateStudentTask(
  studenttaskId: number,
  payload: {
    studenttaskTitle: string;
    studenttaskDescription: string;
    studenttaskcreateDate: string; // YYYY-MM-DD
    studenttaskassignedTime: string; // HH:mm:ss
  }
) {
  const { data, error } = await supabase
    .from("studentTasks")
    .update({
      studenttaskTitle: payload.studenttaskTitle,
      studenttaskDescription: payload.studenttaskDescription,
      studenttaskcreateDate: payload.studenttaskcreateDate,
      studenttaskassignedTime: payload.studenttaskassignedTime,
      updatedAt: new Date().toISOString(),
    })
    .eq("studenttaskId", studenttaskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudentTask(studenttaskId: number) {
  const { data, error } = await supabase
    .from("studentTasks")
    .update({
      is_deleted: true,
      deletedAt: new Date().toISOString(),
    })
    .eq("studenttaskId", studenttaskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
