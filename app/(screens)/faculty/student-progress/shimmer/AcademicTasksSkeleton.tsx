export const AcademicTasksSkeleton = () => (
  <div className="flex h-full min-h-[400px] w-full flex-col rounded-lg bg-white p-5 shadow-sm animate-pulse">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
      <div className="h-6 w-40 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
        <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
        <div className="h-8 w-32 bg-gray-100 rounded-full"></div>
      </div>
    </div>
    <div className="flex items-center gap-4 py-4">
      <div className="h-10 w-32 bg-gray-100 rounded-full"></div>
      <div className="h-10 w-32 bg-gray-100 rounded-full"></div>
      <div className="h-10 w-32 bg-gray-100 rounded-full"></div>
    </div>
    <div className="flex flex-col gap-4 mt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50">
          <div className="h-4 w-24 bg-gray-100 rounded"></div>
          <div className="h-4 w-32 bg-gray-100 rounded hidden sm:block"></div>
          <div className="h-4 w-24 bg-gray-100 rounded hidden md:block"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);
