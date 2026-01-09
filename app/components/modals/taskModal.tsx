"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { insertFacultyTask, updateFacultyTask } from "@/lib/helpers/faculty/facultyTasks";


export type TaskPayload = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
};


type TaskModalProps = {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    facultytaskId: number;
    title: string;
    description: string;
    time: string;
    facultytaskcreatedDate: string | null;
  } | null;
  onSave: (task: TaskPayload) => void;
};


const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function TaskModal({
  open,
  onClose,
  onSave,
  defaultValues,
}: TaskModalProps) {

  console.log("DEFAULT VALUES:", defaultValues);

  if (!open) return null;

  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  useEffect(() => {
    if (defaultValues?.facultytaskId) {
     
      setTitle(defaultValues.title);
      setDescription(defaultValues.description);
      setDueTime(defaultValues.time);

      setDueDate(
        defaultValues.facultytaskcreatedDate ??
        new Date().toISOString().split("T")[0]
      );
    } else {
      
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
    }
  }, [defaultValues]);

  const handleSave = async () => {
    if (!title || !description || !dueDate || !dueTime) {
      alert("Please fill all fields!");
      return;
    }

    if (getWordCount(description) > 30) {
      alert("Description should not exceed 30 words.");
      return;
    }

   
    if (defaultValues?.facultytaskId) {
      const response = await updateFacultyTask(defaultValues.facultytaskId, {
        facultytaskTitle: title,
        facultytaskDescription: description,
        facultytaskcreatedDate: dueDate,
        facultytaskassignedTime: dueTime,
      });

      if (!response.success) {
        alert(response.error || "Update failed");
        return;
      }

     
      const payload: TaskPayload = {
        title,
        description,
        dueDate,
        dueTime,
      };

      
      onSave(payload);
      onClose();

      return; 
    }

    const response = await insertFacultyTask({
      facultytaskTitle: title,
      facultytaskDescription: description,
      facultytaskcreatedDate: dueDate,
      facultytaskassignedTime: dueTime,
    });

    if (!response.success) {
      alert(response.error || "Insert failed");
      return;
    }

    
    const payload: TaskPayload = {
      title,
      description,
      dueDate,
      dueTime,
    };

    
    onSave(payload);
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[450px] animate-fadeIn relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">
            {defaultValues ? "Edit Task" : "Add Task"}
          </h2>

          <button onClick={onClose}>
            <X size={24} weight="bold" className="text-[#282828] cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-col mb-3 text-left">
          <label className="text-sm font-medium mb-1 text-[#282828]">
            Task Title
          </label>
          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
          />
        </div>

        <div className="flex flex-col mb-5 text-left">
          <label className="text-sm font-medium mb-1 text-[#282828]">
            Description / Notes
          </label>
          <textarea
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm h-[80px] resize-none outline-none text-[#282828]"
          />
        </div>

        <h3 className="text-sm font-semibold text-[#282828] mb-2">Schedule</h3>

        <div className="flex gap-3 mb-5">
          <div className="flex flex-col w-1/2 text-left">
            <label className="text-sm font-medium mb-1 text-[#282828]">
              Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
            />
          </div>

          <div className="flex flex-col w-1/2 text-left">
            <label className="text-sm font-medium mb-1 text-[#282828]">
              Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm outline-none text-[#282828]"
            />
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleSave}
            className="w-1/2 bg-[#43C17A] text-white py-2 rounded-md text-sm hover:bg-[#3AAA6B] cursor-pointer"
          >
            Save Task
          </button>

          <button
            className="w-1/2 border py-2 rounded-md text-sm text-[#282828] cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
