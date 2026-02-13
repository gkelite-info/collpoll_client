"use client";

import {
    PencilSimple,
    DownloadSimple,
    CaretDown,
} from "@phosphor-icons/react";

export default function FeeStructureCard() {
    return (
        <div className="w-full border-2 border-[#2F80ED] rounded-lg bg-white overflow-hidden">

            <div className="flex items-start justify-between">

                {/* Column 1 - Institute */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">

                        <div className="w-[43px] h-[43px] rounded-full overflow-hidden bg-white flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Institute Logo"
                                className="w-[43px] h-[43px] object-contain"
                            />
                        </div>

                        <h2 className="text-[18px] font-semibold text-[#282828]">
                            ABC Institute of Technology
                        </h2>

                    </div>

                    <p className="text-[14px] text-[#4B5563]">
                        Duration: 4 Years (8 Semesters)
                    </p>
                </div>

                {/* Column 2 - Academic Year */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-[16px] font-semibold text-[#282828]">
                        Academic Year: 2025–2029
                    </h3>

                    <p className="text-[14px] text-[#4B5563]">
                        Branch : Computer Science (CSE)
                    </p>
                </div>

                {/* Column 3 - Year + Icons */}
                <div className="flex flex-col items-end gap-2">

                    <button className="flex items-center gap-1 bg-[#1F2F56] text-white text-[14px] px-3 py-1.5 rounded-md">
                        year 1
                        <CaretDown size={14} />
                    </button>

                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#43C17A] text-white">
                            <PencilSimple size={18} weight="bold" />
                        </button>

                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#43C17A] text-white">
                            <DownloadSimple size={18} weight="bold" />
                        </button>
                    </div>

                </div>

            </div>


            {/* Bottom White Section */}
            <div className="px-6 py-5">

                <h4 className="text-[16px] font-semibold text-[#1F2F56] mb-4">
                    Year 1 – (1 & 2 Semesters)
                </h4>

                {/* Fee Rows */}
                <div className="space-y-3 text-[14px] text-[#282828]">

                    {[
                        ["Tuition Fee", "₹ 85,000"],
                        ["Laboratory Fee", "₹ 5,000"],
                        ["Library Fee", "₹ 3,000"],
                        ["Examination Fee", "₹ 2,000"],
                        ["Development Fee", "₹ 5,000"],
                        ["Miscellaneous", "₹ 1,000"],
                        ["GST", "% 18"],
                    ].map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span>• {item[0]}</span>
                            <span>{item[1]}</span>
                        </div>
                    ))}

                </div>

                {/* Divider */}
                <div className="border-t my-4"></div>

                {/* Footer Details */}
                <div className="space-y-2 text-[14px]">

                    <p className="font-semibold text-[#1F2F56]">
                        Total Fee : ₹ 1,01,000
                    </p>

                    <p className="text-[#4B5563]">
                        Due Date : 15/08/2026
                    </p>

                    <p className="text-[#4B5563]">
                        Late Fee : ₹100 / Day after due date
                    </p>

                    <div className="text-right text-[#4B5563]">
                        Finance Office - ABC Institute of Technology
                    </div>

                </div>

            </div>
        </div>
    );
}
