import { supabase } from "@/lib/supabaseClient";

type FinanceManagerJoin = {
    financeManagerId: number;
    userId: number;
    collegeId: number;
    collegeEducationId: number;
    isActive: boolean;
    type: "executive" | "manager";

    college: {
        collegeName: string;
    };

    college_education: {
        collegeEducationType: string;
    };
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
      college_education:collegeEducationId!inner (
        collegeEducationType
      )
    `)
        .eq("userId", userId)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .single<FinanceManagerJoin>();

    if (error) throw error;

    const { data: educationTypes, error: educationTypesError } = await supabase
        .from("finance_manager_education_types")
        .select(`
            collegeEducationId,
            college_education:collegeEducationId (
                collegeEducationType
            )
        `)
        .eq("financeManagerId", data.financeManagerId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .returns<FinanceManagerEducationTypeJoin[]>();

    if (educationTypesError) throw educationTypesError;

    const collegeEducationIds =
        educationTypes && educationTypes.length > 0
            ? educationTypes.map((education) => education.collegeEducationId)
            : [data.collegeEducationId];

    const collegeEducationTypes =
        educationTypes && educationTypes.length > 0
            ? educationTypes
                  .map(
                      (education) =>
                          education.college_education?.collegeEducationType,
                  )
                  .filter((educationType): educationType is string =>
                      Boolean(educationType),
                  )
            : [data.college_education.collegeEducationType];

    return {
        financeManagerId: data.financeManagerId,
        userId: data.userId,
        collegeId: data.collegeId,
        collegeEducationId: data.collegeEducationId,
        collegeEducationIds,
        collegeName: data.college.collegeName,
        collegeEducationType: data.college_education.collegeEducationType,
        collegeEducationTypes,
        isActive: data.isActive,
        type: data.type,
    };
}
