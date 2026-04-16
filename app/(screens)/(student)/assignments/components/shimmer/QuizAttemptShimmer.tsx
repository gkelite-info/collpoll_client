export const QuizAttemptShimmer = () => (
  <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex flex-col gap-2 w-1/2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
    </div>
    <div className="h-2.5 w-full bg-gray-200 rounded-full mb-6"></div>
    <div className="flex-1 overflow-y-auto space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
