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
  announcementHeight?: string;
  showHeaderCards?: boolean;
  showCourseScheduleCard?: boolean;
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
  announcementHeight = "360px",
  showHeaderCards = true,
  showCourseScheduleCard = false,
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

  const HeaderAction = (button && headerActionLabel !== "Alerts") ? (
    <button
      onClick={onHeaderActionClick}
      className="group flex h-[54px] w-[95%] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#43C17A] py-2 text-sm font-bold text-white shadow-[0_2px_10px_rgba(67,193,122,0.25)] transition-all hover:bg-[#34A362] active:scale-95"
    >
      <span className="flex items-center justify-center rounded-full border-2 border-[#EFEFEF] p-[2px] text-[#EFEFEF] transition-transform duration-300 group-hover:rotate-90">
        <Plus size={12} weight="bold" />
      </span>
      {headerActionLabel}
    </button>
  )
    : button && headerActionLabel === "Alerts" && (
      <button className="flex h-13.5 items-center justify-center gap-2 rounded-lg bg-[#FFE8E8] text-sm font-bold text-[#FF1F1F] shadow-sm">
        <AlertIcon />
        ALERTS
      </button>
    );

  const isFullWidth = button ? true : false

  const SidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      {showHeaderCards ? (
        <div className={`grid w-full shrink-0 items-end justify-end ${button ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          {HeaderAction || '  '} 
          <CourseScheduleCard isVisibile={false} fullWidth={isFullWidth} />
        </div>
      ) : showCourseScheduleCard ? (
        <div className="grid w-full shrink-0 grid-cols-2 gap-3">
          <div />
          <CourseScheduleCard isVisibile={false} fullWidth />
        </div>
      ) : null}

      {showCalendar ? (
        <div className="shrink-0">
          <WorkWeekCalendar />
        </div>
      ) : null}

      <div
        className={`flex shrink-0 flex-col gap-4 ${children
            ? `${showHeaderCards || showCalendar || showCourseScheduleCard ? "mt-3" : ""}`
            : ""
          }`}
      >
        {children}
      </div>

      <div
        className={children ? "-mt-2 shrink-0" : bounded ? "shrink-0" : "min-h-[360px] flex-1"}
        style={bounded ? { minHeight: announcementHeight } : undefined}
      >
        <AnnouncementsCard
          announceCard={wellbeingAnnouncements}
          height={bounded ? announcementHeight : "100%"}
          refreshAnnouncements={async () => {}}
          currentView="my"
        />
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden w-[32%] shrink-0 flex-col p-2 md:flex lg:w-[32%] pb-7 ${bounded
            ? "h-full min-h-0 overflow-y-auto custom-scrollbar"
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
        className={`fixed right-0 top-0 z-50 flex h-screen w-[85%] transform flex-col overflow-y-auto bg-[#F8F9FB] p-6 shadow-[-4px_0_24px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:w-[400px] lg:hidden ${isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
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

 