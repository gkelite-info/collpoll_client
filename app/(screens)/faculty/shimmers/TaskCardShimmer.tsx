"use client";

export default function TaskCardShimmer() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-md mt-3 p-2 flex justify-between animate-pulse">
      <div className="w-[75%] space-y-2 py-1 pr-2">
        <div className="h-3.5 bg-gray-200 rounded w-[60%]" />
        <div className="h-2.5 bg-gray-200 rounded w-[90%]" />
      </div>

      <div className="w-[25%] flex flex-col items-end justify-start gap-2">
        <div className="h-2.5 w-10 bg-gray-200 rounded mt-1" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
          <div className="h-6 w-6 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}