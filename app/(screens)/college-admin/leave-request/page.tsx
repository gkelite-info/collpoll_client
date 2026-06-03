"use client";

import { Suspense } from "react";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import AdminLeaveRequestRightPanel from "@/app/(screens)/admin/leave-request/components/AdminLeaveRequestRightPanel";
import AdminLeaveRequestsTable from "@/app/(screens)/admin/leave-request/components/AdminLeaveRequestsTable";
import AdminLeaveSummaryCards from "@/app/(screens)/admin/leave-request/components/AdminLeaveSummaryCards";

function CollegeAdminLeaveRequestContent() {
  const { collegeId, loading } = useCollegeAdmin();
  const activeView = "tagged";

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-2 md:w-[68%]">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-[#43C17A] md:text-2xl">
              Tagged Leave Requests
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              Review leave requests where you are tagged and join the group chat.
            </p>
          </div>
        </div>

        <AdminLeaveSummaryCards
          view={activeView}
          requestRole="CollegeAdmin"
          collegeIdOverride={collegeId}
          contextLoadingOverride={loading}
        />
        <AdminLeaveRequestsTable
          view={activeView}
          requestRole="CollegeAdmin"
          collegeIdOverride={collegeId}
          contextLoadingOverride={loading}
        />
      </section>

      <AdminLeaveRequestRightPanel />
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
