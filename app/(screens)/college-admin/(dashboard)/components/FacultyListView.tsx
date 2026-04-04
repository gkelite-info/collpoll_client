"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  CaretLeft, CaretDown, CaretRight, MagnifyingGlass,
  UserGear, GraduationCap, UsersThree, UsersFour,
  CurrencyDollar, Buildings, Briefcase,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import TableComponent from "@/app/utils/table/table";
import CardComponent from "@/app/utils/card";
import { AgCharts } from "ag-charts-react";
import { ModuleRegistry, AllCommunityModule } from "ag-charts-community";
import type { AgPolarChartOptions } from "ag-charts-community";
import {
  getFacultyListData,
  type EduTypeDistribution,
  type FacultyRow,
  type FacultyListData,
} from "@/lib/helpers/collegeAdmin/getFacultyListData";
import { fetchCollegeAcademicYears } from "@/lib/helpers/admin/collegeAcademicYearAPI";
import { fetchSubjectFacultyList } from "@/lib/helpers/admin/facultyCountAPI";

ModuleRegistry.registerModules([AllCommunityModule]);

// ─── Stat card definitions (same pattern as AdminListView) ────────────────────

type FacultyPageSummary = {
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
  key:       keyof FacultyPageSummary;
  bg:        string;
  iconBg:    string;
  iconColor: string;
  icon:      React.ReactNode;
};

const STAT_DEFS: StatDef[] = [
  {
    label: "Admins",           key: "admins",
    bg: "bg-[#EDE9FE]",        iconBg: "#DDD6FE", iconColor: "#7C3AED",
    icon: <UserGear size={18} weight="fill" />,
  },
  {
    label: "Students",         key: "students",
    bg: "bg-[#FEF3C7]",        iconBg: "#FDE68A", iconColor: "#D97706",
    icon: <GraduationCap size={18} weight="fill" />,
  },
  {
    label: "Parents",          key: "parents",
    bg: "bg-[#D1FAE5]",        iconBg: "#A7F3D0", iconColor: "#059669",
    icon: <UsersThree size={18} weight="fill" />,
  },
  {
    label: "Faculty",          key: "faculty",
    bg: "bg-[#DBEAFE]",        iconBg: "#BFDBFE", iconColor: "#2563EB",
    icon: <UsersFour size={18} weight="fill" />,
  },
  {
    label: "Finance Manager",  key: "financeManagers",
    bg: "bg-[#FEE2E2]",        iconBg: "#FECACA", iconColor: "#DC2626",
    icon: <CurrencyDollar size={18} weight="fill" />,
  },
  {
    label: "HR Executive",     key: "hrExecutives",
    bg: "bg-[#E0F2FE]",        iconBg: "#BAE6FD", iconColor: "#0284C7",
    icon: <Buildings size={18} weight="fill" />,
  },
  {
    label: "Placement Manager", key: "placementManagers",
    bg: "bg-[#FCE7F3]",         iconBg: "#FBCFE8", iconColor: "#DB2777",
    icon: <Briefcase size={18} weight="fill" />,
  },
];

// ─── Donut colors (added collegeHr) ──────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admins:    "#7C3AED",
  students:  "#FBA945",
  parents:   "#10B981",
  faculty:   "#3B82F6",
  finance:   "#F97316",
  placement: "#EC4899",
  collegeHr: "#0284C7",
};

// ─── Donut card ───────────────────────────────────────────────────────────────

