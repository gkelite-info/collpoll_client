"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import SummaryPage from './components/summarypage';
import MyPayPage from "./components/mypaypage";

export default function PayrollPage() {

  const [activeTab, setActiveTab] = useState('summary');

  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname.includes("mypay")) {
      setActiveTab("my-pay");
    } else {
      setActiveTab("summary");
    }
  }, [pathname]);

  return (
    <div className="w-full">

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-12 border-b border-gray-20  max-w-4xl mx-auto">

        <button
          onClick={() => {
            setActiveTab('summary');
            router.push("/faculty/my-attendance/payroll/summary");
          }}
          className={`pb-3 border-b-2 font-medium text-[15px] ${
            activeTab === 'summary'
              ? 'border-[#48c279] text-[#48c279]'
              : 'border-transparent text-gray-500'
          }`}
        >
          Summary
        </button>

        <button
          onClick={() => {
            setActiveTab('my-pay');
            router.push("/faculty/my-attendance/payroll/mypay");
          }}
          className={`pb-3 border-b-2 font-medium text-[15px] ${
            activeTab === 'my-pay'
              ? 'border-[#48c279] text-[#48c279]'
              : 'border-transparent text-gray-500'
          }`}
        >
          My Pay
        </button>

      </div>

      {/* Conditional Rendering */}
      <div className="mt-6">
        {activeTab === 'summary' && <SummaryPage />}
        {activeTab === 'my-pay' && <MyPayPage />}
      </div>

    </div>
  );
}