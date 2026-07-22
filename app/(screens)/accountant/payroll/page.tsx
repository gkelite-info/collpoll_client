"use client";

import AccountantPayrollQueue from "./components/AccountantPayrollQueue";

export default function AccountantPayrollPage() {
  return (
    <main className="min-h-full w-full bg-[#f5f6f8] p-3 text-[#142038] sm:p-5 lg:p-6">
      <header className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6751e7]">Payroll · July 2026</p><h1 className="text-2xl font-bold">Salary payments</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          Record externally completed salary payments for multiple employees.
        </p>
        </div>
        <div className="rounded-lg border border-[#dfe3ea] bg-white px-3 py-2 text-xs text-[#596578] shadow-sm"><span className="font-semibold text-[#142038]">Pay period:</span> 01 Jul – 31 Jul 2026</div>
      </header>
      <AccountantPayrollQueue />
    </main>
  );
}
