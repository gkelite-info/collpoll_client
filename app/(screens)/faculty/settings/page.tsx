'use client'
import { Suspense } from "react";
import SettingsClient from "./SettingsClient";

export default function StudentSettings() {

  return (
    <Suspense fallback={<div className="p-4">Loading settings...</div>}>
      <div className="w-[82vw]">
        <SettingsClient />
      </div>
    </Suspense>
  );
}
