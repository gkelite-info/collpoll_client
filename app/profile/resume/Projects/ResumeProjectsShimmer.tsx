export default function ResumeProjectsShimmer() {
  return (
    <div className="w-full mx-auto bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {[1, 2].map((i) => (
        <div key={i} className="mb-12">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex flex-col gap-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-end mt-4">
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}