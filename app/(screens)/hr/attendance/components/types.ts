// ── Shared types & constants for Attendance module ───────────────────────────

export type ExtendedColumn = { title: React.ReactNode; key: string };

export type EditedTimes = Record<number, { checkIn: string; checkOut: string }>;

export const ROLE_FILTERS = [
  "College Admin",
  "Admin",
  "Faculty",
  "Finance Executive",
  "HR Manager",
  "Placement",
];

export const MARK_BUTTONS = [
  { label: "Mark Present", bg: "bg-[#22C55E]", hover: "hover:bg-[#16a34a]" },
  { label: "Mark Absent",  bg: "bg-[#EF4444]", hover: "hover:bg-[#dc2626]" },
  { label: "Mark Leave",   bg: "bg-[#60AEFF]", hover: "hover:bg-[#3b82f6]" },
  { label: "Mark Late",    bg: "bg-[#FFBE61]", hover: "hover:bg-[#f59e0b]" },
];

export const DEFAULT_STATUS = "Present";
