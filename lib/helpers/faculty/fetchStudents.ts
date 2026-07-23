import { supabase } from "@/lib/supabaseClient";

export type StudentRow = {
    studentId: number;
    userId: number;
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    collegeSessionId: number | null;
    status: string;
    entryType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    student_academic_history: {
        studentAcademicHistoryId: number;
        collegeAcademicYearId: number;
        collegeSemesterId: number | null;
        collegeSectionsId: number;
        isCurrent: boolean;
    }[];
};

export async function fetchStudentsList(
    collegeId: number,
    filters?: {
        collegeEducationId?: number;
        collegeBranchId?: number;
        collegeSectionId?: number;
        collegeAcademicYearId?: number;
    }
) {
    let query = supabase
        .from("students")
        .select(`
      studentId,
      userId,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      collegeSessionId,
      status,
      entryType,
      isActive,
      createdAt,
      updatedAt,
      student_academic_history (
        studentAcademicHistoryId,
        collegeAcademicYearId,
        collegeSemesterId,
        collegeSectionsId,
        isCurrent
      )
    `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null);

    if (filters?.collegeEducationId) {
        query = query.eq("collegeEducationId", filters.collegeEducationId);
    }

    if (filters?.collegeBranchId) {
        query = query.eq("collegeBranchId", filters.collegeBranchId);
    }

    if (filters?.collegeAcademicYearId) {
        query = query.eq(
            "student_academic_history.collegeAcademicYearId",
            filters.collegeAcademicYearId
        );
    }

    if (filters?.collegeSectionId) {
        query = query.eq(
            "student_academic_history.collegeSectionsId",
            filters.collegeSectionId
        );
    }

    query = query.eq("student_academic_history.isCurrent", true);

    const { data, error } = await query.order("createdAt", {
        ascending: false,
    });

    if (error) {
        console.error("fetchStudentsList error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchStudentById(studentId: number) {
    const { data, error } = await supabase
        .from("students")
        .select(`
      *,
      student_academic_history (*)
    `)
        .eq("studentId", studentId)
        .single();

    if (error) {
        console.error("fetchStudentById error:", error);
        throw error;
    }

    return data;
}

export async function fetchStudentsWithProfile(
    collegeId: number,
    filters?: { branchId?: number; educationId?: number; sectionId?: number; yearId?: number; page?: number; limit?: number; searchQuery?: string }
) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
        .from("students")
        .select(`
            studentId,
            userId,
            collegeBranchId,
            status,
            users!inner (
                fullName,
                user_profile (
                    profileUrl
                )
            ),
            student_academic_history!inner ( 
                collegeSectionsId,
                collegeAcademicYearId,
                isCurrent
            )
        `)
        .eq("collegeId", collegeId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .eq("student_academic_history.isCurrent", true);

    if (filters?.branchId) {
        query = query.eq("collegeBranchId", filters.branchId);
    }

    if (filters?.educationId) {
        query = query.eq("collegeEducationId", filters.educationId);
    }

    if (filters?.sectionId) {
        query = query.eq("student_academic_history.collegeSectionsId", filters.sectionId);
    }

    if (filters?.yearId) {
        query = query.eq("student_academic_history.collegeAcademicYearId", filters.yearId);
    }

    if (filters?.searchQuery) {
        query = query.ilike("users.fullName", `%${filters.searchQuery}%`);
    }

    query = query.range(from, to);

    const { data: students, error } = await query;
    if (error) throw error;

    const formattedStudents = students?.map((s: any) => {
        const profileData = s.users?.user_profile?.[0] || s.users?.user_profile;
        return {
            id: s.studentId,
            name: s.users?.fullName || `Student ${s.studentId}`,
            image: profileData?.profileUrl || null,
            ...s
        };
    }) ?? [];

    return {
        data: formattedStudents,
        hasMore: formattedStudents.length === limit
    };
}