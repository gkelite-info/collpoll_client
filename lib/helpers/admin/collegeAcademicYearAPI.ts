import { supabase } from "@/lib/supabaseClient";


export type CollegeAcademicYearRow = {
    collegeAcademicYearId: number;
    collegeAcademicYear: string;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeId: number;
    createdBy: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchCollegeAcademicYears(
    collegeId: number,
    collegeBranchId: number
) {
    const { data, error } = await supabase
        .from("college_academic_year")
        .select(`
      collegeAcademicYearId,
      collegeAcademicYear,
      collegeEducationId,
      collegeBranchId,
      collegeId,
      createdBy,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("collegeBranchId", collegeBranchId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("collegeAcademicYearId", { ascending: true });

    if (error) {
        console.error("fetchCollegeAcademicYears error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchAcademicYearOptions(
    collegeId: number,
    collegeBranchId: number
) {
    const data = await fetchCollegeAcademicYears(
        collegeId,
        collegeBranchId
    );

    return data.map((row) => ({
        id: row.collegeAcademicYearId,
        label: row.collegeAcademicYear,
        value: row.collegeAcademicYearId,
        raw: row.collegeAcademicYear,
    }));
}

export async function fetchExistingAcademicYear(
    collegeAcademicYear: any,
    collegeBranchId: number,
    collegeId: number
) {
    const { data, error } = await supabase
        .from("college_academic_year")
        .select("collegeAcademicYearId")
        .eq("collegeBranchId", collegeBranchId)
        .eq("collegeId", collegeId)
        .eq("collegeAcademicYear", collegeAcademicYear)
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

export async function saveCollegeAcademicYear(
    payload: {
        id?: number;
        collegeAcademicYear: string;
        collegeEducationId: number;
        collegeBranchId: number;
        collegeId: number;
    },
    adminId: number
) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("college_academic_year")
        .upsert(
            {
                collegeAcademicYear: payload.collegeAcademicYear.trim(),
                collegeEducationId: payload.collegeEducationId,
                collegeBranchId: payload.collegeBranchId,
                collegeId: payload.collegeId,
                createdBy: adminId,
                createdAt: now,
                updatedAt: now,
            },
            { onConflict: "collegeEducationId, collegeBranchId, collegeAcademicYear, collegeId" }
        )
        .select("collegeAcademicYearId")
        .single();

    if (error) {
        console.error("saveCollegeAcademicYear error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        collegeAcademicYearId: data.collegeAcademicYearId,
    };
}


export async function deactivateCollegeAcademicYear(
    collegeAcademicYearId: number
) {
    const { error } = await supabase
        .from("college_academic_year")
        .update({
            isActive: false,
            deletedAt: new Date().toISOString(),
        })
        .eq("collegeAcademicYearId", collegeAcademicYearId);

    if (error) {
        console.error("deactivateCollegeAcademicYear error:", error);
        return { success: false };
    }

    return { success: true };
}
