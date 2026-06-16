import type {
  StudentProgressBranch,
  StudentProgressYear,
} from "@/lib/helpers/admin/studentProgress/studentProgressDropdowns";

export type StudentProgressView =
  | "progress"
  | "results"
  | "result-details"
  | "result-preview";

export type ResultCard = {
  id: string;
  subject: string;
  facultyName: string;
  facultyId: string;
  profileUrl: string;
  totalStudents: number;
  passPercentage: number;
  status: "Uploaded" | "Draft Mode";
};

export type ResultBranchOption = StudentProgressBranch;

export type ResultYearOption = StudentProgressYear;

export const resultFacultyNames = [
  "Saraswathi",
  "Ankitha Gupta",
  "Shravani",
  "Nalay",
  "Aryan",
  "Ayan",
];

export const resultFacultyPhotos = [
  "/female-student.png",
  "/female-student.png",
  "/female-admin.png",
  "/male-student.png",
  "/faculty-male.png",
  "/faculty-male.png",
];

export const getSearchView = (value: string | null): StudentProgressView =>
  value === "results" || value === "result-details" || value === "result-preview"
    ? value
    : "progress";
