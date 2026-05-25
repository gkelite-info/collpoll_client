import { supabase } from "@/lib/supabaseClient";

export type FinancePendingAlert = {
  id: string;
  message: string;
  timeLabel: string;
  sortTimestamp: number;
};

type EducationRow = {
  collegeEducationType?: string | null;
};

type LedgerRow = {
  amount?: number | string | null;
  createdAt?: string | null;
};

type CollectionRow = {
  collectedAmount?: number | string | null;
  createdAt?: string | null;
};

type BranchRow = {
  collegeBranchCode?: string | null;
};

type ObligationRow = {
  studentFeeObligationId: number;
  collegeBranchId?: number | null;
  totalAmount?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  college_branch?: BranchRow | BranchRow[] | null;
  student_fee_ledger?: LedgerRow[] | null;
  student_fee_collection?: CollectionRow[] | null;
};

const getFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const formatShortCurrency = (value: number) => {
  const amount = Math.max(Number(value) || 0, 0);
  if (amount >= 10000000) return `\u20B9${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `\u20B9${Math.round(amount / 1000)} K`;
  return `\u20B9${Math.round(amount).toLocaleString("en-IN")}`;
};

const sumLedger = (rows: LedgerRow[] | null | undefined) =>
  (rows ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

const sumCollections = (rows: CollectionRow[] | null | undefined) =>
  (rows ?? []).reduce(
    (sum, row) => sum + Number(row.collectedAmount ?? 0),
    0,
  );

const getObligationTimestamp = (obligation: ObligationRow) => {
  const timestamps = [
    obligation.updatedAt,
    obligation.createdAt,
    ...(obligation.student_fee_ledger ?? []).map((row) => row.createdAt),
    ...(obligation.student_fee_collection ?? []).map((row) => row.createdAt),
  ];

  return timestamps
    .map((timestamp) => (timestamp ? new Date(timestamp).getTime() : 0))
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0)
    .sort((a, b) => b - a)[0];
};

const getLatestTimestamp = (timestamps: Array<number | undefined>) =>
  timestamps
    .filter((timestamp): timestamp is number =>
      Boolean(timestamp && Number.isFinite(timestamp)),
    )
    .sort((a, b) => b - a)[0] ?? Date.now();

const formatRelativeTime = (timestamp?: number) => {
  if (!timestamp) return "Just now";

  const diffMs = Math.max(Date.now() - timestamp, 0);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}mins ago`;
  if (hours < 24) return `${hours}hrs ago`;
  return `${days}d ago`;
};

