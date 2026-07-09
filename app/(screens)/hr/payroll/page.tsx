"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";

import RunPayrollTab from "./components/RunPayrollTab";
import ManageTaxTab from "./components/ManageTaxTab";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import PayrollHistoryTab from "./components/PayrollHistoryTab";


function HrPayrollDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { loading: hrLoading } = useCollegeHr();

  const urlTab = searchParams.get("tab") || "run-payroll";
  const [mainView, setMainView] = useState<"run-payroll" | "history" | "manage-tax">(urlTab as any);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "run-payroll" || tab === "history" || tab === "manage-tax") {
      setMainView(tab);
    }
  }, [searchParams]);

  const handleSetMainView = (view: "run-payroll" | "history" | "manage-tax") => {
    setMainView(view);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", view);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  if (hrLoading) {
    return (
      <div className="p-2 w-full h-full flex flex-col animate-pulse">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 w-full">
          <div className="flex flex-col justify-start w-full gap-3">
            <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-96 bg-gray-200 rounded-lg -mt-1"></div>
            
            <div className="flex justify-center w-full mt-1">
              <div className="bg-gray-100 p-1.5 rounded-full inline-flex gap-1.5 items-center w-full max-w-[450px] h-12 shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="w-full flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4 h-full">
            {/* Header controls shimmer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4 h-[72px]">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Grid shimmer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm h-[90px]">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-7 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Table shimmer */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl mt-2 flex flex-col overflow-hidden min-h-[300px]">
              <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
              <div className="flex flex-col divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[72px] flex items-center px-6 gap-8 w-full">
                    <div className="h-4 w-24 bg-gray-200 rounded shrink-0"></div>
                    <div className="flex flex-col gap-2 w-48 shrink-0">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-40 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded shrink-0"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded shrink-0"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#282828] p-2 w-full h-full flex flex-col">
      <div className="flex justify-between items-start mb-6 w-full">
        <div className="flex flex-col justify-start w-full gap-3">
          <h1 className="text-2xl font-bold text-[#282828] whitespace-nowrap">
            {mainView === "run-payroll" ? "Run Payroll" : mainView === "history" ? "Payroll History" : "Manage Tax"}
          </h1>
          <p className="text-sm text-gray-500 -mt-1">
            {mainView === "run-payroll"
              ? "Calculate and process monthly salary for all staff."
              : mainView === "history"
              ? "View past payroll runs, finalize and mark as paid."
              : "Review and approve employee tax declarations."}
          </p>
          
          <div className="flex justify-center w-full">
            <div className="bg-white/80 p-1.5 rounded-full inline-flex gap-1.5 items-center overflow-x-auto border border-gray-200/50 mt-1 shadow-sm w-fit max-w-full">
              {[
              { id: "run-payroll", label: "Run Payroll", icon: <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
              { id: "history", label: "Payroll History", icon: <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
              { id: "manage-tax", label: "Manage Tax", icon: <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 14l6-6m-4 0h4v4m-4 6h4v-4m-6 0H5v4"></path></svg> },
            ].map(tab => {
              const isActive = mainView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSetMainView(tab.id as any)}
                  className={`relative z-10 focus:outline-none cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 ${isActive ? "text-[#E9E9E9]" : "text-[#414141]"}`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="hr-payroll-tabs"
                      className="absolute inset-0 rounded-full bg-[#43C17A] shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full bg-[#DEDEDE] shadow-sm -z-10" />
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto custom-scrollbar">
        {mainView === "run-payroll" && <RunPayrollTab />}
        {mainView === "history" && <PayrollHistoryTab />}
        {mainView === "manage-tax" && <ManageTaxTab />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><Loader /></div>}>
      <HrPayrollDashboard />
    </Suspense>
  );
}
