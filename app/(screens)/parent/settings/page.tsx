"use client";
import { Suspense } from "react";
import SettingsClient from "@/app/components/SharedSettings/SettingsClient";

export default function ParentSettings() {
  return (
    <Suspense fallback={<div className="p-4">Loading settings...</div>}>
      <div className="md:w-[82vw] max-md:scale-[3.5] max-md:origin-top-left">
        <SettingsClient />
      </div>
    </Suspense>
  );
}
