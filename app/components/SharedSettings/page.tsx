"use client";
import { Suspense } from "react";
import SettingsClient from "./SettingsClient";

export default function StudentSettings() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-[#282828] font-medium">
          Loading settings...
        </div>
      }
    >
      <div className="w-full">
        <SettingsClient />
      </div>
    </Suspense>
  );
}
