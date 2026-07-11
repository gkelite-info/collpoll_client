export type Attachment = {
  name: string;
  size: string;
  type: "pdf" | "jpg" | "png";
};

export type ReimbursementRequest = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  employeeAvatar: string;
  amount: string;
  submittedDate: string;
  expenseTitle: string;
  expenseDate: string;
  expenseCategory: string;
  paymentMethod: string;
  description: string;
  attachments: Attachment[];
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
};

export const mockReimbursementRequests: ReimbursementRequest[] = [
  {
    id: "RB-2026-0145",
    employeeName: "Rahul Verma",
    employeeEmail: "rahul.verma@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    amount: "₹4,580.00",
    submittedDate: "14 Jun 2026, 10:20 AM",
    expenseTitle: "Business Dinner with Clients",
    expenseDate: "13 Jun 2026",
    expenseCategory: "Client Meeting",
    paymentMethod: "Bank Transfer",
    description:
      "Business dinner with clients to discuss new project requirements and strengthen partnership.",
    attachments: [
      { name: "Receipt.pdf", size: "1.24 MB", type: "pdf" },
      { name: "Bill.jpg", size: "1.08 MB", type: "jpg" },
      { name: "Invoice.pdf", size: "756 KB", type: "pdf" },
    ],
    bankDetails: {
      bankName: "HDFC Bank",
      accountHolderName: "Rahul Verma",
      accountNumber: "**** **** **** 4587",
      ifscCode: "HDFC0001234",
    },
  },
  {
    id: "RB-2026-0144",
    employeeName: "Priya Nair",
    employeeEmail: "priya.nair@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    amount: "₹2,350.00",
    submittedDate: "14 Jun 2026, 09:15 AM",
    expenseTitle: "Travel to Branch Office",
    expenseDate: "12 Jun 2026",
    expenseCategory: "Travel",
    paymentMethod: "Bank Transfer",
    description: "Cab fare and local transit for branch office visit.",
    attachments: [{ name: "Cab_Receipt.pdf", size: "450 KB", type: "pdf" }],
    bankDetails: {
      bankName: "ICICI Bank",
      accountHolderName: "Priya Nair",
      accountNumber: "**** **** **** 8890",
      ifscCode: "ICIC0003456",
    },
  },
  {
    id: "RB-2026-0143",
    employeeName: "Arjun Mehta",
    employeeEmail: "arjun.mehta@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/men/54.jpg",
    amount: "₹1,890.00",
    submittedDate: "13 Jun 2026, 06:45 PM",
    expenseTitle: "Team Lunch",
    expenseDate: "13 Jun 2026",
    expenseCategory: "Meals",
    paymentMethod: "Bank Transfer",
    description: "Team lunch after successful project delivery.",
    attachments: [{ name: "Lunch_Bill.jpg", size: "1.5 MB", type: "jpg" }],
    bankDetails: {
      bankName: "Axis Bank",
      accountHolderName: "Arjun Mehta",
      accountNumber: "**** **** **** 1234",
      ifscCode: "UTIB0000123",
    },
  },
  {
    id: "RB-2026-0142",
    employeeName: "Sneha Iyer",
    employeeEmail: "sneha.iyer@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    amount: "₹3,120.00",
    submittedDate: "13 Jun 2026, 04:30 PM",
    expenseTitle: "Software License Renewal",
    expenseDate: "10 Jun 2026",
    expenseCategory: "Software",
    paymentMethod: "Corporate Card",
    description: "Annual renewal for design software suite.",
    attachments: [{ name: "License_Invoice.pdf", size: "890 KB", type: "pdf" }],
    bankDetails: {
      bankName: "SBI",
      accountHolderName: "Sneha Iyer",
      accountNumber: "**** **** **** 5678",
      ifscCode: "SBIN0005678",
    },
  },
  {
    id: "RB-2026-0141",
    employeeName: "Vikram Singh",
    employeeEmail: "vikram.singh@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/men/85.jpg",
    amount: "₹2,750.00",
    submittedDate: "13 Jun 2026, 11:05 AM",
    expenseTitle: "Office Supplies",
    expenseDate: "11 Jun 2026",
    expenseCategory: "Office",
    paymentMethod: "Bank Transfer",
    description: "Purchased ergonomic accessories for the team.",
    attachments: [{ name: "Supplies_Bill.pdf", size: "1.1 MB", type: "pdf" }],
    bankDetails: {
      bankName: "HDFC Bank",
      accountHolderName: "Vikram Singh",
      accountNumber: "**** **** **** 9012",
      ifscCode: "HDFC0009012",
    },
  },
  {
    id: "RB-2026-0140",
    employeeName: "Meera Joshi",
    employeeEmail: "meera.joshi@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/women/24.jpg",
    amount: "₹1,450.00",
    submittedDate: "12 Jun 2026, 03:20 PM",
    expenseTitle: "Client Gifts",
    expenseDate: "09 Jun 2026",
    expenseCategory: "Client Meeting",
    paymentMethod: "Bank Transfer",
    description: "Welcome gifts for new clients.",
    attachments: [{ name: "Gift_Receipt.jpg", size: "2.1 MB", type: "jpg" }],
    bankDetails: {
      bankName: "Kotak Bank",
      accountHolderName: "Meera Joshi",
      accountNumber: "**** **** **** 3456",
      ifscCode: "KKBK0003456",
    },
  },
  {
    id: "RB-2026-0139",
    employeeName: "Karan Patel",
    employeeEmail: "karan.patel@tekton.com",
    employeeAvatar: "https://randomuser.me/api/portraits/men/15.jpg",
    amount: "₹5,600.00",
    submittedDate: "12 Jun 2026, 10:40 AM",
    expenseTitle: "Conference Tickets",
    expenseDate: "08 Jun 2026",
    expenseCategory: "Training",
    paymentMethod: "Corporate Card",
    description: "Tickets for the annual tech conference.",
    attachments: [{ name: "Tickets.pdf", size: "500 KB", type: "pdf" }],
    bankDetails: {
      bankName: "ICICI Bank",
      accountHolderName: "Karan Patel",
      accountNumber: "**** **** **** 7890",
      ifscCode: "ICIC0007890",
    },
  },
];
