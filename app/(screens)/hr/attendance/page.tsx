"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useUser } from "@/app/utils/context/UserContext";

import AttendanceStatCards from "./components/AttendanceStatCards";
import AttendanceToolbar from "./components/AttendanceToolbar";

import AttendanceTable from "./components/AttendanceTable";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import {
  AttendanceStaffRow,
  getAttendanceStaff,
  getAttendanceStaffStats,
  AttendanceStatsResult,
} from "@/lib/helpers/Hr/attendance/Getattendancestaff";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import AttendanceFilters from "./components/AttendanceFilteres";
import { useHrAttendanceRealtime } from "@/lib/helpers/Hr/attendance/liveHrAttendanceAPI";
import toast, { Toaster } from "react-hot-toast";

const typeIcons: Record<string, string> = {
  class: "/class.png",
  exam: "/exam.png",
  meeting: "/meeting.png",
  holiday: "/calendar-3d.png",
  event: "/event.png",
  notice: "/clip.png",
  result: "/result.jpg",
  timetable: "/timetable.png",
  placement: "/placement.png",
  emergency: "/emergency.png",
  finance: "/finance.jpg",
  other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DashboardShimmer = () => (
  <div className="p-2 w-full h-full flex flex-col animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-64 bg-gray-200 rounded"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>
      <div className="w-[320px] h-24 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="w-full flex gap-5">
      <div className="w-[68%] flex flex-col gap-6">
        <div className="flex gap-3 w-full">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[126px] rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-gray-200 rounded-full"
                ></div>
              ))}
            </div>
            <div className="h-10 w-64 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-[400px] w-full bg-gray-200 rounded-xl mt-2"></div>
        </div>
      </div>
      <div className="w-[32%] flex flex-col gap-4">
        <div className="h-64 w-full bg-gray-200 rounded-xl"></div>
        <div className="h-[400px] w-full bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

function FacultyAttendanceDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") || "total";

  const { collegeId, collegeHrId, loading: hrLoading } = useCollegeHr();
  const { userId, role } = useUser();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("others");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<AttendanceStaffRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [stats, setStats] = useState<AttendanceStatsResult>({ total: 0, present: 0, absent: 0, late: 0, leave: 0 });

  // States to manage loading and UI feel
  const [isFetching, setIsFetching] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  // FIX: Local state for active tab ensures instant optimistic UI updates
  const [localTab, setLocalTab] = useState(urlTab);
  const activeTab = localTab;

  const [markedUserIds, setMarkedUserIds] = useState<Set<number>>(new Set());

  const [filterDate, setFilterDate] = useState<string | null>(null);
  const filterDateRef = useRef<string | null>(null);
  const searchMounted = useRef(false);

  useEffect(() => {
    filterDateRef.current = filterDate;
  }, [filterDate]);

  // Sync URL changes to local state if external navigation happens
  useEffect(() => {
    setLocalTab(urlTab);
  }, [urlTab]);

  const fetchStats = useCallback(async (search = "", date?: string | null, rFilter?: string | null) => {
    if (!collegeId) return;
    try {
      const result = await getAttendanceStaffStats({
        collegeId,
        search,
        date: date ?? undefined,
        role: rFilter ?? undefined,
      });
      setStats(result);
    } catch (err) {
      console.error("Attendance stats error:", err);
    }
  }, [collegeId]);

  const fetchStaff = useCallback(
    async (search = "", date?: string | null, rFilter?: string | null, pageNum = 1, tab = "total") => {
      if (!collegeId) return;
      try {
        const result = await getAttendanceStaff({
          collegeId,
          search,
          page: pageNum,
          limit: itemsPerPage,
          date: date ?? undefined,
          role: rFilter ?? undefined,
          tabStatus: tab,
        });
        setStaffList(result.staff);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error("Attendance staff fetch error:", err);
      } finally {
        setIsFetching(false);
        setIsInitialLoad(false);
      }
    },
    [collegeId],
  );

  useEffect(() => {
    if (!hrLoading && collegeId) {
      fetchStats(searchQuery, filterDateRef.current, activeRole);
      fetchStaff(searchQuery, filterDateRef.current, activeRole, currentPage, localTab);
    }
  }, [hrLoading, collegeId]);

  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }

    setIsFetching(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      fetchStats(searchQuery, filterDateRef.current, activeRole);
      fetchStaff(searchQuery, filterDateRef.current, activeRole, 1, localTab);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeRole]);

  // Realtime HR Attendance Updates
  useHrAttendanceRealtime((payload) => {
    // We do a silent fetch so we don't flash loading states
    if (payload.new && payload.new.userId) {
      fetchStats(searchQuery, filterDateRef.current, activeRole);
      fetchStaffSilent(searchQuery, filterDateRef.current, currentPage, localTab);
      toast.success("Attendance updated successfully", { id: "hr-realtime-toast" });
    }
  });

  // Table Shimmer on localTab Change (Optimistic UI)
  useEffect(() => {
    if (!searchMounted.current) return;
    setIsTabSwitching(true);
    const timer = setTimeout(() => setIsTabSwitching(false), 250);
    return () => clearTimeout(timer);
  }, [localTab]);

  const fetchStaffSilent = useCallback(
    async (search = "", date?: string | null, pageNum = 1, tab = "total") => {
      if (!collegeId) return;
      try {
        const result = await getAttendanceStaff({
          collegeId,
          search,
          page: pageNum,
          limit: itemsPerPage,
          date: date ?? undefined,
          tabStatus: tab,
        });
        setStaffList(result.staff);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error("Silent fetch error:", err);
      }
    },
    [collegeId],
  );

  const handleDateFilter = (date: string | null) => {
    setIsFetching(true);
    setFilterDate(date);
    filterDateRef.current = date;
    setCurrentPage(1);
    fetchStats(searchQuery, date, activeRole);
    fetchStaff(searchQuery, date, activeRole, 1, localTab);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setIsFetching(true);
    fetchStaff(searchQuery, filterDateRef.current, activeRole, newPage, localTab);
  };

  const handleTabChange = (tabId: string) => {
    // FIX: Instant state updates before the router can delay
    setLocalTab(tabId);
    setActiveRole(null);
    setSearchQuery("");
    setCurrentPage(1);
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());

    setIsFetching(true);
    fetchStats("", filterDateRef.current, null);
    fetchStaff("", filterDateRef.current, null, 1, tabId);

    // Non-blocking URL push
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleToggleEdit = () => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      setSelectAll(false);
      setSelectedRows(new Set());
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(checked ? new Set(staffList.map((_, i) => i)) : new Set());
  };

  const handleSelectRow = (
    index: number,
    checked: boolean,
    filteredLength: number,
  ) => {
    const updated = new Set(selectedRows);
    if (checked) {
      updated.add(index);
      if (updated.size === filteredLength) setSelectAll(true);
    } else {
      updated.delete(index);
      setSelectAll(false);
    }
    setSelectedRows(updated);
  };

  const handleMarkStatus = (
    status: "Present" | "Absent" | "Leave" | "Late",
    filteredStaff: AttendanceStaffRow[],
  ) => {
    if (selectedRows.size === 0) return;

    const selectedUserIds = Array.from(selectedRows)
      .map((index) => filteredStaff[index]?.userId)
      .filter(Boolean) as number[];

    if (selectedUserIds.length === 0) return;

    setStaffList((prev) =>
      prev.map((s) =>
        selectedUserIds.includes(s.userId)
          ? {
            ...s,
            status:
              status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          }
          : s,
      ),
    );

    setMarkedUserIds((prev) => new Set([...prev, ...selectedUserIds]));
    setSelectAll(false);
    setSelectedRows(new Set());
  };

  const handleSave = () => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setMarkedUserIds(new Set());
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setMarkedUserIds(new Set());
  };

  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;
      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });
      setAnnouncements(
        res.data.map((item: any) => ({
          collegeAnnouncementId: item.collegeAnnouncementId,
          title: item.title,
          date: item.date,
          createdAt: item.createdAt,
          type: item.type,
          targetRoles: item.targetRoles,
          image: typeIcons[item.type] || "/clip.png",
          imgHeight: "h-10",
          cardBg: "#E8F8EF",
          imageBg: "#D3F1E0",
          professor:
            view === "my"
              ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
              : `By ${formatRole(item.createdByRole)}`,
        })),
      );
    } catch (err) {
      console.error("HR announcements error:", err);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);

  if (hrLoading) {
    return <DashboardShimmer />;
  }

  return (
    <div className="text-[#282828] p-2 w-full h-full flex flex-col">
      <Toaster position="top-right" />
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col justify-start">
          <h1 className="text-xl font-bold text-[#282828] whitespace-nowrap">
            Attendance Management
          </h1>
          <p className="text-sm text-[#282828] mt-1">
            Stay organized and on track with your personalized calendar
          </p>
        </div>
        <div className="w-[320px] shrink-0">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      <div className="w-full flex gap-5">
        <div className="w-[68%] flex flex-col gap-6">
          <AttendanceStatCards
            activeTab={activeTab} // Uses localTab for immediate visual updates
            totalCount={stats.total}
            presentCount={stats.present}
            absentCount={stats.absent}
            lateCount={stats.late}
            leaveCount={stats.leave}
            isLoading={isInitialLoad}
            onTabChange={handleTabChange}
          />

          <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
            <AttendanceToolbar
              isEditMode={isEditMode}
              selectedRows={selectedRows}
              onToggleEdit={handleToggleEdit}
              onMarkStatus={(status) => {
                const visibleList = activeRole
                  ? staffList.filter((s) => s.role === activeRole)
                  : staffList;
                handleMarkStatus(status, visibleList);
              }}
              onDateFilter={handleDateFilter}
            />

            <AttendanceFilters
              activeRole={activeRole}
              searchQuery={searchQuery}
              onRoleChange={setActiveRole}
              onSearchChange={setSearchQuery}
            />

            <AttendanceTable
              isEditMode={isEditMode}
              isFetching={isFetching || isTabSwitching}
              activeRole={activeRole}
              staffList={staffList}
              fullStaffList={staffList}
              selectedRows={selectedRows}
              selectAll={selectAll}
              collegeHrId={collegeHrId ?? 0}
              markedUserIds={markedUserIds}
              filterDate={filterDate}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onSave={handleSave}
              onCancel={handleCancel}
              onRefresh={() => {
                fetchStats(searchQuery, filterDateRef.current, activeRole);
                fetchStaffSilent(searchQuery, filterDateRef.current, currentPage, localTab);
              }}
            />
            <div className={`${isEditMode ? "mt-1" : "-mt-4"} mb-3`}>
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                roundedBottom="rounded-b-xl border-x border-b border-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="w-[32%] flex flex-col -gap-1 -mt-5 pb-4">
          <WorkWeekCalendar />
          <AnnouncementsCard
            announceCard={announcements}
            height="80vh"
            currentView={view}
            onViewChange={(v) => setView(v)}
            refreshAnnouncements={fetchAnnouncements}
          />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardShimmer />}>
      <FacultyAttendanceDashboard />
    </Suspense>
  );
}
