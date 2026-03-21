import { supabase } from "@/lib/supabaseClient";

const BUCKET = "college-drive";

export type DriveFolderRow = {
    driveFolderId: number;
    collegeId: number;
    parentFolderId: number | null;
    folderName: string;
    createdBy: number;
    is_deleted: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export async function fetchRootDriveFolders(collegeId: number) {
    const { data, error } = await supabase
        .from("drive_folders")
        .select(`
      driveFolderId,
      collegeId,
      parentFolderId,
      folderName,
      createdBy,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .is("parentFolderId", null)
        .is("deletedAt", null)
        .order("folderName", { ascending: true });

    if (error) {
        console.error("fetchRootDriveFolders error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchSubDriveFolders(
    collegeId: number,
    parentFolderId: number,
) {
    const { data, error } = await supabase
        .from("drive_folders")
        .select(`
      driveFolderId,
      collegeId,
      parentFolderId,
      folderName,
      createdBy,
      is_deleted,
      createdAt,
      updatedAt,
      deletedAt
    `)
        .eq("collegeId", collegeId)
        .eq("parentFolderId", parentFolderId)
        .is("deletedAt", null)
        .order("folderName", { ascending: true });

    if (error) {
        console.error("fetchSubDriveFolders error:", error);
        throw error;
    }

    return data ?? [];
}

export async function fetchExistingDriveFolder(
    collegeId: number,
    folderName: string,
    parentFolderId?: number | null,
) {
    const query = supabase
        .from("drive_folders")
        .select("driveFolderId")
        .eq("collegeId", collegeId)
        .eq("folderName", folderName.trim())
        .is("deletedAt", null);

    if (parentFolderId === null || parentFolderId === undefined) {
        query.is("parentFolderId", null);
    } else {
        query.eq("parentFolderId", parentFolderId);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        throw error;
    }

    return { success: true, data };
}

export async function saveDriveFolder(
    payload: {
        driveFolderId?: number;
        collegeId: number;
        folderName: string;
        parentFolderId?: number | null;
    },
    userId: number,
) {
    const now = new Date().toISOString();

    const upsertPayload: any = {
        collegeId: payload.collegeId,
        folderName: payload.folderName.trim(),
        parentFolderId: payload.parentFolderId ?? null,
        updatedAt: now,
    };

    if (!payload.driveFolderId) {
        upsertPayload.createdBy = userId;
        upsertPayload.createdAt = now;

        const { data, error } = await supabase
            .from("drive_folders")
            .insert([upsertPayload])
            .select("driveFolderId")
            .single();

        if (error) {
            console.error("saveDriveFolder (create) error:", error);
            return { success: false, error };
        }

        return {
            success: true,
            driveFolderId: data.driveFolderId,
        };
    }

    const { error } = await supabase
        .from("drive_folders")
        .update(upsertPayload)
        .eq("driveFolderId", payload.driveFolderId);

    if (error) {
        console.error("saveDriveFolder (update) error:", error);
        return { success: false, error };
    }

    return {
        success: true,
        driveFolderId: payload.driveFolderId,
    };
}

export async function deleteDriveFolder(
    driveFolderId: number,
    collegeId: number,
) {
    const { error } = await supabase
        .from("drive_folders")
        .update({
            is_deleted: true,
            deletedAt: new Date().toISOString(),
        })
        .eq("driveFolderId", driveFolderId);

    if (error) {
        console.error("deleteDriveFolder error:", error);
        return { success: false };
    }

    // Remove all files inside this folder from bucket
    const folderPath = `${collegeId}/${driveFolderId}`;
    const { data: files, error: listError } = await supabase.storage
        .from(BUCKET)
        .list(folderPath);

    if (!listError && files && files.length > 0) {
        const paths = files.map((f) => `${folderPath}/${f.name}`);
        const { error: removeError } = await supabase.storage
            .from(BUCKET)
            .remove(paths);

        if (removeError) {
            console.error("deleteDriveFolder (storage) error:", removeError);
        }
    }

    return { success: true };
}
