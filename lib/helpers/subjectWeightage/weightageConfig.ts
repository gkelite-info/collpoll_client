import { supabase } from "@/lib/supabaseClient";

export type FacultyWeightageConfigRow = {
    facultyWeightageConfigId: number;
    facultyId: number | null;
    adminId: number | null;

    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeSubjectId: number;
    collegeSectionsId: number;
    collegeSemesterId: number;

    totalPercentage: number;

    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchExistingFacultyWeightageConfig(
    collegeSubjectId: number,
    collegeSectionsId: number,
    collegeSemesterId: number | null | undefined,
) {
    let query = supabase
        .from("faculty_weightage_configs")
        .select("facultyWeightageConfigId")
        .eq("collegeSubjectId", collegeSubjectId)
        .eq("collegeSectionsId", collegeSectionsId)
        .is("deletedAt", null);

    if (collegeSemesterId) {
        query = query.eq("collegeSemesterId", collegeSemesterId);
    } else {
        query = query.is("collegeSemesterId", null);
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

export async function fetchFacultyWeightageConfigs(
    collegeSubjectId: number,
    collegeSectionsId: number,
    collegeSemesterId: number | null | undefined,
) {
    let query = supabase
        .from("faculty_weightage_configs")
        .select(`
      facultyWeightageConfigId,
      facultyId,
      adminId,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      collegeSubjectId,
      collegeSectionsId,
      collegeSemesterId,
      totalPercentage,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeSubjectId", collegeSubjectId)
        .eq("collegeSectionsId", collegeSectionsId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (collegeSemesterId) {
        query = query.eq("collegeSemesterId", collegeSemesterId);
    } else {
        query = query.is("collegeSemesterId", null);
    }

    const { data, error } = await query;

    if (error) {
        console.error("fetchFacultyWeightageConfigs error:", error);
        throw error;
    }

    return data ?? [];
}

export async function saveFacultyWeightageConfig(
    payload: {
        facultyWeightageConfigId?: number;
        collegeId: number;
        collegeEducationId: number;
        collegeBranchId: number;
        collegeSubjectId: number;
        collegeSectionsId: number;
        collegeSemesterId: number;
        totalPercentage: number;
    },
    actor: {
        facultyId?: number;
        adminId?: number;
    }
) {
    const now = new Date().toISOString();

    const { data: subjectData } = await supabase
        .from("college_subjects")
        .select("collegeEducationId, collegeBranchId, collegeSemesterId")
        .eq("collegeSubjectId", payload.collegeSubjectId)
        .single();

    const basePayload: any = {
        collegeId: payload.collegeId,
        collegeEducationId: subjectData?.collegeEducationId || payload.collegeEducationId,
        collegeBranchId: subjectData?.collegeBranchId || payload.collegeBranchId,
        collegeSubjectId: payload.collegeSubjectId,
        collegeSectionsId: payload.collegeSectionsId,
        totalPercentage: payload.totalPercentage,
        updatedAt: now,
    };

    if (subjectData && subjectData.collegeSemesterId !== undefined) {
        basePayload.collegeSemesterId = subjectData.collegeSemesterId;
    } else {
        basePayload.collegeSemesterId = payload.collegeSemesterId;
    }

    if (actor.facultyId) basePayload.facultyId = actor.facultyId;
    if (actor.adminId) basePayload.adminId = actor.adminId;

    if (!payload.facultyWeightageConfigId) {
        basePayload.createdAt = now;

        const { data, error } = await supabase
            .from("faculty_weightage_configs")
            .insert([basePayload])
            .select("facultyWeightageConfigId")
            .single();

        if (error) {
            console.error("saveFacultyWeightageConfig error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            facultyWeightageConfigId: data.facultyWeightageConfigId,
        };
    }

    const { error } = await supabase
        .from("faculty_weightage_configs")
        .update(basePayload)
        .eq("facultyWeightageConfigId", payload.facultyWeightageConfigId);

    if (error) {
        console.error("saveFacultyWeightageConfig error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        facultyWeightageConfigId: payload.facultyWeightageConfigId,
    };
}

export async function deactivateFacultyWeightageConfig(
    facultyWeightageConfigId: number
) {
    const { error } = await supabase
        .from("faculty_weightage_configs")
        .update({
            deletedAt: new Date().toISOString(),
        })
        .eq("facultyWeightageConfigId", facultyWeightageConfigId);

    if (error) {
        console.error("deactivateFacultyWeightageConfig error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function fetchFacultyWeightageConfigsByFacultyId(
    facultyId: number
) {
    const { data, error } = await supabase
        .from("faculty_weightage_configs")
        .select(`
      facultyWeightageConfigId,
      collegeSubjectId,
      collegeSectionsId,
      collegeSemesterId,
      totalPercentage,
      createdAt,
      updatedAt
    `)
        .eq("facultyId", facultyId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchFacultyWeightageConfigsByFacultyId error:", error);
        throw error;
    }

    return data ?? [];
}