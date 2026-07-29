export default function AdminAssignmentCardShimmer() {
  return (
    <div className="mb-3 w-full">
      <div className="relative hidden h-[170px] w-full items-center gap-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:flex">
        <div className="pointer-events-none absolute inset-0 z-20 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="h-[139px] w-[145px] shrink-0 animate-pulse rounded-lg bg-gray-200" />

        <div className="z-10 flex h-[139px] min-w-0 flex-1 flex-col justify-between overflow-hidden">
          <div className="flex w-full justify-between gap-3">
            <div className="flex min-w-0 w-[60%] flex-col gap-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="h-3 w-32 max-w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 w-32 max-w-full animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-7 w-24 shrink-0 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:hidden">
        <div className="pointer-events-none absolute inset-0 z-20 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="flex gap-3">
          <div className="h-[70px] w-[70px] shrink-0 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex min-w-0 flex-1 flex-col py-0.5">
            <div className="flex w-full items-start justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
            <div className="mt-auto flex w-full items-center justify-between pt-2">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
