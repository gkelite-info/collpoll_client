"use client";

import { useState } from "react";
import { DotsThreeOutlineVertical, Folder } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { FolderItemProps } from "../DriveClient";

type Props = FolderItemProps & {
  onRename: () => void;
  onDelete: () => void;
  onClick: () => void;
};

export function FolderCard({
  name,
  filesCount,
  sizeLabel,
  color,
  onRename,
  onDelete,
  onClick,
}: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const t = useTranslations("Drive.student");

  return (
    <div
      style={{ backgroundColor: `${color}26` }}
      className="relative flex min-w-[200px] flex-col rounded-md p-2 cursor-pointer max-md:min-w-0 max-md:rounded-xl max-md:h-[110px]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center">
          {/* Responsive Icon Sizes */}
          <div className="hidden md:block">
            <Folder size={60} weight="fill" color={color} />
          </div>
          <div className="block md:hidden">
            <Folder size={48} weight="fill" color={color} />
          </div>
        </div>

        <div className="relative mt-1">
          <button
            type="button"
            className="text-[#94A3B8] cursor-pointer hover:text-[#64748B] p-1"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
          >
            <DotsThreeOutlineVertical size={16} weight="fill" />
          </button>

          {openMenu && (
            <div
              className="absolute right-0 mt-1 w-32 rounded-lg border border-gray-100 bg-white text-xs shadow-lg z-20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="block w-full px-4 py-2.5 text-left font-medium text-black hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onRename();
                  setOpenMenu(false);
                }}
              >
                {t("Rename")}
              </button>
              <button
                className="block w-full px-4 py-2.5 text-left font-medium text-red-500 hover:bg-red-50 cursor-pointer"
                onClick={() => {
                  onDelete();
                  setOpenMenu(false);
                }}
              >
                {t("Delete")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto px-1 max-md:px-0">
        <p className="text-sm font-semibold text-[#0F172A] truncate max-md:text-[13px]">
          {name}
        </p>
        <p className="mt-1 text-xs text-[#94A3B8] max-md:text-[10px]">
          {t("{count} Files", { count: filesCount })} · {sizeLabel}
        </p>
      </div>
    </div>
  );
}
