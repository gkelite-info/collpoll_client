export type HrLeaveStatus = "all" | "approved" | "pending" | "rejected";

export type HrLeaveRow = {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  photo: string | null;
  fromDate: string;
  toDate: string;
  startDateIso: string;
  endDateIso: string;
  days: string;
  leaveType: string;
  description: string;
  status: "approved" | "pending" | "rejected";
};
