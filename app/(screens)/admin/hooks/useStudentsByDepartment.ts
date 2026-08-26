import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAdminStudentProgressSummary } from "@/lib/helpers/admin/studentProgress/getAdminStudentProgressSummary";

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
        const sectionIds = [...new Set(data.flatMap((student: any) => {
          const histories = Array.isArray(student.student_academic_history)
            ? student.student_academic_history
            : [student.student_academic_history];
          return histories.map((history: any) => history?.collegeSectionsId).filter(Boolean);
        }))] as number[];
        const semesterIds = [...new Set(data.flatMap((student: any) => {
          const histories = Array.isArray(student.student_academic_history)
            ? student.student_academic_history
            : [student.student_academic_history];
          return histories.map((history: any) => history?.collegeSemesterId).filter(Boolean);
        }))] as number[];
        const progressByStudent = new Map<number, {
          attendancePercentage: number;
          progressPercent: number;
        }>();

        if (sectionIds.length) {
          try {
            let subjectsQuery = supabase
              .from("college_subjects")
              .select("collegeSubjectId")
              .eq("collegeId", collegeId)
              .eq("collegeEducationId", collegeEducationId)
              .eq("collegeBranchId", departmentId)
              .eq("collegeAcademicYearId", yearId)
              .eq("isActive", true)
              .is("deletedAt", null);
            if (semesterIds.length) {
              subjectsQuery = subjectsQuery.or(
                `collegeSemesterId.in.(${semesterIds.join(",")}),collegeSemesterId.is.null`,
              );
            } else {
              subjectsQuery = subjectsQuery.is("collegeSemesterId", null);
            }
            const { data: subjectRows } = await subjectsQuery;
            const subjectIds = (subjectRows ?? []).map((subject) => subject.collegeSubjectId);
            if (subjectIds.length) {
              const progress = await getAdminStudentProgressSummary({
                collegeId,
                collegeEducationId,
                collegeBranchIds: [departmentId],
                academicYearIds: [yearId],
                semesterIds,
                sectionIds,
                subjectIds,
                facultyIds: [],
                includeStudentsWithoutProgress: true,
                page: 1,
                pageSize: 10000,
              });
              progress.studentRows.forEach((student) => {
                progressByStudent.set(student.studentId, {
                  attendancePercentage: student.attendancePercentage,
                  progressPercent: student.progressPercent,
                });
              });
            }
          } catch (performanceError) {
            console.error("Failed to load student performance", performanceError);
          }
        }

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

          const progressMetrics = progressByStudent.get(s.studentId);

          const studentPin =
            Array.isArray(s.student_pins)
              ? s.student_pins[0]?.pinNumber
              : s.student_pins?.pinNumber;

          return {
            studentId: s.studentId,
            rollNumber: studentPin ?? s.studentId.toString(),
            semester: sem ? `Sem ${sem}` : "—",
            attendance: progressMetrics
              ? `${progressMetrics.attendancePercentage}%`
              : "—",
            performance: progressMetrics
              ? `${progressMetrics.progressPercent}%`
              : "—",
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
