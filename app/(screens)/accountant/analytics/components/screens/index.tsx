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
import { PanelHeader, RevenueSourcesPanel, RevenueSourceRow, MonthlyExpensePanel, RecentTransactionsPanel, RecentFeeCollectionsTable, RecentRevenueRecordsTable, OverviewTransaction } from "../panels";
import { stats, MONTH_LABELS, CATEGORY_COLORS, studentFeeRevenueSource, revenueStats, revenueSourceOverview, studentFeeStats, feeTypeSummary, recentFeeCollections } from "../shared/constants";
import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";
import { AnalyticsShimmerVariant } from "../shared/types";

export function StudentFeesScreen({ onBack }: { onBack: () => void }) {
  const { loading: userLoading } = useUser();
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);

  if (userLoading) {
    return <AnalyticsPageShimmer variant="studentFees" />;
  }

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to revenue management"
              onClick={onBack}
              className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DDF8E9] text-[#23B66F]">
              <GraduationCap size={22} weight="fill" />
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
                Student Fees
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
                Detailed overview of revenue collected from student fee payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddRevenueOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(36,201,111,0.25)]"
          >
            <Plus size={14} weight="bold" />
            Add Revenue Record
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {studentFeeStats.map((item) => (
            <StudentFeesStatCard key={item.label} item={item} />
          ))}
        </section>

        <StudentRevenueTrendChart />

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-[#17213D]">
            Fee Type Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {feeTypeSummary.map((item) => (
              <FeeTypeCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <RecentFeeCollectionsTable />
      </div>
      <AddRevenueRecordModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
      />
    </main>
  );
}

export type RevenueTableRecord = {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: string;
};


export function RevenueManagementScreen({
  onOpenStudentFees,
  onBack,
}: {
  onOpenStudentFees: () => void;
  onBack: () => void;
}) {
  const { accountantId, collegeId, loading: userLoading } = useUser();
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [isEducationLoading, setIsEducationLoading] = useState(true);
  const [isRevenueLoading, setIsRevenueLoading] = useState(true);
  const [revenueRefreshKey, setRevenueRefreshKey] = useState(0);
  const [revenueMetrics, setRevenueMetrics] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    monthlyRevenue: Array<number>(12).fill(0),
    sourceBreakdown: [] as Array<{
      source: string;
      amount: number;
      transactionCount: number;
    }>,
    recentRecords: [] as RevenueTableRecord[],
  });

  useEffect(() => {
    if (userLoading) return;

    let isCurrent = true;

    const loadEducationOptions = async () => {
      setIsEducationLoading(true);

      try {
        const options = await fetchAccountantEducationOptions(
          accountantId,
          collegeId,
        );
        if (!isCurrent) return;

        setEducationOptions(options);
        setSelectedEducationId((currentId) =>
          currentId !== null &&
          options.some((option) => option.collegeEducationId === currentId)
            ? currentId
            : null,
        );
      } catch (error) {
        console.error("Unable to load revenue education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationId(null);
        }
      } finally {
        if (isCurrent) setIsEducationLoading(false);
      }
    };

    void loadEducationOptions();

    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, userLoading]);

  useEffect(() => {
    if (userLoading || isEducationLoading) return;

    let isCurrent = true;

    const loadRevenue = async () => {
      setIsRevenueLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [studentFeeMetrics, collegeRevenueMetrics] = await Promise.all([
          fetchAccountantStudentFeeMetrics(
            accountantId,
            collegeId,
            selectedEducationId,
          ),
          fetchCollegeRevenueMetrics(collegeId, educationIds),
        ]);
        if (isCurrent) {
          const sources = new Map<
            string,
            { source: string; amount: number; transactionCount: number }
          >();
          const addSource = (
            source: string,
            amount: number,
            transactionCount: number,
          ) => {
            const key = source.trim().toLocaleLowerCase("en-IN");
            const current = sources.get(key);
            sources.set(key, {
              source: current?.source ?? source,
              amount: (current?.amount ?? 0) + amount,
              transactionCount:
                (current?.transactionCount ?? 0) + transactionCount,
            });
          };

          if (
            studentFeeMetrics.totalRevenue > 0 ||
            studentFeeMetrics.transactionCount > 0
          ) {
            addSource(
              "Student Fees",
              studentFeeMetrics.totalRevenue,
              studentFeeMetrics.transactionCount,
            );
          }
          collegeRevenueMetrics.sourceBreakdown.forEach((source) =>
            addSource(source.source, source.amount, source.transactionCount),
          );

          setRevenueMetrics({
            totalRevenue:
              studentFeeMetrics.totalRevenue +
              collegeRevenueMetrics.totalRevenue,
            transactionCount:
              studentFeeMetrics.transactionCount +
              collegeRevenueMetrics.transactionCount,
            monthlyRevenue: studentFeeMetrics.monthlyRevenue.map(
              (amount, index) =>
                amount + (collegeRevenueMetrics.monthlyRevenue[index] ?? 0),
            ),
            sourceBreakdown: Array.from(sources.values()).sort(
              (a, b) => b.amount - a.amount,
            ),
            recentRecords: [
              ...studentFeeMetrics.recentTransactions.map((record) => ({
                id: `student-fee-${record.id}`,
                source: "Student Fees",
                description: "Student fee collection",
                amount: record.amount,
                date: record.date,
              })),
              ...collegeRevenueMetrics.recentRecords.map(
                (record: CollegeRevenueRecord) => ({
                  id: `college-revenue-${record.collegeRevenueRecordsId}`,
                  source: record.revenueSource,
                  description: record.revenueTitle,
                  amount: record.amount,
                  date: record.dateReceived,
                }),
              ),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 20),
          });
        }
      } catch (error) {
        console.error("Unable to load revenue management data", error);
        if (isCurrent) {
          setRevenueMetrics({
            totalRevenue: 0,
            transactionCount: 0,
            monthlyRevenue: Array<number>(12).fill(0),
            sourceBreakdown: [],
            recentRecords: [],
          });
        }
      } finally {
        if (isCurrent) setIsRevenueLoading(false);
      }
    };

    void loadRevenue();

    return () => {
      isCurrent = false;
    };
  }, [
    accountantId,
    collegeId,
    educationOptions,
    isEducationLoading,
    revenueRefreshKey,
    selectedEducationId,
    userLoading,
  ]);

  const currentMonth = new Date().getMonth();
  const currentMonthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date());
  const dynamicRevenueStats = revenueStats.map((item, index) => {
    if (isRevenueLoading) return { ...item, value: "Loading..." };

    if (index === 0) {
      return { ...item, value: formatAccountantRevenue(revenueMetrics.totalRevenue) };
    }
    if (index === 1) {
      return {
        ...item,
        value: formatAccountantRevenue(
          revenueMetrics.monthlyRevenue[currentMonth] ?? 0,
        ),
        detail: currentMonthLabel,
      };
    }
    if (index === 2) {
      return {
        ...item,
        value: revenueMetrics.sourceBreakdown.length.toLocaleString("en-IN"),
      };
    }

    return {
      ...item,
      value: revenueMetrics.transactionCount.toLocaleString("en-IN"),
    };
  });
  const dynamicRevenueSources = revenueMetrics.sourceBreakdown.map(
    (source, index) => ({
      ...revenueSourceOverview[index % revenueSourceOverview.length],
      label: source.source,
      totalRevenue: formatAccountantRevenue(source.amount),
      transactions: source.transactionCount.toLocaleString("en-IN"),
    }),
  );

  if (userLoading || isEducationLoading || isRevenueLoading) {
    return <AnalyticsPageShimmer variant="revenue" />;
  }

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Back to analytics overview"
              onClick={onBack}
              className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#17213D]"
            >
              <CaretLeft size={26} weight="bold" />
            </button>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
                Revenue Management
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
                Track and monitor all revenue sources and institutional income.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {educationOptions.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Select education type for revenue management"
                  value={selectedEducationId ?? "all"}
                  onChange={(event) =>
                    setSelectedEducationId(
                      event.target.value === "all"
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  className="h-11 min-w-[145px] cursor-pointer appearance-none rounded-xl border border-[#E3E8EF] bg-white py-2 pl-5 pr-11 text-[14px] font-bold text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] outline-none focus:border-[#714EF2]"
                >
                  <option value="all">All</option>
                  {educationOptions.map((education) => (
                    <option
                      key={education.collegeEducationId}
                      value={education.collegeEducationId}
                    >
                      {education.collegeEducationType}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={17}
                  weight="bold"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#714EF2]"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAddRevenueOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#24C96F] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(36,201,111,0.25)]"
            >
              <Plus size={14} weight="bold" />
              Add Revenue Record
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dynamicRevenueStats.map((item) => (
            <RevenueStatCard key={item.label} item={item} />
          ))}
        </section>

        <RevenueAnalyticsChart monthlyRevenue={revenueMetrics.monthlyRevenue} />

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-[#17213D]">
            Revenue Sources Overview
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {dynamicRevenueSources.map((source) => (
              <div key={source.label} className="min-w-[260px] shrink-0">
                <RevenueSourceCard
                  item={source}
                  onClick={
                    source.label.toLocaleLowerCase("en-IN") === "student fees"
                      ? onOpenStudentFees
                      : undefined
                  }
                />
              </div>
            ))}
            {!isRevenueLoading && dynamicRevenueSources.length === 0 && (
              <p className="py-8 text-sm font-medium text-[#8A9099]">
                No revenue sources found.
              </p>
            )}
          </div>
        </section>

        <RecentRevenueRecordsTable
          records={revenueMetrics.recentRecords}
          isLoading={isRevenueLoading}
        />
      </div>
      <AddRevenueRecordModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
        onSaved={() => setRevenueRefreshKey((current) => current + 1)}
      />
    </main>
  );
}


export function AnalyticsOverviewScreen({
  onOpenRevenue,
}: {
  onOpenRevenue: () => void;
}) {
  const {
    accountantId,
    collegeId,
    loading: userLoading,
  } = useUser();
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [isEducationOptionsLoading, setIsEducationOptionsLoading] =
    useState(true);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    null,
  );
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [studentFeeRevenue, setStudentFeeRevenue] = useState(0);
  const [feeTransactionCount, setFeeTransactionCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(
    Array<number>(12).fill(0),
  );
  const [recentRevenueTransactions, setRecentRevenueTransactions] = useState<
    AccountantRevenueTransaction[]
  >([]);
  const [recentExpenses, setRecentExpenses] = useState<AccountantExpense[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [isRevenueLoading, setIsRevenueLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState<AccountantExpenseSummary>({
    totalExpenses: 0,
    transactionCount: 0,
    topCategory: "-",
    monthlyExpenses: Array<number>(12).fill(0),
    categoryBreakdown: [],
  });
  const [isExpenseSummaryLoading, setIsExpenseSummaryLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    let isCurrent = true;

    const loadEducationOptions = async () => {
      setIsEducationOptionsLoading(true);

      try {
        const options = await fetchAccountantEducationOptions(
          accountantId,
          collegeId,
        );

        if (!isCurrent) return;

        setEducationOptions(options);
        setSelectedEducationId((currentId) =>
          currentId !== null &&
          options.some(
            (option) => option.collegeEducationId === currentId,
          )
            ? currentId
            : null,
        );

        if (options.length === 0) {
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
          setRecentExpenses([]);
          setIsRevenueLoading(false);
          setIsExpenseSummaryLoading(false);
        }
      } catch (error) {
        console.error("Unable to load accountant education types", error);
        if (isCurrent) {
          setEducationOptions([]);
          setSelectedEducationId(null);
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
          setRecentExpenses([]);
          setIsRevenueLoading(false);
          setIsExpenseSummaryLoading(false);
        }
      } finally {
        if (isCurrent) setIsEducationOptionsLoading(false);
      }
    };

    void loadEducationOptions();

    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, userLoading]);

  useEffect(() => {
    if (userLoading || educationOptions.length === 0) return;

    let isCurrent = true;

    const loadExpenseSummary = async () => {
      setIsExpenseSummaryLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [summary, recentExpenseResult] = await Promise.all([
          fetchAccountantExpenseSummary(collegeId, educationIds),
          fetchAccountantExpenses({
            collegeId: Number(collegeId),
            collegeEducationIds: educationIds,
            page: 1,
            itemsPerPage: 20,
          }),
        ]);
        if (isCurrent) {
          setExpenseSummary(summary);
          setRecentExpenses(recentExpenseResult.data);
        }
      } catch (error) {
        console.error("Unable to load accountant expense summary", error);
        if (isCurrent) {
          setExpenseSummary({
            totalExpenses: 0,
            transactionCount: 0,
            topCategory: "-",
            monthlyExpenses: Array<number>(12).fill(0),
            categoryBreakdown: [],
          });
          setRecentExpenses([]);
        }
      } finally {
        if (isCurrent) setIsExpenseSummaryLoading(false);
      }
    };

    void loadExpenseSummary();

    return () => {
      isCurrent = false;
    };
  }, [collegeId, educationOptions, selectedEducationId, userLoading]);

  useEffect(() => {
    if (userLoading || educationOptions.length === 0) return;

    let isCurrent = true;

    const loadRevenue = async () => {
      setIsRevenueLoading(true);

      try {
        const educationIds = selectedEducationId
          ? [selectedEducationId]
          : educationOptions.map(
              (education) => education.collegeEducationId,
            );
        const [metrics, collegeRevenueMetrics] = await Promise.all([
          fetchAccountantStudentFeeMetrics(
            accountantId,
            collegeId,
            selectedEducationId,
          ),
          fetchCollegeRevenueMetrics(collegeId, educationIds),
        ]);

        if (isCurrent) {
          setStudentFeeRevenue(metrics.totalRevenue);
          setTotalRevenue(
            metrics.totalRevenue + collegeRevenueMetrics.totalRevenue,
          );
          setFeeTransactionCount(
            metrics.transactionCount + collegeRevenueMetrics.transactionCount,
          );
          setMonthlyRevenue(
            metrics.monthlyRevenue.map(
              (amount, index) =>
                amount + (collegeRevenueMetrics.monthlyRevenue[index] ?? 0),
            ),
          );
          setRecentRevenueTransactions(metrics.recentTransactions);
        }
      } catch (error) {
        console.error("Unable to load accountant student-fee revenue", error);
        if (isCurrent) {
          setTotalRevenue(0);
          setStudentFeeRevenue(0);
          setFeeTransactionCount(0);
          setMonthlyRevenue(Array<number>(12).fill(0));
          setRecentRevenueTransactions([]);
        }
      } finally {
        if (isCurrent) setIsRevenueLoading(false);
      }
    };

    void loadRevenue();

    return () => {
      isCurrent = false;
    };
  }, [
    accountantId,
    collegeId,
    educationOptions,
    selectedEducationId,
    userLoading,
  ]);

  const overviewStats = useMemo(
    () =>
      stats.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            value: isRevenueLoading
              ? "Loading..."
              : formatAccountantRevenue(totalRevenue),
          };
        }

        if (index === 1) {
          return {
            ...item,
            value: isExpenseSummaryLoading
              ? "Loading..."
              : formatAccountantRevenue(expenseSummary.totalExpenses),
          };
        }

        if (index === 2) {
          return {
            ...item,
            value:
              isRevenueLoading || isExpenseSummaryLoading
                ? "Loading..."
                : (
                    feeTransactionCount + expenseSummary.transactionCount
                  ).toLocaleString("en-IN"),
          };
        }

        return {
          ...item,
          value: isExpenseSummaryLoading
            ? "Loading..."
            : expenseSummary.topCategory,
        };
      }),
    [
      expenseSummary,
      feeTransactionCount,
      isExpenseSummaryLoading,
      isRevenueLoading,
      totalRevenue,
    ],
  );

  const monthlyTrendData = useMemo(
    () =>
      MONTH_LABELS.map((month, index) => ({
        month,
        revenue: monthlyRevenue[index] ?? 0,
        expenses: expenseSummary.monthlyExpenses[index] ?? 0,
      })),
    [expenseSummary.monthlyExpenses, monthlyRevenue],
  );

  const overviewTransactions = useMemo<OverviewTransaction[]>(() => {
    const formatDate = (date: string) => {
      const parsedDate = new Date(date);

      return Number.isNaN(parsedDate.getTime())
        ? date
        : new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(parsedDate);
    };

    const visibleExpenses =
      selectedEducationId === null
        ? Array.from(
            new Map(
              recentExpenses.map((expense) => [
                [
                  expense.expenseName.trim().toLocaleLowerCase("en-IN"),
                  expense.category.trim().toLocaleLowerCase("en-IN"),
                  expense.amount,
                  expense.expenseDate,
                  expense.paymentMethod.trim().toLocaleLowerCase("en-IN"),
                ].join("|"),
                expense,
              ]),
            ).values(),
          )
        : recentExpenses;

    return [
      ...recentRevenueTransactions.map((transaction) => ({
        id: `revenue-${transaction.id}`,
        title: "Student Fees Collection",
        date: formatDate(transaction.date),
        rawDate: transaction.date,
        amount: transaction.amount,
        type: "REVENUE" as const,
      })),
      ...visibleExpenses.map((expense) => ({
        id: `expense-${expense.accountantExpenseId}`,
        title: expense.expenseName,
        date: formatDate(expense.expenseDate),
        rawDate: expense.expenseDate,
        amount: expense.amount,
        type: "EXPENSE" as const,
      })),
    ].sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [recentExpenses, recentRevenueTransactions, selectedEducationId]);

  if (
    userLoading ||
    isEducationOptionsLoading ||
    isRevenueLoading ||
    isExpenseSummaryLoading
  ) {
    return <AnalyticsPageShimmer />;
  }

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-3 py-4 pb-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#17213D]">
              Analytics Overview
            </h1>
            <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
              Insights and trends of revenue and expenses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {educationOptions.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Select education type"
                  value={selectedEducationId ?? "all"}
                  onChange={(event) =>
                    setSelectedEducationId(
                      event.target.value === "all"
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  className="h-11 min-w-[145px] cursor-pointer appearance-none rounded-xl border border-[#E3E8EF] bg-white py-2 pl-5 pr-11 text-[14px] font-bold text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] outline-none focus:border-[#714EF2]"
                >
                  <option value="all">All</option>
                  {educationOptions.map((education) => (
                    <option
                      key={education.collegeEducationId}
                      value={education.collegeEducationId}
                    >
                      {education.collegeEducationType}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={17}
                  weight="bold"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#714EF2]"
                />
              </div>
            )}
            <div className="shrink-0">
              {!isDatePickerOpen ? (
                <button
                  type="button"
                  aria-label="Select date"
                  onClick={() => setIsDatePickerOpen(true)}
                  className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 font-bold shadow-[0_3px_10px_rgba(15,23,42,0.12)] transition-colors ${
                    selectedDateKey
                      ? "border-[#CBE9D8] bg-[#DAE9E1] text-[14px] tracking-wide text-[#43C17A] hover:bg-[#CBE6D7]"
                      : "w-11 border-[#E3E8EF] bg-white text-[#17213D] hover:border-[#43C17A]"
                  }`}
                >
                  <CalendarBlank size={17} weight="bold" />
                  {selectedDateKey &&
                    selectedDateKey.split("-").reverse().join("/")}
                </button>
              ) : (
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[#43C17A] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.16)]">
                  <CalendarBlank
                    size={17}
                    className="ml-1 text-[#43C17A]"
                    weight="fill"
                  />
                  <input
                    type="date"
                    autoFocus
                    value={selectedDateKey}
                    max={new Date().toISOString().split("T")[0]}
                    onFocus={(event) => event.currentTarget.showPicker?.()}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSelectedDateKey(event.target.value);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    className="cursor-pointer rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#43C17A]"
                  />
                  {selectedDateKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDateKey("");
                        setIsDatePickerOpen(false);
                      }}
                      className="cursor-pointer rounded px-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Close calendar"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((item, index) => (
            <StatCard
              key={item.label}
              item={item}
              onClick={index === 0 ? onOpenRevenue : undefined}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <RevenueExpenseChart data={monthlyTrendData} />
          <ExpensesByCategory
            totalExpenses={expenseSummary.totalExpenses}
            categories={expenseSummary.categoryBreakdown}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <RevenueSourcesPanel
            totalRevenue={studentFeeRevenue}
            isLoading={isRevenueLoading}
          />
          <MonthlyExpensePanel
            expenses={expenseSummary.monthlyExpenses}
            isLoading={isExpenseSummaryLoading}
          />
          <RecentTransactionsPanel
            transactions={overviewTransactions}
            isLoading={isRevenueLoading || isExpenseSummaryLoading}
          />
        </section>
      </div>
    </main>
  );
}

