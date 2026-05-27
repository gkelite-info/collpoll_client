export default function AssignmentSkeleton() {
  return (
    <div className="w-full mb-3">
      {/* Desktop View */}
      <div className="hidden md:flex bg-white relative w-full h-[170px] rounded-xl items-center p-3 gap-3 border border-gray-100 shadow-sm overflow-hidden">
        {/* Shimmer Effect Wrapper */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-20 pointer-events-none" />

        {/* Image Placeholder */}
        <div className="h-[139px] w-[145px] rounded-lg bg-gray-200 animate-pulse shrink-0" />

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between h-[139px] z-10">
          <div className="w-full flex justify-between">
            {/* Text Lines */}
            <div className="w-[60%] flex flex-col gap-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Right Controls Placeholder */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded mt-1 animate-pulse" />
            </div>
          </div>

          {/* Bottom Stats Placeholder */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col bg-white rounded-xl p-3 shadow-sm border border-gray-100 w-full relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-20 pointer-events-none" />
        <div className="flex gap-3">
          <div className="w-[70px] h-[70px] rounded-lg bg-gray-200 animate-pulse shrink-0" />
          
          <div className="flex-1 flex flex-col min-w-0 py-0.5">
            <div className="flex justify-between items-start w-full">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <div className="w-[20px] h-[20px] rounded-full bg-gray-200 animate-pulse" />
                <div className="w-[20px] h-[20px] rounded-full bg-gray-200 animate-pulse" />
                <div className="w-[20px] h-[20px] rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
            
            <div className="mt-auto pt-2 flex justify-between items-center w-full">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
