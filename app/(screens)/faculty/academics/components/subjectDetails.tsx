"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { TopicPdfModal } from "@/app/(screens)/faculty/academics/modal/Topicpdfmodal";
import toast from "react-hot-toast";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useUser } from "@/app/utils/context/UserContext";
import { CardProps } from "@/lib/types/faculty";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { getUnitsPaginated } from "@/lib/helpers/faculty/getUnitsPaginated";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { SubjectDetailsSkeleton, UnitCardSkeleton } from "./subjectDetailsSkeleton";
import { saveUnitProgress } from "@/lib/helpers/faculty/saveUnitProgress";
import { deleteUnitAction } from "@/lib/helpers/faculty/deleteUnitAction";
import { deleteTopicAction } from "@/lib/helpers/faculty/deleteTopicAction";
import EditUnitModal from "@/app/(screens)/faculty/academics/modal/EditUnitModal";

type FilterBannerProps = {
  filterBannerDetails: CardProps;
};
function FilterBanner({ filterBannerDetails }: FilterBannerProps) {
  const { subjectTitle, semester, year, sectionName } = filterBannerDetails;
  const { faculty_edu_type } = useFaculty();
  const isSchool = isSchoolEducation(faculty_edu_type);

  return (
    <div className="mb-4 flex flex-col gap-4">
      <div className="flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Subject :</p>
          <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {subjectTitle}
          </p>
        </div>
        {!(faculty_edu_type === "Inter" || isSchool) && (
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-sm">Semester :</p>
            <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
              {semester}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <p className="text-[#525252] text-sm">Year :</p>
          <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
            {year}
          </p>
        </div>
        {sectionName && sectionName !== "-" && (
          <div className="flex items-center gap-2">
            <p className="text-[#525252] text-sm">Section :</p>
            <p className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
              {sectionName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type SubjectDetailsCardProps = {
  details: CardProps;
  onBack: () => void;
};

import { UnitCard, Unit, UnitTopic, TopicPdfSelection } from "./unitCard";

export function SubjectDetailsCard({
  details,
  onBack,
}: SubjectDetailsCardProps) {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingUnitId, setLoadingUnitId] = useState<number | null>(null);
  const { facultyId } = useUser();
  const [selectedTopicPdf, setSelectedTopicPdf] =
    useState<TopicPdfSelection | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const { ref: loadMoreRef, inView } = useInView();

  const queryKey = [
    "subjectUnitsInfinite",
    details.collegeId,
    details.collegeSubjectId,
    details.collegeSectionId,
  ];

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getUnitsPaginated({
        collegeId: details.collegeId,
        collegeSubjectId: details.collegeSubjectId,
        collegeSectionsId: details.collegeSectionId,
        page: pageParam,
        limit: 3,
      });

      return {
        ...result,
        units: result.units.map((u: any) => ({
          ...u,
          lessons: [],
          topics: [], // We will fetch topics inside the UnitCard individually
        })) as Unit[],
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
    enabled: !!(details.collegeId && details.collegeSubjectId),
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const units = data?.pages.flatMap((page) => page.units) ?? [];

  const saveMutation = useMutation({
    mutationFn: async ({
      unitId,
      percentage,
      topics,
      collegeSectionId
    }: {
      unitId: number;
      percentage: number;
      topics: UnitTopic[];
      collegeSectionId?: number;
    }) => {
      const formattedTopics = topics.map((t) => ({
        id: t.id,
        isCompleted: t.isCompleted,
      }));
      const result = await saveUnitProgress(unitId, percentage, formattedTopics, collegeSectionId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success("Progress saved successfully");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["facultySubjectsPaginated"] });
      queryClient.invalidateQueries({ queryKey: ["unitTopics", variables.unitId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setLoadingUnitId(null);
    },
  });

  const handleMarkComplete = async (
    unitId: number,
    topics: UnitTopic[],
    percentage: number,
  ) => {
    setLoadingUnitId(unitId);
    return saveMutation.mutateAsync({ unitId, topics, percentage, collegeSectionId: details.collegeSectionId });
  };

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: number) => {
      const res = await deleteUnitAction(unitId);
      if (!res.success) throw new Error(res.error || "Failed to delete unit");
      return res;
    },
    onSuccess: () => {
      toast.success("Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      console.error("Failed to delete unit:", err);
      toast.error(err?.message || "Failed to delete unit");
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async ({ unitId, topicId }: { unitId: number; topicId: number }) => {
      const res = await deleteTopicAction(unitId, topicId);
      if (!res.success) throw new Error(res.error || "Failed to delete topic");
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success("Topic deleted successfully");
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["unitTopics", variables.unitId] });
    },
    onError: (err: any) => {
      console.error("Failed to delete topic:", err);
      toast.error(err?.message || "Failed to delete topic");
    },
  });

  const handleDeleteUnit = async (unitId: number) => {
    if (!facultyId) {
      toast.error("Faculty not authenticated");
      return;
    }
    await deleteUnitMutation.mutateAsync(unitId);
  };

  const handleDeleteTopic = async (unitId: number, topicId: number) => {
    await deleteTopicMutation.mutateAsync({ unitId, topicId });
  };
  return (
    <div className="w-full px-4 min-h-screen">
      <button
        onClick={onBack}
        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[#7153E1] hover:text-[#5436c8] font-medium transition"
      >
        <ArrowLeft size={18} weight="bold" />
        Go Back
      </button>
      <div className="flex justify-between items-start mb-4">
        <FilterBanner filterBannerDetails={details} />
      </div>

      <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x mt-8 max-md:flex-col max-md:overflow-x-visible max-md:pb-0">
        {loading ? (
          <div className="flex justify-center w-full">
            <SubjectDetailsSkeleton count={3} />
          </div>
        ) : units.length > 0 ? (
          <>
            {units.map((unit) => (
              <div
                key={`unit-${unit.id}`}
                className="min-w-[85vw] w-[85vw] md:min-w-[320px] md:w-[350px] shrink-0 snap-start max-md:min-w-0 max-md:w-full max-md:h-auto"
              >
                <UnitCard
                  unit={unit}
                  onMarkComplete={handleMarkComplete}
                  onDeleteUnit={handleDeleteUnit}
                  onDeleteTopic={handleDeleteTopic}
                  onEditUnit={setEditingUnit}
                  onOpenTopicPdf={setSelectedTopicPdf}
                  setHasChanges={setHasChanges}
                  loadingUnitId={loadingUnitId}
                  collegeSectionId={details.collegeSectionId}
                  collegeId={details.collegeId}
                />
              </div>
            ))}
            {hasNextPage && (
              <div ref={loadMoreRef} className="shrink-0 flex items-center justify-center">
                {isFetchingNextPage ? <UnitCardSkeleton /> : <div className="w-10"></div>}
              </div>
            )}
          </>
        ) : (
          <div className="text-black text-center w-full py-5">{error ? "Unable to load units at this time. Please try again." : "No units available."}</div>
        )}
      </div>

      <TopicPdfModal
        isOpen={selectedTopicPdf !== null}
        onClose={() => setSelectedTopicPdf(null)}
        unitLabel={selectedTopicPdf?.unitLabel ?? ""}
        unitTitle={selectedTopicPdf?.unitTitle ?? ""}
        topicTitle={selectedTopicPdf?.topicTitle ?? ""}
        topicId={selectedTopicPdf?.topicId ?? 0}
      />

      <EditUnitModal
        isOpen={!!editingUnit}
        onClose={() => setEditingUnit(null)}
        unit={editingUnit}
        details={{
          collegeId: details.collegeId,
          collegeSubjectId: details.collegeSubjectId,
          collegeSectionId: details.collegeSectionId,
          subjectTitle: details.subjectTitle,
        }}
      />
    </div>
  );
}




