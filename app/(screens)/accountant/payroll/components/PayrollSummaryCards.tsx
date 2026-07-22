import { Building2, IndianRupee, UserRound } from "lucide-react";

import { formatExactNumber } from "@/app/utils/numberFormat";
import type { StaticPayrollEmployee } from "../data";

export default function PayrollSummaryCards({ employee }: { employee: StaticPayrollEmployee }) {
  const cards = [
    { icon: <UserRound size={20} />, label: "Employee", value: employee.name, note: `${employee.employeeId} · ${employee.role}` },
    { icon: <Building2 size={20} />, label: "Attendance", value: `${employee.fullDaysWorked} days present`, note: `${employee.lopDays} LOP days · ${employee.halfDays} half days` },
    { icon: <IndianRupee size={20} />, label: "Net Salary Paid", value: `₹${formatExactNumber(employee.netPay)}`, note: `Gross ₹${formatExactNumber(employee.grossEarnings)}` },
  ];
  return <section className="mb-5 grid gap-4 md:grid-cols-3">{cards.map((card) => <article key={card.label} className="rounded-xl border border-[#e4e7eb] bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f8ee] text-[#16a34a]">{card.icon}</span><div><p className="text-xs text-[#657184]">{card.label}</p><p className="mt-1 text-base font-bold">{card.value}</p><p className="mt-1 text-[10px] text-[#a0a8b5]">{card.note}</p></div></div></article>)}</section>;
}
