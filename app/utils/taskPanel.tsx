"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, CheckCircle, PencilSimple, PlusCircleIcon, Trash, XIcon } from "@phosphor-icons/react";
import TaskModal from "@/app/components/modals/taskModal";
import { deactivateFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import TaskCardShimmer from "../(screens)/faculty/shimmers/TaskCardShimmer";
import { deactivateStudentTask } from "@/lib/helpers/student/studentTaskAPI";
import ConfirmDeleteModal from "../(screens)/admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabaseClient";
import { useStudent } from "@/app/utils/context/student/useStudent";

export type Task = {
  facultyTaskId: number;
  title: string;
  description: string;
  time: string;
  date: string;
};

export type TaskPanelProps = {
  role?: "faculty" | "student";
  style?: boolean;
  loading?: boolean;
  facultyTasks?: Task[];
  studentTasks?: Task[];
  collegeSubjectId?: number;
  facultyId?: number;
  studentId?: number;
  onEditTask?: (task: Task) => void;
  onAddTask?: () => void;
  onSaveTask?: (
    payload: {
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
    },
    taskId?: number,
  ) => Promise<void>;
  onDeleteTask?: (taskId: number) => Promise<void>;
};

export default function TaskPanel({
  role = "student",
  style = false,
  facultyTasks = [],
  studentTasks = [],
  collegeSubjectId,
  facultyId,
  studentId,
  loading = false,
  onEditTask,
  onAddTask,
  onSaveTask,
  onDeleteTask,
}: TaskPanelProps) {
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<"student" | "faculty">(
    "faculty",
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("Dashboard.student");

  const studentContext = useStudent();
  const { subjects } = studentContext;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarStudentTasks, setCalendarStudentTasks] = useState<Task[]>([]);
  const [calendarFacultyTasks, setCalendarFacultyTasks] = useState<Task[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [dbFacultyTasks, setDbFacultyTasks] = useState<Task[]>([]);
  const [isDbFacultyLoading, setIsDbFacultyLoading] = useState(false);

  const fetchStudentFacultyTasks = async (dateStr: string | null) => {
    const ayId = studentContext.collegeAcademicYearId;
    const secId = studentContext.collegeSectionsId;

    if (!ayId || !secId) {
      return [];
    }

    try {
      let query = supabase
        .from("faculty_tasks")
        .select(`
          facultyTaskId,
          taskTitle,
          description,
          date,
          time,
          createdAt
        `)
        .eq("collegeAcademicYearId", ayId)
        .eq("collegeSectionsId", secId)
        .is("deletedAt", null);

      if (dateStr) {
        const { start, end } = getLocalDateRangeInUTC(dateStr);
        query = query.gte("createdAt", start).lte("createdAt", end);
      } else {
        const today = new Date().toLocaleDateString("en-CA");
        query = query.eq("date", today).eq("isActive", true);
      }

      const { data: tasksData, error: tasksError } = await query.order("time", { ascending: true });

      if (tasksError) throw tasksError;

      return (tasksData || []).map((t: any) => ({
        facultyTaskId: t.facultyTaskId,
        title: t.taskTitle,
        description: t.description,
        time: t.time,
        date: t.date || dateStr || new Date().toLocaleDateString("en-CA"),
      }));
    } catch (err) {
      console.error("Error fetching student faculty tasks:", err);
      return [];
    }
  };

  useEffect(() => {
    if (role !== "student") return;

    const loadTasks = async () => {
      setIsDbFacultyLoading(true);
      const tasks = await fetchStudentFacultyTasks(selectedDate);
      setDbFacultyTasks(tasks);
      setIsDbFacultyLoading(false);
    };

    loadTasks();
  }, [
    selectedDate,
    role,
    studentContext.collegeEducationId,
    studentContext.collegeBranchId,
    studentContext.collegeAcademicYearId,
    studentContext.collegeSemesterId,
    studentContext.collegeSectionsId,
    refreshTrigger
  ]);

  const getLocalDateRangeInUTC = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
    const end = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
    return { start, end };
  };

  useEffect(() => {
    if (!selectedDate) {
      setCalendarStudentTasks([]);
      setCalendarFacultyTasks([]);
      return;
    }

    const fetchTasksForDate = async () => {
      setIsCalendarLoading(true);
      try {
        const { start, end } = getLocalDateRangeInUTC(selectedDate);

        if (role === "faculty" && collegeSubjectId) {
          const { data, error } = await supabase
            .from("faculty_tasks")
            .select(`
              facultyTaskId,
              taskTitle,
              description,
              date,
              time,
              createdAt
            `)
            .eq("collegeSubjectId", collegeSubjectId)
            .gte("createdAt", start)
            .lte("createdAt", end)
            .is("deletedAt", null)
            .order("time", { ascending: true });

          if (error) throw error;

          const formatted = (data || []).map((t: any) => ({
            facultyTaskId: t.facultyTaskId,
            title: t.taskTitle,
            description: t.description,
            time: t.time,
            date: t.date || selectedDate,
          }));
          setCalendarFacultyTasks(formatted);
        } else if (role === "student") {
          // Fetch student tasks
          if (studentId) {
            const { data: sData, error: sError } = await supabase
              .from("student_tasks")
              .select(`
                studentTaskId,
                taskTitle,
                description,
                date,
                time,
                createdAt
              `)
              .eq("createdBy", studentId)
              .gte("createdAt", start)
              .lte("createdAt", end)
              .is("deletedAt", null)
              .order("time", { ascending: true });

            if (sError) throw sError;

            const formattedStudent = (sData || []).map((t: any) => ({
              facultyTaskId: t.studentTaskId,
              title: t.taskTitle,
              description: t.description,
              time: t.time,
              date: t.date || selectedDate,
            }));
            setCalendarStudentTasks(formattedStudent);
          }

          // Fetch faculty tasks
          const ayId = studentContext.collegeAcademicYearId;
          const secId = studentContext.collegeSectionsId;
          if (ayId && secId) {
            const { data: fData, error: fError } = await supabase
              .from("faculty_tasks")
              .select(`
                facultyTaskId,
                taskTitle,
                description,
                date,
                time,
                createdAt
              `)
              .eq("collegeAcademicYearId", ayId)
              .eq("collegeSectionsId", secId)
              .gte("createdAt", start)
              .lte("createdAt", end)
              .is("deletedAt", null)
              .order("time", { ascending: true });

            if (fError) throw fError;

            const formattedFaculty = (fData || []).map((t: any) => ({
              facultyTaskId: t.facultyTaskId,
              title: t.taskTitle,
              description: t.description,
              time: t.time,
              date: t.date || selectedDate,
            }));
            setCalendarFacultyTasks(formattedFaculty);
          } else {
            setCalendarFacultyTasks([]);
          }
        }
      } catch (err) {
        console.error("Error fetching tasks for calendar date:", err);
      } finally {
        setIsCalendarLoading(false);
      }
    };

    fetchTasksForDate();
  }, [selectedDate, role, collegeSubjectId, studentId, subjects, refreshTrigger]);


  const handleConfirmDelete = async () => {
    if (taskToDeleteId === null) return;

    setIsDeleting(true);
    try {
      const res =
        role === "student"
          ? await deactivateStudentTask(taskToDeleteId)
          : await deactivateFacultyTask(taskToDeleteId);

      if (res.success) {
        await onDeleteTask?.(taskToDeleteId);
        toast.success("Task deleted successfully");
        setIsDeleteDialogOpen(false);
        if (selectedDate) {
          setRefreshTrigger((prev) => prev + 1);
        }
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setTaskToDeleteId(null);
    }
  };

  const tasksToShow =
    role === "faculty"
      ? (selectedDate ? calendarFacultyTasks : facultyTasks)
      : activeView === "student"
        ? (selectedDate ? calendarStudentTasks : studentTasks)
        : dbFacultyTasks;

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time: string) => {
    const [hourStr, minute] = time.split(":");
    let hour = Number(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <>
      <div
        id="student-task-panel"
        className={`bg-white ${!style && "mt-5"} rounded-md shadow-md p-4 min-h-[345px]`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-[#E7F7EE] rounded-full p-1">
              <CheckCircle size={22} weight="fill" color="#43C17A" />
            </div>
            {role === "faculty" && (
              <div className="flex items-center justify-between w-[100%]">
                <p className="text-[#282828] font-medium">{t("My Tasks")}</p>
                {!onAddTask && (
                  <div className="relative cursor-pointer w-6 h-6 flex items-center justify-center">
                    <CalendarIcon size={22} weight="fill" className="text-indigo-500" />
                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => setSelectedDate(e.target.value || null)}
                      value={selectedDate || ""}
                    />
                  </div>
                )}
              </div>
            )}

            {role === "student" && (
              <div className="flex items-center justify-between w-[100%]">
                <div className="flex items-center gap-0 text-sm font-semibold">
                  <button
                    onClick={() => setActiveView("faculty")}
                    className={
                      activeView === "faculty"
                        ? "text-[#16284F] cursor-pointer"
                        : "text-gray-400 cursor-pointer"
                    }
                  >
                    {t("Faculty Tasks")}
                  </button>
                  <span className="text-gray-300 ml-1 mr-1">/</span>
                  <button
                    onClick={() => setActiveView("student")}
                    className={
                      activeView === "student"
                        ? "text-[#16284F] cursor-pointer"
                        : "text-gray-400 cursor-pointer"
                    }
                  >
                    {t("My Tasks")}
                  </button>
                </div>
                {activeView === "faculty" && (
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <CalendarIcon size={22} weight="fill" className="text-indigo-500" />
                    <input
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => setSelectedDate(e.target.value || null)}
                      value={selectedDate || ""}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {onAddTask &&
            (role === "faculty" ||
              (role === "student" && activeView === "student")) && (
              <div className="flex items-center gap-2">
                <PlusCircleIcon size={22} weight="fill"
                  className="text-[#43C17A] cursor-pointer"
                  onClick={() => {
                    setOpenModal(true);
                    onAddTask?.();
                  }}
                />
                <div className="relative cursor-pointer w-6 h-6 flex items-center justify-center">
                  <CalendarIcon size={22} weight="fill" className="text-indigo-500" />
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => setSelectedDate(e.target.value || null)}
                    value={selectedDate || ""}
                  />
                </div>
              </div>
            )}
        </div>
        {selectedDate && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-md py-1.5 px-3 mb-3 text-xs text-indigo-800">
            <span className="font-medium flex items-center gap-1.5 flex-row">
              <CalendarIcon size={16} weight="fill" className="text-indigo-500" />
              Showing tasks created on: <span className="font-bold">{formatDateToDMY(selectedDate)}</span>
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer text-xs"
              title="Clear Filter"
            >
              <XIcon size={12} weight="bold" />
            </button>
          </div>
        )}
        <div className="max-h-[240px] overflow-y-auto pr-1">
          {(loading || isCalendarLoading || isDbFacultyLoading) && tasksToShow.length === 0 ? (
            <>
              <TaskCardShimmer />
              <TaskCardShimmer />
              <TaskCardShimmer />
            </>
          ) : tasksToShow.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-10">
              {t("No tasks available")}
            </p>
          ) : (
            tasksToShow.map((task) => (
              <div
                key={task.facultyTaskId}
                className="bg-[#E8F8EF] rounded-md mt-3 p-2 flex justify-between"
              >
                <div className="w-[80%]">
                  <h5 className="text-sm font-semibold text-[#16284F]">
                    {task.title}
                  </h5>
                  <p className="text-xs text-[#454545]">{task.description}</p>
                </div>

                <div className="w-[20%] flex flex-col items-center justify-between">
                  <p className="text-xs font-medium text-[#6B7280]">
                    {formatTime(task.time)}
                  </p>

                  <div className="flex gap-2">
                    {(role === "faculty" ||
                      (role === "student" && activeView === "student")) && (
                        <button
                          onClick={() => {
                            if (onEditTask) {
                              onEditTask(task);
                            } else {
                              setEditTask(task);
                              setOpenModal(true);
                            }
                          }}
                          className="p-1 rounded-full hover:bg-[#DFF3E9] cursor-pointer"
                        >
                          <PencilSimple size={18} color="#16284F" />
                        </button>
                      )}

                    {(role === "faculty" ||
                      (role === "student" && activeView === "student")) && (
                        <button
                          onClick={() => {
                            setTaskToDeleteId(task.facultyTaskId);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 cursor-pointer"
                        >
                          <Trash size={18} color="#EF4444" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {onSaveTask && (
        <TaskModal
          open={openModal}
          role={role}
          collegeSubjectId={collegeSubjectId}
          facultyId={facultyId}
          studentId={studentId}
          defaultValues={editTask}
          onClose={() => {
            setOpenModal(false);
            setEditTask(null);
          }}
          onSave={async (payload, taskId) => {
            await onSaveTask(payload, taskId);
            if (selectedDate) {
              setRefreshTrigger((prev) => prev + 1);
            }
          }}
        />
      )}
      <ConfirmDeleteModal
        open={isDeleteDialogOpen}
        name="Task"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setTaskToDeleteId(null);
        }}
      />
    </>
  );
}
