import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  CheckCircleIcon,
  FilePdf,
} from "@phosphor-icons/react";
import { useState } from "react";
import { CardProps } from "./subjectCards";
import LessonCard from "./lessonCard";

type FilterBannerProps = {
  filterBannerDetails: CardProps;
};
function FilterBanner(filterBannerDetails: FilterBannerProps) {
  return (
    <div className="bg-blue-00 mb-4 flex flex-col gap-4">
      <div className="w-full flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Subject :</p>
          <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {filterBannerDetails.filterBannerDetails.subjectTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Semester :</p>

          <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium appearance-none  focus:outline-none">
            II
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Year :</p>

          <div className="flex items-center justify-center px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            <p>2nd Year</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SubjectDetailsCardProps = {
  details: CardProps;
  onBack: () => void;
};

export type TopicItem = {
  title: string;
  date: string;
  isCompleted: boolean;
};

export type LessonData = {
  lessonNumber: number;
  lessonTitle: string;
  topics: TopicItem[];
};

export type Unit = {
  id: number;
  unitLabel: string;
  title: string;
  color: "purple" | "orange" | "blue";
  dateRange: string;
  percentage: number;
  topics: string[];
  lessons: LessonData[];
};

const MOCK_LESSONS: LessonData[] = [
  {
    lessonNumber: 1,
    lessonTitle: "Introduction to Programming",
    topics: [
      {
        title: "Introduction to Programming & Problem Solving",
        date: "25/01/2025",
        isCompleted: true,
      },
      { title: "Primitive Data Types", date: "21/02/2025", isCompleted: true },
      {
        title: "Looping Constructs (for, while, switch)",
        date: "28/02/2025",
        isCompleted: true,
      },
      {
        title: "Abstract Data Types (ADTs)",
        date: "25/03/2025",
        isCompleted: true,
      },
    ],
  },
  {
    lessonNumber: 2,
    lessonTitle: "Fundamentals of Programming & Data Types",
    topics: [
      { title: "Memory Management", date: "10/04/2025", isCompleted: true },
      { title: "Pointer Arithmetic", date: "15/04/2025", isCompleted: false },
      { title: "Arrays & Strings", date: "20/04/2025", isCompleted: false },
    ],
  },
  {
    lessonNumber: 3,
    lessonTitle: "Fundamentals of Programming & Data Types",
    topics: [
      { title: "Memory Management", date: "10/04/2025", isCompleted: true },
      { title: "Pointer Arithmetic", date: "15/04/2025", isCompleted: false },
      { title: "Arrays & Strings", date: "20/04/2025", isCompleted: false },
    ],
  },
  {
    lessonNumber: 4,
    lessonTitle: "Fundamentals of Programming & Data Types",
    topics: [
      { title: "Memory Management", date: "10/04/2025", isCompleted: true },
      { title: "Pointer Arithmetic", date: "15/04/2025", isCompleted: false },
      { title: "Arrays & Strings", date: "20/04/2025", isCompleted: false },
    ],
  },
  {
    lessonNumber: 5,
    lessonTitle: "Fundamentals of Programming & Data Types",
    topics: [
      { title: "Memory Management", date: "10/04/2025", isCompleted: true },
      { title: "Pointer Arithmetic", date: "15/04/2025", isCompleted: false },
      { title: "Arrays & Strings", date: "20/04/2025", isCompleted: false },
    ],
  },
];

const units: Unit[] = [
  {
    id: 1,
    unitLabel: "Unit - 1",
    title: "Introduction to Data Structures",
    color: "purple",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 80,
    topics: [
      "Concept of Data and Information",
      "Characteristics of Data Structures",
      "Abstract Data Type (ADT)",
      "Classification of Data Structures",
      "Role of Data Structures in Programming",
      "Memory Allocation - Static vs Dynamic",
      "Time and Space Complexity Basics",
      "Big O Notation Introduction",
      "Types of Data - Primitive and Non-Primitive",
      "Arrays vs Linked Structures",
      "Real world Applications of Data Structures",
      "Choosing the Right Data Structure",
      "Stack vs Queue Overview",
      "Trees and Graphs Overview",
      "Implementation Examples in C",
    ],
    lessons: MOCK_LESSONS,
  },
  {
    id: 2,
    unitLabel: "Unit - 2",
    title: "Arrays and Linked Lists",
    color: "orange",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 60,
    topics: [
      "Concept of Linear Data Structures",
      "1D, 2D, and Multidimensional Arrays",
      "Insertion and Deletion in Arrays",
      "Searching in Arrays",
      "Linked List Concepts",
      "Singly Linked List Implementation",
      "Doubly Linked List Implementation",
      "Circular Linked List Implementation",
      "Linked List Operations",
      "Merging and Splitting Lists",
      "Applications of Linked Lists",
      "Dynamic Memory Allocation",
      "Advantages of Linked Lists",
      "Comparison Table - Arrays vs Linked Lists",
      "Implementation Examples in C",
      "Linked List Traversal Logic",
      "Memory Representation",
    ],
    lessons: MOCK_LESSONS,
  },
  {
    id: 3,
    unitLabel: "Unit - 3",
    title: "Stacks and Queues",
    color: "blue",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 90,
    topics: [
      "Stack ADT and Operations",
      "Stack Implementation",
      "Applications of Stacks",
      "Infix to Postfix Conversion",
      "Recursion using Stack",
      "Queue ADT and Operations",
      "Circular Queue Concepts",
      "Circular Queue Implementation",
      "Linked List based Queue",
      "Merging and Splitting Queues",
      "Applications of Queues",
      "Dynamic Memory Implementation",
      "Comparison - Stack vs Queue",
      "Implementation Examples",
    ],
    lessons: MOCK_LESSONS,
  },
  {
    id: 4,
    unitLabel: "Unit - 4",
    title: "Introduction to Data Structures",
    color: "purple",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 60,
    topics: [
      "Concept of Data and Information",
      "Characteristics of Data Structures",
      "Abstract Data Type (ADT)",
      "Classification of Data Structures",
      "Role of Data Structures in Programming",
      "Memory Allocation - Static vs Dynamic",
      "Time and Space Complexity Basics",
      "Big O Notation Introduction",
      "Types of Data - Primitive and Non-Primitive",
      "Arrays vs Linked Structures",
      "Real world Applications of Data Structures",
      "Choosing the Right Data Structure",
      "Stack vs Queue Overview",
      "Trees and Graphs Overview",
      "Implementation Examples in C",
    ],
    lessons: MOCK_LESSONS,
  },
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

type UnitCardProps = {
  unit: Unit;
};

function UnitCard({ unit }: UnitCardProps) {
  const colors = colorMap[unit.color];
  const [selectedUnitLessons, setSelectedUnitLessons] = useState<
    LessonData[] | null
  >(null);

  if (selectedUnitLessons) {
    return (
      <div className="w-full px-8 bg-[#F5F5F7] min-h-screen pt-6">
        <LessonCard
          lesson={selectedUnitLessons}
          onBack={() => setSelectedUnitLessons(null)}
        />
      </div>
    );
  }
  const percentage = unit.percentage ?? 0;

  return (
    <div className={`rounded-xl px-4 py-3 ${colors.cardBg} w-full`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <div
          className={`font-semibold text-md flex w-full justify-between items-center text-[${colors.solidEnd}]`}
        >
          {unit.unitLabel}
          <button onClick={() => setSelectedUnitLessons(unit.lessons)}>
            <CaretRight size={24} color="#282828" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 h-full flex flex-col">
        <h3
          className={`text-base md:text-lg font-semibold mb-3 ${colors.title}`}
        >
          {unit.title}
        </h3>

        <div className="flex items-center justify-between text-xs md:text-sm mb-2">
          <div className="flex items-center gap-2 text-[#6C6C6C]">
            <CalendarBlank size={16} className={colors.accent} />
            <span>{unit.dateRange}</span>
          </div>
          <span className="font-semibold text-[#333333]">{percentage}%</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full shadow transition-all duration-700"
            style={{ left: `calc(${percentage}% - 7px)` }}
          />
        </div>

        <ul className="flex-1 space-y-2 text-xs md:text-sm text-[#3F3F3F] overflow-y-auto pr-1">
          {unit.topics.map((topic, idx) => (
            <li key={idx} className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircleIcon
                  size={16}
                  className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                  weight="fill"
                />
                <span>{topic}</span>
              </div>
              <div
                className={`${colors.cardBg} rounded-full h-6 w-6 flex items-center justify-center`}
              >
                <FilePdf
                  size={16}
                  className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                  weight="duotone"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SubjectDetailsCard({
  details,
  onBack,
}: SubjectDetailsCardProps) {
  return (
    <div className="w-full px-4 bg-[#F5F5F7] min-h-screen">
      <button
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition"
      >
        <ArrowLeft size={18} weight="bold" />
        Go Back
      </button>
      <div className="flex justify-between">
        <FilterBanner filterBannerDetails={details} />
      </div>

      <div className="flex gap-6 overflow-x-auto">
        {units.map((unit) => (
          <div key={unit.id} className="min-w-[300px] shrink-0">
            <UnitCard unit={unit} />
          </div>
        ))}
      </div>
    </div>
  );
}
