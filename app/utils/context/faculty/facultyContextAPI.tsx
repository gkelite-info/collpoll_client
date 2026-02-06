import { supabase } from "@/lib/supabaseClient";
 
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
      isActive
    `)
        .eq("userId", userId)
        .is("deletedAt", null)
        .single();
 
    if (facultyError) throw facultyError;
 
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

    // 🔴 CHANGED: choose filter based on caller
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