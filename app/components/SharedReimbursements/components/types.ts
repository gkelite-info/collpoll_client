export type ReimbursementStatus =
  | "Paid"
  | "Awaiting Payment"
  | "Pending"
  | "Rejected";

export type RequestRow = {
  id: string;
  title: string;
  category: string;
  amount: string;
  submittedDate: string;
  status: ReimbursementStatus;
};

export type UploadedBill = {
  name: string;
  size: string;
};
