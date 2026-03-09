"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AttendancePage from "./components/attendancePage";
import AttendanceAnalyticsPage from "./components/AttendanceAnalyticsPage";

const MyAttendanceLeft = () => {
  const [activeMainTab, setActiveMainTab] = useState<
    "attendance" | "payroll" | "analytics"
  >("attendance");

  const [activePayrollTab, setActivePayrollTab] = useState<
    "summary" | "myPay" | "manageTax"
  >("summary");

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

  return (
    <div className="w-full flex-1 min-w-0 font-sans min-h-150 pt-4 px-2.5">
      <div className="flex justify-center mb-8 w-full px-20">
        <div className="relative flex items-center bg-[#E5E5E5] p-1 rounded-full w-full max-w-[700px] justify-between">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
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
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
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
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-center mb-10 gap-12 w-full">
              {payrollSubTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePayrollTab(tab.id as any)}
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
                <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  Payroll Summary Component
                </div>
              )}
              {activePayrollTab === "myPay" && (
                <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  My Pay Component
                </div>
              )}
              {activePayrollTab === "manageTax" && (
                <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  Manage Tax Component
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

export default MyAttendanceLeft;
