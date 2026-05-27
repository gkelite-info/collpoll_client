export interface WellbeingIssue {
  id: string;
  title: string;
  subCategory: string;
  branch: string;
  description: string;
  dateReported: string;
  status: "Resolved" | "Rejected" | "Pending";
  attachments: { name: string; size: string }[];
}

export const wellbeingCards = [
  {
    id: "raised",
    value: "15",
    label: "Total Raised",
    bg: "#DDD4FF",
    iconColor: "#6F4EF6",
  },
  {
    id: "pending",
    value: "02",
    label: "In Pending",
    bg: "#FFE7C9",
    iconColor: "#FF9F3F",
  },
  {
    id: "resolved",
    value: "10",
    label: "Resolved",
    bg: "#DDF3E7",
    iconColor: "#009B55",
  },
  {
    id: "rejected",
    value: "13",
    label: "Rejected",
    bg: "#FFDCDD",
    iconColor: "#FF2A2A",
  },
];

export const wellbeingCategories = [
  "Infrastructure",
  "Academic Support",
  "Finance Support",
  "Workplace Concern",
  "Technical Issue",
];

export const wellbeingSubCategories = [
  "Select Sub Category",
  "Classroom",
  "Accounts",
  "Portal Access",
  "Facilities",
];

// Helper to generate mock issues
const generateIssues = (status: WellbeingIssue["status"], count: number, prefix: string): WellbeingIssue[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    title: `Projector not working in CR - ${i + 1}`,
    subCategory: "Infrastructure",
    branch: "well being",
    description: `The projector in Classroom CR-${i + 1} is not working and is unable to display content during lectures. Faculty tried reconnecting the cables and restarting the system, but the issue still persists. This is affecting ongoing classes, so maintenance support is required as soon as possible.`,
    dateReported: "03/27/2026",
    status,
    attachments: [
      { name: "Project_error.jpg", size: "60 KB" },
      { name: "Project_error.jpg2", size: "60 KB" },
    ],
  }));
};

export const mockIssues = {
  raised: [
    ...generateIssues("Pending", 6, "P"),
    ...generateIssues("Resolved", 1, "R"),
    ...generateIssues("Rejected", 3, "REJ")
  ],
  pending: generateIssues("Pending", 12, "P"),
  resolved: generateIssues("Resolved", 10, "R"),
  rejected: generateIssues("Rejected", 13, "REJ"),
};
