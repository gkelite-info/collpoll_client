// export interface Parent {
//   name: string;
//   role: "Father" | "Mother";
//   photo: string;
// }

// export interface Student {
//   id: string;
//   roll: string;
//   name: string;
//   department: string;
//   year: string;
//   section: string;
//   semester: string;
//   photo: string;
//   email: string;
//   phone: string;
//   address: string;
//   attendanceDays: number;
//   absentDays: number;
//   leaveDays: number;
//   parents: Parent[];
// }
// export interface Parent {
//   name: string;
//   role: "Father" | "Mother";
//   photo: string;
// }

// export interface Student {
//   id: string;
//   roll: string;
//   name: string;
//   department: string;
//   year: string;
//   section: string;
//   semester: string;
//   photo: string;
//   email: string;
//   phone: string;
//   address: string;
//   attendanceDays: number;
//   absentDays: number;
//   leaveDays: number;
//   attendance: "Present" | "Absent";
//   percentage: number;
//   reason?: string;
//   parents: Parent[];
// }

// export const students: Student[] = [
//   {
//     id: "2345001",
//     roll: "2345001",
//     name: "Ananya Sharma",
//     department: "CSE",
//     year: "2nd Year",
//     section: "A",
//     semester: "III",
//     photo: "https://i.pravatar.cc/100?img=1",
//     email: "ananya@gmail.com",
//     phone: "+91 9876543210",
//     address: "245 Delo Street",
//     attendanceDays: 25,
//     absentDays: 5,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 95,
//     parents: [
//       {
//         name: "Rajesh Sharma",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=12",
//       },
//       {
//         name: "Sunita Sharma",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=32",
//       },
//     ],
//   },
//   {
//     id: "2345002",
//     roll: "2345002",
//     name: "Estelle Bald",
//     department: "ECE",
//     year: "3rd Year",
//     section: "B",
//     semester: "V",
//     photo: "https://i.pravatar.cc/100?img=2",
//     email: "estelle@gmail.com",
//     phone: "+91 9123456789",
//     address: "18 Baker Street",
//     attendanceDays: 22,
//     absentDays: 6,
//     leaveDays: 2,
//     attendance: "Absent",
//     percentage: 68,
//     reason: "Medical",
//     parents: [
//       {
//         name: "Lauren Bald",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=22",
//       },
//       {
//         name: "Maria Bald",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=23",
//       },
//     ],
//   },
//   {
//     id: "2345003",
//     roll: "2345003",
//     name: "Rohan Verma",
//     department: "ME",
//     year: "1st Year",
//     section: "C",
//     semester: "I",
//     photo: "https://i.pravatar.cc/100?img=3",
//     email: "rohanv@gmail.com",
//     phone: "+91 9988776655",
//     address: "Green Park, Delhi",
//     attendanceDays: 18,
//     absentDays: 7,
//     leaveDays: 3,
//     attendance: "Absent",
//     percentage: 72,
//     parents: [
//       {
//         name: "Suresh Verma",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=33",
//       },
//       {
//         name: "Kavita Verma",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=34",
//       },
//     ],
//   },
//   {
//     id: "2345004",
//     roll: "2345004",
//     name: "Meera Iyer",
//     department: "EEE",
//     year: "4th Year",
//     section: "A",
//     semester: "VII",
//     photo: "https://i.pravatar.cc/100?img=4",
//     email: "meera.iyer@gmail.com",
//     phone: "+91 9090909090",
//     address: "Anna Nagar, Chennai",
//     attendanceDays: 27,
//     absentDays: 2,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 93,
//     parents: [
//       {
//         name: "Ramakrishnan Iyer",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=44",
//       },
//       {
//         name: "Lakshmi Iyer",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=45",
//       },
//     ],
//   },
//   {
//     id: "2345005",
//     roll: "2345005",
//     name: "Arjun Singh",
//     department: "CSE",
//     year: "2nd Year",
//     section: "B",
//     semester: "III",
//     photo: "https://i.pravatar.cc/100?img=5",
//     email: "arjun.s@gmail.com",
//     phone: "+91 9112233445",
//     address: "Sector 22, Noida",
//     attendanceDays: 20,
//     absentDays: 8,
//     leaveDays: 2,
//     attendance: "Absent",
//     percentage: 71,
//     parents: [
//       {
//         name: "Mahesh Singh",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=55",
//       },
//       {
//         name: "Pooja Singh",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=56",
//       },
//     ],
//   },
//   {
//     id: "2345006",
//     roll: "2345006",
//     name: "Sara Wilson",
//     department: "IT",
//     year: "3rd Year",
//     section: "A",
//     semester: "V",
//     photo: "https://i.pravatar.cc/100?img=6",
//     email: "sara.w@gmail.com",
//     phone: "+91 9001122334",
//     address: "MG Road, Bengaluru",
//     attendanceDays: 26,
//     absentDays: 3,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 90,
//     parents: [
//       {
//         name: "John Wilson",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=66",
//       },
//       {
//         name: "Maria Wilson",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=67",
//       },
//     ],
//   },
//   {
//     id: "2345007",
//     roll: "2345007",
//     name: "Kunal Mehta",
//     department: "CIVIL",
//     year: "1st Year",
//     section: "D",
//     semester: "I",
//     photo: "https://i.pravatar.cc/100?img=7",
//     email: "kunal.m@gmail.com",
//     phone: "+91 8899776655",
//     address: "Navrangpura, Ahmedabad",
//     attendanceDays: 15,
//     absentDays: 10,
//     leaveDays: 3,
//     attendance: "Absent",
//     percentage: 60,
//     reason: "Personal",
//     parents: [
//       {
//         name: "Amit Mehta",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=77",
//       },
//       {
//         name: "Neha Mehta",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=78",
//       },
//     ],
//   },
//   {
//     id: "2345008",
//     roll: "2345008",
//     name: "Nina Lopez",
//     department: "ECE",
//     year: "4th Year",
//     section: "C",
//     semester: "VII",
//     photo: "https://i.pravatar.cc/100?img=8",
//     email: "nina.l@gmail.com",
//     phone: "+91 8080808080",
//     address: "Panaji, Goa",
//     attendanceDays: 28,
//     absentDays: 1,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 96,
//     parents: [
//       {
//         name: "Carlos Lopez",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=88",
//       },
//       {
//         name: "Maria Lopez",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=89",
//       },
//     ],
//   },
//   {
//     id: "2345009",
//     roll: "2345009",
//     name: "Daniel Kim",
//     department: "AI & DS",
//     year: "2nd Year",
//     section: "A",
//     semester: "III",
//     photo: "https://i.pravatar.cc/100?img=9",
//     email: "daniel.k@gmail.com",
//     phone: "+91 7878787878",
//     address: "Whitefield, Bengaluru",
//     attendanceDays: 23,
//     absentDays: 4,
//     leaveDays: 3,
//     attendance: "Present",
//     percentage: 76,
//     parents: [
//       {
//         name: "Min Kim",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=99",
//       },
//       {
//         name: "Soo Kim",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=100",
//       },
//     ],
//   },
//   {
//     id: "2345010",
//     roll: "2345010",
//     name: "Aisha Khan",
//     department: "MBA",
//     year: "1st Year",
//     section: "A",
//     semester: "I",
//     photo: "https://i.pravatar.cc/100?img=10",
//     email: "aisha.k@gmail.com",
//     phone: "+91 7666554433",
//     address: "Bandra, Mumbai",
//     attendanceDays: 24,
//     absentDays: 3,
//     leaveDays: 3,
//     attendance: "Present",
//     percentage: 86,
//     parents: [
//       {
//         name: "Imran Khan",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=101",
//       },
//       {
//         name: "Sana Khan",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=102",
//       },
//     ],
//   },
//   {
//     id: "2345011",
//     roll: "2345011",
//     name: "Ritesh Patel",
//     department: "BBA",
//     year: "3rd Year",
//     section: "B",
//     semester: "V",
//     photo: "https://i.pravatar.cc/100?img=11",
//     email: "ritesh.p@gmail.com",
//     phone: "+91 7555666777",
//     address: "Surat, Gujarat",
//     attendanceDays: 21,
//     absentDays: 6,
//     leaveDays: 2,
//     attendance: "Present",
//     percentage: 75,
//     parents: [
//       {
//         name: "Paresh Patel",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=111",
//       },
//       {
//         name: "Nita Patel",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=112",
//       },
//     ],
//   },
//   {
//     id: "2345012",
//     roll: "2345012",
//     name: "Emily Carter",
//     department: "BIO-TECH",
//     year: "4th Year",
//     section: "A",
//     semester: "VII",
//     photo: "https://i.pravatar.cc/100?img=12",
//     email: "emily.c@gmail.com",
//     phone: "+91 7444332211",
//     address: "Pune, Maharashtra",
//     attendanceDays: 29,
//     absentDays: 0,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 97,
//     parents: [
//       {
//         name: "Robert Carter",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=122",
//       },
//       {
//         name: "Helen Carter",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=123",
//       },
//     ],
//   },
//   {
//     id: "2345013",
//     roll: "2345013",
//     name: "Vikram Rao",
//     department: "CSE",
//     year: "3rd Year",
//     section: "D",
//     semester: "V",
//     photo: "https://i.pravatar.cc/100?img=13",
//     email: "vikram.r@gmail.com",
//     phone: "+91 7000011122",
//     address: "Indiranagar, Bengaluru",
//     attendanceDays: 19,
//     absentDays: 9,
//     leaveDays: 2,
//     attendance: "Absent",
//     percentage: 65,
//     reason: "Medical",
//     parents: [
//       {
//         name: "Raghav Rao",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=133",
//       },
//       {
//         name: "Anita Rao",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=134",
//       },
//     ],
//   },
//   {
//     id: "2345014",
//     roll: "2345014",
//     name: "Olivia Brown",
//     department: "DESIGN",
//     year: "2nd Year",
//     section: "A",
//     semester: "III",
//     photo: "https://i.pravatar.cc/100?img=14",
//     email: "olivia.b@gmail.com",
//     phone: "+91 7333445566",
//     address: "Koregaon Park, Pune",
//     attendanceDays: 27,
//     absentDays: 2,
//     leaveDays: 1,
//     attendance: "Present",
//     percentage: 94,
//     parents: [
//       {
//         name: "George Brown",
//         role: "Father",
//         photo: "https://i.pravatar.cc/80?img=144",
//       },
//       {
//         name: "Linda Brown",
//         role: "Mother",
//         photo: "https://i.pravatar.cc/80?img=145",
//       },
//     ],
//   },
// ];

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
