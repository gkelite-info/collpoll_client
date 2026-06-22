"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { EquipmentForm, InventoryOverview } from "./components";
import {
  defaultItems,
  emptyForm,
  getStatus,
  normalizeCategoryName,
} from "./inventory-data";
import { StockHistoryModal, UpdateStockModal } from "./modals";
import type {
  EquipmentFormState,
  EquipmentItem,
  EquipmentStatus,
  StockUpdateState,
} from "./types";

const createStockUpdate = (): StockUpdateState => ({
  actionType: "add",
  quantity: "15",
  date: new Date().toISOString().slice(0, 10),
  remarks: "",
});

function InventoryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { loading, wellBeingCategoryName, wellBeingCategoryNames } = useUser();
  const canViewInventory = [wellBeingCategoryName, ...wellBeingCategoryNames].some(
    (category) => normalizeCategoryName(category) === "sports",
  );
  const [items, setItems] = useState<EquipmentItem[]>(defaultItems);
  const view = searchParams.get("view") === "add" ? "add" : "list";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EquipmentStatus>("all");
  const [form, setForm] = useState<EquipmentFormState>(emptyForm);
  const [stockItem, setStockItem] = useState<EquipmentItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stockUpdate, setStockUpdate] = useState<StockUpdateState>(createStockUpdate);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.id.toLowerCase().includes(search.toLowerCase());
        const status = getStatus(item);
        return matchesSearch && (statusFilter === "all" || status === statusFilter);
      }),
    [items, search, statusFilter],
  );

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

  const saveNewEquipment = () => {
    const totalQty = Number(form.quantity) || 0;
    const available = Number(form.available || form.quantity) || 0;
    if (!form.name.trim() || totalQty <= 0) return;

    setItems((current) => [
      {
        id: `SP${String(current.length + 27).padStart(3, "0")}`,
        name: form.name.trim(),
        category: "Sports",
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
  };

  const openEditModal = (item: EquipmentItem) => {
    setStockItem(item);
    setStockUpdate(createStockUpdate());
  };

  const saveStockUpdate = () => {
    if (!stockItem) return;
    const quantity = Number(stockUpdate.quantity) || 0;
    if (quantity <= 0) return;

    setItems((current) =>
      current.map((item) => {
        if (item.id !== stockItem.id) return item;
        const nextAvailable =
          stockUpdate.actionType === "add"
            ? Math.min(item.available + quantity, item.totalQty)
            : Math.max(item.available - quantity, 0);
        return {
          ...item,
          available: nextAvailable,
          lastUpdated: new Date(`${stockUpdate.date}T00:00:00`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
      }),
    );
    setStockItem(null);
  };

  if (!loading && !canViewInventory) {
    return (
      <main className="min-h-screen p-2">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-[22px] font-extrabold text-[#16284F]">Inventory</h1>
          <p className="mt-2 text-[14px] font-semibold text-[#64748B]">
            Inventory is available only for Sports wellbeing executives.
          </p>
        </section>
      </main>
    );
  }

  if (view === "add") {
    return (
      <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
        <section className="mx-auto max-w-[1180px]">
          <EquipmentForm
            title="Add New Equipment"
            description="Register new physical assets into the logistics ecosystem."
            form={form}
            onChange={setForm}
            onCancel={() => router.push(pathname)}
            onSubmit={saveNewEquipment}
            submitText="Save Equipment"
            compact
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] p-2">
      <InventoryOverview
        items={items}
        filteredItems={filteredItems}
        overview={overview}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onAdd={() => router.push(`${pathname}?view=add`)}
        onHistory={() => setHistoryOpen(true)}
        onEdit={openEditModal}
        onDelete={(item) =>
          setItems((current) => current.filter((row) => row.id !== item.id))
        }
      />

      {stockItem ? (
        <UpdateStockModal
          item={stockItem}
          stockUpdate={stockUpdate}
          onChange={setStockUpdate}
          onClose={() => setStockItem(null)}
          onSave={saveStockUpdate}
        />
      ) : null}
      {historyOpen ? <StockHistoryModal onClose={() => setHistoryOpen(false)} /> : null}
    </main>
  );
}

export default function WellbeingInventoryPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F4F4F4] p-2" />}>
      <InventoryPageContent />
    </Suspense>
  );
}
