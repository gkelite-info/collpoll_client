"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LeaveRequestRightPanel from "./components/LeaveRequestRightPanel";
import LeaveRequestsTable from "./components/LeaveRequestsTable";
import LeaveSummaryCards from "./components/LeaveSummaryCards";
import RequestLeaveModal from "./components/RequestLeaveModal";

function LeaveRequestContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRequestLeaveOpen = searchParams.get("modal") === "request-leave";

  const closeRequestLeave = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-3 md:w-[68%] lg:p-4">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#282828]">
            My Leave Request
          </h1>
          <p className="mt-2 text-sm text-[#282828]">
            Submit and Manage Leave Requests Effortlessly
          </p>
        </div>

        <LeaveSummaryCards />
        <LeaveRequestsTable />
      </section>

      <LeaveRequestRightPanel />
      <RequestLeaveModal
        open={isRequestLeaveOpen}
        onClose={closeRequestLeave}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LeaveRequestContent />
    </Suspense>
  );
}
