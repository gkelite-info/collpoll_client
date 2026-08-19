"use client";

import { Suspense } from "react";
import StudentProgressContent from "./components/studentProgressContent";
import { StudentProgressPageSkeleton } from "./shimmer/StudentProgressSkeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="p-2 relative overflow-hidden max-w-full min-h-screen flex flex-col">
          <div className="flex justify-center w-full mb-6">
            <div className="bg-white/80 p-2 rounded-full inline-flex gap-2 mx-auto self-center">
              <div className="w-36 md:w-44 py-2 rounded-full bg-[#43C17A] h-9 animate-pulse" />
              <div className="w-36 md:w-44 py-2 rounded-full bg-[#DEDEDE] h-9 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 w-full max-w-7xl mx-auto">
            <StudentProgressPageSkeleton />
          </div>
        </main>
      }
    >
      <StudentProgressContent />
    </Suspense>
  );
}
