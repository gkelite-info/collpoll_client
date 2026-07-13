"use client";

import {
  Calculator,
  CalendarDots,
  CaretLeft,
  CurrencyInr,
  FileText,
  Plus,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  deleteAccountantExpense,
  fetchAccountantExpenses,
  type AccountantExpense,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import RecordNewExpenseModal from "../../../(dashboard)/modal/RecordNewExpenseModal";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { ExpenseRecordsTable } from "./ExpenseRecordsTable";
import { SpendingTrend } from "./SpendingTrend";
import { StatCard } from "./StatCard";

const formatAmount = (amount: number) => {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(2)} Cr.`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} L`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)} K`;
  return amount.toLocaleString("en-IN");
};

function StatCardsShimmer() {
  return (
    <section className="grid animate-pulse gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex h-[92px] items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="flex-1"><div className="h-3 w-24 rounded bg-gray-200" /><div className="mt-3 h-6 w-20 rounded bg-gray-200" /></div>
        </div>
      ))}
    </section>
  );
}

export function CategoryDetailScreen() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const { collegeId, loading: userLoading } = useUser();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<AccountantExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<AccountantExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summaryExpenses, setSummaryExpenses] = useState<AccountantExpense[]>([]);
  const [pageExpenses, setPageExpenses] = useState<AccountantExpense[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const category = decodeURIComponent(params.category);

  const loadSummary = useCallback(async () => {
    if (!collegeId) {
      if (!userLoading) setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    try {
      const firstPage = await fetchAccountantExpenses({ collegeId, category, page: 1, itemsPerPage: 100 });
      const allExpenses = [...firstPage.data];
      const totalPages = Math.ceil(firstPage.total / firstPage.itemsPerPage);
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await fetchAccountantExpenses({ collegeId, category, page, itemsPerPage: 100 });
        allExpenses.push(...nextPage.data);
      }
      setSummaryExpenses(allExpenses);
    } catch (error) {
      setSummaryExpenses([]);
      toast.error(error instanceof Error ? error.message : "Unable to load category expenses.", { id: "load-category-expenses" });
    } finally {
      setSummaryLoading(false);
    }
  }, [category, collegeId, userLoading]);

  const loadExpensePage = useCallback(async (page: number, perPage: number) => {
    if (!collegeId) {
      if (!userLoading) setTableLoading(false);
      return;
    }
    setTableLoading(true);
    try {
      const response = await fetchAccountantExpenses({
        collegeId,
        category,
        page,
        itemsPerPage: perPage,
      });
      setPageExpenses(response.data);
      setTotalItems(response.total);
    } catch (error) {
      setPageExpenses([]);
      setTotalItems(0);
      toast.error(error instanceof Error ? error.message : "Unable to load expense records.", { id: "load-expense-page" });
    } finally {
      setTableLoading(false);
    }
  }, [category, collegeId, userLoading]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadExpensePage(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, loadExpensePage]);

  const totalSpending = summaryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentDate = new Date();
  const monthSpending = summaryExpenses
    .filter((expense) => {
      const date = new Date(`${expense.expenseDate}T00:00:00`);
      return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  const latestExpense = useMemo(
    () => [...summaryExpenses].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))[0],
    [summaryExpenses],
  );
  const lastExpenseDate = latestExpense
    ? new Date(`${latestExpense.expenseDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const refreshExpenses = async () => {
    setCurrentPage(1);
    await Promise.all([loadSummary(), loadExpensePage(1, itemsPerPage)]);
  };
  const handleSaved = async () => {
    const targetPage = editingExpense ? currentPage : 1;
    if (!editingExpense) setCurrentPage(1);
    await Promise.all([
      loadSummary(),
      loadExpensePage(targetPage, itemsPerPage),
    ]);
    setEditingExpense(null);
  };
  const confirmDelete = async () => {
    if (!deletingExpense || !collegeId) return;
    setIsDeleting(true);
    try {
      await deleteAccountantExpense(
        deletingExpense.accountantExpenseId,
        collegeId,
        deletingExpense.createdBy,
      );
      toast.success("Expense deleted successfully.");
      const targetPage = Math.min(
        currentPage,
        Math.max(1, Math.ceil((totalItems - 1) / itemsPerPage)),
      );
      setCurrentPage(targetPage);
      setDeletingExpense(null);
      await Promise.all([
        loadSummary(),
        loadExpensePage(targetPage, itemsPerPage),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete the expense.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => router.push("/accountant/expense-categories")}
              aria-label="Back to expense categories"
              className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[#282828]"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-[#282828]">
                {category}
              </h1>
              <p className="mt-2 text-[14px] font-medium text-[#525252]">
                Overview of all {category.toLowerCase()} expenses recorded for your institution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRecordExpenseOpen(true)}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#43C17A] px-5 text-[12px] font-bold text-white"
          >
            <Plus size={14} weight="bold" />
            Add Expense
          </button>
        </section>

        {summaryLoading ? <StatCardsShimmer /> : <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<CurrencyInr size={22} weight="bold" />}
            label="TOTAL SPENDING"
            value={formatAmount(totalSpending)}
          />
          <StatCard
            icon={<FileText size={20} weight="regular" />}
            label="EXPENSE RECORDS"
            value={String(summaryExpenses.length)}
            tone="purple"
          />
          <StatCard
            icon={<Calculator size={20} weight="regular" />}
            label="THIS MONTH SPENDING"
            value={formatAmount(monthSpending)}
            tone="blue"
          />
          <StatCard
            icon={<CalendarDots size={20} weight="regular" />}
            label="LAST EXPENSE DATE"
            value={lastExpenseDate}
            tone="orange"
          />
        </section>}

        {summaryLoading ? (
          <div className="h-[340px] animate-pulse rounded-xl bg-white p-6 shadow-sm"><div className="h-6 w-40 rounded bg-gray-200" /><div className="mt-10 h-[240px] rounded bg-gray-100" /></div>
        ) : (
          <SpendingTrend expenses={summaryExpenses} />
        )}
        <ExpenseRecordsTable
          rows={pageExpenses}
          isLoading={tableLoading}
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setIsRecordExpenseOpen(true);
          }}
          onDelete={setDeletingExpense}
        />
      </div>
      <RecordNewExpenseModal
        key={editingExpense?.accountantExpenseId ?? "new-expense"}
        isOpen={isRecordExpenseOpen}
        onClose={() => { setIsRecordExpenseOpen(false); setEditingExpense(null); }}
        onSaved={editingExpense ? handleSaved : refreshExpenses}
        initialCategory={category}
        initialExpense={editingExpense}
      />
      <ConfirmDeleteModal
        open={Boolean(deletingExpense)}
        onConfirm={() => void confirmDelete()}
        onCancel={() => { if (!isDeleting) setDeletingExpense(null); }}
        isDeleting={isDeleting}
        title="Delete"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        name="expense"
        itemName={deletingExpense?.expenseName}
        customDescription={deletingExpense ? <>Are you sure you want to delete <span className="font-bold text-slate-800">{deletingExpense.expenseName}</span>? This action cannot be undone.</> : undefined}
        actionType="remove"
      />
    </main>
  );
}
