"use client";

import { Suspense } from "react";
import ReimbursementsClient from "./ReimbursementsClient";

export default function SharedReimbursementsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-[#282828] font-medium">
          Loading reimbursements...
        </div>
      }
    >
      <div className="w-full">
        <ReimbursementsClient />
      </div>
    </Suspense>
  );
}
