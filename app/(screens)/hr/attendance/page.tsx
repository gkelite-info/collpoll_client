"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UsersThree, User, Clock, PencilSimple, X, MagnifyingGlass } from "@phosphor-icons/react";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import { Loader } from "../../(student)/calendar/right/timetable";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { useUser } from "@/app/utils/context/UserContext";

const getStatusBadge = (status: string) => {
  let colorClass = "text-gray-500";
  if (status === "Present") colorClass = "text-[#22C55E]";
  if (status === "Late")    colorClass = "text-[#EAB308]";
  if (status === "Absent")  colorClass = "text-[#EF4444]";
  if (status === "Leave")   colorClass = "text-[#60AEFF]";
  return <span className={`${colorClass} font-semibold`}>{status}</span>;
};

const typeIcons: Record<string, string> = {
  class: "/class.png", exam: "/exam.png", meeting: "/meeting.png",
  holiday: "/calendar-3d.png", event: "/event.png", notice: "/clip.png",
  result: "/result.jpg", timetable: "/timetable.png", placement: "/placement.png",
  emergency: "/emergency.png", finance: "/finance.jpg", other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const ROLE_FILTERS = [
  "College Admin", "Admin", "Faculty",
  "Finance Manager", "Finance Executive", "HR Manager", "Placement",
];

const MARK_BUTTONS = [
  { label: "Mark Present", bg: "bg-[#22C55E]", hover: "hover:bg-[#16a34a]" },
  { label: "Mark Absent",  bg: "bg-[#EF4444]", hover: "hover:bg-[#dc2626]" },
  { label: "Mark Leave",   bg: "bg-[#60AEFF]", hover: "hover:bg-[#3b82f6]" },
  { label: "Mark Late",    bg: "bg-[#FFBE61]", hover: "hover:bg-[#f59e0b]" },
];

// ── Raw data (no JSX — status stored as string, rendered later) ──────────────
type StaffRow = {
  id: string;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  statusStr: string;
  classesTaken: string;
  lateBy: string;
  earlyOut: string;
};

const ALL_DATA: Record<string, StaffRow[]> = {
  total: [
    { id: "S001", name: "Dr. Meera Sharma",  role: "College Admin",     checkIn: "09:04 AM", checkOut: "05:12 PM", totalHours: "8h 08m", statusStr: "Present", classesTaken: "04", lateBy: "04m", earlyOut: "-"   },
    { id: "S002", name: "Mr. Rahul Menon",   role: "Admin",             checkIn: "09:15 AM", checkOut: "04:59 PM", totalHours: "7h 38m", statusStr: "Late",    classesTaken: "05", lateBy: "18m", earlyOut: "-"   },
    { id: "S003", name: "Ms. Divya Rao",     role: "Finance Manager",   checkIn: "-",        checkOut: "-",        totalHours: "-",       statusStr: "Absent",  classesTaken: "-",  lateBy: "-",   earlyOut: "-"   },
    { id: "S004", name: "Dr. Arun Kumar",    role: "Finance Executive",  checkIn: "08:50 AM", checkOut: "05:05 PM", totalHours: "8h 15m", statusStr: "Present", classesTaken: "06", lateBy: "-",   earlyOut: "-"   },
    { id: "S005", name: "Mrs. Anita Desai",  role: "HR Manager",        checkIn: "On Leave", checkOut: "On Leave", totalHours: "-",       statusStr: "Leave",   classesTaken: "-",  lateBy: "-",   earlyOut: "-"   },
    { id: "S006", name: "Mr. Kunal Verma",   role: "Placement",         checkIn: "09:25 AM", checkOut: "05:10 PM", totalHours: "7h 45m", statusStr: "Late",    classesTaken: "04", lateBy: "25m", earlyOut: "-"   },
    { id: "S007", name: "Dr. Smitha Patil",  role: "College Admin",     checkIn: "09:00 AM", checkOut: "04:30 PM", totalHours: "7h 30m", statusStr: "Present", classesTaken: "03", lateBy: "-",   earlyOut: "30m" },
    { id: "S008", name: "Mr. John Doe",      role: "Faculty",           checkIn: "08:55 AM", checkOut: "05:00 PM", totalHours: "8h 05m", statusStr: "Present", classesTaken: "05", lateBy: "-",   earlyOut: "-"   },
    { id: "S009", name: "Dr. Vikram Singh",  role: "Finance Manager",   checkIn: "-",        checkOut: "-",        totalHours: "-",       statusStr: "Absent",  classesTaken: "-",  lateBy: "-",   earlyOut: "-"   },
    { id: "S010", name: "Ms. Neha Gupta",    role: "HR Manager",        checkIn: "09:10 AM", checkOut: "05:00 PM", totalHours: "7h 50m", statusStr: "Late",    classesTaken: "04", lateBy: "10m", earlyOut: "-"   },
  ],
  present: [
    { id: "S001", name: "Dr. Meera Sharma",  role: "College Admin",     checkIn: "09:04 AM", checkOut: "05:12 PM", totalHours: "8h 08m", statusStr: "Present", classesTaken: "04", lateBy: "04m", earlyOut: "-"   },
    { id: "S004", name: "Dr. Arun Kumar",    role: "Finance Executive",  checkIn: "08:50 AM", checkOut: "05:05 PM", totalHours: "8h 15m", statusStr: "Present", classesTaken: "06", lateBy: "-",   earlyOut: "-"   },
    { id: "S007", name: "Dr. Smitha Patil",  role: "College Admin",     checkIn: "09:00 AM", checkOut: "04:30 PM", totalHours: "7h 30m", statusStr: "Present", classesTaken: "03", lateBy: "-",   earlyOut: "30m" },
    { id: "S008", name: "Mr. John Doe",      role: "Faculty",           checkIn: "08:55 AM", checkOut: "05:00 PM", totalHours: "8h 05m", statusStr: "Present", classesTaken: "05", lateBy: "-",   earlyOut: "-"   },
    { id: "S011", name: "Dr. Kavita Reddy",  role: "Placement",         checkIn: "08:58 AM", checkOut: "05:15 PM", totalHours: "8h 17m", statusStr: "Present", classesTaken: "04", lateBy: "-",   earlyOut: "-"   },
    { id: "S012", name: "Mr. Sanjay Dutt",   role: "HR Manager",        checkIn: "09:02 AM", checkOut: "05:05 PM", totalHours: "8h 03m", statusStr: "Present", classesTaken: "05", lateBy: "02m", earlyOut: "-"   },
  ],
  absent: [
    { id: "S003", name: "Ms. Divya Rao",     role: "Finance Manager",   checkIn: "-", checkOut: "-", totalHours: "-", statusStr: "Absent", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S009", name: "Dr. Vikram Singh",  role: "Finance Manager",   checkIn: "-", checkOut: "-", totalHours: "-", statusStr: "Absent", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S013", name: "Mr. Akash Bansal",  role: "Admin",             checkIn: "-", checkOut: "-", totalHours: "-", statusStr: "Absent", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S014", name: "Dr. Priya Sharma",  role: "College Admin",     checkIn: "-", checkOut: "-", totalHours: "-", statusStr: "Absent", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S015", name: "Mrs. Sunita Verma", role: "HR Manager",        checkIn: "-", checkOut: "-", totalHours: "-", statusStr: "Absent", classesTaken: "-", lateBy: "-", earlyOut: "-" },
  ],
  late: [
    { id: "S002", name: "Mr. Rahul Menon",   role: "Admin",             checkIn: "09:15 AM", checkOut: "04:59 PM", totalHours: "7h 38m", statusStr: "Late", classesTaken: "05", lateBy: "18m", earlyOut: "-" },
    { id: "S006", name: "Mr. Kunal Verma",   role: "Placement",         checkIn: "09:25 AM", checkOut: "05:10 PM", totalHours: "7h 45m", statusStr: "Late", classesTaken: "04", lateBy: "25m", earlyOut: "-" },
    { id: "S010", name: "Ms. Neha Gupta",    role: "HR Manager",        checkIn: "09:10 AM", checkOut: "05:00 PM", totalHours: "7h 50m", statusStr: "Late", classesTaken: "04", lateBy: "10m", earlyOut: "-" },
    { id: "S016", name: "Dr. Rajesh Iyer",   role: "Finance Executive",  checkIn: "09:30 AM", checkOut: "05:20 PM", totalHours: "7h 50m", statusStr: "Late", classesTaken: "03", lateBy: "30m", earlyOut: "-" },
    { id: "S017", name: "Mrs. Meena Kumari", role: "College Admin",     checkIn: "09:12 AM", checkOut: "05:00 PM", totalHours: "7h 48m", statusStr: "Late", classesTaken: "05", lateBy: "12m", earlyOut: "-" },
  ],
  leave: [
    { id: "S005", name: "Mrs. Anita Desai",  role: "HR Manager",    checkIn: "On Leave", checkOut: "On Leave", totalHours: "-", statusStr: "Leave", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S018", name: "Mr. Harish Rao",    role: "Admin",         checkIn: "On Leave", checkOut: "On Leave", totalHours: "-", statusStr: "Leave", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S019", name: "Dr. Amit Patel",    role: "College Admin", checkIn: "On Leave", checkOut: "On Leave", totalHours: "-", statusStr: "Leave", classesTaken: "-", lateBy: "-", earlyOut: "-" },
    { id: "S020", name: "Ms. Shruti Hassan", role: "Placement",     checkIn: "On Leave", checkOut: "On Leave", totalHours: "-", statusStr: "Leave", classesTaken: "-", lateBy: "-", earlyOut: "-" },
  ],
};

type ExtendedColumn = { title: React.ReactNode; key: string };

function FacultyAttendanceDashboard() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const activeTab    = searchParams.get("tab") || "total";
  const { userId, collegeId, role } = useUser();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view,          setView]          = useState<"my" | "others">("my");
  const [isEditMode,    setIsEditMode]    = useState(false);
  const [selectAll,     setSelectAll]     = useState(false);
  const [selectedRows,  setSelectedRows]  = useState<Set<number>>(new Set());
  const [activeRole,    setActiveRole]    = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");

  // Mutable check-in / check-out per row keyed by `${tab}-${id}`
  const [editedTimes, setEditedTimes] = useState<Record<string, { checkIn: string; checkOut: string }>>({});

  // ── Reset edit mode + selection on tab change (NOT role filter) ───────────
  useEffect(() => {
    setIsEditMode(false);
    setSelectAll(false);
    setSelectedRows(new Set());
    setSearchQuery("");
    // activeRole intentionally NOT reset here — let it persist across tab clicks
  }, [activeTab]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const isFacultyFilter = activeRole === "Faculty";

  const columns: ExtendedColumn[] = [
    // Checkbox — edit mode only
    ...(isEditMode ? [{
      title: (
        <div className="flex justify-center items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectAll(checked);
              const rawData = ALL_DATA[activeTab as keyof typeof ALL_DATA] || ALL_DATA.total;
              setSelectedRows(checked ? new Set(rawData.map((_, i) => i)) : new Set());
            }}
            className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
          />
        </div>
      ),
      key: "select",
    }] : []),
    { title: "ID",          key: "id" },
    { title: "Name",        key: "name" },
    { title: "Role",        key: "role" },
    { title: "Check-In",   key: "checkIn" },
    { title: "Check-Out",  key: "checkOut" },
    { title: "Total Hours", key: "totalHours" },
    { title: "Status",      key: "status" },
    // Classes Taken — only when Faculty pill is active
    ...(isFacultyFilter ? [{ title: "Classes Taken", key: "classesTaken" }] : []),
    { title: "Late By",    key: "lateBy" },
    { title: "Early Out",  key: "earlyOut" },
  ];

  // ── Announcements ─────────────────────────────────────────────────────────
  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;
      const res = await fetchCollegeAnnouncements({ collegeId, userId, role, view, page: 1, limit: 20 });
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
    } catch (err) { console.error("HR announcements error:", err); }
  };

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const cardsConfig = [
    { id: "total",   label: "Total Staff",    value: 18, icon: <UsersThree size={22} weight="fill" />, colors: { activeBg: "bg-[#6C20CA]", inactiveBg: "bg-[#E2DAFF]", activeIconHex: "#6C20CA" } },
    { id: "present", label: "Present Today",  value: 15, icon: <User      size={22} weight="fill" />, colors: { activeBg: "bg-[#43C17A]", inactiveBg: "bg-[#E6FBEA]", activeIconHex: "#43C17A" } },
    { id: "absent",  label: "Absent Today",   value: 2,  icon: <User      size={22} weight="fill" />, colors: { activeBg: "bg-[#FF0000]", inactiveBg: "bg-[#FFE0E0]", activeIconHex: "#FF0000" } },
    { id: "late",    label: "Late Check-ins", value: 1,  icon: <Clock     size={22} weight="fill" />, colors: { activeBg: "bg-[#60AEFF]", inactiveBg: "bg-[#CEE6FF]", activeIconHex: "#60AEFF" } },
    { id: "leave",   label: "On Leave",       value: 2,  icon: <User      size={22} weight="fill" />, colors: { activeBg: "bg-[#FFBE61]", inactiveBg: "bg-[#FFEDDA]", activeIconHex: "#FFBE61" } },
  ];

  // ── Table data ────────────────────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    const rawData = ALL_DATA[activeTab as keyof typeof ALL_DATA] || ALL_DATA.total;

    let filtered = activeRole
      ? rawData.filter((item) => item.role === activeRole)
      : rawData;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q)
      );
    }

    return filtered.map((item, index) => {
      const timeKey = `${activeTab}-${item.id}`;
      const times   = editedTimes[timeKey] ?? { checkIn: item.checkIn, checkOut: item.checkOut };

      const handleTimeChange = (field: "checkIn" | "checkOut", value: string) => {
        setEditedTimes((prev) => ({
          ...prev,
          [timeKey]: { ...(prev[timeKey] ?? { checkIn: item.checkIn, checkOut: item.checkOut }), [field]: value },
        }));
      };

      return {
        id:   item.id,
        name: item.name,
        role: item.role,

        // Editable check-in / check-out in edit mode
        checkIn: isEditMode && item.checkIn !== "-" && item.checkIn !== "On Leave" ? (
          <input
            type="text"
            value={times.checkIn}
            onChange={(e) => handleTimeChange("checkIn", e.target.value)}
            className="w-20 text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#6C20CA]"
          />
        ) : times.checkIn,

        checkOut: isEditMode && item.checkOut !== "-" && item.checkOut !== "On Leave" ? (
          <input
            type="text"
            value={times.checkOut}
            onChange={(e) => handleTimeChange("checkOut", e.target.value)}
            className="w-20 text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#6C20CA]"
          />
        ) : times.checkOut,

        totalHours:   item.totalHours,
        status:       getStatusBadge(item.statusStr),
        classesTaken: item.classesTaken,
        lateBy:       item.lateBy,
        earlyOut:     item.earlyOut,

        // Checkbox — edit mode only
        ...(isEditMode && {
          select: (
            <div className="flex justify-center items-center">
              <input
                type="checkbox"
                checked={selectedRows.has(index)}
                onChange={(e) => {
                  const updated = new Set(selectedRows);
                  if (e.target.checked) {
                    updated.add(index);
                    if (updated.size === filtered.length) setSelectAll(true);
                  } else {
                    updated.delete(index);
                    setSelectAll(false);
                  }
                  setSelectedRows(updated);
                }}
                className="w-4 h-4 rounded border-gray-300 text-[#6C20CA] focus:ring-[#6C20CA] cursor-pointer"
              />
            </div>
          ),
        }),
      };
    });
  }, [activeTab, selectedRows, selectAll, isEditMode, activeRole, searchQuery, editedTimes]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="text-[#282828] p-2 w-full h-full flex flex-col">
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

          {/* ── Stat cards ── */}
          <div className="flex gap-3 w-full">
            {cardsConfig.map((card) => {
              const isActive = activeTab === card.id;
              return (
                <div key={card.id} className="flex-1">
                  <CardComponent
                    style={`${isActive ? card.colors.activeBg : card.colors.inactiveBg} w-full shadow-none`}
                    isActive={isActive}
                    icon={card.icon}
                    value={String(card.value).padStart(2, "0")}
                    label={card.label}
                    iconBgColor={"#FFFFFF"}
                    iconColor={card.colors.activeIconHex}
                    onClick={() => handleTabChange(card.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col flex-1 w-full">

            {/* ── Title row ── */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#282828]">Daily Attendance Records</h2>
              <div className="flex items-center gap-2">
                {isEditMode && MARK_BUTTONS.map((btn) => (
                  <button
                    key={btn.label}
                    className={`${btn.bg} ${btn.hover} text-white text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-colors`}
                  >
                    {btn.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsEditMode((prev) => !prev);
                    if (isEditMode) { setSelectAll(false); setSelectedRows(new Set()); }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer
                    ${isEditMode
                      ? "bg-[#F3EEFF] text-[#6C20CA] border border-[#6C20CA] hover:bg-[#e9e0ff]"
                      : "text-[#6C20CA] border border-[#6C20CA] hover:bg-[#F3EEFF]"}`}
                >
                  {isEditMode
                    ? <><X size={13} weight="bold" /> Cancel Edit</>
                    : <><PencilSimple size={13} weight="bold" /> Edit Attendance</>}
                </button>
              </div>
            </div>

            {/* ── Search bar ── */}
            <div className="relative mb-3">
              <MagnifyingGlass
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID or role..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#6C20CA] bg-white"
              />
            </div>

            {/* ── Role filter pills ── */}
            <div className="flex gap-1 flex-wrap mb-3">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRole((prev) => (prev === r ? null : r))}
                  className={`text-xs font-medium px-3 py-1 rounded-full border cursor-pointer transition-colors
                    ${activeRole === r
                      ? "bg-[#E8F8EF] text-[#22C55E] border-[#22C55E]"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#22C55E] hover:text-[#22C55E]"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* ── Table ── */}
            <TableComponent
              columns={columns as any[]}
              tableData={currentTableData}
              height={isEditMode ? "38vh" : "48vh"}
            />

            {!isEditMode && <div className="pb-4" />}

            {/* ── Save / Cancel — edit mode only ── */}
            {isEditMode && (
              <div className="flex justify-center gap-4 mt-3 pb-2">
                <button
                  onClick={() => { setIsEditMode(false); setSelectAll(false); setSelectedRows(new Set()); }}
                  className="w-[200px] bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Save Attendance
                </button>
                <button
                  onClick={() => { setIsEditMode(false); setSelectAll(false); setSelectedRows(new Set()); setEditedTimes({}); }}
                  className="w-[200px] bg-[#EF4444] hover:bg-[#dc2626] text-white text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
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
