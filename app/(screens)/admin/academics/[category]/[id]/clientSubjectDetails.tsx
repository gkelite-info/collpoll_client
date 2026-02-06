"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CaretLeft,
  CalendarBlank,
  CheckCircle,
  FilePdf,
  FloppyDisk,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  getAdminSubjectDetails,
  updateUnitProgress,
  UiUnit,
  UiTopic,
  SubjectContext,
} from "@/lib/helpers/admin/academics/adminUnitActions";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import toast from "react-hot-toast";
import { SubjectDetailsSkeleton } from "../../shimmer/subjectDetailsSkeleton";
import AddNewClassModal from "../../modal/addNewClassModal";

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
  year: string;
  onAddUnit: () => void;
};

function FilterBanner({
  subjectName,
  semester,
  year,
  onAddUnit,
}: FilterBannerProps) {
  return (
    <div className="bg-blue-00 mb-4 flex flex-col gap-4 w-full">
      <div className="w-full flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Subject :</p>
          <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {subjectName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Semester :</p>
          <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            Sem {semester}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Year :</p>
          <div className="flex items-center justify-center px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            <p>{year}</p>
          </div>
        </div>

        <button
          onClick={onAddUnit}
          className="ml-auto cursor-pointer bg-[#43C17A] text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-[#3bad6d] shadow-sm transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Unit
        </button>
      </div>
    </div>
  );
}

function UnitCard({ unit, onSave }: { unit: UiUnit; onSave: any }) {
  const colors = colorMap[unit.color] || colorMap.purple;
  const [localTopics, setLocalTopics] = useState<UiTopic[]>(unit.topics);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalTopics(unit.topics);
  }, [unit.topics]);

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
    <div
      className={`rounded-xl px-4 py-3 ${colors.cardBg} w-full h-full flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <div className="font-semibold text-md flex w-full justify-between items-center text-[#282828]">
          {unit.unitLabel}
          {hasChanges && (
            <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-bold animate-pulse text-red-500">
              Unsaved
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 h-full flex flex-col min-h-[300px] relative">
        <h3
          className={`text-base md:text-lg font-semibold mb-3 ${colors.title} line-clamp-2`}
        >
          {unit.title || "Untitled Unit"}
        </h3>

        <div className="flex items-center justify-between text-xs md:text-sm mb-2">
          <div className="flex items-center gap-2 text-[#6C6C6C]">
            <CalendarBlank size={16} className={colors.accent} />
            <span>{unit.dateRange}</span>
          </div>
          <span
            className={`font-semibold transition-colors duration-300 ${hasChanges ? colors.accent : "text-[#333333]"}`}
          >
            {localPercentage}%
          </span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${localPercentage}%`,
              background: `linear-gradient(to right, ${colors.fadeStart}, ${colors.solidEnd})`,
            }}
          />
        </div>

        <ul className="flex-1 space-y-2 text-xs md:text-sm text-[#3F3F3F] overflow-y-auto pr-1 custom-scrollbar pb-12">
          {localTopics.length > 0 ? (
            localTopics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-start justify-between gap-2"
              >
                <div
                  className="flex items-start gap-2 cursor-pointer group"
                  onClick={() => handleLocalToggle(topic.id)}
                >
                  <button className="mt-[2px] transition-colors cursor-pointer">
                    <CheckCircle
                      size={16}
                      weight="fill"
                      className={
                        topic.isCompleted
                          ? colors.accent
                          : "text-gray-300 group-hover:text-gray-400"
                      }
                    />
                  </button>
                  <span
                    className={`transition-colors duration-200 select-none ${
                      topic.isCompleted ? "text-[#3F3F3F]" : "text-gray-400"
                    }`}
                  >
                    {topic.title}
                  </span>
                </div>
                <div
                  className={`${colors.cardBg} cursor-pointer rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0`}
                >
                  <FilePdf
                    size={16}
                    className={`${colors.accent}`}
                    weight="duotone"
                  />
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic text-center py-4">
              No topics found.
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
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<UiUnit[]>([]);
  const [headerInfo, setHeaderInfo] = useState<any>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [context, setContext] = useState<SubjectContext | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const init = async () => {
    if (!userId || !subjectId) return;
    try {
      setLoading(true);
      const ctx = await fetchAdminContext(userId);
      setAdminId(ctx.adminId);

      const data = await getAdminSubjectDetails(
        ctx.collegeId,
        subjectId,
        sectionId,
      );

      if (data) {
        setUnits(data.units);
        setHeaderInfo(data.details);
        setContext(data.context);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subject details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [userId, subjectId]);

  const handleSaveUnit = async (
    unitId: number,
    changedTopics: { topicId: number; isCompleted: boolean }[],
  ) => {
    if (!adminId) return;
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
        toast.success("Progress Saved!");
      }
    } catch (error) {
      toast.error("Failed to save progress");
    }
  };

  const handleBack = () => router.back();
  const handleRefresh = () => {
    init();
  };

  if (loading) return <SubjectDetailsSkeleton />;
  if (!headerInfo)
    return <div className="p-10 text-center">Subject not found</div>;

  return (
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
          <p className="text-[#525252] text-sm ml-5">
            Credits: {headerInfo.credits}
          </p>
        </div>
        <div className="flex justify-end w-[32%] items-center gap-4">
          <CourseScheduleCard style="w-[320px]" />
        </div>
      </div>

      <FilterBanner
        subjectName={headerInfo.subjectName}
        semester={headerInfo.semester}
        year={headerInfo.year}
        onAddUnit={() => setIsModalOpen(true)}
      />

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x mt-8">
        {units.length > 0 ? (
          units.map((unit) => (
            <div
              key={unit.id}
              className="min-w-[320px] w-[350px] shrink-0 snap-start h-full"
            >
              <UnitCard unit={unit} onSave={handleSaveUnit} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 text-gray-400">
            No syllabus units available. Click "Add Unit" to start.
          </div>
        )}
      </div>

      <AddNewClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRefresh}
        prefilledContext={context}
      />
    </div>
  );
}
