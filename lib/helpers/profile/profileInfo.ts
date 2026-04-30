import { supabase } from "@/lib/supabaseClient";

const now = () => new Date().toISOString();

export async function getUserProfilePhoto(userId: number) {
  const { data, error } = await supabase
    .from("user_profile")
    .select("userProfileId, profileUrl")
    .eq("userId", userId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

async function deleteImageByUrl(url: string) {
  if (!url || !url.includes('/storage/v1/object/public/user_profiles/')) return;
  
  try {
      const path = url.split('/public/user_profiles/')[1];
      if (path) {
          await supabase.storage.from("user_profiles").remove([path]);
      }
  } catch (e) {
      console.error("Cleanup failed", e);
  }
}

async function uploadProfilePhoto(file: File, userId: number): Promise<string> {
  let fileExt = file.type.split('/')[1] || 'webp';
  if (fileExt === 'svg+xml') fileExt = 'svg'; 
  
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  let attempt = 0;
  const maxAttempts = 2;
  let lastError: any = null;

  while (attempt < maxAttempts) {
      try {
          const { data, error: uploadError } = await supabase.storage
              .from("user_profiles")
              .upload(filePath, file, { contentType: file.type, upsert: false });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from("user_profiles").getPublicUrl(filePath);
          return urlData.publicUrl;
      } catch (error) {
          lastError = error;
          attempt++;
          if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500));
      }
  }
  throw new Error(`Storage Error: ${lastError?.message || "Unknown error"}`);
}

export async function upsertUserProfilePhoto(userId: number, file: File | string, oldProfileUrl: string | null) {
  let finalUrl = typeof file === 'string' ? file : '';

  try {
    if (file instanceof File) {
      finalUrl = await uploadProfilePhoto(file, userId);
    }

    const { data, error } = await supabase
      .from("user_profile")
      .upsert(
        { userId, profileUrl: finalUrl, updatedAt: now(), createdAt: now(), is_deleted: false },
        { onConflict: "userId" }
      )
      .select("userProfileId")
      .single();

    if (error) throw error;

    // SaaS Cleanup: Delete old bucket image if a new physical file was uploaded
    if (file instanceof File && oldProfileUrl && oldProfileUrl !== finalUrl) {
      await deleteImageByUrl(oldProfileUrl);
    }

    return { data, publicUrl: finalUrl };
    
  } catch (error) {
    // SaaS Rollback: If DB insert fails, wipe the newly uploaded file to prevent orphan files
    if (file instanceof File && finalUrl && finalUrl !== oldProfileUrl) {
      await deleteImageByUrl(finalUrl);
    }
    throw error;
  }
}

// [CHANGED] Replaces your existing deleteUserProfilePhoto
export async function deleteUserProfilePhoto(userId: number, currentProfileUrl: string | null) {
  const { error } = await supabase
    .from("user_profile")
    .update({ is_deleted: true, deletedAt: now() })
    .eq("userId", userId)
    .eq("is_deleted", false);

  if (error) throw error;

  // Cleanup storage bucket to save space
  if (currentProfileUrl) {
     await deleteImageByUrl(currentProfileUrl);
  }
}

// export async function upsertUserProfilePhoto(userId: number, profileUrl: string) {
//   const { data, error } = await supabase
//     .from("user_profile")
//     .upsert(
//       {
//         userId,
//         profileUrl,
//         updatedAt: now(),
//         createdAt: now(),
//         is_deleted: false,
//       },
//       {
//         onConflict: "userId",
//       }
//     )
//     .select("userProfileId")
//     .single();

//   if (error) throw error;
//   return data;
// }

// export async function deleteUserProfilePhoto(userId: number) {
//   const { error } = await supabase
//     .from("user_profile")
//     .update({
//       is_deleted: true,
//       deletedAt: now(),
//     })
//     .eq("userId", userId)
//     .eq("is_deleted", false);

//   if (error) throw error;
// }

