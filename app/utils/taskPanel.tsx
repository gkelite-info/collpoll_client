"use client";

import { CheckCircle, PencilSimple } from "@phosphor-icons/react";
import { useState } from "react";
import React from "react";

export type Task = {
  facultytaskId: number;
  title: string;
  description: string;
  time: string;
  facultytaskcreatedDate: string | null;
};

export type TaskPanelProps = {
  role: "faculty" | "student";
  facultyTasks: Task[];
  studentTasks: Task[];
  onEditTask?: (task: Task) => void;
  onAddTask?: () => void;
};

<<<<<<< Updated upstream
export default function TaskPanel({ tasks }: TaskPanelProps) {
  const [openModal, setOpenModal] = useState(false);
  const [activeTaskTab, setActiveTaskTab] = useState<"my" | "faculty">("my");

=======
const formatTime = (time: string) => {
  const [hourStr, minute] = time.split(":");
  let hour = Number(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export default function TaskPanel({
  role,
  facultyTasks = [],
  studentTasks = [],
  onEditTask,
  onAddTask,
}: TaskPanelProps) {

  const [activeView, setActiveView] = useState<"student" | "faculty">(
    role === "student" ? "student" : "faculty"
  );

  const tasksToShow =
    role === "faculty"
      ? facultyTasks
      : activeView === "student"
        ? studentTasks
        : facultyTasks;
>>>>>>> Stashed changes

  return (
    <div className="bg-white mt-5 rounded-md shadow-md p-4 h-[345px]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#E7F7EE] rounded-full p-1">
            <CheckCircle size={22} weight="fill" color="#43C17A" />
          </div>
          {role === "student" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("student")}
                className={`text-sm font-semibold ${activeView === "student"
                    ? "text-[#16284F]"
                    : "text-gray-400"
                  }`}
              >
                My Tasks
              </button>

              <span className="text-gray-300">/</span>

              <button
                onClick={() => setActiveView("faculty")}
                className={`text-sm font-semibold ${activeView === "faculty"
                    ? "text-[#16284F]"
                    : "text-gray-400"
                  }`}
              >
                Faculty Tasks
              </button>
            </div>
<<<<<<< Updated upstream
            <div
              style={{ fontSize: 12, fontWeight: "500", display: "flex", alignItems: "center", gap:2 }}
            >
              <button
                onClick={() => setActiveTaskTab("my")}
                className={`px-2 py-1 rounded cursor-pointer ${activeTaskTab === "my"
                  ? "text-[#43C17A] font-semibold"
                  : "text-gray-400"
                  }`}
              >
                My Tasks
              </button>

              <span className="text-gray-300">/</span>

              <button
                onClick={() => setActiveTaskTab("faculty")}
                className={`px-2 py-1 rounded cursor-pointer ${activeTaskTab === "faculty"
                  ? "text-[#43C17A] font-semibold"
                  : "text-gray-400"
                  }`}
              >
                Faculty Tasks
              </button>
            </div>

          </div>
          <div
            className="rounded-full h-[60%] w-[25%] flex items-center justify-center gap-2 bg-[#43C17A] cursor-pointer"
            onClick={() => setOpenModal(true)}
          >
            <p style={{ fontSize: 12, color: "#FFFFFF" }}>+</p>
            <p style={{ fontSize: 10, color: "#FFFFFF" }}>Add task</p>
          </div>
=======
          ) : (
            <p className="text-sm font-semibold text-[#16284F]">My Tasks</p>
          )}

>>>>>>> Stashed changes
        </div>

        {role === "faculty" && onAddTask && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#43C17A] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* TASK LIST */}
      {tasksToShow.length === 0 ? (
        <p className="text-xs text-gray-400 text-center mt-10">
          No tasks available
        </p>
      ) : (
        tasksToShow.map((task) => (
          <div
            key={task.facultytaskId}
            className="bg-[#E8F8EF] rounded-md mt-3 p-2 flex justify-between h-[80px]"
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
                {role === "faculty" && onEditTask && (
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1 rounded-full hover:bg-[#DFF3E9]"
                    title="Edit Task"
                  >
                    <PencilSimple size={18} color="#16284F" />
                  </button>
                )}
                <CheckCircle size={22} color="#282828" />
              </div>
            </div>
          </div>
<<<<<<< Updated upstream
        ))}
      </div>
      <TaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={() => { }}
      />
    </>
=======
        ))
      )}
    </div>
>>>>>>> Stashed changes
  );
}
