import { supabase } from "@/lib/supabaseClient";

export type StudentDiscussionUploadRow = {
    studentDiscussionUploadId: number;
    studentId: number;
    discussionId: number;
    discussionSectionId: number;
    fileUrl: string;
    submittedAt: string | null;
    isActive: boolean;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchDiscussionUploads(
    discussionId: number,
    discussionSectionId: number,
) {
    const { data, error } = await supabase
        .from("student_discussion_uploads")
        .select(`
      studentDiscussionUploadId,
      studentId,
      discussionId,
      discussionSectionId,
      fileUrl,
      submittedAt,
      isActive,
      createdAt,
      updatedAt
    `)
        .eq("discussionId", discussionId)
        .eq("discussionSectionId", discussionSectionId)
        .eq("isActive", true)
        .eq("is_deleted", false)
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("fetchDiscussionUploads error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchStudentDiscussionUploads(
    studentId: number,
    discussionId: number,
) {
    const { data, error } = await supabase
        .from("student_discussion_uploads")
        .select(`
      studentDiscussionUploadId,
      discussionSectionId,
      fileUrl,
      submittedAt,
      createdAt
    `)
        .eq("studentId", studentId)
        .eq("discussionId", discussionId)
        .eq("is_deleted", false)
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("fetchStudentDiscussionUploads error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingStudentUpload(
    studentId: number,
    discussionId: number,
    discussionSectionId: number,
) {
    const { data, error } = await supabase
        .from("student_discussion_uploads")
        .select("studentDiscussionUploadId")
        .eq("studentId", studentId)
        .eq("discussionId", discussionId)
        .eq("discussionSectionId", discussionSectionId)
        .eq("is_deleted", false)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveStudentDiscussionUpload(
    payload: {
        studentDiscussionUploadId?: number;
        studentId: number;
        discussionId: number;
        discussionSectionId: number;
        fileUrl: string;
        submittedAt?: string | null;
    },
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        studentId: payload.studentId,
        discussionId: payload.discussionId,
        discussionSectionId: payload.discussionSectionId,
        fileUrl: payload.fileUrl,
        submittedAt: payload.submittedAt ?? now,
        updatedAt: now,
    };

    if (!payload.studentDiscussionUploadId) {
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("student_discussion_uploads")
            .insert([upsertPayload])
            .select("studentDiscussionUploadId")
            .single();

        if (error) {
            console.error("saveStudentDiscussionUpload error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            studentDiscussionUploadId: data.studentDiscussionUploadId,
        };
    }

    const { error } = await supabase
        .from("student_discussion_uploads")
        .update(upsertPayload)
        .eq("studentDiscussionUploadId", payload.studentDiscussionUploadId);

    if (error) {
        console.error("saveStudentDiscussionUpload error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        studentDiscussionUploadId: payload.studentDiscussionUploadId,
    };
}

export async function deactivateStudentDiscussionUpload(
    studentDiscussionUploadId: number,
) {
    const { error } = await supabase
        .from("student_discussion_uploads")
        .update({
            isActive: false,
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("studentDiscussionUploadId", studentDiscussionUploadId);

    if (error) {
        console.error("deactivateStudentDiscussionUpload error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function uploadStudentDiscussionFiles(
    discussionId: number,
    studentId: number,
    files: File[]
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files) {
        const fileName = `${discussionId}/${studentId}/${Date.now()}_${file.name}`;

        const { error } = await supabase.storage
            .from("student-discussion-files")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("uploadStudentDiscussionFiles error:", error);
            throw new Error(`Failed to upload ${file.name}`);
        }

        const { data: publicUrl } = supabase.storage
            .from("student-discussion-files")
            .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl.publicUrl);
    }

    return uploadedUrls;
}

export async function deleteStudentDiscussionFileFromStorage(fileUrl: string) {
    console.log("fileUrl", fileUrl);
    
    const urlParts = fileUrl.split("/student-discussion-files/");
    console.log("url paths", urlParts);
    
    if (urlParts.length < 2) return { success: false };

    const filePath = decodeURIComponent(urlParts[1]);
    console.log("filePath", filePath);
    

    const { error } = await supabase.storage
        .from("student-discussion-files")
        .remove([filePath]);

    if (error) {
        console.error("deleteStudentDiscussionFileFromStorage error:", error);
        return { success: false };
    }

    return { success: true };
}