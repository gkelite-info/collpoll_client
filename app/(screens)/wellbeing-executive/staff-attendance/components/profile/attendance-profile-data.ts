export type AttendanceMonthKey = `${number}-${string}`;

export type AttendanceMonthOption = {
  label: string;
  value: AttendanceMonthKey;
};

export type AttendanceRecordRow = {
  date: string;
  day: string;
  status: "Present" | "Absent";
  remarks: string;
};

export type AttendanceMonthData = {
  title: string;
  daysInMonth: number;
  absentDays: number[];
  blankDays: number[];
  rows: AttendanceRecordRow[];
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const getCurrentMonthKey = (): AttendanceMonthKey => {
  const date = new Date();
  return createMonthKey(date.getFullYear(), date.getMonth());
};

export const getAttendanceMonthOptions = (
  year = new Date().getFullYear(),
): AttendanceMonthOption[] =>
  monthNames.map((month, index) => ({
    label: `${month} ${year}`,
    value: createMonthKey(year, index),
  }));

export const getAttendanceMonthData = (
  monthKey: AttendanceMonthKey,
): AttendanceMonthData => {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const absentDays = buildPatternDays(daysInMonth, [3, 6, 14, 22, 27]);
  const blankDays = buildPatternDays(daysInMonth, [7, 13, 20, 21, 28]);

  return {
    title: `${monthNames[monthIndex]} ${year}`,
    daysInMonth,
    absentDays,
    blankDays,
    rows: buildTableRows(year, monthIndex, daysInMonth, absentDays),
  };
};

export const getAdjacentMonthKey = (
  monthKey: AttendanceMonthKey,
  direction: -1 | 1,
): AttendanceMonthKey => {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const nextIndex = Math.min(11, Math.max(0, monthIndex + direction));
  return createMonthKey(year, nextIndex);
};

function createMonthKey(year: number, monthIndex: number): AttendanceMonthKey {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function parseMonthKey(monthKey: AttendanceMonthKey) {
  const [yearValue, monthValue] = monthKey.split("-");
  return {
    year: Number(yearValue),
    monthIndex: Math.max(0, Math.min(11, Number(monthValue) - 1)),
  };
}

function buildPatternDays(daysInMonth: number, days: number[]) {
  return days.filter((day) => day <= daysInMonth);
}

function buildTableRows(
  year: number,
  monthIndex: number,
  daysInMonth: number,
  absentDays: number[],
): AttendanceRecordRow[] {
  const rowsToShow = Math.min(6, daysInMonth);

  return Array.from({ length: rowsToShow }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, monthIndex, day);
    const isAbsent = absentDays.includes(day);

    return {
      date: `${String(day).padStart(2, "0")} ${shortMonthNames[monthIndex]} ${year}`,
      day: dayNames[date.getDay()],
      status: isAbsent ? "Absent" : "Present",
      remarks: isAbsent ? (day % 3 === 0 ? "Uninformed" : "Sick") : "-",
    };
  });
}
