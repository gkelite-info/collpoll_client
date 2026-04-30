// "use client";
// import AnnouncementsCard from "@/app/utils/announcementsCard";
// import { useStudent } from "@/app/utils/context/student/useStudent";
// import { useUser } from "@/app/utils/context/UserContext";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
// import TaskPanel from "@/app/utils/taskPanel";
// import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
// import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
// import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
// import { fetchStudentTasks, saveStudentTask } from "@/lib/helpers/student/studentTaskAPI";
// import { useEffect, useState } from "react";

//  const typeIcons: Record<string, string> = {
//   class: "/class.png",
//   exam: "/exam.png",
//   meeting: "/meeting.png",
//   holiday: "/calendar-3d.png",
//   event: "/event.png",
//   notice: "/clip.png",
//   result: "/result.jpg",
//   timetable: "/timetable.png",
//   placement: "/placement.png",
//   emergency: "/emergency.png",
//   finance: "/finance.jpg",
//   other:"/others.png",
// };

// export default function StuDashRight() {

//   const [studentTasks, setStudentTasks] = useState<any[]>([]);
//   const [facultyTasks, setFacultyTasks] = useState<any[]>([]);
//   // const [collegeId, setCollegeId] = useState<number | null>(null);
//   const { subjects, studentId } = useStudent();
//   const [loading, setLoading] = useState(true);
//   const [announcements, setAnnouncements] = useState<any[]>([]);
//   const [view, setView] = useState<"my" | "others">("others");
//   const { collegeId, userId, role } = useUser();

//   // useEffect(() => {
//   //   async function fetchStudentId() {
//   //     const {
//   //       data: { user },
//   //       error,
//   //     } = await supabase.auth.getUser();

//   //     if (error || !user) {
//   //       console.error("Auth error", error);
//   //       return;
//   //     }

//   //     const { data, error: userErr } = await supabase
//   //       .from("users")
//   //       .select("userId, collegeId")
//   //       .eq("auth_id", user.id)
//   //       .single();

//   //     if (userErr) {
//   //       console.error("Failed to get studentId", userErr);
//   //       return;
//   //     }
//   //     setStudentId(data.userId);
//   //     setCollegeId(data.collegeId);

//   //   }

//   //   fetchStudentId();
//   // }, []);

//   // useEffect(() => {
//   //   if (studentId === null) return;

//   //   async function fetchStudentTasks() {
//   //     try {
//   //       const data = await getStudentTasks(studentId as number);

//   //       const formatted = data.map((task: any) => ({
//   //         facultytaskId: task.studenttaskId,
//   //         title: task.studenttaskTitle,
//   //         description: task.studenttaskDescription,
//   //         time: task.studenttaskassignedTime,
//   //         date: task.studenttaskcreateDate,
//   //       }));

//   //       setStudentTasks(formatted);
//   //     } catch (err: any) {
//   //       console.error("Add student task failed");
//   //       console.error(err?.message ?? err);
//   //     }

//   //   }

//   //   fetchStudentTasks();
//   // }, [studentId]);
//   useEffect(() => {
//     if (!studentId) return;
//     loadStudentTasks();
//   }, [studentId]);

//   const loadStudentTasks = async () => {
//     if (!studentId) return;

//     setLoading(true);

//     const data = await fetchStudentTasks(studentId);

//     const formatted = data.map((task) => ({
//       facultyTaskId: task.studentTaskId,
//       title: task.taskTitle,
//       description: task.description,
//       time: task.time,
//       date: task.date,
//     }));

//     setStudentTasks(formatted);
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (!subjects?.length) return;

//     const loadFacultyTasks = async () => {
//       setLoading(true);
//       try {
//         const allTasks: any[] = [];

//         for (const subject of subjects) {

//           const tasks = await fetchFacultyTasks(subject.collegeSubjectId);

//           if (tasks?.length) {
//             allTasks.push(
//               ...tasks.map((task: any) => ({
//                 facultyTaskId: task.facultyTaskId,
//                 title: task.taskTitle,
//                 description: task.description,
//                 time: task.time,
//                 date: task.date,
//               }))
//             );
//           }
//         }

//         setFacultyTasks(allTasks);

//       } catch (err) {
//         console.error("Load faculty tasks failed", err);
//       }
//       finally {
//         setLoading(false);
//       }

