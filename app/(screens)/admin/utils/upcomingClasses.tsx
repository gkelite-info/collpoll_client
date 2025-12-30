"use client";

import { CaretDown, DotsThreeVertical, Plus, X } from "@phosphor-icons/react";
import React, { useState } from "react";

export interface UpcomingLesson {
  id: string;
  title: string;
  description: string;
  time: string;
  section?: string;
}

interface UpcomingClassesProps {
  lessons: UpcomingLesson[];
  onAddLesson: (newLesson: Omit<UpcomingLesson, "id">) => void;
  className?: string;
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

const LessonCard: React.FC<{ lesson: UpcomingLesson }> = ({ lesson }) => (
  <div className="relative flex bg-[#eff2f7] rounded-r-md rounded-l overflow-hidden min-h-[100px] shrink-0 group cursor-pointer hover:shadow-sm transition-all">
    <div className="w-1.5 bg-[#1e2952] absolute left-0 top-0 bottom-0 rounded-l-sm" />
    <div className="flex-1 py-3 px-4 ml-2 flex flex-col justify-between">
      <div>
        <h3 className="text-[#1e2952] font-bold text-[15px] leading-tight">
          {lesson.title}
        </h3>
        <p className="text-gray-600 text-[13px] mt-1 leading-snug line-clamp-2">
          {lesson.description}
        </p>
      </div>
      <div className="flex justify-end mt-2">
        <span className="text-emerald-500 text-xs font-medium">
          {lesson.time}
        </span>
      </div>
    </div>
  </div>
);

export default function UpcomingClasses({
  lessons,
  onAddLesson,
}: UpcomingClassesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`bg-white  p-5 w-full max-w-[400px] font-sans flex flex-col max-h-[500px]`}
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Classes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#ebeef5] flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700"
            >
              <Plus weight="bold" size={18} />
            </button>
            <button className="text-gray-800 hover:text-black">
              <DotsThreeVertical weight="bold" size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 max-h-[350px]">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
          {lessons.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm italic">
              No upcoming classes scheduled.
            </div>
          )}
        </div>
      </div>

      <AddLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddLesson}
      />
    </>
  );
}
