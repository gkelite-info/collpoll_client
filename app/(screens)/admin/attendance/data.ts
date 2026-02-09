import { AttendanceTableProps, StudentRecord } from "./tables/attendanceTable";

export interface Parent {
  name: string;
  role: "Father" | "Mother";
  photo: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Leave";

export interface SubjectAttendanceRecord {
  date: string;
  time: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface SubjectAttendance {
  subjectId: string;
  subjectName: string;
  facultyName: string;
  summary: {
    totalClasses: number;
    attended: number;
    absent: number;
    leave: number;
    percentage: number;
  };
  records: SubjectAttendanceRecord[];
}

export interface Student {
  id: string;
  roll: string;
  name: string;
  department: string;
  year: string;
  section: string;
  semester: string;
  photo: string;
  email: string;
  phone: string;
  address: string;
  attendanceDays: number;
  absentDays: number;
  leaveDays: number;
  attendance: AttendanceStatus;
  percentage: number;
  reason?: string;
  parents: Parent[];
  subjects: SubjectAttendance[];
}

export const students: Student[] = [
  {
    id: "7",
    roll: "2345001",
    name: "Ananya Sharma",
    department: "CSE",
    year: "2nd Year",
    section: "A",
    semester: "III",
    photo: "https://i.pravatar.cc/100?img=1",
    email: "ananya@gmail.com",
    phone: "+91 9876543210",
    address: "245 Delo Street",

    attendanceDays: 25,
    absentDays: 5,
    leaveDays: 1,
    attendance: "Present",
    percentage: 95,

    parents: [
      {
        name: "Rajesh Sharma",
        role: "Father",
        photo: "https://i.pravatar.cc/80?img=12",
      },
      {
        name: "Sunita Sharma",
        role: "Mother",
        photo: "https://i.pravatar.cc/80?img=32",
      },
    ],

    subjects: [
      {
        subjectId: "DS101",
        subjectName: "Data Structures",
        facultyName: "Prof. Meena Sharma",
        summary: {
          totalClasses: 32,
          attended: 28,
          absent: 1,
          leave: 3,
          percentage: 87,
        },
        records: [
          {
            date: "22/10/2025",
            time: "1:00 PM - 4:00 PM",
            status: "Present",
          },
          {
            date: "23/10/2025",
            time: "1:00 PM - 4:00 PM",
            status: "Present",
          },
          {
            date: "29/10/2025",
            time: "1:00 PM - 4:00 PM",
            status: "Absent",
            reason: "Sick",
          },
          {
            date: "30/10/2025",
            time: "1:00 PM - 4:00 PM",
            status: "Leave",
            reason: "Internship meeting",
          },
        ],
      },

      {
        subjectId: "OOP201",
        subjectName: "OOPs using C++",
        facultyName: "Prof. Raj Malhotra",
        summary: {
          totalClasses: 30,
          attended: 25,
          absent: 3,
          leave: 2,
          percentage: 83,
        },
        records: [
          {
            date: "20/10/2025",
            time: "10:00 AM - 12:00 PM",
            status: "Present",
          },
        ],
      },
    ],
  },
];

export const ATTENDANCE_MOCK_DATA: StudentRecord[] = [
  // {
  //   sNo: "01",
  //   rollNo: "2345001",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
  //   name: "Ananya Shar...",
  //   attendance: "Present", // Now correctly recognized as "Present" literal
  //   percentage: 95,
  //   reason: "-",
  //   status: "Top",
  // },
  // {
  //   sNo: "02",
  //   rollNo: "2345002",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Estelle",
  //   name: "Estelle Bald",
  //   attendance: "Present",
  //   percentage: 92,
  //   reason: "-",
  //   status: "Good",
  // },
  // {
  //   sNo: "03",
  //   rollNo: "2345003",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
  //   name: "Amanda Wo",
  //   attendance: "Present",
  //   percentage: 68,
  //   reason: "-",
  //   status: "Top",
  // },
  // {
  //   sNo: "04",
  //   rollNo: "2345004",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
  //   name: "Lily Tano",
  //   attendance: "Absent", // Correctly recognized as "Absent" literal
  //   percentage: 88,
  //   reason: "Fever",
  //   status: "Low",
  // },
  // {
  //   sNo: "05",
  //   rollNo: "2345005",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
  //   name: "Kevin Ray",
  //   attendance: "Present",
  //   percentage: 74,
  //   reason: "-",
  //   status: "Good",
  // },
  // {
  //   sNo: "06",
  //   rollNo: "2345006",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
  //   name: "Sophia Lin",
  //   attendance: "Present",
  //   percentage: 95,
  //   reason: "-",
  //   status: "Top",
  // },
  // {
  //   sNo: "07",
  //   rollNo: "2345007",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel",
  //   name: "Daniel Cruz",
  //   attendance: "Present",
  //   percentage: 81,
  //   reason: "-",
  //   status: "Top",
  // },
  // {
  //   sNo: "08",
  //   rollNo: "2345008",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
  //   name: "Arjun Marma",
  //   attendance: "Present",
  //   percentage: 59,
  //   reason: "-",
  //   status: "Low",
  // },
  // {
  //   sNo: "19",
  //   rollNo: "2345110",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nason",
  //   name: "Nason Paul",
  //   attendance: "Absent",
  //   percentage: 87,
  //   reason: "Fever",
  //   status: "Low",
  // },
  // {
  //   sNo: "10",
  //   rollNo: "2345111",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jaema",
  //   name: "Jaema Sajid",
  //   attendance: "Present",
  //   percentage: 89,
  //   reason: "-",
  //   status: "Good",
  // },
  // {
  //   sNo: "11",
  //   rollNo: "23451243",
  //   photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
  //   name: "Suresh N",
  //   attendance: "Absent",
  //   percentage: 52,
  //   reason: "Fever",
  //   status: "Low",
  // },
];

export const MOCK_FILTERS = {
  year: "1 st year",
  section: "A",
  sem: "III",
  subject: "Date Structures",
  date: "DD/MM/YYYY",
};
