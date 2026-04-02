"use client";

import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  CaretDown,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceDashboardData } from "@/lib/helpers/finance/dashboard/getFinanceDashboardData";

function FeePaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    collegeId,
    collegeEducationId,
  } = useFinanceManager();
  const educationIdFromUrl = searchParams.get("educationId");
  const educationTypeFromUrl = searchParams.get("educationType");
  const branchFromUrl = searchParams.get("branch");
  const branchIdFromUrl = searchParams.get("branchId");
  const selectedYearFromUrl = searchParams.get("selectedYear");


  const collegeEducationIdFromUrl = collegeEducationId;

  const collegeBranchIdFromUrl = branchIdFromUrl
    ? Number(branchIdFromUrl)
    : null;

  const selectedYear = selectedYearFromUrl
    ? Number(selectedYearFromUrl)
    : new Date().getFullYear();

  // convert to number
  const parsedBranchId = branchIdFromUrl ? Number(branchIdFromUrl) : null;
  const [collegeBranchId, setCollegeBranchId] = useState<number | null>(null);
  const [collegeAcademicYearId, setCollegeAcademicYearId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const range = searchParams.get("range") || "this-week";
  const formattedRange = formatRange(range);
  const columns = [
    { title: "Student Name", key: "name" },
    { title: "StudentID", key: "id" },
    { title: "Branch", key: "branch" },
    { title: "Total Fee (₹)", key: "total" },
    { title: "Paid Amount (₹)", key: "paid" },
    { title: "Balance (₹)", key: "balance" },
    { title: "Payment Date", key: "date" },
    { title: "Payment Status", key: "status" },
  ];

  const pageFromUrl = Number(searchParams.get("page") || 1);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const tableData = useMemo(() => {
    return students
      .filter((s) => {
        // ✅ Date range filter
        const matchesRange = isInRange(s.lastPaymentDate, range);

        // ✅ Search filter
        const matchesSearch =
          search.trim() === "" ||
          s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          s.studentId?.toString().includes(search);

        return matchesRange && matchesSearch;
      })
      .map((s) => ({
        name: s.fullName,
        id: s.studentId,
        branch: s.branch,
        total: s.totalAmount.toLocaleString("en-IN"),
        paid: s.paidAmount.toLocaleString("en-IN"),
        balance: s.balanceAmount.toLocaleString("en-IN"),
        date: s.lastPaymentDate
          ? new Date(s.lastPaymentDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "-",
        status: (
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${s.paymentStatus === "Paid"
                ? "bg-green-600"
                : s.paymentStatus === "Partial"
                  ? "bg-orange-500"
                  : "bg-red-600"
                }`}
            ></span>
            <span
              className={`font-medium ${s.paymentStatus === "Paid"
                ? "text-green-600"
                : s.paymentStatus === "Partial"
                  ? "text-orange-500"
                  : "text-red-600"
                }`}
            >
              {s.paymentStatus}
            </span>
          </div>
        ),
      }));
  }, [students, range, search]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());

    router.replace(`?${params.toString()}`);
  }, [currentPage]);

  useEffect(() => {
    if (parsedBranchId) {
      setCollegeBranchId(parsedBranchId);
    }
  }, [parsedBranchId]);

  useEffect(() => {
    const loadData = async () => {

      if (
        !collegeId ||
        !collegeEducationIdFromUrl ||
        !collegeBranchIdFromUrl
      ) {
        return;
      }

      try {
        const startTime = performance.now();

        setIsLoading(true);

        const data = await getFinanceDashboardData(
          {
            collegeId,
            collegeEducationId: collegeEducationIdFromUrl,
            collegeBranchId: collegeBranchIdFromUrl,
            selectedYear,
          },
          currentPage,
          rowsPerPage
        );

        setStudents(data?.tableData || []);
        setTotalRecords(data?.totalCount || 0);

        setIsLoading(false);
        const endTime = performance.now();

        setStudents(data?.tableData || []);

      } catch (error) {
        console.error("❌ Error fetching finance data:", error);
      }
    };

    loadData();
  }, [
    collegeId,
    collegeEducationIdFromUrl,
    collegeBranchIdFromUrl,
    selectedYear,
    currentPage,
  ]);

  function isInRange(dateString: string | null, range: string) {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    if (range === "this-week") return date >= startOfWeek;

    if (range === "last-week") {
      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(startOfWeek.getDate() - 7);

      const lastWeekEnd = new Date(startOfWeek);
      lastWeekEnd.setMilliseconds(-1);

      return date >= lastWeekStart && date <= lastWeekEnd;
    }

    if (range === "this-month") return date >= startOfMonth;

    if (range === "this-year") return date >= startOfYear;

    return true;
  }

  function getDateRange(range: string) {
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const format = (date: Date) =>
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    if (range === "this-week") {
      return `${format(startOfWeek)} – ${format(endOfWeek)}`;
    }

    if (range === "last-week") {
      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(startOfWeek.getDate() - 7);

      const lastWeekEnd = new Date(startOfWeek);
      lastWeekEnd.setDate(startOfWeek.getDate() - 1);

      return `${format(lastWeekStart)} – ${format(lastWeekEnd)}`;
    }

    if (range === "this-month") {
      return today.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
    }

    if (range === "this-year") {
      return today.getFullYear().toString();
    }

    return "";
  }

  return (
    <div className="bg-[#F3F4F6] h-screen flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <CaretLeftIcon
            size={20}
            className="cursor-pointer text-[#282828]"
            onClick={() => router.back()}
          />
          <h1 className="text-xl font-semibold text-[#282828]">
            Fee Payments — {formattedRange} ({getDateRange(range)})
          </h1>
        </div>
        <p className="text-base text-[#282828] mt-1 mb-6">
          Showing all student payments received during this week.
        </p>
        <div className="flex flex-wrap items-center gap-6 -mb-3">
          <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center">
            <input
              type="text"
              placeholder="Search by Student Name / Roll No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
            />
            <MagnifyingGlass size={18} className="text-[#43C17A]" />
          </div>
          <div className="flex items-center gap-6 text-sm text-[#374151]">

            <FilterPill
              title="Educational Type"
              value={educationTypeFromUrl || "N/A"}
            />

            <FilterPill
              title="Branch"
              value={branchFromUrl || "N/A"}
            />
            {/* <FilterPill title="Year" value="1st" showCaret /> */}

          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        <TableComponent
          columns={columns}
          tableData={tableData}
          isLoading={isLoading}
          height="55vh"
        />

        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-3 mt-6">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border
        ${currentPage === 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
            >
              ‹
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold
          ${currentPage === i + 1
                    ? "bg-[#16284F] text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border
        ${currentPage === totalPages
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
            >
              ›
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function formatRange(range: string) {
  switch (range) {
    case "this-week":
      return "This Week";
    case "last-week":
      return "Last Week";
    case "this-month":
      return "This Month";
    case "this-year":
      return "This Year";
    default:
      return "This Week";
  }
}

function FilterPill({
  title,
  value,
  showCaret = false,
}: {
  title: string;
  value: string;
  showCaret?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-[#374151]">{title}</span>

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#43C17A26] text-[#43C17A] font-medium">
        {value}
        {showCaret && <CaretDown size={14} weight="bold" />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6"><Loader /></div>}>
      <FeePaymentsPage />
    </Suspense>
  );
}