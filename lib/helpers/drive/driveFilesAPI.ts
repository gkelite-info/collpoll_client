import { supabase } from "@/lib/supabaseClient";

const BUCKET = "college-drive";
export const DRIVE_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024;

export async function fetchDriveStorageUsage(
    collegeId: number,
    userId: number,
): Promise<number> {
    const pageSize = 1000;
    let from = 0;
    let totalBytes = 0;

    while (true) {
        const { data, error } = await supabase
            .from("drive_files")
            .select("fileSize")
            .eq("collegeId", collegeId)
            .eq("uploadedBy", userId)
            .is("deletedAt", null)
            .range(from, from + pageSize - 1);

        if (error) {
            console.error("fetchDriveStorageUsage error:", error);
            throw error;
        }

        const rows = data ?? [];
        totalBytes += rows.reduce(
            (sum, row) => sum + (row.fileSize ?? 0),
            0,
        );

        if (rows.length < pageSize) return totalBytes;
        from += pageSize;
    }
}

export function normalizeDriveFileType(fileName: string, fileType?: string | null) {
    const extension = fileName.trim().split(".").pop()?.toLowerCase();
    if (extension && extension !== fileName.toLowerCase() && extension.length <= 20) {
        return extension;
    }

    const subtype = fileType?.split("/").pop()?.split(/[;+]/)[0]?.trim().toLowerCase();
    return subtype && subtype.length <= 20 ? subtype : "file";
}

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
    page: number = 1,
    limit: number = 10,
) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
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
      deletedAt,
      is_deleted
    `, { count: "exact" })
        .eq("driveFolderId", driveFolderId)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("fetchDriveFilesByFolder error:", error);
        throw error;
    }

    return { data: data ?? [], totalCount: count ?? 0 };
}

// Returns file count and total size (raw bytes) grouped by folderId for a college
export async function fetchFolderStats(
    collegeId: number,
    userId?: number,
): Promise<Record<number, { totalFiles: number; totalSizeBytes: number }>> {
    const query = supabase
        .from("drive_files")
        .select("driveFolderId, fileSize")
        .eq("collegeId", collegeId)
        .is("deletedAt", null);

    const { data, error } = await (userId ? query.eq("uploadedBy", userId) : query);

    if (error) {
        console.error("fetchFolderStats error:", error);
        return {};
    }

    const stats: Record<number, { totalFiles: number; totalSizeBytes: number }> = {};
    for (const row of data ?? []) {
        const id = row.driveFolderId;
        if (!stats[id]) stats[id] = { totalFiles: 0, totalSizeBytes: 0 };
        stats[id].totalFiles += 1;
        stats[id].totalSizeBytes += (row.fileSize ?? 0);
    }
    return stats;
}

export async function fetchRecentDriveFiles(
    collegeId: number,
    page: number = 1,
    limit: number = 10,
    userId?: number,
    sortBy: "latest" | "name" | "size" = "latest",
    searchQuery: string = "",
) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const query = supabase
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
        `, { count: "exact" })
        .eq("collegeId", collegeId)
        .is("deletedAt", null);

    if (searchQuery.trim()) {
        query.ilike("fileName", `%${searchQuery.trim()}%`);
    }

    if (sortBy === "name") {
        query.order("fileName", { ascending: true });
    } else if (sortBy === "size") {
        query.order("fileSize", { ascending: false, nullsFirst: false });
    } else {
        query.order("createdAt", { ascending: false });
    }

    query.range(from, to);

    const { data, error, count } = await (userId ? query.eq("uploadedBy", userId) : query);

    if (error) {
        console.error("fetchRecentDriveFiles error:", error);
        throw error;
    }

    return { data: data ?? [], totalCount: count ?? 0 };
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
        fileUrl?: string;
        file?: File;
    },
    userId: number,
) {
    const now = new Date().toISOString();

    let fileUrl = payload.fileUrl ?? "";

    // Upload to bucket for new files
    if (!payload.driveFileId && payload.file) {
        const storagePath = `${payload.collegeId}/${payload.driveFolderId}/${payload.fileName.trim()}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, payload.file, {
                upsert: true,
                contentType: payload.fileType,
            });

        if (uploadError) {
            console.error("saveDriveFile (storage upload) error:", uploadError);
            return { success: false, error: uploadError };
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(storagePath);

        fileUrl = urlData.publicUrl;
    }

    const upsertPayload: {
        driveFolderId: number;
        collegeId: number;
        fileName: string;
        fileType: string;
        fileSize: number | null;
        fileUrl: string;
        updatedAt: string;
        uploadedBy?: number;
        createdAt?: string;
    } = {
        driveFolderId: payload.driveFolderId,
        collegeId: payload.collegeId,
        fileName: payload.fileName.trim(),
        fileType: normalizeDriveFileType(payload.fileName, payload.fileType),
        fileSize: payload.fileSize ?? null,
        fileUrl,
        updatedAt: now,
    };

    if (!payload.driveFileId) {
        upsertPayload.uploadedBy = userId;
        upsertPayload.createdAt = now;

        // Check if a soft-deleted row exists for same folder + fileName
        // If yes — restore it via update instead of insert
        // This avoids RLS insert policy + unique constraint issues
        const { data: deleted } = await supabase
            .from("drive_files")
            .select("driveFileId")
            .eq("driveFolderId", payload.driveFolderId)
            .eq("fileName", payload.fileName.trim())
            .eq("is_deleted", true)
            .maybeSingle();

        if (deleted?.driveFileId) {
            const { error } = await supabase
                .from("drive_files")
                .update({ ...upsertPayload, is_deleted: false, deletedAt: null })
                .eq("driveFileId", deleted.driveFileId);

            if (error) {
                console.error("saveDriveFile (restore) error:", error);
                return { success: false, error };
            }
            return { success: true, driveFileId: deleted.driveFileId };
        }

        const { data, error } = await supabase
            .from("drive_files")
            .insert([upsertPayload])
            .select("driveFileId")
            .single();

        if (error) {
            console.error("saveDriveFile (create) error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                payload: {
                    driveFolderId: payload.driveFolderId,
                    collegeId: payload.collegeId,
                    fileName: payload.fileName.trim(),
                    uploadedBy: userId,
                },
            });
            return { success: false, error };
        }

        return { success: true, driveFileId: data.driveFileId };
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

export async function deleteDriveFile(
    driveFileId: number,
    collegeId: number,
    driveFolderId: number,
    fileName: string,
) {
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

    // Remove file from bucket
    const storagePath = `${collegeId}/${driveFolderId}/${fileName.trim()}`;
    const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([storagePath]);

    if (storageError) {
        console.error("deleteDriveFile (storage) error:", storageError);
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

export async function getDriveFileDownloadUrl(collegeId: number, driveFolderId: number, fileName: string) {
  const storagePath = `${collegeId}/${driveFolderId}/${fileName.trim()}`;
  const { data, error } = await supabase.storage.from('college-drive').createSignedUrl(storagePath, 120, { download: fileName });
  if (error || !data?.signedUrl) throw new Error('Failed to get download URL');
  return data.signedUrl;
}
