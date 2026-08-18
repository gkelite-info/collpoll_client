export const AttendanceSummarySkeleton = () => (
  <div className="flex h-full min-h-[300px] w-full flex-col rounded-lg bg-white p-5 shadow-sm animate-pulse">
    <div className="h-6 w-48 bg-gray-200 rounded mb-8"></div>
    <div className="flex flex-col items-center justify-center flex-1 w-full relative pt-6">
      <div className="h-32 w-32 rounded-full border-[12px] border-gray-100 border-b-transparent"></div>
      <div className="absolute top-[50%] flex flex-col items-center gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
      </div>
    </div>
    <div className="mt-8 flex justify-center gap-8">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gray-200"></div>
        <div className="h-4 w-12 bg-gray-100 rounded"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gray-200"></div>
        <div className="h-4 w-12 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
);
