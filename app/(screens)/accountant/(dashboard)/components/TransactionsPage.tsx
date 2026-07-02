"use client";

import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
  Article,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  Eye,
  FunnelSimple,
  MagnifyingGlass,
  NotePencil,
  PlusCircle,
  SquaresFour,
  Wallet,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const transactionStats = [
  {
    label: "TOTAL TRANSACTIONS",
    value: "1,248",
    icon: Wallet,
    iconBgColor: "#E4F2EA",
    iconColor: "#237333",
  },
  {
    label: "THIS MONTH",
    value: "142",
    icon: CalendarBlank,
    iconBgColor: "#E4F2EA",
    iconColor: "#237333",
  },
  {
    label: "TODAY'S TRANSACTIONS",
    value: "12",
    icon: Article,
    iconBgColor: "#F9E4EE",
    iconColor: "#9C315B",
  },
  {
    label: "CATEGORIES",
    value: "8",
    icon: SquaresFour,
    iconBgColor: "#EEF1F4",
    iconColor: "#5B6269",
  },
];

const transactionRecords = [
  {
    id: "TRX-001",
    date: "23 Oct 2025",
    category: "SALARIES",
    categoryTone: "green",
    title: "Faculty Salary",
    amount: "Rs2,10,000",
  },
  {
    id: "TRX-002",
    date: "22 Oct 2025",
    category: "EVENTS",
    categoryTone: "pink",
    title: "Annual Day Event",
    amount: "Rs75,000",
  },
  {
    id: "TRX-003",
    date: "21 Oct 2025",
    category: "FURNITURE",
    categoryTone: "green",
    title: "Office Chairs",
    amount: "Rs45,600",
  },
  {
    id: "TRX-004",
    date: "20 Oct 2025",
    category: "INTERNET",
    categoryTone: "gray",
    title: "Bandwidth Renewal",
    amount: "Rs8,400",
  },
  {
    id: "TRX-005",
    date: "19 Oct 2025",
    category: "INFRASTRUCTURE",
    categoryTone: "green",
    title: "Lab Equipment",
    amount: "Rs1,20,000",
  },
];

const columns = [
  { title: "TRANSACTION ID", key: "id" },
  { title: "DATE", key: "date" },
  { title: "CATEGORY", key: "category" },
  { title: "TITLE", key: "title" },
  { title: "AMOUNT", key: "amount" },
  { title: "ACTIONS", key: "actions" },
];

const categoryToneClasses: Record<string, string> = {
  green: "bg-[#DFF3E7] text-[#147A3D]",
  pink: "bg-[#F9E4EE] text-[#9C315B]",
  gray: "bg-[#E7EAED] text-[#5B6269]",
};

const categoryBreakdown = [
  { label: "SALARIES", percent: 45, color: "#237333" },
  { label: "INFRASTRUCTURE", percent: 30, color: "#237333" },
  { label: "EVENTS", percent: 15, color: "#9C315B" },
];

function CategoryBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[76px] justify-center rounded-full px-2 py-1 text-[9px] font-bold ${
        categoryToneClasses[tone] ?? categoryToneClasses.green
      }`}
    >
      {label}
    </span>
  );
}

function RowActions() {
  return (
    <div className="flex items-center justify-center gap-4 text-[#282828]">
      <button type="button" aria-label="View transaction" className="cursor-pointer">
        <Eye size={14} weight="bold" />
      </button>
      <button type="button" aria-label="Edit transaction" className="cursor-pointer">
        <NotePencil size={14} weight="bold" />
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
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#17213D]"
      >
        <CaretLeft size={14} weight="bold" />
      </button>
      {[1, 2, 3].map((page) => (
        <button
          key={page}
          type="button"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[13px] font-semibold ${
            page === 1 ? "bg-[#237333] text-white" : "text-[#17213D]"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#17213D]"
      >
        <CaretRight size={14} weight="bold" />
      </button>
    </div>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const tableData = transactionRecords.map((record) => ({
    id: (
      <span className="text-[12px] font-bold text-[#147A3D]">{record.id}</span>
    ),
    date: <span className="text-[12px] font-medium text-[#282828]">{record.date}</span>,
    category: (
      <CategoryBadge label={record.category} tone={record.categoryTone} />
    ),
    title: (
      <span className="text-[12px] font-semibold text-[#282828]">
        {record.title}
      </span>
    ),
    amount: (
      <span className="text-[12px] font-bold text-[#282828]">{record.amount}</span>
    ),
    actions: <RowActions />,
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
                Transactions
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#525252]">
                View and manage all recorded financial transactions.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#43C17A] px-6 text-[12px] font-bold text-white"
          >
            <PlusCircle size={15} weight="bold" />
            New Transaction
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {transactionStats.map((item) => {
            const Icon = item.icon;

            return (
              <CardComponent
                key={item.label}
                icon={<Icon size={18} weight="fill" />}
                value={
                  <span className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-wide text-[#282828]">
                      {item.label}
                    </span>
                    <span className="mt-1 text-[20px] font-bold leading-tight text-[#17213D]">
                      {item.value}
                    </span>
                  </span>
                }
                label=""
                iconBgColor={item.iconBgColor}
                iconColor={item.iconColor}
                style="h-[118px] rounded-lg bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.10)]"
                textSize="text-[#282828]"
              />
            );
          })}
        </div>

        <section className="rounded-lg bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 min-w-[260px] flex-1 items-center gap-3 rounded-md bg-[#F0F2F4] px-4 text-[#6B7280]">
              <MagnifyingGlass size={16} weight="bold" />
              <input
                type="search"
                placeholder="Search Transaction..."
                className="w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-[#7B8190]"
              />
            </label>
            <button
              type="button"
              aria-label="Filter transactions"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#F0F2F4] text-[#525252]"
            >
              <FunnelSimple size={16} weight="bold" />
            </button>
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#F0F2F4] px-4 text-[12px] font-medium text-[#282828]"
            >
              Category: All
              <CaretDown size={12} weight="bold" />
            </button>
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#F0F2F4] px-4 text-[12px] font-medium text-[#282828]"
            >
              <CalendarBlank size={15} weight="bold" />
              Oct 01 - Oct 31, 2025
            </button>
            <button
              type="button"
              className="h-10 cursor-pointer rounded-md bg-[#F0F2F4] px-4 text-[12px] font-bold text-[#525252]"
            >
              Clear Filters
            </button>
          </div>
        </section>

        <section className="rounded-lg bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <TableComponent
            columns={columns}
            tableData={tableData}
            height="380px"
            stickyHeader={false}
            tableClassName="min-w-[860px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5 pt-3">
            <p className="text-[11px] font-medium text-[#282828]">
              Showing 5 of 1,248 transactions
            </p>
            <Pagination />
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          <h2 className="text-[15px] font-bold text-[#282828]">
            Category Breakdown
          </h2>
          <p className="mt-1 text-[11px] font-medium text-[#525252]">
            Volume distribution by expense type
          </p>
          <div className="mt-5 space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#282828]">
                    {item.label}
                  </p>
                  <p className="text-[10px] font-bold text-[#282828]">
                    {item.percent}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F4]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
