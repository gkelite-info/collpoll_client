export interface Internship {
  internship_id: number;
  student_id: number;
  organization_name: string;
  role: string;
  start_date: string;
  end_date: string;
  project_name: string | null;
  project_url: string | null;
  location: string | null;
  domain: string | null;
  description: string | null;
  is_deleted: boolean;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type InternshipInsert = Omit<Internship, "internship_id" | "deleted_at">;

export type InternshipUpdate = Partial<InternshipInsert>;

export interface InternshipFilter {
  student_id?: number;
  domain?: string;
  is_deleted?: boolean;
}

export interface ProjectFormInput {
  studentId: number;
  projectName: string;
  domain: string;
  startDate: string;
  endDate: string;
  projectUrl?: string;
  toolsAndTechnologies?: string[];
  description?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProfileSummaryInput {
  studentId: number;
  summary: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CompetitiveExamEntry {
  studentId: number;
  examName: string;
  score: number;
  isDeleted?: boolean;
}
