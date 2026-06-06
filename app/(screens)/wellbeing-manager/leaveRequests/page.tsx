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
  const activeView = searchParams.get("view") === "tagged" ? "tagged" : "my";

  const setActiveView = (view: "my" | "tagged") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "tagged") {
      params.set("view", "tagged");
    } else {
      params.delete("view");
    }
    params.delete("status");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

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
            <h1 className="flex flex-wrap items-center gap-2 text-[15px] font-bold lg:text-[17px]">
              <button
                type="button"
                onClick={() => setActiveView("my")}
                className={`cursor-pointer ${
                  activeView === "my" ? "text-[#43C17A]" : "text-[#282828]"
                }`}
              >
                My Leave Request
              </button>
              <span className="text-[#282828]">/</span>
              <button
                type="button"
                onClick={() => setActiveView("tagged")}
                className={`cursor-pointer ${
                  activeView === "tagged" ? "text-[#43C17A]" : "text-[#282828]"
                }`}
              >
                Tagged Leave Requests
              </button>
            </h1>
            <p className="text-sm font-medium text-[#525252]">
              {activeView === "tagged"
                ? "Review leave requests where you are tagged and join the group chat."
                : "Submit leave applications and view approval updates from HR."}
            </p>
          </div>
          {activeView === "my" && (
            <button
              type="button"
              onClick={openRequestLeave}
              className="cursor-pointer whitespace-nowrap rounded-lg bg-[#16284F] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#102040]"
            >
              Request Leave
            </button>
          )}
        </div>

        <LeaveSummaryCards view={activeView} />
        <LeaveRequestsTable view={activeView} />
      </section>

      <LeaveRequestRightPanel />
      <RequestLeaveModal
        open={isRequestLeaveOpen}
        onClose={closeRequestLeave}
      />
    </main>
  );
}

export default function WellbeingManagerLeaveRequestsPage() {
  return (
    <Suspense>
      <LeaveRequestContent />
    </Suspense>
  );
}
