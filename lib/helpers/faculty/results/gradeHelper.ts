/**
 * Helper to calculate Grade Points based on standard UGC/JNTU guidelines.
 * - O (Outstanding): 10 points
 * - A+ (Excellent): 9 points
 * - A (Very Good): 8 points
 * - B+ (Good): 7 points
 * - B (Above Average): 6 points
 * - C (Average/Pass): 5 points
 * - P (Pass): 4 points
 * - F (Fail) / Ab (Absent): 0 points
 * 
 * If a system uses A+ as the highest (no O grade), A+ maps to 10.
 * We use the standard UGC mapping by default for SaaS scalability.
 */
export const resolveGradePoints = (grade: string, totalMarks?: number | null): number => {
  const g = grade.toUpperCase().trim();

  // If marks are provided and grade is missing/invalid, we can optionally auto-calculate.
  // But usually, we respect the uploaded Grade character first.
  switch (g) {
    case "O":
      return 10; // Outstanding
    case "A+":
      // In standard UGC 10-point scale, A+ is 9. (O is 10).
      return 9; 
    case "A":
      return 8;
    case "B+":
      return 7;
    case "B":
      return 6;
    case "C+":
      return 5;
    case "C":
      return 5;
    case "P":
      return 4; // Pass
    case "F":
    case "AB":
    case "ABSENT":
      return 0; // Fail or Absent
    default:
      // Fallback: If no valid grade string, try to compute from marks if available
      if (totalMarks !== undefined && totalMarks !== null) {
        if (totalMarks >= 90) return 10;
        if (totalMarks >= 80) return 9;
        if (totalMarks >= 70) return 8;
        if (totalMarks >= 60) return 7;
        if (totalMarks >= 50) return 6;
        if (totalMarks >= 40) return 5;
        return 0;
      }
      return 0;
  }
};

export const resolvePassFail = (grade: string): "P" | "F" | "-" => {
  const g = grade.toUpperCase().trim();
  if (!g || g === "N/A") return "-";
  return (g === "F" || g === "AB" || g === "ABSENT") ? "F" : "P";
};
