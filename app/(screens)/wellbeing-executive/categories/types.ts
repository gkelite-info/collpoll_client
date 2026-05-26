export type IssueScope = "college" | "hostel";

export type CategoryIssue = {
  id: string;
  student: string;
  meta: string;
  image: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium";
  block: string;
  room: string;
  evidence: string;
};
