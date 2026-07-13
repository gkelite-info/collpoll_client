"use client";

import {
  Buildings,
  Confetti,
  Money,
  OfficeChair,
  Plus,
  Receipt,
  Wrench,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchAccountantExpenses,
  type AccountantExpense,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import RecordNewExpenseModal from "../(dashboard)/modal/RecordNewExpenseModal";

const breakdownColumns = [
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE RECORDS", key: "records" },
  { title: "TOTAL SPENDING", key: "spending" },
  { title: "LAST UPDATED", key: "updated" },
];

type CategorySummary = {
  category: string;
  records: number;
  spending: number;
  lastUpdated: string | null;
};

function SummaryCardsShimmer() {
  return (
    <section className="grid gap-6 md:grid-cols-3" aria-label="Loading expense summary">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[150px] animate-pulse rounded-lg bg-white px-6 py-5 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
        >
          <div className="h-9 w-9 rounded-md bg-slate-200" />
          <div className="mt-4 h-3 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-28 rounded bg-slate-200" />
        </div>
      ))}
    </section>
  );
}

function ActiveCategoriesShimmer() {
  return (
    <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-3" aria-label="Loading expense categories">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[190px] w-[350px] min-w-[350px] animate-pulse rounded-lg bg-white p-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
        >
          <div className="h-11 w-11 rounded-lg bg-slate-200" />
          <div className="mt-5 h-6 w-36 rounded bg-slate-200" />
          <div className="mt-8 flex items-center justify-between gap-6">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-7 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

const formatAmount = (amount: number) => {
  if (amount >= 10_000_000) return `Rs ${(amount / 10_000_000).toFixed(2)} Cr.`;
  if (amount >= 100_000) return `Rs ${(amount / 100_000).toFixed(1)} L`;
  if (amount >= 1_000) return `Rs ${(amount / 1_000).toFixed(1)} K`;
  return `Rs ${amount.toLocaleString("en-IN")}`;
};

const categoryVisual = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("event")) return { icon: Confetti, background: "#F9E4EE", color: "#9C315B", tone: "bg-[#F9E4EE] text-[#9C315B]" };
  if (normalized.includes("furniture")) return { icon: OfficeChair, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
  if (normalized.includes("repair") || normalized.includes("maintenance")) return { icon: Wrench, background: "#E7EFEA", color: "#237333", tone: "bg-[#E7EFEA] text-[#237333]" };
  if (normalized.includes("infrastructure")) return { icon: Buildings, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
  return { icon: Money, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
};

export default function AccountantExpenseCategoriesPage() {
  const router = useRouter();
  const { collegeId, loading: userLoading } = useUser();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<AccountantExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const loadExpenses = useCallback(async () => {
    if (!collegeId) {
      if (!userLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const firstPage = await fetchAccountantExpenses({ collegeId, page: 1, itemsPerPage: 100 });
      const allExpenses = [...firstPage.data];
      const totalPages = Math.ceil(firstPage.total / firstPage.itemsPerPage);
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await fetchAccountantExpenses({ collegeId, page, itemsPerPage: 100 });
        allExpenses.push(...nextPage.data);
      }
      setExpenses(allExpenses);
    } catch (error) {
      setExpenses([]);
      toast.error(error instanceof Error ? error.message : "Unable to load expenses.", { id: "load-accountant-expenses" });
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, userLoading]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const categories = useMemo<CategorySummary[]>(() => {
    const grouped = new Map<string, CategorySummary>();
    expenses.forEach((expense) => {
      const current = grouped.get(expense.category);
      grouped.set(expense.category, {
        category: expense.category,
        records: (current?.records ?? 0) + 1,
        spending: (current?.spending ?? 0) + expense.amount,
        lastUpdated:
          !current?.lastUpdated || new Date(expense.updatedAt) > new Date(current.lastUpdated)
            ? expense.updatedAt
            : current.lastUpdated,
      });
    });
    return Array.from(grouped.values()).sort((a, b) => b.spending - a.spending);
  }, [expenses]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [categories.length, currentPage]);

  const highestSpending = categories[0];
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const summaryCards = [
    { label: "HIGHEST SPENDING", title: highestSpending?.category ?? "No expenses", value: formatAmount(highestSpending?.spending ?? 0), helper: "Current", icon: Money, iconBgColor: "#DFF3E7", iconColor: "#147A3D" },
    { label: "TOTAL EXPENSE RECORDS", title: "", value: String(expenses.length), helper: "", icon: Receipt, iconBgColor: "#E8EEF8", iconColor: "#172B58" },
    { label: "TOTAL INSTITUTIONAL EXPENDITURE", title: "", value: formatAmount(totalSpending), helper: "", icon: Buildings, iconBgColor: "#E8F4EC", iconColor: "#147A3D" },
  ];
  const activeCategories = categories;
  const pageCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const breakdownTableData = pageCategories.map((item) => {
    const visual = categoryVisual(item.category);
    const Icon = visual.icon;
    const openCategory = () =>
      router.push(`/accountant/expense-categories/${encodeURIComponent(item.category)}`);
    const cellButtonClass = "-m-2 block w-[calc(100%+1rem)] cursor-pointer p-2 text-inherit";
    return {
      category: <button type="button" onClick={openCategory} className={`${cellButtonClass} text-left`}><span className="flex items-center gap-4 font-semibold text-[#282828]"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${visual.tone}`}><Icon size={16} weight="fill" /></span>{item.category}</span></button>,
      records: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-semibold text-[#282828]`}>{item.records}</button>,
      spending: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-bold text-[#147A3D]`}>{formatAmount(item.spending)}</button>,
      updated: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-semibold text-[#525252]`}>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</button>,
    };
  });

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-tight text-[#282828]">
              Expense Categories
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#525252]">
              Monitor institutional spending grouped by category with real-time
              utilization metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRecordExpenseOpen(true)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#172B58] px-6 text-[13px] font-bold text-white"
          >
            <Plus size={16} weight="bold" />
            Record New Expense
          </button>
        </section>

        {isLoading ? <SummaryCardsShimmer /> : <section className="grid gap-6 md:grid-cols-3">
          {summaryCards.map((item) => (
            <CardComponent
              key={item.label}
              icon={<item.icon size={19} weight="fill" />}
              iconBgColor={item.iconBgColor}
              iconColor={item.iconColor}
              value={<div><p className="text-[11px] font-bold tracking-wide text-[#6B7280]">{item.label}</p>{item.title && <h2 className="mt-1 text-[18px] font-bold text-[#282828]">{item.title}</h2>}</div>}
              label={<div><span className="text-[22px] font-bold text-[#147A3D]">{item.value}</span>{item.helper && <span className="ml-3 text-[13px] font-medium text-[#8A8F98]">{item.helper}</span>}</div>}
              style="!h-[150px] bg-white !rounded-lg !px-6 !py-5 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
            />
          ))}
        </section>}

        <section>
          <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#6B7280]">
            ACTIVE CATEGORIES
          </h2>
          {isLoading ? <ActiveCategoriesShimmer /> : <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-3">
            {activeCategories.map((item) => {
              const visual = categoryVisual(item.category);
              const Icon = visual.icon;
              return (
                <CardComponent
                  key={item.category}
                  icon={<Icon size={22} weight="fill" />}
                  iconBgColor={visual.background}
                  iconColor={visual.color}
                  value={<span className="text-[20px] font-bold text-[#282828]">{item.category}</span>}
                  label={<span className="flex items-end justify-between gap-4"><span className="text-[13px] font-medium text-[#525252]">Total Spending</span><span className="text-[22px] font-bold text-[#282828]">{formatAmount(item.spending)}</span></span>}
                  style="!h-[190px] !w-[350px] !min-w-[350px] flex-none bg-white !rounded-lg !p-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
                />
              );
            })}
            {activeCategories.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-[#6B7280]">No expense categories found.</p>
            )}
          </div>}
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
          <h2 className="px-7 py-6 text-[20px] font-bold text-[#282828]">
            Detailed Expenditure Breakdown
          </h2>
          <TableComponent
            columns={breakdownColumns}
            tableData={breakdownTableData}
            isLoading={isLoading}
            stickyHeader={false}
            tableClassName="min-w-[760px] text-[13px]"
            emptyStateMessage="No expense records found."
          />
          {categories.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={categories.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              disabled={isLoading}
              roundedBottom="rounded-b-lg"
            />
          )}
        </section>
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
        onSaved={loadExpenses}
      />
    </main>
  );
}
