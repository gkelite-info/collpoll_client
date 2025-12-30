import { ScheduledLesson } from "../../utils/scheduledLessonsStrip";

import { UpcomingLesson } from "../../utils/upcomingClasses";
// import { RequestData } from "./pendingApprovalsTable";

export interface DetailedStudent {
  rollNo: string;
  studentName: string;
  photo: string;
  attendancePercent: number;
  internalMarks: string;
  assignmentsDone: string;
  progressPercent: number;
}

export const detailedStudentsData: DetailedStudent[] = [
  {
    rollNo: "21CSE001",
    studentName: "Rohan Patel",
    photo: "/images/student-1.jpg",
    attendancePercent: 92,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 97,
  },
  {
    rollNo: "21CSE002",
    studentName: "Aarav Mehta",
    photo: "/images/student-2.jpg",
    attendancePercent: 67,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 95,
  },
  {
    rollNo: "21CSE003",
    studentName: "Karthik Reddy",
    photo: "/images/student-3.jpg",
    attendancePercent: 55,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
  },
  {
    rollNo: "21CSE004",
    studentName: "Sneha Reddy",
    photo: "/images/student-4.jpg",
    attendancePercent: 76,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 90,
  },
  {
    rollNo: "21CSE005",
    studentName: "Ananya Sharma",
    photo: "/images/student-5.jpg",
    attendancePercent: 87,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 90,
  },
  {
    rollNo: "21CSE006",
    studentName: "Neha Sinha",
    photo: "/images/student-6.jpg",
    attendancePercent: 45,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
  },
  {
    rollNo: "21CSE007",
    studentName: "Arjun Rao",
    photo: "/images/student-7.jpg",
    attendancePercent: 50,
    internalMarks: "10/50",
    assignmentsDone: "1/5",
    progressPercent: 20,
  },
];

export const INITIAL_SCHEDULED_LESSONS: ScheduledLesson[] = [
  {
    id: "1",
    title: "Introduction to Data Structures",
    duration: "60 mins",
    classGroup: "CSE - Year 2",
    date: "2025-10-02",
    time: "10:00 AM",
    objective: "Understand the concept of data structures.",
  },
  {
    id: "2",
    title: "Arrays and Linked Lists",
    duration: "60 mins",
    classGroup: "CSE - Year 2",
    date: "2025-10-03",
    time: "11:00 AM",
    objective: "Deep dive into memory allocation.",
  },
  {
    id: "3",
    title: "Stack Implementation",
    duration: "60 mins",
    classGroup: "CSE - Year 2",
    date: "2025-10-04",
    time: "09:00 AM",
    objective: "LIFO principles and applications.",
  },
  {
    id: "4",
    title: "Queue Theory",
    duration: "45 mins",
    classGroup: "CSE - Year 1",
    date: "2025-10-05",
    time: "02:00 PM",
    objective: "FIFO principles and implementation.",
  },
  {
    id: "5",
    title: "Binary Trees",
    duration: "90 mins",
    classGroup: "CSE - Year 3",
    date: "2025-10-06",
    time: "10:30 AM",
    objective: "Tree traversal algorithms.",
  },
];

export const INITIAL_LESSONS: UpcomingLesson[] = [
  {
    id: "1",
    title: "B.Tech CSE – Year 2",
    description:
      "Prepare slides on array implementation and complexity analysis.",
    time: "9:00 Am",
  },
  {
    id: "2",
    title: "B.Tech CSE – Year 1",
    description:
      "Introduction to Object Oriented Programming concepts and classes.",
    time: "10:00 Am",
  },
  {
    id: "3",
    title: "B.Tech CSE – Year 2",
    description:
      "Advanced Graph Algorithms: Dijkstra and Bellman-Ford implementations.",
    time: "11:30 Am",
  },
  {
    id: "4",
    title: "B.Tech CSE – Year 3",
    description:
      "Database normalization forms (1NF, 2NF, 3NF, BCNF) with real examples.",
    time: "2:00 Pm",
  },
  {
    id: "5",
    title: "M.Tech CSE – Year 1",
    description: "Research methodology and technical paper writing workshop.",
    time: "4:00 Pm",
  },
];

export const dashboardData = {
  summary: {
    totalUsers: "1,200",
    pendingRegistrations: "06",
  },
  automations: [
    { label: "Daily Backup", checked: true },
    { label: "Email Reminders", checked: true },
    { label: "Attendance Alerts", checked: false },
    { label: "Security Monitoring", checked: true },
    { label: "Event Notification", checked: true },
  ],
  backup: {
    lastBackup: "20 Nov 2025, 9:30 PM",
    storageUsed: "78%",
    autoBackup: true,
  },
  health: {
    storagePercentage: 78,
    totalStorage: "500 GB",
    uptime: "99.98%",
    responseTime: "Avg 142ms",
    status: "Good",
  },
  roles: [
    { label: "Parent", value: "1000" },
    { label: "Faculty", value: "60" },
    { label: "Student", value: "1200" },
  ],
  policies: {
    attendance: "75% Required",
    assignment: "7 days after release",
    leave: "Max 10 per semester",
  },
};
