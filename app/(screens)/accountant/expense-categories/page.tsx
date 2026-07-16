"use client";

import {
  Buildings,
  CalendarBlank,
  CaretDown,
  Confetti,
  Money,
  OfficeChair,
  Plus,
  Receipt,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchAccountantExpenses,
  type AccountantExpense,
} from "@/lib/helpers/accountant/accountantExpensesAPI";
import RecordNewExpenseModal from "../(dashboard)/modal/RecordNewExpenseModal";
import {
  fetchAccountantEducationOptions,
  type AccountantEducationOption,
} from "@/lib/helpers/accountant/accountantRevenueAPI";

const breakdownColumns = [
  { title: "CATEGORY", key: "category" },
  { title: "EXPENSE RECORDS", key: "records" },
  { title: "TOTAL SPENDING", key: "spending" },
  { title: "LAST UPDATED", key: "updated" },
];

type CategorySummary = {
  category: string;
  records: number;
  spending: number;
  lastUpdated: string | null;
};

function SummaryCardsShimmer() {
  return (
    <section className="grid gap-6 md:grid-cols-3" aria-label="Loading expense summary">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[150px] animate-pulse rounded-lg bg-white px-6 py-5 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
        >
          <div className="h-9 w-9 rounded-md bg-slate-200" />
          <div className="mt-4 h-3 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-28 rounded bg-slate-200" />
        </div>
      ))}
    </section>
  );
}

