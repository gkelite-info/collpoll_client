import { FC } from "react";

export const FacultyCardShimmer: FC = () => {
  return (
    <div className="w-full bg-white rounded-[20px] shadow-sm p-5 font-sans border border-gray-100 animate-pulse">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0"></div>
          <div className="flex gap-2 items-center">
            <div className="h-6 w-30 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="h-7 w-30 bg-gray-200 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 gap-x-2 mb-6 pl-1">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 w-16 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-5 w-28 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-md p-4 bg-gray-50 border border-gray-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-200"></div>
            <div className="flex flex-col gap-1.5">
              <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};