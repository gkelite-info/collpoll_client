"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import {
  deleteInventoryAsset,
  fetchInventoryAssets,
  getInventoryImageUrl,
  saveInventoryAsset,
  type InventoryAssetRow,
} from "@/lib/helpers/inventory/inventoryAssetAPI";
import {
  fetchInventoryStockHistory,
  saveInventoryStockHistory,
  type InventoryStockHistoryRow,
} from "@/lib/helpers/inventory/inventoryStockHistoryAPI";
import { EquipmentForm, InventoryOverview, InventoryPageShimmer } from "./components";
import {
  administrationItems,
  defaultItems,
  emptyForm,
  getStatus,
  normalizeCategoryName,
  safetyItems,
} from "./inventory-data";
import { StockHistoryModal, UpdateStockModal } from "./modals";
import type {
  EquipmentFormState,
  EquipmentItem,
  EquipmentStatus,
  StockUpdateState,
} from "./types";

export type InventoryVariant = "sports" | "safety" | "administration";

const inventoryConfig = {
  sports: {
    items: defaultItems,
    category: "Sports",
    idPrefix: "SP",
    itemLabel: "Equipment",
    addTitle: "Add New Equipment",
    submitText: "Save Equipment",
    addButtonLabel: "Add New Equipment",
    itemColumnLabel: "Item Name",
    description: "Track and manage all sports equipment and assets.",
  },
  safety: {
    items: safetyItems,
    category: "Safety and Security",
    idPrefix: "SS",
    itemLabel: "Asset",
    addTitle: "Add New Asset",
    submitText: "Save Asset",
    addButtonLabel: "Add New Asset",
    itemColumnLabel: "Asset Name",
    description: "Track and manage all safety and security equipment and assets across the campus.",
  },
  administration: {
    items: administrationItems,
    category: "Administration",
    idPrefix: "AD",
    itemLabel: "Equipment",
    addTitle: "Add New Equipment",
    submitText: "Save Equipment",
    addButtonLabel: "Add New Equipment",
    itemColumnLabel: "Item Name",
    description: "Track and manage all administration equipment and office assets across the campus.",
  },
} satisfies Record<InventoryVariant, {
  items: EquipmentItem[];
  category: string;
  idPrefix: string;
  itemLabel: string;
  addTitle: string;
  submitText: string;
  addButtonLabel: string;
  itemColumnLabel: string;
  description: string;
}>;

const getLocalDateInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const createStockUpdate = (): StockUpdateState => ({
  actionType: "add",
  quantity: "",
  date: getLocalDateInputValue(),
  remarks: "",
});

const mapAssetToEquipmentItem = (asset: InventoryAssetRow, category: string): EquipmentItem => ({
  id: `SP${asset.inventoryAssetId}`,
  inventoryAssetId: asset.inventoryAssetId,
  name: asset.assetName,
  category,
  totalQty: asset.totalQty,
  available: asset.availableQty,
  lastUpdated: new Date(asset.updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }),
  image: getInventoryImageUrl(asset.referenceImage),
});

