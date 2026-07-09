import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface ClassSession {
  section: string;
  subject: string;
  students: number;
}

export function useFacultySessions(facultyId: number | undefined) {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!facultyId) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("faculty_sections")
          .select(`
            *,
            section:college_sections(collegeSectionsId, collegeSections, collegeBranchId, branch:college_branch(collegeBranchType, collegeBranchCode)),
            subject:college_subjects(subjectName),
            year:college_academic_year(collegeAcademicYear)
          `)
          .eq("facultyId", facultyId)
          .eq("isActive", true);

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setSessions([]);
          return;
        }

        const sectionIds = data.map((row: any) => row.section?.collegeSectionsId).filter(Boolean);

        let studentCounts: Record<number, number> = {};
        if (sectionIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("student_academic_history")
            .select("collegeSectionsId")
            .in("collegeSectionsId", sectionIds)
            .eq("isCurrent", true)
            .is("deletedAt", null);

          if (!studentsError && studentsData) {
            studentCounts = studentsData.reduce((acc: Record<number, number>, curr: any) => {
              acc[curr.collegeSectionsId] = (acc[curr.collegeSectionsId] || 0) + 1;
              return acc;
            }, {});
          }
        }

        const formattedSessions: ClassSession[] = data.map((row: any) => {
          const branchName = row.section?.branch?.collegeBranchCode || row.section?.branch?.collegeBranchType || "";
          const sectionName = row.section?.collegeSections || "";

          return {
            section: branchName && sectionName ? `${branchName} - ${sectionName}` : (branchName || sectionName || "Unknown"),
            subject: row.subject?.subjectName || "Unknown",
            students: studentCounts[row.section?.collegeSectionsId] || 0,
          };
        });

        setSessions(formattedSessions);
      } catch (err: any) {
        console.error("Error fetching faculty sessions:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [facultyId]);

  return { sessions, loading, error };
}
