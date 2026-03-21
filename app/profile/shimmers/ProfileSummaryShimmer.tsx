export default function ProfileSummaryShimmer() {
  return (
    <div className="min-h-[58vh] bg-gray-100 flex justify-center rounded-xl mt-2 mb-5 animate-pulse">
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded" />
        </div>

        <div className="h-5 w-64 bg-gray-200 rounded mb-2" />

        <div className="h-4 w-96 bg-gray-200 rounded mb-1" />
        <div className="h-4 w-80 bg-gray-200 rounded mb-4" />

        <div className="relative">
          <div className="w-full h-50 bg-gray-200 rounded-lg" />
          <div className="absolute bottom-3 right-4 h-3 w-12 bg-gray-300 rounded" />
        </div>

        <div className="flex justify-end mt-3">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}