"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import CardComponent from "@/app/utils/card";
import { downloadCSV } from "@/app/utils/downloadCSV";
import TableComponent from "@/app/utils/table/table";
import {
  fetchAcademicYears,
  fetchBranches,
  fetchSemesters,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  fetchTotalStudentsOverview,
  fetchTotalStudentsSummary,
  type TotalStudentsRow,
  type TotalStudentsStatus,
  type TotalStudentsSummary,
} from "@/lib/helpers/finance-manager/dashboard/FetchTotalStudentsOverview";
import {
  CaretLeft,
  DownloadSimple,
  MagnifyingGlass,
  UsersThree,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const rupee = "\u20B9";

const columns = [
  { title: "Student Name", key: "studentName" },
  { title: "Roll No", key: "rollNo" },
  { title: "Education Type", key: "educationType" },
  { title: "Branch", key: "branch" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Paid", key: "paid" },
  { title: "Pending", key: "pending" },
  { title: "Status", key: "status" },
];

type Option = {
  id: number;
  label: string;
};

const emptySummary: TotalStudentsSummary = {
  totalStudents: 0,
  fullyPaidStudents: 0,
  partiallyPaidStudents: 0,
  pendingStudents: 0,
};

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "Paid", label: "Paid" },
  { value: "Partial", label: "Partial" },
  { value: "Pending", label: "Pending" },
  { value: "Not Assigned", label: "Not Assigned" },
];

