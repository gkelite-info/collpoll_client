"use client";

import { useEffect, useState } from "react";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
<<<<<<< Updated upstream
import { fetchFacultyTasks, saveFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import toast from "react-hot-toast";
=======
import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
import TaskModal from "@/app/components/modals/taskModal";
import type { Task } from "@/app/utils/taskPanel";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";

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
  other:"/others.png",
};

// ✅ role formatter
const formatRole = (role: string) =>
  role?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
>>>>>>> Stashed changes

export default function FacultyDashRight() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const { facultyId, subjectIds, loading: facultyLoading } = useFaculty();
  const collegeSubjectId = subjectIds?.[0] ?? null;


=======
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { facultyId, subjectIds, collegeId, userId, role, loading: facultyLoading } = useFaculty();

  const collegeSubjectId = subjectIds?.[0] ?? null;

  // ✅ ANNOUNCEMENTS STATE
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("my");

  // ================= TASKS =================
>>>>>>> Stashed changes
  const loadTasks = async () => {
    if (!collegeSubjectId) return;

    try {
      const data = await fetchFacultyTasks(collegeSubjectId);

      setTasks(
        data.map((t: any) => ({
          facultyTaskId: t.facultyTaskId,
          title: t.taskTitle,
          description: t.description,
          time: t.time,
          date: t.date,
        }))
      );
<<<<<<< Updated upstream
      console.log("sorry data", data);

=======
>>>>>>> Stashed changes
    } catch (err) {
      console.error("LOAD TASK ERROR", err);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< Updated upstream

  useEffect(() => {
=======
  // ================= ANNOUNCEMENTS =================
  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;
>>>>>>> Stashed changes

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      const formatted = res.data.map((item: any) => ({
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
      }));

      setAnnouncements(formatted);
    } catch (err) {
      console.error("Fetch announcements error:", err);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    if (!facultyLoading && collegeSubjectId) {
      loadTasks();
    }
  }, [facultyLoading, collegeSubjectId]);

<<<<<<< Updated upstream
  const handleSave = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number
  ) => {
    try {
      const res = await saveFacultyTask(
        {
          facultyTaskId: taskId,
          collegeSubjectId: collegeSubjectId!,
          taskTitle: payload.title,
          description: payload.description,
          date: payload.dueDate,
          time: payload.dueTime,
        },
        facultyId!
      );

      if (!res.success) {
        throw new Error("Save failed");
      }

      await loadTasks();
    } catch (error) {
      console.error("HANDLE SAVE ERROR:", error);
      toast.error("Failed to save task");
      throw error;
    }
  };

  const card = [
    {
      image: "/clip.png",
      imgHeight: "h-10",
      title: "Submit internal marks for all subjects before 25 Oct 2025.",
      professor: "By Justin Orom",
      time: "Just now",
      cardBg: "#E8F8EF",
      imageBg: "#D3F1E0",
    },
    {
      image: "/class.png",
      imgHeight: "h-10",
      title: "Upload your mini project abstracts by 12 Nov 2025.",
      professor: "By John",
      time: "12 mins ago.",
      cardBg: "#EEEDFF",
      imageBg: "#E3E1FF",
    },
  ];
=======
  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);
>>>>>>> Stashed changes

  // ================= UI =================
  return (
    <div className="w-[32%] p-2 flex flex-col">
      <CourseScheduleCard />
      <WorkWeekCalendar />

      <TaskPanel
        role="faculty"
        facultyTasks={loading ? [] : tasks}
        loading={loading}
        collegeSubjectId={collegeSubjectId ?? undefined}
        facultyId={facultyId ?? undefined}
        onAddTask={() => { }}
        onSaveTask={handleSave}
        onDeleteTask={async () => {
          await loadTasks();
        }}
      />

<<<<<<< Updated upstream
      <AnnouncementsCard announceCard={card} />
=======
      {openModal && (
        <TaskModal
          open={openModal}
          role="faculty"
          collegeSubjectId={collegeSubjectId!}
          facultyId={facultyId!}
          onClose={() => {
            setOpenModal(false);
            setEditingTask(null);
          }}
          defaultValues={editingTask}
          onSave={() => {
            loadTasks();
            setOpenModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* ✅ DYNAMIC ANNOUNCEMENTS */}
      <AnnouncementsCard
        announceCard={announcements}
        height="80vh"
        onViewChange={(v) => setView(v)}
        refreshAnnouncements={fetchAnnouncements}
      />
>>>>>>> Stashed changes
    </div>
  );
}