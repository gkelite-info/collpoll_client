"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAccountantEducationOptions } from "@/lib/helpers/accountant/accountantRevenueAPI";
import {
  fetchAccountantExpenseSummary,
  fetchAccountantExpenses,
  type AccountantExpense,
  type AccountantExpenseSummary,
} from "@/lib/helpers/accountant/accountantExpensesAPI";

type Options = {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  category?: string;
  createdBy?: number | null;
  serverPaginated?: boolean;
};

const emptySummary: AccountantExpenseSummary = {
  totalExpenses: 0,
  transactionCount: 0,
  topCategory: "-",
  monthlyExpenses: Array<number>(12).fill(0),
  monthlyTransactionCounts: Array<number>(12).fill(0),
  todayTransactionCount: 0,
  categoryBreakdown: [],
};

export function useAccountantExpenses(options: Options = {}) {
  const { accountantId, collegeId, loading: userLoading } = useUser();
  const [expenses, setExpenses] = useState<AccountantExpense[]>([]);
  const [summary, setSummary] = useState<AccountantExpenseSummary>(emptySummary);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page = 1, itemsPerPage = 10, search = "", category = "", createdBy, serverPaginated = false } = options;

  useEffect(() => {
    let active = true;
    if (userLoading) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const education = await fetchAccountantEducationOptions(accountantId, collegeId);
        const educationIds = education.map((item) => item.collegeEducationId);
        if (!collegeId || educationIds.length === 0) {
          if (active) { setExpenses([]); setTotal(0); setSummary(emptySummary); }
          return;
        }
        const summaryResult = await fetchAccountantExpenseSummary(collegeId, educationIds, new Date().getFullYear(), createdBy ?? undefined);
        if (serverPaginated) {
          const result = await fetchAccountantExpenses({
            collegeId,
            collegeEducationIds: educationIds,
            page,
            itemsPerPage,
            search: search.trim() || undefined,
            category: category && category !== "all" ? category : undefined,
            createdBy: createdBy ?? undefined,
          });
          if (active) { setExpenses(result.data); setTotal(result.total); setSummary(summaryResult); }
          return;
        }
        const all: AccountantExpense[] = [];
        let nextPage = 1;
        while (true) {
          const result = await fetchAccountantExpenses({ collegeId, collegeEducationIds: educationIds, page: nextPage, itemsPerPage: 100, createdBy: createdBy ?? undefined });
          all.push(...result.data);
          if (all.length >= result.total) break;
          nextPage += 1;
        }
        if (active) { setExpenses(all); setTotal(all.length); setSummary(summaryResult); }
      } catch (reason) {
        console.error("Unable to load accountant expenses:", reason);
        if (active) {
          setExpenses([]);
          setTotal(0);
          setError(reason instanceof Error ? reason.message : "Unable to load expenses.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, serverPaginated && search ? 300 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [accountantId, category, collegeId, createdBy, itemsPerPage, page, search, serverPaginated, userLoading]);

  return { expenses, summary, total, loading, error };
}
