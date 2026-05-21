import {
  CheckCircle,
  Warning,
  ListChecksIcon,
  ClockCountdownIcon,
} from "@phosphor-icons/react";

export const managerFilters = {
  issueTypes: ["Infrastructure", "Students"],
  months: ["January", "February", "March", "April"],
};

export const managerIssueStats = [
  {
    label: "This month total issues",
    value: 140,
    tone: "violet",
    icon: ListChecksIcon,
    route: "total"
  },
  {
    label: "High Priority",
    value: 20,
    tone: "rose",
    icon: ClockCountdownIcon,
    route: "high"
  },
  {
    label: "Pending",
    value: 20,
    tone: "amber",
    icon: Warning,
    route:"pending"
  },
  {
    label: "Resolved",
    value: 100,
    tone: "emerald",
    icon: CheckCircle,
    route:"resolved"
  },
];

export const managerIssueBreakdown = [
  { type: "Total Issues", value: 100, color: "#7C3AED" },
  { type: "Urgent", value: 20, color: "#FF1F1F" },
  { type: "Pending", value: 20, color: "#FDBA74" },
  { type: "Resolved", value: 60, color: "#43C17A" },
];

export const managerCategories = [
  { name: "Hostel", value: 60 },
  { name: "Infras...", value: 44 },
  { name: "Safety", value: 54 },
  { name: "Sports", value: 35 },
  { name: "Events", value: 50 },
];

export const urgentIssues = [
  {
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Water Leakage Issue",
    category: "Hostel",
    priority: "High",
    time: "10 min ago",
    status: "Pending",
    studentImage: "/rahul.png",
  },
  {
    student: "Priya Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Water Leakage Issue",
    category: "Hostel",
    priority: "High",
    time: "10 min ago",
    status: "Pending",
    studentImage: "/female-student.png",
  },
  {
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Water Leakage Issue",
    category: "Hostel",
    priority: "High",
    time: "10 min ago",
    status: "Pending",
    studentImage: "/female-fe.png",
  },
];

export const managerRecentIssues = [
  {
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "Medium",
    studentImage: "/female-student.png",
  },
  {
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "High",
    studentImage: "/student-m.png",
  },
  {
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    category: "Infrastructure",
    priority: "Medium",
    studentImage: "/rahul.png",
  },
];

export const managerAnnouncements = [
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
