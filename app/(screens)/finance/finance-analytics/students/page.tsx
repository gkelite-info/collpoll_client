"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  DownloadSimple,
  UsersThree,
  CaretLeftIcon,
  CaretDown,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceFilterOptions } from "@/lib/helpers/finance/getFinanceFilterOptions";
import toast from "react-hot-toast";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  getOverallStudentsOverview,
  getOverallStudentsSummary,
} from "@/lib/helpers/finance/getOverallStudentsOverview";

type Semester = {
  collegeSemesterId: number;
  collegeSemester: number;
  collegeAcademicYearId: number;
};

type AcademicYear = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
  collegeBranchId: number;
  semesters: Semester[];
};

type Branch = {
  collegeBranchId: number;
  collegeBranchCode: string;
  years: AcademicYear[];
};

// --- Corrected Shimmer Skeleton for Summary Cards ---
const CardSkeleton = () => (
  <div className="rounded-lg p-3 h-32 bg-gray-50 border border-gray-100 flex flex-col justify-between shadow-sm animate-pulse w-full">
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="w-9 h-8 rounded-sm bg-gray-200"></div>
    </div>
    <div className="h-6 w-16 bg-gray-300 rounded"></div>
    <div className="h-4 w-32 bg-gray-200 rounded mt-1"></div>
  </div>
);

