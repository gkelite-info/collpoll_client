"use client";

import { CaretDown, Plus, X } from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UpcomingLesson } from "@/lib/helpers/faculty/attendance/getClasses";
import { handleMissionClassStatus } from "@/lib/helpers/faculty/attendance/attendanceActions";
import { ClassActionModal } from "../(dashboard)/components/ClassActionModal";
import { useUser } from "@/app/utils/context/UserContext";
import {
  LessonShimmer,
  UpcomingClassesSkeleton,
} from "../(dashboard)/components/shimmer/UpcomingClassesSkeleton";

interface UpcomingClassesProps {
  lessons: UpcomingLesson[];
  onAddLesson: (newLesson: Omit<UpcomingLesson, "id">) => void;
  facultyId: number;
  className?: string;
  loading?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}
const AddLessonModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave({
      title: data.lessonTitle,
      description: data.objective,
      time: data.time,
      section: data.classSection,
    });
    onClose();
  };
  return (
    <div className="fixed text-black inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
      <div className="bg-white rounded-md shadow-lg w-full max-w-[520px] max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-sm font-semibold text-gray-800">Add Lesson</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 space-y-3 overflow-y-auto text-sm"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Lesson Title
            </label>
            <input
              name="lessonTitle"
              required
              className="w-full h-8 px-2 border rounded text-xs outline-none focus:border-indigo-500"
              placeholder="Intro to Stacks"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Sequence
            </label>
            <input
              name="sequence"
              className="w-full h-8 px-2 border rounded text-xs outline-none"
              placeholder="Lesson 13"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Objective
            </label>
            <input
              name="objective"
              required
              className="w-full h-8 px-2 border rounded text-xs outline-none"
              placeholder="Understand stack operations"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Date & Time
            </label>
            <div className="flex gap-2">
              <input
                name="date"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                placeholder="Date"
                className="w-full h-8 px-2 border rounded text-xs outline-none"
              />
              <input
                name="time"
                placeholder="10:00 AM"
                className="w-full h-8 px-2 border rounded text-xs outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Class / Section
            </label>
            <div className="relative">
              <select
                name="classSection"
                defaultValue=""
                className="w-full h-8 px-2 pr-8 border rounded text-xs text-gray-600 appearance-none outline-none"
              >
                <option value="" disabled>
                  Select
                </option>
                <option>B.Tech CSE – Year 1</option>
                <option>B.Tech CSE – Year 2</option>
                <option>B.Tech CSE – Year 3</option>
              </select>
              <CaretDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-8 border text-xs rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: UpcomingLesson | null;
  onAccept: (id: string) => void;
  onCancelClass: (id: string, reason: string) => void;
}

const LessonCard: React.FC<{ lesson: UpcomingLesson }> = ({ lesson }) => (
  <div
    className={`relative flex rounded-r-md rounded-l overflow-hidden min-h-[100px] shrink-0 group hover:shadow-sm transition-all ${lesson.sessionStatus === "Cancel" ? "bg-red-50/50" : "bg-[#eff2f7]"}`}
  >
    <div
      className={`w-1.5 absolute left-0 top-0 bottom-0 rounded-l-sm ${lesson.sessionStatus === "Cancel" ? "bg-red-400" : lesson.sessionStatus === "Accepted" ? "bg-emerald-400" : "bg-[#1e2952]"}`}
    />
    <div className="flex-1 py-3 px-4 ml-2 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[#1e2952] font-bold text-[15px] leading-tight">
            {lesson.title}
          </h3>
          {lesson.sessionStatus === "Accepted" && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
              Accepted
            </span>
          )}
          {lesson.sessionStatus === "Cancel" && (
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
              Cancelled
            </span>
          )}
        </div>
        <h3 className="text-[#1e2952] font-bold text-xs leading-tight mt-1">
          {[
            [lesson.degree && !lesson.degree.includes("Unknown Branch") ? lesson.degree : "", lesson.department.filter((d) => d.name && !d.name.includes("Unknown Branch")).map((item) => item.name).join(", ")].filter(Boolean).join(" "),
            lesson.year ? `Year ${lesson.year}` : "",
            lesson.section ? `Section ${lesson.section}` : ""
          ].filter(Boolean).join(" - ")}
        </h3>
        <p className="text-gray-600 text-[13px] mt-1 leading-snug line-clamp-2">
          {lesson.description}
        </p>
      </div>
      <div className="flex justify-end mt-2">
        <span className="text-emerald-500 text-xs font-medium">
          {lesson.fromTime}
        </span>
      </div>
    </div>
  </div>
);

