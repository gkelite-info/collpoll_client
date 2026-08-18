export const ParentsListSkeleton = () => (
  <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:gap-6 md:p-6 lg:p-8 animate-pulse">
    <div className="h-6 w-48 bg-gray-200 rounded"></div>
    <div className="flex flex-col gap-4 mt-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0"></div>
          <div className="flex flex-col gap-2 w-full">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-100 shrink-0"></div>
        </div>
      ))}
    </div>
  </div>
);
