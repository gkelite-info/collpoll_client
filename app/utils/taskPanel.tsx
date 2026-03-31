"use client";

import { useState } from "react";
import { CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import TaskModal from "@/app/components/modals/taskModal";
import { deactivateFacultyTask } from "@/lib/helpers/faculty/facultyTasks";
import TaskCardShimmer from "../(screens)/faculty/shimmers/TaskCardShimmer";
import { deactivateStudentTask } from "@/lib/helpers/student/studentTaskAPI";
import ConfirmDeleteModal from "../(screens)/admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";


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
    taskId?: number
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
  onDeleteTask
}: TaskPanelProps) {

  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<"student" | "faculty">("faculty");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (taskToDeleteId === null) return;

    setIsDeleting(true);
    try {
      const res = role === "student"
        ? await deactivateStudentTask(taskToDeleteId)
        : await deactivateFacultyTask(taskToDeleteId);

      if (res.success) {
        await onDeleteTask?.(taskToDeleteId);
        toast.success("Task deleted successfully");
        setIsDeleteDialogOpen(false);
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
      ? facultyTasks
      : activeView === "student"
        ? studentTasks
        : facultyTasks;


  const formatTime = (time: string) => {
    const [hourStr, minute] = time.split(":");
    let hour = Number(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <>

      <div className={`bg-white ${!style && "mt-5"} rounded-md shadow-md p-4 min-h-[345px]`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#E7F7EE] rounded-full p-1">
              <CheckCircle size={22} weight="fill" color="#43C17A" />
            </div>
            {role === "faculty" && (
              <p className="text-[#282828] font-medium">My Tasks</p>
            )}

            {role === "student" && (
              <div className="flex items-center gap-0 text-sm font-semibold ">
                <button
                  onClick={() => setActiveView("faculty")}
                  className={
                    activeView === "faculty"
                      ? "text-[#16284F] cursor-pointer"
                      : "text-gray-400 cursor-pointer"
                  }
                >
                  Faculty Tasks
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
                  My Tasks
                </button>

              </div>
            )}
          </div>
          {onAddTask &&
            (
              role === "faculty" ||

              (role === "student" && activeView === "student")
            ) && (
              <button
                onClick={() => {
                  setOpenModal(true);
                  onAddTask?.();
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-full
   border border-[#43C17A] text-[#43C17A] text-xs font-medium
   hover:bg-[#43C17A] hover:text-white transition cursor-pointer"
              >
                + Add Task
              </button>

            )}
        </div>
        <div className="max-h-[240px] overflow-y-auto pr-1">
          {loading && tasksToShow.length === 0 ? (
            <>
              <TaskCardShimmer />
              <TaskCardShimmer />
              <TaskCardShimmer />
            </>
          ) : tasksToShow.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-10">
              No tasks available
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
                  <p className="text-xs text-[#454545]">
                    {task.description}
                  </p>
                </div>

                <div className="w-[20%] flex flex-col items-center justify-between">
                  <p className="text-xs font-medium text-[#6B7280]">
                    {formatTime(task.time)}
                  </p>

                  <div className="flex gap-2">

                    {((role === "faculty") ||
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

                    {((role === "faculty") ||
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
          onSave={onSaveTask!}
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
