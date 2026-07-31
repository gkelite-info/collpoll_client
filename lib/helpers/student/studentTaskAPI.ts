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
        .is("deletedAt", null)
        .order("date", { ascending: false })
        .order("time", { ascending: true });

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
    studentId: number
) {

    const now = new Date().toISOString();

    if (payload.studentTaskId) {

        const { data, error } = await supabase
            .from("student_tasks")
            .update({
                taskTitle: payload.taskTitle.trim(),
                description: payload.description.trim(),
                date: payload.date,
                time: payload.time,
                isActive: true,
                is_deleted: false,
                deletedAt: null,
                updatedAt: now,
            })
            .eq("studentTaskId", payload.studentTaskId)
            .eq("createdBy", studentId)
            .is("deletedAt", null)
            .select()
            .single();

        if (error) {
            console.error("updateStudentTask error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    }

    const { data, error } = await supabase
        .from("student_tasks")
        .insert({
            taskTitle: payload.taskTitle.trim(),
            description: payload.description.trim(),
            date: payload.date,
            time: payload.time,
            createdBy: studentId,
            isActive: true,
            is_deleted: false,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
        })
        .select()
        .single();

    if (error) {
        console.error("saveStudentTask error:", error);
        return { success: false, error };
    }

    return { success: true, data };
}

export async function deactivateStudentTask(studentTaskId: number) {
    const { error } = await supabase
        .from("student_tasks")
        .update({
            isActive: false,
            is_deleted: true,          // ← ADDED: was missing, causing is_deleted to stay false
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
        .is("deletedAt", null)
        .order("date", { ascending: false });

    if (error) {
        console.error("fetchStudentTasksForLoggedInStudent error:", error);
        throw error;
    }

    return data ?? [];
}

export async function updateStudentTask(
    payload: {
        studentTaskId: number;
        taskTitle: string;
        description: string;
        date: string;
        time: string;
    },
    studentId: number
) {
    const { data, error } = await supabase
        .from("student_tasks")
        .update({
            taskTitle: payload.taskTitle.trim(),
            description: payload.description.trim(),
            date: payload.date,
            time: payload.time,
            updatedAt: new Date().toISOString(),
        })
        .eq("studentTaskId", payload.studentTaskId)
        .eq("createdBy", studentId)
        .is("deletedAt", null)
        .select()
        .single();

    if (error) {
        console.error("updateStudentTask error:", error);
        return { success: false, error };
    }

    return { success: true, data };
}
