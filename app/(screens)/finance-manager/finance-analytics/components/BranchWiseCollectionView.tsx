"use client";

import TableComponent from "@/app/utils/table/table";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getBranchWiseCollectionDynamic } from "@/lib/helpers/finance/analytics/FetchFinanceAnalytics";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgCharts } from "ag-charts-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type AgCartesianChartOptions,
} from "ag-charts-community";
import { useEffect, useMemo, useState } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const branchOverviewColumns = [
  { title: "Branch", key: "branch" },
  { title: "Collected", key: "collected" },
  { title: "Pending", key: "pending" },
  { title: "Total Fees", key: "totalFees" },
  { title: "Action", key: "actions" },
];

type FilterOption = {
  id: number;
  label: string;
};

type BranchCard = {
  branch: string;
  totalFeesShort: string;
  collectedShort: string;
  pendingShort: string;
};

type BranchTableRow = {
  branch: string;
  collected: string;
  pending: string;
  totalFees: string;
};

function BranchCollectionChart({
  data,
}: {
  data: { branch: string; collected: number; pending: number }[];
}) {
  const maxValue = useMemo(
    () =>
      Math.max(
        1,
        ...data.map((item) => Number(item.collected) + Number(item.pending)),
      ),
    [data],
  );

  const options = useMemo<AgCartesianChartOptions>(
    () => ({
      data,
      background: { fill: "transparent" },
      padding: { top: 12, right: 16, bottom: 0, left: 0 },
      series: [
        {
          type: "bar",
          xKey: "branch",
          yKey: "collected",
          stacked: true,
          fill: "#43C17A",
          strokeWidth: 0,
          width: 44,
        },
        {
          type: "bar",
          xKey: "branch",
          yKey: "pending",
          stacked: true,
          fill: "#CFF3DD",
          strokeWidth: 0,
          cornerRadius: 6,
          width: 44,
        },
      ],
      axes: {
        bottom: {
          type: "category",
          label: { color: "#282828", fontSize: 12 },
          line: { enabled: false },
        },
        left: {
          type: "number",
          min: 0,
          max: maxValue,
          nice: true,
          label: {
            color: "#525252",
            fontSize: 12,
            formatter: ({ value }) => {
              const numericValue = Number(value) || 0;
              if (numericValue >= 10000000) return `${(numericValue / 10000000).toFixed(1)}Cr`;
              if (numericValue >= 100000) return `${(numericValue / 100000).toFixed(1)}L`;
              if (numericValue >= 1000) return `${(numericValue / 1000).toFixed(0)}K`;
              return `${numericValue}`;
            },
          },
          gridLine: { stroke: "#E4E4E4" },
          line: { enabled: false },
        },
      },
      legend: { enabled: false },
    }),
    [data, maxValue],
  );

  return <AgCharts options={options} style={{ height: "100%", width: "100%" }} />;
}

