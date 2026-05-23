import { supabase } from "@/lib/supabaseClient";

export type MonthlyFeeCollectionRow = {
  month: string;
  amount: number;
};

type FeeCollectionRow = {
  collectedAmount?: number | string | null;
  createdAt?: string | null;
};

type FeeObligationRow = {
  student_fee_collection?: FeeCollectionRow[] | null;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function fetchMonthlyFeeCollection(
  collegeId: number | null | undefined,
  collegeEducationId: number | null | undefined,
  year = new Date().getFullYear(),
): Promise<MonthlyFeeCollectionRow[]> {
  const monthlyTotals = MONTH_LABELS.map((month) => ({ month, amount: 0 }));

  if (!collegeId || !collegeEducationId) return monthlyTotals;

  const { data, error } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      student_fee_collection (
        collectedAmount,
        createdAt
      ),
      students!inner (
        studentId,
        collegeId,
        status,
        isActive,
        deletedAt,
        users!inner (
          role,
          collegeId,
          isActive,
          is_deleted,
          deletedAt
        )
      )
    `,
    )
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("students.collegeId", collegeId)
    .eq("students.status", "Active")
    .eq("students.isActive", true)
    .is("students.deletedAt", null)
    .eq("students.users.role", "Student")
    .eq("students.users.collegeId", collegeId)
    .eq("students.users.isActive", true)
    .eq("students.users.is_deleted", false)
    .is("students.users.deletedAt", null);

  if (error) throw error;

  ((data ?? []) as FeeObligationRow[]).forEach((obligation) => {
    (obligation.student_fee_collection ?? []).forEach((collection) => {
      const collectionDate = collection.createdAt
        ? new Date(collection.createdAt)
        : null;

      if (
        !collectionDate ||
        Number.isNaN(collectionDate.getTime()) ||
        collectionDate.getFullYear() !== year
      ) {
        return;
      }

      const monthIndex = collectionDate.getMonth();
      monthlyTotals[monthIndex].amount += Number(collection.collectedAmount ?? 0);
    });
  });

  return monthlyTotals;
}
