export type StaffAttendanceStatus = "present" | "absent" | "late" | "not_marked";

export type StaffAttendanceLog = {
  date: string;
  checkIn: string;
  checkOut: string;
  status: StaffAttendanceStatus;
  workHours: string;
};

export type StaffAttendanceRecord = {
  id: number;
  staffId: string;
  name: string;
  role: string;
  status: StaffAttendanceStatus;
  designation: string;
  department: "Safety and Security";
  shift: string;
  joiningDate: string;
  reportingTo: string;
  phone: string;
  email: string;
  address: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  imageSeed: number;
  image?: string;
  history: StaffAttendanceLog[];
};

const securityHistory: StaffAttendanceLog[] = [
  { date: "15 May 2025", checkIn: "08:02 AM", checkOut: "04:30 PM", status: "present", workHours: "8h 28m" },
  { date: "14 May 2025", checkIn: "08:15 AM", checkOut: "04:10 PM", status: "late", workHours: "7h 55m" },
  { date: "13 May 2025", checkIn: "07:55 AM", checkOut: "04:45 PM", status: "present", workHours: "8h 50m" },
  { date: "12 May 2025", checkIn: "-- : --", checkOut: "-- : --", status: "absent", workHours: "0h 0m" },
  { date: "11 May 2025", checkIn: "08:00 AM", checkOut: "04:00 PM", status: "present", workHours: "8h 0m" },
];

export const staffAttendanceRecords: StaffAttendanceRecord[] = [
  {
    id: 1,
    staffId: "SEC001",
    name: "Ravi Kumar",
    role: "Ground Staff",
    status: "present",
    designation: "Watchman",
    department: "Safety and Security",
    shift: "Morning Shift",
    joiningDate: "15 Jan 2024",
    reportingTo: "Safety Executive",
    phone: "+91 9876543221",
    email: "ravi.security@college.edu",
    address: "Gate 1, Main Campus",
    totalWorkingDays: 26,
    presentDays: 24,
    absentDays: 2,
    lateDays: 1,
    attendanceRate: 92,
    imageSeed: 12,
    history: securityHistory,
  },
  {
    id: 2,
    staffId: "SEC002",
    name: "Ramesh",
    role: "Ground Staff",
    status: "present",
    designation: "Security Guard",
    department: "Safety and Security",
    shift: "Evening Shift",
    joiningDate: "22 Feb 2024",
    reportingTo: "Safety Executive",
    phone: "+91 9876543245",
    email: "ramesh.security@college.edu",
    address: "Library Block",
    totalWorkingDays: 26,
    presentDays: 24,
    absentDays: 2,
    lateDays: 0,
    attendanceRate: 92,
    imageSeed: 14,
    history: securityHistory,
  },
  {
    id: 3,
    staffId: "SEC003",
    name: "Suresh",
    role: "Ground Staff",
    status: "absent",
    designation: "Bouncer",
    department: "Safety and Security",
    shift: "Event Shift",
    joiningDate: "10 Mar 2024",
    reportingTo: "Safety Executive",
    phone: "+91 9876543278",
    email: "suresh.security@college.edu",
    address: "Auditorium",
    totalWorkingDays: 26,
    presentDays: 21,
    absentDays: 5,
    lateDays: 2,
    attendanceRate: 81,
    imageSeed: 18,
    history: securityHistory,
  },
  {
    id: 4,
    staffId: "SEC004",
    name: "Mahesh",
    role: "Ground Staff",
    status: "late",
    designation: "Watchman",
    department: "Safety and Security",
    shift: "Night Shift",
    joiningDate: "05 Apr 2024",
    reportingTo: "Safety Executive",
    phone: "+91 9876543212",
    email: "mahesh.security@college.edu",
    address: "Hostel Gate",
    totalWorkingDays: 26,
    presentDays: 22,
    absentDays: 3,
    lateDays: 3,
    attendanceRate: 85,
    imageSeed: 21,
    history: securityHistory,
  },
  {
    id: 5,
    staffId: "SEC005",
    name: "Naresh",
    role: "Ground Staff",
    status: "present",
    designation: "Security Guard",
    department: "Safety and Security",
    shift: "Morning Shift",
    joiningDate: "18 Apr 2024",
    reportingTo: "Safety Executive",
    phone: "+91 9876543298",
    email: "naresh.security@college.edu",
    address: "Admin Block",
    totalWorkingDays: 26,
    presentDays: 23,
    absentDays: 2,
    lateDays: 1,
    attendanceRate: 88,
    imageSeed: 25,
    history: securityHistory,
  },
];

export const securityDirectoryRows = Array.from({ length: 12 }, (_, index) => {
  const base = staffAttendanceRecords[index % staffAttendanceRecords.length];
  return {
    ...base,
    id: index + 1,
    staffId: `SEC${String(index + 1).padStart(3, "0")}`,
  };
});

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
