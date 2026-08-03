import { supabase } from "@/lib/supabaseClient";

export type AccountantReimbursementTransaction = {
  employeeExpenseReportId: number;
  employeeExpensePaymentId: number;
  employeeId: number;
  employeeName: string;
  expenseTitle: string;
  expenseCategory: string;
  expenseDate: string;
  amountSpent: number;
  description: string;
  paymentBank: string;
  paymentMethod: string;
  transactionId: string | null;
  paymentDate: string;
  remarks: string | null;
  createdBy: number;
  createdByName: string;
  attachments: Array<{
    expenseAttachmentId: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
};

type ReportRow = {
  employeeExpenseReportId: number;
  employeeId: number;
  expenseTitle: string;
  expenseCategory: string;
  expenseDate: string;
  amountSpent: number | string;
  description: string;
  paymentBank: string;
  attachments: AccountantReimbursementTransaction["attachments"] | null;
};

type PaymentRow = {
  employeeExpensePaymentId: number;
  employeeExpenseReportId: number;
  paymentMethod: string;
  transactionId: string | null;
  paymentDate: string;
  remarks: string | null;
  createdBy: number;
};

type UserRelation = { fullName?: string | null } | { fullName?: string | null }[] | null;

const relationName = (relation: UserRelation, fallback: string) => {
  const value = Array.isArray(relation) ? relation[0]?.fullName : relation?.fullName;
  return value?.trim() || fallback;
};

export async function fetchAccountantReimbursementTransactions(
  collegeId: number | null | undefined,
): Promise<AccountantReimbursementTransaction[]> {
  if (!collegeId) return [];

  const { data: reports, error: reportsError } = await supabase
    .from("employee_expense_reports")
    .select(`
      employeeExpenseReportId,
      employeeId,
      expenseTitle,
      expenseCategory,
      expenseDate,
      amountSpent,
      description,
      paymentBank,
      attachments:employee_expense_attachments(
        expenseAttachmentId,
        fileName,
        fileUrl,
        fileType,
        fileSize
      )
    `)
    .eq("collegeId", collegeId)
    .is("deletedAt", null);

  if (reportsError) throw reportsError;
  const reportRows = (reports ?? []) as ReportRow[];
  if (!reportRows.length) return [];

  const reportIds = reportRows.map((report) => report.employeeExpenseReportId);
  const { data: payments, error: paymentsError } = await supabase
    .from("employee_expense_payments")
    .select(
      "employeeExpensePaymentId, employeeExpenseReportId, paymentMethod, transactionId, paymentDate, remarks, createdBy",
    )
    .in("employeeExpenseReportId", reportIds)
    .is("deletedAt", null)
    .order("paymentDate", { ascending: false });

  if (paymentsError) throw paymentsError;
  const paymentRows = (payments ?? []) as PaymentRow[];
  if (!paymentRows.length) return [];

  const employeeIds = [...new Set(reportRows.map((report) => report.employeeId))];
  const creatorIds = [...new Set(paymentRows.map((payment) => payment.createdBy))];
  const [{ data: employees }, { data: creators }] = await Promise.all([
    supabase
      .from("employee_ids")
      .select("employeeIdPk, users(fullName)")
      .in("employeeIdPk", employeeIds),
    supabase.from("users").select("userId, fullName").in("userId", creatorIds),
  ]);

  const employeeNames = new Map<number, string>();
  (employees ?? []).forEach((employee) => {
    employeeNames.set(
      Number(employee.employeeIdPk),
      relationName(employee.users as UserRelation, `Employee #${employee.employeeIdPk}`),
    );
  });
  const creatorNames = new Map(
    (creators ?? []).map((creator) => [
      Number(creator.userId),
      creator.fullName?.trim() || `User #${creator.userId}`,
    ]),
  );
  const reportsById = new Map(
    reportRows.map((report) => [report.employeeExpenseReportId, report]),
  );

  return paymentRows.flatMap((payment) => {
    const report = reportsById.get(payment.employeeExpenseReportId);
    if (!report) return [];
    return [{
      ...payment,
      employeeId: report.employeeId,
      employeeName: employeeNames.get(report.employeeId) ?? `Employee #${report.employeeId}`,
      expenseTitle: report.expenseTitle,
      expenseCategory: report.expenseCategory,
      expenseDate: report.expenseDate,
      amountSpent: Number(report.amountSpent) || 0,
      description: report.description,
      paymentBank: report.paymentBank,
      createdByName: creatorNames.get(payment.createdBy) ?? `User #${payment.createdBy}`,
      attachments: report.attachments ?? [],
    }];
  });
}

export function formatReimbursementAmount(value: number) {
  return `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
