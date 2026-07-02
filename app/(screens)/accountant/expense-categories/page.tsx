"use client";

import {
  Confetti,
  Money,
  OfficeChair,
  Plus,
  Wrench,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RecordNewExpenseModal from "../(dashboard)/modal/RecordNewExpenseModal";

const summaryCards = [
  {
    label: "HIGHEST SPENDING",
    title: "Salaries",
    value: "Rs18.5 L",
    helper: "Current",
  },
  {
    label: "MOST RECORDS",
    title: "Salaries",
    value: "246",
    helper: "Total Vouchers",
  },
  {
    label: "TOTAL INSTITUTIONAL EXPENDITURE",
    title: "",
    value: "Rs2.84 Cr.",
    helper: "",
  },
];

const activeCategories = [
  {
    title: "Salaries",
    value: "Rs18.5 L",
    swatch: "bg-[#A6F19E]",
  },
  {
    title: "Events",
    value: "Rs4.2 L",
    swatch: "bg-[#FFD5E1]",
  },
  {
    title: "Infrastructure",
    value: "Rs12.8 L",
    swatch: "bg-[#8FF08A]",
  },
];

const breakdownRows = [
  {
    category: "Salaries",
    records: "246",
    spending: "Rs18.5 L",
    updated: "23 Oct, 2023",
    slug: "salaries",
    icon: Money,
    tone: "bg-[#DFF3E7] text-[#147A3D]",
  },
  {
    category: "Events",
    records: "8",
    spending: "Rs4.2 L",
    updated: "22 Oct, 2023",
    slug: "events",
    icon: Confetti,
    tone: "bg-[#F9E4EE] text-[#9C315B]",
  },
  {
    category: "Furniture",
    records: "32",
    spending: "Rs2.8 L",
    updated: "21 Oct, 2023",
    slug: "furniture",
    icon: OfficeChair,
    tone: "bg-[#DFF3E7] text-[#147A3D]",
  },
  {
    category: "Repairs & Maintenance",
    records: "112",
    spending: "Rs1.5 L",
    updated: "20 Oct, 2023",
    slug: "repairs-maintenance",
    icon: Wrench,
    tone: "bg-[#E7EFEA] text-[#237333]",
  },
];

export default function AccountantExpenseCategoriesPage() {
  const router = useRouter();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);

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

        <section className="grid gap-6 md:grid-cols-3">
          {summaryCards.map((item) => (
            <article
              key={item.label}
              className="flex h-[150px] flex-col justify-center rounded-lg bg-white px-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
            >
              <p className="text-[11px] font-bold tracking-wide text-[#6B7280]">
                {item.label}
              </p>
              {item.title && (
                <h2 className="mt-3 text-[20px] font-bold text-[#282828]">
                  {item.title}
                </h2>
              )}
              <div className={item.title ? "mt-3" : "mt-8"}>
                <span className="text-[24px] font-bold text-[#147A3D]">
                  {item.value}
                </span>
                {item.helper && (
                  <span className="ml-3 text-[13px] font-medium text-[#8A8F98]">
                    {item.helper}
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#6B7280]">
            ACTIVE CATEGORIES
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {activeCategories.map((item) => (
              <article
                key={item.title}
                className="flex h-[190px] flex-col justify-between rounded-lg bg-white p-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
              >
                <span className={`h-12 w-12 rounded-md ${item.swatch}`} />
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-[20px] font-bold text-[#282828]">
                        {item.title}
                      </h3>
                      <p className="mt-5 text-[13px] font-medium text-[#525252]">
                        Total Spending
                      </p>
                    </div>
                    <p className="text-[24px] font-bold text-[#282828]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
          <h2 className="px-7 py-6 text-[20px] font-bold text-[#282828]">
            Detailed Expenditure Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#F0F2F4]">
                <tr className="text-[11px] font-bold tracking-wide text-[#525252]">
                  <th className="px-7 py-4">CATEGORY</th>
                  <th className="px-7 py-4">EXPENSE RECORDS</th>
                  <th className="px-7 py-4">TOTAL SPENDING</th>
                  <th className="px-7 py-4 text-right">LAST UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {breakdownRows.map((item) => {
                  const Icon = item.icon;

                  return (
                    <tr
                      key={item.category}
                      tabIndex={0}
                      role="button"
                      onClick={() =>
                        router.push(`/accountant/expense-categories/${item.slug}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/accountant/expense-categories/${item.slug}`);
                        }
                      }}
                      className="cursor-pointer border-b border-[#E6E8EB] text-[13px] font-semibold text-[#282828] transition-colors hover:bg-[#F7FBF8] focus:bg-[#F7FBF8] focus:outline-none"
                    >
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${item.tone}`}
                          >
                            <Icon size={16} weight="fill" />
                          </span>
                          {item.category}
                        </div>
                      </td>
                      <td className="px-7 py-5">{item.records}</td>
                      <td className="px-7 py-5 font-bold text-[#147A3D]">
                        {item.spending}
                      </td>
                      <td className="px-7 py-5 text-right text-[#525252]">
                        {item.updated}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F8F9] px-7 py-4">
            <p className="text-[13px] font-medium text-[#525252]">
              Showing 4 of 24 categories
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 cursor-pointer rounded-md border border-[#CBD5C9] bg-white px-4 text-[12px] font-semibold text-[#8A8F98]"
              >
                Previous
              </button>
              <button
                type="button"
                className="h-9 cursor-pointer rounded-md border border-[#CBD5C9] bg-white px-5 text-[12px] font-semibold text-[#282828]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
      />
    </main>
  );
}
