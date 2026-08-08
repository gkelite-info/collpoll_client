import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { updateCollegeSubjectUnitWithTopics } from "@/lib/helpers/faculty/updateCollegeSubjectUnitWithTopics";
import { generateTopicNotesBatchAction } from "@/lib/helpers/faculty/ai/generateTopicNotes.server";
import { buildTopicPdfFile } from "@/lib/helpers/faculty/ai/generateTopicPdf.client";
import { uploadTopicResource } from "@/lib/helpers/faculty/topicResources";
import { useQueryClient } from "@tanstack/react-query";
import { hasGenericTopicNotes, runWhenBrowserIsIdle, INVALID_UNIT_MESSAGE } from "../utils/addNewCardHelpers";

type UseUnitUpdateProps = {
  collegeId: number | null | undefined;
  facultyId: number | null;
  faculty_edu_type: string | null | undefined;
  educations: any[];
  branches: any[];
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  setAvailableTopics: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onGeneratingStart?: () => void;
  onGeneratingEnd?: () => void;
  router: any;
  existingUnits: any[];
  editingUnitId: number;
  initialTopicTitles: string[];
};

export function useUnitUpdate({
  collegeId,
  facultyId,
  faculty_edu_type,
  educations,
  branches,
  formData,
  setFormData,
  selectedTopics,
  setSelectedTopics,
  setAvailableTopics,
  onClose,
  onGeneratingStart,
  onGeneratingEnd,
  router,
  existingUnits,
  editingUnitId,
  initialTopicTitles,
}: UseUnitUpdateProps) {
  const [isSaving, setIsSaving] = useState(false);
  const pdfGenerationKeysRef = useRef<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (isSaving) return;

    if (!collegeId || !facultyId) {
      toast.error("Not authenticated properly");
      return;
    }

    if (!formData.unitName.trim()) {
      toast.error("Please enter unit name");
      return;
    }

    if (!formData.unitNumber || formData.unitNumber < 1) {
      toast.error("Please enter a valid unit number");
      return;
    }

    // Validation checks for duplicates are now strictly handled by the robust backend layer (updateCollegeSubjectUnitWithTopics) 
    // per-section to correctly allow local overrides of global units without throwing false positives.

    const validTopics = selectedTopics.filter((t) => t !== INVALID_UNIT_MESSAGE);

    if (validTopics.length === 0) {
      toast.error("Please add at least one valid topic");
      return;
    }

    const loadingToastId = toast.loading("Updating unit...");
    try {
      setIsSaving(true);

      const unitResult = await updateCollegeSubjectUnitWithTopics({
        collegeSubjectUnitId: editingUnitId,
        collegeId,
        collegeSubjectId: formData.subjectId,
        createdBy: facultyId,
        unitNumber: formData.unitNumber,
        unitTitle: formData.unitName,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        topics: validTopics,
        collegeSectionsId: formData.sectionIds[0], // Edit applies only to the single section the unit belongs to
      });

      const selectedEducationType =
        educations.find((e) => e.collegeEducationId === formData.educationId)
          ?.collegeEducationType ?? faculty_edu_type ?? "Education";
      const selectedBranch =
        branches.find((b) => b.collegeBranchId === formData.branchId)
          ?.collegeBranchCode ?? "Branch";

      // Find NEW topics that were just added
      const initialSet = new Set(initialTopicTitles.map(t => t.trim().toLowerCase()));
      const newTopicsForPdf = validTopics.filter(t => !initialSet.has(t.trim().toLowerCase()));

      // Map newly added topics to their generated IDs
      const uniqueTopicsForPdf = newTopicsForPdf.map(title => {
        const matchingDbTopic = unitResult.topics.find((t: any) => t.topicTitle.trim().toLowerCase() === title.trim().toLowerCase());
        return {
          topicTitle: title,
          topicId: matchingDbTopic?.collegeSubjectUnitTopicId,
        };
      }).filter(t => t.topicId); // Only process if ID was found

      if (uniqueTopicsForPdf.length > 0) {
        const pdfGenerationKey = [
          unitResult.collegeSubjectUnitId,
          ...uniqueTopicsForPdf.map(t => t.topicId),
        ].join(":");

        if (pdfGenerationKeysRef.current.has(pdfGenerationKey)) {
          toast.success("Unit updated successfully. PDFs are already generating.", { id: loadingToastId });
          queryClient.invalidateQueries({ queryKey: ["facultySubjectsPaginated"] });
          queryClient.invalidateQueries({ queryKey: ["subjectUnitsInfinite"] });
          queryClient.invalidateQueries({ queryKey: ["unitTopics"] });
          router.refresh();
          onClose();
          return;
        }

        pdfGenerationKeysRef.current.add(pdfGenerationKey);
        onGeneratingStart?.();

        runWhenBrowserIsIdle(() => {
          const pdfToastId = toast.loading("New topic PDFs are generating in the background...");
          let failedTopicPdfCount = 0;

          void (async () => {
            try {
              const topicRows = uniqueTopicsForPdf.map((topic) => ({
                collegeSubjectUnitTopicId: topic.topicId!,
                topicTitle: topic.topicTitle,
              }));

              const noteResults = await generateTopicNotesBatchAction({
                subjectName: formData.subjectName,
                unitName: formData.unitName,
                branch: selectedBranch,
                educationType: selectedEducationType,
                topics: topicRows,
              });

              for (let index = 0; index < noteResults.length; index += 1) {
                const result = noteResults[index];
                toast.loading(`Generating PDF ${index + 1}/${noteResults.length}: ${result.topicTitle}`, {
                  id: pdfToastId,
                });

                if (!result.success) {
                  failedTopicPdfCount += 1;
                  console.error("[EditUnitModal] Topic notes generation failed", {
                    topicId: result.collegeSubjectUnitTopicId,
                    topicTitle: result.topicTitle,
                    error: result.error,
                  });
                  continue;
                }

                try {
                  if (hasGenericTopicNotes(result.notes)) {
                    failedTopicPdfCount += 1;
                    continue;
                  }

                  const pdfFile = await buildTopicPdfFile({
                    notes: result.notes,
                    unitNumber: formData.unitNumber,
                  });

                  await uploadTopicResource({
                    file: pdfFile,
                    collegeSubjectUnitTopicId: result.collegeSubjectUnitTopicId,
                    replaceExisting: true,
                  });
                } catch (pdfError: any) {
                  failedTopicPdfCount += 1;
                  console.error("[EditUnitModal] Topic PDF upload failed", {
                    topicId: result.collegeSubjectUnitTopicId,
                    error: pdfError?.message ?? pdfError,
                  });
                }
              }

              if (failedTopicPdfCount > 0) {
                toast.error(`${failedTopicPdfCount} topic PDF${failedTopicPdfCount > 1 ? "s were" : " was"} not generated.`, { id: pdfToastId });
              } else {
                toast.success("New topic PDFs generated successfully", { id: pdfToastId });
              }
            } catch (pdfBatchError: any) {
              console.error("[EditUnitModal] Topic PDF background job failed", {
                error: pdfBatchError?.message ?? pdfBatchError,
              });
              toast.error("Unit updated, but new topic PDFs could not be generated.", { id: pdfToastId });
            } finally {
              pdfGenerationKeysRef.current.delete(pdfGenerationKey);
              onGeneratingEnd?.();
            }
          })();
        });
      }

      toast.success("Unit updated successfully.", { id: loadingToastId });
      queryClient.invalidateQueries({ queryKey: ["facultySubjectsPaginated"] });
      queryClient.invalidateQueries({ queryKey: ["subjectUnitsInfinite"] });
      queryClient.invalidateQueries({ queryKey: ["unitTopics"] });
      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("[useUnitUpdate] Error:", err);
      let errorMessage = err?.message || "Failed to update unit";
      const lowerError = errorMessage.toLowerCase();
      if (
        lowerError.includes("does not exist") ||
        lowerError.includes("syntax error") ||
        lowerError.includes("relation") ||
        lowerError.includes("violates") ||
        lowerError.includes("database") ||
        lowerError.includes("duplicate key") ||
        lowerError.includes("constraint") ||
        lowerError.includes("conflict")
      ) {
        errorMessage = "An unexpected error occurred while updating the unit. Please try again.";
      }
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSave };
}