export async function fetchFinancePendingAlerts(
  collegeId: number | null | undefined,
  collegeEducationId: number | null | undefined,
): Promise<FinancePendingAlert[]> {
  if (!collegeId || !collegeEducationId) return [];

  const [educationResult, obligationsResult] = await Promise.all([
    supabase
      .from("college_education")
      .select("collegeEducationType")
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeId", collegeId)
      .maybeSingle(),
    supabase
      .from("student_fee_obligation")
      .select(
        `
        studentFeeObligationId,
        collegeBranchId,
        totalAmount,
        createdAt,
        updatedAt,
        college_branch (
          collegeBranchCode
        ),
        student_fee_ledger (
          amount,
          createdAt
        ),
        student_fee_collection (
          collectedAmount,
          createdAt
        ),
        students!inner (
          collegeId,
          collegeEducationId,
          status,
          isActive,
          deletedAt,
          users!inner (
            role,
            collegeId,
            isActive,
            is_deleted,
            deletedAt
          ),
          student_academic_history!inner (
            isCurrent
          )
        )
      `,
      )
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null)
      .eq("students.collegeId", collegeId)
      .eq("students.collegeEducationId", collegeEducationId)
      .eq("students.status", "Active")
      .eq("students.isActive", true)
      .is("students.deletedAt", null)
      .eq("students.users.role", "Student")
      .eq("students.users.collegeId", collegeId)
      .eq("students.users.isActive", true)
      .eq("students.users.is_deleted", false)
      .is("students.users.deletedAt", null)
      .eq("students.student_academic_history.isCurrent", true),
  ]);

  if (educationResult.error) throw educationResult.error;
  if (obligationsResult.error) throw obligationsResult.error;

  const education = educationResult.data as EducationRow | null;
  const obligations = (obligationsResult.data ?? []) as ObligationRow[];
  const educationLabel = education?.collegeEducationType || "this program";
  const feeRows = obligations.map((obligation) => {
    const ledgerPaid = sumLedger(obligation.student_fee_ledger);
    const collectionPaid = sumCollections(obligation.student_fee_collection);
    const paid = ledgerPaid > 0 ? ledgerPaid : collectionPaid;
    const total = Number(obligation.totalAmount ?? 0);
    const branch = getFirst(obligation.college_branch);

    return {
      branchCode: branch?.collegeBranchCode || "Unassigned",
      total,
      paid,
      pending: Math.max(total - paid, 0),
      timestamp: getObligationTimestamp(obligation),
    };
  });

  const partiallyPaidRows = feeRows.filter(
    (row) => row.paid > 0 && row.pending > 0,
  );

  const branchMap = new Map<
    string,
    { pending: number; unpaidStudents: number; timestamps: number[] }
  >();

  feeRows.forEach((row) => {
    const entry = branchMap.get(row.branchCode) ?? {
      pending: 0,
      unpaidStudents: 0,
      timestamps: [],
    };
    entry.pending += row.pending;
    if (row.paid <= 0 && row.pending > 0) entry.unpaidStudents += 1;
    if (row.timestamp) entry.timestamps.push(row.timestamp);
    branchMap.set(row.branchCode, entry);
  });

  const topPendingBranch = Array.from(branchMap.entries())
    .filter(([, entry]) => entry.pending > 0)
    .sort(([, a], [, b]) => b.pending - a.pending)[0];

  const topUnpaidBranch = Array.from(branchMap.entries())
    .filter(([, entry]) => entry.unpaidStudents > 0)
    .sort(([, a], [, b]) => b.unpaidStudents - a.unpaidStudents)[0];

  const alerts: FinancePendingAlert[] = [];

  if (partiallyPaidRows.length > 0) {
    const timestamp = getLatestTimestamp(
      partiallyPaidRows.map((row) => row.timestamp),
    );
    alerts.push({
      id: "partial-paid",
      message: `${partiallyPaidRows.length.toLocaleString("en-IN")} students from ${educationLabel} have partially paid their fees.`,
      timeLabel: formatRelativeTime(timestamp),
      sortTimestamp: timestamp,
    });
  }

  if (topPendingBranch) {
    const [branchCode, entry] = topPendingBranch;
    const timestamp = getLatestTimestamp(entry.timestamps);
    alerts.push({
      id: "branch-pending",
      message: `${formatShortCurrency(entry.pending)} pending from ${educationLabel} - ${branchCode} Branch.`,
      timeLabel: formatRelativeTime(timestamp),
      sortTimestamp: timestamp,
    });
  }

  if (topUnpaidBranch) {
    const [branchCode, entry] = topUnpaidBranch;
    const timestamp = getLatestTimestamp(entry.timestamps);
    alerts.push({
      id: "branch-unpaid",
      message: `${entry.unpaidStudents.toLocaleString("en-IN")} students from ${branchCode} branch have not paid their fees.`,
      timeLabel: formatRelativeTime(timestamp),
      sortTimestamp: timestamp,
    });
  }

  const totalPending = feeRows.reduce((sum, row) => sum + row.pending, 0);
  if (totalPending > 0) {
    const timestamp = getLatestTimestamp(feeRows.map((row) => row.timestamp));
    alerts.push({
      id: "total-pending",
      message: `Total pending fees for ${educationLabel} is ${formatShortCurrency(totalPending)}.`,
      timeLabel: formatRelativeTime(timestamp),
      sortTimestamp: timestamp,
    });
  }

  return alerts.sort((a, b) => b.sortTimestamp - a.sortTimestamp);
}
