"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  CheckCircle,
  FilePdf,
} from "@phosphor-icons/react";
import { CardProps } from "@/lib/types/faculty";

type Topic = {
  title: string;
  date: string;
  isCompleted: boolean;
};

type LessonData = {
  lessonNumber: number;
  lessonTitle: string;
  topics: Topic[];
};

type Unit = {
  id: number;
  unitLabel: string;
  title: string;
  color: "purple" | "orange" | "blue";
  dateRange: string;
  percentage: number;
  topics: string[];
  lessons: LessonData[]; // Added lessons to the Unit type
};

// --- Mock Lessons Data (6 lessons) ---
const mockLessons: LessonData[] = [
  {
    lessonNumber: 1,
    lessonTitle: "Fundamentals of Programming",
    topics: [
      {
        title: "Introduction to Programming & Problem Solving",
        date: "25/01/2025",
        isCompleted: true,
      },
      { title: "Primitive Data Types", date: "21/02/2025", isCompleted: true },
      { title: "Looping Constructs", date: "28/02/2025", isCompleted: true },
    ],
  },
  {
    lessonNumber: 2,
    lessonTitle: "Fundamentals of Programming & Data Types",
    topics: [
      {
        title: "Abstract Data Types (ADTs)",
        date: "25/03/2025",
        isCompleted: true,
      },
      { title: "Memory Allocation", date: "10/04/2025", isCompleted: true },
      { title: "Dynamic Structures", date: "15/04/2025", isCompleted: false },
    ],
  },
  // Add 4 more lessons as needed...
];

const units: Unit[] = [
  {
    id: 1,
    unitLabel: "Unit - 1",
    title: "Introduction to Data Structures",
    color: "purple",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 80,
    topics: ["ADT", "Classification", "Complexity"],
    lessons: mockLessons, // Passing the 6 lessons here
  },
  // ... rest of your units
];

const colorMap = {
  purple: {
    cardBg: "bg-[#E9E3FFF5]",
    dot: "bg-[#A66BFF]",
    title: "text-[#3B2A91]",
    accent: "text-[#7E5DFF]",
    fadeStart: "rgba(126,93,255,0.25)",
    solidEnd: "#7E5DFF",
  },
  orange: {
    cardBg: "bg-[#FFEDDA]",
    dot: "bg-[#FFAE4C]",
    title: "text-[#A35300]",
    accent: "text-[#FF8A2A]",
    fadeStart: "rgba(255,138,42,0.25)",
    solidEnd: "#FF8A2A",
  },
  blue: {
    cardBg: "bg-[#CEE6FF]",
    dot: "bg-[#68A4FF]",
    title: "text-[#22518F]",
    accent: "text-[#4C8DFF]",
    fadeStart: "rgba(76,141,255,0.25)",
    solidEnd: "#4C8DFF",
  },
} as const;

// --- Sub-Component: LessonCard (The full page view) ---
function LessonCardView({
  lessons,
  onBack,
}: {
  lessons: LessonData[];
  onBack: () => void;
}) {
  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[#7153E1] font-medium"
      >
        <ArrowLeft size={18} weight="bold" /> Go back to Units
      </button>

      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {lessons.map((lesson) => (
          <div
            key={lesson.lessonNumber}
            className="bg-white border-[1.5px] border-[#E0D7FB] rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-[#7051E1] text-2xl font-bold mb-6">
              Lesson {lesson.lessonNumber} - {lesson.lessonTitle}
            </h2>
            <div className="space-y-4">
              {lesson.topics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      size={24}
                      weight="fill"
                      className={
                        topic.isCompleted ? "text-[#9B83F4]" : "text-gray-300"
                      }
                    />
                    <span className="text-[#282828] text-lg">
                      • {topic.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-[#EBEBFF] px-4 py-1 rounded-full text-[#9B83F4] text-sm font-medium">
                      {topic.date}
                    </div>
                    <div className="text-[#9B83F4] p-1.5 rounded-full border border-[#E0D7FB] flex items-center justify-center">
                      <FilePdf size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Progress Bar */}
            <div className="mt-8 relative h-3 w-full bg-[#EBEBFF] rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-[70%] bg-gradient-to-r from-[#9B83F4] to-[#7051E1] rounded-full" />
              <div className="absolute top-1/2 left-[70%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#7051E1] rounded-full shadow-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Components ---

function FilterBanner({
  filterBannerDetails,
}: {
  filterBannerDetails: CardProps;
}) {
  return (
    <div className="mb-4 flex flex-col gap-4">
      <div className="w-full flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Subject :</p>
          <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {filterBannerDetails.subjectTitle}
          </p>
        </div>
        {/* Semester & Year simplified for brevity */}
      </div>
    </div>
  );
}

export function SubjectDetailsCard({
  details,
  onBack,
}: {
  details: CardProps;
  onBack: () => void;
}) {
  const [selectedUnitLessons, setSelectedUnitLessons] = useState<
    LessonData[] | null
  >(null);

  // If a unit is selected, show the LessonCard full page view
  if (selectedUnitLessons) {
    return (
      <div className="w-full px-8 bg-[#F5F5F7] min-h-screen pt-6">
        <LessonCardView
          lessons={selectedUnitLessons}
          onBack={() => setSelectedUnitLessons(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-4 bg-[#F5F5F7] min-h-screen pt-4">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-[#7153E1] font-medium hover:underline"
      >
        <ArrowLeft size={18} weight="bold" /> Go Back
      </button>

      <FilterBanner filterBannerDetails={details} />

      <div className="flex gap-6 overflow-x-auto pb-6">
        {units.map((unit) => {
          const colors = colorMap[unit.color];
          return (
            <div key={unit.id} className="min-w-[340px] shrink-0">
              <div className={`rounded-xl px-4 py-3 ${colors.cardBg} w-full`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                  <div
                    className={`font-semibold text-md flex w-full justify-between items-center ${colors.title}`}
                  >
                    {unit.unitLabel}
                    <button
                      onClick={() => setSelectedUnitLessons(unit.lessons)}
                      className="cursor-pointer hover:scale-110 transition-transform"
                    >
                      <CaretRight size={24} color="#282828" />
                    </button>
                  </div>
                </div>

                {/* --- Your existing UnitCard UI Body --- */}
                <div className="bg-white rounded-2xl shadow-md p-4 h-[400px] flex flex-col">
                  <h3 className={`text-lg font-bold mb-3 ${colors.title}`}>
                    {unit.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-[#6C6C6C]">
                      <CalendarBlank size={16} className={colors.accent} />
                      <span>{unit.dateRange}</span>
                    </div>
                    <span className="font-bold">{unit.percentage}%</span>
                  </div>
                  <ul className="flex-1 space-y-3 overflow-y-auto">
                    {unit.topics.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            size={18}
                            weight="fill"
                            className={colors.accent}
                          />
                          {t}
                        </div>
                        <FilePdf size={18} className={colors.accent} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
