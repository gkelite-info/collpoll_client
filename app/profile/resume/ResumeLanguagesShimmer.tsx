export default function ResumeLanguagesShimmer() {
  return (
    <div className="mt-3 h-full">
      <div className="bg-white rounded-lg shadow-sm p-6 h-[95%]">
        <div className="flex justify-between">
          <div className="h-7 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="mt-6 max-w-xl flex flex-col mx-auto">
          {/* Dropdown shimmer */}
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />

          {/* Selected languages box shimmer */}
          <div className="mt-4 border border-[#C0C0C0] rounded px-3 py-3 min-h-12">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Save button shimmer */}
          <div className="flex justify-end mt-6">
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}