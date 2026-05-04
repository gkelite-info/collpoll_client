"use client";

import { Plus, SortDescending } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

type Props = {
  sortBy: string;
  onSort: (val: string) => void;
  onNew: () => void;
  onFilters: () => void;
  isVisible?: boolean;
};

export default function ActionBar({ sortBy, onSort, onNew }: Props) {
  const t = useTranslations("Drive.student"); // Hook

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onNew}
        className="flex h-8 items-center gap-2 rounded-lg bg-[#43C17A] px-3 text-sm font-medium text-white cursor-pointer hover:bg-[#3aad6d] transition-colors"
      >
        <Plus size={18} weight="bold" />
        <span>{t("New")}</span>
      </button>

      <div className="flex h-8 items-center gap-2 rounded-lg bg-[#43C17A14] px-3 text-sm font-medium text-[#43C17A] cursor-pointer">
        <SortDescending size={18} weight="bold" />
        <span>{t("Sort by :")}</span>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="bg-transparent text-[#43C17A] focus:outline-none cursor-pointer"
        >
          <option value="latest">{t("Latest")}</option>
          <option value="name">{t("Name")}</option>
          <option value="size">{t("Size")}</option>
        </select>
      </div>
    </div>
  );
}
