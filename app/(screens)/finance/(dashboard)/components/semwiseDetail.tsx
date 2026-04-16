"use client";

import { useEffect, useMemo, useState } from "react";
import CardComponent from "@/app/utils/card";
import {
  UsersThree,
  MagnifyingGlass,
  CurrencyInr,
  FunnelSimple,
  Faders,
  CaretLeftIcon,
  CaretRight,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { useRouter } from "next/navigation";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";

import { useSearchParams } from "next/navigation";
import { getSemesterFinanceSummary } from "@/lib/helpers/finance/getSemesterStudents";

const SummarySkeleton = () => (
  <div className="bg-[#E2DAFF] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex flex-col justify-center">
        <div className="h-5 w-12 bg-[#CDBBFF] rounded mb-1"></div>
        <div className="h-4 w-24 bg-[#D6C7FF] rounded"></div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-lg p-3 h-[120px] w-[220px] bg-gray-50 border border-gray-100 flex flex-col justify-between shadow-sm animate-pulse">
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="w-9 h-8 rounded-sm bg-gray-200"></div>
    </div>
    <div className="h-6 w-20 bg-gray-300 rounded"></div>
    <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
  </div>
);

const TableSkeleton = ({
  columns,
  height,
}: {
  columns: any[];
  height?: string;
}) => (
  <div className="mt-2 w-full animate-pulse">
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className={`max-h-[${height || "69vh"}] overflow-auto`}>
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
            {[1, 2, 3, 4, 5, 6, 7].map((rowIdx) => (
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

type StudentRow = {
  studentId: number;
  fullName: string;
  branch: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "Paid" | "Pending" | "Partial";
  lastPaymentDate: string | null;
};

export default function SemwiseDetail({ semester }: { semester: string }) {
  const [sortKey, setSortKey] = useState<string>("studentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending" | "partial"
  >("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // 🟢 ADDED DEBOUNCE STATE
  const [showFilter, setShowFilter] = useState(false);

  const [loadingTable, setLoadingTable] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    expected: 0,
    collected: 0,
    pending: 0,
    paidStudents: 0,
    pendingStudents: 0,
  });
  const { collegeId, collegeEducationId, loading } = useFinanceManager();
  const router = useRouter();

  const searchParams = useSearchParams();

  const branchIdParam = searchParams.get("branchId");
  const academicYearParam = searchParams.get("academicYearId");
  const academicYear = searchParams.get("academicYear");
  const semesterParam = searchParams.get("semesterId");

  const branchId = branchIdParam ? Number(branchIdParam) : null;
  const academicYearId = academicYearParam ? Number(academicYearParam) : null;
  const semesterId = semesterParam ? Number(semesterParam) : null;
  const branchName = searchParams.get("branchName");
  const year = searchParams.get("year");
  const breadcrumb = `B-Tech → ${branchName} - ${academicYear} - ${semester}`;

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const filterOptions: {
    label: string;
    value: "all" | "paid" | "pending" | "partial";
  }[] = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Partial", value: "partial" },
  ];

  const columns = [
    { title: "Student Name", key: "fullName" },
    { title: "Student ID", key: "studentId" },
    { title: "Branch", key: "branch" },
    { title: "Total Fee (₹)", key: "totalAmountFormatted" },
    { title: "Paid Amount (₹)", key: "paidAmountFormatted" },
    { title: "Balance (₹)", key: "balanceAmountFormatted" },
    { title: "Payment Status", key: "paymentStatusElement" },
    { title: "Last Payment Date", key: "lastPaymentDate" },
    { title: "Action", key: "action" },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 🟢 DEBOUNCER EFFECT
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page to 1 when a new search triggers
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const processedData = useMemo(() => {
    let data = [...students];

    // 🟢 REMOVED CLIENT-SIDE SEARCH FILTER (Now handled by backend)

    data.sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return data.map((item) => ({
      ...item,

      totalAmount: item.totalAmount,
      paidAmount: item.paidAmount,
      balanceAmount: item.balanceAmount,

      totalAmountFormatted: `₹ ${item.totalAmount.toLocaleString("en-IN")}`,
      paidAmountFormatted: `₹ ${item.paidAmount.toLocaleString("en-IN")}`,
      balanceAmountFormatted: `₹ ${item.balanceAmount.toLocaleString("en-IN")}`,

      lastPaymentDate: formatDate(item.lastPaymentDate),

      paymentStatusElement: (
        <div className="flex items-center justify-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              item.paymentStatus === "Paid"
                ? "bg-green-600"
                : item.paymentStatus === "Partial"
                  ? "bg-orange-500"
                  : "bg-red-600"
            }`}
          />

          <span
            className={`${
              item.paymentStatus === "Paid"
                ? "text-green-600"
                : item.paymentStatus === "Partial"
                  ? "text-orange-500"
                  : "text-red-600"
            }`}
          >
            {item.paymentStatus}
          </span>
        </div>
      ),

      action: (
        <span
          className="cursor-pointer text-[#00A94A] font-medium"
          onClick={() => router.push(`/finance/${item.studentId}`)}
        >
          View Details
        </span>
      ),
    }));
  }, [students, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (loading) return;

      if (
        !collegeId ||
        !collegeEducationId ||
        branchId === null ||
        academicYearId === null ||
        semesterId === null
      ) {
        setLoadingTable(false);
        return;
      }

      setLoadingTable(true);

      try {
        const response = await getSemesterFinanceSummary(
          {
            collegeId,
            collegeEducationId,
            collegeBranchId: branchId,
            collegeAcademicYearId: academicYearId,
            collegeSemesterId: semesterId,
          },
          currentPage,
          rowsPerPage,
          debouncedSearch,
        );

        if (!response) return;

        let studentData: StudentRow[] = response.students || [];

        if (statusFilter === "paid") {
          studentData = studentData.filter((s) => s.paymentStatus === "Paid");
        }

        if (statusFilter === "pending") {
          studentData = studentData.filter(
            (s) => s.paymentStatus === "Pending",
          );
        }

        if (statusFilter === "partial") {
          studentData = studentData.filter(
            (s) => s.paymentStatus === "Partial",
          );
        }

        setStudents(studentData);
        setSummary(response.summary);
        setTotalRecords(response.totalCount || 0);
      } catch (error) {
        console.error("Semester finance fetch error:", error);
      } finally {
        setLoadingTable(false);
      }
    };

    loadData();
  }, [
    loading,
    collegeId,
    collegeEducationId,
    branchId,
    academicYearId,
    semesterId,
    statusFilter,
    currentPage,
    debouncedSearch, // 🟢 TRIGGER RE-FETCH WHEN SEARCH CHANGES
  ]);

  const isPageLoading = loading || loadingTable;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-3">
        <CaretLeftIcon
          size={20}
          weight="bold"
          className="cursor-pointer text-black active:scale-90"
          onClick={router.back}
        />
        <h2 className="text-lg font-semibold text-[#2E7D32]">{breadcrumb}</h2>
      </div>

      {/* --- SUMMARY AREA --- */}
      {isPageLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="bg-[#E2DAFF] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 text-sm font-medium">
          <div>
            <p className="text-[#3E18CB] font-semibold text-md">
              {year ? `${year}-${String(Number(year) + 1).slice(-2)}` : ""}
            </p>
            <p className="text-[#282828] text-sm">Academic Year</p>
          </div>
          <div>
            <p className="text-[#3E18CB] font-semibold text-md">
              {summary.totalStudents}
            </p>
            <p className="text-[#282828] text-sm">Total Students</p>
          </div>
          <div>
            <p className="text-[#3E18CB] font-semibold text-md">
              {summary.expected.toLocaleString()}
            </p>
            <p className="text-[#282828] text-sm">Expected Amount</p>
          </div>
          <div>
            <p className="text-[#3E18CB] font-semibold text-md">
              {summary.collected.toLocaleString()}
            </p>
            <p className="text-[#282828] text-sm">Collected Amount</p>
          </div>
          <div>
            <p className="text-[#3E18CB] font-semibold text-md">
              {summary.pending.toLocaleString()}
            </p>
            <p className="text-[#282828] text-sm">Pending</p>
          </div>
        </div>
      )}

      {/* --- CARDS AREA --- */}
      <div className="flex gap-4 mt-6">
        {isPageLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <CardComponent
              style="bg-[#CEE6FF] h-[120px] w-[220px]"
              icon={<CurrencyInr size={28} weight="fill" color="#60AEFF" />}
              value={`₹ ${summary.collected.toLocaleString("en-IN")}`}
              label="Collected"
            />
            <CardComponent
              style="bg-[#FFE2E2] h-[120px] w-[220px]"
              icon={<CurrencyInr size={28} weight="fill" color="#FF0000" />}
              value={`₹ ${summary.pending.toLocaleString("en-IN")}`}
              label="Pending"
            />
            <CardComponent
              style="bg-[#E6FBEA] h-[120px] w-[220px]"
              icon={<UsersThree size={28} weight="fill" color="#43C17A" />}
              value={summary.paidStudents.toString()}
              label="Paid Students"
            />
            <CardComponent
              style="bg-[#FFEDDA] h-[120px] w-[220px]"
              icon={<UsersThree size={28} weight="fill" color="#FFBB70" />}
              value={summary.pendingStudents.toString()}
              label="Pending Students"
            />
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 mb-3 ">
        <div className="w-[55%] bg-[#EAEAEA] px-2 rounded-2xl flex items-center justify-center">
          <input
            type="text"
            placeholder="Search by Student Name or ID"
            className="w-full p-2 outline-none rounded-lg text-sm text-[#282828]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={20} className="text-[#43C17A] left-3 top-3" />
        </div>

        <div className="flex gap-2">
          {/* <div
            onClick={() => handleSort("fullName")}
            className="bg-[#43C17A1F] cursor-pointer rounded-full p-2 flex items-center justify-center"
          >
            <FunnelSimple size={20} className="text-[#00A94A]" />
          </div> */}

          <div
            onClick={() => setShowFilter(!showFilter)}
            className="relative bg-[#43C17A1F] cursor-pointer rounded-full p-2 flex items-center justify-center"
          >
            <Faders size={20} className="text-[#00A94A]" />
            {showFilter && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg text-sm w-36 z-50">
                {filterOptions.map((option) => {
                  const getTextColor = () => {
                    if (option.value === "paid") return "text-green-600";
                    if (option.value === "pending") return "text-red-600";
                    if (option.value === "partial") return "text-orange-500";
                    return "text-gray-700";
                  };

                  const getDotColor = () => {
                    if (option.value === "paid") return "bg-green-600";
                    if (option.value === "pending") return "bg-red-600";
                    if (option.value === "partial") return "bg-orange-500";
                    return "bg-gray-400";
                  };

                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                        statusFilter === option.value
                          ? "bg-gray-100 font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowFilter(false);
                      }}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${getDotColor()}`}
                      />
                      <span className={`${getTextColor()}`}>
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="flex-1">
        {isPageLoading ? (
          <TableSkeleton columns={columns} height="69vh" />
        ) : (
          <TableComponent
            columns={columns}
            tableData={processedData}
            height="69vh"
          />
        )}

        {/* Pagination only shown if not loading and has data */}
        {!isPageLoading && totalPages > 1 && (
          <div className="flex justify-end items-center gap-3 mt-6 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border
      ${
        currentPage === 1
          ? "border-gray-200 text-gray-300"
          : "border-gray-300 text-gray-600 hover:bg-gray-100"
      }`}
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold
        ${
          currentPage === i + 1
            ? "bg-[#16284F] text-white"
            : "border border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border
      ${
        currentPage === totalPages
          ? "border-gray-200 text-gray-300"
          : "border-gray-300 text-gray-600 hover:bg-gray-100"
      }`}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
