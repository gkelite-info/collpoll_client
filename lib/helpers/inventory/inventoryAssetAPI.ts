import { supabase } from "@/lib/supabaseClient";

export type InventoryAssetRow = {
  inventoryAssetId: number;
  collegeId: number;
  categoryId: number;
  assetName: string;
  totalQty: number;
  availableQty: number;
  referenceImage: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveInventoryAssetPayload = {
  collegeId: number;
  categoryId: number;
  assetName: string;
  totalQty: number;
  availableQty: number;
  createdBy: number;
  referenceImage?: File | null;
};

export const INVENTORY_ASSETS_BUCKET = "inventory-assets";
const INVENTORY_ASSET_COLUMNS = "inventoryAssetId, collegeId, categoryId, assetName, totalQty, availableQty, referenceImage, createdBy, createdAt, updatedAt";
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export function createInventoryError(context: string, error: SupabaseErrorLike) {
  const code = error.code ? ` [${error.code}]` : "";
  const message = error.message || "Unknown Supabase error";
  const normalizedError = new Error(`${context}${code}: ${message}`);
  console.error(normalizedError.message, {
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
  return normalizedError;
}

export function getInventoryImageUrl(path: string | null) {
  if (!path || path.startsWith("http") || path.startsWith("data:")) return path;
  return supabase.storage.from(INVENTORY_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function uploadInventoryAssetImage(file: File, collegeId: number) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Inventory image must be less than 5MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `college-${collegeId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage
    .from(INVENTORY_ASSETS_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) {
    throw createInventoryError("uploadInventoryAssetImage", error);
  }
  return path;
}

export async function fetchInventoryAssets(collegeId: number, categoryId: number) {
  const { data, error } = await supabase
    .from("inventory_assets")
    .select(INVENTORY_ASSET_COLUMNS)
    .eq("collegeId", collegeId)
    .eq("categoryId", categoryId)
    .eq("isActive", true)
    .eq("is_deleted", false)
    .order("updatedAt", { ascending: false });

  if (error) {
    throw createInventoryError("fetchInventoryAssets", error);
  }
  return (data ?? []) as InventoryAssetRow[];
}

export async function saveInventoryAsset(payload: SaveInventoryAssetPayload) {
  let referenceImage: string | null = null;
  if (payload.referenceImage) {
    referenceImage = await uploadInventoryAssetImage(payload.referenceImage, payload.collegeId);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("inventory_assets")
    .insert({
      collegeId: payload.collegeId,
      categoryId: payload.categoryId,
      assetName: payload.assetName,
      totalQty: payload.totalQty,
      availableQty: payload.availableQty,
      referenceImage,
      createdBy: payload.createdBy,
      isActive: true,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .select(INVENTORY_ASSET_COLUMNS)
    .single();

  if (error) {
    if (referenceImage) {
      await supabase.storage.from(INVENTORY_ASSETS_BUCKET).remove([referenceImage]);
    }
    throw createInventoryError("saveInventoryAsset", error);
  }
  return data as InventoryAssetRow;
}

export async function updateInventoryAssetQuantities(
  asset: InventoryAssetRow,
  totalQty: number,
  availableQty: number,
) {
  const { data, error } = await supabase
    .from("inventory_assets")
    .update({ totalQty, availableQty, updatedAt: new Date().toISOString() })
    .eq("inventoryAssetId", asset.inventoryAssetId)
    .eq("collegeId", asset.collegeId)
    .eq("categoryId", asset.categoryId)
    .eq("is_deleted", false)
    .select(INVENTORY_ASSET_COLUMNS)
    .single();

  if (error) {
    throw createInventoryError("updateInventoryAssetQuantities", error);
  }
  return data as InventoryAssetRow;
}

export async function deleteInventoryAsset(asset: InventoryAssetRow) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("inventory_assets")
    .update({ is_deleted: true, isActive: false, deletedAt: now, updatedAt: now })
    .eq("inventoryAssetId", asset.inventoryAssetId)
    .eq("collegeId", asset.collegeId);

  if (error) {
    throw createInventoryError("deleteInventoryAsset", error);
  }
  return { success: true };
}
