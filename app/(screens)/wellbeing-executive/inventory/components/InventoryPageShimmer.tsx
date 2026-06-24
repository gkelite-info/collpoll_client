"use client";

type InventoryPageShimmerProps = {
  view: "list" | "add";
};

const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-[#E8EDF4] ${className}`} />
);

function AddEquipmentShimmer() {
  return (
    <main className="m-2 mb-7 rounded-2xl bg-white p-8 shadow-sm md:mb-0 md:mt-4 lg:mb-5 lg:mt-0">
      <section className="mx-auto max-w-[700px] animate-pulse">
        <Block className="h-7 w-64" />
        <Block className="mt-3 h-3 w-96 max-w-full" />
        <div className="mt-6 overflow-hidden rounded border border-[#E2E8F0]">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
            <Block className="h-8 w-8" />
            <Block className="h-4 w-40" />
          </div>
          <div className="space-y-6 px-6 py-6">
            {["name", "quantity"].map((field) => (
              <div key={field}>
                <Block className="h-3 w-32" />
                <Block className="mt-2 h-9 w-full" />
              </div>
            ))}
            <div className="flex items-center gap-4 rounded border border-dashed border-[#D8E0EA] p-3">
              <Block className="h-11 w-11 shrink-0" />
              <div className="flex-1"><Block className="h-3 w-32" /><Block className="mt-2 h-3 w-64 max-w-full" /></div>
              <Block className="h-9 w-24" />
            </div>
            <div className="flex justify-end gap-4 border-t border-[#E2E8F0] pt-6">
              <Block className="h-9 w-28" />
              <Block className="h-9 w-40" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InventoryListShimmer() {
  return (
    <main className="min-h-screen bg-[#F4F4F4] p-2">
      <section className="mx-auto max-w-[1180px] rounded-xl bg-white p-5 shadow-sm md:p-8">
        <Block className="h-6 w-56" />
        <Block className="mt-3 h-3 w-80 max-w-full" />
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[0, 1, 2, 3].map((card) => <Block key={card} className="h-[116px] w-full rounded-xl" />)}
        </div>
        <div className="mt-7 overflow-hidden rounded-xl border border-[#E8EEF5]">
          <div className="flex gap-3 border-b border-[#E8EEF5] p-4">
            <Block className="h-10 flex-1" />
            <Block className="h-10 w-36" />
            <Block className="h-10 w-28" />
            <Block className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-6 gap-6 bg-[#F8FAFC] px-5 py-5">
            {[0, 1, 2, 3, 4, 5].map((column) => <Block key={column} className="h-3 w-full" />)}
          </div>
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="grid grid-cols-6 items-center gap-6 border-t border-[#EEF2F7] px-5 py-5">
              <Block className="h-9 w-full" />
              {[1, 2, 3, 4, 5].map((column) => <Block key={column} className="h-4 w-full" />)}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function InventoryPageShimmer({ view }: InventoryPageShimmerProps) {
  return view === "add" ? <AddEquipmentShimmer /> : <InventoryListShimmer />;
}
