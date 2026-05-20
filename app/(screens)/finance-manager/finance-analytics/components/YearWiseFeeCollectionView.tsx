"use client";

import TableComponent from "@/app/utils/table/table";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import { getYearWiseDetailsDynamic } from "@/lib/helpers/finance/analytics/FetchFinanceAnalytics";
import {
  CaretLeft,
  CaretRight,
  X,
  FunnelSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const rupee = "\u20B9";

const ITEMS_PER_PAGE = 10;

const columns = [
  { title: "Student Name", key: "studentName" },
  { title: "Roll No.", key: "rollNo" },
  { title: "Branch", key: "branch" },
  { title: "Year", key: "year" },
  { title: "Semester", key: "semester" },
  { title: "Paid Amount", key: "paidAmount" },
  { title: "Pending Amount", key: "pendingAmount" },
  { title: "Status", key: "status" },
];

type ChartRow = {
  year: string;
  label: string;
  collected: number;
  pending: number;
};

type StudentFeeRow = {
  studentId?: number;
  studentName: string;
  rollNo: string;
  branch: string;
  year: string;
  semester: string;
  paidAmount: number;
  pendingAmount: number;
  feeAssigned?: boolean;
};

function YearTrendCardShimmer() {
  return (
    <div className="h-56 rounded-lg bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3"
          >
            <div className="h-4 w-12 rounded bg-[#E2E2E2]" />
            <div
              className="h-8 rounded-r-sm bg-[#E2E2E2]"
              style={{ width: `${index === 0 ? 34 : index === 1 ? 22 : 44}%` }}
            />
            <div className="h-4 w-8 rounded bg-[#E2E2E2]" />
          </div>
        ))}
        <div className="grid grid-cols-5 pl-16 pr-11">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-3 w-10 rounded bg-[#E2E2E2]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalTrendCard({
  data,
  color,
  lightColor,
  title,
}: {
  data: { year: string; label: string; collected: number; pending: number }[];
  color: string;
  lightColor: string;
  title: string;
}) {
  const [selectedBar, setSelectedBar] = useState<{
    item: ChartRow;
    index: number;
    mode: "click" | "hover";
    x: number;
    y: number;
  } | null>(null);
  const maxDataValue = Math.max(
    1,
    ...data.map((item) => Number(item.collected) + Number(item.pending)),
  );
  const axisMaxValue = Math.max(10000000, maxDataValue);
  const chartWidth = 860;
  const formatAxisAmount = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value > 0) return `${(value / 100000).toFixed(1)}L`;
    return `${Math.round(value)}`;
  };
  const formatCurrency = (value: number) =>
    `${rupee} ${Math.round(value).toLocaleString("en-IN")}`;
  const axisTicks = [0.2, 0.4, 0.6, 0.8, 1].map((ratio) =>
    Math.round(axisMaxValue * ratio),
  );

  return (
    <section className="relative rounded-lg bg-white p-5 shadow-sm">
      {selectedBar && (
        <div
          className={`absolute z-20 w-40 rounded-md border border-[#E4E4E4] bg-white p-2.5 text-left shadow-lg ${
            selectedBar.mode === "hover" ? "pointer-events-none" : ""
          }`}
          style={{
            left: Math.min(selectedBar.x, 280),
            top: Math.max(8, selectedBar.y - 104),
          }}
        >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#282828]">{title}</p>
                <p className="text-xs text-[#525252]">
                  {selectedBar.item.year} {selectedBar.item.label}
                </p>
              </div>
              {selectedBar.mode === "click" && (
                <button
                  type="button"
                  aria-label="Close fee details"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#525252] hover:bg-[#F4F4F4]"
                  onClick={() => setSelectedBar(null)}
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-[11px] text-[#282828]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                  collected
                </span>
                <span className="font-semibold">
                  {formatCurrency(selectedBar.item.collected)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: lightColor }}
                  />
                  pending
                </span>
                <span className="font-semibold">
                  {formatCurrency(selectedBar.item.pending)}
                </span>
              </div>
            </div>
        </div>
      )}

      <div className="custom-scrollbar overflow-x-auto pb-2">
        <div className="space-y-5" style={{ minWidth: chartWidth }}>
          {data.map((item, index) => {
            const collectedPercent = Math.min(
              (item.collected / axisMaxValue) * 100,
              100,
            );
            const pendingPercent = Math.min(
              (item.pending / axisMaxValue) * 100,
              100,
            );
            const collectedVisual =
              item.collected > 0 ? Math.max(collectedPercent, 5) : 0;
            const pendingVisual =
              item.pending > 0 ? Math.max(pendingPercent, 5) : 0;
            const totalVisual = Math.min(
              Math.max(collectedVisual + pendingVisual, 0),
              100,
            );
            const collectedShare =
              totalVisual > 0 ? (collectedVisual / totalVisual) * 100 : 0;

            return (
              <button
                type="button"
                key={`${item.year}-${item.label}`}
                className="grid w-full cursor-pointer grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-left"
                onClick={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setSelectedBar({
                    item,
                    index,
                    mode: "click",
                    x: sectionRect ? targetRect.left - sectionRect.left + 86 : 86,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                }}
                onFocus={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setSelectedBar({
                    item,
                    index,
                    mode: "hover",
                    x: sectionRect ? targetRect.left - sectionRect.left + 86 : 86,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                }}
                onMouseEnter={(event) => {
                  const section = event.currentTarget.closest("section");
                  const sectionRect = section?.getBoundingClientRect();
                  const targetRect = event.currentTarget.getBoundingClientRect();
                  setSelectedBar({
                    item,
                    index,
                    mode: "hover",
                    x: sectionRect ? targetRect.left - sectionRect.left + 86 : 86,
                    y: sectionRect ? targetRect.top - sectionRect.top + 12 : 12,
                  });
                }}
                onMouseLeave={() =>
                  setSelectedBar((current) =>
                    current?.mode === "hover" ? null : current,
                  )
                }
              >
                <span className="text-sm text-[#282828]">{item.year}</span>
                <div className="relative h-8">
                  <div
                    className="absolute inset-y-0 left-0 flex overflow-hidden rounded-r-sm"
                    style={{ width: `${totalVisual}%` }}
                  >
                    {item.collected > 0 && (
                      <span
                        className="h-full"
                        style={{
                          width: `${collectedShare}%`,
                          backgroundColor: color,
                        }}
                      />
                    )}
                    {item.pending > 0 && (
                      <span
                        className="h-full flex-1"
                        style={{ backgroundColor: lightColor }}
                      />
                    )}
                    </div>
                </div>
                <span className="text-sm text-[#282828]">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div
          className="mt-5 grid grid-cols-5 pl-16 pr-11 text-xs font-semibold text-[#525252]"
          style={{ minWidth: chartWidth }}
        >
          {axisTicks.map((tick) => (
            <span key={tick}>{formatAxisAmount(tick)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function YearWiseFeeCollectionView({
  branch,
  backHref = "?view=branch-wise",
}: {
  branch: string;
  backHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId, collegeEducationId, loading: contextLoading } =
    useFinanceManager();
  const branchTitle = branch || "CSE";
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [leftChart, setLeftChart] = useState<ChartRow[]>([]);
  const [rightChart, setRightChart] = useState<ChartRow[]>([]);
  const [studentData, setStudentData] = useState<StudentFeeRow[]>([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; label: string }[]
  >([]);
  const [semesters, setSemesters] = useState<{ id: number; label: string }[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(
    Number(searchParams.get("academicYearId")) || null,
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const skippedTableLoadKeyRef = useRef<string | null>(null);
  const tableRequestIdRef = useRef(0);
  const tableStateRef = useRef({
    selectedSemesterId,
    currentPage,
    debouncedSearch,
  });

  const getTableLoadKey = useCallback(
    (
      nextAcademicYearId: number | null,
      nextSemesterId: number | null,
      nextPage: number,
      nextSearch: string,
    ) =>
      [
        collegeId,
        collegeEducationId,
        branchTitle,
        nextAcademicYearId ?? "all-years",
        nextSemesterId ?? "all-semesters",
        nextPage,
        nextSearch,
      ].join("|"),
    [branchTitle, collegeEducationId, collegeId],
  );

  const tableLoadKey = useMemo(
    () =>
      getTableLoadKey(
        selectedAcademicYearId,
        selectedSemesterId,
        currentPage,
        debouncedSearch,
      ),
    [
      currentPage,
      debouncedSearch,
      getTableLoadKey,
      selectedAcademicYearId,
      selectedSemesterId,
    ],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    tableStateRef.current = {
      selectedSemesterId,
      currentPage,
      debouncedSearch,
    };
  }, [currentPage, debouncedSearch, selectedSemesterId]);

  useEffect(() => {
    let isMounted = true;

    async function loadYearWise() {
      if (contextLoading || !collegeId || !collegeEducationId || !branchTitle) {
        return;
      }

      const {
        selectedSemesterId: semesterForTable,
        currentPage: pageForTable,
        debouncedSearch: searchForTable,
      } = tableStateRef.current;
      skippedTableLoadKeyRef.current = getTableLoadKey(
        selectedAcademicYearId,
        semesterForTable,
        pageForTable,
        searchForTable,
      );
      const tableRequestId = ++tableRequestIdRef.current;
      setIsChartLoading(true);
      setIsTableLoading(true);
      try {
        const result = await getYearWiseDetailsDynamic(
          collegeId,
          collegeEducationId,
          branchTitle,
          selectedAcademicYearId,
          semesterForTable,
          pageForTable,
          ITEMS_PER_PAGE,
          searchForTable,
          { includeCharts: true },
        );
        if (!isMounted || !result) return;
        setLeftChart(result.leftChart);
        setRightChart(result.rightChart);
        setAcademicYears(result.availableYears);
        setSemesters(result.availableSemesters);
        if (tableRequestId === tableRequestIdRef.current) {
          setStudentData(result.tableData);
          setTotalRecords(result.totalCount);
        }
      } catch (error) {
        console.error("Year wise analytics error:", error);
        if (!isMounted) return;
        setLeftChart([]);
        setRightChart([]);
        if (tableRequestId === tableRequestIdRef.current) {
          setStudentData([]);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted) {
          setIsChartLoading(false);
          if (tableRequestId === tableRequestIdRef.current) {
            setIsTableLoading(false);
          }
        }
      }
    }

    loadYearWise();

    return () => {
      isMounted = false;
    };
  }, [
    branchTitle,
    collegeId,
    collegeEducationId,
    contextLoading,
    getTableLoadKey,
    selectedAcademicYearId,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadTableOnly() {
      if (contextLoading || !collegeId || !collegeEducationId || !branchTitle) {
        return;
      }

      if (skippedTableLoadKeyRef.current === tableLoadKey) {
        skippedTableLoadKeyRef.current = null;
        return;
      }

      setIsTableLoading(true);
      const tableRequestId = ++tableRequestIdRef.current;
      try {
        const result = await getYearWiseDetailsDynamic(
          collegeId,
          collegeEducationId,
          branchTitle,
          selectedAcademicYearId,
          selectedSemesterId,
          currentPage,
          ITEMS_PER_PAGE,
          debouncedSearch,
          { includeCharts: false },
        );
        if (!isMounted || !result) return;
        if (tableRequestId !== tableRequestIdRef.current) return;
        setStudentData(result.tableData);
        setTotalRecords(result.totalCount);
      } catch (error) {
        console.error("Year wise student table error:", error);
        if (!isMounted) return;
        if (tableRequestId !== tableRequestIdRef.current) return;
        setStudentData([]);
        setTotalRecords(0);
      } finally {
        if (isMounted && tableRequestId === tableRequestIdRef.current) {
          setIsTableLoading(false);
        }
      }
    }

    loadTableOnly();

    return () => {
      isMounted = false;
    };
  }, [
    branchTitle,
    collegeId,
    collegeEducationId,
    contextLoading,
    currentPage,
    debouncedSearch,
    selectedAcademicYearId,
    selectedSemesterId,
    tableLoadKey,
  ]);

  const updateFilterParams = (academicYearId: number | null, semesterId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (academicYearId) params.set("academicYearId", String(academicYearId));
    else params.delete("academicYearId");
    if (semesterId) params.set("semesterId", String(semesterId));
    else params.delete("semesterId");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const tableRows = useMemo(
    () =>
      [...studentData]
        .sort((a, b) => {
          const nameCompare = a.studentName.localeCompare(
            b.studentName,
            undefined,
            { sensitivity: "base", numeric: true },
          );
          const rollCompare = a.rollNo.localeCompare(b.rollNo, undefined, {
            sensitivity: "base",
            numeric: true,
          });
          const result = nameCompare || rollCompare;
          return sortDirection === "asc"
            ? result
            : -result;
        })
        .map((student) => {
        const paidAmount = Number(student.paidAmount) || 0;
        const pendingAmount = Number(student.pendingAmount) || 0;
        const status = !student.feeAssigned
          ? "Not Assigned"
          : pendingAmount <= 0
            ? "Paid"
            : paidAmount > 0
              ? "Partial"
              : "Pending";
        const statusColor =
          status === "Paid"
            ? "from-[#66F35E] to-[#00A91A]"
            : status === "Pending"
              ? "from-[#FF6060] to-[#D90000]"
              : status === "Partial"
                ? "from-[#FFE45C] to-[#FFC400]"
                : "from-[#BEBEBE] to-[#8A8A8A]";

        return {
          studentName: <span className="font-semibold">{student.studentName}</span>,
          rollNo: student.rollNo,
          branch: student.branch,
          year: student.year,
          semester: student.semester,
          paidAmount: `${rupee} ${paidAmount.toLocaleString("en-IN")}`,
          pendingAmount: `${rupee} ${pendingAmount.toLocaleString("en-IN")}`,
          status: (
            <span className="inline-flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full bg-gradient-to-b ${statusColor}`} />
              {status}
            </span>
          ),
        };
      }),
    [sortDirection, studentData],
  );

  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const isChartSectionLoading = contextLoading || isChartLoading;
  const isStudentTableLoading = contextLoading || isTableLoading;

  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] p-2 pb-7 lg:pb-5">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Back to Branch Wise Collection"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#282828] transition hover:bg-[#F0F0F0]"
          onClick={() => router.push(backHref)}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-xl font-semibold text-[#282828]">{branchTitle}</h1>
        <CaretRight size={18} className="text-[#8A8A8A]" />
        <span className="text-sm text-[#525252]">Year-wise Fee Collection</span>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-md font-semibold text-[#282828]">
          Fee Collection Trends
        </h2>
        <div className="flex items-center gap-5 text-sm text-[#525252]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#282828]">Academic Year</span>
              <select
                value={selectedAcademicYearId ?? ""}
                onChange={(event) => {
                  const nextYearId = event.target.value ? Number(event.target.value) : null;
                  setSelectedAcademicYearId(nextYearId);
                  setSelectedSemesterId(null);
                  setCurrentPage(1);
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
            <span className="h-3 w-3 rounded-sm bg-[#43C17A]" />
            <span>Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#CFF3DD]" />
            <span>Pending</span>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isChartSectionLoading ? (
          <>
            <YearTrendCardShimmer />
            <YearTrendCardShimmer />
          </>
        ) : (
          <>
            <HorizontalTrendCard
              data={leftChart}
              color="#43C17A"
              lightColor="#CFF3DD"
              title={branchTitle}
            />
            <HorizontalTrendCard
              data={rightChart}
              color="#7654E8"
              lightColor="#E3DAFF"
              title={branchTitle}
            />
          </>
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-[#282828]">
          Students Overview
        </h2>

        <div className="custom-scrollbar mb-3 flex items-center justify-between gap-4 overflow-x-auto pb-2">
          <div className="flex w-full max-w-md shrink-0 items-center rounded-full bg-[#EAEAEA] px-4 py-2">
            <input
              placeholder="Search by Student Name / Roll No."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-[#282828] outline-none placeholder:text-[#525252]"
            />
            <MagnifyingGlass size={22} className="text-[#43C17A]" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <select
              value={selectedSemesterId ?? ""}
              onChange={(event) => {
                const nextSemesterId = event.target.value
                  ? Number(event.target.value)
                  : null;
                setSelectedSemesterId(nextSemesterId);
                setCurrentPage(1);
                updateFilterParams(selectedAcademicYearId, nextSemesterId);
              }}
              className="rounded-full bg-[#D9F4E4] px-4 py-2 text-sm font-semibold text-[#43C17A] outline-none"
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Sort student names ${sortDirection === "asc" ? "descending" : "ascending"}`}
              title={`Student Name: ${sortDirection === "asc" ? "A to Z" : "Z to A"}`}
              className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D9F4E4] px-4 text-sm font-semibold text-[#43C17A] ${
                isStudentTableLoading ? "animate-pulse" : ""
              }`}
              onClick={() =>
                setSortDirection((current) =>
                  current === "asc" ? "desc" : "asc",
                )
              }
            >
              <FunnelSimple size={22} weight="bold" />
              <span>Name {sortDirection === "asc" ? "A-Z" : "Z-A"}</span>
            </button>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <div className="min-w-[1180px]">
            <TableComponent
              columns={columns}
              tableData={tableRows}
              height="38vh"
              isLoading={isStudentTableLoading}
            />
          </div>
        </div>
        {totalPages > 1 && !isStudentTableLoading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-md border bg-white px-3 py-1 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-[#525252]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-md border bg-white px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
