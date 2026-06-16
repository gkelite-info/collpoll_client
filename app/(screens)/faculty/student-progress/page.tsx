"use client";

import { Suspense } from "react";
import StudentProgressContent from "./components/studentProgressContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex justify-center items-center bg-[#F8F9FA]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#43C17A]" />
        </div>
      }
    >
      <StudentProgressContent />
    </Suspense>
  );
}
