export const EMPLOYEE_SALARY_PAYMENT_METHODS = [
  "banktransfer",
  "neft",
  "rtgs",
  "imps",
  "upi",
  "cheque",
  "cash",
] as const;

export type EmployeeSalaryPaymentMethod =
  (typeof EMPLOYEE_SALARY_PAYMENT_METHODS)[number];

type BaseEmployeeSalaryPaymentInput = {
  employeeId: number;
  payrollRunId: number;
  collegeId: number;
  createdBy: number;
  paymentDate: string;
  remarks?: string | null;
};

export type CreateEmployeeSalaryPaymentInput =
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "banktransfer";
      transactionId: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "neft";
      neftUtrNumber: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "rtgs";
      rtgsUtrNumber: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "imps";
      impsReferenceNumber: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "upi";
      upiTransactionId: string;
      upiId: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "cheque";
      chequeNo: string;
      bankName: string;
      chequeDate: string;
    })
  | (BaseEmployeeSalaryPaymentInput & {
      paymentMethod: "cash";
      receiptNumber: string;
    });

export type EmployeeSalaryPayment = {
  paymentId: number;
  employeeId: number;
  payrollRunId: number;
  paymentMethod: EmployeeSalaryPaymentMethod;
  paymentDate: string;
  remarks: string | null;
  transactionId: string | null;
  neftUtrNumber: string | null;
  rtgsUtrNumber: string | null;
  impsReferenceNumber: string | null;
  upiTransactionId: string | null;
  upiId: string | null;
  chequeNo: string | null;
  bankName: string | null;
  chequeDate: string | null;
  receiptNumber: string | null;
  collegeId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creator?: {
    fullName: string | null;
    role: string | null;
  } | null;
};

export type AccountantPayrollQueueEmployee = {
  payrollEntryId: number;
  payrollRunId: number;
  employeeIdPk: number;
  userId: number;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  payrollMonth: number;
  payrollYear: number;
  monthlySalary: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  fullDaysWorked: number;
  halfDays: number;
  lopDays: number;
  paymentStatus: "ready" | "paid" | "bank-details-missing";
  bank: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    branch: string;
  } | null;
  payment: EmployeeSalaryPayment | null;
};

export type AccountantPayrollQueueResult = {
  run: {
    payrollRunId: number;
    payrollMonth: number;
    payrollYear: number;
    totalStaff: number;
    totalNetPay: number;
    status: string;
    processedAt: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    processor: {
      fullName: string | null;
      role: string | null;
    } | null;
  } | null;
  employees: AccountantPayrollQueueEmployee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  summary: {
    totalCount: number;
    totalNetPay: number;
    readyCount: number;
    readyNetPay: number;
    paidCount: number;
    paidNetPay: number;
    bankDetailsMissingCount: number;
  };
};

export type AttendanceAdjustment = {
  adjustmentId: number;
  oldCheckIn: string | null;
  oldCheckOut: string | null;
  newCheckIn: string | null;
  newCheckOut: string | null;
  reason: string | null;
  adjustedBy: number;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeAttendanceDay = {
  attendanceDailyId: number;
  userId: number;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  totalMinutes: number | null;
  status: string;
  lateByMinutes: number | null;
  earlyOutMinutes: number | null;
  isManual: boolean | null;
  markedReason: string | null;
  attendance_adjustments: AttendanceAdjustment[] | null;
};

type RelatedUser = {
  fullName: string | null;
  email: string | null;
  role: string | null;
  employee_ids:
    | { employeeIdPk: number; employeeId: string }[]
    | { employeeIdPk: number; employeeId: string }
    | null;
  staff_bank_details:
    | {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        branch: string | null;
        isPrimary: boolean | null;
        isActive: boolean | null;
      }[]
    | null;
};

type PayrollEntryRow = {
  payrollEntryId: number;
  payrollRunId: number;
  userId: number;
  monthlySalary: number | string;
  grossEarnings: number | string;
  totalDeductions: number | string;
  netPay: number | string;
  fullDaysWorked: number;
  halfDays: number;
  lopDays: number;
  user: RelatedUser | RelatedUser[] | null;
};

function payrollAmount(value: number | string, field: string): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid ${field} value received for a payroll entry.`);
  }
  return amount;
}

function requirePositiveInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
}

function requireText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required.`);
  if (normalized.length > 255) {
    throw new Error(`${label} cannot exceed 255 characters.`);
  }
  return normalized;
}

