"use client";

import { motion } from "framer-motion";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useEffect, useState } from "react";
import { fetchStudentProfileCardData } from "@/lib/helpers/student/payments/fetchStudentProfileCardData";
import { fetchStudentFeePlan } from "@/lib/helpers/student/payments/fetchStudentFeePlan";

import {
  fetchStudentPaymentHistory,
  FeeSummaryItem,
} from "@/lib/helpers/student/payments/fetchStudentPaymentHistory";

import PaymentConfirm, {
  FeePlan as BaseFeePlan,
} from "@/app/(screens)/(student)/payments/components/paymentConfirm";
import PaymentsSkeleton from "@/app/(screens)/(student)/payments/shimmer/PaymentsSkeleton";
import ProfileCard from "@/app/(screens)/(student)/payments/components/profileCard";
import AcademicFees from "@/app/(screens)/(student)/payments/components/academicFees";
import AdditionalDues from "@/app/(screens)/(student)/payments/components/additionalDues";
import History, {
  Transaction,
} from "@/app/(screens)/(student)/payments/components/history";
import { useUser } from "@/app/utils/context/UserContext";
import { useTranslations } from "next-intl";
export default function SharedPaymentDashboard({
  targetUserId,
  profilePhoto,
}: {
  targetUserId: number;
  profilePhoto?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<
    "academic" | "additional" | "history"
  >("academic");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentMode, setIsPaymentMode] = useState(false);

  const [paymentSummary, setPaymentSummary] = useState<FeeSummaryItem[]>([]);
  const [feePlan, setFeePlan] = useState<ExtendedFeePlan | null>(null);
  const { identifierId } = useUser();
  const t = useTranslations("Payments.student");

  const tabs = [
    { id: "academic", label: t("Academic Fees") },
    { id: "additional", label: t("Additional Dues") },
    { id: "history", label: t("History") },
  ];

  useEffect(() => {
    if (!targetUserId) return;
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [profileData, feeData] = await Promise.all([
          fetchStudentProfileCardData(targetUserId),
          fetchStudentFeePlan(targetUserId),
        ]);

        let historyData: FeeSummaryItem[] = [];
        if (feeData?.studentFeeObligationId) {
          historyData = await fetchStudentPaymentHistory(
            feeData.studentFeeObligationId,
          );
        }

        if (mounted) {
          setProfile(profileData);
          setFeePlan(feeData);
          setPaymentSummary(historyData);
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
  }, [targetUserId]);

  if (loading) {
    return <PaymentsSkeleton />;
  }

  interface ExtendedFeePlan extends BaseFeePlan {
    semesterTotalPayable?: number;
    semesterPaidTillNow?: number;
    semesterPendingAmount?: number;
    semesterRoadmap?: any[];
  }

  const displayPlan: ExtendedFeePlan = feePlan || {
    studentFeeObligationId: 0,
    collegeSemesterId: 0,
    programName: "No Active Plan",
    type: "Academic Fees",
    academicYear: "-",
    openingBalance: 0,
    components: [],
    gstAmount: 0,
    gstPercent: 0,
    applicableFees: 0,
    scholarship: 0,
    totalPayable: 0,
    paidTillNow: 0,
    pendingAmount: 0,
    semesterTotalPayable: 0,
    semesterPaidTillNow: 0,
    semesterPendingAmount: 0,
    semesterRoadmap: [],
  };

  const totalAmountSpent = paymentSummary
    .filter(
      (tx) =>
        tx.status.toLowerCase() === "success" ||
        tx.status.toLowerCase() === "succeeded",
    )
    .reduce((sum, tx) => sum + tx.paidAmount, 0);

  const historyTransactions: Transaction[] = paymentSummary.map((tx) => {
    const s = tx.status.toLowerCase();
    const mappedStatus =
      s === "success" || s === "succeeded"
        ? "Success"
        : s === "failed" || s === "canceled"
          ? "Failure"
          : "Pending";

    return {
      id: tx.id,
      items: "Academic Fee",
      qty: 1,
      costCenter: displayPlan.programName,
      amount: tx.paidAmount,
      message: tx.comments || "-",
      gateway: tx.paymentMode || "-",
      trxnId: tx.gatewayTransactionId || "-",
      paidOn: tx.paidOn,
      status: mappedStatus,
    };
  });

  return (
    <div className="lg:p-2 bg-[#F5F5F7]">
      <div className="bg-pink-00 mb-6 flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-[#282828] font-bold text-2xl">
            {t("Payments –")}{" "}
            {profile ? `${profile.branch} ${profile.year}` : ""}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-[#282828] text-sm">
              {t("Manage Fees, Track Transactions and Stay Updated Instantly")}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-6 w-[320px]">
          <CourseScheduleCard />
        </div>
      </div>

      {profile && (
        <ProfileCard
          name={profile.name}
          course={profile.course}
          year={profile.year}
          // rollNo={profile.rollNo}
          rollNo={identifierId!}
          email={profile.email}
          mobile={profile.mobile}
          image={profilePhoto ? profilePhoto : "/rahul.png"}
        />
      )}

      {isPaymentMode ? (
        <div className="mt-8">
          <PaymentConfirm
            plan={displayPlan}
            onBack={() => setIsPaymentMode(false)}
          />
        </div>
      ) : (
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
              {activeTab === "academic" && (
                <AcademicFees
                  plan={displayPlan}
                  summary={paymentSummary}
                  profile={profile}
                  onPay={() => setIsPaymentMode(true)}
                />
              )}
              {activeTab === "additional" && (
                <AdditionalDues
                  financialDues={[]}
                  nonFinancialDues={[]}
                  excessDues={[]}
                />
              )}
              {activeTab === "history" && (
                <History
                  amountSpend={totalAmountSpent}
                  transactions={historyTransactions}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