// --- New Standalone Table Shimmer ---
const TableSkeleton = ({
  columns,
  height,
}: {
  columns: any[];
  height?: string;
}) => (
  <div className="mt-2 w-full animate-pulse">
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className={`max-h-[${height || "55vh"}] overflow-auto`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-left">
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div
                      className={`h-4 bg-gray-200 rounded ${
                        colIdx === 0 ? "w-3/4" : "w-1/2"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
// ------------------------------------------

function OverallStudentsOverview() {
  const router = useRouter();

  const { collegeId, collegeEducationId, collegeEducationType, loading } =
    useFinanceManager();
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [educationFilter, setEducationFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const searchParams = useSearchParams();
  const studentsCount = searchParams.get("studentsCount");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    partial: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [quickInsights, setQuickInsights] = useState({
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  });

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const statusOptions = ["All", "Paid", "Pending", "Partial"];

  const cardsData = [
    {
      style: "bg-[#E2DAFF]",
      icon: <UsersThree size={24} color="#6C20CA" weight="fill" />,
      value: summaryCounts.total.toString(),
      label: "Total Students",
    },
    {
      style: "bg-[#E6FBEA]",
      icon: <UsersThree size={24} color="#43C17A" weight="fill" />,
      value: summaryCounts.paid.toString(),
      label: "Fully Paid Students",
    },
    {
      style: "bg-[#FFEDDA]",
      icon: <UsersThree size={24} color="#FFBB70" weight="fill" />,
      value: summaryCounts.partial.toString(),
      label: "Partially Paid Students",
    },
    {
      style: "bg-[#FFE2E2]",
      icon: <UsersThree size={24} color="#FF0000" weight="fill" />,
      value: summaryCounts.pending.toString(),
      label: "Pending Students",
    },
  ];

  useEffect(() => {
    loadCardsSummary();
  }, [collegeId, collegeEducationId]);

  const loadCardsSummary = async () => {
    if (!collegeId || !collegeEducationId || loading) {
      return;
    }

    setCardsLoading(true);

    try {
      const summary = await getOverallStudentsSummary(
        collegeId,
        collegeEducationId,
      );

      setSummaryCounts(summary);
    } catch (err: any) {
      console.error("❌ Cards Summary Error:", err);
      toast.error(err?.message || "Failed to load summary");
    } finally {
      setCardsLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!collegeId || !collegeEducationId || loading) {
      return;
    }

    setTableLoading(true);

    try {
      const data = await getOverallStudentsOverview(
        {
          collegeId,
          collegeEducationId,
          collegeBranchId:
            branchFilter !== "All" ? Number(branchFilter) : undefined,
          collegeAcademicYearId:
            yearFilter !== "All" ? Number(yearFilter) : undefined,
          collegeSemesterId:
            semesterFilter !== "All" ? Number(semesterFilter) : undefined,
          status:
            statusFilter !== "All"
              ? (statusFilter as "Paid" | "Pending" | "Partial")
              : undefined,
        },
        currentPage,
        rowsPerPage,
        search,
      );

      setStudentsData(data.students);
      setTotalRecords(data.totalCount ?? 0);
    } catch (error: any) {
      console.error("❌ Table Load Error:", error);
      toast.error(error?.message || "Failed to load students");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [
    collegeId,
    collegeEducationId,
    branchFilter,
    yearFilter,
    semesterFilter,
    statusFilter,
    currentPage,
    search,
  ]);

  const renderStatus = (status: "Paid" | "Pending" | "Partial") => {
    if (status === "Paid") {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22A55D]" />
          <span className="text-[#22A55D] font-medium">Paid</span>
        </div>
      );
    }

    if (status === "Partial") {
      return (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[#F59E0B] font-medium">Partial</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
        <span className="text-[#EF4444] font-medium">Pending</span>
      </div>
    );
  };

  const tableData = useMemo(() => {
    return studentsData.map((item) => ({
      studentName: item.studentName,
      rollNo: item.studentId,
      educationType: collegeEducationType,
      branch: item.branchCode,
      year: item.yearName,
      semester: `Sem ${item.semester}`,
      paid: `₹ ${Number(item.paidAmount).toLocaleString("en-IN")}`,
      pending: `₹ ${Number(item.pendingAmount).toLocaleString("en-IN")}`,
      status: renderStatus(item.status),
      action: (
        <span
          onClick={() => router.push(`/finance/${item.studentId}`)}
          className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
        >
          View
        </span>
      ),
    }));
  }, [studentsData]);

  const handleDownload = async () => {
    if (!studentsData || studentsData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    try {
      setDownloadLoading(true);

      const exportData = studentsData.map((item) => ({
        studentId: item.studentId,
        studentName: item.studentName,
        educationType: collegeEducationType ?? "",
        branchCode: item.branchCode,
        yearName: item.yearName,
        semester: item.semester,
        paidAmount: item.paidAmount,
        pendingAmount: item.pendingAmount,
        status: item.status,
      }));

      setTimeout(() => {
        downloadCSV(exportData, "students-report");
        setDownloadLoading(false);
      }, 300);
    } catch (error) {
      setDownloadLoading(false);
      toast.error("Failed to download report");
    }
  };

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "rollNo" },
    { title: "Education Type", key: "educationType" },
    { title: "Branch", key: "branch" },
    { title: "Year", key: "year" },
    { title: "Semester", key: "semester" },
    { title: "Paid", key: "paid" },
    { title: "Pending", key: "pending" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  const interColumns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "rollNo" },
    { title: "Education Type", key: "educationType" },
    { title: "Group", key: "branch" },
    { title: "Year", key: "year" },
    { title: "Paid", key: "paid" },
    { title: "Pending", key: "pending" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  useEffect(() => {
    const loadFilters = async () => {
      if (!loading && collegeId && collegeEducationId) {
        const filterData = await getFinanceFilterOptions(
          collegeId,
          collegeEducationId,
        );

        const branchList = filterData.branches || [];

        setBranches(branchList);

        if (branchList.length > 0) {
          setSelectedBranch(branchList[0].collegeBranchCode);
        }
      }
    };

    loadFilters();
  }, [loading, collegeId, collegeEducationId]);

  return (
    <div className="p-2 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 cursor-pointer">
          <CaretLeftIcon
            size={20}
            color="#282828"
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h2 className="text-lg font-semibold text-[#282828]">
            Overall Students Overview
          </h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloadLoading}
          className={`bg-[#16284F] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all cursor-pointer
    ${
      downloadLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#1E3A8A]"
    }`}
        >
          {downloadLoading ? "Downloading Report..." : "Download Report"}
          {!downloadLoading && <DownloadSimple size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {cardsLoading || loading
          ? /* Render 4 Skeletons while loading */
            [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
          : /* Render actual cards once data is loaded */
            cardsData.map((card, index) => (
              <CardComponent
                key={index}
                style={card.style}
                icon={card.icon}
                value={card.value}
                label={card.label}
              />
            ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[300px] flex-shrink-0">
          <input
            placeholder="Search by student name / roll no."
            className="bg-transparent outline-none text-sm w-full text-[#282828]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={24} className="text-[#22A55D]" />
        </div>
        <div className="overflow-x-auto w-full">
          <div className="flex items-center gap-6 min-w-max">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Education Type
              </span>
              <input
                value={collegeEducationType ?? ""}
                disabled
                className="bg-[#43C17A26] text-center text-[#43C17A] outline-none w-[80px] cursor-not-allowed px-3 py-1 rounded-full text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                {collegeEducationType === "Inter" ? "Group" : "Branch"}
              </span>

              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBranchFilter(value);

                    setYearFilter("All");
                    setSemesterFilter("All");
                  }}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  <option value="All">All</option>
                  {branches.map((b) => (
                    <option key={b.collegeBranchId} value={b.collegeBranchId}>
                      {b.collegeBranchCode}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#282828] font-semibold">
                  Year
                </span>
                <div className="relative">
                  <select
                    value={yearFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setYearFilter(value);

                      setSemesterFilter("All");
                    }}
                    disabled={branchFilter === "All"}
                    className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                  >
                    <option value="All">All</option>
                    {branchFilter !== "All" &&
                      branches
                        .find((b) => b.collegeBranchId === Number(branchFilter))
                        ?.years?.map((year) => (
                          <option
                            key={year.collegeAcademicYearId}
                            value={year.collegeAcademicYearId}
                          >
                            {year.collegeAcademicYear}
                          </option>
                        ))}
                  </select>
                  <CaretDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {!(collegeEducationType === "Inter") && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#282828] font-semibold">
                    Sem
                  </span>
                  <div className="relative">
                    <select
                      value={semesterFilter}
                      onChange={(e) => setSemesterFilter(e.target.value)}
                      disabled={yearFilter === "All"}
                      className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                    >
                      <option value="All">All</option>
                      {branchFilter !== "All" &&
                        yearFilter !== "All" &&
                        branches
                          .find(
                            (b) => b.collegeBranchId === Number(branchFilter),
                          )
                          ?.years?.find(
                            (y) =>
                              y.collegeAcademicYearId === Number(yearFilter),
                          )
                          ?.semesters?.map((sem) => (
                            <option
                              key={sem.collegeSemesterId}
                              value={sem.collegeSemesterId}
                            >
                              Sem {sem.collegeSemester}
                            </option>
                          ))}
                    </select>
                    <CaretDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#282828] font-semibold">
                Status
              </span>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-[#43C17A26] text-center text-[#43C17A] outline-none px-6 py-1 pr-8 rounded-full text-sm cursor-pointer"
                >
                  {statusOptions.map((o) => (
                    <option key={o} value={o} className="text-left">
                      {o}
                    </option>
                  ))}
                </select>

                <CaretDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43C17A] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-lg text-[#282828] font-bold mb-3 -mt-3">
        Overall Students Overview
      </h1>

      {/* Conditionally Render Table Shimmer or Actual Table */}
      {tableLoading ? (
        <TableSkeleton
          columns={collegeEducationType === "Inter" ? interColumns : columns}
          height="55vh"
        />
      ) : (
        <TableComponent
          columns={collegeEducationType === "Inter" ? interColumns : columns}
          tableData={tableData}
          height="55vh"
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-8 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
        ${
          currentPage === 1
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
          >
            <CaretLeft size={18} weight="bold" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all
          ${
            currentPage === i + 1
              ? "bg-[#16284F] text-white shadow-md"
              : "border border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
        ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading students overview...</div>}>
      <OverallStudentsOverview />
    </Suspense>
  );
}
