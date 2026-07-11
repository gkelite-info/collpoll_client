"use client";

import { Plus, ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import FinanceEducationDropdown from "@/app/(screens)/finance-manager/components/FinanceEducationDropdown";

type AddFeeHeaderProps = {
    button: boolean;
    showBack?: boolean;
}

export default function AddFeeHeader({ button = true, showBack = false }: AddFeeHeaderProps) {
    const router = useRouter();

    const handleCreate = () => {
        router.push("?fee=create-fee");
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex items-center justify-between mb-6 w-full">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {showBack && (
                        <button onClick={handleBack} className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-[#282828]" />
                        </button>
                    )}
                    <h1 className="text-2xl font-semibold text-[#43C17A]">
                        Fee Structure
                    </h1>
                </div>
                <h2 className="text-2xl font-semibold text-[#282828]">
                    Create Fee Structure
                </h2>
                <p className="text-sm text-[#282828]">
                    Set up the fee structure for the selected branch
                </p>
            </div>

            <div className="flex items-center gap-4">
                <FinanceEducationDropdown />
                {button && (
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
                )}
            </div>
        </div>
    );
}
