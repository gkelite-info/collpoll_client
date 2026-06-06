"use client";

import { Suspense } from "react";
import LeaveRequestRightPanel from "./components/LeaveRequestRightPanel";
import LeaveRequestsTable from "./components/LeaveRequestsTable";
import LeaveSummaryCards from "./components/LeaveSummaryCards";

function CollegeAdminLeaveRequestContent() {
  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-2 md:w-[68%]">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-[15px] font-bold text-[#43C17A] lg:text-[17px]">
              Tagged Leave Requests
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              Review leave requests where you are tagged and join the group chat.
            </p>
          </div>
        </div>

        <LeaveSummaryCards />
        <LeaveRequestsTable />
      </section>
      <LeaveRequestRightPanel />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CollegeAdminLeaveRequestContent />
    </Suspense>
  );
}
