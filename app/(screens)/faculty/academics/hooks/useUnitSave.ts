import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { upsertCollegeSubjectUnitWithTopics } from "@/lib/helpers/faculty/upsertCollegeSubjectUnitWithTopics";
import { saveAcademicUnit } from "@/lib/helpers/faculty/saveAcademicUnit";
import { generateTopicNotesBatchAction } from "@/lib/helpers/faculty/ai/generateTopicNotes.server";
import { buildTopicPdfFile } from "@/lib/helpers/faculty/ai/generateTopicPdf.client";
import { uploadTopicResource } from "@/lib/helpers/faculty/topicResources";
import { useQueryClient } from "@tanstack/react-query";
import { hasGenericTopicNotes, runWhenBrowserIsIdle, INVALID_UNIT_MESSAGE } from "../utils/addNewCardHelpers";

type UseUnitSaveProps = {
  collegeId: number | null | undefined;
  facultyId: number | null;
  faculty_edu_type: string | null | undefined;
  educations: any[];
  branches: any[];
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  facultySubjects: any[];
  facultyCtx: any;
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  setAvailableTopics: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onGeneratingStart?: () => void;
  onGeneratingEnd?: () => void;
  router: any;
  existingUnits: any[];
};

export function useUnitSave({
  collegeId,
  facultyId,
  faculty_edu_type,
  educations,
  branches,
  formData,
  setFormData,
  facultySubjects,
  facultyCtx,
  selectedTopics,
  setSelectedTopics,
  setAvailableTopics,
  onClose,
  onGeneratingStart,
  onGeneratingEnd,
  router,
  existingUnits,
}: UseUnitSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const pdfGenerationKeysRef = useRef<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (isSaving) return;

    if (!collegeId) {
      toast.error("College not found");
      return;
    }

    if (!facultyId) {
      toast.error("Faculty not authenticated");
      return;
    }

    if (!formData.subjectId) {
      toast.error("Please select subject");
      return;
    }

    if (!formData.sectionIds || formData.sectionIds.length === 0) {
      toast.error("Please select at least one section");
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

    if (existingUnits && existingUnits.length > 0) {
      const numberExists = existingUnits.find((u: any) => Number(u.unitLabel?.replace("Unit - ", "")) === Number(formData.unitNumber));
      if (numberExists) {
        toast.error(`Unit ${formData.unitNumber} is already added for this subject!`);
        return;
      }

      const nameExists = existingUnits.find((u: any) => u.title?.toLowerCase().trim() === formData.unitName.trim().toLowerCase());
      if (nameExists) {
        toast.error(`Unit "${formData.unitName}" is already added for this subject!`);
        return;
      }
    }

    const validTopics = selectedTopics.filter((t) => t !== INVALID_UNIT_MESSAGE);

    if (validTopics.length === 0) {
      toast.error("Please add at least one valid topic");
      return;
    }

    const loadingToastId = toast.loading("Saving unit...");
    try {
      setIsSaving(true);

      const allUnitResults: any[] = [];

      for (const sectionId of formData.sectionIds) {
        const unitResult = await upsertCollegeSubjectUnitWithTopics({
          collegeId,
          collegeSubjectId: formData.subjectId,
          createdBy: facultyId,
          unitNumber: formData.unitNumber,
          unitTitle: formData.unitName,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          topics: validTopics,
          collegeSectionsId: sectionId,
        });

        allUnitResults.push(unitResult);

        await saveAcademicUnit({
          collegeId,
          collegeEducationId: formData.educationId!,
          collegeBranchId: formData.branchId!,
          collegeAcademicYearId: formData.academicYearId!,
          collegeSemesterId: formData.semester!,
          collegeSubjectId: formData.subjectId!,
          collegeSectionId: sectionId,
          collegeSubjectUnitId: unitResult.collegeSubjectUnitId,
          createdBy: facultyId,
        });
      }

      const selectedEducationType =
        educations.find((e) => e.collegeEducationId === formData.educationId)
          ?.collegeEducationType ?? faculty_edu_type ?? "Education";
      const selectedBranch =
        branches.find((b) => b.collegeBranchId === formData.branchId)
          ?.collegeBranchCode ?? "Branch";

      const selectedTopicTitles = new Set(validTopics.map((topic) => topic.trim().toLowerCase()));
      
      // Group topic IDs by topic title across all sections
      const topicsByTitle = new Map<string, number[]>();
      allUnitResults.forEach((unitResult) => {
        unitResult.topics.forEach((topic: any) => {
          const titleKey = topic.topicTitle.trim().toLowerCase();
          if (selectedTopicTitles.has(titleKey)) {
            const ids = topicsByTitle.get(titleKey) ?? [];
            ids.push(topic.collegeSubjectUnitTopicId);
            topicsByTitle.set(titleKey, ids);
          }
        });
      });

      const uniqueTopicsForPdf = Array.from(topicsByTitle.entries()).map(([titleKey, ids]) => ({
        topicTitle: validTopics.find(t => t.trim().toLowerCase() === titleKey) ?? titleKey,
        topicIds: ids, // all topic IDs across sections for this title
      }));

      if (uniqueTopicsForPdf.length > 0) {
        // Use the first section's unit ID for the generation key
        const firstUnitResult = allUnitResults[0];
        const pdfGenerationKey = [
          firstUnitResult.collegeSubjectUnitId,
          ...uniqueTopicsForPdf.map(t => t.topicIds[0]),
        ].join(":");

        if (pdfGenerationKeysRef.current.has(pdfGenerationKey)) {
          toast.success("Unit saved successfully. PDFs are already generating.", { id: loadingToastId });
          queryClient.invalidateQueries({ queryKey: ["facultySubjectsPaginated"] });
          router.refresh();
          onClose();
          return;
        }

        pdfGenerationKeysRef.current.add(pdfGenerationKey);
        onGeneratingStart?.();

        runWhenBrowserIsIdle(() => {
          const pdfToastId = toast.loading("Selected topic PDFs are generating in the background...");
          let failedTopicPdfCount = 0;

          void (async () => {
            try {
              const topicRows = uniqueTopicsForPdf.map((topic) => ({
                collegeSubjectUnitTopicId: topic.topicIds[0], // Pass first ID for generation reference
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
                  console.error("[AddNewCardModal] Topic notes generation failed", {
                    topicId: result.collegeSubjectUnitTopicId,
                    topicTitle: result.topicTitle,
                    error: result.error,
                  });
                  continue;
                }

                try {
                  if (hasGenericTopicNotes(result.notes)) {
                    failedTopicPdfCount += 1;
                    console.error("[AddNewCardModal] Refusing generic topic PDF", {
                      topicId: result.collegeSubjectUnitTopicId,
                      topicTitle: result.topicTitle,
                    });
                    continue;
                  }

                  const pdfFile = await buildTopicPdfFile({
                    notes: result.notes,
                    unitNumber: formData.unitNumber,
                  });

                  // Find all topic IDs for this title and upload to all of them
                  const titleKey = result.topicTitle.trim().toLowerCase();
                  const allTopicIds = topicsByTitle.get(titleKey) ?? [];

                  for (const targetTopicId of allTopicIds) {
                    await uploadTopicResource({
                      file: pdfFile,
                      collegeSubjectUnitTopicId: targetTopicId,
                      replaceExisting: true,
                    });
                  }
                } catch (pdfError: any) {
                  failedTopicPdfCount += 1;
                  console.error("[AddNewCardModal] Topic PDF upload failed", {
                    topicId: result.collegeSubjectUnitTopicId,
                    topicTitle: result.topicTitle,
                    error: pdfError?.message ?? pdfError,
                  });
                }
              }

              if (failedTopicPdfCount > 0) {
                toast.error(
                  `${failedTopicPdfCount} topic PDF${failedTopicPdfCount > 1 ? "s were" : " was"} not generated.`,
                  { id: pdfToastId },
                );
              } else {
                toast.success("Topic PDFs generated successfully", {
                  id: pdfToastId,
                });
              }
            } catch (pdfBatchError: any) {
              console.error("[AddNewCardModal] Topic PDF background job failed", {
                error: pdfBatchError?.message ?? pdfBatchError,
              });

              toast.error("Unit saved, but topic PDFs could not be generated.", {
                id: pdfToastId,
              });
            } finally {
              pdfGenerationKeysRef.current.delete(pdfGenerationKey);
              onGeneratingEnd?.();
            }
          })();
        });
      }

      toast.success("Unit saved successfully. PDFs will appear shortly.", { id: loadingToastId });
      queryClient.invalidateQueries({ queryKey: ["facultySubjectsPaginated"] });
      router.refresh();
      onClose();
      setFormData({
        educationId: facultyCtx?.collegeEducationId,
        branchId: facultyCtx?.collegeBranchId,
        academicYearId: facultyCtx?.academicYearIds?.length === 1 ? facultyCtx.academicYearIds[0] : undefined,
        semester: undefined,
        collegeSubjectId: undefined,
        subjectName: facultySubjects.length === 1 ? facultySubjects[0].subjectName : "",
        subjectId: facultySubjects.length === 1 ? facultySubjects[0].collegeSubjectId : undefined,
        sectionIds: [],
        unitName: "",
        unitNumber: 1,
        startDate: "",
        endDate: "",
        topics: [],
      });
      setAvailableTopics([]);
      setSelectedTopics([]);
    } catch (err: any) {
      console.error("[useUnitSave] Error:", err);
      let errorMessage = err?.message || "Failed to save unit";
      
      // Sanitize raw DB/system errors
      const lowerError = errorMessage.toLowerCase();
      if (
        lowerError.includes("does not exist") ||
        lowerError.includes("syntax error") ||
        lowerError.includes("relation") ||
        lowerError.includes("violates") ||
        lowerError.includes("database") ||
        lowerError.includes("duplicate key")
      ) {
        errorMessage = "An unexpected error occurred while saving the unit. Please try again.";
      }
      
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSave };
}
