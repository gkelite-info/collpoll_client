"use client";

import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa6";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AcademicFees, {
  FeePlan,
  FeeSummaryItem,
} from "./components/academicFees";
import AdditionalDues, {
  ExcessDue,
  FinancialDue,
  NonFinancialDue,
} from "./components/additionalDues";
import History, { Transaction } from "./components/history";
import { useState } from "react";
import ProfileCard from "./components/profileCard";

const mockFeePlan: FeePlan = {
  programName: "B.Tech CSE - 2nd Year",
  type: "Academic Fees",
  academicYear: "2025-2026",
  openingBalance: 0,
  applicableFees: 524000,
  scholarship: 0,
  totalPayable: 524000,
  paidTillNow: 24000,
  pendingAmount: 495630,
};

const mockFeeSummary: FeeSummaryItem[] = [
  {
    id: 1,
    paidAmount: 524000,
    paymentMode: "Online",
    entity: "Academic fee Payment",
    paidOn: "11/03/2025",
    status: "Success",
    comments: "-",
  },
];

const mockNonFinancialDues: NonFinancialDue[] = [
  {
    id: 1,
    department: "Library",
    category: "Book Not Returned",
    dueDate: "25 Oct 2025",
    status: "Pending",
    remarks: "Python Programming book overdue",
  },
  {
    id: 2,
    department: "Examination Branch",
    category: "Hall Ticket Clearance",
    dueDate: "10 Nov 2025",
    status: "Pending",
    remarks: "Previous semester attendance not updated",
  },
  {
    id: 3,
    department: "Sports Department",
    category: "Equipment Return",
    dueDate: "28 Sep 2025",
    status: "Pending",
    remarks: "All issued items returned",
  },
];

const mockExcessDues: ExcessDue[] = [
  {
    id: 1,
    department: "",
    category: "Infrastructure fess (yearly)",
    amount: 0.0,
  },
  { id: 2, department: "Finance", category: "Aptitude training", amount: 0.0 },
];

const mockFinancialDues: FinancialDue[] = [
  {
    id: 1,
    amount: 900,
    penaltyAmount: 0,
    waiverAmount: 0,
    totalPayable: 885,
    paidAmount: 0,
    pendingAmount: 885,
    department: "CEC",
    category: "Aptitude Training",
    status: "Pending",
    paymentGateway: "PayPal",
    remarks: "This is a financial Due",
  },
  {
    id: 2,
    amount: 23145,
    penaltyAmount: 15000,
    waiverAmount: 0,
    totalPayable: 234567,
    paidAmount: 0,
    pendingAmount: 234567,
    department: "CEC",
    category: "Infrastructure Fees",
    status: "Pending",
    paymentGateway: "PayPal",
    remarks: "This is a financial Due",
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 6698,
    items: "Academic Fees",
    qty: 1,
    costCenter: "Finance Department",
    amount: 25640,
    message: "-",
    gateway: "PayPal",
    trxnId: "1.123456789E11",
    paidOn: "10 Sep 25 05:24 pm",
    status: "Success",
  },
  {
    id: 6697,
    items: "Academic Fees",
    qty: 1,
    costCenter: "Finance Department",
    amount: 25640,
    message: "-",
    gateway: "PayPal",
    trxnId: "1.123456789E11",
    paidOn: "10 Sep 25 05:24 pm",
    status: "Failure",
  },
  {
    id: 6699,
    items: "Academic Fees",
    qty: 1,
    costCenter: "Finance Department",
    amount: 203640,
    message: "-",
    gateway: "PayPal",
    trxnId: "1.123456789E11",
    paidOn: "10 Sep 25 05:24 pm",
    status: "Failure",
  },
];

// --- MAIN PAGE COMPONENT ---
const Page = () => {
  const [activeTab, setActiveTab] = useState<
    "academic" | "additional" | "history"
  >("academic");

  const tabs = [
    { id: "academic", label: "Academic Fees" },
    { id: "additional", label: "Additional Dues" },
    { id: "history", label: "History" },
  ];

  return (
    <section className="min-h-screen p-4 lg:p-6 bg-[#F5F5F7]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="max-w-3xl">
            <h1 className="text-[#282828] font-bold text-[28px] mb-1">
              Payments - CSE 2nd Year
            </h1>
            <p className="text-[#282828] text-[16px] md:text-[18px]">
              Manage Fees, Track Transactions and Stay Updated Instantly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-[320px]">
              <CourseScheduleCard />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-[#525252]">Subject :</p>
              <div className="rounded-full bg-[#DCEAE2] px-4 py-1 text-sm font-medium text-[#43C17A]">
                All
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#525252]">Semester :</p>
              <div className="relative">
                <select className="rounded-full bg-[#DCEAE2] px-4 py-1 pr-8 text-sm font-medium text-[#43C17A] appearance-none focus:outline-none cursor-pointer">
                  <option>III</option>
                  <option>II</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#43C17A]">
                  <FaChevronDown />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#525252]">Year :</p>
              <div className="relative">
                <select className="rounded-full bg-[#DCEAE2] px-4 py-1 pr-8 text-sm font-medium text-[#43C17A] appearance-none focus:outline-none cursor-pointer">
                  <option>2nd Year</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#43C17A]">
                  <FaChevronDown />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ProfileCard
            name="Shravani Reddy"
            course="B.Tech - Computer Science and Engineering"
            year="2nd Year"
            rollNo="CSE2K25-048"
            email="shravanireddy@digicampus.edu.in"
            mobile="9876543210"
            image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
          />

          <div className="bg-white shadow-sm rounded-xl p-8 font-sans min-h-[600px]">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center mb-10">
                <div className="relative flex items-center bg-gray-100/80 backdrop-blur-xl border border-white/50 p-1.5 rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                        activeTab === tab.id
                          ? "text-white delay-100"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="relative z-10">{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 rounded-full -z-0"
                          style={{
                            background:
                              "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                          }}
                        >
                          <div className="absolute inset-0 rounded-full border-t border-white/30" />
                          <div className="absolute inset-0 rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.4)]" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="transition-opacity duration-300">
                {activeTab === "academic" && (
                  <AcademicFees plan={mockFeePlan} summary={mockFeeSummary} />
                )}
                {activeTab === "additional" && (
                  <AdditionalDues
                    financialDues={mockFinancialDues}
                    nonFinancialDues={mockNonFinancialDues}
                    excessDues={mockExcessDues}
                  />
                )}
                {activeTab === "history" && (
                  <History
                    amountSpend={25000}
                    transactions={mockTransactions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
