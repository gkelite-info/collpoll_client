"use client";

import { useEffect, useMemo, useState, useCallback } from "react"; // ← added useCallback
import {
  CaretLeft, CaretDown, CaretRight, MagnifyingGlass,
  UserGear, GraduationCap, UsersThree, UsersFour,
  CurrencyDollar, Buildings, Briefcase,
} from "@phosphor-icons/react"; // ← added stat icons
import { useRouter, useSearchParams } from "next/navigation"; // ← ADDED
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import TableComponent from "@/app/utils/table/table";
import CardComponent from "@/app/utils/card"; // ← ADDED
import { AgCharts } from "ag-charts-react";
import { ModuleRegistry, AllCommunityModule } from "ag-charts-community";
import type { AgPolarChartOptions } from "ag-charts-community";
import { EduTypeDistribution, getParentListData, ParentListData } from "@/lib/helpers/collegeAdmin/Getparentlistdata";

ModuleRegistry.registerModules([AllCommunityModule]);

// ── ADDED: Stat card definitions (same as AdminListView) ──────────────────────

type ParentPageSummary = {
  admins: number;
  students: number;
  parents: number;
  faculty: number;
  financeManagers: number;
  hrExecutives: number;
  placementManagers: number;
};

type StatDef = {
  label:     string;
  key:       keyof ParentPageSummary;
  bg:        string;
  iconBg:    string;
  iconColor: string;
  icon:      React.ReactNode;
};

const STAT_DEFS: StatDef[] = [
  { label: "Admins",            key: "admins",            bg: "bg-[#EDE9FE]", iconBg: "#DDD6FE", iconColor: "#7C3AED", icon: <UserGear size={18} weight="fill" /> },
  { label: "Students",          key: "students",           bg: "bg-[#FEF3C7]", iconBg: "#FDE68A", iconColor: "#D97706", icon: <GraduationCap size={18} weight="fill" /> },
  { label: "Parents",           key: "parents",            bg: "bg-[#D1FAE5]", iconBg: "#A7F3D0", iconColor: "#059669", icon: <UsersThree size={18} weight="fill" /> },
  { label: "Faculty",           key: "faculty",            bg: "bg-[#DBEAFE]", iconBg: "#BFDBFE", iconColor: "#2563EB", icon: <UsersFour size={18} weight="fill" /> },
  { label: "Finance Manager",   key: "financeManagers",    bg: "bg-[#FEE2E2]", iconBg: "#FECACA", iconColor: "#DC2626", icon: <CurrencyDollar size={18} weight="fill" /> },
  { label: "HR Executive",      key: "hrExecutives",       bg: "bg-[#E0F2FE]", iconBg: "#BAE6FD", iconColor: "#0284C7", icon: <Buildings size={18} weight="fill" /> },
  { label: "Placement Manager", key: "placementManagers",  bg: "bg-[#FCE7F3]", iconBg: "#FBCFE8", iconColor: "#DB2777", icon: <Briefcase size={18} weight="fill" /> },
];

// ── ADDED: CardsShimmer ───────────────────────────────────────────────────────

function CardsShimmer() {
  return (
    <div className="flex gap-3 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="min-w-[176px] h-32 flex-shrink-0 animate-pulse bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}

// ── ADDED: collegeHr to ROLE_COLORS ──────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admins: "#7C3AED", students: "#FBA945", parents: "#10B981",
  faculty: "#3B82F6", finance: "#F97316", placement: "#EC4899",
  collegeHr: "#0284C7", // ← ADDED
};

// ── UPDATED: EduDonutCard — added collegeHr role + "HR Executive" legend label

