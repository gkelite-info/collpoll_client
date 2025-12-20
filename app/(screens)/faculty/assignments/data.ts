export interface Assignment {
  id: string;
  image: string;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  totalSubmissions: string;
  totalSubmitted: string;
  marks: string;
}

export const initialAssignments: Assignment[] = [
  {
    id: "01",
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
    id: "02",
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
    id: "03",
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
    id: "04",
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

const activeAssignments = [
  {
    id: "01",
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
    id: "02",
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
    id: "03",
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
    id: "04",
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

const evaluatedAssignments = [
  {
    id: "01",
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
    id: "02",
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
    id: "03",
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
    id: "04",
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
