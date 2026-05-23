import { supabase } from "@/lib/supabaseClient";

export type FeeCollectionOverviewRow = {
  id: number;
  name: string;
  students: number;
  collected: number;
  pending: number;
  totalFees: number;
};

export type FeeCollectionOverviewResult = {
  years: string[];
  educationRows: FeeCollectionOverviewRow[];
  branchRows: FeeCollectionOverviewRow[];
};

type EducationRow = {
  collegeEducationId: number;
  collegeEducationType: string;
};

type BranchRow = {
  collegeBranchId: number;
  collegeBranchCode: string | null;
  collegeBranchType: string | null;
};

type StudentRow = {
  studentId: number;
  collegeBranchId: number | null;
};

type FeeCollectionRow = {
  collectedAmount?: number | string | null;
};

type FeeObligationRow = {
  studentId?: number | null;
  collegeBranchId?: number | null;
  totalAmount?: number | string | null;
  createdAt?: string | null;
  student_fee_collection?: FeeCollectionRow[] | null;
};

const getYear = (date: string | null | undefined) => {
  if (!date) return null;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return String(parsedDate.getFullYear());
};

const sumCollected = (collections: FeeCollectionRow[] | null | undefined) =>
  (collections ?? []).reduce(
    (sum, collection) => sum + Number(collection.collectedAmount ?? 0),
    0,
  );

export async function fetchFeeCollectionOverview(
  collegeId: number | null | undefined,
  collegeEducationId: number | null | undefined,
  selectedYear?: string | null,
): Promise<FeeCollectionOverviewResult> {
  if (!collegeId || !collegeEducationId) {
    return { years: [String(new Date().getFullYear())], educationRows: [], branchRows: [] };
  }

  const [educationResult, branchesResult, studentsResult, obligationsResult] =
    await Promise.all([
      supabase
        .from("college_education")
        .select("collegeEducationId, collegeEducationType")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .maybeSingle(),
      supabase
        .from("college_branch")
        .select("collegeBranchId, collegeBranchCode, collegeBranchType")
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null),
      supabase
        .from("students")
        .select(
          `
          studentId,
          collegeBranchId,
          users!inner (
            role,
            collegeId,
            isActive,
            is_deleted,
            deletedAt
          ),
          student_academic_history!inner ( isCurrent )
        `,
        )
        .eq("collegeId", collegeId)
        .eq("collegeEducationId", collegeEducationId)
        .eq("status", "Active")
        .eq("isActive", true)
        .is("deletedAt", null)
        .eq("users.role", "Student")
        .eq("users.collegeId", collegeId)
        .eq("users.isActive", true)
        .eq("users.is_deleted", false)
        .is("users.deletedAt", null)
        .eq("student_academic_history.isCurrent", true),
      supabase
        .from("student_fee_obligation")
        .select(
          `
          studentId,
          collegeBranchId,
          totalAmount,
          createdAt,
          student_fee_collection (
            collectedAmount
          ),
          students!inner (
            collegeId,
            status,
            isActive,
            deletedAt
          )
        `,
        )
        .eq("collegeEducationId", collegeEducationId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .eq("students.collegeId", collegeId)
        .eq("students.status", "Active")
        .eq("students.isActive", true)
        .is("students.deletedAt", null),
    ]);

  if (educationResult.error) throw educationResult.error;
  if (branchesResult.error) throw branchesResult.error;
  if (studentsResult.error) throw studentsResult.error;
  if (obligationsResult.error) throw obligationsResult.error;

  const education = educationResult.data as EducationRow | null;
  const branches = (branchesResult.data ?? []) as BranchRow[];
  const students = (studentsResult.data ?? []) as StudentRow[];
  const obligations = (obligationsResult.data ?? []) as FeeObligationRow[];

  const years = Array.from(
    new Set(
      obligations
        .map((obligation) => getYear(obligation.createdAt))
        .filter((year): year is string => Boolean(year)),
    ),
  ).sort((a, b) => Number(b) - Number(a));

  if (years.length === 0) years.push(String(new Date().getFullYear()));

  const activeYear = selectedYear && years.includes(selectedYear)
    ? selectedYear
    : years[0];
  const filteredObligations = obligations.filter(
    (obligation) => getYear(obligation.createdAt) === activeYear,
  );

  const educationTotals = filteredObligations.reduce(
    (totals, obligation) => {
      const collected = sumCollected(obligation.student_fee_collection);
      const totalFees = Number(obligation.totalAmount ?? 0);
      totals.collected += collected;
      totals.totalFees += totalFees;
      return totals;
    },
    { collected: 0, totalFees: 0 },
  );

  const educationRows = education
    ? [
        {
          id: education.collegeEducationId,
          name: education.collegeEducationType,
          students: students.length,
          collected: educationTotals.collected,
          pending: Math.max(
            educationTotals.totalFees - educationTotals.collected,
            0,
          ),
          totalFees: educationTotals.totalFees,
        },
      ]
    : [];

  const studentsByBranch = new Map<number, number>();
  students.forEach((student) => {
    if (!student.collegeBranchId) return;
    studentsByBranch.set(
      student.collegeBranchId,
      (studentsByBranch.get(student.collegeBranchId) ?? 0) + 1,
    );
  });

  const branchTotals = new Map<number, { collected: number; totalFees: number }>();
  filteredObligations.forEach((obligation) => {
    if (!obligation.collegeBranchId) return;
    const current = branchTotals.get(obligation.collegeBranchId) ?? {
      collected: 0,
      totalFees: 0,
    };
    current.collected += sumCollected(obligation.student_fee_collection);
    current.totalFees += Number(obligation.totalAmount ?? 0);
    branchTotals.set(obligation.collegeBranchId, current);
  });

  const branchRows = branches.map((branch) => {
    const totals = branchTotals.get(branch.collegeBranchId) ?? {
      collected: 0,
      totalFees: 0,
    };

    return {
      id: branch.collegeBranchId,
      name: branch.collegeBranchCode || branch.collegeBranchType || "Branch",
      students: studentsByBranch.get(branch.collegeBranchId) ?? 0,
      collected: totals.collected,
      pending: Math.max(totals.totalFees - totals.collected, 0),
      totalFees: totals.totalFees,
    };
  });

  return { years, educationRows, branchRows };
}
