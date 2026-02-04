import { supabase } from "@/lib/supabaseClient";

type InsertSubmissionParams = {
    assignmentId: number;
    filePath: string;
};

export async function insertAssignmentSubmission({
    assignmentId,
    filePath,
}: InsertSubmissionParams) {
    try {
        // 1️⃣ Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 2️⃣ Internal user
        const { data: userRow, error: userErr } = await supabase
            .from("users")
            .select("userId")
            .eq("auth_id", user.id)
            .single();

        if (userErr || !userRow) {
            throw new Error("Internal user not found");
        }

        // 3️⃣ Student
        const { data: student, error: studentErr } = await supabase
            .from("students")
            .select("studentId")
            .eq("userId", userRow.userId)
            .single();

        if (studentErr || !student) {
            throw new Error("Student not found");
        }

        // 4️⃣ Check existing submission (may or may not exist)
        const { data: existing } = await supabase
            .from("student_assignments_submission")
            .select("studentAssignmentSubmissionId")
            .eq("studentId", student.studentId)
            .eq("assignmentId", assignmentId)
            .is("deletedAt", null)
            .maybeSingle(); // ✅ IMPORTANT

        const payload = {
            studentId: student.studentId,
            assignmentId,
            submittedOn: new Date().toISOString().split("T")[0],
            file: filePath,
            status: "Pending",
            updatedAt: new Date().toISOString(),
        };

        // 5️⃣ UPDATE if exists, else INSERT
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

export async function getSubmissionForAssignment(assignmentId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("AUTH USER:", user?.id);

    if (!user) return null;

    const { data: userRow } = await supabase
        .from("users")
        .select("userId")
        .eq("auth_id", user.id)
        .single();

    console.log("USER ROW:", userRow);

    if (!userRow) return null;

    const { data: student } = await supabase
        .from("students")
        .select("studentId")
        .eq("userId", userRow.userId)
        .single();

    console.log("STUDENT:", student);

    if (!student) return null;

    console.log("QUERY PARAMS:", {
        studentId: student.studentId,
        assignmentId,
    });

    const { data } = await supabase
        .from("student_assignments_submission")
        .select("file, studentId, assignmentId, deletedAt")
        .eq("studentId", student.studentId)
        .eq("assignmentId", assignmentId)
        .is("deletedAt", null)
        .maybeSingle();

    console.log("SUBMISSION ROW:", data);

    return data?.file ?? null;
}