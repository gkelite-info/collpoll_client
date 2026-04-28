"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { ChartBarItem, PlacementStudentRow } from "./mockData";
import { updateStudentPlacementApplicationStatus } from "@/lib/helpers/student/placements/studentPlacementApplications";

type ResultsOffersViewProps = {
  companyStats: ChartBarItem[];
  branchStats: ChartBarItem[];
  placedStudents: PlacementStudentRow[];
  isLoading?: boolean;
  placementEmployeeId?: number | null;
  onStatusSaved?: (studentPlacementApplicationId: number, status: string) => void;
};

const rowsPerPage = 10;

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 mb-4 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
          currentPage === 1
            ? "border-gray-200 text-gray-300"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
      >
        <CaretLeft size={18} weight="bold" />
      </button>

      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPageChange(index + 1)}
          className={`h-10 w-10 rounded-lg font-semibold ${
            currentPage === index + 1
              ? "bg-[#16284F] text-white"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-300"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
      >
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  );
}

const ChartSkeleton = () => (
  <div className="h-[246px] animate-pulse rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-6 h-5 w-56 rounded bg-gray-200" />
    <div className="flex h-[170px] items-end gap-4">
      {[70, 100, 55, 85, 45, 65].map((height, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-3">
          <div
            className="w-8 rounded-t-md bg-gray-200"
            style={{ height: `${height}%` }}
          />
          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

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
  const visibleItems = items.filter((item) => item.value > 0);

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
        {visibleItems.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No selected students
          </div>
        ) : visibleItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-[120px] items-end">
              <div
                className="w-8 rounded-t-md bg-gradient-to-b from-[#49C77F] to-[#16284F]"
                style={{
                  height: `${Math.max(12, (item.value / maxValue) * 100)}%`,
                }}
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
  isLoading = false,
  placementEmployeeId,
  onStatusSaved,
}: ResultsOffersViewProps) {
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [studentResults, setStudentResults] = useState<Record<number, string>>(
    {},
  );
  const [localStudents, setLocalStudents] =
    useState<PlacementStudentRow[]>(placedStudents);
  const [updatingStudentId, setUpdatingStudentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLocalStudents(placedStudents);
    setStudentResults({});
  }, [placedStudents]);

  const displayedStudents = useMemo(() => {
    return localStudents.filter((student) => {
      const matchesCompany =
        selectedCompany === "All" || student.company === selectedCompany;
      const matchesBranch =
        selectedBranch === "All" || student.branch === selectedBranch;

      return matchesCompany && matchesBranch;
    });
  }, [localStudents, selectedBranch, selectedCompany]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, selectedCompany]);

  const totalPages = Math.ceil(displayedStudents.length / rowsPerPage);
  const paginatedStudents = useMemo(() => {
    const from = (currentPage - 1) * rowsPerPage;
    return displayedStudents.slice(from, from + rowsPerPage);
  }, [currentPage, displayedStudents]);

  const branchOptions = useMemo(() => {
    return Array.from(
      new Set(
        localStudents
          .filter(
            (student) =>
              selectedCompany === "All" || student.company === selectedCompany,
          )
          .map((student) => student.branch)
          .filter(Boolean),
      ),
    );
  }, [localStudents, selectedCompany]);

  const getVisibleStatus = (student: PlacementStudentRow) => {
    const status = studentResults[student.id] ?? student.status;
    return status && status !== "-" ? status : "Applied";
  };

  const localCompanyStats = useMemo(() => {
    const counts = localStudents
      .filter((student) => getVisibleStatus(student) === "Selected")
      .reduce<Record<string, number>>((acc, student) => {
        acc[student.company] = (acc[student.company] ?? 0) + 1;
        return acc;
      }, {});

    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [localStudents, studentResults]);

  const companyOptions = useMemo(
    () => ["All", ...localCompanyStats.map((company) => company.label)],
    [localCompanyStats],
  );

  const localBranchStats = useMemo(() => {
    const counts = localStudents
      .filter((student) => getVisibleStatus(student) === "Selected")
      .reduce<Record<string, number>>((acc, student) => {
        acc[student.branch] = (acc[student.branch] ?? 0) + 1;
        return acc;
      }, {});

    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [localStudents, studentResults]);

  const selectedBranchStats = useMemo(() => {
    if (selectedCompany === "All") return localBranchStats;

    const branchCounts = localStudents
      .filter(
        (student) =>
          student.company === selectedCompany &&
          getVisibleStatus(student) === "Selected",
      )
      .reduce<Record<string, number>>((counts, student) => {
        counts[student.branch] = (counts[student.branch] ?? 0) + 1;
        return counts;
      }, {});

    return Object.entries(branchCounts).map(([label, value]) => ({
      label,
      value,
    }));
  }, [localBranchStats, localStudents, selectedCompany, studentResults]);

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
    return paginatedStudents.map((student) => ({
      studentName: student.studentName,
      studentId: student.studentId,
      branch: student.branch,
      year: student.year,
      recruited: student.company,
      role: student.role,
      package: student.package,
      status: getVisibleStatus(student),
      statusElement: (
        <button
          type="button"
          disabled={!placementEmployeeId || updatingStudentId === student.id}
          onClick={async () => {
            if (!placementEmployeeId || updatingStudentId === student.id) return;

            const currentStatus = getVisibleStatus(student);
            const nextStatus =
              currentStatus === "Selected" ? "Rejected" : "Selected";
            const dbStatus = nextStatus === "Selected" ? "selected" : "rejected";

            setUpdatingStudentId(student.id);
            setStudentResults((prev) => ({
              ...prev,
              [student.id]: nextStatus,
            }));
            setLocalStudents((prev) =>
              prev.map((item) =>
                item.id === student.id ? { ...item, status: nextStatus } : item,
              ),
            );

            try {
              await updateStudentPlacementApplicationStatus({
                studentPlacementApplicationId: student.id,
                status: dbStatus,
                updatedBy: placementEmployeeId,
              });
              onStatusSaved?.(student.id, nextStatus);
            } catch (error) {
              console.error("Failed to update placement result:", error);
              setStudentResults((prev) => ({
                ...prev,
                [student.id]: currentStatus,
              }));
              setLocalStudents((prev) =>
                prev.map((item) =>
                  item.id === student.id
                    ? { ...item, status: currentStatus }
                    : item,
                ),
              );
            } finally {
              setUpdatingStudentId(null);
            }
          }}
          className={`relative inline-flex h-7 w-[118px] items-center rounded-full px-1 text-[13px] font-medium transition-colors ${
            getVisibleStatus(student) === "Selected"
                ? "bg-[#E8F8EF] text-[#128C4A]"
                : getVisibleStatus(student) === "Rejected"
                  ? "bg-[#FDECEC] text-[#C24141]"
                  : "bg-[#F3F4F6] text-[#6B7280]"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <span
            className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
              getVisibleStatus(student) === "Selected"
                ? "translate-x-[87px]"
                : "translate-x-0"
            }`}
          />
          <span className="relative z-10 w-full text-center">
            {updatingStudentId === student.id
              ? "Saving..."
              : getVisibleStatus(student) ?? "Select"}
          </span>
        </button>
      ),
    }));
  }, [
    paginatedStudents,
    onStatusSaved,
    placementEmployeeId,
    studentResults,
    updatingStudentId,
  ]);

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedBranch("All");
  };

  return (
    <div className="space-y-4 mb-5">
      <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9D3DE] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
        <div className="grid min-w-[820px] gap-4 lg:grid-cols-2">
          {isLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <SimpleBarChart
                title="Company - wise Placement Status"
                items={localCompanyStats}
              />
              <SimpleBarChart
                title=""
                items={selectedBranchStats}
                selectedCompany={selectedCompany}
                companyOptions={companyOptions}
                onCompanyChange={handleCompanyChange}
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[18px] text-[#333333]">
          <span className="font-medium">{selectedCompany}</span>
          <span className="text-[#6B7280]">
            {/* - Placed Students ({displayedStudents.length} Total) */}
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

      {isLoading || updatingStudentId !== null ? (
        <TableComponent
          columns={columns}
          tableData={[]}
          height="42vh"
          stickyHeader={false}
          isLoading
        />
      ) : tableData.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No placement result records found.
        </p>
      ) : (
        <>
          <TableComponent
            columns={columns}
            tableData={tableData}
            height="42vh"
            stickyHeader={false}
            isLoading={isLoading}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
