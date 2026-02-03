export default function AssignmentSkeleton() {
  return (
    <div className="bg-white relative w-full h-[170px] rounded-xl flex items-center p-3 gap-3 mb-3 border border-gray-100 shadow-sm">
      {/* Shimmer Effect Wrapper */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* Image Placeholder */}
      <div className="h-[139px] w-[145px] rounded-lg bg-gray-200 animate-pulse shrink-0" />

      {/* Content Section */}
      <div className="h-[139px] w-[520px] flex flex-col justify-between z-10">
        <div className="w-full h-[75%] flex">
          {/* Text Lines */}
          <div className="w-[60%] flex flex-col pt-1 gap-3">
            {/* Title Line */}
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />

            {/* Description Lines */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Date/Icon Line (mt-auto matches your real card) */}
            <div className="flex items-center gap-2 mt-auto pb-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Right Controls Placeholder */}
          <div className="w-[40%] flex flex-col justify-between items-end">
            <div className="flex gap-2">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom Stats Placeholder */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Marks Badge Placeholder (Matches absolute left-133.5 top-26) */}
      <div className="absolute left-133.5 top-26 flex flex-col items-center">
        <div className="h-9 w-29 bg-gray-200 rounded-sm animate-pulse" />
      </div>
    </div>
  );
}
