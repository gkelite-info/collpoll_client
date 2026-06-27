export default function PolicyShimmer() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 relative animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-1/4 mb-1"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mt-1"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Grace Period */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-[46px] bg-gray-200 rounded-lg w-full"></div>
        </div>

        {/* Early Out */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-[46px] bg-gray-200 rounded-lg w-full"></div>
        </div>

        {/* Full Day Min % */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-[46px] bg-gray-200 rounded-lg w-full"></div>
        </div>

        {/* Half Day Min % */}
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-[46px] bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>

      {/* Checkbox settings */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded shrink-0"></div>
          <div className="flex flex-col gap-1 w-full">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <div className="h-[44px] bg-gray-200 rounded-lg w-[140px]"></div>
      </div>
    </div>
  );
}
