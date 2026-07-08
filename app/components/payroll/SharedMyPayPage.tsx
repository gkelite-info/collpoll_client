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

  const safeParseInt = (val: any): number | undefined => {
    if (val === undefined || val === null) return undefined;
    const parsed = parseInt(val.toString(), 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const parsedOverrideUserId = safeParseInt(overrideUserId);
  const parsedLoggedInUserId = safeParseInt(loggedInUserId);
  const effectiveUserId = parsedOverrideUserId ?? parsedLoggedInUserId;
  
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
  const [isFetchingPay, setIsFetchingPay] = useState(false);
  const [payLoadedForUserId, setPayLoadedForUserId] = useState<number | undefined>(undefined);

  // Derive whether we are still waiting for data for the current user
  const hasFetchedCurrentUser = payLoadedForUserId === effectiveUserId;
  const showLoading = !hasFetchedCurrentUser && !!effectiveUserId && !!collegeId;

  useEffect(() => {
    let cancelled = false;

    const fetchPay = async () => {
      if (!effectiveUserId || !collegeId) {
        // Nothing to fetch — clear stale data and stop loading
        if (!cancelled) {
          setPayData(null);
          setPayLoadedForUserId(effectiveUserId);
          setIsFetchingPay(false);
        }
        return;
      }

      setIsFetchingPay(true);
      try {
        const data = await fetchEmployeePaySummary(effectiveUserId, collegeId);
        if (!cancelled) {
          setPayData(data);
          setPayLoadedForUserId(effectiveUserId);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Unable to fetch pay summary at this time.", { id: "pay-summary-fetch-error" });
          setPayData(null);
          setPayLoadedForUserId(effectiveUserId);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingPay(false);
        }
      }
    };

    fetchPay();

    return () => {
      cancelled = true;
    };
  }, [effectiveUserId, collegeId]);

  const loadPaySummary = async () => {
    if (!effectiveUserId || !collegeId) return;
    setIsFetchingPay(true);
    try {
      const data = await fetchEmployeePaySummary(effectiveUserId, collegeId);
      setPayData(data);
      setPayLoadedForUserId(effectiveUserId);
    } catch (error) {
      toast.error("Unable to fetch pay summary at this time.", { id: "pay-summary-fetch-error" });
    } finally {
      setIsFetchingPay(false);
    }
  };

  const finalIsFetchingPay = isFetchingPay || showLoading;

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
          <SalaryOverview payData={payData} isFetchingPay={finalIsFetchingPay} isHrView={finalIsHrView} employeeProfile={effectiveProfile} effectiveUserId={effectiveUserId} onRefresh={loadPaySummary} />
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
