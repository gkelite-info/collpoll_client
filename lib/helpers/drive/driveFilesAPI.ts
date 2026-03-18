import { supabase } from "@/lib/supabaseClient";

export type DriveFileRow = {
    driveFileId: number;
    driveFolderId: number;
    collegeId: number;
    fileName: string;
    fileType: string;
    fileSize: number | null;
    fileUrl: string;
    uploadedBy: number;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchDriveFilesByFolder(
    driveFolderId: number,
) {
    const { data, error } = await supabase
        .from("drive_files")
        .select(`
      driveFileId,
      driveFolderId,
      collegeId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      uploadedBy,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("driveFolderId", driveFolderId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchDriveFilesByFolder error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchRecentDriveFiles(
    collegeId: number,
    limit = 10,
) {
    const { data, error } = await supabase
        .from("drive_files")
        .select(`
      driveFileId,
      driveFolderId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      uploadedBy,
      createdAt
    `)
        .eq("collegeId", collegeId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("fetchRecentDriveFiles error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingDriveFile(
    driveFolderId: number,
    fileName: string,
) {
    const { data, error } = await supabase
        .from("drive_files")
        .select("driveFileId")
        .eq("driveFolderId", driveFolderId)
        .eq("fileName", fileName.trim())
        .is("deletedAt", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveDriveFile(
    payload: {
        driveFileId?: number;
        driveFolderId: number;
        collegeId: number;
        fileName: string;
        fileType: string;
        fileSize?: number | null;
        fileUrl: string;
    },
    userId: number,
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        driveFolderId: payload.driveFolderId,
        collegeId: payload.collegeId,
        fileName: payload.fileName.trim(),
        fileType: payload.fileType,
        fileSize: payload.fileSize ?? null,
        fileUrl: payload.fileUrl,
        updatedAt: now,
    };

    if (!payload.driveFileId) {
        upsertPayload.uploadedBy = userId;
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("drive_files")
            .insert([upsertPayload])
            .select("driveFileId")
            .single();

        if (error) {
            console.error("saveDriveFile (create) error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            driveFileId: data.driveFileId,
        };
    }

    const { error } = await supabase
        .from("drive_files")
        .update(upsertPayload)
        .eq("driveFileId", payload.driveFileId);

    if (error) {
        console.error("saveDriveFile (update) error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        driveFileId: payload.driveFileId,
    };
}

export async function deleteDriveFile(driveFileId: number) {
    const { error } = await supabase
        .from("drive_files")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("driveFileId", driveFileId);

    if (error) {
        console.error("deleteDriveFile error:", error);
        return { success: false };
    }

    return { success: true };
}

export async function fetchDriveFilesByUser(
    userId: number,
) {
    const { data, error } = await supabase
        .from("drive_files")
        .select(`
      driveFileId,
      driveFolderId,
      collegeId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      createdAt
    `)
        .eq("uploadedBy", userId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false });

    if (error) {
        console.error("fetchDriveFilesByUser error:", error);
        throw error;
    }

    return data ?? [];
}