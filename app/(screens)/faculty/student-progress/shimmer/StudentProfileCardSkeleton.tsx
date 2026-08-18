export const StudentProfileCardSkeleton = () => (
  <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:gap-6 md:p-6 lg:p-8 animate-pulse">
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-200 shrink-0"></div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 mt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
    <div className="mt-2 grid grid-cols-3 gap-2 md:gap-4 lg:grid-cols-3 w-full">
      <div className="h-16 rounded-lg bg-green-50 flex items-center justify-center">
        <div className="h-6 w-20 bg-green-100 rounded"></div>
      </div>
      <div className="h-16 rounded-lg bg-red-50 flex items-center justify-center">
        <div className="h-6 w-20 bg-red-100 rounded"></div>
      </div>
      <div className="h-16 rounded-lg bg-blue-50 flex items-center justify-center">
        <div className="h-6 w-20 bg-blue-100 rounded"></div>
      </div>
    </div>
  </div>
);
