import { supabase } from "@/lib/supabaseClient";

export type DiscussionFileUploadRow = {
    discussionFileUploadId: number;
    discussionId: number;
    discussionSectionId: number;
    fileUrl: string;
    isActive: boolean;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};


export async function fetchDiscussionFiles(
    discussionId: number,
) {
    const { data, error } = await supabase
        .from("discussion_file_uploads")
        .select(`
      discussionFileUploadId,
      discussionId,
      discussionSectionId,
      fileUrl,
      isActive,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("discussionId", discussionId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("fetchDiscussionFiles error:", error);
        throw error;
    }

    return data ?? [];
}


export async function fetchDiscussionFilesBySection(
    discussionSectionId: number,
) {
    const { data, error } = await supabase
        .from("discussion_file_uploads")
        .select(`
      discussionFileUploadId,
      discussionId,
      discussionSectionId,
      fileUrl,
      createdAt
    `)
        .eq("discussionSectionId", discussionSectionId)
        .eq("isActive", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("fetchDiscussionFilesBySection error:", error);
        throw error;
    }

    return data ?? [];
}


export async function saveDiscussionFiles(
    discussionId: number,
    fileUrls: string[],
    discussionSectionId?: number,
) {
    if (!fileUrls.length) return { success: true };

    const now = new Date().toISOString();

    const insertPayload = fileUrls.map((fileUrl) => ({
        discussionId,
        fileUrl,
        ...(discussionSectionId ? { discussionSectionId } : {}),
        createdAt: now,
        updatedAt: now,
    }));

    const { error } = await supabase
        .from("discussion_file_uploads")
        .insert(insertPayload);

    if (error) {
        console.error("saveDiscussionFiles error:", error);
        return { success: false, error };
    }

    return { success: true };
}


export async function deactivateDiscussionFile(
    discussionFileUploadId: number,
) {
    const { error } = await supabase
        .from("discussion_file_uploads")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("discussionFileUploadId", discussionFileUploadId)
        .eq("isActive", true);

    if (error) {
        console.error("deactivateDiscussionFile error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function deactivateDiscussionFilesByDiscussion(
    discussionId: number,
) {
    const { error } = await supabase
        .from("discussion_file_uploads")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("discussionId", discussionId)
        .eq("isActive", true);

    if (error) {
        console.error("deactivateDiscussionFilesByDiscussion error:", error);
        return { success: false };
    }

    return { success: true };
}


export async function deactivateDiscussionFilesBySection(
    discussionSectionId: number,
) {
    const { error } = await supabase
        .from("discussion_file_uploads")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq("discussionSectionId", discussionSectionId)
        .eq("isActive", true);

    if (error) {
        console.error("deactivateDiscussionFilesBySection error:", error);
        return { success: false };
    }

    return { success: true };
}