"use client";

import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  CaretDown,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";

export default function FeePaymentsPage() {
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "this-week";

  const formattedRange = formatRange(range);

  const columns = [
    { title: "Student Name", key: "name" },
    { title: "StudentID", key: "id" },
    { title: "Department", key: "dept" },
    { title: "Total Fee (₹)", key: "total" },
    { title: "Paid Amount (₹)", key: "paid" },
    { title: "Balance (₹)", key: "balance" },
    { title: "Payment Date", key: "date" },
    { title: "Payment Status", key: "status" },
  ];

  const tableData = Array(12).fill({
    name: "Aarav Reddy",
    id: "CSE21A045",
    dept: "CSE",
    total: "85,000",
    paid: "85,000",
    balance: "0",
    date: "12 Feb 2026",
    status: (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-600"></span>
        <span className="text-green-600 font-medium">Paid</span>
      </div>
    ),
  });

  return (
    <div className="bg-[#F3F4F6] h-screen flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <h1 className="text-xl font-semibold text-[#282828]">
          Fee Payments — {formattedRange} (10 Feb – 16 Feb 2026)
        </h1>
        <p className="text-base text-[#282828] mt-1 mb-6">
          Showing all student payments received during this week.
        </p>
        <div className="flex flex-wrap items-center gap-6 -mb-3">
          <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center">
            <input
              type="text"
              placeholder="Search by Student Name / Roll No."
              className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
            />
          <MagnifyingGlass size={18} className="text-[#43C17A]" />
          </div>
          <div className="flex items-center gap-6 text-sm text-[#374151]">

            <FilterPill title="Educational Type" value="B-Tech" />
            <FilterPill title="Branch" value="CSE" showCaret />
            <FilterPill title="Year" value="1st" showCaret />

          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <TableComponent
          columns={columns}
          tableData={tableData}
        />
      </div>
    </div>
  );
}

function formatRange(range: string) {
  switch (range) {
    case "this-week":
      return "This Week";
    case "last-week":
      return "Last Week";
    case "this-month":
      return "This Month";
    case "this-year":
      return "This Year";
    default:
      return "This Week";
  }
}

function FilterPill({
  title,
  value,
  showCaret = false,
}: {
  title: string;
  value: string;
  showCaret?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-[#374151]">{title}</span>

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#43C17A26] text-[#43C17A] font-medium">
        {value}
        {showCaret && <CaretDown size={14} weight="bold" />}
      </div>
    </div>
  );
}
