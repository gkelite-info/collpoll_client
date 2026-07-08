"use client";

import toast from "react-hot-toast";
import  { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useUser } from "@/app/utils/context/UserContext";
import { fetchEmployeePaySummary } from "@/lib/helpers/Hr/myAttendance/fetchEmployeePaySummary";
import { SalaryOverview } from "./SalaryOverview";
import { PayslipsSection } from "./PayslipsSection";
import { TaxSection } from "./TaxSection";

interface SharedMyPayPageProps {
  overrideUserId?: number | string;
  isHrView?: boolean;
  employeeProfile?: any;
}

export function SharedMyPayPage({ overrideUserId, isHrView: propIsHrView, employeeProfile }: SharedMyPayPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    userId: loggedInUserId, 
    collegeId, 
    role: loggedInRole, 
    fullName: loggedInName,
    collegeHrId,
    collegePublicId,
    identifierId,
    dateOfJoining,
    profilePhoto,
    collegeBranchCode
  } = useUser();

  const parsedOverrideUserId = overrideUserId ? parseInt(overrideUserId.toString(), 10) : undefined;
  const effectiveUserId = parsedOverrideUserId ?? (loggedInUserId ? parseInt(loggedInUserId.toString(), 10) : undefined);
  
  const roleLower = loggedInRole?.toLowerCase() || "";
  const isHrRole = roleLower === "hr" || 
                   roleLower === "college_hr" || 
                   roleLower === "college hr" || 
                   roleLower.includes("hr") || 
                   !!collegeHrId; // Fallback: if they have a collegeHrId, they ARE an HR!
                   
  const finalIsHrView = propIsHrView !== undefined ? propIsHrView : isHrRole;
  
  // For the currently logged-in user, we might not have all these pre-fetched unless we're in the HR view,
  // but we can map the basic UserContext. In AddPayModal, they will map to '-' if missing.
  const effectiveProfile = employeeProfile || {
    name: loggedInName || "",
    id: effectiveUserId ? effectiveUserId.toString() : "",
    employeeId: identifierId || collegePublicId || "-", 
    joiningDate: dateOfJoining ? new Date(dateOfJoining).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
    department: collegeBranchCode || "-",
    role: loggedInRole || "-",
    image: profilePhoto || "/assets/images/defaultUser.png"
  };

  const viewParam = (searchParams.get("view") as "salary" | "tax") || "salary";
  const [activeTab, setActiveTab] = useState<"salary" | "tax">(viewParam);

  const [payData, setPayData] = useState<any | null>(null);
  const [isFetchingPay, setIsFetchingPay] = useState(true);

  const loadPaySummary = async () => {
    if (!effectiveUserId || !collegeId) return;
    setIsFetchingPay(true);
    try {
      const data = await fetchEmployeePaySummary(
        effectiveUserId,
        collegeId
      );
      setPayData(data);
    } catch (error) {
      toast.error("Unable to fetch pay summary at this time.", { id: "pay-summary-fetch-error" });
    } finally {
      setIsFetchingPay(false);
    }
  };

  useEffect(() => {
    loadPaySummary();
  }, [effectiveUserId, collegeId]);

  useEffect(() => {
    setActiveTab(viewParam);
  }, [viewParam]);

  const handleTabSwitch = (tab: "salary" | "tax") => {
    setActiveTab(tab);
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    currentParams.set("view", tab);
    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col text-left">
      <div className="flex-shrink-0 text-[14px] font-bold mb-4">
        <span
          onClick={() => handleTabSwitch("salary")}
          className={`cursor-pointer transition-colors ${activeTab === "salary" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
        >
          My Salary & Pay Slips
        </span>
        <span className="text-gray-400 mx-2">/</span>
        <span
          onClick={() => handleTabSwitch("tax")}
          className={`cursor-pointer transition-colors ${activeTab === "tax" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
        >
          Income TAX
        </span>
      </div>

      {activeTab === "salary" ? (
        <div className="w-full flex flex-col gap-6">
          <SalaryOverview payData={payData} isFetchingPay={isFetchingPay} isHrView={finalIsHrView} employeeProfile={effectiveProfile} effectiveUserId={effectiveUserId} />
          {effectiveUserId && (
            <PayslipsSection userId={effectiveUserId} />
          )}
        </div>
      ) : (
        <TaxSection />
      )}
    </div>
  );
}
