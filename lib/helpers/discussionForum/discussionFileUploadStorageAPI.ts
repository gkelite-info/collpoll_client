import { supabase } from "@/lib/supabaseClient";

export async function uploadDiscussionFiles(
    discussionId: number,
    files: File[]
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${discussionId}/${Date.now()}_${file.name}`;

        const { error } = await supabase.storage
            .from("discussion-files")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("uploadDiscussionFiles error:", error);
            throw new Error(`Failed to upload ${file.name}`);
        }

        const { data: publicUrl } = supabase.storage
            .from("discussion-files")
            .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl.publicUrl);
    }

    return uploadedUrls;
}