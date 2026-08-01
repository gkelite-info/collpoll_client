"use client";

import { CaretLeft } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useRouter } from "next/navigation";

export default function StudentDetailsSkeleton() {
  const router = useRouter();

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

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-2 min-w-0 h-[220px] rounded-[20px] bg-white shadow-sm p-5 relative overflow-hidden">
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
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-24 h-5 bg-gray-100 rounded" /></div>
              <div className="space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-32 h-5 bg-gray-100 rounded" /></div>
              <div className="space-y-2"><div className="w-12 h-3 bg-gray-100 rounded" /><div className="w-20 h-5 bg-gray-100 rounded" /></div>
            </div>
            <div className="mt-6 flex gap-4">
              <div className="w-24 h-10 bg-gray-100 rounded-xl" />
              <div className="w-24 h-10 bg-gray-100 rounded-xl" />
              <div className="w-24 h-10 bg-gray-100 rounded-xl" />
            </div>
        </div>
        <div className="lg:col-span-1 min-w-0 h-[220px] rounded-[20px] bg-[#EBE4FF] shadow-sm p-6 relative overflow-hidden flex items-center">
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

      <section className="w-full min-w-0 bg-white rounded-xl shadow-sm p-5 h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent z-10" />
        <div className="w-48 h-6 bg-gray-100 rounded mb-6" />
        <div className="space-y-4">
          <div className="w-full h-10 bg-gray-50 rounded" />
          <div className="w-full h-10 bg-gray-50 rounded" />
          <div className="w-full h-10 bg-gray-50 rounded" />
          <div className="w-full h-10 bg-gray-50 rounded" />
        </div>
      </section>
    </main>
  );
}
