/**
 * ============================================================================
 * SCHOOL LOGIC & EDUCATION LEVEL GUIDELINES
 * ============================================================================
 * This helper file provides utilities to differentiate between School, Inter, 
 * and Higher Education (Degree, B.Tech, PG) levels. Agents and developers must 
 * use these guidelines to conditionally render or fetch appropriate data.
 * 
 * 1. SCHOOL LEVEL (CBSE, SSC, ICSE, etc.)
 *    - No `branch_id` or branch context.
 *    - No `sem_ids` or semester context.
 *    - Academic structure is direct: Year -> Subjects.
 *    - Subjects are fetched year-wise directly.
 *    - In UI: Hide Branch and Semester filters/columns entirely.
 * 
 * 2. INTERMEDIATE LEVEL (Inter)
 *    - Has `branch` context, but in the frontend, it should be displayed as "Group".
 *    - No `sem_ids` or semester context.
 *    - Academic structure: Branch (Group) + Year -> Subjects.
 *    - Subjects are fetched branch-wise and year-wise.
 *    - In UI: Show "Group" label instead of "Branch". Hide Semester filter/column.
 * 
 * 3. HIGHER EDUCATION (Degree, B.Tech, PG, etc.)
 *    - Has full `branch_id` and branch context.
 *    - Has full `sem_ids` and semester context.
 *    - Academic structure: Branch + Year + Semester -> Subjects.
 *    - Frontend should display "Branch".
 *    - In UI: Show Branch and Semester filters/columns.
 * 
 * ============================================================================
 * BRANCH RESOLUTION FOR MULTI-BRANCH FACULTY
 * ============================================================================
 * When a faculty is assigned to multiple branches (e.g., teaches across EEE, BSC,
 * B.COM, MPC), the global `college_branch` context in useFaculty() becomes a
 * comma-separated string like "EEE, BSC, B.COM, MPC". This must NEVER be shown 
 * directly as a row's branch value.
 * 
 * Instead, resolve the exact branch per row using this priority:
 *   1. faculty_sections.collegeBranchId — The most authoritative; each faculty 
 *      section row is always linked to a single specific branch.
 *   2. college_subjects.collegeBranchId — The subject's parent branch.
 *   3. college_sections.collegeBranchId — The section's parent branch.
 *   4. college_exam_schedules.collegeBranchId — The exam schedule's branch.
 *   5. Global collegeBranchId from params — Only if faculty has a single branch.
 *   6. "N/A" — Safe fallback. Never fall back to the multi-branch string.
 * 
 * For Schools: Always use "N/A" (no branch concept).
 * For Inter: The resolved branch should be displayed as "Group" in the UI.
 * ============================================================================
 */


export const SCHOOL_BOARDS = ["CBSE", "SSC", "ICSE", "ISC", "IB"];

export const isSchoolEducation = (type: string | null | undefined): boolean => {
  if (!type) return false;
  return SCHOOL_BOARDS.includes(type.trim().toUpperCase());
};

export const parseEducationTypes = (input: any): string[] => {
  if (!input) return [];
  let arr: any[] = [];
  if (typeof input === 'string') {
    arr = input.split(',');
  } else if (Array.isArray(input)) {
    arr = input;
  } else if (input instanceof Set) {
    arr = Array.from(input);
  } else {
    arr = [input];
  }
  return arr.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.collegeEducationType) {
      return item.collegeEducationType;
    }
    return String(item);
  }).map(s => s.trim().toUpperCase()).filter(Boolean);
};

export const isStrictlySchoolAssigned = (collegeEducationTypeStr: any): boolean => {
  if (!collegeEducationTypeStr) return false;
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  if (types.length === 0) return false;
  
  return types.every(type => SCHOOL_BOARDS.includes(type));
};

export const isStrictlySchoolOrInterAssigned = (collegeEducationTypeStr: any): boolean => {
  if (!collegeEducationTypeStr) return false;
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  if (types.length === 0) return false;
  
  return types.every(type => {
     const isSchool = SCHOOL_BOARDS.includes(type);
     const isInter = type === "INTER" || type === "INTERMEDIATE";
     return isSchool || isInter;
  });
};

export const isSchoolOrInterSubject = (educationTypeStr: string | null | undefined): boolean => {
  if (!educationTypeStr) return false;
  
  const type = educationTypeStr.trim().toUpperCase();
  const isSchool = SCHOOL_BOARDS.includes(type);
  const isInter = type === "INTER" || type === "INTERMEDIATE";
  return isSchool || isInter;
};


export const getRestrictedPlacementsToastMessage = (collegeEducationTypeStr: any): string => {
  if (!collegeEducationTypeStr) return "Placements are restricted for your profile.";
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  
  const hasSchool = types.some(type => SCHOOL_BOARDS.includes(type));
  const hasInter = types.some(type => type === "INTER" || type === "INTERMEDIATE");
  
  if (hasSchool && hasInter) return "Placements are not available for School and Inter profiles.";
  if (hasSchool) return "Placements are not available for School profiles.";
  if (hasInter) return "Placements are not available for Inter profiles.";
  
  return "Placements are restricted for your profile.";
};
