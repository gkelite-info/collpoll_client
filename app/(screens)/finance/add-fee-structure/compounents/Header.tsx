"use client";

import { Plus } from "@phosphor-icons/react";

export default function AddFeeHeader() {
    return (
        <div className="flex items-center justify-between mb-6">

            {/* Left Section */}
            <div className="space-y-1">
                <h1 className="text-[20px] font-semibold text-[#43C17A]">
                    Fee Structure
                </h1>

                <h2 className="text-[22px] font-semibold text-[#282828]">
                    Create Fee Structure
                </h2>

                <p className="text-[14px] text-[#282828]">
                    Set up the fee structure for the selected branch
                </p>
            </div>

            {/* Only pushing button down */}
            <div className="mt-15">
                <button
                    className="flex items-center gap-2 
                 bg-[#1F2F56] 
                 px-4 py-2 
                 rounded-lg 
                 hover:bg-[#182544] 
                 transition"
                >
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white">
                        <Plus size={14} weight="bold" className="text-[#1F2F56]" />
                    </div>

                    <span className="text-[14px] font-medium text-white">
                        Create New
                    </span>
                </button>
            </div>

        </div>

    );
}
