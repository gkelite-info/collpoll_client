"use server";

import { createClient } from "@/app/utils/supabase/server";

export interface SectionStats {
  sectionId: number;
  avgAttendance: number;
  belowThresholdCount: number;
}

export async function getBatchSectionStats(
  sectionIds: number[],
): Promise<SectionStats[]> {
  const supabase = await createClient();

  if (sectionIds.length === 0) return [];

  const { data: histories, error: histError } = await supabase
    .from("student_academic_history")
    .select("studentId, collegeSectionsId")
    .in("collegeSectionsId", sectionIds)
    .eq("isCurrent", true);

  if (histError || !histories) {
    console.error("❌ Stats Error (History):", histError);
    return [];
  }

  const sectionStudentMap = new Map<number, number[]>();
  const allStudentIds: number[] = [];

  histories.forEach((h) => {
    if (!sectionStudentMap.has(h.collegeSectionsId)) {
      sectionStudentMap.set(h.collegeSectionsId, []);
    }
    sectionStudentMap.get(h.collegeSectionsId)?.push(h.studentId);
    allStudentIds.push(h.studentId);
  });

  if (allStudentIds.length === 0) return [];

  const { data: records, error: recError } = await supabase
    .from("attendance_record")
    .select("studentId, status")
    .in("studentId", allStudentIds);

  if (recError) {
    console.error("❌ Stats Error (Records):", recError);
    return [];
  }

  const studentStats = new Map<number, { present: number; total: number }>();

  records?.forEach((r) => {
    if (["CLASS_CANCEL", "CANCELLED", "CANCEL_CLASS"].includes(r.status))
      return;

    if (!studentStats.has(r.studentId)) {
      studentStats.set(r.studentId, { present: 0, total: 0 });
    }

    const s = studentStats.get(r.studentId)!;
    s.total++;

    if (r.status === "PRESENT" || r.status === "LATE") {
      s.present++;
    }
  });

  const results: SectionStats[] = [];

  sectionIds.forEach((secId) => {
    const students = sectionStudentMap.get(secId) || [];

    let sectionTotalPct = 0;
    let studentCountWithData = 0;
    let below75 = 0;

    students.forEach((sId) => {
      const stats = studentStats.get(sId);
      if (stats && stats.total > 0) {
        const pct = (stats.present / stats.total) * 100;

        sectionTotalPct += pct;
        studentCountWithData++;

        if (pct < 75) {
          below75++;
        }
      } else {
      }
    });

    const avg =
      studentCountWithData > 0
        ? Math.round(sectionTotalPct / studentCountWithData)
        : 0;

    results.push({
      sectionId: secId,
      avgAttendance: avg,
      belowThresholdCount: below75,
    });
  });

  return results;
}
