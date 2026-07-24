import { supabase } from "@/lib/supabaseClient";

export async function createPayrollRun(
  collegeId: number,
  month: number,
  year: number,
  processedBy: number
) {
  const response = await fetch("/api/hr/run-payroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId, month, year, processedBy }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to run payroll");
  }
  return data;
}

export async function getPayrollRuns(
  collegeId: number,
  page: number,
  limit: number,
  year?: string | number,
  status?: string,
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("payroll_runs")
    .select("*, processor:processedBy(fullName)", { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);

  if (year && year !== 'all') {
    query = query.eq("payrollYear", Number(year));
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query
    .order("payrollYear", { ascending: false })
    .order("payrollMonth", { ascending: false })
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const { data: statusRows, error: statusError } = await supabase
    .from("payroll_runs")
    .select("status")
    .eq("collegeId", collegeId)
    .eq("is_deleted", false);

  if (statusError) {
    throw new Error(statusError.message);
  }

  const statuses = Array.from(new Set((statusRows || []).map((row) => row.status).filter(Boolean)));

  const runs = data || [];
  const runIds = runs.map((run) => Number(run.payrollRunId));
  if (!runIds.length) return { runs, total: count || 0, statuses };

  const { data: runEntries, error: runEntriesError } = await supabase
    .from("payroll_entries")
    .select("payrollEntryId, payrollRunId, status")
    .in("payrollRunId", runIds)
    .eq("is_deleted", false)
    .is("deletedAt", null);
  if (runEntriesError) throw new Error(runEntriesError.message);

  const entriesByRun = new Map<number, Array<{ status: string | null }>>();
  (runEntries || []).forEach((entry) => {
    const runId = Number(entry.payrollRunId);
    if (!entriesByRun.has(runId)) entriesByRun.set(runId, []);
    entriesByRun.get(runId)?.push({ status: entry.status });
  });

  const enrichedRuns = runs.map((run) => {
    const runId = Number(run.payrollRunId);
    const payrollEntries = entriesByRun.get(runId) ?? [];
    const paidCount = payrollEntries.filter((entry) => entry.status === "paid").length;
    const payableCount = payrollEntries.length;
    const pendingCount = Math.max(0, payableCount - paidCount);
    const displayStatus = run.status === "paid" || (payableCount > 0 && pendingCount === 0)
      ? "paid"
      : paidCount > 0
        ? "partially_paid"
        : run.status;
    return {
      ...run,
      displayStatus,
      paymentProgress: { paidCount, pendingCount, payableCount },
    };
  });
  return { runs: enrichedRuns, total: count || 0, statuses };
}

export async function getPayrollEntriesByMonth(collegeId: number, month: number, year: number, page: number, limit: number, searchQuery: string = "") {
  // 1. Get the payroll_run for this month
  const { data: runData, error: runError } = await supabase
    .from("payroll_runs")
    .select("payrollRunId, totalGrossEarnings, totalDeductions, totalNetPay, totalStaff, status")
    .eq("collegeId", collegeId)
    .eq("payrollMonth", month)
    .eq("payrollYear", year)
    .eq("is_deleted", false)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (runError || !runData) {
    return { entries: [], total: 0, runStats: null };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 2. Resolve search query if present
  let matchedUserIds: number[] | null = null;
  if (searchQuery && searchQuery.trim() !== "") {
    const term = `%${searchQuery.trim()}%`;
    const [usersRes, empRes] = await Promise.all([
      supabase.from('users')
        .select('userId')
        .eq('collegeId', collegeId)
        .or(`fullName.ilike.${term},email.ilike.${term},mobile.ilike.${term}`),
      supabase.from('employee_ids')
        .select('userId')
        .eq('collegeId', collegeId)
        .ilike('employeeId', term)
    ]);
    const uIds = new Set([
      ...(usersRes.data || []).map(u => u.userId),
      ...(empRes.data || []).map(e => e.userId)
    ]);
    matchedUserIds = Array.from(uIds);
    if (matchedUserIds.length === 0) {
      return { entries: [], total: 0, runStats: runData };
    }
  }

  // 3. Get entries with pagination
  let query = supabase
    .from("payroll_entries")
    .select(`
      *,
      user:userId!inner (
        fullName,
        email,
        role,
        employee_ids (employeeId)
      )
    `, { count: "exact" })
    .eq("payrollRunId", runData.payrollRunId)
    .not("user.role", "in", "(Student,Parent,SuperAdmin,GroundStaff)")
    .eq("is_deleted", false);

  if (matchedUserIds) {
    query = query.in("userId", matchedUserIds);
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { entries: data || [], total: count || 0, runStats: runData };
}

export async function getMyPayslips(
  userId: number,
  page: number = 1,
  limit: number = 10,
  year?: number | string
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let runIdsFilter: number[] | null = null;
  if (year) {
    const { data: runsForYear, error: runError } = await supabase
      .from("payroll_runs")
      .select("payrollRunId")
      .eq("payrollYear", Number(year));
    
    if (!runError && runsForYear) {
      runIdsFilter = runsForYear.map(r => r.payrollRunId);
    }
  }

  let query = supabase
    .from("payroll_entries")
    .select("payrollEntryId, grossEarnings, totalDeductions, netPay, status, payrollRunId, createdAt", { count: "exact" })
    .eq("userId", userId)
    .eq("is_deleted", false)
    .not("status", "in", "(draft,processing,calculated)");

  if (runIdsFilter !== null) {
    if (runIdsFilter.length === 0) return { slips: [], total: 0 };
    query = query.in("payrollRunId", runIdsFilter);
  }

  const { data: entries, error: entriesError, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  if (!entries || entries.length === 0) return { slips: [], total: count || 0 };

  // Fetch runs
  const runIds = entries.map((e: any) => e.payrollRunId);
  const { data: runs, error: runsError } = await supabase
    .from("payroll_runs")
    .select("payrollRunId, payrollMonth, payrollYear, status, createdAt, processedAt, paidAt, updatedAt, processor:processedBy(fullName)")
    .in("payrollRunId", runIds);

  if (runsError) {
    throw new Error(runsError.message);
  }

  const runsMap = new Map();
  (runs || []).forEach((r: any) => runsMap.set(r.payrollRunId, r));

  const { data: employeeIdentifier, error: identifierError } = await supabase
    .from("employee_ids")
    .select("employeeIdPk")
    .eq("userId", userId)
    .maybeSingle();
  if (identifierError) throw new Error(identifierError.message);

  const paymentByRun = new Map<number, any>();
  if (employeeIdentifier?.employeeIdPk) {
    const { data: payments, error: paymentsError } = await supabase
      .from("employee_salary_payments")
      .select("payrollRunId, paymentDate, createdAt, creator:createdBy(fullName)")
      .eq("employeeId", employeeIdentifier.employeeIdPk)
      .in("payrollRunId", runIds)
      .is("deletedAt", null);
    if (paymentsError) throw new Error(paymentsError.message);
    (payments || []).forEach((payment: any) => paymentByRun.set(Number(payment.payrollRunId), payment));
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Merge and sort
  const results = entries.map((entry: any) => {
    const run = runsMap.get(entry.payrollRunId);
    if (!run) return null;

    const monthName = months[run.payrollMonth - 1] || "";
    const payment = paymentByRun.get(Number(entry.payrollRunId));
    const processor = Array.isArray(run.processor) ? run.processor[0] : run.processor;
    const creator = Array.isArray(payment?.creator) ? payment.creator[0] : payment?.creator;
    
    return {
      id: entry.payrollEntryId,
      month: `${monthName} ${run.payrollYear}`,
      date: payment?.paymentDate
        ? new Date(`${payment.paymentDate}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC" })
        : new Date(run.createdAt).toLocaleDateString('en-GB'),
      gross: entry.grossEarnings,
      deductions: entry.totalDeductions,
      net: entry.netPay,
      status: payment || entry.status === 'paid' ? 'Paid' : (entry.status === 'finalized' ? 'Generated' : entry.status),
      tracking: {
        calculatedAt: run.createdAt,
        finalizedAt: run.processedAt || (run.status === "finalized" || run.status === "paid" ? run.updatedAt : null),
        paidAt: payment?.paymentDate || payment?.createdAt || run.paidAt || null,
        processedBy: processor?.fullName || "HR Manager",
        paidBy: creator?.fullName || "Accountant",
      },
      _createdAt: new Date(run.createdAt).getTime()
    };
  }).filter(Boolean) as any[];

  const sortedSlips = results.sort((a: any, b: any) => (b._createdAt as number) - (a._createdAt as number));
  return { slips: sortedSlips, total: count || 0 };
}

export async function finalizePayrollRun(payrollRunId: number) {
  const now = new Date().toISOString();
  const { error: runError } = await supabase
    .from("payroll_runs")
    .update({ status: 'finalized', processedAt: now, updatedAt: now })
    .eq('payrollRunId', payrollRunId);
    
  if (runError) throw new Error(runError.message);

  const { error: entriesError } = await supabase
    .from("payroll_entries")
    .update({ status: 'finalized', updatedAt: now })
    .eq('payrollRunId', payrollRunId);

  if (entriesError) throw new Error(entriesError.message);

  return true;
}

export async function markPayrollPaid(payrollRunId: number) {
  const now = new Date().toISOString();
  const { error: runError } = await supabase
    .from("payroll_runs")
    .update({ status: 'paid', paidAt: now, updatedAt: now })
    .eq('payrollRunId', payrollRunId);
    
  if (runError) throw new Error(runError.message);

  const { error: entriesError } = await supabase
    .from("payroll_entries")
    .update({ status: 'paid', updatedAt: now })
    .eq('payrollRunId', payrollRunId);

  if (entriesError) throw new Error(entriesError.message);

  return true;
}

export async function getPayrollEntryDetails(entryId: number) {
  const { data, error } = await supabase
    .from("payroll_entries")
    .select(`
      *,
      payroll_runs (
        payrollRunId, payrollMonth, payrollYear, totalCalendarDays, status,
        createdAt, processedAt, paidAt, updatedAt,
        processor:processedBy ( fullName )
      ),
      user:userId (
        fullName,
        email,
        role,
        gender,
        dateOfJoining,
        collegeId,
        employee_ids ( employeeIdPk, employeeId ),
        staff_bank_details ( pfNumber, esiNumber, bankName, accountNumber ),
        staff_pan_details ( panNumber ),
        employee_pay_profiles (
          employee_payroll_compliance_values ( amount, payroll_compliance_types ( title ) )
        )
      )
    `)
    .eq("payrollEntryId", entryId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Entry not found");
  }
  
  // Also fetch leaves, holidays, weekoffs to separate them in the UI
  const month = data.payroll_runs.payrollMonth;
  const year = data.payroll_runs.payrollYear;
  const userId = data.userId;
  // Fallback collegeId to 8 if not fetched for some reason
  const collegeId = data.user?.collegeId || 8; 

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const [leavesRes, holidaysRes, mediaRes, collegeRes] = await Promise.all([
    supabase
      .from("employee_leave_requests")
      .select("leaveType, leaveFromDate, leaveToDate")
      .eq("userId", userId)
      .eq("status", "approved")
      .eq("is_deleted", false)
      .or(`leaveFromDate.gte.${startDate},leaveToDate.gte.${startDate}`)
      .or(`leaveFromDate.lte.${endDate},leaveToDate.lte.${endDate}`),
    supabase
      .from("college_holidays")
      .select("holidayDate, title, holidayType")
      .eq("collegeId", collegeId)
      .gte("holidayDate", startDate)
      .lte("holidayDate", endDate),
    supabase
      .from("college_media")
      .select("logoUrl, bannerUrl")
      .eq("collegeId", collegeId)
      .eq("is_deleted", false)
      .maybeSingle(),
    supabase
      .from("colleges")
      .select("collegeName, address, city, state, pincode")
      .eq("collegeId", collegeId)
      .maybeSingle()
  ]);

  const employeeIdentifier = Array.isArray(data.user?.employee_ids)
    ? data.user.employee_ids[0]
    : data.user?.employee_ids;
  let salaryPayment = null;
  if (employeeIdentifier?.employeeIdPk) {
    const { data: payment, error: paymentError } = await supabase
      .from("employee_salary_payments")
      .select("paymentDate, createdAt, creator:createdBy(fullName)")
      .eq("employeeId", employeeIdentifier.employeeIdPk)
      .eq("payrollRunId", data.payrollRunId)
      .is("deletedAt", null)
      .maybeSingle();
    if (paymentError) throw new Error(paymentError.message);
    salaryPayment = payment;
  }

  const processor = Array.isArray(data.payroll_runs.processor)
    ? data.payroll_runs.processor[0]
    : data.payroll_runs.processor;
  const paymentCreator = Array.isArray(salaryPayment?.creator)
    ? salaryPayment.creator[0]
    : salaryPayment?.creator;

  return {
    ...data,
    leavesTaken: leavesRes.data || [],
    holidaysInMonth: holidaysRes.data || [],
    weekoffsConfig: [{ dayOfWeek: 0 }], // Default to Sunday
    collegeMedia: mediaRes.data || null,
    college: (collegeRes && collegeRes.data) || null,
    paymentTracking: {
      calculatedAt: data.payroll_runs.createdAt,
      finalizedAt: data.payroll_runs.processedAt
        || (data.payroll_runs.status === "finalized" || data.payroll_runs.status === "paid"
          ? data.payroll_runs.updatedAt
          : null),
      paidAt: salaryPayment?.paymentDate || salaryPayment?.createdAt || data.payroll_runs.paidAt || null,
      processedBy: processor?.fullName || "HR Manager",
      paidBy: paymentCreator?.fullName || "Accountant",
      isFinalized: data.payroll_runs.status === "finalized"
        || data.payroll_runs.status === "paid"
        || data.status === "finalized"
        || data.status === "paid",
      isPaid: Boolean(salaryPayment) || data.status === "paid",
    },
  };
}