function InventoryWorkspace({
  variant,
  sportsContext,
}: {
  variant: InventoryVariant;
  sportsContext?: { collegeId: number; categoryId: number; userId: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const config = inventoryConfig[variant];
  const view = searchParams.get("view") === "add" ? "add" : "list";
  const [items, setItems] = useState<EquipmentItem[]>(() => config.items);
  const [searchedItems, setSearchedItems] = useState<EquipmentItem[] | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | EquipmentStatus>("all");
  const [form, setForm] = useState<EquipmentFormState>(emptyForm);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<InventoryStockHistoryRow[]>([]);
  const [inventoryAssets, setInventoryAssets] = useState<InventoryAssetRow[]>([]);
  const [stockUpdate, setStockUpdate] = useState<StockUpdateState>(createStockUpdate);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<EquipmentItem | null>(null);
  const [isInventoryLoading, setIsInventoryLoading] = useState(Boolean(sportsContext));
  const stockId = searchParams.get("stockId");
  const stockActionType: StockUpdateState["actionType"] =
    searchParams.get("stockAction") === "reduce" ? "remove" : "add";
  const stockItem = useMemo(
    () => stockId ? items.find((item) => item.id === stockId) ?? null : null,
    [items, stockId],
  );
  const sportsCollegeId = sportsContext?.collegeId;
  const sportsCategoryId = sportsContext?.categoryId;

  useEffect(() => {
    if (!sportsCollegeId || !sportsCategoryId) return;
    let active = true;
    fetchInventoryAssets(sportsCollegeId, sportsCategoryId)
      .then((assets) => {
        if (!active) return;
        setInventoryAssets(assets);
        setItems(assets.map((asset) => mapAssetToEquipmentItem(asset, config.category)));
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load inventory.");
      })
      .finally(() => {
        if (active) setIsInventoryLoading(false);
      });
    return () => { active = false; };
  }, [sportsCollegeId, sportsCategoryId, config.category]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search);
      if (!sportsCollegeId || !sportsCategoryId) setIsSearchLoading(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, sportsCollegeId, sportsCategoryId]);

  useEffect(() => {
    if (!sportsCollegeId || !sportsCategoryId || !appliedSearch.trim()) return;
    let active = true;
    fetchInventoryAssets(sportsCollegeId, sportsCategoryId, appliedSearch)
      .then((assets) => {
        if (active) setSearchedItems(assets.map((asset) => mapAssetToEquipmentItem(asset, config.category)));
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to search inventory.");
      })
      .finally(() => {
        if (active) setIsSearchLoading(false);
      });
    return () => { active = false; };
  }, [appliedSearch, sportsCollegeId, sportsCategoryId, config.category]);

  const filteredItems = useMemo(
    () =>
      (sportsContext && appliedSearch.trim() ? searchedItems ?? [] : items).filter((item) => {
        const matchesSearch =
          sportsContext || item.name.toLowerCase().includes(appliedSearch.toLowerCase());
        const status = getStatus(item);
        return matchesSearch && (statusFilter === "all" || status === statusFilter);
      }),
    [items, searchedItems, appliedSearch, sportsContext, statusFilter],
  );

  const changeSearch = (value: string) => {
    setSearch(value);
    setIsSearchLoading(Boolean(value.trim()));
    if (!value.trim()) {
      setAppliedSearch("");
      setSearchedItems(null);
    }
  };

  const overview = useMemo(() => {
    const lowStock = items.filter((item) => getStatus(item) === "Low Stock").length;
    const outOfStock = items.filter((item) => getStatus(item) === "Out of Stock").length;
    return {
      total: items.length,
      inStock: items.filter((item) => getStatus(item) === "In Stock").length,
      lowStock,
      outOfStock,
    };
  }, [items]);

  const saveNewItem = async () => {
    const totalQty = Number(form.quantity) || 0;
    const available = Number(form.available || form.quantity) || 0;
    if (!form.name.trim()) {
      toast.error("Please enter the equipment name.");
      return;
    }
    if (totalQty <= 0) {
      toast.error("Please enter a quantity greater than zero.");
      return;
    }
    setIsSavingNew(true);

    if (sportsContext) {
      try {
        const asset = await saveInventoryAsset({
          collegeId: sportsContext.collegeId,
          categoryId: sportsContext.categoryId,
          createdBy: sportsContext.userId,
          assetName: form.name.trim(),
          totalQty,
          availableQty: Math.min(available, totalQty),
          referenceImage: form.imageFile,
        });
        setInventoryAssets((current) => [asset, ...current]);
        setItems((current) => [mapAssetToEquipmentItem(asset, config.category), ...current]);
        toast.success("Equipment added successfully.");
        setForm(emptyForm);
        router.replace(pathname);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add equipment.");
      } finally {
        setIsSavingNew(false);
      }
      return;
    }

    setItems((current) => [
      {
        id: `${config.idPrefix}${String(current.length + 27).padStart(3, "0")}`,
        name: form.name.trim(),
        category: config.category,
        totalQty,
        available: Math.min(available, totalQty),
        lastUpdated: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        image: form.image,
      },
      ...current,
    ]);
    setForm(emptyForm);
    router.replace(pathname);
    setIsSavingNew(false);
  };

  const openEditModal = (item: EquipmentItem) => {
    setStockUpdate(createStockUpdate());
    const params = new URLSearchParams(searchParams.toString());
    params.set("stockId", item.id);
    params.set("stockAction", "add");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeStockModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("stockId");
    params.delete("stockAction");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const changeStockUpdate = (nextUpdate: StockUpdateState) => {
    setStockUpdate(nextUpdate);
    if (nextUpdate.actionType === stockActionType) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("stockAction", nextUpdate.actionType === "remove" ? "reduce" : "add");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const saveStockUpdate = async () => {
    if (!stockItem) return;
    const quantity = Number(stockUpdate.quantity) || 0;
    if (quantity <= 0) {
      toast.error("Please enter a quantity greater than zero.");
      return;
    }
    if (!stockUpdate.date) {
      toast.error("Please select the stock update date.");
      return;
    }
    if (stockActionType === "remove" && quantity > stockItem.available) {
      toast.error(`Only ${stockItem.available} item${stockItem.available === 1 ? " is" : "s are"} available to reduce.`);
      return;
    }
    if (stockActionType === "add" && quantity > stockItem.totalQty) {
      toast.error(`You can add a maximum of ${stockItem.totalQty} items at a time.`);
      return;
    }
    setIsUpdatingStock(true);

    if (sportsContext && stockItem.inventoryAssetId) {
      const asset = inventoryAssets.find((row) => row.inventoryAssetId === stockItem.inventoryAssetId);
      if (!asset) return;
      try {
        const updated = await saveInventoryStockHistory({
          asset,
          actionType: stockActionType,
          quantity,
          actionDate: stockUpdate.date,
          remarks: stockUpdate.remarks,
          updatedBy: sportsContext.userId,
        });
        setInventoryAssets((current) => current.map((row) => row.inventoryAssetId === updated.inventoryAssetId ? updated : row));
        setItems((current) => current.map((row) => row.inventoryAssetId === updated.inventoryAssetId ? mapAssetToEquipmentItem(updated, config.category) : row));
        setSearchedItems((current) => current?.map((row) => row.inventoryAssetId === updated.inventoryAssetId ? mapAssetToEquipmentItem(updated, config.category) : row) ?? null);
        closeStockModal();
        toast.success("Stock updated successfully.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update stock.");
      } finally {
        setIsUpdatingStock(false);
      }
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== stockItem.id) return item;
        const nextTotalQty = stockActionType === "add"
          ? item.totalQty + quantity
          : item.totalQty;
        const nextAvailable =
          stockActionType === "add"
            ? item.available + quantity
            : Math.max(item.available - quantity, 0);
        return {
          ...item,
          totalQty: nextTotalQty,
          available: nextAvailable,
          lastUpdated: new Date(`${stockUpdate.date}T00:00:00`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
      }),
    );
    closeStockModal();
    setIsUpdatingStock(false);
  };

  const openHistory = async (item: EquipmentItem) => {
    setHistoryOpen(true);
    setHistory([]);
    if (!sportsContext || !item.inventoryAssetId) return;
    setHistoryLoadingId(item.id);
    try {
      setHistory(await fetchInventoryStockHistory(sportsContext.collegeId, sportsContext.categoryId, item.inventoryAssetId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load stock history.");
    } finally {
      setHistoryLoadingId(null);
    }
  };

  const removeItem = async (item: EquipmentItem) => {
    setDeletingId(item.id);
    if (!sportsContext || !item.inventoryAssetId) {
      setItems((current) => current.filter((row) => row.id !== item.id));
      setDeletingId(null);
      setDeleteItem(null);
      return;
    }
    const asset = inventoryAssets.find((row) => row.inventoryAssetId === item.inventoryAssetId);
    if (!asset) {
      setDeletingId(null);
      setDeleteItem(null);
      return;
    }
    try {
      await deleteInventoryAsset(asset);
      setInventoryAssets((current) => current.filter((row) => row.inventoryAssetId !== asset.inventoryAssetId));
      setItems((current) => current.filter((row) => row.inventoryAssetId !== asset.inventoryAssetId));
      setSearchedItems((current) => current?.filter((row) => row.inventoryAssetId !== asset.inventoryAssetId) ?? null);
      setDeleteItem(null);
      toast.success("Equipment deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete equipment.");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddForm = () => {
    router.push(`${pathname}?view=add`);
  };

  const cancelAddForm = () => {
    router.push(pathname);
  };

  if (isInventoryLoading) {
    return <InventoryPageShimmer view={view} />;
  }

  if (view === "add") {
    return (
      <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
        <section className="mx-auto max-w-[1180px]">
          <EquipmentForm
            title={config.addTitle}
            description="Register new physical assets into the logistics ecosystem."
            form={form}
            onChange={setForm}
            onCancel={cancelAddForm}
            onSubmit={saveNewItem}
            submitText={config.submitText}
            itemLabel={config.itemLabel}
            isSaving={isSavingNew}
            compact
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] p-2">
      <InventoryOverview
        filteredItems={filteredItems}
        overview={overview}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={changeSearch}
        onStatusFilterChange={setStatusFilter}
        onAdd={openAddForm}
        onHistory={openHistory}
        onEdit={openEditModal}
        onDelete={setDeleteItem}
        description={config.description}
        addButtonLabel={config.addButtonLabel}
        itemColumnLabel={config.itemColumnLabel}
        historyLoadingId={historyLoadingId}
        deletingId={deletingId}
        isLoading={isInventoryLoading || isSearchLoading}
      />

      {stockItem ? (
        <UpdateStockModal
          item={stockItem}
          stockUpdate={{ ...stockUpdate, actionType: stockActionType }}
          onChange={changeStockUpdate}
          onClose={closeStockModal}
          onSave={saveStockUpdate}
          isLoading={isUpdatingStock}
        />
      ) : null}
      {historyOpen ? <StockHistoryModal variant={variant} history={sportsContext ? history : undefined} onClose={() => setHistoryOpen(false)} /> : null}
      <ConfirmDeleteModal
        open={Boolean(deleteItem)}
        title="Delete"
        name="equipment"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        isDeleting={Boolean(deleteItem && deletingId === deleteItem.id)}
        onCancel={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) void removeItem(deleteItem);
        }}
        customDescription={deleteItem ? (
          <>
            Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteItem.name}</span>? This action cannot be undone.
          </>
        ) : undefined}
      />
    </main>
  );
}

function InventoryPageContent() {
  const searchParams = useSearchParams();
  const { loading, userId, collegeId, wellBeingCategoryId, wellBeingCategoryIds, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const categories = [wellBeingCategoryName, ...wellBeingCategoryNames].map(
    normalizeCategoryName,
  );
  const isSports = categories.includes("sports");
  const assignedCategories = [
    { id: wellBeingCategoryId, name: wellBeingCategoryName },
    ...wellBeingCategoryNames.map((name, index) => ({ id: wellBeingCategoryIds[index], name })),
  ];
  const sportsCategoryId = assignedCategories.find(({ id, name }) => id && normalizeCategoryName(name) === "sports")?.id;
  const isInfrastructure = categories.includes("infrastructure");
  const isSafety = categories.some(
    (category) => category === "safetyandsecurity" || category === "safetysecurity",
  );
  const isAdministration = categories.some(
    (category) => category === "administration" || category === "admin",
  );

  if (loading) {
    return <InventoryPageShimmer view={searchParams.get("view") === "add" ? "add" : "list"} />;
  }

  if (!isSports && !isInfrastructure && !isSafety && !isAdministration) {
    return (
      <main className="min-h-screen p-2">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-[22px] font-extrabold text-[#16284F]">Inventory</h1>
          <p className="mt-2 text-[14px] font-semibold text-[#64748B]">
            Inventory is available only for Sports, Infrastructure, Safety &amp; Security, and Administration wellbeing executives.
          </p>
        </section>
      </main>
    );
  }

  const variant: InventoryVariant = isAdministration
    ? "administration"
    : isSafety
      ? "safety"
      : "sports";

  const sportsContext = isSports && userId && collegeId && sportsCategoryId
    ? { userId, collegeId, categoryId: sportsCategoryId }
    : undefined;

  return <InventoryWorkspace key={variant} variant={variant} sportsContext={sportsContext} />;
}

export default function WellbeingInventoryPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F4F4F4] p-2" />}>
      <InventoryPageContent />
    </Suspense>
  );
}
