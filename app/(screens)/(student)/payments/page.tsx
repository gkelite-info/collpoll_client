"use client";

import { motion } from "framer-motion";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import AcademicFees from "./components/academicFees";
import AdditionalDues from "./components/additionalDues";
import History from "./components/history";
import PaymentConfirm, { FeePlan } from "./components/paymentConfirm"; // 🔥 Import
import { useEffect, useState } from "react";
import ProfileCard from "./components/profileCard";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchStudentProfileCardData } from "@/lib/helpers/student/payments/fetchStudentProfileCardData";
import PaymentsSkeleton from "./shimmer/PaymentsSkeleton";
import { fetchStudentFeePlan } from "@/lib/helpers/student/payments/fetchStudentFeePlan";

const Page = () => {
  const [activeTab, setActiveTab] = useState<
    "academic" | "additional" | "history"
  >("academic");
  const { userId } = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [feePlan, setFeePlan] = useState<FeePlan | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPaymentMode, setIsPaymentMode] = useState(false);

  const tabs = [
    { id: "academic", label: "Academic Fees" },
    { id: "additional", label: "Additional Dues" },
    { id: "history", label: "History" },
  ];

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const [profileData, feeData] = await Promise.all([
          fetchStudentProfileCardData(userId!),
          fetchStudentFeePlan(userId!),
        ]);

        if (mounted) {
          setProfile(profileData);
          setFeePlan(feeData);
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
  }, [userId]);

  if (loading) {
    return <PaymentsSkeleton />;
  }

  const displayPlan: FeePlan = feePlan || {
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
  };

  return (
    <div className="lg:p-2 bg-[#F5F5F7]">
      <div className="bg-pink-00 mb-6 flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-[#282828] font-bold text-2xl">
            Payments – {profile ? `${profile.branch} ${profile.year}` : ""}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-[#282828] text-sm">
              Manage Fees, Track Transactions and Stay Updated Instantly.
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
          rollNo={profile.rollNo}
          email={profile.email}
          mobile={profile.mobile}
          image="/rahul.png"
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
        // Render Standard Tabs Container
        <div className="bg-white shadow-sm rounded-xl p-8 font-sans min-h-[600px] mt-6">
          <div className="max-w-7xl mx-auto">
            {/* Tab Switcher */}
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
                  summary={[]}
                  onPay={() => setIsPaymentMode(true)} // 🔥 Trigger Switch
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
                <History amountSpend={0} transactions={[]} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
