import { supabase } from "@/lib/supabaseClient";

export const getFinanceCollegeStructure = async (userId: number) => {
    try {
        /* 1️⃣ Finance base mapping */
        const { data: financeData, error: financeError } = await supabase
            .from("finance_manager")
            .select(`
                collegeId,
                collegeEducationId
            `)
            .eq("userId", userId)
            .eq("is_deleted", false)
            .single();

        if (financeError || !financeData) {
            throw financeError || new Error("Finance manager not found");
        }

        const collegeId = financeData.collegeId;
        const collegeEducationId = financeData.collegeEducationId;

        /* ✅ 2️⃣ Get College Name (SAFE QUERY) */
        const { data: collegeData, error: collegeError } = await supabase
            .from("colleges")
            .select("collegeName")
            .eq("collegeId", collegeId)
            .single();

        if (collegeError) throw collegeError;

        /* ✅ 3️⃣ Get Education Type (SAFE QUERY) */
        const { data: educationData, error: educationError } = await supabase
            .from("college_education")
            .select("collegeEducationType")
            .eq("collegeEducationId", collegeEducationId)
            .single();

        if (educationError) throw educationError;

        /* 4️⃣ Branches (UNCHANGED) */
        const { data: branches, error: branchError } = await supabase
            .from("college_branch")
            .select(`
                collegeBranchId,
                collegeBranchType,
                collegeBranchCode
            `)
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("isActive", true);

        if (branchError) throw branchError;

        /* 5️⃣ Academic Years (UNCHANGED) */
        const { data: academicYears, error: yearError } = await supabase
            .from("college_academic_year")
            .select(`
                collegeAcademicYearId,
                collegeAcademicYear,
                collegeBranchId
            `)
            .eq("collegeId", collegeId)
            .eq("collegeEducationId", collegeEducationId)
            .eq("isActive", true);

        if (yearError) throw yearError;

        return {
            collegeId,
            collegeName: collegeData?.collegeName ?? "",
            collegeEducationId,
            educationType: educationData?.collegeEducationType ?? "",
            branches: branches ?? [],
            academicYears: academicYears ?? [],
        };

    } catch (error) {
        console.error("Finance college structure error:", error);
        throw error;
    }
};
