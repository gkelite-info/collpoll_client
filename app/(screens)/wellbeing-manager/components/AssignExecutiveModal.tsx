"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle, MagnifyingGlass, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

type AssignExecutiveModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const executives = [
  { id: 1, name: "Shreya Patel", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=47" },
  { id: 2, name: "Shreya Patel", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=13" },
  { id: 3, name: "Rahul Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=11" },
  { id: 4, name: "Priya Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=5" },
  { id: 5, name: "Ankitha Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=45" },
  { id: 6, name: "Rahul Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=11" },
  { id: 7, name: "Priya Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=5" },
  { id: 8, name: "Ankitha Sharma", staffId: "ID-28939", image: "https://i.pravatar.cc/120?img=45" },
];

const categories = ["Event", "Infrastructure", "Safety", "Sports"];

export default function AssignExecutiveModal({
  isOpen,
  onClose,
}: AssignExecutiveModalProps) {
  const [query, setQuery] = useState("");
  const [selectedExecutiveIds, setSelectedExecutiveIds] = useState<number[]>([1, 2, 3]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);

  const filteredExecutives = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return executives;
    return executives.filter((executive) =>
      executive.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const toggleExecutive = (id: number) => {
    setSelectedExecutiveIds((current) =>
      current.includes(id)
        ? current.filter((executiveId) => executiveId !== id)
        : [...current, id],
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((selectedCategory) => selectedCategory !== category)
        : [...current, category],
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 18 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-8 sm:pt-8">
              <div className="min-w-0">
                <h2 className="text-[20px] font-bold leading-tight text-[#16284F] sm:text-[22px]">
                  Add Executive
                </h2>
                <p className="mt-2 text-[13px] font-medium leading-snug text-[#555555] sm:text-[14px]">
                  Assign a new executive to handle issues
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#16284F] sm:hidden"
                aria-label="Close modal"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-5 pb-5 sm:px-8 custom-scrollbar">
              <div className="mt-3">
                <label className="text-[16px] font-bold text-[#282828]">
                  Select Executive
                </label>
                <div className="mt-3 flex h-[44px] items-center rounded-full bg-[#E8E8E8] px-4">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name"
                    className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#282828] outline-none placeholder:text-[#555555]"
                  />
                  <MagnifyingGlass size={24} className="text-[#43C17A]" />
                </div>

                <div className="mt-2 flex h-[320px] flex-col gap-1 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredExecutives.length > 0 ? (
                    filteredExecutives.map((executive) => {
                      const isSelected = selectedExecutiveIds.includes(executive.id);
                      return (
                        <button
                          key={executive.id}
                          onClick={() => toggleExecutive(executive.id)}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[6px] px-2 py-2 text-left transition-colors hover:bg-[#F7F8FA]"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="relative h-[38px] w-[38px] shrink-0 overflow-hidden rounded-full bg-gray-100">
                              <Image
                                src={executive.image}
                                alt={executive.name}
                                fill
                                sizes="38px"
                                className="object-cover"
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-bold leading-tight text-[#282828]">
                                {executive.name}
                              </span>
                              <span className="mt-1 block truncate text-[12px] font-medium leading-tight text-[#282828]">
                                {executive.staffId}
                              </span>
                            </span>
                          </span>
                          <CheckCircle
                            size={22}
                            weight="fill"
                            className={isSelected ? "text-[#43C17A]" : "text-[#D4D5D7]"}
                          />
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mb-3 text-gray-400">
                        <MagnifyingGlass size={24} weight="bold" />
                      </div>
                      <p className="text-[14px] font-bold text-[#16284F]">No executives found</p>
                      <p className="text-[12px] font-medium text-gray-500 mt-1">
                        We couldn't find anyone matching "{query}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-[16px] font-bold text-[#282828]">
                  Assign Category
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`flex h-[32px] min-w-0 cursor-pointer items-center justify-center gap-2 rounded-[4px] border px-2 text-[13px] font-bold transition-colors hover:border-[#43C17A] ${isSelected
                          ? "border-[#43C17A] bg-[#E8F8EF] text-[#16284F]"
                          : "border-[#C9C9C9] bg-white text-[#282828]"
                          }`}
                      >
                        <CheckCircle
                          size={18}
                          weight="fill"
                          className={isSelected ? "text-[#43C17A]" : "text-[#D4D5D7]"}
                        />
                        <span className="truncate">{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={onClose}
                  className="h-[42px] cursor-pointer rounded-md border border-[#D5D5D5] bg-white text-[14px] font-bold text-[#282828] transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="h-[42px] cursor-pointer rounded-md bg-[#43C17A] text-[14px] font-bold text-white transition-colors hover:bg-[#34A362]"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
