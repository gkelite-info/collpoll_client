"use client";

import React, { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { SharedMyPayPage } from "@/app/components/payroll/SharedMyPayPage";

export default function Page({ profile }: { profile?: any }) {
  const adaptedProfile = profile ? {
    name: profile.name || "",
    id: String(profile.userId || profile.id || ""),
    employeeId: profile.identifierId || "-",
    joiningDate: profile.joiningDate || "-",
    department: profile.department || "-",
    role: profile.role || "-",
    image: profile.image || "/assets/images/defaultUser.png"
  } : undefined;

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm">
          <Loader />
        </div>
      }
    >
      <SharedMyPayPage overrideUserId={profile?.userId} employeeProfile={adaptedProfile} />
    </Suspense>
  );
}
