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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to generate topic notes";
}

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
    } catch (error: unknown) {
      console.error("[generateTopicNotesBatchAction] Failed", {
        topicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        error: getErrorMessage(error),
      });

      results.push({
        success: false,
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        error: getErrorMessage(error),
      });
    }
  }

  return results;
}

export async function generateFastTopicNotesBatchAction(
  params: BatchParams,
): Promise<GeneratedTopicNotesResult[]> {
  return Promise.all(
    params.topics.map(async (topic) => {
      try {
        const notes = await generateTopicNotes({
          topicTitle: topic.topicTitle,
          subjectName: params.subjectName,
          unitName: params.unitName,
          branch: params.branch,
          educationType: params.educationType,
        });

        return {
          success: true,
          collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
          topicTitle: topic.topicTitle,
          notes,
        };
      } catch (error: unknown) {
        return {
          success: false,
          collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
          topicTitle: topic.topicTitle,
          error: getErrorMessage(error),
        };
      }
    }),
  );
}
