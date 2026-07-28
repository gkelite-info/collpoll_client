import { TeachingAssignment, AssignmentRow, FacultySectionPayload } from "@/app/(screens)/admin/(dashboard)/components/modal/faculty/facultyAssignmentTypes";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

/** Create a new empty assignment */
export const createEmptyAssignment = (): TeachingAssignment => ({
  id: crypto.randomUUID(),
  educationId: null,
  branchId: null,
  rows: [createEmptyRow()],
});

/** Create a new empty row */
export const createEmptyRow = (): AssignmentRow => ({
  id: crypto.randomUUID(),
  yearId: null,
  semesterId: null,
  subjectId: null,
  sectionIds: [],
});

/** Duplicate a row (copies year+semester, clears subject+sections for quick addition) */
export const duplicateRow = (source: AssignmentRow): AssignmentRow => ({
  id: crypto.randomUUID(),
  yearId: source.yearId,
  semesterId: source.semesterId,
  subjectId: null,
  sectionIds: [],
});

/**
 * Validate all assignments before save.
 * Returns error message string or null if valid.
 */
export const validateAssignments = (
  assignments: TeachingAssignment[],
  educations: any[],
): string | null => {
  if (assignments.length === 0) return "Add at least one teaching assignment.";

  for (const assignment of assignments) {
    const eduType = educations.find(
      (e: any) => e.collegeEducationId == assignment.educationId
    )?.collegeEducationType;
    
    if (!eduType) {
      if (assignment.educationId) return "Invalid Education Type selected.";
      else return "Select Education Type for all teaching assignments.";
    }
    
    const isBlockSchool = isSchoolEducation(eduType);
    const isInter = eduType === "Inter";
    const needsSemester = !isBlockSchool && !isInter;

    // Assignment-level checks
    if (!assignment.educationId) return "Select Education Type for all teaching assignments.";
    if (!isBlockSchool && !assignment.branchId) return `Select ${isInter ? "Group" : "Branch"} for all teaching assignments.`;
    if (assignment.rows.length === 0) return "Add at least one subject row per teaching assignment.";

    // Row-level checks
    for (const row of assignment.rows) {
      if (!row.yearId) return `Select ${isBlockSchool ? "Class" : "Year"} for all subject rows.`;
      if (needsSemester && !row.semesterId) return "Select Semester for all subject rows.";
      if (!row.subjectId) return "Select Subject for all subject rows.";
      if (row.sectionIds.length === 0) return "Select at least one Section for all subject rows.";
    }

    // Within-assignment duplicate: same year+subject (with overlapping sections)
    for (let i = 0; i < assignment.rows.length; i++) {
      for (let j = i + 1; j < assignment.rows.length; j++) {
        const a = assignment.rows[i];
        const b = assignment.rows[j];
        if (a.yearId === b.yearId && a.subjectId === b.subjectId) {
          const overlap = a.sectionIds.some(s => b.sectionIds.includes(s));
          if (overlap) {
            return "Duplicate: Same subject with overlapping sections found in the same year. Merge them into one row or remove duplicates.";
          }
        }
      }
    }
  }

  // Cross-assignment duplicate: same education+branch+year+subject with overlapping sections
  const globalEntries: { key: string; sectionIds: number[] }[] = [];
  for (const a of assignments) {
    for (const r of a.rows) {
      const key = `${a.educationId}-${a.branchId}-${r.yearId}-${r.subjectId}`;
      const existing = globalEntries.find(e => e.key === key);
      if (existing) {
        const overlap = existing.sectionIds.some(s => r.sectionIds.includes(s));
        if (overlap) return "Same subject with overlapping sections found across assignments. Remove the duplicate.";
      }
      globalEntries.push({ key, sectionIds: r.sectionIds });
    }
  }

  return null;
};

/**
 * Flatten assignments into FacultySectionPayload[] for batch insert.
 * Sorts rows by year before flattening.
 */
export const flattenAssignmentsToPayloads = (
  assignments: TeachingAssignment[],
  facultyId: number,
  adminId: number,
  timestamp: string,
): FacultySectionPayload[] => {
  const payloads: FacultySectionPayload[] = [];

  for (const assignment of assignments) {
    const sortedRows = [...assignment.rows].sort(
      (a, b) => (a.yearId || 0) - (b.yearId || 0)
    );

    for (const row of sortedRows) {
      for (const sectionId of row.sectionIds) {
        payloads.push({
          facultyId,
          collegeEducationId: assignment.educationId,
          collegeBranchId: assignment.branchId,
          collegeSectionsId: sectionId,
          collegeSubjectId: row.subjectId!,
          collegeAcademicYearId: row.yearId!,
          createdBy: adminId,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    }
  }

  return payloads;
};

/**
 * Reconstruct TeachingAssignment[] from faculty_sections DB rows.
 * Used for edit mode.
 */
export const reconstructAssignmentsFromDB = (
  sections: any[],   // faculty_sections rows with joined college_subjects
): TeachingAssignment[] => {
  if (!sections || sections.length === 0) return [createEmptyAssignment()];

  // Group by education+branch (from the subject's FK)
  const groups = new Map<string, { eduId: number; branchId: number | null; items: any[] }>();

  for (const s of sections) {
    const eduId = s.college_subjects?.collegeEducationId;
    const branchId = s.college_subjects?.collegeBranchId || null;
    if (!eduId) continue;
    
    const key = `${eduId}-${branchId}`;

    if (!groups.has(key)) {
      groups.set(key, { eduId, branchId, items: [] });
    }
    groups.get(key)!.items.push(s);
  }

  if (groups.size === 0) return [createEmptyAssignment()];

  // Within each group, group by year+subject → AssignmentRow
  return Array.from(groups.values()).map(({ eduId, branchId, items }) => {
    const rowMap = new Map<string, AssignmentRow>();

    for (const item of items) {
      const rowKey = `${item.collegeAcademicYearId}-${item.collegeSubjectId}`;
      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, {
          id: crypto.randomUUID(),
          yearId: item.collegeAcademicYearId,
          semesterId: item.college_subjects?.collegeSemesterId || null,
          subjectId: item.collegeSubjectId,
          sectionIds: [],
        });
      }
      rowMap.get(rowKey)!.sectionIds.push(item.collegeSectionsId);
    }

    return {
      id: crypto.randomUUID(),
      educationId: eduId,
      branchId,
      rows: Array.from(rowMap.values()).sort(
        (a, b) => (a.yearId || 0) - (b.yearId || 0)
      ),
    };
  });
};
