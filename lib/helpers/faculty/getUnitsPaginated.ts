import { supabase } from "@/lib/supabaseClient";
import { DbUnit, UiUnit, colorByUnitNumber } from "./getUnitsWithTopics";

export async function getUnitsPaginated(params: {
  collegeId: number;
  collegeSubjectId: number;
  collegeSectionsId?: number | null;
  page?: number;
  limit?: number;
}) {
  const { collegeId, collegeSubjectId, collegeSectionsId, page = 1, limit = 3 } = params;

  // We must fetch all units for this subject to apply the global vs section fallback logic correctly.
  // The number of units per subject is extremely small (e.g., 5-10), so this is extremely fast.
  let unitsQuery = supabase
    .from("college_subject_units")
    .select(
      `
      collegeSubjectUnitId,
      unitNumber,
      unitTitle,
      startDate,
      endDate,
      completionPercentage,
      collegeSubjectId,
      collegeId,
      collegeSectionsId
    `
    )
    .eq("collegeId", collegeId)
    .eq("collegeSubjectId", collegeSubjectId)
    .eq("isActive", true);

  if (collegeSectionsId) {
    unitsQuery = unitsQuery.or(`collegeSectionsId.eq.${collegeSectionsId},collegeSectionsId.is.null`);
  } else {
    unitsQuery = unitsQuery.is("collegeSectionsId", null);
  }

  const { data: rawUnits, error: unitsErr } = await unitsQuery.order("unitNumber", { ascending: true });
  console.log("RAW UNITS COUNT:", rawUnits?.length, "PARAMS:", params);

  if (unitsErr) throw new Error(unitsErr.message);

  // Filter to prefer section-specific units over global units with the same unitNumber
  const unitsMap = new Map<number, DbUnit>();
  (rawUnits ?? []).forEach((u) => {
    const existing = unitsMap.get(u.unitNumber);
    if (!existing || (existing.collegeSectionsId === null && u.collegeSectionsId !== null)) {
      unitsMap.set(u.unitNumber, u);
    }
  });

  const allUnits = Array.from(unitsMap.values()).sort((a, b) => a.unitNumber - b.unitNumber);

  // Apply server-side pagination on the deduplicated units
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDbUnits = allUnits.slice(startIndex, endIndex);

  // Format Date Range
  const formatDate = (d: string | null) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  };

  const buildDateRange = (startDate: string | null, endDate: string | null) => {
    const s = formatDate(startDate);
    const e = formatDate(endDate);
    if (s && e) return `${s} - ${e}`;
    if (s) return s;
    if (e) return e;
    return "";
  };

  const uiUnits: UiUnit[] = paginatedDbUnits.map((u: DbUnit) => {
    return {
      id: u.collegeSubjectUnitId,
      unitLabel: `Unit - ${u.unitNumber}`,
      title: u.unitTitle,
      color: colorByUnitNumber(u.unitNumber),
      dateRange: buildDateRange(u.startDate, u.endDate),
      percentage: u.completionPercentage ?? 0,
      topics: [], // Topics will be fetched independently via infinite scroll
    };
  });

  const hasNextPage = endIndex < allUnits.length;

  return {
    units: uiUnits,
    hasNextPage,
    nextCursor: hasNextPage ? page + 1 : undefined,
    totalCount: allUnits.length,
  };
}


