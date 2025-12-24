import {
  ArrowLeft,
  CalendarBlank,
  CheckCircleIcon,
  FilePdf,
  UserCircle,
} from "@phosphor-icons/react";
import { CardProps } from "./subjectCard";

type FilterBannerProps = {
  filterBannerDetails: CardProps;
};
function FilterBanner(filterBannerDetails: FilterBannerProps) {
  return (
    <div className="bg-blue-00 mb-4 flex flex-col gap-4">
      <div className="w-full flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-[18px]">Subject :</p>
          <p className="px-5 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium">
            {filterBannerDetails.filterBannerDetails.subjectTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-[18px]">Semester :</p>

          <p className="px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium appearance-none  focus:outline-none">
            II
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-[18px]">Year :</p>

          <div className="flex items-center justify-center px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium">
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

type Unit = {
  id: number;
  unitLabel: string;
  title: string;
  color: "purple" | "orange" | "blue";
  dateRange: string;
  percentage: number;
  topics: string[];
};

const units: Unit[] = [
  {
    id: 1,
    unitLabel: "Unit - 1",
    title: "Introduction to Data Structures",
    color: "purple",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 100,
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
  },
  {
    id: 2,
    unitLabel: "Unit - 2",
    title: "Arrays and Linked Lists",
    color: "orange",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 100,
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
  },
  {
    id: 3,
    unitLabel: "Unit - 3",
    title: "Stacks and Queues",
    color: "blue",
    dateRange: "10-12-2025 - 01-01-2026",
    percentage: 100,
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
  const percentage = unit.percentage ?? 0;

  return (
    <div className={`rounded-3xl p-4 ${colors.cardBg} w-full`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <span className="font-semibold text-sm text-[#4B4B4B]">
          {unit.unitLabel}
        </span>
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
              <FilePdf
                size={16}
                className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                weight="duotone"
              />
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
    <div className="w-full px-4 py-6 bg-[#F5F5F7] min-h-screen">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition"
      >
        <ArrowLeft size={18} weight="bold" />
        Go Back
      </button>
      <div className="flex justify-between">
        <FilterBanner filterBannerDetails={details} />
        <div className="flex items-center gap-2 bg-[#E8ECF3] px-3 mb-5 py-1 rounded-full w-fit">
          <div className="bg-[#122A5E] p-1.5 rounded-full flex items-center justify-center">
            <UserCircle size={16} color="white" weight="bold" />
          </div>

          <span className="text-[#4C4C4C] text-sm">Faculty : </span>

          <span className="text-[#122A5E] font-medium text-sm">
            {details.lecturer}
          </span>
        </div>
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
