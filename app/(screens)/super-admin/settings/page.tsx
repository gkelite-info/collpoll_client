"use client";
import SettingsClient from "@/app/components/SharedSettings/SettingsClient";
import { Suspense } from "react";

export default function SuperAdminSettings() {
  return (
    <Suspense fallback={<div className="p-4">Loading settings...</div>}>
      <div className="w-[82vw]">
        <SettingsClient />
      </div>
    </Suspense>
  );
}
