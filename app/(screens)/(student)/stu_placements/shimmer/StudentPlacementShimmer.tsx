export function StudentPlacementCardShimmer() {
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-[15%_85%] items-start gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
      <div className="shrink-0 max-md:hidden">
        <div className="h-16 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-100" />
        </div>
        <div className="mt-3 h-3 w-16 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-gray-100"
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function StudentPlacementListShimmer() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <StudentPlacementCardShimmer key={item} />
      ))}
    </>
  );
}

export function StudentPlacementHeaderShimmer() {
  return (
    <section className="mb-4 flex items-center justify-between max-md:px-4 max-md:pt-4 max-md:mb-2">
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-100 max-md:hidden" />
      </div>
      <article className="flex w-[32%] shrink-0 justify-end max-lg:hidden">
        <div className="h-[86px] w-[320px] animate-pulse rounded-xl bg-gray-200" />
      </article>
    </section>
  );
}

export function StudentPlacementControlsShimmer() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-9 w-36 animate-pulse rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export function StudentPlacementRightShimmer() {
  return (
    <div className="w-[32%] shrink-0 p-2 pt-0 pr-0 hidden lg:block">
      <div className="mb-3 h-55 animate-pulse rounded-xl bg-gray-200" />
      <div className="mb-3 h-55 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-90 animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}
