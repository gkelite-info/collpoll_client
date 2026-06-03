"use client";

import { useCallback, useEffect, useState } from "react";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { createEmployeeLeaveRequest } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestAPI";
import { LEAVE_PANEL_HEIGHT } from "./data";
import RequestLeaveModal from "@/app/(screens)/wellbeing-manager/leaveRequests/modal/RequestLeaveModal";
import toast from "react-hot-toast";
import { EmployeeLeaveTagSelection } from "@/lib/helpers/employeeLeaveRequests/employeeLeaveRequestTagsAPI";

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

type AnnouncementRow = {
  collegeAnnouncementId?: number;
  title: string;
  date?: string;
  createdAt?: string;
  type: string;
  targetRoles?: string[];
  createdByRole: string;
};

type AnnouncementCard = {
  collegeAnnouncementId?: number;
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  date?: string;
  createdAt?: string;
  cardBg: string;
  imageBg: string;
  type?: string;
  targetRoles?: string[];
};

type LeaveRequestsRightProps = {
  activeDate: Date;
  onDateSelect: (date: Date) => void;
};

type LeaveRequestFormData = {
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
  tags: EmployeeLeaveTagSelection[];
};

export default function LeaveRequestsRight({
  activeDate,
  onDateSelect,
}: LeaveRequestsRightProps) {
  const { collegeId } = useCollegeHr();
  const { userId, role } = useUser();
  const [announcements, setAnnouncements] = useState<AnnouncementCard[]>([]);
  const [view, setView] = useState<"my" | "others">("others");
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    if (!collegeId || !userId || !role) return;

    try {
      setIsLoading(true);
      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      setAnnouncements(
        (res.data as AnnouncementRow[]).map((item) => ({
          collegeAnnouncementId: item.collegeAnnouncementId,
          title: item.title,
          date: item.date,
          createdAt: item.createdAt,
          type: item.type,
          targetRoles: item.targetRoles,
          image: typeIcons[item.type] || "/clip.png",
          imgHeight: "h-10",
          cardBg: "#E8F8EF",
          imageBg: "#D3F1E0",
          professor:
            view === "my"
              ? `For ${item.targetRoles?.map(formatRole).join(", ")}`
              : `By ${formatRole(item.createdByRole)}`,
        })),
      );
    } catch (error) {
      console.error("HR leave announcements error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, role, userId, view]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleRequestLeave = async (formData: LeaveRequestFormData) => {
    if (!userId || !collegeId) {
      toast.error("HR session not found. Please re-login.");
      return;
    }

    try {
      await createEmployeeLeaveRequest({
        userId,
        collegeId,
        role: "CollegeHr",
        leaveType: formData.leaveType,
        leaveFromDate: formData.startDate,
        leaveToDate: formData.endDate,
        description: formData.description.trim(),
        tags: formData.tags,
      });
      toast.success("Leave request submitted successfully!");
      window.dispatchEvent(new Event("employee-leave-request-created"));
      setIsRequestLeaveOpen(false);
    } catch (error) {
      console.error("HR leave request submission error:", error);
      throw error;
    }
  };

  return (
    <aside className="flex w-[32%] flex-col gap-3 h-fit">
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <button
          onClick={() => setIsRequestLeaveOpen(true)}
          className="h-[54px] cursor-pointer rounded-lg bg-[#16284F] px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#20365F]"
        >
          Request Leave
        </button>

        <CourseScheduleCard isVisibile={false} fullWidth />
      </div>

      <WorkWeekCalendar
        activeDate={activeDate}
        onDateSelect={onDateSelect}
      />
      <div className="min-h-0" style={{ height: LEAVE_PANEL_HEIGHT }}>
        <AnnouncementsCard
          announceCard={announcements}
          height="100%"
          currentView={view}
          isLoading={isLoading}
          onViewChange={(value) => setView(value)}
          refreshAnnouncements={fetchAnnouncements}
        />
      </div>

      <RequestLeaveModal
        isOpen={isRequestLeaveOpen}
        onClose={() => setIsRequestLeaveOpen(false)}
        onSubmit={handleRequestLeave}
      />
    </aside>
  );
}
