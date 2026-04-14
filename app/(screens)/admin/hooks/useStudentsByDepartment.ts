import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useStudentsByDepartment(
  departmentId: number,
  yearId: number | null,
  shouldFetch: boolean,
  sectionId: number | null,
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10
) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    async function load() {
      if (!shouldFetch || !collegeId || !collegeEducationId || !yearId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("students")
        .select(
          `
          studentId,
          userId,
          users!inner(
          fullName,
          user_profile!left (
            profileUrl
          )
          ),
          student_pins!left(
            pinNumber,
            isActive
          ),
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
          { count: "exact" }
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("student_academic_history.isCurrent", true)
        .eq("isActive", true)
        .range(from, to);

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

      const { data, count, error } = await query;

      if (error) {
        setStudents([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      if (!error && data) {
        setTotalCount(count ?? 0);
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

          const studentPin =
            Array.isArray(s.student_pins)
              ? s.student_pins[0]?.pinNumber
              : s.student_pins?.pinNumber;

          return {
            studentId: s.studentId,
            rollNumber: studentPin ?? s.studentId.toString(),
            semester: sem ? `Sem ${sem}` : "—",
            attendance: attendancePct,
            performance: "—",
            userId: s.userId,
            users: {
              fullName: s.users?.fullName || "Unknown",
              avatar:
                Array.isArray(s.users?.user_profile)
                  ? s.users.user_profile[0]?.profileUrl ?? null
                  : s.users?.user_profile?.profileUrl ?? null,
            },
          };
        });

        setStudents(mapped);
        setLoading(false);
      } else {
        setStudents([]);
        setTotalCount(0);
        setLoading(false);
      }
    }
    load();
  }, [
    departmentId,
    yearId,
    shouldFetch,
    sectionId,
    collegeId,
    collegeEducationId,
    page,
    limit
  ]);

  return { students, loading, totalCount };
}
