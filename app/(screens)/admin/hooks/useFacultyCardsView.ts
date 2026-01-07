import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type FacultyRow = {
  facultyId: number;
  name: string;
  subject: string;
  role: string;
  contact: string;
};

type StudentRow = {
  studentId: number;
  name: string;
  roll: string;
  semester: number;
};

type Stats = {
  facultyCount: number;
  studentCount: number;
  sectionCount: number;
};

export function useFacultyCardsView(departmentId: number) {
  const [faculty, setFaculty] = useState<FacultyRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    facultyCount: 0,
    studentCount: 0,
    sectionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;

    async function load() {
      setLoading(true);

      /* ---------- FACULTY ---------- */
      const { data: facultyData, error: facultyErr } = await supabase
        .from("faculty_profiles")
        .select(
          `
          facultyId,
          designation,
          users!inner (
            fullName,
            email
          )
        `
        )
        .eq("departmentId", departmentId);

      if (facultyErr) throw facultyErr;

      const mappedFaculty: FacultyRow[] =
        facultyData?.map((f: any) => ({
          facultyId: f.facultyId,
          name: f.users[0]?.fullName ?? "",
          subject: f.designation,
          role: f.designation,
          contact: f.users[0]?.email ?? "",
        })) ?? [];

      /* ---------- STUDENTS ---------- */
      const { data: studentData, error: studentErr } = await supabase
        .from("student_academic_profiles")
        .select(
          `
          studentId,
          rollNumber,
          semester,
          users!inner (
            fullName
          )
        `
        )
        .eq("departmentId", departmentId);

      if (studentErr) throw studentErr;

      const mappedStudents: StudentRow[] =
        studentData?.map((s: any) => ({
          studentId: s.studentId,
          name: s.users[0]?.fullName ?? "",
          roll: s.rollNumber,
          semester: s.semester,
        })) ?? [];

      setFaculty(mappedFaculty);
      setStudents(mappedStudents);
      setStats({
        facultyCount: mappedFaculty.length,
        studentCount: mappedStudents.length,
        sectionCount: new Set(mappedStudents.map((s) => s.semester)).size,
      });

      setLoading(false);
    }

    load().catch((e) => {
      console.error("Faculty view load failed", e);
      setLoading(false);
    });
  }, [departmentId]);

  return { faculty, students, stats, loading };
}
