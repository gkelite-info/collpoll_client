"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

type AddFeeHeaderProps = {
    button: boolean;
}

export default function AddFeeHeader({ button = true }: AddFeeHeaderProps) {
    const router = useRouter();

    const handleCreate = () => {
        router.push("?fee=create-fee");
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#43C17A]">
                    Fee Structure
                </h1>
                <h2 className="text-2xl font-semibold text-[#282828]">
                    Create Fee Structure
                </h2>
                <p className="text-sm text-[#282828]">
                    Set up the fee structure for the selected branch
                </p>
            </div>

            {button && (
                <div className="mt-15">
                    <button
                        className="flex items-center gap-2 
                 bg-[#1F2F56] 
                 px-4 py-2
                 rounded-lg 
                 transition
                 cursor-pointer
                 "
                        onClick={handleCreate}
                    >
                        <div className="p-1 flex items-center justify-center rounded-full bg-white">
                            <Plus size={14} weight="bold" className="text-[#1F2F56]" />
                        </div>
                        <span className="text-[14px] font-medium text-white">
                            Create New
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
