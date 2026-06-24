import CollegeTimingsShimmer from "./CollegeTimingsShimmer";

export default function CollegeTimingsTable({ timings, isLoading }: { timings: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <CollegeTimingsShimmer />;
  }

  if (!timings || timings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        No college timings found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible w-full overflow-x-auto custom-scrollbar">
      {/* Desktop Header Row */}
      <div className="hidden lg:grid grid-cols-[140px_100px_100px_180px_100px_1fr] gap-4 px-6 py-4 bg-gray-50 rounded-t-lg border-b border-gray-100 text-sm font-semibold text-[#16284F] min-w-[900px]">
        <div>Day</div>
        <div>Status</div>
        <div>Open At</div>
        <div>Lunch Time</div>
        <div>Close At</div>
        <div>Breaks</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 min-w-[280px] lg:min-w-[900px]">
        {timings.map((timing, idx) => (
          <div
            key={idx}
            className={`flex flex-col lg:grid lg:grid-cols-[140px_100px_100px_180px_100px_1fr] lg:items-center gap-3 lg:gap-4 px-4 lg:px-6 py-4 hover:bg-gray-50/50 transition-colors ${
              !timing.isOpen ? "bg-gray-50/30" : ""
            }`}
          >
            {/* Mobile Headers inline */}
            <div className="font-semibold text-[#16284F] text-base lg:text-sm flex items-center justify-between lg:block">
              {timing.dayOfWeek}
              <span className={`lg:hidden text-xs px-2 py-1 rounded-full font-medium ${timing.isOpen
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {timing.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            
            <div className="hidden lg:flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${timing.isOpen
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
                  }`}
              >
                {timing.isOpen ? "Open" : "Closed"}
              </span>
            </div>

            {/* Timings */}
            <div className="flex items-center lg:block">
               <span className="lg:hidden w-24 text-sm text-gray-500">Open At:</span>
               <span className="text-[#525252] font-medium text-sm">{timing.isOpen && timing.openAt ? timing.openAt : "-"}</span>
            </div>

            <div className="flex items-center lg:block">
               <span className="lg:hidden w-24 text-sm text-gray-500">Lunch:</span>
               <span className="text-[#525252] font-medium text-sm">
                 {timing.isOpen && timing.lunchFrom && timing.lunchTo ? `${timing.lunchFrom} - ${timing.lunchTo}` : "-"}
               </span>
            </div>

            <div className="flex items-center lg:block">
               <span className="lg:hidden w-24 text-sm text-gray-500">Close At:</span>
               <span className="text-[#525252] font-medium text-sm">{timing.isOpen && timing.closeAt ? timing.closeAt : "-"}</span>
            </div>

            {/* Breaks */}
            <div className="flex flex-col lg:block mt-2 lg:mt-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
               <span className="lg:hidden text-sm text-gray-500 font-medium mb-2">Breaks:</span>
               {timing.isOpen && timing.breaks && timing.breaks.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {timing.breaks.map((b: any, i: number) => (
                     <span key={i} className="text-[12px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 whitespace-nowrap font-medium">
                       {b.startTime} - {b.endTime}
                     </span>
                   ))}
                 </div>
               ) : (
                 <span className="text-[#525252] font-medium text-sm">-</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
