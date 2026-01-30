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