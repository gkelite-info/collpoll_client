import { supabase } from "@/lib/supabaseClient";

type FinanceManagerJoin = {
    financeManagerId: number;
    userId: number;
    collegeId: number;
    collegeEducationId: number | null;
    isActive: boolean;
    type: "executive" | "manager";

    college: {
        collegeName: string;
    };
    college_education: {
        collegeEducationType: string;
    } | null;
};

type FinanceManagerEducationTypeJoin = {
    collegeEducationId: number;
    college_education: {
        collegeEducationType: string;
    } | null;
};

export async function fetchFinanceManagerContext(userId: number) {
    const { data, error } = await supabase
        .from("finance_manager")
        .select(`
      financeManagerId,
      userId,
      collegeId,
      collegeEducationId,
      isActive,
      type,
      college:collegeId!inner (
        collegeName
      ),
      college_education:collegeEducationId (
        collegeEducationType
      )
    `)
        .eq("userId", userId)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .single<FinanceManagerJoin>();

    if (error) throw error;

    const { data: educationTypes, error: educationTypesError } = await supabase
        .from("college_education")
        .select(`
            collegeEducationId,
            collegeEducationType,
            finance_manager_education_types!inner (
                financeManagerId,
                isActive,
                is_deleted,
                deletedAt
            )
        `)
        .eq("collegeId", data.collegeId)
        .eq("finance_manager_education_types.financeManagerId", data.financeManagerId)
        .eq("finance_manager_education_types.isActive", true)
        .eq("finance_manager_education_types.is_deleted", false)
        .is("finance_manager_education_types.deletedAt", null)
        .returns<any[]>();

    const mappedEducationTypes = educationTypesError ? [] : (educationTypes ?? []);

    let collegeEducationIds: number[] =
        mappedEducationTypes.length > 0
            ? mappedEducationTypes.map((education) => education.collegeEducationId)
            : [];

    let collegeEducationTypes: string[] =
        mappedEducationTypes.length > 0
            ? mappedEducationTypes.map((education) => education.collegeEducationType)
            : [];

    if (
        collegeEducationIds.length === 0 &&
        data.collegeEducationId &&
        data.college_education?.collegeEducationType
    ) {
        collegeEducationIds = [data.collegeEducationId];
        collegeEducationTypes = [data.college_education.collegeEducationType];
    }

    // Fallback: If no mappings exist in finance_manager_education_types, fetch all education types for this college
    if (collegeEducationIds.length === 0) {
        const { data: fallbackTypes } = await supabase
            .from("college_education")
            .select("collegeEducationId, collegeEducationType")
            .eq("collegeId", data.collegeId)
            .eq("isActive", true)
            .is("deletedAt", null)
            .returns<any[]>();

        if (fallbackTypes && fallbackTypes.length > 0) {
            collegeEducationIds = fallbackTypes.map((e: any) => e.collegeEducationId);
            collegeEducationTypes = fallbackTypes.map((e: any) => e.collegeEducationType);
        }
    }
    const primaryCollegeEducationType = collegeEducationTypes.length > 0 ? collegeEducationTypes[0] : null;
    const primaryCollegeEducationId = collegeEducationIds.length > 0 ? collegeEducationIds[0] : null;

    return {
        financeManagerId: data.financeManagerId,
        userId: data.userId,
        collegeId: data.collegeId,
        collegeEducationId: primaryCollegeEducationId,
        collegeEducationIds,
        collegeName: data.college.collegeName,
        collegeEducationType: primaryCollegeEducationType,
        collegeEducationTypes,
        isActive: data.isActive,
        type: data.type,
    };
}
