import { supabase } from "@/lib/supabaseClient";
import { FacultySectionRow } from "./facultysectionsAPI";

export const getFacultyIdByUserId = async (userId: number | null) => {
    const { data, error } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("userId", userId)
        .eq("isActive", true)
        .maybeSingle();

    if (error) throw error;

    return data?.facultyId ?? null;
};


export async function fetchFacultyBranches(facultyId: number): Promise<{ id: number; label: string }[]> {
    const { data, error } = await supabase
        .from("faculty_sections")
        .select(`
            collegeBranchId,
            college_branch:collegeBranchId (
                collegeBranchId,
                collegeBranchCode
            ),
            college_sections:collegeSectionsId (
                collegeBranchId,
                college_branch:collegeBranchId (
                    collegeBranchId,
                    collegeBranchCode
                )
            )
        `)
        .eq("facultyId", facultyId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchFacultyBranches error:", error);
        throw error;
    }

    const uniqueBranches = new Map<number, { id: number; label: string }>();

    data?.forEach((item: any) => {
        let branchData = null;

        if (item.college_branch) {
            branchData = Array.isArray(item.college_branch) ? item.college_branch[0] : item.college_branch;
        } else if (item.college_sections?.college_branch) {
            branchData = Array.isArray(item.college_sections.college_branch) 
                ? item.college_sections.college_branch[0] 
                : item.college_sections.college_branch;
        }

        if (branchData?.collegeBranchId) {
            uniqueBranches.set(branchData.collegeBranchId, {
                id: branchData.collegeBranchId,
                label: branchData.collegeBranchCode
            });
        }
    });

    return Array.from(uniqueBranches.values());
}

export async function fetchFacultyYears(facultyId: number, branchId?: number): Promise<{ id: number; label: string }[]> {
    const { data, error } = await supabase
        .from("faculty_sections")
        .select(`
            collegeAcademicYearId,
            collegeBranchId,
            college_academic_year (
                collegeAcademicYearId,
                collegeAcademicYear
            ),
            college_sections:collegeSectionsId (
                collegeBranchId
            )
        `)
        .eq("facultyId", facultyId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchFacultyYears error:", error);
        throw error;
    }

    let filteredData = data || [];
    if (branchId) {
        filteredData = filteredData.filter((item: any) => {
            return item.collegeBranchId === branchId || item.college_sections?.collegeBranchId === branchId;
        });
    }

    const uniqueYears = Array.from(
        new Map<any, any>(
            filteredData
                .filter((item: any) => item.college_academic_year)
                .map((item: any) => {
                    const yearData = Array.isArray(item.college_academic_year)
                        ? item.college_academic_year[0]
                        : item.college_academic_year;

                    const label = yearData?.collegeAcademicYear;
                    return [
                        label,
                        {
                            id: item.collegeAcademicYearId,
                            label: label,
                        },
                    ];
                })
                .filter((entry: any) => entry[0] != null) as [string, any][]
        ).values()
    );

    return uniqueYears;
}


export async function fetchFacultySubjects(facultyId: number, academicYearId: number) {
    const { data, error } = await supabase
        .from("faculty_sections")
        .select(`
            collegeSubjectId,
            college_subjects (
                collegeSubjectId,
                subjectName
            )
        `)
        .eq("facultyId", facultyId)
        .eq("collegeAcademicYearId", academicYearId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchFacultySubjects error:", error);
        throw error;
    }

    const subjects = Array.from(
        new Map<any, any>(
            data
                .filter(item => item.college_subjects)
                .map(item => {
                    const subject: any = Array.isArray(item.college_subjects)
                        ? item.college_subjects[0]
                        : item.college_subjects;

                    return [
                        subject.collegeSubjectId,
                        {
                            id: subject.collegeSubjectId,
                            label: subject.subjectName
                        }
                    ];
                })
        ).values()
    );

    return subjects;
}

export async function fetchFacultySections(
    facultyId: number,
    yearId: number,
    subjectId: number
) {
    const { data, error } = await supabase
        .from("faculty_sections")
        .select(`
            facultySectionId,
            collegeSectionsId,
            college_sections (
                collegeSectionsId,
                collegeSections
            )
        `)
        .eq("facultyId", facultyId)
        .eq("collegeAcademicYearId", yearId)
        .eq("collegeSubjectId", subjectId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) {
        console.error("fetchFacultySections error:", error);
        throw error;
    }

    return (data ?? []) as unknown as FacultySectionRow[];
}

export async function fetchSectionsByYear(facultyId: number, yearId: number) {
    const { data, error } = await supabase
        .from("faculty_sections")
        .select(`
            collegeSectionsId,
            college_sections (
                collegeSectionsId,
                collegeSections
            )
        `)
        .eq("facultyId", facultyId)
        .eq("collegeAcademicYearId", yearId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (error) throw error;

    const uniqueSections = Array.from(
        new Map<any, any>(
            data
                .filter((item: any) => item.college_sections)
                .map((item: any) => [
                    item.collegeSectionsId,
                    {
                        id: item.collegeSectionsId,
                        label: item.college_sections.collegeSections
                    }
                ]) as any
        ).values()
    );

    return uniqueSections;
}
