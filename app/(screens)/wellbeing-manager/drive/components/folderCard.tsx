"use client";

import { useState } from "react";
import { DotsThreeOutlineVertical, Folder } from "@phosphor-icons/react";
import { FolderItemProps } from "../page";

type Props = FolderItemProps & {
    onRename: () => void;
    onDelete: () => void;
    onClick: () => void;
};

export function FolderCard({
    driveFolderId,
    name,
    filesCount,
    sizeLabel,
    color,
    onRename,
    onDelete,
    onClick,
}: Props) {
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div
            style={{ backgroundColor: `${color}26` }}
            className="relative flex min-w-[200px] flex-col rounded-md p-2 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center justify-center">
                    <Folder size={60} weight="fill" color={color} />
                </div>

                <div className="relative">
                    <button
                        type="button"
                        className="text-[#94A3B8] cursor-pointer hover:text-[#64748B]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu((prev) => !prev);
                        }}
                    >
                        <DotsThreeOutlineVertical size={14} weight="fill" />
                    </button>

                    {openMenu && (
                        <div
                            className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-100 bg-white text-xs shadow-lg z-20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="block w-full px-3 py-2 text-left text-black hover:bg-gray-50 cursor-pointer"
                                onClick={() => { onRename(); setOpenMenu(false); }}
                            >
                                Rename
                            </button>
                            <button
                                className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-50 cursor-pointer"
                                onClick={() => { onDelete(); setOpenMenu(false); }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto px-1">
                <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                    {filesCount} Files · {sizeLabel}
                </p>
            </div>
        </div>
    );
}