export default function BranchWiseCollectionView({
  program,
  backHref = "/finance-manager/finance-analytics",
  yearWiseView = "year-wise",
}: {
  program: string;
  backHref?: string;
  yearWiseView?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const title = program || "B-Tech";
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<
    { branch: string; collected: number; pending: number }[]
  >([]);
  const [gridData, setGridData] = useState<BranchCard[]>([]);
  const [rawTableData, setRawTableData] = useState<BranchTableRow[]>([]);
  const [academicYears, setAcademicYears] = useState<FilterOption[]>([]);
  const [semesters, setSemesters] = useState<FilterOption[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(
    Number(searchParams.get("academicYearId")) || null,
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(
    Number(searchParams.get("semesterId")) || null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadBranchWise() {
      if (contextLoading || !collegeId || !collegeEducationId) return;

      setIsLoading(true);
      try {
        const result = await getBranchWiseCollectionDynamic(
          collegeId,
          collegeEducationId,
          selectedAcademicYearId,
          selectedSemesterId,
        );
        if (!isMounted) return;
        setChartData(result.chartData);
        setGridData(result.gridData);
        setRawTableData(result.tableData);
        setAcademicYears(result.academicYears);
        setSemesters(result.semesters);
      } catch (error) {
        console.error("Branch wise analytics error:", error);
        if (!isMounted) return;
        setChartData([]);
        setGridData([]);
        setRawTableData([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBranchWise();

    return () => {
      isMounted = false;
    };
  }, [
    collegeId,
    collegeEducationId,
    contextLoading,
    selectedAcademicYearId,
    selectedSemesterId,
  ]);

  const updateFilterParams = (academicYearId: number | null, semesterId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (academicYearId) params.set("academicYearId", String(academicYearId));
    else params.delete("academicYearId");
    if (semesterId) params.set("semesterId", String(semesterId));
    else params.delete("semesterId");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const branchOverviewRows = rawTableData.map((item) => ({
    branch: item.branch,
    collected: item.collected,
    pending: item.pending,
    totalFees: item.totalFees,
    actions: (
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#22A55D] underline decoration-2 underline-offset-4"
        onClick={() =>
          router.push(
            `?view=${yearWiseView}&program=${encodeURIComponent(title)}&branch=${encodeURIComponent(item.branch)}${selectedAcademicYearId ? `&academicYearId=${selectedAcademicYearId}` : ""}${selectedSemesterId ? `&semesterId=${selectedSemesterId}` : ""}`,
          )
        }
      >
        View Years
      </button>
    ),
  }));
  const isPageLoading = contextLoading || isLoading;
  const displayedBranchCards: Array<BranchCard | null> = isPageLoading
    ? Array.from({ length: 6 }, () => null)
    : gridData;

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to Finance Analytics"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push(backHref)}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">{title}</h1>
        <CaretRight size={18} className="text-[#8A8A8A]" />
        <span className="text-sm text-[#525252]">Branch Wise Collection</span>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-md font-semibold text-[#282828]">
            Fee Collection Trends
          </h2>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#525252]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#282828]">Academic Year</span>
              <select
                value={selectedAcademicYearId ?? ""}
                onChange={(event) => {
                  const nextYearId = event.target.value ? Number(event.target.value) : null;
                  setSelectedAcademicYearId(nextYearId);
                  setSelectedSemesterId(null);
                  updateFilterParams(nextYearId, null);
                }}
                className="rounded-full bg-[#E9D8FF] px-3 py-1 font-semibold text-[#714EF2] outline-none"
              >
                <option value="">All</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#282828]">Semester</span>
              <select
                value={selectedSemesterId ?? ""}
                onChange={(event) => {
                  const nextSemesterId = event.target.value
                    ? Number(event.target.value)
                    : null;
                  setSelectedSemesterId(nextSemesterId);
                  updateFilterParams(selectedAcademicYearId, nextSemesterId);
                }}
                className="rounded-full bg-[#D9F4E4] px-3 py-1 font-semibold text-[#43C17A] outline-none"
              >
                <option value="">All</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
              <span>Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto overflow-y-hidden pb-2">
          <div className="h-56 min-w-[115%]">
            {isPageLoading ? (
              <div className="h-full animate-pulse rounded-md bg-[#F2F2F2]" />
            ) : (
              <BranchCollectionChart data={chartData} />
            )}
          </div>
        </div>

        <div className="custom-scrollbar mt-4 overflow-x-auto pb-2">
          <div className="grid min-w-[115%] grid-cols-6 gap-3">
            {displayedBranchCards.map((card, index) => (
              <article
                key={card?.branch ?? index}
                className="rounded-md bg-[#F2F2F2] p-3 shadow-sm"
              >
                {!card ? (
                  <div className="space-y-3">
                    <div className="h-4 w-12 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-8 animate-pulse rounded bg-[#D8D8D8]" />
                    <div className="h-3 animate-pulse rounded bg-[#D8D8D8]" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-[#43C17A]">
                      {card.branch}
                    </h3>
                    <p className="mt-2 rounded bg-[#16284F] px-2 py-1 text-sm font-semibold text-white">
                      {card.totalFeesShort}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#16284F]">
                        {card.collectedShort}
                      </span>
                      <span className="text-[#43C17A]">Collected</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#16284F]">
                        {card.pendingShort}
                      </span>
                      <span className="text-[#43C17A]">Pending</span>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Branch Overview
        </h2>
        <div className="custom-scrollbar overflow-x-auto">
          <div className="min-w-[900px]">
            <TableComponent
              columns={branchOverviewColumns}
              tableData={branchOverviewRows}
              height="auto"
              isLoading={isPageLoading}
              stickyHeader={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
