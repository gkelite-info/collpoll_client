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
