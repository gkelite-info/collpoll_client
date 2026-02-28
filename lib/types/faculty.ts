export type CardProps = {
  collegeId: number;

  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;

  collegeSubjectId: number;
  collegeSectionId?: number;     // ✅ add this

  subjectTitle: string;
  semester: string;
  year: string;
  sectionName?: string;          // ✅ add this

  units: number;
  topicsCovered: number;
  topicsTotal: number;
  nextLesson: string;
  students: number;
  percentage: number;
  fromDate: string;
  toDate: string;
};