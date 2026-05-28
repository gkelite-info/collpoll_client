export const leaveSummaryCards = [
  {
    label: "Total Requests",
    status: "total",
    value: "15",
    style: "bg-[#60AEFF]",
    iconColor: "#60AEFF",
    isActive: true,
  },
  {
    label: "Approved",
    status: "approved",
    value: "08",
    style: "bg-[#E6FBEA]",
    iconColor: "#43C17A",
  },
  {
    label: "Pending",
    status: "pending",
    value: "02",
    style: "bg-[#FFEDDA]",
    iconColor: "#FFB45F",
  },
  {
    label: "Rejected",
    status: "rejected",
    value: "05",
    style: "bg-[#FFE1E1]",
    iconColor: "#FF2B2B",
  },
];

export type FinanceLeaveStatus = "approved" | "pending" | "rejected";

export type LeaveChatMessage = {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  time: string;
  isMe?: boolean;
};

export type FinanceLeaveRequest = {
  employeeLeaveRequestId?: number;
  serialNo: string;
  employeeId: string;
  name: string;
  role: string;
  photo: string;
  requestedDate: string;
  dateRange: string;
  days: string;
  leaveType: string;
  description: string;
  attachment?: string;
  status: FinanceLeaveStatus;
  chat: LeaveChatMessage[];
};

