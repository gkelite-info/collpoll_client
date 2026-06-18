import { supabase } from "@/lib/supabaseClient";
import { getTestingSession } from "../../testingAuth";

type InsertSubmissionParams = {
    assignmentId: number;
    filePath: string;
    studentId?: number;
};

export async function insertAssignmentSubmission({
    assignmentId,
    filePath,
    studentId: passedStudentId,
}: InsertSubmissionParams) {
    try {
        let finalStudentId = passedStudentId;

        if (!finalStudentId) {
            /*
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data: userRow, error: userErr } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", user.id)
                .single();

            if (userErr || !userRow) {
                throw new Error("Internal user not found");
            }

            const { data: student, error: studentErr } = await supabase
                .from("students")
                .select("studentId")
                .eq("userId", userRow.userId)
                .single();

            if (studentErr || !student) {
                throw new Error("Student not found");
            }
            finalStudentId = student.studentId;
            */
            const testEmail = await getTestingSession();
            if (!testEmail) throw new Error("User not authenticated");

            const { data: userRow, error: userErr } = await supabase
                .from("users")
                .select("userId")
                .eq("email", testEmail)
                .single();

            if (userErr || !userRow) {
                throw new Error("Internal user not found");
            }

            const { data: student, error: studentErr } = await supabase
                .from("students")
                .select("studentId")
                .eq("userId", userRow.userId)
                .single();

            if (studentErr || !student) {
                throw new Error("Student not found");
            }
            finalStudentId = student.studentId;
        }

        const { data: existing } = await supabase
            .from("student_assignments_submission")
            .select("studentAssignmentSubmissionId")
            .eq("studentId", finalStudentId)
            .eq("assignmentId", assignmentId)
            .is("deletedAt", null)
            .maybeSingle();

        const payload = {
            studentId: finalStudentId,
            assignmentId,
            submittedOn: new Date().toISOString().split("T")[0],
            file: filePath,
            status: "Pending",
            updatedAt: new Date().toISOString(),
        };

        const query = existing
            ? supabase
                .from("student_assignments_submission")
                .update(payload)
                .eq(
                    "studentAssignmentSubmissionId",
                    existing.studentAssignmentSubmissionId
                )
            : supabase
                .from("student_assignments_submission")
                .insert({
                    ...payload,
                    createdAt: new Date().toISOString(),
                });

        const { data, error } = await query.select().single();
        if (error) throw error;

        return { success: true, data };

    } catch (err: any) {
        console.error("❌ Submission upsert failed:", err);
        return { success: false, error: err.message };
    }
}

export async function getSubmissionForAssignment(assignmentId: number, passedStudentId?: number) {
    let finalStudentId = passedStudentId;

    if (!finalStudentId) {
        /*
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: userRow } = await supabase
            .from("users")
            .select("userId")
            .eq("auth_id", user.id)
            .single();

        if (!userRow) return null;

        const { data: student } = await supabase
            .from("students")
            .select("studentId")
            .eq("userId", userRow.userId)
            .single();

        if (!student) return null;
        finalStudentId = student.studentId;
        */
        const testEmail = await getTestingSession();
        if (!testEmail) return null;

        const { data: userRow } = await supabase
            .from("users")
            .select("userId")
            .eq("email", testEmail)
            .single();

        if (!userRow) return null;

        const { data: student } = await supabase
            .from("students")
            .select("studentId")
            .eq("userId", userRow.userId)
            .single();

        if (!student) return null;
        finalStudentId = student.studentId;
    }

    const { data } = await supabase
        .from("student_assignments_submission")
        .select("file, studentId, assignmentId, deletedAt")
        .eq("studentId", finalStudentId)
        .eq("assignmentId", assignmentId)
        .is("deletedAt", null)
        .maybeSingle();

    return data?.file ?? null;
}

export async function getSubmissionDetailsForAssignment(assignmentId: number, passedStudentId?: number) {
    let finalStudentId = passedStudentId;

    if (!finalStudentId) {
        /*
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: userRow } = await supabase
            .from("users")
            .select("userId")
            .eq("auth_id", user.id)
            .single();

        if (!userRow) return null;

        const { data: student } = await supabase
            .from("students")
            .select("studentId")
            .eq("userId", userRow.userId)
            .single();

        if (!student) return null;
        finalStudentId = student.studentId;
        */
        const testEmail = await getTestingSession();
        if (!testEmail) return null;

        const { data: userRow } = await supabase
            .from("users")
            .select("userId")
            .eq("email", testEmail)
            .single();

        if (!userRow) return null;

        const { data: student } = await supabase
            .from("students")
            .select("studentId")
            .eq("userId", userRow.userId)
            .single();

        if (!student) return null;
        finalStudentId = student.studentId;
    }

    const { data } = await supabase
        .from("student_assignments_submission")
        .select("file, marksScored, status")
        .eq("studentId", finalStudentId)
        .eq("assignmentId", assignmentId)
        .is("deletedAt", null)
        .maybeSingle();

    return data ?? null;
}
