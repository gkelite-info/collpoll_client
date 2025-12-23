import { ScheduledLesson } from "../utils/scheduledLessonsStrip";
import { StudentPerformance } from "../utils/studentPerformanceCard";
import { UpcomingLesson } from "../utils/upcomingClasses";
import { TopPerformer } from "./components/topFivePerformers";

export interface ParentInfo {
  name: string;
  relation: "Father" | "Mother";
  avatar: string;
}

export interface SubjectMetric {
  subject: string;
  value: number; // For the Academic Performance Bar Chart
}

export interface Assignment {
  subject: string;
  task: string;
  dueDate: string;
  status: "Pending" | "Completed";
}

export interface GradeEntry {
  subject: string;
  grade: string;
  improvement: "Improved" | "Declining";
}

export interface DetailedStudent {
  rollNo: string;
  studentName: string;
  avatarSeed: number;
  dept: string;
  attendancePercent: number;
  internalMarks: string;
  assignmentsDone: string;
  progressPercent: number;
  contact: {
    number: string;
    email: string;
    address: string;
  };
  attendanceStats: {
    totalAttendance: number;
    totalAbsent: number;
    totalLeave: number;
    percent: number;
  };
  parents: ParentInfo[];
  academicPerformance: SubjectMetric[];
  assignments: Assignment[];
  grades: GradeEntry[];
}

export const detailedStudentsData: DetailedStudent[] = [
  {
    rollNo: "21CSE001",
    studentName: "Ananya Sharma",
    avatarSeed: 5,
    dept: "CSE",
    attendancePercent: 92,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 97,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE002",
    studentName: "Aarav Mehta",
    avatarSeed: 2,
    dept: "CSE",
    attendancePercent: 67,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 95,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE003",
    studentName: "Karthik Reddy",
    avatarSeed: 3,
    dept: "CSE",
    attendancePercent: 55,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE004",
    studentName: "Sneha Reddy",
    avatarSeed: 4,
    dept: "CSE",
    attendancePercent: 76,
    internalMarks: "45/50",
    assignmentsDone: "4/5",
    progressPercent: 90,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE005",
    studentName: "Ananya Sharma",
    avatarSeed: 5,
    dept: "CSE",
    attendancePercent: 87,
    internalMarks: "45/50",
    assignmentsDone: "5/5",
    progressPercent: 90,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE006",
    studentName: "Neha Sinha",
    avatarSeed: 6,
    dept: "CSE",
    attendancePercent: 45,
    internalMarks: "45/50",
    assignmentsDone: "3/5",
    progressPercent: 60,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
  },
  {
    rollNo: "21CSE007",
    studentName: "Arjun Rao",
    avatarSeed: 7,
    dept: "CSE",
    attendancePercent: 50,
    internalMarks: "10/50",
    assignmentsDone: "1/5",
    progressPercent: 20,
    contact: {
      number: "+91 9012345678",
      email: "estellebald@gmail.com",
      address: "245 Delo Street",
    },
    attendanceStats: {
      totalAttendance: 25,
      totalAbsent: 5,
      totalLeave: 1,
      percent: 85,
    },
    parents: [
      {
        name: "Lauren Barker",
        relation: "Father",
        avatar: "https://i.pravatar.cc/150?u=father1",
      },
      {
        name: "Fiorine Lopez",
        relation: "Mother",
        avatar: "https://i.pravatar.cc/150?u=mother1",
      },
    ],
    academicPerformance: [
      { subject: "Java Programming", value: 70 },
      { subject: "Data Structures", value: 50 },
      { subject: "Database Management Systems", value: 80 },
      { subject: "Operating Systems", value: 35 },
      { subject: "Software Engineering", value: 80 },
      { subject: "Web Development", value: 60 },
    ],
    assignments: [
      {
        subject: "Data Structures",
        task: "Implement Linked List",
        dueDate: "27/10/2025",
        status: "Pending",
      },
      {
        subject: "DBMS",
        task: "ER Diagram Submission",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Database Manage..",
        task: "Scheduling Algorithms",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Operating Systems",
        task: "HTML Form Design",
        dueDate: "27/10/2025",
        status: "Completed",
      },
      {
        subject: "Software Engineering",
        task: "Inheritance Assignment",
        dueDate: "27/10/2025",
        status: "Completed",
      },
    ],
    grades: [
      { subject: "Java Programmi...", grade: "A", improvement: "Improved" },
      { subject: "Data Structures", grade: "B", improvement: "Declining" },
      { subject: "Database Manage..", grade: "A", improvement: "Improved" },
      { subject: "Operating Systems", grade: "A", improvement: "Improved" },
      { subject: "Web Development", grade: "B", improvement: "Declining" },
    ],
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