function EduDonutCard({ dist, hrExecutives = 0 }: { dist: EduTypeDistribution; hrExecutives?: number }) {
  const roles = ["admins", "students", "parents", "faculty", "finance", "placement", "collegeHr"] as const; // ← added collegeHr

  const LEGEND_LABELS: Record<string, string> = {
    admins: "Admins", students: "Students", parents: "Parents",
    faculty: "Faculty", finance: "Finance", placement: "Placement",
    collegeHr: "HR Executive", // ← shows "HR Executive" in legend
  };

  const getValue = (role: typeof roles[number]) => {
    if (role === "collegeHr") return dist.collegeHr > 0 ? dist.collegeHr : hrExecutives;
    return dist[role] as number;
  };

  const chartData = roles
    .filter((role) => getValue(role) > 0)
    .map((role) => ({ role: LEGEND_LABELS[role], value: getValue(role) }));
  const fills = roles
    .filter((role) => getValue(role) > 0)
    .map((role) => ROLE_COLORS[role]);
  const options: AgPolarChartOptions = useMemo(() => ({
    data: chartData.length > 0 ? chartData : [{ role: "Empty", value: 1 }],
    background: { fill: "transparent" },
    padding: { top: 10, bottom: 0, left: 10, right: 10 },
    series: [{
      type: "donut", angleKey: "value", legendItemKey: "role",
      innerRadiusRatio: 0.55, outerRadiusRatio: 0.85, strokeWidth: 0,
      fills: chartData.length > 0 ? fills : ["#F3F4F6"],
      highlightStyle: { series: { dimOpacity: 0.8 } },
    }],
    legend: { position: "bottom", spacing: 4, item: { label: { fontSize: 10, color: "#6B7280" }, marker: { size: 8, shape: "circle", padding: 4 } } },
  }), [dist, hrExecutives]);

  return (
    <div className="min-w-[280px] max-w-[300px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#1F2937] text-[15px]">{dist.eduType}</span>
        <span className="text-gray-400 text-xs font-medium ml-1">Total Users : {dist.totalUsers.toLocaleString("en-IN")} Users</span>
      </div>
      <div style={{ height: "220px" }}><AgCharts options={options} style={{ height: "100%" }} /></div>
    </div>
  );
}

function FilterPill({ label, value, showCaret = false, onClick }: {
  label: string; value: string; showCaret?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#374151] font-medium">{label} :</span>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#43C17A26] text-[#43C17A] font-semibold text-xs cursor-pointer" onClick={onClick}>
        {value}{showCaret && <CaretDown size={12} weight="bold" />}
      </div>
    </div>
  );
}

// ── ADDED: TableShimmer (same as AdminListView / FacultyListView / StudentListView)

