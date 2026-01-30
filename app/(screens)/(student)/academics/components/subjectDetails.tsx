"use client";

import {
  ArrowLeft,
  CalendarBlank,
  CheckCircleIcon,
  FilePdf,
  UserCircle,
} from "@phosphor-icons/react";
import { CardProps, UnitTopic } from "./subjectCard";

type Unit = {
  id: number;
  unitLabel: string;
  title: string;
  color: "purple" | "orange" | "blue";
  dateRange: string;
  percentage: number;
  topics: string[];
};

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

type FilterBannerProps = {
  filterBannerDetails: CardProps;
};

function FilterBanner({ filterBannerDetails }: FilterBannerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-[18px] whitespace-nowrap">
            Subject :
          </p>
          <p className="px-5 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium whitespace-nowrap">
            {filterBannerDetails.subjectTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-[18px] whitespace-nowrap">
            Semester :
          </p>
          <p className="px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-[16px] font-medium whitespace-nowrap">
            {filterBannerDetails.semester
              ? `Sem ${filterBannerDetails.semester}`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

type UnitCardProps = {
  unit: NonNullable<CardProps["unitsData"]>[number];
};

function UnitCard({ unit }: UnitCardProps) {
  const colors = colorMap[unit.color] || colorMap.purple;
  const percentage = unit.percentage ?? 0;

  return (
    <div
      className={`rounded-3xl p-4 ${colors.cardBg} w-full h-full flex flex-col`}
    >
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <span className="font-semibold text-sm text-[#4B4B4B]">
          {unit.unitLabel}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 flex-1 flex flex-col min-h-0">
        <h3
          className={`text-base md:text-lg font-semibold mb-3 ${colors.title}`}
        >
          {unit.title}
        </h3>

        <div className="flex items-center justify-between text-xs md:text-sm mb-2 shrink-0">
          <div className="flex items-center gap-2 text-[#6C6C6C]">
            <CalendarBlank size={16} className={colors.accent} />
            <span>{unit.dateRange}</span>
          </div>
          <span className="font-semibold text-[#333333]">{percentage}%</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4 shrink-0">
          <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow transition-all duration-700"
              style={{ left: `calc(${percentage}% - 12px)` }}
            />
          </div>
        </div>

        <ul className="flex-1 space-y-2 text-xs md:text-sm text-[#3F3F3F] overflow-y-auto pr-1">
          {unit.topics.length > 0 ? (
            unit.topics.map((topic: UnitTopic) => (
              <li
                key={topic.topicId}
                className="flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={16}
                    className={`${colors.accent} flex-shrink-0 mt-[2px] transition-colors`}
                    weight={topic.isCompleted ? "fill" : "regular"}
                  />

                  <span className={topic.isCompleted ? "text-gray-500" : ""}>
                    {topic.name}
                  </span>
                </div>

                <FilePdf
                  size={16}
                  className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                  weight="duotone"
                />
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">No topics found</li>
          )}
        </ul>
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
  const dynamicUnits = details.unitsData || [];

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-6 bg-[#F5F5F7] min-h-screen flex flex-col">
      <button
        onClick={onBack}
        className="mb-4 cursor-pointer inline-flex items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition w-fit"
      >
        <ArrowLeft size={18} weight="bold" />
        Go Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <FilterBanner filterBannerDetails={details} />

        <div className="flex items-center gap-2 bg-[#E8ECF3] px-3 py-1 rounded-full w-fit whitespace-nowrap shrink-0">
          <div className="bg-[#122A5E] p-1.5 rounded-full flex items-center justify-center">
            <UserCircle size={16} color="white" weight="bold" />
          </div>
          <span className="text-[#4C4C4C] text-sm">Faculty : </span>
          <span className="text-[#122A5E] font-medium text-sm">
            {details.lecturer}
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-6 w-max px-1">
          {dynamicUnits.map((unit) => (
            <div key={unit.id} className="w-[320px] h-[450px] shrink-0">
              <UnitCard unit={unit} />
            </div>
          ))}
          {dynamicUnits.length === 0 && (
            <p className="text-gray-500 italic p-4">No units found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
