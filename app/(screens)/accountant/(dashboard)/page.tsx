"use client";

import AccountantDashboardLeft from "./components/left";
import AccountantDashboardRight from "./components/right";
import ExpenseCategoriesPage from "./components/ExpenseCategoriesPage";
import ThisMonthSpendingPage from "./components/ThisMonthSpendingPage";
import TotalExpensesPage from "./components/TotalExpensesPage";
import TransactionsPage from "./components/TransactionsPage";
import DashboardShimmer from "./components/DashboardShimmer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAccountantEducationOptions } from "@/lib/helpers/accountant/accountantRevenueAPI";
import {
  fetchAccountantExpenseCountByUser,
  fetchAccountantExpenseSummary,
  fetchAccountantExpenses,
  type AccountantExpense,
  type AccountantExpenseSummary,
} from "@/lib/helpers/accountant/accountantExpensesAPI";

function AccountantDashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const { accountantId, collegeId, userId, loading: isUserLoading } = useUser();
  const [recentExpenses, setRecentExpenses] = useState<AccountantExpense[]>([]);
  const [summaries, setSummaries] = useState<Record<string, AccountantExpenseSummary>>({});
  const [myTransactionCount, setMyTransactionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboardScope() {
      setIsLoading(true);
      if (isUserLoading) return;
      try {
        const options = await fetchAccountantEducationOptions(accountantId, collegeId);
        const ids = options.map((option) => option.collegeEducationId);
        if (!active) return;
        if (!collegeId || ids.length === 0) {
          setRecentExpenses([]);
          setSummaries({});
          setMyTransactionCount(0);
          return;
        }

        const years = Array.from({ length: 4 }, (_, index) => new Date().getFullYear() - index);
        const [result, summaryResults, transactionCount] = await Promise.all([
          fetchAccountantExpenses({
            collegeId,
            collegeEducationIds: ids,
            page: 1,
            itemsPerPage: 20,
          }),
          Promise.all(years.map(async (year) => [
            String(year),
            await fetchAccountantExpenseSummary(collegeId, ids, year),
          ] as const)),
          fetchAccountantExpenseCountByUser(collegeId, ids, userId),
        ]);
        if (active) {
          setRecentExpenses(result.data);
          setSummaries(Object.fromEntries(summaryResults));
          setMyTransactionCount(transactionCount);
        }
      } catch (error) {
        console.error("Unable to load accountant dashboard:", error);
        if (active) {
          setRecentExpenses([]);
          setSummaries({});
          setMyTransactionCount(0);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadDashboardScope();
    return () => {
      active = false;
    };
  }, [accountantId, collegeId, isUserLoading, userId]);

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

  if (isLoading) return <DashboardShimmer />;

  return (
    <main className="flex min-h-full w-full gap-2 overflow-x-hidden bg-[#F4F4F4] pb-5">
      <AccountantDashboardLeft summaries={summaries} myTransactionCount={myTransactionCount} />
      <AccountantDashboardRight recentExpenses={recentExpenses} />
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
