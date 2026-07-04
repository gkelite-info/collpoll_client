export type ExpenseRow = {
  id: string;
  expenseName: string;
  paidTo: string;
  designation: string;
  amount: string;
  date: string;
  paymentMethod: string;
  recordedBy: string;
};

export type CategoryDetail = {
  title: string;
  description: string;
  totalSpending: string;
  records: string;
  monthSpending: string;
  lastDate: string;
  rows: ExpenseRow[];
};

export const categoryDetails: Record<string, CategoryDetail> = {
  salaries: {
    title: "Salaries",
    description:
      "Overview of all salary related expenses including faculty, staff and other payouts.",
    totalSpending: "18.5 L",
    records: "246",
    monthSpending: "4.2 L",
    lastDate: "23 May 2025",
    rows: [
      {
        id: "1",
        expenseName: "Faculty Salary - May 2025",
        paidTo: "Dr. Priya Sharma",
        designation: "Professor",
        amount: "1,20,000",
        date: "23 May 2025",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Staff Salary - May 2025",
        paidTo: "Ramesh Kumar",
        designation: "Office Assistant",
        amount: "25,000",
        date: "22 May 2025",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  events: {
    title: "Events",
    description:
      "Overview of event spending for annual day, workshops, seminars and college programs.",
    totalSpending: "4.2 L",
    records: "8",
    monthSpending: "75 K",
    lastDate: "22 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Annual Day Event",
        paidTo: "Stage Vendors",
        designation: "Event Setup",
        amount: "75,000",
        date: "22 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Workshop Refreshments",
        paidTo: "Campus Caterers",
        designation: "Catering",
        amount: "18,500",
        date: "18 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  furniture: {
    title: "Furniture",
    description:
      "Overview of furniture purchases, repairs and asset additions across campus.",
    totalSpending: "2.8 L",
    records: "32",
    monthSpending: "45.6 K",
    lastDate: "21 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Office Chairs Purchase",
        paidTo: "Urban Furnishings",
        designation: "Furniture Vendor",
        amount: "45,600",
        date: "21 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Classroom Desk Repair",
        paidTo: "Campus Workshop",
        designation: "Maintenance",
        amount: "12,000",
        date: "16 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
  "repairs-maintenance": {
    title: "Repairs & Maintenance",
    description:
      "Overview of campus repair work, maintenance jobs and facility upkeep expenses.",
    totalSpending: "1.5 L",
    records: "112",
    monthSpending: "38 K",
    lastDate: "20 Oct 2023",
    rows: [
      {
        id: "1",
        expenseName: "Electrical Maintenance",
        paidTo: "Bright Electricals",
        designation: "Service Vendor",
        amount: "22,000",
        date: "20 Oct 2023",
        paymentMethod: "BANK TRANSFER",
        recordedBy: "Anuv Shetty",
      },
      {
        id: "2",
        expenseName: "Plumbing Repairs",
        paidTo: "Campus Services",
        designation: "Maintenance",
        amount: "16,000",
        date: "17 Oct 2023",
        paymentMethod: "UPI",
        recordedBy: "Anuv Shetty",
      },
    ],
  },
};
