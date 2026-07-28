import { supabase } from "@/lib/supabaseClient";

type FacultyJoin = {
    facultyId: number;
    userId: number;
    fullName: string;
    email: string;
    mobile: string;
    role: string;
    collegeId: number;
    collegeEducationId: number;
    collegeBranchId: number;
    gender: string;
    isActive: boolean;

    faculty_edu_type: {
        collegeEducationType: string;
    } | null;

    college_branch: {
        collegeBranchCode: string;
    } | null;
};

type FacultySectionRaw = {
    facultySectionId: number;
    collegeSectionsId: number;
    collegeSubjectId: number;
    collegeAcademicYearId: number;
    faculty_subject: { subjectName: string }[] | null;
    college_sections: { collegeSections: string }[] | null;
    college_academic_year: { collegeAcademicYear: string }[] | null;
    collegeEducationId: number | null;
    collegeBranchId: number | null;
    college_branch: { collegeBranchCode: string }[] | null;
    faculty_edu_type: { collegeEducationType: string }[] | null;
};

type FacultySectionJoin = {
    facultySectionId: number;
    collegeSectionsId: number;
    collegeSubjectId: number;
    collegeAcademicYearId: number;
    faculty_subject: {
        subjectName: string;
    } | null;
    college_sections: {
        collegeSections: string;
    } | null;
    college_academic_year: {
        collegeAcademicYear: string;
    } | null;
    collegeEducationId: number | null;
    collegeBranchId: number | null;
    college_branch: {
        collegeBranchCode: string;
    } | null;
    faculty_edu_type: {
        collegeEducationType: string;
    } | null;
};


export async function fetchFacultyContext(userId: number) {
    const { data: faculty, error: facultyError } = await supabase
        .from("faculty")
        .select(`
      facultyId,
      userId,
      fullName,
      email,
      mobile,
      role,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      gender,
      isActive,
      college_branch:collegeBranchId (
      collegeBranchCode
      ),
    faculty_edu_type:collegeEducationId (
    collegeEducationType
    )
    `)
        .eq("userId", userId)
        .is("deletedAt", null)
        .single<FacultyJoin>();

    if (facultyError) throw facultyError;

    const { data: facultySections, error: sectionsError } = await supabase
        .from("faculty_sections")
        .select(`
    facultySectionId,
    collegeSectionsId,
    collegeSubjectId,
    collegeAcademicYearId,
    collegeEducationId,
    collegeBranchId,
    faculty_subject:college_subjects!collegeSubjectId (
      subjectName
    ),
    college_sections:collegeSectionsId!inner (
      collegeSections
    ),
    college_academic_year:collegeAcademicYearId!inner (
            collegeAcademicYear
    ),
    college_branch:collegeBranchId (
        collegeBranchCode
    ),
    faculty_edu_type:collegeEducationId (
        collegeEducationType
    )
  `)
        .eq("facultyId", faculty.facultyId)
        .is("deletedAt", null)

    if (sectionsError) throw sectionsError;

    const rawSections = (facultySections ?? []) as FacultySectionRaw[];

    const sections: FacultySectionJoin[] = rawSections.map(s => ({
        ...s,
        faculty_subject: Array.isArray(s.faculty_subject)
            ? s.faculty_subject[0] ?? null
            : s.faculty_subject ?? null,
        college_sections: Array.isArray(s.college_sections)
            ? s.college_sections[0] ?? null
            : s.college_sections ?? null,
        college_academic_year: Array.isArray(s.college_academic_year)
            ? s.college_academic_year[0] ?? null
            : s.college_academic_year ?? null,
        college_branch: Array.isArray(s.college_branch)
            ? s.college_branch[0] ?? null
            : s.college_branch ?? null,
        faculty_edu_type: Array.isArray(s.faculty_edu_type)
            ? s.faculty_edu_type[0] ?? null
            : s.faculty_edu_type ?? null,
    }));

    const faculty_subject = Array.from(
        new Map(
            sections
                .filter(s => s.faculty_subject)
                .map(s => [
                    s.collegeSubjectId,
                    {
                        subjectId: s.collegeSubjectId,
                        subjectName: s.faculty_subject!.subjectName,
                    }
                ])
        ).values()
    );

    const collegeAcademicYears = Array.from(
        new Map(
            sections
                .filter(s => s.college_academic_year)
                .map(s => [
                    s.collegeAcademicYearId,
                    {
                        collegeAcademicYearId: s.collegeAcademicYearId,
                        collegeAcademicYear: s.college_academic_year!.collegeAcademicYear,
                    }
                ])
        ).values()
    );

    let branchCodes = faculty.college_branch?.collegeBranchCode ? [faculty.college_branch.collegeBranchCode] : [];
    let eduTypes = faculty.faculty_edu_type?.collegeEducationType ? [faculty.faculty_edu_type.collegeEducationType] : [];

    if (branchCodes.length === 0 || eduTypes.length === 0) {
        const uniqueBranches = new Set<string>();
        const uniqueEduTypes = new Set<string>();
        
        sections.forEach(s => {
            if (s.college_branch?.collegeBranchCode) uniqueBranches.add(s.college_branch.collegeBranchCode);
            if (s.faculty_edu_type?.collegeEducationType) uniqueEduTypes.add(s.faculty_edu_type.collegeEducationType);
        });

        if (branchCodes.length === 0) branchCodes = Array.from(uniqueBranches);
        if (eduTypes.length === 0) eduTypes = Array.from(uniqueEduTypes);
    }

    return {
        facultyId: faculty.facultyId,
        userId: faculty.userId,
        fullName: faculty.fullName,
        email: faculty.email,
        mobile: faculty.mobile,
        role: faculty.role,
        collegeId: faculty.collegeId,
        collegeEducationId: faculty.collegeEducationId,
        collegeBranchId: faculty.collegeBranchId,
        college_branch: branchCodes.join(", ") || null,
        faculty_edu_type: eduTypes.join(", ") || null,
        gender: faculty.gender,
        isActive: faculty.isActive,
        sections,
        faculty_subject,
        // sectionIds: [...new Set((facultySections ?? []).map(s => s.collegeSectionsId))],
        collegeAcademicYears,
        collegeAcademicYear:
            collegeAcademicYears.map(y => y.collegeAcademicYear).join(", ") || null,
        sectionIds: [...new Set(sections.map(s => s.collegeSectionsId))],
        subjectIds: [...new Set((facultySections ?? []).map(s => s.collegeSubjectId))],
        academicYearIds: [...new Set((facultySections ?? []).map(s => s.collegeAcademicYearId))]
    };
}

