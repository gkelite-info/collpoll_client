import { supabase } from "@/lib/supabaseClient";

export type CollegeSubjectRow = {
    collegeSubjectId: number;
    subjectName: string;
    subjectCode: string;
    subjectKey?: string | null;
    credits: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId?: number | null;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    image?: string | null;
};


export async function fetchCollegeSubjects(params: {
    collegeId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId?: number | null;
}) {
    const { data, error } = await supabase
        .from("college_subjects")
        .select(`
      collegeSubjectId,
      subjectName,
      subjectCode,
      subjectKey,
      credits,
      collegeEducationId,
      collegeBranchId,
      collegeAcademicYearId,
      collegeSemesterId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt,
      image
    `)
        .eq("collegeId", params.collegeId)
        .eq("collegeBranchId", params.collegeBranchId)
        .eq("collegeAcademicYearId", params.collegeAcademicYearId)
        .eq("collegeSemesterId", params.collegeSemesterId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("subjectName", { ascending: true });

    if (error) {
        console.error("fetchCollegeSubjects error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchExistingCollegeSubject(params: {
    collegeId: number;
    collegeBranchId: number;
    collegeAcademicYearId: number;
    collegeSemesterId?: number | null;
    subjectCode: string;
}) {
    const { data, error } = await supabase
        .from("college_subjects")
        .select("collegeSubjectId")
        .eq("collegeId", params.collegeId)
        .eq("collegeBranchId", params.collegeBranchId)
        .eq("collegeAcademicYearId", params.collegeAcademicYearId)
        .eq("collegeSemesterId", params.collegeSemesterId)
        .eq("subjectCode", params.subjectCode.trim())
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

export async function saveCollegeSubject(
    payload: {
        collegeSubjectId?: number;
        subjectName: string;
        subjectCode: string;
        subjectKey?: string;
        credits: number;
        collegeEducationId: number;
        collegeBranchId: number;
        collegeAcademicYearId: number;
        collegeSemesterId?: number | null;
        collegeId: number;
        image?: string | null;
    },
    adminId: number
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        subjectName: payload.subjectName.trim(),
        subjectCode: payload.subjectCode.trim(),
        subjectKey: payload.subjectKey ?? null,
        credits: payload.credits,
        collegeEducationId: payload.collegeEducationId,
        collegeBranchId: payload.collegeBranchId,
        collegeAcademicYearId: payload.collegeAcademicYearId,
        collegeSemesterId: payload.collegeSemesterId ?? null,
        collegeId: payload.collegeId,
        image: payload.image ?? null,
        updatedAt: now,
    };

    if (!payload.collegeSubjectId) {
        upsertPayload.createdBy = adminId;
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("college_subjects")
            .insert([upsertPayload])
            .select("collegeSubjectId")
            .single();

        if (error) {
            console.error("saveCollegeSubject insert error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            collegeSubjectId: data.collegeSubjectId,
        };
    }

    const { error } = await supabase
        .from("college_subjects")
        .update(upsertPayload)
        .eq("collegeSubjectId", payload.collegeSubjectId);

    if (error) {
        console.error("saveCollegeSubject update error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeSubjectId: payload.collegeSubjectId,
    };
}

export async function deactivateCollegeSubject(collegeSubjectId: number) {
    const { error } = await supabase
        .from("college_subjects")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeSubjectId", collegeSubjectId);

    if (error) {
        console.error("deactivateCollegeSubject error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchCollegeSubjectById(collegeSubjectId: number) {
    const { data, error } = await supabase
        .from("college_subjects")
        .select("*")
        .eq("collegeSubjectId", collegeSubjectId)
        .is("deletedAt", null)
        .single();

    if (error) {
        console.error("fetchCollegeSubjectById error:", error);
        throw error;
    }

    return data;
}