import { supabase } from "@/lib/supabaseClient";

export async function createStudentAcademicHistory(payload: {
    studentId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number;
    collegeSectionsId: number;
    promotedBy: number;
    isCurrent?: boolean;
    createdAt: string;
    updatedAt: string;
}) {
    const { error } = await supabase
        .from("student_academic_history")
        .insert({
            ...payload,
            isCurrent: payload.isCurrent ?? true,
        });

    if (error) {
        throw new Error("Failed to create student academic history");
    }
}
