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
import FeeStats from "./components/feeStats";
import History, { Transaction } from "./components/history";
import ProfileDetails from "./components/profileCard";
import QuickActions from "./components/quickActions";
import RecordPayment from "./components/recordPayment";
import AdditionalDues, {
  ExcessDue,
  FinancialDue,
  NonFinancialDue,
} from "./components/additionalDues";
import {
  ProfileShimmer,
  QuickActionsShimmer,
  StatCardShimmer,
} from "./shimmer/TableShimmer";
import { useUser } from "@/app/utils/context/UserContext";

// 🟢 PDF IMPORTS
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import {
  fetchActiveObligationByStudent,
  fetchRecentOfflinePayments,
} from "@/lib/helpers/finance/analytics/studentPaymentHelpers";
import ComposeEmailModal from "@/app/components/modals/ComposeEmailModal";

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

  const { collegeId } = useUser();
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false);

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

  const [isAcademicLoading, setIsAcademicLoading] = useState(false);
  const [academicPage, setAcademicPage] = useState(1);
  const [academicTotal, setAcademicTotal] = useState(0);

  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

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
          const enrichedStats = data.stats.map((s: any) => ({
            ...s,
            icon: CurrencyInrIcon,
          }));
          setStats(enrichedStats);
          setFeePlan(data.feePlan);
          setFeeSummary(data.feeSummary);
          setAcademicTotal(data.feeSummary.length);
          setTransactions(data.transactions);
          setHistoryTotal(data.transactions.length);
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

  const handleAcademicPageChange = async (newPage: number) => {
    setAcademicPage(newPage);
    setIsAcademicLoading(true);
    setTimeout(() => setIsAcademicLoading(false), 400);
  };

  const handleHistoryPageChange = async (newPage: number) => {
    setHistoryPage(newPage);
    setIsHistoryLoading(true);
    setTimeout(() => setIsHistoryLoading(false), 400);
  };

  // 🟢 DYNAMIC PDF GENERATOR FUNCTION
  const handleDownloadStatement = async () => {
    if (!profile || !feePlan || !obligationId) {
      toast.error("Data is still loading. Please try again in a moment.");
      return;
    }

    const toastId = toast.loading("Generating Statement PDF...");

    try {
      // Fetch up to 100 recent offline payments for the report
      const result = await fetchRecentOfflinePayments(obligationId, 1, 100);
      const offlinePayments = result.success ? result.data : [];

      const doc = new jsPDF();
      let yPos = 20;

      // 1. Header (Emerald Green theme)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(67, 193, 122);
      doc.text("Financial Statement", 105, yPos, { align: "center" });
      yPos += 8;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Generated by Finance Department", 105, yPos, {
        align: "center",
      });
      yPos += 12;

      // Divider Line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // 2. Student Details Section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Student Details", 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Name: ${profile.name}`, 14, yPos);
      doc.text(`Roll No: ${profile.rollNo}`, 120, yPos);
      yPos += 6;
      doc.text(`Course: ${profile.course}`, 14, yPos);
      doc.text(`Year: ${profile.year}`, 120, yPos);
      yPos += 6;
      doc.text(`Email: ${profile.email}`, 14, yPos);
      doc.text(`Mobile: ${profile.mobile}`, 120, yPos);
      yPos += 12;

      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // 3. Fee Plan Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Fee Summary", 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Payable: INR ${feePlan.totalPayable.toLocaleString("en-IN")}`,
        14,
        yPos,
      );
      doc.text(
        `Paid Till Now: INR ${feePlan.paidTillNow.toLocaleString("en-IN")}`,
        80,
        yPos,
      );

      doc.setTextColor(239, 68, 68); // Red text for pending amount
      doc.setFont("helvetica", "bold");
      doc.text(
        `Pending: INR ${feePlan.pendingAmount.toLocaleString("en-IN")}`,
        145,
        yPos,
      );
      yPos += 12;

      doc.setDrawColor(220, 220, 220);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // 4. Offline Payments Data Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Recent Offline Payments", 14, yPos);
      yPos += 8;

      // Table Header Background
      doc.setFillColor(243, 244, 246);
      doc.rect(14, yPos, 182, 10, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Date", 20, yPos + 6);
      doc.text("Payment Mode", 80, yPos + 6);
      doc.text("Amount Received (INR)", 140, yPos + 6);
      yPos += 15;

      // Table Rows
      doc.setFont("helvetica", "normal");
      if (offlinePayments!.length > 0) {
        offlinePayments!.forEach((payment: any) => {
          const dateStr = new Date(payment.paymentDate).toLocaleDateString(
            "en-IN",
          );
          const modeStr = payment.paymentMode || "-";
          const amtStr = `INR ${Number(payment.paidAmount).toLocaleString("en-IN")}`;

          doc.text(dateStr, 20, yPos);
          doc.text(modeStr, 80, yPos);
          doc.text(amtStr, 140, yPos);
          yPos += 8;

          // Prevent spilling off the page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      } else {
        doc.text("No offline payments found for this student.", 20, yPos);
      }

      // 5. Footer Signature
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const timestamp = new Date().toLocaleString("en-IN");
      doc.text(`Document generated securely on: ${timestamp}`, 105, 290, {
        align: "center",
      });

      // Save the PDF
      const safeName = profile.name.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`${safeName}_Financial_Statement.pdf`);

      toast.success("Statement downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate statement.", { id: toastId });
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-[#F5F5F7] min-h-screen">
      <div className="flex items-center gap-1 text-black mb-6">
        <CaretLeftIcon
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <p>Back to Semester List</p>
      </div>

      <div className="w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {loading || !profile ? (
              <ProfileShimmer />
            ) : (
              <ProfileDetails data={profile} />
            )}
          </div>
          <div className="lg:col-span-4">
            {loading || !profile ? (
              <QuickActionsShimmer />
            ) : (
              <QuickActions
                onSendEmail={() => setIsComposeEmailOpen(true)}
                onDownloadStatement={handleDownloadStatement} // 🟢 ATTACHED PDF GENERATOR
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          {loading || !profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <StatCardShimmer key={i} />
              ))}
            </div>
          ) : (
            <FeeStats stats={stats} />
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl p-8 font-sans min-h-[600px] mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-10">
            <div className="relative flex items-center bg-gray-100/80 backdrop-blur-xl border border-white/50 p-1.5 rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative z-10 cursor-pointer px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
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
                    />
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
              <AcademicFees
                plan={feePlan}
                summary={feeSummary}
                isLoading={isAcademicLoading || loading}
                currentPage={academicPage}
                totalItems={academicTotal}
                onPageChange={handleAcademicPageChange}
              />
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
                isLoading={isHistoryLoading || loading}
                currentPage={historyPage}
                totalItems={historyTotal}
                onPageChange={handleHistoryPageChange}
              />
            )}
          </div>
        </div>
      </div>

      <ComposeEmailModal
        isOpen={isComposeEmailOpen}
        onClose={() => setIsComposeEmailOpen(false)}
        collegeId={collegeId!}
        initialEmail={profile?.email}
      />
    </div>
  );
};

export default Page;
