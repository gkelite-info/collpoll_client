export const FeeCollectionTrendCardShimmer = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />

    <div className="flex justify-center py-1">
      <div className="relative w-[140px] h-[140px] flex items-center justify-center animate-pulse">
        <div className="w-[118px] h-[118px] rounded-full border-[14px] border-gray-100" />

        <div className="absolute h-3.5 bg-gray-200 rounded w-16" />
      </div>
    </div>

    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2.5 mt-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 shrink-0" />

          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-gray-200 rounded w-14" />
            <div className="h-2.5 bg-gray-200 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
