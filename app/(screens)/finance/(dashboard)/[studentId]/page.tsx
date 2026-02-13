"use client";

import { motion } from "framer-motion";
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
import { useEffect, useState } from "react";
import ProfileCard from "./components/profileCard";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchStudentProfileCardData } from "@/lib/helpers/student/payments/fetchStudentProfileCardData";
import PaymentsSkeleton from "./shimmer/PaymentsSkeleton";
import { useStudent } from "@/app/utils/context/student/useStudent";
import RecordPayment from "./components/recordPayment";
import FeeStats from "./components/feeStats";
import QuickActions from "./components/quickActions";
import ProfileDetails from "./components/profileCard";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CurrencyInrIcon,
} from "@phosphor-icons/react";

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

const stats = [
  {
    label: "Total Fee",
    value: "₹5,24,000",
    bg: "bg-[#E2DAFF]", // Light Purple
    iconColor: "text-[#6C20CA]",
    icon: CurrencyInrIcon,
  },
  {
    label: "Paid Till Now",
    value: "₹24,000",
    bg: "bg-[#E6FBEA]", // Light Green
    iconColor: "text-[#43C17A]",
    icon: CurrencyInrIcon,
  },
  {
    label: "Pending Amount",
    value: "₹4,95,630",
    bg: "bg-[#FFEDDA]", // Light Orange
    iconColor: "text-[#FFBB70]",
    icon: CurrencyInrIcon,
  },
  {
    label: "Due Date",
    value: "15 Feb 2026",
    bg: "bg-[#CEE6FF]", // Light Blue
    iconColor: "text-[#60AEFF]",
    icon: CurrencyInrIcon,
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

const Page = () => {
  const [activeTab, setActiveTab] = useState<
    "record" | "academic" | "additional" | "history"
  >("record");

  const tabs = [
    { id: "record", label: "Record Payment" },
    { id: "academic", label: "Academic Fees" },
    { id: "additional", label: "Additional Dues" },
    { id: "history", label: "History" },
  ];

  const [profile, setProfile] = useState<{
    name: string;
    course: string;
    branch: string;
    year: string;
    rollNo: string;
    email: string;
    mobile: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     if (userId === null) return;

  //     const id = userId;
  //     let mounted = true;

  //     async function fetchData() {
  //       try {
  //         setLoading(true);
  //         const data = await fetchStudentProfileCardData(id);
  //         if (mounted) setProfile(data);
  //       } catch (err) {
  //         console.error(err);
  //       } finally {
  //         if (mounted) setLoading(false);
  //       }
  //     }

  //     fetchData();

  //     return () => {
  //       mounted = false;
  //     };
  //   }, [userId]);

  const mockProfileData = {
    name: "Shravani Reddy",
    course: "B.Tech – Computer Science and Engineering",
    year: "2nd Year",
    rollNo: "CSE2K25-048",
    email: "shravanireddy@digicampus.edu.in",
    mobile: "9876543210",
    imageUrl: "/adityamenon.png",
  };
  //   if (loading) {
  //     return <PaymentsSkeleton />;
  //   }

  return (
    <div className="p-4 lg:p-6 bg-[#F5F5F7]">
      <div className="flex items-center gap-1 text-black">
        <CaretLeftIcon />
        <p>Back to Semester List</p>
      </div>
      <div className="mb-2">
        <p className="text-[#282828] font-bold text-[24px] mb-2"></p>
      </div>
      <div className="w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ProfileDetails data={mockProfileData} />
          </div>

          <div className="lg:col-span-4">
            <QuickActions />
          </div>
        </div>

        <FeeStats stats={stats} />
      </div>
      <div className="bg-white shadow-sm rounded-xl p-8 font-sans min-h-[600px] mt-6">
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
            {/* Added RecordPayment Component */}
            {activeTab === "record" && <RecordPayment />}

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
              <History amountSpend={25000} transactions={mockTransactions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
