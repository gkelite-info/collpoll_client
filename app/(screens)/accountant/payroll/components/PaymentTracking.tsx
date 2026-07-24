import { Check } from "lucide-react";

import type { StaticPayrollEmployee } from "../data";

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function PaymentTracking({ employee }: { employee: StaticPayrollEmployee }) {
  const paymentCompleted = employee.status === "paid" && Boolean(employee.payment.createdAt);
  const payrollFinalized = employee.payrollRunStatus === "finalized"
    || employee.payrollRunStatus === "paid"
    || Boolean(employee.payrollFinalizedAt);
  const steps = [
    { title: "Payroll Calculated", date: employee.payrollProcessedAt ?? employee.payrollCreatedAt, person: employee.payrollProcessedBy || "HR Manager", completed: true },
    { title: "HR Finalized", date: employee.payrollFinalizedAt, person: employee.payrollProcessedBy || "HR Manager", completed: payrollFinalized },
    {
      title: paymentCompleted ? "Payment Completed" : "Payment Pending",
      date: paymentCompleted ? employee.payment.paymentDate || employee.payment.createdAt : null,
      person: employee.payment.recordedByRole || "Accountant",
      completed: paymentCompleted,
    },
  ];

  return <section className="rounded-xl border border-[#e2e5e9] bg-white p-5 shadow-sm"><h2 className="mb-6 font-semibold">Payment Tracking</h2>{steps.map((step, index) => <div key={step.title} className="relative grid grid-cols-[24px_1fr_auto] gap-3 pb-8 last:pb-0">{index < steps.length - 1 && <span className="absolute left-[11px] top-5 h-[calc(100%-4px)] w-px bg-[#dce4ed]" />}<span className={`z-10 flex h-6 w-6 items-center justify-center rounded-full ${step.completed ? "bg-[#2ac36a] text-white" : "border-2 border-[#aab3c1] bg-white text-transparent"}`}>{step.completed && <Check size={13} />}</span><div><p className={`text-xs font-bold ${step.completed ? "text-[#142038]" : "text-[#667386]"}`}>{step.title}</p><p className="mt-1 text-[10px] text-[#91a0b4]">{step.completed ? formatDate(step.date) : "Awaiting payment confirmation"}</p></div><p className="text-right text-[10px] text-[#526177]">{step.person}</p></div>)}</section>;
}
