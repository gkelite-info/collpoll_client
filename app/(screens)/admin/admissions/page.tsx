"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import CourseAdmissions from "./components/CourseAdmissions";
import AdmissionFee from "./components/AdmissionFee";
import AdmissionApplications from "./components/AdmissionApplications";

type AdmissionsTab = "courses" | "fees" | "applications";

function AdmissionsScreenShimmer() {
  return (
    <div className="min-h-screen space-y-6 bg-[#f3f4f6] p-4" aria-label="Loading admissions">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mx-auto h-12 w-[520px] max-w-full animate-pulse rounded-full bg-white" />
      <div className="min-h-[500px] space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-9 w-60 animate-pulse rounded bg-gray-100" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

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
          className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${activeTab === "courses" ? "text-white" : "text-gray-600 hover:text-gray-900"
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
          className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${activeTab === "fees" ? "text-white" : "text-gray-600 hover:text-gray-900"
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
          className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${activeTab === "applications" ? "text-white" : "text-gray-600 hover:text-gray-900"
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
    <Suspense fallback={<AdmissionsScreenShimmer />}>
      <AdmissionsContent />
    </Suspense>
  );
}
