"use client";

import {
  Calculator,
  CalendarDots,
  CurrencyInr,
  FileText,
  Plus,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import RecordNewExpenseModal from "../../../(dashboard)/modal/RecordNewExpenseModal";
import { ExpenseRecordsTable } from "./ExpenseRecordsTable";
import { SpendingTrend } from "./SpendingTrend";
import { StatCard } from "./StatCard";
import { categoryDetails } from "./categoryDetails";

export function CategoryDetailScreen() {
  const params = useParams<{ category: string }>();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const detail = categoryDetails[params.category] ?? categoryDetails.salaries;

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-tight text-[#282828]">
              {detail.title}
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#525252]">
              {detail.description}
            </p>
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

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<CurrencyInr size={22} weight="bold" />}
            label="TOTAL SPENDING"
            value={detail.totalSpending}
          />
          <StatCard
            icon={<FileText size={20} weight="regular" />}
            label="EXPENSE RECORDS"
            value={detail.records}
            tone="purple"
          />
          <StatCard
            icon={<Calculator size={20} weight="regular" />}
            label="THIS MONTH SPENDING"
            value={detail.monthSpending}
            tone="blue"
          />
          <StatCard
            icon={<CalendarDots size={20} weight="regular" />}
            label="LAST EXPENSE DATE"
            value={detail.lastDate}
            tone="orange"
          />
        </section>

        <SpendingTrend />
        <ExpenseRecordsTable rows={detail.rows} />
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
      />
    </main>
  );
}
