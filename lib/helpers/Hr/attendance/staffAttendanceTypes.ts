export const ROLE_DISPLAY_MAP: Record<string, string> = {
  CollegeAdmin: "College Admin",
  Admin: "Admin",
  Faculty: "Faculty",
  Finance: "Finance Executive",
  FinanceManager: "Finance Manager",
  CollegeHr: "HR Manager",
  Placement: "Placement",
  PlacementOfficer: "Placement",
  WellbeingExecutive: "Wellbeing Executive",
  WellbeingManager: "Wellbeing Manager",
  GroundStaff: "Ground Staff",
  SuperAdmin: "Super Admin",
};

export const EXCLUDED_ROLES = ["SuperAdmin", "Student", "Parent"];

// ── Types ─────────────────────────────────────────────────────────────────────

export type AttendanceStaffRow = {
  userId: number;
  identifierId: string | null;
  fullName: string;
  role: string;
  rawRole: string;
  attendanceDailyId: number | null;
  checkIn: string | null;
  checkOut: string | null;
  rawCheckIn: string | null;
  rawCheckOut: string | null;
  totalHours: string;
  status: string;
  lateByMinutes: number;
  earlyOutMinutes: number;
  classesTaken: number | null;
  hasAdjustment: boolean;
  reason: string | null;
};

export type GetAttendanceStaffParams = {
  collegeId: number;
  search?: string;
  page?: number;
  limit?: number;
  date?: string;
  role?: string | null;
  tabStatus?: string;
};

export type GetAttendanceStaffResult = {
  staff: AttendanceStaffRow[];
  totalCount: number;
};

export type AttendanceStatsResult = {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
};

export type SaveAttendanceParams = {
  attendanceDailyId: number | null;
  userId: number;
  checkIn: string;
  checkOut: string;
  reason: string;
  status?: string;
  collegeHrId: number;
  classesTaken?: number;
  rawCheckIn: string | null;
  rawCheckOut: string | null;
  date?: string;
};

export type BulkMarkParams = {
  userIds: number[];
  status: "Present" | "Absent" | "Leave" | "Late";
  collegeHrId: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const mins = parts[1].padStart(2, "0");
  const mer = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${mins} ${mer}`;
}

export function formatMinutes(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function todayDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function capitalise(s: string): string {
  if (!s) return "-";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function calcDerivedFields(
  checkInTime: string | null,
  checkOutTime: string | null,
  shiftStartStr: string,
  shiftEndStr: string,
  graceMinutes: number
): {
  totalMinutes: number | null;
  lateByMinutes: number;
  earlyOutMinutes: number;
} {
  const checkInMins = timeToMinutes(checkInTime);
  const checkOutMins = timeToMinutes(checkOutTime);

  let totalMinutes: number | null = null;
  if (checkInMins !== null && checkOutMins !== null) {
    totalMinutes = Math.max(0, checkOutMins - checkInMins);
  }

  const expectedInMins = timeToMinutes(shiftStartStr) || 540; // fallback 09:00
  const expectedOutMins = timeToMinutes(shiftEndStr) || 1020; // fallback 17:00

  const lateByMinutes =
    checkInMins !== null ? Math.max(0, checkInMins - expectedInMins - graceMinutes) : 0;

  const earlyOutMinutes =
    checkOutMins !== null ? Math.max(0, expectedOutMins - checkOutMins) : 0;

  return { totalMinutes, lateByMinutes, earlyOutMinutes };
}

export function buildTimeString(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) {
    throw new Error("Time is required");
  }

  const cleaned = timeStr.trim().toUpperCase().replace(/\s+/g, " ");

  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);

  let hours = 0;
  let minutes = 0;

  if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const mer = match12[3];
    if (mer === "PM" && hours !== 12) hours += 12;
    if (mer === "AM" && hours === 12) hours = 0;
  } else if (match24) {
    hours = parseInt(match24[1], 10);
    minutes = parseInt(match24[2], 10);
  } else {
    throw new Error(`Incomplete time: "${timeStr}". Enter HH:MM and select AM/PM`);
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time: "${timeStr}"`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export const buildTimestamp = buildTimeString;