export default function UpcomingClasses({
  lessons,
  onAddLesson,
  facultyId,
  className,
  loading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: UpcomingClassesProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<UpcomingLesson | null>(
    null,
  );
  const { collegeId } = useUser();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [localLessons, setLocalLessons] = useState<UpcomingLesson[]>(lessons);

  useEffect(() => {
    setLocalLessons(
      Array.from(new Map(lessons.map((l) => [l.id, l])).values()),
    );
  }, [lessons]);

  useEffect(() => {
    if (!scrollRef.current || !hasNextPage || isFetchingNextPage || loading) return;
    
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight <= clientHeight + 5 && fetchNextPage) {
          fetchNextPage();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [localLessons, hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

  const handleLessonClick = (lesson: UpcomingLesson) => {
    setSelectedLesson(lesson);
    setIsActionModalOpen(true);
  };

  const handleAddUpcomingClass = () => {
    router.push("/faculty/calendar");
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 10;
    if (bottom && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  };

  const handleAcceptClass = async (id: string) => {
    if (!facultyId || !collegeId) {
      toast.error("Session missing data");
      return false;
    }
    const res = await handleMissionClassStatus(
      id,
      Number(facultyId),
      "Accepted",
      undefined,
      collegeId
    );
    if (res.success) {
      toast.success("Class Accepted! Redirecting...");
      setLocalLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, sessionStatus: "Accepted" } : l)),
      );
      queryClient.setQueriesData({ queryKey: ["upcomingClasses"] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((l) => (l.id === id ? { ...l, sessionStatus: "Accepted" } : l)),
          ),
        };
      });
      // Delay invalidation to allow DB to sync and avoid overwriting optimistic update with stale data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
      }, 1000);
      const acceptedLesson = localLessons.find((l) => l.id === id);
      const dateParam = acceptedLesson?.rawDate ? `&date=${acceptedLesson.rawDate}` : "";
      router.push(`/faculty/attendance?classId=${id}${dateParam}`);
      return true;
    } else {
      toast.error("Failed to accept class");
      return false;
    }
  };

  const handleCancelClass = async (id: string, reason: string) => {
    if (!facultyId || !collegeId) return toast.error("Faculty ID or College ID missing");
    const res = await handleMissionClassStatus(id, facultyId, "Cancel", reason, collegeId);
    if (res.success) {
      toast.success("Class Cancelled");
      setLocalLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, sessionStatus: "Cancel" } : l)),
      );
      queryClient.setQueriesData({ queryKey: ["upcomingClasses"] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((l: any) => (l.id === id ? { ...l, sessionStatus: "Cancel" } : l))
          ),
        };
      });
      setIsActionModalOpen(false);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["upcomingClasses"] });
        queryClient.invalidateQueries({ queryKey: ["facultyDashboardStats"] });
      }, 1000);
    } else {
      toast.error("Failed to cancel class");
    }
  };

  return (
    <>
      <div
        className={`bg-white p-5 w-full h-full font-sans flex flex-col min-h-0 ${className || ""}`}
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Classes</h2>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-[#ebeef5] flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700">
              <Plus
                weight="bold"
                size={18}
                className="cursor-pointer"
                onClick={handleAddUpcomingClass}
              />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0"
          onScroll={handleScroll}
        >
          {loading && localLessons.length === 0 ? (
            <UpcomingClassesSkeleton />
          ) : (
            <>
              {localLessons.map((lesson, index) => (
                <div
                  key={`${lesson.id}-${lesson.fromTime}-${lesson.toTime}-${index}`}
                  onClick={() => handleLessonClick(lesson)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg lesson-card-wrapper"
                  data-lesson-id={lesson.id}
                >
                  <LessonCard lesson={lesson} />
                </div>
              ))}
              {localLessons.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  No upcoming classes scheduled.
                </div>
              )}
              {isFetchingNextPage && (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <LessonShimmer key={`shimmer-${i}`} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <AddLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddLesson}
      />

      <ClassActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        lesson={selectedLesson}
        onAccept={handleAcceptClass}
        onCancelClass={handleCancelClass}
      />
    </>
  );
}
