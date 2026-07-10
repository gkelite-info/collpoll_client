import {
  ListTodo,
  ClipboardClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { RequestRow, UploadedBill } from "./types";

export const requests: RequestRow[] = [
  {
    id: "REIM-1024",
    title: "Client Lunch",
    category: "Meals",
    amount: "2245.00",
    submittedDate: "2023-10-20",
    status: "Paid",
  },
  {
    id: "REIM-1025",
    title: "Flight to SF",
    category: "Travel",
    amount: "4450.00",
    submittedDate: "2023-10-22",
    status: "Pending",
  },
  {
    id: "REIM-1026",
    title: "Monitor Setup",
    category: "Office",
    amount: "2299.00",
    submittedDate: "2023-10-23",
    status: "Paid",
  },
  {
    id: "REIM-1022",
    title: "AWS Subscription",
    category: "Software",
    amount: "3120.00",
    submittedDate: "2023-10-18",
    status: "Rejected",
  },
];

export const reimbursementStats = [
  {
    label: "Total Requests",
    value: "24",
    color: "border-t-[#16284F]",
    valueClass: "text-[#14213A]",
    icon: ListTodo,
    iconClass: "bg-[#EAF0FF] text-[#16284F]",
  },
  {
    label: "Pending Approval",
    value: "5",
    color: "border-t-[#0B7CFF]",
    valueClass: "text-[#0065C8]",
    icon: ClipboardClock,
    iconClass: "bg-[#E8F2FF] text-[#0B7CFF]",
  },
  {
    label: "Paid",
    value: "14",
    color: "border-t-[#007A3D]",
    valueClass: "text-[#007A3D]",
    icon: CheckCircle2,
    iconClass: "bg-[#E6F8EE] text-[#007A3D]",
  },
  {
    label: "Rejected",
    value: "2",
    color: "border-t-[#D51E1E]",
    valueClass: "text-[#C51D1D]",
    icon: XCircle,
    iconClass: "bg-[#FFE8E8] text-[#D51E1E]",
  },
];

export const uploadedBills: UploadedBill[] = [
  { name: "Receipt.pdf", size: "1.24 MB" },
  { name: "Bill.pdf", size: "1.24 MB" },
  { name: "Invoice.pdf", size: "756 KB" },
];

export const approvalSteps = [
  {
    title: "Request Submitted",
    caption: "14 Jun 2026, 10:20 AM",
    owner: "Rahul Verma",
    role: "Admin",
    done: true,
  },
  {
    title: "HR Review Completed",
    caption: "15 Jun 2026, 03:15 PM",
    owner: "Neha Sharma",
    role: "HR Manager",
    done: true,
  },
  {
    title: "Finance Processing",
    caption: "Your request is being reviewed by Finance.",
    owner: "Manoj Mehta",
    role: "Finance Manager",
    active: true,
  },
  {
    title: "Payment Completed",
    caption: "Waiting for payment to be processed.",
    owner: "",
    role: "",
  },
];