export const leaveRequests: FinanceLeaveRequest[] = [
  {
    serialNo: "01",
    employeeId: "FM-2345001",
    name: "Ananya Sharma",
    role: "Finance Manager",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    requestedDate: "10/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Sick",
    description: "I am not feeling well and need rest for recovery.",
    status: "pending",
    chat: [
      { id: "01-1", senderName: "Ananya Sharma", senderRole: "Finance Manager", message: "I have uploaded my sick leave request for three days.", time: "10:10 AM", isMe: true },
      { id: "01-2", senderName: "HR Desk", senderRole: "HR", message: "Please attach the consultation slip once available.", time: "10:18 AM" },
      { id: "01-3", senderName: "Ananya Sharma", senderRole: "Finance Manager", message: "Sure, I will share it after the appointment.", time: "10:22 AM", isMe: true },
    ],
  },
  {
    serialNo: "02",
    employeeId: "FM-2345002",
    name: "Estelle Bald",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=120&h=120&fit=crop",
    requestedDate: "09/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Personal",
    description: "I need leave for personal work at home.",
    status: "approved",
    chat: [
      { id: "02-1", senderName: "Estelle Bald", senderRole: "Finance Executive", message: "Requesting two days of personal leave.", time: "09:45 AM", isMe: true },
      { id: "02-2", senderName: "HR Desk", senderRole: "HR", message: "Your backup has been noted. Leave approved.", time: "11:05 AM" },
    ],
  },
  {
    serialNo: "03",
    employeeId: "FM-2345003",
    name: "Amanda Wo",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop",
    requestedDate: "08/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Emergency",
    description: "I need to travel urgently for a family emergency.",
    attachment: "emergency-note.pdf",
    status: "rejected",
    chat: [
      { id: "03-1", senderName: "Amanda Wo", senderRole: "Finance Executive", message: "I need emergency leave from 12 Nov to 14 Nov.", time: "08:30 AM", isMe: true },
      { id: "03-2", senderName: "HR Desk", senderRole: "HR", message: "The monthly closing activity is scheduled in the same window.", time: "09:00 AM" },
      { id: "03-3", senderName: "HR Desk", senderRole: "HR", message: "Please revise the dates or assign a confirmed handover.", time: "09:05 AM" },
    ],
  },
  {
    serialNo: "04",
    employeeId: "FM-2345004",
    name: "Lily Tano",
    role: "Finance Manager",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop",
    requestedDate: "10/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Travel",
    description: "I need two days leave for travel.",
    status: "pending",
    chat: [
      { id: "04-1", senderName: "Lily Tano", senderRole: "Finance Manager", message: "I am travelling for a personal commitment.", time: "01:15 PM", isMe: true },
      { id: "04-2", senderName: "HR Desk", senderRole: "HR", message: "Please confirm who will monitor the payment approvals.", time: "01:40 PM" },
    ],
  },
  {
    serialNo: "05",
    employeeId: "FM-2345005",
    name: "Kevin Ray",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    requestedDate: "07/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Medical",
    description: "Medical leave for treatment and follow-up checkup.",
    attachment: "medical-prescription.pdf",
    status: "approved",
    chat: [
      { id: "05-1", senderName: "Kevin Ray", senderRole: "Finance Executive", message: "Sharing my medical leave request with prescription attached.", time: "03:25 PM", isMe: true },
      { id: "05-2", senderName: "HR Desk", senderRole: "HR", message: "Documents verified. Approved for three days.", time: "04:10 PM" },
    ],
  },
  {
    serialNo: "06",
    employeeId: "FM-2345006",
    name: "Sophia Lin",
    role: "Finance Manager",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    requestedDate: "06/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Function",
    description: "Leave requested to attend a family function.",
    status: "rejected",
    chat: [
      { id: "06-1", senderName: "Sophia Lin", senderRole: "Finance Manager", message: "Requesting leave for a family function.", time: "12:05 PM", isMe: true },
      { id: "06-2", senderName: "HR Desk", senderRole: "HR", message: "This overlaps with audit submission. Request rejected for now.", time: "12:50 PM" },
    ],
  },
  {
    serialNo: "07",
    employeeId: "FM-2345007",
    name: "Daniel Cruz",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    requestedDate: "05/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Sick",
    description: "Sick leave due to fever and throat infection.",
    status: "approved",
    chat: [
      { id: "07-1", senderName: "Daniel Cruz", senderRole: "Finance Executive", message: "I am down with fever and requesting sick leave.", time: "08:20 AM", isMe: true },
      { id: "07-2", senderName: "HR Desk", senderRole: "HR", message: "Approved. Please rest and update your reporting manager.", time: "08:42 AM" },
    ],
  },
  {
    serialNo: "08",
    employeeId: "FM-2345008",
    name: "Neha Sharma",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
    requestedDate: "04/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Personal",
    description: "Personal leave requested for unavoidable work.",
    status: "rejected",
    chat: [
      { id: "08-1", senderName: "Neha Sharma", senderRole: "Finance Executive", message: "I need personal leave for two days.", time: "02:00 PM", isMe: true },
      { id: "08-2", senderName: "HR Desk", senderRole: "HR", message: "Please resubmit after quarter-end tasks are assigned.", time: "02:30 PM" },
    ],
  },
  {
    serialNo: "09",
    employeeId: "FM-2345009",
    name: "Jason Paul",
    role: "Finance Manager",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    requestedDate: "03/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Emergency",
    description: "Emergency leave requested for family support.",
    status: "approved",
    chat: [
      { id: "09-1", senderName: "Jason Paul", senderRole: "Finance Manager", message: "I need emergency leave and have assigned my pending approvals.", time: "11:30 AM", isMe: true },
      { id: "09-2", senderName: "HR Desk", senderRole: "HR", message: "Handover confirmed. Leave approved.", time: "12:12 PM" },
    ],
  },
  {
    serialNo: "10",
    employeeId: "FM-2345010",
    name: "Reema Sajid",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop",
    requestedDate: "02/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Travel",
    description: "Travel leave requested for an outstation commitment.",
    status: "rejected",
    chat: [
      { id: "10-1", senderName: "Reema Sajid", senderRole: "Finance Executive", message: "Requesting leave for travel from 12 Nov.", time: "04:00 PM", isMe: true },
      { id: "10-2", senderName: "HR Desk", senderRole: "HR", message: "Travel request cannot be approved during payroll closure.", time: "04:40 PM" },
    ],
  },
  {
    serialNo: "11",
    employeeId: "FM-2345011",
    name: "Suresh N",
    role: "Finance Manager",
    photo: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=120&h=120&fit=crop",
    requestedDate: "01/11/2025",
    dateRange: "12/11/2025 - 13/11/2025",
    days: "02",
    leaveType: "Medical",
    description: "Medical leave for scheduled procedure.",
    status: "approved",
    chat: [
      { id: "11-1", senderName: "Suresh N", senderRole: "Finance Manager", message: "I have a scheduled procedure and need two days leave.", time: "09:10 AM", isMe: true },
      { id: "11-2", senderName: "HR Desk", senderRole: "HR", message: "Approved. Wishing you a quick recovery.", time: "09:36 AM" },
    ],
  },
  {
    serialNo: "12",
    employeeId: "FM-2345012",
    name: "Priya Menon",
    role: "Finance Executive",
    photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=120&h=120&fit=crop",
    requestedDate: "31/10/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Function",
    description: "Leave requested for a family function.",
    status: "rejected",
    chat: [
      { id: "12-1", senderName: "Priya Menon", senderRole: "Finance Executive", message: "Requesting leave to attend a family function.", time: "05:15 PM", isMe: true },
      { id: "12-2", senderName: "HR Desk", senderRole: "HR", message: "Request rejected because the team has limited coverage on those dates.", time: "05:55 PM" },
    ],
  },
];
