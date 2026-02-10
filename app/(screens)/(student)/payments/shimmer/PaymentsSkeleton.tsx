"use client";

export default function PaymentsSkeleton() {
  return (
    <div className="p-4 lg:p-6 bg-[#F5F5F7] animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 w-72 bg-gray-300 rounded mb-3" />
        <div className="h-4 w-[520px] bg-gray-200 rounded" />
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex gap-6 mb-8">
        <div className="h-28 w-28 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-56 bg-gray-300 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-80 bg-gray-200 rounded" />
          <div className="h-4 w-60 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex justify-center mb-10">
        <div className="relative flex items-center bg-gray-100 p-2 rounded-full gap-3">
          <div className="h-9 w-36 bg-gray-300 rounded-full" />
          <div className="h-9 w-40 bg-gray-200 rounded-full" />
          <div className="h-9 w-28 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-white rounded-xl p-8 shadow-sm min-h-[600px] space-y-6">
        {/* Section title */}
        <div className="h-5 w-56 bg-gray-300 rounded" />

        {/* Fee Plan Card */}
        <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-300 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-24 bg-gray-300 rounded" />
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-4 max-w-2xl mt-6">
          <div className="flex justify-between">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-4 w-56 bg-gray-300 rounded" />
            <div className="h-4 w-28 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="mt-10 space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
