export type FacultyStudentProgressDetailsScope = {
  rollNo: string;
  facultyId: number;
  collegeId: number;
  academicYearIds: number[];
  sectionIds: number[];
  subjectIds: number[];
};

export type StudentPinLookupRow = {
  studentId: number;
  pinNumber: string;
};

export type StudentProfileLookupRow = {
  studentId: number;
  userId: number;
  collegeEducationId: number;
  collegeBranchId: number | null;
  user: {
    fullName: string;
    email: string;
    mobile: string;
    gender: string | null;
  } | {
    fullName: string;
    email: string;
    mobile: string;
    gender: string | null;
  }[] | null;
  college_education?: {
    collegeEducationType: string;
  } | {
    collegeEducationType: string;
  }[] | null;
  college_branch?: {
    collegeBranchCode: string;
  } | {
    collegeBranchCode: string;
  }[] | null;
};

export type CurrentHistoryRow = {
  studentId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number | null;
  collegeSectionsId: number;
  college_sections: { collegeSections: string } | { collegeSections: string }[] | null;
  college_academic_year:
    | { collegeAcademicYear: string }
    | { collegeAcademicYear: string }[]
    | null;
  college_semester:
    | { collegeSemester: number }
    | { collegeSemester: number }[]
    | null;
};

export type UserProfileRow = {
  userId: number;
  profileUrl: string | null;
};

export type ParentRow = {
  parentId: number;
  userId: number;
  user:
    | {
        fullName: string;
        gender: string | null;
      }
    | {
        fullName: string;
        gender: string | null;
      }[]
    | null;
};

export type EventType = {
  subject: number | null;
  facultyId: number | null;
  type: string | null;
  date?: string | null;
  fromDate?: string | null;
  is_deleted: boolean | null;
};

export type AttendanceRecordRow = {
  status: string;
  calendar_event: EventType | EventType[] | null;
  bulk_event: EventType | EventType[] | null;
};

export type SubjectRow = {
  collegeSubjectId: number;
  subjectName: string;
  subjectKey: string | null;
};

export type AssignmentRow = {
  assignmentId: number;
  subjectId: number;
  topicName: string;
  submissionDeadlineInt: number;
  marks: number;
  status: string | null;
};

export type AssignmentSubmissionRow = {
  assignmentId: number;
  marksScored: number | null;
  status: string | null;
};

export type QuizRow = {
  quizId: number;
  collegeSubjectId: number;
  totalMarks: number;
  quizTitle: string;
  endDate: string | null;
  status: string | null;
};

export type QuizSubmissionRow = {
  quizId: number;
  totalMarksObtained: number | null;
  submittedAt?: string | null;
  createdAt?: string | null;
};

export type DiscussionForumRow = {
  discussionId: number;
  title: string;
  deadline: string | null;
  createdAt: string | null;
  createdBy: number | null;
};

export type DiscussionSectionRow = {
  discussionId: number;
  collegeSectionsId: number;
  marks: number;
};

export type DiscussionUploadRow = {
  discussionId: number;
  marksObtained: number | null;
  submittedAt?: string | null;
  createdAt?: string | null;
};

export type WeightageItemRow = {
  label: string;
  percentage: number;
};

export type WeightageConfigRow = {
  collegeSubjectId: number;
  collegeSectionsId: number;
  collegeSemesterId: number;
  faculty_weightage_items:
    | WeightageItemRow[]
    | WeightageItemRow
    | null;
};

export type SubjectMetric = {
  subject: string;
  value: number;
  full: number;
};

export type GradeEntry = {
  subject: string;
  grade: string;
  improvement: "Improved" | "Declining";
};

export type AssignmentListItem = {
  id: number;
  subject: string;
  task: string;
  dueDate: string;
  dueDateInt: number;
  status: "Pending" | "Incomplete" | "Completed";
  obtainedMarks?: number;
  totalMarks?: number;
};

export type QuizListItem = {
  id: number;
  subject: string;
  task: string;
  dueDate: string;
  dueDateSortKey: string;
  status: "Not Attempted" | "Attempted" | "Evaluated";
  obtainedMarks?: number;
  totalMarks?: number;
};

export type DiscussionListItem = {
  id: number;
  subject: string;
  task: string;
  dueDate: string;
  dueDateSortKey: string;
  status: "Not Submitted" | "Submitted" | "Evaluated";
  obtainedMarks?: number;
  totalMarks?: number;
};

export type TaskInsight = {
  obtained: number;
  total: number;
  weightedScore: number;
};

export type ParentInfo = {
  name: string;
  relation: string;
  avatar: string;
  parentId: number;
  userId: number;
};

export type ProgressWeights = {
  attendance: number;
  assignments: number;
  quiz: number;
  discussion: number;
};

export const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
export const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
export const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS", "CANCELLED"] as const;

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const getFirst = <T>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? value[0] ?? null : value ?? null;

export const isAttendedStatus = (status: string) =>
  (ATTENDED_STATUSES as readonly string[]).includes(status);

export const isConductedStatus = (status: string) =>
  (CONDUCTED_STATUSES as readonly string[]).includes(status);

export const isCancelledStatus = (status: string) =>
  (CANCELLED_STATUSES as readonly string[]).includes(status);

export const formatIntDate = (dateInt: number) => {
  if (!dateInt) return "-";

  const raw = String(dateInt);
  if (raw.length !== 8) return "-";

  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatIsoDate = (value: string | null | undefined) => {
  if (!value) return "-";

  const normalized =
    value.length <= 10 && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00`
      : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const normalizeWeightageLabel = (label: string) => label.trim().toLowerCase();

export const buildProgressWeightsFromConfigs = (
  configs: WeightageConfigRow[],
): ProgressWeights => {
  const emptyWeights: ProgressWeights = {
    attendance: 0,
    assignments: 0,
    quiz: 0,
    discussion: 0,
  };

  if (!configs.length) return emptyWeights;

  const totals = { ...emptyWeights };
  let matchedConfigs = 0;

  for (const config of configs) {
    const items = Array.isArray(config.faculty_weightage_items)
      ? config.faculty_weightage_items
      : config.faculty_weightage_items
        ? [config.faculty_weightage_items]
        : [];

    const bucket = { ...emptyWeights };
    let hasRecognized = false;

    for (const item of items) {
      const normalized = normalizeWeightageLabel(item.label);

      if (normalized.includes("attendance")) {
        bucket.attendance += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("assignment")) {
        bucket.assignments += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("quiz")) {
        bucket.quiz += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("discussion")) {
        bucket.discussion += item.percentage;
        hasRecognized = true;
      }
    }

    if (!hasRecognized) continue;

    totals.attendance += bucket.attendance;
    totals.assignments += bucket.assignments;
    totals.quiz += bucket.quiz;
    totals.discussion += bucket.discussion;
    matchedConfigs += 1;
  }

  if (!matchedConfigs) return emptyWeights;

  return {
    attendance: totals.attendance / matchedConfigs,
    assignments: totals.assignments / matchedConfigs,
    quiz: totals.quiz / matchedConfigs,
    discussion: totals.discussion / matchedConfigs,
  };
};

export const getDerivedGrade = (value: number) => {
  if (value >= 90) return "A+";
  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  return "F";
};

export const getParentRelation = (gender: string | null | undefined, index: number) => {
  if (gender?.toLowerCase() === "male") return "Father";
  if (gender?.toLowerCase() === "female") return "Mother";
  return `Parent ${index + 1}`;
};
