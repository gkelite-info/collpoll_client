import { Building2, IndianRupee, UserRound } from "lucide-react";

import { formatExactNumber } from "@/app/utils/numberFormat";
import type { EmployeeAttendanceDay } from "@/lib/helpers/accountant/employeeSalaryPaymentsAPI";
import type { StaticPayrollEmployee } from "../data";

function normalizeAttendanceStatus(value: string) {
  return value.toLowerCase().replace(/[\s_-]/g, "");
}

export default function PayrollSummaryCards({
  employee,
  attendance,
  attendancePeriod,
}: {
  employee: StaticPayrollEmployee;
  attendance: EmployeeAttendanceDay[];
  attendancePeriod: string;
}) {
  const attendanceTotals = attendance.reduce(
    (totals, record) => {
      const status = normalizeAttendanceStatus(record.status);
      if (status === "present" || status === "late") totals.present += 1;
      else if (status.includes("half")) totals.halfDays += 1;
      else if (status === "absent") totals.absent += 1;
      return totals;
    },
    { present: 0, halfDays: 0, absent: 0 },
  );
  const salaryLabel = employee.status === "paid" ? "Net Salary Paid" : "Net Payable";
  const [attendanceYear, attendanceMonth] = attendancePeriod.split("-").map(Number);
  const attendanceLabel = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(attendanceYear, attendanceMonth - 1, 1));
  const cards = [
    { icon: <UserRound size={20} />, label: "Employee", value: employee.name, note: `${employee.employeeId} · ${employee.role}` },
    { icon: <Building2 size={20} />, label: `Attendance · ${attendanceLabel}`, value: `${attendanceTotals.present} days present`, note: `${attendanceTotals.absent} absent days · ${attendanceTotals.halfDays} half days` },
    { icon: <IndianRupee size={20} />, label: salaryLabel, value: `₹${formatExactNumber(employee.netPay)}`, note: `Gross ₹${formatExactNumber(employee.grossEarnings)}` },
  ];
  return <section className="mb-5 grid gap-4 md:grid-cols-3">{cards.map((card) => <article key={card.label} className="rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f8ee] text-[#16a34a]">{card.icon}</span><div><p className="text-xs text-[#657184]">{card.label}</p><p className="mt-1 text-base font-bold">{card.value}</p><p className="mt-1 text-[10px] text-[#a0a8b5]">{card.note}</p></div></div></article>)}</section>;
}
