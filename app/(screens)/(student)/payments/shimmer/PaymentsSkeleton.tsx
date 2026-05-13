"use client";

export default function PaymentsSkeleton() {
  return (
    <div className="lg:p-2 bg-[#F5F5F7] animate-pulse">
      <div className="mb-6 max-md:mb-4 max-md:p-4 max-md:pb-0">
        <div className="h-6 w-72 bg-gray-300 rounded mb-3 max-md:w-48" />
        <div className="h-4 w-[520px] bg-gray-200 rounded max-md:hidden" />
      </div>

      <div className="flex rounded-xl bg-white p-6 max-md:p-4 shadow-sm mb-8 max-md:mb-0 items-center gap-6">
        <div className="h-28 w-28 max-md:h-20 max-md:w-20 rounded-full shrink-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />

        <div className="flex-1 space-y-3">
          <div className="h-6 w-52 max-md:w-36 rounded-md bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer" />

          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-40 max-md:w-28 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-14 rounded bg-gray-200" />
            <div className="h-4 w-56 max-md:w-40 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl mt-4 p-8  shadow-sm min-h-[600px] space-y-6">
        <div className="flex justify-center  max-md:justify-start mb-10 max-md:mb-4 max-md:px-4 max-md:overflow-x-hidden">
          <div className="relative flex items-center bg-gray-100 max-md:bg-transparent p-2 max-md:p-0 rounded-full max-md:rounded-none gap-3">
            <div className="h-9 w-36 rounded-full bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-24 max-md:h-8" />
            <div className="h-9 w-40 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-28 max-md:h-8" />
            <div className="h-9 w-28 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-24 max-md:h-8" />
          </div>
        </div>
        <div className="h-5 w-56 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-40" />

        <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-3">
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-36" />
            <div className="h-3 w-32 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-24" />
          </div>
          <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-16" />
        </div>

        <div className="space-y-4 max-w-2xl mt-6">
          <div className="flex justify-between">
            <div className="h-4 w-48 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-32" />
            <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-16" />
          </div>

          <div className="flex justify-between">
            <div className="h-4 w-48 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-32" />
            <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-16" />
          </div>

          <div className="flex justify-between">
            <div className="h-4 w-48 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:w-32" />
            <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-16" />
          </div>

          <div className="flex justify-between pt-2">
            <div className="h-4 w-56 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-40" />
            <div className="h-4 w-28 rounded bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-[length:200%_100%] animate-shimmer max-md:w-20" />
          </div>
        </div>

        <div className="mt-10 space-y-4 max-md:mt-6">
          <div className="h-10 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer max-md:h-20" />
          <div className="h-10 rounded bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer max-md:h-20" />
          <div className="h-10 rounded bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer max-md:h-20" />
          <div className="h-10 rounded bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer max-md:hidden" />
        </div>
      </div>
    </div>
  );
}
