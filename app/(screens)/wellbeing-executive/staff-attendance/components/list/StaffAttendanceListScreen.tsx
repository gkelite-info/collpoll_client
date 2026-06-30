"use client";

import {
  CalendarBlank,
  CaretDown,
  CheckCircle,
  Clock,
  X,
  FloppyDisk,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  UserCircle,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import CardComponent from "@/app/utils/card";
import TableComponent from "@/app/utils/table/table";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Dispatch, SetStateAction } from "react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getInitials, type StaffAttendanceRecord, type StaffAttendanceStatus } from "../../data";
import {
  fetchCollegeTimingForDate,
  fetchGroundStaffAttendancesByDate,
  upsertGroundStaffAttendances,
  type CollegeTimingForDate,
  type GroundStaffAttendanceStatus,
} from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";

type StaffAttendanceListScreenProps = {
  records: StaffAttendanceRecord[];
  setRecords: Dispatch<SetStateAction<StaffAttendanceRecord[]>>;
  onViewProfile: (record: StaffAttendanceRecord) => void;
  onViewHistory: (record: StaffAttendanceRecord) => void;
  onViewAllStaff: () => void;
  onViewStatusStaff: (status: StaffAttendanceStatus) => void;
  markedBy?: number | null;
  collegeId?: number | null;
  isRecordsLoading?: boolean;
  recordsLoadVersion?: number;
  onSearchRecords?: (searchQuery: string) => Promise<void>;
};

const ITEMS_PER_PAGE = 4;

const statusClasses: Record<StaffAttendanceStatus, string> = {
  present: "text-[#10A66A]",
  absent: "text-[#EF4444]",
  late: "text-[#D97706]",
  leave: "text-[#2563EB]",
  not_marked: "text-[#64748B]",
};

const formatDateForDisplay = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "20 May 2025";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatDateForPill = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "29/06/2026";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const getTodayDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

type TimePeriod = "AM" | "PM";

const parseTimeValue = (value: string | undefined, defaultPeriod: TimePeriod) => {
  const normalizedValue = value?.trim() ?? "";
  const match = normalizedValue.match(/^(\d{1,2})\s*:\s*(\d{0,2})\s*(AM|PM)?$/i);

  return {
    hour: match?.[1] ?? "",
    minute: match?.[2] ?? "",
    period: (match?.[3]?.toUpperCase() as TimePeriod | undefined) ?? defaultPeriod,
  };
};

const sanitizeTimePart = (value: string, maxLength: number) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const formatTimeValue = (hour: string, minute: string, period: TimePeriod) => {
  if (!hour && !minute) {
    return "";
  }

  return `${hour}:${minute} ${period}`;
};

const getTimePeriod = (value: string | null | undefined, fallback: TimePeriod) => {
  const match = value?.trim().match(/\b(AM|PM)$/i);

  return (match?.[1]?.toUpperCase() as TimePeriod | undefined) ?? fallback;
};

const parseTimeToMinutes = (value: string) => {
  const match = value.trim().match(/^(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
};

const getBreakWindows = (timing: CollegeTimingForDate | null) => {
  if (!timing) {
    return [];
  }

  const lunchWindow =
    timing.lunchFrom && timing.lunchTo
      ? [{ startTime: timing.lunchFrom, endTime: timing.lunchTo }]
      : [];

  return [...lunchWindow, ...timing.breaks];
};

const calculateOverlapMinutes = (
  start: number,
  end: number,
  windowStart: number,
  windowEnd: number,
) => Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));

