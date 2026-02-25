import { CaretDown, CaretLeftIcon } from "@phosphor-icons/react";
 
const shimmerClass = "relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";
 
export default function FullPageShimmer({ selectedBranch }: { selectedBranch: string }) {
  return (
    <div className="p-2 bg-[#F3F4F6] min-h-screen">
      <div className="flex items-center gap-2 lg:mb-3">
        <CaretLeftIcon size={20} weight="bold" className="text-gray-400" />
        <h1 className="text-xl font-semibold text-[#282828] mb-0">Fee Collection by Year</h1>
      </div>
 
      <div className="flex flex-wrap gap-1">
        <div className="bg-white rounded-lg shadow-sm p-2 flex items-center mr-1">
          <div className="bg-[#1F2F56] text-white min-w-[130px] px-3 py-2 rounded-md flex items-center justify-between text-2xl font-semibold opacity-50">
            <span>{selectedBranch || "---"}</span>
            <CaretDown size={20} weight="bold" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={`full-shimmer-top-${i}`} className={`h-[70px] rounded-lg shadow-sm ${shimmerClass}`} />
          ))}
        </div>
      </div>
 
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={`full-shimmer-bottom-${i}`} className={`h-[350px] rounded-lg shadow-sm ${shimmerClass}`} />
        ))}
      </div>
    </div>
  );
}
 