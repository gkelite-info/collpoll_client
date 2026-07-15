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
import { PanelHeader, RevenueSourcesPanel, RevenueSourceRow, MonthlyExpensePanel, RecentTransactionsPanel, RecentFeeCollectionsTable, RecentRevenueRecordsTable } from "../panels";
import { StudentFeesScreen, RevenueManagementScreen, AnalyticsOverviewScreen } from "../screens";

export const stats = [
  {
    label: "Total Revenue",
    value: "Rs 4.85 Cr",
    icon: CreditCard,
    bg: "#E8F8EF",
    color: "#1EA45B",
  },
  {
    label: "Total Expenses",
    value: "Rs 2.34 Cr",
    icon: Briefcase,
    bg: "#E9F1FF",
    color: "#3F7DF4",
  },
  {
    label: "Transactions",
    value: "2,846",
    icon: TrendUp,
    bg: "#F6E9FF",
    color: "#A64FF2",
  },
  {
    label: "Top Expense Category",
    value: "Salaries & Wages",
    icon: MinusCircle,
    bg: "#FFF1E5",
    color: "#F26A2E",
  },
];


export const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];


export const CATEGORY_COLORS = [
  "#438AF6",
  "#43C17A",
  "#FFB020",
  "#6B7DF6",
  "#A64FF2",
  "#F26A2E",
  "#20BFA1",
  "#E34D85",
];


export const studentFeeRevenueSource = {
  label: "Student Fees",
  value: "Rs 0",
  color: "#23B66F",
  bg: "#E8F8EF",
  icon: Receipt,
};

type AnalyticsShimmerVariant = "overview" | "revenue" | "studentFees";


export const revenueStats = [
  {
    label: "Total Revenue",
    value: "Rs 4.85 Cr",
    detail: "All Time",
    icon: CreditCard,
    bg: "#DDF8E9",
    color: "#23B66F",
  },
  {
    label: "This Month Revenue",
    value: "Rs 28.4 L",
    detail: "May 2025",
    icon: CalendarBlank,
    bg: "#E9F1FF",
    color: "#3F7DF4",
  },
  {
    label: "Revenue Sources",
    value: "8",
    detail: "Active Sources",
    icon: Receipt,
    bg: "#F6E9FF",
    color: "#A64FF2",
  },
  {
    label: "Transactions Recorded",
    value: "2,846",
    detail: "All Time",
    icon: TrendUp,
    bg: "#FFF1E5",
    color: "#F26A2E",
  },
];


export const revenueSourceOverview = [
  {
    label: "Student Fees",
    totalRevenue: "Rs 3.2 Cr",
    transactions: "1,850",
    icon: Receipt,
    bg: "#DDF8E9",
    color: "#23B66F",
    border: "#BDEFD5",
  },
  {
    label: "Hostel Fees",
    totalRevenue: "Rs 58 L",
    transactions: "420",
    icon: House,
    bg: "#FFF1E5",
    color: "#F26A2E",
    border: "#F6D8BC",
  },
  {
    label: "Transport Fees",
    totalRevenue: "Rs 42 L",
    transactions: "610",
    icon: Truck,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Examination Fees",
    totalRevenue: "Rs 25 L",
    transactions: "780",
    icon: CalendarCheck,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Event Registrations",
    totalRevenue: "Rs 12 L",
    transactions: "320",
    icon: MinusCircle,
    bg: "#F6E9FF",
    color: "#A64FF2",
    border: "#E7D2FF",
  },
  {
    label: "Library & Fines",
    totalRevenue: "Rs 4.5 L",
    transactions: "140",
    icon: Receipt,
    bg: "#DDF8E9",
    color: "#20BFA1",
    border: "#BCEFE4",
  },
  {
    label: "Other Revenue",
    totalRevenue: "Rs 3.5 L",
    transactions: "96",
    icon: MinusCircle,
    bg: "#FFEAF3",
    color: "#E34D85",
    border: "#F6D2E1",
  },
  {
    label: "Miscellaneous",
    totalRevenue: "Rs 2.6 L",
    transactions: "75",
    icon: Receipt,
    bg: "#FFF4CE",
    color: "#D59B00",
    border: "#F2DFA1",
  },
];


export const studentFeeStats = [
  {
    label: "Total Revenue",
    value: "Rs 3.20 Cr",
    icon: Wallet,
    bg: "#24C96F",
    color: "#FFFFFF",
  },
  {
    label: "This Month Revenue",
    value: "Rs 15.6 L",
    icon: ChartBar,
    bg: "#3F7DF4",
    color: "#FFFFFF",
  },
  {
    label: "Transactions",
    value: "1,850",
    icon: FileText,
    bg: "#A64FF2",
    color: "#FFFFFF",
  },
];


export const feeTypeSummary = [
  {
    label: "Semester Fees",
    value: "Rs 1.45 Cr",
    detail: "820 Transactions",
    icon: BookOpen,
    bg: "#E8F8EF",
    color: "#23B66F",
    border: "#BDEFD5",
  },
  {
    label: "Tuition Fees",
    value: "Rs 91.5 L",
    detail: "640 Transactions",
    icon: FileText,
    bg: "#E9F1FF",
    color: "#3F7DF4",
    border: "#CFE0FF",
  },
  {
    label: "Admission Fees",
    value: "Rs 40.9 L",
    detail: "230 Transactions",
    icon: UserPlus,
    bg: "#FFF1E5",
    color: "#F26A2E",
    border: "#F6D8BC",
  },
  {
    label: "Exam Fees",
    value: "Rs 28.5 L",
    detail: "160 Transactions",
    icon: Briefcase,
    bg: "#F6E9FF",
    color: "#A64FF2",
    border: "#E7D2FF",
  },
  {
    label: "Others",
    value: "Rs 14.6 L",
    detail: "70 Transactions",
    icon: MinusCircle,
    bg: "#FFEAF3",
    color: "#E34D85",
    border: "#F6D2E1",
  },
];


export const recentFeeCollections = [
  {
    student: "Sneha R. Naik",
    feeType: "Tuition Fees",
    amount: "Rs 45,000",
    date: "22 Oct 2025",
    paymentMode: "UPI",
  },
  {
    student: "Rohit S. Shetty",
    feeType: "Semester Fees",
    amount: "Rs 25,000",
    date: "23 Oct 2025",
    paymentMode: "Online",
  },
  {
    student: "Aditya K. Bhat",
    feeType: "Semester Fees",
    amount: "Rs 25,000",
    date: "22 Oct 2025",
    paymentMode: "Card",
  },
  {
    student: "Pooja M. Rao",
    feeType: "Admission Fees",
    amount: "Rs 10,000",
    date: "21 Oct 2025",
    paymentMode: "Online",
  },
  {
    student: "Karthik J. Nayak",
    feeType: "Exam Fees",
    amount: "Rs 5,000",
    date: "21 Oct 2025",
    paymentMode: "Cash",
  },
];


