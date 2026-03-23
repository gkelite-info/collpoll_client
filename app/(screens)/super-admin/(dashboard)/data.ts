import { Building2, Users } from "lucide-react";

// --- TYPES ---
export interface StatCardData {
  title: string;
  value: string | number;
  bgColor: string;
  iconBg: string;
  textColor: string;
  icon: React.ElementType;
}

export interface CollegeRowData {
  name: string;
  code: string;
  totalUsers: string;
  activeUsers: string;
  inactiveUsers: string;
}

export interface UserRegistrationData {
  name: string;
  value: number;
  max: number;
}

export interface EventData {
  title: string;
  date: string;
}

// --- MOCK DATA ---
export const MOCK_STAT_CARDS: StatCardData[] = [
  {
    title: "Total Colleges",
    value: 24,
    bgColor: "bg-[#ebe4ff]",
    iconBg: "bg-[#7b5ef0]",
    textColor: "text-[#7b5ef0]",
    icon: Building2,
  },
  {
    title: "Total Users",
    value: "12,450",
    bgColor: "bg-[#e5ffe9]",
    iconBg: "bg-[#3ec465]",
    textColor: "text-[#3ec465]",
    icon: Users,
  },
  {
    title: "Deactivated",
    value: 220,
    bgColor: "bg-[#ffeae9]",
    iconBg: "bg-[#fc3c3c]",
    textColor: "text-[#fc3c3c]",
    icon: Users,
  },
  {
    title: "New Registrations",
    value: 38,
    bgColor: "bg-[#dceeff]",
    iconBg: "bg-[#5da7ff]",
    textColor: "text-[#5da7ff]",
    icon: Users,
  },
  {
    title: "Past Users",
    value: "12,450",
    bgColor: "bg-[#ffffe0]",
    iconBg: "bg-[#f5d000]",
    textColor: "text-[#dcb100]",
    icon: Users,
  },
];

export const MOCK_COLLEGE_TABLE: CollegeRowData[] = [
  {
    name: "Mallareddy Engg College",
    code: "MRCE",
    totalUsers: "1,240",
    activeUsers: "1,180",
    inactiveUsers: "60",
  },
  {
    name: "Gokaraju Rangaraju Inst..",
    code: "GRIET",
    totalUsers: "1,120",
    activeUsers: "1,050",
    inactiveUsers: "40",
  },
  {
    name: "CMR College of Enginee..",
    code: "CMRCET",
    totalUsers: "1,340",
    activeUsers: "1,290",
    inactiveUsers: "70",
  },
  {
    name: "CVR College of Enginee..",
    code: "CVRCE",
    totalUsers: "980",
    activeUsers: "940",
    inactiveUsers: "50",
  },
  {
    name: "Guru Nanak Institute of...",
    code: "GNIT",
    totalUsers: "890",
    activeUsers: "850",
    inactiveUsers: "40",
  },
  {
    name: "Mallareddy Engg College",
    code: "MRCE",
    totalUsers: "1,240",
    activeUsers: "1,180",
    inactiveUsers: "60",
  },
  {
    name: "Gokaraju Rangaraju Inst..",
    code: "GRIET",
    totalUsers: "1,120",
    activeUsers: "1,050",
    inactiveUsers: "40",
  },
  {
    name: "CMR College of Enginee..",
    code: "CMRCET",
    totalUsers: "1,340",
    activeUsers: "1,290",
    inactiveUsers: "70",
  },
  {
    name: "CVR College of Enginee..",
    code: "CVRCE",
    totalUsers: "980",
    activeUsers: "940",
    inactiveUsers: "50",
  },
  {
    name: "Guru Nanak Institute of...",
    code: "GNIT",
    totalUsers: "890",
    activeUsers: "850",
    inactiveUsers: "40",
  },
];

export const MOCK_REGISTRATIONS: UserRegistrationData[] = [
  { name: "SNIST", value: 1910, max: 2000 },
  { name: "ANURAG", value: 1670, max: 2000 },
  { name: "VNRVJ", value: 1450, max: 2000 },
  { name: "MRCE", value: 1560, max: 2000 },
  { name: "KMIT", value: 1240, max: 2000 },
  { name: "LORDS", value: 760, max: 2000 },
  { name: "SNIST", value: 1910, max: 2000 },
];

export const MOCK_EVENTS: EventData[] = [
  { title: "CollPoll System Update", date: "Jan 14, 3:00 PM" },
  { title: "2 Colleges Pending Verification", date: "Jan 27, 1:00 PM" },
  { title: "New College Onboarding – GRIET", date: "Jan 27, 2:00 PM" },
  { title: "Monthly Reports Due", date: "Jan 14, 3:00 PM" },
  { title: "CollPoll Maintenance Window", date: "Jan 27, 2:00 PM" },
  { title: "Monthly Reports Due", date: "Jan 27, 3:00 PM" },
  { title: "CollPoll Maintenance Window", date: "Jan 27, 4:00 PM" },
  { title: "CollPoll Maintenance Window", date: "Jan 27, 4:00 PM" },
];

// --- TYPES ---
export interface StatisticsData {
  name: string;
  value: number | string;
  color: string;
}

export interface ActivityData {
  title: string;
  description: string;
  time: string;
}

// --- MOCK DATA ---
export const MOCK_STATISTICS: StatisticsData[] = [
  { name: "Total Colleges", value: 24, color: "#7c5ef2" }, // Purple
  { name: "Total Users", value: "12,450", color: "#40c267" }, // Green
  { name: "Deactivated", value: 220, color: "#fc3b3b" }, // Red
  { name: "New Registrations", value: 38, color: "#5ea7ff" }, // Blue
  { name: "Past Users", value: "12,450", color: "#fce414" }, // Yellow
];

export const MOCK_ACTIVITIES: ActivityData[] = [
  {
    title: "Mallareddy Engg College",
    description: "12 new students registered",
    time: "2 mins ago",
  },
  {
    title: "VNR Vignana Jyothi College",
    description: "3 new faculty members joined",
    time: "2 mins ago",
  },
  {
    title: "Gokaraju Rangaraju Institute",
    description: "8 users activated",
    time: "2 mins ago",
  },
  {
    title: "KMIT College",
    description: "3 user accounts deactivated",
    time: "2 mins ago",
  },
  {
    title: "KMIT College",
    description: "1 new admin added",
    time: "2 mins ago",
  },
];
