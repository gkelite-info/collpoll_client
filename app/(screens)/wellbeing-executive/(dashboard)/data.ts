import {
  CheckCircle,
  ClockCountdown,
  Siren,
  Warning,
} from "@phosphor-icons/react";

export const wellbeingFilters = {
  issueTypes: ["Infrastructure", "Students"],
  months: ["January", "February", "March", "April"],
};

export const issueStats = [
  {
    label: "This month total issues",
    value: 128,
    tone: "violet",
    icon: Warning,
  },
  {
    label: "High Priority",
    value: 18,
    tone: "rose",
    icon: Siren,
  },
  {
    label: "Pending",
    value: 32,
    tone: "amber",
    icon: ClockCountdown,
  },
  {
    label: "Resolved",
    value: 78,
    tone: "emerald",
    icon: CheckCircle,
  },
];

export const issueBreakdown = [
  { type: "Total Issues", value: 128, color: "#7C3AED" },
  { type: "Urgent", value: 18, color: "#FF1F1F" },
  { type: "Pending", value: 32, color: "#FDBA74" },
  { type: "Resolved", value: 78, color: "#43C17A" },
];

export const categories = [
  { name: "Water", value: 48 },
  { name: "Food", value: 38 },
  { name: "Electricity", value: 45 },
  { name: "Cleanliness", value: 30 },
  { name: "Plumbing", value: 42 },
];

export const executives = [
  {
    name: "Ankitha Sharma",
    id: "577748",
    image: "/female-fe.png",
  },
  {
    name: "Aaryan Guptha",
    id: "577748",
    image: "/male-faculty.png",
  },
  {
    name: "Shreya chatte",
    id: "577748",
    image: "/female-faculty.png",
  },
];

export type WellbeingExecutiveIssueScope = "college" | "hostel";

export type WellbeingExecutiveIssue = {
  id: string;
  scope: WellbeingExecutiveIssueScope;
  student: string;
  meta: string;
  issue: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  evidence: string;
  studentImage: string;
  block?: string;
  room?: string;
};

export const registeredIssueScopes: WellbeingExecutiveIssueScope[] = [
  "college",
  "hostel",
];

export const collegeIssues: WellbeingExecutiveIssue[] = [
  {
    id: "CLG-28939",
    scope: "college",
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "High",
    evidence: "classroom-projector-report.pdf",
    studentImage: "/female-student.png",
  },
  {
    id: "CLG-28940",
    scope: "college",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "High",
    evidence: "classroom-projector-report.pdf",
    studentImage: "/student-m.png",
  },
  {
    id: "CLG-28941",
    scope: "college",
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Lab system display flickering",
    description: "The display has been flickering during practical sessions.",
    category: "IT Support",
    priority: "Medium",
    evidence: "lab-display-issue.pdf",
    studentImage: "/rahul.png",
  },
];

export const hostelIssues: WellbeingExecutiveIssue[] = [
  {
    id: "HST-28939",
    scope: "hostel",
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "WiFi not working in Hostel Floor 3",
    description: "Internet connectivity is very poor or unavailable.",
    category: "Infrastructure",
    priority: "High",
    evidence: "hostel-wifi-report.pdf",
    studentImage: "/female-student.png",
    block: "A",
    room: "A-206",
  },
  {
    id: "HST-28940",
    scope: "hostel",
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "WiFi not working in Hostel Floor 3",
    description: "Internet connectivity is very poor or unavailable.",
    category: "Infrastructure",
    priority: "High",
    evidence: "hostel-wifi-report.pdf",
    studentImage: "/student-m.png",
    block: "B",
    room: "A-205",
  },
  {
    id: "HST-28941",
    scope: "hostel",
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "WiFi not working in Hostel Floor 3",
    description: "Internet connectivity is very poor or unavailable.",
    category: "Infrastructure",
    priority: "High",
    evidence: "hostel-wifi-report.pdf",
    studentImage: "/rahul.png",
    block: "A",
    room: "A-203",
  },
];

export const wellbeingAnnouncements = [
  {
    title: "Submit internal marks for all subjects before 25 Oct 2025.",
    professor: "By Stephen Jones",
    image: "/clip.png",
    imgHeight: "h-9",
    cardBg: "#E8F8EF",
    imageBg: "#CFF4E0",
    createdAt: "2026-05-13T09:00:00.000Z",
  },
  {
    title: "Upload final project abstracts by 1 Dec 2025.",
    professor: "By Stephen Jones",
    image: "/assignment.jpg",
    imgHeight: "h-9",
    cardBg: "#F0EDFF",
    imageBg: "#DDD6FE",
    createdAt: "2026-05-13T08:15:00.000Z",
  },
  {
    title: "Mid-semester exams scheduled from 5-10 Dec 2025",
    professor: "By Stephen Jones",
    image: "/exam.png",
    imgHeight: "h-9",
    cardBg: "#FFF7E6",
    imageBg: "#FFE7B8",
    createdAt: "2026-05-13T07:00:00.000Z",
  },
  {
    title: "College will remain closed on 26 Jan 2026.",
    professor: "By Stephen Jones",
    image: "/calendar-3d.png",
    imgHeight: "h-9",
    cardBg: "#F0EDFF",
    imageBg: "#DDD6FE",
    createdAt: "2026-05-13T04:00:00.000Z",
  },
  {
    title: "Placement drive registrations close on 28 Nov 2025.",
    professor: "By Stephen Jones",
    image: "/placement.png",
    imgHeight: "h-9",
    cardBg: "#E8F8EF",
    imageBg: "#CFF4E0",
    createdAt: "2026-05-13T01:00:00.000Z",
  },
];
