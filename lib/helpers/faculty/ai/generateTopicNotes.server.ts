"use server";

import {
  generateTopicNotes,
  type TopicNotes,
} from "@/lib/helpers/faculty/ai/Generatetopicnotes";

type TopicInput = {
  collegeSubjectUnitTopicId: number;
  topicTitle: string;
};

type BatchParams = {
  subjectName: string;
  unitName: string;
  branch: string;
  educationType: string;
  topics: TopicInput[];
};

export type GeneratedTopicNotesResult =
  | {
      success: true;
      collegeSubjectUnitTopicId: number;
      topicTitle: string;
      notes: TopicNotes;
    }
  | {
      success: false;
      collegeSubjectUnitTopicId: number;
      topicTitle: string;
      error: string;
    };

export async function generateTopicNotesBatchAction(
  params: BatchParams,
): Promise<GeneratedTopicNotesResult[]> {
  const results: GeneratedTopicNotesResult[] = [];

  for (const topic of params.topics) {
    try {
      console.log("[generateTopicNotesBatchAction] Generating notes", {
        topicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        subjectName: params.subjectName,
        unitName: params.unitName,
      });

      const notes = await generateTopicNotes({
        topicTitle: topic.topicTitle,
        subjectName: params.subjectName,
        unitName: params.unitName,
        branch: params.branch,
        educationType: params.educationType,
      });

      results.push({
        success: true,
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        notes,
      });
    } catch (error: any) {
      console.error("[generateTopicNotesBatchAction] Failed", {
        topicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        error: error?.message ?? error,
      });

      results.push({
        success: false,
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        error: error?.message || "Failed to generate topic notes",
      });
    }
  }

  return results;
}
