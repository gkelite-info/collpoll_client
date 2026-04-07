export default function ResumeInternshipsShimmer() {
  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="h-8 w-36 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-8 mt-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-[#C0C0C0] rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-14 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-14 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}