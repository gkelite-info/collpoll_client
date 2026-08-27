/**
 * ============================================================================
 * MULTI-SUBJECT & MULTI-BRANCH FACULTY GUIDELINES
 * ============================================================================
 * This helper file provides guidelines and utilities for handling complex faculty 
 * profiles. Agents and developers must read this when dealing with faculty dashboards,
 * results, attendance, or any feature where a faculty is assigned to multiple classes.
 * 
 * 1. THE PROBLEM: "COMMA-SEPARATED" GLOBAL CONTEXT
 *    When a faculty is assigned to multiple branches (e.g., EEE, BSC, B.COM) or 
 *    multiple education levels (e.g., UG, PG, INTER), the global `useFaculty()` 
 *    context aggregates these into comma-separated strings:
 *    - `college_branch` = "EEE, BSC, B.COM"
 *    - `faculty_edu_type` = "UG, PG, INTER"
 *    
 *    CRITICAL RULE: NEVER display these comma-separated strings directly in table rows, 
 *    dropdowns, or specific records. They are ONLY meant for high-level global context 
 *    or filtering logic. 
 * 
 * 2. AGGREGATING MULTIPLE EDUCATIONS AND BRANCHES (GLOBAL SEARCH/PROFILE)
 *    When fetching a faculty profile globally (like in Club Admins, search dropdowns, etc.), 
 *    a single faculty member might teach across multiple educations or branches. 
 *    These might NOT all be present in the main `faculty` table!
 * 
 *    CRITICAL RULE FOR ALL AGENTS & DEVELOPERS: 
 *    To get all educations and branches for a faculty member, you MUST:
 *      1. First check the `faculty` table (e.g., `college_education`, `college_branch`).
 *      2. Then ALSO check the `faculty_sections` table for additional assignments.
 *    Aggregate them all together (e.g., using a Set) to ensure no education or branch is missed.
 * 
 * 3. SINGLE VS. MULTI-ASSIGNMENT PROFILES
 *    - Single-Assignment Faculty: A faculty teaching 1 subject to 1 branch. Their 
 *      global `collegeBranchId` and `college_branch` will naturally be singular.
 *    - Multi-Assignment Faculty: A faculty teaching multiple subjects across different 
 *      branches or education levels. Their global `collegeBranchId` might default to 
 *      the first available one, or `null`.
 * 
 * 4. THE SOLUTION: ROW-LEVEL CONTEXT RESOLUTION (SaaS / Production Standard)
 *    Instead of relying on the global context to render specific data rows, you MUST 
 *    extract the context from the lowest level of the relational hierarchy:
 *    `faculty_sections` -> `college_subjects` -> `college_sections`
 * 
 *    When rendering a list of sections/classes for a faculty, resolve the exact branch 
 *    using this strict priority chain:
 * 
 *    A. Direct Join (Most Authoritative): 
 *       Fetch `collegeBranchId` directly from the `faculty_sections` table. This guarantees 
 *       that you know exactly which branch this specific teaching assignment belongs to.
 *       Example: `faculty_branch:collegeBranchId ( collegeBranchCode )`
 * 
 *    B. Subject/Section Fallback:
 *       If `faculty_sections` lacks the ID, fall back to the subject's own `collegeBranchId`,
 *       then the section's `collegeBranchId`.
 * 
 *    C. Global Context (For Single-Subject Safety):
 *       If all nested joins fail (which happens often for simple, single-subject setups),
 *       fall back to the global `collegeBranchId` provided by the API params.
 * 
 *    D. Absolute Last Resort:
 *       Only fall back to a raw string `branchName` if it does NOT contain a comma (",").
 *       If it contains a comma, fall back to "N/A" to prevent UI pollution.
 * 
 * ============================================================================
 * EXAMPLES & UTILITIES
 * ============================================================================
 */

/**
 * Validates if a branch name is safe to display in a specific row.
 * Prevents "EEE, BSC, B.COM" from bleeding into a single row's branch column.
 * 
 * @param branchName The branch name to validate
 * @returns boolean True if safe (single branch), False if it contains commas
 */
export const isSafeBranchName = (branchName: string | null | undefined): boolean => {
  if (!branchName || branchName.trim() === "") return false;
  if (branchName.includes(",")) return false;
  return true;
};

/**
 * Resolves the safest branch name for a specific faculty class/section row.
 * Implements the SaaS-level robust priority chain discussed above.
 * 
 * @param isSchool Boolean indicating if the context is a school (Schools have no branches)
 * @param directBranchCode The exact branch code from faculty_sections join
 * @param subjectBranchName The branch name tied to the college_subjects table
 * @param sectionBranchName The branch name tied to the college_sections table
 * @param globalBranchName The global fallback branch name (from useFaculty / params)
 * @returns The safely resolved, single branch name (e.g. "BSC", "N/A")
 */
export const resolveRowBranchName = (
  isSchool: boolean,
  directBranchCode?: string | null,
  subjectBranchName?: string | null,
  sectionBranchName?: string | null,
  globalBranchName?: string | null
): string => {
  // 1. Schools have no branch concept
  if (isSchool) return "N/A";

  // 2. Direct join from faculty_sections (The absolute best source)
  if (directBranchCode && isSafeBranchName(directBranchCode)) return directBranchCode;

  // 3. Subject-level branch
  if (subjectBranchName && isSafeBranchName(subjectBranchName)) return subjectBranchName;

  // 4. Section-level branch
  if (sectionBranchName && isSafeBranchName(sectionBranchName)) return sectionBranchName;

  // 5. Global context fallback (Safeguard for single-subject faculties)
  if (globalBranchName && isSafeBranchName(globalBranchName)) return globalBranchName;

  // 6. Safe Default
  return "N/A";
};
