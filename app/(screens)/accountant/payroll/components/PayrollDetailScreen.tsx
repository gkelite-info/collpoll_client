"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { StaticPayrollEmployee } from "../data";
import AttendanceCalendar from "./AttendanceCalendar";
import EmployeeBankDetails from "./EmployeeBankDetails";
import PaymentInformation from "./PaymentInformation";
import PaymentTracking from "./PaymentTracking";
import PayrollDetailActions from "./PayrollDetailActions";
import PayrollSummaryCards from "./PayrollSummaryCards";

export default function PayrollDetailScreen({ employee }: { employee: StaticPayrollEmployee }) {
  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 text-[#142038] sm:p-5">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <Link href="/accountant/payroll" aria-label="Back to Payroll" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-bold">Salary Payment Details</h1>
        </div>
        <p className="mt-1 pl-11 text-sm text-[#7c8798]">Static attendance, bank information and payment tracking for July 2026</p>
      </header>
      <PayrollSummaryCards employee={employee} />
      <AttendanceCalendar employee={employee} />
      <EmployeeBankDetails employee={employee} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PaymentInformation employee={employee} />
        <PaymentTracking />
      </div>
      <PayrollDetailActions />
    </main>
  );
}
