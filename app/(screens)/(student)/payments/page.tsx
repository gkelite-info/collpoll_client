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

const Page = () => {
  const [activeTab, setActiveTab] = useState<
    "academic" | "additional" | "history"
  >("academic");

  const tabs = [
    { id: "academic", label: "Academic Fees" },
    { id: "additional", label: "Additional Dues" },
    { id: "history", label: "History" },
  ];

  const { userId } = useUser();

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

  useEffect(() => {
    if (userId === null) return;

    const id = userId; 
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const data = await fetchStudentProfileCardData(id); 
        if (mounted) setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className=" p-4 lg:p-6 bg-[#F5F5F7]">
        <div className="mb-6">
          <h1 className="text-[#282828] font-bold text-[24px] mb-2">
            Payments – {profile ? `${profile.branch} ${profile.year}` : ""}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-[#282828] text-[16px] md:text-[18px] max-w-3xl">
              Manage Fees, Track Transactions and Stay Updated Instantly.
            </p>

            <div className="flex-shrink-0 ml-6 w-[320px]">
              <CourseScheduleCard />
            </div>

          </div>
        </div>



        {profile && (
          <ProfileCard
            name={profile.name}
            course={profile.course}
            year={profile.year}
            rollNo={profile.rollNo}
            email={profile.email}
            mobile={profile.mobile}
            image="/rahul.png"
          />
        )}

        <div className="bg-white shadow-sm rounded-xl p-8 font-sans min-h-[600px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center mb-10">
              <div className="relative flex items-center bg-gray-100/80 backdrop-blur-xl border border-white/50 p-1.5 rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${activeTab === tab.id
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
  );
};

export default Page;
