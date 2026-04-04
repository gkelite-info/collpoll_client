export const AdminSectionShimmer = () => (
  <div>
    {/* Header with Add Admin button shimmer */}
    <div className="flex items-center justify-between mb-4">
      <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
    </div>

    {/* Admin cards horizontal scroll */}
    <div
      className="flex gap-4 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="min-w-[260px] flex-shrink-0">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
            {/* Header with name badge */}
            <div className="flex justify-between items-start mb-1">
              <div className="h-7 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-200 rounded-full w-16" />
            </div>

            {/* Email placeholder */}
            <div className="h-4 bg-gray-100 rounded w-40 mb-5" />

            {/* Details Grid */}
            <div className="space-y-2 text-[13px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
