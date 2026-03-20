export default function ProfileLanguagesShimmer() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-[95%] animate-pulse">
      
      <div className="flex justify-between mb-6">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>

      <div className="max-w-xl flex flex-col mx-auto">
        
        <div className="h-10 bg-gray-200 rounded mb-4" />

        <div className="border border-[#CCCCCC] rounded px-3 py-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}