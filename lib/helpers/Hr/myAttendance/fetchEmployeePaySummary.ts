import { supabase } from "@/lib/supabaseClient";

export interface EmployeePaySummary {
  totalCTC: number;
  fixedPay: number;
  variablePay: number;
  monthlySalary: number;
  regularSalary: number;
  bonus: number;
  otherAddons: number;
  total: number;
  revisionDate: string;
  allowances: { name: string; amount: number }[];
  compliances: { name: string; amount: number }[];
  leaveAllocations?: any;
  rawAddons?: any;
  tillDatePay?: number;
}

export const fetchEmployeePaySummary = async (
  userId: number,
  collegeId: number,
): Promise<EmployeePaySummary | null> => {
  try {
    const { data, error } = await supabase
      .from("employee_pay_profiles")
      .select(
        `
        updatedAt,
        monthlySalary,
        employee_salary_structure ( totalCtc, fixedPay, variablePay ),
        employee_pay_addons ( addonType, title, amount, payNature ),
        employee_leave_allocations ( totalLeaves, sickLeave, casualLeave, paidLeave ),
        employee_salary_component_values ( amount, salary_component_types ( title ) ),
        employee_payroll_compliance_values ( amount, payroll_compliance_types ( title ) )
      `,
      )
      .eq("userId", userId)
      .eq("collegeId", collegeId)
      .maybeSingle();

    if (error || !data) return null;

    const monthly = data.monthlySalary || 0;

    // Calculate tillDatePay dynamically using current month's run or live loop
    let tillDatePayVal = 0;
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1; // 1-indexed
      const todayDay = today.getDate();
      
      const { data: run } = await supabase
        .from("payroll_runs")
        .select("payrollRunId")
        .eq("payrollMonth", currentMonth)
        .eq("payrollYear", currentYear)
        .maybeSingle();
        
      let entry = null;
      if (run) {
        const { data: dbEntry } = await supabase
          .from("payroll_entries")
          .select("perDayRate, lopDays, halfDays")
          .eq("userId", userId)
          .eq("payrollRunId", run.payrollRunId)
          .eq("is_deleted", false)
          .maybeSingle();
        entry = dbEntry;
      }
      
      if (entry) {
        const perDayRate = Number(entry.perDayRate) || 0;
        const lopDays = Number(entry.lopDays) || 0;
        const halfDays = Number(entry.halfDays) || 0;
        tillDatePayVal = Math.max(0, (todayDay * perDayRate) - (lopDays * perDayRate) - (halfDays * perDayRate * 0.5));
      } else {
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
        
        const { data: holidays } = await supabase
          .from("college_holidays")
          .select("holidayDate")
          .eq("collegeId", collegeId)
          .gte("holidayDate", startDate)
          .lte("holidayDate", endDate)
          .eq("isActive", true)
          .eq("is_deleted", false);
          
        const holidayDates = new Set((holidays || []).map((h: any) => h.holidayDate));
        
        for (let d = 1; d <= todayDay; d++) {
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dateObj = new Date(currentYear, currentMonth - 1, d);
          if (dateObj.getDay() === 0) {
            holidayDates.add(dateStr);
          }
        }
        
        const { data: attendance } = await supabase
          .from("attendance_daily")
          .select("attendanceDate, status")
          .eq("userId", userId)
          .gte("attendanceDate", startDate)
          .lte("attendanceDate", endDate);
          
        const attendanceByDate = new Map();
        (attendance || []).forEach((a: any) => attendanceByDate.set(a.attendanceDate, a.status?.toUpperCase() || ""));
        
        const { data: leavesData } = await supabase
          .from("employee_leave_requests")
          .select("leaveFromDate, leaveToDate, leaveType")
          .eq("userId", userId)
          .eq("collegeId", collegeId)
          .eq("status", "approved")
          .eq("is_deleted", false);
          
        const userLeaves = new Map();
        (leavesData || []).forEach((l: any) => {
          const start = new Date(l.leaveFromDate);
          const end = new Date(l.leaveToDate);
          const current = new Date(start);
          const type = l.leaveType?.trim().toLowerCase() || "others";
          while (current <= end) {
            userLeaves.set(current.toISOString().split('T')[0], type);
            current.setDate(current.getDate() + 1);
          }
        });

        const allocs = Array.isArray(data.employee_leave_allocations)
          ? data.employee_leave_allocations[0]
          : data.employee_leave_allocations;
          
        const alloc = {
          total: Number(allocs?.totalLeaves) || 0,
          sick: Number(allocs?.sickLeave) || 0,
          casual: Number(allocs?.casualLeave) || 0,
          paid: Number(allocs?.paidLeave) || 0,
        };
        
        let sickUsed = 0;
        let casualUsed = 0;
        let paidUsed = 0;
        
        const yearStart = new Date(currentYear, 0, 1);
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const tempDate = new Date(yearStart);
        while (tempDate < monthStart) {
          const dateStr = tempDate.toISOString().split('T')[0];
          if (userLeaves.has(dateStr)) {
            const type = userLeaves.get(dateStr);
            if (type === "sick" || type === "medical") {
              if (sickUsed < alloc.sick) sickUsed++;
            } else if (type === "casual") {
              if (casualUsed < alloc.casual) casualUsed++;
            } else {
              if (paidUsed < alloc.paid) paidUsed++;
            }
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        let fullDays = 0;
        let halfDays = 0;
        let absentDays = 0;
        let paidLeaves = 0;
        let lopDays = 0;
        
        for (let d = 1; d <= todayDay; d++) {
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          
          if (holidayDates.has(dateStr)) {
            continue;
          }
          
          if (attendanceByDate.has(dateStr)) {
            const st = attendanceByDate.get(dateStr);
            if (st === "PRESENT" || st === "LATE") fullDays++;
            else if (st === "HALFDAY") halfDays++;
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
                if (hasBalance) paidLeaves++;
                else { absentDays++; lopDays++; }
              } else {
                absentDays++;
                lopDays++;
              }
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
              if (hasBalance) paidLeaves++;
              else { absentDays++; lopDays++; }
            } else {
              absentDays++;
              lopDays++;
            }
          }
        }
        
        if (fullDays === 0 && halfDays === 0 && paidLeaves === 0) {
          lopDays = todayDay;
        }
        
        const perDayRate = monthly / 30;
        tillDatePayVal = Math.max(0, (todayDay * perDayRate) - (lopDays * perDayRate) - (halfDays * perDayRate * 0.5));
      }
    } catch (e) {
      console.error("Error calculating tillDatePay:", e);
    }

    const leaves = Array.isArray(data.employee_leave_allocations)
      ? data.employee_leave_allocations[0]
      : data.employee_leave_allocations;

    const structure = Array.isArray(data.employee_salary_structure)
      ? data.employee_salary_structure[0]
      : data.employee_salary_structure;

    const addons = Array.isArray(data.employee_pay_addons)
      ? data.employee_pay_addons
      : data.employee_pay_addons
        ? [data.employee_pay_addons]
        : [];

    const rawAllowances = Array.isArray(data.employee_salary_component_values)
      ? data.employee_salary_component_values
      : data.employee_salary_component_values
        ? [data.employee_salary_component_values]
        : [];

    const rawCompliances = Array.isArray(
      data.employee_payroll_compliance_values,
    )
      ? data.employee_payroll_compliance_values
      : data.employee_payroll_compliance_values
        ? [data.employee_payroll_compliance_values]
        : [];

    let bonus = 0;
    let otherAddons = 0;

    addons.forEach((a: any) => {
      if (a.addonType === "BONUS") bonus += a.amount;
      else otherAddons += a.amount;
    });

    const fixed = structure?.fixedPay || 0;
    const variable = structure?.variablePay || 0;
    const ctc = structure?.totalCtc || 0;

    const allowances = rawAllowances.map((a: any) => ({
      name: a.salary_component_types?.title || "Unknown",
      amount: a.amount || 0,
    }));

    const compliances = rawCompliances.map((c: any) => ({
      name: c.payroll_compliance_types?.title || "Unknown",
      amount: c.amount || 0,
    }));

    return {
      totalCTC: ctc,
      fixedPay: fixed,
      variablePay: variable,
      monthlySalary: monthly,
      regularSalary: fixed,
      bonus: bonus,
      otherAddons: otherAddons,
      total: ctc + bonus + otherAddons,
      revisionDate: new Date(data.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      allowances,
      compliances,
      leaveAllocations: leaves || {},
      rawAddons: addons || [],
      tillDatePay: tillDatePayVal,
    };
  } catch (err) {
    console.error("Error fetching pay summary:", err);
    return null;
  }
};
