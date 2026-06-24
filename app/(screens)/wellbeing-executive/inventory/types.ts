export type EquipmentStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  totalQty: number;
  available: number;
  lastUpdated: string;
  image: string | null;
  inventoryAssetId?: number;
};

export type EquipmentFormState = {
  name: string;
  quantity: string;
  available: string;
  image: string | null;
  imageFile?: File | null;
};

export type StockActionType = "add" | "remove";

export type StockUpdateState = {
  actionType: StockActionType;
  quantity: string;
  date: string;
  remarks: string;
};
