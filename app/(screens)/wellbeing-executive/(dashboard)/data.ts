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

export const recentIssues = [
  {
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    handledBy: "Priya Sharma",
    studentImage: "/female-student.png",
    handlerImage: "/female-faculty.png",
  },
  {
    student: "Shreya Patel",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    handledBy: "Aarav Guptha",
    studentImage: "/student-m.png",
    handlerImage: "/male-faculty.png",
  },
  {
    student: "Rahul Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    handledBy: "Shivansh Shripat",
    studentImage: "/rahul.png",
    handlerImage: "/male-student.png",
  },
  {
    student: "Priya Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    handledBy: "Koushik Reddy",
    studentImage: "/female-student.png",
    handlerImage: "/male-hr.png",
  },
  {
    student: "Ankitha Sharma",
    meta: "B.Tech CSE  |  ID-28939",
    issue: "Projector not working in CR-2",
    description: "The project has not been working since morning.",
    handledBy: "Priya Sharma",
    studentImage: "/female-student.png",
    handlerImage: "/female-faculty.png",
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
