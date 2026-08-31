import { supabase } from "@/lib/supabaseClient";

const BUCKET_NAME = "student_submissions";

export async function generateSubmissionSignedUrl(filePath: string) {
  return `/api/files/${BUCKET_NAME}/${filePath}`;
}
