export type ReturnStatus = "Returned" | "Pending";

export type VisitorEntry = {
  id: number;
  initials: string;
  avatarTone: string;
  student: string;
  course: string;
  rollNo: string;
  takenAt: string;
  equipment: string;
  quantity: number;
  returnStatus: ReturnStatus;
  returnedAt: string;
};

export type UsageRecord = {
  date: string;
  equipment: string;
  quantity: number;
  purpose: string;
  takenAt: string;
  returnedAt: string;
  status: ReturnStatus;
};
