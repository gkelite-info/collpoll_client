import { supabase } from "@/lib/supabaseClient";

export type SaveTopicResourceParams = {
  pdfBuffer: Buffer;
  topicTitle: string;
  collegeSubjectUnitTopicId: number;
  collegeId: number;
  createdBy: number;   // facultyId
  isAdmin: number;     // adminId
};

export type SavedResource = {
  collegeSubjectUnitTopicResourceId: number;
  resourceUrl: string;
  resourceName: string;
};

/**
 * 1. Uploads the PDF Buffer to Supabase Storage (bucket: "topic-resources")
 * 2. Returns the public URL
 * 3. Inserts a row into college_subject_unit_topic_resources
 */
export async function saveTopicResource(
  params: SaveTopicResourceParams
): Promise<SavedResource> {
  const {
    pdfBuffer,
    topicTitle,
    collegeSubjectUnitTopicId,
    collegeId,
    createdBy,
    isAdmin,
  } = params;

  // Build a clean, unique storage path
  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const timestamp = Date.now();
  const fileName = `${slug}-${timestamp}.pdf`;
  const storagePath = `college-${collegeId}/topic-${collegeSubjectUnitTopicId}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("topic-resources")        // ← change bucket name if needed
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("topic-resources")
    .getPublicUrl(storagePath);

  const resourceUrl = urlData.publicUrl;
  const resourceName = `${topicTitle}.pdf`;
  const now = new Date().toISOString();

  // Insert DB record
  const { data, error: dbError } = await supabase
    .from("college_subject_unit_topic_resources")
    .insert({
      resourceType: "PDF",
      resourceName,
      resourceUrl,
      collegeSubjectUnitTopicId,
      collegeId,
      createdBy,
      isAdmin,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .select("collegeSubjectUnitTopicResourceId, resourceUrl, resourceName")
    .single();

  if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

  return data as SavedResource;
}