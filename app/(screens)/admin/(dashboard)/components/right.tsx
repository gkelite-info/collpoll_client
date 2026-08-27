"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { Plus } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import AddUserModal from "./modal/addUserModal";
import { useSearchParams } from "next/navigation";
import AddAutomationModal from "./modal/addAutomationModal";
import AddPolicyModal from "./modal/addPolicyModal";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import BulkUploadModal from "./modal/bulkUploadModal/Bulkuploadmodal";

const typeIcons: Record<string, string> = {
  class: "/class.png",
  exam: "/exam.png",
  meeting: "/meeting.png",
  holiday: "/calendar-3d.png",
  event: "/event.png",
  notice: "/clip.png",
  result: "/result.jpg",
  timetable: "/timetable.png",
  placement: "/placement.png",
  emergency: "/emergency.png",
  finance: "/finance.jpg",
  other: "/others.png",
};

const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());


export default function AdminDashRight() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddAutomationModalOpen, setIsAddAutomationModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
  const { collegeId, userId, role } = useUser();
  const [view, setView] = useState<"my" | "others">("others");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isAutomationsPage = searchParams.get("view") === "automations";
  const isPolicyPage = searchParams.get("view") === "policy-setup";

  const NavyActionButton = ({
    onClick,
    label,
  }: {
    onClick: () => void;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 bg-[#16284F] h-full hover:bg-[#1a3161] text-white p-2 rounded-lg transition-all shadow-md active:scale-95 group w-full justify-center"
    >
      <div className="flex items-center justify-center aspect-square bg-white text-[#16284F] h-7 w-7 rounded-full shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
        <Plus size={18} weight="bold" />
      </div>
      <span className="text-sm text-wrap">{label}</span>
    </button>
  );

  return (
    <>
      <div className="bg-yellow-00 md:[35%] lg:w-[32%] p-2 lg:p-2 lg:pr-0 hidden landscape:hidden md:flex landscape:md:flex md:flex-col lg:flex lg:flex-col">
        <div className="grid grid-cols-2 gap-4 w-full items-center">
          {isAutomationsPage ? (
            <NavyActionButton
              onClick={() => setIsAddAutomationModalOpen(true)}
              label="Add Automation"
            />
          ) : isPolicyPage ? (
            <NavyActionButton
              onClick={() => setIsAddPolicyModalOpen(true)}
              label="Add Policy"
            />
          ) : (
            <>
              <span
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-[#3EAD6F] font-medium cursor-pointer rounded-lg h-[54px] flex items-center justify-around text-[#EFEFEF] px-4"
              >
                <Plus className="h-10 w-10 md:h-6 md:w-6 lg:h-5 lg:w-5" />
                <p className="text-sm md:text-base lg:text-lg">Add User</p>
              </span>
              <NavyActionButton
                onClick={() => setIsBulkUploadModalOpen(true)}
                label="Bulk Insert"
              />
            </>
          )}
          {/* <CourseScheduleCard isVisibile={false} fullWidth={true} /> */}
        </div>

        <WorkWeekCalendar
          activeDate={selectedDate ? new Date(selectedDate) : undefined}
          onDateSelect={(d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            setSelectedDate(`${year}-${month}-${day}`);
          }}
        />
        <AnnouncementsCard
          height="80vh"
          currentView={view}
          onViewChange={(v) => setView(v)}
          enableInfiniteScroll={true}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
      />

      <AddAutomationModal
        isOpen={isAddAutomationModalOpen}
        onClose={() => setIsAddAutomationModalOpen(false)}
      />

      <AddPolicyModal
        isOpen={isAddPolicyModalOpen}
        onClose={() => setIsAddPolicyModalOpen(false)}
      />
    </>
  );
}
