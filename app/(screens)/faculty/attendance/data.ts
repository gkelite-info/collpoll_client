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
    id: "2345001",
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
