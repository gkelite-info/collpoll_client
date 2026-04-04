export const MeetingCardShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-w-0 animate-pulse">
    {/* Green header bar */}
    <div className="bg-gray-200 px-4 py-2.5 flex items-center gap-3 border-b-2 border-gray-200">
      <div className="bg-gray-300 p-1.5 rounded-full flex-shrink-0 w-[30px] h-[30px]" />
      <div className="h-5 bg-gray-200 rounded w-48" />
    </div>

    {/* Body */}
    <div className="p-5 flex flex-col gap-5 flex-1">
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>

      <div className="flex flex-col gap-4 text-sm">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
