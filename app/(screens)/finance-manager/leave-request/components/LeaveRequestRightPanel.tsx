"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { financeAnnouncements } from "../../(dashboard)/components/data";

export default function LeaveRequestRightPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isApprovedView = searchParams.get("status") === "approved";

  const openRequestModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "request-leave");
    router.push(`${pathname}?${params.toString()}`);
  };

  //  ${isApprovedView
  //           ? "grid-cols-[0.9fr_1.15fr_1fr]"
  //           : "grid-cols-[1fr_1fr]"
  //         } 

  return (
    <aside className="hidden min-h-0 w-[32%] flex-col p-2 pr-0 md:flex">
      <div
        className={`grid self-end bg-red-00 gap-2 grid-cols-2`}
      >
        <button
          onClick={openRequestModal}
          className="h-[54px] whitespace-nowrap cursor-pointer rounded-sm bg-[#16284F] px-3 text-sm font-semibold text-white shadow-md hover:bg-[#20365F]"
        >
          Request Leave
        </button>
        <div className="w-[160px] bg-red-00">
          <CourseScheduleCard isVisibile={false} fullWidth={true}/>
        </div>
      </div>

      <WorkWeekCalendar style="mt-3 max-w-full" />

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnnouncementsCard
          announceCard={financeAnnouncements}
          height="80vh"
          currentView="others"
          readOnly
        />
      </div>
    </aside>
  );
}