function TableShimmer() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4 px-4 py-3 bg-gray-100 rounded-t-xl mb-1">
        {TABLE_COLUMNS.map((col) => (
          <div key={col.key} className="flex-1 h-4 bg-gray-300 rounded" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-4 px-4 py-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${i === 5 ? "rounded-b-xl" : ""}`}
        >
          {TABLE_COLUMNS.map((col) => (
            <div
              key={col.key}
              className="flex-1 h-3.5 bg-gray-200 rounded"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const TABLE_COLUMNS = [
  { title: "Parent Name",    key: "fullName" },
  { title: "Linked Student", key: "linkedStudent" },
  { title: "Support Admin",  key: "supportAdmin" },
  { title: "Education Type", key: "eduType" },
  { title: "Branch",         key: "branchCode" },
  { title: "Year",           key: "academicYear" },
];

const ROWS_PER_PAGE = 10;
type Props = { onBack: () => void };

export default function ParentListView({ onBack }: Props) {
  const { collegeId, loading: contextLoading } = useCollegeAdmin();
  const router       = useRouter();       // ← ADDED
  const searchParams = useSearchParams(); // ← ADDED

  const [data, setData]             = useState<(ParentListData & { totalCount: number }) | null>(null);
  const [summary, setSummary]       = useState<ParentPageSummary | null>(null); // ← ADDED
  const [isFetching, setIsFetching] = useState(true);
  const [isSearching, setIsSearching] = useState(false);       // ← ADDED
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");  // ← ADDED
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedEduId, setSelectedEduId]   = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedYear, setSelectedYear]     = useState("All");

  const [branchOpen, setBranchOpen] = useState(false);
  const [yearOpen, setYearOpen]     = useState(false);

  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

  // ── ADDED: Query routing — sets ?subview=parents, cleans up on unmount ──
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subview", "parents");
    router.replace(`?${params.toString()}`, { scroll: false });
    return () => {
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("subview");
      router.replace(`?${cleanParams.toString()}`, { scroll: false });
    };
  }, []);

  // ── ADDED: Debounce search → triggers API call after 400ms ──
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── load wrapped in useCallback, accepts searchTerm ──
  const load = useCallback(async (page: number, eduId: number | null, branch: string, year: string, searchTerm: string) => { // ← added searchTerm
    if (contextLoading || !collegeId) return;
    if (page === 1) setIsFetching(true);
    setIsSearching(true); // ← ADDED
    try {
      const branchId = branch !== "All"
        ? data?.branches.find((b) => b.collegeBranchCode === branch)?.collegeBranchId
        : undefined;
      const yearId = year !== "All"
        ? data?.academicYears.find((y) => y.collegeAcademicYear === year && (!branchId || y.collegeBranchId === branchId))?.collegeAcademicYearId
        : undefined;

      const d = await getParentListData(collegeId, page, ROWS_PER_PAGE, {
        collegeEducationId:    eduId ?? undefined,
        collegeBranchId:       branchId,
        collegeAcademicYearId: yearId,
        search:                searchTerm || undefined, // ← ADDED
      });
      setData(d);
      setTotalRecords(d.totalCount);
      setSummary(d.summary); // ← ADDED
      if (!eduId && d.distributions.length > 0) {
        setSelectedEduId(d.distributions[0].collegeEducationId);
      }
    } catch (err) {
      console.error("ParentListView error:", err);
    } finally {
      setIsFetching(false);
      setIsSearching(false); // ← ADDED
    }
  }, [collegeId, contextLoading]);

  useEffect(() => {
    if (contextLoading || !collegeId) return;
    load(1, null, "All", "All", ""); // ← added ""
  }, [collegeId, contextLoading]);

  // ── ADDED: debouncedSearch included in dependencies ──
  useEffect(() => {
    if (!collegeId || contextLoading) return;
    load(currentPage, selectedEduId, selectedBranch, selectedYear, debouncedSearch);
  }, [currentPage, selectedEduId, selectedBranch, selectedYear, debouncedSearch]);

  const availableBranches = useMemo(() => {
    if (!data || !selectedEduId) return [];
    return data.branches.filter((b) => b.collegeEducationId === selectedEduId).map((b) => b.collegeBranchCode);
  }, [data, selectedEduId]);

  const availableYears = useMemo(() => {
    if (!data || !selectedEduId) return [];
    return [...new Set(
      data.academicYears
        .filter((y) => {
          const matchEdu = y.collegeEducationId === selectedEduId;
          const matchBranch = selectedBranch === "All" ||
            data.branches.find((b) => b.collegeBranchId === y.collegeBranchId)?.collegeBranchCode === selectedBranch;
          return matchEdu && matchBranch;
        })
        .map((y) => y.collegeAcademicYear)
    )];
  }, [data, selectedEduId, selectedBranch]);

  // tableData: client-side search filter removed (API handles it now)
  const tableData = useMemo(() => {
    if (!data) return [];
    return data.parents; // ← API handles search
  }, [data]);

  const selectedEduType = data?.distributions.find((d) => d.collegeEducationId === selectedEduId)?.eduType ?? "";

  const showShimmer = isFetching || isSearching; // ← ADDED

  // ← ADDED: total across all roles for header count
  const totalUsers = summary
    ? summary.admins + summary.students + summary.parents + summary.faculty +
      summary.financeManagers + summary.hrExecutives + summary.placementManagers
    : 0;

  const closeAll = () => { setBranchOpen(false); setYearOpen(false); };

  return (
    <div className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 pt-0 flex flex-col overflow-hidden" onClick={closeAll}>

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-4">
          <CaretLeft size={20} weight="bold" className="cursor-pointer text-[#282828] active:scale-90" onClick={onBack} />
          <h1 className="text-xl font-semibold text-[#282828]">Parents</h1>
        </div>

        {/* ── ADDED: Total users ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
          Total Users :{" "}
          <span className="text-[#22A55D]">
            {isFetching ? "…" : totalUsers.toLocaleString("en-IN")}
          </span>
        </p>

        {/* ── ADDED: Stat Cards (non-clickable, same as AdminListView) ── */}
        {isFetching && !summary ? (
          <CardsShimmer />
        ) : (
          <div
            className="flex gap-3 mb-5 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {STAT_DEFS.map((def) => (
              <div key={def.key} className="flex-shrink-0">
                <CardComponent
                  style={`${def.bg} h-32 w-44`}
                  icon={def.icon}
                  iconBgColor={def.iconBg}
                  iconColor={def.iconColor}
                  value={isFetching ? "…" : (summary?.[def.key] ?? 0).toLocaleString("en-IN")}
                  label={def.label}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── User Distribution heading ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">User Distribution by Education Type</p>

        {/* ── Donut cards shimmer / list (unchanged) ── */}
        {isFetching && !data ? (
          <div className="flex gap-4 mb-5">
            {[...Array(3)].map((_, i) => <div key={i} className="min-w-[280px] h-[260px] flex-shrink-0 animate-pulse bg-gray-200 rounded-2xl" />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-y-hidden overflow-x-auto p-2 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {(data?.distributions ?? []).map((dist) => (
              <div key={dist.collegeEducationId}
                onClick={() => { setSelectedEduId(dist.collegeEducationId); setSelectedBranch("All"); setSelectedYear("All"); setCurrentPage(1); }}
                className={`flex-shrink-0 cursor-pointer transition-all ${selectedEduId === dist.collegeEducationId ? "ring-2 ring-[#43C17A] rounded-2xl" : ""}`}
              >
                <EduDonutCard dist={dist} hrExecutives={summary?.hrExecutives ?? 0} />
              </div>
            ))}
          </div>
        )}

        {/* ── Total Parents count ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
          Total Parents : {isFetching ? "…" : totalRecords}
        </p>

        {/* ── Filters (unchanged) ── */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <FilterPill label="Education Type" value={selectedEduType || "All"} />

          <div className="relative">
            <FilterPill label="Branch" value={selectedBranch} showCaret
              onClick={(e) => { e.stopPropagation(); setBranchOpen((o) => !o); setYearOpen(false); }}
            />
            {branchOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-36 z-50 border border-gray-100">
                {["All", ...availableBranches].map((b) => (
                  <div key={b}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedBranch === b ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedBranch(b); setSelectedYear("All"); setCurrentPage(1); setBranchOpen(false); }}
                  >{b}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <FilterPill label="Year" value={selectedYear} showCaret
              onClick={(e) => { e.stopPropagation(); setYearOpen((o) => !o); setBranchOpen(false); }}
            />
            {yearOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-36 z-50 border border-gray-100">
                {["All", ...availableYears].map((y) => (
                  <div key={y}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedYear === y ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedYear(y); setCurrentPage(1); setYearOpen(false); }}
                  >{y}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Search (spinner on search same as AdminListView) ── */}
        <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center mb-4">
          <input type="text" placeholder="Search by Parent Name or Student Name"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
          />
          {/* ── ADDED: spinner while searching, icon otherwise ── */}
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[#43C17A] border-t-transparent rounded-full animate-spin" />
          ) : (
            <MagnifyingGlass size={18} className="text-[#43C17A]" />
          )}
        </div>

        {/* ── CHANGED: TableShimmer instead of plain pulse div ── */}
        {showShimmer ? (
          <TableShimmer />
        ) : tableData.length === 0 ? (
          <p className="text-gray-400 text-sm mt-8 text-center">No parents found.</p>
        ) : (
          <TableComponent columns={TABLE_COLUMNS} tableData={tableData} height="55vh" />
        )}

        {/* ── ADDED: hide pagination during shimmer ── */}
        {totalPages > 1 && !showShimmer && (
          <div className="flex justify-end items-center gap-3 mt-4 mb-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              <CaretLeft size={18} weight="bold" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}