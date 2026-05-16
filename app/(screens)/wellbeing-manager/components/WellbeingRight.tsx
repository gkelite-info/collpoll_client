// "use client";
// import AnnouncementsCard from "@/app/utils/announcementsCard";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { Plus } from "@phosphor-icons/react";
// import { useEffect, useState } from "react";

// type WellbeingRightProps = {
//   button?: boolean
//   headerActionLabel?: string;
//   onHeaderActionClick?: () => void;
//   showCalendar?: boolean;
//   children?: React.ReactNode;
//   isMobileDrawerOpen?: boolean;
//   onCloseDrawer?: () => void;
// };

// export default function WellbeingRight({
//   button = false,
//   headerActionLabel = "Add Executive",
//   onHeaderActionClick,
//   showCalendar = true,
//   children,
//   isMobileDrawerOpen = false,
//   onCloseDrawer,
// }: WellbeingRightProps) {
//   const [view, setView] = useState<"my" | "others">("my");

//   useEffect(() => {
//     if (isMobileDrawerOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [isMobileDrawerOpen]);

//   const staticAnnouncements = [
//     {
//       collegeAnnouncementId: 1,
//       title: "Submit internal marks for all subjects before 25 Oct 2025.",
//       date: new Date().toISOString(),
//       createdAt: new Date().toISOString(),
//       type: "notice",
//       targetRoles: ["Faculty"],
//       image: "/clip.png",
//       imgHeight: "h-10",
//       cardBg: "#E8F8EF",
//       imageBg: "#D3F1E0",
//       professor: "By Stephen jones • Just now",
//     },
//     {
//       collegeAnnouncementId: 2,
//       title: "Upload final project abstracts by 1 Dec 2025.",
//       date: new Date().toISOString(),
//       createdAt: new Date().toISOString(),
//       type: "other",
//       targetRoles: ["Student"],
//       image: "/others.png",
//       imgHeight: "h-10",
//       cardBg: "#E6EDFA",
//       imageBg: "#D4E1FA",
//       professor: "By Stephen jones • 12:40 PM",
//     },
//     {
//       collegeAnnouncementId: 3,
//       title: "Mid-semester exams scheduled from 5—10 Dec 2025",
//       date: new Date().toISOString(),
//       createdAt: new Date().toISOString(),
//       type: "exam",
//       targetRoles: ["Student"],
//       image: "/exam.png",
//       imgHeight: "h-10",
//       cardBg: "#FFF1E6",
//       imageBg: "#FADFCA",
//       professor: "By Stephen jones • 12:40 PM",
//     },
//     {
//       collegeAnnouncementId: 4,
//       title: "College will remain closed on 26 Jan 2026 (Republic Day).",
//       date: new Date().toISOString(),
//       createdAt: new Date().toISOString(),
//       type: "event",
//       targetRoles: ["All"],
//       image: "/event.png",
//       imgHeight: "h-10",
//       cardBg: "#F0E6FF",
//       imageBg: "#E3D3FA",
//       professor: "By Stephen jones • 12:40 PM",
//     },
//   ];

//   const SidebarContent = (
//     <>
//       <div className="grid grid-cols-2 gap-4 w-full items-center justify-center shrink-0">
//         {button ? (
//           <button 
//             onClick={onHeaderActionClick}
//             className="flex w-full items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white py-3 rounded-[12px] text-[15px] font-bold transition-all shadow-[0_2px_10px_rgba(67,193,122,0.25)] active:scale-95 group"
//           >
//             <div className="flex items-center justify-center border-2 border-white rounded-full p-[2px] group-hover:rotate-90 transition-transform duration-300">
//               <Plus size={14} weight="bold" />
//             </div>
//             {headerActionLabel}
//           </button>
//         ) : (
//           <div />
//         )}
//         <CourseScheduleCard isVisibile={false} fullWidth={true} />
//       </div>

//       {showCalendar && <div className="shrink-0"><WorkWeekCalendar /></div>}

//       <div className="flex flex-col gap-4 shrink-0">
//          {children}
//       </div>

//       <div className="flex-1 min-h-0 shrink-0">
//         <AnnouncementsCard
//           announceCard={staticAnnouncements}
//           height="50vh"
//           onViewChange={(v) => setView(v)}
//           refreshAnnouncements={async () => { }}
//         />
//       </div>
//     </>
//   );

