"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CaretLeft,
  CheckCircle,
  FilePdf,
  FloppyDisk,
  ArrowCounterClockwise,
  Trash,
  PencilSimple,
} from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  getAdminSubjectDetails,
  updateUnitProgress,
  deleteUnit,
  deleteTopic,
  UiUnit,
  UiTopic,
  SubjectContext,
} from "@/lib/helpers/admin/academics/adminUnitActions";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import toast, { Toaster } from "react-hot-toast";
import { SubjectDetailsSkeleton } from "../../shimmer/subjectDetailsSkeleton";
import AddNewClassModal from "../../modal/addNewClassModal";
import AddWeightageModal from "@/app/(screens)/faculty/academics/components/weightageModal";
import { TopicPdfModal } from "@/app/(screens)/faculty/academics/modal/Topicpdfmodal";
import { isSchoolOrInterSubject } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { getUnitsPaginated } from "@/lib/helpers/faculty/getUnitsPaginated";
import { getTopicsPaginated } from "@/lib/helpers/faculty/getTopicsPaginated";
import { useInView } from "react-intersection-observer";
import { UnitCardSkeleton } from "@/app/(screens)/faculty/academics/components/subjectDetailsSkeleton";
import EditUnitModal from "@/app/(screens)/faculty/academics/modal/EditUnitModal";
import type { Unit } from "@/app/(screens)/faculty/academics/components/unitCard";

const colorMap = {
  purple: {
    cardBg: "bg-[#E9E3FFF5]",
    dot: "bg-[#A66BFF]",
    title: "text-[#3B2A91]",
    accent: "text-[#7E5DFF]",
    button: "bg-[#7E5DFF] hover:bg-[#6a4ce0]",
    fadeStart: "rgba(126,93,255,0.25)",
    solidEnd: "#7E5DFF",
  },
  orange: {
    cardBg: "bg-[#FFEDDA]",
    dot: "bg-[#FFAE4C]",
    title: "text-[#A35300]",
    accent: "text-[#FF8A2A]",
    button: "bg-[#FF8A2A] hover:bg-[#e5761b]",
    fadeStart: "rgba(255,138,42,0.25)",
    solidEnd: "#FF8A2A",
  },
  blue: {
    cardBg: "bg-[#CEE6FF]",
    dot: "bg-[#68A4FF]",
    title: "text-[#22518F]",
    accent: "text-[#4C8DFF]",
    button: "bg-[#4C8DFF] hover:bg-[#3b76e0]",
    fadeStart: "rgba(76,141,255,0.25)",
    solidEnd: "#4C8DFF",
  },
} as const;

type FilterBannerProps = {
  subjectName: string;
  semester: string;
  credits?: number | null;
  year: string;
  onAddUnit: () => void;
  onAddWeightage: () => void;
  onManageWeightage: () => void;
  isSchool?: boolean;
};

