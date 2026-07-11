"use client";

import { useUser } from "@/app/utils/context/UserContext";
import { fetchUniversalStaffProfile, UniversalProfileData } from "@/lib/helpers/Hr/myAttendance/fetchUniversalStaff";
import { ArrowLeft } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import ReimbursementsClient from "@/app/components/SharedReimbursements/ReimbursementsClient";
import MyAttendanceRight from "./right";

type MainTab = "attendance" | "payroll" | "analytics";
type PayrollSubTab = "summary" | "myPay" | "manageTax" | "reimbursements";

import AttendanceAnalyticsPage from "../../hr/MyAttendance/components/AttendanceAnalyticsPage";
import AttendancePage from "../../hr/MyAttendance/components/attendancePage";
import ManageTaxPage from "../../hr/MyAttendance/payroll/components/managetaxpage";
import MyPayPage from "../../hr/MyAttendance/payroll/components/mypaypage";
import SummaryPage from "../../hr/MyAttendance/payroll/components/summarypage";

interface SharedAttendanceProps {
  userId?: string;
  onBack?: () => void;
}

const MyAttendanceLeft = ({ userId: propUserId, onBack }: SharedAttendanceProps) => {
  const searchParams = useSearchParams();
  const { userId: loggedInUserId, role: loggedInRole } = useUser();

  const urlMainTab = (searchParams.get("main") as MainTab | null) || "payroll";
  const urlSubTab = (searchParams.get("sub") as PayrollSubTab | null) || "summary";

  const resolvedUserId =
    propUserId ||
    searchParams.get("userId") ||
    searchParams.get("faculty") ||
    loggedInUserId?.toString();

  const [activeMainTab, setActiveMainTab] = useState<MainTab>(urlMainTab);
  const [activePayrollTab, setActivePayrollTab] = useState<PayrollSubTab>(urlSubTab);

  const [profile, setProfile] = useState<UniversalProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!resolvedUserId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const resolvedRole = searchParams.get("role") || loggedInRole;

      const data = await fetchUniversalStaffProfile(resolvedUserId, resolvedRole);
      if (data) setProfile(data);
      setIsLoading(false);
    };
    loadProfile();
  }, [resolvedUserId, searchParams.get("role"), loggedInRole]);

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: "attendance", label: "Attendance" },
    { id: "payroll", label: "Payroll" },
    { id: "analytics", label: "Attendance Analytics" },
  ];

  const payrollSubTabs: { id: PayrollSubTab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "myPay", label: "My Pay" },
    { id: "manageTax", label: "Manage Tax" },
    { id: "reimbursements", label: "Reimbursements" },
  ];

  const handleMainTabClick = (id: MainTab) => {
    if (id === activeMainTab) return;
    setActiveMainTab(id);

    const facultyStr = searchParams.get("faculty")
      ? `&faculty=${searchParams.get("faculty")}`
      : "";
    const userStr = searchParams.get("userId")
      ? `&userId=${searchParams.get("userId")}`
      : "";
    const roleStr = searchParams.get("role")
      ? `&role=${searchParams.get("role")}`
      : "";

    const queryAppend = `${facultyStr}${userStr}${roleStr}`;
    const targetPath =
      id === "payroll"
        ? `?main=${id}&sub=${activePayrollTab}${queryAppend}`
        : `?main=${id}${queryAppend}`;

    window.history.pushState(null, "", targetPath);
  };

  const handleSubTabClick = (id: PayrollSubTab) => {
    if (id === activePayrollTab) return;
    setActivePayrollTab(id);

    const facultyStr = searchParams.get("faculty")
      ? `&faculty=${searchParams.get("faculty")}`
      : "";
    const userStr = searchParams.get("userId")
      ? `&userId=${searchParams.get("userId")}`
      : "";
    const roleStr = searchParams.get("role")
      ? `&role=${searchParams.get("role")}`
      : "";

    const targetPath = `?main=payroll&sub=${id}${facultyStr}${userStr}${roleStr}`;

    window.history.pushState(null, "", targetPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveMainTab((params.get("main") as MainTab | null) || "payroll");
      setActivePayrollTab(
        (params.get("sub") as PayrollSubTab | null) || "summary",
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const showRightSidebar = !(activeMainTab === "payroll" && activePayrollTab === "reimbursements");

  return (
    <div className="flex items-start justify-between w-full">
      <div className="relative w-full flex-1 min-w-0 font-sans min-h-150 pt-4 px-2.5">
        {onBack && (
          <button
            onClick={onBack}
            className="group flex w-fit items-center gap-2 text-[13px] font-bold text-gray-600 px-4 py-2 rounded-xl hover:text-[#43C17A] transition-all duration-200 mb-6 cursor-pointer"
          >
            <ArrowLeft
              size={16}
              weight="bold"
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Back to Dashboard</span>
          </button>
        )}

        <div className="flex justify-center mb-8 w-full px-20">
          <div className="relative flex items-center bg-[#E5E5E5] p-1 rounded-full w-full max-w-[700px] justify-between">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleMainTabClick(tab.id)}
                className={`relative z-10 w-1/3 py-1.5 text-[15px] cursor-pointer transition-colors duration-300 ${
                  activeMainTab === tab.id
                    ? "text-white font-medium delay-100"
                    : "text-[#5A5A5A] hover:text-gray-800"
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeMainTab === tab.id && (
                  <motion.div
                    layoutId="active-main-pill"
                    className="absolute inset-0 rounded-full -z-0 bg-[#43C17A]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="transition-opacity duration-300 mt-4">
          {activeMainTab === "attendance" && profile && (
            <div className=" w-full">
              <AttendancePage userId={Number(resolvedUserId)} profile={profile} />
            </div>
          )}

          {activeMainTab === "payroll" && (
            <div className="flex flex-col items-center w-full p-2">
              <div className="flex justify-center mb-4 gap-12 w-full">
                {payrollSubTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSubTabClick(tab.id)}
                    className={`text-[15px] cursor-pointer pb-1.5 transition-all duration-300 ${
                      activePayrollTab === tab.id
                        ? "text-[#43C17A] border-b-[2px] border-[#43C17A]"
                        : "text-[#5A5A5A] font-medium border-b-[2px] border-transparent hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="w-full">
                {activePayrollTab === "summary" && profile && (
                  <div className="w-full text-left mt-2">
                    <SummaryPage profile={profile} />
                  </div>
                )}
                {activePayrollTab === "myPay" && profile && (
                  <div className="w-full text-left mt-2">
                    <MyPayPage profile={profile} />
                  </div>
                )}
                {activePayrollTab === "manageTax" && (
                  <div className="w-full text-left mt-2">
                    <ManageTaxPage />
                  </div>
                )}
                {activePayrollTab === "reimbursements" && (
                  <div className="w-full text-left mt-2">
                    <ReimbursementsClient />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMainTab === "analytics" && profile && (
            <div className="w-full">
              <AttendanceAnalyticsPage
                userId={Number(resolvedUserId)}
                profile={profile}
              />
            </div>
          )}
        </div>
      </div>
      {showRightSidebar && <MyAttendanceRight />}
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm">
          <Loader />
        </div>
      }
    >
      <MyAttendanceLeft />
    </Suspense>
  );
}

export { MyAttendanceLeft };
