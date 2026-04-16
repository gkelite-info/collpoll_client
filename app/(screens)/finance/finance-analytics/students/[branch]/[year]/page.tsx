"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  DownloadSimple,
  MagnifyingGlass,
  CurrencyInr,
  CaretLeftIcon,
  BuildingApartmentIcon,
  CurrencyDollarSimpleIcon,
  CaretDown,
  CaretRight,
  CaretLeft,
} from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { downloadCSV } from "@/app/utils/downloadCSV";
import { getYearWiseFinanceSummary } from "@/lib/helpers/finance/dashboard/getYearWiseFinanceSummary";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { supabase } from "@/lib/supabaseClient";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import toast from "react-hot-toast";

// ─── Shimmer styles ────────────────────────────────────────────────────────────
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }
`;

const ShimmerStyle = () => <style>{shimmerStyle}</style>;

// ─── Shimmer: Card ─────────────────────────────────────────────────────────────
const CardShimmer = () => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
    <div className="shimmer w-8 h-8 rounded-full" />
    <div className="shimmer h-6 w-20" />
    <div className="shimmer h-3 w-24" />
  </div>
);

// ─── Shimmer: Table rows ───────────────────────────────────────────────────────
const TableShimmer = ({
  rows = 8,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div className="w-full overflow-hidden rounded-lg border border-gray-100">
    <div className="flex gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="shimmer h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
        style={{ opacity: 1 - r * 0.08 }}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="shimmer h-3 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
// ──────────────────────────────────────────────────────────────────────────────

export default function YearFinanceBreakdown() {
  const router = useRouter();
  const params = useParams();

  const {
    collegeId,
    collegeEducationId,
    loading: financeLoading,
  } = useFinanceManager();

  const branch = (params?.year as string)?.toUpperCase();
  const yearParam = (params?.year as string)?.replace(/-/g, " ");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [educationFilter, setEducationFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearData, setYearData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // cardsLoading is true only for the very first fetch, never again
  const [cardsLoading, setCardsLoading] = useState(true);
  const isFirstLoad = useRef(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const formatCurrency = (amount: number) =>
    `₹ ${amount.toLocaleString("en-IN")}`;

  // ── Debounce search input 400ms ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================================
     Cards (Use summary NOT table)
  ================================= */

  const cardsData = [
    {
      style: "bg-[#E2DAFF]",
      icon: (
        <CurrencyDollarSimpleIcon size={24} color="#6C20CA" weight="fill" />
      ),
      value: formatCurrency(summary?.totalExpected || 0),
      label: "Total Fee Expected",
    },
    {
      style: "bg-[#E6FBEA]",
      icon: (
        <CurrencyDollarSimpleIcon size={24} color="#43C17A" weight="fill" />
      ),
      value: formatCurrency(summary?.totalCollected || 0),
      label: "Total Collected",
    },
    {
      style: "bg-[#FFE2E2]",
      icon: (
        <CurrencyDollarSimpleIcon size={24} color="#FF0000" weight="fill" />
      ),
      value: formatCurrency(summary?.totalPending || 0),
      label: "Total Pending",
    },
    {
      style: "bg-[#CEE6FF]",
      icon: <BuildingApartmentIcon size={24} color="#60AEFF" weight="fill" />,
      value: `${summary?.overallPercentage || 0}%`,
      label: "Collection Rate",
    },
  ];

  useEffect(() => {
    async function loadYearFinance() {
      if (!collegeId || !collegeEducationId || !branch) return;

      setLoading(true);
      // Cards shimmer only on the very first load
      if (isFirstLoad.current) {
        setCardsLoading(true);
      }

      try {
        const response = await getYearWiseFinanceSummary(
          {
            collegeId,
            collegeEducationId,
            branchCode: branch,
          },
          currentPage,
          rowsPerPage,
          debouncedSearch,
        );

        setYearData(response.data);
        setTotalRecords(response.totalCount);
        setSummary(response.summary);
      } catch (err) {
        toast.error("Failed to load year finance data");
      } finally {
        setLoading(false);
        if (isFirstLoad.current) {
          setCardsLoading(false);
          isFirstLoad.current = false;
        }
      }
    }

    loadYearFinance();
  }, [collegeId, collegeEducationId, branch, currentPage, debouncedSearch]);

  const tableData = useMemo(() => {
    return yearData.map((item) => ({
      year: item.year,
      expected: formatCurrency(item.expected),
      collected: formatCurrency(item.collected),
      pending: formatCurrency(item.pending),
      percent: `${item.collectionPercentage}%`,
      // action: (
      //   <span
      //     className="text-[#22A55D] cursor-pointer hover:underline text-sm font-medium"
      //     onClick={() =>
      //       router.push(
      //         `/finance/finance-analytics/students/${branch}/${item.yearId}`
      //       )
      //     }
      //   >
      //     View
      //   </span>
      // ),
    }));
  }, [yearData]);

  const handleDownload = () => {
    if (!yearData.length) {
      toast.error("No data available");
      return;
    }

    setDownloadLoading(true);

    const exportData = yearData.map((item) => ({
      Year: item.year,
      Expected: item.expected,
      Collected: item.collected,
      Pending: item.pending,
      "Collection %": `${item.collectionPercentage}%`,
    }));

    setTimeout(() => {
      downloadCSV(exportData, `${branch}-year-summary`);
      setDownloadLoading(false);
    }, 300);
  };

  const columns = [
    { title: "Year", key: "year" },
    { title: "Expected", key: "expected" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "Collection %", key: "percent" },
    // { title: "Action", key: "action" },
  ];

  return (
    <div className="p-2 min-h-screen space-y-6">
      {/* Inject shimmer keyframes once */}
      <ShimmerStyle />

      <div className="flex justify-between items-center">
        <div className="flex items-center text-black gap-2">
          <CaretLeftIcon
            size={24}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h2 className="text-2xl font-semibold text-[#282828]">
            Total Finance
          </h2>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloadLoading}
          className={`bg-[#16284F] text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all cursor-pointer
          ${
            downloadLoading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-[#1E3A8A]"
          }`}
        >
          {downloadLoading ? "Downloading..." : "Download Report"}
          {!downloadLoading && <DownloadSimple size={18} />}
        </button>
      </div>

      {/* ── Cards: shimmer only on initial load, real cards always after ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cardsLoading
          ? [0, 1, 2, 3].map((i) => <CardShimmer key={i} />)
          : cardsData.map((card, index) => (
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
        <div className="flex items-center bg-[#EAEAEA] rounded-full px-4 py-2 w-[250px] lg:w-[300px] flex-shrink-0">
          <input
            placeholder="Search by Year"
            className="bg-transparent outline-none text-sm w-full text-[#282828] placeholder:text-[#9CA3AF]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <MagnifyingGlass size={24} className="text-[#22A55D]" />
        </div>
      </div>

      <h1 className="text-[#282828] text-lg font-semibold -mt-3 mb-3">
        Year Breakdown Table
      </h1>

      {/* ── Table: shimmer on every load, real table after ── */}
      {loading ? (
        <TableShimmer rows={8} cols={5} />
      ) : (
        <TableComponent columns={columns} tableData={tableData} height="55vh" />
      )}

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-8 mb-4">
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
            <CaretLeft size={18} weight="bold" />
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
  );
}
