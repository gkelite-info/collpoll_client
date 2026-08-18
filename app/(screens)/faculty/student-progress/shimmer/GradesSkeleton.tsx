export const GradesSkeleton = () => (
  <div className="flex h-full min-h-[400px] w-full flex-col rounded-lg bg-white p-5 shadow-sm animate-pulse">
    <div className="h-6 w-32 bg-gray-200 rounded mb-6 border-b border-gray-100 pb-4"></div>
    <div className="flex flex-col gap-6 mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 w-16 bg-gray-100 rounded"></div>
          <div className="h-4 w-6 bg-gray-200 rounded font-bold"></div>
          <div className="h-4 w-16 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);