const formatCurrency = (amount: number) =>
  `${rupee}${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

const formatExportAmount = (amount: number) =>
  Math.round(Number(amount) || 0).toLocaleString("en-IN");

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
    <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#282828]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-full bg-[#D9F4E4] px-4 py-1 text-sm font-semibold text-[#43C17A] outline-none disabled:cursor-not-allowed disabled:opacity-70"
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

function renderStatus(status: TotalStudentsStatus) {
  const styles: Record<TotalStudentsStatus, { dot: string; text: string }> = {
    Paid: { dot: "bg-[#22C55E]", text: "text-[#22C55E]" },
    Partial: { dot: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
    Pending: { dot: "bg-[#FF2525]", text: "text-[#FF2525]" },
    "Not Assigned": { dot: "bg-[#A8A8A8]", text: "text-[#525252]" },
  };

  return (
    <span className={`inline-flex items-center gap-2 ${styles[status].text}`}>
      <span className={`h-3 w-3 rounded-full ${styles[status].dot}`} />
      {status}
    </span>
  );
}

export default function TotalStudentsOverviewView() {
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
  const [semesterOptions, setSemesterOptions] = useState<Option[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    financeEducationId,
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<TotalStudentsStatus | "">(
    "",
  );
  const [summary, setSummary] = useState<TotalStudentsSummary>(emptySummary);
  const [rows, setRows] = useState<TotalStudentsRow[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 350);
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
      setSelectedBranchId(null);
      setSelectedYearId(null);
      setSelectedSemesterId(null);
    }

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadYears() {
      if (!collegeId || !selectedEducationId || !selectedBranchId) {
        setYearOptions([]);
        setSelectedYearId(null);
        setSelectedSemesterId(null);
        return;
      }

      const years = await fetchAcademicYears(
        collegeId,
        selectedEducationId,
        selectedBranchId,
      );
      if (!isMounted) return;
      setYearOptions(
        years.map((year) => ({
          id: year.collegeAcademicYearId,
          label: year.collegeAcademicYear,
        })),
      );
      setSelectedYearId(null);
      setSelectedSemesterId(null);
    }

    loadYears();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedBranchId, selectedEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSemesters() {
      if (!collegeId || !selectedEducationId || !selectedYearId) {
        setSemesterOptions([]);
        setSelectedSemesterId(null);
        return;
      }

      const semesters = await fetchSemesters(
        collegeId,
        selectedEducationId,
        selectedYearId,
      );
      if (!isMounted) return;
      setSemesterOptions(
        semesters.map((semester) => ({
          id: semester.collegeSemesterId,
          label: `Sem ${semester.collegeSemester}`,
        })),
      );
      setSelectedSemesterId(null);
    }

    loadSemesters();

    return () => {
      isMounted = false;
    };
  }, [collegeId, selectedEducationId, selectedYearId]);

  const filters = useMemo(() => {
    if (!collegeId || !selectedEducationId) return null;

    return {
      collegeId,
      collegeEducationId: selectedEducationId,
      collegeBranchId: selectedBranchId,
      collegeAcademicYearId: selectedYearId,
      collegeSemesterId: selectedSemesterId,
      status: selectedStatus || null,
    };
  }, [
    collegeId,
    selectedBranchId,
    selectedEducationId,
    selectedSemesterId,
    selectedStatus,
    selectedYearId,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      if (!filters) return;
      setSummaryLoading(true);
      try {
        const data = await fetchTotalStudentsSummary(filters);
        if (!isMounted) return;
        setSummary(data);
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

    async function loadRows() {
      if (!filters) return;
      setTableLoading(true);
      try {
        const data = await fetchTotalStudentsOverview(filters, debouncedSearch);
        if (!isMounted) return;
        setRows(data.rows);
      } catch {
        if (!isMounted) return;
        setRows([]);
        toast.error("Failed to load students");
      } finally {
        if (isMounted) setTableLoading(false);
      }
    }

    loadRows();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, filters]);

  const overviewCards = [
    {
      label: "Total Students",
      value: summary.totalStudents.toLocaleString("en-IN"),
      style: "bg-[#E2DAFF]",
      iconColor: "#714EF2",
    },
    {
      label: "Fully Paid Students",
      value: summary.fullyPaidStudents.toLocaleString("en-IN"),
      style: "bg-[#E6FBEA]",
      iconColor: "#43C17A",
    },
    {
      label: "Partially Paid Students",
      value: summary.partiallyPaidStudents.toLocaleString("en-IN"),
      style: "bg-[#FFEDDA]",
      iconColor: "#FFB45F",
    },
    {
      label: "Pending Students",
      value: summary.pendingStudents.toLocaleString("en-IN"),
      style: "bg-[#FFE0E0]",
      iconColor: "#FF2525",
    },
  ];

  const tableData: Record<string, ReactNode>[] = rows.map((row) => ({
    studentName: <span className="font-semibold">{row.studentName}</span>,
    rollNo: row.rollNo,
    educationType: row.educationType,
    branch: row.branch,
    year: row.year,
    semester: row.semester,
    paid: formatCurrency(row.paid),
    pending: formatCurrency(row.pending),
    status: renderStatus(row.status),
  }));

  const handleDownload = () => {
    if (rows.length === 0) {
      toast.error("No data available to download");
      return;
    }

    setDownloadLoading(true);
    const exportData = rows.map((row) => ({
      "Student Name": row.studentName,
      "Roll No": row.rollNo,
      "Education Type": row.educationType,
      Branch: row.branch,
      Year: row.year,
      Semester: row.semester,
      Paid: formatExportAmount(row.paid),
      Pending: formatExportAmount(row.pending),
      Status: row.status,
    }));

    window.setTimeout(() => {
      downloadCSV(exportData, "overall-students-overview");
      setDownloadLoading(false);
    }, 300);
  };

  return (
    <div className="w-full p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to Finance Analytics"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
            onClick={() => router.push("/finance-manager")}
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-lg font-semibold text-[#282828]">
            Overall Students Overview
          </h1>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadLoading}
          className={`flex items-center gap-2 rounded-md bg-[#16284F] px-4 py-2 text-sm font-semibold text-white transition-all ${
            downloadLoading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:bg-[#1E3A8A]"
          }`}
        >
          {downloadLoading ? "Downloading..." : "Download Report"}
          {!downloadLoading && <DownloadSimple size={18} />}
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {overviewCards.map((card) => (
          <CardComponent
            key={card.label}
            style={`${card.style} w-full !h-[108px] py-3 [&>div:first-child]:!mb-2 [&>div:nth-of-type(2)]:!text-md [&>span]:!text-sm [&>span]:!leading-tight ${
              summaryLoading ? "animate-pulse" : ""
            }`}
            textSize="text-sm"
            icon={<UsersThree size={22} weight="fill" />}
            value={card.value}
            label={card.label}
            iconBgColor="#FFFFFF"
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <section className="custom-scrollbar mt-4 flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex w-full max-w-sm shrink-0 items-center rounded-full bg-[#EAEAEA] px-4 py-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Student Name / Roll No."
            className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
          />
          <MagnifyingGlass size={22} className="text-[#43C17A]" />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <SelectPill
            label="Educational Type"
            value={String(selectedEducationId ?? "")}
            options={educationOptions.map((option) => ({
              value: String(option.id),
              label: option.label,
            }))}
            onChange={(value) => setSelectedEducationId(Number(value))}
            disabled={educationOptions.length <= 1}
          />
          <SelectPill
            label="Branch"
            value={selectedBranchId ? String(selectedBranchId) : ""}
            options={[
              { value: "", label: "All" },
              ...branchOptions.map((option) => ({
                value: String(option.id),
                label: option.label,
              })),
            ]}
            onChange={(value) => {
              setSelectedBranchId(value ? Number(value) : null);
              setSelectedYearId(null);
              setSelectedSemesterId(null);
            }}
          />
          <SelectPill
            label="Year"
            value={selectedYearId ? String(selectedYearId) : ""}
            options={[
              { value: "", label: "All" },
              ...yearOptions.map((option) => ({
                value: String(option.id),
                label: option.label,
              })),
            ]}
            onChange={(value) => {
              setSelectedYearId(value ? Number(value) : null);
              setSelectedSemesterId(null);
            }}
            disabled={!selectedBranchId}
          />
          <SelectPill
            label="Sem"
            value={selectedSemesterId ? String(selectedSemesterId) : ""}
            options={[
              { value: "", label: "All" },
              ...semesterOptions.map((option) => ({
                value: String(option.id),
                label: option.label,
              })),
            ]}
            onChange={(value) => setSelectedSemesterId(value ? Number(value) : null)}
            disabled={!selectedYearId}
          />
          <SelectPill
            label="Status"
            value={selectedStatus}
            options={statusOptions}
            onChange={(value) =>
              setSelectedStatus(value as TotalStudentsStatus | "")
            }
          />
        </div>
      </section>

      <h2 className="mt-4 text-md font-semibold text-[#282828]">
        Overall Students Overview
      </h2>

      <div className="mt-2">
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="55vh"
          isLoading={tableLoading}
          tableClassName="min-w-[1050px]"
        />
      </div>
    </div>
  );
}
