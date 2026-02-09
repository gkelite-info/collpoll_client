"use client";

import { useState } from "react";
import { CheckCircle, PencilSimple } from "@phosphor-icons/react";
import TaskModal from "@/app/components/modals/taskModal";


export type Task = {
  facultytaskId: number;
  title: string;
  description: string;
  time: string;
  facultytaskcreatedDate: string | null;
};

export type TaskPanelProps = {
  role?: "faculty" | "student";
  tasks?: Task[];
  facultyTasks?: Task[];
  studentTasks?: Task[];
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
  ) => void;

};

export default function TaskPanel({
  role = "student",
  tasks,
  facultyTasks = [],
  studentTasks = [],
  onEditTask,
  onAddTask,
  onSaveTask,
}: TaskPanelProps) {

  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<"student" | "faculty">(
    role === "student" ? "student" : "faculty"
  );

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
      
      <div className="bg-white mt-5 rounded-md shadow-md p-4 h-[345px] overflow-y-auto">
      {role === "faculty" && (
        <h2 className="text-lg font-semibold text-[#16284F] mb-2">
          My Tasks
        </h2>
      )}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#E7F7EE] rounded-full p-1">
              <CheckCircle size={22} weight="fill" color="#43C17A" />
            </div>
            {role === "student" && (
              <div className="flex items-center gap-0 text-sm font-semibold ">
                <button
                  onClick={() => setActiveView("student")}
                  className={
                    activeView === "student"
                      ? "text-[#16284F]"
                      : "text-gray-400"
                  }
                >
                  My Tasks
                </button>
                <span className="text-gray-300">/</span>

                <button
                  onClick={() => setActiveView("faculty")}
                  className={
                    activeView === "faculty"
                      ? "text-[#16284F]"
                      : "text-gray-400"
                  }
                >
                  Faculty Tasks
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
   hover:bg-[#43C17A] hover:text-white transition"
              >
                + Add Task
              </button>

            )}
        </div>
        {tasksToShow.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-10">
            No tasks available
          </p>
        ) : (
          tasksToShow.map((task) => (
            <div
              key={task.facultytaskId}
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
                          setEditTask(task);
                          setOpenModal(true);
                        }}
                        className="p-1 rounded-full hover:bg-[#DFF3E9]"
                      >
                        <PencilSimple size={18} color="#16284F" />
                      </button>
                    )}
                  <CheckCircle size={22} color="#282828" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {onSaveTask && (
        <TaskModal
          open={openModal}
          defaultValues={editTask}
          onClose={() => {
            setOpenModal(false);
            setEditTask(null);
          }}
          onSave={(payload) => {
            if (!payload) return;

            onSaveTask(payload, editTask?.facultytaskId);

            setOpenModal(false);
            setEditTask(null);
          }}
        />
      )}
    </>
  );
}