//     };

//     loadFacultyTasks();

//   }, [subjects]);

//   const handleSaveStudentTask = async (
//     payload: {
//       title: string;
//       description: string;
//       dueDate: string;
//       dueTime: string;
//     },
//     taskId?: number
//   ): Promise<void> => {
//     if (!studentId) return;
//     try {

//       const response = await saveStudentTask({
//         studentTaskId: taskId,
//         taskTitle: payload.title,
//         description: payload.description,
//         date: payload.dueDate,
//         time: payload.dueTime
//       },
//         studentId
//       );

//       if (!response.success) {
//         console.error("Save student task failed");
//         return;
//       }

//       await loadStudentTasks();

//     } catch (err) {
//       console.error("Save student task failed", err);
//     }

//   };

//   const allowedCreatorRoles = [
//     "Admin",
//     "Faculty",
//     "Finance",
//     "Placement",
//     "CollegeHr",
//   ];

//   const myTasks = [
//     {
//       facultytaskId: 1,
//       title: "Complete Python Lab",
//       description: "Finish all 10 lab programs and upload to portal.",
//       time: "12:40 PM",
//       facultytaskcreatedDate: null,
//     },
//     {
//       facultytaskId: 2,
//       title: "Group Discussion Prep",
//       description: "Research topic “Impact of AI on Education”.",
//       time: "02:40 PM",
//       facultytaskcreatedDate: null,
//     },
//     {
//       facultytaskId: 3,
//       title: "Resume Update",
//       description: "Add latest internship experience.",
//       time: "03:40 PM",
//       facultytaskcreatedDate: null,
//     },
//   ];

//   useEffect(() => {
//     if (!collegeId || !userId || !role) return;
//     fetchAnnouncements();
//   }, [collegeId, userId, role, view]);

//   const fetchAnnouncements = async () => {
//     try {
//       if (!collegeId || !userId || !role) return;

//       const res = await fetchCollegeAnnouncements({
//         collegeId,
//         userId,
//         role,
//         view,
//         page: 1,
//         limit: 20,
//       });

//       const filtered = res.data.filter((item: any) =>
//         allowedCreatorRoles.includes(item.createdByRole)
//       );

//       const formatted = filtered.map((item: any) => ({
//         collegeAnnouncementId: item.collegeAnnouncementId,
//         title: item.title,
//         date: item.date,
//         createdAt: item.createdAt,
//         type: item.type,
//         targetRoles: item.targetRoles,

//         image: typeIcons[item.type] || "/clip.png",
//         imgHeight: "h-10",
//         cardBg: "#E8F8EF",
//         imageBg: "#D3F1E0",

//         professor: `By ${item.createdByRole}`,
//       }));

//       setAnnouncements(formatted);
//     } catch (err) {
//       console.error("Student announcements error:", err);
//     }
//   };

//   return (
//     <>
//       <div className="w-[32%] p-2 flex flex-col">
//         <CourseScheduleCard />
//         <WorkWeekCalendar />
//         <TaskPanel
//           role="student"
//           loading={loading}
//           studentId={studentId ?? undefined}
//           studentTasks={studentTasks}
//           facultyTasks={facultyTasks}
//           onAddTask={() => { }}
//           onSaveTask={handleSaveStudentTask}
//           onDeleteTask={async () => {
//             await loadStudentTasks();
//           }}
//         />
//         <AnnouncementsCard
//           announceCard={announcements}
//           height="60vh"
//           onViewChange={(v) => setView(v)}
//           refreshAnnouncements={fetchAnnouncements}
//            readOnly={true}
//         />
//       </div>
//     </>
//   );
// }

"use client";
import AnnouncementsCard from "@/app/utils/announcementsCard";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { useUser } from "@/app/utils/context/UserContext";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import TaskPanel from "@/app/utils/taskPanel";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import { fetchCollegeAnnouncements } from "@/lib/helpers/announcements/announcementAPI";
import { fetchFacultyTasks } from "@/lib/helpers/faculty/facultyTasks";
import {
  fetchStudentTasks,
  saveStudentTask,
} from "@/lib/helpers/student/studentTaskAPI";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl"; // Added import

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

