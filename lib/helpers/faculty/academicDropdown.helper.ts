import { supabase } from "@/lib/supabaseClient";

type AcademicDropdownParams = {
    collegeId: number;

    educationId?: number;
    branchId?: number;
    academicYearId?: number;
    semester?: number;

    type:
    | "education"
    | "branch"
    | "academicYear"
    | "semester"
    | "subject"
    | "section";
};

export async function fetchAcademicDropdowns(params: AcademicDropdownParams) {
    const {
        type,
        collegeId,
        educationId,
        branchId,
        academicYearId,
        semester,
    } = params;

    switch (type) {
        /* ===================== EDUCATION ===================== */
        case "education": {
            const { data, error } = await supabase
                .from("college_education")
                .select("collegeEducationId, collegeEducationType")
                .eq("collegeId", collegeId)
                .eq("isActive", true)
                .order("collegeEducationType");

            if (error) throw error;
            return data;
        }

        /* ===================== BRANCH (depends on education) ===================== */
        case "branch": {
            if (!educationId) return [];

            const { data, error } = await supabase
                .from("college_branch")
                .select("collegeBranchId, collegeBranchType, collegeBranchCode")
                .eq("collegeId", collegeId)
                .eq("collegeEducationId", educationId)
                .eq("isActive", true)
                .order("collegeBranchType");

            if (error) throw error;
            return data;
        }


        /* ===================== YEAR (depends on education + branch) ===================== */
        case "academicYear": {
            if (!educationId || !branchId) return [];

            const { data, error } = await supabase
                .from("college_academic_year")
                .select("collegeAcademicYearId, collegeAcademicYear")
                .eq("collegeId", collegeId)
                .eq("collegeEducationId", educationId)
                .eq("collegeBranchId", branchId)
                .order("collegeAcademicYear");

            if (error) throw error;
            return data;
        }

        /* ===================== SEMESTER (depends on education + year) ===================== */
        case "semester": {
            if (!educationId || !academicYearId) return [];

            const { data } = await supabase
                .from("college_semester")
                .select("collegeSemesterId, collegeSemester")
                .eq("collegeId", collegeId)
                .eq("collegeEducationId", educationId)
                .eq("collegeAcademicYearId", academicYearId)
                .eq("isActive", true)
                .order("collegeSemester");

            return data;
        }


        /* ===================== SUBJECT (depends on education + year + semester) ===================== */
        case "subject": {
            if (
                !educationId ||
                !branchId ||
                !academicYearId ||
                !semester || // this is collegeSemesterId
                !collegeId
            )
                return [];

            const { data, error } = await supabase
                .from("college_subjects")
                .select("collegeSubjectId, subjectName")
                .eq("collegeId", collegeId)
                .eq("collegeEducationId", educationId)
                .eq("collegeBranchId", branchId)
                .eq("collegeAcademicYearId", academicYearId)
                .eq("collegeSemesterId", semester)
                .eq("isActive", true)
                .order("subjectName");

            if (error) throw error;
            return data;
        }


        /* ===================== SECTION (depends on education + branch + year) ===================== */
        // case "section": {
        //     if (!collegeId) return [];

        //     const { data, error } = await supabase
        //         .from("college_sections")
        //         .select("collegeSections")
        //         .eq("collegeId", collegeId)
        //         .eq("isActive", true)
        //         .order("collegeSections");

        //     if (error) throw error;
        //     return data;
        // }

        /* ===================== SECTION (depends on education + branch + year) ===================== */
        case "section": {
            if (!collegeId || !educationId || !branchId || !academicYearId) return [];

            const { data, error } = await supabase
                .from("college_sections")
                // 🔴 CHANGED: fetch ID + NAME
                .select("collegeSectionsId, collegeSections")
                .eq("collegeId", collegeId)
                .eq("collegeEducationId", educationId)
                .eq("collegeBranchId", branchId)
                .eq("collegeAcademicYearId", academicYearId)
                .eq("isActive", true)
                .order("collegeSections");

            if (error) throw error;
            return data;
        }

    }
}
