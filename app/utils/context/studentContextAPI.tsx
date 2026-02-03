import { supabase } from "@/lib/supabaseClient";

export async function fetchStudentContext(userId: number) {
    const { data: student, error: studentErr } = await supabase
        .from("students")
        .select(`
      studentId,
      collegeId,
      collegeBranchId,
      collegeEducationId,
      entryType,
      status
    `)
        .eq("userId", userId)
        .is("deletedAt", null)
        .single();

    if (studentErr) throw studentErr;

    const { data: academic, error: academicErr } = await supabase
        .from("student_academic_history")
        .select(`
      collegeAcademicYearId,
      collegeSemesterId,
      collegeSectionsId
    `)
        .eq("studentId", student.studentId)
        .eq("isCurrent", true)
        .is("deletedAt", null)
        .single();

    if (academicErr) throw academicErr;

    return {
        studentId: student.studentId,
        collegeId: student.collegeId,
        collegeBranchId: student.collegeBranchId,
        collegeEducationId: student.collegeEducationId,

        collegeAcademicYearId: academic.collegeAcademicYearId,
        collegeSemesterId: academic.collegeSemesterId,
        collegeSectionsId: academic.collegeSectionsId,

        entryType: student.entryType,
        status: student.status,
    };
}