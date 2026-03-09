"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SummaryPage from "./payroll/components/summarypage";
import MyPayPage from "./payroll/components/mypaypage";
import ManageTaxPage from "./payroll/components/managetaxpage";
import AttendancePage from "./components/attendancePage";
import AttendanceAnalyticsPage from "./components/AttendanceAnalyticsPage";
import { Loader } from "../../(student)/calendar/right/timetable";

const MyAttendanceLeft = () => {
  const searchParams = useSearchParams();

  const urlMainTab =
    (searchParams.get("main") as "attendance" | "payroll" | "analytics") ||
    "payroll";
  const urlSubTab =
    (searchParams.get("sub") as "summary" | "myPay" | "manageTax") || "summary";

  const [activeMainTab, setActiveMainTab] = useState<
    "attendance" | "payroll" | "analytics"
  >(urlMainTab);
  const [activePayrollTab, setActivePayrollTab] = useState<
    "summary" | "myPay" | "manageTax"
  >(urlSubTab);

  const mainTabs = [
    { id: "attendance", label: "Attendance" },
    { id: "payroll", label: "Payroll" },
    { id: "analytics", label: "Attendance Analytics" },
  ];

  const payrollSubTabs = [
    { id: "summary", label: "Summary" },
    { id: "myPay", label: "My Pay" },
    { id: "manageTax", label: "Manage Tax" },
  ];

  const handleMainTabClick = (id: string) => {
    if (id === activeMainTab) return;

    setActiveMainTab(id as any);
    const targetPath =
      id === "payroll" ? `?main=${id}&sub=${activePayrollTab}` : `?main=${id}`;

    window.history.pushState(null, "", targetPath);
  };

  const handleSubTabClick = (id: string) => {
    if (id === activePayrollTab) return;

    setActivePayrollTab(id as any);
    const targetPath = `?main=payroll&sub=${id}`;

    window.history.pushState(null, "", targetPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveMainTab((params.get("main") as any) || "payroll");
      setActivePayrollTab((params.get("sub") as any) || "summary");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="w-full flex-1 min-w-0 font-sans min-h-150 pt-4 px-2.5">
      <div className="flex justify-center mb-8 w-full px-20">
        <div className="relative flex items-center bg-[#E5E5E5] p-1 rounded-full w-full max-w-[700px] justify-between">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMainTabClick(tab.id as any)}
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
        {activeMainTab === "attendance" && (
          <div className=" w-full">
            <AttendancePage />
          </div>
        )}

        {activeMainTab === "payroll" && (
          <div className="flex flex-col items-center w-full p-2">
            <div className="flex justify-center mb-4 gap-12 w-full">
              {payrollSubTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSubTabClick(tab.id as any)}
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
              {activePayrollTab === "summary" && (
                <div className="w-full text-left mt-2">
                  <SummaryPage />
                </div>
              )}
              {activePayrollTab === "myPay" && (
                <div className="w-full text-left mt-2">
                  <MyPayPage />
                </div>
              )}
              {activePayrollTab === "manageTax" && (
                <div className="w-full text-left mt-2">
                  <ManageTaxPage />
                </div>
              )}
            </div>
          </div>
        )}

        {activeMainTab === "analytics" && (
          <div className="w-full">
            <AttendanceAnalyticsPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm ">
          <Loader />
        </div>
      }
    >
      <MyAttendanceLeft />
    </Suspense>
  );
}
