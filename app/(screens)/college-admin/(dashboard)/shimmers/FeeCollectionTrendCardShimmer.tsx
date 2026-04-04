export const FeeCollectionTrendCardShimmer = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-40" />
    
    {/* Donut placeholder */}
    <div className="flex justify-center">
      <div className="w-[150px] h-[150px] rounded-full bg-gray-200" />
    </div>

    {/* Legend placeholders */}
    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
