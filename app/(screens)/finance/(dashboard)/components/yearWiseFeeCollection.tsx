"use client";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import TableComponent from "@/app/utils/table/table";
import { getYearWiseDetails } from "@/lib/helpers/finance/analytics/FetchFinanceAnalytics";
import {
  CaretLeftIcon,
  FunnelSimple,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ITEMS_PER_PAGE = 10;

const HorizontalChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md py-4 px-2 h-90 animate-pulse flex flex-col justify-around">
    {[60, 85, 45, 90].map((w, i) => (
      <div
        key={i}
        className="h-8 bg-gray-200 rounded-r-md mx-6"
        style={{ width: `${w}%` }}
      ></div>
    ))}
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
      <div className={`max-h-[${height || "60vh"}] overflow-auto`}>
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
// ---------------------------------------------

const RightAlignedLabel = (props: any) => {
  const { y, height, value, viewBox } = props;

  return (
    <text
      x={viewBox.x + viewBox.width + 20}
      y={y + height / 2}
      textAnchor="end"
      dominantBaseline="middle"
      fill="#333"
      fontSize={13}
      fontWeight={500}
    >
      {value}
    </text>
  );
};

function YearWiseFeeCollectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchCode = searchParams.get("branchCode") || "Department";
  const breadcrumb = `${branchCode} → Year-wise Fee Collection`;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [semester, setSemester] = useState("All Semesters");
  const [academicYear, setAcademicYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isLoading, setIsLoading] = useState(true);
  const [leftChart, setLeftChart] = useState<any[]>([]);
  const [rightChart, setRightChart] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any[]>([]);

  const [availableYears, setAvailableYears] = useState<string[]>([
    new Date().getFullYear().toString(),
  ]);

  const {
    collegeId,
    collegeEducationId,
    loading: fmLoading,
  } = useFinanceManager();

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
      setIsSearching(false);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    async function fetchYearData() {
      if (fmLoading || !collegeId || !collegeEducationId || !branchCode) return;

      setIsLoading(true);
      const result = await getYearWiseDetails(
        collegeId,
        collegeEducationId,
        branchCode,
        academicYear,
      );

      if (result) {
        setLeftChart(result.leftChart);
        setRightChart(result.rightChart);
        setInitialData(result.tableData);
        setAvailableYears(result.availableYears!);
      }
      setIsLoading(false);
    }

    fetchYearData();
  }, [academicYear, collegeId, collegeEducationId, branchCode, fmLoading]);

  const formatAmount = (value: number | string | undefined) => {
    if (typeof value !== "number") return "";
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const columns = [
    { title: "Student Name", key: "studentName" },
    { title: "Student ID", key: "rollNo" },
    { title: "Department", key: "department" },
    { title: "Year", key: "year" },
    { title: "Semester", key: "semester" },
    { title: "Paid Amount", key: "paidAmount" },
    { title: "Pending Amount", key: "pendingAmount" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
  ];

  const availableSemesters = useMemo(() => {
    const uniqueSems = new Set(initialData.map((item) => item.semester));
    return Array.from(uniqueSems)
      .filter((sem) => sem && sem !== "N/A")
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.replace(/\D/g, "")) || 0;
        return numA - numB;
      });
  }, [initialData]);

  const processedData = useMemo(() => {
    let data = initialData.filter(
      (item) =>
        item.studentName
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        item.rollNo.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );

    if (semester !== "All Semesters") {
      data = data.filter((item) => item.semester === semester);
    }

    data.sort((a, b) => {
      const totalA = a.paidAmount + a.pendingAmount;
      const totalB = b.paidAmount + b.pendingAmount;

      return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
    });

    return data.map((item) => {
      let status: "paid" | "pending" | "partial" = "paid";

      if (item.pendingAmount > 0 && item.paidAmount > 0) status = "partial";
      else if (item.pendingAmount > 0 && item.paidAmount === 0)
        status = "pending";

      return {
        ...item,
        paidAmount: `₹ ${item.paidAmount.toLocaleString("en-IN")}`,
        pendingAmount: `₹ ${item.pendingAmount.toLocaleString("en-IN")}`,
        status: (
          <div className="flex items-center gap-2 justify-center">
            <span
              className={`h-3 w-3 rounded-full ${
                status === "paid"
                  ? "bg-green-600"
                  : status === "pending"
                    ? "bg-red-600"
                    : "bg-yellow-500"
              }`}
            />
            <span
              className={
                status === "paid"
                  ? "text-green-600"
                  : status === "pending"
                    ? "text-red-600"
                    : "text-yellow-600"
              }
            >
              {status === "paid"
                ? "Paid"
                : status === "pending"
                  ? "Pending"
                  : "Partial"}
            </span>
          </div>
        ),
        action: (
          <span
            onClick={() => router.push(`/finance/${item.rollNo}`)}
            className="text-[#22A55D] cursor-pointer hover:underline"
          >
            View Details
          </span>
        ),
      };
    });
  }, [debouncedSearch, sortOrder, initialData, semester, router]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, currentPage]);

  const isPageLoading = fmLoading || isLoading;

  return (
    <div className="p-2 space-y-6 overflow-x-hidden">
      <h2 className="text-lg font-semibold flex items-center gap-1 text-[#43C17A] mb-2">
        <CaretLeftIcon
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        {breadcrumb}
      </h2>

      {/* HEADER INFO PRESERVED DURING LOADING */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg -mb-2 text-[#282828]">
          Fee Collection Trends
        </h3>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-[#282828]">Academic Year</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full outline-none cursor-pointer"
            >
              {availableYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2 text-[#5A5A5A]">
              <span className="w-3 h-3 bg-[#43C17A] rounded-xs" />
              Collected
            </div>
            <div className="flex items-center gap-2 text-[#5A5A5A]">
              <span className="w-3 h-3 bg-[#B9E6CD] rounded-xs" />
              Pending
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isPageLoading ? (
          <>
            <HorizontalChartSkeleton />
            <HorizontalChartSkeleton />
          </>
        ) : (
          [
            { data: leftChart, colors: ["#43C17A", "#B9E6CD"] },
            { data: rightChart, colors: ["#6C5DD3", "#C7BFFF"] },
          ].map((chart, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md py-4 -px-2">
              <div className="h-90">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chart.data}
                    layout="vertical"
                    barCategoryGap="20%"
                    margin={{ right: 40, left: 15, bottom: 15 }}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={formatAmount}
                      axisLine={false}
                      tickLine={false}
                      tick={{ dx: 10 }}
                      tickMargin={0}
                    />
                    <YAxis
                      dataKey="year"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number"
                          ? `₹ ${value.toLocaleString()}`
                          : value
                      }
                      cursor={{ fill: "#f8fafc" }}
                      labelStyle={{
                        color: "#000",
                        opacity: 1,
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="collected"
                      stackId="a"
                      fill={chart.colors[0]}
                    />
                    <Bar dataKey="pending" stackId="a" fill={chart.colors[1]}>
                      <LabelList
                        dataKey="label"
                        content={<RightAlignedLabel />}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OVERVIEW & TABLE SECTION */}
      <div className="space-y-4 pb-10 pt-4">
        <h3 className="font-semibold text-lg text-[#282828]">
          Students Overview
        </h3>

        <div className="flex justify-between items-center">
          <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[40%]">
            <input
              placeholder="Search by Student Name / Student ID"
              className="bg-transparent outline-none text-sm w-full text-[#282828]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MagnifyingGlass size={20} className="text-[#22A55D]" />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#43C17A1F] text-[#00A94A] cursor-pointer px-3 py-1 rounded-md outline-none"
            >
              <option value="All Semesters">All Semesters</option>

              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem.replace("Sem", "Semester")}
                </option>
              ))}
            </select>

            <div
              onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                setCurrentPage(1);
              }}
              className="bg-[#43C17A1F] cursor-pointer rounded-full p-2"
            >
              <FunnelSimple size={18} className="text-[#00A94A]" />
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {isSearching && !isPageLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
              <Loader />
            </div>
          ) : null}

          {isPageLoading ? (
            <TableSkeleton columns={columns} height="60vh" />
          ) : (
            <TableComponent
              columns={columns}
              tableData={paginatedData}
              height="60vh"
            />
          )}
        </div>

        {totalPages > 1 && !isSearching && !isPageLoading && (
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border cursor-pointer bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <CaretLeft size={18} weight="bold" color="black" />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 cursor-pointer h-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-[#16284F] text-white"
                      : "bg-white text-gray-600 border hover:border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <CaretRight size={18} weight="bold" color="black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function YearWiseFeeCollection() {
  return (
    <Suspense
      fallback={
        <div className="p-10">
          <Loader />
        </div>
      }
    >
      <YearWiseFeeCollectionContent />
    </Suspense>
  );
}
