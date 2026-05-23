export type DashboardIssueKind = "college" | "hostel";

export type DashboardIssue = {
  id: string;
  kind: DashboardIssueKind;
  student: string;
  meta: string;
  issue: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  studentImage: string;
  evidence: string;
  block?: string;
  room?: string;
};

const students = [
  { student: "Ankitha Sharma", meta: "B.Tech CSE  |  ID-28939", studentImage: "/female-student.png" },
  { student: "Shreya Patel", meta: "B.Tech CSE  |  ID-28940", studentImage: "/student-m.png" },
  { student: "Rahul Sharma", meta: "B.Tech CSE  |  ID-28941", studentImage: "/rahul.png" },
  { student: "Priya Nair", meta: "B.Tech ECE  |  ID-28942", studentImage: "/female-fe.png" },
  { student: "Arjun Menon", meta: "B.Tech ME  |  ID-28943", studentImage: "/student-m.png" },
];

export const collegeIssueRows: DashboardIssue[] = Array.from({ length: 20 }).map((_, index) => {
  const student = students[index % students.length];
  const issues = [
    "Projector not working in CR-2",
    "Lab system display flickering",
    "Library AC not cooling",
    "Classroom speaker issue",
  ];

  return {
    id: `CLG-${482857 + index}`,
    kind: "college",
    ...student,
    issue: issues[index % issues.length],
    description: "The project has not been working since morning and classes are getting delayed.",
    category: index % 3 === 0 ? "Infrastructure" : index % 3 === 1 ? "IT Support" : "Maintenance",
    priority:
      index % 7 === 0
        ? "Urgent"
        : index % 5 === 0
          ? "Low"
          : index % 4 === 0
            ? "Medium"
            : "High",
    evidence: `college-evidence-${index + 1}.pdf`,
  };
});

export const hostelIssueRows: DashboardIssue[] = Array.from({ length: 20 }).map((_, index) => {
  const student = students[index % students.length];
  const blocks = ["A", "B", "C", "D"];
  const rooms = ["A-206", "A-205", "A-203", "B-118", "C-310"];

  return {
    id: `HST-${572857 + index}`,
    kind: "hostel",
    ...student,
    issue: index % 2 === 0 ? "WiFi not working in Hostel Floor 3" : "Water leakage near hostel corridor",
    description: "Internet connectivity is very poor or unavailable for students on this floor.",
    category: index % 3 === 0 ? "Infrastructure" : index % 3 === 1 ? "Network" : "Maintenance",
    priority:
      index % 6 === 0
        ? "Urgent"
        : index % 5 === 0
          ? "Low"
          : index % 4 === 0
            ? "Medium"
            : "High",
    evidence: `hostel-evidence-${index + 1}.pdf`,
    block: blocks[index % blocks.length],
    room: rooms[index % rooms.length],
  };
});
