"use client";
import SettingsClient from "@/app/components/SharedSettings/SettingsClient";
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";

export default function CollegeAdminSettings() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-center">
          <Loader />
        </div>
      }
    >
      <div className="w-[82vw]">
        <SettingsClient CardIsVisible={false} />
      </div>
    </Suspense>
  );
}
