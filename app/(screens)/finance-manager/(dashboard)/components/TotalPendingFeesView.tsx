"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import {
  fetchAcademicYears,
  fetchBranches,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  fetchPendingFeeCreatedYears,
  fetchPendingFeesBreakdowns,
  fetchPendingFeesOverview,
  sendPendingFeeReminderNotification,
  type PendingFeeBreakdownRow,
  type PendingFeeTableRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchPendingFeesOverview";
import {
  CaretLeft,
  CurrencyInr,
  MagnifyingGlass,
  UsersThree,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const rupee = "\u20B9";
const pendingTableColumns = [
  { title: "Student Name", key: "studentName" },
  { title: "Student ID", key: "studentId" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Total Fee", key: "totalFee" },
  { title: "Paid", key: "paid" },
  { title: "Pending", key: "pending" },
  { title: "Status", key: "status" },
  { title: "Action", key: "actions" },
];

type Option = {
  id: number;
  label: string;
};

type PendingSummary = {
  fullyPaidStudents: number;
  totalPendingAmount: number;
  studentsWithPendingFees: number;
  highPendingStudents: number;
  totalFee: number;
  paid: number;
  pending: number;
};

const emptySummary: PendingSummary = {
  fullyPaidStudents: 0,
  totalPendingAmount: 0,
  studentsWithPendingFees: 0,
  highPendingStudents: 0,
  totalFee: 0,
  paid: 0,
  pending: 0,
};

const formatCurrency = (amount: number) =>
  `${rupee} ${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

const formatShortCurrency = (amount: number) => {
  const value = Math.max(Number(amount) || 0, 0);
  if (value >= 10000000) return `${rupee} ${(value / 10000000).toFixed(1)} CR`;
  if (value >= 100000) return `${rupee} ${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `${rupee} ${(value / 1000).toFixed(1)} K`;
  return formatCurrency(value);
};

function SelectPill({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm text-[#282828]">
      <span>{label} :</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-full bg-[#43C17A] px-3 py-1 text-xs font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-80"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BreakdownCard({
  title,
  subtitle,
  branchLabel,
  rows,
  selectedId,
  onRowClick,
}: {
  title: string;
  subtitle?: string;
  branchLabel: string;
  rows: PendingFeeBreakdownRow[];
  selectedId?: number | null;
  onRowClick?: (row: PendingFeeBreakdownRow) => void;
}) {
  const [activeRow, setActiveRow] = useState<{
    row: PendingFeeBreakdownRow;
    x: number;
    y: number;
    mode: "hover" | "click";
  } | null>(null);
  const maxTotal = Math.max(
    1,
    ...rows.map((row) => row.collected + row.pending),
  );

  return (
    <section className="relative rounded-lg bg-white p-4 shadow-sm">
      {activeRow && (
        <div
          className={`absolute z-20 w-28 rounded-md border border-[#E4E4E4] bg-white p-1.5 text-left shadow-lg ${
            activeRow.mode === "hover" ? "pointer-events-none" : ""
          }`}
          style={{
            left: Math.min(activeRow.x, 260),
            top: Math.max(8, activeRow.y - 68),
          }}
        >
          <p className="text-[11px] font-semibold text-[#282828]">{branchLabel}</p>
          <p className="text-[10px] text-[#525252]">
            {subtitle ? `${subtitle} ` : ""}
            {activeRow.row.label}
          </p>
          <div className="mt-1 space-y-1 text-[9px] text-[#282828]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#43C17A]" />
                collected
              </span>
              <span className="font-semibold">
                {formatShortCurrency(activeRow.row.collected)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#CFF3DD]" />
                pending
              </span>
              <span className="font-semibold">
                {formatShortCurrency(activeRow.row.pending)}
              </span>
            </div>
            {activeRow.row.totalFee <= 0 && (
              <div className="flex items-center gap-1.5 text-[#525252]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A8A8A8]" />
                Not Assigned
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-[#282828]">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs font-semibold text-[#43C17A]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[#525252]">No pending fees found</p>
        ) : (
          rows.map((row) => {
            const total = row.collected + row.pending;
            const isNotAssigned = row.totalFee <= 0;
            const totalWidth = isNotAssigned
              ? "0%"
              : `${Math.max(8, (total / maxTotal) * 100)}%`;
            const collectedWidth =
              total > 0 ? `${(row.collected / total) * 100}%` : "0%";
            const isSelected = selectedId === row.id;

            return (
              <button
                type="button"
                key={row.id}
                onClick={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setActiveRow({
                    row,
                    mode: "click",
                    x: sectionRect ? targetRect.left - sectionRect.left + 90 : 90,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                  onRowClick?.(row);
                }}
                onFocus={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setActiveRow({
                    row,
                    mode: "hover",
                    x: sectionRect ? targetRect.left - sectionRect.left + 90 : 90,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                }}
                onMouseEnter={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setActiveRow({
                    row,
                    mode: "hover",
                    x: sectionRect ? targetRect.left - sectionRect.left + 90 : 90,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                }}
                onMouseLeave={() =>
                  setActiveRow((current) =>
                    current?.mode === "hover" ? null : current,
                  )
                }
                className={`grid w-full grid-cols-[4.5rem_1fr_5rem] items-center gap-3 rounded-md text-left ${
                  onRowClick ? "cursor-pointer" : "cursor-default"
                } ${isSelected ? "bg-[#F1FBF5]" : ""}`}
              >
                <span className="text-xs text-[#525252]">{row.label}</span>
                <div className="h-4 rounded-sm bg-[#E8F8EF]">
                  <div
                    className="flex h-full overflow-hidden rounded-sm"
                    style={{ width: totalWidth }}
                  >
                    {row.collected > 0 && (
                      <span
                        className="h-full bg-[#43C17A]"
                        style={{ width: collectedWidth }}
                      />
                    )}
                    {row.pending > 0 && (
                      <span className="h-full flex-1 bg-[#CFF3DD]" />
                    )}
                  </div>
                </div>
                {isNotAssigned ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[#525252]">
                    <span className="h-2 w-2 rounded-full bg-[#A8A8A8]" />
                    Not Assigned
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#43C17A]">
                    {formatShortCurrency(row.pending)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function TotalPendingFeesView() {
  const router = useRouter();
  const {
    collegeId,
    collegeEducationId: financeEducationId,
    collegeEducationType,
    loading: contextLoading,
  } = useFinanceManager();
  const [educationOptions, setEducationOptions] = useState<Option[]>([]);
  const [branchOptions, setBranchOptions] = useState<Option[]>([]);
  const [yearOptions, setYearOptions] = useState<Option[]>([]);
  const [createdYearOptions, setCreatedYearOptions] = useState<string[]>([
    new Date().getFullYear().toString(),
  ]);
  const [selectedCreatedYear, setSelectedCreatedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    financeEducationId,
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedBreakdownYearId, setSelectedBreakdownYearId] = useState<
    number | null
  >(null);
  const [selectedBreakdownSemesterId, setSelectedBreakdownSemesterId] = useState<
    number | null
  >(null);
  const [summary, setSummary] = useState<PendingSummary>(emptySummary);
  const [yearBreakdown, setYearBreakdown] = useState<PendingFeeBreakdownRow[]>([]);
  const [semesterBreakdown, setSemesterBreakdown] = useState<PendingFeeBreakdownRow[]>([]);
  const [tableRows, setTableRows] = useState<PendingFeeTableRow[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [remindingStudentId, setRemindingStudentId] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setSelectedEducationId(financeEducationId);
  }, [financeEducationId]);

  useEffect(() => {
    if (contextLoading || !financeEducationId) return;

    setEducationOptions([
      {
        id: financeEducationId,
        label: collegeEducationType ?? "Education",
      },
    ]);
    setSelectedEducationId(financeEducationId);
  }, [collegeEducationType, contextLoading, financeEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadBranches() {
      if (!collegeId || !selectedEducationId) return;
      const branches = await fetchBranches(collegeId, selectedEducationId);
      if (!isMounted) return;
      const options = branches.map((branch) => ({
        id: branch.collegeBranchId,
        label: branch.collegeBranchCode || branch.collegeBranchType,
      }));
      setBranchOptions(options);
      setSelectedBranchId((current) => current ?? options[0]?.id ?? null);
      setSelectedYearId(null);
      setSelectedBreakdownYearId(null);
      setSelectedBreakdownSemesterId(null);
    }

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadYears() {
      if (!collegeId || !selectedEducationId || !selectedBranchId) return;
      const years = await fetchAcademicYears(
        collegeId,
        selectedEducationId,
        selectedBranchId,
      );
      if (!isMounted) return;
      const options = years.map((year) => ({
        id: year.collegeAcademicYearId,
        label: year.collegeAcademicYear,
      }));
      setYearOptions(options);
      setSelectedYearId((current) => current ?? options[0]?.id ?? null);
      setSelectedBreakdownYearId((current) => current ?? options[0]?.id ?? null);
      setSelectedBreakdownSemesterId(null);
    }

    loadYears();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedBranchId, selectedEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadCreatedYears() {
      if (!collegeId || !selectedEducationId) return;

      const years = await fetchPendingFeeCreatedYears({
        collegeId,
        collegeEducationId: selectedEducationId,
        collegeBranchId: selectedBranchId,
      });

      if (!isMounted) return;

      const nextYears = years.length
        ? years
        : [new Date().getFullYear().toString()];
      setCreatedYearOptions(nextYears);
      setSelectedCreatedYear((current) =>
        nextYears.includes(current) ? current : nextYears[0],
      );
    }

    loadCreatedYears();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedBranchId, selectedEducationId]);

  const filters = useMemo(() => {
    if (!collegeId || !selectedEducationId) return null;

    return {
      collegeId,
      collegeEducationId: selectedEducationId,
      collegeBranchId: selectedBranchId,
      collegeAcademicYearId: selectedYearId,
      createdYear: selectedCreatedYear,
    };
  }, [
    collegeId,
    selectedBranchId,
    selectedCreatedYear,
    selectedEducationId,
    selectedYearId,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      if (!filters) return;

      setSummaryLoading(true);
      try {
        const overview = await fetchPendingFeesOverview(filters);
        if (!isMounted) return;
        setSummary(overview.summary);
      } catch {
        if (!isMounted) return;
        setSummary(emptySummary);
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadBreakdowns() {
      if (!filters) return;

      try {
        const breakdowns = await fetchPendingFeesBreakdowns({
          ...filters,
          collegeAcademicYearId: selectedBreakdownYearId ?? selectedYearId,
        });
        if (!isMounted) return;
        setYearBreakdown(breakdowns.years);
        setSemesterBreakdown(breakdowns.semesters);
      } catch {
        if (!isMounted) return;
        setYearBreakdown([]);
        setSemesterBreakdown([]);
      }
    }

    loadBreakdowns();

    return () => {
      isMounted = false;
    };
  }, [filters, selectedBreakdownYearId, selectedYearId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTable() {
      if (!filters) return;

      setTableLoading(true);
      try {
        const overview = await fetchPendingFeesOverview(filters, debouncedSearch);
        if (!isMounted) return;
        setTableRows(overview.rows);
      } catch {
        if (!isMounted) return;
        setTableRows([]);
      } finally {
        if (isMounted) setTableLoading(false);
      }
    }

    loadTable();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, filters]);

  const selectedEducationLabel =
    educationOptions.find((option) => option.id === selectedEducationId)?.label ??
    collegeEducationType ??
    "Education";
  const selectedBranchLabel =
    branchOptions.find((option) => option.id === selectedBranchId)?.label ??
    "Branch";
  const selectedBreakdownYearLabel =
    yearBreakdown.find((row) => row.id === selectedBreakdownYearId)?.label ??
    yearOptions.find((option) => option.id === selectedBreakdownYearId)?.label ??
    "";
  const visibleYearBreakdown = useMemo(() => {
    if (yearBreakdown.length > 0) return yearBreakdown;
    const selectedYear = yearOptions.find((option) => option.id === selectedYearId);
    return selectedYear
      ? [
          {
            id: selectedYear.id,
            label: selectedYear.label,
            collected: 0,
            pending: 0,
            totalFee: 0,
          },
        ]
      : [];
  }, [selectedYearId, yearBreakdown, yearOptions]);
  const visibleSemesterBreakdown = useMemo(() => {
    if (semesterBreakdown.length > 0) return semesterBreakdown;
    if (!selectedBreakdownYearLabel) return [];
    return [
      {
        id: -1,
        label: "Not Assigned",
        collected: 0,
        pending: 0,
        totalFee: 0,
      },
    ];
  }, [selectedBreakdownYearLabel, semesterBreakdown]);
  const metricCards = [
    {
      label: "Fully Paid Students",
      value: summary.fullyPaidStudents.toLocaleString("en-IN"),
      style: "bg-[#E6FBEA]",
      iconColor: "#43C17A",
      icon: <UsersThree size={20} weight="fill" />,
    },
    {
      label: "Total Pending Amount",
      value: formatShortCurrency(summary.totalPendingAmount),
      style: "bg-[#FFEDDA]",
      iconColor: "#FFB45F",
      icon: <CurrencyInr size={20} weight="bold" />,
    },
    {
      label: "Students With Pending Fees",
      value: summary.studentsWithPendingFees.toLocaleString("en-IN"),
      style: "bg-[#E2DAFF]",
      iconColor: "#714EF2",
      icon: <UsersThree size={20} weight="fill" />,
    },
    {
      label: "High Pending Students",
      value: summary.highPendingStudents.toLocaleString("en-IN"),
      style: "bg-[#FFE0E0]",
      iconColor: "#FF2525",
      icon: <UsersThree size={20} weight="fill" />,
    },
  ];

  const handleSendReminder = async (row: PendingFeeTableRow) => {
    if (row.pending <= 0) {
      toast.error("This student does not have pending fees.");
      return;
    }

    setRemindingStudentId(row.studentId);
    try {
      await sendPendingFeeReminderNotification({
        userId: row.userId,
        pendingAmount: row.pending,
      });
      toast.success("Fee reminder sent to student.");
    } catch {
      toast.error("Failed to send fee reminder.");
    } finally {
      setRemindingStudentId(null);
    }
  };

  const pendingTableData: Record<string, ReactNode>[] = tableRows.map((row) => ({
    studentName: <span className="font-semibold">{row.studentName}</span>,
    studentId: row.studentIdentifier,
    year: row.year,
    semester: row.semester,
    totalFee: formatCurrency(row.totalFee),
    paid: formatCurrency(row.paid),
    pending: formatCurrency(row.pending),
    status:
      row.totalFee <= 0 ? (
        <span className="inline-flex items-center gap-2 text-[#525252]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#A8A8A8]" />
          Not Assigned
        </span>
      ) : row.pending <= 0 ? (
        <span className="inline-flex items-center gap-2 text-[#43C17A]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#43C17A]" />
          Paid
        </span>
      ) : row.paid > 0 ? (
        <span className="inline-flex items-center gap-2 text-[#F59E0B]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          Partial
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-[#FF2525]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF2525]" />
          Pending
        </span>
      ),
    actions: (
      <button
        type="button"
        disabled={row.pending <= 0 || remindingStudentId === row.studentId}
        onClick={() => handleSendReminder(row)}
        className="rounded-md bg-[#16284F] px-4 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {remindingStudentId === row.studentId ? "Sending..." : "Send Reminder"}
      </button>
    ),
  }));

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Finance Analytics"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push("/finance-manager")}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-lg font-semibold text-[#282828]">
          Pending Fee Overview - {selectedBranchLabel} ({selectedEducationLabel})
        </h1>
      </div>

      <div className="custom-scrollbar mb-3 flex items-center gap-4 overflow-x-auto pb-2">
        <SelectPill
          label="Year"
          value={selectedCreatedYear}
          options={createdYearOptions.map((year) => ({
            value: year,
            label: year,
          }))}
          onChange={(value) => setSelectedCreatedYear(value)}
        />
        <SelectPill
          label="Educational Type"
          value={String(selectedEducationId ?? "")}
          options={educationOptions.map((option) => ({
            value: String(option.id),
            label: option.label,
          }))}
          onChange={(value) => {
            setSelectedEducationId(Number(value));
            setSelectedBranchId(null);
            setSelectedYearId(null);
            setSelectedBreakdownYearId(null);
            setSelectedBreakdownSemesterId(null);
          }}
          disabled={educationOptions.length <= 1}
        />
        <SelectPill
          label="Branch"
          value={String(selectedBranchId ?? "")}
          options={branchOptions.map((option) => ({
            value: String(option.id),
            label: option.label,
          }))}
          onChange={(value) => {
            setSelectedBranchId(Number(value));
            setSelectedYearId(null);
            setSelectedBreakdownYearId(null);
            setSelectedBreakdownSemesterId(null);
          }}
        />
        <SelectPill
          label="Academic Year"
          value={String(selectedYearId ?? "")}
          options={yearOptions.map((option) => ({
            value: String(option.id),
            label: option.label,
          }))}
          onChange={(value) => {
            const nextYearId = Number(value);
            setSelectedYearId(nextYearId);
            setSelectedBreakdownYearId(nextYearId);
            setSelectedBreakdownSemesterId(null);
          }}
        />
      </div>

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {metricCards.map((card) => (
          <CardComponent
            key={card.label}
            style={`${card.style} w-full !h-[122px] !justify-start gap-1 py-3 [&>div:first-child]:!mb-2 [&>div:nth-of-type(2)]:!text-md [&>span]:!text-sm [&>span]:!leading-tight [&>span]:break-words ${
              summaryLoading ? "animate-pulse" : ""
            }`}
            textSize="text-sm"
            icon={card.icon}
            value={card.value}
            label={card.label}
            iconBgColor="#FFFFFF"
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
        <BreakdownCard
          title="Pending Breakdown by Year"
          branchLabel={selectedBranchLabel}
          rows={visibleYearBreakdown}
          selectedId={selectedBreakdownYearId}
          onRowClick={(row) => {
            setSelectedBreakdownYearId(row.id);
            setSelectedBreakdownSemesterId(null);
          }}
        />
        <BreakdownCard
          title="Pending Fee Semester"
          subtitle={selectedBreakdownYearLabel}
          branchLabel={selectedBranchLabel}
          rows={visibleSemesterBreakdown}
          selectedId={selectedBreakdownSemesterId}
          onRowClick={(row) => setSelectedBreakdownSemesterId(row.id)}
        />
      </div>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Students Overview
        </h2>
        <div className="flex w-full max-w-md items-center rounded-full bg-[#EAEAEA] px-4 py-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Student Name / Roll No."
            className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
          />
          <MagnifyingGlass size={22} className="text-[#43C17A]" />
        </div>
      </section>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-[#282828]">
        <span>
          Total Fee :{" "}
          <strong className="rounded-full bg-[#D9F4E4] px-3 py-1 text-[#43C17A]">
            {formatCurrency(summary.totalFee)}
          </strong>
        </span>
        <span>
          Paid:{" "}
          <strong className="rounded-full bg-[#D9F4E4] px-3 py-1 text-[#43C17A]">
            {formatCurrency(summary.paid)}
          </strong>
        </span>
        <span>
          Pending:{" "}
          <strong className="rounded-full bg-[#FFE0E0] px-3 py-1 text-[#FF2525]">
            {formatCurrency(summary.pending)}
          </strong>
        </span>
      </div>

      <div className="mt-3">
        <TableComponent
          columns={pendingTableColumns}
          tableData={pendingTableData}
          height="calc(100vh - 24rem)"
          isLoading={tableLoading}
          tableClassName="min-w-[980px]"
        />
      </div>
    </div>
  );
}
