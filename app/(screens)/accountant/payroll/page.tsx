"use client";

import AccountantPayrollQueue from "./components/AccountantPayrollQueue";

export default function AccountantPayrollPage() {
  return (
    <main className="min-h-full w-full bg-[#f4f4f4] p-3 text-[#142038] sm:p-5">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Employee Payroll</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          Track paid employee salaries and payment information
        </p>
      </header>
      <AccountantPayrollQueue />
    </main>
  );
}
