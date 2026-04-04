import React from "react";

// 1. Top Stat Skeleton (Users & Overall Finance)
export const TopStatSkeleton = ({
  theme = "blue",
}: {
  theme?: "purple" | "blue";
}) => {
  const isP = theme === "purple";
  return (
    <div
      className={`p-3 rounded-lg flex flex-col justify-between h-full min-h-[95px] animate-pulse
        ${isP ? "bg-purple-100/50" : "bg-blue-100/50"}`}
    >
      <div
        className={`w-7 h-7 rounded ${isP ? "bg-purple-200" : "bg-blue-200"}`}
      />
      <div className="space-y-1.5">
        <div
          className={`h-5 w-20 rounded ${isP ? "bg-purple-200" : "bg-blue-200"}`}
        />
        <div
          className={`h-2.5 w-24 rounded ${isP ? "bg-purple-200" : "bg-blue-200"}`}
        />
      </div>
    </div>
  );
};

// 2. Year Card Skeleton (Grid of Semesters)
export const YearCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 h-[95px] flex flex-col justify-center gap-2 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-3.5 w-16 bg-gray-200 rounded" />
      <div className="flex items-center gap-2">
        <div className="h-2 w-8 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-300 rounded-full" />
      </div>
    </div>
    <div className="flex gap-2 mt-1">
      <div className="bg-gray-50 py-1.5 px-2 rounded flex-1 h-[36px] flex flex-col justify-between">
        <div className="h-2 w-8 bg-gray-200 rounded" />
        <div className="h-2.5 w-12 bg-gray-300 rounded" />
      </div>
      <div className="bg-gray-50 py-1.5 px-2 rounded flex-1 h-[36px] flex flex-col justify-between">
        <div className="h-2 w-8 bg-gray-200 rounded" />
        <div className="h-2.5 w-12 bg-gray-300 rounded" />
      </div>
    </div>
  </div>
);

// 3. Fee Collection List Skeleton
export const FeeCollectionSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 h-[220px] flex flex-col animate-pulse">
    <div className="flex items-center justify-between mb-4 mt-1">
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-4 bg-gray-200 rounded" />
    </div>
    <div className="flex-1 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-2.5 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
    <div className="bg-gray-50 px-3 py-2 rounded-md mt-3 flex justify-between items-center h-[34px]">
      <div className="h-3 w-10 bg-gray-200 rounded" />
      <div className="h-5 w-20 bg-gray-300 rounded-full" />
    </div>
  </div>
);

// 4. Trend Chart Bar Skeleton
export const TrendChartSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 h-[220px] flex flex-col animate-pulse">
    <div className="flex justify-between mb-4 mt-1">
      <div className="h-3 w-40 bg-gray-200 rounded" />
      <div className="h-4 w-4 bg-gray-200 rounded" />
    </div>
    <div className="flex-1 w-full flex items-end justify-between gap-3 pt-4 pb-2 px-6 border-b border-dashed border-gray-100">
      {/* Fake bars of varying heights */}
      <div className="w-7 h-[40%] bg-gray-200 rounded-t-sm" />
      <div className="w-7 h-[60%] bg-gray-200 rounded-t-sm" />
      <div className="w-7 h-[90%] bg-gray-200 rounded-t-sm" />
      <div className="w-7 h-[30%] bg-gray-200 rounded-t-sm" />
      <div className="w-7 h-[75%] bg-gray-200 rounded-t-sm" />
    </div>
  </div>
);

export const QuickInsightsSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 h-[220px] animate-pulse">
    <div className="h-3 w-24 bg-gray-200 rounded mb-4 mt-1" />
    <div className="space-y-2 mt-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gray-50 p-2 rounded flex justify-between items-center h-[36px]"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-16 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-12 bg-gray-200 rounded" />
            <div className="w-3 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PendingSummarySkeleton = () => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-[104px] flex flex-col justify-center animate-pulse w-full">
    <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
    <div className="h-2 w-32 bg-gray-200 rounded mb-4" />
    <div className="flex items-baseline gap-1 mt-1">
      <div className="h-6 w-24 bg-gray-300 rounded" />
    </div>
  </div>
);
