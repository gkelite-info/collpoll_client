"use client";

import { useMemo, useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { ChartBarItem, PlacementStudentRow } from "./mockData";

type ResultsOffersViewProps = {
  companyStats: ChartBarItem[];
  branchStats: ChartBarItem[];
  placedStudents: PlacementStudentRow[];
};

function SimpleBarChart({
  title,
  items,
  selectedCompany,
  companyOptions,
  onCompanyChange,
}: {
  title: string;
  items: ChartBarItem[];
  selectedCompany?: string;
  companyOptions?: string[];
  onCompanyChange?: (company: string) => void;
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {companyOptions && selectedCompany && onCompanyChange && (
            <span className="relative shrink-0">
              <select
                value={selectedCompany}
                onChange={(event) => onCompanyChange(event.target.value)}
                className="h-8 appearance-none rounded bg-[#1A3765] px-3 pr-8 text-[12px] font-medium text-white outline-none"
              >
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <CaretDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white"
              />
            </span>
          )}
          {title && (
            <p className="truncate text-[15px] font-medium text-[#333333]">
              {title}
            </p>
          )}
        </div>
        <CaretRight size={16} className="shrink-0 text-[#6B7280]" />
      </div>

      <div className="flex h-[140px] items-end gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-[120px] items-end">
              <div
                className="w-8 rounded-t-md bg-gradient-to-b from-[#49C77F] to-[#16284F]"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#4B5563]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsOffersView({
  companyStats,
  branchStats,
  placedStudents,
}: ResultsOffersViewProps) {
  const companyOptions = useMemo(
    () => ["All", ...companyStats.map((company) => company.label)],
    [companyStats],
  );
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [studentResults, setStudentResults] = useState<Record<number, string>>(
    {},
  );

  const displayedStudents = useMemo(() => {
    return placedStudents.filter((student) => {
      const matchesCompany =
        selectedCompany === "All" || student.company === selectedCompany;
      const matchesBranch =
        selectedBranch === "All" || student.branch === selectedBranch;

      return matchesCompany && matchesBranch;
    });
  }, [placedStudents, selectedBranch, selectedCompany]);

  const branchOptions = useMemo(() => {
    return Array.from(
      new Set(
        placedStudents
          .filter(
            (student) =>
              selectedCompany === "All" || student.company === selectedCompany,
          )
          .map((student) => student.branch)
          .filter(Boolean),
      ),
    );
  }, [placedStudents, selectedCompany]);

  const selectedBranchStats = useMemo(() => {
    if (selectedCompany === "All") return branchStats;

    const branchCounts = placedStudents
      .filter((student) => student.company === selectedCompany)
      .reduce<Record<string, number>>((counts, student) => {
        counts[student.branch] = (counts[student.branch] ?? 0) + 1;
        return counts;
      }, {});

    return branchStats.map((branch) => ({
      ...branch,
      value: branchCounts[branch.label] ?? 0,
    }));
  }, [branchStats, placedStudents, selectedCompany]);

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "Year", key: "year" },
    { title: "Recruited", key: "recruited" },
    { title: "Role", key: "role" },
    { title: "Package", key: "package" },
    { title: "Status", key: "status" },
    { title: "Update", key: "statusElement" },
  ];

  const tableData = useMemo(() => {
    return displayedStudents.map((student) => ({
      studentName: student.studentName,
      studentId: student.studentId,
      branch: student.branch,
      year: student.year,
      recruited: student.company,
      role: student.role,
      package: student.package,
      status: studentResults[student.id] ?? "-",
      statusElement: (
        <button
          type="button"
          onClick={() =>
            setStudentResults((prev) => {
              const currentStatus = prev[student.id];
              return {
                ...prev,
                [student.id]:
                  currentStatus === "Placed" ? "Rejected" : "Placed",
              };
            })
          }
          className={`relative inline-flex h-7 w-[118px] items-center rounded-full px-1 text-[13px] font-medium transition-colors ${
            !studentResults[student.id]
              ? "bg-[#F3F4F6] text-[#6B7280]"
              : studentResults[student.id] === "Placed"
                ? "bg-[#E8F8EF] text-[#128C4A]"
                : "bg-[#FDECEC] text-[#C24141]"
          }`}
        >
          <span
            className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
              !studentResults[student.id]
                ? "translate-x-0"
                : studentResults[student.id] === "Placed"
                ? "translate-x-[87px]"
                : "translate-x-0"
            }`}
          />
          <span className="relative z-10 w-full text-center">
            {studentResults[student.id] ?? "Select"}
          </span>
        </button>
      ),
    }));
  }, [displayedStudents, studentResults]);

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedBranch("All");
  };

  return (
    <div className="space-y-4 mb-5">
      <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
        <div className="grid min-w-[820px] gap-4 lg:grid-cols-2">
          <SimpleBarChart
            title="Company - wise Placement Status"
            items={companyStats}
          />
          <SimpleBarChart
            title=""
            items={selectedBranchStats}
            selectedCompany={selectedCompany}
            companyOptions={companyOptions}
            onCompanyChange={handleCompanyChange}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[18px] text-[#333333]">
          <span className="font-medium">{selectedCompany}</span>
          <span className="text-[#6B7280]">
            - Placed Students ({displayedStudents.length} Total)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[14px] text-[#5C5C5C]">
          <span>Branch :</span>
          <span className="relative">
            <select
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
              className="h-7 appearance-none rounded-full bg-[#E8F8EF] px-3 pr-8 text-[#43C17A] outline-none"
            >
              <option value="All">All Branch</option>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A]"
            />
          </span>
        </div>
      </div>

      <TableComponent
        columns={columns}
        tableData={tableData}
        height="42vh"
        stickyHeader={false}
      />
    </div>
  );
}
