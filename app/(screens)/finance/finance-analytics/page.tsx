"use client";

import { useState, Suspense, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import TableComponent from "@/app/utils/table/table";
import { useRouter, useSearchParams } from "next/navigation";
import YearWiseFeeCollection from "../(dashboard)/components/yearWiseFeeCollection";
import { Loader } from "../../(student)/calendar/right/timetable";
import { getBranchWiseCollection } from "@/lib/helpers/finance/analytics/FetchFinanceAnalytics";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";

const VerticalChartSkeleton = () => (
  <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse flex items-end justify-around px-8 pb-8 pt-10 border border-gray-100">
    {[40, 70, 45, 90, 60, 85].map((h, i) => (
      <div
        key={i}
        className="w-12 bg-gray-200 rounded-t-lg"
        style={{ height: `${h}%` }}
      ></div>
    ))}
  </div>
);

const BranchCardSkeleton = () => (
  <div className="bg-[#EAEAEA]/50 rounded-lg p-3 space-y-3 animate-pulse">
    <div className="h-4 w-12 bg-gray-300 rounded"></div>
    <div className="h-8 w-full bg-gray-300 rounded-md"></div>
    <div className="space-y-2 pt-1">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
        <div className="h-3 w-12 bg-gray-300 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-12 bg-gray-300 rounded"></div>
        <div className="h-3 w-14 bg-gray-300 rounded"></div>
      </div>
    </div>
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

const CustomBar = (props: any) => {
  const { x, y, width, height, payload, dataKey } = props;

  const shouldRoundTop =
    (dataKey === "pending" && payload.pending > 0) ||
    (dataKey === "collected" && payload.pending === 0);

  const radius = 8;

  if (width === 0 || height === 0) return null;

  const path = shouldRoundTop
    ? `
      M ${x}, ${y + height}
      L ${x}, ${y + radius}
      Q ${x}, ${y} ${x + radius}, ${y}
      L ${x + width - radius}, ${y}
      Q ${x + width}, ${y} ${x + width}, ${y + radius}
      L ${x + width}, ${y + height}
      Z
    `
    : `
      M ${x}, ${y}
      L ${x + width}, ${y}
      L ${x + width}, ${y + height}
      L ${x}, ${y + height}
      Z
    `;

  return <path d={path} fill={props.fill} />;
};

function FinanceAnalyticsContent() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([
    new Date().getFullYear().toString(),
  ]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);
  const [rawTableData, setRawTableData] = useState<any[]>([]);

  const {
    collegeId,
    collegeEducationId,
    collegeEducationType,
    loading: fmLoading,
  } = useFinanceManager();

  useEffect(() => {
    async function fetchData() {
      if (fmLoading || !collegeId || !collegeEducationId) return;

      setIsLoading(true);
      const result = await getBranchWiseCollection(
        collegeId,
        collegeEducationId,
        year,
      );

      if (result) {
        setChartData(result.chartData);
        setGridData(result.gridData);
        setRawTableData(result.tableData);
        setAvailableYears(result.availableYears!);
      }
      setIsLoading(false);
    }

    fetchData();
  }, [year, collegeId, collegeEducationId, fmLoading]);

  if (view === "yearWiseCollection") {
    return <YearWiseFeeCollection />;
  }

  const tableColumns = [
    { title: "Branch", key: "branch" },
    { title: "Collected", key: "collected" },
    { title: "Pending", key: "pending" },
    { title: "Total Fees", key: "totalFees" },
    { title: "Action", key: "action" },
  ];

  const tableData = rawTableData.map((row) => ({
    ...row,
    action: (
      <span
        className="text-[#22A55D] cursor-pointer hover:underline"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("view", "yearWiseCollection");

          params.set("branchCode", row.branch);

          router.push(`?${params.toString()}`);
        }}
      >
        View Years
      </span>
    ),
  }));

  const formatYAxis = (value: number) => {
    if (value === 0) return "0";
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    return `${(value / 1000).toFixed(0)}K`;
  };

  const isPageLoading = fmLoading || isLoading;

  return (
    <div className="p-4 w-full space-y-6">
      <h2 className="text-lg font-semibold text-[#43C17A]">
        {collegeEducationType || "Education"}{" "}
        <span className="text-gray-400">→</span> Branch Wise Collection
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* HEADER AREA - ALWAYS VISIBLE TO PREVENT LAYOUT SHIFT */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#282828] text-lg">
            Fee Collection Trends
          </h3>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#282828] font-bold text-md">
              Academic Year
            </span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isPageLoading}
              className={`bg-[#EDE7F6] text-[#6C20CA] font-medium px-1.5 py-0.5 rounded-full outline-none ${
                isPageLoading
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer"
              }`}
            >
              {availableYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-4 ml-4 text-sm">
              <div className="flex items-center gap-2 text-[#282828]">
                <span className="w-3 h-3 bg-[#43C17A] rounded-xs" />
                Collected
              </div>
              <div className="flex items-center gap-2 text-[#282828]">
                <span className="w-3 h-3 bg-[#B9E6CD] rounded-xs" />
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="w-full h-[300px] focus:outline-none">
          {isPageLoading ? (
            <VerticalChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barCategoryGap="25%"
                margin={{ left: -1, bottom: 0 }}
              >
                <CartesianGrid stroke="#CBCBCB" vertical={false} />
                <XAxis dataKey="branch" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ dy: -4 }}
                  tickMargin={10}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  labelStyle={{ color: "#000000", fontWeight: 600 }}
                />
                <Bar
                  dataKey="collected"
                  stackId="a"
                  fill="#43C17A"
                  shape={<CustomBar />}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#C7F2DA"
                  activeBar={false}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* CARDS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isPageLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <BranchCardSkeleton key={idx} />
              ))
            : gridData.map((branchInfo) => (
                <div
                  key={branchInfo.branch}
                  className="bg-[#EAEAEA] rounded-lg p-3 space-y-2"
                >
                  <p className="text-[#43C17A] font-semibold text-sm">
                    {branchInfo.branch}
                  </p>

                  <div className="bg-[#16284F] text-white font-semibold text-xs px-3 w-full border py-2 rounded-md">
                    {branchInfo.totalFeesShort}
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#16284F] font-semibold text-xs">
                        {branchInfo.collectedShort}
                      </span>
                      <span className="text-[#22A55D]">Collected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#16284F] font-semibold">
                        {branchInfo.pendingShort}
                      </span>
                      <span className="text-[#FF0000]">Pending</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[#282828]">Branch Overview</h3>
        {isPageLoading ? (
          <TableSkeleton columns={tableColumns} height="60vh" />
        ) : (
          <TableComponent columns={tableColumns} tableData={tableData} />
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center py-20"></div>}
    >
      <FinanceAnalyticsContent />
    </Suspense>
  );
}
