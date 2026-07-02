"use client";

import AccountantDashboardLeft from "./components/left";
import AccountantDashboardRight from "./components/right";
import ExpenseCategoriesPage from "./components/ExpenseCategoriesPage";
import ThisMonthSpendingPage from "./components/ThisMonthSpendingPage";
import TotalExpensesPage from "./components/TotalExpensesPage";
import TransactionsPage from "./components/TransactionsPage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AccountantDashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (view === "totalExpenses") {
    return <TotalExpensesPage />;
  }

  if (view === "thisMonthSpending") {
    return <ThisMonthSpendingPage />;
  }

  if (view === "expenseCategories") {
    return <ExpenseCategoriesPage />;
  }

  if (view === "transactions") {
    return <TransactionsPage />;
  }

  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden bg-[#F4F4F4] pb-5">
      <AccountantDashboardLeft />
      <AccountantDashboardRight />
    </main>
  );
}

export default function AccountantDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AccountantDashboardContent />
    </Suspense>
  );
}
