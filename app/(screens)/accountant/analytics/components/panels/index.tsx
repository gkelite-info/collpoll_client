"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  BookOpen,
  CalendarBlank,
  CalendarCheck,
  CaretLeft,
  CaretDown,
  CreditCard,
  ChartBar,
  DownloadSimple,
  FilePdf,
  FileText,
  GraduationCap,
  DotsThreeVertical,
  Eye,
  House,
  Plus,
  MinusCircle,
  Paperclip,
  Receipt,
  UserPlus,
  UploadSimple,
  Wallet,
  X,
  Truck,
  TrendUp,
} from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  type AccountantEducationOption,
  type AccountantRevenueTransaction,
  fetchAccountantEducationOptions,
  fetchAccountantStudentFeeMetrics,
  formatAccountantRevenue,
} from "@/lib/helpers/accountant/accountantRevenueAPI";
import {
  type AccountantExpense,
  type AccountantExpenseSummary,
  fetchAccountantExpenses,
  fetchAccountantExpenseSummary,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import {
  type CollegeRevenueRecord,
  createCollegeRevenueRecord,
  fetchCollegeRevenueEducationOptions,
  fetchCollegeRevenueMetrics,
} from "@/lib/helpers/accountant/collegeRevenueRecordsAPI";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

ModuleRegistry.registerModules([AllCommunityModule]);

import { StatCard, RevenueStatCard, RevenueSourceCard, StudentFeesStatCard, FeeTypeCard } from "../cards";
import { RevenueExpenseChart, ExpensesByCategory, RevenueAnalyticsChart, StudentRevenueTrendChart } from "../charts";
import { RevenueDetailsModal, AddRevenueRecordModal } from "../modals";
import { StudentFeesScreen, RevenueManagementScreen, AnalyticsOverviewScreen, RevenueTableRecord } from "../screens";
import { stats, MONTH_LABELS, CATEGORY_COLORS, studentFeeRevenueSource, revenueStats, revenueSourceOverview, studentFeeStats, feeTypeSummary, recentFeeCollections } from "../shared/constants";
import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";
import { AnalyticsShimmerVariant } from "../shared/types";

export function PanelHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-bold text-[#17213D]">{title}</h2>
    </div>
  );
}


export function RevenueSourcesPanel({
  totalRevenue,
  isLoading,
}: {
  totalRevenue: number;
  isLoading: boolean;
}) {
  const studentFees = {
    ...studentFeeRevenueSource,
    value: isLoading ? "Loading..." : formatAccountantRevenue(totalRevenue),
  };

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Top Revenue Sources" />
      <div className="mb-3 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Source</span>
        <span>Amount</span>
      </div>
      <div className="custom-scrollbar h-[250px] space-y-4 overflow-y-scroll pr-2">
        <RevenueSourceRow item={studentFees} />
      </div>
    </section>
  );
}


export function RevenueSourceRow({ item }: { item: typeof studentFeeRevenueSource }) {
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={13} weight="fill" />
      </span>
      <span className="flex-1 text-[12px] font-semibold text-[#17213D]">
        {item.label}
      </span>
      <span className="text-[12px] font-bold text-[#17213D]">{item.value}</span>
    </div>
  );
}


export function MonthlyExpensePanel({
  expenses,
  isLoading,
}: {
  expenses: number[];
  isLoading: boolean;
}) {
  const year = new Date().getFullYear();
  const rows = expenses
    .map((amount, monthIndex) => ({
      month: new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "numeric",
      }).format(new Date(year, monthIndex, 1)),
      amount,
      monthIndex,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.monthIndex - a.monthIndex);

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Monthly Expense Breakdown" />
      <div className="mb-4 flex text-[9px] font-bold uppercase tracking-wide text-[#A0A7B2]">
        <span className="flex-1">Month</span>
        <span>Amount</span>
      </div>
      <div className="custom-scrollbar h-[250px] space-y-5 overflow-y-scroll pr-2">
        {rows.map((item) => (
          <div key={item.month} className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#525252]">
              {item.month}
            </span>
            <span className="text-[12px] font-bold text-[#17213D]">
              {formatAccountantRevenue(item.amount)}
            </span>
          </div>
        ))}
        {!isLoading && rows.length === 0 && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            No expenses recorded this year.
          </p>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            Loading expenses...
          </p>
        )}
      </div>
    </section>
  );
}

export type OverviewTransaction = {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  amount: number;
  type: "REVENUE" | "EXPENSE";
};


