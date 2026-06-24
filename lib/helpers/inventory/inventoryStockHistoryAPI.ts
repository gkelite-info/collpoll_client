import { supabase } from "@/lib/supabaseClient";
import {
  createInventoryError,
  updateInventoryAssetQuantities,
  type InventoryAssetRow,
} from "./inventoryAssetAPI";

export type InventoryActionType = "stockadded" | "reducestock" | "lostequipment";
type StockUpdateAction = "add" | "remove";

export type InventoryStockHistoryRow = {
  historyId: number;
  inventoryAssetId: number;
  actionType: InventoryActionType;
  quantity: number;
  actionDate: string;
  remarks: string | null;
  updatedBy: number;
};

export async function fetchInventoryStockHistory(
  collegeId: number,
  categoryId: number,
  inventoryAssetId: number,
) {
  const { data, error } = await supabase
    .from("inventory_stock_histories")
    .select("historyId, inventoryAssetId, actionType, quantity, actionDate, remarks, updatedBy")
    .eq("collegeId", collegeId)
    .eq("categoryId", categoryId)
    .eq("inventoryAssetId", inventoryAssetId)
    .order("actionDate", { ascending: false });

  if (error) {
    throw createInventoryError("fetchInventoryStockHistory", error);
  }
  return (data ?? []) as InventoryStockHistoryRow[];
}

export async function saveInventoryStockHistory(payload: {
  asset: InventoryAssetRow;
  actionType: StockUpdateAction;
  quantity: number;
  actionDate: string;
  remarks?: string;
  updatedBy: number;
}) {
  const totalQty = payload.actionType === "add"
    ? payload.asset.totalQty + payload.quantity
    : payload.asset.totalQty;
  const availableQty = payload.actionType === "add"
    ? payload.asset.availableQty + payload.quantity
    : Math.max(payload.asset.availableQty - payload.quantity, 0);

  const updatedAsset = await updateInventoryAssetQuantities(payload.asset, totalQty, availableQty);
  const now = new Date().toISOString();
  const { error } = await supabase.from("inventory_stock_histories").insert({
    inventoryAssetId: payload.asset.inventoryAssetId,
    collegeId: payload.asset.collegeId,
    categoryId: payload.asset.categoryId,
    actionType: payload.actionType === "add" ? "stockadded" : "reducestock",
    quantity: payload.quantity,
    actionDate: new Date(`${payload.actionDate}T00:00:00`).toISOString(),
    remarks: payload.remarks?.trim() || null,
    updatedBy: payload.updatedBy,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    throw createInventoryError("saveInventoryStockHistory", error);
  }
  return updatedAsset;
}