export default function StuDashRight() {
  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  const [facultyTasks, setFacultyTasks] = useState<any[]>([]);
  const { subjects, studentId } = useStudent();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [view, setView] = useState<"my" | "others">("others");
  const { collegeId, userId, role } = useUser();
  const t = useTranslations("Dashboard.student");

  useEffect(() => {
    if (!studentId) return;
    loadStudentTasks();
  }, [studentId]);

  const loadStudentTasks = async () => {
    if (!studentId) return;

    setLoading(true);

    const data = await fetchStudentTasks(studentId);

    const formatted = data.map((task) => ({
      facultyTaskId: task.studentTaskId,
      title: task.taskTitle,
      description: task.description,
      time: task.time,
      date: task.date,
    }));

    setStudentTasks(formatted);
    setLoading(false);
  };

  useEffect(() => {
    if (!subjects?.length) return;

    const loadFacultyTasks = async () => {
      setLoading(true);
      try {
        const allTasks: any[] = [];

        for (const subject of subjects) {
          const tasks = await fetchFacultyTasks(subject.collegeSubjectId);

          if (tasks?.length) {
            allTasks.push(
              ...tasks.map((task: any) => ({
                facultyTaskId: task.facultyTaskId,
                title: task.taskTitle,
                description: task.description,
                time: task.time,
                date: task.date,
              })),
            );
          }
        }

        setFacultyTasks(allTasks);
      } catch (err) {
        console.error("Load faculty tasks failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadFacultyTasks();
  }, [subjects]);

  const handleSaveStudentTask = async (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ): Promise<void> => {
    if (!studentId) return;
    try {
      const response = await saveStudentTask(
        {
          studentTaskId: taskId,
          taskTitle: payload.title,
          description: payload.description,
          date: payload.dueDate,
          time: payload.dueTime,
        },
        studentId,
      );

      if (!response.success) {
        console.error("Save student task failed");
        return;
      }

      await loadStudentTasks();
    } catch (err) {
      console.error("Save student task failed", err);
    }
  };

  const allowedCreatorRoles = [
    "Admin",
    "Faculty",
    "Finance",
    "Placement",
    "CollegeHr",
  ];

  const myTasks = [
    {
      facultytaskId: 1,
      title: "Complete Python Lab",
      description: "Finish all 10 lab programs and upload to portal.",
      time: "12:40 PM",
      facultytaskcreatedDate: null,
    },
    {
      facultytaskId: 2,
      title: "Group Discussion Prep",
      description: "Research topic “Impact of AI on Education”.",
      time: "02:40 PM",
      facultytaskcreatedDate: null,
    },
    {
      facultytaskId: 3,
      title: "Resume Update",
      description: "Add latest internship experience.",
      time: "03:40 PM",
      facultytaskcreatedDate: null,
    },
  ];

  useEffect(() => {
    if (!collegeId || !userId || !role) return;
    fetchAnnouncements();
  }, [collegeId, userId, role, view]);

  const fetchAnnouncements = async () => {
    try {
      if (!collegeId || !userId || !role) return;

      const res = await fetchCollegeAnnouncements({
        collegeId,
        userId,
        role,
        view,
        page: 1,
        limit: 20,
      });

      const filtered = res.data.filter((item: any) =>
        allowedCreatorRoles.includes(item.createdByRole),
      );

      const formatted = filtered.map((item: any) => ({
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

        professor: t("byRole", { role: item.createdByRole }),
      }));

      setAnnouncements(formatted);
    } catch (err) {
      console.error("Student announcements error:", err);
    }
  };

  return (
    <>
      <div className="w-[32%] p-2 flex flex-col">
        <CourseScheduleCard />
        <WorkWeekCalendar />
        <TaskPanel
          role="student"
          loading={loading}
          studentId={studentId ?? undefined}
          studentTasks={studentTasks}
          facultyTasks={facultyTasks}
          onAddTask={() => {}}
          onSaveTask={handleSaveStudentTask}
          onDeleteTask={async () => {
            await loadStudentTasks();
          }}
        />
        <AnnouncementsCard
          announceCard={announcements}
          height="60vh"
          onViewChange={(v) => setView(v)}
          refreshAnnouncements={fetchAnnouncements}
          readOnly={true}
        />
      </div>
    </>
  );
}
