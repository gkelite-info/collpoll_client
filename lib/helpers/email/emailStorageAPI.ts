import { supabase } from "@/lib/supabaseClient";

export async function uploadEmailAttachment(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `emails/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: signedError } = await supabase.storage
    .from("attachments")
    .createSignedUrl(filePath, 315360000);

  if (signedError) throw signedError;

  return data.signedUrl;
}