//   return (
//     <div className="hidden lg:flex bg-yellow-00 w-full md:w-[35%] lg:w-[32%] p-2 lg:p-2 lg:pr-0 flex-col gap-4">
//       <div className="grid grid-cols-2 gap-4 w-full items-center justify-center">
//         {button ? (
//           <button className="flex w-full items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white py-2 rounded-full text-[15px] font-bold transition-all shadow-[0_2px_10px_rgba(67,193,122,0.25)] active:scale-95 group shrink-0">
//             <div className="flex items-center justify-center border-2 border-white rounded-full p-[2px] group-hover:rotate-90 transition-transform duration-300">
//               <Plus size={14} weight="bold" />
//             </div>
//             Add Executive
//           </button>
//         ) : (
//           <div />
//         )}
//         <CourseScheduleCard isVisibile={false} fullWidth={true} />
//       </div>

//       {showCalendar && <WorkWeekCalendar />}

//       {children}

//       <AnnouncementsCard
//         announceCard={staticAnnouncements}
//         height="80vh"
//         onViewChange={(v) => setView(v)}
//         refreshAnnouncements={async () => { }}
//       />
//     </div>
//   );
// }

"use client";

import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Plus, X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

type WellbeingRightProps = {
  button?: boolean;
  headerActionLabel?: string;
  onHeaderActionClick?: () => void;
  showCalendar?: boolean;
  children?: React.ReactNode;
  isMobileDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  hideDefaultMobileContent?: boolean; // NEW: Controls what shows in the mobile drawer
};

export default function WellbeingRight({
  button = false,
  headerActionLabel = "Add Executive",
  onHeaderActionClick,
  showCalendar = true,
  children,
  isMobileDrawerOpen = false,
  onCloseDrawer,
  hideDefaultMobileContent = false,
}: WellbeingRightProps) {
  const [view, setView] = useState<"my" | "others">("my");

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

  const staticAnnouncements = [
    {
      collegeAnnouncementId: 1,
      title: "Submit internal marks for all subjects before 25 Oct 2025.",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: "notice",
      targetRoles: ["Faculty"],
      image: "/clip.png",
      imgHeight: "h-10",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
      professor: "By Stephen jones • Just now",
    },
    {
      collegeAnnouncementId: 2,
      title: "Upload final project abstracts by 1 Dec 2025.",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: "other",
      targetRoles: ["Student"],
      image: "/others.png",
      imgHeight: "h-10",
      cardBg: "#E6EDFA",
      imageBg: "#D4E1FA",
      professor: "By Stephen jones • 12:40 PM",
    },
    {
      collegeAnnouncementId: 3,
      title: "Mid-semester exams scheduled from 5—10 Dec 2025",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: "exam",
      targetRoles: ["Student"],
      image: "/exam.png",
      imgHeight: "h-10",
      cardBg: "#FFF1E6",
      imageBg: "#FADFCA",
      professor: "By Stephen jones • 12:40 PM",
    },
  ];

  const SidebarContent = (
    <>
      <div className="grid grid-cols-2 gap-4 w-full items-center justify-center shrink-0">
        {button ? (
          <button 
            onClick={onHeaderActionClick}
            className="flex w-full items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white py-3 rounded-[12px] text-[15px] font-bold transition-all shadow-[0_2px_10px_rgba(67,193,122,0.25)] active:scale-95 group"
          >
            <div className="flex items-center justify-center border-2 border-white rounded-full p-[2px] group-hover:rotate-90 transition-transform duration-300">
              <Plus size={14} weight="bold" />
            </div>
            {headerActionLabel}
          </button>
        ) : (
          <div />
        )}
        <CourseScheduleCard isVisibile={false} fullWidth={true} />
      </div>

      {showCalendar && <div className="shrink-0"><WorkWeekCalendar /></div>}

      <div className="flex flex-col gap-4 shrink-0">
         {children}
      </div>

      <div className="flex-1 min-h-0 shrink-0">
        <AnnouncementsCard
          announceCard={staticAnnouncements}
          height="50vh"
          onViewChange={(v) => setView(v)}
          refreshAnnouncements={async () => { }}
        />
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP VIEW */}
      <aside className="hidden lg:flex lg:h-full w-[32%] lg:py-5 lg:pl-2 flex-col gap-6 shrink-0 h-screen lg:overflow-y-auto custom-scrollbar">
        {SidebarContent}
      </aside>

      {/* MOBILE/TABLET VIEW */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseDrawer}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-[100vh] w-[85%] sm:w-[400px] bg-[#F8F9FB] shadow-[-4px_0_24px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col p-6 overflow-y-auto ${
          isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-[20px] font-bold text-[#16284F]">
            {hideDefaultMobileContent ? "Executives" : "Sidebar"}
          </h2>
          <button 
            onClick={onCloseDrawer}
            className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        
        <div className="flex flex-col gap-6 flex-1 min-h-0">
           {/* Render ONLY children (executives) if hideDefaultMobileContent is true */}
           {hideDefaultMobileContent ? children : SidebarContent}
        </div>
      </aside>
    </>
  );
}