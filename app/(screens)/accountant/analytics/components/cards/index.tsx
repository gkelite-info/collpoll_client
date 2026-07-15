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

import { RevenueExpenseChart, ExpensesByCategory, RevenueAnalyticsChart, StudentRevenueTrendChart } from "../charts";
import { RevenueDetailsModal, AddRevenueRecordModal } from "../modals";
import { PanelHeader, RevenueSourcesPanel, RevenueSourceRow, MonthlyExpensePanel, RecentTransactionsPanel, RecentFeeCollectionsTable, RecentRevenueRecordsTable } from "../panels";
import { StudentFeesScreen, RevenueManagementScreen, AnalyticsOverviewScreen } from "../screens";
import { stats, MONTH_LABELS, CATEGORY_COLORS, studentFeeRevenueSource, revenueStats, revenueSourceOverview, studentFeeStats, feeTypeSummary, recentFeeCollections } from "../shared/constants";
import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";
import { AnalyticsShimmerVariant } from "../shared/types";

export function StatCard({
  item,
  onClick,
}: {
  item: (typeof stats)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`flex h-[82px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.08)] ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]" : ""
      }`}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={20} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#7B8190]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
      </div>
    </article>
  );
}


export function RevenueStatCard({ item }: { item: (typeof revenueStats)[number] }) {
  const Icon = item.icon;

  return (
    <article className="flex h-[88px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_3px_12px_rgba(15,23,42,0.14)]">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={20} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#6B7280]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[18px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-medium text-[#8A9099]">
          {item.detail}
        </p>
      </div>
    </article>
  );
}


export function RevenueSourceCard({
  item,
  onClick,
}: {
  item: (typeof revenueSourceOverview)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`rounded-lg border bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.10)] ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)]" : ""
      }`}
      style={{ borderColor: item.border }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: item.bg, color: item.color }}
        >
          <Icon size={18} weight="fill" />
        </span>
        <h3 className="truncate text-[12px] font-bold" style={{ color: item.color }}>
          {item.label}
        </h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase text-[#8A9099]">
            Total Revenue
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#17213D]">
            {item.totalRevenue}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-[#8A9099]">
            Transactions
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#17213D]">
            {item.transactions}
          </p>
        </div>
      </div>
    </article>
  );
}


export function StudentFeesStatCard({
  item,
}: {
  item: (typeof studentFeeStats)[number];
}) {
  const Icon = item.icon;

  return (
    <article className="flex h-[82px] min-w-0 items-center gap-4 rounded-lg bg-white px-5 shadow-[0_4px_14px_rgba(15,23,42,0.14)]">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={18} weight="fill" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#6B7280]">
          {item.label}
        </p>
        <p className="mt-1 truncate text-[17px] font-bold leading-tight text-[#17213D]">
          {item.value}
        </p>
      </div>
    </article>
  );
}


export function FeeTypeCard({ item }: { item: (typeof feeTypeSummary)[number] }) {
  const Icon = item.icon;

  return (
    <article
      className="rounded-lg border bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.10)]"
      style={{ borderColor: item.border }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md"
        style={{ backgroundColor: item.bg, color: item.color }}
      >
        <Icon size={15} weight="fill" />
      </span>
      <h3 className="mt-3 text-[11px] font-bold" style={{ color: item.color }}>
        {item.label}
      </h3>
      <p className="mt-1 text-[14px] font-bold text-[#17213D]">{item.value}</p>
      <p className="mt-1 text-[10px] font-medium text-[#6B7280]">{item.detail}</p>
    </article>
  );
}


