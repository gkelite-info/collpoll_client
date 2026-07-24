import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function calculatePayrollEngine(
  collegeId: number,
  month: number,
  year: number,
  processedBy: number
) {
  const totalCalendarDays = new Date(year, month, 0).getDate(); // Days in month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(totalCalendarDays).padStart(2, '0')}`;

  // 1. Fetch holidays for the month
  const { data: holidays } = await adminSupabase
    .from("college_holidays")
    .select("holidayDate")
    .eq("collegeId", collegeId)
    .gte("holidayDate", startDate)
    .lte("holidayDate", endDate)
    .eq("isActive", true)
    .eq("is_deleted", false);

  const holidayDates = new Set((holidays || []).map((h: any) => h.holidayDate));
  
  // Automatically inject Sundays as a fallback if HR forgot to generate the calendar
  for (let d = 1; d <= totalCalendarDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    if (dateObj.getDay() === 0) {
      holidayDates.add(dateStr);
    }
  }

  const totalHolidays = holidayDates.size;
  const totalPayableDays = totalCalendarDays; // Salaried employees get paid for the full month

  // 2. Fetch staff
  const { data: staff } = await adminSupabase
    .from("users")
    .select("userId, role")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .not("role", "in", "(Student,Parent,SuperAdmin,GroundStaff)");

  if (!staff || staff.length === 0) {
    throw new Error("No active staff found for this college.");
  }
  const userIds = staff.map(s => s.userId);

  // 3. Fetch all needed data for the month

  const [
    { data: attendance },
    { data: payProfiles },
    { data: taxes },
    { data: leaves }
  ] = await Promise.all([
    adminSupabase
      .from("attendance_daily")
      .select("userId, attendanceDate, status")
      .in("userId", userIds)
      .gte("attendanceDate", startDate)
      .lte("attendanceDate", endDate),
    adminSupabase
      .from("employee_pay_profiles")
      .select(`
        userId, 
        monthlySalary,
        employee_payroll_compliance_values ( amount, payroll_compliance_types ( title ) ),
        employee_leave_allocations ( totalLeaves, sickLeave, casualLeave, paidLeave )
      `)
      .in("userId", userIds)
      .is("deletedAt", null),
    adminSupabase
      .from("employee_tax_declarations")
      .select("userId, totalDeclared")
      .in("userId", userIds)
      .eq("financialYear", month <= 3 ? `${year-1}-${String(year).slice(2)}` : `${year}-${String(year+1).slice(2)}`)
      .eq("proofStatus", "approved")
      .is("deletedAt", null),
    adminSupabase
      .from("employee_leave_requests")
      .select("userId, leaveFromDate, leaveToDate, leaveType")
      .eq("collegeId", collegeId)
      .eq("status", "approved")
      .eq("is_deleted", false)
  ]);

  const attMap = new Map();
  (attendance || []).forEach((a: any) => {
    if (!attMap.has(a.userId)) attMap.set(a.userId, []);
    attMap.get(a.userId).push(a);
  });

  const payMap = new Map();
  const compMap = new Map();
  const leaveAllocMap = new Map();
  
  (payProfiles || []).forEach((p: any) => {
    payMap.set(p.userId, p.monthlySalary || 0);
    
    // Process leave allocations safely
    const allocs = Array.isArray(p.employee_leave_allocations)
      ? p.employee_leave_allocations[0]
      : p.employee_leave_allocations;
      
    leaveAllocMap.set(p.userId, {
      total: Number(allocs?.totalLeaves) || 0,
      sick: Number(allocs?.sickLeave) || 0,
      casual: Number(allocs?.casualLeave) || 0,
      paid: Number(allocs?.paidLeave) || 0,
    });
    
    // Process compliances safely
    if (!compMap.has(p.userId)) compMap.set(p.userId, { pf: 0, esi: 0, pt: 0 });
    const userComp = compMap.get(p.userId);
    
    const compliances = Array.isArray(p.employee_payroll_compliance_values) 
      ? p.employee_payroll_compliance_values 
      : (p.employee_payroll_compliance_values ? [p.employee_payroll_compliance_values] : []);
      
    compliances.forEach((c: any) => {
      const title = c.payroll_compliance_types?.title?.toUpperCase() || "";
      if (title === "PF" || title.includes("PROVIDENT FUND")) userComp.pf += Number(c.amount || 0);
      else if (title === "EF" || title === "ESI" || title.includes("EMPLOYEE FUND")) userComp.esi += Number(c.amount || 0);
      else if (title === "PT" || title === "TDS" || title.includes("TAX")) userComp.pt += Number(c.amount || 0);
    });
  });

  const taxMap = new Map();
  (taxes || []).forEach((t: any) => taxMap.set(t.userId, t.totalDeclared || 0));

  const leaveMap = new Map();
  (leaves || []).forEach((l: any) => {
    if (!leaveMap.has(l.userId)) leaveMap.set(l.userId, new Map());
    const start = new Date(l.leaveFromDate);
    const end = new Date(l.leaveToDate);
    const current = new Date(start);
    const type = l.leaveType?.trim().toLowerCase() || "others";
    while (current <= end) {
      leaveMap.get(l.userId).set(current.toISOString().split('T')[0], type);
      current.setDate(current.getDate() + 1);
    }
  });

  let totalGross = 0;
  let totalDeductionsAll = 0;
  let totalNetAll = 0;

  const entriesToInsert = [];

  for (const s of staff) {
    const monthlySalary = roundMoney(Number(payMap.get(s.userId)) || 0);
    const perDayRate = monthlySalary / 30; // Standard 30 days calculation

    let fullDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let paidLeaves = 0;
    let lopDays = 0;

    const userAtt = attMap.get(s.userId) || [];
    
    // Optimize lookup by converting to a Map for O(1) access
    const attendanceByDate = new Map();
    userAtt.forEach((a: any) => attendanceByDate.set(a.attendanceDate, a.status?.toUpperCase() || ""));

    const userLeaves = leaveMap.get(s.userId) || new Map();
    const alloc = leaveAllocMap.get(s.userId) || { total: 0, sick: 0, casual: 0, paid: 0 };
    
    let sickUsed = 0;
    let casualUsed = 0;
    let paidUsed = 0;
    
    // Count leaves consumed from Jan 1st to target month start
    const yearStart = new Date(year, 0, 1);
    const monthStart = new Date(year, month - 1, 1);
    
    const tempDate = new Date(yearStart);
    while (tempDate < monthStart) {
      const dateStr = tempDate.toISOString().split('T')[0];
      if (userLeaves.has(dateStr)) {
        const type = userLeaves.get(dateStr);
        if (type === "sick" || type === "medical") {
          if (sickUsed < alloc.sick) sickUsed++;
        }
        else if (type === "casual") {
          if (casualUsed < alloc.casual) casualUsed++;
        }
        else {
          if (paidUsed < alloc.paid) paidUsed++;
        }
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const dailyStatus = new Array(totalCalendarDays + 1).fill("HOLIDAY");

    // Optimized loop over calendar days
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Include today fully

    for (let d = 1; d <= totalCalendarDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const loopDate = new Date(year, month - 1, d);
      
      if (holidayDates.has(dateStr)) {
        dailyStatus[d] = "HOLIDAY";
        continue; // Weekends/Holidays are paid by default, no LOP
      }

      if (loopDate > today) {
        // SaaS Rule: If the date is in the future (mid-month run), assume present/paid. Do not penalize with LOP.
        // We increment fullDays so the Payslip 'Days Present' reflects the projected full month attendance,
        // ensuring 'Paid Absences' exactly equals just the holidays and actual paid leaves.
        fullDays++;
        dailyStatus[d] = "PRESENT";
        continue;
      }
      
      if (attendanceByDate.has(dateStr)) {
        const st = attendanceByDate.get(dateStr);
        if (st === "PRESENT" || st === "LATE") { fullDays++; dailyStatus[d] = "PRESENT"; }
        else if (st === "HALFDAY") { halfDays++; dailyStatus[d] = "PRESENT"; }
        else if (st === "ABSENT") { 
          if (userLeaves.has(dateStr)) {
            const type = userLeaves.get(dateStr);
            let hasBalance = false;
            if (type === "sick" || type === "medical") {
              if (sickUsed < alloc.sick) { sickUsed++; hasBalance = true; }
            } else if (type === "casual") {
              if (casualUsed < alloc.casual) { casualUsed++; hasBalance = true; }
            } else {
              if (paidUsed < alloc.paid) { paidUsed++; hasBalance = true; }
            }
            if (hasBalance) { paidLeaves++; dailyStatus[d] = "LEAVE"; }
            else { absentDays++; lopDays++; dailyStatus[d] = "ABSENT"; }
          }
          else { absentDays++; lopDays++; dailyStatus[d] = "ABSENT"; }
        }
      } else { 
        if (userLeaves.has(dateStr)) {
          const type = userLeaves.get(dateStr);
          let hasBalance = false;
          if (type === "sick" || type === "medical") {
            if (sickUsed < alloc.sick) { sickUsed++; hasBalance = true; }
          } else if (type === "casual") {
            if (casualUsed < alloc.casual) { casualUsed++; hasBalance = true; }
          } else {
            if (paidUsed < alloc.paid) { paidUsed++; hasBalance = true; }
          }
          if (hasBalance) { paidLeaves++; dailyStatus[d] = "LEAVE"; }
          else { absentDays++; lopDays++; dailyStatus[d] = "ABSENT"; }
        }
        else { absentDays++; lopDays++; dailyStatus[d] = "ABSENT"; }
      }
    }

    // SaaS HR Day-to-Day Sandwich Policy
    // A holiday/weekend is LOP if sandwiched by unapproved absences (ABSENT).
    for (let d = 1; d <= totalCalendarDays; d++) {
      if (dailyStatus[d] === "HOLIDAY") {
        let prevWorkingDay = "NONE";
        for (let p = d - 1; p >= 1; p--) {
          if (dailyStatus[p] !== "HOLIDAY") {
            prevWorkingDay = dailyStatus[p];
            break;
          }
        }
        
        let nextWorkingDay = "NONE";
        for (let n = d + 1; n <= totalCalendarDays; n++) {
          if (dailyStatus[n] !== "HOLIDAY") {
            nextWorkingDay = dailyStatus[n];
            break;
          }
        }

        const isPrevAbsent = prevWorkingDay === "ABSENT" || prevWorkingDay === "NONE";
        const isNextAbsent = nextWorkingDay === "ABSENT" || nextWorkingDay === "NONE";
        const hasAtLeastOneAbsent = prevWorkingDay === "ABSENT" || nextWorkingDay === "ABSENT";
        
        if (isPrevAbsent && isNextAbsent && hasAtLeastOneAbsent) {
          lopDays++; // Holiday becomes LOP
          dailyStatus[d] = "SANDWICH_LOP";
        }
      }
    }

    // SaaS HR Monthly Continuous LOP Rule: 
    // If employee has 0 attendance (0 present days) for the entire month,
    // they ONLY get paid for explicitly approved paid leaves (sick, casual, paid).
    // All other days (including all weekends/holidays) are converted to LOP.
    if (fullDays === 0 && halfDays === 0) {
      lopDays = totalCalendarDays - paidLeaves;
    }

    const lopDeduction = lopDays * perDayRate;
    const halfDayDeduction = halfDays * perDayRate * 0.50;
    
    // Clamp to minimum 0 to prevent negative salaries
    const grossEarnings = roundMoney(
      Math.max(0, monthlySalary - lopDeduction - halfDayDeduction),
    );

    const comp = compMap.get(s.userId) || { pf: 0, esi: 0, pt: 0 };
    const taxDeclared = taxMap.get(s.userId) || 0;
    const monthlyTds = taxDeclared > 0 ? taxDeclared / 12 : 0;

    const assessedDeductions = roundMoney(
      comp.pf + comp.esi + comp.pt + monthlyTds,
    );
    // A payroll deduction cannot exceed the employee's earnings for this run.
    // Keeping the applied amount here guarantees gross - deductions = net.
    const totalDeductions = roundMoney(
      Math.min(grossEarnings, Math.max(0, assessedDeductions)),
    );
    const netPay = roundMoney(grossEarnings - totalDeductions);

    totalGross += grossEarnings;
    totalDeductionsAll += totalDeductions;
    totalNetAll += netPay;

    // Temporary IDs for foreign keys (will be replaced by actual DB inserts)
    entriesToInsert.push({
      userId: s.userId,
      monthlySalary,
      perDayRate: roundMoney(perDayRate),
      totalPayableDays,
      fullDaysWorked: fullDays,
      halfDays,
      absentDays,
      paidLeaves,
      lopDays,
      grossEarnings,
      totalDeductions,
      netPay,
      status: 'calculated',
      isActive: true,
      comp,
      monthlyTds
    });
  }

  // Transaction via RPC or single inserts (in actual implementation we insert run -> entries -> lines)
  // Since we don't have tables yet, we'll return the calculation to the caller.
  return {
    run: {
      collegeId,
      payrollMonth: month,
      payrollYear: year,
      totalCalendarDays,
      totalHolidays,
      totalPayableDays,
      totalStaff: staff.length,
      totalGrossEarnings: totalGross,
      totalDeductions: totalDeductionsAll,
      totalNetPay: totalNetAll,
      processedBy,
      status: "draft"
    },
    entries: entriesToInsert
  };
}
