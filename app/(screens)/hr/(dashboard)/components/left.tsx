"use client";
 
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, Clock, User, UsersThree } from "@phosphor-icons/react";
import CardComponent from "@/app/utils/card";
import { HrInfoCard } from "./hrInfoCard";
import MonthlyAttendanceChart from "./MonthlyAttendanceChart";
import FacultyMonthDetailTable from "./facultyAttendanceTable";
import TableComponent from "@/app/utils/table/table";
import {
  DEFAULT_ROLE,
  getHrDashCards,
  getMonthDetail,
  getMonthlyAttendance,
  getTodayAttendance,
  HR_ROLE_PILLS,
  HrDashCards,
  MonthDetailRow,
  MonthlyBar,
  TodayRow,
} from "@/lib/helpers/Hr/dashboard/Hrdashhelper";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { useRouter, useSearchParams } from "next/navigation";
import HrStaffAttendanceView from "./Hrstaffattendanceview";
 
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 
// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-end items-center gap-3 mt-4 mb-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border
          ${currentPage === 1 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
      >
        <CaretLeft size={18} weight="bold" />
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-lg font-semibold
            ${currentPage === i + 1 ? "bg-[#16284F] text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border
          ${currentPage === totalPages ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
      >
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  );
}
 
// ── Shimmer ───────────────────────────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
 
function CardShimmer() {
  return (
    <div className="flex gap-3 w-full">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 h-[126px] rounded-xl bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}
 
function ChartShimmer() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <Shimmer className="h-5 w-64 mb-6" />
      <div className="flex items-end gap-3 h-[160px]">
        {[70, 55, 55, 55, 70, 55, 55, 60, 70, 65, 60, 50].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-t relative overflow-hidden bg-gray-200" style={{ height: `${h}%` }}>
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <Shimmer className="h-2 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
 
function TableShimmer({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-2">
      <div className="p-3 flex flex-col gap-2">
        <div className="flex gap-3 px-1 pb-2">
          {[...Array(cols)].map((_, i) => <Shimmer key={i} className="h-3 flex-1" />)}
        </div>
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="flex gap-3 px-1 py-1">
            {[...Array(cols)].map((_, c) => <Shimmer key={c} className="h-4 flex-1" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toUpperCase();
  const cls =
    s === "PRESENT" ? "text-[#22C55E]" :
      s === "LATE" ? "text-[#EAB308]" :
        s === "ABSENT" ? "text-[#EF4444]" :
          s === "LEAVE" ? "text-[#60AEFF]" : "text-gray-400";
  return (
    <span className={`${cls} font-semibold text-xs`}>
      {s ? s.charAt(0) + s.slice(1).toLowerCase() : "—"}
    </span>
  );
}
 
// ── Today table ───────────────────────────────────────────────────────────────
function TodayTable({ rows, isFaculty, totalCount, currentPage, onPageChange, onViewClick }: {
  rows: TodayRow[];
  isFaculty: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewClick: (userId: number) => void;
}) {
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
 
  if (rows.length === 0)
    return <p className="text-gray-400 text-xs text-center py-6">No attendance records for today</p>;
 
  const columns = [
    { title: "Name", key: "name" },
    { title: "Check-In", key: "checkIn" },
    { title: "Check-Out", key: "checkOut" },
    { title: "Status", key: "status" },
    ...(isFaculty ? [{ title: "Classes Taken", key: "classesTaken" }] : []),
    { title: "Action", key: "action" },
  ];
 
  const tableData = rows.map((r) => ({
    name: r.name,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    status: <StatusBadge status={r.status} />,
    classesTaken: r.classesTaken ?? 0,
    action: (
      <span
        className="text-emerald-600 hover:text-emerald-500 cursor-pointer font-medium underline"
        onClick={() => onViewClick(r.userId)}
      >
        View
      </span>
    ),
  }));
 
  return (
    <div>
      <h4 className="text-sm font-semibold text-[#282828] mb-1 mt-2">Attendance Overview</h4>
      <TableComponent columns={columns} tableData={tableData} height="38vh" />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
 
// ── Main ──────────────────────────────────────────────────────────────────────
export default function HrDashLeft() {
  const { collegeId, loading: hrLoading } = useCollegeHr();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const topRef = useRef<HTMLDivElement>(null);
 
  // Read userId from URL query param
  const urlUserId = searchParams.get("userId");
 
  const [activeRole, setActiveRole] = useState(DEFAULT_ROLE);
  const [cards, setCards] = useState<HrDashCards | null>(null);
  const [chartData, setChartData] = useState<MonthlyBar[]>([]);
  const [todayRows, setTodayRows] = useState<TodayRow[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayPage, setTodayPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<MonthDetailRow[]>([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailPage, setDetailPage] = useState(1);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
 
  const PAGE_SIZE = 10;
 
  // ── Navigate to staff attendance view via query param ───────────────────────
  const handleViewClick = (userId: number) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("role", activeRole);
    currentUrl.searchParams.set("userId", String(userId));
    router.push(currentUrl.pathname + currentUrl.search);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
 
  // ── Back from staff view ────────────────────────────────────────────────────
  const handleBackFromStaffView = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("role");
    currentUrl.searchParams.delete("userId");
    router.push(currentUrl.pathname + currentUrl.search);
  };
 
  // ── Stat cards ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!collegeId || hrLoading) return;
    setLoadingCards(true);
    getHrDashCards(collegeId).then(setCards).finally(() => setLoadingCards(false));
  }, [collegeId, hrLoading]);
 
  // ── Monthly chart ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!collegeId || hrLoading) return;
    setSelectedMonth(null);
    setLoadingChart(true);
    getMonthlyAttendance(collegeId, activeRole, currentYear)
      .then(setChartData).finally(() => setLoadingChart(false));
  }, [collegeId, hrLoading, activeRole]);
 
  // ── Today table ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!collegeId || hrLoading) return;
    setLoadingToday(true);
    getTodayAttendance(collegeId, activeRole, todayPage, PAGE_SIZE)
      .then(res => { setTodayRows(res.data); setTodayTotal(res.totalCount); })
      .finally(() => setLoadingToday(false));
  }, [collegeId, hrLoading, activeRole, todayPage]);
 
  // ── Role change ─────────────────────────────────────────────────────────────
  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    setTodayPage(1);
    setSelectedMonth(null);
  };
 
  // ── Month detail ────────────────────────────────────────────────────────────
  const fetchDetail = async (month: string, page: number) => {
    if (!collegeId) return;
    const idx = MONTH_LABELS.indexOf(month);
    if (idx === -1) return;
    setLoadingDetail(true);
    const res = await getMonthDetail(collegeId, activeRole, currentYear, idx, page, PAGE_SIZE);
    setDetailRows(res.data);
    setDetailTotal(res.totalCount);
    setLoadingDetail(false);
  };
 
  const handleBarClick = async (month: string) => {
    setSelectedMonth(month);
    setDetailPage(1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    await fetchDetail(month, 1);
  };
 
  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    setDetailPage(1);
    await fetchDetail(month, 1);
  };
 
  const handleDetailPageChange = async (page: number) => {
    setDetailPage(page);
    if (selectedMonth) await fetchDetail(selectedMonth, page);
  };
 
  const isFaculty = activeRole === "Faculty";
  const roleLabel = HR_ROLE_PILLS.find(p => p.value === activeRole)?.label ?? activeRole;
 
  const cardData = [
    { style: "bg-[#E2DAFF] h-[126.35px] w-[182px]", icon: <UsersThree size={21} weight="fill" color="#6C20CA" />, value: String(cards?.totalStaff ?? 0).padStart(2, "0"), label: "Total Staff" },
    { style: "bg-[#E6FBEA] h-[126.35px] w-[182px]", icon: <User size={21} weight="fill" color="#22C55E" />, value: String(cards?.presentToday ?? 0).padStart(2, "0"), label: "Present Today" },
    { style: "bg-[#FFE0E0] h-[126.35px] w-[182px]", icon: <User size={21} weight="fill" color="#FF0000" />, value: String(cards?.absentToday ?? 0).padStart(2, "0"), label: "Absent Today" },
    { style: "bg-[#CEE6FF] h-[126.35px] w-[182px]", icon: <Clock size={21} weight="fill" color="#60AEFF" />, value: String(cards?.lateCheckins ?? 0).padStart(2, "0"), label: "Late Check-ins" },
  ];
 
  // ── If userId is in URL, show staff attendance view ─────────────────────────
  if (urlUserId) {
    return (
      <div ref={topRef} className="w-[68%] p-2">
        <HrStaffAttendanceView
          userId={urlUserId}
          onBack={handleBackFromStaffView}
        />
      </div>
    );
  }
 
  return (
    <div ref={topRef} className="w-[68%] p-2">
      {selectedMonth ? (
        <FacultyMonthDetailTable
          month={selectedMonth}
          months={MONTH_LABELS}
          rows={detailRows}
          roleLabel={roleLabel}
          loading={loadingDetail}
          totalCount={detailTotal}
          currentPage={detailPage}
          onPageChange={handleDetailPageChange}
          onMonthChange={handleMonthChange}
          onBack={() => setSelectedMonth(null)}
        />
      ) : (
        <>
          <HrInfoCard cardProps={[{
            show: false, user: "HR", studentsTaskPercentage: 85,
            facultySubject: "", image: "/hr-fe.png",
            top: "-top-5", imageHeight: "h-42", right: "right-8",
          }]} />
 
          {/* Stat cards */}
          <div className="mt-5">
            {loadingCards ? <CardShimmer /> : (
              <div className="flex gap-3 text-xs">
                {cardData.map((item, i) => (
                  <CardComponent key={i} style={item.style} icon={item.icon} value={item.value} label={item.label} />
                ))}
              </div>
            )}
          </div>
 
          {/* Role pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {HR_ROLE_PILLS.map((pill) => {
              const isActive = activeRole === pill.value;
              return (
                <button key={pill.value} onClick={() => handleRoleChange(pill.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer
                    ${isActive
                      ? "bg-[#22C55E] text-white border-[#22C55E]"
                      : "bg-white text-[#282828] border-gray-300 hover:bg-[#22C55E] hover:text-white hover:border-[#22C55E]"
                    }`}>
                  {pill.label}
                </button>
              );
            })}
          </div>
 
          {/* Chart + Today table */}
          <div className="mt-4 flex flex-col gap-4">
            {loadingChart
              ? <ChartShimmer />
              : <MonthlyAttendanceChart
                title={`Monthly Attendance Overview — ${roleLabel} (${currentYear})`}
                data={chartData}
                onBarClick={handleBarClick}
              />
            }
            {loadingToday
              ? <TableShimmer rows={5} cols={isFaculty ? 5 : 4} />
              : <TodayTable
                rows={todayRows}
                isFaculty={isFaculty}
                totalCount={todayTotal}
                currentPage={todayPage}
                onPageChange={(p) => setTodayPage(p)}
                onViewClick={handleViewClick}
              />
            }
          </div>
        </>
      )}
    </div>
  );
}