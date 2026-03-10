import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useStudentsByDepartment(
  departmentId: number,
  yearId: number | null,
  shouldFetch: boolean,
  sectionId: number | null,
  collegeId: number,
  collegeEducationId: number,
) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!shouldFetch || !collegeId || !collegeEducationId || !yearId) return;

      setLoading(true);

      let query = supabase
        .from("students")
        .select(
          `
          studentId,
          users!inner(fullName),
          student_academic_history!inner(
            collegeSectionsId,
            collegeSemesterId,
            college_semester(collegeSemester),
            college_sections!inner(collegeAcademicYearId)
          ),
          attendance_record (
            status
          )
        `,
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("student_academic_history.isCurrent", true)
        .eq("isActive", true);

      if (yearId) {
        query = query.filter(
          "student_academic_history.college_sections.collegeAcademicYearId",
          "eq",
          yearId,
        );
      }

      if (sectionId) {
        query = query.eq(
          "student_academic_history.collegeSectionsId",
          sectionId,
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped = data.map((s: any) => {
          const history = Array.isArray(s.student_academic_history)
            ? s.student_academic_history[0]
            : s.student_academic_history;

          const semData =
            history?.college_semester ||
            history?.student_academic_history?.college_semester;
          const sem = Array.isArray(semData)
            ? semData[0]?.collegeSemester
            : semData?.collegeSemester;

          const attendanceRecords = s.attendance_record || [];
          let total = 0;
          let present = 0;

          attendanceRecords.forEach((r: any) => {
            if (
              !["CLASS_CANCEL", "CANCELLED", "CANCEL_CLASS"].includes(r.status)
            ) {
              total++;
              if (["PRESENT", "LATE"].includes(r.status)) {
                present++;
              }
            }
          });

          const attendancePct =
            total > 0 ? Math.round((present / total) * 100) + "%" : "—";

          return {
            rollNumber: s.studentId.toString(),
            semester: sem ? `Sem ${sem}` : "—",
            attendance: attendancePct,
            performance: "—",
            users: {
              fullName: s.users?.fullName || "Unknown",
              avatar: null,
            },
          };
        });
        setStudents(mapped);
      }
      setLoading(false);
    }

    load();
  }, [
    departmentId,
    yearId,
    shouldFetch,
    sectionId,
    collegeId,
    collegeEducationId,
  ]);

  return { students, loading };
}
