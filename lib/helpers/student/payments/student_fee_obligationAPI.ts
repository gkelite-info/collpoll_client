import { supabase } from "@/lib/supabaseClient";

export type StudentFeeObligationRow = {
    studentFeeObligationId: number;
    studentId: number;
    collegeSessionId: number;
    collegeAcademicYearId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    totalAmount: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchStudentFeeObligations(
    studentId: number,
    collegeSessionId: number,
    collegeAcademicYearId: number,
) {
    const { data, error } = await supabase
        .from("student_fee_obligation")
        .select(`
      studentFeeObligationId,
      studentId,
      collegeSessionId,
      collegeAcademicYearId,
      collegeEducationId,
      collegeBranchId,
      totalAmount,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("studentId", studentId)
        .eq("collegeSessionId", collegeSessionId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchStudentFeeObligations error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingStudentFeeObligation(
    studentId: number,
    collegeSessionId: number,
    collegeAcademicYearId: number,
) {
    const { data, error } = await supabase
        .from("student_fee_obligation")
        .select("studentFeeObligationId")
        .eq("studentId", studentId)
        .eq("collegeSessionId", collegeSessionId)
        .eq("collegeAcademicYearId", collegeAcademicYearId)
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

export async function saveStudentFeeObligation(
    payload: {
        studentId: number;
        collegeSessionId: number;
        collegeAcademicYearId: number;
        collegeEducationId: number;
        collegeBranchId: number;
        totalAmount: number;
    },
    adminId: number,
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("student_fee_obligation")
        .upsert(
            {
                studentId: payload.studentId,
                collegeSessionId: payload.collegeSessionId,
                collegeAcademicYearId: payload.collegeAcademicYearId,
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                totalAmount: payload.totalAmount,
                createdBy: adminId,
                updatedAt: now,
            },
            {
                onConflict:
                    "studentId,collegeSessionId,collegeAcademicYearId",
            },
        )
        .select("studentFeeObligationId")
        .single();

    if (error) {
        console.error("saveStudentFeeObligation error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        studentFeeObligationId: data.studentFeeObligationId,
    };
}

export async function deactivateStudentFeeObligation(
    studentFeeObligationId: number,
) {
    const { error } = await supabase
        .from("student_fee_obligation")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("studentFeeObligationId", studentFeeObligationId);

    if (error) {
        console.error(
            "deactivateStudentFeeObligation error:",
            error,
        );
        return { success: false };
    }

    return { success: true };
}
