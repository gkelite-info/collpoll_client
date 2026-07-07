import { supabase } from "@/lib/supabaseClient";

export const COLLEGE_MEDIA_BUCKET = "college-media";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateMediaFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Media image must be less than 5MB.");
  }
}

export async function uploadCollegeMediaFile(
  file: File,
  mediaType: "logo" | "banner",
  collegeId: number,
  adminId: number,
) {
  validateMediaFile(file);

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${mediaType}_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `college-${collegeId}/admin-${adminId}/${fileName}`;

  const { error } = await supabase.storage
    .from(COLLEGE_MEDIA_BUCKET)
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw new Error(`Media image upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(COLLEGE_MEDIA_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteCollegeMediaByUrl(imageUrl: string) {
  try {
    const path = imageUrl.split(`/public/${COLLEGE_MEDIA_BUCKET}/`)[1];

    if (!path) return;

    await supabase.storage.from(COLLEGE_MEDIA_BUCKET).remove([path]);
  } catch (error) {
    console.error("Failed to delete media image from storage:", error);
  }
}

export async function getSignedCollegeMediaUrl(publicUrl: string | null) {
  if (!publicUrl) return null;
  if (!publicUrl.includes(`/public/${COLLEGE_MEDIA_BUCKET}/`)) return publicUrl;

  const path = publicUrl.split(`/public/${COLLEGE_MEDIA_BUCKET}/`)[1];
  if (!path) return publicUrl;

  const { data, error } = await supabase.storage
    .from(COLLEGE_MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error || !data) {
    console.error("Failed to create signed URL:", error);
    return publicUrl;
  }

  return data.signedUrl;
}
