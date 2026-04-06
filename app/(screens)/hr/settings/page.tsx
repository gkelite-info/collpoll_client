"use client";
import { Suspense } from "react";
import SettingsClient from "@/app/components/SharedSettings/SettingsClient";

export default function HrSettings() {
  return (
    <Suspense fallback={<div className="p-4">Loading settings...</div>}>
      <div className="w-[82vw]">
        <SettingsClient CardIsVisible={false} />
      </div>
    </Suspense>
  );
}
