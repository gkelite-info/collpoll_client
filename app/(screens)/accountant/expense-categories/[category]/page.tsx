"use client";

import {
  CalendarDots,
  CaretDown,
  Calculator,
  CurrencyInr,
  DotsThreeVertical,
  Eye,
  FileText,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import RecordNewExpenseModal from "../../(dashboard)/modal/RecordNewExpenseModal";

ModuleRegistry.registerModules([AllCommunityModule]);

const categoryDetails: Record<
  string,
  {
    title: string;
    description: string;
    totalSpending: string;
    records: string;
    monthSpending: string;
    lastDate: string;
    rows: Array<{
      id: string;
      expenseName: string;
      paidTo: string;
      designation: string;
      amount: string;
      date: string;
      paymentMethod: string;
      recordedBy: string;
    }>;
  }
> = {
  salaries: {
    title: "Salaries",
    description:
      "Overview of all salary related expenses including faculty, staff and other payouts.",
    totalSpending: "18.5 L",
    records: "246",
    monthSpending: "4.2 L",
    lastDate: "23 May 2025",
    rows: [
      {
        id: "1",
        expenseName: "Faculty Salary - May 2025",
        paidTo: "Dr. Priya Sharma",
        designation: "Professor",
        amount: "1,20,000",
        date: "23 May 2025",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Staff Salary - May 2025",
        paidTo: "Ramesh Kumar",
        designation: "Office Assistant",
        amount: "25,000",
        date: "22 May 2025",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  events: {
    title: "Events",
    description:
      "Overview of event spending for annual day, workshops, seminars and college programs.",
    totalSpending: "4.2 L",
    records: "8",
    monthSpending: "75 K",
    lastDate: "22 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Annual Day Event",
        paidTo: "Stage Vendors",
        designation: "Event Setup",
        amount: "75,000",
        date: "22 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Workshop Refreshments",
        paidTo: "Campus Caterers",
        designation: "Catering",
        amount: "18,500",
        date: "18 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  furniture: {
    title: "Furniture",
    description:
      "Overview of furniture purchases, repairs and asset additions across campus.",
    totalSpending: "2.8 L",
    records: "32",
    monthSpending: "45.6 K",
    lastDate: "21 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Office Chairs Purchase",
        paidTo: "Urban Furnishings",
        designation: "Furniture Vendor",
        amount: "45,600",
        date: "21 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Classroom Desk Repair",
        paidTo: "Campus Workshop",
        designation: "Maintenance",
        amount: "12,000",
        date: "16 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  "repairs-maintenance": {
    title: "Repairs & Maintenance",
    description:
      "Overview of campus repair work, maintenance jobs and facility upkeep expenses.",
    totalSpending: "1.5 L",
    records: "112",
    monthSpending: "38 K",
    lastDate: "20 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Electrical Maintenance",
        paidTo: "Bright Electricals",
        designation: "Service Vendor",
        amount: "22,000",
        date: "20 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Plumbing Repairs",
        paidTo: "Campus Services",
        designation: "Maintenance",
        amount: "16,000",
        date: "17 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
};

function StatCard({
  icon,
  label,
  value,
  tone = "green",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "green" | "purple" | "blue" | "orange";
}) {
  const bgByTone = {
    green: "bg-[#E2FAF0] text-[#147A3D]",
    purple: "bg-[#EFE4FF] text-[#8B4DFF]",
    blue: "bg-[#E3F0FF] text-[#4A82FF]",
    orange: "bg-[#FFEBD6] text-[#FF8A2A]",
  };

  return (
    <article className="flex h-[74px] items-center gap-4 rounded-lg bg-white px-5 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${bgByTone[tone]}`}>
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-bold tracking-wide text-[#6B7280]">{label}</p>
        <p className="mt-1 text-[18px] font-bold leading-tight text-[#17213D]">
          {value}
        </p>
      </div>
    </article>
  );
}

function SpendingTrend() {
  const chartData = useMemo(
    () => [
      { month: "JAN", amount: 8 },
      { month: "FEB", amount: 12 },
      { month: "MAR", amount: 9 },
      { month: "APR", amount: 15 },
      { month: "MAY", amount: 13 },
      { month: "JUN", amount: 17 },
      { month: "JUL", amount: 16 },
      { month: "AUG", amount: 16 },
      { month: "SEP", amount: 17 },
      { month: "OCT", amount: 17 },
      { month: "NOV", amount: 0 },
      { month: "DEC", amount: 0 },
    ],
    [],
  );

  const chartOptions = useMemo<AgCartesianChartOptions>(
    () => ({
      data: chartData,
      background: { fill: "transparent" },
      padding: { top: 18, right: 10, bottom: 0, left: 10 },
      series: [
        {
          type: "line",
          xKey: "month",
          yKey: "amount",
          stroke: "#43C17A",
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: "#FFFFFF",
            stroke: "#43C17A",
            size: 8,
          },
        },
      ],
      axes: {
        bottom: {
          type: "category",
          position: "bottom",
          label: { color: "#282828", fontSize: 9, fontWeight: 700 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          position: "left",
          min: 0,
          max: 20,
          label: { enabled: false },
          gridLine: { enabled: false },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [chartData],
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#17213D]">Spending Trend</h2>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-[#CBD5C9] bg-white px-4 text-[13px] font-medium text-[#282828]"
        >
          Monthly
          <CaretDown size={13} weight="bold" />
        </button>
      </div>
      <div className="mt-6 h-[250px]">
        <AgCharts options={chartOptions} style={{ height: "100%", width: "100%" }} />
      </div>
    </section>
  );
}

export default function AccountantCategoryDetailPage() {
  const params = useParams<{ category: string }>();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const detail =
    categoryDetails[params.category] ?? categoryDetails.salaries;

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

        <section className="overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <h2 className="text-[15px] font-bold text-[#17213D]">Expense Records</h2>
            <label className="flex h-9 min-w-[320px] items-center gap-3 rounded-md border border-[#E2E6EA] px-4 text-[#6B7280]">
              <MagnifyingGlass size={14} weight="bold" />
              <input
                type="search"
                placeholder="Search by expense name, paid to, or description..."
                className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-[#7B8190]"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#F0F2F4]">
                <tr className="text-[10px] font-bold tracking-wide text-[#6B7280]">
                  <th className="px-7 py-4">#</th>
                  <th className="px-7 py-4">EXPENSE NAME</th>
                  <th className="px-7 py-4">PAID TO</th>
                  <th className="px-7 py-4">DESIGNATION / TYPE</th>
                  <th className="px-7 py-4">AMOUNT (Rs)</th>
                  <th className="px-7 py-4">DATE</th>
                  <th className="px-7 py-4">PAYMENT METHOD</th>
                  <th className="px-7 py-4">RECORDED BY</th>
                  <th className="px-7 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {detail.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#E6E8EB] text-[11px] font-medium text-[#282828]">
                    <td className="px-7 py-5">{row.id}</td>
                    <td className="px-7 py-5 font-semibold">{row.expenseName}</td>
                    <td className="px-7 py-5">{row.paidTo}</td>
                    <td className="px-7 py-5">{row.designation}</td>
                    <td className="px-7 py-5 font-bold">{row.amount}</td>
                    <td className="px-7 py-5">{row.date}</td>
                    <td className="px-7 py-5">
                      <span className="rounded-full bg-[#E2FAF0] px-3 py-1 text-[9px] font-bold text-[#147A3D]">
                        {row.paymentMethod}
                      </span>
                    </td>
                    <td className="px-7 py-5">{row.recordedBy}</td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label="View expense" className="cursor-pointer">
                          <Eye size={14} weight="bold" />
                        </button>
                        <button type="button" aria-label="More actions" className="cursor-pointer">
                          <DotsThreeVertical size={14} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
