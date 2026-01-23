import { ScheduledLesson } from "../../utils/scheduledLessonsStrip";
import { StudentPerformance } from "../../utils/studentPerformanceCard";
import { UpcomingLesson } from "../../utils/upcomingClasses";
import { TopPerformer } from "./topFivePerformers";

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

export const STUDENT_DATA: StudentPerformance[] = [
  {
    id: "1",
    name: "Amelia Coll",
    imageUrl: "https://i.pravatar.cc/150?img=1",
    percentage: 95,
  },
  {
    id: "2",
    name: "Estelle Bald",
    imageUrl: "https://i.pravatar.cc/150?img=5",
    percentage: 88,
  },
  {
    id: "3",
    name: "Amanda Wo",
    imageUrl: "https://i.pravatar.cc/150?img=8",
    percentage: 92,
  },
  {
    id: "4",
    name: "Lily Tano",
    imageUrl: "https://i.pravatar.cc/150?img=9",
    percentage: 75,
  },

  {
    id: "5",
    name: "Lily Tano",
    imageUrl: "https://i.pravatar.cc/150?img=9",
    percentage: 95,
  },
  {
    id: "6",
    name: "Amanda Wo",
    imageUrl: "https://i.pravatar.cc/150?img=8",
    percentage: 95,
  },
  {
    id: "7",
    name: "John Doe",
    imageUrl: "https://i.pravatar.cc/150?img=12",
    percentage: 60,
  },
];

export const TOP_PERFORMERS: TopPerformer[] = [
  {
    id: "1",
    name: "Amelia Coll",
    avatar: "https://i.pravatar.cc/150?img=5",
    score: 95,
  },
  {
    id: "2",
    name: "Estelle Bald",
    avatar: "https://i.pravatar.cc/150?img=9",
    score: 85,
  },
  {
    id: "3",
    name: "Amanda Wo",
    avatar: "https://i.pravatar.cc/150?img=3",
    score: 75,
  },
  {
    id: "4",
    name: "Lily Tano",
    avatar: "https://i.pravatar.cc/150?img=11",
    score: 63,
  },
  {
    id: "5",
    name: "Lily Tano",
    avatar: "https://i.pravatar.cc/150?img=9",
    score: 55,
  },
];
