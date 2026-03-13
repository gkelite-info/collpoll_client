import { supabase } from "@/lib/supabaseClient";

export type StudentTaskRow = {
    studentTaskId: number;
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

export async function fetchStudentTasks(studentId: number) {
    const { data, error } = await supabase
        .from("student_tasks")
        .select(`
      studentTaskId,
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
        .eq("createdBy", studentId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("date", { ascending: true });

    if (error) {
        console.error("fetchStudentTasks error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingStudentTask(
    studentId: number,
    taskTitle: string,
    date: string,
) {
    const { data, error } = await supabase
        .from("student_tasks")
        .select("studentTaskId")
        .eq("createdBy", studentId)
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

export async function saveStudentTask(
    payload: {
        studentTaskId?: number;
        taskTitle: string;
        description: string;
        date: string;
        time: string;
    },
    studentId: number,
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        taskTitle: payload.taskTitle.trim(),
        description: payload.description.trim(),
        date: payload.date,
        time: payload.time,
        updatedAt: now,
    };

    if (!payload.studentTaskId) {
        upsertPayload.createdBy = studentId;
        upsertPayload.createdAt = now;
    } else {
        upsertPayload.studentTaskId = payload.studentTaskId;
    }

    const { data, error } = await supabase
        .from("student_tasks")
        .upsert(upsertPayload, {
            onConflict: "studentTaskId",
        })
        .select("studentTaskId")
        .single();

    if (error) {
        console.error("saveStudentTask error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        studentTaskId: data.studentTaskId,
    };
}

export async function deactivateStudentTask(studentTaskId: number) {
    const { error } = await supabase
        .from("student_tasks")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("studentTaskId", studentTaskId);

    if (error) {
        console.error("deactivateStudentTask error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchStudentTasksForLoggedInStudent(
    studentId: number,
) {
    const { data, error } = await supabase
        .from("student_tasks")
        .select(`
      studentTaskId,
      taskTitle,
      description,
      date,
      time
    `)
        .eq("createdBy", studentId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("date", { ascending: true });

    if (error) {
        console.error("fetchStudentTasksForLoggedInStudent error:", error);
        throw error;
    }

    return data ?? [];
}