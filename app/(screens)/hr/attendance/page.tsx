"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Loader } from "../../(student)/calendar/right/timetable";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useUser } from "@/app/utils/context/UserContext";

import AttendanceStatCards from "./components/AttendanceStatCards";
import AttendanceToolbar   from "./components/AttendanceToolbar";

import AttendanceTable     from "./components/AttendanceTable";
import { EditedTimes } from "./components/types";
import { AttendanceStaffRow, getAttendanceStaff } from "@/lib/helpers/Hr/attendance/Getattendancestaff";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import AttendanceFilters from "./components/AttendanceFilteres";

const typeIcons: Record<string, string> = {
  class: "/class.png", exam: "/exam.png", meeting: "/meeting.png",
  holiday: "/calendar-3d.png", event: "/event.png", notice: "/clip.png",
  result: "/result.jpg", timetable: "/timetable.png", placement: "/placement.png",
  emergency: "/emergency.png", finance: "/finance.jpg", other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function FacultyAttendanceDashboard() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeTab    = searchParams.get("tab") || "total";

  // ── Use HR context for collegeId + collegeHrId ───────────────────────────
  const { collegeId, collegeHrId, loading: hrLoading } = useCollegeHr();

  // useUser still needed for announcements (userId + role)
  const { userId, role } = useUser();

  // ── State ─────────────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view,          setView]          = useState<"my" | "others">("my");
  const [isEditMode,    setIsEditMode]    = useState(false);
  const [selectAll,     setSelectAll]     = useState(false);
  const [selectedRows,  setSelectedRows]  = useState<Set<number>>(new Set());
  const [activeRole,    setActiveRole]    = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [staffList,     setStaffList]     = useState<AttendanceStaffRow[]>([]);
  const [totalCount,    setTotalCount]    = useState(0);
  const [isFetching,    setIsFetching]    = useState(false);
  const [markedUserIds, setMarkedUserIds] = useState<Set<number>>(new Set());

  // ── Fetch staff — waits for HR context to resolve ────────────────────────
  const fetchStaff = useCallback(async (search = "") => {
    if (!collegeId) return;
    setIsFetching(true);
    try {
      const result = await getAttendanceStaff({ collegeId, search, page: 1, limit: 100 });
      setStaffList(result.staff);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("Attendance staff fetch error:", err);
    } finally {
      setIsFetching(false);
    }
  }, [collegeId]);

  // Silent fetch — updates data without showing table loading skeleton
  const fetchStaffSilent = useCallback(async (search = "") => {
    if (!collegeId) return;
    try {
      const result = await getAttendanceStaff({ collegeId, search, page: 1, limit: 100 });
      setStaffList(result.staff);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("Silent fetch error:", err);
    }
  }, [collegeId]);

  // Fetch once HR context is ready
  useEffect(() => {
    if (!hrLoading && collegeId) fetchStaff();
  }, [hrLoading, collegeId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchStaff(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Counts derived from staffList ────────────────────────────────────────
  const presentCount = staffList.filter(s => s.status?.toLowerCase() === "present").length;
  const absentCount  = staffList.filter(s => s.status?.toLowerCase() === "absent").length;
  const lateCount    = staffList.filter(s => s.status?.toLowerCase() === "late").length;
  const leaveCount   = staffList.filter(s => s.status?.toLowerCase() === "leave").length;

  // ── Tab filtering ─────────────────────────────────────────────────────────
  const filteredByTab = (() => {
    const tabFilter = (s: AttendanceStaffRow) => {
      switch (activeTab) {
        case "present": return s.status?.toLowerCase() === "present";
        case "absent":  return s.status?.toLowerCase() === "absent";
        case "late":    return s.status?.toLowerCase() === "late";
        case "leave":   return s.status?.toLowerCase() === "leave";
        default:        return true;
      }
    };

    if (!isEditMode) return staffList.filter(tabFilter);

    // In edit mode — show tab-filtered rows PLUS any rows that were marked
    // (so they don't disappear after status change)
    return staffList.filter(s => tabFilter(s) || markedUserIds.has(s.userId));
  })();
  useEffect(() => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setActiveRole(null);
    setSearchQuery("");
  }, [activeTab]);

  // ── Tab change ────────────────────────────────────────────────────────────
  const handleTabChange = (tabId: string) => {
    setActiveRole(null);
    setSearchQuery("");
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── Edit mode toggle ──────────────────────────────────────────────────────
  const handleToggleEdit = () => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) { setSelectAll(false); setSelectedRows(new Set()); }
  };

  // ── Row selection ─────────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(checked ? new Set(staffList.map((_, i) => i)) : new Set());
  };

  const handleSelectRow = (index: number, checked: boolean, filteredLength: number) => {
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

  // ── Bulk mark — UI only, no API call until Save Attendance ──────────────
  const handleMarkStatus = (status: "Present" | "Absent" | "Leave" | "Late", filteredStaff: AttendanceStaffRow[]) => {
    if (selectedRows.size === 0) return;

    const selectedUserIds = Array.from(selectedRows)
      .map((index) => filteredStaff[index]?.userId)
      .filter(Boolean) as number[];

    if (selectedUserIds.length === 0) return;

    setStaffList((prev) =>
      prev.map((s) =>
        selectedUserIds.includes(s.userId)
          ? { ...s, status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() }
          : s
      )
    );

    setMarkedUserIds((prev) => new Set([...prev, ...selectedUserIds]));
    setSelectAll(false);
    setSelectedRows(new Set());
  };

  const handleSave = () => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setMarkedUserIds(new Set());  // clear after save
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setMarkedUserIds(new Set());  // clear on cancel too
  };

  // ── Announcements ─────────────────────────────────────────────────────────
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
      setAnnouncements(res.data.map((item: any) => ({
        collegeAnnouncementId: item.collegeAnnouncementId,
        title: item.title, date: item.date, createdAt: item.createdAt,
        type: item.type, targetRoles: item.targetRoles,
        image: typeIcons[item.type] || "/clip.png",
        imgHeight: "h-10", cardBg: "#E8F8EF", imageBg: "#D3F1E0",
        professor: view === "my"
          ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
          : `By ${formatRole(item.createdByRole)}`,
      })));
    } catch (err) {
      console.error("HR announcements error:", err);
    }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);

  // ── Loading state while HR context resolves ───────────────────────────────
  if (hrLoading) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm font-medium">
        <Loader />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="text-[#282828] p-2 w-full h-full flex flex-col">

      {/* Page header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col justify-start">
          <h1 className="text-xl font-bold text-[#282828]">Attendance Management</h1>
          <p className="text-sm text-[#282828] mt-1">
            Stay Organized and On Track with Your Personalized Calendar
          </p>
        </div>
        <div className="w-[320px]">
          <CourseScheduleCard isVisibile={false} />
        </div>
      </div>

      <div className="w-full flex gap-5">
        <div className="w-[68%] flex flex-col gap-6">

          {/* Stat cards */}
          <AttendanceStatCards
            activeTab={activeTab}
            totalCount={totalCount}
            presentCount={presentCount}
            absentCount={absentCount}
            lateCount={lateCount}
            leaveCount={leaveCount}
            onTabChange={handleTabChange}
          />

          <div className="flex flex-col flex-1 w-full">

            {/* Title + mark buttons + edit toggle */}
            <AttendanceToolbar
              isEditMode={isEditMode}
              selectedRows={selectedRows}
              onToggleEdit={handleToggleEdit}
              onMarkStatus={(status) => {
                const visibleList = activeRole
                  ? filteredByTab.filter((s) => s.role === activeRole)
                  : filteredByTab;
                handleMarkStatus(status, visibleList);
              }}
            />

            {/* Role pills + search bar */}
            <AttendanceFilters
              activeRole={activeRole}
              searchQuery={searchQuery}
              onRoleChange={setActiveRole}
              onSearchChange={setSearchQuery}
            />

            {/* Table + save/cancel */}
            <AttendanceTable
              isEditMode={isEditMode}
              isFetching={isFetching}
              activeRole={activeRole}
              staffList={filteredByTab}
              fullStaffList={staffList}
              selectedRows={selectedRows}
              selectAll={selectAll}
              collegeHrId={collegeHrId ?? 0}
              markedUserIds={markedUserIds}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onSave={handleSave}
              onCancel={handleCancel}
              onRefresh={() => fetchStaffSilent(searchQuery)}
            />

          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[32%] flex flex-col -gap-1 -mt-5 pb-4">
          <WorkWeekCalendar />
          <AnnouncementsCard
            announceCard={announcements}
            height="80vh"
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
    <Suspense fallback={<div className="p-10 text-center text-gray-500 font-medium"><Loader /></div>}>
      <FacultyAttendanceDashboard />
    </Suspense>
  );
}
