"use client";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircleIcon,
  FilePdf,
  UserCircle,
  CaretDown,
  Clock,
} from "@phosphor-icons/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardProps, UnitTopic } from "./subjectCard";
import { TopicPdfViewModal } from "./TopicPdfViewModal";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Academics.student");
  return (
    <div className="flex flex-col gap-4 max-md:gap-2">
      <div className="w-full flex flex-wrap gap-x-6 gap-y-3 max-md:gap-x-3 max-md:gap-y-2">
        <div className="flex items-center gap-2 max-md:gap-1">
          <p className="text-[#525252] text-sm whitespace-nowrap max-md:text-[13px]">
            {t("Subject :")}
          </p>
          <p className="px-5 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-sm font-medium whitespace-nowrap max-md:px-3 max-md:py-0.5 max-md:text-[12px]">
            {filterBannerDetails.subjectTitle}
          </p>
        </div>

        <div className="flex items-center gap-2 max-md:gap-1">
          <p className="text-[#525252] text-sm whitespace-nowrap max-md:text-[13px]">
            {t("Semester :")}
          </p>
          <p className="px-3 py-1 bg-[#DCEAE2] text-[#43C17A] rounded-full text-sm font-medium whitespace-nowrap max-md:px-3 max-md:py-0.5 max-md:text-[12px]">
            {filterBannerDetails.semester
              ? `${t("Sem")} ${filterBannerDetails.semester}`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

type UnitCardProps = {
  unit: NonNullable<CardProps["unitsData"]>[number];
  onOpenTopicPdf: (payload: {
    unitLabel: string;
    unitTitle: string;
    topicId: number;
    topicTitle: string;
  }) => void;
};

function UnitCard({ unit, onOpenTopicPdf }: UnitCardProps) {
  const t = useTranslations("Academics.student");
  const colors = colorMap[unit.color] || colorMap.purple;
  const percentage = unit.percentage ?? 0;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-3xl max-md:rounded-xl p-4 ${colors.cardBg} w-full h-full flex flex-col max-md:h-auto max-md:p-3`}
    >
      <div
        className="flex items-center justify-between mb-3 shrink-0 max-md:mb-2 max-md:cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
          <span
            className={`font-semibold text-sm text-[#4B4B4B] md:text-[#4B4B4B] max-md:text-[15px] ${colors.title}`}
          >
            {unit.unitLabel}
          </span>
        </div>
        <CaretDown
          className={`hidden max-md:block ${colors.title} transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          size={20}
          weight="bold"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 flex-1 flex flex-col min-h-0 max-md:bg-white/60 max-md:shadow-none max-md:p-3">
        <h3
          className={`text-base md:text-lg font-semibold mb-3 max-md:mb-2 ${colors.title}`}
        >
          {unit.title}
        </h3>

        <div className="flex items-center justify-end text-xs md:text-sm mb-2 shrink-0 max-md:hidden">
          <span className="font-semibold text-[#333333]">{percentage}%</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4 shrink-0 max-md:mb-0 max-md:h-[8px]">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow transition-all duration-700 max-md:h-2 max-md:w-2"
              style={{ left: `calc(${percentage}% - 12px)` }}
            />
          </div>
        </div>

        <div className="hidden max-md:flex items-center justify-between mt-2.5">
          <div
            className={`flex items-center gap-1.5 text-[10px] font-semibold ${colors.title}`}
          >
            <Clock size={13} weight="fill" className={colors.title} />
            <span>{unit.dateRange}</span>
          </div>
          <span className={`text-[11px] font-bold ${colors.title}`}>
            {percentage}%
          </span>
        </div>

        <div className="flex-1 min-h-0 flex flex-col max-md:mt-0">
          <ul
            className="flex-1 space-y-2 text-xs md:text-sm text-[#3F3F3F] overflow-y-auto pr-2 max-md:hidden"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${colors.solidEnd} #f1f5f9`,
            }}
          >
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTopicPdf({
                        unitLabel: unit.unitLabel,
                        unitTitle: unit.title,
                        topicId: topic.topicId,
                        topicTitle: topic.name,
                      });
                    }}
                    className="cursor-pointer"
                    title={t("View PDFs")}
                  >
                    <FilePdf
                      size={16}
                      className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                      weight="duotone"
                    />
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">{t("No topics found")}</li>
            )}
          </ul>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.ul
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { opacity: 1, height: "auto", marginTop: "16px" },
                  collapsed: { opacity: 0, height: 0, marginTop: "0px" },
                }}
                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="hidden max-md:block space-y-2 text-xs text-[#3F3F3F] overflow-hidden"
              >
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

                        <span
                          className={topic.isCompleted ? "text-gray-500" : ""}
                        >
                          {topic.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTopicPdf({
                            unitLabel: unit.unitLabel,
                            unitTitle: unit.title,
                            topicId: topic.topicId,
                            topicTitle: topic.name,
                          });
                        }}
                        className="cursor-pointer"
                        title={t("View PDFs")}
                      >
                        <FilePdf
                          size={16}
                          className={`${colors.accent} flex-shrink-0 mt-[2px]`}
                          weight="duotone"
                        />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">
                    {t("No topics found")}
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
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
  const t = useTranslations("Academics.student");
  const dynamicUnits = details.unitsData || [];
  const [selectedTopicPdf, setSelectedTopicPdf] = useState<{
    unitLabel: string;
    unitTitle: string;
    topicId: number;
    topicTitle: string;
  } | null>(null);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-6  max-md:py-0 max-md:pb-7 max-md:px-0 bg-[#F5F5F7] min-h-screen flex flex-col">
      <button
        onClick={onBack}
        className="mb-4 cursor-pointer inline-flex items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition w-fit"
      >
        <ArrowLeft size={18} weight="bold" />
        {t("Go Back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 max-md:mb-3 max-md:gap-2">
        <FilterBanner filterBannerDetails={details} />

        <div className="flex items-center gap-2 bg-[#E8ECF3] max-md:bg-transparent max-md:px-0 px-3 py-1 rounded-full w-fit whitespace-nowrap shrink-0">
          <div className="bg-[#122A5E] max-md:bg-transparent max-md:p-0 p-1.5 rounded-full flex items-center justify-center">
            <UserCircle
              size={16}
              color="white"
              weight="bold"
              className="hidden md:block"
            />
            <UserCircle
              size={22}
              className="text-[#122A5E] md:hidden"
              weight="fill"
            />
          </div>
          <span className="text-[#4C4C4C] text-sm max-md:text-[13px]">
            {t("Faculty :")}{" "}
          </span>
          <span className="text-[#122A5E] font-medium text-sm max-md:bg-[#E8ECF3] max-md:px-3 max-md:py-1 max-md:rounded-full max-md:text-[13px]">
            {details.lecturer}
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 max-md:overflow-x-visible max-md:pb-0">
        <div className="flex gap-6 w-max px-1 max-md:w-full max-md:flex-col max-md:gap-4 max-md:px-0">
          {dynamicUnits.map((unit) => (
            <div
              key={unit.id}
              className="w-[320px] h-[450px] shrink-0 max-md:w-full max-md:h-auto"
            >
              <UnitCard unit={unit} onOpenTopicPdf={setSelectedTopicPdf} />
            </div>
          ))}
          {dynamicUnits.length === 0 && (
            <p className="text-gray-500 italic p-4">{t("No units found")}</p>
          )}
        </div>
      </div>

      <TopicPdfViewModal
        isOpen={!!selectedTopicPdf}
        onClose={() => setSelectedTopicPdf(null)}
        unitLabel={selectedTopicPdf?.unitLabel ?? ""}
        unitTitle={selectedTopicPdf?.unitTitle ?? ""}
        topicTitle={selectedTopicPdf?.topicTitle ?? ""}
        topicId={selectedTopicPdf?.topicId ?? 0}
      />
    </div>
  );
}