export async function fetchFacultyContextAdmin(params: {
    userId?: number;
    facultyId?: number;
}) {
    let query = supabase
        .from("faculty")
        .select(`
      facultyId,
      userId,
      fullName,
      email,
      mobile,
      role,
      collegeId,
      collegeEducationId,
      collegeBranchId,
      gender,
      isActive
    `)
        .is("deletedAt", null);

    if (params.userId) {
        query = query.eq("userId", params.userId);
    }

    if (params.facultyId) {
        query = query.eq("facultyId", params.facultyId);
    }

    const { data: faculty, error } = await query.single();

    if (error) throw error;

    const { data: facultySections, error: sectionsError } = await supabase
        .from("faculty_sections")
        .select(`
      facultySectionId,
      collegeSectionsId,
      collegeSubjectId,
      collegeAcademicYearId
    `)
        .eq("facultyId", faculty.facultyId)
        .is("deletedAt", null);

    if (sectionsError) throw sectionsError;

    return {
        facultyId: faculty.facultyId,
        userId: faculty.userId,
        fullName: faculty.fullName,
        email: faculty.email,
        mobile: faculty.mobile,
        role: faculty.role,
        collegeId: faculty.collegeId,
        collegeEducationId: faculty.collegeEducationId,
        collegeBranchId: faculty.collegeBranchId,
        gender: faculty.gender,
        isActive: faculty.isActive,

        sections: facultySections,

        sectionIds: [...new Set(facultySections.map(s => s.collegeSectionsId))],
        subjectIds: [...new Set(facultySections.map(s => s.collegeSubjectId))],
        academicYearIds: [...new Set(facultySections.map(s => s.collegeAcademicYearId))]
    };
}
