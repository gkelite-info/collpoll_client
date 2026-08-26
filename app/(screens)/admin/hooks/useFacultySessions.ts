import { useEffect, useState } from "react";
import { getFacultyTeachingSessions, type FacultyTeachingSession } from "@/lib/helpers/admin/dashboard/getFacultyTeachingSessions";

export type ClassSession = FacultyTeachingSession;

export function useFacultySessions(facultyId: number | undefined, selectedMonth: string) {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSessions() {
      if (!facultyId) {
        if (mounted) { setSessions([]); setLoading(false); }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getFacultyTeachingSessions(facultyId, selectedMonth);
        if (mounted) setSessions(data);
      } catch (cause) {
        if (!mounted) return;
        const nextError = cause instanceof Error ? cause : new Error("Unable to load faculty teaching sessions.");
        setSessions([]);
        setError(nextError);
        console.error("Error fetching faculty sessions:", nextError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSessions();
    return () => { mounted = false; };
  }, [facultyId, selectedMonth]);

  return { sessions, loading, error };
}
