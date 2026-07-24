"use client";

import AccountantPayrollQueue from "./components/AccountantPayrollQueue";

export default function AccountantPayrollPage() {
  return (
    <main className="min-h-full w-full bg-[#f5f6f8] p-3 text-[#142038] sm:p-5 lg:p-6">
      <header className="mb-5">
        <div><h1 className="text-2xl font-bold">Salary payments</h1>
        <p className="mt-1 text-sm text-[#7c8798]">
          Record externally completed salary payments for multiple employees.
        </p>
        </div>
      </header>
      <AccountantPayrollQueue />
    </main>
  );
}
