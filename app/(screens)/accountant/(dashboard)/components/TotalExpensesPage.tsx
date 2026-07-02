"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExpenseDetailsModal from "../modal/ExpenseDetailsModal";
import RecordNewExpenseModal from "../modal/RecordNewExpenseModal";
import { totalExpenseRecords, totalExpenseStats } from "./data";

const columns = [
  { title: "EXPENSE ID", key: "expenseId" },
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE NAME", key: "expenseName" },
  { title: "AMOUNT", key: "amount" },
  { title: "DATE", key: "date" },
  { title: "ACTIONS", key: "actions" },
];

const categoryToneClasses: Record<string, string> = {
  green: "bg-[#DFF3E7] text-[#147A3D]",
  pink: "bg-[#F9E4EE] text-[#9C315B]",
};

function FilterButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-[#CAD8C9] bg-white px-4 text-[12px] font-medium text-[#282828]"
    >
      {label}
      <CaretDown size={14} weight="bold" />
    </button>
  );
}

function CategoryBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[64px] justify-center rounded-full px-3 py-1 text-[10px] font-bold ${
        categoryToneClasses[tone] ?? categoryToneClasses.green
      }`}
    >
      {label}
    </span>
  );
}

function RowActions({
  onEdit,
  onView,
}: {
  onEdit: () => void;
  onView: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onView}
        className="h-8 cursor-pointer rounded-full border border-[#BFCDBE] bg-white px-4 text-[12px] font-medium text-[#282828]"
      >
        View
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="h-8 cursor-pointer rounded-full bg-[#237333] px-4 text-[12px] font-medium text-white"
      >
        Edit
      </button>
    </div>
  );
}

function Pagination() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#CBD5C9] bg-white text-[#17213D]"
      >
        <CaretLeft size={15} weight="bold" />
      </button>
      {[1, 2, 3].map((page) => (
        <button
          key={page}
          type="button"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border text-[13px] font-semibold ${
            page === 1
              ? "border-[#237333] bg-[#237333] text-white"
              : "border-[#CBD5C9] bg-white text-[#17213D]"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-[#CBD5C9] bg-white text-[#17213D]"
      >
        <CaretRight size={15} weight="bold" />
      </button>
    </div>
  );
}

export default function TotalExpensesPage() {
  const router = useRouter();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<
    (typeof totalExpenseRecords)[number] | null
  >(null);
  const tableData = totalExpenseRecords.map((record) => ({
    expenseId: <span className="text-[13px] font-medium">{record.expenseId}</span>,
    category: (
      <CategoryBadge label={record.category} tone={record.categoryTone} />
    ),
    expenseName: (
      <span className="text-[13px] font-medium text-[#282828]">
        {record.expenseName}
      </span>
    ),
    amount: (
      <span className="text-[13px] font-bold text-[#17213D]">
        {record.amount}
      </span>
    ),
    date: <span className="text-[13px] font-medium">{record.date}</span>,
    actions: (
      <RowActions
        onEdit={() => setSelectedExpense(record)}
        onView={() => setSelectedExpense(record)}
      />
    ),
  }));

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-2 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to accountant dashboard"
              onClick={() => router.push("/accountant")}
              className="mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={24} weight="bold" />
            </button>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#282828]">
                Total Expenses
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#525252]">
                View and analyze all recorded institutional expenses.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRecordExpenseOpen(true)}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#172B58] px-6 text-[13px] font-bold text-white"
          >
            <Plus size={16} weight="bold" />
            Record New Expense
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {totalExpenseStats.map((item) => {
            const Icon = item.icon;

            return (
              <CardComponent
                key={item.label}
                icon={<Icon size={18} weight="fill" />}
                value={
                  <span className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#525252]">
                      {item.label}
                    </span>
                    <span className="mt-1 text-[20px] font-bold leading-tight text-[#282828]">
                      {item.value}
                    </span>
                  </span>
                }
                label=""
                iconBgColor={item.iconBgColor}
                iconColor={item.iconColor}
                style="h-[118px] rounded-xl bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.10)]"
                textSize="text-[#282828]"
              />
            );
          })}
        </div>

        <section className="rounded-xl bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex h-10 min-w-[280px] flex-1 items-center gap-3 rounded-full bg-[#F0F2F4] px-4 text-[#6B7280]">
              <MagnifyingGlass size={18} weight="bold" />
              <input
                type="search"
                placeholder="Search expense..."
                className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-[#7B8190]"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <FilterButton label="All Categories" />
              <FilterButton label="Date Range" />
              <FilterButton label="This Month" />
              <FilterButton label="2025" />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-0 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <h2 className="px-6 py-5 text-lg font-bold text-[#282828]">
            Recent Expense Records
          </h2>
          <TableComponent
            columns={columns}
            tableData={tableData}
            height="420px"
            stickyHeader={false}
            tableClassName="min-w-[850px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-2">
            <p className="text-[12px] font-medium text-[#525252]">
              Showing 1-4 of 1,248 entries
            </p>
            <Pagination />
          </div>
        </section>
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
      />
      <ExpenseDetailsModal
        expense={selectedExpense}
        isOpen={selectedExpense !== null}
        onEdit={() => setSelectedExpense(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
      />
    </main>
  );
}
