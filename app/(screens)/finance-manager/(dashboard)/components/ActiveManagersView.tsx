"use client";

import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { downloadCSV } from "@/app/utils/downloadCSV";
import TableComponent from "@/app/utils/table/table";
import {
  fetchActiveManagersOverview,
  type ActiveManagerRow,
} from "@/lib/helpers/finance-manager/dashboard/FetchActiveManagersOverview";
import {
  CaretLeft,
  DownloadSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const columns = [
  { title: "Name", key: "managerName" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Education Type", key: "educationType" },
  { title: "Type", key: "type" },
  { title: "Students Managed", key: "studentsManaged" },
];

type Option = {
  id: number;
  label: string;
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

export default function ActiveManagersView() {
  const {
    collegeId,
    collegeEducationId,
    collegeEducationType,
    loading: contextLoading,
  } = useFinanceManager();
  const [educationOptions, setEducationOptions] = useState<Option[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(
    collegeEducationId,
  );
  const [rows, setRows] = useState<ActiveManagerRow[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadEducations() {
      if (!collegeId || !collegeEducationId || contextLoading) return;
      if (!isMounted) return;
      setEducationOptions([
        {
          id: collegeEducationId,
          label: collegeEducationType ?? "Education",
        },
      ]);
      setSelectedEducationId(collegeEducationId);
    }

    loadEducations();

    return () => {
      isMounted = false;
    };
  }, [collegeEducationId, collegeEducationType, collegeId, contextLoading]);

  const filters = useMemo(() => {
    if (!collegeId || !selectedEducationId) return null;
    return {
      collegeId,
      collegeEducationId: selectedEducationId,
      type: "executive" as const,
    };
  }, [collegeId, selectedEducationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadManagers() {
      if (!filters || contextLoading) return;
      setTableLoading(true);
      try {
        const data = await fetchActiveManagersOverview(filters, debouncedSearch);
        if (!isMounted) return;
        setRows(data);
      } catch {
        if (!isMounted) return;
        setRows([]);
        toast.error("Failed to load active managers");
      } finally {
        if (isMounted) setTableLoading(false);
      }
    }

    loadManagers();

    return () => {
      isMounted = false;
    };
  }, [contextLoading, debouncedSearch, filters]);

  const tableData: Record<string, ReactNode>[] = rows.map((manager) => ({
    managerName: <span className="font-semibold">{manager.managerName}</span>,
    employeeId: manager.employeeId,
    educationType: manager.educationType,
    type: manager.type === "manager" ? "Manager" : "Executive",
    studentsManaged: manager.studentsManaged.toLocaleString("en-IN"),
  }));

  const handleDownload = () => {
    if (rows.length === 0) {
      toast.error("No data available to download");
      return;
    }

    setDownloadLoading(true);
    const exportData = rows.map((manager) => ({
      Name: manager.managerName,
      "Employee ID": manager.employeeId,
      "Education Type": manager.educationType,
      Type: manager.type === "manager" ? "Manager" : "Executive",
      "Students Managed": manager.studentsManaged,
    }));

    window.setTimeout(() => {
      downloadCSV(exportData, "active-managers");
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
            onClick={() => window.history.back()}
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-lg font-semibold text-[#282828]">
            Active Finance Executives
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

      <section className="custom-scrollbar flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex w-full max-w-sm shrink-0 items-center rounded-full bg-[#EAEAEA] px-4 py-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Name / Employee ID"
            className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
          />
          <MagnifyingGlass size={22} className="text-[#43C17A]" />
        </div>
        <SelectPill
          label="Educational Type"
          value={selectedEducationId ? String(selectedEducationId) : ""}
          options={educationOptions.map((option) => ({
            value: String(option.id),
            label: option.label,
          }))}
          onChange={(value) => setSelectedEducationId(Number(value))}
          disabled={educationOptions.length <= 1}
        />
      </section>

      <div className="mt-3">
        <TableComponent
          columns={columns}
          tableData={tableData}
          height="65vh"
          isLoading={tableLoading}
          tableClassName="min-w-[820px]"
        />
      </div>
    </div>
  );
}
