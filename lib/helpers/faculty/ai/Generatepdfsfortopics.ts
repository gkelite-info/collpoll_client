"use server";

import { saveTopicResource } from "../Savetopicresource";
import { generateTopicNotes } from "./Generatetopicnotes";
import { generateTopicPdf } from "./Generatetopicpdf";



export type GeneratePdfsForTopicsParams = {
  topics: {
    collegeSubjectUnitTopicId: number;
    topicTitle: string;
  }[];
  subjectName: string;
  unitName: string;
  branch: string;
  educationType: string;
  collegeId: number;
  createdBy: number;  // facultyId
  isAdmin: number;    // adminId
};

export type TopicPdfResult = {
  collegeSubjectUnitTopicId: number;
  topicTitle: string;
  status: "success" | "failed";
  resourceUrl?: string;
  error?: string;
};

/**
 * Call this after topics are saved to the DB.
 * Loops through each topic, generates notes → PDF → uploads to Supabase.
 * Returns a result per topic so the UI can show success/failure per item.
 */
export async function generatePdfsForTopics(
  params: GeneratePdfsForTopicsParams
): Promise<TopicPdfResult[]> {
  const {
    topics,
    subjectName,
    unitName,
    branch,
    educationType,
    collegeId,
    createdBy,
    isAdmin,
  } = params;

  const results: TopicPdfResult[] = [];

  for (const topic of topics) {
    try {
      const notes = await generateTopicNotes({
        topicTitle: topic.topicTitle,
        subjectName,
        unitName,
        branch,
        educationType,
      });

      const pdfBuffer = await generateTopicPdf(notes);

      const saved = await saveTopicResource({
        pdfBuffer,
        topicTitle: topic.topicTitle,
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        collegeId,
        createdBy,
        isAdmin,
      });

      results.push({
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        status: "success",
        resourceUrl: saved.resourceUrl,
      });
    } catch (err: any) {
      results.push({
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        status: "failed",
        error: err?.message ?? "Unknown error",
      });
    }
  }

  return results;
}