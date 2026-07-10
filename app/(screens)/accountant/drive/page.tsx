import DriveClient from "@/app/components/SharedDrive/DriveClient";
import { Suspense } from "react";

export default function AccountantDrivePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading drive...</div>}>
      <div className="h-full w-full">
        <DriveClient />
      </div>
    </Suspense>
  );
}
