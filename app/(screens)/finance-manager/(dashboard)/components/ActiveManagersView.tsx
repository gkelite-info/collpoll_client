"use client";

import { downloadCSV } from "@/app/utils/downloadCSV";
import TableComponent from "@/app/utils/table/table";
import {
  CaretDown,
  CaretLeft,
  DownloadSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useState } from "react";

const managerRows = [
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
  "Priya Sharma",
  "Rahul Mehta",
  "Neha Patel",
];

const columns = [
  { title: "Manager Name", key: "managerName" },
  { title: "Employee ID", key: "employeeId" },
  { title: "Education Type", key: "educationType" },
  { title: "Branch", key: "branch" },
  { title: "Students Managed", key: "studentsManaged" },
  { title: "Last Login", key: "lastLogin" },
];

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#282828]">
      <span>{label}</span>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-[#D9F4E4] px-4 py-1 text-sm font-semibold text-[#43C17A]"
      >
        {value}
        <CaretDown size={14} weight="bold" />
      </button>
    </div>
  );
}

export default function ActiveManagersView() {
  const [downloadLoading, setDownloadLoading] = useState(false);

  const tableData = managerRows.map((manager) => ({
    managerName: <span className="font-semibold">{manager}</span>,
    employeeId: "22CSE101",
    educationType: "B.Tech",
    branch: "CSE",
    studentsManaged: "2450",
    lastLogin: "03/11/2026",
  }));

  const handleDownload = () => {
    setDownloadLoading(true);

    const exportData = managerRows.map((manager) => ({
      "Manager Name": manager,
      "Employee ID": "22CSE101",
      "Education Type": "B.Tech",
      Branch: "CSE",
      "Students Managed": "2450",
      "Last Login": "03/11/2026",
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0] cursor-pointer"
            onClick={() => window.history.back()}
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <h1 className="text-lg font-semibold text-[#282828]">
            Active Managers
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
            placeholder="Search by Student Name / Roll No."
            className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
          />
          <MagnifyingGlass size={22} className="text-[#43C17A]" />
        </div>
        <FilterPill label="Educational Type" value="All" />
        <FilterPill label="Branch" value="All" />
      </section>

      <div className="custom-scrollbar mt-3 overflow-x-auto">
        <div className="min-w-[980px]">
          <TableComponent columns={columns} tableData={tableData} height="65vh" />
        </div>
      </div>
    </div>
  );
}
