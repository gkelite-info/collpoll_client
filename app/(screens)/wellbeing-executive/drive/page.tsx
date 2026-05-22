import DriveClient from "@/app/components/SharedDrive/DriveClient";
import { Suspense } from "react";

export default function WellbeingExecutiveDrive() {
  return (
    <Suspense fallback={<div className="p-4">Loading drive...</div>}>
      <div className="w-full h-full">
        <DriveClient />
      </div>
    </Suspense>
  );
}
