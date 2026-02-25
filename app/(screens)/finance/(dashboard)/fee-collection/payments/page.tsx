"use client";

import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  CaretDown,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getFinanceDashboardData } from "@/lib/helpers/finance/dashboard/getFinanceDashboardData";

function FeePaymentsPage() {
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
  console.log("students", students)
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
    if (parsedBranchId) {
      setCollegeBranchId(parsedBranchId);
    }
  }, [parsedBranchId]);

  useEffect(() => {
    console.log("🔄 useEffect Triggered");

    console.log("📦 Current Dependency Values:", {
      collegeId,
      collegeEducationIdFromUrl,
      collegeBranchIdFromUrl,
      selectedYear,
    });

    const loadData = async () => {
      console.log("🚀 loadData() called");

      // 🔍 Check required filters
      if (!collegeId) console.log("❌ Missing collegeId");
      if (!collegeEducationIdFromUrl)
        console.log("❌ Missing collegeEducationIdFromUrl");
      if (!collegeBranchIdFromUrl)
        console.log("❌ Missing collegeBranchIdFromUrl");

      if (
        !collegeId ||
        !collegeEducationIdFromUrl ||
        !collegeBranchIdFromUrl
      ) {
        console.log("⏳ Waiting for required filters...");
        return;
      }

      try {
        console.log("📌 Fetching Dashboard Data with:", {
          collegeId,
          collegeEducationId: collegeEducationIdFromUrl,
          collegeBranchId: collegeBranchIdFromUrl,
          selectedYear,
        });

        const startTime = performance.now();

        const data = await getFinanceDashboardData({
          collegeId,
          collegeEducationId: collegeEducationIdFromUrl,
          collegeBranchId: collegeBranchIdFromUrl,
          selectedYear
        });

        const endTime = performance.now();

        console.log("✅ Dashboard Response Received");
        console.log(
          "⏱️ API Time:",
          `${(endTime - startTime).toFixed(2)} ms`
        );

        console.log("📊 Response Summary:", {
          totalStudents: data?.summary?.totalStudents,
          expected: data?.summary?.expected,
          collected: data?.summary?.collected,
          pending: data?.summary?.pending,
          paidStudents: data?.summary?.paidStudents,
          pendingStudents: data?.summary?.pendingStudents,
        });

        console.log("⚡ Quick Insights:", data?.quickInsights);

        console.log(
          "📋 Table Data Length:",
          data?.tableData?.length || 0
        );

        setStudents(data?.tableData || []);

        console.log("✅ Students State Updated");
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
        <h1 className="text-xl font-semibold text-[#282828]">
          Fee Payments — {formattedRange} ({getDateRange(range)})
        </h1>
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
        />
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