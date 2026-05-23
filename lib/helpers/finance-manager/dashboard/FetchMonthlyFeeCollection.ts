import { supabase } from "@/lib/supabaseClient";

export type MonthlyFeeCollectionRow = {
  month: string;
  amount: number;
};

export type MonthlyPaymentModeBreakdownRow = {
  feeType: string;
  amountCollected: number;
};

export type MonthlyRecentTransactionRow = {
  studentName: string;
  studentId: string;
  year: string;
  semester: string;
  amountPaid: number;
  paymentMode: string;
  transactionDate: string;
};

export type MonthlyFeeCollectionDetails = {
  paymentModeBreakdown: MonthlyPaymentModeBreakdownRow[];
  recentTransactions: MonthlyRecentTransactionRow[];
};

type FeeCollectionRow = {
  collectedAmount?: number | string | null;
  createdAt?: string | null;
};

type FeeObligationRow = {
  student_fee_collection?: FeeCollectionRow[] | null;
};

type PaymentTransactionRow = {
  paidAmount?: number | string | null;
  paymentMode?: string | null;
  paymentDate?: string | null;
  paymentStatus?: string | null;
  createdAt?: string | null;
};

type StudentUserRow = {
  fullName?: string | null;
};

type StudentPinRow = {
  pinNumber?: string | null;
};

type AcademicHistoryRow = {
  isCurrent?: boolean | null;
  college_academic_year?: { collegeAcademicYear?: string | null } | null;
  college_semester?: { collegeSemester?: number | null } | null;
};

type FeeTransactionObligationRow = {
  students?: {
    studentId?: number | null;
    users?: StudentUserRow | StudentUserRow[] | null;
    student_pins?: StudentPinRow | StudentPinRow[] | null;
    student_academic_history?: AcademicHistoryRow[] | null;
  } | null;
  student_payment_transaction?: PaymentTransactionRow[] | null;
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

const getFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB");
};

const getTransactionYear = (transaction: PaymentTransactionRow) => {
  const dateValue = transaction.paymentDate || transaction.createdAt;
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
};

const formatPaymentMode = (mode: string | null | undefined) => {
  const normalizedMode = String(mode || "").trim().toLowerCase();

  if (normalizedMode === "stripe") return "Online Payment";
  if (normalizedMode === "upi") return "UPI";
  if (normalizedMode === "cash") return "Cash";
  if (normalizedMode === "bank_transfer" || normalizedMode === "bank transfer") {
    return "Bank Transfer";
  }
  if (normalizedMode === "card") return "Card";
  if (normalizedMode === "net_banking" || normalizedMode === "net banking") {
    return "Net Banking";
  }

  return mode?.trim() || "Unknown";
};

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

export async function fetchMonthlyFeeCollectionDetails(
  collegeId: number | null | undefined,
  collegeEducationId: number | null | undefined,
  year = new Date().getFullYear(),
): Promise<MonthlyFeeCollectionDetails> {
  if (!collegeId || !collegeEducationId) {
    return { paymentModeBreakdown: [], recentTransactions: [] };
  }

  const { data, error } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      students!inner (
        studentId,
        collegeId,
        status,
        isActive,
        deletedAt,
        users!inner (
          fullName,
          role,
          collegeId,
          isActive,
          is_deleted,
          deletedAt
        ),
        student_pins (
          pinNumber
        ),
        student_academic_history (
          isCurrent,
          college_academic_year (
            collegeAcademicYear
          ),
          college_semester (
            collegeSemester
          )
        )
      ),
      student_payment_transaction (
        paidAmount,
        paymentMode,
        paymentDate,
        paymentStatus,
        createdAt
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

  const paymentModeMap = new Map<string, number>();
  const recentTransactions: MonthlyRecentTransactionRow[] = [];

  ((data ?? []) as FeeTransactionObligationRow[]).forEach((obligation) => {
    const student = obligation.students;
    const user = getFirst(student?.users);
    const pin = getFirst(student?.student_pins);
    const currentHistory =
      student?.student_academic_history?.find((history) => history.isCurrent) ??
      student?.student_academic_history?.[0] ??
      null;
    const academicYear = getFirst(currentHistory?.college_academic_year);
    const semester = getFirst(currentHistory?.college_semester);

    (obligation.student_payment_transaction ?? []).forEach((transaction) => {
      if (String(transaction.paymentStatus || "").toLowerCase() !== "success") {
        return;
      }

      if (getTransactionYear(transaction) !== year) return;

      const amount = Number(transaction.paidAmount ?? 0);
      const paymentMode = formatPaymentMode(transaction.paymentMode);
      paymentModeMap.set(
        paymentMode,
        (paymentModeMap.get(paymentMode) ?? 0) + amount,
      );

      recentTransactions.push({
        studentName: user?.fullName || "Unknown Student",
        studentId: pin?.pinNumber || String(student?.studentId ?? "N/A"),
        year: academicYear?.collegeAcademicYear || "N/A",
        semester: semester?.collegeSemester
          ? `Semester ${semester.collegeSemester}`
          : "N/A",
        amountPaid: amount,
        paymentMode,
        transactionDate: formatDate(transaction.paymentDate || transaction.createdAt),
      });
    });
  });

  recentTransactions.sort((a, b) => {
    const dateA = new Date(a.transactionDate.split("/").reverse().join("-"));
    const dateB = new Date(b.transactionDate.split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  return {
    paymentModeBreakdown: Array.from(paymentModeMap.entries())
      .map(([feeType, amountCollected]) => ({ feeType, amountCollected }))
      .sort((a, b) => b.amountCollected - a.amountCollected),
    recentTransactions,
  };
}
