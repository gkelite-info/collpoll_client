import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { createClient as createAuthenticatedClient } from "@/lib/supabaseServer";

const PAYMENT_METHODS = new Set([
  "banktransfer", "neft", "rtgs", "imps", "upi", "cheque", "cash",
]);
const PAYMENT_STATUSES = new Set(["ready", "paid", "bank-details-missing"]);

type PaymentInput = {
  employeeId: unknown;
  payrollRunId: unknown;
  paymentMethod: string;
  paymentDate?: string;
  remarks?: string;
  transactionId?: string;
  neftUtrNumber?: string;
  rtgsUtrNumber?: string;
  impsReferenceNumber?: string;
  upiTransactionId?: string;
  upiId?: string;
  chequeNo?: string;
  bankName?: string;
  chequeDate?: string;
  receiptNumber?: string;
};

async function getAccountantContext() {
  const authenticatedClient = await createAuthenticatedClient();
  const { data: { user }, error: authError } = await authenticatedClient.auth.getUser();
  if (authError || !user) throw new Error("UNAUTHORIZED");

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("userId, collegeId, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile || profile.role !== "Accountant" || !profile.collegeId) {
    throw new Error("FORBIDDEN");
  }
  return { admin, profile };
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected payroll error.";
  if (message === "UNAUTHORIZED") return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (message === "FORBIDDEN") return NextResponse.json({ error: "Accountant access is required." }, { status: 403 });
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { admin, profile } = await getAccountantContext();
    const requestedMonth = request.nextUrl.searchParams.get("month");
    const requestedYear = request.nextUrl.searchParams.get("year");
    const month = requestedMonth ? Number(requestedMonth) : null;
    const year = requestedYear ? Number(requestedYear) : null;
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const requestedStatus = request.nextUrl.searchParams.get("status") ?? "all";
    const requestedPage = Number(request.nextUrl.searchParams.get("page") ?? 1);
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const requestedEntryId = request.nextUrl.searchParams.get("entryId");
    const entryId = requestedEntryId ? Number(requestedEntryId) : null;
    if ((month === null) !== (year === null)) {
      return NextResponse.json({ error: "Payroll month and year must be selected together." }, { status: 400 });
    }
    if (month !== null && (!Number.isSafeInteger(month) || month < 1 || month > 12)) {
      return NextResponse.json({ error: "Invalid payroll month." }, { status: 400 });
    }
    if (year !== null && (!Number.isSafeInteger(year) || year < 2000 || year > 2100)) {
      return NextResponse.json({ error: "Invalid payroll year." }, { status: 400 });
    }
    if (requestedStatus !== "all" && !PAYMENT_STATUSES.has(requestedStatus)) {
      return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    }
    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) {
      return NextResponse.json({ error: "Invalid page number." }, { status: 400 });
    }
    if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100) {
      return NextResponse.json({ error: "Invalid page size." }, { status: 400 });
    }
    if (entryId !== null && (!Number.isSafeInteger(entryId) || entryId < 1)) {
      return NextResponse.json({ error: "Invalid payroll entry." }, { status: 400 });
    }

    let entryRunId: number | null = null;
    if (entryId !== null) {
      const { data: entryReference, error: entryReferenceError } = await admin
        .from("payroll_entries")
        .select("payrollRunId")
        .eq("payrollEntryId", entryId)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .maybeSingle();
      if (entryReferenceError) throw entryReferenceError;
      entryRunId = entryReference ? Number(entryReference.payrollRunId) : null;
      if (!entryRunId) {
        return NextResponse.json({ run: null, entries: [], payments: [] });
      }
    }

    let runQuery = admin
      .from("payroll_runs")
      .select("payrollRunId, payrollMonth, payrollYear, totalStaff, totalNetPay, status, processedAt, paidAt, createdAt, updatedAt, processor:processedBy(fullName, role)")
      .eq("collegeId", profile.collegeId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .in("status", ["finalized", "paid"]);
    if (entryRunId !== null) {
      runQuery = runQuery.eq("payrollRunId", entryRunId);
    } else if (month !== null && year !== null) {
      runQuery = runQuery.eq("payrollMonth", month).eq("payrollYear", year);
    }
    const { data: run, error: runError } = await runQuery
      .order("payrollYear", { ascending: false })
      .order("payrollMonth", { ascending: false })
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (runError) throw runError;
    if (!run) return NextResponse.json({ run: null, entries: [], payments: [] });

    const { data: entries, error: entryError } = await admin
      .from("payroll_entries")
      .select(`
        payrollEntryId, payrollRunId, userId, monthlySalary, grossEarnings,
        totalDeductions, netPay, fullDaysWorked, halfDays, lopDays,
        user:userId!inner (
          fullName, email, role,
          employee_ids (employeeIdPk, employeeId),
          staff_bank_details (
            bankName, accountNumber, ifscCode, accountHolderName, branch,
            isPrimary, isActive
          )
        )
      `)
      .eq("payrollRunId", run.payrollRunId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .order("createdAt", { ascending: false });

    if (entryError) throw entryError;
    const employeeIds = (entries ?? []).flatMap((entry) => {
      const related = Array.isArray(entry.user) ? entry.user[0] : entry.user;
      const ids = related?.employee_ids;
      const employee = Array.isArray(ids) ? ids[0] : ids;
      return employee?.employeeIdPk ? [Number(employee.employeeIdPk)] : [];
    });

    let payments: unknown[] = [];
    if (employeeIds.length) {
      const { data, error } = await admin
        .from("employee_salary_payments")
        .select("*, creator:createdBy(fullName, role)")
        .eq("collegeId", profile.collegeId)
        .eq("payrollRunId", run.payrollRunId)
        .in("employeeId", employeeIds)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });
      if (error) throw error;
      payments = data ?? [];
    }

    const paymentByEmployee = new Map<number, Record<string, unknown>>();
    payments.forEach((payment) => {
      const row = payment as Record<string, unknown>;
      const employeeId = Number(row.employeeId);
      if (!paymentByEmployee.has(employeeId)) paymentByEmployee.set(employeeId, row);
    });

    const classifiedEntries = (entries ?? []).flatMap((entry) => {
      const relatedUser = Array.isArray(entry.user) ? entry.user[0] : entry.user;
      const relatedEmployee = Array.isArray(relatedUser?.employee_ids)
        ? relatedUser.employee_ids[0]
        : relatedUser?.employee_ids;
      if (!relatedUser || !relatedEmployee?.employeeIdPk) return [];

      const banks = Array.isArray(relatedUser.staff_bank_details)
        ? relatedUser.staff_bank_details
        : relatedUser.staff_bank_details
          ? [relatedUser.staff_bank_details]
          : [];
      const hasPrimaryBank = banks.some(
        (bank) => bank.isPrimary !== false && bank.isActive !== false,
      );
      const payment = paymentByEmployee.get(Number(relatedEmployee.employeeIdPk));
      const paymentStatus = payment
        ? "paid"
        : hasPrimaryBank
          ? "ready"
          : "bank-details-missing";

      const searchableText = [
        relatedUser.fullName,
        relatedUser.email,
        relatedUser.role,
        relatedEmployee.employeeId,
      ].filter(Boolean).join(" ").toLowerCase();

      return [{ entry, payment, paymentStatus, searchableText }];
    });

    const alreadyPaidUserIds = classifiedEntries
      .filter((item) => Boolean(item.payment))
      .map((item) => Number(item.entry.userId));
    if (alreadyPaidUserIds.length) {
      const syncedAt = new Date().toISOString();
      const { error: syncEntriesError } = await admin
        .from("payroll_entries")
        .update({ status: "paid", updatedAt: syncedAt })
        .eq("payrollRunId", run.payrollRunId)
        .in("userId", alreadyPaidUserIds)
        .eq("is_deleted", false)
        .is("deletedAt", null);
      if (syncEntriesError) throw syncEntriesError;
    }

    const payableItems = classifiedEntries.filter(
      (item) => (Number(item.entry.netPay) || 0) > 0,
    );
    const allPayableEntriesAreMapped = payableItems.length
      === (entries ?? []).filter((entry) => (Number(entry.netPay) || 0) > 0).length;
    const runIsPaid = payableItems.length > 0
      && allPayableEntriesAreMapped
      && payableItems.every((item) => Boolean(item.payment));
    let responseRun = run;
    if (runIsPaid && run.status !== "paid") {
      const paidAt = new Date().toISOString();
      const { error: syncRunError } = await admin
        .from("payroll_runs")
        .update({ status: "paid", paidAt, updatedAt: paidAt })
        .eq("payrollRunId", run.payrollRunId)
        .eq("collegeId", profile.collegeId);
      if (syncRunError) throw syncRunError;
      const { error: syncAllEntriesError } = await admin
        .from("payroll_entries")
        .update({ status: "paid", updatedAt: paidAt })
        .eq("payrollRunId", run.payrollRunId)
        .eq("is_deleted", false)
        .is("deletedAt", null);
      if (syncAllEntriesError) throw syncAllEntriesError;
      responseRun = { ...run, status: "paid", paidAt, updatedAt: paidAt };
    }

    const summary = classifiedEntries.reduce(
      (totals, item) => {
        const netPay = Number(item.entry.netPay) || 0;
        if (item.paymentStatus === "paid") {
          totals.paidCount += 1;
          totals.paidNetPay += netPay;
        } else if (item.paymentStatus === "ready") {
          totals.readyCount += 1;
          totals.readyNetPay += netPay;
        } else {
          totals.bankDetailsMissingCount += 1;
        }
        return totals;
      },
      {
        readyCount: 0,
        readyNetPay: 0,
        paidCount: 0,
        paidNetPay: 0,
        bankDetailsMissingCount: 0,
      },
    );
    const payrollTotals = (entries ?? []).reduce(
      (totals, entry) => {
        totals.totalCount += 1;
        totals.totalNetPay += Number(entry.netPay) || 0;
        return totals;
      },
      { totalCount: 0, totalNetPay: 0 },
    );

    const filteredEntries = classifiedEntries.filter((item) => {
      const matchesSearch = !search || item.searchableText.includes(search);
      const matchesStatus = requestedStatus === "all" || item.paymentStatus === requestedStatus;
      const matchesEntry = entryId === null || Number(item.entry.payrollEntryId) === entryId;
      return matchesSearch && matchesStatus && matchesEntry;
    });
    const from = (requestedPage - 1) * requestedLimit;
    const pageItems = filteredEntries.slice(from, from + requestedLimit);

    return NextResponse.json({
      run: responseRun,
      entries: pageItems.map((item) => item.entry),
      payments: pageItems.flatMap((item) => item.payment ? [item.payment] : []),
      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        total: filteredEntries.length,
      },
      summary: {
        ...summary,
        totalCount: payrollTotals.totalCount,
        totalNetPay: Math.round((payrollTotals.totalNetPay + Number.EPSILON) * 100) / 100,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { admin, profile } = await getAccountantContext();
    const body = await request.json();
    const rows: PaymentInput[] = Array.isArray(body?.payments) ? body.payments : [];
    if (!rows.length) return NextResponse.json({ error: "At least one payment is required." }, { status: 400 });

    const employeeIds = rows.map((row) => Number(row.employeeId));
    const payrollRunIds = Array.from(new Set(rows.map((row) => Number(row.payrollRunId))));
    if (payrollRunIds.length !== 1 || !Number.isSafeInteger(payrollRunIds[0])) {
      return NextResponse.json({ error: "All payments must belong to one valid payroll run." }, { status: 400 });
    }
    const payrollRunId = payrollRunIds[0];

    const { data: payrollRun, error: payrollRunError } = await admin
      .from("payroll_runs")
      .select("payrollRunId")
      .eq("payrollRunId", payrollRunId)
      .eq("collegeId", profile.collegeId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .in("status", ["finalized", "paid"])
      .maybeSingle();
    if (payrollRunError) throw payrollRunError;
    if (!payrollRun) {
      return NextResponse.json({ error: "The finalized payroll run was not found." }, { status: 400 });
    }

    const { data: employees, error: employeeError } = await admin
      .from("payroll_entries")
      .select("userId, user:userId!inner(employee_ids!inner(employeeIdPk))")
      .eq("payrollRunId", payrollRunId)
      .eq("is_deleted", false)
      .is("deletedAt", null);
    if (employeeError) throw employeeError;
    const allowedIds = new Set((employees ?? []).flatMap((entry) => {
      const user = Array.isArray(entry.user) ? entry.user[0] : entry.user;
      const ids = user?.employee_ids;
      const employee = Array.isArray(ids) ? ids[0] : ids;
      return employee?.employeeIdPk ? [Number(employee.employeeIdPk)] : [];
    }));
    if (employeeIds.some((id) => !allowedIds.has(id))) {
      return NextResponse.json({ error: "One or more employees do not belong to this college." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const safeRows = rows.map((row) => {
      if (!PAYMENT_METHODS.has(row.paymentMethod)) throw new Error("Invalid payment method.");
      return {
        employeeId: Number(row.employeeId),
        payrollRunId,
        paymentMethod: row.paymentMethod,
        paymentDate: row.paymentDate,
        remarks: row.remarks || null,
        transactionId: row.transactionId || null,
        neftUtrNumber: row.neftUtrNumber || null,
        rtgsUtrNumber: row.rtgsUtrNumber || null,
        impsReferenceNumber: row.impsReferenceNumber || null,
        upiTransactionId: row.upiTransactionId || null,
        upiId: row.upiId || null,
        chequeNo: row.chequeNo || null,
        bankName: row.bankName || null,
        chequeDate: row.chequeDate || null,
        receiptNumber: row.receiptNumber || null,
        collegeId: profile.collegeId,
        createdBy: profile.userId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
    });

    const { data, error } = await admin
      .from("employee_salary_payments")
      .insert(safeRows)
      .select("*, creator:createdBy(fullName, role)");
    if (error) throw error;

    const paidEmployeeIds = new Set(employeeIds);
    const paidUserIds = (employees ?? []).flatMap((entry) => {
      const user = Array.isArray(entry.user) ? entry.user[0] : entry.user;
      const ids = user?.employee_ids;
      const employee = Array.isArray(ids) ? ids[0] : ids;
      return employee?.employeeIdPk && paidEmployeeIds.has(Number(employee.employeeIdPk))
        ? [Number(entry.userId)]
        : [];
    });
    if (paidUserIds.length) {
      const entryPaidAt = new Date().toISOString();
      const { error: paidEmployeeEntriesError } = await admin
        .from("payroll_entries")
        .update({ status: "paid", updatedAt: entryPaidAt })
        .eq("payrollRunId", payrollRunId)
        .in("userId", paidUserIds)
        .eq("is_deleted", false)
        .is("deletedAt", null);
      if (paidEmployeeEntriesError) throw paidEmployeeEntriesError;
    }

    const { data: payableEntries, error: payableEntriesError } = await admin
      .from("payroll_entries")
      .select("user:userId!inner(employee_ids!inner(employeeIdPk))")
      .eq("payrollRunId", payrollRunId)
      .eq("is_deleted", false)
      .is("deletedAt", null)
      .gt("netPay", 0);
    if (payableEntriesError) throw payableEntriesError;

    const payableEmployeeIds = new Set((payableEntries ?? []).flatMap((entry) => {
      const user = Array.isArray(entry.user) ? entry.user[0] : entry.user;
      const ids = user?.employee_ids;
      const employee = Array.isArray(ids) ? ids[0] : ids;
      return employee?.employeeIdPk ? [Number(employee.employeeIdPk)] : [];
    }));

    const { data: completedPayments, error: completedPaymentsError } = await admin
      .from("employee_salary_payments")
      .select("employeeId")
      .eq("payrollRunId", payrollRunId)
      .eq("collegeId", profile.collegeId)
      .is("deletedAt", null);
    if (completedPaymentsError) throw completedPaymentsError;
    const completedEmployeeIds = new Set(
      (completedPayments ?? []).map((payment) => Number(payment.employeeId)),
    );
    const runIsComplete = payableEmployeeIds.size > 0
      && payableEmployeeIds.size === (payableEntries ?? []).length
      && [...payableEmployeeIds].every((employeeId) => completedEmployeeIds.has(employeeId));

    if (runIsComplete) {
      const paidAt = new Date().toISOString();
      const { error: paidRunError } = await admin
        .from("payroll_runs")
        .update({ status: "paid", paidAt, updatedAt: paidAt })
        .eq("payrollRunId", payrollRunId)
        .eq("collegeId", profile.collegeId);
      if (paidRunError) throw paidRunError;

      const { error: paidEntriesError } = await admin
        .from("payroll_entries")
        .update({ status: "paid", updatedAt: paidAt })
        .eq("payrollRunId", payrollRunId)
        .eq("is_deleted", false)
        .is("deletedAt", null);
      if (paidEntriesError) throw paidEntriesError;
    }

    return NextResponse.json({ payments: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}
