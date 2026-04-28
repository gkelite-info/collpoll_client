import { supabase } from "@/lib/supabaseClient";

export const SUBJECT_IMAGES_BUCKET = "subject-images";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateSubjectImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Subject image must be less than 5MB.");
  }
}

export async function uploadSubjectImage(
  file: File,
  collegeId: number,
  adminId: number,
) {
  validateSubjectImageFile(file);

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `college-${collegeId}/admin-${adminId}/${fileName}`;

  const { error } = await supabase.storage
    .from(SUBJECT_IMAGES_BUCKET)
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw new Error(`Subject image upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SUBJECT_IMAGES_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteSubjectImageByUrl(imageUrl: string) {
  try {
    const path = imageUrl.split(`/public/${SUBJECT_IMAGES_BUCKET}/`)[1];

    if (!path) return;

    await supabase.storage.from(SUBJECT_IMAGES_BUCKET).remove([path]);
  } catch (error) {
    console.error("Failed to delete subject image from storage:", error);
  }
}
