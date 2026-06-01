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

  const openRequestLeave = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "request-leave");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeRequestLeave = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <main className="flex min-h-screen w-full items-stretch justify-between overflow-hidden bg-[#F4F4F4] pb-5">
      <section className="flex min-h-0 w-full flex-col p-2 md:w-[68%]">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-[#43C17A] md:text-2xl">
              My Leave Request
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              Submit leave applications and view approval updates from HR.
            </p>
          </div>
          <button
            type="button"
            onClick={openRequestLeave}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#16284F] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#102040]"
          >
            Request Leave
          </button>
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
