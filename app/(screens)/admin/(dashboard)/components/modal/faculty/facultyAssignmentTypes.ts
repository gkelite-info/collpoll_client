export type TeachingAssignment = {
  id: string; // crypto.randomUUID()
  educationId: number | null;
  branchId: number | null; // null for School types
  rows: AssignmentRow[];
};

export type AssignmentRow = {
  id: string; // crypto.randomUUID()
  yearId: number | null;
  semesterId: number | null; // null for School & Inter
  subjectId: number | null;
  sectionIds: number[];
};

export type FacultySectionPayload = {
  facultyId: number;
  collegeSectionsId: number;
  collegeSubjectId: number;
  collegeAcademicYearId: number;
  collegeEducationId: number | null;
  collegeBranchId: number | null;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
