"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CaretLeftIcon,
  CheckCircle,
  ClockCountdownIcon,
  ListChecks,
  ListChecksIcon,
  Warning,
} from "@phosphor-icons/react";
import TableComponent from "@/app/utils/table/table";
import { Avatar } from "@/app/utils/Avatar";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import { useUser } from "@/app/utils/context/UserContext";
import WellbeingRight from "../../components/WellbeingRight";
import ManagerDashboardCard from "./ManagerDashboardCard";
import {
  fetchWellbeingManagerDashboard,
  type ManagerDashboardData,
} from "@/lib/helpers/wellbeingDashboard/wellbeingManagerDashboardAPI";

const ITEMS_PER_PAGE = 5;
const emptyDashboard: ManagerDashboardData = {
  stats: { total: 0, high: 0, pending: 0, resolved: 0 },
  statusBreakdown: [], categoryBreakdown: [], collegeIssues: [], hostelIssues: [],
};
const statsConfig = [
  { type: "total", label: "This month Total Issues", icon: ListChecksIcon, inactive: "bg-[#E6DBFF] text-[#6C20CA]", active: "bg-[#6C20CA] text-white", iconColor: "text-[#6C20CA]" },
  { type: "high", label: "High Priority", icon: ClockCountdownIcon, inactive: "bg-[#FFDEDE] text-[#E92D2D]", active: "bg-[#FF1F1F] text-white", iconColor: "text-[#FF1F1F]" },
  { type: "pending", label: "Pending", icon: Warning, inactive: "bg-[#FFEDDA] text-[#D98200]", active: "bg-[#F59E0B] text-white", iconColor: "text-[#F59E0B]" },
  { type: "resolved", label: "Resolved", icon: CheckCircle, inactive: "bg-[#E5F5EC] text-[#269F60]", active: "bg-[#43C17A] text-white", iconColor: "text-[#43C17A]" },
] as const;

