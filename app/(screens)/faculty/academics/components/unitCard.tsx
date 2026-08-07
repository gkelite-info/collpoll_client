import { getTopicsPaginated } from "@/lib/helpers/faculty/getTopicsPaginated";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import {
  FilePdf,
  CaretDown,
  Trash,
  PencilSimple,
  Clock,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export type UiTopic = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export type UnitTopic = {
  id: number;
  title: string;
  isCompleted: boolean;
};

export type TopicPdfSelection = {
  topicId: number;
  topicTitle: string;
  unitLabel: string;
  unitTitle: string;
};

export type Unit = {
  id: number;
  unitNumber: number;
  unitLabel: string;
  title: string;
  startDate?: string;
  endDate?: string;
  dateRange: string;
  percentage: number;
  topics: UnitTopic[];
  lessons: LessonData[];
  color: "purple" | "orange" | "blue";
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

type UnitCardProps = {
  unit: Unit;
  onMarkComplete: (
    unitId: number,
    topics: UnitTopic[],
    percentage: number,
  ) => void;
  onDeleteUnit: (unitId: number) => Promise<void>;
  onDeleteTopic: (unitId: number, topicId: number) => Promise<void>;
  onEditUnit?: (unit: Unit) => void;
  onOpenTopicPdf: (selection: TopicPdfSelection) => void;
  loadingUnitId: number | null;
  setHasChanges: (value: boolean) => void;
  collegeSectionId?: number | null;
  collegeId: number;
};

import { TopicSkeleton } from "./subjectDetailsSkeleton";

export function UnitCard({
  unit,
  onMarkComplete,
  onDeleteUnit,
  onDeleteTopic,
  onEditUnit,
  onOpenTopicPdf,
  setHasChanges,
  loadingUnitId,
  collegeSectionId,
  collegeId,
}: UnitCardProps) {

  const colors = colorMap[unit.color];
  const { ref: desktopLoadMoreRef, inView: desktopInView } = useInView();
  const { ref: mobileLoadMoreRef, inView: mobileInView } = useInView();

  const {
    data: topicsData,
    fetchNextPage: fetchNextTopics,
    hasNextPage: hasNextTopics,
    isFetchingNextPage: isFetchingNextTopics,
    isLoading: isTopicsLoading,
  } = useInfiniteQuery({
    queryKey: ["unitTopics", unit.id, collegeSectionId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getTopicsPaginated({
        collegeId,
        collegeSubjectUnitId: unit.id,
        collegeSectionsId: collegeSectionId,
        page: pageParam,
        limit: 10,
      });
      return res;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
    enabled: !!(collegeId && unit.id),
  });

  const rawTopics = topicsData?.pages.flatMap((page) => page.topics) ?? unit.topics ?? [];

  const [selectedUnitLessons, setSelectedUnitLessons] = useState<
    LessonData[] | null
  >(null);
  const [localTopics, setLocalTopics] = useState<UnitTopic[]>(rawTopics);
  const [isDirty, setIsDirty] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "unit" | "topic";
    topicId?: number;
  } | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if ((desktopInView || mobileInView) && hasNextTopics && !isFetchingNextTopics) {
      fetchNextTopics();
    }
  }, [desktopInView, mobileInView, hasNextTopics, isFetchingNextTopics, fetchNextTopics]);

  useEffect(() => {
    setLocalTopics(rawTopics);
    setIsDirty(false);
  }, [topicsData, unit.topics]);

  const isSavingThisUnit = loadingUnitId === unit.id;
  if (selectedUnitLessons) {
    return <div className="w-full px-8 bg-[#F5F5F7] min-h-screen pt-6"></div>;
  }
  const firstPage = topicsData?.pages[0];
  const serverTotalCount = firstPage?.totalCount ?? 0;
  const serverCompletedCount = firstPage?.totalCompletedCount ?? 0;

  const serverCompletedCountInRaw = rawTopics.filter((t) => t.isCompleted).length;
  const localCompletedCount = localTopics.filter((t) => t.isCompleted).length;
  const delta = localCompletedCount - serverCompletedCountInRaw;

  let percentage = unit.percentage;
  if (serverTotalCount > 0) {
    const liveCompleted = Math.max(0, Math.min(serverTotalCount, serverCompletedCount + delta));
    percentage = Math.round((liveCompleted / serverTotalCount) * 100);
  } else if (localTopics.length > 0 && isDirty) {
    percentage = Math.round((localCompletedCount / localTopics.length) * 100);
  }

  return (
    <>
      <div
        className={`rounded-xl px-4 py-3 max-md:p-3 max-md:h-auto ${colors.cardBg} w-full h-[480px] flex flex-col relative`}
      >
      <div 
        className="flex items-center justify-between mb-4 max-md:mb-2 shrink-0 max-md:cursor-pointer"
        onClick={(e) => {
          if (window.innerWidth < 768) setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
          <p className={`text-sm md:text-base font-semibold max-md:text-[15px] max-md:!text-[#4B4B4B] ${colors.accent}`}>
            {unit.unitLabel}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onEditUnit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditUnit({ ...unit, topics: localTopics });
              }}
              className={`${colors.accent} hover:bg-black/5 transition-all p-1.5 rounded-md cursor-pointer max-md:hidden`}
              title="Edit Unit"
            >
              <PencilSimple size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ type: "unit" });
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all p-1.5 rounded-md cursor-pointer max-md:hidden"
            title="Delete Unit"
          >
            <Trash size={20} />
          </button>
          <CaretDown
            className={`hidden max-md:block ${colors.title} transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            size={20}
            weight="bold"
          />
        </div>
      </div>

      <div className="bg-[#F4F4F5] max-md:bg-white/60 max-md:shadow-none rounded-lg max-md:rounded-2xl p-4 max-md:p-3 flex-1 flex flex-col min-h-[300px] max-md:min-h-0 relative overflow-hidden">
        <div className="flex justify-between items-start mb-5 max-md:mb-2">
          <h3
            className={`text-base md:text-lg font-semibold shrink-0 max-md:text-[15px] ${colors.title}`}
          >
            {unit.title}
          </h3>
          <div className="flex items-center gap-1 hidden max-md:flex -mt-1">
            {onEditUnit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditUnit({ ...unit, topics: localTopics });
                }}
                className={`${colors.accent} hover:bg-black/5 transition-all p-1 rounded-md cursor-pointer`}
                title="Edit Unit"
              >
                <PencilSimple size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget({ type: "unit" });
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all p-1 rounded-md cursor-pointer"
              title="Delete Unit"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        <div className="relative w-full h-3 max-md:h-[8px] rounded-full bg-gray-200 overflow-hidden shrink-0 max-md:mb-0">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full shadow transition-all duration-700 max-md:h-2 max-md:w-2"
              style={{ left: `calc(${percentage}% - 7px)` }}
            />
          </div>
        </div>

        {/* Desktop percentage text below progress bar */}
        <div className="flex justify-end text-xs md:text-sm mt-3 mb-4 shrink-0 max-md:hidden">
          <span className={`font-semibold ${colors.accent}`}>
            {percentage}%
          </span>
        </div>

        {/* Mobile clock / percentage bottom stats */}
        <div className="hidden max-md:flex items-center justify-between mt-2.5">
          <div
            className={`flex items-center gap-1.5 text-[10px] font-semibold ${colors.title}`}
          >
            <Clock size={13} weight="fill" className={colors.title} />
            <span>{unit.dateRange || "01-01-1970 - 03-17-2026"}</span>
          </div>
          <span className={`text-[11px] font-bold ${colors.title}`}>
            {percentage}%
          </span>
        </div>

        <div className="relative flex-1 min-h-0 mb-14 max-md:mb-0 max-md:pb-12 overflow-hidden flex flex-col">
          {/* Desktop List */}
          <ul
            className="custom-scrollbar h-[280px] space-y-2 overflow-y-auto pr-2 pb-10 text-xs text-[#3F3F3F] md:text-sm max-md:hidden"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${colors.solidEnd} #f1f5f9`,
            }}
          >
            {localTopics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLocalTopics(prev =>
                        prev.map(t =>
                          t.id === topic.id ? { ...t, isCompleted: !t.isCompleted } : t
                        )
                      );
                      setIsDirty(true);
                      setHasChanges(true);
                    }}
                  >
                    <CheckCircleIcon
                      size={16}
                      weight="fill"
                      className={`${topic.isCompleted ? colors.accent : "text-gray-300"} cursor-pointer`}
                    />
                  </button>
                  <span className={topic.isCompleted ? "" : "text-gray-400"}>
                    {topic.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: "topic", topicId: topic.id })}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all p-1 rounded-md cursor-pointer"
                    title="Delete Topic"
                  >
                    <Trash size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenTopicPdf({
                        topicId: topic.id,
                        topicTitle: topic.title,
                        unitLabel: unit.unitLabel,
                        unitTitle: unit.title,
                      })
                    }
                    className={`${colors.cardBg} rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 cursor-pointer`}
                    aria-label={`Upload PDF for ${topic.title}`}
                  >
                    <FilePdf
                      size={14}
                      className={colors.accent}
                      weight="duotone"
                    />
                  </button>
                </div>
              </li>
            ))}
            
            {isTopicsLoading && localTopics.length === 0 && (
              <>
                <TopicSkeleton />
                <TopicSkeleton />
                <TopicSkeleton />
                <TopicSkeleton />
                <TopicSkeleton />
              </>
            )}

            {hasNextTopics && (
              <div ref={desktopLoadMoreRef} className="flex flex-col w-full">
                {isFetchingNextTopics && (
                  <>
                    <TopicSkeleton />
                    <TopicSkeleton />
                    <TopicSkeleton />
                  </>
                )}
              </div>
            )}
          </ul>

          {/* Mobile Accordion List */}
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
                className="custom-scrollbar hidden max-md:block max-h-[240px] space-y-2 overflow-y-auto pr-2 text-xs text-[#3F3F3F]"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: `${colors.solidEnd} #f1f5f9`,
                }}
              >
                {localTopics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => {
                          setLocalTopics(prev =>
                            prev.map(t =>
                              t.id === topic.id ? { ...t, isCompleted: !t.isCompleted } : t
                            )
                          );
                          setIsDirty(true);
                          setHasChanges(true);
                        }}
                        className="mt-[2px] flex-shrink-0"
                      >
                        <CheckCircleIcon
                          size={16}
                          weight={topic.isCompleted ? "fill" : "regular"}
                          className={`${topic.isCompleted ? colors.accent : "text-gray-400"} transition-colors`}
                        />
                      </button>
                      <span className={topic.isCompleted ? "text-gray-500" : "text-[#3F3F3F]"}>
                        {topic.title}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mt-[2px]">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ type: "topic", topicId: topic.id })}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Topic"
                      >
                        <Trash size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenTopicPdf({
                            topicId: topic.id,
                            topicTitle: topic.title,
                            unitLabel: unit.unitLabel,
                            unitTitle: unit.title,
                          })
                        }
                      >
                        <FilePdf
                          size={16}
                          className={`${colors.accent} flex-shrink-0`}
                          weight="duotone"
                        />
                      </button>
                    </div>
                  </li>
                ))}
                
                {isTopicsLoading && localTopics.length === 0 && (
                  <>
                    <TopicSkeleton />
                    <TopicSkeleton />
                    <TopicSkeleton />
                    <TopicSkeleton />
                    <TopicSkeleton />
                  </>
                )}

                {hasNextTopics && (
                  <div ref={mobileLoadMoreRef} className="flex flex-col w-full">
                    {isFetchingNextTopics && (
                      <>
                        <TopicSkeleton />
                        <TopicSkeleton />
                        <TopicSkeleton />
                      </>
                    )}
                  </div>
                )}
              </motion.ul>
            )}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#F4F4F5] max-md:from-transparent to-transparent pointer-events-none rounded-b-md" />
        </div>

        <div className={`absolute bottom-4 right-4 justify-end shrink-0 max-md:bottom-[8px] max-md:right-[12px] md:flex ${isExpanded ? "flex" : "hidden"}`}>
          <button
            onClick={async () => {
              try {
                await onMarkComplete(unit.id, localTopics, percentage);
                setIsDirty(false);
              } catch (e) {
                // error handled by mutation
              }
            }}
            disabled={!isDirty || isSavingThisUnit}
            className={`border px-4 py-1.5 max-md:px-3 max-md:py-1 rounded-lg text-sm max-md:text-[11px] transition
    ${!isDirty || isSavingThisUnit
                ? "border-[#43C17A] text-[#43C17A] opacity-50 cursor-not-allowed"
                : "border-[#43C17A] text-[#43C17A] hover:bg-[#43C17A]/10 bg-white cursor-pointer"
              }`}
          >
            {isSavingThisUnit ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
        title={deleteTarget?.type === "unit" ? "Delete Unit" : "Delete Topic"}
        customDescription={
          deleteTarget?.type === "unit"
            ? "Are you sure you want to permanently delete this unit and all its topics?"
            : "Are you sure you want to permanently delete this topic?"
        }
        onConfirm={async () => {
          try {
            setIsDeleting(true);
            if (deleteTarget?.type === "unit") {
              await onDeleteUnit(unit.id);
            } else if (deleteTarget?.type === "topic" && deleteTarget.topicId) {
              await onDeleteTopic(unit.id, deleteTarget.topicId);
            }
            setDeleteTarget(null);
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}