const calculateWorkHours = (
  checkIn: string,
  checkOut: string,
  timing: CollegeTimingForDate | null,
) => {
  const checkInMinutes = parseTimeToMinutes(checkIn);
  const checkOutMinutes = parseTimeToMinutes(checkOut);

  if (checkInMinutes === null || checkOutMinutes === null) {
    return "";
  }

  let totalMinutes =
    checkOutMinutes >= checkInMinutes
      ? checkOutMinutes - checkInMinutes
      : checkOutMinutes + 24 * 60 - checkInMinutes;
  const normalizedCheckOutMinutes =
    checkOutMinutes >= checkInMinutes ? checkOutMinutes : checkOutMinutes + 24 * 60;

  getBreakWindows(timing).forEach((breakWindow) => {
    const breakStart = parseTimeToMinutes(breakWindow.startTime);
    const breakEnd = parseTimeToMinutes(breakWindow.endTime);

    if (breakStart === null || breakEnd === null) {
      return;
    }

    const normalizedBreakEnd = breakEnd >= breakStart ? breakEnd : breakEnd + 24 * 60;
    totalMinutes -= calculateOverlapMinutes(
      checkInMinutes,
      normalizedCheckOutMinutes,
      breakStart,
      normalizedBreakEnd,
    );
  });

  totalMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const resolveSavedStatus = (
  status: StaffAttendanceStatus,
  checkIn: string,
  hasTime: boolean,
  timing: CollegeTimingForDate | null,
): GroundStaffAttendanceStatus | null => {
  if (status === "absent" || status === "leave") {
    return status;
  }

  const checkInMinutes = parseTimeToMinutes(checkIn);
  const shiftStartMinutes = timing?.isOpen ? parseTimeToMinutes(timing.openAt ?? "") : null;

  if (checkInMinutes !== null) {
    return shiftStartMinutes !== null && checkInMinutes > shiftStartMinutes ? "late" : "present";
  }

  if (status === "late") {
    return "late";
  }

  if (status === "present" || hasTime) {
    return "present";
  }

  return null;
};

export default function StaffAttendanceListScreen({
  records,
  setRecords,
  onViewProfile,
  onViewAllStaff,
  onViewStatusStaff,
  markedBy,
  collegeId,
  isRecordsLoading = false,
  recordsLoadVersion = 0,
  onSearchRecords,
}: StaffAttendanceListScreenProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isTimingLoading, setIsTimingLoading] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [collegeTiming, setCollegeTiming] = useState<CollegeTimingForDate | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(new Set());
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<StaffAttendanceRecord | null>(null);
  const [rowTimes, setRowTimes] = useState<
    Record<number, { checkIn: string; checkOut: string }>
  >({});
  const present = records.filter((record) => record.status === "present").length;
  const absent = records.filter((record) => record.status === "absent").length;
  const late = records.filter((record) => record.status === "late").length;
  const leave = records.filter((record) => record.status === "leave").length;
  const presentPercentage = records.length ? Math.round((present / records.length) * 100) : 0;
  const timingLabel = isTimingLoading
    ? "Loading college timing..."
    : collegeTiming?.isOpen
      ? `Shift time ${collegeTiming.openAt ?? "--"} to ${collegeTiming.closeAt ?? "--"}`
      : collegeTiming
        ? "College closed for selected day"
        : "College timing not configured";
  const filteredRows = useMemo(
    () =>
      records.filter((record) => {
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;

        return matchesStatus;
      }),
    [records, statusFilter],
  );
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const visibleRowIds = visibleRows.map((record) => record.id);
  const staffUserKey = useMemo(
    () => records.map((record) => record.userId).filter(Boolean).join(","),
    [records],
  );
  const recordsStatusKey = useMemo(
    () => records.map((record) => `${record.id}:${record.status}`).join("|"),
    [records],
  );
  const areAllVisibleRowsSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedStaffIds.has(id));
  const selectedRecordsForSave = useMemo(
    () => records.filter((record) => selectedStaffIds.has(record.id)),
    [records, selectedStaffIds],
  );
  const canSaveAttendance =
    selectedRecordsForSave.length > 0 &&
    selectedRecordsForSave.every((record) => {
      const checkIn = rowTimes[record.id]?.checkIn?.trim() ?? "";

      return parseTimeToMinutes(checkIn) !== null && record.status !== "not_marked";
    });
  const isTableLoading = isRecordsLoading || isAttendanceLoading;
  const isInitialScreenLoading = isTableLoading && !records.length && !searchQuery.trim();

  useEffect(() => {
    if (!collegeId || !selectedDate) {
      setCollegeTiming(null);
      return;
    }

    let cancelled = false;
    setIsTimingLoading(true);

    fetchCollegeTimingForDate(collegeId, selectedDate)
      .then((timing) => {
        if (!cancelled) {
          setCollegeTiming(timing);
        }
      })
      .catch((error) => {
        console.error("College timing fetch failed:", error);
        toast.error("Failed to load college timing.");
        if (!cancelled) {
          setCollegeTiming(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsTimingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collegeId, selectedDate]);

  useEffect(() => {
    if (!onSearchRecords) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentPage(1);
      setSelectedStaffIds(new Set());
      setEditingRowId(null);
      void onSearchRecords(searchQuery);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [onSearchRecords, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const staffUserIds = staffUserKey
      .split(",")
      .map(Number)
      .filter(Boolean);

    if (!selectedDate || !staffUserIds.length) {
      setRowTimes({});
      return;
    }

    let cancelled = false;
    setIsAttendanceLoading(true);

    fetchGroundStaffAttendancesByDate(staffUserIds, selectedDate)
      .then((attendances) => {
        if (cancelled) return;

        const attendanceByStaffId = new Map(
          attendances.map((attendance) => [attendance.staffId, attendance]),
        );
        const nextRowTimes: Record<number, { checkIn: string; checkOut: string }> = {};

        setRecords((current) =>
          current.map((record) => {
            const attendance = attendanceByStaffId.get(record.userId);

            if (!attendance) {
              return { ...record, status: "not_marked" };
            }

            nextRowTimes[record.id] = {
              checkIn: attendance.checkIn,
              checkOut: attendance.checkOut,
            };

            return { ...record, status: attendance.status };
          }),
        );
        setRowTimes(nextRowTimes);
      })
      .catch((error) => {
        console.error("Ground staff attendance fetch failed:", error);
        toast.error("Failed to load attendance.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsAttendanceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [recordsLoadVersion, selectedDate, setRecords, staffUserKey]);

  useEffect(() => {
    if (!collegeTiming) {
      return;
    }

    setRecords((current) => {
      let changed = false;
      const nextRecords = current.map((record) => {
        const checkIn = rowTimes[record.id]?.checkIn?.trim() ?? "";
        const checkOut = rowTimes[record.id]?.checkOut?.trim() ?? "";
        const resolvedStatus = resolveSavedStatus(
          record.status,
          checkIn,
          Boolean(checkIn || checkOut),
          collegeTiming,
        );

        if (!resolvedStatus || resolvedStatus === record.status) {
          return record;
        }

        changed = true;
        return { ...record, status: resolvedStatus };
      });

      return changed ? nextRecords : current;
    });
  }, [collegeTiming, recordsStatusKey, rowTimes, setRecords]);

  const toggleSelectAllVisibleRows = (checked: boolean) => {
    setSelectedStaffIds((current) => {
      const next = new Set(current);

      visibleRowIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });

      return next;
    });

    if (!checked) {
      setEditingRowId((current) =>
        current !== null && visibleRowIds.includes(current) ? null : current,
      );
    }
  };

  const toggleSelectRow = (recordId: number, checked: boolean) => {
    setSelectedStaffIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(recordId);
      } else {
        next.delete(recordId);
        setEditingRowId((current) => (current === recordId ? null : current));
      }

      return next;
    });
  };

  const updateCheckInTime = (record: StaffAttendanceRecord, value: string) => {
    setRowTimes((current) => ({
      ...current,
      [record.id]: {
        checkIn: value,
        checkOut: current[record.id]?.checkOut ?? record.history[0]?.checkOut ?? "",
      },
    }));

    const checkInMinutes = parseTimeToMinutes(value);
    const shiftStartMinutes = collegeTiming?.isOpen
      ? parseTimeToMinutes(collegeTiming.openAt ?? "")
      : null;

    setRecords((current) =>
      current.map((item) => {
        if (item.id !== record.id || item.status === "absent" || item.status === "leave") {
          return item;
        }

        if (checkInMinutes === null) {
          return item.status === "present" || item.status === "late"
            ? { ...item, status: "not_marked" }
            : item;
        }

        return {
          ...item,
          status:
            shiftStartMinutes !== null && checkInMinutes > shiftStartMinutes
              ? "late"
              : "present",
        };
      }),
    );
  };

  const columns = [
    {
      title: (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={areAllVisibleRowsSelected}
            onChange={(event) => toggleSelectAllVisibleRows(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#10A66A] focus:ring-[#10A66A]"
          />
        </div>
      ),
      key: "select",
    },
    { title: "STAFF MEMBER", key: "image" },
    { title: "EMPLOYEE ID", key: "employeeId" },
    { title: "DATE", key: "date" },
    { title: "CHECK-IN", key: "checkIn" },
    { title: "CHECK-OUT", key: "checkOut" },
    { title: "ATTENDANCE STATUS", key: "attendanceStatus" },
    { title: "ACTIONS", key: "actions" },
  ];
  const tableData = visibleRows.map((record) => {
    const isSelected = selectedStaffIds.has(record.id);

    return {
    select: (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedStaffIds.has(record.id)}
          onChange={(event) => toggleSelectRow(record.id, event.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#10A66A] focus:ring-[#10A66A]"
        />
      </div>
    ),
    image: (
      <div className="flex min-w-[180px] items-center gap-3 text-left">
        {record.image ? (
          <Image
            src={record.image}
            alt={record.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EAF0F7] text-[11px] font-extrabold text-[#0B66C3]">
            {getInitials(record.name)}
          </span>
        )}
        <span className="font-extrabold text-[#08244A]">{record.name}</span>
      </div>
    ),
    employeeId: <span className="font-semibold text-[#34425E]">{record.staffId}</span>,
    date: <span className="font-semibold text-[#34425E]">{formatDateForDisplay(selectedDate)}</span>,
    checkIn:
      editingRowId === record.id && isSelected ? (
        <TimeEditor
          value={rowTimes[record.id]?.checkIn ?? record.history[0]?.checkIn ?? ""}
          defaultPeriod={getTimePeriod(collegeTiming?.openAt, "AM")}
          onChange={(value) => updateCheckInTime(record, value)}
        />
      ) : (
        <TimeBox
          value={rowTimes[record.id]?.checkIn ?? record.history[0]?.checkIn ?? "-- : --"}
          onClick={() => undefined}
          disabled={true}
        />
      ),
    checkOut:
      editingRowId === record.id && isSelected ? (
        <TimeEditor
          value={rowTimes[record.id]?.checkOut ?? record.history[0]?.checkOut ?? ""}
          defaultPeriod={getTimePeriod(collegeTiming?.closeAt, "PM")}
          onChange={(value) =>
            setRowTimes((current) => ({
              ...current,
              [record.id]: {
                checkIn: current[record.id]?.checkIn ?? record.history[0]?.checkIn ?? "",
                checkOut: value,
              },
            }))
          }
        />
      ) : (
        <TimeBox
          value={rowTimes[record.id]?.checkOut ?? record.history[0]?.checkOut ?? "-- : --"}
          onClick={() => undefined}
          disabled={true}
        />
      ),
    attendanceStatus: (
      <StatusDropdown
        value={record.status}
        disabled={!isSelected}
        onChange={(status) =>
          setRecords((current) =>
            current.map((item) =>
              item.id === record.id ? { ...item, status } : item,
            ),
          )
        }
      />
    ),
    actions: (
      <div className="mx-auto grid w-[112px] grid-cols-3 place-items-center gap-2">
        <button
          type="button"
          onClick={() => onViewProfile(record)}
          title="Open profile"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#0B66C3] transition-transform hover:scale-110 hover:bg-[#EEF6FF]"
        >
          <UserCircle size={24} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isSelected) return;
            setEditingRowId((current) => {
              if (current !== record.id) {
                return record.id;
              }

              setSelectedStaffIds((selected) => {
                const next = new Set(selected);
                next.delete(record.id);
                return next;
              });

              return null;
            });
          }}
          disabled={!isSelected}
          title="Edit attendance time"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#94A3B8] transition-transform hover:scale-110 hover:bg-[#F3F6FA] hover:text-[#0B66C3] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-[#94A3B8]"
        >
          <PencilSimple size={20} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isSelected) return;
            setDeleteRecord(record);
          }}
          disabled={!isSelected}
          title="Delete attendance row"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#94A3B8] transition-transform hover:scale-110 hover:bg-[#FFF2F2] hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-[#94A3B8]"
        >
          <Trash size={20} weight="bold" />
        </button>
      </div>
    ),
  };
  });

  const markAllPresent = () => {
    if (!selectedStaffIds.size) {
      toast.error("Please select at least one row.");
      return;
    }

    setRecords((current) =>
      current.map((record) => {
        return selectedStaffIds.has(record.id) ? { ...record, status: "present" } : record;
      }),
    );
  };

  const saveAttendance = async () => {
    if (!selectedStaffIds.size) {
      toast.error("Please select at least one row.");
      return;
    }

    if (!canSaveAttendance) {
      toast.error("Please add check-in time and attendance status for selected rows.");
      return;
    }

    const selectedRecords = selectedRecordsForSave;
    const payloads = selectedRecords.flatMap((record) => {
      const checkIn = rowTimes[record.id]?.checkIn?.trim() ?? "";
      const checkOut = rowTimes[record.id]?.checkOut?.trim() ?? "";
      const hasTime = Boolean(checkIn || checkOut);
      const status = resolveSavedStatus(record.status, checkIn, hasTime, collegeTiming);

      if (!status) {
        return [];
      }

      return [
        {
          staffId: record.userId,
          date: selectedDate,
          status,
          checkIn,
          checkOut,
          workHours: calculateWorkHours(checkIn, checkOut, collegeTiming),
          markedBy,
        },
      ];
    });

    if (!payloads.length) {
      toast.error("Please mark at least one attendance row.");
      return;
    }

    try {
      setIsSavingAttendance(true);
      await upsertGroundStaffAttendances(payloads);
      setEditingRowId(null);
      setSelectedStaffIds(new Set());
      setRecords((current) =>
        current.map((record) => {
          const savedPayload = payloads.find((payload) => payload.staffId === record.userId);

          return savedPayload ? { ...record, status: savedPayload.status } : record;
        }),
      );
      toast.success("Attendance saved successfully.");
    } catch (error) {
      console.error("Ground staff attendance save failed:", error);
      toast.error("Failed to save attendance.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[24px] font-extrabold text-[#08244A]">Attendance Management</h1>
            <p className="text-[12px] font-medium text-[#64748B]">
              Monitor and manage attendance for all security personnel across the campus.
            </p>
          </div>
        </div>

        {isInitialScreenLoading ? (
          <StaffAttendanceListShimmer />
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Staff"
                value={String(records.length).padStart(2, "0")}
                icon={<UsersThree size={22} weight="fill" />}
                tone="navy"
                onClick={onViewAllStaff}
              />
              <StatCard
                title="Present"
                value={String(present).padStart(2, "0")}
                icon={<CheckCircle size={23} weight="bold" />}
                tone="green"
                onClick={() => onViewStatusStaff("present")}
              />
              <StatCard
                title="Absent"
                value={String(absent).padStart(2, "0")}
                icon={<XCircle size={23} weight="bold" />}
                tone="red"
                onClick={() => onViewStatusStaff("absent")}
              />
              <StatCard
                title="Late Arrivals"
                value={String(late).padStart(2, "0")}
                icon={<Clock size={23} weight="bold" />}
                tone="amber"
                onClick={() => onViewStatusStaff("late")}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-lg border border-[#D7DFEC] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E4E9F1] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[15px] font-extrabold text-[#08244A]">Attendance Control Panel</h2>
                <p className="text-[11px] font-medium text-[#8A9AB5]">
                  {timingLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  disabled={!selectedStaffIds.size || isRecordsLoading || isSavingAttendance}
                  className="h-9 cursor-pointer rounded-md border border-[#2166D1] px-3 text-[12px] font-bold text-[#2166D1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={saveAttendance}
                  disabled={!canSaveAttendance || isSavingAttendance || isRecordsLoading}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#10A66A] px-3 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FloppyDisk size={15} weight="bold" />
                  {isSavingAttendance ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-b border-[#E4E9F1] p-4 md:grid-cols-[1fr_160px_160px]">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                isLoading={isRecordsLoading}
              />
              {isTableLoading ? (
                <div className="h-9 animate-pulse rounded-lg bg-[#DDF4E9]" />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#DDF4E9] px-3 text-[13px] font-extrabold text-[#36C982] transition-colors hover:bg-[#CFF0DF]"
                >
                  <CalendarBlank size={16} weight="fill" />
                  {formatDateForPill(selectedDate)}
                </button>
              )}
              {isTableLoading ? (
                <div className="h-9 animate-pulse rounded-md bg-[#EAF0F7]" />
              ) : (
                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "All Statuses", value: "all" },
                    { label: "Present", value: "present" },
                    { label: "Absent", value: "absent" },
                    { label: "Late", value: "late" },
                    { label: "Leave", value: "leave" },
                    { label: "Not Marked", value: "not_marked" },
                  ]}
                />
              )}
            </div>

            <div className="[&>div]:mt-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&_th:nth-child(1)]:w-[48px] [&_td:nth-child(1)]:w-[48px] [&_th:nth-child(1)]:px-2 [&_td:nth-child(1)]:px-2 [&_th:nth-child(2)]:text-left [&_th:nth-child(2)]:pl-8 [&_th]:bg-[#F3F6FA] [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:text-[#5B6475] [&_td]:py-3 [&_td]:text-[12px]">
              <TableComponent
                columns={columns}
                tableData={tableData}
                tableClassName="min-w-[1296px] table-fixed"
                height="none"
                isLoading={isTableLoading}
                stickyHeader={false}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredRows.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>

          <TodaySummary
            present={present}
            absent={absent}
            late={late}
            leave={leave}
            presentPercentage={presentPercentage}
          />
            </div>
          </>
        )}
      </section>
      <CalendarModal
        isOpen={isCalendarOpen}
        selectedDate={selectedDate}
        onClose={() => setIsCalendarOpen(false)}
        onChange={(date) => {
          setSelectedDate(date);
          setIsCalendarOpen(false);
        }}
      />
      <DeleteAttendanceModal
        record={deleteRecord}
        onClose={() => setDeleteRecord(null)}
        onDelete={() => {
          if (!deleteRecord) return;

          setRecords((current) => current.filter((record) => record.id !== deleteRecord.id));
          setSelectedStaffIds((current) => {
            const next = new Set(current);
            next.delete(deleteRecord.id);
            return next;
          });
          setRowTimes((current) => {
            const next = { ...current };
            delete next[deleteRecord.id];
            return next;
          });
          setEditingRowId((current) => (current === deleteRecord.id ? null : current));
          toast.success(`${deleteRecord.name} deleted successfully.`);
          setDeleteRecord(null);
        }}
      />
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone: "navy" | "green" | "red" | "amber";
  onClick?: () => void;
}) {
  const toneClass = {
    navy: "bg-[#EEF3FB] text-[#08244A]",
    green: "bg-[#DDF9EC] text-[#10A66A]",
    red: "bg-[#FFEAEA] text-[#EF4444]",
    amber: "bg-[#FFF0D6] text-[#F59E0B]",
  }[tone];

  return (
    <CardComponent
      icon={<span className={`grid place-items-center rounded-md px-2 py-2 ${toneClass}`}>{icon}</span>}
      value={<span className="text-[10px] font-extrabold uppercase tracking-wide text-[#34425E]">{title}</span>}
      label={<span className="text-[22px] font-extrabold leading-none text-[#08244A]">{value}</span>}
      style="min-h-[112px] !h-[112px] border border-[#D2DAE7] bg-white px-6 py-4 shadow-sm"
      iconBgColor="transparent"
      iconColor="inherit"
      onClick={onClick}
    />
  );
}

function StaffAttendanceListShimmer() {
  return (
    <div className="mt-5 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-[112px] flex-col rounded-lg border border-[#D2DAE7] bg-white p-5"
          >
            <div className="h-[38px] w-[38px] rounded-md bg-[#EAF0F7]" />
            <div className="mt-4 space-y-3">
              <div className="h-3 w-24 rounded bg-[#EAF0F7]" />
              <div className="h-5 w-12 rounded bg-[#DDE5F0]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-lg border border-[#D7DFEC] bg-white">
          <div className="flex items-center justify-between border-b border-[#E4E9F1] p-4">
            <div>
              <div className="h-4 w-44 rounded bg-[#DDE5F0]" />
              <div className="mt-2 h-3 w-36 rounded bg-[#EAF0F7]" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-32 rounded-md bg-[#EAF0F7]" />
              <div className="h-9 w-36 rounded-md bg-[#DDE5F0]" />
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#E4E9F1] p-4 md:grid-cols-[1fr_160px_160px]">
            <div className="h-9 rounded-md bg-[#EAF0F7]" />
            <div className="h-9 rounded-lg bg-[#DDF4E9]" />
            <div className="h-9 rounded-md bg-[#EAF0F7]" />
          </div>

          <div className="h-12 bg-[#F3F6FA]" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[48px_1.4fr_1fr_1fr_1fr_1fr_1.2fr_1fr] items-center gap-4 border-b border-[#E4E9F1] px-4 py-5"
            >
              <div className="mx-auto h-4 w-4 rounded bg-[#DDE5F0]" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#DDE5F0]" />
                <div className="h-4 w-24 rounded bg-[#EAF0F7]" />
              </div>
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-4 rounded bg-[#EAF0F7]" />
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-[#D7DFEC] bg-white p-5">
          <div className="mx-auto h-32 w-32 rounded-full bg-[#EAF0F7]" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 rounded bg-[#EAF0F7]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-[#D7DFEC] px-3 text-[11px] font-semibold text-[#8A9AB5]">
      <MagnifyingGlass size={15} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Name or ID..."
        className="h-full min-w-0 flex-1 bg-transparent text-[#34425E] outline-none placeholder:text-[#8A9AB5]"
      />
      {isLoading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D7DFEC] border-t-[#43C17A]" />
      ) : null}
    </div>
  );
}

function CalendarModal({
  isOpen,
  selectedDate,
  onClose,
  onChange,
}: {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
  onChange: (date: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08244A]/30 px-4">
      <div className="w-full max-w-[320px] rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#08244A]">Select Date</h3>
            <p className="text-[11px] font-semibold text-[#8A9AB5]">
              Choose attendance date
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-[#5B6475] hover:bg-[#F1F4F8]"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-[#D7DFEC] px-3 text-[13px] font-semibold text-[#34425E] outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]"
        />
      </div>
    </div>
  );
}

function DeleteAttendanceModal({
  record,
  onClose,
  onDelete,
}: {
  record: StaffAttendanceRecord | null;
  onClose: () => void;
  onDelete: () => void;
}) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[430px] rounded-3xl bg-white px-8 py-8 text-center shadow-2xl">
        <div className="mx-auto grid h-[78px] w-[78px] place-items-center rounded-full bg-[#FFF1F1]">
          <div className="grid h-[56px] w-[56px] place-items-center rounded-full bg-[#FFE8E8] text-[#FF0000]">
            <Trash size={28} weight="bold" />
          </div>
        </div>
        <h3 className="mt-5 text-[24px] font-extrabold leading-tight text-[#111827]">
          Delete attendance?
        </h3>
        <p className="mx-auto mt-4 max-w-[330px] text-[16px] font-medium leading-7 text-[#6B7280]">
          Are you sure you want to delete <span className="font-extrabold text-[#34425E]">{record.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] cursor-pointer rounded-xl border border-[#D7DFEC] bg-white px-4 text-[16px] font-extrabold text-[#34425E] transition-colors hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-[52px] cursor-pointer rounded-xl bg-[#172B55] px-4 text-[16px] font-extrabold text-white shadow-lg transition-colors hover:bg-[#0F1F42]"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full cursor-pointer appearance-none rounded-md border border-[#D7DFEC] bg-white px-3 pr-8 text-[11px] font-bold text-[#8A9AB5] outline-none transition-colors hover:border-[#B8C4D6] focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9AB5]"
      />
    </div>
  );
}

function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: {
  value: StaffAttendanceStatus;
  onChange: (value: StaffAttendanceStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative mx-auto w-[130px]">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as StaffAttendanceStatus)}
        className={`h-9 w-full cursor-pointer appearance-none rounded-md border border-[#D7DFEC] bg-white px-3 pr-8 text-[12px] font-extrabold outline-none transition-colors hover:border-[#B8C4D6] focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] disabled:cursor-not-allowed disabled:bg-[#F8FAFC] ${statusClasses[value]}`}
      >
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="late">Late</option>
        <option value="leave">Leave</option>
        <option value="not_marked">Not Marked</option>
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9AB5]"
      />
    </div>
  );
}

function TimeBox({
  value,
  onClick,
  disabled = false,
}: {
  value: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const hasValue = value !== "-- : --";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`mx-auto inline-flex h-9 w-[96px] cursor-pointer items-center justify-center rounded-md border border-[#D7DFEC] bg-white px-2 text-[12px] font-semibold transition-colors hover:border-[#43C17A] hover:bg-[#F8FFFB] focus:border-[#43C17A] focus:outline-none focus:ring-1 focus:ring-[#43C17A] disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:hover:border-[#D7DFEC] ${
        hasValue
          ? "text-[#1F2937] disabled:text-[#1F2937]"
          : "text-[#94A3B8] disabled:text-[#94A3B8]"
      }`}
      title="Edit attendance time"
    >
      {value}
    </button>
  );
}

function TimeEditor({
  value,
  defaultPeriod,
  onChange,
}: {
  value: string;
  defaultPeriod: TimePeriod;
  onChange: (value: string) => void;
}) {
  const { hour, minute, period } = parseTimeValue(value, defaultPeriod);

  const updateTime = (nextHour: string, nextMinute: string, nextPeriod: TimePeriod) => {
    onChange(formatTimeValue(nextHour, nextMinute, nextPeriod));
  };

  return (
    <div className="mx-auto inline-flex h-9 w-[132px] items-center justify-center rounded-md border border-[#43C17A] bg-white px-2 text-[12px] font-semibold text-[#34425E] ring-1 ring-[#43C17A]">
      <input
        type="text"
        inputMode="numeric"
        value={hour}
        placeholder="HH"
        onChange={(event) =>
          updateTime(sanitizeTimePart(event.target.value, 2), minute, period)
        }
        className="h-full w-[28px] bg-transparent text-center font-semibold outline-none placeholder:text-[#94A3B8]"
      />
      <span className="px-0.5 text-[#34425E]">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={minute}
        placeholder="MM"
        onChange={(event) =>
          updateTime(hour, sanitizeTimePart(event.target.value, 2), period)
        }
        className="h-full w-[28px] bg-transparent text-center font-semibold outline-none placeholder:text-[#94A3B8]"
      />
      <span className="mx-1 h-5 w-px bg-[#D7DFEC]" />
      <select
        value={period}
        onChange={(event) => updateTime(hour, minute, event.target.value as TimePeriod)}
        className="h-full cursor-pointer appearance-none bg-transparent text-[11px] font-extrabold text-[#34425E] outline-none"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function TodaySummary({
  present,
  absent,
  late,
  leave,
  presentPercentage,
}: {
  present: number;
  absent: number;
  late: number;
  leave: number;
  presentPercentage: number;
}) {
  return (
    <div className="rounded-lg border border-[#D7DFEC] bg-white p-5">
      <h3 className="text-[13px] font-extrabold text-[#08244A]">Today&apos;s Summary</h3>
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-5">
        <div className="grid h-36 w-36 place-items-center rounded-full border-[10px] border-[#18B978] text-center">
          <div>
            <p className="text-[30px] font-extrabold leading-none text-[#08244A]">
              {presentPercentage}%
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase text-[#6B7280]">Present</p>
          </div>
        </div>
        <div className="w-full space-y-3 text-[12px] font-semibold text-[#5B6475]">
          <Legend color="bg-[#18B978]" label="Present" value={`${present} Personnel`} />
          <Legend color="bg-[#EF4444]" label="Absent" value={`${absent} Personnel`} />
          <Legend color="bg-[#F59E0B]" label="Late" value={`${late} Personnel`} />
          <Legend color="bg-[#2563EB]" label="Leave" value={`${leave} Personnel`} />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-extrabold text-[#08244A]">{value}</span>
    </div>
  );
}
