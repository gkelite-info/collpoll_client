"use client";

export default function TaskCardShimmer() {
  return (
    <div className="bg-[#E8F8EF] rounded-md mt-3 p-3 animate-pulse">
      <div className="flex justify-between">
        
        {/* Title + Description */}
        <div className="w-[80%] space-y-2">
          <div className="h-4 bg-gray-300 rounded w-[60%]" />
          <div className="h-3 bg-gray-300 rounded w-[90%]" />
        </div>

        {/* Time + Icons */}
        <div className="w-[20%] flex flex-col items-end gap-3">
          <div className="h-3 w-10 bg-gray-300 rounded" />
          <div className="flex gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded-full" />
            <div className="h-4 w-4 bg-gray-300 rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}