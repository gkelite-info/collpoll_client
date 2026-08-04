"use client";

import { CaretLeft } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useRouter } from "next/navigation";

export default function StudentDetailsSkeleton({ isBodyOnly }: { isBodyOnly?: boolean }) {
  const router = useRouter();

  const bodyContent = (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch w-full min-w-0">
      {/* Header handled externally when isBodyOnly is true */}
        <div className="lg:col-span-2 min-w-0 h-full rounded-[20px] bg-white shadow-sm p-5 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100" />
              <div className="space-y-2">
                <div className="w-40 h-6 bg-gray-100 rounded-md" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-gray-100 rounded-full" />
                  <div className="w-20 h-5 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-row overflow-x-auto sm:grid sm:grid-cols-3 gap-4 sm:gap-6 justify-between hide-scrollbar">
              <div className="flex-1 min-w-[120px] space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-24 h-5 bg-gray-100 rounded" /></div>
              <div className="flex-1 min-w-[140px] space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-32 h-5 bg-gray-100 rounded" /></div>
              <div className="flex-1 min-w-[120px] space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-20 h-5 bg-gray-100 rounded" /></div>
            </div>
            <div className="mt-8 flex flex-row overflow-x-auto sm:grid sm:grid-cols-3 gap-4 sm:gap-6 hide-scrollbar">
              <div className="flex items-center gap-2 sm:gap-4 rounded-2xl sm:rounded-[20px] bg-gray-50 p-3 sm:p-5 min-w-[140px] h-[88px]">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 w-full"><div className="w-16 h-4 bg-gray-200 rounded" /><div className="w-12 h-3 bg-gray-200 rounded" /></div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 rounded-2xl sm:rounded-[20px] bg-gray-50 p-3 sm:p-5 min-w-[140px] h-[88px]">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 w-full"><div className="w-16 h-4 bg-gray-200 rounded" /><div className="w-12 h-3 bg-gray-200 rounded" /></div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 rounded-2xl sm:rounded-[20px] bg-gray-50 p-3 sm:p-5 min-w-[140px] h-[88px]">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 w-full"><div className="w-16 h-4 bg-gray-200 rounded" /><div className="w-12 h-3 bg-gray-200 rounded" /></div>
              </div>
            </div>
        </div>
        <div className="lg:col-span-1 min-w-0 h-full rounded-[20px] bg-[#EBE4FF] shadow-sm p-6 relative overflow-hidden flex items-center">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
             <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-full bg-[#D1C4E9] shrink-0" />
                <div className="space-y-2 w-full">
                   <div className="w-[80%] h-4 bg-[#D1C4E9] rounded" />
                   <div className="w-[60%] h-4 bg-[#D1C4E9] rounded" />
                   <div className="w-[40%] h-4 bg-[#D1C4E9] rounded" />
                </div>
             </div>
        </div>
      </section>

      <section className="w-full min-w-0 bg-white rounded-xl shadow-sm p-5 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
        
        {/* Table Header Skeleton */}
        <div className="w-64 h-6 bg-gray-100 rounded mb-2" />
        <div className="w-40 h-4 bg-gray-100 rounded mb-6" />
        
        {/* Table Body Skeleton */}
        <div className="overflow-x-auto w-full mt-4">
          <div className="w-full min-w-[800px]">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-4 py-3 bg-[#FAFAFA] rounded-t-lg mb-2">
              <div className="h-4 bg-gray-200 rounded w-24 ml-4" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            
            {/* Rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-50 items-center">
                <div className="ml-4 space-y-2">
                   <div className="h-4 bg-gray-100 rounded w-32" />
                   <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-8" />
                <div className="h-4 bg-gray-100 rounded w-8" />
                <div className="h-4 bg-gray-100 rounded w-8" />
                <div className="h-4 bg-gray-100 rounded w-12" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  if (isBodyOnly) {
    return bodyContent;
  }

  return (
    <main className="p-3 md:p-4 space-y-4 md:space-y-6 min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAFAFA]">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex text-black items-start md:items-center gap-2">
          <button
            onClick={() => router.back()}
            className="mt-1 md:mt-0 text-gray-600 cursor-pointer hover:text-black shrink-0"
          >
            <CaretLeft size={24} className="md:w-[25px] md:h-[25px]" weight="bold" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Attendance</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
              Track, Verify and Manage Attendance Records.
            </p>
          </div>
        </div>
        <CourseScheduleCard style="w-full md:w-[320px] max-md:hidden shrink-0" isLoading={true} />
      </section>
      
      {bodyContent}
    </main>
  );
}
