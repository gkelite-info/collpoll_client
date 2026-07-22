import { CaretLeftIcon } from "@phosphor-icons/react";
import React from "react";

export default function SubjectDetailShimmer() {
  return (
    <main className="px-4 py-4 min-h-screen space-y-6 animate-pulse">
      {/* Header Shimmer */}
      <section className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <CaretLeftIcon className="h-6 w-6 -ml-1 mr-1 text-gray-300" />
            <div className="h-8 w-40 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded-md mt-2"></div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {/* Profile Card Shimmer (Span 2) */}
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
          
          {/* Summary Boxes Shimmer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-12 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Bot Card Shimmer (Span 1) */}
        <div className="lg:col-span-1 bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[220px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="space-y-3 flex-1 mt-2">
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
            <div className="h-4 w-[90%] bg-gray-200 rounded-md"></div>
            <div className="h-4 w-[80%] bg-gray-200 rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </section>

      {/* Table Shimmer */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
           <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
           <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