function EduDonutCard({ dist, hrExecutives = 0 }: { dist: EduTypeDistribution; hrExecutives?: number }) {
  const roles = ["admins", "students", "parents", "faculty", "finance", "placement", "collegeHr"] as const;

  const LEGEND_LABELS: Record<string, string> = {
    admins:    "Admins",
    students:  "Students",
    parents:   "Parents",
    faculty:   "Faculty",
    finance:   "Finance",
    placement: "Placement",
    collegeHr: "HR Executive",
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

// ─── FilterPill ───────────────────────────────────────────────────────────────

function FilterPill({ label, value, showCaret = false, onClick }: {
  label: string; value: string; showCaret?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#374151] font-medium">{label} :</span>
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#43C17A26] text-[#43C17A] font-semibold text-xs cursor-pointer"
        onClick={onClick}
      >
        {value}{showCaret && <CaretDown size={12} weight="bold" />}
      </div>
    </div>
  );
}

// ─── Shimmer components ───────────────────────────────────────────────────────

function CardsShimmer() {
  return (
    <div className="flex gap-3 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="min-w-[176px] h-32 flex-shrink-0 animate-pulse bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}

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

// ─── Table columns ────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  { title: "Faculty Name",     key: "fullName" },
  { title: "Faculty ID",       key: "facultyId" },
  { title: "Education Type",   key: "eduType" },
  { title: "Branch",           key: "branchCode" },
  { title: "Subjects Handled", key: "subjectsHandled" },
  { title: "Support Admin",    key: "supportAdmin" },
  { title: "Status",           key: "statusEl" },
];

const ROWS_PER_PAGE = 10;

type Props = { onBack: () => void };

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FacultyListView({ onBack }: Props) {
  const { collegeId, loading: contextLoading } = useCollegeAdmin();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [data, setData]             = useState<(FacultyListData & { totalCount: number }) | null>(null);
  const [summary, setSummary]       = useState<FacultyPageSummary | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedEduId, setSelectedEduId]   = useState<number | null>(null);
  const [eduOpen, setEduOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedAdmin, setSelectedAdmin]   = useState<string>("All");
  const [selectedYear, setSelectedYear]     = useState<string>("All");
  const [availableYears, setAvailableYears] = useState<{ id: number; label: string }[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | "All">("All");
  const [subjectFacultyList, setSubjectFacultyList] = useState<any[] | null>(null);

  const [branchOpen, setBranchOpen] = useState(false);
  const [adminOpen, setAdminOpen]   = useState(false);
  const [yearOpen, setYearOpen]     = useState(false);

  // ── Refs for each dropdown container ──────────────────────────────────────
  const eduRef    = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const adminRef  = useRef<HTMLDivElement>(null);
  const yearRef   = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalRecords / ROWS_PER_PAGE);

  // ── Query routing ──
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subview", "faculty");
    router.replace(`?${params.toString()}`, { scroll: false });
    return () => {
      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("subview");
      router.replace(`?${cleanParams.toString()}`, { scroll: false });
    };
  }, []);

  // ── Close all dropdowns (called when clicking outside any dropdown) ──
  const closeAllDropdowns = () => {
    setEduOpen(false);
    setBranchOpen(false);
    setAdminOpen(false);
    setYearOpen(false);
  };

  // ── Debounce search ──
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch ──
  const load = useCallback(async (page: number, eduId: number | null, branch: string, admin: string, searchTerm: string) => {
    if (contextLoading || !collegeId) return;
    if (page === 1) setIsFetching(true);
    setIsSearching(true);
    try {
      const branchId = branch !== "All"
        ? data?.branches.find((b) => b.collegeBranchCode === branch)?.collegeBranchId
        : undefined;
      const adminId = admin !== "All"
        ? data?.admins.find((a) => a.fullName === admin)?.adminId
        : undefined;

      const d = await getFacultyListData(collegeId, page, ROWS_PER_PAGE, {
        collegeEducationId: eduId ?? undefined,
        collegeBranchId:    branchId,
        adminId,
        search:             searchTerm || undefined,
      });
      setData(d);
      setTotalRecords(d.totalCount);
      setSummary(d.summary);
      setSelectedEduId((prev) => prev ?? (d.distributions.length > 0 ? d.distributions[0].collegeEducationId : null));
    } catch (err) {
      console.error("FacultyListView error:", err);
    } finally {
      setIsFetching(false);
      setIsSearching(false);
    }
  }, [collegeId, contextLoading]);

  // Initial load
  useEffect(() => {
    if (contextLoading || !collegeId) return;
    load(1, null, "All", "All", "");
  }, [collegeId, contextLoading]);

  // Reload when filters, page, or debounced search change
  useEffect(() => {
    if (!collegeId || contextLoading) return;
    load(currentPage, selectedEduId, selectedBranch, selectedAdmin, debouncedSearch);
  }, [currentPage, selectedEduId, selectedBranch, selectedAdmin, debouncedSearch]);

  const availableBranches = useMemo(() => {
    if (!data || !selectedEduId) return [];
    return data.branches.filter((b) => b.collegeEducationId === selectedEduId).map((b) => b.collegeBranchCode);
  }, [data, selectedEduId]);

  const availableAdmins = useMemo(() => {
    if (!data || !selectedEduId) return [];
    return [...new Set(data.admins.filter((a) => a.collegeEducationId === selectedEduId).map((a) => a.fullName))];
  }, [data, selectedEduId]);

  const tableData = useMemo(() => {
    if (subjectFacultyList && subjectFacultyList.length > 0) {
      return subjectFacultyList.map((s) => ({
        fullName: s.facultyName,
        facultyId: s.facultyId,
        eduType: selectedEduType || "—",
        branchCode: selectedBranch,
        subjectsHandled: s.subject || "—",
        supportAdmin: "—",
        statusEl: (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#059669]`}>Active</span>
        ),
      }));
    }
    if (!data) return [];
    return data.faculty.map((f) => ({
      ...f,
      statusEl: (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.isActive ? "bg-[#D1FAE5] text-[#059669]" : "bg-gray-100 text-gray-500"}`}>
          {f.isActive ? "Active" : "Inactive"}
        </span>
      ),
    }));
  }, [data]);

  const selectedEduType = data?.distributions.find((d) => d.collegeEducationId === selectedEduId)?.eduType ?? "";

  const showShimmer = isFetching || isSearching;

  const totalUsers = summary
    ? summary.admins + summary.students + summary.parents + summary.faculty +
      summary.financeManagers + summary.hrExecutives + summary.placementManagers
    : 0;

  const handleEduChange = (eduId: number | null) => {
    setSelectedEduId(eduId); setSelectedBranch("All"); setSelectedAdmin("All"); setCurrentPage(1); setEduOpen(false);
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch); setSelectedAdmin("All"); setCurrentPage(1); setBranchOpen(false);
    (async () => {
      try {
        setAvailableYears([]);
        setSelectedYear("All"); setSelectedYearId("All"); setSubjectFacultyList(null);
        if (!collegeId || branch === "All") return;
        const branchRow = data?.branches.find((b) => b.collegeBranchCode === branch);
        if (!branchRow) return;
        const years = await fetchCollegeAcademicYears(collegeId, branchRow.collegeBranchId);
        setAvailableYears(years.map((y: any) => ({ id: y.collegeAcademicYearId, label: y.collegeAcademicYear })));
      } catch (err) {
        console.error("Failed to load academic years:", err);
      }
    })();
  };

  const handleAdminChange = (admin: string) => {
    setSelectedAdmin(admin); setCurrentPage(1); setAdminOpen(false);
  };

  return (
    <div className="flex w-full min-h-screen pb-4">
      <div className="flex-1 p-2 pt-0 flex flex-col overflow-hidden" onClick={closeAllDropdowns}>

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-4">
          <CaretLeft size={20} weight="bold" className="cursor-pointer text-[#282828] active:scale-90" onClick={onBack} />
          <h1 className="text-xl font-semibold text-[#282828]">Faculty</h1>
        </div>

        {/* ── Total users ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
          Total Users :{" "}
          <span className="text-[#22A55D]">
            {isFetching ? "…" : totalUsers.toLocaleString("en-IN")}
          </span>
        </p>

        {/* ── Stat Cards ── */}
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
                  value={
                    isFetching
                      ? "…"
                      : (summary?.[def.key] ?? 0).toLocaleString("en-IN")
                  }
                  label={def.label}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── User Distribution heading ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">User Distribution by Education Type</p>

        {/* ── Donut cards ── */}
        {isFetching && !data ? (
          <div className="flex gap-4 mb-5" style={{ scrollbarWidth: "none" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="min-w-[280px] h-[280px] flex-shrink-0 animate-pulse bg-gray-200 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-y-hidden overflow-x-auto p-2 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {(data?.distributions ?? []).map((dist) => (
              <div key={dist.collegeEducationId} onClick={() => handleEduChange(dist.collegeEducationId)}
                className={`flex-shrink-0 cursor-pointer transition-all ${selectedEduId === dist.collegeEducationId ? "ring-2 ring-[#43C17A] rounded-2xl" : ""}`}
              >
                <EduDonutCard dist={dist} hrExecutives={summary?.hrExecutives ?? 0} />
              </div>
            ))}
          </div>
        )}

        {/* ── Total Faculty count ── */}
        <p className="text-[#1E40AF] font-bold text-[15px] mb-3">
          Total Faculty : {isFetching ? "…" : totalRecords}
        </p>

        {/* ── Filters ── */}
        <div className="flex items-center gap-4 mb-4 overflow-x-auto whitespace-nowrap py-1">

          {/* Education Type dropdown */}
          <div className="relative inline-block" ref={eduRef}>
            <FilterPill label="Education Type" value={selectedEduType || "All"} showCaret
              onClick={(e) => { e.stopPropagation(); setEduOpen((o) => !o); setBranchOpen(false); setAdminOpen(false); setYearOpen(false); }}
            />
            {eduOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-52 z-50 border border-gray-100">
                <div
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedEduId === null ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                  onClick={(e) => { e.stopPropagation(); handleEduChange(null); }}
                >
                  All
                </div>
                {(data?.distributions ?? []).map((d) => (
                  <div
                    key={d.collegeEducationId}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedEduId === d.collegeEducationId ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={(e) => { e.stopPropagation(); handleEduChange(d.collegeEducationId); }}
                  >
                    {d.eduType}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch dropdown */}
          <div className="relative inline-block" ref={branchRef}>
            <FilterPill label="Branch" value={selectedBranch} showCaret
              onClick={(e) => { e.stopPropagation(); setBranchOpen((o) => !o); setEduOpen(false); setAdminOpen(false); setYearOpen(false); }}
            />
            {branchOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-36 z-50 border border-gray-100">
                {["All", ...availableBranches].map((b) => (
                  <div
                    key={b}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedBranch === b ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={(e) => { e.stopPropagation(); handleBranchChange(b); }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Admin dropdown */}
          <div className="relative inline-block" ref={adminRef}>
            <FilterPill label="Support Admin" value={selectedAdmin} showCaret
              onClick={(e) => { e.stopPropagation(); setAdminOpen((o) => !o); setEduOpen(false); setBranchOpen(false); setYearOpen(false); }}
            />
            {adminOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-40 z-50 border border-gray-100">
                {["All", ...availableAdmins].map((a) => (
                  <div
                    key={a}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedAdmin === a ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={(e) => { e.stopPropagation(); handleAdminChange(a); }}
                  >
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teaching Year dropdown */}
          <div className="relative inline-block" ref={yearRef}>
            <FilterPill label="Teaching Year" value={selectedYear} showCaret
              onClick={(e) => { e.stopPropagation(); setYearOpen((o) => !o); setEduOpen(false); setBranchOpen(false); setAdminOpen(false); }}
            />
            {yearOpen && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-xl text-sm w-48 z-50 border border-gray-100">
                <div
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedYearId === "All" ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedYear("All"); setSelectedYearId("All"); setSubjectFacultyList(null); setYearOpen(false); }}
                >
                  All
                </div>
                {(availableYears ?? []).map((y) => (
                  <div
                    key={y.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedYearId === y.id ? "font-semibold text-[#43C17A]" : "text-[#282828]"}`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setSelectedYear(y.label);
                      setSelectedYearId(y.id);
                      setYearOpen(false);
                      try {
                        const branchId = data?.branches.find((b) => b.collegeBranchCode === selectedBranch)?.collegeBranchId;
                        if (!branchId) return;
                        setIsFetching(true);
                        const list = await fetchSubjectFacultyList(y.id, branchId);
                        setSubjectFacultyList(list);
                      } catch (err) {
                        console.error("Failed to fetch faculty for year:", err);
                        setSubjectFacultyList(null);
                      } finally {
                        setIsFetching(false);
                      }
                    }}
                  >
                    {y.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="w-[40%] bg-[#EAEAEA] px-3 rounded-full flex items-center mb-4">
          <input type="text" placeholder="Search by Faculty Name, Department, or Course"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none text-sm bg-transparent text-[#282828] placeholder:text-[#6B7280]"
          />
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[#43C17A] border-t-transparent rounded-full animate-spin" />
          ) : (
            <MagnifyingGlass size={18} className="text-[#43C17A]" />
          )}
        </div>

        {/* ── Table / TableShimmer / Empty ── */}
        {showShimmer ? (
          <TableShimmer />
        ) : tableData.length === 0 ? (
          <p className="text-gray-400 text-sm mt-8 text-center">No faculty found.</p>
        ) : (
          <TableComponent columns={TABLE_COLUMNS} tableData={tableData} height="55vh" />
        )}

        {/* ── Pagination ── */}
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