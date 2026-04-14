import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFacultyByDepartment(
  departmentId: number,
  yearId: number | null,
  shouldFetch: boolean,
  sectionId: number | null,
  collegeId: number,
  collegeEducationId: number,
  page: number = 1,
  limit: number = 10
) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    async function load() {
      if (!shouldFetch || !collegeId || !collegeEducationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const sectionJoin = sectionId ? "!inner" : "";
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("faculty")
        .select(
          `
          facultyId,
          collegeId,
          fullName,
          email,
          role,
          userId,
          mobile,
          collegeBranchId,
          users!faculty_userId_fkey (
            dateOfJoining,
            professionalExperienceYears,
            gender,
            user_profile!left (
              profileUrl
            )
          ),
          college_branch!inner (
            collegeBranchCode
          ),
          faculty_sections${sectionJoin} (
            collegeSectionsId,
            college_subjects (
              subjectName
            )
          )
        `,
          { count: "exact" }
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("isActive", true)
        .range(from, to);

      if (yearId) {
        query = query.filter(
          "faculty_sections.collegeAcademicYearId",
          "eq",
          yearId,
        );
      }

      if (sectionId) {
        query = query.eq("faculty_sections.collegeSectionsId", sectionId);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        setTotalCount(count ?? 0);
        const mapped = data.map((f: any) => {
          const subjects = f.faculty_sections
            ?.map((fs: any) => {
              const sub = Array.isArray(fs.college_subjects)
                ? fs.college_subjects[0]
                : fs.college_subjects;
              return sub?.subjectName;
            })
            .filter(Boolean);

          const uniqueSubjects = [...new Set(subjects)].join(", ");

          return {
            ...f,
            collegeBranchCode: f.college_branch?.collegeBranchCode ?? "—",
            designation: f.role || "Faculty",
            subject: uniqueSubjects || "—",
            dateOfJoining: f.users?.dateOfJoining ?? null,
            experienceYears:
              f.users?.professionalExperienceYears ?? null,
            gender: f.users?.gender ?? null,
            users: {
              userId: f.userId,
              fullName: f.fullName,
              email: f.email,
              avatar:
                Array.isArray(f.users?.user_profile)
                  ? f.users.user_profile[0]?.profileUrl ?? null
                  : f.users?.user_profile?.profileUrl ?? null,
            },
          };
        });
        setFaculty(mapped);
      } else {
        setFaculty([]);
        setTotalCount(0);
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
    page,
    limit
  ]);

  return { faculty, loading, totalCount };
}
