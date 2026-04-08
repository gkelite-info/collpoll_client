"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchEmployeePaySummary } from "@/lib/helpers/Hr/myAttendance/fetchEmployeePaySummary";
import WipOverlay from "@/app/utils/WipOverlay";

// Shimmer Loader for inner block components
const ShimmerBlock = () => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 p-5 flex flex-col gap-3 animate-pulse rounded-xl">
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mt-auto"></div>
  </div>
);

function MyPayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId: loggedInUserId, collegeId } = useUser();

  const mainParam = searchParams.get("main") || "payroll";
  const subParam = searchParams.get("sub") || "myPay";
  const viewParam = (searchParams.get("view") as "salary" | "tax") || "salary";

  const [activeTab, setActiveTab] = useState<"salary" | "tax">(viewParam);
  const [payData, setPayData] = useState<any | null>(null);
  const [isFetchingPay, setIsFetchingPay] = useState(true);

  const loadPayData = async () => {
    if (!loggedInUserId || !collegeId) return;
    setIsFetchingPay(true);
    try {
      const data = await fetchEmployeePaySummary(
        parseInt(loggedInUserId.toString(), 10),
        collegeId,
      );
      setPayData(data);
    } catch (error) {
      console.error("Failed to fetch pay summary:", error);
    } finally {
      setIsFetchingPay(false);
    }
  };

  useEffect(() => {
    loadPayData();
  }, [loggedInUserId, collegeId]);

  useEffect(() => {
    setActiveTab(viewParam);
  }, [viewParam]);

  const handleTabSwitch = (tab: "salary" | "tax") => {
    setActiveTab(tab);
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );
    currentParams.set("view", tab);
    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  // --- FLEXIBLE DATA MAPPING ---
  const totalCTC =
    payData?.totalCTC ||
    payData?.totalCtc ||
    payData?.employee_salary_structure?.totalCtc ||
    0;
  const fixedPay =
    payData?.fixedPay || payData?.employee_salary_structure?.fixedPay || 0;
  const variablePay =
    payData?.variablePay ||
    payData?.employee_salary_structure?.variablePay ||
    0;

  const monthlySalary =
    payData?.monthlySalary ||
    payData?.employee_pay_profiles?.monthlySalary ||
    (totalCTC ? Math.round(totalCTC / 12) : 0);

  const allowancesArray =
    payData?.allowances || payData?.employee_salary_component_values || [];
  const compliancesArray =
    payData?.compliances || payData?.employee_payroll_compliance_values || [];

  const totalAllowances = allowancesArray.reduce(
    (acc: number, curr: any) => acc + (Number(curr.amount) || 0),
    0,
  );
  const totalCompliances = compliancesArray.reduce(
    (acc: number, curr: any) => acc + (Number(curr.amount) || 0),
    0,
  );

  // Take Home = Basic + Total Allowances(including negative deducts) - Total Payroll Compliances
  const takeHomePay = monthlySalary + totalAllowances - totalCompliances;

  const formatINR = (val: number | undefined) =>
    (val || 0).toLocaleString("en-IN");

  const paySlips = [
    {
      id: 1,
      month: "January 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
    {
      id: 2,
      month: "February 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
    {
      id: 3,
      month: "March 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
    {
      id: 4,
      month: "April 2025",
      date: "23/10/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[550px] text-left">
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
        <>
          <div className="flex-shrink-0">
            <h2 className="text-[16px] font-extrabold text-[#333333] mb-3">
              My Salary
            </h2>

            {/* --- COMPACT DYNAMIC GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="col-span-1 flex flex-col gap-3">
                <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden flex-1 flex flex-col justify-center">
                  {isFetchingPay && <ShimmerBlock />}
                  <p className="text-[#666666] text-[12px] font-semibold">
                    Current Compensation
                  </p>
                  <p className="text-[#333333] font-bold text-[16px] mt-1">
                    INR {formatINR(totalCTC)}/Annum
                  </p>
                  <div className="mt-2.5 flex flex-col gap-1 text-[11px] font-medium text-[#555]">
                    <div>
                      Fixed -{" "}
                      <span className="text-[#43C17A] font-bold">
                        {formatINR(fixedPay)}
                      </span>
                    </div>
                    <div>
                      Variable -{" "}
                      <span className="text-[#43C17A] font-bold">
                        {formatINR(variablePay)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-2 relative overflow-hidden">
                  {isFetchingPay && <ShimmerBlock />}
                  <div className="flex justify-between items-center">
                    <span className="text-[#333333] font-bold text-[13px]">
                      Payroll
                    </span>
                    <span className="text-[#333333] font-bold text-[12px]">
                      Till Date Pay{" "}
                      <span className="text-[#43C17A] ml-1">
                        {payData?.tillDatePay || "0"}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#666666] text-[12px] font-semibold">
                      Paycycle
                    </span>
                    <span className="text-[#43C17A] font-bold text-[12px]">
                      Monthly
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between relative overflow-hidden">
                {isFetchingPay && <ShimmerBlock />}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#333333] text-[15px]">
                    <span>Monthly :</span>
                    <span className="font-bold ml-2">
                      {formatINR(monthlySalary)}
                    </span>
                  </div>
                  <span className="bg-[#43C17A]/10 text-[#43C17A] text-[10px] px-2 py-0.5 rounded-[4px] font-bold tracking-wide">
                    CURRENT
                  </span>
                </div>

                {/* Dynamic Compliances Block */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {compliancesArray.length > 0 ? (
                    compliancesArray.map((comp: any, idx: number) => {
                      const compName =
                        comp.name ||
                        comp.payroll_compliance_types?.title ||
                        "Unknown";
                      return (
                        <div
                          key={idx}
                          className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center"
                        >
                          <span className="text-[#555] text-[12px] font-semibold mb-0.5">
                            {compName}
                          </span>
                          <span className="text-[#5B3EE8] font-bold text-[15px]">
                            {formatINR(Number(comp.amount))}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center">
                        <span className="text-[#555] text-[12px] font-semibold mb-0.5">
                          PF
                        </span>
                        <span className="text-[#5B3EE8] font-bold text-[15px]">
                          0
                        </span>
                      </div>
                      <div className="bg-[#EAE8F9] rounded-lg py-3 px-3 min-w-[75px] flex-1 text-center flex flex-col justify-center items-center">
                        <span className="text-[#555] text-[12px] font-semibold mb-0.5">
                          EF
                        </span>
                        <span className="text-[#5B3EE8] font-bold text-[15px]">
                          0
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 flex justify-center items-center text-[15px] border-t border-gray-100 pt-4">
                  <span className="text-[#43C17A] font-bold">Take Home :</span>
                  <span className="text-[#333333] font-bold ml-2">
                    {formatINR(takeHomePay)}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-[16px] font-extrabold text-[#333333] mb-3">
              Pay Slips
            </h2>
          </div>

          <div className="min-h-[108vh] relative overflow-y-auto pr-2 pb-6 space-y-4 rounded-xl custom-scrollbar">
            <WipOverlay fullHeight={true}/>
            {paySlips.map((slip) => (
              <div
                key={slip.id}
                className="bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[15px] font-bold text-[#333333]">
                    {slip.month}
                  </h3>
                  <div className="flex items-center space-x-4 text-[13px] font-bold">
                    <span className="text-[#333333]">
                      Status - <span className="text-[#43C17A]">Paid</span>
                    </span>
                    <button className="flex items-center text-[#333333] hover:text-[#43C17A] transition-colors cursor-pointer">
                      Download
                      <svg
                        className="w-[14px] h-[14px] ml-1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-[13px]">
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Pay Date :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.date}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Deductions :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.deductions}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Gross Pay :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.gross}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Net Pay :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.net}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 relative min-h-[60vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
          <WipOverlay fullHeight={true}/>
          <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Net Taxable Income
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Gross Income Tax
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Total Surcharge & Cess
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Net Income Tax Payable
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                TAX paid Till Now
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 0
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Remaining Tax To Be Paid
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 0
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Salary Breakup
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Total
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Apr 25
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      May 25
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Jun 25
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[#666666] font-medium">
                      Basic
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      2,12,500
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[#666666] font-medium">
                      HRA
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      85,000
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm">
          <Loader />
        </div>
      }
    >
      <MyPayPage />
    </Suspense>
  );
}
