
export function TaxDeclarationModalShimmer() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 flex flex-col gap-2 mt-1">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-1"></div>
        </div>
        <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 flex flex-col gap-2 mt-1">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-1"></div>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-[#f8f9fa] px-4 py-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/4 my-1"></div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 mt-1">
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 mt-1">
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
          <div className="flex justify-between items-center pb-2 mt-1">
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
