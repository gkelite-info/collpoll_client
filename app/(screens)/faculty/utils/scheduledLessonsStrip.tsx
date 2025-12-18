"use client";

import React, { useState } from "react";
import {
  Plus,
  BookOpen,
  Clock,
  Trash,
  X,
  CaretDown,
} from "@phosphor-icons/react";

export interface ScheduledLesson {
  id: string;
  title: string;
  duration: string;
  classGroup: string;
  date?: string;
  time?: string;
  objective?: string;
}

interface ScheduledLessonsProps {
  lessons: ScheduledLesson[];
  subjectName?: string;
  onAddLesson: (lesson: Omit<ScheduledLesson, "id">) => void;
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

    const formattedData = {
      title: data.lessonTitle as string,
      duration: "60 mins",
      classGroup: (data.classSection as string) || "CSE - Generic",
      date: data.date as string,
      time: data.time as string,
      objective: data.objective as string,
    };

    onSave(formattedData);
    onClose();
  };

  return (
    <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[650px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <BookOpen weight="bold" size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              Lesson Card: Introduction to Data Structures
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
              <Trash size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Lesson Title
            </label>
            <input
              name="lessonTitle"
              type="text"
              placeholder="Introduction to Data Structures"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Lesson Number / Sequence
            </label>
            <input
              name="sequence"
              type="text"
              placeholder="Lesson 01"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Lesson Objective
            </label>
            <input
              name="objective"
              type="text"
              placeholder="Understand the concept of data structures and their importance."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Teaching Date & Time
            </label>
            <div className="flex gap-4">
              <input
                name="date"
                type="text"
                placeholder="02 Oct 2025"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all text-gray-600"
              />
              <input
                name="time"
                type="text"
                placeholder="10:00 AM"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Class / Section
            </label>
            <div className="relative">
              <select
                name="classSection"
                className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all text-gray-600 cursor-pointer"
              >
                <option>B.Tech CSE – Year 2, Section A</option>
                <option>B.Tech CSE – Year 1, Section B</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                <CaretDown size={16} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LessonCard: React.FC<{ lesson: ScheduledLesson }> = ({ lesson }) => (
  <div className="bg-[#e6fcf0] p-4 rounded-[16px] min-w-[280px] w-[280px] flex items-center gap-4 shrink-0 hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-emerald-200">
    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white">
      <BookOpen weight="bold" size={24} />
    </div>

    <div className="flex flex-col w-full overflow-hidden">
      <h3
        className="text-gray-900 font-bold text-sm truncate leading-tight mb-1"
        title={lesson.title}
      >
        {lesson.title}
      </h3>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center text-gray-600 text-xs gap-1">
          <Clock size={14} />
          <span>{lesson.duration}</span>
        </div>
        <span className="text-emerald-500 text-xs font-bold font-sans">
          {lesson.classGroup}
        </span>
      </div>
    </div>
  </div>
);

export default function ScheduledLessonsStrip({
  lessons,
  onAddLesson,
  subjectName = "Data Structures and algorithms",
}: ScheduledLessonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`w-full font-sans `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-bold text-gray-800">Scheduled Lessons</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#dcfce7] text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
            >
              <Plus weight="bold" size={18} />
            </button>

            <div className="text-[15px] text-gray-700">
              <span className="text-emerald-500 font-medium">Subject : </span>
              {subjectName}
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}

          {lessons.length === 0 && (
            <div className="w-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
              No lessons scheduled yet. Click + to add one.
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
