import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
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
    collegeId: number | null,
    collegeBranchId: number | null
) {
    let query = supabase
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
        .eq("isActive", true)
        .is("deletedAt", null);

    if (collegeBranchId === null) {
        query = query.is("collegeBranchId", null);
    } else {
        query = query.eq("collegeBranchId", collegeBranchId);
    }

    const { data, error } = await query.order("collegeAcademicYearId", { ascending: true });

    if (error) {
        console.error("fetchCollegeAcademicYears error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchAcademicYearOptionsDirectly(
    collegeId: number,
    collegeBranchId: number | null
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

export async function fetchAcademicYearOptionsBulkDirectly(
    collegeId: number,
    collegeBranchIds: number[]
) {
    if (collegeBranchIds.length === 0) return [];

    const { data, error } = await supabase
        .from("college_academic_year")
        .select(`collegeAcademicYearId, collegeAcademicYear, collegeBranchId`)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .in("collegeBranchId", collegeBranchIds)
        .order("collegeAcademicYearId", { ascending: true });

    if (error) {
        console.error("fetchAcademicYearOptionsBulkDirectly error:", error);
        return [];
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
    collegeBranchId: number | null,
    collegeId: number
) {
    let query = supabase
        .from("college_academic_year")
        .select("collegeAcademicYearId")
        .eq("collegeId", collegeId)
        .eq("collegeAcademicYear", collegeAcademicYear)
        .is("deletedAt", null);

    if (collegeBranchId === null) {
        query = query.is("collegeBranchId", null);
    } else {
        query = query.eq("collegeBranchId", collegeBranchId);
    }

    const { data, error } = await query.single();

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
        collegeBranchId: number | null;
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
        throw error;
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


export async function fetchAcademicYearOptionsForAdmin(
    userId: number | null,
    collegeBranchId: number | null
) {
    const { collegeId } = await fetchAdminContext(userId);

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

export async function fetchAcademicYearOptionsForAdminBulk(
    userId: number | null,
    collegeBranchIds: number[]
) {
    if (collegeBranchIds.length === 0) return [];
    
    const { collegeId } = await fetchAdminContext(userId);

    const { data, error } = await supabase
        .from("college_academic_year")
        .select(`collegeAcademicYearId, collegeAcademicYear, collegeBranchId`)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .in("collegeBranchId", collegeBranchIds)
        .order("collegeAcademicYearId", { ascending: true });

    if (error) {
        console.error("fetchAcademicYearOptionsForAdminBulk error:", error);
        return [];
    }

    return data ?? [];
}