"use client";

import React, { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { SharedMyPayPage } from "@/app/components/payroll/SharedMyPayPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm">
          <Loader />
        </div>
      }
    >
      <SharedMyPayPage />
    </Suspense>
  );
}
