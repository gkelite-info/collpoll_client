export interface Assignment {
  assignmentId?: number;
  image: string;
  title: string;
  description: string;
  fromDate: string | number;
  toDate: string | number;
  totalSubmissions: string;
  totalSubmitted: string;
  marks: string | number;
}

export const initialAssignments: Assignment[] = [
  {
    assignmentId: 1,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 2,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 3,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 4,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
];

export const activeAssignments: Assignment[] = [
  {
    assignmentId: 1,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 2,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 3,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
  {
    assignmentId: 4,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: "25",
  },
];

export const evaluatedAssignments: Assignment[] = [
  {
    assignmentId: 1,
    image: "/ds.jpg",
    title: "Web Technologies Lab",
    description: "Responsive Design Using HTML, CSS, JS",
    fromDate: "05/01/2025",
    toDate: "05/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: 88,
  },
  {
    assignmentId: 2,
    image: "/ds.jpg",
    title: "Data Structures",
    description: "Array Operations & Complexity",
    fromDate: "05/01/2025",
    toDate: "05/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: 82,
  },
  {
    assignmentId: 3,
    image: "/ds.jpg",
    title: "Operating Systems",
    description: "Process Scheduling & Deadlocks",
    fromDate: "03/01/2025",
    toDate: "03/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: 85,
  },
  {
    assignmentId: 4,
    image: "/dbms.jpg",
    title: "DBMS",
    description: "Normalization & SQL Queries",
    fromDate: "07/01/2025",
    toDate: "07/01/2025",
    totalSubmissions: "32",
    totalSubmitted: "30",
    marks: 76,
  },
];
