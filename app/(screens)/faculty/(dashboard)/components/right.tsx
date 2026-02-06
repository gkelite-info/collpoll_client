"use client";

import { useEffect, useState } from "react";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
import { supabase } from "@/lib/supabaseClient";
import TaskModal from "@/app/components/modals/taskModal";

type Task = {
  facultytaskId: number;
  title: string;
  description: string;
  time: string;
  facultytaskcreatedDate: string | null;
};

export default function FacultyDashRight() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const auth_id = authData?.user?.id;
        if (!auth_id) return;

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("userId")
          .eq("auth_id", auth_id)
          .single();

        if (userError || !user) {
          console.error("USER FETCH ERROR", userError);
          return;
        }

        const res = await fetchFacultyTasks(user.userId);

        if (!res.success || !res.tasks) {
          setTasks([]);
          return;
        }
        setTasks(
          res.tasks.map((t: any) => ({
            facultytaskId: t.facultytaskId,
            title: t.facultytaskTitle,
            description: t.facultytaskDescription,
            time: t.facultytaskassignedTime,
            facultytaskcreatedDate: t.facultytaskcreatedDate,
          }))
        );


      } catch (err) {
        console.error("LOAD TASKS ERROR", err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

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

  return (
    <div className="w-[32%] p-2 flex flex-col">
      <CourseScheduleCard />
      <WorkWeekCalendar />

      <TaskPanel
        role="faculty"
        facultyTasks={loading ? [] : tasks}
        studentTasks={[]}
        onAddTask={() => {
          setEditingTask(null);
          setOpenModal(true);
        }}
        onEditTask={(task) => {
          setEditingTask(task);
          setOpenModal(true);
        }}
      />

      {openModal && (
        <TaskModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingTask(null);
          }}
          defaultValues={editingTask}
          onSave={() => {
            setOpenModal(false);
            setEditingTask(null);
          }}
        />
      )}

      <AnnouncementsCard announceCard={card} />
    </div>
  );
}
