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

  console.log(
    `📄 [generatePdfsForTopics] Starting PDF generation for ${topics.length} topics`
  );

  const results: TopicPdfResult[] = [];

  for (const topic of topics) {
    console.log(`📄 [generatePdfsForTopics] Processing: "${topic.topicTitle}"`);

    try {
      // Step 1 — Generate structured notes via Groq
      const notes = await generateTopicNotes({
        topicTitle: topic.topicTitle,
        subjectName,
        unitName,
        branch,
        educationType,
      });
      console.log(`✅ [generatePdfsForTopics] Notes generated for: "${topic.topicTitle}"`);

      // Step 2 — Render HTML → PDF via Puppeteer
      const pdfBuffer = await generateTopicPdf(notes);
      console.log(`✅ [generatePdfsForTopics] PDF rendered for: "${topic.topicTitle}"`);

      // Step 3 — Upload to Supabase Storage + insert DB record
      const saved = await saveTopicResource({
        pdfBuffer,
        topicTitle: topic.topicTitle,
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        collegeId,
        createdBy,
        isAdmin,
      });
      console.log(
        `✅ [generatePdfsForTopics] Saved resource ID: ${saved.collegeSubjectUnitTopicResourceId} for "${topic.topicTitle}"`
      );

      results.push({
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        status: "success",
        resourceUrl: saved.resourceUrl,
      });
    } catch (err: any) {
      console.error(
        `🔴 [generatePdfsForTopics] Failed for "${topic.topicTitle}":`,
        err?.message ?? err
      );
      results.push({
        collegeSubjectUnitTopicId: topic.collegeSubjectUnitTopicId,
        topicTitle: topic.topicTitle,
        status: "failed",
        error: err?.message ?? "Unknown error",
      });
    }
  }

  const successCount = results.filter((r) => r.status === "success").length;
  console.log(
    `📄 [generatePdfsForTopics] Done — ${successCount}/${topics.length} PDFs generated successfully`
  );

  return results;
}