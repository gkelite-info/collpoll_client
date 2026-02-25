"use client";

import { getStudentFinanceDetails } from "@/lib/helpers/finance/analytics/FetchFinanceAnalytics";
import { CaretLeftIcon, CurrencyInrIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AcademicFees, {
  FeePlan,
  FeeSummaryItem,
} from "./components/academicFees";
import AdditionalDues, {
  ExcessDue,
  FinancialDue,
  NonFinancialDue,
} from "./components/additionalDues";
import FeeStats from "./components/feeStats";
import History, { Transaction } from "./components/history";
import ProfileDetails from "./components/profileCard";
import QuickActions from "./components/quickActions";
import RecordPayment from "./components/recordPayment";
import { fetchActiveObligationByStudent } from "@/lib/helpers/finance/analytics/studentPaymentHelpers";

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

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const studentIdStr = Array.isArray(params.studentId)
    ? params.studentId[0]
    : params.studentId;

  const [activeTab, setActiveTab] = useState<
    "record" | "academic" | "additional" | "history"
  >("record");

  const tabs = [
    { id: "record", label: "Record Payment" },
    { id: "academic", label: "Academic Fees" },
    { id: "additional", label: "Additional Dues" },
    { id: "history", label: "History" },
  ];

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [feePlan, setFeePlan] = useState<FeePlan | null>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummaryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [obligationId, setObligationId] = useState<number>(0);
  const [semesterId, setSemesterId] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      const targetId = studentIdStr || "2";

      try {
        setLoading(true);

        const [data, obligationData] = await Promise.all([
          getStudentFinanceDetails(targetId),
          fetchActiveObligationByStudent(Number(targetId)),
        ]);

        if (mounted && data) {
          setProfile(data.profile);

          const enrichedStats = data.stats.map((s) => ({
            ...s,
            icon: CurrencyInrIcon,
          }));
          setStats(enrichedStats);

          setFeePlan(data.feePlan);
          setFeeSummary(data.feeSummary);
          setTransactions(data.transactions);
        }

        if (mounted && obligationData.success && obligationData.obligationId) {
          setObligationId(obligationData.obligationId);
          setSemesterId(obligationData.semesterId || 1);
        }
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
  }, [studentIdStr]);

  if (loading || !profile) {
    return (
      <div className="p-4 lg:p-6 bg-[#F5F5F7] h-screen flex justify-center items-center">
        <div className="text-gray-500 animate-pulse font-semibold">
          Loading Student Financials...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-[#F5F5F7]">
      <div className="flex items-center gap-1 text-black">
        <CaretLeftIcon
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <p>Back to Semester List</p>
      </div>
      <div className="mb-2">
        <p className="text-[#282828] font-bold text-[24px] mb-2"></p>
      </div>
      <div className="w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ProfileDetails data={profile} />
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
            {activeTab === "record" && (
              <RecordPayment
                studentFeeObligationId={obligationId}
                collegeSemesterId={semesterId}
              />
            )}

            {activeTab === "academic" && feePlan && (
              <AcademicFees plan={feePlan} summary={feeSummary} />
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
                amountSpend={feePlan?.paidTillNow || 0}
                transactions={transactions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
