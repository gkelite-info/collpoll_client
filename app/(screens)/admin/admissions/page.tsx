"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import CourseAdmissions from "./components/CourseAdmissions";
import AdmissionFee from "./components/AdmissionFee";
import AdmissionApplications from "./components/AdmissionApplications";

type AdmissionsTab = "courses" | "fees" | "applications";

function AdmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AdmissionsTab | null;
  const activeTab: AdmissionsTab = tabParam && ["courses", "fees", "applications"].includes(tabParam)
    ? tabParam
    : "courses";

  const handleTabChange = (tab: AdmissionsTab) => {
    router.replace(`?tab=${tab}`);
  };

  return (
    <div className="p-4 bg-[#f3f4f6] min-h-screen">
      <section className="mb-6">
        <h1 className="text-xl font-semibold text-[#1F2937]">Admissions Management</h1>
        <p className="text-sm text-gray-500">
          Manage course admissions and configure group-wise admission fees.
        </p>
      </section>

      <div className="flex gap-2 mb-6 bg-white w-max mx-auto p-1 rounded-full shadow-sm border border-gray-100 relative">
        <button
          onClick={() => handleTabChange("courses")}
          className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer z-10 ${activeTab === "courses" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          {activeTab === "courses" && (
            <motion.div
              layoutId="admissions-active-tab"
              className="absolute inset-0 bg-[#43C17A] rounded-full -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          Course Admissions
        </button>
        <button
          onClick={() => handleTabChange("fees")}
          className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer z-10 ${activeTab === "fees" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          {activeTab === "fees" && (
            <motion.div
              layoutId="admissions-active-tab"
              className="absolute inset-0 bg-[#43C17A] rounded-full -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          Admission Fee Structure
        </button>
        <button
          onClick={() => handleTabChange("applications")}
          className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer z-10 ${activeTab === "applications" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          {activeTab === "applications" && (
            <motion.div
              layoutId="admissions-active-tab"
              className="absolute inset-0 bg-[#43C17A] rounded-full -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          Admission Applications
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === "courses" && <CourseAdmissions />}
        {activeTab === "fees" && <AdmissionFee />}
        {activeTab === "applications" && <AdmissionApplications />}
      </div>
    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense fallback={
      <div className="p-4 bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admissions...</p>
      </div>
    }>
      <AdmissionsContent />
    </Suspense>
  );
}