function FilterBanner({
  subjectName,
  semester,
  credits,
  year,
  onAddUnit,
  onAddWeightage,
  onManageWeightage,
  isSchool,
}: FilterBannerProps) {
  return (
    <div className="bg-blue-00 mb-4 flex flex-col gap-4 w-full">
      <div className="bg-blue-00 w-full flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-start space-x-6 bg-red-00">
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-sm">Subject :</p>
            <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
              {subjectName}
            </p>
          </div>

          {!isSchool && (
            <>
              <div className="flex items-center gap-2">
                <p className="text-[#525252] text-sm">Semester :</p>
                <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
                  {/^(sem|semester)\s/i.test(semester) ? semester : `Sem ${semester}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-[#525252] text-sm">Credits :</p>
                <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
                  {credits ?? "N/A"}
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-sm">Year :</p>
            <div className="flex items-center justify-center px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
              <p>{year}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-red-00 space-x-3">
          <button
            onClick={onAddWeightage}
            className="ml-auto cursor-pointer bg-[#43C17A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3bad6d] shadow-sm transition-colors flex items-center gap-2"
          >
            + Add weightage
          </button>

          <button
            onClick={onAddUnit}
            className="ml-auto cursor-pointer bg-[#43C17A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3bad6d] shadow-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Unit
          </button>
        </div>
      </div>
    </div>
  );
}



function UnitCard({
  unit,
  onSave,
  onDeleteUnit,
  onDeleteTopic,
  onEditUnit,
  onOpenTopicPdf,
}: {
  unit: UiUnit;
  onSave: any;
  onDeleteUnit: any;
  onDeleteTopic: any;
  onEditUnit: (unit: UiUnit) => void;
  onOpenTopicPdf: (payload: {
    unitLabel: string;
    unitTitle: string;
    topicId: number;
    topicTitle: string;
  }) => void;
}) {
  const colors = colorMap[unit.color] || colorMap.purple;
  const [localTopics, setLocalTopics] = useState<UiTopic[]>(unit.topics);
  const topicsPerPage = 10;
  const [visibleTopicCount, setVisibleTopicCount] = useState(topicsPerPage);
  const { ref: topicLoadMoreRef, inView: topicLoadMoreInView } = useInView({
    rootMargin: "80px",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "unit" | "topic";
    id?: number;
  } | null>(null);

  useEffect(() => {
    setLocalTopics(unit.topics);
    setVisibleTopicCount(topicsPerPage);
  }, [unit.topics]);

  useEffect(() => {
    if (topicLoadMoreInView && visibleTopicCount < localTopics.length) {
      setVisibleTopicCount((count) =>
        Math.min(count + topicsPerPage, localTopics.length),
      );
    }
    // One topic page is revealed each time the sentinel enters the list viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicLoadMoreInView, localTopics.length]);

  const visibleTopics = localTopics.slice(0, visibleTopicCount);

  const hasChanges = useMemo(() => {
    return JSON.stringify(localTopics) !== JSON.stringify(unit.topics);
  }, [localTopics, unit.topics]);

  const handleLocalToggle = (topicId: number) => {
    setLocalTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );
  };

  const handleDiscard = () => {
    setLocalTopics(unit.topics);
    toast("Changes discarded", { icon: "↩️" });
  };

  const localPercentage = useMemo(() => {
    const total = localTopics.length;
    const completed = localTopics.filter((t) => t.isCompleted).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [localTopics]);

  const handleSaveClick = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    const changedTopics = localTopics
      .filter((lt) => {
        const original = unit.topics.find((ot) => ot.id === lt.id);
        return original && original.isCompleted !== lt.isCompleted;
      })
      .map((t) => ({ topicId: t.id, isCompleted: t.isCompleted }));

    await onSave(unit.id, changedTopics);
    setIsSaving(false);
  };

  return (
    <>
      <div
        className={`rounded-xl px-4 py-3 ${colors.cardBg} w-full h-[560px] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            <div className={`font-semibold text-md flex items-center gap-2 ${colors.accent}`}>
              {unit.unitLabel}
              {hasChanges && (
                <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-bold animate-pulse text-red-500">
                  Unsaved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditUnit({ ...unit, topics: localTopics })}
              className={`${colors.accent} hover:bg-white/60 transition-all p-1.5 rounded-md cursor-pointer`}
              title="Edit Unit"
            >
              <PencilSimple size={20} />
            </button>
            <button
              onClick={() => setDeleteTarget({ type: "unit" })}
              className="text-red-500 hover:text-red-600 hover:bg-white/60 transition-all p-1.5 rounded-md cursor-pointer"
              title="Delete Unit"
            >
              <Trash size={20} weight="regular" />
            </button>
          </div>
        </div>

        <div className="bg-[#F4F4F5] rounded-lg p-4 flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <h3
            className={`text-base md:text-lg font-semibold mb-5 ${colors.title} line-clamp-2`}
          >
            {unit.title || "Untitled Unit"}
          </h3>

          <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${localPercentage}%`,
                background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
              }}
            />
          </div>

          <div className="flex justify-end text-xs md:text-sm mt-3 mb-4">
            <span className={`font-semibold transition-colors duration-300 ${colors.accent}`}>
              {localPercentage}%
            </span>
          </div>

          <ul
            className="custom-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto pr-2 text-xs text-[#3F3F3F] md:text-sm"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${colors.solidEnd} #f1f5f9`,
            }}
          >
            {localTopics.length > 0 ? (
              visibleTopics.map((topic) => (
                <li
                  key={topic.id}
                  className="flex items-start justify-between gap-2 group/topic py-1 -my-1 rounded-md hover:bg-gray-50 transition-colors px-1"
                >
                  <div
                    className="flex items-start gap-2 cursor-pointer flex-1"
                    onClick={() => handleLocalToggle(topic.id)}
                  >
                    <button className="mt-[2px] transition-colors cursor-pointer shrink-0">
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className={
                          topic.isCompleted
                            ? colors.accent
                            : "text-gray-300 hover:text-gray-400"
                        }
                      />
                    </button>
                    <span
                      className={`transition-colors duration-200 select-none pt-0.5 ${topic.isCompleted ? "text-[#3F3F3F]" : "text-gray-400"}`}
                    >
                      {topic.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: "topic", id: topic.id });
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all p-1.5 rounded-md opacity-0 group-hover/topic:opacity-100 cursor-pointer"
                      title="Delete Topic"
                    >
                      <Trash size={15} weight="regular" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTopicPdf({
                          unitLabel: unit.unitLabel,
                          unitTitle: unit.title,
                          topicId: topic.id,
                          topicTitle: topic.title,
                        });
                      }}
                      className={`${colors.cardBg} rounded-full h-6 w-6 flex items-center justify-center cursor-pointer hover:opacity-90 transition`}
                      title="Manage topic PDFs"
                    >
                      <FilePdf
                        size={14}
                        className={colors.accent}
                        weight="duotone"
                      />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic text-center py-4">
                No topics found.
              </li>
            )}
            {visibleTopicCount < localTopics.length && (
              <li ref={topicLoadMoreRef} className="space-y-2 py-1">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex animate-pulse items-center gap-2">
                    <div className="h-4 w-4 shrink-0 rounded-full bg-gray-200" />
                    <div className="h-3 flex-1 rounded bg-gray-200" />
                    <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                  </div>
                ))}
              </li>
            )}
          </ul>

          <div
            className={`absolute bottom-4 left-0 w-full px-4 flex gap-2 transition-all duration-300 ${hasChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="flex-1 py-2 cursor-pointer rounded-lg text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowCounterClockwise size={16} /> Discard
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className={`flex-[2] py-2 cursor-pointer rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1 ${colors.button} ${isSaving ? "opacity-70 cursor-wait" : ""}`}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <FloppyDisk size={16} /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isSaving}
        title="Delete"
        name={deleteTarget?.type === "unit" ? "Unit" : "Topic"}
        customDescription={
          deleteTarget?.type === "unit"
            ? "Are you sure you want to permanently delete this unit and all its topics?"
            : "Are you sure you want to permanently delete this topic?"
        }
        onConfirm={async () => {
          setIsSaving(true);
          if (deleteTarget?.type === "unit") {
            await onDeleteUnit(unit.id);
          } else if (deleteTarget?.type === "topic" && deleteTarget.id) {
            await onDeleteTopic(unit.id, deleteTarget.id);
          }
          setIsSaving(false);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

export default function ClientSubjectDetails({
  subjectId,
}: {
  subjectId: number;
}) {
  const router = useRouter();
  const { category } = useParams();
  const sectionId = parseInt(category as string, 10);
  const subjectSectionKey = `${subjectId}:${sectionId}`;
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<UiUnit[]>([]);
  const [headerInfo, setHeaderInfo] = useState<any>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [context, setContext] = useState<SubjectContext | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeightageOpen, setIsWeightageOpen] = useState(false);
  const [facultyCtx, setFacultyCtx] = useState<any>(null);
  const [isWeightageModalOpen, setIsWeightageModalOpen] = useState(false);
  const [selectedTopicPdf, setSelectedTopicPdf] = useState<{
    unitLabel: string;
    unitTitle: string;
    topicId: number;
    topicTitle: string;
  } | null>(null);
  const [editingUnit, setEditingUnit] = useState<UiUnit | null>(null);
  const [nextUnitsPage, setNextUnitsPage] = useState<number | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "200px" });

  const fetchUnitsPage = async (collegeId: number, page: number) => {
    const unitsResult = await getUnitsPaginated({
      collegeId,
      collegeSubjectId: subjectId,
      collegeSectionsId: sectionId,
      page,
      limit: 3,
    });

    const pageUnits = await Promise.all(
      unitsResult.units.map(async (unit) => {
        const topicsResult = await getTopicsPaginated({
          collegeId,
          collegeSubjectUnitId: unit.id,
          collegeSectionsId: sectionId,
          page: 1,
          limit: 100,
        });
        return { ...unit, topics: topicsResult.topics } as UiUnit;
      }),
    );

    return { units: pageUnits, nextCursor: unitsResult.nextCursor };
  };

  const init = async () => {
    if (!userId || !subjectId) return;
    try {
      setLoading(true);
      const ctx = await fetchAdminContext(userId);

      setAdminId(ctx.adminId);
      setFacultyCtx(ctx);

      const data = await getAdminSubjectDetails(
        ctx.collegeId,
        subjectId,
        sectionId,
      );

      if (data) {
        // Use the same section/global resolution used by Faculty Academics.
        const firstPage = await fetchUnitsPage(ctx.collegeId, 1);
        setUnits(firstPage.units);
        setNextUnitsPage(firstPage.nextCursor);
        setHeaderInfo(data.details);
        setContext(data.context);
      }
    } catch (error) {
      toast.error("Failed to load subject details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [userId, subjectSectionKey]);

  useEffect(() => {
    if (
      !inView ||
      !nextUnitsPage ||
      !facultyCtx?.collegeId ||
      loadingMoreRef.current
    ) return;

    const loadNextPage = async () => {
      try {
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
        const nextPage = await fetchUnitsPage(facultyCtx.collegeId, nextUnitsPage);
        setUnits((current) => {
          const existingIds = new Set(current.map((unit) => unit.id));
          return [...current, ...nextPage.units.filter((unit) => !existingIds.has(unit.id))];
        });
        setNextUnitsPage(nextPage.nextCursor);
      } catch {
        toast.error("Failed to load more units");
      } finally {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    };
    loadNextPage();
  }, [inView, nextUnitsPage, facultyCtx?.collegeId, isLoadingMore]);

  const handleSaveUnit = async (
    unitId: number,
    changedTopics: { topicId: number; isCompleted: boolean }[],
  ) => {
    if (!adminId) {
      toast.error("Admin session is unavailable. Please sign in again.");
      return;
    }
    const savingToastId = toast.loading("Saving progress...");
    try {
      const result = await updateUnitProgress(unitId, changedTopics, adminId);
      if (result.success) {
        setUnits((prevUnits) =>
          prevUnits.map((unit) => {
            if (unit.id === unitId) {
              const newTopics = unit.topics.map((t) => {
                const change = changedTopics.find((c) => c.topicId === t.id);
                return change ? { ...t, isCompleted: change.isCompleted } : t;
              });
              return {
                ...unit,
                topics: newTopics,
                percentage: result.newPercentage,
              };
            }
            return unit;
          }),
        );
        toast.success("Progress saved successfully", { id: savingToastId });
      }
    } catch (error) {
      toast.error("Failed to save progress", { id: savingToastId });
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!adminId) {
      toast.error("Admin session is unavailable. Please sign in again.");
      return;
    }
    const toastId = toast.loading("Deleting unit...");
    const res = await deleteUnit(unitId, adminId);
    if (res.success) {
      toast.success("Unit deleted successfully", { id: toastId });
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
    } else {
      toast.error(res.error || "Failed to delete unit", { id: toastId });
    }
  };

  const handleDeleteTopic = async (unitId: number, topicId: number) => {
    if (!adminId) {
      toast.error("Admin session is unavailable. Please sign in again.");
      return;
    }
    const toastId = toast.loading("Deleting topic...");
    const res = await deleteTopic(unitId, topicId, adminId);
    if (res.success) {
      toast.success("Topic deleted successfully", { id: toastId });
      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (unit.id === unitId) {
            return {
              ...unit,
              topics: unit.topics.filter((t) => t.id !== topicId),
              percentage: res.newPercentage ?? unit.percentage,
            };
          }
          return unit;
        }),
      );
    } else {
      toast.error(res.error || "Failed to delete topic", { id: toastId });
    }
  };

  const handleBack = () => router.back();

  const handleRefresh = () => {
    init();
  };

  const isSchoolOrInter = isSchoolOrInterSubject(context?.educationType);

  if (loading) return <SubjectDetailsSkeleton />;
  if (!headerInfo)
    return <div className="p-10 text-center">Subject not found</div>;

  return (
    <>
    <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
    <div className="w-full px-4 bg-[#F5F5F7] min-h-screen pt-4 pb-10">
      <div className="flex justify-between items-center mb-5 w-full">
        <div className="flex flex-col w-[50%]">
          <div className="flex items-center gap-1">
            <button className="cursor-pointer" onClick={handleBack}>
              <CaretLeft size={23} className="-ml-1.5 text-black" />
            </button>
            <h1 className="text-[#282828] font-semibold text-2xl mb-1">
              {headerInfo.subjectName}
            </h1>
          </div>
        </div>
        <div className="flex justify-end w-[32%] items-center gap-4">
          <CourseScheduleCard style="w-[320px]" isVisibile={false} />
        </div>
      </div>
      <FilterBanner
        subjectName={headerInfo.subjectName}
        semester={headerInfo.semester ?? "N/A"}
        credits={headerInfo.credits}
        year={headerInfo.year}
        isSchool={isSchoolOrInter}
        onAddUnit={() => setIsModalOpen(true)}
        onManageWeightage={() => setIsWeightageModalOpen(true)}
        onAddWeightage={() => setIsWeightageModalOpen(true)}
      />
      <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x mt-8 max-md:flex-col max-md:overflow-x-visible max-md:pb-0">
        {units.length > 0 ? (
          units.map((unit) => (
            <div
              key={unit.id}
              className="min-w-[320px] w-[350px] shrink-0 snap-start h-[560px]"
            >
              <UnitCard
                unit={unit}
                onSave={handleSaveUnit}
                onDeleteUnit={handleDeleteUnit}
                onDeleteTopic={handleDeleteTopic}
                onEditUnit={setEditingUnit}
                onOpenTopicPdf={setSelectedTopicPdf}
              />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 text-gray-400">
            No syllabus units available. Click "Add Unit" to start.
          </div>
        )}
        {nextUnitsPage && (
          <div
            ref={loadMoreRef}
            className="min-w-[320px] w-[350px] shrink-0 snap-start"
          >
            <UnitCardSkeleton />
          </div>
        )}
      </div>

      <AddNewClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefresh}
        prefilledContext={context}
        existingUnitNumbers={units.map((u) =>
          parseInt(u.unitLabel.replace(/\D/g, ""), 10),
        )}
      />
      {facultyCtx && headerInfo && (
        <AddWeightageModal
          isOpen={isWeightageModalOpen}
          onClose={() => setIsWeightageModalOpen(false)}
          facultyCtx={{
            ...facultyCtx,
            facultyId: context?.facultyId,
            faculty_edu_type: context?.educationType,
            collegeEducationId: context?.educationId,
            collegeBranchId: context?.branchId ?? null,
            academicYearIds: context?.academicYearId ? [context.academicYearId] : [],
            subjectIds: [subjectId],
            sectionIds: [sectionId],
            sectionName: context?.sectionName
          }}
          role="Faculty"
          initialSubjectId={subjectId}
          initialSectionId={sectionId}
        />
      )}

      <TopicPdfModal
        isOpen={!!selectedTopicPdf}
        onClose={() => setSelectedTopicPdf(null)}
        unitLabel={selectedTopicPdf?.unitLabel ?? ""}
        unitTitle={selectedTopicPdf?.unitTitle ?? ""}
        topicTitle={selectedTopicPdf?.topicTitle ?? ""}
        topicId={selectedTopicPdf?.topicId ?? 0}
      />
      {context && editingUnit && (
        <EditUnitModal
          isOpen={!!editingUnit}
          unit={editingUnit as Unit}
          details={{
            collegeId: context.collegeId,
            collegeSubjectId: subjectId,
            collegeSectionId: sectionId,
            subjectTitle: headerInfo.subjectName,
          }}
          actorContext={{
            facultyId: context.facultyId,
            educationId: context.educationId,
            branchId: context.branchId,
            branchCode: context.branchCode,
            educationType: context.educationType,
          }}
          onClose={() => {
            setEditingUnit(null);
            init();
          }}
        />
      )}
    </div>
    </>
  );
}