function ActiveCategoriesShimmer() {
  return (
    <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-3" aria-label="Loading expense categories">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[190px] w-[350px] min-w-[350px] animate-pulse rounded-lg bg-white p-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
        >
          <div className="h-11 w-11 rounded-lg bg-slate-200" />
          <div className="mt-5 h-6 w-36 rounded bg-slate-200" />
          <div className="mt-8 flex items-center justify-between gap-6">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-7 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

const formatAmount = (amount: number) => {
  if (amount >= 10_000_000) return `Rs ${(amount / 10_000_000).toFixed(2)} Cr.`;
  if (amount >= 100_000) return `Rs ${(amount / 100_000).toFixed(1)} L`;
  if (amount >= 1_000) return `Rs ${(amount / 1_000).toFixed(1)} K`;
  return `Rs ${amount.toLocaleString("en-IN")}`;
};

const categoryVisual = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("event")) return { icon: Confetti, background: "#F9E4EE", color: "#9C315B", tone: "bg-[#F9E4EE] text-[#9C315B]" };
  if (normalized.includes("furniture")) return { icon: OfficeChair, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
  if (normalized.includes("repair") || normalized.includes("maintenance")) return { icon: Wrench, background: "#E7EFEA", color: "#237333", tone: "bg-[#E7EFEA] text-[#237333]" };
  if (normalized.includes("infrastructure")) return { icon: Buildings, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
  return { icon: Money, background: "#DFF3E7", color: "#147A3D", tone: "bg-[#DFF3E7] text-[#147A3D]" };
};

export default function AccountantExpenseCategoriesPage() {
  const router = useRouter();
  const { accountantId, collegeId, loading: userLoading } = useUser();
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<AccountantExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [educationOptions, setEducationOptions] = useState<
    AccountantEducationOption[]
  >([]);
  const [selectedEducationIds, setSelectedEducationIds] = useState<number[]>([]);
  const [isEducationFilterOpen, setIsEducationFilterOpen] = useState(false);
  const educationFilterRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  const formatDateKey = (dateKey: string) =>
    new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB");

  const loadExpenses = useCallback(async () => {
    if (!collegeId) {
      if (!userLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const firstPage = await fetchAccountantExpenses({ collegeId, page: 1, itemsPerPage: 100 });
      const allExpenses = [...firstPage.data];
      const totalPages = Math.ceil(firstPage.total / firstPage.itemsPerPage);
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await fetchAccountantExpenses({ collegeId, page, itemsPerPage: 100 });
        allExpenses.push(...nextPage.data);
      }
      setExpenses(allExpenses);
    } catch (error) {
      setExpenses([]);
      toast.error(error instanceof Error ? error.message : "Unable to load expenses.", { id: "load-accountant-expenses" });
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, userLoading]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    if (userLoading || !accountantId || !collegeId) return;

    let isCurrent = true;

    fetchAccountantEducationOptions(accountantId, collegeId)
      .then((options) => {
        if (!isCurrent) return;
        setEducationOptions(options);
        setSelectedEducationIds((currentIds) =>
          currentIds.filter((currentId) =>
            options.some(
              (option) => option.collegeEducationId === currentId,
            ),
          ),
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        setEducationOptions([]);
        setSelectedEducationIds([]);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load assigned education types.",
          { id: "load-accountant-expense-educations" },
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [accountantId, collegeId, userLoading]);

  useEffect(() => {
    if (!isEducationFilterOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        educationFilterRef.current &&
        !educationFilterRef.current.contains(event.target as Node)
      ) {
        setIsEducationFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEducationFilterOpen]);

  const educationExpenses = useMemo(
    () =>
      selectedEducationIds.length > 0
        ? expenses.filter(
            (expense) =>
              expense.collegeEducationId !== null &&
              selectedEducationIds.includes(expense.collegeEducationId),
          )
        : expenses,
    [expenses, selectedEducationIds],
  );

  const educationFilterLabel = useMemo(() => {
    if (selectedEducationIds.length === 0) return "All";

    const selectedNames = educationOptions
      .filter((option) =>
        selectedEducationIds.includes(option.collegeEducationId),
      )
      .map((option) => option.collegeEducationType);

    if (selectedNames.length <= 2) return selectedNames.join(", ");
    return `${selectedNames[0]} +${selectedNames.length - 1}`;
  }, [educationOptions, selectedEducationIds]);

  const categories = useMemo<CategorySummary[]>(() => {
    const grouped = new Map<string, CategorySummary>();
    const filteredExpenses = selectedDateKey
      ? educationExpenses.filter((e) => e.expenseDate === selectedDateKey)
      : educationExpenses;

    filteredExpenses.forEach((expense) => {
      const current = grouped.get(expense.category);
      grouped.set(expense.category, {
        category: expense.category,
        records: (current?.records ?? 0) + 1,
        spending: (current?.spending ?? 0) + expense.amount,
        lastUpdated:
          !current?.lastUpdated || new Date(expense.updatedAt) > new Date(current.lastUpdated)
            ? expense.updatedAt
            : current.lastUpdated,
      });
    });
    return Array.from(grouped.values()).sort((a, b) => b.spending - a.spending);
  }, [educationExpenses, selectedDateKey]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [categories.length, currentPage]);

  const highestSpending = categories[0];
  const totalSpending = educationExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const summaryCards = [
    { label: "HIGHEST SPENDING", title: highestSpending?.category ?? "No expenses", value: formatAmount(highestSpending?.spending ?? 0), helper: "Current", icon: Money, iconBgColor: "#DFF3E7", iconColor: "#147A3D" },
    { label: "TOTAL EXPENSE RECORDS", title: "", value: String(educationExpenses.length), helper: "", icon: Receipt, iconBgColor: "#E8EEF8", iconColor: "#172B58" },
    { label: "TOTAL INSTITUTIONAL EXPENDITURE", title: "", value: formatAmount(totalSpending), helper: "", icon: Buildings, iconBgColor: "#E8F4EC", iconColor: "#147A3D" },
  ];
  const activeCategories = categories;
  const pageCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const breakdownTableData = pageCategories.map((item) => {
    const visual = categoryVisual(item.category);
    const Icon = visual.icon;
    const openCategory = () =>
      router.push(`/accountant/expense-categories/${encodeURIComponent(item.category)}`);
    const cellButtonClass = "-m-2 block w-[calc(100%+1rem)] cursor-pointer p-2 text-inherit";
    return {
      category: <button type="button" onClick={openCategory} className={`${cellButtonClass} text-left`}><span className="flex items-center gap-4 font-semibold text-[#282828]"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${visual.tone}`}><Icon size={16} weight="fill" /></span>{item.category}</span></button>,
      records: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-semibold text-[#282828]`}>{item.records}</button>,
      spending: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-bold text-[#147A3D]`}>{formatAmount(item.spending)}</button>,
      updated: <button type="button" onClick={openCategory} className={`${cellButtonClass} font-semibold text-[#525252]`}>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</button>,
    };
  });

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        <section className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 lg:pr-4">
            <h1 className="text-[28px] font-bold leading-tight text-[#282828]">
              Expense Categories
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#525252]">
              Monitor institutional spending grouped by category with real-time
              utilization metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="relative flex items-center">
              <div
                role="button"
                tabIndex={0}
                onClick={() => dateInputRef.current?.showPicker()}
                onKeyDown={(e) => e.key === 'Enter' && dateInputRef.current?.showPicker()}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-colors ${
                  selectedDateKey ? "bg-[#E4FAED] text-[#1A9B55]" : "border border-[#E3E8EF] bg-white text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] hover:border-[#714EF2]"
                }`}
              >
                <CalendarBlank size={17} weight="bold" />
                <span>
                  {selectedDateKey
                    ? formatDateKey(selectedDateKey)
                    : "Select Date"}
                </span>
                {selectedDateKey && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDateKey("");
                    }}
                    className="ml-1 flex items-center justify-center rounded-full p-1 hover:bg-[#cbe6d7]"
                  >
                    <X size={12} weight="bold" />
                  </button>
                )}
              </div>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDateKey}
                onChange={(e) => setSelectedDateKey(e.target.value)}
                className="absolute left-1/2 top-1/2 -z-10 h-0 w-0 -translate-x-1/2 -translate-y-1/2 opacity-0"
              />
            </div>
            {educationOptions.length > 0 && (
              <div ref={educationFilterRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isEducationFilterOpen}
                  onClick={() =>
                    setIsEducationFilterOpen((isOpen) => !isOpen)
                  }
                  className="flex h-10 min-w-[120px] max-w-[200px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E3E8EF] bg-white py-2 pl-4 pr-3 text-[13px] font-bold text-[#17213D] shadow-[0_3px_10px_rgba(15,23,42,0.12)] outline-none focus:border-[#714EF2]"
                >
                  <span className="truncate">{educationFilterLabel}</span>
                  <CaretDown
                    size={15}
                    weight="bold"
                    className={`shrink-0 text-[#714EF2] transition-transform ${
                      isEducationFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isEducationFilterOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute right-0 top-full z-30 mt-2 min-w-full overflow-hidden rounded-xl border border-[#E3E8EF] bg-white p-2 shadow-xl"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedEducationIds.length === 0}
                      onClick={() => {
                        setSelectedEducationIds([]);
                        setCurrentPage(1);
                      }}
                      className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] font-bold hover:bg-[#F4F4F4] ${
                        selectedEducationIds.length === 0
                          ? "bg-[#F0EBFF] text-[#714EF2]"
                          : "text-[#17213D]"
                      }`}
                    >
                      All
                    </button>
                    {educationOptions.map((education) => {
                      const isSelected = selectedEducationIds.includes(
                        education.collegeEducationId,
                      );

                      return (
                        <button
                          key={education.collegeEducationId}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedEducationIds((currentIds) =>
                              isSelected
                                ? currentIds.filter(
                                    (id) =>
                                      id !== education.collegeEducationId,
                                  )
                                : [...currentIds, education.collegeEducationId],
                            );
                            setCurrentPage(1);
                          }}
                          className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F4F4F4] ${
                            isSelected
                              ? "bg-[#F0EBFF] text-[#714EF2]"
                              : "text-[#17213D]"
                          }`}
                        >
                          {education.collegeEducationType}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsRecordExpenseOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#172B58] px-5 text-[13px] font-bold text-white"
            >
              <Plus size={15} weight="bold" />
              Record New Expense
            </button>
          </div>
        </section>

        {isLoading ? <SummaryCardsShimmer /> : <section className="grid gap-6 md:grid-cols-3">
          {summaryCards.map((item) => (
            <CardComponent
              key={item.label}
              icon={<item.icon size={19} weight="fill" />}
              iconBgColor={item.iconBgColor}
              iconColor={item.iconColor}
              value={<div><p className="text-[11px] font-bold tracking-wide text-[#6B7280]">{item.label}</p>{item.title && <h2 className="mt-1 text-[18px] font-bold text-[#282828]">{item.title}</h2>}</div>}
              label={<div><span className="text-[22px] font-bold text-[#147A3D]">{item.value}</span>{item.helper && <span className="ml-3 text-[13px] font-medium text-[#8A8F98]">{item.helper}</span>}</div>}
              style="!h-[150px] bg-white !rounded-lg !px-6 !py-5 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
            />
          ))}
        </section>}

        <section>
          <h2 className="mb-4 text-[13px] font-bold tracking-wide text-[#6B7280]">
            ACTIVE CATEGORIES
          </h2>
          {isLoading ? <ActiveCategoriesShimmer /> : <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-3">
            {activeCategories.map((item) => {
              const visual = categoryVisual(item.category);
              const Icon = visual.icon;
              return (
                <CardComponent
                  key={item.category}
                  icon={<Icon size={22} weight="fill" />}
                  iconBgColor={visual.background}
                  iconColor={visual.color}
                  value={<span className="text-[20px] font-bold text-[#282828]">{item.category}</span>}
                  label={<span className="flex items-end justify-between gap-4"><span className="text-[13px] font-medium text-[#525252]">Total Spending</span><span className="text-[22px] font-bold text-[#282828]">{formatAmount(item.spending)}</span></span>}
                  style="!h-[190px] !w-[350px] !min-w-[350px] flex-none bg-white !rounded-lg !p-7 shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
                />
              );
            })}
            {activeCategories.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-[#6B7280]">No expense categories found.</p>
            )}
          </div>}
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-7 py-6">
            <h2 className="text-[20px] font-bold text-[#282828]">
              Detailed Expenditure Breakdown
            </h2>
          </div>
          <TableComponent
            columns={breakdownColumns}
            tableData={breakdownTableData}
            isLoading={isLoading}
            stickyHeader={false}
            tableClassName="min-w-[760px] text-[13px]"
            emptyStateMessage="No expense records found."
          />
          {categories.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={categories.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              disabled={isLoading}
              roundedBottom="rounded-b-lg"
            />
          )}
        </section>
      </div>
      <RecordNewExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
        onSaved={loadExpenses}
      />
    </main>
  );
}
