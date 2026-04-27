"use client";

import Skeleton from "@/app/utils/skeleton";

export function StudentProgressSkeleton() {
  return (
    <main className="p-3 relative overflow-hidden">
      <section className="mb-3">
        <div className="flex p-2 gap-3 justify-between items-center">
          <div className="w-full max-w-5xl rounded-xl">
            <div className="flex gap-3 flex-wrap">
              <Skeleton className="h-8 w-36 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </div>

          <div className="flex justify-end w-[32%]">
            <Skeleton className="h-24 w-[320px] rounded-2xl" />
          </div>

          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </section>

      <section className="min-h-screen bg-gray-100 flex flex-col gap-6">
        <article className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-6">
            <div className="flex gap-5 items-center">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-4">
            <Skeleton className="h-6 w-44 mb-5" />
            <Skeleton className="h-36 rounded-2xl" />
          </section>

          <section className="bg-white rounded-2xl p-6 lg:col-span-6">
            <Skeleton className="h-6 w-52 mb-6" />
            <div className="flex items-end justify-between gap-4 h-64">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="flex-1 rounded-t-3xl"
                  style={{ height: `${45 + ((index % 3) + 1) * 18}%` }}
                />
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 lg:col-span-4">
            <Skeleton className="h-6 w-44 mb-5" />
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </article>

        <section className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-12 w-44 rounded-xl" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="grid grid-cols-5 gap-4 bg-gray-100 px-6 py-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-24" />
              ))}
            </div>

            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 px-6 py-5 border-t border-gray-50"
                >
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