export function RecentTransactionsPanel({
  transactions,
  isLoading,
}: {
  transactions: OverviewTransaction[];
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
      <PanelHeader title="Recent Transactions" />
      <div className="custom-scrollbar h-[250px] space-y-4 overflow-y-scroll pr-2">
        {transactions.map((item) => {
          const isRevenue = item.type === "REVENUE";
          const Icon = isRevenue ? ArrowDown : ArrowUp;

          return (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isRevenue
                    ? "bg-[#E8F8EF] text-[#28B66F]"
                    : "bg-[#FFECEC] text-[#FF5757]"
                }`}
              >
                <Icon size={17} weight="bold" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[#17213D]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[9px] font-semibold text-[#A0A7B2]">
                  {item.date}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-[11px] font-bold ${
                    isRevenue ? "text-[#28B66F]" : "text-[#FF5757]"
                  }`}
                >
                  {isRevenue ? "+ " : "- "}
                  {formatAccountantRevenue(item.amount)}
                </p>
                <p className="mt-0.5 text-[8px] font-bold text-[#A0A7B2]">
                  {item.type}
                </p>
              </div>
            </div>
          );
        })}
        {!isLoading && transactions.length === 0 && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            No recent transactions found.
          </p>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[12px] font-medium text-[#8A9099]">
            Loading transactions...
          </p>
        )}
      </div>
    </section>
  );
}


export function RecentFeeCollectionsTable() {
  const [selectedRecord, setSelectedRecord] =
    useState<(typeof recentFeeCollections)[number] | null>(null);

  return (
    <>
      <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#17213D]">
            Recent Fee Collections
          </h2>
          <button type="button" className="text-[12px] font-bold text-[#24C96F]">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-left text-[10px] font-bold uppercase tracking-wide text-[#9AA4B2]">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Fee Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentFeeCollections.map((record) => (
                <tr
                  key={`${record.student}-${record.date}`}
                  className="border-b border-[#EEF1F4] text-[12px] font-medium text-[#17213D]"
                >
                  <td className="px-4 py-4 font-bold">{record.student}</td>
                  <td className="px-4 py-4 text-[#6B7280]">{record.feeType}</td>
                  <td className="px-4 py-4 font-bold">{record.amount}</td>
                  <td className="px-4 py-4 text-[#6B7280]">{record.date}</td>
                  <td className="px-4 py-4 text-[#6B7280]">
                    {record.paymentMode}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        aria-label={`View ${record.student}`}
                        onClick={() => setSelectedRecord(record)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-[#E8F8EF] text-[#24C96F]"
                      >
                        <Eye size={14} weight="bold" />
                      </button>
                      <button
                        type="button"
                        aria-label={`More actions for ${record.student}`}
                        className="cursor-pointer text-[#8A9099]"
                      >
                        <DotsThreeVertical size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-[#8A9099]">
            Showing 1 to 5 of 20 entries
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {["<", "1", "2", "3", "4", ">"].map((page) => (
              <button
                key={page}
                type="button"
                className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[11px] font-bold ${
                  page === "1"
                    ? "bg-[#24C96F] text-white"
                    : "border border-[#E3E8EF] bg-white text-[#6B7280]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>
      <RevenueDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
}


export function RecentRevenueRecordsTable({
  records,
  isLoading,
}: {
  records: RevenueTableRecord[];
  isLoading: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleRecords = records.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-[#17213D]">
          Recent Revenue Records
        </h2>
      </div>
      <div className="custom-scrollbar overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#F8FAFC] text-left text-[10px] font-bold uppercase tracking-wide text-[#9AA4B2]">
              <th className="px-4 py-3">Revenue Source</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-[#EEF1F4] text-[12px] font-medium text-[#17213D]"
              >
                <td className="px-4 py-4">{record.source}</td>
                <td className="px-4 py-4 text-[#6B7280]">
                  {record.description}
                </td>
                <td className="px-4 py-4 font-bold">
                  {formatAccountantRevenue(record.amount)}
                </td>
                <td className="px-4 py-4 text-[#6B7280]">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(record.date))}
                </td>
              </tr>
            ))}
            {!isLoading && visibleRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#8A9099]">
                  No revenue records found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#8A9099]">
                  Loading revenue records...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={safeCurrentPage}
        totalItems={records.length}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10]}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        disabled={isLoading}
        roundedBottom="rounded-b-xl"
      />
    </section>
  );
}


