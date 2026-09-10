import { AcademicSectionsSkeleton } from "./academicSectionsSkeleton";

export function AcademicPageSkeleton() {
  return (
    <div className="m-4 flex min-h-[calc(100vh-100px)] flex-col gap-6" role="status" aria-label="Loading academics">
      <span className="sr-only">Loading academics...</span>
      <div className="flex justify-between gap-4 animate-pulse" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-7 w-36 rounded bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
        <div className="h-14 w-40 rounded-xl bg-gray-200" />
      </div>
      <div className="flex flex-col gap-4 md:flex-row animate-pulse" aria-hidden="true">
        <div className="h-11 w-full rounded-full bg-gray-200 md:w-[32%]" />
        <div className="flex flex-1 gap-2 rounded-xl bg-white p-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-10 flex-1 rounded bg-gray-200" />)}
        </div>
      </div>
      <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 self-center p-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => <AcademicSectionsSkeleton key={i} />)}
      </div>
      <div className="mt-auto h-16 w-full max-w-[1200px] self-center rounded-lg bg-gray-200 animate-pulse" aria-hidden="true" />
    </div>
  );
}
