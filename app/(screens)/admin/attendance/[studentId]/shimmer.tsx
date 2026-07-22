import { CaretLeftIcon } from "@phosphor-icons/react";
import React from "react";

export default function StudentDetailsShimmer() {
  return (
    <main className="p-4 space-y-6 min-h-screen animate-pulse">
      {/* Header Info Chips Shimmer */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <CaretLeftIcon className="h-4 w-4 -mr-4 text-gray-300" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-[#E8F5E9] rounded-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Section for Profile and AI Bot */}
      <section className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {/* Profile Card Shimmer */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
            <div className="space-y-3 w-full">
              <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
              <div className="flex flex-wrap gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-auto pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 flex flex-col justify-center space-y-2">
                <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
                <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Bot Card Shimmer */}
        <div className="lg:col-span-1 bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[220px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="space-y-3 flex-1 mt-2">
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-[90%] bg-gray-200 rounded-md"></div>
            <div className="h-4 w-[80%] bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </section>

      {/* Subject-Wise Table Shimmer */}
      <section className="w-full bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="mb-4 space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
        </div>
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-[#FAFAFA]">
            {['Subject Name', 'Total', 'Attended', 'Missed', 'Leave', 'Percentage', 'Actions'].map((col, idx) => (
              <div key={idx} className="flex-1 h-4 bg-gray-200 rounded w-16"></div>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex items-center px-4 py-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-20"></div>
                  <div className="h-3 bg-gray-100 rounded w-10"></div>
                </div>
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <div key={col} className="flex-1 h-4 bg-gray-100 rounded w-12"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