export default function AllIssuesView({ stage }: { stage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "total";
  const { collegeId, wellBeingRegistrationTypes } = useUser();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [scope, setScope] = useState<"all" | "college" | "hostel">("all");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!collegeId) return;
    let cancelled = false;
    void fetchWellbeingManagerDashboard(collegeId, new Date(`${month}-01T00:00:00`), {
      registrationTypes: wellBeingRegistrationTypes,
    }).then((data) => { if (!cancelled) setDashboard(data); })
      .catch((error) => console.error("Manager issues drill-down fetch failed:", error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [collegeId, month, wellBeingRegistrationTypes]);

  useEffect(() => {
    if (!filterLoading) return;
    const timer = window.setTimeout(() => setFilterLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, [currentType, filterLoading, scope]);

  const scopedRows = useMemo(() => {
    const source = scope === "college" ? dashboard.collegeIssues : scope === "hostel" ? dashboard.hostelIssues : [...dashboard.collegeIssues, ...dashboard.hostelIssues];
    return Array.from(new Map(source.map((row) => [row.id, row])).values());
  }, [dashboard, scope]);
  const rows = useMemo(() => scopedRows.filter((row) => currentType === "total" || (currentType === "high" ? row.priority === "High" : row.status === currentType)), [currentType, scopedRows]);
  const visibleRows = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const scopedStats = useMemo(() => ({
    total: scopedRows.length,
    high: scopedRows.filter((row) => row.priority === "High").length,
    pending: scopedRows.filter((row) => row.status === "pending").length,
    resolved: scopedRows.filter((row) => row.status === "resolved").length,
  }), [scopedRows]);
  const scopedCategoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    scopedRows.forEach((row) => counts.set(row.category, (counts.get(row.category) ?? 0) + 1));
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [scopedRows]);
  const statValue = (type: string) => type === "total" ? scopedStats.total : type === "high" ? scopedStats.high : type === "pending" ? scopedStats.pending : scopedStats.resolved;
  const axisMax = Math.max(1, ...scopedCategoryBreakdown.map((item) => item.value));
  const calendarDate = useMemo(() => {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Date(year, monthIndex - 1, 1);
  }, [month]);
  const selectCalendarDate = (date: Date) => {
    setLoading(true);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    setPage(1);
  };
  const selectScope = (nextScope: typeof scope) => {
    if (nextScope === scope) return;
    setFilterLoading(true);
    setScope(nextScope);
    setPage(1);
  };
  const selectIssueType = (type: string) => {
    if (type === currentType) return;
    setFilterLoading(true);
    router.push(`${pathname}?view=issues&type=${type}`);
    setPage(1);
  };
  const columns = [{ title: "Requester", key: "subject" }, { title: "Issue", key: "issue" }, { title: "Category", key: "category" }, { title: "Priority", key: "priority" }];
  const tableData = visibleRows.map((issue) => ({
    subject: <div className="flex min-w-[185px] items-center gap-2 text-left"><Avatar src={issue.studentImage || null} alt={issue.student} size={32} /><p className="text-[12px] font-bold text-[#111827]">{issue.student}</p></div>,
    issue: <div className="min-w-[260px] text-left"><p className="text-[12px] font-bold text-[#111827]">{issue.issue}</p><p className="text-[10px] text-[#4B5563]">{issue.description}</p></div>,
    category: <span className="rounded-full bg-[#CFE2FA] px-3 py-1 text-[10px] font-semibold">{issue.category}</span>,
    priority: <span className="rounded-full bg-[#FFBB7030] px-3 py-1 text-[10px] font-semibold">{issue.priority}</span>,
  }));

  return <main className="flex min-h-full w-full overflow-x-hidden pb-5">
    <div className="w-full p-2 lg:w-[68%]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2"><button type="button" aria-label="Back to wellbeing manager dashboard" onClick={() => router.push("/wellbeing-manager")} className="flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#16284F]"><CaretLeftIcon size={22} weight="bold" /></button><h1 className="text-xl font-bold text-[#16284F]">This month issues ({scopedStats.total})</h1></div>
        <div className="flex gap-2"><select value={scope} onChange={(e) => selectScope(e.target.value as typeof scope)} className="h-9 rounded-md bg-[#16284F] px-3 text-sm font-bold text-white"><option value="all">College & Hostel</option><option value="college">College</option><option value="hostel">Hostel</option></select><input type="month" value={month} onChange={(e) => { setLoading(true); setMonth(e.target.value); setPage(1); }} className="h-9 rounded-full bg-[#43C17A] px-4 text-sm font-bold text-white [color-scheme:dark]" /></div>
      </div>
      {loading || filterLoading ? <div aria-label="Loading issue data" className="mt-5 space-y-4 animate-pulse"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-36 rounded-lg bg-gray-200" />)}</div><div className="h-64 rounded-2xl bg-gray-200" /><div className="h-72 rounded-2xl bg-gray-200" /></div> : <>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{statsConfig.map((stat) => { const Icon = stat.icon; const active = currentType === stat.type; return <button key={stat.type} onClick={() => selectIssueType(stat.type)} className={`cursor-pointer rounded-lg p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? stat.active : stat.inactive}`}><span className={`flex h-9 w-9 items-center justify-center rounded-md bg-white ${stat.iconColor}`}><Icon size={20} weight="fill" /></span><p className="mt-5 text-[22px] font-bold leading-tight">{statValue(stat.type)}</p><p className="mt-1 text-[11px] font-semibold leading-tight">{stat.label}</p></button>; })}</div>
        <ManagerDashboardCard className="mt-5 min-h-[250px] p-4"><h3 className="mb-4 text-sm font-bold text-[#16284F]">Issues Category Breakdown</h3><div className="flex h-[200px] items-end gap-4">{scopedCategoryBreakdown.map(item => <div key={item.name} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-[50px] rounded-t bg-[#43C17A]" style={{height: `${Math.max(4, item.value / axisMax * 85)}%`}} /><span className="text-[10px] font-bold text-[#16284F]">{item.name}</span></div>)}</div></ManagerDashboardCard>
        <ManagerDashboardCard className="mt-5 p-4"><div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F8EF]"><ListChecks size={20} className="text-[#43C17A]" weight="fill" /></span><h3 className="font-bold text-[#16284F]">Recent Issues</h3></div><div className="overflow-x-auto"><div className="min-w-[820px]"><TableComponent columns={columns} tableData={tableData} height="auto" /></div></div><Pagination currentPage={page} totalItems={rows.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} alwaysShow /></ManagerDashboardCard>
      </>}
    </div>{stage >= 3 ? <WellbeingRight activeCalendarDate={calendarDate} onCalendarDateSelect={selectCalendarDate} /> : null}
  </main>;
}
