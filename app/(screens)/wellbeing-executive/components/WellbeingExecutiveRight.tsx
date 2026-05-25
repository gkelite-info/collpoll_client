"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Plus, X } from "@phosphor-icons/react";
import { useEffect } from "react";
import { wellbeingAnnouncements } from "../(dashboard)/data";

type WellbeingExecutiveRightProps = {
  button?: boolean;
  headerActionLabel?: string;
  onHeaderActionClick?: () => void;
  showCalendar?: boolean;
  children?: React.ReactNode;
  isMobileDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  hideDefaultMobileContent?: boolean;
  bounded?: boolean;
};

function AlertIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF1F1F] text-[15px] font-bold text-white">
      !
    </span>
  );
}

export default function WellbeingExecutiveRight({
  button = false,
  headerActionLabel = "Add Executive",
  onHeaderActionClick,
  showCalendar = true,
  children,
  isMobileDrawerOpen = false,
  onCloseDrawer,
  hideDefaultMobileContent = false,
  bounded = false,
}: WellbeingExecutiveRightProps) {
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileDrawerOpen]);

  const HeaderAction = button ? (
    <button
      onClick={onHeaderActionClick}
      className="group flex h-[54px] w-[95%] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#43C17A] py-2 text-sm font-bold text-white shadow-[0_2px_10px_rgba(67,193,122,0.25)] transition-all hover:bg-[#34A362] active:scale-95"
    >
      <span className="flex items-center justify-center rounded-full border-2 border-[#EFEFEF] p-[2px] text-[#EFEFEF] transition-transform duration-300 group-hover:rotate-90">
        <Plus size={12} weight="bold" />
      </span>
      {headerActionLabel}
    </button>
  ) : (
    <button className="flex h-[54px] items-center justify-center gap-2 rounded-lg bg-[#FFE8E8] text-sm font-bold text-[#FF1F1F] shadow-sm">
      <AlertIcon />
      ALERTS
    </button>
  );

  const SidebarContent = (
    <div className="flex min-h-full flex-col">
      <div className="grid w-full shrink-0 grid-cols-2 items-center justify-center gap-3">
        {HeaderAction}
        <CourseScheduleCard isVisibile={false} fullWidth />
      </div>

      {showCalendar ? (
        <div className="shrink-0">
          <WorkWeekCalendar />
        </div>
      ) : null}

      <div
        className={`flex shrink-0 flex-col gap-4 ${
          children ? "mb-6 mt-3" : ""
        }`}
      >
        {children}
      </div>

      <div className={bounded ? "min-h-[360px] shrink-0" : "min-h-[360px] flex-1"}>
        <AnnouncementsCard
          announceCard={wellbeingAnnouncements}
          height={bounded ? "360px" : "100%"}
          readOnly
        />
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden w-[32%] shrink-0 flex-col pb-2 pl-2 pr-0 pt-0 md:flex lg:w-[32%] ${
          bounded
            ? "-mt-3 h-full min-h-0 overflow-y-auto custom-scrollbar"
            : "min-h-screen"
        }`}
      >
        {SidebarContent}
      </aside>

      {isMobileDrawerOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseDrawer}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-[100vh] w-[85%] transform flex-col overflow-y-auto bg-[#F8F9FB] p-6 shadow-[-4px_0_24px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:w-[400px] lg:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#16284F]">
            {hideDefaultMobileContent ? "Executives" : "Sidebar"}
          </h2>
          <button
            onClick={onCloseDrawer}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:border-red-200 hover:text-red-500"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6">
          {hideDefaultMobileContent ? children : SidebarContent}
        </div>
      </aside>
    </>
  );
}