function validateDate(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} is invalid.`);

  const today = new Date().toISOString().slice(0, 10);
  if (value > today) throw new Error(`${label} cannot be in the future.`);
}

function toInsertRow(input: CreateEmployeeSalaryPaymentInput, now: string) {
  requirePositiveInteger(input.employeeId, "Employee ID");
  requirePositiveInteger(input.payrollRunId, "Payroll run ID");
  requirePositiveInteger(input.collegeId, "College ID");
  requirePositiveInteger(input.createdBy, "Created by");
  validateDate(input.paymentDate, "Payment date");

  const remarks = input.remarks?.trim() || null;
  if (remarks && remarks.length > 255) {
    throw new Error("Remarks cannot exceed 255 characters.");
  }

  const row = {
    employeeId: input.employeeId,
    payrollRunId: input.payrollRunId,
    paymentMethod: input.paymentMethod,
    paymentDate: input.paymentDate,
    remarks,
    transactionId: null as string | null,
    neftUtrNumber: null as string | null,
    rtgsUtrNumber: null as string | null,
    impsReferenceNumber: null as string | null,
    upiTransactionId: null as string | null,
    upiId: null as string | null,
    chequeNo: null as string | null,
    bankName: null as string | null,
    chequeDate: null as string | null,
    receiptNumber: null as string | null,
    collegeId: input.collegeId,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  switch (input.paymentMethod) {
    case "banktransfer":
      row.transactionId = requireText(input.transactionId, "Transaction ID");
      break;
    case "neft":
      row.neftUtrNumber = requireText(input.neftUtrNumber, "NEFT UTR number");
      break;
    case "rtgs":
      row.rtgsUtrNumber = requireText(input.rtgsUtrNumber, "RTGS UTR number");
      break;
    case "imps":
      row.impsReferenceNumber = requireText(
        input.impsReferenceNumber,
        "IMPS reference number",
      );
      break;
    case "upi":
      row.upiTransactionId = requireText(
        input.upiTransactionId,
        "UPI transaction ID",
      );
      row.upiId = requireText(input.upiId, "UPI ID");
      break;
    case "cheque":
      row.chequeNo = requireText(input.chequeNo, "Cheque number");
      row.bankName = requireText(input.bankName, "Bank name");
      validateDate(input.chequeDate, "Cheque date");
      row.chequeDate = input.chequeDate;
      break;
    case "cash":
      row.receiptNumber = requireText(input.receiptNumber, "Receipt number");
      break;
  }

  return row;
}

function throwInsertError(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    throw new Error(
      "A salary payment already exists for one of these employees in this payroll run.",
    );
  }
  if (error.code === "23503") {
    throw new Error(
      "The employee, college, or creator is no longer available. Refresh and try again.",
    );
  }
  throw new Error(error.message || "Unable to record the salary payment.");
}

export async function createEmployeeSalaryPayments(
  inputs: CreateEmployeeSalaryPaymentInput[],
): Promise<EmployeeSalaryPayment[]> {
  if (inputs.length === 0) {
    throw new Error("Select at least one employee payment to record.");
  }

  const batchKeys = new Set<string>();
  inputs.forEach((input) => {
    const key = `${input.collegeId}:${input.payrollRunId}:${input.employeeId}`;
    if (batchKeys.has(key)) {
      throw new Error(
        "The same employee and payroll run cannot appear more than once in a batch.",
      );
    }
    batchKeys.add(key);
  });

  const now = new Date().toISOString();
  const rows = inputs.map((input) => toInsertRow(input, now));
  const response = await fetch("/api/accountant/payroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payments: rows }),
  });
  const result = await response.json();
  if (!response.ok) {
    throwInsertError({ message: result.error || "Unable to record salary payments." });
  }
  return (result.payments ?? []) as EmployeeSalaryPayment[];
}

export async function createEmployeeSalaryPayment(
  input: CreateEmployeeSalaryPaymentInput,
): Promise<EmployeeSalaryPayment> {
  const [payment] = await createEmployeeSalaryPayments([input]);
  if (!payment) throw new Error("The salary payment could not be recorded.");
  return payment;
}

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function fetchAccountantPayrollQueue(
  collegeId: number,
  month?: number,
  year?: number,
  options: {
    search?: string;
    status?: "all" | "ready" | "paid" | "bank-details-missing";
    page?: number;
    limit?: number;
    entryId?: number;
  } = {},
): Promise<AccountantPayrollQueueResult> {
  requirePositiveInteger(collegeId, "College ID");

  const search = new URLSearchParams();
  if (month !== undefined && year !== undefined) {
    search.set("month", String(month));
    search.set("year", String(year));
  }
  if (options.search?.trim()) search.set("search", options.search.trim());
  if (options.status && options.status !== "all") search.set("status", options.status);
  if (options.entryId) search.set("entryId", String(options.entryId));
  search.set("page", String(options.page ?? 1));
  search.set("limit", String(options.limit ?? 20));
  const query = search.size ? `?${search}` : "";
  const response = await fetch(`/api/accountant/payroll${query}`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Unable to load payroll records.");
  }
  const run = result.run;
  if (!run) {
    return {
      run: null,
      employees: [],
      pagination: { page: 1, limit: options.limit ?? 20, total: 0 },
      summary: {
        totalCount: 0,
        totalNetPay: 0,
        readyCount: 0,
        readyNetPay: 0,
        paidCount: 0,
        paidNetPay: 0,
        bankDetailsMissingCount: 0,
      },
    };
  }
  const entries = (result.entries ?? []) as PayrollEntryRow[];
  const payments = (result.payments ?? []) as EmployeeSalaryPayment[];

  const paymentByEmployee = new Map<number, EmployeeSalaryPayment>();
  payments.forEach((payment) => {
    if (!paymentByEmployee.has(payment.employeeId)) {
      paymentByEmployee.set(payment.employeeId, payment);
    }
  });

  const employees = entries.flatMap<AccountantPayrollQueueEmployee>((entry) => {
    const user = firstRelated(entry.user);
    const employeeId = firstRelated(user?.employee_ids);
    if (!user || !employeeId) return [];

    const primaryBank = (user.staff_bank_details ?? []).find(
      (bank) => bank.isPrimary !== false && bank.isActive !== false,
    ) ?? null;
    const payment = paymentByEmployee.get(employeeId.employeeIdPk) ?? null;

    return [{
      payrollEntryId: Number(entry.payrollEntryId),
      payrollRunId: Number(entry.payrollRunId),
      employeeIdPk: Number(employeeId.employeeIdPk),
      userId: Number(entry.userId),
      employeeId: employeeId.employeeId,
      name: user.fullName?.trim() || `User #${entry.userId}`,
      email: user.email?.trim() || "-",
      role: user.role?.trim() || "Staff",
      payrollMonth: Number(run.payrollMonth),
      payrollYear: Number(run.payrollYear),
      // These are finalized payroll values. Keep each database column independent:
      // gross pay, deductions, and net pay must never be derived in the client.
      monthlySalary: payrollAmount(entry.monthlySalary, "monthlySalary"),
      grossEarnings: payrollAmount(entry.grossEarnings, "grossEarnings"),
      totalDeductions: payrollAmount(entry.totalDeductions, "totalDeductions"),
      netPay: payrollAmount(entry.netPay, "netPay"),
      fullDaysWorked: Number(entry.fullDaysWorked) || 0,
      halfDays: Number(entry.halfDays) || 0,
      lopDays: Number(entry.lopDays) || 0,
      paymentStatus: payment ? "paid" : primaryBank ? "ready" : "bank-details-missing",
      bank: primaryBank ? {
        bankName: primaryBank.bankName,
        accountNumber: primaryBank.accountNumber,
        ifscCode: primaryBank.ifscCode,
        accountHolderName: primaryBank.accountHolderName,
        branch: primaryBank.branch || "",
      } : null,
      payment,
    }];
  });

  return {
    run: {
      payrollRunId: Number(run.payrollRunId),
      payrollMonth: Number(run.payrollMonth),
      payrollYear: Number(run.payrollYear),
      totalStaff: Number(run.totalStaff) || employees.length,
      totalNetPay: Number(run.totalNetPay) || 0,
      status: run.status,
      processedAt: run.processedAt ?? null,
      paidAt: run.paidAt ?? null,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      processor: firstRelated(run.processor),
    },
    employees,
    pagination: {
      page: Number(result.pagination?.page) || 1,
      limit: Number(result.pagination?.limit) || options.limit || 20,
      total: Number(result.pagination?.total) || 0,
    },
    summary: {
      totalCount: Number(result.summary?.totalCount) || 0,
      totalNetPay: payrollAmount(result.summary?.totalNetPay ?? 0, "totalNetPay"),
      readyCount: Number(result.summary?.readyCount) || 0,
      readyNetPay: payrollAmount(result.summary?.readyNetPay ?? 0, "readyNetPay"),
      paidCount: Number(result.summary?.paidCount) || 0,
      paidNetPay: payrollAmount(result.summary?.paidNetPay ?? 0, "paidNetPay"),
      bankDetailsMissingCount: Number(result.summary?.bankDetailsMissingCount) || 0,
    },
  };
}

export async function fetchEmployeeMonthlyAttendance(
  userId: number,
  month: number,
  year: number,
): Promise<EmployeeAttendanceDay[]> {
  requirePositiveInteger(userId, "Employee user ID");
  const search = new URLSearchParams({
    userId: String(userId),
    month: String(month),
    year: String(year),
  });
  const response = await fetch(`/api/accountant/payroll/attendance?${search}`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load employee attendance.");
  return (result.attendance ?? []) as EmployeeAttendanceDay[];
}
