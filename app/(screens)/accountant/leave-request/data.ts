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

export const ACCOUNTANT_LEAVE_REQUEST_DB_ROLE = "Finance";

export type AccountantLeaveStatus = "approved" | "pending" | "rejected";

export type LeaveChatMessage = {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  time: string;
  isMe?: boolean;
};

export type AccountantLeaveRequest = {
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
  status: AccountantLeaveStatus;
  chat: LeaveChatMessage[];
};

export const leaveRequests: AccountantLeaveRequest[] = [
  {
    serialNo: "01",
    employeeId: "AC-2345001",
    name: "Ananya Sharma",
    role: "Accountant",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    requestedDate: "10/11/2025",
    dateRange: "12/11/2025 - 14/11/2025",
    days: "03",
    leaveType: "Sick",
    description: "I am not feeling well and need rest for recovery.",
    status: "pending",
    chat: [
      {
        id: "01-1",
        senderName: "Ananya Sharma",
        senderRole: "Accountant",
        message: "I have uploaded my sick leave request for three days.",
        time: "10:10 AM",
        isMe: true,
      },
    ],
  },
  {
    serialNo: "02",
    employeeId: "AC-2345002",
    name: "Arun Kumar",
    role: "Accounts Executive",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    requestedDate: "09/11/2025",
    dateRange: "10/11/2025 - 11/11/2025",
    days: "02",
    leaveType: "Personal",
    description: "Personal work at home.",
    status: "approved",
    chat: [
      {
        id: "02-1",
        senderName: "Arun Kumar",
        senderRole: "Accounts Executive",
        message: "Requesting two days of personal leave.",
        time: "09:45 AM",
        isMe: true,
      },
    ],
  },
  {
    serialNo: "03",
    employeeId: "AC-2345003",
    name: "Sneha Reddy",
    role: "Accountant",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop",
    requestedDate: "08/11/2025",
    dateRange: "08/11/2025 - 10/11/2025",
    days: "03",
    leaveType: "Emergency",
    description: "Family emergency travel.",
    attachment: "emergency-note.pdf",
    status: "rejected",
    chat: [
      {
        id: "03-1",
        senderName: "Sneha Reddy",
        senderRole: "Accountant",
        message: "I need emergency leave for family travel.",
        time: "08:30 AM",
        isMe: true,
      },
    ],
  },
  {
    serialNo: "04",
    employeeId: "AC-2345004",
    name: "Vikram Singh",
    role: "Accounts Executive",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    requestedDate: "07/11/2025",
    dateRange: "15/11/2025 - 15/11/2025",
    days: "01",
    leaveType: "Travel",
    description: "One day travel leave.",
    status: "approved",
    chat: [
      {
        id: "04-1",
        senderName: "Vikram Singh",
        senderRole: "Accounts Executive",
        message: "Requesting one day travel leave.",
        time: "11:20 AM",
        isMe: true,
      },
    ],
  },
  {
    serialNo: "05",
    employeeId: "AC-2345005",
    name: "Pooja Nair",
    role: "Accountant",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
    requestedDate: "06/11/2025",
    dateRange: "18/11/2025 - 19/11/2025",
    days: "02",
    leaveType: "Medical",
    description: "Medical leave for checkup.",
    attachment: "medical-prescription.pdf",
    status: "pending",
    chat: [
      {
        id: "05-1",
        senderName: "Pooja Nair",
        senderRole: "Accountant",
        message: "Sharing my medical leave request for checkup.",
        time: "03:25 PM",
        isMe: true,
      },
    ],
  },
];
