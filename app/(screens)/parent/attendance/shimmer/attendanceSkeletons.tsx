import React from "react";

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full mt-4 bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex justify-between border-b pb-3 mb-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-4 w-20 bg-gray-200 rounded animate-pulse"
          ></div>
        ))}
      </div>
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-between border-b pb-3 mb-3 last:border-0 last:mb-0 last:pb-0"
        >
          {[...Array(6)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 w-16 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const SubjectAttendanceSkeleton = () => {
  return (
    <div className="flex flex-col pb-3 w-full">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-[50%] gap-2">
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex justify-end w-[32%]">
          <div className="w-[320px] h-[80px] bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Cards Row Skeleton */}
      <div className="w-full h-[170px] mt-4 flex items-start gap-3">
        <div className="w-44 h-[120px] bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="w-[300px] h-[120px] bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="w-[345px] h-[120px] bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-4 flex flex-col items-start w-full">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
};

export const SubjectAttendanceDetailsSkeleton = () => {
  return (
    <div className="flex flex-col pb-3 w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-[50%] gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse ml-8"></div>
        </div>
        <div className="flex justify-end w-[32%]">
          <div className="w-[320px] h-[80px] bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <div className="w-full h-[170px] mt-4 flex items-start gap-3 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-[182px] h-[120px] bg-gray-200 rounded-xl animate-pulse shrink-0"
          ></div>
        ))}
        <div className="w-[345px] h-[120px] bg-gray-200 rounded-xl animate-pulse shrink-0"></div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="w-full flex flex-col items-start gap-3">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-full h-[40px] bg-gray-100 rounded-lg animate-pulse flex items-center px-4 gap-6">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="mt-4 w-[85%]">
          <TableSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
};
