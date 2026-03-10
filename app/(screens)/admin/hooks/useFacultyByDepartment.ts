import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useFacultyByDepartment(
  departmentId: number,
  yearId: number | null,
  shouldFetch: boolean,
  sectionId: number | null,
  collegeId: number,
  collegeEducationId: number,
) {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!shouldFetch || !collegeId || !collegeEducationId) return;

      setLoading(true);

      const sectionJoin = sectionId ? "!inner" : "";

      let query = supabase
        .from("faculty")
        .select(
          `
          facultyId,
          fullName,
          email,
          role,
          userId,
          faculty_sections${sectionJoin} (
            collegeSectionsId,
            college_subjects (
              subjectName
            )
          )
        `,
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("collegeBranchId", departmentId)
        .eq("isActive", true);

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

      const { data, error } = await query;

      if (!error && data) {
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
            designation: f.role || "Faculty",
            subject: uniqueSubjects || "—",
            users: {
              fullName: f.fullName,
              email: f.email,
              avatar: null,
            },
          };
        });
        setFaculty(mapped);
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

  return { faculty, loading };
}
