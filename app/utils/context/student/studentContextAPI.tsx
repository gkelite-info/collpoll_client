import { supabase } from "@/lib/supabaseClient";

type StudentJoin = {
    studentId: number;
    collegeId: number;
    collegeBranchId: number;
    collegeEducationId: number;
    entryType: string;
    status: string;

    college_education: {
        collegeEducationType: string;
    };

    college_branch: {
        collegeBranchCode: string;
        collegeBranchType: string;
    };
};

type AcademicJoin = {
    studentAcademicHistoryId: number;
    collegeAcademicYearId: number;
    collegeSemesterId: number;
    collegeSectionsId: number;
    college_academic_year: {
        collegeAcademicYear: string;
    };
    college_sections: {
        collegeSections: string;
    };
    college_semester: {
        collegeSemester: string | number;
    } | null;
};


export async function fetchStudentContext(userId: number) {
    const { data: student, error: studentErr } = await supabase
        .from("students")
        .select(`
      studentId,
      collegeId,
      collegeBranchId,
      collegeEducationId,
      entryType,
      status,

      college_education:collegeEducationId!inner (
        collegeEducationType
      ),

      college_branch:collegeBranchId!inner (
        collegeBranchCode,
        collegeBranchType
      )
    `)
        .eq("userId", userId)
        .is("deletedAt", null)
        .maybeSingle<StudentJoin>();

    if (studentErr) throw studentErr;
    if (!student) return null;

    const { data: academic, error: academicErr } = await supabase
        .from("student_academic_history")
    .select(`
    studentAcademicHistoryId,
    collegeAcademicYearId,
    collegeSemesterId,
    collegeSectionsId,

    college_academic_year:collegeAcademicYearId (
      collegeAcademicYear
    ),

    college_sections:collegeSectionsId (
    collegeSections
    ),

    college_semester:collegeSemesterId (
      collegeSemester
    )

  `)
        .eq("studentId", student.studentId)
        .eq("isCurrent", true)
        .is("deletedAt", null)
        .maybeSingle<AcademicJoin>();

    if (academicErr) throw academicErr;

    return {
        studentId: student.studentId,
        collegeId: student.collegeId,
        collegeBranchId: student.collegeBranchId,
        collegeEducationId: student.collegeEducationId,

        collegeEducationType:
            student.college_education?.collegeEducationType ?? null,

        collegeBranchCode:
            student.college_branch?.collegeBranchCode ?? null,

        collegeBranchType:
            student.college_branch?.collegeBranchType ?? null,

        collegeAcademicYearId: academic?.collegeAcademicYearId ?? null,
        collegeSemesterId: academic?.collegeSemesterId ?? null,
        collegeSemester: academic?.college_semester?.collegeSemester ?? null,
        collegeSectionsId: academic?.collegeSectionsId ?? null,

        collegeSections: academic?.college_sections?.collegeSections ?? null,

        collegeAcademicYear: academic?.college_academic_year?.collegeAcademicYear ?? null,
        entryType: student.entryType,
        status: student.status,
    };
}
